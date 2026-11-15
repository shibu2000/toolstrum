import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Check,
  Copy,
  Zap,
} from 'lucide-react';
import { WEB_TOOLS } from '../../data/webRegistry';
import { useAppStore } from '../../store/useAppStore';
import { routePromptToTool, ToolRouteMatch } from './aiHelpers';

interface AiAssistantRouterPanelProps {
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const AiAssistantRouterPanel: React.FC<AiAssistantRouterPanelProps> = ({
  copied = false,
  onCopy,
}) => {
  const { setActiveStudio, setActiveTool } = useAppStore();
  const [prompt, setPrompt] = useState('I need to merge multiple PDF files into one and compress it');
  const [matches, setMatches] = useState<ToolRouteMatch[]>([]);

  const samplePrompts = [
    'I want to generate a Wi-Fi QR code for guests',
    'Calculate monthly mortgage payment for a 30-year loan',
    'Extract all hyperlinks from an HTML page',
    'Strip GPS and EXIF metadata from photo',
    'Format and validate JSON payload',
    'Generate RFC 6238 TOTP two-factor authentication code',
  ];

  useEffect(() => {
    if (!prompt.trim()) {
      setMatches([]);
      return;
    }
    setMatches(routePromptToTool(prompt, WEB_TOOLS));
  }, [prompt]);

  const handleOpenTool = (studioId: any, toolId: number) => {
    setActiveStudio(studioId);
    setActiveTool(toolId);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Sparkles className="w-4 h-4" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            AI Smart Tool Router & Utility Assistant (Tools #401, #414)
          </h3>
        </div>

        <p className="text-xs text-slate-500">
          Describe any task or problem in natural language. Our on-device intent classifier maps your prompt to the exact offline utility across all 500 catalog tools.
        </p>

        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to do (e.g. 'compress my video', 'check subnet mask')..."
            className="w-full p-3.5 pl-11 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold focus:ring-2 focus:ring-purple-500/20"
          />
          <Search className="w-4 h-4 absolute left-4 top-4 text-slate-400" />
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-400 block mb-1.5">
            Quick Try Queries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(p)}
                className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium cursor-pointer transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ranked Tool Suggestions */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            Top Matched Offline Utilities ({matches.length})
          </span>
          <span className="text-slate-400">100% Offline Client-Side Inference</span>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match, i) => (
              <div
                key={match.tool.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] uppercase font-bold text-purple-600 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                      Match Rank #{i + 1} • {match.score} pts
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                      Tool #{match.tool.id}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {match.tool.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {match.tool.description}
                    </p>
                  </div>

                  {match.matchedKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {match.matchedKeywords.map((kw, k) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold"
                        >
                          ✓ {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleOpenTool(match.tool.studioId, match.tool.id)}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <span>Launch Tool #{match.tool.id}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            No matching offline utilities found for this query. Try rephrasing with key action words like "pdf", "image", "calculate", or "password".
          </div>
        )}
      </div>
    </div>
  );
};
