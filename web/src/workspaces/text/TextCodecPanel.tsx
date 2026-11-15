import React, { useState, useMemo } from 'react';
import {
  Code2,
  Copy,
  Check,
  Download,
  ArrowRightLeft,
  Sparkles,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import {
  encodeRot13,
  textToBinary,
  binaryToText,
  textToHex,
  hexToText,
} from './textHelpers';

interface TextCodecPanelProps {
  initialMode?: 'encode' | 'decode';
  defaultCodec?: 'base64' | 'url' | 'html' | 'hex' | 'binary' | 'rot13';
}

const SAMPLE_TEXT = 'Toolstrum Offline Suite & Fast Privacy-First Tools <2025>';

export const TextCodecPanel: React.FC<TextCodecPanelProps> = ({
  initialMode = 'encode',
  defaultCodec = 'base64',
}) => {
  const [direction, setDirection] = useState<'encode' | 'decode'>(initialMode);
  const [codec, setCodec] = useState<'base64' | 'url' | 'html' | 'hex' | 'binary' | 'rot13'>(defaultCodec);
  const [input, setInput] = useState<string>(SAMPLE_TEXT);
  const [copied, setCopied] = useState<boolean>(false);

  // Swap Direction & text
  const handleSwap = () => {
    setInput(output);
    setDirection(direction === 'encode' ? 'decode' : 'encode');
  };

  // Perform Encoding / Decoding
  const output = useMemo(() => {
    if (!input) return '';

    try {
      if (direction === 'encode') {
        switch (codec) {
          case 'base64':
            return btoa(unescape(encodeURIComponent(input)));
          case 'url':
            return encodeURIComponent(input);
          case 'html':
            return input
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#39;');
          case 'hex':
            return textToHex(input);
          case 'binary':
            return textToBinary(input);
          case 'rot13':
            return encodeRot13(input);
          default:
            return input;
        }
      } else {
        switch (codec) {
          case 'base64':
            return decodeURIComponent(escape(atob(input)));
          case 'url':
            return decodeURIComponent(input);
          case 'html': {
            const doc = new DOMParser().parseFromString(input, 'text/html');
            return doc.documentElement.textContent || '';
          }
          case 'hex':
            return hexToText(input);
          case 'binary':
            return binaryToText(input);
          case 'rot13':
            return encodeRot13(input);
          default:
            return input;
        }
      }
    } catch (e: any) {
      return `[Error Decoding: ${e.message}]`;
    }
  }, [input, direction, codec]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${codec}-${direction}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Code2 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Text Encoder & Decoder (Base64, URL, HTML, Hex, Binary, ROT13)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bidirectional offline encoding and decoding for standard web and cryptographic representations.
            </p>
          </div>
        </div>

        {/* Direction Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setDirection('encode')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              direction === 'encode'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Encode
          </button>
          <button
            onClick={() => setDirection('decode')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              direction === 'decode'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Decode
          </button>
        </div>
      </div>

      {/* Codec Selection Bar */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Codec Algorithm:</span>
          {[
            { id: 'base64', label: 'Base64' },
            { id: 'url', label: 'URL %-Encoding' },
            { id: 'html', label: 'HTML Entities' },
            { id: 'hex', label: 'Hexadecimal' },
            { id: 'binary', label: 'Binary' },
            { id: 'rot13', label: 'ROT13' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCodec(c.id as any)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                codec === c.id
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleSwap}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" />
          Swap Input / Output
        </button>
      </div>

      {/* Dual Column Editor */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">
              {direction === 'encode' ? 'Plain Text Input' : `Encoded ${codec.toUpperCase()} Input`}
            </span>
            <span>{input.length} characters</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={10}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        {/* Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              {direction === 'encode' ? `Encoded ${codec.toUpperCase()} Output` : 'Decoded Plain Text Output'}
            </span>
            <div className="flex items-center gap-2">
              <span>{output.length} characters</span>
              <button
                onClick={() => handleCopy(output)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
              <button
                onClick={handleDownload}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <Download className="w-3 h-3" />
                Download
              </button>
            </div>
          </div>
          <textarea
            readOnly
            value={output}
            rows={10}
            className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono select-all focus:outline-none shadow-sm"
          />
        </div>
      </div>
    </div>
  );
};
