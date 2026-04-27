import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { RefreshCw } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function ImageToWebpTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleConvert = async () => {
    if (!file) return;

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);

    try {
      const img = new Image();
      img.src = previewUrl as string;
      await new Promise(resolve => img.onload = resolve);

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${file.name.split('.')[0]}.webp`);
          toast.success('Image successfully converted to WebP!');
          incrementTaskCount();
          addRecentFile({
            name: file.name,
            type: 'Image to WebP',
            size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
            tool: 'Image to WebP',
            timestamp: Date.now()
          });
        }
        setIsProcessing(false);
      }, 'image/webp', 0.85);

    } catch (error) {
      console.error(error);
      toast.error('Failed to convert image.');
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="image-to-webp"
      title="Convert to WebP"
      description="Convert images to the next-gen WebP format for faster web performance."
      icon={<RefreshCw size={32} />}
      accentColor="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
    >
      <div className="space-y-6">
        {!file ? (
          <DropZone 
            onFiles={(f) => setFile(f[0])} 
            maxFiles={1} 
            accept={{ 'image/jpeg': ['.jpg', '.jpeg'], 'image/png': ['.png'] }} 
          />
        ) : (
          <GlassCard className="p-6">
            <div className="flex flex-col md:flex-row gap-8 mb-6">
              <div className="w-full md:w-1/2 flex flex-col justify-center border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-4">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-contain rounded shadow-sm" />}
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="mb-6">
                  <p className="font-bold text-slate-900 dark:text-white text-lg mb-1">{file.name}</p>
                  <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>

                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl mb-6 text-amber-800 dark:text-amber-200 text-sm">
                  <p className="font-bold mb-1">Why use WebP?</p>
                  <p className="opacity-90">WebP provides superior lossless and lossy compression for images on the web, often resulting in 30% smaller sizes compared to JPEG and PNG.</p>
                </div>

                <div className="flex gap-4">
                  <Button variant="ghost" className="flex-1" onClick={() => { setFile(null); setPreviewUrl(null); }}>Change</Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
                    onClick={handleConvert}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Converting...' : 'Convert'}
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
