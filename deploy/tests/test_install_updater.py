import importlib.util
from pathlib import Path
import tempfile
import unittest

DEPLOY = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('install_updater', DEPLOY / 'install_updater.py')
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class InstallationModeTests(unittest.TestCase):
    def test_private_templates_are_unchanged(self):
        for name in ('nexadly-updater.service', 'nexadly-updater.timer'):
            path = DEPLOY / 'systemd' / name
            self.assertEqual(installer.installation_bytes(path), path.read_bytes())

    def test_public_service_needs_no_credential_and_preserves_sandbox(self):
        path = DEPLOY / 'systemd/nexadly-updater.service'
        content = installer.installation_bytes(path, public=True)
        self.assertNotIn(b'LoadCredential=', content)
        self.assertIn(b'/opt/nexadly/bin/updater.py --public\n', content)
        self.assertIn(b'User=nexadly-updater\n', content)
        self.assertIn(b'ProtectSystem=strict\n', content)
        self.assertIn(b'ReadWritePaths=/opt/nexadly/www /var/lib/nexadly-updater\n', content)
        self.assertEqual(content.count(b'--public'), 1)

    def test_public_schedule_limits_api_requests(self):
        content = installer.installation_bytes(DEPLOY / 'systemd/nexadly-updater.timer', public=True)
        self.assertIn(b'OnCalendar=*-*-* *:0/15:00\n', content)
        self.assertNotIn(b'*:0/2:', content)

    def test_unknown_service_template_fails_closed(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / 'nexadly-updater.service'
            path.write_bytes(b'ExecStart=/unexpected/script\n')
            with self.assertRaisesRegex(RuntimeError, 'template'):
                installer.installation_bytes(path, public=True)


if __name__ == '__main__':
    unittest.main()
