import React, { useState, useMemo } from 'react';
import {
  Scissors,
  Layers,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface TextSplitMergePanelProps {
  initialMode?: 'split' | 'merge';
}

const SAMPLE_TEXT_SPLIT = `Apple, Banana, Cherry, Date, Elderberry, Fig, Grape, Honeydew, Kiwi, Lemon`;

const SAMPLE_BLOCKS_MERGE = [
  'Module 1: Authentication & Biometrics',
  'Module 2: File System & Local Encryption',
  'Module 3: PDF & Media Rendering',
  'Module 4: Offline Telemetry Nullifier',
];

export const TextSplitMergePanel: React.FC<TextSplitMergePanelProps> = ({
  initialMode = 'split',
}) => {
  const [mode, setMode] = useState<'split' | 'merge'>(initialMode);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  // Splitter State
  const [splitSource, setSplitSource] = useState<string>(SAMPLE_TEXT_SPLIT);
  const [splitStrategy, setSplitStrategy] = useState<'delimiter' | 'lines' | 'length'>('delimiter');
  const [splitDelimiter, setSplitDelimiter] = useState<string>(', ');
  const [linesPerChunk, setLinesPerChunk] = useState<number>(3);
  const [charsPerChunk, setCharsPerChunk] = useState<number>(50);

  // Merger State
  const [mergeBlocks, setMergeBlocks] = useState<string[]>(SAMPLE_BLOCKS_MERGE);
  const [newBlockInput, setNewBlockInput] = useState<string>('');
  const [mergeSeparator, setMergeSeparator] = useState<'\n' | ', ' | ' | ' | '\n---\n'>('\n');
  const [mergePrefix, setMergePrefix] = useState<string>('- ');
  const [mergeSuffix, setMergeSuffix] = useState<string>('');

  // 1. Computed Chunks (Split)
  const computedChunks = useMemo(() => {
    if (!splitSource) return [];

    if (splitStrategy === 'delimiter') {
      const sep = splitDelimiter || '\n';
      return splitSource.split(sep).map((s) => s.trim()).filter(Boolean);
    }

    if (splitStrategy === 'lines') {
      const lines = splitSource.split(/\r?\n/);
      const chunks: string[] = [];
      const step = Math.max(1, linesPerChunk);
      for (let i = 0; i < lines.length; i += step) {
        chunks.push(lines.slice(i, i + step).join('\n'));
      }
      return chunks;
    }

    // length
    const chunks: string[] = [];
    const size = Math.max(10, charsPerChunk);
    for (let i = 0; i < splitSource.length; i += size) {
      chunks.push(splitSource.slice(i, i + size));
    }
    return chunks;
  }, [splitSource, splitStrategy, splitDelimiter, linesPerChunk, charsPerChunk]);

  // 2. Computed Merged Result
  const computedMerged = useMemo(() => {
    return mergeBlocks
      .map((b) => `${mergePrefix}${b}${mergeSuffix}`)
      .join(mergeSeparator);
  }, [mergeBlocks, mergeSeparator, mergePrefix, mergeSuffix]);

  const handleCopyChunk = (chunk: string, idx: number) => {
    navigator.clipboard.writeText(chunk);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyAll = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
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
            {mode === 'split' ? <Scissors className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {mode === 'split' ? 'Text Splitter' : 'Text Merger'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {mode === 'split'
                ? 'Break text blocks apart by custom delimiters, line batches, or character chunk size.'
                : 'Combine and format multiple text blocks with custom separators, prefixes, and suffixes.'}
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setMode('split')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              mode === 'split'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Text Splitter
          </button>
          <button
            onClick={() => setMode('merge')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              mode === 'merge'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Text Merger
          </button>
        </div>
      </div>

      {/* SPLITTER VIEW */}
      {mode === 'split' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Split Method:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSplitStrategy('delimiter')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  splitStrategy === 'delimiter'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                By Delimiter String
              </button>
              <button
                onClick={() => setSplitStrategy('lines')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  splitStrategy === 'lines'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                By Line Count
              </button>
              <button
                onClick={() => setSplitStrategy('length')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  splitStrategy === 'length'
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                By Character Length
              </button>
            </div>

            {splitStrategy === 'delimiter' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500">Delimiter:</span>
                <input
                  type="text"
                  value={splitDelimiter}
                  onChange={(e) => setSplitDelimiter(e.target.value)}
                  className="p-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs w-24"
                />
              </div>
            )}

            {splitStrategy === 'lines' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500">Lines per Chunk:</span>
                <input
                  type="number"
                  min={1}
                  max={500}
                  value={linesPerChunk}
                  onChange={(e) => setLinesPerChunk(parseInt(e.target.value) || 1)}
                  className="p-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs w-16"
                />
              </div>
            )}

            {splitStrategy === 'length' && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-slate-500">Chars per Chunk:</span>
                <input
                  type="number"
                  min={10}
                  max={10000}
                  value={charsPerChunk}
                  onChange={(e) => setCharsPerChunk(parseInt(e.target.value) || 50)}
                  className="p-1 px-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs w-20"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">Input Text</span>
                <span>{splitSource.length} chars</span>
              </div>
              <textarea
                value={splitSource}
                onChange={(e) => setSplitSource(e.target.value)}
                rows={12}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
              />
            </div>

            {/* Chunks Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Splits ({computedChunks.length} chunks)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyAll(JSON.stringify(computedChunks, null, 2))}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy as JSON
                  </button>
                  <button
                    onClick={() => handleDownload(computedChunks.join('\n---\n'), 'split-chunks.txt')}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 max-h-[300px] overflow-y-auto space-y-2">
                {computedChunks.map((chunk, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-[11px]">
                        #{idx + 1}
                      </span>
                      <p className="font-mono text-slate-800 dark:text-slate-200 truncate">{chunk}</p>
                    </div>
                    <button
                      onClick={() => handleCopyChunk(chunk, idx)}
                      className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-600 dark:text-slate-300 shrink-0 text-[11px] transition-colors"
                    >
                      {copiedIndex === idx ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MERGER VIEW */}
      {mode === 'merge' && (
        <div className="space-y-4">
          {/* Merger Options */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-medium text-slate-500 uppercase text-[11px]">Join Separator</label>
              <select
                value={mergeSeparator}
                onChange={(e) => setMergeSeparator(e.target.value as any)}
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
              >
                <option value={'\n'}>Newline (\n)</option>
                <option value={', '}>Comma Space (, )</option>
                <option value={' | '}>Pipe Divider ( | )</option>
                <option value={'\n---\n'}>Markdown Divider (---)</option>
              </select>
            </div>
            <div>
              <label className="font-medium text-slate-500 uppercase text-[11px]">Line Prefix</label>
              <input
                type="text"
                value={mergePrefix}
                onChange={(e) => setMergePrefix(e.target.value)}
                placeholder="e.g. - or [item] "
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-medium text-slate-500 uppercase text-[11px]">Line Suffix</label>
              <input
                type="text"
                value={mergeSuffix}
                onChange={(e) => setMergeSuffix(e.target.value)}
                placeholder="e.g. ;"
                className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Blocks List */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider">
                  Text Blocks ({mergeBlocks.length})
                </span>
                <button
                  onClick={() => setMergeBlocks([])}
                  className="text-rose-500 hover:text-rose-600"
                >
                  Clear All
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBlockInput}
                  onChange={(e) => setNewBlockInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newBlockInput.trim()) {
                      setMergeBlocks([...mergeBlocks, newBlockInput.trim()]);
                      setNewBlockInput('');
                    }
                  }}
                  placeholder="Type new block and press Enter..."
                  className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
                />
                <button
                  onClick={() => {
                    if (newBlockInput.trim()) {
                      setMergeBlocks([...mergeBlocks, newBlockInput.trim()]);
                      setNewBlockInput('');
                    }
                  }}
                  className="px-3 py-2 rounded-lg bg-orange-600 text-white text-xs font-medium hover:bg-orange-500"
                >
                  Add
                </button>
              </div>

              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 max-h-[250px] overflow-y-auto space-y-1.5">
                {mergeBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-mono truncate">{block}</span>
                    <button
                      onClick={() => setMergeBlocks(mergeBlocks.filter((_, i) => i !== idx))}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Merged Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Merged Document
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyAll(computedMerged)}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedAll ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy
                  </button>
                  <button
                    onClick={() => handleDownload(computedMerged, 'merged-document.txt')}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
              <textarea
                readOnly
                value={computedMerged}
                rows={12}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono select-all focus:outline-none shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
