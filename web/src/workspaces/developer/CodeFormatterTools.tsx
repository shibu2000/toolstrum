import React, { useState } from 'react';
import { Copy, Check, Download, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import {
  formatYaml,
  validateYaml,
  yamlToJsonObject,
  jsonToYaml,
  validateXml,
  formatHtml,
  minifyHtml,
  formatCss,
  minifyCss,
  formatJs,
  minifyJs,
  formatSql,
  minifySql,
  explainSql,
} from './devHelpers';

interface ToolProps {
  copied: boolean;
  onCopy: (text: string) => void;
}

// ========================================================
// 251 — YAML FORMATTER
// ========================================================
export const YamlFormatterTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [yamlInput, setYamlInput] = useState(
`apiVersion: apps/v1
kind: Deployment
metadata:
  name: toolstrum-web
  labels:
    app: toolstrum
spec:
  replicas: 3
  selector:
    matchLabels:
      app: toolstrum
  template:
    metadata:
      labels:
        app: toolstrum
    spec:
      containers:
      - name: web
        image: toolstrum:2.0
        ports:
        - containerPort: 80`
  );

  const formatted = formatYaml(yamlInput);

  const handleDownload = () => {
    const blob = new Blob([formatted], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            YAML Input
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {yamlInput.split('\n').length} lines
          </span>
        </div>
        <textarea
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
          rows={15}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          placeholder="Paste YAML here..."
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Beautified YAML Output
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Download .yaml"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              <button
                onClick={() => onCopy(formatted)}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] leading-relaxed">
            {formatted}
          </pre>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          Clean 2-space indentation • Normalizes mapping keys & lists • 100% Offline
        </p>
      </div>
    </div>
  );
};

// ========================================================
// 252 — YAML VALIDATOR
// ========================================================
export const YamlValidatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [yamlInput, setYamlInput] = useState(
`server:
  host: 127.0.0.1
  port: 8080
  security:
    ssl_enabled: true
    ciphers:
      - TLS_AES_256_GCM_SHA384
      - TLS_CHACHA20_POLY1305_SHA256`
  );

  const validation = validateYaml(yamlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            YAML to Validate
          </label>
          <span className="text-[11px] text-slate-400 font-mono">
            {yamlInput.split('\n').length} lines
          </span>
        </div>
        <textarea
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          placeholder="Paste YAML here..."
        />
      </div>

      <div className="space-y-4">
        <div
          className={`p-6 rounded-2xl border-2 shadow-md space-y-3 transition-colors ${
            validation.valid
              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/40'
              : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-500/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {validation.valid ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <h3
              className={`text-sm font-bold ${
                validation.valid
                  ? 'text-emerald-800 dark:text-emerald-300'
                  : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              {validation.valid ? 'Valid YAML Syntax' : 'YAML Syntax Error Detected'}
            </h3>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {validation.valid
              ? 'All indentation, mappings, and lists conform to YAML syntax specifications.'
              : `${validation.error}${validation.line ? ` (near line ${validation.line})` : ''}`}
          </p>

          {validation.line && (
            <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/50 text-xs font-mono text-rose-700 dark:text-rose-300">
              Line {validation.line}: {yamlInput.split('\n')[validation.line - 1]}
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            YAML Validation Rules Checked:
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>No tab characters permitted for indentation (spaces only)</li>
            <li>Colons in key-value pairs must be followed by a space</li>
            <li>Consistent hierarchy indentation levels</li>
            <li>Proper list hyphen prefixing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 253 — YAML TO JSON
// ========================================================
export const YamlToJsonTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [yamlInput, setYamlInput] = useState(
`app: Toolstrum
version: 2.0
settings:
  offline_mode: true
  encryption: AES-256
tags:
  - utilities
  - developer
  - privacy`
  );

  const parsed = yamlToJsonObject(yamlInput);
  const jsonOutput = parsed.data ? JSON.stringify(parsed.data, null, 2) : '';

  const handleDownload = () => {
    if (!jsonOutput) return;
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          YAML Input
        </label>
        <textarea
          value={yamlInput}
          onChange={(e) => setYamlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          placeholder="Paste YAML here..."
        />
        {parsed.error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {parsed.error}
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Converted JSON Output
          </span>
          <div className="flex items-center gap-2">
            {jsonOutput && (
              <>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save .json</span>
                </button>
                <button
                  onClick={() => onCopy(jsonOutput)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </>
            )}
          </div>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] leading-relaxed">
          {jsonOutput || 'Enter valid YAML on the left to see the converted JSON.'}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 254 — JSON TO YAML
// ========================================================
export const JsonToYamlTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [jsonInput, setJsonInput] = useState(
`{
  "service": "api-gateway",
  "port": 3000,
  "routes": [
    { "path": "/users", "method": "GET", "auth": true },
    { "path": "/health", "method": "GET", "auth": false }
  ],
  "cache": {
    "enabled": true,
    "ttlSeconds": 3600
  }
}`
  );

  let yamlOutput = '';
  let jsonError = '';
  try {
    const obj = JSON.parse(jsonInput);
    yamlOutput = jsonToYaml(obj);
  } catch (e: any) {
    jsonError = `JSON syntax error: ${e.message}`;
  }

  const handleDownload = () => {
    if (!yamlOutput) return;
    const blob = new Blob([yamlOutput], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          JSON Input
        </label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          placeholder="Paste JSON here..."
        />
        {jsonError && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium">
            {jsonError}
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Converted YAML Output
          </span>
          <div className="flex items-center gap-2">
            {yamlOutput && (
              <>
                <button
                  onClick={handleDownload}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Save .yaml</span>
                </button>
                <button
                  onClick={() => onCopy(yamlOutput)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </>
            )}
          </div>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] leading-relaxed">
          {yamlOutput || 'Enter valid JSON on the left to see the converted YAML.'}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 255 — XML VALIDATOR
// ========================================================
export const XmlValidatorTool: React.FC<ToolProps> = () => {
  const [xmlInput, setXmlInput] = useState(
`<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
  <book category="computing">
    <title lang="en">Learning Web Development</title>
    <author>Jane Doe</author>
    <year>2026</year>
    <price>39.99</price>
  </book>
</bookstore>`
  );

  const res = validateXml(xmlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          XML Document
        </label>
        <textarea
          value={xmlInput}
          onChange={(e) => setXmlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div className="space-y-4">
        <div
          className={`p-6 rounded-2xl border-2 shadow-md space-y-3 transition-colors ${
            res.valid
              ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/40'
              : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-500/40'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {res.valid ? (
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            )}
            <h3
              className={`text-sm font-bold ${
                res.valid ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
              }`}
            >
              {res.valid ? 'Well-Formed XML Document' : 'XML Parsing Error'}
            </h3>
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {res.valid
              ? `Root Element: <${res.rootElement}> with ${res.childCount} direct child element(s).`
              : res.error}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
            XML Syntax Standards Verified:
          </h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Strict matching opening and closing tag names</li>
            <li>Proper quoting of all attribute values</li>
            <li>Single root container element hierarchy</li>
            <li>Valid XML entity references</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 256 — HTML FORMATTER
// ========================================================
export const HtmlFormatterTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [htmlInput, setHtmlInput] = useState(
`<div class="card"><header><h1>Toolstrum</h1><p>Offline toolkit</p></header><main><section><button class="btn">Click me</button></section></main></div>`
  );

  const formatted = formatHtml(htmlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Raw HTML Markup
        </label>
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
          placeholder="Paste HTML here..."
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Formatted HTML
          </span>
          <button
            onClick={() => onCopy(formatted)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] leading-relaxed">
          {formatted}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 257 — HTML MINIFIER
// ========================================================
export const HtmlMinifierTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [htmlInput, setHtmlInput] = useState(
`<!-- Main Container -->
<div class="hero-container">
  <!-- Title section -->
  <h1 class="title">  Your Everyday Toolkit  </h1>
  <p class="subtitle">
    Fast, offline, and secure utilities for web professionals.
  </p>
</div>`
  );

  const minified = minifyHtml(htmlInput);
  const origBytes = new TextEncoder().encode(htmlInput).length;
  const miniBytes = new TextEncoder().encode(minified).length;
  const savings = origBytes > 0 ? Math.round(((origBytes - miniBytes) / origBytes) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            HTML Source
          </label>
          <span className="text-[11px] text-slate-400 font-mono">{origBytes} bytes</span>
        </div>
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Minified HTML
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              {savings}% smaller
            </span>
          </div>
          <button
            onClick={() => onCopy(minified)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] break-all whitespace-pre-wrap leading-relaxed">
          {minified}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 258 — CSS FORMATTER
// ========================================================
export const CssFormatterTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [cssInput, setCssInput] = useState(
`.btn{background:#3b82f6;color:#ffffff;border-radius:12px;padding:8px 16px;font-size:14px;cursor:pointer;}.btn:hover{background:#2563eb;}`
  );

  const formatted = formatCss(cssInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Minified / Messy CSS
        </label>
        <textarea
          value={cssInput}
          onChange={(e) => setCssInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Beautified CSS
          </span>
          <button
            onClick={() => onCopy(formatted)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] leading-relaxed">
          {formatted}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 259 — CSS MINIFIER
// ========================================================
export const CssMinifierTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [cssInput, setCssInput] = useState(
`/* Primary Card Stylesheet */
.card-container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

/* Header within card */
.card-header {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 12px;
}`
  );

  const minified = minifyCss(cssInput);
  const origBytes = new TextEncoder().encode(cssInput).length;
  const miniBytes = new TextEncoder().encode(minified).length;
  const savings = origBytes > 0 ? Math.round(((origBytes - miniBytes) / origBytes) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            CSS Source
          </label>
          <span className="text-[11px] text-slate-400 font-mono">{origBytes} bytes</span>
        </div>
        <textarea
          value={cssInput}
          onChange={(e) => setCssInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Minified CSS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              {savings}% smaller
            </span>
          </div>
          <button
            onClick={() => onCopy(minified)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] break-all whitespace-pre-wrap leading-relaxed">
          {minified}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 260 — JAVASCRIPT FORMATTER
// ========================================================
export const JsFormatterTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [jsInput, setJsInput] = useState(
`function calculateTotal(items,taxRate){let subtotal=0;for(let i=0;i<items.length;i++){subtotal+=items[i].price*items[i].qty;}const tax=subtotal*taxRate;return{subtotal,tax,total:subtotal+tax};}`
  );

  const formatted = formatJs(jsInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          JavaScript / TypeScript Input
        </label>
        <textarea
          value={jsInput}
          onChange={(e) => setJsInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Beautified JavaScript
          </span>
          <button
            onClick={() => onCopy(formatted)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] leading-relaxed">
          {formatted}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 261 — JAVASCRIPT MINIFIER
// ========================================================
export const JsMinifierTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [jsInput, setJsInput] = useState(
`// Helper to compute discounted checkout price
function applyDiscount(cart, couponCode) {
  /* Coupon percentage table */
  const coupons = {
    'SUMMER20': 0.20,
    'WELCOME10': 0.10
  };
  const discountRate = coupons[couponCode] || 0;
  return cart.total * (1 - discountRate);
}`
  );

  const minified = minifyJs(jsInput);
  const origBytes = new TextEncoder().encode(jsInput).length;
  const miniBytes = new TextEncoder().encode(minified).length;
  const savings = origBytes > 0 ? Math.round(((origBytes - miniBytes) / origBytes) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            JavaScript Source
          </label>
          <span className="text-[11px] text-slate-400 font-mono">{origBytes} bytes</span>
        </div>
        <textarea
          value={jsInput}
          onChange={(e) => setJsInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Minified JS Code
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              {savings}% smaller
            </span>
          </div>
          <button
            onClick={() => onCopy(minified)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] break-all whitespace-pre-wrap leading-relaxed">
          {minified}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 262 — SQL FORMATTER
// ========================================================
export const SqlFormatterTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [sqlInput, setSqlInput] = useState(
`select u.id, u.email, count(o.id) as total_orders, sum(o.amount) as revenue from users u left join orders o on u.id = o.user_id where u.active = true and o.created_at >= '2026-01-01' group by u.id, u.email having count(o.id) > 2 order by revenue desc limit 25;`
  );

  const formatted = formatSql(sqlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Raw SQL Query
        </label>
        <textarea
          value={sqlInput}
          onChange={(e) => setSqlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Aligned & Formatted SQL
          </span>
          <button
            onClick={() => onCopy(formatted)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] leading-relaxed">
          {formatted}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 263 — SQL MINIFIER
// ========================================================
export const SqlMinifierTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [sqlInput, setSqlInput] = useState(
`-- Fetch active subscriber counts by tier
SELECT
    tier_name,
    COUNT(*) AS active_subscribers,
    AVG(monthly_spend) AS avg_revenue
FROM subscriptions
WHERE status = 'active'
    AND auto_renew = 1
GROUP BY tier_name
ORDER BY active_subscribers DESC;`
  );

  const minified = minifySql(sqlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Multi-Line SQL
        </label>
        <textarea
          value={sqlInput}
          onChange={(e) => setSqlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Single-Line Compact SQL
          </span>
          <button
            onClick={() => onCopy(minified)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[380px] break-all whitespace-pre-wrap leading-relaxed">
          {minified}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 264 — SQL QUERY EXPLAINER
// ========================================================
export const SqlQueryExplainerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [sqlInput, setSqlInput] = useState(
`SELECT u.username, o.order_id, p.product_name, o.amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id
LEFT JOIN products p ON o.product_id = p.id
WHERE o.status = 'shipped' AND o.amount > 100
GROUP BY u.username, o.order_id
ORDER BY o.amount DESC
LIMIT 10;`
  );

  const exp = explainSql(sqlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          SQL Query to Analyze
        </label>
        <textarea
          value={sqlInput}
          onChange={(e) => setSqlInput(e.target.value)}
          rows={14}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
        />
      </div>

      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
          <h4 className="text-xs font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider mb-1">
            Query Overview: {exp.type}
          </h4>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {exp.summary}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
          <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Tables Involved</span>
            <span className="font-mono text-slate-900 dark:text-white font-semibold">
              {exp.tables.join(', ') || 'N/A'}
            </span>
          </div>
          {exp.joins.length > 0 && (
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Table Joins</span>
              <div className="text-right space-y-1">
                {exp.joins.map((j, idx) => (
                  <div key={idx} className="font-mono text-slate-900 dark:text-white text-[11px]">
                    {j}
                  </div>
                ))}
              </div>
            </div>
          )}
          {exp.filters.length > 0 && (
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">WHERE Filters</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {exp.filters.join(' AND ')}
              </span>
            </div>
          )}
          {exp.grouping.length > 0 && (
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Grouped By</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {exp.grouping.join(', ')}
              </span>
            </div>
          )}
          {exp.sorting.length > 0 && (
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-500 uppercase text-[10px]">Sorted By</span>
              <span className="font-mono text-slate-900 dark:text-white font-semibold">
                {exp.sorting.join(', ')}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-bold text-slate-500 uppercase text-[10px]">Result Limit</span>
            <span className="font-mono text-slate-900 dark:text-white font-semibold">
              {exp.limit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
