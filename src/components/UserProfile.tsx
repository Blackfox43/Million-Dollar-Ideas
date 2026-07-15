import React, { useState } from 'react';
import { useStore } from '../store';

export const UserProfile: React.FC = () => {
  const { user, isSubscribed, stripeCustomerId } = useStore();
  const [loading, setLoading] = useState(false);

  const handleOpenBillingPortal = async () => {
    if (!stripeCustomerId) return;
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/checkout/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stripeCustomerId }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect directly to Stripe Portal
      } else {
        throw new Error(data.error || 'Failed to initialize portal session');
      }
    } catch (error: any) {
      console.error(error);
      alert(`Could not open subscription management portal: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-sm mx-auto text-white">
      <h3 className="text-lg font-bold text-slate-100">Account Details</h3>
      <p className="text-xs text-slate-400 mt-1">{user.email}</p>

      <div className="mt-4 py-3 px-4 rounded-xl bg-slate-950 flex justify-between items-center border border-slate-800">
        <span className="text-xs text-slate-400">Subscription status:</span>
        <span className={`text-xs font-black uppercase tracking-wide px-2.5 py-1 rounded-md ${
          isSubscribed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'
        }`}>
          {isSubscribed ? 'Premium Elite' : 'Free Trial'}
        </span>
      </div>

      {isSubscribed && (
        <button
          onClick={handleOpenBillingPortal}
          disabled={loading}
          className="mt-4 w-full text-center text-xs py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-semibold rounded-lg border border-slate-800 transition duration-150 disabled:opacity-50"
        >
          {loading ? 'Launching Portal...' : '⚙️ Cancel or Modify Subscription'}
        </button>
      )}
    </div>
  );
};
