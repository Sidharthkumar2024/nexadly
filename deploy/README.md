# Nexadly deployment and automatic updates

A push to this private repository's `main` branch builds and checks the public website in GitHub Actions, then publishes a static release. A dedicated VPS service checks for the release every two minutes and changes only Nexadly's `current` pointer after verification. Adgrowly's files, containers, database and deployment configuration are outside the updater's writable paths.

**Prepared code is not proof that automation is running.** Activation needs the initial site/container, an owner-provisioned read credential, enabled timer and one observed release switch. No VPS or DNS changes are made by committing these files.

## Boundaries

- Repository remains private. The workflow uses its ephemeral `GITHUB_TOKEN` with `contents: write`; it has no SSH key or server credentials.
- VPS token: a fine-grained personal access token for **Sidharthkumar2024/nexadly only**, **Contents: read** and the automatically included Metadata access. Choose an expiry, retain its renewal date, and grant no write/admin/workflow scope. The assistant does not create, retrieve or reuse broad credentials.
- The fixed updater is installed root-owned under `/opt/nexadly/bin`; it runs as `nexadly-updater`, refuses root, and never fetches/executes deployment code. Only verified static HTML/CSS/JavaScript/images/fonts are downloaded. Client-side JavaScript remains website content; it is never executed as a server command.
- The updater cannot use Docker or system-control sockets. Only `/opt/nexadly/www` and its own state directory are writable. It does not reload Caddy, stop applications, alter DNS, delete old releases or prune failed staging directories.
- All normal pages use `https://nexadly.com` canonicals. The five unfinished legal policies remain factual, noindex review notices. Substantive legal drafts are excluded.

## First installation, independent of the automation token

Use a fresh, committed and reviewed source checkout. Run on a local workstation or clean build runner:

```sh
SITE_ORIGIN=https://nexadly.com SITE_INDEXING=public npm run build
SITE_ORIGIN=https://nexadly.com SITE_INDEXING=public npm run check
python3 -m unittest discover -s deploy/tests -p 'test_*.py'
python3 deploy/package_static.py --dist dist --commit "$(git rev-parse HEAD)" --output-dir /private/tmp/nexadly-initial-release
python3 deploy/render_bootstrap.py --archive /private/tmp/nexadly-initial-release/nexadly-static.tar.gz --output /private/tmp/nexadly-bootstrap.py
shasum -a 256 /private/tmp/nexadly-initial-release/nexadly-static.tar.gz /private/tmp/nexadly-bootstrap.py
```

The output directory/helper must be new; existing artifacts are not overwritten. Use `/tmp` instead of `/private/tmp` on Linux. In a workspace that also serves the private Sites preview, run these commands in an isolated checkout so its private `dist/` is preserved.

Transfer only the reviewed archive, pinned helper and deployment setup files through the owner's authenticated server session. Compare the local and server SHA-256 values. The pinned helper rechecks its exact archive and manifest, and exposes two explicit phases:

```sh
sudo python3 /path/to/nexadly-bootstrap.py prepare /path/to/nexadly-static.tar.gz
sudo python3 /path/to/nexadly-bootstrap.py activate
```

`prepare` refuses existing conflicting release/container/current-pointer paths. It writes `/opt/nexadly/www/releases/<full-commit>`, creates `current -> releases/<full-commit>`, starts only the new `nexadly-corporate` container, reusing the existing proxy's immutable image ID and `adgrowly-gmb_frontend` network. It publishes no host ports and mounts all of `/opt/nexadly/www` read-only at `/srv`. Internal Caddy serves `/srv/current`. This stable directory mount is essential: mounting one immutable release directly would prevent future pointer updates from becoming visible.

`activate` validates a backup/candidate of the existing proxy configuration, checks the running configuration agrees with the file, preserves original bytes/inode, appends only the explicit apex/www routes importing the existing `security_headers` snippet, and gracefully reloads. Guarded rollback restores only its own append if activation fails; all backups and new files remain. A graceful proxy reload can reconnect existing WebSockets; no existing container is stopped.

Verify the existing Adgrowly site and Nexadly separately. DNS changes, certificate issuance, apex/www redirect behavior, an inner service page, assets and a genuine 404 require live checks. The bootstrap does not change DNS.

## Install the bounded updater

Prerequisites: Linux/systemd with `LoadCredential` support (systemd 247+), Python 3.9+, existing Docker setup, and the completed stable-mount bootstrap. Run the reviewed **local** setup files on the VPS; never pipe a downloaded installer directly to a root shell.

```sh
sudo python3 /path/to/deploy/install_updater.py
sudo python3 /path/to/deploy/provision_credential.py
```

The first command creates the non-login `nexadly-updater` account, installs the fixed updater and units, checks unit syntax and reloads systemd's unit definitions. It does **not** enable or start the timer. Existing release contents are untouched; only the dedicated `www`, `www/releases` and updater-state directory ownership is assigned to the new account. Differing existing installed scripts/units cause a stop for explicit upgrade review.

The credential command prompts the owner without echo and saves `/etc/nexadly/github-token` root-owned mode `0600`. Enter the token only into that server prompt, never into a Git commit, chat, command argument or Actions secret. Its shape is checked locally; its actual repository permissions and expiry must be checked in GitHub settings. The service receives it through systemd `LoadCredential`; it is not an environment-variable value and is not logged. Existing credentials are never silently replaced.

Before scheduling, confirm the workflow produced a published release for current main, then run and inspect one update:

```sh
sudo systemctl start nexadly-updater.service
sudo systemctl status nexadly-updater.service --no-pager
sudo journalctl -u nexadly-updater.service -n 30 --no-pager
readlink /opt/nexadly/www/current
sudo systemctl enable --now nexadly-updater.timer
sudo systemctl list-timers nexadly-updater.timer --no-pager
```

The updater follows the exact `nexadly-<current-main-SHA>` release and verifies the actual lightweight tag target, not just the latest release label. A missing, draft, incomplete, stale or malformed release leaves the current website unchanged. It repeats the main/tag checks just before the atomic pointer change. Asset downloads are bounded; authorization is stripped on redirects. Checksums are integrity checks under the authenticated repository publisher's trust, not an independent signing authority.

To verify without a pointer change, run the installed updater's `--check` mode under the same unprivileged systemd credential context. For example, create a one-time diagnostic service:

```sh
sudo systemd-run --wait --pipe --unit=nexadly-update-check --uid=nexadly-updater --gid=nexadly-updater --property=LoadCredential=github-token:/etc/nexadly/github-token /usr/bin/python3 -I -B /opt/nexadly/bin/updater.py --check
```

Use a new diagnostic unit name if that name already exists. `--check` does not create a lock file, download cache, release directory or pointer.

## Release behavior and evidence

Workflow: `.github/workflows/nexadly-static-release.yml`. It runs only for this repository's main pushes/manual main dispatch, with pinned official actions. It builds the public site, executes website and deployment tests, packages deterministic USTAR assets, and publishes only if main still matches. An existing asset with a different digest is refused instead of overwritten or deleted. A failed upload may leave a draft; a new main commit safely creates a distinct release. A matching rerun can reuse completed matching assets.

Release assets are exactly `nexadly-static.tar.gz`, `deployment-manifest.json` and `SHA256SUMS`. The archive contains only manifest-listed regular static files and the same manifest. No source directories, executable server modules, deployment helpers, credentials, Apple metadata, symlinks or legal review drafts are included. The static manifest is hidden by Caddy.

Completion evidence must cover each layer:

1. Actions build/check/test success and published release at the intended main SHA.
2. Successful one-shot updater run and active timer.
3. `current` points to that full SHA and the manifest/file checksums match.
4. Public Nexadly shows that version over valid HTTPS; apex/www, inner pages, assets and 404 work.
5. Adgrowly remains healthy and its existing containers/configuration are preserved.

A release publication alone is not VPS activation. A timer being enabled alone is not evidence of a successful release switch. The initial update must be observed.

## Recovery, credentials and storage

The updater validates files before switching but does not implement post-switch HTTP/UI health rollback. Check the public website after deployment. Prefer reverting the bad website change in GitHub and pushing a new main commit: that produces a new checked release. For an urgent manual pointer rollback, stop **only** `nexadly-updater.timer` and its one-shot service, select a previously verified retained release, verify its manifest/checksums, and atomically replace only the Nexadly `current` symlink. Do not edit Adgrowly or delete any release. Re-enable the timer only after main points to the intended corrected content.

No automatic pruning is implemented. Monitor storage; failed or superseded releases are retained. If a partial directory already exists for a commit, the updater refuses to repair/overwrite it automatically. Publish a new commit or have the owner review the retained directory.

An expired/revoked/insufficient token causes update failure while the current site stays served. Rotate the credential through an owner-approved server edit, preserve mode `0600`, then start the one-shot service again. Changing the updater code, service hardening, publisher trust, domain or host is a separate reviewed installation step; website pushes never update the privileged bootstrap or installed updater itself.

## References

- [GitHub release assets and Contents: read permissions](https://docs.github.com/en/rest/releases/assets#get-a-release-asset)
- [GitHub Actions token permissions](https://docs.github.com/en/actions/tutorials/authenticate-with-github_token)
- [systemd credentials and execution restrictions](https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html)
- [Caddy graceful configuration reload](https://caddyserver.com/docs/command-line#caddy-reload)
