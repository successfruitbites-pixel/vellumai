import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { Scissors } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

type SplitMode = 'extract' | 'every-n' | 'all';

export default function SplitTool() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<SplitMode>('extract');
  const [extractRanges, setExtractRanges] = useState('1');
  const [everyN, setEveryN] = useState('2');
  const [pageCount, setPageCount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleFiles = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        setPageCount(pdf.getPageCount());
      } catch (err) {
        toast.error('Invalid PDF file or encrypted document.');
        setFile(null);
      }
    }
  };

  const parseRanges = (rangeStr: string, maxPages: number): number[] => {
    const indices = new Set<number>();
    const parts = rangeStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n));
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.max(1, start); i <= Math.min(maxPages, end); i++) {
            indices.add(i - 1); // 0-indexed
          }
        }
      } else {
        const page = parseInt(trimmed);
        if (!isNaN(page) && page >= 1 && page <= maxPages) {
          indices.add(page - 1);
        }
      }
    }
    return Array.from(indices).sort((a, b) => a - b);
  };

  const handleSplit = async () => {
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
      const totalPages = pdf.getPageCount();
      
      const zip = new JSZip();

      if (mode === 'extract') {
        const indices = parseRanges(extractRanges, totalPages);
        if (indices.length === 0) throw new Error('Invalid page range.');
        
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdf, indices);
        pages.forEach(p => newPdf.addPage(p));
        const bytes = await newPdf.save();
        saveAs(new Blob([bytes]), `${file.name.replace('.pdf', '')}_extracted.pdf`);
        
      } else if (mode === 'all') {
        for (let i = 0; i < totalPages; i++) {
          const newPdf = await PDFDocument.create();
          const [page] = await newPdf.copyPages(pdf, [i]);
          newPdf.addPage(page);
          const bytes = await newPdf.save();
          zip.file(`page_${i + 1}.pdf`, bytes);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${file.name.replace('.pdf', '')}_split.zip`);
        
      } else if (mode === 'every-n') {
        const n = parseInt(everyN);
        if (isNaN(n) || n < 1) throw new Error('Invalid N pages value.');
        
        for (let i = 0; i < totalPages; i += n) {
          const newPdf = await PDFDocument.create();
          const indices = [];
          for (let j = i; j < Math.min(i + n, totalPages); j++) {
            indices.push(j);
          }
          const pages = await newPdf.copyPages(pdf, indices);
          pages.forEach(p => newPdf.addPage(p));
          const bytes = await newPdf.save();
          zip.file(`part_${Math.floor(i/n) + 1}.pdf`, bytes);
        }
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        saveAs(zipBlob, `${file.name.replace('.pdf', '')}_parts.zip`);
      }

      toast.success('Successfully split PDF!');
      incrementTaskCount();
      addRecentFile({
        name: file.name,
        type: 'Split PDF',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tool: 'Split PDF',
        timestamp: Date.now()
      });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="split"
      title="Split PDF"
      description="Extract pages, split into separate documents, or split by ranges."
      icon={<Scissors size={32} />}
      accentColor="bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400"
    >
      <div className="space-y-6">
        {!file ? (
          <DropZone onFiles={handleFiles} maxFiles={1} accept={{ 'application/pdf': ['.pdf'] }} />
        ) : (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-[200px] md:max-w-md">{file.name}</p>
                <p className="text-sm text-slate-500">{pageCount} pages</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change file</Button>
            </div>

            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
              {[
                { id: 'extract', label: 'Extract Pages' },
                { id: 'all', label: 'Split All' },
                { id: 'every-n', label: 'Split Every N' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setMode(tab.id as SplitMode)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${mode === tab.id ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {mode === 'extract' && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 dark:text-white">Pages to extract</label>
                <input 
                  type="text" 
                  value={extractRanges}
                  onChange={e => setExtractRanges(e.target.value)}
                  placeholder="e.g. 1, 3, 5-8"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                />
                <p className="text-xs text-slate-500 mt-2">Example: 1, 3, 5-8 will extract pages 1, 3, 5, 6, 7, and 8 into one document.</p>
              </div>
            )}

            {mode === 'every-n' && (
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2 dark:text-white">Split every N pages</label>
                <input 
                  type="number" 
                  min="1"
                  value={everyN}
                  onChange={e => setEveryN(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                />
              </div>
            )}

            {mode === 'all' && (
              <div className="mb-6 text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                This will split the document into <strong>{pageCount}</strong> separate 1-page PDF files. They will be downloaded as a ZIP archive.
              </div>
            )}

            <Button 
              variant="primary" 
              className="w-full h-12 text-lg"
              onClick={handleSplit}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Split PDF'}
            </Button>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
