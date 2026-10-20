/**
 * archive-workspaces.test.ts
 * Verification test suite for Archive & Files reusable workspaces refactoring (Task 01).
 * Tests catalog preservation, workspace mapping, crypto checksum test vectors,
 * and pure JS PKZIP / TAR engine generation & parsing.
 */

import { ARCHIVE_TOOL_MAP, getArchiveToolConfig } from '../features/tools/archive/archiveConfig';
import { getToolById, CANONICAL_TOOLS } from '../data/registry';
import {
  sha256,
  sha1,
  md5,
  crc32,
  crc32Hex,
  base64ToUint8Array,
  uint8ArrayToBase64,
  toUint8Array,
} from '../features/tools/archive/shared/ChecksumUtils';
import {
  createZipArchive,
  createTarArchive,
  parseZipArchive,
  detectArchiveFormat,
} from '../features/tools/archive/shared/ArchiveZipEngine';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('--- STARTING ARCHIVE & FILES WORKSPACE TEST SUITE ---');

// 1. Audit All 24 Tools in Archive & Files Catalog (181–204)
console.log('1. Checking Catalog Entries for Tools 181–204...');
const expectedTools: Record<number, string> = {
  181: 'ZIP Creator',
  182: 'ZIP Extractor',
  183: '7Z Extractor',
  184: 'TAR Extractor',
  185: 'GZIP Compressor/Extractor',
  186: 'Archive File Inspector',
  187: 'Archive Password Protector',
  188: 'File Compressor',
  189: 'File Type Detector',
  190: 'File Size Analyzer',
  191: 'Duplicate File Finder',
  192: 'Bulk File Renamer',
  193: 'File Checksum Generator',
  194: 'Checksum Verifier',
  195: 'File Splitter',
  196: 'File Joiner',
  197: 'MIME Type Inspector',
  198: 'File Extension Converter',
  199: 'Batch File Organizer',
  200: 'Temporary File Cleaner',
  201: 'File Sharing Utility',
  202: 'Recent Files Manager',
  203: 'Storage Usage Analyzer',
  204: 'Archive Converter',
};

for (let id = 181; id <= 204; id++) {
  const tool = getToolById(id);
  assert(!!tool, `Tool #${id} must exist in canonical registry`);
  assert(tool!.name === expectedTools[id], `Tool #${id} name mismatch: expected "${expectedTools[id]}", got "${tool!.name}"`);
  assert(tool!.studioId === 'archive', `Tool #${id} must belong to 'archive' studio`);
  assert(tool!.offlineCapable === true, `Tool #${id} must be marked offlineCapable`);
}
console.log('✓ All 24 Archive & Files tools (181–204) verified with exact names and metadata.');

// 2. Audit Workspace Mapping (All 24 + Tool 372)
console.log('2. Auditing Tool-to-Workspace Consolidated Mappings...');
for (let id = 181; id <= 204; id++) {
  const cfg = getArchiveToolConfig(id);
  assert(!!cfg, `Tool #${id} must have a workspace configuration in ARCHIVE_TOOL_MAP`);
  assert(!!cfg!.workspace, `Tool #${id} must map to a workspace`);
  assert(!!cfg!.defaultOperation, `Tool #${id} must define a defaultOperation`);
}

// Tool 372 (Security File Hash Verifier)
const tool372 = getArchiveToolConfig(372);
assert(!!tool372, 'Tool #372 (File Hash Verifier) must be mapped in ARCHIVE_TOOL_MAP');
assert(tool372!.workspace === 'file_integrity', 'Tool #372 must map to file_integrity workspace');
console.log('✓ All 25 tools mapped to their respective 7 consolidated workspaces.');

// 3. Test Cryptographic Checksum Test Vectors
console.log('3. Validating Cryptographic Checksums Against Standard Test Vectors...');

// SHA-256
assert(
  sha256('') === 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'SHA-256 empty string test vector failed'
);
assert(
  sha256('abc') === 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  'SHA-256 "abc" test vector failed'
);

// SHA-1
assert(
  sha1('') === 'da39a3ee5e6b4b0d3255bfef95601890afd80709',
  'SHA-1 empty string test vector failed'
);
assert(
  sha1('abc') === 'a9993e364706816aba3e25717850c26c9cd0d89d',
  'SHA-1 "abc" test vector failed'
);

// MD5
assert(
  md5('') === 'd41d8cd98f00b204e9800998ecf8427e',
  'MD5 empty string test vector failed'
);
assert(
  md5('abc') === '900150983cd24fb0d6963f7d28e17f72',
  'MD5 "abc" test vector failed'
);

// CRC-32
assert(crc32Hex('') === '00000000', 'CRC-32 empty string failed');
assert(crc32Hex('123456789') === 'cbf43926', 'CRC-32 "123456789" standard check failed');
console.log('✓ SHA-256, SHA-1, MD5, and CRC-32 test vectors passed perfectly.');

// 4. Test Base64 Encoding and Decoding
console.log('4. Testing Base64 Codec Roundtrip...');
const sampleText = 'Toolstrum Offline Archive Suite: High Performance Utility';
const sampleBytes = toUint8Array(sampleText);
const b64 = uint8ArrayToBase64(sampleBytes);
const decodedBytes = base64ToUint8Array(b64);
const decodedText = String.fromCharCode(...decodedBytes);
assert(decodedText === sampleText, 'Base64 roundtrip failed');
console.log('✓ Base64 codec verified.');

// 5. Test Pure JS ZIP Engine
console.log('5. Testing PKZIP Creation and Parsing Engine...');
const testFiles = [
  { name: 'document.txt', content: 'Hello from Toolstrum Zip Engine!' },
  { name: 'data.json', content: '{"status":"ok","offline":true}' },
  { name: 'notes/readme.md', content: '# Welcome to Archive & Files' },
];

const zipBytes = createZipArchive(testFiles);
assert(zipBytes.length > 100, 'Generated ZIP should have valid byte length');

// Check magic signature
const zipFormat = detectArchiveFormat(zipBytes);
assert(zipFormat.format === 'zip', 'detectArchiveFormat must identify generated archive as zip');

// Parse ZIP
const parsedZip = parseZipArchive(zipBytes);
assert(parsedZip.format === 'zip', 'Parsed zip format must be zip');
assert(parsedZip.entries.length === 3, `Expected 3 entries in zip, found ${parsedZip.entries.length}`);
assert(parsedZip.entries[0].name === 'document.txt', 'Entry 0 name mismatch');
assert(parsedZip.entries[1].name === 'data.json', 'Entry 1 name mismatch');
assert(parsedZip.entries[2].name === 'notes/readme.md', 'Entry 2 name mismatch');
assert(parsedZip.entries[0].size === testFiles[0].content.length, 'Entry 0 uncompressed size mismatch');

// Verify unpacked data
assert(
  parsedZip.entries[0].data !== undefined &&
    String.fromCharCode(...parsedZip.entries[0].data) === testFiles[0].content,
  'Unpacked content mismatch'
);
console.log('✓ PKZIP generation, header validation, and parsing passed.');

// 6. Test TAR Engine
console.log('6. Testing TAR Creation and Magic Detection...');
const tarBytes = createTarArchive(testFiles);
assert(tarBytes.length >= 1536, 'TAR must have at least header + blocks');
const tarFormat = detectArchiveFormat(tarBytes);
assert(tarFormat.format === 'tar', 'detectArchiveFormat must recognize tar format');
console.log('✓ POSIX TAR engine verified.');

console.log('--- ALL ARCHIVE WORKSPACE TESTS PASSED SUCCESSFULLY (100%) ---');
