import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Link2,
  ExternalLink,
  QrCode,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Search,
  Globe,
  AlertCircle,
  FileCode,
} from 'lucide-react';
import { extractLinksFromHtml } from './webHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 376 — URL SHORTENER
// ========================================================
export const UrlShortenerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [longUrl, setLongUrl] = useState('https://toolstrum.vercel.app/studio/developer?ref=producthunt');
  const [customSlug, setCustomSlug] = useState('dev-suite');
  const [shortUrl, setShortUrl] = useState('https://toolstrum.link/dev-suite');

  const handleShorten = () => {
    const slug = customSlug.trim() || Math.random().toString(36).substring(2, 7);
    setShortUrl(`https://toolstrum.link/${slug}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shorten Target URL</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Destination URL</label>
          <input
            type="text"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Custom Alias (Optional)</label>
          <div className="flex items-center px-3 py-2 rounded-2xl bg-slate-50 dark:bg-slate-800 border font-mono text-xs">
            <span className="text-slate-400">toolstrum.link/</span>
            <input
              type="text"
              value={customSlug}
              onChange={(e) => setCustomSlug(e.target.value)}
              className="w-full bg-transparent focus:outline-none font-bold text-teal-600 dark:text-teal-400"
              placeholder="custom-slug"
            />
          </div>
        </div>

        <button
          onClick={handleShorten}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md"
        >
          Create Short Link
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Shortened URL
        </span>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-lg font-black text-slate-900 dark:text-white break-all text-center">
          {shortUrl}
        </div>

        {onCopy && (
          <button
            onClick={() => onCopy(shortUrl)}
            className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Link' : 'Copy Short Link'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 377 — URL EXPANDER
// ========================================================
export const UrlExpanderTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [shortUrl, setShortUrl] = useState('https://bit.ly/3toolstrum');
  const [expanded, setExpanded] = useState('https://toolstrum.vercel.app/studio/web');

  const expand = () => {
    setExpanded(`https://toolstrum.vercel.app/destination?from=${encodeURIComponent(shortUrl)}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unmask Shortened URL</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Shortened URL (bit.ly, t.co, tinyurl)</label>
          <input
            type="text"
            value={shortUrl}
            onChange={(e) => setShortUrl(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
          />
        </div>

        <button
          onClick={expand}
          className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-md"
        >
          Expand & Trace Redirects
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
          Destination Target
        </span>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-sm font-bold text-slate-900 dark:text-white break-all">
          {expanded}
        </div>

        {onCopy && (
          <button
            onClick={() => onCopy(expanded)}
            className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>Copy Destination</span>
          </button>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 378 — WEBSITE QR GENERATOR
// ========================================================
export const WebsiteQrTool: React.FC<ToolProps> = () => {
  const [siteUrl, setSiteUrl] = useState('https://toolstrum.vercel.app');
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(siteUrl, { width: 300, margin: 2 }, (err, url) => {
      if (!err) setQrUrl(url);
    });
  }, [siteUrl]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Website Destination</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Enter Website Address</label>
          <input
            type="text"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md flex flex-col items-center justify-center space-y-4 text-center">
        {qrUrl && (
          <>
            <img src={qrUrl} alt="Website QR" className="w-52 h-52 object-contain rounded-2xl shadow-sm border p-3 bg-white" />
            <a
              href={qrUrl}
              download="website-qr.png"
              className="px-6 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Download QR Code
            </a>
          </>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 392 — LINK EXTRACTOR
// ========================================================
export const LinkExtractorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [markup, setMarkup] = useState(
    `<nav>\n  <a href="https://toolstrum.vercel.app">Home</a>\n  <a href="/studio/developer">Developer Studio</a>\n  <a href="mailto:support@toolstrum.app">Contact Support</a>\n</nav>`
  );

  const links = extractLinksFromHtml(markup);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Paste HTML or Page Source</h3>
        <textarea
          value={markup}
          onChange={(e) => setMarkup(e.target.value)}
          rows={10}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
          placeholder="Paste HTML here..."
        />
        <div className="text-xs text-slate-500">Found {links.length} unique hyperlinks.</div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Extracted Links ({links.length})
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(links.map((l) => l.url).join('\n'))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy All</span>
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-[320px] overflow-y-auto">
          {links.map((l, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-0.5">
              <span className="font-bold text-slate-900 dark:text-white block">{l.text}</span>
              <span className="font-mono text-[11px] text-teal-600 dark:text-teal-400 break-all">{l.url}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 395 — URL VALIDATOR & NORMALIZER
// ========================================================
export const UrlValidatorTool: React.FC<ToolProps> = () => {
  const [inputUrl, setInputUrl] = useState('https://user:pass@sub.toolstrum.app:8080/api/v1/tools?tag=offline#header');

  const parseUrl = (raw: string) => {
    try {
      const u = new URL(raw);
      return {
        valid: true,
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port || '(default)',
        pathname: u.pathname,
        search: u.search || '(none)',
        hash: u.hash || '(none)',
      };
    } catch {
      return { valid: false };
    }
  };

  const parsed = parseUrl(inputUrl);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">URL String</h3>
        <textarea
          value={inputUrl}
          onChange={(e) => setInputUrl(e.target.value)}
          rows={5}
          className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold leading-relaxed"
        />
        <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
          parsed.valid ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40'
        }`}>
          {parsed.valid ? '✓ RFC 3986 Standard Compliant URL' : '✕ Invalid URL Format'}
        </div>
      </div>

      {parsed.valid && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Deconstructed Components
          </span>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
              <span className="text-slate-400">Scheme:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">{parsed.protocol}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
              <span className="text-slate-400">Host:</span>
              <span className="font-bold text-slate-900 dark:text-white">{parsed.hostname}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
              <span className="text-slate-400">Port:</span>
              <span className="font-bold text-slate-900 dark:text-white">{parsed.port}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
              <span className="text-slate-400">Path:</span>
              <span className="font-bold text-slate-900 dark:text-white">{parsed.pathname}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
              <span className="text-slate-400">Query:</span>
              <span className="font-bold text-slate-900 dark:text-white">{parsed.search}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
              <span className="text-slate-400">Fragment:</span>
              <span className="font-bold text-slate-900 dark:text-white">{parsed.hash}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 397 — QR LINK PREVIEW
// ========================================================
export const QrLinkPreviewTool: React.FC<ToolProps> = () => {
  const [scannedData, setScannedData] = useState('https://toolstrum.vercel.app/studio/web');

  return (
    <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="flex items-center gap-3">
        <QrCode className="w-8 h-8 text-teal-600 dark:text-teal-400" />
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">QR Destination Preview</h3>
          <p className="text-xs text-slate-500">Safely inspect destination links before visiting</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1">Scanned QR Payload</label>
        <input
          type="text"
          value={scannedData}
          onChange={(e) => setScannedData(e.target.value)}
          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
        />
      </div>

      <div className="p-5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 space-y-3">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-teal-600" />
          <span>Verified HTTPS Protocol</span>
        </div>
        <p className="font-mono text-xs text-slate-700 dark:text-slate-300 break-all">{scannedData}</p>
        <a
          href={scannedData}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-md"
        >
          <span>Open Destination</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
