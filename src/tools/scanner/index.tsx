import React, { useState, useEffect, useRef } from 'react';
import { Camera, Upload, RefreshCw, Plus, ArrowRight, Settings2, Download, Copy, Image as ImageIcon, FileText, CheckCircle2, X } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import { DropZone } from '../../components/DropZone';
import { ToolShell } from '../../components/ToolShell';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { useAppStore } from '../../store/appStore';
import { UpgradeModal } from '../../components/UpgradeModal';
import { suggestFilename } from '../../lib/gemini';

interface ScannedPage {
  id: string;
  originalDataUrl: string;
  enhancedDataUrl: string;
  settings: {
    brightness: number;
    contrast: number;
    filter: 'original' | 'document' | 'dark' | 'color' | 'auto';
  };
  ocrText?: string;
}

const STEPS = ['Capture', 'Enhance', 'OCR', 'Export'];

export default function ScannerTool() {
  const [step, setStep] = useState(1);
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [currentPageId, setCurrentPageId] = useState<string | null>(null);
  
  // Camera State
  const [cameraMode, setCameraMode] = useState<'camera' | 'upload'>('camera');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Enhance State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  // OCR State
  const [ocrLanguage, setOcrLanguage] = useState('eng');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [combinedOcrText, setCombinedOcrText] = useState('');
  
  // Export State
  const [exportFormat, setExportFormat] = useState<'pdf' | 'image'>('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  
  const { isPro, checkTaskLimit, incrementTaskCount, addRecentFile } = useAppStore();

  const currentPageIndex = pages.findIndex(p => p.id === currentPageId);
  const currentPage = pages[currentPageIndex];

  // Camera Management
  const startCamera = async (facing: 'environment' | 'user') => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Could not access camera. Please check permissions or switch to Upload mode.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (step === 1 && cameraMode === 'camera') {
      startCamera(facingMode);
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step, cameraMode, facingMode]);

  // Capture Image
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        addNewPage(dataUrl);
      }
    }
  };

  const handleUpload = async (files: File[]) => {
    if (files.length === 0) return;
    
    const newPages: ScannedPage[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newPages.push({
        id: Date.now().toString() + Math.random(),
        originalDataUrl: dataUrl,
        enhancedDataUrl: dataUrl,
        settings: { brightness: 0, contrast: 100, filter: 'original' }
      });
    }
    
    if (newPages.length > 0) {
      setPages(prev => [...prev, ...newPages]);
      setCurrentPageId(newPages[0].id);
      setStep(2);
    }
  };

  const addNewPage = (dataUrl: string) => {
    const newPage: ScannedPage = {
      id: Date.now().toString() + Math.random(),
      originalDataUrl: dataUrl,
      enhancedDataUrl: dataUrl,
      settings: { brightness: 0, contrast: 100, filter: 'original' }
    };
    setPages(prev => [...prev, newPage]);
    setCurrentPageId(newPage.id);
    setStep(2);
  };

  // Enhance Image Function
  const applyEnhancements = (pageId: string, settings: ScannedPage['settings']) => {
    setIsEnhancing(true);
    const page = pages.find(p => p.id === pageId);
    if (!page) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Base adjustments
      ctx.filter = `brightness(${100 + settings.brightness}%) contrast(${settings.contrast}%)`;
      ctx.drawImage(img, 0, 0);

      // Filters
      if (settings.filter === 'document' || settings.filter === 'dark') {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          let v = 0.2126 * r + 0.7152 * g + 0.0722 * b; // grayscale
          
          if (settings.filter === 'document') {
             // Adaptive-like threshold for document
             v = v > 150 ? 255 : (v < 80 ? 0 : v); 
          }
          data[i] = data[i + 1] = data[i + 2] = v;
        }
        ctx.putImageData(imageData, 0, 0);
      } else if (settings.filter === 'auto') {
         ctx.filter = 'brightness(110%) contrast(120%) saturate(120%)';
         ctx.drawImage(img, 0, 0);
      }

      const newUrl = canvas.toDataURL('image/jpeg', 0.95);
      setPages(prev => prev.map(p => p.id === pageId ? { ...p, enhancedDataUrl: newUrl, settings } : p));
      setIsEnhancing(false);
    };
    img.src = page.originalDataUrl;
  };

  const updateSettings = (upd: Partial<ScannedPage['settings']>) => {
    if (!currentPage) return;
    const newSettings = { ...currentPage.settings, ...upd };
    if (upd.filter === 'document') {
      newSettings.brightness = 20;
      newSettings.contrast = 150;
    } else if (upd.filter === 'auto') {
      newSettings.brightness = 10;
      newSettings.contrast = 120;
    } else if (upd.filter === 'original') {
      newSettings.brightness = 0;
      newSettings.contrast = 100;
    }
    applyEnhancements(currentPage.id, newSettings);
  };

  const deletePage = (id: string) => {
    setPages(prev => {
      const next = prev.filter(p => p.id !== id);
      if (next.length === 0) setStep(1);
      else if (currentPageId === id) setCurrentPageId(next[0].id);
      return next;
    });
  };

  // OCR
  const runOCR = async () => {
    if (pages.length === 0) return;
    setIsRecognizing(true);
    setOcrProgress(0);
    
    try {
      const worker = await Tesseract.createWorker(ocrLanguage, 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
             setOcrProgress(Math.round(m.progress * 100));
          }
        }
      });
      
      let allText = '';
      for (const page of pages) {
        const { data: { text } } = await worker.recognize(page.enhancedDataUrl);
        allText += text + '\n\n---\n\n';
        setPages(prev => prev.map(p => p.id === page.id ? { ...p, ocrText: text } : p));
      }
      setCombinedOcrText(allText.trim());
      await worker.terminate();
      toast.success('OCR completed successfully');
      setStep(4);
    } catch (err) {
      console.error(err);
      toast.error('Failed to run OCR. Please try again.');
    } finally {
      setIsRecognizing(false);
    }
  };

  // Export
  const handleExport = async () => {
    if (pages.length === 0) return;
    
    const { allowed } = checkTaskLimit();
    if (!allowed) {
      setShowUpgrade(true);
      return;
    }

    setIsExporting(true);
    let toastId = toast.loading('Preparing export...');

    try {
      let finalFilename = 'scanned-document';
      if (combinedOcrText && isPro) {
         try {
           finalFilename = await suggestFilename(combinedOcrText) || finalFilename;
         } catch (e) {
           console.error("AI filename generation failed", e);
         }
      }

      if (exportFormat === 'pdf') {
        const pdfDoc = await PDFDocument.create();
        for (const page of pages) {
          const imgBytes = await fetch(page.enhancedDataUrl).then(res => res.arrayBuffer());
          const image = await pdfDoc.embedJpg(imgBytes);
          const pdfPage = pdfDoc.addPage([image.width, image.height]);
          pdfPage.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        }
        const pdfBytes = await pdfDoc.save();
        saveAs(new Blob([pdfBytes]), `${finalFilename}.pdf`);
      } else {
        if (pages.length === 1) {
          saveAs(pages[0].enhancedDataUrl, `${finalFilename}.jpg`);
        } else {
          const zip = new JSZip();
          pages.forEach((page, i) => {
            const data = page.enhancedDataUrl.split(',')[1];
            zip.file(`page_${i + 1}.jpg`, data, { base64: true });
          });
          const content = await zip.generateAsync({ type: 'blob' });
          saveAs(content, `${finalFilename}_images.zip`);
        }
      }
      
      toast.success('Export successful!', { id: toastId });
      incrementTaskCount();
      addRecentFile({
        name: finalFilename,
        type: 'Scanner',
        size: `${pages.length} pages`,
        tool: 'Scanner',
        timestamp: Date.now()
      });
    } catch (err) {
      console.error(err);
      toast.error('Export failed.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  // Render Helpers
  const StepIndicator = () => (
    <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 shrink-0">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold border-2 ${step > i + 1 ? 'bg-brand-primary border-brand-primary text-white' : step === i + 1 ? 'border-brand-primary text-brand-primary bg-blue-50 dark:bg-blue-900/30' : 'border-slate-200 text-slate-400 dark:border-slate-700'}`}>
            {step > i + 1 ? <CheckCircle2 size={16} /> : i + 1}
          </div>
          <span className={`ml-2 text-xs font-bold hidden sm:block ${step >= i + 1 ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{s}</span>
          {i < STEPS.length - 1 && <div className={`w-8 sm:w-16 h-0.5 mx-2 flex-shrink-0 ${step > i + 1 ? 'bg-brand-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />}
        </div>
      ))}
    </div>
  );

  return (
    <ToolShell
      toolId="scanner"
      title="Scanner + OCR"
      description="Scan physical documents with your camera and extract text automatically."
      icon={<Camera size={32} />}
      accentColor="bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400"
    >
      <div className="flex flex-col h-full min-h-[60vh]">
        <StepIndicator />

        {/* STEP 1: CAPTURE */}
        {step === 1 && (
          <div className="flex-1 flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-6 w-full">
              <button 
                onClick={() => setCameraMode('camera')} 
                className={`flex flex-col items-center justify-center p-6 gap-3 rounded-2xl border-2 transition-all ${cameraMode === 'camera' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:bg-brand-primary/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Camera size={32} />
                <span className="font-bold">Use Camera</span>
              </button>
              <button 
                onClick={() => setCameraMode('upload')} 
                className={`flex flex-col items-center justify-center p-6 gap-3 rounded-2xl border-2 transition-all ${cameraMode === 'upload' ? 'border-brand-primary bg-brand-primary/5 text-brand-primary dark:bg-brand-primary/10' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <Upload size={32} />
                <span className="font-bold">Upload Images</span>
              </button>
            </div>

            {cameraMode === 'camera' ? (
              <div className="relative flex-1 bg-black rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 min-h-[400px] flex flex-col">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                
                <div className="absolute top-4 right-4">
                  <button onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')} className="bg-black/50 hover:bg-black/70 backdrop-blur-md text-white p-3 rounded-full transition-colors border border-white/20">
                    <RefreshCw size={24} />
                  </button>
                </div>

                <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-black/80 to-transparent flex flex-col items-center">
                  <p className="text-white/80 font-medium mb-6 text-sm">Point camera at document, then tap capture</p>
                  <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-slate-200 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/50">
                    <div className="w-16 h-16 rounded-full border-2 border-slate-800"></div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <DropZone onFiles={handleUpload} maxFiles={20} accept={{ 'image/*': ['.jpg','.jpeg','.png','.webp'] }} multiple={true} />
              </div>
            )}
             
            {pages.length > 0 && (
              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)}>Review {pages.length} Page{pages.length > 1 ? 's' : ''} <ArrowRight size={18} className="ml-2" /></Button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: ENHANCE */}
        {step === 2 && currentPage && (
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-8">
            <GlassCard className="p-4 flex-1 flex flex-col sm:flex-row gap-6">
              
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative flex items-center justify-center min-h-[300px]">
                {isEnhancing && (
                   <div className="absolute inset-0 z-10 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
                     <RefreshCw size={24} className="text-brand-primary animate-spin" />
                   </div>
                )}
                <img src={currentPage.enhancedDataUrl} className="max-w-full max-h-full object-contain" alt="Scanned Document" />
                <button onClick={() => deletePage(currentPage.id)} className="absolute top-4 right-4 bg-red-500/80 text-white p-2 rounded-full hover:bg-red-600 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="w-full sm:w-80 flex flex-col gap-6 shrink-0">
                <div>
                  <h3 className="text-sm font-bold mb-3 dark:text-white uppercase tracking-wider">Filters</h3>
                  <div className="flex sm:grid sm:grid-cols-2 gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {(['original', 'document', 'auto', 'dark', 'color'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => updateSettings({ filter: f })}
                        className={`px-4 py-2 text-xs font-bold rounded-xl capitalize whitespace-nowrap transition-all border ${currentPage.settings.filter === f ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-brand-primary/50'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <button onClick={() => setShowAdvanced(!showAdvanced)} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-primary transition-colors">
                     <Settings2 size={16} /> Advanced Settings
                   </button>
                   {showAdvanced && (
                     <div className="mt-4 space-y-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                       <div>
                         <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                           <label>Brightness</label>
                           <span>{currentPage.settings.brightness}</span>
                         </div>
                         <input type="range" min="-50" max="50" value={currentPage.settings.brightness} onChange={(e) => updateSettings({ brightness: parseInt(e.target.value) })} className="w-full accent-brand-primary" />
                       </div>
                       <div>
                         <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                           <label>Contrast</label>
                           <span>{currentPage.settings.contrast}</span>
                         </div>
                         <input type="range" min="0" max="200" value={currentPage.settings.contrast} onChange={(e) => updateSettings({ contrast: parseInt(e.target.value) })} className="w-full accent-brand-primary" />
                       </div>
                     </div>
                   )}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="flex-1"><Plus size={16} className="mr-2" /> Add Page</Button>
                  <Button variant="primary" onClick={() => setStep(3)} className="flex-1">Next <ArrowRight size={16} className="ml-2" /></Button>
                </div>
              </div>
            </GlassCard>

            {/* Thumbnail Strip */}
            {pages.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 pt-2">
                {pages.map((p, i) => (
                  <div key={p.id} onClick={() => setCurrentPageId(p.id)} className={`relative shrink-0 w-20 h-28 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${currentPageId === p.id ? 'border-brand-primary scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={p.enhancedDataUrl} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-md">{i + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: OCR */}
        {step === 3 && (
          <div className="flex-1 flex flex-col items-center justify-center py-8 animate-in fade-in slide-in-from-right-8 max-w-2xl mx-auto w-full">
             <GlassCard className="p-8 w-full border border-purple-200 dark:border-purple-900/50 bg-gradient-to-b from-purple-50/50 text-center">
                <div className="w-20 h-20 bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-purple-200 dark:border-purple-800">
                  <FileText size={40} />
                </div>
                <h2 className="font-syne font-bold text-2xl mb-2 dark:text-white">Extract Text (OCR)</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Automatically recognize text from your document, making it searchable and selectable.</p>
                
                <div className="flex items-center justify-center gap-4 mb-8 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Document Language:</label>
                  <select 
                    value={ocrLanguage} 
                    onChange={e => setOcrLanguage(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800 border-none outline-none font-medium text-sm rounded-lg py-2 px-3 focus:ring-2 focus:ring-purple-500 dark:text-white cursor-pointer"
                  >
                    <option value="eng">English</option>
                    <option value="fra">French</option>
                    <option value="spa">Spanish</option>
                    <option value="deu">German</option>
                    <option value="chi_sim">Chinese</option>
                    <option value="ara">Arabic</option>
                  </select>
                </div>

                {isRecognizing ? (
                  <div className="space-y-3">
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400 animate-pulse">Running OCR Engine...</p>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4 overflow-hidden border border-slate-300 dark:border-slate-600">
                      <div className="bg-gradient-to-r from-purple-500 to-brand-primary h-full rounded-full transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="secondary" onClick={() => setStep(4)}>Skip OCR</Button>
                    <Button variant="primary" onClick={runOCR} className="bg-purple-600 hover:bg-purple-700 border-purple-600 text-white">Extract Text Now</Button>
                  </div>
                )}
             </GlassCard>
             <p className="text-xs text-slate-400 mt-6 text-center max-w-md">Note: OCR accuracy depends on image quality. Best results with "Document" filter in Step 2.</p>
          </div>
        )}

        {/* STEP 4: EXPORT */}
        {step === 4 && (
          <div className="flex-1 flex flex-col py-6 animate-in fade-in slide-in-from-right-8 max-w-4xl mx-auto w-full gap-6">
            <h2 className="font-syne font-bold text-3xl mb-2 dark:text-white">Export Document</h2>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-2/3 flex flex-col gap-6">
                
                {/* Format Selection */}
                <GlassCard className="p-6">
                  <h3 className="font-bold mb-4 dark:text-white flex items-center gap-2"><Settings2 size={18} /> Export Settings</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div 
                      onClick={() => setExportFormat('pdf')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${exportFormat === 'pdf' ? 'border-brand-primary bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-brand-primary/30'}`}
                    >
                      <div className={`p-3 rounded-full ${exportFormat === 'pdf' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}><FileText size={24} /></div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">PDF Document</p>
                        <p className="text-xs text-slate-500 mt-1">Multi-page PDF file</p>
                      </div>
                    </div>
                    
                    <div 
                      onClick={() => setExportFormat('image')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center text-center gap-3 ${exportFormat === 'image' ? 'border-brand-primary bg-blue-50/50 dark:bg-blue-900/10' : 'border-slate-100 dark:border-slate-800 hover:border-brand-primary/30'}`}
                    >
                      <div className={`p-3 rounded-full ${exportFormat === 'image' ? 'bg-brand-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}><ImageIcon size={24} /></div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">Image Files</p>
                        <p className="text-xs text-slate-500 mt-1">{pages.length > 1 ? 'ZIP containing JPGs' : 'Single JPG Image'}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* OCR Text Result */}
                {combinedOcrText && (
                  <GlassCard className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold dark:text-white flex items-center gap-2"><FileText size={18} /> Extracted Text</h3>
                      <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(combinedOcrText); toast.success('Text copied to clipboard'); }}><Copy size={16} className="mr-2" /> Copy All</Button>
                    </div>
                    <textarea 
                      className="flex-1 w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 dark:text-slate-300 resize-none outline-none focus:ring-2 focus:ring-brand-primary/50 text-sm font-mono min-h-[200px]"
                      value={combinedOcrText}
                      onChange={e => setCombinedOcrText(e.target.value)}
                    />
                  </GlassCard>
                )}
              </div>

              {/* Summary & Download Column */}
              <div className="w-full md:w-1/3 flex flex-col">
                 <GlassCard className="p-6 border-brand-gold/30 bg-gradient-to-b from-brand-gold/5 sticky top-6">
                    <h3 className="font-bold mb-6 dark:text-white pb-4 border-b border-slate-100 dark:border-slate-800">Export Summary</h3>
                    
                    <div className="space-y-4 mb-8">
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500">Total Pages</span>
                         <span className="font-bold dark:text-white">{pages.length}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500">Format</span>
                         <span className="font-bold dark:text-white uppercase">{exportFormat}</span>
                       </div>
                       <div className="flex justify-between text-sm">
                         <span className="text-slate-500">OCR Text</span>
                         <span className="font-bold dark:text-white">{combinedOcrText ? 'Included' : 'None'}</span>
                       </div>
                    </div>

                    <Button 
                      variant="primary" 
                      className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 border-green-600 text-white shadow-lg shadow-green-500/20"
                      onClick={handleExport}
                      disabled={isExporting}
                    >
                      {isExporting ? <RefreshCw className="animate-spin mr-2" size={20} /> : <Download className="mr-2" size={20} />}
                      {isExporting ? 'Exporting...' : 'Export Document'}
                    </Button>
                 </GlassCard>
              </div>
            </div>
          </div>
        )}
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </ToolShell>
  );
}
