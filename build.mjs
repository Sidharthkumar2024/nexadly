import {mkdir,writeFile,cp,rm} from 'node:fs/promises';
import {shell} from './src/shell.mjs';
import {home,productIndex} from './src/home.mjs';
import {products,renderProduct} from './src/products.mjs';
import {pages} from './src/pages.mjs';
import {legalPages,reviewLegalPages} from './src/legal.mjs';
import {createSiteConfig,renderSitemap,renderRobots} from './src/seo.mjs';
const review=process.argv.includes('--legal-review');
if(process.argv.slice(2).some(arg=>arg!=='--legal-review'))throw new Error('Unknown build argument.');
if(review&&process.env.SITE_INDEXING==='public')throw new Error('Legal review drafts cannot be built with public indexing.');
const config=createSiteConfig();
const output=review?'review-dist':'dist';
const routes={'/':{title:'Nexadly | Technology, Marketing & Automation for Growth',description:'Website and software development, AI automation, digital marketing and SaaS products. Discover Nexadly’s corporate services for Canada, the US and beyond.',body:home()},'/products/':productIndex(),...Object.fromEntries(products.map(p=>[`/products/${p.slug}/`,renderProduct(p.slug)])),...pages,...(review?reviewLegalPages:legalPages)};
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});await cp('public',output,{recursive:true});
for(const [path,page] of Object.entries(routes)){const dir=output+path;await mkdir(dir,{recursive:true});await writeFile(dir+'index.html',shell(path,page,config));}
await writeFile(output+'/404.html',shell('/404/',{title:'Page not found',description:'Find your way back to Nexadly.',body:'<section class="page-hero container"><p class="eyebrow">404 / A DIFFERENT DIRECTION</p><h1>Let’s get you<br>back on track.</h1><p class="lead">The page you are looking for is not here.</p><a class="button button-dark" href="/">Back to Nexadly →</a></section>'},config));
await writeFile(output+'/sitemap.xml',renderSitemap(routes,config));
await writeFile(output+'/robots.txt',renderRobots(config));
console.log(`Built ${Object.keys(routes).length} pages in ${output}/ (${review?'LOCAL LEGAL REVIEW ONLY; noindex':config.publicIndexing?'public indexing enabled':'private preview; noindex'})`);
