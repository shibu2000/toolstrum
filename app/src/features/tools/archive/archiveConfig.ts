/**
 * archiveConfig.ts
 * Central registry configuration mapping Archive & Files Studio tools (IDs 181–204)
 * and security integrity tool 372 to their consolidated workspace templates.
 */

export type ArchiveWorkspaceType =
  | 'archive_manager'     // Workspace A (181, 182, 183, 184, 185, 186, 187, 204)
  | 'file_compression'    // Workspace B (188)
  | 'file_inspection'     // Workspace C (186, 189, 190, 197)
  | 'file_integrity'      // Workspace D (193, 194, 372)
  | 'file_assembly'       // Workspace E (195, 196)
  | 'file_organization'   // Workspace F (191, 192, 198, 199, 200, 202, 203)
  | 'file_sharing';       // Workspace G (201)

export interface ArchiveToolConfig {
  id: number;
  name: string;
  workspace: ArchiveWorkspaceType;
  defaultOperation: string;
  description: string;
  iconName: string;
  supportedFormats: string[];
}

export const ARCHIVE_TOOL_MAP: Record<number, ArchiveToolConfig> = {
  // --- Workspace A: Archive Manager (181-187, 204) ---
  181: {
    id: 181,
    name: 'ZIP Creator',
    workspace: 'archive_manager',
    defaultOperation: 'create',
    description: 'Compress and bundle multiple files into a universal .zip archive.',
    iconName: 'Archive',
    supportedFormats: ['All Files'],
  },
  182: {
    id: 182,
    name: 'ZIP Extractor',
    workspace: 'archive_manager',
    defaultOperation: 'extract',
    description: 'Unpack standard .zip archives to inspect and extract internal files.',
    iconName: 'Archive',
    supportedFormats: ['.zip'],
  },
  183: {
    id: 183,
    name: '7Z Extractor',
    workspace: 'archive_manager',
    defaultOperation: 'extract_7z',
    description: 'Inspect and extract 7-Zip archives with transparent format compatibility guidance.',
    iconName: 'Archive',
    supportedFormats: ['.7z'],
  },
  184: {
    id: 184,
    name: 'TAR Extractor',
    workspace: 'archive_manager',
    defaultOperation: 'extract_tar',
    description: 'Inspect and unpack POSIX TAR archives and uncompressed tarballs.',
    iconName: 'Archive',
    supportedFormats: ['.tar'],
  },
  185: {
    id: 185,
    name: 'GZIP Compressor/Extractor',
    workspace: 'archive_manager',
    defaultOperation: 'gzip',
    description: 'Compress single files into GZIP streams or decompress .gz archives.',
    iconName: 'Archive',
    supportedFormats: ['.gz', '.gzip'],
  },
  186: {
    id: 186,
    name: 'Archive File Inspector',
    workspace: 'archive_manager',
    defaultOperation: 'inspect',
    description: 'Analyze archive internal tables of contents, compression ratios, and CRC checksums.',
    iconName: 'Archive',
    supportedFormats: ['.zip', '.tar', '.7z', '.gz'],
  },
  187: {
    id: 187,
    name: 'Archive Password Protector',
    workspace: 'archive_manager',
    defaultOperation: 'protect',
    description: 'Add password security to archives with encryption standards disclosure.',
    iconName: 'Lock',
    supportedFormats: ['.zip'],
  },
  204: {
    id: 204,
    name: 'Archive Converter',
    workspace: 'archive_manager',
    defaultOperation: 'convert',
    description: 'Convert between supported archive formats (e.g., ZIP to TAR).',
    iconName: 'RefreshCw',
    supportedFormats: ['.zip', '.tar'],
  },

  // --- Workspace B: File Compression (188) ---
  188: {
    id: 188,
    name: 'File Compressor',
    workspace: 'file_compression',
    defaultOperation: 'compress',
    description: 'Reduce file storage footprint with configurable compression levels and instant savings metrics.',
    iconName: 'Minimize2',
    supportedFormats: ['All Files'],
  },

  // --- Workspace C: File Inspection (189, 190, 197) ---
  189: {
    id: 189,
    name: 'File Type Detector',
    workspace: 'file_inspection',
    defaultOperation: 'type_detect',
    description: 'Detect genuine file formats using magic byte headers, regardless of spoofed extensions.',
    iconName: 'FileSearch',
    supportedFormats: ['All Files'],
  },
  190: {
    id: 190,
    name: 'File Size Analyzer',
    workspace: 'file_inspection',
    defaultOperation: 'size_analyze',
    description: 'Detailed byte-accurate sizing breakdown, cluster allocation, and storage impact metrics.',
    iconName: 'BarChart2',
    supportedFormats: ['All Files'],
  },
  197: {
    id: 197,
    name: 'MIME Type Inspector',
    workspace: 'file_inspection',
    defaultOperation: 'mime_inspect',
    description: 'Determine official IANA media types, RFC classifications, and stream properties.',
    iconName: 'FileCode',
    supportedFormats: ['All Files'],
  },

  // --- Workspace D: File Integrity (193, 194, 372) ---
  193: {
    id: 193,
    name: 'File Checksum Generator',
    workspace: 'file_integrity',
    defaultOperation: 'hash_gen',
    description: 'Calculate cryptographic SHA-256, SHA-1, and MD5 hashes completely offline.',
    iconName: 'Hash',
    supportedFormats: ['All Files'],
  },
  194: {
    id: 194,
    name: 'Checksum Verifier',
    workspace: 'file_integrity',
    defaultOperation: 'hash_verify',
    description: 'Compare file hashes against expected values to detect corruption or tampering.',
    iconName: 'CheckCircle2',
    supportedFormats: ['All Files'],
  },
  372: {
    id: 372,
    name: 'File Hash Verifier',
    workspace: 'file_integrity',
    defaultOperation: 'hash_verify',
    description: 'Security studio file hash verifier with auto-detect algorithm matching.',
    iconName: 'ShieldCheck',
    supportedFormats: ['All Files'],
  },

  // --- Workspace E: File Assembly (195, 196) ---
  195: {
    id: 195,
    name: 'File Splitter',
    workspace: 'file_assembly',
    defaultOperation: 'split',
    description: 'Split large files into smaller numbered parts for storage or transfer.',
    iconName: 'Scissors',
    supportedFormats: ['All Files'],
  },
  196: {
    id: 196,
    name: 'File Joiner',
    workspace: 'file_assembly',
    defaultOperation: 'join',
    description: 'Reassemble split parts back into the original complete file.',
    iconName: 'Layers',
    supportedFormats: ['.part*', '.chunk*'],
  },

  // --- Workspace F: File Organization (191, 192, 198, 199, 200, 202, 203) ---
  191: {
    id: 191,
    name: 'Duplicate File Finder',
    workspace: 'file_organization',
    defaultOperation: 'duplicates',
    description: 'Find identical files by comparing content checksums with safe removal confirmation.',
    iconName: 'Copy',
    supportedFormats: ['All Files'],
  },
  192: {
    id: 192,
    name: 'Bulk File Renamer',
    workspace: 'file_organization',
    defaultOperation: 'rename',
    description: 'Batch rename files with prefix, suffix, replace, and sequence patterns.',
    iconName: 'Edit3',
    supportedFormats: ['All Files'],
  },
  198: {
    id: 198,
    name: 'File Extension Converter',
    workspace: 'file_organization',
    defaultOperation: 'extension',
    description: 'Change or fix file extension suffixes in bulk with live preview.',
    iconName: 'FileType',
    supportedFormats: ['All Files'],
  },
  199: {
    id: 199,
    name: 'Batch File Organizer',
    workspace: 'file_organization',
    defaultOperation: 'organize',
    description: 'Group and categorize files into smart folders by type or date.',
    iconName: 'FolderTree',
    supportedFormats: ['All Files'],
  },
  200: {
    id: 200,
    name: 'Temporary File Cleaner',
    workspace: 'file_organization',
    defaultOperation: 'clean_temp',
    description: 'Inspect app sandbox temporary cache and safely free up wasted disk space.',
    iconName: 'Trash2',
    supportedFormats: ['App Sandbox Cache'],
  },
  202: {
    id: 202,
    name: 'Recent Files Manager',
    workspace: 'file_organization',
    defaultOperation: 'recents',
    description: 'View, filter, search, and manage your recent activity log.',
    iconName: 'Clock',
    supportedFormats: ['Recent App History'],
  },
  203: {
    id: 203,
    name: 'Storage Usage Analyzer',
    workspace: 'file_organization',
    defaultOperation: 'storage',
    description: 'Visual breakdown of app storage consumption by studio and format.',
    iconName: 'HardDrive',
    supportedFormats: ['App Managed Files'],
  },

  // --- Workspace G: File Sharing (201) ---
  201: {
    id: 201,
    name: 'File Sharing Utility',
    workspace: 'file_sharing',
    defaultOperation: 'share',
    description: 'Direct on-device sharing via native share sheet with zero cloud intermediaries.',
    iconName: 'Share2',
    supportedFormats: ['All Files'],
  },
};

export function getArchiveToolConfig(toolId: number): ArchiveToolConfig | undefined {
  return ARCHIVE_TOOL_MAP[toolId];
}

export function isArchiveStudioTool(toolId: number): boolean {
  return (toolId >= 181 && toolId <= 204) || toolId === 372;
}
