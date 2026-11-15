import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Copy,
  Check,
  Plus,
  Trash2,
  Download,
  ArrowRight,
  RotateCw,
  Sliders,
  Layers,
  Palette,
  Eye,
  RefreshCw
} from 'lucide-react';

interface GradientGeneratorPanelProps {
  initialType?: 'linear' | 'radial' | 'conic';
}

interface ColorStop {
  id: string;
  color: string;
  position: number;
}

const PRESET_GRADIENTS = [
  {
    name: 'Hyper Horizon',
    type: 'linear' as const,
    angle: 135,
    stops: [
      { id: '1', color: '#0EA5E9', position: 0 },
      { id: '2', color: '#6366F1', position: 50 },
      { id: '3', color: '#EC4899', position: 100 },
    ],
  },
  {
    name: 'Sunset Glow',
    type: 'linear' as const,
    angle: 90,
    stops: [
      { id: '1', color: '#F59E0B', position: 0 },
      { id: '2', color: '#EF4444', position: 50 },
      { id: '3', color: '#8B5CF6', position: 100 },
    ],
  },
  {
    name: 'Emerald Matrix',
    type: 'linear' as const,
    angle: 180,
    stops: [
      { id: '1', color: '#10B981', position: 0 },
      { id: '2', color: '#064E3B', position: 100 },
    ],
  },
  {
    name: 'Deep Space Radial',
    type: 'radial' as const,
    angle: 0,
    stops: [
      { id: '1', color: '#38BDF8', position: 0 },
      { id: '2', color: '#1E1B4B', position: 70 },
      { id: '3', color: '#020617', position: 100 },
    ],
  },
  {
    name: 'Conic Spectrum',
    type: 'conic' as const,
    angle: 45,
    stops: [
      { id: '1', color: '#F43F5E', position: 0 },
      { id: '2', color: '#FBBF24', position: 33 },
      { id: '3', color: '#38BDF8', position: 66 },
      { id: '4', color: '#F43F5E', position: 100 },
    ],
  },
  {
    name: 'Neon Violet',
    type: 'linear' as const,
    angle: 45,
    stops: [
      { id: '1', color: '#A855F7', position: 0 },
      { id: '2', color: '#3B82F6', position: 100 },
    ],
  },
];

export const GradientGeneratorPanel: React.FC<GradientGeneratorPanelProps> = ({
  initialType = 'linear',
}) => {
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>(initialType);
  const [angle, setAngle] = useState<number>(135);
  const [stops, setStops] = useState<ColorStop[]>([
    { id: '1', color: '#4F46E5', position: 0 },
    { id: '2', color: '#9333EA', position: 50 },
    { id: '3', color: '#EC4899', position: 100 },
  ]);
  const [previewTab, setPreviewTab] = useState<'css' | 'tailwind' | 'react' | 'svg'>('css');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Compute CSS background string
  const cssBackground = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const stopStr = sorted.map((s) => `${s.color} ${s.position}%`).join(', ');

    if (type === 'radial') {
      return `radial-gradient(circle at center, ${stopStr})`;
    }
    if (type === 'conic') {
      return `conic-gradient(from ${angle}deg at 50% 50%, ${stopStr})`;
    }
    return `linear-gradient(${angle}deg, ${stopStr})`;
  }, [type, angle, stops]);

  const tailwindClass = useMemo(() => {
    return `bg-[${cssBackground.replace(/\s+/g, '_')}]`;
  }, [cssBackground]);

  const reactStyleCode = useMemo(() => {
    return `const gradientStyle: React.CSSProperties = {\n  background: '${cssBackground}',\n};`;
  }, [cssBackground]);

  const svgCode = useMemo(() => {
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    return `<svg width="100%" height="100%">\n  <defs>\n    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">\n${sorted
      .map((s) => `      <stop offset="${s.position}%" stop-color="${s.color}" />`)
      .join('\n')}\n    </linearGradient>\n  </defs>\n  <rect width="100%" height="100%" fill="url(#grad)" />\n</svg>`;
  }, [stops]);

  const handleAddStop = () => {
    if (stops.length >= 6) return;
    const sorted = [...stops].sort((a, b) => a.position - b.position);
    const lastPos = sorted[sorted.length - 1].position;
    const secondLastPos = sorted.length > 1 ? sorted[sorted.length - 2].position : 0;
    const midPos = Math.round((lastPos + secondLastPos) / 2);

    const newStop: ColorStop = {
      id: Date.now().toString(),
      color: '#06B6D4',
      position: midPos,
    };
    setStops([...stops, newStop]);
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 2) return;
    setStops(stops.filter((s) => s.id !== id));
  };

  const updateStop = (id: string, updates: Partial<ColorStop>) => {
    setStops(stops.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

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

  const loadPreset = (preset: typeof PRESET_GRADIENTS[0]) => {
    setType(preset.type);
    setAngle(preset.angle);
    setStops(preset.stops);
  };

  const handleDownload = () => {
    const cssText = `/* Generated by Toolstrum Offline CSS Suite */\n.custom-gradient {\n  background: ${cssBackground};\n}\n`;
    const blob = new Blob([cssText], { type: 'text/css;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gradient.css';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl shadow-xs border border-white/20 flex items-center justify-center font-bold text-white transition-all"
            style={{ background: cssBackground }}
          >
            <Sparkles className="w-5 h-5 drop-shadow-xs" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              CSS Gradient Studio &amp; Code Generator
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-stop Linear, Radial, and Conic CSS gradients with live canvas rendering, Tailwind classes, and SVG exporter.
            </p>
          </div>
        </div>

        {/* Type Switcher */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
          {(['linear', 'radial', 'conic'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                type === t
                  ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
          <Palette className="w-3.5 h-3.5 text-amber-500" /> Designer Presets:
        </span>
        {PRESET_GRADIENTS.map((p) => (
          <button
            key={p.name}
            onClick={() => loadPreset(p)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 transition-colors flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
          >
            <span
              className="w-2.5 h-2.5 rounded-full inline-block border border-black/10 dark:border-white/10"
              style={{
                background: `linear-gradient(135deg, ${p.stops[0].color}, ${p.stops[p.stops.length - 1].color})`,
              }}
            />
            {p.name}
          </button>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Controls & Color Stops */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              Gradient Parameters
            </h3>
            {type !== 'radial' && (
              <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
                {angle}°
              </span>
            )}
          </div>

          {/* Angle Slider (Linear / Conic) */}
          {type !== 'radial' && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {type === 'conic' ? 'Starting Angle' : 'Direction Angle'}
                </span>
                <span className="font-mono text-slate-400">{angle}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              {/* Quick Angle Direction Buttons for Linear */}
              {type === 'linear' && (
                <div className="grid grid-cols-8 gap-1 pt-1">
                  {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                    <button
                      key={deg}
                      onClick={() => setAngle(deg)}
                      className={`py-1 text-[11px] rounded-lg border font-mono transition-all ${
                        angle === deg
                          ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {deg}°
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Color Stops Manager */}
          <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Color Stops ({stops.length} of 6)
              </span>
              <button
                onClick={handleAddStop}
                disabled={stops.length >= 6}
                className="px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900 text-sky-600 dark:text-sky-400 text-xs font-semibold flex items-center gap-1 border border-sky-200 dark:border-sky-800 transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Stop</span>
              </button>
            </div>

            <div className="space-y-2">
              {stops.map((stop, idx) => (
                <div
                  key={stop.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center gap-3"
                >
                  <span className="text-[10px] font-mono text-slate-400 w-4">
                    #{idx + 1}
                  </span>

                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                    className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent p-0 shrink-0"
                  />

                  <input
                    type="text"
                    value={stop.color}
                    onChange={(e) => updateStop(stop.id, { color: e.target.value })}
                    className="w-20 px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white uppercase"
                  />

                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop.position}
                      onChange={(e) =>
                        updateStop(stop.id, { position: Number(e.target.value) })
                      }
                      className="w-full accent-sky-600"
                    />
                    <span className="font-mono text-xs text-slate-500 w-10 text-right">
                      {stop.position}%
                    </span>
                  </div>

                  {stops.length > 2 && (
                    <button
                      onClick={() => handleRemoveStop(stop.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove color stop"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live Interactive Canvas & Code Exporter */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Live Preview &amp; Canvas
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Download CSS"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Big Gradient Canvas */}
            <div
              className="w-full h-44 rounded-2xl shadow-inner transition-all flex items-center justify-center p-4 border border-black/5 dark:border-white/5"
              style={{ background: cssBackground }}
            >
              <div className="px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border border-white/20 shadow-md text-slate-900 dark:text-white font-mono text-xs font-bold text-center">
                {type.toUpperCase()} GRADIENT
              </div>
            </div>

            {/* Code Export Tabs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium">
                  <button
                    onClick={() => setPreviewTab('css')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'css'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    CSS Rule
                  </button>
                  <button
                    onClick={() => setPreviewTab('tailwind')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'tailwind'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Tailwind CSS
                  </button>
                  <button
                    onClick={() => setPreviewTab('react')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'react'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    React Style
                  </button>
                  <button
                    onClick={() => setPreviewTab('svg')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'svg'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    SVG Defs
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      previewTab,
                      previewTab === 'css'
                        ? `background: ${cssBackground};`
                        : previewTab === 'tailwind'
                        ? tailwindClass
                        : previewTab === 'react'
                        ? reactStyleCode
                        : svgCode
                    )
                  }
                  className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  {copiedKey === previewTab ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === previewTab ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap break-all select-all leading-relaxed max-h-36 overflow-y-auto">
                {previewTab === 'css' && `background: ${cssBackground};`}
                {previewTab === 'tailwind' && tailwindClass}
                {previewTab === 'react' && reactStyleCode}
                {previewTab === 'svg' && svgCode}
              </pre>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            Hardware-accelerated CSS rendering across all modern web browsers.
          </div>
        </div>
      </div>
    </div>
  );
};
