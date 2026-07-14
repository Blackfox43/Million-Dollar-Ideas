import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Filter, Copy, Heart, Share2, Shuffle, 
  DollarSign, ShieldAlert, CheckCircle, Database, HelpCircle, ChevronDown, Check, SlidersHorizontal,
  Target, TrendingUp, Coins, Calendar, Rocket, Zap, Award, AlertTriangle, Lock
} from 'lucide-react';
import { useAppStore } from '../store';
import { db, type Idea } from '../db';
import ShareCanvasModal from './ShareCanvasModal';
import GoogleAd from './GoogleAd';
import { enrichIdeaBlueprint, RARITY_STYLES, type Rarity, type StartupBlueprint } from '../utils/blueprint';

export default function IdeaGenerator() {
  const {
    filters,
    setFilter,
    resetFilters,
    currentIdea,
    generateIdea,
    favorites,
    toggleFavorite,
    isPremiumUser,
    setPaywallModal,
    updateStats,
    stats,
    streak,
    crazyModeEnabled,
    setCrazyModeEnabled,
  } = useAppStore();

  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [blueprintTab, setBlueprintTab] = useState<'concept' | 'financials' | 'launch'>('concept');
  const [shareFormat, setShareFormat] = useState<'square' | 'vertical'>('square');

  // Sound feedback synthesizer
  const playSound = (freqs: number[], type: OscillatorType = 'sine', duration: number = 0.08) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      freqs.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + duration);
        }, idx * 70);
      });
    } catch (e) {}
  };

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    // Tactile retro mechanical bleep sequence
    playSound([220, 330, 440], 'triangle', 0.07);

    setTimeout(async () => {
      const res = await generateIdea();
      setIsGenerating(false);

      if (res.success) {
        playSound([587.33, 880], 'sine', 0.12); // happy success chirp
      } else if (res.message === 'PAYWALL') {
        playSound([311.13, 277.18], 'sine', 0.15); // descending paywall alert
      } else {
        playSound([220, 180], 'sawtooth', 0.15); // error buzz
        showToast(res.message || 'No matches found');
      }
    }, 450); // Speed-optimized local delay
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyText = async () => {
    if (!currentIdea) return;
    try {
      const blueprint = enrichIdeaBlueprint(currentIdea);
      const text = `💡 STARTUP BLUEPRINT: ${blueprint.startupName.toUpperCase()} 💡
[Rarity: ${blueprint.rarity.toUpperCase()}]

1. Startup Name: ${blueprint.startupName}
2. One-line Pitch: ${blueprint.pitch}
3. Target Audience: ${blueprint.targetAudience}
4. Customer Problem: ${blueprint.problem}
5. Solution: ${blueprint.solution}
6. Revenue Model:
${blueprint.revenueModel.map((m, i) => `   - ${m}`).join('\n')}
7. Estimated Startup Cost: ${blueprint.estimatedCost}
8. Launch Timeline: ${blueprint.launchTimeline}
9. First 10 Steps:
${blueprint.steps10.map((s, i) => `   ${i + 1}. ${s}`).join('\n')}
10. Marketing Strategy: ${blueprint.marketingStrategy}
11. Potential Risks: ${blueprint.risks}
12. Scaling Ideas: ${blueprint.scalingIdeas}

🚀 Generated with Million Dollar Ideas App (Works 100% Offline!).`;
      await navigator.clipboard.writeText(text);
      playSound([523.25, 783.99], 'sine', 0.08);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      showToast('Copy failed. Please try again.');
    }
  };

  const handleFavoriteClick = async () => {
    if (!currentIdea) return;
    playSound([favorites.includes(currentIdea.id) ? 330 : 659.25], 'sine', 0.08);
    await toggleFavorite(currentIdea.id);
  };

  // Expand the local DB to 1,000+ realistic ideas programmatically
  const expandDatabaseTo1000 = async () => {
    if (isExpanding) return;
    setIsExpanding(true);
    playSound([150, 200, 250, 300], 'sine', 0.08);

    setTimeout(async () => {
      try {
        const currentCount = await db.ideas.count();
        if (currentCount >= 1000) {
          showToast('Database already expanded to 1,000+ items!');
          setIsExpanding(false);
          return;
        }

        const niches = ['AI', 'Health', 'Local', 'Creator', 'B2B'];
        const budgets = ['$0', '$1k', '$10k'];
        const times = ['1d', '1w', '1m'];
        const difficulties = ['Easy', 'Med', 'Hard'];

        // Starter words to make realistic synthetic titles
        const prefixes = ['Automated', 'Micro', 'Niche', 'Local', 'Smart', 'Clean', 'Fast', 'Hyper', 'Fractional', 'On-Demand'];
        const middles = ['Marketing', 'Scheduling', 'Feedback', 'Analytics', 'Delivery', 'Coaching', 'Template', 'Content', 'Booking', 'Compliance'];
        const suffixes = ['Suite', 'SaaS', 'Bot', 'Kit', 'Hub', 'Workspace', 'Expert', 'Curator', 'Matcher', 'Copilot'];

        const problems = [
          'Busy professionals waste 8 hours weekly tracking manual spreadsheets.',
          'Local mom-and-pop shops lose leads because they miss telephone calls during dinner hours.',
          'College graduates cannot find affordable moving boxes and storage in dense city environments.',
          'Instagram creators struggle to edit high-converting TikTok captions without expensive video editing software.',
          'Fitness enthusiasts fall off their meal plans because tracking macronutrients manually is too complex.'
        ];

        const solutions = [
          'A lightweight, beautiful, single-screen dashboard that links to their daily calendar and schedules automatic updates.',
          'A voice-activated local AI telephone assistant trained specifically on scheduling software and table bookings.',
          'A community-driven physical storage share system allowing users to rent unused attic spaces locally.',
          'A fast web tool that imports video, runs local speech-to-text, and renders animated high-contrast text subtitles.',
          'An elegant barcode camera app that calculates precise meal portions matching their strict diet program.'
        ];

        const monetizationTemplates = [
          ['Charge $19/mo per seat.', 'Charge $49 for custom setup consulting.', 'Earn affiliate commission on CRM systems.'],
          ['Take 10% commission on bookings.', 'Charge $29/mo flat-rate maintenance.', 'Sell custom printed wood blocks.'],
          ['Sell lifetime access package for $25.', 'Paid weekly newsletter sponsorship at $100/issue.', 'Upsell premium Figma wireframe designs.']
        ];

        const syntheticIdeas: Idea[] = [];

        for (let i = 0; i < 1000; i++) {
          const niche = niches[Math.floor(Math.random() * niches.length)];
          const budget = budgets[Math.floor(Math.random() * budgets.length)];
          const time = times[Math.floor(Math.random() * times.length)];
          const diff = difficulties[Math.floor(Math.random() * difficulties.length)];

          const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
          const middle = middles[Math.floor(Math.random() * middles.length)];
          const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

          const title = `${prefix} ${middle} ${suffix}`;
          const prob = problems[Math.floor(Math.random() * problems.length)];
          const sol = solutions[Math.floor(Math.random() * solutions.length)];
          const monet = monetizationTemplates[Math.floor(Math.random() * monetizationTemplates.length)];

          syntheticIdeas.push({
            id: `synth-${i}`,
            title,
            niche,
            budget,
            time_to_launch: time,
            problem: prob,
            idea: sol,
            monetization: monet,
            difficulty: diff,
            viral_angle: `Why standard ${middle.toLowerCase()} apps are failing, and how this new 1-click ${suffix.toLowerCase()} fixes it completely.`,
            isPremium: Math.random() > 0.8 // 20% premium
          });
        }

        await db.ideas.bulkAdd(syntheticIdeas);
        await updateStats();
        playSound([440, 554, 659, 880], 'sine', 0.15);
        showToast('Successfully generated 1,000+ local startup ideas!');
      } catch (e) {
        showToast('Failed to seed synthetic ideas.');
      } finally {
        setIsExpanding(false);
      }
    }, 1500);
  };

  const filterOptions = {
    niche: ['All', 'AI', 'Health', 'Local', 'Creator', 'B2B', 'Space Tech', 'Web3 & DeFi', 'BioHacking'],
    budget: ['All', '$0', '$1k', '$10k'],
    time_to_launch: ['All', '1d', '1w', '1m'],
    difficulty: ['All', 'Easy', 'Med', 'Hard'],
  };

  return (
    <div className="flex-1 flex flex-col font-sans text-white pb-24 max-w-xl mx-auto w-full">
      {/* Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 rounded-full flex items-center space-x-2 shadow-xl"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Header */}
      <div className="px-6 py-6 text-center space-y-2 relative">
        <div className="absolute top-2 right-6">
          <button 
            onClick={expandDatabaseTo1000}
            disabled={isExpanding || stats.totalLoaded >= 1000}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[10px] text-zinc-400 font-mono disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isExpanding ? 'Expanding...' : stats.totalLoaded >= 1000 ? `1,000+ Seed Active` : 'Seed 1000+ Ideas'}</span>
          </button>
        </div>

        <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold font-mono tracking-widest uppercase">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 fill-current animate-pulse" />
          <span>No-Delay Local Blueprint Engine</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white leading-none">
          Million Dollar Ideas
        </h1>
        <p className="text-xs text-zinc-400 max-w-xs mx-auto">
          Generate highly actionable side-hustles with verified monetization paths completely offline.
        </p>
      </div>

      {/* Interactive Collapsible Filter Panel */}
      <div className="px-6 mb-6">
        <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl overflow-hidden backdrop-blur-sm shadow-xl">
          <button
            onClick={() => {
              playSound([260], 'sine', 0.04);
              setShowFilters(!showFilters);
            }}
            className="w-full flex items-center justify-between p-4 text-zinc-300 hover:text-white transition cursor-pointer hover:bg-zinc-900/30"
          >
            <div className="flex items-center space-x-2">
              <SlidersHorizontal className="w-4.5 h-4.5 text-emerald-400" />
              <span className="text-xs font-bold font-mono uppercase tracking-wider">
                Active Filter Parameters
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {Object.values(filters).some(v => v !== 'All') && (
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full text-emerald-400 font-bold font-mono uppercase">
                  Active
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-zinc-800/60 p-4 space-y-4 bg-zinc-950/20"
              >
                {/* Niche Selector */}
                <div className="space-y-1.5">
                  <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                    Niche Vertical
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {filterOptions.niche.map((opt) => {
                      const isLocked = (opt === 'Space Tech' && streak < 2) || 
                                       (opt === 'Web3 & DeFi' && streak < 3) || 
                                       (opt === 'BioHacking' && streak < 5);
                      return (
                        <button
                          key={opt}
                          onClick={() => {
                            if (isLocked) {
                              playSound([150, 100], 'sawtooth', 0.15);
                              const reqDays = opt === 'Space Tech' ? 2 : opt === 'Web3 & DeFi' ? 3 : 5;
                              showToast(`🔒 Day ${reqDays} Streak required to unlock ${opt}! Check in daily in Hustler Hub.`);
                              return;
                            }
                            playSound([320], 'sine', 0.03);
                            setFilter('niche', opt);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-mono transition active:scale-95 cursor-pointer flex items-center space-x-1.5 ${
                            filters.niche === opt
                              ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/10'
                              : isLocked
                              ? 'bg-zinc-950/40 text-zinc-650 border border-zinc-900/60 opacity-60'
                              : 'bg-zinc-900/80 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-zinc-800/40'
                          }`}
                        >
                          {isLocked && <Lock className="w-3 h-3 text-zinc-600" />}
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Crazy Ideas Mode Unlockable Toggle */}
                <div className="bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-transparent border border-purple-500/25 p-3.5 rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-sm">🤪</span>
                      <span className="text-xs font-bold text-purple-300 font-sans tracking-tight">Crazy Ideas Mode</span>
                      <span className="text-[8px] bg-purple-500/20 text-purple-300 font-mono font-bold px-1.5 py-0.5 rounded uppercase">Day 7 Reward</span>
                    </div>
                    <p className="text-[9px] text-zinc-400 font-sans max-w-xs text-left">
                      Unlock wild, extremely funny, high-conversion viral concepts when ON!
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (streak < 7) {
                        playSound([150, 100], 'sawtooth', 0.15);
                        showToast('🔒 Locked: Reach a consecutive 7-day active streak on Hustler Hub to unlock Crazy Mode!');
                        return;
                      }
                      playSound([crazyModeEnabled ? 300 : 600], 'sine', 0.05);
                      setCrazyModeEnabled(!crazyModeEnabled);
                      showToast(crazyModeEnabled ? 'Crazy Ideas Mode Disabled' : '🤪 Crazy Ideas Mode Enabled! Generate now!');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border uppercase tracking-wider transition-all active:scale-95 cursor-pointer ${
                      streak < 7
                        ? 'bg-zinc-950/40 text-zinc-650 border-zinc-900/60 opacity-60'
                        : crazyModeEnabled
                        ? 'bg-purple-500 text-zinc-950 border-purple-400 font-black shadow-md shadow-purple-500/20'
                        : 'bg-zinc-900 text-purple-300 border-purple-500/30 hover:border-purple-500/60'
                    }`}
                  >
                    {streak < 7 ? (
                      <span className="flex items-center space-x-1">
                        <Lock className="w-3 h-3 text-zinc-550" />
                        <span>Locked</span>
                      </span>
                    ) : crazyModeEnabled ? (
                      'ON'
                    ) : (
                      'OFF'
                    )}
                  </button>
                </div>

                {/* Secondary Filters Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {/* Budget */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      Budget CAP
                    </span>
                    <select
                      value={filters.budget}
                      onChange={(e) => {
                        playSound([350], 'sine', 0.03);
                        setFilter('budget', e.target.value);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 py-2 rounded-xl focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                    >
                      {filterOptions.budget.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === 'All' ? 'Any Budget' : opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Time to launch */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      Launch Speed
                    </span>
                    <select
                      value={filters.time_to_launch}
                      onChange={(e) => {
                        playSound([350], 'sine', 0.03);
                        setFilter('time_to_launch', e.target.value);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 py-2 rounded-xl focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                    >
                      {filterOptions.time_to_launch.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === 'All' ? 'Any Speed' : opt === '1d' ? '1 Day' : opt === '1w' ? '1 Week' : '1 Month'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div className="space-y-1.5">
                    <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      Complexity
                    </span>
                    <select
                      value={filters.difficulty}
                      onChange={(e) => {
                        playSound([350], 'sine', 0.03);
                        setFilter('difficulty', e.target.value);
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 px-2.5 py-2 rounded-xl focus:outline-none focus:border-emerald-500/80 cursor-pointer"
                    >
                      {filterOptions.difficulty.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt === 'All' ? 'Any Difficulty' : opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Reset button */}
                {Object.values(filters).some(v => v !== 'All') && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        playSound([200], 'sine', 0.05);
                        resetFilters();
                      }}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition uppercase tracking-wider"
                    >
                      Reset Filters [x]
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Dynamic Generation Display Section */}
      <div className="px-6 flex-1 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentIdea ? (
            (() => {
              const blueprint = enrichIdeaBlueprint(currentIdea);
              const rStyle = RARITY_STYLES[blueprint.rarity];
              return (
                <motion.div
                  key={currentIdea.id}
                  initial={{ opacity: 0, scale: 0.98, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 160 }}
                  className={`border rounded-3xl p-6 shadow-2xl relative flex flex-col space-y-5 bg-zinc-900 ${rStyle.borderClass} ${rStyle.glowClass} ${rStyle.bgClass}`}
                >
                  {/* Premium Glow indicator */}
                  {currentIdea.isPremium && (
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-md shadow-emerald-400/20" />
                  )}

                  {/* Unicorn Shimmer Effect overlay */}
                  {blueprint.rarity === 'Unicorn' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/5 via-transparent to-indigo-500/5 animate-pulse pointer-events-none rounded-3xl" />
                  )}

                  {/* Tag header strip */}
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold font-mono px-2.5 py-1 rounded bg-zinc-850 border border-zinc-850 tracking-wider text-emerald-400 uppercase">
                      {currentIdea.niche} SaaS
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <span className="font-bold font-mono text-zinc-500">LAUNCH: {currentIdea.time_to_launch.toUpperCase()}</span>
                      <span className="font-bold font-mono text-zinc-500">•</span>
                      <span className="font-bold font-mono text-zinc-500">CAPITAL: {currentIdea.budget}</span>
                    </div>
                  </div>

                  {/* Rarity Badge & Class Designation */}
                  <div className="flex items-center justify-between border-b border-zinc-800/40 pb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[8px] font-black font-mono px-2.5 py-1 rounded border tracking-widest uppercase ${rStyle.badgeClass}`}>
                        {blueprint.rarity}
                      </span>
                      {currentIdea.isPremium && (
                        <div className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[8px] font-bold uppercase tracking-widest font-mono">
                          Premium
                        </div>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold font-mono tracking-wider ${rStyle.textClass} uppercase`}>
                      ★ {blueprint.rarity} Class
                    </span>
                  </div>

                  {/* Brand & Pitch Section */}
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-2xl font-black tracking-tight text-white font-sans leading-none">
                        {blueprint.startupName}
                      </h2>
                    </div>
                    <p className="text-xs text-zinc-400 italic leading-normal font-sans">
                      "{blueprint.pitch}"
                    </p>
                  </div>

                  {/* Interactive Blueprint Tabs */}
                  <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-[10px] font-mono uppercase font-bold tracking-wider">
                    <button
                      onClick={() => { playSound([280], 'sine', 0.04); setBlueprintTab('concept'); }}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${blueprintTab === 'concept' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Concept
                    </button>
                    <button
                      onClick={() => { playSound([310], 'sine', 0.04); setBlueprintTab('financials'); }}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${blueprintTab === 'financials' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Finance
                    </button>
                    <button
                      onClick={() => { playSound([340], 'sine', 0.04); setBlueprintTab('launch'); }}
                      className={`py-2 rounded-lg transition-all cursor-pointer ${blueprintTab === 'launch' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Launch
                    </button>
                  </div>

                  {/* Segmented Blueprint Contents */}
                  <div className="space-y-3 font-sans text-xs">
                    {blueprintTab === 'concept' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-3"
                      >
                        {/* Problem */}
                        <div className="space-y-1 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900">
                          <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                            <AlertTriangle className="w-3 h-3 text-rose-400" />
                            <span>Customer Problem</span>
                          </span>
                          <p className="text-zinc-300 font-medium italic leading-relaxed text-[11px]">
                            "{blueprint.problem}"
                          </p>
                        </div>

                        {/* Solution */}
                        <div className="space-y-1 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900">
                          <span className="text-[8px] font-black font-mono text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5">
                            <Rocket className="w-3 h-3 text-emerald-400 animate-bounce-subtle" />
                            <span>Product Solution</span>
                          </span>
                          <p className="text-zinc-200 leading-relaxed text-[11px]">
                            {blueprint.solution}
                          </p>
                        </div>

                        {/* Audience */}
                        <div className="space-y-1 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900">
                          <span className="text-[8px] font-black font-mono text-cyan-400 uppercase tracking-widest flex items-center space-x-1.5">
                            <Target className="w-3 h-3 text-cyan-400" />
                            <span>Target Audience</span>
                          </span>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">
                            {blueprint.targetAudience}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {blueprintTab === 'financials' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-3"
                      >
                        {/* Monetization */}
                        <div className="space-y-2 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900">
                          <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                            <Coins className="w-3 h-3 text-amber-400" />
                            <span>Revenue Model</span>
                          </span>
                          <ul className="space-y-1.5">
                            {blueprint.revenueModel.map((item, idx) => (
                              <li key={idx} className="flex items-start text-zinc-300 text-[11px] leading-snug">
                                <span className="text-emerald-400 font-bold mr-2 text-[10px] font-mono">{idx + 1}.</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Cost */}
                        <div className="space-y-1 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900">
                          <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            <span>Estimated Startup Cost</span>
                          </span>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">
                            {blueprint.estimatedCost}
                          </p>
                        </div>

                        {/* Marketing */}
                        <div className="space-y-1 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900">
                          <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                            <TrendingUp className="w-3 h-3 text-violet-400" />
                            <span>Marketing & Growth Strategy</span>
                          </span>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">
                            {blueprint.marketingStrategy}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {blueprintTab === 'launch' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="space-y-3"
                      >
                        {/* First 10 Steps */}
                        <div className="space-y-2 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900 max-h-48 overflow-y-auto">
                          <span className="text-[8px] font-black font-mono text-emerald-400 uppercase tracking-widest flex items-center space-x-1.5 sticky top-0 bg-zinc-950/90 py-0.5 z-10">
                            <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
                            <span>First 10 Actionable Steps</span>
                          </span>
                          <ol className="space-y-2 pl-0.5">
                            {blueprint.steps10.map((step, idx) => (
                              <li key={idx} className="flex items-start text-zinc-300 text-[11px] leading-relaxed">
                                <span className="text-emerald-400 font-bold font-mono mr-2 text-[9px] bg-emerald-500/10 w-4 h-4 rounded-full flex items-center justify-center border border-emerald-500/20 flex-shrink-0 select-none">
                                  {idx + 1}
                                </span>
                                <span className="pt-px">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-1 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900">
                          <span className="text-[8px] font-black font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                            <Calendar className="w-3 h-3 text-pink-400" />
                            <span>Launch Timeline</span>
                          </span>
                          <p className="text-zinc-300 leading-relaxed text-[11px]">
                            {blueprint.launchTimeline}
                          </p>
                        </div>

                        {/* Risks & Scaling */}
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1 bg-zinc-950/45 p-2.5 rounded-xl border border-zinc-900">
                            <span className="text-[8px] font-black font-mono text-rose-400 uppercase tracking-widest flex items-center space-x-1">
                              <ShieldAlert className="w-2.5 h-2.5 text-rose-400" />
                              <span>Risks</span>
                            </span>
                            <p className="text-zinc-400 text-[10px] leading-snug">
                              {blueprint.risks.substring(0, 95)}...
                            </p>
                          </div>
                          <div className="space-y-1 bg-zinc-950/45 p-2.5 rounded-xl border border-zinc-900">
                            <span className="text-[8px] font-black font-mono text-cyan-400 uppercase tracking-widest flex items-center space-x-1">
                              <Award className="w-2.5 h-2.5 text-cyan-400" />
                              <span>Scale</span>
                            </span>
                            <p className="text-zinc-400 text-[10px] leading-snug">
                              {blueprint.scalingIdeas.substring(0, 95)}...
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Utility strip actions inside the card */}
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
                    <div className="flex space-x-2">
                      {/* Favorite button */}
                      <button
                        onClick={handleFavoriteClick}
                        className={`p-2.5 rounded-xl border transition active:scale-95 flex items-center justify-center cursor-pointer ${
                          favorites.includes(currentIdea.id)
                            ? 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                        }`}
                        title="Save locally"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(currentIdea.id) ? 'fill-current' : ''}`} />
                      </button>

                      {/* Copy Text button */}
                      <button
                        onClick={handleCopyText}
                        className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200 transition active:scale-95 flex items-center justify-center cursor-pointer"
                        title="Copy clipboard markdown"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Share social card button formats group */}
                    <div className="flex space-x-1.5">
                      <button
                        onClick={() => {
                          playSound([440, 554], 'sine', 0.08);
                          setShareFormat('square');
                          setShowShareModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-2 bg-zinc-950 border border-zinc-800 text-zinc-200 font-bold rounded-xl text-[10px] uppercase tracking-wide font-mono hover:text-white hover:border-zinc-700 transition active:scale-95 cursor-pointer"
                        title="Export 1:1 Feed Card"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Export 1:1</span>
                      </button>

                      <button
                        onClick={() => {
                          playSound([440, 554, 659], 'sine', 0.08);
                          setShareFormat('vertical');
                          setShowShareModal(true);
                        }}
                        className="flex items-center space-x-1 px-3 py-2 bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold rounded-xl text-[10px] uppercase tracking-wide font-mono hover:bg-purple-500/20 hover:text-purple-100 transition active:scale-95 cursor-pointer"
                        title="Export 9:16 vertical Reel / TikTok card"
                      >
                        <span className="text-xs">🎬</span>
                        <span>Reel/TikTok</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })()
          ) : (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 py-12 text-center flex flex-col items-center justify-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Subtle pulsing ambient spot light */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 shadow-inner">
                <Sparkles className="w-10 h-10 text-emerald-400 animate-pulse" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold tracking-tight text-white font-sans">
                  The Blueprint is Armored
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
                  Apply filters above if needed, then fire the launch engine to fetch a custom offline business strategy.
                </p>
              </div>

              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center space-x-1.5">
                <Database className="w-3.5 h-3.5 text-zinc-600" />
                <span>{stats.totalLoaded} Blueprints Loaded Locally</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Ad Placement */}
        <div className="mt-4 max-w-md mx-auto w-full">
          <GoogleAd slot="generator-bottom" />
        </div>
      </div>

      {/* Thumb-Reachable Primary Call-To-Action (Duolingo meets YC feel) */}
      <div className="fixed bottom-20 inset-x-0 px-6 max-w-xl mx-auto z-10">
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full flex items-center justify-center space-x-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-4.5 rounded-2xl shadow-xl shadow-emerald-500/20 active:translate-y-0.5 active:shadow-md transition-all uppercase tracking-wide text-sm font-mono cursor-pointer disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Shuffle className="w-5 h-5 animate-spin" />
              <span>Calibrating Matrix...</span>
            </>
          ) : (
            <>
              <Shuffle className="w-5 h-5 fill-current" />
              <span>Generate New Idea</span>
            </>
          )}
        </button>
      </div>

      {/* Share Image Canvas modal popup */}
      <ShareCanvasModal
        idea={currentIdea}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        initialFormat={shareFormat}
      />
    </div>
  );
}
