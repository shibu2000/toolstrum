import React, { useState, useRef } from 'react';
import {
  FileCode,
  Upload,
  Copy,
  Check,
  Monitor,
  Tablet,
  Smartphone,
  Download,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 396 — DATA URI GENERATOR
// ========================================================
export const DataUriGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [dataUri, setDataUri] = useState('');
  const [fileName, setFileName] = useState('');
  const [mimeType, setMimeType] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMimeType(file.type || 'application/octet-stream');

    const reader = new FileReader();
    reader.onload = (ev) => {
      setDataUri(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">File to Data URI</h3>

        <div className="p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3">
          <FileCode className="w-10 h-10 mx-auto text-teal-600 dark:text-teal-400" />
          <p className="text-xs text-slate-500">Upload an icon, image, font, or script to encode</p>
          <input type="file" ref={fileRef} onChange={handleFile} className="hidden" />
          <button
            onClick={() => fileRef.current?.click()}
            className="px-5 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md"
          >
            Browse File
          </button>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
            Base64 Data URI
          </span>
          {onCopy && dataUri && (
            <button
              onClick={() => onCopy(dataUri)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy Data URI</span>
            </button>
          )}
        </div>

        {dataUri ? (
          <textarea
            readOnly
            value={dataUri}
            rows={10}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-[11px] break-all leading-relaxed"
          />
        ) : (
          <p className="text-xs text-slate-400 text-center py-12">Upload a file on the left to see its Data URI string.</p>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 398 — WEBPAGE SCREENSHOT / RESPONSIVE SIMULATOR
// ========================================================
export const WebpageScreenshotTool: React.FC<ToolProps> = () => {
  const [targetUrl, setTargetUrl] = useState('https://toolstrum.vercel.app');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const widths = {
    desktop: 'w-full h-80',
    tablet: 'w-[520px] h-80',
    mobile: 'w-[320px] h-96',
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-500 block mb-1">Target Webpage URL</label>
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-mono font-bold"
            />
          </div>

          <div className="flex gap-1.5 self-end sm:self-auto bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setDevice('desktop')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${device === 'desktop' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <Monitor className="w-3.5 h-3.5" /> Desktop
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${device === 'tablet' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <Tablet className="w-3.5 h-3.5" /> Tablet
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${device === 'mobile' ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              <Smartphone className="w-3.5 h-3.5" /> Mobile
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center overflow-x-auto">
        <iframe
          title="Viewport Simulator"
          src={targetUrl}
          className={`bg-white rounded-2xl border shadow-lg transition-all duration-300 ${widths[device]}`}
        />
      </div>
    </div>
  );
};
