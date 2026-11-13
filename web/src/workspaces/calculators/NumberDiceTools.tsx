import React, { useState } from 'react';
import {
  Dice1,
  Dice5,
  Dices,
  Shuffle,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';
import {
  integerToEnglish,
  numberToWordsWithCurrency,
  toRomanNumeral,
  fromRomanNumeral,
} from './calcHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 340 — NUMBER TO WORDS
// ========================================================
export const NumberToWordsTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [numInput, setNumInput] = useState(12540.75);
  const [format, setFormat] = useState<'plain' | 'USD' | 'EUR' | 'GBP' | 'INR'>('plain');

  let outputWords = '';
  try {
    if (format === 'plain') {
      const isNeg = numInput < 0;
      const abs = Math.abs(numInput);
      const intPart = Math.floor(abs);
      const decPart = Math.round((abs - intPart) * 100);
      let res = `${isNeg ? 'Negative ' : ''}${integerToEnglish(intPart)}`;
      if (decPart > 0) res += ` point ${integerToEnglish(decPart)}`;
      outputWords = res;
    } else {
      outputWords = numberToWordsWithCurrency(numInput, format);
    }
  } catch (e: any) {
    outputWords = e.message;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Numeric Value</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Enter a Number</label>
          <input
            type="number"
            step="any"
            value={numInput}
            onChange={(e) => setNumInput(Number(e.target.value))}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-base font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Output Format</label>
          <div className="grid grid-cols-5 gap-1.5 text-xs font-bold">
            {(['plain', 'USD', 'EUR', 'GBP', 'INR'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`py-2 rounded-xl uppercase ${
                  format === fmt ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            English Words
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(outputWords)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          )}
        </div>

        <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
          {outputWords}
        </p>
      </div>
    </div>
  );
};

// ========================================================
// 341 — ROMAN NUMERAL CONVERTER
// ========================================================
export const RomanNumeralTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [direction, setDirection] = useState<'arabicToRoman' | 'romanToArabic'>('arabicToRoman');
  const [arabicVal, setArabicVal] = useState(2026);
  const [romanVal, setRomanVal] = useState('MMXXVI');
  const [error, setError] = useState('');

  const handleArabicChange = (val: number) => {
    setArabicVal(val);
    setError('');
    try {
      setRomanVal(toRomanNumeral(val));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleRomanChange = (str: string) => {
    setRomanVal(str);
    setError('');
    try {
      setArabicVal(fromRomanNumeral(str));
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Conversion Direction</h3>
          <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setDirection('arabicToRoman')}
              className={`px-2.5 py-1 rounded-lg ${direction === 'arabicToRoman' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              123 → Roman
            </button>
            <button
              onClick={() => setDirection('romanToArabic')}
              className={`px-2.5 py-1 rounded-lg ${direction === 'romanToArabic' ? 'bg-amber-500 text-white' : 'text-slate-600 dark:text-slate-400'}`}
            >
              Roman → 123
            </button>
          </div>
        </div>

        {direction === 'arabicToRoman' ? (
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              Arabic Integer (1 to 3,999)
            </label>
            <input
              type="number"
              min="1"
              max="3999"
              value={arabicVal}
              onChange={(e) => handleArabicChange(Number(e.target.value))}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xl font-bold font-mono"
            />
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">
              Roman Numeral (e.g. MCMLXXXIV)
            </label>
            <input
              type="text"
              value={romanVal}
              onChange={(e) => handleRomanChange(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xl font-bold font-mono uppercase"
            />
          </div>
        )}

        {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{error}</div>}
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Converted Result
          </span>
          {onCopy && !error && (
            <button
              onClick={() => onCopy(direction === 'arabicToRoman' ? romanVal : String(arabicVal))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          )}
        </div>

        <div>
          <div className="text-4xl sm:text-5xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-wider break-all">
            {direction === 'arabicToRoman' ? romanVal : arabicVal}
          </div>
        </div>

        {/* Reference Symbols Table */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Standard Symbols:</span>
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs">
            {[
              ['I', 1],
              ['V', 5],
              ['X', 10],
              ['L', 50],
              ['C', 100],
              ['D', 500],
              ['M', 1000],
            ].map(([sym, val]) => (
              <div key={sym} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800">
                <span className="font-bold text-slate-900 dark:text-white block">{sym}</span>
                <span className="text-[10px] text-slate-400">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 342 — RANDOM NUMBER GENERATOR
// ========================================================
export const RandomNumberGeneratorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(5);
  const [unique, setUnique] = useState(true);
  const [sort, setSort] = useState(false);
  const [results, setResults] = useState<number[]>([]);

  const generateNumbers = () => {
    if (min >= max) return;
    const items: number[] = [];
    const pool = new Set<number>();
    const rangeSize = max - min + 1;
    const actualCount = unique ? Math.min(count, rangeSize) : count;

    while (items.length < actualCount) {
      const rand = Math.floor(Math.random() * rangeSize) + min;
      if (unique) {
        if (!pool.has(rand)) {
          pool.add(rand);
          items.push(rand);
        }
      } else {
        items.push(rand);
      }
    }

    if (sort) items.sort((a, b) => a - b);
    setResults(items);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Randomizer Config</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Minimum</label>
            <input
              type="number"
              value={min}
              onChange={(e) => setMin(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold font-mono"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Maximum</label>
            <input
              type="number"
              value={max}
              onChange={(e) => setMax(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold font-mono"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Quantity of Numbers: {count}</label>
          <input
            type="range"
            min="1"
            max="50"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        <div className="flex gap-4 text-xs font-medium text-slate-700 dark:text-slate-300">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={unique}
              onChange={(e) => setUnique(e.target.checked)}
              className="rounded accent-amber-500"
            />
            No Duplicates
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={sort}
              onChange={(e) => setSort(e.target.checked)}
              className="rounded accent-amber-500"
            />
            Sort Ascending
          </label>
        </div>

        <button
          onClick={generateNumbers}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
        >
          <Shuffle className="w-4 h-4" /> Generate Numbers
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Generated Numbers ({results.length})
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(results.join(', '))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="flex flex-wrap gap-2.5">
            {results.map((n, i) => (
              <div
                key={i}
                className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center text-xl font-black font-mono shadow-xs"
              >
                {n}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            Click "Generate Numbers" to produce random values.
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 343 — DICE ROLLER
// ========================================================
export const DiceRollerTool: React.FC<ToolProps> = () => {
  const [diceType, setDiceType] = useState<number>(6); // d6
  const [diceCount, setDiceCount] = useState<number>(3);
  const [modifier, setModifier] = useState<number>(0);
  const [rolls, setRolls] = useState<number[]>([]);

  const rollDice = () => {
    const newRolls: number[] = [];
    for (let i = 0; i < diceCount; i++) {
      newRolls.push(Math.floor(Math.random() * diceType) + 1);
    }
    setRolls(newRolls);
  };

  const sum = rolls.length > 0 ? rolls.reduce((acc, v) => acc + v, 0) + modifier : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose Dice</h3>

        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {[4, 6, 8, 10, 12, 20, 100].map((d) => (
            <button
              key={d}
              onClick={() => setDiceType(d)}
              className={`py-2 rounded-xl text-xs font-black font-mono cursor-pointer ${
                diceType === d ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              D{d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Number of Dice ({diceCount})</label>
            <input
              type="range"
              min="1"
              max="10"
              value={diceCount}
              onChange={(e) => setDiceCount(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Modifier (+/-)</label>
            <input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold font-mono"
            />
          </div>
        </div>

        <button
          onClick={rollDice}
          className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Dices className="w-5 h-5" /> Roll {diceCount}d{diceType} {modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Total Score
          </span>
          {rolls.length > 0 && (
            <span className="text-xs font-mono text-slate-400">
              {rolls.join(' + ')} {modifier !== 0 && (modifier > 0 ? `+ ${modifier}` : `- ${Math.abs(modifier)}`)}
            </span>
          )}
        </div>

        <div className="text-5xl font-black text-amber-600 dark:text-amber-400 font-mono">
          {rolls.length > 0 ? sum : '—'}
        </div>

        {/* Dice visual tokens */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 font-bold uppercase">Individual Rolls:</span>
          {rolls.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {rolls.map((r, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-lg font-black font-mono text-slate-900 dark:text-white"
                >
                  {r}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-slate-400 text-xs">
              Roll the dice to see individual results.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
