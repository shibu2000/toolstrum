import React, { useState } from 'react';
import {
  Calculator as CalcIcon,
  RotateCcw,
  Plus,
  Minus,
  Percent,
  Check,
  Copy,
  Hash,
  Divide,
  X,
  Sigma,
} from 'lucide-react';
import { gcd, simplifyFraction, computeAverages } from './calcHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 301 — STANDARD CALCULATOR
// ========================================================
export const StandardCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const inputDigit = (d: string) => {
    if (newNumber || display === '0') {
      setDisplay(d);
      setNewNumber(false);
    } else {
      setDisplay(display + d);
    }
  };

  const inputDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
      return;
    }
    if (!display.includes('.')) setDisplay(display + '.');
  };

  const clearAll = () => {
    setDisplay('0');
    setPrevVal(null);
    setOperation(null);
    setNewNumber(false);
  };

  const backspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const toggleSign = () => {
    const num = parseFloat(display);
    setDisplay(String(-num));
  };

  const handlePercent = () => {
    const num = parseFloat(display);
    setDisplay(String(num / 100));
  };

  const performOp = (nextOp: string) => {
    const cur = parseFloat(display);
    if (prevVal === null) {
      setPrevVal(cur);
    } else if (operation) {
      let res = prevVal;
      if (operation === '+') res = prevVal + cur;
      else if (operation === '-') res = prevVal - cur;
      else if (operation === '×') res = prevVal * cur;
      else if (operation === '÷') res = cur === 0 ? 0 : prevVal / cur;
      setHistory((prev) => [`${prevVal} ${operation} ${cur} = ${res}`, ...prev.slice(0, 4)]);
      setPrevVal(res);
      setDisplay(String(res));
    }
    setOperation(nextOp);
    setNewNumber(true);
  };

  const equals = () => {
    if (prevVal === null || !operation) return;
    const cur = parseFloat(display);
    let res = prevVal;
    if (operation === '+') res = prevVal + cur;
    else if (operation === '-') res = prevVal - cur;
    else if (operation === '×') res = prevVal * cur;
    else if (operation === '÷') res = cur === 0 ? 0 : prevVal / cur;
    setHistory((prev) => [`${prevVal} ${operation} ${cur} = ${res}`, ...prev.slice(0, 4)]);
    setDisplay(String(res));
    setPrevVal(null);
    setOperation(null);
    setNewNumber(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
      <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
        {/* Display */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right">
          <div className="text-xs text-slate-400 font-mono h-4">
            {prevVal !== null && operation ? `${prevVal} ${operation}` : ''}
          </div>
          <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono truncate">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 text-base font-bold">
          <button onClick={clearAll} className="py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400">C</button>
          <button onClick={backspace} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">⌫</button>
          <button onClick={handlePercent} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">%</button>
          <button onClick={() => performOp('÷')} className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white">÷</button>

          <button onClick={() => inputDigit('7')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">7</button>
          <button onClick={() => inputDigit('8')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">8</button>
          <button onClick={() => inputDigit('9')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">9</button>
          <button onClick={() => performOp('×')} className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white">×</button>

          <button onClick={() => inputDigit('4')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">4</button>
          <button onClick={() => inputDigit('5')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">5</button>
          <button onClick={() => inputDigit('6')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">6</button>
          <button onClick={() => performOp('-')} className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white">−</button>

          <button onClick={() => inputDigit('1')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">1</button>
          <button onClick={() => inputDigit('2')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">2</button>
          <button onClick={() => inputDigit('3')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">3</button>
          <button onClick={() => performOp('+')} className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white">+</button>

          <button onClick={toggleSign} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">±</button>
          <button onClick={() => inputDigit('0')} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">0</button>
          <button onClick={inputDecimal} className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white">.</button>
          <button onClick={equals} className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white">=</button>
        </div>
      </div>

      {/* History Side Panel */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Calculation History
        </h4>
        {history.length > 0 ? (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-700 dark:text-slate-300">
                {h}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Perform calculations to record history.</p>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 302 — SCIENTIFIC CALCULATOR
// ========================================================
export const ScientificCalculatorTool: React.FC<ToolProps> = () => {
  const [display, setDisplay] = useState('0');
  const [angleMode, setAngleMode] = useState<'deg' | 'rad'>('deg');
  const [memory, setMemory] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [newNum, setNewNum] = useState(false);

  const inputDigit = (d: string) => {
    if (newNum || display === '0') {
      setDisplay(d);
      setNewNum(false);
    } else {
      setDisplay(display + d);
    }
  };

  const handleSci = (fn: string) => {
    const val = parseFloat(display);
    let res = val;
    const rad = angleMode === 'deg' ? (val * Math.PI) / 180 : val;

    switch (fn) {
      case 'sin': res = Math.sin(rad); break;
      case 'cos': res = Math.cos(rad); break;
      case 'tan': res = Math.tan(rad); break;
      case 'asin': res = angleMode === 'deg' ? (Math.asin(val) * 180) / Math.PI : Math.asin(val); break;
      case 'acos': res = angleMode === 'deg' ? (Math.acos(val) * 180) / Math.PI : Math.acos(val); break;
      case 'atan': res = angleMode === 'deg' ? (Math.atan(val) * 180) / Math.PI : Math.atan(val); break;
      case 'sqrt': res = Math.sqrt(val); break;
      case 'cbrt': res = Math.cbrt(val); break;
      case 'sqr': res = Math.pow(val, 2); break;
      case 'log': res = Math.log10(val); break;
      case 'ln': res = Math.log(val); break;
      case 'exp': res = Math.exp(val); break;
      case 'inv': res = val !== 0 ? 1 / val : 0; break;
      case 'pi': res = Math.PI; break;
      case 'e': res = Math.E; break;
      case 'fact': {
        let f = 1;
        const n = Math.min(100, Math.max(0, Math.floor(val)));
        for (let i = 2; i <= n; i++) f *= i;
        res = f;
        break;
      }
    }
    setDisplay(String(Number(res.toFixed(10))));
    setNewNum(true);
  };

  const handleOp = (nextOp: string) => {
    const cur = parseFloat(display);
    if (memory === null) {
      setMemory(cur);
    } else if (op) {
      let res = memory;
      if (op === '+') res = memory + cur;
      else if (op === '-') res = memory - cur;
      else if (op === '×') res = memory * cur;
      else if (op === '÷') res = cur !== 0 ? memory / cur : 0;
      else if (op === '^') res = Math.pow(memory, cur);
      setMemory(res);
      setDisplay(String(res));
    }
    setOp(nextOp);
    setNewNum(true);
  };

  const equals = () => {
    if (memory === null || !op) return;
    const cur = parseFloat(display);
    let res = memory;
    if (op === '+') res = memory + cur;
    else if (op === '-') res = memory - cur;
    else if (op === '×') res = memory * cur;
    else if (op === '÷') res = cur !== 0 ? memory / cur : 0;
    else if (op === '^') res = Math.pow(memory, cur);
    setDisplay(String(Number(res.toFixed(10))));
    setMemory(null);
    setOp(null);
    setNewNum(true);
  };

  return (
    <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
      {/* Display */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right">
        <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
          <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 uppercase font-bold text-[10px]">
            {angleMode}
          </span>
          <span>{memory !== null && op ? `${memory} ${op}` : ''}</span>
        </div>
        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono truncate mt-1">
          {display}
        </div>
      </div>

      {/* Mode & Special Rows */}
      <div className="grid grid-cols-6 gap-2">
        <button
          onClick={() => setAngleMode(angleMode === 'deg' ? 'rad' : 'deg')}
          className="py-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold"
        >
          {angleMode.toUpperCase()}
        </button>
        <button onClick={() => handleSci('pi')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">π</button>
        <button onClick={() => handleSci('e')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">e</button>
        <button onClick={() => handleSci('sqrt')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">√</button>
        <button onClick={() => handleSci('sqr')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">x²</button>
        <button onClick={() => handleOp('^')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">xʸ</button>

        <button onClick={() => handleSci('sin')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">sin</button>
        <button onClick={() => handleSci('cos')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">cos</button>
        <button onClick={() => handleSci('tan')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">tan</button>
        <button onClick={() => handleSci('ln')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">ln</button>
        <button onClick={() => handleSci('log')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">log</button>
        <button onClick={() => handleSci('fact')} className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">n!</button>
      </div>

      {/* Standard Grid */}
      <div className="grid grid-cols-4 gap-2 text-base font-bold pt-2 border-t border-slate-100 dark:border-slate-800">
        <button onClick={() => { setDisplay('0'); setMemory(null); setOp(null); }} className="py-3 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">C</button>
        <button onClick={() => handleSci('inv')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">1/x</button>
        <button onClick={() => setDisplay(String(-parseFloat(display)))} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">±</button>
        <button onClick={() => handleOp('÷')} className="py-3 rounded-2xl bg-amber-500 text-white">÷</button>

        <button onClick={() => inputDigit('7')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">7</button>
        <button onClick={() => inputDigit('8')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">8</button>
        <button onClick={() => inputDigit('9')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">9</button>
        <button onClick={() => handleOp('×')} className="py-3 rounded-2xl bg-amber-500 text-white">×</button>

        <button onClick={() => inputDigit('4')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">4</button>
        <button onClick={() => inputDigit('5')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">5</button>
        <button onClick={() => inputDigit('6')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">6</button>
        <button onClick={() => handleOp('-')} className="py-3 rounded-2xl bg-amber-500 text-white">−</button>

        <button onClick={() => inputDigit('1')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">1</button>
        <button onClick={() => inputDigit('2')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">2</button>
        <button onClick={() => inputDigit('3')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">3</button>
        <button onClick={() => handleOp('+')} className="py-3 rounded-2xl bg-amber-500 text-white">+</button>

        <button onClick={() => inputDigit('0')} className="col-span-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">0</button>
        <button onClick={() => !display.includes('.') && setDisplay(display + '.')} className="py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">.</button>
        <button onClick={equals} className="py-3 rounded-2xl bg-emerald-600 text-white">=</button>
      </div>
    </div>
  );
};

// ========================================================
// 329 — FRACTION CALCULATOR
// ========================================================
export const FractionCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [num1, setNum1] = useState(3);
  const [den1, setDen1] = useState(4);
  const [op, setOp] = useState<'+' | '-' | '×' | '÷'>('+');
  const [num2, setNum2] = useState(2);
  const [den2, setDen2] = useState(5);

  let resultNum = 0;
  let resultDen = 1;
  let error = '';

  try {
    if (den1 === 0 || den2 === 0) throw new Error('Denominators cannot be zero');
    if (op === '+') {
      resultNum = num1 * den2 + num2 * den1;
      resultDen = den1 * den2;
    } else if (op === '-') {
      resultNum = num1 * den2 - num2 * den1;
      resultDen = den1 * den2;
    } else if (op === '×') {
      resultNum = num1 * num2;
      resultDen = den1 * den2;
    } else if (op === '÷') {
      if (num2 === 0) throw new Error('Division by zero fraction');
      resultNum = num1 * den2;
      resultDen = den1 * num2;
    }
  } catch (e: any) {
    error = e.message;
  }

  const simplified = !error ? simplifyFraction(resultNum, resultDen) : null;
  const decimalVal = simplified ? (simplified.num / simplified.den).toFixed(4) : '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Fraction Inputs</h3>

        <div className="flex items-center justify-center gap-4">
          {/* Fraction 1 */}
          <div className="flex flex-col items-center w-24">
            <input
              type="number"
              value={num1}
              onChange={(e) => setNum1(Number(e.target.value))}
              className="w-full text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
            <div className="w-full h-0.5 bg-slate-400 my-1" />
            <input
              type="number"
              value={den1}
              onChange={(e) => setDen1(Number(e.target.value))}
              className="w-full text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>

          {/* Operation Selector */}
          <div className="flex flex-col gap-1">
            {(['+', '-', '×', '÷'] as const).map((o) => (
              <button
                key={o}
                onClick={() => setOp(o)}
                className={`w-9 h-9 rounded-xl font-bold text-sm ${
                  op === o ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {o}
              </button>
            ))}
          </div>

          {/* Fraction 2 */}
          <div className="flex flex-col items-center w-24">
            <input
              type="number"
              value={num2}
              onChange={(e) => setNum2(Number(e.target.value))}
              className="w-full text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
            <div className="w-full h-0.5 bg-slate-400 my-1" />
            <input
              type="number"
              value={den2}
              onChange={(e) => setDen2(Number(e.target.value))}
              className="w-full text-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
        </div>

        {error && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{error}</div>}
      </div>

      {/* Result Card */}
      {simplified && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Simplified Result
            </span>
            {onCopy && (
              <button
                onClick={() => onCopy(`${simplified.num}/${simplified.den}`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center text-3xl font-black text-slate-900 dark:text-white font-mono">
              <span>{simplified.num}</span>
              <div className="w-12 h-1 bg-amber-500 my-1" />
              <span>{simplified.den}</span>
            </div>

            {simplified.whole !== 0 && simplified.remNum !== 0 && (
              <div className="text-sm text-slate-500">
                Mixed Fraction:{' '}
                <span className="font-bold text-slate-900 dark:text-white font-mono text-base">
                  {simplified.whole} {simplified.remNum}/{simplified.den}
                </span>
              </div>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Decimal Value:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{decimalVal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Percentage:</span>
              <span className="font-bold font-mono text-slate-900 dark:text-white">{(Number(decimalVal) * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 330 — RATIO CALCULATOR
// ========================================================
export const RatioCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [a, setA] = useState(16);
  const [b, setB] = useState(9);
  const [c, setC] = useState(1920);
  const [solveTarget, setSolveTarget] = useState<'d' | 'simplify'>('d');

  const divisor = gcd(a, b);
  const simpA = a / divisor;
  const simpB = b / divisor;
  const dVal = b !== 0 ? (c * b) / a : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ratio Parameters (A : B = C : D)</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Ratio Part A</label>
            <input
              type="number"
              value={a}
              onChange={(e) => setA(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Ratio Part B</label>
            <input
              type="number"
              value={b}
              onChange={(e) => setB(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 block mb-1">Solve for D with Target C</label>
          <input
            type="number"
            value={c}
            onChange={(e) => setC(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-5">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Results & Proportions
        </span>

        <div>
          <span className="text-xs text-slate-400">Simplified Ratio:</span>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
            {simpA} : {simpB}
          </div>
          <p className="text-xs text-slate-500 mt-1">Divided both terms by GCD ({divisor}).</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2">
          <span className="text-xs font-bold text-slate-500">Solved Value D:</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">
            D = {dVal % 1 === 0 ? dVal : dVal.toFixed(2)}
          </div>
          <p className="text-xs text-slate-400 font-mono">
            {a} : {b} = {c} : {dVal % 1 === 0 ? dVal : dVal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 331 — AVERAGE CALCULATOR
// ========================================================
export const AverageCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [rawText, setRawText] = useState('12, 15, 18, 22, 25, 28, 30, 35, 40, 22');

  const numbers = rawText
    .split(/[\s,;\n]+/)
    .map((s) => parseFloat(s.trim()))
    .filter((n) => !isNaN(n));

  const stats = computeAverages(numbers);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <label className="text-xs font-bold text-slate-900 dark:text-white block uppercase tracking-wider">
          Number Dataset (Comma or Space Separated)
        </label>
        <textarea
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          rows={6}
          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
          placeholder="Enter numbers e.g. 10, 20, 30..."
        />
        <div className="flex justify-between text-xs text-slate-500">
          <span>Detected Items: <b className="text-slate-900 dark:text-white">{stats.count}</b></span>
          <span>Sum: <b className="text-slate-900 dark:text-white">{stats.sum}</b></span>
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Statistical Summary
          </span>
          {onCopy && (
            <button
              onClick={() => onCopy(`Mean: ${stats.mean.toFixed(2)}, Median: ${stats.median}, Mode: ${stats.mode.join(', ')}`)}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Mean (Average)</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.mean.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Median</span>
            <div className="text-xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.median}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Mode</span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.mode.length ? stats.mode.join(', ') : 'None'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Std Deviation (σ)</span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.stdDev.toFixed(2)}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Range (Max - Min)</span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.range} ({stats.min} to {stats.max})
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Total Count</span>
            <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {stats.count}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 332 — PROBABILITY CALCULATOR
// ========================================================
export const ProbabilityCalculatorTool: React.FC<ToolProps> = () => {
  const [favorable, setFavorable] = useState(3);
  const [total, setTotal] = useState(10);
  const [probB, setProbB] = useState(0.5);

  const pA = total > 0 ? Math.min(1, Math.max(0, favorable / total)) : 0;
  const pNotA = 1 - pA;
  const pAandB = pA * probB;
  const pAorB = pA + probB - pA * probB;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Single Event: P(A)</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Number of Favorable Outcomes (n)</label>
          <input
            type="number"
            value={favorable}
            onChange={(e) => setFavorable(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Total Possible Outcomes (N)</label>
          <input
            type="number"
            value={total}
            onChange={(e) => setTotal(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
          />
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-bold text-slate-500 block mb-1">Independent Event P(B) Probability (0 to 1)</label>
          <input
            type="number"
            step="0.05"
            min="0"
            max="1"
            value={probB}
            onChange={(e) => setProbB(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          Probabilities & Odds
        </span>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
          <span className="text-xs text-slate-400">P(A) Event Probability:</span>
          <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">
            {(pA * 100).toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Decimal: {pA.toFixed(4)} | Odds in favor: {favorable} : {Math.max(0, total - favorable)}
          </p>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400">P(not A) Complement:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{(pNotA * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400">P(A and B) Both Occur:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{(pAandB * 100).toFixed(1)}%</span>
          </div>
          <div className="flex justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-400">P(A or B) Either Occurs:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{(pAorB * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
