import React, { useState, useMemo } from 'react';
import {
  Lock,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Shield,
  Layers,
  Cpu,
  Clock,
  Key,
  Info
} from 'lucide-react';
import { inspectBcrypt } from './devHelpers';

interface BcryptInspectorPanelProps {
  initialHash?: string;
}

const PRESET_HASHES: Record<
  string,
  { label: string; hash: string; description: string }
> = {
  'Standard Cost 10': {
    label: 'Modern Standard ($2b$10)',
    hash: '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    description: '1,024 key-expansion rounds. Default cost factor for Node.js, Ruby, and Python.'
  },
  'Hardened Cost 12': {
    label: 'Hardened Production ($2b$12)',
    hash: '$2b$12$e8uq5e5qE4X11Z8R.mFvKuYfQ3eN5G6h7i8j9k0l1m2n3o4p5q6r7',
    description: '4,096 key-expansion rounds. Recommended standard for modern authentication APIs.'
  },
  'High-Security Cost 14': {
    label: 'High-Security Tier ($2b$14)',
    hash: '$2b$14$R9h/cIPz0gi.URNNXRkh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW',
    description: '16,384 key-expansion rounds. Heavy CPU workload suitable for cold administrative storage.'
  },
  'Legacy PHP 2y': {
    label: 'Legacy PHP Compatibility ($2y$10)',
    hash: '$2y$10$TBp.w6f0bK1eI0s2j4K9mupL7C2R3U5H1W6Q9B3Y5Z1O8X2D4F6H8',
    description: 'PHP specific prefix fixing a signed char comparison bug in old crypt() libraries.'
  }
};

export const BcryptInspectorPanel: React.FC<BcryptInspectorPanelProps> = ({ initialHash }) => {
  const [hashInput, setHashInput] = useState<string>(
    initialHash ?? PRESET_HASHES['Hardened Cost 12'].hash
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const inspected = useMemo(() => {
    return inspectBcrypt(hashInput);
  }, [hashInput]);

  // Security evaluation based on cost factor
  const securityProfile = useMemo(() => {
    if (!inspected.valid || inspected.cost === undefined) return null;
    const cost = inspected.cost;
    const iterations = inspected.iterations || Math.pow(2, cost);

    let status: 'weak' | 'optimal' | 'hardened' | 'extreme';
    let label: string;
    let timingEstimate: string;
    let advice: string;

    if (cost < 10) {
      status = 'weak';
      label = 'Weak / Deprecated Work Factor';
      timingEstimate = '< 15 ms on modern CPU';
      advice = 'Under 1,024 rounds is considered vulnerable to high-speed dictionary cracking on modern GPUs.';
    } else if (cost <= 11) {
      status = 'optimal';
      label = 'Standard Interactive Authentication';
      timingEstimate = '~50 - 120 ms on modern CPU';
      advice = 'Good balance between security and interactive web login latency without straining server CPU.';
    } else if (cost <= 13) {
      status = 'hardened';
      label = 'Hardened Production Tier';
      timingEstimate = '~250 - 500 ms on modern CPU';
      advice = 'Recommended best practice for robust brute-force defense on modern authentication backends.';
    } else {
      status = 'extreme';
      label = 'Ultra-High Cost / High Latency';
      timingEstimate = '> 1,000 ms on modern CPU';
      advice = 'Caution: Iterations exceed 16,384 rounds. Risk of CPU starvation and Denial-of-Service under concurrent traffic.';
    }

    return { cost, iterations, status, label, timingEstimate, advice };
  }, [inspected]);

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

  const loadPreset = (presetKey: string) => {
    const p = PRESET_HASHES[presetKey];
    if (p) {
      setHashInput(p.hash);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200/50 dark:border-sky-800/40">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Bcrypt Hash Analyzer &amp; Cost Auditor
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Dissects Bcrypt algorithm versions ($2a$, $2b$, $2y$), salt bitfields, key-expansion work factors, and timing latency.
            </p>
          </div>
        </div>

        {inspected.valid && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Rounds: 2^{inspected.cost} ({inspected.iterations?.toLocaleString()} iter)
            </span>
          </div>
        )}
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
        </span>
        {Object.keys(PRESET_HASHES).map((key) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-slate-600 dark:text-slate-400"
          >
            {PRESET_HASHES[key].label}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Hash Input & Structure Spec */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Bcrypt Hash String to Inspect
            </label>
            <button
              onClick={() => handleCopy('input', hashInput)}
              className="text-xs text-slate-400 hover:text-sky-600 flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
          </div>

          <textarea
            value={hashInput}
            onChange={(e) => setHashInput(e.target.value)}
            rows={4}
            placeholder="Paste Bcrypt hash (e.g. $2b$12$...)"
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
            spellCheck={false}
          />

          {/* Color-Coded Breakdown */}
          {inspected.valid && (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider block">
                Color-Coded Segment Breakdown:
              </span>
              <div className="font-mono text-xs break-all leading-relaxed p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <span className="text-rose-600 dark:text-rose-400 font-bold" title="Version Identifier">
                  {inspected.version}
                </span>
                <span className="text-sky-600 dark:text-sky-400 font-bold" title="Cost Factor">
                  {inspected.cost ? inspected.cost.toString().padStart(2, '0') : ''}$
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold" title="128-bit Salt (22 chars)">
                  {inspected.salt}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold" title="184-bit Ciphertext Hash (31 chars)">
                  {inspected.checksum}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                  Algorithm Version
                </div>
                <div className="text-sky-600 dark:text-sky-400 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
                  Cost Factor (Rounds)
                </div>
                <div className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                  Embedded 128-bit Salt
                </div>
                <div className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  184-bit Ciphertext
                </div>
              </div>
            </div>
          )}

          {/* Error Message if Invalid */}
          {inspected.error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{inspected.error}</span>
            </div>
          )}
        </div>

        {/* Right Column: Detailed Specifications & Latency Profile */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
          <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-3">
            Bcrypt Security &amp; Key-Expansion Audit
          </span>

          {inspected.valid && securityProfile ? (
            <div className="space-y-4">
              {/* Security Tier Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  securityProfile.status === 'hardened' || securityProfile.status === 'optimal'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : securityProfile.status === 'weak'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0" />
                  <span>{securityProfile.label}</span>
                </div>
                <span className="font-mono text-[11px] font-normal">
                  Est. Delay: {securityProfile.timingEstimate}
                </span>
              </div>

              {/* Advice */}
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {securityProfile.advice}
              </p>

              {/* Grid of parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Bcrypt Version:</span>
                  <div className="font-bold text-slate-900 dark:text-white font-mono text-sm">
                    {inspected.version}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {inspected.version === '$2b$'
                      ? 'Modern standard (OpenBSD 2014 fix)'
                      : inspected.version === '$2y$'
                      ? 'PHP crypt() compatible'
                      : 'Original Provos & Mazières 1999'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-slate-400 font-medium">Work Factor Cost:</span>
                  <div className="font-bold text-sky-600 dark:text-sky-400 font-mono text-sm">
                    Cost {inspected.cost}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    2^{inspected.cost} ({inspected.iterations?.toLocaleString()} key-expansion loops)
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Embedded Salt (22 chars):</span>
                    <button
                      onClick={() => handleCopy('salt', inspected.salt || '')}
                      className="text-[10px] text-sky-600 hover:underline"
                    >
                      Copy Salt
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all pt-0.5">
                    {inspected.salt}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Ciphertext Checksum (31 chars):</span>
                    <button
                      onClick={() => handleCopy('checksum', inspected.checksum || '')}
                      className="text-[10px] text-sky-600 hover:underline"
                    >
                      Copy Checksum
                    </button>
                  </div>
                  <div className="font-mono text-xs text-slate-800 dark:text-slate-200 break-all select-all pt-0.5">
                    {inspected.checksum}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
              <p>Enter a valid Bcrypt hash on the left to view structure details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
