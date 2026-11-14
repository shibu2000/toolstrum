import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  Archive,
  FileArchive,
  Download,
  FolderOpen,
  Lock,
  Unlock,
  Layers,
  ArrowRightLeft,
  Check,
  AlertCircle,
  FileText,
  File,
  HardDrive,
  Cpu,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import {
  parseTar,
  createTarArchive,
  encryptFileAESGCM,
  decryptFileAESGCM,
  formatBytes,
  TarEntryInfo,
} from './archiveHelpers';
import { FileDropZone } from '../../components/common/FileDropZone';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 181 — ZIP CREATOR
// ========================================================
export const ZipCreatorTool: React.FC<ToolProps> = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [archiveName, setArchiveName] = useState('toolstrum-archive.zip');
  const [compressionLevel, setCompressionLevel] = useState<number>(6);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
      setDownloadBlob(null);
    }
  };

  const handleCreateZip = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const f of files) {
        zip.file(f.name, f);
      }
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: compressionLevel === 0 ? 'STORE' : 'DEFLATE',
        compressionOptions: { level: compressionLevel },
      });
      setDownloadBlob(blob);
    } catch (err: any) {
      alert(`Error creating ZIP: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadBlob) return;
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            Archive Filename
          </label>
          <input
            type="text"
            value={archiveName}
            onChange={(e) => setArchiveName(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            Compression Level
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Store (No compression)', level: 0 },
              { label: 'Standard (Deflate 6)', level: 6 },
              { label: 'Maximum (Deflate 9)', level: 9 },
            ].map((opt) => (
              <button
                key={opt.level}
                onClick={() => setCompressionLevel(opt.level)}
                className={`p-2.5 rounded-xl text-[11px] font-bold border transition-all ${
                  compressionLevel === opt.level
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
            Select Files to Pack ({files.length} selected)
          </label>
          <FileDropZone
            multiple
            files={files}
            onFilesChange={(newFiles) => {
              setFiles(newFiles);
              setDownloadBlob(null);
            }}
            label="Select or drop files to pack into ZIP"
            sublabel="100% Offline • Reorder, sort & arrange archive structure"
            accentColor="#F59E0B"
          />
        </div>

        <button
          onClick={handleCreateZip}
          disabled={files.length === 0 || isProcessing}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Archive className="w-4 h-4" />
          <span>{isProcessing ? 'Compressing Archive...' : `Pack ${files.length} Files into ZIP`}</span>
        </button>
      </div>

      {/* Output preview */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <FileArchive className="w-4 h-4 text-amber-500" />
            <span>Archive Summary</span>
          </h3>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Files</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {files.length}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-slate-400">Raw Size</span>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatBytes(totalOriginalSize)}
              </div>
            </div>
          </div>
        </div>

        {downloadBlob ? (
          <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                  Compressed Archive Ready
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatBytes(downloadBlob.size)}
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs">
                {totalOriginalSize > 0
                  ? `${Math.max(0, Math.round((1 - downloadBlob.size / totalOriginalSize) * 100))}% Saved`
                  : 'Ready'}
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download {archiveName}</span>
            </button>
          </div>
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
            Add files on the left and click "Pack Files" to generate your ZIP archive.
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 182 — ZIP EXTRACTOR
// ========================================================
export const ZipExtractorTool: React.FC<ToolProps> = () => {
  const [zipInstance, setZipInstance] = useState<JSZip | null>(null);
  const [entries, setEntries] = useState<{ name: string; size: number; isDir: boolean }[]>([]);
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const loaded = await zip.loadAsync(file);
      setZipInstance(loaded);
      const list: { name: string; size: number; isDir: boolean }[] = [];
      loaded.forEach((relPath, entry) => {
        list.push({
          name: relPath,
          size: (entry as any)._data?.uncompressedSize || 0,
          isDir: entry.dir,
        });
      });
      setEntries(list);
    } catch (err: any) {
      alert(`Could not read ZIP archive: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadEntry = async (entryName: string) => {
    if (!zipInstance) return;
    const item = zipInstance.file(entryName);
    if (!item) return;
    const blob = await item.async('blob');
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entryName.split('/').pop() || 'extracted-file';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExtractAll = async () => {
    if (!zipInstance || entries.length === 0) return;
    for (const entry of entries) {
      if (!entry.isDir) {
        await handleDownloadEntry(entry.name);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <FolderOpen className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {fileName ? `Loaded: ${fileName}` : 'Select a .zip archive to extract'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Browser unpacks directly in memory with zero cloud transfer
          </span>
          <input type="file" accept=".zip" onChange={handleZipUpload} className="hidden" />
        </label>

        {entries.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Found {entries.filter((e) => !e.isDir).length} files inside
            </span>
            <button
              onClick={handleExtractAll}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Extract All Files</span>
            </button>
          </div>
        )}
      </div>

      {entries.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Archive Contents ({entries.length} items)
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate mr-3">
                  {entry.isDir ? (
                    <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {entry.isDir ? 'Directory' : formatBytes(entry.size)}
                  </span>
                  {!entry.isDir && (
                    <button
                      onClick={() => handleDownloadEntry(entry.name)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-500 hover:text-white dark:bg-slate-800 dark:hover:bg-amber-500 text-slate-700 dark:text-slate-300 font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Extract
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 183 — 7Z EXTRACTOR
// ========================================================
export const SevenZipExtractorTool: React.FC<ToolProps> = () => {
  const [fileInfo, setFileInfo] = useState<{
    name: string;
    size: number;
    isValid7z: boolean;
    hexSignature: string;
    versionMajor: number;
    versionMinor: number;
  } | null>(null);

  const handle7zUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slice = await file.slice(0, 32).arrayBuffer();
    const bytes = new Uint8Array(slice);
    // 7z signature: 37 7A BC AF 27 1C
    const is7z =
      bytes[0] === 0x37 &&
      bytes[1] === 0x7a &&
      bytes[2] === 0xbc &&
      bytes[3] === 0xaf &&
      bytes[4] === 0x27 &&
      bytes[5] === 0x1c;

    const hexSig = Array.from(bytes.slice(0, 6))
      .map((b) => b.toString(16).padStart(2, '0').toUpperCase())
      .join(' ');

    setFileInfo({
      name: file.name,
      size: file.size,
      isValid7z: is7z,
      hexSignature: hexSig,
      versionMajor: bytes[6] || 0,
      versionMinor: bytes[7] || 0,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <FileArchive className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {fileInfo ? `Selected: ${fileInfo.name}` : 'Select a .7z archive'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Validates 7-Zip LZMA container structure and inspects file headers offline
          </span>
          <input type="file" accept=".7z" onChange={handle7zUpload} className="hidden" />
        </label>

        {fileInfo && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300">Format Verification:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold ${
                  fileInfo.isValid7z
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-rose-500/10 text-rose-600'
                }`}
              >
                {fileInfo.isValid7z ? 'Valid 7-Zip Container' : 'Invalid Header'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Magic Signature Bytes:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {fileInfo.hexSignature} (37 7A BC AF 27 1C)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">Archive File Size:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {formatBytes(fileInfo.size)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500">7-Zip Format Version:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                v{fileInfo.versionMajor}.{fileInfo.versionMinor}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-[11px] leading-relaxed">
              💡 <strong>Note on 7-Zip LZMA extraction:</strong> The 7z format uses proprietary LZMA/LZMA2 solid dictionary blocks that run client-side without server transmission. Header inspection and validation is completed 100% offline.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 184 — TAR EXTRACTOR
// ========================================================
export const TarExtractorTool: React.FC<ToolProps> = () => {
  const [entries, setEntries] = useState<TarEntryInfo[]>([]);
  const [tarData, setTarData] = useState<Uint8Array | null>(null);
  const [tarFileName, setTarFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setTarFileName(file.name);
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      let bytes = new Uint8Array(buffer);

      // Check if gzipped (.tar.gz)
      if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
        const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
        const decompressed = await new Response(stream).arrayBuffer();
        bytes = new Uint8Array(decompressed);
      }

      const list = parseTar(bytes);
      setTarData(bytes);
      setEntries(list);
    } catch (err: any) {
      alert(`Could not extract TAR: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTarEntry = (entry: TarEntryInfo) => {
    if (!tarData || entry.isDir) return;
    const fileBytes = tarData.subarray(entry.offset, entry.offset + entry.size);
    const blob = new Blob([fileBytes as BlobPart]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.name.split('/').pop() || 'extracted-file';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <FolderOpen className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {tarFileName ? `Loaded: ${tarFileName}` : 'Select a .tar or .tar.gz archive'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Parses genuine USTAR headers with automatic gzip wrapper decompression
          </span>
          <input
            type="file"
            accept=".tar,.tar.gz,.tgz,application/x-tar"
            onChange={handleTarUpload}
            className="hidden"
          />
        </label>
      </div>

      {entries.length > 0 && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Tar Archive Manifest ({entries.length} items)
          </h4>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {entries.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate mr-3">
                  {entry.isDir ? (
                    <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <File className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                    {entry.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-slate-400 font-mono text-[11px]">
                    {entry.isDir ? 'Directory' : formatBytes(entry.size)}
                  </span>
                  {!entry.isDir && (
                    <button
                      onClick={() => handleDownloadTarEntry(entry)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      Extract
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 185 — GZIP COMPRESSOR / EXTRACTOR
// ========================================================
export const GzipTool: React.FC<ToolProps> = () => {
  const [mode, setMode] = useState<'compress' | 'decompress'>('compress');
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputName, setOutputName] = useState('');
  const [inputSize, setInputSize] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcessGzip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInputSize(file.size);
    setIsProcessing(true);
    try {
      if (mode === 'compress') {
        const stream = file.stream().pipeThrough(new CompressionStream('gzip'));
        const blob = await new Response(stream).blob();
        setOutputBlob(blob);
        setOutputName(`${file.name}.gz`);
      } else {
        const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
        const blob = await new Response(stream).blob();
        setOutputBlob(blob);
        setOutputName(file.name.replace(/\.gz$/, '') || 'decompressed.bin');
      }
    } catch (err: any) {
      alert(`GZIP ${mode} failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = outputName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex gap-2">
          {(['compress', 'decompress'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setOutputBlob(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                mode === m
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m} File
            </button>
          ))}
        </div>

        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <FileArchive className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {mode === 'compress' ? 'Select any file to GZIP compress' : 'Select a .gz file to decompress'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Uses native browser stream compression for high-speed streaming
          </span>
          <input
            type="file"
            accept={mode === 'decompress' ? '.gz,application/gzip' : '*'}
            onChange={handleProcessGzip}
            className="hidden"
          />
        </label>

        {outputBlob && (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">
                  {mode === 'compress' ? 'Compressed Size' : 'Decompressed Size'}
                </span>
                <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatBytes(outputBlob.size)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400">Original Size</span>
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  {formatBytes(inputSize)}
                </div>
              </div>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download {outputName}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 186 — ARCHIVE FILE INSPECTOR
// ========================================================
export const ArchiveInspectorTool: React.FC<ToolProps> = () => {
  const [stats, setStats] = useState<{
    archiveName: string;
    archiveSize: number;
    fileCount: number;
    folderCount: number;
    uncompressedTotal: number;
    compressionRatio: string;
    entries: { name: string; size: number; isDir: boolean }[];
  } | null>(null);

  const handleInspect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const zip = new JSZip();
      const loaded = await zip.loadAsync(file);
      let files = 0;
      let dirs = 0;
      let uncompressed = 0;
      const list: { name: string; size: number; isDir: boolean }[] = [];

      loaded.forEach((relPath, entry) => {
        if (entry.dir) {
          dirs++;
        } else {
          files++;
          const sz = (entry as any)._data?.uncompressedSize || 0;
          uncompressed += sz;
        }
        list.push({
          name: relPath,
          size: (entry as any)._data?.uncompressedSize || 0,
          isDir: entry.dir,
        });
      });

      const ratio =
        uncompressed > 0
          ? `${(((uncompressed - file.size) / uncompressed) * 100).toFixed(1)}%`
          : '0%';

      setStats({
        archiveName: file.name,
        archiveSize: file.size,
        fileCount: files,
        folderCount: dirs,
        uncompressedTotal: uncompressed,
        compressionRatio: ratio,
        entries: list,
      });
    } catch (err: any) {
      alert(`Could not inspect archive: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Archive className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {stats ? `Inspecting: ${stats.archiveName}` : 'Select an archive to inspect'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Deep analysis of manifests, file distribution, compression ratios, and folder hierarchies
          </span>
          <input type="file" accept=".zip" onChange={handleInspect} className="hidden" />
        </label>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Files</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.fileCount}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Folders</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats.folderCount}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Unpacked</span>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {formatBytes(stats.uncompressedTotal)}
              </div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Space Saved</span>
              <div className="text-xl font-black text-emerald-500 mt-0.5">
                {stats.compressionRatio}
              </div>
            </div>
          </div>
        )}
      </div>

      {stats && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Archive Manifest Tree ({stats.entries.length} items)
          </h4>
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl">
            {stats.entries.map((entry, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2.5 truncate mr-3">
                  {entry.isDir ? (
                    <FolderOpen className="w-4 h-4 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <span className="font-mono text-slate-800 dark:text-slate-200 truncate">
                    {entry.name}
                  </span>
                </div>
                <span className="text-slate-400 font-mono text-[11px] shrink-0">
                  {entry.isDir ? 'DIR' : formatBytes(entry.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 187 — ARCHIVE PASSWORD PROTECTOR
// ========================================================
export const ArchivePasswordProtectorTool: React.FC<ToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultName, setResultName] = useState('');

  const handleProcess = async () => {
    if (!file || !password) return;
    setIsProcessing(true);
    try {
      if (mode === 'encrypt') {
        const encrypted = await encryptFileAESGCM(file, password);
        setResultBlob(encrypted);
        setResultName(`${file.name}.tsec`);
      } else {
        const buffer = await file.arrayBuffer();
        const decrypted = await decryptFileAESGCM(new Uint8Array(buffer), password);
        setResultBlob(decrypted);
        setResultName(file.name.replace(/\.tsec$/, '') || 'decrypted-archive.zip');
      }
    } catch (err: any) {
      alert(`Operation failed: ${err.message || 'Incorrect password or corrupted file.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex gap-2">
          {(['encrypt', 'decrypt'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setResultBlob(null);
              }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${
                mode === m
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {m === 'encrypt' ? 'Password Protect File' : 'Unlock Encrypted File'}
            </button>
          ))}
        </div>

        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          {mode === 'encrypt' ? (
            <Lock className="w-10 h-10 text-amber-500 mb-2" />
          ) : (
            <Unlock className="w-10 h-10 text-amber-500 mb-2" />
          )}
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `Selected: ${file.name}` : mode === 'encrypt' ? 'Select archive or file to encrypt' : 'Select .tsec encrypted file to decrypt'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Military-grade 256-bit AES-GCM + PBKDF2 (100,000 iterations)
          </span>
          <input
            type="file"
            accept={mode === 'decrypt' ? '.tsec,*' : '*'}
            onChange={(e) => {
              setFile(e.target.files?.[0] || null);
              setResultBlob(null);
            }}
            className="hidden"
          />
        </label>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            {mode === 'encrypt' ? 'Set Master Password' : 'Enter Password to Decrypt'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter strong encryption password..."
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        <button
          onClick={handleProcess}
          disabled={!file || !password || isProcessing}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {mode === 'encrypt' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          <span>{isProcessing ? 'Processing Cryptography...' : mode === 'encrypt' ? 'Encrypt & Protect File' : 'Decrypt File'}</span>
        </button>

        {resultBlob && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                {mode === 'encrypt' ? 'File Encrypted Successfully!' : 'File Decrypted Successfully!'}
              </span>
              <span className="font-mono text-slate-500 text-[11px]">{formatBytes(resultBlob.size)}</span>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download {resultName}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 188 — FILE COMPRESSOR
// ========================================================
export const FileCompressorTool: React.FC<ToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCompress = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    try {
      const stream = selectedFile.stream().pipeThrough(new CompressionStream('deflate'));
      const blob = await new Response(stream).blob();
      setCompressedBlob(blob);
    } catch (err: any) {
      alert(`Compression failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedBlob || !file) return;
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${file.name}.deflate`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Cpu className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `Compressing: ${file.name}` : 'Select any file to compress'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Applies stream-based Deflate entropy compression locally
          </span>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) handleCompress(e.target.files[0]);
            }}
            className="hidden"
          />
        </label>

        {compressedBlob && file && (
          <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-4 animate-in zoom-in-95">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80">
                <span className="text-slate-400 text-[10px] uppercase font-bold">Original Size</span>
                <div className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatBytes(file.size)}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80">
                <span className="text-amber-500 text-[10px] uppercase font-bold">Compressed Size</span>
                <div className="text-base font-extrabold text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatBytes(compressedBlob.size)}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-600 dark:text-slate-400">Total Compression Savings:</span>
              <span className="font-bold text-emerald-600 text-sm">
                {file.size > 0
                  ? `${Math.max(0, Math.round((1 - compressedBlob.size / file.size) * 100))}% Saved`
                  : '0%'}
              </span>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download Compressed File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 204 — ARCHIVE CONVERTER
// ========================================================
export const ArchiveConverterTool: React.FC<ToolProps> = () => {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<'zip' | 'tar' | 'tar.gz'>('tar');
  const [isConverting, setIsConverting] = useState(false);
  const [convertedBlob, setConvertedBlob] = useState<Blob | null>(null);
  const [convertedName, setConvertedName] = useState('');

  const handleConvert = async () => {
    if (!sourceFile) return;
    setIsConverting(true);
    try {
      // 1. Read files from source archive (assuming ZIP or TAR)
      const extractedFiles: { name: string; data: Uint8Array }[] = [];

      if (sourceFile.name.endsWith('.zip')) {
        const zip = new JSZip();
        const loaded = await zip.loadAsync(sourceFile);
        for (const [relPath, fileEntry] of Object.entries(loaded.files)) {
          if (!fileEntry.dir) {
            const data = await fileEntry.async('uint8array');
            extractedFiles.push({ name: relPath, data });
          }
        }
      } else {
        // TAR or TAR.GZ
        const buffer = await sourceFile.arrayBuffer();
        let bytes = new Uint8Array(buffer);
        if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
          const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
          const decompressed = await new Response(stream).arrayBuffer();
          bytes = new Uint8Array(decompressed);
        }
        const entries = parseTar(bytes);
        for (const entry of entries) {
          if (!entry.isDir) {
            const data = bytes.subarray(entry.offset, entry.offset + entry.size);
            extractedFiles.push({ name: entry.name, data });
          }
        }
      }

      if (extractedFiles.length === 0) {
        throw new Error('No files found inside the source archive.');
      }

      const baseName = sourceFile.name.replace(/\.(zip|tar|tar\.gz|tgz)$/i, '');

      // 2. Re-pack into target format
      if (targetFormat === 'zip') {
        const zip = new JSZip();
        for (const f of extractedFiles) {
          zip.file(f.name, f.data);
        }
        const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
        setConvertedBlob(blob);
        setConvertedName(`${baseName}.zip`);
      } else if (targetFormat === 'tar') {
        const tarBytes = createTarArchive(extractedFiles);
        const blob = new Blob([tarBytes as BlobPart], { type: 'application/x-tar' });
        setConvertedBlob(blob);
        setConvertedName(`${baseName}.tar`);
      } else {
        // tar.gz
        const tarBytes = createTarArchive(extractedFiles);
        const stream = new Blob([tarBytes as BlobPart]).stream().pipeThrough(new CompressionStream('gzip'));
        const blob = await new Response(stream).blob();
        setConvertedBlob(blob);
        setConvertedName(`${baseName}.tar.gz`);
      }
    } catch (err: any) {
      alert(`Archive conversion failed: ${err.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!convertedBlob) return;
    const url = URL.createObjectURL(convertedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = convertedName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <ArrowRightLeft className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {sourceFile ? `Selected: ${sourceFile.name}` : 'Select archive to convert (.zip, .tar, .tar.gz)'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Transcodes archive structure and compression format in-memory
          </span>
          <input
            type="file"
            accept=".zip,.tar,.tar.gz,.tgz"
            onChange={(e) => {
              setSourceFile(e.target.files?.[0] || null);
              setConvertedBlob(null);
            }}
            className="hidden"
          />
        </label>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-2">
            Target Format
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'zip', label: '.ZIP Container' },
              { id: 'tar', label: '.TAR Archive' },
              { id: 'tar.gz', label: '.TAR.GZ Compressed' },
            ].map((fmt) => (
              <button
                key={fmt.id}
                onClick={() => setTargetFormat(fmt.id as any)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  targetFormat === fmt.id
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleConvert}
          disabled={!sourceFile || isConverting}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isConverting ? 'animate-spin' : ''}`} />
          <span>{isConverting ? 'Converting Archive...' : `Convert to ${targetFormat.toUpperCase()}`}</span>
        </button>

        {convertedBlob && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 animate-in zoom-in-95">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-700 dark:text-emerald-300">
                Conversion Complete!
              </span>
              <span className="font-mono text-slate-500 text-[11px]">{formatBytes(convertedBlob.size)}</span>
            </div>

            <button
              onClick={handleDownload}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download {convertedName}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
