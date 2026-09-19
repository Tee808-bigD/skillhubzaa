import React, { useState } from 'react';
import { YouthService, User } from '../types';
import { ShieldCheck, Lock, CreditCard, DollarSign, CheckCircle2, ArrowRight, X, Sparkles } from 'lucide-react';

interface EscrowPaymentModalProps {
  service: YouthService;
  currentUser: User;
  onClose: () => void;
  onConfirmEscrow: (paymentDetails: any) => void;
}

export const EscrowPaymentModal: React.FC<EscrowPaymentModalProps> = ({
  service,
  currentUser,
  onClose,
  onConfirmEscrow
}) => {
  const [milestone, setMilestone] = useState<'deposit' | 'full'>('deposit');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'payfast' | 'snapscan' | 'eft'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  // Price calculations
  const numericPrice = service.priceZar || 550;
  const depositAmount = Math.round(numericPrice * 0.3); // 30% deposit
  const chargeAmount = milestone === 'deposit' ? depositAmount : numericPrice;

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      onConfirmEscrow({
        serviceId: service.id,
        serviceTitle: service.title,
        providerName: service.providerName,
        amount: chargeAmount,
        milestoneType: milestone,
        escrowStatus: 'FUNDED',
        transactionId: `TX_${Date.now()}`
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#1e1e1e] rounded-3xl border border-neutral-800 max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-white">
        
        {/* Header */}
        <div className="p-5 bg-[#141414] border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">Escrow Buyer Protection</h3>
              <p className="text-[11px] text-neutral-400">Funds held safely until work is completed & approved</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handlePay} className="p-6 space-y-5">
          
          {/* Service Summary */}
          <div className="p-3.5 bg-[#121212] rounded-2xl border border-neutral-800 flex items-center justify-between">
            <div>
              <h4 className="font-black text-xs text-white">{service.title}</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">By {service.providerName} • {service.category}</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-neutral-400">Total Price</span>
              <p className="text-sm font-black text-emerald-400">R{service.priceZar}</p>
            </div>
          </div>

          {/* Milestone Selector */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-2">Select Escrow Funding Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMilestone('deposit')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  milestone === 'deposit'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-[#121212] border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400">30% Deposit</span>
                  {milestone === 'deposit' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-sm font-black text-white mt-1">R{depositAmount}</p>
                <p className="text-[10px] text-neutral-400 mt-1">To start project materials</p>
              </button>

              <button
                type="button"
                onClick={() => setMilestone('full')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  milestone === 'full'
                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                    : 'bg-[#121212] border-neutral-800 text-neutral-400 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400">100% Full Payment</span>
                  {milestone === 'full' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
                <p className="text-sm font-black text-white mt-1">R{numericPrice}</p>
                <p className="text-[10px] text-neutral-400 mt-1">Full service escrow</p>
              </button>
            </div>
          </div>

          {/* Payment Gateways */}
          <div>
            <label className="text-xs font-bold text-neutral-300 block mb-2">Select Payment Method</label>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold">
              {[
                { id: 'card', name: 'Credit / Debit Card' },
                { id: 'payfast', name: 'PayFast SA' },
                { id: 'snapscan', name: 'SnapScan / Zapper' },
                { id: 'eft', name: 'Instant EFT' }
              ].map(method => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id as any)}
                  className={`p-2.5 rounded-xl border transition-all text-center ${
                    paymentMethod === method.id
                      ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-black'
                      : 'bg-[#121212] text-neutral-300 border-neutral-800 hover:bg-neutral-800'
                  }`}
                >
                  {method.name}
                </button>
              ))}
            </div>
          </div>

          {/* Escrow Guarantee Notice */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-300">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>100% Money-Back Escrow:</strong> Your funds remain locked in SkillHub Escrow until you confirm job completion. If service is not delivered, funds are instantly refunded.
            </p>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <span>Securing Escrow Deposit...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Deposit R{chargeAmount} into Escrow</span>
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
