import React, { useState } from 'react';
import {
  FileSearch,
  Hash,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  HardDrive,
  Files,
  Trash2,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  Tag,
} from 'lucide-react';
import {
  detectFileMagic,
  computeHash,
  computeCRC32,
  formatBytes,
  MagicSignature,
} from './archiveHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 189 — FILE TYPE DETECTOR
// ========================================================
export const FileTypeDetectorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [file, setFile] = useState<File | null>(null);
  const [detection, setDetection] = useState<{
    signature: MagicSignature | null;
    hexHeader: string;
    asciiHeader: string;
    isText: boolean;
  } | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsDetecting(true);
    try {
      const result = await detectFileMagic(selected);
      setDetection(result);
    } finally {
      setIsDetecting(false);
    }
  };

  const declaredExt = file?.name.split('.').pop()?.toLowerCase() || '';
  const detectedExt = detection?.signature?.extension || '';
  const isMismatch = detectedExt && declaredExt && detectedExt !== declaredExt;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <FileSearch className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `Inspecting: ${file.name}` : 'Select any file to inspect true file type'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Reads magic byte signatures — unmasks spoofed extensions instantly
          </span>
          <input type="file" onChange={handleFileChange} className="hidden" />
        </label>

        {detection && file && (
          <div className="space-y-4 pt-2">
            {/* Header match badge */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Detected Format
                  </span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {detection.signature ? detection.signature.name : 'Unknown Binary Format'}
                  </div>
                </div>
                {detection.signature && (
                  <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs">
                    {detection.signature.category}
                  </span>
                )}
              </div>

              {isMismatch && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    <strong>Extension Mismatch!</strong> File has extension <code>.{declaredExt}</code> but true internal binary signature is <code>.{detectedExt}</code>.
                  </span>
                </div>
              )}

              {detection.signature && (
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {detection.signature.description}
                </p>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-200/60 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-400 text-[11px]">MIME Type:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {detection.signature?.mime || file.type || 'application/octet-stream'}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Recommended Extension:</span>
                  <div className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    .{detection.signature?.extension || declaredExt || 'bin'}
                  </div>
                </div>
              </div>
            </div>

            {/* Hex Magic Dump */}
            <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 font-mono text-xs space-y-2">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                First 32 Magic Bytes (Hex & ASCII Dump)
              </span>
              <div className="p-2.5 rounded-xl bg-slate-950 text-amber-400 select-all break-all text-[11px] font-semibold">
                {detection.hexHeader}
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 text-slate-300 select-all break-all text-[11px]">
                ASCII: {detection.asciiHeader}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 190 — FILE SIZE ANALYZER
// ========================================================
export const FileSizeAnalyzerTool: React.FC<ToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);

  const bytes = file?.size || 0;
  const kb = bytes / 1000;
  const mb = bytes / (1000 * 1000);
  const gb = bytes / (1000 * 1000 * 1000);

  const kib = bytes / 1024;
  const mib = bytes / (1024 * 1024);
  const gib = bytes / (1024 * 1024 * 1024);

  // 4KB disk clusters
  const clusters = Math.ceil(bytes / 4096);
  const diskSize = clusters * 4096;

  // Transfer speeds
  const calcTime = (speedBytesSec: number) => {
    if (bytes === 0) return '0s';
    const secs = bytes / speedBytesSec;
    if (secs < 1) return '< 1 second';
    if (secs < 60) return `${Math.round(secs)} seconds`;
    return `${Math.round(secs / 60)} minutes`;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <HardDrive className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `Inspecting: ${file.name}` : 'Select any file to analyze exact size & storage metrics'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Calculates exact decimal (SI), binary (IEC), disk cluster allocation, and download times
          </span>
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="hidden" />
        </label>

        {file && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Exact Raw Bytes</span>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
                  {bytes.toLocaleString()} B
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                <span className="text-[10px] uppercase font-bold text-slate-400">Size on Disk (4KB Sectors)</span>
                <div className="text-xl font-black font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                  {diskSize.toLocaleString()} B
                </div>
              </div>
            </div>

            {/* Metric Comparisons */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Standard Unit Breakdowns
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Kilobytes (KB):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{kb.toFixed(2)} KB</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Megabytes (MB):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{mb.toFixed(3)} MB</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Gigabytes (GB):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{gb.toFixed(5)} GB</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Kibibytes (KiB):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{kib.toFixed(2)} KiB</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Mebibytes (MiB):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{mib.toFixed(3)} MiB</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Gibibytes (GiB):</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{gib.toFixed(5)} GiB</p>
                </div>
              </div>
            </div>

            {/* Estimated Download Transfer Times */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 space-y-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Estimated Transfer Times
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">3G (1.5 Mbps)</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {calcTime((1.5 * 1000 * 1000) / 8)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">4G (25 Mbps)</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {calcTime((25 * 1000 * 1000) / 8)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">5G (100 Mbps)</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {calcTime((100 * 1000 * 1000) / 8)}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-slate-400 text-[10px]">Gigabit (1 Gbps)</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {calcTime((1000 * 1000 * 1000) / 8)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 191 — DUPLICATE FILE FINDER
// ========================================================
export const DuplicateFileFinderTool: React.FC<ToolProps> = () => {
  const [analyzedFiles, setAnalyzedFiles] = useState<{
    file: File;
    hash: string;
    isDuplicate: boolean;
  }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setIsProcessing(true);

    try {
      const results: { file: File; hash: string }[] = [];
      for (const file of files) {
        const buffer = await file.arrayBuffer();
        const hash = await computeHash(buffer, 'SHA-256');
        results.push({ file, hash });
      }

      const hashCounts: Record<string, number> = {};
      results.forEach((r) => {
        hashCounts[r.hash] = (hashCounts[r.hash] || 0) + 1;
      });

      setAnalyzedFiles(
        results.map((r) => ({
          ...r,
          isDuplicate: hashCounts[r.hash] > 1,
        }))
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const duplicateGroups = analyzedFiles.reduce((acc, item) => {
    if (item.isDuplicate) {
      if (!acc[item.hash]) acc[item.hash] = [];
      acc[item.hash].push(item);
    }
    return acc;
  }, {} as Record<string, typeof analyzedFiles>);

  const duplicateCount = Object.values(duplicateGroups).reduce(
    (acc, list) => acc + list.length - 1,
    0
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Files className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isProcessing ? 'Hashing files with SHA-256...' : 'Select multiple files or folders to find exact duplicates'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Detects bit-for-bit identical files even if they have different names
          </span>
          <input type="file" multiple onChange={handleFilesUpload} className="hidden" />
        </label>

        {analyzedFiles.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Scanned {analyzedFiles.length} Files
              </span>
              <p className="text-[11px] text-slate-400">
                {duplicateCount > 0
                  ? `Identified ${duplicateCount} redundant duplicate copies`
                  : 'No duplicates found — all files are distinct!'}
              </p>
            </div>
            {duplicateCount > 0 && (
              <span className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 font-bold text-xs">
                {duplicateCount} Duplicates Found
              </span>
            )}
          </div>
        )}
      </div>

      {Object.keys(duplicateGroups).length > 0 && (
        <div className="space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Identified Duplicate Clusters
          </h4>
          {Object.entries(duplicateGroups).map(([hash, group], idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  Group #{idx + 1} ({group.length} exact clones)
                </span>
                <span className="font-mono text-slate-400 text-[10px]">
                  SHA-256: {hash.slice(0, 16)}…
                </span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {group.map((item, fileIdx) => (
                  <div
                    key={fileIdx}
                    className="flex items-center justify-between py-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold flex items-center justify-center text-slate-500">
                        {fileIdx + 1}
                      </span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {item.file.name}
                      </span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {formatBytes(item.file.size)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========================================================
// 193 — FILE CHECKSUM GENERATOR
// ========================================================
export const FileChecksumGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [file, setFile] = useState<File | null>(null);
  const [hashes, setHashes] = useState<{
    sha1: string;
    sha256: string;
    sha384: string;
    sha512: string;
    crc32: string;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleComputeHashes = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const [sha1, sha256, sha384, sha512] = await Promise.all([
        computeHash(buffer, 'SHA-1'),
        computeHash(buffer, 'SHA-256'),
        computeHash(buffer, 'SHA-384'),
        computeHash(buffer, 'SHA-512'),
      ]);

      const crc32 = computeCRC32(bytes);

      setHashes({ sha1, sha256, sha384, sha512, crc32 });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Hash className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `File: ${file.name}` : 'Select any file to compute checksum hashes'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Computes SHA-1, SHA-256, SHA-384, SHA-512, and CRC-32 via native WebCrypto
          </span>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) handleComputeHashes(e.target.files[0]);
            }}
            className="hidden"
          />
        </label>

        {hashes && (
          <div className="space-y-3 pt-2">
            {[
              { label: 'CRC-32 Checksum', value: hashes.crc32 },
              { label: 'SHA-1 Hash', value: hashes.sha1 },
              { label: 'SHA-256 Cryptographic Hash', value: hashes.sha256 },
              { label: 'SHA-384 Cryptographic Hash', value: hashes.sha384 },
              { label: 'SHA-512 Cryptographic Hash', value: hashes.sha512 },
            ].map((item) => (
              <div
                key={item.label}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {item.label}
                  </span>
                  <button
                    onClick={() => onCopy && onCopy(item.value)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                    title="Copy Checksum"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 select-all break-all border border-slate-200/50 dark:border-slate-700/50">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 194 — CHECKSUM VERIFIER
// ========================================================
export const ChecksumVerifierTool: React.FC<ToolProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [computedHash, setComputedHash] = useState('');
  const [algorithm, setAlgorithm] = useState<'SHA-256' | 'SHA-512' | 'SHA-1'>('SHA-256');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsVerifying(true);
    try {
      const buffer = await selectedFile.arrayBuffer();
      const hash = await computeHash(buffer, algorithm);
      setComputedHash(hash);
    } finally {
      setIsVerifying(false);
    }
  };

  const isMatch =
    computedHash &&
    expectedHash.trim() &&
    computedHash.toLowerCase() === expectedHash.trim().toLowerCase();

  const isMismatch =
    computedHash &&
    expectedHash.trim() &&
    computedHash.toLowerCase() !== expectedHash.trim().toLowerCase();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            Hash Algorithm
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['SHA-256', 'SHA-512', 'SHA-1'] as const).map((alg) => (
              <button
                key={alg}
                onClick={() => {
                  setAlgorithm(alg);
                  if (file) handleVerify(file);
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  algorithm === alg
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                {alg}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            Paste Expected Checksum Hash
          </label>
          <input
            type="text"
            value={expectedHash}
            onChange={(e) => setExpectedHash(e.target.value)}
            placeholder="Paste expected SHA-256 / SHA-512 hash here..."
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
          />
        </div>

        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <ShieldCheck className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `Selected: ${file.name}` : 'Select file to verify integrity'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Computes local cryptographic digest to detect tampering
          </span>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) handleVerify(e.target.files[0]);
            }}
            className="hidden"
          />
        </label>

        {computedHash && (
          <div className="space-y-3 pt-2">
            {isMatch && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/50 flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-emerald-500 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-800 dark:text-emerald-200">
                    Checksums Match Perfectly!
                  </h4>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">
                    The file matches the expected hash byte-for-byte. Zero corruption or tampering detected.
                  </p>
                </div>
              </div>
            )}

            {isMismatch && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-500/50 flex items-center gap-3">
                <XCircle className="w-6 h-6 text-rose-500 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-sm text-rose-800 dark:text-rose-200">
                    Checksum Verification Failed!
                  </h4>
                  <p className="text-xs text-rose-600 dark:text-rose-400">
                    Computed hash does not match expected value. File may be corrupted, truncated, or modified.
                  </p>
                </div>
              </div>
            )}

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Computed {algorithm} Digest
              </span>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 font-mono text-[11px] text-slate-800 dark:text-slate-200 select-all break-all">
                {computedHash}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 197 — MIME TYPE INSPECTOR
// ========================================================
export const MimeTypeInspectorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [file, setFile] = useState<File | null>(null);
  const [mimeData, setMimeData] = useState<{
    browserType: string;
    detectedType: string;
    category: string;
    rfcRef: string;
    isMediaPlayable: boolean;
  } | null>(null);

  const handleInspectMime = async (selectedFile: File) => {
    setFile(selectedFile);
    const magic = await detectFileMagic(selectedFile);
    const mime = magic.signature?.mime || selectedFile.type || 'application/octet-stream';
    const cat = magic.signature?.category || 'Binary';

    let rfc = 'RFC 2046 / RFC 6838';
    if (mime === 'application/pdf') rfc = 'RFC 3778';
    if (mime === 'application/zip') rfc = 'RFC 1951';
    if (mime === 'application/json') rfc = 'RFC 8259';
    if (mime.startsWith('image/')) rfc = 'RFC 2046 Section 4.5';

    setMimeData({
      browserType: selectedFile.type || 'Not reported by browser',
      detectedType: mime,
      category: cat,
      rfcRef: rfc,
      isMediaPlayable: ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'audio/mpeg', 'video/mp4'].includes(mime),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-amber-300 dark:border-amber-700/60 rounded-2xl bg-amber-50/20 dark:bg-amber-950/20 cursor-pointer hover:bg-amber-50/50 transition-all">
          <Tag className="w-10 h-10 text-amber-500 mb-2" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {file ? `Inspecting: ${file.name}` : 'Select file to inspect standard MIME type'}
          </span>
          <span className="text-xs text-slate-400 mt-1">
            Detects IANA media types, RFC specification, and browser support
          </span>
          <input
            type="file"
            onChange={(e) => {
              if (e.target.files?.[0]) handleInspectMime(e.target.files[0]);
            }}
            className="hidden"
          />
        </label>

        {mimeData && file && (
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Standard IANA MIME Type
                </span>
                <div className="text-lg font-mono font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {mimeData.detectedType}
                </div>
              </div>
              <button
                onClick={() => onCopy && onCopy(mimeData.detectedType)}
                className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy MIME</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-slate-400 text-[11px]">Browser Reported MIME:</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {mimeData.browserType}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Media Category:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {mimeData.category}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-slate-400 text-[11px]">RFC Standard:</span>
                <p className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {mimeData.rfcRef}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Native Browser Preview:</span>
                <p
                  className={`font-semibold mt-0.5 ${
                    mimeData.isMediaPlayable ? 'text-emerald-500' : 'text-slate-500'
                  }`}
                >
                  {mimeData.isMediaPlayable ? 'Directly Renderable' : 'Binary Download Required'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
