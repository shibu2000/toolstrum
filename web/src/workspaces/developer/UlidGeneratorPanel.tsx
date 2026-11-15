import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Clock,
  Sliders,
  Download,
  Search,
  CheckCircle2,
  XCircle,
  ArrowRightLeft,
  Calendar,
  Layers,
  Hash
} from 'lucide-react';

interface UlidGeneratorPanelProps {
  initialCount?: number;
}

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

export interface UlidItem {
  ulid: string;
  timePart: string;
  randPart: string;
  timestampMs: number;
  dateIso: string;
  dateLocal: string;
}

export function generateSingleUlid(seedTime = Date.now()): UlidItem {
  let t = seedTime;
  let timeStr = '';
  for (let i = 9; i >= 0; i--) {
    timeStr = CROCKFORD_BASE32[t % 32] + timeStr;
    t = Math.floor(t / 32);
  }

  let randStr = '';
  for (let i = 0; i < 16; i++) {
    randStr += CROCKFORD_BASE32[Math.floor(Math.random() * 32)];
  }

  const ulid = timeStr + randStr;
  const date = new Date(seedTime);

  return {
    ulid,
    timePart: timeStr,
    randPart: randStr,
    timestampMs: seedTime,
    dateIso: date.toISOString(),
    dateLocal: date.toLocaleString()
  };
}

export function decodeUlid(ulidStr: string): {
  valid: boolean;
  ulid: string;
  timestampMs?: number;
  dateIso?: string;
  dateLocal?: string;
  timePart?: string;
  randPart?: string;
  uuidEquivalent?: string;
  error?: string;
} {
  const cleaned = ulidStr.trim().toUpperCase();
  if (cleaned.length !== 26) {
    return {
      valid: false,
      ulid: ulidStr,
      error: 'ULID must be exactly 26 characters in length.'
    };
  }

  // Check valid Crockford Base32 characters
  for (const c of cleaned) {
    if (!CROCKFORD_BASE32.includes(c)) {
      return {
        valid: false,
        ulid: ulidStr,
        error: `Invalid character '${c}' in ULID. Only Crockford Base32 characters (0-9, A-Z excluding I, L, O, U) are allowed.`
      };
    }
  }

  // Decode 10-char timestamp (48-bit)
  const timePart = cleaned.slice(0, 10);
  const randPart = cleaned.slice(10);

  let ms = 0;
  for (let i = 0; i < 10; i++) {
    const val = CROCKFORD_BASE32.indexOf(timePart[i]);
    ms = ms * 32 + val;
  }

  const date = new Date(ms);

  // Convert to UUID equivalent by converting 26 base32 chars to 128-bit hex
  let uuidEquivalent: string | undefined;
  try {
    // 128-bit representation
    let big = 0n;
    for (let i = 0; i < 26; i++) {
      big = (big << 5n) | BigInt(CROCKFORD_BASE32.indexOf(cleaned[i]));
    }
    const hex128 = big.toString(16).padStart(32, '0');
    uuidEquivalent = `${hex128.slice(0, 8)}-${hex128.slice(8, 12)}-${hex128.slice(12, 16)}-${hex128.slice(16, 20)}-${hex128.slice(20)}`;
  } catch {
    // ignore
  }

  return {
    valid: true,
    ulid: cleaned,
    timestampMs: ms,
    dateIso: date.toISOString(),
    dateLocal: date.toLocaleString(),
    timePart,
    randPart,
    uuidEquivalent
  };
}

export const UlidGeneratorPanel: React.FC<UlidGeneratorPanelProps> = ({ initialCount = 5 }) => {
  const [count, setCount] = useState<number>(initialCount);
  const [lowercase, setLowercase] = useState<boolean>(false);
  const [codeWrap, setCodeWrap] = useState<'plain' | 'json' | 'sql' | 'ts'>('plain');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inspector state
  const [inspectInput, setInspectInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'generator' | 'inspector'>('generator');
  const [refreshSeed, setRefreshSeed] = useState<number>(0);

  // Generate ULIDs list
  const rawList = useMemo(() => {
    void refreshSeed;
    const now = Date.now();
    const list: UlidItem[] = [];
    for (let i = 0; i < count; i++) {
      // Offset by 1ms to preserve strict monotonic sort order
      const item = generateSingleUlid(now + i);
      if (lowercase) {
        item.ulid = item.ulid.toLowerCase();
        item.timePart = item.timePart.toLowerCase();
        item.randPart = item.randPart.toLowerCase();
      }
      list.push(item);
    }
    return list;
  }, [count, lowercase, refreshSeed]);

  // Code wrapper formatting
  const formattedOutput = useMemo(() => {
    const ids = rawList.map((x) => x.ulid);
    if (codeWrap === 'json') {
      return JSON.stringify(ids, null, 2);
    }
    if (codeWrap === 'sql') {
      return `INSERT INTO records (id)\nVALUES\n  ${ids.map((id) => `('${id}')`).join(',\n  ')};`;
    }
    if (codeWrap === 'ts') {
      return `export const GENERATED_ULIDS: string[] = [\n  ${ids.map((id) => `'${id}'`).join(',\n  ')}\n];`;
    }
    return ids.join('\n');
  }, [rawList, codeWrap]);

  const inspectionResult = useMemo(() => {
    if (!inspectInput.trim()) return null;
    return decodeUlid(inspectInput);
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
    a.download = `ulids-${count}.txt`;
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
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold border border-violet-200/50 dark:border-violet-800/40">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              ULID Generator &amp; Decoder
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Universally Unique Lexicographically Sortable Identifiers with embedded millisecond timestamps and Crockford&apos;s Base32 encoding.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'generator'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Bulk Generator
          </button>
          <button
            onClick={() => setActiveTab('inspector')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'inspector'
                ? 'bg-white dark:bg-slate-900 text-violet-600 dark:text-violet-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            ULID Decoder
          </button>
        </div>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Column */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-violet-600" />
              ULID Options
            </h3>

            {/* Quantity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Quantity</span>
                <span className="font-bold text-violet-600 dark:text-violet-400">{count} ULIDs</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full accent-violet-600"
              />
            </div>

            {/* Case Toggle */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={lowercase}
                  onChange={(e) => setLowercase(e.target.checked)}
                  className="rounded accent-violet-600"
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">Lowercase characters</span>
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
                        ? 'border-violet-500 bg-violet-50/50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 font-bold'
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
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate ULIDs</span>
            </button>
          </div>

          {/* Output Right Column */}
          <div className="lg:col-span-2 flex flex-col rounded-2xl bg-white dark:bg-slate-900 border-2 border-violet-500/30 shadow-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                  Generated ULIDs ({rawList.length})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy('all', formattedOutput)}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
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
                <div className="space-y-2.5">
                  {rawList.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 font-mono text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 group shadow-2xs hover:border-violet-300 dark:hover:border-violet-800 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] w-5">{idx + 1}.</span>
                        <div className="select-all">
                          <span className="text-violet-600 dark:text-violet-400 font-bold">
                            {item.timePart}
                          </span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            {item.randPart}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 font-sans">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.dateLocal}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setInspectInput(item.ulid);
                              setActiveTab('inspector');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-[11px] text-violet-600 hover:underline px-1 py-0.5 rounded transition-opacity"
                          >
                            Decode
                          </button>
                          <button
                            onClick={() => handleCopy(`single-${idx}`, item.ulid)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-violet-600 p-1 rounded transition-opacity"
                            title="Copy ULID"
                          >
                            {copiedKey === `single-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
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
        /* Decoder Tab */
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Paste Any 26-Character ULID to Decode:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={inspectInput}
                onChange={(e) => setInspectInput(e.target.value)}
                placeholder="e.g. 01ARZ3NDEKTSV4RRFFQ69G5FAV"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
              />
              <button
                onClick={() => setInspectInput(generateSingleUlid().ulid)}
                className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Sample ULID
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
                    {inspectionResult.valid ? 'Valid Crockford Base32 ULID' : 'Invalid ULID'}
                  </span>
                </div>
                {inspectionResult.valid && (
                  <span className="font-mono text-[11px] font-normal">
                    Length: 26 characters (128 bits)
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
                    <span className="text-slate-400 font-medium">Decoded Timestamp (Local):</span>
                    <div className="font-bold text-violet-600 dark:text-violet-400 text-sm">
                      {inspectionResult.dateLocal}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      ISO: {inspectionResult.dateIso}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium">Unix Milliseconds:</span>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm font-mono">
                      {inspectionResult.timestampMs} ms
                    </div>
                    <div className="text-[11px] text-slate-500">
                      High 48-bits monotonic time component.
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-slate-400 font-medium">Component Breakdown:</span>
                    <div className="font-mono text-xs break-all pt-1">
                      <span className="text-violet-600 dark:text-violet-400 font-bold">
                        {inspectionResult.timePart}
                      </span>
                      <span className="text-slate-400 font-normal"> (Time, 10 chars) + </span>
                      <span className="text-slate-800 dark:text-slate-200 font-bold">
                        {inspectionResult.randPart}
                      </span>
                      <span className="text-slate-400 font-normal"> (Entropy, 16 chars)</span>
                    </div>
                  </div>

                  {inspectionResult.uuidEquivalent && (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                      <span className="text-slate-400 font-medium">128-bit UUID Equivalent:</span>
                      <div className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 break-all select-all pt-1">
                        {inspectionResult.uuidEquivalent}
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
