import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lightbulb, Zap, Share2, ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '../store';

export default function Onboarding() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);

  const slides = [
    {
      title: 'Steal Your Next $1M Idea',
      description: 'Unlock 1,000+ hand-vetted, highly monetizable startup and side-hustle blueprints designed for lightning-fast execution.',
      icon: <Lightbulb className="w-16 h-16 text-emerald-400" />,
      badge: 'PROVEN BLUEPRINTS',
      color: 'from-emerald-500/20 to-teal-500/10',
    },
    {
      title: '100% Offline & No Latency',
      description: 'Zero wait times, zero network dependency. Generate high-quality ideas in subways, flights, or off-grid remote cabins instantly.',
      icon: <Zap className="w-16 h-16 text-amber-400" />,
      badge: 'SPEED & PRIVACY',
      color: 'from-amber-500/20 to-orange-500/10',
    },
    {
      title: '1-Tap Export & Share',
      description: 'Instantly copy monetization paths, save favorites locally, or export stunning high-resolution social media cards with a single tap.',
      icon: <Share2 className="w-16 h-16 text-cyan-400" />,
      badge: 'MARKETING READY',
      color: 'from-cyan-500/20 to-blue-500/10',
    },
  ];

  // Synthesize a clean synth bleep for gamified tactile feedback
  const playSound = (freq: number, type: OscillatorType = 'sine', duration: number = 0.08) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext failed or blocked
    }
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      playSound(440, 'triangle', 0.1);
      setCurrentSlide(currentSlide + 1);
    } else {
      playSound(587.33, 'sine', 0.15); // high pitch perfect 5th bleep
      completeOnboarding();
    }
  };

  const handleSkip = () => {
    playSound(330, 'sine', 0.08);
    completeOnboarding();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Top Header */}
      <div className="flex justify-between items-center px-6 pt-8 pb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-zinc-950 text-lg shadow-lg shadow-emerald-500/20">
            $
          </div>
          <span className="font-bold tracking-tight text-sm">MILLION DOLLAR IDEAS</span>
        </div>
        {currentSlide < slides.length - 1 && (
          <button
            onClick={handleSkip}
            className="text-xs text-zinc-400 hover:text-white transition font-medium tracking-wide uppercase px-3 py-1.5 rounded-full hover:bg-zinc-900 border border-transparent hover:border-zinc-800"
          >
            Skip
          </button>
        )}
      </div>

      {/* Main Slide Carousel */}
      <div className="flex-1 flex items-center justify-center px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 150 }}
            className={`w-full max-w-sm rounded-3xl bg-gradient-to-b ${slides[currentSlide].color} border border-zinc-800/80 p-8 flex flex-col items-center text-center shadow-2xl shadow-black/40 backdrop-blur-sm relative overflow-hidden`}
          >
            {/* Glow Accent Circle */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-4 inline-flex items-center justify-center px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/60 text-[10px] font-bold tracking-widest text-zinc-400 uppercase">
              {slides[currentSlide].badge}
            </div>

            <div className="my-6 p-4 bg-zinc-900/50 rounded-2xl border border-zinc-800/40 shadow-inner">
              {slides[currentSlide].icon}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-white mb-3">
              {slides[currentSlide].title}
            </h2>

            <p className="text-sm text-zinc-300 leading-relaxed max-w-xs">
              {slides[currentSlide].description}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls */}
      <div className="px-6 pb-12 flex flex-col items-center space-y-6">
        {/* Progress dots */}
        <div className="flex space-x-2">
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => {
                playSound(350 + index * 50, 'sine', 0.05);
                setCurrentSlide(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide ? 'w-6 bg-emerald-500' : 'w-1.5 bg-zinc-800 hover:bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full max-w-xs flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/25 active:scale-98 transition transform cursor-pointer group"
        >
          <span>{currentSlide === slides.length - 1 ? "Let's Hustle" : 'Continue'}</span>
          {currentSlide === slides.length - 1 ? (
            <Play className="w-5 h-5 fill-current transition-transform group-hover:translate-x-0.5" />
          ) : (
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
          )}
        </button>

        <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
          OFFLINE SECURE • NO CREDIT CARD REQUIRED
        </span>
      </div>
    </div>
  );
}
