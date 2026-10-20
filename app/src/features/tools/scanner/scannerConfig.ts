/**
 * scannerConfig.ts
 * Central configuration mapping Document Scanner Studio tools (IDs 86–103)
 * to their consolidated workspace templates.
 */

export type ScannerWorkspaceType =
  | 'scanner_capture'  // Workspace 1 (86, 87, 88, 90, 91, 103)
  | 'scanner_enhance'  // Workspace 2 (89, 99)
  | 'scanner_ocr'      // Workspace 3 (92, 93, 94, 95)
  | 'scanner_export'   // Workspace 4 (96, 97, 98, 102)
  | 'scanner_manager'; // Workspace 5 (100, 101)

export interface ScannerToolConfig {
  id: number;
  name: string;
  workspace: ScannerWorkspaceType;
  defaultOperation: string;
  description: string;
  iconName: string;
  supportedFormats: string[];
}

export const SCANNER_TOOL_MAP: Record<number, ScannerToolConfig> = {
  // --- Workspace 1: Scanner Capture & Framing (86, 87, 88, 90, 91, 103) ---
  86: {
    id: 86,
    name: 'Smart Document Scanner',
    workspace: 'scanner_capture',
    defaultOperation: 'smart_scan',
    description: 'Capture documents with your camera, automatically detect edges, and flatten into high-resolution pages.',
    iconName: 'Scan',
    supportedFormats: ['Camera', '.jpg', '.jpeg', '.png'],
  },
  87: {
    id: 87,
    name: 'Perspective Correction',
    workspace: 'scanner_capture',
    defaultOperation: 'perspective_dewarp',
    description: 'Rectify angled and skewed document captures with 4-corner perspective dewarping.',
    iconName: 'Maximize2',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  88: {
    id: 88,
    name: 'Auto-Crop Scanner',
    workspace: 'scanner_capture',
    defaultOperation: 'auto_crop',
    description: 'Intelligently crop away table backgrounds, shadows, and margins around document borders.',
    iconName: 'Crop',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  90: {
    id: 90,
    name: 'Multi-Page Scanner',
    workspace: 'scanner_capture',
    defaultOperation: 'multi_page',
    description: 'Rapidly snap sequential document pages and bundle them into a unified multi-page document.',
    iconName: 'Layers',
    supportedFormats: ['Camera', '.jpg', '.jpeg', '.png'],
  },
  91: {
    id: 91,
    name: 'ID Card Scanner',
    workspace: 'scanner_capture',
    defaultOperation: 'id_card',
    description: 'Capture front and back sides of driver licenses and national ID cards onto a single side.',
    iconName: 'CreditCard',
    supportedFormats: ['Camera', '.jpg', '.png'],
  },
  103: {
    id: 103,
    name: 'Scan Quality Checker',
    workspace: 'scanner_capture',
    defaultOperation: 'quality_check',
    description: 'Verify document readability, check DPI resolution, and detect camera blur or glare.',
    iconName: 'CheckCircle2',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },

  // --- Workspace 2: Scanner Enhancement & Clean (89, 99) ---
  89: {
    id: 89,
    name: 'Scan Filters',
    workspace: 'scanner_enhance',
    defaultOperation: 'scan_filter',
    description: 'Apply high-contrast black & white, clean grayscale, color boost, or magic document filters.',
    iconName: 'Sliders',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  99: {
    id: 99,
    name: 'Document Cleanup',
    workspace: 'scanner_enhance',
    defaultOperation: 'cleanup',
    description: 'Whiten page backgrounds, erase hole punches, remove yellowing, and despeckle scanning artifacts.',
    iconName: 'Sparkles',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },

  // --- Workspace 3: Scanner OCR & Extraction (92, 93, 94, 95) ---
  92: {
    id: 92,
    name: 'Receipt Scanner',
    workspace: 'scanner_ocr',
    defaultOperation: 'receipt_ocr',
    description: 'Scan retail receipts, detect merchant name, date, subtotal, tax, and grand total.',
    iconName: 'Receipt',
    supportedFormats: ['Camera', '.jpg', '.png'],
  },
  93: {
    id: 93,
    name: 'Business Card Scanner',
    workspace: 'scanner_ocr',
    defaultOperation: 'business_card',
    description: 'Capture business cards and extract name, phone number, email address, and company fields.',
    iconName: 'UserCheck',
    supportedFormats: ['Camera', '.jpg', '.png'],
  },
  94: {
    id: 94,
    name: 'Handwriting OCR',
    workspace: 'scanner_ocr',
    defaultOperation: 'handwriting_ocr',
    description: 'Extract handwritten notes, signatures, and script annotations directly into editable digital text.',
    iconName: 'Edit3',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  95: {
    id: 95,
    name: 'OCR Language Selector',
    workspace: 'scanner_ocr',
    defaultOperation: 'ocr_language',
    description: 'Configure offline OCR recognition dictionaries: English/Latin, Devanagari, Cyrillic, CJK.',
    iconName: 'Globe',
    supportedFormats: ['System Dictionary'],
  },

  // --- Workspace 4: Scanner Export & Conversion (96, 97, 98, 102) ---
  96: {
    id: 96,
    name: 'Searchable PDF Maker',
    workspace: 'scanner_export',
    defaultOperation: 'searchable_pdf',
    description: 'Embed an invisible text recognition layer beneath scanned page images for full-text searchability.',
    iconName: 'FileSearch',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  97: {
    id: 97,
    name: 'Scan to Word',
    workspace: 'scanner_export',
    defaultOperation: 'scan_to_word',
    description: 'Convert paper document scans into editable formatted text and Microsoft Word (.docx) documents.',
    iconName: 'FileText',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  98: {
    id: 98,
    name: 'Scan to Excel',
    workspace: 'scanner_export',
    defaultOperation: 'scan_to_excel',
    description: 'Detect table grid lines and extract printed rows and columns directly into Excel CSV spreadsheets.',
    iconName: 'FileSpreadsheet',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  102: {
    id: 102,
    name: 'Batch Scan Export',
    workspace: 'scanner_export',
    defaultOperation: 'batch_export',
    description: 'Export all scanned pages concurrently into multi-page PDF, ZIP archive, or individual JPEGs.',
    iconName: 'Share2',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },

  // --- Workspace 5: Scanner Organization & History (100, 101) ---
  100: {
    id: 100,
    name: 'Scan History',
    workspace: 'scanner_manager',
    defaultOperation: 'scan_history',
    description: 'Browse, search, manage, and re-export previously digitized document scans from local sandbox storage.',
    iconName: 'History',
    supportedFormats: ['Local Storage'],
  },
  101: {
    id: 101,
    name: 'Document Naming Assistant',
    workspace: 'scanner_manager',
    defaultOperation: 'naming_assistant',
    description: 'Auto-generate standardized file names using document type, vendor, date, and invoice number tags.',
    iconName: 'Tag',
    supportedFormats: ['File Metadata'],
  },
};

/**
 * Returns configuration for a Document Scanner Studio tool ID (86–103).
 */
export function getScannerToolConfig(toolId: number): ScannerToolConfig | undefined {
  return SCANNER_TOOL_MAP[toolId];
}

/**
 * Checks if a tool ID belongs to Document Scanner Studio (86–103).
 */
export function isScannerStudioTool(toolId: number): boolean {
  return toolId >= 86 && toolId <= 103 && !!SCANNER_TOOL_MAP[toolId];
}

/**
 * Returns all tools belonging to a specific scanner workspace.
 */
export function getScannerToolsByWorkspace(workspace: ScannerWorkspaceType): ScannerToolConfig[] {
  return Object.values(SCANNER_TOOL_MAP).filter((t) => t.workspace === workspace);
}
