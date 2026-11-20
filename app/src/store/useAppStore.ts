import { create } from 'zustand';
import { Alert } from 'react-native';
import { ManagedFile, RecentItem } from '../data/types';
import { saveToDeviceStorage } from '../services/deviceStorage';

interface AppState {
  favorites: number[];
  recentItems: RecentItem[];
  managedFiles: ManagedFile[];
  searchQuery: string;
  selectedStudioFilter: string;

  toggleFavorite: (toolId: number) => void;
  isFavorite: (toolId: number) => boolean;
  addRecentItem: (item: {
    id?: string;
    toolId: number;
    title?: string;
    subtitle?: string;
    toolName?: string;
    studioId?: string;
    summary?: string;
    timestamp?: number;
  }) => void;
  clearRecentItems: () => void;
  addManagedFile: (file: Omit<ManagedFile, 'id' | 'size' | 'createdAt'> & { id?: string; size?: number; sizeBytes?: number; createdAt?: number }) => void;
  removeManagedFile: (id: string) => void;
  clearAllManagedFiles: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedStudioFilter: (studioId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  favorites: [],
  recentItems: [],
  managedFiles: [],
  searchQuery: '',
  selectedStudioFilter: 'all',

  toggleFavorite: (toolId: number) => {
    set((state) => {
      const exists = state.favorites.includes(toolId);
      return {
        favorites: exists
          ? state.favorites.filter((id) => id !== toolId)
          : [...state.favorites, toolId],
      };
    });
  },

  isFavorite: (toolId: number) => {
    return get().favorites.includes(toolId);
  },

  addRecentItem: (item) => {
    const toolId = item.toolId;
    const title = item.title || item.toolName || `Tool #${toolId}`;
    const subtitle = item.subtitle || item.summary || 'Recent activity';
    set((state) => {
      const filtered = state.recentItems.filter((i) => i.toolId !== toolId || i.title !== title);
      const newItem: RecentItem = {
        id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        toolId,
        title,
        subtitle,
        timestamp: Date.now(),
      };
      return {
        recentItems: [newItem, ...filtered].slice(0, 30),
      };
    });
  },

  clearRecentItems: () => {
    set({ recentItems: [] });
  },

  addManagedFile: (file) => {
    const calculatedSize = file.size ?? file.sizeBytes ?? 0;
    const finalFile: ManagedFile = {
      id: file.id || `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: file.name,
      uri: file.uri,
      size: calculatedSize,
      sizeBytes: calculatedSize,
      toolId: file.toolId ?? file.toolOriginId ?? 0,
      toolName: file.toolName ?? 'Utility Output',
      mimeType: file.mimeType,
      createdAt: file.createdAt || Date.now(),
      deviceSaveStatus: 'pending',
    };
    set((state) => ({
      managedFiles: [finalFile, ...state.managedFiles],
    }));

    saveToDeviceStorage({
      sourceUri: finalFile.uri,
      fileName: finalFile.name,
      mimeType: finalFile.mimeType,
    })
      .then((result) => {
        set((state) => ({
          managedFiles: state.managedFiles.map((f) =>
            f.id === finalFile.id
              ? {
                  ...f,
                  deviceSaveStatus: result.success ? 'saved' : 'failed',
                  devicePublicUri: result.publicUri,
                  deviceSaveMessage: result.message,
                }
              : f
          ),
        }));
        if (!result.success) {
          Alert.alert('Not Saved to Device Storage', result.message);
        }
      })
      .catch((err: any) => {
        set((state) => ({
          managedFiles: state.managedFiles.map((f) =>
            f.id === finalFile.id
              ? { ...f, deviceSaveStatus: 'failed', deviceSaveMessage: err?.message }
              : f
          ),
        }));
      });
  },

  removeManagedFile: (id) => {
    set((state) => ({
      managedFiles: state.managedFiles.filter((f) => f.id !== id),
    }));
  },

  clearAllManagedFiles: () => {
    set({ managedFiles: [] });
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setSelectedStudioFilter: (studioId) => {
    set({ selectedStudioFilter: studioId });
  },
}));
