import React, { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribed?: () => void;
  isSubscribed?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSubscribed,
  isSubscribed = false,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    if (onSubscribed) onSubscribed();
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 text-sm cursor-pointer"
        >
          ✕
        </button>

        {success ? (
          <div className="py-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-xl font-bold">1-Month Free Trial Activated</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Your WaveReady Marine Pro membership is now live. Enjoy unlimited real-time tide forecasts,
              wind vector alerts, and partner charter discounts.
            </p>
          </div>
        ) : (
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-cyan-400 mb-1">
              Peace of Mind Guarantee
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mb-2">
              Protect Your Expensive Boat Charters
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              A single ruined offshore charter or wasted boat rental costs $800 to $2,500+. WaveReady
              consolidates live NEA coastal tides, wind speeds, UV, and WBGT heat stress into one
              crystal-clear real-time decision dashboard.
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  billingCycle === 'monthly'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Monthly ($10/mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  billingCycle === 'annual'
                    ? 'bg-cyan-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Annual ($100/yr) · Save 17%
              </button>
            </div>

            {/* Plan Details Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-cyan-500/30 mb-6">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-bold text-sm text-cyan-300">WaveReady Marine Pro</span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono">
                    {billingCycle === 'annual' ? '$100' : '$10'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {billingCycle === 'annual' ? ' / year' : ' / month'}
                  </span>
                </div>
              </div>

              <div className="text-xs font-semibold text-emerald-400 mb-3">
                Includes 1 Month Free Trial · Cancel Anytime
              </div>

              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Live NEA tides, UV index & WBGT heat stress telemetry</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Coastal wind direction & speed mapped to all Singapore beaches</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Free weather-reschedule guarantee on all partner charter bookings</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>Priority booking with certified fishing charters & yachts</span>
                </li>
              </ul>
            </div>

            {/* Trial Activation Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-medium">
                  Email Address for Subscription Alerts
                </label>
                <input
                  type="email"
                  required
                  placeholder="charter.captain@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer text-xs sm:text-sm shadow-lg shadow-cyan-500/25"
              >
                {isSubscribed ? 'Manage Pro Membership' : 'Start 1 Month Free Trial'}
              </button>

              <div className="text-center text-[10px] text-slate-500">
                No credit card charged today. 30-day zero-risk trial.
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
