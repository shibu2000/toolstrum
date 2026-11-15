import React, { useState, useMemo } from 'react';
import {
  FileText,
  Search,
  Copy,
  Check,
  FileCode,
  Image,
  Music,
  Video,
  Type,
  Layers,
  Sparkles,
} from 'lucide-react';

export interface MimeEntry {
  ext: string;
  mime: string;
  category: 'text' | 'application' | 'image' | 'audio' | 'video' | 'font';
  categoryLabel: string;
  description: string;
  isCommon: boolean;
}

export const MIME_DATABASE: MimeEntry[] = [
  // Text
  { ext: '.html', mime: 'text/html', category: 'text', categoryLabel: 'Text / Web', description: 'HyperText Markup Language', isCommon: true },
  { ext: '.css', mime: 'text/css', category: 'text', categoryLabel: 'Text / Web', description: 'Cascading Style Sheets', isCommon: true },
  { ext: '.js', mime: 'text/javascript', category: 'text', categoryLabel: 'Text / Web', description: 'JavaScript source code (RFC 9239)', isCommon: true },
  { ext: '.mjs', mime: 'text/javascript', category: 'text', categoryLabel: 'Text / Web', description: 'JavaScript ECMAScript Module', isCommon: true },
  { ext: '.txt', mime: 'text/plain', category: 'text', categoryLabel: 'Text', description: 'Plain unformatted text', isCommon: true },
  { ext: '.csv', mime: 'text/csv', category: 'text', categoryLabel: 'Text', description: 'Comma-Separated Values tabular data', isCommon: true },
  { ext: '.md', mime: 'text/markdown', category: 'text', categoryLabel: 'Text', description: 'Markdown formatted document', isCommon: true },
  { ext: '.yaml', mime: 'text/yaml', category: 'text', categoryLabel: 'Text', description: 'YAML Ain\'t Markup Language', isCommon: true },
  { ext: '.yml', mime: 'text/yaml', category: 'text', categoryLabel: 'Text', description: 'YAML data serialization', isCommon: true },
  { ext: '.xml', mime: 'application/xml', category: 'text', categoryLabel: 'Text / XML', description: 'Extensible Markup Language', isCommon: true },

  // Application
  { ext: '.json', mime: 'application/json', category: 'application', categoryLabel: 'Application', description: 'JavaScript Object Notation (RFC 8259)', isCommon: true },
  { ext: '.pdf', mime: 'application/pdf', category: 'application', categoryLabel: 'Application', description: 'Adobe Portable Document Format', isCommon: true },
  { ext: '.zip', mime: 'application/zip', category: 'application', categoryLabel: 'Application', description: 'ZIP compressed archive', isCommon: true },
  { ext: '.wasm', mime: 'application/wasm', category: 'application', categoryLabel: 'Application', description: 'WebAssembly binary bytecode', isCommon: true },
  { ext: '.tar', mime: 'application/x-tar', category: 'application', categoryLabel: 'Application', description: 'Tape Archive container', isCommon: false },
  { ext: '.gz', mime: 'application/gzip', category: 'application', categoryLabel: 'Application', description: 'Gnu Zipped archive', isCommon: true },
  { ext: '.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', category: 'application', categoryLabel: 'Document', description: 'Microsoft Word OpenXML Document', isCommon: true },
  { ext: '.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', category: 'application', categoryLabel: 'Spreadsheet', description: 'Microsoft Excel OpenXML Spreadsheet', isCommon: true },
  { ext: '.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', category: 'application', categoryLabel: 'Presentation', description: 'Microsoft PowerPoint OpenXML Presentation', isCommon: true },
  { ext: '.epub', mime: 'application/epub+zip', category: 'application', categoryLabel: 'eBook', description: 'Electronic Publication format', isCommon: false },
  { ext: '.sql', mime: 'application/sql', category: 'application', categoryLabel: 'Database', description: 'Structured Query Language source', isCommon: true },
  { ext: '.bin', mime: 'application/octet-stream', category: 'application', categoryLabel: 'Binary', description: 'Generic arbitrary binary data', isCommon: true },

  // Image
  { ext: '.png', mime: 'image/png', category: 'image', categoryLabel: 'Image', description: 'Portable Network Graphics (lossless)', isCommon: true },
  { ext: '.jpg', mime: 'image/jpeg', category: 'image', categoryLabel: 'Image', description: 'Joint Photographic Experts Group', isCommon: true },
  { ext: '.jpeg', mime: 'image/jpeg', category: 'image', categoryLabel: 'Image', description: 'Joint Photographic Experts Group', isCommon: true },
  { ext: '.webp', mime: 'image/webp', category: 'image', categoryLabel: 'Image', description: 'Google WebP modern web format', isCommon: true },
  { ext: '.avif', mime: 'image/avif', category: 'image', categoryLabel: 'Image', description: 'AV1 Image File Format next-gen compression', isCommon: true },
  { ext: '.svg', mime: 'image/svg+xml', category: 'image', categoryLabel: 'Vector Image', description: 'Scalable Vector Graphics', isCommon: true },
  { ext: '.gif', mime: 'image/gif', category: 'image', categoryLabel: 'Image', description: 'Graphics Interchange Format', isCommon: true },
  { ext: '.ico', mime: 'image/x-icon', category: 'image', categoryLabel: 'Icon', description: 'Windows Icon resource (Favicon)', isCommon: true },
  { ext: '.tiff', mime: 'image/tiff', category: 'image', categoryLabel: 'Raw Image', description: 'Tagged Image File Format', isCommon: false },
  { ext: '.bmp', mime: 'image/bmp', category: 'image', categoryLabel: 'Bitmap', description: 'Bitmap Image format', isCommon: false },

  // Audio
  { ext: '.mp3', mime: 'audio/mpeg', category: 'audio', categoryLabel: 'Audio', description: 'MPEG Audio Layer III', isCommon: true },
  { ext: '.wav', mime: 'audio/wav', category: 'audio', categoryLabel: 'Audio', description: 'Waveform Audio File Format (uncompressed PCM)', isCommon: true },
  { ext: '.ogg', mime: 'audio/ogg', category: 'audio', categoryLabel: 'Audio', description: 'Ogg Vorbis compressed audio', isCommon: true },
  { ext: '.weba', mime: 'audio/webm', category: 'audio', categoryLabel: 'Audio', description: 'WebM audio container', isCommon: true },
  { ext: '.aac', mime: 'audio/aac', category: 'audio', categoryLabel: 'Audio', description: 'Advanced Audio Coding', isCommon: true },
  { ext: '.flac', mime: 'audio/flac', category: 'audio', categoryLabel: 'Audio', description: 'Free Lossless Audio Codec', isCommon: true },
  { ext: '.midi', mime: 'audio/midi', category: 'audio', categoryLabel: 'Audio', description: 'Musical Instrument Digital Interface', isCommon: false },

  // Video
  { ext: '.mp4', mime: 'video/mp4', category: 'video', categoryLabel: 'Video', description: 'MPEG-4 Part 14 video container (H.264 / AV1)', isCommon: true },
  { ext: '.webm', mime: 'video/webm', category: 'video', categoryLabel: 'Video', description: 'WebM open media container (VP9 / AV1)', isCommon: true },
  { ext: '.ogv', mime: 'video/ogg', category: 'video', categoryLabel: 'Video', description: 'Ogg Theora video container', isCommon: false },
  { ext: '.mov', mime: 'video/quicktime', category: 'video', categoryLabel: 'Video', description: 'Apple QuickTime Movie', isCommon: true },
  { ext: '.mkv', mime: 'video/x-matroska', category: 'video', categoryLabel: 'Video', description: 'Matroska multimedia container', isCommon: true },
  { ext: '.avi', mime: 'video/x-msvideo', category: 'video', categoryLabel: 'Video', description: 'Audio Video Interleave', isCommon: false },

  // Font
  { ext: '.woff2', mime: 'font/woff2', category: 'font', categoryLabel: 'Font', description: 'Web Open Font Format 2.0 (Brotli compressed)', isCommon: true },
  { ext: '.woff', mime: 'font/woff', category: 'font', categoryLabel: 'Font', description: 'Web Open Font Format 1.0', isCommon: true },
  { ext: '.ttf', mime: 'font/ttf', category: 'font', categoryLabel: 'Font', description: 'TrueType Font', isCommon: true },
  { ext: '.otf', mime: 'font/otf', category: 'font', categoryLabel: 'Font', description: 'OpenType Font', isCommon: true },
  { ext: '.eot', mime: 'application/vnd.ms-fontobject', category: 'font', categoryLabel: 'Font', description: 'Embedded OpenType font', isCommon: false },
];

export const MimeTypePanel: React.FC = () => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'text' | 'application' | 'image' | 'audio' | 'video' | 'font'>('all');
  const [selectedMime, setSelectedMime] = useState<MimeEntry>(MIME_DATABASE[10]); // Default to .json
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const filteredList = useMemo(() => {
    const q = search.toLowerCase().trim();
    return MIME_DATABASE.filter((item) => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesQuery =
        !q ||
        item.ext.toLowerCase().includes(q) ||
        item.mime.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [search, selectedCategory]);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'image':
        return <Image className="w-3.5 h-3.5 text-emerald-500" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-amber-500" />;
      case 'video':
        return <Video className="w-3.5 h-3.5 text-purple-500" />;
      case 'font':
        return <Type className="w-3.5 h-3.5 text-pink-500" />;
      case 'text':
        return <FileText className="w-3.5 h-3.5 text-sky-500" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-indigo-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              MIME Type & Content-Type Directory
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {filteredList.length} media types available
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by extension (e.g. .webp, json) or MIME type (image/png, audio/)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Category Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            { id: 'all', label: 'All Media' },
            { id: 'text', label: 'Text & Code' },
            { id: 'application', label: 'Applications & Data' },
            { id: 'image', label: 'Images & Vectors' },
            { id: 'audio', label: 'Audio' },
            { id: 'video', label: 'Video' },
            { id: 'font', label: 'Fonts' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Extension List */}
        <div className="lg:col-span-6 space-y-1.5 max-h-[540px] overflow-y-auto pr-1">
          {filteredList.map((item) => {
            const isSelected = selectedMime.ext === item.ext;
            return (
              <button
                key={item.ext}
                onClick={() => setSelectedMime(item)}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-sky-500/10 border-sky-500 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate mr-2">
                  {getCategoryIcon(item.category)}
                  <span className="font-mono text-xs font-black text-sky-600 dark:text-sky-400 shrink-0">
                    {item.ext}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 truncate">
                    {item.description}
                  </span>
                </div>
                <span className="font-mono text-[11px] text-slate-400 shrink-0">
                  {item.mime}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Column: In-Depth Details Card & Snippets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black font-mono text-sky-600 dark:text-sky-400">
                  {selectedMime.ext}
                </span>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedMime.description}
                  </h4>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mt-0.5">
                    {selectedMime.categoryLabel}
                  </span>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(selectedMime.mime, 'mime')}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                {copiedKey === 'mime' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy MIME</span>
              </button>
            </div>

            {/* Standard MIME string card */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Canonical IANA Media Type
              </span>
              <p className="font-mono text-sm font-black text-slate-900 dark:text-white break-all">
                {selectedMime.mime}
              </p>
            </div>

            {/* HTTP Content-Type Header */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  HTTP Response Header
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `Content-Type: ${selectedMime.mime}${selectedMime.category === 'text' ? '; charset=utf-8' : ''}`,
                      'header'
                    )
                  }
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'header' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Header</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-sky-600 dark:text-sky-400 whitespace-pre-wrap">
                Content-Type: {selectedMime.mime}{selectedMime.category === 'text' ? '; charset=utf-8' : ''}
              </pre>
            </div>

            {/* Nginx / Apache snippet */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Nginx mime.types mapping
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `${selectedMime.mime} ${selectedMime.ext.replace(/^\./, '')};`,
                      'nginx'
                    )
                  }
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey === 'nginx' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>Copy Nginx Rule</span>
                </button>
              </div>
              <pre className="font-mono text-xs text-slate-700 dark:text-slate-300">
                {selectedMime.mime} {selectedMime.ext.replace(/^\./, '')};
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
