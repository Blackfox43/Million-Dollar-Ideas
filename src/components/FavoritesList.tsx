import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Trash2, Copy, Share2, HelpCircle, Check, ChevronDown, FolderHeart, Sparkles, AlertTriangle, Rocket, Target, Coins, DollarSign, TrendingUp, Zap, Calendar, ShieldAlert, Award } from 'lucide-react';
import { useAppStore } from '../store';
import { db, type Idea } from '../db';
import ShareCanvasModal from './ShareCanvasModal';
import GoogleAd from './GoogleAd';
import { enrichIdeaBlueprint, RARITY_STYLES } from '../utils/blueprint';

export default function FavoritesList() {
  const { favorites, toggleFavorite, loadFavorites } = useAppStore();
  const [favoriteIdeas, setFavoriteIdeas] = useState<Idea[]>([]);
  const [expandedIdeaId, setExpandedIdeaId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedIdeaForShare, setSelectedIdeaForShare] = useState<Idea | null>(null);
  const [blueprintTab, setBlueprintTab] = useState<'concept' | 'financials' | 'launch'>('concept');

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

  const fetchFavoriteIdeas = async () => {
    if (favorites.length === 0) {
      setFavoriteIdeas([]);
      return;
    }
    // Fetch all idea details from IndexedDB that match favorite IDs
    const ideas = await db.ideas.where('id').anyOf(favorites).toArray();
    // Sort them according to savedAt or similar if needed, or stick to current
    setFavoriteIdeas(ideas);
  };

  useEffect(() => {
    fetchFavoriteIdeas();
  }, [favorites]);

  const handleToggleExpand = (id: string) => {
    playSound([expandedIdeaId === id ? 200 : 330], 'sine', 0.04);
    setExpandedIdeaId(expandedIdeaId === id ? null : id);
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    playSound([220, 180], 'sine', 0.12); // descending sound for removal
    await toggleFavorite(id);
    if (expandedIdeaId === id) {
      setExpandedIdeaId(null);
    }
  };

  const handleCopyText = async (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    try {
      const blueprint = enrichIdeaBlueprint(idea);
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
      setCopiedId(idea.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {}
  };

  const handleOpenShare = (e: React.MouseEvent, idea: Idea) => {
    e.stopPropagation();
    playSound([440, 554], 'sine', 0.08);
    setSelectedIdeaForShare(idea);
  };

  return (
    <div className="flex-1 flex flex-col font-sans text-white pb-24 max-w-xl mx-auto w-full px-6 py-6">
      <div className="mb-6 flex items-center space-x-2">
        <FolderHeart className="w-5 h-5 text-rose-400" />
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">
          Offline Vault ({favoriteIdeas.length})
        </h2>
      </div>

      {favoriteIdeas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-6 text-center py-12">
          <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800/80 text-zinc-500">
            <Heart className="w-10 h-10 text-zinc-600" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wide font-mono">
              Your Local Vault is Empty
            </h3>
            <p className="text-xs text-zinc-400 max-w-xs leading-relaxed">
              When you find startup ideas you love, tap the heart button to lock them securely inside this local database.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {favoriteIdeas.map((idea) => {
              const isExpanded = expandedIdeaId === idea.id;
              const blueprint = enrichIdeaBlueprint(idea);
              const rStyle = RARITY_STYLES[blueprint.rarity];
              return (
                <motion.div
                  key={idea.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className={`border rounded-2xl overflow-hidden shadow-md bg-zinc-900 transition-all ${rStyle.borderClass} ${rStyle.bgClass}`}
                >
                  {/* Accordion Trigger Header */}
                  <div
                    onClick={() => handleToggleExpand(idea.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-900/40 transition select-none"
                  >
                    <div className="space-y-1.5 pr-4 flex-1">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        <span className={`text-[7px] font-black font-mono px-1.5 py-0.5 rounded border tracking-wider uppercase ${rStyle.badgeClass}`}>
                          {blueprint.rarity}
                        </span>
                        <span className="text-[8px] font-bold font-mono px-1.5 py-0.5 rounded bg-zinc-850 text-emerald-400 uppercase tracking-wider">
                          {idea.niche}
                        </span>
                        {idea.isPremium && (
                          <span className="text-[7px] font-bold font-mono px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase">
                            Pro
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-zinc-500">
                          {idea.budget} • {idea.time_to_launch}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold tracking-tight text-white leading-tight">
                        {blueprint.startupName}
                      </h3>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <button
                        onClick={(e) => handleRemoveFavorite(e, idea.id)}
                        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/10 rounded-lg transition active:scale-95 cursor-pointer"
                        title="Delete from Favorites"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Accordion Detail Content */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-zinc-800/60 bg-zinc-950/20 px-4 pb-4 pt-3 space-y-4 font-sans text-xs"
                      >
                        {/* Subtitle brand description */}
                        <div className="space-y-0.5 pb-2 border-b border-zinc-800/40">
                          <span className={`text-[8px] font-bold font-mono tracking-widest ${rStyle.textClass} uppercase block`}>
                            {blueprint.rarity} startup pitch
                          </span>
                          <p className="text-xs text-zinc-300 italic font-sans">
                            "{blueprint.pitch}"
                          </p>
                        </div>

                        {/* Interactive Blueprint Tabs inside expanded view */}
                        <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-900 text-[10px] font-mono uppercase font-bold tracking-wider">
                          <button
                            onClick={(e) => { e.stopPropagation(); playSound([280], 'sine', 0.04); setBlueprintTab('concept'); }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer ${blueprintTab === 'concept' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Concept
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); playSound([310], 'sine', 0.04); setBlueprintTab('financials'); }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer ${blueprintTab === 'financials' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Finance
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); playSound([340], 'sine', 0.04); setBlueprintTab('launch'); }}
                            className={`py-1.5 rounded-lg transition-all cursor-pointer ${blueprintTab === 'launch' ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                          >
                            Launch
                          </button>
                        </div>

                        {/* Segmented Blueprint Tab Content */}
                        <div className="space-y-3">
                          {blueprintTab === 'concept' && (
                            <div className="space-y-3 animate-fade-in">
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
                                  <Rocket className="w-3 h-3 text-emerald-400" />
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
                            </div>
                          )}

                          {blueprintTab === 'financials' && (
                            <div className="space-y-3 animate-fade-in">
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
                            </div>
                          )}

                          {blueprintTab === 'launch' && (
                            <div className="space-y-3 animate-fade-in">
                              {/* First 10 Steps */}
                              <div className="space-y-2 bg-zinc-950/45 p-3 rounded-xl border border-zinc-900 max-h-40 overflow-y-auto">
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
                            </div>
                          )}
                        </div>

                        {/* Action Toolbar */}
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-800/40">
                          <div className="flex space-x-1">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase">
                              Complexity: {idea.difficulty}
                            </span>
                          </div>

                          <div className="flex space-x-2">
                            {/* Copy button */}
                            <button
                              onClick={(e) => handleCopyText(e, idea)}
                              className="p-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition active:scale-95 flex items-center justify-center cursor-pointer"
                              title="Copy details"
                            >
                              {copiedId === idea.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>

                            {/* Share card button */}
                            <button
                              onClick={(e) => handleOpenShare(e, idea)}
                              className="flex items-center space-x-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 hover:text-white px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wide font-mono transition active:scale-95 cursor-pointer"
                            >
                              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Export Card</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Vault footer ad */}
      <div className="mt-4 max-w-md mx-auto w-full">
        <GoogleAd slot="favorites-bottom" />
      </div>

      {/* Share card popup drawer */}
      <ShareCanvasModal
        idea={selectedIdeaForShare}
        isOpen={selectedIdeaForShare !== null}
        onClose={() => setSelectedIdeaForShare(null)}
      />
    </div>
  );
}
