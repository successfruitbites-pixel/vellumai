import React, { useState, useEffect } from 'react';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { Minimize2, Lock, Unlock } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function ImageResizerTool() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [newDimensions, setNewDimensions] = useState({ width: 0, height: 0 });
  const [lockRatio, setLockRatio] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
        setNewDimensions({ width: img.width, height: img.height });
      };
      img.src = url;
      
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleWidthChange = (val: number) => {
    const width = Math.max(1, val);
    if (lockRatio && dimensions.width > 0) {
      const ratio = dimensions.height / dimensions.width;
      setNewDimensions({ width, height: Math.round(width * ratio) });
    } else {
      setNewDimensions(prev => ({ ...prev, width }));
    }
  };

  const handleHeightChange = (val: number) => {
    const height = Math.max(1, val);
    if (lockRatio && dimensions.height > 0) {
      const ratio = dimensions.width / dimensions.height;
      setNewDimensions({ width: Math.round(height * ratio), height });
    } else {
      setNewDimensions(prev => ({ ...prev, height }));
    }
  };

  const handleResize = async () => {
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
      canvas.width = newDimensions.width;
      canvas.height = newDimensions.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(img, 0, 0, newDimensions.width, newDimensions.height);

      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${file.name.split('.')[0]}_${newDimensions.width}x${newDimensions.height}.jpg`);
          toast.success('Image successfully resized!');
          incrementTaskCount();
          addRecentFile({
            name: file.name,
            type: 'Image Resize',
            size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
            tool: 'Image Resize',
            timestamp: Date.now()
          });
        }
        setIsProcessing(false);
      }, 'image/jpeg', 0.95);

    } catch (error) {
      console.error(error);
      toast.error('Failed to resize image.');
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="image-resize"
      title="Resize Image"
      description="Change image dimensions by pixels or percentages."
      icon={<Minimize2 size={32} />}
      accentColor="bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400"
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
              <div className="w-full md:w-1/2 flex flex-col justify-center border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50 p-2">
                {previewUrl && <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-contain rounded" />}
              </div>
              
              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                    <p className="text-sm text-slate-500">Original: {dimensions.width} x {dimensions.height} px</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPreviewUrl(null); }}>Change</Button>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Width (px)</label>
                      <input 
                        type="number"
                        value={newDimensions.width}
                        onChange={e => handleWidthChange(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                    
                    <button 
                      onClick={() => setLockRatio(!lockRatio)}
                      className={`mt-6 p-2 rounded-md transition-colors ${lockRatio ? 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                      title={lockRatio ? "Unlock aspect ratio" : "Lock aspect ratio"}
                    >
                      {lockRatio ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>

                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Height (px)</label>
                      <input 
                        type="number"
                        value={newDimensions.height}
                        onChange={e => handleHeightChange(parseInt(e.target.value) || 0)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => {
                          const w = Math.round(dimensions.width * (pct / 100));
                          handleWidthChange(w); // auto-handles height if locked
                        }}
                        className="flex-1 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded"
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  variant="primary" 
                  className="w-full h-12 text-lg bg-yellow-500 hover:bg-yellow-600 border-yellow-500 text-black shadow-lg shadow-yellow-500/20"
                  onClick={handleResize}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Resizing...' : 'Resize Image'}
                </Button>
              </div>
            </div>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
