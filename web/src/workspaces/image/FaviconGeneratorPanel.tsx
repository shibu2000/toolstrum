import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Globe,
  Download,
  Copy,
  Check,
  ShieldCheck,
  FileArchive,
  Code,
  Sparkles,
  Layers,
  Image as ImageIcon,
  Smartphone,
  Monitor,
} from 'lucide-react';
import JSZip from 'jszip';

export interface FaviconGeneratorPanelProps {
  accentColor?: string;
}

interface FaviconSizeDef {
  name: string;
  size: number;
  format: 'png' | 'ico';
  description: string;
}

const FAVICON_SIZES: FaviconSizeDef[] = [
  { name: 'favicon-16x16.png', size: 16, format: 'png', description: 'Standard browser tab' },
  { name: 'favicon-32x32.png', size: 32, format: 'png', description: 'Retina browser tab' },
  { name: 'favicon-48x48.png', size: 48, format: 'png', description: 'Windows taskbar / desktop' },
  { name: 'apple-touch-icon.png', size: 180, format: 'png', description: 'iOS home screen bookmark' },
  { name: 'android-chrome-192x192.png', size: 192, format: 'png', description: 'Android PWA standard icon' },
  { name: 'android-chrome-512x512.png', size: 512, format: 'png', description: 'Android PWA splash screen' },
];

export const FaviconGeneratorPanel: React.FC<FaviconGeneratorPanelProps> = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgNaturalWidth, setImgNaturalWidth] = useState<number>(0);
  const [imgNaturalHeight, setImgNaturalHeight] = useState<number>(0);

  // Background padding / shaping
  const [borderRadius, setBorderRadius] = useState<number>(0); // 0 (square) to 50% (circle)
  const [paddingPercent, setPaddingPercent] = useState<number>(0); // 0 to 30%
  const [bgColor, setBgColor] = useState<string>('transparent');

  const [generatedSizes, setGeneratedSizes] = useState<{
    [name: string]: { blob: Blob; url: string; size: number };
  }>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);

  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // HTML Link Tags Snippet
  const htmlSnippet = `<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\n<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\n<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\n<link rel="icon" href="/favicon.ico">\n<link rel="manifest" href="/site.webmanifest">`;

  // Webmanifest json
  const webmanifestContent = JSON.stringify(
    {
      name: 'App',
      short_name: 'App',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
    },
    null,
    2
  );

  // Handle image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploaded = e.target.files[0];
    const url = URL.createObjectURL(uploaded);
    setFile(uploaded);
    setPreviewUrl(url);

    const img = new Image();
    img.onload = () => {
      setImgNaturalWidth(img.naturalWidth);
      setImgNaturalHeight(img.naturalHeight);
    };
    img.src = url;
    e.target.value = '';
  };

  // Generate single favicon blob
  const generateSizeBlob = useCallback(
    (img: HTMLImageElement, size: number): Promise<Blob> => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, size, size);

        // Background color
        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          if (borderRadius > 0) {
            const rad = (size * borderRadius) / 100;
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
            ctx.clip();
          } else {
            ctx.fillRect(0, 0, size, size);
          }
        }

        // Draw image with padding
        const pad = (size * paddingPercent) / 100;
        const drawSize = size - pad * 2;
        ctx.drawImage(img, pad, pad, drawSize, drawSize);

        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });
    },
    [bgColor, borderRadius, paddingPercent]
  );

  // Generate all sizes when settings change
  useEffect(() => {
    if (!imageElementRef.current || !previewUrl) return;
    const img = imageElementRef.current;

    let isMounted = true;
    const generateAll = async () => {
      const results: { [name: string]: { blob: Blob; url: string; size: number } } = {};
      for (const def of FAVICON_SIZES) {
        const blob = await generateSizeBlob(img, def.size);
        if (isMounted) {
          results[def.name] = {
            blob,
            url: URL.createObjectURL(blob),
            size: def.size,
          };
        }
      }
      if (isMounted) {
        setGeneratedSizes(results);
      }
    };

    generateAll();

    return () => {
      isMounted = false;
      Object.values(generatedSizes).forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrl, generateSizeBlob]);

  // Package all favicons into a standard ZIP bundle
  const handleDownloadZip = async () => {
    if (!imageElementRef.current || Object.keys(generatedSizes).length === 0) return;
    setIsProcessing(true);
    try {
      const zip = new JSZip();

      // Add PNG sizes
      for (const [name, data] of Object.entries(generatedSizes)) {
        zip.file(name, data.blob);
      }

      // Add 32x32 PNG as standard favicon.ico
      if (generatedSizes['favicon-32x32.png']) {
        zip.file('favicon.ico', generatedSizes['favicon-32x32.png'].blob);
      }

      // Add site.webmanifest
      zip.file('site.webmanifest', webmanifestContent);

      // Add HTML snippet instructions
      zip.file('README-INSTALL.html', `<!-- Paste these tags into your HTML <head> -->\n${htmlSnippet}`);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `toolstrum_favicon_package_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  return (
    <div className="space-y-6">
      {!previewUrl ? (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center bg-white dark:bg-slate-900/60 shadow-xs hover:border-emerald-500 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
            Upload Logo to Generate Website Favicon Set
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
            Generates standard 16×16, 32×32, 48×48, 180×180 Apple Touch, 192×192 & 512×512 Android PWA icons, site.webmanifest, and HTML tags.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 shadow-sm transition">
            <Globe className="w-4 h-4" />
            <span>Select Logo Image</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Stage (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Top Workspace Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>Simulated Browser Tab Preview</span>
              </span>

              <label className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Change Logo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Hidden Source Img */}
            <img
              ref={imageElementRef}
              src={previewUrl}
              alt="Source Logo"
              className="hidden"
              crossOrigin="anonymous"
            />

            {/* Simulated Desktop Chrome Browser Tab */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500" />
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                {/* Browser Tab Pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-t-lg bg-slate-800 border-t border-x border-slate-700 text-xs font-medium text-slate-200 max-w-[200px]">
                  {generatedSizes['favicon-16x16.png'] ? (
                    <img
                      src={generatedSizes['favicon-16x16.png'].url}
                      alt="16px Tab"
                      className="w-4 h-4 object-contain rounded-xs"
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="truncate">Your Website Tab</span>
                </div>
              </div>

              {/* Simulated Mobile iOS & Android Home Screen Icon */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Apple Touch Icon Preview */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  {generatedSizes['apple-touch-icon.png'] && (
                    <img
                      src={generatedSizes['apple-touch-icon.png'].url}
                      alt="Apple Touch Icon"
                      className="w-14 h-14 rounded-2xl shadow-lg border border-slate-700"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      <span>iOS Apple Touch</span>
                    </p>
                    <p className="text-[11px] text-slate-400">180 × 180 px Retina</p>
                  </div>
                </div>

                {/* Android PWA Icon Preview */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  {generatedSizes['android-chrome-192x192.png'] && (
                    <img
                      src={generatedSizes['android-chrome-192x192.png'].url}
                      alt="Android PWA"
                      className="w-14 h-14 rounded-2xl shadow-lg border border-slate-700"
                    />
                  )}
                  <div>
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-slate-400" />
                      <span>Android PWA</span>
                    </p>
                    <p className="text-[11px] text-slate-400">192 × 192 px PWA</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Bundle Breakdown Grid */}
            <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Generated Multi-Resolution Assets (Ready in Package)
              </span>
              <div className="grid grid-cols-3 gap-2">
                {FAVICON_SIZES.map((def) => {
                  const item = generatedSizes[def.name];
                  return (
                    <div
                      key={def.name}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-lg bg-slate-950 flex items-center justify-center border border-slate-700 flex-shrink-0">
                        {item && (
                          <img
                            src={item.url}
                            alt={def.name}
                            style={{
                              width: Math.min(28, def.size),
                              height: Math.min(28, def.size),
                            }}
                            className="object-contain"
                          />
                        )}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {def.size}×{def.size} px
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">{def.name}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Configuration Inspector Sidebar (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Customization Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>Background & Padding Styling</span>
              </h3>

              {/* Background Color */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Matte Background Fill
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { id: 'transparent', label: 'Transparent' },
                    { id: '#FFFFFF', label: 'White' },
                    { id: '#0F172A', label: 'Dark Navy' },
                    { id: '#10B981', label: 'Emerald' },
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setBgColor(bg.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        bgColor === bg.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Internal Padding */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Icon Edge Padding Margin</span>
                  <span className="text-emerald-600 font-bold">{paddingPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={paddingPercent}
                  onChange={(e) => setPaddingPercent(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Border Radius */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <span>Corner Rounding</span>
                  <span className="text-emerald-600 font-bold">
                    {borderRadius === 0 ? 'Square (0%)' : borderRadius === 50 ? 'Circle Avatar (50%)' : `${borderRadius}%`}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* HTML Link Tags Snippet Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-emerald-500" />
                  <span>HTML Header Snippet</span>
                </h3>
                <button
                  type="button"
                  onClick={copySnippet}
                  className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                >
                  {copiedHtml ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedHtml ? 'Copied! ✓' : 'Copy HTML'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-950 text-slate-300 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                {htmlSnippet}
              </pre>
            </div>

            {/* Download Action Card */}
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <button
                type="button"
                onClick={handleDownloadZip}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FileArchive className="w-4 h-4" />
                <span>Download Complete Favicon ZIP Package</span>
              </button>
              <p className="text-[11px] text-center text-slate-400">
                Includes all PNG sizes, favicon.ico, site.webmanifest, and README installation guide.
              </p>
            </div>

            {/* Offline Guarantee */}
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>100% Offline Generation. Your brand logo never touches any cloud server.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
