import React, { useState } from 'react';
import { useStore } from '../store';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose }) => {
  const { user } = useStore();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubscribe = async () => {
    if (!user) {
      alert("Please log in to standard account before purchasing premium features!");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid: user.uid,
          email: user.email,
        }),
      });

      const data = await response.json();
      if (data.url) {
        // Direct redirection off-site to Stripe's secure PCI-Compliant payment page
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Unknown checkout endpoint error');
      }
    } catch (err: any) {
      console.error(err);
      alert(`Subscription initiation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 max-w-md w-full text-center relative shadow-2xl">
        <h2 className="text-2xl font-black text-emerald-400 mb-2">💎 Unlock Unlimited Ideas</h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          You've reached the free generation limit. Upgrade to a premium plan for complete access to our system, business blueprints, and custom tools.
        </p>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold py-3 px-6 rounded-xl transition duration-200 shadow-lg disabled:opacity-50"
        >
          {loading ? 'Opening checkout...' : 'Subscribe Now — Only $9/mo'}
        </button>

        <button 
          onClick={onClose}
          className="mt-4 text-xs text-slate-500 hover:text-slate-300 underline"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
