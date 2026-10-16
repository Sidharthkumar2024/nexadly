#!/usr/bin/env python3
"""Fixed, unprivileged Nexadly release consumer. Python 3.9+, standard library only.

Install this reviewed file root-owned outside the website tree. This program never
downloads executable deployment code, invokes a shell, or removes old releases.
"""
import argparse
import contextlib
import dataclasses
import fcntl
import gzip
import hashlib
import io
import json
import os
from pathlib import Path, PurePosixPath
import re
import stat
import sys
import tarfile
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid

REPOSITORY = "Sidharthkumar2024/nexadly"
API_ROOT = "https://api.github.com/repos/" + REPOSITORY
ORIGIN = "https://nexadly.com"
ARCHIVE_NAME = "nexadly-static.tar.gz"
MANIFEST_NAME = "deployment-manifest.json"
SUMS_NAME = "SHA256SUMS"
ASSET_LIMITS = {ARCHIVE_NAME: 64 * 1024 * 1024,
                MANIFEST_NAME: 2 * 1024 * 1024, SUMS_NAME: 1024}
MAX_FILES = 2048
MAX_FILE_BYTES = 32 * 1024 * 1024
MAX_EXPANDED_BYTES = 128 * 1024 * 1024
MAX_TAR_BYTES = MAX_EXPANDED_BYTES + MAX_FILES * 1024 + 10240
REQUEST_TIMEOUT = 15
DOWNLOAD_DEADLINE = 60
SHA_RE = re.compile(r"[0-9a-f]{40}\Z")
HASH_RE = re.compile(r"[0-9a-f]{64}\Z")
ALLOWED_EXTENSIONS = {".html", ".css", ".js", ".svg", ".png", ".jpg",
                      ".jpeg", ".webp", ".avif", ".ico", ".woff", ".woff2"}
TEXT_EXTENSIONS = {".html", ".css", ".js", ".svg", ".xml", ".txt"}
FORBIDDEN_PARTS = {"src", "deploy", "legal-drafts", "review-dist", "node_modules",
                   "credentials", "secrets", "__macosx", "__pycache__"}
SECRET_PATTERN = re.compile(
    rb"(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|"
    rb"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)")


class UpdateError(Exception):
    """A deliberately credential/URL-free message safe for the journal."""


class SkipRelease(Exception):
    """The release is not eligible; leave the current website untouched."""


def digest(data):
    return hashlib.sha256(data).hexdigest()


def require(condition, message):
    if not condition:
        raise UpdateError(message)


def validate_url(url):
    """Validate each request and redirect, never following arbitrary asset URLs."""
    try:
        parsed = urllib.parse.urlsplit(url)
        port = parsed.port
    except (TypeError, ValueError):
        raise UpdateError("Invalid download URL.") from None
    require(parsed.scheme == "https" and not parsed.username and not parsed.password
            and port in (None, 443) and not parsed.fragment,
            "Only approved HTTPS downloads are allowed.")
    host = parsed.hostname
    if host == "api.github.com":
        prefix = "/repos/" + REPOSITORY
        allowed = parsed.path == prefix + "/git/ref/heads/main"
        allowed = allowed or bool(re.fullmatch(re.escape(prefix) + r"/git/ref/tags/nexadly-[0-9a-f]{40}", parsed.path))
        allowed = allowed or bool(re.fullmatch(re.escape(prefix) + r"/releases/tags/nexadly-[0-9a-f]{40}", parsed.path))
        allowed = allowed or bool(re.fullmatch(re.escape(prefix) + r"/releases/assets/[1-9][0-9]*", parsed.path))
        require(allowed and not parsed.query, "Unapproved GitHub API endpoint.")
    else:
        require(host in {"release-assets.githubusercontent.com", "objects.githubusercontent.com"},
                "Unapproved asset download host.")
        require(parsed.path.startswith("/") and not parsed.path.startswith("//"),
                "Invalid asset download path.")
    return url


class SafeRedirectHandler(urllib.request.HTTPRedirectHandler):
    max_repeats = 2
    max_redirections = 4

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        validate_url(newurl)
        redirected = super().redirect_request(req, fp, code, msg, headers, newurl)
        if redirected is not None:
            # Strip even on same-host redirects; credentials are attached only to
            # the explicitly constructed initial GitHub API request.
            for key in list(redirected.headers):
                if key.lower() in {"authorization", "cookie", "proxy-authorization"}:
                    del redirected.headers[key]
            for key in list(redirected.unredirected_hdrs):
                if key.lower() in {"authorization", "cookie", "proxy-authorization"}:
                    del redirected.unredirected_hdrs[key]
        return redirected


class GitHubClient:
    def __init__(self, token=None):
        require(token is None or (isinstance(token, str) and bool(token)),
                "Invalid GitHub authentication configuration.")
        self._token = token
        # Ignore inherited proxy settings. Normal TLS verification remains enabled.
        self._opener = urllib.request.build_opener(urllib.request.ProxyHandler({}), SafeRedirectHandler())

    def get(self, url, limit, binary=False, not_found_ok=False):
        validate_url(url)
        require(urllib.parse.urlsplit(url).hostname == "api.github.com",
                "Asset downloads must begin at the GitHub API.")
        headers = {"Accept": "application/octet-stream" if binary else "application/vnd.github+json",
                   "X-GitHub-Api-Version": "2022-11-28", "User-Agent": "nexadly-static-updater"}
        request = urllib.request.Request(url, headers=headers, method="GET")
        if self._token is not None:
            request.add_unredirected_header("Authorization", "Bearer " + self._token)
        started = time.monotonic()
        try:
            with self._opener.open(request, timeout=REQUEST_TIMEOUT) as response:
                validate_url(response.geturl())
                require(response.status == 200, "Unexpected GitHub response status.")
                declared = response.headers.get("Content-Length")
                if declared is not None:
                    require(declared.isdecimal() and int(declared) <= limit,
                            "Download exceeds the permitted size.")
                chunks, received = [], 0
                while True:
                    require(time.monotonic() - started <= DOWNLOAD_DEADLINE,
                            "Download exceeded its time limit.")
                    chunk = response.read(min(65536, limit + 1 - received))
                    if not chunk:
                        break
                    received += len(chunk)
                    require(received <= limit, "Download exceeds the permitted size.")
                    chunks.append(chunk)
                if declared is not None:
                    require(received == int(declared), "Incomplete download.")
                return b"".join(chunks)
        except urllib.error.HTTPError as exc:
            if exc.code == 404 and not_found_ok:
                raise SkipRelease("No published release is available.") from None
            raise UpdateError("GitHub request failed (HTTP %d)." % exc.code) from None
        except (urllib.error.URLError, TimeoutError, OSError):
            raise UpdateError("GitHub request failed; check connectivity and credential access.") from None


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "Duplicate JSON property.")
        result[key] = value
    return result


def parse_json(raw):
    try:
        return json.loads(raw.decode("utf-8"), object_pairs_hook=unique_object,
                          parse_constant=lambda _: (_ for _ in ()).throw(UpdateError("Invalid JSON number.")))
    except (ValueError, UnicodeError):
        raise UpdateError("Invalid JSON document.") from None


def static_name(name):
    require(isinstance(name, str) and 0 < len(name) <= 240 and name.isascii(),
            "Invalid static filename.")
    path = PurePosixPath(name)
    require(not name.startswith("/") and "\\" not in name and "\x00" not in name
            and str(path) == name and all(part not in {".", ".."} for part in path.parts),
            "Unsafe archive path.")
    require(all(re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.-]*", part) for part in path.parts),
            "Unsafe filename characters.")
    require(not any(part.lower() in FORBIDDEN_PARTS or "prompt" in part.lower()
                    or "credential" in part.lower() or "secret" in part.lower()
                    or part.lower().startswith(".env") for part in path.parts),
            "Source or private files are forbidden.")
    require(path.suffix.lower() in ALLOWED_EXTENSIONS or name in {"robots.txt", "sitemap.xml"},
            "File type is not permitted in the static release.")
    return name


def validate_manifest(raw, sha):
    manifest = parse_json(raw)
    require(isinstance(manifest, dict) and set(manifest) == {
        "sourceCommit", "origin", "indexing", "files", "htmlFiles", "contentFiles"},
        "Unexpected deployment manifest schema.")
    require(manifest["sourceCommit"] == sha and manifest["origin"] == ORIGIN
            and manifest["indexing"] == "public", "Manifest does not match the approved release.")
    files = manifest["files"]
    require(isinstance(files, dict) and 0 < len(files) <= MAX_FILES and "index.html" in files,
            "Invalid manifest file list.")
    for name, checksum in files.items():
        static_name(name)
        require(isinstance(checksum, str) and HASH_RE.fullmatch(checksum), "Invalid manifest file checksum.")
    require(type(manifest["contentFiles"]) is int and manifest["contentFiles"] == len(files),
            "Manifest content count does not match.")
    require(type(manifest["htmlFiles"]) is int and manifest["htmlFiles"] ==
            sum(name.endswith(".html") for name in files), "Manifest HTML count does not match.")
    return manifest


def verify_sums(raw, archive, manifest):
    try:
        lines = raw.decode("ascii").splitlines()
    except UnicodeError:
        raise UpdateError("Invalid checksum document.") from None
    require(len(lines) == 2, "Checksum document must contain exactly two entries.")
    expected = {ARCHIVE_NAME: digest(archive), MANIFEST_NAME: digest(manifest)}
    observed = {}
    for line in lines:
        match = re.fullmatch(r"([0-9a-f]{64})  (nexadly-static\.tar\.gz|deployment-manifest\.json)", line)
        require(match is not None, "Invalid checksum entry.")
        checksum, name = match.groups()
        require(name not in observed, "Duplicate checksum entry.")
        observed[name] = checksum
    require(observed == expected, "Release asset checksum mismatch.")


def validate_content(name, data):
    require(not SECRET_PATTERN.search(data), "Credential material is forbidden in release files.")
    if PurePosixPath(name).suffix.lower() in TEXT_EXTENSIONS:
        try:
            data.decode("utf-8")
        except UnicodeError:
            raise UpdateError("Static text must be valid UTF-8.") from None
        require(b"data-legal-review" not in data.lower(), "Legal review drafts cannot be deployed.")


def verify_archive(archive, manifest_raw, manifest):
    """Inspect physical tar headers, so hidden PAX/GNU extension records also fail."""
    try:
        with gzip.GzipFile(fileobj=io.BytesIO(archive), mode="rb") as stream:
            raw = stream.read(MAX_TAR_BYTES + 1)
    except (OSError, EOFError):
        raise UpdateError("Invalid compressed archive.") from None
    require(len(raw) <= MAX_TAR_BYTES and len(raw) % 512 == 0, "Invalid or oversized archive.")
    entries, cursor, total = {}, 0, 0
    while cursor + 512 <= len(raw):
        header = raw[cursor:cursor + 512]
        if header == b"\0" * 512:
            require(len(raw) - cursor >= 1024 and not any(raw[cursor:]), "Invalid archive end marker.")
            break
        require(header[156:157] in {b"0", b"\0"} and header[257:265] == b"ustar\x0000",
                "Only ordinary USTAR files are allowed; links and extension headers are forbidden.")
        try:
            member = tarfile.TarInfo.frombuf(header, "utf-8", "strict")
        except (tarfile.TarError, ValueError, UnicodeError):
            raise UpdateError("Invalid tar header.") from None
        name = member.name
        if name != MANIFEST_NAME:
            static_name(name)
        require(not member.linkname and name not in entries, "Duplicate or linked archive member.")
        require(type(member.size) is int and 0 <= member.size <= MAX_FILE_BYTES,
                "Archive member exceeds its size limit.")
        require(len(entries) < MAX_FILES + 1, "Archive contains too many files.")
        total += member.size
        require(total <= MAX_EXPANDED_BYTES, "Expanded archive exceeds its size limit.")
        start, end = cursor + 512, cursor + 512 + member.size
        require(end <= len(raw), "Truncated archive member.")
        entries[name] = raw[start:end]
        cursor = start + ((member.size + 511) // 512) * 512
    else:
        raise UpdateError("Archive is missing its end marker.")
    require(set(entries) == set(manifest["files"]) | {MANIFEST_NAME}, "Archive and manifest file lists differ.")
    require(entries[MANIFEST_NAME] == manifest_raw, "Embedded manifest does not match release manifest.")
    for name, checksum in manifest["files"].items():
        require(digest(entries[name]) == checksum, "Static file checksum mismatch.")
        validate_content(name, entries[name])
    require(b"nexadly" in entries["index.html"].lower(), "Release is missing the Nexadly homepage.")
    return entries


def current_main(client):
    obj = parse_json(client.get(API_ROOT + "/git/ref/heads/main", 65536))
    require(isinstance(obj, dict) and obj.get("ref") == "refs/heads/main", "Invalid main branch reference.")
    commit = obj.get("object")
    require(isinstance(commit, dict) and commit.get("type") == "commit"
            and isinstance(commit.get("sha"), str) and SHA_RE.fullmatch(commit["sha"]),
            "Invalid main branch commit.")
    return commit["sha"]


def verify_tag_commit(client, sha):
    tag = "nexadly-" + sha
    obj = parse_json(client.get(API_ROOT + "/git/ref/tags/" + tag, 65536))
    require(isinstance(obj, dict) and obj.get("ref") == "refs/tags/" + tag,
            "Invalid deployment tag reference.")
    commit = obj.get("object")
    require(isinstance(commit, dict), "Invalid deployment tag object.")
    if commit.get("type") != "commit" or commit.get("sha") != sha:
        raise SkipRelease("Release tag does not point directly to the approved main commit.")


def fetch_release(client):
    expected_sha = current_main(client)
    # A late-finishing old workflow can become GitHub's "latest" release. Resolve
    # the exact tag for current main instead of trusting release creation order.
    release = parse_json(client.get(API_ROOT + "/releases/tags/nexadly-" + expected_sha,
                                    2 * 1024 * 1024, not_found_ok=True))
    require(isinstance(release, dict), "Invalid release metadata.")
    if release.get("draft") is not False or release.get("prerelease") is not False:
        raise SkipRelease("Release is unpublished or marked as a prerelease.")
    tag = release.get("tag_name")
    if not isinstance(tag, str) or not re.fullmatch(r"nexadly-[0-9a-f]{40}", tag):
        raise SkipRelease("Release does not use the deployment tag format.")
    sha = tag[len("nexadly-"):]
    if expected_sha != sha:
        raise SkipRelease("Release is not the current main commit.")
    verify_tag_commit(client, sha)
    assets = release.get("assets")
    if not isinstance(assets, list) or len(assets) != len(ASSET_LIMITS):
        raise SkipRelease("Release asset set is incomplete.")
    by_name = {}
    for asset in assets:
        require(isinstance(asset, dict), "Invalid release asset metadata.")
        name, identity, size = asset.get("name"), asset.get("id"), asset.get("size")
        require(isinstance(name, str) and name in ASSET_LIMITS and name not in by_name,
                "Unexpected or duplicate release asset.")
        if asset.get("state") != "uploaded":
            raise SkipRelease("Release assets have not finished uploading.")
        require(type(identity) is int and identity > 0 and type(size) is int
                and 0 < size <= ASSET_LIMITS[name], "Invalid release asset size or identifier.")
        require(asset.get("url") == API_ROOT + "/releases/assets/" + str(identity),
                "Release asset endpoint is not approved.")
        by_name[name] = asset
    payloads = {}
    for name in (MANIFEST_NAME, SUMS_NAME, ARCHIVE_NAME):
        asset = by_name[name]
        payload = client.get(asset["url"], ASSET_LIMITS[name], binary=True)
        require(len(payload) == asset["size"], "Downloaded asset size differs from release metadata.")
        payloads[name] = payload
    verify_sums(payloads[SUMS_NAME], payloads[ARCHIVE_NAME], payloads[MANIFEST_NAME])
    manifest = validate_manifest(payloads[MANIFEST_NAME], sha)
    entries = verify_archive(payloads[ARCHIVE_NAME], payloads[MANIFEST_NAME], manifest)
    return sha, entries


@dataclasses.dataclass(frozen=True)
class Layout:
    www: Path = Path("/opt/nexadly/www")
    state: Path = Path("/var/lib/nexadly-updater")


def checked_directory(path):
    require(path.is_absolute(), "Deployment directory must be absolute.")
    current = Path(path.anchor)
    for part in path.parts[1:]:
        current /= part
        require(stat.S_ISDIR(current.lstat().st_mode), "Deployment directory contains a link or non-directory.")


def fsync_directory(path):
    fd = os.open(path, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


def existing_release_matches(path, entries):
    """No extras, symlinks, hardlinks, missing files or changed bytes are accepted."""
    checked_directory(path)
    seen = set()
    expected_dirs = {str(parent) for name in entries for parent in PurePosixPath(name).parents
                     if str(parent) != "."}
    for root, directories, files in os.walk(path, followlinks=False):
        for name in directories:
            item = Path(root) / name
            relative = item.relative_to(path).as_posix()
            if not stat.S_ISDIR(item.lstat().st_mode) or relative not in expected_dirs:
                return False
        for name in files:
            item = Path(root) / name
            relative = item.relative_to(path).as_posix()
            info = item.lstat()
            if relative not in entries or not stat.S_ISREG(info.st_mode) or info.st_nlink != 1:
                return False
            if info.st_size != len(entries[relative]):
                return False
            fd = os.open(item, os.O_RDONLY | os.O_NOFOLLOW)
            with os.fdopen(fd, "rb") as stream:
                if digest(stream.read(MAX_FILE_BYTES + 1)) != digest(entries[relative]):
                    return False
            seen.add(relative)
    return seen == set(entries)


def validate_current(layout):
    current = layout.www / "current"
    if os.path.lexists(current):
        require(stat.S_ISLNK(current.lstat().st_mode), "Current website pointer is not a symlink.")
        target = os.readlink(current)
        require(re.fullmatch(r"releases/[0-9a-f]{40}", target), "Current website pointer has an unsafe target.")


def install_release(layout, sha, entries, dry_run=False, before_switch=None):
    require(SHA_RE.fullmatch(sha), "Invalid release commit.")
    checked_directory(layout.www)
    validate_current(layout)
    releases = layout.www / "releases"
    if not releases.exists():
        if dry_run:
            if before_switch:
                before_switch()
            return "Verified release; dry run made no changes."
        releases.mkdir(mode=0o755)
        fsync_directory(layout.www)
    checked_directory(releases)
    target = releases / sha
    if os.path.lexists(target):
        if not existing_release_matches(target, entries):
            raise SkipRelease("Existing release is incomplete or changed; retained without activation.")
    elif not dry_run:
        # A partial directory is intentionally retained on any failure, including
        # interruptions. Later polls never overwrite or repair it automatically.
        target.mkdir(mode=0o755)
        fsync_directory(releases)
        for name, data in sorted(entries.items()):
            item = target / name
            item.parent.mkdir(mode=0o755, parents=True, exist_ok=True)
            checked_directory(item.parent)
            fd = os.open(item, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o644)
            with os.fdopen(fd, "wb") as stream:
                stream.write(data)
                stream.flush()
                os.fsync(stream.fileno())
        for root, _, _ in os.walk(target, topdown=False):
            fsync_directory(Path(root))
        require(existing_release_matches(target, entries), "Written release did not pass verification.")
    if before_switch:
        before_switch()
    if dry_run:
        return "Verified release; dry run made no changes."
    validate_current(layout)
    current = layout.www / "current"
    relative = "releases/" + sha
    if current.is_symlink() and os.readlink(current) == relative:
        return "Current website already matches the verified release."
    temporary = layout.www / (".current-" + uuid.uuid4().hex)
    os.symlink(relative, temporary)
    # os.replace exchanges only the current symlink. No release is deleted.
    os.replace(temporary, current)
    fsync_directory(layout.www)
    return "Verified release activated; every previous release was retained."


@contextlib.contextmanager
def update_lock(layout):
    checked_directory(layout.state)
    fd = os.open(layout.state / "update.lock", os.O_RDWR | os.O_CREAT | os.O_NOFOLLOW, 0o600)
    try:
        require(stat.S_ISREG(os.fstat(fd).st_mode) and os.fstat(fd).st_nlink == 1,
                "Unsafe updater lock file.")
        try:
            fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SkipRelease("Another updater is already running.") from None
        yield
    finally:
        os.close(fd)


def read_token():
    directory = os.environ.get("CREDENTIALS_DIRECTORY", "")
    require(directory and Path(directory).is_absolute(), "Systemd GitHub credential is unavailable.")
    fd = os.open(Path(directory) / "github-token", os.O_RDONLY | os.O_NOFOLLOW)
    with os.fdopen(fd, "rb") as stream:
        require(stat.S_ISREG(os.fstat(stream.fileno()).st_mode), "Invalid GitHub credential file.")
        raw = stream.read(1025)
    require(len(raw) <= 1024, "Invalid GitHub credential.")
    try:
        token = raw.decode("ascii").strip()
    except UnicodeError:
        raise UpdateError("Invalid GitHub credential.") from None
    require(re.fullmatch(r"github_pat_[A-Za-z0-9_]{20,250}", token),
            "A fine-grained GitHub read token is required.")
    return token


def update(client, layout, dry_run=False):
    guard = contextlib.nullcontext() if dry_run else update_lock(layout)
    with guard:
        sha, entries = fetch_release(client)

        def recheck_main():
            if current_main(client) != sha:
                raise SkipRelease("Main changed during verification; release was not activated.")
            verify_tag_commit(client, sha)

        return install_release(layout, sha, entries, dry_run=dry_run, before_switch=recheck_main)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--public", action="store_true",
                        help="read the public repository without loading or sending credentials")
    parser.add_argument("--check", "--dry-run", dest="dry_run", action="store_true",
                        help="verify the release and local state without writing or switching anything")
    args = parser.parse_args(argv)
    try:
        require(os.getuid() != 0 and os.geteuid() != 0, "Refusing to run as root; use the dedicated updater account.")
        os.umask(0o022)
        token = None if args.public else read_token()
        result = update(GitHubClient(token), Layout(), dry_run=args.dry_run)
        print(result)
        return 0
    except SkipRelease as exc:
        print("No update: " + str(exc))
        return 0
    except UpdateError as exc:
        print("Update rejected: " + str(exc), file=sys.stderr)
        return 1
    except (OSError, ValueError):
        # Never log exception strings: URLs, signed queries and credential paths
        # from a transport or filesystem exception may contain sensitive data.
        print("Update failed; check service permissions, storage and network access.", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
