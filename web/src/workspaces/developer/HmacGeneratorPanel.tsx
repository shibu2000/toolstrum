import React, { useState, useEffect, useMemo } from 'react';
import {
  Lock,
  Copy,
  Check,
  RefreshCw,
  Key,
  Shield,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  FileCode,
  Layers,
  ArrowRightLeft,
  Search
} from 'lucide-react';
import { computeHmac } from './devHelpers';

interface HmacGeneratorPanelProps {
  initialMessage?: string;
  initialSecret?: string;
}

const PRESETS: Record<
  string,
  { label: string; message: string; secret: string; alg: 'SHA-256' | 'SHA-512' | 'SHA-384'; description: string }
> = {
  'GitHub Webhook': {
    label: 'GitHub Webhook (X-Hub-Signature-256)',
    message: JSON.stringify(
      {
        action: 'opened',
        issue: {
          number: 42,
          title: 'Add offline developer tools',
          user: { login: 'octocat' }
        },
        repository: { full_name: 'toolstrum/toolstrum' }
      },
      null,
      2
    ),
    secret: 'gh_webhook_secret_xyz123',
    alg: 'SHA-256',
    description: 'Standard GitHub webhook payload signed with HMAC-SHA256.'
  },
  'Stripe Payment Webhook': {
    label: 'Stripe Webhook (v1 Signature)',
    message: JSON.stringify(
      {
        id: 'evt_1P83829482948',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_3P928392839',
            amount: 5000,
            currency: 'usd',
            status: 'succeeded'
          }
        }
      },
      null,
      2
    ),
    secret: 'whsec_98a7f6e5d4c3b2a10987654321fedcba',
    alg: 'SHA-256',
    description: 'Stripe webhook payload signed using HMAC-SHA256.'
  },
  'AWS Signature v4': {
    label: 'AWS SigV4 Authentication String',
    message: 'AWS4-HMAC-SHA256\n20261115T000000Z\n20261115/us-east-1/s3/aws4_request\n356a192b7913b04c54574d18c28d46e6395428ab',
    secret: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    alg: 'SHA-256',
    description: 'Canonical string-to-sign used in AWS REST API requests.'
  },
  'High-Security SHA-512': {
    label: 'HMAC-SHA512 High Entropy Audit',
    message: 'CRITICAL_FINANCIAL_TRANSACTION_ID_982348_TRANSFER_APPROVED',
    secret: 'k_enterprise_master_auth_key_512bits_secret_offline',
    alg: 'SHA-512',
    description: '512-bit message authentication code for high-security services.'
  }
};

export const HmacGeneratorPanel: React.FC<HmacGeneratorPanelProps> = ({
  initialMessage,
  initialSecret
}) => {
  const [message, setMessage] = useState<string>(
    initialMessage ?? PRESETS['GitHub Webhook'].message
  );
  const [secret, setSecret] = useState<string>(
    initialSecret ?? PRESETS['GitHub Webhook'].secret
  );
  const [alg, setAlg] = useState<'SHA-256' | 'SHA-512' | 'SHA-384'>('SHA-256');
  const [uppercase, setUppercase] = useState<boolean>(false);
  const [expectedSignature, setExpectedSignature] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const [hmacResult, setHmacResult] = useState<{ hex: string; base64: string }>({
    hex: '',
    base64: ''
  });

  useEffect(() => {
    let cancel = false;
    computeHmac(message, secret, alg)
      .then((res) => {
        if (!cancel) setHmacResult(res);
      })
      .catch(() => {
        if (!cancel) setHmacResult({ hex: '', base64: '' });
      });
    return () => {
      cancel = true;
    };
  }, [message, secret, alg]);

  const base64Url = useMemo(() => {
    if (!hmacResult.base64) return '';
    return hmacResult.base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }, [hmacResult.base64]);

  const displayHex = useMemo(() => {
    return uppercase ? hmacResult.hex.toUpperCase() : hmacResult.hex.toLowerCase();
  }, [hmacResult.hex, uppercase]);

  // Verification
  const verificationResult = useMemo(() => {
    const trimmed = expectedSignature.trim();
    if (!trimmed) return null;

    // Check raw hex
    if (trimmed.toLowerCase() === hmacResult.hex.toLowerCase()) {
      return { matched: true, format: 'Hex' };
    }
    // Check base64
    if (trimmed === hmacResult.base64) {
      return { matched: true, format: 'Base64' };
    }
    // Check base64url
    if (trimmed === base64Url) {
      return { matched: true, format: 'Base64URL' };
    }
    // Check GitHub format "sha256=..."
    if (trimmed.toLowerCase() === `sha256=${hmacResult.hex.toLowerCase()}`) {
      return { matched: true, format: 'GitHub sha256=...' };
    }
    return { matched: false };
  }, [expectedSignature, hmacResult, base64Url]);

  const generateRandomSecret = () => {
    const chars = '0123456789abcdef';
    let key = '';
    for (let i = 0; i < 64; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    setSecret(key);
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

  const loadPreset = (presetKey: string) => {
    const p = PRESETS[presetKey];
    if (p) {
      setMessage(p.message);
      setSecret(p.secret);
      setAlg(p.alg);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold border border-purple-200/50 dark:border-purple-800/40">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              HMAC Generator &amp; Signature Verifier
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Keyed-Hash Message Authentication Code (HMAC) generator for GitHub, Stripe, Shopify webhooks and API authentication.
            </p>
          </div>
        </div>

        {/* Algorithm Pills */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          {(['SHA-256', 'SHA-512', 'SHA-384'] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAlg(a)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                alg === a
                  ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              HMAC-{a}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
        </span>
        {Object.keys(PRESETS).map((key) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-slate-600 dark:text-slate-400"
          >
            {PRESETS[key].label}
          </button>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Message & Secret Key */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
                Message / Payload Body:
              </label>
              <button
                onClick={() => setMessage('')}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear
              </button>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              placeholder="Paste raw message or JSON webhook payload..."
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              spellCheck={false}
            />
          </div>

          {/* Secret Key Input */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-purple-600" />
                Secret Key (Signing Key):
              </label>
              <button
                onClick={generateRandomSecret}
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Random 256-bit Key
              </button>
            </div>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter secret key..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Signature Verifier Input */}
          <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-purple-600" />
                Verify Received Signature:
              </span>
              {expectedSignature && (
                <button
                  onClick={() => setExpectedSignature('')}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              )}
            </label>
            <input
              type="text"
              value={expectedSignature}
              onChange={(e) => setExpectedSignature(e.target.value)}
              placeholder="Paste signature from webhook header (e.g. sha256=... or hex)..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
            />

            {verificationResult && (
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                  verificationResult.matched
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {verificationResult.matched ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>
                    {verificationResult.matched
                      ? `AUTHENTICATION VERIFIED (${verificationResult.format})`
                      : 'SIGNATURE MISMATCH: Signature does not match payload with this secret key.'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Computed HMAC Output Formats */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              Computed HMAC-{alg} Signatures
            </span>
            <button
              onClick={() => setUppercase(!uppercase)}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${
                uppercase
                  ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-300 text-purple-600 dark:text-purple-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              {uppercase ? 'UPPER' : 'lower'}
            </button>
          </div>

          <div className="space-y-3">
            {/* Hex Digest */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Hex Digest
                </span>
                <button
                  onClick={() => handleCopy('hex', displayHex)}
                  className="px-2 py-0.5 rounded text-xs font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'hex' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'hex' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                {displayHex || <span className="text-slate-400 italic">Computing...</span>}
              </div>
            </div>

            {/* Base64 Digest */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Base64 Digest
                </span>
                <button
                  onClick={() => handleCopy('base64', hmacResult.base64)}
                  className="px-2 py-0.5 rounded text-xs font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'base64' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'base64' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                {hmacResult.base64 || <span className="text-slate-400 italic">Computing...</span>}
              </div>
            </div>

            {/* GitHub Webhook Header Format */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  GitHub Header (sha256=...)
                </span>
                <button
                  onClick={() => handleCopy('github', `sha256=${displayHex}`)}
                  className="px-2 py-0.5 rounded text-xs font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'github' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'github' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                sha256={displayHex}
              </div>
            </div>

            {/* Base64URL */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Base64URL (URL-Safe)
                </span>
                <button
                  onClick={() => handleCopy('base64url', base64Url)}
                  className="px-2 py-0.5 rounded text-xs font-medium text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors"
                >
                  {copiedKey === 'base64url' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'base64url' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all select-all">
                {base64Url || <span className="text-slate-400 italic">Computing...</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
