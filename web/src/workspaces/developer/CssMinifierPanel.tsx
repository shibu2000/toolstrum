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
  Palette
} from 'lucide-react';
import { minifyCss, CssMinifyOptions } from './devHelpers';

interface CssMinifierPanelProps {
  initialValue?: string;
}

const CSS_MINIFIER_PRESETS: Record<string, { label: string; css: string }> = {
  'Card Framework': {
    label: 'UI Framework Stylesheet',
    css: `/* ========================================================
 * Toolstrum Core UI Framework v3.4.0
 * 100% Offline Client-Side Design System
 * ======================================================== */

:root {
  --primary-color: #0077ff;
  --secondary-color: #00ffaa;
  --bg-surface: #ffffff;
  --text-muted: #8899aa;
}

/* Responsive Flexbox Card Container */
.ts-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  margin: 0px 0px 16px 0px;
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0px 4px 6px -1px rgba(0, 0, 0, 0.1);
  opacity: 0.95;
  transition: all 0.2s ease-in-out;
}

.ts-card:hover {
  transform: translateY(-4px);
  box-shadow: 0px 20px 25px -5px rgba(0, 0, 0, 0.1);
  border-color: #0077ff;
}

/* Typography and Utilities */
.ts-card-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  color: #000000;
  margin-bottom: 8px;
}

@media screen and (min-width: 768px) {
  .ts-card {
    padding: 32px;
    margin-bottom: 24px;
  }
}`
  },
  'Animated Glow Button': {
    label: 'Keyframe Glow Button',
    css: `/* Glowing CTA Button with Keyframe Animation */
@keyframes pulse-glow {
  0% {
    box-shadow: 0 0 0 0px rgba(2, 132, 199, 0.7);
  }
  70% {
    box-shadow: 0 0 0 14px rgba(2, 132, 199, 0);
  }
  100% {
    box-shadow: 0 0 0 0px rgba(2, 132, 199, 0);
  }
}

.btn-glow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border: 0px solid transparent;
  border-radius: 12px;
  background: linear-gradient(135deg, #0284c7 0%, #06b6d4 100%);
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;
  animation: pulse-glow 2s infinite;
}`
  }
};

export const CssMinifierPanel: React.FC<CssMinifierPanelProps> = ({
  initialValue
}) => {
  const [cssInput, setCssInput] = useState<string>(
    initialValue || CSS_MINIFIER_PRESETS['Card Framework'].css
  );

  // Minification options
  const [stripComments, setStripComments] = useState<boolean>(true);
  const [shortenHexColors, setShortenHexColors] = useState<boolean>(true);
  const [removeLeadingZeros, setRemoveLeadingZeros] = useState<boolean>(true);
  const [removeUnitZeros, setRemoveUnitZeros] = useState<boolean>(true);
  const [removeTrailingSemicolons, setRemoveTrailingSemicolons] = useState<boolean>(true);

  // Transform format
  const [exportFormat, setExportFormat] = useState<'raw' | 'style-tag' | 'js-literal' | 'base64'>('raw');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Minified CSS calculation
  const rawMinified = useMemo(() => {
    if (!cssInput.trim()) return '';
    const options: CssMinifyOptions = {
      stripComments,
      shortenHexColors,
      removeLeadingZeros,
      removeUnitZeros,
      removeTrailingSemicolons,
    };
    return minifyCss(cssInput, options);
  }, [cssInput, stripComments, shortenHexColors, removeLeadingZeros, removeUnitZeros, removeTrailingSemicolons]);

  // Formatted output based on export format
  const outputResult = useMemo(() => {
    if (!rawMinified) return '';
    switch (exportFormat) {
      case 'raw':
        return rawMinified;
      case 'style-tag':
        return `<style>\n${rawMinified}\n</style>`;
      case 'js-literal':
        return `// JavaScript CSS string\nexport const styles = \`${rawMinified.replace(/`/g, '\\`').replace(/\${/g, '\\${')}\`;`;
      case 'base64':
        try {
          const b64 = btoa(unescape(encodeURIComponent(rawMinified)));
          return `data:text/css;base64,${b64}`;
        } catch {
          return rawMinified;
        }
      default:
        return rawMinified;
    }
  }, [rawMinified, exportFormat]);

  // Compression telemetry
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([cssInput]).size;
    const minBytes = new Blob([rawMinified]).size;
    const bytesSaved = Math.max(0, rawBytes - minBytes);
    const percentReduction = rawBytes > 0 ? ((bytesSaved / rawBytes) * 100).toFixed(1) : '0';
    const estimatedGzip = Math.round(minBytes * 0.36);
    const gzipReduction = rawBytes > 0 ? (((rawBytes - estimatedGzip) / rawBytes) * 100).toFixed(1) : '0';

    return {
      rawBytes,
      minBytes,
      bytesSaved,
      percentReduction,
      estimatedGzip,
      gzipReduction,
    };
  }, [cssInput, rawMinified]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([rawMinified], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-minified.css';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCssInput(text);
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
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              CSS Minifier & Optimizer
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-efficiency CSS compression, zero unit stripping, hex shortening & Gzip telemetry.
            </p>
          </div>
        </div>

        {/* Compression Badge */}
        <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <Gauge className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
            {telemetry.percentReduction}% Smaller
          </span>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-mono">
            (-{telemetry.bytesSaved.toLocaleString()} B)
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(CSS_MINIFIER_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setCssInput(item.css)}
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
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Strip Comments
          </button>

          <button
            onClick={() => setShortenHexColors(!shortenHexColors)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              shortenHexColors
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            #fff Hex Shortening
          </button>

          <button
            onClick={() => setRemoveLeadingZeros(!removeLeadingZeros)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              removeLeadingZeros
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            .5em Decimals
          </button>

          <button
            onClick={() => setRemoveUnitZeros(!removeUnitZeros)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              removeUnitZeros
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            0px &rarr; 0
          </button>

          <button
            onClick={() => setRemoveTrailingSemicolons(!removeTrailingSemicolons)}
            className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors ${
              removeTrailingSemicolons
                ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
            }`}
          >
            Strip Trailing ;&#125;
          </button>
        </div>

        {/* Output Format Tabs */}
        <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setExportFormat('raw')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'raw'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            CSS
          </button>
          <button
            onClick={() => setExportFormat('style-tag')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'style-tag'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            &lt;style&gt;
          </button>
          <button
            onClick={() => setExportFormat('js-literal')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'js-literal'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            JS String
          </button>
          <button
            onClick={() => setExportFormat('base64')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              exportFormat === 'base64'
                ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Base64
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Source CSS */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source Stylesheet
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.rawBytes.toLocaleString()} B)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload CSS file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".css,.scss,.less,.postcss,text/css"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => handleCopy(cssInput)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCssInput('')}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={cssInput}
              onChange={(e) => setCssInput(e.target.value)}
              placeholder="Paste raw unminified CSS here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Crunched Output & Telemetry */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Minified CSS
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
                title="Download .css file"
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
