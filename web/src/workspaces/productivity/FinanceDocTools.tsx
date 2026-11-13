import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Receipt,
  FileSpreadsheet,
  Plus,
  Trash2,
  Printer,
  Copy,
  Check,
  PieChart,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 421 — EXPENSE SPLITTER
// ========================================================
export const ExpenseSplitterTool: React.FC<ToolProps> = () => {
  const [totalAmount, setTotalAmount] = useState(120);
  const [people, setPeople] = useState('Alice, Bob, Charlie');
  const [tipPct, setTipPct] = useState(15);

  const names = people.split(',').map((p) => p.trim()).filter(Boolean);
  const totalWithTip = totalAmount * (1 + tipPct / 100);
  const perPerson = names.length ? totalWithTip / names.length : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Group Split Parameters</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Total Bill Amount ($)</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Math.max(0, Number(e.target.value)))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Tip Percentage: {tipPct}%</label>
          <input
            type="range"
            min="0"
            max="30"
            value={tipPct}
            onChange={(e) => setTipPct(Number(e.target.value))}
            className="w-full accent-pink-500"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Participants (Comma Separated)</label>
          <input
            type="text"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-pink-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
          Split Breakdown
        </span>

        <div>
          <span className="text-xs text-slate-400">Each Person Owes:</span>
          <div className="text-4xl font-black text-pink-600 dark:text-pink-400 font-mono mt-1">
            ${perPerson.toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Total with {tipPct}% tip: ${totalWithTip.toFixed(2)} ({names.length} people)
          </p>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {names.map((n) => (
            <div key={n} className="flex justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="font-bold text-slate-900 dark:text-white">{n}</span>
              <span className="font-mono text-pink-600 dark:text-pink-400 font-bold">${perPerson.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 422 — PERSONAL EXPENSE TRACKER
// ========================================================
export const PersonalExpenseTrackerTool: React.FC<ToolProps> = () => {
  const [expenses, setExpenses] = useState<{ id: string; category: string; desc: string; amount: number }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_expenses');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [category, setCategory] = useState('Food & Dining');
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_expenses', JSON.stringify(expenses));
    } catch {}
  }, [expenses]);

  const addExpense = () => {
    if (!desc.trim() || amount <= 0) return;
    setExpenses([...expenses, { id: Date.now().toString(), category, desc: desc.trim(), amount }]);
    setDesc('');
    setAmount(0);
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    setExpenses([]);
  };

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Expense</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Expense Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          >
            <option>Food & Dining</option>
            <option>Housing & Rent</option>
            <option>Transport</option>
            <option>Utilities & Bills</option>
            <option>Entertainment</option>
            <option>Healthcare</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Description</label>
          <input
            type="text"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
            placeholder="e.g. Weekly Groceries..."
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Amount ($)</label>
          <input
            type="number"
            step="0.01"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold font-mono"
            placeholder="0.00"
          />
        </div>

        <button
          onClick={addExpense}
          className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-sm shadow-md cursor-pointer"
        >
          Add Expense
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-pink-500/30 shadow-md space-y-4">
        <div className="flex justify-between items-baseline">
          <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
            Total Spending
          </span>
          <div className="flex items-center gap-3">
            {expenses.length > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
              >
                Clear All
              </button>
            )}
            <span className="text-3xl font-black font-mono text-slate-900 dark:text-white">
              ${total.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="space-y-2 max-h-[280px] overflow-y-auto">
          {expenses.map((e) => (
            <div key={e.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
              <div className="truncate mr-2">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{e.desc}</span>
                <span className="text-[10px] text-slate-400">{e.category}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono font-bold text-pink-600 dark:text-pink-400">${e.amount.toFixed(2)}</span>
                <button
                  onClick={() => deleteExpense(e.id)}
                  className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete expense"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-40 text-pink-500" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No expenses logged</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use the form on the left to track personal expenses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 423 — MONTHLY BUDGET PLANNER
// ========================================================
export const BudgetPlannerTool: React.FC<ToolProps> = () => {
  const [income, setIncome] = useState(4500);
  const [needs, setNeeds] = useState(2100);
  const [wants, setWants] = useState(1200);
  const [savings, setSavings] = useState(800);

  const totalSpent = needs + wants + savings;
  const balance = income - totalSpent;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Monthly Income & Categories</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Monthly Net Income ($)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Needs (Rent, Groceries, Utilities)</label>
          <input
            type="number"
            value={needs}
            onChange={(e) => setNeeds(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Wants (Dining, Entertainment, Travel)</label>
          <input
            type="number"
            value={wants}
            onChange={(e) => setWants(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold font-mono"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Savings & Investments</label>
          <input
            type="number"
            value={savings}
            onChange={(e) => setSavings(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold font-mono"
          />
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-pink-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
          Budget Balance (50/30/20 Rule)
        </span>

        <div>
          <span className="text-xs text-slate-400">Monthly Remaining Balance:</span>
          <div className={`text-4xl font-black font-mono mt-0.5 ${balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ${balance.toFixed(2)}
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span>Needs (Ideal: 50% = ${(income * 0.5).toFixed(0)})</span>
            <span className="font-bold font-mono">{((needs / (income || 1)) * 100).toFixed(0)}% (${needs})</span>
          </div>
          <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span>Wants (Ideal: 30% = ${(income * 0.3).toFixed(0)})</span>
            <span className="font-bold font-mono">{((wants / (income || 1)) * 100).toFixed(0)}% (${wants})</span>
          </div>
          <div className="flex justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span>Savings (Ideal: 20% = ${(income * 0.2).toFixed(0)})</span>
            <span className="font-bold font-mono">{((savings / (income || 1)) * 100).toFixed(0)}% (${savings})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 424 — INVOICE GENERATOR
// ========================================================
export const InvoiceGeneratorTool: React.FC<ToolProps> = () => {
  const [invoiceNo, setInvoiceNo] = useState(() => {
    try {
      return localStorage.getItem('toolstrum_invoice_no') || 'INV-2026-001';
    } catch {
      return 'INV-2026-001';
    }
  });
  const [client, setClient] = useState(() => {
    try {
      return localStorage.getItem('toolstrum_invoice_client') || '';
    } catch {
      return '';
    }
  });
  const [items, setItems] = useState<{ id: string; desc: string; qty: number; rate: number }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_invoice_items');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [taxPct, setTaxPct] = useState(() => {
    try {
      const saved = localStorage.getItem('toolstrum_invoice_tax');
      return saved !== null ? Number(saved) : 10;
    } catch {
      return 10;
    }
  });

  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState<number>(1);
  const [newRate, setNewRate] = useState<number>(50);

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_invoice_no', invoiceNo);
      localStorage.setItem('toolstrum_invoice_client', client);
      localStorage.setItem('toolstrum_invoice_items', JSON.stringify(items));
      localStorage.setItem('toolstrum_invoice_tax', String(taxPct));
    } catch {}
  }, [invoiceNo, client, items, taxPct]);

  const addItem = () => {
    if (!newDesc.trim() || newQty <= 0 || newRate < 0) return;
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        desc: newDesc.trim(),
        qty: Number(newQty),
        rate: Number(newRate),
      },
    ]);
    setNewDesc('');
    setNewQty(1);
    setNewRate(50);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const clearAll = () => {
    setItems([]);
  };

  const subtotal = items.reduce((acc, it) => acc + it.qty * it.rate, 0);
  const tax = subtotal * (taxPct / 100);
  const total = subtotal + tax;

  return (
    <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">INVOICE</h2>
          <span className="text-xs font-mono text-slate-400">#{invoiceNo}</span>
        </div>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print / Save PDF
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Billed To:</span>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            placeholder="Client or Company Name..."
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-xs"
          />
        </div>
        <div>
          <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Invoice Number:</span>
          <input
            type="text"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
            placeholder="INV-001"
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono font-bold text-xs"
          />
        </div>
      </div>

      {/* Add Line Item Form */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Add Line Item</span>
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Service or Product description..."
            className="sm:col-span-6 p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-medium"
          />
          <input
            type="number"
            min="1"
            value={newQty}
            onChange={(e) => setNewQty(Number(e.target.value))}
            placeholder="Qty"
            className="sm:col-span-2 p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono text-center"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            value={newRate}
            onChange={(e) => setNewRate(Number(e.target.value))}
            placeholder="Rate ($)"
            className="sm:col-span-2 p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-mono text-right"
          />
          <button
            onClick={addItem}
            className="sm:col-span-2 py-2 px-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Line Items ({items.length})</span>
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="text-[11px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
            >
              Clear All
            </button>
          )}
        </div>
        {items.map((it) => (
          <div key={it.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-white truncate mr-2">{it.desc}</span>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-mono text-slate-600 dark:text-slate-300 text-xs">
                {it.qty} × ${it.rate.toFixed(2)} = <b className="text-slate-900 dark:text-white">${(it.qty * it.rate).toFixed(2)}</b>
              </span>
              <button
                onClick={() => deleteItem(it.id)}
                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Remove item"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40 text-pink-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No line items added yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to add billable services or items.</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs space-y-1.5 text-right font-mono">
        <div className="flex justify-between">
          <span className="text-slate-400">Subtotal:</span>
          <span className="font-bold text-slate-900 dark:text-white">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-1 text-slate-400">
            <span>Tax (%):</span>
            <input
              type="number"
              min="0"
              max="100"
              value={taxPct}
              onChange={(e) => setTaxPct(Number(e.target.value))}
              className="w-14 p-1 rounded-lg bg-slate-50 dark:bg-slate-800 border text-xs font-mono text-right"
            />
          </div>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-black text-pink-600 dark:text-pink-400 pt-2 border-t">
          <span>Total Due:</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 425 — RECEIPT GENERATOR
// ========================================================
export const ReceiptGeneratorTool: React.FC<ToolProps> = () => {
  const [storeName, setStoreName] = useState('Toolstrum Store & Labs');
  const [receiptTotal, setReceiptTotal] = useState(64.5);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Apple Pay)');

  return (
    <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-4">
      <Receipt className="w-10 h-10 mx-auto text-pink-500" />
      <h3 className="text-lg font-black text-slate-900 dark:text-white">{storeName}</h3>
      <p className="text-xs text-slate-400 font-mono">Transaction ID: TX-{Date.now().toString().slice(-8)}</p>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs text-left space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Payment Method:</span>
          <span className="font-bold text-slate-900 dark:text-white">{paymentMethod}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Date:</span>
          <span className="font-bold text-slate-900 dark:text-white">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between text-sm font-black pt-2 border-t text-slate-900 dark:text-white">
          <span>Amount Paid:</span>
          <span className="text-emerald-600 dark:text-emerald-400">${receiptTotal.toFixed(2)}</span>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
      >
        <Printer className="w-4 h-4" /> Print Receipt
      </button>
    </div>
  );
};

// ========================================================
// 426 — QUOTATION GENERATOR
// ========================================================
export const QuotationGeneratorTool: React.FC<ToolProps> = () => {
  const [quoteTitle, setQuoteTitle] = useState('Mobile & Web App Redesign Quote');
  const [clientName, setClientName] = useState('Starlight Enterprises');
  const [validDays, setValidDays] = useState(30);
  const [quoteAmount, setQuoteAmount] = useState(8500);

  return (
    <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400">Price Estimate</span>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">{quoteTitle}</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 text-xs font-bold">
          Valid {validDays} Days
        </span>
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-400">Prepared For:</span>
          <span className="font-bold text-slate-900 dark:text-white">{clientName}</span>
        </div>
        <div className="flex justify-between items-baseline pt-2 border-t">
          <span className="text-slate-400">Total Quoted Cost:</span>
          <span className="text-2xl font-black font-mono text-pink-600 dark:text-pink-400">
            ${quoteAmount.toLocaleString()}
          </span>
        </div>
      </div>

      <button
        onClick={() => window.print()}
        className="w-full py-3 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2"
      >
        <Printer className="w-4 h-4" /> Print Quotation Document
      </button>
    </div>
  );
};
