const arrow = '<span aria-hidden="true">↗</span>';
const icons = {
  voice: '<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/>',
  phone: '<path d="m5 3 4 4-2 3a15 15 0 0 0 7 7l3-2 4 4-2 3C10 22 2 14 2 5Z"/>',
  nodes: '<rect x="3" y="3" width="6" height="6" rx="2"/><rect x="15" y="15" width="6" height="6" rx="2"/><path d="M9 6h6a3 3 0 0 1 3 3v6M6 9v9h9"/>',
  chart: '<path d="M4 3v17h17M8 15l4-5 4 3 5-8"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18m-13 4h2m4 0h2m-8 3h2"/>',
  team: '<circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 4a3 3 0 0 1 0 6m2 11v-3a6 6 0 0 0-3-5"/>',
  sparkle: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
  location: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2"/>',
  message: '<path d="M20 14a4 4 0 0 1-4 4H8l-5 4V6a4 4 0 0 1 4-4h9a4 4 0 0 1 4 4Z"/><path d="M7 7h9m-9 5h6"/>',
  bag: '<rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V6a4 4 0 0 1 8 0v1M8 12h8"/>',
  heart: '<path d="M20 4a5 5 0 0 0-8 1 5 5 0 0 0-8-1C-1 9 12 21 12 21S25 9 20 4Z"/>',
  layers: '<path d="m12 2 10 6-10 6L2 8Zm-9 11 9 6 9-6M3 18l9 5 9-5"/>',
  link: '<path d="m10 13 4-4M8 15l-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0m2 8a3 3 0 0 0 4 0l5-5a3 3 0 0 0-4-4l-2 2"/>',
};
const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.sparkle}</svg>`;
const escape = (value) => String(value).replace(/[&<>"']/g, (s) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[s]));
const external = (p, label = `Visit ${p.name}`) => `<a class="button button-dark" href="${p.domain}" target="_blank" rel="noopener noreferrer">${label} ${arrow}</a>`;

export const products = [
  { slug: 'callvani', name: 'CallVani', category: 'AI voice & conversations', summary: 'Natural conversations. Thoughtful follow-ups. One connected calling workspace.', domain: 'https://callvani.com', color: '#e5ecb5' },
  { slug: 'adgrowly', name: 'Adgrowly', category: 'Local visibility & growth', summary: 'Bring your Google Business Profiles, content and customer reviews into focus.', domain: 'https://adgrowly.ca', color: '#dcf0db' },
  { slug: 'swiftupi', name: 'SwiftUPI', category: 'UPI links & collection management', summary: 'Bring payment links, order-specific UPI QR requests and collection records into one organised workflow.', domain: 'https://swiftupi.com', color: '#c9e9e7' },
  { slug: 'chair-manage', name: 'ChairManage', category: 'Salon & beauty operations', summary: 'A more organised salon day, from the first appointment to the final checkout.', domain: 'https://chairmanage.com', color: '#e6dcf4' },
];

const details = {
  callvani: {
    headline: 'Better conversations.\nSmarter next steps.',
    description: 'Give your business a voice that listens. CallVani brings AI calling, lead qualification and follow-ups together to help your team move every conversation forward.',
    intro: 'AI-powered voice conversations that drive business forward.',
    introText: 'Customers speak naturally. Your team gets useful context. CallVani helps you build inbound and outbound calling workflows around the way your business works.',
    featureHeading: 'From the first hello\nto the next action.',
    features: [
      ['voice', 'Conversations that feel natural', 'Support inbound and outbound conversations with AI voice agents and multilingual voice options.', ['Natural voice conversations', 'Multilingual voice support']],
      ['phone', 'Purposeful sales follow-ups', 'Qualify interest, collect lead requirements and prepare the next conversation for your sales team.', ['Lead qualification', 'Sales follow-ups']],
      ['calendar', 'Appointments, in the flow', 'Capture booking needs and build appointment scheduling into your configured voice workflows.', ['Appointment scheduling', 'Custom AI voice workflows']],
      ['nodes', 'Calling campaigns, organised', 'Manage authorised calling campaigns and customer feedback collection in a dedicated workspace.', ['Campaign management', 'Bulk calling campaigns']],
      ['chart', 'A clearer view of every call', 'Review recordings, call summaries and dashboard insights to understand how conversations progress.', ['Call recordings & summaries', 'Analytics dashboard']],
      ['team', 'Context for your whole team', 'Connect CRM workflows and hand conversations to a human when your customer needs a person.', ['CRM integration', 'Human agent handoff']],
    ],
    workflowTitle: 'Built around your\nconversation.',
    workflowText: 'Define the purpose, prepare the agent and review what happens next. Calling and connected actions depend on your selected setup.',
    workflow: [
      ['Set the context', 'Choose your use case, add business knowledge and define the voice, language and conversation rules.'],
      ['Test the conversation', 'Review the experience with your chosen provider setup, consent process and team handover rules.'],
      ['Keep the next step clear', 'Use call summaries, CRM context and agreed follow-up actions to keep your team informed.'],
    ],
    useTitle: 'A voice for the way you work.',
    uses: [['Sales teams', 'Qualify enquiries and organise follow-ups.'], ['Customer support', 'Capture the question and prepare a helpful handover.'], ['Real estate', 'Understand property enquiries and viewing requests.'], ['Education', 'Collect course enquiries for your admissions team.'], ['Service businesses', 'Discuss appointment requests and service needs.'], ['Feedback campaigns', 'Gather responses through authorised outreach.']],
    note: 'Calling requires applicable consent, telecom and DND compliance. Voice, language and integration availability depend on configuration. Handle call recordings in line with applicable requirements.',
    faqs: [
      ['Is CallVani a traditional IVR?', 'CallVani uses conversational AI so people can respond naturally through speech. You can build workflows for common enquiries, lead qualification and follow-ups.'],
      ['Can CallVani support both inbound and outbound calls?', 'The product specification includes inbound and outbound AI calling. Your chosen calling provider, number configuration and applicable permissions determine the setup available to your business.'],
      ['Can a person take over a conversation?', 'Human agent handoff is included in the product specification. We can discuss the routing and handover requirements for your team during a demo.'],
      ['Where can I see current plans?', 'Visit the official CallVani website for current plans and usage information. Confirm calling, provider and integration requirements before choosing your setup.'],
    ],
  },
  adgrowly: {
    headline: 'Your local presence.\nWorking together.',
    description: 'Manage Google Business Profiles, plan content and respond to customer reviews with AI assistance. Adgrowly brings everyday local visibility work into one focused workspace.',
    intro: 'Smarter Google Business Profile management with AI.',
    introText: 'Make room for a more consistent local presence. Connect your profiles, prepare useful content and keep a clearer view of customer feedback and local ranking insights.',
    featureHeading: 'Everything local.\nOne clearer picture.',
    features: [
      ['location', 'Your profiles, connected', 'Bring Google Business Profiles together and manage the details across your business locations.', ['Google Business Profile connection', 'Multi-location management']],
      ['sparkle', 'A little help with the words', 'Use AI-assisted content creation and generated captions to turn business updates into useful drafts.', ['AI-generated captions', 'AI-assisted content creation']],
      ['calendar', 'A more consistent calendar', 'Plan posts and manage scheduling through an approval-first content workflow.', ['Automated post scheduling', 'Automated workflows']],
      ['message', 'Thoughtful review responses', 'Manage customer reviews and prepare AI reply suggestions for your team to review.', ['Customer review management', 'AI review reply suggestions']],
      ['chart', 'See your local visibility', 'Track keywords and explore local ranking insights to identify areas that need attention.', ['Keyword tracking', 'Local ranking insights']],
      ['layers', 'A shared view of progress', 'Bring business performance and local SEO work into a workspace your team can use together.', ['Business performance dashboard', 'Local SEO tools']],
    ],
    workflowTitle: 'A calmer rhythm\nfor local growth.',
    workflowText: 'Connect your business, prepare your next updates and make informed decisions with profile and ranking information.',
    workflow: [
      ['Connect your profile', 'Connect the Google Business Profile locations you manage and bring the relevant information into your workspace.'],
      ['Prepare, then review', 'Draft posts and review responses with AI assistance. Review content before approving it for publication.'],
      ['Track and improve', 'Use keyword tracking and profile performance insights to decide what deserves your attention next.'],
    ],
    useTitle: 'Made for businesses with a local presence.',
    uses: [['Local businesses', 'Organise your profile and regular business updates.'], ['Marketing agencies', 'Support the locations you manage for clients.'], ['Restaurants', 'Keep reviews and local content on the agenda.'], ['Salons & clinics', 'Help customers find useful business information.'], ['Real estate', 'Manage local profiles and customer feedback.'], ['Multi-location teams', 'Coordinate visibility work across locations.']],
    note: 'Rankings depend on many factors and are not guaranteed. Google connections require the appropriate account access. Review and approve content before publication.',
    faqs: [
      ['What does Adgrowly help me manage?', 'Adgrowly covers Google Business Profile connection, content scheduling, customer reviews, AI-assisted replies, keyword tracking, local ranking insights and business performance dashboards.'],
      ['Can I manage more than one location?', 'Multi-location management is included in the approved product specification. Check the official website or request a demo to confirm the plan and setup that fit your locations.'],
      ['Does AI content publish without review?', 'The current official product website describes approval-first publishing. AI prepares drafts and suggestions; your team reviews content before approving it.'],
      ['Does Adgrowly guarantee a Google Maps position?', 'No. Adgrowly provides tools to manage local visibility and understand ranking signals. A specific Google Maps position or ranking improvement is not guaranteed.'],
    ],
  },
  // Advertised scope checked against https://swiftupi.com/ on 16 October 2026.
  swiftupi: {
    headline: 'Your UPI collections.\nA clearer workflow.',
    description: 'Create payment links and order-specific UPI QR requests, then keep your collection records organised. SwiftUPI helps Indian businesses connect everyday payments with the orders behind them.',
    intro: 'A more organised home for your UPI collections.',
    introText: 'Customers pay the UPI ID you connect. SwiftUPI brings payment requests, collection records and reconciliation into a shared workspace, with payment verification depending on your configured source.',
    featureHeading: 'From a payment request\nto a clearer record.',
    features: [
      ['bag', 'A QR for each order', 'Create an order-specific UPI QR with the payable amount included. Amount mismatches remain available for review instead of being marked paid.', ['Order-specific UPI QR requests', 'Exact-amount matching']],
      ['link', 'Payment links, without code', 'Share a payment link or create a payment page with your own fields. Use a fixed amount or let the payer choose within a range you set.', ['Shareable payment links', 'Payment pages & custom fields']],
      ['chart', 'Keep collection records in order', 'Compare uploaded bank statements with recorded payments and review unmatched entries. Track full and partial refund records in an audit ledger.', ['Statement reconciliation', 'Refund records & review queues']],
      ['nodes', 'Connect your order workflow', 'Create orders through the REST API and receive signed payment webhooks. Review delivery logs and replay events from the dashboard.', ['Order creation API', 'Signed webhooks & delivery logs']],
      ['layers', 'Try the flow in test mode', 'Use separate sandbox keys, orders and webhooks to check your integration. Test payments stay separate from live revenue and ledger records.', ['Separate test and live modes', 'Sandbox orders & webhooks']],
      ['team', 'Bring your team and updates together', 'Use team roles to manage access. Connect and enable your own messaging channels for receipts, payment confirmations and expiry reminders.', ['Role-based team access', 'Configured WhatsApp & email updates']],
    ],
    workflowTitle: 'Request. Review.\nKeep things connected.',
    workflowText: 'Start in test mode, confirm your collection account and verification source, then connect the workflow your business needs.',
    workflow: [
      ['Prepare your collection setup', 'Connect a UPI account permitted for your business use. Confirm account eligibility and your payment verification source before enabling live payments.'],
      ['Create and share the request', 'Create an order through the API or prepare a payment link in the dashboard. The customer uses their UPI app to pay the connected UPI ID.'],
      ['Review the payment record', 'Use your configured verification source, webhook updates and reconciliation records to follow each order. Review unmatched payments before treating an order as paid.'],
    ],
    useTitle: 'For the way your business collects.',
    uses: [['Online stores', 'Connect order creation and payment updates through the API.'], ['Service businesses', 'Share payment links for a defined amount.'], ['No-code collections', 'Prepare payment pages with fields relevant to your request.'], ['Operations teams', 'Review payment records and reconciliation exceptions.'], ['Growing teams', 'Manage collection work through team access roles.'], ['Developers', 'Check order and webhook flows in a separate sandbox.']],
    note: 'Customers pay your connected UPI ID. Payment verification depends on the configured source. Confirm business account eligibility and applicable requirements with your bank or provider. WhatsApp and email delivery require a connected, enabled channel.',
    faqs: [
      ['Where do customers send their payment?', 'Customers pay the UPI ID you connect using their UPI app. SwiftUPI describes its role as organising payment requests and collection records; customer funds are not collected into a SwiftUPI pooled account.'],
      ['How is an order confirmed as paid?', 'Verification depends on your configured payment source and an exact match to the payable amount. A mismatched payment stays in a review queue rather than automatically completing the order. Confirm your source and verification workflow before going live.'],
      ['Do I need to write code to use SwiftUPI?', 'Payment links and payment pages can be prepared without code. For a connected store or custom workflow, SwiftUPI also advertises an order creation API, signed webhooks, delivery logs and event replay.'],
      ['Can I test the workflow before accepting live payments?', 'Yes. The advertised sandbox provides separate test keys, orders and webhooks. Test payments are kept out of live revenue and ledger records.'],
      ['Where can I confirm plans and account requirements?', 'Visit swiftupi.com for current plans and product details. Confirm that your bank or payment provider permits your chosen account for business collections, and review the verification and integration requirements for your setup.'],
    ],
  },
  'chair-manage': {
    headline: 'Good hair days.\nBetter business days.',
    description: 'Keep appointments, people and daily operations in sync. ChairManage brings salon management and customer engagement together so you can focus on the experience in every chair.',
    intro: 'Smarter salon management. Better customer experiences.',
    introText: 'From a customer’s first booking to their next visit, bring the details of your salon day into one organised view. Designed for salons, beauty businesses and growing teams.',
    featureHeading: 'Every detail of\na well-run salon.',
    features: [
      ['calendar', 'Keep the salon day moving', 'Organise appointment bookings and service packages around your customer experience.', ['Appointment booking', 'Service packages']],
      ['heart', 'Know the customer in the chair', 'Manage customer profiles and visit history, then encourage return visits with memberships and loyalty.', ['Customer management & visit history', 'Memberships, rewards & stamp cards']],
      ['team', 'Bring your team together', 'Manage staff, track attendance and keep payroll and performance reporting connected to operations.', ['Staff & attendance management', 'Payroll & staff performance reports']],
      ['bag', 'Make checkout part of the experience', 'Bring POS, billing and inventory management into your daily salon routine.', ['POS & billing', 'Inventory management']],
      ['message', 'Stay connected between visits', 'Plan customer engagement with WhatsApp reminders, marketing automation and coupons.', ['WhatsApp reminders', 'Marketing automation & coupons']],
      ['chart', 'See the bigger business picture', 'Review revenue analytics and coordinate operations across the branches you manage.', ['Revenue analytics', 'Multi-branch management']],
    ],
    workflowTitle: 'One day.\nA smoother rhythm.',
    workflowText: 'Make each part of the salon visit easier to organise, with a shared view of customers, services and your team.',
    workflow: [
      ['Prepare the day', 'Organise bookings, service packages and staff availability for the appointments ahead.'],
      ['Make every visit personal', 'Refer to customer visit history and manage billing, memberships and loyalty at checkout.'],
      ['Plan the next visit', 'Use reminders and marketing workflows, then review revenue and staff performance reports.'],
    ],
    useTitle: 'For every kind of beauty business.',
    uses: [['Hair salons', 'Keep bookings and customer history organised.'], ['Beauty salons', 'Coordinate services and customer relationships.'], ['Nail studios', 'Bring appointments and repeat visits together.'], ['Spas', 'Manage service packages and memberships.'], ['Grooming studios', 'Support everyday bookings and checkout.'], ['Salon chains', 'Review operations across multiple branches.']],
    note: 'Discuss your branch, messaging and operational requirements during a demo. WhatsApp workflows require customer consent and the applicable platform setup.',
    faqs: [
      ['Who is ChairManage designed for?', 'ChairManage is designed for hair salons, beauty salons, nail studios, spas, grooming studios and salon chains.'],
      ['Does the product cover staff and customer management?', 'The approved product scope includes customer management, visit history, staff management, attendance, payroll and staff performance reporting.'],
      ['Which customer engagement tools are included?', 'The product specification includes membership plans, loyalty rewards, digital stamp cards, coupons, WhatsApp reminders and marketing automation. Confirm your required setup during a product walkthrough.'],
      ['Where can I confirm pricing and availability?', 'Visit the official ChairManage website or request a demo. We will help you confirm the current offering for your salon and branches.'],
    ],
  },
};

const waveform = '<span></span>'.repeat(25);
const brandMark = (slug) => `<span class="px-brand-mark px-mark-${slug}" aria-hidden="true">${slug === 'callvani' ? icon('voice') : slug === 'adgrowly' ? icon('chart') : slug === 'chair-manage' ? 'cm' : 's'}</span>`;

export function productVisual(slug, compact = false) {
  const p = products.find((item) => item.slug === slug);
  if (!p) return '';
  let art = '';
  if (slug === 'callvani') {
    art = `<div class="px-orbit px-orbit-one"></div><div class="px-orbit px-orbit-two"></div><div class="px-voice-orb">${icon('voice')}</div><div class="px-floating px-call-state"><span class="px-status-dot"></span><span>Natural conversations</span><small>Hindi · English · more</small></div><div class="px-floating px-wave-panel"><div class="px-panel-label">The conversation, connected</div><div class="px-wave">${waveform}</div><div class="px-mini-row"><span>Listen</span><span>Understand</span><span>Follow up</span></div></div><div class="px-floating px-action-chip">${icon('nodes')} <span>Context for your team</span><b>↗</b></div>`;
  } else if (slug === 'adgrowly') {
    const cells = Array.from({ length: 25 }, (_, i) => `<i class="px-map-dot ${[6, 7, 8, 11, 13, 16, 17, 18].includes(i) ? 'px-map-mid' : ''} ${i === 12 ? 'px-map-center' : ''}">${i === 12 ? icon('location') : ''}</i>`).join('');
    art = `<div class="px-map-lines"></div><div class="px-map-grid">${cells}</div><div class="px-floating px-map-label">${icon('location')} <span>Your local presence</span></div><div class="px-floating px-review-panel"><div class="px-panel-label"><span class="px-status-dot"></span> Review workspace</div><strong>Your next reply, thoughtfully drafted.</strong><div class="px-skeleton"></div><div class="px-skeleton px-short"></div><span class="px-pill">Ready for your review</span></div><div class="px-floating px-post-chip">${icon('calendar')}<span>Plan. Review. Publish.</span></div>`;
  } else if (slug === 'chair-manage') {
    art = `<div class="px-chair-disc"></div><div class="px-salon-window"><div class="px-window-top">${brandMark(slug)}<strong>The salon day</strong><span>Illustration</span></div><div class="px-calendar-heading"><strong>Your appointments</strong>${icon('calendar')}</div><div class="px-calendar-days"><span>M</span><span>T</span><span class="px-day-active">W</span><span>T</span><span>F</span></div><div class="px-appointment"><span class="px-appointment-dot"></span><div><strong>Cut & styling</strong><small>Appointment booking</small></div>${icon('calendar')}</div><div class="px-appointment px-appointment-muted"><span class="px-appointment-dot"></span><div><strong>Care & colour</strong><small>Service packages</small></div>${icon('sparkle')}</div><div class="px-calendar-footer">A little more organised. Every day.</div></div><div class="px-floating px-loyalty-chip">${icon('heart')}<span>Make every visit count</span></div><div class="px-floating px-staff-chip"><span class="px-avatars"><i>A</i><i>B</i><i>C</i></span><span>Your team, in sync</span></div>`;
  } else {
    art = `<div class="px-swift-ring px-swift-ring-one"></div><div class="px-swift-ring px-swift-ring-two"></div><div class="px-swift-ring px-swift-ring-three"></div><div class="px-swift-tile"><span class="px-swift-symbol">s<span>↗</span></span><strong>SwiftUPI</strong><small>UPI collections</small></div><div class="px-floating px-swift-domain">swiftupi.com <span>↗</span></div><div class="px-swift-spark px-swift-spark-one">✦</div><div class="px-swift-spark px-swift-spark-two">✦</div>`;
  }
  return `<div class="px-visual px-visual-${slug}${compact ? ' px-visual-compact' : ''}" role="img" aria-label="${escape(p.name)} ${slug === 'swiftupi' ? 'brand illustration' : 'concept illustration; sample interface, not live product data'}">${art}<span class="px-illustration-label">${slug === 'swiftupi' ? 'Brand illustration' : 'Illustrative product concept'}</span></div>`;
}

const featureSection = (d) => `<section class="section px-features"><div class="container"><div class="px-section-top"><div><p class="eyebrow">Consider the details handled</p><h2>${d.featureHeading.replace('\n', '<br> ')}</h2></div><p>Practical tools for the work<br> that moves your business forward.</p></div><div class="px-feature-grid">${d.features.map(([symbol, title, text, items]) => `<article class="px-feature-card"><div class="px-feature-icon">${icon(symbol)}</div><h3>${title}</h3><p>${text}</p><ul>${items.map(item => `<li>${item}</li>`).join('')}</ul></article>`).join('')}</div></div></section>`;

const workflowSection = (d, slug) => `<section class="section px-workflow"><div class="container px-workflow-inner"><div><p class="eyebrow">How it comes together</p><h2>${d.workflowTitle.replace('\n', '<br> ')}</h2><p class="px-workflow-copy">${d.workflowText}</p><a href="/contact/?product=${slug}" class="text-link">Talk through your workflow ${arrow}</a></div><div class="px-steps">${d.workflow.map(([title, text], i) => `<article class="px-step"><span class="px-step-number">0${i + 1}</span><div><h3>${title}</h3><p>${text}</p></div></article>`).join('')}</div></div></section>`;

const faqSection = (p, faqs) => `<section class="section px-faq"><div class="container px-faq-inner"><div><p class="eyebrow">A few useful answers</p><h2>Curious about<br> ${p.name}?</h2><p>Let’s make the next step clearer.</p><a class="text-link" href="/contact/?product=${p.slug}">Ask us a question ${arrow}</a></div><div class="px-faq-list">${faqs.map(([q,a]) => `<details><summary>${q}<span aria-hidden="true">+</span></summary><p>${a}</p></details>`).join('')}</div></div></section>`;

const moreProducts = (p) => `<section class="section px-more"><div class="container"><div class="px-section-top"><div><p class="eyebrow">More from Nexadly</p><h2>Good tools. Greater possibilities.</h2></div><a href="/products/" class="text-link">Explore all products ${arrow}</a></div><div class="px-related-grid">${products.filter(item => item.slug !== p.slug).map(item => `<a class="px-related-card" href="/products/${item.slug}/">${brandMark(item.slug)}<h3>${item.name} <span>↗</span></h3><p>${item.summary}</p><span class="px-related-category">${item.category}</span></a>`).join('')}</div></div></section>`;

const ctaSection = (p, title = 'See what’s possible<br> for your business.') => `<section class="px-cta"><div class="container"><div><p class="eyebrow">Your next step starts here</p><h2>${title}</h2><p>Visit the official ${p.name} website for product plans, account access, support and policies. For custom implementation, speak to Nexadly about a separate project scope.</p></div><div class="px-cta-actions">${external(p)}<a class="button px-button-outline" href="/contact/?product=${p.slug}">Request a demo ${arrow}</a></div></div></section>`;

const productBoundary = (p) => `<aside class="nx-product-boundary" aria-label="Product account and corporate service information"><div class="container"><div><p class="eyebrow">YOUR PRODUCT WORKSPACE</p><h2>${p.name} has its own home.</h2><p>Use <a href="${p.domain}" target="_blank" rel="noopener noreferrer">${new URL(p.domain).hostname}<span class="nx-visually-hidden"> (opens in a new tab)</span></a> for product accounts, current plans, support and product-specific policies. Nexadly corporate services are quoted separately and do not automatically include a ${p.name} subscription.</p></div><a class="text-link" href="/services/">Need custom implementation? ${arrow}</a></div></aside>`;

export function renderProduct(slug) {
  const p = products.find((item) => item.slug === slug);
  if (!p) return null;
  const d = details[slug];
  return {
    title: `${p.name} — ${p.category}`,
    description: d.description,
    body: `<div class="px-page px-page-${slug}"><section class="px-hero"><div class="container"><nav class="px-breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span>/</span><a href="/products/">Products</a><span>/</span><span>${p.name}</span></nav><div class="px-hero-grid"><div class="px-hero-copy"><div class="px-product-label">${brandMark(slug)}<span>${p.name}<small>${p.category}</small></span></div><h1>${d.headline.replace('\n', '<br> ')}</h1><p class="lead">${d.description}</p><div class="px-hero-actions">${external(p)}<a class="button px-button-outline" href="/contact/?product=${slug}">Request a demo ${arrow}</a></div><p class="px-hero-footnote">A separate SaaS product in the Nexadly product family.</p></div>${productVisual(slug)}</div></div></section>${productBoundary(p)}<section class="section px-intro"><div class="container"><p class="eyebrow">Meet ${p.name}</p><h2>${d.intro}</h2><p>${d.introText}</p></div></section>${featureSection(d)}${workflowSection(d, slug)}<section class="section px-use-cases"><div class="container"><p class="eyebrow">Made for your kind of work</p><h2>${d.useTitle}</h2><div class="px-use-grid">${d.uses.map(([title, text], i) => `<article><span>0${i + 1}</span><h3>${title}</h3><p>${text}</p></article>`).join('')}</div><div class="px-product-note"><span aria-hidden="true">i</span><p>${d.note}</p></div></div></section>${faqSection(p, d.faqs)}${ctaSection(p)}${moreProducts(p)}</div>`,
  };
}
