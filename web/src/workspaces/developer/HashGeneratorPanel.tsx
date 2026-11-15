import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Shield,
  Copy,
  Check,
  RefreshCw,
  Upload,
  FileCode,
  CheckCircle2,
  XCircle,
  Sparkles,
  Sliders,
  Download,
  Trash2,
  Hash,
  FileText,
  Search,
  Lock
} from 'lucide-react';
import { computeHashes, md5 } from './devHelpers';

interface HashGeneratorPanelProps {
  initialValue?: string;
}

const PRESETS: Record<string, { label: string; text: string; description: string }> = {
  'Hello World': {
    label: 'Hello World',
    text: 'Hello, World!',
    description: 'Classic test string.'
  },
  'Empty String': {
    label: 'Empty String (RFC Test)',
    text: '',
    description: 'Standard null digest verification.'
  },
  'API Request Payload': {
    label: 'JSON API Payload',
    text: JSON.stringify(
      {
        id: 'evt_9128340192',
        type: 'charge.succeeded',
        amount: 2500,
        currency: 'usd',
        created_at: 1714521600
      },
      null,
      2
    ),
    description: 'JSON object payload commonly hashed for webhooks and request signing.'
  },
  'Password / Secret': {
    label: 'Strong Password String',
    text: 'C0rr3ct-H0rs3-B4tt3ry-St4pl3!#2026',
    description: 'Entropy-rich passphrase test string.'
  }
};

interface HashItem {
  id: string;
  name: string;
  bits: number;
  hex: string;
  base64: string;
  security: 'secure' | 'warning' | 'deprecated';
  description: string;
}

export const HashGeneratorPanel: React.FC<HashGeneratorPanelProps> = ({ initialValue }) => {
  const [inputMode, setInputMode] = useState<'text' | 'file'>('text');
  const [textInput, setTextInput] = useState<string>(initialValue ?? PRESETS['Hello World'].text);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<number>(0);
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [format, setFormat] = useState<'hex' | 'base64' | 'sri'>('hex');
  const [expectedHash, setExpectedHash] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Stored hashes
  const [rawHashes, setRawHashes] = useState<{
    sha256: string;
    sha512: string;
    sha384: string;
    sha1: string;
    md5Hash: string;
  }>({
    sha256: '',
    sha512: '',
    sha384: '',
    sha1: '',
    md5Hash: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute hashes for text input
  useEffect(() => {
    if (inputMode === 'file') return;
    let cancel = false;
    computeHashes(textInput, uppercase).then((res) => {
      if (!cancel) setRawHashes(res);
    });
    return () => {
      cancel = true;
    };
  }, [textInput, uppercase, inputMode]);

  // Handle file hashing via Web Crypto
  const handleFileSelect = async (file: File) => {
    setFileName(file.name);
    setFileSize(file.size);
    setInputMode('file');

    try {
      const buffer = await file.arrayBuffer();

      const toHex = (buf: ArrayBuffer) => {
        const hex = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        return uppercase ? hex.toUpperCase() : hex;
      };

      const [sha256Buf, sha512Buf, sha384Buf, sha1Buf] = await Promise.all([
        crypto.subtle.digest('SHA-256', buffer),
        crypto.subtle.digest('SHA-512', buffer),
        crypto.subtle.digest('SHA-384', buffer),
        crypto.subtle.digest('SHA-1', buffer)
      ]);

      // For MD5 fallback on file (text conversion if reasonable size, else N/A)
      let md5Str = 'N/A (Binary File)';
      if (file.size < 10 * 1024 * 1024) {
        // Read small files as binary string for MD5
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        md5Str = uppercase ? md5(binary).toUpperCase() : md5(binary);
      }

      setRawHashes({
        sha256: toHex(sha256Buf),
        sha512: toHex(sha512Buf),
        sha384: toHex(sha384Buf),
        sha1: toHex(sha1Buf),
        md5Hash: md5Str
      });
    } catch {
      // ignore
    }
  };

  // Convert hex to base64
  const hexToBase64 = (hex: string): string => {
    if (!hex || hex === 'N/A' || hex.includes('N/A')) return 'N/A';
    try {
      const match = hex.match(/.{1,2}/g);
      if (!match) return '';
      const bytes = new Uint8Array(match.map((byte) => parseInt(byte, 16)));
      let bin = '';
      bytes.forEach((b) => (bin += String.fromCharCode(b)));
      return btoa(bin);
    } catch {
      return '';
    }
  };

  // Build display hash list
  const hashItems: HashItem[] = useMemo(() => {
    return [
      {
        id: 'sha256',
        name: 'SHA-256',
        bits: 256,
        hex: rawHashes.sha256,
        base64: hexToBase64(rawHashes.sha256),
        security: 'secure',
        description: 'Industry standard for cryptographic signatures, TLS, and blockchain.'
      },
      {
        id: 'sha512',
        name: 'SHA-512',
        bits: 512,
        hex: rawHashes.sha512,
        base64: hexToBase64(rawHashes.sha512),
        security: 'secure',
        description: 'High-security 64-bit word architecture digest with highest collision resistance.'
      },
      {
        id: 'sha384',
        name: 'SHA-384',
        bits: 384,
        hex: rawHashes.sha384,
        base64: hexToBase64(rawHashes.sha384),
        security: 'secure',
        description: 'Truncated SHA-512 variant certified by NSA Suite B cryptography.'
      },
      {
        id: 'sha1',
        name: 'SHA-1',
        bits: 160,
        hex: rawHashes.sha1,
        base64: hexToBase64(rawHashes.sha1),
        security: 'warning',
        description: 'Legacy algorithm (Git commit hashes). Vulnerable to collision attacks.'
      },
      {
        id: 'md5',
        name: 'MD5',
        bits: 128,
        hex: rawHashes.md5Hash,
        base64: hexToBase64(rawHashes.md5Hash),
        security: 'deprecated',
        description: 'Cryptographically broken. Suitable only for non-security file integrity checksums.'
      }
    ];
  }, [rawHashes]);

  // Verification matching
  const matchResult = useMemo(() => {
    const trimmed = expectedHash.trim().toLowerCase();
    if (!trimmed) return null;

    for (const item of hashItems) {
      if (item.hex.toLowerCase() === trimmed) {
        return { matched: true, algorithm: item.name, format: 'Hex' };
      }
      if (item.base64.trim() === expectedHash.trim()) {
        return { matched: true, algorithm: item.name, format: 'Base64' };
      }
      const sriVal = `${item.id}-${item.base64}`;
      if (sriVal === expectedHash.trim()) {
        return { matched: true, algorithm: item.name, format: 'SRI' };
      }
    }
    return { matched: false };
  }, [expectedHash, hashItems]);

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
    const lines = hashItems.map(
      (h) => `${h.hex}  *${fileName || 'input.txt'} (${h.name})`
    );
    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName ? fileName + '.' : ''}checksums.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFormattedValue = (item: HashItem) => {
    if (format === 'base64') return item.base64;
    if (format === 'sri') {
      if (item.id === 'md5' || item.id === 'sha1') return 'N/A (SRI requires SHA-256/384/512)';
      return `${item.id}-${item.base64}`;
    }
    return uppercase ? item.hex.toUpperCase() : item.hex.toLowerCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200/50 dark:border-sky-800/40">
            <Hash className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Cryptographic Hash Generator &amp; Checksum Verifier
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Simultaneous hardware-accelerated SHA-256, SHA-512, SHA-384, SHA-1, and MD5 computation with file drag-and-drop &amp; SRI support.
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setInputMode('text')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              inputMode === 'text'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Text String
          </button>
          <button
            onClick={() => {
              setInputMode('file');
              fileInputRef.current?.click();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              inputMode === 'file'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            File Hash
          </button>
        </div>
      </div>

      {/* Preset Pills (when in text mode) */}
      {inputMode === 'text' && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
          </span>
          {Object.keys(PRESETS).map((key) => (
            <button
              key={key}
              onClick={() => setTextInput(PRESETS[key].text)}
              className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-slate-600 dark:text-slate-400"
            >
              {PRESETS[key].label}
            </button>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input & Verification */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                {inputMode === 'text' ? 'Text / Message to Hash' : 'Loaded Local File'}
              </label>
              {inputMode === 'text' && (
                <button
                  onClick={() => setTextInput('')}
                  className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>

            {inputMode === 'text' ? (
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                rows={7}
                placeholder="Type or paste any text string to hash in real-time..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                spellCheck={false}
              />
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="p-8 border-2 border-dashed border-sky-400/50 dark:border-sky-600/50 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-colors"
              >
                <Upload className="w-8 h-8 text-sky-500 mb-2" />
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {fileName ? fileName : 'Click to select or drag & drop a file'}
                </div>
                {fileSize > 0 && (
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Size: {(fileSize / 1024).toFixed(1)} KB ({(fileSize / (1024 * 1024)).toFixed(2)} MB)
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-2">
                  Processed 100% offline via browser streaming Web Crypto API.
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileSelect(f);
              }}
            />

            {/* Checksum Verifier Input */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-sky-600" />
                  Verify Against Expected Checksum:
                </span>
                {expectedHash && (
                  <button
                    onClick={() => setExpectedHash('')}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                )}
              </label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder="Paste expected SHA-256, MD5, or SRI hash to compare..."
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
              />

              {matchResult && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                    matchResult.matched
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                      : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {matchResult.matched ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>
                      {matchResult.matched
                        ? `MATCH VERIFIED (${matchResult.algorithm} in ${matchResult.format})`
                        : 'NO MATCH: Checksum does not match any computed hash.'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Computed Hashes */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Computed Digest Results
            </span>

            <div className="flex items-center gap-2">
              {/* Output format switcher */}
              <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                <button
                  onClick={() => setFormat('hex')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    format === 'hex'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Hex
                </button>
                <button
                  onClick={() => setFormat('base64')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    format === 'base64'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Base64
                </button>
                <button
                  onClick={() => setFormat('sri')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    format === 'sri'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  SRI Tag
                </button>
              </div>

              {format === 'hex' && (
                <button
                  onClick={() => setUppercase(!uppercase)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    uppercase
                      ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 text-sky-600 dark:text-sky-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  {uppercase ? 'UPPER' : 'lower'}
                </button>
              )}

              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Download checksums.txt"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {hashItems.map((item) => {
              const displayVal = getFormattedValue(item);
              const isMatch = matchResult?.matched && matchResult.algorithm === item.name;

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isMatch
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-700'
                      : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {item.bits} bits
                      </span>
                      {isMatch && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">
                          MATCH
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleCopy(item.id, displayVal)}
                      className="px-2 py-0.5 rounded text-xs font-medium text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors"
                    >
                      {copiedKey === item.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedKey === item.id ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all leading-relaxed">
                    {displayVal || <span className="text-slate-400 italic">Computing...</span>}
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
