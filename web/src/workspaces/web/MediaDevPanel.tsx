import React, { useState, useRef } from 'react';
import {
  FileCode,
  Smartphone,
  Tablet,
  Monitor,
  Copy,
  Check,
  Upload,
  Download,
  ExternalLink,
} from 'lucide-react';
import { generateDataUri } from './webHelpers';

interface MediaDevPanelProps {
  defaultMode?: 'datauri' | 'screenshot';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const MediaDevPanel: React.FC<MediaDevPanelProps> = ({
  defaultMode = 'datauri',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'datauri' | 'screenshot'>(defaultMode);

  // 396: Data URI Generator
  const [rawText, setRawText] = useState('<h1>Hello Toolstrum</h1>\n<p>Offline zero-knowledge Data URI.</p>');
  const [mimeType, setMimeType] = useState('text/html');
  const [generatedUri, setGeneratedUri] = useState<string>(() => generateDataUri(rawText, mimeType));
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (text: string, mime: string) => {
    setRawText(text);
    setMimeType(mime);
    setGeneratedUri(generateDataUri(text, mime));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setGeneratedUri(result);
      setMimeType(file.type || 'application/octet-stream');
    };
    reader.readAsDataURL(file);
  };

  // 398: Webpage Screenshot & Viewport Simulator
  const [viewportUrl, setViewportUrl] = useState('https://toolstrum.vercel.app');
  const [deviceMode, setDeviceMode] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  const getViewportDimensions = () => {
    switch (deviceMode) {
      case 'mobile':
        return { width: '375px', height: '667px', label: 'Mobile (375 × 667)' };
      case 'tablet':
        return { width: '768px', height: '600px', label: 'Tablet (768 × 600)' };
      default:
        return { width: '100%', height: '500px', label: 'Desktop Viewport' };
    }
  };

  const dim = getViewportDimensions();

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('datauri')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'datauri'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" />
          <span>Data URI Generator (Tool #396)</span>
        </button>

        <button
          onClick={() => setActiveTab('screenshot')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'screenshot'
              ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Viewport Simulator & Screenshot (Tool #398)</span>
        </button>
      </div>

      {/* 396: Data URI */}
      {activeTab === 'datauri' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Content to Encode into Data URI</h3>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">MIME Type</label>
              <select
                value={mimeType}
                onChange={(e) => handleTextChange(rawText, e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
              >
                <option value="text/html">text/html</option>
                <option value="text/plain">text/plain</option>
                <option value="text/css">text/css</option>
                <option value="application/json">application/json</option>
                <option value="image/svg+xml">image/svg+xml</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Raw Text Payload</label>
              <textarea
                value={rawText}
                onChange={(e) => handleTextChange(e.target.value, mimeType)}
                rows={6}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs leading-relaxed"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <input type="file" ref={fileRef} onChange={handleFileUpload} className="hidden" />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" /> Encode Binary File from Disk
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Base64 Data URI Scheme
              </span>
              {onCopy && (
                <button
                  onClick={() => onCopy(generatedUri)}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy URI</span>
                </button>
              )}
            </div>

            <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-[11px] overflow-x-auto max-h-[300px] break-all whitespace-pre-wrap leading-relaxed text-slate-900 dark:text-white">
              {generatedUri}
            </pre>
          </div>
        </div>
      )}

      {/* 398: Viewport Simulator */}
      {activeTab === 'screenshot' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex-1 min-w-[240px]">
              <input
                type="text"
                value={viewportUrl}
                onChange={(e) => setViewportUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono font-bold"
              />
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setDeviceMode('mobile')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  deviceMode === 'mobile' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> Mobile
              </button>
              <button
                onClick={() => setDeviceMode('tablet')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  deviceMode === 'tablet' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Tablet className="w-3.5 h-3.5" /> Tablet
              </button>
              <button
                onClick={() => setDeviceMode('desktop')}
                className={`p-2 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer ${
                  deviceMode === 'desktop' ? 'bg-white dark:bg-slate-700 text-teal-600 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" /> Desktop
              </button>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-x-auto min-h-[500px]">
            <div
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300 dark:border-slate-700 transition-all duration-300 flex flex-col"
              style={{ width: dim.width, height: dim.height }}
            >
              <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 border-b text-[11px] font-mono font-bold text-slate-500 flex justify-between items-center">
                <span>{dim.label}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <iframe
                title="Viewport Simulator"
                src={viewportUrl}
                sandbox="allow-scripts allow-same-origin"
                className="w-full flex-1 border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
