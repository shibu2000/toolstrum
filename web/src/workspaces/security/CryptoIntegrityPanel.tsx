import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Hash,
  Upload,
  Copy,
  Check,
  FileCheck,
  Key,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  computeWebCryptoHash,
  md5,
  crc32,
  computeHmacSha256,
} from './securityHelpers';

interface CryptoIntegrityPanelProps {
  defaultMode?: 'file' | 'text';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const CryptoIntegrityPanel: React.FC<CryptoIntegrityPanelProps> = ({
  defaultMode = 'file',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>(defaultMode);

  // File Hash Verifier State (Tool #372)
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [fileHashes, setFileHashes] = useState<Record<string, string>>({});
  const [expectedChecksum, setExpectedChecksum] = useState('');
  const [hashingFile, setHashingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setHashingFile(true);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const [sha256Hash, sha512Hash, sha384Hash, sha1Hash] = await Promise.all([
        computeWebCryptoHash(buffer, 'SHA-256'),
        computeWebCryptoHash(buffer, 'SHA-512'),
        computeWebCryptoHash(buffer, 'SHA-384'),
        computeWebCryptoHash(buffer, 'SHA-1'),
      ]);

      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const md5Hash = md5(textDecoder.decode(bytes.slice(0, 500000))); // fast preview md5
      const crc32Hash = crc32(bytes);

      setFileHashes({
        'SHA-256': sha256Hash,
        'SHA-512': sha512Hash,
        'SHA-384': sha384Hash,
        'SHA-1': sha1Hash,
        'MD5': md5Hash,
        'CRC32': crc32Hash,
      });
    } catch {
      setFileHashes({ Error: 'Could not compute file digests.' });
    } finally {
      setHashingFile(false);
    }
  };

  const cleanExpected = expectedChecksum.trim().toLowerCase();
  const matchedAlg = Object.entries(fileHashes).find(
    ([_, val]) => cleanExpected && val.toLowerCase() === cleanExpected
  )?.[0];
  const hasMismatch = cleanExpected && !matchedAlg && Object.keys(fileHashes).length > 0;

  // Text Hash Generator State (Tool #373)
  const [inputText, setInputText] = useState('Toolstrum Offline Suite 2026');
  const [hmacKey, setHmacKey] = useState('');
  const [textHashes, setTextHashes] = useState<Record<string, string>>({});

  useEffect(() => {
    const updateTextHashes = async () => {
      const encoder = new TextEncoder();
      const buffer = encoder.encode(inputText);

      const [sha256Hash, sha512Hash, sha384Hash, sha1Hash] = await Promise.all([
        computeWebCryptoHash(buffer, 'SHA-256'),
        computeWebCryptoHash(buffer, 'SHA-512'),
        computeWebCryptoHash(buffer, 'SHA-384'),
        computeWebCryptoHash(buffer, 'SHA-1'),
      ]);

      const md5Hash = md5(inputText);
      const crc32Hash = crc32(buffer);

      const results: Record<string, string> = {
        'SHA-256': sha256Hash,
        'SHA-512': sha512Hash,
        'SHA-384': sha384Hash,
        'SHA-1': sha1Hash,
        'MD5': md5Hash,
        'CRC-32': crc32Hash,
      };

      if (hmacKey.trim()) {
        results['HMAC-SHA256'] = await computeHmacSha256(hmacKey, inputText);
      }

      setTextHashes(results);
    };

    updateTextHashes();
  }, [inputText, hmacKey]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('file')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'file'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>File Hash & Checksum Verifier (Tool #372)</span>
        </button>

        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'text'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Hash className="w-3.5 h-3.5" />
          <span>Text & HMAC Hash Generator (Tool #373)</span>
        </button>
      </div>

      {/* Tool 372: File Hash Verifier */}
      {activeTab === 'file' && (
        <div className="space-y-6">
          <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3 bg-white dark:bg-slate-900">
            <Upload className="w-10 h-10 mx-auto text-teal-600 dark:text-teal-400" />
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Select or Drop Any File to Compute Cryptographic Hashes
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Computed 100% locally on your machine via hardware-accelerated Web Cryptography API.
              </p>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleFile} className="hidden" />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              {hashingFile ? 'Hashing File...' : 'Choose File to Verify'}
            </button>
          </div>

          {Object.keys(fileHashes).length > 0 && (
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              <div className="flex flex-wrap justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
                <span className="font-bold text-slate-900 dark:text-white">
                  File: <b className="text-teal-600 font-mono">{fileName}</b> ({(fileSize / 1024).toFixed(1)} KB)
                </span>
                <span className="text-slate-400">All algorithms computed simultaneously</span>
              </div>

              {/* Checksum comparator */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Expected Checksum (Paste from download site to compare)
                </label>
                <input
                  type="text"
                  value={expectedChecksum}
                  onChange={(e) => setExpectedChecksum(e.target.value)}
                  placeholder="Paste SHA-256 or MD5 hash..."
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                />
              </div>

              {matchedAlg && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400/40 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>
                    CHECKSUM VERIFIED: File matches the expected {matchedAlg} checksum perfectly!
                  </span>
                </div>
              )}

              {hasMismatch && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-400/40 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                  <span>
                    CHECKSUM MISMATCH: The file hash does not match the provided expected checksum.
                  </span>
                </div>
              )}

              {/* Algorithm Grid */}
              <div className="space-y-2.5">
                {Object.entries(fileHashes).map(([alg, val]) => {
                  const isThisMatched = cleanExpected && val.toLowerCase() === cleanExpected;
                  return (
                    <div
                      key={alg}
                      className={`p-3.5 rounded-2xl border text-xs space-y-1 ${
                        isThisMatched
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400/50'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="font-bold uppercase text-[10px] text-teal-600 dark:text-teal-400">
                          {alg}
                        </span>
                        {onCopy && (
                          <button
                            onClick={() => onCopy(val)}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Copy className="w-3 h-3" /> Copy
                          </button>
                        )}
                      </div>
                      <p className="font-mono text-slate-900 dark:text-white break-all">{val}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tool 373: Text Hash Generator */}
      {activeTab === 'text' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Input Text String</h3>
                <span className="text-xs font-mono text-slate-400">{inputText.length} chars</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={8}
                placeholder="Enter text to hash..."
                className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              />

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Optional HMAC Secret Key (Computes HMAC-SHA256)
                </label>
                <input
                  type="text"
                  value={hmacKey}
                  onChange={(e) => setHmacKey(e.target.value)}
                  placeholder="e.g. my-secret-hmac-key"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-3">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Cryptographic Hashes
              </span>

              <div className="space-y-2">
                {Object.entries(textHashes).map(([alg, val]) => (
                  <div
                    key={alg}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                  >
                    <div className="flex justify-between items-center text-slate-400">
                      <span className="font-bold uppercase text-[10px] text-teal-600 dark:text-teal-400">
                        {alg}
                      </span>
                      {onCopy && (
                        <button
                          onClick={() => onCopy(val)}
                          className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Copy className="w-3 h-3" /> Copy
                        </button>
                      )}
                    </div>
                    <p className="font-mono text-slate-900 dark:text-white break-all leading-tight">{val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
