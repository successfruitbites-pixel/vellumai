import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutGrid, List as ListIcon, Search, FileText, Image as ImageIcon, FileArchive, Trash2, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppStore, RecentFile } from '../store/appStore';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';

export default function FilesPage() {
  const storeRecentFiles = useAppStore(state => state.recentFiles);
  const recentFiles = storeRecentFiles || [];
  const { removeRecentFile, clearRecentFiles } = useAppStore();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'size'>('newest');
  
  // Load view preference if desired from local storage, but state is fine for now.

  const getFileIcon = (tool: string, type: string) => {
    const lTool = tool.toLowerCase();
    if (lTool.includes('pdf') || type.includes('pdf')) return <FileText size={32} className="text-red-500" />;
    if (lTool.includes('image') || lTool.includes('bg') || lTool.includes('scanner') || type.includes('image')) return <ImageIcon size={32} className="text-green-500" />;
    // Default fallback
    return <FileArchive size={32} className="text-blue-500" />;
  };

  const parseSize = (sizeStr: string): number => {
    // E.g. "4.2 MB" or "150 KB" or "2 pages" (for scanner usually we format size as "N pages", but instructions say size parsed "4.2 MB")
    const num = parseFloat(sizeStr);
    if (isNaN(num)) return 0;
    if (sizeStr.toLowerCase().includes('mb')) return num * 1024 * 1024;
    if (sizeStr.toLowerCase().includes('kb')) return num * 1024;
    return num; // basic fallback
  };

  const filteredAndSortedFiles = useMemo(() => {
    let files = recentFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    files.sort((a, b) => {
      switch (sortBy) {
        case 'newest': return b.timestamp - a.timestamp;
        case 'oldest': return a.timestamp - b.timestamp;
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return parseSize(b.size) - parseSize(a.size);
        default: return 0;
      }
    });

    return files;
  }, [recentFiles, searchQuery, sortBy]);

  const stats = useMemo(() => {
    const totalFiles = recentFiles.length;
    let pdfCount = 0;
    let imgCount = 0;
    let totalSize = 0;

    recentFiles.forEach(f => {
      const lTool = f.tool.toLowerCase();
      if (lTool.includes('pdf') || f.type?.includes('pdf')) pdfCount++;
      else if (lTool.includes('image') || lTool.includes('bg') || lTool.includes('scanner') || f.type?.includes('image')) imgCount++;
      else pdfCount++; // fallback assume pdf for mostly pdf app
      
      const s = parseSize(f.size);
      if (f.size.toLowerCase().includes('mb') || f.size.toLowerCase().includes('kb') || f.type?.includes('remove')) {
        totalSize += s;
      }
    });

    return {
      totalFiles,
      pdfCount,
      imgCount,
      totalSize: totalSize > 1024 * 1024 ? `${(totalSize / 1024 / 1024).toFixed(2)} MB` : `${(totalSize / 1024).toFixed(2)} KB`
    };
  }, [recentFiles]);

  const formatTimeAgo = (timestamp: number) => {
    const diff = (Date.now() - timestamp) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your file history? This cannot be undone.')) {
      clearRecentFiles();
    }
  };

  const openFile = (dataUrl?: string) => {
    if (dataUrl) {
      if (dataUrl.startsWith('blob:')) {
         window.open(dataUrl, '_blank');
      } else {
         // Create a temporary link to download/view if it’s base64
         const w = window.open();
         if (w) {
            w.document.write(`<iframe src="${dataUrl}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
         }
      }
    } else {
      alert("This file currently does not have a saved data URL in history.");
    }
  };

  const getToolLink = (toolName: string) => {
    const lookup: Record<string, string> = {
      'Merge PDF': '/app/tools/merge',
      'Split PDF': '/app/tools/split',
      'Compress PDF': '/app/tools/compress',
      'Rotate PDF': '/app/tools/rotate',
      'Lock PDF': '/app/tools/lock',
      'Unlock PDF': '/app/tools/unlock',
      'PDF to JPG': '/app/tools/pdf-to-jpg',
      'Image Compress': '/app/tools/image-compress',
      'Image to WebP': '/app/tools/image-to-webp',
      'Image Resize': '/app/tools/image-resizer',
      'Image Upscale': '/app/tools/ai-upscale',
      'BG Removal': '/app/tools/bg-removal',
      'Scanner': '/app/tools/scanner'
    };
    // approximate matching
    for (const key of Object.keys(lookup)) {
      if (toolName.toLowerCase().includes(key.toLowerCase())) return lookup[key];
    }
    return '/app/tools';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-syne font-bold text-3xl dark:text-white mb-2">My Files</h1>
          <p className="text-slate-500 dark:text-slate-400">Your recent processed documents</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
             <input 
               type="text" 
               placeholder="Search files..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full sm:w-64 pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none text-sm dark:text-white transition-all shadow-sm"
             />
          </div>
          
          <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm">
             <button 
               onClick={() => setViewMode('grid')}
               className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-700 text-brand-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
             >
               <LayoutGrid size={18} />
             </button>
             <button 
               onClick={() => setViewMode('list')}
               className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-700 text-brand-primary' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
             >
               <ListIcon size={18} />
             </button>
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-brand-primary/20 shadow-sm"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name">Name A-Z</option>
            <option value="size">Largest</option>
          </select>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-xl flex items-center justify-center shrink-0">
            <FileArchive size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Files</p>
            <p className="text-2xl font-bold font-syne dark:text-white">{stats.totalFiles}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 rounded-xl flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">PDF Files</p>
            <p className="text-2xl font-bold font-syne dark:text-white">{stats.pdfCount}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 rounded-xl flex items-center justify-center shrink-0">
            <ImageIcon size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Image Files</p>
            <p className="text-2xl font-bold font-syne dark:text-white">{stats.imgCount}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-gold/20 text-yellow-600 dark:text-yellow-500 rounded-xl flex items-center justify-center shrink-0">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Storage Used</p>
            <p className="text-2xl font-bold font-syne dark:text-white">{recentFiles.length ? stats.totalSize : '0 KB'}</p>
          </div>
        </GlassCard>
      </div>

      {/* Main Content */}
      <div className="min-h-[400px]">
        {recentFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-center">
             <div className="relative mb-6">
                <FileArchive size={80} className="text-brand-primary opacity-20" />
                <div className="absolute -top-2 -right-2 text-brand-gold animate-bounce">✨</div>
             </div>
             <h2 className="font-syne font-bold text-2xl dark:text-white mb-2">No files yet</h2>
             <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">Processed files will appear here. Start with a tool to build your history.</p>
             <Button variant="primary" onClick={() => navigate('/app/tools')}>Browse Tools &rarr;</Button>
          </div>
        ) : filteredAndSortedFiles.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-20 text-center">
             <Search size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
             <h2 className="font-bold text-xl dark:text-white mb-2">No results found</h2>
             <p className="text-slate-500 dark:text-slate-400">We couldn't find any files matching "{searchQuery}".</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedFiles.map((file) => (
                  <GlassCard key={file.id} className="p-5 flex flex-col hover:-translate-y-1 transition-transform duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl flex items-center justify-center shadow-sm">
                        {getFileIcon(file.tool, file.type)}
                      </div>
                      <button title="Remove from history" onClick={() => file.id && removeRecentFile(file.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    <div className="mb-6 flex-1">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</h3>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">{file.size}</span>
                        <span className="font-medium text-brand-primary">{file.tool}</span>
                        <span>• {formatTimeAgo(file.timestamp)}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <Button variant="secondary" size="sm" onClick={() => openFile(file.dataUrl)} disabled={!file.dataUrl} className="w-full text-xs" title={!file.dataUrl ? "File data not saved in browser storage" : ""}>
                         <ExternalLink size={14} className="mr-1.5" /> Open
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => navigate(getToolLink(file.tool))} className="w-full text-xs">
                         <RefreshCw size={14} className="mr-1.5" /> Process Again
                      </Button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                         <th className="px-6 py-4 font-bold">File</th>
                         <th className="px-6 py-4 font-bold">Tool</th>
                         <th className="px-6 py-4 font-bold">Size</th>
                         <th className="px-6 py-4 font-bold">Date</th>
                         <th className="px-6 py-4 font-bold text-right">Actions</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                       {filteredAndSortedFiles.map((file, idx) => (
                         <tr key={file.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                           <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 shrink-0 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700">
                                 {getFileIcon(file.tool, file.type)}
                               </div>
                               <span className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={file.name}>{file.name}</span>
                             </div>
                           </td>
                           <td className="px-6 py-4 text-sm font-medium text-brand-primary">{file.tool}</td>
                           <td className="px-6 py-4 text-sm text-slate-500">{file.size}</td>
                           <td className="px-6 py-4 text-sm text-slate-500">{formatTimeAgo(file.timestamp)}</td>
                           <td className="px-6 py-4 text-right">
                             <div className="flex items-center justify-end gap-2">
                               <button disabled={!file.dataUrl} onClick={() => openFile(file.dataUrl)} className="text-slate-500 hover:text-brand-primary p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title={!file.dataUrl ? "File data not saved" : "Open file"}>
                                 <ExternalLink size={18} />
                               </button>
                               <button onClick={() => navigate(getToolLink(file.tool))} className="text-slate-500 hover:text-brand-primary p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Go to tool">
                                 <RefreshCw size={18} />
                               </button>
                               <button onClick={() => file.id && removeRecentFile(file.id)} className="text-slate-500 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                 <Trash2 size={18} />
                               </button>
                             </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
            )}

            <div className="mt-8 flex justify-center pb-8 border-b border-slate-200 dark:border-slate-800">
               <button onClick={handleClearHistory} className="text-sm font-bold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2">
                 <Trash2 size={16} /> Clear File History
               </button>
            </div>
          </>
        )}
      </div>

      {/* Storage Note */}
      <div className="bg-amber-50 dark:bg-amber-900/10 border border-brand-gold/30 rounded-xl p-4 flex items-start gap-4 mx-auto max-w-4xl text-left">
         <AlertCircle className="text-brand-gold shrink-0 mt-0.5" size={20} />
         <p className="text-sm text-amber-900 dark:text-amber-200/80">
           <strong>Privacy Note:</strong> Files are not stored on our servers. This list tracks your processing history locally in your browser. Clearing your history here will not delete the original files from your device.
         </p>
      </div>
    </div>
  );
}
