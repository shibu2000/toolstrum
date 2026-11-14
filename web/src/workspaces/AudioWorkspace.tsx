import React, { useState, useEffect } from 'react';
import {
  Volume2,
  ShieldCheck,
} from 'lucide-react';
import { AudioFfmpegPanel } from './audio/AudioFfmpegPanel';
import { AudioWaveformRingtonePanel } from './audio/AudioWaveformRingtonePanel';
import { AudioSpeechPanel } from './audio/AudioSpeechPanel';
import { getToolById } from '../data/webRegistry';

export interface AudioWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export type AudioWorkspaceTab =
  | 'waveform'
  | 'speech'
  | 'engine';

export const AudioWorkspace: React.FC<AudioWorkspaceProps> = ({
  toolId,
  accentColor = '#8B5CF6',
}) => {
  const getInitialTab = (id: number): AudioWorkspaceTab => {
    if (id === 147 || id === 151 || id === 131) return 'waveform';
    if (id === 139 || id === 140 || id === 141) return 'speech';
    return 'engine';
  };

  const getEngineDefaultOp = ():
    | 'compress' | 'convert' | 'trim' | 'merge' | 'crossfade' | 'split' | 'speed' | 'pitch' | 'volume' | 'normalize' | 'denoise' | 'silence' | 'channels' | 'extract' | 'metadata' | 'batch' => {
    switch (toolId) {
      case 129: return 'compress';
      case 130: return 'convert';
      case 131: return 'trim';
      case 132: return 'merge';
      case 133: return 'split';
      case 134: return 'speed';
      case 135: return 'pitch';
      case 136: return 'volume';
      case 137: return 'normalize';
      case 138: return 'denoise';
      case 142: return 'convert';
      case 143: return 'convert';
      case 144: return 'extract';
      case 145: return 'metadata';
      case 146: return 'metadata';
      case 148: return 'silence';
      case 149: return 'pitch';
      case 150: return 'channels';
      case 151: return 'trim';
      case 152: return 'batch';
      case 153: return 'crossfade';
      default: return 'convert';
    }
  };

  const [activeTab, setActiveTab] = useState<AudioWorkspaceTab>(() => getInitialTab(toolId));

  useEffect(() => {
    setActiveTab(getInitialTab(toolId));
  }, [toolId]);

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Volume2 className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Audio Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description ||
            'Audio compressor, format converter, ringtone maker, waveform editor, and speech synthesizer. 100% Offline • 100% Private.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-purple-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* Dedicated Audio Panels */}
      {activeTab === 'waveform' ? (
        <AudioWaveformRingtonePanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'speech' ? (
        <AudioSpeechPanel initialToolId={toolId} accentColor={accentColor} />
      ) : (
        <AudioFfmpegPanel defaultOp={getEngineDefaultOp()} accentColor={accentColor} />
      )}
    </div>
  );
};
