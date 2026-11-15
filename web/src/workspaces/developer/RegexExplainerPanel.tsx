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
  Search,
  BookOpen,
  ArrowRight,
  Workflow,
  HelpCircle,
  Eye,
  Sliders,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { explainRegex, RegexTokenExplanation } from './devHelpers';

interface RegexExplainerPanelProps {
  initialPattern?: string;
}

const REGEX_EXPLAIN_PRESETS: Record<
  string,
  { label: string; pattern: string; description: string }
> = {
  'Email Address': {
    label: 'Email (RFC 5322)',
    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,6}$',
    description: 'Enforces start/end bounds, user handle, @ delimiter, subdomain and TLD.'
  },
  'Strict Password': {
    label: 'Password with Lookaheads',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,32}$',
    description: 'Requires 8-32 chars containing lowercase, uppercase, digit, and special symbol using positive lookaheads.'
  },
  'SemVer with Named Groups': {
    label: 'SemVer with Named Groups',
    pattern: '^v?(?<major>0|[1-9]\\d*)\\.(?<minor>0|[1-9]\\d*)\\.(?<patch>0|[1-9]\\d*)(?:-(?<prerelease>[0-9A-Za-z.-]+))?$',
    description: 'Captures major, minor, patch, and optional prerelease version into named backreferences.'
  },
  'URL & Protocol': {
    label: 'Web URL with Query & Path',
    pattern: '^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$',
    description: 'Validates optional protocol, host, TLD, and trailing path segments.'
  },
  'ISO 8601 Date': {
    label: 'ISO 8601 Date-Time',
    pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])T([01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(\\.\\d+)?Z$',
    description: 'Strict calendar ranges matching YYYY-MM-DDTHH:mm:ss.sssZ.'
  }
};

type ExplainerTab = 'tokens' | 'narrative' | 'flow' | 'cheatsheet';

export const RegexExplainerPanel: React.FC<RegexExplainerPanelProps> = ({
  initialPattern
}) => {
  const [pattern, setPattern] = useState<string>(
    initialPattern || REGEX_EXPLAIN_PRESETS['Email Address'].pattern
  );
  const [activeTab, setActiveTab] = useState<ExplainerTab>('tokens');
  const [copied, setCopied] = useState<boolean>(false);

  // Compute offline token breakdown
  const tokens: RegexTokenExplanation[] = useMemo(() => {
    if (!pattern.trim()) return [];
    try {
      return explainRegex(pattern);
    } catch {
      return [];
    }
  }, [pattern]);

  // English plain-text narrative summary
  const narrativeSummary: string[] = useMemo(() => {
    if (tokens.length === 0) return [];

    const steps: string[] = [];
    tokens.forEach((t, i) => {
      steps.push(`Step ${i + 1}: Token "${t.token}" (${t.category}) — ${t.meaning}`);
    });
    return steps;
  }, [tokens]);

  // Markdown Report export
  const markdownReport = useMemo(() => {
    let md = `# Toolstrum Regular Expression (Regex) Analysis Report\n\n`;
    md += `**Pattern:** \`/${pattern}/\`\n`;
    md += `**Total Tokens:** ${tokens.length}\n\n`;

    md += `## Token Breakdown\n`;
    tokens.forEach((t, i) => {
      md += `${i + 1}. \`${t.token}\` [${t.category.toUpperCase()}]: ${t.meaning}\n`;
    });
    md += `\n`;

    md += `## Plain English Walkthrough\n`;
    narrativeSummary.forEach((s) => {
      md += `- ${s}\n`;
    });
    md += `\n`;

    return md;
  }, [pattern, tokens, narrativeSummary]);

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
    a.download = 'toolstrum-regex-explanation.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'anchor':
        return 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'character':
        return 'bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'quantifier':
        return 'bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'group':
        return 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'lookaround':
        return 'bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'logic':
      default:
        return 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Regex Explainer & AST Visualizer
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Token-by-token decomposition, plain English narrative, capture group hierarchy & AST execution flow.
            </p>
          </div>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs font-bold text-purple-900 dark:text-purple-200">
            {tokens.length} Parsed Tokens
          </span>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">
            (Static AST)
          </span>
        </div>
      </div>

      {/* Preset Library Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Examples:
        </span>
        {Object.entries(REGEX_EXPLAIN_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => setPattern(item.pattern)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
            title={item.description}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Big Pattern Input */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-purple-500" />
            Regular Expression Pattern to Dissect
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCopy(pattern)}
              title="Copy Pattern"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setPattern('')}
              title="Clear input"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-900 dark:text-slate-100 focus-within:ring-2 focus-within:ring-purple-500/20">
          <span className="text-slate-400 mr-2 font-bold select-none text-base">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="e.g. ^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
            spellCheck={false}
            className="w-full bg-transparent focus:outline-none font-mono text-xs sm:text-sm text-slate-900 dark:text-white"
          />
          <span className="text-slate-400 ml-2 font-bold select-none text-base">/</span>
        </div>

        {/* Visual Token Chips Preview */}
        {tokens.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tokens.map((t, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border transition-transform hover:scale-105 cursor-pointer ${getCategoryColor(
                  t.category
                )}`}
                title={`${t.category.toUpperCase()}: ${t.meaning}`}
              >
                {t.token}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Analysis Section */}
      <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Navigation Tabs Header */}
        <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
          <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveTab('tokens')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'tokens'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Token Details ({tokens.length})
            </button>

            <button
              onClick={() => setActiveTab('narrative')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'narrative'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Plain English Narrative
            </button>

            <button
              onClick={() => setActiveTab('flow')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'flow'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Workflow className="w-3.5 h-3.5" />
              Execution Pipeline
            </button>

            <button
              onClick={() => setActiveTab('cheatsheet')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'cheatsheet'
                  ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Cheat Sheet
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCopy(markdownReport)}
              title="Copy Markdown Explanation"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleDownloadReport}
              title="Download Explanation (.md)"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="p-4 overflow-y-auto max-h-[580px]">
          {/* TAB 1: TOKENS LIST */}
          {activeTab === 'tokens' && (
            <div className="space-y-2.5">
              {tokens.length > 0 ? (
                tokens.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-0.5 rounded-md font-mono text-xs font-bold border ${getCategoryColor(
                            t.category
                          )}`}
                        >
                          {t.token}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {t.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
                        {t.meaning}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Enter a pattern above to dissect its tokens.
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PLAIN ENGLISH NARRATIVE */}
          {activeTab === 'narrative' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200/80 dark:border-purple-900/40">
                <h4 className="text-xs font-bold text-purple-900 dark:text-purple-200 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  Plain English Summary
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  This regular expression matches a string structured according to the sequential steps detailed below:
                </p>
              </div>

              <div className="space-y-2">
                {narrativeSummary.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs"
                  >
                    <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PIPELINE DAG */}
          {activeTab === 'flow' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Linear state evaluation representing matching flow from left to right:
              </p>

              <div className="flex flex-col gap-2">
                {tokens.map((t, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                  >
                    <div className="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0">
                      {t.token}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                      {t.meaning}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHEAT SHEET */}
          {activeTab === 'cheatsheet' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-purple-600 dark:text-purple-400 uppercase text-[11px] tracking-wider">
                  Character Classes
                </h4>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">\d</span> <span className="text-slate-500">Any digit [0-9]</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">\w</span> <span className="text-slate-500">Word char [A-Za-z0-9_]</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">\s</span> <span className="text-slate-500">Whitespace (space, tab, nl)</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">.</span> <span className="text-slate-500">Any char except newline</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">[a-z]</span> <span className="text-slate-500">Range a through z</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">[^a-z]</span> <span className="text-slate-500">Negated range</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-600 dark:text-amber-400 uppercase text-[11px] tracking-wider">
                  Quantifiers
                </h4>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">+</span> <span className="text-slate-500">1 or more (greedy)</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">*</span> <span className="text-slate-500">0 or more (greedy)</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">?</span> <span className="text-slate-500">0 or 1 (optional)</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">{'{3}'}</span> <span className="text-slate-500">Exactly 3 times</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">{'{2,5}'}</span> <span className="text-slate-500">Between 2 and 5 times</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">+?</span> <span className="text-slate-500">Lazy quantifier (match least)</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-[11px] tracking-wider">
                  Anchors & Boundaries
                </h4>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">^</span> <span className="text-slate-500">Start of string/line</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">$</span> <span className="text-slate-500">End of string/line</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">\b</span> <span className="text-slate-500">Word boundary</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">\B</span> <span className="text-slate-500">Non-word boundary</span></div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <h4 className="font-bold text-rose-600 dark:text-rose-400 uppercase text-[11px] tracking-wider">
                  Lookarounds & Groups
                </h4>
                <div className="space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">(...)</span> <span className="text-slate-500">Capturing group</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">(?:...)</span> <span className="text-slate-500">Non-capturing group</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">(?=...)</span> <span className="text-slate-500">Positive Lookahead</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">(?!...)</span> <span className="text-slate-500">Negative Lookahead</span></div>
                  <div className="flex justify-between"><span className="text-slate-800 dark:text-slate-200 font-bold">(?&lt;=...)</span> <span className="text-slate-500">Positive Lookbehind</span></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Token Decomposition</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Color-coded chips categorize anchors, character classes, quantifiers, groups, and lookarounds.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Eye className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Plain English Narrative</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Translates cryptic syntax into conversational step-by-step instructions any developer can understand.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Built-in Cheat Sheet</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Instant offline reference for character classes, greedy vs lazy quantifiers, and lookaround syntax.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};