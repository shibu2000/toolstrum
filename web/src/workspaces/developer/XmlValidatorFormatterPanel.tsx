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
  RefreshCw,
  Code2,
  Terminal,
  Zap,
  ShieldCheck,
  Minimize2,
  Maximize2,
  CheckCheck
} from 'lucide-react';
import { validateXml, formatXml, autoRepairXml, XmlValidationResult } from './devHelpers';

interface XmlValidatorFormatterPanelProps {
  initialValue?: string;
  initialTab?: 'formatter' | 'validator';
}

const XML_PRESETS: Record<string, { label: string; xml: string }> = {
  'SOAP 1.2 Envelope': {
    label: 'SOAP 1.2 Web Service',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ts="https://toolstrum.com/api/v1">
  <soap:Header>
    <ts:AuthToken>sec_live_99f2b87c41a2</ts:AuthToken>
  </soap:Header>
  <soap:Body>
    <ts:GetDiagnosticsRequest>
      <ts:ClusterId>us-east-cluster-04</ts:ClusterId>
      <ts:IncludeTelemetry>true</ts:IncludeTelemetry>
    </ts:GetDiagnosticsRequest>
  </soap:Body>
</soap:Envelope>`
  },
  'RSS 2.0 Feed': {
    label: 'RSS 2.0 Feed',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Toolstrum Engineering Blog</title>
    <link>https://toolstrum.com/blog</link>
    <description>Offline-first developer tools and zero-server privacy architecture</description>
    <language>en-us</language>
    <item>
      <title>Zero-Knowledge Client-Side Processing</title>
      <link>https://toolstrum.com/blog/zero-knowledge</link>
      <description><![CDATA[Discover how Toolstrum keeps 100% of your data on-device without any cloud leakage.]]></description>
      <pubDate>Sun, 15 Nov 2026 09:00:00 GMT</pubDate>
    </item>
  </channel>
</rss>`
  },
  'SVG Vector Graphic': {
    label: 'SVG Vector Document',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284c7" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="url(#primaryGrad)" stroke="#0369a1" stroke-width="2" />
  <path d="M30 50 L45 65 L70 35" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
</svg>`
  },
  'Maven POM': {
    label: 'Maven pom.xml',
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.toolstrum.core</groupId>
  <artifactId>toolstrum-crypto-engine</artifactId>
  <version>3.4.0</version>
  <packaging>jar</packaging>
  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
  </properties>
</project>`
  }
};

export const XmlValidatorFormatterPanel: React.FC<XmlValidatorFormatterPanelProps> = ({
  initialValue,
  initialTab = 'formatter'
}) => {
  const [activeTab, setActiveTab] = useState<'formatter' | 'validator'>(initialTab);
  const [xmlInput, setXmlInput] = useState<string>(initialValue || XML_PRESETS['SOAP 1.2 Envelope'].xml);
  const [indentSize, setIndentSize] = useState<2 | 4 | 'min'>(2);
  const [selfCloseEmpty, setSelfCloseEmpty] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [repairNotice, setRepairNotice] = useState<string[] | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation state
  const validation: XmlValidationResult = useMemo(() => {
    return validateXml(xmlInput);
  }, [xmlInput]);

  // Formatted output
  const formattedXml = useMemo(() => {
    if (!xmlInput.trim()) return '';
    try {
      return formatXml(xmlInput, indentSize, { selfCloseEmpty });
    } catch (err: any) {
      return `<!-- Error during formatting: ${err?.message || 'Syntax error'} -->\n${xmlInput}`;
    }
  }, [xmlInput, indentSize, selfCloseEmpty]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([xmlInput]).size;
    const formattedBytes = new Blob([formattedXml]).size;
    const deltaBytes = formattedBytes - rawBytes;
    const deltaPercent = rawBytes > 0 ? ((deltaBytes / rawBytes) * 100).toFixed(1) : '0';
    return {
      rawBytes,
      formattedBytes,
      deltaBytes,
      deltaPercent,
    };
  }, [xmlInput, formattedXml]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = activeTab === 'formatter' ? formattedXml : xmlInput;
    const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum-${activeTab === 'formatter' ? 'formatted' : 'document'}.xml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setXmlInput(text);
        setRepairNotice(null);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAutoRepair = () => {
    const { repaired, repairs } = autoRepairXml(xmlInput);
    setXmlInput(repaired);
    setRepairNotice(repairs.length > 0 ? repairs : ['No structural syntax fixes needed.']);
    setTimeout(() => setRepairNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <FileCode className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              XML Validator & Formatter
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Strict RFC 7303 syntax verification, tag hierarchy linting & high-speed XML beautification.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('formatter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'formatter'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Formatter & Beautifier
          </button>
          <button
            onClick={() => setActiveTab('validator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'validator'
                ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Validator & Linter
            {!validation.valid && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(XML_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => {
              setXmlInput(item.xml);
              setRepairNotice(null);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Repair Alert Notification */}
      {repairNotice && (
        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-start gap-3">
          <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-sky-900 dark:text-sky-200">Auto-Repair Engine Applied:</h4>
            <ul className="text-xs text-sky-700 dark:text-sky-300 list-disc list-inside space-y-0.5">
              {repairNotice.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: XML Source Editor */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source XML
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.rawBytes.toLocaleString()} B)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Auto Repair Button */}
              <button
                onClick={handleAutoRepair}
                title="Auto repair unclosed tags, unquoted attributes, and naked ampersands"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Auto-Repair
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload XML file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml,.rss,.atom,.svg,.soap,.pom,.plist,text/xml"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => handleCopy(xmlInput)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  setXmlInput('');
                  setRepairNotice(null);
                }}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={xmlInput}
              onChange={(e) => {
                setXmlInput(e.target.value);
                setRepairNotice(null);
              }}
              placeholder="Paste or type raw XML markup here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Dynamic Formatter or Validator Output */}
        {activeTab === 'formatter' ? (
          /* FORMATTER VIEW */
          <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {/* Header with formatting options */}
            <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Formatted XML
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  ({telemetry.formattedBytes.toLocaleString()} B ·{' '}
                  <span
                    className={
                      Number(telemetry.deltaPercent) < 0
                        ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        : 'text-slate-500'
                    }
                  >
                    {Number(telemetry.deltaPercent) > 0 ? `+${telemetry.deltaPercent}%` : `${telemetry.deltaPercent}%`}
                  </span>
                  )
                </span>
              </div>

              {/* Format Controls */}
              <div className="flex items-center gap-2">
                {/* Indent selector */}
                <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setIndentSize(2)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      indentSize === 2
                        ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    2s
                  </button>
                  <button
                    onClick={() => setIndentSize(4)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      indentSize === 4
                        ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    4s
                  </button>
                  <button
                    onClick={() => setIndentSize('min')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      indentSize === 'min'
                        ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Minify
                  </button>
                </div>

                {/* Self Close Empty Toggle */}
                <button
                  onClick={() => setSelfCloseEmpty(!selfCloseEmpty)}
                  className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                    selfCloseEmpty
                      ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                  title="Collapse <tag></tag> to <tag />"
                >
                  &lt;tag /&gt;
                </button>

                <button
                  onClick={() => handleCopy(formattedXml)}
                  title="Copy Formatted XML"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                  onClick={handleDownload}
                  title="Download .xml file"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Output Display */}
            <div className="p-4 flex-1 flex flex-col">
              <textarea
                readOnly
                value={formattedXml}
                rows={18}
                spellCheck={false}
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all"
              />
            </div>
          </div>
        ) : (
          /* VALIDATOR VIEW */
          <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden p-6 space-y-6">
            {/* Status Banner */}
            <div
              className={`p-5 rounded-2xl border-2 flex items-start gap-4 transition-all ${
                validation.valid
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-500/40 text-rose-900 dark:text-rose-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  validation.valid
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400'
                }`}
              >
                {validation.valid ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
              </div>

              <div className="space-y-1 flex-1">
                <h3 className="text-sm font-bold">
                  {validation.valid
                    ? 'Valid XML Document Structure'
                    : 'XML Syntax / Hierarchy Error Detected'}
                </h3>
                <p className="text-xs opacity-90 leading-relaxed">
                  {validation.valid
                    ? `Complies with XML 1.0 / RFC 7303 specifications with well-formed tag matching and nesting.`
                    : validation.error || 'Syntax parsing failure.'}
                </p>

                {validation.line && (
                  <div className="mt-2 inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 font-mono text-xs font-semibold">
                    <span>Line: {validation.line}</span>
                    <span>·</span>
                    <span>Column: {validation.column || 1}</span>
                  </div>
                )}
              </div>

              {!validation.valid && (
                <button
                  onClick={handleAutoRepair}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-xs flex items-center gap-1.5 shrink-0 self-start sm:self-center"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-Fix Syntax
                </button>
              )}
            </div>

            {/* Document Structure Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Root Element
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white truncate block">
                  &lt;{validation.rootElement || 'none'}&gt;
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Elements Audited
                </span>
                <span className="text-sm font-bold font-mono text-sky-600 dark:text-sky-400 block">
                  {validation.nodes ?? 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  Max Hierarchy Depth
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                  {validation.maxDepth ?? 0}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">
                  CDATA / Comments
                </span>
                <span className="text-sm font-bold font-mono text-slate-900 dark:text-white block">
                  {validation.cdataCount ?? 0} / {validation.commentCount ?? 0}
                </span>
              </div>
            </div>

            {/* Warnings list if any */}
            {validation.warnings && validation.warnings.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Structure Warnings ({validation.warnings.length}):
                </h4>
                <ul className="text-xs text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
                  {validation.warnings.map((w, idx) => (
                    <li key={idx}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Feature & Standards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <CheckCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Strict RFC 7303 Validation</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Detects mismatched closing tags, missing quotes, raw naked ampersands, and duplicate element attributes.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Smart Auto-Repair Engine</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Automatically closes dangling tags, encloses unquoted attributes in double quotes, and escapes raw & characters.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Zero Cloud Leakage</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              100% client-side execution in memory. Sensitive enterprise SOAP payloads and API configs never leave your device.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
