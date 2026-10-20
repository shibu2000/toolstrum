import React, { useState, useRef, useEffect } from 'react';
import {
  Scan,
  Camera,
  CameraOff,
  Image as ImageIcon,
  FileText,
  Sliders,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  ShieldCheck,
  Check,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { FileDropZone } from '../components/common/FileDropZone';
import { getToolById } from '../data/webRegistry';

interface ScannerWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

interface ScannedPage {
  id: string;
  dataUrl: string;
  timestamp: string;
  enhanced: boolean;
}

export const ScannerWorkspace: React.FC<ScannerWorkspaceProps> = ({
  toolId,
  accentColor = '#06B6D4',
}) => {
  // Tabs:
  // Tools 86-91: Live camera document scanner
  // Tools 92-97: Document filter enhancer (B&W / Grayscale / Sharp)
  // Tools 98-103: Multi-page scan session & PDF compilation
  const getInitialTab = () => {
    if ((toolId >= 92 && toolId <= 97) || toolId === 99) return 'enhance';
    if (toolId >= 98 && toolId <= 103) return 'multipage';
    return 'camera';
  };

  const [activeTab, setActiveTab] = useState<'camera' | 'enhance' | 'multipage'>(getInitialTab);

  // Camera stream state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Enhancement controls
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'original' | 'document_bw' | 'grayscale' | 'enhanced'>('document_bw');
  const [threshold, setThreshold] = useState(128);
  const [contrast, setContrast] = useState(1.4);
  const [brightness, setBrightness] = useState(1.1);

  // Multi-page batch
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [generatedPdfBlob, setGeneratedPdfBlob] = useState<Blob | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Sync tab on toolId change
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

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

  // Capture Snapshot from Camera
  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 1280;
    canvas.height = v.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    processCapturedImage(dataUrl);
  };

  // Handle uploaded document photo
  const handlePhotoSelect = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        processCapturedImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const processCapturedImage = (dataUrl: string) => {
    setCurrentImage(dataUrl);
    // Add to multi-page scan list
    const newPage: ScannedPage = {
      id: Date.now().toString(),
      dataUrl,
      timestamp: new Date().toLocaleTimeString(),
      enhanced: false,
    };
    setPages((prev) => [...prev, newPage]);
    setActiveTab('enhance');
  };

  // Apply Document Filters (High-Contrast B&W / Grayscale / Sharp)
  const applyFilterToCanvas = (
    imgSrc: string,
    mode: 'original' | 'document_bw' | 'grayscale' | 'enhanced',
    thresh: number,
    cont: number,
    bright: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imgSrc);
          return;
        }

        ctx.drawImage(img, 0, 0);
        if (mode === 'original') {
          resolve(canvas.toDataURL('image/jpeg', 0.92));
          return;
        }

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i];
          let g = data[i + 1];
          let b = data[i + 2];

          // Compute luminance
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;

          if (mode === 'document_bw') {
            // Adaptive Stark Document B&W Filter (Receipt / Document scanner)
            const adjustedLum = (lum - 128) * cont + 128 * bright;
            const finalVal = adjustedLum > thresh ? 255 : 0;
            data[i] = finalVal;
            data[i + 1] = finalVal;
            data[i + 2] = finalVal;
          } else if (mode === 'grayscale') {
            // Grayscale with contrast
            const adjusted = (lum - 128) * cont + 128;
            const clamped = Math.max(0, Math.min(255, adjusted));
            data[i] = clamped;
            data[i + 1] = clamped;
            data[i + 2] = clamped;
          } else if (mode === 'enhanced') {
            // Color punch with contrast & brightness boost
            data[i] = Math.max(0, Math.min(255, (r - 128) * cont + 128 * bright));
            data[i + 1] = Math.max(0, Math.min(255, (g - 128) * cont + 128 * bright));
            data[i + 2] = Math.max(0, Math.min(255, (b - 128) * cont + 128 * bright));
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = imgSrc;
    });
  };

  // Re-apply filter whenever controls change
  const [filteredPreview, setFilteredPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!currentImage) return;
    let isCancelled = false;

    applyFilterToCanvas(currentImage, filterMode, threshold, contrast, brightness).then(
      (res) => {
        if (!isCancelled) {
          setFilteredPreview(res);
        }
      }
    );

    return () => {
      isCancelled = true;
    };
  }, [currentImage, filterMode, threshold, contrast, brightness]);

  // Save filtered version back to active page
  const saveEnhancedPage = () => {
    if (!filteredPreview || pages.length === 0) return;
    setPages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        ...updated[updated.length - 1],
        dataUrl: filteredPreview,
        enhanced: true,
      };
      return updated;
    });
    setActiveTab('multipage');
  };

  // Compile All Pages to a single PDF using pdf-lib
  const compilePagesToPdf = async () => {
    if (pages.length === 0) {
      setErrorMsg('No scanned pages to compile. Please scan or upload at least one page.');
      return;
    }

    try {
      setIsGeneratingPdf(true);
      setErrorMsg('');

      const pdfDoc = await PDFDocument.create();

      for (const page of pages) {
        // Convert dataUrl to array buffer
        const base64Data = page.dataUrl.split(',')[1];
        const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

        const isPng = page.dataUrl.startsWith('data:image/png');
        const embeddedImage = isPng
          ? await pdfDoc.embedPng(imageBytes)
          : await pdfDoc.embedJpg(imageBytes);

        const pdfPage = pdfDoc.addPage([embeddedImage.width, embeddedImage.height]);
        pdfPage.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as Uint8Array<ArrayBuffer>], { type: 'application/pdf' });
      setGeneratedPdfBlob(blob);
    } catch (e: any) {
      setErrorMsg(`Failed to build PDF: ${e.message}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Scan className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Document Scanner'}
          </h2>
          {pages.length > 0 && (
            <span className="ml-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 px-2 py-0.5 rounded-full">
              {pages.length} page{pages.length === 1 ? '' : 's'} queued
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Scan documents using your camera and save as clean PDFs. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Capture & Feeds */}
        <div className="space-y-6">
          {/* TAB 1: CAMERA SCANNER */}
          {activeTab === 'camera' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Live Webcam Document Scanner
                  </h3>
                </div>
                {isCameraActive && (
                  <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed Active
                  </span>
                )}
              </div>

              {cameraError && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-400">
                  {cameraError}
                </div>
              )}

              {/* Video Feed Box */}
              <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center border border-slate-200 dark:border-slate-800">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!isCameraActive ? 'hidden' : ''}`}
                />

                {!isCameraActive && (
                  <div className="text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-slate-400">
                      Camera is stopped. Click below to start live document scanner.
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Actions */}
              <div className="grid grid-cols-2 gap-3">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="col-span-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    Start Document Camera
                  </button>
                ) : (
                  <>
                    <button
                      onClick={captureSnapshot}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Scan className="w-4 h-4" />
                      Capture Page Scan
                    </button>
                    <button
                      onClick={stopCamera}
                      className="py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CameraOff className="w-4 h-4" />
                      Stop Camera
                    </button>
                  </>
                )}
              </div>

              {/* Upload alternative */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-medium">
                  Or select an existing document picture:
                </p>
                <FileDropZone
                  accept="image/*"
                  maxFiles={1}
                  files={[]}
                  onFilesChange={handlePhotoSelect}
                  label="Select Document Photo"
                  sublabel="JPEG, PNG, WebP document photos"
                  accentColor={accentColor}
                />
              </div>
            </div>
          )}

          {/* TAB 2: ENHANCE & FILTER */}
          {activeTab === 'enhance' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Document Contrast & B&W Filters
                  </h3>
                </div>
                <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono bg-cyan-50 dark:bg-cyan-950/60 px-2 py-0.5 rounded-full">
                  Adaptive Threshold
                </span>
              </div>

              {/* Filter Preset Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'document_bw', label: 'B&W Scan' },
                  { id: 'grayscale', label: 'Grayscale' },
                  { id: 'enhanced', label: 'Color Boost' },
                  { id: 'original', label: 'Original' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setFilterMode(mode.id as any)}
                    className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                      filterMode === mode.id
                        ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 text-cyan-700 dark:text-cyan-300 font-bold'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Sliders */}
              {filterMode === 'document_bw' && (
                <div className="space-y-3 pt-2">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>B&W Threshold Sensitivity</span>
                      <span className="font-mono">{threshold}</span>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={200}
                      value={threshold}
                      onChange={(e) => setThreshold(parseInt(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span>Contrast Multiplier</span>
                      <span className="font-mono">{contrast.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={3}
                      step={0.1}
                      value={contrast}
                      onChange={(e) => setContrast(parseFloat(e.target.value))}
                      className="w-full accent-cyan-600 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={saveEnhancedPage}
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Enhanced Page to PDF Batch
                </button>
                <button
                  onClick={() => setActiveTab('camera')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Scan More
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MULTI-PAGE & PDF EXPORT */}
          {activeTab === 'multipage' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Compile Scanned Document to PDF
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {pages.length} {pages.length === 1 ? 'Page' : 'Pages'}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Merges all captured and filtered document pages into a single standardized PDF file. 100% Offline • 100% Secure.
              </p>

              <button
                onClick={compilePagesToPdf}
                disabled={pages.length === 0 || isGeneratingPdf}
                className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                {isGeneratingPdf ? 'Generating PDF...' : `Compile ${pages.length} Pages into PDF`}
              </button>

              {generatedPdfBlob && (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                      PDF Compiled Successfully ({(generatedPdfBlob.size / 1024).toFixed(1)} KB)
                    </span>
                    <a
                      href={URL.createObjectURL(generatedPdfBlob)}
                      download={`scanned_doc_${Date.now()}.pdf`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Preview & Page Gallery */}
        <div className="space-y-6">
          {/* Active Filtered Preview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span>Active Page Preview</span>
              {filteredPreview && (
                <a
                  href={filteredPreview}
                  download="scanned_page.jpg"
                  className="text-cyan-600 dark:text-cyan-400 hover:underline text-[11px] flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  Save Image
                </a>
              )}
            </h4>

            <div className="min-h-[260px] max-h-[380px] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center p-2">
              {filteredPreview ? (
                <img
                  src={filteredPreview}
                  alt="Enhanced Scan Preview"
                  className="max-h-[360px] w-auto object-contain shadow-md rounded"
                />
              ) : currentImage ? (
                <img
                  src={currentImage}
                  alt="Original Capture"
                  className="max-h-[360px] w-auto object-contain shadow-md rounded"
                />
              ) : (
                <div className="text-center p-6 space-y-1">
                  <Scan className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-400">
                    No page scanned yet. Use Camera or upload a photo to preview.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Scanned Pages Tray */}
          {pages.length > 0 && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Scan Session Document Tray
                </span>
                <button
                  onClick={() => setPages([])}
                  className="text-[11px] text-red-500 hover:text-red-700 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {pages.map((p, idx) => (
                  <div
                    key={p.id}
                    className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 aspect-[3/4] flex items-center justify-center"
                  >
                    <img src={p.dataUrl} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      P{idx + 1}
                    </div>
                    <button
                      onClick={() => removePage(p.id)}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-700 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                100% Offline • 100% Secure
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Your camera feed and scanned documents never leave your device. Everything is processed privately.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
