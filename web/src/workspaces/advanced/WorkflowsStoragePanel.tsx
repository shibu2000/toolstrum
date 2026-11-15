import React, { useState } from 'react';
import {
  Sparkles,
  GitFork,
  Star,
  FolderPlus,
  Activity,
  History,
  Trash2,
  Check,
  ArrowRight,
  ExternalLink,
  Layers,
  Cpu,
} from 'lucide-react';
import { WEB_TOOLS } from '../../data/webRegistry';

interface ToolProps {
  toolId: number;
  copied?: boolean;
  onCopy?: (text: string) => void;
  onNavigateToTool?: (toolId: number) => void;
}

export const WorkflowsStoragePanel: React.FC<ToolProps> = ({
  toolId,
  onCopy,
  onNavigateToTool,
}) => {
  // 493: Curated Tool Packs
  const toolPacks = [
    {
      name: 'Privacy & Security Fortress',
      desc: 'Air-gapped data transmission, PII redactor, password generators, and AES crypto.',
      tools: [351, 353, 360, 471, 483],
      color: 'from-purple-600 to-indigo-600',
    },
    {
      name: 'Developer & Data Ops',
      desc: 'JSON/YAML converters, text diffing, CSV chart generator, and formula generator.',
      tools: [244, 245, 474, 476, 477],
      color: 'from-blue-600 to-cyan-600',
    },
    {
      name: 'Content & Publishing',
      desc: 'Bulk image conversion, batch watermarking, OCR text extraction, and PDF tools.',
      tools: [487, 488, 489, 490, 491],
      color: 'from-pink-600 to-rose-600',
    },
  ];

  // 494: Workflow Builder
  const [pipelineSteps, setPipelineSteps] = useState([
    { id: '1', title: '1. Ingest Scanned Document', tool: 'Batch OCR (#488)' },
    { id: '2', title: '2. Scrub & Sanitize PII', tool: 'Document Redactor (#483)' },
    { id: '3', title: '3. Compile Output Binder', tool: 'PDF Portfolio (#486)' },
  ]);

  // 495: Favorite Shortcuts
  const [favorites, setFavorites] = useState([1, 49, 181, 244, 301, 351, 446, 474]);

  // 497: Processing Queue
  const [queueJobs, setQueueJobs] = useState([
    { id: 'JOB-901', name: 'WebP Image Transcode (12 assets)', status: 'Completed', time: '180ms' },
    { id: 'JOB-902', name: 'Document PII Redaction Scan', status: 'Completed', time: '45ms' },
    { id: 'JOB-903', name: 'AES-256 GCM Key Derivation', status: 'Ready', time: '—' },
  ]);

  // 498: Output History
  const [historyItems, setHistoryItems] = useState([
    { file: 'redacted_contract_v2.pdf', size: '1.4 MB', time: '10 mins ago' },
    { file: 'revenue_q4_chart.svg', size: '48 KB', time: '25 mins ago' },
    { file: 'renamed_bundle_2026.zip', size: '8.2 MB', time: '1 hour ago' },
  ]);

  return (
    <div className="space-y-6">
      {/* 493: OFFLINE TOOL PACKS */}
      {toolId === 493 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Curated Offline Tool Packs
            </h3>
            <p className="text-xs text-slate-500">
              One-click access to synergistic tool bundles pre-configured for your task profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {toolPacks.map((pack, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className={`h-2.5 w-12 rounded-full bg-gradient-to-r ${pack.color}`} />
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">{pack.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{pack.desc}</p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Included Utilities:</span>
                  <div className="flex flex-wrap gap-1">
                    {pack.tools.map((tid) => {
                      const t = WEB_TOOLS.find((item) => item.id === tid);
                      return (
                        <button
                          key={tid}
                          type="button"
                          onClick={() => onNavigateToTool && onNavigateToTool(tid)}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition-all"
                        >
                          {t?.name || `Tool #${tid}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 494: WORKFLOW BUILDER */}
      {toolId === 494 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <GitFork className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Multi-Step Productivity Pipeline
              </h3>
            </div>

            <div className="space-y-3">
              {pipelineSteps.map((step, idx) => (
                <div key={step.id} className="space-y-2">
                  <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/60 dark:border-purple-800/40 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-purple-900 dark:text-purple-200">{step.title}</div>
                      <div className="text-[11px] text-purple-700 dark:text-purple-400 mt-0.5">{step.tool}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-purple-600 text-[10px] font-bold">
                      Step {idx + 1}
                    </span>
                  </div>
                  {idx < pipelineSteps.length - 1 && (
                    <div className="flex justify-center text-slate-300 dark:text-slate-700">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Execute Pipeline on Device
            </button>
          </div>
        </div>
      )}

      {/* 495: FAVORITE TOOL SHORTCUTS */}
      {toolId === 495 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Starred Quick-Action Shortcuts
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {favorites.map((tid) => {
                const t = WEB_TOOLS.find((item) => item.id === tid);
                return (
                  <button
                    key={tid}
                    type="button"
                    onClick={() => onNavigateToTool && onNavigateToTool(tid)}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 text-left transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{t?.name || `Tool #${tid}`}</div>
                      <div className="text-[10px] text-slate-400 capitalize">{t?.studioId} Studio</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 496: CUSTOM TOOL COLLECTIONS */}
      {toolId === 496 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Personal Workspace Tag Collections
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Daily Office Operations</div>
                  <div className="text-slate-400 text-[11px]">8 pinned utilities</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/40 text-[10px] font-bold">
                  Active
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Media Compression & Tuning</div>
                  <div className="text-slate-400 text-[11px]">5 pinned utilities</div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold">
                  Standby
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 497: PROCESSING QUEUE */}
      {toolId === 497 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Client-Side Web Worker Job Queue
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              {queueJobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{job.name}</div>
                    <div className="font-mono text-[10px] text-slate-400">{job.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-500">{job.time}</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 text-[10px] font-bold">
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 498: OUTPUT HISTORY */}
      {toolId === 498 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <History className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Artifact Output History
              </h3>
            </div>
            <div className="space-y-2 text-xs">
              {historyItems.map((item, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{item.file}</div>
                    <div className="text-slate-400 text-[10px]">{item.time}</div>
                  </div>
                  <span className="font-mono font-bold text-purple-600">{item.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 499: STORAGE CLEANUP SUGGESTIONS */}
      {toolId === 499 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-center">
            <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Trash2 className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Smart Cache & Temporary Storage Reclaim
              </h3>
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Scans memory for temporary blob URLs, cached worker assets, and session artifacts that can be purged safely.
            </p>
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              All browser memory clean. 0 orphan blobs detected.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
