import React, { useState, useMemo } from 'react';
import {
  Globe,
  Mail,
  Phone,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  Layers,
  Filter,
} from 'lucide-react';
import {
  extractAllUrls,
  extractAllEmails,
  extractAllPhoneNumbers,
} from './textHelpers';

interface TextExtractorsPanelProps {
  initialText?: string;
  defaultCategory?: 'urls' | 'emails' | 'phones' | 'all';
}

const SAMPLE_TEXT_EXTRACT = `Hey team, please review the latest updates for our offline privacy application.
You can check the staging deployment at https://staging.toolstrum.app or read our documentation at https://toolstrum.app/docs/security.
Feel free to contact the lead architect at alex.mercer@toolstrum.app or ping our customer support team at support@toolstrum.app.
For urgent incident triage, dial our on-call engineering hotline at +1 (415) 555-0192 or our European office at +44 20 7946 0991.
Also backup credentials can be coordinated via security-desk@internal.net or phone +1-800-555-0144.`;

export const TextExtractorsPanel: React.FC<TextExtractorsPanelProps> = ({
  initialText = SAMPLE_TEXT_EXTRACT,
  defaultCategory = 'all',
}) => {
  const [sourceText, setSourceText] = useState<string>(initialText);
  const [activeTab, setActiveTab] = useState<'all' | 'urls' | 'emails' | 'phones'>(defaultCategory);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Extracted entities
  const urls = useMemo(() => extractAllAllUrls(sourceText), [sourceText]);
  const emails = useMemo(() => extractAllAllEmails(sourceText), [sourceText]);
  const phones = useMemo(() => extractAllAllPhones(sourceText), [sourceText]);

  function extractAllAllUrls(t: string) {
    return extractAllUrls(t);
  }
  function extractAllAllEmails(t: string) {
    return extractAllEmails(t);
  }
  function extractAllAllPhones(t: string) {
    return extractAllPhoneNumbers(t);
  }

  const handleCopyList = (items: string[], type: string) => {
    navigator.clipboard.writeText(items.join('\n'));
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadCsv = (type: 'urls' | 'emails' | 'phones') => {
    let csv = '';
    let filename = '';

    if (type === 'urls') {
      csv = 'URL,Domain\n' + urls.map((u) => `"${u.url}","${u.domain}"`).join('\n');
      filename = 'extracted-urls.csv';
    } else if (type === 'emails') {
      csv = 'Email,Domain\n' + emails.map((e) => `"${e.email}","${e.domain}"`).join('\n');
      filename = 'extracted-emails.csv';
    } else {
      csv = 'PhoneNumber\n' + phones.map((p) => `"${p}"`).join('\n');
      filename = 'extracted-phones.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400">
            <Filter className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Entity Extractors (URLs, Emails, Phones)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Scans raw unstructured text to isolate valid web links, email inboxes, and phone numbers.
            </p>
          </div>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center p-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Entities ({urls.length + emails.length + phones.length})
          </button>
          <button
            onClick={() => setActiveTab('urls')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'urls'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            URLs ({urls.length})
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'emails'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Emails ({emails.length})
          </button>
          <button
            onClick={() => setActiveTab('phones')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'phones'
                ? 'bg-white dark:bg-slate-900 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Phones ({phones.length})
          </button>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <label className="font-semibold uppercase tracking-wider">Unstructured Input Text</label>
          <button
            onClick={() => setSourceText('')}
            className="text-rose-500 hover:text-rose-600 flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
        <textarea
          value={sourceText}
          onChange={(e) => setSourceText(e.target.value)}
          rows={5}
          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono focus:outline-none focus:border-orange-500 shadow-sm"
          placeholder="Paste articles, email dumps, customer records, or log files here..."
        />
      </div>

      {/* Extracted Entity Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* URLs Card */}
        {(activeTab === 'all' || activeTab === 'urls') && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-sky-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Web Links ({urls.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopyList(urls.map((u) => u.url), 'urls')}
                  disabled={urls.length === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  title="Copy URLs"
                >
                  {copiedType === 'urls' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDownloadCsv('urls')}
                  disabled={urls.length === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
              {urls.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No URLs found</p>
              ) : (
                urls.map((u, i) => (
                  <div key={i} className="pt-1.5 first:pt-0">
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-sky-600 dark:text-sky-400 hover:underline break-all block"
                    >
                      {u.url}
                    </a>
                    <span className="text-[10px] text-slate-400">{u.domain}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Emails Card */}
        {(activeTab === 'all' || activeTab === 'emails') && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Email Addresses ({emails.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopyList(emails.map((e) => e.email), 'emails')}
                  disabled={emails.length === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  title="Copy Emails"
                >
                  {copiedType === 'emails' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDownloadCsv('emails')}
                  disabled={emails.length === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
              {emails.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No emails found</p>
              ) : (
                emails.map((e, i) => (
                  <div key={i} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-700 dark:text-emerald-300 font-medium truncate">{e.email}</span>
                    <span className="text-[10px] text-slate-400 shrink-0">@{e.domain}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Phones Card */}
        {(activeTab === 'all' || activeTab === 'phones') && (
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Phone Numbers ({phones.length})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleCopyList(phones, 'phones')}
                  disabled={phones.length === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  title="Copy Phone Numbers"
                >
                  {copiedType === 'phones' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDownloadCsv('phones')}
                  disabled={phones.length === 0}
                  className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 disabled:opacity-40"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-[260px] overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/40">
              {phones.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center italic">No phone numbers found</p>
              ) : (
                phones.map((p, i) => (
                  <div key={i} className="pt-1.5 first:pt-0 text-xs font-mono text-purple-700 dark:text-purple-300">
                    {p}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
