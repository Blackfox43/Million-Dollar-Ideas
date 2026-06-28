export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Unicorn';

export interface StartupBlueprint {
  startupName: string;
  pitch: string;
  targetAudience: string;
  problem: string;
  solution: string;
  revenueModel: string[];
  estimatedCost: string;
  launchTimeline: string;
  steps10: string[];
  marketingStrategy: string;
  risks: string;
  scalingIdeas: string;
  rarity: Rarity;
}

// Deterministic rarity generator based on idea ID
export function getIdeaRarity(id: string): Rarity {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  const score = Math.abs(hash) % 100;
  if (score < 55) return 'Common';     // 55%
  if (score < 80) return 'Rare';       // 25%
  if (score < 92) return 'Epic';       // 12%
  if (score < 98) return 'Legendary';  // 6%
  return 'Unicorn';                    // 2%
}

// Rarity style mapper
export interface RarityStyle {
  name: Rarity;
  textClass: string;
  bgClass: string;
  borderClass: string;
  glowClass: string;
  badgeClass: string;
}

export const RARITY_STYLES: Record<Rarity, RarityStyle> = {
  Common: {
    name: 'Common',
    textClass: 'text-zinc-400',
    bgClass: 'bg-zinc-900/40',
    borderClass: 'border-zinc-800',
    glowClass: '',
    badgeClass: 'bg-zinc-850 border-zinc-800 text-zinc-400'
  },
  Rare: {
    name: 'Rare',
    textClass: 'text-cyan-400',
    bgClass: 'bg-cyan-950/10',
    borderClass: 'border-cyan-500/20',
    glowClass: 'shadow-lg shadow-cyan-500/5',
    badgeClass: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-bold'
  },
  Epic: {
    name: 'Epic',
    textClass: 'text-violet-400',
    bgClass: 'bg-violet-950/10',
    borderClass: 'border-violet-500/30',
    glowClass: 'shadow-lg shadow-violet-500/10',
    badgeClass: 'bg-violet-500/15 border-violet-500/40 text-violet-400 font-bold'
  },
  Legendary: {
    name: 'Legendary',
    textClass: 'text-amber-400',
    bgClass: 'bg-amber-950/10',
    borderClass: 'border-amber-500/30',
    glowClass: 'shadow-xl shadow-amber-500/15 border-amber-500/40 animate-pulse-subtle',
    badgeClass: 'bg-amber-500/15 border-amber-500/40 text-amber-400 font-extrabold tracking-wide uppercase'
  },
  Unicorn: {
    name: 'Unicorn',
    textClass: 'text-rose-400',
    bgClass: 'bg-gradient-to-br from-rose-950/10 via-fuchsia-950/10 to-indigo-950/10',
    borderClass: 'border-rose-500/30',
    glowClass: 'shadow-2xl shadow-rose-500/20 border-rose-500/50 relative overflow-hidden',
    badgeClass: 'bg-gradient-to-r from-rose-500/20 via-fuchsia-500/20 to-indigo-500/20 border-rose-500/40 text-rose-300 font-black tracking-widest uppercase animate-pulse'
  }
};

// Map of predefined beautiful startup names and pitches for the original 50 seed ideas
const STARTER_BRAND_PRESETS: Record<string, { name: string; pitch: string; target: string }> = {
  'idea-01': {
    name: 'ContractorCopy',
    pitch: 'AI-driven localized SEO and high-converting Yelp profile builder for busy contractors.',
    target: 'Plumbers, electricians, HVAC professionals, and local trade business owners.'
  },
  'idea-02': {
    name: 'MLSVoice',
    pitch: 'Transform raw real estate descriptions into immersive, cinema-grade audio property narratives.',
    target: 'Real estate agencies, busy brokerage teams, and premium home listing sellers.'
  },
  'idea-03': {
    name: 'GhostVideo.ai',
    pitch: 'Fully automated faceless YouTube channel asset production using dynamic video synthesis.',
    target: 'Side-hustlers, passive income builders, and faceless brand content networks.'
  },
  'idea-04': {
    name: 'SilverCompanion',
    pitch: 'A gentle, secure voice agent providing non-intrusive check-ins and companionship for seniors.',
    target: 'Adult children caring for elderly parents, senior care facilities, and solo elders.'
  },
  'idea-05': {
    name: 'FounderPulse',
    pitch: 'Generate and validate ultra-niche, highly monetizable startup concepts with actual SEO demand data.',
    target: 'Indie hackers, serial builders, boot-strappers, and digital product studios.'
  },
  'idea-06': {
    name: 'VetChat AI',
    pitch: 'On-demand clinical-grade triage answers for pet parents before they spend $300 at the vet.',
    target: 'Pet owners, veterinary nurses, dog/cat adoption shelters, and busy pet parents.'
  },
  'idea-07': {
    name: 'SnoozeMatch',
    pitch: 'Sleep-habit analysis engine matching chronic insomniacs with clinical-level non-pill protocols.',
    target: 'Stressed office workers, health-conscious tech workers, and chronic insomniacs.'
  },
  'idea-08': {
    name: 'PodBrief',
    pitch: 'Personalized daily audio briefings summarizing 5-hour long tech podcasts in 10 minutes.',
    target: 'Venture capitalists, startup founders, software engineers, and busy managers.'
  },
  'idea-09': {
    name: 'TidyBite',
    pitch: 'Clean calorie-portion analysis using visual camera telemetry for busy bodybuilders.',
    target: 'Gym-goers, professional athletes, personal trainers, and active dieters.'
  },
  'idea-10': {
    name: 'LocateWork',
    pitch: 'B2B spatial-intelligence matcher mapping local remote work nodes for digital nomads.',
    target: 'Remote software workers, global digital nomads, and coworking space aggregators.'
  }
};

// Generates a beautiful startup name deterministically from an idea title
export function generateStartupName(title: string, id: string): string {
  if (STARTER_BRAND_PRESETS[id]) {
    return STARTER_BRAND_PRESETS[id].name;
  }

  // Generate synthetic brand name
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
  }
  hash = Math.abs(hash);

  const cleanTitle = title.replace(/(AI|SaaS|System|Platform|Service|Suite|Generator|Producer|Automation|Companion|Tool|App)/gi, '').trim();
  const words = cleanTitle.split(' ');
  const primaryWord = words[0] || 'Venture';
  const secondaryWord = words[1] || '';

  const suffixes = ['ly', 'flow', 'bot', 'hub', 'ai', 'co', 'grid', 'base', 'sync', 'vault', 'pulse', 'smart'];
  const prefixes = ['Hyper', 'Micro', 'Niche', 'Smart', 'Insta', 'Apex', 'Nova', 'Swift', 'Omni', 'Solo'];

  if (hash % 3 === 0 && secondaryWord) {
    // Merge first letters of words
    const combined = (primaryWord + secondaryWord.substring(0, 4)).replace(/[^a-zA-Z]/g, '');
    return combined.charAt(0).toUpperCase() + combined.slice(1);
  } else if (hash % 3 === 1) {
    // Suffix style
    const suffix = suffixes[hash % suffixes.length];
    const cleanWord = primaryWord.replace(/[^a-zA-Z]/g, '');
    return `${cleanWord}${suffix}`;
  } else {
    // Prefix style
    const prefix = prefixes[hash % prefixes.length];
    const cleanWord = primaryWord.replace(/[^a-zA-Z]/g, '');
    return `${prefix}${cleanWord}`;
  }
}

// Generates a professional value pitch deterministically from an idea
export function generatePitch(title: string, problem: string, solution: string, id: string): string {
  if (STARTER_BRAND_PRESETS[id]) {
    return STARTER_BRAND_PRESETS[id].pitch;
  }

  // Generate synthetic pitch
  const cleanTitle = title.replace(/(SaaS|System|Platform|Service|Suite|Generator|Producer|Automation|Companion|Tool|App)/gi, '').trim();
  
  const pitches = [
    `The ultimate automated workflow enabling customers to bypass manual friction and solve traditional bottlenecks.`,
    `A single-click intelligent utility designed to instantly optimize local operations and drive direct ROI.`,
    `Providing lightweight, accessible tools that eliminate high agency costs and grant instant visual outputs.`,
    `Simplifying complex tracking metrics into an elegant, high-retention console for busy daily managers.`,
    `An offline-first dedicated sidekick making manual coordination redundant in under 30 seconds.`
  ];

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash += id.charCodeAt(i);
  }
  
  return pitches[hash % pitches.length];
}

// Generates a professional target audience deterministically from an idea
export function generateTargetAudience(niche: string, title: string, id: string): string {
  if (STARTER_BRAND_PRESETS[id]) {
    return STARTER_BRAND_PRESETS[id].target;
  }

  const audiences: Record<string, string[]> = {
    AI: [
      'Independent digital creators, freelance copywriters, and agile micro-SaaS startups looking to cut overhead costs.',
      'Small business agencies, remote marketing managers, and solopreneurs deploying micro-workflows.'
    ],
    Health: [
      'Stressed modern knowledge-workers, active fitness enthusiasts, and biohackers looking to track key performance metrics.',
      'Yoga instructors, local gym owners, nutrition coaches, and wellness-focused individuals.'
    ],
    Local: [
      'Neighborhood home services providers, local brick-and-mortar storefronts, and local-SEO agencies.',
      'Plumbers, contractors, regional logistics owners, and community workshop curators.'
    ],
    Creator: [
      'YouTube content creators, high-volume TikTok video editors, indie hackers, and newsletter publishers.',
      'Social media influencers, community managers, and digital product curators.'
    ],
    B2B: [
      'Small business operations executives, boutique consulting agencies, and SaaS project managers.',
      'Fractional executives, remote operations directors, and fast-growing startup teams.'
    ]
  };

  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash += id.charCodeAt(i);
  }

  const options = audiences[niche] || audiences['B2B'];
  return options[hash % options.length];
}

// Enriches any simple Idea object into a complete, high-perceived-value 12-item Startup Blueprint
export function enrichIdeaBlueprint(idea: any): StartupBlueprint {
  const rarity = getIdeaRarity(idea.id);
  const startupName = generateStartupName(idea.title, idea.id);
  const pitch = generatePitch(idea.title, idea.problem, idea.idea, idea.id);
  const targetAudience = generateTargetAudience(idea.niche, idea.title, idea.id);

  // Parse details
  const problem = idea.problem;
  const solution = idea.idea;
  const revenueModel = idea.monetization;

  // Cost breakdowns based on the budget field
  let estimatedCost = '';
  if (idea.budget === '$0') {
    estimatedCost = '$0 upfront capital. Uses free-tier developer tools (Supabase, Vercel), open-source frontends, and direct organic social networking.';
  } else if (idea.budget === '$1k') {
    estimatedCost = '$300 - $800 initial capital. Breakdown: Domain registration ($10), Vercel & database hosting ($20/mo), AI generation API credits ($150), and $300 targeted lead list scrapers/cold-email software.';
  } else {
    estimatedCost = '$4,000 - $7,500 initial capital. Breakdown: Premium domain acquisitions ($150), custom freelance frontend/backend engineer ($3,500), legal LLC registration ($500), paid ads/influencer sponsorships ($2,000).';
  }

  // Timeline breakdowns based on time_to_launch field
  let launchTimeline = '';
  if (idea.time_to_launch === '1d') {
    launchTimeline = '1-Day Blitz Strategy: Hours 1-2 (Deploy pre-styled landing page), Hours 3-5 (Configure Stripe payment link), Hours 6-12 (Direct cold message 80 prospects via Instagram/Yelp).';
  } else if (idea.time_to_launch === '1w') {
    launchTimeline = '1-Week Scurry: Day 1 (Setup Vite + Tailwind visual mockup), Days 2-3 (Incorporate backend API endpoints), Day 4 (Stripe payment gateways), Days 5-7 (Targeted direct mail & cold outreach).';
  } else {
    launchTimeline = '1-Month Sprint Plan: Week 1 (Conduct user interviews with Figma interactive prototypes), Week 2 (Database wiring & authentication system), Week 3 (Edge-case API tests), Week 4 (Product Hunt + Reddit launch).';
  }

  // 10 Actionable steps
  const steps10 = [
    'Secure a punchy, easy-to-pronounce domain on Namecheap or Porkbun.',
    'Build a super lightweight visual landing page highlighting the core viral hook.',
    'Draft and embed a clear, frictionless Stripe checkout button or LemonSqueezy portal.',
    'Create the core software workflow or mockup (uses Vite, React, or standard AI wrappers).',
    'Compile a targeted lead list of 100 potential users through Yelp, Google Maps, or LinkedIn.',
    'Offer free early access to 10 customers in exchange for a short, raw video testimonial.',
    'Film a 45-second high-contrast comparative demonstration video (before vs. after using your app).',
    'Publish the comparison video organic-style on TikTok, YouTube Shorts, and Instagram Reels.',
    'Refine application bugs and core interface performance based on initial customer cohort telemetry.',
    'Submit the validated micro-SaaS to digital brokerages (Acquire.com, Microns) to build early domain credit.'
  ];

  // Marketing strategies based on Niche
  let marketingStrategy = '';
  if (idea.niche === 'AI') {
    marketingStrategy = 'Leverage "AI-vs-Human Speed Tests": Create short split-screen TikTok/YouTube Shorts comparing traditional manual execution with your 3-second tool. Set up local directories targeting "AI tools for local trades".';
  } else if (idea.niche === 'Health') {
    marketingStrategy = 'Build free micro-assessments or diagnostic calculators: Distribute these tools on wellness Subreddits and wellness communities. Partner with micro-influencers to showcase genuine daily use cases.';
  } else if (idea.niche === 'Local') {
    marketingStrategy = 'Concierge Cold Outreach: Run cold audits. Send business owners a customized free preview of the asset (e.g. mock layout, pre-drafted copy) to immediately build goodwill and prove software value.';
  } else if (idea.niche === 'Creator') {
    marketingStrategy = 'Viral Loop Co-Branding: Embed a soft watermarked credit in exported assets ("Generated with ScribeFlow"). Reward creators with free premium months for sharing and tag-backs on Instagram/TikTok.';
  } else {
    marketingStrategy = 'Account-Based LinkedIn Prospecting: Identify managers handling operational bottlenecks on LinkedIn. Shoot them a personalized Loom video showing how your platform shaves 10 hours off their weekly tasks.';
  }

  // Potential risks
  let risks = '';
  if (idea.niche === 'AI') {
    risks = 'API Dependency & Churn: Rate-limit price surges or API deprecations can stall services. Competitors can copy the simple wrapper wrapper easily, requiring you to establish deep workflow integrations to keep churn low.';
  } else if (idea.niche === 'Health') {
    risks = 'Legal & Medical Compliance: Ensure terms of service state that product represents educational assessments, not clinical diagnoses, to avoid litigation. Ensure absolute medical/personal database encryption.';
  } else if (idea.niche === 'Local') {
    risks = 'High Outreach Friction: Business owners are often tech-insensitive. If onboarding requires complex credentials, drop-offs will occur. Onboarding must be completely hands-off/concierge-based.';
  } else if (idea.niche === 'Creator') {
    risks = 'Extreme Platform Churn: Creators have volatile attention spans and projects. Maintain loyalty by constantly shipping updated asset templates and providing direct revenue-generating integrations.';
  } else {
    risks = 'Elongated Sales Cycles: Corporate decision-makers might take weeks to authorize billing. Mitigate by providing an immediate individual-seat credit card entry, enabling team members to self-fund and expense.';
  }

  // Scaling ideas
  let scalingIdeas = '';
  if (idea.niche === 'AI') {
    scalingIdeas = 'Develop a custom bulk API to let enterprise clients feed databases directly. Bundle custom white-labeled versions to selling to specialized design and marketing agencies globally.';
  } else if (idea.niche === 'Health') {
    scalingIdeas = 'Incorporate dedicated, HIPAA-compliant peer-coaching networks. Transition from standard single-user telemetry into a comprehensive enterprise wellness benefits program for remote work corporations.';
  } else if (idea.niche === 'Local') {
    scalingIdeas = 'Package the service as an on-demand premium white-label platform for local web agencies, allowing them to resell your solution to contractors under their own agency brand.';
  } else if (idea.niche === 'Creator') {
    scalingIdeas = 'Incorporate professional agency tiers. Build direct API connections that auto-publish completed micro-assets straight to YouTube/TikTok on scheduled, optimized timelines.';
  } else {
    scalingIdeas = 'Construct high-value enterprise custom integrations. Offer dedicated single-tenant database deployments, custom security audits, and dedicated SLA support at a $12k/year price floor.';
  }

  return {
    startupName,
    pitch,
    targetAudience,
    problem,
    solution,
    revenueModel,
    estimatedCost,
    launchTimeline,
    steps10,
    marketingStrategy,
    risks,
    scalingIdeas,
    rarity
  };
}
