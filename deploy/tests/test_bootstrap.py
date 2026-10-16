import contextlib, importlib.util, io, json, os, pathlib, shutil, subprocess, tempfile, unittest
from unittest import mock

DEPLOY=pathlib.Path(__file__).resolve().parents[1]
COMMIT='a'*40
ARCHIVE=None

def load():
    global ARCHIVE
    from test_release import fixture,packager
    work=pathlib.Path(tempfile.mkdtemp(prefix='nexadly-bootstrap-test-')).resolve()
    output=work/'artifact'
    packager.package(fixture(work),COMMIT,output)
    ARCHIVE=output/'nexadly-static.tar.gz'
    renderer_spec=importlib.util.spec_from_file_location('renderer',DEPLOY/'render_bootstrap.py')
    renderer=importlib.util.module_from_spec(renderer_spec);renderer_spec.loader.exec_module(renderer)
    script=work/'bootstrap.py';renderer.render(ARCHIVE,script)
    spec=importlib.util.spec_from_file_location('deploy_bootstrap',script)
    mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
    mod.BASE=work/'nexadly';mod.WWW=mod.BASE/'www';mod.CURRENT=mod.WWW/'current'
    mod.RELEASE=mod.WWW/('releases/'+COMMIT);mod.BACKUPS=mod.BASE/'backups/bootstrap-test'
    mod.STATE=mod.BACKUPS/'deployment.json';mod.STATIC_CONFIG=mod.BASE/'Caddyfile.nexadly-static'
    mod.PROXY_CONFIG=work/'Adgrowly-Caddyfile'
    original=b'adgrowly.ca {\n\treverse_proxy app:3000\n}\n'
    mod.PROXY_CONFIG.write_bytes(original)
    machine={'runtime':original,'calls':[],'started':False,'reload_failures':0,'drift':False}
    def inspect(name):
        if name==mod.PROXY:
            return {'Id':'existing-proxy-id','Image':'sha256:existing-image','State':{'Running':True},'NetworkSettings':{'Networks':{mod.NETWORK:{}}},'Mounts':[{'Destination':'/etc/caddy/Caddyfile','Source':str(mod.PROXY_CONFIG),'RW':False}]}
        assert name==mod.CONTAINER and machine['started']
        return {'Id':'new-container-id','Image':'sha256:existing-image','State':{'Running':True},'HostConfig':{'PortBindings':{}},'NetworkSettings':{'Networks':{mod.NETWORK:{}}},'Mounts':[{'Destination':'/srv','Source':str(mod.WWW),'RW':False},{'Destination':'/etc/caddy/Caddyfile','Source':str(mod.STATIC_CONFIG),'RW':False}]}
    def result(args,out=b'',err=b'',code=0):return subprocess.CompletedProcess(args,code,out,err)
    def command(args,data=None,allow_failure=False):
        machine['calls'].append(args)
        assert not any(x in args for x in ['rm','stop','restart','down','rmi','prune'])
        if args[1:3]==['ps','-a']:return result(args)
        if args[1:3]==['network','inspect']:return result(args,b'[]')
        if args[1:3]==['run','-d']:
            assert '--publish' not in args and '-p' not in args
            assert '--restart' in args and '--pull=never' in args
            machine['started']=True;return result(args,b'new-container-id\n')
        if 'cat' in args:return result(args,mod.PROXY_CONFIG.read_bytes())
        if 'sh' in args:return result(args)
        if 'adapt' in args:return result(args,json.dumps({'bytes':data.decode()}).encode())
        if 'validate' in args:
            if machine['drift'] and data==original+mod.APPEND:
                mod.PROXY_CONFIG.write_bytes(original+b'# external concurrent edit\n')
            return result(args)
        if 'reload' in args:
            if machine['reload_failures']:
                machine['reload_failures']-=1
                raise RuntimeError('mock reload failure')
            machine['runtime']=mod.PROXY_CONFIG.read_bytes();return result(args)
        if 'wget' in args:
            if args[-1].endswith('/config/'):
                return result(args,json.dumps({'bytes':machine['runtime'].decode()}).encode())
            if '__nexadly_missing_' in args[-1]:return result(args,b'',b'HTTP/1.1 404 Not Found\n',8)
            return result(args,b'<title>Nexadly</title>',b'HTTP/1.1 200 OK\n')
        raise AssertionError(args)
    mod.inspect=inspect;mod.command=command
    return mod,machine,original,work

class BootstrapTests(unittest.TestCase):
    def test_reviewed_transaction_and_failure_scenarios(self):
        passed=[]
        with contextlib.redirect_stdout(io.StringIO()):
            m,s,original,w=load();inode=m.PROXY_CONFIG.stat().st_ino
            m.prepare(ARCHIVE)
            assert m.PROXY_CONFIG.read_bytes()==original and m.PROXY_CONFIG.stat().st_ino==inode
            assert len([p for p in m.RELEASE.rglob('*') if p.is_file()])==m.CONTENT_FILES+1
            assert m.STATIC_CONFIG.read_bytes()==m.CONFIG
            m.activate()
            assert m.PROXY_CONFIG.read_bytes()==original+m.APPEND and m.PROXY_CONFIG.stat().st_ino==inode
            assert s['runtime']==original+m.APPEND and (m.BACKUPS/'activation.json').is_file()
            passed.append('successful prepare/activate, unchanged original prefix/inode, no destructive Docker commands')
            try:m.activate();raise AssertionError('repeat activation accepted')
            except RuntimeError as e:assert 'already recorded' in str(e)
            passed.append('repeated activation refused')

            m,s,original,w=load();m.prepare(ARCHIVE);inode=m.PROXY_CONFIG.stat().st_ino;s['reload_failures']=1
            try:m.activate();raise AssertionError('reload failure accepted')
            except RuntimeError as e:assert 'restored and reloaded' in str(e)
            assert m.PROXY_CONFIG.read_bytes()==original and m.PROXY_CONFIG.stat().st_ino==inode and s['runtime']==original
            passed.append('failed reload safely restores exact original bytes/inode/runtime')

            m,s,original,w=load();m.prepare(ARCHIVE);s['drift']=True
            try:m.activate();raise AssertionError('concurrent edit accepted')
            except RuntimeError as e:assert 'changed before append' in str(e)
            assert m.PROXY_CONFIG.read_bytes()==original+b'# external concurrent edit\n'
            passed.append('concurrent proxy edit refused without overwriting external change')

            m,s,original,w=load();m.prepare(ARCHIVE);(m.RELEASE/'unexpected.txt').write_text('extra')
            try:m.activate();raise AssertionError('extra release file accepted')
            except RuntimeError as e:assert 'file set changed' in str(e)
            assert m.PROXY_CONFIG.read_bytes()==original
            passed.append('extra release file blocks activation')

            m,s,original,w=load();m.prepare(ARCHIVE)
            manifest=json.loads((m.RELEASE/'deployment-manifest.json').read_text());manifest['files']['index.html']='0'*64
            (m.RELEASE/'deployment-manifest.json').write_text(json.dumps(manifest))
            try:m.activate();raise AssertionError('changed manifest accepted')
            except RuntimeError as e:assert 'manifest checksum' in str(e)
            passed.append('changed manifest blocks activation')

            m,s,original,w=load();m.prepare(ARCHIVE);write=m.write_new
            def fail_marker(path,data,mode):
                if path.name.startswith('activation-record-'):raise OSError('mock disk full')
                return write(path,data,mode)
            m.write_new=fail_marker
            try:m.activate();raise AssertionError('marker failure accepted')
            except RuntimeError as e:assert 'restored and reloaded' in str(e)
            assert m.PROXY_CONFIG.read_bytes()==original and s['runtime']==original
            passed.append('activation marker write failure rolls back')

            m,s,original,w=load();archive=w/'archive.tar.gz';shutil.copyfile(ARCHIVE,archive);preflight=m.preflight_proxy
            def swapped_archive():
                result=preflight();archive.write_bytes(b'replaced after hash');return result
            m.preflight_proxy=swapped_archive;m.prepare(archive)
            assert (m.RELEASE/'index.html').is_file()
            passed.append('archive pathname swap cannot replace SHA-verified bytes')

            m,s,original,w=load();archive=w/'bad.tar.gz';archive.write_bytes(b'bad')
            try:m.prepare(archive);raise AssertionError('wrong artifact accepted')
            except RuntimeError as e:assert 'SHA-256 mismatch' in str(e)
            assert not m.BASE.exists() and not s['calls']
            passed.append('wrong artifact stops before Docker/filesystem mutation')

        with contextlib.redirect_stdout(io.StringIO()):
            m,s,original,w=load();m.prepare(ARCHIVE);base_command=m.command;did_interrupt=[False]
            def interrupt_reload(args,data=None,allow_failure=False):
                if 'reload' in args and not did_interrupt[0]:
                    did_interrupt[0]=True;raise KeyboardInterrupt()
                return base_command(args,data,allow_failure)
            m.command=interrupt_reload
            try:m.activate();raise AssertionError('interrupt accepted')
            except RuntimeError as e:assert 'restored and reloaded' in str(e)
            assert m.PROXY_CONFIG.read_bytes()==original and s['runtime']==original
            passed.append('keyboard interruption during activation rolls back')

            m,s,original,w=load();m.prepare(ARCHIVE);fdopen=m.os.fdopen
            class PartialFile:
                def __init__(self,file):self.file=file;self.partial=False
                def __enter__(self):return self
                def __exit__(self,*args):return self.file.__exit__(*args)
                def __getattr__(self,name):return getattr(self.file,name)
                def write(self,data):
                    if data==m.APPEND and not self.partial:
                        self.partial=True;return self.file.write(data[:len(data)//2])
                    return self.file.write(data)
            def partial_fdopen(fd,mode,*args,**kwargs):
                file=fdopen(fd,mode,*args,**kwargs)
                return PartialFile(file) if mode=='r+b' else file
            with mock.patch.object(m.os,'fdopen',partial_fdopen):
                try:m.activate();raise AssertionError('partial append accepted')
                except RuntimeError as e:assert 'restored and reloaded' in str(e)
            assert m.PROXY_CONFIG.read_bytes()==original and s['runtime']==original
            passed.append('partial append safely truncates only own bytes and restores runtime')

        self.assertEqual(len(passed),11)


if __name__ == '__main__':
    unittest.main()
