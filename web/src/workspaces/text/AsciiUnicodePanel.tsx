import React, { useState, useMemo } from 'react';
import {
  Binary,
  Code2,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  ArrowRightLeft,
  Table,
} from 'lucide-react';
import {
  inspectAllUnicodeGlyphs,
  UnicodeGlyphInfo,
} from './textHelpers';

interface AsciiUnicodePanelProps {
  initialText?: string;
  defaultMode?: 'text-to-ascii' | 'ascii-to-text' | 'unicode';
}

const SAMPLE_TEXT = 'Toolstrum 🚀 বাংলা 2025';

export const AsciiUnicodePanel: React.FC<AsciiUnicodePanelProps> = ({
  initialText = SAMPLE_TEXT,
  defaultMode = 'unicode',
}) => {
  const [activeTab, setActiveTab] = useState<'text-to-ascii' | 'ascii-to-text' | 'unicode'>(defaultMode);
  const [textInput, setTextInput] = useState<string>(initialText);
  const [asciiInput, setAsciiInput] = useState<string>('84 111 111 108 115 116 114 117 109');
  const [asciiFormat, setAsciiFormat] = useState<'decimal' | 'hex' | 'binary' | 'octal'>('decimal');
  const [asciiDelimiter, setAsciiDelimiter] = useState<' ' | ', ' | '\n' | '-'>(' ');
  const [copied, setCopied] = useState(false);

  // 1. Text to ASCII Output
  const textToAsciiOutput = useMemo(() => {
    return Array.from(textInput)
      .map((c) => {
        const code = c.charCodeAt(0);
        if (asciiFormat === 'hex') return code.toString(16).toUpperCase().padStart(2, '0');
        if (asciiFormat === 'binary') return code.toString(2).padStart(8, '0');
        if (asciiFormat === 'octal') return code.toString(8).padStart(3, '0');
        return code.toString(10);
      })
      .join(asciiDelimiter);
  }, [textInput, asciiFormat, asciiDelimiter]);

  // 2. ASCII to Text Output
  const asciiToTextOutput = useMemo(() => {
    const tokens = asciiInput.trim().split(/[\s,;-]+/).filter(Boolean);
    const radix =
      asciiFormat === 'hex' ? 16 : asciiFormat === 'binary' ? 2 : asciiFormat === 'octal' ? 8 : 10;

    return tokens
      .map((tok) => {
        const clean = tok.replace(/^0x/i, '');
        const code = parseInt(clean, radix);
        return isNaN(code) ? '' : String.fromCharCode(code);
      })
      .join('');
  }, [asciiInput, asciiFormat]);

  // 3. Unicode Glyph Inspector Rows
  const unicodeGlyphs: UnicodeGlyphInfo[] = useMemo(() => {
    return inspectAllUnicodeGlyphs(textInput);
  }, [textInput]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadUnicodeJson = () => {
    const blob = new Blob([JSON.stringify(unicodeGlyphs, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unicode-glyphs-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Binary className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              ASCII & Unicode Code Point Inspector
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Convert between plain text and ASCII numeric bitfields or inspect Unicode UTF-8/16 encoding down to individual glyphs.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('unicode')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'unicode'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Unicode Inspector
          </button>
          <button
            onClick={() => setActiveTab('text-to-ascii')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'text-to-ascii'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Text → ASCII
          </button>
          <button
            onClick={() => setActiveTab('ascii-to-text')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'ascii-to-text'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ASCII → Text
          </button>
        </div>
      </div>

      {/* Sub-Format Controls (for ASCII conversions) */}
      {(activeTab === 'text-to-ascii' || activeTab === 'ascii-to-text') && (
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Numeric Format:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'decimal', label: 'Decimal (Base 10)' },
              { id: 'hex', label: 'Hexadecimal (Base 16)' },
              { id: 'binary', label: 'Binary (Base 2)' },
              { id: 'octal', label: 'Octal (Base 8)' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAsciiFormat(f.id as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  asciiFormat === f.id
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {activeTab === 'text-to-ascii' && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-500">Delimiter:</span>
              <select
                value={asciiDelimiter}
                onChange={(e) => setAsciiDelimiter(e.target.value as any)}
                className="p-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value=" ">Space</option>
                <option value=", ">Comma (, )</option>
                <option value={'\n'}>Newline (\n)</option>
                <option value="-">Hyphen (-)</option>
              </select>
            </div>
          )}
        </div>
      )}

      {/* 1. UNICODE INSPECTOR TAB */}
      {activeTab === 'unicode' && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold uppercase tracking-wider">Inspect Characters</label>
              <div className="flex items-center gap-2">
                <span>{unicodeGlyphs.length} characters</span>
                <button
                  onClick={handleDownloadUnicodeJson}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  JSON
                </button>
              </div>
            </div>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-sans focus:outline-none focus:border-orange-500 shadow-sm"
              placeholder="Type any characters, symbols, emojis, or international alphabets..."
            />
          </div>

          {/* Detailed Unicode Table */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 sticky top-0 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Glyph</th>
                    <th className="py-2.5 px-3">Code Point</th>
                    <th className="py-2.5 px-3">Decimal</th>
                    <th className="py-2.5 px-3">UTF-8 Hex</th>
                    <th className="py-2.5 px-3">HTML Entity</th>
                    <th className="py-2.5 px-3">Unicode Block</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 font-mono text-slate-800 dark:text-slate-200">
                  {unicodeGlyphs.map((g) => (
                    <tr key={g.index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-3 text-slate-400">{g.index}</td>
                      <td className="py-2 px-3 font-sans text-lg font-bold text-orange-600 dark:text-orange-400">
                        {g.char === ' ' ? <span className="text-xs text-slate-400 italic">[space]</span> : g.char}
                      </td>
                      <td className="py-2 px-3 text-sky-600 dark:text-sky-400 font-semibold">{g.hex}</td>
                      <td className="py-2 px-3">{g.dec}</td>
                      <td className="py-2 px-3 text-slate-500">{g.utf8Hex}</td>
                      <td className="py-2 px-3 text-purple-600 dark:text-purple-400">{g.htmlEntity}</td>
                      <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">{g.block}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. TEXT TO ASCII TAB */}
      {activeTab === 'text-to-ascii' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Source Text</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                ASCII {asciiFormat.toUpperCase()} Code Output
              </label>
              <button
                onClick={() => handleCopy(textToAsciiOutput)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={textToAsciiOutput}
              rows={8}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono select-all focus:outline-none shadow-sm"
            />
          </div>
        </div>
      )}

      {/* 3. ASCII TO TEXT TAB */}
      {activeTab === 'ascii-to-text' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              ASCII Codes Input ({asciiFormat})
            </label>
            <textarea
              value={asciiInput}
              onChange={(e) => setAsciiInput(e.target.value)}
              rows={8}
              placeholder="e.g. 84 111 111 108 115 116 114 117 109"
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Decoded Plain Text
              </label>
              <button
                onClick={() => handleCopy(asciiToTextOutput)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <textarea
              readOnly
              value={asciiToTextOutput}
              rows={8}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono select-all focus:outline-none shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
