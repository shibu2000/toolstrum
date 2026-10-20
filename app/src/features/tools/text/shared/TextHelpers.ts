/**
 * Zero-dependency pure algorithmic helpers for Text & Writing operations.
 * 100% testable in Bun, Node, and React Native environments.
 */

export interface TextMetrics {
  words: number;
  uniqueWords: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  syllables: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  readingLevelDescription: string;
}

export interface UnicodeCharInfo {
  char: string;
  codePoint: number;
  hex: string;
  utf8Bytes: string;
}

// Case Converters
export function toTitleCase(str: string): string {
  return str.replace(/\b[A-Za-z0-9]+/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
  });
}

export function toCamelCase(str: string): string {
  const words = str.trim().split(/[\s_\-]+/).filter(Boolean);
  if (words.length === 0) return '';
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('')
  );
}

export function toSnakeCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .split(/[\s_\-]+/)
    .map((w) => w.toLowerCase())
    .join('_');
}

export function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .split(/[\s_\-]+/)
    .map((w) => w.toLowerCase())
    .join('-');
}

export function toPascalCase(str: string): string {
  const words = str.trim().split(/[\s_\-]+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

// Line operations
export function removeExtraSpaces(text: string): string {
  return text
    .split('\n')
    .map((line) => line.trim().replace(/[ \t]+/g, ' '))
    .join('\n');
}

export function removeEmptyLines(text: string): string {
  return text
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .join('\n');
}

export function removeDuplicateLines(text: string, caseInsensitive = false): string {
  const lines = text.split('\n');
  const seen = new Set<string>();
  const result: string[] = [];

  for (const line of lines) {
    const key = caseInsensitive ? line.toLowerCase() : line;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(line);
    }
  }

  return result.join('\n');
}

export function sortLines(
  text: string,
  mode: 'az' | 'za' | 'length_asc' | 'length_desc' | 'natural' = 'az'
): string {
  const lines = text.split('\n');

  if (mode === 'az') {
    lines.sort((a, b) => a.localeCompare(b));
  } else if (mode === 'za') {
    lines.sort((a, b) => b.localeCompare(a));
  } else if (mode === 'length_asc') {
    lines.sort((a, b) => a.length - b.length || a.localeCompare(b));
  } else if (mode === 'length_desc') {
    lines.sort((a, b) => b.length - a.length || a.localeCompare(b));
  } else if (mode === 'natural') {
    lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  }

  return lines.join('\n');
}

export function reverseText(text: string, mode: 'chars' | 'words' | 'lines' = 'chars'): string {
  if (mode === 'chars') {
    return Array.from(text).reverse().join('');
  }
  if (mode === 'words') {
    return text.split(/(\s+)/).reverse().join('');
  }
  return text.split('\n').reverse().join('\n');
}

export function findAndReplace(
  text: string,
  searchStr: string,
  replaceStr: string,
  caseSensitive = false,
  useRegex = false
): string {
  if (!searchStr) return text;

  if (useRegex) {
    try {
      const flags = caseSensitive ? 'g' : 'gi';
      const reg = new RegExp(searchStr, flags);
      return text.replace(reg, replaceStr);
    } catch {
      return text;
    }
  }

  if (caseSensitive) {
    return text.split(searchStr).join(replaceStr);
  }

  const reg = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  return text.replace(reg, replaceStr);
}

// Slugs
export function textToSlug(text: string, separator = '-'): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
}

export function slugToText(slug: string): string {
  return slug
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Extractors
export function extractUrls(text: string): string[] {
  const urlRegex = /\b(?:https?:\/\/|www\.)[A-Za-z0-9.\-_~:/?#[\]@!$&'()*+,;=%]+/gi;
  const matches = text.match(urlRegex) || [];
  return Array.from(new Set(matches));
}

export function extractEmails(text: string): string[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = text.match(emailRegex) || [];
  return Array.from(new Set(matches));
}

export function extractPhoneNumbers(text: string): string[] {
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const matches = text.match(phoneRegex) || [];
  return Array.from(new Set(matches.map((p) => p.trim())));
}

// ASCII and Unicode
export function textToAscii(text: string, mode: 'decimal' | 'hex' | 'binary' = 'decimal'): string {
  return Array.from(text)
    .map((c) => {
      const code = c.charCodeAt(0);
      if (mode === 'hex') return code.toString(16).toUpperCase().padStart(2, '0');
      if (mode === 'binary') return code.toString(2).padStart(8, '0');
      return code.toString(10);
    })
    .join(' ');
}

export function asciiToText(asciiStr: string, mode: 'decimal' | 'hex' | 'binary' = 'decimal'): string {
  const tokens = asciiStr.trim().split(/\s+/).filter(Boolean);
  return tokens
    .map((token) => {
      const radix = mode === 'hex' ? 16 : mode === 'binary' ? 2 : 10;
      const code = parseInt(token, radix);
      return isNaN(code) ? '' : String.fromCharCode(code);
    })
    .join('');
}

export function inspectUnicode(text: string): UnicodeCharInfo[] {
  return Array.from(text.slice(0, 100)).map((char) => {
    const codePoint = char.codePointAt(0) || 0;
    const hex = 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0');
    const utf8Bytes = Array.from(new TextEncoder().encode(char))
      .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');
    return {
      char,
      codePoint,
      hex,
      utf8Bytes,
    };
  });
}

// Encoders and Decoders
export function encodeText(text: string, mode: 'base64' | 'hex' | 'url' | 'html'): string {
  if (mode === 'base64') {
    return btoa(unescape(encodeURIComponent(text)));
  }
  if (mode === 'hex') {
    return Array.from(new TextEncoder().encode(text))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  if (mode === 'url') {
    return encodeURIComponent(text);
  }
  // html
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function decodeText(encoded: string, mode: 'base64' | 'hex' | 'url' | 'html'): string {
  if (mode === 'base64') {
    try {
      return decodeURIComponent(escape(atob(encoded.trim())));
    } catch {
      return encoded;
    }
  }
  if (mode === 'hex') {
    try {
      const clean = encoded.replace(/\s+/g, '');
      const bytes = new Uint8Array(clean.length / 2);
      for (let i = 0; i < clean.length; i += 2) {
        bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
      }
      return new TextDecoder().decode(bytes);
    } catch {
      return encoded;
    }
  }
  if (mode === 'url') {
    try {
      return decodeURIComponent(encoded);
    } catch {
      return encoded;
    }
  }
  // html
  return encoded
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

// Syllable Counter
export function countSyllablesInWord(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (w.length <= 3) return 1;
  const cleanWord = w.replace(/(?:[^laeiouy]|ed|es|e)$/, '').replace(/^y/, '');
  const matches = cleanWord.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

// Text Metrics & Readability
export function calculateTextMetrics(text: string): TextMetrics {
  if (!text || !text.trim()) {
    return {
      words: 0,
      uniqueWords: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      syllables: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      fleschReadingEase: 100,
      fleschKincaidGrade: 0,
      readingLevelDescription: 'Very Easy',
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s+/g, '').length;
  const rawWords = text.trim().match(/\b[A-Za-z0-9_\-']+\b/g) || [];
  const words = rawWords.length;
  const uniqueWords = new Set(rawWords.map((w) => w.toLowerCase())).size;

  const sentences = (text.match(/[^.!?]+[.!?]+/g) || []).length || (words > 0 ? 1 : 0);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length || (words > 0 ? 1 : 0);
  const lines = text.split(/\r?\n/).length;

  let totalSyllables = 0;
  rawWords.forEach((w) => {
    totalSyllables += countSyllablesInWord(w);
  });

  const readingTimeMinutes = Math.round((words / 200) * 10) / 10;
  const speakingTimeMinutes = Math.round((words / 130) * 10) / 10;

  // Flesch Reading Ease Formula: 206.835 - 1.015 * (total words / total sentences) - 84.6 * (total syllables / total words)
  let fleschReadingEase = 100;
  let fleschKincaidGrade = 0;

  if (words > 0 && sentences > 0) {
    const asl = words / sentences;
    const asw = totalSyllables / words;
    const fre = 206.835 - 1.015 * asl - 84.6 * asw;
    fleschReadingEase = Math.round(Math.max(0, Math.min(100, fre)) * 10) / 10;

    // Flesch-Kincaid Grade: 0.39 * asl + 11.8 * asw - 15.59
    const fkg = 0.39 * asl + 11.8 * asw - 15.59;
    fleschKincaidGrade = Math.round(Math.max(0, fkg) * 10) / 10;
  }

  let readingLevelDescription = 'Standard';
  if (fleschReadingEase >= 90) readingLevelDescription = '5th Grade (Very Easy)';
  else if (fleschReadingEase >= 80) readingLevelDescription = '6th Grade (Easy)';
  else if (fleschReadingEase >= 70) readingLevelDescription = '7th Grade (Fairly Easy)';
  else if (fleschReadingEase >= 60) readingLevelDescription = '8th & 9th Grade (Standard)';
  else if (fleschReadingEase >= 50) readingLevelDescription = '10th to 12th Grade (Fairly Difficult)';
  else if (fleschReadingEase >= 30) readingLevelDescription = 'College Level (Difficult)';
  else readingLevelDescription = 'Professional Graduate (Very Difficult)';

  return {
    words,
    uniqueWords,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    syllables: totalSyllables,
    readingTimeMinutes,
    speakingTimeMinutes,
    fleschReadingEase,
    fleschKincaidGrade,
    readingLevelDescription,
  };
}

// Generators
const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
  'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
  'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation',
  'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis',
  'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum',
];

export function generateLoremIpsum(count = 3, mode: 'paragraphs' | 'sentences' | 'words' = 'paragraphs'): string {
  if (mode === 'words') {
    const list: string[] = [];
    for (let i = 0; i < count; i++) {
      list.push(LOREM_WORDS[i % LOREM_WORDS.length]);
    }
    return list.join(' ');
  }

  if (mode === 'sentences') {
    const sentences: string[] = [];
    for (let s = 0; s < count; s++) {
      const len = 8 + (s % 7);
      const sentenceWords: string[] = [];
      for (let i = 0; i < len; i++) {
        sentenceWords.push(LOREM_WORDS[(s * 5 + i) % LOREM_WORDS.length]);
      }
      const raw = sentenceWords.join(' ');
      sentences.push(raw.charAt(0).toUpperCase() + raw.slice(1) + '.');
    }
    return sentences.join(' ');
  }

  // Paragraphs
  const paragraphs: string[] = [];
  for (let p = 0; p < count; p++) {
    const pSentences: string[] = [];
    for (let s = 0; s < 4; s++) {
      const len = 7 + ((p + s) % 6);
      const sentenceWords: string[] = [];
      for (let i = 0; i < len; i++) {
        sentenceWords.push(LOREM_WORDS[(p * 8 + s * 4 + i) % LOREM_WORDS.length]);
      }
      const raw = sentenceWords.join(' ');
      pSentences.push(raw.charAt(0).toUpperCase() + raw.slice(1) + '.');
    }
    paragraphs.push(pSentences.join(' '));
  }
  return paragraphs.join('\n\n');
}

export function generateRandomText(length = 16, type: 'alphanumeric' | 'uuid' | 'hex' = 'alphanumeric'): string {
  if (type === 'uuid') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const chars =
    type === 'hex'
      ? '0123456789abcdef'
      : 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
}

const FIRST_NAMES = ['Aria', 'Ethan', 'Maya', 'Liam', 'Sofia', 'Lucas', 'Zoe', 'Noah', 'Amara', 'Kai'];
const LAST_NAMES = ['Vance', 'Chen', 'Patel', 'Kim', 'Morrison', 'Sinclair', 'Rahman', 'Novak', 'Alvarez', 'Zhang'];

export function generateNameList(count = 5, mode: 'full' | 'first' | 'last' = 'full'): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last = LAST_NAMES[(i * 3) % LAST_NAMES.length];
    if (mode === 'first') result.push(first);
    else if (mode === 'last') result.push(last);
    else result.push(`${first} ${last}`);
  }
  return result;
}

// Bengali Numeral Converter
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function convertBengaliNumerals(str: string, direction: 'bn_to_en' | 'en_to_bn'): string {
  let res = str;
  if (direction === 'bn_to_en') {
    for (let i = 0; i < 10; i++) {
      res = res.split(BN_DIGITS[i]).join(EN_DIGITS[i]);
    }
  } else {
    for (let i = 0; i < 10; i++) {
      res = res.split(EN_DIGITS[i]).join(BN_DIGITS[i]);
    }
  }
  return res;
}

// Diff calculations
export interface TextDiffLine {
  type: 'added' | 'deleted' | 'unchanged';
  text: string;
  lineNumOriginal?: number;
  lineNumModified?: number;
}

export interface TextDiffResult {
  lines: TextDiffLine[];
  additions: number;
  deletions: number;
  unchanged: number;
  similarityPercentage: number;
}

export function computeTextDiff(originalText: string, modifiedText: string): TextDiffResult {
  const origLines = originalText.split(/\r?\n/);
  const modLines = modifiedText.split(/\r?\n/);

  const lines: TextDiffLine[] = [];
  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  const maxLen = Math.max(origLines.length, modLines.length);

  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i];
    const m = modLines[i];

    if (o === undefined) {
      lines.push({ type: 'added', text: m, lineNumModified: i + 1 });
      additions++;
    } else if (m === undefined) {
      lines.push({ type: 'deleted', text: o, lineNumOriginal: i + 1 });
      deletions++;
    } else if (o === m) {
      lines.push({ type: 'unchanged', text: o, lineNumOriginal: i + 1, lineNumModified: i + 1 });
      unchanged++;
    } else {
      lines.push({ type: 'deleted', text: o, lineNumOriginal: i + 1 });
      lines.push({ type: 'added', text: m, lineNumModified: i + 1 });
      deletions++;
      additions++;
    }
  }

  const totalLines = additions + deletions + unchanged;
  const similarityPercentage =
    totalLines > 0 ? Math.round((unchanged / (unchanged + Math.max(additions, deletions))) * 100) : 100;

  return {
    lines,
    additions,
    deletions,
    unchanged,
    similarityPercentage,
  };
}

// Splitter, Merger & Repeater
export function splitText(
  text: string,
  mode: 'delimiter' | 'char_length' | 'words' = 'delimiter',
  options: { delimiter?: string; chunkSize?: number } = {}
): string[] {
  if (!text) return [];

  if (mode === 'delimiter') {
    const delim = options.delimiter ?? '\n';
    return text.split(delim);
  }

  if (mode === 'char_length') {
    const size = Math.max(1, options.chunkSize || 50);
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  }

  // words
  const size = Math.max(1, options.chunkSize || 10);
  const words = text.trim().split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += size) {
    chunks.push(words.slice(i, i + size).join(' '));
  }
  return chunks;
}

export function mergeText(
  chunks: string[],
  delimiter = '\n',
  prefix = '',
  suffix = '',
  numbered = false
): string {
  if (!chunks || chunks.length === 0) return '';
  return chunks
    .map((chunk, index) => {
      const line = numbered ? `${index + 1}. ${chunk}` : chunk;
      return `${prefix}${line}${suffix}`;
    })
    .join(delimiter);
}

export function repeatText(
  text: string,
  count = 3,
  delimiter = '\n',
  numbered = false
): string {
  if (!text || count <= 0) return '';
  const safeCount = Math.min(count, 500);
  const items: string[] = [];
  for (let i = 1; i <= safeCount; i++) {
    items.push(numbered ? `${i}. ${text}` : text);
  }
  return items.join(delimiter);
}

// Markdown & Document Templates
export function generateMarkdownTable(
  rows = 3,
  cols = 3,
  align: 'left' | 'center' | 'right' = 'left'
): string {
  const safeRows = Math.max(1, Math.min(rows, 20));
  const safeCols = Math.max(1, Math.min(cols, 10));
  const alignMarker = align === 'center' ? ':---:' : align === 'right' ? '---:' : ':---';
  const header = '| ' + Array.from({ length: safeCols }, (_, i) => `Header ${i + 1}`).join(' | ') + ' |';
  const separator = '| ' + Array.from({ length: safeCols }, () => alignMarker).join(' | ') + ' |';
  const body = Array.from({ length: safeRows }, (_, r) =>
    '| ' + Array.from({ length: safeCols }, (_, c) => `Cell ${r + 1},${c + 1}`).join(' | ') + ' |'
  ).join('\n');
  return `${header}\n${separator}\n${body}`;
}

export function generateMeetingNotes(
  title = 'Sprint Planning',
  attendees = 'Alex, Jordan, Taylor',
  date = new Date().toISOString().split('T')[0]
): string {
  return `# Meeting Notes: ${title}
Date: ${date}
Attendees: ${attendees}

## 1. Objectives & Agenda
- Review recent release metrics
- Prioritize current backlog tasks
- Align on offline architecture goals

## 2. Discussion Points
- Confirmed zero external network dependencies for text processing.
- Verified all offline unit tests pass locally.

## 3. Action Items
- [ ] Implement remaining studio workspaces
- [ ] Run full iOS simulator verification
- [ ] Export completion report
`;
}

export function generateResumeTemplate(
  name = 'JANE DOE',
  role = 'Lead Mobile Engineer'
): string {
  return `${name.toUpperCase()}
${role} | Austin, TX | jane.doe@example.com

PROFESSIONAL SUMMARY
Results-driven software engineer with 7+ years developing robust, offline-capable mobile applications using React Native, TypeScript, and native architectures.

CORE COMPETENCIES
- Mobile Frameworks: React Native, Expo, iOS, Android
- Languages: TypeScript, JavaScript, Swift, Kotlin
- Architecture: Offline-first design, State Management, Local Storage

PROFESSIONAL EXPERIENCE
Senior Mobile Developer | Toolstrum Labs | 2022 - Present
- Architected all-in-one local utility application supporting 500 offline tools.
- Reduced cold start latency by 35% through modular lazy-loading.

EDUCATION
B.S. in Computer Science | University of Technology
`;
}

export function generateEmailTemplate(
  type: 'followup' | 'meeting' | 'status' = 'followup',
  recipient = 'Team'
): string {
  if (type === 'followup') {
    return `Subject: Following up on our recent discussion

Hi ${recipient},

I wanted to quickly follow up regarding our previous conversation about our offline tools rollout.

Please let me know if you have any questions or need further details before our next milestone.

Best regards,
Mobile Team`;
  }
  if (type === 'meeting') {
    return `Subject: Request for sync on upcoming release

Hi ${recipient},

Could we schedule a brief 20-minute sync this week to review the latest updates on the Toolstrum architecture?

Please let me know which time window works best for your schedule.

Best,
Mobile Lead`;
  }
  return `Subject: Project Status Update: All Systems On Schedule

Hi ${recipient},

Here is our weekly progress summary:
- Text Studio consolidated into 5 reusable offline workspaces.
- 100% of unit tests passing with zero errors.
- Continuing with Developer Studio consolidation next.

Best regards,
Engineering Team`;
}

export interface GrammarIssue {
  type: 'passive_voice' | 'redundancy' | 'repeated_word';
  match: string;
  suggestion: string;
  index: number;
}

export function checkOfflineGrammarAndStyle(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  // Repeated words (e.g. "the the")
  const repeatRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
  let match: RegExpExecArray | null;
  while ((match = repeatRegex.exec(text)) !== null) {
    issues.push({
      type: 'repeated_word',
      match: match[0],
      suggestion: match[1],
      index: match.index,
    });
  }

  // Common wordy phrases
  const wordyPhrases: Record<string, string> = {
    'in order to': 'to',
    'at this point in time': 'now',
    'due to the fact that': 'because',
    'for the purpose of': 'for',
    'in the event that': 'if',
    'has the ability to': 'can',
  };

  for (const [phrase, replacement] of Object.entries(wordyPhrases)) {
    const reg = new RegExp(`\\b${phrase}\\b`, 'gi');
    while ((match = reg.exec(text)) !== null) {
      issues.push({
        type: 'redundancy',
        match: match[0],
        suggestion: replacement,
        index: match.index,
      });
    }
  }

  // Passive voice detector (e.g. "was written", "is performed")
  const passiveRegex = /\b(?:am|is|are|was|were|been|being|be)\s+([a-zA-Z]+ed|[a-zA-Z]+en)\b/gi;
  while ((match = passiveRegex.exec(text)) !== null) {
    issues.push({
      type: 'passive_voice',
      match: match[0],
      suggestion: 'Consider active voice',
      index: match.index,
    });
  }

  return issues;
}


