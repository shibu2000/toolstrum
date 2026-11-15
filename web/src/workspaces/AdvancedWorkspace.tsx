import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { useAppStore } from '../store/useAppStore';

import { TransferNetworkPanel } from './advanced/TransferNetworkPanel';
import { DataFormulasDiffPanel } from './advanced/DataFormulasDiffPanel';
import { FileIntelligencePanel } from './advanced/FileIntelligencePanel';
import { BatchAutomationPanel } from './advanced/BatchAutomationPanel';
import { WorkflowsStoragePanel } from './advanced/WorkflowsStoragePanel';

interface AdvancedWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const AdvancedWorkspace: React.FC<AdvancedWorkspaceProps> = ({
  toolId,
  accentColor = '#9333EA',
}) => {
  const currentToolDef = getToolById(toolId);
  const [copied, setCopied] = useState<boolean>(false);
  const setActiveTool = useAppStore((state) => state.setActiveTool);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNavigateToTool = (id: number) => {
    setActiveTool(id);
  };

  const renderToolContent = () => {
    // 1. Peer-to-Peer Transfer & Network (471, 472, 473, 500)
    if ([471, 472, 473, 500].includes(toolId)) {
      return (
        <TransferNetworkPanel
          toolId={toolId}
          copied={copied}
          onCopy={handleCopy}
          onNavigateToTool={handleNavigateToTool}
        />
      );
    }

    // 2. Advanced Data, Diff & Formulas (474, 475, 476, 477, 478, 479)
    if (toolId >= 474 && toolId <= 479) {
      return (
        <DataFormulasDiffPanel
          toolId={toolId}
          copied={copied}
          onCopy={handleCopy}
        />
      );
    }

    // 3. File Intelligence & Document Ops (480, 481, 482, 483, 484, 485, 486)
    if (toolId >= 480 && toolId <= 486) {
      return (
        <FileIntelligencePanel
          toolId={toolId}
          copied={copied}
          onCopy={handleCopy}
        />
      );
    }

    // 4. Batch Processing & Optimization (487, 488, 489, 490, 491, 492)
    if (toolId >= 487 && toolId <= 492) {
      return (
        <BatchAutomationPanel
          toolId={toolId}
          copied={copied}
          onCopy={handleCopy}
        />
      );
    }

    // 5. Workflows, Shortcuts & Storage (493, 494, 495, 496, 497, 498, 499)
    if (toolId >= 493 && toolId <= 499) {
      return (
        <WorkflowsStoragePanel
          toolId={toolId}
          copied={copied}
          onCopy={handleCopy}
          onNavigateToTool={handleNavigateToTool}
        />
      );
    }

    return (
      <div className="p-8 text-center text-slate-500">
        Select an advanced or experimental tool from the sidebar.
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Cpu className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentToolDef?.name || 'Advanced & Experimental Studio'}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-[11px] font-medium self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
            <span>100% Offline • Zero Server Uploads</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'Air-gapped QR streaming, formula generators, document classifiers, PII redactors, and offline automation pipelines.'}
        </p>
      </div>

      {/* Render Distinct Tool Component */}
      {renderToolContent()}
    </div>
  );
};
