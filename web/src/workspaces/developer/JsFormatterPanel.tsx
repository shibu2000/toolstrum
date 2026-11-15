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
  Braces
} from 'lucide-react';
import { formatJs } from './devHelpers';

interface JsFormatterPanelProps {
  initialValue?: string;
}

const JS_PRESETS: Record<string, { label: string; js: string }> = {
  'Async Fetcher': {
    label: 'Async API Fetcher & Retry',
    js: `async function fetchWithRetry(url,options={},retries=3,backoff=500){for(let attempt=1;attempt<=retries;attempt++){try{const response=await fetch(url,options);if(!response.ok){throw new Error(\`HTTP error! status: \${response.status}\`);}const data=await response.json();return{success:true,data};}catch(error){if(attempt===retries){return{success:false,error:error.message};}await new Promise(resolve=>setTimeout(resolve,backoff*Math.pow(2,attempt-1)));}}}`
  },
  'ES6 Class': {
    label: 'ES6 Class & Private Fields',
    js: `class DataPipeline{#buffer=[];#maxSize=1000;constructor(options={}){this.name=options.name||'DefaultPipeline';this.#maxSize=options.maxSize||1000;}push(item){if(this.#buffer.length>=this.#maxSize){throw new Error('Buffer overflow');}this.#buffer.push(item);return this;}flush(){const items=[...this.#buffer];this.#buffer=[];return items;}static create(name){return new DataPipeline({name});}}`
  },
  'Array Pipeline': {
    label: 'Array Map, Filter, Reduce',
    js: `const transactions=[{id:1,amount:120.5,category:'Hardware',status:'completed'},{id:2,amount:45.0,category:'Software',status:'pending'},{id:3,amount:310.25,category:'Hardware',status:'completed'}];const totalHardwareSpend=transactions.filter(t=>t.status==='completed'&&t.category==='Hardware').map(t=>t.amount).reduce((sum,current)=>sum+current,0);console.log(\`Total hardware spend: \$\${totalHardwareSpend.toFixed(2)}\`);`
  }
};

export const JsFormatterPanel: React.FC<JsFormatterPanelProps> = ({
  initialValue
}) => {
  const [jsInput, setJsInput] = useState<string>(
    initialValue || JS_PRESETS['Async Fetcher'].js
  );
  const [indentSize, setIndentSize] = useState<2 | 4 | 'tab'>(2);
  const [quoteType, setQuoteType] = useState<'preserve' | 'single' | 'double'>('preserve');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatted output
  const formattedJs = useMemo(() => {
    if (!jsInput.trim()) return '';
    try {
      return formatJs(jsInput, {
        indent: indentSize,
        quoteType
      });
    } catch (err: any) {
      return `// Error formatting JavaScript: ${err?.message || 'Syntax error'}\n${jsInput}`;
    }
  }, [jsInput, indentSize, quoteType]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([jsInput]).size;
    const formattedBytes = new Blob([formattedJs]).size;
    const deltaBytes = formattedBytes - rawBytes;
    const deltaPercent = rawBytes > 0 ? ((deltaBytes / rawBytes) * 100).toFixed(1) : '0';
    const functionCount = (formattedJs.match(/\bfunction\b|\bclass\b|=>/g) || []).length;
    const statementCount = (formattedJs.match(/;/g) || []).length;
    const lineCount = formattedJs ? formattedJs.split('\n').length : 0;

    return {
      rawBytes,
      formattedBytes,
      deltaBytes,
      deltaPercent,
      functionCount,
      statementCount,
      lineCount
    };
  }, [jsInput, formattedJs]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJs], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-beautified.js';
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
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Braces className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              JavaScript Formatter & Beautifier
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Clean indentation, statement unminification, operator spacing & quote normalization.
            </p>
          </div>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
            {telemetry.lineCount} Lines
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
            ({telemetry.functionCount} functions/blocks)
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(JS_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setJsInput(item.js)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Raw JS Input */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source JavaScript / TypeScript
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
              placeholder="Paste raw, unformatted, or minified JavaScript here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Beautified JS Output */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Beautified JavaScript
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
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  2s
                </button>
                <button
                  onClick={() => setIndentSize(4)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 4
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  4s
                </button>
                <button
                  onClick={() => setIndentSize('tab')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 'tab'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tab
                </button>
              </div>

              {/* Quotes selector */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setQuoteType('preserve')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    quoteType === 'preserve'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="Preserve original quotes"
                >
                  Keep Quotes
                </button>
                <button
                  onClick={() => setQuoteType('single')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    quoteType === 'single'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="Convert to single quotes"
                >
                  'Single'
                </button>
                <button
                  onClick={() => setQuoteType('double')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    quoteType === 'double'
                      ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="Convert to double quotes"
                >
                  "Double"
                </button>
              </div>

              <button
                onClick={() => handleCopy(formattedJs)}
                title="Copy Formatted Code"
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
              value={formattedJs}
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
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CheckCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Full AST Statement Unminification</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Expands single-line minified code, adds statement line breaks, and restores block structures.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Operator & Colon Spacing</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Normalizes arithmetic and logical operators (===, !==, &&, ||, =&gt;) and object key-value pairs.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Server Roundtrips</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              100% private in-memory execution. Proprietary business logic and client API keys are never exposed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
