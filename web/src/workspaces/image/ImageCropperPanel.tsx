import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import {
  Crop as CropIcon,
  Download,
  Trash2,
  Plus,
  ShieldCheck,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize2,
  AlignCenter,
  Sparkles,
  FileArchive,
  Eye,
  Check,
  Circle,
  Square,
  ArrowRightLeft,
  Sliders,
  Move,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export type AspectPreset =
  | 'free'
  | '1:1'
  | '4:5'
  | '16:9'
  | '9:16'
  | '4:3'
  | '3:2'
  | '2:1'
  | 'circle';

export interface CropPresetConfig {
  id: AspectPreset;
  label: string;
  ratio: number | null; // width / height
  badge?: string;
  isCircle?: boolean;
}

export const CROP_PRESETS: CropPresetConfig[] = [
  { id: 'free', label: 'Freeform', ratio: null, badge: 'Custom' },
  { id: '1:1', label: '1:1 Square', ratio: 1, badge: 'IG / Avatar' },
  { id: '4:5', label: '4:5 Portrait', ratio: 4 / 5, badge: 'IG Feed' },
  { id: '16:9', label: '16:9 Landscape', ratio: 16 / 9, badge: 'YouTube / X' },
  { id: '9:16', label: '9:16 Story', ratio: 9 / 16, badge: 'Reels / TikTok' },
  { id: '4:3', label: '4:3 Standard', ratio: 4 / 3, badge: 'Photo / Web' },
  { id: '3:2', label: '3:2 Classic', ratio: 3 / 2, badge: '35mm' },
  { id: '2:1', label: '2:1 Header', ratio: 2, badge: 'Banner' },
  { id: 'circle', label: 'Circular Avatar', ratio: 1, badge: 'Profile', isCircle: true },
];

export interface CroppedItem {
  id: string;
  file: File;
  originalSize: number;
  originalWidth: number;
  originalHeight: number;
  originalUrl: string;
  // Crop settings for this item
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  rotation: number; // 0, 90, 180, 270
  flipH: boolean;
  flipV: boolean;
  preset: AspectPreset;
  isCircle: boolean;
  // Result
  croppedBlob: Blob | null;
  croppedUrl: string | null;
  croppedSize: number;
  croppedWidth: number;
  croppedHeight: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
  outputName: string;
}

type DragMode = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move' | 'create' | null;

interface ImageCropperPanelProps {
  accentColor?: string;
}

export const ImageCropperPanel: React.FC<ImageCropperPanelProps> = ({
  accentColor = '#10B981',
}) => {
  const [items, setItems] = useState<CroppedItem[]>([]);
  const [activeInspectIndex, setActiveInspectIndex] = useState<number>(0);

  // Global output settings
  const [outputFormat, setOutputFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [quality, setQuality] = useState<number>(92);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Interactive overlay state for the active item
  const imageContainerRef = useRef<HTMLDivElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const [dragState, setDragState] = useState<{
    mode: DragMode;
    startX: number;
    startY: number;
    initialCropX: number;
    initialCropY: number;
    initialCropW: number;
    initialCropH: number;
    rectWidth: number;
    rectHeight: number;
  } | null>(null);

  const activeItem = items[activeInspectIndex] || null;

  // Format bytes helper
  const formatBytes = (bytes: number) => {
    if (bytes <= 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Helper to load image dimensions
  const loadImageInfo = (file: File): Promise<{ width: number; height: number; url: string }> => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.naturalWidth,
          height: img.naturalHeight,
          url,
        });
      };
      img.onerror = () => {
        resolve({ width: 800, height: 600, url });
      };
      img.src = url;
    });
  };

  // Calculate default centered crop for given aspect ratio
  const computeCenteredCrop = (
    origW: number,
    origH: number,
    preset: AspectPreset
  ): { x: number; y: number; w: number; h: number } => {
    const config = CROP_PRESETS.find((p) => p.id === preset);
    const ratio = config?.ratio;

    if (!ratio) {
      // Freeform: 90% of image centered
      const w = Math.round(origW * 0.9);
      const h = Math.round(origH * 0.9);
      return {
        x: Math.round((origW - w) / 2),
        y: Math.round((origH - h) / 2),
        w,
        h,
      };
    }

    let w = origW;
    let h = Math.round(w / ratio);

    if (h > origH) {
      h = origH;
      w = Math.round(h * ratio);
    }

    // Give 5% margin so it looks nice inside viewport
    w = Math.round(w * 0.9);
    h = Math.round(h * 0.9);

    return {
      x: Math.round((origW - w) / 2),
      y: Math.round((origH - h) / 2),
      w,
      h,
    };
  };

  // Handle uploaded files
  const handleFilesAdded = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    const loadedItems: CroppedItem[] = [];
    for (const f of newFiles) {
      const info = await loadImageInfo(f);
      const initialCrop = computeCenteredCrop(info.width, info.height, '1:1');
      const baseName = f.name.replace(/\.[^/.]+$/, '');

      loadedItems.push({
        id: Math.random().toString(36).substring(2, 9),
        file: f,
        originalSize: f.size,
        originalWidth: info.width,
        originalHeight: info.height,
        originalUrl: info.url,
        cropX: initialCrop.x,
        cropY: initialCrop.y,
        cropW: initialCrop.w,
        cropH: initialCrop.h,
        rotation: 0,
        flipH: false,
        flipV: false,
        preset: '1:1',
        isCircle: false,
        croppedBlob: null,
        croppedUrl: null,
        croppedSize: 0,
        croppedWidth: 0,
        croppedHeight: 0,
        status: 'pending',
        outputName: `${baseName}_cropped.png`,
      });
    }

    setItems((prev) => [...prev, ...loadedItems]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => {
      const target = prev[index];
      if (target?.originalUrl) URL.revokeObjectURL(target.originalUrl);
      if (target?.croppedUrl) URL.revokeObjectURL(target.croppedUrl);

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
      if (item.croppedUrl) URL.revokeObjectURL(item.croppedUrl);
    });
    setItems([]);
    setActiveInspectIndex(0);
  };

  // Update properties on active item
  const updateActiveItem = (updater: (item: CroppedItem) => CroppedItem) => {
    setItems((prev) => {
      if (!prev[activeInspectIndex]) return prev;
      const copy = [...prev];
      copy[activeInspectIndex] = updater(copy[activeInspectIndex]);
      return copy;
    });
  };

  // Change Aspect Ratio Preset
  const handleSelectPreset = (preset: AspectPreset) => {
    if (!activeItem) return;
    const isCircle = preset === 'circle';
    const newCrop = computeCenteredCrop(activeItem.originalWidth, activeItem.originalHeight, preset);
    updateActiveItem((item) => ({
      ...item,
      preset,
      isCircle,
      cropX: newCrop.x,
      cropY: newCrop.y,
      cropW: newCrop.w,
      cropH: newCrop.h,
      status: 'pending',
      croppedBlob: null,
      croppedUrl: null,
    }));
  };

  // Center the current crop box
  const handleCenterCrop = () => {
    if (!activeItem) return;
    const newX = Math.max(0, Math.round((activeItem.originalWidth - activeItem.cropW) / 2));
    const newY = Math.max(0, Math.round((activeItem.originalHeight - activeItem.cropH) / 2));
    updateActiveItem((item) => ({
      ...item,
      cropX: newX,
      cropY: newY,
    }));
  };

  // Fit / Maximize crop to entire image
  const handleFitFull = () => {
    if (!activeItem) return;
    updateActiveItem((item) => ({
      ...item,
      cropX: 0,
      cropY: 0,
      cropW: item.originalWidth,
      cropH: item.originalHeight,
      preset: 'free',
      isCircle: false,
    }));
  };

  // Swap / Invert aspect ratio (e.g. 16:9 to 9:16)
  const handleSwapAspect = () => {
    if (!activeItem) return;
    const newW = Math.min(activeItem.originalWidth, activeItem.cropH);
    const newH = Math.min(activeItem.originalHeight, activeItem.cropW);
    const newX = Math.max(0, Math.min(activeItem.cropX, activeItem.originalWidth - newW));
    const newY = Math.max(0, Math.min(activeItem.cropY, activeItem.originalHeight - newH));

    updateActiveItem((item) => ({
      ...item,
      cropW: newW,
      cropH: newH,
      cropX: newX,
      cropY: newY,
      preset: 'free',
    }));
  };

  // Rotate & Flip
  const handleRotate = (direction: 'cw' | 'ccw') => {
    if (!activeItem) return;
    const delta = direction === 'cw' ? 90 : -90;
    const newRot = (activeItem.rotation + delta + 360) % 360;
    updateActiveItem((item) => ({
      ...item,
      rotation: newRot,
      status: 'pending',
      croppedBlob: null,
      croppedUrl: null,
    }));
  };

  const handleFlip = (axis: 'h' | 'v') => {
    if (!activeItem) return;
    updateActiveItem((item) => ({
      ...item,
      flipH: axis === 'h' ? !item.flipH : item.flipH,
      flipV: axis === 'v' ? !item.flipV : item.flipV,
      status: 'pending',
      croppedBlob: null,
      croppedUrl: null,
    }));
  };

  // Manual Numeric Crop Coordinates
  const handleCoordinateChange = (
    key: 'cropX' | 'cropY' | 'cropW' | 'cropH',
    value: number
  ) => {
    if (!activeItem) return;
    const val = Math.max(10, Math.round(value));

    updateActiveItem((item) => {
      let x = item.cropX;
      let y = item.cropY;
      let w = item.cropW;
      let h = item.cropH;

      if (key === 'cropW') {
        w = Math.min(val, item.originalWidth);
        if (x + w > item.originalWidth) x = Math.max(0, item.originalWidth - w);
      } else if (key === 'cropH') {
        h = Math.min(val, item.originalHeight);
        if (y + h > item.originalHeight) y = Math.max(0, item.originalHeight - h);
      } else if (key === 'cropX') {
        x = Math.max(0, Math.min(val, item.originalWidth - w));
      } else if (key === 'cropY') {
        y = Math.max(0, Math.min(val, item.originalHeight - h));
      }

      return {
        ...item,
        cropX: x,
        cropY: y,
        cropW: w,
        cropH: h,
        preset: 'free',
      };
    });
  };

  // ========================================================
  // INTERACTIVE CROP BOX DRAGGING & RESIZING
  // ========================================================
  const startDrag = (
    mode: DragMode,
    clientX: number,
    clientY: number
  ) => {
    if (!activeItem || !imageElementRef.current) return;
    const rect = imageElementRef.current.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    if (mode === 'create') {
      const clickX = clientX - rect.left;
      const clickY = clientY - rect.top;
      const scaleX = activeItem.originalWidth / rect.width;
      const scaleY = activeItem.originalHeight / rect.height;
      const originX = Math.round(clickX * scaleX);
      const originY = Math.round(clickY * scaleY);

      setDragState({
        mode: 'create',
        startX: clientX,
        startY: clientY,
        initialCropX: originX,
        initialCropY: originY,
        initialCropW: 10,
        initialCropH: 10,
        rectWidth: rect.width,
        rectHeight: rect.height,
      });

      updateActiveItem((item) => ({
        ...item,
        cropX: originX,
        cropY: originY,
        cropW: 10,
        cropH: 10,
        preset: 'free',
      }));
      return;
    }

    setDragState({
      mode,
      startX: clientX,
      startY: clientY,
      initialCropX: activeItem.cropX,
      initialCropY: activeItem.cropY,
      initialCropW: activeItem.cropW,
      initialCropH: activeItem.cropH,
      rectWidth: rect.width,
      rectHeight: rect.height,
    });
  };

  const handlePointerMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState || !activeItem) return;

      const scaleX = activeItem.originalWidth / dragState.rectWidth;
      const scaleY = activeItem.originalHeight / dragState.rectHeight;
      const deltaX = (clientX - dragState.startX) * scaleX;
      const deltaY = (clientY - dragState.startY) * scaleY;

      const origW = activeItem.originalWidth;
      const origH = activeItem.originalHeight;

      if (dragState.mode === 'move') {
        let newX = dragState.initialCropX + deltaX;
        let newY = dragState.initialCropY + deltaY;

        newX = Math.max(0, Math.min(newX, origW - activeItem.cropW));
        newY = Math.max(0, Math.min(newY, origH - activeItem.cropH));

        updateActiveItem((item) => ({
          ...item,
          cropX: Math.round(newX),
          cropY: Math.round(newY),
        }));
        return;
      }

      if (dragState.mode === 'create') {
        let w = Math.abs(deltaX);
        let h = Math.abs(deltaY);
        let x = deltaX < 0 ? dragState.initialCropX + deltaX : dragState.initialCropX;
        let y = deltaY < 0 ? dragState.initialCropY + deltaY : dragState.initialCropY;

        x = Math.max(0, Math.min(x, origW - 10));
        y = Math.max(0, Math.min(y, origH - 10));
        w = Math.max(10, Math.min(w, origW - x));
        h = Math.max(10, Math.min(h, origH - y));

        updateActiveItem((item) => ({
          ...item,
          cropX: Math.round(x),
          cropY: Math.round(y),
          cropW: Math.round(w),
          cropH: Math.round(h),
        }));
        return;
      }

      // Handle 8 resize handles
      const activePresetConfig = CROP_PRESETS.find((p) => p.id === activeItem.preset);
      const lockedRatio = activePresetConfig?.ratio;

      let x = dragState.initialCropX;
      let y = dragState.initialCropY;
      let w = dragState.initialCropW;
      let h = dragState.initialCropH;

      const mode = dragState.mode;

      if (mode === 'se') {
        w = Math.max(20, Math.min(dragState.initialCropW + deltaX, origW - x));
        h = lockedRatio ? w / lockedRatio : Math.max(20, Math.min(dragState.initialCropH + deltaY, origH - y));
        if (lockedRatio && y + h > origH) {
          h = origH - y;
          w = h * lockedRatio;
        }
      } else if (mode === 'sw') {
        const potentialW = Math.max(20, dragState.initialCropW - deltaX);
        const shiftX = dragState.initialCropW - potentialW;
        x = Math.max(0, dragState.initialCropX + shiftX);
        w = dragState.initialCropX + dragState.initialCropW - x;
        h = lockedRatio ? w / lockedRatio : Math.max(20, Math.min(dragState.initialCropH + deltaY, origH - y));
        if (lockedRatio && y + h > origH) {
          h = origH - y;
          w = h * lockedRatio;
          x = dragState.initialCropX + dragState.initialCropW - w;
        }
      } else if (mode === 'ne') {
        w = Math.max(20, Math.min(dragState.initialCropW + deltaX, origW - x));
        const potentialH = lockedRatio ? w / lockedRatio : Math.max(20, dragState.initialCropH - deltaY);
        const shiftY = dragState.initialCropH - potentialH;
        y = Math.max(0, dragState.initialCropY + shiftY);
        h = dragState.initialCropY + dragState.initialCropH - y;
        if (lockedRatio) {
          w = h * lockedRatio;
        }
      } else if (mode === 'nw') {
        let targetW = Math.max(20, dragState.initialCropW - deltaX);
        let targetH = lockedRatio ? targetW / lockedRatio : Math.max(20, dragState.initialCropH - deltaY);

        if (lockedRatio) {
          if (dragState.initialCropX + dragState.initialCropW - targetW < 0) {
            targetW = dragState.initialCropX + dragState.initialCropW;
            targetH = targetW / lockedRatio;
          }
          if (dragState.initialCropY + dragState.initialCropH - targetH < 0) {
            targetH = dragState.initialCropY + dragState.initialCropH;
            targetW = targetH * lockedRatio;
          }
        }

        x = Math.max(0, dragState.initialCropX + dragState.initialCropW - targetW);
        y = Math.max(0, dragState.initialCropY + dragState.initialCropH - targetH);
        w = dragState.initialCropX + dragState.initialCropW - x;
        h = dragState.initialCropY + dragState.initialCropH - y;
      } else if (mode === 'e') {
        w = Math.max(20, Math.min(dragState.initialCropW + deltaX, origW - x));
        if (lockedRatio) h = w / lockedRatio;
      } else if (mode === 'w') {
        const potentialW = Math.max(20, dragState.initialCropW - deltaX);
        const shiftX = dragState.initialCropW - potentialW;
        x = Math.max(0, dragState.initialCropX + shiftX);
        w = dragState.initialCropX + dragState.initialCropW - x;
        if (lockedRatio) h = w / lockedRatio;
      } else if (mode === 's') {
        h = Math.max(20, Math.min(dragState.initialCropH + deltaY, origH - y));
        if (lockedRatio) w = h * lockedRatio;
      } else if (mode === 'n') {
        const potentialH = Math.max(20, dragState.initialCropH - deltaY);
        const shiftY = dragState.initialCropH - potentialH;
        y = Math.max(0, dragState.initialCropY + shiftY);
        h = dragState.initialCropY + dragState.initialCropH - y;
        if (lockedRatio) w = h * lockedRatio;
      }

      updateActiveItem((item) => ({
        ...item,
        cropX: Math.round(x),
        cropY: Math.round(y),
        cropW: Math.round(w),
        cropH: Math.round(h),
      }));
    },
    [dragState, activeItem]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (dragState) handlePointerMove(e.clientX, e.clientY);
    };
    const onMouseUp = () => setDragState(null);
    const onTouchMove = (e: TouchEvent) => {
      if (dragState && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onTouchEnd = () => setDragState(null);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [dragState, handlePointerMove]);

  // ========================================================
  // CORE CROP EXECUTION VIA OFFSCREEN CANVAS
  // ========================================================
  const executeCrop = async (item: CroppedItem): Promise<{
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
          // 1. First canvas to apply rotation / flips if any
          let sourceCanvas = document.createElement('canvas');
          let sWidth = img.naturalWidth;
          let sHeight = img.naturalHeight;

          if (item.rotation % 180 !== 0) {
            sourceCanvas.width = sHeight;
            sourceCanvas.height = sWidth;
          } else {
            sourceCanvas.width = sWidth;
            sourceCanvas.height = sHeight;
          }

          const sCtx = sourceCanvas.getContext('2d')!;
          sCtx.save();
          sCtx.translate(sourceCanvas.width / 2, sourceCanvas.height / 2);
          sCtx.rotate((item.rotation * Math.PI) / 180);
          sCtx.scale(item.flipH ? -1 : 1, item.flipV ? -1 : 1);
          sCtx.drawImage(img, -sWidth / 2, -sHeight / 2);
          sCtx.restore();

          // 2. Crop area canvas
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = item.cropW;
          cropCanvas.height = item.cropH;
          const cCtx = cropCanvas.getContext('2d')!;

          // If circular crop, clip circle
          if (item.isCircle) {
            cCtx.beginPath();
            cCtx.ellipse(
              item.cropW / 2,
              item.cropH / 2,
              item.cropW / 2,
              item.cropH / 2,
              0,
              0,
              2 * Math.PI
            );
            cCtx.clip();
          }

          cCtx.drawImage(
            sourceCanvas,
            item.cropX,
            item.cropY,
            item.cropW,
            item.cropH,
            0,
            0,
            item.cropW,
            item.cropH
          );

          // Format & Quality
          // Note: If circular crop, PNG or WebP is required for transparent background
          const actualFormat = item.isCircle && outputFormat === 'jpeg' ? 'png' : outputFormat;
          const mimeType =
            actualFormat === 'png'
              ? 'image/png'
              : actualFormat === 'webp'
              ? 'image/webp'
              : 'image/jpeg';

          cropCanvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to generate cropped image'));
                return;
              }
              const blobUrl = URL.createObjectURL(blob);
              resolve({
                blob,
                url: blobUrl,
                width: cropCanvas.width,
                height: cropCanvas.height,
                size: blob.size,
              });
            },
            mimeType,
            quality / 100
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Could not load source image'));
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
      const res = await executeCrop(activeItem);
      const ext = activeItem.isCircle && outputFormat === 'jpeg' ? 'png' : outputFormat;
      const baseName = activeItem.file.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_cropped_${activeItem.cropW}x${activeItem.cropH}.${ext}`;

      setItems((prev) => {
        const copy = [...prev];
        copy[activeInspectIndex] = {
          ...copy[activeInspectIndex],
          status: 'done',
          croppedBlob: res.blob,
          croppedUrl: res.url,
          croppedWidth: res.width,
          croppedHeight: res.height,
          croppedSize: res.size,
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
          error: err.message || 'Crop failed',
        };
        return copy;
      });
    }
  };

  // Process all pending items in batch
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
        const res = await executeCrop(cur);
        const ext = cur.isCircle && outputFormat === 'jpeg' ? 'png' : outputFormat;
        const baseName = cur.file.name.replace(/\.[^/.]+$/, '');
        const outName = `${baseName}_cropped_${cur.cropW}x${cur.cropH}.${ext}`;

        setItems((prev) => {
          const copy = [...prev];
          copy[i] = {
            ...copy[i],
            status: 'done',
            croppedBlob: res.blob,
            croppedUrl: res.url,
            croppedWidth: res.width,
            croppedHeight: res.height,
            croppedSize: res.size,
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

  // Download single item
  const handleDownloadSingle = (item: CroppedItem) => {
    if (!item.croppedUrl) return;
    const a = document.createElement('a');
    a.href = item.croppedUrl;
    a.download = item.outputName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download all as ZIP
  const handleDownloadAllZip = async () => {
    const doneItems = items.filter((i) => i.status === 'done' && i.croppedBlob);
    if (doneItems.length === 0) return;

    const zip = new JSZip();
    doneItems.forEach((item) => {
      zip.file(item.outputName, item.croppedBlob!);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum_cropped_batch_${doneItems.length}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Computed percentages for overlay
  const cropLeftPct = activeItem && activeItem.originalWidth > 0
    ? (activeItem.cropX / activeItem.originalWidth) * 100
    : 0;
  const cropTopPct = activeItem && activeItem.originalHeight > 0
    ? (activeItem.cropY / activeItem.originalHeight) * 100
    : 0;
  const cropWidthPct = activeItem && activeItem.originalWidth > 0
    ? (activeItem.cropW / activeItem.originalWidth) * 100
    : 0;
  const cropHeightPct = activeItem && activeItem.originalHeight > 0
    ? (activeItem.cropH / activeItem.originalHeight) * 100
    : 0;

  const completedCount = items.filter((i) => i.status === 'done').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Upload Zone when empty */}
      {items.length === 0 && (
        <div className="max-w-xl mx-auto py-8">
          <FileDropZone
            accept="image/*"
            multiple={true}
            label="Select or drop images to crop"
            sublabel="Supports JPG, PNG, WebP, AVIF • High precision 8-handle crop • 100% Offline"
            files={[]}
            onFilesChange={handleFilesAdded}
            accentColor={accentColor}
          />
        </div>
      )}

      {/* Main Workspace when at least 1 image is loaded */}
      {items.length > 0 && activeItem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT 7 COLS: Interactive Canvas Viewport & Batch Thumbnails */}
          <div className="lg:col-span-7 space-y-4">
            {/* Batch Thumbnail Selector if multiple images */}
            {items.length > 1 && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 overflow-hidden shadow-xs">
                <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-thin">
                  {items.map((it, idx) => (
                    <button
                      key={it.id}
                      type="button"
                      onClick={() => setActiveInspectIndex(idx)}
                      className={`relative flex-shrink-0 w-14 h-14 rounded-xl border-2 overflow-hidden transition-all cursor-pointer ${
                        idx === activeInspectIndex
                          ? 'border-emerald-500 shadow-sm scale-105'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={it.originalUrl}
                        alt={`Thumb ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {it.status === 'done' && (
                        <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label
                    htmlFor="add-more-crop-files"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add</span>
                    <input
                      id="add-more-crop-files"
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
                    title="Remove all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Canvas Toolbar (Rotate, Flip, Grid, Fit, Center) */}
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-2 shadow-xs text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleRotate('ccw')}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Rotate 90° CCW"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRotate('cw')}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                  title="Rotate 90° CW"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFlip('h')}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activeItem.flipH
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Flip Horizontal"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleFlip('v')}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    activeItem.flipV
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title="Flip Vertical"
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1" />
                <button
                  type="button"
                  onClick={handleSwapAspect}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                  title="Swap Width & Height"
                >
                  <ArrowRightLeft className="w-3 h-3 text-emerald-500" />
                  <span>Swap W/H</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCenterCrop}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                >
                  <AlignCenter className="w-3 h-3 text-emerald-500" />
                  <span>Center</span>
                </button>
                <button
                  type="button"
                  onClick={handleFitFull}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1 font-medium"
                >
                  <Maximize2 className="w-3 h-3 text-emerald-500" />
                  <span>Fit All</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer font-medium ${
                    showGrid
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  3×3 Grid
                </button>
              </div>
            </div>

            {/* THE INTERACTIVE CROPPING VIEWPORT */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3">
              <div
                ref={imageContainerRef}
                className="relative flex items-center justify-center p-3 rounded-xl bg-slate-950/90 overflow-hidden select-none min-h-[380px]"
                style={{
                  backgroundImage:
                    'radial-gradient(#334155 1px, transparent 1px), radial-gradient(#334155 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px',
                }}
              >
                {/* Source Image with transforms */}
                <div className="relative inline-block max-w-full">
                  <img
                    ref={imageElementRef}
                    src={activeItem.originalUrl}
                    alt="Crop preview target"
                    style={{
                      transform: `rotate(${activeItem.rotation}deg) scaleX(${
                        activeItem.flipH ? -1 : 1
                      }) scaleY(${activeItem.flipV ? -1 : 1})`,
                    }}
                    className="max-h-[460px] max-w-full object-contain rounded-lg shadow-sm block select-none pointer-events-none transition-transform duration-200"
                  />

                  {/* INTERACTIVE CROP OVERLAY */}
                  <div
                    onMouseDown={(e) => startDrag('create', e.clientX, e.clientY)}
                    onTouchStart={(e) => {
                      if (e.touches[0]) startDrag('create', e.touches[0].clientX, e.touches[0].clientY);
                    }}
                    className="absolute inset-0 cursor-crosshair select-none touch-none"
                  >
                    {/* 4 Dimmed Dark Masks around crop box */}
                    <div
                      style={{ height: `${cropTopPct}%` }}
                      className="absolute top-0 inset-x-0 bg-black/65 backdrop-blur-[1px] pointer-events-none"
                    />
                    <div
                      style={{ top: `${cropTopPct + cropHeightPct}%`, bottom: 0 }}
                      className="absolute inset-x-0 bg-black/65 backdrop-blur-[1px] pointer-events-none"
                    />
                    <div
                      style={{
                        top: `${cropTopPct}%`,
                        height: `${cropHeightPct}%`,
                        width: `${cropLeftPct}%`,
                      }}
                      className="absolute left-0 bg-black/65 backdrop-blur-[1px] pointer-events-none"
                    />
                    <div
                      style={{
                        top: `${cropTopPct}%`,
                        height: `${cropHeightPct}%`,
                        left: `${cropLeftPct + cropWidthPct}%`,
                        right: 0,
                      }}
                      className="absolute bg-black/65 backdrop-blur-[1px] pointer-events-none"
                    />

                    {/* THE DRAGGABLE CROP BOX */}
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
                      className={`absolute border-2 border-emerald-400 shadow-2xl cursor-move select-none touch-none group ${
                        activeItem.isCircle ? 'rounded-full' : ''
                      }`}
                    >
                      {/* Rule of Thirds Grid */}
                      {showGrid && !activeItem.isCircle && (
                        <>
                          <div className="absolute inset-x-0 top-1/3 border-t border-emerald-400/40 border-dashed pointer-events-none" />
                          <div className="absolute inset-x-0 top-2/3 border-t border-emerald-400/40 border-dashed pointer-events-none" />
                          <div className="absolute inset-y-0 left-1/3 border-l border-emerald-400/40 border-dashed pointer-events-none" />
                          <div className="absolute inset-y-0 left-2/3 border-l border-emerald-400/40 border-dashed pointer-events-none" />
                        </>
                      )}

                      {/* Circle Overlay outline if circle preset */}
                      {activeItem.isCircle && (
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-300 pointer-events-none" />
                      )}

                      {/* 8 RESIZE HANDLES */}
                      {/* NW Corner */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('nw', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('nw', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -top-2.5 -left-2.5 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-20"
                      >
                        <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-sm shadow-md" />
                      </div>

                      {/* N Edge */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('n', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('n', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4 flex items-center justify-center cursor-ns-resize z-20"
                      >
                        <div className="w-4 h-2 bg-white border border-emerald-600 rounded-xs shadow-md" />
                      </div>

                      {/* NE Corner */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('ne', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('ne', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -top-2.5 -right-2.5 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-20"
                      >
                        <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-sm shadow-md" />
                      </div>

                      {/* E Edge */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('e', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('e', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-6 flex items-center justify-center cursor-ew-resize z-20"
                      >
                        <div className="w-2 h-4 bg-white border border-emerald-600 rounded-xs shadow-md" />
                      </div>

                      {/* SE Corner */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('se', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('se', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -bottom-2.5 -right-2.5 w-6 h-6 flex items-center justify-center cursor-nwse-resize z-20"
                      >
                        <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-sm shadow-md" />
                      </div>

                      {/* S Edge */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('s', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('s', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-4 flex items-center justify-center cursor-ns-resize z-20"
                      >
                        <div className="w-4 h-2 bg-white border border-emerald-600 rounded-xs shadow-md" />
                      </div>

                      {/* SW Corner */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('sw', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('sw', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -bottom-2.5 -left-2.5 w-6 h-6 flex items-center justify-center cursor-nesw-resize z-20"
                      >
                        <div className="w-3.5 h-3.5 bg-white border-2 border-emerald-600 rounded-sm shadow-md" />
                      </div>

                      {/* W Edge */}
                      <div
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          startDrag('w', e.clientX, e.clientY);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          if (e.touches[0]) startDrag('w', e.touches[0].clientX, e.touches[0].clientY);
                        }}
                        className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-6 flex items-center justify-center cursor-ew-resize z-20"
                      >
                        <div className="w-2 h-4 bg-white border border-emerald-600 rounded-xs shadow-md" />
                      </div>

                      {/* Live Resolution Badge overlay */}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/85 text-white font-mono text-[11px] pointer-events-none shadow-md flex items-center gap-1.5 backdrop-blur-xs border border-white/10">
                        <CropIcon className="w-3 h-3 text-emerald-400" />
                        <span>
                          {activeItem.cropW} × {activeItem.cropH} px
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cursor Hints */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
                <span className="flex items-center gap-1.5">
                  <Move className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Drag inside box to move • Drag handles to resize • Click & drag outside to draw new area</span>
                </span>
                <span>
                  Source: {activeItem.originalWidth} × {activeItem.originalHeight} px
                </span>
              </div>
            </div>

            {/* LIVE PREVIEW OF CROPPED RESULT IF GENERATED */}
            {activeItem.status === 'done' && activeItem.croppedUrl && (
              <div className="p-5 bg-white dark:bg-slate-900 border-2 border-emerald-500/40 rounded-2xl shadow-md space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Cropped Result Ready
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {activeItem.croppedWidth} × {activeItem.croppedHeight} px • {formatBytes(activeItem.croppedSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadSingle(activeItem)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>

                <div className="flex justify-center p-3 rounded-xl bg-slate-950/90 max-h-56 overflow-hidden">
                  <img
                    src={activeItem.croppedUrl}
                    alt="Cropped output"
                    className="max-h-52 object-contain rounded-lg shadow-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* RIGHT 5 COLS: Aspect Presets, Coordinates, Format, Action Button */}
          <div className="lg:col-span-5 space-y-5">
            {/* Aspect Ratio Presets Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CropIcon className="w-4 h-4 text-emerald-500" />
                  <span>Aspect Ratio Presets</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Choose a popular standard format or create a custom crop.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {CROP_PRESETS.map((preset) => {
                  const isSelected = activeItem.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                          {preset.isCircle ? (
                            <Circle className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Square className="w-3 h-3 text-slate-400" />
                          )}
                          <span>{preset.label}</span>
                        </span>
                      </div>
                      {preset.badge && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                          {preset.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exact Pixel Coordinates Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-500" />
                  <span>Crop Coordinates & Dimensions</span>
                </h3>
                <button
                  type="button"
                  onClick={handleCenterCrop}
                  className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-[11px] font-semibold cursor-pointer"
                >
                  Center
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-slate-600 dark:text-slate-400 mb-1 block font-medium">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max={activeItem.originalWidth}
                    value={activeItem.cropW}
                    onChange={(e) => handleCoordinateChange('cropW', Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 mb-1 block font-medium">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max={activeItem.originalHeight}
                    value={activeItem.cropH}
                    onChange={(e) => handleCoordinateChange('cropH', Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 mb-1 block font-medium">
                    X Position (px)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={activeItem.originalWidth - activeItem.cropW}
                    value={activeItem.cropX}
                    onChange={(e) => handleCoordinateChange('cropX', Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="text-slate-600 dark:text-slate-400 mb-1 block font-medium">
                    Y Position (px)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={activeItem.originalHeight - activeItem.cropH}
                    value={activeItem.cropY}
                    onChange={(e) => handleCoordinateChange('cropY', Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Output Format & Quality Settings */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Output Format & Quality
              </h3>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'png', label: 'PNG Lossless', sub: 'Preserves Alpha' },
                  { id: 'webp', label: 'WebP Smart', sub: 'Compact & Crisp' },
                  { id: 'jpeg', label: 'JPEG Photo', sub: 'Smallest File' },
                ].map((fmt) => (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setOutputFormat(fmt.id as any)}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      outputFormat === fmt.id
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {fmt.label}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      {fmt.sub}
                    </div>
                  </button>
                ))}
              </div>

              {outputFormat !== 'png' && (
                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span>Quality Level</span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {quality}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleProcessActive}
                disabled={activeItem.status === 'processing'}
                className="w-full py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
              >
                <CropIcon className="w-5 h-5" />
                <span>
                  {activeItem.status === 'processing'
                    ? 'Cropping Image...'
                    : `Crop Image (${activeItem.cropW} × ${activeItem.cropH} px)`}
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
                    <span>Crop All ({items.length})</span>
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

            {/* Offline Privacy Guarantee Pill */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 py-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Client-Side Processing • Your photos never leave your device</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
