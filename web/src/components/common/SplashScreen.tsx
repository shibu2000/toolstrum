import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ToolstrumLogo } from './ToolstrumLogo';
import { OFFLINE_TOOL_COUNT } from '../../data/webRegistry';

interface SplashScreenProps {
  isFadingOut?: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isFadingOut = false }) => {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 select-none transition-all duration-500 ease-out ${
        isFadingOut ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      aria-label="Loading Toolstrum"
    >
      <style>{`
        @keyframes splashShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
        @keyframes splashPulseGlow {
          0%, 100% { opacity: 0.35; transform: scale(0.96); }
          50% { opacity: 0.75; transform: scale(1.04); }
        }
      `}</style>

      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(99,102,241,0.14),rgba(168,85,247,0.06)_40%,transparent_70%)] pointer-events-none" />

      {/* Centered Brand Content */}
      <div className="relative flex flex-col items-center text-center z-10 px-4">
        {/* Glowing Aura & Logo */}
        <div className="relative mb-6">
          <div
            className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-pink-500/30 rounded-3xl blur-xl"
            style={{ animation: 'splashPulseGlow 3s ease-in-out infinite' }}
          />
          <ToolstrumLogo size={68} variant="badge" />
        </div>

        {/* Wordmark */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white flex items-center justify-center">
          <span>Tool</span>
          <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            strum
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1.5 tracking-wide">
          {OFFLINE_TOOL_COUNT}+ Offline Private Utilities
        </p>

        {/* Shimmering Loading Progress Bar */}
        <div className="w-48 sm:w-56 h-1.5 bg-slate-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden mt-6 relative">
          <div
            className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"
            style={{ animation: 'splashShimmer 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
          />
        </div>

        {/* Status text */}
        <span className="text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 mt-3 animate-pulse">
          Loading workspace...
        </span>
      </div>

      {/* 100% Offline Privacy Badge at Bottom */}
      <div className="absolute bottom-8 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold shadow-xs">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>100% Client-Side • Zero Cloud Uploads</span>
      </div>
    </div>
  );
};
