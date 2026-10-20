import React, { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { OmniSearchModal } from './components/layout/OmniSearchModal';
import { StudioDashboard } from './components/studios/StudioDashboard';
import { ToolWorkspaceRouter } from './components/studios/ToolWorkspaceRouter';
import { getToolsByStudio, getToolById, STUDIOS } from './data/webRegistry';
import { StudioTheme } from './constants/tokens';
import {
  parseCurrentRoute,
  updateBrowserHistory,
  updatePageMeta,
  getToolUrl,
  getStudioUrl,
} from './utils/seo';
import { getToolSeoData, getStudioSeoData, getHomeSeoData } from './utils/seoData';

export default function App() {
  const {
    activeStudioId,
    activeToolId,
    setActiveStudio,
    setActiveTool,
    isDarkMode,
  } = useAppStore();

  // Dark mode class sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Initial URL sync and popstate listener
  useEffect(() => {
    const route = parseCurrentRoute();
    if (route.type === 'tool' && route.toolId) {
      setActiveStudio(route.studioId);
      setActiveTool(route.toolId);
    } else if (route.type === 'studio' && route.studioId) {
      setActiveStudio(route.studioId);
      setActiveTool(null);
    }

    const handlePopState = () => {
      const current = parseCurrentRoute();
      setActiveStudio(current.studioId);
      setActiveTool(current.toolId);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveStudio, setActiveTool]);

  // If a studio is active but no specific tool is active, pick first tool of studio
  const currentToolId =
    activeToolId ??
    (activeStudioId ? getToolsByStudio(activeStudioId)[0]?.id ?? 1 : 1);

  // Sync browser URL & dynamic page meta tags
  useEffect(() => {
    if (activeStudioId === null && activeToolId === null) {
      const homeData = getHomeSeoData();
      updateBrowserHistory(null, null);
      updatePageMeta(homeData.title, homeData.description, '/');
    } else if (activeToolId !== null) {
      const tool = getToolById(activeToolId);
      if (tool) {
        const studio = STUDIOS.find((s) => s.id === tool.studioId) || {
          id: tool.studioId,
          name: 'Utility Studio',
          description: '100% offline utilities',
          toolRange: '1-50',
          icon: 'Tool',
          accent: '#6366f1',
          surface: '#e0e7ff',
        };
        const seoData = getToolSeoData(tool, studio);
        updateBrowserHistory(tool.studioId, tool.id);
        updatePageMeta(seoData.title, seoData.description, getToolUrl(tool));
      }
    } else if (activeStudioId !== null) {
      const studio = STUDIOS.find((s) => s.id === activeStudioId);
      if (studio) {
        const tools = getToolsByStudio(activeStudioId);
        const seoData = getStudioSeoData(studio, tools.length);
        updateBrowserHistory(activeStudioId, null);
        updatePageMeta(seoData.title, seoData.description, getStudioUrl(activeStudioId));
      }
    }
  }, [activeStudioId, activeToolId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex w-full min-w-0">
        <Sidebar />

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 xl:p-10">
          {activeStudioId === null ? (
            <StudioDashboard />
          ) : (
            <ToolWorkspaceRouter
              studioId={activeStudioId}
              toolId={currentToolId}
              onSelectTool={(id) => setActiveTool(id)}
            />
          )}
        </main>
      </div>

      {/* Global Cmd+K Command Palette */}
      <OmniSearchModal />
    </div>
  );
}
