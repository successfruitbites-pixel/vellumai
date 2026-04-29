import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';
import { FileSignature, ChevronLeft, ChevronRight, Type, Square, X as XIcon, Trash2, Highlighter, Scissors } from 'lucide-react';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { GlassCard } from '../../components/ui/GlassCard';

if (typeof window !== 'undefined' && 'Worker' in window) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
}

type EditAction = {
  id: string;
  type: 'text' | 'redact' | 'highlight';
  pageIndex: number;
  x: number; // 0-1 percentage
  y: number; // 0-1 percentage
  text?: string;
  width?: number; // 0-1 percentage
  height?: number; // 0-1 percentage
};

export default function EditPdfTool() {
  const [file, setFile] = useState<File | null>(null);
  const [pdfProxy, setPdfProxy] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [activeTool, setActiveTool] = useState<'text' | 'redact' | 'highlight'>('text');
  const [deletedPages, setDeletedPages] = useState<number[]>([]);
  
  const [edits, setEdits] = useState<EditAction[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const handleFiles = async (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const proxy = await pdfjsLib.getDocument(new Uint8Array(arrayBuffer)).promise;
        setPdfProxy(proxy);
        setTotalPages(proxy.numPages);
        setCurrentPage(1);
        setEdits([]);
      } catch (err) {
        toast.error('Could not load PDF. It may be encrypted.');
        setFile(null);
      }
    }
  };

  useEffect(() => {
    let active = true;
    const renderPage = async () => {
      if (!pdfProxy || !canvasRef.current) return;
      
      try {
        const page = await pdfProxy.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 }); // Good balance for web
        
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;
      } catch (err) {
        if (active) console.error('Error rendering page:', err);
      }
    };
    renderPage();
    return () => { active = false; };
  }, [pdfProxy, currentPage]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const newEdit: EditAction = {
      id: Date.now().toString() + Math.random().toString(),
      type: activeTool,
      pageIndex: currentPage - 1,
      x,
      y,
      ...(activeTool === 'text' ? { text: 'Double click to edit' } : { width: 0.2, height: 0.05 })
    };

    setEdits(prev => [...prev, newEdit]);
  };

  const updateEdit = (id: string, updates: Partial<EditAction>) => {
    setEdits(prev => prev.map(edit => edit.id === id ? { ...edit, ...updates } : edit));
  };

  const deleteEdit = (id: string, e?: React.MouseEvent) => {
    if(e) {
      e.stopPropagation();
    }
    setEdits(prev => prev.filter(edit => edit.id !== id));
  };

  const currentEdits = edits.filter(e => e.pageIndex === currentPage - 1);

  const handleExport = async () => {
    if (!file) return;

    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();

      for (const edit of edits) {
        if (edit.pageIndex >= pages.length) continue;
        const page = pages[edit.pageIndex];
        const { width, height } = page.getSize();

        // PDF-lib origin is bottom-left, our Y is top-down percentage
        const pdfX = edit.x * width;
        const pdfY = (1 - edit.y) * height;

        if (edit.type === 'text' && edit.text) {
          page.drawText(edit.text, {
            x: pdfX,
            y: pdfY,
            size: 14,
            color: rgb(0, 0, 0),
          });
        } else if (edit.type === 'redact' && edit.width && edit.height) {
          // our edit.y is top edge. PDF-lib y is bottom-left, so we must adjust the box height
          const boxW = edit.width * width;
          const boxH = edit.height * height;
          page.drawRectangle({
            x: pdfX,
            y: pdfY - boxH, // Shift down because y is lower-left
            width: boxW,
            height: boxH,
            color: rgb(0, 0, 0),
          });
        } else if (edit.type === 'highlight' && edit.width && edit.height) {
          const boxW = edit.width * width;
          const boxH = edit.height * height;
          page.drawRectangle({
            x: pdfX,
            y: pdfY - boxH,
            width: boxW,
            height: boxH,
            color: rgb(1, 1, 0), // Yellow
            opacity: 0.3,
          });
        }
      }

      // Delete pages in reverse order so indices do not shift
      const sortedDeleted = [...deletedPages].sort((a, b) => b - a);
      for (const pageIdx of sortedDeleted) {
        if (pageIdx >= 0 && pageIdx < pages.length && pdfDoc.getPageCount() > 1) {
          pdfDoc.removePage(pageIdx);
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `${file.name.replace('.pdf', '')}_edited.pdf`);

      toast.success('PDF updated successfully!');
      incrementTaskCount();
      addRecentFile({
        name: file.name,
        type: 'Edit PDF',
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        tool: 'Edit PDF',
        timestamp: Date.now()
      });

    } catch (error) {
      console.error(error);
      toast.error('Failed to edit PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ToolShell
      toolId="edit-pdf"
      title="Edit PDF"
      description="Add text, shape redactions, and visuals directly onto your PDF pages."
      icon={<FileSignature size={32} />}
      accentColor="bg-pink-100 text-pink-600 dark:bg-pink-500/20 dark:text-pink-400"
    >
      <div className="space-y-6">
        {!file ? (
          <DropZone onFiles={handleFiles} maxFiles={1} accept={{ 'application/pdf': ['.pdf'] }} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar Toolbar */}
            <div className="lg:col-span-1 space-y-4">
              <GlassCard className="p-4">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-sm">
                  <span className="font-bold truncate" title={file.name}>{file.name}</span>
                  <button onClick={() => setFile(null)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white p-1">
                    <XIcon size={16} />
                  </button>
                </div>

                <div className="space-y-2 mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tools</p>
                  <button
                    onClick={() => setActiveTool('text')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTool === 'text' ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    <Type size={18} />
                    <span className="font-medium text-sm">Add Text</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('highlight')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTool === 'highlight' ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    <Highlighter size={18} />
                    <span className="font-medium text-sm">Highlight</span>
                  </button>
                  <button
                    onClick={() => setActiveTool('redact')}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${activeTool === 'redact' ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/20 dark:text-pink-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  >
                    <Square fill="currentColor" size={18} />
                    <span className="font-medium text-sm">Redact Content</span>
                  </button>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setDeletedPages(prev => prev.includes(currentPage - 1) ? prev.filter(p => p !== currentPage - 1) : [...prev, currentPage - 1])}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${deletedPages.includes(currentPage - 1) ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                    >
                      <Trash2 size={18} />
                      <span className="font-medium text-sm">{deletedPages.includes(currentPage - 1) ? 'Page Marked for Deletion' : 'Delete Current Page'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 italic leading-relaxed">
                  Select a tool above, then click anywhere on the page to insert. Double-click text to edit. Right side arrows to resize redactions.
                </p>

                <Button 
                  variant="primary" 
                  className="w-full text-sm bg-pink-600 hover:bg-pink-700 border-pink-600 dark:text-white"
                  onClick={handleExport}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Exporting...' : 'Export PDF'}
                </Button>
              </GlassCard>

              {/* Navigation */}
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 dark:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 dark:text-white"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Viewer */}
            <div className="lg:col-span-3 bg-slate-200 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-inner flex items-center justify-center p-4 min-h-[60vh] relative">
              
              <div 
                ref={containerRef}
                className="relative inline-block shadow-lg cursor-crosshair bg-white"
                onClick={handleCanvasClick}
                style={{ maxWidth: '100%', maxHeight: '100%', aspectRatio: 'auto' }}
              >
                <canvas ref={canvasRef} className="block w-full h-auto pointer-events-none" />

                {/* Overlays */}
                {currentEdits.map((edit) => (
                  <div
                    key={edit.id}
                    onClick={(e) => e.stopPropagation()} // Prevent adding a new one when clicking existing
                    className="absolute z-10 group"
                    style={{
                      left: `${edit.x * 100}%`,
                      top: `${edit.y * 100}%`,
                      width: edit.type === 'redact' || edit.type === 'highlight' ? `${(edit.width || 0.2) * 100}%` : 'auto',
                      height: edit.type === 'redact' || edit.type === 'highlight' ? `${(edit.height || 0.05) * 100}%` : 'auto',
                      minWidth: edit.type === 'text' ? '100px' : 'none',
                    }}
                  >
                    {edit.type === 'text' && (
                      <div className="relative">
                        <input
                          type="text"
                          value={edit.text || ''}
                          onChange={(e) => updateEdit(edit.id, { text: e.target.value })}
                          className="bg-transparent text-black border border-blue-500 border-dashed outline-none px-1 py-0 m-0 w-full font-sans max-w-[400px]"
                          style={{ fontSize: '14px', lineHeight: '1', minWidth: 'min-content' }}
                          autoFocus
                        />
                        <button 
                          onClick={(e) => deleteEdit(edit.id, e)}
                          className="absolute -top-6 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}

                    {edit.type === 'highlight' && (
                      <div className="w-full h-full bg-yellow-300/40 relative border border-yellow-500 border-dashed">
                        <div 
                          className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border border-yellow-500 cursor-se-resize rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateEdit(edit.id, { width: (edit.width || 0.2) + 0.05, height: (edit.height || 0.05) + 0.02 });
                          }}
                        >
                          +
                        </div>
                        <button 
                          onClick={(e) => deleteEdit(edit.id, e)}
                          className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}

                    {edit.type === 'redact' && (
                      <div className="w-full h-full bg-black relative border-2 border-red-500 border-dashed">
                        {/* Fake resizer handle */}
                        <div 
                          className="absolute -right-2 -bottom-2 w-4 h-4 bg-white border border-red-500 cursor-se-resize rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Super rough simulated resize block
                            updateEdit(edit.id, { width: (edit.width || 0.2) + 0.05, height: (edit.height || 0.05) + 0.02 });
                          }}
                        >
                          +
                        </div>
                        <button 
                          onClick={(e) => deleteEdit(edit.id, e)}
                          className="absolute -top-3 -right-3 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
