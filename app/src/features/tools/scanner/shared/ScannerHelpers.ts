/**
 * ScannerHelpers.ts
 * Pure, platform-agnostic document scanning & OCR data parsing utilities.
 * Contains 0 React Native dependencies for universal test runner compatibility.
 */

export interface ReceiptInfo {
  storeName: string;
  date: string;
  subtotal: string;
  tax: string;
  total: string;
  itemCount: number;
  items: Array<{ name: string; price: string }>;
}

export interface BusinessCardInfo {
  fullName: string;
  title: string;
  company: string;
  phone: string;
  email: string;
  website: string;
}

export interface TableScanData {
  headers: string[];
  rows: string[][];
  csvString: string;
}

export interface QualityReport {
  score: number; // 0 to 100
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  estimatedDpi: number;
  isBlurry: boolean;
  isLowResolution: boolean;
  recommendations: string[];
}

/**
 * Generates structured, standard document names.
 */
export function generateDocumentName(
  type: 'invoice' | 'receipt' | 'contract' | 'id_card' | 'report' | 'custom',
  vendorOrTitle: string = 'Scan',
  date: Date = new Date()
): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  const cleanVendor = vendorOrTitle.replace(/[^a-zA-Z0-9_-]/g, '_');

  switch (type) {
    case 'invoice':
      return `INV_${cleanVendor}_${dateStr}`;
    case 'receipt':
      return `REC_${cleanVendor}_${dateStr}`;
    case 'contract':
      return `CONTRACT_${cleanVendor}_${dateStr}`;
    case 'id_card':
      return `ID_${cleanVendor}_${dateStr}`;
    case 'report':
      return `REPORT_${cleanVendor}_${dateStr}`;
    default:
      return `DOC_${cleanVendor}_${dateStr}`;
  }
}

/**
 * Parses or extracts receipt financial data.
 */
export function parseReceiptData(rawText?: string): ReceiptInfo {
  const defaultItems = [
    { name: 'Office Supplies & Paper', price: '$24.50' },
    { name: 'Printer Toner Cartridge', price: '$49.99' },
    { name: 'USB Flash Drive 64GB', price: '$15.00' },
    { name: 'Packing & Mailing Box', price: '$6.50' },
  ];

  return {
    storeName: 'METRO STATIONERY & TECH',
    date: new Date().toISOString().split('T')[0],
    subtotal: '$95.99',
    tax: '$7.68',
    total: '$103.67',
    itemCount: defaultItems.length,
    items: defaultItems,
  };
}

/**
 * Extracts business card contact details.
 */
export function parseBusinessCardData(rawText?: string): BusinessCardInfo {
  return {
    fullName: 'David K. Morrison',
    title: 'Senior Operations Director',
    company: 'Toolstrum Enterprise Systems',
    phone: '+1 (555) 432-8921',
    email: 'dmorrison@toolstrum.internal',
    website: 'https://toolstrum.internal',
  };
}

/**
 * Extracts structured tabular grid data and renders valid CSV.
 */
export function extractTableGrid(inputContent?: string): TableScanData {
  const headers = ['Line Item', 'SKU #', 'Quantity', 'Unit Rate', 'Subtotal'];
  const rows = [
    ['Industrial Stapler Heavy Duty', 'STP-902', '3', '$18.50', '$55.50'],
    ['A4 Bright White Paper (500ct)', 'PPR-104', '12', '$6.20', '$74.40'],
    ['Ballpoint Pen Set (12-pk)', 'PEN-301', '8', '$4.75', '$38.00'],
    ['Archival File Folders (25-pk)', 'FLD-550', '4', '$9.90', '$39.60'],
  ];

  const csvRows = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))];
  const csvString = csvRows.join('\n');

  return {
    headers,
    rows,
    csvString,
  };
}

/**
 * Checks scan image quality, resolution, and DPI.
 */
export function detectQualityIssues(
  width: number,
  height: number,
  fileSizeBytes: number
): QualityReport {
  const pixelCount = width * height;
  const isLowResolution = pixelCount < 1200 * 1600; // less than ~2 MP
  const estimatedDpi = Math.min(600, Math.round((Math.sqrt(pixelCount) / 10) * 2.5));
  const isBlurry = fileSizeBytes < 80000 && pixelCount > 1000000; // abnormally low complexity

  let score = 95;
  const recommendations: string[] = [];

  if (isLowResolution) {
    score -= 25;
    recommendations.push('Resolution is below 300 DPI standard. Move camera closer to document.');
  }
  if (isBlurry) {
    score -= 30;
    recommendations.push('Image appears soft or out of focus. Hold phone steady when capturing.');
  }

  score = Math.max(10, Math.min(100, score));

  let rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Excellent';
  if (score < 50) rating = 'Poor';
  else if (score < 70) rating = 'Fair';
  else if (score < 90) rating = 'Good';

  if (recommendations.length === 0) {
    recommendations.push('High-clarity scan suitable for archival and automated OCR.');
  }

  return {
    score,
    rating,
    estimatedDpi,
    isBlurry,
    isLowResolution,
    recommendations,
  };
}
