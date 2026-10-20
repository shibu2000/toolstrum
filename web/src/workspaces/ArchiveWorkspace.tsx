import React, { useState } from 'react';
import JSZip from 'jszip';
import { Archive, FileArchive, Download, FolderOpen, Check, ShieldCheck, FileCheck, Layers } from 'lucide-react';
import { FileDropZone } from '../components/common/FileDropZone';
import { ResultCard } from '../components/common/ResultCard';

interface ArchiveWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

interface ZipEntryInfo {
  name: string;
  size: number;
  date: Date;
  dir: boolean;
}

interface TarEntryInfo {
  name: string;
  size: number;
  isDir: boolean;
  offset: number;
}

// Minimal USTAR parser: 512-byte header blocks, optional gzip wrapper.
const parseTar = (bytes: Uint8Array): TarEntryInfo[] => {
  const entries: TarEntryInfo[] = [];
  const decoder = new TextDecoder('utf-8');
  let offset = 0;

  while (offset + 512 <= bytes.length) {
    const header = bytes.subarray(offset, offset + 512);
    if (header.every((b) => b === 0)) break;

    const name = decoder.decode(header.subarray(0, 100)).replace(/\0.*$/, '');
    if (!name) break;
    const sizeOctal = decoder.decode(header.subarray(124, 136)).replace(/\0.*$/, '').trim();
    const size = sizeOctal ? parseInt(sizeOctal, 8) : 0;
    const typeFlag = String.fromCharCode(header[156]);

    entries.push({ name, size, isDir: typeFlag === '5' || name.endsWith('/'), offset: offset + 512 });

    const dataBlocks = Math.ceil(size / 512);
    offset += 512 + dataBlocks * 512;
  }

  return entries;
};

const decompressGzipIfNeeded = async (buffer: ArrayBuffer): Promise<Uint8Array> => {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    const stream = new Blob([bytes as BlobPart]).stream().pipeThrough(new DecompressionStream('gzip'));
    const decompressed = await new Response(stream).arrayBuffer();
    return new Uint8Array(decompressed);
  }
  return bytes;
};

export const ArchiveWorkspace: React.FC<ArchiveWorkspaceProps> = ({
  toolId,
  accentColor = '#F59E0B',
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [archiveName, setArchiveName] = useState('toolstrum-archive.zip');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputFilename, setOutputFilename] = useState('toolstrum-archive.zip');
  const [extractedEntries, setExtractedEntries] = useState<ZipEntryInfo[]>([]);
  const [activeZipInstance, setActiveZipInstance] = useState<JSZip | null>(null);
  const [checksums, setChecksums] = useState<{ name: string; sha256: string; sha512: string; size: string }[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // TAR extraction state
  const [tarEntries, setTarEntries] = useState<TarEntryInfo[]>([]);
  const [tarBytes, setTarBytes] = useState<Uint8Array | null>(null);

  // GZIP state
  const [gzipMode, setGzipMode] = useState<'compress' | 'decompress'>('compress');
  const [gzipOutputBlob, setGzipOutputBlob] = useState<Blob | null>(null);
  const [gzipOutputName, setGzipOutputName] = useState('');

  // 1. Create ZIP Archive
  const handleCreateZip = async () => {
    if (selectedFiles.length === 0) {
      setErrorMsg('Please select at least one file to create an archive.');
      return;
    }
    setErrorMsg('');
    setIsProcessing(true);

    try {
      const zip = new JSZip();
      for (const file of selectedFiles) {
        zip.file(file.name, file);
      }
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });
      setOutputBlob(zipBlob);
      setOutputFilename(archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`);
    } catch (e: any) {
      setErrorMsg(`Failed to create ZIP: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 2. Extract / Inspect ZIP Archive
  const handleInspectZip = async (file: File) => {
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);
      setActiveZipInstance(loadedZip);

      const entries: ZipEntryInfo[] = [];
      loadedZip.forEach((relativePath, zipEntry) => {
        entries.push({
          name: relativePath,
          size: (zipEntry as any)._data?.uncompressedSize || 0,
          date: zipEntry.date,
          dir: zipEntry.dir,
        });
      });
      setExtractedEntries(entries);
    } catch (e: any) {
      setErrorMsg(`Failed to inspect archive: ${e.message}. Ensure it is a valid .zip file.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download single file from extracted ZIP
  const handleDownloadZipEntry = async (entryName: string) => {
    if (!activeZipInstance) return;
    try {
      const fileEntry = activeZipInstance.file(entryName);
      if (!fileEntry) return;
      const blob = await fileEntry.async('blob');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = entryName.split('/').pop() || 'extracted-file';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErrorMsg(`Failed to extract file: ${e.message}`);
    }
  };

  // 3. Compute Cryptographic Checksums (Tool 184)
  const handleComputeChecksums = async (files: File[]) => {
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const results: { name: string; sha256: string; sha512: string; size: string }[] = [];
      for (const file of files) {
        const buffer = await file.arrayBuffer();

        // SHA-256
        const hashBuffer256 = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray256 = Array.from(new Uint8Array(hashBuffer256));
        const sha256 = hashArray256.map((b) => b.toString(16).padStart(2, '0')).join('');

        // SHA-512
        const hashBuffer512 = await crypto.subtle.digest('SHA-512', buffer);
        const hashArray512 = Array.from(new Uint8Array(hashBuffer512));
        const sha512 = hashArray512.map((b) => b.toString(16).padStart(2, '0')).join('');

        results.push({
          name: file.name,
          sha256,
          sha512,
          size: `${(file.size / 1024).toFixed(1)} KB`,
        });
      }
      setChecksums(results);
    } catch (e: any) {
      setErrorMsg(`Failed to compute checksums: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // 4. Extract TAR / TAR.GZ Archive
  const handleInspectTar = async (file: File) => {
    setErrorMsg('');
    setIsProcessing(true);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = await decompressGzipIfNeeded(buffer);
      const entries = parseTar(bytes);
      if (entries.length === 0) {
        setErrorMsg('No entries found. Ensure this is a valid .tar or .tar.gz file.');
      }
      setTarBytes(bytes);
      setTarEntries(entries);
    } catch (e: any) {
      setErrorMsg(`Failed to read TAR archive: ${e.message || 'Unsupported or corrupt file.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTarEntry = (entry: TarEntryInfo) => {
    if (!tarBytes || entry.isDir) return;
    const data = tarBytes.subarray(entry.offset, entry.offset + entry.size);
    const blob = new Blob([data as BlobPart]);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = entry.name.split('/').pop() || 'extracted-file';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 5. GZIP Compress / Decompress using native CompressionStream API
  const handleGzipProcess = async (file: File) => {
    setErrorMsg('');
    setIsProcessing(true);
    try {
      if (gzipMode === 'compress') {
        const stream = file.stream().pipeThrough(new CompressionStream('gzip'));
        const blob = await new Response(stream).blob();
        setGzipOutputBlob(blob);
        setGzipOutputName(`${file.name}.gz`);
      } else {
        const stream = file.stream().pipeThrough(new DecompressionStream('gzip'));
        const blob = await new Response(stream).blob();
        setGzipOutputBlob(blob);
        setGzipOutputName(file.name.replace(/\.gz$/, '') || 'decompressed.bin');
      }
    } catch (e: any) {
      setErrorMsg(`GZIP ${gzipMode} failed: ${e.message || 'This browser may not support the Compression Streams API.'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Archive & Files Studio
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create ZIP archives, inspect files, and check file security. 100% Offline • 100% Secure.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[11px] font-medium self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
          <span>100% Offline • 100% Secure</span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Tool 193/194: File Checksum Generator & Verifier */}
      {(toolId === 193 || toolId === 194) && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-amber-500" />
              <span>Cryptographic Checksum & Hash Verifier</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Calculate instant SHA-256 and SHA-512 hashes using native Web Crypto. Compare file integrity without uploading files anywhere.
            </p>

            <FileDropZone
              multiple
              label="Select files to compute cryptographic checksums"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                if (files.length > 0) handleComputeChecksums(files);
              }}
              accentColor={accentColor}
            />
          </div>

          {checksums.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Generated Cryptographic Hashes ({checksums.length} files)
              </h4>
              <div className="space-y-3">
                {checksums.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-100">
                      <span>{item.name}</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">{item.size}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">SHA-256:</span>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all select-all mt-0.5">
                        {item.sha256}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">SHA-512:</span>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all select-all mt-0.5">
                        {item.sha512}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 184: Extract TAR / TAR.GZ Archive */}
      {toolId === 184 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-500" />
              <span>Inspect & Extract TAR / TAR.GZ Archive</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Parses real USTAR archive headers (gzip wrapper auto-detected) and lets you extract individual files locally.
            </p>

            <FileDropZone
              accept=".tar,.tar.gz,.tgz,application/x-tar"
              multiple={false}
              label="Select a .tar or .tar.gz file"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                if (files[0]) handleInspectTar(files[0]);
              }}
              accentColor={accentColor}
            />
          </div>

          {tarEntries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Archive Manifest ({tarEntries.length} items)
              </h4>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">File Path</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Size</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {tarEntries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-800 dark:text-slate-200 truncate max-w-xs">{entry.name}</td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">
                          {entry.isDir ? 'Directory' : `${(entry.size / 1024).toFixed(1)} KB`}
                        </td>
                        <td className="p-3">
                          {!entry.isDir && (
                            <button
                              onClick={() => handleDownloadTarEntry(entry)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold text-[11px] cursor-pointer transition-colors"
                            >
                              Extract
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 185: GZIP Compress / Decompress */}
      {toolId === 185 && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileArchive className="w-4 h-4 text-amber-500" />
              <span>GZIP Compressor / Extractor</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Uses the browser's native Compression Streams API &mdash; genuine gzip, not a ZIP renamed to .gz.
            </p>

            <div className="flex gap-2">
              {(['compress', 'decompress'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setGzipMode(m);
                    setGzipOutputBlob(null);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold capitalize ${
                    gzipMode === m ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <FileDropZone
              accept={gzipMode === 'decompress' ? '.gz,application/gzip' : '*'}
              multiple={false}
              label={gzipMode === 'compress' ? 'Select a file to compress' : 'Select a .gz file to decompress'}
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                if (files[0]) handleGzipProcess(files[0]);
              }}
              accentColor={accentColor}
            />
          </div>

          {gzipOutputBlob && (
            <ResultCard
              title={gzipMode === 'compress' ? 'Compressed Successfully' : 'Decompressed Successfully'}
              subtitle="Processed 100% locally via native browser compression"
              blob={gzipOutputBlob}
              downloadFilename={gzipOutputName}
              stats={[
                { label: 'Output Size', value: `${(gzipOutputBlob.size / 1024).toFixed(1)} KB` },
              ]}
              accentColor={accentColor}
            />
          )}
        </div>
      )}

      {/* Tool 182 / 186: Extract / Inspect ZIP Archive */}
      {(toolId === 182 || toolId === 186) && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-amber-500" />
              <span>Inspect & Extract ZIP Archive</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Inspect directory manifests, uncompressed byte sizes, and extract individual files directly in your browser.
            </p>

            <FileDropZone
              accept=".zip,application/zip"
              multiple={false}
              label="Select a .zip file to inspect or extract"
              files={selectedFiles}
              onFilesChange={(files) => {
                setSelectedFiles(files);
                if (files[0]) handleInspectZip(files[0]);
              }}
              accentColor={accentColor}
            />
          </div>

          {extractedEntries.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Archive Manifest ({extractedEntries.length} items)</span>
                <span>Ready to Extract</span>
              </h4>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">File Path</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Uncompressed Size</th>
                      <th className="p-3 font-semibold text-slate-700 dark:text-slate-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {extractedEntries.map((entry, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-3 font-mono text-slate-800 dark:text-slate-200 truncate max-w-xs">
                          {entry.name}
                        </td>
                        <td className="p-3 text-slate-500 dark:text-slate-400">
                          {entry.dir ? 'Directory' : `${(entry.size / 1024).toFixed(1)} KB`}
                        </td>
                        <td className="p-3">
                          {!entry.dir && (
                            <button
                              onClick={() => handleDownloadZipEntry(entry.name)}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold text-[11px] cursor-pointer transition-colors"
                            >
                              Extract
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Default & Tool 181: Create ZIP Archive / Packer */}
      {(toolId === 181 ||
        ![182, 184, 185, 186, 193, 194].includes(toolId)) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileArchive className="w-4 h-4 text-amber-500" />
                <span>Pack Files into ZIP Archive</span>
              </h3>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Target Archive Filename
                </label>
                <input
                  type="text"
                  value={archiveName}
                  onChange={(e) => setArchiveName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <FileDropZone
                multiple
                label="Select files to pack into ZIP archive"
                sublabel="Files will be compressed locally with zero server uploads"
                files={selectedFiles}
                onFilesChange={setSelectedFiles}
                accentColor={accentColor}
              />

              <button
                onClick={handleCreateZip}
                disabled={isProcessing || selectedFiles.length === 0}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Archive className="w-4 h-4" />
                <span>{isProcessing ? 'Compressing Archive...' : `Create ZIP (${selectedFiles.length} files)`}</span>
              </button>
            </div>
          </div>

          <div>
            {outputBlob ? (
              <ResultCard
                title="ZIP Archive Ready!"
                subtitle="Archive created and ready for download"
                blob={outputBlob}
                downloadFilename={outputFilename}
                stats={[
                  { label: 'Files Packed', value: selectedFiles.length },
                  { label: 'Archive Size', value: `${(outputBlob.size / 1024).toFixed(1)} KB` },
                  { label: 'Status', value: 'Complete' },
                ]}
                accentColor={accentColor}
              />
            ) : selectedFiles.length > 0 ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Files Selected ({selectedFiles.length})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {selectedFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">{f.name}</span>
                      <span className="text-slate-400 text-[11px] shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Select your files and click "Create ZIP". 100% Offline • 100% Secure.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
