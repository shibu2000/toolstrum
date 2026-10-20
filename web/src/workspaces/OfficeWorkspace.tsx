import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Table,
  FileCode,
  FileText,
  Eye,
  Download,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  ArrowRightLeft,
  ListOrdered,
  Sparkles,
  RefreshCw,
  FolderOpen,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface OfficeWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const OfficeWorkspace: React.FC<OfficeWorkspaceProps> = ({
  toolId,
  accentColor = '#10B981',
}) => {
  // Determine mode based on toolId:
  // 154-158, 172: Document & Text Reader / Format Converter
  // 159-161, 177-179: Markdown Studio (Live Editor, Table Generator, HTML preview)
  // 162-171: Spreadsheet & CSV Studio (Grid, JSON converter, cleaner)
  // 173-176, 180: Text File Processing Tools (Merger, Splitter, Line Numberer)
  const getInitialTab = (): 'markdown' | 'spreadsheet' | 'docreader' | 'texttools' => {
    if (
      toolId === 156 ||
      toolId === 157 ||
      toolId === 159 ||
      toolId === 160 ||
      toolId === 161 ||
      toolId === 177 ||
      toolId === 178 ||
      toolId === 179
    ) {
      return 'markdown';
    }
    if (toolId >= 162 && toolId <= 171) {
      return 'spreadsheet';
    }
    if (
      toolId === 158 ||
      toolId === 173 ||
      toolId === 174 ||
      toolId === 180
    ) {
      return 'texttools';
    }
    return 'docreader';
  };

  const [activeTab, setActiveTab] = useState<'markdown' | 'spreadsheet' | 'docreader' | 'texttools'>(getInitialTab);

  // Sync tab when toolId changes
  React.useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // TAB 1: DOCUMENT & TEXT READER (154-158, 172)
  // ==========================================
  const [docTextInput, setDocTextInput] = useState('');
  const [docFileName, setDocFileName] = useState('');
  const [docExtractedResult, setDocExtractedResult] = useState<string | null>(null);
  const [docWordCount, setDocWordCount] = useState(0);
  const [docCharCount, setDocCharCount] = useState(0);
  const [docParagraphCount, setDocParagraphCount] = useState(0);
  const [docSentenceCount, setDocSentenceCount] = useState(0);
  const [docFileMeta, setDocFileMeta] = useState<{ size: string; type: string; modified: string } | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDocFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocFileName(file.name);
    setDocFileMeta({
      size: formatFileSize(file.size),
      type: file.type || `.${file.name.split('.').pop()}`,
      modified: new Date(file.lastModified).toLocaleString(),
    });
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = (event.target?.result as string) || '';
      setDocTextInput(content);
    };
    reader.readAsText(file);
  };

  const handleProcessDocReader = () => {
    if (!docTextInput.trim()) return;
    const trimmed = docTextInput.trim();
    const words = trimmed.split(/\s+/).filter(Boolean).length;
    const chars = docTextInput.length;
    const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const sentences = trimmed.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim()).length;
    setDocWordCount(words);
    setDocCharCount(chars);
    setDocParagraphCount(paragraphs);
    setDocSentenceCount(sentences);
    setDocExtractedResult(docTextInput);
  };

  // ==========================================
  // TAB 2: MARKDOWN STUDIO (159-161, 177-179)
  // ==========================================
  const [markdownText, setMarkdownText] = useState(
    `# Project Overview\n\nWelcome to **Toolstrum Office Studio**.\n\n### Highlights:\n- 100% Offline processing\n- 100% Secure on your device\n- Instant preview & export\n\n| Feature | Status | Privacy |\n| :--- | :--- | :--- |\n| Documents | Ready | 100% Offline |\n| Spreadsheets | Ready | 100% Secure |\n\n> *Your confidential documents never leave your device.*`
  );
  const [showTableGenModal, setShowTableGenModal] = useState(false);
  const [tableCols, setTableCols] = useState(3);
  const [tableRows, setTableRows] = useState(3);

  const handleInsertTable = () => {
    let header = '| ' + Array.from({ length: tableCols }, (_, i) => `Header ${i + 1}`).join(' | ') + ' |\n';
    let divider = '| ' + Array.from({ length: tableCols }, () => ':---').join(' | ') + ' |\n';
    let rows = '';
    for (let r = 0; r < tableRows; r++) {
      rows += '| ' + Array.from({ length: tableCols }, (_, c) => `Row ${r + 1} Col ${c + 1}`).join(' | ') + ' |\n';
    }
    setMarkdownText((prev) => prev + '\n\n' + header + divider + rows);
    setShowTableGenModal(false);
  };

  const renderMarkdownHtml = (md: string) => {
    let html = md
      .replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-slate-900 dark:text-white mt-3 mb-1">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-xl font-extrabold text-slate-900 dark:text-white mt-4 mb-2 pb-1 border-b border-slate-200 dark:border-slate-800">$1</h1>')
      .replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-emerald-500 pl-3 italic text-slate-600 dark:text-slate-300 my-2">$1</blockquote>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-slate-700 dark:text-slate-300">$1</li>')
      .replace(/\n$/gim, '<br />');
    return { __html: html };
  };

  // ==========================================
  // TAB 3: SPREADSHEET & CSV STUDIO (162-171)
  // ==========================================
  const [csvHeaders, setCsvHeaders] = useState<string[]>(['Name', 'Department', 'Location', 'Status']);
  const [csvRows, setCsvRows] = useState<string[][]>([
    ['Sarah Jenkins', 'Engineering', 'New York', 'Active'],
    ['Alex Rivera', 'Product Design', 'London', 'Active'],
    ['Jordan Lee', 'Operations', 'Tokyo', 'Pending'],
  ]);
  const [newRowData, setNewRowData] = useState<string[]>(['', '', '', '']);

  // CSV <-> JSON Converter
  const [jsonInput, setJsonInput] = useState('');
  const [csvRawText, setCsvRawText] = useState('');
  const [convertedResult, setConvertedResult] = useState<string | null>(null);
  const [convertedMode, setConvertedMode] = useState<'csv' | 'json'>('csv');

  const handleJsonToCsv = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Please enter a valid JSON array of objects.');
      }
      const headers = Object.keys(parsed[0]);
      const lines = [
        headers.join(','),
        ...parsed.map((item) =>
          headers
            .map((h) => {
              const val = String(item[h] ?? '');
              return val.includes(',') ? `"${val}"` : val;
            })
            .join(',')
        ),
      ];
      setConvertedResult(lines.join('\n'));
      setConvertedMode('csv');
    } catch (e: any) {
      alert(`JSON conversion error: ${e.message}`);
    }
  };

  const handleCsvToJson = () => {
    try {
      const lines = csvRawText.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have a header line and at least one row.');
      }
      const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
      const list = lines.slice(1).map((line) => {
        const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] || '';
        });
        return obj;
      });
      setConvertedResult(JSON.stringify(list, null, 2));
      setConvertedMode('json');
    } catch (e: any) {
      alert(`CSV conversion error: ${e.message}`);
    }
  };

  const handleDownloadCsv = () => {
    const content = [
      csvHeaders.join(','),
      ...csvRows.map((r) => r.map((c) => (c.includes(',') ? `"${c}"` : c)).join(',')),
    ].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spreadsheet.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeduplicateCsv = () => {
    const seen = new Set<string>();
    const unique = csvRows.filter((row) => {
      const key = row.join('|||');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setCsvRows(unique);
  };

  const handleSortCsv = (ascending = true) => {
    const sorted = [...csvRows].sort((a, b) => {
      const valA = (a[0] || '').toLowerCase();
      const valB = (b[0] || '').toLowerCase();
      return ascending ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
    setCsvRows(sorted);
  };

  // ==========================================
  // CSV MERGER (Tool 167)
  // ==========================================
  const [mergeCsvInput, setMergeCsvInput] = useState('');
  const [showMergePanel, setShowMergePanel] = useState(false);

  const parseCsvText = (text: string): { headers: string[]; rows: string[][] } => {
    const lines = text.trim().split('\n').filter(Boolean);
    if (lines.length === 0) return { headers: [], rows: [] };
    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line) => line.split(',').map((v) => v.trim().replace(/^"|"$/g, '')));
    return { headers, rows };
  };

  const handleMergeCsv = () => {
    const incoming = parseCsvText(mergeCsvInput);
    if (incoming.headers.length === 0) {
      alert('Paste valid CSV content (a header row plus at least one data row) to merge.');
      return;
    }

    // Union headers: keep existing order, append any new columns from the incoming CSV.
    const mergedHeaders = [...csvHeaders];
    incoming.headers.forEach((h) => {
      if (!mergedHeaders.includes(h)) mergedHeaders.push(h);
    });

    const remapRow = (headers: string[], row: string[]): string[] =>
      mergedHeaders.map((h) => {
        const idx = headers.indexOf(h);
        return idx >= 0 ? row[idx] || '' : '';
      });

    const existingRemapped = csvRows.map((row) => remapRow(csvHeaders, row));
    const incomingRemapped = incoming.rows.map((row) => remapRow(incoming.headers, row));

    setCsvHeaders(mergedHeaders);
    setCsvRows([...existingRemapped, ...incomingRemapped]);
    setNewRowData(mergedHeaders.map(() => ''));
    setMergeCsvInput('');
    setShowMergePanel(false);
  };

  // ==========================================
  // TAB 4: TEXT FILE PROCESSORS (173-176, 180)
  // ==========================================
  const [textToolsInput, setTextToolsInput] = useState('');
  const [textToolsResult, setTextToolsResult] = useState<string | null>(null);
  const [textActionType, setTextActionType] = useState<'lineNumbers' | 'cleanSpaces' | 'removeEmpty' | 'wrapLines'>('lineNumbers');

  const handleRunTextAction = () => {
    if (!textToolsInput.trim()) return;
    const lines = textToolsInput.split('\n');
    let res = '';

    if (textActionType === 'lineNumbers') {
      res = lines.map((line, idx) => `${idx + 1}. ${line}`).join('\n');
    } else if (textActionType === 'cleanSpaces') {
      res = lines.map((line) => line.replace(/\s+/g, ' ').trim()).join('\n');
    } else if (textActionType === 'removeEmpty') {
      res = lines.filter((line) => line.trim().length > 0).join('\n');
    } else if (textActionType === 'wrapLines') {
      res = lines.map((l) => `"${l}"`).join(',\n');
    }

    setTextToolsResult(res);
  };

  // Common clipboard handler
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <FileSpreadsheet className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Office & Documents Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Spreadsheet tables, document readers, Markdown workspace, and file format utilities.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: DOCUMENT & TEXT READER (154-158, 172) */}
      {/* ======================================================== */}
      {activeTab === 'docreader' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                <span>Document & Text File Viewer</span>
              </h3>
              <label className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Upload File</span>
                <input
                  type="file"
                  accept=".txt,.md,.csv,.json,.doc,.docx"
                  onChange={handleDocFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {docFileName && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Loaded file: <strong>{docFileName}</strong></span>
                <button
                  onClick={() => {
                    setDocFileName('');
                    setDocTextInput('');
                    setDocExtractedResult(null);
                  }}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Document Content or Paste Text
              </label>
              <textarea
                value={docTextInput}
                onChange={(e) => setDocTextInput(e.target.value)}
                rows={10}
                placeholder="Paste document text or drop a text file here to read and analyze..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleProcessDocReader}
              disabled={!docTextInput.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              <span>Read & Inspect Document</span>
            </button>
          </div>

          <div>
            {docExtractedResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Document Analysis Complete
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(docExtractedResult)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Text'}</span>
                    </button>
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(docExtractedResult)}`}
                      download="document-extracted.txt"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .txt</span>
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-mono">Words</div>
                    <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{docWordCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-mono">Characters</div>
                    <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{docCharCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-mono">Sentences</div>
                    <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{docSentenceCount}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                    <div className="text-[10px] text-slate-400 font-mono">Paragraphs</div>
                    <div className="font-bold text-base text-slate-900 dark:text-white mt-0.5">{docParagraphCount}</div>
                  </div>
                </div>

                {docFileMeta && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                    <div className="font-bold text-slate-800 dark:text-slate-200 mb-1">File Metadata</div>
                    <div className="flex justify-between"><span className="text-slate-500">File Name</span><span className="font-mono text-slate-800 dark:text-slate-200">{docFileName}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">File Size</span><span className="font-mono text-slate-800 dark:text-slate-200">{docFileMeta.size}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">File Type</span><span className="font-mono text-slate-800 dark:text-slate-200">{docFileMeta.type}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Last Modified</span><span className="font-mono text-slate-800 dark:text-slate-200">{docFileMeta.modified}</span></div>
                  </div>
                )}

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 max-h-72 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {docExtractedResult}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select a document file or paste plain text, then click "Read & Inspect Document" to extract words, lines, and characters offline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: MARKDOWN STUDIO (159-161, 177-179) */}
      {/* ======================================================== */}
      {activeTab === 'markdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-500" />
                <span>Markdown Raw Editor</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTableGenModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Insert Table</span>
                </button>
              </div>
            </div>

            {showTableGenModal && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5 text-xs">
                <div className="font-bold text-slate-800 dark:text-slate-200">Generate Markdown Table</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-600 dark:text-slate-400">Columns: {tableCols}</label>
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={tableCols}
                      onChange={(e) => setTableCols(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-slate-600 dark:text-slate-400">Rows: {tableRows}</label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={tableRows}
                      onChange={(e) => setTableRows(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowTableGenModal(false)}
                    className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInsertTable}
                    className="px-3 py-1 rounded-md bg-emerald-600 text-white font-semibold"
                  >
                    Insert Table
                  </button>
                </div>
              </div>
            )}

            <textarea
              value={markdownText}
              onChange={(e) => setMarkdownText(e.target.value)}
              rows={16}
              className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none leading-relaxed resize-y"
              placeholder="Type markdown syntax here..."
            />
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span>Live Formatted Preview</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(markdownText)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy MD'}</span>
                </button>
                <a
                  href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdownText)}`}
                  download="document.md"
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .md</span>
                </a>
              </div>
            </div>

            <div
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 min-h-[380px] text-xs leading-relaxed overflow-y-auto space-y-2 text-slate-900 dark:text-white"
              dangerouslySetInnerHTML={renderMarkdownHtml(markdownText)}
            />
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: SPREADSHEET & CSV STUDIO (162-171) */}
      {/* ======================================================== */}
      {activeTab === 'spreadsheet' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-500" />
                <span>Interactive Spreadsheet Table ({csvRows.length} rows)</span>
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeduplicateCsv}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Deduplicate Rows
                </button>
                <button
                  onClick={() => handleSortCsv(true)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Sort A-Z
                </button>
                <button
                  onClick={() => setShowMergePanel((v) => !v)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                >
                  Merge Another CSV
                </button>
                <button
                  onClick={handleDownloadCsv}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>
              </div>
            </div>

            {showMergePanel && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Paste another CSV's content below (header row + data rows). Matching column names merge together; new columns are appended.
                </p>
                <textarea
                  rows={4}
                  value={mergeCsvInput}
                  onChange={(e) => setMergeCsvInput(e.target.value)}
                  placeholder={'Name,Department,Location,Status\nJane Doe,Sales,Remote,Active'}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200"
                />
                <button
                  onClick={handleMergeCsv}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                >
                  Merge into Table
                </button>
              </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold">
                    {csvHeaders.map((head, i) => (
                      <th key={i} className="p-3">
                        {head}
                      </th>
                    ))}
                    <th className="p-3 w-16 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {csvRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const updated = [...csvRows];
                              updated[rIdx][cIdx] = e.target.value;
                              setCsvRows(updated);
                            }}
                            className="w-full px-2 py-1 rounded-md border border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-emerald-500 bg-transparent text-slate-900 dark:text-white text-xs"
                          />
                        </td>
                      ))}
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => setCsvRows(csvRows.filter((_, idx) => idx !== rIdx))}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-500 cursor-pointer"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Add New Row */}
                  <tr className="bg-slate-50/40 dark:bg-slate-800/20">
                    {newRowData.map((val, idx) => (
                      <td key={idx} className="p-2.5">
                        <input
                          type="text"
                          placeholder={`Add ${csvHeaders[idx] || 'val'}...`}
                          value={val}
                          onChange={(e) => {
                            const updated = [...newRowData];
                            updated[idx] = e.target.value;
                            setNewRowData(updated);
                          }}
                          className="w-full px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                        />
                      </td>
                    ))}
                    <td className="p-2.5 text-center">
                      <button
                        onClick={() => {
                          if (newRowData.some((v) => v.trim())) {
                            setCsvRows([...csvRows, [...newRowData]]);
                            setNewRowData(['', '', '', '']);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5 inline" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick CSV <-> JSON Converter */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
              <span>Convert Between CSV and JSON</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  JSON to CSV Converter
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  rows={4}
                  placeholder='[{"id": 1, "product": "Chair", "price": 49}]'
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleJsonToCsv}
                  disabled={!jsonInput.trim()}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer transition-colors"
                >
                  Convert JSON to CSV
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  CSV to JSON Converter
                </label>
                <textarea
                  value={csvRawText}
                  onChange={(e) => setCsvRawText(e.target.value)}
                  rows={4}
                  placeholder={'id,product,price\n1,Chair,49'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleCsvToJson}
                  disabled={!csvRawText.trim()}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer transition-colors"
                >
                  Convert CSV to JSON
                </button>
              </div>
            </div>

            {convertedResult && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Converted Result ({convertedMode.toUpperCase()})
                  </span>
                  <button
                    onClick={() => handleCopy(convertedResult)}
                    className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-white dark:bg-slate-900 font-mono text-xs max-h-48 overflow-y-auto text-slate-800 dark:text-slate-200">
                  {convertedResult}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: FILE CLEANERS & TOOLS (173-176, 180) */}
      {/* ======================================================== */}
      {activeTab === 'texttools' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ListOrdered className="w-4 h-4 text-emerald-500" />
              <span>Text File Cleaners & Numberer</span>
            </h3>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Operation
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setTextActionType('lineNumbers')}
                  className={`p-2 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    textActionType === 'lineNumbers'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Add Line Numbers (1. 2. 3.)
                </button>
                <button
                  onClick={() => setTextActionType('cleanSpaces')}
                  className={`p-2 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    textActionType === 'cleanSpaces'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Trim Whitespace & Tabs
                </button>
                <button
                  onClick={() => setTextActionType('removeEmpty')}
                  className={`p-2 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    textActionType === 'removeEmpty'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Remove Empty Lines
                </button>
                <button
                  onClick={() => setTextActionType('wrapLines')}
                  className={`p-2 rounded-xl border text-left font-medium transition-all cursor-pointer ${
                    textActionType === 'wrapLines'
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Wrap in Quotes ("...")
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Input Text Lines
              </label>
              <textarea
                value={textToolsInput}
                onChange={(e) => setTextToolsInput(e.target.value)}
                rows={8}
                placeholder="Paste list of items or text lines here..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleRunTextAction}
              disabled={!textToolsInput.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Clean & Format Text Lines</span>
            </button>
          </div>

          <div>
            {textToolsResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Formatted Text Output
                    </h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(textToolsResult)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                    <a
                      href={`data:text/plain;charset=utf-8,${encodeURIComponent(textToolsResult)}`}
                      download="cleaned-text.txt"
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </a>
                  </div>
                </div>

                <pre className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 max-h-80 overflow-y-auto font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {textToolsResult}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select your formatting operation, enter your lines of text, and click "Clean & Format Text Lines". 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
