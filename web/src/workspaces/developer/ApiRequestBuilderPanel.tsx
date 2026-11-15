import React, { useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  Play,
  Plus,
  Trash2,
  Clock,
  Layers,
  Sparkles,
  Info,
  ShieldCheck,
  AlertCircle,
  FileCode,
  Globe,
  ArrowRight,
} from 'lucide-react';

interface HeaderItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  timeMs: number;
  sizeBytes: number;
}

export const ApiRequestBuilderPanel: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD'>('GET');
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts/1');
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body'>('params');
  const [bodyType, setBodyType] = useState<'none' | 'json' | 'text'>('json');
  const [bodyContent, setBodyContent] = useState<string>(
    '{\n  "title": "Toolstrum Post",\n  "body": "Local-first client request",\n  "userId": 1\n}'
  );

  const [headers, setHeaders] = useState<HeaderItem[]>([
    { id: '1', key: 'Accept', value: 'application/json', enabled: true },
    { id: '2', key: 'Content-Type', value: 'application/json', enabled: true },
  ]);

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAddHeader = () => {
    const id = Math.random().toString(36).slice(2, 7);
    setHeaders((prev) => [...prev, { id, key: '', value: '', enabled: true }]);
  };

  const handleUpdateHeader = (id: string, field: 'key' | 'value' | 'enabled', val: any) => {
    setHeaders((prev) =>
      prev.map((h) => (h.id === id ? { ...h, [field]: val } : h))
    );
  };

  const handleDeleteHeader = (id: string) => {
    setHeaders((prev) => prev.filter((h) => h.id !== id));
  };

  // Execute Direct Browser Fetch (100% Client-Side, No proxy server)
  const handleSendRequest = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    const startTime = performance.now();

    try {
      const activeHeaders: Record<string, string> = {};
      for (const h of headers) {
        if (h.enabled && h.key.trim()) {
          activeHeaders[h.key.trim()] = h.value;
        }
      }

      const options: RequestInit = {
        method,
        headers: activeHeaders,
      };

      if (method !== 'GET' && method !== 'HEAD' && bodyType !== 'none') {
        options.body = bodyContent;
      }

      const res = await fetch(url, options);
      const timeMs = Math.round(performance.now() - startTime);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      const text = await res.text();
      let formattedBody = text;
      try {
        const parsedJson = JSON.parse(text);
        formattedBody = JSON.stringify(parsedJson, null, 2);
      } catch {
        // Leave as raw text
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: formattedBody,
        timeMs,
        sizeBytes: new Blob([text]).size,
      });
    } catch (e: any) {
      setError(
        e.message.includes('Failed to fetch')
          ? 'Network or CORS Error: The target server either failed to respond or does not allow cross-origin requests from browsers (Access-Control-Allow-Origin header is missing).'
          : e.message
      );
    } finally {
      setLoading(false);
    }
  };

  // cURL representation of current request
  const curlCommand = useMemo(() => {
    let cmd = `curl -X ${method} "${url}"`;
    for (const h of headers) {
      if (h.enabled && h.key.trim()) {
        cmd += ` \\\n  -H "${h.key.trim()}: ${h.value}"`;
      }
    }
    if (method !== 'GET' && method !== 'HEAD' && bodyType !== 'none' && bodyContent.trim()) {
      cmd += ` \\\n  -d '${bodyContent.replace(/'/g, "'\\''")}'`;
    }
    return cmd;
  }, [method, url, headers, bodyType, bodyContent]);

  return (
    <div className="space-y-6">
      {/* Request Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Client-Side API Request Builder
            </h3>
          </div>
          <button
            onClick={() => copyToClipboard(curlCommand, 'curl')}
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy as cURL</span>
          </button>
        </div>

        {/* Method + URL Input Bar */}
        <div className="flex items-center gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as any)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 focus:outline-hidden"
          >
            {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'] as const).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.example.com/v1/resource"
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />

          <button
            onClick={handleSendRequest}
            disabled={loading || !url.trim()}
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
          >
            {loading ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>{loading ? 'Sending...' : 'Send'}</span>
          </button>
        </div>

        {/* Request Tabs (Headers / Body) */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setActiveTab('headers')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'headers'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              Headers ({headers.filter((h) => h.enabled).length})
            </button>
            {method !== 'GET' && method !== 'HEAD' && (
              <button
                onClick={() => setActiveTab('body')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'body'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Body ({bodyType.toUpperCase()})
              </button>
            )}
          </div>

          {activeTab === 'headers' ? (
            <div className="space-y-2">
              {headers.map((h) => (
                <div key={h.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={h.enabled}
                    onChange={(e) => handleUpdateHeader(h.id, 'enabled', e.target.checked)}
                    className="rounded accent-sky-500"
                  />
                  <input
                    type="text"
                    value={h.key}
                    onChange={(e) => handleUpdateHeader(h.id, 'key', e.target.value)}
                    placeholder="Header Key (e.g. Authorization)"
                    className="w-1/3 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={h.value}
                    onChange={(e) => handleUpdateHeader(h.id, 'value', e.target.value)}
                    placeholder="Header Value"
                    className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleDeleteHeader(h.id)}
                    className="p-1 text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddHeader}
                className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 mt-2"
              >
                <Plus className="w-3 h-3" />
                <span>Add Header</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                {(['none', 'json', 'text'] as const).map((bt) => (
                  <button
                    key={bt}
                    onClick={() => setBodyType(bt)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${
                      bodyType === bt
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
              {bodyType !== 'none' && (
                <textarea
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  rows={6}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Response Panel */}
      {loading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <Clock className="w-8 h-8 text-sky-500 animate-spin mx-auto" />
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Executing HTTP Request...</h4>
          <p className="text-xs text-slate-500">Connecting directly from your browser to destination.</p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Request Failed</span>
          </div>
          <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed font-mono">
            {error}
          </p>
          <div className="p-3 rounded-xl bg-white/60 dark:bg-slate-900/60 text-[11px] text-slate-600 dark:text-slate-400 mt-2">
            <strong>CORS Tip:</strong> Modern browsers restrict cross-origin requests unless the target server returns an <code className="text-sky-600">Access-Control-Allow-Origin</code> header. For private APIs, run them locally or test against CORS-enabled endpoints.
          </div>
        </div>
      ) : response ? (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono ${
                  response.status < 300
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : response.status < 400
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                }`}
              >
                {response.status} {response.statusText}
              </span>
              <span className="text-xs font-mono text-slate-500">
                {response.timeMs} ms
              </span>
              <span className="text-xs font-mono text-slate-500">
                {(response.sizeBytes / 1024).toFixed(1)} KB
              </span>
            </div>

            <button
              onClick={() => copyToClipboard(response.body, 'body')}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
            >
              {copiedKey === 'body' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Response</span>
            </button>
          </div>

          {/* Response Body */}
          <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white whitespace-pre-wrap max-h-[460px] overflow-y-auto">
            {response.body}
          </pre>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center space-y-2">
          <ShieldCheck className="w-6 h-6 text-sky-500 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">100% Client-Side Direct Execution</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Your requests are dispatched directly from your browser engine to the destination API without passing through any intermediate Toolstrum cloud servers.
          </p>
        </div>
      )}
    </div>
  );
};
