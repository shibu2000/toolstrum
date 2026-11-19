import React, { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { OmniSearchModal } from './components/layout/OmniSearchModal';
import { StudioDashboard } from './components/studios/StudioDashboard';
import { StudioOverviewScreen } from './components/studios/StudioOverviewScreen';
import { ToolWorkspaceRouter } from './components/studios/ToolWorkspaceRouter';
import { PrivacyPolicyScreen } from './components/common/PrivacyPolicyScreen';
import { SplashScreen } from './components/common/SplashScreen';
import { getToolsByStudio, getToolById, STUDIOS } from './data/webRegistry';
import { StudioTheme } from './constants/tokens';
import {
  parseCurrentRoute,
  updateBrowserHistory,
  updatePageMeta,
  getToolUrl,
  getStudioUrl,
} from './utils/seo';
import { getToolSeoData, getStudioSeoData, getHomeSeoData, getPrivacySeoData } from './utils/seoData';

export default function App() {
  const {
    activeStudioId,
    activeToolId,
    isPrivacyPage,
    setActiveStudio,
    setActiveTool,
    setIsPrivacyPage,
    isDarkMode,
  } = useAppStore();

  const [showSplash, setShowSplash] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // Splash screen transition timer
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('splash=hold')) {
      return;
    }
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 450);

    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 950);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  // Dark mode class sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Popstate listener for back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const current = parseCurrentRoute();
      if (current.type === 'privacy') {
        setIsPrivacyPage(true);
      } else {
        setIsPrivacyPage(false);
        setActiveStudio(current.studioId);
        setActiveTool(current.toolId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setActiveStudio, setActiveTool, setIsPrivacyPage]);

  // Sync browser URL & dynamic page meta tags
  useEffect(() => {
    if (isPrivacyPage) {
      const privacyData = getPrivacySeoData();
      updateBrowserHistory(null, null, true);
      updatePageMeta(privacyData.title, privacyData.description, '/privacy');
    } else if (activeStudioId === null && activeToolId === null) {
      const homeData = getHomeSeoData();
      updateBrowserHistory(null, null, false);
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
        updateBrowserHistory(tool.studioId, tool.id, false);
        updatePageMeta(seoData.title, seoData.description, getToolUrl(tool));
      }
    } else if (activeStudioId !== null) {
      const studio = STUDIOS.find((s) => s.id === activeStudioId);
      if (studio) {
        const tools = getToolsByStudio(activeStudioId);
        const seoData = getStudioSeoData(studio, tools.length);
        updateBrowserHistory(activeStudioId, null, false);
        updatePageMeta(seoData.title, seoData.description, getStudioUrl(activeStudioId));
      }
    }
  }, [activeStudioId, activeToolId, isPrivacyPage]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header />

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex w-full min-w-0">
        <Sidebar />

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 xl:p-10">
            {isPrivacyPage ? (
              <PrivacyPolicyScreen />
            ) : activeStudioId === null ? (
              <StudioDashboard />
            ) : activeToolId === null ? (
              <StudioOverviewScreen
                studioId={activeStudioId}
                onSelectTool={(id) => setActiveTool(id)}
                onSelectStudio={(id) => {
                  setActiveStudio(id);
                  setActiveTool(null);
                }}
              />
            ) : (
              <ToolWorkspaceRouter
                studioId={activeStudioId}
                toolId={activeToolId}
                onSelectTool={(id) => setActiveTool(id)}
              />
            )}
          </div>

          <Footer />
        </main>
      </div>

      {/* Global Cmd+K Command Palette */}
      <OmniSearchModal />

      {/* Loading Splash Screen */}
      {showSplash && <SplashScreen isFadingOut={isFadingOut} />}
    </div>
  );
}
