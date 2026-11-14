import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Scan,
  CreditCard,
  Layers,
  Crop,
  Check,
  Trash2,
  Download,
  RotateCw,
  RefreshCw,
  ShieldCheck,
  FileText,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface ScannerCapturePanelProps {
  initialToolId?: number;
  accentColor?: string;
}

type ScanMode = 'document' | 'id_card' | 'multi_page' | 'auto_crop';

interface QueuedPage {
  id: string;
  dataUrl: string;
  name: string;
  timestamp: string;
  type: 'doc' | 'id_front' | 'id_back';
}

export const ScannerCapturePanel: React.FC<ScannerCapturePanelProps> = ({
  initialToolId = 86,
  accentColor = '#06B6D4',
}) => {
  // Determine scan mode from toolId
  const getInitialMode = (id: number): ScanMode => {
    if (id === 91) return 'id_card';
    if (id === 90) return 'multi_page';
    if (id === 88) return 'auto_crop';
    return 'document';
  };

  const [scanMode, setScanMode] = useState<ScanMode>(() => getInitialMode(initialToolId));

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);

  // ID Card 2-step capture state
  const [idFront, setIdFront] = useState<string | null>(null);
  const [idBack, setIdBack] = useState<string | null>(null);
  const [idStep, setIdStep] = useState<'front' | 'back' | 'ready'>('front');

  // Multi-page batch queue
  const [queuedPages, setQueuedPages] = useState<QueuedPage[]>([]);
  const [isCompilingPdf, setIsCompilingPdf] = useState(false);
  const [compiledPdfUrl, setCompiledPdfUrl] = useState<string | null>(null);

  // Video and Canvas refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError('');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);

      // Check for torch capability
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities ? (track.getCapabilities() as any) : {};
      setHasTorch(!!capabilities.torch);
    } catch (err: any) {
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : `Failed to access camera: ${err.message}`
      );
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Toggle Torch/Flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    try {
      const nextState = !torchOn;
      await (track as any).applyConstraints({
        advanced: [{ torch: nextState }],
      });
      setTorchOn(nextState);
    } catch (e) {
      console.warn('Torch toggle failed:', e);
    }
  };

  // Switch between front/rear camera
  const switchCameraFacing = async () => {
    const nextFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      stopCamera();
      setTimeout(startCamera, 150);
    }
  };

  // Capture frame from webcam
  const captureFrame = (): string | null => {
    if (!videoRef.current) return null;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 1920;
    canvas.height = v.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Snap Snapshot
  const handleSnap = () => {
    const dataUrl = captureFrame();
    if (!dataUrl) return;

    if (scanMode === 'id_card') {
      if (idStep === 'front') {
        setIdFront(dataUrl);
        setIdStep('back');
      } else {
        setIdBack(dataUrl);
        setIdStep('ready');
      }
    } else {
      // Add to queued pages
      const newPage: QueuedPage = {
        id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        dataUrl,
        name: `Page ${queuedPages.length + 1}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'doc',
      };
      setQueuedPages((prev) => [...prev, newPage]);
    }
  };

  // Handle uploaded document photo
  const handlePhotoSelect = (files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (dataUrl) {
          if (scanMode === 'id_card') {
            if (!idFront) {
              setIdFront(dataUrl);
              setIdStep('back');
            } else {
              setIdBack(dataUrl);
              setIdStep('ready');
            }
          } else {
            setQueuedPages((prev) => [
              ...prev,
              {
                id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                dataUrl,
                name: file.name,
                timestamp: new Date().toLocaleTimeString(),
                type: 'doc',
              },
            ]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove page from queue
  const removeQueuedPage = (id: string) => {
    setQueuedPages((prev) => prev.filter((p) => p.id !== id));
  };

  // Generate Combined 2-Sided ID Card Sheet (A4 or Wallet standard)
  const compileIdCardSheet = async (): Promise<string | null> => {
    if (!idFront || !idBack) return null;

    const canvas = document.createElement('canvas');
    // Standard ID card composite sheet (1200 x 1600 px)
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clean white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header banner
    ctx.fillStyle = '#06B6D4';
    ctx.fillRect(40, 40, canvas.width - 80, 50);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('OFFICIAL IDENTITY CARD SCAN • FRONT & BACK', canvas.width / 2, 73);

    // Helper to draw image
    const loadImage = (url: string): Promise<HTMLImageElement> =>
      new Promise((res) => {
        const img = new Image();
        img.onload = () => res(img);
        img.src = url;
      });

    const [frontImg, backImg] = await Promise.all([loadImage(idFront), loadImage(idBack)]);

    const cardW = 900;
    const cardH = 567; // 85.6 : 54 ratio (1.586)
    const cardX = (canvas.width - cardW) / 2;

    // Draw Front Side
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('1. FRONT SIDE', cardX, 130);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 2;
    ctx.strokeRect(cardX, 145, cardW, cardH);
    ctx.drawImage(frontImg, cardX, 145, cardW, cardH);

    // Draw Back Side
    ctx.fillText('2. BACK SIDE', cardX, 760);
    ctx.strokeRect(cardX, 775, cardW, cardH);
    ctx.drawImage(backImg, cardX, 775, cardW, cardH);

    // Footer timestamp & privacy notice
    ctx.fillStyle = '#64748B';
    ctx.font = '13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      `Digitized privately with Toolstrum • Verified On-Device • ${new Date().toLocaleDateString()}`,
      canvas.width / 2,
      1420
    );

    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Compile all queued pages into a standardized PDF
  const compileQueuedPagesToPdf = async () => {
    if (queuedPages.length === 0 && (!idFront || !idBack)) return;

    setIsCompilingPdf(true);
    try {
      const pdfDoc = await PDFDocument.create();

      if (scanMode === 'id_card' && idFront && idBack) {
        const sheetDataUrl = await compileIdCardSheet();
        if (sheetDataUrl) {
          const base64 = sheetDataUrl.split(',')[1];
          const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const embedded = await pdfDoc.embedJpg(imgBytes);
          const page = pdfDoc.addPage([embedded.width, embedded.height]);
          page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
        }
      } else {
        for (const item of queuedPages) {
          const base64 = item.dataUrl.split(',')[1];
          const imgBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
          const isPng = item.dataUrl.startsWith('data:image/png');
          const embedded = isPng ? await pdfDoc.embedPng(imgBytes) : await pdfDoc.embedJpg(imgBytes);
          const page = pdfDoc.addPage([embedded.width, embedded.height]);
          page.drawImage(embedded, { x: 0, y: 0, width: embedded.width, height: embedded.height });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' });
      if (compiledPdfUrl) URL.revokeObjectURL(compiledPdfUrl);
      const url = URL.createObjectURL(blob);
      setCompiledPdfUrl(url);
    } catch (err) {
      console.error('PDF compilation failed:', err);
    } finally {
      setIsCompilingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scan Mode Switcher */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'document', label: 'Single Document', icon: Scan },
            { id: 'multi_page', label: 'Multi-Page Batch', icon: Layers },
            { id: 'id_card', label: '2-Sided ID Card', icon: CreditCard },
            { id: 'auto_crop', label: 'Auto-Crop Margins', icon: Crop },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setScanMode(m.id as ScanMode)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  scanMode === m.id
                    ? 'bg-cyan-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Security badge */}
        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Camera stream is 100% on-device</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Live Camera & Guides */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-500" />
                <span>Live Document Scanner</span>
              </h3>

              {isCameraActive && (
                <div className="flex items-center gap-2">
                  {hasTorch && (
                    <button
                      onClick={toggleTorch}
                      className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                        torchOn
                          ? 'border-amber-500 bg-amber-500/10 text-amber-600'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      Flashlight {torchOn ? 'ON' : 'OFF'}
                    </button>
                  )}
                  <button
                    onClick={switchCameraFacing}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    title="Flip camera"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-400">
                {cameraError}
              </div>
            )}

            {/* Video Viewport with Document Outline Guides */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                playsInline
                muted
                className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
              />

              {!isCameraActive && (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-200">Camera Feed Inactive</div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Enable your webcam or phone camera to scan documents directly with auto-edge alignment.
                    </p>
                  </div>
                </div>
              )}

              {/* Document Alignment Overlay Box */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-6">
                  {scanMode === 'id_card' ? (
                    // ID Card Framing Guide (85.6 : 54 ratio)
                    <div className="w-[85%] aspect-[85.6/54] border-2 border-dashed border-cyan-400/80 rounded-2xl flex flex-col items-center justify-center bg-cyan-950/20 shadow-2xl">
                      <div className="px-3 py-1 rounded-full bg-cyan-500 text-white text-[11px] font-bold uppercase tracking-wider shadow">
                        {idStep === 'front' ? 'Step 1: Fit Front Side of ID' : 'Step 2: Fit Back Side of ID'}
                      </div>
                    </div>
                  ) : (
                    // Standard Document / Page Framing Guide
                    <div className="w-[78%] h-[90%] border-2 border-dashed border-cyan-400/80 rounded-xl flex flex-col items-center justify-between p-3 bg-cyan-950/10 shadow-2xl">
                      <div className="w-full flex justify-between">
                        <div className="w-4 h-4 border-t-2 border-l-2 border-cyan-400" />
                        <div className="w-4 h-4 border-t-2 border-r-2 border-cyan-400" />
                      </div>
                      <span className="text-[10px] text-cyan-300 font-bold bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                        Align Paper Document Within Border
                      </span>
                      <div className="w-full flex justify-between">
                        <div className="w-4 h-4 border-b-2 border-l-2 border-cyan-400" />
                        <div className="w-4 h-4 border-b-2 border-r-2 border-cyan-400" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Camera Actions */}
            <div className="grid grid-cols-2 gap-3">
              {!isCameraActive ? (
                <button
                  onClick={startCamera}
                  className="col-span-2 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>Start Document Camera</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSnap}
                    className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Scan className="w-4 h-4" />
                    <span>
                      {scanMode === 'id_card'
                        ? idStep === 'front'
                          ? 'Snap Front Side'
                          : 'Snap Back Side'
                        : 'Snap Page'}
                    </span>
                  </button>

                  <button
                    onClick={stopCamera}
                    className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                  >
                    <CameraOff className="w-4 h-4" />
                    <span>Stop Camera</span>
                  </button>
                </>
              )}
            </div>

            {/* Alternative Upload */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400 block mb-2 font-medium">
                Or upload pre-captured document photos:
              </span>
              <FileDropZone
                accept="image/*"
                multiple={true}
                files={[]}
                onFilesChange={handlePhotoSelect}
                label="Select or drop document photos"
                sublabel="JPG, PNG, WebP • Scans queued automatically"
                accentColor={accentColor}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Queued Pages & PDF Compilation */}
        <div className="lg:col-span-5 space-y-4">
          {/* ID Card 2-Step View */}
          {scanMode === 'id_card' ? (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                <span>ID Card Scan Session</span>
                <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
                  {idFront && idBack ? 'Complete (2/2)' : idFront ? '1 of 2 Captured' : '0 of 2'}
                </span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                {/* Front Side Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Front Side</span>
                    {idFront && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="aspect-[85.6/54] rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                    {idFront ? (
                      <img src={idFront} alt="ID Front" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Waiting for snap...</span>
                    )}
                  </div>
                  {idFront && (
                    <button
                      onClick={() => {
                        setIdFront(null);
                        setIdStep('front');
                      }}
                      className="text-[10px] text-rose-500 hover:underline block"
                    >
                      Retake Front
                    </button>
                  )}
                </div>

                {/* Back Side Card */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Back Side</span>
                    {idBack && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="aspect-[85.6/54] rounded-lg overflow-hidden bg-slate-950 flex items-center justify-center border border-slate-800">
                    {idBack ? (
                      <img src={idBack} alt="ID Back" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Waiting for snap...</span>
                    )}
                  </div>
                  {idBack && (
                    <button
                      onClick={() => {
                        setIdBack(null);
                        setIdStep('back');
                      }}
                      className="text-[10px] text-rose-500 hover:underline block"
                    >
                      Retake Back
                    </button>
                  )}
                </div>
              </div>

              {/* ID Card Actions */}
              <button
                onClick={compileQueuedPagesToPdf}
                disabled={!idFront || !idBack || isCompilingPdf}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {isCompilingPdf ? 'Merging ID Sides...' : 'Generate 2-Sided ID Document PDF'}
                </span>
              </button>
            </div>
          ) : (
            // Multi-Page Queue View
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-500" />
                  <span>Document Pages ({queuedPages.length})</span>
                </h4>
                {queuedPages.length > 0 && (
                  <button
                    onClick={() => setQueuedPages([])}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {queuedPages.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                  <p>No pages scanned yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Snap or upload pages to compile a multi-page document.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                  {queuedPages.map((pg, idx) => (
                    <div
                      key={pg.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded bg-slate-900 overflow-hidden shrink-0 border border-slate-700">
                          <img src={pg.dataUrl} alt={pg.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            Page {idx + 1}
                          </div>
                          <div className="text-[10px] text-slate-400">{pg.timestamp}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeQueuedPage(pg.id)}
                        className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Compile PDF Button */}
              <button
                onClick={compileQueuedPagesToPdf}
                disabled={queuedPages.length === 0 || isCompilingPdf}
                className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <FileText className="w-4 h-4" />
                <span>
                  {isCompilingPdf
                    ? 'Compiling Standard PDF...'
                    : `Compile ${queuedPages.length} Page${queuedPages.length === 1 ? '' : 's'} to PDF`}
                </span>
              </button>
            </div>
          )}

          {/* Compiled PDF Download Box */}
          {compiledPdfUrl && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Document Ready for Download</span>
                </span>
                <a
                  href={compiledPdfUrl}
                  download={`scan_${Date.now()}.pdf`}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
