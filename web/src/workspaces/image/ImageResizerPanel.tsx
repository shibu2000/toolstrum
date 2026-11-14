import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import {
  Maximize2,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  FileArchive,
  Eye,
  Sparkles,
  Link2,
  Link2Off,
  Sliders,
  Check,
  HelpCircle,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface ResizedItem {
  id: string;
  file: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  resizedBlob: Blob | null;
  resizedUrl: string | null;
  resizedSize: number;
  resizedWidth: number;
  resizedHeight: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
  outputName: string;
}

export type ResizeMode = 'pixels' | 'percentage' | 'presets';
export type FitMode = 'contain' | 'cover' | 'stretch';

export interface SocialPreset {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  aspect: string;
}

export const SOCIAL_PRESETS: SocialPreset[] = [
  { id: 'ig_sq', name: 'Instagram Square', platform: 'Instagram', width: 1080, height: 1080, aspect: '1:1' },
  { id: 'ig_story', name: 'Story / Reel / TikTok', platform: 'Social', width: 1080, height: 1920, aspect: '9:16' },
  { id: 'ig_portrait', name: 'Instagram Portrait', platform: 'Instagram', width: 1080, height: 1350, aspect: '4:5' },
  { id: 'yt_thumb', name: 'YouTube Thumbnail', platform: 'YouTube', width: 1280, height: 720, aspect: '16:9' },
  { id: 'tw_post', name: 'Twitter / X Post', platform: 'Twitter', width: 1200, height: 675, aspect: '16:9' },
  { id: 'li_banner', name: 'LinkedIn Header Banner', platform: 'LinkedIn', width: 1584, height: 396, aspect: '4:1' },
  { id: 'fb_post', name: 'Facebook Post', platform: 'Facebook', width: 1200, height: 630, aspect: '1.91:1' },
  { id: 'fhd_screen', name: 'Full HD Wallpaper / Display', platform: 'Desktop', width: 1920, height: 1080, aspect: '16:9' },
];

interface ImageResizerPanelProps {
  accentColor?: string;
}

export const ImageResizerPanel: React.FC<ImageResizerPanelProps> = ({
  accentColor = '#10B981',
}) => {
  // Batch Queue Items
  const [items, setItems] = useState<ResizedItem[]>([]);
  const [activeInspectIndex, setActiveInspectIndex] = useState<number>(0);

  // Resize Settings
  const [mode, setMode] = useState<ResizeMode>('pixels');
  const [targetWidth, setTargetWidth] = useState<number>(1080);
  const [targetHeight, setTargetHeight] = useState<number>(1080);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [percentScale, setPercentScale] = useState<number>(50); // 10% to 300%
  const [selectedPresetId, setSelectedPresetId] = useState<string>('ig_sq');
  const [fitMode, setFitMode] = useState<FitMode>('contain');
  const [dontEnlarge, setDontEnlarge] = useState<boolean>(false);

  // Output Format & Quality
  const [outputFormat, setOutputFormat] = useState<'original' | 'auto_webp' | 'jpeg' | 'png'>('original');
  const [quality, setQuality] = useState<number>(0.92);

  // Status
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Perform canvas resize calculation for a single image
  const resizeSingleImage = useCallback(
    async (
      file: File,
      calcDimensions: (origW: number, origH: number) => { w: number; h: number },
      fit: FitMode,
      fmt: 'original' | 'auto_webp' | 'jpeg' | 'png',
      q: number
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

          const { w: destW, h: destH } = calcDimensions(origW, origH);

          const canvas = document.createElement('canvas');
          canvas.width = destW;
          canvas.height = destH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context unavailable'));
            return;
          }

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
              targetMime = 'image/png';
              ext = 'png';
            } else if (file.type === 'image/webp') {
              targetMime = 'image/webp';
              ext = 'webp';
            } else {
              targetMime = 'image/jpeg';
              ext = 'jpg';
            }
          }

          if (targetMime === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, destW, destH);
          }

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';

          if (fit === 'stretch') {
            ctx.drawImage(img, 0, 0, destW, destH);
          } else if (fit === 'cover') {
            // Center crop to fill target dimensions
            const scale = Math.max(destW / origW, destH / origH);
            const sw = destW / scale;
            const sh = destH / scale;
            const sx = (origW - sw) / 2;
            const sy = (origH - sh) / 2;
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, destW, destH);
          } else {
            // Contain: Fit within bounds, centering image
            const scale = Math.min(destW / origW, destH / origH);
            const dw = origW * scale;
            const dh = origH * scale;
            const dx = (destW - dw) / 2;
            const dy = (destH - dh) / 2;
            ctx.drawImage(img, 0, 0, origW, origH, dx, dy, dw, dh);
          }

          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const outputName = `${baseName}_${destW}x${destH}.${ext}`;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Resize failed to generate blob'));
                return;
              }
              resolve({
                blob,
                width: destW,
                height: destH,
                outputName,
              });
            },
            targetMime,
            q
          );
        };

        img.onerror = () => {
          URL.revokeObjectURL(objUrl);
          reject(new Error('Failed to load image for resizing'));
        };
      });
    },
    []
  );

  // Add new files to the queue
  const handleAddFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const newItems: ResizedItem[] = await Promise.all(
      newFiles.map(async (file) => {
        const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        const originalUrl = URL.createObjectURL(file);

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
          resizedBlob: null,
          resizedUrl: null,
          resizedSize: 0,
          resizedWidth: width,
          resizedHeight: height,
          status: 'pending' as const,
          outputName: `${file.name.replace(/\.[^/.]+$/, '')}_resized.jpg`,
        };
      })
    );

    // If first item added, initialize target dimensions based on it
    if (items.length === 0 && newItems.length > 0) {
      const first = newItems[0];
      setTargetWidth(first.originalWidth);
      setTargetHeight(first.originalHeight);
    }

    setItems((prev) => [...prev, ...newItems]);
  };

  // Re-run resizing across the entire batch when settings change
  useEffect(() => {
    if (items.length === 0) return;

    let isCancelled = false;
    setIsProcessingBatch(true);

    const calcDimensionFunc = (origW: number, origH: number): { w: number; h: number } => {
      let finalW = origW;
      let finalH = origH;

      if (mode === 'percentage') {
        const scale = Math.max(0.05, percentScale / 100);
        finalW = Math.max(1, Math.round(origW * scale));
        finalH = Math.max(1, Math.round(origH * scale));
      } else if (mode === 'presets') {
        const preset = SOCIAL_PRESETS.find((p) => p.id === selectedPresetId);
        if (preset) {
          finalW = preset.width;
          finalH = preset.height;
        }
      } else {
        // By Pixels
        finalW = targetWidth;
        finalH = targetHeight;
        if (lockAspect && origW > 0 && origH > 0) {
          finalH = Math.round((finalW * origH) / origW);
        }
      }

      // Do not enlarge if smaller
      if (dontEnlarge && (finalW > origW || finalH > origH)) {
        finalW = Math.min(finalW, origW);
        finalH = Math.min(finalH, origH);
      }

      return { w: finalW, h: finalH };
    };

    const runBatchResize = async () => {
      const updated = await Promise.all(
        items.map(async (item) => {
          try {
            const { blob, width, height, outputName } = await resizeSingleImage(
              item.file,
              calcDimensionFunc,
              fitMode,
              outputFormat,
              quality
            );

            if (isCancelled) return item;

            if (item.resizedUrl) URL.revokeObjectURL(item.resizedUrl);

            return {
              ...item,
              resizedBlob: blob,
              resizedUrl: URL.createObjectURL(blob),
              resizedSize: blob.size,
              resizedWidth: width,
              resizedHeight: height,
              status: 'done' as const,
              outputName,
            };
          } catch (err: any) {
            return {
              ...item,
              status: 'error' as const,
              error: err?.message || 'Resize failed',
            };
          }
        })
      );

      if (!isCancelled) {
        setItems(updated);
        setIsProcessingBatch(false);
      }
    };

    runBatchResize();

    return () => {
      isCancelled = true;
    };
  }, [
    items.length,
    mode,
    targetWidth,
    targetHeight,
    lockAspect,
    percentScale,
    selectedPresetId,
    fitMode,
    dontEnlarge,
    outputFormat,
    quality,
    resizeSingleImage,
  ]);

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      items.forEach((it) => {
        if (it.originalUrl) URL.revokeObjectURL(it.originalUrl);
        if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);
      });
    };
  }, []);

  // Width change with aspect lock
  const handleWidthChange = (val: number) => {
    const w = Math.max(1, val);
    setTargetWidth(w);
    const inspectItem = items[activeInspectIndex] || items[0];
    if (lockAspect && inspectItem && inspectItem.originalWidth > 0) {
      const aspect = inspectItem.originalHeight / inspectItem.originalWidth;
      setTargetHeight(Math.round(w * aspect));
    }
  };

  // Height change with aspect lock
  const handleHeightChange = (val: number) => {
    const h = Math.max(1, val);
    setTargetHeight(h);
    const inspectItem = items[activeInspectIndex] || items[0];
    if (lockAspect && inspectItem && inspectItem.originalHeight > 0) {
      const aspect = inspectItem.originalWidth / inspectItem.originalHeight;
      setTargetWidth(Math.round(h * aspect));
    }
  };

  // Preset click
  const handleApplyPreset = (preset: SocialPreset) => {
    setSelectedPresetId(preset.id);
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setMode('presets');
  };

  // Batch ZIP download
  const handleDownloadZip = async () => {
    const valid = items.filter((it) => it.resizedBlob);
    if (valid.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      valid.forEach((it) => {
        if (it.resizedBlob) zip.file(it.outputName, it.resizedBlob);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `toolstrum-resized-${valid.length}-images.zip`;
      a.click();
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (e) {
      console.error('ZIP failed', e);
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingle = (item: ResizedItem) => {
    if (!item.resizedUrl) return;
    const a = document.createElement('a');
    a.href = item.resizedUrl;
    a.download = item.outputName;
    a.click();
  };

  const handleRemoveItem = (index: number) => {
    const it = items[index];
    if (it.originalUrl) URL.revokeObjectURL(it.originalUrl);
    if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);

    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (activeInspectIndex >= next.length) {
        setActiveInspectIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleClearAll = () => {
    items.forEach((it) => {
      if (it.originalUrl) URL.revokeObjectURL(it.originalUrl);
      if (it.resizedUrl) URL.revokeObjectURL(it.resizedUrl);
    });
    setItems([]);
    setActiveInspectIndex(0);
  };

  const currentInspectItem = items[activeInspectIndex] || items[0] || null;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Maximize2 className="w-5 h-5" />
              </span>
              <span>Image Resizer</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Resize single or batch images by exact pixels, percentage scaling, or one-click social media presets (Instagram, YouTube, TikTok, LinkedIn). 100% offline in your browser.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 px-3 py-1.5 rounded-xl w-fit">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>100% Private &amp; Offline</span>
          </div>
        </div>
      </div>

      {/* Upload Zone (Empty state) */}
      {items.length === 0 ? (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <FileDropZone
            accept="image/*"
            multiple={true}
            label="Drop your images here to resize, or click to browse (supports multi-image batch)"
            files={[]}
            onFilesChange={handleAddFiles}
            accentColor={accentColor}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Exact Pixels &amp; Aspect Lock</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Type exact dimensions with instant automatic proportion locking.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Social Media Presets</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                One-click standard sizes for Instagram, YouTube, TikTok, X, and LinkedIn.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <div className="w-8 h-8 mx-auto mb-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Batch Processing &amp; ZIP</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Resize 20+ photos simultaneously and download all as a single ZIP.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Active Resizer Workspace */
        <div className="space-y-6">
          {/* Top Batch Summary Bar */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Maximize2 className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {items.length} {items.length === 1 ? 'Image' : 'Images in Batch'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Target size:{' '}
                  <strong className="text-emerald-600 dark:text-emerald-400">
                    {mode === 'percentage'
                      ? `${percentScale}% scaling`
                      : `${targetWidth} × ${targetHeight} px`}
                  </strong>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

              <button
                onClick={handleClearAll}
                className="px-3 py-2 text-xs font-medium rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>

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

          {/* Configuration Card with Tabs */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* Mode Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit">
              <button
                type="button"
                onClick={() => setMode('pixels')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'pixels'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                By Exact Pixels
              </button>

              <button
                type="button"
                onClick={() => setMode('percentage')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'percentage'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                By Percentage
              </button>

              <button
                type="button"
                onClick={() => setMode('presets')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  mode === 'presets'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Social Media Presets
              </button>
            </div>

            {/* TAB 1: EXACT PIXELS */}
            {mode === 'pixels' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Target Width (pixels)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Target Height (pixels)
                      </label>
                      <button
                        type="button"
                        onClick={() => setLockAspect(!lockAspect)}
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer ${
                          lockAspect
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {lockAspect ? <Link2 className="w-3.5 h-3.5" /> : <Link2Off className="w-3.5 h-3.5" />}
                        <span>{lockAspect ? 'Aspect Locked' : 'Aspect Unlocked'}</span>
                      </button>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="10000"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dontEnlarge}
                      onChange={(e) => setDontEnlarge(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span>Do not enlarge if smaller than target resolution</span>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 2: BY PERCENTAGE */}
            {mode === 'percentage' && (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[25, 50, 75, 100, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setPercentScale(pct)}
                      className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        percentScale === pct
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700 dark:text-slate-300">Custom Scale Ratio</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {percentScale}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="300"
                    step="5"
                    value={percentScale}
                    onChange={(e) => setPercentScale(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>10% (Micro)</span>
                    <span>100% (Original)</span>
                    <span>300% (3x Magnified)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SOCIAL MEDIA PRESETS */}
            {mode === 'presets' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {SOCIAL_PRESETS.map((p) => {
                  const isSel = selectedPresetId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSel
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {p.platform}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                          {p.name}
                        </h5>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                        <span>
                          {p.width} × {p.height}
                        </span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{p.aspect}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Common Fit & Format Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
              {/* Fit Mode */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Fit &amp; Crop Handling
                </label>
                <select
                  value={fitMode}
                  onChange={(e) => setFitMode(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="contain">Contain (Fit inside bounds, no cropping)</option>
                  <option value="cover">Cover (Fill exact dimensions, center crop)</option>
                  <option value="stretch">Stretch (Force exact dimensions)</option>
                </select>
              </div>

              {/* Format selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Output Format
                </label>
                <select
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="original">Keep Original Format</option>
                  <option value="auto_webp">Smart WebP (Recommended)</option>
                  <option value="jpeg">Convert to JPEG</option>
                  <option value="png">Convert to PNG</option>
                </select>
              </div>

              {/* Quality */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span className="text-slate-700 dark:text-slate-300">Output Quality</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round(quality * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="1"
                  value={Math.round(quality * 100)}
                  onChange={(e) => setQuality(Number(e.target.value) / 100)}
                  className="w-full accent-emerald-500 cursor-pointer mt-2"
                />
              </div>
            </div>
          </div>

          {/* Single Inspect Preview Canvas */}
          {currentInspectItem && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <span>
                    Preview: {currentInspectItem.file.name} (Resized to {currentInspectItem.resizedWidth} × {currentInspectItem.resizedHeight} px)
                  </span>
                </h4>
                <button
                  type="button"
                  onClick={() => handleDownloadSingle(currentInspectItem)}
                  disabled={!currentInspectItem.resizedUrl}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download This Image</span>
                </button>
              </div>

              <div className="w-full h-80 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-4 relative border border-slate-200 dark:border-slate-800">
                {currentInspectItem.resizedUrl ? (
                  <img
                    src={currentInspectItem.resizedUrl}
                    alt="Resized output"
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-xs text-slate-400">Resizing image...</div>
                )}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-lg bg-black/75 backdrop-blur-xs text-white text-[11px] font-mono border border-white/10">
                  {currentInspectItem.resizedWidth} × {currentInspectItem.resizedHeight} px • {formatSize(currentInspectItem.resizedSize)}
                </div>
              </div>
            </div>
          )}

          {/* Batch Files Queue */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Batch Queue ({items.length})
            </h4>

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
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                        <img
                          src={item.resizedUrl || item.originalUrl}
                          alt={item.file.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="min-w-0">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                          {item.file.name}
                        </h5>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>
                            {item.originalWidth}×{item.originalHeight} ({formatSize(item.originalSize)})
                          </span>
                          <span>→</span>
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {item.resizedWidth}×{item.resizedHeight} ({formatSize(item.resizedSize)})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
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
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        disabled={!item.resizedUrl}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950 text-slate-700 hover:text-emerald-600 dark:text-slate-300 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Download resized image"
                      >
                        <Download className="w-4 h-4" />
                      </button>

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
