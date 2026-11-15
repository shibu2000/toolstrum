import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldCheck,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

// 1. Task & Habit Tools (417–420)
import {
  NotesAppTool,
  ChecklistMakerTool,
  TodoListTool,
  HabitTrackerTool,
} from './productivity/TaskHabitTools';

// 2. Finance & Document Tools (421–426)
import {
  ExpenseSplitterTool,
  PersonalExpenseTrackerTool,
  BudgetPlannerTool,
  InvoiceGeneratorTool,
  ReceiptGeneratorTool,
  QuotationGeneratorTool,
} from './productivity/FinanceDocTools';

// 3. Career & Education Tools (427–432)
import {
  BusinessCardMakerTool,
  ResumePdfMakerTool,
  CoverLetterGeneratorTool,
  TimetableMakerTool,
  FlashcardMakerTool,
  QuizGeneratorTool,
} from './productivity/CareerEduTools';

// 4. Education & Dictionary Tools (433–437)
import {
  UnitConversionReferenceTool,
  DictionaryTool,
  SynonymFinderTool,
  AntonymFinderTool,
  WordPronunciationTool,
} from './productivity/EducationDictionaryTools';

// 5. Reminders & Attendance Tools (438, 441, 442, 444, 449, 450)
import {
  TextReaderTool,
  DocumentExpiryTool,
  BirthdayReminderTool,
  CalendarEventCalculatorTool,
  QrAttendanceGeneratorTool,
  QrAttendanceScannerTool,
} from './productivity/ReminderAttendanceTools';

// 6. Focus, Decision & Inventory Tools (439, 440, 443, 445, 446, 447, 448)
import {
  QrContactCardTool,
  BarcodeInventoryListTool,
  WorldHolidayCalendarTool,
  FocusDeepWorkTimerTool,
  PomodoroTimerTool,
  RandomDecisionPickerTool,
  WheelOfNamesTool,
} from './productivity/FocusDecisionInventoryTools';

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

      // 4. Education & Dictionary Tools
      case 433:
        return <UnitConversionReferenceTool copied={copied} onCopy={handleCopy} />;
      case 434:
        return <DictionaryTool copied={copied} onCopy={handleCopy} />;
      case 435:
        return <SynonymFinderTool copied={copied} onCopy={handleCopy} />;
      case 436:
        return <AntonymFinderTool copied={copied} onCopy={handleCopy} />;
      case 437:
        return <WordPronunciationTool copied={copied} onCopy={handleCopy} />;

      // 5. Reminders, TTS & Attendance Tools
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

      // 6. Focus, Decision & Inventory Tools
      case 439:
        return <QrContactCardTool copied={copied} onCopy={handleCopy} />;
      case 440:
        return <BarcodeInventoryListTool copied={copied} onCopy={handleCopy} />;
      case 443:
        return <WorldHolidayCalendarTool copied={copied} onCopy={handleCopy} />;
      case 445:
        return <FocusDeepWorkTimerTool copied={copied} onCopy={handleCopy} />;
      case 446:
        return <PomodoroTimerTool copied={copied} onCopy={handleCopy} />;
      case 447:
        return <RandomDecisionPickerTool copied={copied} onCopy={handleCopy} />;
      case 448:
        return <WheelOfNamesTool copied={copied} onCopy={handleCopy} />;

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
              <CheckSquare className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentToolDef?.name || 'Productivity & Education Studio'}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800 text-[11px] font-medium self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-pink-500" />
            <span>100% Offline • Zero Server Uploads</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'Focus timers, to-do lists, expense trackers, documents, quizzes, and reminders. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* Render Distinct Tool Component */}
      {renderToolContent()}
    </div>
  );
};
