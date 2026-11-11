/**
 * Archive & Files Helper Utilities
 * 100% Offline • Client-Side • Pure Web APIs
 */

// ==========================================
// 1. MAGIC BYTES FILE SIGNATURES
// ==========================================
export interface MagicSignature {
  name: string;
  extension: string;
  mime: string;
  category: 'Image' | 'Document' | 'Archive' | 'Audio' | 'Video' | 'Code' | 'Binary';
  offset?: number;
  pattern: number[];
  description: string;
}

export const MAGIC_SIGNATURES: MagicSignature[] = [
  {
    name: 'PNG Image',
    extension: 'png',
    mime: 'image/png',
    category: 'Image',
    pattern: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
    description: 'Portable Network Graphics lossless bitmap image',
  },
  {
    name: 'JPEG Image',
    extension: 'jpg',
    mime: 'image/jpeg',
    category: 'Image',
    pattern: [0xff, 0xd8, 0xff],
    description: 'Joint Photographic Experts Group lossy image',
  },
  {
    name: 'GIF Image',
    extension: 'gif',
    mime: 'image/gif',
    category: 'Image',
    pattern: [0x47, 0x49, 0x46, 0x38],
    description: 'Graphics Interchange Format animated image',
  },
  {
    name: 'PDF Document',
    extension: 'pdf',
    mime: 'application/pdf',
    category: 'Document',
    pattern: [0x25, 0x50, 0x44, 0x46], // %PDF
    description: 'Adobe Portable Document Format',
  },
  {
    name: 'ZIP Archive',
    extension: 'zip',
    mime: 'application/zip',
    category: 'Archive',
    pattern: [0x50, 0x4b, 0x03, 0x04], // PK..
    description: 'PKZIP compressed archive container',
  },
  {
    name: '7-Zip Archive',
    extension: '7z',
    mime: 'application/x-7z-compressed',
    category: 'Archive',
    pattern: [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c],
    description: '7-Zip high-compression archive format',
  },
  {
    name: 'RAR Archive',
    extension: 'rar',
    mime: 'application/vnd.rar',
    category: 'Archive',
    pattern: [0x52, 0x61, 0x72, 0x21, 0x1a, 0x07], // Rar!...
    description: 'Roshal Archive compressed file format',
  },
  {
    name: 'GZIP Compressed',
    extension: 'gz',
    mime: 'application/gzip',
    category: 'Archive',
    pattern: [0x1f, 0x8b],
    description: 'GNU Zip single-file compression stream',
  },
  {
    name: 'TAR USTAR Archive',
    extension: 'tar',
    mime: 'application/x-tar',
    category: 'Archive',
    offset: 257,
    pattern: [0x75, 0x73, 0x74, 0x61, 0x72], // ustar
    description: 'Unix Standard Tape Archive format',
  },
  {
    name: 'WebP Image',
    extension: 'webp',
    mime: 'image/webp',
    category: 'Image',
    offset: 8,
    pattern: [0x57, 0x45, 0x42, 0x50], // WEBP
    description: 'Google WebP modern web image format',
  },
  {
    name: 'MP3 Audio (ID3v2)',
    extension: 'mp3',
    mime: 'audio/mpeg',
    category: 'Audio',
    pattern: [0x49, 0x44, 0x33], // ID3
    description: 'MPEG-1 Audio Layer III with ID3 tags',
  },
  {
    name: 'MP4 / QuickTime Video',
    extension: 'mp4',
    mime: 'video/mp4',
    category: 'Video',
    offset: 4,
    pattern: [0x66, 0x74, 0x79, 0x70], // ftyp
    description: 'MPEG-4 Part 14 multimedia container',
  },
  {
    name: 'WebAssembly Binary',
    extension: 'wasm',
    mime: 'application/wasm',
    category: 'Code',
    pattern: [0x00, 0x61, 0x73, 0x6d], // \0asm
    description: 'Binary format for high-performance web code execution',
  },
  {
    name: 'Windows Executable',
    extension: 'exe',
    mime: 'application/x-msdownload',
    category: 'Binary',
    pattern: [0x4d, 0x5a], // MZ
    description: 'Microsoft Windows Portable Executable',
  },
  {
    name: 'ELF Linux Executable',
    extension: 'elf',
    mime: 'application/x-executable',
    category: 'Binary',
    pattern: [0x7f, 0x45, 0x4c, 0x46], // .ELF
    description: 'Executable and Linkable Format for Unix/Linux',
  },
];

export async function detectFileMagic(file: File): Promise<{
  signature: MagicSignature | null;
  hexHeader: string;
  asciiHeader: string;
  isText: boolean;
}> {
  const sliceSize = 300;
  const buffer = await file.slice(0, sliceSize).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  // Build Hex and ASCII representation of first 32 bytes
  const first32 = Array.from(bytes.slice(0, 32));
  const hexHeader = first32.map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
  const asciiHeader = first32
    .map((b) => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
    .join('');

  // Check matching signature
  let matchedSignature: MagicSignature | null = null;
  for (const sig of MAGIC_SIGNATURES) {
    const offset = sig.offset || 0;
    if (bytes.length >= offset + sig.pattern.length) {
      const match = sig.pattern.every((expected, i) => bytes[offset + i] === expected);
      if (match) {
        matchedSignature = sig;
        break;
      }
    }
  }

  // Check if plain text / json / svg / xml
  let isText = false;
  if (!matchedSignature) {
    const sample = bytes.slice(0, 128);
    const textChars = sample.filter((b) => (b >= 32 && b <= 126) || b === 9 || b === 10 || b === 13);
    if (sample.length > 0 && textChars.length / sample.length > 0.9) {
      isText = true;
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const str = textDecoder.decode(sample).trim();
      if (str.startsWith('<svg') || str.includes('<svg')) {
        matchedSignature = {
          name: 'SVG Vector Graphics',
          extension: 'svg',
          mime: 'image/svg+xml',
          category: 'Image',
          pattern: [],
          description: 'Scalable Vector Graphics XML document',
        };
      } else if (str.startsWith('<?xml') || str.startsWith('<')) {
        matchedSignature = {
          name: 'XML Document',
          extension: 'xml',
          mime: 'application/xml',
          category: 'Code',
          pattern: [],
          description: 'Extensible Markup Language document',
        };
      } else if (str.startsWith('{') || str.startsWith('[')) {
        matchedSignature = {
          name: 'JSON Data',
          extension: 'json',
          mime: 'application/json',
          category: 'Code',
          pattern: [],
          description: 'JavaScript Object Notation text data',
        };
      } else {
        matchedSignature = {
          name: 'Plain Text Document',
          extension: 'txt',
          mime: 'text/plain',
          category: 'Document',
          pattern: [],
          description: 'Standard UTF-8 plain text file',
        };
      }
    }
  }

  return {
    signature: matchedSignature,
    hexHeader,
    asciiHeader,
    isText,
  };
}

// ==========================================
// 2. CRYPTOGRAPHIC & INTEGRITY HASHES
// ==========================================
export async function computeHash(
  buffer: ArrayBuffer,
  algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'
): Promise<string> {
  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// CRC32 implementation
export function computeCRC32(bytes: Uint8Array): string {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xff];
  }
  const result = (crc ^ -1) >>> 0;
  return result.toString(16).padStart(8, '0').toUpperCase();
}

// ==========================================
// 3. TAR USTAR BUILDER (Pure Client-Side)
// ==========================================
export interface TarFileInput {
  name: string;
  data: Uint8Array;
  mtime?: number;
}

export function createTarArchive(files: TarFileInput[]): Uint8Array {
  const encoder = new TextEncoder();
  const blocks: Uint8Array[] = [];

  for (const file of files) {
    const header = new Uint8Array(512);

    // 0..99: name
    const nameBytes = encoder.encode(file.name);
    header.set(nameBytes.subarray(0, 99), 0);

    // 100..107: mode (0000644\0)
    header.set(encoder.encode('0000644\0'), 100);

    // 108..115: uid (0000000\0)
    header.set(encoder.encode('0000000\0'), 108);

    // 116..123: gid (0000000\0)
    header.set(encoder.encode('0000000\0'), 116);

    // 124..135: size (12 bytes octal zero padded)
    const sizeOctal = file.data.length.toString(8).padStart(11, '0') + ' ';
    header.set(encoder.encode(sizeOctal), 124);

    // 136..147: mtime (12 bytes octal)
    const mtime = Math.floor((file.mtime || Date.now()) / 1000);
    const mtimeOctal = mtime.toString(8).padStart(11, '0') + ' ';
    header.set(encoder.encode(mtimeOctal), 136);

    // 156: typeflag '0' (regular file)
    header[156] = 48; // '0'

    // 257..262: magic "ustar\0"
    header.set(encoder.encode('ustar\0'), 257);

    // 263..264: version "00"
    header.set(encoder.encode('00'), 263);

    // Checksum: sum of all bytes in header, with checksum field (148..155) treated as 8 spaces (0x20)
    for (let i = 148; i < 156; i++) {
      header[i] = 32; // ' '
    }
    let sum = 0;
    for (let i = 0; i < 512; i++) {
      sum += header[i];
    }
    const checksumOctal = sum.toString(8).padStart(6, '0') + '\0 ';
    header.set(encoder.encode(checksumOctal), 148);

    blocks.push(header);

    // File content block
    blocks.push(file.data);

    // Pad file content to multiple of 512 bytes
    const remainder = file.data.length % 512;
    if (remainder > 0) {
      blocks.push(new Uint8Array(512 - remainder));
    }
  }

  // End of archive marker: 2 empty 512-byte blocks (1024 zero bytes)
  blocks.push(new Uint8Array(1024));

  // Concatenate all blocks
  const totalLength = blocks.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const block of blocks) {
    result.set(block, offset);
    offset += block.length;
  }
  return result;
}

// Minimal USTAR parser
export interface TarEntryInfo {
  name: string;
  size: number;
  isDir: boolean;
  offset: number;
}

export function parseTar(bytes: Uint8Array): TarEntryInfo[] {
  const entries: TarEntryInfo[] = [];
  const decoder = new TextDecoder('utf-8');
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512);
    if (header.every((b) => b === 0)) break;

    const name = decoder.decode(header.subarray(0, 100)).replace(/\0.*$/, '');
    if (!name) break;
    const sizeOctal = decoder.decode(header.subarray(124, 136)).replace(/\0.*$/, '').trim();
    const size = sizeOctal ? parseInt(sizeOctal, 8) : 0;
    const typeFlag = String.fromCharCode(header[156]);

    entries.push({
      name,
      size,
      isDir: typeFlag === '5' || name.endsWith('/'),
      offset: offset + 512,
    });

    const dataBlocks = Math.ceil(size / 512);
    offset += 512 + dataBlocks * 512;
  }

  return entries;
}

// ==========================================
// 4. AES-GCM FILE ENCRYPTION / DECRYPTION (Tool 187)
// ==========================================
export async function encryptFileAESGCM(file: File, password: string): Promise<Blob> {
  const encoder = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key using PBKDF2
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
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

  const fileData = await file.arrayBuffer();
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, fileData);

  // Format: [MAGIC: 8 bytes 'TOOLSTRM'] + [SALT: 16 bytes] + [IV: 12 bytes] + [CIPHERTEXT]
  const magic = encoder.encode('TOOLSTRM');
  const combined = new Uint8Array(magic.length + salt.length + iv.length + ciphertext.byteLength);
  combined.set(magic, 0);
  combined.set(salt, magic.length);
  combined.set(iv, magic.length + salt.length);
  combined.set(new Uint8Array(ciphertext), magic.length + salt.length + iv.length);

  return new Blob([combined], { type: 'application/octet-stream' });
}

export async function decryptFileAESGCM(
  encryptedData: Uint8Array,
  password: string,
  originalFilename?: string
): Promise<Blob> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  // Verify magic header
  const magic = decoder.decode(encryptedData.subarray(0, 8));
  if (magic !== 'TOOLSTRM') {
    throw new Error('Not a valid Toolstrum encrypted file or header is corrupt.');
  }

  const salt = new Uint8Array(encryptedData.slice(8, 24));
  const iv = new Uint8Array(encryptedData.slice(24, 36));
  const ciphertext = new Uint8Array(encryptedData.slice(36));

  const passwordKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const aesKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv as any },
    aesKey,
    ciphertext as any
  );
  return new Blob([decryptedBuffer]);
}

// Format bytes helper
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
