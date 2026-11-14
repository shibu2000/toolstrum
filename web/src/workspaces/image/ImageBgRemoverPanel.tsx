import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Scissors,
  Download,
  Trash2,
  ShieldCheck,
  Sparkles,
  Palette,
  Sliders,
  Check,
  Pipette,
  Eye,
  RefreshCw,
  Layers,
  Sun,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export type BackgroundRemovalMode = 'transparent' | 'solid' | 'gradient';

interface ImageBgRemoverPanelProps {
  accentColor?: string;
  isChangerMode?: boolean; // If true, defaults to solid replacement mode
}

export const ImageBgRemoverPanel: React.FC<ImageBgRemoverPanelProps> = ({
  accentColor = '#10B981',
  isChangerMode = false,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);

  // Background removal settings
  const [mode, setMode] = useState<BackgroundRemovalMode>(isChangerMode ? 'solid' : 'transparent');
  const [tolerance, setTolerance] = useState<number>(28); // 5 to 80
  const [feather, setFeather] = useState<number>(6); // 0 to 20
  const [targetColorHex, setTargetColorHex] = useState<string>('#FFFFFF');
  const [contiguousOnly, setContiguousOnly] = useState<boolean>(true); // flood fill from edges

  // Replacement color / gradient
  const [replaceColor, setReplaceColor] = useState<string>('#FFFFFF');
  const [gradientChoice, setGradientChoice] = useState<string>('linear-gradient(135deg, #667eea 0%, #764ba2 100%)');

  // Interactive Eyedropper state
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Result state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSize, setProcessedSize] = useState<number>(0);
  const [downloadFilename, setDownloadFilename] = useState<string>('cutout.png');
  const [splitSliderPos, setSplitSliderPos] = useState<number>(50); // 0 to 100

  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleFileChange = (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);

    const url = URL.createObjectURL(selected);
    const img = new Image();
    img.onload = () => {
      setFile(selected);
      setOriginalUrl(url);
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setProcessedBlob(null);
      setProcessedUrl(null);

      // Auto sample corner color to guess background
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const p = ctx.getImageData(0, 0, 1, 1).data;
          const hex = `#${((1 << 24) + (p[0] << 16) + (p[1] << 8) + p[2]).toString(16).slice(1).toUpperCase()}`;
          setTargetColorHex(hex);
        }
      } catch {
        // Fallback default
      }
    };
    img.src = url;
  };

  const handleClear = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setOriginalUrl(null);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setProcessedSize(0);
    setIsEyedropperActive(false);
  };

  // Eyedropper click on canvas
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isEyedropperActive || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2]).toString(16).slice(1).toUpperCase()}`;
    setTargetColorHex(hex);
    setIsEyedropperActive(false);
  };

  // Core background cutout execution via Canvas ImageData
  const executeCutout = async () => {
    if (!file || !originalUrl) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise((res, rej) => {
        img.onload = res;
        img.onerror = rej;
        img.src = originalUrl;
      });

      const w = img.naturalWidth;
      const h = img.naturalHeight;

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Parse target RGB
      const hexClean = targetColorHex.replace('#', '');
      const tr = parseInt(hexClean.substring(0, 2), 16) || 255;
      const tg = parseInt(hexClean.substring(2, 4), 16) || 255;
      const tb = parseInt(hexClean.substring(4, 6), 16) || 255;

      const tolDist = (tolerance / 100) * 441.67; // max distance in 3D RGB space is sqrt(255^2*3) = ~441.67
      const featherDist = (feather / 100) * 100;

      if (contiguousOnly) {
        // Flood fill from 4 outer borders so internal highlights (eyes, teeth, shirt) aren't destroyed!
        const mask = new Uint8Array(w * h); // 1 = background, 0 = foreground
        const visited = new Uint8Array(w * h);
        const queue: number[] = [];

        // Push edge pixels to queue
        for (let x = 0; x < w; x++) {
          queue.push(x, (h - 1) * w + x);
          visited[x] = 1;
          visited[(h - 1) * w + x] = 1;
        }
        for (let y = 0; y < h; y++) {
          const leftIdx = y * w;
          const rightIdx = y * w + (w - 1);
          if (!visited[leftIdx]) {
            queue.push(leftIdx);
            visited[leftIdx] = 1;
          }
          if (!visited[rightIdx]) {
            queue.push(rightIdx);
            visited[rightIdx] = 1;
          }
        }

        // BFS traversal
        let head = 0;
        while (head < queue.length) {
          const idx = queue[head++];
          const px = idx % w;
          const py = Math.floor(idx / w);
          const p4 = idx * 4;

          const r = data[p4];
          const g = data[p4 + 1];
          const b = data[p4 + 2];
          const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);

          if (dist <= tolDist + featherDist) {
            mask[idx] = 1;

            // Neighbors
            const n4 = [
              px > 0 ? idx - 1 : -1,
              px < w - 1 ? idx + 1 : -1,
              py > 0 ? idx - w : -1,
              py < h - 1 ? idx + w : -1,
            ];

            for (const n of n4) {
              if (n !== -1 && !visited[n]) {
                visited[n] = 1;
                queue.push(n);
              }
            }
          }
        }

        // Apply alpha falloff with feathering
        for (let i = 0; i < w * h; i++) {
          if (mask[i] === 1) {
            const p4 = i * 4;
            const r = data[p4];
            const g = data[p4 + 1];
            const b = data[p4 + 2];
            const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);

            if (dist <= tolDist) {
              data[p4 + 3] = 0; // Pure transparent
            } else if (featherDist > 0) {
              // Smooth alpha transition
              const alphaFraction = (dist - tolDist) / featherDist;
              data[p4 + 3] = Math.round(Math.min(255, Math.max(0, alphaFraction * 255)));
            }
          }
        }
      } else {
        // Global color key
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - tr) ** 2 + (g - tg) ** 2 + (b - tb) ** 2);

          if (dist <= tolDist) {
            data[i + 3] = 0;
          } else if (featherDist > 0 && dist <= tolDist + featherDist) {
            const alphaFraction = (dist - tolDist) / featherDist;
            data[i + 3] = Math.round(Math.min(255, Math.max(0, alphaFraction * 255)));
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // If replacement background requested (Solid or Gradient)
      if (mode === 'solid' || mode === 'gradient') {
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = w;
        bgCanvas.height = h;
        const bgCtx = bgCanvas.getContext('2d')!;

        if (mode === 'solid') {
          bgCtx.fillStyle = replaceColor;
          bgCtx.fillRect(0, 0, w, h);
        } else {
          // Parse gradient
          const grad = bgCtx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, '#667eea');
          grad.addColorStop(1, '#764ba2');
          bgCtx.fillStyle = grad;
          bgCtx.fillRect(0, 0, w, h);
        }

        bgCtx.drawImage(canvas, 0, 0);
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(bgCanvas, 0, 0);
      }

      const outBlob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b!), 'image/png', 1.0)
      );

      const url = URL.createObjectURL(outBlob);
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedBlob(outBlob);
      setProcessedUrl(url);
      setProcessedSize(outBlob.size);

      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const outSuffix = mode === 'transparent' ? 'transparent' : 'recolored';
      setDownloadFilename(`${baseName}_${outSuffix}.png`);

      confetti({ particleCount: 45, spread: 55, origin: { y: 0.85 } });
    } catch (err: any) {
      alert(`Cutout failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upload Zone when empty */}
      {!file && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="image/*"
            multiple={false}
            label={isChangerMode ? 'Select an image to change its background' : 'Select an image to remove its background'}
            sublabel="Cut out backgrounds to transparent PNG with edge anti-aliasing • 100% Client-Side"
            files={[]}
            onFilesChange={handleFileChange}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Main Workspace */}
      {file && originalUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: Interactive Comparison Viewport */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-emerald-500" />
                    <span>Cutout Preview & Comparison</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {file.name} &bull; {originalWidth} × {originalHeight} px
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEyedropperActive(!isEyedropperActive)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isEyedropperActive
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                    title="Click canvas to pick background color"
                  >
                    <Pipette className="w-4 h-4" />
                    <span>{isEyedropperActive ? 'Click to Pick' : 'Sample Color'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Remove image"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* VIEWPORT WITH TRANSPARENCY CHECKERBOARD */}
              <div
                className="relative flex items-center justify-center p-4 rounded-xl overflow-hidden select-none min-h-[380px]"
                style={{
                  backgroundImage:
                    'linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                  backgroundColor: '#0f172a',
                }}
              >
                {/* Before / After Split Slider if processed */}
                {processedUrl ? (
                  <div className="relative inline-block max-w-full overflow-hidden select-none">
                    {/* Processed (Transparent) Background Layer */}
                    <img
                      src={processedUrl}
                      alt="Processed Cutout"
                      className="max-h-[440px] max-w-full object-contain block select-none pointer-events-none"
                    />

                    {/* Original Image Layer Clipped */}
                    <div
                      style={{ clipPath: `inset(0 ${100 - splitSliderPos}% 0 0)` }}
                      className="absolute inset-0 select-none pointer-events-none"
                    >
                      <img
                        src={originalUrl}
                        alt="Original"
                        className="max-h-[440px] max-w-full object-contain block"
                      />
                    </div>

                    {/* Vertical Split Line */}
                    <div
                      style={{ left: `${splitSliderPos}%` }}
                      className="absolute inset-y-0 w-0.5 bg-emerald-400 pointer-events-none shadow-lg"
                    >
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md">
                        &harr;
                      </div>
                    </div>
                  </div>
                ) : (
                  <img
                    src={originalUrl}
                    alt="Original"
                    className="max-h-[440px] max-w-full object-contain block select-none"
                  />
                )}
              </div>

              {/* Slider Controller if processed */}
              {processedUrl && (
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>Original ({splitSliderPos}%)</span>
                    <span>Cutout Result ({100 - splitSliderPos}%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splitSliderPos}
                    onChange={(e) => setSplitSliderPos(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* RESULT READY CARD */}
            {processedBlob && (
              <div className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Background Cutout Ready!
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {downloadFilename} &bull; {formatBytes(processedSize)} &bull; 32-bit Transparent PNG
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Cutout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: Mask Controls, Tolerance, Background Mode, Action */}
          <div className="lg:col-span-5 space-y-5">
            {/* Color Key Sampling Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Pipette className="w-4 h-4 text-emerald-500" />
                  <span>Target Color Key</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick the background hue to erase.
                </p>
              </div>

              {/* Color Presets */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { hex: '#FFFFFF', label: 'White' },
                  { hex: '#000000', label: 'Black' },
                  { hex: '#00FF00', label: 'Green' },
                  { hex: '#0000FF', label: 'Blue' },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setTargetColorHex(c.hex)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      targetColorHex.toUpperCase() === c.hex
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div
                      style={{ backgroundColor: c.hex }}
                      className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs"
                    />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>

              {/* Custom Hex input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={targetColorHex}
                  onChange={(e) => setTargetColorHex(e.target.value.toUpperCase())}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer shrink-0"
                />
                <input
                  type="text"
                  value={targetColorHex}
                  onChange={(e) => setTargetColorHex(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            {/* Cutout Precision & Edge Feathering */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Mask Precision & Smoothing</span>
              </h3>

              {/* Tolerance */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span>Color Tolerance</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {tolerance}%
                  </span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="75"
                  value={tolerance}
                  onChange={(e) => setTolerance(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Feathering */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                  <span>Edge Feather (Anti-Aliasing)</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {feather}px
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={feather}
                  onChange={(e) => setFeather(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Contiguous Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setContiguousOnly(!contiguousOnly)}
                  className="flex items-start gap-2.5 cursor-pointer text-left"
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center text-white ${
                      contiguousOnly ? 'bg-emerald-500' : 'border border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {contiguousOnly && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">
                      Flood-Fill Contiguous Edges Only
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                      Recommended: Prevents internal white shirts, teeth, and highlights from becoming transparent.
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Replacement Backdrop Choice */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Palette className="w-4 h-4 text-emerald-500" />
                <span>Output Background Mode</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'transparent', label: 'Transparent', sub: 'PNG Alpha' },
                  { id: 'solid', label: 'Solid Color', sub: 'Custom Tint' },
                  { id: 'gradient', label: 'Modern Grad', sub: 'Studio Look' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMode(m.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      mode === m.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">{m.sub}</div>
                  </button>
                ))}
              </div>

              {/* Solid Color Picker if solid mode */}
              {mode === 'solid' && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <input
                    type="color"
                    value={replaceColor}
                    onChange={(e) => setReplaceColor(e.target.value)}
                    className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={replaceColor}
                    onChange={(e) => setReplaceColor(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={executeCutout}
                disabled={isProcessing}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <Scissors className="w-5 h-5" />
                <span>
                  {isProcessing
                    ? 'Processing Edge Cutout...'
                    : mode === 'transparent'
                    ? 'Remove Background Now'
                    : 'Apply Background Replacement'}
                </span>
              </button>
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-Side Masking • Your photos never leave your device</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
