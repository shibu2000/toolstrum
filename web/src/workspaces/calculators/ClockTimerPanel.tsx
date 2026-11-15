import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Flag,
  Globe,
  Bell,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface ClockTimerPanelProps {
  defaultSubTool?: 'stopwatch' | 'timer' | 'alarm' | 'worldclock';
}

const WORLD_CITIES = [
  { city: 'London', tz: 'Europe/London', country: 'United Kingdom' },
  { city: 'New York', tz: 'America/New_York', country: 'United States' },
  { city: 'San Francisco', tz: 'America/Los_Angeles', country: 'United States' },
  { city: 'Tokyo', tz: 'Asia/Tokyo', country: 'Japan' },
  { city: 'New Delhi', tz: 'Asia/Kolkata', country: 'India' },
  { city: 'Sydney', tz: 'Australia/Sydney', country: 'Australia' },
  { city: 'Paris', tz: 'Europe/Paris', country: 'France' },
  { city: 'Singapore', tz: 'Asia/Singapore', country: 'Singapore' },
];

export const ClockTimerPanel: React.FC<ClockTimerPanelProps> = ({
  defaultSubTool = 'stopwatch',
}) => {
  const [activeTab, setActiveTab] = useState<'stopwatch' | 'timer' | 'alarm' | 'worldclock'>(defaultSubTool);

  // 1. Stopwatch State
  const [swRunning, setSwRunning] = useState(false);
  const [swTimeMs, setSwTimeMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const swRef = useRef<any>(null);

  useEffect(() => {
    if (swRunning) {
      const start = Date.now() - swTimeMs;
      swRef.current = setInterval(() => {
        setSwTimeMs(Date.now() - start);
      }, 10);
    } else {
      clearInterval(swRef.current);
    }
    return () => clearInterval(swRef.current);
  }, [swRunning]);

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(centis).padStart(2, '0')}`;
  };

  // 2. Countdown Timer State
  const [timerMins, setTimerMins] = useState(5);
  const [timerSecs, setTimerSecs] = useState(0);
  const [timerRemainingSecs, setTimerRemainingSecs] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (timerRunning && timerRemainingSecs > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemainingSecs((prev) => {
          if (prev <= 1) {
            setTimerRunning(false);
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [timerRunning, timerRemainingSecs]);

  const handleStartTimer = () => {
    setTimerRemainingSecs(timerMins * 60 + timerSecs);
    setTimerRunning(true);
  };

  // 3. World Clock State
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Clock className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Clock, Timer, Stopwatch & Global World Time
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-accuracy stopwatch with lap splits, preset countdown timers, and live world timezone matrix.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('stopwatch')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'stopwatch'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Stopwatch
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'timer'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Countdown Timer
          </button>
          <button
            onClick={() => setActiveTab('worldclock')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'worldclock'
                ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            World Clock
          </button>
        </div>
      </div>

      {/* 1. STOPWATCH */}
      {activeTab === 'stopwatch' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
            <p className="text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white select-none">
              {formatStopwatch(swTimeMs)}
            </p>

            <div className="flex items-center justify-center gap-3">
              {!swRunning ? (
                <button
                  onClick={() => setSwRunning(true)}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20"
                >
                  <Play className="w-4 h-4" /> Start
                </button>
              ) : (
                <button
                  onClick={() => setSwRunning(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center gap-2 shadow"
                >
                  <Pause className="w-4 h-4" /> Pause
                </button>
              )}

              <button
                disabled={swTimeMs === 0}
                onClick={() => setLaps([swTimeMs, ...laps])}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 disabled:opacity-40"
              >
                <Flag className="w-4 h-4" /> Lap
              </button>

              <button
                onClick={() => {
                  setSwRunning(false);
                  setSwTimeMs(0);
                  setLaps([]);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>

          <div className="md:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Laps Recorded ({laps.length})</span>
            </div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
              {laps.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center italic">No laps split yet.</p>
              ) : (
                laps.map((lap, i) => (
                  <div key={i} className="p-2 rounded bg-slate-50 dark:bg-slate-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Lap #{laps.length - i}</span>
                    <span className="font-bold">{formatStopwatch(lap)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. COUNTDOWN TIMER */}
      {activeTab === 'timer' && (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6 max-w-lg mx-auto">
          {!timerRunning ? (
            <div className="flex items-center justify-center gap-4 text-xs font-semibold">
              <div>
                <label className="text-slate-400 block mb-1">Minutes</label>
                <input
                  type="number"
                  min={0}
                  max={120}
                  value={timerMins}
                  onChange={(e) => setTimerMins(parseInt(e.target.value) || 0)}
                  className="w-20 p-2.5 text-center text-xl font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <span className="text-2xl mt-4 text-slate-400">:</span>
              <div>
                <label className="text-slate-400 block mb-1">Seconds</label>
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={timerSecs}
                  onChange={(e) => setTimerSecs(parseInt(e.target.value) || 0)}
                  className="w-20 p-2.5 text-center text-xl font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>
            </div>
          ) : (
            <p className="text-6xl font-black font-mono text-amber-500">
              {String(Math.floor(timerRemainingSecs / 60)).padStart(2, '0')}:
              {String(timerRemainingSecs % 60).padStart(2, '0')}
            </p>
          )}

          <div className="flex items-center justify-center gap-3">
            {!timerRunning ? (
              <button
                onClick={handleStartTimer}
                className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center gap-2"
              >
                <Play className="w-4 h-4" /> Start Timer
              </button>
            ) : (
              <button
                onClick={() => setTimerRunning(false)}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold flex items-center gap-2"
              >
                <Pause className="w-4 h-4" /> Pause
              </button>
            )}

            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerRemainingSecs(timerMins * 60 + timerSecs);
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>
      )}

      {/* 3. WORLD CLOCK */}
      {activeTab === 'worldclock' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {WORLD_CITIES.map((c) => {
            const timeStr = now.toLocaleTimeString('en-US', {
              timeZone: c.tz,
              hour12: true,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });
            const dateStr = now.toLocaleDateString('en-US', {
              timeZone: c.tz,
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={c.city}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">{c.city}</span>
                  <span className="text-[10px] text-slate-400">{c.country}</span>
                </div>
                <p className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {timeStr}
                </p>
                <span className="text-[11px] text-slate-400 block">{dateStr}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
