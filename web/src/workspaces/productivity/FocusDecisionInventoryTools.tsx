import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import confetti from 'canvas-confetti';
import {
  QrCode,
  Download,
  Barcode,
  Calendar,
  Clock,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Shuffle,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  Sparkles,
  Check,
  Copy,
  ChevronRight,
  Filter,
  User,
  Phone,
  Mail,
  Building,
  Globe,
  Tag,
} from 'lucide-react';

interface ToolProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

// ========================================================
// 439 — QR CONTACT CARD (vCard 3.0)
// ========================================================
export const QrContactCardTool: React.FC<ToolProps> = ({ copied, onCopy }) => {
  const [firstName, setFirstName] = useState('Jane');
  const [lastName, setLastName] = useState('Doe');
  const [org, setOrg] = useState('Toolstrum Enterprise');
  const [title, setTitle] = useState('Security Architect');
  const [phone, setPhone] = useState('+1 (555) 234-5678');
  const [email, setEmail] = useState('jane.doe@example.com');
  const [url, setUrl] = useState('https://toolstrum.app');
  const [note, setNote] = useState('Met at Open Source Summit 2026');
  const [qrDataUrl, setQrDataUrl] = useState('');

  // Assemble vCard 3.0 standard payload
  const vCardPayload = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${lastName};${firstName};;;`,
    `FN:${firstName} ${lastName}`,
    org ? `ORG:${org}` : '',
    title ? `TITLE:${title}` : '',
    phone ? `TEL;TYPE=CELL:${phone}` : '',
    email ? `EMAIL;TYPE=INTERNET:${email}` : '',
    url ? `URL:${url}` : '',
    note ? `NOTE:${note}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n');

  useEffect(() => {
    QRCode.toDataURL(vCardPayload, {
      width: 320,
      margin: 2,
      color: { dark: '#1e293b', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => setQrDataUrl(dataUrl))
      .catch((err) => console.error(err));
  }, [vCardPayload]);

  const downloadVcf = () => {
    const blob = new Blob([vCardPayload], { type: 'text/vcard;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${firstName.toLowerCase()}_${lastName.toLowerCase()}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadQrImage = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Form Input Fields */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <User className="w-5 h-5 text-pink-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Contact Card Information (vCard 3.0)
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Organization
            </label>
            <input
              type="text"
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Job Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            Website URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            Notes / Details
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* QR Preview & Export Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-between space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Scannable vCard Preview
          </span>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            {firstName} {lastName}
          </h4>
          <p className="text-xs text-slate-500">{title} • {org}</p>
        </div>

        <div className="p-4 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="vCard QR Code" className="w-56 h-56" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
              Generating QR...
            </div>
          )}
        </div>

        <div className="w-full grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={downloadQrImage}
            className="py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download QR (.PNG)
          </button>
          <button
            type="button"
            onClick={downloadVcf}
            className="py-3 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Save Card (.VCF)
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 440 — BARCODE INVENTORY LIST
// ========================================================
interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  minStock: number;
}

export const BarcodeInventoryListTool: React.FC<ToolProps> = () => {
  const [items, setItems] = useState<InventoryItem[]>(() => {
    try {
      const stored = localStorage.getItem('toolstrum_inventory_items');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      { id: '1', sku: 'SKU-1001-A', name: 'USB-C Anodized Cable 2m', category: 'Cables', quantity: 45, minStock: 15 },
      { id: '2', sku: 'SKU-1002-B', name: '65W GaN Fast Charger', category: 'Power', quantity: 8, minStock: 10 },
      { id: '3', sku: 'SKU-1003-C', name: 'Wireless Bluetooth Headset', category: 'Audio', quantity: 18, minStock: 5 },
    ];
  });

  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hardware');
  const [quantity, setQuantity] = useState(10);
  const [minStock, setMinStock] = useState(5);

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_inventory_items', JSON.stringify(items));
    } catch {}
  }, [items]);

  const addItem = () => {
    if (!name.trim()) return;
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      sku: sku.trim() || `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      category: category.trim() || 'General',
      quantity: Number(quantity) || 0,
      minStock: Number(minStock) || 0,
    };
    setItems((prev) => [newItem, ...prev]);
    setName('');
    setSku('');
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const exportCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'MinStock', 'Status'];
    const rows = items.map((i) => [
      i.sku,
      `"${i.name.replace(/"/g, '""')}"`,
      `"${i.category}"`,
      i.quantity,
      i.minStock,
      i.quantity <= i.minStock ? 'LOW STOCK' : 'IN STOCK',
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Add New Item Bar */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Add Inventory SKU & Barcode Item
            </span>
          </div>
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">SKU Code</label>
            <input
              type="text"
              placeholder="Auto-generated if empty"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-900 dark:text-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Item Title</label>
            <input
              type="text"
              placeholder="e.g. Wireless Mouse M3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Initial Qty</label>
            <input
              type="number"
              min="0"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={addItem}
              className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Stock Catalog ({items.length} items)
          </span>
          <span className="text-[11px] text-slate-400">
            {items.filter((i) => i.quantity <= i.minStock).length} low stock warnings
          </span>
        </div>

        <div className="space-y-2">
          {items.map((item) => {
            const isLow = item.quantity <= item.minStock;
            return (
              <div
                key={item.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                    <Barcode className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{item.name}</span>
                      {isLow && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500 text-[10px] font-bold">
                          Low Stock
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">
                      {item.sku} • {item.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <div className="flex items-center gap-1 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 p-1">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      -
                    </button>
                    <span className="px-2 font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-2 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 443 — WORLD HOLIDAY CALENDAR
// ========================================================
interface Holiday {
  date: string;
  name: string;
  country: string;
  type: string;
}

const WORLD_HOLIDAYS_DATA: Holiday[] = [
  { date: '2026-01-01', name: "New Year's Day", country: 'Global', type: 'Public' },
  { date: '2026-01-26', name: 'Republic Day', country: 'India', type: 'National' },
  { date: '2026-01-26', name: 'Australia Day', country: 'Australia', type: 'National' },
  { date: '2026-02-17', name: 'Lunar New Year', country: 'Global', type: 'Cultural' },
  { date: '2026-03-03', name: 'Holi Festival', country: 'India', type: 'Cultural' },
  { date: '2026-04-03', name: 'Good Friday', country: 'Global', type: 'Public' },
  { date: '2026-04-05', name: 'Easter Sunday', country: 'Global', type: 'Cultural' },
  { date: '2026-05-01', name: 'International Workers Day', country: 'Global', type: 'Public' },
  { date: '2026-05-25', name: 'Memorial Day', country: 'United States', type: 'Federal' },
  { date: '2026-07-01', name: 'Canada Day', country: 'Canada', type: 'National' },
  { date: '2026-07-04', name: 'Independence Day', country: 'United States', type: 'Federal' },
  { date: '2026-07-14', name: 'Bastille Day', country: 'France', type: 'National' },
  { date: '2026-08-15', name: 'Independence Day', country: 'India', type: 'National' },
  { date: '2026-09-07', name: 'Labor Day', country: 'United States', type: 'Federal' },
  { date: '2026-10-03', name: 'German Unity Day', country: 'Germany', type: 'National' },
  { date: '2026-11-08', name: 'Diwali Festival of Lights', country: 'India', type: 'Cultural' },
  { date: '2026-11-26', name: 'Thanksgiving Day', country: 'United States', type: 'Federal' },
  { date: '2026-12-25', name: 'Christmas Day', country: 'Global', type: 'Public' },
  { date: '2026-12-26', name: 'Boxing Day', country: 'UK & Commonwealth', type: 'Public' },
];

export const WorldHolidayCalendarTool: React.FC<ToolProps> = () => {
  const [filterCountry, setFilterCountry] = useState('All');
  const [search, setSearch] = useState('');

  const countries = ['All', 'Global', 'United States', 'India', 'UK & Commonwealth', 'Canada', 'France', 'Germany', 'Australia'];

  const filtered = WORLD_HOLIDAYS_DATA.filter((h) => {
    const matchCountry = filterCountry === 'All' || h.country === filterCountry;
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) || h.date.includes(search);
    return matchCountry && matchSearch;
  });

  const exportIcs = () => {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Toolstrum//World Holiday Calendar//EN',
    ];

    filtered.forEach((h, idx) => {
      const dt = h.date.replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:holiday-${idx}-${dt}@toolstrum.app`,
        `DTSTAMP:${dt}T000000Z`,
        `DTSTART;VALUE=DATE:${dt}`,
        `SUMMARY:${h.name} (${h.country})`,
        `DESCRIPTION:${h.type} holiday`,
        'END:VEVENT'
      );
    });

    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `world_holidays_2026.ics`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pink-500" />
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
              2026 World Holiday & Observance Explorer
            </span>
          </div>
          <button
            type="button"
            onClick={exportIcs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 hover:bg-pink-100 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 font-semibold text-xs transition-all self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            Export to Calendar (.ICS)
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search holiday name or date..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
          />

          <div className="flex flex-wrap gap-1.5">
            {countries.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilterCountry(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filterCountry === c
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filtered.map((h, i) => {
          const d = new Date(h.date);
          const monthStr = d.toLocaleString('en-US', { month: 'short' });
          const dayStr = d.getDate();
          const weekdayStr = d.toLocaleString('en-US', { weekday: 'short' });

          return (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3.5"
            >
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 border border-pink-200 dark:border-pink-800 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider">{monthStr}</span>
                <span className="text-base font-black leading-none">{dayStr}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {h.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {weekdayStr} • {h.country} ({h.type})
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ========================================================
// 445 — FOCUS DEEP WORK TIMER
// ========================================================
export const FocusDeepWorkTimerTool: React.FC<ToolProps> = () => {
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [secondsRemaining, setSecondsRemaining] = useState(45 * 60);
  const [isActive, setIsActive] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(false);
  const [distractions, setDistractions] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);

  const startWhiteNoise = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      // Generate brown/pink ambient noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5; // Gain factor
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08, ctx.currentTime);

      whiteNoise.connect(gain);
      gain.connect(ctx.destination);
      whiteNoise.start();

      noiseNodeRef.current = whiteNoise;
    } catch {}
  };

  const stopWhiteNoise = () => {
    try {
      if (noiseNodeRef.current) {
        (noiseNodeRef.current as any).stop();
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    } catch {}
    audioCtxRef.current = null;
    noiseNodeRef.current = null;
  };

  useEffect(() => {
    if (ambientAudio && isActive) {
      startWhiteNoise();
    } else {
      stopWhiteNoise();
    }
    return () => stopWhiteNoise();
  }, [ambientAudio, isActive]);

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const selectDuration = (mins: number) => {
    setDurationMinutes(mins);
    setIsActive(false);
    setSecondsRemaining(mins * 60);
  };

  const resetTimer = () => {
    setIsActive(false);
    setSecondsRemaining(durationMinutes * 60);
  };

  const m = Math.floor(secondsRemaining / 60);
  const s = secondsRemaining % 60;
  const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-6">
        <div className="flex gap-2">
          {[25, 45, 60, 90].map((mins) => (
            <button
              key={mins}
              type="button"
              onClick={() => selectDuration(mins)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                durationMinutes === mins
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {mins}m Deep Work
            </button>
          ))}
        </div>

        {/* Big Digital Display */}
        <div className="text-6xl sm:text-7xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">
          {timeFormatted}
        </div>

        {/* Ambient Noise Toggle */}
        <button
          type="button"
          onClick={() => setAmbientAudio(!ambientAudio)}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-semibold transition-all ${
            ambientAudio
              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 border border-emerald-300'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
          }`}
        >
          {ambientAudio ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          Ambient Soft Waves Noise ({ambientAudio ? 'ON' : 'OFF'})
        </button>

        {/* Control Buttons */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className="flex-1 py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-sm shadow-md shadow-pink-600/20 transition-all flex items-center justify-center gap-2"
          >
            {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isActive ? 'Pause Session' : 'Start Focus'}
          </button>
          <button
            type="button"
            onClick={resetTimer}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Distraction Counter */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-xs text-slate-500">
          <span>Distractions Logged: {distractions}</span>
          <button
            type="button"
            onClick={() => setDistractions((d) => d + 1)}
            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
          >
            + Log Distraction
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 446 — POMODORO TIMER
// ========================================================
export const PomodoroTimerTool: React.FC<ToolProps> = () => {
  const [cycle, setCycle] = useState<'25' | '5' | '15'>('25');
  const [seconds, setSeconds] = useState(25 * 60);
  const [active, setActive] = useState(false);
  const [completed, setCompleted] = useState(0);

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
    if (active) {
      interval = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setActive(false);
            playChime();
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
            if (cycle === '25') setCompleted((c) => c + 1);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [active, cycle]);

  const setTimerCycle = (newCycle: '25' | '5' | '15') => {
    setCycle(newCycle);
    setActive(false);
    setSeconds(Number(newCycle) * 60);
  };

  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const timeFormatted = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-6">
        <div className="flex gap-2">
          {(
            [
              ['25', 'Pomodoro (25m)'],
              ['5', 'Short Break (5m)'],
              ['15', 'Long Break (15m)'],
            ] as const
          ).map(([val, label]) => (
            <button
              key={val}
              type="button"
              onClick={() => setTimerCycle(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                cycle === val
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="text-6xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">
          {timeFormatted}
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={() => setActive(!active)}
            className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            {active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {active ? 'Pause' : 'Start Interval'}
          </button>
          <button
            type="button"
            onClick={() => {
              setActive(false);
              setSeconds(Number(cycle) * 60);
            }}
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Pomodoros Finished Today: {completed} 🍅
        </div>
      </div>
    </div>
  );
};

// ========================================================
// 447 — RANDOM DECISION PICKER
// ========================================================
export const RandomDecisionPickerTool: React.FC<ToolProps> = () => {
  const [optionsText, setOptionsText] = useState('Pizza\nSushi\nTacos\nSalad\nBurgers');
  const [decision, setDecision] = useState<string | null>(null);
  const [isDeciding, setIsDeciding] = useState(false);

  const makeDecision = () => {
    const list = optionsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    if (list.length === 0) return;

    setIsDeciding(true);
    setDecision(null);

    setTimeout(() => {
      const winner = list[Math.floor(Math.random() * list.length)];
      setDecision(winner);
      setIsDeciding(false);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    }, 600);
  };

  const setPreset = (presetText: string) => {
    setOptionsText(presetText);
    setDecision(null);
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Shuffle className="w-5 h-5 text-pink-500" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Random Decision Picker
          </span>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
            Choices (One per line)
          </label>
          <textarea
            rows={5}
            value={optionsText}
            onChange={(e) => setOptionsText(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1 self-center">Presets:</span>
          <button
            type="button"
            onClick={() => setPreset('Yes\nNo')}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
          >
            Yes / No
          </button>
          <button
            type="button"
            onClick={() => setPreset('Heads\nTails')}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
          >
            Coin Flip
          </button>
          <button
            type="button"
            onClick={() => setPreset('1\n2\n3\n4\n5\n6')}
            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
          >
            Dice (1-6)
          </button>
        </div>

        <button
          type="button"
          disabled={isDeciding}
          onClick={makeDecision}
          className="w-full py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-extrabold text-sm shadow-md shadow-pink-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {isDeciding ? 'Choosing at random...' : 'Pick My Choice!'}
        </button>

        {decision && (
          <div className="p-5 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-center space-y-1 animate-in zoom-in-95">
            <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 tracking-wider">
              Selected Decision
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {decision}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ========================================================
// 448 — ANIMATED WHEEL OF NAMES
// ========================================================
export const WheelOfNamesTool: React.FC<ToolProps> = () => {
  const [namesText, setNamesText] = useState(() => {
    try {
      return localStorage.getItem('toolstrum_wheel_names') || 'Alex\nJordan\nTaylor\nSam\nMorgan\nChris';
    } catch {
      return 'Alex\nJordan\nTaylor\nSam\nMorgan\nChris';
    }
  });
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winnerName, setWinnerName] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('toolstrum_wheel_names', namesText);
    } catch {}
  }, [namesText]);

  const parsedNames = namesText
    .split('\n')
    .map((n) => n.trim())
    .filter(Boolean);

  const wheelColors = [
    '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
    '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6'
  ];

  const handleSpinWheel = () => {
    if (parsedNames.length < 2 || isSpinning) return;
    setIsSpinning(true);
    setWinnerName(null);

    const winnerIdx = Math.floor(Math.random() * parsedNames.length);
    const sliceAngle = 360 / parsedNames.length;
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const targetDeg = extraSpins + (360 - winnerIdx * sliceAngle - sliceAngle / 2);

    setRotation((prev) => prev + targetDeg);

    setTimeout(() => {
      setIsSpinning(false);
      setWinnerName(parsedNames[winnerIdx]);
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    }, 4000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Names Input Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
            Names List (One per line)
          </label>
          <textarea
            rows={8}
            value={namesText}
            onChange={(e) => setNamesText(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white"
          />
        </div>

        {winnerName && (
          <div className="p-4 rounded-2xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-center space-y-1 animate-in zoom-in-95">
            <span className="text-[10px] uppercase font-bold text-pink-600 dark:text-pink-400 tracking-wider">
              Winner!
            </span>
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {winnerName}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Wheel Canvas */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center space-y-6">
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          {/* Pointer Arrow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-14 border-t-rose-600 drop-shadow-md" />

          {/* Spinning Wheel */}
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full rounded-full shadow-lg transition-transform"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4s cubic-bezier(0.15, 0.9, 0.2, 1)' : 'none',
            }}
          >
            {parsedNames.map((name, i) => {
              const slice = 360 / parsedNames.length;
              const startAngle = (i * slice * Math.PI) / 180;
              const endAngle = (((i + 1) * slice) * Math.PI) / 180;
              const x1 = 100 + 100 * Math.cos(startAngle);
              const y1 = 100 + 100 * Math.sin(startAngle);
              const x2 = 100 + 100 * Math.cos(endAngle);
              const y2 = 100 + 100 * Math.sin(endAngle);
              const largeArc = slice > 180 ? 1 : 0;
              const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 ${largeArc} 1 ${x2} ${y2} Z`;

              const midAngle = ((i + 0.5) * slice * Math.PI) / 180;
              const textX = 100 + 60 * Math.cos(midAngle);
              const textY = 100 + 60 * Math.sin(midAngle);
              const textRot = (i + 0.5) * slice;

              return (
                <g key={i}>
                  <path
                    d={pathData}
                    fill={wheelColors[i % wheelColors.length]}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <text
                    x={textX}
                    y={textY}
                    fill="#ffffff"
                    fontSize="9"
                    fontWeight="bold"
                    textAnchor="middle"
                    dominantBaseline="central"
                    transform={`rotate(${textRot + 90}, ${textX}, ${textY})`}
                  >
                    {name.length > 8 ? name.slice(0, 7) + '…' : name}
                  </text>
                </g>
              );
            })}
            <circle cx="100" cy="100" r="16" fill="#1e293b" stroke="#ffffff" strokeWidth="2" />
            <circle cx="100" cy="100" r="6" fill="#ec4899" />
          </svg>
        </div>

        <button
          onClick={handleSpinWheel}
          disabled={isSpinning || parsedNames.length < 2}
          className="w-full max-w-xs py-3.5 rounded-2xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-extrabold text-sm shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
        >
          <Shuffle className="w-4 h-4" />
          <span>{isSpinning ? 'Spinning Wheel...' : 'Spin the Wheel!'}</span>
        </button>
      </div>
    </div>
  );
};
