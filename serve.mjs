import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const review=process.argv.includes('--legal-review');
if(process.argv.slice(2).some(arg=>arg!=='--legal-review'))throw new Error('Unknown preview argument.');
const root=resolve(review?'review-dist':'dist');const port=Number(process.env.PORT||(review?4378:4377));
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
createServer(async(req,res)=>{try{let pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let file=resolve(root,'.'+pathname);if(file!==root&&!file.startsWith(root+sep))throw new Error('path');let s=await stat(file);if(s.isDirectory())file=resolve(file,'index.html');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(404,{'Content-Type':'text/html; charset=utf-8'});try{res.end(await readFile(resolve(root,'404.html')));}catch{res.end('Not found');}}}).listen(port,'127.0.0.1',()=>console.log(`Local: http://localhost:${port}`));
