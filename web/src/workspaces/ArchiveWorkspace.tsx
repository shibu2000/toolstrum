import React, { useState } from 'react';
import {
  Archive,
  ShieldCheck,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

// Core Archive Tools
import {
  ZipCreatorTool,
  ZipExtractorTool,
  SevenZipExtractorTool,
  TarExtractorTool,
  GzipTool,
  ArchiveInspectorTool,
  ArchivePasswordProtectorTool,
  FileCompressorTool,
  ArchiveConverterTool,
} from './archive/ArchiveCoreTools';

// Inspection & Security Tools
import {
  FileTypeDetectorTool,
  FileSizeAnalyzerTool,
  DuplicateFileFinderTool,
  FileChecksumGeneratorTool,
  ChecksumVerifierTool,
  MimeTypeInspectorTool,
} from './archive/FileInspectionTools';

// Management & Utility Tools
import {
  FileSplitterTool,
  FileJoinerTool,
  BulkFileRenamerTool,
  FileExtensionConverterTool,
  BatchFileOrganizerTool,
  TemporaryFileCleanerTool,
  FileSharingUtilityTool,
  RecentFilesManagerTool,
  StorageUsageAnalyzerTool,
} from './archive/FileManagerTools';

interface ArchiveWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const ArchiveWorkspace: React.FC<ArchiveWorkspaceProps> = ({
  toolId,
  accentColor = '#F59E0B',
}) => {
  const currentToolDef = getToolById(toolId);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderToolContent = () => {
    switch (toolId) {
      // 1. Core Archive Tools
      case 181:
        return <ZipCreatorTool copied={copied} onCopy={handleCopy} />;
      case 182:
        return <ZipExtractorTool copied={copied} onCopy={handleCopy} />;
      case 183:
        return <SevenZipExtractorTool copied={copied} onCopy={handleCopy} />;
      case 184:
        return <TarExtractorTool copied={copied} onCopy={handleCopy} />;
      case 185:
        return <GzipTool copied={copied} onCopy={handleCopy} />;
      case 186:
        return <ArchiveInspectorTool copied={copied} onCopy={handleCopy} />;
      case 187:
        return <ArchivePasswordProtectorTool copied={copied} onCopy={handleCopy} />;
      case 188:
        return <FileCompressorTool copied={copied} onCopy={handleCopy} />;
      case 204:
        return <ArchiveConverterTool copied={copied} onCopy={handleCopy} />;

      // 2. Inspection & Hash Tools
      case 189:
        return <FileTypeDetectorTool copied={copied} onCopy={handleCopy} />;
      case 190:
        return <FileSizeAnalyzerTool copied={copied} onCopy={handleCopy} />;
      case 191:
        return <DuplicateFileFinderTool copied={copied} onCopy={handleCopy} />;
      case 192:
        return <BulkFileRenamerTool copied={copied} onCopy={handleCopy} />;
      case 193:
        return <FileChecksumGeneratorTool copied={copied} onCopy={handleCopy} />;
      case 194:
        return <ChecksumVerifierTool copied={copied} onCopy={handleCopy} />;
      case 197:
        return <MimeTypeInspectorTool copied={copied} onCopy={handleCopy} />;

      // 3. File Manager & Storage Tools
      case 195:
        return <FileSplitterTool copied={copied} onCopy={handleCopy} />;
      case 196:
        return <FileJoinerTool copied={copied} onCopy={handleCopy} />;
      case 198:
        return <FileExtensionConverterTool copied={copied} onCopy={handleCopy} />;
      case 199:
        return <BatchFileOrganizerTool copied={copied} onCopy={handleCopy} />;
      case 200:
        return <TemporaryFileCleanerTool copied={copied} onCopy={handleCopy} />;
      case 201:
        return <FileSharingUtilityTool copied={copied} onCopy={handleCopy} />;
      case 202:
        return <RecentFilesManagerTool copied={copied} onCopy={handleCopy} />;
      case 203:
        return <StorageUsageAnalyzerTool copied={copied} onCopy={handleCopy} />;

      default:
        return (
          <div className="p-8 text-center text-slate-500">
            Select an archive or file tool from the sidebar.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Archive className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentToolDef?.name || 'Archive & Files Studio'}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-medium self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>100% Offline • Zero Server Uploads</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'High-speed in-browser archive packing, decompression, file inspection, and checksum verification.'}
        </p>
      </div>

      {/* Render Dedicated Tool Component */}
      {renderToolContent()}
    </div>
  );
};
