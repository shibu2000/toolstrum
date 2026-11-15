import React, { useState, useMemo, useRef } from 'react';
import {
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Code2,
  Terminal,
  Zap,
  Info
} from 'lucide-react';
import { yamlToJsonObject } from './devHelpers';
import { autoRepairYaml } from './YamlFormatterPanel';

interface YamlValidatorPanelProps {
  initialValue?: string;
}

export interface YamlLintIssue {
  type: 'error' | 'warning' | 'security';
  message: string;
  line: number;
  column?: number;
  snippet?: string;
  fixable?: boolean;
}

const VALIDATOR_PRESETS: Record<string, { label: string; yaml: string }> = {
  'Valid Clean': {
    label: 'Valid Clean Spec',
    yaml: `apiVersion: v1
kind: Service
metadata:
  name: toolstrum-service
  labels:
    app: toolstrum
spec:
  type: ClusterIP
  ports:
  - port: 443
    targetPort: 8443
    protocol: TCP
    name: https
  selector:
    app: toolstrum`
  },
  'Forbidden Tabs': {
    label: 'Forbidden Tab Error',
    yaml: `server:\n\thost: 127.0.0.1\n\tport: 8080\n\tenabled: true`
  },
  'Missing Colon Space': {
    label: 'Missing Colon Space',
    yaml: `database:\n  engine:postgres\n  host:localhost\n  port:5432`
  },
  'Duplicate Keys': {
    label: 'Duplicate Keys Warning',
    yaml: `service:\n  name: toolstrum-api\n  port: 8080\n  env: staging\n  port: 9090`
  },
  'Security Risk (Tags)': {
    label: 'Dangerous YAML Tag',
    yaml: `payload: !!python/object/apply:os.system ["whoami"]\ncache:\n  enabled: true`
  }
};

// Deep YAML Linter Engine
function lintYaml(raw: string): {
  valid: boolean;
  issues: YamlLintIssue[];
  metrics: { lines: number; keys: number; depth: number };
} {
  const issues: YamlLintIssue[] = [];
  if (!raw.trim()) {
    return {
      valid: false,
      issues: [{ type: 'error', message: 'YAML document is empty.', line: 1 }],
      metrics: { lines: 0, keys: 0, depth: 0 }
    };
  }

  const lines = raw.split('\n');
  let keyCount = 0;
  let maxDepth = 0;

  // 1. Audit Forbidden Tabs
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const tabIdx = line.indexOf('\t');
    if (tabIdx !== -1) {
      issues.push({
        type: 'error',
        message: 'Tabs are strictly forbidden for indentation in YAML. Use spaces.',
        line: i + 1,
        column: tabIdx + 1,
        snippet: line,
        fixable: true
      });
    }
  }

  // 2. Audit Missing Space after colon
  const colonRegex = /^(\s*[\w.-]+):([^\s\n/])/;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(colonRegex);
    if (m) {
      issues.push({
        type: 'error',
        message: `Missing whitespace after colon after "${m[1].trim()}".`,
        line: i + 1,
        column: line.indexOf(':') + 1,
        snippet: line,
        fixable: true
      });
    }
  }

  // 3. Security Audit: Dangerous deserialization tags
  const DANGEROUS_TAGS = [
    '!!python/',
    '!ruby/object',
    '!!js/function',
    '!!perl/',
    '!!php/',
    'tag:yaml.org,2002:python'
  ];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const tag of DANGEROUS_TAGS) {
      if (line.includes(tag)) {
        issues.push({
          type: 'security',
          message: `Dangerous remote code execution tag detected: "${tag}". Avoid parsing untrusted YAML containing explicit tags.`,
          line: i + 1,
          snippet: line
        });
      }
    }
  }

  // 4. Duplicate Keys Audit within same hierarchy level
  const seenAtLevel: Record<number, Set<string>> = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.replace(/#.*$/, '');
    if (!stripped.trim()) continue;

    const indent = line.search(/\S/);
    const colonIdx = stripped.indexOf(':');

    if (colonIdx > indent) {
      keyCount++;
      const key = stripped.slice(indent, colonIdx).trim();
      const depth = Math.floor(indent / 2);
      if (depth > maxDepth) maxDepth = depth;

      // Reset seen keys for deeper or sibling levels
      for (const d of Object.keys(seenAtLevel)) {
        if (Number(d) > indent) delete seenAtLevel[Number(d)];
      }

      if (!seenAtLevel[indent]) seenAtLevel[indent] = new Set<string>();

      if (seenAtLevel[indent].has(key)) {
        issues.push({
          type: 'warning',
          message: `Duplicate mapping key "${key}" detected at indentation level ${indent}. The latter value will silently overwrite earlier declarations.`,
          line: i + 1,
          column: indent + 1,
          snippet: line
        });
      } else {
        seenAtLevel[indent].add(key);
      }
    }
  }

  // 5. Structure parsing
  const parsed = yamlToJsonObject(raw);
  if (parsed.error && issues.filter((iss) => iss.type === 'error').length === 0) {
    issues.push({
      type: 'error',
      message: parsed.error,
      line: 1
    });
  }

  const hasFatalError = issues.some((iss) => iss.type === 'error');

  return {
    valid: !hasFatalError,
    issues,
    metrics: {
      lines: lines.length,
      keys: keyCount,
      depth: maxDepth
    }
  };
}

export const YamlValidatorPanel: React.FC<YamlValidatorPanelProps> = ({ initialValue }) => {
  const [input, setInput] = useState<string>(
    initialValue || VALIDATOR_PRESETS['Valid Clean'].yaml
  );
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lint calculation
  const report = useMemo(() => {
    return lintYaml(input);
  }, [input]);

  const errorCount = report.issues.filter((i) => i.type === 'error').length;
  const warningCount = report.issues.filter((i) => i.type === 'warning').length;
  const securityCount = report.issues.filter((i) => i.type === 'security').length;

  const handleCopy = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([input], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validated-${Date.now()}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPreset = (key: string) => {
    const p = VALIDATOR_PRESETS[key];
    if (p) setInput(p.yaml);
  };

  const handleRepair = () => {
    const { repaired } = autoRepairYaml(input);
    setInput(repaired);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                YAML Validator & Structural Linter
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Security Hardened
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Audit YAML documents for forbidden tabs, duplicate keys, hierarchy errors, and dangerous deserialization tags.
              </p>
            </div>
          </div>

          {/* Test Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            {Object.keys(VALIDATOR_PRESETS).map((k) => (
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

        {/* Status & Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Syntax</span>
            <p className={`text-base font-black mt-0.5 ${report.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {report.valid ? 'VALID' : 'INVALID'}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Errors</span>
            <p className={`text-base font-black mt-0.5 ${errorCount > 0 ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {errorCount}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Warnings</span>
            <p className={`text-base font-black mt-0.5 ${warningCount > 0 ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
              {warningCount}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Security Risks</span>
            <p className={`text-base font-black mt-0.5 ${securityCount > 0 ? 'text-rose-600 font-black animate-pulse' : 'text-emerald-600'}`}>
              {securityCount}
            </p>
          </div>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANE: INPUT YAML */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                YAML Document
              </label>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-mono">
                {report.metrics.lines} lines · {report.metrics.keys} keys
              </span>
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
                onClick={handleCopy}
                title="Copy YAML"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDownload}
                title="Download YAML"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
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
            placeholder="Paste YAML document here to audit..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-y"
          />

          {errorCount > 0 && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {report.issues.find((i) => i.type === 'error')?.message}
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

        {/* RIGHT PANE: LINT & AUDIT DIAGNOSTICS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-500" />
              Linter & Inspection Diagnostics
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {report.issues.length} {report.issues.length === 1 ? 'finding' : 'findings'}
            </span>
          </div>

          {report.issues.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                100% Valid YAML Document
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 max-w-sm mx-auto leading-relaxed">
                Zero tabs, zero duplicate keys, zero dangerous deserialization tags. Complies with strict YAML 1.2 specification.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {report.issues.map((iss, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                    iss.type === 'error'
                      ? 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                      : iss.type === 'security'
                      ? 'bg-purple-50/60 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900/60 text-purple-900 dark:text-purple-200'
                      : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      {iss.type === 'error' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      ) : iss.type === 'security' ? (
                        <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="uppercase text-[10px] tracking-wider font-black px-1.5 py-0.5 rounded bg-white/70 dark:bg-black/40">
                        {iss.type}
                      </span>
                      <span>Line {iss.line}{iss.column ? `:${iss.column}` : ''}</span>
                    </div>

                    {iss.fixable && (
                      <button
                        onClick={handleRepair}
                        className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-[11px] font-semibold hover:bg-slate-100 shadow-2xs shrink-0"
                      >
                        ⚡ Fix
                      </button>
                    )}
                  </div>

                  <p className="leading-relaxed font-sans">{iss.message}</p>

                  {iss.snippet && (
                    <div className="p-2 rounded-lg bg-black/5 dark:bg-black/40 font-mono text-[11px] overflow-x-auto text-slate-800 dark:text-slate-200">
                      <code>{iss.snippet}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Standards Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Audited Standards Checklist:
            </span>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div>✓ Tab-free indentation</div>
              <div>✓ Space after colon</div>
              <div>✓ Duplicate key check</div>
              <div>✓ Safe tag execution</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
