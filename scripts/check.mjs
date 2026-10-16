import assert from 'node:assert/strict';
import {readdir,readFile,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {services} from '../src/pages.mjs';
import {companyAddress} from '../src/company.mjs';
import {createSiteConfig,renderSeo,renderSitemap,renderRobots,PRODUCTION_ORIGIN,ORGANIZATION_LOGO} from '../src/seo.mjs';

const review=process.argv.includes('--legal-review');
const root=resolve(review?'review-dist':'dist');
const policyPaths=['/privacy/','/terms/','/cookies/','/refund-cancellation/','/data-deletion/'];
const config=createSiteConfig();
const errors=[];
const titles=new Map();
const descriptions=new Map();
const crawlLinks=new Map();
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
assert.throws(()=>createSiteConfig({SITE_INDEXING:'public',SITE_ORIGIN:'https://example.com'}));
assert.throws(()=>createSiteConfig({SITE_INDEXING:'public',SITE_ORIGIN:'https://www.nexadly.com'}));
const publicFixture=createSiteConfig({SITE_INDEXING:'public',SITE_ORIGIN:PRODUCTION_ORIGIN+'/'});
assert.equal(publicFixture.origin,PRODUCTION_ORIGIN);
assert.equal(publicFixture.publicIndexing,true);
assert.match(renderRobots(publicFixture),/Sitemap: https:\/\/nexadly\.com\/sitemap.xml/);
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
  if(!/^<!doctype html>/i.test(html)||!/<html lang="en">/.test(html))errors.push(`${name}: document type or language missing`);
  if((html.match(/<title>/g)||[]).length!==1)errors.push(`${name}: expected one title`);
  if((html.match(/<meta name="description"/g)||[]).length!==1)errors.push(`${name}: expected one description`);
  if((html.match(/<meta name="robots"/g)||[]).length!==1)errors.push(`${name}: expected one robots directive`);
  if((html.match(/<h1[ >]/g)||[]).length!==1)errors.push(`${name}: expected one h1`);
  if((html.match(/<main[ >]/g)||[]).length!==1)errors.push(`${name}: expected one main`);
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
  if(ids.length!==new Set(ids).size)errors.push(`${name}: duplicate IDs`);
  if(/swiftupi\.ca/.test(html))errors.push(`${name}: incorrect SwiftUPI domain`);
  if(!review&&html.includes('data-legal-review="true"'))errors.push(`${name}: legal draft leaked into publication output`);
  if(/(?:company registered in|registered company in|our business is registered|is registered in India)/i.test(html))errors.push(`${name}: unverified incorporation claim`);
  if(/₹|\bINR\b|\bCAD\b/.test(html))errors.push(`${name}: non-USD corporate pricing`);
  if(/\bCanada\b|\bCanadian\b|\bUnited States\b|\bNorth America(?:n)?\b|\bUSA\b|\bthe US\b/.test(html))errors.push(`${name}: removed geographic targeting remains`);
  unique(decode(html.match(/<title>([^<]+)<\/title>/)?.[1]),titles,name,'title');
  unique(meta(html,'description'),descriptions,name,'description');
  const canonicals=[...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map(x=>decode(x[1]));
  if(canonicals.length!==1||canonicals[0]!==canonical)errors.push(`${name}: canonical does not match configured origin and route`);
  const robots=meta(html,'robots');
  if(!config.publicIndexing||path==='/404/'||policyPaths.includes(path)){
    if(robots!=='noindex,nofollow')errors.push(`${name}: private preview or 404 must remain noindex`);
  }else if(!robots.startsWith('index,follow'))errors.push(`${name}: public page indexing metadata missing`);
  if(meta(html,'og:url')!==canonical)errors.push(`${name}: Open Graph URL differs from canonical`);
  if(meta(html,'og:title')!==decode(html.match(/<title>([^<]+)<\/title>/)?.[1])||meta(html,'twitter:title')!==meta(html,'og:title'))errors.push(`${name}: social titles differ from the page title`);
  if(meta(html,'og:description')!==meta(html,'description')||meta(html,'twitter:description')!==meta(html,'description'))errors.push(`${name}: social descriptions differ from the page description`);
  if(meta(html,'twitter:card')!=='summary_large_image')errors.push(`${name}: social preview card type missing`);
  for(const key of ['og:title','og:description','og:site_name','og:image','og:image:alt','twitter:card','twitter:title','twitter:description','twitter:image','twitter:image:alt']){
    if(!meta(html,key))errors.push(`${name}: missing ${key}`);
  }
  for(const key of ['og:image','twitter:image']){
    const imageUrl=meta(html,key);
    if(imageUrl.startsWith(config.origin+'/'))await localTarget(new URL(imageUrl).pathname,path,name);
  }
  const socialImage=meta(html,'og:image');
  if(!socialImage.startsWith(config.origin+'/')||meta(html,'twitter:image')!==socialImage||meta(html,'og:image:secure_url')!==socialImage)errors.push(`${name}: social images must use the configured HTTPS origin`);
  else{
    const bytes=await readFile(join(root,new URL(socialImage).pathname));
    if(bytes.subarray(0,8).toString('hex')==='89504e470d0a1a0a'&&(meta(html,'og:image:type')!=='image/png'||Number(meta(html,'og:image:width'))!==bytes.readUInt32BE(16)||Number(meta(html,'og:image:height'))!==bytes.readUInt32BE(20)))errors.push(`${name}: social image dimensions or type do not match the asset`);
  }

  const scripts=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  if(path!=='/404/'){
    if(!policyPaths.includes(path))canonicalUrls.push(canonical);
    if(scripts.length!==1)errors.push(`${name}: expected one structured-data graph`);
    else try{
      const data=JSON.parse(scripts[0][1]);
      if(data['@context']!=='https://schema.org'||!Array.isArray(data['@graph']))throw new Error('invalid graph');
      const graph=data['@graph'];
      const page=graph.find(node=>['WebPage','AboutPage','ContactPage','CollectionPage'].includes(node['@type']));
      if(page?.url!==canonical)errors.push(`${name}: structured page URL differs from canonical`);
      if(/"(?:aggregateRating|review|legalName|taxID|vatID|iso6523Code|hasCredential|award)"/.test(scripts[0][1]))errors.push(`${name}: unapproved company or review schema`);
      const graphIds=graph.map(node=>node['@id']);
      if(graphIds.some(id=>!id?.startsWith(config.origin+'/'))||new Set(graphIds).size!==graphIds.length)errors.push(`${name}: invalid or duplicate structured-data identifiers`);
      const visitReferences=value=>{
        if(!value||typeof value!=='object')return;
        if(value['@id']&&!graphIds.includes(value['@id']))errors.push(`${name}: unresolved structured-data entity ${value['@id']}`);
        for(const child of Object.values(value))visitReferences(child);
      };
      visitReferences(graph);
      const org=graph.find(node=>node['@type']==='Organization');
      if(org?.name!=='Nexadly'||org?.email!=='hello@nexadly.com')errors.push(`${name}: approved organization details missing`);
      if(JSON.stringify(org?.address)!==JSON.stringify({'@type':'PostalAddress',...companyAddress}))errors.push(`${name}: company address differs from owner-provided details`);
      if(org?.areaServed)errors.push(`${name}: organization geographic targeting must remain absent`);
      const logo=graph.find(node=>node['@id']===org?.logo?.['@id']);
      if(logo?.contentUrl!==config.origin+ORGANIZATION_LOGO)errors.push(`${name}: organization logo is missing or disconnected`);
      else await localTarget(ORGANIZATION_LOGO,path,name);
      const website=graph.find(node=>node['@type']==='WebSite');
      if(website?.publisher?.['@id']!==org?.['@id']||page?.isPartOf?.['@id']!==website?.['@id'])errors.push(`${name}: website and publisher entities are disconnected`);
      const primaryImage=graph.find(node=>node['@id']===page?.primaryImageOfPage?.['@id']);
      if(primaryImage?.contentUrl!==socialImage)errors.push(`${name}: primary image differs from social preview`);
      if(path!=='/'){
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
        if(path==='/services/jio-advertising-solutions/'?service?.areaServed?.map(area=>area.name).join(',')!=='India':service?.areaServed!==undefined)errors.push(`${name}: service-specific availability must not introduce general geographic targeting`);
      }
      if(/^\/resources\/[^/]+\/$/.test(path)){
        const article=graph.find(node=>node['@type']==='Article');
        if(!article?.headline||article.mainEntityOfPage?.['@id']!==page?.['@id']||article.author?.['@id']!==org?.['@id'])errors.push(`${name}: resource author or article entity is disconnected`);
        if(article?.datePublished||article?.dateModified)errors.push(`${name}: resource dates require a verified editorial source`);
        if(meta(html,'og:type')!=='article')errors.push(`${name}: resource social type must be article`);
      }
    }catch(error){errors.push(`${name}: invalid structured data (${error.message})`);}
  }else if(scripts.length)errors.push(`${name}: 404 must not describe a real page in structured data`);

  for(const [,href]of html.matchAll(/(?:href|src)="([^"]+)"/g))await localTarget(decode(href),name==='/404.html'?name:path,name);
  crawlLinks.set(path,[...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match=>decode(match[1])).filter(href=>href.startsWith('/')&&!href.startsWith('//')).map(href=>new URL(href,config.origin).pathname));
  for(const match of html.matchAll(/<img\b[^>]*>/g)){
    if(!/\balt="[^"]*"/.test(match[0]))errors.push(`${name}: image missing alternative text`);
    if(!/\bwidth="\d+"/.test(match[0])||!/\bheight="\d+"/.test(match[0]))errors.push(`${name}: image dimensions missing`);
  }
}

for(const name of ['callvani','adgrowly','swiftupi','chair-manage']){
  const html=await readFile(join(root,'products',name,'index.html'),'utf8');
  if(!html.includes('target="_blank" rel="noopener noreferrer"'))errors.push(`${name}: official site link missing`);
}
const requiredServices=['Website Development','Mobile App Development','Custom Software Development','SaaS Development','AI Automation','AI Calling Solutions','WhatsApp Business Automation','Google Ads Management','Meta Ads Management','Jio Advertising Solutions','ChatGPT Advertising Solutions','Search Engine Optimization','Social Media Marketing','Branding and Graphic Design','Cloud Hosting and Server Management','API Integrations','E-commerce Development','CRM and ERP Development'];
for(const service of requiredServices)if(!services.some(item=>item.name===service))errors.push(`Required service missing: ${service}`);
const homeHtml=await readFile(join(root,'index.html'),'utf8');
for(const {slug}of services){
  await stat(join(root,'services',slug,'index.html')).catch(()=>errors.push(`Service page missing: ${slug}`));
  const footer=homeHtml.match(/<nav class="footer-service-directory"[\s\S]*?<\/nav>/)?.[0]||'';
  if(!footer.includes(`/services/${slug}/`))errors.push(`Service directory missing: ${slug}`);
}
for(const path of policyPaths){
  const html=await readFile(join(root,path,'index.html'),'utf8');
  const marker=review?'data-legal-review="true"':'data-policy-status="review-pending"';
  if(!html.includes(marker))errors.push(`${path}: missing legal review boundary`);
  if(!homeHtml.includes(`href="${path}"`))errors.push(`${path}: missing footer policy link`);
  if(!html.includes('mailto:hello@nexadly.com'))errors.push(`${path}: policy contact missing`);
}
const hosting=JSON.parse(await readFile('.openai/hosting.json','utf8'));
assert.equal(hosting.static.directory,'dist','Publishing must exclude review-dist');
const rejectedReview=spawnSync(process.execPath,['build.mjs','--legal-review'],{encoding:'utf8',env:{...process.env,SITE_INDEXING:'public',SITE_ORIGIN:'https://nexadly.com'}});
assert.notEqual(rejectedReview.status,0,'Public legal review builds must be rejected');
assert.match(rejectedReview.stderr,/Legal review drafts cannot be built with public indexing/);

const robots=await readFile(join(root,'robots.txt'),'utf8');
if(robots!==renderRobots(config))errors.push('robots.txt differs from the configured indexing mode');
const sitemap=await readFile(join(root,'sitemap.xml'),'utf8');
const sitemapUrls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match=>decode(match[1]));
const expectedUrls=config.publicIndexing?canonicalUrls:[];
if(JSON.stringify([...new Set(sitemapUrls)].sort())!==JSON.stringify(expectedUrls.sort())||sitemapUrls.length!==new Set(sitemapUrls).size)errors.push('Sitemap must contain every indexable canonical exactly once and no private/404 pages');
if(/<(?:lastmod|priority|changefreq)>/.test(sitemap))errors.push('Sitemap must not fabricate freshness dates or priority signals');
const reachable=new Set(['/']);
const queue=['/'];
while(queue.length){
  for(const path of crawlLinks.get(queue.shift())||[])if(crawlLinks.has(path)&&!reachable.has(path)){reachable.add(path);queue.push(path);}
}
for(const url of canonicalUrls)if(!reachable.has(new URL(url).pathname))errors.push(`Orphan page: ${url} cannot be reached through HTML links from the home page`);

if(errors.length){console.error([...new Set(errors)].join('\n'));process.exit(1);}
console.log(`PASS: ${files.length} HTML pages; ${checked} internal links/assets; ${reachable.size} crawl-reachable routes; approved address, unique metadata, connected structured data, social image dimensions, breadcrumbs, legal draft separation and ${config.publicIndexing?'public':'private'} indexing verified.`);
