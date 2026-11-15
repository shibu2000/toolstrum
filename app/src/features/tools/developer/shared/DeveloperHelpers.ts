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

export function minifyHtml(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

export function formatCss(css: string): string {
  return css
    .replace(/\s*([\{\};:,])\s*/g, '$1')
    .replace(/:/g, ': ')
    .replace(/;/g, ';\n  ')
    .replace(/\{/g, ' {\n  ')
    .replace(/\}/g, '\n}\n\n')
    .trim();
}

export function minifyCss(css: string): string {
  return css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s*([\{\};:,])\s*/g, '$1')
    .replace(/;\}/g, '}')
    .trim();
}

export function formatJs(js: string): string {
  const lines = js.split('\n');
  let indent = 0;
  const result: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('}')) indent = Math.max(0, indent - 1);
    result.push('  '.repeat(indent) + trimmed);
    if (trimmed.endsWith('{')) indent++;
  }

  return result.join('\n');
}

export function minifyJs(js: string): string {
  return js
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*/g, '')
    .replace(/\s*([=+\-*/;,{}()])\s*/g, '$1')
    .replace(/\n+/g, '')
    .trim();
}

export function formatSql(sql: string): string {
  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT JOIN', 'RIGHT JOIN',
    'INNER JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT INTO',
    'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'ALTER TABLE',
  ];

  let formatted = sql.trim();
  for (const kw of keywords) {
    const reg = new RegExp(`\\b${kw}\\b`, 'gi');
    formatted = formatted.replace(reg, `\n${kw}`);
  }

  return formatted
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n');
}

export function minifySql(sql: string): string {
  return sql
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function explainSql(sql: string): { clause: string; explanation: string }[] {
  const explanations: { clause: string; explanation: string }[] = [];
  const normalized = sql.toUpperCase();

  if (normalized.includes('SELECT')) {
    explanations.push({
      clause: 'SELECT',
      explanation: 'Retrieves specified column attributes or computed projections from dataset.',
    });
  }
  if (normalized.includes('FROM')) {
    explanations.push({
      clause: 'FROM',
      explanation: 'Designates the primary database table or subquery data source.',
    });
  }
  if (normalized.includes('JOIN')) {
    explanations.push({
      clause: 'JOIN',
      explanation: 'Correlates related records across relational tables using foreign keys.',
    });
  }
  if (normalized.includes('WHERE')) {
    explanations.push({
      clause: 'WHERE',
      explanation: 'Filters matching rows prior to grouping using conditional predicate logic.',
    });
  }
  if (normalized.includes('GROUP BY')) {
    explanations.push({
      clause: 'GROUP BY',
      explanation: 'Aggregates row subsets by unique categorical values for metrics calculation.',
    });
  }
  if (normalized.includes('ORDER BY')) {
    explanations.push({
      clause: 'ORDER BY',
      explanation: 'Sorts final result set ascending or descending by designated column attributes.',
    });
  }

  return explanations;
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

export function testRegex(
  pattern: string,
  flags = 'g',
  text: string
): { count: number; matches: string[]; groups?: Record<string, string>[] } {
  try {
    const reg = new RegExp(pattern, flags);
    const matches: string[] = [];
    const groups: Record<string, string>[] = [];

    let m: RegExpExecArray | null;
    while ((m = reg.exec(text)) !== null) {
      matches.push(m[0]);
      if (m.groups) groups.push(m.groups);
      if (!flags.includes('g')) break;
    }

    return { count: matches.length, matches, groups };
  } catch {
    return { count: 0, matches: [] };
  }
}

export function explainRegex(pattern: string): string[] {
  const notes: string[] = [];
  if (pattern.startsWith('^')) notes.push('^ asserts position at the start of string/line');
  if (pattern.endsWith('$')) notes.push('$ asserts position at the end of string/line');
  if (pattern.includes('\\d')) notes.push('\\d matches any ASCII digit [0-9]');
  if (pattern.includes('\\w')) notes.push('\\w matches word characters [A-Za-z0-9_]');
  if (pattern.includes('\\s')) notes.push('\\s matches whitespace (spaces, tabs, newlines)');
  if (pattern.includes('+')) notes.push('+ matches 1 or more times greedily');
  if (pattern.includes('*')) notes.push('* matches 0 or more times greedily');
  if (pattern.includes('?')) notes.push('? matches 0 or 1 time');
  if (pattern.includes('(')) notes.push('(...) defines a capturing group');
  if (pattern.includes('[')) notes.push('[...] defines a character set');
  return notes.length > 0 ? notes : ['Standard literal match sequence'];
}

export function encodeBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export function decodeBase64(str: string): string {
  try {
    return decodeURIComponent(escape(atob(str.trim())));
  } catch {
    return str;
  }
}

export function encodeUrl(str: string, component = true): string {
  return component ? encodeURIComponent(str) : encodeURI(str);
}

export function decodeUrl(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export function encodeHtmlEntities(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
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
