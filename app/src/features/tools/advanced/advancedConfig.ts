import { ToolDefinition } from '../../../data/types';
import { getToolById } from '../../../data/registry';

export type AdvancedWorkspaceId =
  | 'adv_transfer_network'
  | 'adv_data_formulas'
  | 'adv_file_intelligence'
  | 'adv_batch_automation'
  | 'adv_workflows_storage';

export interface AdvancedWorkspaceMeta {
  id: AdvancedWorkspaceId;
  title: string;
  subtitle: string;
  description: string;
  toolIds: number[];
}

export const ADVANCED_WORKSPACES: Record<AdvancedWorkspaceId, AdvancedWorkspaceMeta> = {
  adv_transfer_network: {
    id: 'adv_transfer_network',
    title: 'Peer-to-Peer Transfer & Network',
    subtitle: 'Air-Gapped QR, Local Wi-Fi & LAN Discovery',
    description: 'Transfer data across air-gapped devices via animated QR streams, share files directly on local Wi-Fi, discover LAN nodes, and dispatch universal tool sharing.',
    toolIds: [471, 472, 473, 500],
  },
  adv_data_formulas: {
    id: 'adv_data_formulas',
    title: 'Advanced Data, Diff & Formulas',
    subtitle: 'Diff Highlights, Formula Generators & Charts',
    description: 'Compare text differences with highlighted changes, generate spreadsheet formulas, render CSV data charts, clean noisy data tables, and extract tabular structures.',
    toolIds: [474, 475, 476, 477, 478, 479],
  },
  adv_file_intelligence: {
    id: 'adv_file_intelligence',
    title: 'File Intelligence & Document Ops',
    subtitle: 'Smart Renaming, Search, Redaction & Hashes',
    description: 'Classify documents automatically, batch rename files with rules, perform indexed keyword searches, redact sensitive PII, extract form fields, and compare image hashes.',
    toolIds: [480, 481, 482, 483, 484, 485, 486],
  },
  adv_batch_automation: {
    id: 'adv_batch_automation',
    title: 'Batch Processing & Optimization',
    subtitle: 'Batch Watermark, OCR, Conversion & Quality',
    description: 'Process batch watermarking, mass OCR extraction, bulk image/PDF format transformations, intelligent compression advice, and file quality validation.',
    toolIds: [487, 488, 489, 490, 491, 492],
  },
  adv_workflows_storage: {
    id: 'adv_workflows_storage',
    title: 'Workflows, Shortcuts & Storage',
    subtitle: 'Tool Packs, Workflow Pipelines & Queue',
    description: 'Compose multi-step tool automation pipelines, manage favorite shortcuts, organize custom tool collections, inspect job queues, and reclaim storage space.',
    toolIds: [493, 494, 495, 496, 497, 498, 499],
  },
};

export interface AdvancedToolConfig {
  toolId: number;
  workspaceId: AdvancedWorkspaceId;
  name: string;
  badge: string;
  description: string;
}

export const ADVANCED_TOOL_CONFIGS: Record<number, AdvancedToolConfig> = {
  // adv_transfer_network
  471: {
    toolId: 471,
    workspaceId: 'adv_transfer_network',
    name: 'QR-Based File Transfer',
    badge: 'QR Transfer',
    description: 'Air-gapped data transmission via chunked Base64 QR code sequence streams.',
  },
  472: {
    toolId: 472,
    workspaceId: 'adv_transfer_network',
    name: 'Local Wi-Fi File Transfer',
    badge: 'Wi-Fi P2P',
    description: 'Direct high-speed local HTTP file server for peer-to-peer Wi-Fi transfers.',
  },
  473: {
    toolId: 473,
    workspaceId: 'adv_transfer_network',
    name: 'LAN Device Discovery',
    badge: 'LAN Discovery',
    description: 'Probe and discover active network nodes and services on the local subnet.',
  },
  500: {
    toolId: 500,
    workspaceId: 'adv_transfer_network',
    name: 'Universal Share-to-Tool',
    badge: 'Universal Share',
    description: 'Dispatch incoming shared text, links, or files directly into any of the 500 tools.',
  },

  // adv_data_formulas
  474: {
    toolId: 474,
    workspaceId: 'adv_data_formulas',
    name: 'Text Diff with Highlights',
    badge: 'Text Diff',
    description: 'Side-by-side and inline word-level text comparison with visual change highlights.',
  },
  475: {
    toolId: 475,
    workspaceId: 'adv_data_formulas',
    name: 'Spreadsheet Formula Helper',
    badge: 'Formula Helper',
    description: 'Interactive syntax reference for Excel and Google Sheets formulas with examples.',
  },
  476: {
    toolId: 476,
    workspaceId: 'adv_data_formulas',
    name: 'Formula Generator',
    badge: 'Formula Gen',
    description: 'Generate complex Excel and Sheets formulas from plain-English descriptions.',
  },
  477: {
    toolId: 477,
    workspaceId: 'adv_data_formulas',
    name: 'CSV Chart Generator',
    badge: 'Chart Gen',
    description: 'Generate instant offline ASCII and SVG bar charts and sparklines from CSV data.',
  },
  478: {
    toolId: 478,
    workspaceId: 'adv_data_formulas',
    name: 'Data Cleaning Assistant',
    badge: 'Data Cleaner',
    description: 'Deduplicate records, normalize delimiters, and sanitize tabular datasets.',
  },
  479: {
    toolId: 479,
    workspaceId: 'adv_data_formulas',
    name: 'Table Extractor',
    badge: 'Table Parser',
    description: 'Extract and structure tabular data from raw text, Markdown, and TSV formats.',
  },

  // adv_file_intelligence
  480: {
    toolId: 480,
    workspaceId: 'adv_file_intelligence',
    name: 'Document Classification',
    badge: 'Doc Classify',
    description: 'Classify documents into Legal, Financial, Invoices, Technical, or Personal categories.',
  },
  481: {
    toolId: 481,
    workspaceId: 'adv_file_intelligence',
    name: 'Smart File Renamer',
    badge: 'Batch Rename',
    description: 'Batch rename files using dynamic patterns, dates, casing rules, and sequential numbers.',
  },
  482: {
    toolId: 482,
    workspaceId: 'adv_file_intelligence',
    name: 'Smart File Search',
    badge: 'Fast Search',
    description: 'High-speed offline regex and keyword searching across indexed documents.',
  },
  483: {
    toolId: 483,
    workspaceId: 'adv_file_intelligence',
    name: 'Document Redaction Assistant',
    badge: 'PII Redact',
    description: 'Scan and sanitize sensitive PII including SSNs, credit cards, emails, and phone numbers.',
  },
  484: {
    toolId: 484,
    workspaceId: 'adv_file_intelligence',
    name: 'Form Data Extractor',
    badge: 'Form Extractor',
    description: 'Extract structured key-value pairs from digitized forms and invoices.',
  },
  485: {
    toolId: 485,
    workspaceId: 'adv_file_intelligence',
    name: 'Image Similarity Finder',
    badge: 'Image Hash',
    description: 'Compute perceptual difference hashes (dHash) to detect identical or near-duplicate images.',
  },
  486: {
    toolId: 486,
    workspaceId: 'adv_file_intelligence',
    name: 'PDF Portfolio Organizer',
    badge: 'Portfolio Binder',
    description: 'Assemble multi-document PDF portfolios with cover index and section tabs.',
  },

  // adv_batch_automation
  487: {
    toolId: 487,
    workspaceId: 'adv_batch_automation',
    name: 'Batch Watermark Studio',
    badge: 'Batch Watermark',
    description: 'Apply consistent text or logo watermarks across queues of multiple image assets.',
  },
  488: {
    toolId: 488,
    workspaceId: 'adv_batch_automation',
    name: 'Batch OCR Processor',
    badge: 'Batch OCR',
    description: 'Queue and extract text content from multiple scanned pages or screenshots.',
  },
  489: {
    toolId: 489,
    workspaceId: 'adv_batch_automation',
    name: 'Batch Image Conversion',
    badge: 'Batch Images',
    description: 'Batch convert image formats across PNG, JPEG, WEBP with custom quality settings.',
  },
  490: {
    toolId: 490,
    workspaceId: 'adv_batch_automation',
    name: 'Batch PDF Conversion',
    badge: 'Batch PDF',
    description: 'Bulk convert batches of documents and images to unified PDF outputs.',
  },
  491: {
    toolId: 491,
    workspaceId: 'adv_batch_automation',
    name: 'Smart Compression Advisor',
    badge: 'Compress Advisor',
    description: 'Analyze file entropy and recommend optimal compression algorithms (Deflate, Gzip, Zstandard).',
  },
  492: {
    toolId: 492,
    workspaceId: 'adv_batch_automation',
    name: 'File Quality Inspector',
    badge: 'Quality Check',
    description: 'Inspect image DPI, color profile, compression artifacts, and audio/video bitrates.',
  },

  // adv_workflows_storage
  493: {
    toolId: 493,
    workspaceId: 'adv_workflows_storage',
    name: 'Offline Tool Packs',
    badge: 'Tool Packs',
    description: 'Access curated offline bundles for Developers, Privacy Advocates, Students, and Creators.',
  },
  494: {
    toolId: 494,
    workspaceId: 'adv_workflows_storage',
    name: 'Workflow Builder',
    badge: 'Pipelines',
    description: 'Chain multiple tools into automated reusable multi-step productivity pipelines.',
  },
  495: {
    toolId: 495,
    workspaceId: 'adv_workflows_storage',
    name: 'Favorite Tool Shortcuts',
    badge: 'Shortcuts',
    description: 'Pin and organize fast 1-tap quick action shortcuts to your most-used tools.',
  },
  496: {
    toolId: 496,
    workspaceId: 'adv_workflows_storage',
    name: 'Custom Tool Collections',
    badge: 'Collections',
    description: 'Create custom tagged groups and workspace categories for specialized tasks.',
  },
  497: {
    toolId: 497,
    workspaceId: 'adv_workflows_storage',
    name: 'Processing Queue',
    badge: 'Job Queue',
    description: 'Monitor background worker execution status, progress bars, and completion stats.',
  },
  498: {
    toolId: 498,
    workspaceId: 'adv_workflows_storage',
    name: 'Output History',
    badge: 'History Log',
    description: 'Audit log of recently generated files, processed documents, and exported assets.',
  },
  499: {
    toolId: 499,
    workspaceId: 'adv_workflows_storage',
    name: 'Storage Cleanup Suggestions',
    badge: 'Cache Cleaner',
    description: 'Identify temporary files, oversized cache artifacts, and reclaim storage safely.',
  },
};

export function getAdvancedToolConfig(toolId: number): AdvancedToolConfig | undefined {
  return ADVANCED_TOOL_CONFIGS[toolId];
}

export function getAdvancedWorkspaceTools(workspaceId: AdvancedWorkspaceId): ToolDefinition[] {
  const meta = ADVANCED_WORKSPACES[workspaceId];
  if (!meta) return [];
  return meta.toolIds
    .map((id) => getToolById(id))
    .filter((t): t is ToolDefinition => !!t);
}
