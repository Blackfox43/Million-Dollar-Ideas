import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Copy, Palette, CheckCircle, Sparkles, Check, Play, Share2 } from 'lucide-react';
import { useAppStore } from '../store';
import { type Idea } from '../db';
import { enrichIdeaBlueprint } from '../utils/blueprint';

interface ShareCanvasModalProps {
  idea: Idea | null;
  isOpen: boolean;
  onClose: () => void;
  initialFormat?: 'square' | 'vertical';
}

const GRADIENTS = [
  { name: 'Neon Emerald', from: '#064e3b', to: '#022c22', accent: '#34d399' },
  { name: 'Cyber Violet', from: '#3b0764', to: '#120024', accent: '#c084fc' },
  { name: 'Sunset Amber', from: '#78350f', to: '#2d0f00', accent: '#fbbf24' },
  { name: 'Steel Slate', from: '#1e293b', to: '#0f172a', accent: '#94a3b8' },
  { name: 'Deep Crimson', from: '#701a1a', to: '#2d0000', accent: '#f87171' },
];

export default function ShareCanvasModal({ idea, isOpen, onClose, initialFormat }: ShareCanvasModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedGradient, setSelectedGradient] = useState(0);
  const { isPremiumUser, setPaywallModal, awardXp, unlockBadge } = useAppStore();
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [exportFormat, setExportFormat] = useState<'square' | 'vertical'>('square');

  // Viral template states
  const [selectedTemplate, setSelectedTemplate] = useState('discover');
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  const dummyIdea: Idea = {
    id: '',
    title: '',
    niche: '',
    budget: '',
    time_to_launch: '',
    problem: '',
    idea: '',
    monetization: [],
    difficulty: 'Easy',
    viral_angle: ''
  };

  const blueprint = enrichIdeaBlueprint(idea || dummyIdea);

  // Sync format on modal open
  useEffect(() => {
    if (isOpen) {
      setExportFormat(initialFormat || 'square');
    }
  }, [isOpen, initialFormat]);

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

  const handleCopyTemplate = async (text: string) => {
    try {
      playSound([523.25, 783.99], 0.08);
      await navigator.clipboard.writeText(text);
      
      const id = text.includes('million-dollar') ? 'discover' : text.includes('Big tech') ? 'hustle' : 'zero';
      setCopiedTemplateId(id);
      setTimeout(() => setCopiedTemplateId(null), 2000);
      
      // Award XP for sharing!
      awardXp(100, 'Copied a viral sharing template');
      
      // If rarity is Unicorn, unlock the Unicorn Hunter badge!
      if (blueprint.rarity === 'Unicorn') {
        unlockBadge('unicorn_hunter');
      }
    } catch (e) {}
  };

  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number,
    maxLines: number = 99
  ) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;
    let linesCount = 0;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        linesCount++;
        if (linesCount >= maxLines) {
          ctx.fillText(line.trim() + '...', x, currentY);
          return currentY;
        }
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY;
  };

  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas || !idea) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const isVertical = exportFormat === 'vertical';
    const canvasW = 1080;
    const canvasH = isVertical ? 1920 : 1080;

    // Clear Canvas
    ctx.clearRect(0, 0, canvasW, canvasH);

    const gradInfo = GRADIENTS[selectedGradient];

    // 1. Draw Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, canvasW, canvasH);
    gradient.addColorStop(0, gradInfo.from);
    gradient.addColorStop(1, gradInfo.to);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Draw subtle tech-grid background accents
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvasW; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvasH);
      ctx.stroke();
    }
    for (let i = 0; i < canvasH; i += 60) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvasW, i);
      ctx.stroke();
    }

    // Retrieve enriched blueprint details
    const activeBlueprint = enrichIdeaBlueprint(idea);

    if (isVertical) {
      // 3. Draw vertical card container
      const cardX = 80;
      const cardY = 180;
      const cardW = 920;
      const cardH = 1560;
      const radius = 32;

      ctx.fillStyle = 'rgba(10, 10, 10, 0.84)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 3;

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

      // Heading hook line
      ctx.fillStyle = gradInfo.accent;
      ctx.font = 'bold 22px monospace';
      ctx.fillText('⚡ STEAL THIS SIDE HUSTLE ⚡', cardX + 60, cardY + 90);

      // Title (Startup Name + Budget)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 50px "Inter", sans-serif';
      const budgetText = idea.budget === 'Free' || idea.budget === '0' || idea.budget === '$0' ? '$0' : idea.budget;
      const endTitleY = wrapText(ctx, `TITLE: ${activeBlueprint.startupName.toUpperCase()} (${budgetText})`, cardX + 60, cardY + 175, 800, 58);

      // Hook Block
      ctx.fillStyle = gradInfo.accent;
      ctx.font = 'bold 22px monospace';
      ctx.fillText('HOOK PLAYBOOK:', cardX + 60, endTitleY + 80);

      ctx.fillStyle = '#fbbf24'; // beautiful gold hook color
      ctx.font = 'bold italic 28px "Inter", sans-serif';
      const hookText = `"${idea.viral_angle || `I built this side-hustle in under ${activeBlueprint.launchTimeline}. Here is the complete blueprint.`}"`;
      const endHookY = wrapText(ctx, hookText, cardX + 60, endTitleY + 125, 800, 36);

      // Separator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(cardX + 60, endHookY + 45);
      ctx.lineTo(cardX + cardW - 60, endHookY + 45);
      ctx.stroke();

      // Problem Section
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('THE REAL-WORLD PROBLEM:', cardX + 60, endHookY + 95);

      ctx.fillStyle = '#e5e7eb';
      ctx.font = 'italic 22px "Inter", sans-serif';
      const endProblemY = wrapText(ctx, `"${activeBlueprint.problem}"`, cardX + 60, endHookY + 135, 800, 32);

      // Solution Section
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('THE PLAYBOOK SOLUTION:', cardX + 60, endProblemY + 55);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'medium 24px "Inter", sans-serif';
      const endIdeaY = wrapText(ctx, activeBlueprint.solution, cardX + 60, endProblemY + 95, 800, 34);

      // Revenue Paths
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('REVENUE CHANNELS:', cardX + 60, endIdeaY + 55);

      let pathY = endIdeaY + 95;
      activeBlueprint.revenueModel.slice(0, 2).forEach((item) => {
        ctx.fillStyle = gradInfo.accent;
        ctx.beginPath();
        ctx.arc(cardX + 75, pathY - 8, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f3f4f6';
        ctx.font = 'bold 21px "Inter", sans-serif';
        pathY = wrapText(ctx, `✔ ${item}`, cardX + 100, pathY, 760, 30) + 12;
      });

      // Tags block
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.font = 'bold 15px monospace';
      ctx.fillText(`RARITY: ${activeBlueprint.rarity.toUpperCase()}`, cardX + 60, cardY + cardH - 120);
      ctx.fillText(`DIFFICULTY: ${idea.difficulty.toUpperCase()}`, cardX + 360, cardY + cardH - 120);
      ctx.fillText(`TIME: ${idea.time_to_launch.toUpperCase()}`, cardX + 660, cardY + cardH - 120);

      // Watermark
      if (!removeWatermark || !isPremiumUser) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        ctx.font = 'bold 16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ EXPORTED FROM MILLION DOLLAR IDEAS APP ⚡', canvasW / 2, cardY + cardH - 60);
        ctx.textAlign = 'left';
      }

    } else {
      // 3. Draw rounded 1:1 inner card container
      const cardX = 80;
      const cardY = 80;
      const cardW = 920;
      const cardH = 820;
      const radius = 32;

      ctx.fillStyle = 'rgba(10, 10, 10, 0.82)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;

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

      // Header Section dollar sign
      ctx.fillStyle = gradInfo.accent;
      ctx.font = '900 18px sans-serif';
      ctx.fillText('$', 130, 150);

      // Niche & Rarity tag capsule
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(750, 125, 200, 34, 17);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = gradInfo.accent;
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${activeBlueprint.rarity.toUpperCase()} CLASS`, 850, 147);
      ctx.textAlign = 'left';

      // Draw Title (Enriched Startup Name)
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px "Inter", sans-serif';
      const endTitleY = wrapText(ctx, activeBlueprint.startupName, 130, 230, 820, 52, 2);

      // Draw one-line pitch
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.font = 'italic 18px "Inter", sans-serif';
      const endPitchY = wrapText(ctx, `"${activeBlueprint.pitch}"`, 130, endTitleY + 12, 820, 26, 2);

      // Separator
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(130, endPitchY + 12);
      ctx.lineTo(950, endPitchY + 12);
      ctx.stroke();

      // Problem Section
      ctx.fillStyle = gradInfo.accent;
      ctx.font = 'bold 16px monospace';
      ctx.fillText('THE PROBLEM:', 130, endPitchY + 48);

      ctx.fillStyle = '#f3f4f6';
      ctx.font = 'italic 20px "Inter", sans-serif';
      const endProblemY = wrapText(ctx, activeBlueprint.problem, 130, endPitchY + 78, 820, 30, 2);

      // The Solution Idea
      ctx.fillStyle = gradInfo.accent;
      ctx.font = 'bold 16px monospace';
      ctx.fillText('THE SOLUTION IDEA:', 130, endProblemY + 32);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'medium 21px "Inter", sans-serif';
      const endIdeaY = wrapText(ctx, activeBlueprint.solution, 130, endProblemY + 55, 820, 32, 2);

      // Monetization Strategy
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('REVENUE MODEL PATHWAYS:', 130, endIdeaY + 30);

      ctx.font = '18px "Inter", sans-serif';
      ctx.fillStyle = '#e5e7eb';
      let pathY = endIdeaY + 65;

      activeBlueprint.revenueModel.slice(0, 3).forEach((item) => {
        ctx.fillStyle = gradInfo.accent;
        ctx.beginPath();
        ctx.arc(145, pathY - 6, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#e5e7eb';
        pathY = wrapText(ctx, item, 170, pathY, 780, 26, 1) + 8;
      });

      // Difficulty / Specs block
      const footerY = 820;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '14px monospace';
      ctx.fillText(`DIFFICULTY: ${idea.difficulty.toUpperCase()}`, 130, footerY);
      ctx.fillText(`EST. BUDGET: ${idea.budget}`, 390, footerY);
      ctx.fillText(`TIME: ${idea.time_to_launch.toUpperCase()}`, 610, footerY);

      // Outer Watermark
      if (!removeWatermark || !isPremiumUser) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ CREATED WITH MILLION DOLLAR IDEAS APP • MILLIONDOLLARIDEAS.APP ⚡', 540, 1015);
        ctx.textAlign = 'left';
      }
    }
  };

  useEffect(() => {
    if (isOpen && idea) {
      const timer = setTimeout(() => {
        drawCard();
        if (canvasRef.current) {
          try {
            setPreviewSrc(canvasRef.current.toDataURL('image/png'));
          } catch (e) {}
        }
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [isOpen, idea, selectedGradient, removeWatermark, isPremiumUser, exportFormat]);

  if (!isOpen || !idea) return null;

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    playSound([440, 554.37, 659.25, 880], 0.12);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const slug = idea.title.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    link.download = `m_idea_${slug}_${exportFormat}.png`;
    link.href = dataUrl;
    link.click();

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);

    // Award XP
    awardXp(50, 'Downloaded social card');
    if (blueprint.rarity === 'Unicorn') {
      unlockBadge('unicorn_hunter');
    }
  };

  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      playSound([523.25, 659.25], 0.1);
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({
              [blob.type]: blob,
            }),
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }, 'image/png');
    } catch (err) {
      // Fallback
      const text = `💡 MILLION DOLLAR IDEA BLUEPRINT 💡\n\nTitle: ${blueprint.startupName}\nPitch: ${blueprint.pitch}\nNiche: ${idea.niche}\nProblem: ${blueprint.problem}\nSolution: ${blueprint.solution}\n\nRevenue Model:\n${blueprint.revenueModel.map((m, i) => `${i + 1}. ${m}`).join('\n')}\n\nGenerated with Million Dollar Ideas App.`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }

    // Award XP
    awardXp(50, 'Copied social card');
    if (blueprint.rarity === 'Unicorn') {
      unlockBadge('unicorn_hunter');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative flex flex-col space-y-6"
      >
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center space-x-2">
            <Share2 className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h4 className="text-sm font-bold text-white tracking-tight uppercase font-mono">
              Export Social Card
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

        {/* Format Switcher Selector */}
        <div className="flex bg-zinc-950/80 p-1 rounded-xl border border-zinc-850">
          <button
            onClick={() => {
              playSound([329.63], 0.04);
              setExportFormat('square');
            }}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition active:scale-98 cursor-pointer text-center ${
              exportFormat === 'square'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Feed Card (1:1)
          </button>
          <button
            onClick={() => {
              playSound([392.00], 0.04);
              setExportFormat('vertical');
            }}
            className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition active:scale-98 cursor-pointer text-center ${
              exportFormat === 'vertical'
                ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                : 'text-zinc-500 hover:text-zinc-350'
            }`}
          >
            Reel / TikTok (9:16)
          </button>
        </div>

        {/* Hidden Canvas - actual resolution is high (1080x1080 or 1080x1920) */}
        <canvas
          ref={canvasRef}
          width={1080}
          height={exportFormat === 'vertical' ? 1920 : 1080}
          className="hidden"
        />

        {/* Canvas visual preview */}
        <div 
          className={`relative w-full rounded-2xl overflow-hidden border border-zinc-800/80 bg-zinc-950/60 flex items-center justify-center shadow-inner ${
            exportFormat === 'vertical' ? 'aspect-[9/16] max-h-[380px] mx-auto' : 'aspect-square'
          }`}
        >
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-mono tracking-widest text-zinc-400 uppercase z-10">
            {exportFormat === 'vertical' ? '1080x1920 PREVIEW' : '1080x1080 PREVIEW'}
          </div>
          {idea && previewSrc && (
            <img
              src={previewSrc}
              alt="Social Card Real-time Rendering Preview"
              id="canvas-preview-img"
              className="w-full h-full object-contain pointer-events-none"
            />
          )}
        </div>

        {/* Gradient Theme Selectors */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono text-left">
            Choose Theme Colorway
          </label>
          <div className="flex items-center justify-between gap-2.5">
            {GRADIENTS.map((g, idx) => (
              <button
                key={idx}
                onClick={() => {
                  playSound([300 + idx * 40], 0.04);
                  setSelectedGradient(idx);
                }}
                style={{
                  background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                }}
                className={`flex-1 aspect-square rounded-xl border relative transition-all active:scale-95 cursor-pointer ${
                  selectedGradient === idx
                    ? 'border-white scale-105 ring-2 ring-white/10'
                    : 'border-zinc-800 hover:border-zinc-750'
                }`}
                title={g.name}
              >
                {selectedGradient === idx && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Check className="w-4 h-4 text-white drop-shadow-md" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Viral Share Caption Templates */}
        <div className="space-y-2 border-t border-zinc-800/60 pt-4">
          <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest font-mono text-left">
            🔥 Viral Share Captions (+100 XP)
          </label>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {[
              {
                id: 'discover',
                text: `I just discovered this million-dollar startup idea: "${blueprint.startupName}" - ${blueprint.pitch}. Seeded entirely offline using Million Dollar Ideas! 🚀`
              },
              {
                id: 'hustle',
                text: `Big tech doesn't want you to know about this. Just generated a private side-hustle blueprint: "${blueprint.startupName}" (${idea.niche}). Est. Cost: ${blueprint.estimatedCost}. 🤫`
              },
              {
                id: 'zero',
                text: `No VC funding? No problem. Building "${blueprint.startupName}" in under ${blueprint.launchTimeline}. Check out the full breakdown from my local sandbox! 💡`
              }
            ].map((tmpl, tIdx) => {
              const isSelected = selectedTemplate === tmpl.id;
              return (
                <div 
                  key={tmpl.id} 
                  onClick={() => {
                    playSound([380 + tIdx * 30], 0.04);
                    setSelectedTemplate(tmpl.id);
                  }}
                  className={`p-2.5 rounded-xl border text-[10px] font-sans leading-relaxed transition-all cursor-pointer relative ${
                    isSelected 
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-zinc-200' 
                      : 'bg-zinc-950/40 border-zinc-900 text-zinc-400 hover:text-zinc-350 hover:bg-zinc-900/40'
                  }`}
                >
                  <p className="pr-16 text-left">{tmpl.text}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyTemplate(tmpl.text);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded text-[9px] font-mono uppercase tracking-wider text-emerald-400 hover:text-emerald-300 transition cursor-pointer"
                  >
                    {copiedTemplateId === tmpl.id ? 'Copied' : 'Copy'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Premium Upgrade Toggle */}
        <div className="bg-zinc-950/70 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between">
          <div className="text-left">
            <p className="text-xs font-bold text-white tracking-wide">Clean White-label Export</p>
            <p className="text-[10px] text-zinc-500 font-mono">Remove MillionDollarIdeas branding watermark</p>
          </div>
          {isPremiumUser ? (
            <button
              onClick={() => {
                playSound([removeWatermark ? 220 : 440], 0.05);
                setRemoveWatermark(!removeWatermark);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border uppercase tracking-wider transition cursor-pointer ${
                removeWatermark
                  ? 'bg-emerald-500 text-zinc-950 border-emerald-500'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-750'
              }`}
            >
              {removeWatermark ? 'Removed' : 'Hide Watermark'}
            </button>
          ) : (
            <button
              onClick={() => {
                playSound([523], 0.08);
                setPaywallModal(true);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition uppercase tracking-wider cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current animate-pulse" />
              <span>Unlock PRO</span>
            </button>
          )}
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center space-x-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-200 font-bold py-3 px-4 rounded-xl active:scale-98 transition text-xs uppercase tracking-wider font-mono cursor-pointer"
          >
            {copied ? (
              <>
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Card</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black py-3 px-4 rounded-xl active:scale-98 transition text-xs uppercase tracking-wider font-mono cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save to Photos</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
