/**
 * PdfEngine.ts
 * Core PDF processing engine powered by pdf-lib.
 * Handles high-fidelity, on-device, offline manipulation of PDF documents.
 */

import {
  PDFDocument,
  StandardFonts,
  rgb,
  degrees,
  PageSizes,
  PDFPage,
} from 'pdf-lib';
import * as FileSystem from 'expo-file-system/legacy';

export interface PdfMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: Date;
  modificationDate?: Date;
  pageCount: number;
}

export interface PdfPageInfo {
  index: number;
  width: number;
  height: number;
  rotation: number;
}

/**
 * Loads a PDFDocument from a local file URI (base64).
 */
export async function loadPdfFromUri(uri: string): Promise<PDFDocument> {
  const b64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return await PDFDocument.load(b64, { ignoreEncryption: true });
}

/**
 * Saves a PDFDocument to the local sandbox (Documents/Cache) and returns filename, URI, and size.
 */
export async function savePdfToSandbox(
  pdfDoc: PDFDocument,
  preferredName: string
): Promise<{ name: string; uri: string; size: number }> {
  const base64 = await pdfDoc.saveAsBase64();
  const cleanName = preferredName.endsWith('.pdf') ? preferredName : `${preferredName}.pdf`;
  const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  const targetUri = `${docDir}${Date.now()}_${cleanName}`;

  await FileSystem.writeAsStringAsync(targetUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = await FileSystem.getInfoAsync(targetUri);
  return {
    name: cleanName,
    uri: targetUri,
    size: (info.exists && info.size) ? info.size : Math.round((base64.length * 3) / 4),
  };
}

/**
 * Creates a PDF from a list of image file URIs.
 */
export async function createPdfFromImages(
  images: Array<{ uri: string; name: string }>,
  options: {
    pageSize?: 'A4' | 'Letter' | 'Original';
    orientation?: 'portrait' | 'landscape' | 'auto';
    margin?: number;
  } = {}
): Promise<PDFDocument> {
  const { pageSize = 'A4', orientation = 'portrait', margin = 16 } = options;
  const pdfDoc = await PDFDocument.create();

  for (const img of images) {
    const b64 = await FileSystem.readAsStringAsync(img.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const isPng = img.name.toLowerCase().endsWith('.png') || img.uri.toLowerCase().endsWith('.png');
    let embeddedImg;
    try {
      embeddedImg = isPng ? await pdfDoc.embedPng(b64) : await pdfDoc.embedJpg(b64);
    } catch {
      // Fallback
      embeddedImg = await pdfDoc.embedJpg(b64);
    }

    const imgDims = embeddedImg.scale(1);
    let pageW: number;
    let pageH: number;

    if (pageSize === 'Original') {
      pageW = imgDims.width + margin * 2;
      pageH = imgDims.height + margin * 2;
    } else if (pageSize === 'Letter') {
      pageW = PageSizes.Letter[0];
      pageH = PageSizes.Letter[1];
    } else {
      pageW = PageSizes.A4[0];
      pageH = PageSizes.A4[1];
    }

    if (orientation === 'landscape' || (orientation === 'auto' && imgDims.width > imgDims.height)) {
      if (pageW < pageH) {
        const temp = pageW;
        pageW = pageH;
        pageH = temp;
      }
    }

    const page = pdfDoc.addPage([pageW, pageH]);
    const maxW = pageW - margin * 2;
    const maxH = pageH - margin * 2;
    const scale = Math.min(maxW / imgDims.width, maxH / imgDims.height, 1);
    const drawW = imgDims.width * scale;
    const drawH = imgDims.height * scale;
    const drawX = margin + (maxW - drawW) / 2;
    const drawY = margin + (maxH - drawH) / 2;

    page.drawImage(embeddedImg, {
      x: drawX,
      y: drawY,
      width: drawW,
      height: drawH,
    });
  }

  return pdfDoc;
}

/**
 * Creates a paginated PDF document from plain or formatted text.
 */
export async function createPdfFromText(
  text: string,
  options: {
    fontSize?: number;
    lineHeight?: number;
    margin?: number;
    title?: string;
  } = {}
): Promise<PDFDocument> {
  const { fontSize = 12, lineHeight = 16, margin = 40, title } = options;
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const [pageW, pageH] = PageSizes.A4;
  const contentW = pageW - margin * 2;
  const maxLinesPerPage = Math.floor((pageH - margin * 2 - (title ? 40 : 0)) / lineHeight);

  const rawLines = text.split('\n');
  const wrappedLines: string[] = [];

  for (const rawLine of rawLines) {
    if (!rawLine.trim()) {
      wrappedLines.push('');
      continue;
    }
    const words = rawLine.split(' ');
    let currentLine = '';
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > contentW && currentLine) {
        wrappedLines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) wrappedLines.push(currentLine);
  }

  let lineIdx = 0;
  while (lineIdx < wrappedLines.length || lineIdx === 0) {
    const page = pdfDoc.addPage([pageW, pageH]);
    let currentY = pageH - margin;

    if (title && lineIdx === 0) {
      page.drawText(title, {
        x: margin,
        y: currentY - 14,
        size: 18,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.18),
      });
      currentY -= 40;
    }

    const linesThisPage = wrappedLines.slice(lineIdx, lineIdx + maxLinesPerPage);
    for (const l of linesThisPage) {
      if (l) {
        page.drawText(l, {
          x: margin,
          y: currentY,
          size: fontSize,
          font,
          color: rgb(0.15, 0.15, 0.2),
        });
      }
      currentY -= lineHeight;
    }

    lineIdx += maxLinesPerPage;
    if (lineIdx >= wrappedLines.length) break;
  }

  return pdfDoc;
}

/**
 * Merges multiple PDF documents into a single document.
 */
export async function mergePdfs(uris: string[]): Promise<PDFDocument> {
  const mergedPdf = await PDFDocument.create();

  for (const uri of uris) {
    const srcDoc = await loadPdfFromUri(uri);
    const copiedPages = await mergedPdf.copyPages(srcDoc, srcDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf;
}

/**
 * Rotates pages in a PDF document.
 */
export async function rotatePdfPages(
  pdfDoc: PDFDocument,
  rotationAngle: number, // 90, 180, 270
  pageIndices?: number[] // If omitted, rotates all pages
): Promise<PDFDocument> {
  const targetIndices = pageIndices || pdfDoc.getPageIndices();
  for (const idx of targetIndices) {
    if (idx >= 0 && idx < pdfDoc.getPageCount()) {
      const page = pdfDoc.getPage(idx);
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + rotationAngle) % 360));
    }
  }
  return pdfDoc;
}

/**
 * Adds custom watermark text to all pages in a PDF document.
 */
export async function addWatermarkToPdf(
  pdfDoc: PDFDocument,
  watermarkText: string,
  options: {
    opacity?: number;
    fontSize?: number;
    color?: { r: number; g: number; b: number };
  } = {}
): Promise<PDFDocument> {
  const { opacity = 0.25, fontSize = 48, color = { r: 0.6, g: 0.1, b: 0.1 } } = options;
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const textW = font.widthOfTextAtSize(watermarkText, fontSize);
  const textH = font.heightAtSize(fontSize);

  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    const x = (width - textW) / 2;
    const y = (height - textH) / 2;

    page.drawText(watermarkText, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(color.r, color.g, color.b),
      opacity,
      rotate: degrees(45),
    });
  }

  return pdfDoc;
}

/**
 * Adds page numbering ("Page X of Y") to all pages.
 */
export async function addPageNumbersToPdf(
  pdfDoc: PDFDocument,
  options: {
    format?: 'Page X of Y' | 'X of Y' | 'X';
    position?: 'bottom-center' | 'bottom-right' | 'top-right';
    fontSize?: number;
  } = {}
): Promise<PDFDocument> {
  const { format = 'Page X of Y', position = 'bottom-center', fontSize = 10 } = options;
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const total = pdfDoc.getPageCount();

  const pages = pdfDoc.getPages();
  pages.forEach((page, idx) => {
    const pageNum = idx + 1;
    let label = `${pageNum}`;
    if (format === 'Page X of Y') label = `Page ${pageNum} of ${total}`;
    if (format === 'X of Y') label = `${pageNum} of ${total}`;

    const textW = font.widthOfTextAtSize(label, fontSize);
    const { width, height } = page.getSize();

    let x = (width - textW) / 2;
    let y = 20;

    if (position === 'bottom-right') {
      x = width - textW - 30;
      y = 20;
    } else if (position === 'top-right') {
      x = width - textW - 30;
      y = height - 25;
    }

    page.drawText(label, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
  });

  return pdfDoc;
}

/**
 * Reads document metadata from a PDF.
 */
export function getPdfMetadata(pdfDoc: PDFDocument): PdfMetadata {
  return {
    title: pdfDoc.getTitle(),
    author: pdfDoc.getAuthor(),
    subject: pdfDoc.getSubject(),
    keywords: pdfDoc.getKeywords()?.split(' ') || [],
    creator: pdfDoc.getCreator(),
    producer: pdfDoc.getProducer(),
    creationDate: pdfDoc.getCreationDate(),
    modificationDate: pdfDoc.getModificationDate(),
    pageCount: pdfDoc.getPageCount(),
  };
}

/**
 * Updates document metadata in a PDF.
 */
export function updatePdfMetadata(
  pdfDoc: PDFDocument,
  metadata: Partial<PdfMetadata>
): PDFDocument {
  if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
  if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords);
  if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);
  if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);
  pdfDoc.setModificationDate(new Date());
  return pdfDoc;
}

/**
 * Repairs a PDF by re-serializing its structure cleanly.
 */
export async function repairPdfDoc(uri: string): Promise<PDFDocument> {
  const b64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  // Load ignoring encryption and errors, re-create fresh PDF and copy pages
  const src = await PDFDocument.load(b64, { ignoreEncryption: true });
  const cleanDoc = await PDFDocument.create();
  const pages = await cleanDoc.copyPages(src, src.getPageIndices());
  pages.forEach((p) => cleanDoc.addPage(p));
  return cleanDoc;
}
