import React, { useState, useRef, useEffect } from 'react';
import {
  Cpu,
  GitCompare,
  ShieldAlert,
  BarChart2,
  Table,
  Copy,
  Check,
  Download,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
  FileText,
  Sliders,
  Eye,
  HardDrive,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface AdvancedWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

interface DiffLine {
  type: 'same' | 'added' | 'removed';
  text: string;
}

export const AdvancedWorkspace: React.FC<AdvancedWorkspaceProps> = ({
  toolId,
  accentColor = '#9333EA',
}) => {
  // Tabs:
  // 475-476: Spreadsheet Formula Helper
  // 477-478: CSV Data Cleaner & Visual Chart
  // 479-484: Sensitive Data Redactor & Privacy Sanitizer
  // 474: Text Difference Checker
  // 471-473, 481-482, 485-500: Batch File Renamer & Storage Utilities
  const getInitialTab = (): 'formula' | 'chart' | 'redact' | 'diff' | 'batch' => {
    if (toolId === 475 || toolId === 476) return 'formula';
    if (toolId === 477 || toolId === 478) return 'chart';
    if (toolId >= 479 && toolId <= 484) return 'redact';
    if (toolId === 474) return 'diff';
    return 'batch';
  };

  const [activeTab, setActiveTab] = useState<'formula' | 'chart' | 'redact' | 'diff' | 'batch'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // TAB 1: SPREADSHEET FORMULA HELPER (475, 476)
  // ==========================================
  const [formulaGoal, setFormulaGoal] = useState<'vlookup' | 'sumifs' | 'countifs' | 'iferror' | 'textsplit'>('vlookup');
  const [colLookup, setColLookup] = useState('A2');
  const [colTable, setColTable] = useState('Data!A:E');
  const [colIndex, setColIndex] = useState('3');
  const [generatedFormula, setGeneratedFormula] = useState<string | null>(null);
  const [formulaExplanation, setFormulaExplanation] = useState('');

  const handleGenerateFormula = () => {
    if (formulaGoal === 'vlookup') {
      const f = `=XLOOKUP(${colLookup}, ${colTable.split(':')[0]}, ${colTable.split(':')[1] || 'B:B'}, "Not Found")`;
      setGeneratedFormula(f);
      setFormulaExplanation('Modern formula that looks up the search term in your table and returns the corresponding value with automatic error fallback.');
    } else if (formulaGoal === 'sumifs') {
      const f = `=SUMIFS(C:C, A:A, "${colLookup}", B:B, ">0")`;
      setGeneratedFormula(f);
      setFormulaExplanation('Sums values in Column C only when Column A matches your condition and Column B is positive.');
    } else if (formulaGoal === 'countifs') {
      const f = `=COUNTIFS(A:A, "${colLookup}", B:B, "<>Complete")`;
      setGeneratedFormula(f);
      setFormulaExplanation('Counts how many rows match your specific category and have pending status.');
    } else if (formulaGoal === 'iferror') {
      const f = `=IFERROR(${colLookup}, "—")`;
      setGeneratedFormula(f);
      setFormulaExplanation('Prevents unsightly #N/A or #DIV/0! errors across your spreadsheet dashboard by displaying a clean dash.');
    } else if (formulaGoal === 'textsplit') {
      const f = `=TRIM(MID(${colLookup}, SEARCH(" ", ${colLookup}) + 1, 100))`;
      setGeneratedFormula(f);
      setFormulaExplanation('Extracts clean last name or secondary text string from full names or product codes.');
    }
  };

  // ==========================================
  // TAB 2: DATA CLEANER & VISUAL CHART (477, 478)
  // ==========================================
  const [chartDataInput, setChartDataInput] = useState(
    `Month,Sales\nJanuary,4200\nFebruary,5600\nMarch,7100\nApril,6800\nMay,8900\nJune,9400`
  );
  const [hasGeneratedChart, setHasGeneratedChart] = useState(false);
  const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleGenerateChart = () => {
    setHasGeneratedChart(true);
    setTimeout(() => {
      renderChartCanvas();
    }, 50);
  };

  const renderChartCanvas = () => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lines = chartDataInput.trim().split('\n').filter(Boolean);
    if (lines.length < 2) return;

    // Parse labels and values
    const data: { label: string; value: number }[] = [];
    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',');
      if (parts.length >= 2) {
        data.push({
          label: parts[0].trim(),
          value: parseFloat(parts[1].trim()) || 0,
        });
      }
    }

    const width = (canvas.width = 540);
    const height = (canvas.height = 280);
    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    if (data.length === 0) return;

    const maxVal = Math.max(...data.map((d) => d.value), 1);
    const padding = 45;
    const chartHeight = height - padding * 2;
    const chartWidth = width - padding * 2;
    const barWidth = Math.min(chartWidth / data.length - 14, 48);

    data.forEach((item, idx) => {
      const barHeight = (item.value / maxVal) * chartHeight;
      const x = padding + idx * (chartWidth / data.length) + 6;
      const y = height - padding - barHeight;

      // Bar fill
      const grad = ctx.createLinearGradient(0, y, 0, height - padding);
      grad.addColorStop(0, '#a855f7');
      grad.addColorStop(1, '#6366f1');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
      ctx.fill();

      // Value label on top
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(String(item.value), x + barWidth / 2, y - 6);

      // Category label at bottom
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(item.label.slice(0, 7), x + barWidth / 2, height - padding + 16);
    });
  };

  const handleDownloadChartPng = () => {
    if (!chartCanvasRef.current) return;
    const a = document.createElement('a');
    a.href = chartCanvasRef.current.toDataURL('image/png');
    a.download = 'sales-chart.png';
    a.click();
  };

  // ==========================================
  // TAB 3: DATA REDACTOR & SANITIZER (479-484)
  // ==========================================
  const [redactInput, setRedactInput] = useState('');
  const [redactEmails, setRedactEmails] = useState(true);
  const [redactPhones, setRedactPhones] = useState(true);
  const [redactCards, setRedactCards] = useState(true);
  const [redactIps, setRedactIps] = useState(true);
  const [redactedResult, setRedactedResult] = useState<string | null>(null);
  const [redactedCount, setRedactedCount] = useState(0);

  const handleRedactData = () => {
    if (!redactInput.trim()) return;
    let text = redactInput;
    let count = 0;

    if (redactEmails) {
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const matches = text.match(emailRegex) || [];
      count += matches.length;
      text = text.replace(emailRegex, '[EMAIL HIDDEN]');
    }

    if (redactPhones) {
      const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
      const matches = text.match(phoneRegex) || [];
      count += matches.length;
      text = text.replace(phoneRegex, '[PHONE HIDDEN]');
    }

    if (redactCards) {
      const cardRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
      const matches = text.match(cardRegex) || [];
      count += matches.length;
      text = text.replace(cardRegex, '[CARD HIDDEN]');
    }

    if (redactIps) {
      const ipRegex = /\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g;
      const matches = text.match(ipRegex) || [];
      count += matches.length;
      text = text.replace(ipRegex, '[IP HIDDEN]');
    }

    setRedactedCount(count);
    setRedactedResult(text);
  };

  // ==========================================
  // TAB 4: TEXT DIFFERENCE CHECKER (474)
  // ==========================================
  const [diffOriginal, setDiffOriginal] = useState(
    `Welcome to Toolstrum.\nFast offline tools for everyone.\nYour privacy is completely protected.`
  );
  const [diffModified, setDiffModified] = useState(
    `Welcome to Toolstrum.\nFast 100% offline utilities for everyone.\nYour privacy is 100% secure and protected on your device.`
  );
  const [diffLinesResult, setDiffLinesResult] = useState<DiffLine[] | null>(null);

  const handleRunDiff = () => {
    const oLines = diffOriginal.split('\n');
    const mLines = diffModified.split('\n');
    const results: DiffLine[] = [];

    const maxLen = Math.max(oLines.length, mLines.length);
    for (let i = 0; i < maxLen; i++) {
      const o = oLines[i];
      const m = mLines[i];

      if (o === m) {
        results.push({ type: 'same', text: o });
      } else {
        if (o !== undefined) results.push({ type: 'removed', text: o });
        if (m !== undefined) results.push({ type: 'added', text: m });
      }
    }
    setDiffLinesResult(results);
  };

  // ==========================================
  // TAB 5: BATCH FILE RENAMER & CLEANUP (481-500)
  // ==========================================
  const [batchPrefix, setBatchPrefix] = useState('doc_');
  const [batchSuffix, setBatchSuffix] = useState('_v1');
  const [batchSampleFiles, setBatchSampleFiles] = useState(
    `invoice 01.pdf\nreceipt 2026.png\nclient meeting notes.txt\nfinancial summary.csv`
  );
  const [batchRenamedResult, setBatchRenamedResult] = useState<string | null>(null);

  const handleRunBatchRename = () => {
    const lines = batchSampleFiles.split('\n').filter(Boolean);
    const renamed = lines.map((name, idx) => {
      const clean = name.trim().replace(/\s+/g, '_').toLowerCase();
      const dotIdx = clean.lastIndexOf('.');
      if (dotIdx > 0) {
        const base = clean.substring(0, dotIdx);
        const ext = clean.substring(dotIdx);
        return `${batchPrefix}${base}${batchSuffix}${ext}`;
      }
      return `${batchPrefix}${clean}${batchSuffix}`;
    });
    setBatchRenamedResult(renamed.join('\n'));
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
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Cpu className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Advanced & Experimental Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Spreadsheet formulas, data cleaner charts, text difference comparison, and batch utilities.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-purple-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SPREADSHEET FORMULA HELPER (475, 476) */}
      {/* ======================================================== */}
      {activeTab === 'formula' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-purple-500" />
              <span>Spreadsheet Formula Generator (Excel & Google Sheets)</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                What formula do you need?
              </label>
              <select
                value={formulaGoal}
                onChange={(e) => setFormulaGoal(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              >
                <option value="vlookup">Look up values across columns (XLOOKUP / VLOOKUP)</option>
                <option value="sumifs">Sum numbers matching specific criteria (SUMIFS)</option>
                <option value="countifs">Count rows matching criteria (COUNTIFS)</option>
                <option value="iferror">Clean up spreadsheet errors (IFERROR)</option>
                <option value="textsplit">Extract words or split names (TRIM/MID)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Search Cell or Item
                </label>
                <input
                  type="text"
                  value={colLookup}
                  onChange={(e) => setColLookup(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Data Range
                </label>
                <input
                  type="text"
                  value={colTable}
                  onChange={(e) => setColTable(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateFormula}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Spreadsheet Formula</span>
            </button>
          </div>

          <div>
            {generatedFormula ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Generated Spreadsheet Formula
                  </h4>
                  <button
                    onClick={() => handleCopy(generatedFormula)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Formula'}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-sm font-bold text-purple-600 dark:text-purple-400 break-all">
                  {generatedFormula}
                </div>

                <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                  <div className="font-bold text-purple-700 dark:text-purple-300">How to use:</div>
                  <p>{formulaExplanation}</p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select what formula you need and click "Generate Spreadsheet Formula".
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: DATA CLEANER & VISUAL CHART (477, 478) */}
      {/* ======================================================== */}
      {activeTab === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-purple-500" />
              <span>Data to Visual Chart Generator</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Data (Category,Value)
              </label>
              <textarea
                value={chartDataInput}
                onChange={(e) => setChartDataInput(e.target.value)}
                rows={8}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>

            <button
              onClick={handleGenerateChart}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <BarChart2 className="w-4 h-4" />
              <span>Generate Visual Chart</span>
            </button>
          </div>

          <div>
            {hasGeneratedChart ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Generated Bar Chart
                  </h4>
                  <button
                    onClick={handleDownloadChartPng}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                </div>

                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
                  <canvas ref={chartCanvasRef} className="w-full h-auto max-h-64 object-contain" />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter your data categories and numbers, then click "Generate Visual Chart" to draw an instant offline chart.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DATA REDACTOR & SANITIZER (479-484) */}
      {/* ======================================================== */}
      {activeTab === 'redact' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-500" />
              <span>Document Privacy Redactor</span>
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={redactEmails}
                  onChange={(e) => setRedactEmails(e.target.checked)}
                  className="rounded-sm accent-purple-600"
                />
                <span>Hide Email Addresses</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={redactPhones}
                  onChange={(e) => setRedactPhones(e.target.checked)}
                  className="rounded-sm accent-purple-600"
                />
                <span>Hide Phone Numbers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={redactCards}
                  onChange={(e) => setRedactCards(e.target.checked)}
                  className="rounded-sm accent-purple-600"
                />
                <span>Hide Card Numbers</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={redactIps}
                  onChange={(e) => setRedactIps(e.target.checked)}
                  className="rounded-sm accent-purple-600"
                />
                <span>Hide IP Addresses</span>
              </label>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Text or Document Content
              </label>
              <textarea
                value={redactInput}
                onChange={(e) => setRedactInput(e.target.value)}
                rows={7}
                placeholder="Paste text containing emails, phone numbers, or private details..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>

            <button
              onClick={handleRedactData}
              disabled={!redactInput.trim()}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Redact Sensitive Data Now</span>
            </button>
          </div>

          <div>
            {redactedResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Sanitized Output
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {redactedCount} sensitive item(s) safely hidden
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(redactedResult)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Sanitized Text'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  value={redactedResult}
                  rows={9}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Paste any text and click "Redact Sensitive Data Now" to strip emails, phone numbers, and private data.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TEXT DIFFERENCE CHECKER (474) */}
      {/* ======================================================== */}
      {activeTab === 'diff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Original Text
              </label>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Modified Text
              </label>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={handleRunDiff}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <GitCompare className="w-4 h-4" />
            <span>Compare Differences Now</span>
          </button>

          {diffLinesResult && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-3">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Comparison Result
              </h4>
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 font-mono text-xs max-h-72 overflow-y-auto">
                {diffLinesResult.map((l, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 flex items-start gap-2 ${
                      l.type === 'added'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                        : l.type === 'removed'
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className="w-4 select-none font-bold">
                      {l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">{l.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: BATCH FILE RENAMER & CLEANUP (481-500) */}
      {/* ======================================================== */}
      {activeTab === 'batch' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-purple-500" />
              <span>Smart Batch File Renamer</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Add Prefix
                </label>
                <input
                  type="text"
                  value={batchPrefix}
                  onChange={(e) => setBatchPrefix(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Add Suffix
                </label>
                <input
                  type="text"
                  value={batchSuffix}
                  onChange={(e) => setBatchSuffix(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                List of Filenames (one per line)
              </label>
              <textarea
                value={batchSampleFiles}
                onChange={(e) => setBatchSampleFiles(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs"
              />
            </div>

            <button
              onClick={handleRunBatchRename}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Renamed Filenames</span>
            </button>
          </div>

          <div>
            {batchRenamedResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Renamed Filenames Output
                  </h4>
                  <button
                    onClick={() => handleCopy(batchRenamedResult)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy All'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  value={batchRenamedResult}
                  rows={8}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter filenames and prefix/suffix rules, then click "Generate Renamed Filenames".
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
