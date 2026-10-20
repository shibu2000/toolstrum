import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Plus,
  Trash2,
  DollarSign,
  Sparkles,
  ShieldCheck,
  Check,
  FileText,
  Printer,
  Shuffle,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

interface ProductivityWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const ProductivityWorkspace: React.FC<ProductivityWorkspaceProps> = ({
  toolId,
  accentColor = '#EC4899',
}) => {
  // Determine mode based on registry toolId:
  const getInitialTab = () => {
    if (toolId === 445 || toolId === 446) return 'pomodoro';
    if (toolId >= 417 && toolId <= 420) return 'todo';
    if (toolId >= 421 && toolId <= 423) return 'splitter';
    if (toolId === 447 || toolId === 448) return 'decision';
    if (toolId >= 424 && toolId <= 430) return 'invoice';
    return 'pomodoro';
  };

  const [activeTab, setActiveTab] = useState<'pomodoro' | 'todo' | 'splitter' | 'decision' | 'invoice'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // 1. POMODORO FOCUS TIMER
  // ==========================================
  const [pomoCycle, setPomoCycle] = useState<'25' | '5' | '15'>('25');
  const [pomoSeconds, setPomoSeconds] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoCompleted, setPomoCompleted] = useState(0);

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
    } catch {}
  };

  useEffect(() => {
    let interval: any = null;
    if (pomoActive) {
      interval = setInterval(() => {
        setPomoSeconds((prev) => {
          if (prev <= 1) {
            setPomoActive(false);
            playChime();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            if (pomoCycle === '25') {
              setPomoCompleted((c) => c + 1);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [pomoActive, pomoCycle]);

  const handleSetCycle = (cycle: '25' | '5' | '15') => {
    setPomoCycle(cycle);
    setPomoActive(false);
    setPomoSeconds(Number(cycle) * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // 2. TO-DO & CHECKLIST MAKER
  // ==========================================
  const [tasks, setTasks] = useState<Array<{ id: string; text: string; completed: boolean }>>([
    { id: '1', text: 'Review project milestones', completed: true },
    { id: '2', text: 'Prepare documentation PDF', completed: false },
    { id: '3', text: 'Run quality checks offline', completed: false },
  ]);
  const [newTaskText, setNewTaskText] = useState('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'completed'>('all');

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now().toString(), text: newTaskText.trim(), completed: false },
    ]);
    setNewTaskText('');
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'active') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    return true;
  });

  // ==========================================
  // 3. FAIR EXPENSE SPLITTER
  // ==========================================
  const [people, setPeople] = useState(['Alice', 'Bob', 'Charlie']);
  const [expenses, setExpenses] = useState([
    { person: 'Alice', amount: 90, desc: 'Dinner' },
    { person: 'Bob', amount: 30, desc: 'Snacks' },
  ]);
  const [newPerson, setNewPerson] = useState('');
  const [expPerson, setExpPerson] = useState('Alice');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');

  const calculateSettlement = () => {
    const total = expenses.reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
    if (people.length === 0) return { total: 0, perPerson: 0, settlements: [] };
    const perPerson = total / people.length;

    const balances: Record<string, number> = {};
    people.forEach((p) => (balances[p] = -perPerson));
    expenses.forEach((e) => {
      if (balances[e.person] !== undefined) {
        balances[e.person] += Number(e.amount || 0);
      }
    });

    const debtors: Array<{ person: string; amount: number }> = [];
    const creditors: Array<{ person: string; amount: number }> = [];

    Object.entries(balances).forEach(([person, balance]) => {
      if (balance < -0.01) debtors.push({ person, amount: -balance });
      else if (balance > 0.01) creditors.push({ person, amount: balance });
    });

    const settlements: string[] = [];
    let d = 0;
    let c = 0;
    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      const settled = Math.min(debtor.amount, creditor.amount);

      settlements.push(`${debtor.person} pays ${creditor.person} $${settled.toFixed(2)}`);
      debtor.amount -= settled;
      creditor.amount -= settled;

      if (debtor.amount <= 0.01) d++;
      if (creditor.amount <= 0.01) c++;
    }

    return { total, perPerson, settlements };
  };

  // ==========================================
  // 4. RANDOM DECISION PICKER
  // ==========================================
  const [choicesInput, setChoicesInput] = useState('Pizza, Sushi, Burger, Tacos, Salad');
  const [pickedChoice, setPickedChoice] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  const handlePickRandom = () => {
    const list = choicesInput
      .split(/,|\n/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) return;

    setIsPicking(true);
    let counter = 0;
    const interval = setInterval(() => {
      const randIdx = Math.floor(Math.random() * list.length);
      setPickedChoice(list[randIdx]);
      counter++;
      if (counter > 12) {
        clearInterval(interval);
        setIsPicking(false);
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      }
    }, 80);
  };

  // ==========================================
  // 5. INVOICE BUILDER
  // ==========================================
  const [invoiceSender, setInvoiceSender] = useState('My Studio LLC');
  const [invoiceClient, setInvoiceClient] = useState('Acme Corporation');
  const [invoiceItems, setInvoiceItems] = useState([
    { desc: 'Web Design & Development', qty: 1, rate: 1200 },
    { desc: 'Brand Identity & Assets', qty: 1, rate: 450 },
  ]);
  const [itemDesc, setItemDesc] = useState('');
  const [itemRate, setItemRate] = useState('');

  const invoiceSubtotal = invoiceItems.reduce((acc, i) => acc + i.qty * i.rate, 0);

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-pink-500/10 text-pink-600 dark:text-pink-400">
            <CheckSquare className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Productivity Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Focus timer, to-do lists, expense splitter, decision maker, and invoices. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: POMODORO FOCUS TIMER */}
      {/* ======================================================== */}
      {activeTab === 'pomodoro' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handleSetCycle('25')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  pomoCycle === '25'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                25m Focus
              </button>
              <button
                onClick={() => handleSetCycle('5')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  pomoCycle === '5'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                5m Short Rest
              </button>
              <button
                onClick={() => handleSetCycle('15')}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  pomoCycle === '15'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                15m Long Break
              </button>
            </div>

            <div className="py-6">
              <span className="text-7xl sm:text-8xl font-black font-mono tracking-tight text-slate-900 dark:text-white select-none">
                {formatTime(pomoSeconds)}
              </span>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mt-2">
                {pomoActive ? 'FOCUS SESSION RUNNING' : 'PAUSED • CLICK START TO FOCUS'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setPomoActive(!pomoActive)}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-transform hover:scale-105 active:scale-95"
              >
                {pomoActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{pomoActive ? 'Pause' : 'Start Focus'}</span>
              </button>

              <button
                onClick={() => handleSetCycle(pomoCycle)}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                title="Reset Cycle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleSetCycle(pomoCycle === '25' ? '5' : '25')}
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                title="Skip to Next"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex items-center justify-between">
              <span>Completed Sessions: <strong>{pomoCompleted}</strong></span>
              <span className="text-[11px] text-slate-400">Audio chime on timer end</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: TO-DO & CHECKLIST MAKER */}
      {/* ======================================================== */}
      {activeTab === 'todo' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Task List ({tasks.filter((t) => !t.completed).length} Pending)
              </h3>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-semibold">
                {(['all', 'active', 'completed'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f)}
                    className={`px-2.5 py-1 rounded-md capitalize ${
                      taskFilter === f
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Row */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="What needs to be done?..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs"
              />
              <button
                onClick={handleAddTask}
                className="px-4 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs"
              >
                Add Task
              </button>
            </div>

            {/* Tasks List */}
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 transition-all text-xs"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1 mr-2">
                    <input
                      type="checkbox"
                      checked={t.completed}
                      onChange={() => handleToggleTask(t.id)}
                      className="rounded-sm accent-pink-600 w-4 h-4 cursor-pointer"
                    />
                    <span
                      className={`${
                        t.completed
                          ? 'line-through text-slate-400 dark:text-slate-500'
                          : 'text-slate-800 dark:text-slate-200 font-medium'
                      }`}
                    >
                      {t.text}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteTask(t.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {filteredTasks.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">No tasks in this view.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FAIR EXPENSE SPLITTER */}
      {/* ======================================================== */}
      {activeTab === 'splitter' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-900 dark:text-white block mb-1">
                Group Members ({people.length})
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPerson}
                  onChange={(e) => setNewPerson(e.target.value)}
                  placeholder="Add friend's name..."
                  className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  onClick={() => {
                    if (newPerson.trim() && !people.includes(newPerson.trim())) {
                      setPeople([...people, newPerson.trim()]);
                      setNewPerson('');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 mt-2">
                {people.map((p) => (
                  <span
                    key={p}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium"
                  >
                    <span>{p}</span>
                    <button
                      onClick={() => setPeople(people.filter((x) => x !== p))}
                      className="text-slate-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <label className="text-xs font-bold text-slate-900 dark:text-white block">Log Shared Expense</label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={expPerson}
                  onChange={(e) => setExpPerson(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  {people.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Amount ($)"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <button
                onClick={() => {
                  if (expPerson && expAmount) {
                    setExpenses([
                      ...expenses,
                      { person: expPerson, amount: Number(expAmount), desc: expDesc || 'Expense' },
                    ]);
                    setExpAmount('');
                    setExpDesc('');
                  }
                }}
                className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs"
              >
                Log Expense
              </button>
            </div>
          </div>

          {/* Settlement Result Card */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border-2 border-pink-500/30 shadow-md space-y-4">
            <div>
              <span className="text-xs font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                Fair Debt Settlement Plan
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${calculateSettlement().total.toFixed(2)} Total
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ${calculateSettlement().perPerson.toFixed(2)} per person share
              </p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              {calculateSettlement().settlements.map((step, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{step}</span>
                </div>
              ))}
              {calculateSettlement().settlements.length === 0 && (
                <p className="text-slate-400 text-xs py-2">All balances are settled evenly.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: RANDOM DECISION PICKER */}
      {/* ======================================================== */}
      {activeTab === 'decision' && (
        <div className="max-w-md mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-5">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Random Decision Picker
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter options separated by comma, then let fate decide.
            </p>
          </div>

          <textarea
            value={choicesInput}
            onChange={(e) => setChoicesInput(e.target.value)}
            rows={4}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
          />

          <button
            onClick={handlePickRandom}
            disabled={isPicking}
            className="w-full py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>{isPicking ? 'Choosing randomly...' : 'Pick Winner Now!'}</span>
          </button>

          {pickedChoice && (
            <div className="p-6 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border-2 border-pink-500/40 animate-in zoom-in-95 duration-200">
              <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 tracking-wider">
                The Chosen Choice
              </span>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                🎉 {pickedChoice}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: INVOICE BUILDER */}
      {/* ======================================================== */}
      {activeTab === 'invoice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Invoice Information
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  From (Your Company)
                </label>
                <input
                  type="text"
                  value={invoiceSender}
                  onChange={(e) => setInvoiceSender(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Bill To (Client)
                </label>
                <input
                  type="text"
                  value={invoiceClient}
                  onChange={(e) => setInvoiceClient(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">Add Line Item</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Item description..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <input
                  type="number"
                  placeholder="Price ($)"
                  value={itemRate}
                  onChange={(e) => setItemRate(e.target.value)}
                  className="w-24 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold font-mono"
                />
                <button
                  onClick={() => {
                    if (itemDesc && itemRate) {
                      setInvoiceItems([...invoiceItems, { desc: itemDesc, qty: 1, rate: Number(itemRate) }]);
                      setItemDesc('');
                      setItemRate('');
                    }
                  }}
                  className="px-3 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Printable Invoice Preview */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-5 text-xs">
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white">INVOICE</h4>
                <p className="text-slate-500 font-semibold">{invoiceSender}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400">Billed To:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{invoiceClient}</p>
              </div>
            </div>

            <div className="space-y-2">
              {invoiceItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/60">
                  <span className="font-medium text-slate-800 dark:text-slate-200">{item.desc}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">${item.rate.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2 font-bold text-sm">
              <span className="text-slate-600 dark:text-slate-400">Total Due:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                ${invoiceSubtotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print or Save Invoice as PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
