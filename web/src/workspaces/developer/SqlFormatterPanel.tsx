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
  CaseSensitive
} from 'lucide-react';
import { formatSql } from './devHelpers';

interface SqlFormatterPanelProps {
  initialValue?: string;
}

const SQL_PRESETS: Record<string, { label: string; sql: string }> = {
  'Analytics Query': {
    label: 'Multi-Table Analytics & Window Function',
    sql: `select u.id, u.email, u.company, count(distinct o.id) as order_count, coalesce(sum(o.amount), 0) as total_revenue, rank() over (partition by u.company order by sum(o.amount) desc) as company_rank from users u left join orders o on u.id = o.user_id and o.status = 'completed' where u.created_at >= '2026-01-01' and u.is_active = true group by u.id, u.email, u.company having count(distinct o.id) >= 3 order by total_revenue desc, order_count desc limit 50;`
  },
  'CTE Pipeline': {
    label: 'Common Table Expression (WITH)',
    sql: `with monthly_metrics as (select date_trunc('month', created_at) as month, count(*) as signups, sum(revenue) as gross_revenue from accounts where status = 'active' group by date_trunc('month', created_at)), ranked_months as (select month, signups, gross_revenue, lag(gross_revenue) over (order by month) as prev_month_revenue from monthly_metrics) select month, signups, gross_revenue, round(((gross_revenue - prev_month_revenue) / prev_month_revenue) * 100, 2) as mom_growth_pct from ranked_months order by month desc;`
  },
  'DDL Schema': {
    label: 'DDL Schema & Foreign Keys',
    sql: `create table customers (id uuid default gen_random_uuid() primary key, organization_id uuid not null references organizations(id) on delete cascade, email varchar(255) not null unique, full_name varchar(120), account_tier varchar(32) default 'developer' not null, is_enterprise boolean default false not null, metadata jsonb default '{}'::jsonb, created_at timestamptz default now() not null, updated_at timestamptz default now() not null);`
  },
  'Postgres Upsert': {
    label: 'Postgres ON CONFLICT Upsert',
    sql: `insert into user_settings (user_id, dark_mode, offline_first, telemetry_enabled, updated_at) values ('usr_99f2b87c', true, true, false, now()) on conflict (user_id) do update set dark_mode = excluded.dark_mode, offline_first = excluded.offline_first, telemetry_enabled = excluded.telemetry_enabled, updated_at = now() returning *;`
  }
};

export const SqlFormatterPanel: React.FC<SqlFormatterPanelProps> = ({
  initialValue
}) => {
  const [sqlInput, setSqlInput] = useState<string>(
    initialValue || SQL_PRESETS['Analytics Query'].sql
  );
  const [indentSize, setIndentSize] = useState<2 | 4 | 'tab'>(2);
  const [keywordCase, setKeywordCase] = useState<'upper' | 'lower' | 'preserve'>('upper');
  const [commaPosition, setCommaPosition] = useState<'trailing' | 'leading'>('trailing');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formatted output
  const formattedSql = useMemo(() => {
    if (!sqlInput.trim()) return '';
    try {
      return formatSql(sqlInput, {
        indent: indentSize,
        keywordCase,
        commaPosition
      });
    } catch (err: any) {
      return `-- Error formatting SQL: ${err?.message || 'Syntax error'}\n${sqlInput}`;
    }
  }, [sqlInput, indentSize, keywordCase, commaPosition]);

  // Telemetry metrics
  const telemetry = useMemo(() => {
    const rawBytes = new Blob([sqlInput]).size;
    const formattedBytes = new Blob([formattedSql]).size;
    const deltaBytes = formattedBytes - rawBytes;
    const deltaPercent = rawBytes > 0 ? ((deltaBytes / rawBytes) * 100).toFixed(1) : '0';
    const clauseCount = (formattedSql.match(/\b(SELECT|FROM|WHERE|JOIN|GROUP BY|ORDER BY|LIMIT|INSERT|UPDATE|DELETE|WITH)\b/gi) || []).length;
    const lineCount = formattedSql ? formattedSql.split('\n').length : 0;

    return {
      rawBytes,
      formattedBytes,
      deltaBytes,
      deltaPercent,
      clauseCount,
      lineCount
    };
  }, [sqlInput, formattedSql]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedSql], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-formatted.sql';
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
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              SQL Formatter & Beautifier
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-clause hierarchy alignment, keyword case transformation, comma positioning & DDL/DML formatting.
            </p>
          </div>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-2 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs font-bold text-cyan-900 dark:text-cyan-200">
            {telemetry.clauseCount} SQL Clauses
          </span>
          <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono">
            ({telemetry.lineCount} lines)
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Templates:
        </span>
        {Object.entries(SQL_PRESETS).map(([key, item]) => (
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
        {/* Left Column: Raw SQL Editor */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Source SQL Query
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.rawBytes.toLocaleString()} B)
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
              placeholder="Paste raw, unformatted, or single-line SQL queries here..."
              rows={18}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Beautified SQL Output */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Header Controls */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Beautified SQL
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({telemetry.formattedBytes.toLocaleString()} B · {telemetry.lineCount} lines)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Indent Options */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setIndentSize(2)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 2
                      ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  2s
                </button>
                <button
                  onClick={() => setIndentSize(4)}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 4
                      ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  4s
                </button>
                <button
                  onClick={() => setIndentSize('tab')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    indentSize === 'tab'
                      ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Tab
                </button>
              </div>

              {/* Keyword Casing */}
              <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  onClick={() => setKeywordCase('upper')}
                  className={`px-2 py-0.5 rounded-md transition-all ${
                    keywordCase === 'upper'
                      ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
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
                      ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                  title="lowercase keywords"
                >
                  lower
                </button>
              </div>

              {/* Comma Placement */}
              <button
                onClick={() => setCommaPosition(commaPosition === 'trailing' ? 'leading' : 'trailing')}
                className={`text-[11px] px-2 py-1 rounded-lg border font-medium transition-colors ${
                  commaPosition === 'leading'
                    ? 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                }`}
                title="Toggle leading commas (, col) vs trailing commas (col,)"
              >
                {commaPosition === 'leading' ? ', Leading' : 'Trailing ,'}
              </button>

              <button
                onClick={() => handleCopy(formattedSql)}
                title="Copy Formatted SQL"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                title="Download .sql file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col">
            <textarea
              readOnly
              value={formattedSql}
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
          <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center shrink-0">
            <CheckCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Hierarchical Clause Structuring</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Major clauses (SELECT, FROM, WHERE, GROUP BY, ORDER BY) align cleanly with indented expressions.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CaseSensitive className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Configurable Keyword Casing</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              1-click toggle between standard UPPERCASE, lowercase, and preserved casing across 40+ SQL keywords.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Leading vs Trailing Commas</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Toggle between classic trailing commas (col,) and modern leading commas (, col) to fit team conventions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
