import React, { useState, useMemo } from 'react';
import {
  Type,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Link2,
  Trash2,
  ArrowRightLeft,
  Download,
} from 'lucide-react';
import {
  toSentenceCase,
  toTitleCaseFull,
  toCamelCaseFull,
  toPascalCaseFull,
  toSnakeCaseFull,
  toConstantCaseFull,
  toKebabCaseFull,
  toDotCase,
  toPathCase,
  toAlternatingCase,
  toInverseCase,
  toSpongeBobCase,
  textToSlugFull,
  slugToTextFull,
} from './textHelpers';

interface CaseConverterPanelProps {
  initialText?: string;
  defaultMode?: 'all' | 'slug';
}

interface CaseOption {
  id: string;
  name: string;
  category: 'prose' | 'developer' | 'fun';
  transform: (t: string) => string;
  description: string;
}

export const CaseConverterPanel: React.FC<CaseConverterPanelProps> = ({
  initialText = 'Offline productivity tools without any cloud dependencies',
  defaultMode = 'all',
}) => {
  const [inputText, setInputText] = useState<string>(initialText);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [slugSeparator, setSlugSeparator] = useState<'-' | '_' | '.' | '/'>('-');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const caseTransforms: CaseOption[] = useMemo(
    () => [
      // Prose & Document Cases
      {
        id: 'upper',
        name: 'UPPERCASE',
        category: 'prose',
        transform: (t) => t.toUpperCase(),
        description: 'All letters converted to capital uppercase.',
      },
      {
        id: 'lower',
        name: 'lowercase',
        category: 'prose',
        transform: (t) => t.toLowerCase(),
        description: 'All letters converted to lowercase.',
      },
      {
        id: 'title',
        name: 'Title Case',
        category: 'prose',
        transform: (t) => toTitleCaseFull(t),
        description: 'Capitalizes first letter of major words (AP style).',
      },
      {
        id: 'sentence',
        name: 'Sentence case',
        category: 'prose',
        transform: (t) => toSentenceCase(t),
        description: 'Capitalizes the first letter of each sentence.',
      },
      // Developer Cases
      {
        id: 'camel',
        name: 'camelCase',
        category: 'developer',
        transform: (t) => toCamelCaseFull(t),
        description: 'First word lowercase, subsequent words capitalized.',
      },
      {
        id: 'pascal',
        name: 'PascalCase',
        category: 'developer',
        transform: (t) => toPascalCaseFull(t),
        description: 'Every word capitalized without delimiters.',
      },
      {
        id: 'snake',
        name: 'snake_case',
        category: 'developer',
        transform: (t) => toSnakeCaseFull(t),
        description: 'Lowercase words separated by underscores.',
      },
      {
        id: 'constant',
        name: 'CONSTANT_CASE',
        category: 'developer',
        transform: (t) => toConstantCaseFull(t),
        description: 'Uppercase words separated by underscores.',
      },
      {
        id: 'kebab',
        name: 'kebab-case',
        category: 'developer',
        transform: (t) => toKebabCaseFull(t),
        description: 'Lowercase words separated by hyphens.',
      },
      {
        id: 'slug',
        name: 'URL Slug',
        category: 'developer',
        transform: (t) => textToSlugFull(t, slugSeparator),
        description: 'URL-safe slug with accents stripped and clean separator.',
      },
      {
        id: 'dot',
        name: 'dot.case',
        category: 'developer',
        transform: (t) => toDotCase(t),
        description: 'Lowercase words joined with periods.',
      },
      {
        id: 'path',
        name: 'path/case',
        category: 'developer',
        transform: (t) => toPathCase(t),
        description: 'Lowercase words joined with slashes.',
      },
      // Fun & Stylistic Cases
      {
        id: 'spongebob',
        name: 'sPoNgEbOb cAsE',
        category: 'fun',
        transform: (t) => toSpongeBobCase(t),
        description: 'Randomized mocking SpongeBob capitalization.',
      },
      {
        id: 'alternating',
        name: 'aLtErNaTiNg cAsE',
        category: 'fun',
        transform: (t) => toAlternatingCase(t),
        description: 'Strict alternating letter capitalization.',
      },
      {
        id: 'inverse',
        name: 'InVeRsE cAsE',
        category: 'fun',
        transform: (t) => toInverseCase(t),
        description: 'Inverts current casing of every single character.',
      },
    ],
    [slugSeparator]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Type className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Case Converter & URL Slug Generator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live multi-case conversion across 15 standard prose, developer, and stylistic formats.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Slug Separator:</span>
          {(['-', '_', '.', '/'] as const).map((sep) => (
            <button
              key={sep}
              onClick={() => setSlugSeparator(sep)}
              className={`text-xs px-2.5 py-1 rounded font-mono ${
                slugSeparator === sep
                  ? 'bg-orange-500 text-white font-bold'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              "{sep}"
            </button>
          ))}
          <button
            onClick={() => setInputText('')}
            className="text-xs px-2.5 py-1 rounded text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Input Text Box */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Source Text
          </label>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>{inputText.length} chars</span>
            <span>•</span>
            <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} words</span>
          </div>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type or paste any text or URL slug here..."
          rows={3}
          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-sans focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 shadow-sm"
        />
      </div>

      {/* Slug to Text Quick Action Bar */}
      {/[a-z0-9]+[-_./][a-z0-9]+/i.test(inputText) && (
        <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-orange-800 dark:text-orange-300">
            <Link2 className="w-4 h-4 text-orange-500" />
            <span>Detected Slug format. Convert directly to human-readable spaced text?</span>
          </div>
          <button
            onClick={() => setInputText(slugToTextFull(inputText))}
            className="text-xs px-3 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-medium transition-colors"
          >
            Convert Slug to Words
          </button>
        </div>
      )}

      {/* Grid of All 15 Case Conversions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {caseTransforms.map((option) => {
          const transformed = option.transform(inputText);
          const isCopied = copiedId === option.id;

          return (
            <div
              key={option.id}
              className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/40 shadow-sm transition-all flex flex-col justify-between space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {option.name}
                </span>
                <button
                  onClick={() => handleCopy(transformed, option.id)}
                  disabled={!transformed}
                  className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors disabled:opacity-40"
                  title="Copy this case"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  {isCopied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 min-h-[52px] flex items-center">
                <p className="text-xs font-mono text-slate-900 dark:text-slate-100 break-all select-all">
                  {transformed || <span className="text-slate-400 italic">Empty text</span>}
                </p>
              </div>

              <p className="text-[11px] text-slate-400">{option.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
