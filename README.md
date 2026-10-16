# Nexadly corporate website

A standalone, dependency-free static website for Nexadly's technology, marketing and automation services. This nested repository does not modify the parent salon application.

## Run and check

```sh
npm run dev
npm run check
```

The regular preview runs at http://localhost:4377. Rebuild after source changes. `dist/` is the only publication directory.

## Legal review drafts

```sh
npm run review
npm run check:review
npm run dev:review
```

The local review site runs at http://localhost:4378 and uses `review-dist/`, which is ignored by Git and excluded from the hosting manifest. Its five policy pages have a prominent draft notice and unresolved review decisions. Corresponding Markdown drafts are in `legal-drafts/` for owner and legal review. They are not effective policies.

The ordinary build publishes only factual policy-status/contact pages at `/privacy/`, `/terms/`, `/cookies/`, `/refund-cancellation/` and `/data-deletion/`. These pages are noindex even when other pages are configured for public indexing. No draft terms, invented refund windows, deletion SLAs or unverified legal claims are included in the deployment artifact. A public-indexing build of the review site is explicitly rejected.

## Company and content facts

- Owner-provided company name: **Nexadly Technologies Private Limited**. The incorporation certificate has not been supplied or checked. No registration/incorporation claim, registry number, address or Canadian entity relationship is asserted. Organization structured data deliberately omits `legalName` until certificate verification.
- Positioning: **Technology, Marketing & Automation for Growth.**
- All 18 requested services have dedicated pages. Existing Shopify, Digital Marketing and UI/UX pages are retained, making 21 service pages. Each includes scoped capabilities, process, deliverables, FAQs and enquiry links.
- Corporate services are scoped through separate project proposals. Product subscriptions, accounts, support and policies belong to the relevant SaaS product; an implementation quote does not automatically include a subscription.
- Product domains: CallVani https://callvani.com, Adgrowly https://adgrowly.ca, ChairManage https://chairmanage.com and SwiftUPI https://swiftupi.com. Product detail slugs remain stable, including `/products/chair-manage/`.
- ChairManage feature content comes from the original user-supplied specification. SwiftUPI content retains previously sourced official product information; its site could not be fetched during the current update. No new features, regulated-payment claims or product prices are inferred.
- Corporate quotations use **USD**. No fixed amount has been approved in USD; pricing remains a custom project quote.
- The owner supplied the 100+ clients and Canada/US market statements. No customer quotations, partner badges, certifications, performance results or ratings are fabricated. Platform references describe services, not official endorsements.

## Contact and data flow

The approved enquiry email is **hello@nexadly.com**. The form builds a local `mailto:` draft for the visitor to review and send. A local `.txt` download is also available. Neither action submits form data to a Nexadly backend, and the site does not claim delivery. No custom analytics, advertising pixels or browser storage are implemented in the application code. External Google Fonts and the Sites hosting/access layer have their own processing.

WhatsApp is conditional on `NEXADLY_WHATSAPP_NUMBER`, an owner-approved international business number. The number is still missing; no placeholder link is published.

## Hosting and SEO

The existing Sites project remains owner-private and publishes only `dist/`. Default canonical URLs use the actual private preview origin, metadata is `noindex,nofollow`, robots disallows crawling, and its sitemap is intentionally empty. Titles, descriptions, social metadata, breadcrumbs and Organization/WebSite/WebPage/Service structured data are generated centrally.

The requested production domain is **https://nexadly.com**. It currently serves a different site. The accessible Vercel project named `nexadly` currently lists only `nexadly.vercel.app`; no custom-domain connection has been established by this update. Domain ownership, hosting destination and legal review must be resolved before a public launch. Do not equate the Sites preview with a deployment to nexadly.com.

After that launch is approved and routed, set `SITE_ORIGIN=https://nexadly.com` and `SITE_INDEXING=public` for the appropriate production build. This enables public sitemap and robots output for normal content while the unapproved policy-status pages remain noindex. Do not change the hosting manifest to `review-dist`.

## Design and assets

Preserve the approved olive/lime ribbon logo, TM, company subtitle and original brand tagline. The logo PNG files in `public/assets/` were generated from the user's reference with the built-in image generation tool; prompts are retained in `branding/ribbon-logo-prompts.md`. Earlier SVG artwork is retained as history but is not the active site branding.

The original glass hero image and labelled product concepts are illustrative, not office photographs, client work or live product data. Motion includes scroll reveals, hover transitions and reduced-motion support. Navigation, forms and product links support keyboard interaction; review desktop and mobile layouts after structural changes.

## Source layout

- `src/home.mjs`: home and product overview.
- `src/pages.mjs`: service catalog, About, Solutions, industries, pricing and contact.
- `src/products.mjs`: product content and illustrative interfaces.
- `src/legal.mjs`: safe policy notices and separate review draft renderers.
- `legal-drafts/`: substantive Markdown drafts and review evidence.
- `src/shell.mjs`: shared navigation and complete service/product/legal footer.
- `src/seo.mjs`: canonical and search metadata.
- `public/`: deployed assets, styles and browser interaction code.
- `build.mjs`: publication/review output isolation.
- `scripts/check.mjs`: route, link, metadata, claim and draft-isolation checks.
