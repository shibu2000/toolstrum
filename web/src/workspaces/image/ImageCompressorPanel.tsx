import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import {
  Minimize2,
  Download,
  Check,
  RotateCcw,
  Sliders,
  Trash2,
  Plus,
  ShieldCheck,
  FileArchive,
  Eye,
  Sparkles,
  Columns2,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface CompressedItem {
  id: string;
  file: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  compressedBlob: Blob | null;
  compressedUrl: string | null;
  compressedSize: number;
  compressedWidth: number;
  compressedHeight: number;
  savingsPercent: number;
  status: 'pending' | 'compressing' | 'done' | 'error';
  error?: string;
  outputName: string;
}

interface ImageCompressorPanelProps {
  accentColor?: string;
}

export const ImageCompressorPanel: React.FC<ImageCompressorPanelProps> = ({
  accentColor = '#10B981',
}) => {
  // Batch Queue Items
  const [items, setItems] = useState<CompressedItem[]>([]);
  const [activeInspectIndex, setActiveInspectIndex] = useState<number>(0);

  // Settings
  const [compressPreset, setCompressPreset] = useState<'high' | 'balanced' | 'max' | 'custom'>('balanced');
  const [quality, setQuality] = useState<number>(0.72); // 0.1 to 1.0
  const [outputFormat, setOutputFormat] = useState<'auto_webp' | 'original' | 'jpeg' | 'png'>('auto_webp');
  const [maxDimension, setMaxDimension] = useState<number>(0); // 0 = no resize

  // Squoosh-Style Split Comparison Slider state
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100 percentage
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<'fit' | '1x' | '2x'>('fit');
  const splitContainerRef = useRef<HTMLDivElement | null>(null);

  // Global processing state
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  // Helper for size display
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Compress a single image file via HTML5 Canvas
  const processImageFile = useCallback(
    async (
      file: File,
      q: number,
      fmt: 'auto_webp' | 'original' | 'jpeg' | 'png',
      maxDim: number
    ): Promise<{
      blob: Blob;
      width: number;
      height: number;
      outputName: string;
    }> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const objUrl = URL.createObjectURL(file);
        img.src = objUrl;

        img.onload = () => {
          URL.revokeObjectURL(objUrl);
          const origW = img.naturalWidth || img.width;
          const origH = img.naturalHeight || img.height;

          // Compute dimensions
          let targetW = origW;
          let targetH = origH;
          if (maxDim > 0 && Math.max(origW, origH) > maxDim) {
            if (origW >= origH) {
              targetW = maxDim;
              targetH = Math.round((origH * maxDim) / origW);
            } else {
              targetH = maxDim;
              targetW = Math.round((origW * maxDim) / origH);
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

          // Format selection
          let targetMime: string;
          let ext: string;
          if (fmt === 'auto_webp') {
            targetMime = 'image/webp';
            ext = 'webp';
          } else if (fmt === 'jpeg') {
            targetMime = 'image/jpeg';
            ext = 'jpg';
          } else if (fmt === 'png') {
            targetMime = 'image/png';
            ext = 'png';
          } else {
            // Keep original
            if (file.type === 'image/png') {
              // Note: If user keeps PNG, WebP is used if quality < 1.0 or PNG if lossless
              targetMime = file.type;
              ext = 'png';
            } else if (file.type === 'image/webp') {
              targetMime = 'image/webp';
              ext = 'webp';
            } else {
              targetMime = 'image/jpeg';
              ext = 'jpg';
            }
          }

          // If JPEG, fill background with white in case image had transparent background
          if (targetMime === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, targetW, targetH);
          }

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const outputName = `${baseName}-compressed.${ext}`;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Compression failed to generate image blob'));
                return;
              }
              resolve({
                blob,
                width: targetW,
                height: targetH,
                outputName,
              });
            },
            targetMime,
            q
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          reject(new Error('Failed to read image file'));
        };
      });
    },
    []
  );

  // Add new files to the queue
  const handleAddFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const newItems: CompressedItem[] = await Promise.all(
      newFiles.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const originalUrl = URL.createObjectURL(file);

        // Read dimensions
        const { width, height } = await new Promise<{ width: number; height: number }>((res) => {
          const img = new Image();
          img.src = originalUrl;
          img.onload = () => res({ width: img.naturalWidth || img.width, height: img.naturalHeight || img.height });
          img.onerror = () => res({ width: 0, height: 0 });
        });

        return {
          id,
          file,
          originalSize: file.size,
          originalWidth: width,
          originalHeight: height,
          originalUrl,
          compressedBlob: null,
          compressedUrl: null,
          compressedSize: 0,
          compressedWidth: width,
          compressedHeight: height,
          savingsPercent: 0,
          status: 'pending' as const,
          outputName: `${file.name.replace(/\.[^/.]+$/, '')}-compressed.webp`,
        };
      })
    );

    setItems((prev) => [...prev, ...newItems]);
  };

  // Recompress all items whenever quality, format, or maxDimension changes
  useEffect(() => {
    if (items.length === 0) return;

    let isCancelled = false;
    setIsProcessingBatch(true);

    const recompressAll = async () => {
      const updated = await Promise.all(
        items.map(async (item) => {
          try {
            const { blob, width, height, outputName } = await processImageFile(
              item.file,
              quality,
              outputFormat,
              maxDimension
            );

            if (isCancelled) return item;

            // Revoke old blob url
            if (item.compressedUrl) {
              URL.revokeObjectURL(item.compressedUrl);
            }

            const compUrl = URL.createObjectURL(blob);
            const compSize = blob.size;
            const savings = Math.max(0, Math.round(((item.originalSize - compSize) / item.originalSize) * 100));

            return {
              ...item,
              compressedBlob: blob,
              compressedUrl: compUrl,
              compressedSize: compSize,
              compressedWidth: width,
              compressedHeight: height,
              savingsPercent: savings,
              status: 'done' as const,
              outputName,
            };
          } catch (err: any) {
            return {
              ...item,
              status: 'error' as const,
              error: err?.message || 'Error compressing image',
            };
          }
        })
      );

      if (!isCancelled) {
        setItems(updated);
        setIsProcessingBatch(false);
      }
    };

    recompressAll();

    return () => {
      isCancelled = true;
    };
  }, [items.length, quality, outputFormat, maxDimension, processImageFile]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((item) => {
        if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
        if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
      });
    };
  }, []);

  // Handle Preset Selection (TinyPNG-style presets)
  const handleApplyPreset = (preset: 'high' | 'balanced' | 'max') => {
    setCompressPreset(preset);
    if (preset === 'high') {
      setQuality(0.88);
      setOutputFormat('auto_webp');
      setMaxDimension(0);
    } else if (preset === 'balanced') {
      setQuality(0.72);
      setOutputFormat('auto_webp');
      setMaxDimension(0);
    } else if (preset === 'max') {
      setQuality(0.48);
      setOutputFormat('auto_webp');
      setMaxDimension(1920);
    }
  };

  // Remove single item from queue
  const handleRemoveItem = (index: number) => {
    const item = items[index];
    if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
    if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);

    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (activeInspectIndex >= next.length) {
        setActiveInspectIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  // Clear all items
  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.compressedUrl) URL.revokeObjectURL(item.compressedUrl);
    });
    setItems([]);
    setActiveInspectIndex(0);
  };

  // Squoosh Comparison Slider dragging logic
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDraggingSlider(true);
    updateSliderFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingSlider) return;
    updateSliderFromEvent(e);
  };

  const handlePointerUp = () => {
    setIsDraggingSlider(false);
  };

  const updateSliderFromEvent = (e: React.PointerEvent) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPos(pct);
  };

  // Batch ZIP Download (iLoveIMG-style)
  const handleDownloadZip = async () => {
    const validItems = items.filter((item) => item.compressedBlob);
    if (validItems.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      validItems.forEach((item) => {
        if (item.compressedBlob) {
          zip.file(item.outputName, item.compressedBlob);
        }
      });

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = zipUrl;
      a.download = `toolstrum-compressed-${validItems.length}-images.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  // Single file download
  const handleDownloadSingle = (item: CompressedItem) => {
    if (!item.compressedUrl) return;
    const a = document.createElement('a');
    a.href = item.compressedUrl;
    a.download = item.outputName;
    a.click();
  };

  // Summary statistics across entire batch
  const totalOriginalBytes = items.reduce((acc, it) => acc + it.originalSize, 0);
  const totalCompressedBytes = items.reduce((acc, it) => acc + (it.compressedSize || it.originalSize), 0);
  const totalBytesSaved = Math.max(0, totalOriginalBytes - totalCompressedBytes);
  const totalSavingsPercent =
    totalOriginalBytes > 0 ? Math.round((totalBytesSaved / totalOriginalBytes) * 100) : 0;

  const currentInspectItem = items[activeInspectIndex] || items[0] || null;

  return (
    <div className="space-y-6">
      {/* Tool Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Minimize2 className="w-5 h-5" />
              </span>
              <span>Image Compressor</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Compress PNG, JPG, WebP, and AVIF images up to 85% smaller without visible quality loss. Compare pixels live with Squoosh-style split view and download individually or in batch.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Client-Side Privacy</span>
          </div>
        </div>
      </div>

      {/* Step 1: Upload DropZone (Initial empty state or appending files) */}
      {items.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <FileDropZone
            accept="image/*"
            multiple={true}
            label="Drop your images here, or click to browse (supports multi-image batch)"
            files={[]}
            onFilesChange={handleAddFiles}
            accentColor={accentColor}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Multi-Image Batch</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Drop 10+ images at once. Compress all simultaneously in your browser.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Interactive Split Slider</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Drag slider to inspect original vs compressed pixels in real time.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Smart WebP &amp; ZIP</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Save up to 80% with next-gen formats. Download as a single clean ZIP.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Step 2: Main Interactive Compression Studio */
        <div className="space-y-6">
          {/* Top Batch Summary & Action Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Minimize2 className="w-5 h-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {items.length} {items.length === 1 ? 'Image' : 'Images in Queue'}
                  </h4>
                  {totalBytesSaved > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Saved {formatSize(totalBytesSaved)} ({totalSavingsPercent}%)</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Original: {formatSize(totalOriginalBytes)} → Compressed: {formatSize(totalCompressedBytes)}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Add more files button */}
              <label className="px-3.5 py-2 text-xs font-medium rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>Add More Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) handleAddFiles(Array.from(e.target.files));
                  }}
                />
              </label>

              {/* Clear queue */}
              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

              {/* Download All as ZIP */}
              {items.length > 1 && (
                <button
                  onClick={handleDownloadZip}
                  disabled={isZipping || isProcessingBatch}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <FileArchive className="w-4 h-4" />
                  <span>{isZipping ? 'Creating ZIP...' : 'Download All as ZIP'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Squoosh-Style Interactive Split Slider View */}
          {currentInspectItem && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Columns2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Live Split Comparison — {currentInspectItem.file.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">View:</span>
                  {(['fit', '1x', '2x'] as const).map((z) => (
                    <button
                      key={z}
                      onClick={() => setZoomLevel(z)}
                      className={`px-2 py-0.5 rounded-md font-semibold cursor-pointer transition-colors ${
                        zoomLevel === z
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {z === 'fit' ? 'Fit Screen' : z === '1x' ? '100% (1:1)' : '200% Zoom'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Slider Canvas Container */}
              <div
                ref={splitContainerRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                className="relative w-full h-[400px] sm:h-[480px] rounded-xl overflow-hidden select-none cursor-ew-resize bg-slate-950 flex items-center justify-center border border-slate-200 dark:border-slate-800"
              >
                {/* Background Checkered pattern for transparency */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                />

                {/* Layer 2 (Right/Background): COMPRESSED Image */}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {currentInspectItem.compressedUrl ? (
                    <img
                      src={currentInspectItem.compressedUrl}
                      alt="Compressed preview"
                      draggable={false}
                      className={`max-w-full max-h-full object-contain pointer-events-none transition-transform duration-100 ${
                        zoomLevel === '1x' ? 'scale-125' : zoomLevel === '2x' ? 'scale-200' : 'scale-100'
                      }`}
                    />
                  ) : (
                    <div className="text-xs text-slate-400">Processing compression...</div>
                  )}
                </div>

                {/* Layer 1 (Left/Clipped): ORIGINAL Image */}
                <div
                  className="absolute inset-0 overflow-hidden flex items-center justify-center"
                  style={{ width: `${sliderPos}%` }}
                >
                  <div
                    className="absolute inset-0 flex items-center justify-center p-4"
                    style={{
                      width: splitContainerRef.current?.clientWidth || '100%',
                    }}
                  >
                    <img
                      src={currentInspectItem.originalUrl}
                      alt="Original preview"
                      draggable={false}
                      className={`max-w-full max-h-full object-contain pointer-events-none transition-transform duration-100 ${
                        zoomLevel === '1x' ? 'scale-125' : zoomLevel === '2x' ? 'scale-200' : 'scale-100'
                      }`}
                    />
                  </div>
                </div>

                {/* Draggable Divider Line & Handle */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-2xl pointer-events-none z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 shadow-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold pointer-events-auto cursor-ew-resize">
                    ↔
                  </div>
                </div>

                {/* Top Overlay Badges */}
                {/* Left Badge: Original */}
                <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium z-20 pointer-events-none flex items-center gap-1.5 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>
                    Original: <strong>{formatSize(currentInspectItem.originalSize)}</strong> ({currentInspectItem.originalWidth}×{currentInspectItem.originalHeight})
                  </span>
                </div>

                {/* Right Badge: Compressed */}
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-emerald-950/85 backdrop-blur-xs text-emerald-300 text-[11px] font-medium z-20 pointer-events-none flex items-center gap-1.5 border border-emerald-500/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>
                    Compressed: <strong>{formatSize(currentInspectItem.compressedSize)}</strong>{' '}
                    <span className="text-emerald-400 font-bold">(-{currentInspectItem.savingsPercent}%)</span>
                  </span>
                </div>

                {/* Bottom hint */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-xs text-slate-300 text-[10px] z-20 pointer-events-none">
                  Drag slider ↔ to inspect original vs compressed quality
                </div>
              </div>
            </div>
          )}

          {/* Compression Settings & Controls Grid */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>Compression Tuning &amp; Preset Profiles</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Adjust compression level and target output format across your batch.
                </p>
              </div>

              {isProcessingBatch && (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Applying compression settings...</span>
                </div>
              )}
            </div>

            {/* TinyPNG-Style Preset Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleApplyPreset('high')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  compressPreset === 'high'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Best Quality</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    ~30% smaller
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Minimal compression. Pixel-perfect fidelity for photography &amp; portfolios.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('balanced')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  compressPreset === 'balanced'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Recommended / Balanced</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    ~65% smaller
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Optimal balance of crystal-clear clarity and drastic file size reduction.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleApplyPreset('max')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  compressPreset === 'max'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Smallest File</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    ~85% smaller
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  High compression + 1080p limit. Ideal for blogs, emails, and mobile websites.
                </p>
              </button>
            </div>

            {/* Granular Sliders & Format Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-3 border-t border-slate-100 dark:border-slate-800">
              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Compression Quality</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={Math.round(quality * 100)}
                  onChange={(e) => {
                    setQuality(Number(e.target.value) / 100);
                    setCompressPreset('custom');
                  }}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Small File (10%)</span>
                  <span>Lossless (100%)</span>
                </div>
              </div>

              {/* Output Format */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => {
                    setOutputFormat(e.target.value as any);
                    setCompressPreset('custom');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="auto_webp">Smart WebP (Recommended — Max Savings)</option>
                  <option value="original">Keep Original Format (JPG / PNG)</option>
                  <option value="jpeg">Convert All to JPEG</option>
                  <option value="png">Convert All to PNG</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  WebP provides up to 35% better compression than JPEG with transparency.
                </p>
              </div>

              {/* Max Dimension Limit */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Max Resolution Constraint
                </label>
                <select
                  value={maxDimension}
                  onChange={(e) => {
                    setMaxDimension(Number(e.target.value));
                    setCompressPreset('custom');
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value={0}>Original Resolution (No downscaling)</option>
                  <option value={2560}>2K QHD (Max 2560px)</option>
                  <option value={1920}>Full HD (Max 1920px)</option>
                  <option value={1280}>HD Ready (Max 1280px)</option>
                  <option value={800}>Web Thumbnail (Max 800px)</option>
                </select>
                <p className="text-[10px] text-slate-400">
                  Downscales ultra-large camera photos to save dramatic bytes.
                </p>
              </div>
            </div>
          </div>

          {/* iLoveIMG-Style Batch File List & Results Queue */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Processed Batch Queue ({items.length})
              </h4>
              <span className="text-xs text-slate-400">
                Click "Inspect" on any file to compare against original in slider above
              </span>
            </div>

            <div className="space-y-2.5">
              {items.map((item, index) => {
                const isActive = activeInspectIndex === index;

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isActive
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                    }`}
                  >
                    {/* File Thumbnail & Metadata */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <img
                          src={item.compressedUrl || item.originalUrl}
                          alt={item.file.name}
                          className="max-w-full max-h-full object-contain"
                        />
                        {item.savingsPercent > 0 && (
                          <div className="absolute bottom-0 inset-x-0 bg-emerald-600 text-white text-[9px] font-bold text-center py-0.5">
                            -{item.savingsPercent}%
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                            {item.file.name}
                          </h5>
                          {isActive && (
                            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-white text-[9px] font-bold shrink-0">
                              Viewing
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>{formatSize(item.originalSize)}</span>
                          <span>→</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {formatSize(item.compressedSize)}
                          </span>
                          <span>•</span>
                          <span>
                            {item.compressedWidth} × {item.compressedHeight} px
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {/* Inspect in split slider button */}
                      <button
                        type="button"
                        onClick={() => setActiveInspectIndex(index)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </button>

                      {/* Download Single File */}
                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        disabled={!item.compressedUrl}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Download compressed image"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      {/* Remove from queue */}
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
