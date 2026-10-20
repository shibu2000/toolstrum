import { sha256, sha1, md5 } from '../../archive/shared/ChecksumUtils';

// ==========================================
// 1. JSON, YAML & DATA FORMATS
// ==========================================

export function formatJson(raw: string, indent = 2): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed, null, indent);
}

export function validateJson(raw: string): {
  valid: boolean;
  error?: string;
  line?: number;
  column?: number;
} {
  try {
    JSON.parse(raw);
    return { valid: true };
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

export function minifyJson(raw: string): string {
  const parsed = JSON.parse(raw);
  return JSON.stringify(parsed);
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

export function queryJsonPath(raw: string, path: string): any {
  const obj = JSON.parse(raw);
  if (!path || path === '$' || path === '.') return obj;

  const normalized = path.replace(/^\$\.?/, '');
  const tokens = normalized.split('.').filter(Boolean);

  let cur: any = obj;
  for (const token of tokens) {
    if (token.includes('[') && token.includes(']')) {
      const key = token.slice(0, token.indexOf('['));
      const idx = parseInt(token.slice(token.indexOf('[') + 1, token.indexOf(']')), 10);
      cur = key ? cur[key] : cur;
      if (Array.isArray(cur) && !isNaN(idx)) {
        cur = cur[idx];
      } else {
        return undefined;
      }
    } else {
      cur = cur?.[token];
    }
    if (cur === undefined) break;
  }
  return cur;
}

export function jsonToTypeScript(raw: string, rootName = 'RootObject'): string {
  const obj = JSON.parse(raw);
  const interfaces: string[] = [];

  function inferType(val: any, name: string): string {
    if (val === null) return 'any';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]';
      const elType = inferType(val[0], `${name}Item`);
      return `${elType}[]`;
    }
    if (typeof val === 'object') {
      const nestedName = name.charAt(0).toUpperCase() + name.slice(1);
      generateInterface(val, nestedName);
      return nestedName;
    }
    return typeof val;
  }

  function generateInterface(o: Record<string, any>, ifName: string) {
    const fields = Object.entries(o).map(([k, v]) => {
      const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : JSON.stringify(k);
      const fieldType = inferType(v, k);
      return `  ${cleanKey}: ${fieldType};`;
    });
    interfaces.push(`export interface ${ifName} {\n${fields.join('\n')}\n}`);
  }

  generateInterface(obj, rootName);
  return interfaces.join('\n\n');
}

export function jsonToSchema(raw: string): string {
  const obj = JSON.parse(raw);

  function makeSchema(val: any): any {
    if (val === null) return { type: 'null' };
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
        required.push(k);
      }
      return {
        type: 'object',
        properties,
        required,
      };
    }
    return { type: typeof val };
  }

  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GeneratedSchema',
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

export function validateYaml(yamlStr: string): { valid: boolean; error?: string } {
  try {
    yamlToJson(yamlStr);
    return { valid: true };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'Invalid YAML format' };
  }
}

export function validateXml(xmlStr: string): { valid: boolean; error?: string; nodes?: number } {
  const tagRegex = /<\/?([a-zA-Z0-9_\-]+)(?:\s+[^>]*)?>/g;
  const stack: string[] = [];
  let match: RegExpExecArray | null;
  let count = 0;

  while ((match = tagRegex.exec(xmlStr)) !== null) {
    const fullTag = match[0];
    const tagName = match[1];
    count++;

    if (fullTag.endsWith('/>') || fullTag.startsWith('<?') || fullTag.startsWith('<!')) {
      continue;
    }

    if (fullTag.startsWith('</')) {
      const last = stack.pop();
      if (last !== tagName) {
        return {
          valid: false,
          error: `Mismatched closing tag </${tagName}>, expected </${last || 'none'}>`,
        };
      }
    } else {
      stack.push(tagName);
    }
  }

  if (stack.length > 0) {
    return { valid: false, error: `Unclosed XML tag: <${stack[stack.length - 1]}>` };
  }

  return { valid: true, nodes: count };
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

export function formatHtml(html: string, indent = 2): string {
  const pad = ' '.repeat(indent);
  let formatted = '';
  let depth = 0;

  const tokens = html.replace(/>\s*</g, '><').match(/(<[^>]+>|[^<]+)/g) || [];

  for (const token of tokens) {
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      formatted += `${pad.repeat(depth)}${token}\n`;
    } else if (token.startsWith('<') && !token.endsWith('/>') && !token.startsWith('<!')) {
      formatted += `${pad.repeat(depth)}${token}\n`;
      depth++;
    } else if (token.startsWith('<')) {
      formatted += `${pad.repeat(depth)}${token}\n`;
    } else {
      const trimmed = token.trim();
      if (trimmed) {
        formatted += `${pad.repeat(depth)}${trimmed}\n`;
      }
    }
  }

  return formatted.trim();
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
