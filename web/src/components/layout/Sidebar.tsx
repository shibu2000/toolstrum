import React from 'react';
import {
  FileText,
  Image,
  Scan,
  Video,
  Volume2,
  FileSpreadsheet,
  Archive,
  Type,
  Code,
  Calculator,
  QrCode,
  Globe,
  Sparkles,
  CheckSquare,
  Eye,
  Cpu,
  Star,
  Home,
  X,
  Clock,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { STUDIOS, getToolById } from '../../data/webRegistry';
import { StudioId } from '../../types';
import { getToolUrl, getStudioUrl } from '../../utils/seo';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  FileText,
  Image,
  Scan,
  Video,
  Volume2,
  FileSpreadsheet,
  Archive,
  Type,
  Code,
  Calculator,
  QrCode,
  Globe,
  Sparkles,
  CheckSquare,
  Eye,
  Cpu,
};

export const Sidebar: React.FC = () => {
  const {
    activeStudioId,
    setActiveStudio,
    setActiveTool,
    isSidebarCollapsed,
    toggleSidebar,
    favoriteToolIds,
    recentToolIds,
  } = useAppStore();

  const handleStudioClick = (studioId: StudioId) => {
    setActiveStudio(studioId);
    setActiveTool(null);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleHomeClick = () => {
    setActiveStudio(null);
    setActiveTool(null);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleToolClick = (toolId: number, studioId: StudioId) => {
    setActiveStudio(studioId);
    setActiveTool(toolId);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {!isSidebarCollapsed && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:sticky top-16 z-30 h-[calc(100vh-4rem)] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md overflow-y-auto transition-all duration-200 ease-in-out ${
          isSidebarCollapsed
            ? '-translate-x-full lg:w-0 lg:border-r-0 lg:p-0 lg:overflow-hidden lg:opacity-0'
            : 'translate-x-0 w-72 lg:opacity-100'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between lg:hidden pb-2 border-b border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Navigation
            </span>
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Home Link */}
          <div>
            <a
              href="/"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                  e.preventDefault();
                  handleHomeClick();
                }
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                activeStudioId === null
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold shadow-2xs'
                  : 'hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300'
              }`}
            >
              <Home className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>All Studios & Dashboard</span>
            </a>
          </div>

          {/* Pinned Favorites (if any) */}
          {favoriteToolIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Quick Favorites</span>
              </div>
              <div className="space-y-0.5">
                {favoriteToolIds.slice(0, 6).map((id) => {
                  const tool = getToolById(id);
                  if (!tool) return null;
                  return (
                    <a
                      key={id}
                      href={getToolUrl(tool)}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                          e.preventDefault();
                          handleToolClick(tool.id, tool.studioId);
                        }
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span className="truncate">{tool.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{tool.id}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recently Used Tools (if any) */}
          {recentToolIds.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Clock className="w-3 h-3 text-indigo-400" />
                <span>Recently Used</span>
              </div>
              <div className="space-y-0.5">
                {recentToolIds.slice(0, 6).map((id) => {
                  const tool = getToolById(id);
                  if (!tool) return null;
                  return (
                    <a
                      key={id}
                      href={getToolUrl(tool)}
                      onClick={(e) => {
                        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                          e.preventDefault();
                          handleToolClick(tool.id, tool.studioId);
                        }
                      }}
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      <span className="truncate">{tool.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{tool.id}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Studios Directory */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Studios & Toolsets
            </div>
            <div className="space-y-1">
              {STUDIOS.map((studio) => {
                const isActive = activeStudioId === studio.id;
                const IconComponent = ICON_MAP[studio.icon] || FileText;

                return (
                  <a
                    key={studio.id}
                    href={getStudioUrl(studio.id)}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
                        e.preventDefault();
                        handleStudioClick(studio.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? 'text-slate-900 dark:text-white font-semibold shadow-xs'
                        : 'hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300'
                    }`}
                    style={{
                      backgroundColor: isActive ? `${studio.accent}15` : undefined,
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: `${studio.accent}20`,
                          color: studio.accent,
                        }}
                      >
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span className="truncate">{studio.name}</span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {studio.isComingSoon ? (
                        <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                          V2
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                          {studio.toolRange}
                        </span>
                      )}
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
