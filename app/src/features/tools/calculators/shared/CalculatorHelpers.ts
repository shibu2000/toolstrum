/**
 * Pure offline mathematical calculation engines for Toolstrum Calculators Studio.
 * Zero external network access or cloud dependencies.
 */

// ==========================================
// 1. FINANCIAL & BUSINESS CALCULATORS
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

  // EMI = [P * r * (1 + r)^N] / [(1 + r)^N - 1]
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
    annualRate: annualRate,
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

  // M = P * ({[1 + i]^n - 1} / i) * (1 + i)
  const totalMaturityValue = Number(
    (P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i)).toFixed(2)
  );
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

export interface InvestmentReturnResult {
  initialInvestment: number;
  finalValue: number;
  years: number;
  totalGain: number;
  absoluteReturn: number;
  cagr: number;
}

export function calcInvestmentReturn(initial: number, final: number, years: number): InvestmentReturnResult {
  const init = Math.max(1, initial);
  const fin = Math.max(0, final);
  const y = Math.max(0.1, years);

  const totalGain = Number((fin - init).toFixed(2));
  const absoluteReturn = Number((((fin - init) / init) * 100).toFixed(2));
  const cagr = Number(((Math.pow(fin / init, 1 / y) - 1) * 100).toFixed(2));

  return {
    initialInvestment: init,
    finalValue: fin,
    years: y,
    totalGain,
    absoluteReturn,
    cagr,
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

export interface FuelCostResult {
  distanceKm: number;
  mileageKmPerL: number;
  fuelPricePerL: number;
  litersRequired: number;
  totalFuelCost: number;
  costPerKm: number;
}

export function calcFuelCost(distanceKm: number, mileageKmPerL: number, fuelPricePerL: number): FuelCostResult {
  const dist = Math.max(0, distanceKm);
  const mileage = Math.max(0.1, mileageKmPerL);
  const price = Math.max(0, fuelPricePerL);

  const litersRequired = Number((dist / mileage).toFixed(2));
  const totalFuelCost = Number((litersRequired * price).toFixed(2));
  const costPerKm = Number((dist > 0 ? totalFuelCost / dist : 0).toFixed(2));

  return {
    distanceKm: dist,
    mileageKmPerL: mileage,
    fuelPricePerL: price,
    litersRequired,
    totalFuelCost,
    costPerKm,
  };
}

export interface MileageResult {
  distanceKm: number;
  fuelLiters: number;
  kmPerLiter: number;
  mpgUS: number;
  litersPer100Km: number;
}

export function calcMileage(distanceKm: number, fuelLiters: number): MileageResult {
  const d = Math.max(0, distanceKm);
  const f = Math.max(0.001, fuelLiters);

  const kmPerLiter = Number((d / f).toFixed(2));
  // 1 km/L = 2.35214583 MPG (US)
  const mpgUS = Number((kmPerLiter * 2.35215).toFixed(2));
  // L/100km = (fuel / distance) * 100
  const litersPer100Km = Number((d > 0 ? (f / d) * 100 : 0).toFixed(2));

  return {
    distanceKm: d,
    fuelLiters: f,
    kmPerLiter,
    mpgUS,
    litersPer100Km,
  };
}

export interface ElectricityBillResult {
  unitsKwh: number;
  ratePerUnit: number;
  fixedCharges: number;
  energyCharges: number;
  taxAmount: number;
  totalBill: number;
}

export function calcElectricityBill(
  unitsKwh: number,
  ratePerUnit: number,
  fixedCharges: number = 50,
  taxPercent: number = 5
): ElectricityBillResult {
  const units = Math.max(0, unitsKwh);
  const rate = Math.max(0, ratePerUnit);
  const fixed = Math.max(0, fixedCharges);
  const tax = Math.max(0, taxPercent);

  const energyCharges = Number((units * rate).toFixed(2));
  const subtotal = energyCharges + fixed;
  const taxAmount = Number(((subtotal * tax) / 100).toFixed(2));
  const totalBill = Number((subtotal + taxAmount).toFixed(2));

  return {
    unitsKwh: units,
    ratePerUnit: rate,
    fixedCharges: fixed,
    energyCharges,
    taxAmount,
    totalBill,
  };
}

export interface TipResult {
  billAmount: number;
  tipPercent: number;
  splitCount: number;
  tipAmount: number;
  totalWithTip: number;
  perPersonTip: number;
  perPersonTotal: number;
}

export function calcTip(billAmount: number, tipPercent: number, splitCount: number = 1): TipResult {
  const b = Math.max(0, billAmount);
  const t = Math.max(0, tipPercent);
  const s = Math.max(1, Math.round(splitCount));

  const tipAmount = Number(((b * t) / 100).toFixed(2));
  const totalWithTip = Number((b + tipAmount).toFixed(2));
  const perPersonTip = Number((tipAmount / s).toFixed(2));
  const perPersonTotal = Number((totalWithTip / s).toFixed(2));

  return {
    billAmount: b,
    tipPercent: t,
    splitCount: s,
    tipAmount,
    totalWithTip,
    perPersonTip,
    perPersonTotal,
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
  const contributionMarginRatio = Number(
    ((contributionMargin / sp) * 100).toFixed(1)
  );

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

export interface UnitPriceItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  unitPrice: number;
  isBestValue?: boolean;
}

export function calcUnitPrice(items: Omit<UnitPriceItem, 'unitPrice' | 'isBestValue'>[]): UnitPriceItem[] {
  if (items.length === 0) return [];
  const calculated = items.map((it) => {
    const q = Math.max(0.001, it.quantity);
    const p = Math.max(0, it.price);
    const unitPrice = Number((p / q).toFixed(4));
    return { ...it, unitPrice };
  });

  const minUnitPrice = Math.min(...calculated.map((c) => c.unitPrice));
  return calculated.map((c) => ({
    ...c,
    isBestValue: c.unitPrice === minUnitPrice,
  }));
}

// ==========================================
// 2. GENERAL & SCIENTIFIC MATH
// ==========================================

export function calcStandard(expr: string): { result: number; error?: string } {
  try {
    const raw = expr.trim();
    if (!raw) return { result: 0 };
    if (/[a-zA-Z]/.test(raw)) {
      return { result: 0, error: 'Invalid characters in expression' };
    }
    const sanitized = raw.replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/().%^ ]/g, '');
    if (!sanitized.trim()) return { result: 0, error: 'Empty expression' };
    // Safe numeric parser for standard arithmetic
    // eslint-disable-next-line no-new-func
    const fn = new Function(`'use strict'; return (${sanitized.replace(/\^/g, '**')});`);
    const val = fn();
    if (typeof val === 'number' && !isNaN(val) && isFinite(val)) {
      return { result: Number(val.toFixed(8)) };
    }
    return { result: 0, error: 'Undefined result' };
  } catch (e: any) {
    return { result: 0, error: 'Invalid expression' };
  }
}

export function calcScientific(operation: string, val: number, extra: number = 0): number {
  switch (operation) {
    case 'sin':
      return Number(Math.sin((val * Math.PI) / 180).toFixed(8));
    case 'cos':
      return Number(Math.cos((val * Math.PI) / 180).toFixed(8));
    case 'tan':
      return Number(Math.tan((val * Math.PI) / 180).toFixed(8));
    case 'asin':
      return Number(((Math.asin(val) * 180) / Math.PI).toFixed(8));
    case 'acos':
      return Number(((Math.acos(val) * 180) / Math.PI).toFixed(8));
    case 'atan':
      return Number(((Math.atan(val) * 180) / Math.PI).toFixed(8));
    case 'log':
      return Number(Math.log10(val).toFixed(8));
    case 'ln':
      return Number(Math.log(val).toFixed(8));
    case 'sqrt':
      return Number(Math.sqrt(val).toFixed(8));
    case 'cbrt':
      return Number(Math.cbrt(val).toFixed(8));
    case 'power':
      return Number(Math.pow(val, extra).toFixed(8));
    case 'factorial': {
      const n = Math.floor(Math.max(0, Math.min(100, val)));
      let res = 1;
      for (let i = 2; i <= n; i++) res *= i;
      return res;
    }
    case 'abs':
      return Math.abs(val);
    case 'pi':
      return Math.PI;
    case 'e':
      return Math.E;
    default:
      return val;
  }
}

export function calcPercentage(
  mode: 'percent_of' | 'is_what_percent' | 'percent_change',
  a: number,
  b: number
): { result: number; label: string } {
  if (mode === 'percent_of') {
    // a% of b
    const res = Number(((a * b) / 100).toFixed(4));
    return { result: res, label: `${a}% of ${b} is ${res}` };
  } else if (mode === 'is_what_percent') {
    // a is what % of b
    const denom = b === 0 ? 1 : b;
    const res = Number(((a / denom) * 100).toFixed(4));
    return { result: res, label: `${a} is ${res}% of ${b}` };
  } else {
    // Percentage change from a to b
    const denom = a === 0 ? 1 : a;
    const diff = b - a;
    const res = Number(((diff / Math.abs(denom)) * 100).toFixed(4));
    const dir = res >= 0 ? 'increase' : 'decrease';
    return { result: res, label: `${Math.abs(res)}% ${dir} from ${a} to ${b}` };
  }
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
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
    // a / b = c / d => d = (b * c) / a
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

  // Median
  const mid = Math.floor(count / 2);
  const median = count % 2 !== 0 ? sorted[mid] : Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(4));

  // Mode
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

  // Variance & StdDev
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
    // Probability of favorable outcomes / total
    const prob = safeR === 0 ? 0 : Number((safeN / safeR).toFixed(4));
    return {
      value: Math.min(1, prob),
      formatted: `${(Math.min(1, prob) * 100).toFixed(2)}%`,
    };
  }

  // Factorials
  const fact = (num: number): number => {
    let res = 1;
    for (let i = 2; i <= num; i++) res *= i;
    return res;
  };

  if (type === 'nPr') {
    // nPr = n! / (n - r)!
    const res = fact(safeN) / fact(safeN - safeR);
    return { value: res, formatted: `${safeN}P${safeR} = ${res.toLocaleString()}` };
  } else {
    // nCr = n! / (r! * (n - r)!)
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
      nm: { label: 'Nautical Mile', toBase: 1852, fromBase: 0.000539957 },
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
      atm: { label: 'Standard Atmosphere (atm)', toBase: 101325, fromBase: 0.00000986923 },
      mmhg: { label: 'Millimeter of Mercury (mmHg)', toBase: 133.322, fromBase: 0.00750062 },
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

  // Convert to base
  let baseVal = 0;
  if (typeof fromDef.toBase === 'function') {
    baseVal = fromDef.toBase(value);
  } else {
    baseVal = value * fromDef.toBase;
  }

  // Convert base to all units in category
  return Object.entries(cat.units).map(([unitKey, def]) => {
    let converted = 0;
    if (typeof def.fromBase === 'function') {
      converted = def.fromBase(baseVal);
    } else {
      converted = baseVal * def.fromBase;
    }
    const rounded = Number(converted.toFixed(6));
    return {
      unit: unitKey,
      label: def.label,
      value: rounded,
      formatted: rounded.toLocaleString(undefined, { maximumFractionDigits: 6 }),
    };
  });
}

// ==========================================
// 4. DATE, TIME & CALENDAR
// ==========================================

export interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  daysUntilNextBirthday: number;
  dayOfWeekBorn: string;
}

export function calcAge(birthDateStr: string, asOfDateStr?: string): AgeResult {
  const birth = new Date(birthDateStr);
  const now = asOfDateStr ? new Date(asOfDateStr) : new Date();

  if (isNaN(birth.getTime())) {
    return { years: 0, months: 0, days: 0, totalDays: 0, totalWeeks: 0, totalMonths: 0, daysUntilNextBirthday: 0, dayOfWeekBorn: '' };
  }

  const daysDiff = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const nextBday = new Date(now.getFullYear(), birth.getMonth(), birth.getDate());
  if (nextBday < now) {
    nextBday.setFullYear(now.getFullYear() + 1);
  }
  const daysUntilNextBirthday = Math.ceil((nextBday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeekBorn = daysOfWeek[birth.getDay()];

  return {
    years: Math.max(0, years),
    months: Math.max(0, months),
    days: Math.max(0, days),
    totalDays: Math.max(0, daysDiff),
    totalWeeks: Math.max(0, Math.floor(daysDiff / 7)),
    totalMonths: Math.max(0, years * 12 + months),
    daysUntilNextBirthday,
    dayOfWeekBorn,
  };
}

export interface DateDiffResult {
  totalDays: number;
  weeks: number;
  remainingDays: number;
  businessDays: number;
  weekendDays: number;
  formattedDuration: string;
}

export function calcDateDiff(startStr: string, endStr: string): DateDiffResult {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { totalDays: 0, weeks: 0, remainingDays: 0, businessDays: 0, weekendDays: 0, formattedDuration: '0 days' };
  }

  const minDate = start <= end ? start : end;
  const maxDate = start <= end ? end : start;

  const totalDays = Math.round((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  const weeks = Math.floor(totalDays / 7);
  const remainingDays = totalDays % 7;

  let businessDays = 0;
  let weekendDays = 0;
  const cur = new Date(minDate);
  while (cur < maxDate) {
    const day = cur.getDay();
    if (day === 0 || day === 6) {
      weekendDays++;
    } else {
      businessDays++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return {
    totalDays,
    weeks,
    remainingDays,
    businessDays,
    weekendDays,
    formattedDuration: `${weeks} weeks, ${remainingDays} days (${totalDays} total days)`,
  };
}

export function calcDateAddSub(
  baseStr: string,
  amount: number,
  unit: 'days' | 'weeks' | 'months' | 'years',
  isAdd: boolean
): { targetDateStr: string; formatted: string } {
  const d = new Date(baseStr);
  if (isNaN(d.getTime())) return { targetDateStr: '', formatted: '' };

  const delta = isAdd ? amount : -amount;
  if (unit === 'days') d.setDate(d.getDate() + delta);
  else if (unit === 'weeks') d.setDate(d.getDate() + delta * 7);
  else if (unit === 'months') d.setMonth(d.getMonth() + delta);
  else if (unit === 'years') d.setFullYear(d.getFullYear() + delta);

  return {
    targetDateStr: d.toISOString().split('T')[0],
    formatted: d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }),
  };
}

export interface WorkHoursResult {
  totalHours: number;
  breakDeductionHours: number;
  billableHours: number;
  hourlyRate: number;
  grossPay: number;
}

export function calcWorkHours(
  startHour: number,
  startMin: number,
  endHour: number,
  endMin: number,
  breakMinutes: number,
  hourlyRate: number = 0
): WorkHoursResult {
  let startMinutes = startHour * 60 + startMin;
  let endMinutes = endHour * 60 + endMin;
  if (endMinutes < startMinutes) endMinutes += 24 * 60; // Overnight shift

  const totalMin = Math.max(0, endMinutes - startMinutes);
  const breakMin = Math.max(0, breakMinutes);
  const billableMin = Math.max(0, totalMin - breakMin);

  const totalHours = Number((totalMin / 60).toFixed(2));
  const breakDeductionHours = Number((breakMin / 60).toFixed(2));
  const billableHours = Number((billableMin / 60).toFixed(2));
  const grossPay = Number((billableHours * hourlyRate).toFixed(2));

  return {
    totalHours,
    breakDeductionHours,
    billableHours,
    hourlyRate,
    grossPay,
  };
}

export interface CalendarWeekResult {
  isoWeek: number;
  dayOfYear: number;
  daysRemainingInYear: number;
  isLeapYear: boolean;
}

export function calcCalendarWeek(dateStr: string): CalendarWeekResult {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { isoWeek: 1, dayOfYear: 1, daysRemainingInYear: 364, isLeapYear: false };

  const year = d.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

  const startOfYear = new Date(year, 0, 1);
  const dayOfYear = Math.floor((d.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysInYear = isLeapYear ? 366 : 365;
  const daysRemainingInYear = daysInYear - dayOfYear;

  // ISO Week
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const isoWeek = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);

  return { isoWeek, dayOfYear, daysRemainingInYear, isLeapYear };
}

// ==========================================
// 5. HEALTH & LIFESTYLE
// ==========================================

export interface BmiResult {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese Class I' | 'Obese Class II+';
  healthyWeightMinKg: number;
  healthyWeightMaxKg: number;
  prime: number;
}

export function calcBmi(weightKg: number, heightCm: number): BmiResult {
  const w = Math.max(1, weightKg);
  const hM = Math.max(0.5, heightCm / 100);

  const bmi = Number((w / (hM * hM)).toFixed(1));
  let category: BmiResult['category'] = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal weight';
  else if (bmi < 30) category = 'Overweight';
  else if (bmi < 35) category = 'Obese Class I';
  else category = 'Obese Class II+';

  const healthyWeightMinKg = Number((18.5 * hM * hM).toFixed(1));
  const healthyWeightMaxKg = Number((24.9 * hM * hM).toFixed(1));
  const prime = Number((bmi / 25).toFixed(2));

  return {
    bmi,
    category,
    healthyWeightMinKg,
    healthyWeightMaxKg,
    prime,
  };
}

export interface CalorieResult {
  bmr: number;
  tdee: number;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export function calcCalories(
  age: number,
  gender: 'male' | 'female',
  weightKg: number,
  heightCm: number,
  activityMultiplier: number = 1.375,
  goal: 'lose' | 'maintain' | 'gain' = 'maintain'
): CalorieResult {
  const a = Math.max(10, Math.min(100, age));
  const w = Math.max(30, weightKg);
  const h = Math.max(100, heightCm);

  // Mifflin-St Jeor Formula
  let bmr = 10 * w + 6.25 * h - 5 * a;
  bmr += gender === 'male' ? 5 : -161;
  bmr = Math.round(bmr);

  const tdee = Math.round(bmr * activityMultiplier);

  let targetCalories = tdee;
  if (goal === 'lose') targetCalories -= 500;
  else if (goal === 'gain') targetCalories += 400;

  // Macros: 30% Protein, 40% Carbs, 30% Fat
  const proteinGrams = Math.round((targetCalories * 0.3) / 4);
  const carbsGrams = Math.round((targetCalories * 0.4) / 4);
  const fatGrams = Math.round((targetCalories * 0.3) / 9);

  return {
    bmr,
    tdee,
    targetCalories,
    proteinGrams,
    carbsGrams,
    fatGrams,
  };
}

// ==========================================
// 6. NUMERICS & RANDOM
// ==========================================

export interface NumberSystemResult {
  decimal: number;
  binary: string;
  octal: string;
  hexadecimal: string;
}

export function convertNumberSystem(val: string, fromBase: 2 | 8 | 10 | 16): NumberSystemResult {
  try {
    const cleaned = val.trim();
    if (!cleaned) return { decimal: 0, binary: '0', octal: '0', hexadecimal: '0' };
    const dec = parseInt(cleaned, fromBase);
    if (isNaN(dec)) return { decimal: 0, binary: '0', octal: '0', hexadecimal: '0' };

    return {
      decimal: dec,
      binary: dec.toString(2),
      octal: dec.toString(8),
      hexadecimal: dec.toString(16).toUpperCase(),
    };
  } catch {
    return { decimal: 0, binary: '0', octal: '0', hexadecimal: '0' };
  }
}

export function numberToWords(num: number): string {
  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'zero';

  const units = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
    'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
  const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  const convertChunk = (val: number): string => {
    let chunkStr = '';
    if (val >= 100) {
      chunkStr += units[Math.floor(val / 100)] + ' hundred ';
      val %= 100;
    }
    if (val >= 20) {
      chunkStr += tens[Math.floor(val / 10)] + (val % 10 > 0 ? '-' + units[val % 10] : '');
    } else if (val > 0) {
      chunkStr += units[val];
    }
    return chunkStr.trim();
  };

  const scales = ['', 'thousand', 'million', 'billion', 'trillion'];
  let words = '';
  let scaleIdx = 0;
  let remaining = n;

  while (remaining > 0) {
    const chunk = remaining % 1000;
    if (chunk > 0) {
      const chunkWords = convertChunk(chunk);
      words = `${chunkWords} ${scales[scaleIdx]} ${words}`.trim();
    }
    remaining = Math.floor(remaining / 1000);
    scaleIdx++;
  }

  return (num < 0 ? 'negative ' : '') + words;
}

export function arabicToRoman(num: number): string {
  if (num <= 0 || num > 3999) return 'Value must be between 1 and 3999';
  const valMap: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ];

  let res = '';
  let remaining = num;
  for (const [val, roman] of valMap) {
    while (remaining >= val) {
      res += roman;
      remaining -= val;
    }
  }
  return res;
}

export function romanToArabic(roman: string): number {
  const map: Record<string, number> = {
    I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
  };
  const str = roman.toUpperCase().trim();
  let total = 0;
  for (let i = 0; i < str.length; i++) {
    const current = map[str[i]] || 0;
    const next = map[str[i + 1]] || 0;
    if (current < next) {
      total -= current;
    } else {
      total += current;
    }
  }
  return total;
}

export function generateRandomNumbers(min: number, max: number, count: number, unique: boolean): number[] {
  const c = Math.max(1, Math.min(100, count));
  const low = Math.min(min, max);
  const high = Math.max(min, max);
  const range = high - low + 1;

  if (unique && c > range) {
    return [];
  }

  const results: number[] = [];
  const set = new Set<number>();

  while (results.length < c) {
    const r = Math.floor(Math.random() * range) + low;
    if (unique) {
      if (!set.has(r)) {
        set.add(r);
        results.push(r);
      }
    } else {
      results.push(r);
    }
  }
  return results;
}

export interface DiceResult {
  rolls: number[];
  sum: number;
  modifier: number;
  totalWithMod: number;
}

export function rollDice(sides: number, count: number, modifier: number = 0): DiceResult {
  const s = Math.max(2, sides);
  const c = Math.max(1, Math.min(20, count));

  const rolls: number[] = [];
  for (let i = 0; i < c; i++) {
    rolls.push(Math.floor(Math.random() * s) + 1);
  }
  const sum = rolls.reduce((acc, curr) => acc + curr, 0);
  const totalWithMod = sum + modifier;

  return { rolls, sum, modifier, totalWithMod };
}
