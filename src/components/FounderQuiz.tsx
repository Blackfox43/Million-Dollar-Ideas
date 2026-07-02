import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Check, Award, Copy, Download, RefreshCw, HelpCircle, ArrowRight, Share2 } from 'lucide-react';
import { useAppStore } from '../store';

interface FounderQuizProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: "Choose your ideal workspace or 'HQ' structure:",
    options: [
      { text: "🖥️ Cyber-bunker with 4 monitors & screaming GPUs", key: "A" },
      { text: "☕ Local coffee shop, swapping stories with mom-and-pop owners", key: "B" },
      { text: "🌴 Bali beach bungalow, shipping code from a breezy hammock", key: "C" },
      { text: "🏢 Sleek high-rise boardroom with spreadsheets and clean desks", key: "D" }
    ]
  },
  {
    id: 2,
    question: "How does your dream venture generate cash?",
    options: [
      { text: "⚡ Micro-transactions via APIs, serverless computing, or tokenized credits", key: "A" },
      { text: "💵 Straight cash or simple monthly retainer from real-world local shops", key: "B" },
      { text: "📣 Attention arbitrage: sponsoring newsletters, feeds, and community ads", key: "C" },
      { text: "📁 Massive annual enterprise contracts with 6-month sales cycles", key: "D" }
    ]
  },
  {
    id: 3,
    question: "What is your primary entrepreneurial superpower?",
    options: [
      { text: "🛠️ Coding a complete full-stack prototype in a single weekend", key: "A" },
      { text: "🤝 Listening to real human frustrations and closing sales over lunch", key: "B" },
      { text: "✍️ Writing a single social post that gains 1,000,000 organic views", key: "C" },
      { text: "📊 Organizing massive database architectures and scaling bulletproof pipelines", key: "D" }
    ]
  },
  {
    id: 4,
    question: "What keeps you up at night with anxiety?",
    options: [
      { text: "🚨 Breaking database schemas, API deprecations, or sudden server downtime", key: "A" },
      { text: "🏠 Leaving your comfortable local community or real-world hometown", key: "B" },
      { text: "🚫 Sudden search algorithm updates or getting shadowbanned on networks", key: "C" },
      { text: "📉 Tiny discrepancies in quarterly compliance reports or financial sheets", key: "D" }
    ]
  },
  {
    id: 5,
    question: "What is the ultimate victory for your startup career?",
    options: [
      { text: "🧠 Reaching the AI singularity or selling your micro-wrapper to a tech giant", key: "A" },
      { text: "👑 Becoming the highly respected 'Tech King' of small business networks", key: "B" },
      { text: "🏖️ Retiring at 25 with a portfolio of self-sustaining micro-cash flow machines", key: "C" },
      { text: "🔔 Stepping onto the podium to ring the Nasdaq opening bell for your IPO", key: "D" }
    ]
  }
];

const FOUNDER_TYPES = [
  {
    id: "ai_hustler",
    name: "The AI Hustler",
    tagline: "The API-Integrating Speedrunner",
    desc: "You build full-stack micro-SaaS wrappers in record time. You view ChatGPT as your primary co-founder, rely on serverless compute, and value execution speed above theoretical architecture.",
    fromColor: "#10b981",
    toColor: "#14b8a6",
    emoji: "🤖",
    idea: "A micro-agent that auto-generates custom tax write-offs for self-employed creators based on statement feeds.",
    streakBadge: "🤖 AI Champion"
  },
  {
    id: "local_king",
    name: "The Local King",
    tagline: "The Community-Backed Merchant",
    desc: "You thrive on real-world connections. You don't care about SF venture capital; you love helping mom-and-pop shops automate their newsletters, scheduling, and local SEO to generate solid monthly cash flow.",
    fromColor: "#fbbf24",
    toColor: "#f97316",
    emoji: "👑",
    idea: "A local-first booking assistant for plumbing and electrical workshops that works entirely via automated SMS.",
    streakBadge: "🤝 Local Ally"
  },
  {
    id: "viral_alchemist",
    name: "The Viral Alchemist",
    tagline: "The Attention-Harvesting Wizard",
    desc: "You turn eyeballs into bank deposits. You can drive 10,000 visitors to a simple landing page using a clever Twitter thread or a short vertical loop. To you, audience is the ultimate leverage.",
    fromColor: "#a78bfa",
    toColor: "#ec4899",
    emoji: "🧙‍♂️",
    idea: "A directory of secret, high-converting vertical video hook templates used by top marketing agencies to double lead capture.",
    streakBadge: "🔥 Buzz Master"
  },
  {
    id: "indie_soloist",
    name: "The Indie Soloist",
    tagline: "The Lifestyle-First Craftsperson",
    desc: "You refuse VC funding and massive corporate bloat. You want a portfolio of beautiful, highly functional, small indie apps that you can manage by yourself on a beach, giving you absolute freedom.",
    fromColor: "#22d3ee",
    toColor: "#3b82f6",
    emoji: "🏖️",
    idea: "An elegant, completely offline journaling app designed for programmers that integrates markdown notes with habit tracking.",
    streakBadge: "🛶 Solo Sailor"
  },
  {
    id: "enterprise_titan",
    name: "The Enterprise Titan",
    tagline: "The Boardroom Systems Architect",
    desc: "You are not intimidated by 6-month sales cycles, compliance audits, or 25-page contracts. You know where the real enterprise budgets are and design highly secured systems that solve expensive corporate problems.",
    fromColor: "#f43f5e",
    toColor: "#db2777",
    emoji: "🏢",
    idea: "An automated internal compliance auditor for regional healthcare clinics that scans medical records for billing discrepancies.",
    streakBadge: "🏛️ Pillar of Industry"
  },
  {
    id: "bootstrapped_wizard",
    name: "The Bootstrapped Wizard",
    tagline: "The Organic Growth Purist",
    desc: "You write pristine, highly optimized code. You spend exactly $0 on marketing because your products solve issues so cleanly that users become your sales force. You grow slowly but with bulletproof metrics.",
    fromColor: "#2dd4bf",
    toColor: "#059669",
    emoji: "🪄",
    idea: "A lightning-fast database explorer utility that runs locally inside the browser memory without any server overhead.",
    streakBadge: "📖 Lore Master"
  },
  {
    id: "moonshot_dreamer",
    name: "The Moonshot Dreamer",
    tagline: "The Sci-Fi Visionary",
    desc: "You think standard web apps are boring. You want to build space technology, biotech, or futuristic hardware. You are driven by a deep desire to leave a massive dent in the universe, regardless of difficulty.",
    fromColor: "#818cf8",
    toColor: "#4f46e5",
    emoji: "🚀",
    idea: "A satellite telemetry decoder that tracks global atmospheric greenhouse gases and packages it for carbon-credit hedge funds.",
    streakBadge: "🪐 Galactic Explorer"
  },
  {
    id: "arbitrage_ninja",
    name: "The Arbitrage Ninja",
    tagline: "The Trend-Flipping Specialist",
    desc: "You spot micro-trends months before they hit mainstream news. You build quick, functional MVPs, seed them with initial SEO traffic, and sell them on digital business marketplaces before competitors catch up.",
    fromColor: "#f472b6",
    toColor: "#e11d48",
    emoji: "🥷",
    idea: "A directory tracker that scrapes expiring domains and analyzes their residual SEO authority to build instant niche blogs.",
    streakBadge: "📈 Master Trader"
  }
];

export default function FounderQuiz({ isOpen, onClose }: FounderQuizProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { awardXp, unlockBadge } = useAppStore();

  const [step, setStep] = useState<number>(0); // 0: intro, 1-5: questions, 6: results
  const [answers, setAnswers] = useState<string[]>([]);
  const [resultType, setResultType] = useState<typeof FOUNDER_TYPES[0] | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // Sound feedback synthesizer
  const playSound = (freqs: number[], duration: number = 0.08) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      freqs.forEach((freq, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
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

  const handleStart = () => {
    playSound([392.00, 523.25], 0.1);
    setAnswers([]);
    setStep(1);
  };

  const handleSelectOption = (key: string) => {
    playSound([523.25], 0.06);
    const newAnswers = [...answers, key];
    setAnswers(newAnswers);

    if (step < 5) {
      setStep(step + 1);
    } else {
      // Calculate founder type
      const computed = calculateFounderType(newAnswers);
      setResultType(computed);
      setStep(6);
      
      // Award XP for completion
      awardXp(250, 'Completed Founder Type Quiz');
      unlockBadge('xp_master'); // Try unlocking XP badge if threshold met
      
      playSound([523.25, 659.25, 783.99, 1046.50], 0.15); // Celebration arpeggio
    }
  };

  const calculateFounderType = (ansList: string[]) => {
    const counts = { A: 0, B: 0, C: 0, D: 0 };
    ansList.forEach(ans => {
      if (ans === 'A') counts.A++;
      else if (ans === 'B') counts.B++;
      else if (ans === 'C') counts.C++;
      else if (ans === 'D') counts.D++;
    });

    // Scoring conditions
    if (counts.A >= 3) return FOUNDER_TYPES.find(f => f.id === 'ai_hustler') || FOUNDER_TYPES[0];
    if (counts.B >= 3) return FOUNDER_TYPES.find(f => f.id === 'local_king') || FOUNDER_TYPES[1];
    if (counts.C >= 3) return FOUNDER_TYPES.find(f => f.id === 'viral_alchemist') || FOUNDER_TYPES[2];
    if (counts.D >= 3) return FOUNDER_TYPES.find(f => f.id === 'enterprise_titan') || FOUNDER_TYPES[4];

    // Combinations
    if (counts.A >= 1 && counts.C >= 1 && counts.B === 0) {
      return FOUNDER_TYPES.find(f => f.id === 'arbitrage_ninja') || FOUNDER_TYPES[7];
    }
    if (counts.C >= 1 && counts.B >= 1 && counts.A >= 1) {
      return FOUNDER_TYPES.find(f => f.id === 'indie_soloist') || FOUNDER_TYPES[3];
    }
    if (counts.D >= 1 && counts.A >= 1 && counts.C === 0) {
      return FOUNDER_TYPES.find(f => f.id === 'bootstrapped_wizard') || FOUNDER_TYPES[5];
    }
    if (counts.A >= 1 && counts.D >= 1 && counts.C >= 1) {
      return FOUNDER_TYPES.find(f => f.id === 'moonshot_dreamer') || FOUNDER_TYPES[6];
    }

    // Default hash fallback
    const sum = ansList.reduce((acc, val) => acc + val.charCodeAt(0), 0);
    const index = sum % FOUNDER_TYPES.length;
    return FOUNDER_TYPES[index];
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
  };

  const drawResultCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !resultType) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear Canvas - 1080x1080 high-res
    ctx.clearRect(0, 0, 1080, 1080);

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
    gradient.addColorStop(0, resultType.fromColor);
    gradient.addColorStop(1, '#0c0a09'); // blend down into deep background
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1080);

    // 2. Draw subtle grid accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 1080; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1080);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(1080, i);
      ctx.stroke();
    }

    // 3. Draw rounded inner card
    const cardX = 80;
    const cardY = 80;
    const cardW = 920;
    const cardH = 920;
    const radius = 32;

    ctx.fillStyle = 'rgba(10, 10, 10, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(cardX + radius, cardY);
    ctx.lineTo(cardX + cardW - radius, cardY);
    ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + radius);
    ctx.lineTo(cardX + cardW, cardY + cardH - radius);
    ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - radius, cardY + cardH);
    ctx.lineTo(cardX + radius, cardY + cardH);
    ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - radius);
    ctx.lineTo(cardX, cardY + radius);
    ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Large emoji background element
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.font = '280px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(resultType.emoji, 540, 560);

    // 5. Card text elements
    ctx.textAlign = 'left';
    ctx.fillStyle = resultType.fromColor;
    ctx.font = 'bold 20px monospace';
    ctx.fillText('OFFLINE FOUNDER INTELLIGENCE REPORT', 140, 160);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 56px "Inter", sans-serif';
    ctx.fillText(resultType.name.toUpperCase(), 140, 235);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = 'italic 24px "Inter", sans-serif';
    ctx.fillText(`"${resultType.tagline}"`, 140, 285);

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.beginPath();
    ctx.moveTo(140, 330);
    ctx.lineTo(940, 330);
    ctx.stroke();

    // Description
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '22px "Inter", sans-serif';
    const endDescY = wrapText(ctx, resultType.desc, 140, 380, 800, 36);

    // Match Idea section
    ctx.fillStyle = resultType.fromColor;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('SIGNATURE COMPATIBLE BLUEPRINT concept:', 140, endDescY + 65);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold italic 24px "Inter", sans-serif';
    const endIdeaY = wrapText(ctx, `"${resultType.idea}"`, 140, endDescY + 110, 800, 34);

    // Footer Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ DISCOVER YOUR PERSONALITY • MILLIONDOLLARIDEAS.APP ⚡', 540, 940);
    ctx.textAlign = 'left';
  };

  useEffect(() => {
    if (step === 6 && resultType) {
      const timer = setTimeout(() => {
        drawResultCard();
        if (canvasRef.current) {
          try {
            setPreviewSrc(canvasRef.current.toDataURL('image/png'));
          } catch (e) {}
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [step, resultType]);

  const handleCopy = async () => {
    if (!resultType) return;
    try {
      playSound([523.25, 659.25], 0.1);
      const text = `🧠 FOUNDER TYPE: ${resultType.name.toUpperCase()} ⚡\n"${resultType.tagline}"\n\n👉 ${resultType.desc}\n\nRecommended Starter Idea:\n💡 "${resultType.idea}"\n\nFind your startup archetype on Million Dollar Ideas! 🚀`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      awardXp(100, 'Shared founder type result');
    } catch (e) {}
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas || !resultType) return;
    playSound([440, 554.37, 659.25, 880], 0.12);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const slug = resultType.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    link.download = `founder_type_${slug}.png`;
    link.href = dataUrl;
    link.click();

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleReset = () => {
    playSound([293.66, 392.00], 0.08);
    setAnswers([]);
    setStep(0);
    setResultType(null);
    setPreviewSrc(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative flex flex-col space-y-6"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
              Founder Personality Quiz
            </h4>
          </div>
          <button
            onClick={() => {
              playSound([196], 0.05);
              onClose();
            }}
            className="text-zinc-400 hover:text-white p-1.5 hover:bg-zinc-800 border border-transparent hover:border-zinc-700 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 0: INTRO SCREEN */}
          {step === 0 && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center py-6 space-y-6 flex flex-col items-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl animate-bounce-subtle">
                🧠
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold tracking-tight text-white font-sans">
                  Which Founder Archetype Are You?
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Discover your core business psychology in <span className="text-white font-bold font-mono">5 simple taps</span>. Get matched with 1 of 8 unique founder archetypes and unlock custom recommended business ideas!
                </p>
              </div>

              <div className="bg-zinc-950/40 border border-zinc-850 p-4.5 rounded-2xl w-full text-[10px] text-zinc-400 font-mono space-y-2 leading-relaxed text-left">
                <p className="text-emerald-400 font-bold uppercase tracking-wider">🔬 THE ARCHETYPES ROADMAP:</p>
                <div className="grid grid-cols-2 gap-2 text-[9px]">
                  <span className="flex items-center"><span className="mr-1.5">🤖</span> The AI Hustler</span>
                  <span className="flex items-center"><span className="mr-1.5">👑</span> The Local King</span>
                  <span className="flex items-center"><span className="mr-1.5">🧙‍♂️</span> The Viral Alchemist</span>
                  <span className="flex items-center"><span className="mr-1.5">🏖️</span> The Indie Soloist</span>
                  <span className="flex items-center"><span className="mr-1.5">🏢</span> The Enterprise Titan</span>
                  <span className="flex items-center"><span className="mr-1.5">🪄</span> The Bootstrapped Wizard</span>
                  <span className="flex items-center"><span className="mr-1.5">🚀</span> The Moonshot Dreamer</span>
                  <span className="flex items-center"><span className="mr-1.5">🥷</span> The Arbitrage Ninja</span>
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-2xl text-xs uppercase tracking-widest font-mono transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-emerald-500/10"
              >
                <span>Launch Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* STEPS 1 TO 5: QUESTIONS SCREEN */}
          {step >= 1 && step <= 5 && (
            <motion.div
              key={`question-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 text-left"
            >
              {/* Progress pill indicator */}
              <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                <span>QUESTION {step} OF 5</span>
                <span className="text-emerald-400 font-bold">{Math.round((step / 5) * 100)}% COMPLETE</span>
              </div>
              <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-850">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300" 
                  style={{ width: `${(step / 5) * 100}%` }}
                />
              </div>

              {/* Active Question Title */}
              <h3 className="text-sm font-bold text-zinc-200 py-2 leading-relaxed">
                {QUESTIONS[step - 1].question}
              </h3>

              {/* Option Cards */}
              <div className="space-y-2.5 pt-1">
                {QUESTIONS[step - 1].options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleSelectOption(opt.key)}
                    className="w-full text-left p-3.5 bg-zinc-950/45 hover:bg-zinc-850 border border-zinc-900 hover:border-zinc-800 rounded-2xl text-xs text-zinc-300 leading-relaxed font-sans transition-all active:scale-98 cursor-pointer flex items-center justify-between"
                  >
                    <span>{opt.text}</span>
                    <span className="w-5 h-5 bg-zinc-900 rounded-full border border-zinc-800 text-[8px] font-mono font-bold flex items-center justify-center text-zinc-500 flex-shrink-0 ml-3">
                      {opt.key}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 6: RESULTS SCREEN */}
          {step === 6 && resultType && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5 text-center"
            >
              {/* Hidden Canvas used to generate downloadable PNG image */}
              <canvas
                ref={canvasRef}
                width={1080}
                height={1080}
                className="hidden"
              />

              {/* Premium Preview Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950/60 flex items-center justify-center shadow-inner">
                {previewSrc ? (
                  <img
                    src={previewSrc}
                    alt="Founder Type Real-time Graphic Preview"
                    className="w-full h-full object-contain pointer-events-none"
                  />
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest animate-pulse">
                    Rendering Intelligence Graphic...
                  </span>
                )}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded bg-black/60 text-[8px] font-mono tracking-widest text-zinc-400 uppercase">
                  Archetype Card
                </div>
              </div>

              {/* Custom Streak Unlocks reward message */}
              <div className="p-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl text-[10px] font-mono text-emerald-400 text-left flex items-center space-x-2.5">
                <span className="text-xl leading-none">🎖️</span>
                <div>
                  <p className="font-bold uppercase tracking-wider">OFFLINE XP UNLOCKED (+250 XP)</p>
                  <p className="text-zinc-400 leading-normal font-sans text-[9px]">Your founder archetype has been saved to your local profile. Everyone is sharing their results on TikTok/Twitter!</p>
                </div>
              </div>

              {/* Result CTA Actions */}
              <div className="flex gap-3">
                <button
                  onClick={handleCopy}
                  className="flex-1 flex items-center justify-center space-x-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold py-3.5 px-4 rounded-xl active:scale-98 transition text-xs uppercase tracking-wider font-mono cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied text!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Result Text</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3.5 px-4 rounded-xl active:scale-98 transition text-xs uppercase tracking-wider font-mono cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  {downloaded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Saved PNG!</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Save Card image</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleReset}
                className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition uppercase tracking-widest flex items-center space-x-1.5 mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Personality Test</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
