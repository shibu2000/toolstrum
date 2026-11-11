import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Briefcase,
  Copy,
  Check,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { calculateDetailedAge, calculateDateDifference, getIsoWeek } from './calcHelpers';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 312 — AGE CALCULATOR
// ========================================================
export const AgeCalculatorTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [birthDate, setBirthDate] = useState('1995-06-15');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  const age = calculateDetailedAge(birthDate, targetDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Dates</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Date of Birth</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Age as of Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          />
        </div>
      </div>

      {age && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Calculated Age
            </span>
            {onCopy && (
              <button
                onClick={() => onCopy(`${age.years} years, ${age.months} months, ${age.days} days`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            )}
          </div>

          <div>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {age.years} Years
            </div>
            <p className="text-sm text-slate-500 mt-1">
              {age.months} Months, {age.days} Days
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Days:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{age.totalDays.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Weeks:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{age.totalWeeks.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Total Hours:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{age.totalHours.toLocaleString()} hrs</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Next Birthday in:</span>
              <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">{age.daysToNextBday} days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 313 — DATE DIFFERENCE CALCULATOR
// ========================================================
export const DateDifferenceTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [date1, setDate1] = useState(new Date().toISOString().split('T')[0]);
  const [date2, setDate2] = useState(
    new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
  );

  const diff = calculateDateDifference(date1, date2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose Dates</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Start Date</label>
          <input
            type="date"
            value={date1}
            onChange={(e) => setDate1(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">End Date</label>
          <input
            type="date"
            value={date2}
            onChange={(e) => setDate2(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          />
        </div>
      </div>

      {diff && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Elapsed Time
            </span>
            {onCopy && (
              <button
                onClick={() => onCopy(`${diff.totalDays} days (${diff.weeks} weeks and ${diff.remainingDays} days)`)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            )}
          </div>

          <div>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {diff.totalDays} Days
            </div>
            <p className="text-sm text-slate-500 mt-1">
              or {diff.weeks} Weeks and {diff.remainingDays} Days
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Business / Work Days:</span>
              <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{diff.businessDays} days</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Weekend Days:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{diff.weekendDays} days</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 314 — DATE ADD / SUBTRACT
// ========================================================
export const DateAddSubtractTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [baseDate, setBaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState(30);
  const [unit, setUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');

  const calculateResult = () => {
    const d = new Date(baseDate);
    if (isNaN(d.getTime())) return null;
    const factor = mode === 'add' ? 1 : -1;

    if (unit === 'days') d.setDate(d.getDate() + amount * factor);
    else if (unit === 'weeks') d.setDate(d.getDate() + amount * 7 * factor);
    else if (unit === 'months') d.setMonth(d.getMonth() + amount * factor);
    else if (unit === 'years') d.setFullYear(d.getFullYear() + amount * factor);

    return {
      iso: d.toISOString().split('T')[0],
      formatted: d.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    };
  };

  const res = calculateResult();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Operation Parameters</h3>

        <div>
          <label className="text-xs font-bold text-slate-500 block mb-1">Starting Date</label>
          <input
            type="date"
            value={baseDate}
            onChange={(e) => setBaseDate(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setMode('add')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              mode === 'add' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" /> Add
          </button>
          <button
            onClick={() => setMode('subtract')}
            className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
              mode === 'subtract' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Minus className="w-4 h-4" /> Subtract
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Amount</label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Time Unit</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as any)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold capitalize"
            >
              <option value="days">Days</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        </div>
      </div>

      {res && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Resulting Target Date
            </span>
            {onCopy && (
              <button
                onClick={() => onCopy(res.iso)}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            )}
          </div>

          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
              {res.iso}
            </div>
            <p className="text-sm font-semibold text-amber-600 dark:text-amber-400 mt-2">
              {res.formatted}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 315 — TIME DURATION CALCULATOR
// ========================================================
export const TimeDurationTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [startTime, setStartTime] = useState('09:30');
  const [endTime, setEndTime] = useState('17:45');
  const [isNextDay, setIsNextDay] = useState(false);

  const calculateDuration = () => {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;

    let startMinutes = h1 * 60 + m1;
    let endMinutes = h2 * 60 + m2;
    if (isNextDay || endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    const diff = endMinutes - startMinutes;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    const decimalHours = (diff / 60).toFixed(2);

    return { hours, mins, totalMinutes: diff, decimalHours };
  };

  const dur = calculateDuration();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Time Inputs</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Start Time</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">End Time</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
          <input
            type="checkbox"
            checked={isNextDay}
            onChange={(e) => setIsNextDay(e.target.checked)}
            className="rounded accent-amber-500"
          />
          End time is on the next day (+24 hours)
        </label>
      </div>

      {dur && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Duration Result
          </span>

          <div>
            <div className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">
              {dur.hours}h {dur.mins}m
            </div>
            <p className="text-sm text-slate-500 mt-1 font-mono">
              Decimal Hours: <b className="text-amber-600 dark:text-amber-400">{dur.decimalHours} hrs</b>
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
            <span className="text-slate-400">Total Minutes: </span>
            <span className="font-bold font-mono text-slate-900 dark:text-white">{dur.totalMinutes} mins</span>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 316 — WORK HOURS & PAY CALCULATOR
// ========================================================
export const WorkHoursTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [clockIn, setClockIn] = useState('09:00');
  const [clockOut, setClockOut] = useState('17:30');
  const [breakMins, setBreakMins] = useState(45);
  const [hourlyRate, setHourlyRate] = useState(25);

  const calculatePay = () => {
    const [h1, m1] = clockIn.split(':').map(Number);
    const [h2, m2] = clockOut.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;

    let totalMins = h2 * 60 + m2 - (h1 * 60 + m1);
    if (totalMins < 0) totalMins += 24 * 60;
    const netMins = Math.max(0, totalMins - breakMins);
    const netHours = netMins / 60;
    const earnings = netHours * hourlyRate;

    return {
      hoursWorked: Math.floor(netMins / 60),
      minsWorked: netMins % 60,
      decimalHours: netHours.toFixed(2),
      earnings: earnings.toFixed(2),
    };
  };

  const res = calculatePay();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Shift Details</h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Clock In</label>
            <input
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Clock Out</label>
            <input
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Unpaid Break (mins)</label>
            <input
              type="number"
              value={breakMins}
              onChange={(e) => setBreakMins(Math.max(0, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 block mb-1">Hourly Pay Rate ($)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Math.max(0, Number(e.target.value)))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-sm"
            />
          </div>
        </div>
      </div>

      {res && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Shift Summary
          </span>

          <div>
            <span className="text-xs text-slate-400">Net Working Time:</span>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {res.hoursWorked}h {res.minsWorked}m
            </div>
            <p className="text-xs text-slate-500 font-mono">({res.decimalHours} billable hours)</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
            <span className="text-xs text-slate-400 font-bold uppercase">Estimated Gross Pay:</span>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              ${res.earnings}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ========================================================
// 348 — CALENDAR WEEK CALCULATOR
// ========================================================
export const CalendarWeekTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const weekInfo = getIsoWeek(new Date(selectedDate));
  const startStr = weekInfo.start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const endStr = weekInfo.end.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Choose a Date</h3>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-sm font-bold"
        />
        <p className="text-xs text-slate-500">
          Calculates official ISO-8601 week numbers starting on Monday.
        </p>
      </div>

      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500/30 shadow-md space-y-4">
        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
          ISO Week Results
        </span>

        <div>
          <span className="text-xs text-slate-400">Calendar Week:</span>
          <div className="text-5xl font-black text-amber-600 dark:text-amber-400 font-mono mt-1">
            Week {weekInfo.week}
          </div>
          <p className="text-xs text-slate-500 mt-1 font-semibold">of Year {weekInfo.year}</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Week Range:</span>
            <span className="font-bold text-slate-900 dark:text-white">{startStr} – {endStr}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
