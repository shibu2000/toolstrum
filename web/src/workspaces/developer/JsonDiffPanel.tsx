import React, { useState, useMemo, useRef } from 'react';
import {
  GitCompare,
  Columns,
  List,
  FileCode,
  ArrowRightLeft,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Layers,
  Code
} from 'lucide-react';
import { autoRepairJson } from './JsonFormatterPanel';

interface JsonDiffPanelProps {
  initialLeft?: string;
  initialRight?: string;
}

export interface JsonDiffEntry {
  path: string;
  rfcPath: string;
  change: 'added' | 'removed' | 'modified' | 'unchanged';
  valA?: any;
  valB?: any;
}

export interface JsonPatchOp {
  op: 'add' | 'remove' | 'replace';
  path: string;
  value?: any;
}

const DIFF_PRESETS: Record<string, { label: string; left: any; right: any }> = {
  'Config Release': {
    label: 'App Config (v1.0 vs v2.0)',
    left: {
      appName: "Toolstrum",
      version: "1.0.0",
      environment: "staging",
      server: {
        host: "127.0.0.1",
        port: 8080,
        ssl: false,
        maxConnections: 100
      },
      features: {
        offlineMode: true,
        debugLogs: true,
        telemetry: false
      },
      tags: ["utility", "offline"]
    },
    right: {
      appName: "Toolstrum Studio",
      version: "2.0.0",
      environment: "production",
      server: {
        host: "0.0.0.0",
        port: 8443,
        ssl: true,
        maxConnections: 500,
        timeoutSec: 30
      },
      features: {
        offlineMode: true,
        debugLogs: false,
        telemetry: false,
        wasmAcceleration: true
      },
      tags: ["utility", "offline", "wasm", "security"]
    }
  },
  'User Account': {
    label: 'User Account Revision',
    left: {
      id: "usr_9901",
      name: "Alex Vance",
      email: "alex@example.org",
      role: "member",
      verified: true,
      preferences: {
        theme: "light",
        notifications: true,
        newsletter: true
      },
      loginCount: 42
    },
    right: {
      id: "usr_9901",
      name: "Alex Vance",
      email: "alex.vance@techcorp.io",
      role: "admin",
      verified: true,
      preferences: {
        theme: "dark",
        notifications: true,
        newsletter: false,
        twoFactorAuth: true
      },
      loginCount: 43
    }
  },
  'E-Commerce Cart': {
    label: 'Cart / Order Item Changes',
    left: {
      cartId: "cart_331",
      currency: "USD",
      items: [
        { sku: "SKU-PDF-PRO", qty: 1, unitPrice: 29.00 },
        { sku: "SKU-IMG-OPT", qty: 2, unitPrice: 15.00 }
      ],
      discountCode: null,
      subtotal: 59.00
    },
    right: {
      cartId: "cart_331",
      currency: "USD",
      items: [
        { sku: "SKU-PDF-PRO", qty: 2, unitPrice: 29.00 },
        { sku: "SKU-DEV-STUDIO", qty: 1, unitPrice: 49.00 }
      ],
      discountCode: "OFFLINE20",
      subtotal: 85.60
    }
  }
};

// Deep JSON comparison algorithm
function computeJsonDiff(
  a: any,
  b: any,
  sortKeys = false,
  path = '',
  rfcPath = ''
): { diffs: JsonDiffEntry[]; identicalCount: number } {
  let diffs: JsonDiffEntry[] = [];
  let identicalCount = 0;

  // Primitives or type mismatch
  if (
    a === null ||
    b === null ||
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    Array.isArray(a) !== Array.isArray(b)
  ) {
    if (a !== b) {
      diffs.push({
        path: path || 'root',
        rfcPath: rfcPath || '/',
        change: 'modified',
        valA: a,
        valB: b
      });
    } else {
      identicalCount++;
    }
    return { diffs, identicalCount };
  }

  // Handle Arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    const maxLen = Math.max(a.length, b.length);
    for (let i = 0; i < maxLen; i++) {
      const curPath = path ? `${path}[${i}]` : `[${i}]`;
      const curRfc = `${rfcPath}/${i}`;
      if (i >= a.length) {
        diffs.push({
          path: curPath,
          rfcPath: curRfc,
          change: 'added',
          valB: b[i]
        });
      } else if (i >= b.length) {
        diffs.push({
          path: curPath,
          rfcPath: curRfc,
          change: 'removed',
          valA: a[i]
        });
      } else {
        const sub = computeJsonDiff(a[i], b[i], sortKeys, curPath, curRfc);
        diffs = diffs.concat(sub.diffs);
        identicalCount += sub.identicalCount;
      }
    }
    return { diffs, identicalCount };
  }

  // Handle Objects
  let keysA = Object.keys(a);
  let keysB = Object.keys(b);
  if (sortKeys) {
    keysA.sort();
    keysB.sort();
  }

  const allKeys = Array.from(new Set([...keysA, ...keysB]));
  if (sortKeys) {
    allKeys.sort();
  }

  for (const key of allKeys) {
    const curPath = path ? `${path}.${key}` : key;
    const escapedKey = key.replace(/~/g, '~0').replace(/\//g, '~1');
    const curRfc = `${rfcPath}/${escapedKey}`;
    const hasA = Object.prototype.hasOwnProperty.call(a, key);
    const hasB = Object.prototype.hasOwnProperty.call(b, key);

    if (hasA && !hasB) {
      diffs.push({
        path: curPath,
        rfcPath: curRfc,
        change: 'removed',
        valA: a[key]
      });
    } else if (!hasA && hasB) {
      diffs.push({
        path: curPath,
        rfcPath: curRfc,
        change: 'added',
        valB: b[key]
      });
    } else {
      const sub = computeJsonDiff(a[key], b[key], sortKeys, curPath, curRfc);
      diffs = diffs.concat(sub.diffs);
      identicalCount += sub.identicalCount;
    }
  }

  return { diffs, identicalCount };
}

// Convert diff entries to RFC 6902 JSON Patch
function generateRfc6902Patch(diffs: JsonDiffEntry[]): JsonPatchOp[] {
  return diffs.map((d) => {
    if (d.change === 'added') {
      return { op: 'add', path: d.rfcPath, value: d.valB };
    }
    if (d.change === 'removed') {
      return { op: 'remove', path: d.rfcPath };
    }
    return { op: 'replace', path: d.rfcPath, value: d.valB };
  });
}

// Helper to sort keys recursively
function deepSortKeys(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(deepSortKeys);
  return Object.keys(obj)
    .sort()
    .reduce((acc: any, k) => {
      acc[k] = deepSortKeys(obj[k]);
      return acc;
    }, {});
}

export const JsonDiffPanel: React.FC<JsonDiffPanelProps> = ({ initialLeft, initialRight }) => {
  const [leftInput, setLeftInput] = useState<string>(
    initialLeft || JSON.stringify(DIFF_PRESETS['Config Release'].left, null, 2)
  );
  const [rightInput, setRightInput] = useState<string>(
    initialRight || JSON.stringify(DIFF_PRESETS['Config Release'].right, null, 2)
  );
  const [viewMode, setViewMode] = useState<'split' | 'unified' | 'changes' | 'patch'>('split');
  const [filterType, setFilterType] = useState<'all' | 'added' | 'removed' | 'modified'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortKeys, setSortKeys] = useState<boolean>(true);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const fileLeftRef = useRef<HTMLInputElement>(null);
  const fileRightRef = useRef<HTMLInputElement>(null);

  // Parse left and right
  const parsedLeft = useMemo(() => {
    if (!leftInput.trim()) return { val: null, error: 'Empty Left Payload' };
    try {
      const parsed = JSON.parse(leftInput);
      return { val: sortKeys ? deepSortKeys(parsed) : parsed, error: null };
    } catch (e: any) {
      return { val: null, error: e?.message || 'Invalid JSON syntax on Left' };
    }
  }, [leftInput, sortKeys]);

  const parsedRight = useMemo(() => {
    if (!rightInput.trim()) return { val: null, error: 'Empty Right Payload' };
    try {
      const parsed = JSON.parse(rightInput);
      return { val: sortKeys ? deepSortKeys(parsed) : parsed, error: null };
    } catch (e: any) {
      return { val: null, error: e?.message || 'Invalid JSON syntax on Right' };
    }
  }, [rightInput, sortKeys]);

  // Compute diff and stats
  const diffResult = useMemo(() => {
    if (parsedLeft.error || parsedRight.error || parsedLeft.val === null || parsedRight.val === null) {
      return {
        diffs: [] as JsonDiffEntry[],
        added: 0,
        removed: 0,
        modified: 0,
        identical: 0,
        similarity: 0,
        patch: [] as JsonPatchOp[]
      };
    }

    const { diffs, identicalCount } = computeJsonDiff(parsedLeft.val, parsedRight.val, sortKeys);
    const added = diffs.filter((d) => d.change === 'added').length;
    const removed = diffs.filter((d) => d.change === 'removed').length;
    const modified = diffs.filter((d) => d.change === 'modified').length;

    const totalEvaluated = identicalCount * 2 + added + removed + modified * 2;
    const similarity =
      totalEvaluated > 0
        ? Math.round(((identicalCount * 2) / totalEvaluated) * 100)
        : diffs.length === 0
        ? 100
        : 0;

    const patch = generateRfc6902Patch(diffs);

    return {
      diffs,
      added,
      removed,
      modified,
      identical: identicalCount,
      similarity,
      patch
    };
  }, [parsedLeft, parsedRight, sortKeys]);

  // Filtered diff list
  const filteredDiffs = useMemo(() => {
    return diffResult.diffs.filter((d) => {
      const matchesType = filterType === 'all' || d.change === filterType;
      const matchesSearch =
        !searchQuery.trim() ||
        d.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(d.valA || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(d.valB || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [diffResult.diffs, filterType, searchQuery]);

  // Swap Left & Right
  const handleSwap = () => {
    const temp = leftInput;
    setLeftInput(rightInput);
    setRightInput(temp);
  };

  // Preset loader
  const handleLoadPreset = (key: string) => {
    const p = DIFF_PRESETS[key];
    if (p) {
      setLeftInput(JSON.stringify(p.left, null, 2));
      setRightInput(JSON.stringify(p.right, null, 2));
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, actionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionId);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  // Export report
  const downloadReport = () => {
    const lines = [
      `# Toolstrum JSON Difference Report`,
      `Generated: ${new Date().toISOString()}`,
      `Total Differences: ${diffResult.diffs.length} (+${diffResult.added} / -${diffResult.removed} / ~${diffResult.modified})`,
      `Similarity Index: ${diffResult.similarity}%`,
      ``,
      `## RFC 6902 JSON Patch`,
      '```json',
      JSON.stringify(diffResult.patch, null, 2),
      '```',
      ``,
      `## Detailed Changes List`,
      ...diffResult.diffs.map(
        (d, i) =>
          `${i + 1}. [${d.change.toUpperCase()}] \`${d.path}\`${
            d.change === 'modified'
              ? `\n   - Original: ${JSON.stringify(d.valA)}\n   + Modified: ${JSON.stringify(d.valB)}`
              : d.change === 'added'
              ? `\n   + Value: ${JSON.stringify(d.valB)}`
              : `\n   - Deleted: ${JSON.stringify(d.valA)}`
          }`
      )
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `json-diff-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                JSON Diff & Object Comparison
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  RFC 6902 Compliant
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Deep semantic comparison of two JSON trees with structural diff highlighting and patch export.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Presets:</span>
            {Object.keys(DIFF_PRESETS).map((key) => (
              <button
                key={key}
                onClick={() => handleLoadPreset(key)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Global Controls & Modes */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* View mode switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 text-xs font-medium">
            <button
              onClick={() => setViewMode('split')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('changes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'changes'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Changes ({diffResult.diffs.length})
            </button>
            <button
              onClick={() => setViewMode('patch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                viewMode === 'patch'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              RFC 6902 Patch
            </button>
          </div>

          {/* Action options */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSwap}
              title="Swap Left & Right payloads"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap Left / Right
            </button>

            <button
              onClick={() => setSortKeys(!sortKeys)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                sortKeys
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sort Keys: {sortKeys ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={downloadReport}
              disabled={diffResult.diffs.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Similarity</span>
          <p className="text-lg font-black text-sky-600 dark:text-sky-400 mt-0.5">{diffResult.similarity}%</p>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1">
            <Plus className="w-3 h-3" /> Added
          </span>
          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5">+{diffResult.added}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1">
            <Minus className="w-3 h-3" /> Removed
          </span>
          <p className="text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5">-{diffResult.removed}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 text-center">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center justify-center gap-1">
            ~ Modified
          </span>
          <p className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">~{diffResult.modified}</p>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Diffs</span>
          <p className="text-lg font-black text-slate-700 dark:text-slate-300 mt-0.5">{diffResult.diffs.length}</p>
        </div>
      </div>

      {/* Main Dual Editor Area (Always visible in split view or expandable) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: ORIGINAL (A) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Original Payload (A / Left)
              </label>
              {parsedLeft.error ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Invalid
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Valid
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileLeftRef}
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = (ev) => setLeftInput((ev.target?.result as string) || '');
                    r.readAsText(f);
                  }
                }}
              />
              <button
                onClick={() => fileLeftRef.current?.click()}
                title="Upload JSON"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => copyToClipboard(leftInput, 'left')}
                title="Copy Left JSON"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copiedAction === 'left' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setLeftInput('')}
                title="Clear Left"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={leftInput}
            onChange={(e) => setLeftInput(e.target.value)}
            rows={viewMode === 'split' ? 14 : 7}
            placeholder="Paste original JSON structure here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-y"
          />

          {parsedLeft.error && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parsedLeft.error}
              </span>
              <button
                onClick={() => {
                  try {
                    const { repaired } = autoRepairJson(leftInput);
                    setLeftInput(repaired);
                  } catch {}
                }}
                className="px-2 py-0.5 rounded-lg bg-rose-200 dark:bg-rose-900 font-semibold text-[11px] hover:bg-rose-300 shrink-0"
              >
                ⚡ Repair
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANE: MODIFIED (B) */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Modified Payload (B / Right)
              </label>
              {parsedRight.error ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Invalid
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Valid
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileRightRef}
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = (ev) => setRightInput((ev.target?.result as string) || '');
                    r.readAsText(f);
                  }
                }}
              />
              <button
                onClick={() => fileRightRef.current?.click()}
                title="Upload JSON"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => copyToClipboard(rightInput, 'right')}
                title="Copy Right JSON"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copiedAction === 'right' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setRightInput('')}
                title="Clear Right"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={rightInput}
            onChange={(e) => setRightInput(e.target.value)}
            rows={viewMode === 'split' ? 14 : 7}
            placeholder="Paste modified JSON structure here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-y"
          />

          {parsedRight.error && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parsedRight.error}
              </span>
              <button
                onClick={() => {
                  try {
                    const { repaired } = autoRepairJson(rightInput);
                    setRightInput(repaired);
                  } catch {}
                }}
                className="px-2 py-0.5 rounded-lg bg-rose-200 dark:bg-rose-900 font-semibold text-[11px] hover:bg-rose-300 shrink-0"
              >
                ⚡ Repair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* VIEW PANEL 1: STRUCTURAL CHANGES LIST */}
      {(viewMode === 'split' || viewMode === 'changes') && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <List className="w-4 h-4 text-sky-500" />
                Structural Changes Breakdown
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {filteredDiffs.length} shown
              </span>
            </div>

            {/* Change filter pills */}
            <div className="flex flex-wrap items-center gap-2">
              {(['all', 'added', 'removed', 'modified'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-colors ${
                    filterType === t
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}

              {/* Search input */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter path..."
                  className="pl-8 pr-3 py-1 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Diffs Table / Cards */}
          {filteredDiffs.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 space-y-1">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {diffResult.diffs.length === 0 ? 'Objects are 100% Identical' : 'No changes match your filter'}
              </p>
              <p className="text-xs text-slate-400">
                {diffResult.diffs.length === 0
                  ? 'All keys and values match across both payloads perfectly.'
                  : 'Try selecting a different change filter or clearing the search box.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredDiffs.map((d, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    d.change === 'added'
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60'
                      : d.change === 'removed'
                      ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60'
                      : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          d.change === 'added'
                            ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                            : d.change === 'removed'
                            ? 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
                            : 'bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                        }`}
                      >
                        {d.change}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white truncate">{d.path}</span>
                      <span className="text-[10px] text-slate-400">({d.rfcPath})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-slate-700 dark:text-slate-300">
                      {d.change !== 'added' && (
                        <div className="flex items-center gap-1">
                          <span className="text-rose-600 dark:text-rose-400 font-bold">- Old:</span>
                          <code className="px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30 text-rose-700 dark:text-rose-300">
                            {JSON.stringify(d.valA)}
                          </code>
                        </div>
                      )}
                      {d.change !== 'removed' && (
                        <div className="flex items-center gap-1">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">+ New:</span>
                          <code className="px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/30 text-emerald-700 dark:text-emerald-300">
                            {JSON.stringify(d.valB)}
                          </code>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-end md:self-auto">
                    <button
                      onClick={() => copyToClipboard(d.path, `path-${idx}`)}
                      title="Copy Path"
                      className="px-2 py-1 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-white text-slate-600 dark:text-slate-300 text-[11px] font-sans font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                    >
                      {copiedAction === `path-${idx}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      Path
                    </button>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(d.valB ?? d.valA), `val-${idx}`)}
                      title="Copy Value"
                      className="px-2 py-1 rounded-md bg-white/80 dark:bg-slate-800 hover:bg-white text-slate-600 dark:text-slate-300 text-[11px] font-sans font-medium border border-slate-200 dark:border-slate-700 flex items-center gap-1"
                    >
                      {copiedAction === `val-${idx}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      Value
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW PANEL 2: RFC 6902 JSON PATCH EXPORT */}
      {viewMode === 'patch' && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code className="w-4 h-4 text-sky-500" />
                RFC 6902 JSON Patch Document
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Standard atomic operations (add, remove, replace) to transform Left into Right.
              </p>
            </div>

            <button
              onClick={() => copyToClipboard(JSON.stringify(diffResult.patch, null, 2), 'patch-all')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors"
            >
              {copiedAction === 'patch-all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Patch JSON
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[420px] leading-relaxed">
            {JSON.stringify(diffResult.patch, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};
