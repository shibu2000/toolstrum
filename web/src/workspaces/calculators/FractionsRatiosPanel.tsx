import React, { useState, useMemo } from 'react';
import {
  Percent,
  Copy,
  Check,
  Download,
  Sparkles,
  BarChart3,
  Divide,
  Scale,
  Dice5,
} from 'lucide-react';
import {
  calcFraction,
  calcRatio,
  calcAverage,
  calcProbability,
} from './calcHelpers';

interface FractionsRatiosPanelProps {
  defaultSubTool?: 'fraction' | 'ratio' | 'average' | 'probability';
}

export const FractionsRatiosPanel: React.FC<FractionsRatiosPanelProps> = ({
  defaultSubTool = 'fraction',
}) => {
  const [activeTab, setActiveTab] = useState<'fraction' | 'ratio' | 'average' | 'probability'>(defaultSubTool);
  const [copied, setCopied] = useState(false);

  // 1. Fraction State
  const [n1, setN1] = useState<number>(3);
  const [d1, setD1] = useState<number>(4);
  const [op, setOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [n2, setN2] = useState<number>(2);
  const [d2, setD2] = useState<number>(5);

  const fractionResult = useMemo(() => {
    return calcFraction(n1, d1, op, n2, d2);
  }, [n1, d1, op, n2, d2]);

  // 2. Ratio State
  const [ratioA, setRatioA] = useState<number>(16);
  const [ratioB, setRatioB] = useState<number>(9);
  const [ratioC, setRatioC] = useState<number>(1920);

  const ratioResult = useMemo(() => {
    return calcRatio(ratioA, ratioB, ratioC);
  }, [ratioA, ratioB, ratioC]);

  // 3. Average & Stats State
  const [numbersInput, setNumbersInput] = useState<string>('12, 15, 23, 23, 34, 45, 56, 78, 92');

  const averageResult = useMemo(() => {
    const parsed = numbersInput
      .split(/[\s,;]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    return calcAverage(parsed);
  }, [numbersInput]);

  // 4. Probability State
  const [probType, setProbType] = useState<'single' | 'nPr' | 'nCr'>('nCr');
  const [probN, setProbN] = useState<number>(10);
  const [probR, setProbR] = useState<number>(3);

  const probResult = useMemo(() => {
    return calcProbability(probType, probN, probR);
  }, [probType, probN, probR]);

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
            {activeTab === 'fraction' ? (
              <Divide className="w-5 h-5" />
            ) : activeTab === 'ratio' ? (
              <Scale className="w-5 h-5" />
            ) : activeTab === 'average' ? (
              <BarChart3 className="w-5 h-5" />
            ) : (
              <Dice5 className="w-5 h-5" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Fractions, Ratios, Statistics & Probability
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exact algebraic fractional operations, ratio solvers, statistical distributions, and combinatorics.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('fraction')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'fraction'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Fraction Calculator
          </button>
          <button
            onClick={() => setActiveTab('ratio')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'ratio'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Ratio Calculator
          </button>
          <button
            onClick={() => setActiveTab('average')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'average'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Average & Stats
          </button>
          <button
            onClick={() => setActiveTab('probability')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'probability'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Probability
          </button>
        </div>
      </div>

      {/* 1. FRACTION CALCULATOR */}
      {activeTab === 'fraction' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            {/* Fraction 1 */}
            <div className="flex flex-col items-center gap-1.5">
              <input
                type="number"
                value={n1}
                onChange={(e) => setN1(parseInt(e.target.value) || 0)}
                className="w-16 p-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
              <div className="w-16 h-0.5 bg-slate-400" />
              <input
                type="number"
                value={d1}
                onChange={(e) => setD1(parseInt(e.target.value) || 1)}
                className="w-16 p-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            {/* Operator */}
            <div className="flex flex-col gap-1">
              {(['+', '-', '*', '/'] as const).map((o) => (
                <button
                  key={o}
                  onClick={() => setOp(o)}
                  className={`w-10 h-8 rounded font-bold ${
                    op === o
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {o === '*' ? '×' : o === '/' ? '÷' : o}
                </button>
              ))}
            </div>

            {/* Fraction 2 */}
            <div className="flex flex-col items-center gap-1.5">
              <input
                type="number"
                value={n2}
                onChange={(e) => setN2(parseInt(e.target.value) || 0)}
                className="w-16 p-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
              <div className="w-16 h-0.5 bg-slate-400" />
              <input
                type="number"
                value={d2}
                onChange={(e) => setD2(parseInt(e.target.value) || 1)}
                className="w-16 p-2 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>

            <span className="text-2xl font-bold text-slate-400">=</span>

            {/* Result Card */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col items-center min-w-[140px]">
              <span className="text-2xl font-black font-mono">{fractionResult.simplified}</span>
              <span className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                Mixed: <strong>{fractionResult.mixedNumber}</strong>
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Decimal: {fractionResult.decimal}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 2. RATIO CALCULATOR */}
      {activeTab === 'ratio' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Ratio A : B</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={ratioA}
                  onChange={(e) => setRatioA(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
                />
                <span className="font-bold text-slate-400">:</span>
                <input
                  type="number"
                  value={ratioB}
                  onChange={(e) => setRatioB(parseFloat(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Scale Term C</label>
              <input
                type="number"
                value={ratioC}
                onChange={(e) => setRatioC(parseFloat(e.target.value) || 0)}
                placeholder="Scale factor or X"
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Simplified</span>
              <p className="text-xl font-bold font-mono">{ratioResult.simplifiedRatio}</p>
              {ratioResult.solvedFourthTerm !== undefined && (
                <p className="text-xs mt-1 text-slate-500">
                  When C = {ratioC}, <strong>D = {ratioResult.solvedFourthTerm}</strong>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. AVERAGE & STATISTICS CALCULATOR */}
      {activeTab === 'average' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Enter Numbers (comma, space, or newline separated)
            </label>
            <textarea
              value={numbersInput}
              onChange={(e) => setNumbersInput(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Mean (Average)</span>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{averageResult.mean}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Median</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{averageResult.median}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Standard Deviation</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{averageResult.stdDev}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Total Sum ({averageResult.count} items)</span>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{averageResult.sum}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. PROBABILITY CALCULATOR */}
      {activeTab === 'probability' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Calculation Type</label>
              <select
                value={probType}
                onChange={(e) => setProbType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              >
                <option value="nCr">Combinations (nCr)</option>
                <option value="nPr">Permutations (nPr)</option>
                <option value="single">Single Event Odds (Favorable / Total)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Total (n)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={probN}
                  onChange={(e) => setProbN(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase block mb-1">Pick (r)</label>
                <input
                  type="number"
                  min={0}
                  max={probN}
                  value={probR}
                  onChange={(e) => setProbR(parseInt(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Outcome</span>
              <p className="text-xl font-bold font-mono">{probResult.formatted}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
