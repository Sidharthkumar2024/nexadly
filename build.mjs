import {mkdir,writeFile,cp,rm,readFile} from 'node:fs/promises';
import {shell} from './src/shell.mjs';
import {home,productIndex} from './src/home.mjs';
import {products,renderProduct} from './src/products.mjs';
import {pages} from './src/pages.mjs';
import {legalPages,reviewLegalPages} from './src/legal.mjs';
import {createSiteConfig,renderSitemap,renderRobots,DEFAULT_SOCIAL_IMAGE,ORGANIZATION_LOGO} from './src/seo.mjs';
const review=process.argv.includes('--legal-review');
if(process.argv.slice(2).some(arg=>arg!=='--legal-review'))throw new Error('Unknown build argument.');
if(review&&process.env.SITE_INDEXING==='public')throw new Error('Legal review drafts cannot be built with public indexing.');
// Read image dimensions from the source assets, so social previews and structured
// image data stay accurate when approved brand artwork is replaced.
const images={};
for(const path of [DEFAULT_SOCIAL_IMAGE,ORGANIZATION_LOGO]){
  const bytes=await readFile(`public${path}`);
  if(bytes.length<24||bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw new Error(`Expected a PNG brand asset: ${path}`);
  images[path]={width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
}
const config={...createSiteConfig(),images};
const output=review?'review-dist':'dist';
const routes={'/':{title:'Nexadly | Website Development, AI & Digital Marketing',description:'Nexadly provides website and software development, AI automation, digital marketing and SaaS products. Explore services or discuss your next project.',body:home()},'/products/':productIndex(),...Object.fromEntries(products.map(p=>[`/products/${p.slug}/`,renderProduct(p.slug)])),...pages,...(review?reviewLegalPages:legalPages)};
await rm(output,{recursive:true,force:true});await mkdir(output,{recursive:true});await cp('public',output,{recursive:true});
for(const [path,page] of Object.entries(routes)){const dir=output+path;await mkdir(dir,{recursive:true});await writeFile(dir+'index.html',shell(path,page,config));}
await writeFile(output+'/404.html',shell('/404/',{title:'Page not found',description:'Find your way back to Nexadly.',body:'<section class="page-hero container"><p class="eyebrow">404 / A DIFFERENT DIRECTION</p><h1>Let’s get you<br>back on track.</h1><p class="lead">The page you are looking for is not here.</p><a class="button button-dark" href="/">Back to Nexadly →</a></section>'},config));
await writeFile(output+'/sitemap.xml',renderSitemap(routes,config));
await writeFile(output+'/robots.txt',renderRobots(config));
console.log(`Built ${Object.keys(routes).length} pages in ${output}/ (${review?'LOCAL LEGAL REVIEW ONLY; noindex':config.publicIndexing?'public indexing enabled':'private preview; noindex'})`);
