import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Smile,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Type,
  Sparkles,
  Sliders,
  Image as ImageIcon,
  RotateCcw,
  Layers,
} from 'lucide-react';

export interface MemeGeneratorPanelProps {
  accentColor?: string;
}

interface MemeTemplate {
  id: string;
  name: string;
  url: string;
  defaultTop: string;
  defaultBottom: string;
}

// Built-in lightweight SVG/Canvas templates for 100% offline meme generation
const MEME_TEMPLATES: MemeTemplate[] = [
  {
    id: 'custom',
    name: 'Upload Custom Photo',
    url: '',
    defaultTop: 'TOP CAPTION',
    defaultBottom: 'BOTTOM CAPTION',
  },
  {
    id: 'drake',
    name: 'Drake Disapproves / Approves',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><rect width="600" height="300" fill="%23E2E8F0"/><rect y="300" width="600" height="300" fill="%23CBD5E1"/><text x="140" y="160" font-family="sans-serif" font-size="44" text-anchor="middle">🙅‍♂️ Dislike</text><text x="140" y="460" font-family="sans-serif" font-size="44" text-anchor="middle">👉 Like</text><line x1="280" y1="0" x2="280" y2="600" stroke="%2394A3B8" stroke-width="4"/><line x1="0" y1="300" x2="600" y2="300" stroke="%2394A3B8" stroke-width="4"/></svg>',
    defaultTop: 'CLOUD SERVERS',
    defaultBottom: '100% LOCAL PROCESSING',
  },
  {
    id: 'buttons',
    name: 'Two Buttons Dilemma',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="500" viewBox="0 0 600 500"><rect width="600" height="500" fill="%231E293B"/><rect x="80" y="100" width="180" height="120" rx="20" fill="%23EF4444"/><rect x="340" y="100" width="180" height="120" rx="20" fill="%233B82F6"/><text x="300" y="400" fill="%23FFFFFF" font-family="sans-serif" font-size="40" text-anchor="middle">😰 Intense Sweating</text></svg>',
    defaultTop: 'WHICH BUTTON TO PRESS?',
    defaultBottom: 'FAST LOCAL UTILITY',
  },
  {
    id: 'success',
    name: 'Success Kid / Achievement',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600"><radialGradient id="bg" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%2360A5FA"/><stop offset="100%" stop-color="%231E3A8A"/></radialGradient><rect width="600" height="600" fill="url(%23bg)"/><text x="300" y="320" font-family="sans-serif" font-size="90" text-anchor="middle">✊👶</text></svg>',
    defaultTop: 'UPLOADED SENSITIVE DOCUMENT',
    defaultBottom: 'NEVER LEFT MY COMPUTER',
  },
];

export const MemeGeneratorPanel: React.FC<MemeGeneratorPanelProps> = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<MemeTemplate>(MEME_TEMPLATES[1]);
  const [file, setFile] = useState<File | null>(null);
  const [customImageUrl, setCustomImageUrl] = useState<string | null>(null);

  // Text state
  const [topText, setTopText] = useState<string>(selectedTemplate.defaultTop);
  const [bottomText, setBottomText] = useState<string>(selectedTemplate.defaultBottom);
  const [allCaps, setAllCaps] = useState<boolean>(true);
  const [fontSize, setFontSize] = useState<number>(42);
  const [fontColor, setFontColor] = useState<string>('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [strokeWidth, setStrokeWidth] = useState<number>(4);

  // Export
  const [exportFormat, setExportFormat] = useState<'png' | 'webp' | 'jpeg'>('jpeg');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const loadedImgRef = useRef<HTMLImageElement | null>(null);

  // Template change
  const handleSelectTemplate = (template: MemeTemplate) => {
    setSelectedTemplate(template);
    if (template.id !== 'custom') {
      setTopText(template.defaultTop);
      setBottomText(template.defaultBottom);
    }
  };

  // Upload custom photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const uploaded = e.target.files[0];
    const url = URL.createObjectURL(uploaded);
    setFile(uploaded);
    setCustomImageUrl(url);
    setSelectedTemplate(MEME_TEMPLATES[0]);
    e.target.value = '';
  };

  // Render meme on canvas
  const renderMemeCanvas = useCallback(
    (targetCanvas: HTMLCanvasElement) => {
      const img = loadedImgRef.current;
      if (!img) return;
      const ctx = targetCanvas.getContext('2d');
      if (!ctx) return;

      const w = img.naturalWidth || 600;
      const h = img.naturalHeight || 600;
      targetCanvas.width = w;
      targetCanvas.height = h;

      // Draw image
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      // Setup typography
      ctx.font = `900 ${fontSize}px Impact, "Arial Black", sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillStyle = fontColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth * 2;
      ctx.lineJoin = 'round';
      ctx.textBaseline = 'top';

      const formatText = (t: string) => (allCaps ? t.toUpperCase() : t);

      // Top caption
      if (topText.trim()) {
        const text = formatText(topText);
        ctx.strokeText(text, w / 2, 20);
        ctx.fillText(text, w / 2, 20);
      }

      // Bottom caption
      if (bottomText.trim()) {
        const text = formatText(bottomText);
        ctx.textBaseline = 'bottom';
        ctx.strokeText(text, w / 2, h - 20);
        ctx.fillText(text, w / 2, h - 20);
      }
    },
    [
      topText,
      bottomText,
      allCaps,
      fontSize,
      fontColor,
      strokeColor,
      strokeWidth,
    ]
  );

  // Sync canvas preview when inputs change
  useEffect(() => {
    const currentSrc =
      selectedTemplate.id === 'custom' ? customImageUrl : selectedTemplate.url;
    if (!currentSrc || !canvasRef.current) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImgRef.current = img;
      if (canvasRef.current) {
        renderMemeCanvas(canvasRef.current);
      }
    };
    img.src = currentSrc;
  }, [selectedTemplate, customImageUrl, renderMemeCanvas]);

  // Download Meme
  const handleDownload = () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    try {
      const mime =
        exportFormat === 'png'
          ? 'image/png'
          : exportFormat === 'webp'
          ? 'image/webp'
          : 'image/jpeg';
      canvasRef.current.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `meme_${selectedTemplate.id}_${Date.now()}.${exportFormat}`;
            link.click();
            URL.revokeObjectURL(url);
          }
          setIsProcessing(false);
        },
        mime,
        0.95
      );
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Visual Stage (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Workspace Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smile className="w-4 h-4 text-emerald-500" />
              <span>Interactive Meme Canvas</span>
            </span>

            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer transition">
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Canvas Preview Area */}
          <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800 flex items-center justify-center min-h-[440px] overflow-hidden select-none">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[500px] object-contain rounded-lg shadow-xl block select-none"
            />
          </div>

          {/* Preset Templates Picker */}
          <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white block">
              Choose Blank Meme Template
            </span>
            <div className="grid grid-cols-4 gap-2">
              {MEME_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-2 rounded-xl border text-center transition ${
                    selectedTemplate.id === tpl.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:bg-emerald-950/40 dark:text-emerald-200 font-bold'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <p className="text-xs truncate">{tpl.name}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Configuration Inspector Sidebar (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Typography & Text Inputs */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-500" />
              <span>Meme Headlines & Captions</span>
            </h3>

            {/* Top Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Top Headline
              </label>
              <input
                type="text"
                value={topText}
                onChange={(e) => setTopText(e.target.value)}
                placeholder="TOP CAPTION"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold font-mono outline-none"
              />
            </div>

            {/* Bottom Text */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Bottom Headline
              </label>
              <input
                type="text"
                value={bottomText}
                onChange={(e) => setBottomText(e.target.value)}
                placeholder="BOTTOM CAPTION"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold font-mono outline-none"
              />
            </div>

            {/* Font Size & Colors */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Font Size</span>
                  <span className="text-emerald-600 font-bold">{fontSize}px</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="72"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Text Color Swatches */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Text Color
                  </label>
                  <div className="flex items-center gap-1.5">
                    {['#FFFFFF', '#FACC15', '#38BDF8', '#000000'].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFontColor(color)}
                        style={{ backgroundColor: color }}
                        className={`w-6 h-6 rounded-full border-2 transition ${
                          fontColor === color ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer pt-3">
                  <input
                    type="checkbox"
                    checked={allCaps}
                    onChange={(e) => setAllCaps(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-emerald-600 accent-emerald-500"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    ALL CAPS Lock
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Export Action Card */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-500" />
              <span>Export Format</span>
            </h3>

            <div className="grid grid-cols-3 gap-2">
              {(['jpeg', 'png', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setExportFormat(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold transition ${
                    exportFormat === fmt
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleDownload}
              disabled={isProcessing}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download Meme ({exportFormat.toUpperCase()})</span>
            </button>
          </div>

          {/* Offline Guarantee */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>100% Offline Generation. Memes are rendered directly in your browser canvas.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
