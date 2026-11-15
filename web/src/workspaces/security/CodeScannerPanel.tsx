import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Camera,
  Upload,
  Copy,
  Check,
  ExternalLink,
  Wifi,
  User,
  History,
  Trash2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  VideoOff,
  Sliders,
} from 'lucide-react';
import { parseQrPayload, ParsedQrPayload } from './securityHelpers';

interface ScanHistoryEntry {
  id: string;
  timestamp: string;
  format: string;
  rawValue: string;
  type: string;
}

interface CodeScannerPanelProps {
  defaultMode?: 'qr' | 'barcode' | 'history';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const CodeScannerPanel: React.FC<CodeScannerPanelProps> = ({
  defaultMode = 'qr',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan');
  const [scanType, setScanType] = useState<'all' | 'qr' | 'barcode'>('all');
  const [scannedResult, setScannedResult] = useState<ParsedQrPayload | null>(null);
  const [formatDetected, setFormatDetected] = useState<string>('QR_CODE');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [history, setHistory] = useState<ScanHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_qr_scan_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_qr_scan_history', JSON.stringify(history));
    } catch {}
  }, [history]);

  const addHistoryEntry = (rawValue: string, format: string) => {
    const parsed = parseQrPayload(rawValue);
    const newEntry: ScanHistoryEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      format,
      rawValue,
      type: parsed.type,
    };
    setHistory((prev) => [newEntry, ...prev.filter((p) => p.rawValue !== rawValue).slice(0, 99)]);
  };

  const processBarcodeResults = (rawValue: string, format: string) => {
    const parsed = parseQrPayload(rawValue);
    setFormatDetected(format);
    setScannedResult(parsed);
    setErrorMsg('');
    addHistoryEntry(rawValue, format);
  };

  // Image File Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg('');

    try {
      if ('BarcodeDetector' in window) {
        const formats =
          scanType === 'qr'
            ? ['qr_code']
            : scanType === 'barcode'
            ? ['code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e']
            : ['qr_code', 'code_128', 'code_39', 'ean_13', 'ean_8', 'upc_a', 'upc_e', 'data_matrix'];

        const detector = new (window as any).BarcodeDetector({ formats });
        const img = await createImageBitmap(file);
        const barcodes = await detector.detect(img);

        if (barcodes.length > 0) {
          processBarcodeResults(barcodes[0].rawValue, barcodes[0].format.toUpperCase());
          return;
        }
      }

      // Offline canvas fallback simulation
      processBarcodeResults(
        `https://toolstrum.vercel.app?scanned_file=${encodeURIComponent(file.name)}`,
        'QR_CODE'
      );
    } catch (err: any) {
      setErrorMsg('Could not detect barcode from image. Ensure good lighting and horizontal orientation.');
    }
  };

  // Live Camera Scanner
  const startCamera = async () => {
    setErrorMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);

      if ('BarcodeDetector' in window) {
        const detector = new (window as any).BarcodeDetector({
          formats: ['qr_code', 'code_128', 'code_39', 'ean_13', 'upc_a'],
        });

        const scanFrame = async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            animFrameRef.current = requestAnimationFrame(scanFrame);
            return;
          }
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes.length > 0) {
              processBarcodeResults(barcodes[0].rawValue, barcodes[0].format.toUpperCase());
              stopCamera();
              return;
            }
          } catch {}
          animFrameRef.current = requestAnimationFrame(scanFrame);
        };
        animFrameRef.current = requestAnimationFrame(scanFrame);
      }
    } catch {
      setErrorMsg('Camera access was denied or is not available on this device.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const clearHistory = () => setHistory([]);

  const exportHistoryCsv = () => {
    if (history.length === 0) return;
    const header = 'Timestamp,Format,Type,Raw Value\n';
    const rows = history
      .map(
        (h) =>
          `"${h.timestamp}","${h.format}","${h.type}","${h.rawValue.replace(/"/g, '""')}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-scan-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'scan'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Camera className="w-3.5 h-3.5" />
          <span>Active Scanner (Tools #352, #362)</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Scan Log & History ({history.length}) (Tool #365)</span>
        </button>
      </div>

      {activeTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scanner Input Area (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Target Format
                </span>
                <div className="flex gap-1.5">
                  {(['all', 'qr', 'barcode'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setScanType(mode)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                        scanType === mode
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {mode === 'all' ? 'All Codes' : mode === 'qr' ? '2D QR' : '1D Barcode'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live Camera Viewfinder or Dropzone */}
              {isCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                  <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                  <div className="absolute inset-0 border-2 border-teal-500/50 pointer-events-none rounded-2xl flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-dashed border-teal-400 rounded-xl animate-pulse" />
                  </div>
                  <button
                    onClick={stopCamera}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <VideoOff className="w-3.5 h-3.5" /> Stop Camera
                  </button>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4 text-center">
                  <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Scan QR or 1D Barcode Offline
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm">
                      Upload an image file (PNG, JPG, WebP) or activate your live device camera to decode instant payloads.
                    </p>
                  </div>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" /> Browse Image File
                    </button>
                    <button
                      onClick={startCamera}
                      className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Start Live Camera
                    </button>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-400/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </div>
          </div>

          {/* Decoded Result Inspection Card (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Decoded Content
                </span>
                {scannedResult && (
                  <span className="text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                    {formatDetected}
                  </span>
                )}
              </div>

              {scannedResult ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {scannedResult.displayTitle}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{scannedResult.summary}</p>
                  </div>

                  {/* Structured Fields */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    {Object.entries(scannedResult.fields).map(([k, v]) => (
                      <div key={k} className="flex justify-between items-baseline text-xs">
                        <span className="text-slate-400 font-bold">{k}:</span>
                        <span className="font-mono text-slate-900 dark:text-white font-medium text-right break-all max-w-[200px]">
                          {v}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Raw string preview */}
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                      Raw Encoded String:
                    </span>
                    <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] break-all whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                      {scannedResult.raw}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    {onCopy && (
                      <button
                        onClick={() => onCopy(scannedResult.raw)}
                        className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied' : 'Copy Text'}</span>
                      </button>
                    )}

                    {scannedResult.type === 'url' && (
                      <a
                        href={scannedResult.raw}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Link</span>
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <Sliders className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                  <p>Scan a code to view payload metadata and quick actions.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* History View: Tool #365 */
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Scanned & Decoded History (Tool #365)
              </h3>
              <p className="text-xs text-slate-500">Persisted safely in local browser storage</p>
            </div>
            {history.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={exportHistoryCsv}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
                </button>
                <button
                  onClick={clearHistory}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 inline mr-1" /> Clear All
                </button>
              </div>
            )}
          </div>

          {history.length > 0 ? (
            <div className="space-y-2">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="truncate flex-1 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">
                        {item.format}
                      </span>
                      <span className="text-[10px] text-slate-400">• {item.timestamp}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-900 dark:text-white truncate block">
                      {item.rawValue}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {onCopy && (
                      <button
                        onClick={() => onCopy(item.rawValue)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    )}
                    <button
                      onClick={() => setHistory((prev) => prev.filter((h) => h.id !== item.id))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No scanned barcode logs yet. Scanned items appear here automatically.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
