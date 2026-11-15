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
  Binary,
  ShieldCheck,
  Eye,
  FileText
} from 'lucide-react';
import { encodeBase64, decodeBase64 } from './devHelpers';

interface Base64CodecPanelProps {
  initialDirection?: 'encode' | 'decode';
  initialValue?: string;
}

const BASE64_PRESETS: Record<
  string,
  { label: string; text: string; base64: string; description: string }
> = {
  'UTF-8 & Emojis': {
    label: 'UTF-8 & Emojis 🚀',
    text: 'Toolstrum — Fast, Private, 100% Offline Client-Side Studio 🚀⚡️🔒',
    base64: 'VG9vbHN0cnVtIOKAlCBGYXN0LCBQcml2YXRlLCAxMDAlIE9mZmxpbmUgQ2xpZW50LVNpZGUgU3R1ZGlvIPCfkasi4pqh77iP8J+UkQ==',
    description: 'Validates multi-byte UTF-8 surrogate pairs and emoji sequences.'
  },
  'JSON Payload': {
    label: 'JSON Auth Payload',
    text: JSON.stringify(
      {
        sub: 'usr_8829aef1',
        org: 'toolstrum-enterprise',
        roles: ['admin', 'developer'],
        iat: 1773744000,
        exp: 1773830400
      },
      null,
      2
    ),
    base64: 'ewogICJzdWIiOiAidXNyXzg4MjlhZWYxIiwKICAib3JnIjogInRvb2xzdHJ1bS1lbnRlcnByaXNlIiwKICAicm9sZXMiOiBbCiAgICAiYWRtaW4iLAogICAgImRldmVsb3BlciIKICBdLAogICJpYXQiOiAxNzczNzQ0MDAwLAogICJleHAiOiAxNzczODMwNDAwCn0=',
    description: 'Structured JSON claims typically packed into JWT or session cookies.'
  },
  'SVG Data URI': {
    label: 'SVG Icon Graphic',
    text: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`,
    base64: 'PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMwMjg0YzciIHN0cm9rZS13aWR0aD0iMiI+PGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iMTAiLz48cGF0aCBkPSJtOSAxMiAyIDIgNC00Ii8+PC9zdmc+',
    description: 'Clean vector graphics encoded for direct CSS background embedding.'
  }
};

export const Base64CodecPanel: React.FC<Base64CodecPanelProps> = ({
  initialDirection = 'encode',
  initialValue
}) => {
  const [direction, setDirection] = useState<'encode' | 'decode'>(initialDirection);
  const [rawInput, setRawInput] = useState<string>(
    initialValue || (initialDirection === 'encode' ? BASE64_PRESETS['UTF-8 & Emojis'].text : BASE64_PRESETS['UTF-8 & Emojis'].base64)
  );

  // Encode Options
  const [urlSafe, setUrlSafe] = useState<boolean>(false);
  const [noPadding, setNoPadding] = useState<boolean>(false);
  const [lineWrap, setLineWrap] = useState<number>(0); // 0 = none, 64 = PEM, 76 = MIME
  const [dataUri, setDataUri] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'text' | 'hex'>('text');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Swap Direction
  const handleSwapDirection = () => {
    if (direction === 'encode') {
      setDirection('decode');
      setRawInput(computedOutput.text);
    } else {
      setDirection('encode');
      setRawInput(computedOutput.text);
    }
  };

  // Compute conversion
  const computedOutput = useMemo(() => {
    if (!rawInput.trim()) {
      return { text: '', error: undefined, bytes: 0, hex: '' };
    }

    if (direction === 'encode') {
      try {
        const encoded = encodeBase64(rawInput, {
          urlSafe,
          noPadding,
          lineWrap,
          mimeType: dataUri ? 'text/plain;charset=utf-8' : undefined
        });
        const encoder = new TextEncoder();
        const bytes = encoder.encode(encoded).length;
        return { text: encoded, error: undefined, bytes, hex: '' };
      } catch (err: any) {
        return { text: '', error: err?.message || 'Encoding failed', bytes: 0, hex: '' };
      }
    } else {
      const decoded = decodeBase64(rawInput);
      return {
        text: decoded.text || '',
        error: decoded.error,
        bytes: decoded.bytes || 0,
        hex: decoded.hex || ''
      };
    }
  }, [direction, rawInput, urlSafe, noPadding, lineWrap, dataUri]);

  // Telemetry
  const telemetry = useMemo(() => {
    const inputBytes = new Blob([rawInput]).size;
    const outputBytes = new Blob([computedOutput.text]).size;
    const deltaBytes = outputBytes - inputBytes;
    const deltaPercent = inputBytes > 0 ? ((deltaBytes / inputBytes) * 100).toFixed(1) : '0';

    return {
      inputBytes,
      outputBytes,
      deltaBytes,
      deltaPercent
    };
  }, [rawInput, computedOutput]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = direction === 'encode' ? 'b64.txt' : 'txt';
    const blob = new Blob([computedOutput.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum-${direction === 'encode' ? 'encoded' : 'decoded'}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      if (direction === 'encode') {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setRawInput(text);
        };
        reader.readAsText(file);
      } else {
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setRawInput(text);
        };
        reader.readAsText(file);
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Binary className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Base64 {direction === 'encode' ? 'Encoder' : 'Decoder'}
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {direction === 'encode'
                ? 'Convert raw text, UTF-8 strings, and data into standard or URL-safe Base64 strings.'
                : 'Decode Base64, Base64URL, and Data URIs back to plain UTF-8 text and inspect raw hex bytes.'}
            </p>
          </div>
        </div>

        {/* Direction Swap Button & Telemetry */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 text-xs font-mono font-bold text-blue-900 dark:text-blue-200">
            <span>{telemetry.inputBytes} B</span>
            <span>→</span>
            <span>{telemetry.outputBytes} B</span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400">
              ({telemetry.deltaPercent > '0' ? `+${telemetry.deltaPercent}` : telemetry.deltaPercent}%)
            </span>
          </div>

          <button
            onClick={handleSwapDirection}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
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
          <Layers className="w-3.5 h-3.5" /> Examples:
        </span>
        {Object.entries(BASE64_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => {
              setRawInput(direction === 'encode' ? item.text : item.base64);
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
        {/* Left Column: Input Panel */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {direction === 'encode' ? 'Plain Text / Raw Input' : 'Base64 Input String'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.inputBytes.toLocaleString()} B)
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
                onClick={() => handleCopy(rawInput)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setRawInput('')}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder={
                direction === 'encode'
                  ? 'Type or paste raw UTF-8 text here to encode into Base64...'
                  : 'Paste Base64 encoded payload or Data URI to decode...'
              }
              rows={16}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Converted Output */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {direction === 'encode' ? 'Base64 Output' : 'Decoded Text'}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.outputBytes.toLocaleString()} B)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Encode Options */}
              {direction === 'encode' ? (
                <>
                  <button
                    onClick={() => setUrlSafe(!urlSafe)}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                      urlSafe
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                    title="URL-Safe Base64 (replaces +/ with -_)"
                  >
                    URL-Safe
                  </button>

                  <button
                    onClick={() => setNoPadding(!noPadding)}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                      noPadding
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                    title="Strip trailing = padding characters"
                  >
                    No Padding
                  </button>

                  <select
                    value={lineWrap}
                    onChange={(e) => setLineWrap(Number(e.target.value))}
                    className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none"
                    title="Wrap output into fixed width lines"
                  >
                    <option value={0}>No Wrap</option>
                    <option value={64}>64 (PEM)</option>
                    <option value={76}>76 (MIME)</option>
                  </select>

                  <button
                    onClick={() => setDataUri(!dataUri)}
                    className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                      dataUri
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                    }`}
                    title="Prepend data:text/plain;charset=utf-8;base64,"
                  >
                    Data URI
                  </button>
                </>
              ) : (
                <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                  <button
                    onClick={() => setViewMode('text')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      viewMode === 'text'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Text
                  </button>
                  <button
                    onClick={() => setViewMode('hex')}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      viewMode === 'hex'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Hex Dump
                  </button>
                </div>
              )}

              <button
                onClick={() => handleCopy(viewMode === 'hex' ? computedOutput.hex : computedOutput.text)}
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
            ) : viewMode === 'hex' && direction === 'decode' ? (
              <textarea
                readOnly
                value={computedOutput.hex}
                rows={16}
                spellCheck={false}
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all"
              />
            ) : (
              <textarea
                readOnly
                value={computedOutput.text}
                rows={16}
                spellCheck={false}
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all break-all"
              />
            )}
          </div>
        </div>
      </div>

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">URL-Safe & RFC 4648 Compliant</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Toggle between standard (+ / =) and web-safe (- _ no padding) Base64 flavors for URL params and tokens.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">MIME & PEM Line Wrapping</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Format keys and certificates with standard 64-character (PEM) or 76-character (MIME) column limits.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Binary className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Raw Hex Byte Inspector</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Inspect decoded raw bytes in formatted hexadecimal representation for low-level protocol debugging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};