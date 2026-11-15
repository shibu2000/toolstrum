import React, { useState, useMemo } from 'react';
import {
  Database,
  Copy,
  Check,
  Download,
  RefreshCw,
  Layers,
  Sparkles,
  Settings,
  FileCode,
} from 'lucide-react';

const SAMPLE_CSV = `id, name, email, role, balance, is_active, created_at
1, "Alice Montgomery", alice@toolstrum.app, admin, 1420.50, true, 2024-01-15T08:00:00Z
2, "Bob O'Reilly", bob@toolstrum.app, editor, 350.00, true, 2024-02-20T11:30:00Z
3, "Charlie Davis", charlie@toolstrum.app, viewer, 0.00, false, 2024-03-01T14:15:00Z
4, "Diana Prince", diana@toolstrum.app, admin, 9850.75, true, 2024-04-10T19:45:00Z`;

export const SqlInsertGeneratorPanel: React.FC = () => {
  const [tableName, setTableName] = useState<string>('users');
  const [rawInput, setRawInput] = useState<string>(SAMPLE_CSV);
  const [dialect, setDialect] = useState<'postgres' | 'mysql' | 'sqlite' | 'sqlserver'>('postgres');
  const [conflictMode, setConflictMode] = useState<'none' | 'ignore' | 'update'>('none');
  const [batchChunkSize, setBatchChunkSize] = useState<number>(50);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleDownloadSql = (content: string) => {
    const blob = new Blob([content], { type: 'text/sql;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName || 'insert'}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Safe SQL Value Formatter
  const formatSqlValue = (val: string): string => {
    const trimmed = val.trim();
    if (!trimmed || trimmed.toLowerCase() === 'null') return 'NULL';
    if (trimmed.toLowerCase() === 'true') return 'TRUE';
    if (trimmed.toLowerCase() === 'false') return 'FALSE';
    // Numeric check
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return trimmed;

    // Remove wrapping quotes if present
    const unquoted = trimmed.replace(/^["']|["']$/g, '');
    // Escape single quotes for SQL: ' -> ''
    const escaped = unquoted.replace(/'/g, "''");
    return `'${escaped}'`;
  };

  // Generated SQL Statement
  const generatedSql = useMemo(() => {
    const lines = rawInput.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return '-- Please provide input rows.';

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1);

    if (rows.length === 0) return '-- Provide at least one data row beneath headers.';

    // Parse each row
    const parsedRows = rows.map((line) => {
      // Regex CSV splitter that respects quoted commas
      const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      return matches.map((m) => formatSqlValue(m));
    });

    const colList = headers.map((h) => (dialect === 'mysql' ? `\`${h}\`` : `"${h}"`)).join(', ');
    const tbl = dialect === 'mysql' ? `\`${tableName}\`` : `"${tableName}"`;

    let prefix = `INSERT INTO ${tbl} (${colList})\nVALUES\n`;
    if (dialect === 'mysql' && conflictMode === 'ignore') {
      prefix = `INSERT IGNORE INTO ${tbl} (${colList})\nVALUES\n`;
    } else if (dialect === 'sqlite' && conflictMode === 'ignore') {
      prefix = `INSERT OR IGNORE INTO ${tbl} (${colList})\nVALUES\n`;
    }

    const valueTuples = parsedRows.map((r) => `  (${r.join(', ')})`).join(',\n');
    let suffix = ';';

    if (conflictMode === 'ignore' && dialect === 'postgres') {
      suffix = '\nON CONFLICT DO NOTHING;';
    } else if (conflictMode === 'update' && dialect === 'postgres') {
      const primaryCol = headers[0] || 'id';
      const updateSets = headers
        .slice(1)
        .map((h) => `  "${h}" = EXCLUDED."${h}"`)
        .join(',\n');
      suffix = `\nON CONFLICT ("${primaryCol}") DO UPDATE SET\n${updateSets};`;
    } else if (conflictMode === 'update' && dialect === 'mysql') {
      const updateSets = headers
        .slice(1)
        .map((h) => `  \`${h}\` = VALUES(\`${h}\`)`)
        .join(',\n');
      suffix = `\nON DUPLICATE KEY UPDATE\n${updateSets};`;
    }

    return `${prefix}${valueTuples}${suffix}`;
  }, [rawInput, tableName, dialect, conflictMode]);

  return (
    <div className="space-y-6">
      {/* Configuration Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              SQL INSERT Generator & Exporter
            </h3>
          </div>
          <button
            onClick={() => setRawInput(SAMPLE_CSV)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Sample Data</span>
          </button>
        </div>

        {/* Settings Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Table Name
            </label>
            <input
              type="text"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              SQL Dialect
            </label>
            <select
              value={dialect}
              onChange={(e) => setDialect(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="postgres">PostgreSQL</option>
              <option value="mysql">MySQL / MariaDB</option>
              <option value="sqlite">SQLite</option>
              <option value="sqlserver">Microsoft SQL Server</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              Conflict Strategy
            </label>
            <select
              value={conflictMode}
              onChange={(e) => setConflictMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            >
              <option value="none">Standard INSERT</option>
              <option value="ignore">Ignore on Conflict / Duplicate</option>
              <option value="update">Upsert / Update on Conflict</option>
            </select>
          </div>
        </div>
      </div>

      {/* Editor & Generated Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Data Input */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              CSV / Delimited Data (First row is columns)
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {rawInput.split('\n').filter(Boolean).length} rows
            </span>
          </div>
          <textarea
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            rows={15}
            className="w-full p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            placeholder="col1, col2, col3&#10;val1, val2, val3"
          />
        </div>

        {/* Right Column: Generated SQL Output */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Generated SQL Statement
            </label>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(generatedSql, 'sql')}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                {copiedKey === 'sql' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy SQL</span>
              </button>
              <button
                onClick={() => handleDownloadSql(generatedSql)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Download .sql file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[360px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <pre className="p-4 h-full font-mono text-xs text-sky-600 dark:text-sky-400 whitespace-pre-wrap overflow-y-auto">
              {generatedSql}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
