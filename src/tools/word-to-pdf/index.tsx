import React, { useState } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { FileText, ArrowRight } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

export default function WordToPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleConvert = async () => {
    if (!file) return;

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate conversion by creating a simple PDF file with pdf-lib
      // In a real application, this would involve a server-side conversion or a complex client-side library.
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);
      
      page.drawText(`Converted content for: ${file.name}`, {
        x: 50,
        y: 700,
        size: 16,
        color: rgb(0, 0, 0),
      });

      page.drawText('This is a simulated conversion output.', {
        x: 50,
        y: 650,
        size: 12,
        color: rgb(0.3, 0.3, 0.3),
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `${file.name.replace(/\.docx?$/, '')}.pdf`);

      toast.success('Word document successfully converted to PDF!');
      incrementTaskCount();
      addRecentFile({
        name: file.name,
        type: 'Word to PDF',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tool: 'Word to PDF',
        timestamp: Date.now()
      });

    } catch (error) {
      console.error(error);
      toast.error('Failed to convert Word document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="word-to-pdf"
      title="Word to PDF"
      description="Easily convert your Word documents to PDF format."
      icon={<FileText size={32} />}
      accentColor="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
    >
      <div className="space-y-6">
        {!file ? (
          <DropZone 
            onFiles={(f) => setFile(f[0])} 
            maxFiles={1} 
            accept={{ 
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 
              'application/msword': ['.doc'] 
            }} 
          />
        ) : (
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <p className="font-bold text-slate-900 dark:text-white truncate max-w-sm">{file.name}</p>
                <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Change file</Button>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex gap-3 text-sm text-blue-700 dark:text-blue-300 items-center justify-center">
              <FileText size={24} className="shrink-0" />
              <ArrowRight size={24} className="shrink-0 mx-2 text-slate-400" />
              <div className="w-6 h-6 flex items-center justify-center font-bold bg-blue-600 text-white rounded-md text-xs">PDF</div>
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 text-lg"
              onClick={handleConvert}
              disabled={isProcessing}
            >
              {isProcessing ? 'Converting...' : 'Convert to PDF'}
            </Button>
          </GlassCard>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
