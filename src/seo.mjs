import {escape} from './ui.mjs';

export const PREVIEW_ORIGIN = 'https://nexadly-digital.sidharthkumar2028.chatgpt.site';
const marketCountries = [{ '@type': 'Country', name: 'Canada' }, { '@type': 'Country', name: 'United States' }];
const sectionNames = {
  services: 'Services', products: 'Products', solutions: 'Solutions', industries: 'Industries',
  pricing: 'Pricing', about: 'About Nexadly', resources: 'Resources', contact: 'Contact',
  privacy: 'Privacy Policy', terms: 'Terms of Use', 'privacy-policy': 'Privacy Policy',
  'terms-and-conditions': 'Terms and Conditions', 'terms-of-service': 'Terms of Service',
};
const productNames = { callvani: 'CallVani', adgrowly: 'Adgrowly', swiftupi: 'SwiftUPI', 'chair-manage': 'Chair Manage' };
const cleanText = (value = '') => String(value).replace(/\s+/g, ' ').trim();
const shortTitle = (page) => cleanText(page.seo?.name || page.title?.split(/\s[|—]\s/)[0]);
const absolute = (path, origin) => new URL(path, `${origin}/`).href;
const serialize = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

// Public indexing is a separate launch decision; an ordinary preview build cannot enable it.
export function createSiteConfig(env = process.env) {
  const requestedMode = env.SITE_INDEXING || 'private';
  if (!['private', 'public'].includes(requestedMode)) throw new Error('SITE_INDEXING must be private or public.');
  const input = env.SITE_ORIGIN || PREVIEW_ORIGIN;
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('SITE_ORIGIN must be an HTTPS origin without credentials, a path, query or fragment.');
  }
  const publicIndexing = requestedMode === 'public';
  if (publicIndexing && (!env.SITE_ORIGIN || url.hostname.endsWith('.chatgpt.site') || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('Public indexing requires an explicit production SITE_ORIGIN outside the private preview host.');
  }
  return Object.freeze({ origin: url.origin, publicIndexing });
}

function breadcrumbItems(path, page) {
  if (path === '/' || path === '/404/') return [];
  const segments = path.split('/').filter(Boolean);
  const items = [{ name: 'Home', path: '/' }];
  if (segments.length > 1) items.push({ name: sectionNames[segments[0]] || segments[0], path: `/${segments[0]}/` });
  const name = productNames[segments.at(-1)] || (segments.length === 1 && sectionNames[segments[0]]) || shortTitle(page);
  items.push({ name, path });
  return items;
}

export function renderBreadcrumbs(path, page) {
  // Product detail templates already show the same Home > Products > Product trail.
  if (/^\/products\/[^/]+\/$/.test(path)) return '';
  const items = breadcrumbItems(path, page);
  if (!items.length) return '';
  return `<nav class="site-breadcrumb container" aria-label="Breadcrumb"><ol>${items.map((item, index) => `<li>${index === items.length - 1 ? `<span aria-current="page">${escape(item.name)}</span>` : `<a href="${escape(item.path)}">${escape(item.name)}</a>`}</li>`).join('')}</ol></nav>`;
}

export function renderSeo(path, page, config) {
  const { origin, publicIndexing = false } = config;
  const canonical = absolute(path, origin);
  const title = cleanText(page.title) + (/\bNexadly\b/i.test(page.title) ? '' : ' | Nexadly');
  const description = cleanText(page.description);
  const image = absolute(page.seo?.image || '/assets/nexadly-hero.png', origin);
  const imageAlt = page.seo?.imageAlt || 'Original abstract Nexadly brand artwork';
  const indexable = publicIndexing && path !== '/404/' && !page.seo?.noindex;
  const crumbs = breadcrumbItems(path, page);
  const organizationId = `${origin}/#organization`;
  const websiteId = `${origin}/#website`;
  const pageId = `${canonical}#webpage`;
  const graph = [];

  if (path === '/') {
    graph.push({
      '@type': 'Organization', '@id': organizationId, name: 'Nexadly', legalName: 'Nexadly Technologies Private Limited', url: `${origin}/`,
      logo: absolute('/assets/nexadly-logo.svg', origin), email: 'hello@nexadly.com',
      description: 'Websites, Shopify stores, custom software, AI automation and digital growth services for businesses in Canada, the United States and beyond.',
      areaServed: marketCountries,
      contactPoint: { '@type': 'ContactPoint', contactType: 'Sales enquiries', email: 'hello@nexadly.com' },
    });
    graph.push({ '@type': 'WebSite', '@id': websiteId, name: 'Nexadly', url: `${origin}/`, publisher: { '@id': organizationId }, inLanguage: 'en' });
  }

  if (path !== '/404/') {
    const webpage = {
      '@type': path === '/about/' ? 'AboutPage' : path === '/contact/' ? 'ContactPage' : 'WebPage',
      '@id': pageId, name: title, description, url: canonical,
      isPartOf: { '@id': websiteId }, inLanguage: 'en',
    };
    if (crumbs.length) {
      webpage.breadcrumb = { '@id': `${canonical}#breadcrumb` };
      graph.push({ '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`, itemListElement: crumbs.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: item.name, item: absolute(item.path, origin) })) });
    }
    if (/^\/services\/[^/]+\/$/.test(path)) {
      webpage.mainEntity = { '@id': `${canonical}#service` };
      graph.push({
        '@type': 'Service', '@id': `${canonical}#service`, name: page.seo?.name || shortTitle(page),
        serviceType: page.seo?.serviceType || shortTitle(page), description, url: canonical,
        provider: { '@id': organizationId }, areaServed: page.seo?.areaServed?.map(name => ({ '@type': 'Country', name })) || marketCountries,
        mainEntityOfPage: { '@id': pageId },
      });
    }
    graph.push(webpage);
  }

  return `<title>${escape(title)}</title>
<meta name="description" content="${escape(description)}">
<meta name="robots" content="${indexable ? 'index,follow,max-image-preview:large' : 'noindex,nofollow'}">
<link rel="canonical" href="${escape(canonical)}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Nexadly">
<meta property="og:title" content="${escape(title)}">
<meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${escape(canonical)}">
<meta property="og:image" content="${escape(image)}">
<meta property="og:image:alt" content="${escape(imageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escape(title)}">
<meta name="twitter:description" content="${escape(description)}">
<meta name="twitter:image" content="${escape(image)}">
<meta name="twitter:image:alt" content="${escape(imageAlt)}">
${graph.length ? `<script type="application/ld+json">${serialize({ '@context': 'https://schema.org', '@graph': graph })}</script>` : ''}`;
}

export function renderSitemap(routes, config) {
  const paths = config.publicIndexing ? Object.entries(routes).filter(([path, page]) => path !== '/404/' && !page.seo?.noindex).map(([path]) => path) : [];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${escape(absolute(path, config.origin))}</loc></url>`).join('\n')}\n</urlset>\n`;
}

export function renderRobots(config) {
  return config.publicIndexing
    ? `User-agent: *\nAllow: /\nSitemap: ${config.origin}/sitemap.xml\n`
    : 'User-agent: *\nDisallow: /\n';
}
