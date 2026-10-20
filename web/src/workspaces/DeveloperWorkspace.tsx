import React, { useState, useEffect } from 'react';
import {
  Code,
  FileCode,
  Play,
  Copy,
  Check,
  X,
  RefreshCw,
  ShieldCheck,
  Hash,
  Clock,
  Layers,
  Sparkles,
  Download,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface DeveloperWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const DeveloperWorkspace: React.FC<DeveloperWorkspaceProps> = ({
  toolId,
  accentColor = '#0EA5E9',
}) => {
  // Determine mode based on registry toolId:
  const getInitialTab = () => {
    if (toolId >= 244 && toolId <= 250) return 'json';
    if (toolId >= 251 && toolId <= 264) return 'code';
    if (toolId === 265 || toolId === 266) return 'regex';
    if (toolId >= 267 && toolId <= 272) return 'codec';
    if (toolId >= 273 && toolId <= 279) return 'security';
    if (toolId >= 280 && toolId <= 285) return 'css';
    if (toolId >= 286 && toolId <= 300) return 'system';
    return 'json';
  };

  const [activeTab, setActiveTab] = useState<'json' | 'code' | 'regex' | 'codec' | 'security' | 'css' | 'system'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // Common Notification State
  const [copied, setCopied] = useState(false);
  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // 1. JSON TOOLS (FORMATTER, VALIDATOR, DIFF, PATH, TO TS, SCHEMA) — all auto-compute live, no run button
  // ==========================================
  const [jsonInput, setJsonInput] = useState(
    '{\n  "appName": "Toolstrum",\n  "offline": true,\n  "version": 1,\n  "tools": [\n    "PDF",\n    "Image",\n    "Developer"\n  ]\n}'
  );

  const parseJson = (text: string): { value: any; error: string } => {
    try {
      return { value: JSON.parse(text), error: '' };
    } catch (e: any) {
      return { value: undefined, error: `Invalid JSON: ${e.message}` };
    }
  };

  const generateTsInterface = (obj: any, name: string = 'RootInterface'): string => {
    const lines = [`export interface ${name} {`];
    for (const [k, v] of Object.entries(obj)) {
      let type: string = typeof v;
      if (v === null) type = 'null';
      else if (Array.isArray(v)) type = v.length > 0 ? `${typeof v[0]}[]` : 'any[]';
      else if (typeof v === 'object') type = 'Record<string, any>';
      lines.push(`  ${k}: ${type};`);
    }
    lines.push('}');
    return lines.join('\n');
  };

  const inferJsonSchema = (value: any): any => {
    if (value === null) return { type: 'null' };
    if (Array.isArray(value)) return { type: 'array', items: value.length ? inferJsonSchema(value[0]) : {} };
    switch (typeof value) {
      case 'string': return { type: 'string' };
      case 'number': return { type: 'number' };
      case 'boolean': return { type: 'boolean' };
      case 'object': {
        const properties: Record<string, any> = {};
        const required: string[] = [];
        for (const [k, v] of Object.entries(value)) {
          properties[k] = inferJsonSchema(v);
          required.push(k);
        }
        return { type: 'object', properties, required };
      }
      default: return {};
    }
  };

  // JSON Diff
  const [jsonDiffLeft, setJsonDiffLeft] = useState('{\n  "name": "Toolstrum",\n  "version": 1\n}');
  const [jsonDiffRight, setJsonDiffRight] = useState('{\n  "name": "Toolstrum Pro",\n  "version": 2\n}');

  const diffJsonObjects = (a: any, b: any, path = ''): { path: string; type: 'added' | 'removed' | 'changed'; left?: any; right?: any }[] => {
    const results: { path: string; type: 'added' | 'removed' | 'changed'; left?: any; right?: any }[] = [];
    const isObj = (v: any) => v !== null && typeof v === 'object';
    if (!isObj(a) || !isObj(b)) {
      if (JSON.stringify(a) !== JSON.stringify(b)) results.push({ path: path || '(root)', type: 'changed', left: a, right: b });
      return results;
    }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const childPath = path ? `${path}.${key}` : key;
      if (!(key in a)) results.push({ path: childPath, type: 'added', right: b[key] });
      else if (!(key in b)) results.push({ path: childPath, type: 'removed', left: a[key] });
      else if (isObj(a[key]) && isObj(b[key])) results.push(...diffJsonObjects(a[key], b[key], childPath));
      else if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) results.push({ path: childPath, type: 'changed', left: a[key], right: b[key] });
    }
    return results;
  };

  // JSON Path Tester
  const [jsonPathQuery, setJsonPathQuery] = useState('tools[0]');

  const evaluateJsonPath = (root: any, path: string): { value: any; error: string } => {
    try {
      const clean = path.trim().replace(/^\$\.?/, '');
      if (!clean) return { value: root, error: '' };
      const tokens = clean.match(/[^.[\]]+/g) || [];
      let current = root;
      for (const token of tokens) {
        if (current === undefined || current === null) throw new Error(`Path stops at a null/undefined value before "${token}"`);
        current = /^\d+$/.test(token) ? current[Number(token)] : current[token];
      }
      return { value: current, error: '' };
    } catch (e: any) {
      return { value: undefined, error: e.message };
    }
  };

  // ==========================================
  // 2. CODE FORMATTERS (SQL, HTML, CSS, JS)
  // ==========================================
  const [codeInput, setCodeInput] = useState(
    'SELECT u.id, u.name, o.total FROM users u JOIN orders o ON u.id = o.user_id WHERE o.status = "completed" ORDER BY o.total DESC;'
  );
  const [codeLang, setCodeLang] = useState<'sql' | 'html' | 'css'>('sql');
  const [codeOutput, setCodeOutput] = useState('');
  const [codeHasRun, setCodeHasRun] = useState(false);

  const handleFormatCode = () => {
    let formatted = codeInput.trim();
    if (codeLang === 'sql') {
      const keywords = ['SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT JOIN', 'INNER JOIN', 'ON', 'GROUP BY', 'ORDER BY', 'LIMIT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM'];
      keywords.forEach((kw) => {
        const reg = new RegExp(`\\b${kw}\\b`, 'gi');
        formatted = formatted.replace(reg, `\n${kw}`);
      });
      formatted = formatted.trim();
    } else if (codeLang === 'html') {
      formatted = codeInput.replace(/></g, '>\n<');
    } else if (codeLang === 'css') {
      formatted = codeInput.replace(/\{/g, ' {\n  ').replace(/;/g, ';\n  ').replace(/\}/g, '\n}\n');
    }
    setCodeOutput(formatted);
    setCodeHasRun(true);
  };

  // ==========================================
  // 3. REGEX TESTER
  // ==========================================
  const [regexPattern, setRegexPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [regexFlags, setRegexFlags] = useState('g');
  const [regexText, setRegexText] = useState('Contact hello@toolstrum.app or support@toolstrum.app for assistance.');
  const [regexMatches, setRegexMatches] = useState<string[]>([]);
  const [regexHasRun, setRegexHasRun] = useState(false);
  const [regexError, setRegexError] = useState('');

  const handleTestRegex = () => {
    setRegexError('');
    try {
      const reg = new RegExp(regexPattern, regexFlags);
      const matches = Array.from(regexText.matchAll(reg)).map((m) => m[0]);
      setRegexMatches(matches);
      setRegexHasRun(true);
    } catch (e: any) {
      setRegexError(`Regex error: ${e.message}`);
      setRegexHasRun(false);
    }
  };

  // ==========================================
  // 4. CODECS (BASE64, URL, HTML ENTITY)
  // ==========================================
  const [codecInput, setCodecInput] = useState('Toolstrum Offline Suite & Tools');
  const [codecOutput, setCodecOutput] = useState('');
  const [codecHasRun, setCodecHasRun] = useState(false);
  const [codecError, setCodecError] = useState('');

  const handleBase64Encode = () => {
    setCodecError('');
    try {
      setCodecOutput(btoa(unescape(encodeURIComponent(codecInput))));
      setCodecHasRun(true);
    } catch (e: any) {
      setCodecError(`Encoding error: ${e.message}`);
    }
  };

  const handleBase64Decode = () => {
    setCodecError('');
    try {
      setCodecOutput(decodeURIComponent(escape(atob(codecInput))));
      setCodecHasRun(true);
    } catch (e: any) {
      setCodecError(`Decoding error: ${e.message}`);
    }
  };

  const handleUrlEncode = () => {
    setCodecError('');
    setCodecOutput(encodeURIComponent(codecInput));
    setCodecHasRun(true);
  };

  const handleUrlDecode = () => {
    setCodecError('');
    try {
      setCodecOutput(decodeURIComponent(codecInput));
      setCodecHasRun(true);
    } catch (e: any) {
      setCodecError(`URL decode error: ${e.message}`);
    }
  };

  // ==========================================
  // 5. SECURITY & TOKENS (JWT, HASH, UUID)
  // ==========================================
  const [jwtString, setJwtString] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIERldiIsImFkbWluIjp0cnVlLCJpYXQiOjE3MDQxNDQwMDB9.signature'
  );
  const [secOutput, setSecOutput] = useState('');
  const [secHasRun, setSecHasRun] = useState(false);
  const [secError, setSecError] = useState('');
  const [hashAlg, setHashAlg] = useState<'SHA-256' | 'SHA-512' | 'SHA-1'>('SHA-256');

  const handleDecodeJwt = () => {
    setSecError('');
    try {
      const parts = jwtString.split('.');
      if (parts.length < 2) throw new Error('JWT must have at least 2 segments separated by dots.');
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      setSecOutput(JSON.stringify({ header, payload }, null, 2));
      setSecHasRun(true);
    } catch (e: any) {
      setSecError(`Invalid JWT: ${e.message}`);
    }
  };

  const handleGenerateHash = async () => {
    setSecError('');
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(codecInput || 'Toolstrum');
      const hashBuf = await crypto.subtle.digest(hashAlg, data);
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setSecOutput(`${hashAlg} Checksum:\n${hashHex}`);
      setSecHasRun(true);
    } catch (e: any) {
      setSecError(`Hash error: ${e.message}`);
    }
  };

  const handleGenerateUuid = () => {
    setSecError('');
    const uuid = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    setSecOutput(uuid);
    setSecHasRun(true);
  };

  // ==========================================
  // 6. CSS GENERATORS (BOX SHADOW, BORDER RADIUS)
  // ==========================================
  const [shadowX, setShadowX] = useState(0);
  const [shadowY, setShadowY] = useState(12);
  const [shadowBlur, setShadowBlur] = useState(24);
  const [shadowSpread, setShadowSpread] = useState(-4);
  const [shadowColor, setShadowColor] = useState('rgba(0, 0, 0, 0.15)');

  // ==========================================
  // 7. SYSTEM & TIME (UNIX TIMESTAMP, HTTP CODES)
  // ==========================================
  const [unixInput, setUnixInput] = useState(String(Math.floor(Date.now() / 1000)));
  const [httpSearch, setHttpSearch] = useState('');

  const httpCodes = [
    { code: 200, name: 'OK', desc: 'Standard successful HTTP request.' },
    { code: 201, name: 'Created', desc: 'Resource created successfully.' },
    { code: 204, name: 'No Content', desc: 'Success, no body returned.' },
    { code: 301, name: 'Moved Permanently', desc: 'URL redirected permanently.' },
    { code: 304, name: 'Not Modified', desc: 'Cached resource is still valid.' },
    { code: 400, name: 'Bad Request', desc: 'Malformed client request syntax.' },
    { code: 401, name: 'Unauthorized', desc: 'Authentication required.' },
    { code: 403, name: 'Forbidden', desc: 'Server refuses to authorize request.' },
    { code: 404, name: 'Not Found', desc: 'Requested resource not found.' },
    { code: 429, name: 'Too Many Requests', desc: 'Rate limit exceeded.' },
    { code: 500, name: 'Internal Server Error', desc: 'Generic server error condition.' },
    { code: 502, name: 'Bad Gateway', desc: 'Invalid response from upstream server.' },
    { code: 503, name: 'Service Unavailable', desc: 'Server is temporarily overloaded.' },
  ];

  const filteredHttpCodes = httpCodes.filter(
    (c) =>
      String(c.code).includes(httpSearch) ||
      c.name.toLowerCase().includes(httpSearch.toLowerCase()) ||
      c.desc.toLowerCase().includes(httpSearch.toLowerCase())
  );

  const getUnixDate = () => {
    const num = Number(unixInput);
    if (isNaN(num) || num <= 0) return null;
    const d = new Date(num > 1e11 ? num : num * 1000);
    return {
      utc: d.toUTCString(),
      local: d.toLocaleString(),
      iso: d.toISOString(),
    };
  };

  // ==========================================
  // 8. CRON EXPRESSION HELPER
  // ==========================================
  const [cronExpr, setCronExpr] = useState('*/15 9-17 * * 1-5');
  const [cronError, setCronError] = useState('');
  const [cronDescription, setCronDescription] = useState('');
  const [cronNextRuns, setCronNextRuns] = useState<string[]>([]);

  const parseCronField = (field: string, min: number, max: number): Set<number> => {
    const values = new Set<number>();
    for (const part of field.split(',')) {
      const stepMatch = part.match(/^(\*|\d+-\d+|\d+)\/(\d+)$/);
      let range = part;
      let step = 1;
      if (stepMatch) {
        range = stepMatch[1];
        step = Number(stepMatch[2]);
      }
      let lo = min;
      let hi = max;
      if (range !== '*') {
        const rangeMatch = range.match(/^(\d+)-(\d+)$/);
        if (rangeMatch) {
          lo = Number(rangeMatch[1]);
          hi = Number(rangeMatch[2]);
        } else {
          lo = hi = Number(range);
        }
      }
      for (let v = lo; v <= hi; v += step) values.add(v);
    }
    return values;
  };

  const handleParseCron = () => {
    setCronError('');
    setCronDescription('');
    setCronNextRuns([]);
    const fields = cronExpr.trim().split(/\s+/);
    if (fields.length !== 5) {
      setCronError('Cron expressions need exactly 5 fields: minute hour day-of-month month day-of-week.');
      return;
    }
    try {
      const [minF, hourF, domF, monF, dowF] = fields;
      const minutes = parseCronField(minF, 0, 59);
      const hours = parseCronField(hourF, 0, 23);
      const doms = parseCronField(domF, 1, 31);
      const months = parseCronField(monF, 1, 12);
      const dows = parseCronField(dowF, 0, 6);

      const domRestricted = domF !== '*';
      const dowRestricted = dowF !== '*';

      const parts: string[] = [];
      parts.push(minF === '*' ? 'every minute' : `at minute(s) ${[...minutes].join(', ')}`);
      parts.push(hourF === '*' ? 'of every hour' : `of hour(s) ${[...hours].join(', ')}`);
      parts.push(monF === '*' ? 'every month' : `in month(s) ${[...months].join(', ')}`);
      if (domRestricted) parts.push(`on day-of-month ${[...doms].join(', ')}`);
      if (dowRestricted) parts.push(`on weekday(s) ${[...dows].join(', ')}`);
      setCronDescription(parts.join(', '));

      const runs: string[] = [];
      const cursor = new Date();
      cursor.setSeconds(0, 0);
      cursor.setMinutes(cursor.getMinutes() + 1);
      let iterations = 0;
      while (runs.length < 5 && iterations < 600000) {
        iterations++;
        const dowMatches = dows.has(cursor.getDay());
        const domMatches = doms.has(cursor.getDate());
        const domOk = !domRestricted && !dowRestricted ? true : domRestricted && dowRestricted ? domMatches || dowMatches : domRestricted ? domMatches : dowMatches;
        if (
          minutes.has(cursor.getMinutes()) &&
          hours.has(cursor.getHours()) &&
          months.has(cursor.getMonth() + 1) &&
          domOk
        ) {
          runs.push(cursor.toLocaleString());
        }
        cursor.setMinutes(cursor.getMinutes() + 1);
      }
      setCronNextRuns(runs);
    } catch (e: any) {
      setCronError(`Invalid cron expression: ${e.message}`);
    }
  };

  // ==========================================
  // 9. DIFF & PATCH VIEWER
  // ==========================================
  const [diffLeft, setDiffLeft] = useState('line one\nline two\nline three');
  const [diffRight, setDiffRight] = useState('line one\nline 2\nline three\nline four');
  const [diffResult, setDiffResult] = useState<{ type: 'same' | 'added' | 'removed'; text: string }[]>([]);
  const [diffHasRun, setDiffHasRun] = useState(false);

  const handleComputeDiff = () => {
    const a = diffLeft.split('\n');
    const b = diffRight.split('\n');
    const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const result: { type: 'same' | 'added' | 'removed'; text: string }[] = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) {
        result.push({ type: 'same', text: a[i] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        result.push({ type: 'removed', text: a[i] });
        i++;
      } else {
        result.push({ type: 'added', text: b[j] });
        j++;
      }
    }
    while (i < a.length) result.push({ type: 'removed', text: a[i++] });
    while (j < b.length) result.push({ type: 'added', text: b[j++] });
    setDiffResult(result);
    setDiffHasRun(true);
  };

  // ==========================================
  // 10. URL PARSER
  // ==========================================
  const [urlInput, setUrlInput] = useState('https://www.toolstrum.app/search?q=offline+tools&page=2#results');
  const [urlError, setUrlError] = useState('');
  const [urlParsed, setUrlParsed] = useState<{ protocol: string; hostname: string; port: string; pathname: string; hash: string; params: [string, string][] } | null>(null);

  const handleParseUrl = () => {
    setUrlError('');
    try {
      const u = new URL(urlInput);
      setUrlParsed({
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || '(default)',
        pathname: u.pathname,
        hash: u.hash || '(none)',
        params: Array.from(u.searchParams.entries()),
      });
    } catch {
      setUrlError('Invalid URL. Include the protocol, e.g. https://example.com');
      setUrlParsed(null);
    }
  };

  // ==========================================
  // 11. USER-AGENT PARSER
  // ==========================================
  const [uaInput, setUaInput] = useState(typeof navigator !== 'undefined' ? navigator.userAgent : '');
  const [uaResult, setUaResult] = useState<{ browser: string; os: string; engine: string; device: string } | null>(null);

  const handleParseUa = () => {
    const ua = uaInput;
    let browser = 'Unknown';
    if (/Edg\//.test(ua)) browser = `Edge ${ua.match(/Edg\/([\d.]+)/)?.[1] || ''}`;
    else if (/OPR\//.test(ua)) browser = `Opera ${ua.match(/OPR\/([\d.]+)/)?.[1] || ''}`;
    else if (/Chrome\//.test(ua) && !/Chromium/.test(ua)) browser = `Chrome ${ua.match(/Chrome\/([\d.]+)/)?.[1] || ''}`;
    else if (/Firefox\//.test(ua)) browser = `Firefox ${ua.match(/Firefox\/([\d.]+)/)?.[1] || ''}`;
    else if (/Version\/.*Safari\//.test(ua)) browser = `Safari ${ua.match(/Version\/([\d.]+)/)?.[1] || ''}`;

    let os = 'Unknown';
    if (/Windows NT 10/.test(ua)) os = 'Windows 10/11';
    else if (/Windows NT/.test(ua)) os = `Windows (${ua.match(/Windows NT ([\d.]+)/)?.[1]})`;
    else if (/Mac OS X/.test(ua) && !/iPhone|iPad/.test(ua)) os = `macOS ${(ua.match(/Mac OS X ([\d_]+)/)?.[1] || '').replace(/_/g, '.')}`;
    else if (/Android/.test(ua)) os = `Android ${ua.match(/Android ([\d.]+)/)?.[1] || ''}`;
    else if (/iPhone|iPad/.test(ua)) os = `iOS ${(ua.match(/OS ([\d_]+)/)?.[1] || '').replace(/_/g, '.')}`;
    else if (/Linux/.test(ua)) os = 'Linux';

    let engine = 'Unknown';
    if (/Gecko\/\d/.test(ua)) engine = 'Gecko';
    else if (/AppleWebKit/.test(ua)) engine = /Chrome|Edg|OPR/.test(ua) ? 'Blink' : 'WebKit';

    const device = /Mobi/.test(ua) ? 'Mobile' : /iPad|Tablet/.test(ua) ? 'Tablet' : 'Desktop';

    setUaResult({ browser: browser.trim() || 'Unknown', os, engine, device });
  };

  // ==========================================
  // 12. MIME TYPE REFERENCE
  // ==========================================
  const [mimeSearch, setMimeSearch] = useState('');
  const mimeTypes = [
    { ext: '.html', mime: 'text/html' },
    { ext: '.css', mime: 'text/css' },
    { ext: '.js', mime: 'text/javascript' },
    { ext: '.json', mime: 'application/json' },
    { ext: '.xml', mime: 'application/xml' },
    { ext: '.pdf', mime: 'application/pdf' },
    { ext: '.zip', mime: 'application/zip' },
    { ext: '.png', mime: 'image/png' },
    { ext: '.jpg / .jpeg', mime: 'image/jpeg' },
    { ext: '.gif', mime: 'image/gif' },
    { ext: '.svg', mime: 'image/svg+xml' },
    { ext: '.webp', mime: 'image/webp' },
    { ext: '.mp3', mime: 'audio/mpeg' },
    { ext: '.wav', mime: 'audio/wav' },
    { ext: '.mp4', mime: 'video/mp4' },
    { ext: '.webm', mime: 'video/webm' },
    { ext: '.txt', mime: 'text/plain' },
    { ext: '.csv', mime: 'text/csv' },
    { ext: '.doc / .docx', mime: 'application/msword / application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { ext: '.xls / .xlsx', mime: 'application/vnd.ms-excel / application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { ext: '.ttf', mime: 'font/ttf' },
    { ext: '.woff / .woff2', mime: 'font/woff / font/woff2' },
    { ext: '.wasm', mime: 'application/wasm' },
  ];
  const filteredMimeTypes = mimeTypes.filter(
    (m) => m.ext.toLowerCase().includes(mimeSearch.toLowerCase()) || m.mime.toLowerCase().includes(mimeSearch.toLowerCase())
  );

  // ==========================================
  // 13. MARKDOWN CODE FORMATTER
  // ==========================================
  const [mdInput, setMdInput] = useState('#Title\n*  item one\n+  item two\n\n\n\nSome   text.');
  const [mdOutput, setMdOutput] = useState('');
  const [mdHasRun, setMdHasRun] = useState(false);

  const handleFormatMarkdown = () => {
    const lines = mdInput.split('\n').map((l) => l.replace(/\s+$/g, ''));
    const normalized = lines.map((l) => {
      let line = l.replace(/^(#{1,6})\s*/, (m, hashes) => `${hashes} `);
      line = line.replace(/^(\s*)[*+]\s+/, '$1- ');
      return line;
    });
    const collapsed: string[] = [];
    let blankRun = 0;
    for (const line of normalized) {
      if (line.trim() === '') {
        blankRun++;
        if (blankRun <= 1) collapsed.push('');
      } else {
        blankRun = 0;
        collapsed.push(line);
      }
    }
    setMdOutput(collapsed.join('\n'));
    setMdHasRun(true);
  };

  // ==========================================
  // 14. SQL INSERT GENERATOR
  // ==========================================
  const [sqlTable, setSqlTable] = useState('users');
  const [sqlColumns, setSqlColumns] = useState('id, name, email, is_active');
  const [sqlRows, setSqlRows] = useState('1, "Alice Dev", alice@toolstrum.app, true\n2, "Bob Admin", bob@toolstrum.app, false');
  const [sqlOutput, setSqlOutput] = useState('');
  const [sqlHasRun, setSqlHasRun] = useState(false);

  const handleGenerateSqlInsert = () => {
    const cols = sqlColumns.split(',').map((c) => c.trim()).filter(Boolean);
    const rows = sqlRows.split('\n').map((r) => r.trim()).filter(Boolean);
    const formatValue = (raw: string) => {
      const v = raw.trim().replace(/^["']|["']$/g, '');
      if (v.toLowerCase() === 'true' || v.toLowerCase() === 'false') return v.toLowerCase();
      if (v.toLowerCase() === 'null') return 'NULL';
      if (/^-?\d+(\.\d+)?$/.test(v)) return v;
      return `'${v.replace(/'/g, "''")}'`;
    };
    const valueTuples = rows.map((row) => {
      const values = row.split(',').map((v) => formatValue(v));
      return `  (${values.join(', ')})`;
    });
    setSqlOutput(`INSERT INTO ${sqlTable} (${cols.join(', ')})\nVALUES\n${valueTuples.join(',\n')};`);
    setSqlHasRun(true);
  };

  // ==========================================
  // 15. MOCK JSON GENERATOR
  // ==========================================
  const [mockSchema, setMockSchema] = useState('id:uuid\nname:string\nemail:email\nage:number\nactive:boolean\ncreatedAt:date');
  const [mockCount, setMockCount] = useState(3);
  const [mockOutput, setMockOutput] = useState('');
  const [mockHasRun, setMockHasRun] = useState(false);

  const handleGenerateMockJson = () => {
    const sampleWords = ['Alpha', 'Bravo', 'Cedar', 'Delta', 'Ember', 'Falcon', 'Garnet', 'Harbor', 'Indigo', 'Juniper'];
    const fields = mockSchema.split('\n').map((l) => l.split(':').map((p) => p.trim())).filter(([k, t]) => k && t);
    const genValue = (type: string): any => {
      switch (type.toLowerCase()) {
        case 'uuid':
          return crypto.randomUUID ? crypto.randomUUID() : 'xxxx-xxxx-xxxx-xxxx';
        case 'number':
          return Math.floor(Math.random() * 1000);
        case 'boolean':
          return Math.random() > 0.5;
        case 'date':
          return new Date(Date.now() - Math.floor(Math.random() * 1e10)).toISOString();
        case 'email':
          return `${sampleWords[Math.floor(Math.random() * sampleWords.length)].toLowerCase()}${Math.floor(Math.random() * 99)}@example.com`;
        default:
          return `${sampleWords[Math.floor(Math.random() * sampleWords.length)]} ${sampleWords[Math.floor(Math.random() * sampleWords.length)]}`;
      }
    };
    const records = Array.from({ length: Math.max(1, Math.min(50, mockCount)) }, () => {
      const obj: Record<string, any> = {};
      fields.forEach(([key, type]) => {
        obj[key] = genValue(type);
      });
      return obj;
    });
    setMockOutput(JSON.stringify(records, null, 2));
    setMockHasRun(true);
  };

  // ==========================================
  // 16. API REQUEST BUILDER
  // ==========================================
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [apiUrl, setApiUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [apiHeaders, setApiHeaders] = useState('Accept: application/json');
  const [apiBody, setApiBody] = useState('');
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [apiResponse, setApiResponse] = useState<{ status: number; headers: string; body: string } | null>(null);

  const handleSendApiRequest = async () => {
    setApiError('');
    setApiResponse(null);
    setApiLoading(true);
    try {
      const headerObj: Record<string, string> = {};
      apiHeaders.split('\n').forEach((line) => {
        const idx = line.indexOf(':');
        if (idx > -1) headerObj[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
      });
      const res = await fetch(apiUrl, {
        method: apiMethod,
        headers: headerObj,
        body: apiMethod !== 'GET' && apiMethod !== 'DELETE' && apiBody ? apiBody : undefined,
      });
      const text = await res.text();
      const headerLines: string[] = [];
      res.headers.forEach((v, k) => headerLines.push(`${k}: ${v}`));
      setApiResponse({ status: res.status, headers: headerLines.join('\n'), body: text });
    } catch (e: any) {
      setApiError(`Request failed: ${e.message}. This may be a CORS restriction from the target server — Toolstrum cannot bypass that.`);
    } finally {
      setApiLoading(false);
    }
  };

  // ==========================================
  // 17. cURL CONVERTER
  // ==========================================
  const [curlDirection, setCurlDirection] = useState<'build' | 'parse'>('build');
  const [curlCommand, setCurlCommand] = useState("curl -X POST 'https://api.example.com/users' -H 'Content-Type: application/json' -d '{\"name\":\"Alice\"}'");
  const [curlParsedResult, setCurlParsedResult] = useState('');

  const buildCurlFromApiFields = () => {
    const headerLines = apiHeaders.split('\n').filter(Boolean).map((h) => `  -H '${h.trim()}'`);
    const bodyPart = apiMethod !== 'GET' && apiMethod !== 'DELETE' && apiBody ? ` \\\n  --data '${apiBody.replace(/'/g, "'\\''")}'` : '';
    return `curl -X ${apiMethod} '${apiUrl}' \\\n${headerLines.join(' \\\n')}${headerLines.length ? ' \\\n' : ''}  ...${bodyPart}`.replace('...', '').replace(/\s+\\\n\s+--data/, ' \\\n  --data');
  };

  const handleParseCurl = () => {
    const tokens = curlCommand.match(/"[^"]*"|'[^']*'|\S+/g) || [];
    let method = 'GET';
    const headers: string[] = [];
    let url = '';
    let body = '';
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i].replace(/^['"]|['"]$/g, '');
      if (t === '-X' || t === '--request') method = tokens[++i]?.replace(/^['"]|['"]$/g, '') || method;
      else if (t === '-H' || t === '--header') headers.push(tokens[++i]?.replace(/^['"]|['"]$/g, '') || '');
      else if (t === '-d' || t === '--data' || t === '--data-raw') {
        body = tokens[++i]?.replace(/^['"]|['"]$/g, '') || '';
        if (method === 'GET') method = 'POST';
      } else if (t.startsWith('http')) url = t;
    }
    setCurlParsedResult(`Method: ${method}\nURL: ${url || '(not found)'}\nHeaders:\n${headers.map((h) => `  ${h}`).join('\n') || '  (none)'}\nBody:\n  ${body || '(none)'}`);
  };

  // ==========================================
  // 18. QR PAYLOAD INSPECTOR
  // ==========================================
  const [qrPayload, setQrPayload] = useState('WIFI:T:WPA;S:HomeNetwork;P:SuperSecret123;H:false;;');
  const [qrParsedOutput, setQrParsedOutput] = useState('');

  const handleInspectQrPayload = () => {
    const payload = qrPayload.trim();
    if (payload.startsWith('WIFI:')) {
      const ssid = payload.match(/S:([^;]*);/)?.[1] || '';
      const pass = payload.match(/P:([^;]*);/)?.[1] || '';
      const type = payload.match(/T:([^;]*);/)?.[1] || '';
      const hidden = payload.match(/H:([^;]*);/)?.[1] || 'false';
      setQrParsedOutput(`Type: Wi-Fi Network\nSSID: ${ssid}\nPassword: ${pass}\nSecurity: ${type}\nHidden: ${hidden}`);
    } else if (/^BEGIN:VCARD/i.test(payload)) {
      const fn = payload.match(/FN:(.*)/i)?.[1]?.trim() || '';
      const tel = payload.match(/TEL[^:]*:(.*)/i)?.[1]?.trim() || '';
      const email = payload.match(/EMAIL[^:]*:(.*)/i)?.[1]?.trim() || '';
      const org = payload.match(/ORG:(.*)/i)?.[1]?.trim() || '';
      setQrParsedOutput(`Type: Contact Card (vCard)\nName: ${fn}\nPhone: ${tel}\nEmail: ${email}\nOrganization: ${org}`);
    } else if (payload.startsWith('mailto:')) {
      const [addr, query] = payload.replace('mailto:', '').split('?');
      setQrParsedOutput(`Type: Email\nAddress: ${addr}\nQuery: ${query || '(none)'}`);
    } else if (payload.startsWith('tel:')) {
      setQrParsedOutput(`Type: Phone Call\nNumber: ${payload.replace('tel:', '')}`);
    } else if (payload.startsWith('sms:')) {
      const [num, rest] = payload.replace('sms:', '').split('?');
      setQrParsedOutput(`Type: SMS\nNumber: ${num}\nBody: ${rest?.replace('body=', '') || '(none)'}`);
    } else if (/^https?:\/\//i.test(payload)) {
      try {
        const u = new URL(payload);
        setQrParsedOutput(`Type: Website URL\nHost: ${u.hostname}\nPath: ${u.pathname}\nFull URL: ${payload}`);
      } catch {
        setQrParsedOutput(`Type: URL (unparsable)\nRaw: ${payload}`);
      }
    } else {
      setQrParsedOutput(`Type: Plain Text\nLength: ${payload.length} characters\nContent: ${payload}`);
    }
  };

  // ==========================================
  // 19. CERTIFICATE INSPECTOR (MINIMAL DER/X.509 PARSER)
  // ==========================================
  const [certPem, setCertPem] = useState('');
  const [certError, setCertError] = useState('');
  const [certResult, setCertResult] = useState<Record<string, string> | null>(null);

  const OID_NAMES: Record<string, string> = {
    '2.5.4.3': 'CN',
    '2.5.4.6': 'C',
    '2.5.4.7': 'L',
    '2.5.4.8': 'ST',
    '2.5.4.10': 'O',
    '2.5.4.11': 'OU',
    '1.2.840.113549.1.1.11': 'sha256WithRSAEncryption',
    '1.2.840.113549.1.1.5': 'sha1WithRSAEncryption',
    '1.2.840.113549.1.1.1': 'rsaEncryption',
    '1.2.840.10045.4.3.2': 'ecdsa-with-SHA256',
    '1.2.840.10045.2.1': 'id-ecPublicKey',
  };

  const handleInspectCertificate = () => {
    setCertError('');
    setCertResult(null);
    try {
      const b64 = certPem.replace(/-----BEGIN CERTIFICATE-----/g, '').replace(/-----END CERTIFICATE-----/g, '').replace(/\s+/g, '');
      if (!b64) throw new Error('Paste a PEM-encoded certificate (-----BEGIN CERTIFICATE-----).');
      const der = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

      let pos = 0;
      const readLength = (): number => {
        const first = der[pos++];
        if (first < 0x80) return first;
        const numBytes = first & 0x7f;
        let len = 0;
        for (let i = 0; i < numBytes; i++) len = (len << 8) | der[pos++];
        return len;
      };
      const readTLV = () => {
        const tag = der[pos++];
        const length = readLength();
        const contentStart = pos;
        pos += length;
        return { tag, start: contentStart, end: contentStart + length };
      };
      const readChildren = (start: number, end: number) => {
        const children: ReturnType<typeof readTLV>[] = [];
        const savedPos = pos;
        pos = start;
        while (pos < end) children.push(readTLV());
        pos = savedPos;
        return children;
      };
      const readOid = (start: number, end: number): string => {
        const bytes = der.slice(start, end);
        const parts = [Math.floor(bytes[0] / 40), bytes[0] % 40];
        let val = 0;
        for (let i = 1; i < bytes.length; i++) {
          val = (val << 7) | (bytes[i] & 0x7f);
          if (!(bytes[i] & 0x80)) {
            parts.push(val);
            val = 0;
          }
        }
        return parts.join('.');
      };
      const readString = (start: number, end: number): string => new TextDecoder().decode(der.slice(start, end));
      const readInt = (start: number, end: number): string => Array.from(der.slice(start, end)).map((b) => b.toString(16).padStart(2, '0')).join(':');
      const readTime = (start: number, end: number, generalized: boolean): string => {
        const s = readString(start, end).replace('Z', '');
        const yy = generalized ? s.slice(0, 4) : (Number(s.slice(0, 2)) < 50 ? '20' : '19') + s.slice(0, 2);
        const rest = generalized ? s.slice(4) : s.slice(2);
        const [mo, da, hh, mi, se] = [rest.slice(0, 2), rest.slice(2, 4), rest.slice(4, 6), rest.slice(6, 8), rest.slice(8, 10)];
        return `${yy}-${mo}-${da} ${hh}:${mi}:${se} UTC`;
      };
      const findCn = (nameSeq: ReturnType<typeof readTLV>): string => {
        const rdnSets = readChildren(nameSeq.start, nameSeq.end);
        for (const rdn of rdnSets) {
          const atvSeqs = readChildren(rdn.start, rdn.end);
          for (const atv of atvSeqs) {
            const [oidTlv, valTlv] = readChildren(atv.start, atv.end);
            if (oidTlv && valTlv && readOid(oidTlv.start, oidTlv.end) === '2.5.4.3') {
              return readString(valTlv.start, valTlv.end);
            }
          }
        }
        return '(no Common Name found)';
      };

      const certSeq = readTLV();
      const tbsSeq = readChildren(certSeq.start, certSeq.end)[0];
      let fields = readChildren(tbsSeq.start, tbsSeq.end);
      if (fields[0].tag === 0xa0) fields = fields.slice(1);
      const [serialTlv, sigAlgTlv, issuerTlv, validityTlv, subjectTlv] = fields;

      const sigAlgOidTlv = readChildren(sigAlgTlv.start, sigAlgTlv.end)[0];
      const sigAlgOid = readOid(sigAlgOidTlv.start, sigAlgOidTlv.end);
      const [notBeforeTlv, notAfterTlv] = readChildren(validityTlv.start, validityTlv.end);

      setCertResult({
        'Serial Number': readInt(serialTlv.start, serialTlv.end),
        'Signature Algorithm': OID_NAMES[sigAlgOid] || sigAlgOid,
        'Issuer CN': findCn(issuerTlv),
        'Subject CN': findCn(subjectTlv),
        'Valid From': readTime(notBeforeTlv.start, notBeforeTlv.end, notBeforeTlv.tag === 0x18),
        'Valid Until': readTime(notAfterTlv.start, notAfterTlv.end, notAfterTlv.tag === 0x18),
      });
    } catch (e: any) {
      setCertError(`Could not parse certificate: ${e.message}. Make sure you pasted a complete, valid PEM certificate.`);
    }
  };

  // ==========================================
  // 20. IP SUBNET CALCULATOR
  // ==========================================
  const [subnetIp, setSubnetIp] = useState('192.168.1.10');
  const [subnetPrefix, setSubnetPrefix] = useState(24);
  const [subnetError, setSubnetError] = useState('');
  const [subnetResult, setSubnetResult] = useState<Record<string, string> | null>(null);

  const ipToInt = (ip: string): number => {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) throw new Error('Invalid IPv4 address');
    return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
  };
  const intToIp = (n: number): string => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');

  const handleCalculateSubnet = () => {
    setSubnetError('');
    setSubnetResult(null);
    try {
      const ipInt = ipToInt(subnetIp);
      const prefix = Math.max(0, Math.min(32, subnetPrefix));
      const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
      const network = (ipInt & mask) >>> 0;
      const broadcast = (network | (~mask >>> 0)) >>> 0;
      const totalHosts = Math.pow(2, 32 - prefix);
      const usableHosts = prefix >= 31 ? 0 : totalHosts - 2;
      setSubnetResult({
        'Network Address': intToIp(network),
        'Broadcast Address': intToIp(broadcast),
        'Subnet Mask': intToIp(mask),
        'Wildcard Mask': intToIp(~mask >>> 0),
        'First Usable Host': prefix >= 31 ? intToIp(network) : intToIp(network + 1),
        'Last Usable Host': prefix >= 31 ? intToIp(broadcast) : intToIp(broadcast - 1),
        'Total Hosts': String(totalHosts),
        'Usable Hosts': String(usableHosts),
      });
    } catch (e: any) {
      setSubnetError(e.message);
    }
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Code className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Developer Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Format, encode, decode, test regex, inspect JWTs, and generate styles. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* 244 — JSON FORMATTER (BEAUTIFY) — auto-computes live */}
      {toolId === 244 && (() => {
        const { value, error } = parseJson(jsonInput);
        const output = value !== undefined ? JSON.stringify(value, null, 2) : '';
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={14}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
                placeholder="Paste JSON here..."
              />
              {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{error}</div>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Beautified Output</span>
                {output && (
                  <button onClick={() => handleCopyText(output)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed">{output || 'Fix the JSON error on the left to see formatted output here.'}</pre>
            </div>
          </div>
        );
      })()}

      {/* 245 — JSON VALIDATOR — auto-computes live */}
      {toolId === 245 && (() => {
        const { value, error } = parseJson(jsonInput);
        const typeLabel = Array.isArray(value) ? `array (${value.length} items)` : typeof value === 'object' && value !== null ? `object (${Object.keys(value).length} keys)` : typeof value;
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={14}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              />
            </div>
            <div className={`p-6 rounded-2xl border-2 shadow-md space-y-3 ${error ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400/40' : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400/40'}`}>
              <div className="flex items-center gap-2">
                {error ? <X className="w-5 h-5 text-rose-600" /> : <Check className="w-5 h-5 text-emerald-600" />}
                <span className={`text-sm font-bold ${error ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                  {error ? 'Invalid JSON' : 'Valid JSON'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{error || `Root type: ${typeLabel}`}</p>
            </div>
          </div>
        );
      })()}

      {/* 246 — JSON MINIFIER — auto-computes live */}
      {toolId === 246 && (() => {
        const { value, error } = parseJson(jsonInput);
        const output = value !== undefined ? JSON.stringify(value) : '';
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={14}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              />
              {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{error}</div>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Minified Output</span>
                {output && (
                  <button onClick={() => handleCopyText(output)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[380px] break-all whitespace-pre-wrap">{output || 'Fix the JSON error on the left to see minified output here.'}</pre>
            </div>
          </div>
        );
      })()}

      {/* 247 — JSON DIFF — auto-computes live */}
      {toolId === 247 && (() => {
        const left = parseJson(jsonDiffLeft);
        const right = parseJson(jsonDiffRight);
        const diffs = !left.error && !right.error ? diffJsonObjects(left.value, right.value) : [];
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <label className="text-xs font-bold text-slate-900 dark:text-white">Original JSON</label>
              <textarea value={jsonDiffLeft} onChange={(e) => setJsonDiffLeft(e.target.value)} rows={8} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
              <label className="text-xs font-bold text-slate-900 dark:text-white">Modified JSON</label>
              <textarea value={jsonDiffRight} onChange={(e) => setJsonDiffRight(e.target.value)} rows={8} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
              {(left.error || right.error) && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{left.error || right.error}</div>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Differences ({diffs.length})</span>
              <div className="mt-3 space-y-1.5 max-h-[380px] overflow-y-auto font-mono text-xs">
                {diffs.length === 0 && !left.error && !right.error && <p className="text-slate-500 font-sans">No differences found.</p>}
                {diffs.map((d, i) => (
                  <div key={i} className={`p-2 rounded-lg ${d.type === 'added' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : d.type === 'removed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'}`}>
                    <span className="font-bold">{d.path}</span>: {d.type}
                    {d.type !== 'added' && <span> left={JSON.stringify(d.left)}</span>}
                    {d.type !== 'removed' && <span> right={JSON.stringify(d.right)}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 248 — JSON PATH TESTER — auto-computes live */}
      {toolId === 248 && (() => {
        const { value, error } = parseJson(jsonInput);
        const result = !error ? evaluateJsonPath(value, jsonPathQuery) : { value: undefined, error: '' };
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={10}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              />
              <label className="text-xs font-bold text-slate-900 dark:text-white block">Path (e.g. tools[0] or a.b.c)</label>
              <input type="text" value={jsonPathQuery} onChange={(e) => setJsonPathQuery(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
              {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{error}</div>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-3">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Matched Value</span>
              {result.error ? (
                <p className="text-xs text-rose-600 font-medium">{result.error}</p>
              ) : (
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[300px]">{JSON.stringify(result.value, null, 2) ?? 'undefined'}</pre>
              )}
            </div>
          </div>
        );
      })()}

      {/* 249 — JSON TO TYPESCRIPT — auto-computes live */}
      {toolId === 249 && (() => {
        const { value, error } = parseJson(jsonInput);
        const output = value !== undefined && typeof value === 'object' && value !== null ? generateTsInterface(value) : '';
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white">JSON Input</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={14}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              />
              {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{error}</div>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">TypeScript Interface</span>
                {output && (
                  <button onClick={() => handleCopyText(output)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed">{output || 'Root value must be a JSON object to generate an interface.'}</pre>
            </div>
          </div>
        );
      })()}

      {/* 250 — JSON SCHEMA GENERATOR — auto-computes live */}
      {toolId === 250 && (() => {
        const { value, error } = parseJson(jsonInput);
        const output = value !== undefined ? JSON.stringify({ $schema: 'http://json-schema.org/draft-07/schema#', ...inferJsonSchema(value) }, null, 2) : '';
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <label className="text-xs font-bold text-slate-900 dark:text-white">Sample JSON</label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                rows={14}
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              />
              {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{error}</div>}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Generated JSON Schema</span>
                {output && (
                  <button onClick={() => handleCopyText(output)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[380px] leading-relaxed">{output || 'Fix the JSON error on the left to see the generated schema here.'}</pre>
            </div>
          </div>
        );
      })()}

      {/* ======================================================== */}
      {/* TAB 2: CODE & SQL FORMATTERS */}
      {/* ======================================================== */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Code / Query Input
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={codeLang}
                  onChange={(e) => setCodeLang(e.target.value as any)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-semibold uppercase"
                >
                  <option value="sql">SQL</option>
                  <option value="html">HTML</option>
                  <option value="css">CSS</option>
                </select>
                <button
                  onClick={handleFormatCode}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs"
                >
                  Format Code
                </button>
              </div>
            </div>

            <textarea
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              rows={12}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
            />
          </div>

          <div className="space-y-4">
            {codeHasRun && codeOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Formatted {codeLang.toUpperCase()}
                  </span>
                  <button
                    onClick={() => handleCopyText(codeOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[360px] leading-relaxed">
                  {codeOutput}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select language and click Format Code. Your code stays 100% private on your device.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: REGEX TESTER */}
      {/* ======================================================== */}
      {activeTab === 'regex' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Regular Expression Pattern & Flags
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs">
                  <span className="text-slate-400 mr-1">/</span>
                  <input
                    type="text"
                    value={regexPattern}
                    onChange={(e) => setRegexPattern(e.target.value)}
                    className="w-full bg-transparent focus:outline-none text-slate-900 dark:text-white"
                  />
                  <span className="text-slate-400 ml-1">/</span>
                </div>
                <input
                  type="text"
                  value={regexFlags}
                  onChange={(e) => setRegexFlags(e.target.value)}
                  className="w-16 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-center"
                  placeholder="g, i"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Test Target String
              </label>
              <textarea
                value={regexText}
                onChange={(e) => setRegexText(e.target.value)}
                rows={5}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white leading-relaxed"
              />
            </div>

            <button
              onClick={handleTestRegex}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs"
            >
              Test Regex Matches
            </button>

            {regexError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
                {regexError}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {regexHasRun ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Matches Found ({regexMatches.length})
                  </span>
                  {regexMatches.length > 0 && (
                    <button
                      onClick={() => handleCopyText(regexMatches.join('\n'))}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Matches</span>
                    </button>
                  )}
                </div>

                {regexMatches.length > 0 ? (
                  <div className="space-y-2 max-h-[320px] overflow-y-auto">
                    {regexMatches.map((m, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all">
                        <span className="text-slate-400 text-[10px] mr-2">#{i + 1}</span>
                        {m}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No matches found for the given pattern.</p>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Configure pattern and click "Test Regex Matches". 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: BASE64 & URL ENCODER/DECODER */}
      {/* ======================================================== */}
      {activeTab === 'codec' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Source String / Text
            </label>
            <textarea
              value={codecInput}
              onChange={(e) => setCodecInput(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleBase64Encode}
                className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors"
              >
                Base64 Encode
              </button>
              <button
                onClick={handleBase64Decode}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                Base64 Decode
              </button>
              <button
                onClick={handleUrlEncode}
                className="py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors"
              >
                URL Encode
              </button>
              <button
                onClick={handleUrlDecode}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors"
              >
                URL Decode
              </button>
            </div>

            {codecError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium">
                {codecError}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {codecHasRun && codecOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Codec Result
                  </span>
                  <button
                    onClick={() => handleCopyText(codecOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Result'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all whitespace-pre-wrap max-h-[320px] overflow-y-auto">
                  {codecOutput}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter text and click an encode or decode action. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SECURITY (JWT, HASH, UUID) */}
      {/* ======================================================== */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                JWT Token String
              </label>
              <textarea
                value={jwtString}
                onChange={(e) => setJwtString(e.target.value)}
                rows={4}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              />
              <button
                onClick={handleDecodeJwt}
                className="w-full mt-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
              >
                Decode JWT Token
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                {(['SHA-256', 'SHA-512', 'SHA-1'] as const).map((a) => (
                  <button
                    key={a}
                    onClick={() => setHashAlg(a)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      hashAlg === a ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <button
                onClick={handleGenerateHash}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs"
              >
                Compute Hash
              </button>
            </div>

            <div className="pt-2">
              <button
                onClick={handleGenerateUuid}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Generate UUID v4
              </button>
            </div>

            {secError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">
                {secError}
              </div>
            )}
          </div>

          <div className="space-y-4">
            {secHasRun && secOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                    Decoded / Output
                  </span>
                  <button
                    onClick={() => handleCopyText(secOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all whitespace-pre-wrap max-h-[320px] overflow-y-auto">
                  {secOutput}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select an action on the left. All cryptographic keys and hashes execute locally on your device.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: CSS BOX SHADOW */}
      {/* ======================================================== */}
      {activeTab === 'css' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Shadow Parameters
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Horizontal Offset: {shadowX}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowX}
                  onChange={(e) => setShadowX(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Vertical Offset: {shadowY}px</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={shadowY}
                  onChange={(e) => setShadowY(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Blur Radius: {shadowBlur}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={shadowBlur}
                  onChange={(e) => setShadowBlur(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span>Spread Radius: {shadowSpread}px</span>
                </div>
                <input
                  type="range"
                  min="-20"
                  max="50"
                  value={shadowSpread}
                  onChange={(e) => setShadowSpread(Number(e.target.value))}
                  className="w-full accent-sky-600"
                />
              </div>
            </div>

            {/* Live Preview Element */}
            <div className="pt-4 flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950 rounded-2xl">
              <div
                className="w-32 h-32 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200 transition-all"
                style={{
                  boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`,
                }}
              >
                Preview Box
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                CSS Output
              </span>
              <button
                onClick={() => handleCopyText(`box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy CSS</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all">
              {`box-shadow: ${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor};`}
            </pre>
          </div>
        </div>
      )}

      {/* 286 — UNIX TIMESTAMP CONVERTER */}
      {toolId === 286 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Unix Timestamp Converter
              </h3>
              <button
                onClick={() => setUnixInput(String(Math.floor(Date.now() / 1000)))}
                className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 text-xs font-bold"
              >
                Set Current Time
              </button>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Epoch Timestamp (Seconds or Milliseconds)
              </label>
              <input
                type="text"
                value={unixInput}
                onChange={(e) => setUnixInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold"
              />
            </div>

            {getUnixDate() && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Local Time:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{getUnixDate()?.local}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">UTC:</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{getUnixDate()?.utc}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">ISO 8601:</span>
                  <p className="font-mono text-slate-900 dark:text-white mt-0.5">{getUnixDate()?.iso}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 287 — CRON EXPRESSION HELPER */}
      {toolId === 287 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-500" /> Cron Expression Helper
            </h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Cron Expression (minute hour day-of-month month day-of-week)
              </label>
              <input
                type="text"
                value={cronExpr}
                onChange={(e) => setCronExpr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              />
            </div>
            <button
              onClick={handleParseCron}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
            >
              Explain & Compute Next Runs
            </button>
            {cronError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{cronError}</div>
            )}
          </div>
          <div className="space-y-4">
            {cronDescription ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
                <div>
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Runs</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-1 capitalize">{cronDescription}</p>
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Next 5 Run Times</span>
                  {cronNextRuns.map((r, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono">{r}</div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Enter a 5-field cron expression and click the button.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 288 — DIFF & PATCH VIEWER */}
      {toolId === 288 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" /> Diff & Patch Viewer
            </h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Original Text</label>
              <textarea value={diffLeft} onChange={(e) => setDiffLeft(e.target.value)} rows={8} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Modified Text</label>
              <textarea value={diffRight} onChange={(e) => setDiffRight(e.target.value)} rows={8} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <button onClick={handleComputeDiff} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Compute Diff
            </button>
          </div>
          <div className="space-y-4">
            {diffHasRun ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Line Diff</span>
                <div className="mt-3 font-mono text-xs max-h-[420px] overflow-y-auto space-y-0.5">
                  {diffResult.map((l, i) => (
                    <div
                      key={i}
                      className={`px-2 py-1 rounded-sm whitespace-pre-wrap ${
                        l.type === 'added' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' :
                        l.type === 'removed' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' :
                        'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {l.type === 'added' ? '+ ' : l.type === 'removed' ? '- ' : '  '}{l.text}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Paste both versions and click Compute Diff.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 289 — URL PARSER */}
      {toolId === 289 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-500" /> URL Parser
            </h3>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
            />
            <button onClick={handleParseUrl} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Parse URL
            </button>
            {urlError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{urlError}</div>}
          </div>
          <div className="space-y-4">
            {urlParsed ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-2.5 text-xs">
                {[
                  ['Protocol', urlParsed.protocol],
                  ['Hostname', urlParsed.hostname],
                  ['Port', urlParsed.port],
                  ['Path', urlParsed.pathname],
                  ['Hash', urlParsed.hash],
                ].map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{v}</span>
                  </div>
                ))}
                {urlParsed.params.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Query Parameters</span>
                    {urlParsed.params.map(([k, v], i) => (
                      <div key={i} className="p-2 mt-1 rounded-lg bg-slate-50 dark:bg-slate-800 flex justify-between font-mono">
                        <span>{k}</span><span>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Enter a full URL and click Parse URL.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 290 — USER-AGENT PARSER */}
      {toolId === 290 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Play className="w-4 h-4 text-sky-500" /> User-Agent Parser
            </h3>
            <textarea
              value={uaInput}
              onChange={(e) => setUaInput(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
            />
            <button onClick={handleParseUa} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Parse User-Agent
            </button>
          </div>
          <div className="space-y-4">
            {uaResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-2.5 text-xs">
                {[
                  ['Browser', uaResult.browser],
                  ['Operating System', uaResult.os],
                  ['Rendering Engine', uaResult.engine],
                  ['Device Type', uaResult.device],
                ].map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Paste a user-agent string (or use your own, pre-filled) and click Parse.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 291 — HTTP STATUS CODE REFERENCE */}
      {toolId === 291 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              HTTP Status Code Reference
            </h3>
            <input
              type="text"
              placeholder="Search code or description (e.g. 404, Unauthorized)..."
              value={httpSearch}
              onChange={(e) => setHttpSearch(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredHttpCodes.map((item) => (
                <div key={item.code} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sky-600 dark:text-sky-400 mr-2">{item.code}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{item.name}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 292 — MIME TYPE REFERENCE */}
      {toolId === 292 && (
        <div className="grid grid-cols-1 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">MIME Type Reference</h3>
            <input
              type="text"
              placeholder="Search by extension or MIME type..."
              value={mimeSearch}
              onChange={(e) => setMimeSearch(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
            />
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredMimeTypes.map((item) => (
                <div key={item.ext} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between gap-3">
                  <span className="font-mono font-bold text-sky-600 dark:text-sky-400 shrink-0">{item.ext}</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300 text-right">{item.mime}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 293 — MARKDOWN CODE FORMATTER */}
      {toolId === 293 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-500" /> Markdown Code Formatter
            </h3>
            <textarea value={mdInput} onChange={(e) => setMdInput(e.target.value)} rows={12} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            <button onClick={handleFormatMarkdown} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Format Markdown
            </button>
          </div>
          <div className="space-y-4">
            {mdHasRun ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Formatted Markdown</span>
                  <button onClick={() => handleCopyText(mdOutput)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-[360px] overflow-y-auto">{mdOutput}</pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Normalizes headings, bullet markers, trailing whitespace and extra blank lines.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 294 — SQL INSERT GENERATOR */}
      {toolId === 294 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-500" /> SQL Insert Generator
            </h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Table Name</label>
              <input type="text" value={sqlTable} onChange={(e) => setSqlTable(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Columns (comma-separated)</label>
              <input type="text" value={sqlColumns} onChange={(e) => setSqlColumns(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Rows (one per line, comma-separated values)</label>
              <textarea value={sqlRows} onChange={(e) => setSqlRows(e.target.value)} rows={6} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <button onClick={handleGenerateSqlInsert} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Generate SQL
            </button>
          </div>
          <div className="space-y-4">
            {sqlHasRun ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Generated SQL</span>
                  <button onClick={() => handleCopyText(sqlOutput)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-[360px] overflow-y-auto">{sqlOutput}</pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Fill in table, columns, and rows, then click Generate SQL.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 295 — MOCK JSON GENERATOR */}
      {toolId === 295 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-sky-500" /> Mock JSON Generator
            </h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Schema (one field per line: name:type — types: string, number, boolean, uuid, email, date)
              </label>
              <textarea value={mockSchema} onChange={(e) => setMockSchema(e.target.value)} rows={7} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-xs"><span>Number of Records: {mockCount}</span></div>
              <input type="range" min="1" max="20" value={mockCount} onChange={(e) => setMockCount(Number(e.target.value))} className="w-full accent-sky-600" />
            </div>
            <button onClick={handleGenerateMockJson} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Generate Mock Data
            </button>
          </div>
          <div className="space-y-4">
            {mockHasRun ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Generated JSON</span>
                  <button onClick={() => handleCopyText(mockOutput)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-[360px] overflow-y-auto">{mockOutput}</pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Define a schema and click Generate Mock Data. Values are synthetic placeholders, not real people's data.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 296 — API REQUEST BUILDER */}
      {toolId === 296 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-sky-500" /> API Request Builder
            </h3>
            <div className="flex gap-2">
              <select value={apiMethod} onChange={(e) => setApiMethod(e.target.value as any)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const).map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Headers (one per line: Key: Value)</label>
              <textarea value={apiHeaders} onChange={(e) => setApiHeaders(e.target.value)} rows={3} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            {apiMethod !== 'GET' && apiMethod !== 'DELETE' && (
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Request Body</label>
                <textarea value={apiBody} onChange={(e) => setApiBody(e.target.value)} rows={4} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
              </div>
            )}
            <button onClick={handleSendApiRequest} disabled={apiLoading} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs">
              {apiLoading ? 'Sending…' : 'Send Request'}
            </button>
            {apiError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{apiError}</div>}
          </div>
          <div className="space-y-4">
            {apiResponse ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-3">
                <span className={`text-xs font-bold uppercase tracking-wider ${apiResponse.status < 400 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  Status: {apiResponse.status}
                </span>
                <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] whitespace-pre-wrap max-h-[120px] overflow-y-auto">{apiResponse.headers}</pre>
                <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-[260px] overflow-y-auto">{apiResponse.body}</pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Requests are sent directly from your browser to the target server; cross-origin servers without CORS enabled may reject them.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 297 — cURL CONVERTER */}
      {toolId === 297 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-500" /> cURL Converter
            </h3>
            <div className="flex gap-2">
              <button onClick={() => setCurlDirection('build')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${curlDirection === 'build' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Build cURL</button>
              <button onClick={() => setCurlDirection('parse')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${curlDirection === 'parse' ? 'bg-sky-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>Parse cURL</button>
            </div>
            {curlDirection === 'build' ? (
              <>
                <div className="flex gap-2">
                  <select value={apiMethod} onChange={(e) => setApiMethod(e.target.value as any)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                    {(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const).map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
                </div>
                <textarea value={apiHeaders} onChange={(e) => setApiHeaders(e.target.value)} rows={3} placeholder="Key: Value headers" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
                {apiMethod !== 'GET' && apiMethod !== 'DELETE' && (
                  <textarea value={apiBody} onChange={(e) => setApiBody(e.target.value)} rows={3} placeholder="Body" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
                )}
              </>
            ) : (
              <textarea value={curlCommand} onChange={(e) => setCurlCommand(e.target.value)} rows={6} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            )}
            <button
              onClick={curlDirection === 'parse' ? handleParseCurl : () => handleCopyText(buildCurlFromApiFields())}
              className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs"
            >
              {curlDirection === 'parse' ? 'Parse cURL Command' : 'Copy Generated cURL'}
            </button>
          </div>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-3">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                {curlDirection === 'build' ? 'Generated cURL Command' : 'Parsed Request'}
              </span>
              <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-[320px] overflow-y-auto">
                {curlDirection === 'build' ? buildCurlFromApiFields() : (curlParsedResult || 'Click "Parse cURL Command" to see the breakdown.')}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* 298 — QR PAYLOAD INSPECTOR */}
      {toolId === 298 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Hash className="w-4 h-4 text-sky-500" /> QR Payload Inspector
            </h3>
            <p className="text-xs text-slate-500">
              Paste the decoded text content of a QR code (from a scanner app) to break down its structured payload.
            </p>
            <textarea value={qrPayload} onChange={(e) => setQrPayload(e.target.value)} rows={4} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            <button onClick={handleInspectQrPayload} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Inspect Payload
            </button>
          </div>
          <div className="space-y-4">
            {qrParsedOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md">
                <pre className="font-mono text-xs whitespace-pre-wrap">{qrParsedOutput}</pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Supports Wi-Fi, vCard, mailto, tel, sms and URL payload formats.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 299 — CERTIFICATE INSPECTOR */}
      {toolId === 299 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-500" /> Certificate Inspector
            </h3>
            <p className="text-xs text-slate-500">Paste a PEM-encoded X.509 certificate to decode its core fields locally.</p>
            <textarea value={certPem} onChange={(e) => setCertPem(e.target.value)} rows={10} placeholder={'-----BEGIN CERTIFICATE-----\n...\n-----END CERTIFICATE-----'} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            <button onClick={handleInspectCertificate} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Decode Certificate
            </button>
            {certError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{certError}</div>}
          </div>
          <div className="space-y-4">
            {certResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-2.5 text-xs">
                {Object.entries(certResult).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between gap-3">
                    <span className="text-slate-500 shrink-0">{k}</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white text-right break-all">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Decoding happens entirely in your browser via a local DER/X.509 parser.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 300 — IP SUBNET CALCULATOR */}
      {toolId === 300 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-500" /> IP Subnet Calculator
            </h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">IPv4 Address</label>
              <input type="text" value={subnetIp} onChange={(e) => setSubnetIp(e.target.value)} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div>
              <div className="flex justify-between mb-1 text-xs"><span>CIDR Prefix: /{subnetPrefix}</span></div>
              <input type="range" min="0" max="32" value={subnetPrefix} onChange={(e) => setSubnetPrefix(Number(e.target.value))} className="w-full accent-sky-600" />
            </div>
            <button onClick={handleCalculateSubnet} className="w-full py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs">
              Calculate Subnet
            </button>
            {subnetError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{subnetError}</div>}
          </div>
          <div className="space-y-4">
            {subnetResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-2.5 text-xs">
                {Object.entries(subnetResult).map(([k, v]) => (
                  <div key={k} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-bold font-mono text-slate-900 dark:text-white">{v}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Enter an IP address and CIDR prefix, then click Calculate Subnet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
