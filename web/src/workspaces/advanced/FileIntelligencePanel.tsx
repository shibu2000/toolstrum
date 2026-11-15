import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Search,
  Eye,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Folder,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  classifyDocumentContent,
  scanAndRedactPii,
  computeHashSimilarity,
} from './advancedHelpers';

interface ToolProps {
  toolId: number;
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const FileIntelligencePanel: React.FC<ToolProps> = ({ toolId, onCopy }) => {
  // 480: Document Classification
  const [docContent, setDocContent] = useState(
    'The parties hereto hereby agree to maintain strict confidentiality regarding all proprietary information, software algorithms, and trade secrets disclosed herein under the jurisdiction of the state court.'
  );
  const classResult = React.useMemo(() => classifyDocumentContent(docContent), [docContent]);

  // 481: Smart File Renamer
  const [sampleFilenames, setSampleFilenames] = useState('contract_draft_final.docx\ninvoice_jan_2026.pdf\nscreenshot_debug_01.png');
  const [renamePrefix, setRenamePrefix] = useState('DOC_2026_');
  const [renameCasing, setRenameCasing] = useState<'upper' | 'lower' | 'none'>('upper');

  const renamedList = React.useMemo(() => {
    return sampleFilenames
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((name) => {
        const parts = name.split('.');
        const ext = parts.length > 1 ? parts.pop() : '';
        let base = parts.join('.');
        if (renameCasing === 'upper') base = base.toUpperCase();
        if (renameCasing === 'lower') base = base.toLowerCase();
        return `${renamePrefix}${base}.${ext}`;
      });
  }, [sampleFilenames, renamePrefix, renameCasing]);

  // 482: Smart File Search
  const [searchDoc, setSearchDoc] = useState(
    'Meeting notes 2026:\nReviewed offline privacy architecture.\nFound 2 performance bottlenecks in worker queue.\nAction item: Deploy zero-server Web Crypto AES engine.\nApproved by lead security architect.'
  );
  const [searchKeyword, setSearchKeyword] = useState('bottleneck');

  const searchMatches = React.useMemo(() => {
    if (!searchKeyword.trim()) return [];
    const lines = searchDoc.split('\n');
    return lines.filter((l) => l.toLowerCase().includes(searchKeyword.toLowerCase().trim()));
  }, [searchDoc, searchKeyword]);

  // 483: Document Redaction Assistant
  const [piiInput, setPiiInput] = useState(
    'Customer records: User Alex Doe, email: alex.doe@enterprise.org, SSN: 123-45-6789, emergency phone: (555) 234-5678. Payment card on file: 4111-2222-3333-4444.'
  );
  const piiRedaction = React.useMemo(() => scanAndRedactPii(piiInput), [piiInput]);

  // 484: Form Data Extractor
  const [formText, setFormText] = useState(
    'INVOICE #INV-2026-881\nDATE: 2026-11-15\nDUE DATE: 2026-12-01\nCLIENT: Acme Corp\nSUBTOTAL: $1,250.00\nTAX (8%): $100.00\nTOTAL AMOUNT DUE: $1,350.00'
  );

  const extractedFields = React.useMemo(() => {
    const lines = formText.split('\n').map((l) => l.trim()).filter(Boolean);
    const fields: Array<{ label: string; value: string }> = [];
    for (const l of lines) {
      if (l.includes(':')) {
        const [k, ...v] = l.split(':');
        fields.push({ label: k.trim(), value: v.join(':').trim() });
      } else if (l.includes('#')) {
        fields.push({ label: 'Identifier', value: l });
      }
    }
    return fields;
  }, [formText]);

  // 485: Image Similarity Finder
  const [hashA, setHashA] = useState('a1b2c3d4e5f60718');
  const [hashB, setHashB] = useState('a1b2c3d4e5f60719');
  const hashComparison = React.useMemo(() => computeHashSimilarity(hashA, hashB), [hashA, hashB]);

  // 486: PDF Portfolio Organizer
  const [portfolioItems, setPortfolioItems] = useState([
    { title: 'Executive Summary', pages: 'Pages 1-3', category: 'Overview' },
    { title: 'Technical Specification', pages: 'Pages 4-18', category: 'Architecture' },
    { title: 'Audit & Compliance Certificate', pages: 'Pages 19-24', category: 'Security' },
  ]);

  return (
    <div className="space-y-6">
      {/* 480: DOCUMENT CLASSIFICATION */}
      {toolId === 480 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Heuristic Document Classifier & Genre Detector
            </h3>
            <textarea
              rows={6}
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
            />

            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400">
                    Detected Category
                  </span>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {classResult.category}
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-600 text-white font-bold text-xs">
                  {classResult.confidence}% Confidence
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{classResult.reason}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {classResult.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2.5 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 481: SMART FILE RENAMER */}
      {toolId === 481 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Input File List</h3>
            <textarea
              rows={6}
              value={sampleFilenames}
              onChange={(e) => setSampleFilenames(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Prefix</label>
                <input
                  type="text"
                  value={renamePrefix}
                  onChange={(e) => setRenamePrefix(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Casing</label>
                <select
                  value={renameCasing}
                  onChange={(e) => setRenameCasing(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <option value="upper">UPPERCASE</option>
                  <option value="lower">lowercase</option>
                  <option value="none">Preserve</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Transformed Names</h3>
            <div className="space-y-1.5 font-mono text-xs">
              {renamedList.map((n, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-purple-700 dark:text-purple-300 font-bold truncate">
                  {n}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 482: SMART FILE SEARCH */}
      {toolId === 482 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Client-Side Fast Document Search
            </h3>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search keyword across document..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
              />
            </div>
            <textarea
              rows={6}
              value={searchDoc}
              onChange={(e) => setSearchDoc(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            {searchMatches.length > 0 && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1 text-xs">
                <span className="font-bold text-purple-900 dark:text-purple-200 block">
                  Found {searchMatches.length} matching lines:
                </span>
                {searchMatches.map((m, i) => (
                  <div key={i} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 font-mono text-[11px]">
                    {m}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 483: DOCUMENT REDACTION ASSISTANT */}
      {toolId === 483 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ShieldAlert className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Unsanitized Text with PII
              </h3>
            </div>
            <textarea
              rows={10}
              value={piiInput}
              onChange={(e) => setPiiInput(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Redacted Document Output
              </h3>
              <button
                type="button"
                onClick={() => onCopy && onCopy(piiRedaction.redactedText)}
                className="text-xs text-purple-600 font-bold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Redacted Text
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
              Shielded {piiRedaction.redactionsCount} sensitive entities:
              <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px]">
                {piiRedaction.findings.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>

            <textarea
              rows={6}
              readOnly
              value={piiRedaction.redactedText}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono"
            />
          </div>
        </div>
      )}

      {/* 484: FORM DATA EXTRACTOR */}
      {toolId === 484 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Form / Invoice Text</h3>
            <textarea
              rows={10}
              value={formText}
              onChange={(e) => setFormText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono"
            />
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Extracted Key-Value Attributes</h3>
            <div className="space-y-2 text-xs">
              {extractedFields.map((f, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between">
                  <span className="text-slate-500 font-semibold">{f.label}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{f.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 485: IMAGE SIMILARITY FINDER */}
      {toolId === 485 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Perceptual Difference Hash (dHash) Comparator
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Image A Hash</label>
                <input
                  type="text"
                  value={hashA}
                  onChange={(e) => setHashA(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-slate-500 font-semibold block mb-1">Image B Hash</label>
                <input
                  type="text"
                  value={hashB}
                  onChange={(e) => setHashB(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-center space-y-2">
              <div className="text-4xl font-black text-slate-900 dark:text-white">
                {hashComparison.similarityPercent}% Match
              </div>
              <div className="text-xs font-semibold text-slate-500">
                Hamming Distance: {hashComparison.distance} • Status:{' '}
                <span className={hashComparison.isMatch ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                  {hashComparison.isMatch ? 'Near-Duplicate Image' : 'Distinct Visual'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 486: PDF PORTFOLIO ORGANIZER */}
      {toolId === 486 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              PDF Document Portfolio Binder Index
            </h3>
            <div className="space-y-2 text-xs">
              {portfolioItems.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-slate-400 text-[11px]">{item.category}</div>
                  </div>
                  <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
                    {item.pages}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
