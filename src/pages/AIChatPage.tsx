import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Select from 'react-select';
import { Send, FileText, AlignLeft, List, Shuffle, FileInput, Languages, Key, Heading, ClipboardCopy, Download, ArrowLeft } from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';
import { DropZone } from '../components/DropZone';
import { summarizePDF, translatePDF, extractKeyPoints, suggestFilename } from '../lib/gemini';
import toast from 'react-hot-toast';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { useAppStore } from '../store/appStore';
import { UpgradeModal } from '../components/UpgradeModal';

const languageOptions = [
  { value: 'Yoruba', label: 'Yoruba' },
  { value: 'Igbo', label: 'Igbo' },
  { value: 'Hausa', label: 'Hausa' },
  { value: 'French', label: 'French' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'German', label: 'German' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Swahili', label: 'Swahili' },
];

export default function AIChatPage() {
  const { messages, isLoading, pdfText, fileName, messagesEndRef, handleFileUpload, sendMessage } = useAIChat();
  const [input, setInput] = useState('');
  const [summaryStyle, setSummaryStyle] = useState<'brief'|'detailed'|'bullets'>('brief');
  const [targetLang, setTargetLang] = useState(languageOptions[0]);
  const [quickResult, setQuickResult] = useState<{title: string, content: string}|null>(null);
  
  const { isPro } = useAppStore();
  const [showUpgrade, setShowUpgrade] = useState(false);

  const onSend = () => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    if (input.trim()) {
      sendMessage(input);
      setInput('');
      setQuickResult(null); // Return to chat view
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const wrapFileUpload = (f: File) => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    handleFileUpload(f);
  };

  const handleQuickAction = async (action: string) => {
    if (!isPro) {
      setShowUpgrade(true);
      return;
    }
    if (!pdfText) {
      toast.error('Please upload a PDF first.');
      return;
    }
    setQuickResult(null);
    let toastId = toast.loading('AI is thinking...');
    try {
      if (action === 'summarize') {
        const result = await summarizePDF(pdfText, summaryStyle);
        setQuickResult({ title: 'Summary', content: result || '' });
      } else if (action === 'translate') {
        const result = await translatePDF(pdfText, targetLang.value);
        setQuickResult({ title: `Translation (${targetLang.value})`, content: result || '' });
      } else if (action === 'keypoints') {
        const result = await extractKeyPoints(pdfText);
        setQuickResult({ title: 'Key Points', content: result.map(p => `- ${p}`).join('\n') });
      } else if (action === 'filename') {
        const result = await suggestFilename(pdfText);
        setQuickResult({ title: 'Suggested Filename', content: result || '' });
      }
      toast.success('Done!', { id: toastId });
    } catch (e: any) {
      console.error(e);
      toast.error('Failed to process. Check API key.', { id: toastId });
    }
  };

  const copyToClipboard = () => {
    if (quickResult) {
      navigator.clipboard.writeText(quickResult.content);
      toast.success('Copied to clipboard');
    }
  };

  const downloadText = () => {
    if (quickResult) {
      const blob = new Blob([quickResult.content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${quickResult.title.replace(/\s+/g, '_').toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] w-full overflow-hidden">
      
      {/* LEFT PANEL */}
      <div className="w-full lg:w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-4 shrink-0 overflow-y-auto">
        <div className="mb-6">
          {!fileName ? (
            <DropZone onFiles={(f) => wrapFileUpload(f[0])} maxFiles={1} accept={{'application/pdf': ['.pdf']}} />
          ) : (
            <GlassCard className="p-4 rounded-xl border border-green-500/30 bg-green-50/50 dark:bg-green-900/10">
              <div className="flex items-center gap-3">
                <FileText className="text-green-600 dark:text-green-400" size={24} />
                <div className="overflow-hidden">
                  <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{fileName}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Ready to chat
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">AI Quick Actions</h3>
            
            {/* Summarize Action */}
            <div className="mb-4">
              <GlassCard className="p-3 rounded-xl border-brand-gold/30 hover:border-brand-gold transition-colors dark:bg-slate-800/80">
                <button onClick={() => handleQuickAction('summarize')} className="flex items-center justify-between w-full font-bold text-sm text-slate-800 dark:text-white mb-2">
                  <span className="flex items-center gap-2"><Heading size={16} className="text-brand-gold" /> Summarize PDF</span>
                </button>
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                  {(['brief', 'detailed', 'bullets'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => setSummaryStyle(style)}
                      className={`flex-1 text-xs py-1.5 px-2 rounded-md capitalize transition-colors ${summaryStyle === style ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-primary font-bold' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Translate Action */}
            <div className="mb-4">
              <GlassCard className="p-3 rounded-xl border-brand-gold/30 hover:border-brand-gold transition-colors dark:bg-slate-800/80">
                <button onClick={() => handleQuickAction('translate')} className="flex items-center justify-between w-full font-bold text-sm text-slate-800 dark:text-white mb-2">
                  <span className="flex items-center gap-2"><Languages size={16} className="text-brand-gold" /> Translate PDF</span>
                </button>
                <Select
                  options={languageOptions}
                  value={targetLang}
                  onChange={(v) => v && setTargetLang(v)}
                  className="text-sm dark:text-slate-900"
                  menuPosition="fixed"
                />
              </GlassCard>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <GlassCard className="p-3 rounded-xl border-brand-gold/30 hover:border-brand-gold transition-colors dark:bg-slate-800/80 flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => handleQuickAction('keypoints')}>
                <Key size={20} className="text-brand-gold mb-2" />
                <span className="text-xs font-bold dark:text-white">Key Points</span>
              </GlassCard>

              <GlassCard className="p-3 rounded-xl border-brand-gold/30 hover:border-brand-gold transition-colors dark:bg-slate-800/80 flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => handleQuickAction('filename')}>
                <FileInput size={20} className="text-brand-gold mb-2" />
                <span className="text-xs font-bold dark:text-white">Auto-Name</span>
              </GlassCard>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center gap-2 flex-col">
            <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">Powered by Gemini 2.0 Flash</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - CHAT */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-slate-900 overflow-hidden">
        {/* Header */}
        <div className="h-14 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="font-bold font-syne dark:text-white flex items-center gap-2">
               PDF Maestro AI
            </div>
          </div>
          {fileName && (
            <div className="text-xs font-medium px-3 py-1 bg-green-50 text-green-600 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-full flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Ready
            </div>
          )}
        </div>

        {/* Message Area or Quick Result Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
          {quickResult ? (
             <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                <Button variant="ghost" size="sm" onClick={() => setQuickResult(null)} className="mb-4 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
                  <ArrowLeft size={16} className="mr-2" /> Back to Chat
                </Button>
                <GlassCard className="p-6 md:p-8 rounded-2xl border-brand-gold/30 bg-gradient-to-b from-brand-gold/5 outline outline-1 outline-brand-gold/10">
                  <div className="flex justify-between items-start mb-6 border-b border-brand-gold/20 pb-4">
                    <h2 className="text-2xl font-bold font-syne dark:text-white flex items-center gap-2">
                      <span className="text-2xl">✨</span> {quickResult.title}
                    </h2>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={copyToClipboard}><ClipboardCopy size={16} /></Button>
                      <Button variant="primary" size="sm" className="bg-brand-gold hover:bg-brand-gold/90 text-slate-900 border-none" onClick={downloadText}><Download size={16} /></Button>
                    </div>
                  </div>
                  <div className="prose dark:prose-invert max-w-none">
                     <ReactMarkdown>{quickResult.content}</ReactMarkdown>
                  </div>
                </GlassCard>
             </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.length === 0 && !pdfText ? (
                <div className="h-full flex flex-col justify-center items-center text-center opacity-50 py-20">
                  <div className="text-6xl mb-4 grayscale">🤖</div>
                  <p className="dark:text-slate-400">Upload a PDF to start chatting</p>
                </div>
              ) : messages.length === 0 && pdfText ? (
                 <div className="h-full flex flex-col justify-center items-center text-center opacity-50 py-20">
                  <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-4 dark:text-slate-400">Processing document...</p>
                 </div>
              ) : null}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-gold flex items-center justify-center shrink-0 mr-3 mt-1 shadow-md">
                       <span className="text-white text-xs">AI</span>
                    </div>
                  )}
                  <div className={`max-w-[85%] md:max-w-[75%] px-5 py-3.5 shadow-sm 
                    ${msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-2xl rounded-br-sm' 
                      : msg.role === 'system'
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl border border-red-200 dark:border-red-800/50 text-sm'
                        : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 text-slate-800 dark:text-slate-200 rounded-2xl rounded-bl-sm'}
                  `}>
                    {msg.role === 'ai' ? (
                      <div className="prose dark:prose-invert max-w-none text-sm md:text-base prose-p:leading-relaxed prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-a:text-brand-primary">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-sm md:text-base leading-relaxed break-words">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                 <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-primary to-brand-gold flex items-center justify-center shrink-0 mr-3 shadow-md">
                       <span className="text-white text-xs">AI</span>
                    </div>
                    <div className="px-5 py-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                       <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                       <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                       <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                 </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="absolute bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 p-4">
          <div className="max-w-3xl mx-auto">
            {messages.length === 1 && !quickResult && (
              <div className="flex flex-wrap gap-2 mb-3">
                <button onClick={() => setInput('What is this document about?')} className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-200 dark:border-slate-700">What is this about?</button>
                <button onClick={() => setInput('What are the main conclusions?')} className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-200 dark:border-slate-700">Main conclusions?</button>
                <button onClick={() => setInput('Summarize in 3 bullet points')} className="text-xs bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-full transition-colors border border-slate-200 dark:border-slate-700">3 bullet points summary</button>
              </div>
            )}
            <div className="relative shadow-sm rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-brand-primary/20 focus-within:border-brand-primary transition-all">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={pdfText ? "Ask anything about your document..." : "Upload a PDF first..."}
                disabled={!pdfText || isLoading}
                className="w-full bg-transparent px-4 py-4 pr-14 outline-none resize-none max-h-32 dark:text-white disabled:opacity-50 min-h-[56px]"
                rows={1}
                style={{ height: 'auto', minHeight: '56px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                }}
              />
              <button
                onClick={onSend}
                disabled={!input.trim() || !pdfText || isLoading}
                className="absolute right-2 top-2 p-2 rounded-xl bg-brand-primary text-white hover:bg-brand-secondary disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-700 transition-colors shadow-sm"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <UpgradeModal isOpen={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </div>
  );
}
