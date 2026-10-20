import { StudioId } from '../types';

export const Colors = {
  // Brand
  primary: '#483EE5',
  primaryContainer: '#625BFF',
  primaryFixed: '#E2DFFF',
  onPrimary: '#FFFFFF',
  
  secondary: '#8127CF',
  secondaryContainer: '#9C48EA',
  secondaryFixed: '#F0DBFF',

  // Surfaces
  backgroundCloud: '#F7F8FC',
  background: '#FBF8FF',
  surfaceWhite: '#FFFFFF',
  surface: '#FBF8FF',
  
  // Text & Borders
  onSurface: '#171A2E',
  onSurfaceVariant: '#464555',
  textMuted: '#64748B',
  borderSubtle: '#E2E8F0',
  
  // Status
  statusSuccess: '#16A34A',
  statusWarning: '#F59E0B',
  statusError: '#DC2626',

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
  accentSecurity: '#0D9488',  // QR, Barcode & Security
  accentAccess: '#4F46E5',    // Accessibility
  accentAdvanced: '#9333EA',  // Advanced & Experimental
};

export const StudioTheme: Record<StudioId, {
  accent: string;
  surface: string;
  name: string;
  icon: string;
  toolRange: string;
  description: string;
  isComingSoon?: boolean;
}> = {
  pdf: {
    accent: '#FF6B6B',
    surface: '#FFF0EF',
    name: 'PDF Studio',
    icon: 'FileText',
    toolRange: '1–48',
    description: 'Merge, split, reorder, compress, sign, and convert PDF documents offline.',
  },
  image: {
    accent: '#10B981',
    surface: '#E7F9F1',
    name: 'Image Studio',
    icon: 'Image',
    toolRange: '49–85',
    description: 'Compress, crop, resize, convert formats, filter, and extract colors from images.',
  },
  scanner: {
    accent: '#06B6D4',
    surface: '#E6FAFD',
    name: 'Document Scanner',
    icon: 'Scan',
    toolRange: '86–103',
    description: 'Webcam capture, perspective cleanup, high-contrast B&W filters, and scan-to-PDF.',
  },
  video: {
    accent: '#A855F7',
    surface: '#F5EAFF',
    name: 'Video Studio',
    icon: 'Video',
    toolRange: '104–128',
    description: 'Frame extraction, video-to-audio, subtitle editing, and stream slicing in browser.',
  },
  audio: {
    accent: '#3B82F6',
    surface: '#EAF2FF',
    name: 'Audio Studio',
    icon: 'Volume2',
    toolRange: '129–153',
    description: 'Web Audio trimmer, waveforms, text-to-speech, decibel meter, and sound recorder.',
  },
  office: {
    accent: '#625BFF',
    surface: '#EEEDFF',
    name: 'Office & Documents',
    icon: 'FileSpreadsheet',
    toolRange: '154–180',
    description: 'CSV editor/viewer, JSON-to-CSV, spreadsheet generator, and Markdown live editor.',
  },
  archive: {
    accent: '#64748B',
    surface: '#EEF2F6',
    name: 'Archive & Files',
    icon: 'Archive',
    toolRange: '181–204',
    description: 'Create and extract ZIP archives, inspect contents, and generate file checksums.',
  },
  text: {
    accent: '#F97316',
    surface: '#FFF1E7',
    name: 'Text & Writing',
    icon: 'Type',
    toolRange: '205–243',
    description: 'Word counters, case conversion, line sorters, diff comparison, and slug tools.',
  },
  developer: {
    accent: '#0EA5E9',
    surface: '#E8F7FF',
    name: 'Developer Tools',
    icon: 'Code',
    toolRange: '244–300',
    description: 'JSON/YAML formatters, JWT inspector, Regex tester, CSS playgrounds, and crypto hashes.',
  },
  calculators: {
    accent: '#F59E0B',
    surface: '#FFF7E2',
    name: 'Calculators',
    icon: 'Calculator',
    toolRange: '301–350',
    description: 'Financial EMI & loans, unit converters, scientific math, and date/time calculators.',
  },
  qr_security: {
    accent: '#0D9488',
    surface: '#F0FDFA',
    name: 'QR, Barcode & Security',
    icon: 'QrCode',
    toolRange: '351–375',
    description: 'Custom QR generator, barcode maker, password entropy meter, and TOTP 2FA.',
  },
  web: {
    accent: '#14B8A6',
    surface: '#E5FAF6',
    name: 'Web & Internet',
    icon: 'Globe',
    toolRange: '376–400',
    description: 'URL parser, UTM campaign tagger, meta tag generator, and HTTP header inspector.',
  },
  ai: {
    accent: '#A855F7',
    surface: '#F4EAFE',
    name: 'AI Studio',
    icon: 'Sparkles',
    toolRange: '401–416',
    description: 'Smart offline assistant & preview tools.',
    isComingSoon: true,
  },
  productivity: {
    accent: '#EC4899',
    surface: '#FDEBF5',
    name: 'Productivity & Education',
    icon: 'CheckSquare',
    toolRange: '417–450',
    description: 'Pomodoro timer with audio alerts, expense splitter, invoice generator, and resume maker.',
  },
  accessibility: {
    accent: '#4F46E5',
    surface: '#EFF6FF',
    name: 'Accessibility & Display',
    icon: 'Eye',
    toolRange: '451–470',
    description: 'WCAG contrast checker, color blindness simulator, font scaler, and screen metrics.',
  },
  advanced: {
    accent: '#9333EA',
    surface: '#FAF5FF',
    name: 'Advanced & Experimental',
    icon: 'Cpu',
    toolRange: '471–500',
    description: '100% offline utilities: spreadsheet formulas, visual charts, text difference checker, and privacy redactor.',
  },
};
