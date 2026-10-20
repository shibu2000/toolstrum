import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Lock,
  HelpCircle,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  Share2,
  Check,
} from 'lucide-react';
import { ToolDefinition, StudioId } from '../../types';
import { STUDIOS, getToolsByStudio } from '../../data/webRegistry';
import { getToolSeoData } from '../../utils/seoData';
import { getToolUrl, getStudioUrl } from '../../utils/seo';

interface ToolSeoSectionProps {
  tool: ToolDefinition;
  studioId: StudioId;
  onSelectTool: (id: number) => void;
  onSelectStudio: (id: StudioId) => void;
}

export const ToolSeoSection: React.FC<ToolSeoSectionProps> = ({
  tool,
  studioId,
  onSelectTool,
  onSelectStudio,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedLink, setCopiedLink] = useState(false);

  const studio =
    STUDIOS.find((s) => s.id === studioId) || {
      id: studioId,
      name: 'Utility Studio',
      description: '100% offline utilities',
      toolRange: '1-50',
      icon: 'Tool',
      accent: '#6366f1',
      surface: '#e0e7ff',
    };

  const seoData = getToolSeoData(tool, studio);
  const allStudioTools = getToolsByStudio(studioId);
  const relatedTools = allStudioTools.filter((t) => t.id !== tool.id).slice(0, 6);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleToolLinkClick = (e: React.MouseEvent, targetToolId: number) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      onSelectTool(targetToolId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStudioLinkClick = (e: React.MouseEvent, targetStudioId: StudioId) => {
    if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
      e.preventDefault();
      onSelectStudio(targetStudioId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <section className="mt-12 pt-10 border-t border-slate-200 dark:border-slate-800 space-y-12">
      {/* Breadcrumb Trail */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <a
          href="/"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey && !e.shiftKey) {
              e.preventDefault();
              window.location.href = '/';
            }
          }}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          Home
        </a>
        <span>/</span>
        <a
          href={getStudioUrl(studioId)}
          onClick={(e) => handleStudioLinkClick(e, studioId)}
          className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          {studio.name}
        </a>
        <span>/</span>
        <span className="text-slate-900 dark:text-slate-200 font-medium truncate max-w-xs">
          {tool.name}
        </span>
      </nav>

      {/* Header Info & Share */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            About {tool.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            {tool.description} Fast, 100% offline, and 100% secure on your device.
          </p>
        </div>

        <button
          onClick={handleShare}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs transition-colors cursor-pointer"
        >
          {copiedLink ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Tool</span>
            </>
          )}
        </button>
      </div>

      {/* "How to Use" Step-by-Step */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <span>How to Use {tool.name}</span>
          <span className="text-xs font-normal text-slate-400">(3 Simple Steps)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {seoData.howToSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-2 relative"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                {idx + 1}
              </div>
              <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                {step.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 100% Offline Privacy Guarantee */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 dark:border-emerald-500/30 space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            100% Offline Privacy • 100% Secure
          </h3>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
          Unlike traditional online tool websites that upload your confidential PDFs, private images, or sensitive files to remote cloud servers, <strong>Toolstrum runs 100% offline directly on your device</strong>. Zero files or data are ever uploaded or transmitted across the internet.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Zero server file uploads</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Processed privately on your device</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>No data tracking or logging</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-2">
          {seoData.faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between p-4 text-left font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-500' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 pt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Related Tools Internal Linking Grid */}
      {relatedTools.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
              Related Tools in {studio.name}
            </h3>
            <a
              href={getStudioUrl(studioId)}
              onClick={(e) => handleStudioLinkClick(e, studioId)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 cursor-pointer"
            >
              <span>View All {studio.name}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedTools.map((relTool) => {
              const relUrl = getToolUrl(relTool);
              return (
                <a
                  key={relTool.id}
                  href={relUrl}
                  onClick={(e) => handleToolLinkClick(e, relTool.id)}
                  className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-2xs hover:shadow-sm transition-all cursor-pointer space-y-1.5 block"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                      #{relTool.id}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Offline
                    </span>
                  </div>
                  <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                    {relTool.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {relTool.description}
                  </p>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
