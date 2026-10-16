# Nexadly corporate website

A standalone, dependency-free, statically generated marketing site. The existing salon application in the parent checkout is not modified.

## Run locally

```sh
npm run dev
```

Open http://localhost:4377. Run `npm run build` after changes; `npm run check` checks built page structure, internal links and local assets. Production files are in `dist/`.

## Content and scope

- Homepage and complete services, solutions, industries, pricing, company and resources pages.
- Four dedicated product pages: CallVani, Adgrowly, SwiftUPI and Chair Manage.
- Latest approved SwiftUPI domain: **https://swiftupi.com**. Product details are based on the public official website; payment verification depends on the configured source. No pricing or regulated-payment guarantees are asserted.
- Chair Manage capabilities come from the user-supplied approved specification.
- CallVani and Adgrowly reference their official websites and the supplied specification. Illustrative product UI is explicitly labelled and is not presented as production usage or customer results.
- Nexadly Private Limited is a proposed company name; incorporation is not represented as complete.
- Prices, client logos, client testimonials, guaranteed results and unverified affiliations are not fabricated.

## Contact behavior

The approved enquiry address is **hello@nexadly.com**. The consultation form prepares a `mailto:` enquiry for the visitor to review and send from their own email application. A local `.txt` download is provided as a fallback. The site does not claim to deliver mail itself, and it does not store form data or send form data to a server. SMTP/API delivery would require a separate verified provider integration.

## Publication

This project is registered as an owner-private Sites website. The `.openai/hosting.json` file stores that Site identity, with `dist` as the static directory. Preview pages deliberately use `noindex,nofollow`; robots.txt disallows crawling. The default canonical origin is the private Site URL. Before a public Nexadly launch, confirm the custom domain, indexing settings, company details and current product availability. Set `SITE_ORIGIN` when building for another verified domain.

## Design and assets

Design reference: https://upmind-temlis.webflow.io/home/home-v1. Original implementation follows the reference's editorial rhythm, full-bleed hero, olive/lime palette, pill buttons, airy typography and generous sections. Original SVG/CSS product visuals and Nexadly brand mark are authored for this project.

`public/assets/nexadly-hero.png` is an original AI-generated image created with the built-in image generation tool. Its exact prompt is retained in `public/assets/hero-prompt.txt`. It is decorative art, not a company office or product screenshot. Fonts use Google Fonts (DM Sans and IBM Plex Mono), with local system fallbacks.

Content references checked on 16 October 2026:

- User-supplied Nexadly master brief.
- https://callvani.com
- https://adgrowly.ca
- https://swiftupi.com

## Source layout

- `src/home.mjs`: home and product overview pages.
- `src/shell.mjs`: navigation, metadata and footer.
- `src/products.mjs`: product content and original visual components.
- `src/pages.mjs`: services, industries, company, guides and contact.
- `public/`: CSS, interaction script and original assets.
- `build.mjs`: static generation, sitemap and private-preview indexing settings.
- `serve.mjs`: loopback-only development server with proper 404 handling.
