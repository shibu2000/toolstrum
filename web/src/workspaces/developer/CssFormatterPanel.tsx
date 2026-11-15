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
  Palette,
  ArrowDownAZ
} from 'lucide-react';
import { formatCss } from './devHelpers';

interface CssFormatterPanelProps {
  initialValue?: string;
}

const CSS_PRESETS: Record<string, { label: string; css: string }> = {
  'Card Component': {
    label: 'Modern Card & Pseudo-classes',
    css: `.card{display:flex;flex-direction:column;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:16px;padding:24px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);transition:transform 0.2s ease,box-shadow 0.2s ease}.card:hover{transform:translateY(-2px);box-shadow:0 10px 15px -3px rgba(0,0,0,0.1)}.card .title{font-size:1.25rem;font-weight:700;color:#0f172a;margin-bottom:8px}`
  },
  'Responsive Media Queries': {
    label: 'Responsive Grid & Breakpoints',
    css: `.grid-container{display:grid;grid-template-columns:1fr;gap:16px;width:100%;max-width:1200px;margin:0 auto}@media (min-width:640px){.grid-container{grid-template-columns:repeat(2,1fr);gap:20px}}@media (min-width:1024px){.grid-container{grid-template-columns:repeat(3,1fr);gap:24px}}`
  },
  'Keyframe Animation': {
    label: 'Keyframe Spin & Pulse',
    css: `@keyframes spin-pulse{0%{transform:rotate(0deg) scale(1);opacity:1}50%{transform:rotate(180deg) scale(1.1);opacity:0.7}100%{transform:rotate(360deg) scale(1);opacity:1}}.loading-spinner{width:48px;height:48px;border:4px solid #e2e8f0;border-top-color:#0284c7;border-radius:50%;animation:spin-pulse 1.5s cubic-bezier(0.4,0,0.2,1) infinite}`
  },
  'Design Tokens': {
    label: 'CSS Variables & Design Tokens',
    css: `:root{--font-sans:'Inter',system-ui,-apple-system,sans-serif;--color-primary:#0284c7;--color-primary-hover:#0369a1;--color-bg-light:#f8fafc;--color-bg-dark:#0f172a;--radius-md:12px;--radius-lg:16px;--shadow-sm:0 1px 2px 0 rgba(0,0,0,0.05)}`
  }
};

export const CssFormatterPanel: React.FC<CssFormatterPanelProps> = ({
  initialValue
}) => {
  const [cssInput, setCssInput] = useState<string>(
    initialValue || CSS_PRESETS['Card Component'].css
  );
  const [indentSize, setIndentSize] = useState<2 | 4 | 'tab'>(2);
  const [singleLineRules, setSingleLineRules] = useState<boolean>(false);
  const [sortProperties, setSortProperties] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatted output
  const formattedCss = useMemo(() => {
    if (!cssInput.trim()) return '';
    try {
      return formatCss(cssInput, {
        indent: indentSize,
        singleLineRules,
        sortProperties
      });
    } catch (err: any) {
      return `/* Error formatting CSS: ${err?.message || 'Syntax error'} */\n${cssInput}`;
    }
  }, [cssInput, indentSize, singleLineRules, sortProperties]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([cssInput]).size;
    const formattedBytes = new Blob([formattedCss]).size;
    const deltaBytes = formattedBytes - rawBytes;
    const deltaPercent = rawBytes > 0 ? ((deltaBytes / rawBytes) * 100).toFixed(1) : '0';
    const ruleCount = (formattedCss.match(/\{/g) || []).length;
    const propCount = (formattedCss.match(/;/g) || []).length;
    const lineCount = formattedCss ? formattedCss.split('\n').length : 0;

    return {
      rawBytes,
      formattedBytes,
      deltaBytes,
      deltaPercent,
      ruleCount,
      propCount,
      lineCount
    };
  }, [cssInput, formattedCss]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedCss], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-formatted.css';
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
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              CSS Formatter & Beautifier
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clean indentation, nested media query hierarchy, A-Z property sorting & multi/single-line rule formatting.
            </p>
          </div>
        </div>

        {/* Telemetry Pill */}
        <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
            {telemetry.ruleCount} Rules Audited
          </span>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
            ({telemetry.propCount} Properties)
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(CSS_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setCssInput(item.css)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Raw CSS Editor */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source CSS
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
              placeholder="Paste minified or messy CSS stylesheets here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Beautified CSS Output */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Beautified CSS
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.formattedBytes.toLocaleString()} B · {telemetry.lineCount} lines)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Indent Options */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setIndentSize(2)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 2
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  2s
                </button>
                <button
                  onClick={() => setIndentSize(4)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 4
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  4s
                </button>
                <button
                  onClick={() => setIndentSize('tab')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 'tab'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tab
                </button>
              </div>

              {/* Single-line rules toggle */}
              <button
                onClick={() => setSingleLineRules(!singleLineRules)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                  singleLineRules
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title="Format each rule on a single line"
              >
                1-Line Rules
              </button>

              {/* Sort properties A-Z toggle */}
              <button
                onClick={() => setSortProperties(!sortProperties)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors flex items-center gap-1 ${
                  sortProperties
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title="Sort CSS properties inside each selector alphabetically"
              >
                <ArrowDownAZ className="w-3 h-3" />
                Sort A-Z
              </button>

              <button
                onClick={() => handleCopy(formattedCss)}
                title="Copy Formatted CSS"
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
              value={formattedCss}
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all"
            />
          </div>
        </div>
      </div>

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <CheckCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Nested At-Rules & Media Queries</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Flawless indentation for multi-level @media breakpoints, @keyframes steps, and CSS container queries.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <ArrowDownAZ className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Alphabetical Property Sorting</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              1-click A-Z ordering keeps declaration lists consistent across teams and simplifies pull request diffs.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Server Dependencies</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              100% offline client-side parsing. Proprietary styles, design tokens, and CSS modules never touch any network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
