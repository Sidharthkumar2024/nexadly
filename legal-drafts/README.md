# Corporate policy review pack

**DRAFTS FOR REVIEW — NOT IN EFFECT**

These are proposed policies for Nexadly's corporate website and service enquiries. They do not establish legal compliance, verify incorporation or create product policies. They have no effective date. No unapproved draft is part of the normal website output.

## Documents

| Draft | Corporate route | Current public treatment |
| --- | --- | --- |
| [Privacy Policy](privacy-policy.md) | `/privacy/` | Policy-under-review information page |
| [Terms and Conditions](terms-and-conditions.md) | `/terms/` | Policy-under-review information page |
| [Cookie Policy](cookie-policy.md) | `/cookies/` | Policy-under-review information page |
| [Refund and Cancellation Policy](refund-and-cancellation-policy.md) | `/refund-cancellation/` | Policy-under-review information page |
| [Data Deletion Policy](data-deletion-policy.md) | `/data-deletion/` | Policy-under-review information page |

`src/legal.mjs` is the shared content source. `legalPages` contains holding pages. `reviewLegalPages` contains the substantive drafts with visible draft and unresolved-decision markers. `npm run build` uses only holding pages. `npm run review` produces a separate, ignored `review-dist/` for local review. Do not deploy that directory. Drafts are not downloadable from the normal website.

## Confirmed implementation inventory

Code inspected on 16 October 2026; this is a review date, not a policy effective date. These findings apply only to the prepared Sites version in this repository. The intended domain nexadly.com currently serves a different website; its backend, forms, hosting, cookies and data handling have not been audited here. Do not apply this inventory to that separate deployment or connect the domain without reviewing the actual production setup.

| Area | Evidence | Scope of finding |
| --- | --- | --- |
| Contact form | `public/app.js`, `src/pages.mjs` | Name, email, optional company, interest and message are used to prepare a `mailto:hello@nexadly.com` URL. The visitor must send from their email app. |
| Brief download | `public/app.js` | A `Blob` text file is generated locally; downloading does not deliver the enquiry. |
| Browser persistence | `public/app.js` | No app cookie setter, localStorage or sessionStorage persistence for the form. This does not inventory host or browser-managed state. |
| Analytics/advertising | `public/app.js`, `src/shell.mjs` | No custom analytics script or advertising pixel in the reviewed application. Recheck before public launch and after integrations change. |
| Font requests | `public/styles.css` | External Google Fonts import for DM Sans and IBM Plex Mono. |
| Site hosting | `.openai/hosting.json` and existing private preview | Current preview is on ChatGPT Sites; account authentication is handled by the platform. Production hosting, logs, contract and data locations need confirmation. |
| Payments/accounts | Current corporate application | No corporate checkout, customer login, direct form backend or enquiry database. This finding does not cover linked SaaS products. |
| Company name | Direct owner statement | **Nexadly Technologies Private Limited** is owner-provided; no certificate or registration evidence has been reviewed. |
| Canada | Direct owner statement | Owner says registered in Canada under Adgrowly. Exact legal entity, registration and relationship to Nexadly are unverified. |
| Currency | Direct owner instruction | Corporate quotations use USD. No fixed USD package amount or universal refund rule has been approved. |

## Publication checklist

- [ ] Match the full legal name exactly to the official incorporation certificate. Confirm incorporation status before calling the entity incorporated or registered.
- [ ] Confirm the website operator, contracting entity, data controller, authorized signatory and required business disclosures. Add only verified registration details and contact/address information.
- [ ] Verify Adgrowly's Canadian legal identity and its relationship to the corporate business. Do not infer branch, subsidiary, affiliate, controller or contracting status.
- [ ] Confirm the production domain and host, including migration from the different current nexadly.com site. Re-audit the deployed version rather than treating this preview inventory as evidence of the existing production backend. Inventory host logs, site cookies, external resources, access permissions, processing locations and provider contracts.
- [ ] Identify email, CRM, project-management and storage providers actually used after an enquiry arrives. Confirm staff access and any contractor disclosure.
- [ ] Approve processing purposes, applicable grounds, retention periods, safeguards, international-transfer arrangements, complaint routes, any required privacy officer/representative, and treatment of minors' information.
- [ ] Complete the production cookie/storage inventory and determine required controls before adding optional tracking. Decide whether to self-host fonts.
- [ ] Approve a corporate request workflow: responsible person, monitored inbox, proportionate identity checks, applicable deadlines, exceptions, provider coordination, backups and audit records.
- [ ] Approve project terms: currency, pricing, taxes, payment stages, deposits, cancellation, refunds, third-party costs, acceptance, changes, support, IP, confidentiality, warranties and dispute handling. Do not invent automatic entitlements, exclusions, deadlines or governing jurisdictions.
- [ ] Review applicability of Indian, Canadian/provincial, US/state and other laws for actual entities, clients, visitors and activities. Marketing target countries alone do not settle applicability. Check current commencement schedules as well as enacted rules.
- [ ] Validate SaaS legal operators and policy/support routes separately for Adgrowly, CallVani, ChairManage and SwiftUPI. Corporate policy publication must not be represented as completing those products' legal requirements.
- [ ] Have the owner and qualified legal reviewer resolve every marked issue, approve an effective date and preserve the final approval record. Replace holding pages only with approved text; align actual operations with the promises made.
- [ ] Rebuild and review responsive rendering, links, request contact, noindex status as appropriate, and absence of residual unverified claims before publication.

## Official review references

These sources informed the limited provider facts and review questions. They do not verify Nexadly's identity or operations, determine which law applies, or establish compliance. Reviewed 16 October 2026. Summaries below are deliberately narrow; check current official text during final review.

- [Google Fonts: Your Privacy and Google Fonts](https://fonts.googleblog.com/2022/11/your-privacy-and-google-fonts.html). Supports the statement that delivering external font files exposes the requesting IP address to Google. It is not evidence of Nexadly's own cookie inventory.
- [OpenAI Privacy Policy](https://openai.com/policies/privacy-policy/). Provider reference for platform account, technical data and privacy controls. It is not a site-specific hosting contract or data-processing agreement; use the regional version relevant to the provider relationship.
- [OpenAI Cookie Policy](https://openai.com/policies/cookie-policy/). Describes provider use of cookies, including authentication and security. Its full provider table must not be copied as if all entries occur on this corporate site.
- [Office of the Privacy Commissioner of Canada: Personal Information Retention and Disposal](https://www.priv.gc.ca/en/privacy-topics/privacy-for-businesses/appropriate-handling-of-personal-information/gd_rd_201406/). Informs the review checklist for purpose-based retention, copies/backups, disposal and provider handling. No universal retention period has been adopted for Nexadly.
- [MeitY: Digital Personal Data Protection Rules 2025](https://www.meity.gov.in/documents/act-and-policies/digital-personal-data-protection-rules-2025-gDOxUjMtQWa?pageTitle=Digital-Personal-Data-Protection-Rules-2025). Official starting point for review of Indian notices, rules and commencement materials. No claim is made here that every obligation is in force for this business or that the draft satisfies it.

This pack is a review aid. A qualified reviewer should assess the applicable laws, actual operations and project agreements before the documents are made effective.
