import React, { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { Check, Zap, ChevronDown, ChevronUp } from 'lucide-react';

export default function PricingPage() {
  const { isPro, upgradeToPro } = useAppStore();
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0); // First FAQ open by default
  const [toastMessage, setToastMessage] = useState('');

  const handleUpgrade = () => {
    if (!isPro) {
      upgradeToPro();
      setToastMessage('🎉 Welcome to Pro!');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const faqs = [
    {
      q: "Can I cancel anytime?",
      a: "Yes, you can cancel your subscription from your profile settings at any time without any hidden fees."
    },
    {
      q: "Is my payment secure?",
      a: "Absolutely. We use Paystack for NGN transactions and Stripe for USD transactions, utilizing bank-level security."
    },
    {
      q: "What counts as a task?",
      a: "A task is counted each time you process a file through any of our tools (e.g., merging a PDF, removing a background, upscaling an image)."
    },
    {
      q: "Can I use my own API key?",
      a: "Yes! If you prefer to use your own Google Gemini API key for AI features, you can add it in your Profile Settings and bypass our AI usage limits."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-8 animate-in fade-in slide-in-from-bottom-4 relative">
      
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-in slide-in-from-top-4 fade-in">
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-gold/20 text-yellow-700 dark:text-yellow-500 rounded-full text-sm font-bold tracking-wide mb-6">
          <Zap size={16} /> UPGRADE TO PRO
        </div>
        <h1 className="font-syne font-extrabold text-4xl md:text-5xl dark:text-white mb-4 tracking-tight">
          Limitless tools.<br/>One simple price.
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Unlock unlimited document processing, advanced AI features, and priority support.
        </p>

        {/* Toggle */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <span className={`text-sm font-bold ${!isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>Monthly</span>
          <button 
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-14 h-8 bg-brand-primary rounded-full p-1 transition-colors relative focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:focus:ring-offset-slate-900"
          >
            <div className={`w-6 h-6 bg-white rounded-full transition-transform shadow-sm ${isAnnual ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          <span className={`text-sm font-bold flex items-center gap-2 ${isAnnual ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
            Annual
            <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
        
        {/* Free Plan */}
        <GlassCard className="p-8 border-2 border-transparent flex flex-col relative overflow-hidden">
          {!isPro && (
             <div className="absolute top-0 right-0 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1"><Check size={14} /> Current Plan</div>
          )}
          <div className="mb-6">
            <h3 className="font-syne font-bold text-2xl dark:text-white mb-2">Free</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Perfect for occasional tasks.</p>
          </div>
          <div className="mb-8">
            <span className="font-syne font-bold text-5xl dark:text-white">₦0</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium"> / forever</span>
          </div>
          <ul className="space-y-4 mb-8 flex-1">
            {['5 tasks per day', 'Basic PDF tools (Merge, Split)', '10MB file size limit', 'Standard processing speed'].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <Check className="text-brand-primary shrink-0 mt-0.5" size={18} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button variant={!isPro ? "secondary" : "primary"} className="w-full" disabled={!isPro}>
            {!isPro ? "Your Current Plan" : "Downgrade to Free"}
          </Button>
        </GlassCard>

        {/* Pro Plan */}
        <GlassCard className={`p-8 border-2 flex flex-col relative overflow-hidden ${isPro ? 'border-brand-gold' : 'border-brand-primary/50 dark:border-brand-primary'}`}>
          <div className="absolute top-0 right-0 bg-brand-gold text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider flex items-center gap-1">
             {isPro ? <><Check size={14} /> Pro Active</> : 'Most Popular'}
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-brand-gold/10 to-transparent pointer-events-none rounded-3xl" />
          
          <div className="mb-6 relative">
            <h3 className="font-syne font-bold text-2xl dark:text-white mb-2">Pro ⚡</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm">For heavy users and professionals.</p>
          </div>
          <div className="mb-8 relative">
            <span className="font-syne font-bold text-5xl dark:text-white">{isAnnual ? '₦2,400' : '₦3,000'}</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium"> / month</span>
            {isAnnual && <div className="text-sm font-medium text-green-600 dark:text-green-400 mt-1">Billed ₦28,800 annually</div>}
          </div>
          <ul className="space-y-4 mb-8 flex-1 relative">
            {['Unlimited daily tasks', 'Access to ALL AI tools (Upscale, BG Remove)', '100MB file size limit', 'Lightning fast processing', 'Priority customer support'].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 dark:text-slate-300 font-medium">
                <Check className="text-brand-gold shrink-0 mt-0.5" size={18} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          
          {isPro ? (
            <Button variant="secondary" className="w-full relative z-10" onClick={() => {/* Navigate to billing manager or modal */}}>
              Manage Subscription
            </Button>
          ) : (
            <Button variant="gold" className="w-full relative z-10" onClick={handleUpgrade} disabled={isPro}>
              Upgrade to Pro
            </Button>
          )}
        </GlassCard>

      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-syne font-bold text-3xl dark:text-white mb-4">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <GlassCard key={index} className="overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between focus:outline-none group"
              >
                <span className="font-bold text-slate-900 dark:text-white group-hover:text-brand-primary transition-colors">{faq.q}</span>
                {openFaq === index ? (
                  <ChevronUp className="text-brand-primary shrink-0 transition-transform duration-300" size={20} />
                ) : (
                  <ChevronDown className="text-slate-400 group-hover:text-brand-primary shrink-0 transition-transform duration-300" size={20} />
                )}
              </button>
              <div 
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

    </div>
  );
}
