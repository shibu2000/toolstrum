import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PDFDocument } from 'pdf-lib';
import {
  Image as ImageIcon,
  Crop as CropIcon,
  Minimize2,
  Maximize2,
  RefreshCw,
  Sliders,
  Download,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  Check,
  ShieldCheck,
  Trash2,
  Move,
  FileText,
  Type,
  Smile,
  Palette,
  Eye,
  Scissors,
  Plus,
  Copy,
} from 'lucide-react';
import JSZip from 'jszip';
import { FileDropZone } from '../components/common/FileDropZone';
import { getToolById } from '../data/webRegistry';

interface ImageWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export type ImageToolMode =
  | 'crop'
  | 'pdf'
  | 'compress'
  | 'resize'
  | 'convert'
  | 'rotate'
  | 'filter'
  | 'watermark'
  | 'meme'
  | 'bg_remove'
  | 'bg_change'
  | 'blur'
  | 'metadata'
  | 'favicon'
  | 'passport'
  | 'palette'
  | 'stitch'
  | 'pdf_to_image';

type CropRatioType = 'free' | '1:1' | '4:5' | '16:9' | '9:16' | '4:3' | '3:2' | 'passport';
type DragHandleType = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e' | 'create';

// Helper to reliably convert any image (JPG, PNG, WebP, SVG, AVIF) to clean JPEG bytes for pdf-lib
const imageToJpegBytes = async (fileOrUrl: File | string): Promise<{ bytes: Uint8Array; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        async (blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image bytes'));
            return;
          }
          const buf = await blob.arrayBuffer();
          resolve({
            bytes: new Uint8Array(buf),
            width: canvas.width,
            height: canvas.height,
          });
        },
        'image/jpeg',
        0.95
      );
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      img.src = URL.createObjectURL(fileOrUrl);
    }
  });
};

export const ImageWorkspace: React.FC<ImageWorkspaceProps> = ({
  toolId,
  accentColor = '#10B981',
}) => {
  // Determine mode based on toolId:
  const getInitialMode = (id: number): ImageToolMode => {
    if (id === 55) return 'pdf';
    if (id === 56) return 'pdf_to_image';
    if (id === 51) return 'crop';
    if (id === 50) return 'resize';
    if (id === 52) return 'rotate';
    if (id === 53 || id === 54) return 'convert';
    if (id === 57 || id === 72) return 'bg_remove';
    if (id === 58) return 'bg_change';
    if (id === 59 || id === 60) return 'watermark';
    if (id === 61 || id === 62 || id === 63 || id === 80) return 'stitch';
    if (id === 64 || id === 78) return 'palette';
    if (id === 68) return 'blur';
    if (id === 69 || id === 70 || id === 71) return 'metadata';
    if (id === 73) return 'favicon';
    if (id === 74) return 'crop';
    if (id === 75 || id === 76) return 'passport';
    if (id === 77) return 'meme';
    if (id === 66) return 'resize';
    if (id >= 65 && id <= 67) return 'filter';
    if (id === 79) return 'filter';
    if (id >= 81 && id <= 84) return 'convert';
    if (id === 85) return 'compress';
    return 'compress';
  };

  const [activeTab, setActiveTab] = useState<ImageToolMode>(() => getInitialMode(toolId));

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1);

  // Additional files (for Image to PDF or Stitching)
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);

  // Refs for element interaction
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // ==========================================
  // TAB 1: CROP STATE & DRAGGING (Tool 51)
  // ==========================================
  const [cropRatio, setCropRatio] = useState<CropRatioType>('1:1');
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropWidth, setCropWidth] = useState(0);
  const [cropHeight, setCropHeight] = useState(0);

  // Active cursor drag state
  const [activeDragHandle, setActiveDragHandle] = useState<DragHandleType | null>(null);
  const dragStartRef = useRef<{
    handle: DragHandleType;
    startX: number;
    startY: number;
    initialCropX: number;
    initialCropY: number;
    initialCropW: number;
    initialCropH: number;
    imageRect: DOMRect;
  } | null>(null);

  const getRatioMultiplier = useCallback((r: CropRatioType): number | null => {
    if (r === '1:1') return 1;
    if (r === '4:5') return 4 / 5;
    if (r === '16:9') return 16 / 9;
    if (r === '9:16') return 9 / 16;
    if (r === '4:3') return 4 / 3;
    if (r === '3:2') return 3 / 2;
    if (r === 'passport') return 7 / 9;
    return null;
  }, []);

  const applyCropRatio = (ratio: CropRatioType, origW = originalWidth, origH = originalHeight) => {
    setCropRatio(ratio);
    if (!origW || !origH) return;

    let targetW = origW;
    let targetH = origH;

    const mult = getRatioMultiplier(ratio);
    if (mult) {
      if (origW / origH > mult) {
        targetH = origH;
        targetW = Math.round(origH * mult);
      } else {
        targetW = origW;
        targetH = Math.round(origW / mult);
      }
    } else {
      targetW = Math.round(origW * 0.85);
      targetH = Math.round(origH * 0.85);
    }

    targetW = Math.min(targetW, origW);
    targetH = Math.min(targetH, origH);
    const newX = Math.round((origW - targetW) / 2);
    const newY = Math.round((origH - targetH) / 2);

    setCropWidth(targetW);
    setCropHeight(targetH);
    setCropX(newX);
    setCropY(newY);
  };

  const handleCenterCrop = () => {
    setCropX(Math.max(0, Math.round((originalWidth - cropWidth) / 2)));
    setCropY(Math.max(0, Math.round((originalHeight - cropHeight) / 2)));
  };

  const startDrag = (handle: DragHandleType, clientX: number, clientY: number) => {
    if (!imageElementRef.current || !originalWidth || !originalHeight) return;
    const rect = imageElementRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    setActiveDragHandle(handle);

    if (handle === 'create') {
      const scaleX = originalWidth / rect.width;
      const scaleY = originalHeight / rect.height;
      const clickX = Math.max(0, Math.min(originalWidth, (clientX - rect.left) * scaleX));
      const clickY = Math.max(0, Math.min(originalHeight, (clientY - rect.top) * scaleY));

      dragStartRef.current = {
        handle,
        startX: clientX,
        startY: clientY,
        initialCropX: clickX,
        initialCropY: clickY,
        initialCropW: 0,
        initialCropH: 0,
        imageRect: rect,
      };
      setCropX(Math.round(clickX));
      setCropY(Math.round(clickY));
      setCropWidth(10);
      setCropHeight(10);
      return;
    }

    dragStartRef.current = {
      handle,
      startX: clientX,
      startY: clientY,
      initialCropX: cropX,
      initialCropY: cropY,
      initialCropW: cropWidth,
      initialCropH: cropHeight,
      imageRect: rect,
    };
  };

  const onDragMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragStartRef.current || !originalWidth || !originalHeight) return;
      const { handle, startX, startY, initialCropX, initialCropY, initialCropW, initialCropH, imageRect } =
        dragStartRef.current;

      const scaleX = originalWidth / imageRect.width;
      const scaleY = originalHeight / imageRect.height;
      const deltaX = (clientX - startX) * scaleX;
      const deltaY = (clientY - startY) * scaleY;

      const mult = getRatioMultiplier(cropRatio);

      if (handle === 'create') {
        const currentImgX = Math.max(0, Math.min(originalWidth, (clientX - imageRect.left) * scaleX));
        const currentImgY = Math.max(0, Math.min(originalHeight, (clientY - imageRect.top) * scaleY));

        let x1 = Math.min(initialCropX, currentImgX);
        let x2 = Math.max(initialCropX, currentImgX);
        let y1 = Math.min(initialCropY, currentImgY);
        let y2 = Math.max(initialCropY, currentImgY);

        let w = x2 - x1;
        let h = y2 - y1;

        if (mult) {
          if (w / Math.max(1, h) > mult) {
            h = Math.round(w / mult);
          } else {
            w = Math.round(h * mult);
          }
        }

        w = Math.max(10, Math.min(originalWidth - x1, w));
        h = Math.max(10, Math.min(originalHeight - y1, h));

        setCropX(Math.round(x1));
        setCropY(Math.round(y1));
        setCropWidth(Math.round(w));
        setCropHeight(Math.round(h));
        return;
      }

      if (handle === 'move') {
        let newX = initialCropX + deltaX;
        let newY = initialCropY + deltaY;
        newX = Math.max(0, Math.min(originalWidth - initialCropW, newX));
        newY = Math.max(0, Math.min(originalHeight - initialCropH, newY));
        setCropX(Math.round(newX));
        setCropY(Math.round(newY));
        return;
      }

      let newX = initialCropX;
      let newY = initialCropY;
      let newW = initialCropW;
      let newH = initialCropH;

      if (handle === 'se') {
        newW = Math.max(10, initialCropW + deltaX);
        newH = mult ? newW / mult : Math.max(10, initialCropH + deltaY);
      } else if (handle === 'sw') {
        newW = Math.max(10, initialCropW - deltaX);
        newH = mult ? newW / mult : Math.max(10, initialCropH + deltaY);
        newX = initialCropX + (initialCropW - newW);
      } else if (handle === 'ne') {
        newW = Math.max(10, initialCropW + deltaX);
        newH = mult ? newW / mult : Math.max(10, initialCropH - deltaY);
        newY = initialCropY + (initialCropH - newH);
      } else if (handle === 'nw') {
        newW = Math.max(10, initialCropW - deltaX);
        newH = mult ? newW / mult : Math.max(10, initialCropH - deltaY);
        newX = initialCropX + (initialCropW - newW);
        newY = initialCropY + (initialCropH - newH);
      } else if (handle === 'e') {
        newW = Math.max(10, initialCropW + deltaX);
        if (mult) newH = newW / mult;
      } else if (handle === 'w') {
        newW = Math.max(10, initialCropW - deltaX);
        newX = initialCropX + (initialCropW - newW);
        if (mult) newH = newW / mult;
      } else if (handle === 's') {
        newH = Math.max(10, initialCropH + deltaY);
        if (mult) newW = newH * mult;
      } else if (handle === 'n') {
        newH = Math.max(10, initialCropH - deltaY);
        newY = initialCropY + (initialCropH - newH);
        if (mult) newW = newH * mult;
      }

      if (newX < 0) {
        newW += newX;
        newX = 0;
      }
      if (newY < 0) {
        newH += newY;
        newY = 0;
      }
      if (newX + newW > originalWidth) {
        newW = originalWidth - newX;
      }
      if (newY + newH > originalHeight) {
        newH = originalHeight - newY;
      }

      setCropX(Math.round(Math.max(0, newX)));
      setCropY(Math.round(Math.max(0, newY)));
      setCropWidth(Math.round(Math.max(10, newW)));
      setCropHeight(Math.round(Math.max(10, newH)));
    },
    [originalWidth, originalHeight, cropRatio, getRatioMultiplier]
  );

  useEffect(() => {
    if (!activeDragHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      onDragMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        onDragMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => {
      setActiveDragHandle(null);
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [activeDragHandle, onDragMove]);

  // ==========================================
  // TAB 2: COMPRESS STATE
  // ==========================================
  const [compressQuality, setCompressQuality] = useState(0.75);
  const [compressPreset, setCompressPreset] = useState<'high' | 'balanced' | 'max'>('balanced');

  const handleSelectCompressPreset = (preset: 'high' | 'balanced' | 'max') => {
    setCompressPreset(preset);
    if (preset === 'high') setCompressQuality(0.9);
    else if (preset === 'balanced') setCompressQuality(0.7);
    else if (preset === 'max') setCompressQuality(0.4);
  };

  // ==========================================
  // TAB 3: RESIZE STATE
  // ==========================================
  const [resizeWidth, setResizeWidth] = useState(0);
  const [resizeHeight, setResizeHeight] = useState(0);
  const [keepAspect, setKeepAspect] = useState(true);

  const handleWidthChange = (val: number) => {
    setResizeWidth(val);
    if (keepAspect && aspectRatio) {
      setResizeHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setResizeHeight(val);
    if (keepAspect && aspectRatio) {
      setResizeWidth(Math.round(val * aspectRatio));
    }
  };

  const applyPercentScale = (pct: number) => {
    const factor = pct / 100;
    setResizeWidth(Math.round(originalWidth * factor));
    setResizeHeight(Math.round(originalHeight * factor));
  };

  // ==========================================
  // TAB 4: CONVERT STATE
  // ==========================================
  const [targetFormat, setTargetFormat] = useState<'image/webp' | 'image/jpeg' | 'image/png'>('image/webp');

  // ==========================================
  // TAB 5: ROTATE & FLIP STATE
  // ==========================================
  const [rotation, setRotation] = useState<number>(0);
  const [isFlippedH, setIsFlippedH] = useState<boolean>(false);

  // ==========================================
  // TAB 6: FILTERS STATE
  // ==========================================
  const [brightness, setBrightness] = useState<number>(100);
  const [contrast, setContrast] = useState<number>(100);
  const [grayscale, setGrayscale] = useState<number>(0);
  const [sepia, setSepia] = useState<number>(0);

  // ==========================================
  // TAB 7: IMAGE TO PDF STATE (Tool 55)
  // ==========================================
  const [pdfPageSize, setPdfPageSize] = useState<'fit' | 'a4' | 'letter'>('fit');
  const [pdfOrientation, setPdfOrientation] = useState<'auto' | 'portrait' | 'landscape'>('auto');
  const [pdfMargin, setPdfMargin] = useState<'none' | 'small' | 'normal'>('none');

  // ==========================================
  // TAB 8: WATERMARK STATE (Tool 59)
  // ==========================================
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [watermarkPos, setWatermarkPos] = useState<'center' | 'bottom-right' | 'top-left' | 'diagonal'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState(0.5);
  const [watermarkSize, setWatermarkSize] = useState(32);
  const [watermarkColor, setWatermarkColor] = useState('#FFFFFF');

  // ==========================================
  // TAB 9: MEME GENERATOR (Tool 77)
  // ==========================================
  const [memeTopText, setMemeTopText] = useState('TOP CAPTION');
  const [memeBottomText, setMemeBottomText] = useState('BOTTOM CAPTION');
  const [memeFontSize, setMemeFontSize] = useState(38);

  // ==========================================
  // TAB 10: BACKGROUND REMOVER (Tool 57, 72)
  // ==========================================
  const [bgTolerance, setBgTolerance] = useState(30);
  const [bgReplaceColor, setBgReplaceColor] = useState('#625BFF');

  // ==========================================
  // TAB 11: BACKGROUND CHANGER (Tool 58)
  // ==========================================
  const [backdropColor, setBackdropColor] = useState('#0F172A');
  const [backdropPadding, setBackdropPadding] = useState(30);

  // ==========================================
  // TAB 12: BLUR & PRIVACY (Tool 68)
  // ==========================================
  const [blurRadius, setBlurRadius] = useState(12);

  // ==========================================
  // TAB 13: PASSPORT PHOTO (Tool 75, 76)
  // ==========================================
  const [passportPreset, setPassportPreset] = useState<'2x2' | '35x45'>('2x2');
  const [passportLayout, setPassportLayout] = useState<'single' | 'sheet6'>('sheet6');

  // ==========================================
  // TAB 14: COLOR PALETTE (Tool 78, 64)
  // ==========================================
  const [extractedPalette, setExtractedPalette] = useState<string[]>([]);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // ==========================================
  // OUTPUT & PROCESSING STATE
  // ==========================================
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedWidth, setProcessedWidth] = useState(0);
  const [processedHeight, setProcessedHeight] = useState(0);
  const [downloadFilename, setDownloadFilename] = useState('');
  const [pdfPageCount, setPdfPageCount] = useState(1);

  // Sync tab on toolId change
  useEffect(() => {
    setActiveTab(getInitialMode(toolId));
    setHasProcessed(false);
    setProcessedBlob(null);
    setProcessedUrl(null);
  }, [toolId]);

  // Extract color palette when image is loaded
  const extractPaletteFromImage = (img: HTMLImageElement) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, 64, 64);
      const imgData = ctx.getImageData(0, 0, 64, 64).data;
      const colors: { [hex: string]: number } = {};

      for (let i = 0; i < imgData.length; i += 16) {
        const r = Math.round(imgData[i] / 32) * 32;
        const g = Math.round(imgData[i + 1] / 32) * 32;
        const b = Math.round(imgData[i + 2] / 32) * 32;
        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
        colors[hex] = (colors[hex] || 0) + 1;
      }

      const sorted = Object.entries(colors)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([hex]) => hex);
      setExtractedPalette(sorted.length ? sorted : ['#10B981', '#3B82F6', '#6366F1', '#EC4899', '#F59E0B', '#111827']);
    } catch {
      // Ignore cross-origin error
    }
  };

  // Handle image upload
  const handleFileChange = (files: File[]) => {
    const selected = files[0];
    if (!selected) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);

    const url = URL.createObjectURL(selected);
    const img = new Image();
    img.onload = () => {
      setFile(selected);
      setPreviewUrl(url);
      setOriginalWidth(img.naturalWidth);
      setOriginalHeight(img.naturalHeight);
      setResizeWidth(img.naturalWidth);
      setResizeHeight(img.naturalHeight);
      setAspectRatio(img.naturalWidth / img.naturalHeight);

      // Initialize crop box to 1:1 square centered
      applyCropRatio('1:1', img.naturalWidth, img.naturalHeight);
      extractPaletteFromImage(img);

      // Reset output state
      setHasProcessed(false);
      setProcessedBlob(null);
      setProcessedUrl(null);
    };
    img.src = url;
  };

  const handleAddMoreFiles = (files: File[]) => {
    setAdditionalFiles((prev) => [...prev, ...files]);
  };

  // ==========================================
  // PDF PAGE TO IMAGE (Tool 56)
  // ==========================================
  const [pdfToImageFile, setPdfToImageFile] = useState<File | null>(null);
  const [pdfToImagePages, setPdfToImagePages] = useState<{ pageNumber: number; url: string; blob: Blob }[]>([]);
  const [isRenderingPdfPages, setIsRenderingPdfPages] = useState(false);
  const [pdfRenderFormat, setPdfRenderFormat] = useState<'png' | 'jpeg'>('png');
  const [pdfToImageError, setPdfToImageError] = useState('');

  const handleRenderPdfToImages = async (pdfFile: File) => {
    setPdfToImageFile(pdfFile);
    setPdfToImagePages([]);
    setPdfToImageError('');
    setIsRenderingPdfPages(true);
    try {
      const { renderPdfPagesToImages } = await import('../utils/pdfRender');
      const pages = await renderPdfPagesToImages(pdfFile, pdfRenderFormat);
      setPdfToImagePages(pages);
    } catch (e: any) {
      setPdfToImageError(`Could not render this PDF: ${e.message || 'Unsupported or corrupt file.'}`);
    } finally {
      setIsRenderingPdfPages(false);
    }
  };

  const handleDownloadAllPdfPages = async () => {
    const zip = new JSZip();
    for (const page of pdfToImagePages) {
      zip.file(`page_${page.pageNumber}.${pdfRenderFormat}`, page.blob);
    }
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pdfToImageFile?.name.replace(/\.[^/.]+$/, '') || 'pdf'}_pages.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadImageEl = (f: File): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Could not load ${f.name}`));
      img.src = URL.createObjectURL(f);
    });

  // ==========================================
  // COMBINE / SPLIT IMAGES (Tools 61, 62, 63, 80)
  // ==========================================
  const [stitchMode, setStitchMode] = useState<'combine' | 'split'>(toolId === 63 ? 'split' : 'combine');
  const [stitchLayout, setStitchLayout] = useState<'vertical' | 'horizontal' | 'grid'>('vertical');
  const [stitchSpacing, setStitchSpacing] = useState(0);
  const [splitRows, setSplitRows] = useState(2);
  const [splitCols, setSplitCols] = useState(2);
  const [splitTiles, setSplitTiles] = useState<{ blob: Blob; name: string; url: string }[]>([]);

  const handleCombineImages = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const allFiles = [file, ...additionalFiles];
      const images = await Promise.all(allFiles.map(loadImageEl));

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const gap = stitchSpacing;

      if (stitchLayout === 'vertical') {
        canvas.width = Math.max(...images.map((i) => i.naturalWidth));
        canvas.height = images.reduce((sum, i) => sum + i.naturalHeight, 0) + gap * (images.length - 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let y = 0;
        for (const img of images) {
          ctx.drawImage(img, 0, y);
          y += img.naturalHeight + gap;
        }
      } else if (stitchLayout === 'horizontal') {
        canvas.width = images.reduce((sum, i) => sum + i.naturalWidth, 0) + gap * (images.length - 1);
        canvas.height = Math.max(...images.map((i) => i.naturalHeight));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        let x = 0;
        for (const img of images) {
          ctx.drawImage(img, x, 0);
          x += img.naturalWidth + gap;
        }
      } else {
        const cols = Math.ceil(Math.sqrt(images.length));
        const rows = Math.ceil(images.length / cols);
        const cellW = Math.max(...images.map((i) => i.naturalWidth));
        const cellH = Math.max(...images.map((i) => i.naturalHeight));
        canvas.width = cellW * cols + gap * (cols - 1);
        canvas.height = cellH * rows + gap * (rows - 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        images.forEach((img, idx) => {
          const col = idx % cols;
          const row = Math.floor(idx / cols);
          ctx.drawImage(img, col * (cellW + gap), row * (cellH + gap));
        });
      }

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        if (processedUrl) URL.revokeObjectURL(processedUrl);
        setProcessedBlob(blob);
        setProcessedUrl(url);
        setDownloadFilename(`combined_${stitchLayout}.png`);
        setHasProcessed(true);
        setIsProcessing(false);
      }, 'image/png');
    } catch (err: any) {
      alert(`Failed to combine images: ${err.message}`);
      setIsProcessing(false);
    }
  };

  const handleSplitImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const img = await loadImageEl(file);
      const tileW = Math.floor(img.naturalWidth / splitCols);
      const tileH = Math.floor(img.naturalHeight / splitRows);
      const zip = new JSZip();
      const tiles: { blob: Blob; name: string; url: string }[] = [];

      for (let r = 0; r < splitRows; r++) {
        for (let c = 0; c < splitCols; c++) {
          const canvas = document.createElement('canvas');
          canvas.width = tileW;
          canvas.height = tileH;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, c * tileW, r * tileH, tileW, tileH, 0, 0, tileW, tileH);
          const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
          const name = `tile_r${r + 1}c${c + 1}.png`;
          zip.file(name, blob);
          tiles.push({ blob, name, url: URL.createObjectURL(blob) });
        }
      }

      setSplitTiles(tiles);
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedBlob(zipBlob);
      setProcessedUrl(URL.createObjectURL(zipBlob));
      setDownloadFilename(`${file.name.replace(/\.[^/.]+$/, '')}_split.zip`);
      setHasProcessed(true);
    } catch (err: any) {
      alert(`Failed to split image: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedUrl) URL.revokeObjectURL(processedUrl);
    setFile(null);
    setPreviewUrl(null);
    setAdditionalFiles([]);
    setHasProcessed(false);
    setProcessedBlob(null);
    setProcessedUrl(null);
    setRotation(0);
    setIsFlippedH(false);
    setBrightness(100);
    setContrast(100);
    setGrayscale(0);
    setSepia(0);
  };

  // ==========================================
  // CONVERT IMAGE TO PDF (Tool 55)
  // ==========================================
  const handleConvertToPdf = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      const allFiles = [file, ...additionalFiles];

      for (const curFile of allFiles) {
        const imgData = await imageToJpegBytes(curFile);
        const embeddedImg = await pdfDoc.embedJpg(imgData.bytes);

        let pageWidth = imgData.width;
        let pageHeight = imgData.height;

        if (pdfPageSize === 'a4') {
          const isLandscape =
            pdfOrientation === 'landscape' ||
            (pdfOrientation === 'auto' && imgData.width > imgData.height);
          pageWidth = isLandscape ? 841.89 : 595.28;
          pageHeight = isLandscape ? 595.28 : 841.89;
        } else if (pdfPageSize === 'letter') {
          const isLandscape =
            pdfOrientation === 'landscape' ||
            (pdfOrientation === 'auto' && imgData.width > imgData.height);
          pageWidth = isLandscape ? 792 : 612;
          pageHeight = isLandscape ? 612 : 792;
        }

        const marginPt = pdfMargin === 'none' ? 0 : pdfMargin === 'small' ? 20 : 40;
        const availWidth = Math.max(10, pageWidth - marginPt * 2);
        const availHeight = Math.max(10, pageHeight - marginPt * 2);

        let drawWidth = imgData.width;
        let drawHeight = imgData.height;

        if (pdfPageSize !== 'fit') {
          const scale = Math.min(availWidth / imgData.width, availHeight / imgData.height);
          drawWidth = imgData.width * scale;
          drawHeight = imgData.height * scale;
        } else {
          pageWidth = imgData.width + marginPt * 2;
          pageHeight = imgData.height + marginPt * 2;
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const drawX = (pageWidth - drawWidth) / 2;
        const drawY = (pageHeight - drawHeight) / 2;

        page.drawImage(embeddedImg, {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);

      if (processedUrl) URL.revokeObjectURL(processedUrl);
      setProcessedBlob(blob);
      setProcessedUrl(blobUrl);
      setPdfPageCount(allFiles.length);
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      setDownloadFilename(`${baseName}_document.pdf`);
      setHasProcessed(true);
    } catch (err: any) {
      console.error(err);
      alert('Failed to generate PDF document. Please try a different image.');
    } finally {
      setIsProcessing(false);
    }
  };

  // ==========================================
  // PROCESS IMAGE ON CLICK (CROP, COMPRESS, RESIZE, ETC.)
  // ==========================================
  const handleProcessImage = () => {
    if (!previewUrl || !file) return;

    if (activeTab === 'pdf') {
      handleConvertToPdf();
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      // 1. Interactive Crop
      if (activeTab === 'crop') {
        const cX = Math.max(0, Math.min(cropX, originalWidth - 10));
        const cY = Math.max(0, Math.min(cropY, originalHeight - 10));
        const cW = Math.max(10, Math.min(cropWidth, originalWidth - cX));
        const cH = Math.max(10, Math.min(cropHeight, originalHeight - cY));

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(cW);
        canvas.height = Math.round(cH);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, cX, cY, cW, cH, 0, 0, canvas.width, canvas.height);

        const ext = file.type === 'image/png' ? 'png' : 'jpg';
        const mime = file.type || 'image/jpeg';
        const baseName = file.name.replace(/\.[^/.]+$/, '');
        const outName = `${baseName}_cropped.${ext}`;

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (processedUrl) URL.revokeObjectURL(processedUrl);
              const blobUrl = URL.createObjectURL(blob);
              setProcessedBlob(blob);
              setProcessedUrl(blobUrl);
              setProcessedWidth(canvas.width);
              setProcessedHeight(canvas.height);
              setDownloadFilename(outName);
              setHasProcessed(true);
            }
            setIsProcessing(false);
          },
          mime,
          0.92
        );
        return;
      }

      // 2. Meme Generator
      if (activeTab === 'meme') {
        const canvas = document.createElement('canvas');
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);

        ctx.font = `bold ${memeFontSize}px Impact, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = Math.max(3, Math.round(memeFontSize / 8));
        ctx.lineJoin = 'round';

        // Top text
        if (memeTopText) {
          ctx.strokeText(memeTopText.toUpperCase(), canvas.width / 2, memeFontSize + 15);
          ctx.fillText(memeTopText.toUpperCase(), canvas.width / 2, memeFontSize + 15);
        }

        // Bottom text
        if (memeBottomText) {
          ctx.strokeText(memeBottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
          ctx.fillText(memeBottomText.toUpperCase(), canvas.width / 2, canvas.height - 20);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (processedUrl) URL.revokeObjectURL(processedUrl);
              setProcessedBlob(blob);
              setProcessedUrl(URL.createObjectURL(blob));
              setProcessedWidth(canvas.width);
              setProcessedHeight(canvas.height);
              setDownloadFilename(`${file.name.replace(/\.[^/.]+$/, '')}_meme.jpg`);
              setHasProcessed(true);
            }
            setIsProcessing(false);
          },
          'image/jpeg',
          0.92
        );
        return;
      }

      // 3. Watermark
      if (activeTab === 'watermark') {
        const canvas = document.createElement('canvas');
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        ctx.font = `bold ${watermarkSize}px sans-serif`;
        ctx.fillStyle = watermarkColor;
        ctx.globalAlpha = watermarkOpacity;

        if (watermarkPos === 'center') {
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(watermarkText, canvas.width / 2, canvas.height / 2);
        } else if (watermarkPos === 'top-left') {
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          ctx.fillText(watermarkText, 25, 25);
        } else if (watermarkPos === 'diagonal') {
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(-Math.PI / 4);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.round(watermarkSize * 1.5)}px sans-serif`;
          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        } else {
          // Bottom right
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(watermarkText, canvas.width - 25, canvas.height - 25);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (processedUrl) URL.revokeObjectURL(processedUrl);
              setProcessedBlob(blob);
              setProcessedUrl(URL.createObjectURL(blob));
              setProcessedWidth(canvas.width);
              setProcessedHeight(canvas.height);
              setDownloadFilename(`${file.name.replace(/\.[^/.]+$/, '')}_watermarked.png`);
              setHasProcessed(true);
            }
            setIsProcessing(false);
          },
          'image/png'
        );
        return;
      }

      // 4. Background Remover / Changer (Transparent or Solid Color PNG)
      if (activeTab === 'bg_remove' || activeTab === 'bg_change') {
        const canvas = document.createElement('canvas');
        canvas.width = originalWidth;
        canvas.height = originalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Sample corner color as target background
        const targetR = data[0];
        const targetG = data[1];
        const targetB = data[2];
        const tol = bgTolerance * 2.5;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const dist = Math.sqrt((r - targetR) ** 2 + (g - targetG) ** 2 + (b - targetB) ** 2);
          if (dist < tol) {
            data[i + 3] = 0; // Transparent
          }
        }

        ctx.putImageData(imgData, 0, 0);

        if (activeTab === 'bg_change') {
          const hex = bgReplaceColor.replace('#', '');
          const fillR = parseInt(hex.substring(0, 2), 16);
          const fillG = parseInt(hex.substring(2, 4), 16);
          const fillB = parseInt(hex.substring(4, 6), 16);
          const solidCanvas = document.createElement('canvas');
          solidCanvas.width = canvas.width;
          solidCanvas.height = canvas.height;
          const solidCtx = solidCanvas.getContext('2d')!;
          solidCtx.fillStyle = `rgb(${fillR}, ${fillG}, ${fillB})`;
          solidCtx.fillRect(0, 0, canvas.width, canvas.height);
          solidCtx.drawImage(canvas, 0, 0);
          canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(solidCanvas, 0, 0);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (processedUrl) URL.revokeObjectURL(processedUrl);
              setProcessedBlob(blob);
              setProcessedUrl(URL.createObjectURL(blob));
              setProcessedWidth(canvas.width);
              setProcessedHeight(canvas.height);
              setDownloadFilename(`${file.name.replace(/\.[^/.]+$/, '')}_${activeTab === 'bg_change' ? 'recolored' : 'transparent'}.png`);
              setHasProcessed(true);
            }
            setIsProcessing(false);
          },
          'image/png'
        );
        return;
      }

      // 5. Passport Photo Sheet
      if (activeTab === 'passport') {
        const canvas = document.createElement('canvas');
        if (passportLayout === 'sheet6') {
          // 4x6 inch standard photo print @ 300 DPI = 1200 x 1800 px
          canvas.width = 1200;
          canvas.height = 1800;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsProcessing(false);
            return;
          }
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 2x3 grid = 6 passport photos
          const photoW = 340;
          const photoH = 340;
          const startX = 140;
          const startY = 180;
          const gapX = 180;
          const gapY = 160;

          for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 2; col++) {
              const x = startX + col * (photoW + gapX);
              const y = startY + row * (photoH + gapY);
              ctx.drawImage(img, x, y, photoW, photoH);
              ctx.strokeStyle = '#E2E8F0';
              ctx.strokeRect(x, y, photoW, photoH);
            }
          }
        } else {
          // Single 2x2" crop @ 600x600 px
          canvas.width = 600;
          canvas.height = 600;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsProcessing(false);
            return;
          }
          ctx.drawImage(img, 0, 0, 600, 600);
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              if (processedUrl) URL.revokeObjectURL(processedUrl);
              setProcessedBlob(blob);
              setProcessedUrl(URL.createObjectURL(blob));
              setProcessedWidth(canvas.width);
              setProcessedHeight(canvas.height);
              setDownloadFilename(`${file.name.replace(/\.[^/.]+$/, '')}_passport_sheet.jpg`);
              setHasProcessed(true);
            }
            setIsProcessing(false);
          },
          'image/jpeg',
          0.95
        );
        return;
      }

      // 6. Resize / Rotate / Convert / Compress / Filter
      let targetW = originalWidth;
      let targetH = originalHeight;

      if (activeTab === 'resize') {
        targetW = resizeWidth;
        targetH = resizeHeight;
      }

      const isRotatedSideways = rotation % 180 !== 0;
      const canvasW = isRotatedSideways ? targetH : targetW;
      const canvasH = isRotatedSideways ? targetW : targetH;

      const canvas = document.createElement('canvas');
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      if (activeTab === 'filter') {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`;
      } else if (activeTab === 'blur') {
        ctx.filter = `blur(${blurRadius}px)`;
      }

      ctx.save();
      ctx.translate(canvasW / 2, canvasH / 2);
      if (rotation !== 0) {
        ctx.rotate((rotation * Math.PI) / 180);
      }
      if (isFlippedH) {
        ctx.scale(-1, 1);
      }
      ctx.drawImage(img, -targetW / 2, -targetH / 2, targetW, targetH);
      ctx.restore();

      let outputMime = file.type || 'image/jpeg';
      let quality = 0.92;

      if (activeTab === 'compress') {
        outputMime = file.type === 'image/png' ? 'image/webp' : file.type;
        quality = compressQuality;
      } else if (activeTab === 'convert') {
        outputMime = targetFormat;
        quality = 0.9;
      }

      const ext = outputMime === 'image/webp' ? 'webp' : outputMime === 'image/png' ? 'png' : 'jpg';
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const actionSuffix =
        activeTab === 'compress'
          ? 'compressed'
          : activeTab === 'resize'
          ? 'resized'
          : activeTab === 'filter'
          ? 'enhanced'
          : activeTab === 'blur'
          ? 'blurred'
          : 'converted';
      const outName = `${baseName}_${actionSuffix}.${ext}`;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            if (processedUrl) URL.revokeObjectURL(processedUrl);
            const blobUrl = URL.createObjectURL(blob);
            setProcessedBlob(blob);
            setProcessedUrl(blobUrl);
            setProcessedWidth(canvasW);
            setProcessedHeight(canvasH);
            setDownloadFilename(outName);
            setHasProcessed(true);
          }
          setIsProcessing(false);
        },
        outputMime,
        quality
      );
    };
    img.src = previewUrl;
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const getSavingsPercent = () => {
    if (!file || !processedBlob) return 0;
    const diff = file.size - processedBlob.size;
    return Math.round((diff / file.size) * 100);
  };

  // Percentage offsets for crop overlay
  const cropLeftPct = originalWidth ? (cropX / originalWidth) * 100 : 0;
  const cropTopPct = originalHeight ? (cropY / originalHeight) * 100 : 0;
  const cropWidthPct = originalWidth ? (cropWidth / originalWidth) * 100 : 100;
  const cropHeightPct = originalHeight ? (cropHeight / originalHeight) * 100 : 100;

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ImageIcon className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Image Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Crop, resize, convert to PDF, watermark, and compress images. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* Upload Zone when no image selected */}
      {!file && activeTab !== 'pdf_to_image' && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="image/*"
            multiple={activeTab === 'pdf' || (activeTab === 'stitch' && stitchMode === 'combine')}
            label={activeTab === 'pdf' ? 'Select or drop images to convert to PDF' : 'Select or drop an image to start'}
            sublabel="Supports JPG, PNG, WebP, SVG • 100% Offline • 100% Secure"
            files={[]}
            onFilesChange={handleFileChange}
            accentColor={accentColor}
          />
        </div>
      )}

      {activeTab === 'pdf_to_image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>PDF Page to Image</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Renders each page of a PDF to a high-resolution PNG or JPEG image, 100% locally.
            </p>

            <FileDropZone
              accept="application/pdf"
              multiple={false}
              label="Select a PDF file"
              files={pdfToImageFile ? [pdfToImageFile] : []}
              onFilesChange={(files) => {
                if (files[0]) handleRenderPdfToImages(files[0]);
              }}
              accentColor={accentColor}
            />

            <div className="flex gap-2">
              {(['png', 'jpeg'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setPdfRenderFormat(f)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold uppercase ${pdfRenderFormat === f ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>

            {pdfToImageFile && (
              <button
                onClick={() => handleRenderPdfToImages(pdfToImageFile)}
                disabled={isRenderingPdfPages}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-sm transition-all"
              >
                {isRenderingPdfPages ? 'Rendering Pages...' : 'Re-render with Selected Format'}
              </button>
            )}

            {pdfToImageError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
                {pdfToImageError}
              </div>
            )}
          </div>

          <div className="space-y-3">
            {pdfToImagePages.length > 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {pdfToImagePages.length} Page(s) Rendered
                  </h4>
                  <button
                    onClick={handleDownloadAllPdfPages}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download All (.zip)
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto">
                  {pdfToImagePages.map((p) => (
                    <a
                      key={p.pageNumber}
                      href={p.url}
                      download={`page_${p.pageNumber}.${pdfRenderFormat}`}
                      className="block rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-emerald-500 transition-all"
                    >
                      <img src={p.url} alt={`Page ${p.pageNumber}`} className="w-full h-32 object-cover bg-slate-100 dark:bg-slate-800" />
                      <div className="text-[10px] text-center py-1 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                        Page {p.pageNumber}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Select a PDF to render its pages as images, 100% offline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace when image loaded */}
      {file && activeTab !== 'pdf_to_image' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            {/* File Info Bar */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2.5 truncate">
                <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="w-4 h-4" />
                </span>
                <div className="truncate">
                  <p className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {file.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {originalWidth} × {originalHeight} px • {formatBytes(file.size)}
                  </p>
                </div>
              </div>

              <button
                onClick={handleReset}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                title="Change image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* ======================================================== */}
            {/* TAB: IMAGE TO PDF (Tool 55) */}
            {/* ======================================================== */}
            {activeTab === 'pdf' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <span>Image to PDF Converter</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Convert your image into a standard, universally compatible PDF document.
                  </p>
                </div>

                {/* Page Size Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Page Size
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'fit', label: 'Fit to Image', desc: 'Exact pixel scale' },
                      { id: 'a4', label: 'Standard A4', desc: '595 × 842 pt' },
                      { id: 'letter', label: 'US Letter', desc: '612 × 792 pt' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPdfPageSize(opt.id as any)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                          pdfPageSize === opt.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{opt.label}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orientation Presets (if not Fit) */}
                {pdfPageSize !== 'fit' && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Page Orientation
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'auto', label: 'Auto' },
                        { id: 'portrait', label: 'Portrait' },
                        { id: 'landscape', label: 'Landscape' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPdfOrientation(opt.id as any)}
                          className={`py-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                            pdfOrientation === opt.id
                              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Margin Options */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Page Margin
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { id: 'none', label: 'No Margin' },
                      { id: 'small', label: 'Small Margin' },
                      { id: 'normal', label: 'Normal Margin' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setPdfMargin(opt.id as any)}
                        className={`py-2 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer ${
                          pdfMargin === opt.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Images (Multi-page PDF) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-2">
                    <span>Multi-Page Document</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {1 + additionalFiles.length} Page(s) total
                    </span>
                  </div>

                  <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                    <Plus className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Add another image to this PDF</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) handleAddMoreFiles(Array.from(e.target.files));
                      }}
                    />
                  </label>
                </div>

                {/* Big Action Button */}
                <button
                  onClick={handleConvertToPdf}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Creating PDF Document...'
                      : `Convert ${1 + additionalFiles.length > 1 ? `${1 + additionalFiles.length} Images` : 'Image'} to PDF Now`}
                  </span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: CROP CONTROLS (Tool 51) */}
            {/* ======================================================== */}
            {activeTab === 'crop' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CropIcon className="w-4 h-4 text-emerald-500" />
                    <span>Live Interactive Cropper</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Drag the crop box or corner handles directly with your mouse/touch, or select a preset below.
                  </p>
                </div>

                {/* Aspect Ratio Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                    Aspect Ratio
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(
                      [
                        { id: '1:1', label: '1:1 Square' },
                        { id: '4:5', label: '4:5 Portrait' },
                        { id: '16:9', label: '16:9 Widescreen' },
                        { id: '9:16', label: '9:16 Story' },
                        { id: '4:3', label: '4:3 Standard' },
                        { id: '3:2', label: '3:2 Photo' },
                        { id: 'passport', label: 'Passport' },
                        { id: 'free', label: 'Custom Free' },
                      ] as const
                    ).map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => applyCropRatio(r.id)}
                        className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          cropRatio === r.id
                            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Exact Dimensions Inputs */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Crop Coordinates & Size
                    </span>
                    <button
                      type="button"
                      onClick={handleCenterCrop}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 cursor-pointer"
                    >
                      Center Crop
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-slate-600 dark:text-slate-400 mb-1 block">Width (px)</label>
                      <input
                        type="number"
                        min="10"
                        max={originalWidth}
                        value={cropWidth}
                        onChange={(e) => {
                          const w = Math.min(originalWidth, Math.max(10, Number(e.target.value)));
                          setCropWidth(w);
                          if (cropX + w > originalWidth) {
                            setCropX(Math.max(0, originalWidth - w));
                          }
                        }}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 dark:text-slate-400 mb-1 block">Height (px)</label>
                      <input
                        type="number"
                        min="10"
                        max={originalHeight}
                        value={cropHeight}
                        onChange={(e) => {
                          const h = Math.min(originalHeight, Math.max(10, Number(e.target.value)));
                          setCropHeight(h);
                          if (cropY + h > originalHeight) {
                            setCropY(Math.max(0, originalHeight - h));
                          }
                        }}
                        className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Big Action Button */}
                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <CropIcon className="w-4 h-4" />
                  <span>{isProcessing ? 'Cropping Image...' : `Crop Image Now (${cropWidth} × ${cropHeight} px)`}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: COMPRESS CONTROLS */}
            {/* ======================================================== */}
            {activeTab === 'compress' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Image Compression
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Shrink file size without losing visible clarity.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => handleSelectCompressPreset('high')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      compressPreset === 'high'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Best Quality</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">~25% smaller</p>
                  </button>

                  <button
                    onClick={() => handleSelectCompressPreset('balanced')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      compressPreset === 'balanced'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Recommended</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">~60% smaller</p>
                  </button>

                  <button
                    onClick={() => handleSelectCompressPreset('max')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      compressPreset === 'max'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Smallest File</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">~85% smaller</p>
                  </button>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                    <span>Compression Level</span>
                    <span className="font-semibold">{Math.round(compressQuality * 100)}% Quality</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={Math.round(compressQuality * 100)}
                    onChange={(e) => {
                      setCompressQuality(Number(e.target.value) / 100);
                      setCompressPreset('balanced');
                    }}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Compressing Image...' : 'Compress Image Now'}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: RESIZE CONTROLS */}
            {/* ======================================================== */}
            {activeTab === 'resize' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Resize Dimensions
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Scale image pixels by percentage or custom resolution.
                  </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[25, 50, 75, 100, 150, 200].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => applyPercentScale(pct)}
                      className="py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-2">
                  150-200% scales the image up using browser-native smoothing (not AI super-resolution).
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={resizeWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={resizeHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepAspect}
                    onChange={(e) => setKeepAspect(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span>Lock Aspect Ratio ({aspectRatio ? aspectRatio.toFixed(2) : '1'}:1)</span>
                </label>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>{isProcessing ? 'Resizing Image...' : `Resize to ${resizeWidth} × ${resizeHeight} px`}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: CONVERT CONTROLS */}
            {/* ======================================================== */}
            {activeTab === 'convert' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Convert Format
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Current format: {file.type.replace('image/', '').toUpperCase()}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'image/webp', name: 'WebP', desc: 'Modern & Small' },
                    { id: 'image/jpeg', name: 'JPG', desc: 'Standard Photo' },
                    { id: 'image/png', name: 'PNG', desc: 'High Quality' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      onClick={() => setTargetFormat(fmt.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        targetFormat === fmt.id
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{fmt.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{fmt.desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{isProcessing ? 'Converting...' : `Convert to ${targetFormat.replace('image/', '').toUpperCase()}`}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: ROTATE & FLIP CONTROLS */}
            {/* ======================================================== */}
            {activeTab === 'rotate' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Rotate & Flip
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Current rotation: {rotation}°
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Rotate Left 90°</span>
                  </button>

                  <button
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <RotateCw className="w-4 h-4" />
                    <span>Rotate Right 90°</span>
                  </button>

                  <button
                    onClick={() => setIsFlippedH((f) => !f)}
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      isFlippedH
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <FlipHorizontal className="w-4 h-4" />
                    <span>Flip Horizon</span>
                  </button>
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <RotateCw className="w-4 h-4" />
                  <span>{isProcessing ? 'Saving Orientation...' : 'Apply Orientation & Save'}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: FILTER CONTROLS */}
            {/* ======================================================== */}
            {activeTab === 'filter' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Image Adjustments & Filters
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Brightness</span>
                      <span className="font-semibold">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="180"
                      value={brightness}
                      onChange={(e) => setBrightness(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Contrast</span>
                      <span className="font-semibold">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="180"
                      value={contrast}
                      onChange={(e) => setContrast(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setGrayscale((g) => (g === 100 ? 0 : 100))}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        grayscale > 0
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Black & White {grayscale > 0 ? '✓' : ''}
                    </button>
                    <button
                      onClick={() => setSepia((s) => (s === 80 ? 0 : 80))}
                      className={`py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        sepia > 0
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Vintage Sepia {sepia > 0 ? '✓' : ''}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Sliders className="w-4 h-4" />
                  <span>{isProcessing ? 'Applying Filters...' : 'Apply Filters & Save'}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: WATERMARK (Tool 59) */}
            {/* ======================================================== */}
            {activeTab === 'watermark' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Type className="w-4 h-4 text-emerald-500" />
                    <span>Image Watermark</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Stamp copyright, company text, or confidential badges onto your image.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Watermark Text
                    </label>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      placeholder="e.g. CONFIDENTIAL"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                        Position
                      </label>
                      <select
                        value={watermarkPos}
                        onChange={(e) => setWatermarkPos(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs cursor-pointer"
                      >
                        <option value="bottom-right">Bottom Right</option>
                        <option value="center">Center</option>
                        <option value="top-left">Top Left</option>
                        <option value="diagonal">Diagonal Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                        Font Size ({watermarkSize}px)
                      </label>
                      <input
                        type="range"
                        min="16"
                        max="64"
                        value={watermarkSize}
                        onChange={(e) => setWatermarkSize(Number(e.target.value))}
                        className="w-full accent-emerald-600 mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Opacity</span>
                      <span className="font-semibold">{Math.round(watermarkOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={Math.round(watermarkOpacity * 100)}
                      onChange={(e) => setWatermarkOpacity(Number(e.target.value) / 100)}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Type className="w-4 h-4" />
                  <span>{isProcessing ? 'Applying Watermark...' : 'Apply Watermark Now'}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: MEME GENERATOR (Tool 77) */}
            {/* ======================================================== */}
            {activeTab === 'meme' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Smile className="w-4 h-4 text-emerald-500" />
                    <span>Meme Generator</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Add bold viral meme typography to your image.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Top Caption
                    </label>
                    <input
                      type="text"
                      value={memeTopText}
                      onChange={(e) => setMemeTopText(e.target.value)}
                      placeholder="TOP TEXT"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                      Bottom Caption
                    </label>
                    <input
                      type="text"
                      value={memeBottomText}
                      onChange={(e) => setMemeBottomText(e.target.value)}
                      placeholder="BOTTOM TEXT"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white uppercase font-bold text-xs"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Caption Size</span>
                      <span className="font-semibold">{memeFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="24"
                      max="64"
                      value={memeFontSize}
                      onChange={(e) => setMemeFontSize(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Smile className="w-4 h-4" />
                  <span>{isProcessing ? 'Generating Meme...' : 'Generate Meme Now'}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: PASSPORT PHOTO (Tool 75, 76) */}
            {/* ======================================================== */}
            {activeTab === 'passport' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-500" />
                    <span>Passport & ID Photo Maker</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Generate standard 2×2" passport photos or a printable 4×6" 6-photo sheet.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPassportLayout('sheet6')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      passportLayout === 'sheet6'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Printable 4×6 Sheet</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">6 repeat passport photos</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPassportLayout('single')}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      passportLayout === 'single'
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Single 2×2" Photo</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Official 600×600 px</p>
                  </button>
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>{isProcessing ? 'Generating Photo Sheet...' : 'Generate Passport Photo Now'}</span>
                </button>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: COLOR PALETTE (Tool 78, 64) */}
            {/* ======================================================== */}
            {activeTab === 'palette' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-4 h-4 text-emerald-500" />
                    <span>Dominant Color Palette</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Extracted top 6 dominant colors from your image. Click any hex code to copy.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {extractedPalette.map((hex) => (
                    <button
                      key={hex}
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(hex);
                        setCopiedHex(hex);
                        setTimeout(() => setCopiedHex(null), 1500);
                      }}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition-all text-left"
                    >
                      <span
                        className="w-6 h-6 rounded-lg border border-black/10 shrink-0 shadow-xs"
                        style={{ backgroundColor: hex }}
                      />
                      <div className="truncate">
                        <p className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate">
                          {hex}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {copiedHex === hex ? 'Copied! ✓' : 'Click to copy'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB: BACKGROUND REMOVER (Tool 57, 72) */}
            {/* ======================================================== */}
            {activeTab === 'bg_remove' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-emerald-500" />
                    <span>Background Remover (Transparent PNG)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Cut out light/solid backgrounds to create a clean transparent PNG image.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Color Tolerance</span>
                    <span className="font-semibold">{bgTolerance}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={bgTolerance}
                    onChange={(e) => setBgTolerance(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>{isProcessing ? 'Removing Background...' : 'Remove Background Now'}</span>
                </button>
              </div>
            )}

            {activeTab === 'bg_change' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-emerald-500" />
                    <span>Background Changer</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Detects the current background color and replaces it with a solid color of your choice.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                    <span>Color Tolerance</span>
                    <span className="font-semibold">{bgTolerance}%</span>
                  </div>
                  <input type="range" min="10" max="70" value={bgTolerance} onChange={(e) => setBgTolerance(Number(e.target.value))} className="w-full accent-emerald-600" />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">New Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgReplaceColor} onChange={(e) => setBgReplaceColor(e.target.value)} className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700" />
                    <input type="text" value={bgReplaceColor} onChange={(e) => setBgReplaceColor(e.target.value)} className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase" />
                  </div>
                </div>

                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <Scissors className="w-4 h-4" />
                  <span>{isProcessing ? 'Changing Background...' : 'Change Background Now'}</span>
                </button>
              </div>
            )}

            {activeTab === 'stitch' && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Copy className="w-4 h-4 text-emerald-500" />
                    <span>Combine or Split Images</span>
                  </h3>
                </div>

                <div className="flex gap-2">
                  {(['combine', 'split'] as const).map((m) => (
                    <button key={m} onClick={() => setStitchMode(m)} className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize ${stitchMode === m ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      {m === 'combine' ? 'Combine (Collage / Merge)' : 'Split into Tiles'}
                    </button>
                  ))}
                </div>

                {stitchMode === 'combine' ? (
                  <>
                    <div className="flex gap-2">
                      {(['vertical', 'horizontal', 'grid'] as const).map((l) => (
                        <button key={l} onClick={() => setStitchLayout(l)} className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize ${stitchLayout === l ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                          {l}
                        </button>
                      ))}
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                        <span>Spacing Between Images</span>
                        <span className="font-semibold">{stitchSpacing}px</span>
                      </div>
                      <input type="range" min={0} max={40} value={stitchSpacing} onChange={(e) => setStitchSpacing(Number(e.target.value))} className="w-full accent-emerald-600" />
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 mb-2">
                        <span>Images to Combine</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{1 + additionalFiles.length} selected</span>
                      </div>
                      <label className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-xs text-slate-600 dark:text-slate-300 cursor-pointer transition-colors">
                        <Plus className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Add another image</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files) handleAddMoreFiles(Array.from(e.target.files)); }} />
                      </label>
                    </div>

                    <button
                      onClick={handleCombineImages}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span>{isProcessing ? 'Combining...' : `Combine ${1 + additionalFiles.length} Images`}</span>
                    </button>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Rows</label>
                        <input type="number" min={1} max={8} value={splitRows} onChange={(e) => setSplitRows(Math.max(1, Number(e.target.value)))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Columns</label>
                        <input type="number" min={1} max={8} value={splitCols} onChange={(e) => setSplitCols(Math.max(1, Number(e.target.value)))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono" />
                      </div>
                    </div>
                    <button
                      onClick={handleSplitImage}
                      disabled={isProcessing}
                      className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Scissors className="w-4 h-4" />
                      <span>{isProcessing ? 'Splitting...' : `Split into ${splitRows * splitCols} Tiles`}</span>
                    </button>
                    {splitTiles.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 pt-2">
                        {splitTiles.map((t, i) => (
                          <img key={i} src={t.url} alt={t.name} className="w-full aspect-square object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Column: PREVIEW & RESULT (ONLY SHOWS AFTER PROCESSING!) */}
          <div className="space-y-6">
            {/* Visual Preview Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {hasProcessed ? (
                    'Processed Result'
                  ) : activeTab === 'crop' ? (
                    <>
                      <Move className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Interactive Crop Area ({cropWidth} × {cropHeight} px)</span>
                    </>
                  ) : activeTab === 'pdf' ? (
                    <>
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      <span>PDF Document Preview</span>
                    </>
                  ) : (
                    'Original Image'
                  )}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {hasProcessed
                    ? `${processedWidth || originalWidth} × ${processedHeight || originalHeight} px`
                    : `${originalWidth} × ${originalHeight} px`}
                </span>
              </div>

              {/* Image Container with Live Interactive Crop Overlay */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[280px] max-h-[420px] flex items-center justify-center p-3 select-none">
                <div className="relative inline-block max-h-[380px] max-w-full select-none">
                  <img
                    ref={imageElementRef}
                    src={hasProcessed && processedUrl && activeTab !== 'pdf' && !(activeTab === 'stitch' && stitchMode === 'split') ? processedUrl : (previewUrl || '')}
                    alt="Preview"
                    draggable={false}
                    style={{
                      transform: !hasProcessed && activeTab !== 'crop' ? `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1})` : undefined,
                      filter:
                        !hasProcessed && activeTab === 'filter'
                          ? `brightness(${brightness}%) contrast(${contrast}%) grayscale(${grayscale}%) sepia(${sepia}%)`
                          : !hasProcessed && activeTab === 'blur'
                          ? `blur(${blurRadius / 2}px)`
                          : undefined,
                    }}
                    className="max-h-[380px] max-w-full object-contain rounded-lg shadow-sm block select-none pointer-events-none"
                  />

                  {/* INTERACTIVE CROP OVERLAY (Only on crop tab before processing) */}
                  {!hasProcessed && activeTab === 'crop' && (
                    <div
                      onMouseDown={(e) => startDrag('create', e.clientX, e.clientY)}
                      onTouchStart={(e) => {
                        if (e.touches[0]) startDrag('create', e.touches[0].clientX, e.touches[0].clientY);
                      }}
                      className="absolute inset-0 cursor-crosshair select-none touch-none"
                    >
                      {/* 4 Dimmed Dark Masks */}
                      <div style={{ height: `${cropTopPct}%` }} className="absolute top-0 inset-x-0 bg-black/60 pointer-events-none" />
                      <div style={{ top: `${cropTopPct + cropHeightPct}%`, bottom: 0 }} className="absolute inset-x-0 bg-black/60 pointer-events-none" />
                      <div
                        style={{ top: `${cropTopPct}%`, height: `${cropHeightPct}%`, width: `${cropLeftPct}%` }}
                        className="absolute left-0 bg-black/60 pointer-events-none"
                      />
                      <div
                        style={{ top: `${cropTopPct}%`, height: `${cropHeightPct}%`, left: `${cropLeftPct + cropWidthPct}%`, right: 0 }}
                        className="absolute bg-black/60 pointer-events-none"
                      />

                      {/* THE INTERACTIVE CROP BOX */}
                      <div
                        style={{
                          left: `${cropLeftPct}%`,
                          top: `${cropTopPct}%`,
                          width: `${cropWidthPct}%`,
                          height: `${cropHeightPct}%`,
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('move', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('move', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute border-2 border-emerald-400 shadow-2xl cursor-move select-none touch-none group"
                      >
                        <div className="absolute inset-x-0 top-1/3 border-t border-emerald-400/50 border-dashed pointer-events-none" />
                        <div className="absolute inset-x-0 top-2/3 border-t border-emerald-400/50 border-dashed pointer-events-none" />
                        <div className="absolute inset-y-0 left-1/3 border-l border-emerald-400/50 border-dashed pointer-events-none" />
                        <div className="absolute inset-y-0 left-2/3 border-l border-emerald-400/50 border-dashed pointer-events-none" />

                        {/* Corner Handles */}
                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startDrag('nw', e.clientX, e.clientY);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            if (e.touches[0]) startDrag('nw', e.touches[0].clientX, e.touches[0].clientY);
                          }}
                          className="absolute -top-2 -left-2 w-5 h-5 flex items-center justify-center cursor-nwse-resize z-20"
                        >
                          <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md" />
                        </div>

                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startDrag('ne', e.clientX, e.clientY);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            if (e.touches[0]) startDrag('ne', e.touches[0].clientX, e.touches[0].clientY);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center cursor-nesw-resize z-20"
                        >
                          <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md" />
                        </div>

                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startDrag('sw', e.clientX, e.clientY);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            if (e.touches[0]) startDrag('sw', e.touches[0].clientX, e.touches[0].clientY);
                          }}
                          className="absolute -bottom-2 -left-2 w-5 h-5 flex items-center justify-center cursor-nesw-resize z-20"
                        >
                          <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md" />
                        </div>

                        <div
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            startDrag('se', e.clientX, e.clientY);
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                            if (e.touches[0]) startDrag('se', e.touches[0].clientX, e.touches[0].clientY);
                          }}
                          className="absolute -bottom-2 -right-2 w-5 h-5 flex items-center justify-center cursor-nwse-resize z-20"
                        >
                          <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-xs shadow-md" />
                        </div>

                        {/* Live Resolution Badge */}
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/80 text-white font-mono text-[10px] pointer-events-none shadow-md flex items-center gap-1">
                          <CropIcon className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{cropWidth} × {cropHeight} px</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Cursor Interaction Helper Tip */}
              {!hasProcessed && activeTab === 'crop' && (
                <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                  <Move className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    <strong>Cursor Controls:</strong> Drag inside box to move • Drag corner handles to resize • Click & drag outside to draw new area.
                  </span>
                </div>
              )}
            </div>

            {/* ONLY DISPLAY THE RESULT CARD IF THE USER HAS ACTUALLY PROCESSED! */}
            {hasProcessed && processedBlob && (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {activeTab === 'pdf'
                          ? 'PDF Document Created Successfully!'
                          : activeTab === 'crop'
                          ? 'Image Cropped Successfully!'
                          : 'Processing Complete!'}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {downloadFilename}
                      </p>
                    </div>
                  </div>

                  {file && processedBlob.size < file.size && activeTab !== 'pdf' && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                      {getSavingsPercent()}% Smaller 🎉
                    </span>
                  )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Original Size</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">
                      {activeTab === 'pdf' ? 'PDF File Size' : 'New Size'}
                    </span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {formatBytes(processedBlob.size)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      {activeTab === 'pdf' ? 'Total Pages' : 'Resolution'}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeTab === 'pdf' ? `${pdfPageCount} Page(s)` : `${processedWidth || originalWidth} × ${processedHeight || originalHeight} px`}
                    </p>
                  </div>
                </div>

                {/* Big Download Button */}
                {processedUrl && (
                  <a
                    href={processedUrl}
                    download={downloadFilename}
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {activeTab === 'pdf'
                        ? 'Download PDF Document'
                        : activeTab === 'crop'
                        ? 'Download Cropped Image'
                        : 'Download Processed File'}
                    </span>
                  </a>
                )}
              </div>
            )}

            {/* If NOT processed yet, show simple ready banner */}
            {!hasProcessed && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  {activeTab === 'crop'
                    ? 'Drag the crop box or handles with your cursor, then click "Crop Image Now".'
                    : activeTab === 'pdf'
                    ? 'Select your page size and orientation, then click "Convert Image to PDF Now". Your file never leaves your device.'
                    : 'Select your options on the left and click the button to process. Your file never leaves your device.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
