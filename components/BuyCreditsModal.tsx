import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, IndianRupee, Loader2, Sparkles, AlertCircle, FlaskConical } from 'lucide-react';
import { CREDIT_PACKS } from '../constants';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { processPayment } from '../services/paymentService';
import { useAuth } from '@clerk/clerk-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCredits: number) => void;
  userId: string;
  userEmail: string;
  userName: string;
}

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  userId,
  userEmail,
  userName,
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handlePayment = async (packId: string) => {
    const pack = CREDIT_PACKS.find((p) => p.id === packId);
    if (!pack) return;

    setLoading(packId);
    setError(null);

    try {
      const token = await getToken({ template: 'supabase' }).catch(() => getToken());
      const result = await processPayment(userId, pack, userEmail, userName, token);

      if (result) {
        setSuccess(true);
        // Close modal and refresh credits after 2s
        setTimeout(() => {
          onSuccess(0); // parent will re-fetch credits
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        // User dismissed modal — no error needed
        setLoading(null);
      }
    } catch (err) {
      console.error('Payment failed:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
      setLoading(null);
    }
  };

  const handleClose = () => {
    if (loading) return; // don't close while payment is processing
    setError(null);
    setSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-[#0f2a43]/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-4xl rounded-[3rem] overflow-hidden shadow-2xl"
        >
          {success ? (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-[#0f2a43] mb-2">Payment Successful!</h2>
              <p className="text-slate-500">Your credits have been added to your account.</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex justify-between items-center p-8 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <h2 className="text-2xl font-bold text-[#0f2a43]">Refill Credits</h2>
                    {/* Beta / test mode badge */}
                    <span className="flex items-center space-x-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      <FlaskConical className="w-3 h-3" />
                      <span>Beta — Test Mode</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">
                    Use Razorpay test card: <span className="font-mono font-bold">4111 1111 1111 1111</span>, any future date, CVV <span className="font-mono font-bold">111</span>
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  disabled={!!loading}
                  className="p-2 hover:bg-slate-100 rounded-full transition-all disabled:opacity-40"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mx-8 mt-4 flex items-center space-x-2 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Credit packs */}
              <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {CREDIT_PACKS.map((pack) => (
                  <div
                    key={pack.id}
                    className={cn(
                      'relative p-6 rounded-3xl border transition-all flex flex-col',
                      pack.id === 'popular'
                        ? 'border-[#00a3e0] bg-[#e0f2fe]/10'
                        : 'border-slate-100'
                    )}
                  >
                    {pack.badge && (
                      <span className="absolute -top-3 left-6 bg-[#00a3e0] text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                        {pack.badge}
                      </span>
                    )}
                    <div className="mb-4">
                      <h3 className="font-bold text-[#0f2a43] mb-1">{pack.name}</h3>
                      <p className="text-xs text-slate-500">{pack.description}</p>
                    </div>
                    <div className="mb-6">
                      <div className="flex items-baseline">
                        <IndianRupee className="w-4 h-4 text-[#0f2a43]" />
                        <span className="text-3xl font-black text-[#0f2a43]">{pack.price}</span>
                      </div>
                      <p className="text-[#00a3e0] font-bold text-sm">{pack.credits} Credits</p>
                    </div>
                    <div className="mt-auto">
                      <button
                        disabled={!!loading}
                        onClick={() => handlePayment(pack.id)}
                        className={cn(
                          'w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center space-x-2',
                          pack.id === 'popular'
                            ? 'bg-[#00a3e0] text-white hover:bg-[#0092c9] disabled:opacity-50'
                            : 'bg-slate-100 text-[#0f2a43] hover:bg-slate-200 disabled:opacity-50'
                        )}
                      >
                        {loading === pack.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <span>Buy Now</span>
                            <Sparkles className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-8 pb-8 text-center">
                <p className="text-xs text-slate-400">
                  🔒 Secure payment via Razorpay · Credits never expire · 1 Credit ≈ ₹2
                </p>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
