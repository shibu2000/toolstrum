import { CANONICAL_TOOLS } from '../data/registry';
import {
  AI_TOOLS_CONFIG,
  getAiToolConfig,
} from '../features/tools/ai/aiConfig';
import {
  routePromptToTool,
  parseVoiceCommand,
  generateStudyFlashcards,
  summarizeDocumentOutline,
  extractDocumentEntities,
  compareDocumentsSemantically,
  analyzeDataTrends,
  rewriteTextTone,
  buildResumeBulletPoints,
  generateEmailDraft,
  parseMeetingTranscript,
  explainCodeSnippet,
  translatePhrase,
} from '../features/tools/ai/shared/AiHelpers';

console.log('--- STARTING AI STUDIO CONSOLIDATION TEST SUITE ---');

// 1. Audit Canonical Catalog Entries for Tools 401–416
console.log('1. Auditing Canonical Catalog Entries for Tools 401–416...');
const aiTools = CANONICAL_TOOLS.filter((t) => t.id >= 401 && t.id <= 416);
if (aiTools.length !== 16) {
  throw new Error(`Expected exactly 16 AI tools (401–416), found ${aiTools.length}`);
}

for (let id = 401; id <= 416; id++) {
  const config = getAiToolConfig(id);
  if (!config) {
    throw new Error(`Missing AI configuration for tool ID ${id}`);
  }
  if (config.id !== id || !config.title || !config.workspaceId) {
    throw new Error(`Invalid configuration for tool ID ${id}`);
  }
}
console.log('✔ All 16 AI Studio tools are canonically registered and configured.');

// 2. Workspace Group Distribution
console.log('2. Verifying Workspace Group Distributions...');
const groups: Record<string, number> = {
  ai_assistant_router: 0,
  ai_docs_analysis: 0,
  ai_writing_summarizer: 0,
  ai_vision_code_translator: 0,
};

for (let id = 401; id <= 416; id++) {
  const config = getAiToolConfig(id)!;
  groups[config.workspaceId]++;
}

if (groups.ai_assistant_router !== 4) {
  throw new Error(`Expected 4 Assistant/Router tools, got ${groups.ai_assistant_router}`);
}
if (groups.ai_docs_analysis !== 4) {
  throw new Error(`Expected 4 Docs Analysis tools, got ${groups.ai_docs_analysis}`);
}
if (groups.ai_writing_summarizer !== 4) {
  throw new Error(`Expected 4 Writing Summarizer tools, got ${groups.ai_writing_summarizer}`);
}
if (groups.ai_vision_code_translator !== 4) {
  throw new Error(`Expected 4 Vision/Code/Translation tools, got ${groups.ai_vision_code_translator}`);
}
console.log('✔ All 4 AI workspaces correctly partition the 16 tools.');

// 3. AI Smart Tool Router & Voice Command Tests
console.log('3. Testing AI Assistant & Smart Tool Router...');
const routerMatches = routePromptToTool('combine and merge pdf pages');
if (routerMatches.length === 0 || !routerMatches.some((m) => m.tool.studioId === 'pdf')) {
  throw new Error(`Failed to route PDF query to PDF tools: ${JSON.stringify(routerMatches)}`);
}

const qrMatch = routePromptToTool('generate wifi qr code');
if (qrMatch.length === 0 || !qrMatch.some((m) => m.tool.name.toLowerCase().includes('qr'))) {
  throw new Error(`Failed to route QR prompt to QR tools: ${JSON.stringify(qrMatch)}`);
}

const voiceAction = parseVoiceCommand('compress video file for email');
if (voiceAction.action !== 'COMPRESS_ASSET' || voiceAction.confidence < 80) {
  throw new Error(`Failed to parse voice command: ${JSON.stringify(voiceAction)}`);
}

const flashcards = generateStudyFlashcards('Osmosis is the spontaneous movement of solvent molecules through a selectively permeable membrane.');
if (flashcards.length === 0 || !flashcards[0].question.includes('Osmosis') || !flashcards[0].answer) {
  throw new Error(`Flashcard generator failed: ${JSON.stringify(flashcards)}`);
}
console.log('✔ AI Assistant & Smart Tool Router operations validated.');

// 4. Document & PDF Intelligence Tests
console.log('4. Testing Document & PDF Intelligence...');
const docText = `# Project Overview\nWe built an offline toolkit with 500 utilities.\n## Architecture\nZero cloud uploads.`;
const docOutline = summarizeDocumentOutline(docText);
if (docOutline.headings.length < 2 || docOutline.wordCount === 0) {
  throw new Error(`Document outline extraction failed: ${JSON.stringify(docOutline)}`);
}

const contractText = 'Contract signed on 2026-10-10 by Acme Corp Technologies. Total fee is $15,000 USD. Contact lead at dev@acme.com.';
const entities = extractDocumentEntities(contractText);
if (entities.dates.length === 0 || entities.amounts.length === 0 || entities.emails.length === 0) {
  throw new Error(`Entity extractor failed to isolate dates or amounts: ${JSON.stringify(entities)}`);
}

const docA = 'The vendor will deliver assets within 30 days.\nFee is $5,000.';
const docB = 'The vendor will deliver assets within 45 days.\nFee is $5,000.\nWarranty is included.';
const diff = compareDocumentsSemantically(docA, docB);
if (diff.similarityScore < 40 || diff.addedClauses.length === 0) {
  throw new Error(`Document comparison failed: ${JSON.stringify(diff)}`);
}

const trendRes = analyzeDataTrends([10, 20, 30, 40, 50, 60]);
if (trendRes.trend !== 'Upward' || trendRes.mean !== 35) {
  throw new Error(`Data trend analysis failed: ${JSON.stringify(trendRes)}`);
}
console.log('✔ Document and Data Intelligence operations validated.');

// 5. Writing & Summarization Tests
console.log('5. Testing Writing & Summarization...');
const rawDraft = "Hey guys, can't make it asap, thanks.";
const professionalDraft = rewriteTextTone(rawDraft, 'professional');
if (professionalDraft.includes("can't") || !professionalDraft.includes('cannot') || !professionalDraft.includes('thank you')) {
  throw new Error(`Tone rewrite failed: ${professionalDraft}`);
}

const resumeBullets = buildResumeBulletPoints('Mobile Engineer', 'built the camera scanner and reduced app latency');
if (resumeBullets.length === 0 || !resumeBullets[0].startsWith('•')) {
  throw new Error(`Resume bullet generator failed: ${JSON.stringify(resumeBullets)}`);
}

const email = generateEmailDraft('Release Status', 'Alex', ['All tests passing', 'No linter errors']);
if (!email.includes('Alex') || !email.includes('All tests passing') || !email.includes('Subject:')) {
  throw new Error(`Email generator failed: ${email}`);
}

const transcript = 'Meeting started.\nAlice: We will launch next week.\nBob: Confirmed release date.\nTask: Run simulator tests.';
const meeting = parseMeetingTranscript(transcript);
if (meeting.decisions.length === 0 || meeting.actionItems.length === 0) {
  throw new Error(`Meeting transcript parser failed: ${JSON.stringify(meeting)}`);
}
console.log('✔ Writing & Summarization operations validated.');

// 6. Vision, Code & Translation Tests
console.log('6. Testing Vision, Code & Translation...');
const codeAnalysis = explainCodeSnippet('for (let i = 0; i < n; i++) { sum += arr[i]; }', 'JavaScript');
if (!codeAnalysis.complexity.includes('O(N)') || !codeAnalysis.hasLoops) {
  throw new Error(`Code analysis failed: ${JSON.stringify(codeAnalysis)}`);
}

const esPhrase = translatePhrase('thank you', 'es');
if (esPhrase !== 'gracias') {
  throw new Error(`Spanish translation failed: expected "gracias", got "${esPhrase}"`);
}

const frPhrase = translatePhrase('hello', 'fr');
if (frPhrase !== 'bonjour') {
  throw new Error(`French translation failed: expected "bonjour", got "${frPhrase}"`);
}

const dePhrase = translatePhrase('goodbye', 'de');
if (!dePhrase.includes('auf wiedersehen')) {
  throw new Error(`German translation failed: expected "auf wiedersehen", got "${dePhrase}"`);
}

const hiPhrase = translatePhrase('thank you', 'hi');
if (!hiPhrase.includes('धन्यवाद')) {
  throw new Error(`Hindi translation failed: expected "धन्यवाद", got "${hiPhrase}"`);
}
console.log('✔ Vision, Code and Translation operations validated.');

console.log('--- ALL AI STUDIO TESTS PASSED (100%) ---');
