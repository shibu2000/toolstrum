import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Bell,
  Globe,
  Plus,
  Volume2,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// Audio chime utility
function playBeep(freq = 880, duration = 0.3) {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Audio context may require user interaction
  }
}

// ========================================================
// 344 — STOPWATCH
// ========================================================
export const StopwatchTool: React.FC<ToolProps> = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // in ms
  const [laps, setLaps] = useState<number[]>([]);
  const intervalRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 10);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const formatMs = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const millis = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
  };

  const reset = () => {
    setIsRunning(false);
    setElapsed(0);
    setLaps([]);
  };

  const addLap = () => {
    setLaps((prev) => [elapsed, ...prev]);
  };

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
      <div className="text-5xl sm:text-6xl font-black font-mono text-slate-900 dark:text-white select-none tracking-tight">
        {formatMs(elapsed)}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-md flex items-center gap-2 transition-all ${
            isRunning ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={reset}
          className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
          title="Reset Stopwatch"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {isRunning && (
          <button
            onClick={addLap}
            className="px-4 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
          >
            Lap
          </button>
        )}
      </div>

      {laps.length > 0 && (
        <div className="max-h-48 overflow-y-auto space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          {laps.map((lap, i) => (
            <div key={i} className="flex justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono">
              <span className="text-slate-400">Lap {laps.length - i}</span>
              <span className="font-bold text-slate-900 dark:text-white">{formatMs(lap)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ========================================================
// 345 — COUNTDOWN TIMER
// ========================================================
export const CountdownTimerTool: React.FC<ToolProps> = () => {
  const [initialSeconds, setInitialSeconds] = useState(300); // 5 min
  const [remaining, setRemaining] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (isRunning && remaining > 0) {
      timerRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            playBeep(880, 0.6);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, remaining]);

  const setTimerPreset = (secs: number) => {
    setIsRunning(false);
    setInitialSeconds(secs);
    setRemaining(secs);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? String(h).padStart(2, '0') + ':' : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progress = initialSeconds > 0 ? (remaining / initialSeconds) * 100 : 0;

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-amber-500 h-full transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-6xl font-black font-mono text-slate-900 dark:text-white select-none">
        {formatTime(remaining)}
      </div>

      {/* Presets */}
      <div className="grid grid-cols-5 gap-1.5 text-xs font-bold">
        {[
          { label: '1m', sec: 60 },
          { label: '3m', sec: 180 },
          { label: '5m', sec: 300 },
          { label: '15m', sec: 900 },
          { label: '25m', sec: 1500 },
        ].map((p) => (
          <button
            key={p.label}
            onClick={() => setTimerPreset(p.sec)}
            className="py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white text-slate-700 dark:text-slate-300 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => {
            if (remaining === 0) setRemaining(initialSeconds);
            setIsRunning(!isRunning);
          }}
          className={`px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-md flex items-center gap-2 transition-all ${
            isRunning ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>

        <button
          onClick={() => {
            setIsRunning(false);
            setRemaining(initialSeconds);
          }}
          className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          title="Reset Timer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ========================================================
// 346 — ALARM & REMINDER
// ========================================================
export const AlarmReminderTool: React.FC<ToolProps> = () => {
  const [alarmTime, setAlarmTime] = useState('08:00');
  const [label, setLabel] = useState('Morning Standup');
  const [isActive, setIsActive] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date().toTimeString().substring(0, 5));

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().toTimeString().substring(0, 5);
      setCurrentTime(now);
      if (isActive && now === alarmTime && !isRinging) {
        setIsRinging(true);
        playBeep(920, 1.2);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, alarmTime, isRinging]);

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase">Current Time:</span>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-0.5">
            {currentTime}
          </div>
        </div>
        <Bell className={`w-6 h-6 ${isActive ? 'text-amber-500 animate-bounce' : 'text-slate-400'}`} />
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Alarm Time (HH:MM)</label>
          <input
            type="time"
            value={alarmTime}
            onChange={(e) => setAlarmTime(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-2xl font-black font-mono text-center"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Alarm Description</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
            placeholder="e.g. Daily meeting, medicine reminder..."
          />
        </div>

        <button
          onClick={() => {
            setIsActive(!isActive);
            setIsRinging(false);
          }}
          className={`w-full py-3 rounded-2xl font-bold text-sm text-white shadow-md transition-all ${
            isActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-amber-500 hover:bg-amber-600'
          }`}
        >
          {isActive ? 'Disable Alarm' : 'Set Active Alarm'}
        </button>

        {isRinging && (
          <div className="p-4 rounded-2xl bg-amber-500 text-white font-bold text-center animate-pulse">
            🔔 ALARM RINGING: {label}
            <button
              onClick={() => setIsRinging(false)}
              className="mt-2 block w-full py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold"
            >
              Dismiss Alarm
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 347 — WORLD CLOCK
// ========================================================
export const WorldClockTool: React.FC<ToolProps> = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const cities = [
    { name: 'UTC / GMT', tz: 'UTC' },
    { name: 'London', tz: 'Europe/London' },
    { name: 'Paris / Berlin', tz: 'Europe/Paris' },
    { name: 'New York (EST)', tz: 'America/New_York' },
    { name: 'San Francisco (PST)', tz: 'America/Los_Angeles' },
    { name: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
    { name: 'Sydney (AEST)', tz: 'Australia/Sydney' },
    { name: 'Dubai (GST)', tz: 'Asia/Dubai' },
    { name: 'New Delhi (IST)', tz: 'Asia/Kolkata' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cities.map((c) => {
          const cityTimeStr = time.toLocaleTimeString('en-US', {
            timeZone: c.tz,
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          const cityDateStr = time.toLocaleDateString('en-US', {
            timeZone: c.tz,
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={c.name}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {c.name}
                </span>
                <Globe className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                {cityTimeStr}
              </div>
              <p className="text-xs text-slate-500">{cityDateStr}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
