#!/usr/bin/env python3
"""Render a pinned first-install helper from a reviewed static release; no server actions."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import re
import tarfile


def render(archive, output):
    data = Path(archive).read_bytes()
    with tarfile.open(fileobj=io.BytesIO(data), mode='r:gz') as package:
        names = package.getnames()
        if names.count('deployment-manifest.json') != 1:
            raise ValueError('Expected one deployment manifest')
        member = package.getmember('deployment-manifest.json')
        if not member.isfile() or member.size > 1024 * 1024:
            raise ValueError('Invalid deployment manifest')
        manifest_data = package.extractfile(member).read()
    manifest = json.loads(manifest_data)
    commit = manifest['sourceCommit']
    if not re.fullmatch('[0-9a-f]{40}', commit) or manifest['origin'] != 'https://nexadly.com' or manifest['indexing'] != 'public':
        raise ValueError('Expected public production manifest with full source SHA')
    if not (isinstance(manifest['contentFiles'], int) and 0 < manifest['contentFiles'] <= 2000
            and isinstance(manifest['htmlFiles'], int) and 0 < manifest['htmlFiles'] <= manifest['contentFiles']):
        raise ValueError('Invalid file counts')
    values = {'__COMMIT__': commit, '__RELEASE_SHORT__': commit[:7],
              '__ARCHIVE_SHA__': hashlib.sha256(data).hexdigest(),
              '__MANIFEST_SHA__': hashlib.sha256(manifest_data).hexdigest(),
              '__CONTENT_FILES__': str(manifest['contentFiles']), '__HTML_FILES__': str(manifest['htmlFiles'])}
    source = Path(__file__).with_name('bootstrap.py.in').read_text()
    for token, value in values.items():
        if token not in source:
            raise ValueError('Bootstrap template missing expected pin')
        source = source.replace(token, value)
    compile(source, str(output), 'exec')
    with Path(output).open('x') as stream:
        stream.write(source)
    print('Pinned helper written: %s' % output)
    print('SHA-256: %s' % hashlib.sha256(source.encode()).hexdigest())


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    render(args.archive, args.output)
