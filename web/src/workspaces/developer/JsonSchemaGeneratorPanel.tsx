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
  ShieldCheck,
  Terminal,
  BookOpen
} from 'lucide-react';
import { autoRepairJson } from './JsonFormatterPanel';

interface JsonSchemaGeneratorPanelProps {
  initialValue?: string;
}

type SchemaDraft = 'draft-07' | 'draft-04' | '2020-12';

const SCHEMA_PRESETS: Record<string, { label: string; json: any }> = {
  'User Account': {
    label: 'User Account & Profile',
    json: {
      id: "usr_01HGBZ9",
      username: "alex_vance",
      email: "alex.vance@toolstrum.local",
      registeredAt: "2026-11-15T08:30:00Z",
      website: "https://toolstrum.local",
      isActive: true,
      age: 28,
      roles: ["editor", "developer"],
      address: {
        street: "742 Evergreen Terrace",
        city: "Springfield",
        postalCode: "97477",
        country: "USA"
      },
      preferences: {
        darkMode: true,
        notificationFrequency: 3
      }
    }
  },
  'Payment Transaction': {
    label: 'Financial Transaction',
    json: {
      transactionId: "txn_f47ac10b-58cc-4372-a567-0e02b2c3d479",
      amountCents: 4999,
      currency: "USD",
      timestamp: "2026-11-14T19:45:10Z",
      customerIp: "192.168.1.1",
      paymentMethod: {
        type: "card",
        brand: "visa",
        last4: "4242",
        expMonth: 12,
        expYear: 2028
      },
      settled: true,
      refundReason: null
    }
  },
  'Software Release': {
    label: 'Software Release Manifest',
    json: {
      packageName: "@toolstrum/suite",
      version: "2.1.0",
      description: "Privacy-first offline utility toolkit",
      homepage: "https://github.com/shibu2000/toolstrum",
      downloads: 15420,
      license: "MIT",
      tags: ["offline", "wasm", "utilities", "developer"],
      repository: {
        type: "git",
        url: "https://github.com/shibu2000/toolstrum.git"
      }
    }
  }
};

// String format detection regexes
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const ISO_DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const URI_REGEX = /^https?:\/\/[^\s$.?#].[^\s]*$/i;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

function detectStringFormat(str: string): string | null {
  if (ISO_DATE_TIME_REGEX.test(str)) return 'date-time';
  if (UUID_REGEX.test(str)) return 'uuid';
  if (EMAIL_REGEX.test(str)) return 'email';
  if (URI_REGEX.test(str)) return 'uri';
  if (IPV4_REGEX.test(str)) return 'ipv4';
  return null;
}

// Deep JSON Schema Synthesizer
export function synthesizeJsonSchema(
  val: any,
  options: {
    draft: SchemaDraft;
    title: string;
    description: string;
    allRequired: boolean;
    detectFormats: boolean;
    includeExamples: boolean;
    strictAdditional: boolean;
  }
): any {
  const schemaDraftUrls: Record<SchemaDraft, string> = {
    'draft-07': 'http://json-schema.org/draft-07/schema#',
    'draft-04': 'http://json-schema.org/draft-04/schema#',
    '2020-12': 'https://json-schema.org/draft/2020-12/schema'
  };

  function inferNode(v: any, keyName = ''): any {
    if (v === null) {
      return { type: 'null' };
    }

    if (typeof v === 'string') {
      const node: any = { type: 'string' };
      if (options.detectFormats) {
        const fmt = detectStringFormat(v);
        if (fmt) node.format = fmt;
      }
      if (options.includeExamples && v) {
        node.examples = [v];
      }
      return node;
    }

    if (typeof v === 'number') {
      const node: any = {
        type: Number.isInteger(v) ? 'integer' : 'number'
      };
      if (options.includeExamples) {
        node.examples = [v];
      }
      return node;
    }

    if (typeof v === 'boolean') {
      const node: any = { type: 'boolean' };
      if (options.includeExamples) {
        node.examples = [v];
      }
      return node;
    }

    if (Array.isArray(v)) {
      const node: any = { type: 'array' };
      if (v.length > 0) {
        node.items = inferNode(v[0], `${keyName}Item`);
      } else {
        node.items = {};
      }
      return node;
    }

    if (typeof v === 'object') {
      const properties: Record<string, any> = {};
      const requiredList: string[] = [];

      for (const [key, propVal] of Object.entries(v)) {
        properties[key] = inferNode(propVal, key);
        if (options.allRequired || (propVal !== null && propVal !== undefined)) {
          requiredList.push(key);
        }
      }

      const node: any = {
        type: 'object',
        properties
      };

      if (requiredList.length > 0) {
        node.required = requiredList;
      }

      if (options.strictAdditional) {
        node.additionalProperties = false;
      }

      return node;
    }

    return {};
  }

  const rootNode = inferNode(val);

  return {
    $schema: schemaDraftUrls[options.draft],
    ...(options.title ? { title: options.title } : {}),
    ...(options.description ? { description: options.description } : {}),
    ...rootNode
  };
}

export const JsonSchemaGeneratorPanel: React.FC<JsonSchemaGeneratorPanelProps> = ({ initialValue }) => {
  const [input, setInput] = useState<string>(
    initialValue || JSON.stringify(SCHEMA_PRESETS['User Account'].json, null, 2)
  );
  const [draft, setDraft] = useState<SchemaDraft>('draft-07');
  const [title, setTitle] = useState<string>('UserAccount');
  const [description, setDescription] = useState<string>('Generated JSON Schema definition for UserAccount payload');
  const [allRequired, setAllRequired] = useState<boolean>(true);
  const [detectFormats, setDetectFormats] = useState<boolean>(true);
  const [includeExamples, setIncludeExamples] = useState<boolean>(true);
  const [strictAdditional, setStrictAdditional] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse input JSON
  const parsed = useMemo(() => {
    if (!input.trim()) return { val: null, error: 'Document is empty' };
    try {
      const val = JSON.parse(input);
      return { val, error: null };
    } catch (e: any) {
      return { val: null, error: e?.message || 'Invalid JSON syntax' };
    }
  }, [input]);

  // Synthesize Schema
  const schemaResult = useMemo(() => {
    if (parsed.error || parsed.val === null) return null;
    return synthesizeJsonSchema(parsed.val, {
      draft,
      title: title.trim(),
      description: description.trim(),
      allRequired,
      detectFormats,
      includeExamples,
      strictAdditional
    });
  }, [parsed, draft, title, description, allRequired, detectFormats, includeExamples, strictAdditional]);

  const formattedSchema = useMemo(() => {
    if (!schemaResult) return '';
    return JSON.stringify(schemaResult, null, 2);
  }, [schemaResult]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedSchema);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedSchema], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'schema'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPreset = (key: string) => {
    const p = SCHEMA_PRESETS[key];
    if (p) {
      setInput(JSON.stringify(p.json, null, 2));
      setTitle(key.replace(/[^a-zA-Z0-9]/g, ''));
      setDescription(`Generated JSON Schema definition for ${key}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Draft Selector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                JSON to JSON Schema Converter
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Draft-07 & 2020-12
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Synthesize standard JSON Schemas with semantic format detection, required fields, and examples.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            {Object.keys(SCHEMA_PRESETS).map((k) => (
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

        {/* Global Configuration Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Draft selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 text-xs font-medium">
            {[
              { id: 'draft-07', label: 'Draft-07 (Standard)' },
              { id: '2020-12', label: 'Draft 2020-12' },
              { id: 'draft-04', label: 'Draft-04' }
            ].map((d) => (
              <button
                key={d.id}
                onClick={() => setDraft(d.id as SchemaDraft)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  draft === d.id
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Rule Toggles */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setDetectFormats(!detectFormats)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                detectFormats
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Formats: {detectFormats ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setAllRequired(!allRequired)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                allRequired
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Required: {allRequired ? 'ALL' : 'INFERRED'}
            </button>

            <button
              onClick={() => setIncludeExamples(!includeExamples)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                includeExamples
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Examples: {includeExamples ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setStrictAdditional(!strictAdditional)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                strictAdditional
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              Strict: {strictAdditional ? 'ON' : 'OFF'}
            </button>
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
                Sample JSON Document
              </label>
              {parsed.error ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Invalid
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Ready ({new Blob([input]).size} B)
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
                    r.onload = (ev) => setInput((ev.target?.result as string) || '');
                    r.readAsText(f);
                  }
                }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload JSON"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(input);
                }}
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
            placeholder="Paste JSON document here..."
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-sky-500/40 leading-relaxed resize-y"
          />

          {parsed.error && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs">
              <span className="flex items-center gap-1.5 truncate">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {parsed.error}
              </span>
              <button
                onClick={() => {
                  try {
                    const { repaired } = autoRepairJson(input);
                    setInput(repaired);
                  } catch {}
                }}
                className="px-2 py-0.5 rounded-lg bg-rose-200 dark:bg-rose-900 font-semibold text-[11px] hover:bg-rose-300 shrink-0"
              >
                ⚡ Repair
              </button>
            </div>
          )}
        </div>

        {/* RIGHT PANE: GENERATED JSON SCHEMA */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Synthesized JSON Schema
              </label>
              {formattedSchema && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Valid Schema
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!formattedSchema}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Schema'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!formattedSchema}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-40 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-all">
            {formattedSchema || '// Fix the JSON input on the left to generate schema'}
          </pre>
        </div>
      </div>
    </div>
  );
};
