import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { RefreshCw, RotateCcw, RotateCw } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

// Set up PDF.js worker
if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

interface PageData {
  index: number;
  rotation: number;
}

export default function RotateTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedPages, setSelectedPages] = useState<Set<number>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleFiles = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const proxy = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
        setPdfProxy(proxy);
        
        const initialPages = [];
        for (let i = 0; i < proxy.numPages; i++) {
          initialPages.push({ index: i, rotation: 0 });
        }
        setPages(initialPages);
      } catch (err) {
        console.error(err);
        toast.error('Could not load PDF for preview. It may be encrypted.');
        setFile(null);
      }
    }
  };

  const togglePage = (index: number) => {
    const newObj = new Set(selectedPages);
    if (newObj.has(index)) newObj.delete(index);
    else newObj.add(index);
    setSelectedPages(newObj);
  };

  const selectAll = () => {
    if (selectedPages.size === pages.length) {
      setSelectedPages(new Set());
    } else {
      setSelectedPages(new Set(pages.map(p => p.index)));
    }
  };

  const rotateSelected = (deg: number) => {
    if (selectedPages.size === 0) {
      toast('Please select at least one page', { icon: '👆' });
      return;
    }
    setPages(prev => prev.map(p => {
      if (selectedPages.has(p.index)) {
        return { ...p, rotation: (p.rotation + deg) % 360 };
      }
      return p;
    }));
  };

  const handleSave = async () => {
    if (!file) return;

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pdfPages = pdf.getPages();

      pages.forEach((p, i) => {
        if (p.rotation !== 0) {
          const currentRotation = pdfPages[i].getRotation().angle;
          pdfPages[i].setRotation(degrees(currentRotation + p.rotation));
        }
      });

      const bytes = await pdf.save();
      saveAs(new Blob([bytes]), `${file.name.replace('.pdf', '')}_rotated.pdf`);
      
      toast.success('Successfully rotated PDF!');
      incrementTaskCount();
      addRecentFile({
        name: file.name,
        type: 'Rotate PDF',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tool: 'Rotate PDF',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to rotate PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="rotate"
      title="Rotate PDF"
      description="Rotate individual pages or the entire document to the correct orientation."
      icon={<RefreshCw size={32} />}
      accentColor="bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
    >
      <div className="space-y-6">
        {!file ? (
          <DropZone onFiles={handleFiles} maxFiles={1} accept={{ 'application/pdf': ['.pdf'] }} />
        ) : (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-md">{file.name}</p>
                <p className="text-sm text-slate-500">{pages.length} pages</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => { setFile(null); setPdfProxy(null); }}>Change file</Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Button size="sm" variant="secondary" onClick={selectAll}>
                {selectedPages.size === pages.length ? 'Deselect All' : 'Select All'}
              </Button>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                <button onClick={() => rotateSelected(-90)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-600 dark:text-slate-300" title="Rotate Left">
                  <RotateCcw size={18} />
                </button>
                <div className="w-[1px] bg-slate-200 dark:bg-slate-700 my-1 mx-1" />
                <button onClick={() => rotateSelected(180)} className="p-2 text-xs font-bold hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-600 dark:text-slate-300" title="Rotate 180">
                  180°
                </button>
                <div className="w-[1px] bg-slate-200 dark:bg-slate-700 my-1 mx-1" />
                <button onClick={() => rotateSelected(90)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-600 dark:text-slate-300" title="Rotate Right">
                  <RotateCw size={18} />
                </button>
              </div>
              <p className="text-sm text-slate-500 ml-auto">
                {selectedPages.size} selected
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8 max-h-[50vh] overflow-y-auto p-2 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
              {pages.map(page => (
                <PdfThumbnail
                  key={page.index}
                  pdfProxy={pdfProxy}
                  pageIndex={page.index + 1}
                  rotation={page.rotation}
                  isSelected={selectedPages.has(page.index)}
                  onClick={() => togglePage(page.index)}
                />
              ))}
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 text-lg"
              onClick={handleSave}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Apply Changes & Download'}
            </Button>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}

// Sub-component for rendering a thumbnail
interface PdfThumbnailProps {
  pdfProxy: pdfjsLib.PDFDocumentProxy | null;
  pageIndex: number;
  rotation: number;
  isSelected: boolean;
  onClick: () => void;
}

const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ pdfProxy, pageIndex, rotation, isSelected, onClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let renderTask: pdfjsLib.RenderTask | null = null;
    let isActive = true;

    const renderPage = async () => {
      if (!pdfProxy || !canvasRef.current || !isActive) return;
      try {
        const page = await pdfProxy.getPage(pageIndex);
        if (!isActive) return;
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        renderTask = page.render({ canvasContext: context, viewport } as any);
        await renderTask.promise;
      } catch (err) {
        // Handle cancel
      }
    };

    renderPage();

    return () => {
      isActive = false;
      if (renderTask) renderTask.cancel();
    };
  }, [pdfProxy, pageIndex]);

  return (
    <div 
      className={`relative cursor-pointer rounded-lg border-2 transition-all overflow-hidden ${isSelected ? 'border-brand-primary bg-blue-50 dark:bg-blue-900/30' : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'}`}
      onClick={onClick}
    >
      <div className="bg-white" style={{ transform: `rotate(${rotation}deg)`, transition: 'transform 0.3s ease' }}>
        <canvas ref={canvasRef} className="w-full h-auto" />
      </div>
      <div className="absolute top-1 left-1 bg-black/50 text-white text-[10px] px-1.5 rounded">
        {pageIndex}
      </div>
      {isSelected && (
        <div className="absolute bottom-1 right-1 bg-brand-primary text-white p-0.5 rounded-full">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      )}
    </div>
  );
};
