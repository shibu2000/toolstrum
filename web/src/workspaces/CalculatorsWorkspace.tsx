import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator as CalcIcon,
  DollarSign,
  Calendar,
  RefreshCw,
  Activity,
  Clock,
  Hash,
  Check,
  ShieldCheck,
  Play,
  Pause,
  RotateCcw,
  Percent,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface CalculatorsWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const CalculatorsWorkspace: React.FC<CalculatorsWorkspaceProps> = ({
  toolId,
  accentColor = '#F59E0B',
}) => {
  // Determine mode based on toolId:
  const getInitialTab = () => {
    if (toolId === 301 || toolId === 302 || toolId === 329 || toolId === 330 || toolId === 331 || toolId === 332) {
      return 'math';
    }
    if ((toolId >= 303 && toolId <= 311) || toolId === 317 || toolId === 318 || toolId === 338 || toolId === 339 || toolId >= 349) {
      return 'finance';
    }
    if ((toolId >= 312 && toolId <= 316) || toolId === 348) {
      return 'date';
    }
    if (toolId >= 319 && toolId <= 328) {
      return 'unit';
    }
    if (toolId === 333 || toolId === 334) {
      return 'health';
    }
    if (toolId >= 340 && toolId <= 343) {
      return 'convert';
    }
    if (toolId >= 344 && toolId <= 347) {
      return 'stopwatch';
    }
    return 'math';
  };

  const [activeTab, setActiveTab] = useState<'math' | 'finance' | 'date' | 'unit' | 'health' | 'convert' | 'stopwatch'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // 1. STANDARD & SCIENTIFIC KEYPAD CALCULATOR
  // ==========================================
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcMemory, setCalcMemory] = useState<number | null>(null);
  const [calcOp, setCalcOp] = useState<string | null>(null);
  const [calcClearOnNext, setCalcClearOnNext] = useState(false);

  const handleDigit = (digit: string) => {
    if (calcClearOnNext || calcDisplay === '0') {
      setCalcDisplay(digit);
      setCalcClearOnNext(false);
    } else {
      setCalcDisplay(calcDisplay + digit);
    }
  };

  const handleDecimal = () => {
    if (calcClearOnNext) {
      setCalcDisplay('0.');
      setCalcClearOnNext(false);
      return;
    }
    if (!calcDisplay.includes('.')) {
      setCalcDisplay(calcDisplay + '.');
    }
  };

  const handleOp = (op: string) => {
    const current = parseFloat(calcDisplay);
    if (calcMemory === null) {
      setCalcMemory(current);
    } else if (calcOp) {
      const res = executeCalc(calcMemory, current, calcOp);
      setCalcMemory(res);
      setCalcDisplay(String(res));
    }
    setCalcOp(op);
    setCalcClearOnNext(true);
  };

  const handleEquals = () => {
    if (calcMemory !== null && calcOp) {
      const current = parseFloat(calcDisplay);
      const res = executeCalc(calcMemory, current, calcOp);
      setCalcDisplay(String(res));
      setCalcMemory(null);
      setCalcOp(null);
      setCalcClearOnNext(true);
    }
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

  const handleClear = () => {
    setCalcDisplay('0');
    setCalcMemory(null);
    setCalcOp(null);
    setCalcClearOnNext(false);
  };

  const handleScientific = (fn: 'sqrt' | 'sin' | 'cos' | 'tan' | 'log' | 'neg') => {
    const current = parseFloat(calcDisplay);
    let res = current;
    if (fn === 'sqrt') res = Math.sqrt(current);
    if (fn === 'sin') res = Math.sin((current * Math.PI) / 180);
    if (fn === 'cos') res = Math.cos((current * Math.PI) / 180);
    if (fn === 'tan') res = Math.tan((current * Math.PI) / 180);
    if (fn === 'log') res = Math.log10(current);
    if (fn === 'neg') res = -current;
    setCalcDisplay(String(Number(res.toFixed(8))));
    setCalcClearOnNext(true);
  };

  // ==========================================
  // 2. FINANCIAL, DISCOUNT, TAX & EMI CALCULATOR
  // ==========================================
  // EMI
  const [loanPrincipal, setLoanPrincipal] = useState(250000);
  const [loanRate, setLoanRate] = useState(8.5);
  const [loanYears, setLoanYears] = useState(5);
  // Discount & Tax
  const [origPrice, setOrigPrice] = useState(120);
  const [discPercent, setDiscPercent] = useState(20);
  const [taxPercent, setTaxPercent] = useState(8.25);
  // SIP
  const [monthlyInvest, setMonthlyInvest] = useState(500);
  const [expectedReturn, setExpectedReturn] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  // EMI Calc
  const calculateEmi = () => {
    const p = Number(loanPrincipal);
    const r = Number(loanRate) / (12 * 100);
    const n = Number(loanYears) * 12;
    if (p <= 0 || r <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 };
    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalPayment = emi * n;
    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalPayment - p),
      totalPayment: Math.round(totalPayment),
    };
  };

  // Discount Calc
  const calculateDiscount = () => {
    const p = Number(origPrice);
    const d = (p * Number(discPercent)) / 100;
    const afterDisc = p - d;
    const tax = (afterDisc * Number(taxPercent)) / 100;
    const finalPrice = afterDisc + tax;
    return {
      saved: d.toFixed(2),
      discounted: afterDisc.toFixed(2),
      tax: tax.toFixed(2),
      final: finalPrice.toFixed(2),
    };
  };

  // SIP Calc
  const calculateSip = () => {
    const p = Number(monthlyInvest);
    const i = Number(expectedReturn) / (12 * 100);
    const n = Number(sipYears) * 12;
    if (p <= 0 || i <= 0 || n <= 0) return { invested: 0, returns: 0, total: 0 };
    const total = p * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    const invested = p * n;
    return {
      invested: Math.round(invested),
      returns: Math.round(total - invested),
      total: Math.round(total),
    };
  };

  // ==========================================
  // 3. DATE, AGE & WORKDAY CALCULATOR
  // ==========================================
  const [birthDate, setBirthDate] = useState('1998-05-15');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const calculateAge = () => {
    const start = new Date(birthDate);
    const end = new Date(targetDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    let days = end.getDate() - start.getDate();

    if (days < 0) {
      months -= 1;
      const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years -= 1;
      months += 12;
    }

    const diffMs = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);

    return { years, months, days, totalDays, totalWeeks };
  };

  // ==========================================
  // 4. UNIT CONVERTER
  // ==========================================
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp' | 'storage' | 'speed' | 'area' | 'volume' | 'pressure'>('length');
  const [unitVal, setUnitVal] = useState(100);
  const [fromUnit, setFromUnit] = useState('meters');
  const [toUnit, setToUnit] = useState('feet');

  const convertUnits = () => {
    const val = Number(unitVal);
    if (isNaN(val)) return '0';

    if (unitCategory === 'length') {
      const inMeters: Record<string, number> = {
        meters: 1,
        kilometers: 1000,
        centimeters: 0.01,
        millimeters: 0.001,
        miles: 1609.344,
        feet: 0.3048,
        inches: 0.0254,
        yards: 0.9144,
      };
      const m = val * (inMeters[fromUnit] || 1);
      return (m / (inMeters[toUnit] || 1)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    if (unitCategory === 'weight') {
      const inGrams: Record<string, number> = {
        grams: 1,
        kilograms: 1000,
        milligrams: 0.001,
        pounds: 453.59237,
        ounces: 28.3495,
      };
      const g = val * (inGrams[fromUnit] || 1);
      return (g / (inGrams[toUnit] || 1)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    if (unitCategory === 'temp') {
      if (fromUnit === toUnit) return String(val);
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') return ((val * 9) / 5 + 32).toFixed(2);
      if (fromUnit === 'fahrenheit' && toUnit === 'celsius') return (((val - 32) * 5) / 9).toFixed(2);
      if (fromUnit === 'celsius' && toUnit === 'kelvin') return (val + 273.15).toFixed(2);
      if (fromUnit === 'kelvin' && toUnit === 'celsius') return (val - 273.15).toFixed(2);
      return String(val);
    }
    if (unitCategory === 'storage') {
      const inBytes: Record<string, number> = {
        bytes: 1,
        kb: 1024,
        mb: 1024 * 1024,
        gb: 1024 * 1024 * 1024,
        tb: 1024 * 1024 * 1024 * 1024,
      };
      const b = val * (inBytes[fromUnit] || 1);
      return (b / (inBytes[toUnit] || 1)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    if (unitCategory === 'speed') {
      const inKmh: Record<string, number> = {
        kmh: 1,
        mph: 1.60934,
        ms: 3.6,
        knots: 1.852,
      };
      const k = val * (inKmh[fromUnit] || 1);
      return (k / (inKmh[toUnit] || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 });
    }
    if (unitCategory === 'area') {
      const inSqMeters: Record<string, number> = {
        sqmeters: 1,
        sqkilometers: 1e6,
        sqcentimeters: 1e-4,
        hectares: 10000,
        acres: 4046.8564224,
        sqmiles: 2589988.110336,
        sqfeet: 0.09290304,
        sqyards: 0.83612736,
      };
      const m2 = val * (inSqMeters[fromUnit] || 1);
      return (m2 / (inSqMeters[toUnit] || 1)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    if (unitCategory === 'volume') {
      const inLiters: Record<string, number> = {
        liters: 1,
        milliliters: 0.001,
        cubicmeters: 1000,
        gallons: 3.78541,
        quarts: 0.946353,
        cups: 0.24,
        tablespoons: 0.0147868,
        cubicfeet: 28.3168,
      };
      const l = val * (inLiters[fromUnit] || 1);
      return (l / (inLiters[toUnit] || 1)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    if (unitCategory === 'pressure') {
      const inPascal: Record<string, number> = {
        pascal: 1,
        kilopascal: 1000,
        bar: 100000,
        atm: 101325,
        psi: 6894.76,
        mmhg: 133.322,
      };
      const pa = val * (inPascal[fromUnit] || 1);
      return (pa / (inPascal[toUnit] || 1)).toLocaleString(undefined, { maximumFractionDigits: 4 });
    }
    return String(val);
  };

  type UnitCategory = 'length' | 'weight' | 'temp' | 'storage' | 'speed' | 'area' | 'volume' | 'pressure';
  const UNIT_OPTIONS: Record<UnitCategory, { value: string; label: string }[]> = {
    length: [
      { value: 'meters', label: 'Meters' }, { value: 'kilometers', label: 'Kilometers' },
      { value: 'centimeters', label: 'Centimeters' }, { value: 'millimeters', label: 'Millimeters' },
      { value: 'feet', label: 'Feet' }, { value: 'inches', label: 'Inches' },
      { value: 'yards', label: 'Yards' }, { value: 'miles', label: 'Miles' },
    ],
    weight: [
      { value: 'kilograms', label: 'Kilograms' }, { value: 'grams', label: 'Grams' },
      { value: 'milligrams', label: 'Milligrams' }, { value: 'pounds', label: 'Pounds' },
      { value: 'ounces', label: 'Ounces' },
    ],
    temp: [
      { value: 'celsius', label: 'Celsius (°C)' }, { value: 'fahrenheit', label: 'Fahrenheit (°F)' },
      { value: 'kelvin', label: 'Kelvin (K)' },
    ],
    storage: [
      { value: 'bytes', label: 'Bytes' }, { value: 'kb', label: 'Kilobytes (KB)' },
      { value: 'mb', label: 'Megabytes (MB)' }, { value: 'gb', label: 'Gigabytes (GB)' },
      { value: 'tb', label: 'Terabytes (TB)' },
    ],
    speed: [
      { value: 'kmh', label: 'km/h' }, { value: 'mph', label: 'mph' },
      { value: 'ms', label: 'm/s' }, { value: 'knots', label: 'Knots' },
    ],
    area: [
      { value: 'sqmeters', label: 'Square Meters' }, { value: 'sqkilometers', label: 'Square Kilometers' },
      { value: 'sqcentimeters', label: 'Square Centimeters' }, { value: 'hectares', label: 'Hectares' },
      { value: 'acres', label: 'Acres' }, { value: 'sqmiles', label: 'Square Miles' },
      { value: 'sqfeet', label: 'Square Feet' }, { value: 'sqyards', label: 'Square Yards' },
    ],
    volume: [
      { value: 'liters', label: 'Liters' }, { value: 'milliliters', label: 'Milliliters' },
      { value: 'cubicmeters', label: 'Cubic Meters' }, { value: 'gallons', label: 'Gallons (US)' },
      { value: 'quarts', label: 'Quarts' }, { value: 'cups', label: 'Cups' },
      { value: 'tablespoons', label: 'Tablespoons' }, { value: 'cubicfeet', label: 'Cubic Feet' },
    ],
    pressure: [
      { value: 'pascal', label: 'Pascal (Pa)' }, { value: 'kilopascal', label: 'Kilopascal (kPa)' },
      { value: 'bar', label: 'Bar' }, { value: 'atm', label: 'Atmosphere (atm)' },
      { value: 'psi', label: 'PSI' }, { value: 'mmhg', label: 'mmHg' },
    ],
  };

  const DEFAULT_UNITS: Record<UnitCategory, [string, string]> = {
    length: ['meters', 'feet'],
    weight: ['kilograms', 'pounds'],
    temp: ['celsius', 'fahrenheit'],
    storage: ['gb', 'mb'],
    speed: ['kmh', 'mph'],
    area: ['sqmeters', 'sqfeet'],
    volume: ['liters', 'gallons'],
    pressure: ['bar', 'psi'],
  };

  const renderUnitConverter = (title: string, lockedCategory?: keyof typeof UNIT_OPTIONS) => {
    const category = lockedCategory || unitCategory;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>

          {!lockedCategory && (
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(UNIT_OPTIONS) as (keyof typeof UNIT_OPTIONS)[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setUnitCategory(cat);
                    const [f, t] = DEFAULT_UNITS[cat];
                    setFromUnit(f);
                    setToUnit(t);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    unitCategory === cat ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Value to Convert</label>
              <input
                type="number"
                value={unitVal}
                onChange={(e) => setUnitVal(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">From Unit</label>
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  {UNIT_OPTIONS[category].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">To Unit</label>
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                >
                  {UNIT_OPTIONS[category].map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
          <div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Converted Result</span>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1 break-all">
              {convertUnits()} <span className="text-base font-normal text-slate-500">{toUnit}</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400">Equation</span>
            <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{unitVal} {fromUnit} = {convertUnits()} {toUnit}</p>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 4b. NUMBER SYSTEM CONVERTER (BINARY / OCTAL / DECIMAL / HEX)
  // ==========================================
  const [numSysInput, setNumSysInput] = useState('255');
  const [numSysBase, setNumSysBase] = useState<2 | 8 | 10 | 16>(10);
  const [numSysError, setNumSysError] = useState('');

  const convertNumberSystems = () => {
    setNumSysError('');
    try {
      const decimal = parseInt(numSysInput, numSysBase);
      if (isNaN(decimal)) throw new Error(`"${numSysInput}" is not valid in base ${numSysBase}.`);
      return {
        binary: decimal.toString(2),
        octal: decimal.toString(8),
        decimal: decimal.toString(10),
        hex: decimal.toString(16).toUpperCase(),
      };
    } catch (e: any) {
      setNumSysError(e.message);
      return null;
    }
  };

  // ==========================================
  // 8. PERCENTAGE CALCULATOR
  // ==========================================
  const [pctMode, setPctMode] = useState<'of' | 'isWhatPercent' | 'change'>('of');
  const [pctA, setPctA] = useState(20);
  const [pctB, setPctB] = useState(150);

  const calculatePercentage = () => {
    if (pctMode === 'of') return `${pctA}% of ${pctB} = ${((pctA / 100) * pctB).toLocaleString(undefined, { maximumFractionDigits: 4 })}`;
    if (pctMode === 'isWhatPercent') return `${pctA} is ${((pctA / pctB) * 100).toLocaleString(undefined, { maximumFractionDigits: 2 })}% of ${pctB}`;
    const change = ((pctB - pctA) / pctA) * 100;
    return `${change >= 0 ? 'Increase' : 'Decrease'} of ${Math.abs(change).toLocaleString(undefined, { maximumFractionDigits: 2 })}% from ${pctA} to ${pctB}`;
  };

  // ==========================================
  // 9. GST / SALES TAX CALCULATOR (STANDALONE)
  // ==========================================
  const [gstPrice, setGstPrice] = useState(100);
  const [gstRate, setGstRate] = useState(18);

  const calculateGst = () => {
    const gstAmount = (gstPrice * gstRate) / 100;
    return { gstAmount: gstAmount.toFixed(2), total: (gstPrice + gstAmount).toFixed(2) };
  };

  // ==========================================
  // 10. INCOME TAX ESTIMATOR (SIMPLIFIED PROGRESSIVE BRACKETS)
  // ==========================================
  const [annualIncome, setAnnualIncome] = useState(60000);
  const taxBrackets = [
    { upTo: 11000, rate: 0.10 },
    { upTo: 44725, rate: 0.12 },
    { upTo: 95375, rate: 0.22 },
    { upTo: 182100, rate: 0.24 },
    { upTo: 231250, rate: 0.32 },
    { upTo: 578125, rate: 0.35 },
    { upTo: Infinity, rate: 0.37 },
  ];

  const calculateIncomeTax = () => {
    let income = Number(annualIncome);
    let tax = 0;
    let lower = 0;
    for (const bracket of taxBrackets) {
      if (income <= lower) break;
      const taxableInBracket = Math.min(income, bracket.upTo) - lower;
      tax += taxableInBracket * bracket.rate;
      lower = bracket.upTo;
    }
    return { tax: Math.round(tax), effectiveRate: income > 0 ? ((tax / income) * 100).toFixed(1) : '0', takeHome: Math.round(income - tax) };
  };

  // ==========================================
  // 11. SIMPLE & COMPOUND INTEREST CALCULATOR
  // ==========================================
  const [intPrincipal, setIntPrincipal] = useState(10000);
  const [intRate, setIntRate] = useState(6);
  const [intYears, setIntYears] = useState(5);

  const calculateInterest = () => {
    const p = Number(intPrincipal);
    const r = Number(intRate) / 100;
    const t = Number(intYears);
    const simple = p * r * t;
    const compound = p * Math.pow(1 + r, t) - p;
    return { simple: Math.round(simple), compound: Math.round(compound) };
  };

  // ==========================================
  // 12. INVESTMENT RETURN CALCULATOR (LUMP SUM)
  // ==========================================
  const [investPrincipal, setInvestPrincipal] = useState(5000);
  const [investReturn, setInvestReturn] = useState(8);
  const [investYears, setInvestYears] = useState(10);

  const calculateInvestmentReturn = () => {
    const p = Number(investPrincipal);
    const r = Number(investReturn) / 100;
    const t = Number(investYears);
    const futureValue = p * Math.pow(1 + r, t);
    return { futureValue: Math.round(futureValue), gain: Math.round(futureValue - p) };
  };

  // ==========================================
  // 13. INFLATION CALCULATOR
  // ==========================================
  const [inflationAmount, setInflationAmount] = useState(1000);
  const [inflationRate, setInflationRate] = useState(4);
  const [inflationYears, setInflationYears] = useState(10);

  const calculateInflation = () => {
    const futureCost = Number(inflationAmount) * Math.pow(1 + Number(inflationRate) / 100, Number(inflationYears));
    const purchasingPower = Number(inflationAmount) / Math.pow(1 + Number(inflationRate) / 100, Number(inflationYears));
    return { futureCost: Math.round(futureCost), purchasingPower: Math.round(purchasingPower) };
  };

  // ==========================================
  // 14. SALARY CALCULATOR
  // ==========================================
  const [annualSalary, setAnnualSalary] = useState(72000);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);

  const calculateSalaryBreakdown = () => {
    const annual = Number(annualSalary);
    const monthly = annual / 12;
    const biweekly = annual / 26;
    const weekly = annual / 52;
    const hourly = weekly / Math.max(1, Number(hoursPerWeek));
    return {
      monthly: monthly.toFixed(2),
      biweekly: biweekly.toFixed(2),
      weekly: weekly.toFixed(2),
      hourly: hourly.toFixed(2),
    };
  };

  // ==========================================
  // 15. OVERTIME CALCULATOR
  // ==========================================
  const [hourlyRate, setHourlyRate] = useState(20);
  const [regularHours, setRegularHours] = useState(40);
  const [overtimeHours, setOvertimeHours] = useState(5);
  const [overtimeMultiplier, setOvertimeMultiplier] = useState(1.5);

  const calculateOvertimePay = () => {
    const regularPay = Number(hourlyRate) * Number(regularHours);
    const overtimePay = Number(hourlyRate) * Number(overtimeMultiplier) * Number(overtimeHours);
    return { regularPay: regularPay.toFixed(2), overtimePay: overtimePay.toFixed(2), total: (regularPay + overtimePay).toFixed(2) };
  };

  // ==========================================
  // 16. TIP CALCULATOR
  // ==========================================
  const [tipBill, setTipBill] = useState(85);
  const [tipPercent, setTipPercent] = useState(18);
  const [tipPeople, setTipPeople] = useState(2);

  const calculateTip = () => {
    const tipAmount = (Number(tipBill) * Number(tipPercent)) / 100;
    const total = Number(tipBill) + tipAmount;
    const perPerson = total / Math.max(1, Number(tipPeople));
    return { tipAmount: tipAmount.toFixed(2), total: total.toFixed(2), perPerson: perPerson.toFixed(2) };
  };

  // ==========================================
  // 17. BILL SPLITTER
  // ==========================================
  const [splitBill, setSplitBill] = useState(120);
  const [splitPeople, setSplitPeople] = useState(4);
  const [splitTipPercent, setSplitTipPercent] = useState(15);

  const calculateBillSplit = () => {
    const tip = (Number(splitBill) * Number(splitTipPercent)) / 100;
    const total = Number(splitBill) + tip;
    const perPerson = total / Math.max(1, Number(splitPeople));
    return { tip: tip.toFixed(2), total: total.toFixed(2), perPerson: perPerson.toFixed(2) };
  };

  // ==========================================
  // 18. UNIT PRICE COMPARATOR
  // ==========================================
  const [priceA, setPriceA] = useState(4.99);
  const [qtyA, setQtyA] = useState(12);
  const [priceB, setPriceB] = useState(8.49);
  const [qtyB, setQtyB] = useState(24);

  const compareUnitPrices = () => {
    const unitA = Number(priceA) / Math.max(0.0001, Number(qtyA));
    const unitB = Number(priceB) / Math.max(0.0001, Number(qtyB));
    return {
      unitA: unitA.toFixed(4),
      unitB: unitB.toFixed(4),
      cheaper: unitA < unitB ? 'A' : unitA > unitB ? 'B' : 'tie',
    };
  };

  // ==========================================
  // 19. BREAK-EVEN CALCULATOR
  // ==========================================
  const [fixedCosts, setFixedCosts] = useState(10000);
  const [pricePerUnit, setPricePerUnit] = useState(25);
  const [variableCostPerUnit, setVariableCostPerUnit] = useState(10);

  const calculateBreakEven = () => {
    const contribution = Number(pricePerUnit) - Number(variableCostPerUnit);
    if (contribution <= 0) return { units: Infinity, revenue: Infinity };
    const units = Math.ceil(Number(fixedCosts) / contribution);
    return { units, revenue: Math.round(units * Number(pricePerUnit)) };
  };

  // ==========================================
  // 5. BMI & HEALTH
  // ==========================================
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(175);

  const calculateBmi = () => {
    const w = Number(weightKg);
    const h = Number(heightCm) / 100;
    if (w <= 0 || h <= 0) return { bmi: 0, category: 'Unknown', healthyRange: '' };
    const bmi = Number((w / (h * h)).toFixed(1));
    let category = 'Normal Weight';
    let color = 'text-emerald-500';
    if (bmi < 18.5) {
      category = 'Underweight';
      color = 'text-amber-500';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Overweight';
      color = 'text-amber-500';
    } else if (bmi >= 30) {
      category = 'Obese';
      color = 'text-rose-500';
    }
    const minW = (18.5 * h * h).toFixed(1);
    const maxW = (24.9 * h * h).toFixed(1);
    return { bmi, category, color, healthyRange: `${minW} kg – ${maxW} kg` };
  };

  // ==========================================
  // 6. NUMBER TO WORDS & ROMAN NUMERALS
  // ==========================================
  const [numInput, setNumInput] = useState(1250);

  const numberToWords = (num: number): string => {
    if (isNaN(num)) return '';
    if (num === 0) return 'Zero';
    const a = [
      '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
      if (n < 1000000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      return inWords(Math.floor(n / 1000000)) + ' Million' + (n % 1000000 !== 0 ? ' ' + inWords(n % 1000000) : '');
    };
    return inWords(Math.floor(Math.abs(num)));
  };

  const numberToRoman = (num: number): string => {
    if (isNaN(num) || num <= 0 || num > 3999) return 'Roman numerals support numbers between 1 and 3999';
    const romanMap: [number, string][] = [
      [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
      [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let res = '';
    let val = num;
    for (const [rNum, rChar] of romanMap) {
      while (val >= rNum) {
        res += rChar;
        val -= rNum;
      }
    }
    return res;
  };

  // ==========================================
  // 7. STOPWATCH & COUNTDOWN TIMER
  // ==========================================
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isSwRunning, setIsSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<any>(null);

  useEffect(() => {
    if (isSwRunning) {
      swRef.current = setInterval(() => {
        setStopwatchTime((t) => t + 10);
      }, 10);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => {
      if (swRef.current) clearInterval(swRef.current);
    };
  }, [isSwRunning]);

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const lockedCategoryMap: Record<number, keyof typeof UNIT_OPTIONS> = {
      320: 'length', 321: 'weight', 322: 'temp', 323: 'area',
      324: 'volume', 325: 'speed', 326: 'pressure', 327: 'storage',
    };
    const locked = lockedCategoryMap[toolId];
    if (locked) {
      setUnitCategory(locked);
      const [f, t] = DEFAULT_UNITS[locked];
      setFromUnit(f);
      setToUnit(t);
    }
  }, [toolId]);

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <CalcIcon className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Calculators Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Standard, financial, unit, health, date, and stopwatch tools. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: STANDARD & SCIENTIFIC CALCULATOR KEYPAD */}
      {/* ======================================================== */}
      {activeTab === 'math' && (
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
          {/* Display */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-right">
            <div className="text-xs text-slate-400 font-mono h-4">
              {calcMemory !== null && calcOp ? `${calcMemory} ${calcOp}` : ''}
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono truncate">
              {calcDisplay}
            </div>
          </div>

          {/* Scientific Row */}
          <div className="grid grid-cols-6 gap-2">
            {[
              { label: '√', fn: () => handleScientific('sqrt') },
              { label: 'sin', fn: () => handleScientific('sin') },
              { label: 'cos', fn: () => handleScientific('cos') },
              { label: 'tan', fn: () => handleScientific('tan') },
              { label: 'log', fn: () => handleScientific('log') },
              { label: '±', fn: () => handleScientific('neg') },
            ].map((btn, i) => (
              <button
                key={i}
                onClick={btn.fn}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-4 gap-2.5 text-base font-bold">
            <button
              onClick={handleClear}
              className="py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-all"
            >
              C
            </button>
            <button
              onClick={() => handleOp('^')}
              className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all font-mono"
            >
              xʸ
            </button>
            <button
              onClick={() => {
                const val = parseFloat(calcDisplay) / 100;
                setCalcDisplay(String(val));
              }}
              className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all"
            >
              %
            </button>
            <button
              onClick={() => handleOp('÷')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-all text-lg"
            >
              ÷
            </button>

            {['7', '8', '9'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white transition-all shadow-2xs"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOp('×')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-all text-lg"
            >
              ×
            </button>

            {['4', '5', '6'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white transition-all shadow-2xs"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOp('−')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-all text-lg"
            >
              −
            </button>

            {['1', '2', '3'].map((d) => (
              <button
                key={d}
                onClick={() => handleDigit(d)}
                className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white transition-all shadow-2xs"
              >
                {d}
              </button>
            ))}
            <button
              onClick={() => handleOp('+')}
              className="py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white transition-all text-lg"
            >
              +
            </button>

            <button
              onClick={() => handleDigit('0')}
              className="col-span-2 py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-750 text-slate-900 dark:text-white transition-all shadow-2xs"
            >
              0
            </button>
            <button
              onClick={handleDecimal}
              className="py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white transition-all"
            >
              .
            </button>
            <button
              onClick={handleEquals}
              className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all text-lg font-black"
            >
              =
            </button>
          </div>
        </div>
      )}

      {/* 303 — PERCENTAGE CALCULATOR */}
      {toolId === 303 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Percentage Calculator</h3>
            <div className="flex gap-1.5">
              {([
                { id: 'of', label: 'X% of Y' },
                { id: 'isWhatPercent', label: 'X is what % of Y' },
                { id: 'change', label: '% Change' },
              ] as const).map((m) => (
                <button key={m.id} onClick={() => setPctMode(m.id)} className={`flex-1 py-2 rounded-lg text-xs font-semibold ${pctMode === m.id ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                  {m.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">{pctMode === 'change' ? 'From' : 'X'}</label>
                <input type="number" value={pctA} onChange={(e) => setPctA(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">{pctMode === 'change' ? 'To' : 'Y'}</label>
                <input type="number" value={pctB} onChange={(e) => setPctB(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Result</span>
            <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-2">{calculatePercentage()}</p>
          </div>
        </div>
      )}

      {/* 304 — DISCOUNT CALCULATOR */}
      {toolId === 304 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Discount Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Original Price ($)</label>
              <input type="number" value={origPrice} onChange={(e) => setOrigPrice(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Discount Percentage (%)</label>
              <input type="number" value={discPercent} onChange={(e) => setDiscPercent(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-md space-y-4">
            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Discounted Price</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">${(origPrice - (origPrice * discPercent) / 100).toFixed(2)}</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-600">You Save</span>
              <p className="font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">${((origPrice * discPercent) / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* 305 — GST / SALES TAX CALCULATOR */}
      {toolId === 305 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">GST / Sales Tax Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Price Before Tax ($)</label>
              <input type="number" value={gstPrice} onChange={(e) => setGstPrice(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">GST / Tax Rate (%)</label>
              <input type="number" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total (Tax Included)</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">${calculateGst().total}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Tax Amount</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateGst().gstAmount}</p>
            </div>
          </div>
        </div>
      )}

      {/* 306 — INCOME TAX ESTIMATOR */}
      {toolId === 306 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Income Tax Estimator</h3>
            <p className="text-xs text-slate-500">Simplified progressive-bracket estimate for illustration — not tax advice for any specific jurisdiction.</p>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Annual Taxable Income ($)</label>
              <input type="number" value={annualIncome} onChange={(e) => setAnnualIncome(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Estimated Tax Owed</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">${calculateIncomeTax().tax.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Effective Rate</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{calculateIncomeTax().effectiveRate}%</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Take-Home</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateIncomeTax().takeHome.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 307 — EMI CALCULATOR */}
      {toolId === 307 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Loan / Mortgage EMI Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Loan Amount ($)</label>
              <input type="number" value={loanPrincipal} onChange={(e) => setLoanPrincipal(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Annual Interest Rate (%)</label>
              <input type="number" step="0.1" value={loanRate} onChange={(e) => setLoanRate(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Loan Tenure (Years)</label>
              <input type="number" value={loanYears} onChange={(e) => setLoanYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Monthly Repayment</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${calculateEmi().emi.toLocaleString()} <span className="text-sm font-normal text-slate-500">/ month</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Interest</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">${calculateEmi().totalInterest.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Payment</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">${calculateEmi().totalPayment.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 308 — SIMPLE & COMPOUND INTEREST CALCULATOR */}
      {toolId === 308 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Interest Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Principal ($)</label>
              <input type="number" value={intPrincipal} onChange={(e) => setIntPrincipal(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Annual Interest Rate (%)</label>
              <input type="number" step="0.1" value={intRate} onChange={(e) => setIntRate(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Time Period (Years)</label>
              <input type="number" value={intYears} onChange={(e) => setIntYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Simple Interest</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">${calculateInterest().simple.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
              <span className="text-[10px] uppercase font-bold text-amber-600">Compound Interest (Annual)</span>
              <p className="text-xl font-extrabold text-amber-700 dark:text-amber-300 mt-0.5">${calculateInterest().compound.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* 309 — INVESTMENT RETURN CALCULATOR */}
      {toolId === 309 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Investment Return Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Initial Investment ($)</label>
              <input type="number" value={investPrincipal} onChange={(e) => setInvestPrincipal(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Expected Annual Return (%)</label>
              <input type="number" step="0.5" value={investReturn} onChange={(e) => setInvestReturn(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Time Horizon (Years)</label>
              <input type="number" value={investYears} onChange={(e) => setInvestYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/30 shadow-md space-y-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Future Value</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">${calculateInvestmentReturn().futureValue.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-600">Total Gain</span>
              <p className="font-bold text-indigo-700 dark:text-indigo-300 mt-0.5">+${calculateInvestmentReturn().gain.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* 310 — SIP CALCULATOR */}
      {toolId === 310 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">SIP & Compound Return Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Monthly Investment ($)</label>
              <input type="number" value={monthlyInvest} onChange={(e) => setMonthlyInvest(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Expected Annual Return (%)</label>
              <input type="number" step="0.5" value={expectedReturn} onChange={(e) => setExpectedReturn(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Time Horizon (Years)</label>
              <input type="number" value={sipYears} onChange={(e) => setSipYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-indigo-500/30 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Total Estimated Wealth</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">${calculateSip().total.toLocaleString()}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total Invested</span>
                <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">${calculateSip().invested.toLocaleString()}</p>
              </div>
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
                <span className="text-[10px] uppercase font-bold text-indigo-600">Estimated Returns</span>
                <p className="font-bold text-indigo-700 dark:text-indigo-300 text-sm mt-0.5">+${calculateSip().returns.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 311 — INFLATION CALCULATOR */}
      {toolId === 311 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inflation Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Amount Today ($)</label>
              <input type="number" value={inflationAmount} onChange={(e) => setInflationAmount(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Annual Inflation Rate (%)</label>
              <input type="number" step="0.1" value={inflationRate} onChange={(e) => setInflationRate(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Years</label>
              <input type="number" value={inflationYears} onChange={(e) => setInflationYears(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-3">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400">Future Equivalent Cost</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">${calculateInflation().futureCost.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-[10px] uppercase font-bold text-rose-600">Today's Purchasing Power in {inflationYears} Years</span>
              <p className="text-xl font-extrabold text-rose-700 dark:text-rose-300 mt-0.5">${calculateInflation().purchasingPower.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* 317 — SALARY CALCULATOR */}
      {toolId === 317 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Salary Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Annual Salary ($)</label>
              <input type="number" value={annualSalary} onChange={(e) => setAnnualSalary(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Hours Worked Per Week</label>
              <input type="number" value={hoursPerWeek} onChange={(e) => setHoursPerWeek(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md grid grid-cols-2 gap-3 text-xs">
            {[
              ['Monthly', calculateSalaryBreakdown().monthly],
              ['Bi-Weekly', calculateSalaryBreakdown().biweekly],
              ['Weekly', calculateSalaryBreakdown().weekly],
              ['Hourly', calculateSalaryBreakdown().hourly],
            ].map(([label, val]) => (
              <div key={label} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">{label}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">${val}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 318 — OVERTIME CALCULATOR */}
      {toolId === 318 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Overtime Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Hourly Rate ($)</label>
              <input type="number" value={hourlyRate} onChange={(e) => setHourlyRate(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Regular Hours</label>
                <input type="number" value={regularHours} onChange={(e) => setRegularHours(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Overtime Hours</label>
                <input type="number" value={overtimeHours} onChange={(e) => setOvertimeHours(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Overtime Multiplier</label>
              <input type="number" step="0.1" value={overtimeMultiplier} onChange={(e) => setOvertimeMultiplier(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-3">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total Pay</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">${calculateOvertimePay().total}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Regular Pay</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateOvertimePay().regularPay}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Overtime Pay</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateOvertimePay().overtimePay}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 338 — TIP CALCULATOR */}
      {toolId === 338 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tip Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Bill Amount ($)</label>
              <input type="number" value={tipBill} onChange={(e) => setTipBill(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Tip Percentage (%)</label>
              <input type="number" value={tipPercent} onChange={(e) => setTipPercent(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Number of People</label>
              <input type="number" value={tipPeople} onChange={(e) => setTipPeople(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-3">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Total With Tip</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">${calculateTip().total}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tip Amount</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateTip().tipAmount}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
                <span className="text-[10px] uppercase font-bold text-amber-600">Per Person</span>
                <p className="font-bold text-amber-700 dark:text-amber-300 mt-0.5">${calculateTip().perPerson}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 339 — BILL SPLITTER */}
      {toolId === 339 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Bill Splitter</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Total Bill ($)</label>
              <input type="number" value={splitBill} onChange={(e) => setSplitBill(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Number of People</label>
              <input type="number" value={splitPeople} onChange={(e) => setSplitPeople(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Tip Percentage (%)</label>
              <input type="number" value={splitTipPercent} onChange={(e) => setSplitTipPercent(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-3">
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Each Person Pays</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">${calculateBillSplit().perPerson}</div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Tip</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateBillSplit().tip}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400">Total</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateBillSplit().total}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 349 — UNIT PRICE COMPARATOR */}
      {toolId === 349 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unit Price Comparator</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Product A</span>
                <input type="number" value={priceA} onChange={(e) => setPriceA(Number(e.target.value))} placeholder="Price" className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                <input type="number" value={qtyA} onChange={(e) => setQtyA(Number(e.target.value))} placeholder="Quantity" className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400">Product B</span>
                <input type="number" value={priceB} onChange={(e) => setPriceB(Number(e.target.value))} placeholder="Price" className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
                <input type="number" value={qtyB} onChange={(e) => setQtyB(Number(e.target.value))} placeholder="Quantity" className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
              </div>
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-3">
            <div className={`p-3 rounded-xl border text-xs ${compareUnitPrices().cheaper === 'A' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400">Product A Unit Price</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">${compareUnitPrices().unitA} / unit</p>
            </div>
            <div className={`p-3 rounded-xl border text-xs ${compareUnitPrices().cheaper === 'B' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'}`}>
              <span className="text-[10px] uppercase font-bold text-slate-400">Product B Unit Price</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">${compareUnitPrices().unitB} / unit</p>
            </div>
            <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
              {compareUnitPrices().cheaper === 'tie' ? 'Both products cost the same per unit.' : `Product ${compareUnitPrices().cheaper} is the better value.`}
            </p>
          </div>
        </div>
      )}

      {/* 350 — BREAK-EVEN CALCULATOR */}
      {toolId === 350 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Break-Even Calculator</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Fixed Costs ($)</label>
              <input type="number" value={fixedCosts} onChange={(e) => setFixedCosts(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Price Per Unit ($)</label>
              <input type="number" value={pricePerUnit} onChange={(e) => setPricePerUnit(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Variable Cost Per Unit ($)</label>
              <input type="number" value={variableCostPerUnit} onChange={(e) => setVariableCostPerUnit(Number(e.target.value))} className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-3">
            {calculateBreakEven().units === Infinity ? (
              <p className="text-xs text-rose-600 font-semibold">Price per unit must exceed variable cost per unit to break even.</p>
            ) : (
              <>
                <div>
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Break-Even Units</span>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">{calculateBreakEven().units.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Break-Even Revenue</span>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">${calculateBreakEven().revenue.toLocaleString()}</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: AGE & DATE DIFFERENCE CALCULATOR */}
      {/* ======================================================== */}
      {activeTab === 'date' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Dates
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Start Date / Birthday
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Target / End Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Age Result */}
          {calculateAge() && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-md space-y-5">
              <div>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Precise Age
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                  {calculateAge()?.years} Years
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {calculateAge()?.months} Months, {calculateAge()?.days} Days
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Days</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {calculateAge()?.totalDays.toLocaleString()} days
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Total Weeks</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">
                    {calculateAge()?.totalWeeks.toLocaleString()} weeks
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 319 — GENERAL UNIT CONVERTER (any category) */}
      {toolId === 319 && renderUnitConverter('Unit Converter')}

      {/* 320 — LENGTH CONVERTER */}
      {toolId === 320 && renderUnitConverter('Length Converter', 'length')}

      {/* 321 — WEIGHT CONVERTER */}
      {toolId === 321 && renderUnitConverter('Weight Converter', 'weight')}

      {/* 322 — TEMPERATURE CONVERTER */}
      {toolId === 322 && renderUnitConverter('Temperature Converter', 'temp')}

      {/* 323 — AREA CONVERTER */}
      {toolId === 323 && renderUnitConverter('Area Converter', 'area')}

      {/* 324 — VOLUME CONVERTER */}
      {toolId === 324 && renderUnitConverter('Volume Converter', 'volume')}

      {/* 325 — SPEED CONVERTER */}
      {toolId === 325 && renderUnitConverter('Speed Converter', 'speed')}

      {/* 326 — PRESSURE CONVERTER */}
      {toolId === 326 && renderUnitConverter('Pressure Converter', 'pressure')}

      {/* 327 — DATA STORAGE CONVERTER */}
      {toolId === 327 && renderUnitConverter('Data Storage Converter', 'storage')}

      {/* 328 — NUMBER SYSTEM CONVERTER */}
      {toolId === 328 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Number System Converter</h3>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Input Value</label>
              <input
                type="text"
                value={numSysInput}
                onChange={(e) => setNumSysInput(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Input Base</label>
              <div className="grid grid-cols-4 gap-2">
                {([2, 8, 10, 16] as const).map((base) => (
                  <button
                    key={base}
                    onClick={() => setNumSysBase(base)}
                    className={`py-2 rounded-lg text-xs font-bold ${numSysBase === base ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                  >
                    {base === 2 ? 'Binary' : base === 8 ? 'Octal' : base === 10 ? 'Decimal' : 'Hex'}
                  </button>
                ))}
              </div>
            </div>
            {numSysError && <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium">{numSysError}</div>}
          </div>
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-2.5 text-xs">
            {(() => {
              const result = convertNumberSystems();
              if (!result) return <p className="text-slate-500">Enter a valid number for the selected base.</p>;
              return (
                <>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between"><span className="text-slate-500">Binary</span><span className="font-bold font-mono text-slate-900 dark:text-white">{result.binary}</span></div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between"><span className="text-slate-500">Octal</span><span className="font-bold font-mono text-slate-900 dark:text-white">{result.octal}</span></div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between"><span className="text-slate-500">Decimal</span><span className="font-bold font-mono text-slate-900 dark:text-white">{result.decimal}</span></div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between"><span className="text-slate-500">Hexadecimal</span><span className="font-bold font-mono text-slate-900 dark:text-white">{result.hex}</span></div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: BMI & HEALTH */}
      {/* ======================================================== */}
      {activeTab === 'health' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Body Dimensions
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Height (cm)
                </label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* BMI Result Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 shadow-md space-y-5">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Body Mass Index (BMI)
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white mt-1">
                {calculateBmi().bmi}
              </div>
              <p className={`text-sm font-bold mt-1 ${calculateBmi().color}`}>
                {calculateBmi().category}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400">Healthy Weight For Your Height</span>
              <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {calculateBmi().healthyRange}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: NUMBER TO WORDS & ROMAN NUMERALS */}
      {/* ======================================================== */}
      {activeTab === 'convert' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Number Input
            </h3>

            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                Enter an integer number
              </label>
              <input
                type="number"
                value={numInput}
                onChange={(e) => setNumInput(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                In Plain English Words
              </span>
              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                {numberToWords(numInput)}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Roman Numeral
              </span>
              <p className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 mt-1">
                {numberToRoman(numInput)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 7: STOPWATCH */}
      {/* ======================================================== */}
      {activeTab === 'stopwatch' && (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
          <div>
            <span className="text-5xl sm:text-6xl font-black font-mono text-slate-900 dark:text-white select-none">
              {formatStopwatch(stopwatchTime)}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setIsSwRunning(!isSwRunning)}
              className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-md flex items-center gap-2 transition-all ${
                isSwRunning
                  ? 'bg-rose-500 hover:bg-rose-600'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isSwRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSwRunning ? 'Pause' : 'Start'}</span>
            </button>

            <button
              onClick={() => {
                setIsSwRunning(false);
                setStopwatchTime(0);
                setLaps([]);
              }}
              className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              title="Reset Stopwatch"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {isSwRunning && (
              <button
                onClick={() => setLaps([stopwatchTime, ...laps])}
                className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
              >
                Lap
              </button>
            )}
          </div>

          {laps.length > 0 && (
            <div className="max-h-40 overflow-y-auto space-y-1 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 font-mono">
                  <span>Lap {laps.length - i}</span>
                  <span className="font-bold">{formatStopwatch(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
