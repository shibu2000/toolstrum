import React, { useState, useMemo } from 'react';
import {
  Percent,
  Zap,
  Coffee,
  Users,
  Scale,
  Copy,
  Check,
  Plus,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface ShoppingUtilityPanelProps {
  defaultSubTool?: 'percentage' | 'electricity' | 'tip' | 'billsplit' | 'unitprice';
}

interface UnitCompareItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export const ShoppingUtilityPanel: React.FC<ShoppingUtilityPanelProps> = ({
  defaultSubTool = 'percentage',
}) => {
  const [activeTab, setActiveTab] = useState<'percentage' | 'electricity' | 'tip' | 'billsplit' | 'unitprice'>(defaultSubTool);

  // 1. Percentage State
  const [pctMode, setPctMode] = useState<'percent_of' | 'is_what_percent' | 'percent_change'>('percent_of');
  const [pctA, setPctA] = useState<number>(15);
  const [pctB, setPctB] = useState<number>(200);

  const percentageResult = useMemo(() => {
    if (pctMode === 'percent_of') {
      const res = Number(((pctA * pctB) / 100).toFixed(4));
      return `${pctA}% of ${pctB} = ${res}`;
    }
    if (pctMode === 'is_what_percent') {
      const denom = pctB === 0 ? 1 : pctB;
      const res = Number(((pctA / denom) * 100).toFixed(2));
      return `${pctA} is ${res}% of ${pctB}`;
    }
    // percent_change
    const denom = pctA === 0 ? 1 : pctA;
    const diff = pctB - pctA;
    const res = Number(((diff / Math.abs(denom)) * 100).toFixed(2));
    const dir = res >= 0 ? 'increase' : 'decrease';
    return `${Math.abs(res)}% ${dir} from ${pctA} to ${pctB}`;
  }, [pctMode, pctA, pctB]);

  // 2. Electricity Bill State
  const [watts, setWatts] = useState<number>(1500);
  const [hoursPerDay, setHoursPerDay] = useState<number>(5);
  const [kwhRate, setKwhRate] = useState<number>(0.15);

  const electricityResult = useMemo(() => {
    const dailyKwh = (watts * hoursPerDay) / 1000;
    const monthlyKwh = dailyKwh * 30;
    const monthlyCost = monthlyKwh * kwhRate;
    const annualCost = monthlyCost * 12;
    return {
      dailyKwh: dailyKwh.toFixed(2),
      monthlyKwh: monthlyKwh.toFixed(1),
      monthlyCost: monthlyCost.toFixed(2),
      annualCost: annualCost.toFixed(2),
    };
  }, [watts, hoursPerDay, kwhRate]);

  // 3. Tip & Bill Splitter State
  const [tipBill, setTipBill] = useState<number>(85);
  const [tipPercent, setTipPercent] = useState<number>(18);
  const [splitPeople, setSplitPeople] = useState<number>(3);

  const tipResult = useMemo(() => {
    const tipAmount = (tipBill * tipPercent) / 100;
    const totalWithTip = tipBill + tipAmount;
    const s = Math.max(1, splitPeople);
    return {
      tipAmount: tipAmount.toFixed(2),
      totalWithTip: totalWithTip.toFixed(2),
      perPersonTip: (tipAmount / s).toFixed(2),
      perPersonTotal: (totalWithTip / s).toFixed(2),
    };
  }, [tipBill, tipPercent, splitPeople]);

  // 4. Unit Price Comparator State
  const [compareItems, setCompareItems] = useState<UnitCompareItem[]>([
    { id: '1', name: 'Option A (Small)', price: 4.99, quantity: 250, unit: 'g' },
    { id: '2', name: 'Option B (Family Pack)', price: 12.99, quantity: 800, unit: 'g' },
    { id: '3', name: 'Option C (Bulk)', price: 18.5, quantity: 1200, unit: 'g' },
  ]);

  const unitPriceResult = useMemo(() => {
    const mapped = compareItems.map((item) => {
      const q = Math.max(0.001, item.quantity);
      const unitPrice = item.price / q;
      return { ...item, unitPrice };
    });
    const minPrice = Math.min(...mapped.map((m) => m.unitPrice));
    return mapped.map((m) => ({ ...m, isBest: m.unitPrice === minPrice }));
  }, [compareItems]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            {activeTab === 'percentage' ? (
              <Percent className="w-5 h-5" />
            ) : activeTab === 'electricity' ? (
              <Zap className="w-5 h-5" />
            ) : activeTab === 'tip' ? (
              <Coffee className="w-5 h-5" />
            ) : (
              <Scale className="w-5 h-5" />
            )}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Shopping, Energy & Everyday Utilities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Percentage formulas, home appliance electricity estimators, tip splits, and unit price value comparators.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('percentage')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'percentage'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Percentage
          </button>
          <button
            onClick={() => setActiveTab('electricity')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'electricity'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Electricity Bill
          </button>
          <button
            onClick={() => setActiveTab('tip')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'tip'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Tip & Bill Split
          </button>
          <button
            onClick={() => setActiveTab('unitprice')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'unitprice'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Unit Price Value
          </button>
        </div>
      </div>

      {/* 1. PERCENTAGE CALCULATOR */}
      {activeTab === 'percentage' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'percent_of', label: 'What is X% of Y?' },
              { id: 'is_what_percent', label: 'X is what % of Y?' },
              { id: 'percent_change', label: 'Percentage Change from X to Y' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPctMode(m.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  pctMode === m.id
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-center">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block">Value X</label>
              <input
                type="number"
                value={pctA}
                onChange={(e) => setPctA(parseFloat(e.target.value) || 0)}
                className="w-28 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase block">Value Y</label>
              <input
                type="number"
                value={pctB}
                onChange={(e) => setPctB(parseFloat(e.target.value) || 0)}
                className="w-28 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-center"
              />
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 min-w-[200px]">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">Result</span>
              <p className="text-xl font-bold font-mono mt-1">{percentageResult}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. ELECTRICITY BILL ESTIMATOR */}
      {activeTab === 'electricity' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Appliance Wattage (Watts)</label>
              <input
                type="number"
                value={watts}
                onChange={(e) => setWatts(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Usage per Day (Hours)</label>
              <input
                type="number"
                max={24}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Electricity Rate ($ / kWh)</label>
              <input
                type="number"
                step="0.01"
                value={kwhRate}
                onChange={(e) => setKwhRate(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Estimated Monthly Cost</span>
              <p className="text-4xl font-black font-mono mt-1">${electricityResult.monthlyCost}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Monthly Usage</span>
                <p className="text-base font-bold font-mono">{electricityResult.monthlyKwh} kWh</p>
              </div>
              <div>
                <span className="text-slate-500">Annual Expense</span>
                <p className="text-base font-bold font-mono">${electricityResult.annualCost}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TIP & BILL SPLITTER */}
      {activeTab === 'tip' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Total Bill Amount ($)</label>
              <input
                type="number"
                value={tipBill}
                onChange={(e) => setTipBill(parseFloat(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Tip Percentage (%)</label>
              <div className="flex items-center gap-2">
                {[10, 15, 18, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    onClick={() => setTipPercent(pct)}
                    className={`flex-1 py-1.5 rounded font-bold text-xs ${
                      tipPercent === pct
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Split Between Persons</label>
              <input
                type="number"
                min={1}
                value={splitPeople}
                onChange={(e) => setSplitPeople(parseInt(e.target.value) || 1)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold font-mono text-sm"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Total Per Person</span>
              <p className="text-4xl font-black font-mono mt-1">${tipResult.perPersonTotal}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
              <div>
                <span className="text-slate-500">Total Tip ({tipPercent}%)</span>
                <p className="text-base font-bold font-mono">${tipResult.tipAmount}</p>
              </div>
              <div>
                <span className="text-slate-500">Total Bill + Tip</span>
                <p className="text-base font-bold font-mono">${tipResult.totalWithTip}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. UNIT PRICE COMPARATOR */}
      {activeTab === 'unitprice' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Compare Product Sizes & Bulk Options
            </span>
            <button
              onClick={() =>
                setCompareItems([
                  ...compareItems,
                  {
                    id: Date.now().toString(),
                    name: `Option ${String.fromCharCode(65 + compareItems.length)}`,
                    price: 10,
                    quantity: 500,
                    unit: 'g',
                  },
                ])
              }
              className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Option
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {unitPriceResult.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all space-y-3 ${
                  item.isBest
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-950 dark:text-emerald-100'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => {
                      const updated = [...compareItems];
                      updated[idx].name = e.target.value;
                      setCompareItems(updated);
                    }}
                    className="font-bold text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-amber-500 focus:outline-none"
                  />
                  {item.isBest && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold text-[10px] uppercase">
                      Best Value
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400">Price ($)</span>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => {
                        const updated = [...compareItems];
                        updated[idx].price = parseFloat(e.target.value) || 0;
                        setCompareItems(updated);
                      }}
                      className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400">Qty ({item.unit})</span>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...compareItems];
                        updated[idx].quantity = parseFloat(e.target.value) || 1;
                        setCompareItems(updated);
                      }}
                      className="w-full p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase">Unit Price</span>
                    <p className="font-mono font-black text-sm">
                      ${(item.unitPrice * 100).toFixed(3)} / 100{item.unit}
                    </p>
                  </div>
                  {compareItems.length > 2 && (
                    <button
                      onClick={() => setCompareItems(compareItems.filter((_, i) => i !== idx))}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
