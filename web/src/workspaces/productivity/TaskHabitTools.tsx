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
    try {
      const saved = localStorage.getItem('toolstrum_notes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [activeId, setActiveId] = useState<string>(notes[0]?.id || '');
  const activeNote = notes.find((n) => n.id === activeId) || notes[0];

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_notes', JSON.stringify(notes));
    } catch {}
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
    if (remaining.length) {
      setActiveId(remaining[0].id);
    } else {
      setActiveId('');
    }
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
            className="p-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white shadow-xs cursor-pointer"
            title="Create new note"
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNote(n.id);
                }}
                className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete note"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {notes.length === 0 && (
            <div className="p-6 text-center text-slate-400 text-xs">
              <p className="font-semibold text-slate-500 dark:text-slate-400">No notes saved</p>
              <p className="text-[11px] text-slate-400 mt-1">Click the + button above to start your first note.</p>
            </div>
          )}
        </div>
      </div>

      {/* Note Editor */}
      {activeNote ? (
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
      ) : (
        <div className="md:col-span-2 p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
          <FileText className="w-10 h-10 text-pink-500 opacity-40" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Note Selected</h4>
          <p className="text-xs text-slate-400 max-w-xs">Create your first private offline note to begin writing.</p>
          <button
            onClick={addNote}
            className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Create Note</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 418 — CHECKLIST MAKER
// ========================================================
export const ChecklistMakerTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [items, setItems] = useState<{ id: string; text: string; done: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_checklist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_checklist', JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = () => {
    if (!newItem.trim()) return;
    setItems([...items, { id: Date.now().toString(), text: newItem.trim(), done: false }]);
    setNewItem('');
  };

  const toggle = (id: string) => {
    setItems(items.map((it) => (it.id === id ? { ...it, done: !it.done } : it)));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter((x) => x.id !== id));
  };

  const clearAll = () => {
    setItems([]);
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
        <div className="flex items-center gap-3">
          {items.length > 0 && (
            <button
              onClick={clearAll}
              className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[11px] font-bold cursor-pointer"
            >
              Clear All
            </button>
          )}
          <div className="text-sm font-black font-mono text-pink-600 dark:text-pink-400">{progress}%</div>
        </div>
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
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold shadow-xs cursor-pointer"
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
            <div className="flex items-center gap-2.5 truncate mr-2">
              {it.done ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-400 shrink-0" />
              )}
              <span className="truncate">{it.text}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteItem(it.id);
              }}
              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
              title="Delete item"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <CheckSquare className="w-8 h-8 mx-auto mb-2 opacity-40 text-pink-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">Your checklist is empty</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Add items above to start tracking milestones and progress.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 419 — TO-DO LIST (WITH DUE DATES & PRIORITIES)
// ========================================================
export const TodoListTool: React.FC<ToolProps> = () => {
  const [tasks, setTasks] = useState<{ id: string; title: string; due: string; priority: 'low' | 'med' | 'high'; done: boolean }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_todo_tasks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [title, setTitle] = useState('');
  const [due, setDue] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<'low' | 'med' | 'high'>('med');

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_todo_tasks', JSON.stringify(tasks));
    } catch {}
  }, [tasks]);

  const addTask = () => {
    if (!title.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: title.trim(), due, priority, done: false }]);
    setTitle('');
  };

  const toggle = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">To-Do Task Manager</h3>
        {tasks.length > 0 && (
          <span className="text-xs text-slate-500">
            {tasks.filter((t) => t.done).length} / {tasks.length} done
          </span>
        )}
      </div>

      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase cursor-pointer ${
                  priority === p ? 'bg-pink-500 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={addTask}
            className="ml-auto px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs cursor-pointer"
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
            <div className="flex items-center gap-3 truncate mr-2">
              <input
                type="checkbox"
                checked={t.done}
                onChange={() => {}}
                className="rounded accent-pink-500 w-4 h-4 shrink-0"
              />
              <div className="truncate">
                <span className="font-bold block truncate">{t.title}</span>
                <span className="text-[10px] text-slate-400">Due: {t.due}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTask(t.id);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <ListTodo className="w-8 h-8 mx-auto mb-2 opacity-40 text-pink-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No tasks on your to-do list</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Enter a task title and due date above to stay organized.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 420 — HABIT TRACKER (7-DAY STREAK)
// ========================================================
export const HabitTrackerTool: React.FC<ToolProps> = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [habits, setHabits] = useState<{ id: string; name: string; days: boolean[] }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_habits');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_habits', JSON.stringify(habits));
    } catch {}
  }, [habits]);

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

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Weekly Habit Tracker</h3>
          <p className="text-xs text-slate-500">Tick daily completed habits to build streaks</p>
        </div>
        {habits.length > 0 && (
          <span className="text-xs text-slate-500">{habits.length} habits tracked</span>
        )}
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
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shrink-0 cursor-pointer"
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
              <div className="flex items-center gap-2 truncate mr-2">
                <Flame className={`w-4 h-4 shrink-0 ${streak >= 5 ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="font-bold text-slate-900 dark:text-white truncate">{h.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">({streak}/7 days)</span>
              </div>

              <div className="flex items-center gap-2 self-center sm:self-auto shrink-0">
                <div className="flex gap-1.5">
                  {days.map((d, i) => (
                    <button
                      key={d}
                      onClick={() => toggleDay(h.id, i)}
                      className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-[10px] transition-all cursor-pointer ${
                        h.days[i]
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      {d[0]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => deleteHabit(h.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1 cursor-pointer"
                  title="Delete habit"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {habits.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Flame className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No habits tracked yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Add a daily habit above (e.g. "Read 20 mins" or "Drink 2L Water") to start building streaks.</p>
          </div>
        )}
      </div>
    </div>
  );
};
