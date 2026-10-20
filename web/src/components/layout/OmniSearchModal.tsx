import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles, Command } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { searchTools, POPULAR_TOOLS, OFFLINE_TOOL_COUNT } from '../../data/webRegistry';
import { StudioTheme } from '../../constants/tokens';

export const OmniSearchModal: React.FC = () => {
  const { isOmniSearchOpen, setOmniSearchOpen, setActiveStudio, setActiveTool } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOmniSearchOpen(!isOmniSearchOpen);
      }
      if (e.key === 'Escape' && isOmniSearchOpen) {
        setOmniSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOmniSearchOpen, setOmniSearchOpen]);

  useEffect(() => {
    if (isOmniSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOmniSearchOpen]);

  if (!isOmniSearchOpen) return null;

  const results = query.trim() ? searchTools(query).slice(0, 12) : POPULAR_TOOLS.slice(0, 8);

  const handleSelectTool = (tool: any) => {
    setActiveStudio(tool.studioId);
    setActiveTool(tool.id);
    setOmniSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectTool(results[selectedIndex]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${OFFLINE_TOOL_COUNT}+ offline tools by name, tag, or function...`}
            className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          <div className="px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {query ? `Search Results (${results.length})` : 'Popular & Frequently Used'}
          </div>

          {results.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No offline tools found matching "{query}".
            </div>
          ) : (
            results.map((tool, index) => {
              const studioTheme = StudioTheme[tool.studioId];
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={tool.id}
                  onClick={() => handleSelectTool(tool)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 shadow-xs"
                      style={{
                        backgroundColor: `${studioTheme?.accent}18`,
                        color: studioTheme?.accent,
                      }}
                    >
                      #{tool.id}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold truncate">{tool.name}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0"
                          style={{
                            backgroundColor: `${studioTheme?.accent}15`,
                            color: studioTheme?.accent,
                          }}
                        >
                          {studioTheme?.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                        {tool.description}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-indigo-600 dark:text-indigo-400 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to open</span>
            <span>ESC to close</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{OFFLINE_TOOL_COUNT}+ local offline tools</span>
          </div>
        </div>
      </div>
    </div>
  );
};
