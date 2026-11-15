/**
 * 100% Offline Client-Side Zero-Dependency Text Processing Utilities.
 * Benchmarked against WordCounter.net, ConvertCase.net, Diffchecker, and Hemingway Editor.
 */

// ==========================================
// 1. TEXT METRICS & READABILITY ALGORITHMS
// ==========================================

export interface ComprehensiveTextMetrics {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  uniqueWords: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  syllables: number;
  complexWords: number; // Words with >= 3 syllables
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  handwritingTimeMinutes: number;
  avgWordLength: number;
  avgSentenceLength: number;
  fleschReadingEase: number;
  fleschKincaidGrade: number;
  colemanLiauIndex: number;
  automatedReadabilityIndex: number;
  gunningFogIndex: number;
  readingLevelLabel: string;
  topKeywords: { word: string; count: number; percentage: number }[];
}

export function countSyllablesInWord(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;

  // Problem suffixes
  let cleaned = w
    .replace(/(?:[^laeiouy]|ed|es|e)$/, '')
    .replace(/^y/, '');

  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

export function computeTextMetrics(text: string): ComprehensiveTextMetrics {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const rawLines = text.split(/\r?\n/);
  const lines = rawLines.length;

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length || (text.trim() ? 1 : 0);

  const cleanWords = text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s'-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const words = cleanWords.length;

  // Unique words & keyword density
  const wordFrequency: Record<string, number> = {};
  const stopWords = new Set([
    'the','a','an','and','or','but','if','in','on','at','to','for','with',
    'by','from','as','is','was','are','were','be','been','being','have',
    'has','had','do','does','did','will','would','shall','should','may',
    'might','must','can','could','that','which','who','whom','this','these',
    'that','those','it','its','he','she','they','them','we','you','i'
  ]);

  for (const w of cleanWords) {
    const cleanW = w.replace(/^[-']+|[-']+$/g, '');
    if (cleanW.length > 1) {
      wordFrequency[cleanW] = (wordFrequency[cleanW] || 0) + 1;
    }
  }

  const uniqueWords = Object.keys(wordFrequency).length;

  const topKeywords = Object.entries(wordFrequency)
    .filter(([word]) => !stopWords.has(word) && word.length >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({
      word,
      count,
      percentage: words > 0 ? Number(((count / words) * 100).toFixed(1)) : 0,
    }));

  // Sentences
  const sentenceMatches = text.match(/[^.!?]+[.!?]+(\s|$)/g);
  const sentences = sentenceMatches
    ? sentenceMatches.length
    : text.trim().length > 0
    ? 1
    : 0;

  // Syllables and Complex Words
  let syllables = 0;
  let complexWords = 0;
  for (const w of cleanWords) {
    const syl = countSyllablesInWord(w);
    syllables += syl;
    if (syl >= 3) complexWords++;
  }

  // Durations (words per minute)
  const readingTimeMinutes = words > 0 ? Number((words / 225).toFixed(2)) : 0;
  const speakingTimeMinutes = words > 0 ? Number((words / 130).toFixed(2)) : 0;
  const handwritingTimeMinutes = words > 0 ? Number((words / 20).toFixed(2)) : 0;

  const avgWordLength = words > 0 ? Number((charactersNoSpaces / words).toFixed(1)) : 0;
  const avgSentenceLength = sentences > 0 ? Number((words / sentences).toFixed(1)) : 0;

  // Readability Formulas
  let fleschReadingEase = 0;
  let fleschKincaidGrade = 0;
  let colemanLiauIndex = 0;
  let automatedReadabilityIndex = 0;
  let gunningFogIndex = 0;

  if (words > 0 && sentences > 0) {
    // 1. Flesch Reading Ease: 206.835 - 1.015 * (words/sentences) - 84.6 * (syllables/words)
    fleschReadingEase = Number(
      Math.max(0, Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words))).toFixed(1)
    );

    // 2. Flesch-Kincaid Grade Level: 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
    fleschKincaidGrade = Number(
      Math.max(0, 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59).toFixed(1)
    );

    // 3. Coleman-Liau: 0.0588 * L - 0.296 * S - 15.8 (L = letters/100 words, S = sentences/100 words)
    const L = (charactersNoSpaces / words) * 100;
    const S = (sentences / words) * 100;
    colemanLiauIndex = Number(Math.max(0, 0.0588 * L - 0.296 * S - 15.8).toFixed(1));

    // 4. ARI: 4.71 * (chars/words) + 0.5 * (words/sentences) - 21.43
    automatedReadabilityIndex = Number(
      Math.max(0, 4.71 * (charactersNoSpaces / words) + 0.5 * (words / sentences) - 21.43).toFixed(1)
    );

    // 5. Gunning Fog: 0.4 * ((words/sentences) + 100 * (complexWords/words))
    gunningFogIndex = Number(
      Math.max(0, 0.4 * (words / sentences + 100 * (complexWords / words))).toFixed(1)
    );
  }

  // Label
  let readingLevelLabel = '5th Grade (Very Easy)';
  if (fleschReadingEase >= 90) readingLevelLabel = '5th Grade (Very Easy)';
  else if (fleschReadingEase >= 80) readingLevelLabel = '6th Grade (Easy)';
  else if (fleschReadingEase >= 70) readingLevelLabel = '7th Grade (Fairly Easy)';
  else if (fleschReadingEase >= 60) readingLevelLabel = '8th-9th Grade (Plain English)';
  else if (fleschReadingEase >= 50) readingLevelLabel = '10th-12th Grade (High School)';
  else if (fleschReadingEase >= 30) readingLevelLabel = 'College Level (Difficult)';
  else readingLevelLabel = 'College Graduate (Very Confusing)';

  return {
    characters,
    charactersNoSpaces,
    words,
    uniqueWords,
    sentences,
    paragraphs,
    lines,
    syllables,
    complexWords,
    readingTimeMinutes,
    speakingTimeMinutes,
    handwritingTimeMinutes,
    avgWordLength,
    avgSentenceLength,
    fleschReadingEase,
    fleschKincaidGrade,
    colemanLiauIndex,
    automatedReadabilityIndex,
    gunningFogIndex,
    readingLevelLabel,
    topKeywords,
  };
}

// ==========================================
// 2. CASE CONVERSIONS & SLUGIFIERS
// ==========================================

export function toSentenceCase(text: string): string {
  return text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
}

export function toTitleCaseFull(text: string): string {
  const smallWords = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'off', 'on', 'or', 'per', 'so', 'the', 'to', 'up', 'via', 'yet']);
  return text.replace(/\b[A-Za-z0-9]+(?:'[a-zA-Z]+)?\b/g, (match, index) => {
    if (index > 0 && smallWords.has(match.toLowerCase())) {
      return match.toLowerCase();
    }
    return match.charAt(0).toUpperCase() + match.slice(1).toLowerCase();
  });
}

export function toCamelCaseFull(text: string): string {
  const words = text.trim().split(/[\s_\-]+/).filter(Boolean);
  if (words.length === 0) return '';
  return (
    words[0].toLowerCase() +
    words
      .slice(1)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('')
  );
}

export function toPascalCaseFull(text: string): string {
  const words = text.trim().split(/[\s_\-]+/).filter(Boolean);
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

export function toSnakeCaseFull(text: string): string {
  return text
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .split(/[\s_\-]+/)
    .map((w) => w.toLowerCase())
    .join('_');
}

export function toConstantCaseFull(text: string): string {
  return toSnakeCaseFull(text).toUpperCase();
}

export function toKebabCaseFull(text: string): string {
  return text
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .split(/[\s_\-]+/)
    .map((w) => w.toLowerCase())
    .join('-');
}

export function toDotCase(text: string): string {
  return text
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1.$2')
    .split(/[\s_\-]+/)
    .map((w) => w.toLowerCase())
    .join('.');
}

export function toPathCase(text: string): string {
  return text
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1/$2')
    .split(/[\s_\-]+/)
    .map((w) => w.toLowerCase())
    .join('/');
}

export function toAlternatingCase(text: string): string {
  let upper = false;
  return Array.from(text)
    .map((char) => {
      if (/[a-zA-Z]/.test(char)) {
        upper = !upper;
        return upper ? char.toUpperCase() : char.toLowerCase();
      }
      return char;
    })
    .join('');
}

export function toInverseCase(text: string): string {
  return Array.from(text)
    .map((c) => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()))
    .join('');
}

export function toSpongeBobCase(text: string): string {
  return Array.from(text)
    .map((c) => (Math.random() > 0.5 ? c.toUpperCase() : c.toLowerCase()))
    .join('');
}

export function textToSlugFull(text: string, separator = '-'): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, separator)
    .replace(new RegExp(`^${separator}+|${separator}+$`, 'g'), '');
}

export function slugToTextFull(slug: string): string {
  return slug
    .replace(/[-_./]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ==========================================
// 3. TEXT CLEANER & LINE OPERATIONS
// ==========================================

export function cleanExtraSpaces(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim().replace(/[ \t]+/g, ' '))
    .join('\n');
}

export function cleanEmptyLines(text: string): string {
  return text
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .join('\n');
}

export function cleanDuplicateLines(text: string, caseInsensitive = false): { result: string; removedCount: number } {
  const lines = text.split(/\r?\n/);
  const seen = new Set<string>();
  const out: string[] = [];
  let removedCount = 0;

  for (const line of lines) {
    const key = caseInsensitive ? line.toLowerCase() : line;
    if (!seen.has(key)) {
      seen.add(key);
      out.push(line);
    } else {
      removedCount++;
    }
  }

  return { result: out.join('\n'), removedCount };
}

export function sortTextLines(
  text: string,
  mode: 'az' | 'za' | 'length_asc' | 'length_desc' | 'natural' | 'shuffle'
): string {
  const lines = text.split(/\r?\n/);

  switch (mode) {
    case 'az':
      lines.sort((a, b) => a.localeCompare(b));
      break;
    case 'za':
      lines.sort((a, b) => b.localeCompare(a));
      break;
    case 'length_asc':
      lines.sort((a, b) => a.length - b.length || a.localeCompare(b));
      break;
    case 'length_desc':
      lines.sort((a, b) => b.length - a.length || a.localeCompare(b));
      break;
    case 'natural':
      lines.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
      break;
    case 'shuffle':
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
      break;
  }

  return lines.join('\n');
}

export function reverseTextFull(text: string, mode: 'chars' | 'words' | 'lines'): string {
  if (mode === 'chars') {
    return Array.from(text).reverse().join('');
  }
  if (mode === 'words') {
    return text.split(/(\s+)/).reverse().join('');
  }
  return text.split(/\r?\n/).reverse().join('\n');
}

export function performFindAndReplace(
  text: string,
  search: string,
  replace: string,
  options: { caseSensitive: boolean; wholeWord: boolean; useRegex: boolean }
): { result: string; matchCount: number } {
  if (!search) return { result: text, matchCount: 0 };

  try {
    let pattern = search;
    if (!options.useRegex) {
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    if (options.wholeWord) {
      pattern = `\\b${pattern}\\b`;
    }

    const flags = options.caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(pattern, flags);
    const matches = text.match(regex);
    const matchCount = matches ? matches.length : 0;
    const result = text.replace(regex, replace);

    return { result, matchCount };
  } catch {
    return { result: text, matchCount: 0 };
  }
}

export function repeatText(
  text: string,
  count: number,
  delimiter: string = '\n',
  prefix: string = '',
  suffix: string = ''
): string {
  const safeCount = Math.min(10000, Math.max(1, count));
  const item = `${prefix}${text}${suffix}`;
  return Array(safeCount).fill(item).join(delimiter);
}

// ==========================================
// 4. ENTITY EXTRACTORS (URL, EMAIL, PHONE)
// ==========================================

export function extractAllUrls(text: string): { url: string; domain: string }[] {
  const urlRegex = /\b(?:https?:\/\/|ftp:\/\/|www\.)[A-Za-z0-9.\-_~:/?#[\]@!$&'()*+,;=%]+/gi;
  const matches = text.match(urlRegex) || [];
  const unique = Array.from(new Set(matches));

  return unique.map((raw) => {
    let domain = '';
    try {
      const formatted = raw.startsWith('www.') ? `https://${raw}` : raw;
      const u = new URL(formatted);
      domain = u.hostname;
    } catch {
      domain = raw.split('/')[0] || '';
    }
    return { url: raw, domain };
  });
}

export function extractAllEmails(text: string): { email: string; domain: string }[] {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  const matches = text.match(emailRegex) || [];
  const unique = Array.from(new Set(matches.map((e) => e.toLowerCase())));

  return unique.map((email) => ({
    email,
    domain: email.split('@')[1] || '',
  }));
}

export function extractAllPhoneNumbers(text: string): string[] {
  const phoneRegex = /(?:\+?\d{1,4}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const matches = text.match(phoneRegex) || [];
  return Array.from(new Set(matches.map((p) => p.trim()).filter((p) => p.replace(/\D/g, '').length >= 7)));
}

// ==========================================
// 5. ASCII & UNICODE INSPECTOR
// ==========================================

export interface UnicodeGlyphInfo {
  index: number;
  char: string;
  codePoint: number;
  hex: string;
  dec: number;
  utf8Hex: string;
  utf16Hex: string;
  htmlEntity: string;
  block: string;
}

export function getUnicodeBlockName(cp: number): string {
  if (cp <= 0x007f) return 'Basic Latin (ASCII)';
  if (cp <= 0x00ff) return 'Latin-1 Supplement';
  if (cp <= 0x017f) return 'Latin Extended-A';
  if (cp <= 0x024f) return 'Latin Extended-B';
  if (cp <= 0x02af) return 'IPA Extensions';
  if (cp <= 0x036f) return 'Combining Diacritical Marks';
  if (cp <= 0x03ff) return 'Greek and Coptic';
  if (cp <= 0x04ff) return 'Cyrillic';
  if (cp <= 0x052f) return 'Cyrillic Supplement';
  if (cp <= 0x058f) return 'Armenian';
  if (cp <= 0x05ff) return 'Hebrew';
  if (cp <= 0x06ff) return 'Arabic';
  if (cp <= 0x074f) return 'Syriac';
  if (cp <= 0x07ff) return 'Arabic Supplement / Thaana / NKo';
  if (cp <= 0x097f) return 'Devanagari';
  if (cp <= 0x09ff) return 'Bengali & Assamese';
  if (cp <= 0x0a7f) return 'Gurmukhi';
  if (cp <= 0x0aff) return 'Gujarati';
  if (cp <= 0x0b7f) return 'Odia';
  if (cp <= 0x0bff) return 'Tamil';
  if (cp <= 0x0c7f) return 'Telugu';
  if (cp <= 0x0cff) return 'Kannada';
  if (cp <= 0x0d7f) return 'Malayalam';
  if (cp <= 0x206f) return 'General Punctuation';
  if (cp <= 0x209f) return 'Superscripts and Subscripts';
  if (cp <= 0x20cf) return 'Currency Symbols';
  if (cp <= 0x218f) return 'Letterlike Symbols / Number Forms';
  if (cp <= 0x21ff) return 'Arrows';
  if (cp <= 0x22ff) return 'Mathematical Operators';
  if (cp <= 0x23ff) return 'Miscellaneous Technical';
  if (cp <= 0x243f) return 'Control Pictures';
  if (cp <= 0x257f) return 'Box Drawing';
  if (cp <= 0x259f) return 'Block Elements';
  if (cp <= 0x25ff) return 'Geometric Shapes';
  if (cp <= 0x26ff) return 'Miscellaneous Symbols';
  if (cp <= 0x27bf) return 'Dingbats';
  if (cp <= 0x1f64f) return 'Emoticons';
  if (cp <= 0x1f6ff) return 'Transport and Map Symbols';
  if (cp <= 0x1f9ff) return 'Supplemental Symbols and Pictographs';
  return 'Unicode Supplementary Block';
}

export function inspectAllUnicodeGlyphs(text: string): UnicodeGlyphInfo[] {
  const chars = Array.from(text);
  const encoder = new TextEncoder();

  return chars.map((char, index) => {
    const cp = char.codePointAt(0) || 0;
    const hex = 'U+' + cp.toString(16).toUpperCase().padStart(4, '0');
    const dec = cp;

    const utf8Hex = Array.from(encoder.encode(char))
      .map((b) => b.toString(16).toUpperCase().padStart(2, '0'))
      .join(' ');

    const utf16Hex = Array.from(char)
      .map((c) => c.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0'))
      .join(' ');

    const htmlEntity = `&#x${cp.toString(16)};`;
    const block = getUnicodeBlockName(cp);

    return {
      index: index + 1,
      char,
      codePoint: cp,
      hex,
      dec,
      utf8Hex,
      utf16Hex,
      htmlEntity,
      block,
    };
  });
}

// ==========================================
// 6. TEXT CODECS (ENCODERS & DECODERS)
// ==========================================

export function encodeRot13(text: string): string {
  return text.replace(/[a-zA-Z]/g, (c) => {
    const code = c.charCodeAt(0);
    const base = code >= 97 ? 97 : 65;
    return String.fromCharCode(((code - base + 13) % 26) + base);
  });
}

export function textToBinary(text: string): string {
  return Array.from(text)
    .map((c) => c.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

export function binaryToText(bin: string): string {
  return bin
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((b) => {
      const code = parseInt(b, 2);
      return isNaN(code) ? '' : String.fromCharCode(code);
    })
    .join('');
}

export function textToHex(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}

export function hexToText(hex: string): string {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    bytes.push(parseInt(clean.slice(i, i + 2), 16));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// ==========================================
// 7. LOREM IPSUM & SAMPLE DATA GENERATOR
// ==========================================

const LOREM_WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do',
  'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim',
  'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi',
  'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit',
  'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
  'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt',
  'mollit', 'anim', 'id', 'est', 'laborum', 'curabitur', 'pretium', 'tincidunt', 'lacus',
  'porta', 'mauris', 'sollicitudin', 'pharetra', 'vulputate', 'vivamus', 'vestibulum', 'condimentum',
  'pellentesque', 'habitant', 'morbi', 'tristique', 'senectus', 'netus', 'fames', 'egestas'
];

export function generateLoremIpsum(
  count: number,
  mode: 'paragraphs' | 'sentences' | 'words',
  startWithLorem = true,
  asHtml = false
): string {
  const getRandWord = () => LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)];

  const makeSentence = (first = false) => {
    const len = Math.floor(Math.random() * 8) + 8;
    const words: string[] = [];
    for (let i = 0; i < len; i++) {
      if (first && i === 0 && startWithLorem) {
        words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
        i += 4;
      } else {
        words.push(getRandWord());
      }
    }
    const cap = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return [cap, ...words.slice(1)].join(' ') + '.';
  };

  const makeParagraph = (isFirst = false) => {
    const sentenceCount = Math.floor(Math.random() * 4) + 4;
    const s: string[] = [];
    for (let i = 0; i < sentenceCount; i++) {
      s.push(makeSentence(isFirst && i === 0));
    }
    return s.join(' ');
  };

  if (mode === 'words') {
    const words: string[] = [];
    for (let i = 0; i < count; i++) {
      if (i === 0 && startWithLorem) words.push('Lorem', 'ipsum', 'dolor', 'sit', 'amet');
      else words.push(getRandWord());
      if (words.length >= count) break;
    }
    return words.slice(0, count).join(' ');
  }

  if (mode === 'sentences') {
    const sentences: string[] = [];
    for (let i = 0; i < count; i++) {
      sentences.push(makeSentence(i === 0));
    }
    return sentences.join(' ');
  }

  // paragraphs
  const paras: string[] = [];
  for (let i = 0; i < count; i++) {
    const p = makeParagraph(i === 0);
    paras.push(asHtml ? `<p>${p}</p>` : p);
  }

  return paras.join(asHtml ? '\n\n' : '\n\n');
}

export function generateRandomNames(count: number, culture: 'all' | 'western' | 'nordic' | 'asian' | 'indic' = 'all'): string[] {
  const firsts: Record<string, string[]> = {
    western: ['Liam', 'Emma', 'Noah', 'Olivia', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William', 'Ava', 'James', 'Mia', 'Benjamin', 'Charlotte', 'Lucas', 'Amelia'],
    nordic: ['Lars', 'Astrid', 'Soren', 'Freja', 'Magnus', 'Ingrid', 'Einar', 'Sigrid', 'Torstein', 'Liv', 'Henrik', 'Britta'],
    asian: ['Kenji', 'Mei', 'Hiroshi', 'Yuki', 'Chen', 'Li', 'Hana', 'Riku', 'Min-jun', 'Ji-woo', 'Wei', 'Xia'],
    indic: ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Diya', 'Arjun', 'Isha', 'Kavya', 'Aditya', 'Sneha', 'Kabir'],
  };

  const lasts: Record<string, string[]> = {
    western: ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'],
    nordic: ['Lindqvist', 'Hansen', 'Johansson', 'Nielsen', 'Bergstrom', 'Holm', 'Lund', 'Nygard', 'Olsen', 'Svensson'],
    asian: ['Tanaka', 'Sato', 'Watanabe', 'Takahashi', 'Zhang', 'Wang', 'Liu', 'Kim', 'Park', 'Lee'],
    indic: ['Sharma', 'Verma', 'Patel', 'Mukherjee', 'Chatterjee', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Singh', 'Das'],
  };

  const poolF = culture === 'all' ? Object.values(firsts).flat() : firsts[culture] || firsts.western;
  const poolL = culture === 'all' ? Object.values(lasts).flat() : lasts[culture] || lasts.western;

  const results: string[] = [];
  for (let i = 0; i < count; i++) {
    const f = poolF[Math.floor(Math.random() * poolF.length)];
    const l = poolL[Math.floor(Math.random() * poolL.length)];
    results.push(`${f} ${l}`);
  }
  return results;
}

// ==========================================
// 8. OFFLINE GRAMMAR & STYLE RULES
// ==========================================

export interface GrammarIssue {
  type: 'passive' | 'wordy' | 'repeated' | 'cliche';
  message: string;
  original: string;
  suggestion?: string;
  index: number;
}

const WORDY_PHRASES: Record<string, string> = {
  'in order to': 'to',
  'due to the fact that': 'because',
  'at this point in time': 'now',
  'with the exception of': 'except',
  'for the purpose of': 'to',
  'in the event that': 'if',
  'a large number of': 'many',
  'has the ability to': 'can',
  'it is recommended that you': 'please',
  'utilize': 'use',
  'in spite of the fact that': 'although',
};

export function analyzeGrammarAndStyle(text: string): GrammarIssue[] {
  const issues: GrammarIssue[] = [];

  // 1. Wordy phrases
  const lower = text.toLowerCase();
  for (const [phrase, replacement] of Object.entries(WORDY_PHRASES)) {
    let pos = 0;
    while ((pos = lower.indexOf(phrase, pos)) !== -1) {
      issues.push({
        type: 'wordy',
        message: `Wordy expression. Consider replacing with "${replacement}".`,
        original: text.slice(pos, pos + phrase.length),
        suggestion: replacement,
        index: pos,
      });
      pos += phrase.length;
    }
  }

  // 2. Passive Voice Heuristic (e.g., "was examined", "were created", "been discovered")
  const passiveRegex = /\b(am|is|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en)\b/gi;
  let pMatch: RegExpExecArray | null;
  while ((pMatch = passiveRegex.exec(text)) !== null) {
    issues.push({
      type: 'passive',
      message: 'Passive voice detected. Try rewriting in the active voice for clearer impact.',
      original: pMatch[0],
      index: pMatch.index,
    });
  }

  // 3. Repeated consecutive words (e.g. "the the")
  const repeatRegex = /\b([a-zA-Z]+)\s+\1\b/gi;
  let rMatch: RegExpExecArray | null;
  while ((rMatch = repeatRegex.exec(text)) !== null) {
    issues.push({
      type: 'repeated',
      message: `Duplicated consecutive word "${rMatch[1]}".`,
      original: rMatch[0],
      suggestion: rMatch[1],
      index: rMatch.index,
    });
  }

  return issues;
}

// ==========================================
// 9. BENGALI-ENGLISH AVRO TRANSLITERATION
// ==========================================

export function transliterateBanglishToBengali(text: string): string {
  // Avro phonetic rules mapping
  const map: [RegExp, string][] = [
    [/kkh/gi, 'ক্ষ'],
    [/ggy/gi, 'জ্ঞ'],
    [/ng/gi, 'ঙ'],
    [/sh/gi, 'শ'],
    [/ss/gi, 'ষ'],
    [/ch/gi, 'চ'],
    [/th/gi, 'থ'],
    [/dh/gi, 'ধ'],
    [/bh/gi, 'ভ'],
    [/kh/gi, 'খ'],
    [/gh/gi, 'ঘ'],
    [/jh/gi, 'ঝ'],
    [/ph/gi, 'ফ'],
    [/aami/gi, 'আমি'],
    [/tumi/gi, 'তুমি'],
    [/aapni/gi, 'আপনি'],
    [/kemon/gi, 'কেমন'],
    [/aacho/gi, 'আছো'],
    [/achen/gi, 'আছেন'],
    [/bhalo/gi, 'ভালো'],
    [/dhonnobad/gi, 'ধন্যবাদ'],
    [/shagotom/gi, 'স্বাগতম'],
    [/k/gi, 'ক'],
    [/g/gi, 'গ'],
    [/c/gi, 'চ'],
    [/j/gi, 'জ'],
    [/t/gi, 'ত'],
    [/d/gi, 'দ'],
    [/n/gi, 'ন'],
    [/p/gi, 'প'],
    [/f/gi, 'ফ'],
    [/b/gi, 'ব'],
    [/m/gi, 'ম'],
    [/r/gi, 'র'],
    [/l/gi, 'ল'],
    [/s/gi, 'স'],
    [/h/gi, 'হ'],
  ];

  let result = text;
  for (const [re, rep] of map) {
    result = result.replace(re, rep);
  }
  return result;
}
