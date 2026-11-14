import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  User,
  Download,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  Printer,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Crop,
  Grid,
  FileArchive,
  Eye,
} from 'lucide-react';
import { PDFDocument, PageSizes } from 'pdf-lib';

export interface PassportPhotoPanelProps {
  initialToolId?: number; // 75: Single Passport Maker, 76: ID Sheet Maker
  accentColor?: string;
}

interface PassportStandard {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  widthPx300Dpi: number;
  heightPx300Dpi: number;
}

const STANDARDS: PassportStandard[] = [
  {
    id: 'us_india_2x2',
    name: '2×2 in (51×51 mm)',
    country: 'United States & India',
    widthMm: 51,
    heightMm: 51,
    widthPx300Dpi: 600,
    heightPx300Dpi: 600,
  },
  {
    id: 'eu_uk_35x45',
    name: '35×45 mm',
    country: 'EU, UK, Schengen & Australia',
    widthMm: 35,
    heightMm: 45,
    widthPx300Dpi: 413,
    heightPx300Dpi: 531,
  },
  {
    id: 'china_33x48',
    name: '33×48 mm',
    country: 'China Visa & Passport',
    widthMm: 33,
    heightMm: 48,
    widthPx300Dpi: 390,
    heightPx300Dpi: 567,
  },
  {
    id: 'canada_50x70',
    name: '50×70 mm',
    country: 'Canada Passport',
    widthMm: 50,
    heightMm: 70,
    widthPx300Dpi: 590,
    heightPx300Dpi: 826,
  },
];

export const PassportPhotoPanel: React.FC<PassportPhotoPanelProps> = ({
  initialToolId = 75,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgNaturalWidth, setImgNaturalWidth] = useState<number>(0);
  const [imgNaturalHeight, setImgNaturalHeight] = useState<number>(0);

  // Standard & Layout
  const [selectedStandard, setSelectedStandard] = useState<PassportStandard>(STANDARDS[0]);
  const [layoutMode, setLayoutMode] = useState<'sheet_4x6' | 'sheet_a4' | 'single'>(
    initialToolId === 76 ? 'sheet_4x6' : 'single'
  );

  // Face alignment adjustments
  const [scale, setScale] = useState<number>(100); // 80 to 180%
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [includeCutLines, setIncludeCutLines] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploaded = e.target.files[0];
    const url = URL.createObjectURL(uploaded);
    setFile(uploaded);
    setImageUrl(url);

    const img = new Image();
    img.onload = () => {
      setImgNaturalWidth(img.naturalWidth);
      setImgNaturalHeight(img.naturalHeight);
      setScale(100);
      setPanX(0);
      setPanY(0);
    };
    img.src = url;
    e.target.value = '';
  };

  // Render Single Biometric Photo Tile onto an offscreen canvas
  const renderSingleTile = useCallback(
    (targetCanvas: HTMLCanvasElement) => {
      if (!imageElementRef.current) return;
      const img = imageElementRef.current;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const targetW = selectedStandard.widthPx300Dpi;
      const targetH = selectedStandard.heightPx300Dpi;
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;

      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, targetW, targetH);

      // Draw photo scaled & centered
      const imgAspect = img.naturalWidth / img.naturalHeight;
      const targetAspect = targetW / targetH;
      let drawW = targetW;
      let drawH = targetH;

      if (imgAspect > targetAspect) {
        drawW = targetH * imgAspect;
      } else {
        drawH = targetW / imgAspect;
      }

      const s = scale / 100;
      drawW *= s;
      drawH *= s;

      const posX = (targetW - drawW) / 2 + panX;
      const posY = (targetH - drawH) / 2 + panY;

      ctx.drawImage(img, posX, posY, drawW, drawH);

      // Draw subtle outer cut line
      if (includeCutLines) {
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, targetW, targetH);
      }
    },
    [selectedStandard, bgColor, scale, panX, panY, includeCutLines]
  );

  // Render Full Layout (Single, 4x6 Sheet, or A4 Sheet)
  const renderComposition = useCallback(
    (targetCanvas: HTMLCanvasElement, showGuides = true) => {
      if (!imageElementRef.current) return;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      // 1. Single photo preview
      if (layoutMode === 'single') {
        renderSingleTile(targetCanvas);

        // Biometric Face Framing Oval Overlay Guide
        if (showGuides && showBiometricGuide) {
          const w = selectedStandard.widthPx300Dpi;
          const h = selectedStandard.heightPx300Dpi;

          ctx.save();
          // Head oval guide
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);

          const headW = w * 0.44;
          const headH = h * 0.58;
          ctx.beginPath();
          ctx.ellipse(w / 2, h * 0.45, headW / 2, headH / 2, 0, 0, Math.PI * 2);
          ctx.stroke();

          // Eye level guideline
          ctx.strokeStyle = '#3B82F6';
          ctx.beginPath();
          ctx.moveTo(w * 0.2, h * 0.42);
          ctx.lineTo(w * 0.8, h * 0.42);
          ctx.stroke();

          // Chin level guideline
          ctx.strokeStyle = '#F59E0B';
          ctx.beginPath();
          ctx.moveTo(w * 0.3, h * 0.72);
          ctx.lineTo(w * 0.7, h * 0.72);
          ctx.stroke();

          ctx.restore();
        }
      } else {
        // Multi-photo sheet layout
        const tileCanvas = document.createElement('canvas');
        renderSingleTile(tileCanvas);

        let sheetW = 1800; // 4x6 inch at 300 DPI (1800 x 1200)
        let sheetH = 1200;
        let cols = 3;
        let rows = 2;

        if (layoutMode === 'sheet_a4') {
          // A4 at 300 DPI = 2480 x 3508
          sheetW = 2480;
          sheetH = 3508;
          cols = 4;
          rows = 4; // 16 photos
        }

        targetCanvas.width = sheetW;
        targetCanvas.height = sheetH;

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, sheetW, sheetH);

        const tileW = selectedStandard.widthPx300Dpi;
        const tileH = selectedStandard.heightPx300Dpi;
        const gap = 40;

        const totalGridW = cols * tileW + (cols - 1) * gap;
        const totalGridH = rows * tileH + (rows - 1) * gap;

        const startX = (sheetW - totalGridW) / 2;
        const startY = (sheetH - totalGridH) / 2;

        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const x = startX + c * (tileW + gap);
            const y = startY + r * (tileH + gap);
            ctx.drawImage(tileCanvas, x, y);

            if (includeCutLines) {
              ctx.strokeStyle = '#CBD5E1';
              ctx.lineWidth = 1;
              ctx.strokeRect(x, y, tileW, tileH);
            }
          }
        }
      }
    },
    [
      layoutMode,
      selectedStandard,
      showBiometricGuide,
      includeCutLines,
      renderSingleTile,
    ]
  );

  // Sync canvas preview
  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;
    renderComposition(canvasRef.current, true);
  }, [imageUrl, renderComposition]);

  // Download High-Res 300 DPI JPEG
  const handleDownloadJpeg = () => {
    if (!imageElementRef.current || !file) return;
    setIsProcessing(true);
    try {
      const exportCanvas = document.createElement('canvas');
      renderComposition(exportCanvas, false); // No guidelines

      exportCanvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            const prefix =
              layoutMode === 'single'
                ? `passport_${selectedStandard.id}`
                : `id_photo_sheet_${layoutMode}`;
            link.download = `${prefix}_${Date.now()}.jpg`;
            link.click();
            URL.revokeObjectURL(url);
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.98
      );
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  // Download Printable PDF Document via pdf-lib
  const handleDownloadPdf = async () => {
    if (!imageElementRef.current || !file) return;
    setIsProcessing(true);
    try {
      const exportCanvas = document.createElement('canvas');
      renderComposition(exportCanvas, false);

      const jpegDataUrl = exportCanvas.toDataURL('image/jpeg', 0.95);
      const jpegBytes = await fetch(jpegDataUrl).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.create();
      // Set page dimensions according to sheet type
      const pageDims =
        layoutMode === 'sheet_a4'
          ? PageSizes.A4
          : [432, 288] as [number, number]; // 4x6" in points (6 x 72, 4 x 72)

      const page = pdfDoc.addPage(pageDims);
      const embedded = await pdfDoc.embedJpg(jpegBytes);

      page.drawImage(embedded, {
        x: 0,
        y: 0,
        width: page.getWidth(),
        height: page.getHeight(),
      });

      const pdfBytes = await pdfDoc.save();
      const pdfBlob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `toolstrum_id_photos_${Date.now()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
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
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            {initialToolId === 76
              ? 'Upload Photo for Printable ID Photo Sheet'
              : 'Upload Photo to Create Official Passport Photo'}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            US 2×2", Schengen 35×45mm, and biometric ID layouts with eye-level oval alignment guides and 300 DPI print export.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 shadow-sm transition">
            <User className="w-4 h-4" />
            <span>Select Headshot Photo</span>
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
                  onClick={() => setLayoutMode('single')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    layoutMode === 'single'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Crop className="w-3.5 h-3.5" />
                  <span>Single Photo (Align)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('sheet_4x6')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    layoutMode === 'sheet_4x6'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>4×6" Print Sheet (6 Photos)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLayoutMode('sheet_a4')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    layoutMode === 'sheet_a4'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>A4 Document Sheet (16 Photos)</span>
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
              alt="Headshot"
              className="hidden"
              crossOrigin="anonymous"
            />

            {/* Canvas Preview Area */}
            <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[500px] object-contain rounded shadow-lg block select-none"
              />

              {layoutMode === 'single' && showBiometricGuide && (
                <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur border border-slate-700 text-[11px] text-slate-300 pointer-events-none flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Align eyes with blue line, chin with amber line</span>
                </div>
              )}
            </div>

            {/* Pan & Scale Controls (When in single alignment mode) */}
            {layoutMode === 'single' && (
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    Face Alignment & Framing
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={showBiometricGuide}
                      onChange={(e) => setShowBiometricGuide(e.target.checked)}
                      className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-500"
                    />
                    <span>Show Biometric Guide Overlay</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Zoom Scale</span>
                      <span className="text-emerald-600 font-bold">{scale}%</span>
                    </div>
                    <input
                      type="range"
                      min="70"
                      max="180"
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Pan Up / Down</span>
                      <span className="text-emerald-600 font-bold">{panY}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={panY}
                      onChange={(e) => setPanY(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Pan Left / Right</span>
                      <span className="text-emerald-600 font-bold">{panX}px</span>
                    </div>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={panX}
                      onChange={(e) => setPanX(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Configuration Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Standard Specification Selector */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-500" />
                <span>Official Passport Standard</span>
              </h3>

              <div className="space-y-2">
                {STANDARDS.map((std) => (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => setSelectedStandard(std)}
                    className={`w-full p-3 rounded-xl border text-left transition ${
                      selectedStandard.id === std.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{std.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-mono">
                        300 DPI Print
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {std.country}
                    </p>
                  </button>
                ))}
              </div>

              {/* Background Color & Guidelines */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Matte Background Fill
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { id: '#FFFFFF', label: 'Solid White (Standard)' },
                      { id: '#F1F5F9', label: 'Light Off-White' },
                      { id: '#E0F2FE', label: 'Light Blue' },
                    ].map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        onClick={() => setBgColor(bg.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                          bgColor === bg.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                            : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {bg.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={includeCutLines}
                    onChange={(e) => setIncludeCutLines(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 accent-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Include border scissor cut lines on sheet
                  </span>
                </label>
              </div>
            </div>

            {/* Print & Download Action Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-500" />
                <span>Export & Print Options</span>
              </h3>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadJpeg}
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>Download 300 DPI Print JPEG</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={isProcessing}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Download Print-Ready PDF Sheet</span>
                </button>
              </div>
              <p className="text-[11px] text-center text-slate-400">
                Printed at 100% scale without 'fit to page' margins for exact millimeter passport dimensions.
              </p>
            </div>

            {/* Offline Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% Private Offline Processing. Your passport photos are never transmitted online.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
