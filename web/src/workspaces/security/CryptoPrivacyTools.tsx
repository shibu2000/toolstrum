import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Hash,
  Key,
  Lock,
  Upload,
  Download,
  Copy,
  Check,
  RefreshCw,
  FileCheck,
  Image as ImageIcon,
} from 'lucide-react';
import { generateTotpCode } from './securityHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 372 — FILE HASH VERIFIER
// ========================================================
export const FileHashVerifierTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [fileHash, setFileHash] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState(0);
  const [expectedHash, setExpectedHash] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setFileSize(file.size);
    setLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const hashBuf = await crypto.subtle.digest('SHA-256', buffer);
      const hashHex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      setFileHash(hashHex);
    } catch {
      setFileHash('Error computing hash');
    } finally {
      setLoading(false);
    }
  };

  const isMatching = expectedHash.trim() && fileHash && fileHash.toLowerCase() === expectedHash.trim().toLowerCase();
  const isMismatch = expectedHash.trim() && fileHash && fileHash.toLowerCase() !== expectedHash.trim().toLowerCase();

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3">
        <Upload className="w-10 h-10 mx-auto text-teal-600 dark:text-teal-400" />
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Choose Any File to Hash</h4>
          <p className="text-xs text-slate-500 mt-0.5">SHA-256 computed 100% locally on your machine</p>
        </div>
        <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
        >
          {loading ? 'Hashing...' : 'Select File'}
        </button>
      </div>

      {fileHash && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
            <div className="flex justify-between items-center text-slate-500">
              <span>File: <b className="text-slate-900 dark:text-white">{fileName}</b> ({(fileSize / 1024).toFixed(1)} KB)</span>
              {onCopy && (
                <button
                  onClick={() => onCopy(fileHash)}
                  className="px-2 py-1 rounded bg-white dark:bg-slate-900 font-semibold flex items-center gap-1 shadow-2xs"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              )}
            </div>
            <p className="font-mono text-xs font-bold text-slate-900 dark:text-white break-all">
              {fileHash}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Expected SHA-256 Hash to Compare</label>
            <input
              type="text"
              value={expectedHash}
              onChange={(e) => setExpectedHash(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
              placeholder="Paste checksum string here to verify..."
            />
          </div>

          {isMatching && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>CHECKSUM VERIFIED: File matches the expected hash perfectly.</span>
            </div>
          )}

          {isMismatch && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-400/40 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>CHECKSUM MISMATCH: File does not match the expected hash.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ========================================================
// 373 — TEXT HASH GENERATOR
// ========================================================
export const TextHashGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [text, setText] = useState('Toolstrum Offline Suite');
  const [hashes, setHashes] = useState<{ alg: string; val: string }[]>([]);

  useEffect(() => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const algs = ['SHA-256', 'SHA-512', 'SHA-384', 'SHA-1'];

    Promise.all(
      algs.map(async (alg) => {
        const hashBuf = await crypto.subtle.digest(alg, data);
        const hashHex = Array.from(new Uint8Array(hashBuf))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('');
        return { alg, val: hashHex };
      })
    ).then(setHashes);
  }, [text]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Input Text</h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
          placeholder="Enter text to hash..."
        />
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Cryptographic Hashes
        </span>

        <div className="space-y-2.5">
          {hashes.map((h) => (
            <div key={h.alg} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-bold uppercase text-[10px]">{h.alg}</span>
                {onCopy && (
                  <button
                    onClick={() => onCopy(h.val)}
                    className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
              <p className="font-mono text-slate-900 dark:text-white break-all leading-tight">{h.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 374 — TOTP AUTHENTICATOR
// ========================================================
export const TotpAuthenticatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [secret, setSecret] = useState('JBSWY3DPEHPK3PXP'); // RFC test secret
  const [code, setCode] = useState('------');
  const [secondsLeft, setSecondsLeft] = useState(30);

  useEffect(() => {
    const updateCode = async () => {
      const now = Math.floor(Date.now() / 1000);
      setSecondsLeft(30 - (now % 30));
      try {
        const c = await generateTotpCode(secret);
        setCode(c);
      } catch {
        setCode('------');
      }
    };

    updateCode();
    const interval = setInterval(updateCode, 1000);
    return () => clearInterval(interval);
  }, [secret]);

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1">Base32 Secret Key</label>
        <input
          type="text"
          value={secret}
          onChange={(e) => setSecret(e.target.value.toUpperCase())}
          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-center font-mono font-bold text-xs uppercase"
          placeholder="e.g. JBSWY3DPEHPK3PXP"
        />
      </div>

      <div className="p-6 rounded-3xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 space-y-2">
        <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 tracking-wider">
          Rolling 2FA Code
        </span>
        <div className="text-5xl font-black text-slate-900 dark:text-white font-mono tracking-widest">
          {code.slice(0, 3)} {code.slice(3)}
        </div>
        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
          <span>Expires in</span>
          <b className="text-teal-600 dark:text-teal-400 font-mono">{secondsLeft}s</b>
        </div>
      </div>

      {onCopy && code !== '------' && (
        <button
          onClick={() => onCopy(code)}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? 'Copied 2FA Code' : 'Copy 6-Digit Code'}</span>
        </button>
      )}
    </div>
  );
};

// ========================================================
// 375 — PRIVACY METADATA CLEANER
// ========================================================
export const PrivacyMetadataCleanerTool: React.FC<ToolProps> = () => {
  const [cleanedUrl, setCleanedUrl] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [status, setStatus] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const cleanMetadata = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalName(file.name);
    setStatus('Cleaning EXIF & metadata...');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Exporting as clean image strips EXIF, GPS and camera metadata completely
          const url = canvas.toDataURL('image/jpeg', 0.95);
          setCleanedUrl(url);
          setStatus('All EXIF & Location tags wiped successfully.');
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
      <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-3">
        <ImageIcon className="w-12 h-12 text-teal-600 dark:text-teal-400" />
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Clean Photo Metadata (EXIF)</h4>
          <p className="text-xs text-slate-500 mt-0.5">Strips GPS coordinates, camera serials, and timestamps</p>
        </div>
        <input type="file" accept="image/*" ref={fileRef} onChange={cleanMetadata} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Select Image
        </button>
      </div>

      {status && (
        <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 text-xs font-bold text-teal-700 dark:text-teal-300">
          ✓ {status}
        </div>
      )}

      {cleanedUrl && (
        <div className="space-y-4">
          <img src={cleanedUrl} alt="Cleaned" className="w-48 h-48 mx-auto object-cover rounded-2xl shadow-sm" />
          <a
            href={cleanedUrl}
            download={`cleaned-${originalName}`}
            className="inline-flex px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Cleaned Image
          </a>
        </div>
      )}
    </div>
  );
};
