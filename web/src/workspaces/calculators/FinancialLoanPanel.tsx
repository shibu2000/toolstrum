import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  PiggyBank,
  Briefcase,
  Clock,
  Building,
  Target,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import {
  calcDiscount,
  calcGst,
  calcEmi,
  calcInterest,
  calcSip,
  calcInflation,
  calcSalary,
  calcOvertime,
  calcBreakEven,
} from './calcHelpers';

interface FinancialLoanPanelProps {
  defaultSubTool?:
    | 'discount'
    | 'gst'
    | 'emi'
    | 'interest'
    | 'sip'
    | 'inflation'
    | 'salary'
    | 'overtime'
    | 'breakeven';
}

export const FinancialLoanPanel: React.FC<FinancialLoanPanelProps> = ({
  defaultSubTool = 'emi',
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'discount'
    | 'gst'
    | 'emi'
    | 'interest'
    | 'sip'
    | 'inflation'
    | 'salary'
    | 'overtime'
    | 'breakeven'
  >(defaultSubTool);

  // EMI State
  const [loanAmount, setLoanAmount] = useState<number>(500000);
  const [loanRate, setLoanRate] = useState<number>(8.5);
  const [loanTenureYears, setLoanTenureYears] = useState<number>(15);

  const emiResult = useMemo(() => {
    return calcEmi(loanAmount, loanRate, loanTenureYears * 12);
  }, [loanAmount, loanRate, loanTenureYears]);

  // Discount State
  const [discPrice, setDiscPrice] = useState<number>(250);
  const [discPercent, setDiscPercent] = useState<number>(20);
  const discountResult = useMemo(() => calcDiscount(discPrice, discPercent), [discPrice, discPercent]);

  // GST State
  const [gstAmount, setGstAmount] = useState<number>(1000);
  const [gstRate, setGstRate] = useState<number>(18);
  const [gstInclusive, setGstInclusive] = useState<boolean>(false);
  const gstResult = useMemo(() => calcGst(gstAmount, gstRate, gstInclusive), [gstAmount, gstRate, gstInclusive]);

  // Interest State
  const [intPrincipal, setIntPrincipal] = useState<number>(100000);
  const [intRate, setIntRate] = useState<number>(7.5);
  const [intYears, setIntYears] = useState<number>(5);
  const [intFreq, setIntFreq] = useState<'annually' | 'quarterly' | 'monthly'>('annually');
  const interestResult = useMemo(
    () => calcInterest(intPrincipal, intRate, intYears, intFreq),
    [intPrincipal, intRate, intYears, intFreq]
  );

  // SIP State
  const [sipMonthly, setSipMonthly] = useState<number>(5000);
  const [sipRate, setSipRate] = useState<number>(12);
  const [sipYears, setSipYears] = useState<number>(10);
  const sipResult = useMemo(() => calcSip(sipMonthly, sipRate, sipYears), [sipMonthly, sipRate, sipYears]);

  // Inflation State
  const [infAmount, setInfAmount] = useState<number>(100000);
  const [infRate, setInfRate] = useState<number>(6);
  const [infYears, setInfYears] = useState<number>(15);
  const inflationResult = useMemo(() => calcInflation(infAmount, infRate, infYears), [infAmount, infRate, infYears]);

  // Salary State
  const [annualCtc, setAnnualCtc] = useState<number>(1200000);
  const salaryResult = useMemo(() => calcSalary(annualCtc), [annualCtc]);

  // Overtime State
  const [otRate, setOtRate] = useState<number>(25);
  const [otRegHours, setOtRegHours] = useState<number>(40);
  const [otExtraHours, setOtExtraHours] = useState<number>(10);
  const [otMultiplier, setOtMultiplier] = useState<number>(1.5);
  const overtimeResult = useMemo(
    () => calcOvertime(otRate, otRegHours, otExtraHours, otMultiplier),
    [otRate, otRegHours, otExtraHours, otMultiplier]
  );

  // Break-Even State
  const [beFixed, setBeFixed] = useState<number>(50000);
  const [beVariable, setBeVariable] = useState<number>(15);
  const [bePrice, setBePrice] = useState<number>(40);
  const breakEvenResult = useMemo(
    () => calcBreakEven(beFixed, beVariable, bePrice),
    [beFixed, beVariable, bePrice]
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <DollarSign className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white capitalize">
              Financial, Loan & Business Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Loan amortization, compound interest, SIP wealth growth, inflation impact, and payroll estimators.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          {[
            { id: 'emi', label: 'Loan / EMI' },
            { id: 'discount', label: 'Discount' },
            { id: 'gst', label: 'GST / Tax' },
            { id: 'interest', label: 'Interest' },
            { id: 'sip', label: 'SIP Growth' },
            { id: 'inflation', label: 'Inflation' },
            { id: 'salary', label: 'Salary Take-Home' },
            { id: 'overtime', label: 'Overtime Pay' },
            { id: 'breakeven', label: 'Break-Even' },
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

      {/* 1. EMI CALCULATOR */}
      {activeTab === 'emi' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Loan Amount</label>
              <input
                type="number"
                value={loanAmount}
                onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Annual Interest Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={loanRate}
                onChange={(e) => setLoanRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Tenure (Years)</label>
              <input
                type="number"
                value={loanTenureYears}
                onChange={(e) => setLoanTenureYears(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Monthly EMI</span>
              <p className="text-4xl font-black font-mono mt-1">
                ${emiResult.monthlyEmi.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Total Interest</span>
                <p className="text-base font-bold font-mono">${emiResult.totalInterest.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Total Payment</span>
                <p className="text-base font-bold font-mono">${emiResult.totalPayment.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. DISCOUNT CALCULATOR */}
      {activeTab === 'discount' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Original Price</label>
              <input
                type="number"
                value={discPrice}
                onChange={(e) => setDiscPrice(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Discount Percentage (%)</label>
              <input
                type="number"
                value={discPercent}
                onChange={(e) => setDiscPercent(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-950 dark:text-emerald-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-emerald-600 dark:text-emerald-400">Final Discounted Price</span>
              <p className="text-4xl font-black font-mono mt-1">${discountResult.finalPrice.toFixed(2)}</p>
            </div>
            <div className="pt-3 border-t border-emerald-500/20 text-xs">
              <span className="text-slate-500">You Save:</span>
              <strong className="text-emerald-600 ml-1 font-mono">${discountResult.discountAmount.toFixed(2)} ({discPercent}%)</strong>
            </div>
          </div>
        </div>
      )}

      {/* 3. SIP CALCULATOR */}
      {activeTab === 'sip' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Monthly Investment ($)</label>
              <input
                type="number"
                value={sipMonthly}
                onChange={(e) => setSipMonthly(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Expected Annual Return (%)</label>
              <input
                type="number"
                step="0.5"
                value={sipRate}
                onChange={(e) => setSipRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Investment Period (Years)</label>
              <input
                type="number"
                value={sipYears}
                onChange={(e) => setSipYears(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Total Maturity Wealth</span>
              <p className="text-4xl font-black font-mono mt-1">${sipResult.totalMaturityValue.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Invested Capital</span>
                <p className="text-base font-bold font-mono">${sipResult.investedAmount.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Estimated Returns</span>
                <p className="text-base font-bold font-mono text-emerald-600">+${sipResult.estimatedReturns.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. BREAK-EVEN CALCULATOR */}
      {activeTab === 'breakeven' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Fixed Operating Costs ($)</label>
              <input
                type="number"
                value={beFixed}
                onChange={(e) => setBeFixed(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Variable Cost Per Unit ($)</label>
              <input
                type="number"
                value={beVariable}
                onChange={(e) => setBeVariable(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Selling Price Per Unit ($)</label>
              <input
                type="number"
                value={bePrice}
                onChange={(e) => setBePrice(parseFloat(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Break-Even Sales Volume</span>
              <p className="text-4xl font-black font-mono mt-1">{breakEvenResult.breakEvenUnits.toLocaleString()} units</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Break-Even Revenue</span>
                <p className="text-base font-bold font-mono">${breakEvenResult.breakEvenRevenue.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Unit Margin</span>
                <p className="text-base font-bold font-mono text-emerald-600">${breakEvenResult.contributionMargin} ({breakEvenResult.contributionMarginRatio}%)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. INFLATION CALCULATOR */}
      {activeTab === 'inflation' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Current Amount ($)</label>
              <input
                type="number"
                value={infAmount}
                onChange={(e) => setInfAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Annual Inflation Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={infRate}
                onChange={(e) => setInfRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Number of Years</label>
              <input
                type="number"
                value={infYears}
                onChange={(e) => setInfYears(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-950 dark:text-rose-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-rose-600 dark:text-rose-400">Future Required Capital</span>
              <p className="text-4xl font-black font-mono mt-1">${inflationResult.futureRequiredAmount.toLocaleString()}</p>
            </div>
            <div className="pt-3 border-t border-rose-500/20 text-xs">
              <span className="text-slate-500">Purchasing Power Erosion:</span>
              <strong className="text-rose-600 ml-1 font-mono">{inflationResult.purchasingPowerLossPercent}%</strong>
            </div>
          </div>
        </div>
      )}

      {/* 6. SALARY TAKE-HOME CALCULATOR */}
      {activeTab === 'salary' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Annual CTC ($)</label>
              <input
                type="number"
                value={annualCtc}
                onChange={(e) => setAnnualCtc(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-3">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Estimated Net Monthly In-Hand</span>
              <p className="text-4xl font-black font-mono mt-1">${salaryResult.estimatedNetMonthly.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Gross Monthly</span>
                <p className="font-mono font-bold">${salaryResult.monthlyGross.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Basic Pay</span>
                <p className="font-mono font-bold">${salaryResult.basicSalary.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">HRA Allowance</span>
                <p className="font-mono font-bold">${salaryResult.hra.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Employee PF</span>
                <p className="font-mono font-bold">${salaryResult.employeePf.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. GST / TAX CALCULATOR */}
      {activeTab === 'gst' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Base Amount ($)</label>
              <input
                type="number"
                value={gstAmount}
                onChange={(e) => setGstAmount(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">GST / Tax Rate (%)</label>
              <input
                type="number"
                value={gstRate}
                onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={gstInclusive}
                onChange={(e) => setGstInclusive(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              Amount is Tax-Inclusive (Reverse GST)
            </label>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Total Billed Amount</span>
              <p className="text-4xl font-black font-mono mt-1">${gstResult.totalAmount.toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Tax Amount</span>
                <p className="text-base font-bold font-mono text-amber-600">${gstResult.gstAmount.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-slate-500">Pre-Tax Base</span>
                <p className="text-base font-bold font-mono">${gstResult.baseAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. OVERTIME PAY CALCULATOR */}
      {activeTab === 'overtime' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Hourly Base Wage ($)</label>
              <input
                type="number"
                value={otRate}
                onChange={(e) => setOtRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Regular Hours</label>
                <input
                  type="number"
                  value={otRegHours}
                  onChange={(e) => setOtRegHours(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Overtime Hours</label>
                <input
                  type="number"
                  value={otExtraHours}
                  onChange={(e) => setOtExtraHours(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Total Gross Pay</span>
              <p className="text-4xl font-black font-mono mt-1">${overtimeResult.totalEarnings.toFixed(2)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Regular Pay</span>
                <p className="text-base font-bold font-mono">${overtimeResult.regularPay.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-slate-500">Overtime Pay (1.5x)</span>
                <p className="text-base font-bold font-mono text-emerald-600">+${overtimeResult.overtimePay.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. INTEREST CALCULATOR */}
      {activeTab === 'interest' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Principal Deposit ($)</label>
              <input
                type="number"
                value={intPrincipal}
                onChange={(e) => setIntPrincipal(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Rate (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={intRate}
                  onChange={(e) => setIntRate(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Years</label>
                <input
                  type="number"
                  value={intYears}
                  onChange={(e) => setIntYears(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Compound Maturity Total</span>
              <p className="text-4xl font-black font-mono mt-1">${interestResult.compoundTotal.toLocaleString()}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Compound Interest</span>
                <p className="text-base font-bold font-mono text-emerald-600">+${interestResult.compoundInterest.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-slate-500">Simple Interest Total</span>
                <p className="text-base font-bold font-mono">${interestResult.simpleTotal.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
