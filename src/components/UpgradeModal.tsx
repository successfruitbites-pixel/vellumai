import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, X, Check, Zap } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';
import { Button } from './ui/Button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      
      <GlassCard 
        variant="gold" 
        className="relative z-10 w-full max-w-md p-0 overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in duration-300"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/5 hover:bg-black/10 text-slate-700 transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center bg-gradient-to-br from-amber-300 to-yellow-500 relative">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-md border border-white/30">
            <Zap size={32} className="text-yellow-900" />
          </div>
          <h2 className="font-syne font-extrabold text-2xl text-yellow-950 mb-2">
            You've hit your daily limit
          </h2>
          <p className="text-yellow-900/80 font-medium">
            You've used all your free tasks for today.
          </p>
        </div>

        <div className="p-8 bg-white dark:bg-slate-900">
          <h3 className="font-bold text-slate-900 dark:text-white mb-4">
            Upgrade to Pro for unlimited access:
          </h3>
          <ul className="space-y-3 mb-8">
            {[
              'Unlimited document processing',
              'Advanced AI Chat with PDFs',
              'Priority processing speed',
              'No file size limits',
              'Premium support'
            ].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                <div className="w-5 h-5 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center shrink-0">
                  <Check size={12} strokeWidth={3} />
                </div>
                {feature}
              </li>
            ))}
          </ul>
          
          <Button 
            variant="gold" 
            className="w-full h-12 text-lg shadow-xl shadow-amber-500/20"
            onClick={() => {
              onClose();
              navigate('/app/pricing');
            }}
          >
            Upgrade Now <Crown size={18} className="ml-2" />
          </Button>
          <p className="text-center text-xs text-slate-400 mt-4">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
