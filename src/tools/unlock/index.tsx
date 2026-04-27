import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { Key, Eye, EyeOff } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function UnlockTool() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleUnlock = async () => {
    if (!file) return;

    if (!password) {
      toast.error('Please enter the password to unlock the document.');
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
      
      // Load PDF with password
      const pdf = await PDFDocument.load(arrayBuffer, { password, updateMetadata: false } as any);
      
      // Saving it natively creates an unencrypted document unless config says otherwise
      const bytes = await pdf.save();
      saveAs(new Blob([bytes]), `${file.name.replace('.pdf', '')}_unlocked.pdf`);
      
      toast.success('PDF successfully unlocked!');
      incrementTaskCount();
      addRecentFile({
        name: file.name,
        type: 'Unlock PDF',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tool: 'Unlock PDF',
        timestamp: Date.now()
      });

    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('password')) {
         toast.error('Incorrect password. Please try again.');
      } else {
         toast.error('Failed to unlock PDF. The file may be invalid or uses unsupported encryption.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="unlock"
      title="Unlock PDF"
      description="Remove passwords and restrictions from your PDFs (you must know the password)."
      icon={<Key size={32} />}
      accentColor="bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
    >
      <div className="space-y-6">
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
              <label className="block text-sm font-bold mb-2 dark:text-white">Enter the Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                />
                <button 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 text-lg bg-slate-900 hover:bg-black border-slate-900 dark:bg-white dark:text-black dark:hover:bg-slate-200"
              onClick={handleUnlock}
              disabled={isProcessing}
            >
              {isProcessing ? 'Unlocking...' : 'Unlock PDF'}
            </Button>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
