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
  Settings,
  AlertCircle,
  CheckCircle2,
  Sliders,
  RefreshCw,
  Code2,
  Terminal,
  Zap
} from 'lucide-react';
import { yamlToJsonObject, jsonToYaml } from './devHelpers';

interface YamlFormatterPanelProps {
  initialValue?: string;
}

const YAML_PRESETS: Record<string, { label: string; yaml: string }> = {
  'Kubernetes Deployment': {
    label: 'Kubernetes apps/v1',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: toolstrum-api
  namespace: production
  labels:
    app.kubernetes.io/name: toolstrum
    app.kubernetes.io/tier: backend
spec:
  replicas: 5
  selector:
    matchLabels:
      app.kubernetes.io/name: toolstrum
  template:
    metadata:
      labels:
        app.kubernetes.io/name: toolstrum
    spec:
      containers:
      - name: api-server
        image: toolstrum/api:v2.1.0
        ports:
        - containerPort: 8080
          name: http
        resources:
          limits:
            cpu: 1000m
            memory: 1024Mi
          requests:
            cpu: 250m
            memory: 256Mi
        env:
        - name: OFFLINE_MODE
          value: "true"
        - name: LOG_LEVEL
          value: "info"`
  },
  'Docker Compose': {
    label: 'Docker Compose v3.8',
    yaml: `version: "3.8"
services:
  web:
    image: toolstrum/web:latest
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    restart: always
  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - cache_data:/data
volumes:
  cache_data:
    driver: local`
  },
  'GitHub Actions': {
    label: 'GitHub Actions CI',
    yaml: `name: Release & Verification CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
jobs:
  build-and-test:
    runs-on: macos-latest
    steps:
    - uses: actions/checkout@v4
    - name: Setup Bun & Node
      uses: oven-sh/setup-bun@v1
      with:
        bun-version: latest
    - name: Run Test Suites
      run: |
        bun test
        npx tsc --noEmit`
  }
};

// Helper: auto-repair loose YAML (replace tabs with spaces, add space after colon)
export function autoRepairYaml(raw: string): { repaired: string; fixed: string[] } {
  const fixes: string[] = [];
  let s = raw;

  if (s.includes('\t')) {
    s = s.replace(/\t/g, '  ');
    fixes.push('Converted forbidden tabs to 2 spaces');
  }

  // Missing space after colon (e.g. key:value instead of key: value)
  const missingSpaceRegex = /^(\s*[\w.-]+):([^\s\n/])/gm;
  if (missingSpaceRegex.test(s)) {
    s = s.replace(/^(\s*[\w.-]+):([^\s\n/])/gm, '$1: $2');
    fixes.push('Added missing spaces after colons');
  }

  return { repaired: s, fixed: fixes.length > 0 ? fixes : ['Syntax normalized'] };
}

// Recursive key sorting for YAML objects
function sortYamlObject(obj: any): any {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sortYamlObject);
  return Object.keys(obj)
    .sort()
    .reduce((acc: any, key) => {
      acc[key] = sortYamlObject(obj[key]);
      return acc;
    }, {});
}

export const YamlFormatterPanel: React.FC<YamlFormatterPanelProps> = ({ initialValue }) => {
  const [input, setInput] = useState<string>(
    initialValue || YAML_PRESETS['Kubernetes Deployment'].yaml
  );
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if input has repairable issues
  const repairable = useMemo(() => {
    return input.includes('\t') || /^(\s*[\w.-]+):([^\s\n/])/gm.test(input);
  }, [input]);

  // Parse and format YAML
  const result = useMemo(() => {
    if (!input.trim()) {
      return { output: '', error: null, line: null, valid: true, rawBytes: 0, outBytes: 0 };
    }

    // Check for forbidden tabs first for clear line-level feedback
    const lines = input.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('\t')) {
        return {
          output: '',
          error: `Tabs are forbidden in YAML (line ${i + 1}). Click Auto-Repair to replace with spaces.`,
          line: i + 1,
          valid: false,
          rawBytes: new Blob([input]).size,
          outBytes: 0
        };
      }
    }

    const parsed = yamlToJsonObject(input);
    if (parsed.error || !parsed.data) {
      return {
        output: '',
        error: parsed.error || 'Invalid YAML document structure',
        line: null,
        valid: false,
        rawBytes: new Blob([input]).size,
        outBytes: 0
      };
    }

    const targetObj = sortKeys ? sortYamlObject(parsed.data) : parsed.data;
    const formatted = jsonToYaml(targetObj, 0);

    return {
      output: formatted,
      error: null,
      line: null,
      valid: true,
      rawBytes: new Blob([input]).size,
      outBytes: new Blob([formatted]).size
    };
  }, [input, indentSize, sortKeys]);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([result.output], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted-${Date.now()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPreset = (key: string) => {
    const p = YAML_PRESETS[key];
    if (p) setInput(p.yaml);
  };

  const handleRepair = () => {
    const { repaired } = autoRepairYaml(input);
    setInput(repaired);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                YAML Formatter & Beautifier
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Strict YAML 1.2
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format, normalize, sort keys, and beautify YAML documents with offline syntax validation.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Templates:</span>
            {Object.keys(YAML_PRESETS).map((k) => (
              <button
                key={k}
                onClick={() => handleLoadPreset(k)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
              >
                {k}
              </button>
            ))}
          </div>
        </div>

        {/* Global Formatting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {/* Indentation Selector */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
              {[2, 4].map((n) => (
                <button
                  key={n}
                  onClick={() => setIndentSize(n as 2 | 4)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    indentSize === n
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-bold shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {n} Spaces
                </button>
              ))}
            </div>

            {/* Key sorting toggle */}
            <button
              onClick={() => setSortKeys(!sortKeys)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                sortKeys
                  ? 'bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sort Keys: {sortKeys ? 'A-Z' : 'OFF'}
            </button>

            {/* Auto repair trigger */}
            {repairable && (
              <button
                onClick={handleRepair}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                ⚡ Auto-Repair Tabs
              </button>
            )}
          </div>

          {/* Quick Metrics */}
          {result.valid && result.output && (
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>Lines: {result.output.split('\n').length}</span>
              <span>Bytes: {result.outBytes} B</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: SOURCE YAML */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                YAML Source Document
              </label>
              {result.error ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Syntax Error
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Valid YAML ({result.rawBytes} B)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                accept=".yaml,.yml,text/yaml"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    const r = new FileReader();
                    r.onload = (ev) => setInput((ev.target?.result as string) || '');
                    r.readAsText(f);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload YAML"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(input)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setInput('')}
                title="Clear"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            placeholder="Paste YAML document here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-y"
          />

          {result.error && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {result.error}
              </span>
              <button
                onClick={handleRepair}
                className="px-2 py-0.5 rounded-lg bg-rose-200 dark:bg-rose-900 font-semibold text-[11px] hover:bg-rose-300 shrink-0"
              >
                ⚡ Auto-Repair
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANE: BEAUTIFIED YAML OUTPUT */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Beautified YAML Output
              </label>
              {result.output && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Normalized
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!result.output}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy YAML'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!result.output}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-40 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-all">
            {result.output || '// Clean YAML will render here once syntax errors are resolved'}
          </pre>
        </div>
      </div>
    </div>
  );
};
