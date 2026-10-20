import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import {
  parseCsvToRows,
  rowsToCsv,
  csvToJson,
  jsonToCsv,
  cleanCsvRecords,
  markdownToHtml,
  htmlToMarkdown,
  xmlToJson,
  jsonToXml,
  formatXml,
  calculateDocStats,
  computeTextDiff,
  generateExcelXml,
  DocStats,
  DiffResult,
} from './OfficeHelpers';

export interface OfficeExecutionResult {
  uri?: string;
  name: string;
  content?: string;
  sizeBytes: number;
  format: string;
  stats?: DocStats;
  diff?: DiffResult;
  metadata?: Record<string, string>;
}

export class OfficeEngine {
  /**
   * Compiles Markdown text directly into a PDF document using pdf-lib on-device.
   */
  static async compileMarkdownToPdf(markdownText: string, title = 'Document'): Promise<OfficeExecutionResult> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // Standard A4 (points)
    const { width, height } = page.getSize();

    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Header bar
    page.drawRectangle({
      x: 0,
      y: height - 60,
      width,
      height: 60,
      color: rgb(0.38, 0.35, 1.0), // Accent Indigo #625BFF
    });

    page.drawText(title, {
      x: 40,
      y: height - 40,
      size: 18,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    const lines = markdownText.split(/\r?\n/);
    let cursorY = height - 90;
    const marginX = 40;
    const contentWidth = width - 80;

    for (let i = 0; i < lines.length && cursorY > 60; i++) {
      const line = lines[i];

      if (line.startsWith('# ')) {
        cursorY -= 10;
        page.drawText(line.slice(2), {
          x: marginX,
          y: cursorY,
          size: 16,
          font: fontBold,
          color: rgb(0.09, 0.1, 0.18),
        });
        cursorY -= 22;
      } else if (line.startsWith('## ')) {
        cursorY -= 8;
        page.drawText(line.slice(3), {
          x: marginX,
          y: cursorY,
          size: 13,
          font: fontBold,
          color: rgb(0.2, 0.22, 0.32),
        });
        cursorY -= 18;
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        page.drawCircle({
          x: marginX + 4,
          y: cursorY + 4,
          size: 2,
          color: rgb(0.38, 0.35, 1.0),
        });
        page.drawText(line.slice(2), {
          x: marginX + 16,
          y: cursorY,
          size: 10,
          font: fontRegular,
          color: rgb(0.15, 0.17, 0.25),
        });
        cursorY -= 16;
      } else if (line.trim().length > 0) {
        // Normal paragraph text
        const wrapped = line.slice(0, 95); // simple wrap
        page.drawText(wrapped, {
          x: marginX,
          y: cursorY,
          size: 10,
          font: fontRegular,
          color: rgb(0.15, 0.17, 0.25),
        });
        cursorY -= 15;
      } else {
        cursorY -= 8;
      }
    }

    // Footer
    page.drawText('Generated offline with Toolstrum Office Studio', {
      x: marginX,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.5, 0.55, 0.65),
    });

    const pdfBytes = await pdfDoc.save();
    const fileName = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    const targetUri = `${FileSystem.documentDirectory}${fileName}`;

    // Convert Uint8Array to base64 for writing via FileSystem
    let binary = '';
    const len = pdfBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(pdfBytes[i]);
    }
    const base64 = btoa(binary);

    await FileSystem.writeAsStringAsync(targetUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return {
      uri: targetUri,
      name: fileName,
      sizeBytes: pdfBytes.length,
      format: 'PDF',
      metadata: {
        'Pages': '1',
        'Compiler': 'Toolstrum Local PDF Engine',
        'Font': 'Helvetica',
        'Encoding': 'Standard Type 1',
      },
    };
  }

  /**
   * Generates a native Excel Spreadsheet XML file in the local sandbox.
   */
  static async exportToExcelXml(rows: string[][], fileName = 'Spreadsheet.xls'): Promise<OfficeExecutionResult> {
    const xmlContent = generateExcelXml(rows, 'DataSheet');
    const targetUri = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(targetUri, xmlContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const info = await FileSystem.getInfoAsync(targetUri);
    const size = info.exists && 'size' in info ? info.size : xmlContent.length;

    return {
      uri: targetUri,
      name: fileName,
      content: xmlContent,
      sizeBytes: size,
      format: 'XLS',
      metadata: {
        'Rows': `${rows.length}`,
        'Columns': `${rows[0]?.length || 0}`,
        'Format': 'Microsoft Excel XML Spreadsheet',
      },
    };
  }

  /**
   * Saves text content to sandbox file system.
   */
  static async saveTextFile(content: string, fileName: string, format = 'TXT'): Promise<OfficeExecutionResult> {
    const targetUri = `${FileSystem.documentDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(targetUri, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const stats = calculateDocStats(content);

    return {
      uri: targetUri,
      name: fileName,
      content,
      sizeBytes: content.length,
      format,
      stats,
    };
  }

  /**
   * Shares file via system sheet if available.
   */
  static async shareFile(uri: string): Promise<boolean> {
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable && uri) {
      await Sharing.shareAsync(uri);
      return true;
    }
    return false;
  }
}
