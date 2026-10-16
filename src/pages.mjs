const arrow = '<span aria-hidden="true">↗</span>';
const escape = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const link = (href, label, cls = 'text-link') => `<a class="${cls}" href="${href}">${label} ${arrow}</a>`;
const chips = (items) => `<div class="nx-chips">${items.map((item) => `<span>${escape(item)}</span>`).join('')}</div>`;
const hero = (eyebrow, heading, intro, extra = '') => `<section class="nx-page-hero container"><p class="eyebrow">${eyebrow}</p><h1>${heading}</h1><div class="nx-hero-bottom"><p class="lead">${intro}</p>${extra}</div></section>`;
const wrap = (body) => `<div class="nx-pages">${body}</div>`;
const cta = (heading = 'Let’s make your next<br> move a smart one.', intro = 'Bring your idea, your biggest bottleneck, or your next ambition. We’ll help you define a practical way forward.', label = 'Get a free consultation') => `<section class="container section"><div class="nx-closing"><div><p class="eyebrow">YOUR NEXT CHAPTER</p><h2>${heading}</h2><p>${intro}</p></div>${link('/contact/', label, 'button button-lime')}</div></section>`;
const card = (number, title, body) => `<article class="nx-editorial-card"><span class="nx-card-number">${number}</span><h3>${title}</h3><p>${body}</p></article>`;
const productNames = { callvani: 'CallVani', adgrowly: 'Adgrowly', 'chair-manage': 'Chair Manage' };

export const services = [
  {
    slug: 'website-development', name: 'Website Development', group: 'Build', mark: 'WWW',
    heading: 'Exceptional websites.<br> Built to perform.',
    intro: 'Your website should make a strong first impression and make the next step effortless. We bring design, development and performance together around your business.',
    summary: 'Responsive websites, thoughtful customer journeys and dependable web applications.',
    scope: ['Corporate websites', 'Business websites', 'Landing pages', 'WordPress development', 'Shopify development', 'E-commerce websites', 'React and Next.js websites', 'Web applications', 'Website redesign', 'Maintenance and migration', 'Performance optimization', 'API integrations'],
    pillars: [['A clear first impression', 'Translate your positioning into purposeful layouts, concise content and a visual identity that feels like your business.'], ['A better path to action', 'Plan the navigation, product discovery and enquiry journeys around what your visitors need to accomplish.'], ['A foundation for growth', 'Define the content system, integrations and ongoing maintenance your team will need after launch.']],
    questions: ['Who is the website for, and what should visitors do next?', 'Which content, brand assets and integrations already exist?', 'Who will manage the website after launch?'],
    related: ['ui-ux-design', 'search-engine-optimization', 'cloud-server-management'],
    cta: 'Start your website project', visual: ['Your next digital experience', 'Discover', 'Explore', 'Connect']
  },
  {
    slug: 'mobile-app-development', name: 'Mobile App Development', group: 'Build', mark: 'APP',
    heading: 'Your business.<br> Within reach.',
    intro: 'Create intuitive mobile experiences that connect your business with customers wherever they are. We shape the app, backend and release plan around real user needs.',
    summary: 'Android, iOS and cross-platform apps designed around the way your customers work.',
    scope: ['Android development', 'iOS development', 'Flutter applications', 'React Native applications', 'Cross-platform development', 'App UI/UX', 'Backend APIs', 'Payment gateway integration', 'Push notifications', 'App maintenance', 'App Store deployment'],
    pillars: [['Designed for everyday use', 'Map the core tasks, interaction patterns and accessibility needs before committing to a screen-by-screen design.'], ['Connected to your business', 'Plan the APIs, payment integrations and account experiences needed to make the app useful beyond the interface.'], ['Ready for the next release', 'Include store submission, maintenance and a prioritized improvement backlog in the delivery conversation.']],
    questions: ['Which customer problem is best solved on mobile?', 'Do you need iOS, Android or both?', 'What data and services must the app connect to?'],
    related: ['ui-ux-design', 'custom-software-development', 'cloud-server-management'],
    cta: 'Build your mobile app', visual: ['A better everyday experience', 'Open', 'Discover', 'Do more']
  },
  {
    slug: 'custom-software-development', name: 'Custom Software Development', group: 'Build', mark: '</>',
    heading: 'Your way of working.<br> Better connected.',
    intro: 'Every business has its own processes, constraints and opportunities. We develop software around those realities, helping teams simplify operations and reduce disconnected work.',
    summary: 'Purpose-built tools, dashboards and connected workflows for your business.',
    scope: ['Custom business software', 'Enterprise applications', 'Admin dashboards', 'CRM development', 'ERP development', 'API development', 'Database architecture', 'Payment integrations', 'Business process automation', 'White-label software'],
    pillars: [['Start with the workflow', 'Understand how work moves through your business, where handoffs break down and which steps deserve attention first.'], ['Connect the right systems', 'Define data ownership, integrations and permissions so teams can work with a clearer view of their operations.'], ['Build for ongoing change', 'Keep the architecture and delivery milestones aligned with the way your requirements will evolve.']],
    questions: ['Which process is costing the team the most time?', 'Which existing tools must stay connected?', 'What would a successful first release let people do?'],
    related: ['crm-erp-development', 'saas-development', 'ai-development-automation'],
    cta: 'Discuss your software requirements', visual: ['A system shaped around you', 'People', 'Process', 'Progress']
  },
  {
    slug: 'saas-development', name: 'SaaS Development', group: 'Build', mark: 'SaaS',
    heading: 'From a strong idea.<br> To a useful product.',
    intro: 'Build a cloud-based application with a clear product direction and an architecture designed for growth. We connect the customer experience with the operational needs of running SaaS.',
    summary: 'Cloud products, multi-tenant applications and subscription experiences.',
    scope: ['SaaS platform development', 'Multi-tenant applications', 'Subscription management', 'Payment integrations', 'White-label software', 'Admin dashboards', 'API development', 'Database architecture', 'Cloud deployment', 'Product UI/UX'],
    pillars: [['Find the essential product', 'Turn your idea into user journeys, a prioritized feature scope and a practical first release.'], ['Design the business model into the product', 'Plan account access, subscriptions, billing flows and administration around the way the product will be sold and supported.'], ['Build a dependable foundation', 'Address tenant separation, permissions, integrations and maintenance as part of the architecture discussion.']],
    questions: ['Who is the first customer, and what problem will you solve?', 'How will accounts, teams and subscriptions work?', 'Which capabilities belong in the first release?'],
    related: ['ui-ux-design', 'custom-software-development', 'cloud-server-management'],
    cta: 'Plan your SaaS product', visual: ['An idea, made useful', 'Product', 'Platform', 'People']
  },
  {
    slug: 'ai-development-automation', name: 'AI Development & Automation', group: 'Automate', mark: 'AI',
    heading: 'Less repetitive work.<br> More possibility.',
    intro: 'Bring intelligent automation into the processes that need it most. From voice conversations to document workflows, we help you define where AI can support your team.',
    summary: 'AI voice agents, knowledge assistants and automation for everyday operations.',
    scope: ['AI voice agents', 'AI chatbots', 'Customer support automation', 'AI sales assistants', 'Lead qualification', 'Appointment scheduling', 'Workflow automation', 'CRM integration', 'Business analytics', 'Document processing', 'Custom AI applications', 'Knowledge assistants'],
    pillars: [['Choose a useful starting point', 'Prioritize a real task with clear inputs, measurable outcomes and a manageable scope.'], ['Keep people in the process', 'Define approval steps, escalation routes and the situations where your team should take over.'], ['Connect AI to actual work', 'Plan integrations, access controls and evaluation around the systems and information the workflow will use.']],
    questions: ['Which repetitive task should we address first?', 'What data can the system access?', 'When should a person review or take over?'],
    related: ['custom-software-development', 'whatsapp-business-solutions', 'crm-erp-development'],
    cta: 'Explore AI automation', visual: ['A more intelligent workflow', 'Understand', 'Assist', 'Act']
  },
  {
    slug: 'digital-marketing', name: 'Digital Marketing', group: 'Grow', mark: '↗',
    heading: 'Turn attention.<br> Into opportunity.',
    intro: 'Connect strategy, creative and measurement to build a stronger digital presence. Our marketing work starts with your audience and the business outcomes you want to pursue.',
    summary: 'Integrated search, advertising and content strategies with a clear measurement plan.',
    scope: ['Google Ads', 'Meta Ads', 'SEO and local SEO', 'Social media marketing', 'Content marketing', 'Performance marketing', 'Lead generation', 'Conversion rate optimization', 'Marketing analytics', 'Email marketing', 'WhatsApp marketing', 'Remarketing', 'Brand campaigns', 'AI advertising consultation', 'Jio advertising consultation'],
    pillars: [['A strategy with a purpose', 'Connect the audience, positioning and channel mix to a defined business objective.'], ['Creative that carries the message', 'Bring campaign content, landing pages and brand design together around a coherent customer journey.'], ['Measurement from the start', 'Agree on conversion definitions, tracking and reporting before interpreting campaign results.']],
    questions: ['Which audience and market are you trying to reach?', 'What action defines a useful enquiry or conversion?', 'Which channels and creative assets are already available?'],
    related: ['google-ads-management', 'search-engine-optimization', 'social-media-marketing'],
    cta: 'Plan your growth strategy', visual: ['Make the next connection', 'Audience', 'Creative', 'Action']
  },
  {
    slug: 'search-engine-optimization', name: 'Search Engine Optimization', group: 'Grow', mark: 'SEO',
    heading: 'Be easier to find.<br> Be worth finding.',
    intro: 'Build a stronger foundation for organic discovery. We combine technical improvements, useful content and local visibility work to support long-term search growth.',
    summary: 'Technical SEO, content optimization and local search strategy.',
    scope: ['Technical SEO', 'On-page SEO', 'Off-page SEO', 'Local SEO', 'Keyword research', 'Content optimization', 'SEO audits', 'Google Search Console setup', 'Structured data', 'Website performance', 'Competitor analysis', 'Monthly reporting'],
    pillars: [['Make the foundation work', 'Review crawlability, page structure, performance and the technical issues that make a website harder to understand.'], ['Answer the right questions', 'Use search intent and keyword research to plan content that is useful to the people you want to reach.'], ['Understand your progress', 'Track agreed indicators and explain the work, the findings and the next priorities without promising a fixed ranking.']],
    questions: ['Which services, locations or products matter most?', 'What access and historical search data are available?', 'Which pages should attract your most relevant visitors?'],
    related: ['website-development', 'digital-marketing', 'branding-creative-design'],
    cta: 'Improve your search visibility', visual: ['A stronger discovery journey', 'Discover', 'Understand', 'Choose']
  },
  {
    slug: 'google-ads-management', name: 'Google Ads Management', group: 'Grow', mark: 'ADS',
    heading: 'Meet demand.<br> With a clear message.',
    intro: 'Connect with potential customers through strategically planned search, display, video and shopping campaigns. We align campaign structure with your offer, landing pages and measurement.',
    summary: 'Search, display, video and shopping campaigns aligned with your business.',
    scope: ['Search ads', 'Display ads', 'YouTube advertising', 'Performance Max campaigns', 'Shopping campaigns', 'Keyword research', 'Conversion tracking', 'Campaign optimization', 'Landing page strategy', 'Reporting and analytics'],
    pillars: [['Build around intent', 'Translate customer needs and search behavior into a structured campaign and keyword plan.'], ['Keep the journey connected', 'Bring the advertisement, landing page and conversion action into alignment.'], ['Learn from the evidence', 'Review tracking and campaign results to prioritize changes to targeting, creative and landing pages.']],
    questions: ['Which offer and markets will the campaign support?', 'What advertising budget and account access are available?', 'How will you measure enquiries, sales or other conversions?'],
    related: ['website-development', 'digital-marketing', 'search-engine-optimization'],
    cta: 'Discuss your Google Ads campaign', visual: ['From intent to action', 'Search', 'Visit', 'Connect']
  },
  {
    slug: 'meta-ads-management', name: 'Meta Ads Management', group: 'Grow', mark: 'ADS',
    heading: 'Make your brand.<br> Part of their day.',
    intro: 'Plan and develop Facebook and Instagram campaigns with a considered audience strategy and creative direction. Connect brand awareness, engagement and conversion goals to a coherent plan.',
    summary: 'Facebook and Instagram advertising with audience, creative and measurement in sync.',
    scope: ['Facebook advertising', 'Instagram advertising', 'Lead generation campaigns', 'Conversion campaigns', 'Audience strategy', 'Creative strategy', 'Retargeting', 'Campaign analytics', 'Meta Pixel setup', 'Conversions API setup'],
    pillars: [['Know the audience', 'Define the people, locations and customer needs the campaign is intended to reach.'], ['Give the creative a job', 'Develop messages and visual concepts that support each stage of the customer journey.'], ['Connect activity with outcomes', 'Plan conversion tracking and review performance against the goals agreed for the campaign.']],
    questions: ['What audience and offer will the campaign focus on?', 'Which creative assets and landing pages are available?', 'Are the necessary account and measurement permissions in place?'],
    related: ['branding-creative-design', 'social-media-marketing', 'digital-marketing'],
    cta: 'Plan your Meta campaign', visual: ['A campaign with direction', 'Audience', 'Story', 'Response']
  },
  {
    slug: 'chatgpt-advertising-solutions', name: 'ChatGPT Advertising Solutions', group: 'Grow', mark: 'AI',
    heading: 'Prepare for what’s next.<br> In digital discovery.',
    intro: 'As AI-powered discovery evolves, we help businesses explore emerging opportunities and prepare a thoughtful marketing strategy. Start with useful content, a clear offer and a measurable customer journey.',
    summary: 'Consultation and campaign preparation for emerging AI discovery channels.',
    scope: ['AI advertising strategy', 'Campaign planning', 'Creative development', 'Landing page optimization', 'Conversion tracking', 'AI search visibility strategy', 'Advertising consultation'],
    pillars: [['Understand the opportunity', 'Assess your audience, objectives and the role emerging discovery channels could play in your marketing mix.'], ['Prepare the essentials', 'Develop the messaging, creative and landing page plan needed for a coherent campaign.'], ['Confirm access before execution', 'Review available formats, market eligibility and account requirements before committing to any placement.']],
    questions: ['What should an AI-assisted customer journey help people discover?', 'Which markets and audience segments matter?', 'Which opportunities are currently available to your account?'],
    note: 'This service covers strategy and preparation. Ad inventory, formats and access must be confirmed before launch. Nexadly does not claim an official OpenAI partnership or guaranteed placement.',
    related: ['digital-marketing', 'search-engine-optimization', 'website-development'],
    cta: 'Explore AI advertising', visual: ['Explore a new discovery path', 'Research', 'Prepare', 'Evaluate']
  },
  {
    slug: 'jio-advertising-solutions', name: 'Jio Advertising Solutions', group: 'Grow', mark: 'IN',
    heading: 'Your brand.<br> India’s digital audience.',
    intro: 'Explore eligible Jio-related advertising opportunities with a strategy shaped around your business. We help define the audience, message and measurement before choosing a campaign approach.',
    summary: 'Audience strategy, creative and media planning for eligible Jio-related opportunities.',
    scope: ['Advertising consultation', 'Audience strategy', 'Campaign planning', 'Creative development', 'Performance tracking', 'Media planning', 'Lead generation strategy'],
    pillars: [['Define the audience', 'Understand the regions, languages and customer needs that should shape the campaign.'], ['Plan a consistent message', 'Develop campaign concepts and creative requirements around your offer and objectives.'], ['Verify the opportunity', 'Confirm inventory availability, authorization and account requirements before including any placement in the plan.']],
    questions: ['Which Indian markets and customer groups are you targeting?', 'What message and offer should the campaign communicate?', 'What eligible inventory and account access can be confirmed?'],
    note: 'Specific inventory, platforms and access are subject to verification. Nexadly does not claim a Jio partnership or special placement privileges.',
    related: ['digital-marketing', 'branding-creative-design', 'website-development'],
    cta: 'Discuss Jio advertising', visual: ['A considered media plan', 'Audience', 'Message', 'Measure']
  },
  {
    slug: 'social-media-marketing', name: 'Social Media Marketing', group: 'Grow', mark: '@',
    heading: 'A brand people.<br> Recognize and remember.',
    intro: 'Build a more consistent social presence through purposeful content, creative storytelling and audience-focused campaigns. We connect your brand voice with a practical publishing plan.',
    summary: 'Content strategy, creative storytelling and community-focused campaigns.',
    scope: ['Social media strategy', 'Content calendar planning', 'Post design', 'Carousel design', 'Short-form video editing', 'Reels production', 'Community management', 'Brand campaigns', 'Social media analytics'],
    pillars: [['Find your point of view', 'Define the brand voice, themes and audience questions that make your content useful and recognizable.'], ['Create a workable rhythm', 'Turn content priorities into a calendar with clear formats, responsibilities and approval steps.'], ['Listen and improve', 'Review audience response and content performance to inform what to publish next.']],
    questions: ['Which channels does your audience use?', 'What makes your brand and offer distinctive?', 'Who will supply assets, review content and respond to the community?'],
    related: ['branding-creative-design', 'meta-ads-management', 'digital-marketing'],
    cta: 'Build your social presence', visual: ['A recognizable brand rhythm', 'Plan', 'Create', 'Connect']
  },
  {
    slug: 'branding-creative-design', name: 'Branding & Creative Design', group: 'Design', mark: 'Aa',
    heading: 'Look like you.<br> At your best.',
    intro: 'Bring clarity and consistency to how your business shows up. We connect brand direction, visual design and campaign creative with the experiences your customers see every day.',
    summary: 'A consistent visual language for websites, content and campaigns.',
    scope: ['Branding and creative campaigns', 'Visual design direction', 'Website creative', 'Campaign creative', 'Social post and carousel design', 'Landing page design', 'Digital content design'],
    pillars: [['Make your positioning visible', 'Translate your business story, audience and offer into a clear creative direction.'], ['Build consistency across touchpoints', 'Define a connected approach to typography, color, imagery and layout for your digital experiences.'], ['Design for a purpose', 'Create assets around the message, format and action each piece of communication needs to support.']],
    questions: ['What should people understand and remember about your business?', 'Which brand assets and guidelines already exist?', 'Where will the new creative be used first?'],
    related: ['ui-ux-design', 'website-development', 'social-media-marketing'],
    cta: 'Discuss your creative direction', visual: ['One brand. A clear expression.', 'Identity', 'Story', 'Experience']
  },
  {
    slug: 'whatsapp-business-solutions', name: 'WhatsApp Business Solutions', group: 'Automate', mark: 'WA',
    heading: 'Better conversations.<br> Better connections.',
    intro: 'Connect customer messaging, team workflows and business systems. We help plan WhatsApp Business Platform integrations and automation around clear, consent-based customer journeys.',
    summary: 'Business messaging, team inboxes and connected customer communication.',
    scope: ['WhatsApp Business Platform integration', 'Campaign broadcasting', 'Template management', 'Automated chatbots', 'Shared team inbox', 'Customer segmentation', 'CRM integration', 'Lead management', 'Automated follow-ups', 'Support workflows', 'Analytics and reporting', 'E-commerce integrations', 'AI-powered conversations'],
    pillars: [['Define the customer journey', 'Map enquiries, reminders, follow-ups and support interactions to the teams responsible for each step.'], ['Connect the conversation', 'Plan CRM and commerce integrations so relevant information can flow into the customer communication process.'], ['Build consent into the workflow', 'Include approved templates, customer consent, opt-out handling and applicable platform requirements in the implementation.']],
    questions: ['Which customer interactions should messaging support?', 'How is customer consent collected and recorded?', 'Which team and business systems need access?'],
    related: ['crm-erp-development', 'ai-development-automation', 'ecommerce-development'],
    cta: 'Explore WhatsApp solutions', visual: ['From conversation to follow-through', 'Enquiry', 'Support', 'Follow-up']
  },
  {
    slug: 'cloud-server-management', name: 'Cloud & Server Management', group: 'Operate', mark: '☁',
    heading: 'A stronger foundation.<br> For your next stage.',
    intro: 'Bring structure to how your applications are deployed, maintained and monitored. We help businesses manage infrastructure with a clear focus on reliability and ongoing operation.',
    summary: 'Deployment, server management and infrastructure support for growing applications.',
    scope: ['VPS management', 'Cloud deployment', 'AWS infrastructure', 'Server configuration', 'Domain and DNS management', 'SSL setup', 'Application deployment', 'Database management', 'Backup configuration', 'Monitoring', 'Security hardening', 'CI/CD pipelines', 'Infrastructure optimization'],
    pillars: [['Understand the environment', 'Review the application, hosting setup, deployment process and operational requirements before proposing changes.'], ['Make releases repeatable', 'Define configuration, deployment and monitoring processes that the team can understand and maintain.'], ['Plan for ongoing care', 'Agree on backup, support and maintenance responsibilities as part of the infrastructure plan.']],
    questions: ['Where do the applications and databases run today?', 'What availability, backup and recovery needs must the plan address?', 'Who owns infrastructure access and ongoing support?'],
    related: ['custom-software-development', 'saas-development', 'website-development'],
    cta: 'Discuss your infrastructure', visual: ['The foundation behind the experience', 'Deploy', 'Monitor', 'Maintain']
  },
  {
    slug: 'ecommerce-development', name: 'E-commerce Development', group: 'Build', mark: 'BAG',
    heading: 'A better store.<br> A clearer buying journey.',
    intro: 'Create a shopping experience that connects your products, brand and operations. We develop storefronts and integrations around how your customers browse, choose and buy.',
    summary: 'Shopify and custom commerce experiences connected to your business.',
    scope: ['Shopify development', 'E-commerce websites', 'Custom web applications', 'Responsive storefront design', 'Payment gateway integration', 'API integrations', 'Website migration', 'Performance optimization', 'E-commerce messaging integrations', 'Ongoing maintenance'],
    pillars: [['Help customers discover', 'Structure navigation, collections and product content so shoppers can understand what is right for them.'], ['Keep the journey connected', 'Plan the storefront, checkout integrations and customer communication as parts of one experience.'], ['Support the operations behind it', 'Understand your existing catalog, systems and maintenance needs before defining the integration scope.']],
    questions: ['What do you sell, and in which markets?', 'Which commerce platform and business systems are already in use?', 'What product content and migration work will be required?'],
    related: ['website-development', 'whatsapp-business-solutions', 'digital-marketing'],
    cta: 'Plan your commerce experience', visual: ['Thoughtful from browse to buy', 'Discover', 'Choose', 'Checkout']
  },
  {
    slug: 'crm-erp-development', name: 'CRM & ERP Development', group: 'Operate', mark: 'CRM',
    heading: 'Bring the moving parts.<br> Together.',
    intro: 'Build business systems around your customer relationships and operations. We help define workflows, data and dashboards that give teams a more connected way to work.',
    summary: 'Custom customer and operational systems shaped around your processes.',
    scope: ['CRM development', 'ERP development', 'Admin dashboards', 'Database architecture', 'API development', 'Business process automation', 'Payment integrations', 'AI CRM integration', 'WhatsApp CRM integration', 'Enterprise applications'],
    pillars: [['Map the whole process', 'Understand how leads, customer information and operational work move between people and departments.'], ['Give each team the right view', 'Plan permissions, interfaces and dashboards around the responsibilities of the people using the system.'], ['Reduce disconnected work', 'Prioritize the integrations and automation that connect existing tools with your business process.']],
    questions: ['Which teams and workflows need a shared system?', 'Where does your business data live now?', 'What access rules, approvals and reports must be included?'],
    related: ['custom-software-development', 'ai-development-automation', 'whatsapp-business-solutions'],
    cta: 'Connect your business operations', visual: ['People and processes, connected', 'Customer', 'Team', 'Operations']
  },
  {
    slug: 'ui-ux-design', name: 'UI/UX Design', group: 'Design', mark: 'UX',
    heading: 'Make the complex.<br> Feel simple.',
    intro: 'Create interfaces that help people understand what to do and do it with confidence. We bring user journeys, visual clarity and responsive design into one connected experience.',
    summary: 'Intuitive website, app and dashboard experiences with a clear visual direction.',
    scope: ['Website UI/UX', 'App UI/UX', 'SaaS product interfaces', 'Admin dashboard design', 'Responsive layouts', 'Customer journey planning', 'Landing page design', 'Design for development'],
    pillars: [['Understand the task', 'Start with what users need to accomplish and the constraints that shape the experience.'], ['Make the next step clear', 'Organize content, navigation and interactions to reduce uncertainty at important decision points.'], ['Bring the experience together', 'Develop a consistent visual direction and layouts that translate from concept into development.']],
    questions: ['Who uses the experience, and what are their main tasks?', 'Where does the current experience cause friction?', 'Which devices, content and technical constraints should shape the design?'],
    related: ['website-development', 'mobile-app-development', 'saas-development'],
    cta: 'Shape your user experience', visual: ['Clarity at every touchpoint', 'Understand', 'Design', 'Refine']
  }
];

const serviceBySlug = Object.fromEntries(services.map((service) => [service.slug, service]));
const serviceLink = (slug) => link(`/services/${slug}/`, serviceBySlug[slug].name);
const process = `<div class="nx-step-grid">${[
  ['01', 'Discover', 'Understand the business goals, the people involved and the problem worth solving.'],
  ['02', 'Define', 'Agree on the scope, priorities, responsibilities and measures of success.'],
  ['03', 'Create', 'Design and build in clear stages, with room for feedback at the right moments.'],
  ['04', 'Refine', 'Review the result, prepare the handover and define the next improvement.']
].map(([number, title, body]) => card(number, title, body)).join('')}</div>`;

function serviceVisual(service) {
  return `<div class="nx-system-visual" aria-label="Concept illustration: ${escape(service.visual[0])}"><div class="nx-system-top"><span>NEXADLY / ${service.group.toUpperCase()}</span><span>CONCEPT</span></div><div class="nx-system-center"><span class="nx-system-orbit"></span><span class="nx-system-symbol">${escape(service.mark)}</span></div><p>${service.visual[0]}</p><div class="nx-system-stages">${service.visual.slice(1).map((text, index) => `<span><b>0${index + 1}</b>${text}</span>`).join('')}</div></div>`;
}

function servicePage(service) {
  return {
    title: `${service.name} | Nexadly`, description: service.summary,
    body: wrap(`<section class="container nx-detail-hero"><div><p class="eyebrow">${link('/services/', 'OUR SERVICES')} / ${service.group.toUpperCase()}</p><h1>${service.heading}</h1><p class="lead">${service.intro}</p>${link('/contact/', service.cta, 'button button-dark')}</div>${serviceVisual(service)}</section>
      <section class="container section"><div class="nx-section-intro"><p class="eyebrow">BUILT AROUND YOUR BUSINESS</p><h2>Clear thinking.<br> Practical execution.</h2></div><div class="nx-three-grid">${service.pillars.map(([title, body], index) => card(`0${index + 1}`, title, body)).join('')}</div></section>
      <section class="nx-soft-section"><div class="container nx-scope"><div><p class="eyebrow">WHAT WE CAN HELP WITH</p><h2>The right capabilities.<br> For your next step.</h2><p>We’ll shape a defined scope around your requirements, existing systems and priorities.</p></div>${chips(service.scope)}</div>${service.note ? `<div class="container"><p class="nx-service-note">${service.note}</p></div>` : ''}</section>
      <section class="container section nx-split"><div><p class="eyebrow">A GOOD PLACE TO START</p><h2>Let’s define<br> what matters.</h2><p>A useful first conversation gives us the context to recommend a focused next step.</p></div><ol class="nx-question-list">${service.questions.map((question) => `<li>${question}</li>`).join('')}</ol></section>
      <section class="container section nx-related"><div><p class="eyebrow">BETTER, TOGETHER</p><h2>Connect the next piece.</h2></div><div>${service.related.map(serviceLink).join('')}</div></section>
      ${cta('Your next idea.<br> Let’s build on it.', service.intro, service.cta)}`)
  };
}

export const industries = [
  {slug:'retail-ecommerce',name:'Retail & E-commerce',tag:'Make the whole shopping journey work.',intro:'Bring the storefront, customer conversation and operational workflow closer together.',challenges:[['A disconnected buying experience','Customers need a consistent path from discovering a product to asking a question and completing a purchase.'],['Systems that do not connect','Product, customer and order information can become harder to manage when each team works in a different tool.'],['Visibility in a busy market','A strong store still needs useful content and a considered plan for reaching relevant shoppers.']],services:['ecommerce-development','whatsapp-business-solutions','digital-marketing'],products:['adgrowly','callvani'],productText:'Explore Adgrowly for physical-location visibility and CallVani for suitable, authorized customer calling workflows.'},
  {slug:'healthcare',name:'Healthcare',tag:'More clarity around the care journey.',intro:'Support the administrative side of healthcare with thoughtful digital experiences and connected workflows.',challenges:[['Repetitive administrative enquiries','Teams need a clear way to handle routine questions and guide people to the right next step.'],['Appointment coordination','Scheduling workflows require accurate information, clear responsibilities and a route to human assistance.'],['Sensitive information','Access, consent and information handling need to be defined for the intended use before implementation.']],services:['website-development','ai-development-automation','custom-software-development'],products:['callvani','adgrowly'],productText:'Explore CallVani for administrative calling workflows and Adgrowly for managing the online presence of eligible healthcare locations. Clinical advice and care decisions remain with qualified professionals.'},
  {slug:'real-estate',name:'Real Estate',tag:'Turn interest into a better conversation.',intro:'Connect property discovery, enquiries and follow-up with a clearer digital experience.',challenges:[['Enquiries spread across channels','Prospective buyers and tenants may contact your team through websites, calls and messaging.'],['Inconsistent follow-up','Teams need a practical process for recording interest and coordinating the next conversation.'],['A distinct market presence','Your website, content and local visibility should communicate the value of your business clearly.']],services:['website-development','crm-erp-development','digital-marketing'],products:['callvani','adgrowly'],productText:'Explore CallVani for lead qualification and authorized follow-up conversations, and Adgrowly for eligible local business profiles.'},
  {slug:'education',name:'Education',tag:'Make the next learning step clearer.',intro:'Create accessible information, useful enquiry journeys and connected administrative tools for education businesses.',challenges:[['Complex information journeys','Programs, requirements and next steps need a structure that prospective learners can understand.'],['Repeated admission enquiries','Teams need consistent processes for routine questions, enquiry records and follow-up.'],['Disconnected internal tools','Administrative work becomes harder when information is duplicated across multiple systems.']],services:['website-development','ai-development-automation','custom-software-development'],products:['callvani'],productText:'Explore CallVani for appropriate enquiry, scheduling and feedback conversations with the relevant permissions and consent.'},
  {slug:'hospitality',name:'Hospitality',tag:'Thoughtful experiences, before arrival.',intro:'Bring digital discovery, guest communication and business operations into a more considered experience.',challenges:[['A fragmented first impression','Guests should be able to understand the offer and find the right enquiry or booking next step.'],['Repeated guest questions','Routine information requests can take time away from more personal service.'],['Managing local reputation','Business information, reviews and location-specific content require ongoing attention.']],services:['website-development','whatsapp-business-solutions','ai-development-automation'],products:['adgrowly','callvani'],productText:'Explore Adgrowly for local presence management and CallVani for suitable customer communication and feedback workflows.'},
  {slug:'restaurants',name:'Restaurants',tag:'Help your next regular find you.',intro:'Connect local discovery, clear digital information and customer engagement around your restaurant.',challenges:[['Keeping information current','Menus, business information and customer-facing content need an understandable publishing process.'],['Staying visible locally','Reviews, local content and business profiles need attention across locations.'],['Planning connected operations','Billing, orders and stock requirements need a clear scope before choosing or building a system.']],services:['website-development','search-engine-optimization','whatsapp-business-solutions'],products:['adgrowly'],productText:'Explore Adgrowly for Google Business Profile management, review workflows and local visibility.',roadmap:true},
  {slug:'beauty-wellness',name:'Beauty & Wellness',tag:'Make more room for your customers.',intro:'Bring appointments, customer relationships and daily salon operations into a clearer workflow.',challenges:[['A busy appointment calendar','Teams need an organized view of appointments, customer information and the services being delivered.'],['Daily operational coordination','Staff, billing, inventory and branch activity can create a lot of disconnected administration.'],['Long-term customer relationships','Reminders, loyalty and relevant communication can support a more considered customer experience.']],services:['website-development','whatsapp-business-solutions','digital-marketing'],products:['chair-manage','adgrowly'],productText:'Explore Chair Manage for the salon operations described in its approved product scope, and Adgrowly for managing local business visibility.'},
  {slug:'professional-services',name:'Professional Services',tag:'Make expertise easier to discover.',intro:'Create a credible digital presence and a more connected journey from initial enquiry to ongoing relationship.',challenges:[['Explaining the offer clearly','Potential customers need to understand your services and whether you are the right fit.'],['Managing the enquiry journey','Lead information, follow-up and handoffs need a process the whole team can use.'],['Time spent on administration','Routine internal tasks can compete with the work clients need from your team.']],services:['website-development','crm-erp-development','ai-development-automation'],products:['callvani','adgrowly'],productText:'Explore CallVani for suitable customer conversations and Adgrowly for the local online presence of eligible service businesses.'},
  {slug:'financial-services',name:'Financial Services',tag:'Clear experiences. Considered systems.',intro:'Shape digital journeys and internal tools around your business process, information handling and approval requirements.',challenges:[['Complex customer information','Interfaces and content should make the available services and next steps easier to understand.'],['Defined access and approvals','Customer data and operational actions require carefully scoped permissions and responsibilities.'],['Connected operational workflows','Teams need a clear view of where information originates and how it moves between systems.']],services:['custom-software-development','crm-erp-development','ui-ux-design'],products:['callvani'],productText:'CallVani can be evaluated for permitted administrative communications. Scope, consent, information handling and sector-specific requirements must be reviewed before adoption.'},
  {slug:'manufacturing',name:'Manufacturing',tag:'Connect the work behind the product.',intro:'Build a clearer picture of operational processes and connect the teams and systems involved.',challenges:[['Information spread across teams','People need dependable access to the operational information relevant to their responsibilities.'],['Manual process handoffs','Repeated data entry and informal updates can make work harder to track.'],['Technology that does not fit','Existing tools may need integration or a purpose-built extension to support the way the business operates.']],services:['crm-erp-development','custom-software-development','cloud-server-management'],products:[],productText:'For manufacturing operations, we start with your requirements and evaluate custom software and integrations. We do not assume an existing SaaS product fits your operational needs.'},
  {slug:'marketing-agencies',name:'Marketing Agencies',tag:'Give your team more room to create.',intro:'Connect delivery, customer visibility and repeatable workflows with tools that fit the way your agency works.',challenges:[['Many clients, many moving parts','Profiles, content calendars and reporting can become harder to coordinate as the client roster grows.'],['Repeated production work','Clear processes and appropriate automation can help structure repeatable tasks.'],['Disconnected client tools','Teams need to understand what can be integrated and where access and ownership sit.']],services:['ai-development-automation','saas-development','custom-software-development'],products:['adgrowly','callvani'],productText:'Explore Adgrowly for multi-location profile and content management, and CallVani for suitable authorized calling workflows.'},
  {slug:'startups-enterprises',name:'Startups & Enterprises',tag:'Build for the stage you are in.',intro:'From a focused first product to a connected business platform, align technology with your next priority.',challenges:[['Choosing what to build first','A useful first release starts with a focused user problem and an agreed set of priorities.'],['Connecting systems as you grow','Data, permissions and integrations need attention as more teams and workflows become involved.'],['Supporting what you launch','Deployment, maintenance and ownership are part of a product’s long-term operating plan.']],services:['saas-development','custom-software-development','cloud-server-management'],products:['callvani','adgrowly'],productText:'Evaluate CallVani and Adgrowly where your communication or local visibility needs match their product scope.'}
];

function industryPage(industry) {
  return {title:`${industry.name} Technology Solutions | Nexadly`,description:industry.intro,body:wrap(`${hero(`INDUSTRIES / ${industry.name.toUpperCase()}`,industry.tag,industry.intro,link('/contact/','Discuss your requirements','button button-dark'))}
    <section class="nx-soft-section"><div class="container section"><div class="nx-section-intro"><p class="eyebrow">UNDERSTANDING YOUR BUSINESS</p><h2>Start with the<br> everyday challenges.</h2></div><div class="nx-three-grid">${industry.challenges.map(([title,body],i)=>card(`0${i+1}`,title,body)).join('')}</div></div></section>
    <section class="container section nx-split"><div><p class="eyebrow">CONNECTED CAPABILITIES</p><h2>Build the right<br> combination.</h2><p>We’ll define a scope around your business model, current systems and operational needs.</p></div><div class="nx-linked-stack">${industry.services.map((slug)=>`<article>${serviceLink(slug)}<p>${serviceBySlug[slug].summary}</p></article>`).join('')}</div></section>
    <section class="container section"><div class="nx-product-callout"><div><p class="eyebrow">PRODUCTS TO EXPLORE</p><h2>A useful place to start.</h2><p>${industry.productText}</p></div><div class="nx-product-links">${industry.products.length ? industry.products.map((slug)=>link(`/products/${slug}/`,productNames[slug])).join('') : link('/services/custom-software-development/','Explore custom software')}</div></div>${industry.roadmap ? '<aside class="nx-roadmap"><span class="nx-label">COMING SOON</span><h3>Restaurant Management Software</h3><p>A restaurant operations product is on the roadmap, with planned capabilities around POS, table and order management, inventory, staff and customer management. It is not currently presented as ready for customers.</p><a class="text-link" href="/contact/">Discuss your restaurant requirements <span aria-hidden="true">↗</span></a></aside>' : ''}</section>
    ${cta('A clearer plan.<br> For your business.', 'Tell us about the challenge you want to solve. We’ll help you connect it to the right mix of technology, automation and digital services.')}`)};
}

const groups = [
  ['Build','Digital foundations, designed for what comes next.'],
  ['Automate','Make everyday operations more connected.'],
  ['Grow','Bring your business to the right people.'],
  ['Design','Clarity and consistency at every touchpoint.'],
  ['Operate','Keep the systems behind your business moving.']
];

export const pages = {};
pages['/services/'] = {
  title:'Technology, AI & Digital Growth Services | Nexadly',
  description:'Explore Nexadly services across websites, apps, custom software, SaaS, AI automation, digital marketing, design and cloud infrastructure.',
  body:wrap(`${hero('OUR SERVICES','Good ideas deserve<br> <em>great execution.</em>','Technology, creativity and automation. Connected around what your business needs to do next.',link('/contact/','Let’s talk about your project','button button-dark'))}
    <section class="container nx-services-index"><nav class="nx-category-nav" aria-label="Service categories">${groups.map(([name])=>`<a href="#${name.toLowerCase()}">${name} <span aria-hidden="true">↓</span></a>`).join('')}</nav>
    ${groups.map(([name,intro],groupIndex)=>`<section id="${name.toLowerCase()}" class="nx-service-group"><div class="nx-group-heading"><span>0${groupIndex+1}</span><h2>${name}.</h2><p>${intro}</p></div><div class="nx-service-rows">${services.filter(service=>service.group===name).map(service=>`<a class="nx-service-row" href="/services/${service.slug}/"><h3>${service.name}</h3><p>${service.summary}</p><span class="nx-round-arrow" aria-hidden="true">↗</span></a>`).join('')}</div></section>`).join('')}</section>
    <section class="nx-soft-section"><div class="container section"><div class="nx-section-intro"><p class="eyebrow">A CLEAR WAY FORWARD</p><h2>From your idea.<br> To a working solution.</h2></div>${process}</div></section>${cta()}`)
};
services.forEach(service=>{pages[`/services/${service.slug}/`]=servicePage(service);});

pages['/solutions/'] = {
  title:'Connected Business Solutions | Nexadly',description:'Connect Nexadly technology, automation, SaaS and digital marketing services around your business needs.',
  body:wrap(`${hero('BUSINESS SOLUTIONS','The right pieces.<br> <em>Working together.</em>','Your business goals do not fit neatly into one service. Bring the right combination of technology, automation and growth support together.',link('/contact/','Find your starting point','button button-dark'))}
  <section class="container section nx-solutions-grid">${[
    ['01','Launch your digital presence','Turn your business into a clear, useful online experience. Bring positioning, design, development and discoverability into the same conversation.',['website-development','ui-ux-design','search-engine-optimization'],'Website · Identity · Discovery'],
    ['02','Build a software product','Define a focused product, design the experience and plan the architecture needed to take it from idea to a working application.',['saas-development','mobile-app-development','cloud-server-management'],'Product · Platform · Infrastructure'],
    ['03','Connect customer conversations','Bring enquiries, follow-up and support into a connected process with appropriate automation and clear human handoffs.',['ai-development-automation','whatsapp-business-solutions','crm-erp-development'],'Conversations · Context · Follow-through'],
    ['04','Strengthen digital growth','Create a coordinated plan across search, advertising and content, with measurement that reflects your business objectives.',['digital-marketing','google-ads-management','social-media-marketing'],'Strategy · Creative · Measurement'],
    ['05','Simplify business operations','Understand where work gets stuck, connect your systems and shape the tools your team needs to work more clearly.',['custom-software-development','crm-erp-development','ai-development-automation'],'People · Processes · Systems'],
    ['06','Support your next stage','Bring structure to hosting, deployment and maintenance as the demands on your applications evolve.',['cloud-server-management','custom-software-development','website-development'],'Deploy · Maintain · Improve']
  ].map(([number,title,body,links,footer])=>`<article class="nx-solution-card"><span class="nx-card-number">${number}</span><h2>${title}</h2><p>${body}</p><div class="nx-solution-links">${links.map(serviceLink).join('')}</div><span class="nx-solution-footer">${footer}</span></article>`).join('')}</section>
  <section class="nx-soft-section"><div class="container section nx-split"><div><p class="eyebrow">BUILD, BUY OR CONNECT</p><h2>Sometimes the best<br> start is already built.</h2></div><div><p class="lead">Explore Nexadly’s product portfolio alongside our services. We’ll help you evaluate where an existing product fits and where custom work is needed.</p>${link('/products/','Explore our products','button button-dark')}</div></div></section>${cta()}`)
};

pages['/industries/'] = {
  title:'Industries We Serve | Nexadly',description:'Explore technology, automation and growth solutions for retail, healthcare, real estate, education, hospitality, beauty and more.',
  body:wrap(`${hero('INDUSTRIES WE SERVE','Different businesses.<br> <em>Shared ambition.</em>','Better experiences. Simpler operations. More room to grow. We connect technology to the realities of your industry.',link('/contact/','Tell us about your business','button button-dark'))}
  <section class="container section nx-industries-grid">${industries.map((industry,index)=>`<a class="nx-industry-card" href="/industries/${industry.slug}/"><span class="nx-card-number">${String(index+1).padStart(2,'0')}</span><h2>${industry.name}</h2><p>${industry.intro}</p><span class="nx-round-arrow" aria-hidden="true">↗</span></a>`).join('')}</section>
  ${cta('Your business has<br> its own story.', 'Tell us what makes your work different. We’ll help define a technology approach that fits the way you operate.')}`)
};
industries.forEach(industry=>{pages[`/industries/${industry.slug}/`]=industryPage(industry);});

pages['/about/'] = {
  title:'About Nexadly | Technology, AI & Digital Growth',description:'Nexadly brings software development, intelligent automation, SaaS products and digital growth services together around practical business needs.',
  body:wrap(`${hero('ABOUT NEXADLY','Build smarter.<br> Grow <em>beyond limits.</em>','We believe powerful technology should be accessible, practical and built around the people who use it.')}
  <section class="container nx-about-statement"><div class="nx-about-art" aria-label="Abstract illustration of connected Nexadly capabilities"><span class="nx-art-ring ring-one"></span><span class="nx-art-ring ring-two"></span><span class="nx-art-ring ring-three"></span><b>N<span>↗</span></b><p>BUILD / AUTOMATE / GROW</p></div><div><p class="eyebrow">YOUR COMPLETE TECHNOLOGY PARTNER</p><h2>From big possibility.<br> To practical progress.</h2><p>Nexadly brings software development, AI-powered automation, SaaS products, cloud solutions and digital marketing into one connected offering.</p><p>From websites and mobile applications to business platforms and customer communication, our focus is on helping businesses build, operate and grow in an increasingly digital world.</p><p>Our mission is simple: make powerful technology accessible, practical and scalable for businesses of every size.</p></div></section>
  <section class="nx-dark-section"><div class="container section"><p class="eyebrow">THE WAY WE THINK</p><h2>Technology is useful<br> when it moves you forward.</h2><div class="nx-three-grid">${[
    ['01','Business comes first','Start with a real business objective. Choose the technology that supports it.'],
    ['02','Clarity builds confidence','Define the scope, share progress and make responsibilities clear at each stage.'],
    ['03','Growth needs a foundation','Consider scalability, reliability and ongoing maintenance from the beginning.']
  ].map(values=>card(...values)).join('')}</div></div></section>
  <section class="container section"><div class="nx-section-intro"><p class="eyebrow">ONE CONNECTED APPROACH</p><h2>A partner for<br> the whole journey.</h2></div><div class="nx-three-grid">${[
    ['End-to-end solutions','Planning, design, development, deployment and marketing can work as parts of the same plan.'],
    ['AI and automation','Use intelligent tools where they can simplify work and support a better experience.'],
    ['Scalable architecture','Design around reliability and long-term business requirements.'],
    ['Practical development','Prioritize the capabilities that serve a real business need.'],
    ['Transparent collaboration','Work with defined milestones, clear communication and shared decisions.'],
    ['Continuous support','Plan maintenance, optimization and technical assistance through agreed support arrangements.']
  ].map(([title,body],index)=>card(`0${index+1}`,title,body)).join('')}</div></section>
  <section class="nx-soft-section"><div class="container section"><div class="nx-section-intro"><p class="eyebrow">HOW WE APPROACH A PROJECT</p><h2>Good work starts<br> with understanding.</h2></div>${process}</div></section>
  <section class="container nx-company-note"><p><strong>Company status:</strong> Nexadly is the brand name. Nexadly Private Limited is the proposed legal company name, pending incorporation.</p></section>${cta()}`)
};

pages['/pricing/'] = {
  title:'Project Pricing & Custom Quotes | Nexadly',description:'Get a tailored Nexadly proposal based on your project scope, integrations and support requirements. Explore project-based development, ongoing support and SaaS product options.',
  body:wrap(`${hero('PRICING','A clear scope.<br> <em>A considered proposal.</em>','Every project has different goals, systems and requirements. We quote around the work your business actually needs.',link('/contact/','Request a custom quote','button button-dark'))}
  <section class="container section nx-three-grid">${[
    ['PROJECT WORK','Design & development','For websites, mobile apps, custom software and focused implementation projects.',['Defined requirements and deliverables','Milestones and review points','Integration and content responsibilities','Handover and launch scope']],
    ['ONGOING COLLABORATION','Growth & operations','For marketing, optimization, maintenance and agreed technical support.',['Agreed priorities and working cadence','Clear areas of responsibility','Reporting suited to the engagement','Support and maintenance boundaries']],
    ['PRODUCT EXPLORATION','SaaS products','For businesses exploring Nexadly’s product portfolio.',['Review the relevant product page','Check the official product website','Confirm current availability and terms','Discuss any implementation requirements']]
  ].map(([label,title,body,items])=>`<article class="nx-pricing-card"><p class="eyebrow">${label}</p><h2>${title}</h2><p>${body}</p><div class="nx-price-label">Tailored to your needs</div><ul>${items.map(item=>`<li>${item}</li>`).join('')}</ul>${link(label==='PRODUCT EXPLORATION'?'/products/':'/contact/',label==='PRODUCT EXPLORATION'?'Explore the products':'Discuss your scope','button button-dark')}</article>`).join('')}</section>
  <section class="nx-soft-section"><div class="container section nx-split"><div><p class="eyebrow">WHAT SHAPES A PROPOSAL</p><h2>More context.<br> A better estimate.</h2><p>We’ll clarify what is included before work begins. Advertising spend, third-party subscriptions and other external costs should be identified separately in the proposal where applicable.</p></div><div class="nx-linked-stack">${[
    ['Scope & complexity','The workflows, pages, platforms and features your project requires.'],
    ['Integrations & existing systems','What needs to connect, migrate or work with your current tools.'],
    ['Content & creative','The brand assets, copy, media and design work included in the engagement.'],
    ['Timeline & ongoing support','Your target milestones and the responsibilities after delivery.']
  ].map(([title,body])=>`<article><h3>${title}</h3><p>${body}</p></article>`).join('')}</div></div></section>
  <section class="container section nx-faq"><div><p class="eyebrow">A LITTLE MORE CLARITY</p><h2>Before we begin.</h2></div><div>${[
    ['Can I get a fixed price?','A fixed proposal can be discussed once requirements, deliverables and dependencies are defined. Start by sharing your project brief.'],
    ['Is there a published SaaS price list here?','No. Check each product’s official website and confirm current pricing and terms directly. We do not publish unverified product rates.'],
    ['Can we start with a smaller scope?','Yes. A focused first phase can help define priorities and create a practical starting point for a larger project.'],
    ['What should I include in my enquiry?','Describe your business, the problem you want to solve, your existing systems and any target timeline. If you have a budget range, include it in your project description.']
  ].map(([question,answer])=>`<details><summary>${question}<span aria-hidden="true">+</span></summary><p>${answer}</p></details>`).join('')}</div></section>${cta('Let’s make the<br> scope clear.', 'Start with a short project brief. We’ll help identify the right next conversation.', 'Prepare your project brief')}`)
};

const resources = [
  {slug:'software-project-planning',category:'SOFTWARE & STRATEGY',title:'Turn a software idea into a clear project brief.',description:'A practical checklist for defining users, workflows and responsibilities before your software project begins.',readTime:'6 MIN READ',theme:'website',body:`<p class="nx-article-deck">A software project becomes easier to plan when the important decisions are visible before design begins. Use these questions to create a brief that helps your team agree on what the product needs to do.</p>
  <h2>Start with one primary purpose</h2><p>Describe the main business outcome the software should support. A service business may need a clearer enquiry workflow. A growing team may need to replace repeated data entry. A retailer may need a simpler way to connect customer and operational information.</p><p>Then name the primary user and the task they need to complete. This keeps the scope focused when priorities compete.</p>
  <h2>Map the essential workflows</h2><p>Describe what starts each process, what information people need and what happens next. Separate confirmed requirements from ideas still awaiting agreement.</p><ul><li>List the main tasks and the people responsible for each one.</li><li>Identify the information each task needs and where it comes from.</li><li>Describe approvals, permissions and exceptions.</li><li>Separate first-release requirements from later improvements.</li></ul>
  <h2>Look beyond the visible interface</h2><p>Write down what happens when someone takes action. Where should the information go? Who follows it up? Which systems must connect? A form, a booking journey or a dashboard has operational requirements behind the interface.</p><p>Include data migration, system access, hosting and ongoing maintenance. These are dependencies to plan, not details to leave until launch day.</p>
  <h2>Define what good looks like</h2><p>Agree on a small set of acceptance criteria. Examples include completing a core task, keeping permissions consistent, handling missing information clearly and providing the team with the reports it needs.</p><p>Separate the first release from later improvements. A focused launch scope helps make the timeline and responsibilities easier to understand.</p>
  <div class="nx-article-callout"><h3>Your starting brief</h3><ol><li>Who will use the software?</li><li>Which task should it make easier?</li><li>What information and permissions does that task require?</li><li>What systems need to connect?</li><li>Who approves, maintains and owns the result?</li></ol></div>
  <h2>Bring the answers into one conversation</h2><p>You do not need a perfect specification to start. A clear description of the business, the audience and the existing situation gives a development partner the context to help you define the next step.</p>`,related:'custom-software-development'},
  {slug:'automation-readiness',category:'AI & AUTOMATION',title:'Choose your first automation with purpose.',description:'Find a useful starting point, define a human handoff and evaluate the result before expanding.',readTime:'5 MIN READ',theme:'automation',body:`<p class="nx-article-deck">The strongest starting point for automation is a specific, repeated task with a clear owner. Start there, understand the workflow and decide what successful assistance would look like.</p>
  <h2>Choose a bounded task</h2><p>Look for work with recognizable inputs and an understandable outcome. Examples might include organizing routine enquiries, preparing information for review or helping customers find an appropriate next step.</p><p>Avoid starting with a vague goal such as “automate customer service.” Break it into smaller activities and choose one that your team can evaluate without changing the entire operation.</p>
  <h2>Describe the workflow as it works today</h2><p>Record where information comes from, who uses it and what happens when something is missing. Include the exceptions. They often reveal where automation needs a fallback or a person’s judgment.</p><ul><li>What starts the workflow?</li><li>What information is required?</li><li>Which systems must be accessed?</li><li>What should the result look like?</li><li>What happens when the system is uncertain or unavailable?</li></ul>
  <h2>Give people a clear role</h2><p>Define which steps can happen automatically and which need review. Name the person or team responsible for exceptions, approvals and follow-up. A handoff is useful only if someone knows what to do with it.</p><p>For customer communication, decide how consent, messaging preferences and access to customer information will be handled before activating the workflow.</p>
  <h2>Test against representative examples</h2><p>Collect a set of examples that reflects ordinary requests, missing information and difficult edge cases. Check whether the workflow behaves as intended and whether its failures are understandable and recoverable.</p><p>Measure the task you are actually trying to improve. Useful indicators may include completion quality, time spent reviewing outputs and the number of exceptions requiring manual help. Avoid using activity alone as proof of value.</p>
  <div class="nx-article-callout"><h3>A useful first-automation brief</h3><p>“When this event happens, help this team complete this task using these approved sources. Ask for human review in these situations. Evaluate success with these criteria.”</p></div>
  <h2>Expand after you understand the result</h2><p>Use the first workflow to learn about data quality, integration needs and team adoption. Improvements to the process itself may be as valuable as the technology. Add scope when the evidence supports it.</p>`,related:'ai-development-automation'},
  {slug:'local-visibility',category:'DIGITAL GROWTH',title:'A more thoughtful approach to local visibility.',description:'Bring useful business information, a consistent content routine and customer feedback into one practical plan.',readTime:'5 MIN READ',theme:'growth',body:`<p class="nx-article-deck">Local visibility is an ongoing business process. Start with useful information, give your team a clear publishing routine and connect customer feedback with the way you improve the experience.</p>
  <h2>Make the basics dependable</h2><p>Review the information customers use to understand and contact your business. Your website and business profiles should reflect the services, locations and contact details you can currently confirm.</p><p>Assign an owner to changes such as opening hours, service descriptions and location details. A simple review process can help prevent outdated information from confusing potential customers.</p>
  <h2>Make each location useful to a visitor</h2><p>For a business with several locations, describe what customers need to know about each one. Use relevant, approved content and make the next action clear, whether that is an enquiry, a visit or an appointment request.</p><p>Keep the information specific. A location page is more helpful when it explains the actual experience available there than when it repeats the same generic description.</p>
  <h2>Give content a sustainable rhythm</h2><p>Choose content themes that support your customers: service explanations, useful updates, answers to common questions and relevant business news. Build a calendar that your team can maintain.</p><ul><li>Who supplies and approves content?</li><li>Which locations or services does each update apply to?</li><li>Are the images and details accurate?</li><li>Who checks scheduled posts after publication?</li><li>When should outdated content be revised or removed?</li></ul>
  <h2>Treat reviews as a customer conversation</h2><p>Give someone responsibility for reviewing feedback and preparing appropriate responses. Keep replies factual, considerate and relevant to the customer’s experience. AI-assisted drafts still need suitable oversight.</p><p>Look for patterns that can inform the service itself. A recurring question or complaint may reveal an operational issue worth addressing beyond the reply.</p>
  <div class="nx-article-callout"><h3>A practical visibility routine</h3><p>Review business information, plan useful content, respond thoughtfully to feedback and check the available performance indicators. Record what changed and what your team learned.</p></div>
  <h2>Measure progress without making ranking promises</h2><p>Decide which indicators help you understand local discovery and customer interest. Keep profile activity, website activity and actual enquiries distinct so the report does not confuse attention with business outcomes.</p><p>Local visibility work should create a more useful, consistent presence over time. No content calendar or tool should be treated as a guarantee of a particular search position.</p>`,related:'search-engine-optimization'}
];

function resourceCard(resource) {
  return `<a class="nx-resource-card" href="/resources/${resource.slug}/"><div class="nx-resource-art art-${resource.theme}" aria-hidden="true"><span>${resource.theme==='website'?'Aa':resource.theme==='automation'?'✳':'↗'}</span><i></i><b>${resource.category}</b></div><div class="nx-resource-meta"><span>${resource.category}</span><span>${resource.readTime}</span></div><h2>${resource.title}</h2><p>${resource.description}</p><span class="text-link">Read the guide ${arrow}</span></a>`;
}
pages['/resources/'] = {
  title:'Practical Technology & Growth Guides | Nexadly',description:'Original Nexadly guides to planning a software project, choosing an automation workflow and improving local visibility.',
  body:wrap(`${hero('IDEAS & RESOURCES','A little clarity.<br> <em>A smarter next step.</em>','Practical notes on building useful digital experiences, connecting your operations and planning your next move.')}
  <section class="container section nx-three-grid nx-resource-grid">${resources.map(resourceCard).join('')}</section>
  <section class="container section"><div class="nx-resource-banner"><span class="nx-resource-asterisk" aria-hidden="true">✳</span><div><p class="eyebrow">THINKING ABOUT A PROJECT?</p><h2>Turn the idea<br> into a useful brief.</h2><p>Start with the business problem, the people involved and the result you want to work towards.</p>${link('/contact/','Prepare your project brief','button button-dark')}</div></div></section>`)
};
resources.forEach(resource=>{
  pages[`/resources/${resource.slug}/`]={title:`${resource.title} | Nexadly Resources`,description:resource.description,body:wrap(`<div class="container nx-article-back">${link('/resources/','All resources')}</div><header class="container nx-article-header"><p class="eyebrow">${resource.category} <span> / ${resource.readTime}</span></p><h1>${resource.title}</h1><p>By Nexadly · Practical guide</p></header><article class="nx-article-body">${resource.body}<div class="nx-article-end"><p>Ready to explore this for your business?</p>${serviceLink(resource.related)}</div></article>${cta('Good questions.<br> Better starting points.','Share your goals and current challenges. We’ll help you define a practical next step.')}`)};
});

pages['/contact/'] = {
  title:'Start Your Project | Contact Nexadly',description:'Prepare a consultation brief for your Nexadly project. Tell us about your business, goals and the services you need.',
  body:wrap(`${hero('LET’S TALK','Your next chapter.<br> <em>Starts with an idea.</em>','Tell us what you’re building, what needs to work better, or where you want to go next.')}
  <section class="container section nx-contact-layout"><div class="nx-contact-copy"><p class="eyebrow">A GOOD FIRST CONVERSATION</p><h2>Big ambition.<br> Practical next steps.</h2><p>You don’t need a complete specification. Start with your business, your biggest challenge and what a better outcome would look like.</p><div class="nx-contact-topics"><h3>We can help you explore</h3>${['A new website or digital product','AI and business automation','Marketing and digital growth','Cloud and ongoing technical support','The right Nexadly product'].map(topic=>`<p><span aria-hidden="true">↗</span>${topic}</p>`).join('')}</div><div class="nx-contact-note"><h3>Prefer a direct hello?</h3><p><a class="text-link" href="mailto:hello@nexadly.com">hello@nexadly.com ↗</a></p><p>Use the form to prepare an enquiry in your email app, or download a brief to share when you are ready. You review and send the email yourself.</p></div></div>
  <form id="consultation-form" class="nx-contact-form"><div class="nx-form-row"><label for="consultation-name">Your name <span aria-hidden="true">*</span><input id="consultation-name" name="name" autocomplete="name" placeholder="Full name" required maxlength="120"></label><label for="consultation-email">Email address <span aria-hidden="true">*</span><input id="consultation-email" name="email" type="email" autocomplete="email" placeholder="you@company.com" required maxlength="254"></label></div><label for="consultation-company">Company / business<input id="consultation-company" name="company" autocomplete="organization" placeholder="Your company name" maxlength="160"></label><label for="consultation-interest">What are you interested in? <span aria-hidden="true">*</span><select id="consultation-interest" name="interest" required><option value="" disabled selected>Select a starting point</option><option value="website-development">Website development</option><option value="mobile-app-development">Mobile app development</option><option value="custom-software">Custom software / SaaS</option><option value="ai-automation">AI & automation</option><option value="digital-marketing">Digital marketing</option><option value="branding-ui-ux">Branding & UI/UX</option><option value="whatsapp">WhatsApp business solutions</option><option value="cloud">Cloud & infrastructure</option><option value="callvani">CallVani</option><option value="adgrowly">Adgrowly</option><option value="swiftupi">SwiftUPI</option><option value="chair-manage">Chair Manage</option><option value="restaurant-software">Restaurant software roadmap</option><option value="help">Help defining the right solution</option></select></label><label for="consultation-message">Tell us about your project <span aria-hidden="true">*</span><textarea id="consultation-message" name="message" rows="6" placeholder="What does your business do? What would you like to build or improve? Include any relevant systems, goals or timeline." required maxlength="12000"></textarea></label><p class="nx-form-notice">This form opens your email app with an enquiry addressed to hello@nexadly.com. Review it and press Send there. Your details are not sent automatically.</p><button class="button button-dark" type="submit">Prepare enquiry email ${arrow}</button><button class="button nx-download-button" type="button" id="download-brief">Download brief <span aria-hidden="true">↓</span></button><p id="form-status" class="nx-form-status" role="status" aria-live="polite"></p><noscript><p>Enable JavaScript to prepare an email or download a brief. You can also email your enquiry directly to hello@nexadly.com.</p></noscript></form></section>
  <section class="nx-soft-section"><div class="container section nx-contact-alternatives"><div><p class="eyebrow">STILL EXPLORING?</p><h2>Find your<br> starting point.</h2></div><div>${link('/services/','Explore our services')}${link('/products/','Meet our SaaS products')}${link('/industries/','Explore your industry')}${link('/pricing/','How project pricing works')}</div></div></section>`)
};
