import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import {
  RefreshCw,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  FileArchive,
  Sparkles,
  Check,
  Layers,
  ArrowRight,
  Palette,
  Sliders,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export type TargetFormat = 'webp' | 'jpeg' | 'png' | 'bmp' | 'ico';

export interface FormatOption {
  id: TargetFormat;
  mime: string;
  ext: string;
  label: string;
  badge: string;
  description: string;
  supportsAlpha: boolean;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  {
    id: 'webp',
    mime: 'image/webp',
    ext: 'webp',
    label: 'WebP',
    badge: 'Recommended',
    description: '30%+ smaller than JPEG with transparency support',
    supportsAlpha: true,
  },
  {
    id: 'jpeg',
    mime: 'image/jpeg',
    ext: 'jpg',
    label: 'JPG / JPEG',
    badge: 'Universal',
    description: 'Standard photographic format compatible everywhere',
    supportsAlpha: false,
  },
  {
    id: 'png',
    mime: 'image/png',
    ext: 'png',
    label: 'PNG',
    badge: 'Lossless',
    description: 'Crisp graphics, logos & full alpha transparency',
    supportsAlpha: true,
  },
  {
    id: 'bmp',
    mime: 'image/bmp',
    ext: 'bmp',
    label: 'BMP',
    badge: 'Raw Bitmap',
    description: 'Uncompressed raster bitmap format for legacy systems',
    supportsAlpha: false,
  },
  {
    id: 'ico',
    mime: 'image/x-icon',
    ext: 'ico',
    label: 'ICO (Favicon)',
    badge: 'Icon Format',
    description: 'Standard website favicon and app desktop icon',
    supportsAlpha: true,
  },
];

export interface ConversionItem {
  id: string;
  file: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalFormat: string;
  originalUrl: string;
  targetFormat: TargetFormat;
  // Converted result
  convertedBlob: Blob | null;
  convertedUrl: string | null;
  convertedSize: number;
  convertedWidth: number;
  convertedHeight: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
  outputName: string;
}

interface ImageConverterPanelProps {
  accentColor?: string;
  initialFormat?: TargetFormat;
}

export const ImageConverterPanel: React.FC<ImageConverterPanelProps> = ({
  accentColor = '#10B981',
  initialFormat = 'webp',
}) => {
  const [items, setItems] = useState<ConversionItem[]>([]);
  const [activeInspectIndex, setActiveInspectIndex] = useState<number>(0);

  // Global settings
  const [globalTargetFormat, setGlobalTargetFormat] = useState<TargetFormat>(initialFormat);
  const [quality, setQuality] = useState<number>(90); // 60% to 100%
  const [matteBgColor, setMatteBgColor] = useState<'#FFFFFF' | '#000000' | '#F8FAFC'>('#FFFFFF');
  const [resizeConstraint, setResizeConstraint] = useState<'original' | 'fhd' | 'hd' | 'icon'>('original');

  const activeItem = items[activeInspectIndex] || null;

  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const getSourceFormatName = (f: File): string => {
    if (f.type) {
      return f.type.replace('image/', '').toUpperCase();
    }
    const ext = f.name.split('.').pop();
    return ext ? ext.toUpperCase() : 'IMG';
  };

  const loadImageInfo = (file: File): Promise<{ width: number; height: number; url: string }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth || 800,
          height: img.naturalHeight || 600,
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

    const loadedItems: ConversionItem[] = [];
    for (const f of newFiles) {
      const info = await loadImageInfo(f);
      const srcFmt = getSourceFormatName(f);
      const baseName = f.name.replace(/\.[^/.]+$/, '');
      const opt = FORMAT_OPTIONS.find((o) => o.id === globalTargetFormat) || FORMAT_OPTIONS[0];

      loadedItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        originalSize: f.size,
        originalWidth: info.width,
        originalHeight: info.height,
        originalFormat: srcFmt,
        originalUrl: info.url,
        targetFormat: globalTargetFormat,
        convertedBlob: null,
        convertedUrl: null,
        convertedSize: 0,
        convertedWidth: info.width,
        convertedHeight: info.height,
        status: 'pending',
        outputName: `${baseName}.${opt.ext}`,
      });
    }

    setItems((prev) => [...prev, ...loadedItems]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target?.convertedUrl) URL.revokeObjectURL(target.convertedUrl);
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
      if (item.convertedUrl) URL.revokeObjectURL(item.convertedUrl);
    });
    setItems([]);
    setActiveInspectIndex(0);
  };

  // Change global target format and update pending items
  const handleGlobalFormatChange = (fmt: TargetFormat) => {
    setGlobalTargetFormat(fmt);
    const opt = FORMAT_OPTIONS.find((o) => o.id === fmt) || FORMAT_OPTIONS[0];
    setItems((prev) =>
      prev.map((item) => {
        const baseName = item.file.name.replace(/\.[^/.]+$/, '');
        return {
          ...item,
          targetFormat: fmt,
          outputName: `${baseName}.${opt.ext}`,
          status: 'pending',
          convertedBlob: null,
          convertedUrl: null,
        };
      })
    );
  };

  // Core conversion implementation via Canvas
  const executeConversion = async (item: ConversionItem): Promise<{
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
          let targetW = img.naturalWidth;
          let targetH = img.naturalHeight;

          // Apply resize constraint if selected
          if (resizeConstraint === 'icon') {
            targetW = 64;
            targetH = 64;
          } else if (resizeConstraint === 'hd' && (targetW > 1280 || targetH > 720)) {
            const scale = Math.min(1280 / targetW, 720 / targetH);
            targetW = Math.round(targetW * scale);
            targetH = Math.round(targetH * scale);
          } else if (resizeConstraint === 'fhd' && (targetW > 1920 || targetH > 1080)) {
            const scale = Math.min(1920 / targetW, 1080 / targetH);
            targetW = Math.round(targetW * scale);
            targetH = Math.round(targetH * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d')!;

          const fmtConfig = FORMAT_OPTIONS.find((o) => o.id === item.targetFormat) || FORMAT_OPTIONS[0];

          // If converting to JPEG or BMP which don't support alpha, fill with matte background
          if (!fmtConfig.supportsAlpha) {
            ctx.fillStyle = matteBgColor;
            ctx.fillRect(0, 0, targetW, targetH);
          }

          ctx.drawImage(img, 0, 0, targetW, targetH);

          // Handle BMP or ICO conversion
          if (item.targetFormat === 'bmp') {
            // Encode 24-bit BMP header + DIB data
            const imgData = ctx.getImageData(0, 0, targetW, targetH);
            const rowSize = Math.floor((24 * targetW + 31) / 32) * 4;
            const pixelArraySize = rowSize * targetH;
            const fileSize = 54 + pixelArraySize;
            const buffer = new ArrayBuffer(fileSize);
            const view = new DataView(buffer);

            // BMP Header
            view.setUint16(0, 0x424d, false); // 'BM'
            view.setUint32(2, fileSize, true);
            view.setUint32(6, 0, true);
            view.setUint32(10, 54, true); // offset

            // DIB Header (BITMAPINFOHEADER)
            view.setUint32(14, 40, true); // header size
            view.setInt32(18, targetW, true);
            view.setInt32(22, targetH, true); // bottom-up
            view.setUint16(26, 1, true); // planes
            view.setUint16(28, 24, true); // 24 bpp
            view.setUint32(30, 0, true); // BI_RGB
            view.setUint32(34, pixelArraySize, true);
            view.setInt32(38, 2835, true); // 72 DPI
            view.setInt32(42, 2835, true);
            view.setUint32(46, 0, true);
            view.setUint32(50, 0, true);

            // Pixels: BGR order, bottom-up
            let offset = 54;
            const data = imgData.data;
            for (let y = targetH - 1; y >= 0; y--) {
              let rowStart = offset;
              for (let x = 0; x < targetW; x++) {
                const idx = (y * targetW + x) * 4;
                view.setUint8(offset++, data[idx + 2]); // B
                view.setUint8(offset++, data[idx + 1]); // G
                view.setUint8(offset++, data[idx]);     // R
              }
              while (offset < rowStart + rowSize) {
                view.setUint8(offset++, 0); // padding
              }
            }

            const blob = new Blob([buffer], { type: 'image/bmp' });
            const blobUrl = URL.createObjectURL(blob);
            resolve({
              blob,
              url: blobUrl,
              width: targetW,
              height: targetH,
              size: blob.size,
            });
            return;
          }

          if (item.targetFormat === 'ico') {
            // Encode standard 32-bit ICO header wrapping PNG payload
            canvas.toBlob(
              async (pngBlob) => {
                if (!pngBlob) {
                  reject(new Error('Failed to generate ICO data'));
                  return;
                }
                const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
                const icoHeader = new Uint8Array(6 + 16);
                const icoView = new DataView(icoHeader.buffer);

                // ICO Header
                icoView.setUint16(0, 0, true); // Reserved
                icoView.setUint16(2, 1, true); // Type: 1 = ICO
                icoView.setUint16(4, 1, true); // Count: 1 image

                // Directory Entry
                icoView.setUint8(6, targetW >= 256 ? 0 : targetW);
                icoView.setUint8(7, targetH >= 256 ? 0 : targetH);
                icoView.setUint8(8, 0); // Color palette
                icoView.setUint8(9, 0); // Reserved
                icoView.setUint16(10, 1, true); // Color planes
                icoView.setUint16(12, 32, true); // Bits per pixel
                icoView.setUint32(14, pngBytes.length, true); // Image data size
                icoView.setUint32(18, 22, true); // Offset to image data

                const combined = new Uint8Array(22 + pngBytes.length);
                combined.set(icoHeader, 0);
                combined.set(pngBytes, 22);

                const blob = new Blob([combined], { type: 'image/x-icon' });
                const blobUrl = URL.createObjectURL(blob);
                resolve({
                  blob,
                  url: blobUrl,
                  width: targetW,
                  height: targetH,
                  size: blob.size,
                });
              },
              'image/png'
            );
            return;
          }

          // WebP, JPEG, PNG
          const mime = fmtConfig.mime;
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to generate converted image'));
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
            mime,
            quality / 100
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load source image for conversion'));
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
      const res = await executeConversion(activeItem);
      const opt = FORMAT_OPTIONS.find((o) => o.id === activeItem.targetFormat) || FORMAT_OPTIONS[0];
      const baseName = activeItem.file.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_converted.${opt.ext}`;

      setItems((prev) => {
        const copy = [...prev];
        copy[activeInspectIndex] = {
          ...copy[activeInspectIndex],
          status: 'done',
          convertedBlob: res.blob,
          convertedUrl: res.url,
          convertedWidth: res.width,
          convertedHeight: res.height,
          convertedSize: res.size,
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
          error: err.message || 'Conversion failed',
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
        const res = await executeConversion(cur);
        const opt = FORMAT_OPTIONS.find((o) => o.id === cur.targetFormat) || FORMAT_OPTIONS[0];
        const baseName = cur.file.name.replace(/\.[^/.]+$/, '');
        const outName = `${baseName}.${opt.ext}`;

        setItems((prev) => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: 'done',
            convertedBlob: res.blob,
            convertedUrl: res.url,
            convertedWidth: res.width,
            convertedHeight: res.height,
            convertedSize: res.size,
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

  const handleDownloadSingle = (item: ConversionItem) => {
    if (!item.convertedUrl) return;
    const a = document.createElement('a');
    a.href = item.convertedUrl;
    a.download = item.outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.convertedBlob);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    doneItems.forEach((item) => {
      zip.file(item.outputName, item.convertedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum_converted_batch_${doneItems.length}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upload Zone when empty */}
      {items.length === 0 && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="image/*,.heic,.heif,.svg,.bmp,.ico"
            multiple={true}
            label="Select or drop images to convert format"
            sublabel="Convert between JPG, PNG, WebP, SVG, AVIF, HEIC, BMP, ICO • 100% Client-Side"
            files={[]}
            onFilesChange={handleFilesAdded}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Main Workspace */}
      {items.length > 0 && activeItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: Conversion Queue & Visual Inspection */}
          <div className="lg:col-span-7 space-y-4">
            {/* Batch Thumbnail Selector */}
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 overflow-hidden shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                {items.map((it, idx) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => setActiveInspectIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all cursor-pointer flex flex-col justify-end ${
                      idx === activeInspectIndex
                        ? 'border-emerald-500 shadow-sm scale-105'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={it.originalUrl}
                      alt={`Thumb ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="relative z-10 bg-black/75 px-1 py-0.5 text-[9px] text-white font-bold text-center">
                      {it.originalFormat} &rarr; {it.targetFormat.toUpperCase()}
                    </div>
                    {it.status === 'done' && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white z-20">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label
                  htmlFor="add-more-convert-files"
                  className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                  <input
                    id="add-more-convert-files"
                    type="file"
                    accept="image/*,.heic,.heif,.svg,.bmp,.ico"
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

            {/* PREVIEW & INSPECTION CARD */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                    {activeItem.file.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                    {formatBytes(activeItem.originalSize)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 font-bold font-mono">
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px]">
                    {activeItem.originalFormat}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px]">
                    {activeItem.targetFormat.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Viewport */}
              <div
                className="relative flex items-center justify-center p-6 rounded-xl bg-slate-950/90 overflow-hidden select-none min-h-[340px]"
                style={{
                  backgroundImage:
                    'radial-gradient(#334155 1px, transparent 1px), radial-gradient(#334155 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              >
                <img
                  src={activeItem.status === 'done' && activeItem.convertedUrl ? activeItem.convertedUrl : activeItem.originalUrl}
                  alt="Conversion preview"
                  className="max-h-[420px] max-w-full object-contain rounded-lg shadow-2xl block select-none pointer-events-none"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span>
                  Source: {activeItem.originalWidth} × {activeItem.originalHeight} px
                </span>
                <span>
                  {activeItem.status === 'done'
                    ? `Output: ${activeItem.convertedWidth} × ${activeItem.convertedHeight} px • ${formatBytes(activeItem.convertedSize)}`
                    : `Ready to convert to ${activeItem.targetFormat.toUpperCase()}`}
                </span>
              </div>
            </div>

            {/* CONVERTED RESULT CARD */}
            {activeItem.status === 'done' && activeItem.convertedUrl && (
              <div className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Conversion Complete!
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeItem.outputName} • {formatBytes(activeItem.convertedSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(activeItem)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download {activeItem.targetFormat.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: Format Chooser, Quality, Constraints, Action */}
          <div className="lg:col-span-5 space-y-5">
            {/* Target Format Selector */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-500" />
                  <span>Choose Target Format</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Select the target encoding for your images.
                </p>
              </div>

              <div className="space-y-2">
                {FORMAT_OPTIONS.map((fmt) => {
                  const isSelected = globalTargetFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => handleGlobalFormatChange(fmt.id)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-1 ring-emerald-500/40'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{fmt.label}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                            .{fmt.ext}
                          </span>
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          {fmt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {fmt.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quality & Matte Background Settings */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Conversion Settings</span>
              </h3>

              {/* Quality Slider (for WebP and JPEG) */}
              {(globalTargetFormat === 'webp' || globalTargetFormat === 'jpeg') && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>Encoding Quality</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Smallest File</span>
                    <span>High Quality</span>
                  </div>
                </div>
              )}

              {/* Matte Background Fill when converting transparent to JPEG/BMP */}
              {(globalTargetFormat === 'jpeg' || globalTargetFormat === 'bmp') && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Matte Background (Replaces Alpha Transparency)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '#FFFFFF', label: 'White' },
                      { id: '#000000', label: 'Black' },
                      { id: '#F8FAFC', label: 'Light Slate' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setMatteBgColor(bg.id as any)}
                        className={`p-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          matteBgColor === bg.id
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

              {/* Resize Constraint */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Scale / Dimension Mode
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'original', label: 'Keep Original' },
                    { id: 'fhd', label: 'Fit Full HD (1080p)' },
                    { id: 'hd', label: 'Fit HD (720p)' },
                    { id: 'icon', label: 'Favicon (64×64)' },
                  ].map((res) => (
                    <button
                      key={res.id}
                      type="button"
                      onClick={() => setResizeConstraint(res.id as any)}
                      className={`p-2 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                        resizeConstraint === res.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {res.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleProcessActive}
                disabled={activeItem.status === 'processing'}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <RefreshCw className="w-5 h-5" />
                <span>
                  {activeItem.status === 'processing'
                    ? 'Converting Format...'
                    : `Convert Image to ${globalTargetFormat.toUpperCase()}`}
                </span>
              </button>

              {items.length > 1 && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleProcessAll}
                    className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Convert All ({items.length})</span>
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
              )}
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-Side Conversion • Your images never leave your browser</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
