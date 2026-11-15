import React, { useState, useMemo, useRef } from 'react';
import {
  ArrowRightLeft,
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
  FileCode,
  Zap,
  Table
} from 'lucide-react';
import { yamlToJsonObject, jsonToYaml } from './devHelpers';
import { autoRepairYaml } from './YamlFormatterPanel';
import { autoRepairJson } from './JsonFormatterPanel';

interface YamlJsonConverterPanelProps {
  initialDirection?: 'yaml-to-json' | 'json-to-yaml';
  initialValue?: string;
}

const CONVERTER_PRESETS: Record<string, { label: string; yaml: string; json: string }> = {
  'Microservice Deployment': {
    label: 'Microservice Spec',
    yaml: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: toolstrum-auth
  labels:
    tier: identity
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: auth-engine
        image: toolstrum/auth:v2.1
        ports:
        - containerPort: 9000
        env:
        - name: TOKEN_EXPIRY_SEC
          value: "3600"`,
    json: JSON.stringify(
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          name: "toolstrum-auth",
          labels: { tier: "identity" }
        },
        spec: {
          replicas: 3,
          template: {
            spec: {
              containers: [
                {
                  name: "auth-engine",
                  image: "toolstrum/auth:v2.1",
                  ports: [{ containerPort: 9000 }],
                  env: [{ name: "TOKEN_EXPIRY_SEC", value: "3600" }]
                }
              ]
            }
          }
        }
      },
      null,
      2
    )
  },
  'Docker Compose': {
    label: 'Docker Compose',
    yaml: `version: "3.8"
services:
  gateway:
    image: nginx:alpine
    ports:
      - "80:80"
  worker:
    image: toolstrum/worker:latest
    environment:
      WASM_THREADS: "4"`,
    json: JSON.stringify(
      {
        version: "3.8",
        services: {
          gateway: {
            image: "nginx:alpine",
            ports: ["80:80"]
          },
          worker: {
            image: "toolstrum/worker:latest",
            environment: { WASM_THREADS: "4" }
          }
        }
      },
      null,
      2
    )
  }
};

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

export const YamlJsonConverterPanel: React.FC<YamlJsonConverterPanelProps> = ({
  initialDirection = 'yaml-to-json',
  initialValue
}) => {
  const [direction, setDirection] = useState<'yaml-to-json' | 'json-to-yaml'>(initialDirection);
  const [input, setInput] = useState<string>(
    initialValue || (initialDirection === 'yaml-to-json'
      ? CONVERTER_PRESETS['Microservice Deployment'].yaml
      : CONVERTER_PRESETS['Microservice Deployment'].json)
  );
  const [jsonIndent, setJsonIndent] = useState<2 | 4 | 'min'>(2);
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if repair is possible
  const repairable = useMemo(() => {
    if (!input.trim()) return false;
    if (direction === 'yaml-to-json') {
      return input.includes('\t') || /^(\s*[\w.-]+):([^\s\n/])/gm.test(input);
    } else {
      try {
        JSON.parse(input);
        return false;
      } catch {
        return true;
      }
    }
  }, [input, direction]);

  // Conversion logic
  const conversionResult = useMemo(() => {
    if (!input.trim()) {
      return { output: '', error: null, inBytes: 0, outBytes: 0, deltaPct: 0 };
    }

    const inBytes = new Blob([input]).size;

    if (direction === 'yaml-to-json') {
      // Check for forbidden tabs
      const lines = input.split('\n');
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('\t')) {
          return {
            output: '',
            error: `Tabs are forbidden in YAML (line ${i + 1}). Use spaces.`,
            inBytes,
            outBytes: 0,
            deltaPct: 0
          };
        }
      }

      const parsed = yamlToJsonObject(input);
      if (parsed.error || !parsed.data) {
        return {
          output: '',
          error: parsed.error || 'Invalid YAML format.',
          inBytes,
          outBytes: 0,
          deltaPct: 0
        };
      }

      const targetData = sortKeys ? deepSortKeys(parsed.data) : parsed.data;
      const formatted =
        jsonIndent === 'min'
          ? JSON.stringify(targetData)
          : JSON.stringify(targetData, null, jsonIndent);

      const outBytes = new Blob([formatted]).size;
      const deltaPct = inBytes > 0 ? Math.round(((outBytes - inBytes) / inBytes) * 100) : 0;

      return {
        output: formatted,
        error: null,
        inBytes,
        outBytes,
        deltaPct
      };
    } else {
      // JSON to YAML
      try {
        let obj = JSON.parse(input);
        if (sortKeys) obj = deepSortKeys(obj);
        const yamlStr = jsonToYaml(obj, 0);
        const outBytes = new Blob([yamlStr]).size;
        const deltaPct = inBytes > 0 ? Math.round(((outBytes - inBytes) / inBytes) * 100) : 0;

        return {
          output: yamlStr,
          error: null,
          inBytes,
          outBytes,
          deltaPct
        };
      } catch (err: any) {
        return {
          output: '',
          error: err?.message || 'Invalid JSON syntax.',
          inBytes,
          outBytes: 0,
          deltaPct: 0
        };
      }
    }
  }, [input, direction, jsonIndent, sortKeys]);

  // Swap Direction
  const handleSwapDirection = () => {
    const nextDir = direction === 'yaml-to-json' ? 'json-to-yaml' : 'yaml-to-json';
    setDirection(nextDir);
    if (conversionResult.output && !conversionResult.error) {
      setInput(conversionResult.output);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(conversionResult.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const isOutJson = direction === 'yaml-to-json';
    const ext = isOutJson ? '.json' : '.yaml';
    const mime = isOutJson ? 'application/json' : 'text/yaml';
    const blob = new Blob([conversionResult.output], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted-${Date.now()}${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPreset = (key: string) => {
    const p = CONVERTER_PRESETS[key];
    if (p) {
      setInput(direction === 'yaml-to-json' ? p.yaml : p.json);
    }
  };

  const handleRepair = () => {
    if (direction === 'yaml-to-json') {
      const { repaired } = autoRepairYaml(input);
      setInput(repaired);
    } else {
      try {
        const { repaired } = autoRepairJson(input);
        setInput(repaired);
      } catch {}
    }
  };

  const isYamlToJson = direction === 'yaml-to-json';

  return (
    <div className="space-y-6">
      {/* Top Header & Presets Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isYamlToJson ? 'YAML to JSON Converter' : 'JSON to YAML Converter'}
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Bidirectional Lossless
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seamlessly convert between YAML specifications and JSON documents 100% offline in your browser.
              </p>
            </div>
          </div>

          {/* Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            {Object.keys(CONVERTER_PRESETS).map((k) => (
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

        {/* Global Controls & Mode Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {/* Direction Toggle */}
            <button
              onClick={handleSwapDirection}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Swap Direction ({isYamlToJson ? 'YAML → JSON' : 'JSON → YAML'})
            </button>

            {/* Indent / formatting options */}
            {isYamlToJson && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-medium">
                {([2, 4, 'min'] as const).map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setJsonIndent(sz)}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      jsonIndent === sz
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 font-bold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {sz === 'min' ? 'Minify' : `${sz}s`}
                  </button>
                ))}
              </div>
            )}

            {/* Key sorting */}
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

            {/* Auto-repair */}
            {repairable && (
              <button
                onClick={handleRepair}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                ⚡ Auto-Repair
              </button>
            )}
          </div>

          {/* Size Telemetry */}
          {conversionResult.output && (
            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
              <span>Input: {conversionResult.inBytes} B</span>
              <span>Output: {conversionResult.outBytes} B</span>
              <span className={conversionResult.deltaPct < 0 ? 'text-emerald-500 font-bold' : 'text-slate-500'}>
                ({conversionResult.deltaPct > 0 ? `+${conversionResult.deltaPct}%` : `${conversionResult.deltaPct}%`})
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: SOURCE INPUT */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isYamlToJson ? 'YAML Source Document' : 'JSON Source Document'}
              </label>
              {conversionResult.error ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Syntax Error
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Valid ({conversionResult.inBytes} B)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <input
                type="file"
                ref={fileInputRef}
                accept={isYamlToJson ? '.yaml,.yml,text/yaml' : '.json,application/json'}
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
                title="Upload Document"
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
            placeholder={isYamlToJson ? 'Paste YAML document here...' : 'Paste JSON document here...'}
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-y"
          />

          {conversionResult.error && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {conversionResult.error}
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

        {/* RIGHT PANE: CONVERTED OUTPUT */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {isYamlToJson ? 'Converted JSON Output' : 'Converted YAML Output'}
              </label>
              {conversionResult.output && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Success
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!conversionResult.output}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!conversionResult.output}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-40 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download {isYamlToJson ? '.json' : '.yaml'}
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-all">
            {conversionResult.output || '// Converted document will render here'}
          </pre>
        </div>
      </div>
    </div>
  );
};
