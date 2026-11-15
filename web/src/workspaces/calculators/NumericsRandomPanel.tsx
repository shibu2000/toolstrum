import React, { useState, useMemo } from 'react';
import {
  Hash,
  Dice5,
  Shuffle,
  FileText,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  integerToEnglish,
  numberToWordsWithCurrency,
  toRomanNumeral,
  fromRomanNumeral,
} from './calcHelpers';

interface NumericsRandomPanelProps {
  defaultSubTool?: 'base' | 'words' | 'roman' | 'random' | 'dice';
}

export const NumericsRandomPanel: React.FC<NumericsRandomPanelProps> = ({
  defaultSubTool = 'base',
}) => {
  const [activeTab, setActiveTab] = useState<'base' | 'words' | 'roman' | 'random' | 'dice'>(defaultSubTool);
  const [copied, setCopied] = useState(false);

  // 1. Number System Converter State
  const [baseVal, setBaseVal] = useState<string>('255');
  const [inputRadix, setInputRadix] = useState<number>(10);

  const baseResult = useMemo(() => {
    try {
      const clean = baseVal.trim();
      if (!clean) return { bin: '', oct: '', dec: '', hex: '', error: '' };
      const parsed = parseInt(clean, inputRadix);
      if (isNaN(parsed)) return { bin: '', oct: '', dec: '', hex: '', error: 'Invalid number for radix' };

      return {
        bin: parsed.toString(2).padStart(8, '0'),
        oct: parsed.toString(8),
        dec: parsed.toString(10),
        hex: parsed.toString(16).toUpperCase(),
        error: '',
      };
    } catch {
      return { bin: '', oct: '', dec: '', hex: '', error: 'Parsing error' };
    }
  }, [baseVal, inputRadix]);

  // 2. Number to Words State
  const [wordNum, setWordNum] = useState<number>(1250450.75);
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'GBP' | 'INR'>('USD');
  const wordsResult = useMemo(() => {
    return {
      cardinal: integerToEnglish(wordNum),
      currency: numberToWordsWithCurrency(wordNum, currency),
    };
  }, [wordNum, currency]);

  // 3. Roman Numeral Converter State
  const [romanInput, setRomanInput] = useState<string>('MMXXV');
  const [arabicInput, setArabicInput] = useState<number>(2025);

  const romanResult = useMemo(() => {
    let toArabic = '';
    let toRoman = '';
    try {
      toArabic = String(fromRomanNumeral(romanInput));
    } catch (e: any) {
      toArabic = `[Error: ${e.message}]`;
    }
    try {
      toRoman = toRomanNumeral(arabicInput);
    } catch (e: any) {
      toRoman = `[Error: ${e.message}]`;
    }
    return { toArabic, toRoman };
  }, [romanInput, arabicInput]);

  // 4. Random Number Generator State
  const [rngMin, setRngMin] = useState<number>(1);
  const [rngMax, setRngMax] = useState<number>(100);
  const [rngCount, setRngCount] = useState<number>(5);
  const [rngUnique, setRngUnique] = useState<boolean>(true);
  const [rngResults, setRngResults] = useState<number[]>([7, 23, 42, 68, 91]);

  const handleGenerateRng = () => {
    const min = Math.min(rngMin, rngMax);
    const max = Math.max(rngMin, rngMax);
    const range = max - min + 1;
    const count = rngUnique ? Math.min(rngCount, range) : rngCount;

    if (rngUnique) {
      const set = new Set<number>();
      while (set.size < count) {
        const r = Math.floor(Math.random() * range) + min;
        set.add(r);
      }
      setRngResults(Array.from(set));
    } else {
      const res: number[] = [];
      for (let i = 0; i < count; i++) {
        res.push(Math.floor(Math.random() * range) + min);
      }
      setRngResults(res);
    }
  };

  // 5. Dice Roller State
  const [diceSides, setDiceSides] = useState<number>(6);
  const [diceCount, setDiceCount] = useState<number>(2);
  const [diceRolls, setDiceRolls] = useState<number[]>([4, 6]);

  const handleRollDice = () => {
    const rolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      rolls.push(Math.floor(Math.random() * diceSides) + 1);
    }
    setDiceRolls(rolls);
  };

  const handleCopy = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {activeTab === 'dice' ? <Dice5 className="w-5 h-5" /> : <Hash className="w-5 h-5" />}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Numerics, Number Bases, Roman & Random Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Convert base 2-16 number systems, render numbers to English words, bidirectional Roman numerals, CSPRNG, and multi-sided dice.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          {[
            { id: 'base', label: 'Base Converter' },
            { id: 'words', label: 'Number to Words' },
            { id: 'roman', label: 'Roman Numerals' },
            { id: 'random', label: 'RNG Generator' },
            { id: 'dice', label: 'Dice Roller' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* 1. BASE CONVERTER */}
      {activeTab === 'base' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-slate-500 uppercase">Input Radix:</span>
            <div className="flex items-center gap-1.5">
              {[
                { r: 2, label: 'Binary (Base 2)' },
                { r: 8, label: 'Octal (Base 8)' },
                { r: 10, label: 'Decimal (Base 10)' },
                { r: 16, label: 'Hex (Base 16)' },
              ].map((rdx) => (
                <button
                  key={rdx.r}
                  onClick={() => setInputRadix(rdx.r)}
                  className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                    inputRadix === rdx.r
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {rdx.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={baseVal}
              onChange={(e) => setBaseVal(e.target.value)}
              className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-sm"
              placeholder="Enter number..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Decimal (Base 10)', val: baseResult.dec },
              { label: 'Hexadecimal (Base 16)', val: baseResult.hex },
              { label: 'Binary (Base 2)', val: baseResult.bin },
              { label: 'Octal (Base 8)', val: baseResult.oct },
            ].map((item) => (
              <div
                key={item.label}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase">{item.label}</span>
                  <button
                    onClick={() => handleCopy(item.val)}
                    className="text-xs text-slate-400 hover:text-amber-500"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xl font-bold font-mono text-slate-900 dark:text-white break-all select-all">
                  {item.val || '0'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. NUMBER TO WORDS */}
      {activeTab === 'words' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Number Input</label>
              <input
                type="number"
                step="0.01"
                value={wordNum}
                onChange={(e) => setWordNum(parseFloat(e.target.value) || 0)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-base"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Currency Format</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
              >
                <option value="USD">USD ($) Dollars & Cents</option>
                <option value="EUR">EUR (€) Euros & Cents</option>
                <option value="GBP">GBP (£) Pounds & Pence</option>
                <option value="INR">INR (₹) Rupees & Paise</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Formal Currency Phrasing</span>
              <p className="text-base font-bold text-amber-600 dark:text-amber-400 select-all">
                {wordsResult.currency}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <span className="text-[11px] font-semibold text-slate-400 uppercase">Cardinal Integer Words</span>
              <p className="text-base font-bold text-slate-800 dark:text-slate-200 select-all">
                {wordsResult.cardinal}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. ROMAN NUMERALS */}
      {activeTab === 'roman' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase block">Roman to Arabic</label>
            <input
              type="text"
              value={romanInput}
              onChange={(e) => setRomanInput(e.target.value.toUpperCase())}
              placeholder="e.g. MMXXV"
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-lg"
            />
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                {romanResult.toArabic}
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-semibold text-slate-500 uppercase block">Arabic to Roman</label>
            <input
              type="number"
              min={1}
              max={3999}
              value={arabicInput}
              onChange={(e) => setArabicInput(parseInt(e.target.value) || 1)}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-lg"
            />
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
                {romanResult.toRoman}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. RNG GENERATOR */}
      {activeTab === 'random' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Min Value</label>
              <input
                type="number"
                value={rngMin}
                onChange={(e) => setRngMin(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Max Value</label>
              <input
                type="number"
                value={rngMax}
                onChange={(e) => setRngMax(parseInt(e.target.value) || 100)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Count of Numbers</label>
              <input
                type="number"
                min={1}
                max={50}
                value={rngCount}
                onChange={(e) => setRngCount(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
              />
            </div>
            <div className="flex flex-col justify-end">
              <button
                onClick={handleGenerateRng}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-1.5"
              >
                <Shuffle className="w-4 h-4" /> Generate
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 justify-center pt-2">
            {rngResults.map((val, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 font-mono font-black text-xl"
              >
                {val}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 5. DICE ROLLER */}
      {activeTab === 'dice' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-2">
            {[4, 6, 8, 10, 12, 20, 100].map((s) => (
              <button
                key={s}
                onClick={() => setDiceSides(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                  diceSides === s
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                D{s}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-center gap-4">
            <span className="text-xs font-semibold text-slate-500">Dice Count:</span>
            <input
              type="number"
              min={1}
              max={10}
              value={diceCount}
              onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
              className="w-16 p-1.5 rounded border border-slate-200 dark:border-slate-700 text-center font-bold"
            />
            <button
              onClick={handleRollDice}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-1.5"
            >
              <Dice5 className="w-4 h-4" /> Roll
            </button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {diceRolls.map((r, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl font-mono shadow-md"
              >
                {r}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500">
            Total Sum: <strong className="text-amber-600 text-base font-mono">{diceRolls.reduce((a, b) => a + b, 0)}</strong>
          </p>
        </div>
      )}
    </div>
  );
};
