import React, { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  Share2,
  Bot,
  Map,
  Tag,
  FileCode,
  FileSpreadsheet,
  FileEdit,
  Hash,
  Copy,
  Check,
  Download,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  parseHtmlMetadata,
  generateMetaTags,
  parseRobotsTxt,
  parseSitemapXml,
  generateSitemapXml,
  htmlToMarkdown,
  computeWebpageWordMetrics,
  WebMetadata,
  RobotsRule,
  SitemapEntry,
  WebWordCountResult,
} from './webHelpers';

interface ContentSeoPanelProps {
  defaultMode?:
    | 'metadata'
    | 'previewer'
    | 'opengraph'
    | 'robotstxt'
    | 'sitemap_viewer'
    | 'metatags'
    | 'sitemap_gen'
    | 'markdown'
    | 'wordcount';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const ContentSeoPanel: React.FC<ContentSeoPanelProps> = ({
  defaultMode = 'metadata',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'metadata'
    | 'previewer'
    | 'opengraph'
    | 'robotstxt'
    | 'sitemap_viewer'
    | 'metatags'
    | 'sitemap_gen'
    | 'markdown'
    | 'wordcount'
  >(defaultMode);

  // 379: Metadata Viewer & 381: Open Graph Preview
  const [sampleHtml, setSampleHtml] = useState(
    `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <title>Toolstrum — 500 Offline Developer & Security Utilities</title>\n  <meta name="description" content="100% Client-side zero-knowledge offline tools suite with no servers or cloud tracking." />\n  <meta name="keywords" content="offline tools, web tools, security, privacy, pdf, qr" />\n  <meta property="og:title" content="Toolstrum Offline Suite" />\n  <meta property="og:description" content="All 500 developer and privacy tools in your local browser." />\n  <meta property="og:image" content="https://toolstrum.vercel.app/og-preview.png" />\n  <meta name="twitter:card" content="summary_large_image" />\n  <link rel="canonical" href="https://toolstrum.vercel.app" />\n</head>\n<body>\n  <h1>Welcome to Toolstrum</h1>\n  <p>All utilities run locally.</p>\n</body>\n</html>`
  );
  const [parsedMeta, setParsedMeta] = useState<WebMetadata>(() => parseHtmlMetadata(sampleHtml));

  useEffect(() => {
    setParsedMeta(parseHtmlMetadata(sampleHtml));
  }, [sampleHtml]);

  // 380: HTML Previewer
  const [htmlCode, setHtmlCode] = useState(
    `<div style="font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: white; border-radius: 1rem; text-align: center;">\n  <h2 style="color: #14b8a6; margin-bottom: 0.5rem;">Offline Live HTML Preview</h2>\n  <p style="color: #94a3b8; font-size: 0.9rem;">Runs safely inside a sandboxed local iframe with zero internet connectivity.</p>\n  <button style="background: #14b8a6; color: white; border: 0; padding: 0.5rem 1.25rem; border-radius: 0.5rem; font-weight: bold; cursor: pointer;">Action Button</button>\n</div>`
  );

  // 382: Robots.txt
  const [robotsContent, setRobotsContent] = useState(
    `User-agent: *\nDisallow: /admin/\nDisallow: /private/\nAllow: /public/\n\nUser-agent: Googlebot\nDisallow: /tmp/\n\nSitemap: https://toolstrum.vercel.app/sitemap.xml`
  );
  const [parsedRobots, setParsedRobots] = useState<RobotsRule[]>(() => parseRobotsTxt(robotsContent));

  useEffect(() => {
    setParsedRobots(parseRobotsTxt(robotsContent));
  }, [robotsContent]);

  // 383: Sitemap Viewer
  const [sitemapXml, setSitemapXml] = useState(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>https://toolstrum.vercel.app</loc>\n    <lastmod>2026-11-15</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n  <url>\n    <loc>https://toolstrum.vercel.app/security</loc>\n    <lastmod>2026-11-15</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc>https://toolstrum.vercel.app/developer</loc>\n    <lastmod>2026-11-15</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n</urlset>`
  );
  const [parsedSitemap, setParsedSitemap] = useState<SitemapEntry[]>(() => parseSitemapXml(sitemapXml));

  useEffect(() => {
    setParsedSitemap(parseSitemapXml(sitemapXml));
  }, [sitemapXml]);

  // 393: Meta Tag Generator
  const [metaGenTitle, setMetaGenTitle] = useState('My Awesome Project');
  const [metaGenDesc, setMetaGenDesc] = useState('Build lightning fast web applications with zero tracking.');
  const [metaGenUrl, setMetaGenUrl] = useState('https://myproject.com');
  const [metaGenImage, setMetaGenImage] = useState('https://myproject.com/cover.png');
  const [metaGenAuthor, setMetaGenAuthor] = useState('Dev Team');
  const generatedMetaTags = generateMetaTags({
    title: metaGenTitle,
    description: metaGenDesc,
    url: metaGenUrl,
    image: metaGenImage,
    author: metaGenAuthor,
  });

  // 394: Sitemap Generator
  const [sitemapGenUrls, setSitemapGenUrls] = useState(
    `https://example.com\nhttps://example.com/about\nhttps://example.com/pricing\nhttps://example.com/contact`
  );
  const [genChangefreq, setGenChangefreq] = useState('weekly');
  const [genPriority, setGenPriority] = useState('0.8');
  const generatedSitemapXml = generateSitemapXml(
    sitemapGenUrls
      .split('\n')
      .map((u) => u.trim())
      .filter(Boolean)
      .map((loc) => ({
        loc,
        lastmod: new Date().toISOString().split('T')[0],
        changefreq: genChangefreq,
        priority: genPriority,
      }))
  );

  // 399: Webpage to Markdown
  const [markdownInput, setMarkdownInput] = useState(
    `<h1>Article Title</h1>\n<p>This is a paragraph with <strong>bold text</strong> and <a href="https://example.com">a hyperlink</a>.</p>\n<ul>\n  <li>First key point</li>\n  <li>Second key point</li>\n</ul>`
  );
  const convertedMarkdown = htmlToMarkdown(markdownInput);

  // 400: Website Word Counter
  const [wordCountText, setWordCountText] = useState(
    `Toolstrum is an entirely offline client-side productivity and engineering suite. It includes 500 specialized utilities across 15 dedicated studios. Zero user telemetry or private payload ever leaves your local device.`
  );
  const wordMetrics = computeWebpageWordMetrics(wordCountText);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'metadata', label: 'Metadata Viewer (#379)', icon: FileText },
          { id: 'previewer', label: 'HTML Previewer (#380)', icon: Eye },
          { id: 'opengraph', label: 'Open Graph (#381)', icon: Share2 },
          { id: 'robotstxt', label: 'Robots.txt (#382)', icon: Bot },
          { id: 'sitemap_viewer', label: 'Sitemap Viewer (#383)', icon: Map },
          { id: 'metatags', label: 'Meta Tag Gen (#393)', icon: Tag },
          { id: 'sitemap_gen', label: 'Sitemap Gen (#394)', icon: FileCode },
          { id: 'markdown', label: 'HTML to Markdown (#399)', icon: FileEdit },
          { id: 'wordcount', label: 'Word Counter (#400)', icon: Hash },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* 379: Metadata Viewer */}
      {activeTab === 'metadata' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">HTML Source with Metadata</h3>
              <textarea
                value={sampleHtml}
                onChange={(e) => setSampleHtml(e.target.value)}
                rows={12}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
                placeholder="Paste HTML <head> or document..."
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Extracted Meta Tags
              </span>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-slate-400 font-bold block">Page Title:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{parsedMeta.title || '(none)'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-slate-400 font-bold block">Meta Description:</span>
                  <span className="text-slate-700 dark:text-slate-300">{parsedMeta.description || '(none)'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-slate-400 font-bold block">Canonical Link:</span>
                  <span className="font-mono text-teal-600 break-all">{parsedMeta.canonical || '(none)'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-0.5">
                  <span className="text-slate-400 font-bold block">Viewport:</span>
                  <span className="font-mono text-slate-700 dark:text-slate-300">{parsedMeta.viewport || '(none)'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 380: HTML Previewer */}
      {activeTab === 'previewer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">HTML / CSS Source Editor</h3>
            <textarea
              value={htmlCode}
              onChange={(e) => setHtmlCode(e.target.value)}
              rows={14}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3 flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Live Sandboxed Rendering
            </span>
            <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white">
              <iframe
                title="HTML Preview Sandbox"
                srcDoc={htmlCode}
                sandbox="allow-scripts"
                className="w-full h-full border-0 min-h-[320px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* 381: Open Graph Preview */}
      {activeTab === 'opengraph' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Social Meta Tags</h3>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">og:title</label>
                <input
                  type="text"
                  value={parsedMeta.ogTitle}
                  onChange={(e) => setParsedMeta({ ...parsedMeta, ogTitle: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">og:description</label>
                <textarea
                  value={parsedMeta.ogDescription}
                  onChange={(e) => setParsedMeta({ ...parsedMeta, ogDescription: e.target.value })}
                  rows={3}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">og:image URL</label>
                <input
                  type="text"
                  value={parsedMeta.ogImage}
                  onChange={(e) => setParsedMeta({ ...parsedMeta, ogImage: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Social Feed Card Preview (Twitter / Facebook / LinkedIn)
              </span>

              {/* Mock Social Card */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm max-w-md mx-auto">
                <div className="h-44 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs overflow-hidden">
                  {parsedMeta.ogImage ? (
                    <img src={parsedMeta.ogImage} alt="OG Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span>No Image Preview Provided</span>
                  )}
                </div>
                <div className="p-4 space-y-1">
                  <span className="text-[11px] uppercase font-bold text-slate-400">toolstrum.vercel.app</span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{parsedMeta.ogTitle}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{parsedMeta.ogDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 382: Robots.txt */}
      {activeTab === 'robotstxt' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Robots.txt Source</h3>
            <textarea
              value={robotsContent}
              onChange={(e) => setRobotsContent(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Parsed Directives ({parsedRobots.length} User-Agent Blocks)
            </span>

            <div className="space-y-3">
              {parsedRobots.map((rule, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-xs space-y-2">
                  <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                    User-agent: {rule.userAgent}
                  </span>
                  {rule.disallowed.length > 0 && (
                    <div className="text-rose-600 space-y-0.5">
                      <span className="font-bold text-[10px] uppercase block">Disallowed Paths:</span>
                      {rule.disallowed.map((d, i) => (
                        <code key={i} className="block text-[11px] font-mono">
                          {d}
                        </code>
                      ))}
                    </div>
                  )}
                  {rule.allowed.length > 0 && (
                    <div className="text-emerald-600 space-y-0.5">
                      <span className="font-bold text-[10px] uppercase block">Allowed Paths:</span>
                      {rule.allowed.map((a, i) => (
                        <code key={i} className="block text-[11px] font-mono">
                          {a}
                        </code>
                      ))}
                    </div>
                  )}
                  {rule.sitemaps.length > 0 && (
                    <div className="text-slate-500 space-y-0.5">
                      <span className="font-bold text-[10px] uppercase block">Sitemaps:</span>
                      {rule.sitemaps.map((s, i) => (
                        <code key={i} className="block text-[11px] font-mono break-all">
                          {s}
                        </code>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 383: Sitemap Viewer */}
      {activeTab === 'sitemap_viewer' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Sitemap.xml Input</h3>
            <textarea
              value={sitemapXml}
              onChange={(e) => setSitemapXml(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Parsed URLs ({parsedSitemap.length} Entries)
            </span>

            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {parsedSitemap.map((entry, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-xs space-y-1">
                  <span className="font-mono font-bold text-slate-900 dark:text-white break-all block">
                    {entry.loc}
                  </span>
                  <div className="flex gap-3 text-[11px] text-slate-400">
                    {entry.lastmod && <span>Modified: {entry.lastmod}</span>}
                    {entry.priority && <span>Priority: {entry.priority}</span>}
                    {entry.changefreq && <span>Freq: {entry.changefreq}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 393: Meta Tag Generator */}
      {activeTab === 'metatags' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Page SEO Parameters</h3>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Page Title</label>
              <input
                type="text"
                value={metaGenTitle}
                onChange={(e) => setMetaGenTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Meta Description</label>
              <textarea
                value={metaGenDesc}
                onChange={(e) => setMetaGenDesc(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Canonical URL</label>
                <input
                  type="text"
                  value={metaGenUrl}
                  onChange={(e) => setMetaGenUrl(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Author Name</label>
                <input
                  type="text"
                  value={metaGenAuthor}
                  onChange={(e) => setMetaGenAuthor(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1">Social Image URL</label>
              <input
                type="text"
                value={metaGenImage}
                onChange={(e) => setMetaGenImage(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Generated HTML Header Tags
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(generatedMetaTags)}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              )}
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-[11px] overflow-x-auto max-h-[300px] leading-relaxed text-slate-900 dark:text-white">
              {generatedMetaTags}
            </pre>
          </div>
        </div>
      )}

      {/* 394: Sitemap Generator */}
      {activeTab === 'sitemap_gen' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">List of URLs (One Per Line)</h3>
            <textarea
              value={sitemapGenUrls}
              onChange={(e) => setSitemapGenUrls(e.target.value)}
              rows={8}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Change Frequency</label>
                <select
                  value={genChangefreq}
                  onChange={(e) => setGenChangefreq(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                >
                  <option value="always">always</option>
                  <option value="hourly">hourly</option>
                  <option value="daily">daily</option>
                  <option value="weekly">weekly</option>
                  <option value="monthly">monthly</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Priority</label>
                <select
                  value={genPriority}
                  onChange={(e) => setGenPriority(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                >
                  <option value="1.0">1.0 (Highest)</option>
                  <option value="0.8">0.8 (High)</option>
                  <option value="0.5">0.5 (Medium)</option>
                  <option value="0.3">0.3 (Low)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Generated XML Sitemap
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(generatedSitemapXml)}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy XML</span>
                </button>
              )}
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-[11px] overflow-x-auto max-h-[300px] leading-relaxed text-slate-900 dark:text-white">
              {generatedSitemapXml}
            </pre>
          </div>
        </div>
      )}

      {/* 399: HTML to Markdown */}
      {activeTab === 'markdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Raw HTML Input</h3>
            <textarea
              value={markdownInput}
              onChange={(e) => setMarkdownInput(e.target.value)}
              rows={12}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Markdown Output
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(convertedMarkdown)}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy</span>
                </button>
              )}
            </div>
            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs overflow-x-auto max-h-[300px] leading-relaxed text-slate-900 dark:text-white">
              {convertedMarkdown}
            </pre>
          </div>
        </div>
      )}

      {/* 400: Website Word Counter */}
      {activeTab === 'wordcount' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Webpage Text / HTML Content</h3>
              <textarea
                value={wordCountText}
                onChange={(e) => setWordCountText(e.target.value)}
                rows={10}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Metrics & Keyword Density
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    {wordMetrics.wordCount}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Words</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    {wordMetrics.characterCount}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Characters</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-2xl font-black text-teal-600 block">
                    {wordMetrics.readingTimeMinutes}m
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Reading Time</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white block">
                    {wordMetrics.sentenceCount}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Sentences</span>
                </div>
              </div>

              {wordMetrics.topKeywords.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Top Keyword Frequency:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {wordMetrics.topKeywords.map((kw) => (
                      <span
                        key={kw.word}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[11px] font-bold"
                      >
                        {kw.word}: {kw.count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
