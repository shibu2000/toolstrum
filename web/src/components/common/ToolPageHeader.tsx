import React from 'react';
import { ChevronRight, Star } from 'lucide-react';
import { ToolDefinition, StudioId } from '../../types';
import { StudioTheme } from '../../constants/tokens';
import { useAppStore } from '../../store/useAppStore';

interface ToolPageHeaderProps {
  tool: ToolDefinition;
  studioId: StudioId;
  onSelectStudio: (id: StudioId | null) => void;
}

export const ToolPageHeader: React.FC<ToolPageHeaderProps> = ({ tool, studioId, onSelectStudio }) => {
  const { favoriteToolIds, toggleFavorite } = useAppStore();
  const theme = StudioTheme[studioId];
  const isFavorite = favoriteToolIds.includes(tool.id);

  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
        <button
          onClick={() => onSelectStudio(null)}
          className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
        >
          Home
        </button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <button
          onClick={() => onSelectStudio(studioId)}
          className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 font-medium"
          style={{ color: theme.accent }}
        >
          {theme.name}
        </button>
        <ChevronRight className="w-3 h-3 shrink-0" />
        <span className="font-semibold text-slate-800 dark:text-white truncate">{tool.name}</span>
      </nav>

      <button
        onClick={() => toggleFavorite(tool.id)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 border ${
          isFavorite
            ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300'
            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600'
        }`}
      >
        <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
        <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
      </button>
    </div>
  );
};
