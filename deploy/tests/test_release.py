import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import tarfile
import tempfile
import unittest

DEPLOY = Path(__file__).resolve().parents[1]
COMMIT = 'a' * 40


def load(name):
    spec = importlib.util.spec_from_file_location(name, DEPLOY / (name + '.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


packager = load('package_static')
publisher = load('publish_release')


def fixture(root):
    dist = root / 'dist'
    dist.mkdir()
    (dist / 'index.html').write_text('<link rel="canonical" href="https://nexadly.com/"><meta name="robots" content="index,follow">Nexadly')
    (dist / 'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://nexadly.com/sitemap.xml\n')
    for policy in packager.POLICIES:
        (dist / policy).mkdir()
        (dist / policy / 'index.html').write_text('<link rel="canonical" href="https://nexadly.com/' + policy + '/"><meta name="robots" content="noindex,nofollow"><div data-policy-status="review-pending">')
    return dist


class PackagingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.dist = fixture(self.root)

    def test_deterministic_regular_file_archive(self):
        for name in ('one', 'two'):
            packager.package(self.dist, COMMIT, self.root / name)
        self.assertEqual((self.root / 'one/nexadly-static.tar.gz').read_bytes(), (self.root / 'two/nexadly-static.tar.gz').read_bytes())
        with tarfile.open(self.root / 'one/nexadly-static.tar.gz') as archive:
            self.assertTrue(all(member.isfile() and not member.pax_headers for member in archive))
        manifest = json.loads((self.root / 'one/deployment-manifest.json').read_text())
        self.assertEqual(set(manifest), {'sourceCommit', 'origin', 'indexing', 'files', 'htmlFiles', 'contentFiles'})

    def test_symlink_rejected(self):
        (self.dist / 'link.png').symlink_to(self.dist / 'index.html')
        with self.assertRaisesRegex(ValueError, 'Symlink'):
            packager.package(self.dist, COMMIT, self.root / 'out')

    def test_legal_draft_rejected(self):
        (self.dist / 'privacy/index.html').write_text('data-legal-review="true"')
        with self.assertRaisesRegex(ValueError, 'Draft'):
            packager.package(self.dist, COMMIT, self.root / 'out')

    def test_nonproduction_canonical_rejected(self):
        path = self.dist / 'index.html'
        path.write_text(path.read_text().replace('https://nexadly.com', 'https://example.com'))
        with self.assertRaisesRegex(ValueError, 'canonical'):
            packager.package(self.dist, COMMIT, self.root / 'out')

    def test_source_file_rejected(self):
        (self.dist / 'secret.env').write_text('not-a-real-secret')
        with self.assertRaisesRegex(ValueError, 'Non-static'):
            packager.package(self.dist, COMMIT, self.root / 'out')

    def test_output_never_overwritten(self):
        (self.root / 'out').mkdir()
        with self.assertRaisesRegex(ValueError, 'never overwritten'):
            packager.package(self.dist, COMMIT, self.root / 'out')


class FakeGitHub:
    def __init__(self):
        self.head = COMMIT
        self.release = None
        self.assets = []
        self.calls = []
        self.advance_after_upload = False
        self.tag_sha = COMMIT

    def call(self, method, endpoint, payload=None, binary=None):
        self.calls.append((method, endpoint, payload))
        if method == 'GET' and endpoint == '/git/ref/heads/main':
            return {'object': {'sha': self.head}}
        if method == 'GET' and endpoint.startswith('/git/ref/tags/'):
            return {'object': {'type': 'commit', 'sha': self.tag_sha}}
        if method == 'GET' and endpoint.startswith('/releases/tags/'):
            return copy.deepcopy(self.release)
        if method == 'POST' and endpoint == '/releases':
            self.release = {**payload, 'id': 123}
            return copy.deepcopy(self.release)
        if method == 'GET' and endpoint == '/releases/123/assets':
            return copy.deepcopy(self.assets)
        if method == 'POST' and endpoint.startswith('https://uploads.github.com/'):
            name = endpoint.split('name=')[1]
            asset = {'name': name, 'digest': 'sha256:' + hashlib.sha256(binary).hexdigest(), 'state': 'uploaded'}
            self.assets.append(asset)
            if self.advance_after_upload:
                self.head = 'b' * 40
            return copy.deepcopy(asset)
        if method == 'PATCH' and endpoint == '/releases/123':
            self.release.update(payload)
            return copy.deepcopy(self.release)
        raise AssertionError((method, endpoint))


class PublicationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.output = root / 'out'
        packager.package(fixture(root), COMMIT, self.output)
        self.api = FakeGitHub()

    def test_draft_then_checksums_then_publish(self):
        self.assertTrue(publisher.publish(self.api, COMMIT, self.output).startswith('PUBLISHED'))
        self.assertEqual(len(self.api.assets), 3)
        self.assertFalse(self.api.release['draft'])
        self.assertEqual(self.api.calls[-1][0], 'PATCH')
        self.assertTrue(all(call[0] != 'DELETE' for call in self.api.calls))

    def test_stale_build_never_creates_release(self):
        self.api.head = 'b' * 40
        self.assertTrue(publisher.publish(self.api, COMMIT, self.output).startswith('SKIPPED'))
        self.assertIsNone(self.api.release)

    def test_main_advance_keeps_draft(self):
        self.api.advance_after_upload = True
        self.assertTrue(publisher.publish(self.api, COMMIT, self.output).startswith('SKIPPED'))
        self.assertTrue(self.api.release['draft'])

    def test_matching_rerun_does_not_replace_assets(self):
        publisher.publish(self.api, COMMIT, self.output)
        self.api.calls.clear()
        publisher.publish(self.api, COMMIT, self.output)
        self.assertFalse(any(method == 'POST' for method, _, _ in self.api.calls))

    def test_changed_asset_never_overwritten(self):
        publisher.publish(self.api, COMMIT, self.output)
        self.api.assets[0]['digest'] = 'sha256:' + '0' * 64
        self.api.calls.clear()
        with self.assertRaisesRegex(RuntimeError, 'differs'):
            publisher.publish(self.api, COMMIT, self.output)
        self.assertTrue(all(method == 'GET' for method, _, _ in self.api.calls))

    def test_wrong_tag_commit_stops_before_publication(self):
        self.api.tag_sha = 'b' * 40
        with self.assertRaisesRegex(RuntimeError, 'exact source commit'):
            publisher.publish(self.api, COMMIT, self.output)
        self.assertTrue(all(method == 'GET' for method, _, _ in self.api.calls))

    def test_redirect_is_not_followed_with_token(self):
        with self.assertRaisesRegex(RuntimeError, 'redirect'):
            publisher.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://evil.example/')


if __name__ == '__main__':
    unittest.main()
