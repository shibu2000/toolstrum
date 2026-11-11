import React, { useState } from 'react';
import { Copy, Check, ArrowRightLeft, AlertCircle } from 'lucide-react';
import {
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  encodeHtmlEntities,
  decodeHtmlEntities,
} from './devHelpers';

interface ToolProps {
  copied: boolean;
  onCopy: (text: string) => void;
}

// ========================================================
// 267 — BASE64 ENCODER
// ========================================================
export const Base64EncoderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [input, setInput] = useState('Toolstrum — Fast, Private, Offline Web Utilities 🚀');
  const [urlSafe, setUrlSafe] = useState(false);
  const [noPadding, setNoPadding] = useState(false);

  const output = encodeBase64(input, urlSafe, noPadding);
  const inputBytes = new TextEncoder().encode(input).length;
  const outputBytes = new TextEncoder().encode(output).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Raw Text / UTF-8 Input
          </label>
          <span className="text-[11px] text-slate-400 font-mono">{inputBytes} byte(s)</span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />

        <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={urlSafe}
              onChange={(e) => setUrlSafe(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">URL-Safe Base64 (- and _)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={noPadding}
              onChange={(e) => setNoPadding(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Strip Padding (=)</span>
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Base64 Encoded Output
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{outputBytes} chars</span>
          </div>
          <button
            onClick={() => onCopy(output)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Base64'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
          {output}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 268 — BASE64 DECODER
// ========================================================
export const Base64DecoderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [b64Input, setB64Input] = useState(
    'VG9vbHN0cnVtIOKAlCBGYXN0LCBQcml2YXRlLCBPZmZsaW5lIFdlYiBVdGlsaXRpZXMg8J+agA=='
  );

  const res = decodeBase64(b64Input);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Base64 Input String
        </label>
        <textarea
          value={b64Input}
          onChange={(e) => setB64Input(e.target.value)}
          rows={12}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
          placeholder="Paste Base64 encoded string here..."
        />
        {res.error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{res.error}</span>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Decoded Plain Text
          </span>
          {res.text && (
            <button
              onClick={() => onCopy(res.text || '')}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Decoded'}</span>
            </button>
          )}
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
          {res.text || 'Enter valid Base64 string on the left to see decoded output.'}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 269 — URL ENCODER
// ========================================================
export const UrlEncoderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [input, setInput] = useState('https://toolstrum.app/search?query=offline utilities & tools#section=1');
  const [mode, setMode] = useState<'component' | 'full'>('component');

  const output = encodeUrl(input, mode === 'component');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Raw String / URL to Encode
          </label>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />

        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="url-mode"
              checked={mode === 'component'}
              onChange={() => setMode('component')}
              className="accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">encodeURIComponent (Strict)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="url-mode"
              checked={mode === 'full'}
              onChange={() => setMode('full')}
              className="accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">encodeURI (Preserves ://?#)</span>
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Percent-Encoded URL Output
          </span>
          <button
            onClick={() => onCopy(output)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy URL'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
          {output}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 270 — URL DECODER
// ========================================================
export const UrlDecoderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [input, setInput] = useState('https%3A%2F%2Ftoolstrum.app%2Fsearch%3Fquery%3Doffline+utilities+%26+tools%23section%3D1');
  const [plusAsSpace, setPlusAsSpace] = useState(true);

  const res = decodeUrl(input, plusAsSpace);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Encoded URL / Query String
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={plusAsSpace}
              onChange={(e) => setPlusAsSpace(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Decode "+" as Space</span>
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Decoded Plain URL String
          </span>
          {res.text && (
            <button
              onClick={() => onCopy(res.text || '')}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Decoded'}</span>
            </button>
          )}
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
          {res.text || 'Enter encoded URL on the left.'}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 271 — HTML ENTITY ENCODER
// ========================================================
export const HtmlEntityEncoderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [input, setInput] = useState('<div class="header">Toolstrum & Friends © 2026 "100% Offline"</div>');
  const [mode, setMode] = useState<'named' | 'decimal' | 'hex'>('named');

  const output = encodeHtmlEntities(input, mode);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Characters to Encode
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />

        <div className="flex items-center gap-4 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="entity-mode"
              checked={mode === 'named'}
              onChange={() => setMode('named')}
              className="accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Named (&amp;copy;)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="entity-mode"
              checked={mode === 'decimal'}
              onChange={() => setMode('decimal')}
              className="accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Decimal (&#38;)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="entity-mode"
              checked={mode === 'hex'}
              onChange={() => setMode('hex')}
              className="accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Hex (&#x26;)</span>
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            HTML Entities Output
          </span>
          <button
            onClick={() => onCopy(output)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Entities'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
          {output}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 272 — HTML ENTITY DECODER
// ========================================================
export const HtmlEntityDecoderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [input, setInput] = useState('&lt;div class=&quot;header&quot;&gt;Toolstrum &amp; Friends &copy; 2026 &quot;100% Offline&quot;&lt;/div&gt;');

  const output = decodeHtmlEntities(input);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          HTML Entities Input
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={12}
          className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
        />
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
            Decoded Unicode Text
          </span>
          <button
            onClick={() => onCopy(output)}
            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Decoded'}</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all whitespace-pre-wrap max-h-[380px] overflow-y-auto leading-relaxed">
          {output}
        </pre>
      </div>
    </div>
  );
};
