import { StudioId } from '../design-system/tokens';

export type ToolStatus =
  | 'available'
  | 'coming_soon'
  | 'requires_permission'
  | 'requires_network'
  | 'requires_resource_download'
  | 'unsupported_on_device'
  | 'temporarily_unavailable';

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
  uri: string;
  size: number;
  sizeBytes?: number;
  toolId?: number;
  toolOriginId?: number;
  toolName?: string;
  mimeType?: string;
  createdAt: number;
}
