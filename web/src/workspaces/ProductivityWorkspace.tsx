import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Shuffle,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

// Subcomponents
import {
  NotesAppTool,
  ChecklistMakerTool,
  TodoListTool,
  HabitTrackerTool,
} from './productivity/TaskHabitTools';
import {
  ExpenseSplitterTool,
  PersonalExpenseTrackerTool,
  BudgetPlannerTool,
  InvoiceGeneratorTool,
  ReceiptGeneratorTool,
  QuotationGeneratorTool,
} from './productivity/FinanceDocTools';
import {
  BusinessCardMakerTool,
  ResumePdfMakerTool,
  CoverLetterGeneratorTool,
  TimetableMakerTool,
  FlashcardMakerTool,
  QuizGeneratorTool,
} from './productivity/CareerEduTools';
import {
  TextReaderTool,
  DocumentExpiryTool,
  BirthdayReminderTool,
  CalendarEventCalculatorTool,
  QrAttendanceGeneratorTool,
  QrAttendanceScannerTool,
} from './productivity/ReminderAttendanceTools';

interface ProductivityWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const ProductivityWorkspace: React.FC<ProductivityWorkspaceProps> = ({
  toolId,
  accentColor = '#EC4899',
}) => {
  const currentToolDef = getToolById(toolId);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // 446: POMODORO FOCUS TIMER
  // ==========================================
  const [pomoCycle, setPomoCycle] = useState<'25' | '5' | '15'>('25');
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoCompleted, setPomoCompleted] = useState(0);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {}
  };

  useEffect(() => {
    let interval: any = null;
    if (pomoActive) {
      interval = setInterval(() => {
        setPomoSeconds((prev) => {
          if (prev <= 1) {
            setPomoActive(false);
            playChime();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            if (pomoCycle === '25') {
              setPomoCompleted((c) => c + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoCycle]);

  const handleSetCycle = (cycle: '25' | '5' | '15') => {
    setPomoCycle(cycle);
    setPomoActive(false);
    setPomoSeconds(Number(cycle) * 60);
  };

  const formatPomoTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // 448: ANIMATED WHEEL OF NAMES
  // ==========================================
  const [namesText, setNamesText] = useState(() => {
    try {
      return localStorage.getItem('toolstrum_wheel_names') || '';
    } catch {
      return '';
    }
  });
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_wheel_names', namesText);
    } catch {}
  }, [namesText]);

  const parsedNames = namesText
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const wheelColors = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'
  ];

  const handleSpinWheel = () => {
    if (parsedNames.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinnerName(null);

    // Pick winner index
    const winnerIdx = Math.floor(Math.random() * parsedNames.length);
    const sliceAngle = 360 / parsedNames.length;
    // Target angle points to top
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetSliceAngle = (parsedNames.length - winnerIdx - 0.5) * sliceAngle;
    const finalRotation = rotation + extraSpins + (targetSliceAngle - (rotation % 360));

    setRotation(finalRotation);

    setTimeout(() => {
      setIsSpinning(false);
      setWinnerName(parsedNames[winnerIdx]);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }, 4000);
  };

  const renderToolContent = () => {
    switch (toolId) {
      // 1. Task & Habit Tools
      case 417:
        return <NotesAppTool copied={copied} onCopy={handleCopy} />;
      case 418:
        return <ChecklistMakerTool copied={copied} onCopy={handleCopy} />;
      case 419:
        return <TodoListTool copied={copied} onCopy={handleCopy} />;
      case 420:
        return <HabitTrackerTool copied={copied} onCopy={handleCopy} />;

      // 2. Finance & Document Tools
      case 421:
        return <ExpenseSplitterTool copied={copied} onCopy={handleCopy} />;
      case 422:
        return <PersonalExpenseTrackerTool copied={copied} onCopy={handleCopy} />;
      case 423:
        return <BudgetPlannerTool copied={copied} onCopy={handleCopy} />;
      case 424:
        return <InvoiceGeneratorTool copied={copied} onCopy={handleCopy} />;
      case 425:
        return <ReceiptGeneratorTool copied={copied} onCopy={handleCopy} />;
      case 426:
        return <QuotationGeneratorTool copied={copied} onCopy={handleCopy} />;

      // 3. Career & Education Tools
      case 427:
        return <BusinessCardMakerTool copied={copied} onCopy={handleCopy} />;
      case 428:
        return <ResumePdfMakerTool copied={copied} onCopy={handleCopy} />;
      case 429:
        return <CoverLetterGeneratorTool copied={copied} onCopy={handleCopy} />;
      case 430:
        return <TimetableMakerTool copied={copied} onCopy={handleCopy} />;
      case 431:
        return <FlashcardMakerTool copied={copied} onCopy={handleCopy} />;
      case 432:
        return <QuizGeneratorTool copied={copied} onCopy={handleCopy} />;

      // 4. Reminder, TTS & Attendance Tools
      case 438:
        return <TextReaderTool copied={copied} onCopy={handleCopy} />;
      case 441:
        return <DocumentExpiryTool copied={copied} onCopy={handleCopy} />;
      case 442:
        return <BirthdayReminderTool copied={copied} onCopy={handleCopy} />;
      case 444:
        return <CalendarEventCalculatorTool copied={copied} onCopy={handleCopy} />;
      case 449:
        return <QrAttendanceGeneratorTool copied={copied} onCopy={handleCopy} />;
      case 450:
        return <QrAttendanceScannerTool copied={copied} onCopy={handleCopy} />;

      // 5. Pomodoro Focus Timer (446)
      case 446:
        return (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => handleSetCycle('25')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    pomoCycle === '25'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  25m Focus
                </button>
                <button
                  onClick={() => handleSetCycle('5')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    pomoCycle === '5'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  5m Short Rest
                </button>
                <button
                  onClick={() => handleSetCycle('15')}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    pomoCycle === '15'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  15m Long Break
                </button>
              </div>

              <div className="py-6">
                <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white select-none">
                  {formatPomoTime(pomoSeconds)}
                </span>
                <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mt-2">
                  {pomoActive ? 'FOCUS SESSION RUNNING' : 'PAUSED • CLICK START TO FOCUS'}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setPomoActive(!pomoActive)}
                  className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  {pomoActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{pomoActive ? 'Pause' : 'Start Focus'}</span>
                </button>

                <button
                  onClick={() => handleSetCycle(pomoCycle)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Reset Cycle"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleSetCycle(pomoCycle === '25' ? '5' : '25')}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
                  title="Skip to Next"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                <span>Completed Sessions: <strong>{pomoCompleted}</strong></span>
                <span className="text-[11px] text-slate-400">Audio chime on timer completion</span>
              </div>
            </div>
          </div>
        );

      // 6. Wheel of Names (448)
      case 448:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Input list */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shuffle className="w-4 h-4 text-pink-500" />
                  <span>Participant Names ({parsedNames.length})</span>
                </h3>
                <span className="text-[11px] text-slate-400">One name per line</span>
              </div>

              <textarea
                value={namesText}
                onChange={(e) => setNamesText(e.target.value)}
                rows={10}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-medium text-xs leading-relaxed text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter names, one per line..."
              />

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const shuffled = [...parsedNames].sort(() => Math.random() - 0.5);
                    setNamesText(shuffled.join('\n'));
                  }}
                  disabled={parsedNames.length < 2}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Shuffle List
                </button>
                <button
                  onClick={() => setNamesText('Alice\nBob\nCharlie\nDiana\nEvan\nFiona')}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 text-xs font-semibold cursor-pointer"
                  title="Load sample names"
                >
                  Load Samples
                </button>
                {namesText && (
                  <button
                    onClick={() => setNamesText('')}
                    className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-semibold cursor-pointer"
                    title="Clear names"
                  >
                    Clear
                  </button>
                )}
              </div>

              {winnerName && (
                <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border-2 border-pink-500/40 text-center animate-in zoom-in-95 duration-200">
                  <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 tracking-wider">
                    🎉 Selected Winner
                  </span>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {winnerName}
                  </div>
                </div>
              )}
            </div>

            {/* Interactive Wheel Canvas */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-6">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
                {/* Pointer Arrow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-14 border-t-rose-600 drop-shadow-md" />

                {/* Spinning Wheel */}
                <svg
                  viewBox="0 0 200 200"
                  className="w-full h-full rounded-full shadow-lg transition-transform"
                  style={{
                    transform: `rotate(${rotation}deg)`,
                    transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
                  }}
                >
                  {parsedNames.map((name, i) => {
                    const slice = 360 / parsedNames.length;
                    const startAngle = (i * slice * Math.PI) / 180;
                    const endAngle = (((i + 1) * slice) * Math.PI) / 180;
                    const x1 = 100 + 100 * Math.cos(startAngle);
                    const y1 = 100 + 100 * Math.sin(startAngle);
                    const x2 = 100 + 100 * Math.cos(endAngle);
                    const y2 = 100 + 100 * Math.sin(endAngle);
                    const largeArc = slice > 180 ? 1 : 0;
                    const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

                    // Mid-angle for label
                    const midAngle = ((i + 0.5) * slice * Math.PI) / 180;
                    const textX = 100 + 60 * Math.cos(midAngle);
                    const textY = 100 + 60 * Math.sin(midAngle);
                    const textRot = ((i + 0.5) * slice);

                    return (
                      <g key={i}>
                        <path
                          d={pathData}
                          fill={wheelColors[i % wheelColors.length]}
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x={textX}
                          y={textY}
                          fill="#ffffff"
                          fontSize="9"
                          fontWeight="bold"
                          textAnchor="middle"
                          dominantBaseline="central"
                          transform={`rotate(${textRot + 90}, ${textX}, ${textY})`}
                        >
                          {name.length > 8 ? name.slice(0, 7) + '…' : name}
                        </text>
                      </g>
                    );
                  })}
                  {/* Center Hub */}
                  <circle cx="100" cy="100" r="16" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="100" cy="100" r="6" fill="#ec4899" />
                </svg>
              </div>

              <button
                onClick={handleSpinWheel}
                disabled={isSpinning || parsedNames.length < 2}
                className="w-full max-w-xs py-3.5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <Shuffle className="w-4 h-4" />
                <span>{isSpinning ? 'Spinning Wheel...' : 'Spin the Wheel!'}</span>
              </button>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-8 text-center text-slate-500">
            Select a productivity tool from the sidebar.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <CheckSquare className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Productivity & Education Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Focus timers, to-do lists, expense trackers, documents, quizzes, and reminders. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* Render Distinct Tool Component */}
      {renderToolContent()}
    </div>
  );
};
