import React from 'react';
import { Search, Moon, Sun, Menu, FolderArchive, Sparkles } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { OfflineBadge } from '../common/OfflineBadge';
import { ToolstrumLogo } from '../common/ToolstrumLogo';
import { OFFLINE_TOOL_COUNT } from '../../data/webRegistry';

export const Header: React.FC = () => {
  const {
    isDarkMode,
    toggleDarkMode,
    setOmniSearchOpen,
    toggleSidebar,
    setActiveStudio,
    setActiveTool,
  } = useAppStore();

  const handleHomeClick = () => {
    setActiveStudio(null);
    setActiveTool(null);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 w-full gap-3">
        {/* Left: Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
            title="Toggle Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <a
            href="/"
            onClick={(e) => {
              if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                e.preventDefault();
                handleHomeClick();
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group text-inherit no-underline"
          >
            <ToolstrumLogo size={38} variant="badge" />
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Toolstrum
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Web v1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-none mt-0.5">
                {OFFLINE_TOOL_COUNT}+ Offline Tools
              </p>
            </div>
          </a>
        </div>

        {/* Center: Omni-Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <button
            onClick={() => setOmniSearchOpen(true)}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer group shadow-2xs"
          >
            <div className="flex items-center gap-2.5 truncate">
              <Search className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
              <span className="truncate">Search {OFFLINE_TOOL_COUNT}+ offline tools...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-600 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Offline Shield & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden md:block">
            <OfflineBadge />
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
