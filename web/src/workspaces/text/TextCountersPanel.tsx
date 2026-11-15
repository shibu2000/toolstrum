import React, { useState, useMemo } from 'react';
import {
  Type,
  FileText,
  Clock,
  Mic,
  PenTool,
  Award,
  Sparkles,
  Copy,
  Check,
  Download,
  Trash2,
  BarChart3,
  BookOpen,
  Info,
  Maximize2,
} from 'lucide-react';
import { computeTextMetrics } from './textHelpers';

interface TextCountersPanelProps {
  initialText?: string;
  focusedMetric?: 'words' | 'characters' | 'sentences' | 'paragraphs' | 'time' | 'readability' | 'all';
}

const PRESET_SAMPLES = [
  {
    label: 'Plain English',
    text: 'Toolstrum is an entirely offline productivity suite engineered with over four hundred and ninety utilities. Every algorithm runs directly inside your local web browser sandbox without sending any data over the internet. You can convert documents, edit images, format source code, and inspect network traffic in complete privacy.',
  },
  {
    label: 'Technical Whitepaper',
    text: 'Cryptographic hash functions synthesize arbitrary input bitfields into deterministic fixed-width digests. The SHA-256 algorithm executes a Merkle-Damgard iteration with a Davies-Meyer compression function utilizing 64 logical rounds of bitwise rotations, modular additions, and non-linear Boolean primitives to ensure pre-image resistance and collision mitigation.',
  },
  {
    label: 'Literature / Story',
    text: 'The autumn wind swept through the ancient cobblestone alleys, rustling dry maple leaves into spiraling golden eddies. Somewhere in the distance, a clocktower chimed seven resonant beats, reverberating against the mist that clung softly to the quiet harbor waters.',
  },
];

export const TextCountersPanel: React.FC<TextCountersPanelProps> = ({
  initialText = PRESET_SAMPLES[0].text,
  focusedMetric = 'all',
}) => {
  const [text, setText] = useState<string>(initialText);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'metrics' | 'readability' | 'keywords'>('metrics');

  const metrics = useMemo(() => computeTextMetrics(text), [text]);

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const report = [
      '========================================',
      'TOOLSTRUM TEXT METRICS & READABILITY REPORT',
      '========================================',
      `Characters (with spaces): ${metrics.characters}`,
      `Characters (no spaces):   ${metrics.charactersNoSpaces}`,
      `Words:                    ${metrics.words}`,
      `Unique Words:             ${metrics.uniqueWords}`,
      `Sentences:                ${metrics.sentences}`,
      `Paragraphs:               ${metrics.paragraphs}`,
      `Lines:                    ${metrics.lines}`,
      `Syllables:                ${metrics.syllables}`,
      `Complex Words:            ${metrics.complexWords}`,
      '----------------------------------------',
      `Reading Time (Silent):    ${metrics.readingTimeMinutes} min (~${Math.round(metrics.readingTimeMinutes * 60)} sec)`,
      `Speaking Time (Speech):   ${metrics.speakingTimeMinutes} min (~${Math.round(metrics.speakingTimeMinutes * 60)} sec)`,
      `Handwriting Time:         ${metrics.handwritingTimeMinutes} min`,
      '----------------------------------------',
      `Flesch Reading Ease:      ${metrics.fleschReadingEase} / 100 (${metrics.readingLevelLabel})`,
      `Flesch-Kincaid Grade:     ${metrics.fleschKincaidGrade}`,
      `Coleman-Liau Index:       ${metrics.colemanLiauIndex}`,
      `Automated Readability (ARI): ${metrics.automatedReadabilityIndex}`,
      `Gunning Fog Index:        ${metrics.gunningFogIndex}`,
      '========================================',
      '',
      'ORIGINAL TEXT:',
      text,
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `text-statistics-report-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Flesch Score color
  const getFleschBadgeColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    if (score >= 60) return 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20';
    if (score >= 40) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Type className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Text Statistics & Readability Engine
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant word count, syllable analysis, reading velocity, and 5 academic readability indices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Sample:</span>
          {PRESET_SAMPLES.map((preset) => (
            <button
              key={preset.label}
              onClick={() => setText(preset.text)}
              className="text-xs px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-orange-500 transition-colors"
            >
              {preset.label}
            </button>
          ))}
          <button
            onClick={() => setText('')}
            className="text-xs px-2 py-1 rounded-md text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-1 transition-colors"
            title="Clear text"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Main Grid: Editor & Live Telemetry Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Text Input (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Input Text
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(text)}
                disabled={!text}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!text}
                className="text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                Report (.txt)
              </button>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to compute real-time word count, syllable depth, reading times, and academic readability formulas..."
            rows={14}
            className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-y shadow-sm"
          />

          {/* Quick Footer Stats Bar */}
          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
            <div className="flex items-center gap-3">
              <span>Avg. Word Length: <strong className="text-slate-800 dark:text-slate-200">{metrics.avgWordLength}</strong> chars</span>
              <span>•</span>
              <span>Avg. Sentence: <strong className="text-slate-800 dark:text-slate-200">{metrics.avgSentenceLength}</strong> words</span>
            </div>
            <div>
              <span>Unique Words: <strong className="text-slate-800 dark:text-slate-200">{metrics.uniqueWords}</strong> ({metrics.words > 0 ? Math.round((metrics.uniqueWords / metrics.words) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* Right Column: Dynamic Statistics Matrix (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary 4-Metric Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Words
              </span>
              <p className="text-3xl font-extrabold text-orange-600 dark:text-orange-400 mt-1">
                {metrics.words.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">Total counted words</span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Characters
              </span>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {metrics.characters.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">
                {metrics.charactersNoSpaces.toLocaleString()} excluding spaces
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Sentences
              </span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics.sentences.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">
                {metrics.paragraphs.toLocaleString()} paragraphs • {metrics.lines} lines
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Syllables
              </span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {metrics.syllables.toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">
                {metrics.complexWords.toLocaleString()} complex (3+ syl)
              </span>
            </div>
          </div>

          {/* Durations Bar */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              Duration Estimates
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <BookOpen className="w-3 h-3 text-sky-500" /> Reading
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {metrics.readingTimeMinutes < 1
                    ? `${Math.round(metrics.readingTimeMinutes * 60)}s`
                    : `${metrics.readingTimeMinutes}m`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <Mic className="w-3 h-3 text-emerald-500" /> Speech
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {metrics.speakingTimeMinutes < 1
                    ? `${Math.round(metrics.speakingTimeMinutes * 60)}s`
                    : `${metrics.speakingTimeMinutes}m`}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                  <PenTool className="w-3 h-3 text-amber-500" /> Writing
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {metrics.handwritingTimeMinutes < 1
                    ? `${Math.round(metrics.handwritingTimeMinutes * 60)}s`
                    : `${metrics.handwritingTimeMinutes}m`}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Readability Indices vs Keyword Density */}
          <div className="space-y-3">
            <div className="flex border-b border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setActiveTab('metrics')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'metrics'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Readability Indices
              </button>
              <button
                onClick={() => setActiveTab('keywords')}
                className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                  activeTab === 'keywords'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Top Keyword Density
              </button>
            </div>

            {activeTab === 'metrics' && (
              <div className="space-y-2.5">
                {/* Flesch Reading Ease Feature Card */}
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        Flesch Reading Ease
                      </span>
                      <p className="text-[11px] text-slate-400">Higher is easier to read (0-100 scale)</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        {metrics.fleschReadingEase}
                      </span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getFleschBadgeColor(
                        metrics.fleschReadingEase
                      )}`}
                    >
                      {metrics.readingLevelLabel}
                    </span>
                  </div>
                </div>

                {/* Additional Indices Table */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Flesch-Kincaid Grade Level</span>
                    <strong className="text-slate-900 dark:text-white">Grade {metrics.fleschKincaidGrade}</strong>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Gunning Fog Index</span>
                    <strong className="text-slate-900 dark:text-white">{metrics.gunningFogIndex}</strong>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Coleman-Liau Index</span>
                    <strong className="text-slate-900 dark:text-white">{metrics.colemanLiauIndex}</strong>
                  </div>
                  <div className="py-1.5 flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Automated Readability (ARI)</span>
                    <strong className="text-slate-900 dark:text-white">{metrics.automatedReadabilityIndex}</strong>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
                {metrics.topKeywords.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No recurring keywords found.</p>
                ) : (
                  metrics.topKeywords.map((k) => (
                    <div key={k.word} className="flex items-center justify-between text-xs">
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-medium">{k.word}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{k.count}×</span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                          {k.percentage}%
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
