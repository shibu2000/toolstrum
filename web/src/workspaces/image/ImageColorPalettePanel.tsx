import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Pipette,
  Palette,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  Sliders,
  Layers,
  Code,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

export interface ImageColorPalettePanelProps {
  initialToolId?: number; // 64: Color Picker, 78: Palette Extractor
  accentColor?: string;
}

interface SwatchItem {
  hex: string;
  rgb: string;
  hsl: string;
  percentage: number;
  contrastWithWhite: string;
  contrastWithBlack: string;
}

export const ImageColorPalettePanel: React.FC<ImageColorPalettePanelProps> = ({
  initialToolId = 78,
}) => {
  const [activeTab, setActiveTab] = useState<'picker' | 'palette'>(
    initialToolId === 64 ? 'picker' : 'palette'
  );

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgNaturalWidth, setImgNaturalWidth] = useState<number>(0);
  const [imgNaturalHeight, setImgNaturalHeight] = useState<number>(0);

  // Color Picker state (Tool 64)
  const [pickedColor, setPickedColor] = useState<{
    hex: string;
    rgb: string;
    hsl: string;
    x: number;
    y: number;
  }>({
    hex: '#10B981',
    rgb: 'rgb(16, 185, 129)',
    hsl: 'hsl(159, 84%, 39%)',
    x: 0,
    y: 0,
  });
  const [hoverColor, setHoverColor] = useState<{
    hex: string;
    rgb: string;
    x: number;
    y: number;
  } | null>(null);
  const [pickerHistory, setPickerHistory] = useState<string[]>([]);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  // Palette Extractor state (Tool 78)
  const [paletteSize, setPaletteSize] = useState<number>(6); // 4, 6, 8, 10
  const [extractedSwatches, setExtractedSwatches] = useState<SwatchItem[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Helpers: RGB to HEX / HSL
  const rgbToHex = (r: number, g: number, b: number): string => {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
    const rf = r / 255;
    const gf = g / 255;
    const bf = b / 255;
    const max = Math.max(rf, gf, bf);
    const min = Math.min(rf, gf, bf);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rf:
          h = (gf - bf) / d + (gf < bf ? 6 : 0);
          break;
        case gf:
          h = (bf - rf) / d + 2;
          break;
        case bf:
          h = (rf - gf) / d + 4;
          break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const getLuminance = (r: number, g: number, b: number): number => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const calculateContrast = (lum1: number, lum2: number): string => {
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    return `${ratio.toFixed(1)}:1`;
  };

  // Color Quantization Palette Extraction
  const extractPalette = useCallback(
    (img: HTMLImageElement, count: number) => {
      const offCanvas = document.createElement('canvas');
      const sampleW = 120;
      const sampleH = 120;
      offCanvas.width = sampleW;
      offCanvas.height = sampleH;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0, sampleW, sampleH);
      const imgData = ctx.getImageData(0, 0, sampleW, sampleH).data;

      // Color bucketing with 5-bit quantization per channel (32 levels)
      const colorMap: {
        [key: string]: { r: number; g: number; b: number; count: number };
      } = {};
      let totalPixels = 0;

      for (let i = 0; i < imgData.length; i += 4) {
        const a = imgData[i + 3];
        if (a < 128) continue; // Skip transparency

        const r = imgData[i];
        const g = imgData[i + 1];
        const b = imgData[i + 2];

        // Quantize key
        const qr = Math.round(r / 24) * 24;
        const qg = Math.round(g / 24) * 24;
        const qb = Math.round(b / 24) * 24;
        const key = `${qr},${qg},${qb}`;

        if (!colorMap[key]) {
          colorMap[key] = { r, g, b, count: 0 };
        }
        colorMap[key].count++;
        totalPixels++;
      }

      // Sort by frequency and filter similar hues
      const sorted = Object.values(colorMap).sort((a, b) => b.count - a.count);
      const filtered: typeof sorted = [];

      for (const item of sorted) {
        if (filtered.length >= count) break;
        const isTooSimilar = filtered.some((f) => {
          const dr = Math.abs(f.r - item.r);
          const dg = Math.abs(f.g - item.g);
          const db = Math.abs(f.b - item.b);
          return dr + dg + db < 45;
        });
        if (!isTooSimilar) {
          filtered.push(item);
        }
      }

      const whiteLum = 1.0;
      const blackLum = 0.0;

      const swatches: SwatchItem[] = filtered.map((c) => {
        const hex = rgbToHex(c.r, c.g, c.b);
        const rgb = `rgb(${c.r}, ${c.g}, ${c.b})`;
        const hsl = rgbToHsl(c.r, c.g, c.b);
        const lum = getLuminance(c.r, c.g, c.b);
        return {
          hex,
          rgb,
          hsl,
          percentage: totalPixels > 0 ? Math.round((c.count / totalPixels) * 100) : 0,
          contrastWithWhite: calculateContrast(lum, whiteLum),
          contrastWithBlack: calculateContrast(lum, blackLum),
        };
      });

      setExtractedSwatches(swatches);
    },
    []
  );

  // File Upload handler
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    setImageFile(file);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      setImgNaturalWidth(img.naturalWidth);
      setImgNaturalHeight(img.naturalHeight);
      extractPalette(img, paletteSize);
    };
    img.src = url;
    e.target.value = '';
  };

  // Re-extract if palette size changes
  useEffect(() => {
    if (imageElementRef.current && imageElementRef.current.complete) {
      extractPalette(imageElementRef.current, paletteSize);
    }
  }, [paletteSize, extractPalette]);

  // Canvas Mouse Interactivity: Eyedropper Magnifier & Color Sampling (Tool 64)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imageElementRef.current) return;
    const img = imageElementRef.current;
    const rect = img.getBoundingClientRect();

    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;

    const x = Math.floor((e.clientX - rect.left) * scaleX);
    const y = Math.floor((e.clientY - rect.top) * scaleY);

    if (x < 0 || x >= img.naturalWidth || y < 0 || y >= img.naturalHeight) return;

    // Render 11x11 magnifier loupe
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = img.naturalWidth;
      canvasRef.current.height = img.naturalHeight;
      const ctx = canvasRef.current.getContext('2d');
      ctx?.drawImage(img, 0, 0);
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;

    setHoverColor({ hex, rgb, x, y });

    // Draw to magnifier
    if (magnifierCanvasRef.current) {
      const magCtx = magnifierCanvasRef.current.getContext('2d');
      if (magCtx) {
        magCtx.imageSmoothingEnabled = false;
        magCtx.clearRect(0, 0, 100, 100);
        magCtx.drawImage(img, x - 5, y - 5, 11, 11, 0, 0, 100, 100);

        // Center reticle
        magCtx.strokeStyle = '#FFFFFF';
        magCtx.lineWidth = 2;
        magCtx.strokeRect(45, 45, 10, 10);
        magCtx.strokeStyle = '#000000';
        magCtx.lineWidth = 1;
        magCtx.strokeRect(44, 44, 12, 12);
      }
    }
  };

  const handleCanvasClick = () => {
    if (!hoverColor || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(hoverColor.x, hoverColor.y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    const rgb = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
    const hsl = rgbToHsl(pixel[0], pixel[1], pixel[2]);

    setPickedColor({ hex, rgb, hsl, x: hoverColor.x, y: hoverColor.y });
    setPickerHistory((prev) => [hex, ...prev.filter((h) => h !== hex)].slice(0, 12));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    setTimeout(() => setCopiedFormat(null), 1500);
  };

  // Export Palette as CSS Variables
  const copyCssVariables = () => {
    const css = `:root {\n${extractedSwatches
      .map((s, idx) => `  --palette-color-${idx + 1}: ${s.hex}; /* ${s.percentage}% */`)
      .join('\n')}\n}`;
    copyToClipboard(css, 'CSS');
  };

  // Export Palette as JSON
  const copyJsonPalette = () => {
    const json = JSON.stringify(
      extractedSwatches.map((s, idx) => ({
        index: idx + 1,
        hex: s.hex,
        rgb: s.rgb,
        hsl: s.hsl,
        percentage: `${s.percentage}%`,
      })),
      null,
      2
    );
    copyToClipboard(json, 'JSON');
  };

  // Download Palette as Image Swatch PNG
  const downloadPaletteImage = () => {
    if (extractedSwatches.length === 0) return;
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 480;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Title
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('Toolstrum · Extracted Color Palette', 32, 50);

    // Subtitle
    ctx.fillStyle = '#94A3B8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`${extractedSwatches.length} Dominant Colors • Generated On-Device 100% Offline`, 32, 75);

    // Draw swatch cards
    const cardW = Math.floor((width - 64 - (extractedSwatches.length - 1) * 12) / extractedSwatches.length);
    const cardH = 320;
    const startY = 110;

    extractedSwatches.forEach((swatch, idx) => {
      const x = 32 + idx * (cardW + 12);

      // Color box
      ctx.fillStyle = swatch.hex;
      ctx.fillRect(x, startY, cardW, cardH - 80);

      // Label background
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(x, startY + cardH - 80, cardW, 80);

      // Hex code text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(swatch.hex, x + cardW / 2, startY + cardH - 50);

      // Percentage
      ctx.fillStyle = '#10B981';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${swatch.percentage}%`, x + cardW / 2, startY + cardH - 26);
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `toolstrum_palette_${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Upload Screen */}
      {!imageUrl ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-900/60 shadow-xs hover:border-emerald-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            {initialToolId === 64 ? (
              <Pipette className="w-8 h-8" />
            ) : (
              <Palette className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {initialToolId === 64
              ? 'Upload Photo to Pick & Sample Colors'
              : 'Upload Photo to Extract Color Palette'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Supports PNG, JPG, WebP, SVG, and AVIF photos. Samples exact pixel HEX/RGB/HSL codes and builds harmonized dominant color schemes on-device.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 shadow-sm transition">
            <Pipette className="w-4 h-4" />
            <span>Select Image to Inspect</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Stage (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('picker')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'picker'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Pipette className="w-3.5 h-3.5" />
                  <span>Color Eyedropper (Tool 64)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('palette')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'palette'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5" />
                  <span>Dominant Palette (Tool 78)</span>
                </button>
              </div>

              {/* Replace Image */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Change Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Interactive Image & Loupe Stage */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
              <img
                ref={imageElementRef}
                src={imageUrl}
                alt="Source for Palette"
                onMouseMove={handleCanvasMouseMove}
                onClick={handleCanvasClick}
                className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg cursor-crosshair"
              />

              {/* Floating Pixel Magnifier Loupe */}
              {hoverColor && activeTab === 'picker' && (
                <div className="absolute top-4 right-4 p-2 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-2xl shadow-xl flex flex-col items-center gap-2 pointer-events-none">
                  <canvas
                    ref={magnifierCanvasRef}
                    width={100}
                    height={100}
                    className="w-24 h-24 rounded-xl border border-slate-700"
                  />
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-xs"
                      style={{ backgroundColor: hoverColor.hex }}
                    />
                    <span className="text-[11px] font-mono font-bold text-white">
                      {hoverColor.hex}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Click to Sample Tip */}
            {activeTab === 'picker' && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <Pipette className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Click anywhere on the photo to sample and save that exact pixel color.</span>
                </div>
                <span className="font-mono text-[11px] opacity-80">
                  {imgNaturalWidth} × {imgNaturalHeight} px
                </span>
              </div>
            )}
          </div>

          {/* Configuration Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            {/* TAB 1: COLOR PICKER INSPECTOR (Tool 64) */}
            {activeTab === 'picker' && (
              <div className="space-y-4">
                {/* Active Sample Card */}
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Pipette className="w-4 h-4 text-emerald-500" />
                      <span>Sampled Color Inspection</span>
                    </h3>
                  </div>

                  {/* Swatch Display */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div
                      className="w-16 h-16 rounded-2xl border-2 border-white shadow-md flex-shrink-0"
                      style={{ backgroundColor: pickedColor.hex }}
                    />
                    <div className="space-y-1">
                      <p className="font-mono font-extrabold text-lg text-slate-900 dark:text-white">
                        {pickedColor.hex}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">{pickedColor.rgb}</p>
                      <p className="text-xs text-slate-500 font-mono">{pickedColor.hsl}</p>
                    </div>
                  </div>

                  {/* Copy Quick Buttons */}
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(pickedColor.hex, 'HEX')}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      {copiedFormat === 'HEX' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy HEX</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(pickedColor.rgb, 'RGB')}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      {copiedFormat === 'RGB' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy RGB</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(pickedColor.hsl, 'HSL')}
                      className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                    >
                      {copiedFormat === 'HSL' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy HSL</span>
                    </button>
                  </div>

                  {/* Picked History Swatches */}
                  {pickerHistory.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Recent Samples ({pickerHistory.length})
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {pickerHistory.map((hex) => (
                          <button
                            key={hex}
                            type="button"
                            onClick={() => {
                              copyToClipboard(hex, hex);
                              setPickedColor((prev) => ({ ...prev, hex }));
                            }}
                            style={{ backgroundColor: hex }}
                            className="w-7 h-7 rounded-lg border-2 border-slate-300 dark:border-slate-700 hover:scale-110 transition shadow-xs"
                            title={`Click to copy ${hex}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: PALETTE EXTRACTOR INSPECTOR (Tool 78) */}
            {activeTab === 'palette' && (
              <div className="space-y-4">
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Palette className="w-4 h-4 text-emerald-500" />
                      <span>Dominant Harmonized Palette</span>
                    </h3>

                    {/* Palette Size Selector */}
                    <div className="flex items-center gap-1">
                      {[4, 6, 8, 10].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPaletteSize(num)}
                          className={`px-2 py-0.5 rounded-md text-xs font-semibold transition ${
                            paletteSize === num
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Swatch List */}
                  <div className="space-y-2">
                    {extractedSwatches.map((swatch, idx) => (
                      <div
                        key={swatch.hex}
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="w-8 h-8 rounded-lg border border-black/10 shrink-0 shadow-xs"
                            style={{ backgroundColor: swatch.hex }}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                                {swatch.hex}
                              </span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                                {swatch.percentage}%
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {swatch.rgb}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => copyToClipboard(swatch.hex, swatch.hex)}
                          className="p-1.5 rounded-lg bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:bg-emerald-50 transition shadow-xs"
                          title="Copy Hex"
                        >
                          {copiedFormat === swatch.hex ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Export Options */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Export Palette
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={copyCssVariables}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <FileCode className="w-3.5 h-3.5 text-emerald-500" />
                        <span>CSS Variables</span>
                      </button>

                      <button
                        type="button"
                        onClick={copyJsonPalette}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition flex items-center justify-center gap-1.5"
                      >
                        <Code className="w-3.5 h-3.5 text-emerald-500" />
                        <span>JSON Array</span>
                      </button>

                      <button
                        type="button"
                        onClick={downloadPaletteImage}
                        className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PNG Swatch</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Offline Shield */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% Offline Pixel Processing. Images are never uploaded to any server.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
