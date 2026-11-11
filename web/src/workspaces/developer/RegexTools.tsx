import React, { useState } from 'react';
import { Copy, Check, Play, AlertCircle, Sparkles } from 'lucide-react';
import { explainRegex } from './devHelpers';

interface ToolProps {
  copied: boolean;
  onCopy: (text: string) => void;
}

// ========================================================
// 265 — REGEX TESTER
// ========================================================
export const RegexTesterTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [pattern, setPattern] = useState('[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}');
  const [flags, setFlags] = useState('g');
  const [testText, setTestText] = useState(
    'Contact hello@toolstrum.app, support@toolstrum.app or founder@toolstrum.dev for questions.'
  );

  let matches: { match: string; index: number; groups?: string[] }[] = [];
  let regexError = '';

  try {
    const reg = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const allMatches = testText.matchAll(reg);
    for (const m of allMatches) {
      matches.push({
        match: m[0],
        index: m.index ?? 0,
        groups: m.slice(1),
      });
    }
  } catch (e: any) {
    regexError = e.message;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
            Regular Expression Pattern & Flags
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus-within:ring-2 focus-within:ring-sky-500/20">
              <span className="text-slate-400 mr-1.5 font-bold">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-transparent focus:outline-none"
                placeholder="pattern"
              />
              <span className="text-slate-400 ml-1.5 font-bold">/</span>
            </div>
            <input
              type="text"
              value={flags}
              onChange={(e) => setFlags(e.target.value)}
              className="w-20 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-center text-slate-900 dark:text-white font-bold"
              placeholder="g, i, m"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
            Test Target String
          </label>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            rows={8}
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/20"
            placeholder="Type or paste text to test..."
          />
        </div>

        {regexError && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Regex Error: {regexError}</span>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Matched Items ({matches.length})
            </span>
          </div>
          {matches.length > 0 && (
            <button
              onClick={() => onCopy(matches.map((m) => m.match).join('\n'))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy All Matches</span>
            </button>
          )}
        </div>

        {matches.length > 0 ? (
          <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
            {matches.map((m, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs font-mono flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-5 h-5 rounded-md bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-slate-900 dark:text-white font-bold truncate">
                    {m.match}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">
                  index: {m.index}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No matches found for the current pattern.
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 266 — REGEX EXPLAINER
// ========================================================
export const RegexExplainerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [pattern, setPattern] = useState('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$');

  const tokens = explainRegex(pattern);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block mb-1.5">
            Regular Expression Pattern to Explain
          </label>
          <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus-within:ring-2 focus-within:ring-sky-500/20">
            <span className="text-slate-400 mr-1.5 font-bold">/</span>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              className="w-full bg-transparent focus:outline-none"
              placeholder="e.g. ^[0-9]{4}-[0-9]{2}$"
            />
            <span className="text-slate-400 ml-1.5 font-bold">/</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
            Common Quick Presets
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Email', p: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$' },
              { label: 'URL', p: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b' },
              { label: 'Phone', p: '^\\+?[1-9]\\d{1,14}$' },
              { label: 'IPv4', p: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$' },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setPattern(preset.p)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-100 transition-colors"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Token-by-Token Plain English Explanation</span>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            {tokens.length} token(s)
          </span>
        </div>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {tokens.map((t, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs flex items-start gap-3"
            >
              <span className="px-2 py-1 rounded-md bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300 font-mono text-xs font-bold shrink-0">
                {t.token}
              </span>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  {t.category}
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {t.meaning}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
