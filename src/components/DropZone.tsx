import React, { useCallback, useState } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, AlertCircle } from 'lucide-react';
import { GlassCard } from './ui/GlassCard';

export interface DropZoneProps {
  onFiles: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const DropZone: React.FC<DropZoneProps> = ({
  onFiles,
  accept = { 'application/pdf': ['.pdf'] },
  multiple = false,
  maxFiles = 10,
  maxSizeMB = 50,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: FileRejection[]) => {
    setErrorMsg(null);
    if (fileRejections.length > 0) {
      const error = fileRejections[0].errors[0];
      if (error.code === 'file-too-large') {
        setErrorMsg(`File is too large. Max size is ${maxSizeMB}MB.`);
      } else if (error.code === 'file-invalid-type') {
        setErrorMsg('Invalid file type.');
      } else if (error.code === 'too-many-files') {
        setErrorMsg(`Too many files. Max is ${maxFiles}.`);
      } else {
        setErrorMsg(error.message);
      }
      return;
    }

    let newFiles = [...selectedFiles, ...acceptedFiles];
    if (!multiple) {
      newFiles = [acceptedFiles[0]];
    } else if (newFiles.length > maxFiles) {
      setErrorMsg(`You can only upload up to ${maxFiles} files.`);
      newFiles = newFiles.slice(0, maxFiles);
    }

    setSelectedFiles(newFiles);
    onFiles(newFiles);
  }, [selectedFiles, multiple, maxFiles, maxSizeMB, onFiles]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFiles(newFiles);
  };

  const getBorderColor = () => {
    if (isDragReject || errorMsg) return 'border-red-400 dark:border-red-500 bg-red-50/50 dark:bg-red-500/10';
    if (isDragActive) return 'border-blue-400 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.01]';
    return 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800/50';
  };

  return (
    <div className="w-full">
      <GlassCard
        {...getRootProps()}
        className={`w-full p-8 md:p-12 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ease-in-out outline-none ${getBorderColor()}`}
      >
        <input {...getInputProps()} />
        <UploadCloud size={48} className={`mb-4 ${isDragReject || errorMsg ? 'text-red-400' : 'text-blue-500'}`} />
        <p className="font-syne font-bold text-xl text-slate-900 dark:text-white mb-2 text-center">
          {isDragActive ? 'Drop your files here!' : 'Drop your files here'}
        </p>
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
          or <span className="text-blue-600 dark:text-blue-400 hover:underline">browse files</span> on your device
        </p>
      </GlassCard>

      {errorMsg && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          {selectedFiles.map((file, i) => (
            <div key={`${file.name}-${i}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:shadow-sm transition-all group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0">
                  <FileIcon size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <X size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
