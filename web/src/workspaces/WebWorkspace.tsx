import React, { useState, useEffect } from 'react';
import {
  Globe,
  Link2,
  Tag,
  Share2,
  ShieldCheck,
  Copy,
  Check,
  Plus,
  Trash2,
  Laptop,
  Code2,
  FileCode,
  Sparkles,
  Monitor,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface WebWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

interface QueryParam {
  id: string;
  key: string;
  value: string;
}

export const WebWorkspace: React.FC<WebWorkspaceProps> = ({
  toolId,
  accentColor = '#14B8A6',
}) => {
  // Tabs:
  // 376-382: URL Parser & Query Parameters
  // 383-388: UTM Campaign Link Builder
  // 389-394: Meta Tags & Open Graph Generator
  // 395-397: HTML / CSS / JS Code Minifier
  // 398-400: Device Viewport & User-Agent Inspector
  const getInitialTab = (): 'url' | 'utm' | 'meta' | 'minifier' | 'device' => {
    if (toolId >= 383 && toolId <= 388) return 'utm';
    if (toolId >= 389 && toolId <= 394) return 'meta';
    if (toolId >= 395 && toolId <= 397) return 'minifier';
    if (toolId >= 398 && toolId <= 400) return 'device';
    return 'url';
  };

  const [activeTab, setActiveTab] = useState<'url' | 'utm' | 'meta' | 'minifier' | 'device'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // TAB 1: URL PARSER (376-382)
  // ==========================================
  const [inputUrl, setInputUrl] = useState('https://toolstrum.vercel.app/studio/developer?theme=dark&ref=producthunt#start');
  const [parsedParts, setParsedParts] = useState({ protocol: '', host: '', pathname: '', hash: '' });
  const [queryParams, setQueryParams] = useState<QueryParam[]>([]);

  useEffect(() => {
    try {
      const u = new URL(inputUrl);
      setParsedParts({
        protocol: u.protocol,
        host: u.host,
        pathname: u.pathname,
        hash: u.hash,
      });

      const params: QueryParam[] = [];
      u.searchParams.forEach((val, key) => {
        params.push({ id: Math.random().toString(), key, value: val });
      });
      setQueryParams(params);
    } catch {
      // typing
    }
  }, [inputUrl]);

  const handleUpdateParam = (id: string, newKey: string, newVal: string) => {
    try {
      const u = new URL(inputUrl);
      const updated = queryParams.map((p) => (p.id === id ? { ...p, key: newKey, value: newVal } : p));
      setQueryParams(updated);

      u.search = '';
      updated.forEach((p) => {
        if (p.key.trim()) u.searchParams.append(p.key.trim(), p.value);
      });
      setInputUrl(u.toString());
    } catch {}
  };

  const handleAddParam = () => {
    const newParam: QueryParam = { id: Math.random().toString(), key: 'new_param', value: 'value' };
    try {
      const u = new URL(inputUrl);
      u.searchParams.append(newParam.key, newParam.value);
      setInputUrl(u.toString());
      setQueryParams((prev) => [...prev, newParam]);
    } catch {}
  };

  const handleDeleteParam = (id: string) => {
    const updated = queryParams.filter((p) => p.id !== id);
    setQueryParams(updated);
    try {
      const u = new URL(inputUrl);
      u.search = '';
      updated.forEach((p) => {
        if (p.key.trim()) u.searchParams.append(p.key.trim(), p.value);
      });
      setInputUrl(u.toString());
    } catch {}
  };

  // ==========================================
  // TAB 2: UTM BUILDER (383-388)
  // ==========================================
  const [utmBase, setUtmBase] = useState('https://toolstrum.vercel.app');
  const [utmSource, setUtmSource] = useState('newsletter');
  const [utmMedium, setUtmMedium] = useState('email');
  const [utmCampaign, setUtmCampaign] = useState('summer_launch');
  const [utmTerm, setUtmTerm] = useState('offline_tools');
  const [utmContent, setUtmContent] = useState('header_cta');

  const getConstructedUtmUrl = () => {
    try {
      const u = new URL(utmBase.startsWith('http') ? utmBase : `https://${utmBase}`);
      if (utmSource) u.searchParams.set('utm_source', utmSource);
      if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
      if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign);
      if (utmTerm) u.searchParams.set('utm_term', utmTerm);
      if (utmContent) u.searchParams.set('utm_content', utmContent);
      return u.toString();
    } catch {
      return utmBase;
    }
  };

  // ==========================================
  // TAB 3: META & OPEN GRAPH (389-394)
  // ==========================================
  const [metaTitle, setMetaTitle] = useState('Toolstrum — Offline Utilities');
  const [metaDesc, setMetaDesc] = useState('500+ private, offline utilities for everyday productivity. 100% Offline • 100% Secure.');
  const [metaSiteUrl, setMetaSiteUrl] = useState('https://toolstrum.vercel.app');
  const [metaImageUrl, setMetaImageUrl] = useState('https://toolstrum.vercel.app/og-image.png');

  const getGeneratedMetaTags = () => {
    return `<title>${metaTitle}</title>
<meta name="description" content="${metaDesc}">
<meta property="og:type" content="website">
<meta property="og:url" content="${metaSiteUrl}">
<meta property="og:title" content="${metaTitle}">
<meta property="og:description" content="${metaDesc}">
<meta property="og:image" content="${metaImageUrl}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${metaTitle}">
<meta name="twitter:description" content="${metaDesc}">
<meta name="twitter:image" content="${metaImageUrl}">`;
  };

  // ==========================================
  // TAB 4: CODE MINIFIER (395-397)
  // ==========================================
  const [minifierInput, setMinifierInput] = useState('');
  const [minifierMode, setMinifierMode] = useState<'css' | 'js' | 'html'>('css');
  const [minifiedResult, setMinifiedResult] = useState<string | null>(null);

  const handleMinifyCode = () => {
    if (!minifierInput.trim()) return;
    let text = minifierInput;
    if (minifierMode === 'css') {
      text = text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .trim();
    } else if (minifierMode === 'js') {
      text = text
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*/g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([=+\-*/%{}();:,])\s*/g, '$1')
        .trim();
    } else if (minifierMode === 'html') {
      text = text
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();
    }
    setMinifiedResult(text);
  };

  // ==========================================
  // TAB 5: DEVICE VIEWPORT & UA (398-400)
  // ==========================================
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1280);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  const [screenPixelR, setScreenPixelR] = useState(typeof window !== 'undefined' ? window.devicePixelRatio : 2);

  useEffect(() => {
    const onResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Common clipboard handler
  const [copied, setCopied] = useState(false);
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Globe className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Web & Internet Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'URL parameters, UTM campaign links, Meta & Open Graph tags, and offline minification.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-teal-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: URL PARSER (376-382) */}
      {/* ======================================================== */}
      {activeTab === 'url' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-teal-500" />
              <span>URL Parser & Query Parameters</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Target URL
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-mono">Protocol</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{parsedParts.protocol || '—'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-mono">Host</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white truncate">{parsedParts.host || '—'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-mono">Path</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white truncate">{parsedParts.pathname || '—'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 font-mono">Hash</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white truncate">{parsedParts.hash || '—'}</div>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Query Parameters ({queryParams.length})
                </span>
                <button
                  onClick={handleAddParam}
                  className="px-2 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Param</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {queryParams.map((p) => (
                  <div key={p.id} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={p.key}
                      onChange={(e) => handleUpdateParam(p.id, e.target.value, p.value)}
                      placeholder="key"
                      className="w-1/3 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={p.value}
                      onChange={(e) => handleUpdateParam(p.id, p.key, e.target.value)}
                      placeholder="value"
                      className="flex-1 p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleDeleteParam(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Reconstructed URL
              </h4>
              <button
                onClick={() => handleCopy(inputUrl)}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-teal-600 dark:text-teal-400 break-all leading-relaxed">
              {inputUrl}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: UTM BUILDER (383-388) */}
      {/* ======================================================== */}
      {activeTab === 'utm' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Tag className="w-4 h-4 text-teal-500" />
              <span>UTM Campaign Link Builder</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Website URL
              </label>
              <input
                type="text"
                value={utmBase}
                onChange={(e) => setUtmBase(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Campaign Source (e.g. google, newsletter)
                </label>
                <input
                  type="text"
                  value={utmSource}
                  onChange={(e) => setUtmSource(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Campaign Medium (e.g. cpc, email, banner)
                </label>
                <input
                  type="text"
                  value={utmMedium}
                  onChange={(e) => setUtmMedium(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Campaign Name (e.g. summer_promo_2026)
              </label>
              <input
                type="text"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Final Trackable URL
              </h4>
              <button
                onClick={() => handleCopy(getConstructedUtmUrl())}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy URL'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-teal-600 dark:text-teal-400 break-all leading-relaxed">
              {getConstructedUtmUrl()}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: META & OPEN GRAPH (389-394) */}
      {/* ======================================================== */}
      {activeTab === 'meta' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-teal-500" />
              <span>Meta Tags & Social Preview</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Page Title ({metaTitle.length}/60 chars)
              </label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Description ({metaDesc.length}/160 chars)
              </label>
              <textarea
                value={metaDesc}
                onChange={(e) => setMetaDesc(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Preview Image URL (OG Image)
              </label>
              <input
                type="text"
                value={metaImageUrl}
                onChange={(e) => setMetaImageUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Generated HTML Tags
              </h4>
              <button
                onClick={() => handleCopy(getGeneratedMetaTags())}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy HTML'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed">
              {getGeneratedMetaTags()}
            </pre>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: CODE MINIFIER (395-397) */}
      {/* ======================================================== */}
      {activeTab === 'minifier' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <FileCode className="w-4 h-4 text-teal-500" />
              <span>HTML, CSS & JS Minifier</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-xs">
              {(['css', 'js', 'html'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMinifierMode(mode)}
                  className={`py-2 rounded-xl border text-center font-bold uppercase cursor-pointer transition-all ${
                    minifierMode === mode
                      ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {mode} Minifier
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                Paste Code to Minify
              </label>
              <textarea
                value={minifierInput}
                onChange={(e) => setMinifierInput(e.target.value)}
                rows={8}
                placeholder="Paste CSS, JavaScript, or HTML code..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleMinifyCode}
              disabled={!minifierInput.trim()}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Minify Code Now</span>
            </button>
          </div>

          <div>
            {minifiedResult ? (
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-teal-500/40 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Minified Output
                  </h4>
                  <button
                    onClick={() => handleCopy(minifiedResult)}
                    className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Code'}</span>
                  </button>
                </div>

                <textarea
                  readOnly
                  value={minifiedResult}
                  rows={9}
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-white"
                />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-teal-500 shrink-0" />
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Paste code and click "Minify Code Now" to compress and remove whitespace offline.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: DEVICE VIEWPORT & SCREEN (398-400) */}
      {/* ======================================================== */}
      {activeTab === 'device' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Monitor className="w-4 h-4 text-teal-500" />
            <span>Screen Resolution & Device Display</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-mono">Current Width</span>
              <div className="font-mono font-bold text-xl text-slate-900 dark:text-white mt-1">
                {viewportWidth}px
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-mono">Current Height</span>
              <div className="font-mono font-bold text-xl text-slate-900 dark:text-white mt-1">
                {viewportHeight}px
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 font-mono">Pixel Ratio (Retina)</span>
              <div className="font-mono font-bold text-xl text-slate-900 dark:text-white mt-1">
                {screenPixelR}x
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
