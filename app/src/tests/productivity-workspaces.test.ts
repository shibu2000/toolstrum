import { CANONICAL_TOOLS } from '../data/registry';
import {
  PRODUCTIVITY_TOOL_CONFIGS,
  PRODUCTIVITY_WORKSPACES,
  getProductivityToolConfig,
  getProductivityWorkspaceTools,
} from '../features/tools/productivity/productivityConfig';
import {
  calculateExpenseSplit,
  summarizePersonalExpenses,
  calculateMonthlyBudget,
  formatInvoiceDocument,
  generateVCardPayload,
  formatResumeText,
  lookupDictionaryWord,
  analyzeReadingMetrics,
  calculateDateSpan,
  analyzeBirthday,
  WORLD_HOLIDAYS,
  generateStudyQuiz,
} from '../features/tools/productivity/shared/ProductivityHelpers';

console.log('--- STARTING PRODUCTIVITY & EDUCATION STUDIO TEST SUITE ---');

// 1. Audit Canonical Catalog Entries for Tools 417–450
console.log('1. Auditing Canonical Catalog Entries for Tools 417–450...');
const prodTools = CANONICAL_TOOLS.filter((t) => t.id >= 417 && t.id <= 450);
if (prodTools.length !== 34) {
  throw new Error(`Expected exactly 34 Productivity tools (417–450), found ${prodTools.length}`);
}

for (let id = 417; id <= 450; id++) {
  const config = getProductivityToolConfig(id);
  if (!config) {
    throw new Error(`Missing Productivity configuration for tool ID ${id}`);
  }
  if (!PRODUCTIVITY_WORKSPACES[config.workspaceId]) {
    throw new Error(`Invalid workspace ID ${config.workspaceId} for tool ID ${id}`);
  }
}
console.log('✓ All 34 Productivity tools are canonically registered and configured.');

// 2. Audit Workspace Mapping Integrity
console.log('2. Auditing Workspace Mappings (6 Workspaces)...');
const workspaces = Object.keys(PRODUCTIVITY_WORKSPACES) as Array<
  keyof typeof PRODUCTIVITY_WORKSPACES
>;
if (workspaces.length !== 6) {
  throw new Error(`Expected exactly 6 workspaces, found ${workspaces.length}`);
}

let totalWorkspaceTools = 0;
for (const wId of workspaces) {
  const tools = getProductivityWorkspaceTools(wId);
  if (tools.length === 0) {
    throw new Error(`Workspace ${wId} has zero registered tools`);
  }
  totalWorkspaceTools += tools.length;
}

if (totalWorkspaceTools !== 34) {
  throw new Error(`Expected 34 workspace tools total, found ${totalWorkspaceTools}`);
}
console.log('✓ All 6 workspaces contain exactly 34 tools total.');

// 3. Audit Expense Splitter Engine
console.log('3. Auditing Expense Splitter Engine...');
const sampleExpenses = [
  { payer: 'Alice', amount: 90, participants: ['Alice', 'Bob', 'Charlie'] },
  { payer: 'Bob', amount: 30, participants: ['Alice', 'Bob', 'Charlie'] },
];
const splitResult = calculateExpenseSplit(sampleExpenses);
if (splitResult.totalSpent !== 120) {
  throw new Error(`Expected total spent 120, got ${splitResult.totalSpent}`);
}
if (splitResult.balances['Alice'] !== 50) {
  throw new Error(`Expected Alice balance 50, got ${splitResult.balances['Alice']}`);
}
if (splitResult.settlements.length === 0) {
  throw new Error('Expected at least one debt settlement transfer');
}
console.log('✓ Expense Splitter engine calculates fair balances and settlements.');

// 4. Audit Personal Expense & Budget Engines
console.log('4. Auditing Personal Expense & Budget Engines...');
const expRecords = [
  { category: 'Dining', description: 'Lunch', amount: 20, date: 'Today' },
  { category: 'Groceries', description: 'Store', amount: 80, date: 'Today' },
];
const summary = summarizePersonalExpenses(expRecords);
if (summary.total !== 100) {
  throw new Error(`Expected total 100, got ${summary.total}`);
}
if (summary.byCategory[0].category !== 'Groceries' || summary.byCategory[0].percentage !== 80) {
  throw new Error(`Unexpected category summary breakdown`);
}

const budgetRes = calculateMonthlyBudget(2000, [
  { name: 'Rent', budget: 1000, spent: 1000 },
  { name: 'Dining', budget: 200, spent: 250 },
]);
if (budgetRes.totalSpent !== 1250) {
  throw new Error(`Expected total spent 1250, got ${budgetRes.totalSpent}`);
}
if (!budgetRes.overBudgetCategories.includes('Dining')) {
  throw new Error('Expected Dining to be flagged as over budget');
}
console.log('✓ Personal Expense and Budget engines computed accurate statistics.');

// 5. Audit Business & Career Documents
console.log('5. Auditing Business & Career Document Engines...');
const invDoc = formatInvoiceDocument({
  invoiceNumber: 'INV-TEST-001',
  senderName: 'Acme Studio',
  clientName: 'Client Beta',
  dueDate: 'Net 30',
  items: [{ description: 'Dev Consultation', quantity: 2, unitPrice: 150 }],
  taxRatePercent: 10,
  discountAmount: 30,
});
if (invDoc.subtotal !== 300 || invDoc.taxAmount !== 30 || invDoc.grandTotal !== 300) {
  throw new Error(`Unexpected invoice math: subtotal ${invDoc.subtotal}, total ${invDoc.grandTotal}`);
}
if (!invDoc.formattedText.includes('INV-TEST-001') || !invDoc.formattedText.includes('TOTAL DUE:   $300.00')) {
  throw new Error('Invoice text does not contain required headers');
}

const vCardText = generateVCardPayload({
  fullName: 'Sarah Connor',
  title: 'Director',
  company: 'Cyberdyne',
  phone: '555-1234',
  email: 'sarah@cyberdyne.org',
  website: 'https://cyberdyne.org',
  address: '100 Tech Blvd',
});
if (!vCardText.includes('BEGIN:VCARD') || !vCardText.includes('FN:Sarah Connor') || !vCardText.includes('END:VCARD')) {
  throw new Error('Invalid vCard payload generation');
}

const resumeOutput = formatResumeText({
  fullName: 'Morgan Freeman',
  email: 'morgan@voice.io',
  phone: '555-0987',
  location: 'LA',
  summary: 'Narrator',
  skills: ['Audio', 'Performance'],
  experience: [{ role: 'Narrator', company: 'Cinema', duration: '1980-2026', details: 'Voiceover' }],
  education: [{ degree: 'B.A.', institution: 'College', year: '1970' }],
});
if (!resumeOutput.includes('# MORGAN FREEMAN') || !resumeOutput.includes('Audio • Performance')) {
  throw new Error('Resume markdown generation failed');
}
console.log('✓ Invoice, vCard, and Resume formatters validated.');

// 6. Audit Education & Lexicon Engines
console.log('6. Auditing Education & Lexicon Engines...');
const dictResult = lookupDictionaryWord('serendipity');
if (!dictResult.phonetic || dictResult.synonyms.length === 0 || dictResult.antonyms.length === 0) {
  throw new Error('Dictionary entry incomplete for serendipity');
}

const metrics = analyzeReadingMetrics('The quick brown fox jumps over the lazy dog. Secure offline computation is great.', 200);
if (metrics.wordCount < 10 || metrics.readingSeconds < 1 || metrics.readabilityScore < 10) {
  throw new Error('Text reading metrics computation failed');
}

const quiz = generateStudyQuiz('physics');
if (quiz.length !== 3 || quiz[0].options.length !== 4) {
  throw new Error('Quiz question generation failed');
}
console.log('✓ Dictionary, reading metrics, and quiz generation validated.');

// 7. Audit Time, Calendar & Holiday Engines
console.log('7. Auditing Time, Calendar & Holiday Engines...');
const span = calculateDateSpan('2026-10-12', '2026-10-16');
if (span.totalDays !== 4 || span.businessDays !== 5) {
  throw new Error(`Unexpected span calculation: totalDays ${span.totalDays}, businessDays ${span.businessDays}`);
}

const bday = analyzeBirthday('1990-07-15');
if (bday.zodiacSign !== 'Cancer' || bday.age < 30) {
  throw new Error('Birthday and zodiac analysis failed');
}

if (WORLD_HOLIDAYS.length < 15) {
  throw new Error('World holiday dataset has fewer than 15 holidays');
}
console.log('✓ Calendar math, birthday analysis, and holiday calendar validated.');

console.log('🎉 ALL PRODUCTIVITY & EDUCATION STUDIO TESTS PASSED (100% OK)!');
