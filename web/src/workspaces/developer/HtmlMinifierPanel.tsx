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
  Minimize2,
  Gauge,
  Flame
} from 'lucide-react';
import { minifyHtml, HtmlMinifyOptions } from './devHelpers';

interface HtmlMinifierPanelProps {
  initialValue?: string;
}

const HTML_MINIFIER_PRESETS: Record<string, { label: string; html: string }> = {
  'Hero with CSS & JS': {
    label: 'Hero with Embedded CSS & JS',
    html: `<!-- Hero Component Header -->
<header class="hero-wrapper" role="banner">
  <style>
    /* Critical CSS block */
    .hero-wrapper {
      display: flex;
      flex-direction: column;
      padding: 48px 24px;
      background-color: #0f172a;
      color: #ffffff;
    }
    .hero-title {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.2;
    }
  </style>
  <div class="content">
    <h1 class="hero-title">  Toolstrum Offline Suite  </h1>
    <!-- User description paragraph -->
    <p class="hero-desc">
      500+ Professional zero-server tools running 100% in your browser.
    </p>
    <button type="submit" disabled="disabled" class="btn-primary" id="cta-btn">
      Get Started Offline
    </button>
  </div>
  <script>
    // Initialize client analytics counter
    function logVisit() {
      /* Local storage timestamp counter */
      var count = localStorage.getItem('toolstrum_visits') || 0;
      localStorage.setItem('toolstrum_visits', parseInt(count) + 1);
    }
    logVisit();
  </script>
</header>`
  },
  'Modal Dialog': {
    label: 'Interactive Modal Dialog',
    html: `<!-- Accessible Modal Dialog -->
<dialog id="privacy-modal" class="modal-card" open="open">
  <div class="modal-header">
    <h2 class="title">Zero-Server Security</h2>
    <button type="button" class="close-btn" aria-label="Close dialog">
      &times;
    </button>
  </div>
  <!-- Modal Body -->
  <div class="modal-body">
    <p>
      Your payload never leaves browser memory. All encryption and processing happens locally.
    </p>
  </div>
  <div class="modal-footer">
    <button class="btn btn-secondary" onclick="this.closest('dialog').close();">Dismiss</button>
  </div>
</dialog>`
  }
};

export const HtmlMinifierPanel: React.FC<HtmlMinifierPanelProps> = ({
  initialValue
}) => {
  const [htmlInput, setHtmlInput] = useState<string>(
    initialValue || HTML_MINIFIER_PRESETS['Hero with CSS & JS'].html
  );

  // Minification options
  const [stripComments, setStripComments] = useState<boolean>(true);
  const [minifyCss, setMinifyCss] = useState<boolean>(true);
  const [minifyJs, setMinifyJs] = useState<boolean>(true);
  const [removeBooleanAttrs, setRemoveBooleanAttrs] = useState<boolean>(true);
  const [removeEmptyAttrs, setRemoveEmptyAttrs] = useState<boolean>(true);

  // Transform mode
  const [exportFormat, setExportFormat] = useState<'raw' | 'js-literal' | 'data-uri' | 'base64'>('raw');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Minified HTML calculation
  const rawMinified = useMemo(() => {
    if (!htmlInput.trim()) return '';
    const options: HtmlMinifyOptions = {
      stripComments,
      collapseWhitespace: true,
      minifyEmbeddedCss: minifyCss,
      minifyEmbeddedJs: minifyJs,
      removeBooleanAttributes: removeBooleanAttrs,
      removeEmptyAttributes: removeEmptyAttrs,
    };
    return minifyHtml(htmlInput, options);
  }, [htmlInput, stripComments, minifyCss, minifyJs, removeBooleanAttrs, removeEmptyAttrs]);

  // Formatted output based on export format
  const outputResult = useMemo(() => {
    if (!rawMinified) return '';
    switch (exportFormat) {
      case 'raw':
        return rawMinified;
      case 'js-literal':
        return `// Clean single-line JavaScript template literal\nconst htmlMarkup = \`${rawMinified.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;\nexport default htmlMarkup;`;
      case 'data-uri':
        return `data:text/html;charset=utf-8,${encodeURIComponent(rawMinified)}`;
      case 'base64':
        try {
          const b64 = btoa(unescape(encodeURIComponent(rawMinified)));
          return `data:text/html;base64,${b64}`;
        } catch {
          return rawMinified;
        }
      default:
        return rawMinified;
    }
  }, [rawMinified, exportFormat]);

  // Compression telemetry
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([htmlInput]).size;
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
  }, [htmlInput, rawMinified]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawMinified], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-minified.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setHtmlInput(text);
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
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              HTML Minifier & Compression Cruncher
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggressive whitespace cruncher, comment stripper, embedded CSS/JS compressor & payload telemetry.
            </p>
          </div>
        </div>

        {/* Compression Badge */}
        <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Gauge className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
            {telemetry.percentReduction}% Smaller
          </span>
          <span className="text-[11px] text-rose-600 dark:text-rose-400 font-mono">
            (-{telemetry.bytesSaved.toLocaleString()} B)
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(HTML_MINIFIER_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setHtmlInput(item.html)}
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
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Strip Comments
          </button>

          <button
            onClick={() => setMinifyCss(!minifyCss)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              minifyCss
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Minify &lt;style&gt;
          </button>

          <button
            onClick={() => setMinifyJs(!minifyJs)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              minifyJs
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Minify &lt;script&gt;
          </button>

          <button
            onClick={() => setRemoveBooleanAttrs(!removeBooleanAttrs)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              removeBooleanAttrs
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Boolean Attrs
          </button>

          <button
            onClick={() => setRemoveEmptyAttrs(!removeEmptyAttrs)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              removeEmptyAttrs
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Remove Empty Attrs
          </button>
        </div>

        {/* Output Format Tabs */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setExportFormat('raw')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'raw'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            HTML
          </button>
          <button
            onClick={() => setExportFormat('js-literal')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'js-literal'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            JS String
          </button>
          <button
            onClick={() => setExportFormat('data-uri')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'data-uri'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Data URI
          </button>
          <button
            onClick={() => setExportFormat('base64')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'base64'
                ? 'bg-white dark:bg-slate-700 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Base64
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Source HTML */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source Document
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.rawBytes.toLocaleString()} B)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload HTML file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,.xhtml,.php,.vue,.svelte,text/html"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => handleCopy(htmlInput)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setHtmlInput('')}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={htmlInput}
              onChange={(e) => setHtmlInput(e.target.value)}
              placeholder="Paste raw unminified HTML here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-y"
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
                title="Download .html file"
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
          <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400 block">
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
