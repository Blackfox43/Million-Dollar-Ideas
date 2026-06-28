import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Heart, Smartphone, Sparkles, Loader } from 'lucide-react';

import { useAppStore } from './store';
import { seedDatabaseIfEmpty } from './db';

import Onboarding from './components/Onboarding';
import IdeaGenerator from './components/IdeaGenerator';
import FavoritesList from './components/FavoritesList';
import HustleHub from './components/HustleHub';
import PaywallModal from './components/PaywallModal';

export default function App() {
  const {
    isOnboarded,
    activeTab,
    setActiveTab,
    loadFavorites,
    favorites,
    updateStats,
    stats,
    checkIn,
  } = useAppStore();

  const [dbSeeded, setDbSeeded] = useState(false);
  const [showCheckInToast, setShowCheckInToast] = useState(false);
  const [gainedXpAmount, setGainedXpAmount] = useState(0);

  // Sound feedback synthesizer for navigation
  const playSound = (freq: number, duration: number = 0.05) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  useEffect(() => {
    async function initApp() {
      // 1. Seed database with 50 startups if empty
      await seedDatabaseIfEmpty();
      // 2. Load favorited ideas from Dexie
      await loadFavorites();
      // 3. Collect storage stats for dashboard
      await updateStats();
      // 4. Daily check-in
      const res = checkIn();
      if (res && res.gainedXp > 0) {
        setGainedXpAmount(res.gainedXp);
        setShowCheckInToast(true);
        setTimeout(() => setShowCheckInToast(false), 5000);
      }
      setDbSeeded(true);
    }
    initApp();
  }, [loadFavorites, updateStats, checkIn]);

  const handleTabChange = (tab: 'generate' | 'favorites' | 'stats', tone: number) => {
    playSound(tone, 0.04);
    setActiveTab(tab);
  };

  if (!dbSeeded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4 font-mono text-zinc-400">
        <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-[10px] tracking-widest uppercase">Initializing Seed Matrix...</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col justify-between text-white select-none relative overflow-x-hidden">
      {/* Onboarding overlay */}
      {!isOnboarded && <Onboarding />}

      {/* Global simulated Stripe paywall popup */}
      <PaywallModal />

      {/* Daily Check-in Streak Reward Toast */}
      <AnimatePresence>
        {showCheckInToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-zinc-900 border border-emerald-500/30 p-4 rounded-2xl shadow-2xl z-50 flex items-start space-x-3"
          >
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Daily Streak Check-in!</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                You checked in today! You gained <span className="text-emerald-400 font-bold font-mono">+{gainedXpAmount} XP</span>. Keep it up to unlock rare niches!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Scrollable Screen Content */}
      <main className="flex-1 overflow-y-auto pb-32">
        <AnimatePresence mode="wait">
          {activeTab === 'generate' && (
            <motion.div
              key="generate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <IdeaGenerator />
            </motion.div>
          )}

          {activeTab === 'favorites' && (
            <motion.div
              key="favorites"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <FavoritesList />
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <HustleHub />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Mobile-First Interactive Bottom Navigation Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-zinc-950/80 border-t border-zinc-900 backdrop-blur-lg pt-2.5 pb-6 px-6 z-40 shadow-2xl">
        <div className="max-w-md mx-auto flex justify-around items-center relative">
          
          {/* Generate Tab */}
          <button
            onClick={() => handleTabChange('generate', 293.66)} // D4 tone
            className={`flex flex-col items-center space-y-1 py-1.5 transition relative cursor-pointer ${
              activeTab === 'generate' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shuffle className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold tracking-wider uppercase font-mono">Generate</span>
            {activeTab === 'generate' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-1.5 w-5 h-0.5 bg-emerald-400 rounded-full"
              />
            )}
          </button>

          {/* Favorites Tab */}
          <button
            onClick={() => handleTabChange('favorites', 329.63)} // E4 tone
            className={`flex flex-col items-center space-y-1 py-1.5 transition relative cursor-pointer ${
              activeTab === 'favorites' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <div className="relative">
              <Heart className="w-5.5 h-5.5" />
              {favorites.length > 0 && (
                <div className="absolute -top-1.5 -right-2 bg-rose-500 text-zinc-950 font-black font-mono text-[8px] rounded-full w-4 h-4 flex items-center justify-center border border-zinc-950">
                  {favorites.length}
                </div>
              )}
            </div>
            <span className="text-[9px] font-bold tracking-wider uppercase font-mono">Vault</span>
            {activeTab === 'favorites' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-1.5 w-5 h-0.5 bg-emerald-400 rounded-full"
              />
            )}
          </button>

          {/* Stats/Hub Tab */}
          <button
            onClick={() => handleTabChange('stats', 392.00)} // G4 tone
            className={`flex flex-col items-center space-y-1 py-1.5 transition relative cursor-pointer ${
              activeTab === 'stats' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Smartphone className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold tracking-wider uppercase font-mono">Hub</span>
            {activeTab === 'stats' && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute -bottom-1.5 w-5 h-0.5 bg-emerald-400 rounded-full"
              />
            )}
          </button>

        </div>
      </div>
    </div>
  );
}
