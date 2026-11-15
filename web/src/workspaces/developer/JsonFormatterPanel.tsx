import React, { useState, useMemo, useRef } from 'react';
import {
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Wrench,
  ChevronRight,
  ChevronDown,
  Sparkles,
  FileCode,
  FolderTree,
  Search,
  ArrowDownAZ,
  Minimize2,
  FileText,
  AlertTriangle,
  Info,
  Maximize2
} from 'lucide-react';

interface JsonFormatterPanelProps {
  initialValue?: string;
}

type IndentMode = '2' | '4' | 'tab' | 'compact';
type ViewMode = 'code' | 'tree';

// Sample JSON templates
const SAMPLE_TEMPLATES: Record<string, string> = {
  'User Profile': JSON.stringify(
    {
      id: "usr_99824",
      active: true,
      role: "lead_engineer",
      profile: {
        firstName: "Alex",
        lastName: "Morgan",
        email: "alex.morgan@toolstrum.local",
        avatar: null,
        metadata: {
          timezone: "UTC",
          locale: "en-US",
          loginsCount: 142,
          lastActiveEpoch: 1731651400
        }
      },
      tags: ["offline", "wasm", "security", "core"],
      permissions: [
        { scope: "storage:read", granted: true },
        { scope: "storage:write", granted: true },
        { scope: "admin:keys", granted: false }
      ]
    },
    null,
    2
  ),
  'API Response': JSON.stringify(
    {
      status: 200,
      success: true,
      message: "Studio catalog loaded successfully",
      pagination: {
        page: 1,
        perPage: 25,
        totalItems: 448,
        totalPages: 18,
        hasNext: true
      },
      data: [
        { id: 244, name: "JSON Formatter", category: "developer", offlineCapable: true },
        { id: 245, name: "JSON Validator", category: "developer", offlineCapable: true },
        { id: 246, name: "JSON Minifier", category: "developer", offlineCapable: true }
      ],
      rateLimitRemaining: null
    },
    null,
    2
  ),
  'E-Commerce Cart': JSON.stringify(
    {
      orderId: "ord_2026_0115",
      customer: {
        name: "Devin Vance",
        tier: "Platinum",
        verified: true
      },
      currency: "USD",
      items: [
        { sku: "TOOL-PRO-LIFETIME", qty: 1, unitPrice: 0.00, discountPercent: 100 },
        { sku: "OFFLINE-WASM-PACK", qty: 1, unitPrice: 0.00, discountPercent: 100 }
      ],
      pricing: {
        subtotal: 0.00,
        tax: 0.00,
        shipping: 0.00,
        total: 0.00
      },
      fulfilled: true
    },
    null,
    2
  )
};

// Recursive Key Sorter
function sortJsonKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortJsonKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc: Record<string, any>, key) => {
        acc[key] = sortJsonKeys(obj[key]);
        return acc;
      }, {});
  }
  return obj;
}

// Smart Repair for broken/loose JSON
export function autoRepairJson(raw: string): { repaired: string; fixedIssues: string[] } {
  const issues: string[] = [];
  let s = raw.trim();

  // Strip single-line comments // ...
  if (/\/\/.*$/m.test(s)) {
    s = s.replace(/\/\/.*$/gm, '');
    issues.push('Removed JS inline comments');
  }

  // Strip multi-line comments /* ... */
  if (/\/\*[\s\S]*?\*\//m.test(s)) {
    s = s.replace(/\/\*[\s\S]*?\*\//gm, '');
    issues.push('Removed block comments');
  }

  // Replace Python None, True, False
  if (/\bNone\b/.test(s)) {
    s = s.replace(/\bNone\b/g, 'null');
    issues.push('Replaced None with null');
  }
  if (/\bTrue\b/.test(s)) {
    s = s.replace(/\bTrue\b/g, 'true');
    issues.push('Replaced True with true');
  }
  if (/\bFalse\b/.test(s)) {
    s = s.replace(/\bFalse\b/g, 'false');
    issues.push('Replaced False with false');
  }

  // Fix trailing commas before closing braces/brackets
  if (/,\s*([\]}])/m.test(s)) {
    s = s.replace(/,\s*([\]}])/g, '$1');
    issues.push('Removed trailing commas');
  }

  // Replace single-quoted strings with double quotes
  // Handles 'key': 'val' -> "key": "val"
  if (/'([^'\\]*(?:\\.[^'\\]*)*)'/m.test(s)) {
    s = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, match) => {
      return '"' + match.replace(/"/g, '\\"') + '"';
    });
    issues.push('Replaced single quotes with double quotes');
  }

  // Quote unquoted object keys: { foo: "bar" } -> { "foo": "bar" }
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g;
  if (unquotedKeyRegex.test(s)) {
    s = s.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
    issues.push('Quoted unquoted object keys');
  }

  return { repaired: s, fixedIssues: issues.length > 0 ? issues : ['Syntax normalization applied'] };
}

// Calculate JSON structural telemetry
function getJsonStats(obj: any): { keysCount: number; arrayCount: number; maxDepth: number } {
  let keys = 0;
  let arrays = 0;
  let maxD = 0;

  function traverse(node: any, depth: number) {
    if (depth > maxD) maxD = depth;
    if (Array.isArray(node)) {
      arrays += node.length;
      for (const item of node) {
        traverse(item, depth + 1);
      }
    } else if (node !== null && typeof node === 'object') {
      const kList = Object.keys(node);
      keys += kList.length;
      for (const k of kList) {
        traverse(node[k], depth + 1);
      }
    }
  }

  traverse(obj, 1);
  return { keysCount: keys, arrayCount: arrays, maxDepth: maxD };
}

// =========================================================================
// RECURSIVE INTERACTIVE TREE NODE
// =========================================================================
interface TreeNodeProps {
  nodeKey?: string;
  value: any;
  path: string;
  depth: number;
  searchFilter: string;
}

const JsonTreeNode: React.FC<TreeNodeProps> = ({ nodeKey, value, path, depth, searchFilter }) => {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const [copiedPath, setCopiedPath] = useState(false);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isContainer = isObject || isArray;

  const handleCopyPath = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(path);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 1500);
  };

  // Filter check
  const searchLower = searchFilter.toLowerCase();
  const matchesSearch =
    !searchFilter ||
    (nodeKey && nodeKey.toLowerCase().includes(searchLower)) ||
    (!isContainer && String(value).toLowerCase().includes(searchLower));

  const renderBadge = () => {
    if (value === null) return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-500">null</span>;
    if (isArray) return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-500">array[{value.length}]</span>;
    if (isObject) return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-500">object&#123;{Object.keys(value).length}&#125;</span>;
    if (typeof value === 'boolean') return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 text-purple-500">bool: {String(value)}</span>;
    if (typeof value === 'number') return <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-500">{value}</span>;
    return <span className="text-emerald-600 dark:text-emerald-400 font-mono">"{String(value)}"</span>;
  };

  return (
    <div className={`text-xs font-mono select-text ${!matchesSearch && !isContainer ? 'opacity-30' : ''}`}>
      <div
        onClick={() => isContainer && setCollapsed(!collapsed)}
        className={`group flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors ${
          isContainer ? 'cursor-pointer' : ''
        }`}
        style={{ paddingLeft: `${Math.max(8, depth * 16)}px` }}
      >
        {/* Collapse toggle */}
        {isContainer ? (
          <span className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        ) : (
          <span className="w-3.5 inline-block" />
        )}

        {/* Node Key */}
        {nodeKey !== undefined && (
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            "{nodeKey}":
          </span>
        )}

        {/* Value / Badge */}
        {renderBadge()}

        {/* Hover Action: Copy JSONPath */}
        <button
          onClick={handleCopyPath}
          title={`Copy path: ${path}`}
          className="opacity-0 group-hover:opacity-100 ml-auto px-1.5 py-0.5 rounded text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-opacity flex items-center gap-1"
        >
          {copiedPath ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
          <span>{copiedPath ? 'Copied' : path}</span>
        </button>
      </div>

      {/* Expanded Container Children */}
      {isContainer && !collapsed && (
        <div className="border-l border-slate-200 dark:border-slate-800/80 ml-3">
          {isArray
            ? value.map((item: any, idx: number) => (
                <JsonTreeNode
                  key={idx}
                  nodeKey={String(idx)}
                  value={item}
                  path={`${path}[${idx}]`}
                  depth={depth + 1}
                  searchFilter={searchFilter}
                />
              ))
            : Object.entries(value).map(([k, v]) => (
                <JsonTreeNode
                  key={k}
                  nodeKey={k}
                  value={v}
                  path={path === '$' ? `$.${k}` : `${path}.${k}`}
                  depth={depth + 1}
                  searchFilter={searchFilter}
                />
              ))}
        </div>
      )}
    </div>
  );
};

// =========================================================================
// MAIN JSON FORMATTER PANEL COMPONENT
// =========================================================================
export const JsonFormatterPanel: React.FC<JsonFormatterPanelProps> = ({ initialValue }) => {
  const [input, setInput] = useState<string>(initialValue || SAMPLE_TEMPLATES['User Profile']);
  const [indentMode, setIndentMode] = useState<IndentMode>('2');
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  const [treeSearch, setTreeSearch] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [repairBanner, setRepairBanner] = useState<{ show: boolean; preview: string; issues: string[] }>({
    show: false,
    preview: '',
    issues: []
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse & format
  const parsedData = useMemo(() => {
    if (!input.trim()) {
      return { value: undefined, error: null, formatted: '', minified: '' };
    }

    try {
      let parsed = JSON.parse(input);
      if (sortKeys) {
        parsed = sortJsonKeys(parsed);
      }

      let indentStr: string | number = 2;
      if (indentMode === '4') indentStr = 4;
      else if (indentMode === 'tab') indentStr = '\t';
      else if (indentMode === 'compact') indentStr = 0;

      const formatted = indentMode === 'compact' ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indentStr);
      const minified = JSON.stringify(parsed);

      return {
        value: parsed,
        error: null,
        formatted,
        minified
      };
    } catch (err: any) {
      // Analyze if auto-repair can fix it
      let repairable = false;
      let repairOutput = '';
      let repairIssues: string[] = [];

      try {
        const res = autoRepairJson(input);
        JSON.parse(res.repaired); // test if repaired parses cleanly
        repairable = true;
        repairOutput = res.repaired;
        repairIssues = res.fixedIssues;
      } catch {
        repairable = false;
      }

      return {
        value: undefined,
        error: err.message || 'Invalid JSON syntax',
        formatted: '',
        minified: '',
        repairable,
        repairOutput,
        repairIssues
      };
    }
  }, [input, indentMode, sortKeys]);

  // Compute telemetry metrics
  const telemetry = useMemo(() => {
    if (parsedData.value === undefined) return null;
    const stats = getJsonStats(parsedData.value);
    const rawBytes = new Blob([input]).size;
    const formattedBytes = new Blob([parsedData.formatted]).size;
    const minifiedBytes = new Blob([parsedData.minified]).size;
    const savingsPercent = rawBytes > 0 ? Math.round(((rawBytes - minifiedBytes) / rawBytes) * 100) : 0;

    return {
      keysCount: stats.keysCount,
      arrayCount: stats.arrayCount,
      maxDepth: stats.maxDepth,
      rawBytes,
      formattedBytes,
      minifiedBytes,
      savingsPercent: Math.max(0, savingsPercent)
    };
  }, [parsedData, input]);

  // Actions
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!parsedData.formatted) return;
    const blob = new Blob([parsedData.formatted], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted_${Date.now()}.json`;
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

  const handleApplyAutoRepair = () => {
    if (parsedData.repairOutput) {
      setInput(parsedData.repairOutput);
      setRepairBanner({ show: false, preview: '', issues: [] });
    }
  };

  return (
    <div className="space-y-6">
      {/* Telemetry Strip & Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Presets */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Presets:
          </span>
          {Object.keys(SAMPLE_TEMPLATES).map((name) => (
            <button
              key={name}
              onClick={() => setInput(SAMPLE_TEMPLATES[name])}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors"
            >
              {name}
            </button>
          ))}
        </div>

        {/* Live Metrics */}
        {telemetry && (
          <div className="flex items-center gap-3 text-xs font-mono text-slate-600 dark:text-slate-300 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              Keys: <strong>{telemetry.keysCount}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              Depth: <strong>{telemetry.maxDepth}</strong>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
              Size: <strong>{(telemetry.formattedBytes / 1024).toFixed(1)} KB</strong>
            </span>
            {telemetry.savingsPercent > 0 && (
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
                -{telemetry.savingsPercent}% Minified
              </span>
            )}
          </div>
        )}
      </div>

      {/* Auto-Repair Notice if JSON has syntax errors but is fixable */}
      {parsedData.error && parsedData.repairable && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-2.5">
            <Wrench className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Loose or Malformed JSON Detected — Auto-Repair Available
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5">
                Issues detected: {parsedData.repairIssues?.join(', ') || 'Quotes or trailing commas'}. We can automatically repair this into standard strict JSON.
              </p>
            </div>
          </div>
          <button
            onClick={handleApplyAutoRepair}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Apply Auto-Repair</span>
          </button>
        </div>
      )}

      {/* Main Dual-Pane Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Input Panel */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-500" />
              <span>JSON Input</span>
            </label>
            <div className="flex items-center gap-2">
              {/* Upload JSON file */}
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

              {/* Clear */}
              <button
                onClick={() => setInput('')}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={18}
            className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 resize-y"
            placeholder="Paste raw, minified, or loose JSON here..."
            spellCheck={false}
          />

          {/* Error Indicator if unrepairable */}
          {parsedData.error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <div className="font-mono">
                <strong>Syntax Error:</strong> {parsedData.error}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Output / Formatted View */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/20 shadow-md space-y-4">
          {/* Controls Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
              <button
                onClick={() => setViewMode('code')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'code'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>Code</span>
              </button>
              <button
                onClick={() => setViewMode('tree')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  viewMode === 'tree'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <FolderTree className="w-3.5 h-3.5" />
                <span>Interactive Tree</span>
              </button>
            </div>

            {/* Indent Options */}
            <div className="flex items-center gap-1">
              {(['2', '4', 'tab', 'compact'] as IndentMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setIndentMode(mode)}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                    indentMode === mode
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {mode === 'tab' ? 'Tab' : mode === 'compact' ? 'Minify' : `${mode}s`}
                </button>
              ))}

              {/* Sort Keys (A-Z) */}
              <button
                onClick={() => setSortKeys(!sortKeys)}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ml-1 ${
                  sortKeys
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Sort object keys alphabetically (A-Z)"
              >
                <ArrowDownAZ className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Search for Tree View */}
          {viewMode === 'tree' && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter keys or values..."
                value={treeSearch}
                onChange={(e) => setTreeSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Content Box */}
          <div className="min-h-[380px] max-h-[500px] overflow-auto rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4">
            {parsedData.error ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <AlertTriangle className="w-8 h-8 text-rose-500 mb-2 opacity-80" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cannot format invalid JSON
                </p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
                  {parsedData.error}
                </p>
              </div>
            ) : viewMode === 'code' ? (
              <pre className="font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed whitespace-pre select-text">
                {parsedData.formatted || '// Formatted output will appear here'}
              </pre>
            ) : (
              <div className="space-y-0.5">
                <JsonTreeNode
                  value={parsedData.value}
                  path="$"
                  depth={0}
                  searchFilter={treeSearch}
                />
              </div>
            )}
          </div>

          {/* Actions Footer */}
          {parsedData.formatted && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                {/* Copy Formatted */}
                <button
                  onClick={() => handleCopy(parsedData.formatted)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Formatted'}</span>
                </button>

                {/* Copy Minified */}
                <button
                  onClick={() => handleCopy(parsedData.minified)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Copy Minified</span>
                </button>
              </div>

              {/* Download JSON */}
              <button
                onClick={handleDownload}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .json</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
