import React, { useState } from 'react';
import {
  Smartphone,
  ShieldCheck,
} from 'lucide-react';
import { getToolById } from '../data/webRegistry';

import { VisionA11yPanel } from './accessibility/VisionA11yPanel';
import { SpeechAudioPanel } from './accessibility/SpeechAudioPanel';
import { DeviceSystemPanel } from './accessibility/DeviceSystemPanel';

interface AccessibilityWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const AccessibilityWorkspace: React.FC<AccessibilityWorkspaceProps> = ({
  toolId,
  accentColor = '#6366F1',
}) => {
  const currentToolDef = getToolById(toolId);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderToolContent = () => {
    // 1. Vision & Visual Accessibility Tools (451–456)
    if (toolId >= 451 && toolId <= 456) {
      return <VisionA11yPanel toolId={toolId} copied={copied} onCopy={handleCopy} />;
    }

    // 2. Speech, Audio & Hearing Tools (457–463)
    if (toolId >= 457 && toolId <= 463) {
      return <SpeechAudioPanel toolId={toolId} copied={copied} onCopy={handleCopy} />;
    }

    // 3. Device & System Utilities (464–470)
    if (toolId >= 464 && toolId <= 470) {
      return <DeviceSystemPanel toolId={toolId} copied={copied} onCopy={handleCopy} />;
    }

    return (
      <div className="p-8 text-center text-slate-500">
        Select an accessibility or device tool from the sidebar.
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Smartphone className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentToolDef?.name || 'Accessibility & Device Studio'}
            </h2>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[11px] font-medium self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
            <span>100% Offline • Zero Server Uploads</span>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'Magnifiers, speech readers, color contrast calculators, sound meters, and device hardware telemetry. 100% on-device.'}
        </p>
      </div>

      {/* Render Dedicated Tool Component */}
      {renderToolContent()}
    </div>
  );
};
