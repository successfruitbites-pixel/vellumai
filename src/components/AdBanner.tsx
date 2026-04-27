import React from 'react';
import { useAppStore } from '../store/appStore';

interface AdBannerProps {
  slot: 'top' | 'bottom' | 'sidebar';
  className?: string;
  hideIfPro?: boolean;
}

/**
 * Renders an advertisement placeholder.
 * Can be configured to hide for Pro users.
 */
export const AdBanner: React.FC<AdBannerProps> = ({ slot, className = '', hideIfPro = false }) => {
  const isPro = useAppStore((state) => state.isPro);

  if (hideIfPro && isPro) {
    return null;
  }

  const heightClass = slot === 'sidebar' ? 'h-[250px]' : 'h-[90px]';

  return (
    <div className={`w-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden ${heightClass} ${className}`}>
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
        Advertisement
      </span>
      {/* 
        <!-- Real AdSense Code Placeholder -->
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
        <ins className="adsbygoogle"
             style={{ display: 'block' }}
             data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
             data-ad-slot="XXXXXXXXXX"
             data-ad-format="auto"
             data-full-width-responsive="true"></ins>
        <script>
             (adsbygoogle = window.adsbygoogle || []).push({});
        </script> 
      */}
    </div>
  );
};
