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
  Trash2,
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
  const [docs, setDocs] = useState<{ id: string; name: string; expiry: string }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_doc_expiry');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_doc_expiry', JSON.stringify(docs));
    } catch {}
  }, [docs]);

  const addDoc = () => {
    if (!name.trim() || !expiry) return;
    setDocs([...docs, { id: Date.now().toString(), name: name.trim(), expiry }]);
    setName('');
    setExpiry('');
  };

  const deleteDoc = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const getDaysLeft = (dateStr: string) => {
    const target = new Date(dateStr);
    const now = new Date();
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Document Expiry Tracker</h3>
        {docs.length > 0 && (
          <span className="text-xs text-slate-500">{docs.length} tracked</span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Document name (e.g. Visa, Insurance, License)..."
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
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shrink-0 cursor-pointer"
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
              <div className="truncate mr-3">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{d.name}</span>
                <span className="text-[10px] text-slate-400">Expires: {d.expiry}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-3 py-1 rounded-full font-bold text-xs ${
                    daysLeft < 0
                      ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : isUrgent
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {daysLeft < 0 ? 'Expired' : `${daysLeft} days left`}
                </span>
                <button
                  onClick={() => deleteDoc(d.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {docs.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-pink-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No documents tracked yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Enter passport, license, visa, or renewal dates above to track expiration countdowns.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 442 — BIRTHDAY REMINDER
// ========================================================
export const BirthdayReminderTool: React.FC<ToolProps> = () => {
  const [birthdays, setBirthdays] = useState<{ id: string; name: string; bday: string }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_birthdays');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [name, setName] = useState('');
  const [bday, setBday] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_birthdays', JSON.stringify(birthdays));
    } catch {}
  }, [birthdays]);

  const addBirthday = () => {
    if (!name.trim() || !bday) return;
    setBirthdays([...birthdays, { id: Date.now().toString(), name: name.trim(), bday }]);
    setName('');
    setBday('');
  };

  const deleteBirthday = (id: string) => {
    setBirthdays((prev) => prev.filter((b) => b.id !== id));
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
      <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-pink-500" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Birthday Tracker</h3>
        </div>
        {birthdays.length > 0 && (
          <span className="text-xs text-slate-500">{birthdays.length} saved</span>
        )}
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
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shrink-0 cursor-pointer"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {birthdays.map((b) => {
          const days = getDaysUntil(b.bday);
          return (
            <div key={b.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
              <div className="truncate mr-3">
                <span className="font-bold text-slate-900 dark:text-white block truncate">{b.name}</span>
                <span className="text-[10px] text-slate-400">Born: {b.bday}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="px-3 py-1 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 font-bold text-xs">
                  In {days} days
                </span>
                <button
                  onClick={() => deleteBirthday(b.id)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title="Delete birthday"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
        {birthdays.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Gift className="w-8 h-8 mx-auto mb-2 opacity-40 text-pink-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No birthdays added yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Add a friend or family member's birthdate above to calculate upcoming celebrations.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 444 — CALENDAR EVENT CALCULATOR
// ========================================================
export const CalendarEventCalculatorTool: React.FC<ToolProps> = () => {
  const [eventDate, setEventDate] = useState(() => {
    try {
      return localStorage.getItem('toolstrum_calendar_event_date') || new Date().toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  });
  const [eventName, setEventName] = useState(() => {
    try {
      return localStorage.getItem('toolstrum_calendar_event_name') || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_calendar_event_date', eventDate);
      localStorage.setItem('toolstrum_calendar_event_name', eventName);
    } catch {}
  }, [eventDate, eventName]);

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
          placeholder="e.g. Vacation, Wedding, Launch..."
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
        <p className="text-xs text-slate-500 font-semibold">{eventName || 'Event countdown'}</p>
      </div>
    </div>
  );
};

// ========================================================
// 449 — QR ATTENDANCE GENERATOR
// ========================================================
export const QrAttendanceGeneratorTool: React.FC<ToolProps> = () => {
  const [eventTitle, setEventTitle] = useState(() => {
    try {
      return localStorage.getItem('toolstrum_qr_session_title') || '';
    } catch {
      return '';
    }
  });
  const [sessionCode] = useState(() => Math.random().toString(36).substring(2, 8).toUpperCase());
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_qr_session_title', eventTitle);
    } catch {}
    const title = eventTitle || 'Class Session / Event';
    const payload = JSON.stringify({ event: title, code: sessionCode, time: Date.now() });
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
          placeholder="e.g. Physics 101 Lecture..."
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
  const [attendees, setAttendees] = useState<{ id: string; name: string; time: string }[]>(() => {
    try {
      const saved = localStorage.getItem('toolstrum_attendance_roster');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [attendeeName, setAttendeeName] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_attendance_roster', JSON.stringify(attendees));
    } catch {}
  }, [attendees]);

  const checkIn = () => {
    if (!attendeeName.trim()) return;
    setAttendees([
      { id: Date.now().toString(), name: attendeeName.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...attendees,
    ]);
    setAttendeeName('');
  };

  const deleteAttendee = (id: string) => {
    setAttendees((prev) => prev.filter((a) => a.id !== id));
  };

  const clearAll = () => {
    setAttendees([]);
  };

  return (
    <div className="max-w-xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attendance Sign-In Log</h3>
          <span className="text-xs text-slate-500">{attendees.length} checked in today</span>
        </div>
        {attendees.length > 0 && (
          <button
            onClick={clearAll}
            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Roster</span>
          </button>
        )}
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
          className="px-4 py-2.5 rounded-2xl bg-pink-500 hover:bg-pink-600 text-white font-bold text-xs shrink-0 cursor-pointer"
        >
          Check In
        </button>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {attendees.map((a) => (
          <div key={a.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-white">{a.name}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 text-[10px]">{a.time}</span>
              <button
                onClick={() => deleteAttendee(a.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                title="Remove attendee"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
        {attendees.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Scan className="w-8 h-8 mx-auto mb-2 opacity-40 text-pink-500" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">No attendees checked in yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Enter attendee names above to log check-in arrival times.</p>
          </div>
        )}
      </div>
    </div>
  );
};
