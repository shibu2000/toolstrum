import React, { useState, useMemo, useRef } from 'react';
import {
  Minimize2,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Sparkles,
  ArrowRight,
  Zap,
  Globe,
  Terminal,
  FileCode,
  ShieldCheck,
  Layers,
  Settings
} from 'lucide-react';
import { autoRepairJson } from './JsonFormatterPanel';

interface JsonMinifierPanelProps {
  initialValue?: string;
}

const MINIFIER_SAMPLES: Record<string, string> = {
  'Config Payload': JSON.stringify(
    {
      application: "Toolstrum Engine",
      version: "2.1.0",
      production: true,
      endpoints: {
        apiGateway: "https://api.toolstrum.local/v1",
        webSocket: "wss://ws.toolstrum.local/live",
        cdnStatic: "https://cdn.toolstrum.local/assets"
      },
      features: {
        wasmAcceleration: true,
        zeroTelemetry: true,
        localStorageCache: true,
        maxPayloadMb: 50
      },
      activeStudios: [
        "pdf",
        "image",
        "scanner",
        "video",
        "audio",
        "developer",
        "security"
      ]
    },
    null,
    2
  ),
  'API Response': JSON.stringify(
    {
      code: 200,
      data: [
        { id: 1, name: "PDF Merge", status: "ready", rating: 4.9 },
        { id: 2, name: "Image Compressor", status: "ready", rating: 4.8 },
        { id: 3, name: "JSON Validator", status: "ready", rating: 5.0 }
      ],
      meta: {
        timestamp: 1731652000,
        requestId: "req_f81d4fae-7dec-11d0-a765-00a0c91e6bf6"
      }
    },
    null,
    2
  )
};

// Simple Gzip size estimator (Deflate compression model approximation)
function estimateGzipSize(str: string): number {
  if (!str) return 0;
  // Frequency/entropy based estimation
  const bytes = new Blob([str]).size;
  if (bytes < 100) return bytes;
  const uniqueChars = new Set(str).size;
  const compressionRatio = Math.max(0.25, Math.min(0.65, uniqueChars / 128));
  return Math.round(bytes * compressionRatio);
}

export const JsonMinifierPanel: React.FC<JsonMinifierPanelProps> = ({ initialValue }) => {
  const [input, setInput] = useState<string>(initialValue || MINIFIER_SAMPLES['Config Payload']);
  const [removeNulls, setRemoveNulls] = useState<boolean>(false);
  const [escapeQuotes, setEscapeQuotes] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'raw' | 'curl' | 'url' | 'base64'>('raw');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Minify logic
  const result = useMemo(() => {
    if (!input.trim()) {
      return { minified: '', error: null, rawBytes: 0, minifiedBytes: 0, savingsPct: 0, gzipBytes: 0 };
    }

    try {
      let parsed = JSON.parse(input);

      // Optional: recursively strip null values to save payload bytes
      if (removeNulls) {
        function clean(obj: any): any {
          if (Array.isArray(obj)) {
            return obj.map(clean);
          }
          if (obj !== null && typeof obj === 'object') {
            return Object.entries(obj).reduce((acc: any, [k, v]) => {
              if (v !== null) acc[k] = clean(v);
              return acc;
            }, {});
          }
          return obj;
        }
        parsed = clean(parsed);
      }

      let minified = JSON.stringify(parsed);

      if (escapeQuotes) {
        minified = minified.replace(/"/g, '\\"');
      }

      const rawBytes = new Blob([input]).size;
      const minifiedBytes = new Blob([minified]).size;
      const savingsPct = rawBytes > 0 ? Math.max(0, Math.round(((rawBytes - minifiedBytes) / rawBytes) * 100)) : 0;
      const gzipBytes = estimateGzipSize(minified);

      // Format transforms
      let formattedOutput = minified;
      if (outputFormat === 'curl') {
        formattedOutput = `--data-raw '${minified.replace(/'/g, "'\\''")}'`;
      } else if (outputFormat === 'url') {
        formattedOutput = encodeURIComponent(minified);
      } else if (outputFormat === 'base64') {
        formattedOutput = btoa(unescape(encodeURIComponent(minified)));
      }

      return {
        minified: formattedOutput,
        rawMinified: minified,
        error: null,
        rawBytes,
        minifiedBytes,
        savingsPct,
        gzipBytes
      };
    } catch (err: any) {
      // Check if auto-repair can fix it
      let canFix = false;
      let fixedContent = '';
      try {
        const rep = autoRepairJson(input);
        JSON.parse(rep.repaired);
        canFix = true;
        fixedContent = rep.repaired;
      } catch {
        canFix = false;
      }

      return {
        minified: '',
        rawMinified: '',
        error: err.message || 'Invalid JSON input',
        rawBytes: new Blob([input]).size,
        minifiedBytes: 0,
        savingsPct: 0,
        gzipBytes: 0,
        canFix,
        fixedContent
      };
    }
  }, [input, removeNulls, escapeQuotes, outputFormat]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result.rawMinified) return;
    const blob = new Blob([result.rawMinified], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minified_${Date.now()}.min.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) setInput(content);
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Presets & Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Presets:
          </span>
          {Object.entries(MINIFIER_SAMPLES).map(([name, val]) => (
            <button
              key={name}
              onClick={() => setInput(val)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>

        {/* Compression Metrics */}
        {!result.error && result.rawBytes > 0 && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              Raw: <strong>{(result.rawBytes / 1024).toFixed(2)} KB</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              Minified: <strong>{(result.minifiedBytes / 1024).toFixed(2)} KB</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              Est. Gzip: <strong>{(result.gzipBytes / 1024).toFixed(2)} KB</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
              -{result.savingsPct}% Reduced
            </span>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left: Input Textarea */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>Input Formatted JSON</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                title="Upload JSON File"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => setInput('')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 resize-y"
            placeholder="Paste pretty-printed JSON here to crunch and minify..."
            spellCheck={false}
          />

          {/* Auto-repair banner if syntax broken */}
          {result.error && result.canFix && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">
                Fixable syntax issues detected. Auto-repair available.
              </span>
              <button
                onClick={() => setInput(result.fixedContent)}
                className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 flex items-center gap-1 shadow-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>Fix & Minify</span>
              </button>
            </div>
          )}

          {result.error && !result.canFix && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 font-mono">
              <strong>Error:</strong> {result.error}
            </div>
          )}
        </div>

        {/* Right: Output & Compression Options */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/20 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            {/* Format Format Toggles */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex-wrap">
              <button
                onClick={() => setOutputFormat('raw')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  outputFormat === 'raw'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Standard
              </button>
              <button
                onClick={() => setOutputFormat('curl')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  outputFormat === 'curl'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                cURL Flag
              </button>
              <button
                onClick={() => setOutputFormat('url')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  outputFormat === 'url'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                URL-Encoded
              </button>
              <button
                onClick={() => setOutputFormat('base64')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  outputFormat === 'base64'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Base64
              </button>
            </div>

            {/* Advanced Filters */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setRemoveNulls(!removeNulls)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  removeNulls
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Strip null attributes from objects to maximize byte savings"
              >
                Strip Nulls
              </button>
              <button
                onClick={() => setEscapeQuotes(!escapeQuotes)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  escapeQuotes
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Escape double quotes (\&quot;) for string embedding"
              >
                Escape Quotes
              </button>
            </div>
          </div>

          {/* Minified Output Container */}
          <div className="min-h-[350px] max-h-[460px] overflow-auto rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
            {result.error ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Minimize2 className="w-8 h-8 text-slate-400 mb-2 opacity-60" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cannot minify invalid JSON
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  {result.error}
                </p>
              </div>
            ) : (
              <pre className="font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre-wrap break-all select-text">
                {result.minified || '// Minified single-line string will appear here'}
              </pre>
            )}
          </div>

          {/* Action Footer */}
          {result.minified && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                onClick={() => handleCopy(result.minified)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy Output'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .min.json</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
