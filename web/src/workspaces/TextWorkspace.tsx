import React, { useState, useEffect } from 'react';
import {
  Type,
  AlignLeft,
  Scissors,
  GitCompare,
  FileText,
  Copy,
  Check,
  Download,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Trash2,
  Lock,
  Unlock,
  Users,
  SpellCheck,
  Wand2,
  Calendar,
  Briefcase,
  Mail,
  Languages,
  Code2,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface TextWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

const COMMON_WORDS = new Set([
  'the','be','to','of','and','a','in','that','have','i','it','for','not','on','with','he','as','you','do','at',
  'this','but','his','by','from','they','we','say','her','she','or','an','will','my','one','all','would','there','their','what',
  'so','up','out','if','about','who','get','which','go','me','when','make','can','like','time','no','just','him','know','take',
  'people','into','year','your','good','some','could','them','see','other','than','then','now','look','only','come','its','over','think','also',
  'back','after','use','two','how','our','work','first','well','way','even','new','want','because','any','these','give','day','most','us',
  'is','are','was','were','been','being','has','had','does','did','doing','am','sentence','small','typographical','mistake','word','check',
  'offline','private','secure','device','browser','file','text','document','tool','free','download','copy','paste','edit','format','save',
]);

export const TextWorkspace: React.FC<TextWorkspaceProps> = ({
  toolId,
  accentColor = '#F97316',
}) => {
  // Determine mode based on registry toolId:
  const getInitialTab = () => {
    if ((toolId >= 205 && toolId <= 209) || toolId === 234 || toolId === 237) return 'counter';
    if (toolId === 210 || toolId === 221 || toolId === 222) return 'case';
    if ((toolId >= 211 && toolId <= 216) || toolId === 220) return 'clean';
    if (toolId === 217) return 'diff';
    if (toolId >= 218 && toolId <= 228) return 'extract';
    if (toolId >= 229 && toolId <= 243) return 'generator';
    return 'counter';
  };

  const [activeTab, setActiveTab] = useState<'counter' | 'case' | 'clean' | 'diff' | 'extract' | 'generator'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // Notification
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // 1. WORD & TEXT COUNTERS
  // ==========================================
  const [counterText, setCounterText] = useState(
    'Toolstrum brings together over 490 offline tools into one fast, private workspace.\n\nEverything runs completely offline on your device with zero cloud tracking or uploads. Fast, secure, and always accessible.'
  );

  const countSyllables = (word: string): number => {
    const w = word.toLowerCase().replace(/[^a-z]/g, '');
    if (!w) return 0;
    const matches = w.match(/[aeiouy]+/g);
    let count = matches ? matches.length : 1;
    if (w.endsWith('e') && count > 1) count--;
    return Math.max(1, count);
  };

  const getMetrics = (text: string) => {
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;
    const wordList = text.trim() ? text.trim().split(/\s+/) : [];
    const words = wordList.length;
    const lines = text.split('\n').length;
    const sentences = Math.max(1, text.split(/[.!?]+/).filter(Boolean).length);
    const paragraphs = text.split(/\n\s*\n/).filter(Boolean).length;
    const readingTime = (words / 200).toFixed(1);
    const speakingTime = (words / 130).toFixed(1);

    // Flesch Reading Ease — a standard, well-known readability formula.
    const syllables = wordList.reduce((sum, w) => sum + countSyllables(w), 0);
    const fleschScore = words > 0
      ? Math.max(0, Math.min(100, 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)))
      : 0;
    const readabilityLabel =
      fleschScore >= 90 ? 'Very Easy (5th grade)' :
      fleschScore >= 70 ? 'Easy (7th grade)' :
      fleschScore >= 60 ? 'Standard (8th-9th grade)' :
      fleschScore >= 50 ? 'Fairly Difficult (College)' :
      fleschScore >= 30 ? 'Difficult (College Graduate)' :
      'Very Difficult (Professional)';

    return { chars, charsNoSpaces, words, lines, sentences, paragraphs, readingTime, speakingTime, fleschScore: Math.round(fleschScore), readabilityLabel };
  };

  const metrics = getMetrics(counterText);

  // ==========================================
  // 2. CASE CONVERTERS
  // ==========================================
  const [caseInput, setCaseInput] = useState('Toolstrum Offline Developer Tools');
  const [caseOutput, setCaseOutput] = useState('');
  const [caseHasRun, setCaseHasRun] = useState(false);

  const applyCase = (type: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'slug') => {
    let res = caseInput;
    if (type === 'upper') res = caseInput.toUpperCase();
    if (type === 'lower') res = caseInput.toLowerCase();
    if (type === 'title') {
      res = caseInput.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
    }
    if (type === 'camel') {
      res = caseInput.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
    }
    if (type === 'snake') {
      res = caseInput
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join('_') || '';
    }
    if (type === 'kebab') {
      res = caseInput
        .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
        ?.map((x) => x.toLowerCase())
        .join('-') || '';
    }
    if (type === 'slug') {
      res = caseInput
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    setCaseOutput(res);
    setCaseHasRun(true);
  };

  // ==========================================
  // 3. TEXT CLEANERS & LINE OPERATIONS
  // ==========================================
  const [cleanInput, setCleanInput] = useState(
    '  Apple  \n\nBanana\nOrange\nApple\n  Grape   \n\nBanana'
  );
  const [cleanOutput, setCleanOutput] = useState('');
  const [cleanHasRun, setCleanHasRun] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  const handleCleanAction = (action: 'stripSpaces' | 'stripEmpty' | 'dedupe' | 'sortAsc' | 'sortDesc' | 'reverse' | 'replace') => {
    let res = cleanInput;
    if (action === 'stripSpaces') {
      res = cleanInput.replace(/[ \t]+/g, ' ').split('\n').map((l) => l.trim()).join('\n');
    }
    if (action === 'stripEmpty') {
      res = cleanInput.split('\n').filter((l) => l.trim().length > 0).join('\n');
    }
    if (action === 'dedupe') {
      res = Array.from(new Set(cleanInput.split('\n'))).join('\n');
    }
    if (action === 'sortAsc') {
      res = cleanInput.split('\n').sort((a, b) => a.localeCompare(b)).join('\n');
    }
    if (action === 'sortDesc') {
      res = cleanInput.split('\n').sort((a, b) => b.localeCompare(a)).join('\n');
    }
    if (action === 'reverse') {
      res = cleanInput.split('').reverse().join('');
    }
    if (action === 'replace' && findText) {
      res = cleanInput.replaceAll(findText, replaceText);
    }
    setCleanOutput(res);
    setCleanHasRun(true);
  };

  // ==========================================
  // 4. TEXT DIFF CHECKER
  // ==========================================
  const [diffOriginal, setDiffOriginal] = useState(
    'The quick brown fox jumps over the lazy dog.\nAll files stay private on device.'
  );
  const [diffModified, setDiffModified] = useState(
    'The quick brown fox leaps over the sleepy dog.\nAll files stay private on device with zero cloud tracking.'
  );

  const computeDiff = () => {
    const origLines = diffOriginal.split('\n');
    const modLines = diffModified.split('\n');
    const max = Math.max(origLines.length, modLines.length);
    const rows: Array<{ type: 'same' | 'added' | 'removed'; text: string }> = [];

    for (let i = 0; i < max; i++) {
      const o = origLines[i];
      const m = modLines[i];
      if (o === m) {
        rows.push({ type: 'same', text: `  ${o}` });
      } else if (o !== undefined && m !== undefined) {
        rows.push({ type: 'removed', text: `- ${o}` });
        rows.push({ type: 'added', text: `+ ${m}` });
      } else if (o !== undefined) {
        rows.push({ type: 'removed', text: `- ${o}` });
      } else if (m !== undefined) {
        rows.push({ type: 'added', text: `+ ${m}` });
      }
    }
    return rows;
  };

  // ==========================================
  // 5. EXTRACTORS (EMAIL, URL, PHONE) — auto-compute live, no button
  // ==========================================
  const [extractInput, setExtractInput] = useState(
    'For support, email us at support@toolstrum.app or visit https://toolstrum.app/help. Call us directly at +1-800-555-0199 or billing@toolstrum.app.'
  );

  const getExtractedMatches = (kind: 'email' | 'url' | 'phone'): string[] => {
    let re: RegExp;
    if (kind === 'email') re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    else if (kind === 'url') re = /https?:\/\/[^\s$.?#].[^\s]*/g;
    else re = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    return Array.from(new Set(extractInput.match(re) || []));
  };

  // ==========================================
  // 5b. TEXT SPLITTER & MERGER
  // ==========================================
  const [splitInput, setSplitInput] = useState('apples, bananas, cherries, dates');
  const [splitDelimiter, setSplitDelimiter] = useState<'comma' | 'newline' | 'space' | 'custom'>('comma');
  const [splitCustomDelimiter, setSplitCustomDelimiter] = useState('|');

  const getSplitParts = (): string[] => {
    const delim = splitDelimiter === 'comma' ? ',' : splitDelimiter === 'newline' ? '\n' : splitDelimiter === 'space' ? ' ' : (splitCustomDelimiter || ',');
    return splitInput.split(delim).map((s) => s.trim()).filter(Boolean);
  };

  const [mergeInput, setMergeInput] = useState('apples\nbananas\ncherries\ndates');
  const [mergeSeparator, setMergeSeparator] = useState<'comma' | 'newline' | 'space' | 'custom'>('comma');
  const [mergeCustomSeparator, setMergeCustomSeparator] = useState(' | ');

  const getMergedText = (): string => {
    const sep = mergeSeparator === 'comma' ? ', ' : mergeSeparator === 'newline' ? '\n' : mergeSeparator === 'space' ? ' ' : (mergeCustomSeparator || ', ');
    return mergeInput.split('\n').map((s) => s.trim()).filter(Boolean).join(sep);
  };

  // ==========================================
  // 5c. TEXT TO ASCII / ASCII TO TEXT
  // ==========================================
  const [asciiTextInput, setAsciiTextInput] = useState('Toolstrum');

  const getAsciiCodes = (): string => {
    return asciiTextInput.split('').map((c) => c.charCodeAt(0)).join(' ');
  };

  const [asciiCodeInput, setAsciiCodeInput] = useState('84 111 111 108 115 116 114 117 109');

  const getAsciiDecodedResult = (): { value: string; error: string } => {
    try {
      const codes = asciiCodeInput.trim().split(/\s+/).filter(Boolean).map(Number);
      if (codes.some((n) => isNaN(n) || n < 0)) throw new Error('Codes must be space-separated non-negative numbers.');
      return { value: codes.map((n) => String.fromCharCode(n)).join(''), error: '' };
    } catch (e: any) {
      return { value: '', error: e.message };
    }
  };

  // ==========================================
  // 5d. UNICODE INSPECTOR
  // ==========================================
  const [unicodeInput, setUnicodeInput] = useState('Toolstrum');

  const getUnicodeBreakdown = () => {
    return Array.from(unicodeInput).slice(0, 60).map((char) => {
      const codePoint = char.codePointAt(0) || 0;
      return {
        char,
        codePoint,
        hex: 'U+' + codePoint.toString(16).toUpperCase().padStart(4, '0'),
        decimal: codePoint,
      };
    });
  };

  // ==========================================
  // 6. GENERATORS (LOREM IPSUM, MARKDOWN TABLE)
  // ==========================================
  const [loremParas, setLoremParas] = useState(3);
  const [genOutput, setGenOutput] = useState('');
  const [genHasRun, setGenHasRun] = useState(false);

  const handleGenerateLorem = () => {
    const sentences = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia.',
    ];
    let paras: string[] = [];
    for (let p = 0; p < loremParas; p++) {
      paras.push(sentences.join(' '));
    }
    setGenOutput(paras.join('\n\n'));
    setGenHasRun(true);
  };

  const handleGenerateMarkdownTable = () => {
    const table = `| Item | Description | Price | Status |\n| :--- | :--- | :---: | :---: |\n| Product A | Premium mechanical switch | $99.00 | In Stock |\n| Product B | Ergonomic desk wrist rest | $29.00 | Low Stock |\n| Product C | USB-C Braided Cable 2M | $14.50 | In Stock |`;
    setGenOutput(table);
    setGenHasRun(true);
  };

  // ==========================================
  // 7. TEXT ENCODER / DECODER
  // ==========================================
  const [encInput, setEncInput] = useState('Toolstrum runs 100% offline.');
  const [encType, setEncType] = useState<'base64' | 'url'>('base64');

  // Pure — no state writes during render. Returns the result or an error,
  // never both; the caller decides what to show.
  // HTML entity encoding deliberately lives only in the dedicated HTML Entity
  // Encoder/Decoder tools (Developer Studio) — not duplicated here.
  const getEncodedResult = (): { value: string; error: string } => {
    try {
      if (encType === 'base64') return { value: btoa(unescape(encodeURIComponent(encInput))), error: '' };
      return { value: encodeURIComponent(encInput), error: '' };
    } catch (e: any) {
      return { value: '', error: e.message };
    }
  };

  const [decInput, setDecInput] = useState('VG9vbHN0cnVtIHJ1bnMgMTAwJSBvZmZsaW5lLg==');
  const [decType, setDecType] = useState<'base64' | 'url'>('base64');

  const getDecodedResult = (): { value: string; error: string } => {
    try {
      if (decType === 'base64') return { value: decodeURIComponent(escape(atob(decInput))), error: '' };
      return { value: decodeURIComponent(decInput), error: '' };
    } catch (e: any) {
      return { value: '', error: 'Invalid input for the selected decoding — ' + e.message };
    }
  };

  // ==========================================
  // 8. RANDOM TEXT & NAME LIST GENERATORS
  // ==========================================
  const [randomSentenceCount, setRandomSentenceCount] = useState(5);
  const [randomTextOutput, setRandomTextOutput] = useState('');
  const subjects = ['The offline engine', 'Your private workspace', 'A background worker', 'The local processor', 'Every saved file', 'The browser sandbox'];
  const verbs = ['processes', 'validates', 'transforms', 'compresses', 'renders', 'encrypts'];
  const objects = ['the document instantly', 'your input without a server', 'the dataset in memory', 'the file on-device', 'the request locally', 'the content securely'];

  const handleGenerateRandomText = () => {
    const lines: string[] = [];
    for (let i = 0; i < randomSentenceCount; i++) {
      const s = subjects[Math.floor(Math.random() * subjects.length)];
      const v = verbs[Math.floor(Math.random() * verbs.length)];
      const o = objects[Math.floor(Math.random() * objects.length)];
      lines.push(`${s} ${v} ${o}.`);
    }
    setRandomTextOutput(lines.join(' '));
  };

  const [nameListCount, setNameListCount] = useState(10);
  const [nameListOutput, setNameListOutput] = useState('');
  const firstNames = ['Alex', 'Jordan', 'Riya', 'Sam', 'Morgan', 'Priya', 'Chris', 'Dana', 'Omar', 'Lee', 'Nina', 'Theo'];
  const lastNames = ['Carter', 'Sharma', 'Nguyen', 'Patel', 'Rossi', 'Kim', 'Brown', 'Dubois', 'Khan', 'Garcia'];

  const handleGenerateNameList = () => {
    const names: string[] = [];
    for (let i = 0; i < nameListCount; i++) {
      const f = firstNames[Math.floor(Math.random() * firstNames.length)];
      const l = lastNames[Math.floor(Math.random() * lastNames.length)];
      names.push(`${f} ${l}`);
    }
    setNameListOutput(names.join('\n'));
  };

  // ==========================================
  // 9. GRAMMAR ASSISTANT (RULE-BASED PROOFREADING)
  // ==========================================
  const [grammarInput, setGrammarInput] = useState(
    'this is  a test sentence. It has a a repeated word and no capital letter to start one sentence Also this one is missing final punctuation'
  );

  const getGrammarIssues = () => {
    const issues: { rule: string; detail: string }[] = [];
    if (/ {2,}/.test(grammarInput)) issues.push({ rule: 'Double spaces', detail: 'Found two or more consecutive spaces.' });
    const repeated = grammarInput.match(/\b(\w+)\s+\1\b/gi);
    if (repeated) repeated.forEach((r) => issues.push({ rule: 'Repeated word', detail: `"${r.trim()}" appears twice in a row.` }));
    const sentences = grammarInput.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    sentences.forEach((s) => {
      const trimmed = s.trim();
      if (trimmed && /^[a-z]/.test(trimmed)) issues.push({ rule: 'Missing capitalization', detail: `Sentence starts lowercase: "${trimmed.slice(0, 30)}${trimmed.length > 30 ? '…' : ''}"` });
    });
    const last = grammarInput.trim();
    if (last && !/[.!?]$/.test(last)) issues.push({ rule: 'Missing end punctuation', detail: 'The text does not end with ., ! or ?.' });
    if (/\s[,.!?]/.test(grammarInput)) issues.push({ rule: 'Space before punctuation', detail: 'Found a space immediately before a punctuation mark.' });
    return issues;
  };

  // ==========================================
  // 10. SPELL CHECKER (COMMON-WORDS DICTIONARY)
  // ==========================================
  const [spellInput, setSpellInput] = useState('This sentense has a smal typografical mistake.');

  const getSpellIssues = () => {
    const tokens = spellInput.match(/[A-Za-z']+/g) || [];
    const flagged: string[] = [];
    const seen = new Set<string>();
    tokens.forEach((t) => {
      const lower = t.toLowerCase();
      if (!COMMON_WORDS.has(lower) && !seen.has(lower)) {
        seen.add(lower);
        flagged.push(t);
      }
    });
    return flagged;
  };

  // ==========================================
  // 11. MARKDOWN EDITOR (LIVE PREVIEW)
  // ==========================================
  const [mdEditorInput, setMdEditorInput] = useState(
    '# Toolstrum Notes\n\nThis editor renders **bold**, *italic*, and `code` live.\n\n- Point one\n- Point two\n\n[Visit site](https://toolstrum.app)'
  );

  const renderMarkdownToHtml = (src: string): string => {
    let html = src
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/^### (.*)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*)$/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^- (.*)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`);
    return html
      .split(/\n{2,}/)
      .map((block) => (/^<(h1|h2|h3|ul)/.test(block.trim()) ? block : `<p>${block.replace(/\n/g, '<br/>')}</p>`))
      .join('\n');
  };

  // ==========================================
  // 12. MEETING NOTES / RESUME / EMAIL DRAFT FORMATTERS
  // ==========================================
  const [meetingTitle, setMeetingTitle] = useState('Weekly Sync');
  const [meetingAttendees, setMeetingAttendees] = useState('Alex, Priya, Sam');
  const [meetingAgenda, setMeetingAgenda] = useState('Review roadmap\nDiscuss blockers');
  const [meetingActions, setMeetingActions] = useState('Alex to update the roadmap doc\nSam to unblock the API issue');

  const getMeetingNotesOutput = () => {
    const agendaLines = meetingAgenda.split('\n').filter(Boolean).map((l) => `  • ${l}`).join('\n');
    const actionLines = meetingActions.split('\n').filter(Boolean).map((l) => `  [ ] ${l}`).join('\n');
    return `MEETING NOTES: ${meetingTitle}\nDate: ${new Date().toLocaleDateString()}\n\nAttendees: ${meetingAttendees}\n\nAgenda:\n${agendaLines}\n\nAction Items:\n${actionLines}`;
  };

  const [resumeName, setResumeName] = useState('Jordan Lee');
  const [resumeContact, setResumeContact] = useState('jordan.lee@email.com · +1 555 0100');
  const [resumeSummary, setResumeSummary] = useState('Frontend engineer focused on fast, accessible web applications.');
  const [resumeExperience, setResumeExperience] = useState('Senior Developer, Acme Co (2022–Present)\nDeveloper, Beta Inc (2019–2022)');
  const [resumeSkills, setResumeSkills] = useState('TypeScript, React, Accessibility, Performance');

  const getResumeOutput = () => {
    return `${resumeName}\n${resumeContact}\n\nSUMMARY\n${resumeSummary}\n\nEXPERIENCE\n${resumeExperience}\n\nSKILLS\n${resumeSkills}`;
  };

  const [emailRecipient, setEmailRecipient] = useState('Hiring Team');
  const [emailPoints, setEmailPoints] = useState('Following up on my application\nAvailable for a call this week');
  const [emailTone, setEmailTone] = useState<'formal' | 'friendly' | 'direct'>('formal');

  const getEmailDraftOutput = () => {
    const points = emailPoints.split('\n').filter(Boolean).map((p) => `- ${p}`).join('\n');
    const openings: Record<string, string> = {
      formal: `Dear ${emailRecipient},\n\nI hope this message finds you well.`,
      friendly: `Hi ${emailRecipient},\n\nHope you're doing great!`,
      direct: `${emailRecipient},`,
    };
    const closings: Record<string, string> = {
      formal: 'Thank you for your time and consideration.\n\nBest regards,',
      friendly: 'Thanks so much!\n\nCheers,',
      direct: 'Thanks,',
    };
    return `${openings[emailTone]}\n\n${points}\n\n${closings[emailTone]}`;
  };

  // ==========================================
  // 13. BENGALI-ENGLISH TEXT HELPER (PHONETIC TRANSLITERATION)
  // ==========================================
  const [transliterateInput, setTransliterateInput] = useState('ami tomake bhalobashi');

  // Consonants always map to their inherent-vowel letter form.
  const BENGALI_CONSONANTS: [string, string][] = [
    ['kh', 'খ'], ['gh', 'ঘ'], ['chh', 'ছ'], ['ch', 'চ'], ['jh', 'ঝ'], ['Th', 'ঠ'], ['Dh', 'ঢ'], ['th', 'থ'], ['dh', 'ধ'], ['ph', 'ফ'], ['bh', 'ভ'],
    ['ng', 'ঙ'], ['sh', 'শ'],
    ['k', 'ক'], ['g', 'গ'], ['j', 'জ'], ['T', 'ট'], ['D', 'ড'], ['N', 'ণ'], ['t', 'ত'], ['d', 'দ'], ['n', 'ন'],
    ['p', 'প'], ['b', 'ব'], ['m', 'ম'], ['z', 'য'], ['r', 'র'], ['l', 'ল'], ['S', 'ষ'], ['s', 'স'], ['h', 'হ'],
  ];
  // Vowels need a different glyph depending on context: an independent
  // letter at the start of a word/syllable, or a "matra" sign attached to
  // the preceding consonant (with plain "a" silent, since every consonant
  // already carries an inherent "a" sound — the same convention real
  // Bengali phonetic keyboards use, e.g. "ma" → "ম", "maa" → "মা").
  const BENGALI_VOWELS_INDEPENDENT: [string, string][] = [
    ['aa', 'আ'], ['oi', 'ঐ'], ['ou', 'ঔ'], ['ii', 'ঈ'], ['uu', 'ঊ'],
    ['a', 'অ'], ['i', 'ই'], ['u', 'উ'], ['e', 'এ'], ['o', 'ও'],
  ];
  const BENGALI_VOWELS_MATRA: [string, string][] = [
    ['aa', 'া'], ['oi', 'ৈ'], ['ou', 'ৌ'], ['ii', 'ী'], ['uu', 'ূ'],
    ['a', ''], ['i', 'ি'], ['u', 'ু'], ['e', 'ে'], ['o', 'ো'],
  ];
  const BENGALI_DIGITS: [string, string][] = [
    ['0', '০'], ['1', '১'], ['2', '২'], ['3', '৩'], ['4', '৪'], ['5', '৫'], ['6', '৬'], ['7', '৭'], ['8', '৮'], ['9', '৯'],
  ];

  const transliterateToBengali = (src: string): string => {
    let result = '';
    let i = 0;
    let lastWasConsonant = false;
    const lower = src.toLowerCase();
    while (i < lower.length) {
      if (!/[a-z0-9]/.test(lower[i])) {
        result += src[i];
        i++;
        lastWasConsonant = false;
        continue;
      }
      let matched = false;
      for (const [latin, bengali] of BENGALI_CONSONANTS) {
        if (lower.startsWith(latin, i)) {
          result += bengali;
          i += latin.length;
          lastWasConsonant = true;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      const vowelTable = lastWasConsonant ? BENGALI_VOWELS_MATRA : BENGALI_VOWELS_INDEPENDENT;
      for (const [latin, bengali] of vowelTable) {
        if (lower.startsWith(latin, i)) {
          result += bengali;
          i += latin.length;
          lastWasConsonant = false;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      for (const [latin, bengali] of BENGALI_DIGITS) {
        if (lower.startsWith(latin, i)) {
          result += bengali;
          i += latin.length;
          lastWasConsonant = false;
          matched = true;
          break;
        }
      }
      if (!matched) {
        result += src[i];
        i++;
        lastWasConsonant = false;
      }
    }
    return result;
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Type className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Text & Writing Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Word counters, case changers, text cleaners, diff comparisons, and extractors. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: WORD & CHARACTER COUNTER */}
      {/* ======================================================== */}
      {activeTab === 'counter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Enter or Paste Text
            </label>
            <textarea
              value={counterText}
              onChange={(e) => setCounterText(e.target.value)}
              rows={12}
              className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono leading-relaxed"
              placeholder="Type or paste text to count words..."
            />
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                Total Words
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
                {metrics.words.toLocaleString()}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Characters</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.chars}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">No Spaces</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.charsNoSpaces}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Sentences</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.sentences}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Paragraphs</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.paragraphs}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Reading Time</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.readingTime} min</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Speaking Time</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{metrics.speakingTime} min</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">Flesch Reading Ease</span>
                  <span className="font-black text-lg text-slate-900 dark:text-white">{metrics.fleschScore}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{metrics.readabilityLabel}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: CASE CONVERTER */}
      {/* ======================================================== */}
      {activeTab === 'case' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Source String
            </label>
            <textarea
              value={caseInput}
              onChange={(e) => setCaseInput(e.target.value)}
              rows={6}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
            />

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'upper', label: 'UPPERCASE' },
                { id: 'lower', label: 'lowercase' },
                { id: 'title', label: 'Title Case' },
                { id: 'camel', label: 'camelCase' },
                { id: 'snake', label: 'snake_case' },
                { id: 'kebab', label: 'kebab-case' },
                { id: 'slug', label: 'URL slug' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => applyCase(c.id as any)}
                  className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-all text-center"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {caseHasRun && caseOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Converted String
                  </span>
                  <button
                    onClick={() => handleCopy(caseOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white break-all whitespace-pre-wrap">
                  {caseOutput}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select a case format button on the left to transform your text. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: CLEAN & SORT LINES */}
      {/* ======================================================== */}
      {activeTab === 'clean' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <label className="text-xs font-bold text-slate-900 dark:text-white block">
              Multi-Line Content
            </label>
            <textarea
              value={cleanInput}
              onChange={(e) => setCleanInput(e.target.value)}
              rows={8}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCleanAction('stripSpaces')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Trim Spaces
              </button>
              <button
                onClick={() => handleCleanAction('stripEmpty')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Remove Empty Lines
              </button>
              <button
                onClick={() => handleCleanAction('dedupe')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Remove Duplicates
              </button>
              <button
                onClick={() => handleCleanAction('sortAsc')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Sort A→Z
              </button>
              <button
                onClick={() => handleCleanAction('sortDesc')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold"
              >
                Sort Z→A
              </button>
            </div>

            {/* Find & Replace Box */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Find & Replace
              </span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Find text..."
                  value={findText}
                  onChange={(e) => setFindText(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
                <input
                  type="text"
                  placeholder="Replace with..."
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                />
              </div>
              <button
                onClick={() => handleCleanAction('replace')}
                className="w-full py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
              >
                Execute Replace
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {cleanHasRun && cleanOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">
                    Cleaned Output ({cleanOutput.split('\n').length} Lines)
                  </span>
                  <button
                    onClick={() => handleCopy(cleanOutput)}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white max-h-[360px] overflow-y-auto leading-relaxed">
                  {cleanOutput}
                </pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Click any cleaning or sorting button on the left to process your text. 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TEXT DIFF CHECKER */}
      {/* ======================================================== */}
      {activeTab === 'diff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Original Text (Before)
              </label>
              <textarea
                value={diffOriginal}
                onChange={(e) => setDiffOriginal(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-white">
                Modified Text (After)
              </label>
              <textarea
                value={diffModified}
                onChange={(e) => setDiffModified(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs space-y-1">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800 flex items-center justify-between">
              <span>Line-by-Line Visual Diff</span>
              <span className="text-emerald-400">+ Added / <span className="text-rose-400">- Removed</span></span>
            </div>
            {computeDiff().map((row, i) => (
              <div
                key={i}
                className={`py-1 px-2.5 rounded-md whitespace-pre-wrap ${
                  row.type === 'added'
                    ? 'bg-emerald-950/70 text-emerald-300 font-medium'
                    : row.type === 'removed'
                    ? 'bg-rose-950/70 text-rose-300'
                    : 'text-slate-400'
                }`}
              >
                {row.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 218 — TEXT SPLITTER */}
      {toolId === 218 && (() => {
        const parts = getSplitParts();
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Text Splitter</h3>
              <textarea value={splitInput} onChange={(e) => setSplitInput(e.target.value)} rows={8} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono" />
              <div className="flex gap-1.5">
                {(['comma', 'newline', 'space', 'custom'] as const).map((d) => (
                  <button key={d} onClick={() => setSplitDelimiter(d)} className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${splitDelimiter === d ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{d}</button>
                ))}
              </div>
              {splitDelimiter === 'custom' && (
                <input type="text" value={splitCustomDelimiter} onChange={(e) => setSplitCustomDelimiter(e.target.value)} placeholder="Custom delimiter" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
              )}
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{parts.length} Parts</span>
                {parts.length > 0 && <button onClick={() => handleCopy(parts.join('\n'))} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>}
              </div>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {parts.map((p, i) => <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs break-all">{p}</div>)}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 219 — TEXT MERGER */}
      {toolId === 219 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Text Merger</h3>
            <p className="text-xs text-slate-500">Enter one item per line — they'll be joined with your chosen separator.</p>
            <textarea value={mergeInput} onChange={(e) => setMergeInput(e.target.value)} rows={8} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono" />
            <div className="flex gap-1.5">
              {(['comma', 'newline', 'space', 'custom'] as const).map((s) => (
                <button key={s} onClick={() => setMergeSeparator(s)} className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${mergeSeparator === s ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{s}</button>
              ))}
            </div>
            {mergeSeparator === 'custom' && (
              <input type="text" value={mergeCustomSeparator} onChange={(e) => setMergeCustomSeparator(e.target.value)} placeholder="Custom separator" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            )}
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Merged Result</span>
              <button onClick={() => handleCopy(getMergedText())} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">{getMergedText()}</pre>
          </div>
        </div>
      )}

      {/* 223 — URL EXTRACTOR */}
      {toolId === 223 && (() => {
        const matches = getExtractedMatches('url');
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">URL Extractor</h3>
              <textarea value={extractInput} onChange={(e) => setExtractInput(e.target.value)} rows={8} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{matches.length} URL{matches.length === 1 ? '' : 's'} Found</span>
                {matches.length > 0 && <button onClick={() => handleCopy(matches.join('\n'))} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>}
              </div>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {matches.length > 0 ? matches.map((m, i) => <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs break-all">{m}</div>) : <p className="text-xs text-slate-500">No URLs found in the text.</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 224 — EMAIL EXTRACTOR */}
      {toolId === 224 && (() => {
        const matches = getExtractedMatches('email');
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Email Extractor</h3>
              <textarea value={extractInput} onChange={(e) => setExtractInput(e.target.value)} rows={8} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{matches.length} Email{matches.length === 1 ? '' : 's'} Found</span>
                {matches.length > 0 && <button onClick={() => handleCopy(matches.join('\n'))} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>}
              </div>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {matches.length > 0 ? matches.map((m, i) => <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs break-all">{m}</div>) : <p className="text-xs text-slate-500">No email addresses found in the text.</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 225 — PHONE NUMBER EXTRACTOR */}
      {toolId === 225 && (() => {
        const matches = getExtractedMatches('phone');
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Phone Number Extractor</h3>
              <textarea value={extractInput} onChange={(e) => setExtractInput(e.target.value)} rows={8} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{matches.length} Number{matches.length === 1 ? '' : 's'} Found</span>
                {matches.length > 0 && <button onClick={() => handleCopy(matches.join('\n'))} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>}
              </div>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {matches.length > 0 ? matches.map((m, i) => <div key={i} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs break-all">{m}</div>) : <p className="text-xs text-slate-500">No phone numbers found in the text.</p>}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 226 — TEXT TO ASCII */}
      {toolId === 226 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Text to ASCII</h3>
            <textarea value={asciiTextInput} onChange={(e) => setAsciiTextInput(e.target.value)} rows={6} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Character Codes</span>
              <button onClick={() => handleCopy(getAsciiCodes())} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">{getAsciiCodes()}</pre>
          </div>
        </div>
      )}

      {/* 227 — ASCII TO TEXT */}
      {toolId === 227 && (() => {
        const { value: decoded, error: asciiError } = getAsciiDecodedResult();
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">ASCII to Text</h3>
              <p className="text-xs text-slate-500">Enter space-separated character codes, e.g. "84 111 111 108".</p>
              <textarea value={asciiCodeInput} onChange={(e) => setAsciiCodeInput(e.target.value)} rows={6} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Decoded Text</span>
                {decoded && <button onClick={() => handleCopy(decoded)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>}
              </div>
              {asciiError ? <p className="text-xs text-rose-600 font-medium">{asciiError}</p> : (
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">{decoded}</pre>
              )}
            </div>
          </div>
        );
      })()}

      {/* 228 — UNICODE INSPECTOR */}
      {toolId === 228 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unicode Inspector</h3>
            <textarea value={unicodeInput} onChange={(e) => setUnicodeInput(e.target.value)} rows={6} className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Code Points</span>
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto">
              {getUnicodeBreakdown().map((c, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-center">
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{c.char === ' ' ? '␣' : c.char}</div>
                  <div className="text-[10px] font-mono text-slate-500">{c.hex}</div>
                  <div className="text-[10px] font-mono text-slate-400">{c.decimal}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 229 — TEXT ENCODER */}
      {toolId === 229 && (() => {
        const { value: encValue, error: encError } = getEncodedResult();
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" /> Text Encoder</h3>
              <div className="flex gap-1.5">
                {(['base64', 'url'] as const).map((t) => (
                  <button key={t} onClick={() => setEncType(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${encType === t ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{t}</button>
                ))}
              </div>
              <textarea value={encInput} onChange={(e) => setEncInput(e.target.value)} rows={8} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Encoded Output</span>
                <button onClick={() => handleCopy(encValue)} disabled={!encValue} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span>
                </button>
              </div>
              {encError ? (
                <p className="text-xs text-rose-600 font-medium">{encError}</p>
              ) : (
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap break-all max-h-[300px] overflow-y-auto">{encValue}</pre>
              )}
            </div>
          </div>
        );
      })()}

      {/* 230 — TEXT DECODER */}
      {toolId === 230 && (() => {
        const { value: decValue, error: decError } = getDecodedResult();
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Unlock className="w-4 h-4 text-orange-500" /> Text Decoder</h3>
              <div className="flex gap-1.5">
                {(['base64', 'url'] as const).map((t) => (
                  <button key={t} onClick={() => setDecType(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase ${decType === t ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{t}</button>
                ))}
              </div>
              <textarea value={decInput} onChange={(e) => setDecInput(e.target.value)} rows={8} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Decoded Output</span>
                <button onClick={() => handleCopy(decValue)} disabled={!decValue} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span>
                </button>
              </div>
              {decError ? (
                <p className="text-xs text-rose-600 font-medium">{decError}</p>
              ) : (
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">{decValue}</pre>
              )}
            </div>
          </div>
        );
      })()}

      {/* 231 — LOREM IPSUM GENERATOR */}
      {toolId === 231 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Lorem Ipsum Generator</h3>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Paragraphs ({loremParas})</label>
            <input type="range" min="1" max="10" value={loremParas} onChange={(e) => setLoremParas(Number(e.target.value))} className="w-full accent-orange-600" />
            <button onClick={handleGenerateLorem} className="w-full mt-2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs">Generate Lorem Ipsum</button>
          </div>
          <div className="space-y-4">
            {genHasRun && genOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Generated Text</span>
                  <button onClick={() => handleCopy(genOutput)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs max-h-[320px] overflow-y-auto whitespace-pre-wrap leading-relaxed">{genOutput}</pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Click Generate to create placeholder text.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 232 — RANDOM TEXT GENERATOR */}
      {toolId === 232 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-500" /> Random Text Generator</h3>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Sentences ({randomSentenceCount})</label>
            <input type="range" min="1" max="20" value={randomSentenceCount} onChange={(e) => setRandomSentenceCount(Number(e.target.value))} className="w-full accent-orange-600" />
            <button onClick={handleGenerateRandomText} className="w-full mt-2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs">Generate Random Sentences</button>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Generated Text</span>
              {randomTextOutput && <button onClick={() => handleCopy(randomTextOutput)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{randomTextOutput || 'Click Generate to create randomized sample sentences.'}</p>
          </div>
        </div>
      )}

      {/* 233 — NAME LIST GENERATOR */}
      {toolId === 233 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Users className="w-4 h-4 text-orange-500" /> Name List Generator</h3>
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Names ({nameListCount})</label>
            <input type="range" min="1" max="50" value={nameListCount} onChange={(e) => setNameListCount(Number(e.target.value))} className="w-full accent-orange-600" />
            <button onClick={handleGenerateNameList} className="w-full mt-2 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs">Generate Sample Names</button>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Generated Names</span>
              {nameListOutput && <button onClick={() => handleCopy(nameListOutput)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>}
            </div>
            <pre className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-[280px] overflow-y-auto">{nameListOutput || 'Click Generate to create a sample name list.'}</pre>
          </div>
        </div>
      )}

      {/* 235 — GRAMMAR ASSISTANT (RULE-BASED PROOFREADING) */}
      {toolId === 235 && (() => {
        const issues = getGrammarIssues();
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Wand2 className="w-4 h-4 text-orange-500" /> Grammar Assistant</h3>
              <p className="text-xs text-slate-500">Runs basic rule-based proofreading checks (repeated words, capitalization, spacing, punctuation) — not a full grammar model.</p>
              <textarea value={grammarInput} onChange={(e) => setGrammarInput(e.target.value)} rows={10} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-2.5">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{issues.length} issue{issues.length === 1 ? '' : 's'} found</span>
              {issues.length === 0 ? (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5"><Check className="w-4 h-4" /> No issues found by these checks.</p>
              ) : (
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {issues.map((iss, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-400">{iss.rule}</span>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">{iss.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 236 — SPELL CHECKER (COMMON-WORDS DICTIONARY) */}
      {toolId === 236 && (() => {
        const flagged = getSpellIssues();
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><SpellCheck className="w-4 h-4 text-orange-500" /> Spell Checker</h3>
              <p className="text-xs text-slate-500">Flags words not found in a common-English-words dictionary. Names, technical terms, and uncommon words may be flagged even when correct.</p>
              <textarea value={spellInput} onChange={(e) => setSpellInput(e.target.value)} rows={10} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            </div>
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-2.5">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">{flagged.length} word{flagged.length === 1 ? '' : 's'} flagged</span>
              {flagged.length === 0 ? (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5"><Check className="w-4 h-4" /> No unrecognized words found.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {flagged.map((w, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-semibold">{w}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* 238 — MARKDOWN EDITOR (LIVE PREVIEW) */}
      {toolId === 238 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Code2 className="w-4 h-4 text-orange-500" /> Markdown Editor</h3>
            <textarea value={mdEditorInput} onChange={(e) => setMdEditorInput(e.target.value)} rows={14} className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs" />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Live Preview</span>
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm text-slate-800 dark:text-slate-200 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_h3]:text-base [&_h3]:font-bold [&_code]:bg-slate-100 [&_code]:dark:bg-slate-800 [&_code]:px-1 [&_code]:rounded [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-orange-600 [&_a]:underline" dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(mdEditorInput) }} />
          </div>
        </div>
      )}

      {/* 239 — MARKDOWN TABLE GENERATOR */}
      {toolId === 239 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Markdown Table Generator</h3>
            <button onClick={handleGenerateMarkdownTable} className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs">Generate Markdown Table Template</button>
          </div>
          <div className="space-y-4">
            {genHasRun && genOutput ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Generated Table</span>
                  <button onClick={() => handleCopy(genOutput)} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs max-h-[320px] overflow-y-auto whitespace-pre-wrap">{genOutput}</pre>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">Click Generate to create a markdown table template.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 240 — MEETING NOTES FORMATTER */}
      {toolId === 240 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Calendar className="w-4 h-4 text-orange-500" /> Meeting Notes Formatter</h3>
            <input type="text" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} placeholder="Meeting title" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <input type="text" value={meetingAttendees} onChange={(e) => setMeetingAttendees(e.target.value)} placeholder="Attendees (comma-separated)" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <textarea value={meetingAgenda} onChange={(e) => setMeetingAgenda(e.target.value)} placeholder="Agenda (one per line)" rows={3} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <textarea value={meetingActions} onChange={(e) => setMeetingActions(e.target.value)} placeholder="Action items (one per line)" rows={3} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Formatted Notes</span>
              <button onClick={() => handleCopy(getMeetingNotesOutput())} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-[320px] overflow-y-auto">{getMeetingNotesOutput()}</pre>
          </div>
        </div>
      )}

      {/* 241 — RESUME TEXT FORMATTER */}
      {toolId === 241 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Briefcase className="w-4 h-4 text-orange-500" /> Resume Text Formatter</h3>
            <input type="text" value={resumeName} onChange={(e) => setResumeName(e.target.value)} placeholder="Full name" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <input type="text" value={resumeContact} onChange={(e) => setResumeContact(e.target.value)} placeholder="Contact details" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <textarea value={resumeSummary} onChange={(e) => setResumeSummary(e.target.value)} placeholder="Summary" rows={2} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <textarea value={resumeExperience} onChange={(e) => setResumeExperience(e.target.value)} placeholder="Experience (one per line)" rows={3} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <textarea value={resumeSkills} onChange={(e) => setResumeSkills(e.target.value)} placeholder="Skills" rows={2} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Formatted Resume</span>
              <button onClick={() => handleCopy(getResumeOutput())} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs whitespace-pre-wrap max-h-[320px] overflow-y-auto">{getResumeOutput()}</pre>
          </div>
        </div>
      )}

      {/* 242 — EMAIL DRAFT ASSISTANT */}
      {toolId === 242 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Mail className="w-4 h-4 text-orange-500" /> Email Draft Assistant</h3>
            <input type="text" value={emailRecipient} onChange={(e) => setEmailRecipient(e.target.value)} placeholder="Recipient name or team" className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <textarea value={emailPoints} onChange={(e) => setEmailPoints(e.target.value)} placeholder="Key points (one per line)" rows={4} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
            <div className="flex gap-1.5">
              {(['formal', 'friendly', 'direct'] as const).map((t) => (
                <button key={t} onClick={() => setEmailTone(t)} className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize ${emailTone === t ? 'bg-orange-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Draft Email</span>
              <button onClick={() => handleCopy(getEmailDraftOutput())} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>
            </div>
            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm whitespace-pre-wrap max-h-[320px] overflow-y-auto">{getEmailDraftOutput()}</pre>
          </div>
        </div>
      )}

      {/* 243 — BENGALI-ENGLISH TEXT HELPER (PHONETIC TRANSLITERATION) */}
      {toolId === 243 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2"><Languages className="w-4 h-4 text-orange-500" /> Bengali-English Text Helper</h3>
            <p className="text-xs text-slate-500">Phonetic transliteration from Romanized ("Banglish") text to Bengali script — not a translation. Double a vowel for its long form, e.g. "maa" → মা, "tumi" → তুমি.</p>
            <textarea value={transliterateInput} onChange={(e) => setTransliterateInput(e.target.value)} rows={8} placeholder="e.g. ami tomake bhalobashi" className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm" />
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-orange-500/30 shadow-md space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider">Bengali Script</span>
              <button onClick={() => handleCopy(transliterateToBengali(transliterateInput))} className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5">{copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}<span>Copy</span></button>
            </div>
            <p className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-2xl leading-relaxed">{transliterateToBengali(transliterateInput)}</p>
          </div>
        </div>
      )}
    </div>
  );
};
