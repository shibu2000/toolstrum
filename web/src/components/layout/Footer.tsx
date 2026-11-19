import React from 'react';
import { ShieldCheck, Lock, ArrowUpRight } from 'lucide-react';
import { ToolstrumLogo } from '../common/ToolstrumLogo';
import { useAppStore } from '../../store/useAppStore';
import { STUDIOS, OFFLINE_TOOL_COUNT } from '../../data/webRegistry';
import { StudioId } from '../../types';
import { getStudioUrl } from '../../utils/seo';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

export const Footer: React.FC = () => {
  const { setActiveStudio, setActiveTool, setIsPrivacyPage } = useAppStore();

  const handleHomeClick = (e: React.MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      setActiveStudio(null);
      setActiveTool(null);
      setIsPrivacyPage(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStudioClick = (e: React.MouseEvent, studioId: StudioId) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      setActiveStudio(studioId);
      setActiveTool(null);
      setIsPrivacyPage(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrivacyClick = (e: React.MouseEvent) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      setIsPrivacyPage(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <a
              href="/"
              onClick={handleHomeClick}
              className="inline-flex items-center gap-2.5 text-inherit no-underline group cursor-pointer"
            >
              <ToolstrumLogo size={36} variant="badge" />
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  Toolstrum
                </span>
                <span className="text-[10px] font-semibold ml-2 px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  Web v1.0
                </span>
              </div>
            </a>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              The privacy-first, all-in-one offline utility platform. Over {OFFLINE_TOOL_COUNT}+ powerful everyday tools running 100% locally on your computer via WebAssembly, Web Workers, and HTML5 Canvas. Zero cloud uploads, zero telemetry, no subscriptions.
            </p>

            <div className="flex items-center gap-3 pt-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 text-[11px] font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Client-Side Privacy</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Air-Gapped Ready</span>
              </div>
            </div>
          </div>

          {/* Popular Studios Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Popular Studios
            </h4>
            <ul className="space-y-2 text-xs">
              {STUDIOS.slice(0, 6).map((studio) => (
                <li key={studio.id}>
                  <a
                    href={getStudioUrl(studio.id)}
                    onClick={(e) => handleStudioClick(e, studio.id)}
                    className="text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                  >
                    {studio.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy & Legal Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Trust & Transparency
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="/privacy"
                  onClick={handlePrivacyClick}
                  className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/shibu2000/toolstrum"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>GitHub Repository</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/shibu2000/toolstrum/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  <span>MIT License</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Zero Telemetry Architecture
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 Toolstrum. 100% Free & Open-Source. Built for absolute privacy.</p>
          <div className="flex items-center gap-4">
            <a
              href="/privacy"
              onClick={handlePrivacyClick}
              className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </a>
            <span>•</span>
            <a
              href="https://github.com/shibu2000/toolstrum"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Source Code
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
