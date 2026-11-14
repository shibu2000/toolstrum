import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Type,
  Image as ImageIcon,
  Grid,
  RotateCw,
  Download,
  Trash2,
  Plus,
  Check,
  FileArchive,
  Layers,
  Sparkles,
  ShieldCheck,
  Sliders,
  Move,
  PenTool,
  Square,
  Circle as CircleIcon,
  ArrowRight,
  RefreshCw,
  Eye,
} from 'lucide-react';
import JSZip from 'jszip';

export interface ImageWatermarkPanelProps {
  initialToolId?: number; // 59 = Watermark, 60 = Annotator
  onClose?: () => void;
}

interface LoadedImageItem {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
}

type WatermarkType = 'text' | 'image' | 'annotate';
type Position9 =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'mid-left'
  | 'center'
  | 'mid-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'tiled';

type AnnotationTool = 'arrow' | 'rect' | 'circle' | 'pen' | 'banner';

interface DrawnShape {
  tool: AnnotationTool;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
  text?: string;
  points?: { x: number; y: number }[];
}

const PRESET_TEXTS = [
  'CONFIDENTIAL',
  'DO NOT COPY',
  'DRAFT',
  'PROOF ONLY',
  '© COPYRIGHT',
  'SAMPLE',
];

const PRESET_FONTS = [
  { id: 'sans-serif', label: 'Inter / Modern Sans' },
  { id: 'serif', label: 'Playfair / Classic Serif' },
  { id: 'monospace', label: 'JetBrains / Mono' },
  { id: 'Impact', label: 'Impact / Bold Poster' },
  { id: 'cursive', label: 'Handwritten Script' },
];

export const ImageWatermarkPanel: React.FC<ImageWatermarkPanelProps> = ({
  initialToolId = 59,
}) => {
  // Mode selection: 59 defaults to 'text', 60 defaults to 'annotate'
  const [activeMode, setActiveMode] = useState<WatermarkType>(
    initialToolId === 60 ? 'annotate' : 'text'
  );

  // File states
  const [items, setItems] = useState<LoadedImageItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<string>('');

  // Logo watermark state
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null);
  const [logoName, setLogoName] = useState<string>('');
  const [logoScale, setLogoScale] = useState<number>(25); // 10% to 100% of base image width
  const [logoOpacity, setLogoOpacity] = useState<number>(80);

  // Text watermark state
  const [wmText, setWmText] = useState<string>('CONFIDENTIAL');
  const [fontFamily, setFontFamily] = useState<string>('sans-serif');
  const [fontSize, setFontSize] = useState<number>(36);
  const [isBold, setIsBold] = useState<boolean>(true);
  const [isItalic, setIsItalic] = useState<boolean>(false);
  const [textColor, setTextColor] = useState<string>('#FFFFFF');
  const [textOpacity, setTextOpacity] = useState<number>(65);
  const [rotationAngle, setRotationAngle] = useState<number>(-30); // -90 to +90
  const [hasBackgroundBadge, setHasBackgroundBadge] = useState<boolean>(false);
  const [badgeColor, setBadgeColor] = useState<string>('#000000');
  const [badgeOpacity, setBadgeOpacity] = useState<number>(50);

  // Placement state (shared for text & logo)
  const [position, setPosition] = useState<Position9>('center');
  const [marginOffset, setMarginOffset] = useState<number>(30); // px

  // Annotation states (Tool 60)
  const [annotationTool, setAnnotationTool] = useState<AnnotationTool>('arrow');
  const [annotationColor, setAnnotationColor] = useState<string>('#EF4444'); // Red default
  const [annotationLineWidth, setAnnotationLineWidth] = useState<number>(4);
  const [bannerNote, setBannerNote] = useState<string>('VERIFIED DOCUMENT');
  const [drawnShapes, setDrawnShapes] = useState<DrawnShape[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentPenPoints, setCurrentPenPoints] = useState<{ x: number; y: number }[]>([]);

  // Export settings
  const [exportFormat, setExportFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [exportQuality, setExportQuality] = useState<number>(92);

  // Canvas ref for live rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeItem = items[selectedIndex] || null;

  // Handle image files upload
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);

    const loadedList: LoadedImageItem[] = [];
    let pending = fileList.length;

    fileList.forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        loadedList.push({
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          file,
          previewUrl: url,
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: file.size,
        });
        pending--;
        if (pending === 0) {
          setItems((prev) => [...prev, ...loadedList]);
        }
      };
      img.onerror = () => {
        pending--;
        if (pending === 0 && loadedList.length > 0) {
          setItems((prev) => [...prev, ...loadedList]);
        }
      };
      img.src = url;
    });
    e.target.value = '';
  };

  // Handle logo watermark file upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setLogoImg(img);
      setLogoName(file.name);
    };
    img.src = url;
    e.target.value = '';
  };

  // Helper to calculate (x, y) coordinates for 9-point grid
  const calculatePositionCoords = (
    pos: Position9,
    contentW: number,
    contentH: number,
    canvasW: number,
    canvasH: number,
    margin: number
  ): { x: number; y: number } => {
    switch (pos) {
      case 'top-left':
        return { x: margin + contentW / 2, y: margin + contentH / 2 };
      case 'top-center':
        return { x: canvasW / 2, y: margin + contentH / 2 };
      case 'top-right':
        return { x: canvasW - margin - contentW / 2, y: margin + contentH / 2 };
      case 'mid-left':
        return { x: margin + contentW / 2, y: canvasH / 2 };
      case 'center':
        return { x: canvasW / 2, y: canvasH / 2 };
      case 'mid-right':
        return { x: canvasW - margin - contentW / 2, y: canvasH / 2 };
      case 'bottom-left':
        return { x: margin + contentW / 2, y: canvasH - margin - contentH / 2 };
      case 'bottom-center':
        return { x: canvasW / 2, y: canvasH - margin - contentH / 2 };
      case 'bottom-right':
      default:
        return { x: canvasW - margin - contentW / 2, y: canvasH - margin - contentH / 2 };
    }
  };

  // Render the current composition onto a canvas
  const renderComposition = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      targetImage: HTMLImageElement,
      width: number,
      height: number
    ) => {
      // 1. Draw base photo
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(targetImage, 0, 0, width, height);

      // 2. Render Text Watermark
      if (activeMode === 'text' && wmText.trim()) {
        ctx.save();
        const fontStyle = isItalic ? 'italic ' : '';
        const fontWeight = isBold ? 'bold ' : '';
        ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${fontFamily}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const metrics = ctx.measureText(wmText);
        const textW = metrics.width;
        const textH = fontSize * 1.2;

        if (position === 'tiled') {
          // Tiled repeating diagonal watermark across entire image
          ctx.globalAlpha = textOpacity / 100;
          const stepX = Math.max(textW * 1.6, 180);
          const stepY = Math.max(textH * 3.2, 140);
          const rad = (rotationAngle * Math.PI) / 180;

          for (let y = -height; y < height * 2; y += stepY) {
            for (let x = -width; x < width * 2; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(rad);
              if (hasBackgroundBadge) {
                ctx.fillStyle = badgeColor;
                ctx.globalAlpha = (textOpacity / 100) * (badgeOpacity / 100);
                ctx.fillRect(-textW / 2 - 8, -textH / 2 - 4, textW + 16, textH + 8);
                ctx.fillStyle = textColor;
                ctx.globalAlpha = textOpacity / 100;
              }
              ctx.fillText(wmText, 0, 0);
              ctx.restore();
            }
          }
        } else {
          // Single positioned watermark
          const coords = calculatePositionCoords(
            position,
            textW,
            textH,
            width,
            height,
            marginOffset
          );
          ctx.translate(coords.x, coords.y);
          ctx.rotate((rotationAngle * Math.PI) / 180);

          if (hasBackgroundBadge) {
            ctx.fillStyle = badgeColor;
            ctx.globalAlpha = (badgeOpacity / 100) * (textOpacity / 100);
            ctx.fillRect(-textW / 2 - 12, -textH / 2 - 6, textW + 24, textH + 12);
          }

          ctx.fillStyle = textColor;
          ctx.globalAlpha = textOpacity / 100;
          ctx.fillText(wmText, 0, 0);
        }
        ctx.restore();
      }

      // 3. Render Logo Watermark
      if (activeMode === 'image' && logoImg) {
        ctx.save();
        ctx.globalAlpha = logoOpacity / 100;
        const targetLogoW = (width * logoScale) / 100;
        const targetLogoH = targetLogoW * (logoImg.naturalHeight / logoImg.naturalWidth);

        if (position === 'tiled') {
          const stepX = targetLogoW * 1.8;
          const stepY = targetLogoH * 1.8;
          for (let y = 0; y < height; y += stepY) {
            for (let x = 0; x < width; x += stepX) {
              ctx.drawImage(logoImg, x, y, targetLogoW, targetLogoH);
            }
          }
        } else {
          const coords = calculatePositionCoords(
            position,
            targetLogoW,
            targetLogoH,
            width,
            height,
            marginOffset
          );
          ctx.drawImage(
            logoImg,
            coords.x - targetLogoW / 2,
            coords.y - targetLogoH / 2,
            targetLogoW,
            targetLogoH
          );
        }
        ctx.restore();
      }

      // 4. Render Annotations & Shapes (Tool 60)
      if (drawnShapes.length > 0 || (activeMode === 'annotate' && bannerNote.trim())) {
        ctx.save();

        // Drawn shapes
        drawnShapes.forEach((shape) => {
          ctx.strokeStyle = shape.color;
          ctx.fillStyle = shape.color;
          ctx.lineWidth = shape.lineWidth;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          if (shape.tool === 'pen' && shape.points && shape.points.length > 1) {
            ctx.beginPath();
            ctx.moveTo(shape.points[0].x, shape.points[0].y);
            for (let i = 1; i < shape.points.length; i++) {
              ctx.lineTo(shape.points[i].x, shape.points[i].y);
            }
            ctx.stroke();
          } else if (shape.tool === 'rect') {
            const rx = Math.min(shape.startX, shape.endX);
            const ry = Math.min(shape.startY, shape.endY);
            const rw = Math.abs(shape.endX - shape.startX);
            const rh = Math.abs(shape.endY - shape.startY);
            ctx.strokeRect(rx, ry, rw, rh);
          } else if (shape.tool === 'circle') {
            const cx = (shape.startX + shape.endX) / 2;
            const cy = (shape.startY + shape.endY) / 2;
            const rx = Math.abs(shape.endX - shape.startX) / 2;
            const ry = Math.abs(shape.endY - shape.startY) / 2;
            ctx.beginPath();
            ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.stroke();
          } else if (shape.tool === 'arrow') {
            const headlen = 16;
            const dx = shape.endX - shape.startX;
            const dy = shape.endY - shape.startY;
            const angle = Math.atan2(dy, dx);
            ctx.beginPath();
            ctx.moveTo(shape.startX, shape.startY);
            ctx.lineTo(shape.endX, shape.endY);
            ctx.stroke();

            // Arrow head
            ctx.beginPath();
            ctx.moveTo(shape.endX, shape.endY);
            ctx.lineTo(
              shape.endX - headlen * Math.cos(angle - Math.PI / 6),
              shape.endY - headlen * Math.sin(angle - Math.PI / 6)
            );
            ctx.lineTo(
              shape.endX - headlen * Math.cos(angle + Math.PI / 6),
              shape.endY - headlen * Math.sin(angle + Math.PI / 6)
            );
            ctx.closePath();
            ctx.fill();
          }
        });

        // Banner Callout Note
        if (activeMode === 'annotate' && bannerNote.trim()) {
          const bannerH = 44;
          ctx.fillStyle = '#0F172A';
          ctx.globalAlpha = 0.88;
          ctx.fillRect(0, height - bannerH, width, bannerH);
          ctx.fillStyle = '#10B981';
          ctx.fillRect(0, height - bannerH, 6, bannerH);

          ctx.globalAlpha = 1.0;
          ctx.font = 'bold 16px sans-serif';
          ctx.fillStyle = '#F8FAFC';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(`📌 ${bannerNote}`, 20, height - bannerH / 2);
        }

        ctx.restore();
      }
    },
    [
      activeMode,
      wmText,
      fontFamily,
      fontSize,
      isBold,
      isItalic,
      textColor,
      textOpacity,
      rotationAngle,
      hasBackgroundBadge,
      badgeColor,
      badgeOpacity,
      position,
      marginOffset,
      logoImg,
      logoScale,
      logoOpacity,
      drawnShapes,
      bannerNote,
    ]
  );

  // Live Canvas sync when parameters or active item change
  useEffect(() => {
    if (!activeItem || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = activeItem.width;
      canvas.height = activeItem.height;
      renderComposition(ctx, img, activeItem.width, activeItem.height);
    };
    img.src = activeItem.previewUrl;
  }, [activeItem, renderComposition]);

  // Canvas Mouse / Touch events for Interactive Annotator (Tool 60)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeMode !== 'annotate') return;
    const coords = getCanvasCoords(e);
    setIsDrawing(true);
    setDrawStart(coords);
    if (annotationTool === 'pen') {
      setCurrentPenPoints([coords]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || activeMode !== 'annotate') return;
    const coords = getCanvasCoords(e);
    if (annotationTool === 'pen') {
      setCurrentPenPoints((prev) => [...prev, coords]);
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !drawStart || activeMode !== 'annotate') return;
    const coords = getCanvasCoords(e);
    setIsDrawing(false);

    if (annotationTool === 'pen') {
      if (currentPenPoints.length > 1) {
        setDrawnShapes((prev) => [
          ...prev,
          {
            tool: 'pen',
            startX: drawStart.x,
            startY: drawStart.y,
            endX: coords.x,
            endY: coords.y,
            color: annotationColor,
            lineWidth: annotationLineWidth,
            points: currentPenPoints,
          },
        ]);
      }
      setCurrentPenPoints([]);
    } else {
      setDrawnShapes((prev) => [
        ...prev,
        {
          tool: annotationTool,
          startX: drawStart.x,
          startY: drawStart.y,
          endX: coords.x,
          endY: coords.y,
          color: annotationColor,
          lineWidth: annotationLineWidth,
        },
      ]);
    }
    setDrawStart(null);
  };

  // Export single item
  const exportImage = async (
    item: LoadedImageItem
  ): Promise<{ blob: Blob; filename: string }> => {
    return new Promise((resolve, reject) => {
      const offCanvas = document.createElement('canvas');
      offCanvas.width = item.width;
      offCanvas.height = item.height;
      const ctx = offCanvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context unavailable'));

      const img = new Image();
      img.onload = () => {
        renderComposition(ctx, img, item.width, item.height);
        const mime =
          exportFormat === 'png'
            ? 'image/png'
            : exportFormat === 'webp'
            ? 'image/webp'
            : 'image/jpeg';
        const quality = exportFormat === 'png' ? undefined : exportQuality / 100;
        offCanvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = item.name.replace(/\.[^/.]+$/, '');
              const suffix = activeMode === 'annotate' ? '_annotated' : '_watermarked';
              resolve({
                blob,
                filename: `${baseName}${suffix}.${exportFormat}`,
              });
            } else {
              reject(new Error('Export blob failed'));
            }
          },
          mime,
          quality
        );
      };
      img.onerror = () => reject(new Error('Failed to load image for export'));
      img.src = item.previewUrl;
    });
  };

  // Download currently active image
  const handleDownloadActive = async () => {
    if (!activeItem) return;
    setIsProcessing(true);
    try {
      const { blob, filename } = await exportImage(activeItem);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download all images as ZIP
  const handleDownloadAllZip = async () => {
    if (items.length === 0) return;
    setIsProcessing(true);
    setProcessingProgress('Packaging Watermarked ZIP...');
    try {
      const zip = new JSZip();
      for (let i = 0; i < items.length; i++) {
        setProcessingProgress(`Processing image ${i + 1} of ${items.length}...`);
        const { blob, filename } = await exportImage(items[i]);
        zip.file(filename, blob);
      }
      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const link = document.createElement('a');
      link.href = url;
      link.download = `toolstrum_watermarked_batch_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProcessingProgress('');
    }
  };

  const removeImageItem = (index: number) => {
    URL.revokeObjectURL(items[index].previewUrl);
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (selectedIndex >= items.length - 1) {
      setSelectedIndex(Math.max(0, items.length - 2));
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Dropzone */}
      {items.length === 0 ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-900/60 shadow-xs hover:border-emerald-500 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {initialToolId === 60
              ? 'Upload Images to Annotate & Mark Up'
              : 'Upload Images to Watermark'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Supports batch processing of PNG, JPG, WebP, SVG, and AVIF photos. Zero cloud upload — 100% private in-browser canvas.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 shadow-sm transition">
            <Plus className="w-4 h-4" />
            <span>Select Photos from Computer</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Interactive Stage (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveMode('text')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMode === 'text'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text Watermark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('image')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMode === 'image'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Logo Watermark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('annotate')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMode === 'annotate'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>Annotator & Pen</span>
                </button>
              </div>

              {/* Add more files button */}
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition">
                <Plus className="w-3.5 h-3.5" />
                <span>Add Photos</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFilesUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Canvas Preview Area */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[420px] overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                className={`max-w-full max-h-[520px] object-contain rounded shadow-lg ${
                  activeMode === 'annotate' ? 'cursor-crosshair' : 'cursor-default'
                }`}
              />

              {activeMode === 'annotate' && (
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur border border-slate-700 text-[11px] text-slate-300 pointer-events-none">
                  Click and drag on canvas to draw {annotationTool}
                </div>
              )}
            </div>

            {/* Batch Thumbnail Queue Strip */}
            {items.length > 1 && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Batch Queue ({items.length} images)</span>
                  <span className="text-slate-400">Settings apply across entire batch</span>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedIndex(idx)}
                      className={`group relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
                        selectedIndex === idx
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'
                      }`}
                    >
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImageItem(idx);
                        }}
                        className="absolute top-1 right-1 p-1 rounded-md bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 hover:bg-rose-600 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[9px] text-slate-200 px-1 py-0.5 truncate text-center">
                        {item.width}×{item.height}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            {/* MODE 1: TEXT WATERMARK SETTINGS */}
            {activeMode === 'text' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" />
                    <span>Watermark Text & Typography</span>
                  </h3>
                </div>

                {/* Text Input & Quick Presets */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Watermark Text
                  </label>
                  <input
                    type="text"
                    value={wmText}
                    onChange={(e) => setWmText(e.target.value)}
                    placeholder="e.g. CONFIDENTIAL"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                  {/* Preset Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {PRESET_TEXTS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setWmText(preset)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition ${
                          wmText === preset
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family & Size */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Font Family
                    </label>
                    <select
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium outline-none cursor-pointer"
                    >
                      {PRESET_FONTS.map((font) => (
                        <option key={font.id} value={font.id}>
                          {font.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Size</span>
                      <span className="text-emerald-600">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="14"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Styles: Bold, Italic, Color, Opacity */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Color & Opacity
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent p-0"
                      />
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400 uppercase">
                        {textColor}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Opacity</span>
                      <span className="text-emerald-600">{textOpacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={textOpacity}
                      onChange={(e) => setTextOpacity(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Rotation Angle */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rotation Angle</span>
                    </span>
                    <span className="text-emerald-600">{rotationAngle}°</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={rotationAngle}
                      onChange={(e) => setRotationAngle(Number(e.target.value))}
                      className="flex-1 accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex gap-1">
                      {[-45, -30, 0, 45].map((angle) => (
                        <button
                          key={angle}
                          type="button"
                          onClick={() => setRotationAngle(angle)}
                          className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                            rotationAngle === angle
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {angle}°
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Optional Background Badge */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasBackgroundBadge}
                      onChange={(e) => setHasBackgroundBadge(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Add highlight badge box behind text
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* MODE 2: LOGO WATERMARK SETTINGS */}
            {activeMode === 'image' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-500" />
                    <span>Logo & Image Watermark</span>
                  </h3>
                </div>

                {/* Logo Upload Box */}
                <div className="p-4 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-center relative">
                  <input
                    type="file"
                    accept="image/png,image/webp,image/svg+xml,image/jpeg"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {logoImg ? (
                    <div className="flex items-center justify-center gap-3">
                      <img
                        src={logoImg.src}
                        alt="Watermark Logo"
                        className="w-12 h-12 object-contain bg-slate-200 dark:bg-slate-700 rounded-lg p-1"
                      />
                      <div className="text-left">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {logoName || 'Logo Image'}
                        </p>
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400">
                          Click to replace logo
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-2">
                      <ImageIcon className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                        Upload Brand Logo (PNG with transparency recommended)
                      </p>
                    </div>
                  )}
                </div>

                {/* Logo Scale */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Logo Scale</span>
                    <span className="text-emerald-600">{logoScale}% of image</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="80"
                    value={logoScale}
                    onChange={(e) => setLogoScale(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Logo Opacity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Logo Transparency</span>
                    <span className="text-emerald-600">{logoOpacity}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={logoOpacity}
                    onChange={(e) => setLogoOpacity(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* PLACEMENT & POSITION (Used for Text & Logo) */}
            {activeMode !== 'annotate' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Grid className="w-4 h-4 text-emerald-500" />
                  <span>Placement & Pattern</span>
                </h3>

                {/* 9-Box Anchor Grid */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Anchor Position
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    {(
                      [
                        'top-left',
                        'top-center',
                        'top-right',
                        'mid-left',
                        'center',
                        'mid-right',
                        'bottom-left',
                        'bottom-center',
                        'bottom-right',
                      ] as Position9[]
                    ).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setPosition(pos)}
                        className={`h-8 rounded-lg flex items-center justify-center transition ${
                          position === pos
                            ? 'bg-emerald-600 text-white font-bold shadow-xs'
                            : 'bg-white dark:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white'
                        }`}
                        title={pos}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${
                            position === pos ? 'bg-white' : 'bg-slate-300 dark:bg-slate-500'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Tiled Repeating Pattern Button */}
                  <button
                    type="button"
                    onClick={() => setPosition('tiled')}
                    className={`w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition ${
                      position === 'tiled'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Tiled Full-Image Grid (Stock Photo Protection)</span>
                  </button>
                </div>

                {position !== 'tiled' && (
                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Edge Padding Margin</span>
                      <span className="text-emerald-600">{marginOffset}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="120"
                      value={marginOffset}
                      onChange={(e) => setMarginOffset(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            )}

            {/* MODE 3: ANNOTATOR TOOLS (Tool 60) */}
            {activeMode === 'annotate' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <PenTool className="w-4 h-4 text-emerald-500" />
                    <span>Annotation Tools & Shapes</span>
                  </h3>
                  {drawnShapes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setDrawnShapes([])}
                      className="text-[11px] font-semibold text-rose-600 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All ({drawnShapes.length})</span>
                    </button>
                  )}
                </div>

                {/* Tool Selector */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'arrow', label: 'Arrow', icon: ArrowRight },
                    { id: 'rect', label: 'Box', icon: Square },
                    { id: 'circle', label: 'Circle', icon: CircleIcon },
                    { id: 'pen', label: 'Draw', icon: PenTool },
                  ].map((t) => {
                    const IconComp = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setAnnotationTool(t.id as any)}
                        className={`p-2.5 rounded-xl flex flex-col items-center gap-1 text-xs font-semibold transition ${
                          annotationTool === t.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Color & Line Width */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Stroke Color
                    </label>
                    <div className="flex items-center gap-2">
                      {['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#FFFFFF'].map((hex) => (
                        <button
                          key={hex}
                          type="button"
                          onClick={() => setAnnotationColor(hex)}
                          style={{ backgroundColor: hex }}
                          className={`w-6 h-6 rounded-full border-2 transition ${
                            annotationColor === hex ? 'border-slate-900 ring-2 ring-emerald-500' : 'border-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Width</span>
                      <span className="text-emerald-600">{annotationLineWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      value={annotationLineWidth}
                      onChange={(e) => setAnnotationLineWidth(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Footer Banner Callout Note */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Footer Callout Banner Note
                  </label>
                  <input
                    type="text"
                    value={bannerNote}
                    onChange={(e) => setBannerNote(e.target.value)}
                    placeholder="e.g. APPROVED ON 2026-11-14"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium outline-none"
                  />
                </div>
              </div>
            )}

            {/* EXPORT & ACTION CARD */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Export Settings</span>
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

              {exportFormat !== 'png' && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>Quality</span>
                    <span className="text-emerald-600">{exportQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={exportQuality}
                    onChange={(e) => setExportQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadActive}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download This Photo ({exportFormat.toUpperCase()})</span>
                </button>

                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={handleDownloadAllZip}
                    disabled={isProcessing}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <FileArchive className="w-4 h-4 text-emerald-500" />
                    <span>Download All as Batch ZIP ({items.length} Images)</span>
                  </button>
                )}
              </div>

              {processingProgress && (
                <p className="text-center text-xs font-semibold text-emerald-600 animate-pulse">
                  {processingProgress}
                </p>
              )}
            </div>

            {/* Offline Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% Offline Processing. Your photos never leave this computer.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
