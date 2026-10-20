import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface OfflineBadgeProps {
  compact?: boolean;
}

export const OfflineBadge: React.FC<OfflineBadgeProps> = ({ compact }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60 shadow-xs transition-colors`}
      title="All computations run directly on your browser hardware. Zero files or data are uploaded to any server."
    >
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
      <span>{compact ? '100% Offline' : '100% Offline • Zero Server Upload'}</span>
    </div>
  );
};
