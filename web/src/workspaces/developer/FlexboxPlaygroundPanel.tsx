import React, { useState, useMemo } from 'react';
import {
  Layout,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Sliders,
  Download,
  Eye,
  RefreshCw,
  Box,
  Layers,
  ArrowRight,
  ArrowDown
} from 'lucide-react';

interface FlexboxPlaygroundPanelProps {
  initialPreset?: string;
}

interface FlexItem {
  id: number;
  label: string;
  grow: number;
  shrink: number;
  alignSelf: 'auto' | 'flex-start' | 'center' | 'flex-end' | 'stretch';
  height?: number;
}

const PRESETS = [
  {
    name: 'Navbar Bar (Between)',
    direction: 'row' as const,
    justify: 'space-between' as const,
    align: 'center' as const,
    wrap: 'nowrap' as const,
    gap: 16,
    items: [
      { id: 1, label: 'Logo', grow: 0, shrink: 0, alignSelf: 'auto' as const },
      { id: 2, label: 'Nav Links', grow: 1, shrink: 1, alignSelf: 'auto' as const },
      { id: 3, label: 'User Profile', grow: 0, shrink: 0, alignSelf: 'auto' as const },
    ],
  },
  {
    name: 'Perfect Center (Hero / Modal)',
    direction: 'column' as const,
    justify: 'center' as const,
    align: 'center' as const,
    wrap: 'nowrap' as const,
    gap: 12,
    items: [
      { id: 1, label: 'Icon Header', grow: 0, shrink: 0, alignSelf: 'auto' as const },
      { id: 2, label: 'Title & Copy', grow: 0, shrink: 0, alignSelf: 'auto' as const },
      { id: 3, label: 'CTA Button', grow: 0, shrink: 0, alignSelf: 'auto' as const },
    ],
  },
  {
    name: 'Sidebar + Content Split',
    direction: 'row' as const,
    justify: 'flex-start' as const,
    align: 'stretch' as const,
    wrap: 'nowrap' as const,
    gap: 20,
    items: [
      { id: 1, label: 'Sidebar (fixed)', grow: 0, shrink: 0, alignSelf: 'auto' as const },
      { id: 2, label: 'Main Content (flex-grow)', grow: 1, shrink: 1, alignSelf: 'auto' as const },
    ],
  },
  {
    name: 'Auto-Wrapping Cards',
    direction: 'row' as const,
    justify: 'center' as const,
    align: 'center' as const,
    wrap: 'wrap' as const,
    gap: 16,
    items: [
      { id: 1, label: 'Card A', grow: 0, shrink: 0, alignSelf: 'auto' as const },
      { id: 2, label: 'Card B', grow: 0, shrink: 0, alignSelf: 'auto' as const },
      { id: 3, label: 'Card C', grow: 0, shrink: 0, alignSelf: 'auto' as const },
      { id: 4, label: 'Card D', grow: 0, shrink: 0, alignSelf: 'auto' as const },
    ],
  },
];

export const FlexboxPlaygroundPanel: React.FC<FlexboxPlaygroundPanelProps> = () => {
  const [direction, setDirection] = useState<'row' | 'column' | 'row-reverse' | 'column-reverse'>('row');
  const [justify, setJustify] = useState<'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'>('space-between');
  const [align, setAlign] = useState<'stretch' | 'flex-start' | 'center' | 'flex-end' | 'baseline'>('center');
  const [wrap, setWrap] = useState<'nowrap' | 'wrap' | 'wrap-reverse'>('nowrap');
  const [gap, setGap] = useState<number>(16);

  const [items, setItems] = useState<FlexItem[]>([
    { id: 1, label: 'Item 1', grow: 0, shrink: 1, alignSelf: 'auto' },
    { id: 2, label: 'Item 2', grow: 0, shrink: 1, alignSelf: 'auto' },
    { id: 3, label: 'Item 3', grow: 0, shrink: 1, alignSelf: 'auto' },
  ]);

  const [selectedItemId, setSelectedItemId] = useState<number>(1);
  const [previewTab, setPreviewTab] = useState<'css' | 'tailwind' | 'reactNative'>('css');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedItemId) || items[0];
  }, [items, selectedItemId]);

  const cssContainerSnippet = useMemo(() => {
    return `.flex-container {\n  display: flex;\n  flex-direction: ${direction};\n  justify-content: ${justify};\n  align-items: ${align};\n  flex-wrap: ${wrap};\n  gap: ${gap}px;\n}`;
  }, [direction, justify, align, wrap, gap]);

  const tailwindClasses = useMemo(() => {
    const dirClass =
      direction === 'row'
        ? 'flex-row'
        : direction === 'column'
        ? 'flex-col'
        : direction === 'row-reverse'
        ? 'flex-row-reverse'
        : 'flex-col-reverse';

    const justifyClass =
      justify === 'flex-start'
        ? 'justify-start'
        : justify === 'center'
        ? 'justify-center'
        : justify === 'flex-end'
        ? 'justify-end'
        : justify === 'space-between'
        ? 'justify-between'
        : justify === 'space-around'
        ? 'justify-around'
        : 'justify-evenly';

    const alignClass =
      align === 'stretch'
        ? 'items-stretch'
        : align === 'flex-start'
        ? 'items-start'
        : align === 'center'
        ? 'items-center'
        : align === 'flex-end'
        ? 'items-end'
        : 'items-baseline';

    const wrapClass = wrap === 'nowrap' ? 'flex-nowrap' : wrap === 'wrap' ? 'flex-wrap' : 'flex-wrap-reverse';

    return `flex ${dirClass} ${justifyClass} ${alignClass} ${wrapClass} gap-[${gap}px]`;
  }, [direction, justify, align, wrap, gap]);

  const reactNativeCode = useMemo(() => {
    return `const styles = StyleSheet.create({\n  container: {\n    display: 'flex',\n    flexDirection: '${direction}',\n    justifyContent: '${justify}',\n    alignItems: '${align}',\n    flexWrap: '${wrap}',\n    gap: ${gap},\n  },\n});`;
  }, [direction, justify, align, wrap, gap]);

  const handleAddItem = () => {
    if (items.length >= 8) return;
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const newItem: FlexItem = {
      id: nextId,
      label: `Item ${nextId}`,
      grow: 0,
      shrink: 1,
      alignSelf: 'auto',
    };
    setItems([...items, newItem]);
    setSelectedItemId(nextId);
  };

  const handleRemoveItem = (id: number) => {
    if (items.length <= 1) return;
    const filtered = items.filter((i) => i.id !== id);
    setItems(filtered);
    if (selectedItemId === id) setSelectedItemId(filtered[0].id);
  };

  const updateSelectedItem = (updates: Partial<FlexItem>) => {
    setItems(items.map((i) => (i.id === selectedItemId ? { ...i, ...updates } : i)));
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

  const loadPreset = (preset: typeof PRESETS[0]) => {
    setDirection(preset.direction);
    setJustify(preset.justify);
    setAlign(preset.align);
    setWrap(preset.wrap);
    setGap(preset.gap);
    setItems(preset.items);
    setSelectedItemId(preset.items[0].id);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold border border-sky-200/50 dark:border-sky-800/40">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Flexbox Playground &amp; Layout Architect
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 font-mono">
                100% Offline Client-Side
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive CSS &amp; React Native Flexbox builder with individual child overrides and responsive layout presets.
            </p>
          </div>
        </div>

        {/* Item count badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {items.length} Child Elements
          </span>
        </div>
      </div>

      {/* Preset Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Layout Presets:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.name}
            onClick={() => loadPreset(p)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-500 hover:text-sky-600 dark:hover:text-sky-400 transition-colors text-slate-700 dark:text-slate-300"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Container & Child Properties */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-sky-600" />
              Container Controls
            </h3>
            <button
              onClick={handleAddItem}
              disabled={items.length >= 8}
              className="px-2 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 text-xs font-semibold flex items-center gap-1 disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {/* Direction */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                flex-direction
              </label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              >
                <option value="row">row (horizontal ➔)</option>
                <option value="column">column (vertical ⬇)</option>
                <option value="row-reverse">row-reverse (horizontal ⬅)</option>
                <option value="column-reverse">column-reverse (vertical ⬆)</option>
              </select>
            </div>

            {/* Justify Content */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                justify-content (main-axis)
              </label>
              <select
                value={justify}
                onChange={(e) => setJustify(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              >
                <option value="flex-start">flex-start (start of container)</option>
                <option value="center">center (middle of container)</option>
                <option value="flex-end">flex-end (end of container)</option>
                <option value="space-between">space-between (equal distribution)</option>
                <option value="space-around">space-around (spaced edges)</option>
                <option value="space-evenly">space-evenly (uniform spacing)</option>
              </select>
            </div>

            {/* Align Items */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                align-items (cross-axis)
              </label>
              <select
                value={align}
                onChange={(e) => setAlign(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              >
                <option value="stretch">stretch (fill cross-axis)</option>
                <option value="flex-start">flex-start (cross-axis start)</option>
                <option value="center">center (cross-axis center)</option>
                <option value="flex-end">flex-end (cross-axis end)</option>
                <option value="baseline">baseline (text baseline align)</option>
              </select>
            </div>

            {/* Flex Wrap */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                flex-wrap
              </label>
              <select
                value={wrap}
                onChange={(e) => setWrap(e.target.value as any)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
              >
                <option value="nowrap">nowrap (single line)</option>
                <option value="wrap">wrap (multi-line overflow)</option>
                <option value="wrap-reverse">wrap-reverse (reverse multi-line)</option>
              </select>
            </div>

            {/* Gap Slider */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">gap</span>
                <span className="font-mono text-sky-600 dark:text-sky-400 font-bold">{gap}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="48"
                value={gap}
                onChange={(e) => setGap(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
            </div>

            {/* Selected Item Overrides */}
            {selectedItem && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider text-[11px]">
                    Selected: {selectedItem.label}
                  </span>
                  {items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(selectedItem.id)}
                      className="text-rose-500 hover:underline text-[11px]"
                    >
                      Delete
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-500 text-[10px] block mb-0.5">flex-grow</label>
                    <select
                      value={selectedItem.grow}
                      onChange={(e) => updateSelectedItem({ grow: Number(e.target.value) })}
                      className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                    >
                      <option value={0}>0 (Fixed)</option>
                      <option value={1}>1 (Expand)</option>
                      <option value={2}>2 (Double Expand)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 text-[10px] block mb-0.5">align-self</label>
                    <select
                      value={selectedItem.alignSelf}
                      onChange={(e) => updateSelectedItem({ alignSelf: e.target.value as any })}
                      className="w-full p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs"
                    >
                      <option value="auto">auto</option>
                      <option value="flex-start">flex-start</option>
                      <option value="center">center</option>
                      <option value="flex-end">flex-end</option>
                      <option value="stretch">stretch</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Interactive Canvas & Code Exporter */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-sky-500/30 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                Visual Flex Container
              </span>
              <span className="text-[11px] text-slate-400">
                Click any item to inspect its individual flex properties
              </span>
            </div>

            {/* Interactive Visual Canvas */}
            <div
              className="w-full min-h-[260px] p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-dashed border-slate-300 dark:border-slate-800 transition-all overflow-hidden"
              style={{
                display: 'flex',
                flexDirection: direction,
                justifyContent: justify,
                alignItems: align,
                flexWrap: wrap,
                gap: `${gap}px`,
              }}
            >
              {items.map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                    className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center font-bold text-xs select-none shadow-xs border ${
                      isSelected
                        ? 'bg-sky-600 text-white border-sky-400 ring-2 ring-sky-500/30 shadow-md scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-sky-300'
                    }`}
                    style={{
                      flexGrow: item.grow,
                      flexShrink: item.shrink,
                      alignSelf: item.alignSelf === 'auto' ? undefined : item.alignSelf,
                      minWidth: '90px',
                      minHeight: '60px',
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono opacity-70 mt-0.5">
                      grow:{item.grow}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Code Export Tabs */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
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
                    onClick={() => setPreviewTab('reactNative')}
                    className={`px-2.5 py-1 rounded-md transition-colors ${
                      previewTab === 'reactNative'
                        ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-2xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    React Native
                  </button>
                </div>

                <button
                  onClick={() =>
                    handleCopy(
                      previewTab,
                      previewTab === 'css'
                        ? cssContainerSnippet
                        : previewTab === 'tailwind'
                        ? tailwindClasses
                        : reactNativeCode
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

              <pre className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 whitespace-pre-wrap select-all leading-relaxed max-h-36 overflow-y-auto">
                {previewTab === 'css' && cssContainerSnippet}
                {previewTab === 'tailwind' && tailwindClasses}
                {previewTab === 'reactNative' && reactNativeCode}
              </pre>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
            Native flex layout compatible across CSS, React Native, and Tailwind CSS.
          </div>
        </div>
      </div>
    </div>
  );
};
