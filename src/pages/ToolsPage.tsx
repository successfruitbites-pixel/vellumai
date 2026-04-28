import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, Scissors, Minimize2, FileCode2, Image as ImageIcon, RefreshCw, Lock, Key, ScanLine, Wand2 } from 'lucide-react';
import { ToolCard } from '../components/ui/ToolCard';

const ALL_TOOLS = [
  { id: 'merge', title: 'Merge PDF', description: 'Combine multiple PDFs into one unified document', icon: <FileText size={24} />, category: 'PDF Tools', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 'split', title: 'Split PDF', description: 'Extract pages or split by range', icon: <Scissors size={24} />, category: 'PDF Tools', color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { id: 'compress', title: 'Compress PDF', description: 'Reduce file size without quality loss', icon: <Minimize2 size={24} />, category: 'PDF Tools', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  { id: 'pdf-to-word', title: 'PDF to Word', description: 'Convert PDFs to editable DOCX files', icon: <FileCode2 size={24} />, category: 'Convert', color: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 'pdf-to-excel', title: 'PDF to Excel', description: 'Extract tables directly into spreadsheets', icon: <FileText size={24} />, category: 'Convert', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Convert every PDF page to an image', icon: <ImageIcon size={24} />, category: 'Convert', color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { id: 'image-compress', title: 'Compress Image', description: 'Shrink images preserving visual quality', icon: <ImageIcon size={24} />, category: 'Image Tools', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
  { id: 'image-to-webp', title: 'Convert to WebP', description: 'Convert to next-gen WebP format', icon: <RefreshCw size={24} />, category: 'Image Tools', color: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
  { id: 'image-resize', title: 'Resize Image', description: 'Batch resize images to any dimension', icon: <Minimize2 size={24} />, category: 'Image Tools', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { id: 'lock', title: 'Lock PDF', description: 'Password-protect sensitive documents', icon: <Lock size={24} />, category: 'PDF Tools', badge: 'Pro', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
  { id: 'unlock', title: 'Unlock PDF', description: 'Remove PDF password protection', icon: <Key size={24} />, category: 'PDF Tools', color: 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
  { id: 'rotate', title: 'Rotate PDF', description: 'Rotate pages to the correct orientation', icon: <RefreshCw size={24} />, category: 'PDF Tools', color: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
  { id: 'scanner', title: 'Scanner', description: 'Scan physical documents with your camera', icon: <ScanLine size={24} />, category: 'AI Tools', badge: 'New', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  { id: 'ai-upscale', title: 'AI Upscale', description: 'Enhance image resolution with AI', icon: <Wand2 size={24} />, category: 'AI Tools', badge: 'AI', color: 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400' },
  { id: 'bg-removal', title: 'Remove Background', description: 'Automatically remove image backgrounds', icon: <ImageIcon size={24} />, category: 'AI Tools', badge: 'Pro', color: 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
];

const CATEGORIES = ['All', 'PDF Tools', 'Image Tools', 'AI Tools', 'Convert'];

export default function ToolsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredTools = useMemo(() => {
    return ALL_TOOLS.filter(tool => {
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -m-4 md:-m-8 p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-syne font-bold text-3xl md:text-4xl text-slate-900 dark:text-white tracking-tight mb-2">
            All Tools
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {ALL_TOOLS.length} powerful web-based utilities at your fingertips.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary/50 shadow-sm transition-all"
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex overflow-x-auto pb-2 scrollbar-hide gap-2">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === category
                ? 'bg-brand-primary text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* TOOLS GRID */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTools.map(tool => (
            <ToolCard
              key={tool.id}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              badge={tool.badge}
              color={tool.color}
              onClick={() => navigate(`/app/tools/${tool.id}`)}
              className="border border-white/50 dark:border-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-slate-200/50 dark:border-slate-800 backdrop-blur-sm">
          <Search size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="font-syne font-bold text-xl text-slate-900 dark:text-white mb-2">No tools found</h3>
          <p className="text-slate-500 max-w-md mx-auto">
            We couldn't find any tools matching "{searchQuery}". Try a different search term or category.
          </p>
          <button 
            onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
            className="mt-6 text-brand-primary font-bold hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
