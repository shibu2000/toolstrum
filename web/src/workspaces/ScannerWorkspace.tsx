import React, { useState, useEffect } from 'react';
import {
  Scan,
  ShieldCheck,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';
import { ScannerCapturePanel } from './scanner/ScannerCapturePanel';
import { PerspectiveDewarpPanel } from './scanner/PerspectiveDewarpPanel';
import { ScannerEnhancePanel } from './scanner/ScannerEnhancePanel';
import { ScannerOcrPanel } from './scanner/ScannerOcrPanel';
import { ScannerExportPanel } from './scanner/ScannerExportPanel';

export interface ScannerWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export type ScannerStudioMode =
  | 'dewarp'
  | 'capture'
  | 'enhance'
  | 'ocr'
  | 'export';

export const ScannerWorkspace: React.FC<ScannerWorkspaceProps> = ({
  toolId,
  accentColor = '#06B6D4',
}) => {
  // Determine mode based on toolId:
  const getInitialMode = (id: number): ScannerStudioMode => {
    if (id === 87) return 'dewarp';
    if (id === 86 || id === 88 || id === 90 || id === 91) return 'capture';
    if (id === 89 || id === 99) return 'enhance';
    if (id >= 92 && id <= 95) return 'ocr';
    if (id >= 96 && id <= 102) return 'export';
    return 'capture';
  };

  const [activeTab, setActiveTab] = useState<ScannerStudioMode>(() => getInitialMode(toolId));

  useEffect(() => {
    setActiveTab(getInitialMode(toolId));
  }, [toolId]);

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Scan className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Document Scanner Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'Digitize paper documents, receipts, business cards, and IDs with perspective dewarping. 100% Offline • 100% Private.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-cyan-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* Dedicated Scanner Panels */}
      {activeTab === 'dewarp' ? (
        <PerspectiveDewarpPanel accentColor={accentColor} />
      ) : activeTab === 'capture' ? (
        <ScannerCapturePanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'enhance' ? (
        <ScannerEnhancePanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'ocr' ? (
        <ScannerOcrPanel initialToolId={toolId} accentColor={accentColor} />
      ) : (
        <ScannerExportPanel initialToolId={toolId} accentColor={accentColor} />
      )}
    </div>
  );
};
