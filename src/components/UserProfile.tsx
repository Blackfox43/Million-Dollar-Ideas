import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Mail, Lock, Shield, ArrowRight, LogOut, RefreshCw, 
  CheckCircle, Zap, Award, Flame, Star, AlertTriangle, KeyRound
} from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

import { auth, googleProvider, db as fdb } from '../lib/firebase';
import { useAppStore } from '../store';

// Define gamified tier names based on XP
const getCreatorTier = (xp: number) => {
  if (xp < 250) return { name: 'Novice Side-Hustler', color: 'text-zinc-400', bg: 'bg-zinc-500/10' };
  if (xp < 500) return { name: 'Aspiring Solopreneur', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
  if (xp < 1000) return { name: 'Indie Hacker', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
  if (xp < 2500) return { name: 'Venture Architect', color: 'text-purple-400', bg: 'bg-purple-500/10' };
  return { name: 'Unicorn Hunter', color: 'text-amber-400', bg: 'bg-amber-500/10' };
};

// Available badges mapping for visual rendering
const BADGES_INFO: Record<string, { label: string; desc: string; icon: any; color: string }> = {
  pioneer: { 
    label: 'Pioneer', 
    desc: 'Generated your first side-hustle idea', 
    icon: Zap, 
    color: 'from-amber-500 to-orange-500 text-orange-400' 
  },
  vault_keeper: { 
    label: 'Vault Keeper', 
    desc: 'Saved 3+ startup blueprints to your private vault', 
    icon: Star, 
    color: 'from-blue-500 to-indigo-500 text-indigo-400' 
  },
  streak_starter: { 
    label: 'Streak Starter', 
    desc: 'Achieved a 2-day daily check-in streak', 
    icon: Flame, 
    color: 'from-rose-500 to-pink-500 text-rose-400' 
  },
  hustle_legend: { 
    label: 'Hustle Legend', 
    desc: 'Achieved a 5-day daily check-in streak', 
    icon: Shield, 
    color: 'from-emerald-500 to-teal-500 text-emerald-400' 
  },
  xp_master: { 
    label: 'XP Master', 
    desc: 'Acquired over 1,000 creator experience points', 
    icon: Award, 
    color: 'from-purple-500 to-fuchsia-500 text-fuchsia-400' 
  }
};

export default function UserProfile() {
  const { 
    user, 
    setUser, 
    streak, 
    xp, 
    badges, 
    isPremiumUser, 
    syncWithCloud, 
    uploadLocalStateToCloud 
  } = useAppStore();

  // Auth local state
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Profile settings state
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(user?.displayName || '');

  const tier = getCreatorTier(xp);
  const xpProgressPercent = Math.min(100, Math.floor((xp % 1000) / 10));

  // Play navigation and feedback sound
  const playSound = (freq: number, duration = 0.05) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setErrorMsg(null);
    setAuthLoading(true);

    try {
      if (isLogin) {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        playSound(440, 0.15); // pleasant mid confirmation tone
        await setUser(credential.user);
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (name.trim()) {
          await updateProfile(credential.user, { displayName: name.trim() });
        }
        playSound(523.25, 0.2); // high register happy confirmation tone
        await setUser(credential.user);
      }
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = 'Authentication failed. Please verify your credentials.';
      if (err.code === 'auth/wrong-password') friendlyMessage = 'Incorrect password. Please try again.';
      if (err.code === 'auth/user-not-found') friendlyMessage = 'No account associated with this email.';
      if (err.code === 'auth/email-already-in-use') friendlyMessage = 'This email address is already in use.';
      if (err.code === 'auth/weak-password') friendlyMessage = 'Password must be at least 6 characters.';
      if (err.code === 'auth/operation-not-allowed') {
        friendlyMessage = 'Firebase Error (operation-not-allowed): Email/Password login is disabled in your Firebase console. Go to Build > Authentication > Sign-in Method to enable it, or use Local Sandbox Mode below.';
      }
      setErrorMsg(friendlyMessage);
      playSound(200, 0.3); // warning fail low sound
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg(null);
    setAuthLoading(true);
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      playSound(523.25, 0.25);
      await setUser(credential.user);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Google Sign-In was cancelled. You can try again, or use the Local Sandbox Mode below.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMsg('Firebase Error (operation-not-allowed): Google login is disabled in your Firebase Console. Enable Google under Build > Authentication > Sign-in Method, or use Local Sandbox Mode below.');
      } else {
        setErrorMsg('Google Sign-In was blocked or cancelled. Try email/password registration instead.');
      }
      playSound(200, 0.3);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSandboxMode = async () => {
    setErrorMsg(null);
    setAuthLoading(true);
    try {
      const sandboxUser = {
        uid: 'sandbox_guest_user_id',
        email: 'sandbox.guest@local.test',
        displayName: 'Sandbox Creator (Local)',
        photoURL: '',
        isSandbox: true
      };
      playSound(523.25, 0.25);
      await setUser(sandboxUser);
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (user && !user.isSandbox) {
        await signOut(auth);
      }
      setUser(null);
      playSound(220, 0.2); // log out sweep down sound
      // Clear URL params
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  const handleManualSync = async () => {
    if (!user) return;
    setSyncing(true);
    playSound(400, 0.1);
    try {
      await syncWithCloud();
      playSound(600, 0.15);
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveDisplayName = async () => {
    if (!user || !editNameValue.trim()) return;
    try {
      await updateProfile(user, { displayName: editNameValue.trim() });
      const userRef = doc(fdb, 'users', user.uid);
      await updateDoc(userRef, { displayName: editNameValue.trim() });
      await syncWithCloud();
      setIsEditingName(false);
      playSound(500, 0.1);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-6 pt-8 pb-20 text-zinc-300">
      
      {/* Visual Header Branding */}
      <div className="text-center mb-8 space-y-2">
        <div className="inline-flex items-center justify-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-xs text-emerald-400 font-mono">
          <Shield className="w-3.5 h-3.5 animate-pulse" />
          <span>CLOUD SYNC PLATFORM</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight font-sans uppercase">
          Creator Account
        </h1>
        <p className="text-xs text-zinc-500 leading-relaxed font-mono">
          Back up your progress, accomplishments, XP, and unlock cloud cross-device sync.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!user ? (
          /* AUTHENTICATION SCREEN */
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Background cyber accent decor */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Header Tabs switcher */}
            <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800/80 mb-6">
              <button
                type="button"
                onClick={() => { setIsLogin(true); setErrorMsg(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold font-mono tracking-wider uppercase rounded-xl transition ${
                  isLogin ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setIsLogin(false); setErrorMsg(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold font-mono tracking-wider uppercase rounded-xl transition ${
                  !isLogin ? 'bg-zinc-800 text-emerald-400 shadow' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                Register
              </button>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-2xl text-[11px] font-mono leading-relaxed flex items-start space-x-2 mb-4"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">Creator Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                    <input
                      type="text"
                      placeholder="e.g. Satoshi"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 transition font-sans"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 transition font-sans"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-wider font-mono text-zinc-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-emerald-500/50 transition font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-400 text-zinc-950 hover:bg-emerald-300 disabled:opacity-50 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest font-mono transition shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-2"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                ) : (
                  <>
                    <span>{isLogin ? 'Log In to System' : 'Create Cloud Profile'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* OR line */}
            <div className="flex items-center space-x-3 my-6">
              <div className="h-[1px] bg-zinc-800 flex-1" />
              <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-600">Secure Federated Access</span>
              <div className="h-[1px] bg-zinc-800 flex-1" />
            </div>

            {/* Google provider button */}
            <button
              onClick={handleGoogleAuth}
              disabled={authLoading}
              className="w-full bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-bold py-3 px-4 rounded-2xl transition text-xs font-mono tracking-wider uppercase flex items-center justify-center space-x-2.5 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Authenticate with Google</span>
            </button>

            {/* Local Sandbox Option */}
            <div className="flex items-center space-x-3 my-5">
              <div className="h-[1px] bg-zinc-800/60 flex-1" />
              <span className="text-[9px] font-mono tracking-widest uppercase text-zinc-600">Local Bypass Option</span>
              <div className="h-[1px] bg-zinc-800/60 flex-1" />
            </div>

            <button
              type="button"
              onClick={handleGuestSandboxMode}
              disabled={authLoading}
              className="w-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 font-bold py-3 px-4 rounded-2xl transition text-xs font-mono tracking-wider uppercase flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 shadow-sm"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Use Local Sandbox Mode</span>
            </button>

            <div className="mt-5 text-center text-[10px] font-mono text-zinc-600 leading-relaxed max-w-xs mx-auto">
              <span>By signing in, your current offline XP achievements will sync with this cloud account. Use Sandbox Mode if Auth is not yet enabled in the Firebase Console.</span>
            </div>
          </motion.div>
        ) : (
          /* AUTHENTICATED PROFILE VIEW */
          <motion.div
            key="profile-details"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Sync bar */}
            <div className="bg-zinc-900 border border-zinc-800 p-3.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-zinc-400">
                  Secure Cloud Session
                </span>
              </div>
              <button
                onClick={handleManualSync}
                disabled={syncing}
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold font-mono uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer bg-emerald-500/5 hover:bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                <span>{syncing ? 'Syncing...' : 'Force Sync'}</span>
              </button>
            </div>

            {/* Profile main Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center space-x-4">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl border-2 border-emerald-500/40 p-0.5 bg-zinc-950 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-emerald-400 border-2 border-emerald-500/20">
                    <User className="w-7 h-7" />
                  </div>
                )}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center space-x-2">
                    {isEditingName ? (
                      <div className="flex items-center space-x-1">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="bg-zinc-950 border border-zinc-800 rounded px-2 py-0.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                        />
                        <button
                          onClick={handleSaveDisplayName}
                          className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-1.5 py-0.5"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setIsEditingName(false)}
                          className="text-xs text-zinc-500 hover:text-zinc-300 px-1"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-lg font-extrabold text-white font-sans tracking-tight">
                          {user.displayName || 'Anonymous Creator'}
                        </h2>
                        <button
                          onClick={() => {
                            setEditNameValue(user.displayName || '');
                            setIsEditingName(true);
                          }}
                          className="text-[9px] font-mono tracking-widest text-zinc-500 hover:text-zinc-300 uppercase underline"
                        >
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono flex items-center space-x-1">
                    <Mail className="w-3 h-3 inline text-zinc-600 mr-1 shrink-0" />
                    <span>{user.email}</span>
                  </p>
                  
                  {isPremiumUser ? (
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-[9px] font-black tracking-widest uppercase font-mono rounded-full text-emerald-400">
                      <span>PREMIUM CREATOR</span>
                    </div>
                  ) : (
                    <div className="inline-flex items-center space-x-1 px-2.5 py-0.5 bg-zinc-950 border border-zinc-800 text-[9px] font-bold tracking-widest uppercase font-mono rounded-full text-zinc-500">
                      <span>STANDARD PLAN</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats highlights */}
              <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-zinc-800/60 text-center">
                <div className="bg-zinc-950/60 rounded-2xl p-3 border border-zinc-800/40">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">XP Level Progress</div>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-xl font-black text-emerald-400 font-mono">Lvl {Math.floor(xp / 1000) + 1}</span>
                    <span className="text-xs text-zinc-500 font-mono">({xp} XP)</span>
                  </div>
                </div>
                <div className="bg-zinc-950/60 rounded-2xl p-3 border border-zinc-800/40">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider mb-1">Check-in Streak</div>
                  <div className="flex items-baseline justify-center space-x-1">
                    <span className="text-xl font-black text-rose-500 font-mono flex items-center">
                      <Flame className="w-4 h-4 fill-rose-500/10 mr-1 shrink-0" />
                      {streak}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono">days</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gamification Progress Bar */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold text-white font-mono uppercase tracking-wider">Level Progression</span>
                <span className="text-xs font-black text-emerald-400 font-mono">{xpProgressPercent}%</span>
              </div>
              <div className="w-full bg-zinc-950 rounded-full h-3.5 border border-zinc-800 p-0.5 mb-4">
                <div 
                  style={{ width: `${xpProgressPercent}%` }} 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500 shadow-glow" 
                />
              </div>
              
              <div className={`p-4 rounded-2xl border ${tier.bg} flex items-start space-x-3`}>
                <div className="p-2 bg-zinc-950 rounded-xl border border-zinc-800 text-emerald-400 shrink-0">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">Rank: {tier.name}</h4>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-0.5">
                    Generate ideas, save items, and maintain check-in streaks to earn XP, level up, and unlock rare special niches!
                  </p>
                </div>
              </div>
            </div>

            {/* Badges / Achievements Collection */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-md space-y-4">
              <div>
                <h3 className="text-sm font-black text-white font-mono uppercase tracking-wider">Accomplishment Badges</h3>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Earned {badges.length} of {Object.keys(BADGES_INFO).length} available achievement medals.
                </p>
              </div>

              <div className="space-y-3">
                {Object.entries(BADGES_INFO).map(([badgeId, info]) => {
                  const hasBadge = badges.includes(badgeId);
                  const IconComponent = info.icon;

                  return (
                    <div 
                      key={badgeId}
                      className={`flex items-center space-x-3.5 p-3 rounded-2xl border transition ${
                        hasBadge 
                          ? 'bg-zinc-950/40 border-zinc-800/80' 
                          : 'bg-zinc-950/20 border-zinc-900/60 opacity-40 select-none'
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl border ${
                        hasBadge 
                          ? 'bg-gradient-to-br ' + info.color + '/15 border-zinc-700/60' 
                          : 'bg-zinc-950 border-zinc-900 text-zinc-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 space-y-0.5 text-left">
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold uppercase tracking-wider font-mono ${hasBadge ? 'text-white' : 'text-zinc-500'}`}>
                            {info.label}
                          </span>
                          {hasBadge && (
                            <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-md border border-emerald-400/20">
                              Earned
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">{info.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              className="w-full bg-zinc-900/60 hover:bg-rose-500/10 border border-zinc-800 hover:border-rose-500/20 text-zinc-400 hover:text-rose-400 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-widest font-mono transition flex items-center justify-center space-x-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
