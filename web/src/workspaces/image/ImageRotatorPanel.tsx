import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  FileArchive,
  Sparkles,
  Check,
  Maximize2,
  Compass,
  Sliders,
  Palette,
  RefreshCw,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface RotatedItem {
  id: string;
  file: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  // Transformation state
  rotation: number; // in degrees, e.g. 0, 90, 180, 270 or arbitrary -180 to 180
  flipH: boolean;
  flipV: boolean;
  bgFill: 'transparent' | '#FFFFFF' | '#000000';
  // Result
  resultBlob: Blob | null;
  resultUrl: string | null;
  resultSize: number;
  resultWidth: number;
  resultHeight: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
  outputName: string;
}

interface ImageRotatorPanelProps {
  accentColor?: string;
}

export const ImageRotatorPanel: React.FC<ImageRotatorPanelProps> = ({
  accentColor = '#10B981',
}) => {
  const [items, setItems] = useState<RotatedItem[]>([]);
  const [activeInspectIndex, setActiveInspectIndex] = useState<number>(0);

  // Global settings
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(92);
  const [straightenAngle, setStraightenAngle] = useState<number>(0); // -45° to +45° fine angle
  const [globalBgFill, setGlobalBgFill] = useState<'transparent' | '#FFFFFF' | '#000000'>('transparent');

  const activeItem = items[activeInspectIndex] || null;

  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const loadImageInfo = (file: File): Promise<{ width: number; height: number; url: string }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          url,
        });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600, url });
      };
      img.src = url;
    });
  };

  const handleFilesAdded = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const loadedItems: RotatedItem[] = [];
    for (const f of newFiles) {
      const info = await loadImageInfo(f);
      const baseName = f.name.replace(/\.[^/.]+$/, '');
      loadedItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        originalSize: f.size,
        originalWidth: info.width,
        originalHeight: info.height,
        originalUrl: info.url,
        rotation: 0,
        flipH: false,
        flipV: false,
        bgFill: 'transparent',
        resultBlob: null,
        resultUrl: null,
        resultSize: 0,
        resultWidth: info.width,
        resultHeight: info.height,
        status: 'pending',
        outputName: `${baseName}_oriented.png`,
      });
    }

    setItems((prev) => [...prev, ...loadedItems]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target?.resultUrl) URL.revokeObjectURL(target.resultUrl);
      const next = prev.filter((_, i) => i !== index);
      if (activeInspectIndex >= next.length) {
        setActiveInspectIndex(Math.max(0, next.length - 1));
      }
      return next;
    });
  };

  const handleClearAll = () => {
    items.forEach((item) => {
      if (item.originalUrl) URL.revokeObjectURL(item.originalUrl);
      if (item.resultUrl) URL.revokeObjectURL(item.resultUrl);
    });
    setItems([]);
    setActiveInspectIndex(0);
    setStraightenAngle(0);
  };

  const updateActiveItem = (updater: (item: RotatedItem) => RotatedItem) => {
    setItems((prev) => {
      if (!prev[activeInspectIndex]) return prev;
      const copy = [...prev];
      copy[activeInspectIndex] = updater(copy[activeInspectIndex]);
      return copy;
    });
  };

  // Quick rotations on active item
  const handleRotateActive = (degrees: number) => {
    if (!activeItem) return;
    updateActiveItem((item) => {
      const newAngle = (item.rotation + degrees) % 360;
      return {
        ...item,
        rotation: newAngle,
        status: 'pending',
        resultBlob: null,
        resultUrl: null,
      };
    });
  };

  // Rotate all items in batch
  const handleRotateAll = (degrees: number) => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        rotation: (item.rotation + degrees) % 360,
        status: 'pending',
        resultBlob: null,
        resultUrl: null,
      }))
    );
  };

  // Flip active item
  const handleFlipActive = (axis: 'h' | 'v') => {
    if (!activeItem) return;
    updateActiveItem((item) => ({
      ...item,
      flipH: axis === 'h' ? !item.flipH : item.flipH,
      flipV: axis === 'v' ? !item.flipV : item.flipV,
      status: 'pending',
      resultBlob: null,
      resultUrl: null,
    }));
  };

  // Flip all items in batch
  const handleFlipAll = (axis: 'h' | 'v') => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        flipH: axis === 'h' ? !item.flipH : item.flipH,
        flipV: axis === 'v' ? !item.flipV : item.flipV,
        status: 'pending',
        resultBlob: null,
        resultUrl: null,
      }))
    );
  };

  // Reset orientation on active
  const handleResetActive = () => {
    if (!activeItem) return;
    updateActiveItem((item) => ({
      ...item,
      rotation: 0,
      flipH: false,
      flipV: false,
      status: 'pending',
      resultBlob: null,
      resultUrl: null,
    }));
    setStraightenAngle(0);
  };

  // Core execution: rotates with bounding box calculation
  const executeRotate = async (
    item: RotatedItem,
    customAngle: number = 0
  ): Promise<{
    blob: Blob;
    url: string;
    width: number;
    height: number;
    size: number;
  }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const totalAngle = item.rotation + customAngle;
          const rad = (totalAngle * Math.PI) / 180;
          const origW = img.naturalWidth;
          const origH = img.naturalHeight;

          // Compute exact bounding box for any arbitrary angle
          const sin = Math.abs(Math.sin(rad));
          const cos = Math.abs(Math.cos(rad));
          const boundW = Math.round(origW * cos + origH * sin);
          const boundH = Math.round(origW * sin + origH * cos);

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(1, boundW);
          canvas.height = Math.max(1, boundH);
          const ctx = canvas.getContext('2d')!;

          // Background fill if any
          const effectiveBg =
            outputFormat === 'jpeg' && globalBgFill === 'transparent'
              ? '#FFFFFF'
              : globalBgFill;

          if (effectiveBg !== 'transparent') {
            ctx.fillStyle = effectiveBg;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Transform and draw
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(rad);
          ctx.scale(item.flipH ? -1 : 1, item.flipV ? -1 : 1);
          ctx.drawImage(img, -origW / 2, -origH / 2);
          ctx.restore();

          const mimeType =
            outputFormat === 'png'
              ? 'image/png'
              : outputFormat === 'webp'
              ? 'image/webp'
              : 'image/jpeg';

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create rotated blob'));
                return;
              }
              const blobUrl = URL.createObjectURL(blob);
              resolve({
                blob,
                url: blobUrl,
                width: canvas.width,
                height: canvas.height,
                size: blob.size,
              });
            },
            mimeType,
            quality / 100
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Could not load source image'));
      img.src = item.originalUrl;
    });
  };

  // Process single active item
  const handleProcessActive = async () => {
    if (!activeItem) return;

    setItems((prev) => {
      const copy = [...prev];
      copy[activeInspectIndex] = { ...copy[activeInspectIndex], status: 'processing' };
      return copy;
    });

    try {
      const res = await executeRotate(activeItem, straightenAngle);
      const baseName = activeItem.file.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_rotated_${activeItem.rotation}deg.${outputFormat}`;

      setItems((prev) => {
        const copy = [...prev];
        copy[activeInspectIndex] = {
          ...copy[activeInspectIndex],
          status: 'done',
          resultBlob: res.blob,
          resultUrl: res.url,
          resultWidth: res.width,
          resultHeight: res.height,
          resultSize: res.size,
          outputName: outName,
        };
        return copy;
      });

      confetti({ particleCount: 35, spread: 50, origin: { y: 0.85 } });
    } catch (err: any) {
      setItems((prev) => {
        const copy = [...prev];
        copy[activeInspectIndex] = {
          ...copy[activeInspectIndex],
          status: 'error',
          error: err.message || 'Rotation failed',
        };
        return copy;
      });
    }
  };

  // Process all items in batch
  const handleProcessAll = async () => {
    if (items.length === 0) return;

    for (let i = 0; i < items.length; i++) {
      const cur = items[i];
      setItems((prev) => {
        const copy = [...prev];
        copy[i] = { ...copy[i], status: 'processing' };
        return copy;
      });

      try {
        const res = await executeRotate(cur, i === activeInspectIndex ? straightenAngle : 0);
        const baseName = cur.file.name.replace(/\.[^/.]+$/, '');
        const outName = `${baseName}_rotated_${cur.rotation}deg.${outputFormat}`;

        setItems((prev) => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: 'done',
            resultBlob: res.blob,
            resultUrl: res.url,
            resultWidth: res.width,
            resultHeight: res.height,
            resultSize: res.size,
            outputName: outName,
          };
          return copy;
        });
      } catch (err: any) {
        setItems((prev) => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: 'error',
            error: err.message || 'Failed',
          };
          return copy;
        });
      }
    }

    confetti({ particleCount: 75, spread: 70, origin: { y: 0.8 } });
  };

  const handleDownloadSingle = (item: RotatedItem) => {
    if (!item.resultUrl) return;
    const a = document.createElement('a');
    a.href = item.resultUrl;
    a.download = item.outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.resultBlob);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    doneItems.forEach((item) => {
      zip.file(item.outputName, item.resultBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum_rotated_batch_${doneItems.length}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedCount = items.filter((i) => i.status === 'done').length;
  const currentTotalAngle = activeItem ? (activeItem.rotation + straightenAngle) % 360 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upload Zone when empty */}
      {items.length === 0 && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="image/*"
            multiple={true}
            label="Select or drop images to rotate and flip"
            sublabel="Supports JPG, PNG, WebP, AVIF • Exact degree straightener • 100% Offline"
            files={[]}
            onFilesChange={handleFilesAdded}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Main Workspace */}
      {items.length > 0 && activeItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: Live Canvas Viewport & Batch Thumbnails */}
          <div className="lg:col-span-7 space-y-4">
            {/* Batch Thumbnail Selector if multiple images */}
            {items.length > 1 && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 overflow-hidden shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                  {items.map((it, idx) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => {
                        setActiveInspectIndex(idx);
                        setStraightenAngle(0);
                      }}
                      className={`relative flex-shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                        idx === activeInspectIndex
                          ? 'border-emerald-500 shadow-sm scale-105'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={it.originalUrl}
                        alt={`Thumb ${idx + 1}`}
                        style={{
                          transform: `rotate(${it.rotation}deg) scaleX(${it.flipH ? -1 : 1}) scaleY(${
                            it.flipV ? -1 : 1
                          })`,
                        }}
                        className="w-full h-full object-cover transition-transform duration-200"
                      />
                      {it.status === 'done' && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor="add-more-rotate-files"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                    <input
                      id="add-more-rotate-files"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleFilesAdded(Array.from(e.target.files));
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Remove all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* LIVE ROTATION CANVAS PREVIEW */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white px-1">
                <span className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>Interactive Orientation Viewport</span>
                </span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">
                  {currentTotalAngle}° &bull; {activeItem.flipH ? 'H-Flipped' : ''}{' '}
                  {activeItem.flipV ? 'V-Flipped' : ''}
                </span>
              </div>

              <div
                className="relative flex items-center justify-center p-6 rounded-xl bg-slate-950/90 overflow-hidden select-none min-h-[380px]"
                style={{
                  backgroundImage:
                    'radial-gradient(#334155 1px, transparent 1px), radial-gradient(#334155 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              >
                <img
                  src={activeItem.originalUrl}
                  alt="Rotated preview"
                  style={{
                    transform: `rotate(${currentTotalAngle}deg) scaleX(${
                      activeItem.flipH ? -1 : 1
                    }) scaleY(${activeItem.flipV ? -1 : 1})`,
                    transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className="max-h-[440px] max-w-full object-contain rounded-lg shadow-2xl block select-none pointer-events-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span>
                  Source: {activeItem.originalWidth} × {activeItem.originalHeight} px
                </span>
                <span>
                  Target Canvas:{' '}
                  {activeItem.rotation % 180 !== 0
                    ? `${activeItem.originalHeight} × ${activeItem.originalWidth}`
                    : `${activeItem.originalWidth} × ${activeItem.originalHeight}`}{' '}
                  px
                </span>
              </div>
            </div>

            {/* COMPLETED RESULT CARD */}
            {activeItem.status === 'done' && activeItem.resultUrl && (
              <div className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Rotated Image Ready
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeItem.resultWidth} × {activeItem.resultHeight} px &bull;{' '}
                        {formatBytes(activeItem.resultSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(activeItem)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: Orientation Controls, Fine-Tuning Slider, Format, Action */}
          <div className="lg:col-span-5 space-y-5">
            {/* Quick 90° and Flip Action Buttons */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <RotateCw className="w-4 h-4 text-emerald-500" />
                    <span>Rotation & Flipping</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Rotate clockwise, counter-clockwise, or mirror axes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResetActive}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-semibold cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRotateActive(-90)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-500" />
                  <span>Rotate 90° CCW</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleRotateActive(90)}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-[1.02]"
                >
                  <RotateCw className="w-4 h-4 text-emerald-500" />
                  <span>Rotate 90° CW</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFlipActive('h')}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    activeItem.flipH
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4 text-emerald-500" />
                  <span>Flip Horizontal</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFlipActive('v')}
                  className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs ${
                    activeItem.flipV
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <FlipVertical className="w-4 h-4 text-emerald-500" />
                  <span>Flip Vertical</span>
                </button>
              </div>

              {/* Quick Rotation Angle Presets */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Angle Presets
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 90, 180, 270].map((deg) => (
                    <button
                      key={deg}
                      type="button"
                      onClick={() => {
                        updateActiveItem((it) => ({
                          ...it,
                          rotation: deg,
                          status: 'pending',
                          resultBlob: null,
                          resultUrl: null,
                        }));
                        setStraightenAngle(0);
                      }}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        activeItem.rotation === deg && straightenAngle === 0
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Fine Straightening Slider Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>Straighten Horizon & Angle</span>
                </h3>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {straightenAngle > 0 ? `+${straightenAngle}` : straightenAngle}°
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Fix crooked horizons with precision -45° to +45° fine angle adjustment.
              </p>

              <input
                type="range"
                min="-45"
                max="45"
                step="0.5"
                value={straightenAngle}
                onChange={(e) => setStraightenAngle(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>-45°</span>
                <button
                  type="button"
                  onClick={() => setStraightenAngle(0)}
                  className="hover:text-emerald-500 cursor-pointer underline"
                >
                  0° (Level)
                </button>
                <span>+45°</span>
              </div>
            </div>

            {/* Background Fill & Output Format Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-500" />
                <span>Format & Padding Fill</span>
              </h3>

              {/* Output Format */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'png', label: 'PNG Lossless', sub: 'Preserves Alpha' },
                    { id: 'webp', label: 'WebP Smart', sub: 'Compact & Crisp' },
                    { id: 'jpeg', label: 'JPEG Photo', sub: 'Smallest File' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setOutputFormat(fmt.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        outputFormat === fmt.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {fmt.label}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {fmt.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Background fill for rotated canvas padding */}
              {straightenAngle !== 0 && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Corner Padding Fill
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'transparent', label: 'Transparent' },
                      { id: '#FFFFFF', label: 'White' },
                      { id: '#000000', label: 'Black' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setGlobalBgFill(bg.id as any)}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          globalBgFill === bg.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleProcessActive}
                disabled={activeItem.status === 'processing'}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <RotateCw className="w-5 h-5" />
                <span>
                  {activeItem.status === 'processing'
                    ? 'Applying Orientation...'
                    : `Apply Orientation (${currentTotalAngle}°)`}
                </span>
              </button>

              {items.length > 1 && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleRotateAll(90)}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <RotateCw className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Rotate All 90°</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFlipAll('h')}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <FlipHorizontal className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Flip All H</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={handleProcessAll}
                      className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>Orient All ({items.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadAllZip}
                      disabled={completedCount === 0}
                      className="py-3 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      <FileArchive className="w-4 h-4" />
                      <span>Download ZIP ({completedCount})</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-Side Processing • Your photos never leave your device</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
