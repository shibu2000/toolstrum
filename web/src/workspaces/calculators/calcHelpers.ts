/**
 * 100% Offline Client-Side Zero-Dependency Calculation Engines for Calculators Studio.
 * Fully compatible with Desmos, Calculator.net, and UnitConverters.net.
 */

// ==========================================
// 1. FINANCIAL & BUSINESS ENGINES
// ==========================================

export interface DiscountResult {
  originalPrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  savingsRatio: string;
}

export function calcDiscount(price: number, discountPercent: number): DiscountResult {
  const p = Math.max(0, price);
  const d = Math.max(0, Math.min(100, discountPercent));
  const discountAmount = Number(((p * d) / 100).toFixed(2));
  const finalPrice = Number((p - discountAmount).toFixed(2));
  return {
    originalPrice: p,
    discountPercent: d,
    discountAmount,
    finalPrice,
    savingsRatio: `${d}%`,
  };
}

export interface GstResult {
  baseAmount: number;
  gstRate: number;
  gstAmount: number;
  totalAmount: number;
  cgst: number;
  sgst: number;
  isInclusive: boolean;
}

export function calcGst(amount: number, rate: number, isInclusive: boolean): GstResult {
  const a = Math.max(0, amount);
  const r = Math.max(0, rate);
  let baseAmount: number;
  let gstAmount: number;
  let totalAmount: number;

  if (isInclusive) {
    totalAmount = a;
    baseAmount = Number((a / (1 + r / 100)).toFixed(2));
    gstAmount = Number((totalAmount - baseAmount).toFixed(2));
  } else {
    baseAmount = a;
    gstAmount = Number(((a * r) / 100).toFixed(2));
    totalAmount = Number((baseAmount + gstAmount).toFixed(2));
  }

  const half = Number((gstAmount / 2).toFixed(2));
  return {
    baseAmount,
    gstRate: r,
    gstAmount,
    totalAmount,
    cgst: half,
    sgst: half,
    isInclusive,
  };
}

export interface EmiResult {
  loanAmount: number;
  annualRate: number;
  tenureMonths: number;
  monthlyEmi: number;
  totalInterest: number;
  totalPayment: number;
  interestRatio: number;
}

export function calcEmi(principal: number, annualRate: number, tenureMonths: number): EmiResult {
  const P = Math.max(0, principal);
  const N = Math.max(1, tenureMonths);
  const annualR = Math.max(0, annualRate);
  const r = annualR / 12 / 100;

  if (r === 0 || P === 0) {
    const monthlyEmi = Number((P / N).toFixed(2));
    return {
      loanAmount: P,
      annualRate: annualR,
      tenureMonths: N,
      monthlyEmi,
      totalInterest: 0,
      totalPayment: P,
      interestRatio: 0,
    };
  }

  const factor = Math.pow(1 + r, N);
  const monthlyEmi = Number(((P * r * factor) / (factor - 1)).toFixed(2));
  const totalPayment = Number((monthlyEmi * N).toFixed(2));
  const totalInterest = Number(Math.max(0, totalPayment - P).toFixed(2));
  const interestRatio = Number(((totalInterest / totalPayment) * 100).toFixed(1));

  return {
    loanAmount: P,
    annualRate: annualR,
    tenureMonths: N,
    monthlyEmi,
    totalInterest,
    totalPayment,
    interestRatio,
  };
}

export interface InterestResult {
  principal: number;
  annualRate: number;
  years: number;
  simpleInterest: number;
  compoundInterest: number;
  simpleTotal: number;
  compoundTotal: number;
}

export function calcInterest(
  principal: number,
  annualRate: number,
  years: number,
  compoundFreq: 'annually' | 'semi-annually' | 'quarterly' | 'monthly' = 'annually'
): InterestResult {
  const P = Math.max(0, principal);
  const R = Math.max(0, annualRate) / 100;
  const T = Math.max(0, years);

  const simpleInterest = Number((P * R * T).toFixed(2));
  const simpleTotal = Number((P + simpleInterest).toFixed(2));

  let n = 1;
  if (compoundFreq === 'semi-annually') n = 2;
  else if (compoundFreq === 'quarterly') n = 4;
  else if (compoundFreq === 'monthly') n = 12;

  const compoundTotal = Number((P * Math.pow(1 + R / n, n * T)).toFixed(2));
  const compoundInterest = Number(Math.max(0, compoundTotal - P).toFixed(2));

  return {
    principal: P,
    annualRate,
    years: T,
    simpleInterest,
    compoundInterest,
    simpleTotal,
    compoundTotal,
  };
}

export interface SipResult {
  monthlyInvestment: number;
  expectedAnnualReturn: number;
  years: number;
  investedAmount: number;
  estimatedReturns: number;
  totalMaturityValue: number;
}

export function calcSip(monthlyInvestment: number, annualRate: number, years: number): SipResult {
  const P = Math.max(0, monthlyInvestment);
  const i = Math.max(0, annualRate) / 12 / 100;
  const n = Math.max(1, years * 12);
  const investedAmount = Number((P * n).toFixed(2));

  if (i === 0) {
    return {
      monthlyInvestment: P,
      expectedAnnualReturn: annualRate,
      years,
      investedAmount,
      estimatedReturns: 0,
      totalMaturityValue: investedAmount,
    };
  }

  const totalMaturityValue = Number((P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)).toFixed(2));
  const estimatedReturns = Number(Math.max(0, totalMaturityValue - investedAmount).toFixed(2));

  return {
    monthlyInvestment: P,
    expectedAnnualReturn: annualRate,
    years,
    investedAmount,
    estimatedReturns,
    totalMaturityValue,
  };
}

export interface InflationResult {
  currentAmount: number;
  inflationRate: number;
  years: number;
  futureRequiredAmount: number;
  purchasingPowerLossPercent: number;
}

export function calcInflation(currentAmount: number, inflationRate: number, years: number): InflationResult {
  const c = Math.max(0, currentAmount);
  const r = Math.max(0, inflationRate) / 100;
  const t = Math.max(0, years);

  const futureRequiredAmount = Number((c * Math.pow(1 + r, t)).toFixed(2));
  const futureValueAtConstantCurrency = c / Math.pow(1 + r, t);
  const lossPercent = Number((((c - futureValueAtConstantCurrency) / (c || 1)) * 100).toFixed(1));

  return {
    currentAmount: c,
    inflationRate,
    years: t,
    futureRequiredAmount,
    purchasingPowerLossPercent: Math.min(100, Math.max(0, lossPercent)),
  };
}

export interface SalaryResult {
  annualCtc: number;
  monthlyGross: number;
  basicSalary: number;
  hra: number;
  specialAllowance: number;
  employeePf: number;
  professionalTax: number;
  estimatedNetMonthly: number;
}

export function calcSalary(annualCtc: number): SalaryResult {
  const ctc = Math.max(0, annualCtc);
  const monthlyGross = Number((ctc / 12).toFixed(2));
  const basicSalary = Number((monthlyGross * 0.5).toFixed(2));
  const hra = Number((basicSalary * 0.5).toFixed(2));
  const employeePf = Number(Math.min(1800, basicSalary * 0.12).toFixed(2));
  const professionalTax = 200;
  const specialAllowance = Number(Math.max(0, monthlyGross - (basicSalary + hra)).toFixed(2));
  const estimatedNetMonthly = Number(Math.max(0, monthlyGross - employeePf - professionalTax).toFixed(2));

  return {
    annualCtc: ctc,
    monthlyGross,
    basicSalary,
    hra,
    specialAllowance,
    employeePf,
    professionalTax,
    estimatedNetMonthly,
  };
}

export interface OvertimeResult {
  regularHourlyRate: number;
  regularHours: number;
  otHours: number;
  otMultiplier: number;
  regularPay: number;
  overtimePay: number;
  totalEarnings: number;
}

export function calcOvertime(
  regularHourlyRate: number,
  regularHours: number,
  otHours: number,
  otMultiplier: number = 1.5
): OvertimeResult {
  const rate = Math.max(0, regularHourlyRate);
  const regHrs = Math.max(0, regularHours);
  const otHrs = Math.max(0, otHours);
  const mult = Math.max(1, otMultiplier);

  const regularPay = Number((regHrs * rate).toFixed(2));
  const overtimePay = Number((otHrs * rate * mult).toFixed(2));
  const totalEarnings = Number((regularPay + overtimePay).toFixed(2));

  return {
    regularHourlyRate: rate,
    regularHours: regHrs,
    otHours: otHrs,
    otMultiplier: mult,
    regularPay,
    overtimePay,
    totalEarnings,
  };
}

export interface BreakEvenResult {
  fixedCosts: number;
  variableCostPerUnit: number;
  sellingPricePerUnit: number;
  contributionMargin: number;
  contributionMarginRatio: number;
  breakEvenUnits: number;
  breakEvenRevenue: number;
}

export function calcBreakEven(
  fixedCosts: number,
  variableCostPerUnit: number,
  sellingPricePerUnit: number
): BreakEvenResult {
  const fc = Math.max(0, fixedCosts);
  const vc = Math.max(0, variableCostPerUnit);
  const sp = Math.max(0.01, sellingPricePerUnit);

  const contributionMargin = Number((sp - vc).toFixed(2));
  const contributionMarginRatio = Number(((contributionMargin / sp) * 100).toFixed(1));

  let breakEvenUnits = 0;
  let breakEvenRevenue = 0;
  if (contributionMargin > 0) {
    breakEvenUnits = Math.ceil(fc / contributionMargin);
    breakEvenRevenue = Number((breakEvenUnits * sp).toFixed(2));
  }

  return {
    fixedCosts: fc,
    variableCostPerUnit: vc,
    sellingPricePerUnit: sp,
    contributionMargin,
    contributionMarginRatio,
    breakEvenUnits,
    breakEvenRevenue,
  };
}

// ==========================================
// 2. GENERAL & SCIENTIFIC MATH
// ==========================================

export function gcd(a: number, b: number): number {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export interface FractionResult {
  numerator: number;
  denominator: number;
  simplified: string;
  mixedNumber: string;
  decimal: number;
}

export function calcFraction(
  n1: number,
  d1: number,
  op: '+' | '-' | '*' | '/',
  n2: number,
  d2: number
): FractionResult {
  const den1 = d1 === 0 ? 1 : d1;
  const den2 = d2 === 0 ? 1 : d2;

  let num = 0;
  let den = 1;

  if (op === '+') {
    num = n1 * den2 + n2 * den1;
    den = den1 * den2;
  } else if (op === '-') {
    num = n1 * den2 - n2 * den1;
    den = den1 * den2;
  } else if (op === '*') {
    num = n1 * n2;
    den = den1 * den2;
  } else {
    num = n1 * den2;
    den = den1 * (n2 === 0 ? 1 : n2);
  }

  const common = gcd(num, den);
  const sNum = num / common;
  const sDen = den / common;

  const whole = Math.floor(Math.abs(sNum) / Math.abs(sDen));
  const rem = Math.abs(sNum) % Math.abs(sDen);
  const sign = sNum / sDen < 0 ? '-' : '';

  let mixedNumber = `${sign}${whole}`;
  if (rem > 0) {
    mixedNumber = whole > 0 ? `${sign}${whole} ${rem}/${Math.abs(sDen)}` : `${sign}${rem}/${Math.abs(sDen)}`;
  }

  return {
    numerator: sNum,
    denominator: sDen,
    simplified: `${sNum}/${sDen}`,
    mixedNumber,
    decimal: Number((sNum / sDen).toFixed(6)),
  };
}

export interface RatioResult {
  simplifiedRatio: string;
  solvedFourthTerm?: number;
  scalingFactor: number;
}

export function calcRatio(a: number, b: number, c?: number): RatioResult {
  const valA = Math.max(0.001, Math.abs(a));
  const valB = Math.max(0.001, Math.abs(b));
  const g = gcd(Math.round(valA * 100), Math.round(valB * 100));
  const simpA = Math.round(valA * 100) / g;
  const simpB = Math.round(valB * 100) / g;

  let solvedFourthTerm: number | undefined;
  if (c !== undefined && c > 0) {
    solvedFourthTerm = Number(((valB * c) / valA).toFixed(4));
  }

  return {
    simplifiedRatio: `${simpA} : ${simpB}`,
    solvedFourthTerm,
    scalingFactor: Number((valA / valB).toFixed(4)),
  };
}

export interface AverageResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  stdDev: number;
  variance: number;
}

export function calcAverage(numbers: number[]): AverageResult {
  if (numbers.length === 0) {
    return { count: 0, sum: 0, mean: 0, median: 0, mode: [], min: 0, max: 0, range: 0, stdDev: 0, variance: 0 };
  }

  const sorted = [...numbers].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = Number(sorted.reduce((acc, curr) => acc + curr, 0).toFixed(4));
  const mean = Number((sum / count).toFixed(4));

  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(4));

  const freq: Record<number, number> = {};
  let maxFreq = 0;
  for (const n of sorted) {
    freq[n] = (freq[n] || 0) + 1;
    if (freq[n] > maxFreq) maxFreq = freq[n];
  }
  const mode = maxFreq > 1 ? Object.keys(freq).filter((k) => freq[Number(k)] === maxFreq).map(Number) : [];

  const min = sorted[0];
  const max = sorted[count - 1];
  const range = Number((max - min).toFixed(4));

  const variance = Number((sorted.reduce((acc, n) => acc + Math.pow(n - mean, 2), 0) / count).toFixed(4));
  const stdDev = Number(Math.sqrt(variance).toFixed(4));

  return { count, sum, mean, median, mode, min, max, range, stdDev, variance };
}

export function calcProbability(
  type: 'single' | 'nPr' | 'nCr',
  n: number,
  r: number = 1
): { value: number; formatted: string } {
  const safeN = Math.floor(Math.max(0, Math.min(100, n)));
  const safeR = Math.floor(Math.max(0, Math.min(safeN, r)));

  if (type === 'single') {
    const prob = safeR === 0 ? 0 : Number((safeN / safeR).toFixed(4));
    return {
      value: Math.min(1, prob),
      formatted: `${(Math.min(1, prob) * 100).toFixed(2)}%`,
    };
  }

  const fact = (num: number): number => {
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    return res;
  };

  if (type === 'nPr') {
    const res = fact(safeN) / fact(safeN - safeR);
    return { value: res, formatted: `${safeN}P${safeR} = ${res.toLocaleString()}` };
  } else {
    const res = fact(safeN) / (fact(safeR) * fact(safeN - safeR));
    return { value: res, formatted: `${safeN}C${safeR} = ${res.toLocaleString()}` };
  }
}

// ==========================================
// 3. UNIT CONVERTERS
// ==========================================

export interface UnitConversionEntry {
  unit: string;
  label: string;
  value: number;
  formatted: string;
}

export interface UnitCategoryData {
  baseUnit: string;
  units: Record<string, { label: string; toBase: number | ((val: number) => number); fromBase: number | ((val: number) => number) }>;
}

export const UNIT_CATEGORIES: Record<string, UnitCategoryData> = {
  length: {
    baseUnit: 'm',
    units: {
      mm: { label: 'Millimeter (mm)', toBase: 0.001, fromBase: 1000 },
      cm: { label: 'Centimeter (cm)', toBase: 0.01, fromBase: 100 },
      m: { label: 'Meter (m)', toBase: 1, fromBase: 1 },
      km: { label: 'Kilometer (km)', toBase: 1000, fromBase: 0.001 },
      inch: { label: 'Inch (in)', toBase: 0.0254, fromBase: 39.3701 },
      foot: { label: 'Foot (ft)', toBase: 0.3048, fromBase: 3.28084 },
      yard: { label: 'Yard (yd)', toBase: 0.9144, fromBase: 1.09361 },
      mile: { label: 'Mile (mi)', toBase: 1609.34, fromBase: 0.000621371 },
      nm: { label: 'Nautical Mile (nmi)', toBase: 1852, fromBase: 0.000539957 },
    },
  },
  weight: {
    baseUnit: 'kg',
    units: {
      mg: { label: 'Milligram (mg)', toBase: 0.000001, fromBase: 1000000 },
      g: { label: 'Gram (g)', toBase: 0.001, fromBase: 1000 },
      kg: { label: 'Kilogram (kg)', toBase: 1, fromBase: 1 },
      ton: { label: 'Metric Ton (t)', toBase: 1000, fromBase: 0.001 },
      oz: { label: 'Ounce (oz)', toBase: 0.0283495, fromBase: 35.274 },
      lb: { label: 'Pound (lb)', toBase: 0.453592, fromBase: 2.20462 },
      stone: { label: 'Stone (st)', toBase: 6.35029, fromBase: 0.157473 },
    },
  },
  temperature: {
    baseUnit: 'c',
    units: {
      c: { label: 'Celsius (°C)', toBase: (v) => v, fromBase: (v) => v },
      f: { label: 'Fahrenheit (°F)', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      k: { label: 'Kelvin (K)', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    },
  },
  area: {
    baseUnit: 'sq_m',
    units: {
      sq_m: { label: 'Square Meter (m²)', toBase: 1, fromBase: 1 },
      sq_km: { label: 'Square Kilometer (km²)', toBase: 1000000, fromBase: 0.000001 },
      sq_ft: { label: 'Square Foot (ft²)', toBase: 0.092903, fromBase: 10.7639 },
      sq_yd: { label: 'Square Yard (yd²)', toBase: 0.836127, fromBase: 1.19599 },
      acre: { label: 'Acre (ac)', toBase: 4046.86, fromBase: 0.000247105 },
      hectare: { label: 'Hectare (ha)', toBase: 10000, fromBase: 0.0001 },
    },
  },
  volume: {
    baseUnit: 'l',
    units: {
      ml: { label: 'Milliliter (mL)', toBase: 0.001, fromBase: 1000 },
      l: { label: 'Liter (L)', toBase: 1, fromBase: 1 },
      cubic_m: { label: 'Cubic Meter (m³)', toBase: 1000, fromBase: 0.001 },
      cup: { label: 'Cup (US)', toBase: 0.236588, fromBase: 4.22675 },
      pint: { label: 'Pint (US)', toBase: 0.473176, fromBase: 2.11338 },
      gallon: { label: 'Gallon (US)', toBase: 3.78541, fromBase: 0.264172 },
      fl_oz: { label: 'Fluid Ounce (fl oz)', toBase: 0.0295735, fromBase: 33.814 },
    },
  },
  speed: {
    baseUnit: 'mps',
    units: {
      mps: { label: 'Meters/sec (m/s)', toBase: 1, fromBase: 1 },
      kmh: { label: 'Kilometers/hour (km/h)', toBase: 0.277778, fromBase: 3.6 },
      mph: { label: 'Miles/hour (mph)', toBase: 0.44704, fromBase: 2.23694 },
      knot: { label: 'Knots (kn)', toBase: 0.514444, fromBase: 1.94384 },
    },
  },
  pressure: {
    baseUnit: 'pa',
    units: {
      pa: { label: 'Pascal (Pa)', toBase: 1, fromBase: 1 },
      kpa: { label: 'Kilopascal (kPa)', toBase: 1000, fromBase: 0.001 },
      bar: { label: 'Bar', toBase: 100000, fromBase: 0.00001 },
      psi: { label: 'PSI (lbf/in²)', toBase: 6894.76, fromBase: 0.000145038 },
      atm: { label: 'Atmosphere (atm)', toBase: 101325, fromBase: 0.00000986923 },
      mmhg: { label: 'mmHg / Torr', toBase: 133.322, fromBase: 0.00750062 },
    },
  },
  data_storage: {
    baseUnit: 'b',
    units: {
      b: { label: 'Bytes (B)', toBase: 1, fromBase: 1 },
      kb: { label: 'Kilobytes (KB - 10³)', toBase: 1000, fromBase: 0.001 },
      mb: { label: 'Megabytes (MB - 10⁶)', toBase: 1000000, fromBase: 0.000001 },
      gb: { label: 'Gigabytes (GB - 10⁹)', toBase: 1000000000, fromBase: 0.000000001 },
      tb: { label: 'Terabytes (TB - 10¹²)', toBase: 1000000000000, fromBase: 0.000000000001 },
      kib: { label: 'Kibibytes (KiB - 2¹⁰)', toBase: 1024, fromBase: 1 / 1024 },
      mib: { label: 'Mebibytes (MiB - 2²⁰)', toBase: 1048576, fromBase: 1 / 1048576 },
      gib: { label: 'Gibibytes (GiB - 2³⁰)', toBase: 1073741824, fromBase: 1 / 1073741824 },
    },
  },
};

export function convertUnits(
  category: string,
  fromUnit: string,
  value: number
): UnitConversionEntry[] {
  const cat = UNIT_CATEGORIES[category] || UNIT_CATEGORIES.length;
  const fromDef = cat.units[fromUnit] || Object.values(cat.units)[0];

  let baseVal = 0;
  if (typeof fromDef.toBase === 'function') {
    baseVal = fromDef.toBase(value);
  } else {
    baseVal = value * fromDef.toBase;
  }

  return Object.entries(cat.units).map(([unitKey, unitDef]) => {
    let converted = 0;
    if (typeof unitDef.fromBase === 'function') {
      converted = unitDef.fromBase(baseVal);
    } else {
      converted = baseVal * unitDef.fromBase;
    }

    return {
      unit: unitKey,
      label: unitDef.label,
      value: Number(converted.toFixed(6)),
      formatted: `${Number(converted.toFixed(6)).toLocaleString()} ${unitKey}`,
    };
  });
}

// ==========================================
// 4. DATE, AGE & TIME SCHEDULING
// ==========================================

export function calculateDetailedAge(birthDateStr: string, targetDateStr?: string) {
  if (!birthDateStr) return null;
  const birth = new Date(birthDateStr);
  const target = targetDateStr ? new Date(targetDateStr) : new Date();
  if (isNaN(birth.getTime()) || isNaN(target.getTime()) || target < birth) return null;

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const prevMonthDays = new Date(target.getFullYear(), target.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years--;
    months += 12;
  }

  const diffMs = target.getTime() - birth.getTime();
  const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.floor(totalDays / 7);
  const totalHours = Math.floor(diffMs / (1000 * 60 * 60));

  const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday < target) {
    nextBday.setFullYear(target.getFullYear() + 1);
  }
  const daysToNextBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

  return { years, months, days, totalDays, totalWeeks, totalHours, daysToNextBday };
}

export function calculateDateDifference(d1Str: string, d2Str: string) {
  if (!d1Str || !d2Str) return null;
  const start = new Date(d1Str);
  const end = new Date(d2Str);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

  const isReversed = end < start;
  const [earlier, later] = isReversed ? [end, start] : [start, end];

  const diffMs = later.getTime() - earlier.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const fullWeeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  let businessDays = 0;
  const cur = new Date(earlier);
  while (cur < later) {
    const day = cur.getDay();
    if (day !== 0 && day !== 6) businessDays++;
    cur.setDate(cur.getDate() + 1);
  }

  return {
    isReversed,
    totalDays,
    weeks: fullWeeks,
    remainingDays,
    businessDays,
    weekendDays: totalDays - businessDays,
  };
}

export function getIsoWeek(date: Date): { week: number; year: number; start: Date; end: Date } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  const monday = new Date(date);
  const currentDay = monday.getDay();
  const distToMon = (currentDay + 6) % 7;
  monday.setDate(monday.getDate() - distToMon);

  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return { week: weekNo, year: d.getUTCFullYear(), start: monday, end: sunday };
}

// ==========================================
// 5. NUMBER TO WORDS & ROMAN NUMERALS
// ==========================================

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const SCALES = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];

function convertChunk(num: number): string {
  let chunkStr = '';
  if (num >= 100) {
    chunkStr += ONES[Math.floor(num / 100)] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    chunkStr += TENS[Math.floor(num / 10)] + (num % 10 !== 0 ? '-' + ONES[num % 10] : '') + ' ';
  } else if (num > 0) {
    chunkStr += ONES[num] + ' ';
  }
  return chunkStr.trim();
}

export function integerToEnglish(num: number): string {
  if (num === 0) return 'Zero';
  if (num < 0) return 'Negative ' + integerToEnglish(Math.abs(num));
  let n = Math.floor(num);
  let scaleIndex = 0;
  const parts: string[] = [];

  while (n > 0) {
    const chunk = n % 1000;
    if (chunk !== 0) {
      const chunkText = convertChunk(chunk);
      const scaleText = SCALES[scaleIndex];
      parts.unshift(scaleText ? `${chunkText} ${scaleText}` : chunkText);
    }
    n = Math.floor(n / 1000);
    scaleIndex++;
  }

  return parts.join(' ').trim();
}

export function numberToWordsWithCurrency(num: number, currency: 'USD' | 'EUR' | 'GBP' | 'INR' = 'USD'): string {
  const isNeg = num < 0;
  const abs = Math.abs(num);
  const dollars = Math.floor(abs);
  const cents = Math.round((abs - dollars) * 100);

  const dollarWords = integerToEnglish(dollars);
  const centWords = cents > 0 ? integerToEnglish(cents) : '';

  const units: Record<string, { major: string; minor: string }> = {
    USD: { major: dollars === 1 ? 'Dollar' : 'Dollars', minor: cents === 1 ? 'Cent' : 'Cents' },
    EUR: { major: 'Euros', minor: cents === 1 ? 'Cent' : 'Cents' },
    GBP: { major: dollars === 1 ? 'Pound' : 'Pounds', minor: cents === 1 ? 'Pence' : 'Pence' },
    INR: { major: 'Rupees', minor: cents === 1 ? 'Paise' : 'Paise' },
  };

  const unit = units[currency] || units.USD;
  let res = `${isNeg ? 'Negative ' : ''}${dollarWords} ${unit.major}`;
  if (cents > 0) {
    res += ` and ${centWords} ${unit.minor}`;
  }
  return res;
}

export function toRomanNumeral(num: number): string {
  if (!Number.isInteger(num) || num <= 0 || num > 3999) {
    throw new Error('Roman numerals support integers between 1 and 3,999.');
  }
  const romanMap: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let res = '';
  let n = num;
  for (const [val, symbol] of romanMap) {
    while (n >= val) {
      res += symbol;
      n -= val;
    }
  }
  return res;
}

export function fromRomanNumeral(str: string): number {
  const clean = str.trim().toUpperCase();
  if (!clean) throw new Error('Please enter a Roman numeral');
  if (!/^[MDCLXVI]+$/.test(clean)) throw new Error('Contains invalid Roman characters');

  const romanValues: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };

  let total = 0;
  for (let i = 0; i < clean.length; i++) {
    const cur = romanValues[clean[i]];
    const next = romanValues[clean[i + 1]] || 0;
    if (cur < next) {
      total -= cur;
    } else {
      total += cur;
    }
  }

  if (total <= 0 || total > 3999 || toRomanNumeral(total) !== clean) {
    throw new Error('Invalid Roman numeral formatting');
  }
  return total;
}
