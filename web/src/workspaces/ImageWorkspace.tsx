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
import { ImageCompressorPanel } from './image/ImageCompressorPanel';
import { ImageResizerPanel } from './image/ImageResizerPanel';
import { ImageCropperPanel } from './image/ImageCropperPanel';
import { ImageRotatorPanel } from './image/ImageRotatorPanel';
import { ImageConverterPanel } from './image/ImageConverterPanel';
import { ImageToPdfPanel } from './image/ImageToPdfPanel';
import { PdfToImagePanel } from './image/PdfToImagePanel';
import { ImageBgRemoverPanel } from './image/ImageBgRemoverPanel';
import { ImageWatermarkPanel } from './image/ImageWatermarkPanel';
import { ImageStitchPanel } from './image/ImageStitchPanel';
import { ImageColorPalettePanel } from './image/ImageColorPalettePanel';
import { ImageEnhancerPanel } from './image/ImageEnhancerPanel';
import { ImageBlurPanel } from './image/ImageBlurPanel';
import { ImageMetadataPanel } from './image/ImageMetadataPanel';
import { FaviconGeneratorPanel } from './image/FaviconGeneratorPanel';
import { PassportPhotoPanel } from './image/PassportPhotoPanel';
import { MemeGeneratorPanel } from './image/MemeGeneratorPanel';
import { ImageComparePanel } from './image/ImageComparePanel';
import { ImageUpscalerPanel } from './image/ImageUpscalerPanel';
import { ImageOcrPanel } from './image/ImageOcrPanel';

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
  | 'compare'
  | 'upscale'
  | 'ocr'
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
    if (id === 65) return 'ocr';
    if (id === 66) return 'upscale';
    if (id === 67) return 'filter';
    if (id === 75 || id === 76) return 'passport';
    if (id === 77) return 'meme';
    if (id === 79) return 'compare';
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

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
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

      const ext = outputMime === 'image/webp' ? 'webp' : outputMime === 'image/png' ? 'png' : 'jpg';
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const actionSuffix = 'modified';
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

      {/* Dedicated Image Panels (Tool 49, 50, 51, 52, 53, 54, 55, 81-85) */}
      {activeTab === 'compress' ? (
        <ImageCompressorPanel accentColor={accentColor} />
      ) : activeTab === 'resize' ? (
        <ImageResizerPanel accentColor={accentColor} />
      ) : activeTab === 'crop' ? (
        <ImageCropperPanel accentColor={accentColor} />
      ) : activeTab === 'rotate' ? (
        <ImageRotatorPanel accentColor={accentColor} />
      ) : activeTab === 'convert' ? (
        <ImageConverterPanel
          accentColor={accentColor}
          initialFormat={toolId === 53 ? 'jpeg' : toolId === 81 ? 'webp' : toolId === 82 ? 'png' : 'webp'}
        />
      ) : activeTab === 'pdf' ? (
        <ImageToPdfPanel accentColor={accentColor} />
      ) : activeTab === 'pdf_to_image' ? (
        <PdfToImagePanel accentColor={accentColor} />
      ) : activeTab === 'bg_remove' ? (
        <ImageBgRemoverPanel accentColor={accentColor} isChangerMode={false} />
      ) : activeTab === 'bg_change' ? (
        <ImageBgRemoverPanel accentColor={accentColor} isChangerMode={true} />
      ) : activeTab === 'watermark' ? (
        <ImageWatermarkPanel initialToolId={toolId} />
      ) : activeTab === 'stitch' ? (
        <ImageStitchPanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'palette' ? (
        <ImageColorPalettePanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'filter' ? (
        <ImageEnhancerPanel accentColor={accentColor} />
      ) : activeTab === 'blur' ? (
        <ImageBlurPanel accentColor={accentColor} />
      ) : activeTab === 'metadata' ? (
        <ImageMetadataPanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'favicon' ? (
        <FaviconGeneratorPanel accentColor={accentColor} />
      ) : activeTab === 'passport' ? (
        <PassportPhotoPanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'meme' ? (
        <MemeGeneratorPanel accentColor={accentColor} />
      ) : activeTab === 'compare' ? (
        <ImageComparePanel accentColor={accentColor} />
      ) : activeTab === 'upscale' ? (
        <ImageUpscalerPanel accentColor={accentColor} />
      ) : activeTab === 'ocr' ? (
        <ImageOcrPanel accentColor={accentColor} />
      ) : (
        <>
          {/* Upload Zone when no image selected */}
          {!file && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="image/*"
            multiple={false}
            label="Select or drop an image to start"
            sublabel="Supports JPG, PNG, WebP, SVG • 100% Offline • 100% Secure"
            files={[]}
            onFilesChange={handleFileChange}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Main Workspace when image loaded */}
      {file && (
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











          </div>

          {/* Right Column: PREVIEW & RESULT (ONLY SHOWS AFTER PROCESSING!) */}
          <div className="space-y-6">
            {/* Visual Preview Box */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {hasProcessed ? 'Processed Result' : 'Original Image'}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  {hasProcessed
                    ? `${processedWidth || originalWidth} × ${processedHeight || originalHeight} px`
                    : `${originalWidth} × ${originalHeight} px`}
                </span>
              </div>

              {/* Image Container */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 min-h-[280px] max-h-[420px] flex items-center justify-center p-3 select-none">
                <div className="relative inline-block max-h-[380px] max-w-full select-none">
                  <img
                    ref={imageElementRef}
                    src={hasProcessed && processedUrl ? processedUrl : (previewUrl || '')}
                    alt="Preview"
                    draggable={false}
                    style={{
                      transform: !hasProcessed ? `rotate(${rotation}deg) scaleX(${isFlippedH ? -1 : 1})` : undefined,
                    }}
                    className="max-h-[380px] max-w-full object-contain rounded-lg shadow-sm block select-none pointer-events-none"
                  />
                </div>
              </div>
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
                        Processing Complete!
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {downloadFilename}
                      </p>
                    </div>
                  </div>

                  {file && processedBlob.size < file.size && (
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
                      New Size
                    </span>
                    <p className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">
                      {formatBytes(processedBlob.size)}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      Resolution
                    </span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">
                      {`${processedWidth || originalWidth} × ${processedHeight || originalHeight} px`}
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
                    <span>Download Processed File</span>
                  </a>
                )}
              </div>
            )}

            {/* If NOT processed yet, show simple ready banner */}
            {!hasProcessed && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select your options on the left and click the button to process. Your file never leaves your device.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
