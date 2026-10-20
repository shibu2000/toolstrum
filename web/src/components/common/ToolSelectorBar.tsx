import React, { useRef, useEffect } from 'react';
import { ToolDefinition } from '../../types';
import { getToolUrl } from '../../utils/seo';

interface ToolSelectorBarProps {
  tools: ToolDefinition[];
  activeToolId: number;
  onSelectTool: (id: number) => void;
  accentColor?: string;
}

export const ToolSelectorBar: React.FC<ToolSelectorBarProps> = ({
  tools,
  activeToolId,
  onSelectTool,
  accentColor = '#625BFF',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (activeLinkRef.current && containerRef.current) {
      activeLinkRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeToolId]);

  return (
    <div className="relative w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
      <div
        ref={containerRef}
        className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tools.map((tool) => {
          const isActive = tool.id === activeToolId;
          return (
            <a
              key={tool.id}
              ref={isActive ? activeLinkRef : null}
              href={getToolUrl(tool)}
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  onSelectTool(tool.id);
                }
              }}
              className={`shrink-0 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
              }`}
              style={{
                backgroundColor: isActive ? accentColor : undefined,
              }}
            >
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-black/20 text-white'
                    : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                }`}
              >
                #{tool.id}
              </span>
              <span>{tool.name}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
};
