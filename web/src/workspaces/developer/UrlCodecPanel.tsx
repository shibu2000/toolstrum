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
  ArrowRightLeft,
  CheckCheck,
  Zap,
  Link2,
  Globe,
  Sliders,
  Table,
  ExternalLink,
  Code2
} from 'lucide-react';
import { encodeUrl, decodeUrl } from './devHelpers';

interface UrlCodecPanelProps {
  initialDirection?: 'encode' | 'decode';
  initialValue?: string;
}

const URL_PRESETS: Record<
  string,
  { label: string; raw: string; encoded: string; description: string }
> = {
  'OAuth2 Redirect': {
    label: 'OAuth2 Authorize Redirect',
    raw: 'https://auth.toolstrum.dev/oauth/v2/authorize?client_id=ts_981a2f&response_type=code&redirect_uri=https://app.toolstrum.com/callback?state=xyz&scope=read:data write:tools openid',
    encoded: 'https%3A%2F%2Fauth.toolstrum.dev%2Foauth%2Fv2%2Fauthorize%3Fclient_id%3Dts_981a2f%26response_type%3Dcode%26redirect_uri%3Dhttps%3A%2F%2Fapp.toolstrum.com%2Fcallback%3Fstate%3Dxyz%26scope%3Dread%3Adata%20write%3Atools%20openid',
    description: 'Nested redirect URI with URL-encoded query parameters and OAuth scopes.'
  },
  'Search & Unicode': {
    label: 'Search Query with Unicode & Specials',
    raw: 'https://toolstrum.app/search?q=developer tools & utilities + 🚀 "offline studio"#results',
    encoded: 'https%3A%2F%2Ftoolstrum.app%2Fsearch%3Fq%3Ddeveloper%20tools%20%26%20utilities%20%2B%20%F0%9F%9A%80%20%22offline%20studio%22%23results',
    description: 'Multi-word search query containing quotes, plus symbols, ampersands, and unicode emojis.'
  },
  'REST API Filters': {
    label: 'REST API Nested Filters',
    raw: 'https://api.toolstrum.io/v1/metrics?filter={"status":"active","tier":{"$in":["pro","enterprise"]}}&sort=-created_at&limit=50',
    encoded: 'https%3A%2F%2Fapi.toolstrum.io%2Fv1%2Fmetrics%3Ffilter%3D%7B%22status%22%3A%22active%22%2C%22tier%22%3A%7B%22%24in%22%3A%5B%22pro%22%2C%22enterprise%22%5D%7D%7D%26sort%3D-created_at%26limit%3D50',
    description: 'JSON object embedded directly into query parameters.'
  }
};

type EncodeMode = 'component' | 'full' | 'form' | 'all';

export const UrlCodecPanel: React.FC<UrlCodecPanelProps> = ({
  initialDirection = 'encode',
  initialValue
}) => {
  const [direction, setDirection] = useState<'encode' | 'decode'>(initialDirection);
  const [urlInput, setUrlInput] = useState<string>(
    initialValue || (initialDirection === 'encode' ? URL_PRESETS['OAuth2 Redirect'].raw : URL_PRESETS['OAuth2 Redirect'].encoded)
  );

  const [encodeMode, setEncodeMode] = useState<EncodeMode>('component');
  const [decodePlusAsSpace, setDecodePlusAsSpace] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Swap Direction
  const handleSwapDirection = () => {
    if (direction === 'encode') {
      setDirection('decode');
      setUrlInput(computedOutput.text);
    } else {
      setDirection('encode');
      setUrlInput(computedOutput.text);
    }
  };

  // Compute conversion
  const computedOutput = useMemo(() => {
    if (!urlInput.trim()) {
      return { text: '', error: undefined };
    }

    if (direction === 'encode') {
      try {
        const mode = encodeMode === 'form' ? 'component' : encodeMode;
        const encoded = encodeUrl(urlInput, {
          mode,
          spaceAsPlus: encodeMode === 'form'
        });
        return { text: encoded, error: undefined };
      } catch (err: any) {
        return { text: '', error: err?.message || 'Encoding failed' };
      }
    } else {
      const decoded = decodeUrl(urlInput, decodePlusAsSpace);
      return { text: decoded.text || '', error: decoded.error };
    }
  }, [direction, urlInput, encodeMode, decodePlusAsSpace]);

  // Extract query parameters
  const queryParams = useMemo(() => {
    const target = direction === 'encode' ? urlInput : computedOutput.text;
    const queryIndex = target.indexOf('?');
    if (queryIndex === -1) return [];

    const hashIndex = target.indexOf('#', queryIndex);
    const queryString = hashIndex === -1 ? target.slice(queryIndex + 1) : target.slice(queryIndex + 1, hashIndex);
    const pairs = queryString.split('&').filter(Boolean);

    return pairs.map((p) => {
      const eq = p.indexOf('=');
      if (eq === -1) {
        return { key: p, value: '' };
      }
      const rawKey = p.slice(0, eq);
      const rawVal = p.slice(eq + 1);
      try {
        return {
          key: decodeURIComponent(rawKey.replace(/\+/g, ' ')),
          value: decodeURIComponent(rawVal.replace(/\+/g, ' '))
        };
      } catch {
        return { key: rawKey, value: rawVal };
      }
    });
  }, [direction, urlInput, computedOutput.text]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const rawLen = urlInput.length;
    const outLen = computedOutput.text.length;
    const delta = outLen - rawLen;
    const deltaPercent = rawLen > 0 ? ((delta / rawLen) * 100).toFixed(1) : '0';

    return {
      rawLen,
      outLen,
      delta,
      deltaPercent,
      paramCount: queryParams.length
    };
  }, [urlInput, computedOutput.text, queryParams]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([computedOutput.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum-url-${direction === 'encode' ? 'encoded' : 'decoded'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setUrlInput(text);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              URL {direction === 'encode' ? 'Encoder' : 'Decoder'}
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {direction === 'encode'
                ? 'RFC 3986 percent-encoding for query params, full URLs, and form data with parameter table breakdown.'
                : 'Decode percent-encoded URLs, restore spaces, and inspect structured query parameters.'}
            </p>
          </div>
        </div>

        {/* Direction Swap Button & Telemetry */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-900/40 text-xs font-mono font-bold text-teal-900 dark:text-teal-200">
            <span>{telemetry.rawLen} chars</span>
            <span>→</span>
            <span>{telemetry.outLen} chars</span>
            <span className="text-[11px] text-teal-600 dark:text-teal-400">
              ({telemetry.deltaPercent > '0' ? `+${telemetry.deltaPercent}` : telemetry.deltaPercent}%)
            </span>
          </div>

          <button
            onClick={handleSwapDirection}
            className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
            title="Switch between Encoder and Decoder"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Swap ({direction === 'encode' ? 'Decode' : 'Encode'})</span>
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Presets:
        </span>
        {Object.entries(URL_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => {
              setUrlInput(direction === 'encode' ? item.raw : item.encoded);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
            title={item.description}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {direction === 'encode' ? 'Raw URL or Query Param String' : 'Percent-Encoded URL String'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.rawLen} chars)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="*/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => handleCopy(urlInput)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setUrlInput('')}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={
                direction === 'encode'
                  ? 'Type or paste raw URL or parameter text here...'
                  : 'Paste percent-encoded URL (e.g. https%3A%2F%2F...)...'
              }
              rows={14}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-teal-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Output */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {direction === 'encode' ? 'Encoded Output' : 'Decoded URL'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.outLen} chars)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {direction === 'encode' ? (
                <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setEncodeMode('component')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      encodeMode === 'component'
                        ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="Component encoding (strict encodeURIComponent)"
                  >
                    Component
                  </button>
                  <button
                    onClick={() => setEncodeMode('full')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      encodeMode === 'full'
                        ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="Full URI encoding (preserves ://?#)"
                  >
                    Full URI
                  </button>
                  <button
                    onClick={() => setEncodeMode('form')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      encodeMode === 'form'
                        ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                    title="Form encoding (spaces as +)"
                  >
                    Form (+)
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setDecodePlusAsSpace(!decodePlusAsSpace)}
                  className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                    decodePlusAsSpace
                      ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-700 dark:text-teal-300 font-bold'
                      : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                  title="Decode '+' as space characters"
                >
                  Decode + as Space
                </button>
              )}

              <button
                onClick={() => handleCopy(computedOutput.text)}
                title="Copy output"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                title="Download file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            {computedOutput.error ? (
              <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-mono">
                {computedOutput.error}
              </div>
            ) : (
              <textarea
                readOnly
                value={computedOutput.text}
                rows={14}
                spellCheck={false}
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all break-all"
              />
            )}
          </div>
        </div>
      </div>

      {/* Query Parameters Table Inspector */}
      {queryParams.length > 0 && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-teal-500" />
              Extracted Query Parameters ({queryParams.length})
            </h4>
            <span className="text-[11px] text-slate-400 font-mono">Parsed Key-Value Pairs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3">#</th>
                  <th className="py-2 px-3">Parameter Key</th>
                  <th className="py-2 px-3">Decoded Value</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {queryParams.map((param, i) => (
                  <tr key={i} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400">{i + 1}</td>
                    <td className="py-2.5 px-3 font-bold text-teal-600 dark:text-teal-400">{param.key}</td>
                    <td className="py-2.5 px-3 text-slate-800 dark:text-slate-200 break-all">{param.value}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleCopy(`${param.key}=${param.value}`)}
                        className="px-2 py-1 rounded-md text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                      >
                        Copy
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Globe className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">RFC 3986 Standard Modes</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Switch seamlessly between Component (strict) and Full URI (structure-preserving) encoding modes.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Table className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Live Query Param Inspector</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Automatically breaks down query strings into structured, readable key-value table rows with 1-click copy.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Form URL-Encoded Spaces (+)</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Toggle between classic form-data plus encoding (+) and standard percent-encoding (%20).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};