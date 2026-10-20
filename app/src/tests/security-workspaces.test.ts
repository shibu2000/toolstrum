import { CANONICAL_TOOLS } from '../data/registry';
import {
  SECURITY_TOOLS_CONFIG,
  getSecurityToolConfig,
} from '../features/tools/security/securityConfig';
import {
  buildWifiPayload,
  buildVCardPayload,
  buildEmailPayload,
  buildSmsPayload,
  buildPhonePayload,
  generateBarcodeBars,
  generateQrMatrix,
  parseQrPayload,
  analyzeUrlSafety,
  checkPasswordStrength,
  generateSecurePassword,
  generatePassphrase,
  generateTotpToken,
  generateTextHashes,
  redactSecrets,
  encryptLocalNote,
  decryptLocalNote,
  cleanPrivacyMetadata,
} from '../features/tools/security/shared/SecurityHelpers';

console.log('--- STARTING QR, BARCODE & SECURITY STUDIO TEST SUITE ---');

// 1. Audit Canonical Catalog Entries for Tools 351–375
console.log('1. Auditing Canonical Catalog Entries for Tools 351–375...');
const secTools = CANONICAL_TOOLS.filter((t) => t.id >= 351 && t.id <= 375);
if (secTools.length !== 25) {
  throw new Error(`Expected exactly 25 Security tools (351–375), found ${secTools.length}`);
}

for (let id = 351; id <= 375; id++) {
  const config = getSecurityToolConfig(id);
  if (!config) {
    throw new Error(`Missing security configuration for tool ID ${id}`);
  }
  if (config.id !== id || !config.title || !config.workspaceId) {
    throw new Error(`Invalid configuration for tool ID ${id}`);
  }
}
console.log('✔ All 25 Security tools are canonically registered and configured.');

// 2. Workspace Group Distribution
console.log('2. Verifying Workspace Group Distributions...');
const groups: Record<string, number> = {
  sec_qr_generator: 0,
  sec_qr_scanner: 0,
  sec_passwords_auth: 0,
  sec_crypto_privacy: 0,
};

for (let id = 351; id <= 375; id++) {
  const config = getSecurityToolConfig(id)!;
  groups[config.workspaceId]++;
}

if (groups.sec_qr_generator !== 12) {
  throw new Error(`Expected 12 QR generator tools, got ${groups.sec_qr_generator}`);
}
if (groups.sec_qr_scanner !== 4) {
  throw new Error(`Expected 4 QR scanner tools, got ${groups.sec_qr_scanner}`);
}
if (groups.sec_passwords_auth !== 4) {
  throw new Error(`Expected 4 passwords/auth tools, got ${groups.sec_passwords_auth}`);
}
if (groups.sec_crypto_privacy !== 5) {
  throw new Error(`Expected 5 crypto/privacy tools, got ${groups.sec_crypto_privacy}`);
}
console.log('✔ All 4 Security workspaces correctly partition the 25 tools.');

// 3. QR Code & Barcode Payload Tests
console.log('3. Testing QR Code & Barcode Payload Generation...');
const wifiStr = buildWifiPayload({ ssid: 'MyHomeWiFi', password: 'SecretPassword99', encryption: 'WPA' });
if (!wifiStr.includes('WIFI:S:MyHomeWiFi;') || !wifiStr.includes('P:SecretPassword99;')) {
  throw new Error(`Incorrect Wi-Fi payload: ${wifiStr}`);
}

const vcardStr = buildVCardPayload({ firstName: 'Ada', lastName: 'Lovelace', phone: '+15550192834', email: 'ada@computing.org' });
if (!vcardStr.includes('BEGIN:VCARD') || !vcardStr.includes('FN:Ada Lovelace') || !vcardStr.includes('END:VCARD')) {
  throw new Error(`Incorrect vCard payload: ${vcardStr}`);
}

const emailStr = buildEmailPayload('support@company.com', 'Subject Test', 'Body Text');
if (!emailStr.startsWith('mailto:support@company.com?')) {
  throw new Error(`Incorrect email payload: ${emailStr}`);
}

const smsStr = buildSmsPayload('+1 (555) 019-2834', 'Hello there');
if (!smsStr.startsWith('SMSTO:+15550192834:Hello there')) {
  throw new Error(`Incorrect SMS payload: ${smsStr}`);
}

const phoneStr = buildPhonePayload('+1 (555) 019-2834');
if (phoneStr !== 'tel:+15550192834') {
  throw new Error(`Incorrect phone payload: ${phoneStr}`);
}

const barcodeData = generateBarcodeBars('CODE128');
if (barcodeData.bars.length < 20 || !barcodeData.bars.every((b: number) => typeof b === 'number')) {
  throw new Error('Barcode pattern failed generation');
}

const qrMatrix = generateQrMatrix('Toolstrum QR Test Payload', 21);
if (qrMatrix.length !== 21 || qrMatrix[0].length !== 21) {
  throw new Error('QR Matrix dimensions mismatch');
}
console.log('✔ QR & Barcode generation algorithms pass all checks.');

// 4. QR Parsing & URL Safety Tests
console.log('4. Testing QR Parsing & URL Safety Inspector...');
const parsedWifi = parseQrPayload('WIFI:S:OfficeNetwork;T:WPA;P:CorpKey2026;;');
if (parsedWifi.type !== 'wifi' || parsedWifi.fields.SSID !== 'OfficeNetwork') {
  throw new Error(`Failed to parse Wi-Fi QR payload: ${JSON.stringify(parsedWifi)}`);
}

const parsedVCard = parseQrPayload('BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+15550100\nEND:VCARD');
if (parsedVCard.type !== 'vcard' || parsedVCard.fields.Name !== 'John Doe') {
  throw new Error(`Failed to parse vCard QR payload: ${JSON.stringify(parsedVCard)}`);
}

const safeUrlReport = analyzeUrlSafety('https://toolstrum.app/offline-docs');
if (safeUrlReport.status !== 'Safe' || safeUrlReport.riskScore > 20) {
  throw new Error(`Expected safe status for official URL, got ${safeUrlReport.status}`);
}

const suspiciousUrlReport = analyzeUrlSafety('http://192.168.1.1/login.php?utm_source=spam&fbclid=x123');
if (suspiciousUrlReport.status === 'Safe' || !suspiciousUrlReport.hasTrackingParams) {
  throw new Error('Expected suspicious rating for HTTP IP address with tracking params');
}
console.log('✔ QR Parser and URL Safety inspector functioning properly.');

// 5. Password & Authentication Tests
console.log('5. Testing Passwords & TOTP Engine...');
const weakReport = checkPasswordStrength('123456');
if (weakReport.score > 1 || weakReport.label !== 'Very Weak') {
  throw new Error('Weak password was not classified as Very Weak');
}

const strongReport = checkPasswordStrength('K#9$mPx2@Lq0!vZa');
if (strongReport.score < 3 || strongReport.entropyBits < 60) {
  throw new Error(`Strong password entropy below expected threshold: ${strongReport.entropyBits}`);
}

const randPwd = generateSecurePassword({ length: 20, avoidAmbiguous: true });
if (randPwd.length !== 20 || /[01IOlo]/.test(randPwd)) {
  throw new Error(`Random password failed ambiguous filter: ${randPwd}`);
}

const passphrase = generatePassphrase(4, '-', true);
const words = passphrase.split('-');
if (words.length !== 4) {
  throw new Error(`Passphrase word count mismatch: ${passphrase}`);
}

const totp = generateTotpToken('JBSWY3DPEHPK3PXP');
if (!/^\d{6}$/.test(totp.code) || totp.secondsRemaining <= 0 || totp.secondsRemaining > 30) {
  throw new Error(`Invalid TOTP token generation: ${JSON.stringify(totp)}`);
}
console.log('✔ Password & TOTP engines validated.');

// 6. Cryptography, Privacy & Redaction Tests
console.log('6. Testing Cryptography, Privacy & Redaction...');
const hashes = generateTextHashes('Toolstrum Offline First');
if (!hashes.sha256 || !hashes.sha1 || !hashes.md5) {
  throw new Error('Hash generation returned empty digests');
}

const redactText = 'User Alice: email alice@company.com, phone +1-555-019-2834, token sk-abcdefghijklmnopqrstuvwxyz123456.';
const redactRes = redactSecrets(redactText);
if (redactRes.redactionsCount < 3) {
  throw new Error(`Expected at least 3 redactions, got ${redactRes.redactionsCount}`);
}
if (redactRes.redactedText.includes('alice@company.com') || redactRes.redactedText.includes('sk-abcdefghijklmnop')) {
  throw new Error(`Sensitive data was not redacted: ${redactRes.redactedText}`);
}

const notePlain = 'Confidential Vault Seed Phrase: ocean river mountain canyon';
const enc = encryptLocalNote(notePlain, 'Passphrase2026!');
if (!enc.startsWith('ENC:') || enc === notePlain) {
  throw new Error(`Note encryption failed: ${enc}`);
}
const dec = decryptLocalNote(enc, 'Passphrase2026!');
if (dec !== notePlain) {
  throw new Error(`Note decryption failed. Expected "${notePlain}", got "${dec}"`);
}

const trackerUrl = 'https://site.com/page?product=12&utm_source=twitter&fbclid=abc1234';
const cleaned = cleanPrivacyMetadata(trackerUrl);
if (cleaned.removedTrackersCount !== 2 || cleaned.cleaned.includes('utm_source') || cleaned.cleaned.includes('fbclid')) {
  throw new Error(`Privacy tracker removal failed: ${JSON.stringify(cleaned)}`);
}
console.log('✔ Cryptography, Privacy and Redaction engines validated.');

console.log('--- ALL QR, BARCODE & SECURITY STUDIO TESTS PASSED (100%) ---');
