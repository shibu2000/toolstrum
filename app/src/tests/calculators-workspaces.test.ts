import { CANONICAL_TOOLS } from '../data/registry';
import {
  CALCULATOR_TOOLS_CONFIG,
  getCalculatorToolConfig,
} from '../features/tools/calculators/calculatorsConfig';
import {
  calcDiscount,
  calcGst,
  calcEmi,
  calcInterest,
  calcSip,
  calcInvestmentReturn,
  calcInflation,
  calcSalary,
  calcOvertime,
  calcFuelCost,
  calcMileage,
  calcElectricityBill,
  calcTip,
  calcBreakEven,
  calcUnitPrice,
  calcStandard,
  calcScientific,
  calcPercentage,
  calcFraction,
  calcRatio,
  calcAverage,
  calcProbability,
  convertUnits,
  calcAge,
  calcDateDiff,
  calcDateAddSub,
  calcWorkHours,
  calcCalendarWeek,
  calcBmi,
  calcCalories,
  convertNumberSystem,
  numberToWords,
  arabicToRoman,
  romanToArabic,
  generateRandomNumbers,
  rollDice,
} from '../features/tools/calculators/shared/CalculatorHelpers';

console.log('--- STARTING CALCULATORS STUDIO CONSOLIDATION TEST SUITE ---');

// 1. Audit Canonical Catalog Entries for Tools 301–350
console.log('1. Auditing Canonical Catalog Entries for Tools 301–350...');
const calcTools = CANONICAL_TOOLS.filter((t) => t.id >= 301 && t.id <= 350);
if (calcTools.length !== 50) {
  throw new Error(`Expected exactly 50 Calculators tools (301–350), found ${calcTools.length}`);
}

for (let id = 301; id <= 350; id++) {
  const config = getCalculatorToolConfig(id);
  if (!config) {
    throw new Error(`Missing calculator configuration for tool ID ${id}`);
  }
  if (config.id !== id || !config.title || !config.workspaceId) {
    throw new Error(`Invalid configuration for tool ID ${id}`);
  }
}
console.log('✅ Canonical catalog integrity verified for all 50 tools (301–350).');

// 2. Audit Workspace Configurations
console.log('2. Auditing Workspace Configurations...');
const configs = Object.values(CALCULATOR_TOOLS_CONFIG);
if (configs.length !== 50) {
  throw new Error(`Expected 50 registered configurations, got ${configs.length}`);
}
console.log('✅ All 50 tools successfully mapped across 6 consolidated workspaces.');

// 3. Testing Financial & Business Calculators
console.log('3. Testing Financial & Business Calculators...');
const discount = calcDiscount(1000, 20);
if (discount.discountAmount !== 200 || discount.finalPrice !== 800) {
  throw new Error('calcDiscount failed');
}

const gstExcl = calcGst(1000, 18, false);
if (gstExcl.gstAmount !== 180 || gstExcl.totalAmount !== 1180 || gstExcl.cgst !== 90) {
  throw new Error('calcGst (exclusive) failed');
}

const gstIncl = calcGst(1180, 18, true);
if (gstIncl.baseAmount !== 1000 || gstIncl.gstAmount !== 180) {
  throw new Error('calcGst (inclusive) failed');
}

const emi = calcEmi(100000, 12, 12);
if (Math.abs(emi.monthlyEmi - 8884.88) > 1 || emi.totalPayment <= 100000) {
  throw new Error('calcEmi failed');
}

const interest = calcInterest(10000, 10, 2, 'annually');
if (interest.simpleInterest !== 2000 || interest.compoundTotal !== 12100) {
  throw new Error('calcInterest failed');
}

const sip = calcSip(5000, 12, 5);
if (sip.investedAmount !== 300000 || sip.totalMaturityValue <= 300000) {
  throw new Error('calcSip failed');
}

const cagr = calcInvestmentReturn(10000, 20000, 5);
if (cagr.totalGain !== 10000 || cagr.absoluteReturn !== 100 || Math.abs(cagr.cagr - 14.87) > 0.5) {
  throw new Error('calcInvestmentReturn failed');
}

const inflation = calcInflation(10000, 6, 10);
if (inflation.futureRequiredAmount <= 17000 || inflation.purchasingPowerLossPercent <= 40) {
  throw new Error('calcInflation failed');
}

const salary = calcSalary(1200000);
if (salary.monthlyGross !== 100000 || salary.estimatedNetMonthly >= 100000) {
  throw new Error('calcSalary failed');
}

const ot = calcOvertime(200, 40, 10, 1.5);
if (ot.regularPay !== 8000 || ot.overtimePay !== 3000 || ot.totalEarnings !== 11000) {
  throw new Error('calcOvertime failed');
}

const fuel = calcFuelCost(500, 15, 100);
if (Math.abs(fuel.litersRequired - 33.33) > 0.5 || Math.abs(fuel.totalFuelCost - 3333) > 10) {
  throw new Error('calcFuelCost failed');
}

const mileage = calcMileage(300, 20);
if (mileage.kmPerLiter !== 15 || Math.abs(mileage.litersPer100Km - 6.67) > 0.5) {
  throw new Error('calcMileage failed');
}

const bill = calcElectricityBill(250, 6, 50, 5);
if (bill.energyCharges !== 1500 || bill.totalBill <= 1550) {
  throw new Error('calcElectricityBill failed');
}

const tip = calcTip(2000, 10, 4);
if (tip.tipAmount !== 200 || tip.perPersonTotal !== 550 || tip.perPersonTip !== 50) {
  throw new Error('calcTip failed');
}

const breakEven = calcBreakEven(50000, 50, 100);
if (breakEven.contributionMargin !== 50 || breakEven.breakEvenUnits !== 1000) {
  throw new Error('calcBreakEven failed');
}

const comp = calcUnitPrice([
  { id: '1', name: 'Pack A', price: 100, quantity: 200, unit: 'g' },
  { id: '2', name: 'Pack B', price: 180, quantity: 500, unit: 'g' },
]);
if (!comp[1].isBestValue || comp[0].isBestValue) {
  throw new Error('calcUnitPrice failed');
}
console.log('✅ Financial & Business Calculators verified.');

// 4. Testing Math & Statistics
console.log('4. Testing Math & Statistics...');
if (calcStandard('2 + 3 * 4').result !== 14 || calcStandard('(2 + 3) * 4').result !== 20) {
  throw new Error('calcStandard BODMAS failed');
}
if (!calcStandard('abc + def').error) {
  throw new Error('calcStandard error handling failed');
}

if (calcScientific('sin', 90) !== 1 || calcScientific('cos', 0) !== 1 || calcScientific('factorial', 5) !== 120) {
  throw new Error('calcScientific failed');
}

if (calcPercentage('percent_of', 25, 200).result !== 50 || calcPercentage('is_what_percent', 50, 200).result !== 25) {
  throw new Error('calcPercentage failed');
}

const frac = calcFraction(1, 2, '+', 3, 4);
if (frac.simplified !== '5/4' || frac.mixedNumber !== '1 1/4' || frac.decimal !== 1.25) {
  throw new Error('calcFraction failed');
}

const ratio = calcRatio(10, 20, 50);
if (ratio.simplifiedRatio !== '1 : 2' || ratio.solvedFourthTerm !== 100) {
  throw new Error('calcRatio failed');
}

const avg = calcAverage([10, 20, 20, 40, 50]);
if (avg.mean !== 28 || avg.median !== 20 || avg.range !== 40 || avg.mode[0] !== 20) {
  throw new Error('calcAverage failed');
}

if (calcProbability('nPr', 5, 2).value !== 20 || calcProbability('nCr', 5, 2).value !== 10) {
  throw new Error('calcProbability failed');
}
console.log('✅ Math & Statistics verified.');

// 5. Testing Unit Conversions
console.log('5. Testing Unit Conversions...');
const len = convertUnits('length', 'm', 1000);
const km = len.find((r) => r.unit === 'km');
if (km?.value !== 1) throw new Error('convertUnits length failed');

const temp = convertUnits('temperature', 'c', 100);
const f = temp.find((r) => r.unit === 'f');
if (f?.value !== 212) throw new Error('convertUnits temp failed');

const storage = convertUnits('data_storage', 'gb', 1);
const mb = storage.find((r) => r.unit === 'mb');
if (mb?.value !== 1000) throw new Error('convertUnits storage failed');
console.log('✅ Unit Conversions verified.');

// 6. Testing Date, Time & Calendar
console.log('6. Testing Date, Time & Calendar...');
const age = calcAge('2000-01-01', '2026-01-01');
if (age.years !== 26 || age.months !== 0 || age.totalDays < 9000) {
  throw new Error('calcAge failed');
}

const dateDiff = calcDateDiff('2026-05-04', '2026-05-11');
if (dateDiff.totalDays !== 7 || dateDiff.businessDays !== 5 || dateDiff.weekendDays !== 2) {
  throw new Error('calcDateDiff failed');
}

const addSub = calcDateAddSub('2026-01-01', 10, 'days', true);
if (addSub.targetDateStr !== '2026-01-11') {
  throw new Error('calcDateAddSub failed');
}

const work = calcWorkHours(9, 0, 17, 30, 30, 100);
if (work.totalHours !== 8.5 || work.billableHours !== 8 || work.grossPay !== 800) {
  throw new Error('calcWorkHours failed');
}

const week = calcCalendarWeek('2026-01-01');
if (week.isoWeek !== 1 || week.isLeapYear !== false) {
  throw new Error('calcCalendarWeek failed');
}
console.log('✅ Date, Time & Calendar verified.');

// 7. Testing Health & Lifestyle
console.log('7. Testing Health & Lifestyle...');
const bmi = calcBmi(70, 175);
if (bmi.bmi !== 22.9 || bmi.category !== 'Normal weight') {
  throw new Error('calcBmi failed');
}

const cal = calcCalories(30, 'male', 75, 180, 1.375, 'maintain');
if (cal.bmr <= 1600 || cal.tdee <= cal.bmr || cal.proteinGrams <= 0) {
  throw new Error('calcCalories failed');
}
console.log('✅ Health & Lifestyle verified.');

// 8. Testing Numerics & Random
console.log('8. Testing Numerics & Random...');
const numSys = convertNumberSystem('255', 10);
if (numSys.decimal !== 255 || numSys.binary !== '11111111' || numSys.hexadecimal !== 'FF' || numSys.octal !== '377') {
  throw new Error('convertNumberSystem failed');
}

if (numberToWords(14500) !== 'fourteen thousand five hundred' || numberToWords(0) !== 'zero') {
  throw new Error('numberToWords failed');
}

if (arabicToRoman(2026) !== 'MMXXVI' || romanToArabic('MMXXVI') !== 2026) {
  throw new Error('arabicToRoman/romanToArabic failed');
}

const rands = generateRandomNumbers(1, 10, 5, true);
if (rands.length !== 5 || new Set(rands).size !== 5) {
  throw new Error('generateRandomNumbers failed');
}

const dice = rollDice(6, 3, 2);
if (dice.rolls.length !== 3 || dice.totalWithMod !== dice.sum + 2) {
  throw new Error('rollDice failed');
}
console.log('✅ Numerics & Random verified.');

console.log('--- ALL CALCULATORS STUDIO TESTS PASSED WITH 100% SUCCESS ---');
