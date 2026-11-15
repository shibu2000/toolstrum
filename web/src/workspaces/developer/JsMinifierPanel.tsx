import React, { useState, useMemo, useRef } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Layers,
  Code2,
  Sliders,
  CheckCheck,
  Zap,
  Gauge,
  Flame,
  Bookmark
} from 'lucide-react';
import { minifyJs, JsMinifyOptions } from './devHelpers';

interface JsMinifierPanelProps {
  initialValue?: string;
}

const JS_MINIFIER_PRESETS: Record<string, { label: string; js: string }> = {
  'Checkout Calculator': {
    label: 'Checkout Discount Engine',
    js: `// Helper to compute discounted checkout price
function applyDiscount(cart, couponCode) {
  /* Coupon percentage lookup table */
  const coupons = {
    'SUMMER20': 0.20,
    'WELCOME10': 0.10,
    'VIP50': 0.50
  };
  const isEligible = Boolean(cart && cart.items && cart.items.length > 0);
  if (!isEligible) {
    return 0;
  }
  const discountRate = coupons[couponCode] || 0;
  const discountedTotal = cart.total * (1 - discountRate);
  return discountedTotal;
}`
  },
  'Scroll Bookmarklet': {
    label: 'Smooth Scroll Bookmarklet',
    js: `// Instant Smooth Scroll to Top Bookmarklet
(function smoothScrollToTop() {
  const currentY = window.scrollY || document.documentElement.scrollTop;
  if (currentY > 0) {
    window.requestAnimationFrame(smoothScrollToTop);
    window.scrollTo(0, currentY - currentY / 8);
  }
})();`
  }
};

export const JsMinifierPanel: React.FC<JsMinifierPanelProps> = ({
  initialValue
}) => {
  const [jsInput, setJsInput] = useState<string>(
    initialValue || JS_MINIFIER_PRESETS['Checkout Calculator'].js
  );

  // Minification options
  const [stripComments, setStripComments] = useState<boolean>(true);
  const [compressBooleans, setCompressBooleans] = useState<boolean>(true);
  const [wrapIIFE, setWrapIIFE] = useState<boolean>(false);

  // Export format
  const [exportFormat, setExportFormat] = useState<'raw' | 'script-tag' | 'bookmarklet' | 'base64'>('raw');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Minified JS calculation
  const rawMinified = useMemo(() => {
    if (!jsInput.trim()) return '';
    const options: JsMinifyOptions = {
      stripComments,
      compressBooleans,
      wrapIIFE: wrapIIFE || exportFormat === 'bookmarklet',
    };
    return minifyJs(jsInput, options);
  }, [jsInput, stripComments, compressBooleans, wrapIIFE, exportFormat]);

  // Formatted output based on export format
  const outputResult = useMemo(() => {
    if (!rawMinified) return '';
    switch (exportFormat) {
      case 'raw':
        return rawMinified;
      case 'script-tag':
        return `<script>\n${rawMinified}\n</script>`;
      case 'bookmarklet':
        return `javascript:${encodeURIComponent(rawMinified)}`;
      case 'base64':
        try {
          const b64 = btoa(unescape(encodeURIComponent(rawMinified)));
          return `data:text/javascript;base64,${b64}`;
        } catch {
          return rawMinified;
        }
      default:
        return rawMinified;
    }
  }, [rawMinified, exportFormat]);

  // Compression telemetry
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([jsInput]).size;
    const minBytes = new Blob([rawMinified]).size;
    const bytesSaved = Math.max(0, rawBytes - minBytes);
    const percentReduction = rawBytes > 0 ? ((bytesSaved / rawBytes) * 100).toFixed(1) : '0';
    const estimatedGzip = Math.round(minBytes * 0.38);
    const gzipReduction = rawBytes > 0 ? (((rawBytes - estimatedGzip) / rawBytes) * 100).toFixed(1) : '0';

    return {
      rawBytes,
      minBytes,
      bytesSaved,
      percentReduction,
      estimatedGzip,
      gzipReduction,
    };
  }, [jsInput, rawMinified]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawMinified], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-minified.js';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setJsInput(text);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              JavaScript Minifier & Obfuscator
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-efficiency JS cruncher, comment stripper, boolean optimizer, IIFE wrapper & bookmarklet generator.
            </p>
          </div>
        </div>

        {/* Compression Badge */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Gauge className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
            {telemetry.percentReduction}% Smaller
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
            (-{telemetry.bytesSaved.toLocaleString()} B)
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(JS_MINIFIER_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setJsInput(item.js)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Optimization Toggles Bar */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" /> Rules:
          </span>

          <button
            onClick={() => setStripComments(!stripComments)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              stripComments
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Strip Comments
          </button>

          <button
            onClick={() => setCompressBooleans(!compressBooleans)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              compressBooleans
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            !0 / !1 Booleans
          </button>

          <button
            onClick={() => setWrapIIFE(!wrapIIFE)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              wrapIIFE
                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Wrap IIFE (()=&gt;{})()
          </button>
        </div>

        {/* Output Format Tabs */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setExportFormat('raw')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'raw'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            JS
          </button>
          <button
            onClick={() => setExportFormat('script-tag')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'script-tag'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            &lt;script&gt;
          </button>
          <button
            onClick={() => setExportFormat('bookmarklet')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              exportFormat === 'bookmarklet'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Bookmark className="w-3 h-3" />
            Bookmarklet
          </button>
          <button
            onClick={() => setExportFormat('base64')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'base64'
                ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Base64
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Source JS */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source Script
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.rawBytes.toLocaleString()} B)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload JS file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".js,.jsx,.ts,.tsx,.mjs,.cjs,text/javascript"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => handleCopy(jsInput)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setJsInput('')}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={jsInput}
              onChange={(e) => setJsInput(e.target.value)}
              placeholder="Paste raw unminified JavaScript here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Crunched Output & Telemetry */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Minified Output
              </span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                ({telemetry.minBytes.toLocaleString()} B · -{telemetry.percentReduction}%)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(outputResult)}
                title="Copy Output"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                title="Download .js file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              readOnly
              value={outputResult}
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all break-all"
            />
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Original Size
          </span>
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
            {telemetry.rawBytes.toLocaleString()} Bytes
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Minified Size
          </span>
          <span className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 block">
            {telemetry.minBytes.toLocaleString()} Bytes
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Net Savings
          </span>
          <span className="text-sm font-bold font-mono text-amber-600 dark:text-amber-400 block">
            -{telemetry.bytesSaved.toLocaleString()} B ({telemetry.percentReduction}%)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
            Estimated Gzip
          </span>
          <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400 block">
            ~{telemetry.estimatedGzip.toLocaleString()} Bytes (-{telemetry.gzipReduction}%)
          </span>
        </div>
      </div>
    </div>
  );
};
