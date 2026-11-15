import React, { useState, useMemo } from 'react';
import {
  FileText,
  Copy,
  Check,
  Download,
  Eye,
  Code,
  Sparkles,
  RefreshCw,
  Columns,
  List,
  Layers,
} from 'lucide-react';

const SAMPLE_MARKDOWN = `# Toolstrum Developer Tools
*   Fast, local-first utility workspace
* Lightweight client-side engine
+   Zero server telemetry or uploads

## Features & Comparison
| Tool | Offline Capable | Benchmarked Against |
|---|---|---|
| JSON Studio | Yes | CyberChef & DevToys |
| Time Converter | Yes | EpochConverter |
| Diff & Patch | Yes | Diffchecker |

### Code Example
\`\`\`typescript
import { ToolstrumCore } from '@toolstrum/offline';

export function runTask() {
    return ToolstrumCore.executeOffline();
}
\`\`\`

> "Privacy by architecture, not by promise."
`;

export function formatMarkdownText(raw: string): string {
  const lines = raw.split('\n');

  // Step 1: Normalize headings (# Title)
  let normalized = lines.map((l) => {
    let line = l.replace(/\s+$/g, ''); // Trim trailing whitespace
    line = line.replace(/^(#{1,6})\s*(.+)$/, (m, hashes, text) => `${hashes} ${text.trim()}`);
    // Normalize bullet markers (* or + to -)
    line = line.replace(/^(\s*)[*+]\s+/, '$1- ');
    return line;
  });

  // Step 2: Format tables if present
  let inTable = false;
  let tableRows: string[][] = [];
  const result: string[] = [];

  const flushTable = () => {
    if (tableRows.length === 0) return;
    const colCount = Math.max(...tableRows.map((r) => r.length));
    const colWidths = new Array(colCount).fill(3);

    for (const row of tableRows) {
      for (let c = 0; c < row.length; c++) {
        colWidths[c] = Math.max(colWidths[c], (row[c] || '').trim().length);
      }
    }

    tableRows.forEach((row, rowIndex) => {
      const paddedCells = [];
      for (let c = 0; c < colCount; c++) {
        const cell = (row[c] || '').trim();
        if (rowIndex === 1 && /^:?-+:?$/.test(cell)) {
          // Separator row
          paddedCells.push('-'.repeat(colWidths[c]));
        } else {
          paddedCells.push(cell.padEnd(colWidths[c], ' '));
        }
      }
      result.push(`| ${paddedCells.join(' | ')} |`);
    });

    tableRows = [];
    inTable = false;
  };

  for (let idx = 0; idx < normalized.length; idx++) {
    const line = normalized[idx];
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      inTable = true;
      const cells = line.trim().slice(1, -1).split('|').map((c) => c.trim());
      tableRows.push(cells);
    } else {
      if (inTable) flushTable();
      result.push(line);
    }
  }
  if (inTable) flushTable();

  // Step 3: Collapse excessive blank lines (max 1 empty line between paragraphs)
  const collapsed: string[] = [];
  let blankRun = 0;
  for (const line of result) {
    if (line.trim() === '') {
      blankRun++;
      if (blankRun <= 1) collapsed.push('');
    } else {
      blankRun = 0;
      collapsed.push(line);
    }
  }

  return collapsed.join('\n').trim();
}

// Simple safe markdown to HTML converter for client-side live preview
export function renderMarkdownToHtml(md: string): string {
  let html = md
    // Code blocks
    .replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre class="bg-slate-900 text-slate-100 p-3 rounded-xl my-3 font-mono text-xs overflow-x-auto"><code>${escaped}</code></pre>`;
    })
    // Headings
    .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 dark:text-white mt-5 mb-2.5">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-xl font-black text-slate-900 dark:text-white mt-6 mb-3">$1</h1>')
    // Blockquote
    .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-sky-500 pl-3 my-2 italic text-slate-600 dark:text-slate-400">$1</blockquote>')
    // Bold & Italic
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>')
    // Inline code
    .replace(/`([^`]+)`/gim, '<code class="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 font-mono text-[11px]">$1</code>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300 text-xs my-0.5">$1</li>');

  return html;
}

export const MarkdownFormatterPanel: React.FC = () => {
  const [inputMd, setInputMd] = useState<string>(SAMPLE_MARKDOWN);
  const [activeTab, setActiveTab] = useState<'formatted' | 'preview' | 'html'>('formatted');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formattedMd = useMemo(() => {
    return formatMarkdownText(inputMd);
  }, [inputMd]);

  const renderedHtml = useMemo(() => {
    return renderMarkdownToHtml(formattedMd);
  }, [formattedMd]);

  // Telemetry
  const stats = useMemo(() => {
    const words = inputMd.trim().split(/\s+/).filter(Boolean).length;
    const chars = inputMd.length;
    const lines = inputMd.split('\n').length;
    const readingTimeMins = Math.ceil(words / 200);
    return { words, chars, lines, readingTimeMins };
  }, [inputMd]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Markdown Code Formatter & Live Previewer
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Normalizes headings, align tables, unifies bullets, and collapses whitespace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {stats.words} words
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {stats.lines} lines
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
            ~{stats.readingTimeMins} min read
          </span>
        </div>
      </div>

      {/* Editor & Output Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Markdown Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Raw Markdown Input
            </label>
            <button
              onClick={() => setInputMd(SAMPLE_MARKDOWN)}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Load Sample</span>
            </button>
          </div>
          <textarea
            value={inputMd}
            onChange={(e) => setInputMd(e.target.value)}
            rows={18}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            placeholder="Type or paste markdown content here..."
          />
        </div>

        {/* Right Column: Output Tabs (Formatted / Live Preview / Raw HTML) */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('formatted')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'formatted'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Formatted Markdown
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  activeTab === 'preview'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Live Preview</span>
              </button>
              <button
                onClick={() => setActiveTab('html')}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  activeTab === 'html'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Code className="w-3 h-3" />
                <span>HTML Code</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  copyToClipboard(activeTab === 'html' ? renderedHtml : formattedMd, 'output')
                }
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                {copiedKey === 'output' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() =>
                  handleDownload(
                    activeTab === 'html' ? renderedHtml : formattedMd,
                    activeTab === 'html' ? 'document.html' : 'README.md'
                  )
                }
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[430px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            {activeTab === 'preview' ? (
              <div
                className="p-5 h-full overflow-y-auto prose dark:prose-invert max-w-none text-xs"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            ) : activeTab === 'html' ? (
              <pre className="p-4 h-full font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-y-auto">
                {renderedHtml}
              </pre>
            ) : (
              <pre className="p-4 h-full font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap overflow-y-auto">
                {formattedMd}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
