import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Copy,
  Check,
  RefreshCw,
  Globe,
  Calendar,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Play,
  Pause,
} from 'lucide-react';
import { parseUnixTimestamp, TimestampDetails } from './devHelpers';

export const UnixTimestampPanel: React.FC = () => {
  // Live Ticker State
  const [liveNow, setLiveNow] = useState(Date.now());
  const [tickerPaused, setTickerPaused] = useState(false);

  useEffect(() => {
    if (tickerPaused) return;
    const interval = setInterval(() => {
      setLiveNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, [tickerPaused]);

  // Main Conversion State
  const [inputVal, setInputVal] = useState<string>(() => Math.floor(Date.now() / 1000).toString());
  const [inputMode, setInputMode] = useState<'epoch' | 'date-picker' | 'batch'>('epoch');
  const [datePickerVal, setDatePickerVal] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 19);
  });
  const [batchInput, setBatchInput] = useState<string>(
    '1700000000\n1710000000\n1720000000\n1731671400\n1735689600'
  );

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  // Synchronize when date picker changes
  const handleDatePickerChange = (isoDateTime: string) => {
    setDatePickerVal(isoDateTime);
    if (isoDateTime) {
      const ms = new Date(isoDateTime).getTime();
      if (!isNaN(ms)) {
        setInputVal(Math.floor(ms / 1000).toString());
      }
    }
  };

  const parsedInfo: TimestampDetails = useMemo(() => {
    return parseUnixTimestamp(inputVal);
  }, [inputVal]);

  // Batch parsed list
  const batchResults = useMemo(() => {
    const lines = batchInput.split('\n').map((l) => l.trim()).filter(Boolean);
    return lines.map((l) => {
      const res = parseUnixTimestamp(l);
      return { raw: l, res };
    });
  }, [batchInput]);

  // Quick Preset Actions
  const applyPreset = (type: string) => {
    const now = new Date();
    let target = new Date();
    switch (type) {
      case 'now':
        target = new Date();
        break;
      case 'start-today':
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        break;
      case 'end-today':
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      case 'yesterday':
        target = new Date(now.getTime() - 86400000);
        break;
      case 'tomorrow':
        target = new Date(now.getTime() + 86400000);
        break;
      case 'start-month':
        target = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        break;
      case 'start-year':
        target = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        break;
      case '1h-ago':
        target = new Date(now.getTime() - 3600000);
        break;
      case '24h-ago':
        target = new Date(now.getTime() - 86400000);
        break;
      default:
        break;
    }
    const sec = Math.floor(target.getTime() / 1000);
    setInputVal(sec.toString());
    const offset = target.getTimezoneOffset();
    const localIso = new Date(target.getTime() - offset * 60000).toISOString().slice(0, 19);
    setDatePickerVal(localIso);
  };

  return (
    <div className="space-y-6">
      {/* Live Ticker Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-purple-500/10 border border-sky-500/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Current Unix Timestamp
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                Live
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {Math.floor(liveNow / 1000)}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                .{String(liveNow % 1000).padStart(3, '0')} sec
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTickerPaused(!tickerPaused)}
            title={tickerPaused ? 'Resume live clock' : 'Pause live clock'}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {tickerPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
            <span className="hidden sm:inline">{tickerPaused ? 'Resume' : 'Pause'}</span>
          </button>
          <button
            onClick={() => copyToClipboard(Math.floor(liveNow / 1000).toString(), 'live-sec')}
            className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copiedKey === 'live-sec' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Seconds</span>
          </button>
          <button
            onClick={() => copyToClipboard(liveNow.toString(), 'live-ms')}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            {copiedKey === 'live-ms' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy MS</span>
          </button>
        </div>
      </div>

      {/* Main Mode Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInputMode('epoch')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'epoch'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Epoch & Date Converter
          </button>
          <button
            onClick={() => setInputMode('batch')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              inputMode === 'batch'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Batch Timestamp Converter
          </button>
        </div>

        <button
          onClick={() => applyPreset('now')}
          className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reset to Now</span>
        </button>
      </div>

      {inputMode === 'epoch' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Controls & Presets */}
          <div className="lg:col-span-5 space-y-5">
            {/* Input Card */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
                  Timestamp (Seconds, MS, Micros, Nanos) or Date String
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    placeholder="e.g. 1731671400 or 2024-11-15T12:00:00Z"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                  />
                  {inputVal && (
                    <button
                      onClick={() => setInputVal('')}
                      className="absolute right-2.5 top-2.5 px-1.5 py-0.5 rounded text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Date & Time Picker */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
                  <Calendar className="w-3.5 h-3.5 text-sky-500" />
                  <span>Interactive Date & Time Selector</span>
                </label>
                <input
                  type="datetime-local"
                  step="1"
                  value={datePickerVal}
                  onChange={(e) => handleDatePickerChange(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Presets Grid */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Quick Presets
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'Now', id: 'now' },
                    { label: 'Start Today', id: 'start-today' },
                    { label: 'End Today', id: 'end-today' },
                    { label: 'Yesterday', id: 'yesterday' },
                    { label: 'Tomorrow', id: 'tomorrow' },
                    { label: '1 Hour Ago', id: '1h-ago' },
                    { label: '24h Ago', id: '24h-ago' },
                    { label: 'Start Month', id: 'start-month' },
                    { label: 'Start Year', id: 'start-year' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p.id)}
                      className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[11px] font-medium text-slate-700 dark:text-slate-200 transition-colors text-center truncate"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scale Disambiguation Info */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <Info className="w-4 h-4 text-sky-500" />
                <span>Magnitude Auto-Detection</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                <li><strong className="text-slate-700 dark:text-slate-300">Seconds (10 digits):</strong> standard POSIX timestamp.</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Milliseconds (13 digits):</strong> standard JS timestamp (<code className="text-sky-600">Date.now()</code>).</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Microseconds (16 digits):</strong> Python / Go telemetry.</li>
                <li><strong className="text-slate-700 dark:text-slate-300">Nanoseconds (19 digits):</strong> High-precision tracing.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Breakdown & World Clock */}
          <div className="lg:col-span-7 space-y-5">
            {parsedInfo.valid ? (
              <>
                {/* Core Formats Card */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Converted Date & Time
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        {parsedInfo.relative}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {/* ISO 8601 */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          ISO 8601 (UTC)
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {parsedInfo.iso}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(parsedInfo.iso, 'iso')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 shrink-0"
                        title="Copy ISO 8601"
                      >
                        {copiedKey === 'iso' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Local System Time */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Local System Time
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {parsedInfo.local}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(parsedInfo.local, 'local')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 shrink-0"
                        title="Copy Local Time"
                      >
                        {copiedKey === 'local' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* RFC 2822 / GMT */}
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          RFC 2822 / GMT String
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate block">
                          {parsedInfo.utc}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(parsedInfo.utc, 'utc')}
                        className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 shrink-0"
                        title="Copy RFC 2822"
                      >
                        {copiedKey === 'utc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Numeric Epoch representations */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Seconds</span>
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{parsedInfo.epochSec}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(parsedInfo.epochSec.toString(), 'sec')}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                        >
                          {copiedKey === 'sec' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Milliseconds</span>
                          <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{parsedInfo.epochMs}</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(parsedInfo.epochMs.toString(), 'ms')}
                          className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                        >
                          {copiedKey === 'ms' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Day</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{parsedInfo.dayOfWeek}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Day of Year</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Day {parsedInfo.dayOfYear}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Week Number</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">Week {parsedInfo.weekNumber}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Leap Year</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{parsedInfo.isLeapYear ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>

                {/* World Clock / Timezone Matrix */}
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-sky-500" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Global Timezone Breakdown
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
                    {parsedInfo.timezones.map((tz) => (
                      <div
                        key={tz.zone}
                        className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono"
                      >
                        <span className="font-semibold text-slate-600 dark:text-slate-400">{tz.name}</span>
                        <span className="font-bold text-slate-900 dark:text-white">{tz.formatted}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
                <Info className="w-6 h-6 text-rose-500 mx-auto" />
                <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Unable to Parse Timestamp</h4>
                <p className="text-xs text-rose-700 dark:text-rose-400">{parsedInfo.error}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Batch Conversion View */
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1.5">
              Paste Multiple Timestamps (one per line)
            </label>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              rows={5}
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500"
              placeholder="1700000000&#10;1710000000&#10;1720000000"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-2 px-3">Input</th>
                  <th className="py-2 px-3">ISO 8601 (UTC)</th>
                  <th className="py-2 px-3">Local Time</th>
                  <th className="py-2 px-3">Relative</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {batchResults.map(({ raw, res }, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-bold text-sky-600 dark:text-sky-400">{raw}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{res.valid ? res.iso : 'Invalid'}</td>
                    <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300">{res.valid ? res.local : '-'}</td>
                    <td className="py-2.5 px-3 text-slate-500">{res.valid ? res.relative : '-'}</td>
                    <td className="py-2.5 px-3 text-right">
                      {res.valid && (
                        <button
                          onClick={() => copyToClipboard(res.iso, `batch-${i}`)}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-[10px] font-bold"
                        >
                          {copiedKey === `batch-${i}` ? 'Copied' : 'Copy'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
