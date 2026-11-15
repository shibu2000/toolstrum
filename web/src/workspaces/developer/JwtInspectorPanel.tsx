import React, { useState, useMemo } from 'react';
import {
  Shield,
  Key,
  Copy,
  Check,
  AlertCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  FileCode,
  ShieldCheck,
  Lock,
  Layers,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import { decodeJwt, JwtDecoded } from './devHelpers';

interface JwtInspectorPanelProps {
  initialToken?: string;
}

const PRESET_JWTS: Record<
  string,
  { label: string; token: string; description: string }
> = {
  'OAuth2 Access Token': {
    label: 'OAuth2 Access Token (Active)',
    token: (() => {
      const now = Math.floor(Date.now() / 1000);
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payload = btoa(
        JSON.stringify({
          iss: 'https://auth.toolstrum.dev/',
          sub: 'usr_89af3290b2',
          aud: ['https://api.toolstrum.dev/v1'],
          iat: now - 300,
          nbf: now - 300,
          exp: now + 86400 * 7,
          jti: 'jwt_uniq_9823412',
          scope: 'read:profile write:tools offline_access',
          role: 'developer_pro'
        })
      ).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      return `${header}.${payload}.TJVA95OrM7E20RMHrHDcEfxjoYZgeFONFh7HgQ`;
    })(),
    description: 'Valid RFC 7519 JWT with issuer, audience, active expiry, and OAuth2 scopes.'
  },
  'Expired Session Token': {
    label: 'Expired Session Token',
    token: (() => {
      const now = Math.floor(Date.now() / 1000);
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payload = btoa(
        JSON.stringify({
          iss: 'toolstrum-security',
          sub: 'dev_alex_99',
          name: 'Alex Developer',
          email: 'alex@example.com',
          iat: now - 7200,
          exp: now - 1800 // Expired 30 mins ago
        })
      ).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      return `${header}.${payload}.dKqZfM17Gq6y_H9VqTz-L0Op3mN8rS4vW1xY2aBc`;
    })(),
    description: 'Expired token showing time elapsed since expiration and security warnings.'
  },
  'Admin RBAC Token': {
    label: 'Admin RBAC Token',
    token: (() => {
      const now = Math.floor(Date.now() / 1000);
      const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payload = btoa(
        JSON.stringify({
          iss: 'https://iam.toolstrum.internal',
          sub: 'admin_sys_01',
          iat: now,
          exp: now + 3600,
          roles: ['SuperAdmin', 'DevOpsLead', 'SecurityOfficer'],
          permissions: ['*.*', 'system:restart', 'database:migrate'],
          tenant_id: 'org_enterprise_alpha'
        })
      ).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      return `${header}.${payload}.4z0Q-0d08mN8rS4vW1xY2aBc_TJVA95OrM7E20RMHr`;
    })(),
    description: 'Enterprise token containing nested role arrays and permission scopes.'
  },
  'Unsecured Token (alg: none)': {
    label: 'Unsecured Token (alg: none)',
    token: (() => {
      const now = Math.floor(Date.now() / 1000);
      const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' })).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      const payload = btoa(
        JSON.stringify({
          sub: 'hacker_test',
          admin: true,
          iat: now
        })
      ).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
      return `${header}.${payload}.`;
    })(),
    description: 'Critical vulnerability demonstration token without signature.'
  }
};

export const JwtInspectorPanel: React.FC<JwtInspectorPanelProps> = ({ initialToken }) => {
  const [tokenInput, setTokenInput] = useState<string>(
    initialToken ?? PRESET_JWTS['OAuth2 Access Token'].token
  );
  const [secretKey, setSecretKey] = useState<string>('your-256-bit-secret');
  const [activeTab, setActiveTab] = useState<'claims' | 'payload' | 'header' | 'signature'>('claims');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const decoded: JwtDecoded = useMemo(() => {
    return decodeJwt(tokenInput);
  }, [tokenInput]);

  const tokenParts = useMemo(() => {
    const parts = tokenInput.trim().split('.');
    return {
      headerPart: parts[0] || '',
      payloadPart: parts[1] || '',
      signaturePart: parts[2] || ''
    };
  }, [tokenInput]);

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
    const p = PRESET_JWTS[presetKey];
    if (p) {
      setTokenInput(p.token);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold border border-purple-200/50 dark:border-purple-800/40">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              JWT Debugger &amp; Claims Inspector
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              RFC 7519 JSON Web Token decoder with claims inspector, expiry telemetry, and offline security analysis.
            </p>
          </div>
        </div>

        {/* Telemetry pill */}
        {decoded.isValidStructure && (
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 border ${
                decoded.isExpired
                  ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              {decoded.isExpired ? 'EXPIRED' : 'ACTIVE'}
            </span>
            {decoded.timeLeft && (
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {decoded.timeLeft}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
        </span>
        {Object.keys(PRESET_JWTS).map((key) => (
          <button
            key={key}
            onClick={() => loadPreset(key)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors text-slate-600 dark:text-slate-400"
          >
            {PRESET_JWTS[key].label}
          </button>
        ))}
      </div>

      {/* Security Warnings / Alerts */}
      {decoded.securityWarnings && decoded.securityWarnings.length > 0 && (
        <div className="space-y-2">
          {decoded.securityWarnings.map((warning, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
                warning.startsWith('CRITICAL')
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300'
              }`}
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{warning}</span>
            </div>
          ))}
        </div>
      )}

      {/* Two-Column Layout: Left Encoded / Right Decoded */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Encoded JWT Section */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Encoded JWT Token
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ({tokenInput.length} chars)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy('token', tokenInput)}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1"
              >
                {copiedKey === 'token' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'token' ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                onClick={() => setTokenInput('')}
                className="px-2 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col space-y-3">
            <textarea
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Paste encoded JWT (header.payload.signature)..."
              rows={8}
              className="w-full flex-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 break-all leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-purple-500/20"
              spellCheck={false}
            />

            {/* Segment Breakdown Legend */}
            {decoded.isValidStructure && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Segment Breakdown
                </div>
                <div className="space-y-1 font-mono text-[11px] break-all">
                  <div className="text-rose-600 dark:text-rose-400 flex items-start gap-1">
                    <span className="font-bold shrink-0">[Header]:</span>
                    <span className="truncate">{tokenParts.headerPart}</span>
                  </div>
                  <div className="text-purple-600 dark:text-purple-400 flex items-start gap-1">
                    <span className="font-bold shrink-0">[Payload]:</span>
                    <span className="truncate">{tokenParts.payloadPart}</span>
                  </div>
                  <div className="text-sky-600 dark:text-sky-400 flex items-start gap-1">
                    <span className="font-bold shrink-0">[Signature]:</span>
                    <span className="truncate">{tokenParts.signaturePart || '(empty)'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message if Invalid */}
            {decoded.error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{decoded.error}</span>
              </div>
            )}
          </div>
        </div>

        {/* Decoded Inspector Section */}
        <div className="flex flex-col rounded-2xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
            <div className="flex p-0.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('claims')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'claims'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Claims ({decoded.claims?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('payload')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'payload'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Payload JSON
              </button>
              <button
                onClick={() => setActiveTab('header')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'header'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Header JSON
              </button>
              <button
                onClick={() => setActiveTab('signature')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === 'signature'
                    ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Signature
              </button>
            </div>

            <button
              onClick={() =>
                handleCopy(
                  activeTab,
                  activeTab === 'header'
                    ? JSON.stringify(decoded.header, null, 2)
                    : activeTab === 'payload'
                    ? JSON.stringify(decoded.payload, null, 2)
                    : JSON.stringify(decoded, null, 2)
                )
              }
              className="px-3 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              {copiedKey === activeTab ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === activeTab ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-950/50 overflow-y-auto max-h-[500px]">
            {!decoded.isValidStructure ? (
              <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-xs">
                <p>Provide a valid JWT token on the left to inspect decoded claims.</p>
              </div>
            ) : activeTab === 'claims' ? (
              /* Claims Explorer */
              <div className="space-y-3">
                {decoded.claims && decoded.claims.length > 0 ? (
                  <div className="space-y-2">
                    {decoded.claims.map((claim, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-purple-600 dark:text-purple-400">
                              {claim.name}
                            </span>
                            {claim.standard ? (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 font-semibold">
                                RFC 7519
                              </span>
                            ) : (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium">
                                Custom
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400">
                            {claim.description}
                          </span>
                        </div>

                        <div className="font-mono text-xs text-slate-900 dark:text-slate-100 break-all bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                          {typeof claim.value === 'object'
                            ? JSON.stringify(claim.value)
                            : String(claim.value)}
                        </div>

                        {claim.formattedValue && (
                          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <Clock className="w-3 h-3" />
                            <span>Formatted: {claim.formattedValue}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-slate-400">No claims found in payload.</div>
                )}
              </div>
            ) : activeTab === 'payload' ? (
              /* Payload JSON View */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    Data Payload Claims
                  </span>
                  <span className="font-mono text-[11px]">JSON Object</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto leading-relaxed select-all">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
            ) : activeTab === 'header' ? (
              /* Header JSON View */
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    Algorithm &amp; Token Type
                  </span>
                  <span className="font-mono text-[11px]">JSON Object</span>
                </div>
                <pre className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto leading-relaxed select-all">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>
            ) : (
              /* Signature Verification Section */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      Signature Verification
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                      Alg: {decoded.header?.alg || 'Unknown'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Signature ensures the token was not tampered with. The signature is computed via:
                  </p>

                  <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                    {decoded.header?.alg || 'HMACSHA256'}(
                    <br />
                    &nbsp;&nbsp;base64UrlEncode(header) + &quot;.&quot; +
                    <br />
                    &nbsp;&nbsp;base64UrlEncode(payload),
                    <br />
                    &nbsp;&nbsp;[your-256-bit-secret]
                    <br />)
                  </div>

                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                      Secret Key / Verification String:
                    </label>
                    <input
                      type="text"
                      value={secretKey}
                      onChange={(e) => setSecretKey(e.target.value)}
                      placeholder="Enter HMAC secret..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    />
                  </div>

                  <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all p-3 rounded-lg bg-slate-50 dark:bg-slate-950">
                    <span className="text-slate-400 font-semibold block mb-1">Raw Token Signature:</span>
                    {decoded.signature || '(empty signature)'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
