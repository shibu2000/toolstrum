import React, { useState, useRef } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  sublabel?: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  accentColor?: string;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({
  accept,
  multiple = false,
  maxFiles = 20,
  label = 'Drag & drop files here, or click to browse',
  sublabel = '100% Offline • 100% Secure',
  files,
  onFilesChange,
  accentColor = '#625BFF',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const incoming = Array.from(e.dataTransfer.files);
      const combined = multiple ? [...files, ...incoming].slice(0, maxFiles) : [incoming[0]];
      onFilesChange(combined);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      const combined = multiple ? [...files, ...incoming].slice(0, maxFiles) : [incoming[0]];
      onFilesChange(combined);
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    onFilesChange(next);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
          isDragOver
            ? 'bg-indigo-50/70 border-indigo-500 scale-[1.01] dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900/60 hover:border-slate-400 dark:hover:border-slate-600'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 shadow-xs"
          style={{
            backgroundColor: `${accentColor}18`,
            color: accentColor,
          }}
        >
          <UploadCloud className="w-7 h-7" />
        </div>

        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{sublabel}</p>

        {accept && (
          <span className="mt-3 text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            Accepts: {accept}
          </span>
        )}
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>{files.length} {files.length === 1 ? 'file' : 'files'} selected</span>
            <button
              onClick={() => onFilesChange([])}
              className="text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {files.map((file, i) => (
              <div
                key={`${file.name}-${i}`}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <File className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-[11px] text-slate-400 font-mono">
                    ({formatFileSize(file.size)})
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(i);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
