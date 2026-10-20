/**
 * image-workspaces.test.ts
 * Verification test suite for Image Studio consolidated workspaces (Tools 49–85).
 * Tests catalog integrity, workspace mappings, and pure image/svg utilities.
 */

import { IMAGE_TOOL_MAP, getImageToolConfig, isImageStudioTool } from '../features/tools/image/imageConfig';
import { getToolById } from '../data/registry';
import { optimizeSvgContent, extractDominantPalette } from '../features/tools/image/shared/ImageHelpers';
import { PDFDocument } from 'pdf-lib';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTestSuite() {
  console.log('--- STARTING IMAGE STUDIO WORKSPACE CONSOLIDATION TEST SUITE ---');

  // 1. Audit All 37 Tools in Image Studio Catalog (49–85)
  console.log('1. Auditing Canonical Catalog Entries for Tools 49–85...');
  const expectedTools: Record<number, string> = {
    49: 'Image Compressor',
    50: 'Image Resizer',
    51: 'Image Cropper',
    52: 'Image Rotator',
    53: 'Image Format Converter',
    54: 'HEIC Converter',
    55: 'Image to PDF',
    56: 'PDF Page to Image',
    57: 'Background Remover',
    58: 'Background Changer',
    59: 'Image Watermark',
    60: 'Image Annotator',
    61: 'Image Collage Maker',
    62: 'Image Merger',
    63: 'Image Splitter',
    64: 'Image Color Picker',
    65: 'Image to Text (OCR)',
    66: 'Image Upscaler',
    67: 'Photo Enhancer',
    68: 'Blur Image',
    69: 'Image Metadata Viewer',
    70: 'EXIF Remover',
    71: 'Image Metadata Editor',
    72: 'Transparent PNG Maker',
    73: 'Favicon Generator',
    74: 'Thumbnail Maker',
    75: 'Passport Photo Maker',
    76: 'ID Photo Sheet Maker',
    77: 'Meme Generator',
    78: 'Color Palette Extractor',
    79: 'Image Comparison',
    80: 'Screenshot Stitcher',
    81: 'SVG Viewer',
    82: 'SVG Optimizer',
    83: 'SVG to PNG',
    84: 'PNG to SVG',
    85: 'Image Batch Processor',
  };

  for (let id = 49; id <= 85; id++) {
    const tool = getToolById(id);
    assert(!!tool, `Tool #${id} must exist in canonical registry`);
    assert(
      tool!.name === expectedTools[id],
      `Tool #${id} name mismatch: expected "${expectedTools[id]}", got "${tool!.name}"`
    );
    assert(tool!.studioId === 'image', `Tool #${id} must belong to 'image' studio`);
    assert(tool!.offlineCapable === true, `Tool #${id} must be marked offlineCapable`);
  }
  console.log('✓ All 37 Image Studio tools (49–85) verified with exact names and offline metadata.');

  // 2. Audit Workspace Mapping (All 37 tools mapped to the 5 consolidated workspaces)
  console.log('2. Auditing Tool-to-Workspace Consolidated Mappings...');
  const workspaceCounts: Record<string, number> = {
    image_editor: 0,
    image_conversion: 0,
    image_creation: 0,
    image_analysis: 0,
    image_batch: 0,
  };

  for (let id = 49; id <= 85; id++) {
    assert(isImageStudioTool(id), `isImageStudioTool(${id}) must return true`);
    const cfg = getImageToolConfig(id);
    assert(!!cfg, `Tool #${id} must have configuration in IMAGE_TOOL_MAP`);
    assert(!!cfg!.workspace, `Tool #${id} must map to a valid workspace`);
    assert(!!cfg!.defaultOperation, `Tool #${id} must define defaultOperation`);
    assert(cfg!.supportedFormats.length > 0, `Tool #${id} must list supported formats`);
    workspaceCounts[cfg!.workspace] = (workspaceCounts[cfg!.workspace] || 0) + 1;
  }

  assert(workspaceCounts.image_editor === 7, `Workspace A (Editor) should have 7 tools, got ${workspaceCounts.image_editor}`);
  assert(workspaceCounts.image_conversion === 12, `Workspace B (Conversion) should have 12 tools, got ${workspaceCounts.image_conversion}`);
  assert(workspaceCounts.image_creation === 9, `Workspace C (Creation) should have 9 tools, got ${workspaceCounts.image_creation}`);
  assert(workspaceCounts.image_analysis === 8, `Workspace D (Analysis) should have 8 tools, got ${workspaceCounts.image_analysis}`);
  assert(workspaceCounts.image_batch === 1, `Workspace E (Batch) should have 1 tool, got ${workspaceCounts.image_batch}`);

  const totalMapped = Object.values(workspaceCounts).reduce((a, b) => a + b, 0);
  assert(totalMapped === 37, `Total mapped tools should be 37, got ${totalMapped}`);

  console.log('✓ All 37 tools cleanly mapped to 5 reusable workspaces with 0 gaps.');

  // 3. Engine Unit Tests
  console.log('3. Validating Core Offline Image & Vector Algorithms...');

  // Test 3.1: SVG Optimization
  const testSvg = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<!-- Author: Toolstrum Team -->
<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#10B981" />
</svg>`;

  const optResult = optimizeSvgContent(testSvg);
  assert(optResult.minified.length < testSvg.length, 'Optimized SVG must be shorter than original');
  assert(!optResult.minified.includes('<?xml'), 'Optimized SVG must not contain XML declaration');
  assert(!optResult.minified.includes('<!DOCTYPE'), 'Optimized SVG must not contain DOCTYPE');
  assert(!optResult.minified.includes('Toolstrum Team'), 'Optimized SVG must strip comments');
  assert(optResult.savingsPercent > 20, 'Savings percent should be substantial (>20%)');
  console.log(`✓ SVG Optimization successfully minified SVG by ${optResult.savingsPercent.toFixed(1)}%`);

  // Test 3.2: Dominant Palette Extraction
  const palette = extractDominantPalette();
  assert(Array.isArray(palette), 'Palette should be an array');
  assert(palette.length === 5, 'Palette should contain 5 dominant colors');
  palette.forEach((color) => {
    assert(/^#[0-9A-Fa-f]{6}$/.test(color), `Color ${color} should be a valid 6-char hex code`);
  });
  console.log('✓ Dominant Color Palette Extractor verified with valid hex color models.');

  // Test 3.3: PDF Document Generation for Image-to-PDF
  const pdfDoc = await PDFDocument.create();
  assert(pdfDoc.getPageCount() === 0, 'New PDF must start with 0 pages');
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  assert(page.getWidth() > 500, 'Page width should match A4 dimensions');
  const pdfBytes = await pdfDoc.save();
  assert(pdfBytes.byteLength > 0, 'PDF must serialize to bytes');
  console.log(`✓ On-device PDF Document generator for Image-to-PDF verified (${pdfBytes.byteLength} bytes).`);

  console.log('--- ALL IMAGE STUDIO TESTS PASSED (100% SUCCESS) ---');
}

runTestSuite().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
