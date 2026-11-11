import React, { useState, useEffect } from 'react';
import { Copy, Check, RefreshCw, Key, Shield, Lock, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import {
  decodeJwt,
  generateUuids,
  generateUlids,
  computeHashes,
  computeHmac,
  generatePassword,
  inspectBcrypt,
} from './devHelpers';

interface ToolProps {
  copied: boolean;
  onCopy: (text: string) => void;
}

// ========================================================
// 273 — JWT DECODER
// ========================================================
export const JwtDecoderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [jwtInput, setJwtInput] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFsaWNlIERldmVsb3BlciIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTcwNDE0NDAwMCwiZXhwIjoxNzk5OTk5OTk5fQ.kYvB5e9N1m...'
  );

  const decoded = decodeJwt(jwtInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Encoded JWT Token
        </label>
        <textarea
          value={jwtInput}
          onChange={(e) => setJwtInput(e.target.value)}
          rows={12}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          placeholder="Paste JWT here..."
        />
        {decoded.error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{decoded.error}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {decoded.isValidStructure ? (
          <>
            {/* Expiration status banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                decoded.isExpired
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{decoded.isExpired ? 'Token Expired' : 'Token Active'}</span>
              </div>
              <span className="text-[11px] font-normal">{decoded.timeLeft}</span>
            </div>

            {/* Header */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Header: Algorithm & Token Type
                </span>
                <button
                  onClick={() => onCopy(JSON.stringify(decoded.header, null, 2))}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            {/* Payload */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Payload: Data Claims
                </span>
                <button
                  onClick={() => onCopy(JSON.stringify(decoded.payload, null, 2))}
                  className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto max-h-[220px]">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            Paste a valid JSON Web Token on the left to inspect its claims.
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 274 — UUID GENERATOR
// ========================================================
export const UuidGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [uuids, setUuids] = useState<string[]>(() => generateUuids(5, false, false));

  const handleGenerate = () => {
    setUuids(generateUuids(count, uppercase, noHyphens));
  };

  useEffect(() => {
    handleGenerate();
  }, [count, uppercase, noHyphens]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          UUID v4 Configuration
        </h3>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">Quantity</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{count}</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Uppercase Characters</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noHyphens}
              onChange={(e) => setNoHyphens(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Remove Hyphens</span>
          </label>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Regenerate UUIDs</span>
        </button>
      </div>

      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Generated UUIDs ({uuids.length})
          </span>
          <button
            onClick={() => onCopy(uuids.join('\n'))}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {uuids.map((id, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 font-mono text-xs flex items-center justify-between group"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-slate-400 text-[10px] w-4">{idx + 1}.</span>
                <span className="text-slate-900 dark:text-white font-semibold">{id}</span>
              </div>
              <button
                onClick={() => onCopy(id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-600 p-1 transition-opacity"
                title="Copy single"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 275 — ULID GENERATOR
// ========================================================
export const UlidGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [count, setCount] = useState(5);
  const [ulids, setUlids] = useState<{ ulid: string; timestamp: Date }[]>(() => generateUlids(5));

  const handleGenerate = () => {
    setUlids(generateUlids(count));
  };

  useEffect(() => {
    handleGenerate();
  }, [count]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          ULID Configuration
        </h3>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">Quantity</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{count}</span>
          </div>
          <input
            type="range"
            min="1"
            max="30"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <button
          onClick={handleGenerate}
          className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Generate New ULIDs</span>
        </button>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-2 border-t border-slate-100 dark:border-slate-800">
          ULIDs are 128-bit sortable identifiers: the first 10 characters encode timestamp, the last 16 encode randomness.
        </p>
      </div>

      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Sortable ULID Results ({ulids.length})
          </span>
          <button
            onClick={() => onCopy(ulids.map((u) => u.ulid).join('\n'))}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy All</span>
          </button>
        </div>

        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {ulids.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 font-mono text-xs flex items-center justify-between group"
            >
              <div>
                <span className="text-slate-900 dark:text-white font-bold mr-3">{item.ulid}</span>
                <span className="text-[10px] text-slate-400 font-sans">
                  {item.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <button
                onClick={() => onCopy(item.ulid)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-sky-600 p-1 transition-opacity"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 276 — HASH GENERATOR
// ========================================================
export const HashGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [input, setInput] = useState('Toolstrum Offline Suite 2026');
  const [uppercase, setUppercase] = useState(false);
  const [hashes, setHashes] = useState<{
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
    md5Hash: '',
  });

  useEffect(() => {
    let cancel = false;
    computeHashes(input, uppercase).then((res) => {
      if (!cancel) setHashes(res);
    });
    return () => {
      cancel = true;
    };
  }, [input, uppercase]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Input Text / Message
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={8}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={uppercase}
              onChange={(e) => setUppercase(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Uppercase Hex Format</span>
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {[
          { label: 'SHA-256', val: hashes.sha256, bits: '256 bits' },
          { label: 'SHA-512', val: hashes.sha512, bits: '512 bits' },
          { label: 'SHA-384', val: hashes.sha384, bits: '384 bits' },
          { label: 'SHA-1', val: hashes.sha1, bits: '160 bits (legacy)' },
          { label: 'MD5', val: hashes.md5Hash, bits: '128 bits (checksum)' },
        ].map((h) => (
          <div
            key={h.label}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{h.label}</span>
                <span className="text-[10px] text-slate-400 font-mono">{h.bits}</span>
              </div>
              <button
                onClick={() => onCopy(h.val)}
                className="text-xs font-semibold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
            <p className="font-mono text-xs text-slate-900 dark:text-white break-all">{h.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================================
// 277 — HMAC GENERATOR
// ========================================================
export const HmacGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [message, setMessage] = useState('{"event":"payment_success","amount":4900,"currency":"USD"}');
  const [secret, setSecret] = useState('whsec_test_secret_key_12345');
  const [alg, setAlg] = useState<'SHA-256' | 'SHA-512' | 'SHA-384'>('SHA-256');
  const [result, setResult] = useState<{ hex: string; base64: string }>({ hex: '', base64: '' });

  useEffect(() => {
    let cancel = false;
    computeHmac(message, secret, alg).then((res) => {
      if (!cancel) setResult(res);
    });
    return () => {
      cancel = true;
    };
  }, [message, secret, alg]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1">
            HMAC Secret Key
          </label>
          <input
            type="text"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1">
            Message Payload
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['SHA-256', 'SHA-512', 'SHA-384'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAlg(a)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                alg === a
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-5">
        <h3 className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
          Computed HMAC Signature ({alg})
        </h3>

        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hex Representation</span>
              <button
                onClick={() => onCopy(result.hex)}
                className="text-xs text-slate-500 hover:text-sky-600"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-mono text-xs text-slate-900 dark:text-white break-all font-semibold">
              {result.hex}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Base64 Representation</span>
              <button
                onClick={() => onCopy(result.base64)}
                className="text-xs text-slate-500 hover:text-sky-600"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="font-mono text-xs text-slate-900 dark:text-white break-all font-semibold">
              {result.base64}
            </p>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
          Use to verify Webhooks for Stripe, GitHub, Shopify, and authenticated REST requests.
        </p>
      </div>
    </div>
  );
};

// ========================================================
// 278 — PASSWORD GENERATOR
// ========================================================
export const PasswordGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(true);

  const [pwData, setPwData] = useState(() =>
    generatePassword(16, { upper: true, lower: true, numbers: true, symbols: true, noAmbiguous: true })
  );

  const handleRegen = () => {
    setPwData(generatePassword(length, { upper, lower, numbers, symbols, noAmbiguous }));
  };

  useEffect(() => {
    handleRegen();
  }, [length, upper, lower, numbers, symbols, noAmbiguous]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Password Rules & Entropy
        </h3>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">Length</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{length} characters</span>
          </div>
          <input
            type="range"
            min="8"
            max="48"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={upper}
              onChange={(e) => setUpper(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span>Uppercase (A-Z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={lower}
              onChange={(e) => setLower(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span>Lowercase (a-z)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={numbers}
              onChange={(e) => setNumbers(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span>Numbers (0-9)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={symbols}
              onChange={(e) => setSymbols(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span>Symbols (!@#$)</span>
          </label>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noAmbiguous}
              onChange={(e) => setNoAmbiguous(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300">
              Exclude ambiguous characters (l, 1, I, O, 0)
            </span>
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Generated Password
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                pwData.strength === 'Very Strong'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : pwData.strength === 'Strong'
                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {pwData.strength} ({pwData.entropyBits} bits)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-base text-slate-900 dark:text-white break-all select-all font-bold">
            {pwData.password}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => onCopy(pwData.password)}
            className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Password'}</span>
          </button>
          <button
            onClick={handleRegen}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title="Generate new password"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 279 — BCRYPT HASH CHECKER
// ========================================================
export const BcryptCheckerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [hashInput, setHashInput] = useState(
    '$2a$12$R9h/cIPz0gi.URNNXRkh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW'
  );

  const inspected = inspectBcrypt(hashInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Bcrypt Hash String
        </label>
        <textarea
          value={hashInput}
          onChange={(e) => setHashInput(e.target.value)}
          rows={6}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider block">
            Bcrypt Structure Spec:
          </span>
          <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
            $[version]$[cost]$[22-char salt][31-char hash]
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {inspected.valid ? (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Valid Bcrypt Hash Structure
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Algorithm Version:</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">{inspected.version}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Cost Factor:</span>
                <span className="font-mono text-slate-900 dark:text-white font-bold">
                  2^{inspected.cost} ({inspected.iterations?.toLocaleString()} key-expansion iterations)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Embedded Salt (128 bits):</span>
                <p className="font-mono text-slate-900 dark:text-white break-all">{inspected.salt}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <span className="text-slate-400 uppercase font-bold text-[10px]">Ciphertext Checksum:</span>
                <p className="font-mono text-slate-900 dark:text-white break-all">{inspected.checksum}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border-2 border-rose-400/40 text-xs text-rose-700 dark:text-rose-300">
            {inspected.error}
          </div>
        )}
      </div>
    </div>
  );
};
