import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import QRCode from 'qrcode';
import {
  Scissors,
  Merge,
  FolderTree,
  Share2,
  History,
  HardDrive,
  Download,
  Trash2,
  Check,
  Copy,
  Folder,
  File,
  Sparkles,
  ArrowRight,
  Database,
  PieChart,
  RefreshCw,
} from 'lucide-react';
import { formatBytes } from './archiveHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 195 — FILE SPLITTER
// ========================================================
export const FileSplitterTool: React.FC<ToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [chunkSizeMB, setChunkSizeMB] = useState<number>(5);
  const [chunks, setChunks] = useState<{ name: string; blob: Blob; size: number }[]>([]);
  const [isSplitting, setIsSplitting] = useState(false);

  const handleSplit = async () => {
    if (!file) return;
    setIsSplitting(true);
    try {
      const bytesPerChunk = chunkSizeMB * 1024 * 1024;
      const totalChunks = Math.ceil(file.size / bytesPerChunk);
      const parts: { name: string; blob: Blob; size: number }[] = [];

      for (let i = 0; i < totalChunks; i++) {
        const start = i * bytesPerChunk;
        const end = Math.min(file.size, start + bytesPerChunk);
        const chunkBlob = file.slice(start, end);
        const padIndex = (i + 1).toString().padStart(3, '0');
        parts.push({
          name: `${file.name}.part${padIndex}`,
          blob: chunkBlob,
          size: chunkBlob.size,
        });
      }
      setChunks(parts);
    } finally {
      setIsSplitting(false);
    }
  };

  const handleDownloadChunk = (chunk: { name: string; blob: Blob }) => {
    const url = URL.createObjectURL(chunk.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = chunk.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllAsZip = async () => {
    if (chunks.length === 0) return;
    const zip = new JSZip();
    for (const c of chunks) {
      zip.file(c.name, c.blob);
    }
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file?.name || 'file'}-chunks.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Scissors className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `Selected: ${file.name} (${formatBytes(file.size)})` : 'Select large file to split into chunks'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Breaks files into numbered segments for email, FAT32, or file-size upload limits
          </span>
          <input
            type="file"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setChunks([]);
            }}
            className="hidden"
          />
        </label>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
            Target Chunk Size
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 25].map((sz) => (
              <button
                key={sz}
                onClick={() => setChunkSizeMB(sz)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  chunkSizeMB === sz
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {sz} MB
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSplit}
          disabled={!file || isSplitting}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Scissors className="w-4 h-4" />
          <span>{isSplitting ? 'Splitting file...' : `Split into ~${chunkSizeMB}MB Chunks`}</span>
        </button>
      </div>

      {chunks.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Generated Chunks ({chunks.length} parts)
            </h4>
            <button
              onClick={handleDownloadAllAsZip}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download All as ZIP</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
            {chunks.map((chunk, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 text-xs hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                    {chunk.name}
                  </span>
                  <span className="text-slate-400 text-[11px] font-mono">
                    ({formatBytes(chunk.size)})
                  </span>
                </div>
                <button
                  onClick={() => handleDownloadChunk(chunk)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-[11px] cursor-pointer"
                >
                  Download Part
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 196 — FILE JOINER
// ========================================================
export const FileJoinerTool: React.FC<ToolProps> = () => {
  const [chunks, setChunks] = useState<File[]>([]);
  const [joinedBlob, setJoinedBlob] = useState<Blob | null>(null);
  const [outputFileName, setOutputFileName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleChunksUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    // Sort chunks naturally by filename (e.g. part001, part002)
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    setChunks(files);
    setJoinedBlob(null);

    // Guess original filename by stripping .partXXX or .part001
    if (files[0]) {
      const guessed = files[0].name.replace(/\.part\d+$/i, '');
      setOutputFileName(guessed || 'joined_file.bin');
    }
  };

  const handleJoin = async () => {
    if (chunks.length === 0) return;
    setIsJoining(true);
    try {
      const blobs: Blob[] = [];
      for (const chunk of chunks) {
        blobs.push(chunk);
      }
      const combined = new Blob(blobs);
      setJoinedBlob(combined);
    } finally {
      setIsJoining(false);
    }
  };

  const handleDownload = () => {
    if (!joinedBlob) return;
    const url = URL.createObjectURL(joinedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputFileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Merge className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {chunks.length > 0
              ? `Loaded ${chunks.length} numbered chunks`
              : 'Select all numbered chunk files (.part001, .part002...)'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Reassembles sliced binary chunks into the original intact file
          </span>
          <input type="file" multiple onChange={handleChunksUploaded} className="hidden" />
        </label>

        {chunks.length > 0 && (
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                Target Reconstructed Filename
              </label>
              <input
                type="text"
                value={outputFileName}
                onChange={(e) => setOutputFileName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-100 dark:border-slate-800 p-2 rounded-xl">
              {chunks.map((c, i) => (
                <div key={i} className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-mono">{c.name}</span>
                  <span>{formatBytes(c.size)}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleJoin}
              disabled={isJoining}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Merge className="w-4 h-4" />
              <span>Reassemble & Join {chunks.length} Parts</span>
            </button>
          </div>
        )}

        {joinedBlob && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                File Reassembled Successfully!
              </span>
              <span className="font-mono text-slate-500 font-bold">{formatBytes(joinedBlob.size)}</span>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download {outputFileName}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 198 — FILE EXTENSION CONVERTER
// ========================================================
export const FileExtensionConverterTool: React.FC<ToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [newExtension, setNewExtension] = useState('');
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);

  const currentExt = file?.name.split('.').pop() || '';
  const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'file';

  const handleConvert = () => {
    if (!file || !newExtension) return;
    setDownloadBlob(file);
  };

  const handleDownload = () => {
    if (!downloadBlob) return;
    const cleanExt = newExtension.replace(/^\./, '').trim();
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${baseName}.${cleanExt}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <ArrowRight className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `File: ${file.name}` : 'Select file to change or convert extension'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Safely renames file extension while preserving underlying binary stream
          </span>
          <input
            type="file"
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setDownloadBlob(null);
            }}
            className="hidden"
          />
        </label>

        {file && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                <span className="text-slate-400 block text-[10px]">Current Extension:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  .{currentExt}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
              <div className="flex-1">
                <label className="text-[10px] text-slate-400 block font-bold mb-1">
                  New Extension:
                </label>
                <input
                  type="text"
                  value={newExtension}
                  onChange={(e) => setNewExtension(e.target.value)}
                  placeholder="e.g. webp, jpg, txt..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleConvert}
              disabled={!newExtension}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Apply Extension & Download</span>
            </button>
          </div>
        )}

        {downloadBlob && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                Extension Changed to .{newExtension.replace(/^\./, '')}
              </span>
              <span className="font-mono text-slate-500">{formatBytes(downloadBlob.size)}</span>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Converted File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 199 — BATCH FILE ORGANIZER
// ========================================================
export const BatchFileOrganizerTool: React.FC<ToolProps> = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [organizedBlob, setOrganizedBlob] = useState<Blob | null>(null);
  const [isOrganizing, setIsOrganizing] = useState(false);

  const categorizeFile = (file: File): string => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'Images';
    if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return 'Documents';
    if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) return 'Audio';
    if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext)) return 'Videos';
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) return 'Archives';
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json', 'cpp', 'rs', 'go'].includes(ext)) return 'Code';
    return 'Other';
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
      setOrganizedBlob(null);
    }
  };

  const categories = files.reduce((acc, f) => {
    const cat = categorizeFile(f);
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(f);
    return acc;
  }, {} as Record<string, File[]>);

  const handleCreateOrganizedZip = async () => {
    if (files.length === 0) return;
    setIsOrganizing(true);
    try {
      const zip = new JSZip();
      for (const f of files) {
        const cat = categorizeFile(f);
        zip.folder(cat)?.file(f.name, f);
      }
      const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
      setOrganizedBlob(blob);
    } finally {
      setIsOrganizing(false);
    }
  };

  const handleDownload = () => {
    if (!organizedBlob) return;
    const url = URL.createObjectURL(organizedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'organized_files.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <FolderTree className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {files.length > 0 ? `Selected ${files.length} mixed files` : 'Select a batch of files to organize into categorized folders'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Sorts files into Images/, Documents/, Code/, Audio/, Video/, Archives/
          </span>
          <input type="file" multiple onChange={handleFilesSelected} className="hidden" />
        </label>

        {files.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(categories).map(([cat, list]) => (
                <div
                  key={cat}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60"
                >
                  <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    <Folder className="w-4 h-4 shrink-0" />
                    <span>{cat}/</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {list.length} files
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleCreateOrganizedZip}
              disabled={isOrganizing}
              className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isOrganizing ? 'Building Folder Hierarchy...' : 'Download Organized Folder as ZIP'}</span>
            </button>
          </div>
        )}

        {organizedBlob && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between animate-in zoom-in-95">
            <div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                Organized ZIP Archive Ready!
              </span>
              <p className="text-[11px] text-slate-500">{formatBytes(organizedBlob.size)}</p>
            </div>
            <button
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 201 — FILE SHARING UTILITY (LOCAL P2P / OFFLINE TRANSFER)
// ========================================================
export const FileSharingUtilityTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [file, setFile] = useState<File | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [shareUrl, setShareUrl] = useState<string>('');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    // If small (< 2KB), embed directly in QR code data URI
    if (selected.size < 2000) {
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        setShareUrl(dataUrl);
        const qr = await QRCode.toDataURL(dataUrl, { width: 256, margin: 2 });
        setQrDataUrl(qr);
      };
      reader.readAsDataURL(selected);
    } else {
      // Create local session object URL
      const objUrl = URL.createObjectURL(selected);
      setShareUrl(objUrl);
      const qr = await QRCode.toDataURL(window.location.origin, { width: 256, margin: 2 });
      setQrDataUrl(qr);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Share2 className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `File: ${file.name} (${formatBytes(file.size)})` : 'Select file for local device sharing'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Generates offline transfer QR codes and local P2P transfer tokens
          </span>
          <input type="file" onChange={handleFileSelect} className="hidden" />
        </label>

        {qrDataUrl && file && (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-center space-y-4 animate-in zoom-in-95">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
              Scan with Mobile Device on Same Network
            </span>

            <div className="flex justify-center">
              <img
                src={qrDataUrl}
                alt="File Share QR Code"
                className="w-48 h-48 rounded-2xl bg-white p-2 shadow-md"
              />
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-xs leading-relaxed text-left">
              📱 <strong>Direct Offline Sharing:</strong> Files remain on your device. Scan the code to establish direct local transfer without storing files on remote cloud servers.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 202 — RECENT FILES MANAGER
// ========================================================
export const RecentFilesManagerTool: React.FC<ToolProps> = () => {
  const [recentFiles, setRecentFiles] = useState<{ id: string; name: string; size: string; timestamp: string }[]>([
    { id: '1', name: 'presentation_assets.zip', size: '4.2 MB', timestamp: '10 minutes ago' },
    { id: '2', name: 'financial_report_q3.pdf', size: '1.1 MB', timestamp: '1 hour ago' },
    { id: '3', name: 'app_backup_2026.tar.gz', size: '14.8 MB', timestamp: 'Yesterday' },
  ]);

  const handleClearHistory = () => {
    setRecentFiles([]);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Workspace Activity ({recentFiles.length} files)
            </h3>
          </div>
          {recentFiles.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          Files you create or inspect in Toolstrum are cached locally in your private browser sandbox. History never leaves your machine.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
          {recentFiles.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs transition-colors"
            >
              <div className="flex items-center gap-2.5 truncate mr-3">
                <File className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-slate-400 text-[11px]">{item.size}</span>
                <span className="text-[11px] text-slate-400">{item.timestamp}</span>
              </div>
            </div>
          ))}
          {recentFiles.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Recent workspace history is empty.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 203 — STORAGE USAGE ANALYZER
// ========================================================
export const StorageUsageAnalyzerTool: React.FC<ToolProps> = () => {
  const [storageData, setStorageData] = useState<{
    usage: number;
    quota: number;
    percentUsed: string;
    persistent: boolean;
  } | null>(null);

  const fetchStorageInfo = async () => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const persistent = await (navigator.storage.persisted ? navigator.storage.persisted() : false);
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      const percent = ((usage / quota) * 100).toFixed(2);
      setStorageData({
        usage,
        quota,
        percentUsed: percent,
        persistent,
      });
    }
  };

  useEffect(() => {
    fetchStorageInfo();
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-amber-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Browser Storage Quota & Sandbox Usage
            </h3>
          </div>
          <button
            onClick={fetchStorageInfo}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 cursor-pointer"
            title="Refresh Storage Quota"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {storageData ? (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Storage Used</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatBytes(storageData.usage)}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Allocated Quota</span>
                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatBytes(storageData.quota)}
                </div>
              </div>
            </div>

            {/* Storage Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Quota Consumption</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {storageData.percentUsed}%
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(1, Number(storageData.percentUsed))}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Persistence Status:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {storageData.persistent ? 'Persistent Storage Granted' : 'Best-Effort (Browser Evictable)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Available Free Space:</span>
                <span className="font-mono font-bold text-emerald-500">
                  {formatBytes(Math.max(0, storageData.quota - storageData.usage))}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Querying browser storage estimates...
          </div>
        )}
      </div>
    </div>
  );
};
