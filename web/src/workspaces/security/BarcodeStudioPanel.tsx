import React, { useState, useId } from 'react';
import {
  Download,
  Copy,
  Check,
  Sliders,
  Sparkles,
  RefreshCw,
  Barcode as BarcodeIcon,
} from 'lucide-react';
import {
  generateCode128Svg,
  generateEan13Svg,
  generateCode39Svg,
} from './securityHelpers';

interface BarcodeStudioPanelProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const BarcodeStudioPanel: React.FC<BarcodeStudioPanelProps> = ({
  copied = false,
  onCopy,
}) => {
  const [symbology, setSymbology] = useState<'code128' | 'ean13' | 'code39'>('code128');
  const [barcodeText, setBarcodeText] = useState('TOOLSTRUM-2026');
  const [barHeight, setBarHeight] = useState(80);
  const [showLabel, setShowLabel] = useState(true);
  const [barColor, setBarColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [svgCopied, setSvgCopied] = useState(false);

  // Switch presets when changing symbology
  const handleSymbologyChange = (sym: 'code128' | 'ean13' | 'code39') => {
    setSymbology(sym);
    if (sym === 'ean13') {
      setBarcodeText('590123412345'); // 12 digits -> computes 13th
    } else if (sym === 'code39') {
      setBarcodeText('TOOL-99');
    } else {
      setBarcodeText('TOOLSTRUM-2026');
    }
  };

  const getSvgMarkup = (): string => {
    switch (symbology) {
      case 'ean13':
        return generateEan13Svg(barcodeText, barHeight, showLabel, barColor, bgColor);
      case 'code39':
        return generateCode39Svg(barcodeText, barHeight, showLabel, barColor, bgColor);
      default:
        return generateCode128Svg(barcodeText, barHeight, showLabel, barColor, bgColor);
    }
  };

  const svgMarkup = getSvgMarkup();

  const handleDownloadSvg = () => {
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${symbology}-${barcodeText}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const img = new Image();
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const url = URLObject.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const pngUrl = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = pngUrl;
        a.download = `barcode-${symbology}-${barcodeText}.png`;
        a.click();
      }
      URLObject.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopySvgMarkup = () => {
    navigator.clipboard.writeText(svgMarkup);
    setSvgCopied(true);
    setTimeout(() => setSvgCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Configuration Form: 7 cols */}
      <div className="lg:col-span-7 space-y-5">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <BarcodeIcon className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                1D Barcode Symbology (Tool #361)
              </h3>
            </div>
            <div className="flex gap-1">
              {[
                { id: 'code128', label: 'Code 128' },
                { id: 'ean13', label: 'EAN-13' },
                { id: 'code39', label: 'Code 39' },
              ].map((sym) => (
                <button
                  key={sym.id}
                  onClick={() => handleSymbologyChange(sym.id as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                    symbology === sym.id
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sym.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              {symbology === 'ean13' ? '12 or 13 Digits (GTIN/EAN)' : 'Barcode Alphanumeric Value'}
            </label>
            <input
              type="text"
              value={barcodeText}
              onChange={(e) => setBarcodeText(symbology === 'ean13' ? e.target.value.replace(/\D/g, '') : e.target.value.toUpperCase())}
              placeholder={symbology === 'ean13' ? 'e.g. 590123412345' : 'e.g. PRODUCT-100'}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-bold font-mono uppercase"
            />
            {symbology === 'ean13' && (
              <p className="text-[11px] text-slate-400 mt-1">
                EAN-13 computes the final 13th modulo-10 checksum digit automatically.
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Bar Color</label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <input
                  type="color"
                  value={barColor}
                  onChange={(e) => setBarColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={barColor}
                  onChange={(e) => setBarColor(e.target.value)}
                  className="w-20 text-xs font-mono font-bold uppercase bg-transparent border-0 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Background Color</label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-20 text-xs font-mono font-bold uppercase bg-transparent border-0 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>Bar Height</span>
              <span className="font-mono text-teal-600">{barHeight}px</span>
            </div>
            <input
              type="range"
              min="40"
              max="160"
              value={barHeight}
              onChange={(e) => setBarHeight(Number(e.target.value))}
              className="w-full accent-teal-600 cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showLabel}
              onChange={(e) => setShowLabel(e.target.checked)}
              className="rounded accent-teal-600"
            />
            <span>Include Human-Readable Value Text Label</span>
          </label>
        </div>
      </div>

      {/* Rendered Barcode Preview: 5 cols */}
      <div className="lg:col-span-5 space-y-4">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md flex flex-col items-center justify-center text-center space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
            High Precision Vector Barcode
          </span>

          <div
            className="p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full overflow-x-auto flex items-center justify-center max-w-sm"
            style={{ backgroundColor: bgColor }}
            dangerouslySetInnerHTML={{ __html: svgMarkup }}
          />

          <div className="w-full grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadSvg}
              className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Vector SVG
            </button>
            <button
              onClick={handleDownloadPng}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" /> PNG Image
            </button>
          </div>

          <div className="w-full flex gap-2">
            <button
              onClick={handleCopySvgMarkup}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {svgCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{svgCopied ? 'SVG Copied to Clipboard' : 'Copy SVG Markup'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
