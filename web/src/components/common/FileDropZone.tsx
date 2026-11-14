import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  UploadCloud,
  File as FileIcon,
  X,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  ArrowDownAZ,
  ArrowUpDown,
  Image as ImageIcon,
} from 'lucide-react';
import { useFlipList } from '../../utils/useFlipList';

interface FileDropZoneProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  label?: string;
  sublabel?: string;
  files: File[];
  onFilesChange: (files: File[]) => void;
  accentColor?: string;
  enableReorder?: boolean;
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
  enableReorder = true,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null);
  const [isListSorting, setIsListSorting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState<Record<string, string>>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const fileIdMap = useRef(new WeakMap<File, string>());
  const idCounter = useRef(0);

  const getFileId = useCallback((file: File) => {
    let id = fileIdMap.current.get(file);
    if (!id) {
      id = `file-${++idCounter.current}-${file.name}-${file.size}-${file.lastModified}`;
      fileIdMap.current.set(file, id);
    }
    return id;
  }, []);

  const { registerItem } = useFlipList(files, getFileId, {
    duration: 320,
    easing: 'cubic-bezier(0.2, 0.9, 0.3, 1)',
  });

  const triggerItemHighlight = (file: File) => {
    const key = `${file.name}-${file.size}`;
    setHighlightedKey(key);
    setTimeout(() => {
      setHighlightedKey(null);
    }, 550);
  };

  const triggerListAnimation = () => {
    setIsListSorting(true);
    setTimeout(() => {
      setIsListSorting(false);
    }, 400);
  };

  // Maintain object URLs for image thumbnails cleanly
  useEffect(() => {
    const urls: Record<string, string> = {};
    files.forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        urls[`${file.name}-${file.size}-${index}`] = URL.createObjectURL(file);
      }
    });
    setImagePreviews(urls);

    return () => {
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

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

  // Reordering: Move up or down by 1 position
  const handleMoveFile = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= files.length) return;
    const reordered = [...files];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    onFilesChange(reordered);
    triggerItemHighlight(moved);
  };

  // Natural alphabetical sorting (e.g. img1, img2, img10)
  const handleSortAlphabetical = () => {
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    onFilesChange(sorted);
    triggerListAnimation();
  };

  // Reverse file order
  const handleReverseOrder = () => {
    const reversed = [...files].reverse();
    onFilesChange(reversed);
    triggerListAnimation();
  };

  // Drag and Drop within the file list
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', String(index));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleItemDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverIndex(null);
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...files];
    const [moved] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onFilesChange(reordered);
    triggerItemHighlight(moved);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isReorderActive = enableReorder && multiple && files.length > 1;

  return (
    <div className="space-y-3">
      {/* Upload Drop Zone Box */}
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

      {/* Selected Files Sequence & Management */}
      {files.length > 0 && (
        <div className="space-y-2">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs px-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {files.length} {files.length === 1 ? 'file' : 'files'} selected
              </span>
              {isReorderActive && (
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  • Drag or use arrows to change sequence
                </span>
              )}
            </div>

            {/* Reorder / Clean Action Helpers */}
            <div className="flex items-center gap-2.5">
              {isReorderActive && (
                <>
                  <button
                    type="button"
                    onClick={handleSortAlphabetical}
                    className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Sort files alphabetically (A to Z)"
                  >
                    <ArrowDownAZ className="w-3 h-3" />
                    <span>Sort A-Z</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReverseOrder}
                    className="text-[11px] font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reverse current sequence"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>Reverse</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => onFilesChange([])}
                className="text-[11px] text-rose-500 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 font-medium cursor-pointer"
              >
                Clear all
              </button>
            </div>
          </div>

          {/* Reorderable File Pill List */}
          <div
            className={`max-h-56 overflow-y-auto space-y-1.5 pr-1 transition-opacity duration-300 ${
              isListSorting ? 'opacity-70' : 'opacity-100'
            }`}
          >
            {files.map((file, i) => {
              const fileId = getFileId(file);
              const previewKey = `${file.name}-${file.size}-${i}`;
              const previewUrl = imagePreviews[previewKey];
              const isItemDragged = draggedIndex === i;
              const isTargetDrop = dragOverIndex === i;
              const isHighlighted = highlightedKey === `${file.name}-${file.size}`;

              return (
                <div
                  key={fileId}
                  ref={registerItem(fileId)}
                  draggable={isReorderActive}
                  onDragStart={(e) => handleItemDragStart(e, i)}
                  onDragOver={(e) => handleItemDragOver(e, i)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, i)}
                  onDragEnd={handleItemDragEnd}
                  className={`relative flex items-center justify-between p-2 sm:p-2.5 rounded-xl border text-xs shadow-xs transition-[background-color,border-color,opacity,box-shadow] duration-200 ${
                    isItemDragged
                      ? 'opacity-30 scale-95 -rotate-1 border-dashed border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/20'
                      : isTargetDrop
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 ring-2 ring-indigo-500/40 translate-y-0.5'
                      : isHighlighted
                      ? 'animate-reorder-highlight border-indigo-500 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-900/40 ring-2 ring-indigo-500/60'
                      : 'bg-slate-50 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Drop landing indicator bar when dragging over */}
                  {isTargetDrop && (
                    <div className="absolute -top-1 left-3 right-3 h-0.5 bg-indigo-500 rounded-full animate-drop-indicator shadow-sm pointer-events-none" />
                  )}

                  {/* Left: Drag Handle, Sequence Number, Preview/Icon & Details */}
                  <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-2">
                    {isReorderActive && (
                      <span
                        className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 shrink-0 select-none p-0.5 transition-transform active:scale-110"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </span>
                    )}

                    {/* Sequence Badge with animated scale on highlight */}
                    <span
                      className={`w-5 h-5 rounded-md text-[10px] font-bold font-mono flex items-center justify-center shrink-0 shadow-2xs transition-all duration-300 ${
                        isHighlighted
                          ? 'bg-indigo-600 text-white scale-110 shadow-sm'
                          : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      #{i + 1}
                    </span>

                    {/* Thumbnail if image, else File icon */}
                    {previewUrl ? (
                      <div className="w-7 h-7 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center">
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <FileIcon className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                    )}

                    {/* File Name & Size */}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-700 dark:text-slate-200">
                        {file.name}
                      </p>
                      <p className="shrink-0 text-[10px] text-slate-400 dark:text-slate-400 font-mono">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  {/* Right: Sequence Arrows & Remove Button */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isReorderActive && (
                      <div className="flex items-center gap-0.5 mr-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-0.5 border border-slate-200/60 dark:border-slate-700/60">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveFile(i, 'up');
                          }}
                          disabled={i === 0}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Move up (earlier in sequence)"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveFile(i, 'down');
                          }}
                          disabled={i === files.length - 1}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                          title="Move down (later in sequence)"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(i);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
