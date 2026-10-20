import React from 'react';
import * as LucideIcons from 'lucide-react-native';

export type IconName = keyof typeof LucideIcons;

interface DynamicIconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const ICON_FALLBACK_MAP: Record<string, keyof typeof LucideIcons> = {
  // Studio Icons
  FileText: 'FileText',
  Image: 'Image',
  Scan: 'Scan',
  Video: 'Video',
  Volume2: 'Volume2',
  FileSpreadsheet: 'FileSpreadsheet',
  Archive: 'Archive',
  Type: 'Type',
  Code: 'Code',
  Calculator: 'Calculator',
  QrCode: 'QrCode',
  Globe: 'Globe',
  Sparkles: 'Sparkles',
  CheckSquare: 'CheckSquare',
  Smartphone: 'Smartphone',
  Cpu: 'Cpu',

  // Utility actions
  search: 'Search',
  star: 'Star',
  history: 'Clock',
  schedule: 'Clock',
  folder: 'Folder',
  download: 'Download',
  settings: 'Settings',
  arrow_back: 'ArrowLeft',
  more_vert: 'MoreVertical',
  close: 'X',
  tune: 'SlidersHorizontal',
  filter_list: 'Filter',
  verified: 'CheckCircle2',
  verified_user: 'ShieldCheck',
  chevron_right: 'ChevronRight',
  swap_vert: 'ArrowUpDown',
  upload_file: 'Upload',
  note_add: 'FilePlus',
  grid_view: 'LayoutGrid',
  view_list: 'List',
  share: 'Share2',
  delete: 'Trash2',
  visibility: 'Eye',
  check: 'Check',
  copy: 'Copy',
  cloud_off: 'CloudOff',
};

export const AppIcon: React.FC<DynamicIconProps> = ({
  name,
  size = 22,
  color = '#171A2E',
  strokeWidth = 2,
}) => {
  const iconKey = ICON_FALLBACK_MAP[name] || (name as keyof typeof LucideIcons);
  const IconComponent = (LucideIcons[iconKey] as React.ComponentType<any>) || LucideIcons.Wrench;

  return <IconComponent size={size} color={color} strokeWidth={strokeWidth} />;
};
