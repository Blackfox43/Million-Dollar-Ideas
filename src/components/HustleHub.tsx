import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Database, Shield, CreditCard, Sparkles, AlertCircle, WifiOff, RefreshCw, Smartphone, Play, LogOut, CheckCircle,
  Award, Zap, Lock, Check, Trophy, Calendar, Sparkle, Share2, HelpCircle
} from 'lucide-react';
import { useAppStore } from '../store';
import GoogleAd from './GoogleAd';
import FounderQuiz from './FounderQuiz';

export default function HustleHub() {
  const {
    isPremiumUser,
    cancelSubscription,
    setPaywallModal,
    resetOnboarding,
    stats,
    streak,
    xp,
    badges,
    checkedInToday,
    checkIn,
    awardXp,
  } = useAppStore();

  const [showQuiz, setShowQuiz] = useState(false);
  const [copiedStreak, setCopiedStreak] = useState(false);

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

  const handleTogglePremium = () => {
    if (isPremiumUser) {
      playSound([300, 200], 'sine', 0.12);
      cancelSubscription();
    } else {
      playSound([440, 554], 'sine', 0.1);
      setPaywallModal(true);
    }
  };

  const handleTestOnboarding = () => {
    playSound([220, 440], 'sine', 0.1);
    resetOnboarding();
  };

  const handleSetStreak = (days: number) => {
    playSound([220 + days * 50, 440 + days * 100], 'sine', 0.12);
    
    // Reset or adjust streak
    localStorage.setItem('m_ideas_streak', (days - 1).toString());
    
    // Set last active date to yesterday so checking in today increments it back to 'days'
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    localStorage.setItem('m_ideas_last_active', yesterdayStr);
    
    useAppStore.setState({
      streak: days - 1,
      lastActiveDate: yesterdayStr,
      checkedInToday: false
    });

    // Check in
    checkIn();
  };

  return (
    <div className="flex-1 flex flex-col font-sans text-white pb-24 max-w-xl mx-auto w-full px-6 py-6 space-y-6">
      {/* Title */}
      <div className="flex items-center space-x-2">
        <Smartphone className="w-5 h-5 text-emerald-400" />
        <h2 className="text-xl font-bold tracking-tight text-white font-sans">
          Hustler Hub
        </h2>
      </div>

      {/* Connection & Offline Status */}
      <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl animate-pulse">
            <WifiOff className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">100% Offline Mode Active</p>
            <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">No network connections required. Databases seeded locally.</p>
          </div>
        </div>
        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Secure
        </span>
      </div>

      {/* "Which Idea Are You?" Founder Personality Quiz Banner */}
      <div className="bg-gradient-to-br from-violet-500/15 via-fuchsia-500/5 to-zinc-900 border border-violet-500/25 rounded-3xl p-5 space-y-4 relative overflow-hidden shadow-xl">
        <div className="absolute top-2.5 right-3 text-4xl opacity-15">🧠</div>
        <div className="space-y-1.5">
          <span className="text-[8px] bg-violet-500/20 text-violet-300 font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Special Personality Assessment
          </span>
          <h3 className="text-sm font-extrabold text-white tracking-tight font-sans">
            Which Startup Founder Type Are You?
          </h3>
          <p className="text-[10px] text-zinc-400 leading-relaxed max-w-sm">
            Take our short 5-tap psychological quiz to unlock 1 of 8 customized startup founder profiles and custom recommended blueprint paths.
          </p>
        </div>
        <button
          onClick={() => {
            playSound([392, 523], 'sine', 0.1);
            setShowQuiz(true);
          }}
          className="w-full py-2.5 bg-violet-500 hover:bg-violet-400 text-zinc-950 font-black text-xs rounded-xl transition font-mono uppercase tracking-wider cursor-pointer shadow-md shadow-violet-500/10"
        >
          Launch 5-Tap Quiz
        </button>
      </div>

      {/* Streak, XP & Levels Progression */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
        {/* Level and XP */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-bold font-mono text-xs tracking-tight">Hustler Level {Math.floor(xp / 500) + 1}</span>
          </div>
          <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{xp} total XP</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-zinc-400 font-mono">
            <span>Progress to Level {Math.floor(xp / 500) + 2}</span>
            <span>{xp % 500} / 500 XP</span>
          </div>
          <div className="h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-850 p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${((xp % 500) / 500) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Streak Counter Days Indicator */}
        <div className="border-t border-zinc-800/50 pt-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-bold tracking-tight">Active Login Streak: <span className="text-emerald-400 font-black font-mono">{streak} {streak === 1 ? 'Day' : 'Days'}</span></span>
            </div>
            
            <div className="flex items-center space-x-2">
              {streak > 0 && (
                <button
                  onClick={async () => {
                    try {
                      playSound([523.25, 659.25], 'sine', 0.1);
                      const text = `🔥 STREAK UNLOCKED! I am on a ${streak}-day startup blueprint streak on Million Dollar Ideas! 🚀\n\nActive streak: ${streak} days\nLevel: ${Math.floor(xp / 500) + 1}\n\nCan you beat my streak? Join me offline! 💎`;
                      await navigator.clipboard.writeText(text);
                      setCopiedStreak(true);
                      setTimeout(() => setCopiedStreak(false), 2000);
                      awardXp(150, 'Shared daily streak to social media');
                    } catch (e) {}
                  }}
                  className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-[9px] uppercase font-mono tracking-wider transition hover:bg-emerald-500/20 active:scale-95 cursor-pointer"
                  title="Share your streak"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{copiedStreak ? 'Copied!' : 'Post Streak'}</span>
                </button>
              )}
              {checkedInToday && (
                <span className="text-[9px] font-bold font-mono text-emerald-400 flex items-center space-x-1">
                  <Check className="w-3 h-3" />
                  <span>Checked In Today</span>
                </span>
              )}
            </div>
          </div>

          {/* Streak Unlocks Roadmap */}
          <div className="grid grid-cols-5 gap-1.5 text-center">
            {[1, 2, 3, 5, 7].map((day) => {
              const isActive = streak >= day;
              const hasUnlock = day === 2 ? 'Space Tech' : day === 3 ? 'Web3 & DeFi' : day === 5 ? 'BioHacking' : day === 7 ? 'Crazy Ideas' : null;
              return (
                <div key={day} className={`p-2 rounded-xl border flex flex-col items-center justify-between space-y-1.5 ${
                  isActive 
                    ? 'bg-zinc-850 border-emerald-500/30 text-white' 
                    : 'bg-zinc-950/40 border-zinc-900 text-zinc-600'
                }`}>
                  <span className="text-[8px] font-bold font-mono uppercase">Day {day}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] ${
                    isActive 
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                  }`}>
                    {isActive ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3 text-zinc-750" />}
                  </div>
                  {hasUnlock && (
                    <span className={`text-[7px] font-bold font-mono leading-none tracking-tight block px-1 py-0.5 rounded ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400' 
                        : 'bg-zinc-900 text-zinc-605 border border-zinc-850'
                    }`} title={`Unlocks ${hasUnlock}`}>
                      {day === 2 ? 'Space' : day === 3 ? 'Web3' : day === 5 ? 'Bio' : 'Crazy'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unlocked status text */}
          <p className="text-[10px] text-zinc-400 leading-normal font-sans">
            {streak >= 7 
              ? '🎉 All content unlocked! Space Tech, Web3 & DeFi, BioHacking, and Crazy Ideas Mode are fully available!'
              : streak >= 5
              ? '🚀 BioHacking category unlocked! Maintain consecutive streak to day 7 to unlock Crazy Ideas Mode.'
              : streak >= 3
              ? '🚀 Space Tech & Web3 categories unlocked! Maintain consecutive streak to day 5 to unlock BioHacking.'
              : streak >= 2
              ? '🚀 Space Tech category unlocked! Maintain consecutive streak to day 3 to unlock Web3 & DeFi.'
              : '🔒 Log in consecutive days to unlock rare content categories: Day 2 (Space Tech), Day 3 (Web3), Day 5 (Bio), and Day 7 (Crazy Ideas Mode).'}
          </p>
        </div>
      </div>

      {/* Achievement Badges Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-center space-x-1.5">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="font-bold text-sm tracking-tight text-white">Hustler Achievements</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'pioneer', title: 'Pioneer', desc: 'Generate your first blueprint', xp: '+100 XP' },
            { id: 'vault_keeper', title: 'Vault Keeper', desc: 'Save 3 ideas to local Vault', xp: '+200 XP' },
            { id: 'streak_starter', title: 'Streak Starter', desc: 'Reach a 2-day streak', xp: '+300 XP' },
            { id: 'hustle_legend', title: 'Hustle Legend', desc: 'Reach a 5-day streak', xp: '+500 XP' },
            { id: 'xp_master', title: 'XP Master', desc: 'Earn over 1,000 XP total', xp: '+500 XP' },
            { id: 'unicorn_hunter', title: 'Unicorn Hunter', desc: 'Copy or export Unicorn card', xp: '+400 XP' },
          ].map((b) => {
            const unlocked = badges.includes(b.id);
            return (
              <div key={b.id} className={`p-3 rounded-2xl border transition flex items-start space-x-2.5 ${
                unlocked 
                  ? 'bg-zinc-850/60 border-emerald-500/20' 
                  : 'bg-zinc-950/40 border-zinc-900 opacity-50'
              }`}>
                <div className={`p-2 rounded-xl border flex-shrink-0 ${
                  unlocked 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                }`}>
                  <Award className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[11px] font-bold text-white flex items-center space-x-1">
                    <span>{b.title}</span>
                    {unlocked && <span className="text-[7px] text-emerald-400 font-mono">✔</span>}
                  </p>
                  <p className="text-[9px] text-zinc-400 leading-tight">{b.desc}</p>
                  <p className="text-[8px] font-bold font-mono text-emerald-400">{unlocked ? 'Earned' : b.xp}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* IndexedDB Statistics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-3 right-3 opacity-10">
            <Database className="w-12 h-12 text-white" />
          </div>
          <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
            Blueprints Seeding
          </span>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {stats.totalLoaded}
          </p>
          <p className="text-[10px] text-zinc-400 leading-normal font-sans">
            Side-hustle concepts saved inside local IndexedDB storage.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl space-y-2 relative overflow-hidden">
          <div className="absolute top-3 right-3 opacity-10">
            <CreditCard className="w-12 h-12 text-white" />
          </div>
          <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
            Local Favorites
          </span>
          <p className="text-2xl font-black text-rose-400 font-mono">
            {stats.favoritesCount}
          </p>
          <p className="text-[10px] text-zinc-400 leading-normal font-sans">
            Bookmarked ideas preserved across device restarts.
          </p>
        </div>
      </div>

      {/* Premium Upgrade & Plan Management */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold font-mono tracking-tight text-white uppercase">
                Account Tier:
              </span>
              <span className={`text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded-full ${
                isPremiumUser 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-zinc-950 border border-zinc-800 text-zinc-500'
              }`}>
                {isPremiumUser ? 'Premium Active' : 'Free Sandbox'}
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              {isPremiumUser 
                ? 'Unlimited search filters, premium niches, and water-mark free card sharing unlocked.' 
                : 'Limited to baseline categories and standard watermarked social card downloads.'}
            </p>
          </div>
          {isPremiumUser && <Sparkles className="w-5 h-5 text-emerald-400 fill-current animate-bounce" />}
        </div>

        <button
          onClick={handleTogglePremium}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold text-xs uppercase tracking-wider font-mono transition active:scale-98 cursor-pointer border ${
            isPremiumUser
              ? 'bg-zinc-950 hover:bg-zinc-900 border-zinc-800 text-rose-400 hover:text-rose-300'
              : 'bg-emerald-500 hover:bg-emerald-400 border-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/10'
          }`}
        >
          {isPremiumUser ? (
            <>
              <LogOut className="w-4 h-4" />
              <span>Simulate Cancel Subscription</span>
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              <span>Checkout Premium Pass ($9/mo)</span>
            </>
          )}
        </button>
      </div>

      {/* Monetization Ad Unit */}
      <GoogleAd slot="hustle-hub-mid" />

      {/* Developer Sandbox Controls */}
      <div className="bg-zinc-900/40 border border-zinc-850 rounded-2xl p-4 space-y-4">
        <span className="block text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
          Developer Testing Suite
        </span>

        {/* Simulate Streak Buttons */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold text-zinc-300">Simulate Consecutive Streak:</p>
          <div className="grid grid-cols-5 gap-1 font-mono text-[9px] font-bold uppercase tracking-wide">
            <button
              onClick={() => handleSetStreak(1)}
              className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition cursor-pointer text-center text-zinc-300"
            >
              Day 1
            </button>
            <button
              onClick={() => handleSetStreak(2)}
              className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition cursor-pointer text-center text-emerald-400"
            >
              Day 2
            </button>
            <button
              onClick={() => handleSetStreak(3)}
              className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition cursor-pointer text-center text-cyan-400"
            >
              Day 3
            </button>
            <button
              onClick={() => handleSetStreak(5)}
              className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition cursor-pointer text-center text-pink-400"
            >
              Day 5
            </button>
            <button
              onClick={() => handleSetStreak(7)}
              className="py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg transition cursor-pointer text-center text-purple-450"
            >
              Day 7
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs border-t border-zinc-800/40 pt-3">
          <div className="space-y-0.5">
            <p className="font-bold text-zinc-300">Onboarding Tutorial</p>
            <p className="text-[10px] text-zinc-500">Show the 3-slide launch helper on startup</p>
          </div>
          <button
            onClick={handleTestOnboarding}
            className="flex items-center space-x-1 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-lg text-[10px] uppercase font-mono tracking-wider transition cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Launch Slides</span>
          </button>
        </div>
      </div>

      {/* Sandbox warning banner */}
      <div className="flex items-start space-x-2 text-[10px] text-zinc-500 bg-zinc-950 p-3.5 border border-zinc-900 rounded-xl leading-relaxed font-mono">
        <AlertCircle className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" />
        <span>Sandbox Environment active. All data and payment flows are simulated offline inside your browser's private local sandboxed IndexedDB storage. No real money or telemetry is exchanged.</span>
      </div>

      {/* Founder personality test popup overlay */}
      <FounderQuiz isOpen={showQuiz} onClose={() => setShowQuiz(false)} />
    </div>
  );
}
