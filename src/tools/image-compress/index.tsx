import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { ImageIcon } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function ImageCompressTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.7);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      estimateSize();
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  useEffect(() => {
    if (file) {
      estimateSize();
    }
  }, [quality]);

  const estimateSize = () => {
    if (!file) return;
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) setEstimatedSize(blob.size);
      }, 'image/jpeg', quality);
    };
  };

  const handleCompress = async () => {
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
          saveAs(blob, `${file.name.split('.')[0]}_compressed.jpg`);
          toast.success('Image successfully compressed!');
          incrementTaskCount();
          addRecentFile({
            name: file.name,
            type: 'Image Compress',
            size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
            tool: 'Image Compress',
            timestamp: Date.now()
          });
        }
        setIsProcessing(false);
      }, 'image/jpeg', quality);

    } catch (error) {
      console.error(error);
      toast.error('Failed to compress image.');
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="image-compress"
      title="Compress Image"
      description="Shrink PNG or JPG images significantly without losing visual quality."
      icon={<ImageIcon size={32} />}
      accentColor="bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
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
              <div className="w-full md:w-1/3 flex flex-col justify-center border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-2">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-48 object-contain rounded" />}
              </div>
              
              <div className="w-full md:w-2/3 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">Original: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewUrl(null); }}>Change</Button>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-bold dark:text-white">Compression Quality</label>
                    <span className="text-sm font-medium text-slate-500">{Math.round(quality * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.05"
                    value={quality}
                    onChange={e => setQuality(parseFloat(e.target.value))}
                    className="w-full appearance-none h-2 rounded-full bg-slate-200 dark:bg-slate-700 outline-none accent-orange-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>Smaller Size</span>
                    <span>Better Quality</span>
                  </div>
                </div>

                {estimatedSize && (
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-900/50 rounded-xl">
                    <p className="text-sm text-orange-800 dark:text-orange-200">
                      Estimated new size: <strong>{(estimatedSize / 1024 / 1024).toFixed(2)} MB</strong>
                      <span className="ml-2 font-bold opacity-70">
                        (-{Math.max(0, Math.round((1 - estimatedSize / file.size) * 100))}%)
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600 border-orange-500 text-white"
              onClick={handleCompress}
              disabled={isProcessing}
            >
              {isProcessing ? 'Compressing...' : 'Compress Image'}
            </Button>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
