import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Key,
  Clock,
  Sparkles,
} from 'lucide-react';
import { generateTotpCode } from './securityHelpers';

interface TotpAccount {
  id: string;
  issuer: string;
  account: string;
  secret: string;
}

interface TotpAuthenticatorPanelProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const TotpAuthenticatorPanel: React.FC<TotpAuthenticatorPanelProps> = ({
  copied = false,
  onCopy,
}) => {
  const [accounts, setAccounts] = useState<TotpAccount[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_totp_accounts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: '1',
        issuer: 'Toolstrum Test Account',
        account: 'demo@toolstrum.app',
        secret: 'JBSWY3DPEHPK3PXP', // RFC 6238 standard test vector
      },
    ];
  });

  const [codes, setCodes] = useState<Record<string, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(30);

  // New account form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIssuer, setNewIssuer] = useState('');
  const [newAccount, setNewAccount] = useState('');
  const [newSecret, setNewSecret] = useState('');
  const [formError, setFormError] = useState('');

  // Persist accounts
  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_totp_accounts', JSON.stringify(accounts));
    } catch {}
  }, [accounts]);

  // Rolling TOTP timer
  useEffect(() => {
    const updateAllCodes = async () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = 30 - (now % 30);
      setSecondsRemaining(remaining);

      const newCodes: Record<string, string> = {};
      await Promise.all(
        accounts.map(async (acc) => {
          try {
            const c = await generateTotpCode(acc.secret, 30);
            newCodes[acc.id] = c;
          } catch {
            newCodes[acc.id] = '------';
          }
        })
      );
      setCodes(newCodes);
    };

    updateAllCodes();
    const interval = setInterval(updateAllCodes, 1000);
    return () => clearInterval(interval);
  }, [accounts]);

  const handleAddAccount = () => {
    if (!newSecret.trim()) {
      setFormError('Secret key is required.');
      return;
    }

    let secret = newSecret.trim();
    let issuer = newIssuer.trim() || 'Service';
    let account = newAccount.trim() || 'user';

    // Parse otpauth:// URI if pasted
    if (secret.startsWith('otpauth://')) {
      try {
        const url = new URL(secret);
        const pathParts = decodeURIComponent(url.pathname.replace(/^\/\/totp\//, '')).split(':');
        if (pathParts.length > 1) {
          issuer = pathParts[0];
          account = pathParts[1];
        } else {
          account = pathParts[0];
        }
        const s = url.searchParams.get('secret');
        if (s) secret = s;
        const iss = url.searchParams.get('issuer');
        if (iss) issuer = iss;
      } catch {}
    }

    const newAcc: TotpAccount = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      issuer,
      account,
      secret: secret.toUpperCase().replace(/[\s-]/g, ''),
    };

    setAccounts([...accounts, newAcc]);
    setNewIssuer('');
    setNewAccount('');
    setNewSecret('');
    setShowAddForm(false);
    setFormError('');
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(accounts.filter((a) => a.id !== id));
  };

  // Progress percentage (30s = 100%, 0s = 0%)
  const progressPercent = (secondsRemaining / 30) * 100;
  const isUrgent = secondsRemaining <= 5;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header with Countdown Ring & Add Button */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Radial Countdown Indicator */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-1000 ${
                  isUrgent ? 'text-rose-500' : 'text-teal-600 dark:text-teal-400'
                }`}
                strokeDasharray={`${progressPercent}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className={`absolute font-mono text-xs font-black ${isUrgent ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
              {secondsRemaining}s
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              RFC 6238 TOTP Authenticator (Tool #374)
            </h3>
            <p className="text-xs text-slate-500">
              Zero-server, 100% offline 2-Factor Authentication code generator
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Cancel' : 'Add 2FA Key'}</span>
        </button>
      </div>

      {/* Add Account Card */}
      {showAddForm && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
          <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Add New 2FA Secret Key
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Issuer / Service</label>
              <input
                type="text"
                value={newIssuer}
                onChange={(e) => setNewIssuer(e.target.value)}
                placeholder="e.g. GitHub, AWS, Google"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Account / Username</label>
              <input
                type="text"
                value={newAccount}
                onChange={(e) => setNewAccount(e.target.value)}
                placeholder="user@example.com"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 block mb-1">
              Base32 Secret Key or `otpauth://` URI
            </label>
            <input
              type="text"
              value={newSecret}
              onChange={(e) => setNewSecret(e.target.value)}
              placeholder="e.g. JBSWY3DPEHPK3PXP"
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold uppercase"
            />
          </div>

          {formError && <p className="text-xs text-rose-500 font-medium">{formError}</p>}

          <div className="flex gap-2 justify-end pt-1">
            <button
              onClick={handleAddAccount}
              className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Save Authenticator Key
            </button>
          </div>
        </div>
      )}

      {/* Account List */}
      <div className="space-y-3">
        {accounts.map((acc) => {
          const code = codes[acc.id] || '------';
          const formattedCode =
            code.length === 6 ? `${code.slice(0, 3)} ${code.slice(3)}` : code;

          return (
            <div
              key={acc.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4"
            >
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  {acc.issuer}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  {acc.account}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-slate-900 dark:text-white">
                  {formattedCode}
                </span>

                <div className="flex items-center gap-1.5">
                  {onCopy && (
                    <button
                      onClick={() => onCopy(code)}
                      className="px-3 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    title="Remove account"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
