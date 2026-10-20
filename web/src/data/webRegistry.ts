import { ToolDefinition, StudioDefinition } from '../types';
import { StudioTheme } from '../constants/tokens';

export const STUDIOS: StudioDefinition[] = [
  { id: 'pdf', name: 'PDF Studio', toolRange: '1–48', icon: 'FileText', description: 'PDF utilities processed 100% offline on your device.', accent: StudioTheme.pdf.accent, surface: StudioTheme.pdf.surface },
  { id: 'image', name: 'Image Studio', toolRange: '49–85', icon: 'Image', description: 'Image utilities processed 100% offline on your device.', accent: StudioTheme.image.accent, surface: StudioTheme.image.surface },
  { id: 'scanner', name: 'Document Scanner', toolRange: '86–103', icon: 'Scan', description: 'Document Scanner utilities processed 100% offline on your device.', accent: StudioTheme.scanner.accent, surface: StudioTheme.scanner.surface },
  { id: 'video', name: 'Video Studio', toolRange: '104–128', icon: 'Video', description: 'Video utilities processed 100% offline on your device.', accent: StudioTheme.video.accent, surface: StudioTheme.video.surface },
  { id: 'audio', name: 'Audio Studio', toolRange: '129–153', icon: 'Volume2', description: 'Audio utilities processed 100% offline on your device.', accent: StudioTheme.audio.accent, surface: StudioTheme.audio.surface },
  { id: 'office', name: 'Office & Documents', toolRange: '154–180', icon: 'FileSpreadsheet', description: 'Office and document utilities processed 100% offline on your device.', accent: StudioTheme.office.accent, surface: StudioTheme.office.surface },
  { id: 'archive', name: 'Archive & Files', toolRange: '181–204', icon: 'Archive', description: 'Archive and file utilities processed 100% offline on your device.', accent: StudioTheme.archive.accent, surface: StudioTheme.archive.surface },
  { id: 'text', name: 'Text & Writing', toolRange: '205–243', icon: 'Type', description: 'Text and writing utilities processed 100% offline on your device.', accent: StudioTheme.text.accent, surface: StudioTheme.text.surface },
  { id: 'developer', name: 'Developer Tools', toolRange: '244–300', icon: 'Code', description: 'Developer utilities processed 100% offline on your device.', accent: StudioTheme.developer.accent, surface: StudioTheme.developer.surface },
  { id: 'calculators', name: 'Calculators', toolRange: '301–350', icon: 'Calculator', description: 'Financial and math calculators processed 100% offline on your device.', accent: StudioTheme.calculators.accent, surface: StudioTheme.calculators.surface },
  { id: 'qr_security', name: 'QR, Barcode & Security', toolRange: '351–375', icon: 'QrCode', description: 'QR, barcode, and security utilities processed 100% offline on your device.', accent: StudioTheme.qr_security.accent, surface: StudioTheme.qr_security.surface },
  { id: 'web', name: 'Web & Internet', toolRange: '376–400', icon: 'Globe', description: 'Web and URL utilities processed 100% offline on your device.', accent: StudioTheme.web.accent, surface: StudioTheme.web.surface },
  { id: 'ai', name: 'AI Studio', toolRange: '401–416', icon: 'Sparkles', description: 'Smart assistant utilities processed 100% offline on your device.', accent: StudioTheme.ai.accent, surface: StudioTheme.ai.surface, isComingSoon: true },
  { id: 'productivity', name: 'Productivity & Education', toolRange: '417–450', icon: 'CheckSquare', description: 'Productivity utilities processed 100% offline on your device.', accent: StudioTheme.productivity.accent, surface: StudioTheme.productivity.surface },
  { id: 'accessibility', name: 'Accessibility & Display', toolRange: '451–470', icon: 'Eye', description: 'Display and accessibility utilities processed 100% offline on your device.', accent: StudioTheme.accessibility.accent, surface: StudioTheme.accessibility.surface },
  { id: 'advanced', name: 'Advanced & Experimental', toolRange: '471–500', icon: 'Cpu', description: 'Advanced utilities processed 100% offline on your device.', accent: StudioTheme.advanced.accent, surface: StudioTheme.advanced.surface }
];

export const WEB_TOOLS: ToolDefinition[] = [
  {
    "id": 1,
    "name": "Images to PDF",
    "studioId": "pdf",
    "description": "Images to PDF utility in PDF Studio.",
    "keywords": [
      "images to pdf",
      "pdf studio",
      "pdf",
      "images"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 2,
    "name": "Text to PDF",
    "studioId": "pdf",
    "description": "Text to PDF utility in PDF Studio.",
    "keywords": [
      "text to pdf",
      "pdf studio",
      "pdf",
      "text"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 3,
    "name": "Scan to PDF",
    "studioId": "pdf",
    "description": "Scan to PDF utility in PDF Studio.",
    "keywords": [
      "scan to pdf",
      "pdf studio",
      "pdf",
      "scan"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 4,
    "name": "Merge PDF",
    "studioId": "pdf",
    "description": "Merge PDF utility in PDF Studio.",
    "keywords": [
      "merge pdf",
      "pdf studio",
      "pdf",
      "merge"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 5,
    "name": "Split PDF",
    "studioId": "pdf",
    "description": "Split PDF utility in PDF Studio.",
    "keywords": [
      "split pdf",
      "pdf studio",
      "pdf",
      "split"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 6,
    "name": "Compress PDF",
    "studioId": "pdf",
    "description": "Compress PDF utility in PDF Studio.",
    "keywords": [
      "compress pdf",
      "pdf studio",
      "pdf",
      "compress"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 7,
    "name": "PDF to Images",
    "studioId": "pdf",
    "description": "PDF to Images utility in PDF Studio.",
    "keywords": [
      "pdf to images",
      "pdf studio",
      "pdf",
      "images"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 8,
    "name": "Images to JPG/PNG PDF",
    "studioId": "pdf",
    "description": "Images to JPG/PNG PDF utility in PDF Studio.",
    "keywords": [
      "images to jpg/png pdf",
      "pdf studio",
      "pdf",
      "images",
      "jpg/png"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 9,
    "name": "Rotate PDF",
    "studioId": "pdf",
    "description": "Rotate PDF utility in PDF Studio.",
    "keywords": [
      "rotate pdf",
      "pdf studio",
      "pdf",
      "rotate"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 10,
    "name": "Reorder PDF Pages",
    "studioId": "pdf",
    "description": "Reorder PDF Pages utility in PDF Studio.",
    "keywords": [
      "reorder pdf pages",
      "pdf studio",
      "pdf",
      "reorder",
      "pages"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 11,
    "name": "Delete PDF Pages",
    "studioId": "pdf",
    "description": "Delete PDF Pages utility in PDF Studio.",
    "keywords": [
      "delete pdf pages",
      "pdf studio",
      "pdf",
      "delete",
      "pages"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 12,
    "name": "Extract PDF Pages",
    "studioId": "pdf",
    "description": "Extract PDF Pages utility in PDF Studio.",
    "keywords": [
      "extract pdf pages",
      "pdf studio",
      "pdf",
      "extract",
      "pages"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 13,
    "name": "Duplicate PDF Pages",
    "studioId": "pdf",
    "description": "Duplicate PDF Pages utility in PDF Studio.",
    "keywords": [
      "duplicate pdf pages",
      "pdf studio",
      "pdf",
      "duplicate",
      "pages"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 14,
    "name": "Add PDF Pages",
    "studioId": "pdf",
    "description": "Add PDF Pages utility in PDF Studio.",
    "keywords": [
      "add pdf pages",
      "pdf studio",
      "pdf",
      "add",
      "pages"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 15,
    "name": "Crop PDF",
    "studioId": "pdf",
    "description": "Crop PDF utility in PDF Studio.",
    "keywords": [
      "crop pdf",
      "pdf studio",
      "pdf",
      "crop"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 16,
    "name": "Resize PDF Pages",
    "studioId": "pdf",
    "description": "Resize PDF Pages utility in PDF Studio.",
    "keywords": [
      "resize pdf pages",
      "pdf studio",
      "pdf",
      "resize",
      "pages"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 17,
    "name": "Add Page Numbers",
    "studioId": "pdf",
    "description": "Add Page Numbers utility in PDF Studio.",
    "keywords": [
      "add page numbers",
      "pdf studio",
      "pdf",
      "add",
      "page",
      "numbers"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 18,
    "name": "Add Watermark",
    "studioId": "pdf",
    "description": "Add Watermark utility in PDF Studio.",
    "keywords": [
      "add watermark",
      "pdf studio",
      "pdf",
      "add",
      "watermark"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 19,
    "name": "Protect PDF",
    "studioId": "pdf",
    "description": "Protect PDF utility in PDF Studio.",
    "keywords": [
      "protect pdf",
      "pdf studio",
      "pdf",
      "protect"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 20,
    "name": "Unlock PDF",
    "studioId": "pdf",
    "description": "Unlock PDF utility in PDF Studio.",
    "keywords": [
      "unlock pdf",
      "pdf studio",
      "pdf",
      "unlock"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 21,
    "name": "PDF Permissions Editor",
    "studioId": "pdf",
    "description": "PDF Permissions Editor utility in PDF Studio.",
    "keywords": [
      "pdf permissions editor",
      "pdf studio",
      "pdf",
      "permissions",
      "editor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 22,
    "name": "PDF Metadata Editor",
    "studioId": "pdf",
    "description": "PDF Metadata Editor utility in PDF Studio.",
    "keywords": [
      "pdf metadata editor",
      "pdf studio",
      "pdf",
      "metadata",
      "editor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 23,
    "name": "PDF Viewer",
    "studioId": "pdf",
    "description": "PDF Viewer utility in PDF Studio.",
    "keywords": [
      "pdf viewer",
      "pdf studio",
      "pdf",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 24,
    "name": "PDF Annotator",
    "studioId": "pdf",
    "description": "PDF Annotator utility in PDF Studio.",
    "keywords": [
      "pdf annotator",
      "pdf studio",
      "pdf",
      "annotator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 25,
    "name": "PDF Signer",
    "studioId": "pdf",
    "description": "PDF Signer utility in PDF Studio.",
    "keywords": [
      "pdf signer",
      "pdf studio",
      "pdf",
      "signer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 26,
    "name": "Fill PDF Forms",
    "studioId": "pdf",
    "description": "Fill PDF Forms utility in PDF Studio.",
    "keywords": [
      "fill pdf forms",
      "pdf studio",
      "pdf",
      "fill",
      "forms"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 27,
    "name": "PDF to Text",
    "studioId": "pdf",
    "description": "PDF to Text utility in PDF Studio.",
    "keywords": [
      "pdf to text",
      "pdf studio",
      "pdf",
      "text"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 28,
    "name": "PDF to Word",
    "studioId": "pdf",
    "description": "PDF to Word utility in PDF Studio.",
    "keywords": [
      "pdf to word",
      "pdf studio",
      "pdf",
      "word"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 29,
    "name": "PDF to Excel",
    "studioId": "pdf",
    "description": "PDF to Excel utility in PDF Studio.",
    "keywords": [
      "pdf to excel",
      "pdf studio",
      "pdf",
      "excel"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 30,
    "name": "PDF to PowerPoint",
    "studioId": "pdf",
    "description": "PDF to PowerPoint utility in PDF Studio.",
    "keywords": [
      "pdf to powerpoint",
      "pdf studio",
      "pdf",
      "powerpoint"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 31,
    "name": "Word to PDF",
    "studioId": "pdf",
    "description": "Word to PDF utility in PDF Studio.",
    "keywords": [
      "word to pdf",
      "pdf studio",
      "pdf",
      "word"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 32,
    "name": "Excel to PDF",
    "studioId": "pdf",
    "description": "Excel to PDF utility in PDF Studio.",
    "keywords": [
      "excel to pdf",
      "pdf studio",
      "pdf",
      "excel"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 33,
    "name": "PowerPoint to PDF",
    "studioId": "pdf",
    "description": "PowerPoint to PDF utility in PDF Studio.",
    "keywords": [
      "powerpoint to pdf",
      "pdf studio",
      "pdf",
      "powerpoint"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 34,
    "name": "HTML to PDF",
    "studioId": "pdf",
    "description": "HTML to PDF utility in PDF Studio.",
    "keywords": [
      "html to pdf",
      "pdf studio",
      "pdf",
      "html"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 35,
    "name": "Webpage to PDF",
    "studioId": "pdf",
    "description": "Webpage to PDF utility in PDF Studio.",
    "keywords": [
      "webpage to pdf",
      "pdf studio",
      "pdf",
      "webpage"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 36,
    "name": "PDF OCR",
    "studioId": "pdf",
    "description": "PDF OCR utility in PDF Studio.",
    "keywords": [
      "pdf ocr",
      "pdf studio",
      "pdf",
      "ocr"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 37,
    "name": "PDF Compare",
    "studioId": "pdf",
    "description": "PDF Compare utility in PDF Studio.",
    "keywords": [
      "pdf compare",
      "pdf studio",
      "pdf",
      "compare"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 38,
    "name": "PDF Repair",
    "studioId": "pdf",
    "description": "PDF Repair utility in PDF Studio.",
    "keywords": [
      "pdf repair",
      "pdf studio",
      "pdf",
      "repair"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 39,
    "name": "PDF Flatten",
    "studioId": "pdf",
    "description": "PDF Flatten utility in PDF Studio.",
    "keywords": [
      "pdf flatten",
      "pdf studio",
      "pdf",
      "flatten"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 40,
    "name": "PDF Booklet Maker",
    "studioId": "pdf",
    "description": "PDF Booklet Maker utility in PDF Studio.",
    "keywords": [
      "pdf booklet maker",
      "pdf studio",
      "pdf",
      "booklet",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 41,
    "name": "PDF Print Optimizer",
    "studioId": "pdf",
    "description": "PDF Print Optimizer utility in PDF Studio.",
    "keywords": [
      "pdf print optimizer",
      "pdf studio",
      "pdf",
      "print",
      "optimizer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 42,
    "name": "PDF to Markdown",
    "studioId": "pdf",
    "description": "PDF to Markdown utility in PDF Studio.",
    "keywords": [
      "pdf to markdown",
      "pdf studio",
      "pdf",
      "markdown"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 43,
    "name": "PDF to JSON",
    "studioId": "pdf",
    "description": "PDF to JSON utility in PDF Studio.",
    "keywords": [
      "pdf to json",
      "pdf studio",
      "pdf",
      "json"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 44,
    "name": "PDF Redaction",
    "studioId": "pdf",
    "description": "PDF Redaction utility in PDF Studio.",
    "keywords": [
      "pdf redaction",
      "pdf studio",
      "pdf",
      "redaction"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 45,
    "name": "PDF Page Labels",
    "studioId": "pdf",
    "description": "PDF Page Labels utility in PDF Studio.",
    "keywords": [
      "pdf page labels",
      "pdf studio",
      "pdf",
      "page",
      "labels"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 46,
    "name": "PDF File Inspector",
    "studioId": "pdf",
    "description": "PDF File Inspector utility in PDF Studio.",
    "keywords": [
      "pdf file inspector",
      "pdf studio",
      "pdf",
      "file",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 47,
    "name": "PDF Batch Processor",
    "studioId": "pdf",
    "description": "PDF Batch Processor utility in PDF Studio.",
    "keywords": [
      "pdf batch processor",
      "pdf studio",
      "pdf",
      "batch",
      "processor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 48,
    "name": "PDF Compare & Merge",
    "studioId": "pdf",
    "description": "PDF Compare & Merge utility in PDF Studio.",
    "keywords": [
      "pdf compare & merge",
      "pdf studio",
      "pdf",
      "compare",
      "merge"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileText",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 49,
    "name": "Image Compressor",
    "studioId": "image",
    "description": "Image Compressor utility in Image Studio.",
    "keywords": [
      "image compressor",
      "image studio",
      "image",
      "compressor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 50,
    "name": "Image Resizer",
    "studioId": "image",
    "description": "Image Resizer utility in Image Studio.",
    "keywords": [
      "image resizer",
      "image studio",
      "image",
      "resizer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 51,
    "name": "Image Cropper",
    "studioId": "image",
    "description": "Image Cropper utility in Image Studio.",
    "keywords": [
      "image cropper",
      "image studio",
      "image",
      "cropper"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 52,
    "name": "Image Rotator",
    "studioId": "image",
    "description": "Image Rotator utility in Image Studio.",
    "keywords": [
      "image rotator",
      "image studio",
      "image",
      "rotator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 53,
    "name": "Image Format Converter",
    "studioId": "image",
    "description": "Image Format Converter utility in Image Studio.",
    "keywords": [
      "image format converter",
      "image studio",
      "image",
      "format",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 54,
    "name": "HEIC Converter",
    "studioId": "image",
    "description": "HEIC Converter utility in Image Studio.",
    "keywords": [
      "heic converter",
      "image studio",
      "image",
      "heic",
      "converter"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 55,
    "name": "Image to PDF",
    "studioId": "image",
    "description": "Image to PDF utility in Image Studio.",
    "keywords": [
      "image to pdf",
      "image studio",
      "image",
      "pdf"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 56,
    "name": "PDF Page to Image",
    "studioId": "image",
    "description": "PDF Page to Image utility in Image Studio.",
    "keywords": [
      "pdf page to image",
      "image studio",
      "image",
      "pdf",
      "page"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 57,
    "name": "Background Remover",
    "studioId": "image",
    "description": "Background Remover utility in Image Studio.",
    "keywords": [
      "background remover",
      "image studio",
      "image",
      "background",
      "remover"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 58,
    "name": "Background Changer",
    "studioId": "image",
    "description": "Background Changer utility in Image Studio.",
    "keywords": [
      "background changer",
      "image studio",
      "image",
      "background",
      "changer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 59,
    "name": "Image Watermark",
    "studioId": "image",
    "description": "Image Watermark utility in Image Studio.",
    "keywords": [
      "image watermark",
      "image studio",
      "image",
      "watermark"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 60,
    "name": "Image Annotator",
    "studioId": "image",
    "description": "Image Annotator utility in Image Studio.",
    "keywords": [
      "image annotator",
      "image studio",
      "image",
      "annotator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 61,
    "name": "Image Collage Maker",
    "studioId": "image",
    "description": "Image Collage Maker utility in Image Studio.",
    "keywords": [
      "image collage maker",
      "image studio",
      "image",
      "collage",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 62,
    "name": "Image Merger",
    "studioId": "image",
    "description": "Image Merger utility in Image Studio.",
    "keywords": [
      "image merger",
      "image studio",
      "image",
      "merger"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 63,
    "name": "Image Splitter",
    "studioId": "image",
    "description": "Image Splitter utility in Image Studio.",
    "keywords": [
      "image splitter",
      "image studio",
      "image",
      "splitter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 64,
    "name": "Image Color Picker",
    "studioId": "image",
    "description": "Image Color Picker utility in Image Studio.",
    "keywords": [
      "image color picker",
      "image studio",
      "image",
      "color",
      "picker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 65,
    "name": "Image to Text (OCR)",
    "studioId": "image",
    "description": "Image to Text (OCR) utility in Image Studio.",
    "keywords": [
      "image to text (ocr)",
      "image studio",
      "image",
      "text",
      "(ocr)"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 66,
    "name": "Image Upscaler",
    "studioId": "image",
    "description": "Image Upscaler utility in Image Studio.",
    "keywords": [
      "image upscaler",
      "image studio",
      "image",
      "upscaler"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 67,
    "name": "Photo Enhancer",
    "studioId": "image",
    "description": "Photo Enhancer utility in Image Studio.",
    "keywords": [
      "photo enhancer",
      "image studio",
      "image",
      "photo",
      "enhancer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 68,
    "name": "Blur Image",
    "studioId": "image",
    "description": "Blur Image utility in Image Studio.",
    "keywords": [
      "blur image",
      "image studio",
      "image",
      "blur"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 69,
    "name": "Image Metadata Viewer",
    "studioId": "image",
    "description": "Image Metadata Viewer utility in Image Studio.",
    "keywords": [
      "image metadata viewer",
      "image studio",
      "image",
      "metadata",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 70,
    "name": "EXIF Remover",
    "studioId": "image",
    "description": "EXIF Remover utility in Image Studio.",
    "keywords": [
      "exif remover",
      "image studio",
      "image",
      "exif",
      "remover"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 71,
    "name": "Image Metadata Editor",
    "studioId": "image",
    "description": "Image Metadata Editor utility in Image Studio.",
    "keywords": [
      "image metadata editor",
      "image studio",
      "image",
      "metadata",
      "editor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 72,
    "name": "Transparent PNG Maker",
    "studioId": "image",
    "description": "Transparent PNG Maker utility in Image Studio.",
    "keywords": [
      "transparent png maker",
      "image studio",
      "image",
      "transparent",
      "png",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 73,
    "name": "Favicon Generator",
    "studioId": "image",
    "description": "Favicon Generator utility in Image Studio.",
    "keywords": [
      "favicon generator",
      "image studio",
      "image",
      "favicon",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 74,
    "name": "Thumbnail Maker",
    "studioId": "image",
    "description": "Thumbnail Maker utility in Image Studio.",
    "keywords": [
      "thumbnail maker",
      "image studio",
      "image",
      "thumbnail",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 75,
    "name": "Passport Photo Maker",
    "studioId": "image",
    "description": "Passport Photo Maker utility in Image Studio.",
    "keywords": [
      "passport photo maker",
      "image studio",
      "image",
      "passport",
      "photo",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 76,
    "name": "ID Photo Sheet Maker",
    "studioId": "image",
    "description": "ID Photo Sheet Maker utility in Image Studio.",
    "keywords": [
      "id photo sheet maker",
      "image studio",
      "image",
      "photo",
      "sheet",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 77,
    "name": "Meme Generator",
    "studioId": "image",
    "description": "Meme Generator utility in Image Studio.",
    "keywords": [
      "meme generator",
      "image studio",
      "image",
      "meme",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 78,
    "name": "Color Palette Extractor",
    "studioId": "image",
    "description": "Color Palette Extractor utility in Image Studio.",
    "keywords": [
      "color palette extractor",
      "image studio",
      "image",
      "color",
      "palette",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 79,
    "name": "Image Comparison",
    "studioId": "image",
    "description": "Image Comparison utility in Image Studio.",
    "keywords": [
      "image comparison",
      "image studio",
      "image",
      "comparison"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 80,
    "name": "Screenshot Stitcher",
    "studioId": "image",
    "description": "Screenshot Stitcher utility in Image Studio.",
    "keywords": [
      "screenshot stitcher",
      "image studio",
      "image",
      "screenshot",
      "stitcher"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 81,
    "name": "SVG Viewer",
    "studioId": "image",
    "description": "SVG Viewer utility in Image Studio.",
    "keywords": [
      "svg viewer",
      "image studio",
      "image",
      "svg",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 82,
    "name": "SVG Optimizer",
    "studioId": "image",
    "description": "SVG Optimizer utility in Image Studio.",
    "keywords": [
      "svg optimizer",
      "image studio",
      "image",
      "svg",
      "optimizer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 83,
    "name": "SVG to PNG",
    "studioId": "image",
    "description": "SVG to PNG utility in Image Studio.",
    "keywords": [
      "svg to png",
      "image studio",
      "image",
      "svg",
      "png"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 84,
    "name": "PNG to SVG",
    "studioId": "image",
    "description": "PNG to SVG utility in Image Studio.",
    "keywords": [
      "png to svg",
      "image studio",
      "image",
      "png",
      "svg"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 85,
    "name": "Image Batch Processor",
    "studioId": "image",
    "description": "Image Batch Processor utility in Image Studio.",
    "keywords": [
      "image batch processor",
      "image studio",
      "image",
      "batch",
      "processor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Image",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 86,
    "name": "Smart Document Scanner",
    "studioId": "scanner",
    "description": "Smart Document Scanner utility in Document Scanner.",
    "keywords": [
      "smart document scanner",
      "document scanner",
      "scanner",
      "smart",
      "document"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 87,
    "name": "Perspective Correction",
    "studioId": "scanner",
    "description": "Perspective Correction utility in Document Scanner.",
    "keywords": [
      "perspective correction",
      "document scanner",
      "scanner",
      "perspective",
      "correction"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 88,
    "name": "Auto-Crop Scanner",
    "studioId": "scanner",
    "description": "Auto-Crop Scanner utility in Document Scanner.",
    "keywords": [
      "auto-crop scanner",
      "document scanner",
      "scanner",
      "auto-crop"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 89,
    "name": "Scan Filters",
    "studioId": "scanner",
    "description": "Scan Filters utility in Document Scanner.",
    "keywords": [
      "scan filters",
      "document scanner",
      "scanner",
      "scan",
      "filters"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 90,
    "name": "Multi-Page Scanner",
    "studioId": "scanner",
    "description": "Multi-Page Scanner utility in Document Scanner.",
    "keywords": [
      "multi-page scanner",
      "document scanner",
      "scanner",
      "multi-page"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 91,
    "name": "ID Card Scanner",
    "studioId": "scanner",
    "description": "ID Card Scanner utility in Document Scanner.",
    "keywords": [
      "id card scanner",
      "document scanner",
      "scanner",
      "card"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 92,
    "name": "Receipt Scanner",
    "studioId": "scanner",
    "description": "Receipt Scanner utility in Document Scanner.",
    "keywords": [
      "receipt scanner",
      "document scanner",
      "scanner",
      "receipt"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 93,
    "name": "Business Card Scanner",
    "studioId": "scanner",
    "description": "Business Card Scanner utility in Document Scanner.",
    "keywords": [
      "business card scanner",
      "document scanner",
      "scanner",
      "business",
      "card"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 94,
    "name": "Handwriting OCR",
    "studioId": "scanner",
    "description": "Handwriting OCR utility in Document Scanner.",
    "keywords": [
      "handwriting ocr",
      "document scanner",
      "scanner",
      "handwriting",
      "ocr"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 95,
    "name": "OCR Language Selector",
    "studioId": "scanner",
    "description": "OCR Language Selector utility in Document Scanner.",
    "keywords": [
      "ocr language selector",
      "document scanner",
      "scanner",
      "ocr",
      "language",
      "selector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 96,
    "name": "Searchable PDF Maker",
    "studioId": "scanner",
    "description": "Searchable PDF Maker utility in Document Scanner.",
    "keywords": [
      "searchable pdf maker",
      "document scanner",
      "scanner",
      "searchable",
      "pdf",
      "maker"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 97,
    "name": "Scan to Word",
    "studioId": "scanner",
    "description": "Scan to Word utility in Document Scanner.",
    "keywords": [
      "scan to word",
      "document scanner",
      "scanner",
      "scan",
      "word"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 98,
    "name": "Scan to Excel",
    "studioId": "scanner",
    "description": "Scan to Excel utility in Document Scanner.",
    "keywords": [
      "scan to excel",
      "document scanner",
      "scanner",
      "scan",
      "excel"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 99,
    "name": "Document Cleanup",
    "studioId": "scanner",
    "description": "Document Cleanup utility in Document Scanner.",
    "keywords": [
      "document cleanup",
      "document scanner",
      "scanner",
      "document",
      "cleanup"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 100,
    "name": "Scan History",
    "studioId": "scanner",
    "description": "Scan History utility in Document Scanner.",
    "keywords": [
      "scan history",
      "document scanner",
      "scanner",
      "scan",
      "history"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 101,
    "name": "Document Naming Assistant",
    "studioId": "scanner",
    "description": "Document Naming Assistant utility in Document Scanner.",
    "keywords": [
      "document naming assistant",
      "document scanner",
      "scanner",
      "document",
      "naming",
      "assistant"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 102,
    "name": "Batch Scan Export",
    "studioId": "scanner",
    "description": "Batch Scan Export utility in Document Scanner.",
    "keywords": [
      "batch scan export",
      "document scanner",
      "scanner",
      "batch",
      "scan",
      "export"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 103,
    "name": "Scan Quality Checker",
    "studioId": "scanner",
    "description": "Scan Quality Checker utility in Document Scanner.",
    "keywords": [
      "scan quality checker",
      "document scanner",
      "scanner",
      "scan",
      "quality",
      "checker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Scan",
    "inputKind": "camera",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 104,
    "name": "Video Compressor",
    "studioId": "video",
    "description": "Video Compressor utility in Video Studio.",
    "keywords": [
      "video compressor",
      "video studio",
      "video",
      "compressor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 105,
    "name": "Video Trimmer",
    "studioId": "video",
    "description": "Video Trimmer utility in Video Studio.",
    "keywords": [
      "video trimmer",
      "video studio",
      "video",
      "trimmer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 106,
    "name": "Video Merger",
    "studioId": "video",
    "description": "Video Merger utility in Video Studio.",
    "keywords": [
      "video merger",
      "video studio",
      "video",
      "merger"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 107,
    "name": "Video Cropper",
    "studioId": "video",
    "description": "Video Cropper utility in Video Studio.",
    "keywords": [
      "video cropper",
      "video studio",
      "video",
      "cropper"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 108,
    "name": "Video Rotator",
    "studioId": "video",
    "description": "Video Rotator utility in Video Studio.",
    "keywords": [
      "video rotator",
      "video studio",
      "video",
      "rotator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 109,
    "name": "Video Format Converter",
    "studioId": "video",
    "description": "Video Format Converter utility in Video Studio.",
    "keywords": [
      "video format converter",
      "video studio",
      "video",
      "format",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 110,
    "name": "Video to MP3",
    "studioId": "video",
    "description": "Video to MP3 utility in Video Studio.",
    "keywords": [
      "video to mp3",
      "video studio",
      "video",
      "mp3"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 111,
    "name": "Video to GIF",
    "studioId": "video",
    "description": "Video to GIF utility in Video Studio.",
    "keywords": [
      "video to gif",
      "video studio",
      "video",
      "gif"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 112,
    "name": "Video to Images",
    "studioId": "video",
    "description": "Video to Images utility in Video Studio.",
    "keywords": [
      "video to images",
      "video studio",
      "video",
      "images"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 113,
    "name": "Video Speed Controller",
    "studioId": "video",
    "description": "Video Speed Controller utility in Video Studio.",
    "keywords": [
      "video speed controller",
      "video studio",
      "video",
      "speed",
      "controller"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 114,
    "name": "Video Mute",
    "studioId": "video",
    "description": "Video Mute utility in Video Studio.",
    "keywords": [
      "video mute",
      "video studio",
      "video",
      "mute"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 115,
    "name": "Video Watermark",
    "studioId": "video",
    "description": "Video Watermark utility in Video Studio.",
    "keywords": [
      "video watermark",
      "video studio",
      "video",
      "watermark"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 116,
    "name": "Subtitle Editor",
    "studioId": "video",
    "description": "Subtitle Editor utility in Video Studio.",
    "keywords": [
      "subtitle editor",
      "video studio",
      "video",
      "subtitle",
      "editor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 117,
    "name": "Subtitle Extractor",
    "studioId": "video",
    "description": "Subtitle Extractor utility in Video Studio.",
    "keywords": [
      "subtitle extractor",
      "video studio",
      "video",
      "subtitle",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 118,
    "name": "Video Resolution Changer",
    "studioId": "video",
    "description": "Video Resolution Changer utility in Video Studio.",
    "keywords": [
      "video resolution changer",
      "video studio",
      "video",
      "resolution",
      "changer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 119,
    "name": "Video Frame Rate Converter",
    "studioId": "video",
    "description": "Video Frame Rate Converter utility in Video Studio.",
    "keywords": [
      "video frame rate converter",
      "video studio",
      "video",
      "frame",
      "rate",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 120,
    "name": "Video Metadata Viewer",
    "studioId": "video",
    "description": "Video Metadata Viewer utility in Video Studio.",
    "keywords": [
      "video metadata viewer",
      "video studio",
      "video",
      "metadata",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 121,
    "name": "Video Thumbnail Maker",
    "studioId": "video",
    "description": "Video Thumbnail Maker utility in Video Studio.",
    "keywords": [
      "video thumbnail maker",
      "video studio",
      "video",
      "thumbnail",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 122,
    "name": "Video Stabilizer",
    "studioId": "video",
    "description": "Video Stabilizer utility in Video Studio.",
    "keywords": [
      "video stabilizer",
      "video studio",
      "video",
      "stabilizer"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 123,
    "name": "Audio Replacement",
    "studioId": "video",
    "description": "Audio Replacement utility in Video Studio.",
    "keywords": [
      "audio replacement",
      "video studio",
      "video",
      "audio",
      "replacement"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 124,
    "name": "Video to PDF Storyboard",
    "studioId": "video",
    "description": "Video to PDF Storyboard utility in Video Studio.",
    "keywords": [
      "video to pdf storyboard",
      "video studio",
      "video",
      "pdf",
      "storyboard"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 125,
    "name": "Screen Recorder",
    "studioId": "video",
    "description": "Screen Recorder utility in Video Studio.",
    "keywords": [
      "screen recorder",
      "video studio",
      "video",
      "screen",
      "recorder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 126,
    "name": "Camera Recorder",
    "studioId": "video",
    "description": "Camera Recorder utility in Video Studio.",
    "keywords": [
      "camera recorder",
      "video studio",
      "video",
      "camera",
      "recorder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 127,
    "name": "Batch Video Converter",
    "studioId": "video",
    "description": "Batch Video Converter utility in Video Studio.",
    "keywords": [
      "batch video converter",
      "video studio",
      "video",
      "batch",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 128,
    "name": "Video Merge with Transitions",
    "studioId": "video",
    "description": "Video Merge with Transitions utility in Video Studio.",
    "keywords": [
      "video merge with transitions",
      "video studio",
      "video",
      "merge",
      "with",
      "transitions"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Video",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 129,
    "name": "Audio Compressor",
    "studioId": "audio",
    "description": "Audio Compressor utility in Audio Studio.",
    "keywords": [
      "audio compressor",
      "audio studio",
      "audio",
      "compressor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 130,
    "name": "Audio Converter",
    "studioId": "audio",
    "description": "Audio Converter utility in Audio Studio.",
    "keywords": [
      "audio converter",
      "audio studio",
      "audio",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 131,
    "name": "Audio Trimmer",
    "studioId": "audio",
    "description": "Audio Trimmer utility in Audio Studio.",
    "keywords": [
      "audio trimmer",
      "audio studio",
      "audio",
      "trimmer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 132,
    "name": "Audio Merger",
    "studioId": "audio",
    "description": "Audio Merger utility in Audio Studio.",
    "keywords": [
      "audio merger",
      "audio studio",
      "audio",
      "merger"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 133,
    "name": "Audio Splitter",
    "studioId": "audio",
    "description": "Audio Splitter utility in Audio Studio.",
    "keywords": [
      "audio splitter",
      "audio studio",
      "audio",
      "splitter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 134,
    "name": "Audio Speed Changer",
    "studioId": "audio",
    "description": "Audio Speed Changer utility in Audio Studio.",
    "keywords": [
      "audio speed changer",
      "audio studio",
      "audio",
      "speed",
      "changer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 135,
    "name": "Pitch Changer",
    "studioId": "audio",
    "description": "Pitch Changer utility in Audio Studio.",
    "keywords": [
      "pitch changer",
      "audio studio",
      "audio",
      "pitch",
      "changer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 136,
    "name": "Volume Booster",
    "studioId": "audio",
    "description": "Volume Booster utility in Audio Studio.",
    "keywords": [
      "volume booster",
      "audio studio",
      "audio",
      "volume",
      "booster"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 137,
    "name": "Audio Normalizer",
    "studioId": "audio",
    "description": "Audio Normalizer utility in Audio Studio.",
    "keywords": [
      "audio normalizer",
      "audio studio",
      "audio",
      "normalizer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 138,
    "name": "Audio Noise Reducer",
    "studioId": "audio",
    "description": "Audio Noise Reducer utility in Audio Studio.",
    "keywords": [
      "audio noise reducer",
      "audio studio",
      "audio",
      "noise",
      "reducer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 139,
    "name": "Voice Recorder",
    "studioId": "audio",
    "description": "Voice Recorder utility in Audio Studio.",
    "keywords": [
      "voice recorder",
      "audio studio",
      "audio",
      "voice",
      "recorder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 140,
    "name": "Audio to Text",
    "studioId": "audio",
    "description": "Audio to Text utility in Audio Studio.",
    "keywords": [
      "audio to text",
      "audio studio",
      "audio",
      "text"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 141,
    "name": "Text to Speech",
    "studioId": "audio",
    "description": "Text to Speech utility in Audio Studio.",
    "keywords": [
      "text to speech",
      "audio studio",
      "audio",
      "text",
      "speech"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 142,
    "name": "Audio to WAV",
    "studioId": "audio",
    "description": "Audio to WAV utility in Audio Studio.",
    "keywords": [
      "audio to wav",
      "audio studio",
      "audio",
      "wav"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 143,
    "name": "Audio to MP3",
    "studioId": "audio",
    "description": "Audio to MP3 utility in Audio Studio.",
    "keywords": [
      "audio to mp3",
      "audio studio",
      "audio",
      "mp3"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 144,
    "name": "Video Audio Extractor",
    "studioId": "audio",
    "description": "Video Audio Extractor utility in Audio Studio.",
    "keywords": [
      "video audio extractor",
      "audio studio",
      "audio",
      "video",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 145,
    "name": "Audio Metadata Editor",
    "studioId": "audio",
    "description": "Audio Metadata Editor utility in Audio Studio.",
    "keywords": [
      "audio metadata editor",
      "audio studio",
      "audio",
      "metadata",
      "editor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 146,
    "name": "Album Art Editor",
    "studioId": "audio",
    "description": "Album Art Editor utility in Audio Studio.",
    "keywords": [
      "album art editor",
      "audio studio",
      "audio",
      "album",
      "art",
      "editor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 147,
    "name": "Audio Waveform Viewer",
    "studioId": "audio",
    "description": "Audio Waveform Viewer utility in Audio Studio.",
    "keywords": [
      "audio waveform viewer",
      "audio studio",
      "audio",
      "waveform",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 148,
    "name": "Silence Remover",
    "studioId": "audio",
    "description": "Silence Remover utility in Audio Studio.",
    "keywords": [
      "silence remover",
      "audio studio",
      "audio",
      "silence",
      "remover"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 149,
    "name": "Voice Changer",
    "studioId": "audio",
    "description": "Voice Changer utility in Audio Studio.",
    "keywords": [
      "voice changer",
      "audio studio",
      "audio",
      "voice",
      "changer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 150,
    "name": "Audio Channel Converter",
    "studioId": "audio",
    "description": "Audio Channel Converter utility in Audio Studio.",
    "keywords": [
      "audio channel converter",
      "audio studio",
      "audio",
      "channel",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 151,
    "name": "Ringtone Maker",
    "studioId": "audio",
    "description": "Ringtone Maker utility in Audio Studio.",
    "keywords": [
      "ringtone maker",
      "audio studio",
      "audio",
      "ringtone",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 152,
    "name": "Audio Batch Converter",
    "studioId": "audio",
    "description": "Audio Batch Converter utility in Audio Studio.",
    "keywords": [
      "audio batch converter",
      "audio studio",
      "audio",
      "batch",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 153,
    "name": "Audio Joiner with Crossfade",
    "studioId": "audio",
    "description": "Audio Joiner with Crossfade utility in Audio Studio.",
    "keywords": [
      "audio joiner with crossfade",
      "audio studio",
      "audio",
      "joiner",
      "with",
      "crossfade"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Volume2",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 154,
    "name": "DOCX Viewer",
    "studioId": "office",
    "description": "DOCX Viewer utility in Office & Documents.",
    "keywords": [
      "docx viewer",
      "office & documents",
      "office",
      "docx",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 155,
    "name": "DOCX to TXT",
    "studioId": "office",
    "description": "DOCX to TXT utility in Office & Documents.",
    "keywords": [
      "docx to txt",
      "office & documents",
      "office",
      "docx",
      "txt"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 156,
    "name": "DOCX to HTML",
    "studioId": "office",
    "description": "DOCX to HTML utility in Office & Documents.",
    "keywords": [
      "docx to html",
      "office & documents",
      "office",
      "docx",
      "html"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 157,
    "name": "DOCX to Markdown",
    "studioId": "office",
    "description": "DOCX to Markdown utility in Office & Documents.",
    "keywords": [
      "docx to markdown",
      "office & documents",
      "office",
      "docx",
      "markdown"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 158,
    "name": "TXT to DOCX",
    "studioId": "office",
    "description": "TXT to DOCX utility in Office & Documents.",
    "keywords": [
      "txt to docx",
      "office & documents",
      "office",
      "txt",
      "docx"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 159,
    "name": "Markdown to PDF",
    "studioId": "office",
    "description": "Markdown to PDF utility in Office & Documents.",
    "keywords": [
      "markdown to pdf",
      "office & documents",
      "office",
      "markdown",
      "pdf"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 160,
    "name": "Markdown to HTML",
    "studioId": "office",
    "description": "Markdown to HTML utility in Office & Documents.",
    "keywords": [
      "markdown to html",
      "office & documents",
      "office",
      "markdown",
      "html"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 161,
    "name": "HTML to Markdown",
    "studioId": "office",
    "description": "HTML to Markdown utility in Office & Documents.",
    "keywords": [
      "html to markdown",
      "office & documents",
      "office",
      "html",
      "markdown"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 162,
    "name": "Excel to CSV",
    "studioId": "office",
    "description": "Excel to CSV utility in Office & Documents.",
    "keywords": [
      "excel to csv",
      "office & documents",
      "office",
      "excel",
      "csv"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 163,
    "name": "CSV to Excel",
    "studioId": "office",
    "description": "CSV to Excel utility in Office & Documents.",
    "keywords": [
      "csv to excel",
      "office & documents",
      "office",
      "csv",
      "excel"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 164,
    "name": "CSV Viewer",
    "studioId": "office",
    "description": "CSV Viewer utility in Office & Documents.",
    "keywords": [
      "csv viewer",
      "office & documents",
      "office",
      "csv",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 165,
    "name": "CSV Cleaner",
    "studioId": "office",
    "description": "CSV Cleaner utility in Office & Documents.",
    "keywords": [
      "csv cleaner",
      "office & documents",
      "office",
      "csv",
      "cleaner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 166,
    "name": "CSV Deduplicator",
    "studioId": "office",
    "description": "CSV Deduplicator utility in Office & Documents.",
    "keywords": [
      "csv deduplicator",
      "office & documents",
      "office",
      "csv",
      "deduplicator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 167,
    "name": "CSV Merger",
    "studioId": "office",
    "description": "CSV Merger utility in Office & Documents.",
    "keywords": [
      "csv merger",
      "office & documents",
      "office",
      "csv",
      "merger"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 168,
    "name": "CSV Splitter",
    "studioId": "office",
    "description": "CSV Splitter utility in Office & Documents.",
    "keywords": [
      "csv splitter",
      "office & documents",
      "office",
      "csv",
      "splitter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 169,
    "name": "JSON to CSV",
    "studioId": "office",
    "description": "JSON to CSV utility in Office & Documents.",
    "keywords": [
      "json to csv",
      "office & documents",
      "office",
      "json",
      "csv"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 170,
    "name": "CSV to JSON",
    "studioId": "office",
    "description": "CSV to JSON utility in Office & Documents.",
    "keywords": [
      "csv to json",
      "office & documents",
      "office",
      "csv",
      "json"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 171,
    "name": "XML to JSON",
    "studioId": "office",
    "description": "XML to JSON utility in Office & Documents.",
    "keywords": [
      "xml to json",
      "office & documents",
      "office",
      "xml",
      "json"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 172,
    "name": "JSON to XML",
    "studioId": "office",
    "description": "JSON to XML utility in Office & Documents.",
    "keywords": [
      "json to xml",
      "office & documents",
      "office",
      "json",
      "xml"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 173,
    "name": "XML Formatter",
    "studioId": "office",
    "description": "XML Formatter utility in Office & Documents.",
    "keywords": [
      "xml formatter",
      "office & documents",
      "office",
      "xml",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 174,
    "name": "Document Compare",
    "studioId": "office",
    "description": "Document Compare utility in Office & Documents.",
    "keywords": [
      "document compare",
      "office & documents",
      "office",
      "document",
      "compare"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 175,
    "name": "Word Counter for Documents",
    "studioId": "office",
    "description": "Word Counter for Documents utility in Office & Documents.",
    "keywords": [
      "word counter for documents",
      "office & documents",
      "office",
      "word",
      "counter",
      "for",
      "documents"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 176,
    "name": "Document Metadata Viewer",
    "studioId": "office",
    "description": "Document Metadata Viewer utility in Office & Documents.",
    "keywords": [
      "document metadata viewer",
      "office & documents",
      "office",
      "document",
      "metadata",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 177,
    "name": "Presentation to Images",
    "studioId": "office",
    "description": "Presentation to Images utility in Office & Documents.",
    "keywords": [
      "presentation to images",
      "office & documents",
      "office",
      "presentation",
      "images"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 178,
    "name": "Text to DOCX",
    "studioId": "office",
    "description": "Text to DOCX utility in Office & Documents.",
    "keywords": [
      "text to docx",
      "office & documents",
      "office",
      "text",
      "docx"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 179,
    "name": "Batch Document Converter",
    "studioId": "office",
    "description": "Batch Document Converter utility in Office & Documents.",
    "keywords": [
      "batch document converter",
      "office & documents",
      "office",
      "batch",
      "document",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 180,
    "name": "Batch Document Converter",
    "studioId": "office",
    "description": "Batch Document Converter utility in Office & Documents.",
    "keywords": [
      "batch document converter",
      "office & documents",
      "office",
      "batch",
      "document",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "FileSpreadsheet",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 181,
    "name": "ZIP Creator",
    "studioId": "archive",
    "description": "ZIP Creator utility in Archive & Files.",
    "keywords": [
      "zip creator",
      "archive & files",
      "archive",
      "zip",
      "creator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 182,
    "name": "ZIP Extractor",
    "studioId": "archive",
    "description": "ZIP Extractor utility in Archive & Files.",
    "keywords": [
      "zip extractor",
      "archive & files",
      "archive",
      "zip",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 183,
    "name": "7Z Extractor",
    "studioId": "archive",
    "description": "7Z Extractor utility in Archive & Files.",
    "keywords": [
      "7z extractor",
      "archive & files",
      "archive",
      "extractor"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 184,
    "name": "TAR Extractor",
    "studioId": "archive",
    "description": "TAR Extractor utility in Archive & Files.",
    "keywords": [
      "tar extractor",
      "archive & files",
      "archive",
      "tar",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 185,
    "name": "GZIP Compressor/Extractor",
    "studioId": "archive",
    "description": "GZIP Compressor/Extractor utility in Archive & Files.",
    "keywords": [
      "gzip compressor/extractor",
      "archive & files",
      "archive",
      "gzip",
      "compressor/extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 186,
    "name": "Archive File Inspector",
    "studioId": "archive",
    "description": "Archive File Inspector utility in Archive & Files.",
    "keywords": [
      "archive file inspector",
      "archive & files",
      "archive",
      "file",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 187,
    "name": "Archive Password Protector",
    "studioId": "archive",
    "description": "Archive Password Protector utility in Archive & Files.",
    "keywords": [
      "archive password protector",
      "archive & files",
      "archive",
      "password",
      "protector"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 188,
    "name": "File Compressor",
    "studioId": "archive",
    "description": "File Compressor utility in Archive & Files.",
    "keywords": [
      "file compressor",
      "archive & files",
      "archive",
      "file",
      "compressor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 189,
    "name": "File Type Detector",
    "studioId": "archive",
    "description": "File Type Detector utility in Archive & Files.",
    "keywords": [
      "file type detector",
      "archive & files",
      "archive",
      "file",
      "type",
      "detector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 190,
    "name": "File Size Analyzer",
    "studioId": "archive",
    "description": "File Size Analyzer utility in Archive & Files.",
    "keywords": [
      "file size analyzer",
      "archive & files",
      "archive",
      "file",
      "size",
      "analyzer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 191,
    "name": "Duplicate File Finder",
    "studioId": "archive",
    "description": "Duplicate File Finder utility in Archive & Files.",
    "keywords": [
      "duplicate file finder",
      "archive & files",
      "archive",
      "duplicate",
      "file",
      "finder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 192,
    "name": "Bulk File Renamer",
    "studioId": "archive",
    "description": "Bulk File Renamer utility in Archive & Files.",
    "keywords": [
      "bulk file renamer",
      "archive & files",
      "archive",
      "bulk",
      "file",
      "renamer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 193,
    "name": "File Checksum Generator",
    "studioId": "archive",
    "description": "File Checksum Generator utility in Archive & Files.",
    "keywords": [
      "file checksum generator",
      "archive & files",
      "archive",
      "file",
      "checksum",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 194,
    "name": "Checksum Verifier",
    "studioId": "archive",
    "description": "Checksum Verifier utility in Archive & Files.",
    "keywords": [
      "checksum verifier",
      "archive & files",
      "archive",
      "checksum",
      "verifier"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 195,
    "name": "File Splitter",
    "studioId": "archive",
    "description": "File Splitter utility in Archive & Files.",
    "keywords": [
      "file splitter",
      "archive & files",
      "archive",
      "file",
      "splitter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 196,
    "name": "File Joiner",
    "studioId": "archive",
    "description": "File Joiner utility in Archive & Files.",
    "keywords": [
      "file joiner",
      "archive & files",
      "archive",
      "file",
      "joiner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 197,
    "name": "MIME Type Inspector",
    "studioId": "archive",
    "description": "MIME Type Inspector utility in Archive & Files.",
    "keywords": [
      "mime type inspector",
      "archive & files",
      "archive",
      "mime",
      "type",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 198,
    "name": "File Extension Converter",
    "studioId": "archive",
    "description": "File Extension Converter utility in Archive & Files.",
    "keywords": [
      "file extension converter",
      "archive & files",
      "archive",
      "file",
      "extension",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 199,
    "name": "Batch File Organizer",
    "studioId": "archive",
    "description": "Batch File Organizer utility in Archive & Files.",
    "keywords": [
      "batch file organizer",
      "archive & files",
      "archive",
      "batch",
      "file",
      "organizer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 200,
    "name": "Temporary File Cleaner",
    "studioId": "archive",
    "description": "Temporary File Cleaner utility in Archive & Files.",
    "keywords": [
      "temporary file cleaner",
      "archive & files",
      "archive",
      "temporary",
      "file",
      "cleaner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 201,
    "name": "File Sharing Utility",
    "studioId": "archive",
    "description": "File Sharing Utility utility in Archive & Files.",
    "keywords": [
      "file sharing utility",
      "archive & files",
      "archive",
      "file",
      "sharing",
      "utility"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 202,
    "name": "Recent Files Manager",
    "studioId": "archive",
    "description": "Recent Files Manager utility in Archive & Files.",
    "keywords": [
      "recent files manager",
      "archive & files",
      "archive",
      "recent",
      "files",
      "manager"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 203,
    "name": "Storage Usage Analyzer",
    "studioId": "archive",
    "description": "Storage Usage Analyzer utility in Archive & Files.",
    "keywords": [
      "storage usage analyzer",
      "archive & files",
      "archive",
      "storage",
      "usage",
      "analyzer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 204,
    "name": "Archive Converter",
    "studioId": "archive",
    "description": "Archive Converter utility in Archive & Files.",
    "keywords": [
      "archive converter",
      "archive & files",
      "archive",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Archive",
    "inputKind": "file",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 205,
    "name": "Word Counter",
    "studioId": "text",
    "description": "Word Counter utility in Text & Writing.",
    "keywords": [
      "word counter",
      "text & writing",
      "text",
      "word",
      "counter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 206,
    "name": "Character Counter",
    "studioId": "text",
    "description": "Character Counter utility in Text & Writing.",
    "keywords": [
      "character counter",
      "text & writing",
      "text",
      "character",
      "counter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 207,
    "name": "Sentence Counter",
    "studioId": "text",
    "description": "Sentence Counter utility in Text & Writing.",
    "keywords": [
      "sentence counter",
      "text & writing",
      "text",
      "sentence",
      "counter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 208,
    "name": "Paragraph Counter",
    "studioId": "text",
    "description": "Paragraph Counter utility in Text & Writing.",
    "keywords": [
      "paragraph counter",
      "text & writing",
      "text",
      "paragraph",
      "counter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 209,
    "name": "Reading Time Calculator",
    "studioId": "text",
    "description": "Reading Time Calculator utility in Text & Writing.",
    "keywords": [
      "reading time calculator",
      "text & writing",
      "text",
      "reading",
      "time",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 210,
    "name": "Case Converter",
    "studioId": "text",
    "description": "Case Converter utility in Text & Writing.",
    "keywords": [
      "case converter",
      "text & writing",
      "text",
      "case",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 211,
    "name": "Remove Extra Spaces",
    "studioId": "text",
    "description": "Remove Extra Spaces utility in Text & Writing.",
    "keywords": [
      "remove extra spaces",
      "text & writing",
      "text",
      "remove",
      "extra",
      "spaces"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 212,
    "name": "Remove Empty Lines",
    "studioId": "text",
    "description": "Remove Empty Lines utility in Text & Writing.",
    "keywords": [
      "remove empty lines",
      "text & writing",
      "text",
      "remove",
      "empty",
      "lines"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 213,
    "name": "Remove Duplicate Lines",
    "studioId": "text",
    "description": "Remove Duplicate Lines utility in Text & Writing.",
    "keywords": [
      "remove duplicate lines",
      "text & writing",
      "text",
      "remove",
      "duplicate",
      "lines"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 214,
    "name": "Sort Lines",
    "studioId": "text",
    "description": "Sort Lines utility in Text & Writing.",
    "keywords": [
      "sort lines",
      "text & writing",
      "text",
      "sort",
      "lines"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 215,
    "name": "Reverse Text",
    "studioId": "text",
    "description": "Reverse Text utility in Text & Writing.",
    "keywords": [
      "reverse text",
      "text & writing",
      "text",
      "reverse"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 216,
    "name": "Find & Replace",
    "studioId": "text",
    "description": "Find & Replace utility in Text & Writing.",
    "keywords": [
      "find & replace",
      "text & writing",
      "text",
      "find",
      "replace"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 217,
    "name": "Text Diff Checker",
    "studioId": "text",
    "description": "Text Diff Checker utility in Text & Writing.",
    "keywords": [
      "text diff checker",
      "text & writing",
      "text",
      "diff",
      "checker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 218,
    "name": "Text Splitter",
    "studioId": "text",
    "description": "Text Splitter utility in Text & Writing.",
    "keywords": [
      "text splitter",
      "text & writing",
      "text",
      "splitter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 219,
    "name": "Text Merger",
    "studioId": "text",
    "description": "Text Merger utility in Text & Writing.",
    "keywords": [
      "text merger",
      "text & writing",
      "text",
      "merger"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 220,
    "name": "Text Repeater",
    "studioId": "text",
    "description": "Text Repeater utility in Text & Writing.",
    "keywords": [
      "text repeater",
      "text & writing",
      "text",
      "repeater"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 221,
    "name": "Text to Slug",
    "studioId": "text",
    "description": "Text to Slug utility in Text & Writing.",
    "keywords": [
      "text to slug",
      "text & writing",
      "text",
      "slug"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 222,
    "name": "Slug to Text",
    "studioId": "text",
    "description": "Slug to Text utility in Text & Writing.",
    "keywords": [
      "slug to text",
      "text & writing",
      "text",
      "slug"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 223,
    "name": "URL Extractor",
    "studioId": "text",
    "description": "URL Extractor utility in Text & Writing.",
    "keywords": [
      "url extractor",
      "text & writing",
      "text",
      "url",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 224,
    "name": "Email Extractor",
    "studioId": "text",
    "description": "Email Extractor utility in Text & Writing.",
    "keywords": [
      "email extractor",
      "text & writing",
      "text",
      "email",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 225,
    "name": "Phone Number Extractor",
    "studioId": "text",
    "description": "Phone Number Extractor utility in Text & Writing.",
    "keywords": [
      "phone number extractor",
      "text & writing",
      "text",
      "phone",
      "number",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 226,
    "name": "Text to ASCII",
    "studioId": "text",
    "description": "Text to ASCII utility in Text & Writing.",
    "keywords": [
      "text to ascii",
      "text & writing",
      "text",
      "ascii"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 227,
    "name": "ASCII to Text",
    "studioId": "text",
    "description": "ASCII to Text utility in Text & Writing.",
    "keywords": [
      "ascii to text",
      "text & writing",
      "text",
      "ascii"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 228,
    "name": "Unicode Inspector",
    "studioId": "text",
    "description": "Unicode Inspector utility in Text & Writing.",
    "keywords": [
      "unicode inspector",
      "text & writing",
      "text",
      "unicode",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 229,
    "name": "Text Encoder",
    "studioId": "text",
    "description": "Text Encoder utility in Text & Writing.",
    "keywords": [
      "text encoder",
      "text & writing",
      "text",
      "encoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 230,
    "name": "Text Decoder",
    "studioId": "text",
    "description": "Text Decoder utility in Text & Writing.",
    "keywords": [
      "text decoder",
      "text & writing",
      "text",
      "decoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 231,
    "name": "Lorem Ipsum Generator",
    "studioId": "text",
    "description": "Lorem Ipsum Generator utility in Text & Writing.",
    "keywords": [
      "lorem ipsum generator",
      "text & writing",
      "text",
      "lorem",
      "ipsum",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 232,
    "name": "Random Text Generator",
    "studioId": "text",
    "description": "Random Text Generator utility in Text & Writing.",
    "keywords": [
      "random text generator",
      "text & writing",
      "text",
      "random",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 233,
    "name": "Name List Generator",
    "studioId": "text",
    "description": "Name List Generator utility in Text & Writing.",
    "keywords": [
      "name list generator",
      "text & writing",
      "text",
      "name",
      "list",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 234,
    "name": "Text Statistics",
    "studioId": "text",
    "description": "Text Statistics utility in Text & Writing.",
    "keywords": [
      "text statistics",
      "text & writing",
      "text",
      "statistics"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 235,
    "name": "Grammar Assistant",
    "studioId": "text",
    "description": "Grammar Assistant utility in Text & Writing.",
    "keywords": [
      "grammar assistant",
      "text & writing",
      "text",
      "grammar",
      "assistant"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 236,
    "name": "Spell Checker",
    "studioId": "text",
    "description": "Spell Checker utility in Text & Writing.",
    "keywords": [
      "spell checker",
      "text & writing",
      "text",
      "spell",
      "checker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 237,
    "name": "Readability Analyzer",
    "studioId": "text",
    "description": "Readability Analyzer utility in Text & Writing.",
    "keywords": [
      "readability analyzer",
      "text & writing",
      "text",
      "readability",
      "analyzer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 238,
    "name": "Markdown Editor",
    "studioId": "text",
    "description": "Markdown Editor utility in Text & Writing.",
    "keywords": [
      "markdown editor",
      "text & writing",
      "text",
      "markdown",
      "editor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 239,
    "name": "Markdown Table Generator",
    "studioId": "text",
    "description": "Markdown Table Generator utility in Text & Writing.",
    "keywords": [
      "markdown table generator",
      "text & writing",
      "text",
      "markdown",
      "table",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 240,
    "name": "Meeting Notes Formatter",
    "studioId": "text",
    "description": "Meeting Notes Formatter utility in Text & Writing.",
    "keywords": [
      "meeting notes formatter",
      "text & writing",
      "text",
      "meeting",
      "notes",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 241,
    "name": "Resume Text Formatter",
    "studioId": "text",
    "description": "Resume Text Formatter utility in Text & Writing.",
    "keywords": [
      "resume text formatter",
      "text & writing",
      "text",
      "resume",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 242,
    "name": "Email Draft Assistant",
    "studioId": "text",
    "description": "Email Draft Assistant utility in Text & Writing.",
    "keywords": [
      "email draft assistant",
      "text & writing",
      "text",
      "email",
      "draft",
      "assistant"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 243,
    "name": "Bengali-English Text Helper",
    "studioId": "text",
    "description": "Bengali-English Text Helper utility in Text & Writing.",
    "keywords": [
      "bengali-english text helper",
      "text & writing",
      "text",
      "bengali-english",
      "helper"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Type",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 244,
    "name": "JSON Formatter",
    "studioId": "developer",
    "description": "JSON Formatter utility in Developer Tools.",
    "keywords": [
      "json formatter",
      "developer tools",
      "developer",
      "json",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 245,
    "name": "JSON Validator",
    "studioId": "developer",
    "description": "JSON Validator utility in Developer Tools.",
    "keywords": [
      "json validator",
      "developer tools",
      "developer",
      "json",
      "validator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 246,
    "name": "JSON Minifier",
    "studioId": "developer",
    "description": "JSON Minifier utility in Developer Tools.",
    "keywords": [
      "json minifier",
      "developer tools",
      "developer",
      "json",
      "minifier"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 247,
    "name": "JSON Diff",
    "studioId": "developer",
    "description": "JSON Diff utility in Developer Tools.",
    "keywords": [
      "json diff",
      "developer tools",
      "developer",
      "json",
      "diff"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 248,
    "name": "JSON Path Tester",
    "studioId": "developer",
    "description": "JSON Path Tester utility in Developer Tools.",
    "keywords": [
      "json path tester",
      "developer tools",
      "developer",
      "json",
      "path",
      "tester"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 249,
    "name": "JSON to TypeScript",
    "studioId": "developer",
    "description": "JSON to TypeScript utility in Developer Tools.",
    "keywords": [
      "json to typescript",
      "developer tools",
      "developer",
      "json",
      "typescript"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 250,
    "name": "JSON Schema Generator",
    "studioId": "developer",
    "description": "JSON Schema Generator utility in Developer Tools.",
    "keywords": [
      "json schema generator",
      "developer tools",
      "developer",
      "json",
      "schema",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 251,
    "name": "YAML Formatter",
    "studioId": "developer",
    "description": "YAML Formatter utility in Developer Tools.",
    "keywords": [
      "yaml formatter",
      "developer tools",
      "developer",
      "yaml",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 252,
    "name": "YAML Validator",
    "studioId": "developer",
    "description": "YAML Validator utility in Developer Tools.",
    "keywords": [
      "yaml validator",
      "developer tools",
      "developer",
      "yaml",
      "validator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 253,
    "name": "YAML to JSON",
    "studioId": "developer",
    "description": "YAML to JSON utility in Developer Tools.",
    "keywords": [
      "yaml to json",
      "developer tools",
      "developer",
      "yaml",
      "json"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 254,
    "name": "JSON to YAML",
    "studioId": "developer",
    "description": "JSON to YAML utility in Developer Tools.",
    "keywords": [
      "json to yaml",
      "developer tools",
      "developer",
      "json",
      "yaml"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 255,
    "name": "XML Validator",
    "studioId": "developer",
    "description": "XML Validator utility in Developer Tools.",
    "keywords": [
      "xml validator",
      "developer tools",
      "developer",
      "xml",
      "validator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 256,
    "name": "HTML Formatter",
    "studioId": "developer",
    "description": "HTML Formatter utility in Developer Tools.",
    "keywords": [
      "html formatter",
      "developer tools",
      "developer",
      "html",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 257,
    "name": "HTML Minifier",
    "studioId": "developer",
    "description": "HTML Minifier utility in Developer Tools.",
    "keywords": [
      "html minifier",
      "developer tools",
      "developer",
      "html",
      "minifier"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 258,
    "name": "CSS Formatter",
    "studioId": "developer",
    "description": "CSS Formatter utility in Developer Tools.",
    "keywords": [
      "css formatter",
      "developer tools",
      "developer",
      "css",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 259,
    "name": "CSS Minifier",
    "studioId": "developer",
    "description": "CSS Minifier utility in Developer Tools.",
    "keywords": [
      "css minifier",
      "developer tools",
      "developer",
      "css",
      "minifier"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 260,
    "name": "JavaScript Formatter",
    "studioId": "developer",
    "description": "JavaScript Formatter utility in Developer Tools.",
    "keywords": [
      "javascript formatter",
      "developer tools",
      "developer",
      "javascript",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 261,
    "name": "JavaScript Minifier",
    "studioId": "developer",
    "description": "JavaScript Minifier utility in Developer Tools.",
    "keywords": [
      "javascript minifier",
      "developer tools",
      "developer",
      "javascript",
      "minifier"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 262,
    "name": "SQL Formatter",
    "studioId": "developer",
    "description": "SQL Formatter utility in Developer Tools.",
    "keywords": [
      "sql formatter",
      "developer tools",
      "developer",
      "sql",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 263,
    "name": "SQL Minifier",
    "studioId": "developer",
    "description": "SQL Minifier utility in Developer Tools.",
    "keywords": [
      "sql minifier",
      "developer tools",
      "developer",
      "sql",
      "minifier"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 264,
    "name": "SQL Query Explainer",
    "studioId": "developer",
    "description": "SQL Query Explainer utility in Developer Tools.",
    "keywords": [
      "sql query explainer",
      "developer tools",
      "developer",
      "sql",
      "query",
      "explainer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 265,
    "name": "Regex Tester",
    "studioId": "developer",
    "description": "Regex Tester utility in Developer Tools.",
    "keywords": [
      "regex tester",
      "developer tools",
      "developer",
      "regex",
      "tester"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 266,
    "name": "Regex Explainer",
    "studioId": "developer",
    "description": "Regex Explainer utility in Developer Tools.",
    "keywords": [
      "regex explainer",
      "developer tools",
      "developer",
      "regex",
      "explainer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 267,
    "name": "Base64 Encoder",
    "studioId": "developer",
    "description": "Base64 Encoder utility in Developer Tools.",
    "keywords": [
      "base64 encoder",
      "developer tools",
      "developer",
      "base64",
      "encoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 268,
    "name": "Base64 Decoder",
    "studioId": "developer",
    "description": "Base64 Decoder utility in Developer Tools.",
    "keywords": [
      "base64 decoder",
      "developer tools",
      "developer",
      "base64",
      "decoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 269,
    "name": "URL Encoder",
    "studioId": "developer",
    "description": "URL Encoder utility in Developer Tools.",
    "keywords": [
      "url encoder",
      "developer tools",
      "developer",
      "url",
      "encoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 270,
    "name": "URL Decoder",
    "studioId": "developer",
    "description": "URL Decoder utility in Developer Tools.",
    "keywords": [
      "url decoder",
      "developer tools",
      "developer",
      "url",
      "decoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 271,
    "name": "HTML Entity Encoder",
    "studioId": "developer",
    "description": "HTML Entity Encoder utility in Developer Tools.",
    "keywords": [
      "html entity encoder",
      "developer tools",
      "developer",
      "html",
      "entity",
      "encoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 272,
    "name": "HTML Entity Decoder",
    "studioId": "developer",
    "description": "HTML Entity Decoder utility in Developer Tools.",
    "keywords": [
      "html entity decoder",
      "developer tools",
      "developer",
      "html",
      "entity",
      "decoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 273,
    "name": "JWT Decoder",
    "studioId": "developer",
    "description": "JWT Decoder utility in Developer Tools.",
    "keywords": [
      "jwt decoder",
      "developer tools",
      "developer",
      "jwt",
      "decoder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 274,
    "name": "UUID Generator",
    "studioId": "developer",
    "description": "UUID Generator utility in Developer Tools.",
    "keywords": [
      "uuid generator",
      "developer tools",
      "developer",
      "uuid",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 275,
    "name": "ULID Generator",
    "studioId": "developer",
    "description": "ULID Generator utility in Developer Tools.",
    "keywords": [
      "ulid generator",
      "developer tools",
      "developer",
      "ulid",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 276,
    "name": "Hash Generator",
    "studioId": "developer",
    "description": "Hash Generator utility in Developer Tools.",
    "keywords": [
      "hash generator",
      "developer tools",
      "developer",
      "hash",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 277,
    "name": "HMAC Generator",
    "studioId": "developer",
    "description": "HMAC Generator utility in Developer Tools.",
    "keywords": [
      "hmac generator",
      "developer tools",
      "developer",
      "hmac",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 278,
    "name": "Password Generator",
    "studioId": "developer",
    "description": "Password Generator utility in Developer Tools.",
    "keywords": [
      "password generator",
      "developer tools",
      "developer",
      "password",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 279,
    "name": "Bcrypt Hash Checker",
    "studioId": "developer",
    "description": "Bcrypt Hash Checker utility in Developer Tools.",
    "keywords": [
      "bcrypt hash checker",
      "developer tools",
      "developer",
      "bcrypt",
      "hash",
      "checker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 280,
    "name": "Color Code Converter",
    "studioId": "developer",
    "description": "Color Code Converter utility in Developer Tools.",
    "keywords": [
      "color code converter",
      "developer tools",
      "developer",
      "color",
      "code",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 281,
    "name": "Gradient Generator",
    "studioId": "developer",
    "description": "Gradient Generator utility in Developer Tools.",
    "keywords": [
      "gradient generator",
      "developer tools",
      "developer",
      "gradient",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 282,
    "name": "Box Shadow Generator",
    "studioId": "developer",
    "description": "Box Shadow Generator utility in Developer Tools.",
    "keywords": [
      "box shadow generator",
      "developer tools",
      "developer",
      "box",
      "shadow",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 283,
    "name": "Border Radius Generator",
    "studioId": "developer",
    "description": "Border Radius Generator utility in Developer Tools.",
    "keywords": [
      "border radius generator",
      "developer tools",
      "developer",
      "border",
      "radius",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 284,
    "name": "Flexbox Playground",
    "studioId": "developer",
    "description": "Flexbox Playground utility in Developer Tools.",
    "keywords": [
      "flexbox playground",
      "developer tools",
      "developer",
      "flexbox",
      "playground"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 285,
    "name": "Grid Generator",
    "studioId": "developer",
    "description": "Grid Generator utility in Developer Tools.",
    "keywords": [
      "grid generator",
      "developer tools",
      "developer",
      "grid",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 286,
    "name": "Unix Timestamp Converter",
    "studioId": "developer",
    "description": "Unix Timestamp Converter utility in Developer Tools.",
    "keywords": [
      "unix timestamp converter",
      "developer tools",
      "developer",
      "unix",
      "timestamp",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 287,
    "name": "Cron Expression Helper",
    "studioId": "developer",
    "description": "Cron Expression Helper utility in Developer Tools.",
    "keywords": [
      "cron expression helper",
      "developer tools",
      "developer",
      "cron",
      "expression",
      "helper"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 288,
    "name": "Diff & Patch Viewer",
    "studioId": "developer",
    "description": "Diff & Patch Viewer utility in Developer Tools.",
    "keywords": [
      "diff & patch viewer",
      "developer tools",
      "developer",
      "diff",
      "patch",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 289,
    "name": "URL Parser",
    "studioId": "developer",
    "description": "URL Parser utility in Developer Tools.",
    "keywords": [
      "url parser",
      "developer tools",
      "developer",
      "url",
      "parser"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 290,
    "name": "User-Agent Parser",
    "studioId": "developer",
    "description": "User-Agent Parser utility in Developer Tools.",
    "keywords": [
      "user-agent parser",
      "developer tools",
      "developer",
      "user-agent",
      "parser"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 291,
    "name": "HTTP Status Code Reference",
    "studioId": "developer",
    "description": "HTTP Status Code Reference utility in Developer Tools.",
    "keywords": [
      "http status code reference",
      "developer tools",
      "developer",
      "http",
      "status",
      "code",
      "reference"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 292,
    "name": "MIME Type Reference",
    "studioId": "developer",
    "description": "MIME Type Reference utility in Developer Tools.",
    "keywords": [
      "mime type reference",
      "developer tools",
      "developer",
      "mime",
      "type",
      "reference"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 293,
    "name": "Markdown Code Formatter",
    "studioId": "developer",
    "description": "Markdown Code Formatter utility in Developer Tools.",
    "keywords": [
      "markdown code formatter",
      "developer tools",
      "developer",
      "markdown",
      "code",
      "formatter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 294,
    "name": "SQL Insert Generator",
    "studioId": "developer",
    "description": "SQL Insert Generator utility in Developer Tools.",
    "keywords": [
      "sql insert generator",
      "developer tools",
      "developer",
      "sql",
      "insert",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 295,
    "name": "Mock JSON Generator",
    "studioId": "developer",
    "description": "Mock JSON Generator utility in Developer Tools.",
    "keywords": [
      "mock json generator",
      "developer tools",
      "developer",
      "mock",
      "json",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 296,
    "name": "API Request Builder",
    "studioId": "developer",
    "description": "API Request Builder utility in Developer Tools.",
    "keywords": [
      "api request builder",
      "developer tools",
      "developer",
      "api",
      "request",
      "builder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 297,
    "name": "cURL Converter",
    "studioId": "developer",
    "description": "cURL Converter utility in Developer Tools.",
    "keywords": [
      "curl converter",
      "developer tools",
      "developer",
      "curl",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 298,
    "name": "QR Payload Inspector",
    "studioId": "developer",
    "description": "QR Payload Inspector utility in Developer Tools.",
    "keywords": [
      "qr payload inspector",
      "developer tools",
      "developer",
      "payload",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 299,
    "name": "Certificate Inspector",
    "studioId": "developer",
    "description": "Certificate Inspector utility in Developer Tools.",
    "keywords": [
      "certificate inspector",
      "developer tools",
      "developer",
      "certificate",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 300,
    "name": "IP Subnet Calculator",
    "studioId": "developer",
    "description": "IP Subnet Calculator utility in Developer Tools.",
    "keywords": [
      "ip subnet calculator",
      "developer tools",
      "developer",
      "subnet",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Code",
    "inputKind": "text",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 301,
    "name": "Standard Calculator",
    "studioId": "calculators",
    "description": "Standard Calculator utility in Calculators.",
    "keywords": [
      "standard calculator",
      "calculators",
      "calculators",
      "standard",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 302,
    "name": "Scientific Calculator",
    "studioId": "calculators",
    "description": "Scientific Calculator utility in Calculators.",
    "keywords": [
      "scientific calculator",
      "calculators",
      "calculators",
      "scientific",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 303,
    "name": "Percentage Calculator",
    "studioId": "calculators",
    "description": "Percentage Calculator utility in Calculators.",
    "keywords": [
      "percentage calculator",
      "calculators",
      "calculators",
      "percentage",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 304,
    "name": "Discount Calculator",
    "studioId": "calculators",
    "description": "Discount Calculator utility in Calculators.",
    "keywords": [
      "discount calculator",
      "calculators",
      "calculators",
      "discount",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 305,
    "name": "GST Calculator",
    "studioId": "calculators",
    "description": "GST Calculator utility in Calculators.",
    "keywords": [
      "gst calculator",
      "calculators",
      "calculators",
      "gst",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 306,
    "name": "Income Tax Estimator",
    "studioId": "calculators",
    "description": "Income Tax Estimator utility in Calculators.",
    "keywords": [
      "income tax estimator",
      "calculators",
      "calculators",
      "income",
      "tax",
      "estimator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 307,
    "name": "EMI Calculator",
    "studioId": "calculators",
    "description": "EMI Calculator utility in Calculators.",
    "keywords": [
      "emi calculator",
      "calculators",
      "calculators",
      "emi",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 308,
    "name": "Interest Calculator",
    "studioId": "calculators",
    "description": "Interest Calculator utility in Calculators.",
    "keywords": [
      "interest calculator",
      "calculators",
      "calculators",
      "interest",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 309,
    "name": "Investment Return Calculator",
    "studioId": "calculators",
    "description": "Investment Return Calculator utility in Calculators.",
    "keywords": [
      "investment return calculator",
      "calculators",
      "calculators",
      "investment",
      "return",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 310,
    "name": "SIP Calculator",
    "studioId": "calculators",
    "description": "SIP Calculator utility in Calculators.",
    "keywords": [
      "sip calculator",
      "calculators",
      "calculators",
      "sip",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 311,
    "name": "Inflation Calculator",
    "studioId": "calculators",
    "description": "Inflation Calculator utility in Calculators.",
    "keywords": [
      "inflation calculator",
      "calculators",
      "calculators",
      "inflation",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 312,
    "name": "Age Calculator",
    "studioId": "calculators",
    "description": "Age Calculator utility in Calculators.",
    "keywords": [
      "age calculator",
      "calculators",
      "calculators",
      "age",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 313,
    "name": "Date Difference Calculator",
    "studioId": "calculators",
    "description": "Date Difference Calculator utility in Calculators.",
    "keywords": [
      "date difference calculator",
      "calculators",
      "calculators",
      "date",
      "difference",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 314,
    "name": "Date Add/Subtract",
    "studioId": "calculators",
    "description": "Date Add/Subtract utility in Calculators.",
    "keywords": [
      "date add/subtract",
      "calculators",
      "calculators",
      "date",
      "add/subtract"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 315,
    "name": "Time Duration Calculator",
    "studioId": "calculators",
    "description": "Time Duration Calculator utility in Calculators.",
    "keywords": [
      "time duration calculator",
      "calculators",
      "calculators",
      "time",
      "duration",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 316,
    "name": "Work Hours Calculator",
    "studioId": "calculators",
    "description": "Work Hours Calculator utility in Calculators.",
    "keywords": [
      "work hours calculator",
      "calculators",
      "calculators",
      "work",
      "hours",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 317,
    "name": "Salary Calculator",
    "studioId": "calculators",
    "description": "Salary Calculator utility in Calculators.",
    "keywords": [
      "salary calculator",
      "calculators",
      "calculators",
      "salary",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 318,
    "name": "Overtime Calculator",
    "studioId": "calculators",
    "description": "Overtime Calculator utility in Calculators.",
    "keywords": [
      "overtime calculator",
      "calculators",
      "calculators",
      "overtime",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 319,
    "name": "Unit Converter",
    "studioId": "calculators",
    "description": "Unit Converter utility in Calculators.",
    "keywords": [
      "unit converter",
      "calculators",
      "calculators",
      "unit",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 320,
    "name": "Length Converter",
    "studioId": "calculators",
    "description": "Length Converter utility in Calculators.",
    "keywords": [
      "length converter",
      "calculators",
      "calculators",
      "length",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 321,
    "name": "Weight Converter",
    "studioId": "calculators",
    "description": "Weight Converter utility in Calculators.",
    "keywords": [
      "weight converter",
      "calculators",
      "calculators",
      "weight",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 322,
    "name": "Temperature Converter",
    "studioId": "calculators",
    "description": "Temperature Converter utility in Calculators.",
    "keywords": [
      "temperature converter",
      "calculators",
      "calculators",
      "temperature",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 323,
    "name": "Area Converter",
    "studioId": "calculators",
    "description": "Area Converter utility in Calculators.",
    "keywords": [
      "area converter",
      "calculators",
      "calculators",
      "area",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 324,
    "name": "Volume Converter",
    "studioId": "calculators",
    "description": "Volume Converter utility in Calculators.",
    "keywords": [
      "volume converter",
      "calculators",
      "calculators",
      "volume",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 325,
    "name": "Speed Converter",
    "studioId": "calculators",
    "description": "Speed Converter utility in Calculators.",
    "keywords": [
      "speed converter",
      "calculators",
      "calculators",
      "speed",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 326,
    "name": "Pressure Converter",
    "studioId": "calculators",
    "description": "Pressure Converter utility in Calculators.",
    "keywords": [
      "pressure converter",
      "calculators",
      "calculators",
      "pressure",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 327,
    "name": "Data Storage Converter",
    "studioId": "calculators",
    "description": "Data Storage Converter utility in Calculators.",
    "keywords": [
      "data storage converter",
      "calculators",
      "calculators",
      "data",
      "storage",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 328,
    "name": "Number System Converter",
    "studioId": "calculators",
    "description": "Number System Converter utility in Calculators.",
    "keywords": [
      "number system converter",
      "calculators",
      "calculators",
      "number",
      "system",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 329,
    "name": "Fraction Calculator",
    "studioId": "calculators",
    "description": "Fraction Calculator utility in Calculators.",
    "keywords": [
      "fraction calculator",
      "calculators",
      "calculators",
      "fraction",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 330,
    "name": "Ratio Calculator",
    "studioId": "calculators",
    "description": "Ratio Calculator utility in Calculators.",
    "keywords": [
      "ratio calculator",
      "calculators",
      "calculators",
      "ratio",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 331,
    "name": "Average Calculator",
    "studioId": "calculators",
    "description": "Average Calculator utility in Calculators.",
    "keywords": [
      "average calculator",
      "calculators",
      "calculators",
      "average",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 332,
    "name": "Probability Calculator",
    "studioId": "calculators",
    "description": "Probability Calculator utility in Calculators.",
    "keywords": [
      "probability calculator",
      "calculators",
      "calculators",
      "probability",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 333,
    "name": "BMI Calculator",
    "studioId": "calculators",
    "description": "BMI Calculator utility in Calculators.",
    "keywords": [
      "bmi calculator",
      "calculators",
      "calculators",
      "bmi",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 334,
    "name": "Calorie Estimator",
    "studioId": "calculators",
    "description": "Calorie Estimator utility in Calculators.",
    "keywords": [
      "calorie estimator",
      "calculators",
      "calculators",
      "calorie",
      "estimator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 335,
    "name": "Fuel Cost Calculator",
    "studioId": "calculators",
    "description": "Fuel Cost Calculator utility in Calculators.",
    "keywords": [
      "fuel cost calculator",
      "calculators",
      "calculators",
      "fuel",
      "cost",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 336,
    "name": "Mileage Calculator",
    "studioId": "calculators",
    "description": "Mileage Calculator utility in Calculators.",
    "keywords": [
      "mileage calculator",
      "calculators",
      "calculators",
      "mileage",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 337,
    "name": "Electricity Bill Estimator",
    "studioId": "calculators",
    "description": "Electricity Bill Estimator utility in Calculators.",
    "keywords": [
      "electricity bill estimator",
      "calculators",
      "calculators",
      "electricity",
      "bill",
      "estimator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 338,
    "name": "Tip Calculator",
    "studioId": "calculators",
    "description": "Tip Calculator utility in Calculators.",
    "keywords": [
      "tip calculator",
      "calculators",
      "calculators",
      "tip",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 339,
    "name": "Bill Splitter",
    "studioId": "calculators",
    "description": "Bill Splitter utility in Calculators.",
    "keywords": [
      "bill splitter",
      "calculators",
      "calculators",
      "bill",
      "splitter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 340,
    "name": "Number to Words",
    "studioId": "calculators",
    "description": "Number to Words utility in Calculators.",
    "keywords": [
      "number to words",
      "calculators",
      "calculators",
      "number",
      "words"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 341,
    "name": "Roman Numeral Converter",
    "studioId": "calculators",
    "description": "Roman Numeral Converter utility in Calculators.",
    "keywords": [
      "roman numeral converter",
      "calculators",
      "calculators",
      "roman",
      "numeral",
      "converter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 342,
    "name": "Random Number Generator",
    "studioId": "calculators",
    "description": "Random Number Generator utility in Calculators.",
    "keywords": [
      "random number generator",
      "calculators",
      "calculators",
      "random",
      "number",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 343,
    "name": "Dice Roller",
    "studioId": "calculators",
    "description": "Dice Roller utility in Calculators.",
    "keywords": [
      "dice roller",
      "calculators",
      "calculators",
      "dice",
      "roller"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 344,
    "name": "Stopwatch",
    "studioId": "calculators",
    "description": "Stopwatch utility in Calculators.",
    "keywords": [
      "stopwatch",
      "calculators",
      "calculators"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 345,
    "name": "Timer",
    "studioId": "calculators",
    "description": "Timer utility in Calculators.",
    "keywords": [
      "timer",
      "calculators",
      "calculators"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 346,
    "name": "Alarm & Reminder",
    "studioId": "calculators",
    "description": "Alarm & Reminder utility in Calculators.",
    "keywords": [
      "alarm & reminder",
      "calculators",
      "calculators",
      "alarm",
      "reminder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 347,
    "name": "World Clock",
    "studioId": "calculators",
    "description": "World Clock utility in Calculators.",
    "keywords": [
      "world clock",
      "calculators",
      "calculators",
      "world",
      "clock"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 348,
    "name": "Calendar Week Calculator",
    "studioId": "calculators",
    "description": "Calendar Week Calculator utility in Calculators.",
    "keywords": [
      "calendar week calculator",
      "calculators",
      "calculators",
      "calendar",
      "week",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 349,
    "name": "Unit Price Comparator",
    "studioId": "calculators",
    "description": "Unit Price Comparator utility in Calculators.",
    "keywords": [
      "unit price comparator",
      "calculators",
      "calculators",
      "unit",
      "price",
      "comparator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 350,
    "name": "Break-Even Calculator",
    "studioId": "calculators",
    "description": "Break-Even Calculator utility in Calculators.",
    "keywords": [
      "break-even calculator",
      "calculators",
      "calculators",
      "break-even",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Calculator",
    "inputKind": "form",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 351,
    "name": "QR Code Generator",
    "studioId": "qr_security",
    "description": "QR Code Generator utility in QR, Barcode & Security.",
    "keywords": [
      "qr code generator",
      "qr, barcode & security",
      "qr_security",
      "code",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 352,
    "name": "QR Code Scanner",
    "studioId": "qr_security",
    "description": "QR Code Scanner utility in QR, Barcode & Security.",
    "keywords": [
      "qr code scanner",
      "qr, barcode & security",
      "qr_security",
      "code",
      "scanner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 353,
    "name": "Wi-Fi QR Generator",
    "studioId": "qr_security",
    "description": "Wi-Fi QR Generator utility in QR, Barcode & Security.",
    "keywords": [
      "wi-fi qr generator",
      "qr, barcode & security",
      "qr_security",
      "wi-fi",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 354,
    "name": "Contact QR Generator",
    "studioId": "qr_security",
    "description": "Contact QR Generator utility in QR, Barcode & Security.",
    "keywords": [
      "contact qr generator",
      "qr, barcode & security",
      "qr_security",
      "contact",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 355,
    "name": "URL QR Generator",
    "studioId": "qr_security",
    "description": "URL QR Generator utility in QR, Barcode & Security.",
    "keywords": [
      "url qr generator",
      "qr, barcode & security",
      "qr_security",
      "url",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 356,
    "name": "Text QR Generator",
    "studioId": "qr_security",
    "description": "Text QR Generator utility in QR, Barcode & Security.",
    "keywords": [
      "text qr generator",
      "qr, barcode & security",
      "qr_security",
      "text",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 357,
    "name": "Email QR Generator",
    "studioId": "qr_security",
    "description": "Email QR Generator utility in QR, Barcode & Security.",
    "keywords": [
      "email qr generator",
      "qr, barcode & security",
      "qr_security",
      "email",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 358,
    "name": "Phone QR Generator",
    "studioId": "qr_security",
    "description": "Phone QR Generator utility in QR, Barcode & Security.",
    "keywords": [
      "phone qr generator",
      "qr, barcode & security",
      "qr_security",
      "phone",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 359,
    "name": "SMS QR Generator",
    "studioId": "qr_security",
    "description": "SMS QR Generator utility in QR, Barcode & Security.",
    "keywords": [
      "sms qr generator",
      "qr, barcode & security",
      "qr_security",
      "sms",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 360,
    "name": "vCard Generator",
    "studioId": "qr_security",
    "description": "vCard Generator utility in QR, Barcode & Security.",
    "keywords": [
      "vcard generator",
      "qr, barcode & security",
      "qr_security",
      "vcard",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 361,
    "name": "Barcode Generator",
    "studioId": "qr_security",
    "description": "Barcode Generator utility in QR, Barcode & Security.",
    "keywords": [
      "barcode generator",
      "qr, barcode & security",
      "qr_security",
      "barcode",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 362,
    "name": "Barcode Scanner",
    "studioId": "qr_security",
    "description": "Barcode Scanner utility in QR, Barcode & Security.",
    "keywords": [
      "barcode scanner",
      "qr, barcode & security",
      "qr_security",
      "barcode",
      "scanner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 363,
    "name": "QR Code Customizer",
    "studioId": "qr_security",
    "description": "QR Code Customizer utility in QR, Barcode & Security.",
    "keywords": [
      "qr code customizer",
      "qr, barcode & security",
      "qr_security",
      "code",
      "customizer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 364,
    "name": "QR Code Batch Generator",
    "studioId": "qr_security",
    "description": "QR Code Batch Generator utility in QR, Barcode & Security.",
    "keywords": [
      "qr code batch generator",
      "qr, barcode & security",
      "qr_security",
      "code",
      "batch",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 365,
    "name": "QR Code Reader History",
    "studioId": "qr_security",
    "description": "QR Code Reader History utility in QR, Barcode & Security.",
    "keywords": [
      "qr code reader history",
      "qr, barcode & security",
      "qr_security",
      "code",
      "reader",
      "history"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 366,
    "name": "URL Safety Checker",
    "studioId": "qr_security",
    "description": "URL Safety Checker utility in QR, Barcode & Security.",
    "keywords": [
      "url safety checker",
      "qr, barcode & security",
      "qr_security",
      "url",
      "safety",
      "checker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 367,
    "name": "Password Strength Checker",
    "studioId": "qr_security",
    "description": "Password Strength Checker utility in QR, Barcode & Security.",
    "keywords": [
      "password strength checker",
      "qr, barcode & security",
      "qr_security",
      "password",
      "strength",
      "checker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 368,
    "name": "Random Password Generator",
    "studioId": "qr_security",
    "description": "Random Password Generator utility in QR, Barcode & Security.",
    "keywords": [
      "random password generator",
      "qr, barcode & security",
      "qr_security",
      "random",
      "password",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 369,
    "name": "Passphrase Generator",
    "studioId": "qr_security",
    "description": "Passphrase Generator utility in QR, Barcode & Security.",
    "keywords": [
      "passphrase generator",
      "qr, barcode & security",
      "qr_security",
      "passphrase",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 370,
    "name": "Secure Notes",
    "studioId": "qr_security",
    "description": "Secure Notes utility in QR, Barcode & Security.",
    "keywords": [
      "secure notes",
      "qr, barcode & security",
      "qr_security",
      "secure",
      "notes"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 371,
    "name": "Secret Redactor",
    "studioId": "qr_security",
    "description": "Secret Redactor utility in QR, Barcode & Security.",
    "keywords": [
      "secret redactor",
      "qr, barcode & security",
      "qr_security",
      "secret",
      "redactor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 372,
    "name": "File Hash Verifier",
    "studioId": "qr_security",
    "description": "File Hash Verifier utility in QR, Barcode & Security.",
    "keywords": [
      "file hash verifier",
      "qr, barcode & security",
      "qr_security",
      "file",
      "hash",
      "verifier"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 373,
    "name": "Text Hash Generator",
    "studioId": "qr_security",
    "description": "Text Hash Generator utility in QR, Barcode & Security.",
    "keywords": [
      "text hash generator",
      "qr, barcode & security",
      "qr_security",
      "text",
      "hash",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 374,
    "name": "TOTP Authenticator",
    "studioId": "qr_security",
    "description": "TOTP Authenticator utility in QR, Barcode & Security.",
    "keywords": [
      "totp authenticator",
      "qr, barcode & security",
      "qr_security",
      "totp",
      "authenticator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 375,
    "name": "Privacy Metadata Cleaner",
    "studioId": "qr_security",
    "description": "Privacy Metadata Cleaner utility in QR, Barcode & Security.",
    "keywords": [
      "privacy metadata cleaner",
      "qr, barcode & security",
      "qr_security",
      "privacy",
      "metadata",
      "cleaner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "QrCode",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 376,
    "name": "URL Shortener",
    "studioId": "web",
    "description": "URL Shortener utility in Web & Internet.",
    "keywords": [
      "url shortener",
      "web & internet",
      "web",
      "url",
      "shortener"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 377,
    "name": "URL Expander",
    "studioId": "web",
    "description": "URL Expander utility in Web & Internet.",
    "keywords": [
      "url expander",
      "web & internet",
      "web",
      "url",
      "expander"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 378,
    "name": "Website QR Generator",
    "studioId": "web",
    "description": "Website QR Generator utility in Web & Internet.",
    "keywords": [
      "website qr generator",
      "web & internet",
      "web",
      "website",
      "generator"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 379,
    "name": "Website Metadata Viewer",
    "studioId": "web",
    "description": "Website Metadata Viewer utility in Web & Internet.",
    "keywords": [
      "website metadata viewer",
      "web & internet",
      "web",
      "website",
      "metadata",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 380,
    "name": "HTML Previewer",
    "studioId": "web",
    "description": "HTML Previewer utility in Web & Internet.",
    "keywords": [
      "html previewer",
      "web & internet",
      "web",
      "html",
      "previewer"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 381,
    "name": "Open Graph Preview",
    "studioId": "web",
    "description": "Open Graph Preview utility in Web & Internet.",
    "keywords": [
      "open graph preview",
      "web & internet",
      "web",
      "open",
      "graph",
      "preview"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 382,
    "name": "Robots.txt Viewer",
    "studioId": "web",
    "description": "Robots.txt Viewer utility in Web & Internet.",
    "keywords": [
      "robots.txt viewer",
      "web & internet",
      "web",
      "robots.txt",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 383,
    "name": "Sitemap Viewer",
    "studioId": "web",
    "description": "Sitemap Viewer utility in Web & Internet.",
    "keywords": [
      "sitemap viewer",
      "web & internet",
      "web",
      "sitemap",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 384,
    "name": "DNS Lookup",
    "studioId": "web",
    "description": "DNS Lookup utility in Web & Internet.",
    "keywords": [
      "dns lookup",
      "web & internet",
      "web",
      "dns",
      "lookup"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 385,
    "name": "Public IP Checker",
    "studioId": "web",
    "description": "Public IP Checker utility in Web & Internet.",
    "keywords": [
      "public ip checker",
      "web & internet",
      "web",
      "public",
      "checker"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 386,
    "name": "IP Information Lookup",
    "studioId": "web",
    "description": "IP Information Lookup utility in Web & Internet.",
    "keywords": [
      "ip information lookup",
      "web & internet",
      "web",
      "information",
      "lookup"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 387,
    "name": "Internet Speed Test",
    "studioId": "web",
    "description": "Internet Speed Test utility in Web & Internet.",
    "keywords": [
      "internet speed test",
      "web & internet",
      "web",
      "internet",
      "speed",
      "test"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 388,
    "name": "Network Latency Checker",
    "studioId": "web",
    "description": "Network Latency Checker utility in Web & Internet.",
    "keywords": [
      "network latency checker",
      "web & internet",
      "web",
      "network",
      "latency",
      "checker"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 389,
    "name": "HTTP Header Inspector",
    "studioId": "web",
    "description": "HTTP Header Inspector utility in Web & Internet.",
    "keywords": [
      "http header inspector",
      "web & internet",
      "web",
      "http",
      "header",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 390,
    "name": "SSL Certificate Checker",
    "studioId": "web",
    "description": "SSL Certificate Checker utility in Web & Internet.",
    "keywords": [
      "ssl certificate checker",
      "web & internet",
      "web",
      "ssl",
      "certificate",
      "checker"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 391,
    "name": "Website Availability Checker",
    "studioId": "web",
    "description": "Website Availability Checker utility in Web & Internet.",
    "keywords": [
      "website availability checker",
      "web & internet",
      "web",
      "website",
      "availability",
      "checker"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 392,
    "name": "Link Extractor",
    "studioId": "web",
    "description": "Link Extractor utility in Web & Internet.",
    "keywords": [
      "link extractor",
      "web & internet",
      "web",
      "link",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 393,
    "name": "Meta Tag Generator",
    "studioId": "web",
    "description": "Meta Tag Generator utility in Web & Internet.",
    "keywords": [
      "meta tag generator",
      "web & internet",
      "web",
      "meta",
      "tag",
      "generator"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 394,
    "name": "Sitemap Generator",
    "studioId": "web",
    "description": "Sitemap Generator utility in Web & Internet.",
    "keywords": [
      "sitemap generator",
      "web & internet",
      "web",
      "sitemap",
      "generator"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 395,
    "name": "URL Validator",
    "studioId": "web",
    "description": "URL Validator utility in Web & Internet.",
    "keywords": [
      "url validator",
      "web & internet",
      "web",
      "url",
      "validator"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 396,
    "name": "Data URI Generator",
    "studioId": "web",
    "description": "Data URI Generator utility in Web & Internet.",
    "keywords": [
      "data uri generator",
      "web & internet",
      "web",
      "data",
      "uri",
      "generator"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 397,
    "name": "QR Link Preview",
    "studioId": "web",
    "description": "QR Link Preview utility in Web & Internet.",
    "keywords": [
      "qr link preview",
      "web & internet",
      "web",
      "link",
      "preview"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 398,
    "name": "Webpage Screenshot",
    "studioId": "web",
    "description": "Webpage Screenshot utility in Web & Internet.",
    "keywords": [
      "webpage screenshot",
      "web & internet",
      "web",
      "webpage",
      "screenshot"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 399,
    "name": "Webpage to Markdown",
    "studioId": "web",
    "description": "Webpage to Markdown utility in Web & Internet.",
    "keywords": [
      "webpage to markdown",
      "web & internet",
      "web",
      "webpage",
      "markdown"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 400,
    "name": "Website Word Counter",
    "studioId": "web",
    "description": "Website Word Counter utility in Web & Internet.",
    "keywords": [
      "website word counter",
      "web & internet",
      "web",
      "website",
      "word",
      "counter"
    ],
    "status": "available",
    "offlineCapable": false,
    "iconName": "Globe",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 401,
    "name": "AI Utility Assistant",
    "studioId": "ai",
    "description": "AI Utility Assistant utility in AI Studio.",
    "keywords": [
      "ai utility assistant",
      "ai studio",
      "ai",
      "utility",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 402,
    "name": "AI PDF Assistant",
    "studioId": "ai",
    "description": "AI PDF Assistant utility in AI Studio.",
    "keywords": [
      "ai pdf assistant",
      "ai studio",
      "ai",
      "pdf",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 403,
    "name": "AI Document Extractor",
    "studioId": "ai",
    "description": "AI Document Extractor utility in AI Studio.",
    "keywords": [
      "ai document extractor",
      "ai studio",
      "ai",
      "document",
      "extractor"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 404,
    "name": "AI Writing Assistant",
    "studioId": "ai",
    "description": "AI Writing Assistant utility in AI Studio.",
    "keywords": [
      "ai writing assistant",
      "ai studio",
      "ai",
      "writing",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 405,
    "name": "AI Image Assistant",
    "studioId": "ai",
    "description": "AI Image Assistant utility in AI Studio.",
    "keywords": [
      "ai image assistant",
      "ai studio",
      "ai",
      "image",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 406,
    "name": "AI Translator",
    "studioId": "ai",
    "description": "AI Translator utility in AI Studio.",
    "keywords": [
      "ai translator",
      "ai studio",
      "ai",
      "translator"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 407,
    "name": "AI Voice Assistant",
    "studioId": "ai",
    "description": "AI Voice Assistant utility in AI Studio.",
    "keywords": [
      "ai voice assistant",
      "ai studio",
      "ai",
      "voice",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 408,
    "name": "AI Image-to-Text",
    "studioId": "ai",
    "description": "AI Image-to-Text utility in AI Studio.",
    "keywords": [
      "ai image-to-text",
      "ai studio",
      "ai",
      "image-to-text"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 409,
    "name": "AI Resume Builder",
    "studioId": "ai",
    "description": "AI Resume Builder utility in AI Studio.",
    "keywords": [
      "ai resume builder",
      "ai studio",
      "ai",
      "resume",
      "builder"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 410,
    "name": "AI Code Assistant",
    "studioId": "ai",
    "description": "AI Code Assistant utility in AI Studio.",
    "keywords": [
      "ai code assistant",
      "ai studio",
      "ai",
      "code",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 411,
    "name": "AI Email Assistant",
    "studioId": "ai",
    "description": "AI Email Assistant utility in AI Studio.",
    "keywords": [
      "ai email assistant",
      "ai studio",
      "ai",
      "email",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 412,
    "name": "AI Meeting Summarizer",
    "studioId": "ai",
    "description": "AI Meeting Summarizer utility in AI Studio.",
    "keywords": [
      "ai meeting summarizer",
      "ai studio",
      "ai",
      "meeting",
      "summarizer"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 413,
    "name": "AI Study Assistant",
    "studioId": "ai",
    "description": "AI Study Assistant utility in AI Studio.",
    "keywords": [
      "ai study assistant",
      "ai studio",
      "ai",
      "study",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 414,
    "name": "AI Smart Tool Router",
    "studioId": "ai",
    "description": "AI Smart Tool Router utility in AI Studio.",
    "keywords": [
      "ai smart tool router",
      "ai studio",
      "ai",
      "smart",
      "tool",
      "router"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 415,
    "name": "AI Document Comparison",
    "studioId": "ai",
    "description": "AI Document Comparison utility in AI Studio.",
    "keywords": [
      "ai document comparison",
      "ai studio",
      "ai",
      "document",
      "comparison"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 416,
    "name": "AI Data Analyst",
    "studioId": "ai",
    "description": "AI Data Analyst utility in AI Studio.",
    "keywords": [
      "ai data analyst",
      "ai studio",
      "ai",
      "data",
      "analyst"
    ],
    "status": "coming_soon",
    "offlineCapable": false,
    "iconName": "Sparkles",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 417,
    "name": "Notes App",
    "studioId": "productivity",
    "description": "Notes App utility in Productivity & Education.",
    "keywords": [
      "notes app",
      "productivity & education",
      "productivity",
      "notes",
      "app"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 418,
    "name": "Checklist Maker",
    "studioId": "productivity",
    "description": "Checklist Maker utility in Productivity & Education.",
    "keywords": [
      "checklist maker",
      "productivity & education",
      "productivity",
      "checklist",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 419,
    "name": "To-Do List",
    "studioId": "productivity",
    "description": "To-Do List utility in Productivity & Education.",
    "keywords": [
      "to-do list",
      "productivity & education",
      "productivity",
      "to-do",
      "list"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 420,
    "name": "Habit Tracker",
    "studioId": "productivity",
    "description": "Habit Tracker utility in Productivity & Education.",
    "keywords": [
      "habit tracker",
      "productivity & education",
      "productivity",
      "habit",
      "tracker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 421,
    "name": "Expense Splitter",
    "studioId": "productivity",
    "description": "Expense Splitter utility in Productivity & Education.",
    "keywords": [
      "expense splitter",
      "productivity & education",
      "productivity",
      "expense",
      "splitter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 422,
    "name": "Personal Expense Tracker",
    "studioId": "productivity",
    "description": "Personal Expense Tracker utility in Productivity & Education.",
    "keywords": [
      "personal expense tracker",
      "productivity & education",
      "productivity",
      "personal",
      "expense",
      "tracker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 423,
    "name": "Budget Planner",
    "studioId": "productivity",
    "description": "Budget Planner utility in Productivity & Education.",
    "keywords": [
      "budget planner",
      "productivity & education",
      "productivity",
      "budget",
      "planner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 424,
    "name": "Invoice Generator",
    "studioId": "productivity",
    "description": "Invoice Generator utility in Productivity & Education.",
    "keywords": [
      "invoice generator",
      "productivity & education",
      "productivity",
      "invoice",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 425,
    "name": "Receipt Generator",
    "studioId": "productivity",
    "description": "Receipt Generator utility in Productivity & Education.",
    "keywords": [
      "receipt generator",
      "productivity & education",
      "productivity",
      "receipt",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 426,
    "name": "Quotation Generator",
    "studioId": "productivity",
    "description": "Quotation Generator utility in Productivity & Education.",
    "keywords": [
      "quotation generator",
      "productivity & education",
      "productivity",
      "quotation",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 427,
    "name": "Business Card Maker",
    "studioId": "productivity",
    "description": "Business Card Maker utility in Productivity & Education.",
    "keywords": [
      "business card maker",
      "productivity & education",
      "productivity",
      "business",
      "card",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 428,
    "name": "Resume PDF Maker",
    "studioId": "productivity",
    "description": "Resume PDF Maker utility in Productivity & Education.",
    "keywords": [
      "resume pdf maker",
      "productivity & education",
      "productivity",
      "resume",
      "pdf",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 429,
    "name": "Cover Letter Generator",
    "studioId": "productivity",
    "description": "Cover Letter Generator utility in Productivity & Education.",
    "keywords": [
      "cover letter generator",
      "productivity & education",
      "productivity",
      "cover",
      "letter",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 430,
    "name": "Timetable Maker",
    "studioId": "productivity",
    "description": "Timetable Maker utility in Productivity & Education.",
    "keywords": [
      "timetable maker",
      "productivity & education",
      "productivity",
      "timetable",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 431,
    "name": "Flashcard Maker",
    "studioId": "productivity",
    "description": "Flashcard Maker utility in Productivity & Education.",
    "keywords": [
      "flashcard maker",
      "productivity & education",
      "productivity",
      "flashcard",
      "maker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 432,
    "name": "Quiz Generator",
    "studioId": "productivity",
    "description": "Quiz Generator utility in Productivity & Education.",
    "keywords": [
      "quiz generator",
      "productivity & education",
      "productivity",
      "quiz",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 433,
    "name": "Unit Conversion Reference",
    "studioId": "productivity",
    "description": "Unit Conversion Reference utility in Productivity & Education.",
    "keywords": [
      "unit conversion reference",
      "productivity & education",
      "productivity",
      "unit",
      "conversion",
      "reference"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 434,
    "name": "Dictionary",
    "studioId": "productivity",
    "description": "Dictionary utility in Productivity & Education.",
    "keywords": [
      "dictionary",
      "productivity & education",
      "productivity"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 435,
    "name": "Synonym Finder",
    "studioId": "productivity",
    "description": "Synonym Finder utility in Productivity & Education.",
    "keywords": [
      "synonym finder",
      "productivity & education",
      "productivity",
      "synonym",
      "finder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 436,
    "name": "Antonym Finder",
    "studioId": "productivity",
    "description": "Antonym Finder utility in Productivity & Education.",
    "keywords": [
      "antonym finder",
      "productivity & education",
      "productivity",
      "antonym",
      "finder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 437,
    "name": "Word Pronunciation",
    "studioId": "productivity",
    "description": "Word Pronunciation utility in Productivity & Education.",
    "keywords": [
      "word pronunciation",
      "productivity & education",
      "productivity",
      "word",
      "pronunciation"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 438,
    "name": "Text Reader",
    "studioId": "productivity",
    "description": "Text Reader utility in Productivity & Education.",
    "keywords": [
      "text reader",
      "productivity & education",
      "productivity",
      "text",
      "reader"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 439,
    "name": "QR Contact Card",
    "studioId": "productivity",
    "description": "QR Contact Card utility in Productivity & Education.",
    "keywords": [
      "qr contact card",
      "productivity & education",
      "productivity",
      "contact",
      "card"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 440,
    "name": "Barcode Inventory List",
    "studioId": "productivity",
    "description": "Barcode Inventory List utility in Productivity & Education.",
    "keywords": [
      "barcode inventory list",
      "productivity & education",
      "productivity",
      "barcode",
      "inventory",
      "list"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 441,
    "name": "Document Expiry Reminder",
    "studioId": "productivity",
    "description": "Document Expiry Reminder utility in Productivity & Education.",
    "keywords": [
      "document expiry reminder",
      "productivity & education",
      "productivity",
      "document",
      "expiry",
      "reminder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 442,
    "name": "Birthday Reminder",
    "studioId": "productivity",
    "description": "Birthday Reminder utility in Productivity & Education.",
    "keywords": [
      "birthday reminder",
      "productivity & education",
      "productivity",
      "birthday",
      "reminder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 443,
    "name": "World Holiday Calendar",
    "studioId": "productivity",
    "description": "World Holiday Calendar utility in Productivity & Education.",
    "keywords": [
      "world holiday calendar",
      "productivity & education",
      "productivity",
      "world",
      "holiday",
      "calendar"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 444,
    "name": "Calendar Event Calculator",
    "studioId": "productivity",
    "description": "Calendar Event Calculator utility in Productivity & Education.",
    "keywords": [
      "calendar event calculator",
      "productivity & education",
      "productivity",
      "calendar",
      "event",
      "calculator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 445,
    "name": "Focus Timer",
    "studioId": "productivity",
    "description": "Focus Timer utility in Productivity & Education.",
    "keywords": [
      "focus timer",
      "productivity & education",
      "productivity",
      "focus",
      "timer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 446,
    "name": "Pomodoro Timer",
    "studioId": "productivity",
    "description": "Pomodoro Timer utility in Productivity & Education.",
    "keywords": [
      "pomodoro timer",
      "productivity & education",
      "productivity",
      "pomodoro",
      "timer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": true
  },
  {
    "id": 447,
    "name": "Random Decision Picker",
    "studioId": "productivity",
    "description": "Random Decision Picker utility in Productivity & Education.",
    "keywords": [
      "random decision picker",
      "productivity & education",
      "productivity",
      "random",
      "decision",
      "picker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 448,
    "name": "Wheel of Names",
    "studioId": "productivity",
    "description": "Wheel of Names utility in Productivity & Education.",
    "keywords": [
      "wheel of names",
      "productivity & education",
      "productivity",
      "wheel",
      "names"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 449,
    "name": "QR Attendance Generator",
    "studioId": "productivity",
    "description": "QR Attendance Generator utility in Productivity & Education.",
    "keywords": [
      "qr attendance generator",
      "productivity & education",
      "productivity",
      "attendance",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 450,
    "name": "QR Attendance Scanner",
    "studioId": "productivity",
    "description": "QR Attendance Scanner utility in Productivity & Education.",
    "keywords": [
      "qr attendance scanner",
      "productivity & education",
      "productivity",
      "attendance",
      "scanner"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "CheckSquare",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 451,
    "name": "Magnifier",
    "studioId": "accessibility",
    "description": "Magnifier utility in Accessibility & Device.",
    "keywords": [
      "magnifier",
      "accessibility & device",
      "accessibility"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 452,
    "name": "Flashlight",
    "studioId": "accessibility",
    "description": "Flashlight utility in Accessibility & Device.",
    "keywords": [
      "flashlight",
      "accessibility & device",
      "accessibility",
      "torch",
      "light"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 453,
    "name": "Screen Color Picker",
    "studioId": "accessibility",
    "description": "Screen Color Picker utility in Accessibility & Device.",
    "keywords": [
      "screen color picker",
      "accessibility & device",
      "accessibility",
      "screen",
      "color",
      "picker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 454,
    "name": "Text Size Preview",
    "studioId": "accessibility",
    "description": "Text Size Preview utility in Accessibility & Device.",
    "keywords": [
      "text size preview",
      "accessibility & device",
      "accessibility",
      "text",
      "size",
      "preview"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 455,
    "name": "Contrast Checker",
    "studioId": "accessibility",
    "description": "Contrast Checker utility in Accessibility & Device.",
    "keywords": [
      "contrast checker",
      "accessibility & device",
      "accessibility",
      "contrast",
      "checker"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 456,
    "name": "Color Blindness Simulator",
    "studioId": "accessibility",
    "description": "Color Blindness Simulator utility in Accessibility & Device.",
    "keywords": [
      "color blindness simulator",
      "accessibility & device",
      "accessibility",
      "color",
      "blindness",
      "simulator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 457,
    "name": "Speech-to-Text",
    "studioId": "accessibility",
    "description": "Speech-to-Text utility in Accessibility & Device.",
    "keywords": [
      "speech-to-text",
      "accessibility & device",
      "accessibility"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 458,
    "name": "Text-to-Speech Reader",
    "studioId": "accessibility",
    "description": "Text-to-Speech Reader utility in Accessibility & Device.",
    "keywords": [
      "text-to-speech reader",
      "accessibility & device",
      "accessibility",
      "text-to-speech",
      "reader"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 459,
    "name": "Large Text Reader",
    "studioId": "accessibility",
    "description": "Large Text Reader utility in Accessibility & Device.",
    "keywords": [
      "large text reader",
      "accessibility & device",
      "accessibility",
      "large",
      "text",
      "reader"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 460,
    "name": "Document Read-Aloud",
    "studioId": "accessibility",
    "description": "Document Read-Aloud utility in Accessibility & Device.",
    "keywords": [
      "document read-aloud",
      "accessibility & device",
      "accessibility",
      "document",
      "read-aloud"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 461,
    "name": "Image Description Assistant",
    "studioId": "accessibility",
    "description": "Image Description Assistant utility in Accessibility & Device.",
    "keywords": [
      "image description assistant",
      "accessibility & device",
      "accessibility",
      "image",
      "description",
      "assistant"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 462,
    "name": "Haptic Timer",
    "studioId": "accessibility",
    "description": "Haptic Timer utility in Accessibility & Device.",
    "keywords": [
      "haptic timer",
      "accessibility & device",
      "accessibility",
      "haptic",
      "timer",
      "vibration"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 463,
    "name": "Sound Level Meter",
    "studioId": "accessibility",
    "description": "Sound Level Meter utility in Accessibility & Device.",
    "keywords": [
      "sound level meter",
      "accessibility & device",
      "accessibility",
      "sound",
      "level",
      "meter"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 464,
    "name": "Screen Resolution Viewer",
    "studioId": "accessibility",
    "description": "Screen Resolution Viewer utility in Accessibility & Device.",
    "keywords": [
      "screen resolution viewer",
      "accessibility & device",
      "accessibility",
      "screen",
      "resolution",
      "viewer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 465,
    "name": "Device Information",
    "studioId": "accessibility",
    "description": "Device Information utility in Accessibility & Device.",
    "keywords": [
      "device information",
      "accessibility & device",
      "accessibility",
      "device",
      "information"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 466,
    "name": "Battery Information",
    "studioId": "accessibility",
    "description": "Battery Information utility in Accessibility & Device.",
    "keywords": [
      "battery information",
      "accessibility & device",
      "accessibility",
      "battery",
      "information"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 468,
    "name": "App Permission Guide",
    "studioId": "accessibility",
    "description": "App Permission Guide utility in Accessibility & Device.",
    "keywords": [
      "app permission guide",
      "accessibility & device",
      "accessibility",
      "permission",
      "guide"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 469,
    "name": "Offline Reference Library",
    "studioId": "accessibility",
    "description": "Offline Reference Library utility in Accessibility & Device.",
    "keywords": [
      "offline reference library",
      "accessibility & device",
      "accessibility",
      "reference",
      "library"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 470,
    "name": "Emergency Information Card",
    "studioId": "accessibility",
    "description": "Emergency Information Card utility in Accessibility & Device.",
    "keywords": [
      "emergency information card",
      "accessibility & device",
      "accessibility",
      "emergency",
      "information",
      "card"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Smartphone",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 471,
    "name": "QR-Based File Transfer",
    "studioId": "advanced",
    "description": "QR-Based File Transfer utility in Advanced & Experimental.",
    "keywords": [
      "qr-based file transfer",
      "advanced & experimental",
      "advanced",
      "qr-based",
      "file",
      "transfer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 472,
    "name": "Local Wi-Fi File Transfer",
    "studioId": "advanced",
    "description": "Local Wi-Fi File Transfer utility in Advanced & Experimental.",
    "keywords": [
      "local wi-fi file transfer",
      "advanced & experimental",
      "advanced",
      "local",
      "wi-fi",
      "file",
      "transfer"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 473,
    "name": "LAN Device Discovery",
    "studioId": "advanced",
    "description": "LAN Device Discovery utility in Advanced & Experimental.",
    "keywords": [
      "lan device discovery",
      "advanced & experimental",
      "advanced",
      "lan",
      "device",
      "discovery"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 474,
    "name": "Text Diff with Highlights",
    "studioId": "advanced",
    "description": "Text Diff with Highlights utility in Advanced & Experimental.",
    "keywords": [
      "text diff with highlights",
      "advanced & experimental",
      "advanced",
      "text",
      "diff",
      "with",
      "highlights"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 475,
    "name": "Spreadsheet Formula Helper",
    "studioId": "advanced",
    "description": "Spreadsheet Formula Helper utility in Advanced & Experimental.",
    "keywords": [
      "spreadsheet formula helper",
      "advanced & experimental",
      "advanced",
      "spreadsheet",
      "formula",
      "helper"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 476,
    "name": "Formula Generator",
    "studioId": "advanced",
    "description": "Formula Generator utility in Advanced & Experimental.",
    "keywords": [
      "formula generator",
      "advanced & experimental",
      "advanced",
      "formula",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 477,
    "name": "CSV Chart Generator",
    "studioId": "advanced",
    "description": "CSV Chart Generator utility in Advanced & Experimental.",
    "keywords": [
      "csv chart generator",
      "advanced & experimental",
      "advanced",
      "csv",
      "chart",
      "generator"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 478,
    "name": "Data Cleaning Assistant",
    "studioId": "advanced",
    "description": "Data Cleaning Assistant utility in Advanced & Experimental.",
    "keywords": [
      "data cleaning assistant",
      "advanced & experimental",
      "advanced",
      "data",
      "cleaning",
      "assistant"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 479,
    "name": "Table Extractor",
    "studioId": "advanced",
    "description": "Table Extractor utility in Advanced & Experimental.",
    "keywords": [
      "table extractor",
      "advanced & experimental",
      "advanced",
      "table",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 480,
    "name": "Document Classification",
    "studioId": "advanced",
    "description": "Document Classification utility in Advanced & Experimental.",
    "keywords": [
      "document classification",
      "advanced & experimental",
      "advanced",
      "document",
      "classification"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 481,
    "name": "Smart File Renamer",
    "studioId": "advanced",
    "description": "Smart File Renamer utility in Advanced & Experimental.",
    "keywords": [
      "smart file renamer",
      "advanced & experimental",
      "advanced",
      "smart",
      "file",
      "renamer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 482,
    "name": "Smart File Search",
    "studioId": "advanced",
    "description": "Smart File Search utility in Advanced & Experimental.",
    "keywords": [
      "smart file search",
      "advanced & experimental",
      "advanced",
      "smart",
      "file",
      "search"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 483,
    "name": "Document Redaction Assistant",
    "studioId": "advanced",
    "description": "Document Redaction Assistant utility in Advanced & Experimental.",
    "keywords": [
      "document redaction assistant",
      "advanced & experimental",
      "advanced",
      "document",
      "redaction",
      "assistant"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 484,
    "name": "Form Data Extractor",
    "studioId": "advanced",
    "description": "Form Data Extractor utility in Advanced & Experimental.",
    "keywords": [
      "form data extractor",
      "advanced & experimental",
      "advanced",
      "form",
      "data",
      "extractor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 485,
    "name": "Image Similarity Finder",
    "studioId": "advanced",
    "description": "Image Similarity Finder utility in Advanced & Experimental.",
    "keywords": [
      "image similarity finder",
      "advanced & experimental",
      "advanced",
      "image",
      "similarity",
      "finder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 486,
    "name": "PDF Portfolio Organizer",
    "studioId": "advanced",
    "description": "PDF Portfolio Organizer utility in Advanced & Experimental.",
    "keywords": [
      "pdf portfolio organizer",
      "advanced & experimental",
      "advanced",
      "pdf",
      "portfolio",
      "organizer"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 487,
    "name": "Batch Watermark Studio",
    "studioId": "advanced",
    "description": "Batch Watermark Studio utility in Advanced & Experimental.",
    "keywords": [
      "batch watermark studio",
      "advanced & experimental",
      "advanced",
      "batch",
      "watermark",
      "studio"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 488,
    "name": "Batch OCR Processor",
    "studioId": "advanced",
    "description": "Batch OCR Processor utility in Advanced & Experimental.",
    "keywords": [
      "batch ocr processor",
      "advanced & experimental",
      "advanced",
      "batch",
      "ocr",
      "processor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 489,
    "name": "Batch Image Conversion",
    "studioId": "advanced",
    "description": "Batch Image Conversion utility in Advanced & Experimental.",
    "keywords": [
      "batch image conversion",
      "advanced & experimental",
      "advanced",
      "batch",
      "image",
      "conversion"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 490,
    "name": "Batch PDF Conversion",
    "studioId": "advanced",
    "description": "Batch PDF Conversion utility in Advanced & Experimental.",
    "keywords": [
      "batch pdf conversion",
      "advanced & experimental",
      "advanced",
      "batch",
      "pdf",
      "conversion"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 491,
    "name": "Smart Compression Advisor",
    "studioId": "advanced",
    "description": "Smart Compression Advisor utility in Advanced & Experimental.",
    "keywords": [
      "smart compression advisor",
      "advanced & experimental",
      "advanced",
      "smart",
      "compression",
      "advisor"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 492,
    "name": "File Quality Inspector",
    "studioId": "advanced",
    "description": "File Quality Inspector utility in Advanced & Experimental.",
    "keywords": [
      "file quality inspector",
      "advanced & experimental",
      "advanced",
      "file",
      "quality",
      "inspector"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 493,
    "name": "Offline Tool Packs",
    "studioId": "advanced",
    "description": "Offline Tool Packs utility in Advanced & Experimental.",
    "keywords": [
      "offline tool packs",
      "advanced & experimental",
      "advanced",
      "offline",
      "tool",
      "packs"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 494,
    "name": "Workflow Builder",
    "studioId": "advanced",
    "description": "Workflow Builder utility in Advanced & Experimental.",
    "keywords": [
      "workflow builder",
      "advanced & experimental",
      "advanced",
      "workflow",
      "builder"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 495,
    "name": "Favorite Tool Shortcuts",
    "studioId": "advanced",
    "description": "Favorite Tool Shortcuts utility in Advanced & Experimental.",
    "keywords": [
      "favorite tool shortcuts",
      "advanced & experimental",
      "advanced",
      "favorite",
      "tool",
      "shortcuts"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 496,
    "name": "Custom Tool Collections",
    "studioId": "advanced",
    "description": "Custom Tool Collections utility in Advanced & Experimental.",
    "keywords": [
      "custom tool collections",
      "advanced & experimental",
      "advanced",
      "custom",
      "tool",
      "collections"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 497,
    "name": "Processing Queue",
    "studioId": "advanced",
    "description": "Processing Queue utility in Advanced & Experimental.",
    "keywords": [
      "processing queue",
      "advanced & experimental",
      "advanced",
      "processing",
      "queue"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 498,
    "name": "Output History",
    "studioId": "advanced",
    "description": "Output History utility in Advanced & Experimental.",
    "keywords": [
      "output history",
      "advanced & experimental",
      "advanced",
      "output",
      "history"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 499,
    "name": "Storage Cleanup Suggestions",
    "studioId": "advanced",
    "description": "Storage Cleanup Suggestions utility in Advanced & Experimental.",
    "keywords": [
      "storage cleanup suggestions",
      "advanced & experimental",
      "advanced",
      "storage",
      "cleanup",
      "suggestions"
    ],
    "status": "available",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  },
  {
    "id": 500,
    "name": "Universal Share-to-Tool",
    "studioId": "advanced",
    "description": "Universal Share-to-Tool utility in Advanced & Experimental.",
    "keywords": [
      "universal share-to-tool",
      "advanced & experimental",
      "advanced",
      "universal",
      "share-to-tool"
    ],
    "status": "coming_soon",
    "offlineCapable": true,
    "iconName": "Cpu",
    "inputKind": "interactive",
    "outputKinds": [
      "output"
    ],
    "isPopular": false
  }
];

export function getToolById(id: number): ToolDefinition | undefined {
  return WEB_TOOLS.find(t => t.id === id);
}

export function getToolsByStudio(studioId: string): ToolDefinition[] {
  return WEB_TOOLS.filter(t => t.studioId === studioId);
}

export function searchTools(query: string, studioId?: string): ToolDefinition[] {
  const q = query.trim().toLowerCase();
  return WEB_TOOLS.filter(t => {
    if (studioId && studioId !== 'all' && t.studioId !== studioId) return false;
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.id.toString() === q ||
      t.description.toLowerCase().includes(q) ||
      t.keywords.some(k => k.toLowerCase().includes(q))
    );
  });
}

export const POPULAR_TOOLS: ToolDefinition[] = WEB_TOOLS.filter(t => t.isPopular || [1, 4, 49, 50, 154, 169, 205, 244, 245, 301, 304, 351, 376, 446].includes(t.id));

export const TOTAL_TOOL_COUNT = WEB_TOOLS.length;
export const OFFLINE_TOOL_COUNT = WEB_TOOLS.filter(t => t.offlineCapable && t.status === 'available').length;
