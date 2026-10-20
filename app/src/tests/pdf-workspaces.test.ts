/**
 * pdf-workspaces.test.ts
 * Verification test suite for PDF Studio consolidated workspaces (Tools 1–48).
 * Tests catalog integrity, workspace mappings, and pdf-lib document manipulation.
 */

import { PDF_TOOL_MAP, getPdfToolConfig, isPdfStudioTool } from '../features/tools/pdf/pdfConfig';
import { getToolById, CANONICAL_TOOLS } from '../data/registry';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTestSuite() {
  console.log('--- STARTING PDF STUDIO WORKSPACE CONSOLIDATION TEST SUITE ---');

  // 1. Audit All 48 Tools in PDF Studio Catalog (1–48)
  console.log('1. Auditing Canonical Catalog Entries for Tools 1–48...');
  const expectedTools: Record<number, string> = {
    1: 'Images to PDF',
    2: 'Text to PDF',
    3: 'Scan to PDF',
    4: 'Merge PDF',
    5: 'Split PDF',
    6: 'Compress PDF',
    7: 'PDF to Images',
    8: 'Images to JPG/PNG PDF',
    9: 'Rotate PDF',
    10: 'Reorder PDF Pages',
    11: 'Delete PDF Pages',
    12: 'Extract PDF Pages',
    13: 'Duplicate PDF Pages',
    14: 'Add PDF Pages',
    15: 'Crop PDF',
    16: 'Resize PDF Pages',
    17: 'Add Page Numbers',
    18: 'Add Watermark',
    19: 'Protect PDF',
    20: 'Unlock PDF',
    21: 'PDF Permissions Editor',
    22: 'PDF Metadata Editor',
    23: 'PDF Viewer',
    24: 'PDF Annotator',
    25: 'PDF Signer',
    26: 'Fill PDF Forms',
    27: 'PDF to Text',
    28: 'PDF to Word',
    29: 'PDF to Excel',
    30: 'PDF to PowerPoint',
    31: 'Word to PDF',
    32: 'Excel to PDF',
    33: 'PowerPoint to PDF',
    34: 'HTML to PDF',
    35: 'Webpage to PDF',
    36: 'PDF OCR',
    37: 'PDF Compare',
    38: 'PDF Repair',
    39: 'PDF Flatten',
    40: 'PDF Booklet Maker',
    41: 'PDF Print Optimizer',
    42: 'PDF to Markdown',
    43: 'PDF to JSON',
    44: 'PDF Redaction',
    45: 'PDF Page Labels',
    46: 'PDF File Inspector',
    47: 'PDF Batch Processor',
    48: 'PDF Compare & Merge',
  };

  for (let id = 1; id <= 48; id++) {
    const tool = getToolById(id);
    assert(!!tool, `Tool #${id} must exist in canonical registry`);
    assert(
      tool!.name === expectedTools[id],
      `Tool #${id} name mismatch: expected "${expectedTools[id]}", got "${tool!.name}"`
    );
    assert(tool!.studioId === 'pdf', `Tool #${id} must belong to 'pdf' studio`);
    assert(tool!.offlineCapable === true, `Tool #${id} must be marked offlineCapable`);
  }
  console.log('✓ All 48 PDF Studio tools (1–48) verified with exact names and metadata.');

  // 2. Audit Workspace Mapping (All 48 tools mapped to the 7 workspaces)
  console.log('2. Auditing Tool-to-Workspace Consolidated Mappings...');
  const workspaceCounts: Record<string, number> = {
    pdf_creation: 0,
    pdf_pages: 0,
    pdf_optimization: 0,
    pdf_viewer: 0,
    pdf_conversion: 0,
    pdf_inspection: 0,
    pdf_batch: 0,
  };

  for (let id = 1; id <= 48; id++) {
    assert(isPdfStudioTool(id), `isPdfStudioTool(${id}) must return true`);
    const cfg = getPdfToolConfig(id);
    assert(!!cfg, `Tool #${id} must have configuration in PDF_TOOL_MAP`);
    assert(!!cfg!.workspace, `Tool #${id} must map to a workspace`);
    assert(!!cfg!.defaultOperation, `Tool #${id} must define defaultOperation`);
    assert(cfg!.supportedFormats.length > 0, `Tool #${id} must list supported formats`);
    workspaceCounts[cfg!.workspace] = (workspaceCounts[cfg!.workspace] || 0) + 1;
  }

  assert(workspaceCounts.pdf_creation === 9, `Workspace A should have 9 tools, got ${workspaceCounts.pdf_creation}`);
  assert(workspaceCounts.pdf_pages === 12, `Workspace B should have 12 tools, got ${workspaceCounts.pdf_pages}`);
  assert(workspaceCounts.pdf_optimization === 9, `Workspace C should have 9 tools, got ${workspaceCounts.pdf_optimization}`);
  assert(workspaceCounts.pdf_viewer === 4, `Workspace D should have 4 tools, got ${workspaceCounts.pdf_viewer}`);
  assert(workspaceCounts.pdf_conversion === 8, `Workspace E should have 8 tools, got ${workspaceCounts.pdf_conversion}`);
  assert(workspaceCounts.pdf_inspection === 5, `Workspace F should have 5 tools, got ${workspaceCounts.pdf_inspection}`);
  assert(workspaceCounts.pdf_batch === 1, `Workspace G should have 1 tool, got ${workspaceCounts.pdf_batch}`);

  console.log('✓ All 48 tools cleanly mapped to 7 reusable workspaces with correct distribution.');

  // 3. Document Manipulation Engine Unit Tests
  console.log('3. Validating Core PDF Engine Manipulation via pdf-lib...');

  // Test 3.1: Document Creation & Page Addition
  const doc = await PDFDocument.create();
  assert(doc.getPageCount() === 0, 'New PDF document must start with 0 pages');
  const page1 = doc.addPage([600, 800]);
  const page2 = doc.addPage([600, 800]);
  assert(doc.getPageCount() === 2, 'Doc must now contain 2 pages');

  // Test 3.2: Page Rotation
  page1.setRotation(degrees(90));
  assert(page1.getRotation().angle === 90, 'Page 1 must be rotated 90 degrees');
  assert(page2.getRotation().angle === 0, 'Page 2 rotation must remain 0 degrees');

  // Test 3.3: Metadata Modification and Extraction
  doc.setTitle('Toolstrum Test Suite');
  doc.setAuthor('DeepMind Engineer');
  doc.setSubject('Offline Engine Validation');
  doc.setKeywords(['test', 'offline', 'privacy']);

  assert(doc.getTitle() === 'Toolstrum Test Suite', 'Metadata title should match');
  assert(doc.getAuthor() === 'DeepMind Engineer', 'Metadata author should match');
  assert(doc.getSubject() === 'Offline Engine Validation', 'Metadata subject should match');
  assert(doc.getPageCount() === 2, 'Metadata pageCount should be 2');

  // Test 3.4: Watermark & Drawing
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  page1.drawText('WATERMARK', {
    x: 100,
    y: 100,
    size: 24,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Test 3.5: Serialization & Deserialization
  const base64 = await doc.saveAsBase64();
  assert(base64.length > 0, 'Document must serialize to base64 stream');
  const reloaded = await PDFDocument.load(base64);
  assert(reloaded.getPageCount() === 2, 'Reloaded document must have 2 pages');
  assert(reloaded.getTitle() === 'Toolstrum Test Suite', 'Reloaded document must retain title metadata');

  console.log('✓ PDF Engine creation, rotation, metadata, watermark, and serialization passed flawlessly.');

  console.log('--- ALL PDF STUDIO TESTS PASSED (100% SUCCESS) ---');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
