#!/usr/bin/env python3
"""One-time root installation of reviewed local updater files. Does not start the timer."""
import grp
import os
from pathlib import Path
import pwd
import subprocess
import sys

USER = 'nexadly-updater'
BASE = Path('/opt/nexadly')


def require(condition, message):
    if not condition:
        raise RuntimeError(message)


def directory(path, mode=0o755):
    for ancestor in [*reversed(path.parents), path]:
        require(not ancestor.is_symlink(), 'Symlinked installation path rejected')
    path.mkdir(parents=True, exist_ok=True, mode=mode)
    require(path.is_dir(), 'Expected installation directory')


def install(source, target, mode):
    data = source.read_bytes()
    require(not target.is_symlink(), 'Symlinked installation file rejected')
    if target.exists():
        require(target.is_file() and target.read_bytes() == data,
                'Existing installation differs; review an explicit upgrade before replacing it: ' + str(target))
        require(target.stat().st_uid == 0 and not target.stat().st_mode & 0o022,
                'Existing installed file must be root-owned and non-writable by others')
        return
    fd = os.open(str(target), os.O_CREAT | os.O_EXCL | os.O_WRONLY | os.O_NOFOLLOW, mode)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())
    os.chmod(target, mode)
    os.chown(target, 0, 0)


def main():
    require(os.geteuid() == 0, 'Run this reviewed local installer as root')
    source = Path(__file__).resolve().parent
    require((BASE / 'www/current').is_symlink(), 'Complete the stable-mount bootstrap before installing automation')
    try:
        account = pwd.getpwnam(USER)
    except KeyError:
        subprocess.run(['useradd', '--system', '--user-group', '--home-dir', '/var/lib/nexadly-updater',
                        '--no-create-home', '--shell', '/usr/sbin/nologin', USER], check=True)
        account = pwd.getpwnam(USER)
    require(account.pw_uid != 0 and account.pw_dir == '/var/lib/nexadly-updater'
            and account.pw_shell == '/usr/sbin/nologin', 'Unexpected existing updater account')
    memberships = {group.gr_name for group in grp.getgrall()
                   if USER in group.gr_mem or group.gr_gid == account.pw_gid}
    require(not memberships & {'docker', 'sudo', 'wheel', 'root'}, 'Updater must not have privileged group membership')
    directory(BASE / 'bin')
    directory(Path('/etc/nexadly'), 0o700)
    directory(BASE / 'www')
    directory(BASE / 'www/releases')
    directory(Path('/var/lib/nexadly-updater'), 0o700)
    # Only these dedicated writable roots change ownership; existing releases are untouched.
    for path in (BASE / 'www', BASE / 'www/releases', Path('/var/lib/nexadly-updater')):
        os.chown(path, account.pw_uid, account.pw_gid)
    install(source / 'updater.py', BASE / 'bin/updater.py', 0o755)
    for name in ('nexadly-updater.service', 'nexadly-updater.timer'):
        install(source / 'systemd' / name, Path('/etc/systemd/system') / name, 0o644)
    subprocess.run(['systemd-analyze', 'verify', '/etc/systemd/system/nexadly-updater.service',
                    '/etc/systemd/system/nexadly-updater.timer'], check=True)
    subprocess.run(['systemctl', 'daemon-reload'], check=True)
    print('INSTALLED: unprivileged updater and timer. Neither has been started or enabled.')
    print('Provision the scoped read credential, run one manual service update, verify it, then enable the timer.')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Installation stopped: %s' % error, file=sys.stderr)
        sys.exit(1)
