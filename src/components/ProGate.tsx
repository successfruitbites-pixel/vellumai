import React from 'react';
import { useAppStore } from '../store/appStore';
import { Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { useNavigate } from 'react-router-dom';

interface ProGateProps {
  feature: string;
  children: React.ReactNode;
}

/**
 * Wrapper component to lock features for free users.
 * Automatically checks current user status from store.
 */
export const ProGate: React.FC<ProGateProps> = ({ feature, children }) => {
  const isPro = useAppStore((state) => state.isPro);
  const navigate = useNavigate();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {/* Underlying content rendered with blur */}
      <div className="filter blur-sm pointer-events-none opacity-50 transition-all">
        {children}
      </div>

      {/* Upgrade Overlay */}
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-xl p-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl w-full max-w-sm text-center border border-slate-200 dark:border-slate-700">
          <div className="w-16 h-16 bg-brand-gold/20 text-yellow-600 dark:text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
            This is a Pro Feature
          </p>
          <h3 className="text-xl font-bold font-syne dark:text-white mb-2">
            {feature}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Upgrade to Pro for unlimited access to this and all other advanced tools.
          </p>
          <Button variant="gold" className="w-full" onClick={() => navigate('/app/pricing')}>
            Upgrade Now &rarr;
          </Button>
        </div>
      </div>
    </div>
  );
};
