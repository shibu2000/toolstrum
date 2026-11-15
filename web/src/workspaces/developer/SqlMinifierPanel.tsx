import React, { useState, useMemo, useRef } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Sparkles,
  Layers,
  Code2,
  Sliders,
  CheckCheck,
  Zap,
  Database,
  ArrowRight,
  TrendingDown,
  ShieldCheck,
  Binary
} from 'lucide-react';
import { minifySql } from './devHelpers';

interface SqlMinifierPanelProps {
  initialValue?: string;
}

type ExportFormat = 'raw' | 'javascript' | 'python' | 'json' | 'base64';

const SQL_MINIFY_PRESETS: Record<string, { label: string; sql: string }> = {
  'Analytics Query': {
    label: 'Multi-Line Analytics & Comments',
    sql: `-- Query: Monthly active customers and revenue
-- Author: Data Engineering Team
/* 
   Calculate 30-day trailing revenue per organization 
   with window rankings and customer attribution.
*/
SELECT 
    org.id AS organization_id,
    org.name AS organization_name,
    COUNT(DISTINCT u.id) AS active_users,
    SUM(inv.total_amount) AS gross_revenue,
    AVG(inv.total_amount) AS avg_deal_size,
    /* Rank within industry tier */
    RANK() OVER (
        PARTITION BY org.tier 
        ORDER BY SUM(inv.total_amount) DESC
    ) AS revenue_rank
FROM organizations org
    -- Join active team members
    INNER JOIN users u 
        ON org.id = u.org_id 
        AND u.is_active = true
    -- Join paid invoices in 2026
    LEFT JOIN invoices inv 
        ON org.id = inv.org_id 
        AND inv.status = 'paid'
        AND inv.created_at >= '2026-01-01'
WHERE org.status = 'active'
    AND org.deleted_at IS NULL
GROUP BY 
    org.id, 
    org.name, 
    org.tier
HAVING COUNT(DISTINCT u.id) >= 5
ORDER BY 
    gross_revenue DESC, 
    active_users DESC
LIMIT 100;`
  },
  'Postgres CTE Upsert': {
    label: 'CTE Pipeline & Upsert',
    sql: `-- Materialize rolling metrics pipeline
WITH ranked_events AS (
    SELECT 
        user_id,
        event_name,
        created_at,
        ROW_NUMBER() OVER (
            PARTITION BY user_id 
            ORDER BY created_at DESC
        ) AS rn
    FROM user_audit_logs
    WHERE created_at >= NOW() - INTERVAL '7 days'
)
-- Upsert most recent session telemetry
INSERT INTO user_session_rollups (user_id, last_event, last_seen_at, updated_at)
SELECT 
    user_id, 
    event_name, 
    created_at, 
    NOW()
FROM ranked_events
WHERE rn = 1
ON CONFLICT (user_id) 
DO UPDATE SET 
    last_event = EXCLUDED.last_event,
    last_seen_at = EXCLUDED.last_seen_at,
    updated_at = NOW()
RETURNING *;`
  },
  'DDL Schema': {
    label: 'Table Schema & Index DDL',
    sql: `-- Master Accounts Table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_number VARCHAR(64) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_verified BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMPTZ DEFAULT clock_timestamp() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT clock_timestamp() NOT NULL
);

-- Partial index for high-velocity queries
CREATE INDEX IF NOT EXISTS idx_accounts_active_verified 
    ON accounts (company_name, created_at DESC) 
    WHERE is_verified = true;`
  }
};

export const SqlMinifierPanel: React.FC<SqlMinifierPanelProps> = ({
  initialValue
}) => {
  const [sqlInput, setSqlInput] = useState<string>(
    initialValue || SQL_MINIFY_PRESETS['Analytics Query'].sql
  );
  const [stripComments, setStripComments] = useState<boolean>(true);
  const [tightPunctuation, setTightPunctuation] = useState<boolean>(false);
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [exportFormat, setExportFormat] = useState<ExportFormat>('raw');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute raw minified SQL
  const minifiedSql = useMemo(() => {
    if (!sqlInput.trim()) return '';
    try {
      return minifySql(sqlInput, {
        stripComments,
        tightPunctuation,
        keywordCase
      });
    } catch (err: any) {
      return `-- Minification error: ${err?.message || 'Syntax error'}\n${sqlInput}`;
    }
  }, [sqlInput, stripComments, tightPunctuation, keywordCase]);

  // Compute final output based on selected export format
  const formattedOutput = useMemo(() => {
    if (!minifiedSql) return '';
    switch (exportFormat) {
      case 'javascript':
        return `// JavaScript / TypeScript SQL String\nexport const query = \`${minifiedSql.replace(/`/g, '\\`')}\`;\n`;
      case 'python':
        return `# Python Raw SQL Query\nQUERY = r"""${minifiedSql}"""\n`;
      case 'json':
        return JSON.stringify({ query: minifiedSql }, null, 2);
      case 'base64':
        try {
          return btoa(unescape(encodeURIComponent(minifiedSql)));
        } catch {
          return minifiedSql;
        }
      case 'raw':
      default:
        return minifiedSql;
    }
  }, [minifiedSql, exportFormat]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([sqlInput]).size;
    const minifiedBytes = new Blob([minifiedSql]).size;
    const deltaBytes = Math.max(0, rawBytes - minifiedBytes);
    const deltaPercent = rawBytes > 0 ? ((deltaBytes / rawBytes) * 100).toFixed(1) : '0';
    // Conservative Gzip entropy estimate
    const estimatedGzip = Math.round(minifiedBytes * 0.42);

    const commentsFound = (sqlInput.match(/(--[^\r\n]*|\/\*[\s\S]*?\*\/)/g) || []).length;
    const rawLines = sqlInput ? sqlInput.split('\n').length : 0;
    const minifiedLines = minifiedSql ? minifiedSql.split('\n').length : 0;

    return {
      rawBytes,
      minifiedBytes,
      deltaBytes,
      deltaPercent,
      estimatedGzip,
      commentsFound,
      rawLines,
      minifiedLines
    };
  }, [sqlInput, minifiedSql]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === 'javascript' ? 'ts' : exportFormat === 'python' ? 'py' : exportFormat === 'json' ? 'json' : 'sql';
    const blob = new Blob([formattedOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum-minified.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSqlInput(text);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              SQL Minifier & Compression Cruncher
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aggressive comment stripping, whitespace compression, operator compaction, and multi-language exports.
            </p>
          </div>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-3 bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs font-bold text-sky-900 dark:text-sky-200">
            <TrendingDown className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>-{telemetry.deltaPercent}% ({telemetry.deltaBytes} B saved)</span>
          </div>
          <span className="text-[11px] text-sky-600 dark:text-sky-400 font-mono">
            ~{telemetry.estimatedGzip} B Gzip
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(SQL_MINIFY_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setSqlInput(item.sql)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Raw Multi-Line SQL Editor */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-sky-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source Multi-Line SQL
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.rawBytes.toLocaleString()} B · {telemetry.rawLines} lines)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload SQL file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".sql,.psql,.dql,.ddl,text/sql"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => handleCopy(sqlInput)}
                title="Copy Source"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setSqlInput('')}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              placeholder="Paste formatted, multi-line, or commented SQL queries here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Minified SQL Output */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Minified SQL
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.minifiedBytes.toLocaleString()} B · {telemetry.minifiedLines} {telemetry.minifiedLines === 1 ? 'line' : 'lines'})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Strip Comments Toggle */}
              <button
                onClick={() => setStripComments(!stripComments)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                  stripComments
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title="Strip line (--) and block (/* */) comments"
              >
                Strip Comments
              </button>

              {/* Tight Punctuation Toggle */}
              <button
                onClick={() => setTightPunctuation(!tightPunctuation)}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                  tightPunctuation
                    ? 'bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title="Remove spaces around commas, parentheses, and operators"
              >
                Tight Syntax
              </button>

              {/* Keyword Casing */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setKeywordCase('upper')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    keywordCase === 'upper'
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="UPPERCASE keywords"
                >
                  UPPER
                </button>
                <button
                  onClick={() => setKeywordCase('lower')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    keywordCase === 'lower'
                      ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="lowercase keywords"
                >
                  lower
                </button>
              </div>

              {/* Export Format Selector */}
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
              >
                <option value="raw">Raw SQL</option>
                <option value="javascript">JS/TS (`...`)</option>
                <option value="python">Python ("""...""")</option>
                <option value="json">JSON Object</option>
                <option value="base64">Base64</option>
              </select>

              <button
                onClick={() => handleCopy(formattedOutput)}
                title="Copy Output"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                title="Download file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              readOnly
              value={formattedOutput}
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-0 resize-y select-all"
            />
          </div>
        </div>
      </div>

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Protected String Literals</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Internal text literals, quoted identifiers, and embedded quotes are safely shielded during comment stripping.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tight Operator Compaction</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Optionally collapses excess whitespace around commas, parens, and operators for embedded micro-payloads.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Binary className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Multi-Language Code Wrappers</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              1-click export to JS/TS template literals, Python raw strings, JSON payloads, and Base64 wire formats.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};