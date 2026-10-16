#!/usr/bin/env python3
"""Publish checked static release assets from Actions; never replace/delete release assets."""
import hashlib
import json
import os
from pathlib import Path
import re
import urllib.error
import urllib.parse
import urllib.request

REPOSITORY = 'Sidharthkumar2024/nexadly'
API = 'https://api.github.com/repos/' + REPOSITORY
NAMES = ('nexadly-static.tar.gz', 'deployment-manifest.json', 'SHA256SUMS')


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, message, headers, url):
        raise RuntimeError('Unexpected redirect while publishing GitHub release')


class GitHub:
    def __init__(self, token):
        if not token:
            raise RuntimeError('Actions GitHub token missing')
        self.token = token
        self.opener = urllib.request.build_opener(NoRedirect())

    def call(self, method, endpoint, payload=None, binary=None):
        url = endpoint if endpoint.startswith('https://') else API + endpoint
        parsed = urllib.parse.urlsplit(url)
        allowed = (parsed.scheme == 'https' and not parsed.username and not parsed.password
                   and parsed.hostname in {'api.github.com', 'uploads.github.com'}
                   and parsed.path.startswith('/repos/' + REPOSITORY + '/'))
        if not allowed:
            raise RuntimeError('Unexpected GitHub publication endpoint')
        headers = {'Authorization': 'Bearer ' + self.token, 'Accept': 'application/vnd.github+json',
                   'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'nexadly-static-release'}
        data = None
        if payload is not None:
            headers['Content-Type'] = 'application/json'
            data = json.dumps(payload).encode()
        elif binary is not None:
            headers['Content-Type'] = 'application/octet-stream'
            data = binary
        try:
            with self.opener.open(urllib.request.Request(url, data=data, headers=headers, method=method), timeout=60) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if method == 'GET' and error.code == 404:
                return None
            raise RuntimeError('GitHub release request failed with HTTP %s' % error.code) from None


def publish(api, commit, directory):
    if not re.fullmatch('[0-9a-f]{40}', commit):
        raise RuntimeError('Invalid source commit')
    assets = {name: (Path(directory) / name).read_bytes() for name in NAMES}
    manifest = json.loads(assets['deployment-manifest.json'])
    if manifest['sourceCommit'] != commit or manifest['origin'] != 'https://nexadly.com':
        raise RuntimeError('Release source/origin mismatch')
    head = api.call('GET', '/git/ref/heads/main')
    if head['object']['sha'] != commit:
        return 'SKIPPED: a newer main commit exists; its checked release will deploy instead.'
    tag = 'nexadly-' + commit
    tag_ref = api.call('GET', '/git/ref/tags/' + tag)
    if tag_ref is None:
        tag_ref = api.call('POST', '/git/refs', {'ref': 'refs/tags/' + tag, 'sha': commit})
    if tag_ref['object']['type'] != 'commit' or tag_ref['object']['sha'] != commit:
        raise RuntimeError('Release tag is not a lightweight tag at the exact source commit')
    release = api.call('GET', '/releases/tags/' + tag)
    if release is None:
        release = api.call('POST', '/releases', {'tag_name': tag, 'target_commitish': commit,
                           'name': 'Nexadly ' + commit[:7], 'body': 'Checked static corporate website release. Corporate legal policies remain review notices.',
                           'draft': True, 'prerelease': False, 'make_latest': 'false'})
    elif not release['draft']:
        ref = api.call('GET', '/git/ref/tags/' + tag)
        if ref is None or ref['object']['type'] != 'commit' or ref['object']['sha'] != commit:
            raise RuntimeError('Published release tag differs from the requested commit')
    if release.get('prerelease') or release.get('target_commitish') != commit:
        raise RuntimeError('Existing release metadata differs; refusing to overwrite')
    release_id = release['id']
    if not isinstance(release_id, int) or release_id <= 0:
        raise RuntimeError('Invalid release identity')
    existing = api.call('GET', '/releases/%s/assets' % release_id)
    indexed = {asset['name']: asset for asset in existing}
    if len(indexed) != len(existing) or set(indexed) - set(NAMES):
        raise RuntimeError('Release contains unexpected assets; nothing replaced or deleted')
    for name, data in assets.items():
        expected = 'sha256:' + hashlib.sha256(data).hexdigest()
        if name in indexed:
            if indexed[name].get('digest') != expected or indexed[name].get('state') != 'uploaded':
                raise RuntimeError('Existing release asset differs; publish a new commit instead of overwriting')
            continue
        if not release['draft']:
            raise RuntimeError('Published release is incomplete; publish a new commit')
        url = 'https://uploads.github.com/repos/%s/releases/%s/assets?name=%s' % (REPOSITORY, release_id, urllib.parse.quote(name))
        asset = api.call('POST', url, binary=data)
        if asset.get('digest') != expected or asset.get('state') != 'uploaded':
            raise RuntimeError('Uploaded asset checksum/state mismatch; draft retained')
    if api.call('GET', '/git/ref/heads/main')['object']['sha'] != commit:
        return 'SKIPPED: main advanced during upload; completed draft retained without activation.'
    api.call('PATCH', '/releases/%s' % release_id, {'draft': False, 'make_latest': 'true'})
    return 'PUBLISHED: checked static assets are available to the restricted VPS updater.'


if __name__ == '__main__':
    try:
        if os.environ.get('GITHUB_REPOSITORY') != REPOSITORY or os.environ.get('GITHUB_REF') != 'refs/heads/main':
            raise RuntimeError('Publishing is restricted to this repository main branch')
        print(publish(GitHub(os.environ.get('GH_TOKEN', '')), os.environ.get('GITHUB_SHA', ''), os.environ['NEXADLY_RELEASE_DIR']))
    except Exception as error:
        print('Publication stopped: %s' % error)
        raise SystemExit(1)
