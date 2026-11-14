import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Grid,
  Columns,
  Rows,
  Scissors,
  Layers,
  Smartphone,
  Download,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  FileArchive,
  Palette,
  Sliders,
  Check,
  Eye,
  RefreshCw,
} from 'lucide-react';
import JSZip from 'jszip';
import { useFlipList } from '../../utils/useFlipList';

export interface ImageStitchPanelProps {
  initialToolId?: number; // 61: Collage, 62: Merger, 63: Splitter, 80: Screenshot Stitcher
  accentColor?: string;
}

interface LoadedStitchImage {
  id: string;
  name: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  size: number;
  imgElement?: HTMLImageElement;
}

interface SplitTileResult {
  row: number;
  col: number;
  index: number;
  blob: Blob;
  previewUrl: string;
  filename: string;
  width: number;
  height: number;
}

type MainMode = 'combine' | 'split';
type CombineLayout = 'vertical' | 'horizontal' | 'grid';
type SplitPreset = '3x3_instagram' | '3x1_carousel' | '2x2_quad' | 'custom';

export const ImageStitchPanel: React.FC<ImageStitchPanelProps> = ({
  initialToolId = 61,
}) => {
  // Determine default mode based on initial tool
  const defaultMode: MainMode = initialToolId === 63 ? 'split' : 'combine';
  const defaultLayout: CombineLayout =
    initialToolId === 80
      ? 'vertical'
      : initialToolId === 62
      ? 'horizontal'
      : 'grid';

  const [activeMode, setActiveMode] = useState<MainMode>(defaultMode);

  // Combine / Collage states
  const [combineLayout, setCombineLayout] = useState<CombineLayout>(defaultLayout);
  const [gridColumns, setGridColumns] = useState<number>(2);
  const [spacing, setSpacing] = useState<number>(initialToolId === 80 ? 0 : 12); // Gap in px
  const [outerPadding, setOuterPadding] = useState<number>(initialToolId === 80 ? 0 : 12);
  const [borderRadius, setBorderRadius] = useState<number>(initialToolId === 80 ? 0 : 8);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [normalizeSizes, setNormalizeSizes] = useState<boolean>(true); // Auto-align heights or widths

  // Split states (Tool 63)
  const [splitRows, setSplitRows] = useState<number>(3);
  const [splitCols, setSplitCols] = useState<number>(3);
  const [splitPreset, setSplitPreset] = useState<SplitPreset>('3x3_instagram');
  const [splitTiles, setSplitTiles] = useState<SplitTileResult[]>([]);

  // Images state
  const [images, setImages] = useState<LoadedStitchImage[]>([]);
  const { registerItem: registerStitchItem } = useFlipList(images, (item) => item.id, {
    duration: 340,
    easing: 'cubic-bezier(0.2, 0.95, 0.3, 1)',
  });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingProgress, setProcessingProgress] = useState<string>('');

  // Combined result state
  const [combinedBlob, setCombinedBlob] = useState<Blob | null>(null);
  const [combinedUrl, setCombinedUrl] = useState<string | null>(null);
  const [combinedDimensions, setCombinedDimensions] = useState<{ width: number; height: number } | null>(null);

  // Format settings
  const [exportFormat, setExportFormat] = useState<'png' | 'webp' | 'jpeg'>('png');
  const [exportQuality, setExportQuality] = useState<number>(92);

  // Canvas ref for live rendering
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // File upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileList = Array.from(e.target.files);

    const loadedList: LoadedStitchImage[] = [];
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
          imgElement: img,
        });
        pending--;
        if (pending === 0) {
          setImages((prev) => [...prev, ...loadedList]);
          setCombinedBlob(null);
          setCombinedUrl(null);
        }
      };
      img.onerror = () => {
        pending--;
        if (pending === 0 && loadedList.length > 0) {
          setImages((prev) => [...prev, ...loadedList]);
        }
      };
      img.src = url;
    });
    e.target.value = '';
  };

  // Reorder items in combine queue
  const moveImage = (index: number, direction: 'prev' | 'next') => {
    const targetIdx = direction === 'prev' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    setCombinedBlob(null);
    setCombinedUrl(null);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(images[index].previewUrl);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setCombinedBlob(null);
    setCombinedUrl(null);
  };

  // Helper to draw rounded rect on canvas
  const drawRoundedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    x: number,
    y: number,
    w: number,
    h: number,
    radius: number
  ) => {
    if (radius <= 0) {
      ctx.drawImage(img, x, y, w, h);
      return;
    }
    ctx.save();
    ctx.beginPath();
    const r = Math.min(radius, w / 2, h / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
  };

  // Render Combined Canvas
  const renderCombinedCanvas = useCallback(async (): Promise<{ blob: Blob; width: number; height: number } | null> => {
    if (images.length === 0) return null;

    // Ensure all images are loaded
    const loadedImages: HTMLImageElement[] = [];
    for (const item of images) {
      if (item.imgElement) {
        loadedImages.push(item.imgElement);
      } else {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = item.previewUrl;
        });
        loadedImages.push(img);
      }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    let totalW = 0;
    let totalH = 0;

    if (combineLayout === 'vertical') {
      // Find standard target width (max width or average)
      const targetW = normalizeSizes
        ? Math.max(...loadedImages.map((i) => i.naturalWidth))
        : Math.max(...loadedImages.map((i) => i.naturalWidth));

      // Calculate scaled heights
      const scaledHeights = loadedImages.map((img) =>
        normalizeSizes ? Math.round(img.naturalHeight * (targetW / img.naturalWidth)) : img.naturalHeight
      );

      totalW = targetW + outerPadding * 2;
      totalH =
        scaledHeights.reduce((sum, h) => sum + h, 0) +
        spacing * (loadedImages.length - 1) +
        outerPadding * 2;

      canvas.width = totalW;
      canvas.height = totalH;

      // Background fill
      if (backgroundColor === 'transparent') {
        ctx.clearRect(0, 0, totalW, totalH);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, totalW, totalH);
      }

      // Draw vertical tiles
      let curY = outerPadding;
      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        const h = scaledHeights[i];
        const w = targetW;
        drawRoundedImage(ctx, img, outerPadding, curY, w, h, borderRadius);
        curY += h + spacing;
      }
    } else if (combineLayout === 'horizontal') {
      // Standard target height
      const targetH = normalizeSizes
        ? Math.max(...loadedImages.map((i) => i.naturalHeight))
        : Math.max(...loadedImages.map((i) => i.naturalHeight));

      const scaledWidths = loadedImages.map((img) =>
        normalizeSizes ? Math.round(img.naturalWidth * (targetH / img.naturalHeight)) : img.naturalWidth
      );

      totalW =
        scaledWidths.reduce((sum, w) => sum + w, 0) +
        spacing * (loadedImages.length - 1) +
        outerPadding * 2;
      totalH = targetH + outerPadding * 2;

      canvas.width = totalW;
      canvas.height = totalH;

      if (backgroundColor === 'transparent') {
        ctx.clearRect(0, 0, totalW, totalH);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, totalW, totalH);
      }

      let curX = outerPadding;
      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        const w = scaledWidths[i];
        const h = targetH;
        drawRoundedImage(ctx, img, curX, outerPadding, w, h, borderRadius);
        curX += w + spacing;
      }
    } else {
      // GRID LAYOUT
      const cols = Math.max(1, gridColumns);
      const rows = Math.ceil(loadedImages.length / cols);

      // Determine uniform cell size
      const maxW = Math.max(...loadedImages.map((i) => i.naturalWidth));
      const maxH = Math.max(...loadedImages.map((i) => i.naturalHeight));
      const cellW = maxW;
      const cellH = maxH;

      totalW = cellW * cols + spacing * (cols - 1) + outerPadding * 2;
      totalH = cellH * rows + spacing * (rows - 1) + outerPadding * 2;

      canvas.width = totalW;
      canvas.height = totalH;

      if (backgroundColor === 'transparent') {
        ctx.clearRect(0, 0, totalW, totalH);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, totalW, totalH);
      }

      for (let i = 0; i < loadedImages.length; i++) {
        const img = loadedImages[i];
        const c = i % cols;
        const r = Math.floor(i / cols);

        const x = outerPadding + c * (cellW + spacing);
        const y = outerPadding + r * (cellH + spacing);

        if (normalizeSizes) {
          // Fit contain within uniform cell
          const aspect = img.naturalWidth / img.naturalHeight;
          let drawW = cellW;
          let drawH = cellW / aspect;
          if (drawH > cellH) {
            drawH = cellH;
            drawW = cellH * aspect;
          }
          const offsetX = x + (cellW - drawW) / 2;
          const offsetY = y + (cellH - drawH) / 2;
          drawRoundedImage(ctx, img, offsetX, offsetY, drawW, drawH, borderRadius);
        } else {
          drawRoundedImage(ctx, img, x, y, cellW, cellH, borderRadius);
        }
      }
    }

    return new Promise((resolve) => {
      const mime =
        exportFormat === 'png'
          ? 'image/png'
          : exportFormat === 'webp'
          ? 'image/webp'
          : 'image/jpeg';
      const quality = exportFormat === 'png' ? undefined : exportQuality / 100;
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ blob, width: totalW, height: totalH });
          } else {
            resolve(null);
          }
        },
        mime,
        quality
      );
    });
  }, [
    images,
    combineLayout,
    gridColumns,
    spacing,
    outerPadding,
    borderRadius,
    backgroundColor,
    normalizeSizes,
    exportFormat,
    exportQuality,
  ]);

  // Split Image Execution (Tool 63)
  const executeSplitImage = useCallback(async () => {
    if (images.length === 0) return;
    setIsProcessing(true);
    setProcessingProgress('Slicing image into grid tiles...');
    setSplitTiles([]);

    const baseItem = images[0];
    const img = new Image();

    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = baseItem.previewUrl;
    });

    const tileW = Math.floor(img.naturalWidth / splitCols);
    const tileH = Math.floor(img.naturalHeight / splitRows);
    const results: SplitTileResult[] = [];

    let tileIndex = 1;
    for (let r = 0; r < splitRows; r++) {
      for (let c = 0; c < splitCols; c++) {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = tileW;
        offCanvas.height = tileH;
        const ctx = offCanvas.getContext('2d');
        if (!ctx) continue;

        const srcX = c * tileW;
        const srcY = r * tileH;
        ctx.drawImage(img, srcX, srcY, tileW, tileH, 0, 0, tileW, tileH);

        await new Promise<void>((resolveBlob) => {
          offCanvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                results.push({
                  row: r + 1,
                  col: c + 1,
                  index: tileIndex,
                  blob,
                  previewUrl: url,
                  filename: `${baseItem.name.replace(/\.[^/.]+$/, '')}_tile_${r + 1}_${c + 1}.png`,
                  width: tileW,
                  height: tileH,
                });
              }
              resolveBlob();
            },
            'image/png'
          );
        });
        tileIndex++;
      }
    }

    setSplitTiles(results);
    setIsProcessing(false);
    setProcessingProgress('');
  }, [images, splitRows, splitCols]);

  // Live Canvas sync for preview
  useEffect(() => {
    if (activeMode === 'combine' && images.length > 0) {
      renderCombinedCanvas().then((res) => {
        if (res) {
          if (combinedUrl) URL.revokeObjectURL(combinedUrl);
          setCombinedBlob(res.blob);
          setCombinedUrl(URL.createObjectURL(res.blob));
          setCombinedDimensions({ width: res.width, height: res.height });
        }
      });
    }
  }, [activeMode, images, renderCombinedCanvas]);

  // Download combined image
  const handleDownloadCombined = () => {
    if (!combinedUrl) return;
    const link = document.createElement('a');
    link.href = combinedUrl;
    const prefix =
      initialToolId === 80
        ? 'stitched_screenshot'
        : initialToolId === 62
        ? 'merged_panorama'
        : 'collage_grid';
    link.download = `${prefix}_${Date.now()}.${exportFormat}`;
    link.click();
  };

  // Download all split tiles as a ZIP
  const handleDownloadSplitZip = async () => {
    if (splitTiles.length === 0) return;
    setIsProcessing(true);
    setProcessingProgress('Compressing tiles into ZIP archive...');
    try {
      const zip = new JSZip();
      splitTiles.forEach((tile) => {
        zip.file(tile.filename, tile.blob);
      });
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `toolstrum_split_grid_${splitRows}x${splitCols}_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
      setProcessingProgress('');
    }
  };

  // Preset setter for split
  const applySplitPreset = (preset: SplitPreset) => {
    setSplitPreset(preset);
    if (preset === '3x3_instagram') {
      setSplitRows(3);
      setSplitCols(3);
    } else if (preset === '3x1_carousel') {
      setSplitRows(1);
      setSplitCols(3);
    } else if (preset === '2x2_quad') {
      setSplitRows(2);
      setSplitCols(2);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone when no images loaded */}
      {images.length === 0 ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-900/60 shadow-xs hover:border-emerald-500 transition-colors">
          <input
            type="file"
            multiple={activeMode === 'combine'}
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            {initialToolId === 80 ? (
              <Smartphone className="w-8 h-8" />
            ) : initialToolId === 63 ? (
              <Scissors className="w-8 h-8" />
            ) : (
              <Grid className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {initialToolId === 80
              ? 'Upload Screenshots to Stitch Together'
              : initialToolId === 63
              ? 'Upload Photo to Slice into Grid Tiles'
              : 'Upload Photos to Combine & Collage'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            {initialToolId === 63
              ? 'Slice into 3x3 Instagram grids, 3x1 swipeable carousels, or custom rows and columns with one-click ZIP download.'
              : 'Stitch vertically into scrolling screenshots, side-by-side panoramas, or balanced 2x2 / 3x2 photo collages.'}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 shadow-sm transition">
            <Plus className="w-4 h-4" />
            <span>Select Photos from Computer</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Stage (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Workspace Mode Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveMode('combine')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMode === 'combine'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Combine & Collage ({images.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMode('split')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    activeMode === 'split'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Split into Tiles</span>
                </button>
              </div>

              {/* Add more photos button */}
              {activeMode === 'combine' && (
                <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Photos</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PREVIEW STAGE */}
            {activeMode === 'combine' ? (
              <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
                {combinedUrl ? (
                  <div className="text-center space-y-2">
                    <img
                      src={combinedUrl}
                      alt="Combined Result"
                      className="max-w-full max-h-[500px] object-contain rounded-lg shadow-lg mx-auto"
                    />
                    {combinedDimensions && (
                      <p className="text-[11px] font-mono text-slate-400">
                        {combinedDimensions.width} × {combinedDimensions.height} px
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
                    <span>Composing layout...</span>
                  </div>
                )}
              </div>
            ) : (
              /* SPLIT PREVIEW STAGE */
              <div className="space-y-4">
                <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
                  {images[0] && (
                    <div className="relative inline-block max-w-full max-h-[500px]">
                      <img
                        src={images[0].previewUrl}
                        alt="Split Base"
                        className="max-w-full max-h-[500px] object-contain rounded"
                      />
                      {/* Interactive Grid Cut Lines Overlay */}
                      <div
                        className="absolute inset-0 grid pointer-events-none border-2 border-emerald-500/80 rounded"
                        style={{
                          gridTemplateRows: `repeat(${splitRows}, minmax(0, 1fr))`,
                          gridTemplateColumns: `repeat(${splitCols}, minmax(0, 1fr))`,
                        }}
                      >
                        {Array.from({ length: splitRows * splitCols }).map((_, idx) => (
                          <div
                            key={idx}
                            className="border border-dashed border-emerald-400/60 bg-emerald-500/10 flex items-center justify-center"
                          >
                            <span className="px-1.5 py-0.5 rounded bg-slate-950/80 text-emerald-400 font-mono font-bold text-[10px]">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Sliced Tiles Grid Output */}
                {splitTiles.length > 0 && (
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Sliced Tiles ({splitTiles.length} segments)
                      </span>
                      <button
                        type="button"
                        onClick={handleDownloadSplitZip}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition"
                      >
                        <FileArchive className="w-3.5 h-3.5" />
                        <span>Download All as ZIP</span>
                      </button>
                    </div>

                    <div
                      className="grid gap-2"
                      style={{
                        gridTemplateColumns: `repeat(${Math.min(splitCols, 4)}, minmax(0, 1fr))`,
                      }}
                    >
                      {splitTiles.map((tile) => (
                        <div
                          key={tile.index}
                          className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 aspect-square flex items-center justify-center"
                        >
                          <img
                            src={tile.previewUrl}
                            alt={tile.filename}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1 p-2">
                            <span className="text-[10px] font-mono text-white font-bold">
                              Tile #{tile.index}
                            </span>
                            <a
                              href={tile.previewUrl}
                              download={tile.filename}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition"
                              title="Download Tile"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          </div>
                          <span className="absolute bottom-1 right-1 px-1 rounded bg-slate-900/80 text-[9px] font-mono text-slate-300">
                            #{tile.index}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Reorderable Sequence Strip (Combine mode) */}
            {activeMode === 'combine' && images.length > 0 && (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Photo Sequence ({images.length} photos)</span>
                  <div className="flex items-center gap-2">
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setImages((prev) =>
                              [...prev].sort((a, b) =>
                                a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
                              )
                            );
                            setCombinedBlob(null);
                            setCombinedUrl(null);
                          }}
                          className="text-[11px] font-medium text-slate-500 hover:text-emerald-500 cursor-pointer"
                          title="Sort alphabetically"
                        >
                          Sort A-Z
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setImages((prev) => [...prev].reverse());
                            setCombinedBlob(null);
                            setCombinedUrl(null);
                          }}
                          className="text-[11px] font-medium text-slate-500 hover:text-emerald-500 cursor-pointer"
                          title="Reverse order"
                        >
                          Reverse
                        </button>
                      </>
                    )}
                    <span className="text-slate-400 text-[11px]">Use arrows to rearrange</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {images.map((item, idx) => (
                    <div
                      key={item.id}
                      ref={registerStitchItem(item.id)}
                      className="group relative flex-shrink-0 w-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-1 space-y-1 transition-[background-color,border-color,box-shadow] duration-200"
                    >
                      <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-950">
                        <img
                          src={item.previewUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center justify-between px-1">
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400">
                          #{idx + 1}
                        </span>
                        <div className="flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'prev')}
                            disabled={idx === 0}
                            className="p-0.5 rounded text-slate-500 hover:text-emerald-600 disabled:opacity-30"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveImage(idx, 'next')}
                            disabled={idx === images.length - 1}
                            className="p-0.5 rounded text-slate-500 hover:text-emerald-600 disabled:opacity-30"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="p-0.5 rounded text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Configuration Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            {/* COMBINE SETTINGS CARD */}
            {activeMode === 'combine' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  <span>Layout & Stitch Options</span>
                </h3>

                {/* Layout Type Pills */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'vertical', label: 'Vertical (Stitch)', icon: Rows },
                    { id: 'horizontal', label: 'Horizontal (Row)', icon: Columns },
                    { id: 'grid', label: 'Grid Collage', icon: Grid },
                  ].map((l) => {
                    const IconComp = l.icon;
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setCombineLayout(l.id as any)}
                        className={`p-2.5 rounded-xl flex flex-col items-center gap-1 text-xs font-semibold transition ${
                          combineLayout === l.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[11px]">{l.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Grid Columns if Grid Layout */}
                {combineLayout === 'grid' && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>Columns Across</span>
                      <span className="text-emerald-600 font-bold">{gridColumns} Columns</span>
                    </div>
                    <div className="flex gap-2">
                      {[2, 3, 4].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => setGridColumns(col)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                            gridColumns === col
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {col} Cols
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spacing & Padding Sliders */}
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Tile Spacing Gap</span>
                      <span className="text-emerald-600">{spacing}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="48"
                      value={spacing}
                      onChange={(e) => setSpacing(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Outer Border Padding</span>
                      <span className="text-emerald-600">{outerPadding}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="48"
                      value={outerPadding}
                      onChange={(e) => setOuterPadding(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Rounded Corners</span>
                      <span className="text-emerald-600">{borderRadius}px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      value={borderRadius}
                      onChange={(e) => setBorderRadius(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Canvas Background Color */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    Matte Background Fill
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { id: '#FFFFFF', label: 'White' },
                      { id: '#0F172A', label: 'Dark' },
                      { id: '#F1F5F9', label: 'Light' },
                      { id: 'transparent', label: 'Transparent' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setBackgroundColor(bg.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          backgroundColor === bg.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Normalize */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={normalizeSizes}
                      onChange={(e) => setNormalizeSizes(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 accent-emerald-500"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Auto-normalize image dimensions for clean aligned edges
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* SPLIT SETTINGS CARD (Tool 63) */}
            {activeMode === 'split' && (
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Scissors className="w-4 h-4 text-emerald-500" />
                  <span>Grid Slicing Settings</span>
                </h3>

                {/* Presets */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Social & Layout Presets
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '3x3_instagram', label: '3×3 Instagram Feed (9 Tiles)' },
                      { id: '3x1_carousel', label: '3×1 Swipe Carousel (3 Tiles)' },
                      { id: '2x2_quad', label: '2×2 Quad Split (4 Tiles)' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applySplitPreset(p.id as any)}
                        className={`p-2 rounded-xl text-center text-xs font-semibold transition ${
                          splitPreset === p.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Rows & Cols */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Rows ({splitRows})
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={splitRows}
                      onChange={(e) => {
                        setSplitRows(Number(e.target.value));
                        setSplitPreset('custom');
                      }}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                      Columns ({splitCols})
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={splitCols}
                      onChange={(e) => {
                        setSplitCols(Number(e.target.value));
                        setSplitPreset('custom');
                      }}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Trigger Slice Button */}
                <button
                  type="button"
                  onClick={executeSplitImage}
                  disabled={isProcessing}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Scissors className="w-4 h-4" />
                  <span>
                    {isProcessing
                      ? 'Slicing Photo...'
                      : `Slice into ${splitRows * splitCols} Grid Tiles`}
                  </span>
                </button>
              </div>
            )}

            {/* EXPORT ACTION CARD (Combine mode) */}
            {activeMode === 'combine' && (
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

                {/* Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadCombined}
                  disabled={!combinedUrl || isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Assembled Photo ({exportFormat.toUpperCase()})</span>
                </button>
              </div>
            )}

            {/* Offline Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% Offline Canvas Processing. Your files stay private on device.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
