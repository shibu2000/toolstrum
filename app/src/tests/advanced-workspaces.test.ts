import { CANONICAL_TOOLS } from '../data/registry';
import {
  ADVANCED_TOOL_CONFIGS,
  ADVANCED_WORKSPACES,
  getAdvancedToolConfig,
  getAdvancedWorkspaceTools,
} from '../features/tools/advanced/advancedConfig';
import {
  chunkPayloadForQrTransfer,
  computeDetailedTextDiff,
  generateSpreadsheetFormula,
  generateCsvBarChart,
  cleanTabularData,
  classifyDocumentContent,
  scanAndRedactPii,
  computeHashSimilarity,
  recommendCompressionStrategy,
} from '../features/tools/advanced/shared/AdvancedHelpers';

console.log('--- STARTING ADVANCED & SYSTEM STUDIO TEST SUITE ---');

// 1. Audit Canonical Catalog Entries for Tools 471–500
console.log('1. Auditing Canonical Catalog Entries for Tools 471–500...');
const advTools = CANONICAL_TOOLS.filter((t) => t.id >= 471 && t.id <= 500);
if (advTools.length !== 30) {
  throw new Error(`Expected exactly 30 Advanced tools (471–500), found ${advTools.length}`);
}

for (let id = 471; id <= 500; id++) {
  const config = getAdvancedToolConfig(id);
  if (!config) {
    throw new Error(`Missing Advanced configuration for tool ID ${id}`);
  }
  if (!ADVANCED_WORKSPACES[config.workspaceId]) {
    throw new Error(`Invalid workspace ID ${config.workspaceId} for tool ID ${id}`);
  }
}
console.log('✓ All 30 Advanced tools are canonically registered and configured.');

// 2. Audit Workspace Mapping Integrity (5 Workspaces)
console.log('2. Auditing Workspace Mappings (5 Workspaces)...');
const workspaces = Object.keys(ADVANCED_WORKSPACES) as Array<
  keyof typeof ADVANCED_WORKSPACES
>;
if (workspaces.length !== 5) {
  throw new Error(`Expected exactly 5 workspaces, found ${workspaces.length}`);
}

let totalWorkspaceTools = 0;
for (const wId of workspaces) {
  const tools = getAdvancedWorkspaceTools(wId);
  if (tools.length === 0) {
    throw new Error(`Workspace ${wId} has zero registered tools`);
  }
  totalWorkspaceTools += tools.length;
}

if (totalWorkspaceTools !== 30) {
  throw new Error(`Expected 30 workspace tools total, found ${totalWorkspaceTools}`);
}
console.log('✓ All 5 workspaces contain exactly 30 tools total.');

// 3. Audit QR Payload Streaming Chunking Engine
console.log('3. Auditing QR Streaming Chunking Engine...');
const samplePayload = 'A'.repeat(500);
const chunks = chunkPayloadForQrTransfer(samplePayload, 200);
if (chunks.length !== 3) {
  throw new Error(`Expected 3 chunks for 500 bytes at 200 chunkSize, got ${chunks.length}`);
}
if (chunks[0].total !== 3 || chunks[0].index !== 1 || !chunks[0].payload.startsWith('QR_PKG|1/3|')) {
  throw new Error(`Malformed QR chunk payload header: ${chunks[0].payload}`);
}
console.log('✓ QR Streaming Chunking divides air-gapped payloads correctly.');

// 4. Audit Text Diff Engine with Highlighting
console.log('4. Auditing Detailed Text Diff Engine...');
const text1 = 'Alpha\nBeta\nGamma';
const text2 = 'Alpha\nBeta Modified\nGamma\nDelta';
const diffResult = computeDetailedTextDiff(text1, text2);
if (diffResult.additions === 0 || diffResult.deletions === 0 || diffResult.unchanged === 0) {
  throw new Error(`Diff output calculation inaccurate: ${JSON.stringify(diffResult)}`);
}
if (diffResult.similarityRatio <= 0 || diffResult.similarityRatio >= 100) {
  throw new Error(`Similarity ratio expected between 1-99%, got ${diffResult.similarityRatio}%`);
}
console.log('✓ Detailed Text Diff accurately tracks additions, deletions, and line-level changes.');

// 5. Audit Natural Language Spreadsheet Formula Generator
console.log('5. Auditing Spreadsheet Formula Generator...');
const lookupRes = generateSpreadsheetFormula('how to xlookup an employee name');
if (!lookupRes.formula.includes('XLOOKUP')) {
  throw new Error(`Expected XLOOKUP formula, got ${lookupRes.formula}`);
}
const sumifsRes = generateSpreadsheetFormula('sum values with condition and criteria');
if (!sumifsRes.formula.includes('SUMIFS')) {
  throw new Error(`Expected SUMIFS formula, got ${sumifsRes.formula}`);
}
console.log('✓ Formula generator maps plain English queries to valid spreadsheet formulas.');

// 6. Audit CSV ASCII Bar Chart Generator
console.log('6. Auditing CSV Bar Chart Generator...');
const csvData = 'Jan, 100\nFeb, 250\nMar, 180';
const chart = generateCsvBarChart(csvData);
if (chart.totalRows !== 3 || chart.maxVal !== 250 || !chart.chartAscii.includes('█')) {
  throw new Error(`Chart generator failed to produce bar charts from CSV: ${JSON.stringify(chart)}`);
}
console.log('✓ CSV data correctly converts to scaled offline ASCII charts.');

// 7. Audit Tabular Data Cleaner
console.log('7. Auditing Tabular Data Cleaner (Deduplication)...');
const dirtyData = 'Apple\nBanana\nApple\nOrange\nBanana';
const cleaned = cleanTabularData(dirtyData);
if (cleaned.originalLines !== 5 || cleaned.cleanedLines !== 3 || cleaned.duplicatesRemoved !== 2) {
  throw new Error(`Tabular data cleaning failed: ${JSON.stringify(cleaned)}`);
}
console.log('✓ Tabular data cleaner successfully deduplicates rows.');

// 8. Audit Document Classifier
console.log('8. Auditing Document Classifier Engine...');
const legalText = 'The parties hereto hereby agrees to maintain strict confidentiality and abide by terms and conditions.';
const legalClass = classifyDocumentContent(legalText);
if (!legalClass.category.includes('Legal') || legalClass.confidence < 90) {
  throw new Error(`Expected legal document classification, got ${JSON.stringify(legalClass)}`);
}

const codeText = 'import React from "react"; export const App = () => { return <div>Toolstrum</div>; }';
const codeClass = classifyDocumentContent(codeText);
if (!codeClass.category.includes('Code') || codeClass.confidence < 90) {
  throw new Error(`Expected code classification, got ${JSON.stringify(codeClass)}`);
}
console.log('✓ Document classifier heuristics correctly categorize legal and software source code.');

// 9. Audit PII Detection and Redaction
console.log('9. Auditing PII Regex Redactor...');
const sensitiveInput = 'Contact user at test@example.com, SSN: 123-45-6789, phone: 415-555-1234';
const piiResult = scanAndRedactPii(sensitiveInput);
if (piiResult.redactionsCount < 3) {
  throw new Error(`Expected at least 3 redactions, found ${piiResult.redactionsCount}`);
}
if (piiResult.redactedText.includes('123-45-6789') || piiResult.redactedText.includes('test@example.com')) {
  throw new Error(`Sensitive PII was not properly redacted: ${piiResult.redactedText}`);
}
console.log('✓ PII redactor properly shields emails, SSNs, and phone numbers offline.');

// 10. Audit Perceptual Hash Similarity Engine
console.log('10. Auditing Perceptual Hash Similarity Engine...');
const hash1 = 'a1b2c3d4e5f60718';
const hash2 = 'a1b2c3d4e5f60719'; // 1 character difference
const simClose = computeHashSimilarity(hash1, hash2);
if (!simClose.isMatch || simClose.similarityPercent < 90) {
  throw new Error(`Expected close perceptual match, got ${JSON.stringify(simClose)}`);
}
const hashDifferent = 'ffffffffffffffff';
const simDiff = computeHashSimilarity(hash1, hashDifferent);
if (simDiff.isMatch || simDiff.similarityPercent > 50) {
  throw new Error(`Expected mismatch for distant hashes, got ${JSON.stringify(simDiff)}`);
}
console.log('✓ Hash similarity engine accurately computes hamming distance.');

// 11. Audit Compression Strategy Advisor
console.log('11. Auditing Compression Strategy Advisor...');
const imgAdvice = recommendCompressionStrategy('photo.jpg', 4000000);
if (!imgAdvice.recommendedAlgorithm.includes('Pre-Compressed')) {
  throw new Error(`Expected pre-compressed recommendation for JPEG, got ${JSON.stringify(imgAdvice)}`);
}
const jsonAdvice = recommendCompressionStrategy('dataset.json', 10000000);
if (!jsonAdvice.recommendedAlgorithm.includes('Brotli')) {
  throw new Error(`Expected Brotli recommendation for JSON, got ${JSON.stringify(jsonAdvice)}`);
}
console.log('✓ Compression advisor accurately categorizes media and entropy profiles.');

console.log('\n--- ALL ADVANCED & SYSTEM STUDIO TESTS PASSED (100% OFFLINE) ---');
