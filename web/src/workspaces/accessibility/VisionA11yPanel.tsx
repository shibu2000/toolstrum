import React, { useState, useRef, useEffect } from 'react';
import {
  Maximize2,
  Sun,
  Eye,
  Sliders,
  Check,
  X,
  Pipette,
  Copy,
  Sparkles,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface ToolProps {
  toolId: number;
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const VisionA11yPanel: React.FC<ToolProps> = ({ toolId, onCopy }) => {
  // 451: Magnifier
  const [magnifierOn, setMagnifierOn] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [magnifierError, setMagnifierError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 452: Flashlight
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [torchColor, setTorchColor] = useState('#FFFFFF');

  // 453, 455, 456: Color, Contrast, Blindness
  const [fgColor, setFgColor] = useState('#1E293B');
  const [bgColor, setBgColor] = useState('#F8FAFC');
  const [colorBlindFilter, setColorBlindFilter] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'>('none');

  // 454: Text Size Preview
  const [previewFontSize, setPreviewFontSize] = useState(18);
  const [previewLineHeight, setPreviewLineHeight] = useState(1.6);
  const [isDyslexiaFont, setIsDyslexiaFont] = useState(false);

  // Magnifier Camera logic
  const startMagnifier = async () => {
    setMagnifierError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
      });
      streamRef.current = stream;
      setMagnifierOn(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch {
      setMagnifierError('Unable to access camera. Check device permissions or ensure no other app is using it.');
    }
  };

  const stopMagnifier = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setMagnifierOn(false);
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Contrast Calculation
  const getLuminance = (hex: string) => {
    const cleanHex = hex.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    const a = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const lum1 = getLuminance(fgColor);
  const lum2 = getLuminance(bgColor);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const contrastRatio = Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));

  // Eyedropper API
  const pickScreenColor = async () => {
    if ('EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        setFgColor(result.sRGBHex);
      } catch {
        // User cancelled picker
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* 451: MAGNIFIER */}
      {toolId === 451 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Maximize2 className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Camera Magnifier & Macro Lens
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Uses your device camera as a live magnifying glass for small print, component labels, and fine text.
            </p>

            {magnifierOn ? (
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden bg-black aspect-video relative shadow-inner">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/60 text-white font-mono text-xs font-bold backdrop-blur-md">
                    {zoomLevel.toFixed(1)}x Zoom
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Magnification Scale</span>
                    <span className="font-bold font-mono text-slate-800 dark:text-slate-200">
                      {zoomLevel.toFixed(1)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    step="0.1"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(Number(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={stopMagnifier}
                  className="w-full py-3 rounded-2xl text-white font-bold text-xs bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer shadow-sm"
                >
                  Stop Magnifier Camera
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {magnifierError && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium border border-rose-200 dark:border-rose-900">
                    {magnifierError}
                  </div>
                )}
                <button
                  onClick={startMagnifier}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Launch Camera Magnifier
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 452: FLASHLIGHT */}
      {toolId === 452 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-center">
            <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sun className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Ultra-Bright Screen Torch & Flashlight
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Transforms your display into an emergency full-screen light source for low-light environments.
            </p>

            <div className="flex items-center justify-center gap-3">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Color Tone:</span>
              <div className="flex gap-2">
                {[
                  ['#FFFFFF', 'Daylight White'],
                  ['#FFFBEB', 'Warm Amber'],
                  ['#EF4444', 'Red Night-Vision'],
                ].map(([color, label]) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setTorchColor(color)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      torchColor === color
                        ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                    style={{ backgroundColor: color, color: color === '#EF4444' ? '#fff' : '#000' }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setFlashlightOn(true)}
              className="w-full py-4 rounded-2xl text-white font-extrabold text-sm bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              Activate Full-Screen Light
            </button>
          </div>

          {flashlightOn && (
            <div
              className="fixed inset-0 z-50 flex items-end justify-center pb-12 cursor-pointer transition-all animate-in fade-in"
              style={{ backgroundColor: torchColor }}
              onClick={() => setFlashlightOn(false)}
            >
              <span className="px-4 py-2 rounded-full bg-black/70 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                Tap anywhere to turn off torch
              </span>
            </div>
          )}
        </div>
      )}

      {/* 453: SCREEN COLOR PICKER */}
      {toolId === 453 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Pipette className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Screen Color Eyedropper & Palette Tool
                </h3>
              </div>
              {'EyeDropper' in window && (
                <button
                  type="button"
                  onClick={pickScreenColor}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold text-xs transition-all"
                >
                  <Pipette className="w-3.5 h-3.5" />
                  Pick From Screen
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Palette Swatch
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-11 h-11 rounded-2xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Quick Actions
                </label>
                <button
                  type="button"
                  onClick={() => onCopy && onCopy(fgColor.toUpperCase())}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy HEX Value
                </button>
              </div>
            </div>

            <div
              className="p-10 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-inner"
              style={{ backgroundColor: fgColor }}
            >
              <span className="font-mono text-xs font-bold px-4 py-2 rounded-xl bg-black/60 text-white backdrop-blur-md shadow-md">
                HEX {fgColor.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 454: TEXT SIZE PREVIEW */}
      {toolId === 454 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Sliders className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Typography Scale & Legibility Inspector
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between mb-1 text-slate-500">
                  <span>Font Size: {previewFontSize}px</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="42"
                  value={previewFontSize}
                  onChange={(e) => setPreviewFontSize(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-slate-500">
                  <span>Line Height: {previewLineHeight}x</span>
                </div>
                <input
                  type="range"
                  min="1.2"
                  max="2.5"
                  step="0.1"
                  value={previewLineHeight}
                  onChange={(e) => setPreviewLineHeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200 text-xs">
              <input
                type="checkbox"
                checked={isDyslexiaFont}
                onChange={(e) => setIsDyslexiaFont(e.target.checked)}
                className="w-4 h-4 accent-indigo-600 rounded-sm"
              />
              <span>Enable High-Contrast Dyslexia-Friendly Serif Spacing</span>
            </label>

            <div
              className={`p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white ${
                isDyslexiaFont ? 'font-serif tracking-wider' : 'font-sans'
              }`}
              style={{ fontSize: `${previewFontSize}px`, lineHeight: previewLineHeight }}
            >
              <p>
                Accessible typographic design empowers all readers. Adjusting letter size, line spacing, and font weight reduces cognitive fatigue and enhances reading speed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 455: CONTRAST CHECKER */}
      {toolId === 455 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              WCAG 2.1 Contrast Ratio Evaluator
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Text (Foreground)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Surface (Background)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <div
              className="p-6 rounded-2xl border transition-all text-center space-y-2 shadow-sm"
              style={{ backgroundColor: bgColor, color: fgColor }}
            >
              <p className="text-xl font-bold">The quick brown fox jumps</p>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                Sample body text rendered at standard 14px size to test legibility.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-500/30 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Computed Contrast Ratio
              </span>
              <div className="text-5xl font-black text-slate-900 dark:text-white mt-1">
                {contrastRatio} : 1
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  WCAG AA Normal Text (≥ 4.5:1)
                </span>
                <span className={`font-bold flex items-center gap-1 ${contrastRatio >= 4.5 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {contrastRatio >= 4.5 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {contrastRatio >= 4.5 ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  WCAG AA Large Text (≥ 3.0:1)
                </span>
                <span className={`font-bold flex items-center gap-1 ${contrastRatio >= 3.0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {contrastRatio >= 3.0 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {contrastRatio >= 3.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  WCAG AAA Normal Text (≥ 7.0:1)
                </span>
                <span className={`font-bold flex items-center gap-1 ${contrastRatio >= 7.0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {contrastRatio >= 7.0 ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {contrastRatio >= 7.0 ? 'PASS' : 'FAIL'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 456: COLOR BLINDNESS SIMULATOR */}
      {toolId === 456 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Color Vision Deficiency Simulation
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Foreground Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400 block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs uppercase"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select Vision Condition
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                {[
                  { id: 'none', label: 'Normal' },
                  { id: 'protanopia', label: 'Protanopia' },
                  { id: 'deuteranopia', label: 'Deuteranopia' },
                  { id: 'tritanopia', label: 'Tritanopia' },
                  { id: 'achromatopsia', label: 'Monochrome' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setColorBlindFilter(f.id as any)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold transition-all ${
                      colorBlindFilter === f.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className={`p-6 rounded-2xl border transition-all text-center space-y-2 ${
                colorBlindFilter === 'achromatopsia' ? 'grayscale' : ''
              }`}
              style={{ backgroundColor: bgColor, color: fgColor }}
            >
              <p className="text-xl font-bold">Simulated Display Sample</p>
              <p className="text-xs max-w-sm mx-auto leading-relaxed">
                Color combinations should retain distinguishable luminance contrast even under severe red-green or blue-yellow deficiencies.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
