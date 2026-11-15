import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Briefcase,
  Mail,
  Users,
  GraduationCap,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Send,
} from 'lucide-react';
import {
  rewriteTextTone,
  buildResumeBulletPoints,
  generateEmailDraft,
  parseMeetingTranscript,
  generateStudyFlashcards,
  MeetingSummary,
  Flashcard,
} from './aiHelpers';

interface AiWritingSummarizerPanelProps {
  defaultMode?: 'writing' | 'resume' | 'email' | 'meeting' | 'study';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const AiWritingSummarizerPanel: React.FC<AiWritingSummarizerPanelProps> = ({
  defaultMode = 'writing',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'writing' | 'resume' | 'email' | 'meeting' | 'study'>(
    defaultMode
  );

  // 404: Tone Rewriting
  const [writingInput, setWritingInput] = useState(
    `Hey guys, thanks for the meeting. In order to get this done asap, we need to check the files because of the bug. Can't wait to see the results.`
  );
  const [selectedTone, setSelectedTone] = useState<'professional' | 'concise' | 'friendly' | 'academic'>('professional');
  const rewrittenOutput = rewriteTextTone(writingInput, selectedTone);

  // 409: Resume Bullet Points
  const [resumeRole, setResumeRole] = useState('Senior Full Stack Engineer');
  const [resumeRawNotes, setResumeRawNotes] = useState(
    `Built the new offline payment processing pipeline. Reduced latency for users and fixed memory leaks.`
  );
  const [resumeBullets, setResumeBullets] = useState<string[]>(() =>
    buildResumeBulletPoints(resumeRole, resumeRawNotes)
  );

  useEffect(() => {
    setResumeBullets(buildResumeBulletPoints(resumeRole, resumeRawNotes));
  }, [resumeRole, resumeRawNotes]);

  // 411: Email Assistant
  const [emailPurpose, setEmailPurpose] = useState('Q4 Project Launch & Milestones');
  const [emailRecipient, setEmailRecipient] = useState('Engineering Team');
  const [emailPointsText, setEmailPointsText] = useState(
    `Completed offline zero-server encryption architecture\nPassed dual-platform test gates with 100% pass rate\nScheduled production rollout for next Tuesday`
  );
  const emailDraft = generateEmailDraft(
    emailPurpose,
    emailRecipient,
    emailPointsText.split('\n').filter(Boolean)
  );

  // 412: Meeting Summarizer
  const [meetingTranscript, setMeetingTranscript] = useState(
    `Alice: Let's discuss the offline sync engine for mobile.\nBob: We decided to use local SQLite with WebCrypto encryption.\nCharlie: I will write the unit tests for the HMAC validator by Friday.\nAlice: Approved the deployment timeline for version 2.0.`
  );
  const [meetingSummary, setMeetingSummary] = useState<MeetingSummary>(() =>
    parseMeetingTranscript(meetingTranscript)
  );

  useEffect(() => {
    setMeetingSummary(parseMeetingTranscript(meetingTranscript));
  }, [meetingTranscript]);

  // 413: Study Assistant (Flashcards)
  const [studyNotes, setStudyNotes] = useState(
    `DNS is the domain name system translating human hostnames to IP addresses.
HTTPS is hypertext transfer protocol secure utilizing TLS encryption.
AES is advanced encryption standard providing symmetric block cipher security.`
  );
  const [flashcards, setFlashcards] = useState<Flashcard[]>(() =>
    generateStudyFlashcards(studyNotes)
  );

  useEffect(() => {
    setFlashcards(generateStudyFlashcards(studyNotes));
  }, [studyNotes]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'writing', label: 'Tone Rewriter (#404)', icon: PenTool },
          { id: 'resume', label: 'Resume Builder (#409)', icon: Briefcase },
          { id: 'email', label: 'Email Assistant (#411)', icon: Mail },
          { id: 'meeting', label: 'Meeting Summarizer (#412)', icon: Users },
          { id: 'study', label: 'Study Flashcards (#413)', icon: GraduationCap },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 404: Tone Rewriter */}
      {activeTab === 'writing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Draft Text</h3>
            <textarea
              value={writingInput}
              onChange={(e) => setWritingInput(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
            />

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1.5">Select Desired Tone</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['professional', 'concise', 'friendly', 'academic'] as const).map((tone) => (
                  <button
                    key={tone}
                    onClick={() => setSelectedTone(tone)}
                    className={`py-2 rounded-xl text-xs font-bold capitalize cursor-pointer transition-colors ${
                      selectedTone === tone
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 capitalize">
                {selectedTone} Rewritten Version
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(rewrittenOutput)}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              )}
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed text-slate-900 dark:text-white whitespace-pre-wrap">
              {rewrittenOutput}
            </pre>
          </div>
        </div>
      )}

      {/* 409: Resume Builder */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role & Experience Notes</h3>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Target Job Title</label>
              <input
                type="text"
                value={resumeRole}
                onChange={(e) => setResumeRole(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Raw Achievements or Responsibilities</label>
              <textarea
                value={resumeRawNotes}
                onChange={(e) => setResumeRawNotes(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Action-Oriented Resume Bullets
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(resumeBullets.join('\n'))}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy All</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              {resumeBullets.map((bullet, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {bullet}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 411: Email Assistant */}
      {activeTab === 'email' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Parameters</h3>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Purpose / Topic</label>
              <input
                type="text"
                value={emailPurpose}
                onChange={(e) => setEmailPurpose(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Recipient Name / Team</label>
              <input
                type="text"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Bullet Points to Cover</label>
              <textarea
                value={emailPointsText}
                onChange={(e) => setEmailPointsText(e.target.value)}
                rows={5}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Polished Email Draft
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(emailDraft)}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Draft</span>
                </button>
              )}
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs overflow-x-auto max-h-[320px] leading-relaxed text-slate-900 dark:text-white whitespace-pre-wrap">
              {emailDraft}
            </pre>
          </div>
        </div>
      )}

      {/* 412: Meeting Summarizer */}
      {activeTab === 'meeting' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Raw Meeting Dialogue Transcript</h3>
            <textarea
              value={meetingTranscript}
              onChange={(e) => setMeetingTranscript(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Synthesized Minutes & Actions
            </span>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                <span className="font-bold text-purple-600 uppercase text-[10px] block">Agenda & Topics:</span>
                {meetingSummary.agenda.map((a, i) => (
                  <p key={i} className="text-slate-700 dark:text-slate-300">• {a}</p>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                <span className="font-bold text-emerald-600 uppercase text-[10px] block">Decisions Made:</span>
                {meetingSummary.decisions.map((d, i) => (
                  <p key={i} className="text-slate-700 dark:text-slate-300 font-medium">✓ {d}</p>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                <span className="font-bold text-amber-600 uppercase text-[10px] block">Assigned Action Items:</span>
                {meetingSummary.actionItems.map((ai, i) => (
                  <p key={i} className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">• {ai}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 413: Study Flashcards */}
      {activeTab === 'study' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Study Material or Lecture Notes</h3>
            <textarea
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
              Generated Active Recall Flashcards ({flashcards.length})
            </span>

            <div className="space-y-3 max-h-[340px] overflow-y-auto">
              {flashcards.map((card, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-xs space-y-1.5">
                  <span className="font-bold text-purple-600 block">Q: {card.question}</span>
                  <p className="text-slate-700 dark:text-slate-300">A: {card.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
