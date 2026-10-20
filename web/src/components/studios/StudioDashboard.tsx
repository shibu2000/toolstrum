import React from 'react';
import {
  FileText,
  Image,
  Scan,
  Video,
  Volume2,
  FileSpreadsheet,
  Archive,
  Type,
  Code,
  Calculator,
  QrCode,
  Globe,
  Sparkles,
  CheckSquare,
  Eye,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { STUDIOS, POPULAR_TOOLS, OFFLINE_TOOL_COUNT } from '../../data/webRegistry';
import { StudioId } from '../../types';
import { getToolUrl, getStudioUrl } from '../../utils/seo';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Image,
  Scan,
  Video,
  Volume2,
  FileSpreadsheet,
  Archive,
  Type,
  Code,
  Calculator,
  QrCode,
  Globe,
  Sparkles,
  CheckSquare,
  Eye,
  Cpu,
};

export const StudioDashboard: React.FC = () => {
  const { setActiveStudio, setActiveTool, setOmniSearchOpen } = useAppStore();

  const handleOpenStudio = (studioId: StudioId) => {
    setActiveStudio(studioId);
  };

  const handleLaunchTool = (toolId: number, studioId: StudioId) => {
    setActiveStudio(studioId);
    setActiveTool(toolId);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#483EE5] via-[#625BFF] to-[#9C48EA] text-white p-6 sm:p-10 shadow-xl shadow-indigo-500/15">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium border border-white/20">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>100% Offline • 100% Secure • Instant Processing</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Your Everyday Toolkit
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 max-w-xl leading-relaxed">
            {OFFLINE_TOOL_COUNT}+ tools in one unified, offline workspace. Convert PDFs, edit images, format code, calculate loans, and generate QR codes privately on your device.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setOmniSearchOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-50 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Explore All {OFFLINE_TOOL_COUNT}+ Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleLaunchTool(1, 'pdf')}
              className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md font-medium text-xs sm:text-sm text-white border border-white/20 transition-all cursor-pointer"
            >
              Open PDF Studio
            </button>
          </div>
        </div>

        {/* Feature Badges in Hero */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-indigo-100 font-medium">Sub-millisecond Local Execution</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-300 shrink-0" />
            <span className="text-indigo-100 font-medium">100% Offline & 100% Secure</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-cyan-300 shrink-0" />
            <span className="text-indigo-100 font-medium">No Login or Sign-up Needed</span>
          </div>
        </div>
      </div>

      {/* Popular Tools Quick Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Popular Tools</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Frequently accessed tools for fast daily workflows
            </p>
          </div>
          <button
            onClick={() => setOmniSearchOpen(true)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5">
          {POPULAR_TOOLS.slice(0, 12).map((tool) => (
            <a
              key={tool.id}
              href={getToolUrl(tool)}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleLaunchTool(tool.id, tool.studioId);
                }
              }}
              className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2.5 block"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  #{tool.id}
                </span>
                <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                  Offline
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                  {tool.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                  {tool.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Studios Directory Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Studio Directory</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select a specialized studio to access its full suite of tools
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
          {STUDIOS.map((studio) => {
            const IconComponent = ICON_MAP[studio.icon] || FileText;

            return (
              <a
                key={studio.id}
                href={getStudioUrl(studio.id)}
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                    e.preventDefault();
                    handleOpenStudio(studio.id);
                  }
                }}
                className="group relative p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-lg transition-all duration-200 cursor-pointer space-y-3 block"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105"
                    style={{
                      backgroundColor: `${studio.accent}18`,
                      color: studio.accent,
                    }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {studio.isComingSoon ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                        Coming in V2
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-medium text-slate-400 dark:text-slate-500">
                        Tools {studio.toolRange}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {studio.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {studio.description}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors border-t border-slate-100 dark:border-slate-800/80">
                  <span>Enter Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Comparison: Why 100% Offline Matters for Privacy & Speed */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Why Toolstrum? 100% Offline vs Traditional Cloud Tools
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Compare how Toolstrum protects your privacy and accelerates daily workflows.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
                <th className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">Feature</th>
                <th className="p-3.5 font-bold text-indigo-600 dark:text-indigo-400">Toolstrum (Offline)</th>
                <th className="p-3.5 font-medium text-slate-500 dark:text-slate-400">Typical Cloud Utilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr>
                <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">Data & File Privacy</td>
                <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">100% Offline (Zero Uploads)</td>
                <td className="p-3.5 text-slate-500">Uploaded to third-party cloud servers</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">Execution Speed</td>
                <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">Sub-millisecond local CPU</td>
                <td className="p-3.5 text-slate-500">Slowed by upload/download queues</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">Offline Availability</td>
                <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">Works with zero internet connection</td>
                <td className="p-3.5 text-slate-500">Fails without active internet connection</td>
              </tr>
              <tr>
                <td className="p-3.5 font-medium text-slate-800 dark:text-slate-200">Pricing & Restrictions</td>
                <td className="p-3.5 text-emerald-600 dark:text-emerald-400 font-semibold">100% Free Forever (No limits)</td>
                <td className="p-3.5 text-slate-500">Tiered paywalls, subscriptions & quotas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
