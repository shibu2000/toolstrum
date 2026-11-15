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
  AlertCircle,
  Replace,
  Clock,
  Code,
  Sliders,
  ShieldCheck,
  Hash
} from 'lucide-react';
import { testRegex, RegexTestResult } from './devHelpers';

interface RegexTesterPanelProps {
  initialPattern?: string;
  initialFlags?: string;
  initialCorpus?: string;
}

const REGEX_PRESETS: Record<
  string,
  { label: string; pattern: string; flags: string; sample: string; description: string }
> = {
  'Email Address': {
    label: 'Email (RFC 5322)',
    pattern: '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}',
    flags: 'g',
    sample: 'Reach out at support@toolstrum.com, founders@toolstrum.dev or billing-team+corp@sub.domain.co.uk for inquiries.',
    description: 'Matches standard user and organization email addresses with alphanumeric subdomains.'
  },
  'IPv4 Address': {
    label: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    sample: 'Gateway: 192.168.1.1, DNS 1: 8.8.8.8, DNS 2: 1.1.1.1, Invalid: 999.12.34.56',
    description: 'Strict octet boundaries validating 0-255 ranges across dotted IPv4 notation.'
  },
  'ISO 8601 Timestamp': {
    label: 'ISO 8601 Timestamp',
    pattern: '\\b\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?(?:Z|[+-]\\d{2}:\\d{2})\\b',
    flags: 'g',
    sample: 'Deployment started at 2026-11-15T09:30:00Z and completed at 2026-11-15T09:34:12.450+00:00.',
    description: 'Validates standard UTC and timezone-offset ISO date-time timestamps.'
  },
  'URL & Protocol': {
    label: 'HTTP/HTTPS URLs',
    pattern: 'https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)',
    flags: 'gi',
    sample: 'Visit https://toolstrum.dev/docs/quickstart or check http://localhost:3000/api?user=admin#section.',
    description: 'Extracts web URLs including optional port, query parameters, and anchor fragments.'
  },
  'UUID v4': {
    label: 'UUID v4 Identifier',
    pattern: '\\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\\b',
    flags: 'gi',
    sample: 'Session: 123e4567-e89b-42d3-a456-426614174000, Request: 550e8400-e29b-41d4-a716-446655440000',
    description: 'RFC 4122 compliant UUID v4 with fixed version and variant nibbles.'
  },
  'Semantic Version': {
    label: 'SemVer 2.0.0',
    pattern: 'v?(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)(?:-[0-9A-Za-z.-]+)?(?:\\+[0-9A-Za-z.-]+)?',
    flags: 'g',
    sample: 'Releases include v1.0.0, 2.4.12-beta.1+exp.sha.5114f85, and next v3.0.0-rc.2.',
    description: 'Parses major.minor.patch with optional pre-release and build metadata tags.'
  },
  'Hex Color Code': {
    label: 'Hex Color Codes',
    pattern: '#(?:[0-9a-fA-F]{3}){1,2}\\b',
    flags: 'gi',
    sample: 'Primary theme: #0284c7, accent: #f43f5e, short: #fff, muted: #64748b',
    description: 'Matches 3-digit and 6-digit hex color representations.'
  }
};

type CodeLang = 'javascript' | 'python' | 'go' | 'rust';

export const RegexTesterPanel: React.FC<RegexTesterPanelProps> = ({
  initialPattern,
  initialFlags,
  initialCorpus
}) => {
  const [pattern, setPattern] = useState<string>(
    initialPattern || REGEX_PRESETS['Email Address'].pattern
  );
  const [flags, setFlags] = useState<string>(initialFlags || 'g');
  const [corpus, setCorpus] = useState<string>(
    initialCorpus || REGEX_PRESETS['Email Address'].sample
  );
  const [replacement, setReplacement] = useState<string>('[REDACTED]');
  const [showReplace, setShowReplace] = useState<boolean>(false);
  const [codeLang, setCodeLang] = useState<CodeLang>('javascript');
  const [copied, setCopied] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toggle individual flag
  const toggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(flagChar, ''));
    } else {
      setFlags(flags + flagChar);
    }
  };

  // Run test
  const testResult: RegexTestResult = useMemo(() => {
    return testRegex(pattern, flags, corpus, showReplace ? replacement : undefined);
  }, [pattern, flags, corpus, replacement, showReplace]);

  // Generate code snippet
  const codeSnippet = useMemo(() => {
    const escapedPattern = pattern.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
    switch (codeLang) {
      case 'javascript':
        return `// JavaScript / TypeScript (ES2020+)
const regex = /${pattern}/${flags};
const text = ${JSON.stringify(corpus)};

// Match all with capture groups
const matches = [...text.matchAll(regex)];
for (const match of matches) {
  console.log('Match:', match[0], 'Index:', match.index);
  if (match.groups) console.log('Groups:', match.groups);
}

// Replacement:
const replaced = text.replace(regex, "${replacement}");
console.log(replaced);`;

      case 'python':
        return `# Python 3.8+
import re

pattern = r"${pattern}"
text = """${corpus}"""

# Find all matches
matches = re.finditer(pattern, text${flags.includes('i') ? ', re.IGNORECASE' : ''}${flags.includes('m') ? ' | re.MULTILINE' : ''}${flags.includes('s') ? ' | re.DOTALL' : ''})
for m in matches:
    print(f"Match: {m.group(0)} at index {m.start()}-{m.end()}")
    if m.groupdict():
        print("Groups:", m.groupdict())

# Substitution:
replaced = re.sub(pattern, "${replacement}", text)
print(replaced)`;

      case 'go':
        return `// Go (Golang)
package main

import (
\t"fmt"
\t"regexp"
)

func main() {
\tre := regexp.MustCompile(\`${pattern}\`)
\ttext := \`${corpus}\`

\tmatches := re.FindAllString(text, -1)
\tfmt.Printf("Found %d matches: %v\\n", len(matches), matches)

\treplaced := re.ReplaceAllString(text, "${replacement}")
\tfmt.Println(replaced)
}`;

      case 'rust':
        return `// Rust (regex crate)
use regex::Regex;

fn main() {
    let re = Regex::new(r"${pattern}").unwrap();
    let text = "${corpus.replace(/"/g, '\\"')}";

    for mat in re.find_iter(text) {
        println!("Match: {} ({}-{})", mat.as_str(), mat.start(), mat.end());
    }

    let replaced = re.replace_all(text, "${replacement}");
    println!("{}", replaced);
}`;

      default:
        return '';
    }
  }, [pattern, flags, corpus, replacement, codeLang]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMatches = () => {
    const content = testResult.matches.join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toolstrum-regex-matches.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCorpus(text);
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Render highlighted segments in corpus
  const renderedHighlights = useMemo(() => {
    if (!testResult.items || testResult.items.length === 0 || !corpus) {
      return <span>{corpus}</span>;
    }

    const segments: React.ReactNode[] = [];
    let lastIndex = 0;

    testResult.items.forEach((item, idx) => {
      if (item.index > lastIndex) {
        segments.push(corpus.substring(lastIndex, item.index));
      }
      segments.push(
        <mark
          key={idx}
          className="bg-amber-200/90 dark:bg-amber-500/40 text-amber-950 dark:text-amber-100 font-bold px-1 py-0.5 rounded-md border border-amber-300 dark:border-amber-600/50 shadow-xs"
          title={`Match #${idx + 1} at index ${item.index}`}
        >
          {item.match}
        </mark>
      );
      lastIndex = item.index + item.length;
    });

    if (lastIndex < corpus.length) {
      segments.push(corpus.substring(lastIndex));
    }

    return segments;
  }, [corpus, testResult.items]);

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Regular Expression (Regex) Tester
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
                100% Offline
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live syntax match highlighting, capture group extraction, replace substitution & multi-language snippets.
            </p>
          </div>
        </div>

        {/* Telemetry Badge */}
        <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
            {testResult.count} Match{testResult.count === 1 ? '' : 'es'}
          </span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-mono">
            ({testResult.executionTimeMs} ms)
          </span>
        </div>
      </div>

      {/* Preset Library Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Presets:
        </span>
        {Object.entries(REGEX_PRESETS).map(([key, item]) => (
          <button
            key={key}
            onClick={() => {
              setPattern(item.pattern);
              setFlags(item.flags);
              setCorpus(item.sample);
            }}
            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
            title={item.description}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Pattern Bar & Flag Toggles */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Code2 className="w-4 h-4 text-amber-500" />
            Regular Expression Pattern
          </label>

          {/* Flags Buttons */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-slate-400 mr-1">Flags:</span>
            {[
              { flag: 'g', label: 'Global (g)', desc: 'Find all matches' },
              { flag: 'i', label: 'Insensitive (i)', desc: 'Case-insensitive' },
              { flag: 'm', label: 'Multiline (m)', desc: '^/$ match line start/end' },
              { flag: 's', label: 'DotAll (s)', desc: '. matches newline' },
              { flag: 'u', label: 'Unicode (u)', desc: 'Full unicode support' }
            ].map(({ flag, label, desc }) => (
              <button
                key={flag}
                onClick={() => toggleFlag(flag)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  flags.includes(flag)
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title={`${label} - ${desc}`}
              >
                {flag}
              </button>
            ))}
          </div>
        </div>

        {/* Big Pattern Input */}
        <div className="flex items-center px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-900 dark:text-slate-100 focus-within:ring-2 focus-within:ring-amber-500/20">
          <span className="text-slate-400 mr-2 font-bold select-none text-base">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Type regex pattern (e.g. [A-Za-z0-9]+)..."
            spellCheck={false}
            className="w-full bg-transparent focus:outline-none font-mono text-xs sm:text-sm text-slate-900 dark:text-white"
          />
          <span className="text-slate-400 ml-2 font-bold select-none text-base">/</span>
          <span className="text-amber-600 dark:text-amber-400 ml-1 font-bold select-none text-xs">
            {flags}
          </span>
        </div>

        {testResult.error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2 border border-rose-200 dark:border-rose-900/50">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>Regex Syntax Error: {testResult.error}</span>
          </div>
        )}
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Test Corpus & Live Highlights */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Target Corpus Text
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                ({corpus.length.toLocaleString()} chars)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowReplace(!showReplace)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-colors ${
                  showReplace
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Toggle regex replace / substitution mode"
              >
                <Replace className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload text file"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.log,.json,.csv,text/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                onClick={() => handleCopy(corpus)}
                title="Copy Corpus"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setCorpus('')}
                title="Clear input"
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col space-y-4">
            <textarea
              value={corpus}
              onChange={(e) => setCorpus(e.target.value)}
              placeholder="Type or paste sample text to test your regular expression against..."
              rows={9}
              spellCheck={false}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
            />

            {/* Substitution Input */}
            {showReplace && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Replace className="w-3.5 h-3.5 text-amber-500" />
                    Replacement String
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">Supports $1, $2, $&</span>
                </div>
                <input
                  type="text"
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  placeholder="e.g. [REDACTED] or Item: $1"
                  className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />

                {testResult.replacedText !== undefined && (
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Substitution Result
                    </span>
                    <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 max-h-32 overflow-y-auto whitespace-pre-wrap select-all">
                      {testResult.replacedText}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Highlight Preview */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Visual Match Highlights ({testResult.count})</span>
                <span className="text-[11px] text-slate-400 font-normal">Real-time overlay</span>
              </span>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-800 dark:text-slate-200 max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
                {renderedHighlights}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Matches Inspector & Code Export */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex flex-wrap items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Matched Items ({testResult.count})
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {testResult.matches.length > 0 && (
                <>
                  <button
                    onClick={() => handleCopy(testResult.matches.join('\n'))}
                    title="Copy all matched strings"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownloadMatches}
                    title="Download matches as text file"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[560px]">
            {/* Matches List */}
            {testResult.items.length > 0 ? (
              <div className="space-y-2">
                {testResult.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white truncate">
                          {item.match}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0 font-medium ml-2">
                        index: {item.index}..{item.index + item.length}
                      </span>
                    </div>

                    {/* Numbered & Named Groups */}
                    {item.numberedGroups && item.numberedGroups.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
                        {item.numberedGroups.map((grp, gIdx) => (
                          <span
                            key={gIdx}
                            className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          >
                            <strong className="text-amber-600 dark:text-amber-400">${gIdx + 1}:</strong> {grp ?? 'null'}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                No regex matches found in test corpus text.
              </div>
            )}

            {/* Multi-Language Code Generator */}
            <div className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-amber-500" />
                  Code Snippet
                </span>

                <div className="flex items-center bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-semibold">
                  {(['javascript', 'python', 'go', 'rust'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setCodeLang(lang)}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        codeLang === lang
                          ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lang === 'javascript' ? 'JS/TS' : lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-48">
                  {codeSnippet}
                </pre>
                <button
                  onClick={() => handleCopy(codeSnippet)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy code snippet"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Real-Time Match Highlights</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Instant non-blocking overlay marks match positions, offsets, and captures across the test corpus.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Replace className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Live String Substitution</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Test regex replacements with full back-reference token support ($1, $2, $&) and instant preview.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">ReDoS & Runaway Guard</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Safe client-side evaluation throttles runaway catastrophic backtracking loops and zero-length matches.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};