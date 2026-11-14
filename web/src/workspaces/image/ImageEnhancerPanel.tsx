import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Sliders,
  Sun,
  Contrast,
  Droplet,
  Flame,
  Zap,
  Download,
  RotateCcw,
  Check,
  ShieldCheck,
  Image as ImageIcon,
  Columns,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';

export interface ImageEnhancerPanelProps {
  accentColor?: string;
}

interface FilterPreset {
  id: string;
  name: string;
  brightness: number;
  contrast: number;
  saturation: number;
  temperature: number;
  sepia: number;
  grayscale: number;
  invert: number;
  sharpness: number;
}

const PRESETS: FilterPreset[] = [
  {
    id: 'original',
    name: 'Original',
    brightness: 100,
    contrast: 100,
    saturation: 100,
    temperature: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    sharpness: 0,
  },
  {
    id: 'auto_enhance',
    name: 'Auto Enhance ✨',
    brightness: 106,
    contrast: 114,
    saturation: 118,
    temperature: 4,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    sharpness: 25,
  },
  {
    id: 'vivid',
    name: 'Vivid Pop',
    brightness: 104,
    contrast: 122,
    saturation: 140,
    temperature: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    sharpness: 20,
  },
  {
    id: 'warm_sunset',
    name: 'Warm Sunset',
    brightness: 105,
    contrast: 108,
    saturation: 115,
    temperature: 28,
    sepia: 15,
    grayscale: 0,
    invert: 0,
    sharpness: 0,
  },
  {
    id: 'cool_nordic',
    name: 'Cool Nordic',
    brightness: 102,
    contrast: 112,
    saturation: 90,
    temperature: -24,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    sharpness: 15,
  },
  {
    id: 'dramatic_bw',
    name: 'High-Contrast B&W',
    brightness: 105,
    contrast: 135,
    saturation: 0,
    temperature: 0,
    sepia: 0,
    grayscale: 100,
    invert: 0,
    sharpness: 30,
  },
  {
    id: 'vintage_film',
    name: 'Vintage Film',
    brightness: 98,
    contrast: 92,
    saturation: 85,
    temperature: 15,
    sepia: 38,
    grayscale: 0,
    invert: 0,
    sharpness: 0,
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    brightness: 108,
    contrast: 130,
    saturation: 160,
    temperature: -15,
    sepia: 0,
    grayscale: 0,
    invert: 0,
    sharpness: 35,
  },
];

export const ImageEnhancerPanel: React.FC<ImageEnhancerPanelProps> = () => {
  // File state
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);

  // Adjustment Sliders
  const [brightness, setBrightness] = useState<number>(100); // 40 to 180
  const [contrast, setContrast] = useState<number>(100); // 40 to 180
  const [saturation, setSaturation] = useState<number>(100); // 0 to 200
  const [temperature, setTemperature] = useState<number>(0); // -50 (cool) to +50 (warm)
  const [sharpness, setSharpness] = useState<number>(0); // 0 to 100
  const [sepia, setSepia] = useState<number>(0); // 0 to 100
  const [grayscale, setGrayscale] = useState<number>(0); // 0 to 100
  const [vignette, setVignette] = useState<number>(0); // 0 to 100

  // Interactive Split Slider Comparison
  const [splitPos, setSplitPos] = useState<number>(50); // percentage (0 to 100)
  const [isComparing, setIsComparing] = useState<boolean>(true);

  // Export settings
  const [exportFormat, setExportFormat] = useState<'png' | 'webp' | 'jpeg'>('jpeg');
  const [exportQuality, setExportQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Apply a preset
  const applyPreset = (preset: FilterPreset) => {
    setBrightness(preset.brightness);
    setContrast(preset.contrast);
    setSaturation(preset.saturation);
    setTemperature(preset.temperature);
    setSepia(preset.sepia);
    setGrayscale(preset.grayscale);
    setSharpness(preset.sharpness);
    setVignette(0);
  };

  // Reset to original
  const resetAll = () => {
    applyPreset(PRESETS[0]);
  };

  // 1-Click Auto Enhance
  const triggerAutoEnhance = () => {
    applyPreset(PRESETS[1]);
  };

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploaded = e.target.files[0];
    const url = URL.createObjectURL(uploaded);
    setFile(uploaded);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      setImgWidth(img.naturalWidth);
      setImgHeight(img.naturalHeight);
      resetAll();
    };
    img.src = url;
    e.target.value = '';
  };

  // Render composition onto canvas
  const renderEnhancedCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement, renderSplit = false) => {
      if (!imageElementRef.current) return;
      const img = imageElementRef.current;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      targetCanvas.width = w;
      targetCanvas.height = h;

      // Draw original on bottom
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Create an offscreen buffer for the enhanced layer
      const offCanvas = document.createElement('canvas');
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d');
      if (!offCtx) return;

      // 1. Basic CSS Filters
      offCtx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) sepia(${sepia}%) grayscale(${grayscale}%)`;
      offCtx.drawImage(img, 0, 0, w, h);

      // 2. Temperature tint (warm amber or cool cyan)
      if (temperature !== 0) {
        offCtx.save();
        offCtx.globalCompositeOperation = temperature > 0 ? 'color-dodge' : 'color-burn';
        offCtx.fillStyle = temperature > 0 ? '#F59E0B' : '#06B6D4';
        offCtx.globalAlpha = Math.abs(temperature) / 220;
        offCtx.fillRect(0, 0, w, h);
        offCtx.restore();
      }

      // 3. Vignette overlay (soft radial shadow)
      if (vignette > 0) {
        offCtx.save();
        const grad = offCtx.createRadialGradient(
          w / 2,
          h / 2,
          (Math.min(w, h) / 3),
          w / 2,
          h / 2,
          (Math.max(w, h) / 1.4)
        );
        grad.addColorStop(0, 'rgba(0,0,0,0)');
        grad.addColorStop(1, `rgba(0,0,0,${(vignette / 100) * 0.85})`);
        offCtx.fillStyle = grad;
        offCtx.fillRect(0, 0, w, h);
        offCtx.restore();
      }

      // 4. Sharpness convolution (unsharp mask)
      if (sharpness > 0) {
        try {
          const imgData = offCtx.getImageData(0, 0, w, h);
          const data = imgData.data;
          const factor = (sharpness / 100) * 0.5;
          // Apply simple 3x3 sharpening to luminance
          for (let y = 1; y < h - 1; y += 2) {
            for (let x = 1; x < w - 1; x += 2) {
              const idx = (y * w + x) * 4;
              const up = ((y - 1) * w + x) * 4;
              const down = ((y + 1) * w + x) * 4;
              const left = (y * w + (x - 1)) * 4;
              const right = (y * w + (x + 1)) * 4;

              for (let c = 0; c < 3; c++) {
                const centerVal = data[idx + c];
                const edgeVal = (data[up + c] + data[down + c] + data[left + c] + data[right + c]) / 4;
                const sharpVal = centerVal + (centerVal - edgeVal) * factor;
                data[idx + c] = Math.min(255, Math.max(0, sharpVal));
              }
            }
          }
          offCtx.putImageData(imgData, 0, 0);
        } catch {
          // Cross-origin fallback
        }
      }

      // If comparing with split slider on preview canvas:
      if (renderSplit && isComparing) {
        const splitX = (w * splitPos) / 100;

        // Draw left side: original
        ctx.drawImage(img, 0, 0, splitX, h, 0, 0, splitX, h);

        // Draw right side: enhanced
        ctx.drawImage(offCanvas, splitX, 0, w - splitX, h, splitX, 0, w - splitX, h);

        // Draw separator guideline
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = Math.max(3, w / 400);
        ctx.beginPath();
        ctx.moveTo(splitX, 0);
        ctx.lineTo(splitX, h);
        ctx.stroke();
      } else {
        // Draw full enhanced
        ctx.drawImage(offCanvas, 0, 0, w, h);
      }
    },
    [
      brightness,
      contrast,
      saturation,
      temperature,
      sharpness,
      sepia,
      grayscale,
      vignette,
      splitPos,
      isComparing,
    ]
  );

  // Sync live canvas preview
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    const canvas = canvasRef.current;
    renderEnhancedCanvas(canvas, true);
  }, [imageUrl, renderEnhancedCanvas]);

  // Export & Download
  const handleDownload = async () => {
    if (!imageElementRef.current || !file) return;
    setIsProcessing(true);
    try {
      const exportCanvas = document.createElement('canvas');
      renderEnhancedCanvas(exportCanvas, false); // Render 100% full enhanced (no split line)

      const mime =
        exportFormat === 'png'
          ? 'image/png'
          : exportFormat === 'webp'
          ? 'image/webp'
          : 'image/jpeg';
      const quality = exportFormat === 'png' ? undefined : exportQuality / 100;

      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            const baseName = file.name.replace(/\.[^/.]+$/, '');
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${baseName}_enhanced.${exportFormat}`;
            link.click();
            URL.revokeObjectURL(url);
          }
          setIsProcessing(false);
        },
        mime,
        quality
      );
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {!imageUrl ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-900/60 shadow-xs hover:border-emerald-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Upload Photo to Enhance & Apply Filters
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Auto-enhance brightness, pop colors, boost clarity, apply cinema LUT presets, and inspect before/after with a split slider. 100% local processing.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 shadow-sm transition">
            <Sparkles className="w-4 h-4" />
            <span>Select Photo to Enhance</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Stage (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={triggerAutoEnhance}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold shadow-sm transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>1-Click Auto Enhance</span>
                </button>
                <button
                  type="button"
                  onClick={resetAll}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsComparing((c) => !c)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isComparing
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Before / After Split</span>
                </button>

                <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Change</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Hidden Source Img */}
            <img
              ref={imageElementRef}
              src={imageUrl}
              alt="Source"
              className="hidden"
              crossOrigin="anonymous"
              onLoad={() => {
                if (canvasRef.current) renderEnhancedCanvas(canvasRef.current, true);
              }}
            />

            {/* Canvas Stage */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg block select-none"
              />

              {/* Before / After Floating Badges */}
              {isComparing && (
                <>
                  <span className="absolute top-6 left-6 px-2.5 py-1 rounded-md bg-slate-950/80 backdrop-blur border border-slate-700 text-[11px] font-bold text-slate-300 pointer-events-none">
                    Original
                  </span>
                  <span className="absolute top-6 right-6 px-2.5 py-1 rounded-md bg-emerald-950/80 backdrop-blur border border-emerald-700 text-[11px] font-bold text-emerald-300 pointer-events-none">
                    Enhanced ✨
                  </span>
                </>
              )}
            </div>

            {/* Split Comparison Slider Range */}
            {isComparing && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Columns className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Split Position ({splitPos}%)</span>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Drag to inspect original vs enhanced side-by-side
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={splitPos}
                  onChange={(e) => setSplitPos(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            )}

            {/* Presets Grid */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Filter & Color LUT Presets
              </span>
              <div className="grid grid-cols-4 gap-2">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition text-left space-y-0.5"
                  >
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      C:{preset.contrast}% · S:{preset.saturation}%
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            {/* ADJUSTMENT SLIDERS */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Light & Color Adjustments</span>
              </h3>

              {/* Brightness */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Brightness</span>
                  </span>
                  <span className="text-emerald-600 font-bold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Contrast className="w-3.5 h-3.5 text-blue-500" />
                    <span>Contrast</span>
                  </span>
                  <span className="text-emerald-600 font-bold">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Saturation (Vibrance)</span>
                  </span>
                  <span className="text-emerald-600 font-bold">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Temperature / Warmth */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <span>Temperature / Warmth</span>
                  </span>
                  <span className="text-emerald-600 font-bold">
                    {temperature > 0 ? `+${temperature} Warm` : temperature < 0 ? `${temperature} Cool` : 'Neutral'}
                  </span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Sharpness & Clarity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-500" />
                    <span>Clarity & Sharpness</span>
                  </span>
                  <span className="text-emerald-600 font-bold">+{sharpness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={sharpness}
                  onChange={(e) => setSharpness(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Vignette Shadow */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Vignette Edge Shadow</span>
                  <span className="text-emerald-600 font-bold">{vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={vignette}
                  onChange={(e) => setVignette(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* EXPORT SETTINGS CARD */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-emerald-500" />
                <span>Export Settings</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {(['jpeg', 'webp', 'png'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setExportFormat(fmt)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                      exportFormat === fmt
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>

              {exportFormat !== 'png' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Export Quality</span>
                    <span className="text-emerald-600 font-bold">{exportQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleDownload}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Processing Image...'
                    : `Download Enhanced Photo (${exportFormat.toUpperCase()})`}
                </span>
              </button>
            </div>

            {/* Offline Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% Offline Canvas Processing. Zero remote servers or cloud processing.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
