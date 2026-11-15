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
  CheckCheck,
  Zap,
  Database,
  Search,
  AlertTriangle,
  Info,
  Lightbulb,
  ArrowRight,
  Workflow,
  Cpu,
  TableProperties,
  SlidersHorizontal,
  Gauge
} from 'lucide-react';
import { explainSql, SqlExplanation } from './devHelpers';

interface SqlQueryExplainerPanelProps {
  initialValue?: string;
}

const SQL_EXPLAIN_PRESETS: Record<string, { label: string; sql: string }> = {
  'Analytics Query': {
    label: 'Multi-Table Analytics & Window Ranking',
    sql: `SELECT 
    org.id AS organization_id,
    org.name AS organization_name,
    COUNT(DISTINCT u.id) AS active_users,
    SUM(inv.total_amount) AS gross_revenue,
    AVG(inv.total_amount) AS avg_deal_size,
    RANK() OVER (PARTITION BY org.tier ORDER BY SUM(inv.total_amount) DESC) AS tier_rank
FROM organizations org
INNER JOIN users u ON org.id = u.org_id AND u.is_active = true
LEFT JOIN invoices inv ON org.id = inv.org_id AND inv.status = 'paid'
WHERE org.status = 'active'
    AND org.country IN ('US', 'CA', 'GB')
    AND inv.created_at >= '2026-01-01'
GROUP BY org.id, org.name, org.tier
HAVING COUNT(DISTINCT u.id) >= 5
ORDER BY gross_revenue DESC
LIMIT 50;`
  },
  'Slow Query Anti-Pattern': {
    label: 'Slow Query Anti-Patterns (Leading Wildcard & SELECT *)',
    sql: `SELECT *
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE c.email LIKE '%gmail.com'
    AND LOWER(c.company_name) = 'acme'
    AND o.created_at >= '2026-01-01';`
  },
  'CTE Pipeline': {
    label: 'Materialized CTE Pipeline (WITH)',
    sql: `WITH user_daily_activity AS (
    SELECT 
        user_id,
        date_trunc('day', event_time) AS event_date,
        COUNT(*) AS total_actions
    FROM audit_logs
    WHERE event_time >= NOW() - INTERVAL '30 days'
    GROUP BY user_id, date_trunc('day', event_time)
),
active_users AS (
    SELECT 
        user_id,
        SUM(total_actions) AS monthly_actions
    FROM user_daily_activity
    GROUP BY user_id
    HAVING SUM(total_actions) > 100
)
SELECT u.email, u.created_at, au.monthly_actions
FROM users u
INNER JOIN active_users au ON u.id = au.user_id
ORDER BY au.monthly_actions DESC
LIMIT 100;`
  },
  'Fast OLTP Lookup': {
    label: 'High-Performance Keyed Lookup',
    sql: `SELECT id, email, full_name, account_status, last_login_at
FROM users
WHERE id = 'usr_99f2b87c'
    AND is_active = true
LIMIT 1;`
  }
};

type AnalysisTab = 'ast' | 'optimization' | 'pipeline' | 'clauses';

export const SqlQueryExplainerPanel: React.FC<SqlQueryExplainerPanelProps> = ({
  initialValue
}) => {
  const [sqlInput, setSqlInput] = useState<string>(
    initialValue || SQL_EXPLAIN_PRESETS['Analytics Query'].sql
  );
  const [activeTab, setActiveTab] = useState<AnalysisTab>('ast');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compute offline AST explanation
  const explanation: SqlExplanation = useMemo(() => {
    if (!sqlInput.trim()) {
      return explainSql('SELECT 1;');
    }
    try {
      return explainSql(sqlInput);
    } catch {
      return explainSql('SELECT 1;');
    }
  }, [sqlInput]);

  // Markdown Report generation
  const markdownReport = useMemo(() => {
    let md = `# Toolstrum SQL Query Execution & Cost Analysis\n\n`;
    md += `**Operation Type:** ${explanation.type}\n`;
    md += `**Complexity Score:** ${explanation.complexityScore}/10 (${explanation.costRating})\n`;
    md += `**Tables Involved:** ${explanation.tables.join(', ') || 'None'}\n\n`;

    md += `## Summary\n${explanation.summary}\n\n`;

    if (explanation.columns.length > 0) {
      md += `## Projected Columns (${explanation.columns.length})\n`;
      explanation.columns.forEach((c) => {
        md += `- \`${c}\`\n`;
      });
      md += `\n`;
    }

    if (explanation.joins.length > 0) {
      md += `## Joins (${explanation.joins.length})\n`;
      explanation.joins.forEach((j) => {
        md += `- ${j}\n`;
      });
      md += `\n`;
    }

    if (explanation.filters.length > 0) {
      md += `## Filter Predicates (${explanation.filters.length})\n`;
      explanation.filters.forEach((f) => {
        md += `- \`${f}\`\n`;
      });
      md += `\n`;
    }

    if (explanation.recommendations.length > 0) {
      md += `## Performance & Index Recommendations\n`;
      explanation.recommendations.forEach((r) => {
        md += `- **[${r.type.toUpperCase()}] ${r.title}**: ${r.message}\n`;
      });
      md += `\n`;
    }

    if (explanation.executionPlan.length > 0) {
      md += `## Simulated Execution Pipeline\n`;
      explanation.executionPlan.forEach((s) => {
        md += `${s.step}. **${s.operation}**: ${s.description}\n`;
      });
      md += `\n`;
    }

    return md;
  }, [explanation]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([markdownReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-sql-analysis-report.md';
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

  const getCostBadgeColor = (rating: string) => {
    switch (rating) {
      case 'Low':
        return 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Moderate':
        return 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      case 'High':
        return 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'Critical':
      default:
        return 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              SQL Query Explainer & Cost Analyzer
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              AST decomposition, execution simulation, index recommendations, and query cost scoring.
            </p>
          </div>
        </div>

        {/* Complexity & Cost Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 text-xs font-bold ${getCostBadgeColor(explanation.costRating)}`}>
            <Gauge className="w-4 h-4" />
            <span>Score: {explanation.complexityScore}/10 ({explanation.costRating} Cost)</span>
          </div>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Examples:
        </span>
        {Object.entries(SQL_EXPLAIN_PRESETS).map(([key, item]) => (
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
        {/* Left Column: SQL Query Input */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-violet-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                SQL Query Statement
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({explanation.type})
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
              placeholder="Paste SQL query statement here to analyze structure and cost..."
              rows={19}
              spellCheck={false}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-violet-500/20 resize-y"
            />
          </div>
        </div>

        {/* Right Column: Interactive Analysis Inspector */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Tabs Header */}
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setActiveTab('ast')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'ast'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <TableProperties className="w-3.5 h-3.5" />
                Structure
              </button>
              <button
                onClick={() => setActiveTab('optimization')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'optimization'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                Advisor ({explanation.recommendations.length})
              </button>
              <button
                onClick={() => setActiveTab('pipeline')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'pipeline'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Workflow className="w-3.5 h-3.5 text-sky-500" />
                Pipeline
              </button>
              <button
                onClick={() => setActiveTab('clauses')}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'clauses'
                    ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Clauses ({explanation.clauses.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleCopy(markdownReport)}
                title="Copy Markdown Analysis Report"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownloadReport}
                title="Download Analysis Report (.md)"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[520px] space-y-4">
            {/* TAB 1: AST STRUCTURE */}
            {activeTab === 'ast' && (
              <div className="space-y-4">
                {/* Summary Box */}
                <div className="p-3.5 rounded-xl bg-violet-50/70 dark:bg-violet-950/30 border border-violet-200/80 dark:border-violet-900/40">
                  <h4 className="text-xs font-bold text-violet-900 dark:text-violet-200 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                    Query Overview
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {explanation.summary}
                  </p>
                </div>

                {/* Tables & Joins Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                      Target Tables ({explanation.tables.length})
                    </span>
                    {explanation.tables.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {explanation.tables.map((tbl, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md font-mono bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 font-semibold"
                          >
                            {tbl}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">None detected</span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5">
                    <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                      Pagination & Bounds
                    </span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">
                      {explanation.limit}
                    </span>
                  </div>
                </div>

                {/* Joins */}
                {explanation.joins.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                      Relational Joins ({explanation.joins.length})
                    </span>
                    <div className="space-y-1.5">
                      {explanation.joins.map((j, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200"
                        >
                          {j}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter Predicates */}
                {explanation.filters.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                      WHERE Boolean Predicates ({explanation.filters.length})
                    </span>
                    <div className="space-y-1.5">
                      {explanation.filters.map((f, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projected Columns */}
                {explanation.columns.length > 0 && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                      Projected Attributes / Expressions ({explanation.columns.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {explanation.columns.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 rounded-lg font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grouping & Sorting */}
                {(explanation.grouping.length > 0 || explanation.sorting.length > 0) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {explanation.grouping.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                          Group By Keys
                        </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {explanation.grouping.join(', ')}
                        </span>
                      </div>
                    )}
                    {explanation.sorting.length > 0 && (
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                        <span className="font-bold text-[10px] uppercase text-slate-500 tracking-wider block">
                          Order By Criteria
                        </span>
                        <span className="font-mono text-slate-800 dark:text-slate-200">
                          {explanation.sorting.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: OPTIMIZATION ADVISOR */}
            {activeTab === 'optimization' && (
              <div className="space-y-3">
                {explanation.recommendations.length > 0 ? (
                  explanation.recommendations.map((rec, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        rec.type === 'warning'
                          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50'
                          : rec.type === 'tip'
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                          : 'bg-sky-50/60 dark:bg-sky-950/20 border-sky-200 dark:border-sky-900/50'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {rec.type === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        ) : rec.type === 'tip' ? (
                          <Lightbulb className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Info className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4
                          className={`text-xs font-bold ${
                            rec.type === 'warning'
                              ? 'text-amber-900 dark:text-amber-200'
                              : rec.type === 'tip'
                              ? 'text-emerald-900 dark:text-emerald-200'
                              : 'text-sky-900 dark:text-sky-200'
                          }`}
                        >
                          {rec.title}
                        </h4>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                          {rec.message}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <CheckCheck className="w-8 h-8 text-emerald-500 mx-auto" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Clean Query Profile</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No common indexing anti-patterns or wildcard performance issues detected.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: SIMULATED EXECUTION PIPELINE */}
            {activeTab === 'pipeline' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Simulated sequential execution flow representing typical relational database planner phases:
                </p>

                <div className="space-y-2.5">
                  {explanation.executionPlan.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5"
                    >
                      <div className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                            {step.operation}
                          </h4>
                          {step.target && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {step.target}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: CLAUSES BREAKDOWN */}
            {activeTab === 'clauses' && (
              <div className="space-y-2.5">
                {explanation.clauses.map((c, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                  >
                    <span className="px-2 py-1 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-mono text-xs font-bold shrink-0">
                      {c.clause}
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {c.explanation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Static AST Decomposition</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Zero-server offline parser extracts tables, join relations, projected columns, and filter predicates.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Proactive Index Advisor</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Detects leading wildcards in LIKE, SELECT * projections, function-wrapped columns, and unbounded queries.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Workflow className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Execution Plan Simulation</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Visualizes step-by-step query evaluation from sequential/index scan to joins, hashing, sorting, and projection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};