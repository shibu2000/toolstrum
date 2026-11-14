import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  EyeOff,
  ShieldAlert,
  Sparkles,
  Download,
  Trash2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Image as ImageIcon,
  Square,
  Sliders,
  Check,
} from 'lucide-react';

export interface ImageBlurPanelProps {
  accentColor?: string;
}

interface RedactBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  style: 'pixelate' | 'blur' | 'blackout';
}

export const ImageBlurPanel: React.FC<ImageBlurPanelProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState<number>(0);
  const [imgHeight, setImgHeight] = useState<number>(0);

  // Blur Mode: full image vs selective privacy redactor
  const [blurMode, setBlurMode] = useState<'selective' | 'full'>('selective');

  // Full image blur controls
  const [fullBlurRadius, setFullBlurRadius] = useState<number>(18); // 2 to 60px
  const [fullBlurStyle, setFullBlurStyle] = useState<'gaussian' | 'pixelate'>('gaussian');
  const [pixelBlockSize, setPixelBlockSize] = useState<number>(16); // 4 to 40px

  // Selective Redactor controls
  const [redactBoxes, setRedactBoxes] = useState<RedactBox[]>([]);
  const [redactStyle, setRedactStyle] = useState<'pixelate' | 'blur' | 'blackout'>('pixelate');
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Export settings
  const [exportFormat, setExportFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [exportQuality, setExportQuality] = useState<number>(92);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Handle file upload
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
      setRedactBoxes([]);
    };
    img.src = url;
    e.target.value = '';
  };

  // Helper to apply pixelation to a specific rect on canvas
  const applyPixelationToRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    blockSize: number
  ) => {
    if (w <= 0 || h <= 0) return;
    const offCanvas = document.createElement('canvas');
    const scaledW = Math.max(1, Math.floor(w / blockSize));
    const scaledH = Math.max(1, Math.floor(h / blockSize));

    offCanvas.width = scaledW;
    offCanvas.height = scaledH;
    const offCtx = offCanvas.getContext('2d');
    if (!offCtx) return;

    // Downscale rect
    offCtx.drawImage(ctx.canvas, x, y, w, h, 0, 0, scaledW, scaledH);

    // Upscale rect with pixel smoothing disabled
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(offCanvas, 0, 0, scaledW, scaledH, x, y, w, h);
    ctx.imageSmoothingEnabled = true;
  };

  // Render composition on canvas
  const renderComposition = useCallback(
    (targetCanvas: HTMLCanvasElement, showBoxOutlines = true) => {
      if (!imageElementRef.current) return;
      const img = imageElementRef.current;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const w = img.naturalWidth;
      const h = img.naturalHeight;
      targetCanvas.width = w;
      targetCanvas.height = h;

      ctx.clearRect(0, 0, w, h);

      if (blurMode === 'full') {
        if (fullBlurStyle === 'gaussian') {
          ctx.filter = `blur(${fullBlurRadius}px)`;
          ctx.drawImage(img, 0, 0, w, h);
          ctx.filter = 'none';
        } else {
          // Full image pixelation
          ctx.drawImage(img, 0, 0, w, h);
          applyPixelationToRect(ctx, 0, 0, w, h, pixelBlockSize);
        }
      } else {
        // Selective Privacy Redactor Mode
        ctx.drawImage(img, 0, 0, w, h);

        // Apply all finalized redact boxes
        redactBoxes.forEach((box) => {
          if (box.style === 'blackout') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(box.x, box.y, box.width, box.height);
          } else if (box.style === 'pixelate') {
            applyPixelationToRect(ctx, box.x, box.y, box.width, box.height, 16);
          } else {
            // Box blur
            const off = document.createElement('canvas');
            off.width = box.width;
            off.height = box.height;
            const offCtx = off.getContext('2d');
            if (offCtx) {
              offCtx.filter = 'blur(14px)';
              offCtx.drawImage(
                img,
                box.x,
                box.y,
                box.width,
                box.height,
                0,
                0,
                box.width,
                box.height
              );
              ctx.drawImage(off, box.x, box.y);
            }
          }

          if (showBoxOutlines) {
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = 2;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
          }
        });

        // Currently dragging box
        if (currentBox && showBoxOutlines) {
          ctx.strokeStyle = '#EF4444';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h);
          ctx.setLineDash([]);
        }
      }
    },
    [
      blurMode,
      fullBlurRadius,
      fullBlurStyle,
      pixelBlockSize,
      redactBoxes,
      currentBox,
    ]
  );

  // Sync preview canvas
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    renderComposition(canvasRef.current, true);
  }, [imageUrl, renderComposition]);

  // Canvas mouse handlers for drawing redact rectangles
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: Math.round((e.clientX - rect.left) * scaleX),
      y: Math.round((e.clientY - rect.top) * scaleY),
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (blurMode !== 'selective') return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);
    setCurrentBox({ x: coords.x, y: coords.y, w: 0, h: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || blurMode !== 'selective') return;
    const coords = getCanvasCoords(e);
    const x = Math.min(drawStart.x, coords.x);
    const y = Math.min(drawStart.y, coords.y);
    const w = Math.abs(coords.x - drawStart.x);
    const h = Math.abs(coords.y - drawStart.y);
    setCurrentBox({ x, y, w, h });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentBox || blurMode !== 'selective') return;
    setIsDrawing(false);
    if (currentBox.w > 8 && currentBox.h > 8) {
      setRedactBoxes((prev) => [
        ...prev,
        {
          id: `box-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          x: currentBox.x,
          y: currentBox.y,
          width: currentBox.w,
          height: currentBox.h,
          style: redactStyle,
        },
      ]);
    }
    setDrawStart(null);
    setCurrentBox(null);
  };

  // Export & Download
  const handleDownload = async () => {
    if (!imageElementRef.current || !file) return;
    setIsProcessing(true);
    try {
      const exportCanvas = document.createElement('canvas');
      renderComposition(exportCanvas, false); // Render cleanly without green/red guidelines

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
            link.download = `${baseName}_blurred.${exportFormat}`;
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
            <EyeOff className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Upload Photo to Blur or Redact Privacy Areas
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Drag boxes over sensitive personal info (faces, licenses, credit cards, addresses) or apply smooth background blur. 100% private in-browser canvas.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 shadow-sm transition">
            <EyeOff className="w-4 h-4" />
            <span>Select Photo to Blur</span>
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
                  onClick={() => setBlurMode('selective')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    blurMode === 'selective'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Selective Redactor (Box Blur)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBlurMode('full')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    blurMode === 'full'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Full Image Blur</span>
                </button>
              </div>

              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Hidden Source Img */}
            <img
              ref={imageElementRef}
              src={imageUrl}
              alt="Source"
              className="hidden"
              crossOrigin="anonymous"
              onLoad={() => {
                if (canvasRef.current) renderComposition(canvasRef.current, true);
              }}
            />

            {/* Interactive Canvas Stage */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={`max-w-full max-h-[500px] object-contain rounded-lg shadow-lg block select-none ${
                  blurMode === 'selective' ? 'cursor-crosshair' : 'cursor-default'
                }`}
              />

              {blurMode === 'selective' && (
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur border border-slate-700 text-[11px] text-slate-300 pointer-events-none">
                  Drag rectangle boxes across faces, text, or licenses to redact
                </div>
              )}
            </div>

            {/* Redact Box List Strip */}
            {blurMode === 'selective' && redactBoxes.length > 0 && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {redactBoxes.length} Redacted Zones Active
                </span>
                <button
                  type="button"
                  onClick={() => setRedactBoxes([])}
                  className="text-rose-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All Redact Boxes</span>
                </button>
              </div>
            )}
          </div>

          {/* Configuration Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            {/* SELECTIVE REDACTOR CONTROLS */}
            {blurMode === 'selective' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-500" />
                  <span>Redaction Mask Style</span>
                </h3>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'pixelate', label: 'Mosaic Pixelate' },
                    { id: 'blur', label: 'Soft Blur' },
                    { id: 'blackout', label: 'Blackout Bar' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setRedactStyle(style.id as any)}
                      className={`p-2.5 rounded-xl text-center text-xs font-semibold transition ${
                        redactStyle === style.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    How it works:
                  </p>
                  <p>
                    1. Choose your redaction style above.
                  </p>
                  <p>
                    2. Click and drag over faces, IDs, credit card numbers, or license plates on the canvas.
                  </p>
                  <p>
                    3. Download the clean sanitized image with green guidelines removed.
                  </p>
                </div>
              </div>
            )}

            {/* FULL IMAGE BLUR CONTROLS */}
            {blurMode === 'full' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-emerald-500" />
                  <span>Full Image Blur Settings</span>
                </h3>

                <div className="flex gap-2">
                  {[
                    { id: 'gaussian', label: 'Gaussian Soft Blur' },
                    { id: 'pixelate', label: 'Mosaic Pixelate' },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setFullBlurStyle(style.id as any)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition ${
                        fullBlurStyle === style.id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>

                {fullBlurStyle === 'gaussian' ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Blur Strength Radius</span>
                      <span className="text-emerald-600 font-bold">{fullBlurRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="60"
                      value={fullBlurRadius}
                      onChange={(e) => setFullBlurRadius(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Mosaic Pixel Block Size</span>
                      <span className="text-emerald-600 font-bold">{pixelBlockSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="40"
                      value={pixelBlockSize}
                      onChange={(e) => setPixelBlockSize(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* EXPORT SETTINGS */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Export Sanitized Photo</span>
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {(['png', 'webp', 'jpeg'] as const).map((fmt) => (
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

              <button
                type="button"
                onClick={handleDownload}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Processing...'
                    : `Download Sanitized Photo (${exportFormat.toUpperCase()})`}
                </span>
              </button>
            </div>

            {/* Offline Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% On-Device Canvas Processing. No image data ever leaves your computer.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
