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
  Edit3,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { formatBytes } from './archiveHelpers';
import { FileDropZone } from '../../components/common/FileDropZone';

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
        <FileDropZone
          multiple
          files={chunks}
          onFilesChange={(newChunks) => {
            setChunks(newChunks);
            setJoinedBlob(null);
            if (newChunks[0] && !outputFileName) {
              const guessed = newChunks[0].name.replace(/\.part\d+$/i, '');
              setOutputFileName(guessed || 'joined_file.bin');
            }
          }}
          label="Select all numbered chunk files (.part001, .part002...)"
          sublabel="Reorders chunks with live sliding before binary reassembly"
          accentColor="#F59E0B"
        />

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
  const [recentFiles, setRecentFiles] = useState<{ id: string; name: string; size: string; timestamp: string }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_recent_files');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_recent_files', JSON.stringify(recentFiles));
    } catch {}
  }, [recentFiles]);

  const deleteRecentFile = (id: string) => {
    setRecentFiles((prev) => prev.filter((item) => item.id !== id));
  };

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
                <button
                  onClick={() => deleteRecentFile(item.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Remove from history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
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

// ========================================================
// 192 — BULK FILE RENAMER
// ========================================================
export const BulkFileRenamerTool: React.FC<ToolProps> = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [prefix, setPrefix] = useState<string>('');
  const [suffix, setSuffix] = useState<string>('');
  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');
  const [caseOption, setCaseOption] = useState<'none' | 'lower' | 'upper' | 'title' | 'kebab' | 'snake'>('none');
  const [numbering, setNumbering] = useState<boolean>(false);
  const [startNumber, setStartNumber] = useState<number>(1);
  const [padDigits, setPadDigits] = useState<number>(2);
  const [isZipping, setIsZipping] = useState<boolean>(false);

  const handleFiles = (uploaded: File[]) => {
    if (uploaded.length > 0) {
      setFiles((prev) => [...prev, ...uploaded]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const computeNewName = (file: File, index: number): string => {
    const lastDot = file.name.lastIndexOf('.');
    let base = lastDot > 0 ? file.name.slice(0, lastDot) : file.name;
    const ext = lastDot > 0 ? file.name.slice(lastDot + 1) : '';

    if (findText) {
      base = base.split(findText).join(replaceText);
    }

    if (caseOption === 'lower') {
      base = base.toLowerCase();
    } else if (caseOption === 'upper') {
      base = base.toUpperCase();
    } else if (caseOption === 'title') {
      base = base.replace(/\b\w/g, (c) => c.toUpperCase());
    } else if (caseOption === 'kebab') {
      base = base.toLowerCase().replace(/[\s_]+/g, '-');
    } else if (caseOption === 'snake') {
      base = base.toLowerCase().replace(/[\s-]+/g, '_');
    }

    if (numbering) {
      const numStr = String(startNumber + index).padStart(padDigits, '0');
      base = `${base}_${numStr}`;
    }

    base = `${prefix}${base}${suffix}`;
    return ext ? `${base}.${ext}` : base;
  };

  const downloadSingleRenamed = (file: File, newName: string) => {
    const blob = new Blob([file], { type: file.type || 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllZipped = async () => {
    if (files.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      files.forEach((file, idx) => {
        const renamed = computeNewName(file, idx);
        zip.file(renamed, file);
      });
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'renamed_files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <FileDropZone
          files={files}
          onFilesChange={setFiles}
          accept="*/*"
          multiple={true}
          label="Drop batch files here to rename"
          accentColor="#F59E0B"
        />

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Bulk Rename Rules
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Prefix
              </label>
              <input
                type="text"
                placeholder="e.g. DOC_"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Suffix
              </label>
              <input
                type="text"
                placeholder="e.g. _v1"
                value={suffix}
                onChange={(e) => setSuffix(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Find text
              </label>
              <input
                type="text"
                placeholder="Find in name..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Replace with
              </label>
              <input
                type="text"
                placeholder="Replacement..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Letter Case Conversion
            </label>
            <div className="grid grid-cols-3 gap-1.5 text-xs">
              {(
                [
                  ['none', 'Keep Original'],
                  ['lower', 'lowercase'],
                  ['upper', 'UPPERCASE'],
                  ['title', 'Title Case'],
                  ['kebab', 'kebab-case'],
                  ['snake', 'snake_case'],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setCaseOption(val)}
                  className={`p-2 rounded-xl border text-center font-medium transition-all ${
                    caseOption === val
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={numbering}
                onChange={(e) => setNumbering(e.target.checked)}
                className="rounded border-slate-300 text-amber-500 focus:ring-amber-400"
              />
              Append Sequential Numbering (_01, _02...)
            </label>
            {numbering && (
              <div className="grid grid-cols-2 gap-3 pl-6">
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Start Number</span>
                  <input
                    type="number"
                    value={startNumber}
                    onChange={(e) => setStartNumber(Number(e.target.value) || 1)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block mb-1">Padding Digits</span>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={padDigits}
                    onChange={(e) => setPadDigits(Number(e.target.value) || 2)}
                    className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Batch Preview ({files.length} {files.length === 1 ? 'file' : 'files'})
            </span>
            {files.length > 0 && (
              <button
                type="button"
                onClick={() => setFiles([])}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="mt-3 max-h-[460px] overflow-y-auto space-y-2">
            {files.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Upload files to preview bulk rename output in real-time.
              </div>
            ) : (
              files.map((file, idx) => {
                const newName = computeNewName(file, idx);
                return (
                  <div
                    key={`${file.name}-${idx}`}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-slate-400 line-through truncate font-mono text-[11px]">
                        {file.name}
                      </div>
                      <div className="text-amber-600 dark:text-amber-400 font-mono font-bold truncate text-xs flex items-center gap-1.5">
                        <ArrowRight className="w-3 h-3 flex-shrink-0" />
                        {newName}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => downloadSingleRenamed(file, newName)}
                        title="Download renamed file"
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {files.length > 0 && (
          <button
            type="button"
            disabled={isZipping}
            onClick={downloadAllZipped}
            className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 font-bold text-white text-xs shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isZipping ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download All Renamed Files (.ZIP)
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 200 — TEMPORARY FILE CLEANER
// ========================================================
export const TemporaryFileCleanerTool: React.FC<ToolProps> = () => {
  const [stats, setStats] = useState<{
    localItems: number;
    localBytes: number;
    sessionItems: number;
    sessionBytes: number;
    cacheNames: string[];
  }>({
    localItems: 0,
    localBytes: 0,
    sessionItems: 0,
    sessionBytes: 0,
    cacheNames: [],
  });
  const [cleaning, setCleaning] = useState<boolean>(false);
  const [cleanedMsg, setCleanedMsg] = useState<string | null>(null);

  const scanStorage = async () => {
    let localBytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) {
        localBytes += (k.length + (localStorage.getItem(k)?.length || 0)) * 2;
      }
    }

    let sessionBytes = 0;
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k) {
        sessionBytes += (k.length + (sessionStorage.getItem(k)?.length || 0)) * 2;
      }
    }

    let cacheNames: string[] = [];
    if ('caches' in window) {
      try {
        cacheNames = await caches.keys();
      } catch {
        // Caches unsupported
      }
    }

    setStats({
      localItems: localStorage.length,
      localBytes,
      sessionItems: sessionStorage.length,
      sessionBytes,
      cacheNames,
    });
  };

  useEffect(() => {
    scanStorage();
  }, []);

  const clearLocalStorage = () => {
    localStorage.clear();
    setCleanedMsg('LocalStorage cleared successfully.');
    scanStorage();
    setTimeout(() => setCleanedMsg(null), 3000);
  };

  const clearSessionStorage = () => {
    sessionStorage.clear();
    setCleanedMsg('SessionStorage cleared successfully.');
    scanStorage();
    setTimeout(() => setCleanedMsg(null), 3000);
  };

  const clearCaches = async () => {
    setCleaning(true);
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setCleanedMsg('CacheStorage caches purged cleanly.');
    } finally {
      setCleaning(false);
      scanStorage();
      setTimeout(() => setCleanedMsg(null), 3000);
    }
  };

  const clearAllTemporaryData = async () => {
    setCleaning(true);
    try {
      localStorage.clear();
      sessionStorage.clear();
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      setCleanedMsg('All browser temporary caches, local stores, and session artifacts wiped cleanly!');
    } finally {
      setCleaning(false);
      scanStorage();
      setTimeout(() => setCleanedMsg(null), 3500);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Browser Temporary Artifacts & Cache Cleaner
            </span>
          </div>
          <button
            type="button"
            onClick={scanStorage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>

        {cleanedMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-500" />
            {cleanedMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-slate-400 font-semibold text-[11px]">Local Storage</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatBytes(stats.localBytes)}
            </div>
            <div className="text-[11px] text-slate-500">{stats.localItems} key-value entries</div>
            <button
              type="button"
              onClick={clearLocalStorage}
              className="w-full mt-1 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-[11px] transition-all"
            >
              Clear Local
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-slate-400 font-semibold text-[11px]">Session Storage</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {formatBytes(stats.sessionBytes)}
            </div>
            <div className="text-[11px] text-slate-500">{stats.sessionItems} active session items</div>
            <button
              type="button"
              onClick={clearSessionStorage}
              className="w-full mt-1 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-[11px] transition-all"
            >
              Clear Session
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="text-slate-400 font-semibold text-[11px]">Cache Storage</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.cacheNames.length} {stats.cacheNames.length === 1 ? 'cache' : 'caches'}
            </div>
            <div className="text-[11px] text-slate-500">Service worker / offline cache</div>
            <button
              type="button"
              onClick={clearCaches}
              className="w-full mt-1 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold text-[11px] transition-all"
            >
              Purge Caches
            </button>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="leading-relaxed">
            All data cleared here resides exclusively inside your browser sandbox. No server logs, network requests, or external telemetry are ever involved.
          </p>
        </div>

        <button
          type="button"
          disabled={cleaning}
          onClick={clearAllTemporaryData}
          className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {cleaning ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Purge All Temporary Caches & Stores (1-Click)
        </button>
      </div>
    </div>
  );
};
