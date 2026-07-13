import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sparkles, Check, CreditCard, X, HelpCircle, ExternalLink, Lock } from 'lucide-react';
import { useAppStore } from '../store';

export default function PaywallModal() {
  const { showPaywallModal, setPaywallModal, subscribeToPremium } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardName, setCardName] = useState('Hustler Dev');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');

  // Stripe & Payment Mode States
  const [paymentMode, setPaymentMode] = useState<'stripe' | 'sandbox'>('sandbox');
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [checkingStripe, setCheckingStripe] = useState(true);

  useEffect(() => {
    if (showPaywallModal) {
      async function checkStripeHealth() {
        try {
          const res = await fetch('/api/health');
          const data = await res.json();
          if (data.stripeConfigured) {
            setStripeConfigured(true);
            setPaymentMode('stripe'); // Default to real Stripe if configured
          } else {
            setStripeConfigured(false);
            setPaymentMode('sandbox'); // Otherwise sandbox is active
          }
        } catch (e) {
          console.error("Stripe configuration health check failed:", e);
          setStripeConfigured(false);
          setPaymentMode('sandbox');
        } finally {
          setCheckingStripe(false);
        }
      }
      checkStripeHealth();
    }
  }, [showPaywallModal]);

  if (!showPaywallModal) return null;

  const playSound = (freqs: number[], duration: number = 0.1) => {
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
        }, idx * 80);
      });
    } catch (e) {}
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    playSound([261.63, 329.63], 0.15); // ascending double-pip for start

    if (paymentMode === 'stripe') {
      // Real Stripe Checkout Integration
      try {
        const res = await fetch('/api/payments/create-checkout-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        
        if (data.url) {
          playSound([392.00, 523.25, 659.25], 0.12);
          // Redirect to Stripe checkout page
          window.location.href = data.url;
        } else {
          console.error("Stripe session creation error:", data);
          alert(`Stripe Session Creation Failed: ${data.message || 'Unknown Server Error'}`);
          setIsProcessing(false);
        }
      } catch (err: any) {
        console.error("Failed to initiate checkout session:", err);
        alert(`Failed to contact checkout service: ${err.message || 'Unknown error'}`);
        setIsProcessing(false);
      }
    } else {
      // Sandbox local simulation: 1.2s delay for realism
      setTimeout(() => {
        setIsProcessing(false);
        playSound([523.25, 659.25, 783.99, 1046.50], 0.12); // happy major chord celebrate bleep
        subscribeToPremium();
      }, 1200);
    }
  };

  const premiumFeatures = [
    'Unlock 1,000+ elite side-hustle & AI SaaS concepts',
    'Unlocks advanced difficulty and low-budget filters',
    'Remove "Made with M$" watermark from image card exports',
    'Lifetime offline access on all devices after checkout',
    'Step-by-step developer stack recommendations included',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            playSound([220], 0.05);
            setPaywallModal(false);
          }}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-full hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Promo Header */}
        <div className="bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent p-6 pt-8 border-b border-zinc-800">
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>UNLIMITED HUSTLE</span>
          </div>
          <h3 className="text-2xl font-bold tracking-tight text-white mb-1">
            Unlock the Premium Vault
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Unleash hyper-curated, highly specific business formulas. Cancel anytime in 1 click.
          </p>
        </div>

        {/* Form and Benefit List */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Bullet Points */}
          <ul className="space-y-2.5">
            {premiumFeatures.map((feat, index) => (
              <li key={index} className="flex items-start text-xs text-zinc-300">
                <div className="mr-2.5 p-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mt-0.5 flex-shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>{feat}</span>
              </li>
            ))}
          </ul>

          {/* Pricing Selector Box */}
          <div className="bg-zinc-950/80 rounded-2xl border border-zinc-850 p-3.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-white tracking-wide">Unlimited Creator Plan</p>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">Instant Global Access</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-400 font-mono">$9</span>
              <span className="text-xs text-zinc-500">/mo</span>
            </div>
          </div>

          {/* Payment Method Selector Tabs */}
          <div className="flex bg-zinc-950/90 p-1 rounded-xl border border-zinc-850">
            <button
              onClick={() => {
                playSound([300], 0.05);
                setPaymentMode('stripe');
              }}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition-all active:scale-98 cursor-pointer relative ${
                paymentMode === 'stripe'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              <span className="flex items-center justify-center space-x-1">
                <CreditCard className="w-3 h-3" />
                <span>Stripe Checkout</span>
              </span>
              {stripeConfigured && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </button>
            <button
              onClick={() => {
                playSound([260], 0.05);
                setPaymentMode('sandbox');
              }}
              className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono transition-all active:scale-98 cursor-pointer ${
                paymentMode === 'sandbox'
                  ? 'bg-emerald-500 text-zinc-950 font-black shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              Sandbox Simulator
            </button>
          </div>

          {/* Stripe Tab View */}
          {paymentMode === 'stripe' && (
            <div className="space-y-4">
              {stripeConfigured ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-left space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wide font-mono">
                    <Shield className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Real Stripe Billing Active</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    A real subscription payment gateway is active. Clicking the button below will securely redirect you to Stripe to complete your transaction and unlock full creator benefits.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left space-y-2.5">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs uppercase tracking-wide font-mono">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Stripe Keys Not Set Yet</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    To make real Stripe checkouts functional, specify your <code className="bg-black/40 px-1 py-0.5 rounded font-mono text-[9px]">STRIPE_SECRET_KEY</code> in the Settings or Secrets menu.
                  </p>
                  <p className="text-[10px] text-amber-500 font-mono">
                    Currently defaulting to Sandbox Simulator for offline preview convenience!
                  </p>
                </div>
              )}

              <form onSubmit={handleCheckout}>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span className="font-semibold text-xs uppercase tracking-wider">Connecting Stripe...</span>
                    </>
                  ) : (
                    <>
                      <span className="font-black text-xs uppercase tracking-wider">
                        {stripeConfigured ? 'Redirect to Stripe Checkout' : 'Try Sandbox Simulation Instead'}
                      </span>
                      <ExternalLink className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Sandbox Tab View */}
          {paymentMode === 'sandbox' && (
            <form onSubmit={handleCheckout} className="space-y-3.5">
              <div className="text-left">
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-mono">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition font-sans"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="text-left">
                <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-mono">
                  Card Information (Sandbox Active)
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5 text-zinc-500">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/80 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition font-mono"
                    placeholder="4242 4242 4242 4242"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-left">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-mono">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition font-mono text-center"
                    placeholder="MM/YY"
                  />
                </div>
                <div className="text-left">
                  <label className="block text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1 font-mono">
                    CVV / CVC
                  </label>
                  <input
                    type="password"
                    maxLength={3}
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-emerald-500/80 rounded-xl px-3.5 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none transition font-mono text-center"
                    placeholder="•••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-98 transition disabled:opacity-50 disabled:pointer-events-none cursor-pointer mt-1"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-zinc-950" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="font-semibold text-xs uppercase tracking-wider">Authorizing simulation...</span>
                  </>
                ) : (
                  <span className="font-bold text-xs uppercase tracking-wider">Simulate Sandbox Checkout</span>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-zinc-950/60 p-4 border-t border-zinc-800 text-center flex items-center justify-center space-x-2 text-[10px] text-zinc-500 font-mono">
          <Shield className="w-3.5 h-3.5 text-emerald-500/60" />
          <span>SSL ENCRYPTED SECURE BILLING ENGINE</span>
        </div>
      </motion.div>
    </div>
  );
}
