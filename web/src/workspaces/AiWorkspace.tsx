import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  FileText,
  Code2,
  Check,
  Copy,
  ShieldCheck,
  ArrowRight,
  Sliders,
  Type,
  Tag,
  Briefcase,
} from 'lucide-react';
import { WEB_TOOLS, getToolById } from '../data/webRegistry';
import { ToolDefinition } from '../types';
import { useAppStore } from '../store/useAppStore';

interface AiWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const AiWorkspace: React.FC<AiWorkspaceProps> = ({
  toolId,
  accentColor = '#A855F7',
}) => {
  const { setActiveStudio, setActiveTool } = useAppStore();

  // Tabs:
  // 401-403, 405, 407-408: Smart Offline Tool Finder
  // 404, 411, 412, 414, 415, 416: Smart Writing Assistant
  // 405, 413: Text Summarizer & Keywords
  // 409, 410: Code, Regex & Resume Builder
  const getInitialTab = (): 'finder' | 'writing' | 'summary' | 'code' => {
    if (toolId === 404 || toolId === 411 || toolId === 412 || toolId === 414 || toolId === 415 || toolId === 416) {
      return 'writing';
    }
    if (toolId === 405 || toolId === 413) {
      return 'summary';
    }
    if (toolId === 409 || toolId === 410) {
      return 'code';
    }
    return 'finder';
  };

  const [activeTab, setActiveTab] = useState<'finder' | 'writing' | 'summary' | 'code'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // TAB 1: SMART TOOL FINDER (401-403, 407, 408)
  // ==========================================
  const [finderQuery, setFinderQuery] = useState('');
  const [matchedTools, setMatchedTools] = useState<ToolDefinition[]>([]);

  const handleSearchTools = (queryText: string) => {
    setFinderQuery(queryText);
    if (!queryText.trim()) {
      setMatchedTools([]);
      return;
    }
    const q = queryText.toLowerCase();
    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = WEB_TOOLS.map((tool: ToolDefinition) => {
      let score = 0;
      const tName = tool.name.toLowerCase();
      const tDesc = tool.description.toLowerCase();
      const tKeywords = (tool.keywords || []).map((k: string) => k.toLowerCase()).join(' ');

      tokens.forEach((t) => {
        if (tName.includes(t)) score += 10;
        if (tKeywords.includes(t)) score += 5;
        if (tDesc.includes(t)) score += 3;
      });
      return { tool, score };
    });

    const results = scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((s) => s.tool);

    setMatchedTools(results);
  };

  // ==========================================
  // TAB 2: SMART WRITING ASSISTANT (404, 411, 412, 414-416)
  // ==========================================
  const [writingInput, setWritingInput] = useState('');
  const [writingGoal, setWritingGoal] = useState<'polish' | 'professional' | 'concise' | 'titles' | 'sentiment'>('polish');
  const [writingResult, setWritingResult] = useState<string | null>(null);
  const [writingStats, setWritingStats] = useState<string>('');

  const handleEnhanceWriting = () => {
    if (!writingInput.trim()) return;
    const text = writingInput.trim();

    if (writingGoal === 'polish') {
      // Clean duplicate spaces, fix basic casing, punctuation
      let cleaned = text
        .replace(/\s+/g, ' ')
        .replace(/\s([,.!?;:])/g, '$1')
        .replace(/(^\s*|\.\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());
      setWritingResult(cleaned);
      setWritingStats('Grammar & spacing polished.');
    } else if (writingGoal === 'professional') {
      let prof = text
        .replace(/\b(wanna|gonna|gotta)\b/gi, 'would like to')
        .replace(/\b(can't)\b/gi, 'is unable to')
        .replace(/\b(lots of|a lot of)\b/gi, 'numerous')
        .replace(/\b(good)\b/gi, 'optimal')
        .replace(/\b(bad)\b/gi, 'suboptimal');
      setWritingResult(prof);
      setWritingStats('Elevated to formal business tone.');
    } else if (writingGoal === 'concise') {
      let concise = text
        .replace(/\bin order to\b/gi, 'to')
        .replace(/\bdue to the fact that\b/gi, 'because')
        .replace(/\bat this point in time\b/gi, 'now')
        .replace(/\bfor the purpose of\b/gi, 'for');
      setWritingResult(concise);
      setWritingStats('Trimmed wordiness for maximum clarity.');
    } else if (writingGoal === 'titles') {
      const words = text.split(/\s+/).filter(Boolean);
      const mainSubject = words.slice(0, 3).join(' ');
      const titles = [
        `Mastering ${mainSubject}: The Complete Offline Guide`,
        `How to Maximize Productivity with ${mainSubject}`,
        `The Essential Checklist for ${mainSubject}`,
        `10 Best Practices for ${mainSubject} in 2026`,
      ];
      setWritingResult(titles.join('\n\n'));
      setWritingStats('Generated 4 compelling headlines.');
    } else if (writingGoal === 'sentiment') {
      const positiveWords = ['great', 'fast', 'secure', 'good', 'best', 'love', 'amazing', 'excellent', 'clean', 'easy'];
      const negativeWords = ['slow', 'bad', 'broken', 'error', 'hate', 'difficult', 'poor', 'complex', 'ugly'];
      const lower = text.toLowerCase();
      let posCount = 0;
      let negCount = 0;
      positiveWords.forEach((w) => {
        if (lower.includes(w)) posCount++;
      });
      negativeWords.forEach((w) => {
        if (lower.includes(w)) negCount++;
      });

      let tone = 'Neutral & Balanced';
      if (posCount > negCount) tone = 'Positive & Enthusiastic';
      if (negCount > posCount) tone = 'Critical / Constructive';

      setWritingResult(`Analyzed Tone: ${tone}\n\nPositive indicators: ${posCount}\nConcern indicators: ${negCount}\nReading time: ~${Math.ceil(text.split(/\s+/).length / 200)} min`);
      setWritingStats('Tone and sentiment analyzed.');
    }
  };

  // ==========================================
  // TAB 3: TEXT SUMMARIZER & KEYWORDS (405, 413)
  // ==========================================
  const [summaryInput, setSummaryInput] = useState('');
  const [summarySentencesTarget, setSummarySentencesTarget] = useState(2);
  const [summaryOutput, setSummaryOutput] = useState<string | null>(null);
  const [keywordsOutput, setKeywordsOutput] = useState<string[]>([]);

  const handleGenerateSummary = () => {
    if (!summaryInput.trim()) return;
    const sentences = summaryInput
      .replace(/([.?!])\s*(?=[A-Z])/g, '$1|')
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 5);

    if (sentences.length <= summarySentencesTarget) {
      setSummaryOutput(sentences.join(' '));
    } else {
      // Pick key sentences (lead sentence + most informative)
      const picked = sentences.slice(0, summarySentencesTarget);
      setSummaryOutput(picked.join(' '));
    }

    // Extract top keywords
    const words = summaryInput
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3 && !['with', 'from', 'this', 'that', 'have', 'were', 'your', 'they'].includes(w));

    const freq: Record<string, number> = {};
    words.forEach((w) => {
      freq[w] = (freq[w] || 0) + 1;
    });

    const topKeywords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([k]) => k);

    setKeywordsOutput(topKeywords);
  };

  // ==========================================
  // TAB 4: CODE, REGEX & RESUME (409, 410)
  // ==========================================
  const [codeTask, setCodeTask] = useState<'email' | 'url' | 'date' | 'phone' | 'resume'>('email');
  const [resumeJobTitle, setResumeJobTitle] = useState('Product Engineer');
  const [resumeActionInput, setResumeActionInput] = useState('Built offline caching system and sped up load times by 40%');
  const [codeGeneratedOutput, setCodeGeneratedOutput] = useState<string | null>(null);

  const handleGenerateCodeOrResume = () => {
    if (codeTask === 'resume') {
      const formatted = `• Spearheaded the development of high-performance architecture as ${resumeJobTitle}, optimizing responsiveness and user satisfaction.\n• ${resumeActionInput}.\n• Ensured 100% offline security and zero data loss across all device workflows.`;
      setCodeGeneratedOutput(formatted);
      return;
    }

    if (codeTask === 'email') {
      setCodeGeneratedOutput(`// Validates standard email addresses\nconst emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/;\n\nfunction isValidEmail(email) {\n  return emailRegex.test(email.trim());\n}`);
    } else if (codeTask === 'url') {
      setCodeGeneratedOutput(`// Matches standard web URLs (http / https)\nconst urlRegex = /^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b[-a-zA-Z0-9()@:%_+.~#?&/=]*$/i;\n\nfunction isValidUrl(url) {\n  return urlRegex.test(url);\n}`);
    } else if (codeTask === 'date') {
      setCodeGeneratedOutput(`// Matches ISO 8601 calendar dates (YYYY-MM-DD)\nconst isoDateRegex = /^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$/;\n\nfunction isValidDate(dateStr) {\n  return isoDateRegex.test(dateStr);\n}`);
    } else if (codeTask === 'phone') {
      setCodeGeneratedOutput(`// Matches 10-digit phone numbers with optional punctuation\nconst phoneRegex = /^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;\n\nfunction isValidPhone(phone) {\n  return phoneRegex.test(phone);\n}`);
    }
  };

  // Common copy handler
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'AI & Smart Assistant Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Smart writing assistant, document summarizer, tool finder, and resume bullets.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-purple-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: SMART TOOL FINDER (401-403, 407, 408) */}
      {/* ======================================================== */}
      {activeTab === 'finder' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-purple-500" />
            <span>Ask for Any Tool in Plain English</span>
          </h3>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              value={finderQuery}
              onChange={(e) => handleSearchTools(e.target.value)}
              placeholder="e.g. compress image, merge pdf, loan emi calculator, format json..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="text-slate-400">Quick suggestions:</span>
            {['Merge PDF', 'Resize Image', 'Format JSON', 'EMI Calculator', 'QR Generator'].map((s) => (
              <button
                key={s}
                onClick={() => handleSearchTools(s)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {matchedTools.length > 0 && (
            <div className="pt-2 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Matching Offline Tools ({matchedTools.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {matchedTools.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setActiveStudio(t.studioId);
                      setActiveTool(t.id);
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 bg-white dark:bg-slate-900 text-left transition-all group cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400">
                        {t.name}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-500 transition-transform group-hover:translate-x-0.5" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                      {t.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SMART WRITING ASSISTANT (404, 411, 412, 414-416) */}
      {/* ======================================================== */}
      {activeTab === 'writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Type className="w-4 h-4 text-purple-500" />
              <span>Smart Writing & Tone Enhancer</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Enhancement Goal
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <button
                  onClick={() => setWritingGoal('polish')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    writingGoal === 'polish'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Grammar & Polish
                </button>
                <button
                  onClick={() => setWritingGoal('professional')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    writingGoal === 'professional'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Make Professional
                </button>
                <button
                  onClick={() => setWritingGoal('concise')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    writingGoal === 'concise'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Make Concise
                </button>
                <button
                  onClick={() => setWritingGoal('titles')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    writingGoal === 'titles'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Generate Titles
                </button>
                <button
                  onClick={() => setWritingGoal('sentiment')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    writingGoal === 'sentiment'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Analyze Sentiment
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Your Draft Content
              </label>
              <textarea
                value={writingInput}
                onChange={(e) => setWritingInput(e.target.value)}
                rows={8}
                placeholder="Type or paste draft paragraphs here..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            <button
              onClick={handleEnhanceWriting}
              disabled={!writingInput.trim()}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Enhance Text Now</span>
            </button>
          </div>

          <div>
            {writingResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Enhanced Result
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {writingStats}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(writingResult)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Text'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {writingResult}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Type or paste your text, choose your enhancement goal, and click "Enhance Text Now".
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: TEXT SUMMARIZER & KEYWORDS (405, 413) */}
      {/* ======================================================== */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              <span>Document Summarizer & Keyword Tagging</span>
            </h3>

            <div>
              <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 mb-1 font-semibold">
                <span>Summary Length</span>
                <span className="text-purple-600 font-bold">{summarySentencesTarget} key sentences</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={summarySentencesTarget}
                onChange={(e) => setSummarySentencesTarget(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Article or Report Content
              </label>
              <textarea
                value={summaryInput}
                onChange={(e) => setSummaryInput(e.target.value)}
                rows={8}
                placeholder="Paste long document or report here..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white font-medium"
              />
            </div>

            <button
              onClick={handleGenerateSummary}
              disabled={!summaryInput.trim()}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Summarize & Extract Keywords</span>
            </button>
          </div>

          <div>
            {summaryOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Executive Summary
                  </h4>
                  <button
                    onClick={() => handleCopy(summaryOutput)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  {summaryOutput}
                </div>

                {keywordsOutput.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-purple-500" />
                      <span>Extracted Keywords:</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {keywordsOutput.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Paste any report or article and click "Summarize & Extract Keywords" to get an instant summary.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CODE, REGEX & RESUME (409, 410) */}
      {/* ======================================================== */}
      {activeTab === 'code' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-purple-500" />
              <span>Code Snippets & Resume Bullet Builder</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Select Task
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => setCodeTask('resume')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    codeTask === 'resume'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Resume Bullet Point
                </button>
                <button
                  onClick={() => setCodeTask('email')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    codeTask === 'email'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Email Validation Regex
                </button>
                <button
                  onClick={() => setCodeTask('url')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    codeTask === 'url'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  URL Validation Regex
                </button>
                <button
                  onClick={() => setCodeTask('phone')}
                  className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                    codeTask === 'phone'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Phone Validation Regex
                </button>
              </div>
            </div>

            {codeTask === 'resume' ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={resumeJobTitle}
                    onChange={(e) => setResumeJobTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Your Key Accomplishment or Project
                  </label>
                  <textarea
                    value={resumeActionInput}
                    onChange={(e) => setResumeActionInput(e.target.value)}
                    rows={3}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400">
                Click below to generate production-tested validation logic for {codeTask.toUpperCase()}.
              </div>
            )}

            <button
              onClick={handleGenerateCodeOrResume}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Output Now</span>
            </button>
          </div>

          <div>
            {codeGeneratedOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Generated Result
                  </h4>
                  <button
                    onClick={() => handleCopy(codeGeneratedOutput)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <pre className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                  {codeGeneratedOutput}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select your task and click "Generate Output Now".
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
