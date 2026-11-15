import React, { useState, useEffect } from 'react';
import {
  Key,
  ShieldCheck,
  RefreshCw,
  Copy,
  Check,
  Eye,
  EyeOff,
  Sliders,
  Sparkles,
  Lock,
} from 'lucide-react';
import {
  analyzePassword,
  generateSecurePassword,
  generatePassphrase,
  PasswordStrengthReport,
} from './securityHelpers';

interface PasswordSecurityPanelProps {
  defaultMode?: 'strength' | 'generator' | 'passphrase';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const PasswordSecurityPanel: React.FC<PasswordSecurityPanelProps> = ({
  defaultMode = 'strength',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'strength' | 'generator' | 'passphrase'>(defaultMode);

  // Strength Checker State (Tool #367)
  const [inspectedPassword, setInspectedPassword] = useState('Tr00lstrum$2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [strengthReport, setStrengthReport] = useState<PasswordStrengthReport>(() =>
    analyzePassword(inspectedPassword)
  );

  useEffect(() => {
    setStrengthReport(analyzePassword(inspectedPassword));
  }, [inspectedPassword]);

  // Random Password Generator State (Tool #368)
  const [pwLength, setPwLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useLower, setUseLower] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const refreshPassword = () => {
    setGeneratedPassword(
      generateSecurePassword({
        length: pwLength,
        upper: useUpper,
        lower: useLower,
        numbers: useNumbers,
        symbols: useSymbols,
        avoidAmbiguous,
      })
    );
  };

  useEffect(() => {
    refreshPassword();
  }, [pwLength, useUpper, useLower, useNumbers, useSymbols, avoidAmbiguous]);

  // Diceware Passphrase State (Tool #369)
  const [numWords, setNumWords] = useState(4);
  const [separator, setSeparator] = useState('-');
  const [capitalize, setCapitalize] = useState(true);
  const [addNumber, setAddNumber] = useState(true);
  const [generatedPassphrase, setGeneratedPassphrase] = useState('');

  const refreshPassphrase = () => {
    setGeneratedPassphrase(generatePassphrase(numWords, separator, capitalize, addNumber));
  };

  useEffect(() => {
    refreshPassphrase();
  }, [numWords, separator, capitalize, addNumber]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'strength', label: 'Strength & Entropy (Tool #367)', icon: ShieldCheck },
          { id: 'generator', label: 'Random Password (Tool #368)', icon: Key },
          { id: 'passphrase', label: 'Diceware Passphrase (Tool #369)', icon: Sparkles },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 367: Strength Checker */}
      {activeTab === 'strength' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Inspect Password Entropy & Vulnerabilities
              </h3>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inspectedPassword}
                  onChange={(e) => setInspectedPassword(e.target.value)}
                  placeholder="Type any password to test..."
                  className="w-full p-3.5 pr-11 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-bold"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Requirement Checklist */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {strengthReport.checks.map((chk, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        chk.pass
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      {chk.pass ? '✓' : '•'}
                    </span>
                    <span className={chk.pass ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400'}>
                      {chk.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Entropy & Crack Time
              </span>

              <div>
                <div className="flex justify-between items-baseline mb-1.5">
                  <span className={`text-2xl font-black ${strengthReport.color}`}>
                    {strengthReport.label}
                  </span>
                  <span className="text-sm font-bold font-mono text-slate-500">
                    {strengthReport.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      strengthReport.score < 35
                        ? 'bg-rose-500'
                        : strengthReport.score < 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${strengthReport.score}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Information Entropy:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {strengthReport.entropy} bits
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Offline Crack Time:</span>
                  <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                    {strengthReport.crackTimeEstimate}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Length:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {inspectedPassword.length} characters
                  </span>
                </div>
              </div>

              {strengthReport.feedback.length > 0 && (
                <div className="space-y-1 text-[11px] text-slate-500">
                  {strengthReport.feedback.map((f, i) => (
                    <p key={i}>• {f}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 368: Random Password Generator */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cryptographic Random Generator Rules
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Character Length</span>
                  <span className="font-mono text-teal-600 text-sm font-bold">{pwLength} chars</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={pwLength}
                  onChange={(e) => setPwLength(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useUpper}
                    onChange={(e) => setUseUpper(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <span>Uppercase (A-Z)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useLower}
                    onChange={(e) => setUseLower(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <span>Lowercase (a-z)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useNumbers}
                    onChange={(e) => setUseNumbers(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <span>Numbers (0-9)</span>
                </label>

                <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useSymbols}
                    onChange={(e) => setUseSymbols(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <span>Symbols (!@#$%)</span>
                </label>
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={avoidAmbiguous}
                  onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                  className="rounded accent-teal-600"
                />
                <span>Avoid ambiguous characters (1, l, I, 0, O)</span>
              </label>

              <button
                onClick={refreshPassword}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Regenerate Secure Password
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md flex flex-col justify-between space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Generated Secure Password
              </span>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-base font-black break-all text-slate-900 dark:text-white text-center leading-relaxed">
                {generatedPassword}
              </div>

              {onCopy && (
                <button
                  onClick={() => onCopy(generatedPassword)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied to Clipboard' : 'Copy Password'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 369: Diceware Passphrase */}
      {activeTab === 'passphrase' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Memorable Diceware Passphrase Rules
              </h3>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-500">
                  <span>Number of Words</span>
                  <span className="font-mono text-teal-600 font-bold">{numWords} words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={numWords}
                  onChange={(e) => setNumWords(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Word Separator</label>
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
                      className={`py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        separator === s.id
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 text-xs font-medium text-slate-700 dark:text-slate-300 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(e) => setCapitalize(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <span>Capitalize Words</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addNumber}
                    onChange={(e) => setAddNumber(e.target.checked)}
                    className="rounded accent-teal-600"
                  />
                  <span>Add Random Number</span>
                </label>
              </div>

              <button
                onClick={refreshPassphrase}
                className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> Generate New Passphrase
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md flex flex-col justify-between space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Memorable Diceware Passphrase
              </span>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-lg font-black break-all text-slate-900 dark:text-white text-center leading-relaxed">
                {generatedPassphrase}
              </div>

              {onCopy && (
                <button
                  onClick={() => onCopy(generatedPassphrase)}
                  className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied' : 'Copy Passphrase'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
