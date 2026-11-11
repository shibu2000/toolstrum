import React, { useState } from 'react';
import {
  FileText,
  Share2,
  Code,
  Globe,
  Download,
  Copy,
  Check,
  Eye,
  Smartphone,
  Monitor,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { htmlToMarkdown, computeWebpageWordMetrics, generateSitemapXml } from './webHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 379 — WEBSITE METADATA VIEWER
// ========================================================
export const WebsiteMetadataViewerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [markup, setMarkup] = useState(
    `<head>\n  <title>Toolstrum | 100% Offline Utilities</title>\n  <meta name="description" content="All-in-one suite of 450+ tools running entirely in your browser without cloud uploads.">\n  <meta property="og:title" content="Toolstrum - Free Browser Tools">\n  <meta name="robots" content="index, follow">\n</head>`
  );

  const extractMeta = () => {
    const titleMatch = markup.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const descMatch = markup.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const ogTitleMatch = markup.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']/i);
    const robotsMatch = markup.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']*)["']/i);

    return {
      title: titleMatch ? titleMatch[1] : '(No title tag found)',
      description: descMatch ? descMatch[1] : '(No description tag found)',
      ogTitle: ogTitleMatch ? ogTitleMatch[1] : '(Not set)',
      robots: robotsMatch ? robotsMatch[1] : 'index, follow (default)',
    };
  };

  const meta = extractMeta();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">HTML &lt;head&gt; Markup</h3>
        <textarea
          value={markup}
          onChange={(e) => setMarkup(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Parsed Meta Tags
        </span>

        <div className="space-y-3 text-xs">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Page Title</span>
            <span className="font-bold text-slate-900 dark:text-white text-sm">{meta.title}</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Meta Description</span>
            <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{meta.description}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Open Graph Title</span>
              <span className="font-bold text-slate-900 dark:text-white">{meta.ogTitle}</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Robots Rule</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{meta.robots}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 380 — HTML PREVIEWER
// ========================================================
export const HtmlPreviewerTool: React.FC<ToolProps> = () => {
  const [code, setCode] = useState(
    `<div style="font-family: sans-serif; text-align: center; padding: 40px; background: #0f172a; color: #f8fafc; border-radius: 20px;">\n  <h1 style="color: #14b8a6; margin-bottom: 8px;">Hello from Toolstrum!</h1>\n  <p style="color: #94a3b8; font-size: 14px;">100% Offline client-side HTML, CSS, and JS preview.</p>\n  <button style="background: #14b8a6; color: white; border: none; padding: 10px 20px; border-radius: 12px; font-weight: bold; cursor: pointer; margin-top: 12px;">Click Me</button>\n</div>`
  );
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live HTML Code Editor & Preview</h3>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setViewMode('desktop')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 ${viewMode === 'desktop' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1.5 ${viewMode === 'mobile' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
          >
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={14}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
          />
        </div>

        <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-hidden">
          <iframe
            title="Live Preview"
            srcDoc={code}
            sandbox="allow-scripts"
            className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${
              viewMode === 'desktop' ? 'w-full h-80' : 'w-[320px] h-[480px]'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 381 — OPEN GRAPH PREVIEW
// ========================================================
export const OpenGraphPreviewTool: React.FC<ToolProps> = () => {
  const [ogTitle, setOgTitle] = useState('Toolstrum — The Offline Utility Powerhouse');
  const [ogDesc, setOgDesc] = useState('Run over 450 client-side developer, media, and productivity tools completely offline without cloud uploads.');
  const [ogImage, setOgImage] = useState('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200');
  const [ogSite, setOgSite] = useState('toolstrum.vercel.app');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Social Graph Attributes</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">og:title</label>
          <input
            type="text"
            value={ogTitle}
            onChange={(e) => setOgTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">og:description</label>
          <textarea
            value={ogDesc}
            onChange={(e) => setOgDesc(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs leading-relaxed"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">og:image (1200x630)</label>
          <input
            type="text"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Social Share Card Preview
        </span>

        {/* Discord / Facebook Card Preview */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-950 shadow-sm max-w-sm mx-auto">
          <img src={ogImage} alt="OG Preview" className="w-full h-44 object-cover" />
          <div className="p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">{ogSite}</span>
            <h5 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{ogTitle}</h5>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{ogDesc}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 382 — ROBOTS.TXT VIEWER & BUILDER
// ========================================================
export const RobotsTxtViewerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [robots, setRobots] = useState(
    `User-agent: *\nDisallow: /admin/\nDisallow: /api/\nAllow: /\n\nSitemap: https://toolstrum.vercel.app/sitemap.xml`
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Robots.txt Rules</h3>
        <textarea
          value={robots}
          onChange={(e) => setRobots(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Export Rules
        </span>

        <p className="text-xs text-slate-500 leading-relaxed">
          Standard robots.txt directives allow search engines (Googlebot, Bingbot) to index your public content while blocking sensitive backend routes.
        </p>

        {onCopy && (
          <button
            onClick={() => onCopy(robots)}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy robots.txt'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 383 — SITEMAP VIEWER
// ========================================================
export const SitemapViewerTool: React.FC<ToolProps> = () => {
  const [xml, setXml] = useState(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://toolstrum.vercel.app</loc>\n    <lastmod>2026-11-11</lastmod>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://toolstrum.vercel.app/studio/developer</loc>\n    <lastmod>2026-11-11</lastmod>\n    <priority>0.9</priority>\n  </url>\n</urlset>`
  );

  const extractUrls = () => {
    const urls: { loc: string; lastmod: string; priority: string }[] = [];
    const blocks = xml.match(/<url>[\s\S]*?<\/url>/gi) || [];
    blocks.forEach((b) => {
      const loc = b.match(/<loc>([^<]*)<\/loc>/i)?.[1] || '';
      const lastmod = b.match(/<lastmod>([^<]*)<\/lastmod>/i)?.[1] || '';
      const priority = b.match(/<priority>([^<]*)<\/priority>/i)?.[1] || '';
      if (loc) urls.push({ loc, lastmod, priority });
    });
    return urls;
  };

  const parsed = extractUrls();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">XML Sitemap Source</h3>
        <textarea
          value={xml}
          onChange={(e) => setXml(e.target.value)}
          rows={12}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Parsed URLs ({parsed.length})
        </span>

        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {parsed.map((item, i) => (
            <div key={i} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
              <span className="font-mono font-bold text-slate-900 dark:text-white break-all block">{item.loc}</span>
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Updated: {item.lastmod || 'N/A'}</span>
                <span>Priority: {item.priority || 'N/A'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 393 — META TAG GENERATOR
// ========================================================
export const MetaTagGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [title, setTitle] = useState('Toolstrum | Privacy First Browser Utilities');
  const [desc, setDesc] = useState('450+ tools running directly in your browser. No sign-up, no upload.');
  const [canonical, setCanonical] = useState('https://toolstrum.vercel.app');

  const generatedTags = `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${desc}">
<link rel="canonical" href="${canonical}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${canonical}">
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${desc}">`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">SEO Details</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Page Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Meta Description</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Canonical URL</label>
          <input
            type="text"
            value={canonical}
            onChange={(e) => setCanonical(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Generated &lt;head&gt; Code
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(generatedTags)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Tags</span>
            </button>
          )}
        </div>

        <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed">
          {generatedTags}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 394 — SITEMAP GENERATOR
// ========================================================
export const SitemapGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [urlsText, setUrlsText] = useState(
    "https://toolstrum.vercel.app\nhttps://toolstrum.vercel.app/studio/developer\nhttps://toolstrum.vercel.app/studio/calculators"
  );
  const [freq, setFreq] = useState('weekly');
  const [priority, setPriority] = useState('0.8');

  const sitemapXml = generateSitemapXml(urlsText.split('\n'), freq, priority);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Page URLs (One per Line)</h3>
        <textarea
          value={urlsText}
          onChange={(e) => setUrlsText(e.target.value)}
          rows={8}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
        />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Change Frequency</label>
            <select
              value={freq}
              onChange={(e) => setFreq(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
            >
              <option value="always">always</option>
              <option value="hourly">hourly</option>
              <option value="daily">daily</option>
              <option value="weekly">weekly</option>
              <option value="monthly">monthly</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Default Priority</label>
            <input
              type="text"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold font-mono"
            />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Sitemap.xml Output
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(sitemapXml)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy XML</span>
            </button>
          )}
        </div>

        <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed">
          {sitemapXml}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 399 — WEBPAGE TO MARKDOWN
// ========================================================
export const WebpageToMarkdownTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [htmlInput, setHtmlInput] = useState(
    `<h1>Toolstrum Overview</h1>\n<p>Toolstrum provides <strong>offline utilities</strong> for developers.</p>\n<ul>\n  <li>JSON Tools</li>\n  <li>SQL Formatter</li>\n</ul>\n<p>Learn more at <a href="https://toolstrum.vercel.app">Toolstrum Home</a>.</p>`
  );

  const markdown = htmlToMarkdown(htmlInput);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">HTML Source</h3>
        <textarea
          value={htmlInput}
          onChange={(e) => setHtmlInput(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Markdown Output
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(markdown)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy MD</span>
            </button>
          )}
        </div>

        <pre className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed whitespace-pre-wrap">
          {markdown}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 400 — WEBSITE WORD COUNTER
// ========================================================
export const WebsiteWordCounterTool: React.FC<ToolProps> = () => {
  const [content, setContent] = useState(
    `<article>\n  <h2>Fast, Private, Offline</h2>\n  <p>Toolstrum was engineered for privacy-conscious developers. All computations execute on your CPU using WebAssembly and Web Crypto.</p>\n  <p>Never transmit secret keys, JSON, or PDFs to third-party cloud servers.</p>\n</article>`
  );

  const metrics = computeWebpageWordMetrics(content);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Webpage Text / HTML</h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
        />
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Word & Reading Metrics
        </span>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Word Count</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {metrics.words}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Reading Time</span>
            <div className="text-2xl font-black text-teal-600 dark:text-teal-400 font-mono mt-0.5">
              {metrics.readingTimeMin} min
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Characters</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {metrics.characters}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400">Sentences</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {metrics.sentences}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
