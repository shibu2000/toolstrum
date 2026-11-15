import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Search,
  Repeat,
  Layers,
  Filter,
} from 'lucide-react';
import {
  cleanExtraSpaces,
  cleanEmptyLines,
  cleanDuplicateLines,
  sortTextLines,
  reverseTextFull,
  performFindAndReplace,
  repeatText,
} from './textHelpers';

interface TextCleanerPanelProps {
  initialText?: string;
  defaultSubTool?: 'spaces' | 'empty' | 'duplicates' | 'sort' | 'reverse' | 'find-replace' | 'repeater';
}

const SAMPLE_TEXT = `   Toolstrum    Offline     Productivity   Suite   

   Toolstrum    Offline     Productivity   Suite   
Alpha Release 1.0
Delta Update 4.2
Beta Version 2.0
Charlie Patch 3.1

   Zero cloud dependency.
100% private and on-device.`;

export const TextCleanerPanel: React.FC<TextCleanerPanelProps> = ({
  initialText = SAMPLE_TEXT,
  defaultSubTool = 'spaces',
}) => {
  const [text, setText] = useState<string>(initialText);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    'spaces' | 'empty' | 'duplicates' | 'sort' | 'reverse' | 'find-replace' | 'repeater'
  >(defaultSubTool);

  // Duplicates settings
  const [caseInsensitiveDupes, setCaseInsensitiveDupes] = useState(false);

  // Sort settings
  const [sortMode, setSortMode] = useState<'az' | 'za' | 'natural' | 'length_asc' | 'length_desc' | 'shuffle'>('az');

  // Reverse settings
  const [reverseMode, setReverseMode] = useState<'lines' | 'words' | 'chars'>('lines');

  // Find & Replace settings
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitiveFind, setCaseSensitiveFind] = useState(false);
  const [wholeWordFind, setWholeWordFind] = useState(false);
  const [useRegexFind, setUseRegexFind] = useState(false);

  // Repeater settings
  const [repeatCount, setRepeatCount] = useState(3);
  const [repeatDelimiter, setRepeatDelimiter] = useState<'\n' | ', ' | ' ' | ';' | '---'>('\n');
  const [repeatPrefix, setRepeatPrefix] = useState('');
  const [repeatSuffix, setRepeatSuffix] = useState('');

  // Processed Output calculation
  const processedResult = useMemo(() => {
    switch (activeTab) {
      case 'spaces':
        return cleanExtraSpaces(text);
      case 'empty':
        return cleanEmptyLines(text);
      case 'duplicates':
        return cleanDuplicateLines(text, caseInsensitiveDupes).result;
      case 'sort':
        return sortTextLines(text, sortMode);
      case 'reverse':
        return reverseTextFull(text, reverseMode);
      case 'find-replace':
        return performFindAndReplace(text, searchQuery, replaceQuery, {
          caseSensitive: caseSensitiveFind,
          wholeWord: wholeWordFind,
          useRegex: useRegexFind,
        }).result;
      case 'repeater':
        return repeatText(text, repeatCount, repeatDelimiter, repeatPrefix, repeatSuffix);
      default:
        return text;
    }
  }, [
    text,
    activeTab,
    caseInsensitiveDupes,
    sortMode,
    reverseMode,
    searchQuery,
    replaceQuery,
    caseSensitiveFind,
    wholeWordFind,
    useRegexFind,
    repeatCount,
    repeatDelimiter,
    repeatPrefix,
    repeatSuffix,
  ]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([processedResult], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned-text-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const originalLines = text.split(/\r?\n/).length;
  const processedLines = processedResult.split(/\r?\n/).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Scissors className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Text Cleaner & Line Operations Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Remove extra spaces, purge duplicate lines, natural sort, reverse text, find/replace and repeat.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('spaces')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'spaces'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Extra Spaces
          </button>
          <button
            onClick={() => setActiveTab('empty')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'empty'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Empty Lines
          </button>
          <button
            onClick={() => setActiveTab('duplicates')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'duplicates'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Duplicate Lines
          </button>
          <button
            onClick={() => setActiveTab('sort')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'sort'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Sort Lines
          </button>
          <button
            onClick={() => setActiveTab('reverse')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'reverse'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Reverse
          </button>
          <button
            onClick={() => setActiveTab('find-replace')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'find-replace'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Find & Replace
          </button>
          <button
            onClick={() => setActiveTab('repeater')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'repeater'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Repeater
          </button>
        </div>
      </div>

      {/* Contextual Operation Controls */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {activeTab === 'spaces' && (
          <p className="text-xs text-slate-500">
            Automatically collapses consecutive spaces into single spaces and trims leading/trailing whitespace per line.
          </p>
        )}

        {activeTab === 'empty' && (
          <p className="text-xs text-slate-500">
            Automatically removes all blank lines or lines containing only whitespace.
          </p>
        )}

        {activeTab === 'duplicates' && (
          <div className="flex items-center gap-4 text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={caseInsensitiveDupes}
                onChange={(e) => setCaseInsensitiveDupes(e.target.checked)}
                className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
              />
              Case-Insensitive Deduplication (treat "Apple" and "apple" as identical)
            </label>
          </div>
        )}

        {activeTab === 'sort' && (
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort Order:</span>
            {[
              { id: 'az', label: 'A → Z (Alphabetical)' },
              { id: 'za', label: 'Z → A (Reverse Alphabetical)' },
              { id: 'natural', label: '1, 2, 10 (Natural Order)' },
              { id: 'length_asc', label: 'Length (Shortest First)' },
              { id: 'length_desc', label: 'Length (Longest First)' },
              { id: 'shuffle', label: 'Random Shuffle' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortMode(opt.id as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  sortMode === opt.id
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'reverse' && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Reverse By:</span>
            {[
              { id: 'lines', label: 'Reverse Line Order (Bottom to Top)' },
              { id: 'words', label: 'Reverse Words in Text' },
              { id: 'chars', label: 'Reverse Every Character' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setReverseMode(opt.id as any)}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  reverseMode === opt.id
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'find-replace' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase">Find String or Pattern</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Offline or [0-9]+"
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 uppercase">Replace With</label>
                <input
                  type="text"
                  value={replaceQuery}
                  onChange={(e) => setReplaceQuery(e.target.value)}
                  placeholder="e.g. Local"
                  className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700 dark:text-slate-300">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={caseSensitiveFind}
                  onChange={(e) => setCaseSensitiveFind(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                Match Case
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wholeWordFind}
                  onChange={(e) => setWholeWordFind(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                Whole Word
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useRegexFind}
                  onChange={(e) => setUseRegexFind(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                Regular Expression (Regex)
              </label>
            </div>
          </div>
        )}

        {activeTab === 'repeater' && (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-medium text-slate-500 uppercase text-[11px]">Repeat Count</label>
              <input
                type="number"
                min={1}
                max={5000}
                value={repeatCount}
                onChange={(e) => setRepeatCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-medium text-slate-500 uppercase text-[11px]">Delimiter</label>
              <select
                value={repeatDelimiter}
                onChange={(e) => setRepeatDelimiter(e.target.value as any)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value={'\n'}>New Line (\n)</option>
                <option value={', '}>Comma Space (, )</option>
                <option value={' '}>Single Space</option>
                <option value={';'}>Semicolon (;)</option>
                <option value={'---'}>Divider (---)</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-slate-500 uppercase text-[11px]">Optional Prefix</label>
              <input
                type="text"
                value={repeatPrefix}
                onChange={(e) => setRepeatPrefix(e.target.value)}
                placeholder="e.g. [Item "
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-medium text-slate-500 uppercase text-[11px]">Optional Suffix</label>
              <input
                type="text"
                value={repeatSuffix}
                onChange={(e) => setRepeatSuffix(e.target.value)}
                placeholder="e.g. ]"
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>
        )}
      </div>

      {/* Dual Pane: Input vs Processed Result */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider">Original Text</span>
            <span>
              {originalLines} lines • {text.length} chars
            </span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        {/* Processed Output */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Cleaned Output
            </span>
            <div className="flex items-center gap-2">
              <span>
                {processedLines} lines • {processedResult.length} chars
              </span>
              <button
                onClick={() => handleCopy(processedResult)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy'}
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
            value={processedResult}
            rows={12}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono focus:outline-none shadow-sm select-all"
          />
        </div>
      </div>
    </div>
  );
};
