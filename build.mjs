import {mkdir,writeFile,cp,rm} from 'node:fs/promises';
import {shell} from './src/shell.mjs';
import {home,productIndex} from './src/home.mjs';
import {products,renderProduct} from './src/products.mjs';
import {pages} from './src/pages.mjs';
import {legalPages} from './src/legal.mjs';
import {createSiteConfig,renderSitemap,renderRobots} from './src/seo.mjs';
const config=createSiteConfig();
const routes={'/':{title:'Nexadly | Web, Shopify & AI Services for Canada & US',description:'Build websites, Shopify stores, custom software and AI workflows with Nexadly. Technology and digital growth services for businesses in Canada, the US and beyond.',body:home()},'/products/':productIndex(),...Object.fromEntries(products.map(p=>[`/products/${p.slug}/`,renderProduct(p.slug)])),...pages,...legalPages};
await rm('dist',{recursive:true,force:true});await mkdir('dist',{recursive:true});await cp('public','dist',{recursive:true});
for(const [path,page] of Object.entries(routes)){const dir='dist'+path;await mkdir(dir,{recursive:true});await writeFile(dir+'index.html',shell(path,page,config));}
await writeFile('dist/404.html',shell('/404/',{title:'Page not found',description:'Find your way back to Nexadly.',body:'<section class="page-hero container"><p class="eyebrow">404 / A DIFFERENT DIRECTION</p><h1>Let’s get you<br>back on track.</h1><p class="lead">The page you are looking for is not here.</p><a class="button button-dark" href="/">Back to Nexadly →</a></section>'},config));
await writeFile('dist/sitemap.xml',renderSitemap(routes,config));
await writeFile('dist/robots.txt',renderRobots(config));
console.log(`Built ${Object.keys(routes).length} pages in dist/ (${config.publicIndexing?'public indexing enabled':'private preview; noindex'})`);
