import React, { useState, useMemo, useEffect } from 'react';
import {
  FileCode,
  Copy,
  Check,
  Plus,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Link as LinkIcon,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
} from 'lucide-react';
import {
  parseFullUrl,
  buildUrlFromComponents,
  ParsedUrlDetails,
  QueryParamItem,
} from './devHelpers';

const SAMPLE_URL =
  'https://developer:secretPass@api.toolstrum.app:8080/v1/tools/search?category=developer&limit=25&sort=desc&utm_source=newsletter&utm_medium=email&fbclid=IwAR3x#results-anchor';

export const UrlParserPanel: React.FC = () => {
  const [rawInput, setRawInput] = useState<string>(SAMPLE_URL);
  const [parsed, setParsed] = useState<ParsedUrlDetails>(() => parseFullUrl(SAMPLE_URL));
  const [params, setParams] = useState<QueryParamItem[]>(() => parseFullUrl(SAMPLE_URL).queryParams);
  const [hashVal, setHashVal] = useState<string>(() => parseFullUrl(SAMPLE_URL).hash);
  const [pathVal, setPathVal] = useState<string>(() => parseFullUrl(SAMPLE_URL).pathname);
  const [exportLang, setExportLang] = useState<'curl' | 'fetch' | 'python'>('fetch');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // When user edits the top raw URL bar
  const handleRawInputChange = (newUrl: string) => {
    setRawInput(newUrl);
    const p = parseFullUrl(newUrl);
    setParsed(p);
    if (p.valid) {
      setParams(p.queryParams);
      setHashVal(p.hash);
      setPathVal(p.pathname);
    }
  };

  // Reconstruct live URL whenever params, pathname, or hash change
  const liveReconstructedUrl = useMemo(() => {
    if (!parsed.valid) return rawInput;
    return buildUrlFromComponents(parsed.origin, pathVal, params, hashVal);
  }, [parsed.valid, parsed.origin, pathVal, params, hashVal]);

  // Query parameter mutations
  const handleToggleParam = (id: string) => {
    setParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleUpdateParamKey = (id: string, newKey: string) => {
    setParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, key: newKey } : p))
    );
  };

  const handleUpdateParamValue = (id: string, newVal: string) => {
    setParams((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: newVal } : p))
    );
  };

  const handleDeleteParam = (id: string) => {
    setParams((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddParam = () => {
    const id = `param-${Math.random().toString(36).slice(2, 7)}`;
    setParams((prev) => [...prev, { id, key: 'new_param', value: 'value', enabled: true }]);
  };

  // Strip Tracking Parameters
  const handleStripTracking = () => {
    const trackingKeys = new Set([
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'fbclid',
      'gclid',
      'dclid',
      'msclkid',
      'ref',
      'ref_src',
    ]);
    const cleaned = params.filter((p) => !trackingKeys.has(p.key.toLowerCase()) && !p.key.toLowerCase().startsWith('utm_'));
    setParams(cleaned);
  };

  // Generated code snippets
  const generatedCode = useMemo(() => {
    const url = liveReconstructedUrl;
    if (exportLang === 'curl') {
      return `curl -X GET "${url}"`;
    }
    if (exportLang === 'fetch') {
      return `const response = await fetch("${url}", {\n  method: "GET",\n  headers: { "Accept": "application/json" }\n});\nconst data = await response.json();`;
    }
    return `import requests\n\nresponse = requests.get("${url}")\nprint(response.json())`;
  }, [liveReconstructedUrl, exportLang]);

  return (
    <div className="space-y-6">
      {/* Top URL Input Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-500" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Input URL to Inspect & Edit
            </label>
          </div>
          <button
            onClick={() => handleRawInputChange(SAMPLE_URL)}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Load Sample URL</span>
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={rawInput}
            onChange={(e) => handleRawInputChange(e.target.value)}
            placeholder="https://example.com/path?param=value#hash"
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
          {rawInput && (
            <button
              onClick={() => handleRawInputChange('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {parsed.valid ? (
        <div className="space-y-6">
          {/* Reconstructed Live URL Bar with Quick Copy */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-blue-500/10 border border-sky-500/20 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {parsed.isSecure ? (
                <span title="Secure HTTPS / WSS" className="shrink-0">
                  <Lock className="w-4 h-4 text-emerald-500" />
                </span>
              ) : (
                <span title="Insecure HTTP" className="shrink-0">
                  <Unlock className="w-4 h-4 text-amber-500" />
                </span>
              )}
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
                {liveReconstructedUrl}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => copyToClipboard(liveReconstructedUrl, 'live-url')}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                {copiedKey === 'live-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy URL</span>
              </button>
            </div>
          </div>

          {/* RFC 3986 Components Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Protocol</span>
              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400 mt-0.5 block truncate">
                {parsed.protocol}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Hostname</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {parsed.hostname}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Port</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {parsed.port || (parsed.protocol === 'https:' ? '443 (default)' : '80 (default)')}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Auth User</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {parsed.username || 'none'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Path Segments</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {parsed.pathSegments.length} items
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Hash Fragment</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {hashVal || 'none'}
              </span>
            </div>
          </div>

          {/* Interactive Query Parameter Editor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                  Query Parameters ({params.length})
                </span>
                {parsed.trackingParamsFound.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                    {parsed.trackingParamsFound.length} Tracking Params Found
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {parsed.trackingParamsFound.length > 0 && (
                  <button
                    onClick={handleStripTracking}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Strip Tracking Params</span>
                  </button>
                )}
                <button
                  onClick={handleAddParam}
                  className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Parameter</span>
                </button>
              </div>
            </div>

            {params.length > 0 ? (
              <div className="space-y-2">
                {params.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all ${
                      p.enabled
                        ? 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                        : 'bg-slate-100/60 dark:bg-slate-900/40 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={() => handleToggleParam(p.id)}
                      className="rounded accent-sky-500 ml-1"
                      title={p.enabled ? 'Disable parameter' : 'Enable parameter'}
                    />
                    <input
                      type="text"
                      value={p.key}
                      onChange={(e) => handleUpdateParamKey(p.id, e.target.value)}
                      placeholder="Key"
                      className="w-1/3 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                    <span className="text-slate-400 font-bold">=</span>
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => handleUpdateParamValue(p.id, e.target.value)}
                      placeholder="Value"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                    />
                    <button
                      onClick={() => handleDeleteParam(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Delete parameter"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-4 text-xs text-slate-400">
                No query parameters attached to this URL. Click "Add Parameter" to start building.
              </p>
            )}
          </div>

          {/* Export Code Snippets */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                {(['fetch', 'curl', 'python'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setExportLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                      exportLang === lang
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>

              <button
                onClick={() => copyToClipboard(generatedCode, 'code')}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedKey === 'code' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Code</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
          <ShieldAlert className="w-6 h-6 text-rose-500 mx-auto" />
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Invalid URL Format</h4>
          <p className="text-xs text-rose-700 dark:text-rose-400">{parsed.error}</p>
        </div>
      )}
    </div>
  );
};
