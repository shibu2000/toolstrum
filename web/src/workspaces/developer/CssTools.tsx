import React, { useState } from 'react';
import { Copy, Check, Plus, Trash2, Eye, Sparkles } from 'lucide-react';
import { hexToRgb, rgbToHsl, rgbToHex } from './devHelpers';

interface ToolProps {
  copied: boolean;
  onCopy: (text: string) => void;
}

// ========================================================
// 280 — COLOR CODE CONVERTER
// ========================================================
export const ColorConverterTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [hex, setHex] = useState('#3B82F6');

  const rgb = hexToRgb(hex) || { r: 59, g: 130, b: 246 };
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const rgbStr = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  const rgbaStr = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
  const hslStr = `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
  const hslaStr = `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">
          Color Picker & Hex Value
        </label>

        <div className="flex items-center gap-4">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-16 h-16 rounded-2xl cursor-pointer border-0 bg-transparent p-0"
          />
          <div className="flex-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">HEX Code</span>
            <input
              type="text"
              value={hex}
              onChange={(e) => setHex(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm text-slate-900 dark:text-white font-bold"
            />
          </div>
        </div>

        {/* Big Preview Swatch */}
        <div
          className="w-full h-28 rounded-2xl flex items-center justify-center font-bold text-sm shadow-inner transition-colors"
          style={{
            backgroundColor: hex,
            color: hsl.l > 55 ? '#0f172a' : '#ffffff',
          }}
        >
          {hex.toUpperCase()} • {rgbStr}
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
          Synchronized Color Representations
        </span>

        <div className="space-y-3">
          {[
            { label: 'HEX', val: hex.toUpperCase() },
            { label: 'RGB', val: rgbStr },
            { label: 'RGBA', val: rgbaStr },
            { label: 'HSL', val: hslStr },
            { label: 'HSLA', val: hslaStr },
          ].map((c) => (
            <div
              key={c.label}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-2">{c.label}:</span>
                <span className="font-mono text-xs text-slate-900 dark:text-white font-bold">{c.val}</span>
              </div>
              <button
                onClick={() => onCopy(c.val)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-sky-600 text-xs font-semibold flex items-center gap-1 shadow-2xs"
              >
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 281 — GRADIENT GENERATOR
// ========================================================
export const GradientGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [color1, setColor1] = useState('#4F46E5');
  const [color2, setColor2] = useState('#9333EA');
  const [color3, setColor3] = useState('#EC4899');
  const [angle, setAngle] = useState(135);
  const [useThreeColors, setUseThreeColors] = useState(true);

  const gradientCss = useThreeColors
    ? `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 50%, ${color3} 100%)`
    : `linear-gradient(${angle}deg, ${color1} 0%, ${color2} 100%)`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Gradient Controls
        </h3>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="font-medium text-slate-700 dark:text-slate-300">Angle</span>
            <span className="font-bold text-sky-600 dark:text-sky-400">{angle}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={angle}
            onChange={(e) => setAngle(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Stop 1</span>
            <input
              type="color"
              value={color1}
              onChange={(e) => setColor1(e.target.value)}
              className="w-full h-10 rounded-xl cursor-pointer p-0 bg-transparent border-0"
            />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Stop 2</span>
            <input
              type="color"
              value={color2}
              onChange={(e) => setColor2(e.target.value)}
              className="w-full h-10 rounded-xl cursor-pointer p-0 bg-transparent border-0"
            />
          </div>
          {useThreeColors && (
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Stop 3</span>
              <input
                type="color"
                value={color3}
                onChange={(e) => setColor3(e.target.value)}
                className="w-full h-10 rounded-xl cursor-pointer p-0 bg-transparent border-0"
              />
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useThreeColors}
              onChange={(e) => setUseThreeColors(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Use 3-Color Gradient</span>
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Live Preview & CSS
            </span>
            <button
              onClick={() => onCopy(`background: ${gradientCss};`)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy CSS</span>
            </button>
          </div>

          <div
            className="w-full h-36 rounded-2xl shadow-md transition-all mb-4"
            style={{ background: gradientCss }}
          />

          <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto">
            {`background: ${gradientCss};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 282 — BOX SHADOW GENERATOR
// ========================================================
export const BoxShadowTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(14);
  const [blur, setBlur] = useState(28);
  const [spread, setSpread] = useState(-6);
  const [color, setColor] = useState('#000000');
  const [opacity, setOpacity] = useState(25);
  const [inset, setInset] = useState(false);

  const rgb = hexToRgb(color) || { r: 0, g: 0, b: 0 };
  const shadowValue = `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity / 100})`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Box Shadow Sliders
        </h3>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Offset X: {x}px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={x}
            onChange={(e) => setX(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Offset Y: {y}px</span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            value={y}
            onChange={(e) => setY(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Blur: {blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span>Spread: {spread}px</span>
          </div>
          <input
            type="range"
            min="-30"
            max="50"
            value={spread}
            onChange={(e) => setSpread(Number(e.target.value))}
            className="w-full accent-sky-600"
          />
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-medium text-slate-700 dark:text-slate-300">Color:</span>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer p-0 bg-transparent border-0"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={inset}
              onChange={(e) => setInset(e.target.checked)}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Inset Shadow</span>
          </label>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Live Preview
            </span>
            <button
              onClick={() => onCopy(`box-shadow: ${shadowValue};`)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy CSS</span>
            </button>
          </div>

          <div className="p-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4">
            <div
              className="w-36 h-36 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300 transition-all"
              style={{ boxShadow: shadowValue }}
            >
              Card Preview
            </div>
          </div>

          <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto">
            {`box-shadow: ${shadowValue};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 283 — BORDER RADIUS GENERATOR
// ========================================================
export const BorderRadiusTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [tl, setTl] = useState(24);
  const [tr, setTr] = useState(24);
  const [br, setBr] = useState(8);
  const [bl, setBl] = useState(8);
  const [allEqual, setAllEqual] = useState(false);

  const handleAllChange = (v: number) => {
    setTl(v);
    setTr(v);
    setBr(v);
    setBl(v);
  };

  const radiusValue = `${tl}px ${tr}px ${br}px ${bl}px`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Corner Controls
          </h3>
          <label className="flex items-center gap-2 cursor-pointer text-xs select-none">
            <input
              type="checkbox"
              checked={allEqual}
              onChange={(e) => {
                setAllEqual(e.target.checked);
                if (e.target.checked) handleAllChange(tl);
              }}
              className="rounded accent-sky-600"
            />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Link All Corners</span>
          </label>
        </div>

        {allEqual ? (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span>All Corners: {tl}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={tl}
              onChange={(e) => handleAllChange(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="block mb-1 font-medium">Top-Left: {tl}px</span>
              <input
                type="range"
                min="0"
                max="100"
                value={tl}
                onChange={(e) => setTl(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <span className="block mb-1 font-medium">Top-Right: {tr}px</span>
              <input
                type="range"
                min="0"
                max="100"
                value={tr}
                onChange={(e) => setTr(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <span className="block mb-1 font-medium">Bottom-Left: {bl}px</span>
              <input
                type="range"
                min="0"
                max="100"
                value={bl}
                onChange={(e) => setBl(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
            <div>
              <span className="block mb-1 font-medium">Bottom-Right: {br}px</span>
              <input
                type="range"
                min="0"
                max="100"
                value={br}
                onChange={(e) => setBr(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Live Preview & CSS
            </span>
            <button
              onClick={() => onCopy(`border-radius: ${radiusValue};`)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy CSS</span>
            </button>
          </div>

          <div className="p-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center mb-4">
            <div
              className="w-36 h-36 bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-lg transition-all"
              style={{ borderRadius: radiusValue }}
            >
              Shape Preview
            </div>
          </div>

          <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto">
            {`border-radius: ${radiusValue};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 284 — FLEXBOX PLAYGROUND
// ========================================================
export const FlexboxPlaygroundTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [direction, setDirection] = useState<'row' | 'column' | 'row-reverse' | 'column-reverse'>('row');
  const [justify, setJustify] = useState<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>('space-between');
  const [align, setAlign] = useState<'stretch' | 'flex-start' | 'center' | 'flex-end'>('center');
  const [wrap, setWrap] = useState<'nowrap' | 'wrap'>('wrap');
  const [gap, setGap] = useState(16);
  const [items, setItems] = useState([1, 2, 3, 4]);

  const cssSnippet = `display: flex;
flex-direction: ${direction};
justify-content: ${justify};
align-items: ${align};
flex-wrap: ${wrap};
gap: ${gap}px;`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Flexbox Container Properties
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              flex-direction
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="row">row</option>
              <option value="column">column</option>
              <option value="row-reverse">row-reverse</option>
              <option value="column-reverse">column-reverse</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              justify-content
            </label>
            <select
              value={justify}
              onChange={(e) => setJustify(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="flex-start">flex-start</option>
              <option value="center">center</option>
              <option value="flex-end">flex-end</option>
              <option value="space-between">space-between</option>
              <option value="space-around">space-around</option>
              <option value="space-evenly">space-evenly</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              align-items
            </label>
            <select
              value={align}
              onChange={(e) => setAlign(e.target.value as any)}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="stretch">stretch</option>
              <option value="flex-start">flex-start</option>
              <option value="center">center</option>
              <option value="flex-end">flex-end</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span className="font-bold">gap: {gap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setItems([...items, items.length + 1])}
              className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 font-semibold text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Box</span>
            </button>
            <button
              onClick={() => items.length > 1 && setItems(items.slice(0, -1))}
              className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 text-rose-600 font-semibold text-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Visual Sandbox
            </span>
            <button
              onClick={() => onCopy(cssSnippet)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy CSS</span>
            </button>
          </div>

          <div
            className="w-full min-h-[220px] p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all overflow-auto"
            style={{
              display: 'flex',
              flexDirection: direction,
              justifyContent: justify,
              alignItems: align,
              flexWrap: wrap,
              gap: `${gap}px`,
            }}
          >
            {items.map((num) => (
              <div
                key={num}
                className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm shrink-0"
              >
                #{num}
              </div>
            ))}
          </div>
        </div>

        <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto leading-relaxed">
          {cssSnippet}
        </pre>
      </div>
    </div>
  );
};

// ========================================================
// 285 — CSS GRID GENERATOR
// ========================================================
export const GridGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [cols, setCols] = useState(3);
  const [rows, setRows] = useState(2);
  const [colGap, setColGap] = useState(16);
  const [rowGap, setRowGap] = useState(16);

  const cssSnippet = `display: grid;
grid-template-columns: repeat(${cols}, 1fr);
grid-template-rows: repeat(${rows}, 1fr);
gap: ${rowGap}px ${colGap}px;`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Grid Tracks & Spacing
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <span>Columns: {cols}</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={cols}
              onChange={(e) => setCols(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Rows: {rows}</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={rows}
              onChange={(e) => setRows(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Column Gap: {colGap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={colGap}
              onChange={(e) => setColGap(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <span>Row Gap: {rowGap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={rowGap}
              onChange={(e) => setRowGap(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>
        </div>
      </div>

      <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              CSS Grid Visualizer
            </span>
            <button
              onClick={() => onCopy(cssSnippet)}
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy CSS</span>
            </button>
          </div>

          <div
            className="w-full min-h-[220px] p-6 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 transition-all overflow-auto"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)`,
              gap: `${rowGap}px ${colGap}px`,
            }}
          >
            {Array.from({ length: cols * rows }).map((_, i) => (
              <div
                key={i}
                className="min-h-[64px] rounded-xl bg-sky-100/70 dark:bg-sky-950/60 border border-sky-300 dark:border-sky-800 flex items-center justify-center font-mono text-xs text-sky-800 dark:text-sky-300 font-bold"
              >
                Cell {i + 1}
              </div>
            ))}
          </div>
        </div>

        <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-900 dark:text-slate-100 overflow-x-auto leading-relaxed">
          {cssSnippet}
        </pre>
      </div>
    </div>
  );
};
