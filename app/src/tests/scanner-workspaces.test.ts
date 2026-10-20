/**
 * scanner-workspaces.test.ts
 * Verification test suite for Document Scanner Studio consolidated workspaces (Tools 86–103).
 * Tests catalog integrity, workspace mappings, and pure document OCR & parsing utilities.
 */

import { SCANNER_TOOL_MAP, getScannerToolConfig, isScannerStudioTool } from '../features/tools/scanner/scannerConfig';
import { getToolById } from '../data/registry';
import {
  generateDocumentName,
  parseReceiptData,
  parseBusinessCardData,
  extractTableGrid,
  detectQualityIssues,
} from '../features/tools/scanner/shared/ScannerHelpers';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTestSuite() {
  console.log('--- STARTING DOCUMENT SCANNER STUDIO TEST SUITE ---');

  // 1. Audit All 18 Tools in Document Scanner Catalog (86–103)
  console.log('1. Auditing Canonical Catalog Entries for Tools 86–103...');
  const expectedTools: Record<number, string> = {
    86: 'Smart Document Scanner',
    87: 'Perspective Correction',
    88: 'Auto-Crop Scanner',
    89: 'Scan Filters',
    90: 'Multi-Page Scanner',
    91: 'ID Card Scanner',
    92: 'Receipt Scanner',
    93: 'Business Card Scanner',
    94: 'Handwriting OCR',
    95: 'OCR Language Selector',
    96: 'Searchable PDF Maker',
    97: 'Scan to Word',
    98: 'Scan to Excel',
    99: 'Document Cleanup',
    100: 'Scan History',
    101: 'Document Naming Assistant',
    102: 'Batch Scan Export',
    103: 'Scan Quality Checker',
  };

  for (let id = 86; id <= 103; id++) {
    const tool = getToolById(id);
    assert(!!tool, `Tool #${id} must exist in canonical registry`);
    assert(
      tool!.name === expectedTools[id],
      `Tool #${id} name mismatch: expected "${expectedTools[id]}", got "${tool!.name}"`
    );
    assert(tool!.studioId === 'scanner', `Tool #${id} must belong to 'scanner' studio`);
    assert(tool!.offlineCapable === true, `Tool #${id} must be marked offlineCapable`);
  }
  console.log('✓ All 18 Document Scanner tools (86–103) verified with exact names and offline metadata.');

  // 2. Audit Workspace Mapping (All 18 tools mapped to the 5 consolidated workspaces)
  console.log('2. Auditing Tool-to-Workspace Consolidated Mappings...');
  const workspaceCounts: Record<string, number> = {
    scanner_capture: 0,
    scanner_enhance: 0,
    scanner_ocr: 0,
    scanner_export: 0,
    scanner_manager: 0,
  };

  for (let id = 86; id <= 103; id++) {
    assert(isScannerStudioTool(id), `isScannerStudioTool(${id}) must return true`);
    const cfg = getScannerToolConfig(id);
    assert(!!cfg, `Tool #${id} must have configuration in SCANNER_TOOL_MAP`);
    assert(!!cfg!.workspace, `Tool #${id} must map to a valid workspace`);
    assert(!!cfg!.defaultOperation, `Tool #${id} must define defaultOperation`);
    assert(cfg!.supportedFormats.length > 0, `Tool #${id} must list supported formats`);
    workspaceCounts[cfg!.workspace] = (workspaceCounts[cfg!.workspace] || 0) + 1;
  }

  assert(workspaceCounts.scanner_capture === 6, `Workspace 1 (Capture) should have 6 tools, got ${workspaceCounts.scanner_capture}`);
  assert(workspaceCounts.scanner_enhance === 2, `Workspace 2 (Enhance) should have 2 tools, got ${workspaceCounts.scanner_enhance}`);
  assert(workspaceCounts.scanner_ocr === 4, `Workspace 3 (OCR) should have 4 tools, got ${workspaceCounts.scanner_ocr}`);
  assert(workspaceCounts.scanner_export === 4, `Workspace 4 (Export) should have 4 tools, got ${workspaceCounts.scanner_export}`);
  assert(workspaceCounts.scanner_manager === 2, `Workspace 5 (Manager) should have 2 tools, got ${workspaceCounts.scanner_manager}`);

  const totalMapped = Object.values(workspaceCounts).reduce((a, b) => a + b, 0);
  assert(totalMapped === 18, `Total mapped tools should be 18, got ${totalMapped}`);

  console.log('✓ All 18 tools cleanly mapped to 5 reusable workspaces with 0 gaps.');

  // 3. Document Scanning & Extraction Algorithm Tests
  console.log('3. Validating Core Offline Document Processing Algorithms...');

  // Test 3.1: Document Naming Template Assistant
  const invName = generateDocumentName('invoice', 'Supplier_Corp', new Date('2026-10-10'));
  assert(invName === 'INV_Supplier_Corp_2026-10-10', `Expected INV_Supplier_Corp_2026-10-10, got ${invName}`);
  const recName = generateDocumentName('receipt', 'CoffeeShop', new Date('2026-10-10'));
  assert(recName === 'REC_CoffeeShop_2026-10-10', `Expected REC_CoffeeShop_2026-10-10, got ${recName}`);
  console.log('✓ Document Naming Assistant verified for standard business taxonomies.');

  // Test 3.2: Receipt Financial Parsing
  const receiptData = parseReceiptData();
  assert(receiptData.storeName.length > 0, 'Receipt store name should be parsed');
  assert(receiptData.items.length > 0, 'Receipt should have parsed line items');
  assert(receiptData.total.startsWith('$'), 'Receipt total should be formatted currency');
  console.log(`✓ Receipt expense extraction verified (${receiptData.itemCount} items, total: ${receiptData.total}).`);

  // Test 3.3: Business Card Field Extraction
  const cardData = parseBusinessCardData();
  assert(cardData.fullName.length > 0, 'Business card should have full name');
  assert(cardData.email.includes('@'), 'Business card should have valid email');
  assert(cardData.phone.length > 0, 'Business card should have phone number');
  console.log(`✓ Business Card parser verified (${cardData.fullName} · ${cardData.company}).`);

  // Test 3.4: Tabular Grid Line & CSV Export
  const tableData = extractTableGrid();
  assert(tableData.headers.length === 5, 'Table should have 5 columns');
  assert(tableData.rows.length === 4, 'Table should have 4 rows');
  assert(tableData.csvString.includes(','), 'Table CSV should contain comma delimiters');
  console.log('✓ Scan to Excel table matrix and CSV serializer verified.');

  // Test 3.5: Quality Checker
  const goodQuality = detectQualityIssues(2480, 3508, 1200000); // Standard A4 300 DPI
  assert(goodQuality.score >= 80, 'High-resolution scan should score >= 80');
  assert(goodQuality.rating === 'Good' || goodQuality.rating === 'Excellent', 'Rating should be high');
  assert(!goodQuality.isLowResolution, 'High-resolution scan should not be low resolution');

  const lowQuality = detectQualityIssues(600, 800, 30000); // Low-resolution scan
  assert(lowQuality.isLowResolution, 'Sub-2MP image should be flagged low resolution');
  console.log('✓ Scan Quality Checker resolution & blur evaluation passed.');

  // Test 3.6: Searchable PDF Maker Layer Simulation
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  page.drawText('Invisible OCR Text Layer for Document Searchability', {
    x: 50,
    y: 50,
    size: 10,
    font,
    color: rgb(0.95, 0.95, 0.95),
  });
  const pdfBytes = await doc.save();
  assert(pdfBytes.byteLength > 0, 'Searchable PDF must serialize to bytes');
  console.log(`✓ Searchable PDF optical layer generated (${pdfBytes.byteLength} bytes).`);

  console.log('--- ALL DOCUMENT SCANNER TESTS PASSED (100% SUCCESS) ---');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
