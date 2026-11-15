import React, { useState, useMemo } from 'react';
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  FileCode,
  Layers,
  Code2,
  Hash,
  Clock
} from 'lucide-react';

interface UuidGeneratorPanelProps {
  initialCount?: number;
}

export interface UuidInspectionResult {
  valid: boolean;
  raw: string;
  version?: number | string;
  variant?: string;
  timestamp?: string;
  cleanHex?: string;
  error?: string;
}

export function generateUuidV4(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateUuidV7(): string {
  const now = Date.now();
  const timeHex = now.toString(16).padStart(12, '0'); // 48 bits = 12 hex chars

  // Random 12 bits for ver + seq
  const randA = Math.floor(Math.random() * 0xfff).toString(16).padStart(3, '0');
  // Variant (10xx in binary => 8, 9, a, or b) + random 62 bits
  const varChar = ['8', '9', 'a', 'b'][Math.floor(Math.random() * 4)];
  const randB = Math.floor(Math.random() * 0xfff).toString(16).padStart(3, '0');
  const randC = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  const p1 = timeHex.slice(0, 8);
  const p2 = timeHex.slice(8, 12);
  const p3 = `7${randA}`;
  const p4 = `${varChar}${randB}`;
  const p5 = randC;

  return `${p1}-${p2}-${p3}-${p4}-${p5}`;
}

export function generateUuidV1(): string {
  const now = Date.now();
  // 60-bit timestamp in 100ns intervals since 1582-10-15
  const gregorianOffset = 122192928000000000n;
  const time100ns = BigInt(now) * 10000n + gregorianOffset;
  const timeHex = time100ns.toString(16).padStart(16, '0');

  const timeLow = timeHex.slice(8, 16);
  const timeMid = timeHex.slice(4, 8);
  const timeHiAndVersion = '1' + timeHex.slice(1, 4);

  const clockSeq = Math.floor(Math.random() * 0x3fff) | 0x8000;
  const clockSeqHex = clockSeq.toString(16).padStart(4, '0');

  const node = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeqHex}-${node}`;
}

export function inspectUuid(input: string): UuidInspectionResult {
  const cleaned = input.trim().replace(/[{}"']/g, '');
  const hex = cleaned.replace(/-/g, '').toLowerCase();

  if (hex.length !== 32 || !/^[0-9a-f]{32}$/.test(hex)) {
    return {
      valid: false,
      raw: input,
      error: 'Invalid UUID: Must contain exactly 32 hexadecimal characters (with or without hyphens).'
    };
  }

  if (hex === '00000000000000000000000000000000') {
    return {
      valid: true,
      raw: input,
      version: 'Nil UUID (Empty/Zero)',
      variant: 'N/A',
      cleanHex: hex
    };
  }

  const verDigit = parseInt(hex[12], 16);
  const varDigit = parseInt(hex[16], 16);

  let variant = 'Unknown';
  if ((varDigit & 0x8) === 0) variant = 'NCS backward compatibility';
  else if ((varDigit & 0xc) === 0x8) variant = 'RFC 4122 / Leach-Salz';
  else if ((varDigit & 0xe) === 0xc) variant = 'Microsoft Corporation GUID';
  else variant = 'Reserved for future definition';

  let timestamp: string | undefined;
  if (verDigit === 7) {
    // 48-bit timestamp from first 12 hex chars
    const ms = parseInt(hex.slice(0, 12), 16);
    timestamp = new Date(ms).toISOString() + ` (${new Date(ms).toLocaleString()})`;
  } else if (verDigit === 1) {
    const timeLow = hex.slice(0, 8);
    const timeMid = hex.slice(8, 12);
    const timeHi = hex.slice(13, 16);
    const timeHex = timeHi + timeMid + timeLow;
    try {
      const time100ns = BigInt('0x' + timeHex);
      const gregorianOffset = 122192928000000000n;
      const ms = Number((time100ns - gregorianOffset) / 10000n);
      if (!isNaN(ms) && ms > 0) {
        timestamp = new Date(ms).toISOString() + ` (${new Date(ms).toLocaleString()})`;
      }
    } catch {
      // ignore
    }
  }

  return {
    valid: true,
    raw: input,
    version: verDigit,
    variant,
    timestamp,
    cleanHex: hex
  };
}

export const UuidGeneratorPanel: React.FC<UuidGeneratorPanelProps> = ({ initialCount = 5 }) => {
  const [version, setVersion] = useState<'v4' | 'v7' | 'v1' | 'nil'>('v4');
  const [count, setCount] = useState<number>(initialCount);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [hyphens, setHyphens] = useState<boolean>(true);
  const [braces, setBraces] = useState<boolean>(false);
  const [codeWrap, setCodeWrap] = useState<'plain' | 'json' | 'sql' | 'ts'>('plain');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inspector state
  const [inspectInput, setInspectInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'generator' | 'inspector'>('generator');

  // Trigger regeneration
  const [refreshSeed, setRefreshSeed] = useState(0);

  // Generate UUID list
  const rawList = useMemo(() => {
    // depend on refreshSeed
    void refreshSeed;
    const list: string[] = [];

    for (let i = 0; i < count; i++) {
      let id = '';
      if (version === 'v4') id = generateUuidV4();
      else if (version === 'v7') id = generateUuidV7();
      else if (version === 'v1') id = generateUuidV1();
      else id = '00000000-0000-0000-0000-000000000000';

      if (!hyphens) id = id.replace(/-/g, '');
      if (uppercase) id = id.toUpperCase();
      if (braces) id = `{${id}}`;
      list.push(id);
    }
    return list;
  }, [version, count, uppercase, hyphens, braces, refreshSeed]);

  // Formatted output based on code wrapper
  const formattedOutput = useMemo(() => {
    if (codeWrap === 'json') {
      return JSON.stringify(rawList, null, 2);
    }
    if (codeWrap === 'sql') {
      return `INSERT INTO records (id)\nVALUES\n  ${rawList.map((id) => `('${id}')`).join(',\n  ')};`;
    }
    if (codeWrap === 'ts') {
      return `export const GENERATED_UUIDS: string[] = [\n  ${rawList.map((id) => `'${id}'`).join(',\n  ')}\n];`;
    }
    return rawList.join('\n');
  }, [rawList, codeWrap]);

  const inspectionResult = useMemo(() => {
    if (!inspectInput.trim()) return null;
    return inspectUuid(inspectInput);
  }, [inspectInput]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([formattedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${version}-${count}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200/50 dark:border-sky-800/40">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              UUID Generator &amp; Inspector
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bulk cryptographically secure UUID generator supporting RFC 4122 (v4 random, v1 time) and RFC 9562 (v7 time-sortable).
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bulk Generator
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'inspector'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            UUID Inspector
          </button>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Left Column */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-sky-600" />
              UUID Configuration
            </h3>

            {/* Version Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                UUID Specification:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVersion('v4')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    version === 'v4'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>UUID v4</div>
                  <div className="text-[10px] text-slate-400 font-normal">Crypto Random</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVersion('v7')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    version === 'v7'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    UUID v7
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">New</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-normal">Time-Ordered</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVersion('v1')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    version === 'v1'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>UUID v1</div>
                  <div className="text-[10px] text-slate-400 font-normal">Timestamp + Node</div>
                </button>
                <button
                  type="button"
                  onClick={() => setVersion('nil')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                    version === 'nil'
                      ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>NIL UUID</div>
                  <div className="text-[10px] text-slate-400 font-normal">All Zeros</div>
                </button>
              </div>
            </div>

            {/* Quantity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Quantity</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{count} UUIDs</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Formatting Toggles */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hyphens}
                  onChange={(e) => setHyphens(e.target.checked)}
                  className="rounded accent-sky-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Standard Hyphens</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={uppercase}
                  onChange={(e) => setUppercase(e.target.checked)}
                  className="rounded accent-sky-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Uppercase Letters</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={braces}
                  onChange={(e) => setBraces(e.target.checked)}
                  className="rounded accent-sky-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Enclose in Braces &#123;...&#125;</span>
              </label>
            </div>

            {/* Code Wrapper */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Code Export Wrapper:
              </label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {(['plain', 'json', 'sql', 'ts'] as const).map((wrap) => (
                  <button
                    key={wrap}
                    type="button"
                    onClick={() => setCodeWrap(wrap)}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                      codeWrap === wrap
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 font-bold'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {wrap === 'plain'
                      ? 'Plain List'
                      : wrap === 'json'
                      ? 'JSON Array'
                      : wrap === 'sql'
                      ? 'SQL INSERT'
                      : 'TypeScript'}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setRefreshSeed((s) => s + 1)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Fresh Batch</span>
            </button>
          </div>

          {/* Output Right Column */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  Generated {version.toUpperCase()} Identifiers ({rawList.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy('all', formattedOutput)}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copiedKey === 'all' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'all' ? 'Copied' : 'Copy All'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Download as .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto max-h-[480px]">
              {codeWrap === 'plain' ? (
                <div className="space-y-2">
                  {rawList.map((id, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 font-mono text-xs flex items-center justify-between group shadow-2xs hover:border-sky-300 dark:hover:border-sky-800 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-slate-400 text-[10px] font-mono w-5">
                          {idx + 1}.
                        </span>
                        <span className="text-slate-900 dark:text-slate-100 font-semibold select-all">
                          {id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setInspectInput(id);
                            setActiveTab('inspector');
                          }}
                          className="opacity-0 group-hover:opacity-100 text-[11px] text-sky-600 hover:underline px-1.5 py-0.5 rounded transition-opacity"
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleCopy(`single-${idx}`, id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-600 p-1 rounded transition-opacity"
                          title="Copy UUID"
                        >
                          {copiedKey === `single-${idx}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap leading-relaxed select-all">
                  {formattedOutput}
                </pre>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Inspector Tab */
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Paste Any UUID to Inspect &amp; Validate:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inspectInput}
                onChange={(e) => setInspectInput(e.target.value)}
                placeholder="e.g. 018e3e4a-b567-7b3c-8f12-000000000000 or clean hex string..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
              />
              <button
                onClick={() => setInspectInput(generateUuidV7())}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sample v7
              </button>
              <button
                onClick={() => setInspectInput(generateUuidV4())}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sample v4
              </button>
            </div>
          </div>

          {inspectionResult && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  inspectionResult.valid
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {inspectionResult.valid ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>
                    {inspectionResult.valid
                      ? `Valid RFC UUID (Version ${inspectionResult.version})`
                      : 'Invalid UUID Format'}
                  </span>
                </div>
                {inspectionResult.cleanHex && (
                  <span className="font-mono text-[11px] font-normal">
                    {inspectionResult.cleanHex}
                  </span>
                )}
              </div>

              {inspectionResult.error && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  {inspectionResult.error}
                </p>
              )}

              {inspectionResult.valid && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium">Version:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      UUID v{inspectionResult.version}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {inspectionResult.version === 7
                        ? 'Unix Epoch time-ordered (RFC 9562 standard)'
                        : inspectionResult.version === 4
                        ? 'Cryptographically pseudo-random bits (RFC 4122)'
                        : inspectionResult.version === 1
                        ? 'Time-based with node identifier (RFC 4122)'
                        : 'Standard specification'}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium">Variant:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {inspectionResult.variant}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Defines the layout of bits within the UUID.
                    </div>
                  </div>

                  {inspectionResult.timestamp && (
                    <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-slate-400 font-medium flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        Embedded Timestamp:
                      </span>
                      <div className="font-bold text-sky-600 dark:text-sky-400 text-sm font-mono">
                        {inspectionResult.timestamp}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
