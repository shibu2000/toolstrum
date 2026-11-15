import React, { useState } from 'react';
import {
  GitCompare,
  FileSpreadsheet,
  BarChart2,
  Table,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import {
  computeDetailedTextDiff,
  generateSpreadsheetFormula,
  generateCsvBarChart,
  cleanTabularData,
  DetailedDiffResult,
} from './advancedHelpers';

interface ToolProps {
  toolId: number;
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const DataFormulasDiffPanel: React.FC<ToolProps> = ({ toolId, onCopy }) => {
  // 474: Text Diff
  const [textA, setTextA] = useState('Apple\nBanana\nCherry\nDate');
  const [textB, setTextB] = useState('Apple\nBlueberry\nCherry\nDate\nElderberry');
  const [diffResult, setDiffResult] = useState<DetailedDiffResult>(() =>
    computeDetailedTextDiff('Apple\nBanana\nCherry\nDate', 'Apple\nBlueberry\nCherry\nDate\nElderberry')
  );

  const handleRunDiff = () => {
    setDiffResult(computeDetailedTextDiff(textA, textB));
  };

  // 475, 476: Formula Helper & Generator
  const [formulaQuery, setFormulaQuery] = useState('how to xlookup an employee name');
  const formulaResult = React.useMemo(() => generateSpreadsheetFormula(formulaQuery), [formulaQuery]);

  // 477: CSV Chart Generator
  const [csvInput, setCsvInput] = useState('Month, Revenue\nJan, 1200\nFeb, 1850\nMar, 2400\nApr, 2100\nMay, 3100');
  const chartData = React.useMemo(() => generateCsvBarChart(csvInput), [csvInput]);

  // 478: Data Cleaning Assistant
  const [dirtyText, setDirtyText] = useState('Apple\nBanana\nApple\n  Orange  \n\nBanana\nGrape');
  const cleanedData = React.useMemo(() => cleanTabularData(dirtyText), [dirtyText]);

  // 479: Table Extractor
  const [tableInput, setTableInput] = useState(
    '| ID | Product | Price |\n|---|---|---|\n| 1 | Wireless Mouse | $25 |\n| 2 | Mechanical Keyboard | $80 |\n| 3 | USB-C Hub | $45 |'
  );

  const extractedRows = React.useMemo(() => {
    const lines = tableInput.split('\n').map((l) => l.trim()).filter(Boolean);
    const rows: string[][] = [];
    for (const l of lines) {
      if (l.includes('|')) {
        const parts = l.split('|').map((p) => p.trim()).filter(Boolean);
        if (parts.length > 0 && !parts[0].includes('---')) {
          rows.push(parts);
        }
      }
    }
    return rows;
  }, [tableInput]);

  return (
    <div className="space-y-6">
      {/* 474: TEXT DIFF WITH HIGHLIGHTS */}
      {toolId === 474 && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Original Text (Version A)
              </label>
              <textarea
                rows={8}
                value={textA}
                onChange={(e) => setTextA(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                Modified Text (Version B)
              </label>
              <textarea
                rows={8}
                value={textB}
                onChange={(e) => setTextB(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleRunDiff}
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <GitCompare className="w-4 h-4" />
              Recompute Detailed Diff
            </button>
            <div className="flex gap-3 text-xs font-mono">
              <span className="text-emerald-600 font-bold">+{diffResult.additions} added</span>
              <span className="text-rose-600 font-bold">-{diffResult.deletions} removed</span>
              <span className="text-slate-400">{diffResult.similarityRatio}% similarity</span>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Visual Unified Diff Highlights
            </span>
            <div className="max-h-80 overflow-y-auto space-y-1 font-mono text-xs p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              {diffResult.lines.map((l, idx) => (
                <div
                  key={idx}
                  className={`px-2 py-0.5 rounded ${
                    l.type === 'added'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                      : l.type === 'removed'
                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 475 & 476: SPREADSHEET FORMULA HELPER & GENERATOR */}
      {(toolId === 475 || toolId === 476) && (
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FileSpreadsheet className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Natural Language Spreadsheet Formula Generator
              </h3>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Describe What You Want to Calculate in Excel / Google Sheets
              </label>
              <input
                type="text"
                value={formulaQuery}
                onChange={(e) => setFormulaQuery(e.target.value)}
                placeholder="e.g. sum revenue if status is active, or xlookup employee..."
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] text-slate-400 mr-1 self-center">Try:</span>
              {['xlookup', 'sumifs criteria', 'countifs active', 'averageifs', 'index match'].map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setFormulaQuery(q)}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium hover:bg-purple-50 hover:text-purple-600 transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">
                Generated Formula
              </span>
              <button
                type="button"
                onClick={() => onCopy && onCopy(formulaResult.formula)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 font-bold text-xs"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Formula
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 font-mono text-sm font-bold text-purple-900 dark:text-purple-200 break-all">
              {formulaResult.formula}
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block font-semibold">Explanation:</span>
                <p className="text-slate-800 dark:text-slate-200 mt-0.5">{formulaResult.explanation}</p>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Syntax Structure:</span>
                <div className="font-mono text-slate-600 dark:text-slate-400 mt-0.5">{formulaResult.syntax}</div>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Practical Example:</span>
                <div className="font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{formulaResult.example}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 477: CSV CHART GENERATOR */}
      {toolId === 477 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <BarChart2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Raw CSV Data</h3>
            </div>
            <textarea
              rows={10}
              value={csvInput}
              onChange={(e) => setCsvInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Rendered Responsive Bar Chart
            </span>

            <div className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs whitespace-pre overflow-x-auto">
              {chartData.chartAscii}
            </div>

            <div className="space-y-2 pt-2">
              {chartData.rows.map((r, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{r.label}</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{r.value}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 rounded-full transition-all"
                      style={{ width: `${chartData.maxVal > 0 ? (r.value / chartData.maxVal) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 478: DATA CLEANING ASSISTANT */}
      {toolId === 478 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unclean Raw Data</h3>
            <textarea
              rows={10}
              value={dirtyText}
              onChange={(e) => setDirtyText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sanitized Clean Output</h3>
              <button
                type="button"
                onClick={() => onCopy && onCopy(cleanedData.cleanedText)}
                className="text-xs text-purple-600 font-bold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Clean Data
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Duplicates Purged</span>
                <span className="font-bold text-rose-500 font-mono text-base">{cleanedData.duplicatesRemoved}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Empty Stripped</span>
                <span className="font-bold text-amber-500 font-mono text-base">{cleanedData.emptyLinesRemoved}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="text-slate-400 block text-[10px]">Clean Rows</span>
                <span className="font-bold text-emerald-500 font-mono text-base">{cleanedData.cleanedLines}</span>
              </div>
            </div>

            <textarea
              rows={7}
              readOnly
              value={cleanedData.cleanedText}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {/* 479: TABLE EXTRACTOR */}
      {toolId === 479 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Table className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Markdown / Delimited Table Input
              </h3>
            </div>
            <textarea
              rows={10}
              value={tableInput}
              onChange={(e) => setTableInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Extracted Matrix Grid ({extractedRows.length} rows)
            </span>

            <div className="overflow-x-auto max-h-80">
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <tbody>
                  {extractedRows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={
                        rIdx === 0
                          ? 'bg-purple-50 dark:bg-purple-950/40 font-bold text-purple-900 dark:text-purple-200'
                          : 'border-t border-slate-100 dark:border-slate-800'
                      }
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="p-2.5">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
