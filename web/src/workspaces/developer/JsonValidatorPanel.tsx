import React, { useState, useMemo, useRef } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wrench,
  Copy,
  Check,
  Upload,
  Trash2,
  Sparkles,
  ShieldAlert,
  FileCheck,
  Code,
  Layers,
  ArrowRight
} from 'lucide-react';
import { autoRepairJson } from './JsonFormatterPanel';

interface JsonValidatorPanelProps {
  initialValue?: string;
}

// Sample presets for validation testing
const VALIDATOR_PRESETS: Record<string, { label: string; json: string; schema?: string }> = {
  'Valid Clean': {
    label: 'Valid Clean Payload',
    json: JSON.stringify(
      {
        server: "us-east-1",
        uptimeSeconds: 84920,
        healthy: true,
        cluster: {
          nodes: ["node-01", "node-02", "node-03"],
          maxReplicas: 5,
          autoscaling: true
        },
        telemetry: {
          cpuUtilization: 34.2,
          memoryMb: 1024,
          lastIncident: null
        }
      },
      null,
      2
    )
  },
  'Syntax Error (Trailing Comma)': {
    label: 'Trailing Comma & Quotes Error',
    json: `{\n  "service": 'Toolstrum',\n  "version": 1.0,\n  "enabled": true,\n  "ports": [\n    80,\n    443,\n  ],\n}`
  },
  'Duplicate Keys': {
    label: 'Duplicate Keys Warning',
    json: `{\n  "id": "1001",\n  "status": "pending",\n  "amount": 250,\n  "status": "completed"\n}`
  },
  'Schema Validation Test': {
    label: 'Schema Validation Demo',
    json: JSON.stringify(
      {
        userId: "usr_5541",
        name: "Devon Clark",
        age: 28,
        email: "devon@toolstrum.local",
        roles: ["developer", "admin"]
      },
      null,
      2
    ),
    schema: JSON.stringify(
      {
        type: "object",
        required: ["userId", "name", "email", "age", "roles"],
        properties: {
          userId: { type: "string" },
          name: { type: "string", minLength: 2 },
          age: { type: "number", minimum: 18, maximum: 120 },
          email: { type: "string" },
          roles: {
            type: "array",
            items: { type: "string" }
          }
        }
      },
      null,
      2
    )
  }
};

// Check for duplicate keys in raw JSON text without discarding
function findDuplicateKeys(jsonText: string): string[] {
  const duplicates: string[] = [];
  const keyRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/g;
  const seenKeysByDepth: Record<number, Set<string>> = {};
  let depth = 0;

  // Simple token scan
  const lines = jsonText.split('\n');
  lines.forEach((line) => {
    for (const char of line) {
      if (char === '{') depth++;
      else if (char === '}') {
        seenKeysByDepth[depth]?.clear();
        depth = Math.max(0, depth - 1);
      }
    }

    let match;
    while ((match = keyRegex.exec(line)) !== null) {
      const key = match[1];
      if (!seenKeysByDepth[depth]) {
        seenKeysByDepth[depth] = new Set();
      }
      if (seenKeysByDepth[depth].has(key)) {
        duplicates.push(key);
      } else {
        seenKeysByDepth[depth].add(key);
      }
    }
  });

  return Array.from(new Set(duplicates));
}

// Check prototype pollution risks
function checkSecurityRisks(jsonText: string): string[] {
  const risks: string[] = [];
  if (jsonText.includes('"__proto__"')) {
    risks.push('Detected "__proto__" key — potential Prototype Pollution risk if processed unsafely.');
  }
  if (jsonText.includes('"constructor"')) {
    risks.push('Detected "constructor" key — check usage in target environment.');
  }
  return risks;
}

// Lightweight offline JSON Schema validator
interface SchemaViolation {
  path: string;
  message: string;
}

function validateAgainstSchema(data: any, schema: any, path = '$'): SchemaViolation[] {
  const violations: SchemaViolation[] = [];

  if (!schema || typeof schema !== 'object') return violations;

  // Type check
  if (schema.type) {
    const actualType = Array.isArray(data) ? 'array' : data === null ? 'null' : typeof data;
    if (actualType !== schema.type) {
      violations.push({
        path,
        message: `Expected type "${schema.type}", but received "${actualType}"`
      });
      return violations;
    }
  }

  // Number bounds
  if (typeof data === 'number') {
    if (schema.minimum !== undefined && data < schema.minimum) {
      violations.push({ path, message: `Value ${data} is less than minimum ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      violations.push({ path, message: `Value ${data} exceeds maximum ${schema.maximum}` });
    }
  }

  // String bounds
  if (typeof data === 'string') {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      violations.push({ path, message: `String length ${data.length} is less than minLength ${schema.minLength}` });
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      violations.push({ path, message: `String length ${data.length} exceeds maxLength ${schema.maxLength}` });
    }
  }

  // Object checks
  if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
    if (Array.isArray(schema.required)) {
      for (const reqKey of schema.required) {
        if (!(reqKey in data)) {
          violations.push({ path: `${path}.${reqKey}`, message: `Missing required property "${reqKey}"` });
        }
      }
    }
    if (schema.properties) {
      for (const [propKey, propSchema] of Object.entries(schema.properties)) {
        if (propKey in data) {
          violations.push(...validateAgainstSchema(data[propKey], propSchema, `${path}.${propKey}`));
        }
      }
    }
  }

  // Array checks
  if (Array.isArray(data) && schema.items) {
    data.forEach((item, idx) => {
      violations.push(...validateAgainstSchema(item, schema.items, `${path}[${idx}]`));
    });
  }

  return violations;
}

export const JsonValidatorPanel: React.FC<JsonValidatorPanelProps> = ({ initialValue }) => {
  const [input, setInput] = useState<string>(initialValue || VALIDATOR_PRESETS['Valid Clean'].json);
  const [schemaMode, setSchemaMode] = useState<boolean>(false);
  const [schemaInput, setSchemaInput] = useState<string>(VALIDATOR_PRESETS['Schema Validation Test'].schema || '');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse & Lint Input
  const lintResult = useMemo(() => {
    if (!input.trim()) {
      return {
        isValid: false,
        error: 'JSON input is empty',
        line: 1,
        column: 1,
        errorContext: '',
        duplicates: [],
        securityRisks: [],
        stats: null,
        parsedValue: null
      };
    }

    // 1. Strict Parse Test
    let parsedValue = null;
    let syntaxError = null;
    let errorLine = 1;
    let errorCol = 1;
    let errorContext = '';

    try {
      parsedValue = JSON.parse(input);
    } catch (err: any) {
      syntaxError = err.message || 'Syntax error';
      // Extract position if available
      const posMatch = syntaxError.match(/position (\d+)/i);
      if (posMatch) {
        const pos = parseInt(posMatch[1], 10);
        const prefix = input.slice(0, pos);
        const lines = prefix.split('\n');
        errorLine = lines.length;
        errorCol = lines[lines.length - 1].length + 1;

        // Context snippet
        const allLines = input.split('\n');
        const start = Math.max(0, errorLine - 2);
        const end = Math.min(allLines.length, errorLine + 1);
        errorContext = allLines
          .slice(start, end)
          .map((l, idx) => {
            const lineNum = start + idx + 1;
            const marker = lineNum === errorLine ? '❌ ' : '   ';
            return `${marker}${lineNum.toString().padStart(3, ' ')} | ${l}`;
          })
          .join('\n');
      }
    }

    // 2. Duplicate Keys Audit
    const duplicates = findDuplicateKeys(input);

    // 3. Security Audit
    const securityRisks = checkSecurityRisks(input);

    // 4. Type Breakdown Stats
    let stats: Record<string, number> | null = null;
    if (parsedValue !== null) {
      let strings = 0;
      let numbers = 0;
      let booleans = 0;
      let nulls = 0;
      let arrays = 0;
      let objects = 0;

      function analyze(node: any) {
        if (node === null) nulls++;
        else if (Array.isArray(node)) {
          arrays++;
          node.forEach(analyze);
        } else if (typeof node === 'object') {
          objects++;
          Object.values(node).forEach(analyze);
        } else if (typeof node === 'string') strings++;
        else if (typeof node === 'number') numbers++;
        else if (typeof node === 'boolean') booleans++;
      }

      analyze(parsedValue);
      stats = { strings, numbers, booleans, nulls, arrays, objects };
    }

    // 5. Test if auto-repair can fix syntax error
    let repairable = false;
    let repairOutput = '';
    let repairIssues: string[] = [];

    if (syntaxError) {
      try {
        const res = autoRepairJson(input);
        JSON.parse(res.repaired);
        repairable = true;
        repairOutput = res.repaired;
        repairIssues = res.fixedIssues;
      } catch {
        repairable = false;
      }
    }

    return {
      isValid: !syntaxError,
      error: syntaxError,
      line: errorLine,
      column: errorCol,
      errorContext,
      duplicates,
      securityRisks,
      stats,
      parsedValue,
      repairable,
      repairOutput,
      repairIssues
    };
  }, [input]);

  // Schema Validation Results
  const schemaValidation = useMemo(() => {
    if (!schemaMode || !schemaInput.trim() || !lintResult.parsedValue) {
      return { schemaError: null, violations: [] };
    }

    try {
      const parsedSchema = JSON.parse(schemaInput);
      const violations = validateAgainstSchema(lintResult.parsedValue, parsedSchema);
      return { schemaError: null, violations };
    } catch (err: any) {
      return { schemaError: `Invalid Schema: ${err.message}`, violations: [] };
    }
  }, [schemaMode, schemaInput, lintResult.parsedValue]);

  const handleApplyRepair = () => {
    if (lintResult.repairOutput) {
      setInput(lintResult.repairOutput);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="space-y-6">
      {/* Top Presets & Modes */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Test Samples */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Test Cases:
          </span>
          {Object.entries(VALIDATOR_PRESETS).map(([key, item]) => (
            <button
              key={key}
              onClick={() => {
                setInput(item.json);
                if (item.schema) {
                  setSchemaInput(item.schema);
                  setSchemaMode(true);
                }
              }}
              className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/60 dark:hover:text-indigo-400 transition-colors"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Schema Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSchemaMode(!schemaMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              schemaMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Schema Linter Mode</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Input Panel */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-500" />
                <span>JSON Payload to Validate</span>
              </label>
              <div className="flex items-center gap-2">
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
                <button
                  onClick={() => setInput('')}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950/60 text-slate-600 dark:text-slate-300 hover:text-rose-600 transition-colors"
                  title="Clear input"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={schemaMode ? 10 : 16}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50 resize-y"
              placeholder="Paste JSON here for comprehensive syntax and RFC 8259 compliance validation..."
              spellCheck={false}
            />
          </div>

          {/* Optional JSON Schema Drawer */}
          {schemaMode && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-indigo-500/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>JSON Schema (Draft-07)</span>
                </label>
                <button
                  onClick={() => {
                    if (lintResult.parsedValue) {
                      const inferred = {
                        type: Array.isArray(lintResult.parsedValue) ? 'array' : 'object',
                        properties: typeof lintResult.parsedValue === 'object' && !Array.isArray(lintResult.parsedValue)
                          ? Object.keys(lintResult.parsedValue).reduce((acc: any, k) => {
                              acc[k] = { type: typeof lintResult.parsedValue[k] };
                              return acc;
                            }, {})
                          : {}
                      };
                      setSchemaInput(JSON.stringify(inferred, null, 2));
                    }
                  }}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  Auto-Infer Schema from Payload
                </button>
              </div>
              <textarea
                value={schemaInput}
                onChange={(e) => setSchemaInput(e.target.value)}
                rows={8}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
                placeholder='Paste JSON schema: { "type": "object", "required": ["id"], ... }'
                spellCheck={false}
              />
            </div>
          )}
        </div>

        {/* Right Column: Diagnostic Linter Report */}
        <div className="space-y-4">
          {/* Main Validation Status Banner */}
          <div
            className={`p-6 rounded-2xl border-2 shadow-md transition-all ${
              lintResult.isValid
                ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/40'
                : 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500/40'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {lintResult.isValid ? (
                  <CheckCircle className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-7 h-7 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <div>
                  <h3 className={`text-base font-bold ${lintResult.isValid ? 'text-emerald-900 dark:text-emerald-200' : 'text-rose-900 dark:text-rose-200'}`}>
                    {lintResult.isValid ? '100% Valid & Well-Formed JSON' : 'JSON Syntax Error Detected'}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {lintResult.isValid
                      ? 'Complies strictly with RFC 8259, ECMA-404, and JSON spec.'
                      : `Syntax check failed at Line ${lintResult.line}, Column ${lintResult.column}.`}
                  </p>
                </div>
              </div>

              {/* 1-Click Copy if valid */}
              {lintResult.isValid && (
                <button
                  onClick={() => handleCopy(JSON.stringify(lintResult.parsedValue, null, 2))}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Syntax Error Context snippet */}
            {!lintResult.isValid && (
              <div className="mt-4 space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900 text-rose-300 font-mono text-xs overflow-x-auto leading-relaxed border border-rose-900/40">
                  <div className="text-slate-400 font-bold mb-1">// Error Location: Line {lintResult.line}, Col {lintResult.column}</div>
                  <pre className="whitespace-pre">{lintResult.errorContext || lintResult.error}</pre>
                </div>

                {/* Auto Repair Trigger */}
                {lintResult.repairable && (
                  <div className="p-3.5 rounded-xl bg-amber-100/70 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                      <span className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Auto-Repair Available ({lintResult.repairIssues?.join(', ')})
                      </span>
                    </div>
                    <button
                      onClick={handleApplyRepair}
                      className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Fix Automatically</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Linter Warnings: Duplicate Keys */}
          {lintResult.duplicates.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Duplicate Keys Warning</span>
              </div>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                The following key(s) appear multiple times in the same object scope: <strong>{lintResult.duplicates.map(k => `"${k}"`).join(', ')}</strong>. Standard JSON decoders will silently overwrite earlier occurrences.
              </p>
            </div>
          )}

          {/* Security & Prototype Pollution Warnings */}
          {lintResult.securityRisks.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-800 dark:text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <span>Security Inspection Warning</span>
              </div>
              {lintResult.securityRisks.map((risk, idx) => (
                <p key={idx} className="text-[11px] text-rose-700 dark:text-rose-300">• {risk}</p>
              ))}
            </div>
          )}

          {/* Schema Validation Linter Output */}
          {schemaMode && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>Schema Compliance Report</span>
              </h4>

              {schemaValidation.schemaError ? (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-300 font-mono">
                  {schemaValidation.schemaError}
                </div>
              ) : schemaValidation.violations.length === 0 ? (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Payload matches 100% of the defined schema rules!</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-rose-600">
                    Found {schemaValidation.violations.length} schema violation(s):
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {schemaValidation.violations.map((v, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs font-mono text-rose-800 dark:text-rose-300 flex items-start gap-2">
                        <span className="font-bold text-rose-600">{v.path}</span>
                        <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-rose-400" />
                        <span>{v.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Structural Primitive Breakdown */}
          {lintResult.stats && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500" />
                <span>Structural Node Breakdown</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Strings</span>
                  <p className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">{lintResult.stats.strings}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Numbers</span>
                  <p className="text-base font-mono font-bold text-amber-600 dark:text-amber-400">{lintResult.stats.numbers}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Booleans</span>
                  <p className="text-base font-mono font-bold text-purple-600 dark:text-purple-400">{lintResult.stats.booleans}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Objects</span>
                  <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400">{lintResult.stats.objects}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Arrays</span>
                  <p className="text-base font-mono font-bold text-sky-600 dark:text-sky-400">{lintResult.stats.arrays}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Nulls</span>
                  <p className="text-base font-mono font-bold text-rose-500">{lintResult.stats.nulls}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
