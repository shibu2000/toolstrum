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
  Eye,
  Sliders,
  CheckCheck,
  Zap,
  Globe
} from 'lucide-react';
import { formatHtml } from './devHelpers';

interface HtmlFormatterPanelProps {
  initialValue?: string;
}

const HTML_PRESETS: Record<string, { label: string; html: string }> = {
  'HTML5 Landing Page': {
    label: 'HTML5 Semantic Page',
    html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Toolstrum Dev</title><link rel="stylesheet" href="style.css"></head><body><header><nav><a href="#home">Home</a><a href="#features">Features</a></nav></header><main><section class="hero"><h1>Fast & Offline</h1><p>Client-side developer utilities.</p><button type="button" class="btn-primary">Explore 500+ Tools</button></section></main><footer><p>&copy; 2026 Toolstrum</p></footer></body></html>`
  },
  'Responsive Card': {
    label: 'Responsive Component Card',
    html: `<article class="card shadow-lg rounded-2xl p-6 bg-white dark:bg-slate-900 border border-slate-200"><div class="badge bg-sky-100 text-sky-800 font-semibold px-2.5 py-0.5 rounded-full">New Feature</div><h3 class="text-lg font-bold mt-2">Zero Cloud Leakage</h3><p class="text-sm text-slate-600 mt-1">All compute occurs purely inside browser RAM using client-side engines.</p><div class="actions mt-4 flex items-center justify-between"><a href="#" class="text-sky-600 font-bold hover:underline">Read docs &rarr;</a><span class="text-xs text-slate-400">Offline Ready</span></div></article>`
  },
  'Contact Form': {
    label: 'Accessible Form',
    html: `<form action="/submit" method="POST" class="auth-form"><div class="form-group"><label for="user-email">Email Address</label><input type="email" id="user-email" name="email" required placeholder="dev@toolstrum.com" autocomplete="email" /></div><div class="form-group"><label for="user-pass">Password</label><input type="password" id="user-pass" name="password" required minlength="8" /></div><button type="submit" class="submit-btn">Sign In to Toolstrum</button></form>`
  },
  'Email Table': {
    label: 'Email Newsletter Table',
    html: `<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%"><tr><td align="center" style="padding: 20px 0;"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" style="background:#ffffff; border-radius:8px;"><tr><td style="padding: 40px 30px; text-align: center;"><h1 style="color:#0f172a; margin:0;">Weekly Developer Brief</h1><p style="color:#64748b; font-size:16px;">Here is what shipped in Toolstrum this week.</p></td></tr></table></td></tr></table>`
  }
};

export const HtmlFormatterPanel: React.FC<HtmlFormatterPanelProps> = ({
  initialValue
}) => {
  const [htmlInput, setHtmlInput] = useState<string>(
    initialValue || HTML_PRESETS['HTML5 Landing Page'].html
  );
  const [indentSize, setIndentSize] = useState<2 | 4 | 'tab'>(2);
  const [wrapAttributes, setWrapAttributes] = useState<boolean>(false);
  const [inlineTextElements, setInlineTextElements] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatted HTML output
  const formattedHtml = useMemo(() => {
    if (!htmlInput.trim()) return '';
    try {
      return formatHtml(htmlInput, {
        indent: indentSize,
        wrapAttributes,
        inlineTextElements
      });
    } catch (err: any) {
      return `<!-- Error formatting HTML: ${err?.message || 'Syntax error'} -->\n${htmlInput}`;
    }
  }, [htmlInput, indentSize, wrapAttributes, inlineTextElements]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([htmlInput]).size;
    const formattedBytes = new Blob([formattedHtml]).size;
    const deltaBytes = formattedBytes - rawBytes;
    const deltaPercent = rawBytes > 0 ? ((deltaBytes / rawBytes) * 100).toFixed(1) : '0';
    const tagCount = (formattedHtml.match(/<[a-zA-Z0-9_\-.:]+/g) || []).length;
    const lineCount = formattedHtml ? formattedHtml.split('\n').length : 0;
    return {
      rawBytes,
      formattedBytes,
      deltaBytes,
      deltaPercent,
      tagCount,
      lineCount
    };
  }, [htmlInput, formattedHtml]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-beautified.html';
    a.click;
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
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              HTML Formatter & Beautifier
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clean indentation, void tag normalization, attribute wrapping & live sandboxed visual preview.
            </p>
          </div>
        </div>

        {/* View Switcher: Code vs Live Preview */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'code'
                ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Formatted Code
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'preview'
                ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(HTML_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setHtmlInput(item.html)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Raw HTML Markup Editor */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Raw HTML Markup
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
              placeholder="Paste or write HTML markup here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Beautified Code or Live Preview */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {viewMode === 'code' ? 'Beautified HTML' : 'Live Document Preview'}
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
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  2s
                </button>
                <button
                  onClick={() => setIndentSize(4)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 4
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  4s
                </button>
                <button
                  onClick={() => setIndentSize('tab')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 'tab'
                      ? 'bg-white dark:bg-slate-700 text-orange-600 dark:text-orange-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tab
                </button>
              </div>

              {/* Wrap Attributes Toggle */}
              <button
                onClick={() => setWrapAttributes(!wrapAttributes)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                  wrapAttributes
                    ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title="Wrap HTML attributes onto new lines"
              >
                Wrap Attrs
              </button>

              {/* Inline simple elements toggle */}
              <button
                onClick={() => setInlineTextElements(!inlineTextElements)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                  inlineTextElements
                    ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-300 dark:border-orange-800 text-orange-700 dark:text-orange-300'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title="Inline single-line text tags e.g. <p>text</p>"
              >
                Inline Text
              </button>

              <button
                onClick={() => handleCopy(formattedHtml)}
                title="Copy Formatted HTML"
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

          {/* View Body */}
          <div className="p-4 flex-1 flex flex-col">
            {viewMode === 'code' ? (
              <textarea
                readOnly
                value={formattedHtml}
                rows={18}
                spellCheck={false}
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all"
              />
            ) : (
              <div className="w-full flex-1 min-h-[360px] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white">
                <iframe
                  title="HTML Live Preview"
                  srcDoc={formattedHtml}
                  sandbox="allow-same-origin allow-scripts"
                  className="w-full h-full min-h-[360px] border-0"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <CheckCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Void Tag Awareness</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Accurately handles HTML5 void tags (img, input, meta, link, br, hr) without indentation drifting.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Script & Style Block Indenting</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Internal &lt;script&gt; JavaScript and &lt;style&gt; CSS blocks are indented neatly inside parent elements.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Live Sandboxed Preview</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Toggle between syntax code output and a live isolated iframe DOM preview with zero server roundtrips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
