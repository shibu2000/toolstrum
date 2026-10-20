import React, { useState } from 'react';
import { Copy, Check, Download, Share2, Sparkles } from 'lucide-react';

interface ResultCardProps {
  title?: string;
  subtitle?: string;
  primaryValue?: string | number;
  content?: string;
  blob?: Blob;
  downloadFilename?: string;
  stats?: Array<{ label: string; value: string | number }>;
  accentColor?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title = 'Processed Result',
  subtitle = 'Computed locally in your browser',
  primaryValue,
  content,
  blob,
  downloadFilename = 'result.txt',
  stats,
  accentColor = '#625BFF',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!content && !primaryValue) return;
    const textToCopy = content || String(primaryValue);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (content) {
      const textBlob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(textBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: accentColor }}
            />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {(content || primaryValue) && (
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}

          {(blob || content) && (
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all cursor-pointer shadow-xs hover:opacity-95"
              style={{ backgroundColor: accentColor }}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {primaryValue !== undefined && (
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-100 dark:border-slate-800">
          <p className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {primaryValue}
          </p>
        </div>
      )}

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
            >
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
                {s.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {content && (
        <div className="relative">
          <pre className="max-h-60 overflow-y-auto p-3.5 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed border border-slate-800 select-all whitespace-pre-wrap break-all">
            {content}
          </pre>
        </div>
      )}
    </div>
  );
};
