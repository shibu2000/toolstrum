import { ToolDefinition } from '../../../data/types';
import { getToolById } from '../../../data/registry';

export type ProductivityWorkspaceId =
  | 'prod_notes_tasks'
  | 'prod_finance_expenses'
  | 'prod_business_docs'
  | 'prod_education_study'
  | 'prod_time_decisions'
  | 'prod_reminders_attendance';

export interface ProductivityWorkspaceMeta {
  id: ProductivityWorkspaceId;
  title: string;
  subtitle: string;
  description: string;
  toolIds: number[];
}

export const PRODUCTIVITY_WORKSPACES: Record<ProductivityWorkspaceId, ProductivityWorkspaceMeta> = {
  prod_notes_tasks: {
    id: 'prod_notes_tasks',
    title: 'Notes, Tasks & Habits',
    subtitle: 'Daily Notes, Checklists & Streak Tracking',
    description: 'Capture quick notes, manage structured checklists, organize prioritized to-do tasks, and monitor habit consistency streaks offline.',
    toolIds: [417, 418, 419, 420],
  },
  prod_finance_expenses: {
    id: 'prod_finance_expenses',
    title: 'Personal & Group Finance',
    subtitle: 'Split Bills, Track Expenses & Plan Budgets',
    description: 'Calculate fair group expense splits with minimal settlements, log categorized personal expenses, and plan monthly balanced budgets.',
    toolIds: [421, 422, 423],
  },
  prod_business_docs: {
    id: 'prod_business_docs',
    title: 'Business & Career Documents',
    subtitle: 'Invoices, Receipts, Resumes & Letters',
    description: 'Draft professional invoices with tax calculations, commercial receipts, formal quotations, vCards, structured resumes, and cover letters.',
    toolIds: [424, 425, 426, 427, 428, 429],
  },
  prod_education_study: {
    id: 'prod_education_study',
    title: 'Education, Language & Study',
    subtitle: 'Timetables, Flashcards, Lexicon & Quizzes',
    description: 'Build weekly study schedules, practice interactive flashcards, take self-grading quizzes, consult offline dictionary and synonyms, and inspect reading stats.',
    toolIds: [430, 431, 432, 433, 434, 435, 436, 437, 438],
  },
  prod_time_decisions: {
    id: 'prod_time_decisions',
    title: 'Time, Focus & Decisions',
    subtitle: 'Pomodoro, Focus Timers, Event Math & Spinners',
    description: 'Calculate calendar day spans, run focus timers and 25-minute Pomodoro cycles, pick random outcomes, and spin the wheel of names.',
    toolIds: [444, 445, 446, 447, 448],
  },
  prod_reminders_attendance: {
    id: 'prod_reminders_attendance',
    title: 'Reminders, Inventory & Attendance',
    subtitle: 'Expirations, Birthdays, Stock & QR Roster',
    description: 'Generate QR vCards, manage SKU inventory stock, monitor document expirations and birthdays, browse world holidays, and generate or scan QR attendance tokens.',
    toolIds: [439, 440, 441, 442, 443, 449, 450],
  },
};

export interface ProductivityToolConfig {
  toolId: number;
  workspaceId: ProductivityWorkspaceId;
  name: string;
  badge: string;
  description: string;
}

export const PRODUCTIVITY_TOOL_CONFIGS: Record<number, ProductivityToolConfig> = {
  // prod_notes_tasks
  417: {
    toolId: 417,
    workspaceId: 'prod_notes_tasks',
    name: 'Notes App',
    badge: 'Notes',
    description: 'Create, search, and pin rich text notes with word and character statistics.',
  },
  418: {
    toolId: 418,
    workspaceId: 'prod_notes_tasks',
    name: 'Checklist Maker',
    badge: 'Checklist',
    description: 'Create multi-item checklists with completion percentages and preloaded templates.',
  },
  419: {
    toolId: 419,
    workspaceId: 'prod_notes_tasks',
    name: 'To-Do List',
    badge: 'To-Do',
    description: 'Organize prioritized to-do tasks with due dates, tags, and status filtering.',
  },
  420: {
    toolId: 420,
    workspaceId: 'prod_notes_tasks',
    name: 'Habit Tracker',
    badge: 'Habits',
    description: 'Track daily habit completions, build ongoing streaks, and analyze consistency.',
  },

  // prod_finance_expenses
  421: {
    toolId: 421,
    workspaceId: 'prod_finance_expenses',
    name: 'Expense Splitter',
    badge: 'Splitter',
    description: 'Split group bills and calculate optimal debt settlements between friends.',
  },
  422: {
    toolId: 422,
    workspaceId: 'prod_finance_expenses',
    name: 'Personal Expense Tracker',
    badge: 'Expenses',
    description: 'Log and categorize daily personal expenditures with running total calculations.',
  },
  423: {
    toolId: 423,
    workspaceId: 'prod_finance_expenses',
    name: 'Budget Planner',
    badge: 'Budget',
    description: 'Plan monthly budgets with category caps, spending totals, and savings rate analysis.',
  },

  // prod_business_docs
  424: {
    toolId: 424,
    workspaceId: 'prod_business_docs',
    name: 'Invoice Generator',
    badge: 'Invoice',
    description: 'Generate commercial invoices with line items, tax rates, discounts, and due dates.',
  },
  425: {
    toolId: 425,
    workspaceId: 'prod_business_docs',
    name: 'Receipt Generator',
    badge: 'Receipt',
    description: 'Generate detailed transaction receipts with authorization codes and payment info.',
  },
  426: {
    toolId: 426,
    workspaceId: 'prod_business_docs',
    name: 'Quotation Generator',
    badge: 'Quotation',
    description: 'Create formal commercial quotations with expiration dates and payment terms.',
  },
  427: {
    toolId: 427,
    workspaceId: 'prod_business_docs',
    name: 'Business Card Maker',
    badge: 'vCard',
    description: 'Design digital business cards and generate vCard contact format for instant sharing.',
  },
  428: {
    toolId: 428,
    workspaceId: 'prod_business_docs',
    name: 'Resume PDF Maker',
    badge: 'Resume',
    description: 'Structure professional resumes with work experience, education, and skills.',
  },
  429: {
    toolId: 429,
    workspaceId: 'prod_business_docs',
    name: 'Cover Letter Generator',
    badge: 'Cover Letter',
    description: 'Generate tailored job application cover letters with customizable opening and closing.',
  },

  // prod_education_study
  430: {
    toolId: 430,
    workspaceId: 'prod_education_study',
    name: 'Timetable Maker',
    badge: 'Timetable',
    description: 'Plan weekly class and study schedules with time slots, rooms, and subject color codes.',
  },
  431: {
    toolId: 431,
    workspaceId: 'prod_education_study',
    name: 'Flashcard Maker',
    badge: 'Flashcards',
    description: 'Create interactive double-sided flashcards and review study decks with flip action.',
  },
  432: {
    toolId: 432,
    workspaceId: 'prod_education_study',
    name: 'Quiz Generator',
    badge: 'Quiz',
    description: 'Generate multi-choice quizzes from study notes with automatic score evaluation.',
  },
  433: {
    toolId: 433,
    workspaceId: 'prod_education_study',
    name: 'Unit Conversion Reference',
    badge: 'Reference',
    description: 'Quick reference sheet for length, mass, temperature, speed, volume, and data units.',
  },
  434: {
    toolId: 434,
    workspaceId: 'prod_education_study',
    name: 'Dictionary',
    badge: 'Dictionary',
    description: 'Offline English lexicon with definitions, parts of speech, and example sentences.',
  },
  435: {
    toolId: 435,
    workspaceId: 'prod_education_study',
    name: 'Synonym Finder',
    badge: 'Synonyms',
    description: 'Look up related words, synonyms, and nuanced vocabulary alternatives offline.',
  },
  436: {
    toolId: 436,
    workspaceId: 'prod_education_study',
    name: 'Antonym Finder',
    badge: 'Antonyms',
    description: 'Discover contrasting antonyms and opposing terms for vocabulary enrichment.',
  },
  437: {
    toolId: 437,
    workspaceId: 'prod_education_study',
    name: 'Word Pronunciation',
    badge: 'Phonetics',
    description: 'Learn phonetic syllable breakdowns, stress indicators, and pronunciation guides.',
  },
  438: {
    toolId: 438,
    workspaceId: 'prod_education_study',
    name: 'Text Reader',
    badge: 'Reader',
    description: 'Analyze reading speed, word count, syllable count, and estimated time to read.',
  },

  // prod_time_decisions
  444: {
    toolId: 444,
    workspaceId: 'prod_time_decisions',
    name: 'Calendar Event Calculator',
    badge: 'Date Math',
    description: 'Calculate elapsed days, business days, and time remaining until upcoming calendar events.',
  },
  445: {
    toolId: 445,
    workspaceId: 'prod_time_decisions',
    name: 'Focus Timer',
    badge: 'Stopwatch',
    description: 'Customizable countdown timer and stopwatch for uninterrupted focus sessions.',
  },
  446: {
    toolId: 446,
    workspaceId: 'prod_time_decisions',
    name: 'Pomodoro Timer',
    badge: 'Pomodoro',
    description: 'Classic 25-minute Pomodoro timer with short and long rest interval cycles.',
  },
  447: {
    toolId: 447,
    workspaceId: 'prod_time_decisions',
    name: 'Random Decision Picker',
    badge: 'Decision',
    description: 'Flip a coin, roll dice, or pick randomly among custom options to break decision paralysis.',
  },
  448: {
    toolId: 448,
    workspaceId: 'prod_time_decisions',
    name: 'Wheel of Names',
    badge: 'Spinner',
    description: 'Spin a fair randomized wheel among candidate names to select a raffle or contest winner.',
  },

  // prod_reminders_attendance
  439: {
    toolId: 439,
    workspaceId: 'prod_reminders_attendance',
    name: 'QR Contact Card',
    badge: 'vCard QR',
    description: 'Format complete contact details into standard vCard format for instant QR scanning.',
  },
  440: {
    toolId: 440,
    workspaceId: 'prod_reminders_attendance',
    name: 'Barcode Inventory List',
    badge: 'Inventory',
    description: 'Manage SKU/Barcode inventory counts, reorder alerts, and total stock valuations.',
  },
  441: {
    toolId: 441,
    workspaceId: 'prod_reminders_attendance',
    name: 'Document Expiry Reminder',
    badge: 'Expiry',
    description: 'Monitor expiration dates on passports, licenses, insurance, and warranty documents.',
  },
  442: {
    toolId: 442,
    workspaceId: 'prod_reminders_attendance',
    name: 'Birthday Reminder',
    badge: 'Birthdays',
    description: 'Track upcoming birthdays, calculate milestone ages, and view astrological zodiac signs.',
  },
  443: {
    toolId: 443,
    workspaceId: 'prod_reminders_attendance',
    name: 'World Holiday Calendar',
    badge: 'Holidays',
    description: 'Browse international holidays and cultural observances across global regions.',
  },
  449: {
    toolId: 449,
    workspaceId: 'prod_reminders_attendance',
    name: 'QR Attendance Generator',
    badge: 'Pass Gen',
    description: 'Generate encrypted QR check-in session passes for classes, meetings, and events.',
  },
  450: {
    toolId: 450,
    workspaceId: 'prod_reminders_attendance',
    name: 'QR Attendance Scanner',
    badge: 'Scanner',
    description: 'Verify attendance passes and maintain a real-time signed-in attendee roster.',
  },
};

export function getProductivityToolConfig(toolId: number): ProductivityToolConfig | undefined {
  return PRODUCTIVITY_TOOL_CONFIGS[toolId];
}

export function getProductivityWorkspaceTools(workspaceId: ProductivityWorkspaceId): ToolDefinition[] {
  const meta = PRODUCTIVITY_WORKSPACES[workspaceId];
  if (!meta) return [];
  return meta.toolIds
    .map((id) => getToolById(id))
    .filter((t): t is ToolDefinition => !!t);
}
