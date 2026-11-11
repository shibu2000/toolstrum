import React, { useMemo, useState } from 'react';
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
  Search,
  Star,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { StudioId, ToolDefinition } from '../../types';
import { STUDIOS, getToolsByStudio } from '../../data/webRegistry';
import { getStudioUrl, getToolUrl } from '../../utils/seo';
import { useAppStore } from '../../store/useAppStore';

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

interface StudioOverviewScreenProps {
  studioId: StudioId;
  onSelectTool: (id: number) => void;
  onSelectStudio: (id: StudioId | null) => void;
}

export const StudioOverviewScreen: React.FC<StudioOverviewScreenProps> = ({
  studioId,
  onSelectTool,
  onSelectStudio,
}) => {
  const [query, setQuery] = useState('');
  const { favoriteToolIds, toggleFavorite } = useAppStore();

  const studio = STUDIOS.find((s) => s.id === studioId);
  const tools = useMemo(() => getToolsByStudio(studioId), [studioId]);

  const availableCount = useMemo(() => tools.filter((t) => t.status === 'available').length, [tools]);
  const comingSoonCount = tools.length - availableCount;

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tools;
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        String(t.id).includes(q)
    );
  }, [tools, query]);

  if (!studio) return null;
  const IconComponent = ICON_MAP[studio.icon] || FileText;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <button
          onClick={() => onSelectStudio(null)}
          className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
        >
          Home
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="font-semibold text-slate-800 dark:text-white">{studio.name}</span>
      </nav>

      {/* Studio Header */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800"
        style={{ backgroundColor: `${studio.accent}0D` }}
      >
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
            style={{ backgroundColor: `${studio.accent}22`, color: studio.accent }}
          >
            <IconComponent className="w-7 h-7" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {studio.name}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              {studio.description}
            </p>
          </div>
        </div>

        {/* Visible tool-count readout */}
        <div className="mt-6 flex flex-wrap items-center gap-2.5">
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ backgroundColor: `${studio.accent}22`, color: studio.accent }}
          >
            {tools.length} tool{tools.length === 1 ? '' : 's'} total
          </span>
          {availableCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {availableCount} available now
            </span>
          )}
          {comingSoonCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
              <Clock className="w-3 h-3" /> {comingSoonCount} coming soon
            </span>
          )}
        </div>
      </div>

      {/* Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Filter ${tools.length} tools in ${studio.name}...`}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-offset-0"
          style={{ ['--tw-ring-color' as any]: studio.accent }}
        />
      </div>

      {/* Tool Grid */}
      {filteredTools.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">
          No tools match "{query}".
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              accent={studio.accent}
              isFavorite={favoriteToolIds.includes(tool.id)}
              onToggleFavorite={() => toggleFavorite(tool.id)}
              onOpen={() => onSelectTool(tool.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ToolCard: React.FC<{
  tool: ToolDefinition;
  accent: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onOpen: () => void;
}> = ({ tool, accent, isFavorite, onToggleFavorite, onOpen }) => {
  const isComingSoon = tool.status !== 'available';

  return (
    <a
      href={getToolUrl(tool)}
      onClick={(e) => {
        if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
          e.preventDefault();
          onOpen();
        }
      }}
      className={`group relative flex flex-col gap-2 p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
        isComingSoon
          ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-75 hover:opacity-100'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
          #{tool.id}
        </span>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="shrink-0 p-1 -m-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
        </button>
      </div>

      <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
        {tool.name}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
        {tool.description}
      </p>

      <div className="pt-2 mt-auto flex items-center justify-between text-[11px] font-semibold border-t border-slate-100 dark:border-slate-800/80">
        {isComingSoon ? (
          <span className="text-amber-600 dark:text-amber-400">Coming Soon</span>
        ) : (
          <span style={{ color: accent }}>Open tool →</span>
        )}
      </div>
    </a>
  );
};
