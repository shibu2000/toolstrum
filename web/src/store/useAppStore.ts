import { create } from 'zustand';
import { StudioId, ManagedFile } from '../types';

interface AppState {
  activeStudioId: StudioId | null;
  activeToolId: number | null;
  searchQuery: string;
  isOmniSearchOpen: boolean;
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  favoriteToolIds: number[];
  recentToolIds: number[];
  processedFiles: ManagedFile[];

  // Actions
  setActiveStudio: (id: StudioId | null) => void;
  setActiveTool: (id: number | null) => void;
  setSearchQuery: (q: string) => void;
  setOmniSearchOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  toggleFavorite: (toolId: number) => void;
  addRecentTool: (toolId: number) => void;
  addProcessedFile: (file: ManagedFile) => void;
  clearHistory: () => void;
}

const FAVORITES_STORAGE_KEY = 'toolstrum_favorites_v1';
const RECENTS_STORAGE_KEY = 'toolstrum_recents_v1';
const THEME_STORAGE_KEY = 'toolstrum_theme_v1';

const getInitialFavorites = (): number[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [1, 4, 49, 205, 244, 301, 351, 446];
  } catch {
    return [1, 4, 49, 205, 244, 301, 351, 446];
  }
};

const getInitialRecents = (): number[] => {
  try {
    const raw = localStorage.getItem(RECENTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getInitialTheme = (): boolean => {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) return raw === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  } catch {
    return false;
  }
};

const getInitialSidebarCollapsed = (): boolean => {
  try {
    // Below the lg breakpoint (1024px) the sidebar renders as a full-screen
    // overlay drawer, so it must start closed on phones/tablets.
    return window.innerWidth < 1024;
  } catch {
    return false;
  }
};

export const useAppStore = create<AppState>((set, get) => ({
  activeStudioId: null,
  activeToolId: null,
  searchQuery: '',
  isOmniSearchOpen: false,
  isSidebarCollapsed: getInitialSidebarCollapsed(),
  isDarkMode: getInitialTheme(),
  favoriteToolIds: getInitialFavorites(),
  recentToolIds: getInitialRecents(),
  processedFiles: [],

  setActiveStudio: (id) => set({ activeStudioId: id }),
  
  setActiveTool: (id) => {
    set({ activeToolId: id });
    if (id !== null) {
      get().addRecentTool(id);
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),
  
  setOmniSearchOpen: (open) => set({ isOmniSearchOpen: open }),

  toggleSidebar: () => set((s) => ({ isSidebarCollapsed: !s.isSidebarCollapsed })),

  toggleDarkMode: () => {
    const next = !get().isDarkMode;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? 'dark' : 'light');
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
    set({ isDarkMode: next });
  },

  toggleFavorite: (toolId) => {
    const current = get().favoriteToolIds;
    const exists = current.includes(toolId);
    const updated = exists ? current.filter((id) => id !== toolId) : [toolId, ...current];
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ favoriteToolIds: updated });
  },

  addRecentTool: (toolId) => {
    const current = get().recentToolIds;
    const filtered = current.filter((id) => id !== toolId);
    const updated = [toolId, ...filtered].slice(0, 20);
    try {
      localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
    set({ recentToolIds: updated });
  },

  addProcessedFile: (file) => set((s) => ({ processedFiles: [file, ...s.processedFiles].slice(0, 50) })),

  clearHistory: () => {
    try {
      localStorage.removeItem(RECENTS_STORAGE_KEY);
    } catch {}
    set({ recentToolIds: [], processedFiles: [] });
  },
}));
