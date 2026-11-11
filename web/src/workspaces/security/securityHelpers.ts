// Client-side security and QR/barcode algorithms

// ---------------------------------------------------------------------------
// 1. Code 128 Barcode Generator (Pure TypeScript to SVG)
// ---------------------------------------------------------------------------
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

export function generateCode128Svg(text: string, height = 70): string {
  if (!text) return '';
  // Start Code B is index 104
  const startCode = 104;
  const stopCode = 106;
  const codes: number[] = [startCode];

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 32 && charCode <= 126) {
      codes.push(charCode - 32);
    }
  }

  // Checksum: (startCode + sum(code_i * i)) % 103
  let checksum = startCode;
  for (let i = 1; i < codes.length; i++) {
    checksum += codes[i] * i;
  }
  checksum %= 103;
  codes.push(checksum);
  codes.push(stopCode);

  let patternStr = '';
  for (const c of codes) {
    patternStr += CODE128_PATTERNS[c] || '';
  }

  // Convert pattern to bars
  let currentX = 10;
  const barElements: string[] = [];
  let isBar = true;

  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10);
    if (isBar) {
      barElements.push(`<rect x="${currentX}" y="5" width="${width * 2}" height="${height}" fill="currentColor" />`);
    }
    currentX += width * 2;
    isBar = !isBar;
  }

  const totalWidth = currentX + 10;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${height + 25}" class="w-full h-auto">
    ${barElements.join('')}
    <text x="${totalWidth / 2}" y="${height + 18}" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="currentColor">${text}</text>
  </svg>`;
}

// ---------------------------------------------------------------------------
// 2. Password Strength Analyzer
// ---------------------------------------------------------------------------
export function analyzePassword(pwd: string): {
  score: number; // 0 to 100
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  entropy: number;
  checks: { name: string; pass: boolean }[];
  feedback: string[];
} {
  if (!pwd) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'text-rose-500',
      entropy: 0,
      checks: [
        { name: 'At least 8 characters', pass: false },
        { name: 'Contains uppercase letter', pass: false },
        { name: 'Contains lowercase letter', pass: false },
        { name: 'Contains number', pass: false },
        { name: 'Contains special symbol', pass: false },
      ],
      feedback: ['Enter a password to inspect security strength.'],
    };
  }

  let poolSize = 0;
  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasDigit = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  const isLong = pwd.length >= 8;
  const isExtraLong = pwd.length >= 14;

  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasDigit) poolSize += 10;
  if (hasSymbol) poolSize += 33;

  const entropy = Math.round(pwd.length * Math.log2(Math.max(2, poolSize)));

  const checks = [
    { name: 'At least 8 characters', pass: isLong },
    { name: 'Contains uppercase letter', pass: hasUpper },
    { name: 'Contains lowercase letter', pass: hasLower },
    { name: 'Contains number', pass: hasDigit },
    { name: 'Contains special symbol', pass: hasSymbol },
  ];

  let rawScore = 0;
  if (isLong) rawScore += 20;
  if (isExtraLong) rawScore += 20;
  if (hasLower) rawScore += 15;
  if (hasUpper) rawScore += 15;
  if (hasDigit) rawScore += 15;
  if (hasSymbol) rawScore += 15;

  // Deduct for repetitive patterns
  if (/(.)\1{2,}/.test(pwd)) rawScore -= 15;
  if (/^[a-zA-Z]+$/.test(pwd) || /^[0-9]+$/.test(pwd)) rawScore -= 20;

  const score = Math.max(5, Math.min(100, rawScore));

  let label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong' = 'Weak';
  let color = 'text-rose-500';

  if (score < 30) {
    label = 'Very Weak';
    color = 'text-rose-500';
  } else if (score < 55) {
    label = 'Weak';
    color = 'text-orange-500';
  } else if (score < 75) {
    label = 'Medium';
    color = 'text-amber-500';
  } else if (score < 90) {
    label = 'Strong';
    color = 'text-emerald-500';
  } else {
    label = 'Very Strong';
    color = 'text-teal-500';
  }

  const feedback: string[] = [];
  if (!isLong) feedback.push('Password should be at least 8 characters long (12+ recommended).');
  if (!hasSymbol) feedback.push('Add special symbols (!@#$%^&*) to significantly boost entropy.');
  if (!hasDigit) feedback.push('Add numeric digits to prevent dictionary brute-forcing.');
  if (score >= 80) feedback.push('Excellent entropy! Resistant to standard offline rainbow table attacks.');

  return { score, label, color, entropy, checks, feedback };
}

// ---------------------------------------------------------------------------
// 3. Diceware Passphrase Generator
// ---------------------------------------------------------------------------
const WORDS = [
  'alpha', 'beacon', 'breeze', 'canyon', 'cascade', 'castle', 'cherry', 'circuit',
  'clover', 'comet', 'cosmic', 'crater', 'crystal', 'delta', 'dolphin', 'dragon',
  'echo', 'ember', 'falcon', 'feather', 'forest', 'fossil', 'galaxy', 'glacier',
  'granite', 'harbor', 'haven', 'horizon', 'island', 'jasper', 'journey', 'jungle',
  'lagoon', 'lantern', 'legacy', 'meadow', 'meteor', 'miracle', 'monarch', 'nebula',
  'oasis', 'ocean', 'orbit', 'orchid', 'pebble', 'phoenix', 'pioneer', 'planet',
  'prism', 'quantum', 'quartz', 'radiant', 'rainbow', 'ripple', 'river', 'rocket',
  'saddle', 'sapphire', 'shadow', 'silver', 'solace', 'solar', 'spark', 'summit',
  'sunburst', 'temple', 'thunder', 'timber', 'topaz', 'torrent', 'tundra', 'valley',
  'velvet', 'vessel', 'vintage', 'voyage', 'whisper', 'willow', 'zenith', 'zephyr'
];

export function generatePassphrase(numWords = 4, separator = '-', capitalize = true, addNumber = true): string {
  const chosen: string[] = [];
  for (let i = 0; i < numWords; i++) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    chosen.push(capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word);
  }
  let res = chosen.join(separator);
  if (addNumber) {
    res += `${separator}${Math.floor(Math.random() * 90 + 10)}`;
  }
  return res;
}

// ---------------------------------------------------------------------------
// 4. Secret & PII Redactor
// ---------------------------------------------------------------------------
export function redactSecrets(text: string): {
  redacted: string;
  foundCount: number;
  types: string[];
} {
  let count = 0;
  const typesFound = new Set<string>();

  const patterns = [
    { type: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/g },
    { type: 'OpenAI API Key', regex: /\bsk-[A-Za-z0-9]{32,}\b/g },
    { type: 'GitHub Token', regex: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g },
    { type: 'Stripe Secret Key', regex: /\b(sk_live|rk_live)_[0-9a-zA-Z]{24,}\b/g },
    { type: 'Slack Token', regex: /\bxox[baprs]-[0-9a-zA-Z-]{10,}\b/g },
    { type: 'JWT Token', regex: /\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g },
    { type: 'Private Key Block', regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g },
    { type: 'Email Address', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  ];

  let result = text;
  for (const p of patterns) {
    result = result.replace(p.regex, (match) => {
      count++;
      typesFound.add(p.type);
      return `[REDACTED_${p.type.toUpperCase().replace(/\s+/g, '_')}]`;
    });
  }

  return { redacted: result, foundCount: count, types: [...typesFound] };
}

// ---------------------------------------------------------------------------
// 5. TOTP (Time-based One-Time Password RFC 6238)
// ---------------------------------------------------------------------------
function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let val = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = alphabet.indexOf(clean[i]);
    if (idx === -1) continue;
    val = (val << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((val >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(bytes);
}

export async function generateTotpCode(secretBase32: string, timeStep = 30): Promise<string> {
  const keyBytes = base32ToBytes(secretBase32);
  if (!keyBytes.length) return '------';

  const epoch = Math.floor(Date.now() / 1000);
  const timeCount = Math.floor(epoch / timeStep);

  const counterBuf = new ArrayBuffer(8);
  const counterView = new DataView(counterBuf);
  counterView.setUint32(4, timeCount, false);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const hmacSig = await crypto.subtle.sign('HMAC', cryptoKey, counterBuf);
  const hmacBytes = new Uint8Array(hmacSig);

  const offset = hmacBytes[hmacBytes.length - 1] & 0x0f;
  const codeInt =
    ((hmacBytes[offset] & 0x7f) << 24) |
    ((hmacBytes[offset + 1] & 0xff) << 16) |
    ((hmacBytes[offset + 2] & 0xff) << 8) |
    (hmacBytes[offset + 3] & 0xff);

  const otp = codeInt % 1000000;
  return String(otp).padStart(6, '0');
}
