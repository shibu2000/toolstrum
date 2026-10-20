import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Shield,
  Key,
  Lock,
  Unlock,
  Check,
  Copy,
  Download,
  Wifi,
  User,
  Hash,
  ShieldCheck,
  RefreshCw,
  FileCheck,
  Eye,
  Sliders,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface SecurityWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const SecurityWorkspace: React.FC<SecurityWorkspaceProps> = ({
  toolId,
  accentColor = '#0D9488',
}) => {
  // Tabs:
  // 351-362: QR & Barcode Generator & Scanner
  // 363-367: Passwords, PINs, Passphrases & Secret Tokens
  // 368-371: Text & File AES Encryption
  // 372-375: Hashes & Checksum Verification
  const getInitialTab = (): 'qr' | 'password' | 'encrypt' | 'hash' => {
    if (toolId >= 363 && toolId <= 367) return 'password';
    if (toolId >= 368 && toolId <= 371) return 'encrypt';
    if (toolId >= 372 && toolId <= 375) return 'hash';
    return 'qr';
  };

  const [activeTab, setActiveTab] = useState<'qr' | 'password' | 'encrypt' | 'hash'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // TAB 1: QR & BARCODE GENERATOR (351-362)
  // ==========================================
  const [qrType, setQrType] = useState<'url' | 'wifi' | 'contact' | 'text'>('url');
  const [qrUrl, setQrUrl] = useState('https://toolstrum.vercel.app');
  const [wifiSsid, setWifiSsid] = useState('Home_Network');
  const [wifiPass, setWifiPass] = useState('MySecurePassword');
  const [wifiType, setWifiType] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [contactName, setContactName] = useState('John Doe');
  const [contactPhone, setContactPhone] = useState('+1 555-123-4567');
  const [contactEmail, setContactEmail] = useState('john@example.com');
  const [qrText, setQrText] = useState('Hello world!');

  const [qrColorDark, setQrColorDark] = useState('#0f172a');
  const [qrColorLight, setQrColorLight] = useState('#ffffff');
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute QR Payload
  const getQrPayload = () => {
    if (qrType === 'wifi') {
      return `WIFI:S:${wifiSsid};T:${wifiType};P:${wifiPass};;`;
    }
    if (qrType === 'contact') {
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nEND:VCARD`;
    }
    if (qrType === 'text') {
      return qrText;
    }
    return qrUrl;
  };

  useEffect(() => {
    if (qrCanvasRef.current && activeTab === 'qr') {
      const payload = getQrPayload() || 'https://toolstrum.vercel.app';
      QRCode.toCanvas(
        qrCanvasRef.current,
        payload,
        {
          width: 240,
          margin: 2,
          color: {
            dark: qrColorDark,
            light: qrColorLight,
          },
          errorCorrectionLevel: 'M',
        },
        (err) => {
          if (err) console.error(err);
        }
      );
    }
  }, [activeTab, qrType, qrUrl, wifiSsid, wifiPass, wifiType, contactName, contactPhone, contactEmail, qrText, qrColorDark, qrColorLight]);

  const handleDownloadQr = () => {
    if (!qrCanvasRef.current) return;
    const a = document.createElement('a');
    a.href = qrCanvasRef.current.toDataURL('image/png');
    a.download = `qrcode-${qrType}.png`;
    a.click();
  };

  // ==========================================
  // TAB 2: PASSWORDS, PINS & TOKENS (363-367)
  // ==========================================
  const [pwLength, setPwLength] = useState(16);
  const [pwUpper, setPwUpper] = useState(true);
  const [pwLower, setPwLower] = useState(true);
  const [pwNumbers, setPwNumbers] = useState(true);
  const [pwSymbols, setPwSymbols] = useState(true);
  const [pwType, setPwType] = useState<'password' | 'passphrase' | 'pin' | 'token'>('password');
  const [generatedSecret, setGeneratedSecret] = useState('');

  const generateSecret = () => {
    if (pwType === 'pin') {
      const pinLength = pwLength < 4 ? 4 : pwLength > 8 ? 6 : pwLength;
      let pin = '';
      const vals = new Uint8Array(pinLength);
      window.crypto.getRandomValues(vals);
      for (let i = 0; i < pinLength; i++) {
        pin += vals[i] % 10;
      }
      setGeneratedSecret(pin);
      return;
    }

    if (pwType === 'passphrase') {
      const words = [
        'apple', 'river', 'mountain', 'falcon', 'galaxy', 'quantum', 'forest', 'horizon',
        'canyon', 'breeze', 'echo', 'harbor', 'shadow', 'timber', 'beacon', 'summit',
        'aurora', 'meteor', 'ember', 'glacier', 'shield', 'oasis', 'comet', 'vector'
      ];
      const count = Math.min(Math.max(Math.round(pwLength / 4), 3), 6);
      const chosen: string[] = [];
      const vals = new Uint8Array(count);
      window.crypto.getRandomValues(vals);
      for (let i = 0; i < count; i++) {
        chosen.push(words[vals[i] % words.length]);
      }
      setGeneratedSecret(chosen.join('-'));
      return;
    }

    if (pwType === 'token') {
      const bytes = new Uint8Array(32);
      window.crypto.getRandomValues(bytes);
      const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
      setGeneratedSecret(hex);
      return;
    }

    // Standard Password
    let charset = '';
    if (pwLower) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (pwUpper) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (pwNumbers) charset += '0123456789';
    if (pwSymbols) charset += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if (!charset) charset = 'abcdefghijklmnopqrstuvwxyz0123456789';

    const vals = new Uint32Array(pwLength);
    window.crypto.getRandomValues(vals);
    let pwd = '';
    for (let i = 0; i < pwLength; i++) {
      pwd += charset[vals[i] % charset.length];
    }
    setGeneratedSecret(pwd);
  };

  useEffect(() => {
    generateSecret();
  }, [pwLength, pwUpper, pwLower, pwNumbers, pwSymbols, pwType]);

  // ==========================================
  // TAB 3: AES ENCRYPTION (368-371)
  // ==========================================
  const [aesPasskey, setAesPasskey] = useState('');
  const [aesInputText, setAesInputText] = useState('');
  const [aesCipherResult, setAesCipherResult] = useState<string | null>(null);
  const [aesError, setAesError] = useState('');
  const [aesSuccessMsg, setAesSuccessMsg] = useState('');

  const handleAesEncrypt = async () => {
    if (!aesPasskey.trim() || !aesInputText.trim()) {
      setAesError('Please enter both a secret password and text to encrypt.');
      return;
    }
    setAesError('');
    setAesSuccessMsg('');
    try {
      const enc = new TextEncoder();
      const pwKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(aesPasskey.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        pwKey,
        enc.encode(aesInputText)
      );

      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encrypted), iv.length);
      const b64 = btoa(String.fromCharCode(...combined));
      setAesCipherResult(b64);
      setAesSuccessMsg('Text successfully encrypted with 256-bit security!');
    } catch (e: any) {
      setAesError(`Encryption failed: ${e.message}`);
    }
  };

  const handleAesDecrypt = async () => {
    if (!aesPasskey.trim() || !aesInputText.trim()) {
      setAesError('Please enter both the secret password and ciphertext to decrypt.');
      return;
    }
    setAesError('');
    setAesSuccessMsg('');
    try {
      const dec = new TextDecoder();
      const combined = Uint8Array.from(atob(aesInputText.trim()), (c) => c.charCodeAt(0));
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const enc = new TextEncoder();
      const pwKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(aesPasskey.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        pwKey,
        data
      );
      setAesCipherResult(dec.decode(decrypted));
      setAesSuccessMsg('Ciphertext successfully decrypted!');
    } catch {
      setAesError('Decryption failed: Incorrect password or invalid encrypted data.');
    }
  };

  // ==========================================
  // TAB 4: HASHES & CHECKSUMS (372-375)
  // ==========================================
  const [hashInputText, setHashInputText] = useState('');
  const [sha256Hash, setSha256Hash] = useState<string | null>(null);
  const [sha512Hash, setSha512Hash] = useState<string | null>(null);
  const [sha1Hash, setSha1Hash] = useState<string | null>(null);
  const [verifyExpectedHash, setVerifyExpectedHash] = useState('');
  const [verifyMatchResult, setVerifyMatchResult] = useState<boolean | null>(null);

  const handleGenerateHashes = async () => {
    if (!hashInputText) return;
    const enc = new TextEncoder();
    const data = enc.encode(hashInputText);

    // SHA-256
    const b256 = await window.crypto.subtle.digest('SHA-256', data);
    const h256 = Array.from(new Uint8Array(b256)).map((b) => b.toString(16).padStart(2, '0')).join('');
    setSha256Hash(h256);

    // SHA-512
    const b512 = await window.crypto.subtle.digest('SHA-512', data);
    const h512 = Array.from(new Uint8Array(b512)).map((b) => b.toString(16).padStart(2, '0')).join('');
    setSha512Hash(h512);

    // SHA-1
    const b1 = await window.crypto.subtle.digest('SHA-1', data);
    const h1 = Array.from(new Uint8Array(b1)).map((b) => b.toString(16).padStart(2, '0')).join('');
    setSha1Hash(h1);

    if (verifyExpectedHash.trim()) {
      const exp = verifyExpectedHash.trim().toLowerCase();
      setVerifyMatchResult(exp === h256.toLowerCase() || exp === h512.toLowerCase() || exp === h1.toLowerCase());
    } else {
      setVerifyMatchResult(null);
    }
  };

  // Copy helper
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Shield className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'QR, Barcode & Security Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'QR codes, secure passwords, offline encryption, and cryptographic checksums.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-teal-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: QR CODE & BARCODE GENERATOR (351-362) */}
      {/* ======================================================== */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <QrCode className="w-4 h-4 text-teal-500" />
              <span>QR Code Settings</span>
            </h3>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => setQrType('url')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  qrType === 'url'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Website URL
              </button>
              <button
                onClick={() => setQrType('wifi')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  qrType === 'wifi'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Wi-Fi
              </button>
              <button
                onClick={() => setQrType('contact')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  qrType === 'contact'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Contact
              </button>
              <button
                onClick={() => setQrType('text')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  qrType === 'text'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Text
              </button>
            </div>

            {/* Form Fields based on type */}
            {qrType === 'url' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Website URL
                </label>
                <input
                  type="text"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Wi-Fi Password
                  </label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Security Type
                  </label>
                  <select
                    value={wifiType}
                    onChange={(e) => setWifiType(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="WPA">WPA/WPA2/WPA3 (Standard)</option>
                    <option value="WEP">WEP (Older)</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
              </div>
            )}

            {qrType === 'contact' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {qrType === 'text' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Plain Text Content
                </label>
                <textarea
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                />
              </div>
            )}

            {/* Colors */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrColorDark}
                    onChange={(e) => setQrColorDark(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{qrColorDark}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={qrColorLight}
                    onChange={(e) => setQrColorLight(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300">{qrColorLight}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live QR Preview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center space-y-4 text-center">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Live QR Preview
            </h4>

            <div className="p-4 rounded-2xl bg-white shadow-md border border-slate-100 flex items-center justify-center">
              <canvas ref={qrCanvasRef} />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">
              Scan with any mobile camera. Works completely offline without an internet connection.
            </p>

            <button
              onClick={handleDownloadQr}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download High-Res PNG</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PASSWORDS, PINS & TOKENS (363-367) */}
      {/* ======================================================== */}
      {activeTab === 'password' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-500" />
              <span>Security Token Generator</span>
            </h3>

            {/* Type selector */}
            <div className="grid grid-cols-4 gap-2 text-xs">
              <button
                onClick={() => setPwType('password')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  pwType === 'password'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Password
              </button>
              <button
                onClick={() => setPwType('passphrase')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  pwType === 'passphrase'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                Passphrase
              </button>
              <button
                onClick={() => setPwType('pin')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  pwType === 'pin'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                PIN Code
              </button>
              <button
                onClick={() => setPwType('token')}
                className={`py-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                  pwType === 'token'
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                API Key
              </button>
            </div>

            {pwType === 'password' && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1 font-medium text-slate-700 dark:text-slate-300">
                    <span>Length</span>
                    <span className="font-mono font-bold text-teal-600">{pwLength} characters</span>
                  </div>
                  <input
                    type="range"
                    min="8"
                    max="48"
                    value={pwLength}
                    onChange={(e) => setPwLength(Number(e.target.value))}
                    className="w-full accent-teal-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={pwUpper}
                      onChange={(e) => setPwUpper(e.target.checked)}
                      className="rounded-sm accent-teal-600"
                    />
                    <span>Uppercase (A-Z)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={pwLower}
                      onChange={(e) => setPwLower(e.target.checked)}
                      className="rounded-sm accent-teal-600"
                    />
                    <span>Lowercase (a-z)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={pwNumbers}
                      onChange={(e) => setPwNumbers(e.target.checked)}
                      className="rounded-sm accent-teal-600"
                    />
                    <span>Numbers (0-9)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={pwSymbols}
                      onChange={(e) => setPwSymbols(e.target.checked)}
                      className="rounded-sm accent-teal-600"
                    />
                    <span>Symbols (!@#$)</span>
                  </label>
                </div>
              </div>
            )}

            {pwType === 'pin' && (
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  PIN Length: {pwLength < 4 ? 4 : pwLength > 8 ? 6 : pwLength} Digits
                </label>
                <div className="flex gap-2">
                  {[4, 6, 8].map((l) => (
                    <button
                      key={l}
                      onClick={() => setPwLength(l)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ${
                        pwLength === l
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {l} Digits
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={generateSecret}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Secure Key</span>
            </button>
          </div>

          {/* Right Column: Result Box */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Generated Result
            </h4>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
              <span className="font-mono font-bold text-base text-slate-900 dark:text-white break-all">
                {generatedSecret}
              </span>
              <button
                onClick={() => handleCopy(generatedSecret)}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <div className="font-bold text-emerald-700 dark:text-emerald-300">
                Security Guarantee
              </div>
              <p>
                Generated using cryptographic randomness directly on your device. Never transmitted over the internet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: OFFLINE AES ENCRYPTION (368-371) */}
      {/* ======================================================== */}
      {activeTab === 'encrypt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-teal-500" />
              <span>Offline AES-256 Encryption & Decryption</span>
            </h3>

            {aesError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 text-xs border border-rose-200 dark:border-rose-800">
                {aesError}
              </div>
            )}

            {aesSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs border border-emerald-200 dark:border-emerald-800">
                {aesSuccessMsg}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Master Passphrase / Secret Key
              </label>
              <input
                type="password"
                value={aesPasskey}
                onChange={(e) => setAesPasskey(e.target.value)}
                placeholder="Enter a private secret key..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Message Content (Plaintext to Encrypt OR Ciphertext to Decrypt)
              </label>
              <textarea
                value={aesInputText}
                onChange={(e) => setAesInputText(e.target.value)}
                rows={5}
                placeholder="Enter message text or paste encrypted text..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleAesEncrypt}
                className="py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>Encrypt Message</span>
              </button>
              <button
                onClick={handleAesDecrypt}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Decrypt Message</span>
              </button>
            </div>
          </div>

          {/* Right Column: Encrypt Result */}
          <div>
            {aesCipherResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      <Check className="w-4 h-4" />
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      Output Result
                    </h4>
                  </div>
                  <button
                    onClick={() => handleCopy(aesCipherResult)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  value={aesCipherResult}
                  rows={8}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter your private passphrase and message, then click "Encrypt Message" or "Decrypt Message".
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: HASHES & CHECKSUMS (372-375) */}
      {/* ======================================================== */}
      {activeTab === 'hash' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Hash className="w-4 h-4 text-teal-500" />
              <span>Checksum & Hash Calculator</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Input Text or Payload
              </label>
              <textarea
                value={hashInputText}
                onChange={(e) => setHashInputText(e.target.value)}
                rows={5}
                placeholder="Enter string or data to calculate cryptographic hashes..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Optional: Expected Hash (to verify match)
              </label>
              <input
                type="text"
                value={verifyExpectedHash}
                onChange={(e) => setVerifyExpectedHash(e.target.value)}
                placeholder="Paste expected SHA hash to compare..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleGenerateHashes}
              disabled={!hashInputText.trim()}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>Calculate Hashes & Verify</span>
            </button>
          </div>

          {/* Right Column: Hashes Result */}
          <div>
            {sha256Hash ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-md space-y-4">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  Cryptographic Checksums
                </h4>

                {verifyMatchResult !== null && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                      verifyMatchResult
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-rose-50 border-rose-300 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                    }`}
                  >
                    <span>
                      {verifyMatchResult
                        ? 'Match Confirmed: The hash matches the expected value!'
                        : 'Mismatch: The input does not match the expected hash.'}
                    </span>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-bold">SHA-256</span>
                      <button
                        onClick={() => handleCopy(sha256Hash || '')}
                        className="text-teal-600 hover:underline cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs break-all text-slate-900 dark:text-white">
                      {sha256Hash}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-bold">SHA-512</span>
                      <button
                        onClick={() => handleCopy(sha512Hash || '')}
                        className="text-teal-600 hover:underline cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs break-all text-slate-900 dark:text-white">
                      {sha512Hash}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1">
                      <span className="font-bold">SHA-1</span>
                      <button
                        onClick={() => handleCopy(sha1Hash || '')}
                        className="text-teal-600 hover:underline cursor-pointer"
                      >
                        Copy
                      </button>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono text-xs break-all text-slate-900 dark:text-white">
                      {sha1Hash}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter text and click "Calculate Hashes & Verify" to generate cryptographic hashes offline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
