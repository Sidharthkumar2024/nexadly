import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createSiteConfig,renderSeo,renderSitemap,renderRobots} from '../src/seo.mjs';

const root=resolve('dist');
const config=createSiteConfig();
const errors=[];
const titles=new Map();
const descriptions=new Map();
let checked=0;

async function walk(dir){
  const out=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const path=join(dir,entry.name);
    if(entry.isDirectory())out.push(...await walk(path));
    else if(path.endsWith('.html'))out.push(path);
  }
  return out;
}
const decode=(text='')=>text.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&lt;','<').replaceAll('&gt;','>');
const meta=(html,key)=>decode(html.match(new RegExp(`<meta (?:name|property)="${key}" content="([^"]*)"`))?.[1]);
function unique(value,seen,name,type){
  if(!value.trim())errors.push(`${name}: missing ${type}`);
  else if(seen.has(value))errors.push(`${name}: duplicate ${type} with ${seen.get(value)}`);
  else seen.set(value,name);
}
async function localTarget(href,from,name){
  if(!href.startsWith('/')&&!href.startsWith('#'))return;
  checked++;
  const u=new URL(href,`https://test.local${from}`);
  let target=join(root,decodeURIComponent(u.pathname));
  try{
    if((await stat(target)).isDirectory())target=join(target,'index.html');
    await stat(target);
    if(u.hash){
      const targetHtml=await readFile(target,'utf8');
      if(!targetHtml.includes(`id="${decodeURIComponent(u.hash.slice(1))}"`))errors.push(`${name}: missing anchor ${href}`);
    }
  }catch{errors.push(`${name}: missing link/asset ${href}`);}
}

// Guard the launch switch independently of the current environment.
assert.equal(createSiteConfig({}).publicIndexing,false);
assert.throws(()=>createSiteConfig({SITE_INDEXING:'public'}));
assert.throws(()=>createSiteConfig({SITE_INDEXING:'public',SITE_ORIGIN:'https://nexadly-digital.sidharthkumar2028.chatgpt.site'}));
assert.throws(()=>createSiteConfig({SITE_ORIGIN:'https://example.com/subpath'}));
assert.throws(()=>createSiteConfig({SITE_ORIGIN:'http://example.com'}));
const publicFixture=createSiteConfig({SITE_INDEXING:'public',SITE_ORIGIN:'https://example.com/'});
assert.equal(publicFixture.origin,'https://example.com');
assert.equal(publicFixture.publicIndexing,true);
assert.match(renderRobots(publicFixture),/Sitemap: https:\/\/example\.com\/sitemap.xml/);
const unsafeText={title:'Example </script><script>invalid</script>',description:'A quotation: "safe" & a useful summary.'};
const escapedHead=renderSeo('/services/example/',unsafeText,publicFixture);
assert.ok(!escapedHead.includes('</script><script>invalid'));
assert.match(renderSeo('/404/',unsafeText,publicFixture),/content="noindex,nofollow"/);
const sitemapFixture=renderSitemap({'/':{},'/404/':{},'/hidden/':{seo:{noindex:true}}},publicFixture);
assert.equal((sitemapFixture.match(/<loc>/g)||[]).length,1);
assert.ok(!sitemapFixture.includes('/hidden/')&&!sitemapFixture.includes('/404/'));

const contact=await readFile(join(root,'contact/index.html'),'utf8');
if((contact.match(/<option[ >]/g)||[]).length<10)errors.push('Consultation options missing');
const files=await walk(root);
const canonicalUrls=[];
for(const file of files){
  const html=await readFile(file,'utf8');
  const name=file.slice(root.length);
  const path=name==='/404.html'?'/404/':name.replace(/index\.html$/,'');
  const canonical=`${config.origin}${path}`;
  if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${name}: expected one h1`);
  if((html.match(/<main[ >]/g)||[]).length!==1)errors.push(`${name}: expected one main`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  if(ids.length!==new Set(ids).size)errors.push(`${name}: duplicate IDs`);
  if(/swiftupi\.ca/.test(html))errors.push(`${name}: incorrect SwiftUPI domain`);
  unique(decode(html.match(/<title>([^<]+)<\/title>/)?.[1]),titles,name,'title');
  unique(meta(html,'description'),descriptions,name,'description');
  const canonicals=[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(x=>decode(x[1]));
  if(canonicals.length!==1||canonicals[0]!==canonical)errors.push(`${name}: canonical does not match configured origin and route`);
  const robots=meta(html,'robots');
  if(!config.publicIndexing||path==='/404/'){
    if(robots!=='noindex,nofollow')errors.push(`${name}: private preview or 404 must remain noindex`);
  }else if(!robots.startsWith('index,follow'))errors.push(`${name}: public page indexing metadata missing`);
  if(meta(html,'og:url')!==canonical)errors.push(`${name}: Open Graph URL differs from canonical`);
  for(const key of ['og:title','og:description','og:site_name','og:image','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt']){
    if(!meta(html,key))errors.push(`${name}: missing ${key}`);
  }
  for(const key of ['og:image','twitter:image']){
    const imageUrl=meta(html,key);
    if(imageUrl.startsWith(config.origin+'/'))await localTarget(new URL(imageUrl).pathname,path,name);
  }

  const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if(path!=='/404/'){
    canonicalUrls.push(canonical);
    if(scripts.length!==1)errors.push(`${name}: expected one structured-data graph`);
    else try{
      const data=JSON.parse(scripts[0][1]);
      if(data['@context']!=='https://schema.org'||!Array.isArray(data['@graph']))throw new Error('invalid graph');
      const graph=data['@graph'];
      const page=graph.find(node=>['WebPage','AboutPage','ContactPage'].includes(node['@type']));
      if(page?.url!==canonical)errors.push(`${name}: structured page URL differs from canonical`);
      if(/"(?:aggregateRating|review|taxID|address)"/.test(scripts[0][1]))errors.push(`${name}: unapproved company or review schema`);
      if(path==='/'){
        const org=graph.find(node=>node['@type']==='Organization');
        if(org?.name!=='Nexadly'||org?.legalName!=='Nexadly Technologies Private Limited'||org?.email!=='hello@nexadly.com')errors.push(`${name}: approved organization details missing`);
        if(org?.logo?.startsWith(config.origin+'/'))await localTarget(new URL(org.logo).pathname,path,name);
        if(!graph.some(node=>node['@type']==='WebSite'))errors.push(`${name}: WebSite schema missing`);
      }else{
        const breadcrumb=graph.find(node=>node['@type']==='BreadcrumbList');
        if(!breadcrumb||breadcrumb.itemListElement.length<2)errors.push(`${name}: breadcrumb schema missing`);
        else{
          if(breadcrumb.itemListElement.at(-1).item!==canonical)errors.push(`${name}: breadcrumb endpoint differs from canonical`);
          for(const [index,item] of breadcrumb.itemListElement.entries())if(item.position!==index+1||!item.name)errors.push(`${name}: invalid breadcrumb item`);
        }
        if((html.match(/aria-label="Breadcrumb"/g)||[]).length!==1)errors.push(`${name}: expected one visible breadcrumb trail`);
      }
      if(/^\/services\/[^/]+\/$/.test(path)){
        const service=graph.find(node=>node['@type']==='Service');
        if(!service?.name||service.url!==canonical||service.provider?.['@id']!==`${config.origin}/#organization`)errors.push(`${name}: service schema missing or disconnected`);
        if(service?.areaServed?.map(area=>area.name).join(',')!==(path==='/services/jio-advertising-solutions/'?'India':'Canada,United States'))errors.push(`${name}: service markets missing`);
      }
    }catch(error){errors.push(`${name}: invalid structured data (${error.message})`);}
  }else if(scripts.length)errors.push(`${name}: 404 must not describe a real page in structured data`);

  for(const [,href]of html.matchAll(/(?:href|src)="([^"]+)"/g))await localTarget(decode(href),name==='/404.html'?name:path,name);
}

for(const name of ['callvani','adgrowly','swiftupi','chair-manage']){
  const html=await readFile(join(root,'products',name,'index.html'),'utf8');
  if(!html.includes('target="_blank" rel="noopener noreferrer"'))errors.push(`${name}: official site link missing`);
}
await stat(join(root,'services/shopify-development/index.html')).catch(()=>errors.push('Shopify service page missing'));
const robots=await readFile(join(root,'robots.txt'),'utf8');
if(robots!==renderRobots(config))errors.push('robots.txt differs from the configured indexing mode');
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>decode(match[1]));
const expectedUrls=config.publicIndexing?canonicalUrls:[];
if(JSON.stringify([...new Set(sitemapUrls)].sort())!==JSON.stringify(expectedUrls.sort())||sitemapUrls.length!==new Set(sitemapUrls).size)errors.push('Sitemap must contain every indexable canonical exactly once and no private/404 pages');

if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}
console.log(`PASS: ${files.length} HTML pages; ${checked} internal links/assets; page structure, unique metadata, structured data, breadcrumbs and ${config.publicIndexing?'public':'private'} indexing verified.`);
