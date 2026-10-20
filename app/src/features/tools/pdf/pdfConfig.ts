/**
 * pdfConfig.ts
 * Central registry configuration mapping PDF Studio tools (IDs 1–48)
 * to their consolidated workspace templates.
 */

export type PdfWorkspaceType =
  | 'pdf_creation'      // Workspace A (1, 2, 3, 8, 31, 32, 33, 34, 35)
  | 'pdf_pages'         // Workspace B (4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 40, 45)
  | 'pdf_optimization'  // Workspace C (6, 17, 18, 19, 20, 21, 39, 41, 44)
  | 'pdf_viewer'        // Workspace D (23, 24, 25, 26)
  | 'pdf_conversion'    // Workspace E (7, 27, 28, 29, 30, 36, 42, 43)
  | 'pdf_inspection'    // Workspace F (22, 37, 38, 46, 48)
  | 'pdf_batch';        // Workspace G (47)

export interface PdfToolConfig {
  id: number;
  name: string;
  workspace: PdfWorkspaceType;
  defaultOperation: string;
  description: string;
  iconName: string;
  supportedFormats: string[];
}

export const PDF_TOOL_MAP: Record<number, PdfToolConfig> = {
  // --- Workspace A: PDF Creation (1, 2, 3, 8, 31, 32, 33, 34, 35) ---
  1: {
    id: 1,
    name: 'Images to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'images_to_pdf',
    description: 'Convert JPG, PNG, and HEIC photos into a unified, high-resolution PDF document.',
    iconName: 'Image',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.heic', '.webp'],
  },
  2: {
    id: 2,
    name: 'Text to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'text_to_pdf',
    description: 'Convert raw text, formatted notes, or Markdown into standard paginated PDF files.',
    iconName: 'FileText',
    supportedFormats: ['.txt', '.md', 'Raw Text'],
  },
  3: {
    id: 3,
    name: 'Scan to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'scan_to_pdf',
    description: 'Capture documents with your camera and assemble them into a processed PDF.',
    iconName: 'Scan',
    supportedFormats: ['Camera', '.jpg', '.png'],
  },
  8: {
    id: 8,
    name: 'Images to JPG/PNG PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'images_to_pdf_formats',
    description: 'Create standardized PDFs from multiple image formats with page geometry controls.',
    iconName: 'Images',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.bmp'],
  },
  31: {
    id: 31,
    name: 'Word to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'word_to_pdf',
    description: 'Convert Microsoft Word (.docx, .doc) files into clean, shareable PDF documents.',
    iconName: 'FileText',
    supportedFormats: ['.docx', '.doc'],
  },
  32: {
    id: 32,
    name: 'Excel to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'excel_to_pdf',
    description: 'Convert Excel spreadsheets (.xlsx, .xls) and CSV sheets into paginated PDF tables.',
    iconName: 'FileSpreadsheet',
    supportedFormats: ['.xlsx', '.xls', '.csv'],
  },
  33: {
    id: 33,
    name: 'PowerPoint to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'powerpoint_to_pdf',
    description: 'Convert presentation slide decks (.pptx, .ppt) into sequential PDF pages.',
    iconName: 'Presentation',
    supportedFormats: ['.pptx', '.ppt'],
  },
  34: {
    id: 34,
    name: 'HTML to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'html_to_pdf',
    description: 'Render HTML snippets, styling, and templates directly into formatted PDF documents.',
    iconName: 'Code',
    supportedFormats: ['.html', '.htm', 'HTML Source'],
  },
  35: {
    id: 35,
    name: 'Webpage to PDF',
    workspace: 'pdf_creation',
    defaultOperation: 'webpage_to_pdf',
    description: 'Capture web articles and URLs into offline, readable PDF documents.',
    iconName: 'Globe',
    supportedFormats: ['URL', '.html'],
  },

  // --- Workspace B: PDF Page Manager (4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 40, 45) ---
  4: {
    id: 4,
    name: 'Merge PDF',
    workspace: 'pdf_pages',
    defaultOperation: 'merge',
    description: 'Combine multiple independent PDF files into a single continuous document.',
    iconName: 'Layers',
    supportedFormats: ['.pdf'],
  },
  5: {
    id: 5,
    name: 'Split PDF',
    workspace: 'pdf_pages',
    defaultOperation: 'split',
    description: 'Separate a PDF document into individual pages or custom page ranges.',
    iconName: 'Scissors',
    supportedFormats: ['.pdf'],
  },
  9: {
    id: 9,
    name: 'Rotate PDF',
    workspace: 'pdf_pages',
    defaultOperation: 'rotate',
    description: 'Rotate PDF orientation by 90°, 180°, or 270° across all or selected pages.',
    iconName: 'RotateCw',
    supportedFormats: ['.pdf'],
  },
  10: {
    id: 10,
    name: 'Reorder PDF Pages',
    workspace: 'pdf_pages',
    defaultOperation: 'reorder',
    description: 'Rearrange and resequence pages within a PDF document effortlessly.',
    iconName: 'ArrowUpDown',
    supportedFormats: ['.pdf'],
  },
  11: {
    id: 11,
    name: 'Delete PDF Pages',
    workspace: 'pdf_pages',
    defaultOperation: 'delete',
    description: 'Select and remove unwanted pages from any PDF document safely.',
    iconName: 'Trash2',
    supportedFormats: ['.pdf'],
  },
  12: {
    id: 12,
    name: 'Extract PDF Pages',
    workspace: 'pdf_pages',
    defaultOperation: 'extract',
    description: 'Extract specific pages or page intervals into a new standalone PDF.',
    iconName: 'ExternalLink',
    supportedFormats: ['.pdf'],
  },
  13: {
    id: 13,
    name: 'Duplicate PDF Pages',
    workspace: 'pdf_pages',
    defaultOperation: 'duplicate',
    description: 'Clone specific pages within a PDF to duplicate templates or forms.',
    iconName: 'Copy',
    supportedFormats: ['.pdf'],
  },
  14: {
    id: 14,
    name: 'Add PDF Pages',
    workspace: 'pdf_pages',
    defaultOperation: 'add_pages',
    description: 'Insert blank pages or append additional pages from other PDF files.',
    iconName: 'PlusCircle',
    supportedFormats: ['.pdf'],
  },
  15: {
    id: 15,
    name: 'Crop PDF',
    workspace: 'pdf_pages',
    defaultOperation: 'crop',
    description: 'Trim outer margins and crop whitespace or bleed areas across PDF pages.',
    iconName: 'Crop',
    supportedFormats: ['.pdf'],
  },
  16: {
    id: 16,
    name: 'Resize PDF Pages',
    workspace: 'pdf_pages',
    defaultOperation: 'resize',
    description: 'Change page dimensions (A4, Letter, A3, Legal) with proportional scaling.',
    iconName: 'Maximize2',
    supportedFormats: ['.pdf'],
  },
  40: {
    id: 40,
    name: 'PDF Booklet Maker',
    workspace: 'pdf_pages',
    defaultOperation: 'booklet',
    description: 'Reorder and impose pages in 2-up sheet format for folding into booklets.',
    iconName: 'BookOpen',
    supportedFormats: ['.pdf'],
  },
  45: {
    id: 45,
    name: 'PDF Page Labels',
    workspace: 'pdf_pages',
    defaultOperation: 'page_labels',
    description: 'Configure roman, arabic, or custom prefixed page numbers and running headers.',
    iconName: 'Tag',
    supportedFormats: ['.pdf'],
  },

  // --- Workspace C: PDF Optimization & Security (6, 17, 18, 19, 20, 21, 39, 41, 44) ---
  6: {
    id: 6,
    name: 'Compress PDF',
    workspace: 'pdf_optimization',
    defaultOperation: 'compress',
    description: 'Reduce PDF file size by optimizing embedded stream fonts and asset objects.',
    iconName: 'Minimize2',
    supportedFormats: ['.pdf'],
  },
  17: {
    id: 17,
    name: 'Add Page Numbers',
    workspace: 'pdf_optimization',
    defaultOperation: 'page_numbers',
    description: 'Stamp customizable page numbers (Page X of Y) at top or bottom positions.',
    iconName: 'Hash',
    supportedFormats: ['.pdf'],
  },
  18: {
    id: 18,
    name: 'Add Watermark',
    workspace: 'pdf_optimization',
    defaultOperation: 'watermark',
    description: 'Overlay diagonal or centered security watermarks, confidentiality stamps, or logos.',
    iconName: 'Stamp',
    supportedFormats: ['.pdf'],
  },
  19: {
    id: 19,
    name: 'Protect PDF',
    workspace: 'pdf_optimization',
    defaultOperation: 'protect',
    description: 'Encrypt your PDF with password protection to restrict unauthorized access.',
    iconName: 'Lock',
    supportedFormats: ['.pdf'],
  },
  20: {
    id: 20,
    name: 'Unlock PDF',
    workspace: 'pdf_optimization',
    defaultOperation: 'unlock',
    description: 'Remove password restrictions and decrypt PDFs when authorized credentials are provided.',
    iconName: 'Unlock',
    supportedFormats: ['.pdf'],
  },
  21: {
    id: 21,
    name: 'PDF Permissions Editor',
    workspace: 'pdf_optimization',
    defaultOperation: 'permissions',
    description: 'Configure document security flags for printing, text copying, and modifications.',
    iconName: 'ShieldAlert',
    supportedFormats: ['.pdf'],
  },
  39: {
    id: 39,
    name: 'PDF Flatten',
    workspace: 'pdf_optimization',
    defaultOperation: 'flatten',
    description: 'Flatten interactive form fields and vector annotations into immutable page content.',
    iconName: 'CheckSquare',
    supportedFormats: ['.pdf'],
  },
  41: {
    id: 41,
    name: 'PDF Print Optimizer',
    workspace: 'pdf_optimization',
    defaultOperation: 'print_optimizer',
    description: 'Prepare documents for print shops by standardizing margins, color, and flattening.',
    iconName: 'Printer',
    supportedFormats: ['.pdf'],
  },
  44: {
    id: 44,
    name: 'PDF Redaction',
    workspace: 'pdf_optimization',
    defaultOperation: 'redact',
    description: 'Permanently sanitize and redact confidential text blocks and metadata from documents.',
    iconName: 'EyeOff',
    supportedFormats: ['.pdf'],
  },

  // --- Workspace D: PDF Viewer & Editing (23, 24, 25, 26) ---
  23: {
    id: 23,
    name: 'PDF Viewer',
    workspace: 'pdf_viewer',
    defaultOperation: 'view',
    description: 'Fast, native offline document reader with page navigation and zoom controls.',
    iconName: 'Eye',
    supportedFormats: ['.pdf'],
  },
  24: {
    id: 24,
    name: 'PDF Annotator',
    workspace: 'pdf_viewer',
    defaultOperation: 'annotate',
    description: 'Add text comments, callout shapes, underlines, and highlights directly to pages.',
    iconName: 'Edit3',
    supportedFormats: ['.pdf'],
  },
  25: {
    id: 25,
    name: 'PDF Signer',
    workspace: 'pdf_viewer',
    defaultOperation: 'sign',
    description: 'Sign contracts and documents using typed, drawn, or stamped visual signatures.',
    iconName: 'PenTool',
    supportedFormats: ['.pdf'],
  },
  26: {
    id: 26,
    name: 'Fill PDF Forms',
    workspace: 'pdf_viewer',
    defaultOperation: 'form_fill',
    description: 'Complete AcroForm interactive input fields, check boxes, and text areas.',
    iconName: 'CheckSquare',
    supportedFormats: ['.pdf'],
  },

  // --- Workspace E: PDF Conversion & Extraction (7, 27, 28, 29, 30, 36, 42, 43) ---
  7: {
    id: 7,
    name: 'PDF to Images',
    workspace: 'pdf_conversion',
    defaultOperation: 'pdf_to_images',
    description: 'Extract PDF document pages as high-resolution PNG or JPG image files.',
    iconName: 'Image',
    supportedFormats: ['.pdf'],
  },
  27: {
    id: 27,
    name: 'PDF to Text',
    workspace: 'pdf_conversion',
    defaultOperation: 'pdf_to_text',
    description: 'Extract all textual streams, paragraphs, and raw unicode characters from a PDF.',
    iconName: 'FileText',
    supportedFormats: ['.pdf'],
  },
  28: {
    id: 28,
    name: 'PDF to Word',
    workspace: 'pdf_conversion',
    defaultOperation: 'pdf_to_word',
    description: 'Convert PDF content into editable Microsoft Word (.docx) document format.',
    iconName: 'FileText',
    supportedFormats: ['.pdf'],
  },
  29: {
    id: 29,
    name: 'PDF to Excel',
    workspace: 'pdf_conversion',
    defaultOperation: 'pdf_to_excel',
    description: 'Detect and extract tabular columns and data rows from PDF into Excel / CSV format.',
    iconName: 'FileSpreadsheet',
    supportedFormats: ['.pdf'],
  },
  30: {
    id: 30,
    name: 'PDF to PowerPoint',
    workspace: 'pdf_conversion',
    defaultOperation: 'pdf_to_powerpoint',
    description: 'Transform PDF pages into a presentation slide deck (.pptx) layout.',
    iconName: 'Presentation',
    supportedFormats: ['.pdf'],
  },
  36: {
    id: 36,
    name: 'PDF OCR',
    workspace: 'pdf_conversion',
    defaultOperation: 'ocr',
    description: 'Recognize text characters from scanned documents and generate searchable content.',
    iconName: 'Search',
    supportedFormats: ['.pdf'],
  },
  42: {
    id: 42,
    name: 'PDF to Markdown',
    workspace: 'pdf_conversion',
    defaultOperation: 'pdf_to_markdown',
    description: 'Convert PDF text headings, bullet lists, and paragraphs into clean Markdown (.md).',
    iconName: 'FileCode',
    supportedFormats: ['.pdf'],
  },
  43: {
    id: 43,
    name: 'PDF to JSON',
    workspace: 'pdf_conversion',
    defaultOperation: 'pdf_to_json',
    description: 'Extract document structure, metadata, text blocks, and page metrics into JSON.',
    iconName: 'Code',
    supportedFormats: ['.pdf'],
  },

  // --- Workspace F: PDF Inspection & Repair (22, 37, 38, 46, 48) ---
  22: {
    id: 22,
    name: 'PDF Metadata Editor',
    workspace: 'pdf_inspection',
    defaultOperation: 'metadata',
    description: 'Inspect and edit document Title, Author, Subject, Keywords, and Creator properties.',
    iconName: 'Info',
    supportedFormats: ['.pdf'],
  },
  37: {
    id: 37,
    name: 'PDF Compare',
    workspace: 'pdf_inspection',
    defaultOperation: 'compare',
    description: 'Compare two PDF documents side by side to highlight visual and text differences.',
    iconName: 'GitCompare',
    supportedFormats: ['.pdf'],
  },
  38: {
    id: 38,
    name: 'PDF Repair',
    workspace: 'pdf_inspection',
    defaultOperation: 'repair',
    description: 'Recover unreadable or damaged PDF files by reconstructing damaged xref structures.',
    iconName: 'Wrench',
    supportedFormats: ['.pdf'],
  },
  46: {
    id: 46,
    name: 'PDF File Inspector',
    workspace: 'pdf_inspection',
    defaultOperation: 'inspect',
    description: 'Deep technical analysis of PDF versions, embedded fonts, objects, and stream sizes.',
    iconName: 'Search',
    supportedFormats: ['.pdf'],
  },
  48: {
    id: 48,
    name: 'PDF Compare & Merge',
    workspace: 'pdf_inspection',
    defaultOperation: 'compare_merge',
    description: 'Audit differences between two revisions and merge non-duplicate pages into one file.',
    iconName: 'GitMerge',
    supportedFormats: ['.pdf'],
  },

  // --- Workspace G: PDF Batch Operations (47) ---
  47: {
    id: 47,
    name: 'PDF Batch Processor',
    workspace: 'pdf_batch',
    defaultOperation: 'batch',
    description: 'Process queues of PDF documents in bulk (compress, watermark, re-index, or flatten).',
    iconName: 'Layers',
    supportedFormats: ['.pdf'],
  },
};

/**
 * Returns configuration for a given PDF Studio tool ID (1–48).
 */
export function getPdfToolConfig(toolId: number): PdfToolConfig | undefined {
  return PDF_TOOL_MAP[toolId];
}

/**
 * Checks whether the given tool ID belongs to PDF Studio (1–48).
 */
export function isPdfStudioTool(toolId: number): boolean {
  return toolId >= 1 && toolId <= 48 && PDF_TOOL_MAP[toolId] !== undefined;
}

/**
 * Returns all tool IDs assigned to a specific PDF workspace.
 */
export function getToolsForWorkspace(workspace: PdfWorkspaceType): PdfToolConfig[] {
  return Object.values(PDF_TOOL_MAP).filter((tool) => tool.workspace === workspace);
}
