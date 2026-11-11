import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { analyzePassword, generatePassphrase, redactSecrets } from './securityHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 366 — URL SAFETY CHECKER
// ========================================================
export const UrlSafetyCheckerTool: React.FC<ToolProps> = () => {
  const [urlInput, setUrlInput] = useState('https://secure-login.bank-portal.xyz.cc/account/verify');

  const analyzeUrl = (raw: string) => {
    const flags: { severity: 'danger' | 'warning' | 'info'; text: string }[] = [];
    try {
      const parsed = new URL(raw);
      if (parsed.protocol !== 'https:') {
        flags.push({ severity: 'danger', text: 'Insecure protocol: HTTP transmits data unencrypted.' });
      }
      if (/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(parsed.hostname)) {
        flags.push({ severity: 'danger', text: 'Raw IP address host detected instead of domain name.' });
      }
      const subdomains = parsed.hostname.split('.');
      if (subdomains.length > 4) {
        flags.push({ severity: 'warning', text: 'Excessive subdomains detected (often used to obscure true domain).' });
      }
      if (parsed.username || parsed.password) {
        flags.push({ severity: 'danger', text: 'Embedded credentials (@ character) detected in URL.' });
      }
      const suspiciousTlds = ['.xyz', '.top', '.work', '.click', '.loan', '.cc', '.buzz'];
      if (suspiciousTlds.some((t) => parsed.hostname.endsWith(t))) {
        flags.push({ severity: 'warning', text: `Contains high-risk TLD (${parsed.hostname.slice(parsed.hostname.lastIndexOf('.'))}).` });
      }
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'is.gd'];
      if (shorteners.includes(parsed.hostname)) {
        flags.push({ severity: 'info', text: 'URL Shortener detected: destination is obscured.' });
      }
      return { valid: true, flags, host: parsed.hostname };
    } catch {
      return { valid: false, flags: [{ severity: 'danger' as const, text: 'Malformed or invalid URL string syntax.' }], host: '' };
    }
  };

  const analysis = analyzeUrl(urlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">URL Security Inspector</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Target URL</label>
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
            placeholder="https://example.com"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Safety Signals
        </span>

        {analysis.flags.length === 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/30 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <div>
              <h5 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">No Common Red Flags</h5>
              <p className="text-xs text-slate-600 dark:text-slate-400">Valid HTTPS syntax and standard domain structure.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {analysis.flags.map((f, i) => (
              <div
                key={i}
                className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  f.severity === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400/30 text-rose-700 dark:text-rose-300'
                    : f.severity === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400/30 text-amber-700 dark:text-amber-300'
                    : 'bg-sky-50 dark:bg-sky-950/30 border-sky-400/30 text-sky-700 dark:text-sky-300'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 367 — PASSWORD STRENGTH CHECKER
// ========================================================
export const PasswordStrengthTool: React.FC<ToolProps> = () => {
  const [pwd, setPwd] = useState('Tr00lstrum$2026!');
  const [show, setShow] = useState(false);

  const report = analyzePassword(pwd);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inspect Password</h3>

        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            className="w-full p-3 pr-10 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-mono font-bold"
            placeholder="Type password..."
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        {/* Requirements checklist */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {report.checks.map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                c.pass ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
              }`}>
                {c.pass ? '✓' : '•'}
              </span>
              <span className={c.pass ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-5">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Entropy & Strength Score
        </span>

        <div>
          <div className="flex justify-between items-baseline mb-1">
            <span className={`text-2xl font-black ${report.color}`}>{report.label}</span>
            <span className="text-sm font-bold font-mono text-slate-500">{report.score}/100</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                report.score < 35 ? 'bg-rose-500' : report.score < 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${report.score}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Information Entropy:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{report.entropy} bits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Total Length:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{pwd.length} characters</span>
          </div>
        </div>

        {report.feedback.length > 0 && (
          <div className="space-y-1 text-[11px] text-slate-500">
            {report.feedback.map((f, i) => (
              <p key={i}>• {f}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 368 — RANDOM PASSWORD GENERATOR
// ========================================================
export const RandomPasswordTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [generated, setGenerated] = useState('');

  const generate = () => {
    let chars = '';
    if (useUpper) chars += 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    if (useLower) chars += 'abcdefghijkmnopqrstuvwxyz';
    if (useNumbers) chars += '23456789';
    if (useSymbols) chars += '!@#$%^&*()-_=+[]{}|;:,.<>?';
    if (!chars) chars = 'abcdefghijkmnopqrstuvwxyz23456789';

    let res = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    for (let i = 0; i < length; i++) {
      res += chars[array[i] % chars.length];
    }
    setGenerated(res);
  };

  React.useEffect(() => {
    generate();
  }, [length, useUpper, useLower, useNumbers, useSymbols]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Password Rules</h3>

        <div>
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
            <span>Password Length</span>
            <span className="text-teal-600 font-mono text-sm">{length}</span>
          </div>
          <input
            type="range"
            min="8"
            max="48"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <input type="checkbox" checked={useUpper} onChange={(e) => setUseUpper(e.target.checked)} className="rounded accent-teal-600" />
            Uppercase (A-Z)
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <input type="checkbox" checked={useLower} onChange={(e) => setUseLower(e.target.checked)} className="rounded accent-teal-600" />
            Lowercase (a-z)
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} className="rounded accent-teal-600" />
            Numbers (0-9)
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} className="rounded accent-teal-600" />
            Symbols (!@#$)
          </label>
        </div>

        <button
          onClick={generate}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Regenerate Secure Password
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Generated Secure Password
        </span>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-lg font-black break-all text-slate-900 dark:text-white text-center">
          {generated}
        </div>

        {onCopy && (
          <button
            onClick={() => onCopy(generated)}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Password'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 369 — PASSPHRASE GENERATOR (DICEWARE)
// ========================================================
export const PassphraseGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [numWords, setNumWords] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(true);
  const [passphrase, setPassphrase] = useState('');

  const generate = () => {
    setPassphrase(generatePassphrase(numWords, separator, capitalize, addNumber));
  };

  React.useEffect(() => {
    generate();
  }, [numWords, separator, capitalize, addNumber]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Passphrase Rules</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Number of Words: {numWords}</label>
          <input
            type="range"
            min="3"
            max="7"
            value={numWords}
            onChange={(e) => setNumWords(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Word Separator</label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: '-', label: 'Hyphen (-)' },
              { id: ' ', label: 'Space ( )' },
              { id: '.', label: 'Dot (.)' },
              { id: '_', label: 'Underscore (_)' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSeparator(s.id)}
                className={`py-2 rounded-xl text-xs font-bold ${
                  separator === s.id ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={capitalize} onChange={(e) => setCapitalize(e.target.checked)} className="rounded accent-teal-600" />
            Capitalize Words
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={addNumber} onChange={(e) => setAddNumber(e.target.checked)} className="rounded accent-teal-600" />
            Add Random Number
          </label>
        </div>

        <button
          onClick={generate}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" /> Generate New Passphrase
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Memorable Passphrase
        </span>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xl font-bold break-all text-slate-900 dark:text-white text-center">
          {passphrase}
        </div>

        {onCopy && (
          <button
            onClick={() => onCopy(passphrase)}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Passphrase'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 370 — SECURE NOTES
// ========================================================
export const SecureNotesTool: React.FC<ToolProps> = () => {
  const [note, setNote] = useState(() => localStorage.getItem('toolstrum_sec_note') || '');
  const [saved, setSaved] = useState(false);

  const saveNote = () => {
    localStorage.setItem('toolstrum_sec_note', note);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Private Local Notes</h3>
          <p className="text-xs text-slate-500">Stored exclusively inside your local browser storage</p>
        </div>
        <button
          onClick={saveNote}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          <span>{saved ? 'Saved Privately' : 'Save Note'}</span>
        </button>
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={10}
        className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed text-slate-900 dark:text-white"
        placeholder="Type private notes, keys, or thoughts here..."
      />
    </div>
  );
};

// ========================================================
// 371 — SECRET REDACTOR
// ========================================================
export const SecretRedactorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [rawText, setRawText] = useState(
    `const awsKey = "AKIA1234567890ABCDEF";\nconst token = "ghp_123456789012345678901234567890123456";\nconst adminEmail = "root@toolstrum.app";`
  );

  const report = redactSecrets(rawText);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Source Text / Code</h3>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={10}
          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
          placeholder="Paste code or logs with sensitive tokens..."
        />
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Redacted Output ({report.foundCount} masked)
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(report.redacted)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          )}
        </div>

        <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[220px] leading-relaxed text-slate-900 dark:text-white">
          {report.redacted}
        </pre>

        {report.types.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {report.types.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[10px] font-bold">
                ✓ {t}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
