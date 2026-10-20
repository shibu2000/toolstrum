export const Colors = {
  // Brand & Core
  primary: '#483EE5',
  primaryContainer: '#625BFF',
  primaryFixed: '#E2DFFF',
  onPrimary: '#FFFFFF',
  onPrimaryFixed: '#0E006A',
  
  secondary: '#8127CF',
  secondaryContainer: '#9C48EA',
  secondaryFixed: '#F0DBFF',
  onSecondary: '#FFFFFF',
  
  tertiary: '#006476',
  tertiaryContainer: '#007F95',
  tertiaryFixed: '#ACEDFF',
  onTertiary: '#FFFFFF',

  // Surfaces & Backgrounds
  backgroundCloud: '#F7F8FC',
  background: '#FBF8FF',
  surfaceWhite: '#FFFFFF',
  surface: '#FBF8FF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F4F2FF',
  surfaceContainer: '#EDECFF',
  surfaceContainerHigh: '#E6E6FF',
  surfaceContainerHighest: '#DFE0FC',
  surfaceVariant: '#DFE0FC',
  
  // Text & Borders
  onSurface: '#171A2E',
  onSurfaceVariant: '#464555',
  textMuted: '#64748B',
  borderSubtle: '#E2E8F0',
  outline: '#777587',
  outlineVariant: '#C7C4D8',
  
  // Status Colors
  statusSuccess: '#16A34A',
  statusWarning: '#F59E0B',
  statusError: '#DC2626',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  inverseSurface: '#171A2E',
  inverseOnSurface: '#F0EFFF',

  // Studio Accents
  accentCoral: '#FF6B6B',     // PDF Studio
  accentEmerald: '#10B981',   // Image Studio
  accentCyan: '#06B6D4',      // Scanner Studio
  accentViolet: '#A855F7',    // Video Studio
  accentBlue: '#3B82F6',      // Audio Studio
  accentIndigo: '#625BFF',    // Office Studio
  accentOrange: '#F97316',    // Text Tools
  accentSky: '#0EA5E9',       // Developer Tools
  accentAmber: '#F59E0B',     // Calculators
  accentSlate: '#64748B',     // Archive & Files
  accentTeal: '#14B8A6',      // Web Utilities
  accentRose: '#EC4899',      // Productivity
  
  // Soft Studio Surfaces (Pale Containers)
  surfacePdf: '#FFF0EF',
  surfaceImage: '#E7F9F1',
  surfaceScanner: '#E6FAFD',
  surfaceVideo: '#F5EAFF',
  surfaceAudio: '#EAF2FF',
  surfaceOffice: '#EEEDFF',
  surfaceText: '#FFF1E7',
  surfaceDeveloper: '#E8F7FF',
  surfaceCalculator: '#FFF7E2',
  surfaceArchive: '#EEF2F6',
  surfaceWeb: '#E5FAF6',
  surfaceProductivity: '#FDEBF5',
  surfaceAi: '#F4EAFE',
  surfaceAccessibility: '#EFF6FF',
  surfaceAdvanced: '#FAF5FF',

  // Semantic & Scale Aliases
  surfaceBackground: '#F7F8FC',
  cloudWhite: '#F7F8FC',
  white: '#FFFFFF',
  pureWhite: '#FFFFFF',
  midnightNavy: '#171A2E',
  textSecondary: '#464555',
  textTertiary: '#94A3B8',
  borderLight: '#E2E8F0',
  textDisabled: '#94A3B8',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',

  // Neutral Color Palette
  neutral50: '#F8FAFC',
  neutral100: '#F1F5F9',
  neutral200: '#E2E8F0',
  neutral300: '#CBD5E1',
  neutral400: '#94A3B8',
  neutral500: '#64748B',
  neutral600: '#475569',
  neutral700: '#334155',
  neutral800: '#1E293B',
  neutral900: '#0F172A',

  // Studio Colors Map
  studios: {
    pdf: '#FF6B6B',
    image: '#10B981',
    scanner: '#06B6D4',
    video: '#A855F7',
    audio: '#3B82F6',
    office: '#625BFF',
    text: '#F97316',
    developer: '#0EA5E9',
    calculators: '#F59E0B',
    qr_security: '#0D9488',
    web: '#14B8A6',
    ai: '#A855F7',
    productivity: '#EC4899',
    archive: '#64748B',
    accessibility: '#4F46E5',
    advanced: '#9333EA',
  },
};

export const StudioTheme = {
  pdf: {
    accent: Colors.accentCoral,
    primary: Colors.accentCoral,
    surface: Colors.surfacePdf,
    primaryLight: Colors.surfacePdf,
    name: 'PDF Studio',
    icon: 'FileText',
  },
  image: {
    accent: Colors.accentEmerald,
    primary: Colors.accentEmerald,
    surface: Colors.surfaceImage,
    primaryLight: Colors.surfaceImage,
    name: 'Image Studio',
    icon: 'Image',
  },
  scanner: {
    accent: Colors.accentCyan,
    primary: Colors.accentCyan,
    surface: Colors.surfaceScanner,
    primaryLight: Colors.surfaceScanner,
    name: 'Document Scanner',
    icon: 'Scan',
  },
  video: {
    accent: Colors.accentViolet,
    primary: Colors.accentViolet,
    surface: Colors.surfaceVideo,
    primaryLight: Colors.surfaceVideo,
    name: 'Video Studio',
    icon: 'Video',
  },
  audio: {
    accent: Colors.accentBlue,
    primary: Colors.accentBlue,
    surface: Colors.surfaceAudio,
    primaryLight: Colors.surfaceAudio,
    name: 'Audio Studio',
    icon: 'Volume2',
  },
  office: {
    accent: Colors.accentIndigo,
    primary: Colors.accentIndigo,
    surface: Colors.surfaceOffice,
    primaryLight: Colors.surfaceOffice,
    name: 'Office & Documents',
    icon: 'FileSpreadsheet',
  },
  archive: {
    accent: Colors.accentSlate,
    primary: Colors.accentSlate,
    surface: Colors.surfaceArchive,
    primaryLight: Colors.surfaceArchive,
    name: 'Archive & Files',
    icon: 'Archive',
  },
  text: {
    accent: Colors.accentOrange,
    primary: Colors.accentOrange,
    surface: Colors.surfaceText,
    primaryLight: Colors.surfaceText,
    name: 'Text & Writing',
    icon: 'Type',
  },
  developer: {
    accent: Colors.accentSky,
    primary: Colors.accentSky,
    surface: Colors.surfaceDeveloper,
    primaryLight: Colors.surfaceDeveloper,
    name: 'Developer Tools',
    icon: 'Code',
  },
  calculators: {
    accent: Colors.accentAmber,
    primary: Colors.accentAmber,
    surface: Colors.surfaceCalculator,
    primaryLight: Colors.surfaceCalculator,
    name: 'Calculators',
    icon: 'Calculator',
  },
  qr_security: {
    accent: '#0D9488',
    primary: '#0D9488',
    surface: '#F0FDFA',
    primaryLight: '#F0FDFA',
    name: 'QR, Barcode & Security',
    icon: 'QrCode',
  },
  web: {
    accent: Colors.accentTeal,
    primary: Colors.accentTeal,
    surface: Colors.surfaceWeb,
    primaryLight: Colors.surfaceWeb,
    name: 'Web & Internet',
    icon: 'Globe',
  },
  ai: {
    accent: Colors.accentViolet,
    primary: Colors.accentViolet,
    surface: Colors.surfaceAi,
    primaryLight: Colors.surfaceAi,
    name: 'AI Studio',
    icon: 'Sparkles',
    isComingSoon: true,
  },
  productivity: {
    accent: Colors.accentRose,
    primary: Colors.accentRose,
    surface: Colors.surfaceProductivity,
    primaryLight: Colors.surfaceProductivity,
    name: 'Productivity & Education',
    icon: 'CheckSquare',
  },
  accessibility: {
    accent: '#4F46E5',
    primary: '#4F46E5',
    surface: Colors.surfaceAccessibility,
    primaryLight: Colors.surfaceAccessibility,
    name: 'Accessibility & Device',
    icon: 'Smartphone',
  },
  advanced: {
    accent: '#9333EA',
    primary: '#9333EA',
    surface: Colors.surfaceAdvanced,
    primaryLight: Colors.surfaceAdvanced,
    name: 'Advanced & Experimental',
    icon: 'Cpu',
  },
} as const;

export type StudioId = keyof typeof StudioTheme;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
  margin: 20,
};

export const Radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 9999,
  full: 9999,
};

export const Typography = {
  headlineLg: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, color: Colors.onSurface },
  headlineMd: { fontSize: 22, fontWeight: '700' as const, lineHeight: 28, color: Colors.onSurface },
  headlineSm: { fontSize: 18, fontWeight: '600' as const, lineHeight: 24, color: Colors.onSurface },
  titleMd: { fontSize: 16, fontWeight: '600' as const, lineHeight: 22, color: Colors.onSurface },
  titleSm: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20, color: Colors.onSurface },
  bodyLg: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24, color: Colors.onSurface },
  bodyMd: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20, color: Colors.onSurface },
  bodySm: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18, color: Colors.textMuted },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16, color: Colors.textMuted },
  labelMd: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
  labelSm: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
};
