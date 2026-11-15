import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Download,
  Sparkles,
  Layers,
  Ruler,
  Scale,
  Thermometer,
  Square,
  Box,
  Gauge,
  Activity,
  HardDrive,
} from 'lucide-react';
import {
  UNIT_CATEGORIES,
  convertUnits,
  UnitConversionEntry,
} from './calcHelpers';

interface UnitConverterPanelProps {
  defaultCategory?: 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'pressure' | 'data_storage';
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  length: <Ruler className="w-4 h-4" />,
  weight: <Scale className="w-4 h-4" />,
  temperature: <Thermometer className="w-4 h-4" />,
  area: <Square className="w-4 h-4" />,
  volume: <Box className="w-4 h-4" />,
  speed: <Gauge className="w-4 h-4" />,
  pressure: <Activity className="w-4 h-4" />,
  data_storage: <HardDrive className="w-4 h-4" />,
};

export const UnitConverterPanel: React.FC<UnitConverterPanelProps> = ({
  defaultCategory = 'length',
}) => {
  const [category, setCategory] = useState<string>(defaultCategory);
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<string>(() => {
    return Object.keys(UNIT_CATEGORIES[defaultCategory]?.units || {})[0] || 'm';
  });
  const [copiedUnit, setCopiedUnit] = useState<string | null>(null);

  // When category changes, reset fromUnit to first available unit
  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    const available = Object.keys(UNIT_CATEGORIES[newCat]?.units || {});
    if (available.length > 0) {
      setFromUnit(available[0]);
    }
  };

  // Convert to all units in the selected category
  const conversions: UnitConversionEntry[] = useMemo(() => {
    return convertUnits(category, fromUnit, inputValue);
  }, [category, fromUnit, inputValue]);

  const handleCopy = (val: string, unitKey: string) => {
    navigator.clipboard.writeText(val);
    setCopiedUnit(unitKey);
    setTimeout(() => setCopiedUnit(null), 1500);
  };

  const handleDownloadCsv = () => {
    const csv = [
      'Unit,Label,Value,Formatted',
      ...conversions.map((c) => `"${c.unit}","${c.label}",${c.value},"${c.formatted}"`),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${category}-conversions.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentCatUnits = UNIT_CATEGORIES[category]?.units || {};

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {CATEGORY_ICONS[category] || <Ruler className="w-5 h-5" />}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              {category.replace('_', ' ')} Converter
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Universal offline metric and imperial conversion matrix with high numerical precision.
            </p>
          </div>
        </div>

        {/* Category Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          {Object.keys(UNIT_CATEGORIES).map((catKey) => (
            <button
              key={catKey}
              onClick={() => handleCategoryChange(catKey)}
              className={`px-2.5 py-1 rounded-md font-medium capitalize flex items-center gap-1.5 transition-colors ${
                category === catKey
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {CATEGORY_ICONS[catKey]}
              {catKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Input Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-6 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Value to Convert
          </label>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(parseFloat(e.target.value) || 0)}
            className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-lg font-bold font-mono focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-6 space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            From Unit
          </label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="w-full p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium focus:outline-none focus:border-amber-500"
          >
            {Object.entries(currentCatUnits).map(([key, def]) => (
              <option key={key} value={key}>
                {def.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* All Unit Conversions Matrix */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider">
            Equivalent Values Across {conversions.length} Standard Units
          </span>
          <button
            onClick={handleDownloadCsv}
            className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {conversions.map((conv) => {
            const isSource = conv.unit === fromUnit;
            const isCopied = copiedUnit === conv.unit;

            return (
              <div
                key={conv.unit}
                className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 ${
                  isSource
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-950 dark:text-amber-200'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {conv.label}
                  </span>
                  <button
                    onClick={() => handleCopy(String(conv.value), conv.unit)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
                    title="Copy value"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="min-h-[44px] flex items-center">
                  <p className="text-base font-bold font-mono text-slate-900 dark:text-white break-all select-all">
                    {conv.value.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>unit: {conv.unit}</span>
                  {isSource && <span className="text-amber-600 dark:text-amber-400 font-bold">(Source)</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
