import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve('dist');
async function walk(dir){const out=[];for(const entry of await readdir(dir,{withFileTypes:true})){const path=join(dir,entry.name);if(entry.isDirectory())out.push(...await walk(path));else if(path.endsWith('.html'))out.push(path);}return out;}
const contact=await readFile(join(root,'contact/index.html'),'utf8');if((contact.match(/<option[ >]/g)||[]).length<10)throw new Error('Consultation options missing');
const errors=[];const files=await walk(root);let checked=0;
for(const file of files){const html=await readFile(file,'utf8');const name=file.slice(root.length);if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${name}: expected one h1`);if((html.match(/<main[ >]/g)||[]).length!==1)errors.push(`${name}: expected one main`);const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);if(ids.length!==new Set(ids).size)errors.push(`${name}: duplicate IDs`);if(/swiftupi\.ca/.test(html))errors.push(`${name}: incorrect SwiftUPI domain`);
for(const [,href]of html.matchAll(/(?:href|src)="([^"]+)"/g)){if(!href.startsWith('/'))continue;checked++;const u=new URL(href,'https://test.local');let path=join(root,decodeURIComponent(u.pathname));try{if((await stat(path)).isDirectory())path=join(path,'index.html');await stat(path);if(u.hash){const target=await readFile(path,'utf8');if(!target.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`))errors.push(`${name}: missing anchor ${href}`);}}catch{errors.push(`${name}: missing link/asset ${href}`);}}
}
for(const name of ['callvani','adgrowly','swiftupi','chair-manage']){const html=await readFile(join(root,'products',name,'index.html'),'utf8');if(!html.includes('target="_blank" rel="noopener noreferrer"'))errors.push(`${name}: official site link missing`);}
if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}console.log(`PASS: ${files.length} HTML pages; ${checked} internal links/assets; one main and h1 per page; no duplicate IDs; corrected SwiftUPI domain.`);
