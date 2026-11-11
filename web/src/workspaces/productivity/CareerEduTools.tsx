import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Briefcase,
  GraduationCap,
  CreditCard,
  Printer,
  Copy,
  Check,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Download,
  BookOpen,
  Award,
  HelpCircle,
  Shuffle,
  FileText,
  Upload,
  RefreshCw,
  CheckCircle,
  XCircle,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 427 — BUSINESS CARD MAKER
// ========================================================
export const BusinessCardMakerTool: React.FC<ToolProps> = () => {
  const [name, setName] = useState('Alex Morgan');
  const [title, setTitle] = useState('Lead Software Architect');
  const [company, setCompany] = useState('Toolstrum Labs');
  const [email, setEmail] = useState('alex@toolstrum.app');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [cardTheme, setCardTheme] = useState<'slate' | 'indigo' | 'emerald' | 'amber'>('slate');

  const themeStyles = {
    slate: 'from-slate-900 to-slate-800 border-slate-700 text-white',
    indigo: 'from-indigo-950 to-indigo-900 border-indigo-700 text-white',
    emerald: 'from-emerald-950 to-emerald-900 border-emerald-700 text-white',
    amber: 'from-amber-950 to-amber-900 border-amber-700 text-white',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cardholder Details</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Job Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Company / Organization</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Phone</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1.5">Card Theme</label>
          <div className="grid grid-cols-4 gap-2">
            {(['slate', 'indigo', 'emerald', 'amber'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setCardTheme(t)}
                className={`py-2 rounded-xl text-xs font-bold capitalize border ${
                  cardTheme === t
                    ? 'border-pink-500 bg-pink-500/10 text-pink-600 dark:text-pink-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Card Preview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-pink-500/30 shadow-md flex flex-col items-center justify-center space-y-4">
        <div
          className={`w-80 h-48 rounded-2xl bg-gradient-to-br ${themeStyles[cardTheme]} p-6 shadow-xl flex flex-col justify-between border`}
        >
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-pink-400">{company}</span>
            <h4 className="text-lg font-black mt-1">{name}</h4>
            <p className="text-xs text-slate-300">{title}</p>
          </div>

          <div className="text-[11px] font-mono text-slate-400 space-y-0.5">
            <div>{email}</div>
            <div>{phone}</div>
          </div>
        </div>

        <button
          onClick={() => window.print()}
          className="px-6 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        >
          <Printer className="w-4 h-4" /> Print Business Card
        </button>
      </div>
    </div>
  );
};

// ========================================================
// 428 — RESUME PDF MAKER
// ========================================================
export const ResumePdfMakerTool: React.FC<ToolProps> = () => {
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [role, setRole] = useState('Senior Full-Stack Engineer');
  const [summary, setSummary] = useState(
    'Passionate engineer with 7+ years of experience designing scalable distributed web applications, offline PWAs, and high-performance WebAssembly tools.'
  );
  const [skills, setSkills] = useState('React, TypeScript, Node.js, WebCrypto, Rust, Docker, PostgreSQL');

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Resume Preview</h3>
          <p className="text-xs text-slate-500">Edit fields below and print clean PDF</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
        >
          <Printer className="w-4 h-4" /> Print / Save Resume PDF
        </button>
      </div>

      <div className="space-y-4 text-xs">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-slate-500 block mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="font-bold text-slate-500 block mb-1">Professional Headline</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-slate-500 block mb-1">Executive Summary</label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 leading-relaxed text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="font-bold text-slate-500 block mb-1">Core Technical Skills</label>
          <input
            type="text"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 429 — COVER LETTER GENERATOR
// ========================================================
export const CoverLetterGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [recipient, setRecipient] = useState('Hiring Manager');
  const [company, setCompany] = useState('Starlight Innovations');
  const [position, setPosition] = useState('Senior Systems Architect');
  const [applicant, setApplicant] = useState('Sarah Jenkins');

  const letterText = `Dear ${recipient},

I am writing to express my strong interest in the ${position} position at ${company}. With extensive software architecture experience and a proven track record of engineering robust client-side web applications, I am confident in my ability to make an immediate impact on your technical roadmap.

Throughout my career, I have specialized in building privacy-centric offline systems, optimizing high-throughput distributed architectures, and collaborating closely with cross-functional product teams. I admire ${company}'s commitment to user excellence and look forward to the opportunity to contribute to your ongoing engineering initiatives.

Thank you for your time and consideration.

Sincerely,
${applicant}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 text-xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Role & Company</h3>

        <div>
          <label className="font-bold text-slate-500 block mb-1">Company Name</label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="font-bold text-slate-500 block mb-1">Target Position</label>
          <input
            type="text"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="font-bold text-slate-500 block mb-1">Applicant Name</label>
          <input
            type="text"
            value={applicant}
            onChange={(e) => setApplicant(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-pink-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
            Formatted Cover Letter
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(letterText)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Letter</span>
            </button>
          )}
        </div>

        <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-sans text-xs overflow-x-auto max-h-[300px] leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
          {letterText}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 430 — TIMETABLE MAKER
// ========================================================
export const TimetableMakerTool: React.FC<ToolProps> = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const times = ['09:00', '11:00', '13:00', '15:00'];
  const [schedule, setSchedule] = useState<Record<string, string>>({
    'Mon-09:00': 'Algorithms & Data Structures',
    'Tue-11:00': 'Database Architecture',
    'Wed-13:00': 'UI/UX Design Lab',
    'Thu-09:00': 'Distributed Systems',
    'Fri-15:00': 'Project Showcase',
  });
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [cellText, setCellText] = useState('');

  const handleCellClick = (key: string) => {
    setSelectedCell(key);
    setCellText(schedule[key] || '');
  };

  const handleSaveCell = () => {
    if (!selectedCell) return;
    setSchedule((prev) => ({
      ...prev,
      [selectedCell]: cellText.trim(),
    }));
    setSelectedCell(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Schedule Grid</h3>
          <p className="text-xs text-slate-500">Click any time cell below to edit or assign classes/events</p>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Timetable
        </button>
      </div>

      {selectedCell && (
        <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-500/40 flex items-center gap-2 animate-in zoom-in-95">
          <span className="text-xs font-bold text-pink-600 dark:text-pink-400 shrink-0">
            Edit {selectedCell}:
          </span>
          <input
            type="text"
            value={cellText}
            onChange={(e) => setCellText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSaveCell()}
            placeholder="Class or event name..."
            className="flex-1 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
            autoFocus
          />
          <button
            onClick={handleSaveCell}
            className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Save
          </button>
          <button
            onClick={() => setSelectedCell(null)}
            className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-700">
              <th className="p-2.5 font-bold text-slate-400">Time</th>
              {days.map((d) => (
                <th key={d} className="p-2.5 font-bold text-slate-900 dark:text-white uppercase">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {times.map((t) => (
              <tr key={t} className="border-b border-slate-100 dark:border-slate-800">
                <td className="p-2.5 font-mono font-bold text-slate-400">{t}</td>
                {days.map((d) => {
                  const key = `${d}-${t}`;
                  const hasEntry = !!schedule[key];
                  return (
                    <td key={d} className="p-2">
                      <div
                        onClick={() => handleCellClick(key)}
                        className={`p-2.5 rounded-xl min-h-[48px] flex items-center text-[11px] font-semibold cursor-pointer transition-all border ${
                          hasEntry
                            ? 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/30 hover:border-pink-500'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-dashed border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {schedule[key] || '+ Click to Add'}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ========================================================
// 431 — FLASHCARD MAKER & GENERATOR
// ========================================================
export interface Flashcard {
  id: string;
  q: string;
  a: string;
  mastered?: boolean;
}

const DEFAULT_FLASHCARDS: Flashcard[] = [
  { id: '1', q: 'What is a Pure Function in programming?', a: 'A function that always returns the same output for the same input and has no side effects.' },
  { id: '2', q: 'What does ACID stand for in databases?', a: 'Atomicity, Consistency, Isolation, Durability.' },
  { id: '3', q: 'What is the time complexity of binary search?', a: 'O(log n) logarithmic time complexity.' },
];

const PRESET_DECKS: Record<string, { q: string; a: string }[]> = {
  webdev: [
    { q: 'What is a Pure Function in functional programming?', a: 'A function that always returns the same output for identical inputs and causes zero side effects.' },
    { q: 'What is the purpose of the virtual DOM in React?', a: 'An in-memory lightweight representation of the actual DOM used for high-performance batch diffing and updates.' },
    { q: 'What does ACID stand for in database transactions?', a: 'Atomicity, Consistency, Isolation, and Durability.' },
    { q: 'What is the difference between synchronous and asynchronous execution?', a: 'Synchronous blocks code execution until completion; asynchronous runs in the background and notifies via callbacks/promises.' },
    { q: 'What is the HTTP 403 status code?', a: 'Forbidden — the server understood the request but refuses to authorize it.' },
  ],
  science: [
    { q: 'What is the speed of light in a vacuum?', a: 'Approximately 299,792,458 meters per second (~300,000 km/s).' },
    { q: 'What organelle produces ATP energy in eukaryotic cells?', a: 'The Mitochondrion (the powerhouse of the cell).' },
    { q: 'What is the chemical formula for ozone?', a: 'O3 (trioxygen).' },
    { q: 'What is Newton\'s First Law of Motion?', a: 'An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external net force (Inertia).' },
  ],
  capitals: [
    { q: 'What is the capital city of Australia?', a: 'Canberra (often mistaken for Sydney).' },
    { q: 'What is the capital city of Canada?', a: 'Ottawa.' },
    { q: 'What is the capital city of Japan?', a: 'Tokyo.' },
    { q: 'What is the capital city of Brazil?', a: 'Brasília.' },
  ],
};

export const FlashcardMakerTool: React.FC<ToolProps> = () => {
  const [cards, setCards] = useState<Flashcard[]>(DEFAULT_FLASHCARDS);
  const [activeMode, setActiveMode] = useState<'study' | 'builder' | 'bulk'>('study');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Builder states
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Bulk Generator state
  const [bulkModeOption, setBulkModeOption] = useState<'replace' | 'append'>('replace');
  const [bulkInput, setBulkInput] = useState(
    "HTTP 200 : OK (Request succeeded)\nHTTP 301 : Moved Permanently\nHTTP 400 : Bad Request\nHTTP 404 : Not Found\nHTTP 500 : Internal Server Error"
  );

  const cur = cards[currentIndex] || cards[0];

  const handleNext = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    if (cards.length === 0) return;
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleAddCard = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const newCard: Flashcard = {
      id: Date.now().toString(),
      q: newQuestion.trim(),
      a: newAnswer.trim(),
    };
    setCards([...cards, newCard]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDeleteCard = (id: string) => {
    const updated = cards.filter((c) => c.id !== id);
    setCards(updated);
    if (currentIndex >= updated.length) {
      setCurrentIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleClearAllCards = () => {
    setCards([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setActiveMode('builder');
  };

  const handleResetToDefaults = () => {
    setCards(DEFAULT_FLASHCARDS);
    setCurrentIndex(0);
    setIsFlipped(false);
    setActiveMode('study');
  };

  const handleBulkGenerate = () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput.split('\n').filter((l) => l.trim().length > 0);
    const generated: Flashcard[] = [];

    for (const line of lines) {
      const splitChar = line.includes(':')
        ? ':'
        : line.includes('?')
        ? '?'
        : line.includes('-')
        ? '-'
        : '\t';

      const parts = line.split(splitChar);
      if (parts.length >= 2) {
        generated.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
          q: parts[0].trim(),
          a: parts.slice(1).join(splitChar).trim(),
        });
      }
    }

    if (generated.length === 0) {
      alert('Could not parse cards. Use format "Question : Answer" (one per line).');
      return;
    }

    if (bulkModeOption === 'replace') {
      setCards(generated);
    } else {
      setCards([...cards, ...generated]);
    }

    setActiveMode('study');
    setCurrentIndex(0);
    setIsFlipped(false);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
  };

  const handleLoadPreset = (key: string) => {
    const preset = PRESET_DECKS[key];
    if (!preset) return;
    const newDeck = preset.map((p, i) => ({
      id: `${key}-${i}`,
      q: p.q,
      a: p.a,
    }));
    setCards(newDeck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setActiveMode('study');
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
  };

  const handleMarkMastered = () => {
    if (!cur) return;
    setCards(cards.map((c) => (c.id === cur.id ? { ...c, mastered: !c.mastered } : c)));
    handleNext();
  };

  const handleShuffle = () => {
    if (cards.length === 0) return;
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleExportJson = () => {
    const jsonStr = JSON.stringify(cards, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards_deck.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const csvContent = cards.map((c) => `"${c.q.replace(/"/g, '""')}","${c.a.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards_deck.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const masteredCount = cards.filter((c) => c.mastered).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Mode Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveMode('study')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'study'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Study Deck ({cards.length})
          </button>
          <button
            onClick={() => setActiveMode('builder')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'builder'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            + Create Cards
          </button>
          <button
            onClick={() => setActiveMode('bulk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMode === 'bulk'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ⚡ Bulk Text Generator
          </button>
        </div>

        <div className="flex items-center gap-1.5 pr-1">
          {cards.length > 0 && (
            <button
              onClick={handleClearAllCards}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Remove all sample cards to start blank"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove All Cards
            </button>
          )}
          <button
            onClick={handleExportCsv}
            disabled={cards.length === 0}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Export CSV (Anki Compatible)"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={() => window.print()}
            disabled={cards.length === 0}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Print Flashcards"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* Preset Generative Decks & Reset Controls */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Presets:
          </span>
          <button
            onClick={() => handleLoadPreset('webdev')}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-pink-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer shrink-0 transition-colors"
          >
            Web Dev & CS
          </button>
          <button
            onClick={() => handleLoadPreset('science')}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-pink-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer shrink-0 transition-colors"
          >
            General Science
          </button>
          <button
            onClick={() => handleLoadPreset('capitals')}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-pink-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer shrink-0 transition-colors"
          >
            World Geography
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearAllCards}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Remove all sample cards to start blank"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Samples (Start Blank)
          </button>
          <button
            onClick={handleResetToDefaults}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer shrink-0"
            title="Reload default sample cards"
          >
            Reload Samples
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. STUDY MODE */}
      {/* ======================================================== */}
      {activeMode === 'study' && (
        <>
          {cards.length > 0 && cur ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-pink-500" />
                  <span>Card {currentIndex + 1} of {cards.length}</span>
                </span>
                <span className="text-emerald-500 font-bold">
                  {masteredCount} of {cards.length} Mastered
                </span>
              </div>

              {/* Interactive Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[220px] rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 shadow-md bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-slate-500/10 border-2 border-pink-500/30 select-none hover:border-pink-500"
              >
                <span className="text-[10px] uppercase font-bold text-pink-500 tracking-wider mb-2">
                  {isFlipped ? '💡 Answer (Click to Flip back)' : '❓ Question (Click to Reveal Answer)'}
                </span>
                <p className="text-lg font-black text-slate-900 dark:text-white leading-relaxed">
                  {isFlipped ? cur.a : cur.q}
                </p>
              </div>

              {/* Navigation & Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handlePrev}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Previous Card"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCw className="w-4 h-4" /> Flip
                </button>

                <button
                  onClick={handleMarkMastered}
                  className={`px-5 py-3 rounded-2xl font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-all ${
                    cur.mastered
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'bg-pink-500 text-white hover:bg-pink-600'
                  }`}
                >
                  <Check className="w-4 h-4" /> {cur.mastered ? 'Mastered!' : 'Mark Mastered'}
                </button>

                <button
                  onClick={handleShuffle}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Shuffle Cards"
                >
                  <Shuffle className="w-4 h-4" />
                </button>

                <button
                  onClick={handleNext}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  title="Next Card"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-500 mx-auto flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Your Flashcard Deck is Empty
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All cards have been cleared. You have a fresh slate to create your custom cards or auto-generate from text.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setActiveMode('builder')}
                  className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  + Add First Card
                </button>
                <button
                  onClick={() => setActiveMode('bulk')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  ⚡ Bulk Generate from Text
                </button>
                <button
                  onClick={handleResetToDefaults}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Load Sample Deck
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* 2. CARD CREATOR / BUILDER MODE */}
      {/* ======================================================== */}
      {activeMode === 'builder' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-pink-500" />
              <span>Add New Flashcard</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                Question / Prompt (Front Side)
              </label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. What is the time complexity of QuickSort?"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                Answer / Definition (Back Side)
              </label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                rows={3}
                placeholder="e.g. O(n log n) average case, O(n^2) worst case."
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleAddCard}
              disabled={!newQuestion.trim() || !newAnswer.trim()}
              className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card to Deck</span>
            </button>
          </div>

          {/* Existing Deck Manager */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Manage Deck ({cards.length} Cards)
              </h4>
              {cards.length > 0 && (
                <button
                  onClick={handleClearAllCards}
                  className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                >
                  Clear All Cards
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
              {cards.map((c, i) => (
                <div key={c.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="truncate mr-3">
                    <span className="font-bold text-slate-900 dark:text-white mr-2">#{i + 1}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{c.q}</span>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.a}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteCard(c.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0 transition-colors"
                    title="Delete card"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {cards.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No cards in this deck. Add a card above to begin!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. BULK GENERATOR MODE */}
      {/* ======================================================== */}
      {activeMode === 'bulk' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Bulk Flashcard Generator from Raw Text</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Paste questions and answers separated by a colon (<code>:</code>) or dash (<code>-</code>). Toolstrum will automatically parse and generate flashcards instantly.
            </p>
          </div>

          <div className="flex gap-2 text-xs font-bold">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="bulkMode"
                checked={bulkModeOption === 'replace'}
                onChange={() => setBulkModeOption('replace')}
                className="accent-pink-500"
              />
              <span>Replace entire deck (Fresh Start)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 ml-4">
              <input
                type="radio"
                name="bulkMode"
                checked={bulkModeOption === 'append'}
                onChange={() => setBulkModeOption('append')}
                className="accent-pink-500"
              />
              <span>Append to existing cards</span>
            </label>
          </div>

          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            rows={8}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
            placeholder="Term : Definition (One card per line)..."
          />

          <button
            onClick={handleBulkGenerate}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Flashcards from Text</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 432 — QUIZ GENERATOR
// ========================================================
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

const DEFAULT_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: '1',
    question: 'Which HTTP status code indicates a permanent redirect?',
    options: ['200 OK', '301 Moved Permanently', '404 Not Found', '502 Bad Gateway'],
    correct: 1,
    explanation: 'HTTP 301 indicates that the resource has been permanently moved to a new URL.',
  },
  {
    id: '2',
    question: 'Which browser Web API is used for high-performance client-side cryptographic hashing?',
    options: ['WebRTC', 'Web Audio API', 'Web Crypto API', 'Canvas 2D API'],
    correct: 2,
    explanation: 'crypto.subtle (Web Crypto API) provides native cryptographic primitives.',
  },
  {
    id: '3',
    question: 'Which CSS unit is relative to the root element font-size?',
    options: ['em', 'rem', 'vh', 'px'],
    correct: 1,
    explanation: 'rem stands for "root em" and scales relative to the html element font-size.',
  },
  {
    id: '4',
    question: 'What is the default execution model of JavaScript in browsers?',
    options: ['Multi-threaded pre-emptive', 'Single-threaded event loop', 'Parallel fork-join', 'Asynchronous co-operative'],
    correct: 1,
    explanation: 'JavaScript runs on a single main thread backed by an event loop with task queues.',
  },
];

const PRESET_QUIZZES: Record<string, QuizQuestion[]> = {
  webdev: DEFAULT_QUIZ_QUESTIONS,
  security: [
    {
      id: 's1',
      question: 'What does TOTP stand for in multi-factor authentication?',
      options: ['Time-Based One-Time Password', 'Tokenized Online Trusted Protocol', 'Transfer Order Time Pointer', 'Temporary Offline Text Phrase'],
      correct: 0,
      explanation: 'RFC 6238 defines TOTP: Time-Based One-Time Password Algorithm.',
    },
    {
      id: 's2',
      question: 'Which cipher mode is recommended for authenticated symmetric encryption?',
      options: ['ECB', 'CBC', 'GCM (Galois/Counter Mode)', 'CFB'],
      correct: 2,
      explanation: 'AES-GCM combines encryption and integrity authentication in a single pass.',
    },
    {
      id: 's3',
      question: 'What is a Salt in password hashing?',
      options: ['A secret server key', 'Random data added to prevent rainbow table attacks', 'A checksum algorithm', 'An SSL certificate'],
      correct: 1,
      explanation: 'A salt ensures identical passwords produce distinct hash digests.',
    },
  ],
};

export const QuizGeneratorTool: React.FC<ToolProps> = () => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_QUIZ_QUESTIONS);
  const [activeTab, setActiveTab] = useState<'play' | 'create' | 'bulk' | 'results'>('play');

  // Quiz play state
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);

  // Manual Question Builder state
  const [qText, setQText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIndex, setCorrectIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  // Bulk Quiz Generator state
  const [bulkModeOption, setBulkModeOption] = useState<'replace' | 'append'>('replace');
  const [bulkQuizText, setBulkQuizText] = useState(
    "Q: What does CSS stand for?\nA) Cascading Style Sheets\nB) Computer System Styles\nC) Creative Style Software\nD) Core Styling Syntax\nAnswer: A\nExplanation: CSS is the style sheet language for HTML.\n\nQ: What is the output of typeof null in JavaScript?\nA) null\nB) undefined\nC) object\nD) string\nAnswer: C\nExplanation: In JavaScript, typeof null returns 'object' due to a legacy bug."
  );

  const q = questions[currentQ] || questions[0];

  const handleSelectOption = (idx: number) => {
    if (answered || !q) return;
    setSelectedOpt(idx);
    setAnswered(true);
    setUserAnswers([...userAnswers, idx]);

    if (idx === q.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQ + 1 < questions.length) {
      setSelectedOpt(null);
      setAnswered(false);
      setCurrentQ((q) => q + 1);
    } else {
      setActiveTab('results');
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQ(0);
    setSelectedOpt(null);
    setScore(0);
    setAnswered(false);
    setUserAnswers([]);
    setActiveTab('play');
  };

  const handleDeleteQuestion = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    if (currentQ >= updated.length) {
      setCurrentQ(Math.max(0, updated.length - 1));
    }
  };

  const handleClearAllQuestions = () => {
    setQuestions([]);
    setCurrentQ(0);
    setSelectedOpt(null);
    setScore(0);
    setAnswered(false);
    setUserAnswers([]);
    setActiveTab('create');
  };

  const handleResetToDefaultQuiz = () => {
    setQuestions(DEFAULT_QUIZ_QUESTIONS);
    handleRestartQuiz();
  };

  const handleAddQuestion = () => {
    if (!qText.trim() || !opt0.trim() || !opt1.trim()) {
      alert('Please enter a question and at least 2 options.');
      return;
    }
    const options = [opt0.trim(), opt1.trim()];
    if (opt2.trim()) options.push(opt2.trim());
    if (opt3.trim()) options.push(opt3.trim());

    const newQ: QuizQuestion = {
      id: Date.now().toString(),
      question: qText.trim(),
      options,
      correct: Math.min(correctIndex, options.length - 1),
      explanation: explanation.trim() || undefined,
    };

    setQuestions([...questions, newQ]);
    setQText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setExplanation('');
    alert('Question added to quiz!');
  };

  const handleBulkGenerateQuiz = () => {
    if (!bulkQuizText.trim()) return;
    const blocks = bulkQuizText.split(/\n\s*\n/).filter((b) => b.trim().length > 0);
    const parsed: QuizQuestion[] = [];

    for (const block of blocks) {
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      let questionStr = '';
      const opts: string[] = [];
      let ansChar = 'A';
      let expStr = '';

      for (const line of lines) {
        if (/^Q:/i.test(line)) {
          questionStr = line.replace(/^Q:\s*/i, '');
        } else if (/^[A-D]\)/i.test(line)) {
          opts.push(line.replace(/^[A-D]\)\s*/i, ''));
        } else if (/^Answer:\s*([A-D])/i.test(line)) {
          const m = line.match(/^Answer:\s*([A-D])/i);
          if (m) ansChar = m[1].toUpperCase();
        } else if (/^Explanation:\s*/i.test(line)) {
          expStr = line.replace(/^Explanation:\s*/i, '');
        }
      }

      if (questionStr && opts.length >= 2) {
        const correctIdx = ansChar.charCodeAt(0) - 65;
        parsed.push({
          id: Date.now().toString() + Math.random().toString(36).substring(2, 6),
          question: questionStr,
          options: opts,
          correct: Math.max(0, Math.min(correctIdx, opts.length - 1)),
          explanation: expStr,
        });
      }
    }

    if (parsed.length === 0) {
      alert('Could not parse questions. Check format: Q: ..., A) ..., B) ..., Answer: A');
      return;
    }

    if (bulkModeOption === 'replace') {
      setQuestions(parsed);
    } else {
      setQuestions([...questions, ...parsed]);
    }

    handleRestartQuiz();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleLoadPresetQuiz = (key: string) => {
    const preset = PRESET_QUIZZES[key];
    if (!preset) return;
    setQuestions(preset);
    handleRestartQuiz();
  };

  const handleExportQuizJson = () => {
    const json = JSON.stringify(questions, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_quiz.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Top Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800">
        <div className="flex gap-1.5">
          <button
            onClick={() => setActiveTab('play')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'play'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Take Quiz ({questions.length} Qs)
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'create'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            + Create Question
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bulk'
                ? 'bg-white dark:bg-slate-900 text-pink-600 dark:text-pink-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            ⚡ Generate from Text
          </button>
        </div>

        <div className="flex items-center gap-1.5 pr-1">
          {questions.length > 0 && (
            <button
              onClick={handleClearAllQuestions}
              className="px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
              title="Remove all sample questions to start blank"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove All Questions
            </button>
          )}
          <button
            onClick={handleExportQuizJson}
            disabled={questions.length === 0}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Download Quiz JSON"
          >
            <Download className="w-3.5 h-3.5" /> JSON
          </button>
          <button
            onClick={() => window.print()}
            disabled={questions.length === 0}
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            title="Print Exam Paper"
          >
            <Printer className="w-3.5 h-3.5" /> Print Exam
          </button>
        </div>
      </div>

      {/* Preset Generators & Reset */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-pink-500" /> Presets:
          </span>
          <button
            onClick={() => handleLoadPresetQuiz('webdev')}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-pink-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer shrink-0 transition-colors"
          >
            Web Dev Exam
          </button>
          <button
            onClick={() => handleLoadPresetQuiz('security')}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-pink-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer shrink-0 transition-colors"
          >
            Security & Crypto
          </button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleClearAllQuestions}
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:text-rose-400 dark:hover:text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            title="Remove all sample questions to start blank"
          >
            <Trash2 className="w-3.5 h-3.5" /> Remove Samples (Start Blank)
          </button>
          <button
            onClick={handleResetToDefaultQuiz}
            className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline cursor-pointer shrink-0"
            title="Reload default sample quiz"
          >
            Reload Samples
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. QUIZ PLAYER MODE */}
      {/* ======================================================== */}
      {activeTab === 'play' && (
        <>
          {questions.length > 0 && q ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                <span className="flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-pink-500" />
                  <span>Question {currentQ + 1} of {questions.length}</span>
                </span>
                <span className="text-emerald-500 font-bold">Score: {score}</span>
              </div>

              <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                {q.question}
              </h4>

              <div className="space-y-2.5">
                {q.options.map((opt, i) => {
                  let btnStyle = 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-pink-500 text-slate-800 dark:text-slate-200';
                  if (answered) {
                    if (i === q.correct) {
                      btnStyle = 'bg-emerald-500 text-white font-bold border-emerald-500 shadow-sm';
                    } else if (i === selectedOpt) {
                      btnStyle = 'bg-rose-500 text-white font-bold border-rose-500 shadow-sm';
                    } else {
                      btnStyle = 'opacity-40 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={i}
                      disabled={answered}
                      onClick={() => handleSelectOption(i)}
                      className={`w-full p-4 rounded-2xl border text-xs sm:text-sm text-left transition-all font-semibold flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center font-bold text-xs shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {answered && i === q.correct && (
                        <CheckCircle className="w-5 h-5 text-white shrink-0" />
                      )}
                      {answered && i === selectedOpt && i !== q.correct && (
                        <XCircle className="w-5 h-5 text-white shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {answered && q.explanation && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in zoom-in-95">
                  💡 <strong>Explanation:</strong> {q.explanation}
                </div>
              )}

              {answered && (
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer"
                >
                  {currentQ + 1 < questions.length ? 'Next Question →' : 'View Final Quiz Report 🏆'}
                </button>
              )}
            </div>
          ) : (
            <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-pink-500/10 text-pink-500 mx-auto flex items-center justify-center">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                No Questions in this Quiz
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                All questions have been cleared. You can create your own questions or auto-generate an exam from raw study notes.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <button
                  onClick={() => setActiveTab('create')}
                  className="px-4 py-2.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  + Add First Question
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  ⚡ Generate from Text
                </button>
                <button
                  onClick={handleResetToDefaultQuiz}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Load Sample Exam
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ======================================================== */}
      {/* 2. RESULTS MODE */}
      {/* ======================================================== */}
      {activeTab === 'results' && (
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-pink-500/10 text-pink-500 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-pink-500 tracking-wider">
              Quiz Completed!
            </span>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
              {score} / {questions.length} ({percentage}%)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {percentage >= 80 ? 'Outstanding! Mastery achieved.' : percentage >= 50 ? 'Good work! Review missed questions.' : 'Keep practicing to reinforce concepts.'}
            </p>
          </div>

          {/* Question Review Breakdown */}
          <div className="space-y-2 text-left pt-2 border-t border-slate-100 dark:border-slate-800 max-h-60 overflow-y-auto">
            {questions.map((item, idx) => {
              const userAns = userAnswers[idx];
              const isRight = userAns === item.correct;
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between"
                >
                  <div className="truncate mr-3">
                    <span className="font-bold text-slate-700 dark:text-slate-300 mr-2">#{idx + 1}</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{item.question}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full font-bold text-[10px] shrink-0 ${
                      isRight ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                    }`}
                  >
                    {isRight ? 'Correct' : 'Missed'}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-3 justify-center">
            <button
              onClick={handleRestartQuiz}
              className="px-6 py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Retake Quiz
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className="px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Add More Questions
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. QUESTION BUILDER MODE */}
      {/* ======================================================== */}
      {activeTab === 'create' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-pink-500" />
              <span>Create Custom Multiple-Choice Question</span>
            </h3>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">Question Prompt</label>
              <input
                type="text"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                placeholder="e.g. Which layer of the OSI model does TCP operate on?"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 block">
                Options (Select radio for correct answer)
              </label>
              {[
                { val: opt0, set: setOpt0, idx: 0, label: 'A' },
                { val: opt1, set: setOpt1, idx: 1, label: 'B' },
                { val: opt2, set: setOpt2, idx: 2, label: 'C' },
                { val: opt3, set: setOpt3, idx: 3, label: 'D' },
              ].map((item) => (
                <div key={item.idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correctOpt"
                    checked={correctIndex === item.idx}
                    onChange={() => setCorrectIndex(item.idx)}
                    className="accent-pink-500 cursor-pointer w-4 h-4"
                  />
                  <span className="font-bold text-xs text-slate-400 w-4">{item.label}</span>
                  <input
                    type="text"
                    value={item.val}
                    onChange={(e) => item.set(e.target.value)}
                    placeholder={`Option ${item.label}...`}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 block mb-1">
                Explanation / Hint (Optional)
              </label>
              <input
                type="text"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Why is this answer correct?"
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleAddQuestion}
              className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question to Quiz Deck</span>
            </button>
          </div>

          {/* Manage Questions List */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Manage Quiz Questions ({questions.length} Items)
              </h4>
              {questions.length > 0 && (
                <button
                  onClick={handleClearAllQuestions}
                  className="text-xs text-rose-500 hover:underline font-semibold cursor-pointer"
                >
                  Clear All Questions
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
              {questions.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between py-2.5 text-xs">
                  <div className="truncate mr-3">
                    <span className="font-bold text-slate-900 dark:text-white mr-2">#{idx + 1}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{item.question}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                      Ans: {String.fromCharCode(65 + item.correct)} ({item.options[item.correct]})
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteQuestion(item.id)}
                    className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer shrink-0 transition-colors"
                    title="Delete question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {questions.length === 0 && (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No questions in this quiz. Create a question above or bulk generate from text!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. BULK TEXT GENERATOR MODE */}
      {/* ======================================================== */}
      {activeTab === 'bulk' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-pink-500" />
              <span>Generate Quiz Questions from Raw Notes</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Paste structured questions with options <code>A) B) C) D)</code> and <code>Answer: [Letter]</code>. Toolstrum will automatically generate the playable test.
            </p>
          </div>

          <div className="flex gap-2 text-xs font-bold">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300">
              <input
                type="radio"
                name="bulkQuizMode"
                checked={bulkModeOption === 'replace'}
                onChange={() => setBulkModeOption('replace')}
                className="accent-pink-500"
              />
              <span>Replace entire quiz (Fresh Start)</span>
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-300 ml-4">
              <input
                type="radio"
                name="bulkQuizMode"
                checked={bulkModeOption === 'append'}
                onChange={() => setBulkModeOption('append')}
                className="accent-pink-500"
              />
              <span>Append to existing questions</span>
            </label>
          </div>

          <textarea
            value={bulkQuizText}
            onChange={(e) => setBulkQuizText(e.target.value)}
            rows={10}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
            placeholder="Q: Question text\nA) Option 1\nB) Option 2\nAnswer: A..."
          />

          <button
            onClick={handleBulkGenerateQuiz}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Playable Quiz Deck</span>
          </button>
        </div>
      )}
    </div>
  );
};
