import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Sliders,
  Palette,
  Eye,
  CheckCircle2,
  XCircle,
  Layers,
  Sun,
  Moon,
  Contrast,
  RefreshCw
} from 'lucide-react';
import { hexToRgb, rgbToHsl, rgbToHex } from './devHelpers';

interface ColorConverterPanelProps {
  initialHex?: string;
}

const PRESET_COLORS = [
  { name: 'Tailwind Sky', hex: '#0EA5E9' },
  { name: 'Emerald Forest', hex: '#10B981' },
  { name: 'Vibrant Violet', hex: '#8B5CF6' },
  { name: 'Rose Coral', hex: '#F43F5E' },
  { name: 'Amber Gold', hex: '#F59E0B' },
  { name: 'Indigo Night', hex: '#6366F1' },
  { name: 'Teal Lagoon', hex: '#14B8A6' },
  { name: 'Dark Slate', hex: '#1E293B' },
];

export const ColorConverterPanel: React.FC<ColorConverterPanelProps> = ({
  initialHex = '#3B82F6',
}) => {
  const [hexInput, setHexInput] = useState<string>(initialHex);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Normalize hex
  const cleanHex = useMemo(() => {
    let raw = hexInput.trim();
    if (!raw.startsWith('#')) raw = '#' + raw;
    if (/^#[0-9a-fA-F]{3}$/.test(raw)) {
      raw = '#' + raw[1] + raw[1] + raw[2] + raw[2] + raw[3] + raw[3];
    }
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) return raw.toUpperCase();
    return '#3B82F6';
  }, [hexInput]);

  const rgb = useMemo(() => {
    return hexToRgb(cleanHex) || { r: 59, g: 130, b: 246 };
  }, [cleanHex]);

  const hsl = useMemo(() => {
    return rgbToHsl(rgb.r, rgb.g, rgb.b);
  }, [rgb]);

  // CMYK calculation
  const cmyk = useMemo(() => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
    const c = Math.round(((1 - r - k) / (1 - k)) * 100);
    const m = Math.round(((1 - g - k) / (1 - k)) * 100);
    const y = Math.round(((1 - b - k) / (1 - k)) * 100);
    return { c, m, y, k: Math.round(k * 100) };
  }, [rgb]);

  // HSV / HSB calculation
  const hsv = useMemo(() => {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    const s = max === 0 ? 0 : d / max;
    const v = max;

    if (max !== min) {
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100),
    };
  }, [rgb]);

  // Relative Luminance & WCAG Contrast calculation
  const contrastData = useMemo(() => {
    const getLuminance = (r: number, g: number, b: number) => {
      const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
    };

    const lColor = getLuminance(rgb.r, rgb.g, rgb.b);
    const lWhite = 1.0;
    const lBlack = 0.0;

    const ratioWhite = (lWhite + 0.05) / (lColor + 0.05);
    const ratioBlack = (lColor + 0.05) / (lBlack + 0.05);

    const vsWhite = Math.max(ratioWhite, 1 / ratioWhite);
    const vsBlack = Math.max(ratioBlack, 1 / ratioBlack);

    return {
      whiteRatio: vsWhite.toFixed(2),
      blackRatio: vsBlack.toFixed(2),
      whiteAa: vsWhite >= 4.5,
      whiteAaa: vsWhite >= 7.0,
      blackAa: vsBlack >= 4.5,
      blackAaa: vsBlack >= 7.0,
    };
  }, [rgb]);

  // Harmonies (Complementary, Analogous, Triadic, Shades)
  const harmonies = useMemo(() => {
    const hslToHexStr = (h: number, s: number, l: number): string => {
      h = (h % 360 + 360) % 360;
      s /= 100;
      l /= 100;
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
      const m = l - c / 2;
      let r = 0, g = 0, b = 0;
      if (h < 60) { r = c; g = x; }
      else if (h < 120) { r = x; g = c; }
      else if (h < 180) { g = c; b = x; }
      else if (h < 240) { g = x; b = c; }
      else if (h < 300) { r = x; b = c; }
      else { r = c; b = x; }
      return rgbToHex(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)).toUpperCase();
    };

    return {
      complementary: hslToHexStr(hsl.h + 180, hsl.s, hsl.l),
      analogous1: hslToHexStr(hsl.h - 30, hsl.s, hsl.l),
      analogous2: hslToHexStr(hsl.h + 30, hsl.s, hsl.l),
      triadic1: hslToHexStr(hsl.h + 120, hsl.s, hsl.l),
      triadic2: hslToHexStr(hsl.h + 240, hsl.s, hsl.l),
      tint: hslToHexStr(hsl.h, hsl.s, Math.min(100, hsl.l + 20)),
      shade: hslToHexStr(hsl.h, hsl.s, Math.max(0, hsl.l - 20)),
    };
  }, [hsl]);

  const handleCopy = async (key: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      // fallback
    }
  };

  const formats = [
    { label: 'HEX', value: cleanHex },
    { label: 'HEX8 (Alpha)', value: `${cleanHex}FF` },
    { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: 'RGBA', value: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
    { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)` },
    { label: 'HSV / HSB', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
    { label: 'CMYK (Print)', value: `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)` },
    { label: 'Tailwind Class', value: `bg-[${cleanHex}]` },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl shadow-xs border border-white/20 flex items-center justify-center font-bold text-white transition-colors"
            style={{ backgroundColor: cleanHex }}
          >
            <Palette className="w-5 h-5 drop-shadow-xs" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Color Code Converter &amp; Contrast Analyzer
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronized HEX, RGB, HSL, HSV, CMYK color spaces with WCAG 2.1 accessibility auditing and harmony palette generator.
            </p>
          </div>
        </div>

        {/* Live Swatch Pill */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span
            className="px-3 py-1 rounded-xl font-bold shadow-2xs border border-slate-200 dark:border-slate-700"
            style={{
              backgroundColor: cleanHex,
              color: hsl.l > 55 ? '#0f172a' : '#ffffff',
            }}
          >
            {cleanHex}
          </span>
        </div>
      </div>

      {/* Preset Color Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Presets:
        </span>
        {PRESET_COLORS.map((c) => (
          <button
            key={c.hex}
            onClick={() => setHexInput(c.hex)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400 dark:hover:border-slate-600 transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 dark:border-white/10"
              style={{ backgroundColor: c.hex }}
            />
            {c.name}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Interactive Picker & WCAG Auditing */}
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
              Color Picker &amp; Input
            </label>

            <div className="flex items-center gap-4">
              <input
                type="color"
                value={cleanHex}
                onChange={(e) => setHexInput(e.target.value)}
                className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent p-0 shrink-0"
              />
              <div className="flex-1 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold">
                  HEX Code (Any CSS Color)
                </span>
                <input
                  type="text"
                  value={hexInput}
                  onChange={(e) => setHexInput(e.target.value)}
                  placeholder="#3B82F6"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-base text-slate-900 dark:text-white font-bold focus:outline-hidden focus:ring-2 focus:ring-sky-500/20"
                />
              </div>
            </div>

            {/* Large Preview Canvas */}
            <div
              className="w-full h-28 rounded-2xl flex flex-col items-center justify-center font-bold text-sm shadow-inner transition-colors border border-black/5 dark:border-white/5"
              style={{
                backgroundColor: cleanHex,
                color: hsl.l > 55 ? '#0f172a' : '#ffffff',
              }}
            >
              <span className="font-mono text-lg">{cleanHex}</span>
              <span className="text-xs font-medium opacity-80">
                rgb({rgb.r}, {rgb.g}, {rgb.b}) • hsl({hsl.h}, {hsl.s}%, {hsl.l}%)
              </span>
            </div>

            {/* WCAG 2.1 Accessibility Audit */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Contrast className="w-3.5 h-3.5 text-sky-600" />
                  WCAG 2.1 Contrast Ratios
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* On White */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" /> On White
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {contrastData.whiteRatio}:1
                    </span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        contrastData.whiteAa
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      AA {contrastData.whiteAa ? '✓' : '✗'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        contrastData.whiteAaa
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      AAA {contrastData.whiteAaa ? '✓' : '✗'}
                    </span>
                  </div>
                </div>

                {/* On Black */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                      <Moon className="w-3 h-3 text-indigo-400" /> On Black
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      {contrastData.blackRatio}:1
                    </span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        contrastData.blackAa
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      AA {contrastData.blackAa ? '✓' : '✗'}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        contrastData.blackAaa
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      AAA {contrastData.blackAaa ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Color Harmonies Palette */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block">
                Harmonies &amp; Palette Swatches
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {[
                  { label: 'Base', hex: cleanHex },
                  { label: 'Comp', hex: harmonies.complementary },
                  { label: 'Analog 1', hex: harmonies.analogous1 },
                  { label: 'Analog 2', hex: harmonies.analogous2 },
                  { label: 'Triad 1', hex: harmonies.triadic1 },
                  { label: 'Tint', hex: harmonies.tint },
                  { label: 'Shade', hex: harmonies.shade },
                ].map((swatch, idx) => (
                  <button
                    key={idx}
                    onClick={() => setHexInput(swatch.hex)}
                    className="p-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:scale-105 transition-transform flex flex-col items-center gap-1 group"
                    title={`Click to load ${swatch.label} (${swatch.hex})`}
                  >
                    <div
                      className="w-full h-8 rounded-lg shadow-2xs border border-black/10 dark:border-white/10"
                      style={{ backgroundColor: swatch.hex }}
                    />
                    <span className="text-[9px] font-medium text-slate-500 truncate w-full text-center">
                      {swatch.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Synchronized Formats Table */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block border-b border-slate-200 dark:border-slate-800 pb-3 mb-3">
              Synchronized Code Representations
            </span>

            <div className="space-y-2.5">
              {formats.map((fmt) => (
                <div
                  key={fmt.label}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-sky-300 dark:hover:border-sky-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 w-24">
                      {fmt.label}:
                    </span>
                    <span className="font-mono text-xs text-slate-900 dark:text-white font-bold select-all">
                      {fmt.value}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(fmt.label, fmt.value)}
                    className="px-2 py-0.5 rounded text-xs font-semibold text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 flex items-center gap-1 transition-colors"
                  >
                    {copiedKey === fmt.label ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedKey === fmt.label ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span>Click any value to copy to clipboard.</span>
            <span className="font-mono">Web, React Native &amp; CSS Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
