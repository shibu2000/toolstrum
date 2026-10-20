// Productivity & Education Offline Engine

export interface SplitExpenseItem {
  payer: string;
  amount: number;
  participants: string[];
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export function calculateExpenseSplit(expenses: SplitExpenseItem[]): {
  balances: Record<string, number>;
  totalSpent: number;
  settlements: Settlement[];
} {
  const balances: Record<string, number> = {};
  let totalSpent = 0;

  for (const exp of expenses) {
    totalSpent += exp.amount;
    const splitCount = exp.participants.length || 1;
    const share = exp.amount / splitCount;

    balances[exp.payer] = (balances[exp.payer] || 0) + exp.amount;
    for (const p of exp.participants) {
      balances[p] = (balances[p] || 0) - share;
    }
  }

  // Round balances to 2 decimal places
  for (const person in balances) {
    balances[person] = Math.round(balances[person] * 100) / 100;
  }

  // Greedy settlement resolution
  const debtors: { person: string; amount: number }[] = [];
  const creditors: { person: string; amount: number }[] = [];

  for (const [person, bal] of Object.entries(balances)) {
    if (bal < -0.01) {
      debtors.push({ person, amount: -bal });
    } else if (bal > 0.01) {
      creditors.push({ person, amount: bal });
    }
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settleAmt = Math.min(debtor.amount, creditor.amount);

    if (settleAmt > 0.01) {
      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: Math.round(settleAmt * 100) / 100,
      });
    }

    debtor.amount -= settleAmt;
    creditor.amount -= settleAmt;

    if (debtor.amount <= 0.01) dIdx++;
    if (creditor.amount <= 0.01) cIdx++;
  }

  return { balances, totalSpent, settlements };
}

export interface ExpenseRecord {
  category: string;
  description: string;
  amount: number;
  date: string;
}

export function summarizePersonalExpenses(expenses: ExpenseRecord[]): {
  total: number;
  byCategory: { category: string; amount: number; percentage: number }[];
  highest: ExpenseRecord | null;
} {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const catMap: Record<string, number> = {};

  let highest: ExpenseRecord | null = null;
  for (const exp of expenses) {
    catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
    if (!highest || exp.amount > highest.amount) {
      highest = exp;
    }
  }

  const byCategory = Object.entries(catMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: total > 0 ? Math.round((amount / total) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return { total, byCategory, highest };
}

export interface BudgetCategory {
  name: string;
  budget: number;
  spent: number;
}

export function calculateMonthlyBudget(
  monthlyIncome: number,
  categories: BudgetCategory[]
): {
  totalBudgeted: number;
  totalSpent: number;
  remainingBudget: number;
  remainingIncome: number;
  savingsRate: number;
  overBudgetCategories: string[];
} {
  const totalBudgeted = categories.reduce((sum, c) => sum + c.budget, 0);
  const totalSpent = categories.reduce((sum, c) => sum + c.spent, 0);
  const remainingBudget = totalBudgeted - totalSpent;
  const remainingIncome = monthlyIncome - totalSpent;
  const savingsRate = monthlyIncome > 0 ? Math.max(0, Math.round(((monthlyIncome - totalSpent) / monthlyIncome) * 100)) : 0;
  const overBudgetCategories = categories
    .filter((c) => c.spent > c.budget)
    .map((c) => c.name);

  return {
    totalBudgeted,
    totalSpent,
    remainingBudget,
    remainingIncome,
    savingsRate,
    overBudgetCategories,
  };
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  senderName: string;
  clientName: string;
  dueDate: string;
  items: InvoiceItem[];
  taxRatePercent: number;
  discountAmount: number;
}

export function formatInvoiceDocument(invoice: InvoiceData): {
  subtotal: number;
  taxAmount: number;
  grandTotal: number;
  formattedText: string;
} {
  const subtotal = invoice.items.reduce(
    (sum, it) => sum + it.quantity * it.unitPrice,
    0
  );
  const taxAmount = (subtotal * invoice.taxRatePercent) / 100;
  const grandTotal = Math.max(0, subtotal + taxAmount - invoice.discountAmount);

  const lines = [
    `========================================`,
    `               INVOICE                  `,
    `========================================`,
    `Invoice #:   ${invoice.invoiceNumber || 'INV-1001'}`,
    `Due Date:    ${invoice.dueDate || 'Upon Receipt'}`,
    `Billed From: ${invoice.senderName || 'Freelance Studio'}`,
    `Billed To:   ${invoice.clientName || 'Valued Client'}`,
    `----------------------------------------`,
    `ITEMS:`,
    ...invoice.items.map(
      (it) =>
        `- ${it.description}: ${it.quantity} x $${it.unitPrice.toFixed(2)} = $${(
          it.quantity * it.unitPrice
        ).toFixed(2)}`
    ),
    `----------------------------------------`,
    `Subtotal:    $${subtotal.toFixed(2)}`,
    `Tax (${invoice.taxRatePercent}%): $${taxAmount.toFixed(2)}`,
    invoice.discountAmount > 0
      ? `Discount:   -$${invoice.discountAmount.toFixed(2)}`
      : null,
    `TOTAL DUE:   $${grandTotal.toFixed(2)}`,
    `========================================`,
    `Thank you for your business!`,
  ]
    .filter(Boolean)
    .join('\n');

  return { subtotal, taxAmount, grandTotal, formattedText: lines };
}

export interface VCardContact {
  fullName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
}

export function generateVCardPayload(c: VCardContact): string {
  const names = c.fullName.trim().split(' ');
  const lastName = names.length > 1 ? names[names.length - 1] : '';
  const firstName = names[0] || '';

  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${c.fullName || 'Contact'}`,
    c.company ? `ORG:${c.company}` : '',
    c.title ? `TITLE:${c.title}` : '',
    c.phone ? `TEL;TYPE=CELL:${c.phone}` : '',
    c.email ? `EMAIL;TYPE=INTERNET:${c.email}` : '',
    c.website ? `URL:${c.website}` : '',
    c.address ? `ADR;TYPE=WORK:;;${c.address};;;;` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experience: { role: string; company: string; duration: string; details: string }[];
  education: { degree: string; institution: string; year: string }[];
}

export function formatResumeText(r: ResumeData): string {
  return [
    `# ${r.fullName.toUpperCase()}`,
    `${r.email} | ${r.phone} | ${r.location}`,
    '',
    `## PROFESSIONAL SUMMARY`,
    r.summary,
    '',
    `## KEY SKILLS`,
    r.skills.join(' • '),
    '',
    `## PROFESSIONAL EXPERIENCE`,
    ...r.experience.map(
      (exp) =>
        `### ${exp.role} - ${exp.company} (${exp.duration})\n${exp.details}`
    ),
    '',
    `## EDUCATION`,
    ...r.education.map(
      (edu) => `* ${edu.degree}, ${edu.institution} (${edu.year})`
    ),
  ].join('\n');
}

export interface DictionaryEntry {
  word: string;
  phonetic: string;
  partOfSpeech: string;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
}

export const OFFLINE_DICTIONARY: Record<string, DictionaryEntry> = {
  serendipity: {
    word: 'serendipity',
    phonetic: '/ˌsɛr.ənˈdɪp.ɪ.ti/',
    partOfSpeech: 'noun',
    definition: 'The occurrence and development of events by chance in a happy or beneficial way.',
    example: 'A fortunate stroke of serendipity brought the two collaborators together.',
    synonyms: ['chance', 'fluke', 'good fortune', 'providence', 'blessing'],
    antonyms: ['misfortune', 'adversity', 'bad luck', 'calamity'],
  },
  ephemeral: {
    word: 'ephemeral',
    phonetic: '/ɪˈfɛm.ər.əl/',
    partOfSpeech: 'adjective',
    definition: 'Lasting for a very short time; transitory; fleeting.',
    example: 'The ephemeral beauty of cherry blossoms captivates visitors each spring.',
    synonyms: ['fleeting', 'transient', 'short-lived', 'momentary', 'brief'],
    antonyms: ['permanent', 'eternal', 'perpetual', 'enduring'],
  },
  resilience: {
    word: 'resilience',
    phonetic: '/rɪˈzɪl.jəns/',
    partOfSpeech: 'noun',
    definition: 'The capacity to withstand or recover quickly from difficulties; toughness.',
    example: 'Her remarkable resilience helped her overcome every obstacle.',
    synonyms: ['tenacity', 'endurance', 'toughness', 'perseverance', 'grit'],
    antonyms: ['fragility', 'weakness', 'vulnerability'],
  },
  eloquent: {
    word: 'eloquent',
    phonetic: '/ˈɛl.ə.kwənt/',
    partOfSpeech: 'adjective',
    definition: 'Fluent or persuasive in speaking or writing; vividly expressive.',
    example: 'An eloquent presentation moved the board to unanimous approval.',
    synonyms: ['articulate', 'expressive', 'persuasive', 'fluent', 'silver-tongued'],
    antonyms: ['inarticulate', 'hesitant', 'unexpressive'],
  },
  pragmatic: {
    word: 'pragmatic',
    phonetic: '/præɡˈmæt.ɪk/',
    partOfSpeech: 'adjective',
    definition: 'Dealing with things sensibly and realistically based on practical considerations.',
    example: 'He adopted a pragmatic approach to solve the deadline crunch.',
    synonyms: ['practical', 'realistic', 'hard-headed', 'matter-of-fact', 'sensible'],
    antonyms: ['idealistic', 'impractical', 'utopian', 'theoretical'],
  },
  catalyst: {
    word: 'catalyst',
    phonetic: '/ˈkæt.əl.ɪst/',
    partOfSpeech: 'noun',
    definition: 'A person or thing that precipitates an event or change without being consumed.',
    example: 'The new policy acted as a catalyst for widespread technological modernization.',
    synonyms: ['spark', 'stimulus', 'incentive', 'motivator', 'trigger'],
    antonyms: ['inhibitor', 'hindrance', 'deterrent'],
  },
};

export function lookupDictionaryWord(query: string): DictionaryEntry {
  const normalized = query.trim().toLowerCase();
  if (OFFLINE_DICTIONARY[normalized]) {
    return OFFLINE_DICTIONARY[normalized];
  }

  // Fallback heuristic definition
  return {
    word: query.trim(),
    phonetic: `/${query.trim().toLowerCase()}/`,
    partOfSpeech: 'noun / verb',
    definition: `General definition and vocabulary reference for "${query.trim()}".`,
    example: `Using "${query.trim()}" in daily professional context.`,
    synonyms: ['counterpart', 'analog', 'equivalent', 'peer'],
    antonyms: ['opposite', 'contrast', 'inverse'],
  };
}

export function analyzeReadingMetrics(text: string, wpm = 200): {
  wordCount: number;
  charCount: number;
  readingMinutes: number;
  readingSeconds: number;
  speakingMinutes: number;
  syllableCount: number;
  readabilityScore: number;
} {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      wordCount: 0,
      charCount: 0,
      readingMinutes: 0,
      readingSeconds: 0,
      speakingMinutes: 0,
      syllableCount: 0,
      readabilityScore: 100,
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = trimmed.length;

  // Approximate syllables: vowels per word with min 1
  let syllableCount = 0;
  for (const w of words) {
    const vowels = w.match(/[aeiouy]/gi);
    syllableCount += vowels ? Math.max(1, vowels.length) : 1;
  }

  const readingSecondsTotal = Math.ceil((wordCount / wpm) * 60);
  const readingMinutes = Math.floor(readingSecondsTotal / 60);
  const readingSeconds = readingSecondsTotal % 60;
  const speakingMinutes = Math.ceil(wordCount / 130);

  // Flesch Reading Ease approximation
  const sentences = Math.max(1, trimmed.split(/[.!?]+/).filter(Boolean).length);
  const wordsPerSentence = wordCount / sentences;
  const syllablesPerWord = syllableCount / Math.max(1, wordCount);
  const readabilityScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord)
    )
  );

  return {
    wordCount,
    charCount,
    readingMinutes,
    readingSeconds,
    speakingMinutes,
    syllableCount,
    readabilityScore,
  };
}

export function calculateDateSpan(
  startStr: string,
  endStr: string
): {
  totalDays: number;
  weeks: number;
  remainingDays: number;
  businessDays: number;
  isPast: boolean;
} {
  const d1 = new Date(startStr);
  const d2 = new Date(endStr);

  if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
    return { totalDays: 0, weeks: 0, remainingDays: 0, businessDays: 0, isPast: false };
  }

  const isPast = d2.getTime() < d1.getTime();
  const early = isPast ? d2 : d1;
  const late = isPast ? d1 : d2;

  const diffMs = late.getTime() - early.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  // Count business days (Mon-Fri)
  let businessDays = 0;
  const curr = new Date(early);
  while (curr <= late) {
    const dayOfWeek = curr.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++;
    }
    curr.setDate(curr.getDate() + 1);
  }

  return { totalDays, weeks, remainingDays, businessDays, isPast };
}

export interface BirthdayAnalysis {
  age: number;
  daysUntilNext: number;
  zodiacSign: string;
  dayOfWeekNext: string;
}

export function analyzeBirthday(birthdateStr: string): BirthdayAnalysis {
  const bdate = new Date(birthdateStr);
  if (isNaN(bdate.getTime())) {
    return { age: 0, daysUntilNext: 0, zodiacSign: 'Unknown', dayOfWeekNext: 'N/A' };
  }

  const now = new Date();
  let age = now.getFullYear() - bdate.getFullYear();
  const next = new Date(now.getFullYear(), bdate.getMonth(), bdate.getDate());

  if (now > next) {
    next.setFullYear(now.getFullYear() + 1);
  } else {
    age--;
  }

  const diffMs = next.getTime() - now.getTime();
  const daysUntilNext = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekNext = dayNames[next.getDay()];

  // Zodiac Sign
  const m = bdate.getMonth() + 1;
  const d = bdate.getDate();
  let zodiacSign = 'Capricorn';

  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) zodiacSign = 'Aquarius';
  else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) zodiacSign = 'Pisces';
  else if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) zodiacSign = 'Aries';
  else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) zodiacSign = 'Taurus';
  else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) zodiacSign = 'Gemini';
  else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) zodiacSign = 'Cancer';
  else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) zodiacSign = 'Leo';
  else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) zodiacSign = 'Virgo';
  else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) zodiacSign = 'Libra';
  else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) zodiacSign = 'Scorpio';
  else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) zodiacSign = 'Sagittarius';

  return { age: Math.max(0, age), daysUntilNext, zodiacSign, dayOfWeekNext };
}

export interface WorldHoliday {
  name: string;
  date: string;
  region: string;
  category: string;
}

export const WORLD_HOLIDAYS: WorldHoliday[] = [
  { name: "New Year's Day", date: 'January 1', region: 'Global', category: 'Civil' },
  { name: 'Martin Luther King Jr. Day', date: '3rd Mon in Jan', region: 'USA', category: 'Federal' },
  { name: 'Lunar New Year / Spring Festival', date: 'Jan/Feb (Varies)', region: 'Asia / Global', category: 'Cultural' },
  { name: "Valentine's Day", date: 'February 14', region: 'Global', category: 'Cultural' },
  { name: 'International Women’s Day', date: 'March 8', region: 'Global', category: 'Observance' },
  { name: 'Eid al-Fitr', date: 'Varies (Islamic Cal)', region: 'Middle East / Global', category: 'Religious' },
  { name: 'Earth Day', date: 'April 22', region: 'Global', category: 'Environmental' },
  { name: 'International Workers’ Day', date: 'May 1', region: 'Global / Europe', category: 'Civil' },
  { name: 'Juneteenth', date: 'June 19', region: 'USA', category: 'Federal' },
  { name: 'Independence Day', date: 'July 4', region: 'USA', category: 'National' },
  { name: 'Bastille Day', date: 'July 14', region: 'France', category: 'National' },
  { name: 'International Youth Day', date: 'August 12', region: 'UN Global', category: 'Observance' },
  { name: 'Diwali (Festival of Lights)', date: 'Oct/Nov (Varies)', region: 'India / Global', category: 'Cultural' },
  { name: 'Halloween', date: 'October 31', region: 'Global', category: 'Cultural' },
  { name: 'Thanksgiving', date: '4th Thu in Nov', region: 'USA / Canada', category: 'Civil' },
  { name: 'Christmas Day', date: 'December 25', region: 'Global', category: 'Religious / Cultural' },
  { name: 'Boxing Day', date: 'December 26', region: 'UK / Commonwealth', category: 'Public Holiday' },
];

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export function generateStudyQuiz(topic: string): QuizQuestion[] {
  const norm = topic.toLowerCase();
  if (norm.includes('history') || norm.includes('ancient')) {
    return [
      {
        question: 'Which civilization constructed the Great Pyramid of Giza?',
        options: ['Ancient Egypt', 'Babylonians', 'Romans', 'Mayans'],
        correctIndex: 0,
        explanation: 'Built around 2560 BC by Pharaoh Khufu during the Old Kingdom of Egypt.',
      },
      {
        question: 'In what year did the Western Roman Empire formally collapse?',
        options: ['476 AD', '325 AD', '800 AD', '1066 AD'],
        correctIndex: 0,
        explanation: 'The overthrow of Romulus Augustulus occurred in 476 AD.',
      },
      {
        question: 'The Magna Carta was signed in which year?',
        options: ['1215', '1492', '1776', '1348'],
        correctIndex: 0,
        explanation: 'King John granted the Magna Carta at Runnymede in 1215.',
      },
    ];
  }

  if (norm.includes('science') || norm.includes('physics') || norm.includes('chemistry')) {
    return [
      {
        question: 'What is the chemical symbol for Gold?',
        options: ['Au', 'Ag', 'Fe', 'Cu'],
        correctIndex: 0,
        explanation: 'Au derives from the Latin word "Aurum".',
      },
      {
        question: 'Which subatomic particle carries a negative electrical charge?',
        options: ['Electron', 'Proton', 'Neutron', 'Photon'],
        correctIndex: 0,
        explanation: 'Electrons have a negative charge and orbit the nucleus.',
      },
      {
        question: 'What is the speed of light in a vacuum approximately?',
        options: ['300,000 km/s', '150,000 km/s', '500,000 km/s', '30,000 km/s'],
        correctIndex: 0,
        explanation: 'The speed of light c is approximately 299,792 km/s.',
      },
    ];
  }

  // Default general knowledge / learning quiz
  return [
    {
      question: `What is a primary objective when studying "${topic || 'General Studies'}"?`,
      options: [
        'Mastering core definitions and fundamental principles',
        'Memorizing trivia without conceptual understanding',
        'Skipping review and testing intervals',
        'Avoiding practical real-world applications',
      ],
      correctIndex: 0,
      explanation: 'Conceptual grounding enables long-term memory retention and agile application.',
    },
    {
      question: 'Which learning technique improves recall through spaced intervals?',
      options: [
        'Spaced Repetition System (SRS)',
        'Cramming right before tests',
        'Passive rereading of notes',
        'Multitasking during study sessions',
      ],
      correctIndex: 0,
      explanation: 'Spaced repetition reinforces neural connections before memories decay.',
    },
    {
      question: 'The Feynman Technique is best described as:',
      options: [
        'Explaining a concept in simple language to a novice',
        'Creating 100 flashcards per hour',
        'Speed reading 1000 words per minute',
        'Taking verbatim notes during lectures',
      ],
      correctIndex: 0,
      explanation: 'Teaching a concept simply exposes hidden knowledge gaps and sharpens mastery.',
    },
  ];
}
