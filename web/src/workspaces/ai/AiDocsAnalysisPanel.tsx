import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  GitCompare,
  BarChart3,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
} from 'lucide-react';
import {
  summarizeDocumentOutline,
  extractDocumentEntities,
  compareDocumentsSemantically,
  analyzeDataTrends,
  DocOutlineSummary,
  ExtractedEntities,
  SemanticDocDiff,
  DataTrendResult,
} from './aiHelpers';

interface AiDocsAnalysisPanelProps {
  defaultMode?: 'pdf_assistant' | 'extractor' | 'comparison' | 'analyst';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const AiDocsAnalysisPanel: React.FC<AiDocsAnalysisPanelProps> = ({
  defaultMode = 'pdf_assistant',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'pdf_assistant' | 'extractor' | 'comparison' | 'analyst'>(
    defaultMode
  );

  // 402: AI PDF Assistant
  const [docText, setDocText] = useState(
    `# Executive Summary: Q4 Product Strategy\n\nSection 1: Architecture\nThe platform architecture is completely decentralized and air-gapped. Zero user payloads ever touch cloud infrastructure.\n\nSection 2: Security Verification\nAll cryptographic signatures and hashes are computed on the client side using the standard Web Cryptography API.\n\nSection 3: Roadmap Deliverables\nDeployment across Web and Native Mobile platforms ensures universal access for privacy-conscious developers.`
  );
  const [docOutline, setDocOutline] = useState<DocOutlineSummary>(() => summarizeDocumentOutline(docText));

  useEffect(() => {
    setDocOutline(summarizeDocumentOutline(docText));
  }, [docText]);

  // 403: AI Document Extractor
  const [entityText, setEntityText] = useState(
    `Invoice for Toolstrum Technologies Corp\nDate: 2026-11-15\nBilling Contact: finance@toolstrum.app\nPhone: +1 555-019-2834\nTotal Due: $4,850.00 USD\nPayment Due Date: Dec 01, 2026`
  );
  const [extractedEntities, setExtractedEntities] = useState<ExtractedEntities>(() =>
    extractDocumentEntities(entityText)
  );

  useEffect(() => {
    setExtractedEntities(extractDocumentEntities(entityText));
  }, [entityText]);

  // 415: AI Document Comparison
  const [contractA, setContractA] = useState(
    `1. Non-Disclosure: Recipient agrees to keep proprietary materials confidential.\n2. Term: This agreement remains valid for 24 months from the effective date.\n3. Governing Law: State of California.`
  );
  const [contractB, setContractB] = useState(
    `1. Non-Disclosure: Recipient agrees to keep proprietary materials confidential.\n2. Term: This agreement remains valid for 36 months from the effective date.\n3. Governing Law: State of California.\n4. Arbitration: All disputes resolved by binding neutral arbitration.`
  );
  const [docDiff, setDocDiff] = useState<SemanticDocDiff>(() =>
    compareDocumentsSemantically(contractA, contractB)
  );

  useEffect(() => {
    setDocDiff(compareDocumentsSemantically(contractA, contractB));
  }, [contractA, contractB]);

  // 416: AI Data Analyst
  const [dataPoints, setDataPoints] = useState('120, 135, 142, 160, 175, 190, 210, 480');
  const [trendResult, setTrendResult] = useState<DataTrendResult>(() => {
    const nums = dataPoints.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
    return analyzeDataTrends(nums);
  });

  useEffect(() => {
    const nums = dataPoints.split(',').map((n) => parseFloat(n.trim())).filter((n) => !isNaN(n));
    setTrendResult(analyzeDataTrends(nums));
  }, [dataPoints]);

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'pdf_assistant', label: 'PDF Assistant (#402)', icon: FileText },
          { id: 'extractor', label: 'Document Extractor (#403)', icon: Search },
          { id: 'comparison', label: 'Document Compare (#415)', icon: GitCompare },
          { id: 'analyst', label: 'Data Analyst (#416)', icon: BarChart3 },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-purple-600 dark:text-purple-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* 402: AI PDF Assistant */}
      {activeTab === 'pdf_assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Document / PDF Content Outline
              </h3>
              <textarea
                value={docText}
                onChange={(e) => setDocText(e.target.value)}
                rows={12}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Key Document Takeaways & Structure
              </span>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white block">
                    {docOutline.wordCount}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Word Count</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-xl font-black text-purple-600 block">
                    {docOutline.readingTimeMinutes} min
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Est. Reading Time</span>
                </div>
              </div>

              {docOutline.headings.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Identified Sections:</span>
                  <div className="space-y-1">
                    {docOutline.headings.map((h, i) => (
                      <div key={i} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold text-slate-800 dark:text-slate-200">
                        {h}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {docOutline.takeaways.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Extracted Key Insights:</span>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {docOutline.takeaways.map((t, i) => (
                      <p key={i}>• {t}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 403: Document Extractor */}
      {activeTab === 'extractor' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Unstructured Document Text
              </h3>
              <textarea
                value={entityText}
                onChange={(e) => setEntityText(e.target.value)}
                rows={12}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Named Entity Recognition (NER)
              </span>

              <div className="space-y-2 text-xs">
                {extractedEntities.organizations.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                    <span className="font-bold text-purple-600 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5" /> Organizations:
                    </span>
                    <p className="font-mono text-slate-900 dark:text-white">
                      {extractedEntities.organizations.join(', ')}
                    </p>
                  </div>
                )}

                {extractedEntities.amounts.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                    <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5" /> Financial Amounts:
                    </span>
                    <p className="font-mono text-slate-900 dark:text-white">
                      {extractedEntities.amounts.join(', ')}
                    </p>
                  </div>
                )}

                {extractedEntities.dates.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                    <span className="font-bold text-sky-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> Dates & Timestamps:
                    </span>
                    <p className="font-mono text-slate-900 dark:text-white">
                      {extractedEntities.dates.join(', ')}
                    </p>
                  </div>
                )}

                {extractedEntities.emails.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                    <span className="font-bold text-teal-600 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Addresses:
                    </span>
                    <p className="font-mono text-slate-900 dark:text-white">
                      {extractedEntities.emails.join(', ')}
                    </p>
                  </div>
                )}

                {extractedEntities.phones.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border space-y-1">
                    <span className="font-bold text-amber-600 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Numbers:
                    </span>
                    <p className="font-mono text-slate-900 dark:text-white">
                      {extractedEntities.phones.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 415: Document Comparison */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Original Document / Agreement A</h4>
              <textarea
                value={contractA}
                onChange={(e) => setContractA(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs leading-relaxed"
              />
            </div>
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Updated Document / Agreement B</h4>
              <textarea
                value={contractB}
                onChange={(e) => setContractB(e.target.value)}
                rows={6}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border font-mono text-xs leading-relaxed"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                Semantic Clause Differential
              </span>
              <span className="text-xs font-bold text-purple-600">
                {docDiff.similarityScore}% Content Similarity
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {docDiff.addedClauses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-emerald-600 uppercase text-[10px] block">
                    Added Clauses ({docDiff.addedClauses.length}):
                  </span>
                  {docDiff.addedClauses.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-400/30 text-emerald-800 dark:text-emerald-300 font-mono">
                      + {c}
                    </div>
                  ))}
                </div>
              )}

              {docDiff.removedClauses.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-bold text-rose-600 uppercase text-[10px] block">
                    Removed Clauses ({docDiff.removedClauses.length}):
                  </span>
                  {docDiff.removedClauses.map((c, i) => (
                    <div key={i} className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-400/30 text-rose-800 dark:text-rose-300 font-mono">
                      - {c}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 416: Data Analyst */}
      {activeTab === 'analyst' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Numerical Sequence Input</h3>
              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Comma-Separated Data Series
                </label>
                <textarea
                  value={dataPoints}
                  onChange={(e) => setDataPoints(e.target.value)}
                  rows={6}
                  placeholder="e.g. 10, 15, 22, 35, 48, 99"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-purple-500/30 shadow-md space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  Trend & Statistical Metrics
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                    trendResult.trend === 'Upward'
                      ? 'bg-emerald-500/10 text-emerald-600'
                      : trendResult.trend === 'Downward'
                      ? 'bg-rose-500/10 text-rose-600'
                      : 'bg-slate-500/10 text-slate-600'
                  }`}
                >
                  {trendResult.trend === 'Upward' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{trendResult.trend} Trend</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
                    {trendResult.mean}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Arithmetic Mean</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-xl font-black text-purple-600 block font-mono">
                    {trendResult.median}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Median Value</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
                    {trendResult.min}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Minimum</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-center">
                  <span className="text-xl font-black text-slate-900 dark:text-white block font-mono">
                    {trendResult.max}
                  </span>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Maximum</span>
                </div>
              </div>

              {trendResult.outliers.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-400/30 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Outlier anomaly detected: {trendResult.outliers.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
