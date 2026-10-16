#!/usr/bin/env python3
"""Owner-only hidden prompt for the first private-release read credential; never print it."""
import getpass
import os
from pathlib import Path


def main():
    if os.geteuid() != 0:
        raise SystemExit('Run as root after reviewing the updater installation.')
    directory = Path('/etc/nexadly')
    if directory.is_symlink() or not directory.is_dir() or directory.stat().st_uid != 0:
        raise SystemExit('Expected the root-owned /etc/nexadly directory from installation.')
    target = directory / 'github-token'
    if target.exists() or target.is_symlink():
        raise SystemExit('Credential already exists; rotate it explicitly instead of overwriting it here.')
    token = getpass.getpass('Repository-only GitHub token with Contents: read (hidden): ').strip()
    if not token.startswith('github_pat_') or any(character.isspace() for character in token):
        raise SystemExit('Expected a fine-grained GitHub token. Nothing saved.')
    fd = os.open(str(target), os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, 0o600)
    with os.fdopen(fd, 'w') as stream:
        stream.write(token + '\n')
        stream.flush()
        os.fsync(stream.fileno())
    os.chmod(target, 0o600)
    print('Credential saved privately. Scope/expiry must be checked in the owner GitHub settings; token value was not printed.')


if __name__ == '__main__':
    main()
