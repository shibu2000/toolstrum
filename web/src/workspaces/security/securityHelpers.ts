// ============================================================================
// Toolstrum — QR, Barcode & Security Studio Pure Helper Engine
// 100% Client-Side • Zero-Server • Web Crypto API • RFC Compliant
// ============================================================================

// ---------------------------------------------------------------------------
// 1. QR Payload Builders & Parser
// ---------------------------------------------------------------------------

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
      summary: `${name}${orgMatch ? ` · ${orgMatch[1].trim()}` : ''}`,
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

  // Plain Text
  return {
    type: 'text',
    displayTitle: 'Plain Text Payload',
    summary: trimmed.length > 60 ? `${trimmed.substring(0, 60)}...` : trimmed,
    fields: { Text: trimmed },
    raw,
  };
}

// ---------------------------------------------------------------------------
// 2. 1D Barcode Generators (Code 128, EAN-13, UPC-A, Code 39)
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

export function generateCode128Svg(
  text: string,
  height = 80,
  showText = true,
  barColor = '#0f172a',
  bgColor = '#ffffff'
): string {
  if (!text) return '';
  const startCode = 104; // Subset B
  const stopCode = 106;
  const codes: number[] = [startCode];

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i);
    if (charCode >= 32 && charCode <= 126) {
      codes.push(charCode - 32);
    }
  }

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

  let currentX = 20;
  const barElements: string[] = [];
  let isBar = true;

  for (let i = 0; i < patternStr.length; i++) {
    const width = parseInt(patternStr[i], 10);
    if (isBar) {
      barElements.push(`<rect x="${currentX}" y="10" width="${width * 2}" height="${height}" fill="${barColor}" />`);
    }
    currentX += width * 2;
    isBar = !isBar;
  }

  const totalWidth = currentX + 20;
  const totalHeight = height + (showText ? 35 : 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
    <rect width="100%" height="100%" fill="${bgColor}" />
    ${barElements.join('')}
    ${showText ? `<text x="${totalWidth / 2}" y="${height + 28}" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="${barColor}">${text}</text>` : ''}
  </svg>`;
}

// EAN-13 Digits & Structure
const EAN_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011'];
const EAN_G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111'];
const EAN_R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100'];
const EAN_PARITY = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL'
];

export function computeEan13CheckDigit(twelveDigits: string): number {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(twelveDigits[i] || '0', 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateEan13Svg(
  inputDigits: string,
  height = 80,
  showText = true,
  barColor = '#0f172a',
  bgColor = '#ffffff'
): string {
  const digitsOnly = inputDigits.replace(/\D/g, '').slice(0, 13);
  const base12 = digitsOnly.padEnd(12, '0').slice(0, 12);
  const checkDigit = computeEan13CheckDigit(base12);
  const full13 = base12 + checkDigit.toString();

  const firstDigit = parseInt(full13[0], 10);
  const leftDigits = full13.slice(1, 7);
  const rightDigits = full13.slice(7, 13);
  const parityMode = EAN_PARITY[firstDigit];

  let bitPattern = '101'; // Left guard
  for (let i = 0; i < 6; i++) {
    const d = parseInt(leftDigits[i], 10);
    const pattern = parityMode[i] === 'L' ? EAN_L[d] : EAN_G[d];
    bitPattern += pattern;
  }
  bitPattern += '01010'; // Center guard
  for (let i = 0; i < 6; i++) {
    const d = parseInt(rightDigits[i], 10);
    bitPattern += EAN_R[d];
  }
  bitPattern += '101'; // Right guard

  let currentX = 20;
  const barElements: string[] = [];
  const barWidth = 2;

  for (let i = 0; i < bitPattern.length; i++) {
    if (bitPattern[i] === '1') {
      const isGuard = i < 3 || (i >= 45 && i < 50) || i >= 92;
      const barH = isGuard ? height + 6 : height;
      barElements.push(`<rect x="${currentX}" y="10" width="${barWidth}" height="${barH}" fill="${barColor}" />`);
    }
    currentX += barWidth;
  }

  const totalWidth = currentX + 20;
  const totalHeight = height + (showText ? 35 : 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
    <rect width="100%" height="100%" fill="${bgColor}" />
    ${barElements.join('')}
    ${showText ? `<text x="${totalWidth / 2}" y="${height + 28}" text-anchor="middle" font-family="monospace" font-size="12" font-weight="bold" fill="${barColor}">${full13[0]}  ${full13.slice(1, 7)}  ${full13.slice(7)}</text>` : ''}
  </svg>`;
}

// Code 39 Patterns
const CODE39_PATTERNS: Record<string, string> = {
  '0': 'bwbwbwBwb', '1': 'BwbwbwbwB', '2': 'bwBwbwbwB', '3': 'BwBwbwbwb', '4': 'bwbwBwbwB',
  '5': 'BwbwBwbwb', '6': 'bwBwBwbwb', '7': 'bwbwbwBwB', '8': 'BwbwbwBwb', '9': 'bwBwbwBwb',
  'A': 'BwbwbwbWB', 'B': 'bwBwbwbWB', 'C': 'BwBwbwbWb', 'D': 'bwbwBwbWB', 'E': 'BwbwBwbWb',
  'F': 'bwBwBwbWb', 'G': 'bwbwbwBWB', 'H': 'BwbwbwBWb', 'I': 'bwBwbwBWb', 'J': 'bwbwBwBWb',
  'K': 'BwbwbwbwB', 'L': 'bwBwbwbwB', 'M': 'BwBwbwbwb', 'N': 'bwbwBwbwB', 'O': 'BwbwBwbwb',
  'P': 'bwBwBwbwb', 'Q': 'bwbwbwBwB', 'R': 'BwbwbwBwb', 'S': 'bwBwbwBwb', 'T': 'bwbwBwBwb',
  'U': 'BWbwbwbwb', 'V': 'bWBwbwbwb', 'W': 'BWBwbwbwb', 'X': 'bWbwBwbwb', 'Y': 'BWbwBwbwb',
  'Z': 'bWBwBwbwb', '-': 'bWbwbwBwb', '.': 'BWbwbwBwb', ' ': 'bWBwbwBwb', '$': 'bWbWbWbwb',
  '/': 'bWbWbwbWb', '+': 'bWbwbWbWb', '%': 'bwbWbWbWb', '*': 'bWbwBwBwb'
};

export function generateCode39Svg(
  rawText: string,
  height = 80,
  showText = true,
  barColor = '#0f172a',
  bgColor = '#ffffff'
): string {
  const clean = rawText.toUpperCase().replace(/[^0-9A-Z-. $/+%]/g, '') || 'CODE39';
  const full = `*${clean}*`;
  let currentX = 20;
  const barElements: string[] = [];

  for (let i = 0; i < full.length; i++) {
    const char = full[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS['*'];

    for (let p = 0; p < pattern.length; p++) {
      const isBar = p % 2 === 0;
      const isWide = pattern[p] === 'B' || pattern[p] === 'W';
      const width = isWide ? 4 : 2;

      if (isBar) {
        barElements.push(`<rect x="${currentX}" y="10" width="${width}" height="${height}" fill="${barColor}" />`);
      }
      currentX += width;
    }
    // Inter-character space
    currentX += 2;
  }

  const totalWidth = currentX + 20;
  const totalHeight = height + (showText ? 35 : 20);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" width="${totalWidth}" height="${totalHeight}">
    <rect width="100%" height="100%" fill="${bgColor}" />
    ${barElements.join('')}
    ${showText ? `<text x="${totalWidth / 2}" y="${height + 28}" text-anchor="middle" font-family="monospace" font-size="13" font-weight="bold" fill="${barColor}">${clean}</text>` : ''}
  </svg>`;
}

// ---------------------------------------------------------------------------
// 3. URL Safety Inspector & Privacy Tracker Stripper
// ---------------------------------------------------------------------------

export interface UrlSafetyReport {
  url: string;
  domain: string;
  protocol: string;
  isHttps: boolean;
  hasSuspiciousTld: boolean;
  hasIpHost: boolean;
  hasTrackingParams: boolean;
  hasAuthCreds: boolean;
  isShortener: boolean;
  riskScore: number; // 0 to 100
  status: 'Safe' | 'Suspicious' | 'High Risk';
  trackingParamsFound: string[];
  findings: { severity: 'danger' | 'warning' | 'info'; text: string }[];
}

export function analyzeUrlSafety(rawUrl: string): UrlSafetyReport {
  const urlStr = rawUrl.trim();
  let parsed: URL;

  try {
    parsed = new URL(urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : `https://${urlStr}`);
  } catch {
    return {
      url: urlStr,
      domain: 'Invalid',
      protocol: 'None',
      isHttps: false,
      hasSuspiciousTld: false,
      hasIpHost: false,
      hasTrackingParams: false,
      hasAuthCreds: false,
      isShortener: false,
      riskScore: 90,
      status: 'High Risk',
      trackingParamsFound: [],
      findings: [{ severity: 'danger', text: 'Malformed or invalid URL string syntax.' }],
    };
  }

  const findings: { severity: 'danger' | 'warning' | 'info'; text: string }[] = [];
  let score = 0;

  const isHttps = parsed.protocol === 'https:';
  if (!isHttps) {
    score += 30;
    findings.push({ severity: 'danger', text: 'Insecure protocol: HTTP transmits data unencrypted without TLS.' });
  }

  // IP host
  const hasIpHost = /^(\d{1,3}\.){3}\d{1,3}$/.test(parsed.hostname);
  if (hasIpHost) {
    score += 40;
    findings.push({ severity: 'danger', text: 'Raw numeric IP address host used instead of registered domain.' });
  }

  // Auth credentials spoofing
  const hasAuthCreds = Boolean(parsed.username || parsed.password);
  if (hasAuthCreds) {
    score += 45;
    findings.push({ severity: 'danger', text: 'Embedded credentials (@ symbol) detected — common phishing spoof vector.' });
  }

  // Suspicious TLDs
  const suspiciousTlds = ['.zip', '.mov', '.top', '.xyz', '.click', '.buzz', '.loan', '.work', '.gq', '.cf', '.cc'];
  const hasSuspiciousTld = suspiciousTlds.some((tld) => parsed.hostname.toLowerCase().endsWith(tld));
  if (hasSuspiciousTld) {
    score += 25;
    findings.push({ severity: 'warning', text: 'Domain utilizes a high-abuse or commonly spoofed TLD extension.' });
  }

  // Excessive subdomains
  const subdomains = parsed.hostname.split('.');
  if (subdomains.length > 4) {
    score += 15;
    findings.push({ severity: 'warning', text: 'Excessive subdomains detected (often used to obscure true domain).' });
  }

  // URL Shorteners
  const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd', 'ow.ly', 'buff.ly', 'cutt.ly'];
  const isShortener = shorteners.includes(parsed.hostname.toLowerCase());
  if (isShortener) {
    score += 10;
    findings.push({ severity: 'info', text: 'URL Shortener detected: destination is obscured.' });
  }

  // Punycode / Homograph attack
  if (parsed.hostname.startsWith('xn--')) {
    score += 35;
    findings.push({ severity: 'danger', text: 'Internationalized domain name (Punycode xn--) detected: risk of lookalike spoofing.' });
  }

  // Tracking query parameters
  const trackingKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid', 'msclkid', 'mc_eid', 'igshid', '_ga'];
  const trackingFound = trackingKeys.filter((k) => parsed.searchParams.has(k));
  if (trackingFound.length > 0) {
    score += 5;
    findings.push({ severity: 'info', text: `Contains ${trackingFound.length} tracking telemetry parameters (${trackingFound.join(', ')}).` });
  }

  const finalScore = Math.min(100, score);
  let status: UrlSafetyReport['status'] = 'Safe';
  if (finalScore >= 55) status = 'High Risk';
  else if (finalScore >= 20) status = 'Suspicious';

  if (findings.length === 0) {
    findings.push({ severity: 'info', text: 'Standard HTTPS URL with no suspicious indicators detected.' });
  }

  return {
    url: parsed.href,
    domain: parsed.hostname,
    protocol: parsed.protocol.replace(':', ''),
    isHttps,
    hasSuspiciousTld,
    hasIpHost,
    hasTrackingParams: trackingFound.length > 0,
    hasAuthCreds,
    isShortener,
    riskScore: finalScore,
    status,
    trackingParamsFound: trackingFound,
    findings,
  };
}

export function cleanPrivacyMetadata(text: string): { cleaned: string; removedTrackersCount: number } {
  let count = 0;
  const cleaned = text.replace(/([?&](?:utm_[a-z]+|fbclid|gclid|msclkid|mc_eid|igshid|_ga)=[^&#\s]*)/gi, () => {
    count++;
    return '';
  });
  return {
    cleaned: cleaned.replace(/\?&/g, '?').replace(/\?$/g, ''),
    removedTrackersCount: count,
  };
}

// ---------------------------------------------------------------------------
// 4. Password Strength, Entropy & Generators
// ---------------------------------------------------------------------------

export interface PasswordStrengthReport {
  score: number; // 0 to 100
  label: 'Very Weak' | 'Weak' | 'Medium' | 'Strong' | 'Very Strong';
  color: string;
  entropy: number;
  crackTimeEstimate: string;
  checks: { name: string; pass: boolean }[];
  feedback: string[];
}

export function analyzePassword(pwd: string): PasswordStrengthReport {
  if (!pwd) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'text-rose-500',
      entropy: 0,
      crackTimeEstimate: 'Instant',
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
    { name: 'At least 8 characters (12+ recommended)', pass: isLong },
    { name: 'Contains uppercase letter (A-Z)', pass: hasUpper },
    { name: 'Contains lowercase letter (a-z)', pass: hasLower },
    { name: 'Contains numeric digit (0-9)', pass: hasDigit },
    { name: 'Contains special symbol (!@#$%^&*)', pass: hasSymbol },
  ];

  let rawScore = 0;
  if (isLong) rawScore += 20;
  if (isExtraLong) rawScore += 20;
  if (hasLower) rawScore += 15;
  if (hasUpper) rawScore += 15;
  if (hasDigit) rawScore += 15;
  if (hasSymbol) rawScore += 15;

  if (/(.)\1{2,}/.test(pwd)) rawScore -= 15;
  if (/^[a-zA-Z]+$/.test(pwd) || /^[0-9]+$/.test(pwd)) rawScore -= 20;

  const score = Math.max(5, Math.min(100, rawScore));

  let label: PasswordStrengthReport['label'] = 'Weak';
  let color = 'text-rose-500';
  let crackTimeEstimate = 'Instant';

  if (entropy < 28) {
    label = 'Very Weak';
    color = 'text-rose-500';
    crackTimeEstimate = 'Instant (under 1 ms)';
  } else if (entropy < 45) {
    label = 'Weak';
    color = 'text-orange-500';
    crackTimeEstimate = 'A few seconds to hours';
  } else if (entropy < 65) {
    label = 'Medium';
    color = 'text-amber-500';
    crackTimeEstimate = 'Several months to years';
  } else if (entropy < 85) {
    label = 'Strong';
    color = 'text-emerald-500';
    crackTimeEstimate = 'Decades to centuries';
  } else {
    label = 'Very Strong';
    color = 'text-teal-500';
    crackTimeEstimate = 'Millions of years+';
  }

  const feedback: string[] = [];
  if (!isLong) feedback.push('Password should be at least 12 characters to protect against dictionary attacks.');
  if (!hasSymbol) feedback.push('Add special symbols (!@#$%^&*) to dramatically expand the search space.');
  if (!hasDigit) feedback.push('Include numbers to defeat alphabetic pattern brute-forcing.');
  if (score >= 80) feedback.push('Excellent entropy! Highly resistant to offline rainbow table attacks.');

  return { score, label, color, entropy, crackTimeEstimate, checks, feedback };
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
  const len = Math.max(6, Math.min(128, opts.length ?? 16));
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
  if (!charset) charset = lowerChars + numChars;

  const randomValues = new Uint32Array(len);
  crypto.getRandomValues(randomValues);

  let res = '';
  for (let i = 0; i < len; i++) {
    res += charset[randomValues[i] % charset.length];
  }
  return res;
}

const MEMORABLE_WORDS = [
  'alpha', 'anchor', 'beacon', 'breeze', 'bridge', 'cabin', 'canyon', 'cascade',
  'castle', 'cedar', 'cherry', 'circuit', 'cliff', 'clover', 'comet', 'coral',
  'cosmic', 'crater', 'crystal', 'delta', 'desert', 'dolphin', 'dragon', 'drift',
  'eagle', 'echo', 'ember', 'falcon', 'feather', 'forest', 'fossil', 'galaxy',
  'glacier', 'granite', 'harbor', 'haven', 'horizon', 'island', 'jasper', 'journey',
  'jungle', 'lagoon', 'lantern', 'legacy', 'meadow', 'meteor', 'miracle', 'monarch',
  'mountain', 'nebula', 'oasis', 'ocean', 'orbit', 'orchid', 'pebble', 'phoenix',
  'pinnacle', 'pioneer', 'planet', 'prairie', 'prism', 'quantum', 'quartz', 'radiant',
  'rainbow', 'ravine', 'ridge', 'ripple', 'river', 'rocket', 'saddle', 'safari',
  'sandstone', 'sapphire', 'sequoia', 'shadow', 'shelter', 'silver', 'solace', 'solar',
  'solstice', 'spark', 'summit', 'sunburst', 'tapestry', 'temple', 'thunder', 'timber',
  'topaz', 'torrent', 'tundra', 'valley', 'vector', 'velvet', 'vessel', 'vintage',
  'volcano', 'voyage', 'waterfall', 'whisper', 'willow', 'zenith', 'zephyr'
];

export function generatePassphrase(
  numWords = 4,
  separator = '-',
  capitalize = true,
  addNumber = true
): string {
  const count = Math.max(3, Math.min(10, numWords));
  const chosen: string[] = [];

  const randomValues = new Uint32Array(count);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < count; i++) {
    const word = MEMORABLE_WORDS[randomValues[i] % MEMORABLE_WORDS.length];
    chosen.push(capitalize ? word.charAt(0).toUpperCase() + word.slice(1) : word);
  }

  let res = chosen.join(separator);
  if (addNumber) {
    const randNum = (randomValues[0] % 900) + 100;
    res += `${separator}${randNum}`;
  }
  return res;
}

// ---------------------------------------------------------------------------
// 5. Secret & PII Redactor
// ---------------------------------------------------------------------------

export interface RedactionResult {
  redacted: string;
  foundCount: number;
  breakdown: Record<string, number>;
  types: string[];
}

export function redactSecrets(text: string): RedactionResult {
  let count = 0;
  const breakdown: Record<string, number> = {};
  const typesFound = new Set<string>();

  const patterns = [
    { type: 'AWS Access Key', regex: /\bAKIA[0-9A-Z]{16}\b/g },
    { type: 'OpenAI API Key', regex: /\bsk-[A-Za-z0-9]{32,}\b/g },
    { type: 'GitHub Token', regex: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g },
    { type: 'Stripe Secret Key', regex: /\b(?:sk_live|rk_live)_[0-9a-zA-Z]{24,}\b/g },
    { type: 'Slack Token', regex: /\bxox[baprs]-[0-9a-zA-Z-]{10,}\b/g },
    { type: 'JWT Token', regex: /\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+/g },
    { type: 'Private Key Block', regex: /-----BEGIN [A-Z ]+PRIVATE KEY-----[\s\S]+?-----END [A-Z ]+PRIVATE KEY-----/g },
    { type: 'Credit Card Number', regex: /\b(?:\d{4}[ -]?){3}\d{4}\b/g },
    { type: 'Email Address', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
    { type: 'Phone Number', regex: /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g },
  ];

  let result = text;
  for (const p of patterns) {
    result = result.replace(p.regex, () => {
      count++;
      typesFound.add(p.type);
      breakdown[p.type] = (breakdown[p.type] || 0) + 1;
      return `[REDACTED_${p.type.toUpperCase().replace(/\s+/g, '_')}]`;
    });
  }

  return {
    redacted: result,
    foundCount: count,
    breakdown,
    types: Array.from(typesFound),
  };
}

// ---------------------------------------------------------------------------
// 6. Client-Side AES-GCM Encrypted Notes (Web Crypto API)
// ---------------------------------------------------------------------------

export async function encryptAesGcm(plainText: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    enc.encode(plainText)
  );

  const toHex = (buf: Uint8Array) => Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('');

  return JSON.stringify({
    v: 1,
    cipher: 'AES-GCM-256',
    salt: toHex(salt),
    iv: toHex(iv),
    data: toHex(new Uint8Array(ciphertext)),
  });
}

export async function decryptAesGcm(vaultJson: string, passphrase: string): Promise<string> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  const parsed = JSON.parse(vaultJson);

  const fromHex = (hex: string) => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
  };

  const salt = fromHex(parsed.salt);
  const iv = fromHex(parsed.iv);
  const ciphertext = fromHex(parsed.data);

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    aesKey,
    ciphertext
  );

  return dec.decode(decrypted);
}

// ---------------------------------------------------------------------------
// 7. Cryptographic Hashes (MD5, CRC32, Web Crypto Digests, HMAC)
// ---------------------------------------------------------------------------

// Standard pure JS MD5 implementation (RFC 1321)
export function md5(string: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];

    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035541);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);

    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);

    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);

    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);

    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  const n = string.length;
  const state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  for (i = 64; i <= string.length; i += 64) {
    md5cycle(state, md5blk(string.substring(i - 64, i)));
  }
  let s = string.substring(i - 64);
  const tail = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (let j = 0; j < s.length; j++) {
    tail[j >> 2] |= s.charCodeAt(j) << ((j % 4) << 3);
  }
  tail[s.length >> 2] |= 0x80 << ((s.length % 4) << 3);
  if (s.length > 55) {
    md5cycle(state, tail);
    for (let j = 0; j < 16; j++) tail[j] = 0;
  }
  tail[14] = n * 8;
  md5cycle(state, tail);

  function md5blk(str: string) {
    const blk: number[] = [];
    for (let j = 0; j < 64; j += 4) {
      blk[j >> 2] = str.charCodeAt(j) +
        (str.charCodeAt(j + 1) << 8) +
        (str.charCodeAt(j + 2) << 16) +
        (str.charCodeAt(j + 3) << 24);
    }
    return blk;
  }

  function rhex(n: number) {
    let s = '', j = 0;
    for (; j <= 3; j++) {
      s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
    }
    return s;
  }

  return (rhex(state[0]) + rhex(state[1]) + rhex(state[2]) + rhex(state[3])).toLowerCase();
}

// Standard CRC32 Implementation (IEEE 802.3)
export function crc32(input: string | Uint8Array): string {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  let crc = 0 ^ -1;
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xff];
  }
  return ((crc ^ -1) >>> 0).toString(16).padStart(8, '0').toLowerCase();
}

export async function computeWebCryptoHash(
  buffer: ArrayBuffer | Uint8Array,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> {
  const hashBuf = await crypto.subtle.digest(algorithm, buffer as unknown as BufferSource);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function computeHmacSha256(keyStr: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(keyStr),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------------------------------------------------------------------------
// 8. RFC 6238 TOTP Engine
// ---------------------------------------------------------------------------

function base32ToBytes(base32: string): Uint8Array {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/[\s-]/g, '');
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
