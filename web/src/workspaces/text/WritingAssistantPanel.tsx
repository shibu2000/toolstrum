import React, { useState, useMemo } from 'react';
import {
  SpellCheck,
  Wand2,
  Mail,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Sparkles,
  Send,
  Trash2,
} from 'lucide-react';
import {
  analyzeGrammarAndStyle,
  GrammarIssue,
} from './textHelpers';

interface WritingAssistantPanelProps {
  defaultSubTool?: 'grammar' | 'spell' | 'email';
}

const SAMPLE_GRAMMAR_TEXT = `We are writing in order to inform you that the new release was created by our engineering division.
Due to the fact that security is paramount, the the system has been tested thoroughly.
At this point in time, it is recommended that you update your workstation immediately.`;

const EMAIL_TEMPLATES = [
  {
    id: 'followup',
    title: 'Professional Follow-up',
    subject: 'Following up on our recent discussion regarding [Topic]',
    body: `Hi [Name],

I wanted to quickly follow up on our previous conversation regarding [Topic]. 

Could you please let me know if you have had a chance to review the details we discussed? I would be glad to hop on a brief call if any clarification is needed.

Looking forward to your thoughts.

Best regards,
[My Name]`,
  },
  {
    id: 'bug',
    title: 'Bug / Incident Report',
    subject: '[Incident Alert] Unhandled exception observed in [Component]',
    body: `Hi Engineering Team,

We observed an issue in the [Component] module during routine testing today.

• Expected Behavior: [What should have happened]
• Actual Behavior: [What went wrong or error code]
• Reproduction Steps:
  1. Open [Module]
  2. Perform [Action]
  3. Observe crash/warning

Please let us know if additional crash dumps or diagnostic logs are required to investigate.

Regards,
[My Name]`,
  },
  {
    id: 'resignation',
    title: 'Formal Resignation Notice',
    subject: 'Notice of Resignation — [My Name]',
    body: `Dear [Manager Name],

Please accept this letter as formal notification that I am resigning from my position as [Job Title] at [Company Name]. My last day of employment will be [Last Date].

I want to express my sincere appreciation for the opportunities I have had during my time with the team. I have truly enjoyed working with everyone and am grateful for the support provided throughout my tenure.

I am committed to making this transition as smooth as possible and will assist in handing over all active responsibilities.

Sincerely,
[My Name]`,
  },
  {
    id: 'ooo',
    title: 'Out of Office (OOO) Notice',
    subject: 'Out of Office: [My Name] — [Start Date] to [End Date]',
    body: `Hello,

Thank you for reaching out. I am currently out of the office with limited access to email from [Start Date] through [End Date].

For any urgent matters requiring immediate assistance, please reach out to [Colleague Name] at [Colleague Email]. Otherwise, I will respond to your message promptly upon my return.

Warm regards,
[My Name]`,
  },
];

const DICTIONARY = new Set([
  'the', 'quick', 'brown', 'fox', 'jumps', 'over', 'lazy', 'dog', 'toolstrum', 'offline',
  'application', 'developer', 'browser', 'secure', 'privacy', 'telemetry', 'cryptography',
  'system', 'algorithm', 'function', 'software', 'update', 'computer', 'memory', 'network',
  'client', 'server', 'database', 'engineering', 'document', 'image', 'video', 'audio',
  'convert', 'format', 'minify', 'validate', 'editor', 'workspace', 'production', 'version'
]);

export const WritingAssistantPanel: React.FC<WritingAssistantPanelProps> = ({
  defaultSubTool = 'grammar',
}) => {
  const [activeTab, setActiveTab] = useState<'grammar' | 'spell' | 'email'>(defaultSubTool);
  const [text, setText] = useState<string>(SAMPLE_GRAMMAR_TEXT);
  const [copied, setCopied] = useState(false);

  // Email State
  const [selectedTemplate, setSelectedTemplate] = useState(EMAIL_TEMPLATES[0].id);
  const [emailSubject, setEmailSubject] = useState(EMAIL_TEMPLATES[0].subject);
  const [emailBody, setEmailBody] = useState(EMAIL_TEMPLATES[0].body);

  // 1. Grammar & Style Issues Analysis
  const grammarIssues: GrammarIssue[] = useMemo(() => {
    return analyzeGrammarAndStyle(text);
  }, [text]);

  // 2. Spell Checker Analysis
  const spellingIssues = useMemo(() => {
    const words = text.match(/\b[A-Za-z]+\b/g) || [];
    const unknown: { word: string; count: number }[] = [];
    const seen = new Set<string>();

    for (const w of words) {
      const lower = w.toLowerCase();
      if (!DICTIONARY.has(lower) && !seen.has(lower) && lower.length > 3) {
        seen.add(lower);
        unknown.push({ word: w, count: 1 });
      }
    }
    return unknown;
  }, [text]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyTemplate = (tmplId: string) => {
    const tmpl = EMAIL_TEMPLATES.find((t) => t.id === tmplId);
    if (tmpl) {
      setSelectedTemplate(tmplId);
      setEmailSubject(tmpl.subject);
      setEmailBody(tmpl.body);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Wand2 className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Writing Assistant & Communication Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grammar & passive voice linter, offline spell checker, and structured corporate email draft builder.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('grammar')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'grammar'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Grammar & Style Linter
          </button>
          <button
            onClick={() => setActiveTab('spell')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'spell'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Spell Checker
          </button>
          <button
            onClick={() => setActiveTab('email')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'email'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Email Draft Assistant
          </button>
        </div>
      </div>

      {/* 1. GRAMMAR & STYLE LINTER */}
      {activeTab === 'grammar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <label className="font-semibold uppercase tracking-wider">Document Text</label>
              <button
                onClick={() => handleCopy(text)}
                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                Copy
              </button>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={14}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-sans leading-relaxed focus:outline-none focus:border-orange-500 shadow-sm"
            />
          </div>

          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Detected Style Issues ({grammarIssues.length})
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto">
              {grammarIssues.length === 0 ? (
                <div className="p-6 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-center">
                  <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                    No stylistic issues detected!
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                    Your prose is concise and active without redundant filler phrases.
                  </p>
                </div>
              ) : (
                grammarIssues.map((issue, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                          issue.type === 'passive'
                            ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                            : issue.type === 'wordy'
                            ? 'bg-sky-500/10 text-sky-600 border border-sky-500/20'
                            : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                        }`}
                      >
                        {issue.type}
                      </span>
                      <span className="font-mono text-slate-500 font-medium">"{issue.original}"</span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-400 text-xs">{issue.message}</p>

                    {issue.suggestion && (
                      <div className="pt-1 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                          Suggestion: <strong className="text-emerald-600 font-mono">{issue.suggestion}</strong>
                        </span>
                        <button
                          onClick={() => {
                            setText(text.replace(issue.original, issue.suggestion!));
                          }}
                          className="px-2 py-0.5 rounded bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500 hover:text-white text-[11px] font-medium transition-colors"
                        >
                          Replace
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. SPELL CHECKER */}
      {activeTab === 'spell' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Document to Spellcheck
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-sans leading-relaxed focus:outline-none focus:border-orange-500 shadow-sm"
              />
            </div>

            <div className="lg:col-span-4 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Unrecognized Tokens ({spellingIssues.length})
              </span>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 max-h-[300px] overflow-y-auto">
                {spellingIssues.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center italic">
                    All words recognized in offline dictionary.
                  </p>
                ) : (
                  spellingIssues.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                    >
                      <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold">{item.word}</span>
                      <span className="text-[10px] text-slate-400">Unrecognized</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. EMAIL DRAFT ASSISTANT */}
      {activeTab === 'email' && (
        <div className="space-y-4">
          {/* Preset Buttons */}
          <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Templates:</span>
            {EMAIL_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleApplyTemplate(tmpl.id)}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  selectedTemplate === tmpl.id
                    ? 'bg-orange-500 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tmpl.title}
              </button>
            ))}
          </div>

          {/* Email Form */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Subject Line
              </label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:border-orange-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-1">
                Email Body
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={10}
                className="w-full p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono leading-relaxed focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href={`mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`}
                className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Open in Email Client
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(`${emailSubject}\n\n${emailBody}`)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  Copy Full Email
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
