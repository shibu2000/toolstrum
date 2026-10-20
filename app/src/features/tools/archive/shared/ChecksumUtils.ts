/**
 * ChecksumUtils.ts
 * Pure JavaScript cryptographic hashing utilities for local, offline file integrity.
 * Supports SHA-256, SHA-1, MD5, and CRC-32 without any native dependencies.
 */

// Helper to convert UTF-8 string or Uint8Array into Uint8Array
export function toUint8Array(input: string | Uint8Array): Uint8Array {
  if (typeof input !== 'string') {
    return input;
  }
  // Standard UTF-8 encode
  const utf8: number[] = [];
  for (let i = 0; i < input.length; i++) {
    let charcode = input.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(
        0xe0 | (charcode >> 12),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    } else {
      // surrogate pair
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (input.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
}

// Convert bytes to hex string
export function bytesToHex(bytes: Uint8Array | number[]): string {
  const hex: string[] = [];
  for (let i = 0; i < bytes.length; i++) {
    const current = bytes[i] < 0 ? bytes[i] + 256 : bytes[i];
    hex.push((current >>> 4).toString(16));
    hex.push((current & 0xf).toString(16));
  }
  return hex.join('');
}

// Base64 to Uint8Array helper
export function base64ToUint8Array(base64: string): Uint8Array {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const cleanBase64 = base64.replace(/[^A-Za-z0-9+/]/g, '');
  const len = cleanBase64.length;
  const bytes: number[] = [];

  for (let i = 0; i < len; i += 4) {
    const enc1 = chars.indexOf(cleanBase64.charAt(i));
    const enc2 = chars.indexOf(cleanBase64.charAt(i + 1));
    const enc3 = chars.indexOf(cleanBase64.charAt(i + 2));
    const enc4 = chars.indexOf(cleanBase64.charAt(i + 3));

    const chr1 = (enc1 << 2) | (enc2 >> 4);
    const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    const chr3 = ((enc3 & 3) << 6) | enc4;

    bytes.push(chr1);
    if (enc3 !== -1 && cleanBase64.charAt(i + 2) !== '=') bytes.push(chr2);
    if (enc4 !== -1 && cleanBase64.charAt(i + 3) !== '=') bytes.push(chr3);
  }
  return new Uint8Array(bytes);
}

// Uint8Array to Base64 helper
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let base64 = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b1 = bytes[i];
    const b2 = i + 1 < len ? bytes[i + 1] : 0;
    const b3 = i + 2 < len ? bytes[i + 2] : 0;

    const enc1 = b1 >> 2;
    const enc2 = ((b1 & 3) << 4) | (b2 >> 4);
    let enc3 = ((b2 & 15) << 2) | (b3 >> 6);
    let enc4 = b3 & 63;

    if (i + 1 >= len) {
      enc3 = 64;
      enc4 = 64;
    } else if (i + 2 >= len) {
      enc4 = 64;
    }

    base64 += chars.charAt(enc1) + chars.charAt(enc2);
    base64 += enc3 === 64 ? '=' : chars.charAt(enc3);
    base64 += enc4 === 64 ? '=' : chars.charAt(enc4);
  }
  return base64;
}

// ==========================================
// CRC-32 Implementation
// ==========================================
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC32_TABLE[i] = c;
}

export function crc32(input: string | Uint8Array): number {
  const bytes = toUint8Array(input);
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function crc32Hex(input: string | Uint8Array): string {
  const val = crc32(input);
  return val.toString(16).padStart(8, '0');
}

// ==========================================
// SHA-256 Implementation (FIPS 180-4 standard)
// ==========================================
function rightRotate(value: number, amount: number): number {
  return (value >>> amount) | (value << (32 - amount));
}

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

export function sha256(input: string | Uint8Array): string {
  const bytes = toUint8Array(input);
  const bitLength = bytes.length * 8;

  // Pre-processing (Padding)
  const remainder = bytes.length % 64;
  const paddingLength = remainder < 56 ? 56 - remainder : 120 - remainder;
  const padded = new Uint8Array(bytes.length + paddingLength + 8);
  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;

  // Append length in bits as 64-bit big-endian integer
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLength >>> 0, false);
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000), false);

  // Initialize hash values
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  // Process chunks of 64 bytes
  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(w[t - 15], 7) ^ rightRotate(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rightRotate(w[t - 2], 17) ^ rightRotate(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[t] + w[t]) >>> 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);

  return bytesToHex(out);
}

// ==========================================
// SHA-1 Implementation (RFC 3174)
// ==========================================
export function sha1(input: string | Uint8Array): string {
  const bytes = toUint8Array(input);
  const bitLength = bytes.length * 8;

  const remainder = bytes.length % 64;
  const paddingLength = remainder < 56 ? 56 - remainder : 120 - remainder;
  const padded = new Uint8Array(bytes.length + paddingLength + 8);
  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 4, bitLength >>> 0, false);
  view.setUint32(padded.length - 8, Math.floor(bitLength / 0x100000000), false);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;

  const w = new Uint32Array(80);

  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 80; t++) {
      const val = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16];
      w[t] = (val << 1) | (val >>> 31);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;

    for (let t = 0; t < 80; t++) {
      let f = 0;
      let k = 0;
      if (t < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (t < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (t < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }

      const temp = (((a << 5) | (a >>> 27)) + f + e + k + w[t]) >>> 0;
      e = d;
      d = c;
      c = ((b << 30) | (b >>> 2)) >>> 0;
      b = a;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const out = new Uint8Array(20);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);

  return bytesToHex(out);
}

// ==========================================
// MD5 Implementation (RFC 1321)
// ==========================================
function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
  const sum = (a + q + x + t) >>> 0;
  return (((sum << s) | (sum >>> (32 - s))) + b) >>> 0;
}
function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn((b & c) | (~b & d), a, b, x, s, t);
}
function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn((b & d) | (c & ~d), a, b, x, s, t);
}
function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
  return md5cmn(c ^ (b | ~d), a, b, x, s, t);
}

export function md5(input: string | Uint8Array): string {
  const bytes = toUint8Array(input);
  const bitLength = bytes.length * 8;

  const remainder = bytes.length % 64;
  const paddingLength = remainder < 56 ? 56 - remainder : 120 - remainder;
  const padded = new Uint8Array(bytes.length + paddingLength + 8);
  padded.set(bytes, 0);
  padded[bytes.length] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLength >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(bitLength / 0x100000000), true);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < padded.length; i += 64) {
    const x: number[] = [];
    for (let j = 0; j < 16; j++) {
      x[j] = view.getUint32(i + j * 4, true);
    }

    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    // Round 1
    a = md5ff(a, b, c, d, x[0], 7, 0xd76aa478);
    d = md5ff(d, a, b, c, x[1], 12, 0xe8c7b756);
    c = md5ff(c, d, a, b, x[2], 17, 0x242070db);
    b = md5ff(b, c, d, a, x[3], 22, 0xc1bdceee);
    a = md5ff(a, b, c, d, x[4], 7, 0xf57c0faf);
    d = md5ff(d, a, b, c, x[5], 12, 0x4787c62a);
    c = md5ff(c, d, a, b, x[6], 17, 0xa8304613);
    b = md5ff(b, c, d, a, x[7], 22, 0xfd469501);
    a = md5ff(a, b, c, d, x[8], 7, 0x698098d8);
    d = md5ff(d, a, b, c, x[9], 12, 0x8b44f7af);
    c = md5ff(c, d, a, b, x[10], 17, 0xffff5bb1);
    b = md5ff(b, c, d, a, x[11], 22, 0x895cd7be);
    a = md5ff(a, b, c, d, x[12], 7, 0x6b901122);
    d = md5ff(d, a, b, c, x[13], 12, 0xfd987193);
    c = md5ff(c, d, a, b, x[14], 17, 0xa679438e);
    b = md5ff(b, c, d, a, x[15], 22, 0x49b40821);

    // Round 2
    a = md5gg(a, b, c, d, x[1], 5, 0xf61e2562);
    d = md5gg(d, a, b, c, x[6], 9, 0xc040b340);
    c = md5gg(c, d, a, b, x[11], 14, 0x265e5a51);
    b = md5gg(b, c, d, a, x[0], 20, 0xe9b6c7aa);
    a = md5gg(a, b, c, d, x[5], 5, 0xd62f105d);
    d = md5gg(d, a, b, c, x[10], 9, 0x02441453);
    c = md5gg(c, d, a, b, x[15], 14, 0xd8a1e681);
    b = md5gg(b, c, d, a, x[4], 20, 0xe7d3fbc8);
    a = md5gg(a, b, c, d, x[9], 5, 0x21e1cde6);
    d = md5gg(d, a, b, c, x[14], 9, 0xc33707d6);
    c = md5gg(c, d, a, b, x[3], 14, 0xf4d50d87);
    b = md5gg(b, c, d, a, x[8], 20, 0x455a14ed);
    a = md5gg(a, b, c, d, x[13], 5, 0xa9e3e905);
    d = md5gg(d, a, b, c, x[2], 9, 0xfcefa3f8);
    c = md5gg(c, d, a, b, x[7], 14, 0x676f02d9);
    b = md5gg(b, c, d, a, x[12], 20, 0x8d2a4c8a);

    // Round 3
    a = md5hh(a, b, c, d, x[5], 4, 0xfffa3942);
    d = md5hh(d, a, b, c, x[8], 11, 0x8771f681);
    c = md5hh(c, d, a, b, x[11], 16, 0x6d9d6122);
    b = md5hh(b, c, d, a, x[14], 23, 0xfde5380c);
    a = md5hh(a, b, c, d, x[1], 4, 0xa4beea44);
    d = md5hh(d, a, b, c, x[4], 11, 0x4bdecfa9);
    c = md5hh(c, d, a, b, x[7], 16, 0xf6bb4b60);
    b = md5hh(b, c, d, a, x[10], 23, 0xbebfbc70);
    a = md5hh(a, b, c, d, x[13], 4, 0x289b7ec6);
    d = md5hh(d, a, b, c, x[0], 11, 0xeaa127fa);
    c = md5hh(c, d, a, b, x[3], 16, 0xd4ef3085);
    b = md5hh(b, c, d, a, x[6], 23, 0x04881d05);
    a = md5hh(a, b, c, d, x[9], 4, 0xd9d4d039);
    d = md5hh(d, a, b, c, x[12], 11, 0xe6db99e5);
    c = md5hh(c, d, a, b, x[15], 16, 0x1fa27cf8);
    b = md5hh(b, c, d, a, x[2], 23, 0xc4ac5665);

    // Round 4
    a = md5ii(a, b, c, d, x[0], 6, 0xf4292244);
    d = md5ii(d, a, b, c, x[7], 10, 0x432aff97);
    c = md5ii(c, d, a, b, x[14], 15, 0xab9423a7);
    b = md5ii(b, c, d, a, x[5], 21, 0xfc93a039);
    a = md5ii(a, b, c, d, x[12], 6, 0x655b59c3);
    d = md5ii(d, a, b, c, x[3], 10, 0x8f0ccc92);
    c = md5ii(c, d, a, b, x[10], 15, 0xffeff47d);
    b = md5ii(b, c, d, a, x[1], 21, 0x85845dd1);
    a = md5ii(a, b, c, d, x[8], 6, 0x6fa87e4f);
    d = md5ii(d, a, b, c, x[15], 10, 0xfe2ce6e0);
    c = md5ii(c, d, a, b, x[6], 15, 0xa3014314);
    b = md5ii(b, c, d, a, x[13], 21, 0x4e0811a1);
    a = md5ii(a, b, c, d, x[4], 6, 0xf7537e82);
    d = md5ii(d, a, b, c, x[11], 10, 0xbd3af235);
    c = md5ii(c, d, a, b, x[2], 15, 0x2ad7d2bb);
    b = md5ii(b, c, d, a, x[9], 21, 0xeb86d391);

    a = (a + olda) >>> 0;
    b = (b + oldb) >>> 0;
    c = (c + oldc) >>> 0;
    d = (d + oldd) >>> 0;
  }

  const out = new Uint8Array(16);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, a, true);
  outView.setUint32(4, b, true);
  outView.setUint32(8, c, true);
  outView.setUint32(12, d, true);

  return bytesToHex(out);
}
