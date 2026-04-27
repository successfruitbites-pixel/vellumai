import React, { useState } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { ImageMinus } from 'lucide-react';
import { removeBackground } from '@imgly/background-removal';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function BgRemovalTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { isPro, checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleFiles = (f: File[]) => {
    setFile(f[0]);
    setPreviewUrl(URL.createObjectURL(f[0]));
    setResultUrl(null);
  };

  const handleRemoveBg = async () => {
    if (!file) return;

    if (!isPro) {
      setShowUpgrade(true);
      return;
    }

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);
    let toastId = toast.loading('AI is processing image... this may take a moment.');

    try {
      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
           // We could show load progress for the AI model here
        }
      });
      
      const objUrl = URL.createObjectURL(blob);
      setResultUrl(objUrl);
      
      toast.success('Background removed successfully!', { id: toastId });
      incrementTaskCount();
      addRecentFile({
        name: file.name,
        type: 'Remove BG',
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        tool: 'BG Removal',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove background. The image might be too complex or large.', { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultUrl && file) {
      saveAs(resultUrl, `${file.name.split('.')[0]}_nobg.png`);
    }
  };

  return (
    <ToolShell
      toolId="bg-removal"
      title="Remove Background"
      description="Use AI to automatically remove the background from any image."
      icon={<ImageMinus size={32} />}
      accentColor="bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400"
    >
      <div className="space-y-6 relative">
        {/* Pro overlay if not pro */}
        {!isPro && (
          <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[2px] rounded-3xl flex flex-col items-center justify-center border border-slate-200/50 dark:border-slate-800/50">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl text-center max-w-md border border-brand-gold/30">
              <div className="w-16 h-16 bg-brand-gold/10 text-brand-gold rounded-full flex items-center justify-center mx-auto mb-4">
                <ImageMinus size={32} />
              </div>
              <h3 className="font-syne font-bold text-2xl dark:text-white mb-2">Pro Feature</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                On-device AI background removal requires a Vellum Pro subscription.
              </p>
              <Button variant="gold" className="w-full" onClick={() => setShowUpgrade(true)}>
                Upgrade to Pro
              </Button>
            </div>
          </div>
        )}

        {!file ? (
          <DropZone 
            onFiles={handleFiles} 
            maxFiles={1} 
            accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }} 
          />
        ) : (
          <GlassCard className="p-6">
            <div className="flex flex-col mb-6">
              <div className="flex justify-between items-start mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewUrl(null); setResultUrl(null); }}>Change</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                 <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-900 p-2 flex flex-col items-center">
                    <span className="text-xs font-bold uppercase text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full absolute top-4 left-4 z-10 shadow-sm border border-slate-100 dark:border-slate-700">Original</span>
                    <img src={previewUrl!} className="w-full h-auto max-h-80 object-contain rounded-xl" />
                 </div>

                 <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iI2ZmZiIgLz4KPHBhdGggZD0iTTAgMGgxMHYxMEgwem0xMCAxMGgxMHYxMEgxMHoiIGZpbGw9IiNlNWU1ZTUiIC8+Cjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0iIzFlMjkzYiIgLz4KPHBhdGggZD0iMTAgMGgxMHYxMEgwem0xMCAxMGgxMHYxMEgxMHoiIGZpbGw9IiMzMzQxNTUiIC8+Cjwvc3ZnPg==')] p-2 flex flex-col items-center relative">
                    <span className="text-xs font-bold uppercase text-slate-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-full absolute top-4 left-4 z-10 shadow-sm border border-slate-100 dark:border-slate-700">Result</span>
                    {resultUrl ? (
                      <img src={resultUrl} className="w-full h-auto max-h-80 object-contain rounded-xl" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full min-h-[200px]">
                        {isProcessing ? (
                           <div className="flex flex-col items-center">
                              <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4 shadow-lg shadow-violet-500/20"></div>
                              <span className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Running AI Model...</span>
                           </div>
                        ) : (
                           <span className="text-slate-400 font-medium">Ready to remove</span>
                        )}
                      </div>
                    )}
                 </div>
              </div>

              <div className="mt-8 flex gap-4">
                {!resultUrl ? (
                  <Button 
                    variant="primary" 
                    className="w-full h-12 text-lg bg-violet-600 hover:bg-violet-700 border-violet-600 text-white shadow-lg shadow-violet-500/20"
                    onClick={handleRemoveBg}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Remove Background'}
                  </Button>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 border-green-600 text-white shadow-lg shadow-green-500/20"
                    onClick={downloadResult}
                  >
                    Download Transparent PNG
                  </Button>
                )}
              </div>
            </div>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
