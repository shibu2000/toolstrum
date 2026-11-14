import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sliders,
  Sparkles,
  Download,
  ShieldCheck,
  Check,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  Eraser,
  Eye,
  Layers,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface ScannerEnhancePanelProps {
  initialToolId?: number;
  accentColor?: string;
}

type FilterPreset = 'magic_color' | 'stark_bw' | 'grayscale' | 'despeckle_clean' | 'blueprint' | 'original';

export const ScannerEnhancePanel: React.FC<ScannerEnhancePanelProps> = ({
  initialToolId = 89,
  accentColor = '#06B6D4',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);

  // Filter & Enhancement settings
  const [preset, setPreset] = useState<FilterPreset>(() =>
    initialToolId === 99 ? 'despeckle_clean' : 'magic_color'
  );
  const [threshold, setThreshold] = useState<number>(135); // 50 to 220
  const [contrast, setContrast] = useState<number>(1.35); // 1.0 to 2.5
  const [whitenBg, setWhitenBg] = useState<number>(30); // 0 to 100%
  const [eraseHoles, setEraseHoles] = useState<boolean>(initialToolId === 99);
  const [despeckle, setDespeckle] = useState<boolean>(initialToolId === 99);

  // Result state
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitPos, setSplitPos] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingSplit = useRef(false);

  // Load image
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setImageUrl(url);
    setEnhancedUrl(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImgWidth(img.naturalWidth || img.width);
      setImgHeight(img.naturalHeight || img.height);
    };
    img.src = url;
  };

  // Run Canvas Image Enhancement Pipeline
  const runFilterPipeline = useCallback(async () => {
    if (!imageUrl || !imgWidth || !imgHeight) return;

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 60));

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = imageUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('Canvas 2D unavailable');

      ctx.drawImage(img, 0, 0);

      if (preset === 'original' && !eraseHoles && !despeckle) {
        canvas.toBlob((blob) => {
          if (blob) {
            if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
            setEnhancedUrl(URL.createObjectURL(blob));
          }
          setIsProcessing(false);
        }, 'image/jpeg', 0.95);
        return;
      }

      const imgData = ctx.getImageData(0, 0, imgWidth, imgHeight);
      const data = imgData.data;

      // 1. Hole Punch Eraser (erases circular shadows along left 12% margin)
      if (eraseHoles) {
        const leftBoundary = Math.round(imgWidth * 0.12);
        for (let y = 0; y < imgHeight; y++) {
          const yOff = y * imgWidth * 4;
          for (let x = 0; x < leftBoundary; x++) {
            const idx = yOff + x * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            // If very dark in hole punch region, whiten
            if (r < 75 && g < 75 && b < 75) {
              data[idx] = 255;
              data[idx + 1] = 255;
              data[idx + 2] = 255;
            }
          }
        }
      }

      // 2. Main Preset Logic
      const whitenFactor = whitenBg / 100;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (preset === 'magic_color') {
          // CamScanner Magic Color:
          // Bleach high luminosity to 255 (clean paper) while saturating dark ink & stamps
          if (lum > 155 - whitenFactor * 30) {
            // Background paper: whiten progressively
            const boost = (lum - 150) * 1.5;
            r = Math.min(255, r + boost);
            g = Math.min(255, g + boost);
            b = Math.min(255, b + boost);
          } else {
            // Text or ink: boost contrast and darkness
            r = Math.max(0, (r - 128) * contrast + 110);
            g = Math.max(0, (g - 128) * contrast + 110);
            b = Math.max(0, (b - 128) * contrast + 110);
          }
        } else if (preset === 'stark_bw') {
          // High-contrast Document B&W binarization
          const adjusted = (lum - 128) * contrast + 128;
          const val = adjusted > threshold ? 255 : 0;
          r = val;
          g = val;
          b = val;
        } else if (preset === 'grayscale') {
          // Clean grayscale
          const gr = Math.max(0, Math.min(255, (lum - 128) * contrast + 128 + whitenFactor * 25));
          r = gr;
          g = gr;
          b = gr;
        } else if (preset === 'blueprint') {
          // Inverted blueprint
          const inv = 255 - lum;
          r = Math.max(0, inv * 0.3);
          g = Math.max(0, inv * 0.7);
          b = Math.min(255, inv * 1.4);
        } else if (preset === 'despeckle_clean') {
          // Despeckle & page whitening
          if (lum > 170 - whitenFactor * 40) {
            r = 255;
            g = 255;
            b = 255;
          } else {
            r = Math.max(0, (r - 128) * 1.2 + 120);
            g = Math.max(0, (g - 128) * 1.2 + 120);
            b = Math.max(0, (b - 128) * 1.2 + 120);
          }
        }

        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }

      // 3. Despeckle pass (removes isolated stray noise pixels)
      if (despeckle) {
        const copy = new Uint8ClampedArray(data);
        const rowBytes = imgWidth * 4;
        for (let y = 1; y < imgHeight - 1; y++) {
          const yOff = y * rowBytes;
          for (let x = 1; x < imgWidth - 1; x++) {
            const idx = yOff + x * 4;
            // If pixel is black surrounded by 8 white pixels, clean it
            if (copy[idx] < 100) {
              const top = copy[idx - rowBytes];
              const bot = copy[idx + rowBytes];
              const left = copy[idx - 4];
              const right = copy[idx + 4];
              if (top > 200 && bot > 200 && left > 200 && right > 200) {
                data[idx] = 255;
                data[idx + 1] = 255;
                data[idx + 2] = 255;
              }
            }
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (enhancedUrl) URL.revokeObjectURL(enhancedUrl);
            setEnhancedUrl(URL.createObjectURL(blob));
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('Enhancement pipeline failed:', err);
      setIsProcessing(false);
    }
  }, [imageUrl, imgWidth, imgHeight, preset, threshold, contrast, whitenBg, eraseHoles, despeckle, enhancedUrl]);

  // Re-run whenever settings change
  useEffect(() => {
    if (imageUrl && imgWidth > 0) {
      runFilterPipeline();
    }
  }, [imageUrl, imgWidth, imgHeight, preset, threshold, contrast, whitenBg, eraseHoles, despeckle]);

  // Handle split slider drag
  const handleSplitDrag = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    setSplitPos((x / rect.width) * 100);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (isDraggingSplit.current) handleSplitDrag(e.clientX);
    };
    const onTouch = (e: TouchEvent) => {
      if (isDraggingSplit.current && e.touches[0]) handleSplitDrag(e.touches[0].clientX);
    };
    const onUp = () => {
      isDraggingSplit.current = false;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onTouch);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onTouch);
      window.removeEventListener('touchend', onUp);
    };
  }, []);

  // Download JPEG
  const downloadEnhancedJpeg = () => {
    if (!enhancedUrl) return;
    const link = document.createElement('a');
    link.href = enhancedUrl;
    const base = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'document';
    link.download = `${base}-enhanced.jpg`;
    link.click();
  };

  // Download PDF via pdf-lib
  const downloadEnhancedPdf = async () => {
    if (!enhancedUrl) return;
    try {
      const resp = await fetch(enhancedUrl);
      const jpgBytes = await resp.arrayBuffer();

      const pdfDoc = await PDFDocument.create();
      const embedded = await pdfDoc.embedJpg(jpgBytes);
      const page = pdfDoc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, {
        x: 0,
        y: 0,
        width: embedded.width,
        height: embedded.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const base = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'document';
      link.download = `${base}-enhanced.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF generation error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageUrl && (
        <div className="max-w-xl mx-auto py-12">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-3xl p-8 cursor-pointer bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all group shadow-sm hover:shadow-md">
            <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
              Select or Drop Document Scan to Enhance
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Apply CamScanner Magic Color, remove paper yellowing, erase hole punches, and sharpen ink • 100% Offline
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
          </label>
        </div>
      )}

      {imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-500" />
                <span>Document Filters & Cleanup</span>
              </h3>

              {/* Filter Presets */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'magic_color', label: 'Magic Color', desc: 'CamScanner Signature' },
                  { id: 'stark_bw', label: 'Stark B&W', desc: 'Pure Binarized Text' },
                  { id: 'grayscale', label: 'Clean Grayscale', desc: 'Smooth Gray Tones' },
                  { id: 'despeckle_clean', label: 'Clean & Bleach', desc: 'Whiten & Remove Dots' },
                  { id: 'blueprint', label: 'Blueprint Invert', desc: 'Architectural Look' },
                  { id: 'original', label: 'Original Scan', desc: 'Unfiltered Photo' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPreset(p.id as FilterPreset)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      preset === p.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {preset === 'stark_bw' && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-600 dark:text-slate-400">B&W Threshold</span>
                      <span className="font-mono text-slate-900 dark:text-white">{threshold}</span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={200}
                      value={threshold}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                )}

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Background Whitening</span>
                    <span className="font-mono text-slate-900 dark:text-white">{whitenBg}%</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={whitenBg}
                    onChange={(e) => setWhitenBg(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Contrast Multiplier</span>
                    <span className="font-mono text-slate-900 dark:text-white">{contrast.toFixed(2)}×</span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={2.5}
                    step={0.05}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>

              {/* Document Cleanup Toggles (Tool 99) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Eraser className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Document Cleanup Tools</span>
                </div>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-400">Erase Binder Hole Punches</span>
                  <input
                    type="checkbox"
                    checked={eraseHoles}
                    onChange={(e) => setEraseHoles(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-400">Despeckle / Salt-and-Pepper Filter</span>
                  <input
                    type="checkbox"
                    checked={despeckle}
                    onChange={(e) => setDespeckle(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={downloadEnhancedJpeg}
                  disabled={!enhancedUrl || isProcessing}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Download JPEG</span>
                </button>

                <button
                  onClick={downloadEnhancedPdf}
                  disabled={!enhancedUrl || isProcessing}
                  className="py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Change Image */}
            <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Choose Different Document</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
            </label>
          </div>

          {/* Interactive Split Comparison Viewport */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Interactive Before / After Split Slider
              </span>
              <span>Drag the slider handle to compare enhancement</span>
            </div>

            <div
              ref={containerRef}
              onMouseDown={() => (isDraggingSplit.current = true)}
              onTouchStart={() => (isDraggingSplit.current = true)}
              className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 select-none cursor-ew-resize min-h-[500px] flex items-center justify-center"
            >
              {/* Enhanced Image Background */}
              {enhancedUrl ? (
                <img
                  src={enhancedUrl}
                  alt="Enhanced"
                  className="max-h-[520px] w-auto object-contain"
                />
              ) : (
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
                  <span>Applying document filters...</span>
                </div>
              )}

              {/* Original Image Foreground Clip */}
              <div
                className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none"
                style={{ width: `${splitPos}%`, borderRight: '2px solid #06B6D4' }}
              >
                <img
                  src={imageUrl}
                  alt="Original"
                  style={{
                    width: containerRef.current?.clientWidth,
                    maxWidth: 'none',
                  }}
                  className="max-h-[520px] object-contain"
                />
              </div>

              {/* Slider Handle */}
              <div
                className="absolute top-0 bottom-0 pointer-events-none"
                style={{ left: `${splitPos}%`, transform: 'translateX(-50%)' }}
              >
                <div className="h-full w-0.5 bg-cyan-500 shadow-md flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-cyan-500 text-white flex items-center justify-center shadow-lg border-2 border-white dark:border-slate-900">
                    <Sliders className="w-3.5 h-3.5 rotate-90" />
                  </div>
                </div>
              </div>

              {/* Badges */}
              <span className="absolute top-3 left-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase pointer-events-none">
                Original Photo
              </span>
              <span className="absolute top-3 right-3 px-2 py-1 rounded-md bg-cyan-500/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase pointer-events-none">
                Enhanced Document
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
