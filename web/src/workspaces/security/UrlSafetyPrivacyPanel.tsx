import React, { useState, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Globe,
  Upload,
  Download,
  Copy,
  Check,
  Trash2,
  Sparkles,
  Link2,
  Image as ImageIcon,
  ExternalLink,
} from 'lucide-react';
import {
  analyzeUrlSafety,
  cleanPrivacyMetadata,
  UrlSafetyReport,
} from './securityHelpers';

interface UrlSafetyPrivacyPanelProps {
  defaultMode?: 'safety' | 'cleaner';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const UrlSafetyPrivacyPanel: React.FC<UrlSafetyPrivacyPanelProps> = ({
  defaultMode = 'safety',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'cleaner'>(defaultMode);

  // URL Safety State (Tool #366)
  const [targetUrl, setTargetUrl] = useState('https://secure-login.bank-portal.xyz.cc/account/verify?utm_source=phish&fbclid=123');
  const [safetyReport, setSafetyReport] = useState<UrlSafetyReport>(() => analyzeUrlSafety(targetUrl));

  const handleUrlChange = (newUrl: string) => {
    setTargetUrl(newUrl);
    setSafetyReport(analyzeUrlSafety(newUrl));
  };

  // Image EXIF Stripper State (Tool #375)
  const [cleanedImgUrl, setCleanedImgUrl] = useState<string>('');
  const [imgFileName, setImgFileName] = useState<string>('');
  const [originalImgSize, setOriginalImgSize] = useState<number>(0);
  const [cleanedImgSize, setCleanedImgSize] = useState<number>(0);
  const [imgStatus, setImgStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL Tracker Stripper State (Tool #375)
  const [trackerInputUrl, setTrackerInputUrl] = useState(
    'https://example.com/product?utm_source=newsletter&utm_medium=email&utm_campaign=black_friday&fbclid=IwAR2XYZ&gclid=123'
  );
  const [sanitizedUrl, setSanitizedUrl] = useState<string>('');
  const [strippedCount, setStrippedCount] = useState<number>(0);

  const cleanExifMetadata = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImgFileName(file.name);
    setOriginalImgSize(file.size);
    setImgStatus('Stripping EXIF & GPS metadata client-side...');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                setCleanedImgUrl(url);
                setCleanedImgSize(blob.size);
                setImgStatus('All EXIF tags, GPS location, and camera serials purged.');
              }
            },
            'image/jpeg',
            0.95
          );
        }
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleStripTrackers = () => {
    const res = cleanPrivacyMetadata(trackerInputUrl);
    setSanitizedUrl(res.cleaned);
    setStrippedCount(res.removedTrackersCount);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'safety'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>URL Safety Inspector (Tool #366)</span>
        </button>

        <button
          onClick={() => setActiveTab('cleaner')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'cleaner'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Privacy Metadata & Tracker Cleaner (Tool #375)</span>
        </button>
      </div>

      {activeTab === 'safety' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Target URL Input: 7 cols */}
          <div className="lg:col-span-7 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Inspect URL for Phishing & Malicious Vectors
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Target URL to Analyze
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Preset quick test buttons */}
              <div>
                <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
                  Try Sample URL Cases:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'Clean HTTPS Link', url: 'https://docs.github.com/en/repositories' },
                    { label: 'IP Address Host', url: 'http://192.168.1.1/admin/login' },
                    { label: 'Embedded Auth Spoof', url: 'https://paypal.com:secret@phish-login.xyz/pay' },
                    { label: 'Suspicious TLD + Trackers', url: 'https://verify-account.bank-update.buzz/login?utm_source=bad' },
                  ].map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleUrlChange(p.url)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-semibold cursor-pointer"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* URL Component Summary */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Hostname / Domain:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{safetyReport.domain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol:</span>
                  <span className={`font-mono font-bold ${safetyReport.isHttps ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {safetyReport.protocol.toUpperCase()} ({safetyReport.isHttps ? 'Encrypted' : 'Insecure'})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tracking Parameters:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">
                    {safetyReport.trackingParamsFound.length} detected
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Report Score: 5 cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  Risk Assessment
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                    safetyReport.status === 'Safe'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : safetyReport.status === 'Suspicious'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {safetyReport.status}
                </span>
              </div>

              {/* Risk Dial */}
              <div className="text-center py-2 space-y-1">
                <div
                  className={`text-4xl font-black font-mono ${
                    safetyReport.riskScore < 30
                      ? 'text-emerald-500'
                      : safetyReport.riskScore < 60
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }`}
                >
                  {safetyReport.riskScore}/100
                </div>
                <span className="text-xs text-slate-400">Calculated Offline Threat Index</span>
              </div>

              {/* Findings List */}
              <div className="space-y-2">
                {safetyReport.findings.map((f, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 ${
                      f.severity === 'danger'
                        ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-400/30 text-rose-700 dark:text-rose-300'
                        : f.severity === 'warning'
                        ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400/30 text-amber-700 dark:text-amber-300'
                        : 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-400/30 text-emerald-700 dark:text-emerald-300'
                    }`}
                  >
                    {f.severity === 'danger' ? (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Privacy Metadata Cleaner: Tool #375 */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Section 1: EXIF Metadata Stripper */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="p-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <ImageIcon className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Photo EXIF & GPS Geolocation Stripper
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Wipes camera make, model, timestamp, GPS latitude/longitude, and camera serial numbers before sharing online.
            </p>

            <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3">
              <Upload className="w-8 h-8 mx-auto text-teal-600 dark:text-teal-400" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                ref={fileInputRef}
                onChange={cleanExifMetadata}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" /> Select Photo
              </button>
            </div>

            {imgStatus && (
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 text-xs font-bold text-teal-700 dark:text-teal-300">
                ✓ {imgStatus}
              </div>
            )}

            {cleanedImgUrl && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-center">
                <img
                  src={cleanedImgUrl}
                  alt="Sanitized"
                  className="w-44 h-44 object-cover mx-auto rounded-xl shadow-xs"
                />
                <div className="text-xs text-slate-500">
                  Original: {(originalImgSize / 1024).toFixed(1)} KB → Sanitized: {(cleanedImgSize / 1024).toFixed(1)} KB
                </div>
                <a
                  href={cleanedImgUrl}
                  download={`sanitized-${imgFileName}`}
                  className="inline-flex px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Sanitized Image
                </a>
              </div>
            )}
          </div>

          {/* Section 2: URL Tracking Parameter Stripper */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="p-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Link2 className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                URL Tracking Parameter Stripper
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Purges `utm_source`, `fbclid`, `gclid`, and ad tracking tokens to create clean, private URLs.
            </p>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Dirty URL with Tracking Telemetry
              </label>
              <textarea
                value={trackerInputUrl}
                onChange={(e) => setTrackerInputUrl(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
              />
            </div>

            <button
              onClick={handleStripTrackers}
              className="w-full py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> Strip All Query Trackers
            </button>

            {sanitizedUrl && (
              <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-teal-700 dark:text-teal-300">
                    Cleaned URL ({strippedCount} trackers purged):
                  </span>
                  {onCopy && (
                    <button
                      onClick={() => onCopy(sanitizedUrl)}
                      className="px-2 py-1 rounded bg-white dark:bg-slate-800 text-xs font-semibold flex items-center gap-1 shadow-2xs cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  )}
                </div>
                <pre className="p-3 rounded-xl bg-white dark:bg-slate-900 font-mono text-xs break-all whitespace-pre-wrap text-slate-900 dark:text-white">
                  {sanitizedUrl}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
