/**
 * ArchiveZipEngine.ts
 * Pure JavaScript PKZIP engine and archive container inspector.
 * Implements standard PKZIP v2.0 format generation (Store method 0) and extraction,
 * allowing 100% offline zip creation and reading without native compilation issues.
 * Also provides multi-format archive magic signature detection (ZIP, 7Z, TAR, GZIP, RAR).
 */

import { crc32, toUint8Array, base64ToUint8Array, uint8ArrayToBase64 } from './ChecksumUtils';

export interface ArchiveFileEntry {
  name: string;
  size: number;
  compressedSize: number;
  crc32: number;
  crc32Hex: string;
  isDirectory: boolean;
  compressionMethod: number; // 0 = store, 8 = deflate
  date?: string;
  data?: Uint8Array;
}

export type ArchiveFormatType = 'zip' | '7z' | 'tar' | 'gzip' | 'rar' | 'unknown';

export interface ArchiveInspectionResult {
  format: ArchiveFormatType;
  formatName: string;
  isEncrypted: boolean;
  totalEntries: number;
  totalUncompressedSize: number;
  totalCompressedSize: number;
  entries: ArchiveFileEntry[];
  comment?: string;
  compatibilityNote?: string;
}

/**
 * Detect archive format from first few bytes.
 */
export function detectArchiveFormat(bytes: Uint8Array): { format: ArchiveFormatType; formatName: string } {
  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    if (bytes[2] === 0x03 && bytes[3] === 0x04) return { format: 'zip', formatName: 'ZIP Archive' };
    if (bytes[2] === 0x05 && bytes[3] === 0x06) return { format: 'zip', formatName: 'Empty ZIP Archive' };
    if (bytes[2] === 0x07 && bytes[3] === 0x08) return { format: 'zip', formatName: 'Spanned ZIP Archive' };
  }
  if (bytes.length >= 6 && bytes[0] === 0x37 && bytes[1] === 0x7a && bytes[2] === 0xbc && bytes[3] === 0xaf && bytes[4] === 0x27 && bytes[5] === 0x1c) {
    return { format: '7z', formatName: '7-Zip Archive' };
  }
  if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return { format: 'gzip', formatName: 'GZIP Compressed File' };
  }
  if (bytes.length >= 7 && bytes[0] === 0x52 && bytes[1] === 0x61 && bytes[2] === 0x72 && bytes[3] === 0x21 && bytes[4] === 0x1a && bytes[5] === 0x07) {
    return { format: 'rar', formatName: 'RAR Archive' };
  }
  // Check TAR ustar magic at offset 257
  if (bytes.length >= 262) {
    const ustar = String.fromCharCode(...bytes.slice(257, 262));
    if (ustar === 'ustar') {
      return { format: 'tar', formatName: 'POSIX TAR Archive' };
    }
  }

  return { format: 'unknown', formatName: 'Generic Binary File' };
}

/**
 * Parses a ZIP archive binary Uint8Array and returns its entries and metadata.
 */
export function parseZipArchive(bytes: Uint8Array): ArchiveInspectionResult {
  const formatInfo = detectArchiveFormat(bytes);
  if (formatInfo.format !== 'zip') {
    return {
      format: formatInfo.format,
      formatName: formatInfo.formatName,
      isEncrypted: false,
      totalEntries: 0,
      totalUncompressedSize: bytes.length,
      totalCompressedSize: bytes.length,
      entries: [],
      compatibilityNote: `Detected ${formatInfo.formatName}. Native extraction requires ZIP format; non-ZIP proprietary containers can be inspected.`,
    };
  }

  const entries: ArchiveFileEntry[] = [];
  let isEncrypted = false;
  let offset = 0;
  const len = bytes.length;
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // Scan local file headers (0x04034b50)
  while (offset + 30 <= len) {
    const signature = view.getUint32(offset, true);
    if (signature === 0x04034b50) {
      // Local file header
      const flags = view.getUint16(offset + 6, true);
      const compressionMethod = view.getUint16(offset + 8, true);
      const modTime = view.getUint16(offset + 10, true);
      const modDate = view.getUint16(offset + 12, true);
      const entryCrc32 = view.getUint32(offset + 14, true);
      const compSize = view.getUint32(offset + 18, true);
      const uncompSize = view.getUint32(offset + 22, true);
      const fileNameLen = view.getUint16(offset + 26, true);
      const extraFieldLen = view.getUint16(offset + 28, true);

      if ((flags & 0x01) !== 0) {
        isEncrypted = true;
      }

      const fileNameBytes = bytes.slice(offset + 30, offset + 30 + fileNameLen);
      let fileName = '';
      for (let i = 0; i < fileNameBytes.length; i++) {
        fileName += String.fromCharCode(fileNameBytes[i]);
      }

      const isDir = fileName.endsWith('/') || uncompSize === 0;
      const dataOffset = offset + 30 + fileNameLen + extraFieldLen;
      const dataEnd = dataOffset + compSize;

      let entryData: Uint8Array | undefined;
      if (compressionMethod === 0 && dataEnd <= len) {
        // Method 0 (Store): We can extract the data directly!
        entryData = bytes.slice(dataOffset, dataEnd);
      }

      // Convert DOS date/time to ISO
      const year = ((modDate >> 9) & 0x7f) + 1980;
      const month = (modDate >> 5) & 0x0f;
      const day = modDate & 0x1f;
      const hour = (modTime >> 11) & 0x1f;
      const minute = (modTime >> 5) & 0x3f;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;

      entries.push({
        name: fileName,
        size: uncompSize,
        compressedSize: compSize,
        crc32: entryCrc32,
        crc32Hex: entryCrc32.toString(16).padStart(8, '0'),
        isDirectory: isDir,
        compressionMethod,
        date: dateStr,
        data: entryData,
      });

      // Jump to next header
      offset = dataOffset + compSize;
    } else {
      // Advance to search for central directory or next header
      offset++;
      if (offset > len - 22) break;
    }
  }

  const totalUncomp = entries.reduce((acc, curr) => acc + curr.size, 0);
  const totalComp = entries.reduce((acc, curr) => acc + curr.compressedSize, 0);

  return {
    format: 'zip',
    formatName: 'ZIP Archive',
    isEncrypted,
    totalEntries: entries.length,
    totalUncompressedSize: totalUncomp,
    totalCompressedSize: totalComp,
    entries,
  };
}

/**
 * Creates a standard PKZIP archive binary Uint8Array from multiple file items.
 * Uses Store method 0 (100% universal across all OSs, platforms, and command-line tools).
 */
export function createZipArchive(
  files: Array<{ name: string; content: string | Uint8Array }>
): Uint8Array {
  interface FileRecord {
    nameBytes: Uint8Array;
    contentBytes: Uint8Array;
    crc: number;
    localHeaderOffset: number;
  }

  const records: FileRecord[] = [];
  const parts: Uint8Array[] = [];
  let currentOffset = 0;

  // 1. Write Local File Headers + File Data
  for (const file of files) {
    const nameBytes = toUint8Array(file.name.replace(/\\/g, '/'));
    const contentBytes = toUint8Array(file.content);
    const crc = crc32(contentBytes);
    const size = contentBytes.length;

    const localHeaderOffset = currentOffset;
    records.push({
      nameBytes,
      contentBytes,
      crc,
      localHeaderOffset,
    });

    // Local Header (30 bytes)
    const header = new Uint8Array(30);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);         // Version needed to extract (2.0)
    view.setUint16(6, 0, true);          // General purpose bit flag
    view.setUint16(8, 0, true);          // Compression method (0 = store)
    
    // Current DOS date & time
    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    view.setUint16(10, dosTime, true);
    view.setUint16(12, dosDate, true);

    view.setUint32(14, crc, true);       // CRC-32
    view.setUint32(18, size, true);      // Compressed size
    view.setUint32(22, size, true);      // Uncompressed size
    view.setUint16(26, nameBytes.length, true); // File name length
    view.setUint16(28, 0, true);         // Extra field length

    parts.push(header);
    parts.push(nameBytes);
    parts.push(contentBytes);

    currentOffset += 30 + nameBytes.length + contentBytes.length;
  }

  const centralDirectoryOffset = currentOffset;
  let centralDirectorySize = 0;

  // 2. Write Central Directory Headers
  for (const record of records) {
    const header = new Uint8Array(46);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x02014b50, true); // Central directory file header signature
    view.setUint16(4, 20, true);         // Version made by (2.0)
    view.setUint16(6, 20, true);         // Version needed to extract
    view.setUint16(8, 0, true);          // General purpose bit flag
    view.setUint16(10, 0, true);         // Compression method (0 = store)

    const now = new Date();
    const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
    const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
    view.setUint16(12, dosTime, true);
    view.setUint16(14, dosDate, true);

    view.setUint32(16, record.crc, true);                  // CRC-32
    view.setUint32(20, record.contentBytes.length, true);  // Compressed size
    view.setUint32(24, record.contentBytes.length, true);  // Uncompressed size
    view.setUint16(28, record.nameBytes.length, true);     // File name length
    view.setUint16(30, 0, true);                           // Extra field length
    view.setUint16(32, 0, true);                           // File comment length
    view.setUint16(34, 0, true);                           // Disk number start
    view.setUint16(36, 0, true);                           // Internal file attributes
    view.setUint32(38, 0, true);                           // External file attributes
    view.setUint32(42, record.localHeaderOffset, true);    // Relative offset of local header

    parts.push(header);
    parts.push(record.nameBytes);

    const recSize = 46 + record.nameBytes.length;
    centralDirectorySize += recSize;
    currentOffset += recSize;
  }

  // 3. Write End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);             // EOCD signature
  eocdView.setUint16(4, 0, true);                      // Number of this disk
  eocdView.setUint16(6, 0, true);                      // Disk where central directory starts
  eocdView.setUint16(8, records.length, true);         // Number of central directory records on this disk
  eocdView.setUint16(10, records.length, true);        // Total number of central directory records
  eocdView.setUint32(12, centralDirectorySize, true);  // Size of central directory
  eocdView.setUint32(16, centralDirectoryOffset, true);// Offset of start of central directory
  eocdView.setUint16(20, 0, true);                     // Comment length

  parts.push(eocd);

  // Combine parts into final Uint8Array
  const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const part of parts) {
    result.set(part, pos);
    pos += part.length;
  }

  return result;
}

/**
 * Creates a simple POSIX TAR archive binary Uint8Array from multiple file items.
 */
export function createTarArchive(
  files: Array<{ name: string; content: string | Uint8Array }>
): Uint8Array {
  const blocks: Uint8Array[] = [];

  for (const file of files) {
    const nameBytes = toUint8Array(file.name.replace(/\\/g, '/'));
    const contentBytes = toUint8Array(file.content);
    const size = contentBytes.length;

    // Header block: 512 bytes
    const header = new Uint8Array(512);

    // File name: offset 0, 100 bytes
    header.set(nameBytes.slice(0, 100), 0);

    // File mode: offset 100, 8 bytes (0000644\0)
    const mode = '0000644\0';
    for (let i = 0; i < mode.length; i++) header[100 + i] = mode.charCodeAt(i);

    // UID / GID: 8 bytes each
    const uidGid = '0000000\0';
    for (let i = 0; i < uidGid.length; i++) {
      header[108 + i] = uidGid.charCodeAt(i);
      header[116 + i] = uidGid.charCodeAt(i);
    }

    // Size in octal: offset 124, 12 bytes
    const sizeOctal = size.toString(8).padStart(11, '0') + ' ';
    for (let i = 0; i < sizeOctal.length; i++) header[124 + i] = sizeOctal.charCodeAt(i);

    // Mtime in octal: offset 136, 12 bytes
    const mtime = Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + ' ';
    for (let i = 0; i < mtime.length; i++) header[136 + i] = mtime.charCodeAt(i);

    // Typeflag: offset 156, 1 byte ('0' for normal file)
    header[156] = 48; // '0'

    // Magic: offset 257, 6 bytes ("ustar\0")
    const magic = 'ustar\0';
    for (let i = 0; i < magic.length; i++) header[257 + i] = magic.charCodeAt(i);

    // Version: offset 263, 2 bytes ("00")
    header[263] = 48;
    header[264] = 48;

    // Checksum placeholder: 8 spaces
    for (let i = 0; i < 8; i++) header[148 + i] = 32;

    // Compute checksum (sum of all 512 bytes)
    let chk = 0;
    for (let i = 0; i < 512; i++) chk += header[i];
    const chkOctal = chk.toString(8).padStart(6, '0') + '\0 ';
    for (let i = 0; i < chkOctal.length; i++) header[148 + i] = chkOctal.charCodeAt(i);

    blocks.push(header);

    // File content padded to 512 bytes
    const paddedContentSize = Math.ceil(size / 512) * 512;
    const contentBlock = new Uint8Array(paddedContentSize);
    contentBlock.set(contentBytes, 0);
    blocks.push(contentBlock);
  }

  // End of TAR: two 512-byte zero blocks (1024 bytes)
  blocks.push(new Uint8Array(1024));

  const totalLength = blocks.reduce((acc, b) => acc + b.length, 0);
  const result = new Uint8Array(totalLength);
  let pos = 0;
  for (const block of blocks) {
    result.set(block, pos);
    pos += block.length;
  }

  return result;
}
