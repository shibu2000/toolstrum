import { CANONICAL_TOOLS } from '../data/registry';
import { TEXT_TOOLS, getTextToolConfig, TextWorkspaceId } from '../features/tools/text/textConfig';
import {
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toPascalCase,
  removeExtraSpaces,
  removeEmptyLines,
  removeDuplicateLines,
  sortLines,
  reverseText,
  findAndReplace,
  textToSlug,
  slugToText,
  extractUrls,
  extractEmails,
  extractPhoneNumbers,
  textToAscii,
  asciiToText,
  inspectUnicode,
  encodeText,
  decodeText,
  calculateTextMetrics,
  generateLoremIpsum,
  generateRandomText,
  generateNameList,
  generateMarkdownTable,
  generateMeetingNotes,
  generateResumeTemplate,
  generateEmailTemplate,
  checkOfflineGrammarAndStyle,
  convertBengaliNumerals,
  computeTextDiff,
  splitText,
  mergeText,
  repeatText,
} from '../features/tools/text/shared/TextHelpers';

console.log('--- STARTING TEXT STUDIO CONSOLIDATION TEST SUITE ---');

// 1. Audit Canonical Tools 205–243
console.log('1. Auditing Canonical Catalog Entries for Tools 205–243...');
const textTools = CANONICAL_TOOLS.filter((t) => t.id >= 205 && t.id <= 243);
if (textTools.length !== 39) {
  throw new Error(`Expected exactly 39 Text tools (205–243), found ${textTools.length}`);
}

const EXPECTED_TEXT_TOOLS: Record<number, string> = {
  205: 'Word Counter',
  206: 'Character Counter',
  207: 'Sentence Counter',
  208: 'Paragraph Counter',
  209: 'Reading Time Calculator',
  210: 'Case Converter',
  211: 'Remove Extra Spaces',
  212: 'Remove Empty Lines',
  213: 'Remove Duplicate Lines',
  214: 'Sort Lines',
  215: 'Reverse Text',
  216: 'Find & Replace',
  217: 'Text Diff Checker',
  218: 'Text Splitter',
  219: 'Text Merger',
  220: 'Text Repeater',
  221: 'Text to Slug',
  222: 'Slug to Text',
  223: 'URL Extractor',
  224: 'Email Extractor',
  225: 'Phone Number Extractor',
  226: 'Text to ASCII',
  227: 'ASCII to Text',
  228: 'Unicode Inspector',
  229: 'Text Encoder',
  230: 'Text Decoder',
  231: 'Lorem Ipsum Generator',
  232: 'Random Text Generator',
  233: 'Name List Generator',
  234: 'Text Statistics',
  235: 'Grammar Assistant',
  236: 'Spell Checker',
  237: 'Readability Analyzer',
  238: 'Markdown Editor',
  239: 'Markdown Table Generator',
  240: 'Meeting Notes Formatter',
  241: 'Resume Text Formatter',
  242: 'Email Draft Assistant',
  243: 'Bengali-English Text Helper',
};

for (const tool of textTools) {
  const expectedName = EXPECTED_TEXT_TOOLS[tool.id];
  if (!expectedName) {
    throw new Error(`Unexpected tool ID ${tool.id} in Text Studio range`);
  }
  if (tool.name !== expectedName) {
    throw new Error(`Catalog mismatch for tool ${tool.id}: expected "${expectedName}", got "${tool.name}"`);
  }
}
console.log('✅ Canonical catalog integrity verified for all 39 tools (205–243).');

// 2. Audit Workspace Mapping in textConfig
console.log('2. Auditing Workspace Configurations...');
const EXPECTED_WORKSPACES: Record<TextWorkspaceId, number[]> = {
  text_counters_stats: [205, 206, 207, 208, 209, 234, 237],
  text_cleaner_lines: [210, 211, 212, 213, 214, 215, 216],
  text_transform_diff: [217, 218, 219, 220, 221, 222],
  text_extract_codec: [223, 224, 225, 226, 227, 228, 229, 230],
  text_generators_templates: [231, 232, 233, 235, 236, 238, 239, 240, 241, 242, 243],
};

let totalMapped = 0;
for (const [workspace, ids] of Object.entries(EXPECTED_WORKSPACES)) {
  for (const id of ids) {
    const config = getTextToolConfig(id);
    if (!config) {
      throw new Error(`Missing config for tool ID ${id}`);
    }
    if (config.workspace !== workspace) {
      throw new Error(`Tool ${id} mapped to wrong workspace: expected ${workspace}, got ${config.workspace}`);
    }
    if (!config.defaultOperation || config.supportedOperations.length === 0) {
      throw new Error(`Tool ${id} has incomplete operation definitions`);
    }
    totalMapped++;
  }
}

if (totalMapped !== 39) {
  throw new Error(`Expected 39 mapped tools across 5 workspaces, got ${totalMapped}`);
}
console.log('✅ All 39 tools successfully mapped across 5 consolidated workspaces.');

// 3. Test Case Converters
console.log('3. Testing Case Converters...');
const testPhrase = 'toolstrum offline suite';
if (toTitleCase(testPhrase) !== 'Toolstrum Offline Suite') throw new Error('toTitleCase failed');
if (toCamelCase(testPhrase) !== 'toolstrumOfflineSuite') throw new Error('toCamelCase failed');
if (toSnakeCase(testPhrase) !== 'toolstrum_offline_suite') throw new Error('toSnakeCase failed');
if (toKebabCase(testPhrase) !== 'toolstrum-offline-suite') throw new Error('toKebabCase failed');
if (toPascalCase(testPhrase) !== 'ToolstrumOfflineSuite') throw new Error('toPascalCase failed');
console.log('✅ Case converters verified.');

// 4. Test Line Operations
console.log('4. Testing Line Operations...');
const messySpaces = '  hello   world  \n  offline   suite  ';
if (removeExtraSpaces(messySpaces) !== 'hello world\noffline suite') {
  throw new Error('removeExtraSpaces failed');
}

const emptyLinesInput = 'line 1\n\n   \nline 2\n\nline 3';
if (removeEmptyLines(emptyLinesInput) !== 'line 1\nline 2\nline 3') {
  throw new Error('removeEmptyLines failed');
}

const dupLinesInput = 'apple\nbanana\nApple\nbanana\ncherry';
if (removeDuplicateLines(dupLinesInput, false) !== 'apple\nbanana\nApple\ncherry') {
  throw new Error('removeDuplicateLines case-sensitive failed');
}
if (removeDuplicateLines(dupLinesInput, true) !== 'apple\nbanana\ncherry') {
  throw new Error('removeDuplicateLines case-insensitive failed');
}

const unsorted = 'cherry\napple\nbanana';
if (sortLines(unsorted, 'az') !== 'apple\nbanana\ncherry') throw new Error('sortLines az failed');
if (sortLines(unsorted, 'za') !== 'cherry\nbanana\napple') throw new Error('sortLines za failed');

if (reverseText('hello', 'chars') !== 'olleh') throw new Error('reverse chars failed');
if (reverseText('line 1\nline 2', 'lines') !== 'line 2\nline 1') throw new Error('reverse lines failed');

const replaced = findAndReplace('Toolstrum is cool', 'cool', 'fast', false, false);
if (replaced !== 'Toolstrum is fast') throw new Error('findAndReplace failed');
console.log('✅ Line operations verified.');

// 5. Test Slugs & Extractors
console.log('5. Testing Slugs and Extractors...');
if (textToSlug('Hello World 2026!') !== 'hello-world-2026') throw new Error('textToSlug failed');
if (slugToText('hello-world-2026') !== 'Hello World 2026') throw new Error('slugToText failed');

const rawCorpus = `
Contact dev@toolstrum.app or support@test.com.
Visit https://toolstrum.app/docs or http://github.com/repo.
Call (555) 123-4567 or +1-800-555-0199.
`;
const urls = extractUrls(rawCorpus);
if (urls.length !== 2 || !urls.includes('https://toolstrum.app/docs')) throw new Error('extractUrls failed');

const emails = extractEmails(rawCorpus);
if (emails.length !== 2 || !emails.includes('dev@toolstrum.app')) throw new Error('extractEmails failed');

const phones = extractPhoneNumbers(rawCorpus);
if (phones.length < 1) throw new Error('extractPhoneNumbers failed');
console.log('✅ Slugs and Extractors verified.');

// 6. Test ASCII & Encoders
console.log('6. Testing ASCII & Codecs...');
const asciiSample = 'ABC';
const asciiDec = textToAscii(asciiSample, 'decimal');
if (asciiDec !== '65 66 67') throw new Error('textToAscii decimal failed');
if (asciiToText(asciiDec, 'decimal') !== 'ABC') throw new Error('asciiToText decimal failed');

const b64 = encodeText('Hello', 'base64');
if (decodeText(b64, 'base64') !== 'Hello') throw new Error('Base64 codec failed');

const hex = encodeText('Hi', 'hex');
if (decodeText(hex, 'hex') !== 'Hi') throw new Error('Hex codec failed');

const unicodeInfo = inspectUnicode('A');
if (unicodeInfo.length !== 1 || unicodeInfo[0].hex !== 'U+0041') throw new Error('inspectUnicode failed');
console.log('✅ ASCII and Codecs verified.');

// 7. Test Readability & Metrics
console.log('7. Testing Readability and Metrics...');
const metrics = calculateTextMetrics('This is a simple sentence. Here is another clear statement.');
if (metrics.words !== 10) throw new Error(`Expected 10 words, got ${metrics.words}`);
if (metrics.sentences !== 2) throw new Error(`Expected 2 sentences, got ${metrics.sentences}`);
if (metrics.fleschReadingEase <= 0 || metrics.fleschReadingEase > 100) {
  throw new Error(`Invalid Flesch Reading Ease score: ${metrics.fleschReadingEase}`);
}
console.log('✅ Readability metrics calculation verified.');

// 8. Test Generators, Templates & Bengali Helper
console.log('8. Testing Generators and Templates...');
const lorem = generateLoremIpsum(2, 'paragraphs');
if (!lorem || lorem.split('\n\n').length !== 2) throw new Error('generateLoremIpsum failed');

const uuid = generateRandomText(16, 'uuid');
if (!uuid || uuid.length !== 36) throw new Error('generateRandomText uuid failed');

const names = generateNameList(3, 'full');
if (names.length !== 3) throw new Error('generateNameList failed');

const mdTable = generateMarkdownTable(2, 2, 'center');
if (!mdTable.includes('| Header 1 | Header 2 |') || !mdTable.includes(':---:')) {
  throw new Error('generateMarkdownTable failed');
}

const bnConverted = convertBengaliNumerals('১২৩৪৫', 'bn_to_en');
if (bnConverted !== '12345') throw new Error('convertBengaliNumerals bn_to_en failed');
const enConverted = convertBengaliNumerals('12345', 'en_to_bn');
if (enConverted !== '১২৩৪৫') throw new Error('convertBengaliNumerals en_to_bn failed');

const grammarCheck = checkOfflineGrammarAndStyle('We must do this in order to test the the system.');
if (grammarCheck.length < 2) throw new Error('checkOfflineGrammarAndStyle failed to find issues');
console.log('✅ Generators, Templates, and Bengali helper verified.');

// 9. Test Diff & Chunking
console.log('9. Testing Diff and Chunking...');
const diff = computeTextDiff('Line 1\nLine 2', 'Line 1\nLine 2 modified');
if (diff.additions !== 1 || diff.deletions !== 1) throw new Error('computeTextDiff failed');

const chunks = splitText('a,b,c,d', 'delimiter', { delimiter: ',' });
if (chunks.length !== 4) throw new Error('splitText failed');

const merged = mergeText(['a', 'b'], '\n', '', '', true);
if (merged !== '1. a\n2. b') throw new Error('mergeText numbered failed');

const repeated = repeatText('hello', 3, ' ');
if (repeated !== 'hello hello hello') throw new Error('repeatText failed');
console.log('✅ Diff, split, merge, and repeat verified.');

console.log('--- ALL TEXT STUDIO TESTS PASSED WITH 100% SUCCESS ---');
