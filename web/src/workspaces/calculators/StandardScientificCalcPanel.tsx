import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  RotateCcw,
  Copy,
  Check,
  Delete,
  Sparkles,
  History,
} from 'lucide-react';

interface StandardScientificCalcPanelProps {
  defaultMode?: 'standard' | 'scientific';
}

export const StandardScientificCalcPanel: React.FC<StandardScientificCalcPanelProps> = ({
  defaultMode = 'standard',
}) => {
  const [mode, setMode] = useState<'standard' | 'scientific'>(defaultMode);
  const [display, setDisplay] = useState<string>('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [clearOnNext, setClearOnNext] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);
  const [isRad, setIsRad] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);

  const handleDigit = (digit: string) => {
    if (clearOnNext || display === '0') {
      setDisplay(digit);
      setClearOnNext(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleDecimal = () => {
    if (clearOnNext) {
      setDisplay('0.');
      setClearOnNext(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperator = (op: string) => {
    const current = parseFloat(display);
    if (memory === null) {
      setMemory(current);
    } else if (operator) {
      const res = executeCalc(memory, current, operator);
      setMemory(res);
      setDisplay(String(res));
      setHistory((prev) => [`${memory} ${operator} ${current} = ${res}`, ...prev.slice(0, 9)]);
    }
    setOperator(op);
    setClearOnNext(true);
  };

  const executeCalc = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      case '^': return Math.pow(a, b);
      default: return b;
    }
  };

  const handleEquals = () => {
    if (memory !== null && operator) {
      const current = parseFloat(display);
      const res = executeCalc(memory, current, operator);
      setHistory((prev) => [`${memory} ${operator} ${current} = ${res}`, ...prev.slice(0, 9)]);
      setDisplay(String(Number(res.toFixed(8))));
      setMemory(null);
      setOperator(null);
      setClearOnNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setMemory(null);
    setOperator(null);
    setClearOnNext(false);
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleScientific = (fn: string) => {
    const cur = parseFloat(display);
    let res = cur;
    const toAngle = (val: number) => (isRad ? val : (val * Math.PI) / 180);

    switch (fn) {
      case 'sin': res = Math.sin(toAngle(cur)); break;
      case 'cos': res = Math.cos(toAngle(cur)); break;
      case 'tan': res = Math.tan(toAngle(cur)); break;
      case 'sqrt': res = Math.sqrt(cur); break;
      case 'cbrt': res = Math.cbrt(cur); break;
      case 'log': res = Math.log10(cur); break;
      case 'ln': res = Math.log(cur); break;
      case 'sq': res = Math.pow(cur, 2); break;
      case 'inv': res = cur !== 0 ? 1 / cur : 0; break;
      case 'pi': res = Math.PI; break;
      case 'e': res = Math.E; break;
      case 'neg': res = -cur; break;
      case 'fact': {
        const n = Math.floor(Math.max(0, Math.min(100, cur)));
        let f = 1;
        for (let i = 2; i <= n; i++) f *= i;
        res = f;
        break;
      }
    }

    const formatted = String(Number(res.toFixed(8)));
    setHistory((prev) => [`${fn}(${cur}) = ${formatted}`, ...prev.slice(0, 9)]);
    setDisplay(formatted);
    setClearOnNext(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CalcIcon className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {mode === 'standard' ? 'Standard Calculator' : 'Scientific Calculator'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Desktop-grade zero-telemetry arithmetic, trigonometry, logarithms, and power functions.
            </p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setMode('standard')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              mode === 'standard'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              mode === 'scientific'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Scientific
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calculator Keypad (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 max-w-md mx-auto w-full">
          {/* Display screen */}
          <div className="p-4 rounded-xl bg-slate-950 text-white flex flex-col justify-between min-h-[96px] shadow-inner">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{operator ? `${memory} ${operator}` : ''}</span>
              <button
                onClick={handleCopy}
                className="hover:text-amber-400 flex items-center gap-1"
                title="Copy result"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-3xl font-black font-mono tracking-tight text-right truncate select-all">
              {display}
            </p>
          </div>

          {/* Scientific mode angle toggle */}
          {mode === 'scientific' && (
            <div className="flex items-center justify-between text-xs px-1">
              <button
                onClick={() => setIsRad(!isRad)}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold"
              >
                {isRad ? 'RAD' : 'DEG'}
              </button>
              <span className="text-[11px] text-slate-400">Angle mode: {isRad ? 'Radians' : 'Degrees'}</span>
            </div>
          )}

          {/* Scientific row buttons */}
          {mode === 'scientific' && (
            <div className="grid grid-cols-5 gap-2 text-xs font-mono">
              <button onClick={() => handleScientific('sin')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">sin</button>
              <button onClick={() => handleScientific('cos')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">cos</button>
              <button onClick={() => handleScientific('tan')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">tan</button>
              <button onClick={() => handleScientific('log')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">log</button>
              <button onClick={() => handleScientific('ln')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">ln</button>

              <button onClick={() => handleScientific('sqrt')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">√</button>
              <button onClick={() => handleScientific('sq')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">x²</button>
              <button onClick={() => handleOperator('^')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">xʸ</button>
              <button onClick={() => handleScientific('pi')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">π</button>
              <button onClick={() => handleScientific('fact')} className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold">n!</button>
            </div>
          )}

          {/* Standard Keypad Grid */}
          <div className="grid grid-cols-4 gap-2 text-base font-semibold">
            <button onClick={handleClear} className="p-3.5 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 font-bold">C</button>
            <button onClick={handleBackspace} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 flex items-center justify-center">
              <Delete className="w-5 h-5" />
            </button>
            <button onClick={() => handleScientific('neg')} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200">±</button>
            <button onClick={() => handleOperator('÷')} className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold">÷</button>

            <button onClick={() => handleDigit('7')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">7</button>
            <button onClick={() => handleDigit('8')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">8</button>
            <button onClick={() => handleDigit('9')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">9</button>
            <button onClick={() => handleOperator('×')} className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold">×</button>

            <button onClick={() => handleDigit('4')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">4</button>
            <button onClick={() => handleDigit('5')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">5</button>
            <button onClick={() => handleDigit('6')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">6</button>
            <button onClick={() => handleOperator('−')} className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold">−</button>

            <button onClick={() => handleDigit('1')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">1</button>
            <button onClick={() => handleDigit('2')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">2</button>
            <button onClick={() => handleDigit('3')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">3</button>
            <button onClick={() => handleOperator('+')} className="p-3.5 rounded-xl bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 font-bold">+</button>

            <button onClick={() => handleDigit('0')} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 col-span-2">0</button>
            <button onClick={handleDecimal} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700">.</button>
            <button onClick={handleEquals} className="p-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md shadow-amber-500/20">=</button>
          </div>
        </div>

        {/* Calculation History (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Calculation Tape</span>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Clear Tape
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-[340px] overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center italic">
                Your recent calculation history will appear here.
              </p>
            ) : (
              history.map((h, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between"
                >
                  <span>{h}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
