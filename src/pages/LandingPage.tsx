import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Moon, Sun, ArrowRight, Wand2, FileText, Lock, FileSignature, Zap, 
  Scissors, Minimize2, FileCode2, Image as ImageIcon, CheckCircle2, MessageSquare, 
  ShieldCheck, RefreshCw, Key, ScanLine, Smartphone
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { ToolCard } from '../components/ui/ToolCard';
import { GlassCard } from '../components/ui/GlassCard';

import { useAppStore } from '../store/appStore';

export default function LandingPage() {
  const { darkMode, toggleDarkMode } = useAppStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatText, setChatText] = useState('');
  const fullChatText = "Here are the 5 key clauses I found:\n1. Payment terms: Net 30 days...\n2. Liability cap: $50,000 USD...\n";
  const [chatIndex, setChatIndex] = useState(0);

  // Dark mode logic is now handled globally in App.tsx

  // Typing animation for chat
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (chatIndex < fullChatText.length) {
        setChatText((prev) => prev + fullChatText.charAt(chatIndex));
        setChatIndex((prev) => prev + 1);
      } else {
        // Reset for loop after a delay
        setTimeout(() => {
          setChatText('');
          setChatIndex(0);
        }, 5000);
      }
    }, 50);
    return () => clearInterval(intervalId);
  }, [chatIndex, fullChatText]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-8');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((elem) => {
      observer.observe(elem);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-brand-navy dark:text-white transition-colors duration-300 font-dm-sans selection:bg-brand-primary/30 relative overflow-hidden">
      
      {/* CSS Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 6s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-fast {
          animation: float 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
      
      {/* SECTION 1 - NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-100 dark:border-white/10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-syne font-bold text-xl shadow-lg shadow-blue-500/30">
              V
            </div>
            <span className="font-syne font-extrabold text-xl tracking-tight text-slate-900 dark:text-white hidden sm:block">
              Vellum AI
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-gold/20 text-yellow-600 dark:text-yellow-400 border border-brand-gold/30">
              PRO
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600 dark:text-slate-300">
            <a href="#tools" className="hover:text-brand-primary transition-colors">Tools</a>
            <a href="#ai" className="hover:text-brand-primary transition-colors flex items-center gap-1">
              <Wand2 size={16} className="text-brand-primary" /> AI Assistant
            </a>
            <a href="#pricing" className="hover:text-brand-primary transition-colors">Pricing</a>
            <a href="#privacy" className="hover:text-brand-primary transition-colors">Privacy</a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="hidden sm:block">
              <Button size="sm" variant="primary" onClick={() => window.location.href = '/app'}>Get Started Free</Button>
            </div>
            
            {/* Mobile Menu Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600 dark:text-slate-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        <div className={`md:hidden absolute top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 transition-all duration-300 origin-top overflow-hidden shadow-2xl ${mobileMenuOpen ? 'max-h-96 py-4' : 'max-h-0'}`}>
          <div className="flex flex-col px-6 gap-4 font-medium text-slate-600 dark:text-slate-300">
            <a href="#tools" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-50 dark:border-slate-800">Tools</a>
            <a href="#ai" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2">
              <Wand2 size={16} className="text-brand-primary" /> AI Assistant
            </a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="py-2 border-b border-slate-50 dark:border-slate-800">Pricing</a>
            <a href="#privacy" onClick={() => setMobileMenuOpen(false)} className="py-2">Privacy</a>
          </div>
        </div>
      </nav>

      {/* SECTION 2 - HERO */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-[1280px] mx-auto min-h-screen flex flex-col justify-center">
        {/* Background gradient specifically for light mode */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-brand-navy dark:via-slate-900 dark:to-blue-950/20 -z-20"></div>
        {/* Decorative blob behind visual */}
        <div className="absolute top-1/2 right-10 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/20 dark:bg-brand-primary/10 blur-[120px] rounded-full -z-10 hidden lg:block"></div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Text */}
          <div className="space-y-8 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-200/50 dark:bg-brand-primary/10 text-slate-800 dark:text-blue-400 text-xs font-bold tracking-widest uppercase border border-slate-300/50 dark:border-brand-primary/20 backdrop-blur-sm shadow-sm ring-1 ring-white/50 dark:ring-0">
              <span className="text-brand-primary">✦</span> AI-POWERED PDF SUITE
            </div>
            
            <h1 className="font-syne font-extrabold text-5xl sm:text-6xl lg:text-[72px] leading-[1.05] tracking-tight text-slate-900 dark:text-white">
              Every PDF task,<br />
              <span className="gradient-text">done in seconds.</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-[520px] leading-relaxed">
              Merge, split, compress, convert, and chat with your PDFs — all in one beautiful, privacy-first web app. No sign-up needed to start.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight size={18} />} className="shadow-blue-500/20" onClick={() => window.location.href = '/app'}>
                Start for Free
              </Button>
              <Button size="lg" variant="ghost" className="border border-slate-200 dark:border-slate-800">
                See All Tools
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 text-sm text-slate-500 dark:text-slate-400 pt-4 font-medium">
              <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> No installation</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Files never stored</div>
              <div className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> 14 tools free</div>
            </div>
          </div>

          {/* Right Visual Floating Cards */}
          <div className="relative h-[400px] lg:h-[600px] hidden sm:flex items-center justify-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-200">
            {/* Card 1 */}
            <GlassCard className="absolute z-30 -left-4 md:left-10 lg:-left-10 top-1/4 p-4 w-64 animate-float flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 shadow-2xl">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-brand-primary">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-syne font-bold text-slate-900 dark:text-white">Merge PDF</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Processing 3 files...</p>
              </div>
            </GlassCard>

            {/* Card 2 - Center Prominent */}
            <GlassCard className="absolute z-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:-right-4 top-1/3 p-6 w-72 animate-float-delayed flex flex-col gap-4 bg-white/90 dark:bg-slate-900/90 shadow-[0_20px_50px_rgba(59,130,246,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-2 border-t-purple-400">
              <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-brand-primary flex items-center justify-center text-white">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="font-syne font-bold text-sm text-slate-900 dark:text-white">AI Chat</h3>
                  <p className="text-xs text-slate-500">Analyzing document</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded w-5/6"></div>
                <div className="h-2 bg-brand-primary/20 rounded w-4/6 mt-4"></div>
              </div>
            </GlassCard>

            {/* Card 3 */}
            <GlassCard className="absolute z-10 left-12 md:left-24 lg:left-12 bottom-1/4 p-4 w-56 animate-float-fast flex items-center gap-4 bg-white/80 dark:bg-slate-800/80 shadow-2xl border-l-4 border-l-emerald-400">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 className="font-syne font-bold text-slate-900 dark:text-white text-sm">Secure PDF</h3>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Encrypted</p>
              </div>
            </GlassCard>
            
          </div>
        </div>
      </section>

      {/* SECTION 3 - TOOL GRID */}
      <section id="tools" className="py-24 px-6 lg:px-12 max-w-[1280px] mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <p className="text-brand-gold font-bold tracking-widest text-sm uppercase">PDF Tools</p>
          <h2 className="font-syne font-extrabold text-4xl sm:text-[48px] tracking-tight text-slate-900 dark:text-white leading-tight">
            Everything you need,<br className="hidden sm:block" /> nothing you don't.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg pt-2">
            14 powerful tools that work directly in your browser.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Row 1 */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[50ms]">
            <ToolCard 
              icon={<FileText size={24} />} title="Merge PDF" description="Combine multiple PDFs into one unified document."
              color="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[100ms]">
            <ToolCard 
              icon={<Scissors size={24} />} title="Split PDF" description="Extract pages or split by range."
              color="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[150ms]">
            <ToolCard 
              icon={<Minimize2 size={24} />} title="Compress PDF" description="Reduce file size without quality loss. Multiple compression levels."
              color="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
            />
          </div>

          {/* Row 2 */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[200ms]">
            <ToolCard 
              icon={<FileCode2 size={24} />} title="PDF to Word" description="Convert PDFs to editable DOCX files."
              color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[250ms]">
            <ToolCard 
              icon={<FileText size={24} />} title="PDF to Excel" description="Extract tables directly into spreadsheets."
              color="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[300ms]">
            <ToolCard 
              icon={<ImageIcon size={24} />} title="PDF to JPG" description="Convert every PDF page to a high-quality image."
              color="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
            />
          </div>

          {/* Row 3 */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[350ms]">
            <ToolCard 
              icon={<ImageIcon size={24} />} title="Compress Image" description="Shrink images while preserving visual quality."
              color="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[400ms]">
            <ToolCard 
              icon={<RefreshCw size={24} />} title="Convert to WebP" description="Convert to next-gen WebP format for the web."
              color="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[450ms]">
            <ToolCard 
              icon={<Minimize2 size={24} />} title="Resize Image" description="Batch resize images to any dimension."
              color="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
            />
          </div>

          {/* Row 4 */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[500ms]">
            <ToolCard 
              icon={<Lock size={24} />} title="Lock PDF" description="Password-protect sensitive documents." badge="Pro"
              color="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[550ms]">
            <ToolCard 
              icon={<Key size={24} />} title="Unlock PDF" description="Remove PDF password protection."
              color="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[600ms]">
            <ToolCard 
              icon={<RefreshCw size={24} />} title="Rotate PDF" description="Rotate pages to the correct orientation."
              color="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
            />
          </div>

          {/* Row 5 */}
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[650ms]">
            <ToolCard 
              icon={<ScanLine size={24} />} title="Scanner" description="Scan physical documents with your camera." badge="New"
              color="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
            />
          </div>
          <div className="animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-[700ms]">
            <ToolCard 
              icon={<Wand2 size={24} />} title="AI Upscale" description="Enhance image resolution with AI." badge="AI"
              color="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400"
            />
          </div>
        </div>
      </section>

      {/* SECTION 4 - AI SHOWCASE */}
      <section id="ai" className="py-24 px-6 lg:px-12 bg-gradient-to-br from-slate-900 to-blue-950 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-full h-full pattern-dots opacity-10"></div>
        
        <div className="max-w-[1280px] mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Chat GUI */}
          <div className="order-2 lg:order-1 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
            <GlassCard variant="dark" className="p-6 md:p-8 rounded-3xl border-t border-t-white/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center text-indigo-300">
                    <span className="text-sm">U</span>
                  </div>
                  <div className="bg-slate-800/80 rounded-2xl rounded-tl-none p-4 text-slate-200 shadow-sm border border-slate-700">
                    <p>Summarize this contract's key clauses.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-brand-primary flex-shrink-0 flex items-center justify-center text-white shadow-lg shadow-blue-500/50">
                    <Wand2 size={14} />
                  </div>
                  <div className="bg-blue-900/40 rounded-2xl rounded-tl-none p-4 text-slate-200 shadow-sm border border-blue-800/50 min-h-[100px] w-full relative">
                    <pre className="font-dm-sans whitespace-pre-wrap leading-relaxed">{chatText}<span className="inline-block w-1.5 h-4 ml-1 bg-blue-400 animate-pulse align-middle"></span></pre>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Right - Content */}
          <div className="order-1 lg:order-2 space-y-8 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold text-xs font-bold tracking-widest uppercase border border-brand-gold/20 backdrop-blur-sm">
              <span className="text-brand-gold">🤖</span> AI ASSISTANT
            </div>
            
            <h2 className="font-syne font-extrabold text-4xl sm:text-[48px] tracking-tight text-white leading-tight">
              Chat with any PDF.<br />Get answers instantly.
            </h2>
            
            <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
              Upload any document and ask questions in plain language. Summarize contracts, extract data, translate content — powered by Gemini AI.
            </p>

            <ul className="space-y-4 pt-2">
              {[
                "Chat with PDF — Ask anything from any document",
                "Smart Summarize — Get executive summaries in seconds",
                "Extract & Translate — Pull data and translate to any language",
                "Auto-Name Files — AI suggests smart filenames based on content"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-brand-gold mt-1">✦</span>
                  <span className="text-slate-200 font-medium">{item}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4">
              <Button size="lg" variant="gold" rightIcon={<ArrowRight size={18} />}>
                Try AI Assistant Free
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 - PRIVACY SECTION */}
      <section id="privacy" className="py-24 px-6 lg:px-12 bg-emerald-50 dark:bg-emerald-950/20">
        <div className="max-w-[1280px] mx-auto text-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="font-syne font-extrabold text-4xl sm:text-[48px] tracking-tight text-slate-900 dark:text-white mb-6">
            Your documents stay yours.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto mb-16">
            Most PDF tools upload everything to foreign servers. We don't.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            {[
              { icon: <Smartphone size={32} />, title: "In-Browser Processing", desc: "Most operations run entirely in your browser using WebAssembly. Your files never leave your device." },
              { icon: <ShieldCheck size={32} />, title: "Zero Retention", desc: "For cloud operations, files are encrypted in transit and automatically deleted after processing. No exceptions." },
              { icon: <Lock size={32} />, title: "No Account, No Trace", desc: "Use 14 tools completely free with no sign-up. Nothing stored, nothing tracked." }
            ].map((feature, i) => (
              <GlassCard key={i} className="p-8 bg-white/60 dark:bg-slate-800/60 border border-emerald-100 dark:border-emerald-900/50 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                  {feature.icon}
                </div>
                <h3 className="font-syne font-bold text-2xl text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.desc}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 - PRICING */}
      <section id="pricing" className="py-24 px-6 lg:px-12 max-w-[1280px] mx-auto">
        <div className="text-center mb-16 animate-on-scroll opacity-0 translate-y-8 transition-all duration-700">
          <h2 className="font-syne font-extrabold text-4xl sm:text-[48px] tracking-tight text-slate-900 dark:text-white mb-4">
            Simple, honest pricing.
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="max-w-[780px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center animate-on-scroll opacity-0 translate-y-8 transition-all duration-700 delay-100">
          
          {/* Free Tier */}
          <GlassCard className="p-8 border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 rounded-[2rem]">
            <h3 className="font-syne font-bold text-2xl text-slate-900 dark:text-white mb-2">Free Forever</h3>
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₦0</span>
              <span className="text-slate-500">/ $0</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                { text: "14 PDF & image tools", included: true },
                { text: "Up to 5 tasks per day", included: true },
                { text: "In-browser processing", included: true },
                { text: "No account required", included: true },
                { text: "AI Assistant", included: false },
                { text: "Batch processing", included: false },
                { text: "No watermark on exports", included: false },
              ].map((item, i) => (
                <li key={i} className={`flex items-center gap-3 ${!item.included ? 'text-slate-400 opacity-70' : 'text-slate-700 dark:text-slate-300 font-medium'}`}>
                  {item.included ? <CheckCircle2 size={18} className="text-emerald-500" /> : <X size={18} />}
                  {item.text}
                </li>
              ))}
            </ul>
            <Button className="w-full" variant="ghost">Get Started Free</Button>
          </GlassCard>

          {/* Pro Tier */}
          <GlassCard className="p-8 border-2 border-brand-gold bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl relative md:scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-gold text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">
              Most Popular
            </div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-syne font-bold text-2xl text-slate-900 dark:text-white">Pro</h3>
              <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center text-brand-gold">
                <Zap size={16} fill="currentColor" />
              </div>
            </div>
            
            <div className="flex items-baseline gap-1 mb-8">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₦3,500</span>
              <span className="text-slate-500">/mo · $4.99/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              {[
                "Everything in Free",
                "Unlimited tasks",
                "AI Chat with PDF",
                "AI Summarize & Translate",
                "Batch processing",
                "Priority processing",
                "No watermarks",
                "Email support"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <CheckCircle2 size={18} className="text-brand-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <Button className="w-full" variant="gold" rightIcon={<ArrowRight size={18} />}>
              Upgrade to Pro
            </Button>
          </GlassCard>
        </div>
      </section>

      {/* SECTION 7 - FOOTER */}
      <footer className="bg-slate-900 pt-20 pb-10 px-6 lg:px-12 text-slate-400">
        <div className="max-w-[1280px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            
            {/* Col 1 */}
            <div className="space-y-6 lg:pr-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center font-syne font-bold text-lg">V</div>
                <span className="font-syne font-bold text-xl text-white tracking-tight">Vellum AI</span>
              </div>
              <p className="text-sm leading-relaxed">
                Built with ❤️ by Emmanuel Eleweke. Smart tools for modern professionals.
              </p>
            </div>

            {/* Col 2 */}
            <div>
              <h4 className="text-white font-syne font-bold mb-6">Tools</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Merge PDF</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Split PDF</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compress PDF</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Convert PDF</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Lock/Unlock</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Rotate PDF</a></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div>
              <h4 className="text-white font-syne font-bold mb-6">AI Tools</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-brand-gold transition-colors flex items-center gap-2"><Wand2 size={14}/> Chat with PDF</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Summarize</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Translate</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Extract</a></li>
                <li><a href="#" className="hover:text-brand-gold transition-colors">Upscale</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div>
              <h4 className="text-white font-syne font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <p>© 2026 Vellum AI by Emmanuel Eleweke. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* MOBILE STICKY CTA BAR */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-none z-50 animate-on-scroll opacity-0 translate-y-8 transition-all duration-500 delay-500">
        <Button className="w-full flex justify-between items-center px-6" variant="primary" size="lg" onClick={() => window.location.href = '/app'}>
          <span className="font-bold flex items-center gap-2">Start for Free <ArrowRight size={16}/></span>
          <span className="text-xs opacity-80 font-normal">No sign-up needed</span>
        </Button>
      </div>

    </div>
  );
}
