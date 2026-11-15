import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Link,
  Scissors,
  Maximize2,
  QrCode,
  ListFilter,
  CheckCircle,
  ExternalLink,
  Copy,
  Check,
  Download,
  AlertCircle,
  Sparkles,
  Share2,
} from 'lucide-react';
import {
  shortenUrl,
  expandUrl,
  extractLinksFromHtml,
  validateUrlStructure,
  ShortenResult,
  ExpandResult,
  ExtractedLink,
  UrlValidationReport,
} from './webHelpers';

interface UrlToolsPanelProps {
  defaultMode?: 'shortener' | 'expander' | 'qr' | 'extractor' | 'validator' | 'preview';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const UrlToolsPanel: React.FC<UrlToolsPanelProps> = ({
  defaultMode = 'shortener',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'shortener' | 'expander' | 'qr' | 'extractor' | 'validator' | 'preview'>(
    defaultMode
  );

  // 376: URL Shortener
  const [longUrl, setLongUrl] = useState('https://developer.toolstrum.app/documentation/offline-zero-knowledge-architecture?session=active&source=web');
  const [customSlug, setCustomSlug] = useState('');
  const [shortenResult, setShortenResult] = useState<ShortenResult>(() => shortenUrl(longUrl, customSlug));

  const handleShorten = () => {
    setShortenResult(shortenUrl(longUrl, customSlug));
  };

  useEffect(() => {
    handleShorten();
  }, [longUrl, customSlug]);

  // 377: URL Expander
  const [shortInput, setShortInput] = useState('https://bit.ly/toolstrum-offline-preview');
  const [expandResult, setExpandResult] = useState<ExpandResult>(() => expandUrl(shortInput));

  const handleExpand = () => {
    setExpandResult(expandUrl(shortInput));
  };

  useEffect(() => {
    handleExpand();
  }, [shortInput]);

  // 378 & 397: Website QR & QR Link Preview
  const [qrUrl, setQrUrl] = useState('https://toolstrum.vercel.app');
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (!qrUrl.trim()) return;
    QRCode.toDataURL(qrUrl, { width: 320, margin: 2, color: { dark: '#0d9488', light: '#ffffff' } }, (err, url) => {
      if (!err && url) setQrDataUrl(url);
    });
  }, [qrUrl]);

  // 392: Link Extractor
  const [htmlContent, setHtmlContent] = useState(
    `<nav>\n  <a href="/">Home</a>\n  <a href="/pricing">Pricing</a>\n  <a href="https://github.com/shibu2000/toolstrum">GitHub Repo</a>\n  <a href="mailto:support@toolstrum.app">Email Us</a>\n  <a href="tel:+15550192834">Call Support</a>\n  <a href="#features">Jump to Features</a>\n</nav>`
  );
  const [extractedLinks, setExtractedLinks] = useState<ExtractedLink[]>(() => extractLinksFromHtml(htmlContent));

  const handleExtract = () => {
    setExtractedLinks(extractLinksFromHtml(htmlContent));
  };

  useEffect(() => {
    handleExtract();
  }, [htmlContent]);

  // 395: URL Validator
  const [testUrl, setTestUrl] = useState('https://user:pass@api.toolstrum.app:8443/v1/data?query=search&tag=web#results');
  const [validationReport, setValidationReport] = useState<UrlValidationReport>(() => validateUrlStructure(testUrl));

  useEffect(() => {
    setValidationReport(validateUrlStructure(testUrl));
  }, [testUrl]);

  const downloadQr = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = 'toolstrum-website-qr.png';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'shortener', label: 'URL Shortener (Tool #376)', icon: Scissors },
          { id: 'expander', label: 'URL Expander (Tool #377)', icon: Maximize2 },
          { id: 'qr', label: 'Website QR (Tool #378)', icon: QrCode },
          { id: 'extractor', label: 'Link Extractor (Tool #392)', icon: ListFilter },
          { id: 'validator', label: 'URL Validator (Tool #395)', icon: CheckCircle },
          { id: 'preview', label: 'QR Link Preview (Tool #397)', icon: Share2 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* 376: URL Shortener */}
      {activeTab === 'shortener' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Shorten & Alias Long Web Addresses
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Original Destination URL
                </label>
                <textarea
                  value={longUrl}
                  onChange={(e) => setLongUrl(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
                  placeholder="https://example.com/very/long/path/with/params"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Optional Custom Slug / Alias
                </label>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs font-bold">
                    tool.st/
                  </span>
                  <input
                    type="text"
                    value={customSlug}
                    onChange={(e) => setCustomSlug(e.target.value)}
                    placeholder="my-custom-link"
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Compact Short URL
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                  -{shortenResult.savingsPercent}% Size
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
                <span className="text-lg font-black font-mono text-slate-900 dark:text-white break-all">
                  {shortenResult.shortUrl}
                </span>
              </div>

              {onCopy && (
                <button
                  onClick={() => onCopy(shortenResult.shortUrl)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Short Link'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 377: URL Expander */}
      {activeTab === 'expander' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Trace Shortened Links & Uncover Hidden Destinations
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Shortened or Masked URL
                </label>
                <input
                  type="text"
                  value={shortInput}
                  onChange={(e) => setShortInput(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                  placeholder="https://bit.ly/example"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Shortener Provider:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{expandResult.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Redirect Hops:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{expandResult.redirectsCount} hops</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol:</span>
                  <span className={`font-mono font-bold ${expandResult.isHttps ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {expandResult.isHttps ? 'HTTPS (Secure)' : 'HTTP (Insecure)'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Expanded Real Destination
              </span>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 break-all text-xs font-mono font-bold text-slate-900 dark:text-white">
                {expandResult.finalUrl}
              </div>

              <div className="flex gap-2">
                {onCopy && (
                  <button
                    onClick={() => onCopy(expandResult.finalUrl)}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Destination</span>
                  </button>
                )}
                <a
                  href={expandResult.finalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 378: Website QR Generator */}
      {activeTab === 'qr' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Generate Website QR Code (Tool #378)
              </h3>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Target Website URL
                </label>
                <input
                  type="text"
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                  placeholder="https://example.com"
                />
              </div>
              <p className="text-xs text-slate-500">
                Encodes any URL into an offline vector/raster QR code for print, flyers, business cards, or screens.
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Rendered QR Code
              </span>
              {qrDataUrl && (
                <div className="p-4 rounded-2xl bg-white shadow-sm border border-slate-200 dark:border-slate-700">
                  <img src={qrDataUrl} alt="Website QR" className="w-48 h-48 object-contain" />
                </div>
              )}
              <button
                onClick={downloadQr}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download QR Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 392: Link Extractor */}
      {activeTab === 'extractor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                HTML Source or Markdown with Hyperlinks
              </h3>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={10}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
                placeholder="Paste HTML or text containing <a href='...'> links..."
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Extracted Links ({extractedLinks.length})
                </span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {extractedLinks.map((l, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate flex-1 space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-md ${
                            l.type === 'Internal'
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : l.type === 'External'
                              ? 'bg-sky-500/10 text-sky-600'
                              : 'bg-amber-500/10 text-amber-600'
                          }`}
                        >
                          {l.type}
                        </span>
                        <span className="text-slate-500 font-bold truncate">{l.text}</span>
                      </div>
                      <span className="font-mono text-slate-900 dark:text-white truncate block">
                        {l.href}
                      </span>
                    </div>

                    {onCopy && (
                      <button
                        onClick={() => onCopy(l.href)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 cursor-pointer shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 395: URL Validator */}
      {activeTab === 'validator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                RFC 3986 URL Syntax & Component Breakdown
              </h3>
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                placeholder="https://example.com/path?query=1"
              />

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol / Scheme:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{validationReport.protocol || '(none)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hostname:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{validationReport.hostname || '(none)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Port:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{validationReport.port || 'default'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Pathname:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{validationReport.pathname || '/'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Query Parameters:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{validationReport.search || '(none)'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Hash / Fragment:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{validationReport.hash || '(none)'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Compliance Verification
              </span>

              <div
                className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                  validationReport.isValid
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400/40 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-400/40 text-rose-800 dark:text-rose-300'
                }`}
              >
                {validationReport.isValid ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
                <span>{validationReport.isValid ? 'Valid RFC 3986 Web URI' : 'Invalid URI Structure'}</span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500">
                {validationReport.diagnostics.map((d, i) => (
                  <p key={i}>• {d}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 397: QR Link Preview */}
      {activeTab === 'preview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Target Link for Social & QR Preview
              </h3>
              <input
                type="text"
                value={qrUrl}
                onChange={(e) => setQrUrl(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                placeholder="https://example.com"
              />
              <p className="text-xs text-slate-500">
                Simulates how physical QR scans translate into mobile browser preview cards with OpenGraph metadata.
              </p>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Mobile Scan Simulation Card
              </span>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex gap-4 items-center">
                {qrDataUrl && <img src={qrDataUrl} alt="QR" className="w-24 h-24 object-contain rounded-xl bg-white p-2" />}
                <div className="space-y-1 truncate">
                  <span className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">Verified Target</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white truncate">
                    {new URL(qrUrl.startsWith('http') ? qrUrl : `https://${qrUrl}`).hostname}
                  </h4>
                  <p className="text-xs text-slate-400 font-mono truncate">{qrUrl}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
