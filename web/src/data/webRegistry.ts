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
    "description": "Combines one or more images into a single PDF document, one image per page.",
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
    "description": "Converts plain text into a formatted, downloadable PDF document.",
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
    "description": "Turns a camera-captured or scanned photo of a document into a clean PDF file.",
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
    "description": "Combines multiple PDF files into a single document in the order you choose.",
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
    "description": "Breaks one PDF into separate files by page range or individual pages.",
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
    "description": "Shrinks a PDF's file size by optimizing embedded images and content streams.",
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
    "description": "Exports every page of a PDF as a separate image file.",
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
    "description": "Builds a PDF from a batch of JPG or PNG images in one pass.",
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
    "description": "Rotates one or all pages of a PDF by 90, 180, or 270 degrees.",
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
    "description": "Lets you drag and drop to rearrange the page order of a PDF.",
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
    "description": "Removes selected pages from a PDF and saves the rest as a new file.",
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
    "description": "Pulls out a chosen range of pages into a brand-new PDF.",
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
    "description": "Copies selected pages within a PDF, inserting the duplicates after the original.",
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
    "description": "Inserts blank or new pages into a PDF at a chosen position.",
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
    "description": "Trims the visible margins of PDF pages to a custom crop box.",
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
    "description": "Scales PDF pages to a different paper size such as A4 or Letter.",
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
    "description": "Stamps sequential page numbers onto every page of a PDF.",
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
    "description": "Overlays a text or image watermark across every page of a PDF.",
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
    "description": "Encrypts a PDF with a password so only authorized readers can open it.",
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
    "description": "Removes a known password from a protected PDF so it opens freely.",
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
    "description": "Sets fine-grained permissions on a PDF, such as blocking printing or copying.",
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
    "description": "Views and edits a PDF's title, author, subject, and keyword metadata.",
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
    "description": "Opens and displays PDF files for reading directly in the browser.",
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
    "description": "Adds highlights, sticky notes, and freehand markup on top of a PDF.",
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
    "description": "Draws, types, or uploads a signature and places it onto a PDF page.",
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
    "description": "Lets you type answers directly into a PDF's fillable form fields.",
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
    "description": "Extracts the raw text content from a PDF for copying or reuse.",
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
    "description": "Converts a PDF's layout and text into an editable Word-compatible document.",
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
    "description": "Pulls tabular data out of a PDF into an editable spreadsheet.",
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
    "description": "Turns each page of a PDF into a slide in a presentation file.",
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
    "description": "Converts a Word document into a fixed-layout PDF.",
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
    "description": "Converts a spreadsheet into a printable, fixed-layout PDF.",
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
    "description": "Converts a slide deck into a shareable PDF.",
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
    "description": "Renders raw HTML markup into a downloadable PDF.",
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
    "description": "Captures a live webpage's content and saves it as a PDF.",
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
    "description": "Scans a PDF's page images and extracts the recognizable text underneath.",
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
    "description": "Highlights the text differences between two versions of a PDF.",
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
    "description": "Attempts to recover and rebuild a corrupted or damaged PDF file.",
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
    "description": "Merges form fields, annotations, and layers into a single flat page image.",
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
    "description": "Reorders and lays out PDF pages for double-sided booklet printing.",
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
    "description": "Adjusts a PDF's color, margins, and resolution for cleaner physical printing.",
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
    "description": "Converts a PDF's text structure into clean Markdown formatting.",
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
    "description": "Extracts a PDF's text and structure into a structured JSON object.",
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
    "description": "Permanently blacks out sensitive text or regions on a PDF page.",
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
    "description": "Assigns custom page-numbering labels (like i, ii, iii or 1-a, 1-b) to PDF pages.",
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
    "description": "Reports a PDF's page count, fonts, embedded objects, and file structure.",
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
    "description": "Applies the same operation, like compress or rotate, across many PDFs at once.",
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
    "description": "Compares two PDF versions and merges the accepted changes into one file.",
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
    "description": "Reduces an image's file size while preserving as much visual quality as possible.",
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
    "description": "Scales an image up or down to exact pixel dimensions or a percentage.",
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
    "description": "Trims an image down to a selected rectangular region.",
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
    "description": "Rotates or flips an image horizontally or vertically.",
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
    "description": "Converts an image between formats like JPG, PNG, and WebP.",
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
    "description": "Converts Apple's HEIC photo format into widely-supported JPG or PNG.",
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
    "description": "Places one or more images onto pages of a new PDF document.",
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
    "description": "Renders a single PDF page as a standalone image file.",
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
    "description": "Automatically detects and removes the background behind the main subject of a photo.",
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
    "description": "Replaces a photo's background with a solid color or a different image.",
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
    "description": "Overlays a text or logo watermark onto a photo.",
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
    "description": "Draws arrows, shapes, and text callouts directly onto an image.",
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
    "description": "Arranges multiple photos into a single combined collage layout.",
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
    "description": "Stitches two or more images together side by side or stacked.",
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
    "description": "Cuts one image into a grid of smaller separate image tiles.",
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
    "description": "Samples the exact color under your cursor from an uploaded image.",
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
    "description": "Recognizes and extracts printed text from a photo or screenshot.",
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
    "description": "Enlarges an image's resolution while reconstructing sharper detail.",
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
    "description": "Automatically adjusts brightness, contrast, and sharpness for a cleaner-looking photo.",
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
    "description": "Applies an adjustable blur effect over an entire image or a selected area.",
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
    "description": "Displays an image's embedded EXIF data, like camera model and GPS location.",
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
    "description": "Strips all embedded EXIF metadata from a photo before you share it.",
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
    "description": "Lets you view and rewrite an image's embedded EXIF metadata fields.",
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
    "description": "Converts a flat-background image into a PNG with a transparent background.",
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
    "description": "Produces a multi-resolution favicon.ico set from a single source image.",
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
    "description": "Generates a small, cropped preview thumbnail from a larger image.",
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
    "description": "Crops and sizes a photo to official passport photo dimensions.",
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
    "description": "Lays out multiple copies of an ID photo onto one printable sheet.",
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
    "description": "Adds bold top and bottom caption text onto an image in classic meme style.",
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
    "description": "Analyzes an image and pulls out its dominant color palette.",
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
    "description": "Shows two images side by side with a draggable slider to spot differences.",
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
    "description": "Joins multiple overlapping screenshots into one tall, continuous image.",
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
    "description": "Renders and displays an SVG vector file's contents.",
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
    "description": "Strips redundant metadata and shrinks an SVG file's size without changing its look.",
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
    "description": "Rasterizes a vector SVG file into a PNG image at your chosen resolution.",
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
    "description": "Traces a PNG image into scalable vector SVG paths.",
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
    "description": "Applies the same resize, compress, or format change across many images at once.",
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
    "description": "Captures a photo of a paper document and automatically crops and straightens it.",
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
    "description": "Corrects the skewed angle of a photographed document so it looks flat and square.",
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
    "description": "Detects a document's edges in a photo and crops tightly to its borders.",
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
    "description": "Applies black-and-white, grayscale, or enhanced-contrast filters to a scanned page.",
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
    "description": "Captures several pages in sequence and compiles them into one scanned set.",
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
    "description": "Captures and crops a photo of an ID card to its exact edges.",
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
    "description": "Captures a receipt photo and lays out its items, subtotal, tax, and total.",
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
    "description": "Captures a business card photo and extracts its printed contact fields.",
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
    "description": "Attempts to recognize handwritten text from a captured image.",
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
    "description": "Lets you choose which language's character set the scanner should recognize.",
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
    "description": "Combines a scanned page image with its OCR text layer into a searchable PDF.",
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
    "description": "Converts a scanned document's recognized text into an editable Word-style file.",
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
    "description": "Detects tabular data in a scanned document and exports it as a spreadsheet.",
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
    "description": "Removes shadows, stray marks, and background noise from a scanned page.",
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
    "description": "Keeps a browsable log of documents you've previously scanned in this session.",
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
    "description": "Suggests a clean, consistent file name based on a scanned document's content.",
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
    "description": "Exports a whole batch of scanned pages together as a single file or archive.",
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
    "id": 104,
    "name": "Video Compressor",
    "studioId": "video",
    "description": "Reduces a video file's size by re-encoding it at a lower bitrate.",
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
    "description": "Cuts a video down to a selected start and end time.",
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
    "description": "Joins multiple video clips together into one continuous file.",
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
    "description": "Crops a video's frame to a smaller rectangular region.",
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
    "description": "Rotates a video by 90, 180, or 270 degrees.",
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
    "description": "Converts a video between formats like MP4, WebM, and MOV.",
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
    "description": "Extracts the audio track from a video and saves it as an MP3.",
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
    "description": "Converts a video clip into a looping animated GIF.",
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
    "description": "Extracts individual frames from a video as still images.",
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
    "description": "Speeds up or slows down a video's playback and re-renders it at the new speed.",
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
    "description": "Strips the audio track from a video, leaving the picture silent.",
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
    "description": "Overlays a text or logo watermark onto a video.",
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
    "description": "Lets you write and time subtitle captions against a video's timeline.",
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
    "description": "Pulls an embedded subtitle track out of a video file as a standalone .srt.",
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
    "description": "Re-encodes a video at a different resolution, such as 1080p or 720p.",
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
    "description": "Re-encodes a video at a different frame rate, such as 30fps or 60fps.",
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
    "description": "Displays a video's resolution, duration, codec, and bitrate details.",
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
    "description": "Captures a single frame from a video to use as its preview thumbnail.",
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
    "description": "Smooths out shaky camera movement in a video clip.",
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
    "description": "Swaps a video's existing audio track for a different one you provide.",
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
    "description": "Extracts key frames from a video and lays them out as a printable PDF storyboard.",
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
    "description": "Records your screen's activity directly into a downloadable video file.",
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
    "description": "Records video from your device's camera directly in the browser.",
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
    "description": "Converts a whole batch of video files to a new format in one pass.",
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
    "description": "Joins multiple clips together with a smooth transition effect between each.",
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
    "description": "Re-encodes an audio file at a lower bitrate to shrink its file size.",
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
    "description": "Converts an audio file between formats like MP3, WAV, and FLAC.",
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
    "description": "Cuts an audio file down to a selected start and end time.",
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
    "description": "Joins multiple audio clips together into one continuous track.",
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
    "description": "Breaks a single audio file into several smaller clips.",
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
    "description": "Speeds up or slows down an audio track's playback.",
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
    "description": "Shifts an audio track's pitch up or down without changing its speed.",
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
    "description": "Increases or decreases an audio track's overall loudness.",
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
    "description": "Evens out an audio track's loudness to a consistent target level.",
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
    "description": "Reduces constant background hiss or hum in an audio recording.",
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
    "description": "Records audio from your microphone directly in the browser.",
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
    "description": "Transcribes spoken words in an audio file into written text.",
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
    "description": "Reads typed text aloud using your device's built-in voice synthesis.",
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
    "description": "Converts an audio file into the uncompressed WAV format.",
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
    "description": "Converts an audio file into the compressed MP3 format.",
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
    "description": "Pulls the audio track out of a video file as a separate audio file.",
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
    "description": "Edits an audio file's embedded title, artist, and album tag fields.",
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
    "description": "Attaches or replaces the cover image embedded in an audio file.",
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
    "description": "Renders an audio file's amplitude as a visual waveform.",
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
    "description": "Detects and cuts out silent gaps from an audio recording.",
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
    "description": "Applies a pitch or tone effect to make a voice recording sound different.",
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
    "description": "Converts an audio track between mono and stereo channel layouts.",
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
    "description": "Trims a song down to a short clip formatted for use as a phone ringtone.",
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
    "description": "Converts a whole batch of audio files to a new format in one pass.",
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
    "description": "Joins audio clips together with a smooth fade between each one.",
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
    "description": "Opens and displays the contents of a .docx Word file.",
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
    "description": "Extracts a Word document's plain text content.",
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
    "description": "Converts a Word document's content into HTML markup.",
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
    "description": "Converts a Word document's structure into Markdown formatting.",
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
    "description": "Wraps plain text into a formatted Word-compatible document.",
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
    "description": "Renders Markdown text into a formatted, downloadable PDF.",
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
    "description": "Converts Markdown syntax into rendered HTML markup.",
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
    "description": "Converts HTML markup back into clean Markdown syntax.",
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
    "description": "Converts a spreadsheet's first sheet into plain comma-separated values.",
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
    "description": "Converts a CSV file into a formatted spreadsheet.",
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
    "description": "Displays a CSV file's rows and columns as a readable table.",
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
    "description": "Trims whitespace, fixes quoting, and normalizes a messy CSV file.",
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
    "description": "Removes duplicate rows from a CSV file.",
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
    "description": "Combines multiple CSV files that share the same columns into one.",
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
    "description": "Breaks a large CSV file into smaller chunks by row count.",
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
    "description": "Flattens an array of JSON objects into comma-separated rows and columns.",
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
    "description": "Converts CSV rows and columns into an array of JSON objects.",
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
    "description": "Converts XML markup into an equivalent JSON structure.",
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
    "description": "Converts a JSON object into equivalent XML markup.",
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
    "description": "Indents and reformats XML markup for easier reading.",
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
    "description": "Highlights the differences between two versions of a text document.",
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
    "description": "Counts the words, characters, and paragraphs in an uploaded document.",
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
    "description": "Displays an uploaded document's title, author, and other embedded metadata.",
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
    "description": "Exports every slide of a presentation as a separate image file.",
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
    "description": "Wraps plain text into a downloadable .docx Word file.",
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
    "description": "Converts a whole batch of documents to a new format in one pass.",
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
    "description": "Converts a whole batch of documents to a new format in one pass.",
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
    "description": "Compresses one or more files into a single .zip archive.",
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
    "description": "Unpacks the contents of a .zip archive.",
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
    "description": "Unpacks the contents of a .7z archive.",
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
    "description": "Unpacks the contents of a .tar archive.",
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
    "description": "Compresses a file into .gz format or extracts an existing .gz file.",
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
    "description": "Lists the files and folder structure inside an archive without extracting it.",
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
    "description": "Adds a password to a .zip archive so it can't be opened without it.",
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
    "description": "Shrinks a file's size using general-purpose compression.",
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
    "description": "Inspects a file's actual contents to identify its true file type.",
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
    "description": "Reports a file's exact size and a breakdown of its contents by size.",
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
    "description": "Compares a set of files by content to flag exact duplicates.",
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
    "description": "Batch renames files with custom prefixes, suffixes, numbering, and case formatting.",
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
    "description": "Computes a file's MD5, SHA-1, or SHA-256 checksum.",
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
    "description": "Compares a file against a known checksum to confirm it hasn't been altered.",
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
    "description": "Breaks a large file into smaller numbered chunks.",
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
    "description": "Reassembles chunks created by a file splitter back into the original file.",
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
    "description": "Determines a file's correct MIME type from its contents.",
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
    "description": "Renames a file's extension while keeping its underlying format intact.",
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
    "description": "Sorts a batch of files into folders based on type, name, or date rules.",
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
    "description": "Inspects and safely clears browser caches, temporary offline files, and local session data.",
    "keywords": [
      "temporary file cleaner",
      "archive & files",
      "archive",
      "temporary",
      "file",
      "cleaner",
      "cache"
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
    "description": "Generates a local, shareable link or QR code for transferring a file.",
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
    "description": "Lists the files you've recently processed in this app for quick reopening.",
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
    "description": "Reports how much of your browser's local storage this app is currently using.",
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
    "description": "Converts an archive from one compression format into another.",
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
    "description": "Calculates real-time word count, character metrics, reading and speaking durations.",
    "keywords": [
      "word counter",
      "text & writing",
      "text",
      "word",
      "counter",
      "characters"
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
    "description": "Counts characters with and without whitespace, UTF-8/UTF-16 byte lengths, and social limits.",
    "keywords": [
      "character counter",
      "text & writing",
      "text",
      "character",
      "counter",
      "bytes"
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
    "description": "Analyzes sentence boundaries, average sentence length, and pacing metrics.",
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
    "description": "Counts paragraphs, headings, hard line breaks, and block structure.",
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
    "description": "Estimates silent reading, presentation speaking, and slow reading durations.",
    "keywords": [
      "reading time calculator",
      "text & writing",
      "text",
      "reading",
      "time",
      "speaking",
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
    "description": "Converts text between UPPERCASE, lowercase, Title Case, camelCase, and more.",
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
    "description": "Collapses repeated spaces and trims stray whitespace from text.",
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
    "description": "Deletes every blank line from a block of text.",
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
    "description": "Removes repeated lines, keeping only the first occurrence of each.",
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
    "description": "Sorts the lines of a text block alphabetically, ascending or descending.",
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
    "description": "Reverses the character order of a block of text.",
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
    "description": "Finds every occurrence of a word or phrase and replaces it with another.",
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
    "description": "Highlights the line-by-line differences between two blocks of text.",
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
    "description": "Breaks a block of text apart using a chosen delimiter or line count.",
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
    "description": "Joins multiple blocks of text together with a chosen separator.",
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
    "description": "Repeats a given block of text a chosen number of times.",
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
    "description": "Converts text into a clean, URL-friendly slug.",
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
    "description": "Converts a URL slug back into readable, spaced-out text.",
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
    "description": "Scans a block of text and pulls out every web link it contains.",
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
    "description": "Scans a block of text and pulls out every email address it contains.",
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
    "description": "Scans a block of text and pulls out every phone number it contains.",
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
    "description": "Converts each character of a text string into its numeric ASCII code.",
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
    "description": "Converts a list of numeric ASCII codes back into readable text.",
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
    "description": "Shows the Unicode code point and name behind each character you enter.",
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
    "description": "Encodes text using Base64, URL, or HTML entity encoding.",
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
    "description": "Decodes Base64, URL, or HTML-entity-encoded text back to plain text.",
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
    "description": "Generates placeholder Lorem Ipsum paragraphs for mockups and layouts.",
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
    "description": "Generates randomized sample sentences for testing and placeholder content.",
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
    "description": "Generates a list of randomized sample full names for testing data.",
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
    "description": "Reports detailed word, character, sentence, and reading-time statistics for a text.",
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
    "description": "Rule-based stylistic checks for passive voice, wordy phrases, and repeated words.",
    "keywords": [
      "grammar assistant",
      "text & writing",
      "text",
      "grammar",
      "assistant",
      "passive voice"
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
    "description": "Offline spell checker and typo detector with Levenshtein-based suggestion matrix.",
    "keywords": [
      "spell checker",
      "text & writing",
      "text",
      "spell",
      "checker",
      "typos"
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
    "description": "Calculates Flesch-Kincaid, Gunning Fog, Coleman-Liau, SMOG, and ARI reading grades.",
    "keywords": [
      "readability analyzer",
      "text & writing",
      "text",
      "readability",
      "analyzer",
      "flesch"
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
    "description": "Edits Markdown text with a live, rendered preview alongside it.",
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
    "description": "Generates a Markdown table template you can fill in and reuse.",
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
    "description": "Assembles attendees, agenda, and action items into a clean notes document.",
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
    "description": "Assembles your name, summary, experience, and skills into clean resume text.",
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
    "description": "Compose structured business, professional, support, or follow-up email drafts offline.",
    "keywords": [
      "email draft assistant",
      "text & writing",
      "text",
      "email",
      "draft",
      "assistant",
      "templates"
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
    "description": "Transliterates Romanized Bengali ('Banglish') text into Bengali script.",
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
    "description": "Beautifies a JSON string with consistent indentation and line breaks.",
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
    "description": "Checks a JSON string for syntax errors and reports its structure if valid.",
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
    "description": "Strips all whitespace from JSON to produce the smallest possible string.",
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
    "description": "Highlights the added, removed, and changed fields between two JSON objects.",
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
    "description": "Evaluates a dot/bracket path expression against a JSON object and shows the match.",
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
    "description": "Generates a TypeScript interface from a sample JSON object's shape.",
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
    "description": "Infers a JSON Schema definition from a sample JSON object.",
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
    "description": "Reformats YAML with consistent indentation.",
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
    "description": "Checks a YAML document for syntax errors.",
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
    "description": "Converts a YAML document into equivalent JSON.",
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
    "description": "Converts a JSON object into equivalent YAML.",
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
    "description": "Checks an XML document for well-formed syntax.",
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
    "description": "Indents and reformats HTML markup for easier reading.",
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
    "description": "Strips whitespace and comments from HTML to shrink its size.",
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
    "description": "Indents and reformats CSS rules for easier reading.",
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
    "description": "Strips whitespace and comments from CSS to shrink its size.",
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
    "description": "Indents and reformats JavaScript code for easier reading.",
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
    "description": "Strips whitespace and comments from JavaScript to shrink its size.",
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
    "description": "Reformats a SQL query onto multiple lines with keyword-aligned indentation.",
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
    "description": "Collapses a SQL query onto a single compact line.",
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
    "description": "Breaks down a SQL query's clauses and explains what each one does.",
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
    "description": "Tests a regular expression against sample text and highlights every match.",
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
    "description": "Breaks a regular expression down token by token with a plain-English explanation.",
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
    "description": "Encodes text or data into Base64 format.",
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
    "description": "Decodes a Base64 string back into its original text or data.",
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
    "description": "Percent-encodes text so it's safe to use inside a URL.",
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
    "description": "Decodes percent-encoded characters in a URL back into plain text.",
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
    "description": "Converts special characters into their HTML entity equivalents.",
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
    "description": "Converts HTML entities back into their original characters.",
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
    "description": "Decodes a JSON Web Token's header and payload without verifying its signature.",
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
    "description": "Generates random version-4 UUIDs.",
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
    "description": "Generates sortable, timestamp-based ULIDs.",
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
    "description": "Computes a SHA-256, SHA-1, or SHA-512 hash of text you enter.",
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
    "description": "Computes an HMAC signature of a message using a secret key.",
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
    "description": "Generates a random password to your chosen length and character rules.",
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
    "description": "Checks whether a plain-text password matches a given bcrypt hash.",
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
    "description": "Converts a color between HEX, RGB, and HSL formats.",
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
    "description": "Builds a CSS linear or radial gradient from colors you pick.",
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
    "description": "Builds a CSS box-shadow value from adjustable offset, blur, and color controls.",
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
    "description": "Builds a CSS border-radius value with independent corner controls.",
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
    "description": "Lets you experiment with CSS flexbox properties and see the layout update live.",
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
    "description": "Builds a CSS grid-template-columns/rows layout with adjustable tracks.",
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
    "description": "Converts between Unix epoch timestamps and human-readable dates.",
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
    "description": "Explains what a cron expression means and shows its next scheduled run times.",
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
    "description": "Computes and displays a line-by-line diff between two text blocks.",
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
    "description": "Breaks a URL down into its protocol, host, path, and query parameters.",
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
    "description": "Parses a browser's User-Agent string into browser, OS, and device details.",
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
    "description": "A searchable reference of HTTP status codes and what each one means.",
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
    "description": "A searchable reference mapping file extensions to their MIME types.",
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
    "description": "Normalizes heading spacing, bullet markers, and blank lines in Markdown.",
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
    "description": "Generates SQL INSERT statements from a table name, columns, and row values.",
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
    "description": "Generates sample JSON records from a schema you define.",
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
    "description": "Builds and sends an HTTP request with custom method, headers, and body.",
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
    "description": "Converts between a cURL command and its method, URL, headers, and body.",
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
    "description": "Parses a QR code's decoded text into its structured payload type.",
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
    "description": "Decodes a PEM certificate's subject, issuer, and validity dates.",
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
    "description": "Computes the network address, broadcast address, and host range for an IP and subnet.",
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
    "description": "A basic calculator for everyday arithmetic.",
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
    "description": "A calculator with trigonometric, logarithmic, and exponential functions.",
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
    "description": "Calculates percentages, percentage change, and percentage-of values.",
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
    "description": "Calculates the discounted price and savings from an original price and percentage.",
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
    "description": "Calculates GST or sales tax and the tax-inclusive total on a price.",
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
    "description": "Estimates income tax owed using simplified progressive tax brackets.",
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
    "description": "Calculates a loan's monthly installment, total interest, and total repayment.",
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
    "description": "Calculates simple and compound interest on a principal amount.",
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
    "description": "Projects a lump-sum investment's future value at a given return rate.",
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
    "description": "Projects the future value of regular monthly investment contributions.",
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
    "description": "Calculates an amount's future cost or today's purchasing power under inflation.",
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
    "description": "Calculates exact age in years, months, and days from a birth date.",
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
    "description": "Calculates the number of days, weeks, or months between two dates.",
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
    "description": "Adds or subtracts a number of days, months, or years from a date.",
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
    "description": "Calculates the elapsed time between two clock times.",
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
    "description": "Calculates total hours worked from clock-in and clock-out times.",
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
    "description": "Breaks an annual salary down into monthly, weekly, and hourly pay.",
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
    "description": "Calculates regular and overtime pay from an hourly rate and hours worked.",
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
    "description": "Converts values across length, weight, temperature, and other unit categories.",
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
    "description": "Converts between meters, kilometers, miles, yards, feet, inches, and nautical miles.",
    "keywords": [
      "length converter",
      "calculators",
      "distance",
      "meters",
      "miles",
      "feet"
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
    "description": "Converts between kilograms, grams, milligrams, pounds, ounces, and metric tons.",
    "keywords": [
      "weight converter",
      "calculators",
      "mass",
      "kilograms",
      "pounds",
      "ounces"
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
    "description": "Converts between Celsius, Fahrenheit, and Kelvin temperature scales.",
    "keywords": [
      "temperature converter",
      "calculators",
      "celsius",
      "fahrenheit",
      "kelvin"
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
    "description": "Converts between square meters, square feet, square kilometers, acres, and hectares.",
    "keywords": [
      "area converter",
      "calculators",
      "acres",
      "hectares",
      "square feet"
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
    "description": "Converts between liters, milliliters, gallons, quarts, pints, and cubic meters.",
    "keywords": [
      "volume converter",
      "calculators",
      "liters",
      "gallons",
      "fluid ounces"
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
    "description": "Converts between km/h, mph, m/s, knots, and Mach speed.",
    "keywords": [
      "speed converter",
      "calculators",
      "velocity",
      "mph",
      "kmh",
      "knots"
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
    "description": "Converts between Pascals, bar, psi, atmospheres, and torr/mmHg.",
    "keywords": [
      "pressure converter",
      "calculators",
      "pascal",
      "bar",
      "psi",
      "atmosphere"
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
    "description": "Converts between bytes, KB, MB, GB, TB, and binary KiB, MiB, GiB units.",
    "keywords": [
      "data storage converter",
      "calculators",
      "bytes",
      "gigabytes",
      "terabytes",
      "binary"
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
    "description": "Converts a number between binary, octal, decimal, and hexadecimal.",
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
    "description": "Adds, subtracts, multiplies, or divides fractions and simplifies the result.",
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
    "description": "Simplifies a ratio or solves for a missing value in a proportion.",
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
    "description": "Calculates the mean, median, and mode of a list of numbers.",
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
    "description": "Calculates the probability of simple and combined events.",
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
    "description": "Calculates Body Mass Index from height and weight, with its healthy-range category.",
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
    "description": "Estimates daily calorie needs from your age, weight, height, and activity level.",
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
    "description": "Calculates a trip's fuel cost from distance, fuel efficiency, and fuel price.",
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
    "description": "Calculates a vehicle's fuel efficiency from distance traveled and fuel used.",
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
    "description": "Estimates an electricity bill from appliance wattage, hours used, and rate.",
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
    "description": "Calculates a tip amount and per-person split for a restaurant bill.",
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
    "description": "Splits a total bill evenly across a group, including tax and tip.",
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
    "description": "Spells out a numeric value in plain English words.",
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
    "description": "Converts between Arabic numbers and Roman numerals.",
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
    "description": "Generates a random number within a minimum and maximum range.",
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
    "description": "Simulates rolling one or more dice with a chosen number of sides.",
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
    "description": "A stopwatch with lap timing, running entirely in the browser.",
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
    "description": "A countdown timer that alerts you when the time runs out.",
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
    "description": "Sets a one-time or recurring alarm with a browser notification.",
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
    "description": "Shows the current time across multiple cities and time zones at once.",
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
    "description": "Calculates the ISO week number for any given date.",
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
    "description": "Compares two products' price-per-unit to find the better value.",
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
    "description": "Calculates how many units must be sold to cover fixed and variable costs.",
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
    "description": "Generates a scannable QR code from any text or link you enter.",
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
    "description": "Scans a QR code using your device camera and decodes its content.",
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
    "description": "Generates a zero-touch QR code to connect mobile devices to Wi-Fi networks.",
    "keywords": [
      "wi-fi qr generator",
      "qr, barcode & security",
      "wifi",
      "network",
      "qr",
      "wpa"
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
    "description": "Generates a contact QR code with phone, email, and name for instant saving.",
    "keywords": [
      "contact qr generator",
      "qr, barcode & security",
      "contact",
      "phone",
      "email"
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
    "description": "Encodes any website or deep link into an offline vector/raster QR code.",
    "keywords": [
      "url qr generator",
      "qr, barcode & security",
      "url",
      "link",
      "website"
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
    "description": "Encodes arbitrary plain text or instructions into a high-density QR code.",
    "keywords": [
      "text qr generator",
      "qr, barcode & security",
      "text",
      "plain text"
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
    "description": "Creates pre-filled mailto QR codes with recipient address, subject, and body.",
    "keywords": [
      "email qr generator",
      "qr, barcode & security",
      "email",
      "mailto"
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
    "description": "Generates a tel: QR code for 1-tap phone dialing on smartphones.",
    "keywords": [
      "phone qr generator",
      "qr, barcode & security",
      "phone",
      "telephone",
      "dialer"
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
    "description": "Generates an SMSTO: QR code with pre-filled recipient and text message.",
    "keywords": [
      "sms qr generator",
      "qr, barcode & security",
      "sms",
      "text message"
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
    "description": "Creates full digital business card vCard 3.0 / MeCard QR codes.",
    "keywords": [
      "vcard generator",
      "qr, barcode & security",
      "vcard",
      "business card",
      "mecard"
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
    "description": "Generates a 1D barcode, such as CODE128 or EAN-13, from a value you enter.",
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
    "description": "Scans a 1D barcode using your device camera and decodes its value.",
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
    "description": "Generates a QR code with a custom foreground color, background, and embedded logo.",
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
    "description": "Generates many QR codes at once from a list of values.",
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
    "description": "Keeps a log of QR codes you've scanned in this session.",
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
    "description": "Inspects a URL's structure for common phishing and shortener red flags.",
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
    "description": "Scores a password's strength and flags common weaknesses.",
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
    "description": "Generates a strong random password to your chosen length and character rules.",
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
    "description": "Generates a memorable multi-word passphrase from a word list.",
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
    "description": "Stores short private notes locally in your browser, never synced anywhere.",
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
    "description": "Finds and masks patterns that look like API keys, tokens, or credentials in text.",
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
    "description": "Computes a file's hash and compares it against an expected value.",
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
    "description": "Computes a SHA-256 or SHA-1 hash of a block of text.",
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
    "description": "Generates time-based one-time passcodes from a shared secret key.",
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
    "description": "Strips identifying metadata, like EXIF or document author fields, from a file.",
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
    "description": "Creates a shortened alias link that redirects to a longer URL.",
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
    "description": "Reveals the final destination URL behind a shortened link.",
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
    "description": "Generates a QR code that opens a specific website when scanned.",
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
    "description": "Fetches and displays a webpage's title, description, and meta tags.",
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
    "description": "Renders raw HTML markup as a live preview as you type.",
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
    "description": "Shows how a webpage's link preview card will look when shared on social media.",
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
    "description": "Fetches and displays a website's robots.txt crawler rules.",
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
    "description": "Fetches and displays the URLs listed in a website's XML sitemap.",
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
    "description": "Looks up a domain's DNS records, such as A, MX, and TXT entries.",
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
    "description": "Shows the public IP address your device is currently browsing from.",
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
    "description": "Looks up the approximate location and network details for an IP address.",
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
    "description": "Measures your current connection's download and upload speed.",
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
    "description": "Measures round-trip response time to a given host.",
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
    "description": "Fetches a URL and lists all of its HTTP response headers.",
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
    "description": "Fetches a website's SSL certificate and reports its validity and expiry date.",
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
    "description": "Checks whether a website is currently reachable and reports its response status.",
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
    "description": "Scans a block of HTML or text and lists every hyperlink found.",
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
    "description": "Builds SEO meta tags, like title and description, for a webpage.",
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
    "description": "Builds an XML sitemap file from a list of page URLs.",
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
    "description": "Checks whether a string is a well-formed, valid URL.",
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
    "description": "Encodes a file as a Base64 data: URI you can embed directly in code.",
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
    "description": "Scans a QR code and previews the destination link before you open it.",
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
    "description": "Captures a full-page screenshot of a given URL.",
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
    "description": "Converts a webpage's readable content into clean Markdown.",
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
    "description": "Fetches a webpage and counts the words in its visible text content.",
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
    "description": "A conversational assistant that helps you find the right tool for your task.",
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
    "description": "An assistant that answers questions about the content of an uploaded PDF.",
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
    "description": "An assistant that pulls structured fields out of an uploaded document.",
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
    "description": "An assistant that helps draft, rewrite, and polish written text.",
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
    "description": "An assistant that answers questions about the content of an uploaded image.",
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
    "description": "Translates text between languages.",
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
    "description": "A voice-driven assistant you can talk to using your microphone.",
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
    "description": "Generates a written description of what's shown in an uploaded image.",
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
    "description": "An assistant that helps draft a resume from your work history.",
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
    "description": "An assistant that explains, reviews, or helps write code.",
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
    "description": "An assistant that drafts emails from a short description of what you need to say.",
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
    "description": "Summarizes a meeting transcript into key points and action items.",
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
    "description": "An assistant that helps explain concepts and quiz you on study material.",
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
    "description": "Reads what you're trying to do and suggests the matching tool in the catalog.",
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
    "description": "Uses AI to summarize the substantive differences between two documents.",
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
    "description": "An assistant that answers questions about a dataset you upload.",
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
    "description": "A simple notes app for jotting down and organizing short pieces of text.",
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
    "description": "Builds a checklist of items you can tick off as you complete them.",
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
    "description": "A to-do list for tracking tasks with due dates and completion status.",
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
    "description": "Tracks daily habit streaks and completion history.",
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
    "description": "Splits a shared group expense fairly across participants.",
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
    "description": "Logs personal expenses by category and totals your spending.",
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
    "description": "Plans a monthly budget across income and expense categories.",
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
    "description": "Builds a professional invoice from line items, client details, and totals.",
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
    "description": "Builds a simple receipt document from item and payment details.",
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
    "description": "Builds a price quotation document from line items and terms.",
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
    "description": "Designs a printable business card from your name, title, and contact details.",
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
    "description": "Builds a formatted, downloadable resume PDF from your details.",
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
    "description": "Builds a formatted cover letter from your details and the role you're applying for.",
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
    "description": "Builds a weekly schedule grid of classes, shifts, or events.",
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
    "description": "Builds a deck of question-and-answer flashcards for studying.",
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
    "description": "Builds a multiple-choice quiz from questions and answers you provide.",
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
    "description": "Comprehensive instant reference and conversion cards for length, mass, temperature, speed, area, and digital units.",
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
    "description": "Offline English dictionary with definitions, phonetics, parts of speech, and usage examples.",
    "keywords": [
      "dictionary",
      "productivity & education",
      "productivity",
      "vocab",
      "lexicon"
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
    "description": "Thesaurus utility to find matching synonyms and nuanced vocabulary for any word.",
    "keywords": [
      "synonym finder",
      "productivity & education",
      "productivity",
      "synonym",
      "finder",
      "thesaurus"
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
    "description": "Thesaurus explorer to discover direct antonyms, polar opposites, and contrasting terms.",
    "keywords": [
      "antonym finder",
      "productivity & education",
      "productivity",
      "antonym",
      "finder",
      "opposites"
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
    "description": "Speaks words aloud with customizable pitch, speed, and accent using offline SpeechSynthesis.",
    "keywords": [
      "word pronunciation",
      "productivity & education",
      "productivity",
      "word",
      "pronunciation",
      "speech"
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
    "description": "Reads a block of typed or pasted text aloud using speech synthesis.",
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
    "description": "Generates a scannable vCard 3.0 QR code with contact details and downloadable .vcf file.",
    "keywords": [
      "qr contact card",
      "productivity & education",
      "productivity",
      "contact",
      "card",
      "vcard"
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
    "description": "Client-side stock and inventory tracker with automatic Code-128 barcode generation and printable labels.",
    "keywords": [
      "barcode inventory list",
      "productivity & education",
      "productivity",
      "barcode",
      "inventory",
      "list",
      "stock"
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
    "description": "Tracks a document's expiry date and reminds you before it lapses.",
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
    "description": "Tracks birthdays and reminds you as each one approaches.",
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
    "description": "Explores national, cultural, and public bank holidays across major countries with .ics calendar export.",
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
    "description": "Calculates the date a set number of days before or after an event.",
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
    "description": "Deep work timer with ambient binaural sound generators, distraction tracking, and session goal metrics.",
    "keywords": [
      "focus timer",
      "productivity & education",
      "productivity",
      "focus",
      "timer",
      "deep work"
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
    "description": "Runs repeating focus and break intervals using the Pomodoro technique.",
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
    "description": "Random decision generator with coin flips, dice roll, custom weighted choices, and celebration chimes.",
    "keywords": [
      "random decision picker",
      "productivity & education",
      "productivity",
      "random",
      "decision",
      "picker",
      "coin flip",
      "dice"
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
    "description": "Spins an animated wheel to randomly pick one name from a list.",
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
    "description": "Generates a QR code that marks attendance when scanned.",
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
    "description": "Scans an attendance QR code and logs the check-in.",
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
    "description": "Uses your device camera as a live magnifying glass for small print.",
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
    "description": "Turns your screen into a bright white light source for low-light situations.",
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
    "description": "Lets you pick a color and shows its hex and RGB values.",
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
    "description": "Lets you preview text at different font sizes and line spacing.",
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
    "description": "Calculates the WCAG contrast ratio between two colors and whether it passes.",
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
    "description": "Simulates how colors appear under different types of color blindness.",
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
    "description": "Transcribes your spoken words into text live, using your microphone.",
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
    "description": "Reads typed or pasted text aloud using your device's voice engine.",
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
    "description": "Displays pasted text back in large, high-legibility type for easier reading.",
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
    "description": "Reads an uploaded or pasted document's text aloud from start to finish.",
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
    "description": "Generates a written description of what's shown in an uploaded image.",
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
    "description": "Counts down silently and vibrates your device when the time is up.",
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
    "description": "Measures ambient sound level in decibels using your microphone.",
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
    "id": 465,
    "name": "Device Information",
    "studioId": "accessibility",
    "description": "Displays your device's platform, language, CPU cores, and other details.",
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
    "id": 470,
    "name": "Emergency Information Card",
    "studioId": "accessibility",
    "description": "Stores key medical and emergency contact details locally for quick access.",
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
    "description": "Encodes a small file's data into a QR code for transfer without a network.",
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
    "description": "Transfers a file between devices on the same local network.",
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
    "description": "Lists other devices reachable on your local network.",
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
    "description": "Highlights word-level differences between two blocks of text.",
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
    "description": "Looks up spreadsheet formula syntax and explains what each one does.",
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
    "description": "Builds a spreadsheet formula from a plain-language description of what you need.",
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
    "description": "Builds a chart directly from the columns of an uploaded CSV file.",
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
    "description": "Finds and fixes inconsistent spacing, casing, and duplicate rows in tabular data.",
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
    "description": "Detects and extracts tabular data from pasted text or markdown.",
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
    "id": 481,
    "name": "Smart File Renamer",
    "studioId": "advanced",
    "description": "Renames a batch of files using a pattern based on their content or metadata.",
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
    "description": "Searches across a batch of files for text matches, including inside documents.",
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
    "description": "Finds and blacks out text matching sensitive patterns, like card numbers, in a document.",
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
    "description": "Extracts key-value pairs from a scanned or pasted form's text.",
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
    "description": "Compares images against each other to flag likely duplicates or near-matches.",
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
    "description": "Groups and reorders multiple PDFs into one organized portfolio file.",
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
    "description": "Applies the same watermark across a whole batch of images or PDFs at once.",
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
    "description": "Runs text recognition across a whole batch of scanned images at once.",
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
    "description": "Converts a whole batch of images to a new format in one pass.",
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
    "description": "Converts a whole batch of PDFs to another format in one pass.",
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
    "id": 492,
    "name": "File Quality Inspector",
    "studioId": "advanced",
    "description": "Checks a file for corruption, low resolution, or other quality issues before use.",
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
    "id": 494,
    "name": "Workflow Builder",
    "studioId": "advanced",
    "description": "Chains multiple tools together into a repeatable multi-step workflow.",
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
