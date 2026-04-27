import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { FileText, ArrowDown, ArrowUp, GripVertical } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function MergeTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error('Please add at least 2 PDF files to merge.');
      return;
    }

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    // Fake progress interval
    const progressInterval = setInterval(() => {
      setProgress(p => Math.min(p + 10, 90));
    }, 150);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      
      clearInterval(progressInterval);
      setProgress(100);
      
      setTimeout(() => {
        saveAs(blob, 'merged-document.pdf');
        toast.success('Files merged successfully!');
        setIsProcessing(false);
        incrementTaskCount();
        addRecentFile({
          name: 'merged-document.pdf',
          type: 'Merge PDF',
          size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
          tool: 'Merge PDF',
          timestamp: Date.now()
        });
      }, 300);

    } catch (error) {
      clearInterval(progressInterval);
      setIsProcessing(false);
      console.error(error);
      toast.error('Error merging PDFs. Ensure they are valid, unencrypted PDF files.');
    }
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newFiles = [...files];
    const temp = newFiles[index - 1];
    newFiles[index - 1] = newFiles[index];
    newFiles[index] = temp;
    setFiles(newFiles);
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    const newFiles = [...files];
    const temp = newFiles[index + 1];
    newFiles[index + 1] = newFiles[index];
    newFiles[index] = temp;
    setFiles(newFiles);
  };

  return (
    <ToolShell
      toolId="merge"
      title="Merge PDF"
      description="Combine multiple PDFs into one unified document easily."
      icon={<FileText size={32} />}
      accentColor="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
    >
      <div className="space-y-6">
        <DropZone 
          onFiles={(f) => setFiles(prev => [...prev, ...f])} 
          multiple 
          accept={{ 'application/pdf': ['.pdf'] }} 
        />

        {files.length > 0 && (
          <GlassCard className="p-4 md:p-6">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Files to merge (Order matters)</h3>
            <div className="space-y-2 mb-6">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className="cursor-grab text-slate-400 hover:text-slate-600">
                    <GripVertical size={20} />
                  </div>
                  <div className="flex-1 min-w-0 truncate font-medium text-sm dark:text-white">
                    {file.name}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button 
                      onClick={() => moveUp(i)} 
                      disabled={i === 0}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 rounded-md"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      onClick={() => moveDown(i)} 
                      disabled={i === files.length - 1}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-30 rounded-md"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {isProcessing ? (
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-blue-600 dark:text-blue-400">
                  <span>Merging documents...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <Button 
                variant="primary" 
                className="w-full h-12 text-lg"
                onClick={handleMerge}
              >
                Merge PDFs
              </Button>
            )}
          </GlassCard>
        )}
      </div>

      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
