import React, { useState, useMemo } from 'react';
import {
  RefreshCw,
  Copy,
  Check,
  Download,
  Plus,
  Trash2,
  FileCode,
  Sparkles,
  Sliders,
  Layers,
} from 'lucide-react';

export interface MockField {
  id: string;
  name: string;
  type: string;
}

const FIELD_TYPES = [
  { id: 'uuid', label: 'UUID (v4)' },
  { id: 'id', label: 'Integer ID (1, 2, ...)' },
  { id: 'fullName', label: 'Full Name' },
  { id: 'firstName', label: 'First Name' },
  { id: 'lastName', label: 'Last Name' },
  { id: 'email', label: 'Email Address' },
  { id: 'phone', label: 'Phone Number' },
  { id: 'company', label: 'Company Name' },
  { id: 'jobTitle', label: 'Job Title' },
  { id: 'city', label: 'City' },
  { id: 'country', label: 'Country' },
  { id: 'number', label: 'Random Number (0-1000)' },
  { id: 'price', label: 'Price / Currency (e.g. 49.99)' },
  { id: 'boolean', label: 'Boolean (true/false)' },
  { id: 'date', label: 'ISO 8601 Date' },
  { id: 'ipAddress', label: 'IPv4 Address' },
  { id: 'status', label: 'Status (active/pending/inactive)' },
];

const DEFAULT_FIELDS: MockField[] = [
  { id: '1', name: 'id', type: 'uuid' },
  { id: '2', name: 'name', type: 'fullName' },
  { id: '3', name: 'email', type: 'email' },
  { id: '4', name: 'company', type: 'company' },
  { id: '5', name: 'balance', type: 'price' },
  { id: '6', name: 'isActive', type: 'boolean' },
  { id: '7', name: 'createdAt', type: 'date' },
];

const FIRST_NAMES = ['Liam', 'Olivia', 'Noah', 'Emma', 'Oliver', 'Charlotte', 'Elijah', 'Amelia', 'James', 'Ava', 'William', 'Sophia', 'Benjamin', 'Isabella', 'Lucas', 'Mia'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'];
const COMPANIES = ['Acme Corp', 'Stark Industries', 'Wayne Enterprises', 'Cyberdyne Systems', 'Initech', 'Umbrella Corp', 'Hooli', 'Pied Piper', 'Massive Dynamic', 'Soylent Corp'];
const CITIES = ['San Francisco', 'New York', 'London', 'Tokyo', 'Berlin', 'Sydney', 'Toronto', 'Singapore', 'Paris', 'Amsterdam'];
const COUNTRIES = ['United States', 'United Kingdom', 'Germany', 'Japan', 'Australia', 'Canada', 'France', 'Netherlands'];

export const MockJsonGeneratorPanel: React.FC = () => {
  const [fields, setFields] = useState<MockField[]>(DEFAULT_FIELDS);
  const [recordCount, setRecordCount] = useState<number>(5);
  const [format, setFormat] = useState<'json' | 'csv' | 'typescript'>('json');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleAddField = () => {
    const id = Math.random().toString(36).slice(2, 7);
    setFields((prev) => [...prev, { id, name: 'newField', type: 'email' }]);
  };

  const handleUpdateField = (id: string, key: 'name' | 'type', val: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    );
  };

  const handleDeleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const handleDownload = (content: string, ext: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mock-data-${Date.now()}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Synthetic Value Generator
  const generateFieldValue = (type: string, index: number) => {
    const fn = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
    const ln = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
    switch (type) {
      case 'uuid':
        return crypto.randomUUID ? crypto.randomUUID() : `mock-${Math.random().toString(36).slice(2, 10)}`;
      case 'id':
        return index + 1;
      case 'fullName':
        return `${fn} ${ln}`;
      case 'firstName':
        return fn;
      case 'lastName':
        return ln;
      case 'email':
        return `${fn.toLowerCase()}.${ln.toLowerCase()}@example.com`;
      case 'phone':
        return `+1 (${Math.floor(Math.random() * 800) + 200}) ${Math.floor(Math.random() * 899) + 100}-${Math.floor(Math.random() * 8999) + 1000}`;
      case 'company':
        return COMPANIES[Math.floor(Math.random() * COMPANIES.length)];
      case 'jobTitle':
        return ['Software Engineer', 'Product Manager', 'Data Scientist', 'DevOps Lead', 'UX Designer'][Math.floor(Math.random() * 5)];
      case 'city':
        return CITIES[Math.floor(Math.random() * CITIES.length)];
      case 'country':
        return COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      case 'number':
        return Math.floor(Math.random() * 1000);
      case 'price':
        return parseFloat((Math.random() * 500 + 10).toFixed(2));
      case 'boolean':
        return Math.random() > 0.4;
      case 'date':
        return new Date(Date.now() - Math.floor(Math.random() * 1e10)).toISOString();
      case 'ipAddress':
        return `${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}.${Math.floor(Math.random() * 254)}`;
      case 'status':
        return ['active', 'pending', 'suspended'][Math.floor(Math.random() * 3)];
      default:
        return 'Sample Value';
    }
  };

  // Generate dataset
  const generatedData = useMemo(() => {
    const records = Array.from({ length: recordCount }, (_, i) => {
      const obj: Record<string, any> = {};
      for (const field of fields) {
        if (field.name.trim()) {
          obj[field.name.trim()] = generateFieldValue(field.type, i);
        }
      }
      return obj;
    });

    if (format === 'json') {
      return JSON.stringify(records, null, 2);
    }
    if (format === 'csv') {
      if (fields.length === 0) return '';
      const headers = fields.map((f) => f.name.trim()).join(',');
      const rows = records.map((r) =>
        fields
          .map((f) => {
            const val = r[f.name.trim()];
            if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
            return val;
          })
          .join(',')
      );
      return [headers, ...rows].join('\n');
    }
    // TypeScript Interface + Dataset
    const tsTypes = fields
      .map((f) => {
        let typeStr = 'string';
        if (f.type === 'id' || f.type === 'number' || f.type === 'price') typeStr = 'number';
        if (f.type === 'boolean') typeStr = 'boolean';
        return `  ${f.name.trim()}: ${typeStr};`;
      })
      .join('\n');
    return `export interface MockItem {\n${tsTypes}\n}\n\nexport const MOCK_ITEMS: MockItem[] = ${JSON.stringify(
      records,
      null,
      2
    )};`;
  }, [fields, recordCount, format]);

  return (
    <div className="space-y-6">
      {/* Controls & Presets */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mock JSON & Synthetic Data Generator
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFields(DEFAULT_FIELDS)}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Template</span>
            </button>
          </div>
        </div>

        {/* Record count slider & format switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              <span>Number of Records</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">{recordCount} records</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              value={recordCount}
              onChange={(e) => setRecordCount(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500"
            />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Export Format
            </span>
            <div className="flex items-center gap-1.5">
              {(['json', 'csv', 'typescript'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-bold uppercase transition-all ${
                    format === fmt
                      ? 'bg-sky-500 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Schema Field Builder */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Schema Fields ({fields.length})
            </span>
            <button
              onClick={handleAddField}
              className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {fields.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs"
              >
                <input
                  type="text"
                  value={f.name}
                  onChange={(e) => handleUpdateField(f.id, 'name', e.target.value)}
                  placeholder="Field Name"
                  className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
                <select
                  value={f.type}
                  onChange={(e) => handleUpdateField(f.id, 'type', e.target.value)}
                  className="flex-1 px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleDeleteField(f.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Remove field"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Output Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Generated Synthetic Payload
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => copyToClipboard(generatedData, 'payload')}
                className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs"
              >
                {copiedKey === 'payload' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>Copy</span>
              </button>
              <button
                onClick={() => handleDownload(generatedData, format === 'typescript' ? 'ts' : format)}
                className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                title="Download file"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="h-[460px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <pre className="p-4 h-full font-mono text-xs text-sky-600 dark:text-sky-400 whitespace-pre-wrap overflow-y-auto">
              {generatedData}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
