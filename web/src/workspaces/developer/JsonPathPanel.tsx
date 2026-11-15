import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Code,
  Table,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Sparkles,
  HelpCircle,
  Play,
  Layers,
  History,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowRight
} from 'lucide-react';
import { autoRepairJson } from './JsonFormatterPanel';

interface JsonPathPanelProps {
  initialValue?: string;
  initialQuery?: string;
}

export interface JsonPathMatch {
  path: string;
  value: any;
}

// Canonical RFC/Jayway JSONPath Benchmark Sample
const BOOKSTORE_SAMPLE = {
  store: {
    book: [
      {
        category: "reference",
        author: "Nigel Rees",
        title: "Sayings of the Century",
        price: 8.95,
        inStock: true
      },
      {
        category: "fiction",
        author: "Evelyn Waugh",
        title: "Sword of Honour",
        price: 12.99,
        inStock: false
      },
      {
        category: "fiction",
        author: "Herman Melville",
        title: "Moby Dick",
        isbn: "0-553-21311-3",
        price: 8.99,
        inStock: true
      },
      {
        category: "fiction",
        author: "J. R. R. Tolkien",
        title: "The Lord of the Rings",
        isbn: "0-395-19395-8",
        price: 22.99,
        inStock: true
      }
    ],
    bicycle: {
      color: "red",
      price: 19.95,
      brand: "Toolstrum Speedster"
    }
  },
  expensiveThreshold: 10
};

const K8S_SAMPLE = {
  apiVersion: "apps/v1",
  kind: "Deployment",
  metadata: {
    name: "toolstrum-worker",
    labels: {
      app: "toolstrum-suite",
      tier: "backend",
      env: "production"
    }
  },
  spec: {
    replicas: 3,
    template: {
      metadata: {
        labels: { app: "toolstrum-suite" }
      },
      spec: {
        containers: [
          {
            name: "webassembly-runner",
            image: "toolstrum/wasm-core:v2.1",
            ports: [{ containerPort: 8080 }, { containerPort: 9090 }],
            env: [
              { name: "OFFLINE_MODE", value: "true" },
              { name: "MEMORY_MB", value: "2048" }
            ]
          },
          {
            name: "metrics-collector",
            image: "toolstrum/metrics:v1.0",
            ports: [{ containerPort: 9100 }],
            env: [{ name: "SCRAPE_INTERVAL", value: "15s" }]
          }
        ]
      }
    }
  }
};

const CHEAT_SHEET = [
  { label: 'Root ($)', query: '$', desc: 'The entire root object' },
  { label: 'All Authors', query: '$.store.book[*].author', desc: 'All book authors' },
  { label: 'Deep Prices ($..price)', query: '$..price', desc: 'All price fields anywhere' },
  { label: 'First Book', query: '$.store.book[0]', desc: 'First element in array' },
  { label: 'Last Book', query: '$.store.book[-1:]', desc: 'Last element in array' },
  { label: 'Slice [0:2]', query: '$.store.book[0:2]', desc: 'First two books' },
  { label: 'Filter Price < 10', query: '$.store.book[?(@.price < 10)]', desc: 'Books cheaper than 10' },
  { label: 'Filter Has ISBN', query: '$.store.book[?(@.isbn)]', desc: 'Books with an ISBN' },
  { label: 'All Elements ($..*)', query: '$..*', desc: 'Recursively match all values' }
];

// Robust Offline JSONPath Evaluation Engine
export function evaluateJsonPathEngine(root: any, query: string): {
  matches: JsonPathMatch[];
  error: string | null;
  durationMs: number;
} {
  const startTime = performance.now();
  if (root === undefined || root === null) {
    return { matches: [], error: 'Input JSON is empty or undefined', durationMs: 0 };
  }

  const rawQuery = query.trim();
  if (!rawQuery || rawQuery === '$') {
    return {
      matches: [{ path: '$', value: root }],
      error: null,
      durationMs: Number((performance.now() - startTime).toFixed(2))
    };
  }

  try {
    let currentNodes: JsonPathMatch[] = [{ path: '$', value: root }];

    // Tokenize JSONPath: support dots, array indexing, wildcards, recursive descent, and filters
    // Regex splits path segments while preserving brackets
    const tokenRegex = /(\.\.)|(\.[^.[\s]+)|(\[.*?\])/g;
    let match: RegExpExecArray | null;
    const tokens: string[] = [];

    let clean = rawQuery.startsWith('$') ? rawQuery.slice(1) : rawQuery;
    if (clean.startsWith('.')) {
      // standard dot
    } else if (!clean.startsWith('[')) {
      clean = '.' + clean;
    }

    while ((match = tokenRegex.exec(clean)) !== null) {
      tokens.push(match[0]);
    }

    if (tokens.length === 0 && clean.length > 0) {
      tokens.push(clean);
    }

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextNodes: JsonPathMatch[] = [];

      // Case 1: Recursive descent "..key" or "..*"
      if (token === '..' || token.startsWith('..')) {
        const subKey = token.length > 2 ? token.slice(2) : tokens[++i]?.replace(/^\./, '');

        function walk(node: any, curPath: string) {
          if (node === null || typeof node !== 'object') return;

          if (Array.isArray(node)) {
            for (let idx = 0; idx < node.length; idx++) {
              const itemPath = `${curPath}[${idx}]`;
              if (subKey === '*' || subKey === undefined) {
                nextNodes.push({ path: itemPath, value: node[idx] });
              }
              walk(node[idx], itemPath);
            }
          } else {
            for (const k of Object.keys(node)) {
              const itemPath = `${curPath}.${k}`;
              if (subKey === '*' || k === subKey) {
                nextNodes.push({ path: itemPath, value: node[k] });
              }
              walk(node[k], itemPath);
            }
          }
        }

        for (const curr of currentNodes) {
          walk(curr.value, curr.path);
        }
      }
      // Case 2: Bracket expression "[...]"
      else if (token.startsWith('[')) {
        const expr = token.slice(1, -1).trim();

        for (const curr of currentNodes) {
          const val = curr.value;
          if (val === null || typeof val !== 'object') continue;

          // Wildcard [*]
          if (expr === '*') {
            if (Array.isArray(val)) {
              val.forEach((item, idx) => nextNodes.push({ path: `${curr.path}[${idx}]`, value: item }));
            } else {
              Object.entries(val).forEach(([k, v]) => nextNodes.push({ path: `${curr.path}.${k}`, value: v }));
            }
          }
          // Filter expression [?(@.foo < 10)]
          else if (expr.startsWith('?(') && expr.endsWith(')')) {
            const cond = expr.slice(2, -1).trim();
            if (Array.isArray(val)) {
              val.forEach((item, idx) => {
                if (testFilterCondition(item, cond)) {
                  nextNodes.push({ path: `${curr.path}[${idx}]`, value: item });
                }
              });
            } else if (typeof val === 'object') {
              if (testFilterCondition(val, cond)) {
                nextNodes.push(curr);
              }
            }
          }
          // Slice [start:end]
          else if (expr.includes(':')) {
            if (Array.isArray(val)) {
              const parts = expr.split(':').map((s) => s.trim());
              let start = parts[0] ? parseInt(parts[0], 10) : 0;
              let end = parts[1] ? parseInt(parts[1], 10) : val.length;
              if (start < 0) start = Math.max(0, val.length + start);
              if (end < 0) end = Math.max(0, val.length + end);

              for (let idx = start; idx < Math.min(end, val.length); idx++) {
                nextNodes.push({ path: `${curr.path}[${idx}]`, value: val[idx] });
              }
            }
          }
          // Union / Multiple indices or keys: [0, 1] or ['a', 'b']
          else if (expr.includes(',')) {
            const parts = expr.split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, ''));
            for (const p of parts) {
              if (Array.isArray(val) && /^\d+$/.test(p)) {
                const idx = parseInt(p, 10);
                if (idx in val) nextNodes.push({ path: `${curr.path}[${idx}]`, value: val[idx] });
              } else if (p in val) {
                nextNodes.push({ path: `${curr.path}.${p}`, value: val[p] });
              }
            }
          }
          // Single index or property: [0] or ['foo']
          else {
            const cleanProp = expr.replace(/^['"]|['"]$/g, '');
            if (Array.isArray(val) && /^-?\d+$/.test(cleanProp)) {
              let idx = parseInt(cleanProp, 10);
              if (idx < 0) idx = val.length + idx;
              if (idx >= 0 && idx < val.length) {
                nextNodes.push({ path: `${curr.path}[${idx}]`, value: val[idx] });
              }
            } else if (cleanProp in val) {
              nextNodes.push({ path: `${curr.path}.${cleanProp}`, value: val[cleanProp] });
            }
          }
        }
      }
      // Case 3: Dot property ".key" or ".*"
      else {
        const prop = token.replace(/^\./, '');
        for (const curr of currentNodes) {
          const val = curr.value;
          if (val === null || typeof val !== 'object') continue;

          if (prop === '*') {
            if (Array.isArray(val)) {
              val.forEach((item, idx) => nextNodes.push({ path: `${curr.path}[${idx}]`, value: item }));
            } else {
              Object.entries(val).forEach(([k, v]) => nextNodes.push({ path: `${curr.path}.${k}`, value: v }));
            }
          } else if (prop in val) {
            nextNodes.push({ path: `${curr.path}.${prop}`, value: val[prop] });
          }
        }
      }

      currentNodes = nextNodes;
      if (currentNodes.length === 0) break;
    }

    const duration = Number((performance.now() - startTime).toFixed(2));
    return { matches: currentNodes, error: null, durationMs: duration };
  } catch (err: any) {
    return {
      matches: [],
      error: `JSONPath evaluation error: ${err?.message || 'Invalid expression'}`,
      durationMs: Number((performance.now() - startTime).toFixed(2))
    };
  }
}

// Simple filter condition evaluator: e.g. @.price < 10, @.isbn, @.category == 'fiction'
function testFilterCondition(item: any, condition: string): boolean {
  if (item === null || typeof item !== 'object') return false;

  const cond = condition.trim();
  // Existence check: @.prop
  if (/^@\.([a-zA-Z0-9_$]+)$/.test(cond)) {
    const prop = cond.slice(2);
    return item[prop] !== undefined;
  }

  // Comparison operators: ==, !=, <=, >=, <, >
  const compRegex = /^@\.([a-zA-Z0-9_$]+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/;
  const match = cond.match(compRegex);
  if (!match) return false;

  const [, prop, op, rawVal] = match;
  const left = item[prop];
  let right: any = rawVal.trim();

  // Parse right value
  if (/^['"].*['"]$/.test(right)) {
    right = right.slice(1, -1);
  } else if (!isNaN(Number(right))) {
    right = Number(right);
  } else if (right === 'true') {
    right = true;
  } else if (right === 'false') {
    right = false;
  } else if (right === 'null') {
    right = null;
  }

  switch (op) {
    case '==':
      return left === right;
    case '!=':
      return left !== right;
    case '<':
      return left < right;
    case '<=':
      return left <= right;
    case '>':
      return left > right;
    case '>=':
      return left >= right;
    default:
      return false;
  }
}

export const JsonPathPanel: React.FC<JsonPathPanelProps> = ({ initialValue, initialQuery }) => {
  const [jsonInput, setJsonInput] = useState<string>(
    initialValue || JSON.stringify(BOOKSTORE_SAMPLE, null, 2)
  );
  const [query, setQuery] = useState<string>(initialQuery || '$.store.book[*].author');
  const [viewMode, setViewMode] = useState<'raw' | 'table'>('raw');
  const [indentSize, setIndentSize] = useState<2 | 4 | 'min'>(2);
  const [history, setHistory] = useState<string[]>([
    '$.store.book[*].author',
    '$..price',
    '$.store.book[?(@.price < 10)]'
  ]);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse JSON Document
  const parsedDoc = useMemo(() => {
    if (!jsonInput.trim()) return { val: null, error: 'Document is empty' };
    try {
      return { val: JSON.parse(jsonInput), error: null };
    } catch (e: any) {
      return { val: null, error: e?.message || 'Invalid JSON syntax' };
    }
  }, [jsonInput]);

  // Execute JSONPath Query
  const evalResult = useMemo(() => {
    if (parsedDoc.error || parsedDoc.val === null) {
      return { matches: [], error: parsedDoc.error, durationMs: 0 };
    }
    return evaluateJsonPathEngine(parsedDoc.val, query);
  }, [parsedDoc, query]);

  // Formatted output text
  const formattedOutput = useMemo(() => {
    if (evalResult.error) return '';
    if (evalResult.matches.length === 0) return 'No matching nodes found for this expression.';

    const rawValues =
      evalResult.matches.length === 1 && query !== '$' && !query.includes('*') && !query.includes('?') && !query.includes(':')
        ? evalResult.matches[0].value
        : evalResult.matches.map((m) => m.value);

    if (indentSize === 'min') {
      return JSON.stringify(rawValues);
    }
    return JSON.stringify(rawValues, null, indentSize);
  }, [evalResult, query, indentSize]);

  // Load sample preset
  const handleLoadSample = (sample: 'bookstore' | 'k8s') => {
    if (sample === 'bookstore') {
      setJsonInput(JSON.stringify(BOOKSTORE_SAMPLE, null, 2));
      setQuery('$.store.book[*].author');
    } else {
      setJsonInput(JSON.stringify(K8S_SAMPLE, null, 2));
      setQuery('$.spec.template.spec.containers[*].name');
    }
  };

  // Run query & add to history
  const handleApplyQuery = (q: string) => {
    setQuery(q);
    if (!history.includes(q)) {
      setHistory((prev) => [q, ...prev.slice(0, 9)]);
    }
  };

  // Copy helper
  const copyToClipboard = (text: string, actionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(actionId);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  // Download matches
  const downloadResult = () => {
    const blob = new Blob([formattedOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jsonpath-extracted-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                JSONPath Evaluator & Node Extractor
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Jayway & RFC Compliant
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execute deep queries, recursive descents, slice notation, and filters on any JSON payload 100% offline.
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Datasets:</span>
            <button
              onClick={() => handleLoadSample('bookstore')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Bookstore
            </button>
            <button
              onClick={() => handleLoadSample('k8s')}
              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            >
              Kubernetes Spec
            </button>
          </div>
        </div>

        {/* Live Expression Input Bar */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>JSONPath Expression</span>
            <span className="text-[11px] font-normal text-slate-400">
              Evaluated in {evalResult.durationMs}ms
            </span>
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-sky-500">
                λ
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleApplyQuery(query);
                }}
                placeholder="e.g. $.store.book[*].author or $..price"
                className="w-full pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500/50 shadow-inner"
              />
            </div>
            <button
              onClick={() => handleApplyQuery(query)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Evaluate
            </button>
          </div>

          {/* Quick Cheat Sheet Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[11px] font-medium text-slate-400 mr-1 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Quick:
            </span>
            {CHEAT_SHEET.map((cs) => (
              <button
                key={cs.label}
                onClick={() => handleApplyQuery(cs.query)}
                title={cs.desc}
                className={`px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                  query === cs.query
                    ? 'bg-sky-100 text-sky-800 font-bold dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                {cs.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: SOURCE JSON */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Source Document
              </label>
              {parsedDoc.error ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Invalid JSON
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Ready ({new Blob([jsonInput]).size} B)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = (ev) => setJsonInput((ev.target?.result as string) || '');
                    r.readAsText(f);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload JSON Document"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => copyToClipboard(jsonInput, 'src')}
                title="Copy Source JSON"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copiedAction === 'src' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setJsonInput('')}
                title="Clear Document"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={16}
            placeholder="Paste JSON document here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-y"
          />

          {parsedDoc.error && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parsedDoc.error}
              </span>
              <button
                onClick={() => {
                  try {
                    const { repaired } = autoRepairJson(jsonInput);
                    setJsonInput(repaired);
                  } catch {}
                }}
                className="px-2 py-0.5 rounded-lg bg-rose-200 dark:bg-rose-900 font-semibold text-[11px] hover:bg-rose-300 shrink-0"
              >
                ⚡ Repair
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANE: MATCHED RESULTS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Extracted Matches
              </label>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                {evalResult.matches.length} {evalResult.matches.length === 1 ? 'result' : 'results'}
              </span>
            </div>

            {/* View Mode & Indent Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition-colors ${
                    viewMode === 'raw'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Code className="w-3 h-3" />
                  JSON
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-2 py-1 rounded-md flex items-center gap-1 font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Table className="w-3 h-3" />
                  Nodes
                </button>
              </div>

              {viewMode === 'raw' && (
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-medium">
                  {([2, 4, 'min'] as const).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setIndentSize(sz)}
                      className={`px-1.5 py-0.5 rounded capitalize ${
                        indentSize === sz
                          ? 'bg-white dark:bg-slate-900 text-sky-600 font-bold shadow-xs'
                          : 'text-slate-500'
                      }`}
                    >
                      {sz === 'min' ? 'Min' : `${sz}s`}
                    </button>
                  ))}
                </div>
              )}

              <button
                onClick={() => copyToClipboard(formattedOutput, 'out')}
                title="Copy Result"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copiedAction === 'out' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={downloadResult}
                disabled={evalResult.matches.length === 0}
                title="Download Result (.json)"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {evalResult.error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {evalResult.error}
            </div>
          )}

          {/* VIEW: RAW JSON */}
          {viewMode === 'raw' && (
            <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-all">
              {formattedOutput || '// No results to display'}
            </pre>
          )}

          {/* VIEW: TABLE OF MATCHES */}
          {viewMode === 'table' && (
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-[460px] overflow-y-auto">
              {evalResult.matches.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No matching nodes found for this expression.
                </div>
              ) : (
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] uppercase tracking-wider font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Path</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Value</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {evalResult.matches.map((m, idx) => {
                      const type =
                        m.value === null
                          ? 'null'
                          : Array.isArray(m.value)
                          ? 'array'
                          : typeof m.value;
                      return (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-2 px-3 text-slate-400 text-[10px]">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-sky-600 dark:text-sky-400 truncate max-w-[140px]">
                            {m.path}
                          </td>
                          <td className="py-2 px-3">
                            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              {type}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                            {JSON.stringify(m.value)}
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => copyToClipboard(JSON.stringify(m.value), `row-${idx}`)}
                              className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[11px] font-sans"
                            >
                              {copiedAction === `row-${idx}` ? 'Copied' : 'Copy'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
