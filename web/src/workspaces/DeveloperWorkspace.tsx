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
import { JsonFormatterPanel } from './developer/JsonFormatterPanel';
import { JsonValidatorPanel } from './developer/JsonValidatorPanel';
import { JsonMinifierPanel } from './developer/JsonMinifierPanel';
import { JsonDiffPanel } from './developer/JsonDiffPanel';
import { JsonPathPanel } from './developer/JsonPathPanel';
import { JsonToTypePanel } from './developer/JsonToTypePanel';
import { JsonSchemaGeneratorPanel } from './developer/JsonSchemaGeneratorPanel';
import { YamlFormatterPanel } from './developer/YamlFormatterPanel';
import { YamlValidatorPanel } from './developer/YamlValidatorPanel';
import { YamlJsonConverterPanel } from './developer/YamlJsonConverterPanel';
import { XmlValidatorFormatterPanel } from './developer/XmlValidatorFormatterPanel';
import { HtmlFormatterPanel } from './developer/HtmlFormatterPanel';
import { HtmlMinifierPanel } from './developer/HtmlMinifierPanel';
import { CssFormatterPanel } from './developer/CssFormatterPanel';
import { CssMinifierPanel } from './developer/CssMinifierPanel';
import { JsFormatterPanel } from './developer/JsFormatterPanel';
import { JsMinifierPanel } from './developer/JsMinifierPanel';
import { SqlFormatterPanel } from './developer/SqlFormatterPanel';
import { SqlMinifierPanel } from './developer/SqlMinifierPanel';
import { SqlQueryExplainerPanel } from './developer/SqlQueryExplainerPanel';
import { RegexTesterPanel } from './developer/RegexTesterPanel';
import { RegexExplainerPanel } from './developer/RegexExplainerPanel';
import { Base64CodecPanel } from './developer/Base64CodecPanel';
import { UrlCodecPanel } from './developer/UrlCodecPanel';
import { HtmlEntityCodecPanel } from './developer/HtmlEntityCodecPanel';
import { JwtInspectorPanel } from './developer/JwtInspectorPanel';
import { UuidGeneratorPanel } from './developer/UuidGeneratorPanel';
import { UlidGeneratorPanel } from './developer/UlidGeneratorPanel';
import { HashGeneratorPanel } from './developer/HashGeneratorPanel';
import { HmacGeneratorPanel } from './developer/HmacGeneratorPanel';
import { PasswordGeneratorPanel } from './developer/PasswordGeneratorPanel';
import { BcryptInspectorPanel } from './developer/BcryptInspectorPanel';
import { ColorConverterPanel } from './developer/ColorConverterPanel';
import { GradientGeneratorPanel } from './developer/GradientGeneratorPanel';
import { BoxShadowGeneratorPanel } from './developer/BoxShadowGeneratorPanel';
import { BorderRadiusGeneratorPanel } from './developer/BorderRadiusGeneratorPanel';
import { FlexboxPlaygroundPanel } from './developer/FlexboxPlaygroundPanel';
import { GridGeneratorPanel } from './developer/GridGeneratorPanel';
import { UnixTimestampPanel } from './developer/UnixTimestampPanel';
import { CrontabHelperPanel } from './developer/CrontabHelperPanel';
import { DiffPatchPanel } from './developer/DiffPatchPanel';
import { UrlParserPanel } from './developer/UrlParserPanel';
import { UserAgentParserPanel } from './developer/UserAgentParserPanel';
import { HttpStatusCodePanel } from './developer/HttpStatusCodePanel';
import { MimeTypePanel } from './developer/MimeTypePanel';
import { MarkdownFormatterPanel } from './developer/MarkdownFormatterPanel';
import { SqlInsertGeneratorPanel } from './developer/SqlInsertGeneratorPanel';
import { MockJsonGeneratorPanel } from './developer/MockJsonGeneratorPanel';
import {
  YamlFormatterTool,
  YamlValidatorTool,
  YamlToJsonTool,
  JsonToYamlTool,
  XmlValidatorTool,
  HtmlFormatterTool,
  HtmlMinifierTool,
  CssFormatterTool,
  CssMinifierTool,
  JsFormatterTool,
  JsMinifierTool,
  SqlFormatterTool,
  SqlMinifierTool,
  SqlQueryExplainerTool,
} from './developer/CodeFormatterTools';
import {
  RegexTesterTool,
  RegexExplainerTool,
} from './developer/RegexTools';
import {
  Base64EncoderTool,
  Base64DecoderTool,
  UrlEncoderTool,
  UrlDecoderTool,
} from './developer/CodecTools';

interface DeveloperWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const DeveloperWorkspace: React.FC<DeveloperWorkspaceProps> = ({
  toolId,
  accentColor = '#0EA5E9',
}) => {
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

      {/* 244 — JSON FORMATTER (BEAUTIFY & TREE) — dedicated modern panel */}
      {toolId === 244 && <JsonFormatterPanel initialValue={jsonInput} />}

      {/* 245 — JSON VALIDATOR & SCHEMA LINTER — dedicated modern panel */}
      {toolId === 245 && <JsonValidatorPanel initialValue={jsonInput} />}

      {/* 246 — JSON MINIFIER & COMPRESSION CRUNCHER — dedicated modern panel */}
      {toolId === 246 && <JsonMinifierPanel initialValue={jsonInput} />}

      {/* 247 — JSON DIFF & OBJECT COMPARISON — dedicated modern panel */}
      {toolId === 247 && <JsonDiffPanel initialLeft={jsonDiffLeft} initialRight={jsonDiffRight} />}

      {/* 248 — JSONPATH EVALUATOR & NODE EXTRACTOR — dedicated modern panel */}
      {toolId === 248 && <JsonPathPanel initialValue={jsonInput} initialQuery={jsonPathQuery} />}

      {/* 249 — JSON TO TYPESCRIPT / GO / RUST / PYTHON — dedicated modern panel */}
      {toolId === 249 && <JsonToTypePanel initialValue={jsonInput} />}

      {/* 250 — JSON TO JSON SCHEMA CONVERTER — dedicated modern panel */}
      {toolId === 250 && <JsonSchemaGeneratorPanel initialValue={jsonInput} />}

      {/* ======================================================== */}
      {/* 251-264: DEDICATED CODE & FORMATTER TOOLS */}
      {/* ======================================================== */}
      {toolId === 251 && <YamlFormatterPanel />}
      {toolId === 252 && <YamlValidatorPanel />}
      {toolId === 253 && <YamlJsonConverterPanel initialDirection="yaml-to-json" />}
      {toolId === 254 && <YamlJsonConverterPanel initialDirection="json-to-yaml" />}
      {toolId === 255 && <XmlValidatorFormatterPanel />}
      {toolId === 256 && <HtmlFormatterPanel />}
      {toolId === 257 && <HtmlMinifierPanel />}
      {toolId === 258 && <CssFormatterPanel />}
      {toolId === 259 && <CssMinifierPanel />}
      {toolId === 260 && <JsFormatterPanel />}
      {toolId === 261 && <JsMinifierPanel />}
      {toolId === 262 && <SqlFormatterPanel />}
      {toolId === 263 && <SqlMinifierPanel />}
      {toolId === 264 && <SqlQueryExplainerPanel />}

      {/* ======================================================== */}
      {/* 265-266: DEDICATED REGEX TOOLS */}
      {/* ======================================================== */}
      {toolId === 265 && <RegexTesterPanel />}
      {toolId === 266 && <RegexExplainerPanel />}

      {/* ======================================================== */}
      {/* 267-272: DEDICATED CODEC TOOLS */}
      {/* ======================================================== */}
      {toolId === 267 && <Base64CodecPanel initialDirection="encode" />}
      {toolId === 268 && <Base64CodecPanel initialDirection="decode" />}
      {toolId === 269 && <UrlCodecPanel initialDirection="encode" />}
      {toolId === 270 && <UrlCodecPanel initialDirection="decode" />}
      {toolId === 271 && <HtmlEntityCodecPanel initialDirection="encode" />}
      {toolId === 272 && <HtmlEntityCodecPanel initialDirection="decode" />}

      {/* ======================================================== */}
      {/* 273-279: DEDICATED SECURITY & CRYPTO TOOLS */}
      {/* ======================================================== */}
      {toolId === 273 && <JwtInspectorPanel />}
      {toolId === 274 && <UuidGeneratorPanel />}
      {toolId === 275 && <UlidGeneratorPanel />}
      {toolId === 276 && <HashGeneratorPanel />}
      {toolId === 277 && <HmacGeneratorPanel />}
      {toolId === 278 && <PasswordGeneratorPanel />}
      {toolId === 279 && <BcryptInspectorPanel />}

      {/* ======================================================== */}
      {/* 280-285: DEDICATED CSS & DESIGN GENERATORS */}
      {/* ======================================================== */}
      {toolId === 280 && <ColorConverterPanel />}
      {toolId === 281 && <GradientGeneratorPanel />}
      {toolId === 282 && <BoxShadowGeneratorPanel />}
      {toolId === 283 && <BorderRadiusGeneratorPanel />}
      {toolId === 284 && <FlexboxPlaygroundPanel />}
      {toolId === 285 && <GridGeneratorPanel />}

      {/* ======================================================== */}
      {/* 286-287: DEDICATED TIME & SCHEDULING TOOLS */}
      {/* ======================================================== */}
      {toolId === 286 && <UnixTimestampPanel />}
      {toolId === 287 && <CrontabHelperPanel />}

      {/* ======================================================== */}
      {/* 288-290: DEDICATED DIFF, URL & USER-AGENT INSPECTORS */}
      {/* ======================================================== */}
      {toolId === 288 && <DiffPatchPanel />}
      {toolId === 289 && <UrlParserPanel />}
      {toolId === 290 && <UserAgentParserPanel />}

      {/* ======================================================== */}
      {/* 291-292: DEDICATED HTTP & MIME TYPE DIRECTORIES */}
      {/* ======================================================== */}
      {toolId === 291 && <HttpStatusCodePanel />}
      {toolId === 292 && <MimeTypePanel />}

      {/* ======================================================== */}
      {/* 293-295: DEDICATED MARKDOWN, SQL INSERT & MOCK DATA GENERATORS */}
      {/* ======================================================== */}
      {toolId === 293 && <MarkdownFormatterPanel />}
      {toolId === 294 && <SqlInsertGeneratorPanel />}
      {toolId === 295 && <MockJsonGeneratorPanel />}

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
