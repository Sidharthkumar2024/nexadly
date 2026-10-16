import {mkdir,writeFile,cp,readFile,rm} from 'node:fs/promises';
import {shell} from './src/shell.mjs';
import {home,productIndex} from './src/home.mjs';
import {products,renderProduct} from './src/products.mjs';
import {pages} from './src/pages.mjs';
const origin=process.env.SITE_ORIGIN||'https://nexadly-digital.sidharthkumar2028.chatgpt.site';
const routes={'/':{title:'Nexadly — Build Smarter. Automate Faster. Grow Beyond Limits.',description:'Your complete technology, AI and digital growth partner. Discover Nexadly services and our products: CallVani, Adgrowly, SwiftUPI and Chair Manage.',body:home()},'/products/':productIndex(),...Object.fromEntries(products.map(p=>[`/products/${p.slug}/`,renderProduct(p.slug)])),...pages};
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
for(const [path,page] of Object.entries(routes)){const dir='dist'+path;await mkdir(dir,{recursive:true});await writeFile(dir+'index.html',shell(path,page,origin));}
await writeFile('dist/404.html',shell('/404/',{title:'Page not found',description:'Find your way back to Nexadly.',body:'<section class="page-hero container"><p class="eyebrow">404 / A DIFFERENT DIRECTION</p><h1>Let’s get you<br>back on track.</h1><p class="lead">The page you are looking for is not here.</p><a class="button button-dark" href="/">Back to Nexadly →</a></section>'},origin));
await writeFile('dist/sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(routes).map(path=>`<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/robots.txt','User-agent: *\nDisallow: /\n');
console.log(`Built ${Object.keys(routes).length} pages in dist/`);
