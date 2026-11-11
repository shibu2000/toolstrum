import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Volume2,
  Play,
  Pause,
  Calendar,
  Gift,
  QrCode,
  Scan,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Clock,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 438 — TEXT READER (TEXT-TO-SPEECH)
// ========================================================
export const TextReaderTool: React.FC<ToolProps> = () => {
  const [text, setText] = useState(
    'Welcome to Toolstrum. All utilities operate 100% offline directly in your browser without transmitting sensitive data.'
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [rate, setRate] = useState(1);

  const speak = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex items-center gap-3">
        <Volume2 className="w-8 h-8 text-pink-500" />
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Text-to-Speech Voice Reader</h3>
          <p className="text-xs text-slate-500">Reads text aloud using your device's native speech synthesizer</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed"
        placeholder="Type or paste text to read aloud..."
      />

      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span>Voice Speed: {rate}x</span>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value))}
          className="w-48 accent-pink-500"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={isSpeaking ? stop : speak}
          className={`flex-1 py-3 rounded-2xl font-bold text-xs text-white shadow-md flex items-center justify-center gap-2 ${
            isSpeaking ? 'bg-rose-500 hover:bg-rose-600' : 'bg-pink-500 hover:bg-pink-600'
          }`}
        >
          {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
        </button>
      </div>
    </div>
  );
};

// ========================================================
// 441 — DOCUMENT EXPIRY REMINDER
// ========================================================
export const DocumentExpiryTool: React.FC<ToolProps> = () => {
  const [docs, setDocs] = useState<{ id: string; name: string; expiry: string }[]>([
    { id: '1', name: 'Passport', expiry: '2028-04-12' },
    { id: '2', name: "Driver's License", expiry: '2026-12-30' },
    { id: '3', name: 'Domain Registration', expiry: '2027-02-14' },
  ]);
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');

  const addDoc = () => {
    if (!name.trim() || !expiry) return;
    setDocs([...docs, { id: Date.now().toString(), name: name.trim(), expiry }]);
    setName('');
    setExpiry('');
  };

  const getDaysLeft = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Expiry Tracker</h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Document name (e.g. Visa, Insurance)..."
          className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
        />
        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
        />
        <button
          onClick={addDoc}
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
        >
          Track
        </button>
      </div>

      <div className="space-y-2">
        {docs.map((d) => {
          const daysLeft = getDaysLeft(d.expiry);
          const isUrgent = daysLeft <= 60;
          return (
            <div key={d.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{d.name}</span>
                <span className="text-[10px] text-slate-400">Expires: {d.expiry}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full font-bold text-xs ${
                  daysLeft < 0
                    ? 'bg-rose-500/10 text-rose-600'
                    : isUrgent
                    ? 'bg-amber-500/10 text-amber-600'
                    : 'bg-emerald-500/10 text-emerald-600'
                }`}
              >
                {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========================================================
// 442 — BIRTHDAY REMINDER
// ========================================================
export const BirthdayReminderTool: React.FC<ToolProps> = () => {
  const [birthdays, setBirthdays] = useState<{ id: string; name: string; bday: string }[]>([
    { id: '1', name: 'Emma Watson', bday: '1990-04-15' },
    { id: '2', name: 'David Miller', bday: '1995-11-20' },
  ]);
  const [name, setName] = useState('');
  const [bday, setBday] = useState('');

  const addBirthday = () => {
    if (!name.trim() || !bday) return;
    setBirthdays([...birthdays, { id: Date.now().toString(), name: name.trim(), bday }]);
    setName('');
    setBday('');
  };

  const getDaysUntil = (bdayStr: string) => {
    const parts = bdayStr.split('-').map(Number);
    const now = new Date();
    const next = new Date(now.getFullYear(), parts[1] - 1, parts[2]);
    if (next.getTime() < now.getTime()) {
      next.setFullYear(now.getFullYear() + 1);
    }
    return Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-pink-500" />
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Birthday Tracker</h3>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Person's name..."
          className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
        />
        <input
          type="date"
          value={bday}
          onChange={(e) => setBday(e.target.value)}
          className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
        />
        <button
          onClick={addBirthday}
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {birthdays.map((b) => {
          const days = getDaysUntil(b.bday);
          return (
            <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{b.name}</span>
                <span className="text-[10px] text-slate-400">Born: {b.bday}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold text-xs">
                In {days} days
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========================================================
// 444 — CALENDAR EVENT CALCULATOR
// ========================================================
export const CalendarEventCalculatorTool: React.FC<ToolProps> = () => {
  const [eventDate, setEventDate] = useState('2026-12-31');
  const [eventName, setEventName] = useState("New Year's Eve 2027");

  const target = new Date(eventDate);
  const now = new Date();
  const diffDays = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
      <Calendar className="w-12 h-12 mx-auto text-pink-500" />

      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1">Event Name</label>
        <input
          type="text"
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-center font-bold text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1">Target Date</label>
        <input
          type="date"
          value={eventDate}
          onChange={(e) => setEventDate(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-center font-bold text-sm"
        />
      </div>

      <div className="p-6 rounded-3xl bg-pink-50 dark:bg-pink-950/40 border border-pink-500/30 space-y-1">
        <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400">Countdown:</span>
        <div className="text-4xl font-black text-slate-900 dark:text-white font-mono">
          {diffDays} Days
        </div>
        <p className="text-xs text-slate-500 font-semibold">{eventName}</p>
      </div>
    </div>
  );
};

// ========================================================
// 449 — QR ATTENDANCE GENERATOR
// ========================================================
export const QrAttendanceGeneratorTool: React.FC<ToolProps> = () => {
  const [eventTitle, setEventTitle] = useState('Computer Science Lecture 101');
  const [sessionCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    const payload = JSON.stringify({ event: eventTitle, code: sessionCode, time: Date.now() });
    QRCode.toDataURL(payload, { width: 280, margin: 2 }, (err, url) => {
      if (!err) setQrUrl(url);
    });
  }, [eventTitle, sessionCode]);

  return (
    <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-5">
      <QrCode className="w-10 h-10 mx-auto text-pink-500" />
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">QR Attendance Check-In</h3>
        <p className="text-xs text-slate-500">Attendees scan this code to mark attendance</p>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 block mb-1">Event / Class Title</label>
        <input
          type="text"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-center font-bold text-xs"
        />
      </div>

      {qrUrl && (
        <div className="p-4 bg-white rounded-2xl border shadow-sm w-fit mx-auto">
          <img src={qrUrl} alt="Attendance QR" className="w-48 h-48 object-contain" />
        </div>
      )}

      <div className="text-xs font-mono font-bold text-slate-400">Session Code: {sessionCode}</div>
    </div>
  );
};

// ========================================================
// 450 — QR ATTENDANCE SCANNER
// ========================================================
export const QrAttendanceScannerTool: React.FC<ToolProps> = () => {
  const [attendees, setAttendees] = useState<{ id: string; name: string; time: string }[]>([
    { id: '1', name: 'Jordan Smith', time: '09:02 AM' },
    { id: '2', name: 'Taylor Swift', time: '09:04 AM' },
  ]);
  const [attendeeName, setAttendeeName] = useState('');

  const checkIn = () => {
    if (!attendeeName.trim()) return;
    setAttendees([
      { id: Date.now().toString(), name: attendeeName.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...attendees,
    ]);
    setAttendeeName('');
  };

  return (
    <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Sign-In Log</h3>
          <span className="text-xs text-slate-500">{attendees.length} checked in today</span>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={attendeeName}
          onChange={(e) => setAttendeeName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && checkIn()}
          placeholder="Enter attendee name..."
          className="flex-1 p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border text-xs"
        />
        <button
          onClick={checkIn}
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs"
        >
          Check In
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {attendees.map((a) => (
          <div key={a.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-white">{a.name}</span>
            <span className="font-mono text-slate-400 text-[10px]">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
