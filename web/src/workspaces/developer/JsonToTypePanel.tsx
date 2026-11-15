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
  Code2,
  ChevronRight,
  Terminal,
  Cpu
} from 'lucide-react';
import { autoRepairJson } from './JsonFormatterPanel';

interface JsonToTypePanelProps {
  initialValue?: string;
}

type TargetLanguage = 'typescript' | 'zod' | 'go' | 'rust' | 'python' | 'typeddict';

const TYPE_PRESETS: Record<string, { label: string; json: any }> = {
  'API User Response': {
    label: 'API User Record',
    json: {
      userId: "usr_99214",
      username: "alex_dev",
      email: "alex@toolstrum.local",
      isActive: true,
      role: "admin",
      profile: {
        firstName: "Alex",
        lastName: "Vance",
        avatarUrl: "https://cdn.toolstrum.local/avatars/alex.png",
        bio: "Senior Infrastructure Engineer",
        age: 29
      },
      permissions: ["tool:read", "tool:execute", "settings:write"],
      metadata: {
        createdAt: 1731652000,
        loginAttempts: 0,
        twoFactorEnabled: true
      }
    }
  },
  'E-Commerce Order': {
    label: 'Order & Cart Payload',
    json: {
      orderId: "ord_881920",
      customer: {
        id: "cust_112",
        name: "Elena Rostova",
        taxExempt: false
      },
      items: [
        {
          sku: "TOOL-PRO-01",
          title: "PDF Studio License",
          quantity: 1,
          unitPrice: 49.99,
          discounts: [5.00]
        },
        {
          sku: "TOOL-IMG-02",
          title: "Image Studio Batch Pass",
          quantity: 2,
          unitPrice: 19.50,
          discounts: []
        }
      ],
      billingAddress: {
        street: "742 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        postalCode: "97477",
        country: "USA"
      },
      paymentStatus: "completed",
      totalAmount: 83.99
    }
  },
  'Webhook Event': {
    label: 'Webhook Event Payload',
    json: {
      event: "document.converted",
      timestamp: 1731652194,
      payload: {
        jobId: "job_f47ac10b",
        studio: "developer",
        status: "success",
        file: {
          originalName: "schema.json",
          sizeBytes: 1048576,
          mimeType: "application/json"
        },
        metrics: {
          executionTimeMs: 12.4,
          memoryUsedMb: 4.8
        }
      }
    }
  }
};

function toPascalCase(str: string): string {
  return str
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
    .replace(/^[a-z]/, (chr) => chr.toUpperCase());
}

function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '')
    .replace(/[^a-z0-9_]/g, '_');
}

// 1. TypeScript Generator
function generateTypeScript(
  obj: any,
  rootName = 'RootPayload',
  options: { isType: boolean; optional: boolean; readonly: boolean }
): string {
  const definitions: string[] = [];

  function inferType(val: any, keyName: string): string {
    if (val === null) return 'null';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const elType = inferType(val[0], `${keyName}Item`);
      return `${elType}[]`;
    }
    if (typeof val === 'object') {
      const nestedName = toPascalCase(keyName);
      buildDeclaration(val, nestedName);
      return nestedName;
    }
    return typeof val;
  }

  function buildDeclaration(target: any, name: string) {
    if (target === null || typeof target !== 'object' || Array.isArray(target)) return;

    const fields = Object.entries(target).map(([k, v]) => {
      const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      const isNull = v === null;
      const typeStr = inferType(v, k);
      const optMarker = options.optional || isNull ? '?' : '';
      const roMarker = options.readonly ? 'readonly ' : '';
      return `  ${roMarker}${cleanKey}${optMarker}: ${typeStr};`;
    });

    if (options.isType) {
      definitions.push(`export type ${name} = {\n${fields.join('\n')}\n};`);
    } else {
      definitions.push(`export interface ${name} {\n${fields.join('\n')}\n}`);
    }
  }

  buildDeclaration(obj, rootName);
  return definitions.join('\n\n');
}

// 2. Zod Schema Generator
function generateZodSchema(obj: any, rootName = 'RootPayload'): string {
  const schemas: string[] = [];

  function inferZod(val: any, keyName: string): string {
    if (val === null) return 'z.null()';
    if (typeof val === 'string') return 'z.string()';
    if (typeof val === 'number') return Number.isInteger(val) ? 'z.number().int()' : 'z.number()';
    if (typeof val === 'boolean') return 'z.boolean()';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'z.array(z.any())';
      return `z.array(${inferZod(val[0], `${keyName}Item`)})`;
    }
    if (typeof val === 'object') {
      const nestedSchemaName = `${toPascalCase(keyName)}Schema`;
      buildZod(val, nestedSchemaName);
      return nestedSchemaName;
    }
    return 'z.any()';
  }

  function buildZod(target: any, schemaName: string) {
    if (target === null || typeof target !== 'object' || Array.isArray(target)) return;

    const lines = Object.entries(target).map(([k, v]) => {
      const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      return `  ${cleanKey}: ${inferZod(v, k)},`;
    });

    schemas.push(`export const ${schemaName} = z.object({\n${lines.join('\n')}\n});`);
  }

  const rootSchemaName = `${rootName}Schema`;
  buildZod(obj, rootSchemaName);

  return [
    `import { z } from 'zod';`,
    '',
    schemas.join('\n\n'),
    '',
    `export type ${rootName} = z.infer<typeof ${rootSchemaName}>;`
  ].join('\n');
}

// 3. Go Struct Generator
function generateGoStruct(obj: any, rootName = 'RootPayload'): string {
  const structs: string[] = [];

  function inferGo(val: any, keyName: string): string {
    if (val === null) return 'interface{}';
    if (typeof val === 'string') return 'string';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int64' : 'float64';
    if (typeof val === 'boolean') return 'bool';
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]interface{}';
      return `[]${inferGo(val[0], `${keyName}Item`)}`;
    }
    if (typeof val === 'object') {
      const nestedName = toPascalCase(keyName);
      buildGo(val, nestedName);
      return nestedName;
    }
    return 'interface{}';
  }

  function buildGo(target: any, name: string) {
    if (target === null || typeof target !== 'object' || Array.isArray(target)) return;

    const fields = Object.entries(target).map(([k, v]) => {
      const fieldName = toPascalCase(k);
      const fieldType = inferGo(v, k);
      return `\t${fieldName} ${fieldType} \`json:"${k}"\``;
    });

    structs.push(`type ${name} struct {\n${fields.join('\n')}\n}`);
  }

  buildGo(obj, rootName);
  return [`package models`, '', structs.join('\n\n')].join('\n');
}

// 4. Rust Serde Generator
function generateRustStruct(obj: any, rootName = 'RootPayload'): string {
  const structs: string[] = [];

  function inferRust(val: any, keyName: string): string {
    if (val === null) return 'Option<serde_json::Value>';
    if (typeof val === 'string') return 'String';
    if (typeof val === 'number') return Number.isInteger(val) ? 'i64' : 'f64';
    if (typeof val === 'boolean') return 'bool';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'Vec<serde_json::Value>';
      return `Vec<${inferRust(val[0], `${keyName}Item`)}>`;
    }
    if (typeof val === 'object') {
      const nestedName = toPascalCase(keyName);
      buildRust(val, nestedName);
      return nestedName;
    }
    return 'serde_json::Value';
  }

  function buildRust(target: any, name: string) {
    if (target === null || typeof target !== 'object' || Array.isArray(target)) return;

    const fields = Object.entries(target).map(([k, v]) => {
      const rustFieldName = toSnakeCase(k);
      const rustType = inferRust(v, k);
      const renameAttr = rustFieldName !== k ? `\t#[serde(rename = "${k}")]\n` : '';
      return `${renameAttr}\tpub ${rustFieldName}: ${rustType},`;
    });

    structs.push(
      `#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]\n#[serde(rename_all = "camelCase")]\npub struct ${name} {\n${fields.join('\n')}\n}`
    );
  }

  buildRust(obj, rootName);
  return [
    `use serde::{Deserialize, Serialize};`,
    '',
    structs.join('\n\n')
  ].join('\n');
}

// 5. Python Pydantic Generator
function generatePythonPydantic(obj: any, rootName = 'RootPayload'): string {
  const models: string[] = [];

  function inferPy(val: any, keyName: string): string {
    if (val === null) return 'Optional[Any]';
    if (typeof val === 'string') return 'str';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'boolean') return 'bool';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]';
      return `List[${inferPy(val[0], `${keyName}Item`)}]`;
    }
    if (typeof val === 'object') {
      const nestedName = toPascalCase(keyName);
      buildPy(val, nestedName);
      return nestedName;
    }
    return 'Any';
  }

  function buildPy(target: any, name: string) {
    if (target === null || typeof target !== 'object' || Array.isArray(target)) return;

    const fields = Object.entries(target).map(([k, v]) => {
      const snakeK = toSnakeCase(k);
      const typeStr = inferPy(v, k);
      if (snakeK !== k) {
        return `    ${snakeK}: ${typeStr} = Field(..., alias="${k}")`;
      }
      return `    ${snakeK}: ${typeStr}`;
    });

    models.push(`class ${name}(BaseModel):\n${fields.join('\n')}`);
  }

  buildPy(obj, rootName);
  return [
    `from typing import List, Optional, Any, Dict`,
    `from pydantic import BaseModel, Field`,
    '',
    models.join('\n\n')
  ].join('\n');
}

// 6. Python TypedDict
function generatePythonTypedDict(obj: any, rootName = 'RootPayload'): string {
  const dicts: string[] = [];

  function inferPy(val: any, keyName: string): string {
    if (val === null) return 'Optional[Any]';
    if (typeof val === 'string') return 'str';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'boolean') return 'bool';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]';
      return `List[${inferPy(val[0], `${keyName}Item`)}]`;
    }
    if (typeof val === 'object') {
      const nestedName = toPascalCase(keyName);
      buildDict(val, nestedName);
      return nestedName;
    }
    return 'Any';
  }

  function buildDict(target: any, name: string) {
    if (target === null || typeof target !== 'object' || Array.isArray(target)) return;

    const fields = Object.entries(target).map(([k, v]) => {
      const typeStr = inferPy(v, k);
      return `    ${k}: ${typeStr}`;
    });

    dicts.push(`class ${name}(TypedDict):\n${fields.join('\n')}`);
  }

  buildDict(obj, rootName);
  return [
    `from typing import TypedDict, List, Optional, Any`,
    '',
    dicts.join('\n\n')
  ].join('\n');
}

export const JsonToTypePanel: React.FC<JsonToTypePanelProps> = ({ initialValue }) => {
  const [input, setInput] = useState<string>(
    initialValue || JSON.stringify(TYPE_PRESETS['API User Response'].json, null, 2)
  );
  const [language, setLanguage] = useState<TargetLanguage>('typescript');
  const [rootName, setRootName] = useState<string>('UserRecord');
  const [isType, setIsType] = useState<boolean>(false);
  const [optional, setOptional] = useState<boolean>(false);
  const [readonly, setReadonly] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse input
  const parsed = useMemo(() => {
    if (!input.trim()) return { val: null, error: 'Document is empty' };
    try {
      const val = JSON.parse(input);
      if (typeof val !== 'object' || val === null || Array.isArray(val)) {
        return { val: null, error: 'Root document must be a JSON object {...}' };
      }
      return { val, error: null };
    } catch (e: any) {
      return { val: null, error: e?.message || 'Invalid JSON syntax' };
    }
  }, [input]);

  // Generate Code Output
  const generatedCode = useMemo(() => {
    if (parsed.error || !parsed.val) return '';
    const cleanRoot = toPascalCase(rootName.trim()) || 'RootPayload';

    switch (language) {
      case 'typescript':
        return generateTypeScript(parsed.val, cleanRoot, { isType, optional, readonly });
      case 'zod':
        return generateZodSchema(parsed.val, cleanRoot);
      case 'go':
        return generateGoStruct(parsed.val, cleanRoot);
      case 'rust':
        return generateRustStruct(parsed.val, cleanRoot);
      case 'python':
        return generatePythonPydantic(parsed.val, cleanRoot);
      case 'typeddict':
        return generatePythonTypedDict(parsed.val, cleanRoot);
      default:
        return '';
    }
  }, [parsed, language, rootName, isType, optional, readonly]);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extMap: Record<TargetLanguage, string> = {
      typescript: '.ts',
      zod: '.ts',
      go: '.go',
      rust: '.rs',
      python: '.py',
      typeddict: '.py'
    };
    const filename = `${toSnakeCase(rootName) || 'payload'}${extMap[language]}`;
    const blob = new Blob([generatedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoadPreset = (key: string) => {
    const p = TYPE_PRESETS[key];
    if (p) {
      setInput(JSON.stringify(p.json, null, 2));
      setRootName(toPascalCase(key.replace(/[^a-zA-Z0-9]/g, '')));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Language Selector */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                JSON to TypeScript / Go / Rust / Python Models
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Zero Network
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate production-ready, strictly typed interfaces, structs, and schemas with recursive nesting.
              </p>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Presets:</span>
            {Object.keys(TYPE_PRESETS).map((k) => (
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

        {/* Language Tabs & Configuration Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          {/* Target language selector */}
          <div className="flex flex-wrap items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl gap-1 text-xs font-medium">
            {[
              { id: 'typescript', label: 'TypeScript' },
              { id: 'zod', label: 'Zod' },
              { id: 'go', label: 'Go Struct' },
              { id: 'rust', label: 'Rust Serde' },
              { id: 'python', label: 'Pydantic' },
              { id: 'typeddict', label: 'TypedDict' }
            ].map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id as TargetLanguage)}
                className={`px-3 py-1.5 rounded-lg transition-colors font-semibold ${
                  language === lang.id
                    ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>

          {/* Customization Options */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 font-medium">Root:</span>
              <input
                type="text"
                value={rootName}
                onChange={(e) => setRootName(e.target.value)}
                className="w-28 font-mono font-bold text-slate-800 dark:text-slate-200 bg-transparent focus:outline-hidden"
              />
            </div>

            {language === 'typescript' && (
              <>
                <button
                  onClick={() => setIsType(!isType)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    isType
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {isType ? 'type' : 'interface'}
                </button>
                <button
                  onClick={() => setOptional(!optional)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    optional
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Optional: {optional ? 'ON' : 'OFF'}
                </button>
                <button
                  onClick={() => setReadonly(!readonly)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                    readonly
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Readonly: {readonly ? 'ON' : 'OFF'}
                </button>
              </>
            )}
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
                Source JSON Payload
              </label>
              {parsed.error ? (
                <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full">
                  Invalid
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                  Valid Object
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
            placeholder="Paste JSON object here..."
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

        {/* RIGHT PANE: GENERATED TYPE DEFINITIONS */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Generated {language.toUpperCase()}
              </label>
              {generatedCode && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  {generatedCode.split('\n').length} lines
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!generatedCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-40"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>

              <button
                onClick={handleDownload}
                disabled={!generatedCode}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-500 hover:bg-sky-600 text-white transition-colors disabled:opacity-40 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </div>
          </div>

          <pre className="p-4 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto max-h-[460px] leading-relaxed select-all">
            {generatedCode || '// Fix the JSON input on the left to generate models'}
          </pre>
        </div>
      </div>
    </div>
  );
};
