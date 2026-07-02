import Dexie, { type Table } from 'dexie';
import seedIdeas from './data/ideas.json';

export interface Idea {
  id: string;
  title: string;
  niche: string; // AI | Health | Local | Creator | B2B
  budget: string; // $0 | $1k | $10k
  time_to_launch: string; // 1d | 1w | 1m
  problem: string;
  idea: string;
  monetization: string[];
  difficulty: string; // Easy | Med | Hard
  viral_angle: string;
  isPremium?: boolean; // For Stripe subscription filter simulation
}

export interface Favorite {
  id?: number;
  ideaId: string;
  savedAt: number;
}

export class MillionDollarIdeasDatabase extends Dexie {
  ideas!: Table<Idea>;
  favorites!: Table<Favorite>;

  constructor() {
    super('MillionDollarIdeasDatabase');
    this.version(2).stores({
      ideas: 'id, niche, budget, time_to_launch, difficulty, isPremium',
      favorites: '++id, ideaId, savedAt'
    });
  }
}

export const db = new MillionDollarIdeasDatabase();

/**
 * Seeds the IndexedDB database with the initial 50 ideas if empty.
 * Also flags a few ideas as "Premium" to showcase the Stripe upgrade paywall.
 */
export async function seedDatabaseIfEmpty() {
  const count = await db.ideas.count();
  if (count === 0) {
    console.log('IndexedDB is empty. Seeding 50 starter ideas...');
    // Add isPremium flag to some ideas (e.g., about 20% of the ideas) to simulate premium access
    const ideasToSeed: Idea[] = seedIdeas.map((idea, index) => ({
      ...idea,
      isPremium: index % 5 === 0 // every 5th idea is premium
    }));

    // Special premium locked streak ideas
    const specialStreakIdeas: Idea[] = [
      {
        id: 'streak-space-1',
        title: 'OrbitalOptics',
        niche: 'Space Tech',
        budget: '$10k',
        time_to_launch: '1m',
        problem: 'Industrial farms cannot track localized sub-meter moisture fluctuations in real time.',
        idea: 'A hyperspectral imagery API that queries micro-satellite constellations to track precise crop health telemetry.',
        monetization: ['SaaS subscription starting at $199/mo', 'Enterprise custom satellite tasking at $2,500/run'],
        difficulty: 'Hard',
        viral_angle: 'How low-earth satellites are saving farmers millions on water bills in 2026.'
      },
      {
        id: 'streak-space-2',
        title: 'AeroBeacon',
        niche: 'Space Tech',
        budget: '$1k',
        time_to_launch: '1w',
        problem: 'Private aviation and drone delivery teams lack unified transponder mapping for low-altitude flight paths.',
        idea: 'A decentralized ADS-B transponder aggregator mapping custom drone corridors and helipads locally.',
        monetization: ['API integration at $0.05 per lookup', 'Premium routing visualizer at $49/mo'],
        difficulty: 'Med',
        viral_angle: 'The underground network keeping package delivery drones from crashing into each other.'
      },
      {
        id: 'streak-space-3',
        title: 'LunarLedger',
        niche: 'Space Tech',
        budget: '$10k',
        time_to_launch: '1m',
        problem: 'Commercial space payloads suffer from immense customs and logistical disputes across national Space Agencies.',
        idea: 'A blockchain-backed cargo manifesto ledger tracking lunar and orbital shipments deterministically.',
        monetization: ['Transaction fee per payload register ($150)', 'Agency compliance software dashboard ($999/mo)'],
        difficulty: 'Hard',
        viral_angle: 'This software is literally cataloging what humans are sending to the moon.'
      },
      {
        id: 'streak-web3-1',
        title: 'GasGuard',
        niche: 'Web3 & DeFi',
        budget: '$1k',
        time_to_launch: '1w',
        problem: 'Web3 users lose millions to unexpected gas price spikes during high-traffic minting events.',
        idea: 'A gas-fee hedging protocol that pools collateral to auto-reimburse transaction overages.',
        monetization: ['Premium pool fee of 1.5% on claimed gas', 'Monthly subscription option of $12/mo'],
        difficulty: 'Med',
        viral_angle: 'Stop getting rekt by Ethereum gas fees. Here is the smart-contract insurance nobody is talking about.'
      },
      {
        id: 'streak-web3-2',
        title: 'DeFiHarvest',
        niche: 'Web3 & DeFi',
        budget: '$0',
        time_to_launch: '1d',
        problem: 'Liquidity providers manually calculate yields across 50+ protocols, missing out on optimal real-time returns.',
        idea: 'An automated yield-aggregator script that auto-rebalances stablecoins across decentralized lending pools.',
        monetization: ['Performance fee of 2.5% of generated yields', 'Self-hosted premium script download for $99'],
        difficulty: 'Easy',
        viral_angle: 'How this simple 40-line script auto-compounds crypto yields while you sleep.'
      },
      {
        id: 'streak-web3-3',
        title: 'TrustlessEscrow',
        niche: 'Web3 & DeFi',
        budget: '$1k',
        time_to_launch: '1w',
        problem: 'Freelancers working in crypto face trust issues and high escrow platform fees.',
        idea: 'A zero-knowledge peer-to-peer escrow smart contract triggered by verifiable GitHub pull requests or Figma saves.',
        monetization: ['0.5% flat transaction fee per successful payout', 'Premium dispute resolution at $30/case'],
        difficulty: 'Med',
        viral_angle: 'The smart contract that replaces expensive freelance agents with perfect proof-of-work automation.'
      },
      {
        id: 'streak-bio-1',
        title: 'MycoNootropic',
        niche: 'BioHacking',
        budget: '$1k',
        time_to_launch: '1w',
        problem: 'Generic cognitive supplements do not match an individual\'s fluctuating focus patterns.',
        idea: 'A daily focus test that triggers customized biological mushroom/nootropic tea capsule blends.',
        monetization: ['Weekly supplement subscription ($29/wk)', 'Daily cognitive tracking app access for $5/mo'],
        difficulty: 'Med',
        viral_angle: 'Why your focus supplements are failing you, and how mycelium customization fixes brain fog.'
      },
      {
        id: 'streak-bio-2',
        title: 'GlowGlucose',
        niche: 'BioHacking',
        budget: '$10k',
        time_to_launch: '1m',
        problem: 'Diabetics and biohackers dislike invasive needles for continuous glucose monitor tracking.',
        idea: 'A watch-back infrared spectroscopic light analyzer dashboard measuring subcutaneous glucose trends non-invasively.',
        monetization: ['Hardware device sale ($299)', 'Pro analysis companion cloud app at $15/mo'],
        difficulty: 'Hard',
        viral_angle: 'No more needles. How infrared light is tracking blood sugar levels instantly.'
      },
      {
        id: 'streak-bio-3',
        title: 'SleepSynth',
        niche: 'BioHacking',
        budget: '$0',
        time_to_launch: '1d',
        problem: 'Sleepers experience restless nights and fragmented REM cycles due to erratic bedroom ambient noise.',
        idea: 'An EEG-linked acoustic app that synthesizes phase-locking binaural rhythms to stabilize deep sleep spindles.',
        monetization: ['Premium sound pack expansion at $19', 'Yearly sleep-wellness premium tier at $59/yr'],
        difficulty: 'Easy',
        viral_angle: 'The auditory brain hack that forces your mind into deep restorative REM sleep.'
      },
      {
        id: 'streak-crazy-1',
        title: 'PigeonPost.io',
        niche: 'Crazy Ideas',
        budget: '$0',
        time_to_launch: '1d',
        problem: 'Corporate lawyers fear digital eavesdropping and cyber-security breaches of sensitive physical contract drafts.',
        idea: 'A modern dashboard to lease homing pigeons trained to transport localized USB flash drives securely across city rooftops with zero digital footprint.',
        monetization: ['Per-delivery flight fee ($25)', 'Monthly corporate pigeon retainer ($199/mo)'],
        difficulty: 'Easy',
        viral_angle: 'How corporate legal teams are going medieval to beat state-sponsored cyber hackers.'
      },
      {
        id: 'streak-crazy-2',
        title: 'PitchRoaster AI',
        niche: 'Crazy Ideas',
        budget: '$0',
        time_to_launch: '1d',
        problem: 'Founders live in an echo chamber of polite feedback and have no idea why investors are actually laughing at their pitch deck.',
        idea: 'An AI-powered pitch deck analyzer that roasts your startup slide-by-slide using aggressive, loud Gordon Ramsay voice syntax and culinary insults.',
        monetization: ['1 free roast per day', 'Pro Unlimited Roasts with custom video avatars ($29/mo)'],
        difficulty: 'Easy',
        viral_angle: 'This AI just told me my slide deck is so raw it is still trying to raise a seed round.'
      },
      {
        id: 'streak-crazy-3',
        title: 'HostageVault',
        niche: 'Crazy Ideas',
        budget: '$1k',
        time_to_launch: '1w',
        problem: 'Procrastinators bypass screen-time blockers too easily and lack any real financial skin-in-the-game to finish their tasks.',
        idea: 'A smart-contract browser extension that locks your cold-wallet funds in escrow. If you don\'t commit code or submit a document by 5 PM, it donates $50 of your crypto to your most hated political rival.',
        monetization: ['2% platform escrow fee', 'Hostage-insurance subscription ($15/mo)'],
        difficulty: 'Med',
        viral_angle: 'I had to write 1000 words of my thesis or this app would donate my rent money to my ex-landlord.'
      },
      {
        id: 'streak-crazy-4',
        title: 'AbductionGuard',
        niche: 'Crazy Ideas',
        budget: '$1k',
        time_to_launch: '1w',
        problem: 'Paranoid believers and deep-space enthusiasts worry about career disruption in the event of an unexpected alien abduction.',
        idea: 'A decentralized, peer-to-peer insurance pool that payouts premium dividends if a member produces verifiable subcutaneous alien tracking implants.',
        monetization: ['Flat pool management fee (5%)', 'UFO hazard map overlay subscription ($5/mo)'],
        difficulty: 'Med',
        viral_angle: 'The decentralized insurance protocol paying out in crypto if the mothership takes you.'
      },
      {
        id: 'streak-crazy-5',
        title: 'CoFounderMatch',
        niche: 'Crazy Ideas',
        budget: '$0',
        time_to_launch: '1d',
        problem: 'Startup co-founders break up because they have misaligned personality types and arguing gaming styles.',
        idea: 'A Tinder-style matchmaking app for entrepreneurs that blocks messaging until both parties complete a 3-hour speedrun of Overcooked or Portal cooperative mode.',
        monetization: ['Match-boosting credits', 'Premium Myers-Briggs compatibility profiles ($19/mo)'],
        difficulty: 'Easy',
        viral_angle: 'Why your next startup partner needs to be vetted by a gaming cooperative puzzle test before you sign the incorporation papers.'
      }
    ];

    await db.ideas.bulkAdd([...ideasToSeed, ...specialStreakIdeas]);
    console.log('Seeding completed successfully.');
  }
}
