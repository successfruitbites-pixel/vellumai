import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { ImageIcon } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

export default function PdfToJpgTool() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.85);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleFiles = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const proxy = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
        setPageCount(proxy.numPages);
      } catch (err) {
        toast.error('Could not load PDF. It may be encrypted.');
        setFile(null);
      }
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // high quality scale
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport } as any).promise;

        const blob = await new Promise<Blob | null>(resolve => {
          canvas.toBlob(resolve, 'image/jpeg', quality);
        });

        if (blob) {
          zip.file(`page_${i}.jpg`, blob);
        }
        
        setProgress(Math.round((i / pdf.numPages) * 100));
      }

      if (pdf.numPages === 1) {
        // Just download the one JPG directly
        const content = await zip.file('page_1.jpg')?.async('blob');
        if (content) saveAs(content, `${file.name.replace('.pdf', '')}.jpg`);
      } else {
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${file.name.replace('.pdf', '')}_images.zip`);
      }

      toast.success('Successfully converted PDF to JPG!');
      incrementTaskCount();
      addRecentFile({
        name: file.name,
        type: 'PDF to JPG',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tool: 'PDF to JPG',
        timestamp: Date.now()
      });

    } catch (error) {
      console.error(error);
      toast.error('Failed to convert PDF.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <ToolShell
      toolId="pdf-to-jpg"
      title="PDF to JPG"
      description="Convert every page of a PDF into high-quality JPG images."
      icon={<ImageIcon size={32} />}
      accentColor="bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400"
    >
      <div className="space-y-6">
        {!file ? (
          <DropZone onFiles={handleFiles} maxFiles={1} accept={{ 'application/pdf': ['.pdf'] }} />
        ) : (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-sm">{file.name}</p>
                <p className="text-sm text-slate-500">{pageCount} pages will be converted</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change file</Button>
            </div>

            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-bold dark:text-white">Image Quality</label>
                <span className="text-sm font-medium text-slate-500">{Math.round(quality * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0.1" 
                max="1.0" 
                step="0.05"
                value={quality}
                onChange={e => setQuality(parseFloat(e.target.value))}
                className="w-full appearance-none h-2 rounded-full bg-slate-200 dark:bg-slate-700 outline-none accent-cyan-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>Smaller File</span>
                <span>Better Quality</span>
              </div>
            </div>

            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-cyan-600 dark:text-cyan-400">
                  <span>Converting pages...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-cyan-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button 
                variant="primary" 
                className="w-full h-12 text-lg bg-cyan-600 hover:bg-cyan-700 border-cyan-600 text-white"
                onClick={handleConvert}
              >
                Convert to JPG
              </Button>
            )}
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
