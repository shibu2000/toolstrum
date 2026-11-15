import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Briefcase,
  Languages,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  Sparkles,
  FileText,
  User,
  CheckSquare,
} from 'lucide-react';
import { transliterateBanglishToBengali } from './textHelpers';

interface DocumentTemplatesPanelProps {
  defaultSubTool?: 'meeting' | 'resume' | 'bengali';
}

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  deadline: string;
}

interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  bullets: string;
}

export const DocumentTemplatesPanel: React.FC<DocumentTemplatesPanelProps> = ({
  defaultSubTool = 'meeting',
}) => {
  const [activeTab, setActiveTab] = useState<'meeting' | 'resume' | 'bengali'>(defaultSubTool);
  const [copied, setCopied] = useState(false);

  // 1. Meeting Notes State
  const [meetingTitle, setMeetingTitle] = useState('Toolstrum Sprint Planning & Architecture Review');
  const [meetingDate, setMeetingDate] = useState('2026-11-15');
  const [attendees, setAttendees] = useState('Alex Mercer, Sarah Chen, David Ross, Priya Sharma');
  const [agenda, setAgenda] = useState('1. Review offline security posture\n2. Consolidate desktop & mobile tool parity\n3. Verify zero-telemetry client bundles');
  const [decisions, setDecisions] = useState('• All cryptographic functions will execute strictly in browser WebCrypto / React Native subtle crypto.\n• Zero telemetry guarantees will be enforced with strict Content Security Policies.');
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    { id: '1', task: 'Finalize Text Studio test coverage in Bun', assignee: 'Alex', deadline: 'Today' },
    { id: '2', task: 'Review mobile bundle size optimizations', assignee: 'Sarah', deadline: 'Tomorrow' },
    { id: '3', task: 'Audit offline worker threads', assignee: 'David', deadline: 'Nov 18' },
  ]);

  // 2. Resume Formatter State
  const [resumeName, setResumeName] = useState('Alex Mercer');
  const [resumeTitle, setResumeTitle] = useState('Principal Software Architect');
  const [resumeEmail, setResumeEmail] = useState('alex.mercer@example.com');
  const [resumePhone, setResumePhone] = useState('+1 (415) 555-0199');
  const [resumeLocation, setResumeLocation] = useState('San Francisco, CA');
  const [resumeSummary, setResumeSummary] = useState(
    'Systems-oriented Software Engineer with 8+ years experience designing zero-trust client architectures, offline-first applications, and high-performance WebAssembly tooling.'
  );
  const [skills, setSkills] = useState('TypeScript, React, React Native, Rust, WebAssembly, Cryptography, Vite, Bun, Tailwind CSS');
  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      id: '1',
      company: 'Toolstrum Offline Systems',
      role: 'Lead Architect',
      period: '2023 – Present',
      bullets: '• Architected 100% offline client-side productivity suite covering 500+ utilities.\n• Reduced application launch latency by 68% using zero-dependency tree-shakeable modules.',
    },
    {
      id: '2',
      company: 'Apex Cloud & Security',
      role: 'Senior Systems Engineer',
      period: '2019 – 2023',
      bullets: '• Engineered high-throughput cryptographic verification microservices.\n• Led privacy audits and eliminated third-party tracker vulnerabilities across customer endpoints.',
    },
  ]);

  // 3. Bengali Helper State
  const [banglishInput, setBanglishInput] = useState('aami toolstrum bhalo bhabe bebohar korchi. aapni kemon aachen? dhonnobad!');

  // Computed Meeting Notes Markdown
  const formattedMeetingNotes = useMemo(() => {
    return [
      `# Meeting Notes: ${meetingTitle}`,
      `**Date:** ${meetingDate}`,
      `**Attendees:** ${attendees}`,
      '',
      '## Agenda',
      agenda,
      '',
      '## Key Decisions & Notes',
      decisions,
      '',
      '## Action Items',
      actionItems.length === 0
        ? '_None assigned_'
        : actionItems
            .map(
              (item, idx) =>
                `${idx + 1}. [ ] **${item.task}** — Assignee: @${item.assignee || 'Unassigned'} (Due: ${item.deadline || 'TBD'})`
            )
            .join('\n'),
    ].join('\n');
  }, [meetingTitle, meetingDate, attendees, agenda, decisions, actionItems]);

  // Computed Resume Text (ATS Clean)
  const formattedResumeText = useMemo(() => {
    return [
      `${resumeName.toUpperCase()}`,
      `${resumeTitle} | ${resumeLocation}`,
      `Email: ${resumeEmail} | Phone: ${resumePhone}`,
      '------------------------------------------------------------',
      'PROFESSIONAL SUMMARY',
      resumeSummary,
      '',
      'CORE SKILLS',
      skills,
      '',
      'PROFESSIONAL EXPERIENCE',
      experiences
        .map(
          (exp) =>
            `${exp.role.toUpperCase()} | ${exp.company} (${exp.period})\n${exp.bullets}`
        )
        .join('\n\n'),
    ].join('\n');
  }, [resumeName, resumeTitle, resumeEmail, resumePhone, resumeLocation, resumeSummary, skills, experiences]);

  // Computed Bengali Transliteration
  const bengaliOutput = useMemo(() => {
    return transliterateBanglishToBengali(banglishInput);
  }, [banglishInput]);

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            {activeTab === 'meeting' ? (
              <Calendar className="w-5 h-5" />
            ) : activeTab === 'resume' ? (
              <Briefcase className="w-5 h-5" />
            ) : (
              <Languages className="w-5 h-5" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Structured Templates & Transliteration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Meeting notes formatter with action items, ATS-friendly plain text resume builder, and Bengali phonetic transliterator.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('meeting')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'meeting'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Meeting Notes Formatter
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'resume'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Resume Formatter (ATS)
          </button>
          <button
            onClick={() => setActiveTab('bengali')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'bengali'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Bengali-English Helper
          </button>
        </div>
      </div>

      {/* 1. MEETING NOTES FORMATTER */}
      {activeTab === 'meeting' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                  Meeting Title
                </label>
                <input
                  type="text"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                    Attendees
                  </label>
                  <input
                    type="text"
                    value={attendees}
                    onChange={(e) => setAttendees(e.target.value)}
                    placeholder="Comma-separated names"
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                  Agenda Items
                </label>
                <textarea
                  value={agenda}
                  onChange={(e) => setAgenda(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                  Discussion Points & Decisions
                </label>
                <textarea
                  value={decisions}
                  onChange={(e) => setDecisions(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>

              {/* Action Items Builder */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-semibold text-slate-500 uppercase text-[11px]">
                    Action Items ({actionItems.length})
                  </label>
                  <button
                    onClick={() =>
                      setActionItems([
                        ...actionItems,
                        { id: Date.now().toString(), task: '', assignee: '', deadline: '' },
                      ])
                    }
                    className="text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Plus className="w-3 h-3" /> Add Item
                  </button>
                </div>

                <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                  {actionItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.task}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx].task = e.target.value;
                          setActionItems(updated);
                        }}
                        placeholder="Task description"
                        className="flex-1 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                      <input
                        type="text"
                        value={item.assignee}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx].assignee = e.target.value;
                          setActionItems(updated);
                        }}
                        placeholder="Assignee"
                        className="w-24 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                      <input
                        type="text"
                        value={item.deadline}
                        onChange={(e) => {
                          const updated = [...actionItems];
                          updated[idx].deadline = e.target.value;
                          setActionItems(updated);
                        }}
                        placeholder="Deadline"
                        className="w-20 p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                      />
                      <button
                        onClick={() => setActionItems(actionItems.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Formatted Markdown Notes
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(formattedMeetingNotes)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy
                </button>
                <button
                  onClick={() => handleDownload(formattedMeetingNotes, 'meeting-notes.md')}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={formattedMeetingNotes}
              rows={18}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono select-all focus:outline-none shadow-sm"
            />
          </div>
        </div>
      )}

      {/* 2. RESUME FORMATTER (ATS) */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                    Target Title
                  </label>
                  <input
                    type="text"
                    value={resumeTitle}
                    onChange={(e) => setResumeTitle(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={resumeEmail}
                    onChange={(e) => setResumeEmail(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={resumePhone}
                    onChange={(e) => setResumePhone(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={resumeLocation}
                    onChange={(e) => setResumeLocation(e.target.value)}
                    className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                  Professional Summary
                </label>
                <textarea
                  value={resumeSummary}
                  onChange={(e) => setResumeSummary(e.target.value)}
                  rows={3}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-sans leading-relaxed"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 uppercase text-[11px] block mb-1">
                  Core Skills
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Right Output */}
          <div className="lg:col-span-6 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                ATS-Optimized Resume Text
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(formattedResumeText)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Plain Text
                </button>
                <button
                  onClick={() => handleDownload(formattedResumeText, 'resume.txt')}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Download
                </button>
              </div>
            </div>

            <textarea
              readOnly
              value={formattedResumeText}
              rows={18}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-xs font-mono select-all focus:outline-none shadow-sm leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* 3. BENGALI HELPER */}
      {activeTab === 'bengali' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Romanized Bengali ('Banglish') Input
              </label>
              <textarea
                value={banglishInput}
                onChange={(e) => setBanglishInput(e.target.value)}
                rows={10}
                placeholder="Type in English phonetics, e.g. aami bhalo aachi, dhonnobad..."
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-sans focus:outline-none focus:border-orange-500 shadow-sm"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Bengali Script Transliteration (বাংলা)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(bengaliOutput)}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy বাংলা
                  </button>
                  <button
                    onClick={() => handleDownload(bengaliOutput, 'bengali-transliteration.txt')}
                    className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>

              <textarea
                readOnly
                value={bengaliOutput}
                rows={10}
                className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-lg font-sans select-all focus:outline-none shadow-sm leading-relaxed"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
