import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shuffle, Heart, Smartphone, Sparkles, Loader, Check, XCircle, ShieldAlert, User } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';

import { auth } from './lib/firebase';
import { useAppStore } from './store';
import { seedDatabaseIfEmpty } from './db';

import Onboarding from './components/Onboarding';
import IdeaGenerator from './components/IdeaGenerator';
import FavoritesList from './components/FavoritesList';
import HustleHub from './components/HustleHub';
import PaywallModal from './components/PaywallModal';
import UserProfile from './components/UserProfile';

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

  // Stripe Redirection States
  const [showStripeSuccess, setShowStripeSuccess] = useState(false);
  const [showStripeCancel, setShowStripeCancel] = useState(false);
  const [verifyingStripe, setVerifyingStripe] = useState(false);

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

  // Stripe callback tracking
  useEffect(() => {
    async function handleStripeCallback() {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get('checkout_success') === 'true';
      const isCancel = params.get('checkout_cancel') === 'true';
      const sessionId = params.get('session_id');

      if (isSuccess && sessionId) {
        setVerifyingStripe(true);
        try {
          const res = await fetch(`/api/payments/verify-session/${sessionId}`);
          const data = await res.json();
          if (data.success) {
            // Activate Premium plan
            useAppStore.getState().subscribeToPremium();
            setShowStripeSuccess(true);
            playSound(523.25, 0.15); // C5
            setTimeout(() => playSound(659.25, 0.15), 100); // E5
            setTimeout(() => playSound(783.99, 0.25), 200); // G5
            setTimeout(() => playSound(1046.50, 0.4), 300); // C6 happy major chord success sound
            
            // Hide toast after 8 seconds
            setTimeout(() => setShowStripeSuccess(false), 8000);
          } else {
            console.warn("Stripe verification unsuccessful on server:", data);
            alert(`Stripe Verification Notice: Payment was not fully completed. (Status: ${data.payment_status || 'unknown'})`);
          }
        } catch (e) {
          console.error("Stripe verification endpoint call failed:", e);
        } finally {
          setVerifyingStripe(false);
          // Clean the query parameters from browser URL bar
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } else if (isCancel) {
        setShowStripeCancel(true);
        playSound(220, 0.25); // low sad tone
        setTimeout(() => setShowStripeCancel(false), 5000);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
    handleStripeCallback();
  }, []);

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

  const handleTabChange = (tab: 'generate' | 'favorites' | 'stats' | 'profile', tone: number) => {
    playSound(tone, 0.04);
    setActiveTab(tab);
  };

  if (!dbSeeded || verifyingStripe) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center space-y-4 font-mono text-zinc-400">
        <Loader className="w-8 h-8 text-emerald-400 animate-spin" />
        <span className="text-[10px] tracking-widest uppercase text-center max-w-xs px-6 leading-relaxed">
          {verifyingStripe ? 'Securing subscription credential with Stripe...' : 'Initializing Seed Matrix...'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col justify-between text-white select-none relative overflow-x-hidden">
      {/* Onboarding overlay */}
      {!isOnboarded && <Onboarding />}

      {/* Global simulated Stripe paywall popup */}
      <PaywallModal />

      {/* Toasts and Alerts Notifications group */}
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
              <p className="text-[11px] text-zinc-400 leading-relaxed text-left">
                You checked in today! You gained <span className="text-emerald-400 font-bold font-mono">+{gainedXpAmount} XP</span>. Keep it up to unlock rare niches!
              </p>
            </div>
          </motion.div>
        )}

        {showStripeSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-zinc-900 border border-emerald-500/40 p-4 rounded-2xl shadow-2xl z-50 flex items-start space-x-3"
          >
            <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30 text-emerald-400">
              <Check className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Premium Unlocked! 🎉</p>
              <p className="text-[11px] text-zinc-300 leading-relaxed text-left">
                Stripe payment verified successfully! Your creator account is now upgraded to <span className="text-emerald-400 font-bold">Premium Plan</span>. All filters, niches, and offline tools are unlocked!
              </p>
            </div>
          </motion.div>
        )}

        {showStripeCancel && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:w-80 bg-zinc-905 border border-amber-500/30 p-4 rounded-2xl shadow-2xl z-50 flex items-start space-x-3"
          >
            <div className="p-2.5 bg-amber-500/15 rounded-xl border border-amber-500/25 text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Checkout Cancelled</p>
              <p className="text-[11px] text-zinc-400 leading-relaxed text-left">
                The Stripe Checkout session was cancelled. You can resume checkout anytime to unlock the Premium Vault.
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

          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <UserProfile />
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

          {/* Profile Tab */}
          <button
            onClick={() => handleTabChange('profile', 440.00)} // A4 tone
            className={`flex flex-col items-center space-y-1 py-1.5 transition relative cursor-pointer ${
              activeTab === 'profile' ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="w-5.5 h-5.5" />
            <span className="text-[9px] font-bold tracking-wider uppercase font-mono">Profile</span>
            {activeTab === 'profile' && (
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
