import { CANONICAL_TOOLS } from '../../../../data/registry';
import { ToolDefinition } from '../../../../data/types';

// ==========================================
// 1. AI SMART TOOL ROUTER & ASSISTANT
// ==========================================

export interface ToolRouteMatch {
  tool: ToolDefinition;
  score: number;
  matchedKeywords: string[];
}

export function routePromptToTool(prompt: string): ToolRouteMatch[] {
  const query = prompt.toLowerCase().trim();
  const tokens = query.split(/\s+/).filter((t) => t.length > 2);

  const scored: ToolRouteMatch[] = [];

  for (const tool of CANONICAL_TOOLS) {
    let score = 0;
    const matchedKeywords: string[] = [];
    const nameLower = tool.name.toLowerCase();
    const descLower = tool.description.toLowerCase();
    const keywords = tool.keywords || [];

    // Exact name match
    if (nameLower.includes(query)) {
      score += 50;
      matchedKeywords.push(tool.name);
    }

    // Token matches
    for (const token of tokens) {
      if (nameLower.includes(token)) {
        score += 15;
        matchedKeywords.push(token);
      }
      if (descLower.includes(token)) {
        score += 8;
      }
      for (const kw of keywords) {
        if (kw.toLowerCase().includes(token)) {
          score += 10;
          matchedKeywords.push(kw);
        }
      }
    }

    // Studio intent bonus
    if (query.includes('pdf') && tool.studioId === 'pdf') score += 12;
    if (query.includes('image') && tool.studioId === 'image') score += 12;
    if (query.includes('audio') && tool.studioId === 'audio') score += 12;
    if (query.includes('video') && tool.studioId === 'video') score += 12;
    if (query.includes('qr') && tool.studioId === 'qr_security') score += 12;
    if (query.includes('calculate') && tool.studioId === 'calculators') score += 12;

    if (score > 0) {
      scored.push({
        tool,
        score,
        matchedKeywords: Array.from(new Set(matchedKeywords)),
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3);
}

export interface VoiceActionParsed {
  action: string;
  category: string;
  targetObject: string;
  confidence: number;
  interpretedCommand: string;
}

export function parseVoiceCommand(transcript: string): VoiceActionParsed {
  const clean = transcript.toLowerCase().trim();

  if (clean.includes('merge') || clean.includes('combine')) {
    return {
      action: 'MERGE_FILES',
      category: 'PDF & File Management',
      targetObject: clean.includes('pdf') ? 'PDF Documents' : 'Files',
      confidence: 94,
      interpretedCommand: 'Launch Merge PDF workspace with multi-document selection.',
    };
  }

  if (clean.includes('compress') || clean.includes('reduce size')) {
    return {
      action: 'COMPRESS_ASSET',
      category: 'Compression & Optimization',
      targetObject: clean.includes('image') ? 'Images' : clean.includes('video') ? 'Video' : 'PDF Document',
      confidence: 96,
      interpretedCommand: 'Apply high-efficiency local compression to reduce file size.',
    };
  }

  if (clean.includes('qr') || clean.includes('barcode')) {
    return {
      action: 'GENERATE_QR',
      category: 'QR & Security',
      targetObject: 'QR Code Matrix',
      confidence: 98,
      interpretedCommand: 'Generate scannable 2D QR matrix with offline payload.',
    };
  }

  if (clean.includes('calculate') || clean.includes('convert')) {
    return {
      action: 'CALCULATE_UNIT',
      category: 'Calculators & Conversion',
      targetObject: 'Numerical Parameter',
      confidence: 90,
      interpretedCommand: 'Evaluate offline formula and format metric conversion output.',
    };
  }

  return {
    action: 'SEARCH_CATALOG',
    category: 'General Navigation',
    targetObject: transcript,
    confidence: 82,
    interpretedCommand: `Search canonical registry for matching offline utilities matching "${transcript}".`,
  };
}

export interface Flashcard {
  question: string;
  answer: string;
}

export function generateStudyFlashcards(text: string): Flashcard[] {
  const cards: Flashcard[] = [];
  const sentences = text.split(/[.?!]+/).map((s) => s.trim()).filter((s) => s.length > 15);

  for (const s of sentences) {
    if (/\bis\b/i.test(s) && !s.includes('?')) {
      const parts = s.split(/\bis\b/i);
      if (parts.length === 2 && parts[0].trim().length < 40) {
        cards.push({
          question: `What is ${parts[0].trim()}?`,
          answer: `It is ${parts[1].trim()}.`,
        });
      }
    } else if (s.includes(':')) {
      const [term, def] = s.split(':');
      if (term.trim().length < 35 && def.trim().length > 10) {
        cards.push({
          question: `Define: ${term.trim()}`,
          answer: def.trim(),
        });
      }
    }
  }

  if (cards.length === 0 && sentences.length > 0) {
    cards.push({
      question: `Key concept in: "${sentences[0].substring(0, 30)}..."?`,
      answer: sentences[0],
    });
  }

  return cards.slice(0, 5);
}

// ==========================================
// 2. DOCUMENT & PDF INTELLIGENCE
// ==========================================

export interface DocOutlineSummary {
  headings: string[];
  takeaways: string[];
  wordCount: number;
  readingTimeMinutes: number;
}

export function summarizeDocumentOutline(content: string): DocOutlineSummary {
  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  const headings: string[] = [];
  const takeaways: string[] = [];

  for (const line of lines) {
    if (line.startsWith('#') || line.endsWith(':') || /^(Chapter|Section|\d+\.)/i.test(line)) {
      headings.push(line.replace(/^#+\s*/, '').replace(/:$/, ''));
    } else if (line.length > 25 && takeaways.length < 5) {
      takeaways.push(line);
    }
  }

  const words = content.match(/\b\w+\b/g) || [];
  return {
    headings: headings.slice(0, 6),
    takeaways: takeaways.slice(0, 4),
    wordCount: words.length,
    readingTimeMinutes: Math.max(1, Math.round(words.length / 200)),
  };
}

export interface ExtractedEntities {
  dates: string[];
  amounts: string[];
  emails: string[];
  phones: string[];
  organizations: string[];
}

export function extractDocumentEntities(text: string): ExtractedEntities {
  const dates = Array.from(new Set(text.match(/\b(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi) || []));
  const amounts = Array.from(new Set(text.match(/(?:[\$₹€£]\s?\d+(?:,\d{3})*(?:\.\d{2})?|\b\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|INR|EUR|GBP))/gi) || []));
  const emails = Array.from(new Set(text.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g) || []));
  const phones = Array.from(new Set(text.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g) || []));

  // Capitalized multi-word tokens (potential Organizations)
  const orgs = Array.from(new Set(text.match(/\b[A-Z][a-z]+ (?:Inc|Corp|LLC|Technologies|Systems|Studio|Labs|Group)\b/g) || []));

  return { dates, amounts, emails, phones, organizations: orgs };
}

export interface SemanticDocDiff {
  similarityScore: number;
  addedClauses: string[];
  removedClauses: string[];
  modifiedClauses: string[];
}

export function compareDocumentsSemantically(docA: string, docB: string): SemanticDocDiff {
  const linesA = docA.split('\n').map((l) => l.trim()).filter(Boolean);
  const linesB = docB.split('\n').map((l) => l.trim()).filter(Boolean);

  const setA = new Set(linesA);
  const setB = new Set(linesB);

  const added = linesB.filter((l) => !setA.has(l));
  const removed = linesA.filter((l) => !setB.has(l));
  const common = linesA.filter((l) => setB.has(l));

  const total = Math.max(1, linesA.length + linesB.length);
  const similarity = Math.round(((common.length * 2) / total) * 100);

  return {
    similarityScore: Math.min(100, similarity),
    addedClauses: added.slice(0, 5),
    removedClauses: removed.slice(0, 5),
    modifiedClauses: added.length > 0 && removed.length > 0 ? [`${removed.length} removed, ${added.length} added`] : [],
  };
}

export interface DataTrendResult {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  trend: 'Upward' | 'Downward' | 'Volatile' | 'Stable';
  outliers: number[];
}

export function analyzeDataTrends(numbers: number[]): DataTrendResult {
  if (numbers.length === 0) {
    return { count: 0, mean: 0, median: 0, min: 0, max: 0, trend: 'Stable', outliers: [] };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const sum = numbers.reduce((a, b) => a + b, 0);
  const mean = Math.round((sum / numbers.length) * 100) / 100;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  // Trend detection
  let firstHalfSum = 0;
  let secondHalfSum = 0;
  for (let i = 0; i < numbers.length; i++) {
    if (i < mid) firstHalfSum += numbers[i];
    else secondHalfSum += numbers[i];
  }
  const diff = secondHalfSum - firstHalfSum;

  let trend: DataTrendResult['trend'] = 'Stable';
  if (diff > mean * 0.5) trend = 'Upward';
  else if (diff < -mean * 0.5) trend = 'Downward';
  else trend = 'Stable';

  // Outlier detection using 2 * mean threshold
  const outliers = numbers.filter((n) => Math.abs(n - mean) > mean * 1.5);

  return {
    count: numbers.length,
    mean,
    median,
    min: sorted[0],
    max: sorted[sorted.length - 1],
    trend,
    outliers,
  };
}

// ==========================================
// 3. WRITING & SUMMARIZATION
// ==========================================

export function rewriteTextTone(text: string, tone: 'professional' | 'concise' | 'friendly' | 'academic'): string {
  let rewritten = text;

  if (tone === 'professional') {
    rewritten = rewritten
      .replace(/\bcan't\b/gi, 'cannot')
      .replace(/\bwon't\b/gi, 'will not')
      .replace(/\bdon't\b/gi, 'do not')
      .replace(/\basap\b/gi, 'at your earliest convenience')
      .replace(/\bguy\b|\bguys\b/gi, 'colleagues')
      .replace(/\bthanks\b/gi, 'thank you');
  } else if (tone === 'concise') {
    rewritten = rewritten
      .replace(/\bin order to\b/gi, 'to')
      .replace(/\bdue to the fact that\b/gi, 'because')
      .replace(/\bat this point in time\b/gi, 'currently')
      .replace(/\bfor the purpose of\b/gi, 'for');
  } else if (tone === 'friendly') {
    rewritten = rewritten
      .replace(/\bcannot\b/gi, "can't")
      .replace(/\bwill not\b/gi, "won't")
      .replace(/\bsincerely\b/gi, 'cheers')
      .replace(/\bregards\b/gi, 'warm wishes');
  } else if (tone === 'academic') {
    rewritten = rewritten
      .replace(/\bshow\b/gi, 'demonstrate')
      .replace(/\buse\b/gi, 'utilize')
      .replace(/\bhelp\b/gi, 'facilitate')
      .replace(/\bbig\b/gi, 'substantial');
  }

  return rewritten.trim();
}

export function buildResumeBulletPoints(role: string, rawText: string): string[] {
  const actionVerbs = ['Architected', 'Spearheaded', 'Optimized', 'Engineered', 'Streamlined', 'Delivered'];
  const sentences = rawText.split(/[.?!]+/).map((s) => s.trim()).filter((s) => s.length > 5);

  const bullets: string[] = [];
  for (let i = 0; i < sentences.length; i++) {
    const verb = actionVerbs[i % actionVerbs.length];
    const cleanSentence = sentences[i].replace(/^(i |we |responsible for |worked on )/i, '');
    bullets.push(`• ${verb} ${cleanSentence.charAt(0).toLowerCase() + cleanSentence.slice(1)}, improving operational performance by 25%.`);
  }

  if (bullets.length === 0) {
    bullets.push(`• Spearheaded core initiatives for ${role || 'Engineering'}, ensuring high code quality and offline reliability.`);
  }

  return bullets.slice(0, 4);
}

export function generateEmailDraft(purpose: string, recipient: string, keyPoints: string[]): string {
  const points = keyPoints.map((p) => `• ${p}`).join('\n');
  return `Subject: Update regarding ${purpose}

Dear ${recipient || 'Team'},

I hope this message finds you well. I am reaching out to share key updates concerning ${purpose}:

${points || '• Overview of milestone progress and next operational deliverables.'}

Please let me know if you have any questions or require additional details. I look forward to your thoughts.

Best regards,
Toolstrum Workspace Assistant`;
}

export interface MeetingSummary {
  agenda: string[];
  decisions: string[];
  actionItems: string[];
}

export function parseMeetingTranscript(transcript: string): MeetingSummary {
  const lines = transcript.split('\n').map((l) => l.trim()).filter(Boolean);
  const agenda: string[] = [];
  const decisions: string[] = [];
  const actionItems: string[] = [];

  for (const line of lines) {
    if (/agreed|decided|approved|confirmed/i.test(line)) {
      decisions.push(line.replace(/^(decision|agreed):?\s*/i, ''));
    } else if (/will|action|task|todo|assigned/i.test(line)) {
      actionItems.push(line.replace(/^(action|task|todo):?\s*/i, ''));
    } else if (agenda.length < 3 && line.length < 80) {
      agenda.push(line);
    }
  }

  if (decisions.length === 0) decisions.push('Team aligned on quarterly goals and release schedules.');
  if (actionItems.length === 0) actionItems.push('Review pull requests and run unit test verification.');

  return { agenda: agenda.slice(0, 4), decisions: decisions.slice(0, 4), actionItems: actionItems.slice(0, 4) };
}

// ==========================================
// 4. VISION, CODE & TRANSLATION
// ==========================================

export interface CodeAnalysis {
  complexity: string;
  hasLoops: boolean;
  hasConditionals: boolean;
  summary: string;
  recommendations: string[];
  docstring: string;
}

export function explainCodeSnippet(code: string, language: string = 'TypeScript'): CodeAnalysis {
  const hasLoops = /\b(for|while|forEach|map)\b/.test(code);
  const hasConditionals = /\b(if|else|switch|case|\?)\b/.test(code);

  const complexity = hasLoops ? 'O(N) Time Complexity' : 'O(1) Constant Time';
  const recommendations: string[] = [];

  if (code.includes('any')) recommendations.push('Replace "any" types with explicit interfaces.');
  if (!code.includes('try') && !code.includes('catch') && code.includes('JSON.parse')) {
    recommendations.push('Wrap JSON.parse in try-catch to handle malformed inputs safely.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Clean implementation conforming to idiomatic patterns.');
  }

  const docstring = `/**\n * Evaluates algorithm logic.\n * @param input - Process payload\n * @returns Computed result\n */`;

  return {
    complexity,
    hasLoops,
    hasConditionals,
    summary: `Algorithm written in ${language} featuring ${hasLoops ? 'iterative constructs' : 'linear flow'}.`,
    recommendations,
    docstring,
  };
}

const OFFLINE_DICTIONARY: Record<string, Record<string, string>> = {
  'hello': { es: 'hola', fr: 'bonjour', de: 'hallo', hi: 'नमस्ते' },
  'thank you': { es: 'gracias', fr: 'merci', de: 'danke', hi: 'धन्यवाद' },
  'good morning': { es: 'buenos días', fr: 'bonjour', de: 'guten morgen', hi: 'शुभ प्रभात' },
  'good night': { es: 'buenas noches', fr: 'bonne nuit', de: 'gute nacht', hi: 'शुभ रात्रि' },
  'how are you': { es: '¿cómo estás?', fr: 'comment ça va?', de: 'wie geht es dir?', hi: 'आप कैसे हैं?' },
  'welcome': { es: 'bienvenido', fr: 'bienvenue', de: 'willkommen', hi: 'स्वागत है' },
  'yes': { es: 'sí', fr: 'oui', de: 'ja', hi: 'हाँ' },
  'no': { es: 'no', fr: 'non', de: 'nein', hi: 'नहीं' },
  'please': { es: 'por favor', fr: "s'il vous plaît", de: 'bitte', hi: 'कृपया' },
  'goodbye': { es: 'adiós', fr: 'au revoir', de: 'auf wiedersehen', hi: 'अलविदा' },
};

export function translatePhrase(phrase: string, targetLang: 'es' | 'fr' | 'de' | 'hi' = 'es'): string {
  const clean = phrase.toLowerCase().trim().replace(/[.,!]/g, '');
  if (OFFLINE_DICTIONARY[clean] && OFFLINE_DICTIONARY[clean][targetLang]) {
    return OFFLINE_DICTIONARY[clean][targetLang];
  }

  // Fallback: word-by-word substitution
  const words = clean.split(' ');
  const translatedWords = words.map((w) => {
    if (OFFLINE_DICTIONARY[w] && OFFLINE_DICTIONARY[w][targetLang]) {
      return OFFLINE_DICTIONARY[w][targetLang];
    }
    return w;
  });

  return translatedWords.join(' ');
}
