import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { Wand2 } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function AIUpscaleTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(2); // 1.5, 2, 3, 4
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      const img = new Image();
      img.onload = () => setDimensions({ width: img.width, height: img.height });
      img.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleUpscale = async () => {
    if (!file) return;

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);
    setProgress(10);

    try {
      // Fake progress for UI since it's client side and fast, but we want to show effect
      const duration = scale * 1000; 
      const interval = setInterval(() => {
        setProgress(p => Math.min(p + 10, 90));
      }, duration / 10);

      const img = new Image();
      img.src = previewUrl as string;
      await new Promise(resolve => img.onload = resolve);
      
      // Creating image bitmap is a modern way for potentially higher quality resize in some browsers
      const bitmap = await createImageBitmap(img, { resizeWidth: img.width * scale, resizeHeight: img.height * scale, resizeQuality: 'high' });
      
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas not supported');
      
      // Draw bitmap
      ctx.drawImage(bitmap, 0, 0);

      clearInterval(interval);
      setProgress(100);

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${file.name.split('.')[0]}_upscaled_${scale}x.png`);
          toast.success(`Image successfully upscaled to ${scale}x!`);
          incrementTaskCount();
          addRecentFile({
            name: file.name,
            type: 'AI Upscale',
            size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
            tool: 'AI Upscale',
            timestamp: Date.now()
          });
        }
        setIsProcessing(false);
      }, 'image/png');

    } catch (error) {
      console.error(error);
      toast.error('Failed to upscale image.');
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <ToolShell
      toolId="ai-upscale"
      title="AI Upscale"
      description="Enhance image resolution using client-side bicubic interpolation. True AI upscale (Real-ESRGAN) coming soon in Pro."
      icon={<Wand2 size={32} />}
      accentColor="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400"
    >
      <div className="space-y-6">
        {!file ? (
          <DropZone 
            onFiles={(f) => setFile(f[0])} 
            maxFiles={1} 
            accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'], 'image/webp': ['.webp'] }} 
          />
        ) : (
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="w-full md:w-1/2 flex flex-col justify-center border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-2 relative">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-contain rounded" />}
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">Original: {dimensions.width}x{dimensions.height}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewUrl(null); }}>Change</Button>
                </div>

                <div className="mb-6">
                  <label className="text-sm font-bold dark:text-white block mb-3">Scale Factor</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[1.5, 2, 3, 4].map(s => (
                      <button
                        key={s}
                        onClick={() => setScale(s)}
                        className={`py-2 rounded-xl text-sm font-bold transition-all border
                          ${scale === s 
                            ? 'bg-fuchsia-500 text-white border-fuchsia-500 shadow-md shadow-fuchsia-500/20' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-fuchsia-300 dark:hover:border-fuchsia-800'
                          }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-fuchsia-50 dark:bg-fuchsia-900/10 border border-fuchsia-100 dark:border-fuchsia-900/30 rounded-xl mb-6 flex justify-between items-center text-sm">
                   <span className="text-fuchsia-800 dark:text-fuchsia-200 font-medium">New dimensions:</span>
                   <span className="text-fuchsia-900 dark:text-white font-bold">{Math.round(dimensions.width * scale)}x{Math.round(dimensions.height * scale)}</span>
                </div>

                {isProcessing ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-bold text-fuchsia-600 dark:text-fuchsia-400">
                      <span>Enhancing image...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div className="bg-fuchsia-500 h-full rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="primary" 
                    className="w-full h-12 text-lg bg-fuchsia-600 hover:bg-fuchsia-700 border-fuchsia-600 text-white"
                    onClick={handleUpscale}
                  >
                    Upscale Image
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
