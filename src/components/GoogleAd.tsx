import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Megaphone, Info, ExternalLink, HelpCircle, Check, Settings, Code, RefreshCw } from 'lucide-react';

interface GoogleAdProps {
  slot?: string; // Google AdSense Ad Slot ID
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
  label?: string; // Optional custom ad label
}

// Fun startup-themed mock ads for developer / sandbox mode
const MOCK_ADS = [
  {
    title: "🤖 Antigravity AI Co-Founder",
    desc: "Tired of arguing about equity? Hire an AI co-founder who writes pristine code, designs gorgeous layouts, and never sleeps.",
    cta: "Hire AI Partner",
    badge: "Sponsored",
    theme: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400"
  },
  {
    title: "⚡ Antigravity Energy Drink",
    desc: "Zero gravity, maximum focus. Formulated with pure cognitive-boosting compounds for solo developers pushing to production.",
    cta: "Order Focus Fuel",
    badge: "Featured Ad",
    theme: "from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-400"
  },
  {
    title: "🚀 MicroSaaS Rocket Pack",
    desc: "Skip auth, billing, and database setup. Deploy a complete, production-ready SaaS in 5 minutes with our ultimate starter kit.",
    cta: "Get Boilerplate",
    badge: "Ad",
    theme: "from-indigo-500/10 to-purple-500/5 border-indigo-500/20 text-indigo-400"
  },
  {
    title: "☕ Pitch Meeting Roast",
    desc: "Medium roast coffee with high-octane caffeine. Sourced from high-altitude farms and roasted to survive the toughest pitch meetings.",
    cta: "Brew Success",
    badge: "Startup Fuel",
    theme: "from-rose-500/10 to-pink-500/5 border-rose-500/20 text-rose-400"
  },
  {
    title: "🛡️ Stack Underflow Insurance",
    desc: "Protect your project from sudden API deprecations and breaking framework updates. Rest easy while your code does its thing.",
    cta: "Calculate Quote",
    badge: "Partner Ad",
    theme: "from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-400"
  }
];

export default function GoogleAd({
  slot = '1234567890',
  format = 'auto',
  responsive = true,
  className = '',
  label = 'ADVERTISEMENT'
}: GoogleAdProps) {
  const metaEnv = (import.meta as any).env;
  const publisherId = metaEnv?.VITE_GOOGLE_ADSENSE_CLIENT_ID || 'ca-pub-2969119962603598';
  const isProd = !!metaEnv?.PROD && publisherId && publisherId !== 'ca-pub-placeholder';

  const adRef = useRef<HTMLModElement | null>(null);
  const [adIndex, setAdIndex] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const [pushed, setPushed] = useState(false);

  // Rotate mock ad index on mount
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * MOCK_ADS.length);
    setAdIndex(randomIndex);
  }, []);

  // Live Google AdSense initialization with size/duplicate-check protection
  useEffect(() => {
    if (!isProd || pushed) return;

    // Load AdSense Script if not loaded yet
    const scriptId = 'google-adsense-script';
    if (!document.getElementById(scriptId)) {
      try {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      } catch (err) {
        console.error("AdSense script load failed:", err);
      }
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const el = adRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        // Ensure the slot actually has width (not hidden/0 width during layout transition)
        // and does not already have an active/finished status tag
        if (rect.width > 0) {
          clearInterval(interval);
          if (!el.hasAttribute('data-adsbygoogle-status') && !pushed) {
            try {
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
              setPushed(true);
              setAdLoaded(true);
            } catch (e) {
              console.error("AdSense placement failed:", e);
              setAdError(true);
            }
          }
        }
      }
      if (attempts > 50) {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isProd, publisherId, pushed]);

  const mockAd = MOCK_ADS[adIndex];

  // Manual rotator
  const handleNextAd = () => {
    setAdIndex((prev) => (prev + 1) % MOCK_ADS.length);
  };

  return (
    <div className={`relative w-full my-4 ${className}`} id={`google-ad-${slot}`}>
      {/* Tiny subtle ad notice tag */}
      <div className="flex justify-between items-center px-1 mb-1 text-[8px] font-mono tracking-widest text-zinc-500 uppercase">
        <span className="flex items-center space-x-1">
          <Megaphone className="w-2.5 h-2.5" />
          <span>{label}</span>
        </span>
        <button
          onClick={() => setShowConsole(!showConsole)}
          className="hover:text-emerald-400 transition flex items-center space-x-1 cursor-pointer"
          title="Ad Customization Console"
        >
          <Settings className="w-2.5 h-2.5" />
          <span>{isProd ? 'LIVE ADSENSE' : 'SANDBOX / SETUP'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showConsole ? (
          <motion.div
            key="console"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-xs space-y-3 shadow-xl relative overflow-hidden"
          >
            {/* Ambient pattern */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full pointer-events-none" />

            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <div className="flex items-center space-x-2 text-emerald-400">
                <Code className="w-4 h-4" />
                <span className="font-mono font-bold uppercase tracking-wider text-[10px]">Google Ads Config Console</span>
              </div>
              <button
                onClick={() => setShowConsole(false)}
                className="text-zinc-500 hover:text-white font-mono text-[10px] uppercase cursor-pointer"
              >
                Close [x]
              </button>
            </div>

            <div className="space-y-2 text-[11px] text-zinc-400 leading-relaxed font-sans">
              <p>
                To replace these startup-themed interactive sandbox banners with your actual **Google AdSense** ads:
              </p>
              <div className="bg-zinc-950 p-2.5 rounded-lg font-mono text-[10px] space-y-1.5 border border-zinc-900">
                <div className="flex justify-between">
                  <span className="text-zinc-500">1. Client ID (.env):</span>
                  <span className={publisherId ? "text-emerald-400" : "text-rose-400"}>
                    {publisherId ? publisherId : "NOT DECLARED (ca-pub-...)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">2. Current Ad Slot:</span>
                  <span className="text-zinc-300">slot-{slot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">3. Mode:</span>
                  <span className={isProd ? "text-emerald-400 font-bold" : "text-amber-400"}>
                    {isProd ? "PRODUCTION (Live)" : "DEVELOPMENT (Sandbox)"}
                  </span>
                </div>
              </div>
              <div className="space-y-1 pl-1">
                <p className="flex items-center space-x-1.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Declare <code className="text-white font-mono">VITE_GOOGLE_ADSENSE_CLIENT_ID</code> in your Netlify/hosting environment.</span>
                </p>
                <p className="flex items-center space-x-1.5 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>The script will auto-inject and render standard responsive display elements.</span>
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-zinc-800/40">
              <span className="text-[9px] text-zinc-500 font-mono">Status: {isProd ? "Active & Syncing" : "Offline Sandbox OK"}</span>
              <button
                onClick={() => {
                  setShowConsole(false);
                }}
                className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 font-mono font-bold text-[9px] uppercase tracking-wider cursor-pointer"
              >
                Accept Settings
              </button>
            </div>
          </motion.div>
        ) : isProd && !adError ? (
          /* Live Google AdSense block */
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-1 flex items-center justify-center min-h-[100px] overflow-hidden">
            <ins
              ref={adRef as any}
              className="adsbygoogle w-full"
              style={{ display: 'block', minHeight: '90px' }}
              data-ad-client={publisherId}
              data-ad-slot={slot}
              data-ad-format={format}
              data-full-width-responsive={responsive ? 'true' : 'false'}
            />
          </div>
        ) : (
          /* High-fidelity custom sandbox ad placeholder with rotatable startup micro-ads */
          <motion.div
            key={adIndex}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className={`relative bg-gradient-to-r border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 overflow-hidden shadow-lg ${mockAd.theme}`}
          >
            {/* Visual background accents */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/2 opacity-20 rounded-full blur-xl pointer-events-none" />

            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-1.5">
                <span className="text-[8px] font-mono tracking-widest font-black uppercase bg-white/10 px-1.5 py-0.5 rounded border border-white/10">
                  {mockAd.badge}
                </span>
                <span className="font-bold text-xs text-white tracking-tight flex items-center gap-1">
                  {mockAd.title}
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal max-w-md">
                {mockAd.desc}
              </p>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800/45">
              {/* Rotate button */}
              <button
                onClick={handleNextAd}
                className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40 rounded-lg border border-transparent hover:border-zinc-800/40 transition cursor-pointer"
                title="View Next Demo Ad"
              >
                <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              </button>

              <button
                onClick={() => setShowConsole(true)}
                className="px-3.5 py-1.5 bg-white/5 hover:bg-white/10 text-white hover:text-emerald-400 rounded-xl border border-white/10 text-[9px] font-bold font-mono uppercase tracking-wider transition-all duration-150 flex items-center space-x-1.5 cursor-pointer shadow-sm hover:shadow-emerald-400/5 hover:-translate-y-0.5"
              >
                <span>{mockAd.cta}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
