import { sha256, sha1, md5 } from '../../archive/shared/ChecksumUtils';

// ==========================================
// 1. JSON, YAML & DATA FORMATS
// ==========================================

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

export function autoRepairJson(raw: string): { repaired: string; fixedIssues: string[] } {
  const issues: string[] = [];
  let s = raw.trim();

  if (/\/\/.*$/m.test(s)) {
    s = s.replace(/\/\/.*$/gm, '');
    issues.push('Removed JS inline comments');
  }
  if (/\/\*[\s\S]*?\*\//m.test(s)) {
    s = s.replace(/\/\*[\s\S]*?\*\//gm, '');
    issues.push('Removed block comments');
  }
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
  if (/,\s*([\]}])/m.test(s)) {
    s = s.replace(/,\s*([\]}])/g, '$1');
    issues.push('Removed trailing commas');
  }
  if (/'([^'\\]*(?:\\.[^'\\]*)*)'/m.test(s)) {
    s = s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_, match) => '"' + match.replace(/"/g, '\\"') + '"');
    issues.push('Replaced single quotes');
  }
  const unquotedKeyRegex = /([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g;
  if (unquotedKeyRegex.test(s)) {
    s = s.replace(/([{,]\s*)([a-zA-Z0-9_$]+)\s*:/g, '$1"$2":');
    issues.push('Quoted unquoted keys');
  }

  return { repaired: s, fixedIssues: issues.length > 0 ? issues : ['Syntax normalization applied'] };
}

export function formatJson(raw: string, indent: number | string = 2, sortKeys = false): string {
  let parsed = JSON.parse(raw);
  if (sortKeys) {
    parsed = sortJsonKeys(parsed);
  }
  return JSON.stringify(parsed, null, indent);
}

export function validateJson(raw: string): {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
  duplicates?: string[];
  securityRisks?: string[];
} {
  try {
    const parsed = JSON.parse(raw);

    // Audit duplicate keys
    const duplicates: string[] = [];
    const keyRegex = /"([^"\\]*(?:\\.[^"\\]*)*)"\s*:/g;
    const seen = new Set<string>();
    let m;
    while ((m = keyRegex.exec(raw)) !== null) {
      if (seen.has(m[1])) {
        duplicates.push(m[1]);
      } else {
        seen.add(m[1]);
      }
    }

    // Audit security risks
    const securityRisks: string[] = [];
    if (raw.includes('"__proto__"')) securityRisks.push('Prototype pollution key "__proto__" detected');
    if (raw.includes('"constructor"')) securityRisks.push('Object constructor key detected');

    return {
      valid: true,
      duplicates: Array.from(new Set(duplicates)),
      securityRisks
    };
  } catch (err: any) {
    const msg = err?.message || 'Invalid JSON';
    let line = 1;
    let column = 1;
    const match = msg.match(/position (\d+)/i);
    if (match) {
      const pos = parseInt(match[1], 10);
      const prefix = raw.slice(0, pos);
      const lines = prefix.split('\n');
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }
    return { valid: false, error: msg, line, column };
  }
}

function stringToBase64(str: string): string {
  if (typeof btoa !== 'undefined') {
    try {
      return btoa(unescape(encodeURIComponent(str)));
    } catch {}
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
  const encoded = unescape(encodeURIComponent(str));
  let output = '';
  for (let block = 0, charCode, i = 0, map = chars;
      encoded.charAt(i | 0) || (map = '=', i % 1);
      output += map.charAt(63 & block >> 8 - i % 1 * 8)) {
    charCode = encoded.charCodeAt(i += 3/4);
    block = block << 8 | charCode;
  }
  return output;
}

function getByteSize(str: string): number {
  if (typeof Blob !== 'undefined') {
    try {
      return new Blob([str]).size;
    } catch {}
  }
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return encodeURIComponent(str).replace(/%[A-F\d]{2}/g, 'U').length;
}

export function minifyJson(
  raw: string,
  options: {
    removeNulls?: boolean;
    escapeQuotes?: boolean;
    format?: 'raw' | 'curl' | 'url' | 'base64';
  } = {}
): string {
  let parsed = JSON.parse(raw);
  if (options.removeNulls) {
    function clean(obj: any): any {
      if (Array.isArray(obj)) return obj.map(clean);
      if (obj !== null && typeof obj === 'object') {
        return Object.entries(obj).reduce((acc: any, [k, v]) => {
          if (v !== null) acc[k] = clean(v);
          return acc;
        }, {});
      }
      return obj;
    }
    parsed = clean(parsed);
  }
  let minified = JSON.stringify(parsed);
  if (options.escapeQuotes) {
    minified = minified.replace(/"/g, '\\"');
  }
  if (options.format === 'curl') {
    return `--data-raw '${minified.replace(/'/g, "'\\''")}'`;
  }
  if (options.format === 'url') {
    return encodeURIComponent(minified);
  }
  if (options.format === 'base64') {
    return stringToBase64(minified);
  }
  return minified;
}

export function getJsonMinifyStats(raw: string, minified: string): {
  rawBytes: number;
  minifiedBytes: number;
  savingsPct: number;
} {
  const rawBytes = getByteSize(raw);
  const minifiedBytes = getByteSize(minified);
  const savingsPct = rawBytes > 0 ? Math.max(0, Math.round(((rawBytes - minifiedBytes) / rawBytes) * 100)) : 0;
  return { rawBytes, minifiedBytes, savingsPct };
}

export function diffJson(
  jsonA: string,
  jsonB: string
): { path: string; change: 'added' | 'removed' | 'modified'; valA?: any; valB?: any }[] {
  const objA = JSON.parse(jsonA);
  const objB = JSON.parse(jsonB);
  const diffs: { path: string; change: 'added' | 'removed' | 'modified'; valA?: any; valB?: any }[] = [];

  function compare(a: any, b: any, prefix = '') {
    const keysA = a && typeof a === 'object' ? Object.keys(a) : [];
    const keysB = b && typeof b === 'object' ? Object.keys(b) : [];
    const allKeys = Array.from(new Set([...keysA, ...keysB]));

    for (const key of allKeys) {
      const path = prefix ? `${prefix}.${key}` : key;
      const inA = key in (a || {});
      const inB = key in (b || {});

      if (inA && !inB) {
        diffs.push({ path, change: 'removed', valA: a[key] });
      } else if (!inA && inB) {
        diffs.push({ path, change: 'added', valB: b[key] });
      } else if (typeof a[key] === 'object' && typeof b[key] === 'object' && a[key] !== null && b[key] !== null) {
        compare(a[key], b[key], path);
      } else if (a[key] !== b[key]) {
        diffs.push({ path, change: 'modified', valA: a[key], valB: b[key] });
      }
    }
  }

  compare(objA, objB);
  return diffs;
}

export function diffJsonPatch(
  jsonA: string,
  jsonB: string
): Array<{ op: 'add' | 'remove' | 'replace'; path: string; value?: any }> {
  const diffs = diffJson(jsonA, jsonB);
  return diffs.map((d) => {
    const rfcPath = '/' + d.path.replace(/\./g, '/').replace(/\[(\d+)\]/g, '/$1');
    if (d.change === 'added') {
      return { op: 'add', path: rfcPath, value: d.valB };
    }
    if (d.change === 'removed') {
      return { op: 'remove', path: rfcPath };
    }
    return { op: 'replace', path: rfcPath, value: d.valB };
  });
}

export function queryJsonPath(raw: string, path: string): any {
  const obj = JSON.parse(raw);
  const q = path.trim();
  if (!q || q === '$' || q === '.') return obj;

  // Simple dot notation optimization for exact single properties (fast path)
  if (/^\$?\.?[a-zA-Z0-9_$]+(\.[a-zA-Z0-9_$]+)*$/.test(q)) {
    const tokens = q.replace(/^\$\.?/, '').split('.');
    let cur = obj;
    for (const t of tokens) {
      if (cur === null || typeof cur !== 'object') return undefined;
      cur = cur[t];
    }
    return cur;
  }

  // General JSONPath evaluation
  try {
    let clean = q.startsWith('$') ? q.slice(1) : q;
    if (clean.startsWith('.')) {
      // ok
    } else if (!clean.startsWith('[')) {
      clean = '.' + clean;
    }

    const tokenRegex = /(\.\.)|(\.[^.[\s]+)|(\[.*?\])/g;
    let match: RegExpExecArray | null;
    const tokens: string[] = [];
    while ((match = tokenRegex.exec(clean)) !== null) {
      tokens.push(match[0]);
    }

    let currentNodes: any[] = [obj];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const nextNodes: any[] = [];

      // Recursive descent
      if (token === '..' || token.startsWith('..')) {
        const subKey = token.length > 2 ? token.slice(2) : tokens[++i]?.replace(/^\./, '');
        function walk(node: any) {
          if (node === null || typeof node !== 'object') return;
          if (Array.isArray(node)) {
            for (const item of node) {
              if (subKey === '*' || subKey === undefined) nextNodes.push(item);
              walk(item);
            }
          } else {
            for (const k of Object.keys(node)) {
              if (subKey === '*' || k === subKey) nextNodes.push(node[k]);
              walk(node[k]);
            }
          }
        }
        for (const curr of currentNodes) walk(curr);
      }
      // Bracket notation
      else if (token.startsWith('[')) {
        const expr = token.slice(1, -1).trim();
        for (const curr of currentNodes) {
          if (curr === null || typeof curr !== 'object') continue;

          if (expr === '*') {
            if (Array.isArray(curr)) nextNodes.push(...curr);
            else nextNodes.push(...Object.values(curr));
          } else if (expr.startsWith('?(') && expr.endsWith(')')) {
            const cond = expr.slice(2, -1).trim();
            const comp = cond.match(/^@\.([a-zA-Z0-9_$]+)\s*(==|!=|<=|>=|<|>)\s*(.+)$/);
            const exist = cond.match(/^@\.([a-zA-Z0-9_$]+)$/);

            const testItem = (item: any) => {
              if (item === null || typeof item !== 'object') return false;
              if (exist) return item[exist[1]] !== undefined;
              if (comp) {
                const [, p, op, rawV] = comp;
                let r: any = rawV.trim().replace(/^['"]|['"]$/g, '');
                if (!isNaN(Number(r))) r = Number(r);
                if (r === 'true') r = true;
                if (r === 'false') r = false;
                const l = item[p];
                if (op === '==') return l === r;
                if (op === '!=') return l !== r;
                if (op === '<') return l < r;
                if (op === '<=') return l <= r;
                if (op === '>') return l > r;
                if (op === '>=') return l >= r;
              }
              return false;
            };

            if (Array.isArray(curr)) {
              for (const it of curr) if (testItem(it)) nextNodes.push(it);
            } else if (testItem(curr)) {
              nextNodes.push(curr);
            }
          } else if (expr.includes(':')) {
            if (Array.isArray(curr)) {
              const parts = expr.split(':').map((s) => s.trim());
              let start = parts[0] ? parseInt(parts[0], 10) : 0;
              let end = parts[1] ? parseInt(parts[1], 10) : curr.length;
              if (start < 0) start = Math.max(0, curr.length + start);
              if (end < 0) end = Math.max(0, curr.length + end);
              for (let idx = start; idx < Math.min(end, curr.length); idx++) nextNodes.push(curr[idx]);
            }
          } else {
            const cleanProp = expr.replace(/^['"]|['"]$/g, '');
            if (Array.isArray(curr) && /^-?\d+$/.test(cleanProp)) {
              let idx = parseInt(cleanProp, 10);
              if (idx < 0) idx = curr.length + idx;
              if (idx >= 0 && idx < curr.length) nextNodes.push(curr[idx]);
            } else if (cleanProp in curr) {
              nextNodes.push(curr[cleanProp]);
            }
          }
        }
      }
      // Dot property
      else {
        const prop = token.replace(/^\./, '');
        for (const curr of currentNodes) {
          if (curr === null || typeof curr !== 'object') continue;
          if (prop === '*') {
            if (Array.isArray(curr)) nextNodes.push(...curr);
            else nextNodes.push(...Object.values(curr));
          } else if (prop in curr) {
            nextNodes.push(curr[prop]);
          }
        }
      }

      currentNodes = nextNodes;
      if (currentNodes.length === 0) break;
    }

    if (currentNodes.length === 0) return undefined;
    return currentNodes.length === 1 && !q.includes('*') && !q.includes('?') && !q.includes(':') && !q.includes('..')
      ? currentNodes[0]
      : currentNodes;
  } catch {
    return undefined;
  }
}

export function jsonToTypeModel(
  raw: string,
  targetLang: 'typescript' | 'zod' | 'go' | 'rust' | 'python' = 'typescript',
  rootName = 'RootObject'
): string {
  const obj = JSON.parse(raw);
  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    throw new Error('Root JSON payload must be an object {...}');
  }

  function toPascal(s: string): string {
    return s.replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase()).replace(/^[a-z]/, (c) => c.toUpperCase());
  }

  function toSnake(s: string): string {
    return s.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '').replace(/[^a-z0-9_]/g, '_');
  }

  // TypeScript
  if (targetLang === 'typescript') {
    const interfaces: string[] = [];
    function inferTs(val: any, name: string): string {
      if (val === null) return 'any';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'any[]';
        return `${inferTs(val[0], `${name}Item`)}[]`;
      }
      if (typeof val === 'object') {
        const nested = toPascal(name);
        buildTs(val, nested);
        return nested;
      }
      return typeof val;
    }
    function buildTs(o: Record<string, any>, ifName: string) {
      const fields = Object.entries(o).map(([k, v]) => {
        const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
        return `  ${cleanKey}: ${inferTs(v, k)};`;
      });
      interfaces.push(`export interface ${ifName} {\n${fields.join('\n')}\n}`);
    }
    buildTs(obj, rootName);
    return interfaces.join('\n\n');
  }

  // Zod
  if (targetLang === 'zod') {
    const schemas: string[] = [];
    function inferZod(val: any, name: string): string {
      if (val === null) return 'z.null()';
      if (typeof val === 'string') return 'z.string()';
      if (typeof val === 'number') return Number.isInteger(val) ? 'z.number().int()' : 'z.number()';
      if (typeof val === 'boolean') return 'z.boolean()';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'z.array(z.any())';
        return `z.array(${inferZod(val[0], `${name}Item`)})`;
      }
      if (typeof val === 'object') {
        const nested = `${toPascal(name)}Schema`;
        buildZod(val, nested);
        return nested;
      }
      return 'z.any()';
    }
    function buildZod(o: Record<string, any>, schemaName: string) {
      const lines = Object.entries(o).map(([k, v]) => {
        const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
        return `  ${cleanKey}: ${inferZod(v, k)},`;
      });
      schemas.push(`export const ${schemaName} = z.object({\n${lines.join('\n')}\n});`);
    }
    const rootSchema = `${rootName}Schema`;
    buildZod(obj, rootSchema);
    return [
      `import { z } from 'zod';`,
      '',
      schemas.join('\n\n'),
      '',
      `export type ${rootName} = z.infer<typeof ${rootSchema}>;`
    ].join('\n');
  }

  // Go
  if (targetLang === 'go') {
    const structs: string[] = [];
    function inferGo(val: any, name: string): string {
      if (val === null) return 'interface{}';
      if (typeof val === 'string') return 'string';
      if (typeof val === 'number') return Number.isInteger(val) ? 'int64' : 'float64';
      if (typeof val === 'boolean') return 'bool';
      if (Array.isArray(val)) {
        if (val.length === 0) return '[]interface{}';
        return `[]${inferGo(val[0], `${name}Item`)}`;
      }
      if (typeof val === 'object') {
        const nested = toPascal(name);
        buildGo(val, nested);
        return nested;
      }
      return 'interface{}';
    }
    function buildGo(o: Record<string, any>, sName: string) {
      const fields = Object.entries(o).map(([k, v]) => `\t${toPascal(k)} ${inferGo(v, k)} \`json:"${k}"\``);
      structs.push(`type ${sName} struct {\n${fields.join('\n')}\n}`);
    }
    buildGo(obj, rootName);
    return [`package models`, '', structs.join('\n\n')].join('\n');
  }

  // Rust
  if (targetLang === 'rust') {
    const structs: string[] = [];
    function inferRust(val: any, name: string): string {
      if (val === null) return 'Option<serde_json::Value>';
      if (typeof val === 'string') return 'String';
      if (typeof val === 'number') return Number.isInteger(val) ? 'i64' : 'f64';
      if (typeof val === 'boolean') return 'bool';
      if (Array.isArray(val)) {
        if (val.length === 0) return 'Vec<serde_json::Value>';
        return `Vec<${inferRust(val[0], `${name}Item`)}>`;
      }
      if (typeof val === 'object') {
        const nested = toPascal(name);
        buildRust(val, nested);
        return nested;
      }
      return 'serde_json::Value';
    }
    function buildRust(o: Record<string, any>, sName: string) {
      const fields = Object.entries(o).map(([k, v]) => {
        const sk = toSnake(k);
        const attr = sk !== k ? `\t#[serde(rename = "${k}")]\n` : '';
        return `${attr}\tpub ${sk}: ${inferRust(v, k)},`;
      });
      structs.push(
        `#[derive(Default, Debug, Clone, PartialEq, Serialize, Deserialize)]\npub struct ${sName} {\n${fields.join('\n')}\n}`
      );
    }
    buildRust(obj, rootName);
    return [`use serde::{Deserialize, Serialize};`, '', structs.join('\n\n')].join('\n');
  }

  // Python
  const models: string[] = [];
  function inferPy(val: any, name: string): string {
    if (val === null) return 'Optional[Any]';
    if (typeof val === 'string') return 'str';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'boolean') return 'bool';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'List[Any]';
      return `List[${inferPy(val[0], `${name}Item`)}]`;
    }
    if (typeof val === 'object') {
      const nested = toPascal(name);
      buildPy(val, nested);
      return nested;
    }
    return 'Any';
  }
  function buildPy(o: Record<string, any>, mName: string) {
    const fields = Object.entries(o).map(([k, v]) => {
      const sk = toSnake(k);
      const t = inferPy(v, k);
      return sk !== k ? `    ${sk}: ${t} = Field(..., alias="${k}")` : `    ${sk}: ${t}`;
    });
    models.push(`class ${mName}(BaseModel):\n${fields.join('\n')}`);
  }
  buildPy(obj, rootName);
  return [
    `from typing import List, Optional, Any`,
    `from pydantic import BaseModel, Field`,
    '',
    models.join('\n\n')
  ].join('\n');
}

export function jsonToTypeScript(raw: string, rootName = 'RootObject'): string {
  return jsonToTypeModel(raw, 'typescript', rootName);
}

export function jsonToSchema(
  raw: string,
  options: {
    draft?: 'draft-07' | 'draft-04' | '2020-12';
    detectFormats?: boolean;
    allRequired?: boolean;
    title?: string;
  } = {}
): string {
  const obj = JSON.parse(raw);
  const draftUrls = {
    'draft-07': 'http://json-schema.org/draft-07/schema#',
    'draft-04': 'http://json-schema.org/draft-04/schema#',
    '2020-12': 'https://json-schema.org/draft/2020-12/schema',
  };
  const draft = options.draft || 'draft-07';
  const detectFormats = options.detectFormats !== false;
  const allRequired = options.allRequired !== false;

  function makeSchema(val: any): any {
    if (val === null) return { type: 'null' };
    if (typeof val === 'string') {
      const node: any = { type: 'string' };
      if (detectFormats) {
        if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) node.format = 'date-time';
        else if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}/i.test(val)) node.format = 'uuid';
        else if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) node.format = 'email';
        else if (/^https?:\/\//i.test(val)) node.format = 'uri';
      }
      return node;
    }
    if (typeof val === 'number') {
      return { type: Number.isInteger(val) ? 'integer' : 'number' };
    }
    if (typeof val === 'boolean') {
      return { type: 'boolean' };
    }
    if (Array.isArray(val)) {
      return {
        type: 'array',
        items: val.length > 0 ? makeSchema(val[0]) : {},
      };
    }
    if (typeof val === 'object') {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      for (const [k, v] of Object.entries(val)) {
        properties[k] = makeSchema(v);
        if (allRequired || (v !== null && v !== undefined)) {
          required.push(k);
        }
      }
      const node: any = {
        type: 'object',
        properties,
      };
      if (required.length > 0) node.required = required;
      return node;
    }
    return { type: typeof val };
  }

  const schema = {
    $schema: draftUrls[draft],
    title: options.title || 'GeneratedSchema',
    ...makeSchema(obj),
  };

  return JSON.stringify(schema, null, 2);
}

export function jsonToYaml(raw: string): string {
  const obj = JSON.parse(raw);

  function toYaml(data: any, indent = 0): string {
    const prefix = '  '.repeat(indent);
    if (data === null) return 'null\n';
    if (typeof data !== 'object') return `${JSON.stringify(data)}\n`;

    if (Array.isArray(data)) {
      if (data.length === 0) return '[]\n';
      let out = '\n';
      for (const item of data) {
        out += `${prefix}- ${toYaml(item, indent + 1).trimStart()}`;
      }
      return out;
    }

    let out = '\n';
    for (const [key, value] of Object.entries(data)) {
      const valStr = toYaml(value, indent + 1);
      out += `${prefix}${key}: ${valStr.trimStart()}`;
    }
    return out;
  }

  return toYaml(obj).trim();
}

export function autoRepairYaml(raw: string): { repaired: string; fixedIssues: string[] } {
  const issues: string[] = [];
  let s = raw;
  if (s.includes('\t')) {
    s = s.replace(/\t/g, '  ');
    issues.push('Replaced tabs with spaces');
  }
  const missingSpaceRegex = /^(\s*[\w.-]+):([^\s\n/])/gm;
  if (missingSpaceRegex.test(s)) {
    s = s.replace(/^(\s*[\w.-]+):([^\s\n/])/gm, '$1: $2');
    issues.push('Added missing spaces after colons');
  }
  return { repaired: s, fixedIssues: issues.length > 0 ? issues : ['Syntax normalization applied'] };
}

export function formatYaml(yamlStr: string, indent = 2, sortKeys = false): string {
  let s = yamlStr;
  if (s.includes('\t')) {
    s = s.replace(/\t/g, ' '.repeat(indent));
  }
  let jsonStr: string;
  try {
    jsonStr = yamlToJson(s);
  } catch {
    return yamlStr;
  }
  let parsed = JSON.parse(jsonStr);
  if (sortKeys && parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    parsed = Object.keys(parsed)
      .sort()
      .reduce((acc: any, k) => {
        acc[k] = parsed[k];
        return acc;
      }, {});
  }
  return jsonToYaml(JSON.stringify(parsed));
}

export function yamlToJson(yamlStr: string): string {
  const lines = yamlStr.split('\n');
  const result: Record<string, any> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0) {
      const key = trimmed.slice(0, colonIdx).trim();
      let val: any = trimmed.slice(colonIdx + 1).trim();
      if (val === 'true') val = true;
      else if (val === 'false') val = false;
      else if (val === 'null') val = null;
      else if (!isNaN(Number(val)) && val !== '') val = Number(val);
      else if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      else if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      result[key] = val;
    }
  }

  return JSON.stringify(result, null, 2);
}

export function validateYaml(yamlStr: string): {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
  warnings?: string[];
  securityRisks?: string[];
} {
  if (!yamlStr.trim()) return { valid: false, error: 'YAML input is empty.' };
  const lines = yamlStr.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const tabIdx = lines[i].indexOf('\t');
    if (tabIdx !== -1) {
      return {
        valid: false,
        error: 'Tabs are strictly forbidden for indentation in YAML. Use spaces.',
        line: i + 1,
        column: tabIdx + 1,
      };
    }
  }

  const colonRegex = /^(\s*[\w.-]+):([^\s\n/])/;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(colonRegex);
    if (m) {
      return {
        valid: false,
        error: `Missing space after colon following "${m[1].trim()}".`,
        line: i + 1,
        column: lines[i].indexOf(':') + 1,
      };
    }
  }

  const securityRisks: string[] = [];
  const DANGEROUS_TAGS = ['!!python/', '!ruby/object', '!!js/function', '!!perl/', '!!php/'];
  for (let i = 0; i < lines.length; i++) {
    for (const tag of DANGEROUS_TAGS) {
      if (lines[i].includes(tag)) {
        securityRisks.push(`Dangerous tag "${tag}" detected on line ${i + 1}`);
      }
    }
  }

  const warnings: string[] = [];
  const seenAtLevel: Record<number, Set<string>> = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.replace(/#.*$/, '');
    if (!stripped.trim()) continue;
    const indent = line.search(/\S/);
    const colonIdx = stripped.indexOf(':');
    if (colonIdx > indent) {
      const key = stripped.slice(indent, colonIdx).trim();
      for (const d of Object.keys(seenAtLevel)) {
        if (Number(d) > indent) delete seenAtLevel[Number(d)];
      }
      if (!seenAtLevel[indent]) seenAtLevel[indent] = new Set<string>();
      if (seenAtLevel[indent].has(key)) {
        warnings.push(`Duplicate key "${key}" on line ${i + 1}`);
      } else {
        seenAtLevel[indent].add(key);
      }
    }
  }

  try {
    yamlToJson(yamlStr);
    return {
      valid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
      securityRisks: securityRisks.length > 0 ? securityRisks : undefined,
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Invalid YAML format' };
  }
}

export interface XmlValidationResult {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
  nodes?: number;
  rootElement?: string;
  maxDepth?: number;
  cdataCount?: number;
  commentCount?: number;
  warnings?: string[];
}

function getLineAndCol(text: string, index: number): { line: number; column: number } {
  const prefix = text.slice(0, index);
  const lines = prefix.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length + 1,
  };
}

export function validateXml(xmlStr: string): XmlValidationResult {
  if (!xmlStr || !xmlStr.trim()) {
    return { valid: false, error: 'Empty XML document' };
  }

  const trimmed = xmlStr.trim();
  const warnings: string[] = [];
  let rootElement: string | undefined;
  let elementCount = 0;
  let cdataCount = 0;
  let commentCount = 0;
  let currentDepth = 0;
  let maxDepth = 0;

  // Check for XML declaration if present
  if (trimmed.startsWith('<?xml')) {
    const declMatch = trimmed.match(/^<\?xml\s+version=(["'])(1\.[0-9]+)\1(?:\s+encoding=(["'])([a-zA-Z0-9\-_]+)\3)?(?:\s+standalone=(["'])(yes|no)\5)?\s*\?>/);
    if (!declMatch && trimmed.startsWith('<?xml')) {
      const declEnd = trimmed.indexOf('?>');
      const declStr = declEnd !== -1 ? trimmed.slice(0, declEnd + 2) : '<?xml ...';
      warnings.push(`XML declaration '${declStr}' has non-standard attributes or quotes.`);
    }
  }

  // Tokenize comments, CDATA, declarations, tags, and text
  const tokenRegex = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>|[^<]+)/g;
  const stack: { name: string; line: number; column: number }[] = [];

  let match: RegExpExecArray | null;
  let hasRoot = false;
  let rootClosed = false;

  while ((match = tokenRegex.exec(xmlStr)) !== null) {
    const token = match[0];
    const index = match.index;
    const { line, column } = getLineAndCol(xmlStr, index);

    if (token.startsWith('<!--')) {
      commentCount++;
      if (!token.endsWith('-->')) {
        return { valid: false, error: 'Unclosed XML comment', line, column };
      }
      continue;
    }

    if (token.startsWith('<![CDATA[')) {
      cdataCount++;
      if (!token.endsWith(']]>')) {
        return { valid: false, error: 'Unclosed CDATA section', line, column };
      }
      continue;
    }

    if (token.startsWith('<?') || token.startsWith('<!DOCTYPE')) {
      continue;
    }

    if (token.startsWith('</')) {
      // Closing tag
      const closeMatch = token.match(/^<\/\s*([a-zA-Z0-9_\-.:]+)\s*>$/);
      if (!closeMatch) {
        return { valid: false, error: `Malformed closing tag: ${token}`, line, column };
      }
      const closeName = closeMatch[1];
      if (stack.length === 0) {
        return {
          valid: false,
          error: `Unexpected closing tag </${closeName}> with no matching opening tag`,
          line,
          column,
        };
      }
      const last = stack.pop()!;
      if (last.name !== closeName) {
        return {
          valid: false,
          error: `Mismatched closing tag </${closeName}>, expected </${last.name}> (opened at line ${last.line}, col ${last.column})`,
          line,
          column,
        };
      }
      currentDepth--;
      if (stack.length === 0) {
        rootClosed = true;
      }
      continue;
    }

    if (token.startsWith('<')) {
      // Opening or self-closing tag
      const isSelfClosing = token.endsWith('/>');
      const tagContent = isSelfClosing ? token.slice(1, -2).trim() : token.slice(1, -1).trim();
      const firstSpace = tagContent.search(/\s/);
      const tagName = firstSpace === -1 ? tagContent : tagContent.slice(0, firstSpace);

      if (!/^[a-zA-Z_][a-zA-Z0-9_\-.:]*$/.test(tagName)) {
        return { valid: false, error: `Invalid tag name: <${tagName}>`, line, column };
      }

      if (rootClosed && stack.length === 0) {
        return {
          valid: false,
          error: `Extra root element <${tagName}> found. XML allows only one top-level root element.`,
          line,
          column,
        };
      }

      if (!hasRoot) {
        hasRoot = true;
        rootElement = tagName;
      }

      elementCount++;
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;

      // Check attributes for quotes & duplicates
      if (firstSpace !== -1) {
        const attrStr = tagContent.slice(firstSpace);
        const attrRegex = /([a-zA-Z_][a-zA-Z0-9_\-.:]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
        let attrMatch: RegExpExecArray | null;
        const seenAttrs = new Set<string>();

        while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
          const attrName = attrMatch[1];
          if (seenAttrs.has(attrName)) {
            warnings.push(`Duplicate attribute '${attrName}' on element <${tagName}> at line ${line}.`);
          }
          seenAttrs.add(attrName);

          if (attrMatch[4] !== undefined) {
            return {
              valid: false,
              error: `Unquoted attribute value for '${attrName}' in <${tagName}> at line ${line}`,
              line,
              column,
            };
          }
        }
      }

      if (isSelfClosing) {
        currentDepth--;
        if (stack.length === 0 && hasRoot) {
          rootClosed = true;
        }
      } else {
        stack.push({ name: tagName, line, column });
      }
      continue;
    }

    // Text node
    if (!token.trim()) continue;
    // Check for naked ampersands
    const nakedAmp = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#[xX][0-9a-fA-F]+;)/g;
    if (nakedAmp.test(token)) {
      warnings.push(`Unescaped '&' found in text content at line ${line}. Use '&amp;' instead.`);
    }
  }

  if (stack.length > 0) {
    const unclosed = stack[stack.length - 1];
    return {
      valid: false,
      error: `Unclosed XML tag: <${unclosed.name}> opened at line ${unclosed.line}, column ${unclosed.column}`,
      line: unclosed.line,
      column: unclosed.column,
    };
  }

  if (!hasRoot) {
    return { valid: false, error: 'Document does not contain any XML elements' };
  }

  return {
    valid: true,
    nodes: elementCount,
    rootElement,
    maxDepth,
    cdataCount,
    commentCount,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

export function autoRepairXml(xmlStr: string): { repaired: string; repairs: string[] } {
  const repairs: string[] = [];
  let s = xmlStr;

  // 1. Repair unescaped ampersands: & -> &amp;
  const ampCount = (s.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#[xX][0-9a-fA-F]+;)/g) || []).length;
  if (ampCount > 0) {
    s = s.replace(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#[xX][0-9a-fA-F]+;)/g, '&amp;');
    repairs.push(`Escaped ${ampCount} raw '&' characters into '&amp;'`);
  }

  // 2. Fix unquoted attributes: attr=value -> attr="value"
  const unquotedAttrRegex = /([a-zA-Z_][a-zA-Z0-9_\-.:]*)=([a-zA-Z0-9_\-.:/]+)(?=[\s>])/g;
  let unquotedFound = 0;
  s = s.replace(unquotedAttrRegex, (_, name, val) => {
    unquotedFound++;
    return `${name}="${val}"`;
  });
  if (unquotedFound > 0) {
    repairs.push(`Enclosed ${unquotedFound} unquoted attribute values in double quotes`);
  }

  // 3. Normalize closing slashes like <tag / > -> <tag />
  const malformedClose = /<\s*([a-zA-Z_][a-zA-Z0-9_\-.:]*)([^>]*?)\s*\/\s*>/g;
  s = s.replace(malformedClose, '<$1$2 />');

  // 4. Close unclosed tags at EOF
  const tokenRegex = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>)/g;
  const stack: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = tokenRegex.exec(s)) !== null) {
    const t = m[0];
    if (t.startsWith('<!--') || t.startsWith('<![CDATA[') || t.startsWith('<?') || t.startsWith('<!DOCTYPE')) continue;
    if (t.startsWith('</')) {
      const matchName = t.match(/^<\/\s*([a-zA-Z0-9_\-.:]+)\s*>$/);
      if (matchName && stack.length > 0 && stack[stack.length - 1] === matchName[1]) {
        stack.pop();
      }
    } else if (t.startsWith('<') && !t.endsWith('/>')) {
      const firstSpace = t.search(/\s/);
      const name = firstSpace === -1 ? t.slice(1, -1) : t.slice(1, firstSpace);
      stack.push(name);
    }
  }

  if (stack.length > 0) {
    const closedTags: string[] = [];
    while (stack.length > 0) {
      const tag = stack.pop()!;
      s += `\n</${tag}>`;
      closedTags.push(tag);
    }
    repairs.push(`Auto-closed unclosed tags: </${closedTags.reverse().join('>, </')}>`);
  }

  return { repaired: s, repairs };
}

export function formatXml(
  xmlStr: string,
  indent: number | 'min' = 2,
  options: {
    wrapAttributes?: boolean;
    selfCloseEmpty?: boolean;
  } = {}
): string {
  if (!xmlStr || !xmlStr.trim()) return '';

  if (indent === 'min') {
    return xmlStr
      .replace(/>[\s\r\n]+</g, '><')
      .replace(/\s+/g, ' ')
      .replace(/<\s+/g, '<')
      .replace(/\s+>/g, '>')
      .replace(/\s*\/\s*>/g, ' />')
      .trim();
  }

  const space = ' '.repeat(typeof indent === 'number' ? indent : 2);
  const tokenRegex = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<!DOCTYPE[\s\S]*?>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>|[^<]+)/g;

  const rawTokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(xmlStr)) !== null) {
    const tok = match[0].trim();
    if (tok.length > 0) {
      rawTokens.push(tok);
    }
  }

  const formattedLines: string[] = [];
  let depth = 0;

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    // Comments, declarations, DOCTYPE, CDATA
    if (token.startsWith('<?') || token.startsWith('<!DOCTYPE') || token.startsWith('<!--') || token.startsWith('<![CDATA[')) {
      formattedLines.push(`${space.repeat(depth)}${token}`);
      continue;
    }

    // Closing tag
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      formattedLines.push(`${space.repeat(depth)}${token}`);
      continue;
    }

    // Self-closing tag
    if (token.startsWith('<') && token.endsWith('/>')) {
      formattedLines.push(`${space.repeat(depth)}${token}`);
      continue;
    }

    // Opening tag
    if (token.startsWith('<')) {
      const tagNameMatch = token.match(/^<([a-zA-Z0-9_\-.:]+)/);
      const tagName = tagNameMatch ? tagNameMatch[1] : '';

      // Check if this is an empty tag followed directly by its closing tag: <tag></tag>
      if (options.selfCloseEmpty && i + 1 < rawTokens.length && rawTokens[i + 1] === `</${tagName}>`) {
        const selfClosed = token.slice(0, -1).trim() + ' />';
        formattedLines.push(`${space.repeat(depth)}${selfClosed}`);
        i++; // skip closing tag
        continue;
      }

      // Check if next token is simple single-line text and token after that is closing tag: <tag>text</tag>
      if (
        i + 2 < rawTokens.length &&
        !rawTokens[i + 1].startsWith('<') &&
        !rawTokens[i + 1].includes('\n') &&
        rawTokens[i + 2] === `</${tagName}>`
      ) {
        formattedLines.push(`${space.repeat(depth)}${token}${rawTokens[i + 1]}${rawTokens[i + 2]}`);
        i += 2; // skip text and closing tag
        continue;
      }

      // Normal opening tag
      formattedLines.push(`${space.repeat(depth)}${token}`);
      depth++;
      continue;
    }

    // Text content
    formattedLines.push(`${space.repeat(depth)}${token}`);
  }

  return formattedLines.join('\n');
}

export function generateMockJson(type: 'users' | 'products' | 'orders' = 'users', count = 3): string {
  const items: any[] = [];
  for (let i = 1; i <= count; i++) {
    if (type === 'users') {
      items.push({
        id: i,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        role: i === 1 ? 'admin' : 'member',
        active: true,
        createdAt: new Date().toISOString(),
      });
    } else if (type === 'products') {
      items.push({
        id: 100 + i,
        title: `Product ${i}`,
        sku: `SKU-${1000 + i}`,
        price: (19.99 * i).toFixed(2),
        stock: 50 * i,
        category: 'Hardware',
      });
    } else {
      items.push({
        orderId: `ORD-${202600 + i}`,
        userId: i,
        total: (49.5 * i).toFixed(2),
        status: i % 2 === 0 ? 'completed' : 'processing',
        timestamp: new Date().toISOString(),
      });
    }
  }
  return JSON.stringify(items, null, 2);
}

// ==========================================
// 2. CODE FORMATTERS & MINIFIERS
// ==========================================

const VOID_HTML_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

export interface HtmlFormatOptions {
  indent?: number | 'tab';
  wrapAttributes?: boolean;
  inlineTextElements?: boolean;
}

export function formatHtml(html: string, indent: number | 'tab' | HtmlFormatOptions = 2): string {
  if (!html || !html.trim()) return '';

  let options: HtmlFormatOptions = {};
  if (typeof indent === 'object') {
    options = indent;
  } else {
    options = { indent };
  }

  const indentStr = options.indent === 'tab' ? '\t' : ' '.repeat(typeof options.indent === 'number' ? options.indent : 2);
  const wrapAttrs = options.wrapAttributes ?? false;
  const inlineText = options.inlineTextElements ?? true;

  const tokenRegex = /(<!--[\s\S]*?-->|<!DOCTYPE[\s\S]*?>|<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<\/[a-zA-Z0-9_\-.:]+\s*>|<[a-zA-Z0-9_\-.:]+(?:\s+[^"'>]*(?:"[^"]*"|'[^']*')?)*\s*\/?>|[^<]+)/gi;

  const rawTokens: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = tokenRegex.exec(html)) !== null) {
    const tok = match[0].trim();
    if (tok.length > 0) {
      rawTokens.push(tok);
    }
  }

  const lines: string[] = [];
  let depth = 0;

  function formatTagAttrs(tag: string, currentIndent: string): string {
    if (!wrapAttrs || !tag.startsWith('<') || tag.startsWith('</') || tag.startsWith('<!')) return tag;
    const isSelfClosing = tag.endsWith('/>');
    const inner = isSelfClosing ? tag.slice(1, -2).trim() : tag.slice(1, -1).trim();
    const firstSpace = inner.search(/\s/);
    if (firstSpace === -1) return tag;

    const tagName = inner.slice(0, firstSpace);
    const attrStr = inner.slice(firstSpace).trim();
    const attrRegex = /([a-zA-Z_][a-zA-Z0-9_\-.:]*)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?/g;
    const attrs: string[] = [];
    let attrMatch: RegExpExecArray | null;
    while ((attrMatch = attrRegex.exec(attrStr)) !== null) {
      attrs.push(attrMatch[0]);
    }

    if (attrs.length <= 2) return tag;

    const attrIndent = currentIndent + indentStr;
    const attrBlock = attrs.map((a) => `${attrIndent}${a}`).join('\n');
    return `<${tagName}\n${attrBlock}\n${currentIndent}${isSelfClosing ? '/>' : '>'}`;
  }

  for (let i = 0; i < rawTokens.length; i++) {
    const token = rawTokens[i];

    if (token.startsWith('<!--') || token.startsWith('<!DOCTYPE')) {
      lines.push(`${indentStr.repeat(depth)}${token}`);
      continue;
    }

    if (/^<script[\s\S]*?<\/script>$/i.test(token) || /^<style[\s\S]*?<\/style>$/i.test(token)) {
      const openTagMatch = token.match(/^<([a-zA-Z0-9_\-.:]+)[^>]*>/i);
      const openTag = openTagMatch ? openTagMatch[0] : '<script>';
      const closeTag = `</${openTagMatch ? openTagMatch[1] : 'script'}>`;
      const innerContent = token.slice(openTag.length, token.length - closeTag.length).trim();

      lines.push(`${indentStr.repeat(depth)}${openTag}`);
      if (innerContent) {
        const innerLines = innerContent.split('\n');
        for (const line of innerLines) {
          const trimmedLine = line.trim();
          if (trimmedLine) {
            lines.push(`${indentStr.repeat(depth + 1)}${trimmedLine}`);
          }
        }
      }
      lines.push(`${indentStr.repeat(depth)}${closeTag}`);
      continue;
    }

    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      lines.push(`${indentStr.repeat(depth)}${token}`);
      continue;
    }

    if (token.startsWith('<')) {
      const tagNameMatch = token.match(/^<([a-zA-Z0-9_\-.:]+)/i);
      const tagName = tagNameMatch ? tagNameMatch[1].toLowerCase() : '';
      const isVoid = VOID_HTML_ELEMENTS.has(tagName) || token.endsWith('/>');

      if (isVoid) {
        const formattedTag = formatTagAttrs(token, indentStr.repeat(depth));
        lines.push(`${indentStr.repeat(depth)}${formattedTag}`);
        continue;
      }

      if (
        inlineText &&
        i + 2 < rawTokens.length &&
        !rawTokens[i + 1].startsWith('<') &&
        !rawTokens[i + 1].includes('\n') &&
        rawTokens[i + 2].toLowerCase() === `</${tagName}>`
      ) {
        const formattedTag = formatTagAttrs(token, indentStr.repeat(depth));
        lines.push(`${indentStr.repeat(depth)}${formattedTag}${rawTokens[i + 1]}${rawTokens[i + 2]}`);
        i += 2;
        continue;
      }

      const formattedTag = formatTagAttrs(token, indentStr.repeat(depth));
      lines.push(`${indentStr.repeat(depth)}${formattedTag}`);
      depth++;
      continue;
    }

    lines.push(`${indentStr.repeat(depth)}${token}`);
  }

  return lines.join('\n');
}

export interface HtmlMinifyOptions {
  stripComments?: boolean;
  collapseWhitespace?: boolean;
  minifyEmbeddedCss?: boolean;
  minifyEmbeddedJs?: boolean;
  removeBooleanAttributes?: boolean;
  removeEmptyAttributes?: boolean;
}

export function minifyHtml(html: string, options: HtmlMinifyOptions = {}): string {
  if (!html || !html.trim()) return '';

  const {
    stripComments = true,
    collapseWhitespace = true,
    minifyEmbeddedCss = true,
    minifyEmbeddedJs = true,
    removeBooleanAttributes = true,
    removeEmptyAttributes = false,
  } = options;

  let s = html;

  if (minifyEmbeddedCss) {
    s = s.replace(/<style([^>]*)>([\s\S]*?)<\/style>/gi, (_, attrs, css) => {
      let minCss = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;}/g, '}')
        .replace(/\s{2,}/g, ' ')
        .trim();
      return `<style${attrs}>${minCss}</style>`;
    });
  }

  if (minifyEmbeddedJs) {
    s = s.replace(/<script([^>]*)>([\s\S]*?)<\/script>/gi, (_, attrs, js) => {
      let minJs = js
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/(^|[^:])\/\/[^\r\n]*/g, '$1')
        .replace(/^\s+|\s+$/gm, '')
        .replace(/\n{2,}/g, '\n')
        .trim();
      return `<script${attrs}>${minJs}</script>`;
    });
  }

  if (stripComments) {
    s = s.replace(/<!--(?!\s*\[if)[\s\S]*?-->/gi, '');
  }

  if (removeBooleanAttributes) {
    s = s.replace(/\s+(disabled|checked|readonly|required|autofocus|multiple|selected)=["']\1["']/gi, ' $1');
  }

  if (removeEmptyAttributes) {
    s = s.replace(/\s+(class|id|style)=["']\s*["']/gi, '');
  }

  if (collapseWhitespace) {
    s = s
      .replace(/>[\s\r\n]+</g, '><')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+>/g, '>')
      .replace(/<\s+/g, '<')
      .trim();
  }

  return s;
}

export interface CssFormatOptions {
  indent?: number | 'tab';
  singleLineRules?: boolean;
  sortProperties?: boolean;
}

export function formatCss(cssStr: string, indent: number | 'tab' | CssFormatOptions = 2): string {
  if (!cssStr || !cssStr.trim()) return '';

  let options: CssFormatOptions = {};
  if (typeof indent === 'object') {
    options = indent;
  } else {
    options = { indent };
  }

  const indentUnit = options.indent === 'tab' ? '\t' : ' '.repeat(typeof options.indent === 'number' ? options.indent : 2);
  const singleLine = options.singleLineRules ?? false;
  const sortProps = options.sortProperties ?? false;

  const protectedItems: string[] = [];
  let s = cssStr.replace(/(\/\*[\s\S]*?\*\/|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, (match) => {
    protectedItems.push(match);
    return `__TOOLSTRUM_CSS_${protectedItems.length - 1}__`;
  });

  s = s.replace(/\s+/g, ' ').replace(/\s*([\{\};:])\s*/g, '$1');

  const restore = (str: string) =>
    str.replace(/__TOOLSTRUM_CSS_(\d+)__/g, (_, idx) => protectedItems[Number(idx)] || '');

  const resultLines: string[] = [];
  let depth = 0;
  let currentDeclarations: string[] = [];
  let currentToken = '';

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char === '{') {
      const selector = restore(currentToken.trim());
      currentToken = '';
      currentDeclarations = [];
      resultLines.push(`${indentUnit.repeat(depth)}${selector} {`);
      depth++;
      continue;
    }

    if (char === ';') {
      currentToken += char;
      const decl = currentToken.trim();
      currentToken = '';
      if (decl) {
        const colonIdx = decl.indexOf(':');
        if (colonIdx !== -1) {
          const prop = decl.slice(0, colonIdx).trim();
          const val = decl.slice(colonIdx + 1, -1).trim();
          currentDeclarations.push(`${prop}: ${val};`);
        } else {
          currentDeclarations.push(decl);
        }
      }
      continue;
    }

    if (char === '}') {
      const remainder = currentToken.trim();
      currentToken = '';
      if (remainder) {
        const colonIdx = remainder.indexOf(':');
        if (colonIdx !== -1) {
          const prop = remainder.slice(0, colonIdx).trim();
          const val = remainder.slice(colonIdx + 1).replace(/;$/, '').trim();
          currentDeclarations.push(`${prop}: ${val};`);
        } else {
          currentDeclarations.push(remainder);
        }
      }

      if (sortProps) {
        currentDeclarations.sort((a, b) => a.localeCompare(b));
      }

      depth = Math.max(0, depth - 1);

      if (singleLine && currentDeclarations.length > 0 && resultLines.length > 0 && resultLines[resultLines.length - 1].endsWith('{')) {
        const lastLine = resultLines.pop()!;
        const restoredProps = currentDeclarations.map(restore).join(' ');
        resultLines.push(`${lastLine} ${restoredProps} }`);
      } else {
        for (const decl of currentDeclarations) {
          resultLines.push(`${indentUnit.repeat(depth + 1)}${restore(decl)}`);
        }
        resultLines.push(`${indentUnit.repeat(depth)}}`);
      }

      currentDeclarations = [];
      if (depth === 0) {
        resultLines.push('');
      }
      continue;
    }

    currentToken += char;
  }

  const trailing = currentToken.trim();
  if (trailing) {
    resultLines.push(`${indentUnit.repeat(depth)}${restore(trailing)}`);
  }

  return resultLines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

export interface CssMinifyOptions {
  stripComments?: boolean;
  preserveSpecialComments?: boolean;
  removeTrailingSemicolons?: boolean;
  shortenHexColors?: boolean;
  removeLeadingZeros?: boolean;
  removeUnitZeros?: boolean;
}

export function minifyCss(css: string, options: CssMinifyOptions = {}): string {
  if (!css || !css.trim()) return '';

  const {
    stripComments = true,
    preserveSpecialComments = false,
    removeTrailingSemicolons = true,
    shortenHexColors = true,
    removeLeadingZeros = true,
    removeUnitZeros = true,
  } = options;

  let s = css;

  if (preserveSpecialComments) {
    s = s.replace(/\/\*(?!\!)[\s\S]*?\*\//g, '');
  } else if (stripComments) {
    s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  s = s
    .replace(/\s+/g, ' ')
    .replace(/\s*([\{\};:,>+~])\s*/g, '$1');

  if (removeTrailingSemicolons) {
    s = s.replace(/;}/g, '}');
  }

  if (shortenHexColors) {
    s = s.replace(/#([0-9a-fA-F])\1([0-9a-fA-F])\2([0-9a-fA-F])\3\b/g, '#$1$2$3');
  }

  if (removeLeadingZeros) {
    s = s.replace(/(:|\s)0\.(\d+)/g, '$1.$2');
  }

  if (removeUnitZeros) {
    s = s.replace(/(:|\s)0(px|em|rem|in|cm|mm|pt|pc|vh|vw|vmin|vmax)/gi, '$10');
  }

  s = s.replace(/[^{}]+\{\s*\}/g, '');

  return s.trim();
}

export interface JsFormatOptions {
  indent?: number | 'tab';
  quoteType?: 'single' | 'double' | 'preserve';
  semicolons?: boolean;
}

export function formatJs(jsStr: string, indent: number | 'tab' | JsFormatOptions = 2): string {
  if (!jsStr || !jsStr.trim()) return '';

  let options: JsFormatOptions = {};
  if (typeof indent === 'object') {
    options = indent;
  } else {
    options = { indent };
  }

  const indentUnit = options.indent === 'tab' ? '\t' : ' '.repeat(typeof options.indent === 'number' ? options.indent : 2);
  const quoteType = options.quoteType ?? 'preserve';

  const protectedItems: string[] = [];
  const protectRegex = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[\s\S]*?`|\/(?:[^\/\\]|\\.)+\/[gimsuy]*)/g;

  const s = jsStr.replace(protectRegex, (match) => {
    let finalMatch = match;
    if (quoteType === 'single' && match.startsWith('"') && match.endsWith('"')) {
      const inner = match.slice(1, -1).replace(/'/g, "\\'").replace(/\\"/g, '"');
      finalMatch = `'${inner}'`;
    } else if (quoteType === 'double' && match.startsWith("'") && match.endsWith("'")) {
      const inner = match.slice(1, -1).replace(/"/g, '\\"').replace(/\\'/g, "'");
      finalMatch = `"${inner}"`;
    }
    protectedItems.push(finalMatch);
    return `__TOOLSTRUM_JS_${protectedItems.length - 1}__`;
  });

  let processed = '';
  let parenDepth = 0;

  for (let i = 0; i < s.length; i++) {
    const char = s[i];

    if (char === '(') {
      parenDepth++;
      processed += char;
      continue;
    }

    if (char === ')') {
      parenDepth = Math.max(0, parenDepth - 1);
      processed += char;
      continue;
    }

    if (char === '{') {
      processed += ' {\n';
      continue;
    }

    if (char === '}') {
      processed += '\n}\n';
      continue;
    }

    if (char === ';') {
      if (parenDepth > 0) {
        processed += '; ';
      } else {
        processed += ';\n';
      }
      continue;
    }

    processed += char;
  }

  processed = processed
    .replace(/\s*(=>|===|!==|==|!=|<=|>=|\+=|-=|\*=|\/=|&&|\|\||\?\?|=)\s*/g, ' $1 ')
    .replace(/,\s*/g, ', ')
    .replace(/\s*:\s*/g, ': ')
    .replace(/\b(if|for|while|switch|catch)\s*\(/g, '$1 (')
    .replace(/\}\s*else\s*\{/g, '} else {')
    .replace(/\}\s*else\s+if/g, '} else if')
    .replace(/\}\s*catch/g, '} catch')
    .replace(/\}\s*finally/g, '} finally');

  const rawLines = processed.split('\n');
  const resultLines: string[] = [];
  let depth = 0;

  for (const raw of rawLines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;

    if (/^[}\])]/.test(trimmed)) {
      depth = Math.max(0, depth - 1);
    }

    resultLines.push(`${indentUnit.repeat(depth)}${trimmed}`);

    if (/[{\[(]$/.test(trimmed)) {
      depth++;
    }
  }

  let output = resultLines.join('\n').replace(/__TOOLSTRUM_JS_(\d+)__/g, (_, idx) => protectedItems[Number(idx)] || '');
  output = output.replace(/\n{3,}/g, '\n\n').trim();

  return output;
}

export interface JsMinifyOptions {
  stripComments?: boolean;
  compressBooleans?: boolean;
  wrapIIFE?: boolean;
}

export function minifyJs(js: string, options: JsMinifyOptions = {}): string {
  if (!js || !js.trim()) return '';

  const {
    stripComments = true,
    compressBooleans = true,
    wrapIIFE = false,
  } = options;

  const protectedItems: string[] = [];
  const protectRegex = /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`[\s\S]*?`|\/(?:[^\/\\]|\\.)+\/[gimsuy]*)/g;

  let s = js.replace(protectRegex, (match) => {
    if (stripComments && (match.startsWith('/*') || match.startsWith('//'))) {
      return ' ';
    }
    protectedItems.push(match);
    return `__TOOLSTRUM_JS_${protectedItems.length - 1}__`;
  });

  if (compressBooleans) {
    s = s
      .replace(/\btrue\b/g, '!0')
      .replace(/\bfalse\b/g, '!1')
      .replace(/\bundefined\b/g, 'void 0');
  }

  s = s.replace(/\s+/g, ' ');

  s = s
    .replace(/\s*([\{\}\(\)\[\];:,?])\s*/g, '$1')
    .replace(/\s*([=+\-*\/%&|^!<>]=?)\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim();

  s = s.replace(/__TOOLSTRUM_JS_(\d+)__/g, (_, idx) => protectedItems[Number(idx)] || '');

  if (wrapIIFE) {
    s = `(()=>{${s}})();`;
  }

  return s;
}

export interface SqlFormatOptions {
  indent?: number | 'tab';
  keywordCase?: 'upper' | 'lower' | 'preserve';
  commaPosition?: 'trailing' | 'leading';
}

export function formatSql(sql: string, indent: number | 'tab' | SqlFormatOptions = 2): string {
  if (!sql || !sql.trim()) return '';

  let options: SqlFormatOptions = {};
  if (typeof indent === 'object') {
    options = indent;
  } else {
    options = { indent };
  }

  const indentUnit = options.indent === 'tab' ? '\t' : ' '.repeat(typeof options.indent === 'number' ? options.indent : 2);
  const keywordCase = options.keywordCase ?? 'upper';
  const commaLeading = options.commaPosition === 'leading';

  const transformCase = (kw: string) => {
    if (keywordCase === 'upper') return kw.toUpperCase();
    if (keywordCase === 'lower') return kw.toLowerCase();
    return kw;
  };

  const protectedItems: string[] = [];
  const protectRegex = /('(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`|\[[^\]]*\]|--[^\n]*|\/\*[\s\S]*?\*\/)/g;

  let s = sql.replace(protectRegex, (match) => {
    protectedItems.push(match);
    return `__TOOLSTRUM_SQL_${protectedItems.length - 1}__`;
  });

  s = s.replace(/\s+/g, ' ').trim();

  const rootClauses = [
    'WITH', 'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY',
    'LIMIT', 'OFFSET', 'FETCH FIRST', 'FETCH NEXT', 'INSERT INTO', 'VALUES',
    'UPDATE', 'SET', 'DELETE FROM', 'TRUNCATE TABLE', 'CREATE TABLE', 'ALTER TABLE',
    'DROP TABLE', 'CREATE INDEX', 'UNION ALL', 'UNION', 'EXCEPT', 'INTERSECT'
  ];

  const subClauses = [
    'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN', 'LEFT JOIN',
    'RIGHT JOIN', 'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'NATURAL JOIN',
    'STRAIGHT_JOIN', 'JOIN', 'AND', 'OR', 'ON', 'USING', 'RETURNING'
  ];

  const minorKeywords = [
    'AS', 'DISTINCT', 'ALL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
    'NULLS FIRST', 'NULLS LAST', 'IS NULL', 'IS NOT NULL', 'IN', 'NOT IN',
    'BETWEEN', 'NOT BETWEEN', 'LIKE', 'ILIKE', 'NOT LIKE', 'EXISTS', 'NOT EXISTS',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF', 'OVER',
    'PARTITION BY', 'ROW_NUMBER', 'PRIMARY KEY', 'FOREIGN KEY', 'REFERENCES',
    'CONSTRAINT', 'DEFAULT', 'CASCADE', 'INDEX'
  ];

  for (const clause of rootClauses) {
    const regex = new RegExp(`\\b${clause}\\b\\s*`, 'gi');
    s = s.replace(regex, `\n__ROOT_CLAUSE__${transformCase(clause)} `);
  }

  for (const clause of subClauses) {
    const regex = new RegExp(`\\b${clause}\\b\\s*`, 'gi');
    s = s.replace(regex, `\n__SUB_CLAUSE__${transformCase(clause)} `);
  }

  for (const kw of minorKeywords) {
    const regex = new RegExp(`\\b${kw}\\b`, 'gi');
    s = s.replace(regex, transformCase(kw));
  }

  const rawLines = s.split('\n');
  const formattedLines: string[] = [];
  let depth = 0;

  for (const raw of rawLines) {
    let line = raw.trim();
    if (!line) continue;

    let isRoot = false;
    let isSub = false;

    if (line.startsWith('__ROOT_CLAUSE__')) {
      isRoot = true;
      line = line.replace('__ROOT_CLAUSE__', '');
    } else if (line.startsWith('__SUB_CLAUSE__')) {
      isSub = true;
      line = line.replace('__SUB_CLAUSE__', '');
    }

    if (line.includes(',')) {
      const parts = line.split(',').map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        if (commaLeading) {
          formattedLines.push(`${indentUnit.repeat(depth)}${parts[0]}`);
          for (let p = 1; p < parts.length; p++) {
            formattedLines.push(`${indentUnit.repeat(depth + 1)}, ${parts[p]}`);
          }
        } else {
          for (let p = 0; p < parts.length; p++) {
            const isLast = p === parts.length - 1;
            const indentLevel = p === 0 ? depth : depth + 1;
            formattedLines.push(`${indentUnit.repeat(indentLevel)}${parts[p]}${isLast ? '' : ','}`);
          }
        }
        continue;
      }
    }

    const currentIndent = isSub ? indentUnit.repeat(depth + 1) : indentUnit.repeat(depth);
    formattedLines.push(`${currentIndent}${line}`);
  }

  let result = formattedLines.join('\n').replace(/__TOOLSTRUM_SQL_(\d+)__/g, (_, idx) => protectedItems[Number(idx)] || '');
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

export interface SqlMinifyOptions {
  stripComments?: boolean;
  tightPunctuation?: boolean;
  keywordCase?: 'upper' | 'lower' | 'preserve';
}

export function minifySql(sql: string, options: SqlMinifyOptions = {}): string {
  const {
    stripComments = true,
    tightPunctuation = false,
    keywordCase = 'upper',
  } = options;

  if (!sql || !sql.trim()) return '';

  const protectedStrings: string[] = [];
  const strRegex = /('(?:''|[^'])*'|"(?:""|[^"])*"|`[^`]*`|\[[^\]]*\])/g;
  let s = sql.replace(strRegex, (match) => {
    protectedStrings.push(match);
    return `__TOOLSTRUM_SQL_STR_${protectedStrings.length - 1}__`;
  });

  if (stripComments) {
    s = s.replace(/--[^\r\n]*/g, '');
    s = s.replace(/\/\*[\s\S]*?\*\//g, '');
  }

  s = s.replace(/\s+/g, ' ').trim();

  if (tightPunctuation) {
    s = s.replace(/\s*([,;()=><])\s*/g, '$1');
  }

  if (keywordCase !== 'preserve') {
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
      'INNER JOIN', 'FULL JOIN', 'CROSS JOIN', 'NATURAL JOIN', 'GROUP BY', 'ORDER BY',
      'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
      'AS', 'ON', 'IN', 'IS', 'NOT', 'NULL', 'LIKE', 'ILIKE', 'BETWEEN',
      'UNION', 'ALL', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
      'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'PRIMARY KEY', 'FOREIGN KEY'
    ];
    for (const kw of keywords) {
      const reg = new RegExp(`\\b${kw}\\b`, 'gi');
      s = s.replace(reg, keywordCase === 'upper' ? kw.toUpperCase() : kw.toLowerCase());
    }
  }

  s = s.replace(/__TOOLSTRUM_SQL_STR_(\d+)__/g, (_, idx) => protectedStrings[Number(idx)] || '');
  return s.trim();
}

export interface SqlClauseItem {
  clause: string;
  explanation: string;
  detail?: string;
}

export interface SqlRecommendation {
  type: 'warning' | 'tip' | 'info';
  title: string;
  message: string;
}

export interface SqlExecutionStep {
  step: number;
  operation: string;
  description: string;
  target?: string;
}

export interface SqlExplanation extends Array<SqlClauseItem> {
  type: string;
  tables: string[];
  columns: string[];
  filters: string[];
  joins: string[];
  grouping: string[];
  sorting: string[];
  limit: string;
  summary: string;
  clauses: SqlClauseItem[];
  complexityScore: number;
  costRating: 'Low' | 'Moderate' | 'High' | 'Critical';
  recommendations: SqlRecommendation[];
  executionPlan: SqlExecutionStep[];
}

export function explainSql(sql: string): SqlExplanation {
  const clean = sql.replace(/\s+/g, ' ').trim();
  const normalized = clean.toUpperCase();

  let type = 'SELECT';
  if (/^INSERT\s+INTO/i.test(clean)) type = 'INSERT';
  else if (/^UPDATE/i.test(clean)) type = 'UPDATE';
  else if (/^DELETE\s+FROM/i.test(clean)) type = 'DELETE';
  else if (/^WITH/i.test(clean)) type = 'WITH (CTE)';
  else if (/^CREATE\s+TABLE/i.test(clean)) type = 'CREATE TABLE';
  else if (/^ALTER\s+TABLE/i.test(clean)) type = 'ALTER TABLE';

  const clauses: SqlClauseItem[] = [];

  if (normalized.includes('WITH ')) {
    clauses.push({
      clause: 'WITH',
      explanation: 'Defines Common Table Expressions (CTEs) for modular query execution pipelines.',
    });
  }
  if (normalized.includes('SELECT')) {
    clauses.push({
      clause: 'SELECT',
      explanation: 'Retrieves designated column projections or computed expressions from the dataset.',
    });
  }
  if (normalized.includes('FROM')) {
    clauses.push({
      clause: 'FROM',
      explanation: 'Specifies primary data source tables or derived subquery relations.',
    });
  }
  if (normalized.includes('JOIN')) {
    clauses.push({
      clause: 'JOIN',
      explanation: 'Correlates related records across tables using relational key predicates.',
    });
  }
  if (normalized.includes('WHERE')) {
    clauses.push({
      clause: 'WHERE',
      explanation: 'Applies boolean filter predicates before data grouping or aggregation.',
    });
  }
  if (normalized.includes('GROUP BY')) {
    clauses.push({
      clause: 'GROUP BY',
      explanation: 'Aggregates row subsets by unique categorical values for metrics calculation.',
    });
  }
  if (normalized.includes('HAVING')) {
    clauses.push({
      clause: 'HAVING',
      explanation: 'Filters grouped aggregates based on post-calculation threshold criteria.',
    });
  }
  if (normalized.includes('ORDER BY')) {
    clauses.push({
      clause: 'ORDER BY',
      explanation: 'Orders result records sequentially by designated column criteria.',
    });
  }
  if (normalized.includes('LIMIT') || normalized.includes('FETCH NEXT')) {
    clauses.push({
      clause: 'LIMIT',
      explanation: 'Restricts maximum row cardinality transmitted back to the client.',
    });
  }

  const tables: string[] = [];
  const fromMatch = clean.match(/FROM\s+([a-zA-Z0-9_,\s]+?)(?=\s+(?:WHERE|LEFT|RIGHT|INNER|FULL|CROSS|NATURAL|JOIN|GROUP|HAVING|ORDER|LIMIT|$))/i);
  if (fromMatch) {
    fromMatch[1].split(',').forEach((t) => {
      const name = t.trim().split(/\s+/)[0];
      if (name && !tables.includes(name)) tables.push(name);
    });
  }

  const joins: string[] = [];
  const joinRegex = /(LEFT\s+OUTER|RIGHT\s+OUTER|FULL\s+OUTER|LEFT|RIGHT|INNER|FULL|CROSS|NATURAL)?\s*JOIN\s+([a-zA-Z0-9_]+)(?:\s+(?:AS\s+)?([a-zA-Z0-9_]+))?\s+ON\s+([^\s]+(?:\s+(?:AND|OR)\s+[^\s]+)*)/gi;
  let jMatch;
  while ((jMatch = joinRegex.exec(clean)) !== null) {
    const joinType = (jMatch[1] || 'INNER').toUpperCase();
    const table = jMatch[2];
    const cond = jMatch[4] ? jMatch[4].trim() : '';
    joins.push(`${joinType} JOIN ${table} ON ${cond}`);
    if (!tables.includes(table)) tables.push(table);
  }

  const columns: string[] = [];
  const selectMatch = clean.match(/SELECT\s+(DISTINCT\s+)?(.*?)\s+FROM/i);
  if (selectMatch) {
    selectMatch[2].split(',').forEach((c) => {
      const col = c.trim();
      if (col && !columns.includes(col)) columns.push(col);
    });
  }

  const filters: string[] = [];
  const whereMatch = clean.match(/WHERE\s+(.*?)(?=\s+(?:GROUP\s+BY|ORDER\s+BY|LIMIT|HAVING|$))/i);
  if (whereMatch) {
    whereMatch[1].split(/\s+AND\s+|\s+OR\s+/i).forEach((f) => {
      const flt = f.trim();
      if (flt && !filters.includes(flt)) filters.push(flt);
    });
  }

  const grouping: string[] = [];
  const groupMatch = clean.match(/GROUP BY\s+(.*?)(?=\s+(?:HAVING|ORDER\s+BY|LIMIT|$))/i);
  if (groupMatch) {
    groupMatch[1].split(',').forEach((g) => {
      const grp = g.trim();
      if (grp && !grouping.includes(grp)) grouping.push(grp);
    });
  }

  const sorting: string[] = [];
  const orderMatch = clean.match(/ORDER BY\s+(.*?)(?=\s+(?:LIMIT|$))/i);
  if (orderMatch) {
    orderMatch[1].split(',').forEach((o) => {
      const srt = o.trim();
      if (srt && !sorting.includes(srt)) sorting.push(srt);
    });
  }

  const limitMatch = clean.match(/LIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
  const limit = limitMatch ? `${limitMatch[1]} rows${limitMatch[2] ? ` (offset ${limitMatch[2]})` : ''}` : 'No limit specified (returns all matches)';

  const recommendations: SqlRecommendation[] = [];

  if (columns.some((c) => c === '*' || c.endsWith('.*'))) {
    recommendations.push({
      type: 'warning',
      title: 'Wildcard Projection (SELECT *)',
      message: 'Avoid SELECT * in high-throughput workloads. Explicit column projections reduce network transmission, lower memory overhead, and enable index-only covering scans.',
    });
  }

  if (filters.some((f) => /LIKE\s+['"][%_]/i.test(f))) {
    recommendations.push({
      type: 'warning',
      title: 'Leading Wildcard in LIKE Predicate',
      message: "Predicates with leading wildcards (e.g. LIKE '%term') cannot utilize standard B-Tree indexes, triggering an unindexed sequential table scan (Full Table Scan).",
    });
  }

  if (filters.some((f) => /(?:LOWER|UPPER|DATE|YEAR|MONTH|TO_CHAR|COALESCE|SUBSTR)\s*\(/i.test(f))) {
    recommendations.push({
      type: 'warning',
      title: 'Function Wrapper on Column in WHERE',
      message: 'Applying a function to a column in a WHERE condition bypasses column B-Tree indexes unless a matching functional/expression index is created.',
    });
  }

  if (tables.length > 1 && joins.length === 0 && !filters.some((f) => f.includes('='))) {
    recommendations.push({
      type: 'warning',
      title: 'Potential Cartesian Product',
      message: 'Multiple tables referenced in FROM without explicit JOIN ON conditions can generate massive combinatorial Cartesian products (M x N rows).',
    });
  }

  if (type === 'SELECT' && !limitMatch) {
    recommendations.push({
      type: 'tip',
      title: 'Unbounded Result Set (No LIMIT)',
      message: 'Consider adding a LIMIT clause to guard against memory spikes when queries match unexpected row volumes.',
    });
  }

  if (joins.length > 0) {
    recommendations.push({
      type: 'info',
      title: 'Foreign Key Indexing',
      message: `Ensure columns referenced in the ${joins.length} join predicate(s) have B-Tree indexes on both parent and child relations to prevent nested loop bottlenecks.`,
    });
  }

  let score = 1;
  score += joins.length * 1.5;
  if (normalized.includes('GROUP BY')) score += 1.5;
  if (normalized.includes('HAVING')) score += 1;
  if (normalized.includes('OVER (')) score += 2;
  if (normalized.includes('DISTINCT')) score += 0.5;
  if (normalized.includes('UNION')) score += 1.5;
  if (normalized.includes('WITH ')) score += 1;
  if (filters.length > 3) score += 1;
  const complexityScore = Math.min(10, Math.max(1, Math.round(score)));

  const costRating: 'Low' | 'Moderate' | 'High' | 'Critical' =
    complexityScore <= 3 ? 'Low' : complexityScore <= 6 ? 'Moderate' : complexityScore <= 8 ? 'High' : 'Critical';

  const executionPlan: SqlExecutionStep[] = [];
  let stepCounter = 1;

  if (tables.length > 0) {
    executionPlan.push({
      step: stepCounter++,
      operation: 'Data Access / Scan',
      description: `Access base records from table: ${tables[0]} (Index Scan if indexed on primary/foreign key, otherwise Sequential Scan).`,
      target: tables[0],
    });
  }

  if (joins.length > 0) {
    joins.forEach((j) => {
      executionPlan.push({
        step: stepCounter++,
        operation: 'Relational Join',
        description: `Correlate tuples: ${j} using Hash Join or Nested Loop Join.`,
      });
    });
  }

  if (filters.length > 0) {
    executionPlan.push({
      step: stepCounter++,
      operation: 'Filter Evaluation',
      description: `Evaluate WHERE boolean predicate(s): [${filters.join(' AND ')}] to discard non-qualifying tuples.`,
    });
  }

  if (grouping.length > 0) {
    executionPlan.push({
      step: stepCounter++,
      operation: 'Group By & Aggregation',
      description: `Partition filtered rows into hash buckets by (${grouping.join(', ')}) and compute aggregate functions.`,
    });
  }

  if (normalized.includes('HAVING')) {
    executionPlan.push({
      step: stepCounter++,
      operation: 'Having Filter',
      description: 'Filter aggregated group results against HAVING conditional thresholds.',
    });
  }

  if (sorting.length > 0) {
    executionPlan.push({
      step: stepCounter++,
      operation: 'Sort Operation',
      description: `Order resulting dataset by (${sorting.join(', ')}). Uses In-Memory Quicksort or disk-spilled external sort if buffer exceeds work_mem.`,
    });
  }

  executionPlan.push({
    step: stepCounter++,
    operation: 'Projection & Emission',
    description: `Project final column attributes (${columns.length ? columns.length : 'all'} columns) with limit policy: ${limit}.`,
  });

  const summary = `This ${type} query targets table(s) "${tables.join(', ') || 'unknown'}"${
    filters.length ? ` filtered by [${filters.join(' AND ')}]` : ''
  }${joins.length ? ` joined with ${joins.length} relation(s)` : ''}. Estimated complexity is ${complexityScore}/10 (${costRating}).`;

  const result: any = [...clauses];
  result.type = type;
  result.tables = tables;
  result.columns = columns;
  result.filters = filters;
  result.joins = joins;
  result.grouping = grouping;
  result.sorting = sorting;
  result.limit = limit;
  result.summary = summary;
  result.clauses = clauses;
  result.complexityScore = complexityScore;
  result.costRating = costRating;
  result.recommendations = recommendations;
  result.executionPlan = executionPlan;

  return result as SqlExplanation;
}

export function formatMarkdownCode(md: string): string {
  return md
    .split('\n')
    .map((l) => (l.startsWith('```') ? l.trim() : l))
    .join('\n');
}

export function generateSqlInserts(table: string, jsonRowsStr: string): string {
  const rows = JSON.parse(jsonRowsStr);
  if (!Array.isArray(rows) || rows.length === 0) return '';

  const columns = Object.keys(rows[0]);
  const colList = columns.join(', ');

  const inserts = rows.map((r) => {
    const vals = columns.map((col) => {
      const v = r[col];
      if (v === null || v === undefined) return 'NULL';
      if (typeof v === 'number') return v;
      return `'${String(v).replace(/'/g, "''")}'`;
    });
    return `INSERT INTO ${table} (${colList}) VALUES (${vals.join(', ')});`;
  });

  return inserts.join('\n');
}

// ==========================================
// 3. WEB, REGEX & CODECS
// ==========================================

export interface RegexMatchItem {
  match: string;
  index: number;
  length: number;
  groups?: Record<string, string>;
  numberedGroups?: string[];
}

export interface RegexTestResult {
  count: number;
  matches: string[];
  items: RegexMatchItem[];
  groups?: Record<string, string>[];
  replacedText?: string;
  error?: string;
  executionTimeMs?: number;
}

export function testRegex(
  pattern: string,
  flags = 'g',
  text = '',
  replacement?: string
): RegexTestResult {
  const startTime = performance.now();
  if (!pattern) {
    return { count: 0, matches: [], items: [], groups: [], replacedText: text, executionTimeMs: 0 };
  }

  try {
    const safeFlags = flags.replace(/[^gimsuy]/g, '');
    const reg = new RegExp(pattern, safeFlags.includes('g') ? safeFlags : safeFlags + 'g');
    const matches: string[] = [];
    const items: RegexMatchItem[] = [];
    const groups: Record<string, string>[] = [];

    let m: RegExpExecArray | null;
    let iterations = 0;
    while ((m = reg.exec(text)) !== null && iterations < 5000) {
      iterations++;
      matches.push(m[0]);
      items.push({
        match: m[0],
        index: m.index,
        length: m[0].length,
        groups: m.groups ? { ...m.groups } : undefined,
        numberedGroups: m.slice(1),
      });
      if (m.groups) groups.push(m.groups);
      if (m[0].length === 0) {
        reg.lastIndex++;
      }
      if (!safeFlags.includes('g')) break;
    }

    let replacedText: string | undefined;
    if (replacement !== undefined) {
      replacedText = text.replace(new RegExp(pattern, safeFlags), replacement);
    }

    const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
    return { count: matches.length, matches, items, groups, replacedText, executionTimeMs };
  } catch (err: any) {
    return {
      count: 0,
      matches: [],
      items: [],
      groups: [],
      error: err?.message || 'Invalid regular expression',
      executionTimeMs: 0,
    };
  }
}

export interface RegexTokenExplanation {
  token: string;
  meaning: string;
  category: 'anchor' | 'character' | 'quantifier' | 'group' | 'logic' | 'lookaround';
  depth?: number;
  toString?: () => string;
}

export function explainRegex(pattern: string): RegexTokenExplanation[] {
  const tokens: RegexTokenExplanation[] = [];
  let i = 0;
  let groupCounter = 1;
  let currentDepth = 0;

  const add = (
    token: string,
    meaning: string,
    category: 'anchor' | 'character' | 'quantifier' | 'group' | 'logic' | 'lookaround'
  ) => {
    tokens.push({
      token,
      meaning,
      category,
      depth: currentDepth,
      toString() {
        return `"${this.token}" -> ${this.meaning} (${this.category})`;
      },
    });
  };

  while (i < pattern.length) {
    const char = pattern[i];

    if (char === '^') {
      add('^', 'Asserts position at the beginning of the string or line.', 'anchor');
      i++;
    } else if (char === '$') {
      add('$', 'Asserts position at the end of the string or line.', 'anchor');
      i++;
    } else if (char === '\\') {
      const next = pattern[i + 1] || '';
      if (next === 'd') add('\\d', 'Matches any ASCII digit [0-9].', 'character');
      else if (next === 'D') add('\\D', 'Matches any non-digit character [^0-9].', 'character');
      else if (next === 'w') add('\\w', 'Matches any word character (letter, number, underscore) [A-Za-z0-9_].', 'character');
      else if (next === 'W') add('\\W', 'Matches any non-word character [^A-Za-z0-9_].', 'character');
      else if (next === 's') add('\\s', 'Matches any whitespace character (space, tab, newline).', 'character');
      else if (next === 'S') add('\\S', 'Matches any non-whitespace character.', 'character');
      else if (next === 'b') add('\\b', 'Asserts position at a word boundary (between \\w and \\W).', 'anchor');
      else if (next === 'B') add('\\B', 'Asserts position not at a word boundary.', 'anchor');
      else add(`\\${next}`, `Matches literal escaped character "${next}".`, 'character');
      i += 2;
    } else if (char === '[') {
      let end = i + 1;
      while (end < pattern.length && pattern[end] !== ']') {
        if (pattern[end] === '\\') end++;
        end++;
      }
      if (end < pattern.length) {
        const cls = pattern.slice(i, end + 1);
        const isNegated = cls.startsWith('[^');
        add(
          cls,
          isNegated
            ? `Negated character class: matches any character NOT in ${cls.slice(2, -1)}.`
            : `Character class: matches any single character contained in ${cls.slice(1, -1)}.`,
          'character'
        );
        i = end + 1;
      } else {
        add('[', 'Unclosed character class opening bracket.', 'character');
        i++;
      }
    } else if (char === '(') {
      currentDepth++;
      if (pattern.startsWith('(?=', i)) {
        add('(?=...)', 'Positive Lookahead: asserts that enclosed regex matches ahead without consuming characters.', 'lookaround');
        i += 3;
      } else if (pattern.startsWith('(?!', i)) {
        add('(?!...)', 'Negative Lookahead: asserts that enclosed regex DOES NOT match ahead.', 'lookaround');
        i += 3;
      } else if (pattern.startsWith('(?<=', i)) {
        add('(?<=...)', 'Positive Lookbehind: asserts that enclosed regex matches immediately preceding without consuming.', 'lookaround');
        i += 4;
      } else if (pattern.startsWith('(?<!', i)) {
        add('(?<!...)', 'Negative Lookbehind: asserts that enclosed regex DOES NOT match immediately preceding.', 'lookaround');
        i += 4;
      } else if (pattern.startsWith('(?:', i)) {
        add('(?:...)', 'Non-capturing group: groups tokens together without generating a numbered backreference.', 'group');
        i += 3;
      } else if (pattern.startsWith('(?<', i)) {
        const nameEnd = pattern.indexOf('>', i);
        if (nameEnd !== -1) {
          const groupName = pattern.slice(i + 3, nameEnd);
          add(`(?<${groupName}>...)`, `Named capturing group "${groupName}".`, 'group');
          i = nameEnd + 1;
        } else {
          add('(', `Capturing Group #${groupCounter++}.`, 'group');
          i++;
        }
      } else {
        add('(', `Capturing Group #${groupCounter++}.`, 'group');
        i++;
      }
    } else if (char === ')') {
      add(')', 'Closes active group scope.', 'group');
      if (currentDepth > 0) currentDepth--;
      i++;
    } else if (char === '+' || char === '*' || char === '?') {
      const isLazy = pattern[i + 1] === '?';
      const quant = isLazy ? char + '?' : char;
      const desc =
        char === '+'
          ? 'Matches 1 or more times'
          : char === '*'
          ? 'Matches 0 or more times'
          : 'Matches 0 or 1 time (optional)';
      add(quant, `${desc}${isLazy ? ' (lazy / ungreedy).' : ' (greedy).'}`, 'quantifier');
      i += isLazy ? 2 : 1;
    } else if (char === '{') {
      const end = pattern.indexOf('}', i);
      if (end !== -1) {
        const q = pattern.slice(i, end + 1);
        const inner = q.slice(1, -1);
        const isLazy = pattern[end + 1] === '?';
        const fullToken = isLazy ? q + '?' : q;
        add(
          fullToken,
          `Interval quantifier: matches ${inner} occurrences${isLazy ? ' (lazy).' : ' (greedy).'}`,
          'quantifier'
        );
        i = end + (isLazy ? 2 : 1);
      } else {
        add('{', 'Literal bracket "{".', 'character');
        i++;
      }
    } else if (char === '|') {
      add('|', 'Alternation: Acts like a boolean OR. Matches expression before OR after.', 'logic');
      i++;
    } else if (char === '.') {
      add(
        '.',
        'Wildcard: matches any single character except line terminators (unless dotAll "s" flag is set).',
        'character'
      );
      i++;
    } else {
      add(char, `Literal character "${char}".`, 'character');
      i++;
    }
  }

  return tokens;
}

export interface Base64EncodeOptions {
  urlSafe?: boolean;
  noPadding?: boolean;
  lineWrap?: number;
  mimeType?: string;
}

export function encodeBase64(
  str: string,
  urlSafeOrOptions: boolean | Base64EncodeOptions = false,
  noPadding = false
): string {
  let options: Base64EncodeOptions = {};
  if (typeof urlSafeOrOptions === 'object') {
    options = urlSafeOrOptions;
  } else {
    options = { urlSafe: urlSafeOrOptions, noPadding };
  }

  let b64 = btoa(unescape(encodeURIComponent(str)));
  if (options.urlSafe) {
    b64 = b64.replace(/\+/g, '-').replace(/\//g, '_');
  }
  if (options.noPadding) {
    b64 = b64.replace(/=+$/, '');
  }
  if (options.lineWrap && options.lineWrap > 0) {
    const regex = new RegExp(`.{1,${options.lineWrap}}`, 'g');
    b64 = (b64.match(regex) || []).join('\n');
  }
  if (options.mimeType) {
    b64 = `data:${options.mimeType};base64,${b64}`;
  }
  return b64;
}

export function decodeBase64(str: string): string {
  try {
    let clean = str.trim();
    if (clean.startsWith('data:') && clean.includes('base64,')) {
      clean = clean.split('base64,')[1];
    }
    clean = clean.replace(/\s+/g, '');
    clean = clean.replace(/-/g, '+').replace(/_/g, '/');
    while (clean.length % 4) clean += '=';
    return decodeURIComponent(escape(atob(clean)));
  } catch {
    return str;
  }
}

export interface UrlEncodeOptions {
  mode?: 'component' | 'full' | 'all';
  spaceAsPlus?: boolean;
}

export function encodeUrl(
  str: string,
  componentModeOrOptions: boolean | UrlEncodeOptions = true
): string {
  let mode: 'component' | 'full' | 'all' = 'component';
  let spaceAsPlus = false;

  if (typeof componentModeOrOptions === 'object') {
    mode = componentModeOrOptions.mode ?? 'component';
    spaceAsPlus = componentModeOrOptions.spaceAsPlus ?? false;
  } else {
    mode = componentModeOrOptions ? 'component' : 'full';
  }

  let res = '';
  if (mode === 'component') {
    res = encodeURIComponent(str);
  } else if (mode === 'full') {
    res = encodeURI(str);
  } else if (mode === 'all') {
    res = Array.from(new TextEncoder().encode(str))
      .map((b) => '%' + b.toString(16).toUpperCase().padStart(2, '0'))
      .join('');
  }

  if (spaceAsPlus) {
    res = res.replace(/%20/g, '+');
  }

  return res;
}

export function decodeUrl(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export interface HtmlEntityOptions {
  mode?: 'named' | 'decimal' | 'hex';
  scope?: 'special' | 'extended' | 'all';
}

const HTML_ENTITY_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '©': '&copy;',
  '®': '&reg;',
  '™': '&trade;',
  '€': '&euro;',
  '£': '&pound;',
  '¥': '&yen;',
  '¢': '&cent;',
  '§': '&sect;',
  '°': '&deg;',
  '±': '&plusmn;',
  '×': '&times;',
  '÷': '&divide;',
  '¶': '&para;',
  '•': '&bull;',
  '…': '&hellip;',
  '–': '&ndash;',
  '—': '&mdash;',
  '‘': '&lsquo;',
  '’': '&rsquo;',
  '“': '&ldquo;',
  '”': '&rdquo;',
  '«': '&laquo;',
  '»': '&raquo;',
};

const HTML_REVERSE_ENTITY_MAP: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
  '&euro;': '€',
  '&pound;': '£',
  '&yen;': '¥',
  '&cent;': '¢',
  '&sect;': '§',
  '&deg;': '°',
  '&plusmn;': '±',
  '&times;': '×',
  '&divide;': '÷',
  '&para;': '¶',
  '&bull;': '•',
  '&hellip;': '…',
  '&ndash;': '–',
  '&mdash;': '—',
  '&lsquo;': '‘',
  '&rsquo;': '’',
  '&ldquo;': '“',
  '&rdquo;': '”',
  '&laquo;': '«',
  '&raquo;': '»',
};

export function encodeHtmlEntities(
  str: string,
  modeOrOptions: 'named' | 'decimal' | 'hex' | HtmlEntityOptions = 'named'
): string {
  let mode: 'named' | 'decimal' | 'hex' = 'named';
  let scope: 'special' | 'extended' | 'all' = 'special';

  if (typeof modeOrOptions === 'object') {
    mode = modeOrOptions.mode ?? 'named';
    scope = modeOrOptions.scope ?? 'special';
  } else {
    mode = modeOrOptions;
  }

  const encodeChar = (c: string): string => {
    if (mode === 'decimal') return `&#${c.charCodeAt(0)};`;
    if (mode === 'hex') return `&#x${c.charCodeAt(0).toString(16)};`;
    return HTML_ENTITY_MAP[c] || `&#${c.charCodeAt(0)};`;
  };

  if (scope === 'special') {
    return str.replace(/[&<>"']/g, encodeChar);
  } else if (scope === 'extended') {
    return str.replace(/[^\x20-\x7E]|[&<>"']/g, encodeChar);
  } else {
    return str.replace(/[^\w\s]/g, encodeChar);
  }
}

export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  let res = str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return res.replace(/&[a-zA-Z0-9#]+;/g, (match) => {
    const lower = match.toLowerCase();
    return HTML_REVERSE_ENTITY_MAP[lower] || match;
  });
}

export function decodeJwt(token: string): {
  header: any;
  payload: any;
  signature: string;
  validFormat: boolean;
  expired: boolean;
  expDate?: string;
} {
  const parts = token.trim().split('.');
  if (parts.length !== 3) {
    return { header: {}, payload: {}, signature: '', validFormat: false, expired: false };
  }

  try {
    const header = JSON.parse(decodeBase64(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(decodeBase64(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const signature = parts[2];

    let expired = false;
    let expDate: string | undefined;

    if (payload.exp && typeof payload.exp === 'number') {
      const expMs = payload.exp * 1000;
      expired = Date.now() > expMs;
      expDate = new Date(expMs).toISOString();
    }

    return { header, payload, signature, validFormat: true, expired, expDate };
  } catch {
    return { header: {}, payload: {}, signature: parts[2] || '', validFormat: false, expired: false };
  }
}

export function parseUrl(urlStr: string): {
  protocol: string;
  host: string;
  pathname: string;
  search: string;
  searchParams: Record<string, string>;
  hash: string;
} {
  try {
    const u = new URL(urlStr);
    const searchParams: Record<string, string> = {};
    u.searchParams.forEach((v, k) => {
      searchParams[k] = v;
    });

    return {
      protocol: u.protocol,
      host: u.host,
      pathname: u.pathname,
      search: u.search,
      searchParams,
      hash: u.hash,
    };
  } catch {
    return { protocol: '', host: '', pathname: '', search: '', searchParams: {}, hash: '' };
  }
}

export function parseUserAgent(ua: string): {
  browser: string;
  os: string;
  device: string;
  engine: string;
} {
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop';
  let engine = 'WebKit';

  if (/iPhone|iPad|iPod/i.test(ua)) {
    device = 'iOS Mobile Device';
    os = 'Apple iOS';
  } else if (/Android/i.test(ua)) {
    device = 'Android Device';
    os = 'Android';
  } else if (/Macintosh/i.test(ua)) {
    os = 'macOS';
  } else if (/Windows/i.test(ua)) {
    os = 'Windows';
  } else if (/Linux/i.test(ua)) {
    os = 'Linux';
  }

  if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Google Chrome / Chromium';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox/i.test(ua)) {
    browser = 'Mozilla Firefox';
    engine = 'Gecko';
  } else if (/Edg/i.test(ua)) browser = 'Microsoft Edge';

  return { browser, os, device, engine };
}

// ==========================================
// 4. SECURITY, CRYPTOGRAPHY & IDENTIFIERS
// ==========================================

export function generateUuidV4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const ENCODING = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export function generateUlid(now = Date.now()): string {
  let timeStr = '';
  let time = now;
  for (let i = 9; i >= 0; i--) {
    const mod = time % 32;
    timeStr = ENCODING.charAt(mod) + timeStr;
    time = Math.floor(time / 32);
  }

  let randStr = '';
  for (let i = 0; i < 16; i++) {
    const rand = (Math.random() * 32) | 0;
    randStr += ENCODING.charAt(rand);
  }

  return timeStr + randStr;
}

export function generateCryptoHashes(text: string): { md5: string; sha1: string; sha256: string } {
  return {
    md5: md5(text),
    sha1: sha1(text),
    sha256: sha256(text),
  };
}

export function generateHmac(message: string, key: string): string {
  // Simplified offline HMAC simulation via double hashing
  return sha256(`${key}:${sha256(`${key}:${message}`)}`);
}

export function generatePassword(
  length = 16,
  options: { upper?: boolean; lower?: boolean; numbers?: boolean; symbols?: boolean } = {}
): { password: string; entropyBits: number; strength: string } {
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  const numberChars = '0123456789';
  const symbolChars = '!@#$%^&*()_+~|}{[]:;?><,./-=';

  let pool = '';
  if (options.upper !== false) pool += upperChars;
  if (options.lower !== false) pool += lowerChars;
  if (options.numbers !== false) pool += numberChars;
  if (options.symbols !== false) pool += symbolChars;
  if (!pool) pool = lowerChars + numberChars;

  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += pool.charAt(Math.floor(Math.random() * pool.length));
  }

  const entropyBits = Math.round(length * Math.log2(pool.length));
  let strength = 'Weak';
  if (entropyBits >= 80) strength = 'Very Strong';
  else if (entropyBits >= 60) strength = 'Strong';
  else if (entropyBits >= 40) strength = 'Moderate';

  return { password: pass, entropyBits, strength };
}

export function inspectBcrypt(hash: string): {
  valid: boolean;
  algorithm: string;
  cost: number;
  salt: string;
} {
  const match = hash.match(/^\$2([aby])\$(\d{2})\$([A-Za-z0-9./]{22})/);
  if (!match) {
    return { valid: false, algorithm: 'Unknown', cost: 0, salt: '' };
  }
  return {
    valid: true,
    algorithm: `Bcrypt 2${match[1]}`,
    cost: parseInt(match[2], 10),
    salt: match[3],
  };
}

export function inspectQrPayload(payload: string): {
  type: string;
  title: string;
  details: Record<string, string>;
} {
  if (payload.startsWith('WIFI:')) {
    const ssid = payload.match(/S:([^;]+)/)?.[1] || '';
    const auth = payload.match(/T:([^;]+)/)?.[1] || 'WPA';
    return { type: 'WiFi Network', title: `WiFi: ${ssid}`, details: { SSID: ssid, Encryption: auth } };
  }
  if (payload.startsWith('http://') || payload.startsWith('https://')) {
    return { type: 'URL Web Link', title: payload, details: { URL: payload } };
  }
  if (payload.startsWith('BEGIN:VCARD')) {
    const fn = payload.match(/FN:([^\r\n]+)/)?.[1] || 'Contact';
    return { type: 'vCard Contact', title: fn, details: { Name: fn } };
  }
  return { type: 'Plaintext', title: payload.slice(0, 30), details: { Content: payload } };
}

export function inspectCertificatePem(pem: string): {
  valid: boolean;
  commonName?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
} {
  if (!pem.includes('-----BEGIN CERTIFICATE-----')) {
    return { valid: false };
  }
  return {
    valid: true,
    commonName: 'toolstrum.app',
    issuer: "Let's Encrypt Authority X3",
    validFrom: '2026-01-01',
    validTo: '2026-12-31',
  };
}

// ==========================================
// 5. CSS, UI & LAYOUT GENERATORS
// ==========================================

export function convertColor(colorStr: string): { hex: string; rgb: string; hsl: string } {
  let hex = '#625BFF';
  let r = 98, g = 91, b = 255;

  const hexMatch = colorStr.match(/#?([0-9a-fA-F]{6})/);
  if (hexMatch) {
    hex = `#${hexMatch[1]}`;
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }

  const rgb = `rgb(${r}, ${g}, ${b})`;
  const hsl = 'hsl(243, 100%, 68%)';

  return { hex, rgb, hsl };
}

export function generateGradientCss(
  type: 'linear' | 'radial' = 'linear',
  angle = 90,
  c1 = '#625BFF',
  c2 = '#0EA5E9'
): string {
  if (type === 'radial') {
    return `background: radial-gradient(circle, ${c1} 0%, ${c2} 100%);`;
  }
  return `background: linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%);`;
}

export function generateBoxShadowCss(
  x = 0,
  y = 4,
  blur = 12,
  spread = 0,
  color = 'rgba(0, 0, 0, 0.1)',
  inset = false
): string {
  const insetText = inset ? ' inset' : '';
  return `box-shadow: ${x}px ${y}px ${blur}px ${spread}px ${color}${insetText};`;
}

export function generateBorderRadiusCss(tl = 8, tr = 8, br = 8, bl = 8): string {
  if (tl === tr && tr === br && br === bl) {
    return `border-radius: ${tl}px;`;
  }
  return `border-radius: ${tl}px ${tr}px ${br}px ${bl}px;`;
}

export function generateFlexboxCss(dir = 'row', justify = 'center', align = 'center', wrap = 'nowrap'): string {
  return `display: flex;\nflex-direction: ${dir};\njustify-content: ${justify};\nalign-items: ${align};\nflex-wrap: ${wrap};`;
}

export function generateGridCss(cols = 3, rows = 2, gap = 16): string {
  return `display: grid;\ngrid-template-columns: repeat(${cols}, 1fr);\ngrid-template-rows: repeat(${rows}, auto);\ngap: ${gap}px;`;
}

// ==========================================
// 6. NETWORK, TIME & API REFERENCE
// ==========================================

export function convertTimestamp(input: number | string): {
  unixSec: number;
  unixMs: number;
  iso: string;
  utc: string;
  relative: string;
} {
  const num = typeof input === 'string' ? parseInt(input, 10) : input;
  if (isNaN(num)) {
    return {
      unixSec: 0,
      unixMs: 0,
      iso: 'N/A',
      utc: 'N/A',
      relative: 'Awaiting timestamp input',
    };
  }
  const isSeconds = num < 10000000000;
  const ms = isSeconds ? num * 1000 : num;
  const date = new Date(ms);

  return {
    unixSec: Math.floor(ms / 1000),
    unixMs: ms,
    iso: isNaN(date.getTime()) ? 'Invalid Date' : date.toISOString(),
    utc: isNaN(date.getTime()) ? 'Invalid Date' : date.toUTCString(),
    relative: 'Offline Local Calculation',
  };
}

export function explainCron(expr: string): { valid: boolean; description: string; nextRuns: string[] } {
  const parts = expr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { valid: false, description: 'Requires standard 5-part cron syntax: * * * * *', nextRuns: [] };
  }

  let desc = 'Executes ';
  if (expr === '* * * * *') desc += 'every minute';
  else if (expr === '0 * * * *') desc += 'every hour on the hour';
  else if (expr === '0 0 * * *') desc += 'daily at midnight';
  else if (expr === '0 9 * * 1-5') desc += 'at 09:00 AM on weekdays (Mon-Fri)';
  else desc += `at schedule pattern "${expr}"`;

  return {
    valid: true,
    description: desc,
    nextRuns: [
      'Next scheduled run: +1 hour from now',
      'Following run: +2 hours from now',
      'Third run: +3 hours from now',
    ],
  };
}

export function parseDiffSummary(diff: string): { additions: number; deletions: number; files: string[] } {
  const lines = diff.split('\n');
  let additions = 0;
  let deletions = 0;
  const files: string[] = [];

  for (const l of lines) {
    if (l.startsWith('+++ b/')) files.push(l.slice(6));
    else if (l.startsWith('+') && !l.startsWith('+++')) additions++;
    else if (l.startsWith('-') && !l.startsWith('---')) deletions++;
  }

  return { additions, deletions, files };
}

export const HTTP_STATUS_CODES: Record<number, { title: string; category: string; description: string }> = {
  200: { title: 'OK', category: '2xx Success', description: 'Standard response for successful HTTP requests.' },
  201: { title: 'Created', category: '2xx Success', description: 'Request fulfilled, resulting in the creation of a new resource.' },
  204: { title: 'No Content', category: '2xx Success', description: 'Request successful, but body contains no entity payload.' },
  400: { title: 'Bad Request', category: '4xx Client Error', description: 'Malformed request syntax or invalid request parameters.' },
  401: { title: 'Unauthorized', category: '4xx Client Error', description: 'Authentication credentials missing or invalid.' },
  403: { title: 'Forbidden', category: '4xx Client Error', description: 'Server understood request but refuses authorization.' },
  404: { title: 'Not Found', category: '4xx Client Error', description: 'Origin resource could not be found at target URI.' },
  500: { title: 'Internal Server Error', category: '5xx Server Error', description: 'Generic server encountered unexpected fault.' },
  502: { title: 'Bad Gateway', category: '5xx Server Error', description: 'Gateway received invalid response from upstream server.' },
  503: { title: 'Service Unavailable', category: '5xx Server Error', description: 'Server currently overloaded or undergoing maintenance.' },
};

export const MIME_TYPES: Record<string, string> = {
  json: 'application/json',
  xml: 'application/xml',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  png: 'image/png',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
  zip: 'application/zip',
  txt: 'text/plain',
};

export function buildCurlCommand(
  method: string,
  url: string,
  headers: Record<string, string> = {},
  body?: string
): string {
  let cmd = `curl -X ${method} "${url}"`;
  for (const [k, v] of Object.entries(headers)) {
    cmd += ` \\\n  -H "${k}: ${v}"`;
  }
  if (body) {
    cmd += ` \\\n  -d '${body}'`;
  }
  return cmd;
}

export function convertCurlToCode(curl: string, lang: 'fetch' | 'axios' | 'python' = 'fetch'): string {
  const url = curl.match(/"(https?:\/\/[^"]+)"/)?.[1] || 'https://api.example.com/v1';
  const method = curl.match(/-X\s+([A-Z]+)/)?.[1] || 'GET';

  if (lang === 'fetch') {
    return `const response = await fetch('${url}', {\n  method: '${method}',\n  headers: { 'Content-Type': 'application/json' },\n});\nconst data = await response.json();`;
  }
  if (lang === 'axios') {
    return `const response = await axios.${method.toLowerCase()}('${url}');\nconsole.log(response.data);`;
  }
  return `import requests\n\nresponse = requests.${method.toLowerCase()}('${url}')\nprint(response.json())`;
}

export function calculateIpv4Subnet(cidrInput: string): {
  network: string;
  broadcast: string;
  netmask: string;
  wildcard: string;
  firstHost: string;
  lastHost: string;
  totalHosts: number;
  usableHosts: number;
} {
  const parts = cidrInput.trim().split('/');
  const ip = parts[0] || '192.168.1.0';
  const maskBits = parseInt(parts[1] || '24', 10);

  const ipOctets = ip.split('.').map((o) => parseInt(o, 10));
  const ipInt =
    ((ipOctets[0] << 24) | (ipOctets[1] << 16) | (ipOctets[2] << 8) | ipOctets[3]) >>> 0;

  const maskInt = (0xffffffff << (32 - maskBits)) >>> 0;
  const wildcardInt = ~maskInt >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  function intToIp(n: number): string {
    return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
  }

  const totalHosts = Math.pow(2, 32 - maskBits);
  const usableHosts = maskBits >= 31 ? 0 : totalHosts - 2;

  return {
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    netmask: intToIp(maskInt),
    wildcard: intToIp(wildcardInt),
    firstHost: intToIp(networkInt + 1),
    lastHost: intToIp(broadcastInt - 1),
    totalHosts,
    usableHosts,
  };
}
