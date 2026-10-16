#!/usr/bin/env python3
"""Package an already-built/checked public static tree; never include source or drafts."""
import argparse
import gzip
import hashlib
import io
import json
from pathlib import Path
import re
import tarfile

ORIGIN = 'https://nexadly.com'
POLICIES = ('privacy', 'terms', 'cookies', 'refund-cancellation', 'data-deletion')
ALLOWED = {'.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico', '.woff', '.woff2', '.txt', '.xml'}
EXCLUDED = {'assets/hero-prompt.txt'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def package(dist, commit, output):
    dist, output = Path(dist).resolve(), Path(output).resolve()
    require(re.fullmatch('[0-9a-f]{40}', commit), 'Expected a full Git commit SHA')
    require(dist.is_dir() and output != dist and dist not in output.parents, 'Unsafe input/output paths')
    require(not output.exists(), 'Output directory must be new; artifacts are never overwritten')
    files = {}
    for path in sorted(dist.rglob('*')):
        require(not path.is_symlink(), 'Symlink cannot be packaged')
        if path.is_dir():
            continue
        require(path.is_file(), 'Only regular files may be packaged')
        name = path.relative_to(dist).as_posix()
        if name in EXCLUDED:
            continue
        require(re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9._/-]*', name)
                and all(not part.startswith('.') for part in path.relative_to(dist).parts), 'Unsafe asset path')
        require(path.suffix.lower() in ALLOWED, 'Non-static asset rejected: ' + name)
        data = path.read_bytes()
        require(len(data) <= 20 * 1024 * 1024, 'Individual asset exceeds limit')
        require(b'data-legal-review="true"' not in data and b'BEGIN PRIVATE KEY' not in data,
                'Draft or private material rejected')
        if path.suffix == '.html':
            text = data.decode('utf-8')
            require('<link rel="canonical" href="' + ORIGIN + '/' in text, 'Non-production canonical')
        files[name] = data
    require(0 < len(files) <= 2000 and sum(map(len, files.values())) <= 64 * 1024 * 1024,
            'Static tree exceeds size/file limits')
    require(b'content="index,follow' in files.get('index.html', b''), 'Homepage is not publicly indexable')
    require(files.get('robots.txt') == b'User-agent: *\nAllow: /\nSitemap: https://nexadly.com/sitemap.xml\n',
            'Production robots.txt required')
    for policy in POLICIES:
        content = files.get(policy + '/index.html', b'')
        require(b'data-policy-status="review-pending"' in content
                and b'content="noindex,nofollow"' in content, 'Only unindexed legal holding notices are approved')
    manifest = {'sourceCommit': commit, 'origin': ORIGIN, 'indexing': 'public',
                'files': {name: sha(data) for name, data in files.items()},
                'htmlFiles': sum(name.endswith('.html') for name in files), 'contentFiles': len(files)}
    encoded = (json.dumps(manifest, sort_keys=True, indent=2) + '\n').encode()
    output.mkdir(parents=True)
    (output / 'deployment-manifest.json').write_bytes(encoded)
    archive = output / 'nexadly-static.tar.gz'
    with archive.open('xb') as raw:
        with gzip.GzipFile(filename='', mode='wb', fileobj=raw, mtime=0) as compressed:
            with tarfile.open(fileobj=compressed, mode='w', format=tarfile.USTAR_FORMAT) as stream:
                for name, data in [*files.items(), ('deployment-manifest.json', encoded)]:
                    item = tarfile.TarInfo(name)
                    item.mode, item.size, item.mtime = 0o644, len(data), 0
                    stream.addfile(item, io.BytesIO(data))
    checksums = '%s  nexadly-static.tar.gz\n%s  deployment-manifest.json\n' % (sha(archive.read_bytes()), sha(encoded))
    (output / 'SHA256SUMS').write_text(checksums)
    return manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--dist', type=Path, required=True)
    parser.add_argument('--commit', required=True)
    parser.add_argument('--output-dir', type=Path, required=True)
    args = parser.parse_args()
    manifest = package(args.dist, args.commit, args.output_dir)
    print('PACKAGED: %s static files, %s HTML pages; legal drafts excluded.' % (manifest['contentFiles'], manifest['htmlFiles']))


if __name__ == '__main__':
    main()
