export type OfficeWorkspaceId =
  | 'office_word_docs'
  | 'office_markup'
  | 'office_spreadsheet'
  | 'office_data_interchange'
  | 'office_inspector_batch';

export interface OfficeToolConfig {
  id: number;
  name: string;
  description: string;
  workspace: OfficeWorkspaceId;
  defaultOperation: string;
  supportedOperations: string[];
  iconName: string;
}

export const OFFICE_TOOLS: Record<number, OfficeToolConfig> = {
  // --- Workspace 1: Word & DOCX Studio ---
  154: {
    id: 154,
    name: 'DOCX Viewer',
    description: 'Read and view DOCX documents with structured page and section navigation.',
    workspace: 'office_word_docs',
    defaultOperation: 'view_docx',
    supportedOperations: ['view_docx', 'outline_view', 'raw_xml_view'],
    iconName: 'FileText',
  },
  155: {
    id: 155,
    name: 'DOCX to TXT',
    description: 'Extract raw text from DOCX files while preserving paragraph structure.',
    workspace: 'office_word_docs',
    defaultOperation: 'docx_to_txt',
    supportedOperations: ['docx_to_txt', 'strip_headers', 'clean_whitespace'],
    iconName: 'FileText',
  },
  156: {
    id: 156,
    name: 'DOCX to HTML',
    description: 'Convert DOCX documents into clean, semantic HTML markup.',
    workspace: 'office_word_docs',
    defaultOperation: 'docx_to_html',
    supportedOperations: ['docx_to_html', 'inline_styles', 'semantic_tags'],
    iconName: 'Code',
  },
  157: {
    id: 157,
    name: 'DOCX to Markdown',
    description: 'Convert DOCX headings, lists, tables, and formatting to GFM Markdown.',
    workspace: 'office_word_docs',
    defaultOperation: 'docx_to_md',
    supportedOperations: ['docx_to_md', 'gfm_tables', 'strict_markdown'],
    iconName: 'FileText',
  },
  158: {
    id: 158,
    name: 'TXT to DOCX',
    description: 'Package plain text files into standard Microsoft Word DOCX containers.',
    workspace: 'office_word_docs',
    defaultOperation: 'txt_to_docx',
    supportedOperations: ['txt_to_docx', 'auto_heading_detect', 'double_spaced'],
    iconName: 'FilePlus',
  },
  178: {
    id: 178,
    name: 'Text to DOCX',
    description: 'Create formatted Word documents from text with typography and margin presets.',
    workspace: 'office_word_docs',
    defaultOperation: 'rich_text_to_docx',
    supportedOperations: ['rich_text_to_docx', 'formal_report', 'modern_memo'],
    iconName: 'FileText',
  },

  // --- Workspace 2: Markdown & Markup Hub ---
  159: {
    id: 159,
    name: 'Markdown to PDF',
    description: 'Compile Markdown text into professional rendered PDF documents.',
    workspace: 'office_markup',
    defaultOperation: 'md_to_pdf',
    supportedOperations: ['md_to_pdf', 'clean_margins', 'code_highlight'],
    iconName: 'FileText',
  },
  160: {
    id: 160,
    name: 'Markdown to HTML',
    description: 'Render GFM Markdown into clean, accessible HTML syntax.',
    workspace: 'office_markup',
    defaultOperation: 'md_to_html',
    supportedOperations: ['md_to_html', 'styled_html', 'raw_body_only'],
    iconName: 'Code',
  },
  161: {
    id: 161,
    name: 'HTML to Markdown',
    description: 'Parse HTML tags and tables back into clean readable Markdown.',
    workspace: 'office_markup',
    defaultOperation: 'html_to_md',
    supportedOperations: ['html_to_md', 'strip_tags', 'preserve_links'],
    iconName: 'FileText',
  },
  171: {
    id: 171,
    name: 'XML to JSON',
    description: 'Transform XML markup trees into structured, typed JSON objects.',
    workspace: 'office_markup',
    defaultOperation: 'xml_to_json',
    supportedOperations: ['xml_to_json', 'compact_json', 'attribute_mode'],
    iconName: 'Code',
  },
  172: {
    id: 172,
    name: 'JSON to XML',
    description: 'Serialize structured JSON data into formatted XML tags with custom root.',
    workspace: 'office_markup',
    defaultOperation: 'json_to_xml',
    supportedOperations: ['json_to_xml', 'custom_root', 'indented_tags'],
    iconName: 'Code',
  },
  173: {
    id: 173,
    name: 'XML Formatter',
    description: 'Beautify, indent, validate, and minify XML document payloads.',
    workspace: 'office_markup',
    defaultOperation: 'format_xml',
    supportedOperations: ['format_xml_2spaces', 'format_xml_4spaces', 'minify_xml'],
    iconName: 'SlidersHorizontal',
  },

  // --- Workspace 3: Spreadsheet & Table Studio ---
  162: {
    id: 162,
    name: 'Excel to CSV',
    description: 'Export Microsoft Excel spreadsheet sheets into delimited CSV tables.',
    workspace: 'office_spreadsheet',
    defaultOperation: 'excel_to_csv',
    supportedOperations: ['excel_to_csv', 'all_sheets', 'comma_delimited'],
    iconName: 'FileSpreadsheet',
  },
  163: {
    id: 163,
    name: 'CSV to Excel',
    description: 'Convert CSV tables into native formatted Excel XML / XLSX spreadsheets.',
    workspace: 'office_spreadsheet',
    defaultOperation: 'csv_to_excel',
    supportedOperations: ['csv_to_excel', 'header_styling', 'auto_col_width'],
    iconName: 'FileSpreadsheet',
  },
  164: {
    id: 164,
    name: 'CSV Viewer',
    description: 'Browse, filter, paginate, and inspect CSV tables with grid alignment.',
    workspace: 'office_spreadsheet',
    defaultOperation: 'view_csv',
    supportedOperations: ['view_csv', 'sort_columns', 'filter_rows'],
    iconName: 'Table',
  },
  165: {
    id: 165,
    name: 'CSV Cleaner',
    description: 'Remove empty lines, trim whitespace, normalize quotes, and sanitize delimiters.',
    workspace: 'office_spreadsheet',
    defaultOperation: 'clean_csv',
    supportedOperations: ['clean_whitespace', 'drop_empty_rows', 'normalize_quotes'],
    iconName: 'Sparkles',
  },
  166: {
    id: 166,
    name: 'CSV Deduplicator',
    description: 'Eliminate duplicate rows by key column or whole record matching.',
    workspace: 'office_spreadsheet',
    defaultOperation: 'dedup_rows',
    supportedOperations: ['dedup_rows', 'case_insensitive', 'key_column_match'],
    iconName: 'Copy',
  },
  167: {
    id: 167,
    name: 'CSV Merger',
    description: 'Merge and stack multiple CSV files with automatic header union.',
    workspace: 'office_spreadsheet',
    defaultOperation: 'merge_csv',
    supportedOperations: ['merge_union_headers', 'merge_strict', 'ignore_duplicate_headers'],
    iconName: 'Layers',
  },
  168: {
    id: 168,
    name: 'CSV Splitter',
    description: 'Split large CSV files into smaller partitioned chunks by row count.',
    workspace: 'office_spreadsheet',
    defaultOperation: 'split_csv',
    supportedOperations: ['split_by_rows', 'split_equal_parts', 'split_by_column_val'],
    iconName: 'Scissors',
  },

  // --- Workspace 4: Data Interchange Converter ---
  169: {
    id: 169,
    name: 'JSON to CSV',
    description: 'Flatten arrays of JSON objects into tabular CSV records.',
    workspace: 'office_data_interchange',
    defaultOperation: 'json_to_csv',
    supportedOperations: ['flatten_nested', 'explicit_headers', 'tsv_export'],
    iconName: 'RefreshCw',
  },
  170: {
    id: 170,
    name: 'CSV to JSON',
    description: 'Parse CSV rows into structured JSON array with automatic type casting.',
    workspace: 'office_data_interchange',
    defaultOperation: 'csv_to_json',
    supportedOperations: ['parse_typed_values', 'strings_only', 'keyed_by_id'],
    iconName: 'RefreshCw',
  },

  // --- Workspace 5: Document Inspector, Diff & Batch ---
  174: {
    id: 174,
    name: 'Document Compare',
    description: 'Compare two text or document files side-by-side with visual diff highlighting.',
    workspace: 'office_inspector_batch',
    defaultOperation: 'compare_docs',
    supportedOperations: ['line_by_line_diff', 'word_diff', 'similarity_score'],
    iconName: 'GitCompare',
  },
  175: {
    id: 175,
    name: 'Word Counter for Documents',
    description: 'Comprehensive analysis of words, characters, sentences, reading and speaking time.',
    workspace: 'office_inspector_batch',
    defaultOperation: 'count_stats',
    supportedOperations: ['full_stats', 'reading_time', 'lexical_density'],
    iconName: 'Calculator',
  },
  176: {
    id: 176,
    name: 'Document Metadata Viewer',
    description: 'Extract embedded author, organization, revision, and creation metadata.',
    workspace: 'office_inspector_batch',
    defaultOperation: 'view_metadata',
    supportedOperations: ['view_metadata', 'strip_metadata', 'export_metadata_json'],
    iconName: 'Info',
  },
  177: {
    id: 177,
    name: 'Presentation to Images',
    description: 'Convert presentation slide decks into individual visual slide sheets.',
    workspace: 'office_inspector_batch',
    defaultOperation: 'pptx_to_slides',
    supportedOperations: ['extract_slides_png', 'generate_storyboard', 'slides_to_pdf'],
    iconName: 'Presentation',
  },
  179: {
    id: 179,
    name: 'Batch Document Converter',
    description: 'Queue and batch-convert multiple documents to PDF, TXT, HTML, or Markdown.',
    workspace: 'office_inspector_batch',
    defaultOperation: 'batch_convert_docs',
    supportedOperations: ['batch_to_txt', 'batch_to_pdf', 'batch_to_markdown'],
    iconName: 'Layers',
  },
  180: {
    id: 180,
    name: 'Batch Document Converter',
    description: 'Batch process document encoding, normalize line endings, and clean BOM marks.',
    workspace: 'office_inspector_batch',
    defaultOperation: 'batch_normalize',
    supportedOperations: ['normalize_crlf_to_lf', 'strip_utf8_bom', 'reencode_utf8'],
    iconName: 'FileCheck',
  },
};

export function getOfficeToolConfig(toolId: number): OfficeToolConfig | undefined {
  return OFFICE_TOOLS[toolId];
}
