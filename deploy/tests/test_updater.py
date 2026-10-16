"""Offline behavior/security tests: python3 -m unittest discover -s deploy/tests."""
import contextlib
import gzip
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import sys
import tarfile
import tempfile
import unittest
from unittest import mock
import urllib.request

SCRIPT = Path(__file__).resolve().parents[1] / "updater.py"
SPEC = importlib.util.spec_from_file_location("nexadly_updater_tested", SCRIPT)
updater = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = updater
SPEC.loader.exec_module(updater)
SHA = "a" * 40
OLD_SHA = "b" * 40
TOKEN = "github_pat_" + "notasecret" * 4


def make_tar(entries, extra=None, archive_format=tarfile.USTAR_FORMAT):
    output = io.BytesIO()
    with tarfile.open(fileobj=output, mode="w", format=archive_format) as tar:
        for name, data in entries.items():
            item = tarfile.TarInfo(name)
            item.size = len(data)
            item.mode = 0o644
            tar.addfile(item, io.BytesIO(data))
        if extra is not None:
            tar.addfile(extra, io.BytesIO(b"x" * extra.size))
    return gzip.compress(output.getvalue(), mtime=0)


def fixture(files=None, sha=SHA):
    files = files or {"index.html": b"<!doctype html><title>Nexadly</title>",
                      "services/index.html": b"<h1>Nexadly services</h1>",
                      "app.js": b"document.documentElement.classList.add('ready');"}
    manifest = {"sourceCommit": sha, "origin": updater.ORIGIN, "indexing": "public",
                "files": {key: updater.digest(value) for key, value in files.items()},
                "htmlFiles": sum(key.endswith(".html") for key in files), "contentFiles": len(files)}
    manifest_raw = json.dumps(manifest, sort_keys=True).encode()
    entries = {**files, updater.MANIFEST_NAME: manifest_raw}
    archive = make_tar(entries)
    sums = (updater.digest(archive) + "  " + updater.ARCHIVE_NAME + "\n" +
            updater.digest(manifest_raw) + "  " + updater.MANIFEST_NAME + "\n").encode()
    return manifest, manifest_raw, entries, archive, sums


class FakeClient:
    def __init__(self, sha=SHA, main_sequence=None, tag_sequence=None):
        self.manifest, self.manifest_raw, self.entries, archive, sums = fixture(sha=sha)
        self.main_sequence = list(main_sequence or [sha])
        self.tag_sequence = list(tag_sequence or [sha])
        self.tag_type = "commit"
        self.calls = []
        self.payloads = {updater.ARCHIVE_NAME: archive, updater.MANIFEST_NAME: self.manifest_raw,
                         updater.SUMS_NAME: sums}
        self.release = {"tag_name": "nexadly-" + sha, "draft": False, "prerelease": False,
                        "assets": [{"name": name, "id": index, "state": "uploaded", "size": len(data),
                                    "url": updater.API_ROOT + "/releases/assets/" + str(index)}
                                   for index, (name, data) in enumerate(self.payloads.items(), 1)]}

    def get(self, url, limit, **kwargs):
        self.calls.append(url)
        if "/releases/tags/" in url:
            return json.dumps(self.release).encode()
        if url.endswith("/git/ref/heads/main"):
            sha = self.main_sequence.pop(0) if len(self.main_sequence) > 1 else self.main_sequence[0]
            return json.dumps({"ref": "refs/heads/main", "object": {"type": "commit", "sha": sha}}).encode()
        if "/git/ref/tags/" in url:
            sha = self.tag_sequence.pop(0) if len(self.tag_sequence) > 1 else self.tag_sequence[0]
            return json.dumps({"ref": "refs/tags/" + url.rsplit("/", 1)[-1],
                               "object": {"type": self.tag_type, "sha": sha}}).encode()
        for asset in self.release["assets"]:
            if asset["url"] == url:
                return self.payloads[asset["name"]]
        raise AssertionError("Unexpected mocked request")


def public_transport(fake):
    """Exercise real unauthenticated request construction against offline fixtures."""
    class Response(io.BytesIO):
        status = 200

        def __init__(self, payload, url):
            super().__init__(payload)
            self.headers = {"Content-Length": str(len(payload))}
            self.url = url

        def geturl(self):
            return self.url

    client = updater.GitHubClient()
    requests = []

    def open_response(request, timeout):
        requests.append(request)
        payload = fake.get(request.full_url, 1024 * 1024)
        return Response(payload, request.full_url)

    client._opener = mock.Mock()
    client._opener.open.side_effect = open_response
    return client, requests


class ValidationTests(unittest.TestCase):
    def setUp(self):
        self.manifest, self.raw, self.entries, self.archive, self.sums = fixture()

    def test_valid_release_matches_every_file(self):
        updater.verify_sums(self.sums, self.archive, self.raw)
        manifest = updater.validate_manifest(self.raw, SHA)
        self.assertEqual(updater.verify_archive(self.archive, self.raw, manifest), self.entries)

    def test_archive_hash_tampering_rejected(self):
        with self.assertRaises(updater.UpdateError):
            updater.verify_sums(self.sums, self.archive + b"tampered", self.raw)

    def test_manifest_hash_tampering_rejected(self):
        with self.assertRaises(updater.UpdateError):
            updater.verify_sums(self.sums, self.archive, self.raw + b" ")

    def test_checksum_list_is_exact(self):
        for data in [self.sums + b"extra\n", self.sums.splitlines()[0] + b"\n",
                     self.sums.splitlines()[0] + b"\n" + self.sums.splitlines()[0] + b"\n"]:
            with self.subTest(data=data), self.assertRaises(updater.UpdateError):
                updater.verify_sums(data, self.archive, self.raw)

    def test_manifest_commit_origin_count_and_schema_rejected(self):
        for key, value in [("sourceCommit", OLD_SHA), ("origin", "https://evil.example"),
                           ("indexing", "private"), ("htmlFiles", 0), ("contentFiles", True),
                           ("unexpected", "value")]:
            candidate = dict(self.manifest)
            candidate[key] = value
            with self.subTest(key=key), self.assertRaises(updater.UpdateError):
                updater.validate_manifest(json.dumps(candidate).encode(), SHA)

    def test_duplicate_json_keys_rejected(self):
        with self.assertRaises(updater.UpdateError):
            updater.parse_json(b'{"files":{},"files":{}}')

    def test_static_path_traversal_hidden_source_and_prompt_files_rejected(self):
        for name in ["../outside.html", "/absolute.html", "foo//index.html", "a/./index.html",
                     "a/../../index.html", "a\\index.html", ".env", ".github/config.js",
                     "src/index.js", "deploy/updater.py", "legal-drafts/privacy.html",
                     "assets/hero-prompt.txt", "app.js.map", "credentials.js", "robots2.txt",
                     "C:/index.html", "a/secret.css", "a\n.html"]:
            with self.subTest(name=name), self.assertRaises(updater.UpdateError):
                updater.static_name(name)

    def test_tar_traversal_rejected(self):
        tar = make_tar({**self.entries, "../outside.html": b"attack"})
        with self.assertRaises(updater.UpdateError):
            updater.verify_archive(tar, self.raw, self.manifest)

    def test_symlink_hardlink_directory_device_fifo_headers_rejected(self):
        for kind in [tarfile.SYMTYPE, tarfile.LNKTYPE, tarfile.DIRTYPE, tarfile.CHRTYPE, tarfile.FIFOTYPE]:
            member = tarfile.TarInfo("assets/unsafe.png")
            member.type = kind
            member.linkname = "../../outside" if kind in {tarfile.SYMTYPE, tarfile.LNKTYPE} else ""
            with self.subTest(kind=kind), self.assertRaises(updater.UpdateError):
                updater.verify_archive(make_tar(self.entries, extra=member), self.raw, self.manifest)

    def test_pax_extension_header_rejected_even_for_regular_file(self):
        member = tarfile.TarInfo("assets/test.png")
        member.pax_headers = {"comment": "extension header"}
        with self.assertRaises(updater.UpdateError):
            updater.verify_archive(make_tar(self.entries, extra=member, archive_format=tarfile.PAX_FORMAT),
                                   self.raw, self.manifest)

    def test_duplicate_tar_member_rejected(self):
        member = tarfile.TarInfo("index.html")
        with self.assertRaises(updater.UpdateError):
            updater.verify_archive(make_tar(self.entries, extra=member), self.raw, self.manifest)

    def test_missing_extra_modified_files_and_embedded_manifest_rejected(self):
        candidates = [dict(self.entries), {**self.entries, "extra.html": b"extra"},
                      {**self.entries, "index.html": b"Nexadly changed"},
                      {**self.entries, updater.MANIFEST_NAME: self.raw + b" "}]
        candidates[0].pop("app.js")
        for entries in candidates:
            with self.subTest(entries=list(entries)), self.assertRaises(updater.UpdateError):
                updater.verify_archive(make_tar(entries), self.raw, self.manifest)

    def test_legal_draft_and_credential_content_rejected_despite_matching_hashes(self):
        for content in [b'<h1>Nexadly</h1><article data-legal-review="true">Draft</article>',
                        ("Nexadly " + TOKEN).encode(), b"Nexadly -----BEGIN PRIVATE KEY-----"]:
            manifest, raw, _, archive, _ = fixture({"index.html": content})
            with self.subTest(content=content[:20]), self.assertRaises(updater.UpdateError):
                updater.verify_archive(archive, raw, manifest)

    def test_expansion_limit_and_file_count_limit(self):
        with mock.patch.object(updater, "MAX_TAR_BYTES", 1024), self.assertRaises(updater.UpdateError):
            updater.verify_archive(self.archive, self.raw, self.manifest)
        with mock.patch.object(updater, "MAX_FILES", 1), self.assertRaises(updater.UpdateError):
            updater.verify_archive(self.archive, self.raw, self.manifest)


class NetworkTests(unittest.TestCase):
    def test_public_requests_omit_authorization_on_every_api_and_asset_request(self):
        client, requests = public_transport(FakeClient())
        sha, entries = updater.fetch_release(client)
        self.assertEqual(sha, SHA)
        self.assertIn("index.html", entries)
        self.assertGreaterEqual(len(requests), 6)
        for request in requests:
            headers = {key.lower(): value for key, value in request.header_items()}
            self.assertNotIn("authorization", headers)
            self.assertNotIn("Bearer", str(headers))

    def test_redirect_strips_auth_and_cookies_for_same_and_cross_host(self):
        for url in [updater.API_ROOT + "/releases/assets/1",
                    "https://release-assets.githubusercontent.com/signed-asset?signature=test"]:
            request = urllib.request.Request(updater.API_ROOT + "/releases/assets/2",
                                             headers={"Authorization": "Bearer " + TOKEN, "Cookie": "secret=x"})
            request.add_unredirected_header("Authorization", "Bearer " + TOKEN)
            redirected = updater.SafeRedirectHandler().redirect_request(request, None, 302, "Found", {}, url)
            headers = {key.lower(): value for key, value in redirected.header_items()}
            self.assertNotIn("authorization", headers)
            self.assertNotIn("cookie", headers)
            self.assertNotIn(TOKEN, str(headers))

    def test_redirect_rejects_downgrade_credentials_ports_unapproved_hosts_and_api_paths(self):
        for url in ["http://release-assets.githubusercontent.com/file", "https://evil.example/file",
                    "https://api.github.com.evil.example/file", "https://user:pass@api.github.com/file",
                    "https://release-assets.githubusercontent.com:8443/file", "file:///etc/passwd",
                    "https://api.github.com/user", "https://api.github.com/repos/other/repo/releases/latest"]:
            request = urllib.request.Request(updater.API_ROOT + "/releases/assets/1")
            with self.subTest(url=url), self.assertRaises(updater.UpdateError):
                updater.SafeRedirectHandler().redirect_request(request, None, 302, "Found", {}, url)

    def test_bounded_download_and_authorization_attached_only_as_unredirected_header(self):
        class Response(io.BytesIO):
            status = 200
            headers = {}

            def geturl(self):
                return updater.API_ROOT + "/releases/assets/1"

        client = updater.GitHubClient(TOKEN)
        client._opener = mock.Mock()
        client._opener.open.return_value = Response(b"x" * 11)
        with self.assertRaises(updater.UpdateError):
            client.get(updater.API_ROOT + "/releases/assets/1", 10, binary=True)
        request = client._opener.open.call_args.args[0]
        self.assertNotIn("Authorization", request.headers)
        self.assertEqual(request.unredirected_hdrs["Authorization"], "Bearer " + TOKEN)

    def test_stale_release_skips_before_asset_downloads(self):
        client = FakeClient(main_sequence=[OLD_SHA])
        with self.assertRaises(updater.SkipRelease):
            updater.fetch_release(client)
        self.assertFalse(any("/releases/assets/" in url for url in client.calls))

    def test_incomplete_draft_prerelease_and_bad_tag_are_not_deployed(self):
        for field, value in [("draft", True), ("prerelease", True), ("assets", []),
                             ("tag_name", "nexadly-short")]:
            client = FakeClient()
            client.release[field] = value
            with self.subTest(field=field), self.assertRaises(updater.SkipRelease):
                updater.fetch_release(client)

    def test_unapproved_asset_url_and_hash_rejected(self):
        client = FakeClient()
        client.release["assets"][0]["url"] = "https://evil.example/download"
        with self.assertRaises(updater.UpdateError):
            updater.fetch_release(client)
        client = FakeClient()
        data = client.payloads[updater.ARCHIVE_NAME]
        client.payloads[updater.ARCHIVE_NAME] = bytes([data[0] ^ 1]) + data[1:]
        with self.assertRaises(updater.UpdateError):
            updater.fetch_release(client)

    def test_tag_target_mismatch_and_annotated_tag_rejected_before_assets(self):
        for client in [FakeClient(tag_sequence=[OLD_SHA]), FakeClient()]:
            if client.tag_sequence == [SHA]:
                client.tag_type = "tag"
            with self.assertRaises(updater.SkipRelease):
                updater.fetch_release(client)
            self.assertFalse(any("/releases/assets/" in url for url in client.calls))


class InstallationTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.root = Path(self.temporary.name).resolve()
        self.www, self.state = self.root / "www", self.root / "state"
        self.www.mkdir()
        self.state.mkdir()
        self.layout = updater.Layout(self.www, self.state)
        _, _, self.entries, _, _ = fixture()
        (self.www / "releases").mkdir()
        self.old = self.www / "releases" / OLD_SHA
        self.old.mkdir()
        (self.old / "index.html").write_text("Old Nexadly website")
        (self.www / "current").symlink_to("releases/" + OLD_SHA)

    def tearDown(self):
        self.temporary.cleanup()

    def test_atomic_switch_retains_every_previous_release_and_never_deletes(self):
        real_replace = os.replace
        old_content = (self.old / "index.html").read_bytes()

        def inspect_replace(source, destination):
            self.assertEqual(os.readlink(destination), "releases/" + OLD_SHA)
            self.assertTrue(updater.existing_release_matches(self.www / "releases" / SHA, self.entries))
            real_replace(source, destination)
            self.assertEqual(os.readlink(destination), "releases/" + SHA)

        with mock.patch.object(updater.os, "replace", side_effect=inspect_replace) as replacement, \
                mock.patch.object(updater.os, "unlink", side_effect=AssertionError("No deletions allowed")):
            updater.install_release(self.layout, SHA, self.entries)
        self.assertEqual(replacement.call_count, 1)
        self.assertEqual((self.old / "index.html").read_bytes(), old_content)
        self.assertTrue((self.www / "current" / "index.html").is_file())

    def test_valid_existing_release_reused_without_rewriting(self):
        updater.install_release(self.layout, SHA, self.entries)
        inode = (self.www / "releases" / SHA / "index.html").stat().st_ino
        with mock.patch.object(updater.os, "replace", side_effect=AssertionError("Already active")):
            self.assertIn("already matches", updater.install_release(self.layout, SHA, self.entries))
        self.assertEqual((self.www / "releases" / SHA / "index.html").stat().st_ino, inode)

    def test_changed_extra_and_incomplete_existing_releases_are_retained(self):
        target = self.www / "releases" / SHA
        target.mkdir()
        (target / "index.html").write_bytes(b"incomplete")
        with self.assertRaises(updater.SkipRelease):
            updater.install_release(self.layout, SHA, self.entries)
        self.assertEqual((target / "index.html").read_bytes(), b"incomplete")
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + OLD_SHA)

    def test_existing_release_symlink_and_extra_directory_not_reused(self):
        updater.install_release(self.layout, SHA, self.entries)
        target = self.www / "releases" / SHA
        (target / "extra").mkdir()
        self.assertFalse(updater.existing_release_matches(target, self.entries))
        (target / "extra" / "outside").symlink_to(self.old, target_is_directory=True)
        self.assertFalse(updater.existing_release_matches(target, self.entries))

    def test_interrupted_write_retained_and_current_unchanged(self):
        real_open = os.open
        created = []

        def interrupt(path, flags, *args, **kwargs):
            if flags & os.O_EXCL:
                created.append(Path(path))
                if len(created) == 2:
                    raise OSError("simulated full disk")
            return real_open(path, flags, *args, **kwargs)

        with mock.patch.object(updater.os, "open", side_effect=interrupt), self.assertRaises(OSError):
            updater.install_release(self.layout, SHA, self.entries)
        self.assertTrue((self.www / "releases" / SHA).is_dir())
        self.assertTrue(created[0].is_file())
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + OLD_SHA)
        with self.assertRaises(updater.SkipRelease):
            updater.install_release(self.layout, SHA, self.entries)

    def test_main_changes_during_download_no_activation(self):
        client = FakeClient(main_sequence=[SHA, OLD_SHA])
        with self.assertRaises(updater.SkipRelease):
            updater.update(client, self.layout)
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + OLD_SHA)
        self.assertTrue(updater.existing_release_matches(self.www / "releases" / SHA, self.entries))

    def test_tag_changes_during_download_no_activation(self):
        client = FakeClient(tag_sequence=[SHA, OLD_SHA])
        with self.assertRaises(updater.SkipRelease):
            updater.update(client, self.layout)
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + OLD_SHA)
        self.assertTrue(updater.existing_release_matches(self.www / "releases" / SHA, self.entries))

    def test_dry_run_makes_no_files_or_symlink_changes(self):
        before = sorted(str(path.relative_to(self.root)) for path in self.root.rglob("*"))
        self.assertIn("dry run", updater.update(FakeClient(), self.layout, dry_run=True))
        after = sorted(str(path.relative_to(self.root)) for path in self.root.rglob("*"))
        self.assertEqual(before, after)
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + OLD_SHA)

    def test_symlink_release_path_and_unsafe_current_are_rejected(self):
        (self.www / "releases" / SHA).symlink_to(self.old, target_is_directory=True)
        with self.assertRaises(updater.UpdateError):
            updater.install_release(self.layout, SHA, self.entries)
        other_www = self.root / "unsafe-www"
        other_www.mkdir()
        (other_www / "current").symlink_to("../../outside")
        with self.assertRaises(updater.UpdateError):
            updater.install_release(updater.Layout(other_www, self.state), SHA, self.entries)

    def test_lock_prevents_concurrent_updaters(self):
        with updater.update_lock(self.layout):
            with self.assertRaises(updater.SkipRelease):
                with updater.update_lock(self.layout):
                    self.fail("Second lock should fail")

    def test_successful_full_offline_update(self):
        message = updater.update(FakeClient(), self.layout)
        self.assertIn("activated", message)
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + SHA)

    def test_public_mode_keeps_full_verification_and_atomic_activation(self):
        client, requests = public_transport(FakeClient())
        self.assertIn("activated", updater.update(client, self.layout))
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + SHA)
        self.assertEqual(len(requests), 8)
        self.assertTrue(updater.existing_release_matches(self.www / "releases" / SHA, self.entries))

    def test_public_mode_rejects_invalid_hash_and_leaves_current_unchanged(self):
        fake = FakeClient()
        archive = fake.payloads[updater.ARCHIVE_NAME]
        fake.payloads[updater.ARCHIVE_NAME] = bytes([archive[0] ^ 1]) + archive[1:]
        client, _ = public_transport(fake)
        with self.assertRaises(updater.UpdateError):
            updater.update(client, self.layout)
        self.assertEqual(os.readlink(self.www / "current"), "releases/" + OLD_SHA)
        self.assertFalse((self.www / "releases" / SHA).exists())


class CliTests(unittest.TestCase):
    def test_public_check_does_not_read_credentials(self):
        with mock.patch.object(updater.os, "getuid", return_value=1234), \
                mock.patch.object(updater.os, "geteuid", return_value=1234), \
                mock.patch.object(updater, "read_token", side_effect=AssertionError("Public mode must not read token")), \
                mock.patch.object(updater, "update", return_value="Verified without changes") as run, \
                contextlib.redirect_stdout(io.StringIO()):
            self.assertEqual(updater.main(["--public", "--check"]), 0)
        self.assertIsNone(run.call_args.args[0]._token)
        self.assertTrue(run.call_args.kwargs["dry_run"])

    def test_default_private_mode_still_requires_systemd_credential(self):
        with mock.patch.object(updater.os, "getuid", return_value=1234), \
                mock.patch.object(updater.os, "geteuid", return_value=1234), \
                mock.patch.dict(os.environ, {}, clear=True), \
                mock.patch.object(updater, "update", side_effect=AssertionError("No credential means no update")), \
                contextlib.redirect_stderr(io.StringIO()) as output:
            self.assertEqual(updater.main(["--check"]), 1)
        self.assertIn("credential is unavailable", output.getvalue())

    def test_root_refused_before_credential_or_network_access(self):
        with mock.patch.object(updater.os, "getuid", return_value=0), \
                mock.patch.object(updater, "read_token", side_effect=AssertionError("Must not read credentials")), \
                contextlib.redirect_stderr(io.StringIO()) as output:
            self.assertEqual(updater.main([]), 1)
        self.assertIn("Refusing to run as root", output.getvalue())

    def test_fine_grained_token_read_only_from_credential_file(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary) / "github-token"
            path.write_text(TOKEN + "\n")
            with mock.patch.dict(os.environ, {"CREDENTIALS_DIRECTORY": temporary}, clear=True):
                self.assertEqual(updater.read_token(), TOKEN)
                path.write_text("ghp_" + "a" * 40)
                with self.assertRaises(updater.UpdateError):
                    updater.read_token()

    def test_unexpected_errors_do_not_print_sensitive_values(self):
        with mock.patch.object(updater.os, "getuid", return_value=1234), \
                mock.patch.object(updater.os, "geteuid", return_value=1234), \
                mock.patch.object(updater, "read_token", side_effect=OSError(TOKEN)), \
                contextlib.redirect_stderr(io.StringIO()) as output:
            self.assertEqual(updater.main([]), 1)
        self.assertNotIn(TOKEN, output.getvalue())

    def test_units_have_fixed_privilege_boundary_and_persistent_timer(self):
        service = (SCRIPT.parent / "systemd/nexadly-updater.service").read_text()
        timer = (SCRIPT.parent / "systemd/nexadly-updater.timer").read_text()
        for required in ["User=nexadly-updater", "Group=nexadly-updater", "ProtectSystem=strict",
                         "LoadCredential=github-token:/etc/nexadly/github-token", "NoNewPrivileges=true",
                         "ExecStart=/usr/bin/python3 -I -B /opt/nexadly/bin/updater.py",
                         "ReadWritePaths=/opt/nexadly/www /var/lib/nexadly-updater"]:
            self.assertIn(required, service)
        self.assertIn("Persistent=true", timer)
        self.assertIn("RandomizedDelaySec=15s", timer)
        self.assertIn("OnCalendar=*-*-* *:0/2:00", timer)


if __name__ == "__main__":
    unittest.main()
