import React, { useState, useMemo } from 'react';
import {
  FileText,
  Table as TableIcon,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Sparkles,
  Bold,
  Italic,
  Heading,
  List,
  Code,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';

interface MarkdownToolsPanelProps {
  defaultSubTool?: 'editor' | 'table';
}

const SAMPLE_MARKDOWN = `# Toolstrum Offline Platform

Welcome to **Toolstrum**, the *100% offline* developer and productivity suite.

### Key Architecture Features
* **Zero Telemetry**: Everything executes on your client device.
* **Instant Speed**: No network round-trips or API gateways.
* **Portable**: Available on Web and Native Mobile platforms.

> "True privacy means your data never leaves your machine."

\`\`\`typescript
const isOffline = true;
console.log("Client safe:", isOffline);
\`\`\`
`;

export const MarkdownToolsPanel: React.FC<MarkdownToolsPanelProps> = ({
  defaultSubTool = 'editor',
}) => {
  const [activeTab, setActiveTab] = useState<'editor' | 'table'>(defaultSubTool);
  const [copied, setCopied] = useState(false);

  // Markdown Editor State
  const [markdown, setMarkdown] = useState<string>(SAMPLE_MARKDOWN);

  // Table Generator State
  const [headers, setHeaders] = useState<string[]>(['Feature', 'Status', 'Platform', 'Performance']);
  const [alignments, setAlignments] = useState<('left' | 'center' | 'right')[]>([
    'left',
    'center',
    'left',
    'right',
  ]);
  const [rows, setRows] = useState<string[][]>([
    ['PDF Processing', 'Ready', 'Web & Mobile', '100% Client'],
    ['Image Editing', 'Ready', 'Web & Mobile', 'Zero Lag'],
    ['Developer Tools', 'Ready', 'Web & Mobile', 'Offline'],
    ['Security / Passwords', 'Ready', 'Web & Mobile', 'Encrypted'],
  ]);

  // Insert markdown tag helper
  const handleInsert = (prefix: string, suffix = '') => {
    setMarkdown((prev) => `${prev}\n${prefix}Content${suffix}\n`);
  };

  // 1. Table Markdown Generator
  const generatedTableMarkdown = useMemo(() => {
    const pad = (str: string, len: number) => str.padEnd(len, ' ');

    // Calculate column widths
    const colWidths = headers.map((h, colIdx) => {
      let max = h.length;
      rows.forEach((r) => {
        if (r[colIdx] && r[colIdx].length > max) max = r[colIdx].length;
      });
      return Math.max(max, 4);
    });

    // Header row
    const headerRow =
      '| ' + headers.map((h, i) => pad(h, colWidths[i])).join(' | ') + ' |';

    // Alignment separator row
    const separatorRow =
      '| ' +
      alignments
        .map((a, i) => {
          const w = colWidths[i];
          if (a === 'center') return ':' + '-'.repeat(w - 2) + ':';
          if (a === 'right') return '-'.repeat(w - 1) + ':';
          return ':' + '-'.repeat(w - 1);
        })
        .join(' | ') +
      ' |';

    // Body rows
    const bodyRows = rows.map(
      (row) =>
        '| ' +
        headers.map((_, i) => pad(row[i] || '', colWidths[i])).join(' | ') +
        ' |'
    );

    return [headerRow, separatorRow, ...bodyRows].join('\n');
  }, [headers, alignments, rows]);

  // Table manipulation helpers
  const addRow = () => {
    setRows([...rows, headers.map(() => '')]);
  };

  const removeRow = (rowIdx: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, i) => i !== rowIdx));
    }
  };

  const addColumn = () => {
    setHeaders([...headers, `Col ${headers.length + 1}`]);
    setAlignments([...alignments, 'left']);
    setRows(rows.map((r) => [...r, '']));
  };

  const removeColumn = (colIdx: number) => {
    if (headers.length > 1) {
      setHeaders(headers.filter((_, i) => i !== colIdx));
      setAlignments(alignments.filter((_, i) => i !== colIdx));
      setRows(rows.map((r) => r.filter((_, i) => i !== colIdx)));
    }
  };

  const handleCellChange = (rIdx: number, cIdx: number, val: string) => {
    const updated = [...rows];
    updated[rIdx] = [...updated[rIdx]];
    updated[rIdx][cIdx] = val;
    setRows(updated);
  };

  const handleHeaderChange = (cIdx: number, val: string) => {
    const updated = [...headers];
    updated[cIdx] = val;
    setHeaders(updated);
  };

  const toggleAlignment = (cIdx: number) => {
    const modes: ('left' | 'center' | 'right')[] = ['left', 'center', 'right'];
    const current = alignments[cIdx];
    const next = modes[(modes.indexOf(current) + 1) % modes.length];
    const updated = [...alignments];
    updated[cIdx] = next;
    setAlignments(updated);
  };

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            {activeTab === 'editor' ? <FileText className="w-5 h-5" /> : <TableIcon className="w-5 h-5" />}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Markdown Editor & Table Generator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live split Markdown document editor and interactive visual spreadsheet table generator.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'editor'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Markdown Live Editor
          </button>
          <button
            onClick={() => setActiveTab('table')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'table'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Markdown Table Generator
          </button>
        </div>
      </div>

      {/* 1. MARKDOWN EDITOR */}
      {activeTab === 'editor' && (
        <div className="space-y-3">
          {/* Toolbar */}
          <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleInsert('**', '**')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleInsert('*', '*')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleInsert('### ')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Heading 3"
              >
                <Heading className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleInsert('* ')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="List Item"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleInsert('```typescript\n', '\n```')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Code Block"
              >
                <Code className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleInsert('[Link Title](', ')')}
                className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                title="Link"
              >
                <Link className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(markdown)}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy MD
              </button>
              <button
                onClick={() => handleDownload(markdown, 'document.md')}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download .md
              </button>
            </div>
          </div>

          {/* Dual Split Editor vs Preview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Markdown Source
              </label>
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                rows={16}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono leading-relaxed focus:outline-none focus:border-orange-500 shadow-sm"
              />
            </div>

            {/* Rendered Preview */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Rendered Preview
              </label>
              <div className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[300px] max-h-[380px] overflow-y-auto prose dark:prose-invert prose-sm shadow-sm">
                <div
                  dangerouslySetInnerHTML={{
                    __html: markdown
                      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold mb-2">$1</h1>')
                      .replace(/^### (.*$)/gim, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
                      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-orange-500 pl-3 italic text-slate-500 my-2">$1</blockquote>')
                      .replace(/^\* (.*$)/gim, '<li class="ml-4 list-disc">$1</li>')
                      .replace(/```([\s\S]*?)```/gim, '<pre class="bg-slate-800 text-slate-100 p-2.5 rounded text-xs overflow-x-auto my-2"><code>$1</code></pre>')
                      .replace(/\n$/gim, '<br />'),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MARKDOWN TABLE GENERATOR */}
      {activeTab === 'table' && (
        <div className="space-y-4">
          {/* Table Controls */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={addRow}
                className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Row
              </button>
              <button
                onClick={addColumn}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Column
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(generatedTableMarkdown)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Table Markdown
              </button>
            </div>
          </div>

          {/* Interactive Grid Spreadsheet */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="py-2 px-3 w-10 text-center">#</th>
                  {headers.map((h, colIdx) => (
                    <th key={colIdx} className="py-2 px-3">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={h}
                          onChange={(e) => handleHeaderChange(colIdx, e.target.value)}
                          className="p-1 px-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold w-full"
                        />
                        <button
                          onClick={() => toggleAlignment(colIdx)}
                          className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
                          title={`Alignment: ${alignments[colIdx]}`}
                        >
                          {alignments[colIdx] === 'center' ? (
                            <AlignCenter className="w-3.5 h-3.5 text-orange-500" />
                          ) : alignments[colIdx] === 'right' ? (
                            <AlignRight className="w-3.5 h-3.5 text-orange-500" />
                          ) : (
                            <AlignLeft className="w-3.5 h-3.5 text-orange-500" />
                          )}
                        </button>
                        <button
                          onClick={() => removeColumn(colIdx)}
                          className="p-1 rounded hover:bg-rose-100 text-slate-400 hover:text-rose-600"
                          title="Delete column"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </th>
                  ))}
                  <th className="py-2 px-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {rows.map((row, rowIdx) => (
                  <tr key={rowIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-3 text-slate-400 text-center font-mono">{rowIdx + 1}</td>
                    {headers.map((_, colIdx) => (
                      <td key={colIdx} className="py-1.5 px-3">
                        <input
                          type="text"
                          value={row[colIdx] || ''}
                          onChange={(e) => handleCellChange(rowIdx, colIdx, e.target.value)}
                          className="p-1 px-1.5 rounded border border-slate-200 dark:border-slate-700 bg-transparent text-xs w-full focus:bg-white dark:focus:bg-slate-800"
                        />
                      </td>
                    ))}
                    <td className="py-1.5 px-2 text-center">
                      <button
                        onClick={() => removeRow(rowIdx)}
                        className="p-1 rounded text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                        title="Delete row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Generated Markdown Table Output */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              Generated Markdown Table Code
            </label>
            <textarea
              readOnly
              value={generatedTableMarkdown}
              rows={6}
              className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono select-all focus:outline-none shadow-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
};
