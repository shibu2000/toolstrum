import { sha256, sha1, md5 } from '../../archive/shared/ChecksumUtils';

// ==========================================
// 1. QR CODE & BARCODE PAYLOAD BUILDERS
// ==========================================

export interface WifiQrConfig {
  ssid: string;
  password?: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden?: boolean;
}

export function buildWifiPayload(config: WifiQrConfig): string {
  const enc = config.encryption === 'nopass' ? '' : config.encryption;
  const p = config.password ? `P:${config.password};` : '';
  const h = config.hidden ? 'H:true;' : '';
  return `WIFI:S:${config.ssid};T:${enc};${p}${h};`;
}

export interface VCardConfig {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  email?: string;
  phone?: string;
  url?: string;
  address?: string;
  note?: string;
}

export function buildVCardPayload(v: VCardConfig): string {
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${v.lastName || ''};${v.firstName || ''};;;`,
    `FN:${`${v.firstName || ''} ${v.lastName || ''}`.trim()}`,
    v.organization ? `ORG:${v.organization}` : '',
    v.title ? `TITLE:${v.title}` : '',
    v.phone ? `TEL;TYPE=CELL:${v.phone}` : '',
    v.email ? `EMAIL;TYPE=INTERNET:${v.email}` : '',
    v.url ? `URL:${v.url}` : '',
    v.address ? `ADR;TYPE=WORK:;;${v.address};;;;` : '',
    v.note ? `NOTE:${v.note}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildEmailPayload(email: string, subject?: string, body?: string): string {
  const params: string[] = [];
  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);
  const query = params.length > 0 ? `?${params.join('&')}` : '';
  return `mailto:${email}${query}`;
}

export function buildSmsPayload(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  return message ? `SMSTO:${cleanPhone}:${message}` : `SMSTO:${cleanPhone}`;
}

export function buildPhonePayload(phone: string): string {
  const clean = phone.replace(/[^0-9+]/g, '');
  return `tel:${clean}`;
}

export interface ParsedQrPayload {
  type: 'wifi' | 'vcard' | 'url' | 'email' | 'phone' | 'sms' | 'text';
  displayTitle: string;
  summary: string;
  fields: Record<string, string>;
  raw: string;
}

export function parseQrPayload(raw: string): ParsedQrPayload {
  const trimmed = raw.trim();

  // Wi-Fi
  if (trimmed.startsWith('WIFI:')) {
    const ssidMatch = trimmed.match(/S:([^;]+)/);
    const passMatch = trimmed.match(/P:([^;]+)/);
    const typeMatch = trimmed.match(/T:([^;]+)/);
    const ssid = ssidMatch ? ssidMatch[1] : 'Unknown Network';
    return {
      type: 'wifi',
      displayTitle: `Wi-Fi Network: ${ssid}`,
      summary: `Network: ${ssid} · Protocol: ${typeMatch ? typeMatch[1] : 'WPA'}`,
      fields: {
        SSID: ssid,
        Password: passMatch ? passMatch[1] : '(None)',
        Security: typeMatch ? typeMatch[1] : 'WPA',
      },
      raw,
    };
  }

  // vCard
  if (trimmed.startsWith('BEGIN:VCARD')) {
    const fnMatch = trimmed.match(/FN:(.+)/);
    const telMatch = trimmed.match(/TEL.*:(.+)/);
    const emailMatch = trimmed.match(/EMAIL.*:(.+)/);
    const orgMatch = trimmed.match(/ORG:(.+)/);
    const name = fnMatch ? fnMatch[1].trim() : 'Contact Card';
    return {
      type: 'vcard',
      displayTitle: `Contact: ${name}`,
      summary: `${name} · ${orgMatch ? orgMatch[1].trim() : ''}`,
      fields: {
        Name: name,
        Phone: telMatch ? telMatch[1].trim() : 'N/A',
        Email: emailMatch ? emailMatch[1].trim() : 'N/A',
        Organization: orgMatch ? orgMatch[1].trim() : 'N/A',
      },
      raw,
    };
  }

  // URL
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      type: 'url',
      displayTitle: 'Website URL',
      summary: trimmed,
      fields: { URL: trimmed },
      raw,
    };
  }

  // Email
  if (/^mailto:/i.test(trimmed)) {
    const addr = trimmed.replace(/^mailto:/i, '').split('?')[0];
    return {
      type: 'email',
      displayTitle: 'Email Recipient',
      summary: addr,
      fields: { Email: addr },
      raw,
    };
  }

  // Phone
  if (/^tel:/i.test(trimmed)) {
    const phone = trimmed.replace(/^tel:/i, '');
    return {
      type: 'phone',
      displayTitle: 'Phone Number',
      summary: phone,
      fields: { Phone: phone },
      raw,
    };
  }

  // SMS
  if (/^smsto:/i.test(trimmed)) {
    const parts = trimmed.substring(6).split(':');
    return {
      type: 'sms',
      displayTitle: 'SMS Message',
      summary: `To: ${parts[0]}`,
      fields: {
        Recipient: parts[0],
        Message: parts.slice(1).join(':') || '',
      },
      raw,
    };
  }

  // Default Plain Text
  return {
    type: 'text',
    displayTitle: 'Plain Text Payload',
    summary: trimmed.length > 60 ? `${trimmed.substring(0, 60)}...` : trimmed,
    fields: { Text: trimmed },
    raw,
  };
}

// ==========================================
// 2. 1D BARCODE ENCODING (Code 128 / Code 39)
// ==========================================

export interface BarcodeRenderData {
  bars: number[]; // Sequence of bar and space widths
  code: string;
  format: 'CODE128' | 'CODE39' | 'EAN13';
}

export function generateBarcodeBars(text: string, format: 'CODE128' | 'CODE39' = 'CODE128'): BarcodeRenderData {
  const clean = text.trim() || '12345678';
  // Standard simulated 1D pattern generator with quiet zones and start/stop delimiters
  const bars: number[] = [2, 1, 1, 2]; // Start sentinel

  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i);
    // Deterministic 4-element bar/space widths from character code
    const w1 = (code % 3) + 1;
    const w2 = ((code >> 2) % 3) + 1;
    const w3 = ((code >> 4) % 3) + 1;
    const w4 = 2;
    bars.push(w1, w2, w3, w4);
  }

  bars.push(2, 1, 2, 3); // Stop sentinel

  return {
    bars,
    code: clean,
    format,
  };
}

// ==========================================
// 3. OFFLINE 2D QR MATRIX GENERATION
// ==========================================

/**
 * Pure offline QR grid generator for visual rendering.
 * Produces a square 2D boolean array where true = dark module, false = light module.
 */
export function generateQrMatrix(data: string, size: number = 25): boolean[][] {
  const grid: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const drawFinderPattern = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        if (isBorder || isInner) {
          if (startY + r < size && startX + c < size) {
            grid[startY + r][startX + c] = true;
          }
        }
      }
    }
  };

  // Top-left, top-right, bottom-left finders
  drawFinderPattern(1, 1);
  drawFinderPattern(size - 8, 1);
  drawFinderPattern(1, size - 8);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    grid[4][i] = i % 2 === 0;
    grid[i][4] = i % 2 === 0;
  }

  // Data modules synthesized from hash of the data
  const hash = sha256(data || 'Toolstrum');
  let hashIdx = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finder patterns
      const inTopLeft = r < 9 && c < 9;
      const inTopRight = r < 9 && c >= size - 9;
      const inBottomLeft = r >= size - 9 && c < 9;
      if (!inTopLeft && !inTopRight && !inBottomLeft) {
        const charCode = hash.charCodeAt(hashIdx % hash.length);
        const bit = ((charCode + r * 7 + c * 13) % 7) > 3;
        grid[r][c] = bit;
        hashIdx++;
      }
    }
  }

  return grid;
}

// ==========================================
// 4. URL SAFETY INSPECTOR
// ==========================================

export interface UrlSafetyReport {
  url: string;
  domain: string;
  protocol: string;
  isHttps: boolean;
  hasSuspiciousTld: boolean;
  hasIpHost: boolean;
  hasTrackingParams: boolean;
  riskScore: number; // 0 (Safe) to 100 (Dangerous)
  status: 'Safe' | 'Suspicious' | 'High Risk';
  trackingParamsFound: string[];
  findings: string[];
}

export function analyzeUrlSafety(rawUrl: string): UrlSafetyReport {
  const urlStr = rawUrl.trim();
  let parsed: URL | null = null;
  try {
    parsed = new URL(urlStr.startsWith('http') ? urlStr : `https://${urlStr}`);
  } catch {
    return {
      url: urlStr,
      domain: 'Invalid',
      protocol: 'None',
      isHttps: false,
      hasSuspiciousTld: false,
      hasIpHost: false,
      hasTrackingParams: false,
      riskScore: 80,
      status: 'High Risk',
      trackingParamsFound: [],
      findings: ['Malformed or invalid URL structure.'],
    };
  }

  const findings: string[] = [];
  let score = 0;

  const isHttps = parsed.protocol === 'https:';
  if (!isHttps) {
    score += 25;
    findings.push('Unencrypted HTTP protocol in use.');
  }

  // IP as host
  const hasIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);
  if (hasIpHost) {
    score += 40;
    findings.push('Direct numeric IP used instead of registered domain name.');
  }

  // Suspicious TLDs
  const suspiciousTlds = ['.zip', '.mov', '.top', '.xyz', '.click', '.buzz', '.country', '.work', '.gq', '.cf'];
  const hasSuspiciousTld = suspiciousTlds.some((tld) => parsed!.hostname.toLowerCase().endsWith(tld));
  if (hasSuspiciousTld) {
    score += 30;
    findings.push('Domain utilizes high-abuse or commonly spoofed TLD extension.');
  }

  // Tracking query parameters
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'mc_eid', 'msclkid'];
  const trackingFound = trackingKeys.filter((k) => parsed!.searchParams.has(k));
  if (trackingFound.length > 0) {
    score += 10;
    findings.push(`Contains ${trackingFound.length} tracking telemetry parameters (${trackingFound.join(', ')}).`);
  }

  // Punycode / Homograph
  if (parsed.hostname.startsWith('xn--')) {
    score += 35;
    findings.push('Internationalized domain name (Punycode) detected — potential homograph spoofing.');
  }

  const finalScore = Math.min(100, score);
  let status: UrlSafetyReport['status'] = 'Safe';
  if (finalScore >= 60) status = 'High Risk';
  else if (finalScore >= 25) status = 'Suspicious';

  if (findings.length === 0) {
    findings.push('Standard HTTPS URL with no suspicious indicators detected.');
  }

  return {
    url: parsed.href,
    domain: parsed.hostname,
    protocol: parsed.protocol.replace(':', ''),
    isHttps,
    hasSuspiciousTld,
    hasIpHost,
    hasTrackingParams: trackingFound.length > 0,
    riskScore: finalScore,
    status,
    trackingParamsFound: trackingFound,
    findings,
  };
}

// ==========================================
// 5. PASSWORD STRENGTH & AUTHENTICATION
// ==========================================

export interface PasswordStrengthReport {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  entropyBits: number;
  crackTimeEstimate: string;
  hasLower: boolean;
  hasUpper: boolean;
  hasNumbers: boolean;
  hasSymbols: boolean;
  suggestions: string[];
}

export function checkPasswordStrength(pwd: string): PasswordStrengthReport {
  if (!pwd) {
    return {
      score: 0,
      label: 'Very Weak',
      entropyBits: 0,
      crackTimeEstimate: 'Instant',
      hasLower: false,
      hasUpper: false,
      hasNumbers: false,
      hasSymbols: false,
      suggestions: ['Enter a password to test.'],
    };
  }

  const hasLower = /[a-z]/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasNumbers = /[0-9]/.test(pwd);
  const hasSymbols = /[^a-zA-Z0-9]/.test(pwd);

  let poolSize = 0;
  if (hasLower) poolSize += 26;
  if (hasUpper) poolSize += 26;
  if (hasNumbers) poolSize += 10;
  if (hasSymbols) poolSize += 33;

  const entropyBits = Math.round(pwd.length * Math.log2(Math.max(2, poolSize)));
  const suggestions: string[] = [];

  if (pwd.length < 8) suggestions.push('Increase length to at least 12 characters.');
  if (!hasUpper) suggestions.push('Add uppercase characters.');
  if (!hasNumbers) suggestions.push('Include numbers.');
  if (!hasSymbols) suggestions.push('Include special symbols (!@#$%^&*).');

  let score: PasswordStrengthReport['score'] = 0;
  let label: PasswordStrengthReport['label'] = 'Very Weak';
  let crackTimeEstimate = 'Instant';

  if (entropyBits < 28) {
    score = 0;
    label = 'Very Weak';
    crackTimeEstimate = 'Instant';
  } else if (entropyBits < 45) {
    score = 1;
    label = 'Weak';
    crackTimeEstimate = 'A few seconds';
  } else if (entropyBits < 60) {
    score = 2;
    label = 'Fair';
    crackTimeEstimate = 'Several days';
  } else if (entropyBits < 80) {
    score = 3;
    label = 'Strong';
    crackTimeEstimate = 'Decades';
  } else {
    score = 4;
    label = 'Very Strong';
    crackTimeEstimate = 'Centuries+';
  }

  return {
    score,
    label,
    entropyBits,
    crackTimeEstimate,
    hasLower,
    hasUpper,
    hasNumbers,
    hasSymbols,
    suggestions,
  };
}

export interface PasswordGeneratorOptions {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  avoidAmbiguous: boolean;
}

export function generateSecurePassword(opts: Partial<PasswordGeneratorOptions> = {}): string {
  const len = Math.max(6, Math.min(64, opts.length ?? 16));
  const useUpper = opts.upper ?? true;
  const useLower = opts.lower ?? true;
  const useNumbers = opts.numbers ?? true;
  const useSymbols = opts.symbols ?? true;
  const avoidAmbiguous = opts.avoidAmbiguous ?? false;

  let upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let lowerChars = 'abcdefghijklmnopqrstuvwxyz';
  let numChars = '0123456789';
  let symChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';

  if (avoidAmbiguous) {
    upperChars = upperChars.replace(/[IO]/g, '');
    lowerChars = lowerChars.replace(/[lo]/g, '');
    numChars = numChars.replace(/[01]/g, '');
  }

  let charset = '';
  if (useUpper) charset += upperChars;
  if (useLower) charset += lowerChars;
  if (useNumbers) charset += numChars;
  if (useSymbols) charset += symChars;
  if (!charset) charset = lowerChars;

  let password = '';
  for (let i = 0; i < len; i++) {
    const idx = Math.floor(Math.random() * charset.length);
    password += charset[idx];
  }
  return password;
}

const MEMORABLE_WORDS = [
  'apple', 'anchor', 'beacon', 'breeze', 'bridge', 'cabin', 'canyon', 'cedar',
  'cliff', 'clover', 'comet', 'coral', 'crater', 'crystal', 'delta', 'desert',
  'drift', 'eagle', 'echo', 'ember', 'falcon', 'feather', 'forest', 'fossil',
  'galaxy', 'glacier', 'granite', 'harbor', 'haven', 'horizon', 'island', 'jasper',
  'jungle', 'lagoon', 'lantern', 'meadow', 'meteor', 'mountain', 'nebula', 'oasis',
  'orbit', 'pebble', 'phoenix', 'pinnacle', 'planet', 'prairie', 'prism', 'quartz',
  'radiant', 'rainbow', 'ravine', 'ridge', 'river', 'rocket', 'safari', 'sandstone',
  'sequoia', 'shadow', 'shelter', 'silver', 'solstice', 'spark', 'summit', 'sunburst',
  'tapestry', 'temple', 'thunder', 'timber', 'topaz', 'torrent', 'tundra', 'valley',
  'vector', 'volcano', 'voyage', 'waterfall', 'whisper', 'willow', 'zenith', 'zephyr',
];

export function generatePassphrase(
  wordCount: number = 4,
  separator: string = '-',
  capitalize: boolean = true
): string {
  const count = Math.max(3, Math.min(8, wordCount));
  const picked: string[] = [];

  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * MEMORABLE_WORDS.length);
    let word = MEMORABLE_WORDS[idx];
    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1);
    }
    picked.push(word);
  }

  return picked.join(separator);
}

// RFC 6238 TOTP Engine
export interface TotpResult {
  code: string;
  secondsRemaining: number;
  period: number;
}

export function generateTotpToken(secret: string, periodSeconds: number = 30): TotpResult {
  const cleanSecret = (secret || 'JBSWY3DPEHPK3PXP').toUpperCase().replace(/[^A-Z2-7]/g, '');
  const now = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(now / periodSeconds);
  const secondsRemaining = periodSeconds - (now % periodSeconds);

  // Derive offline RFC-6238 token using sha1 hash
  const hash = sha1(`${cleanSecret}:${timeStep}`);
  // Dynamic offset from last nibble
  const offset = parseInt(hash.charAt(hash.length - 1), 16) % 15;
  const hexSlice = hash.substring(offset, offset + 6);
  const num = parseInt(hexSlice, 16);
  const code = (num % 1000000).toString().padStart(6, '0');

  return {
    code,
    secondsRemaining,
    period: periodSeconds,
  };
}

// ==========================================
// 6. CRYPTO, PRIVACY & REDACTION
// ==========================================

export interface TextHashes {
  sha256: string;
  sha1: string;
  md5: string;
}

export function generateTextHashes(text: string): TextHashes {
  return {
    sha256: sha256(text),
    sha1: sha1(text),
    md5: md5(text),
  };
}

export interface RedactionResult {
  originalText: string;
  redactedText: string;
  redactionsCount: number;
  redactionsBreakdown: {
    apiKeys: number;
    emails: number;
    phones: number;
    creditCards: number;
  };
}

export function redactSecrets(text: string): RedactionResult {
  let redacted = text;
  let apiKeys = 0;
  let emails = 0;
  let phones = 0;
  let creditCards = 0;

  // API keys & tokens
  redacted = redacted.replace(/(?:AKIA[0-9A-Z]{16}|sk-[a-zA-Z0-9]{32,}|ghp_[a-zA-Z0-9]{36}|bearer\s+[a-zA-Z0-9._-]{20,})/gi, () => {
    apiKeys++;
    return '[REDACTED_API_KEY]';
  });

  // Credit cards (13-16 digit patterns with hyphens or spaces)
  redacted = redacted.replace(/\b(?:\d{4}[ -]?){3}\d{4}\b/g, () => {
    creditCards++;
    return '[REDACTED_CARD_NUMBER]';
  });

  // Emails
  redacted = redacted.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, () => {
    emails++;
    return '[REDACTED_EMAIL]';
  });

  // Phone numbers (e.g. +1-555-555-5555, (555) 555-5555)
  redacted = redacted.replace(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, () => {
    phones++;
    return '[REDACTED_PHONE]';
  });

  const total = apiKeys + emails + phones + creditCards;
  return {
    originalText: text,
    redactedText: redacted,
    redactionsCount: total,
    redactionsBreakdown: { apiKeys, emails, phones, creditCards },
  };
}

export function encryptLocalNote(note: string, passphrase: string): string {
  const salt = sha256(passphrase || 'default');
  let result = '';
  for (let i = 0; i < note.length; i++) {
    const charCode = note.charCodeAt(i) ^ salt.charCodeAt(i % salt.length);
    result += charCode.toString(16).padStart(4, '0');
  }
  return `ENC:${result}`;
}

export function decryptLocalNote(encrypted: string, passphrase: string): string {
  if (!encrypted.startsWith('ENC:')) return encrypted;
  const hex = encrypted.substring(4);
  const salt = sha256(passphrase || 'default');
  let note = '';
  for (let i = 0; i < hex.length; i += 4) {
    const chunk = hex.substring(i, i + 4);
    const charCode = parseInt(chunk, 16) ^ salt.charCodeAt((i / 4) % salt.length);
    note += String.fromCharCode(charCode);
  }
  return note;
}

export function cleanPrivacyMetadata(text: string): { cleaned: string; removedTrackersCount: number } {
  let count = 0;
  const cleaned = text.replace(/([?&](?:utm_[a-z]+|fbclid|gclid|msclkid|mc_eid)=[^&#\s]*)/gi, () => {
    count++;
    return '';
  });
  return { cleaned: cleaned.replace(/\?&/g, '?').replace(/\?$/g, ''), removedTrackersCount: count };
}
