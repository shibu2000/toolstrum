import React, { useState, useEffect } from 'react';
import {
  Type,
  AlignLeft,
  Scissors,
  GitCompare,
  FileText,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface TextWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const TextWorkspace: React.FC<TextWorkspaceProps> = ({
  toolId,
  accentColor = '#F97316',
}) => {
  // Determine mode based on registry toolId:
  const getInitialTab = () => {
    if ((toolId >= 205 && toolId <= 209) || toolId === 234 || toolId === 237) return 'counter';
    if (toolId === 210 || toolId === 221 || toolId === 222) return 'case';
    if ((toolId >= 211 && toolId <= 216) || toolId === 220) return 'clean';
    if (toolId === 217) return 'diff';
    if (toolId >= 218 && toolId <= 228) return 'extract';
    if (toolId >= 229 && toolId <= 243) return 'generator';
    return 'counter';
  };

  const [activeTab, setActiveTab] = useState<'counter' | 'case' | 'clean' | 'diff' | 'extract' | 'generator'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // Notification
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // 1. WORD & TEXT COUNTERS
  // ==========================================
  const [counterText, setCounterText] = useState(
    'Toolstrum brings together over 490 offline tools into one fast, private workspace.\n\nEverything runs completely offline on your device with zero cloud tracking or uploads. Fast, secure, and always accessible.'
  );

  const getMetrics = (text: string) => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text.split('\n').length;
    const sentences = text.split(/[.!?]+/).filter(Boolean).length;
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    const readingTime = (words / 200).toFixed(1);
    const speakingTime = (words / 130).toFixed(1);
    return { chars, charsNoSpaces, words, lines, sentences, paragraphs, readingTime, speakingTime };
  };

  const metrics = getMetrics(counterText);

  // ==========================================
  // 2. CASE CONVERTERS
  // ==========================================
  const [caseInput, setCaseInput] = useState('Toolstrum Offline Developer Tools');
  const [caseOutput, setCaseOutput] = useState('');
  const [caseHasRun, setCaseHasRun] = useState(false);

  const applyCase = (type: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'slug') => {
    let res = caseInput;
    if (type === 'upper') res = caseInput.toUpperCase();
    if (type === 'lower') res = caseInput.toLowerCase();
    if (type === 'title') {
      res = caseInput.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    if (type === 'camel') {
      res = caseInput.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    }
    if (type === 'snake') {
      res = caseInput
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join('_') || '';
    }
    if (type === 'kebab') {
      res = caseInput
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join('-') || '';
    }
    if (type === 'slug') {
      res = caseInput
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    setCaseOutput(res);
    setCaseHasRun(true);
  };

  // ==========================================
  // 3. TEXT CLEANERS & LINE OPERATIONS
  // ==========================================
  const [cleanInput, setCleanInput] = useState(
    '  Apple  \n\nBanana\nOrange\nApple\n  Grape   \n\nBanana'
  );
  const [cleanOutput, setCleanOutput] = useState('');
  const [cleanHasRun, setCleanHasRun] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleCleanAction = (action: 'stripSpaces' | 'stripEmpty' | 'dedupe' | 'sortAsc' | 'sortDesc' | 'reverse' | 'replace') => {
    let res = cleanInput;
    if (action === 'stripSpaces') {
      res = cleanInput.replace(/[ \t]+/g, ' ').split('\n').map((l) => l.trim()).join('\n');
    }
    if (action === 'stripEmpty') {
      res = cleanInput.split('\n').filter((l) => l.trim().length > 0).join('\n');
    }
    if (action === 'dedupe') {
      res = Array.from(new Set(cleanInput.split('\n'))).join('\n');
    }
    if (action === 'sortAsc') {
      res = cleanInput.split('\n').sort((a, b) => a.localeCompare(b)).join('\n');
    }
    if (action === 'sortDesc') {
      res = cleanInput.split('\n').sort((a, b) => b.localeCompare(a)).join('\n');
    }
    if (action === 'reverse') {
      res = cleanInput.split('').reverse().join('');
    }
    if (action === 'replace' && findText) {
      res = cleanInput.replaceAll(findText, replaceText);
    }
    setCleanOutput(res);
    setCleanHasRun(true);
  };

  // ==========================================
  // 4. TEXT DIFF CHECKER
  // ==========================================
  const [diffOriginal, setDiffOriginal] = useState(
    'The quick brown fox jumps over the lazy dog.\nAll files stay private on device.'
  );
  const [diffModified, setDiffModified] = useState(
    'The quick brown fox leaps over the sleepy dog.\nAll files stay private on device with zero cloud tracking.'
  );

  const computeDiff = () => {
    const origLines = diffOriginal.split('\n');
    const modLines = diffModified.split('\n');
    const max = Math.max(origLines.length, modLines.length);
    const rows: Array<{ type: 'same' | 'added' | 'removed'; text: string }> = [];

    for (let i = 0; i < max; i++) {
      const o = origLines[i];
      const m = modLines[i];
      if (o === m) {
        rows.push({ type: 'same', text: `  ${o}` });
      } else if (o !== undefined && m !== undefined) {
        rows.push({ type: 'removed', text: `- ${o}` });
        rows.push({ type: 'added', text: `+ ${m}` });
      } else if (o !== undefined) {
        rows.push({ type: 'removed', text: `- ${o}` });
      } else if (m !== undefined) {
        rows.push({ type: 'added', text: `+ ${m}` });
      }
    }
    return rows;
  };

  // ==========================================
  // 5. EXTRACTORS (EMAIL, URL, PHONE)
  // ==========================================
  const [extractInput, setExtractInput] = useState(
    'For support, email us at support@toolstrum.app or visit https://toolstrum.app/help. Call us directly at +1-800-555-0199 or billing@toolstrum.app.'
  );
  const [extractedList, setExtractedList] = useState<string[]>([]);
  const [extractHasRun, setExtractHasRun] = useState(false);

  const handleExtract = (kind: 'email' | 'url' | 'phone') => {
    let matches: string[] = [];
    if (kind === 'email') {
      const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      matches = extractInput.match(re) || [];
    }
    if (kind === 'url') {
      const re = /https?:\/\/[^\s$.?#].[^\s]*/g;
      matches = extractInput.match(re) || [];
    }
    if (kind === 'phone') {
      const re = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      matches = extractInput.match(re) || [];
    }
    setExtractedList(Array.from(new Set(matches)));
    setExtractHasRun(true);
  };

  // ==========================================
  // 6. GENERATORS (LOREM IPSUM, MARKDOWN TABLE)
  // ==========================================
  const [loremParas, setLoremParas] = useState(3);
  const [genOutput, setGenOutput] = useState('');
  const [genHasRun, setGenHasRun] = useState(false);

  const handleGenerateLorem = () => {
    const sentences = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    ];
    let paras: string[] = [];
    for (let p = 0; p < loremParas; p++) {
      paras.push(sentences.join(' '));
    }
    setGenOutput(paras.join('\n\n'));
    setGenHasRun(true);
  };

  const handleGenerateMarkdownTable = () => {
    const table = `| Item | Description | Price | Status |\n| :--- | :--- | :---: | :---: |\n| Product A | Premium mechanical switch | $99.00 | In Stock |\n| Product B | Ergonomic desk wrist rest | $29.00 | Low Stock |\n| Product C | USB-C Braided Cable 2M | $14.50 | In Stock |`;
    setGenOutput(table);
    setGenHasRun(true);
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Type className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Text & Writing Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Word counters, case changers, text cleaners, diff comparisons, and extractors. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WORD & CHARACTER COUNTER */}
      {/* ======================================================== */}
      {activeTab === 'counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Enter or Paste Text
            </label>
            <textarea
              value={counterText}
              onChange={(e) => setCounterText(e.target.value)}
              rows={12}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
              placeholder="Type or paste text to count words..."
            />
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Total Words
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.words.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Characters</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.chars}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">No Spaces</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.charsNoSpaces}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sentences</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.sentences}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Paragraphs</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.paragraphs}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Reading Time</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.readingTime} min</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Speaking Time</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.speakingTime} min</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CASE CONVERTER */}
      {/* ======================================================== */}
      {activeTab === 'case' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Source String
            </label>
            <textarea
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              rows={6}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'upper', label: 'UPPERCASE' },
                { id: 'lower', label: 'lowercase' },
                { id: 'title', label: 'Title Case' },
                { id: 'camel', label: 'camelCase' },
                { id: 'snake', label: 'snake_case' },
                { id: 'kebab', label: 'kebab-case' },
                { id: 'slug', label: 'URL slug' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => applyCase(c.id as any)}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-all text-center"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {caseHasRun && caseOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Converted String
                  </span>
                  <button
                    onClick={() => handleCopy(caseOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all whitespace-pre-wrap">
                  {caseOutput}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select a case format button on the left to transform your text. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CLEAN & SORT LINES */}
      {/* ======================================================== */}
      {activeTab === 'clean' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Multi-Line Content
            </label>
            <textarea
              value={cleanInput}
              onChange={(e) => setCleanInput(e.target.value)}
              rows={8}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCleanAction('stripSpaces')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Trim Spaces
              </button>
              <button
                onClick={() => handleCleanAction('stripEmpty')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Remove Empty Lines
              </button>
              <button
                onClick={() => handleCleanAction('dedupe')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Remove Duplicates
              </button>
              <button
                onClick={() => handleCleanAction('sortAsc')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Sort A→Z
              </button>
              <button
                onClick={() => handleCleanAction('sortDesc')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Sort Z→A
              </button>
            </div>

            {/* Find & Replace Box */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Find & Replace
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Find text..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Replace with..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <button
                onClick={() => handleCleanAction('replace')}
                className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
              >
                Execute Replace
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cleanHasRun && cleanOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Cleaned Output ({cleanOutput.split('\n').length} Lines)
                  </span>
                  <button
                    onClick={() => handleCopy(cleanOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white max-h-[360px] overflow-y-auto leading-relaxed">
                  {cleanOutput}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Click any cleaning or sorting button on the left to process your text. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TEXT DIFF CHECKER */}
      {/* ======================================================== */}
      {activeTab === 'diff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Original Text (Before)
              </label>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Modified Text (After)
              </label>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Line-by-Line Visual Diff</span>
              <span className="text-emerald-400">+ Added / <span className="text-rose-400">- Removed</span></span>
            </div>
            {computeDiff().map((row, i) => (
              <div
                key={i}
                className={`py-1 px-2.5 rounded-md whitespace-pre-wrap ${
                  row.type === 'added'
                    ? 'bg-emerald-950/70 text-emerald-300 font-medium'
                    : row.type === 'removed'
                    ? 'bg-rose-950/70 text-rose-300'
                    : 'text-slate-400'
                }`}
              >
                {row.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: EXTRACTORS */}
      {/* ======================================================== */}
      {activeTab === 'extract' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Document Text to Extract From
            </label>
            <textarea
              value={extractInput}
              onChange={(e) => setExtractInput(e.target.value)}
              rows={8}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleExtract('email')}
                className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs"
              >
                Extract Emails
              </button>
              <button
                onClick={() => handleExtract('url')}
                className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs"
              >
                Extract URLs
              </button>
              <button
                onClick={() => handleExtract('phone')}
                className="py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs"
              >
                Extract Phones
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {extractHasRun ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Extracted Items ({extractedList.length})
                  </span>
                  {extractedList.length > 0 && (
                    <button
                      onClick={() => handleCopy(extractedList.join('\n'))}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Items</span>
                    </button>
                  )}
                </div>

                {extractedList.length > 0 ? (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {extractedList.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all">
                        {item}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">No matching items found in the provided text.</p>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select an extraction type to find emails, URLs, or phone numbers. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: GENERATORS (LOREM IPSUM, MARKDOWN TABLE) */}
      {/* ======================================================== */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Text Generators
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Lorem Ipsum Paragraphs ({loremParas})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={loremParas}
                onChange={(e) => setLoremParas(Number(e.target.value))}
                className="w-full accent-orange-600"
              />
              <button
                onClick={handleGenerateLorem}
                className="w-full mt-2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
              >
                Generate Lorem Ipsum
              </button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handleGenerateMarkdownTable}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs"
              >
                Generate Markdown Table Template
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {genHasRun && genOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Generated Content
                  </span>
                  <button
                    onClick={() => handleCopy(genOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white max-h-[320px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {genOutput}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Click a generator button on the left to create sample text or templates. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
