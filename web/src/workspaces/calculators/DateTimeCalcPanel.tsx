import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Briefcase,
  Hourglass,
  CalendarRange,
  Copy,
  Check,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import {
  calculateDetailedAge,
  calculateDateDifference,
  getIsoWeek,
} from './calcHelpers';

interface DateTimeCalcPanelProps {
  defaultSubTool?: 'age' | 'datediff' | 'dateadd' | 'duration' | 'workhours' | 'calendarweek';
}

export const DateTimeCalcPanel: React.FC<DateTimeCalcPanelProps> = ({
  defaultSubTool = 'age',
}) => {
  const [activeTab, setActiveTab] = useState<
    'age' | 'datediff' | 'dateadd' | 'duration' | 'workhours' | 'calendarweek'
  >(defaultSubTool);

  // 1. Age State
  const [birthDate, setBirthDate] = useState<string>('1998-05-15');
  const [targetAgeDate, setTargetAgeDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const ageResult = useMemo(
    () => calculateDetailedAge(birthDate, targetAgeDate),
    [birthDate, targetAgeDate]
  );

  // 2. Date Diff State
  const [diffStart, setDiffStart] = useState<string>('2026-01-01');
  const [diffEnd, setDiffEnd] = useState<string>('2026-11-15');
  const dateDiffResult = useMemo(
    () => calculateDateDifference(diffStart, diffEnd),
    [diffStart, diffEnd]
  );

  // 3. Date Add / Subtract State
  const [baseDate, setBaseDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [addYears, setAddYears] = useState<number>(0);
  const [addMonths, setAddMonths] = useState<number>(3);
  const [addDays, setAddDays] = useState<number>(15);
  const [addMode, setAddMode] = useState<'add' | 'subtract'>('add');

  const dateAddResult = useMemo(() => {
    const d = new Date(baseDate);
    if (isNaN(d.getTime())) return null;
    const sign = addMode === 'add' ? 1 : -1;
    d.setFullYear(d.getFullYear() + sign * addYears);
    d.setMonth(d.getMonth() + sign * addMonths);
    d.setDate(d.getDate() + sign * addDays);
    return {
      formatted: d.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      iso: d.toISOString().slice(0, 10),
    };
  }, [baseDate, addYears, addMonths, addDays, addMode]);

  // 4. Duration State
  const [timeStart, setTimeStart] = useState<string>('09:30');
  const [timeEnd, setTimeEnd] = useState<string>('17:45');

  const durationResult = useMemo(() => {
    const [h1, m1] = timeStart.split(':').map(Number);
    const [h2, m2] = timeEnd.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;

    let startMins = h1 * 60 + m1;
    let endMins = h2 * 60 + m2;
    if (endMins < startMins) endMins += 24 * 60; // Next day

    const diff = endMins - startMins;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return { hours, mins, totalMins: diff, decimalHours: (diff / 60).toFixed(2) };
  }, [timeStart, timeEnd]);

  // 5. Work Hours State
  const [workPunchIn, setWorkPunchIn] = useState<string>('09:00');
  const [workPunchOut, setWorkPunchOut] = useState<string>('17:30');
  const [lunchBreakMins, setLunchBreakMins] = useState<number>(45);

  const workHoursResult = useMemo(() => {
    const [h1, m1] = workPunchIn.split(':').map(Number);
    const [h2, m2] = workPunchOut.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;

    let startMins = h1 * 60 + m1;
    let endMins = h2 * 60 + m2;
    if (endMins < startMins) endMins += 24 * 60;

    const netMins = Math.max(0, endMins - startMins - lunchBreakMins);
    const hours = Math.floor(netMins / 60);
    const mins = netMins % 60;
    return { hours, mins, decimal: (netMins / 60).toFixed(2) };
  }, [workPunchIn, workPunchOut, lunchBreakMins]);

  // 6. Calendar Week State
  const [weekDate, setWeekDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const weekResult = useMemo(() => {
    const d = new Date(weekDate);
    if (isNaN(d.getTime())) return null;
    return getIsoWeek(d);
  }, [weekDate]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Calendar className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Date, Time & Work Hours Suite
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Calculate exact ages, business day intervals, date addition, work shifts, and ISO calendar weeks.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          {[
            { id: 'age', label: 'Age Calculator' },
            { id: 'datediff', label: 'Date Difference' },
            { id: 'dateadd', label: 'Add / Subtract Date' },
            { id: 'duration', label: 'Time Duration' },
            { id: 'workhours', label: 'Work Hours' },
            { id: 'calendarweek', label: 'ISO Week' },
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

      {/* 1. AGE CALCULATOR */}
      {activeTab === 'age' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Date of Birth</label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Age at Target Date</label>
              <input
                type="date"
                value={targetAgeDate}
                onChange={(e) => setTargetAgeDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            {ageResult ? (
              <>
                <div>
                  <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Current Age</span>
                  <p className="text-3xl font-black font-mono mt-1">
                    {ageResult.years} yrs, {ageResult.months} mos, {ageResult.days} days
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
                  <div>
                    <span className="text-slate-500">Total Days Lived</span>
                    <p className="text-base font-bold font-mono">{ageResult.totalDays.toLocaleString()} days</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Next Birthday</span>
                    <p className="text-base font-bold font-mono text-emerald-600">in {ageResult.daysToNextBday} days</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-rose-500">Invalid birth date or target date.</p>
            )}
          </div>
        </div>
      )}

      {/* 2. DATE DIFFERENCE */}
      {activeTab === 'datediff' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Start Date</label>
              <input
                type="date"
                value={diffStart}
                onChange={(e) => setDiffStart(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">End Date</label>
              <input
                type="date"
                value={diffEnd}
                onChange={(e) => setDiffEnd(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            {dateDiffResult ? (
              <>
                <div>
                  <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Total Calendar Days</span>
                  <p className="text-4xl font-black font-mono mt-1">{dateDiffResult.totalDays} days</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-amber-500/20 text-xs">
                  <div>
                    <span className="text-slate-500">Business Working Days</span>
                    <p className="text-base font-bold font-mono text-emerald-600">{dateDiffResult.businessDays} days</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Weekend Days</span>
                    <p className="text-base font-bold font-mono">{dateDiffResult.weekendDays} days</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-rose-500">Please select valid start and end dates.</p>
            )}
          </div>
        </div>
      )}

      {/* 3. DATE ADD / SUBTRACT */}
      {activeTab === 'dateadd' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Base Date</label>
              <input
                type="date"
                value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAddMode('add')}
                className={`flex-1 py-1.5 rounded font-bold ${
                  addMode === 'add' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                + Add
              </button>
              <button
                onClick={() => setAddMode('subtract')}
                className={`flex-1 py-1.5 rounded font-bold ${
                  addMode === 'subtract' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800'
                }`}
              >
                − Subtract
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Years</label>
                <input
                  type="number"
                  value={addYears}
                  onChange={(e) => setAddYears(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Months</label>
                <input
                  type="number"
                  value={addMonths}
                  onChange={(e) => setAddMonths(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Days</label>
                <input
                  type="number"
                  value={addDays}
                  onChange={(e) => setAddDays(parseInt(e.target.value) || 0)}
                  className="w-full p-2 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-bold"
                />
              </div>
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-2">
            <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Calculated Date</span>
            <p className="text-2xl font-black font-sans mt-1">{dateAddResult?.formatted}</p>
            <span className="text-xs font-mono text-slate-500 block">ISO: {dateAddResult?.iso}</span>
          </div>
        </div>
      )}

      {/* 4. WORK HOURS */}
      {activeTab === 'workhours' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Punch In Time</label>
                <input
                  type="time"
                  value={workPunchIn}
                  onChange={(e) => setWorkPunchIn(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-500 uppercase block mb-1">Punch Out Time</label>
                <input
                  type="time"
                  value={workPunchOut}
                  onChange={(e) => setWorkPunchOut(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
                />
              </div>
            </div>
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Unpaid Lunch Break (Minutes)</label>
              <input
                type="number"
                value={lunchBreakMins}
                onChange={(e) => setLunchBreakMins(parseInt(e.target.value) || 0)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">Total Net Work Time</span>
              <p className="text-4xl font-black font-mono mt-1">
                {workHoursResult?.hours} hrs {workHoursResult?.mins} mins
              </p>
            </div>
            <div className="pt-3 border-t border-amber-500/20 text-xs">
              <span className="text-slate-500">Decimal Hours:</span>
              <strong className="text-emerald-600 ml-1 font-mono">{workHoursResult?.decimal} hrs</strong>
            </div>
          </div>
        </div>
      )}

      {/* 5. ISO WEEK */}
      {activeTab === 'calendarweek' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-6 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
            <div>
              <label className="font-semibold text-slate-500 uppercase block mb-1">Select Date</label>
              <input
                type="date"
                value={weekDate}
                onChange={(e) => setWeekDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold"
              />
            </div>
          </div>

          <div className="md:col-span-6 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-950 dark:text-amber-100 shadow-sm space-y-4">
            <div>
              <span className="text-xs uppercase font-bold text-amber-600 dark:text-amber-400">ISO 8601 Calendar Week</span>
              <p className="text-4xl font-black font-mono mt-1">Week {weekResult?.week}</p>
            </div>
            <div className="pt-3 border-t border-amber-500/20 text-xs">
              <span className="text-slate-500">Week Duration:</span>
              <strong className="text-slate-800 dark:text-slate-200 ml-1">
                {weekResult?.start.toLocaleDateString()} to {weekResult?.end.toLocaleDateString()}
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
