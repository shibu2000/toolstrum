export type StudioId =
  | 'pdf'
  | 'image'
  | 'scanner'
  | 'video'
  | 'audio'
  | 'office'
  | 'archive'
  | 'text'
  | 'developer'
  | 'calculators'
  | 'qr_security'
  | 'web'
  | 'ai'
  | 'productivity'
  | 'accessibility'
  | 'advanced';

export type ToolStatus =
  | 'available'
  | 'coming_soon'
  | 'requires_permission'
  | 'requires_network'
  | 'unsupported_on_device';

export interface ToolDefinition {
  id: number;
  name: string;
  studioId: StudioId;
  description: string;
  keywords: string[];
  status: ToolStatus;
  offlineCapable: boolean;
  iconName: string;
  inputKind: 'file' | 'files' | 'text' | 'form' | 'interactive' | 'camera' | 'audio';
  outputKinds: string[];
  isPopular?: boolean;
}

export interface StudioDefinition {
  id: StudioId;
  name: string;
  description: string;
  toolRange: string;
  accent: string;
  surface: string;
  icon: string;
  isComingSoon?: boolean;
}

export interface RecentItem {
  id: string;
  toolId: number;
  title: string;
  subtitle: string;
  timestamp: number;
}

export interface ManagedFile {
  id: string;
  name: string;
  dataUrl?: string;
  blob?: Blob;
  size: number;
  mimeType: string;
  createdAt: number;
  toolId?: number;
}
