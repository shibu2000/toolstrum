import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (activeLinkRef.current && containerRef.current) {
      activeLinkRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
    // Scroll position changes after the smooth scroll settles; check now and shortly after.
    updateScrollState();
    const t = setTimeout(updateScrollState, 350);
    return () => clearTimeout(t);
  }, [activeToolId, updateScrollState]);

  useEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    if (!el) return;

    // A plain mouse wheel only emits vertical deltaY; translate that into
    // horizontal scroll so desktop/mouse users (not just trackpad/touch) can
    // scroll this bar. Trackpads already send deltaX natively and pass through.
    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('scroll', updateScrollState);
    window.addEventListener('resize', updateScrollState);
    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [tools, updateScrollState]);

  const scrollByAmount = (dir: 1 | -1) => {
    containerRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <div className="relative w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-20" />
          <button
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll tools left"
            className="hidden sm:flex items-center justify-center absolute left-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}

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

      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-20" />
          <button
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll tools right"
            className="hidden sm:flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 z-30 w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};
