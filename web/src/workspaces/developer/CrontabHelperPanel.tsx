import React, { useState, useMemo } from 'react';
import {
  Clock,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Info,
  HelpCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import { parseCronExpression, CronParseResult } from './devHelpers';

interface PresetCron {
  label: string;
  category: string;
  expr: string;
  description: string;
}

const PRESET_CRONS: PresetCron[] = [
  { label: 'Every Minute', category: 'Frequent', expr: '* * * * *', description: 'Triggers continuously every 60 seconds' },
  { label: 'Every 5 Minutes', category: 'Frequent', expr: '*/5 * * * *', description: 'Triggers at :00, :05, :10, :15...' },
  { label: 'Every 15 Minutes', category: 'Frequent', expr: '*/15 * * * *', description: 'Quarter-hourly telemetry polling' },
  { label: 'Every 30 Minutes', category: 'Frequent', expr: '*/30 * * * *', description: 'Half-hourly sync jobs' },
  { label: 'Hourly (on the hour)', category: 'Hourly', expr: '0 * * * *', description: 'Triggers at minute 0 of every hour' },
  { label: 'Every 2 Hours', category: 'Hourly', expr: '0 */2 * * *', description: 'Triggers at 00:00, 02:00, 04:00...' },
  { label: 'Every 6 Hours', category: 'Hourly', expr: '0 */6 * * *', description: 'Four times daily database compaction' },
  { label: 'Daily at Midnight', category: 'Daily', expr: '0 0 * * *', description: 'Midnight batch cleanup (00:00)' },
  { label: 'Daily at 9:00 AM', category: 'Daily', expr: '0 9 * * *', description: 'Morning report generation' },
  { label: 'Weekdays at 9:00 AM', category: 'Weekly', expr: '0 9 * * 1-5', description: 'Monday through Friday morning alert' },
  { label: 'Weekends at Noon', category: 'Weekly', expr: '0 12 * * 0,6', description: 'Saturday and Sunday midday backup' },
  { label: 'Weekly on Sunday 00:00', category: 'Weekly', expr: '0 0 * * 0', description: 'Weekly ledger reconciliation' },
  { label: '1st of Every Month', category: 'Monthly', expr: '0 0 1 * *', description: 'Monthly billing cycle initialization' },
  { label: 'Quarterly on 1st', category: 'Yearly', expr: '0 0 1 1,4,7,10 *', description: 'Every 3 months quarterly audit' },
];

export const CrontabHelperPanel: React.FC = () => {
  const [expr, setExpr] = useState<string>('*/15 9-17 * * 1-5');
  const [activeBuilderTab, setActiveBuilderTab] = useState<'visual' | 'presets' | 'cheatsheet'>('presets');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const parsed: CronParseResult = useMemo(() => {
    return parseCronExpression(expr);
  }, [expr]);

  // Visual Field editing
  const updateField = (index: number, val: string) => {
    const parts = expr.trim().split(/\s+/);
    while (parts.length < 5) parts.push('*');
    parts[index] = val;
    setExpr(parts.join(' '));
  };

  const currentParts = useMemo(() => {
    const p = expr.trim().split(/\s+/);
    return [
      p[0] || '*',
      p[1] || '*',
      p[2] || '*',
      p[3] || '*',
      p[4] || '*',
    ];
  }, [expr]);

  return (
    <div className="space-y-6">
      {/* Expression Input & Live Human Translation Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-sky-500/10 via-indigo-500/10 to-blue-500/10 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Crontab Humanizer & Validator
              </span>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {parsed.valid ? parsed.description : 'Invalid Cron Syntax'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard(expr, 'expr')}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              {copiedKey === 'expr' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Expression</span>
            </button>
            <button
              onClick={() => copyToClipboard(parsed.description, 'desc')}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5"
            >
              {copiedKey === 'desc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Description</span>
            </button>
          </div>
        </div>

        {/* 5-Field Expression Bar */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
            Cron Expression (5 Fields: Minute Hour Day-of-Month Month Day-of-Week)
          </label>
          <div className="relative">
            <input
              type="text"
              value={expr}
              onChange={(e) => setExpr(e.target.value)}
              placeholder="* * * * *"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-base font-black tracking-wider text-sky-600 dark:text-sky-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
            {expr && (
              <button
                onClick={() => setExpr('* * * * *')}
                className="absolute right-3 top-3 px-2 py-0.5 rounded text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Reset to every minute"
              >
                Reset
              </button>
            )}
          </div>
          {parsed.error && (
            <p className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400">
              {parsed.error}
            </p>
          )}
        </div>

        {/* Interactive 5-Field Breakdown Chips */}
        <div className="grid grid-cols-5 gap-2 pt-1 text-center">
          {[
            { label: 'Minute', val: currentParts[0], range: '0-59', idx: 0 },
            { label: 'Hour', val: currentParts[1], range: '0-23', idx: 1 },
            { label: 'Day of Month', val: currentParts[2], range: '1-31', idx: 2 },
            { label: 'Month', val: currentParts[3], range: '1-12', idx: 3 },
            { label: 'Day of Week', val: currentParts[4], range: '0-6 (Sun-Sat)', idx: 4 },
          ].map((f) => (
            <div
              key={f.label}
              className="p-2.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 shadow-xs"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block truncate">
                {f.label}
              </span>
              <span className="font-mono text-sm font-black text-slate-900 dark:text-white block mt-0.5 truncate">
                {f.val}
              </span>
              <span className="text-[9px] text-slate-400 block mt-0.5">{f.range}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Builder, Presets & Cheatsheet */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <button
              onClick={() => setActiveBuilderTab('presets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeBuilderTab === 'presets'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Common Presets ({PRESET_CRONS.length})
            </button>
            <button
              onClick={() => setActiveBuilderTab('visual')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeBuilderTab === 'visual'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Field Builder
            </button>
            <button
              onClick={() => setActiveBuilderTab('cheatsheet')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeBuilderTab === 'cheatsheet'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Syntax Cheatsheet
            </button>
          </div>

          {activeBuilderTab === 'presets' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Click Any Preset to Load Immediately
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
                {PRESET_CRONS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setExpr(p.expr)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      expr === p.expr
                        ? 'bg-sky-500/10 border-sky-500 text-sky-900 dark:text-sky-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.label}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {p.category}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400 block mb-1">
                      {p.expr}
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {p.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeBuilderTab === 'visual' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Quick Adjust Fields
              </span>

              {/* Minutes Controls */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Minute (current: {currentParts[0]})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['*', '0', '*/5', '*/10', '*/15', '*/30', '0,30', '0,15,30,45'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField(0, opt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        currentParts[0] === opt
                          ? 'bg-sky-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hour Controls */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Hour (current: {currentParts[1]})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {['*', '0', '*/2', '*/4', '*/6', '*/12', '9-17', '0,12', '9', '18'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => updateField(1, opt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                        currentParts[1] === opt
                          ? 'bg-sky-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day of Week Controls */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>Day of Week (current: {currentParts[4]})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Every Day (*)', val: '*' },
                    { label: 'Mon-Fri (1-5)', val: '1-5' },
                    { label: 'Sat,Sun (0,6)', val: '0,6' },
                    { label: 'Monday (1)', val: '1' },
                    { label: 'Friday (5)', val: '5' },
                    { label: 'Sunday (0)', val: '0' },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => updateField(4, opt.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                        currentParts[4] === opt.val
                          ? 'bg-sky-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeBuilderTab === 'cheatsheet' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-400 block">
                Standard POSIX Special Characters
              </span>
              <div className="space-y-2">
                {[
                  { sym: '*', name: 'Wildcard', desc: 'Matches any allowed value in the field.' },
                  { sym: ',', name: 'Value List Divider', desc: 'Separates individual items (e.g. 1,3,5).' },
                  { sym: '-', name: 'Range Separator', desc: 'Specifies an inclusive range of values (e.g. 9-17).' },
                  { sym: '/', name: 'Step Values', desc: 'Specifies increments through a range (e.g. */15 or 0-23/2).' },
                  { sym: 'L', name: 'Last (Extended)', desc: 'Specifies the last day of the month or last Friday.' },
                  { sym: '#', name: 'Nth Day (Extended)', desc: 'Specifies the Nth weekday of the month (e.g. 5#3 for 3rd Friday).' },
                ].map((s) => (
                  <div key={s.sym} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-start gap-3">
                    <span className="px-2 py-0.5 rounded font-mono font-black text-sky-600 dark:text-sky-400 bg-sky-500/10 shrink-0">
                      {s.sym}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{s.name}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{s.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Projected Next 10 Runs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Next 10 Scheduled Runs
                </span>
              </div>
              {parsed.nextRuns.length > 0 && (
                <button
                  onClick={() =>
                    copyToClipboard(
                      parsed.nextRuns.map((r, i) => `${i + 1}. ${r.date} (${r.relative})`).join('\n'),
                      'all-runs'
                    )
                  }
                  className="text-[11px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'all-runs' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy List</span>
                </button>
              )}
            </div>

            {parsed.valid ? (
              parsed.nextRuns.length > 0 ? (
                <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
                  {parsed.nextRuns.map((r, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                    >
                      <div className="flex items-center gap-2.5 truncate mr-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0">
                          {i + 1}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white truncate">
                          {r.date}
                        </span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400 shrink-0">
                        {r.relative}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-center text-xs text-slate-400">
                  No matching schedule executions found in the next 12 months.
                </p>
              )
            ) : (
              <div className="p-6 text-center text-xs text-rose-500 font-medium">
                Fix syntax error in expression to preview upcoming runs.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
