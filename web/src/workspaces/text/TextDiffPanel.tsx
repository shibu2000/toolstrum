import React, { useState, useMemo } from 'react';
import {
  GitCompare,
  Copy,
  Check,
  Download,
  ArrowRightLeft,
  Columns,
  Rows,
  Sparkles,
  FileText,
  Trash2,
} from 'lucide-react';

interface TextDiffPanelProps {
  initialOriginal?: string;
  initialModified?: string;
}

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  text: string;
  originalIndex?: number;
  modifiedIndex?: number;
}

const SAMPLE_ORIGINAL = `Toolstrum is an offline developer suite.
It contains 250 tools for images and PDFs.
All tools run locally with telemetry disabled.
Fast and lightweight architecture.`;

const SAMPLE_MODIFIED = `Toolstrum is an offline privacy-first developer suite.
It contains over 490 tools for images, PDFs, text, and security.
All tools run 100% locally with zero cloud dependencies.
Ultra fast and lightweight architecture.
Works on Web and Mobile seamlessly.`;

export const TextDiffPanel: React.FC<TextDiffPanelProps> = ({
  initialOriginal = SAMPLE_ORIGINAL,
  initialModified = SAMPLE_MODIFIED,
}) => {
  const [original, setOriginal] = useState<string>(initialOriginal);
  const [modified, setModified] = useState<string>(initialModified);
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [copied, setCopied] = useState(false);

  // Swap Left & Right
  const handleSwap = () => {
    const temp = original;
    setOriginal(modified);
    setModified(temp);
  };

  // Diff Computation (LCS line-by-line)
  const diffResult = useMemo(() => {
    const normalize = (line: string) => {
      let l = line;
      if (ignoreWhitespace) l = l.trim().replace(/\s+/g, ' ');
      if (ignoreCase) l = l.toLowerCase();
      return l;
    };

    const origLines = original.split(/\r?\n/);
    const modLines = modified.split(/\r?\n/);

    const m = origLines.length;
    const n = modLines.length;

    // DP LCS table
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (normalize(origLines[i - 1]) === normalize(modLines[j - 1])) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Backtrack to build diff lines
    const lines: DiffLine[] = [];
    let i = m;
    let j = n;

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && normalize(origLines[i - 1]) === normalize(modLines[j - 1])) {
        lines.unshift({
          type: 'unchanged',
          text: origLines[i - 1],
          originalIndex: i,
          modifiedIndex: j,
        });
        i--;
        j--;
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        lines.unshift({
          type: 'added',
          text: modLines[j - 1],
          modifiedIndex: j,
        });
        j--;
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        lines.unshift({
          type: 'removed',
          text: origLines[i - 1],
          originalIndex: i,
        });
        i--;
      }
    }

    const additions = lines.filter((l) => l.type === 'added').length;
    const deletions = lines.filter((l) => l.type === 'removed').length;
    const unchanged = lines.filter((l) => l.type === 'unchanged').length;
    const totalLines = additions + deletions + unchanged;
    const similarity = totalLines > 0 ? Math.round((unchanged / (unchanged + Math.max(additions, deletions))) * 100) : 100;

    return {
      lines,
      additions,
      deletions,
      unchanged,
      similarity,
    };
  }, [original, modified, ignoreWhitespace, ignoreCase]);

  // Patch Exporter
  const handleDownloadPatch = () => {
    const patchHeader = [
      '--- original.txt',
      '+++ modified.txt',
      `@@ -1,${original.split(/\r?\n/).length} +1,${modified.split(/\r?\n/).length} @@`,
    ];

    const patchBody = diffResult.lines.map((l) => {
      const prefix = l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' ';
      return `${prefix}${l.text}`;
    });

    const patchContent = [...patchHeader, ...patchBody].join('\n');
    const blob = new Blob([patchContent], { type: 'text/x-diff;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-diff-${Date.now()}.patch`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = () => {
    const summary = [
      `Text Diff Summary:`,
      `Similarity: ${diffResult.similarity}%`,
      `Additions: +${diffResult.additions} lines`,
      `Deletions: -${diffResult.deletions} lines`,
      `Unchanged:  ${diffResult.unchanged} lines`,
    ].join('\n');
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <GitCompare className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Text Diff & Visual Comparison
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Side-by-side split & unified line diffing with similarity score and .patch export.
            </p>
          </div>
        </div>

        {/* View mode & options */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              Split View
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'unified'
                  ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Rows className="w-3.5 h-3.5" />
              Unified View
            </button>
          </div>

          <button
            onClick={handleSwap}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500 flex items-center gap-1.5 transition-colors shadow-sm"
            title="Swap original and modified texts"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            Swap
          </button>

          <button
            onClick={handleDownloadPatch}
            className="text-xs px-2.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export .patch
          </button>
        </div>
      </div>

      {/* Options & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={ignoreWhitespace}
              onChange={(e) => setIgnoreWhitespace(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            Ignore Whitespace
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={ignoreCase}
              onChange={(e) => setIgnoreCase(e.target.checked)}
              className="rounded text-orange-600 focus:ring-orange-500"
            />
            Ignore Case
          </label>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            Similarity: <strong className="text-orange-600 dark:text-orange-400">{diffResult.similarity}%</strong>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
            +{diffResult.additions}
          </span>
          <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono font-bold">
            -{diffResult.deletions}
          </span>
          <span className="text-slate-400">
            {diffResult.unchanged} unchanged
          </span>
        </div>
      </div>

      {/* Text Inputs (Editable) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Original Text
          </label>
          <textarea
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
            Modified Text
          </label>
          <textarea
            value={modified}
            onChange={(e) => setModified(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
          />
        </div>
      </div>

      {/* Visual Line Diff Output */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>Visual Diff Inspector</span>
          <button
            onClick={handleCopyReport}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied Stats' : 'Copy Stats'}
          </button>
        </div>

        <div className="p-2 font-mono text-xs overflow-x-auto divide-y divide-slate-100 dark:divide-slate-800/40">
          {diffResult.lines.length === 0 ? (
            <p className="text-slate-400 py-6 text-center italic">No text provided to compare.</p>
          ) : (
            diffResult.lines.map((line, idx) => {
              if (line.type === 'added') {
                return (
                  <div key={idx} className="flex items-start bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 px-3 py-1">
                    <span className="w-8 shrink-0 text-emerald-600 font-bold select-none">+</span>
                    <span className="break-all whitespace-pre-wrap">{line.text}</span>
                  </div>
                );
              }
              if (line.type === 'removed') {
                return (
                  <div key={idx} className="flex items-start bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 px-3 py-1">
                    <span className="w-8 shrink-0 text-rose-600 font-bold select-none">-</span>
                    <span className="break-all whitespace-pre-wrap">{line.text}</span>
                  </div>
                );
              }
              return (
                <div key={idx} className="flex items-start text-slate-600 dark:text-slate-400 px-3 py-1">
                  <span className="w-8 shrink-0 text-slate-400 select-none"> </span>
                  <span className="break-all whitespace-pre-wrap">{line.text}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
