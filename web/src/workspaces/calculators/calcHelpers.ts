// Pure client-side calculations and helpers for Calculators Studio

// ---------------------------------------------------------------------------
// Math & Fractions
// ---------------------------------------------------------------------------
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

export function simplifyFraction(numerator: number, denominator: number): {
  num: number;
  den: number;
  whole?: number;
  remNum?: number;
} {
  if (denominator === 0) throw new Error('Denominator cannot be zero');
  const sign = (numerator < 0) !== (denominator < 0) ? -1 : 1;
  const n = Math.abs(numerator);
  const d = Math.abs(denominator);
  const divisor = gcd(n, d);
  const simNum = (n / divisor) * sign;
  const simDen = d / divisor;

  const whole = Math.floor(Math.abs(simNum) / simDen) * (simNum < 0 ? -1 : 1);
  const remNum = Math.abs(simNum) % simDen;

  return { num: simNum, den: simDen, whole, remNum };
}

export function computeAverages(numbers: number[]): {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  min: number;
  max: number;
  range: number;
  stdDev: number;
} {
  if (!numbers.length) {
    return { count: 0, sum: 0, mean: 0, median: 0, mode: [], min: 0, max: 0, range: 0, stdDev: 0 };
  }
  const count = numbers.length;
  const sum = numbers.reduce((acc, v) => acc + v, 0);
  const mean = sum / count;

  const sorted = [...numbers].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Median
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Mode
  const freqMap: Record<number, number> = {};
  let maxFreq = 0;
  for (const n of numbers) {
    freqMap[n] = (freqMap[n] || 0) + 1;
    if (freqMap[n] > maxFreq) maxFreq = freqMap[n];
  }
  const mode = maxFreq > 1 ? Object.keys(freqMap).filter((k) => freqMap[Number(k)] === maxFreq).map(Number) : [];

  // Standard deviation
  const variance = numbers.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return { count, sum, mean, median, mode, min, max, range, stdDev };
}

// ---------------------------------------------------------------------------
// Date & Time
// ---------------------------------------------------------------------------
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

  // Next birthday calculation
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

  // Calculate business / working days (excluding Sat=6 and Sun=0)
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

  // Monday of the week
  const monday = new Date(date);
  const currentDay = monday.getDay();
  const distToMon = (currentDay + 6) % 7;
  monday.setDate(monday.getDate() - distToMon);

  // Sunday of the week
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  return { week: weekNo, year: d.getUTCFullYear(), start: monday, end: sunday };
}

// ---------------------------------------------------------------------------
// Number to Words & Roman Numerals
// ---------------------------------------------------------------------------
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

  // Roundtrip validation
  if (total <= 0 || total > 3999 || toRomanNumeral(total) !== clean) {
    throw new Error('Invalid Roman numeral formatting');
  }
  return total;
}
