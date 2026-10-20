import React from 'react';

interface ToolstrumLogoProps {
  size?: number;
  className?: string;
  variant?: 'mark' | 'badge' | 'full';
  showBadge?: boolean;
}

export const ToolstrumLogo: React.FC<ToolstrumLogoProps> = ({
  size = 36,
  className = '',
  variant = 'badge',
}) => {
  // SVG Vector Glyph for Toolstrum: The Harmonic Sonic Prism 'T'
  const Glyph = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="ts-grad-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="50%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>

        <linearGradient id="ts-grad-border" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" stopOpacity="0.4" />
          <stop offset="50%" stopColor="#A855F7" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
        </linearGradient>

        {/* Top Crossbar Left Wing */}
        <linearGradient id="ts-t-left" x1="12" y1="16" x2="32" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>

        {/* Top Crossbar Right Wing */}
        <linearGradient id="ts-t-right" x1="32" y1="16" x2="52" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>

        {/* Center Sonic Stem */}
        <linearGradient id="ts-t-stem" x1="32" y1="20" x2="32" y2="52" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#EC4899" />
          <stop offset="40%" stopColor="#8B5CF6" />
          <stop offset="80%" stopColor="#06B6D4" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Core Harmonic Beam */}
        <linearGradient id="ts-beam" x1="32" y1="18" x2="32" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#67E8F9" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.4" />
        </linearGradient>

        {/* Ambient Glow Filter */}
        <filter id="ts-glow" x="6" y="8" width="52" height="52" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Squircle Badge Background */}
      {variant === 'badge' && (
        <>
          <rect
            x="2"
            y="2"
            width="60"
            height="60"
            rx="16"
            fill="url(#ts-grad-bg)"
            stroke="url(#ts-grad-border)"
            strokeWidth="1.5"
          />
          {/* Subtle Ambient Refraction Spot */}
          <circle cx="32" cy="14" r="14" fill="#6366F1" opacity="0.25" filter="blur(10px)" />
          <circle cx="32" cy="40" r="12" fill="#06B6D4" opacity="0.2" filter="blur(8px)" />
        </>
      )}

      {/* Main Symbol: Geometric Prismatic "T" */}
      <g filter={variant === 'badge' ? 'url(#ts-glow)' : undefined}>
        {/* Left Wing of T Crossbar */}
        <path
          d="M12 18C12 15.7909 13.7909 14 16 14H31.5L30 24H16C13.7909 24 12 22.2091 12 20V18Z"
          fill="url(#ts-t-left)"
        />

        {/* Right Wing of T Crossbar */}
        <path
          d="M52 18C52 15.7909 50.2091 14 48 14H32.5L34 24H48C50.2091 24 52 22.2091 52 20V18Z"
          fill="url(#ts-t-right)"
        />

        {/* Central Bevel Crest */}
        <path
          d="M26 14H38L35 24H29L26 14Z"
          fill="#C084FC"
          opacity="0.85"
        />

        {/* Vertical Prismatic Stem (T-Spine) */}
        <path
          d="M27.5 22L36.5 22L34.5 46C34.5 48.2091 33.3 50 32 50C30.7 50 29.5 48.2091 29.5 46L27.5 22Z"
          fill="url(#ts-t-stem)"
        />

        {/* Radiant Inner Strum Beam (The Harmonic Chords) */}
        <line
          x1="32"
          y1="16"
          x2="32"
          y2="46"
          stroke="url(#ts-beam)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Precision Strum Nodes (The 3 Resonance Points) */}
        <circle cx="32" cy="20" r="1.8" fill="#FFFFFF" />
        <circle cx="32" cy="30" r="1.4" fill="#E0E7FF" opacity="0.9" />
        <circle cx="32" cy="40" r="1.2" fill="#CFFAFE" opacity="0.8" />
      </g>
    </svg>
  );

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        <Glyph />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-sans">
              Toolstrum
            </span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          </div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-wider uppercase mt-0.5">
            Offline Toolkit
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Glyph />
    </div>
  );
};
