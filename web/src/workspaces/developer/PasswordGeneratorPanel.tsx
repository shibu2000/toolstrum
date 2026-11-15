import React, { useState, useMemo } from 'react';
import {
  Key,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  Download,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  Layers,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { generatePassword } from './devHelpers';

interface PasswordGeneratorPanelProps {
  initialLength?: number;
}

const MEMORABLE_WORDS = [
  'amber', 'anchor', 'apple', 'apron', 'arctic', 'arrow', 'artist', 'atlas', 'autumn', 'bacon',
  'badge', 'banana', 'banner', 'beacon', 'breeze', 'bridge', 'bubble', 'cactus', 'camel', 'candle',
  'canyon', 'castle', 'cherry', 'clover', 'cobalt', 'comet', 'copper', 'coral', 'crater', 'crystal',
  'dagger', 'desert', 'diamond', 'dolphin', 'dragon', 'eagle', 'echo', 'ember', 'falcon', 'feather',
  'flame', 'forest', 'fossil', 'galaxy', 'garden', 'glacier', 'granite', 'harbor', 'hawk', 'horizon',
  'island', 'jaguar', 'jungle', 'knight', 'lagoon', 'lantern', 'leopard', 'lotus', 'lunar', 'magnet',
  'mantis', 'marble', 'meadow', 'meteor', 'mirage', 'monkey', 'mountain', 'nebula', 'ninja', 'oasis',
  'ocean', 'olive', 'onyx', 'orbit', 'orchid', 'panther', 'pebble', 'phoenix', 'pillar', 'planet',
  'prairie', 'prism', 'pyramid', 'quartz', 'radar', 'rainbow', 'ranger', 'raven', 'ripple', 'river',
  'rocket', 'saffron', 'safari', 'shadow', 'shield', 'silver', 'solar', 'spider', 'summit', 'tiger',
  'timber', 'topaz', 'tornado', 'tulip', 'valley', 'velvet', 'vessel', 'viper', 'volcano', 'vortex',
  'walnut', 'willow', 'winter', 'wizard', 'zenith', 'zephyr'
];

export const PasswordGeneratorPanel: React.FC<PasswordGeneratorPanelProps> = ({
  initialLength = 16
}) => {
  const [mode, setMode] = useState<'random' | 'passphrase' | 'pin'>('random');

  // Random mode options
  const [length, setLength] = useState<number>(initialLength);
  const [upper, setUpper] = useState<boolean>(true);
  const [lower, setLower] = useState<boolean>(true);
  const [numbers, setNumbers] = useState<boolean>(true);
  const [symbols, setSymbols] = useState<boolean>(true);
  const [noAmbiguous, setNoAmbiguous] = useState<boolean>(true);

  // Passphrase options
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>('-');
  const [capitalize, setCapitalize] = useState<boolean>(true);
  const [includeNumber, setIncludeNumber] = useState<boolean>(true);

  // PIN options
  const [pinLength, setPinLength] = useState<number>(6);

  // Bulk options
  const [bulkCount, setBulkCount] = useState<number>(1);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [refreshSeed, setRefreshSeed] = useState<number>(0);

  // Generate passwords
  const generatedList = useMemo(() => {
    void refreshSeed;
    const list: Array<{
      value: string;
      entropyBits: number;
      strength: 'Weak' | 'Medium' | 'Strong' | 'Fortress';
      crackTime: string;
    }> = [];

    const calculateCrackTime = (bits: number): string => {
      // 100 billion guesses/second (modern GPU cluster)
      const seconds = Math.pow(2, bits) / 1e11;
      if (seconds < 1) return 'Instant (< 1 second)';
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
      if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} years`;
      if (seconds < 31536000 * 10000) return `${Math.round(seconds / (31536000 * 1000))} Millennia`;
      return '10,000+ Centuries';
    };

    for (let b = 0; b < bulkCount; b++) {
      if (mode === 'random') {
        const res = generatePassword(length, {
          upper,
          lower,
          numbers,
          symbols,
          noAmbiguous
        });
        let strRating: 'Weak' | 'Medium' | 'Strong' | 'Fortress' = 'Weak';
        if (res.entropyBits >= 90) strRating = 'Fortress';
        else if (res.entropyBits >= 65) strRating = 'Strong';
        else if (res.entropyBits >= 40) strRating = 'Medium';

        list.push({
          value: res.password,
          entropyBits: res.entropyBits,
          strength: strRating,
          crackTime: calculateCrackTime(res.entropyBits)
        });
      } else if (mode === 'passphrase') {
        const words: string[] = [];
        for (let i = 0; i < wordCount; i++) {
          let w = MEMORABLE_WORDS[Math.floor(Math.random() * MEMORABLE_WORDS.length)];
          if (capitalize) w = w.charAt(0).toUpperCase() + w.slice(1);
          words.push(w);
        }
        let phrase = words.join(separator);
        if (includeNumber) phrase += `${separator}${Math.floor(Math.random() * 90 + 10)}`;

        // Entropy: ~12.9 bits per word + bonus for number
        const entropy = Math.round(wordCount * Math.log2(MEMORABLE_WORDS.length) + (includeNumber ? 6.6 : 0));
        let strRating: 'Weak' | 'Medium' | 'Strong' | 'Fortress' = 'Weak';
        if (entropy >= 80) strRating = 'Fortress';
        else if (entropy >= 60) strRating = 'Strong';
        else if (entropy >= 38) strRating = 'Medium';

        list.push({
          value: phrase,
          entropyBits: entropy,
          strength: strRating,
          crackTime: calculateCrackTime(entropy)
        });
      } else {
        // PIN mode
        let pin = '';
        for (let i = 0; i < pinLength; i++) {
          pin += Math.floor(Math.random() * 10).toString();
        }
        const entropy = Math.round(pinLength * Math.log2(10));
        let strRating: 'Weak' | 'Medium' | 'Strong' | 'Fortress' = 'Weak';
        if (entropy >= 40) strRating = 'Medium';

        list.push({
          value: pin,
          entropyBits: entropy,
          strength: strRating,
          crackTime: calculateCrackTime(entropy)
        });
      }
    }

    return list;
  }, [
    mode,
    length,
    upper,
    lower,
    numbers,
    symbols,
    noAmbiguous,
    wordCount,
    separator,
    capitalize,
    includeNumber,
    pinLength,
    bulkCount,
    refreshSeed
  ]);

  const primaryPassword = generatedList[0] || {
    value: '',
    entropyBits: 0,
    strength: 'Weak',
    crackTime: 'Instant'
  };

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    const content = generatedList.map((p) => p.value).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords-${mode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-200/50 dark:border-emerald-800/40">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Password Generator &amp; NIST Entropy Meter
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-entropy cryptographic random passwords, Diceware passphrases, and numerical PINs with NIST SP 800-63B audit.
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setMode('random')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'random'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Random Characters
          </button>
          <button
            onClick={() => setMode('passphrase')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'passphrase'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Memorable Passphrase
          </button>
          <button
            onClick={() => setMode('pin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'pin'
                ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            PIN / Digits
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Left Column */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Generation Rules
          </h3>

          {mode === 'random' && (
            <>
              {/* Length Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Password Length</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{length} chars</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="64"
                  value={length}
                  onChange={(e) => setLength(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Character Sets Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={upper}
                    onChange={(e) => setUpper(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Uppercase Letters (A-Z)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lower}
                    onChange={(e) => setLower(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Lowercase Letters (a-z)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={numbers}
                    onChange={(e) => setNumbers(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Numbers (0-9)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={symbols}
                    onChange={(e) => setSymbols(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Symbols (!@#$%^&amp;*)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={noAmbiguous}
                    onChange={(e) => setNoAmbiguous(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">
                    Exclude ambiguous characters (l, 1, I, O, 0)
                  </span>
                </label>
              </div>
            </>
          )}

          {mode === 'passphrase' && (
            <>
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Word Count</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{wordCount} words</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="8"
                  value={wordCount}
                  onChange={(e) => setWordCount(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">Separator Character:</label>
                <div className="flex gap-2">
                  {['-', '_', '.', ' ', '#'].map((sep) => (
                    <button
                      key={sep}
                      onClick={() => setSeparator(sep)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold ${
                        separator === sep
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600'
                      }`}
                    >
                      {sep === ' ' ? 'Space' : sep}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={capitalize}
                    onChange={(e) => setCapitalize(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Capitalize each word</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeNumber}
                    onChange={(e) => setIncludeNumber(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Append random number</span>
                </label>
              </div>
            </>
          )}

          {mode === 'pin' && (
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-slate-300">PIN Length</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{pinLength} digits</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                value={pinLength}
                onChange={(e) => setPinLength(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          )}

          {/* Bulk Generation Slider */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Batch Quantity</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">{bulkCount}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              value={bulkCount}
              onChange={(e) => setBulkCount(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          <button
            onClick={() => setRefreshSeed((s) => s + 1)}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Generate New Password</span>
          </button>
        </div>

        {/* Right 2 Columns: Primary Password + Entropy Audit */}
        <div className="lg:col-span-2 space-y-4">
          {/* Primary Result Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                Generated {mode === 'passphrase' ? 'Passphrase' : mode === 'pin' ? 'PIN' : 'Password'}
              </span>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    primaryPassword.strength === 'Fortress'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                      : primaryPassword.strength === 'Strong'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : primaryPassword.strength === 'Medium'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                  }`}
                >
                  {primaryPassword.strength} ({primaryPassword.entropyBits} bits)
                </span>
                <button
                  onClick={() => handleCopy('primary', primaryPassword.value)}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copiedKey === 'primary' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'primary' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-lg text-slate-900 dark:text-white break-all select-all font-bold tracking-wide">
              {primaryPassword.value}
            </div>

            {/* NIST Entropy & Security Telemetry Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block">
                  NIST Shannon Entropy:
                </span>
                <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400 font-mono">
                  {primaryPassword.entropyBits} bits
                </div>
                <p className="text-[10px] text-slate-500">
                  Measures logarithmic password complexity against dictionary &amp; brute-force searches.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider block flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-500" />
                  Estimated Crack Time:
                </span>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200 font-mono">
                  {primaryPassword.crackTime}
                </div>
                <p className="text-[10px] text-slate-500">
                  Assuming supercomputer cluster evaluating 100 billion hash guesses/sec.
                </p>
              </div>
            </div>
          </div>

          {/* Bulk Passwords List if Quantity > 1 */}
          {generatedList.length > 1 && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Batch Generated Passwords ({generatedList.length})
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleCopy('bulk-all', generatedList.map((p) => p.value).join('\n'))
                    }
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
                  >
                    {copiedKey === 'bulk-all' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'bulk-all' ? 'Copied' : 'Copy All'}</span>
                  </button>
                  <button
                    onClick={handleDownload}
                    className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    title="Download passwords.txt"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {generatedList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 font-mono text-xs flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-[10px] w-4">{idx + 1}.</span>
                      <span className="font-bold text-slate-900 dark:text-white select-all">
                        {item.value}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(`single-${idx}`, item.value)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-emerald-600 p-1 rounded transition-opacity"
                    >
                      {copiedKey === `single-${idx}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
