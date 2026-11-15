import React, { useState, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Key,
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldAlert,
  FileText,
  Trash2,
  Save,
  AlertCircle,
} from 'lucide-react';
import {
  encryptAesGcm,
  decryptAesGcm,
  redactSecrets,
  RedactionResult,
} from './securityHelpers';

interface SecureNotesRedactorPanelProps {
  defaultMode?: 'notes' | 'redactor';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const SecureNotesRedactorPanel: React.FC<SecureNotesRedactorPanelProps> = ({
  defaultMode = 'notes',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'notes' | 'redactor'>(defaultMode);

  // Secure Notes State (Tool #370)
  const [passphrase, setPassphrase] = useState('');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [plaintextNote, setPlaintextNote] = useState('');
  const [encryptedVault, setEncryptedVault] = useState(() => {
    return localStorage.getItem('toolstrum_aes_vault') || '';
  });
  const [isLocked, setIsLocked] = useState(true);
  const [cryptoError, setCryptoError] = useState('');
  const [cryptoSuccess, setCryptoSuccess] = useState('');

  // Encrypt Note
  const handleEncryptNote = async () => {
    if (!passphrase) {
      setCryptoError('Please enter a master passphrase to encrypt.');
      return;
    }
    try {
      setCryptoError('');
      const vaultJson = await encryptAesGcm(plaintextNote, passphrase);
      setEncryptedVault(vaultJson);
      localStorage.setItem('toolstrum_aes_vault', vaultJson);
      setIsLocked(true);
      setPlaintextNote('');
      setCryptoSuccess('Note encrypted with AES-GCM-256 and locked securely.');
      setTimeout(() => setCryptoSuccess(''), 3000);
    } catch {
      setCryptoError('Encryption failed.');
    }
  };

  // Decrypt Note
  const handleDecryptNote = async () => {
    if (!passphrase) {
      setCryptoError('Please enter the master passphrase to unlock.');
      return;
    }
    if (!encryptedVault) {
      setCryptoError('No encrypted vault payload found to decrypt.');
      return;
    }
    try {
      setCryptoError('');
      const decrypted = await decryptAesGcm(encryptedVault, passphrase);
      setPlaintextNote(decrypted);
      setIsLocked(false);
      setCryptoSuccess('Vault unlocked successfully.');
      setTimeout(() => setCryptoSuccess(''), 3000);
    } catch {
      setCryptoError('Incorrect passphrase or corrupted encrypted vault payload.');
    }
  };

  const handleClearVault = () => {
    localStorage.removeItem('toolstrum_aes_vault');
    setEncryptedVault('');
    setPlaintextNote('');
    setIsLocked(true);
  };

  // Secret Redactor State (Tool #371)
  const [redactorInput, setRedactorInput] = useState(
    `# Production config dump\nconst AWS_SECRET = "AKIA1234567890ABCDEF";\nconst OPENAI_KEY = "sk-123456789012345678901234567890123456";\nconst GITHUB_TOKEN = "ghp_123456789012345678901234567890123456";\nconst ADMIN_CONTACT = "security@toolstrum.app";\nconst USER_PHONE = "+1-555-019-2834";`
  );
  const [redactionResult, setRedactionResult] = useState<RedactionResult>(() =>
    redactSecrets(redactorInput)
  );

  useEffect(() => {
    setRedactionResult(redactSecrets(redactorInput));
  }, [redactorInput]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notes'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>AES-GCM Encrypted Notes (Tool #370)</span>
        </button>

        <button
          onClick={() => setActiveTab('redactor')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'redactor'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Secret & PII Redactor (Tool #371)</span>
        </button>
      </div>

      {/* Tool 370: Encrypted Notes */}
      {activeTab === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isLocked ? 'Encrypted Vault (Locked)' : 'Private Notes Editor (Unlocked)'}
                  </h3>
                </div>
                <span className="text-[10px] font-mono font-bold bg-teal-500/10 text-teal-600 dark:text-teal-400 px-2 py-0.5 rounded-full">
                  AES-GCM-256 + PBKDF2
                </span>
              </div>

              {/* Master Passphrase Input */}
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Master Passphrase (PBKDF2 100k Iterations)
                </label>
                <div className="relative">
                  <input
                    type={showPassphrase ? 'text' : 'password'}
                    value={passphrase}
                    onChange={(e) => setPassphrase(e.target.value)}
                    placeholder="Enter encryption passphrase..."
                    className="w-full p-3 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassphrase(!showPassphrase)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassphrase ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Note Content Area */}
              {!isLocked ? (
                <div>
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Plaintext Sensitive Note
                  </label>
                  <textarea
                    value={plaintextNote}
                    onChange={(e) => setPlaintextNote(e.target.value)}
                    rows={8}
                    placeholder="Type sensitive credentials, seed phrases, or private notes here..."
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
                  />
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleEncryptNote}
                      className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Lock className="w-3.5 h-3.5" /> Encrypt & Lock Vault
                    </button>
                    <button
                      onClick={() => setIsLocked(true)}
                      className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Lock Without Saving
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {encryptedVault ? (
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Encrypted Vault Ciphertext (JSON)
                      </label>
                      <pre className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-[11px] text-slate-600 dark:text-slate-400 break-all whitespace-pre-wrap max-h-36 overflow-y-auto">
                        {encryptedVault}
                      </pre>
                    </div>
                  ) : (
                    <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center text-xs text-slate-400">
                      No encrypted note currently stored. Enter a passphrase and unlock or create a note below.
                    </div>
                  )}

                  <div className="flex gap-2">
                    {encryptedVault ? (
                      <button
                        onClick={handleDecryptNote}
                        className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <Unlock className="w-3.5 h-3.5" /> Unlock Vault
                      </button>
                    ) : (
                      <button
                        onClick={() => setIsLocked(false)}
                        className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                      >
                        <FileText className="w-3.5 h-3.5" /> Create New Secure Note
                      </button>
                    )}
                    {encryptedVault && (
                      <button
                        onClick={handleClearVault}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/40 text-xs font-bold cursor-pointer"
                        title="Delete encrypted note"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {cryptoError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-400/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cryptoError}</span>
                </div>
              )}

              {cryptoSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{cryptoSuccess}</span>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Offline Security Guarantees
              </span>

              <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">1. Zero-Knowledge Encryption</span>
                  <p className="text-[11px]">
                    All encryption and decryption runs strictly inside your local browser tab via the Web Cryptography API (`crypto.subtle`).
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">2. PBKDF2 Key Derivation</span>
                  <p className="text-[11px]">
                    Passwords are never used directly as cipher keys. A 256-bit AES key is derived using 100,000 iterations of SHA-256 and a random 128-bit cryptographic salt.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="font-bold text-slate-900 dark:text-white block">3. Authenticated AES-GCM</span>
                  <p className="text-[11px]">
                    Provides both confidentiality and data integrity authentication. Any tampering with the ciphertext causes decryption to fail.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tool 371: Secret Redactor */}
      {activeTab === 'redactor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Source Code, Logs or Unmasked Text
            </h3>
            <textarea
              value={redactorInput}
              onChange={(e) => setRedactorInput(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              placeholder="Paste code or logs with sensitive tokens..."
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Redacted Safe Output ({redactionResult.foundCount} masked)
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(redactionResult.redacted)}
                  className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Redacted</span>
                </button>
              )}
            </div>

            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[260px] leading-relaxed text-slate-900 dark:text-white">
              {redactionResult.redacted}
            </pre>

            {redactionResult.types.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Detected Tokens:</span>
                <div className="flex flex-wrap gap-1.5">
                  {redactionResult.types.map((type) => (
                    <span
                      key={type}
                      className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[11px] font-bold"
                    >
                      ✓ {type}: {redactionResult.breakdown[type]}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
