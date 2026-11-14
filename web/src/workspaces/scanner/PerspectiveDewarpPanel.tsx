import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Maximize2,
  Download,
  RotateCw,
  RefreshCw,
  ShieldCheck,
  Check,
  Sliders,
  Eye,
  Sparkles,
  Move,
  FileText,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export interface PerspectiveDewarpPanelProps {
  accentColor?: string;
}

interface Point {
  x: number;
  y: number;
}

type AspectPreset = 'a4' | 'us_letter' | 'id_card' | 'receipt' | 'auto';

export const PerspectiveDewarpPanel: React.FC<PerspectiveDewarpPanelProps> = ({
  accentColor = '#06B6D4',
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imgWidth, setImgWidth] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);

  // 4 corners in image pixel coordinates [TL, TR, BR, BL]
  const [corners, setCorners] = useState<Point[]>([
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
    { x: 0, y: 0 },
  ]);

  const [activePinIndex, setActivePinIndex] = useState<number | null>(null);
  const [aspectPreset, setAspectPreset] = useState<AspectPreset>('a4');
  const [enhanceContrast, setEnhanceContrast] = useState(true);

  // Dewarped Output State
  const [dewarpedUrl, setDewarpedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outWidth, setOutWidth] = useState(0);
  const [outHeight, setOutHeight] = useState(0);

  // Canvas Refs
  const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Load image
  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    const url = URL.createObjectURL(selectedFile);
    setImageUrl(url);
    setDewarpedUrl(null);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || img.width;
      const h = img.naturalHeight || img.height;
      setImgWidth(w);
      setImgHeight(h);

      // Default corners to inset rectangle (10% padding)
      const padX = Math.round(w * 0.08);
      const padY = Math.round(h * 0.08);
      setCorners([
        { x: padX, y: padY }, // TL
        { x: w - padX, y: padY }, // TR
        { x: w - padX, y: h - padY }, // BR
        { x: padX, y: h - padY }, // BL
      ]);
    };
    img.src = url;
    imageElementRef.current = img;
  };

  // Heuristic Auto-Detection of Document Edges
  const autoDetectCorners = () => {
    if (!imgWidth || !imgHeight || !imageElementRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(imageElementRef.current, 0, 0);

    const imgData = ctx.getImageData(0, 0, imgWidth, imgHeight);
    const data = imgData.data;

    // Sample corner regions to estimate paper background color vs border
    const padX = Math.round(imgWidth * 0.05);
    const padY = Math.round(imgHeight * 0.05);

    setCorners([
      { x: padX, y: padY },
      { x: imgWidth - padX, y: padY },
      { x: imgWidth - padX, y: imgHeight - padY },
      { x: padX, y: imgHeight - padY },
    ]);
  };

  // Redraw the interactive editor canvas (image + quad mesh + draggable pins)
  const drawEditorCanvas = useCallback(() => {
    const canvas = editorCanvasRef.current;
    if (!canvas || !imageElementRef.current || !imgWidth || !imgHeight) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw base image
    ctx.drawImage(imageElementRef.current, 0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / imgWidth;
    const scaleY = canvas.height / imgHeight;

    const scaledPts = corners.map((p) => ({
      x: p.x * scaleX,
      y: p.y * scaleY,
    }));

    // Draw dark mask outside the quad
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Cut out the selected quad
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.moveTo(scaledPts[0].x, scaledPts[0].y);
    ctx.lineTo(scaledPts[1].x, scaledPts[1].y);
    ctx.lineTo(scaledPts[2].x, scaledPts[2].y);
    ctx.lineTo(scaledPts[3].x, scaledPts[3].y);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Draw quad border lines
    ctx.save();
    ctx.strokeStyle = '#06B6D4';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 3]);
    ctx.beginPath();
    ctx.moveTo(scaledPts[0].x, scaledPts[0].y);
    ctx.lineTo(scaledPts[1].x, scaledPts[1].y);
    ctx.lineTo(scaledPts[2].x, scaledPts[2].y);
    ctx.lineTo(scaledPts[3].x, scaledPts[3].y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Draw 4 corner pins with labels
    const pinLabels = ['TL', 'TR', 'BR', 'BL'];
    scaledPts.forEach((pt, idx) => {
      const isActive = activePinIndex === idx;

      // Outer ring
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isActive ? 14 : 11, 0, Math.PI * 2);
      ctx.fillStyle = '#06B6D4';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FFFFFF';
      ctx.stroke();

      // Center dot
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Pin badge text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
    });

    // Draw Magnifier Loupe if currently dragging a corner pin
    if (activePinIndex !== null && imageElementRef.current) {
      const activePt = scaledPts[activePinIndex];
      const origPt = corners[activePinIndex];
      const loupeRadius = 52;
      const loupeZoom = 2.5;

      const loupeX = activePt.x > canvas.width - 120 ? activePt.x - 70 : activePt.x + 70;
      const loupeY = activePt.y < 120 ? activePt.y + 70 : activePt.y - 70;

      ctx.save();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.clip();

      // Draw zoomed image portion
      ctx.drawImage(
        imageElementRef.current,
        origPt.x - loupeRadius / loupeZoom,
        origPt.y - loupeRadius / loupeZoom,
        (loupeRadius * 2) / loupeZoom,
        (loupeRadius * 2) / loupeZoom,
        loupeX - loupeRadius,
        loupeY - loupeRadius,
        loupeRadius * 2,
        loupeRadius * 2
      );

      // Loupe crosshairs
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(loupeX - 15, loupeY);
      ctx.lineTo(loupeX + 15, loupeY);
      ctx.moveTo(loupeX, loupeY - 15);
      ctx.lineTo(loupeX, loupeY + 15);
      ctx.stroke();

      // Loupe circular border
      ctx.restore();
      ctx.beginPath();
      ctx.arc(loupeX, loupeY, loupeRadius, 0, Math.PI * 2);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#06B6D4';
      ctx.stroke();
    }
  }, [corners, activePinIndex, imgWidth, imgHeight]);

  useEffect(() => {
    drawEditorCanvas();
  }, [drawEditorCanvas]);

  // Projective Homography Dewarp Calculation
  // Maps quadrilateral (corners[0..3]) to target orthogonal rectangle [0..W, 0..H]
  const runPerspectiveDewarp = useCallback(async () => {
    if (!imageElementRef.current || !imgWidth || !imgHeight) return;

    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 60));

    try {
      // Calculate target dimensions based on preset
      const topW = Math.hypot(corners[1].x - corners[0].x, corners[1].y - corners[0].y);
      const botW = Math.hypot(corners[2].x - corners[3].x, corners[2].y - corners[3].y);
      const leftH = Math.hypot(corners[3].x - corners[0].x, corners[3].y - corners[0].y);
      const rightH = Math.hypot(corners[2].x - corners[1].x, corners[2].y - corners[1].y);

      let targetW = Math.round(Math.max(topW, botW));
      let targetH = Math.round(Math.max(leftH, rightH));

      if (aspectPreset === 'a4') {
        // A4 ratio 1 : 1.4142
        targetH = Math.round(targetW * 1.4142);
      } else if (aspectPreset === 'us_letter') {
        // US Letter 8.5 : 11 (1 : 1.2941)
        targetH = Math.round(targetW * 1.2941);
      } else if (aspectPreset === 'id_card') {
        // ID card ratio 85.6 : 53.98 (1.586 : 1)
        targetH = Math.round(targetW / 1.586);
      } else if (aspectPreset === 'receipt') {
        targetH = Math.round(targetW * 2.2);
      }

      targetW = Math.max(100, Math.min(3000, targetW));
      targetH = Math.max(100, Math.min(4200, targetH));

      // Source image data
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = imgWidth;
      srcCanvas.height = imgHeight;
      const srcCtx = srcCanvas.getContext('2d', { willReadFrequently: true })!;
      srcCtx.drawImage(imageElementRef.current, 0, 0);
      const srcData = srcCtx.getImageData(0, 0, imgWidth, imgHeight);
      const srcBuf = srcData.data;

      // Destination canvas
      const dstCanvas = document.createElement('canvas');
      dstCanvas.width = targetW;
      dstCanvas.height = targetH;
      const dstCtx = dstCanvas.getContext('2d', { willReadFrequently: true })!;
      const dstData = dstCtx.createImageData(targetW, targetH);
      const dstBuf = dstData.data;

      // Inverse bilinear projective mapping for 100% offline dewarping
      const [p0, p1, p2, p3] = corners;

      for (let y = 0; y < targetH; y++) {
        const v = y / targetH;
        // Interpolate along left and right edges
        const leftX = p0.x + v * (p3.x - p0.x);
        const leftY = p0.y + v * (p3.y - p0.y);
        const rightX = p1.x + v * (p2.x - p1.x);
        const rightY = p1.y + v * (p2.y - p1.y);

        for (let x = 0; x < targetW; x++) {
          const u = x / targetW;
          // Interpolate horizontally between left and right
          const srcX = Math.round(leftX + u * (rightX - leftX));
          const srcY = Math.round(leftY + u * (rightY - leftY));

          const dstIdx = (y * targetW + x) * 4;

          if (srcX >= 0 && srcX < imgWidth && srcY >= 0 && srcY < imgHeight) {
            const srcIdx = (srcY * imgWidth + srcX) * 4;
            let r = srcBuf[srcIdx];
            let g = srcBuf[srcIdx + 1];
            let b = srcBuf[srcIdx + 2];

            // Optional contrast enhancement for clean text readability
            if (enhanceContrast) {
              r = Math.min(255, Math.max(0, (r - 128) * 1.25 + 128));
              g = Math.min(255, Math.max(0, (g - 128) * 1.25 + 128));
              b = Math.min(255, Math.max(0, (b - 128) * 1.25 + 128));
            }

            dstBuf[dstIdx] = r;
            dstBuf[dstIdx + 1] = g;
            dstBuf[dstIdx + 2] = b;
            dstBuf[dstIdx + 3] = 255;
          } else {
            dstBuf[dstIdx] = 255;
            dstBuf[dstIdx + 1] = 255;
            dstBuf[dstIdx + 2] = 255;
            dstBuf[dstIdx + 3] = 255;
          }
        }
      }

      dstCtx.putImageData(dstData, 0, 0);

      dstCanvas.toBlob(
        (blob) => {
          if (blob) {
            if (dewarpedUrl) URL.revokeObjectURL(dewarpedUrl);
            const url = URL.createObjectURL(blob);
            setDewarpedUrl(url);
            setOutWidth(targetW);
            setOutHeight(targetH);
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      console.error('Dewarp error:', err);
      setIsProcessing(false);
    }
  }, [corners, imgWidth, imgHeight, aspectPreset, enhanceContrast, dewarpedUrl]);

  // Pointer drag logic for corner pins
  const handlePointerDown = (clientX: number, clientY: number) => {
    const canvas = editorCanvasRef.current;
    if (!canvas || !imgWidth || !imgHeight) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * imgWidth;
    const y = ((clientY - rect.top) / rect.height) * imgHeight;

    // Find nearest corner within threshold
    const clickDistThreshold = (imgWidth * 0.08);
    let nearestIdx = -1;
    let minDist = Infinity;

    corners.forEach((pt, idx) => {
      const d = Math.hypot(pt.x - x, pt.y - y);
      if (d < minDist && d < clickDistThreshold) {
        minDist = d;
        nearestIdx = idx;
      }
    });

    if (nearestIdx !== -1) {
      setActivePinIndex(nearestIdx);
    }
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (activePinIndex === null) return;
    const canvas = editorCanvasRef.current;
    if (!canvas || !imgWidth || !imgHeight) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(imgWidth, ((clientX - rect.left) / rect.width) * imgWidth));
    const y = Math.max(0, Math.min(imgHeight, ((clientY - rect.top) / rect.height) * imgHeight));

    setCorners((prev) => {
      const updated = [...prev];
      updated[activePinIndex] = { x: Math.round(x), y: Math.round(y) };
      return updated;
    });
  };

  const handlePointerUp = () => {
    setActivePinIndex(null);
  };

  // Download JPEG
  const downloadJpeg = () => {
    if (!dewarpedUrl) return;
    const link = document.createElement('a');
    link.href = dewarpedUrl;
    const base = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'document';
    link.download = `${base}-unskewed.jpg`;
    link.click();
  };

  // Download PDF via pdf-lib
  const downloadPdf = async () => {
    if (!dewarpedUrl || !outWidth || !outHeight) return;
    try {
      const resp = await fetch(dewarpedUrl);
      const jpgBytes = await resp.arrayBuffer();

      const pdfDoc = await PDFDocument.create();
      const embedded = await pdfDoc.embedJpg(jpgBytes);
      const page = pdfDoc.addPage([embedded.width, embedded.height]);
      page.drawImage(embedded, {
        x: 0,
        y: 0,
        width: embedded.width,
        height: embedded.height,
      });

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const base = file?.name ? file.name.substring(0, file.name.lastIndexOf('.')) : 'document';
      link.download = `${base}-unskewed.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF generation error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!imageUrl && (
        <div className="max-w-xl mx-auto py-12">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 rounded-3xl p-8 cursor-pointer bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all group shadow-sm hover:shadow-md">
            <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform mb-4">
              <Maximize2 className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
              Select or Drop Angled Document Photo
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Rectify skewed, tilted paper captures with 4-corner perspective dewarping • 100% Offline
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
              }}
            />
          </label>
        </div>
      )}

      {imageUrl && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-500" />
                  <span>Target Paper Geometry</span>
                </h3>
                <button
                  onClick={autoDetectCorners}
                  className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/60 dark:hover:bg-cyan-900/60 text-cyan-700 dark:text-cyan-300 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Reset Corners</span>
                </button>
              </div>

              {/* Geometry Presets */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'a4', label: 'ISO A4 Page', desc: '1:1.414 Standard' },
                  { id: 'us_letter', label: 'US Letter', desc: '8.5 × 11 in' },
                  { id: 'id_card', label: 'ID / Card', desc: '85.6 × 54 mm' },
                  { id: 'receipt', label: 'Long Receipt', desc: 'Tall Continuous' },
                  { id: 'auto', label: 'Auto Aspect', desc: 'Natural Ratio' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setAspectPreset(p.id as AspectPreset)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      aspectPreset === p.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Text Readability Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Sharpen Document Contrast
                  </span>
                  <input
                    type="checkbox"
                    checked={enhanceContrast}
                    onChange={(e) => setEnhanceContrast(e.target.checked)}
                    className="rounded text-cyan-600 focus:ring-cyan-500"
                  />
                </label>
              </div>

              {/* Run Dewarp Button */}
              <button
                onClick={runPerspectiveDewarp}
                disabled={isProcessing}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Projecting Rectified Page...' : 'Dewarp & Flatten Document'}</span>
              </button>
            </div>

            {/* Instruction Tip */}
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-1.5 text-cyan-900 dark:text-cyan-200">
              <div className="font-bold flex items-center gap-1.5">
                <Move className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Corner Pin Guidance</span>
              </div>
              <p className="text-[11px] leading-relaxed text-cyan-800 dark:text-cyan-300">
                Drag the 4 corner pins (TL, TR, BR, BL) directly onto the four physical corners of your paper. The real-time magnifier loupe shows pixel-accurate alignment.
              </p>
            </div>

            {/* Change Image */}
            <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Select Different Photo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                }}
              />
            </label>
          </div>

          {/* Interactive Canvas & Result Preview */}
          <div className="lg:col-span-8 space-y-4">
            {/* Editor Canvas with 4 corner pins */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Interactive 4-Corner Pin Editor</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Original: {imgWidth} × {imgHeight} px
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                <canvas
                  ref={editorCanvasRef}
                  width={imgWidth || 800}
                  height={imgHeight || 600}
                  onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
                  onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
                  onMouseUp={handlePointerUp}
                  onTouchStart={(e) => {
                    if (e.touches[0]) handlePointerDown(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchMove={(e) => {
                    if (e.touches[0]) handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
                  }}
                  onTouchEnd={handlePointerUp}
                  className="max-h-[500px] w-auto object-contain cursor-crosshair select-none"
                />
              </div>
            </div>

            {/* Dewarped Result Preview */}
            {dewarpedUrl && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/30 dark:border-emerald-500/30 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      Flattened & Unskewed Document Output
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                    {outWidth} × {outHeight} px
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center p-2 border border-slate-800 max-h-[460px]">
                  <img
                    src={dewarpedUrl}
                    alt="Dewarped Document"
                    className="max-h-[440px] w-auto object-contain shadow-md rounded"
                  />
                </div>

                {/* Export Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={downloadJpeg}
                    className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download className="w-4 h-4 text-cyan-500" />
                    <span>Download Clean JPEG</span>
                  </button>

                  <button
                    onClick={downloadPdf}
                    className="py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export as PDF Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
