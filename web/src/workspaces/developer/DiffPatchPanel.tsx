import React, { useState, useMemo } from 'react';
import {
  Layers,
  Copy,
  Check,
  Download,
  ArrowLeftRight,
  Trash2,
  Columns,
  List,
  Sparkles,
  Info,
  FileCode,
} from 'lucide-react';
import { computeLineDiff, DiffResult } from './devHelpers';

const SAMPLE_ORIGINAL = `// Toolstrum Application Server
export interface ServerConfig {
  port: number;
  host: string;
  debugMode: boolean;
  maxConnections: number;
  corsEnabled: boolean;
}

export function startServer(config: ServerConfig) {
  console.log("Starting server on " + config.host + ":" + config.port);
  if (config.debugMode) {
    console.log("Debug telemetry active.");
  }
}`;

const SAMPLE_MODIFIED = `// Toolstrum Application Server (Production Ready)
export interface ServerConfig {
  port: number;
  host: string;
  debugMode: boolean;
  maxConnections: number;
  corsEnabled: boolean;
  tlsEnabled: boolean;
  offlineFirst: boolean;
}

export function startServer(config: ServerConfig) {
  console.log(\`[Toolstrum] Booting on \${config.host}:\${config.port}\`);
  if (config.debugMode) {
    console.info("Debug telemetry active with verbose tracing.");
  }
}`;

export const DiffPatchPanel: React.FC = () => {
  const [original, setOriginal] = useState<string>(SAMPLE_ORIGINAL);
  const [modified, setModified] = useState<string>(SAMPLE_MODIFIED);
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'patch'>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState<boolean>(false);
  const [ignoreCase, setIgnoreCase] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownloadPatch = (patchText: string) => {
    const blob = new Blob([patchText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `changes-${Date.now()}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  };

  const handleClear = () => {
    setOriginal('');
    setModified('');
  };

  const diffResult: DiffResult = useMemo(() => {
    return computeLineDiff(original, modified, { ignoreWhitespace, ignoreCase });
  }, [original, modified, ignoreWhitespace, ignoreCase]);

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Diff & Patch Viewer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Line-by-line comparison with unified patch generation. 100% Client-Side.
            </p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold font-mono">
            +{diffResult.additions} added
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-xs font-bold font-mono">
            -{diffResult.deletions} removed
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold font-mono">
            {diffResult.unchanged} unchanged
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 text-xs font-bold">
            {diffResult.similarity}% similar
          </span>
        </div>
      </div>

      {/* Editor Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'split'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Split View</span>
          </button>
          <button
            onClick={() => setViewMode('unified')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'unified'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>Unified View</span>
          </button>
          <button
            onClick={() => setViewMode('patch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              viewMode === 'patch'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Raw Patch</span>
          </button>
        </div>

        {/* Comparison Options & Quick Actions */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded accent-sky-500"
            />
            <span>Ignore Whitespace</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer mr-2">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded accent-sky-500"
            />
            <span>Ignore Case</span>
          </label>

          <button
            onClick={handleSwap}
            title="Swap Original and Modified"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            title="Clear All"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Input Editors (Collapsible / Side by Side) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Original Text (Left)
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {original.split('\n').length} lines
            </span>
          </div>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={8}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            placeholder="Paste original source text here..."
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Modified Text (Right)
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {modified.split('\n').length} lines
            </span>
          </div>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            rows={8}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            placeholder="Paste modified version here..."
          />
        </div>
      </div>

      {/* Diff Result Canvas */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {viewMode === 'patch' ? (
          /* Raw Unified Patch View */
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Standard Unified Patch Format
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(diffResult.unifiedPatch, 'patch')}
                  className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5"
                >
                  {copiedKey === 'patch' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Patch</span>
                </button>
                <button
                  onClick={() => handleDownloadPatch(diffResult.unifiedPatch)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5"
                >
                  <Download className="w-3 h-3" />
                  <span>Download .patch</span>
                </button>
              </div>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[480px] overflow-y-auto">
              {diffResult.unifiedPatch}
            </pre>
          </div>
        ) : viewMode === 'split' ? (
          /* Split View */
          <div className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs max-h-[500px] overflow-y-auto">
            <div className="grid grid-cols-2 bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] py-1.5 px-3 sticky top-0 border-b border-slate-200 dark:border-slate-800">
              <div>Original</div>
              <div>Modified</div>
            </div>
            {diffResult.lines.map((l, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-2 text-xs py-1 px-3 ${
                  l.type === 'added'
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                    : l.type === 'removed'
                    ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex gap-2 truncate pr-2 border-r border-slate-100 dark:border-slate-800">
                  <span className="w-7 text-right text-slate-400 select-none text-[11px] shrink-0">
                    {l.oldLineNumber || ''}
                  </span>
                  <span className="truncate">{l.type === 'removed' || l.type === 'same' ? l.text : ''}</span>
                </div>
                <div className="flex gap-2 truncate pl-2">
                  <span className="w-7 text-right text-slate-400 select-none text-[11px] shrink-0">
                    {l.newLineNumber || ''}
                  </span>
                  <span className="truncate">{l.type === 'added' || l.type === 'same' ? l.text : ''}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Unified View */
          <div className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-xs max-h-[500px] overflow-y-auto">
            <div className="bg-slate-50 dark:bg-slate-950 text-slate-400 font-bold uppercase text-[10px] py-1.5 px-3 sticky top-0 border-b border-slate-200 dark:border-slate-800">
              Unified Inline Diff
            </div>
            {diffResult.lines.map((l, idx) => (
              <div
                key={idx}
                className={`flex items-start gap-2.5 py-1 px-3 ${
                  l.type === 'added'
                    ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                    : l.type === 'removed'
                    ? 'bg-rose-500/10 text-rose-800 dark:text-rose-300'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-slate-400 select-none text-[11px] shrink-0 font-mono">
                  <span className="w-6 text-right">{l.oldLineNumber || ' '}</span>
                  <span className="w-6 text-right">{l.newLineNumber || ' '}</span>
                  <span className="w-3 font-black text-center">
                    {l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '}
                  </span>
                </div>
                <span className="whitespace-pre-wrap break-all flex-1">{l.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
