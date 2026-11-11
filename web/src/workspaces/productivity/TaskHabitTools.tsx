import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckSquare,
  Plus,
  Trash2,
  Check,
  Calendar,
  Flame,
  FileText,
  ListTodo,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 417 — NOTES APP
// ========================================================
export const NotesAppTool: React.FC<ToolProps> = () => {
  const [notes, setNotes] = useState<{ id: string; title: string; body: string; date: string }[]>(() => {
    const saved = localStorage.getItem('toolstrum_notes');
    return saved
      ? JSON.parse(saved)
      : [{ id: '1', title: 'Product Ideas', body: 'Build 100% offline utilities for privacy.', date: 'Today' }];
  });
  const [activeId, setActiveId] = useState<string>(notes[0]?.id || '1');
  const activeNote = notes.find((n) => n.id === activeId) || notes[0];

  useEffect(() => {
    localStorage.setItem('toolstrum_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      body: '',
      date: new Date().toLocaleDateString(),
    };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
  };

  const deleteNote = (id: string) => {
    const remaining = notes.filter((n) => n.id !== id);
    setNotes(remaining);
    if (remaining.length) setActiveId(remaining[0].id);
  };

  const updateActive = (field: 'title' | 'body', val: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === activeId ? { ...n, [field]: val } : n))
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto min-h-[420px]">
      {/* Sidebar Note List */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            All Notes ({notes.length})
          </span>
          <button
            onClick={addNote}
            className="p-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-xs"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5 overflow-y-auto max-h-[340px]">
          {notes.map((n) => (
            <div
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`p-3 rounded-2xl cursor-pointer text-xs transition-colors flex justify-between items-center ${
                n.id === activeId
                  ? 'bg-pink-50 dark:bg-pink-950/40 border border-pink-400/30 font-bold text-pink-700 dark:text-pink-300'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <div className="truncate flex-1 mr-2">
                <span className="truncate block font-semibold">{n.title || 'Untitled'}</span>
                <span className="text-[10px] text-slate-400">{n.date}</span>
              </div>
              {notes.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(n.id);
                  }}
                  className="text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Note Editor */}
      {activeNote && (
        <div className="md:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <input
            type="text"
            value={activeNote.title}
            onChange={(e) => updateActive('title', e.target.value)}
            className="w-full text-lg font-bold bg-transparent text-slate-900 dark:text-white focus:outline-none border-b border-slate-100 dark:border-slate-800 pb-2"
            placeholder="Note Title..."
          />
          <textarea
            value={activeNote.body}
            onChange={(e) => updateActive('body', e.target.value)}
            rows={12}
            className="w-full p-2 bg-transparent text-xs text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none resize-none font-sans"
            placeholder="Write notes here..."
          />
        </div>
      )}
    </div>
  );
};

// ========================================================
// 418 — CHECKLIST MAKER
// ========================================================
export const ChecklistMakerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [items, setItems] = useState<{ id: string; text: string; done: boolean }[]>([
    { id: '1', text: 'Prepare release build', done: true },
    { id: '2', text: 'Run unit & regression tests', done: true },
    { id: '3', text: 'Update changelog documentation', done: false },
    { id: '4', text: 'Deploy to production server', done: false },
  ]);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: Date.now().toString(), text: newItem.trim(), done: false }]);
    setNewItem('');
  };

  const toggle = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  const completedCount = items.filter((i) => i.done).length;
  const progress = items.length ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Checklist Maker</h3>
          <span className="text-xs text-slate-500">{completedCount} of {items.length} completed</span>
        </div>
        <div className="text-sm font-black font-mono text-pink-600 dark:text-pink-400">{progress}%</div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-pink-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
          placeholder="Add an item to the checklist..."
        />
        <button
          onClick={addItem}
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <div
            key={it.id}
            onClick={() => toggle(it.id)}
            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer text-xs transition-colors ${
              it.done
                ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-400/30 text-slate-400 line-through'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {it.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span>{it.text}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setItems(items.filter((x) => x.id !== it.id));
              }}
              className="text-slate-400 hover:text-rose-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================================
// 419 — TO-DO LIST (WITH DUE DATES & PRIORITIES)
// ========================================================
export const TodoListTool: React.FC<ToolProps> = () => {
  const [tasks, setTasks] = useState<{ id: string; title: string; due: string; priority: 'low' | 'med' | 'high'; done: boolean }[]>([
    { id: '1', title: 'Submit quarterly budget review', due: '2026-11-15', priority: 'high', done: false },
    { id: '2', title: 'Refactor audio trimming engine', due: '2026-11-18', priority: 'med', done: true },
  ]);
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');

  const addTask = () => {
    if (!title.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: title.trim(), due, priority, done: false }]);
    setTitle('');
  };

  const toggle = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">To-Do Task Manager</h3>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
          placeholder="Task title..."
        />
        <div className="flex gap-2 items-center flex-wrap">
          <input
            type="date"
            value={due}
            onChange={(e) => setDue(e.target.value)}
            className="p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs"
          />
          <div className="flex gap-1">
            {(['low', 'med', 'high'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase ${
                  priority === p ? 'bg-pink-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={addTask}
            className="ml-auto px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((t) => (
          <div
            key={t.id}
            onClick={() => toggle(t.id)}
            className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer text-xs ${
              t.done
                ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-400 line-through'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => {}}
                className="rounded accent-pink-500 w-4 h-4"
              />
              <div>
                <span className="font-bold block">{t.title}</span>
                <span className="text-[10px] text-slate-400">Due: {t.due}</span>
              </div>
            </div>

            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                t.priority === 'high'
                  ? 'bg-rose-500/10 text-rose-600'
                  : t.priority === 'med'
                  ? 'bg-amber-500/10 text-amber-600'
                  : 'bg-emerald-500/10 text-emerald-600'
              }`}
            >
              {t.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========================================================
// 420 — HABIT TRACKER (7-DAY STREAK)
// ========================================================
export const HabitTrackerTool: React.FC<ToolProps> = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [habits, setHabits] = useState([
    { id: '1', name: 'Drink 2L Water', days: [true, true, true, true, false, false, false] },
    { id: '2', name: '30-Min Workout', days: [true, true, false, true, false, false, false] },
    { id: '3', name: 'Read 20 Pages', days: [true, true, true, true, true, false, false] },
  ]);
  const [newHabit, setNewHabit] = useState('');

  const toggleDay = (habitId: string, dayIndex: number) => {
    setHabits(
      habits.map((h) => {
        if (h.id !== habitId) return h;
        const copy = [...h.days];
        copy[dayIndex] = !copy[dayIndex];
        if (copy.every(Boolean)) {
          confetti({ particleCount: 50, spread: 60 });
        }
        return { ...h, days: copy };
      })
    );
  };

  const addHabit = () => {
    if (!newHabit.trim()) return;
    setHabits([...habits, { id: Date.now().toString(), name: newHabit.trim(), days: [false, false, false, false, false, false, false] }]);
    setNewHabit('');
  };

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Habit Tracker</h3>
          <p className="text-xs text-slate-500">Tick daily completed habits to build streaks</p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
          className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
          placeholder="New habit name (e.g. Meditate 10 mins)..."
        />
        <button
          onClick={addHabit}
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
        >
          Add Habit
        </button>
      </div>

      <div className="space-y-3">
        {habits.map((h) => {
          const streak = h.days.filter(Boolean).length;
          return (
            <div
              key={h.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2">
                <Flame className={`w-4 h-4 ${streak >= 5 ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-900 dark:text-white">{h.name}</span>
                <span className="text-[10px] text-slate-400">({streak}/7 days)</span>
              </div>

              <div className="flex gap-1.5 self-center sm:self-auto">
                {days.map((d, i) => (
                  <button
                    key={d}
                    onClick={() => toggleDay(h.id, i)}
                    className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-[10px] transition-all ${
                      h.days[i]
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                    }`}
                  >
                    {d[0]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
