import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import {
  FileText,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  RotateCw,
  RotateCcw,
  Sparkles,
  ArrowUpDown,
  MoveLeft,
  MoveRight,
  Sliders,
  Check,
  Maximize2,
  Layers,
  FileArchive,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface ImageToPdfItem {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
  rotation: number; // 0, 90, 180, 270
}

export type PageSizeOption = 'fit' | 'a4' | 'letter';
export type OrientationOption = 'auto' | 'portrait' | 'landscape';
export type MarginOption = 'none' | 'small' | 'normal';
export type QualityOption = 'high' | 'medium' | 'low';

interface ImageToPdfPanelProps {
  accentColor?: string;
}

export const ImageToPdfPanel: React.FC<ImageToPdfPanelProps> = ({
  accentColor = '#10B981',
}) => {
  const [items, setItems] = useState<ImageToPdfItem[]>([]);
  const [pageSize, setPageSize] = useState<PageSizeOption>('a4');
  const [orientation, setOrientation] = useState<OrientationOption>('auto');
  const [margin, setMargin] = useState<MarginOption>('small');
  const [quality, setQuality] = useState<QualityOption>('medium');
  const [mergeMode, setMergeMode] = useState<'single' | 'separate'>('single');
  const [documentTitle, setDocumentTitle] = useState<string>('Toolstrum_Document');

  // Processing & result state
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [downloadFilename, setDownloadFilename] = useState<string>('document.pdf');

  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const loadImageMeta = (file: File): Promise<{ width: number; height: number; url: string }> => {
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

    const loaded: ImageToPdfItem[] = [];
    for (const f of newFiles) {
      const meta = await loadImageMeta(f);
      loaded.push({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        previewUrl: meta.url,
        width: meta.width,
        height: meta.height,
        size: f.size,
        rotation: 0,
      });
    }

    setItems((prev) => [...prev, ...loaded]);
    setHasProcessed(false);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => {
      const target = prev.find((it) => it.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((it) => it.id !== id);
    });
    setHasProcessed(false);
  };

  const handleRotateItem = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, rotation: (it.rotation + delta + 360) % 360 } : it
      )
    );
    setHasProcessed(false);
  };

  const handleMoveItem = (index: number, direction: 'left' | 'right') => {
    setItems((prev) => {
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    setHasProcessed(false);
  };

  const handleClearAll = () => {
    items.forEach((it) => {
      if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
    });
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setItems([]);
    setPdfBlob(null);
    setPdfUrl(null);
    setHasProcessed(false);
  };

  // Convert an image file + its rotation into clean JPEG bytes for pdf-lib
  const itemToJpegBytes = async (
    item: ImageToPdfItem,
    qualitySetting: QualityOption
  ): Promise<{ bytes: Uint8Array; width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const isFlippedOrientation = item.rotation % 180 !== 0;
          const canvasW = isFlippedOrientation ? img.naturalHeight : img.naturalWidth;
          const canvasH = isFlippedOrientation ? img.naturalWidth : img.naturalHeight;

          const canvas = document.createElement('canvas');
          canvas.width = canvasW;
          canvas.height = canvasH;
          const ctx = canvas.getContext('2d')!;

          // White background for transparency
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvasW, canvasH);

          ctx.save();
          ctx.translate(canvasW / 2, canvasH / 2);
          if (item.rotation !== 0) {
            ctx.rotate((item.rotation * Math.PI) / 180);
          }
          ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
          ctx.restore();

          const qualityNum = qualitySetting === 'low' ? 0.65 : qualitySetting === 'medium' ? 0.85 : 0.95;

          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Failed to encode JPEG bytes'));
                return;
              }
              const buf = await blob.arrayBuffer();
              resolve({
                bytes: new Uint8Array(buf),
                width: canvasW,
                height: canvasH,
              });
            },
            'image/jpeg',
            qualityNum
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for PDF conversion'));
      img.src = item.previewUrl;
    });
  };

  // Generate PDF document
  const handleGeneratePdf = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);

    try {
      if (mergeMode === 'separate') {
        // Zip archive of individual PDFs
        const zip = new JSZip();

        for (let idx = 0; idx < items.length; idx++) {
          const it = items[idx];
          const pdfDoc = await PDFDocument.create();
          pdfDoc.setTitle(`${documentTitle} - Page ${idx + 1}`);
          pdfDoc.setProducer('Toolstrum Offline Image-to-PDF Engine');

          const imgData = await itemToJpegBytes(it, quality);
          const embeddedImg = await pdfDoc.embedJpg(imgData.bytes);

          let pageWidth = imgData.width;
          let pageHeight = imgData.height;

          if (pageSize === 'a4') {
            const isLandscape =
              orientation === 'landscape' || (orientation === 'auto' && imgData.width > imgData.height);
            pageWidth = isLandscape ? 841.89 : 595.28;
            pageHeight = isLandscape ? 595.28 : 841.89;
          } else if (pageSize === 'letter') {
            const isLandscape =
              orientation === 'landscape' || (orientation === 'auto' && imgData.width > imgData.height);
            pageWidth = isLandscape ? 792 : 612;
            pageHeight = isLandscape ? 612 : 792;
          }

          const marginPt = margin === 'none' ? 0 : margin === 'small' ? 20 : 40;
          const availW = Math.max(10, pageWidth - marginPt * 2);
          const availH = Math.max(10, pageHeight - marginPt * 2);

          let drawW = imgData.width;
          let drawH = imgData.height;

          if (pageSize !== 'fit') {
            const scale = Math.min(availW / imgData.width, availH / imgData.height);
            drawW = imgData.width * scale;
            drawH = imgData.height * scale;
          } else {
            pageWidth = imgData.width + marginPt * 2;
            pageHeight = imgData.height + marginPt * 2;
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          page.drawImage(embeddedImg, {
            x: (pageWidth - drawW) / 2,
            y: (pageHeight - drawH) / 2,
            width: drawW,
            height: drawH,
          });

          const bytes = await pdfDoc.save();
          const baseName = it.file.name.replace(/\.[^/.]+$/, '');
          zip.file(`${baseName}.pdf`, bytes);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        setPdfBlob(zipBlob);
        setPdfUrl(url);
        setPdfPageCount(items.length);
        setDownloadFilename(`${documentTitle}_separate_pdfs.zip`);
        setHasProcessed(true);
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.8 } });
        setIsProcessing(false);
        return;
      }

      // Single combined multi-page PDF
      const pdfDoc = await PDFDocument.create();
      pdfDoc.setTitle(documentTitle);
      pdfDoc.setProducer('Toolstrum Offline Image-to-PDF Engine');

      for (const it of items) {
        const imgData = await itemToJpegBytes(it, quality);
        const embeddedImg = await pdfDoc.embedJpg(imgData.bytes);

        let pageWidth = imgData.width;
        let pageHeight = imgData.height;

        if (pageSize === 'a4') {
          const isLandscape =
            orientation === 'landscape' || (orientation === 'auto' && imgData.width > imgData.height);
          pageWidth = isLandscape ? 841.89 : 595.28;
          pageHeight = isLandscape ? 595.28 : 841.89;
        } else if (pageSize === 'letter') {
          const isLandscape =
            orientation === 'landscape' || (orientation === 'auto' && imgData.width > imgData.height);
          pageWidth = isLandscape ? 792 : 612;
          pageHeight = isLandscape ? 612 : 792;
        }

        const marginPt = margin === 'none' ? 0 : margin === 'small' ? 20 : 40;
        const availW = Math.max(10, pageWidth - marginPt * 2);
        const availH = Math.max(10, pageHeight - marginPt * 2);

        let drawW = imgData.width;
        let drawH = imgData.height;

        if (pageSize !== 'fit') {
          const scale = Math.min(availW / imgData.width, availH / imgData.height);
          drawW = imgData.width * scale;
          drawH = imgData.height * scale;
        } else {
          pageWidth = imgData.width + marginPt * 2;
          pageHeight = imgData.height + marginPt * 2;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        page.drawImage(embeddedImg, {
          x: (pageWidth - drawW) / 2,
          y: (pageHeight - drawH) / 2,
          width: drawW,
          height: drawH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      setPdfBlob(blob);
      setPdfUrl(url);
      setPdfPageCount(items.length);
      setDownloadFilename(`${documentTitle}.pdf`);
      setHasProcessed(true);

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (err: any) {
      alert(`Failed to generate PDF document: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalInputSize = items.reduce((sum, it) => sum + it.size, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upload Zone when empty */}
      {items.length === 0 && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="image/*"
            multiple={true}
            label="Select or drop images to convert to PDF"
            sublabel="Convert JPG, PNG, WebP, SVG into standard multi-page PDF documents • 100% Offline"
            files={[]}
            onFilesChange={handleFilesAdded}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Main Workspace */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: Interactive Reorderable Page Grid */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    <span>PDF Pages & Arrangement ({items.length})</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Drag or use arrows to reorder pages. Rotate individual photos if needed.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="add-more-pdf-images"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Pages</span>
                    <input
                      id="add-more-pdf-images"
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
                    title="Clear all pages"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Grid of Pages */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto p-1 scrollbar-thin">
                {items.map((it, idx) => (
                  <div
                    key={it.id}
                    className="relative group rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-2 flex flex-col justify-between shadow-2xs hover:border-emerald-400 transition-all"
                  >
                    {/* Page Number Badge */}
                    <div className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded-md bg-black/75 text-white font-mono text-[10px] font-bold shadow-xs">
                      Page {idx + 1}
                    </div>

                    {/* Image Preview Box */}
                    <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-slate-900/90 flex items-center justify-center">
                      <img
                        src={it.previewUrl}
                        alt={`Page ${idx + 1}`}
                        style={{
                          transform: `rotate(${it.rotation}deg)`,
                          transition: 'transform 0.2s ease',
                        }}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Page Info */}
                    <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-500 px-0.5">
                      <span className="truncate max-w-[80px]">{it.file.name}</span>
                      <span>{it.rotation > 0 ? `${it.rotation}°` : formatBytes(it.size)}</span>
                    </div>

                    {/* Reorder and Action Toolbar */}
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'left')}
                          disabled={idx === 0}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                          title="Move earlier"
                        >
                          <MoveLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveItem(idx, 'right')}
                          disabled={idx === items.length - 1}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 cursor-pointer"
                          title="Move later"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-0.5">
                        <button
                          type="button"
                          onClick={() => handleRotateItem(it.id, 90)}
                          className="p-1 rounded-md text-slate-400 hover:text-emerald-500 cursor-pointer"
                          title="Rotate 90° CW"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(it.id)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Remove page"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RESULT DOWNLOAD CARD */}
            {hasProcessed && pdfBlob && (
              <div className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        PDF Document Ready!
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {downloadFilename} • {pdfPageCount} Page(s) • {formatBytes(pdfBlob.size)}
                      </p>
                    </div>
                  </div>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download={downloadFilename}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download PDF</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: PDF Geometry, Margins, Compression & Actions */}
          <div className="lg:col-span-5 space-y-5">
            {/* Page Geometry & Sizing */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Page Size & Orientation</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Configure sheet dimensions for print or screen.
                </p>
              </div>

              {/* Page Size */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Page Geometry
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fit', label: 'Fit to Image', desc: 'Exact scale' },
                    { id: 'a4', label: 'Standard A4', desc: '210 × 297 mm' },
                    { id: 'letter', label: 'US Letter', desc: '8.5 × 11 in' },
                  ].map((sz) => (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => setPageSize(sz.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        pageSize === sz.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {sz.label}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        {sz.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientation if not Fit */}
              {pageSize !== 'fit' && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Page Orientation
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'auto', label: 'Auto Detect' },
                      { id: 'portrait', label: 'Portrait' },
                      { id: 'landscape', label: 'Landscape' },
                    ].map((ori) => (
                      <button
                        key={ori.id}
                        type="button"
                        onClick={() => setOrientation(ori.id as any)}
                        className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          orientation === ori.id
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {ori.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Margins */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Sheet Margin
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'No Margin (0)' },
                    { id: 'small', label: 'Small (20pt)' },
                    { id: 'normal', label: 'Normal (40pt)' },
                  ].map((mg) => (
                    <button
                      key={mg.id}
                      type="button"
                      onClick={() => setMargin(mg.id as any)}
                      className={`p-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                        margin === mg.id
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {mg.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quality & Output Mode */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Compression & Document Mode</span>
              </h3>

              {/* Compression Quality */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Image Compression Quality
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'low', label: 'Small File', sub: '65% quality' },
                    { id: 'medium', label: 'Balanced', sub: '85% quality' },
                    { id: 'high', label: 'Best Quality', sub: '95% quality' },
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setQuality(q.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        quality === q.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-900 dark:text-white">{q.label}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">{q.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Merge vs Separate */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Output Delivery
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setMergeMode('single')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      mergeMode === 'single'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>Single Combined PDF</div>
                    <div className="text-[10px] text-slate-400 font-normal">All photos in 1 doc</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMergeMode('separate')}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      mergeMode === 'separate'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>Separate PDFs (ZIP)</div>
                    <div className="text-[10px] text-slate-400 font-normal">1 PDF per photo</div>
                  </button>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Document Filename
                </label>
                <input
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-mono"
                  placeholder="Document_Title"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGeneratePdf}
                disabled={isProcessing || items.length === 0}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <FileText className="w-5 h-5" />
                <span>
                  {isProcessing
                    ? 'Assembling PDF Document...'
                    : `Generate PDF (${items.length} ${items.length === 1 ? 'Page' : 'Pages'})`}
                </span>
              </button>
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-Side Assembly • Your files never leave your device</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
