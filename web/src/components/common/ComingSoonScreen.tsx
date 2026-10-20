import React from 'react';
import { Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';
import { ToolDefinition } from '../../types';

const STATUS_COPY: Record<string, { label: string; detail: string }> = {
  coming_soon: {
    label: 'Coming Soon',
    detail: 'This utility is on our roadmap and is not yet active in this release.',
  },
  requires_permission: {
    label: 'Requires Permission',
    detail: 'This utility needs a browser permission (camera, microphone, or storage) to run.',
  },
  requires_network: {
    label: 'Requires Network',
    detail: 'This utility needs an internet connection for part of its processing.',
  },
  requires_resource_download: {
    label: 'Requires Resource Download',
    detail: 'This utility needs an additional one-time download before it can run.',
  },
  unsupported_on_device: {
    label: 'Unsupported on This Device',
    detail: "This utility isn't supported by your current browser or device.",
  },
  temporarily_unavailable: {
    label: 'Temporarily Unavailable',
    detail: 'This utility is temporarily disabled while we fix an issue.',
  },
};

interface ComingSoonScreenProps {
  tool: ToolDefinition;
  accentColor: string;
  onBack?: () => void;
}

export const ComingSoonScreen: React.FC<ComingSoonScreenProps> = ({ tool, accentColor, onBack }) => {
  const copy = STATUS_COPY[tool.status] || STATUS_COPY.coming_soon;
  const isAi = tool.studioId === 'ai';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div
        className="p-8 rounded-3xl text-white space-y-3"
        style={{ background: `linear-gradient(135deg, ${accentColor}, #1E1B4B)` }}
      >
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          {copy.label}
        </span>
        <h2 className="text-2xl font-extrabold">{tool.name}</h2>
        <p className="text-sm text-white/80 leading-relaxed">{tool.description}</p>
      </div>

      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-sm text-slate-700 dark:text-slate-300">
          <p className="font-semibold text-slate-900 dark:text-white">{copy.detail}</p>
          {isAi && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              AI Studio ships with zero active AI interactions, generation actions, or API calls in this release.
              No data from this tool is sent anywhere — there is simply nothing running yet.
            </p>
          )}
        </div>
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to catalog
        </button>
      )}
    </div>
  );
};
