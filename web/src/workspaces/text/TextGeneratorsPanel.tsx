import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  RefreshCw,
  Sparkles,
  Users,
  Shuffle,
  AlignLeft,
} from 'lucide-react';
import {
  generateLoremIpsum,
  generateRandomNames,
} from './textHelpers';

interface TextGeneratorsPanelProps {
  defaultTool?: 'lorem' | 'random-text' | 'names';
}

export const TextGeneratorsPanel: React.FC<TextGeneratorsPanelProps> = ({
  defaultTool = 'lorem',
}) => {
  const [activeTab, setActiveTab] = useState<'lorem' | 'random-text' | 'names'>(defaultTool);
  const [copied, setCopied] = useState(false);

  // Lorem State
  const [loremCount, setLoremCount] = useState<number>(3);
  const [loremMode, setLoremMode] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [startWithLorem, setStartWithLorem] = useState<boolean>(true);
  const [asHtml, setAsHtml] = useState<boolean>(false);
  const [loremSeed, setLoremSeed] = useState<number>(1);

  // Names State
  const [nameCount, setNameCount] = useState<number>(10);
  const [nameCulture, setNameCulture] = useState<'all' | 'western' | 'nordic' | 'asian' | 'indic'>('all');
  const [nameFormat, setNameFormat] = useState<'first_last' | 'last_first' | 'numbered'>('first_last');
  const [nameSeed, setNameSeed] = useState<number>(1);

  // 1. Lorem Generation
  const loremResult = useMemo(() => {
    return generateLoremIpsum(loremCount, loremMode, startWithLorem, asHtml);
  }, [loremCount, loremMode, startWithLorem, asHtml, loremSeed]);

  // 2. Names Generation
  const namesResult = useMemo(() => {
    const raw = generateRandomNames(nameCount, nameCulture);
    return raw.map((fullName, idx) => {
      const parts = fullName.split(' ');
      const f = parts[0];
      const l = parts[1] || '';
      if (nameFormat === 'last_first') return `${l}, ${f}`;
      if (nameFormat === 'numbered') return `${idx + 1}. ${fullName}`;
      return fullName;
    });
  }, [nameCount, nameCulture, nameFormat, nameSeed]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Shuffle className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Placeholder & Synthetic Data Generators
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generate customizable Lorem Ipsum paragraphs, realistic random text, or synthetic multi-cultural name lists.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('lorem')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'lorem'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Lorem Ipsum
          </button>
          <button
            onClick={() => setActiveTab('names')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'names'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Name List Generator
          </button>
        </div>
      </div>

      {/* 1. LOREM IPSUM VIEW */}
      {activeTab === 'lorem' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Generate:</span>
              <input
                type="number"
                min={1}
                max={50}
                value={loremCount}
                onChange={(e) => setLoremCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 p-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
              <div className="flex items-center gap-1">
                {(['paragraphs', 'sentences', 'words'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setLoremMode(m)}
                    className={`px-2.5 py-1 rounded capitalize transition-colors ${
                      loremMode === m
                        ? 'bg-orange-500 text-white font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer ml-2 text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={startWithLorem}
                  onChange={(e) => setStartWithLorem(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                Start with "Lorem ipsum"
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={asHtml}
                  onChange={(e) => setAsHtml(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                HTML &lt;p&gt; tags
              </label>
            </div>

            <button
              onClick={() => setLoremSeed((s) => s + 1)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate
            </button>
          </div>

          {/* Output Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Generated Placeholder Output ({loremResult.split(/\s+/).filter(Boolean).length} words)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(loremResult)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
                <button
                  onClick={() => handleDownload(loremResult, 'lorem-ipsum.txt')}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={loremResult}
              rows={14}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-sans leading-relaxed select-all focus:outline-none shadow-sm"
            />
          </div>
        </div>
      )}

      {/* 2. NAME LIST VIEW */}
      {activeTab === 'names' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Count:</span>
              <input
                type="number"
                min={1}
                max={500}
                value={nameCount}
                onChange={(e) => setNameCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 p-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />

              <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2">Locale / Origin:</span>
              <select
                value={nameCulture}
                onChange={(e) => setNameCulture(e.target.value as any)}
                className="p-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs capitalize"
              >
                <option value="all">Global Mix (All)</option>
                <option value="western">Western / English</option>
                <option value="nordic">Nordic / Scandinavian</option>
                <option value="asian">East Asian</option>
                <option value="indic">South Asian / Indic</option>
              </select>

              <span className="font-semibold text-slate-700 dark:text-slate-300 ml-2">Format:</span>
              <select
                value={nameFormat}
                onChange={(e) => setNameFormat(e.target.value as any)}
                className="p-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value="first_last">First Last (e.g. Liam Smith)</option>
                <option value="last_first">Last, First (e.g. Smith, Liam)</option>
                <option value="numbered">1. Numbered List</option>
              </select>
            </div>

            <button
              onClick={() => setNameSeed((s) => s + 1)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Generate New Names
            </button>
          </div>

          {/* Names Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Generated Name List ({namesResult.length} entries)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(namesResult.join('\n'))}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
                <button
                  onClick={() => handleDownload(namesResult.join('\n'), 'random-names.txt')}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[360px] overflow-y-auto">
              {namesResult.map((name, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 flex items-center justify-between"
                >
                  <span className="truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
