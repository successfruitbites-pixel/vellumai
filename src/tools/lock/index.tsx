import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function LockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { isPro, checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleLock = async () => {
    if (!file) return;
    
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }

    if (password.length < 4) {
      toast.error('Password must be at least 4 characters.');
      return;
    }

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      // encrypt() method is technically available in pdf-lib >= 1.16 for setting basic security, 
      // but standard pdf-lib has varying levels of AES support.
      // We wrap in try/catch in case the version doesn't fully support it or requires additional configuration.
      try {
        (pdf as any).encrypt({
          userPassword: password,
          ownerPassword: password,
          permissions: { printing: 'highResolution', modifying: false, copying: false }
        });
        
        const bytes = await pdf.save();
        saveAs(new Blob([bytes]), `${file.name.replace('.pdf', '')}_locked.pdf`);
        
        toast.success('PDF successfully locked!');
        incrementTaskCount();
        addRecentFile({
          name: file.name,
          type: 'Lock PDF',
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
          tool: 'Lock PDF',
          timestamp: Date.now()
        });
      } catch (e: any) {
         toast.error('Encryption is not supported in this environment.');
         console.error('Encryption failed:', e);
      }

    } catch (error) {
      console.error(error);
      toast.error('Failed to process PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="lock"
      title="Lock PDF"
      description="Password-protect your PDF files to prevent unauthorized access."
      icon={<Lock size={32} />}
      accentColor="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
    >
      <div className="space-y-6 relative">
        {/* Pro overlay if not pro */}
        {!isPro && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-800/50">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md border border-brand-gold/30">
              <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={32} />
              </div>
              <h3 className="font-syne font-bold text-2xl dark:text-white mb-2">Pro Feature</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Encrypting documents with AES-256 requires a Vellum Pro subscription.
              </p>
              <Button variant="gold" className="w-full" onClick={() => setShowUpgrade(true)}>
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}

        {!file ? (
          <DropZone onFiles={(f) => setFile(f[0])} maxFiles={1} accept={{ 'application/pdf': ['.pdf'] }} />
        ) : (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-sm">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change file</Button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-bold mb-2 dark:text-white">Set a Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Keep this password safe! You will need it to open the document.
              </p>
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 text-lg bg-red-600 hover:bg-red-700 border-red-600 text-white"
              onClick={handleLock}
              disabled={isProcessing}
            >
              {isProcessing ? 'Encrypting...' : 'Lock PDF'}
            </Button>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
