import { ToolDefinition } from '../../../data/types';
import { getToolById } from '../../../data/registry';

export type AccessibilityWorkspaceId =
  | 'access_visual_optics'
  | 'access_speech_reading'
  | 'access_device_telemetry'
  | 'access_safety_emergency';

export interface AccessibilityWorkspaceMeta {
  id: AccessibilityWorkspaceId;
  title: string;
  subtitle: string;
  description: string;
  toolIds: number[];
}

export const ACCESSIBILITY_WORKSPACES: Record<AccessibilityWorkspaceId, AccessibilityWorkspaceMeta> = {
  access_visual_optics: {
    id: 'access_visual_optics',
    title: 'Visual Accessibility & Optics',
    subtitle: 'Magnification, Contrast & Color Simulators',
    description: 'Inspect screen magnification, check WCAG 2.1 color contrast ratios, simulate color blindness conditions, preview large typography scales, and toggle flashlight.',
    toolIds: [451, 452, 453, 454, 455, 456],
  },
  access_speech_reading: {
    id: 'access_speech_reading',
    title: 'Speech, Audio & Vision Assistance',
    subtitle: 'Text-to-Speech, Dictation & Sound Meter',
    description: 'Read aloud text and documents with speech synthesis, transcribe audio locally, inspect decibel sound levels, generate alt-text descriptions, and read large format text.',
    toolIds: [457, 458, 459, 460, 461, 463],
  },
  access_device_telemetry: {
    id: 'access_device_telemetry',
    title: 'Device Diagnostics & Hardware',
    subtitle: 'Battery, Storage, Display & Haptics',
    description: 'Monitor device hardware specs, screen resolution and pixel density, battery status, local storage breakdowns, and trigger custom haptic pulse timers.',
    toolIds: [462, 464, 465, 466, 467],
  },
  access_safety_emergency: {
    id: 'access_safety_emergency',
    title: 'Safety, Permissions & Emergency',
    subtitle: 'Medical Card, First-Aid Guide & Privacy',
    description: 'Create an offline ICE medical emergency card, browse essential first-aid protocols, and inspect mobile OS permission security risk ratings.',
    toolIds: [468, 469, 470],
  },
};

export interface AccessibilityToolConfig {
  toolId: number;
  workspaceId: AccessibilityWorkspaceId;
  name: string;
  badge: string;
  description: string;
}

export const ACCESSIBILITY_TOOL_CONFIGS: Record<number, AccessibilityToolConfig> = {
  // access_visual_optics
  451: {
    toolId: 451,
    workspaceId: 'access_visual_optics',
    name: 'Magnifier',
    badge: 'Magnifier',
    description: 'Digital loupe with zoom magnification levels and high-contrast freeze frame.',
  },
  452: {
    toolId: 452,
    workspaceId: 'access_visual_optics',
    name: 'Flashlight',
    badge: 'Torch',
    description: 'Screen light torch with SOS strobe emergency signaling and brightness slider.',
  },
  453: {
    toolId: 453,
    workspaceId: 'access_visual_optics',
    name: 'Screen Color Picker',
    badge: 'Color Picker',
    description: 'Inspect exact Hex, RGB, and HSL color values with perceptual color naming.',
  },
  454: {
    toolId: 454,
    workspaceId: 'access_visual_optics',
    name: 'Text Size Preview',
    badge: 'Font Scaler',
    description: 'Preview dynamic text sizes and line-heights across 12pt to 48pt for accessibility.',
  },
  455: {
    toolId: 455,
    workspaceId: 'access_visual_optics',
    name: 'Contrast Checker',
    badge: 'WCAG Ratio',
    description: 'Calculate WCAG 2.1 AA/AAA color contrast ratios between text and background colors.',
  },
  456: {
    toolId: 456,
    workspaceId: 'access_visual_optics',
    name: 'Color Blindness Simulator',
    badge: 'Vision Sim',
    description: 'Simulate Protanopia, Deuteranopia, Tritanopia, and Achromatopsia color perception.',
  },

  // access_speech_reading
  457: {
    toolId: 457,
    workspaceId: 'access_speech_reading',
    name: 'Speech-to-Text',
    badge: 'Dictation',
    description: 'Speech recognition dictation engine with offline word confidence scoring.',
  },
  458: {
    toolId: 458,
    workspaceId: 'access_speech_reading',
    name: 'Text-to-Speech Reader',
    badge: 'TTS Voice',
    description: 'Read arbitrary text aloud using on-device speech synthesis with pitch and rate controls.',
  },
  459: {
    toolId: 459,
    workspaceId: 'access_speech_reading',
    name: 'Large Text Reader',
    badge: 'Large Print',
    description: 'Distraction-free, high-contrast, large-format reader for visually impaired users.',
  },
  460: {
    toolId: 460,
    workspaceId: 'access_speech_reading',
    name: 'Document Read-Aloud',
    badge: 'Read-Aloud',
    description: 'Paragraph-by-paragraph synchronized document speech player with phrase highlighting.',
  },
  461: {
    toolId: 461,
    workspaceId: 'access_speech_reading',
    name: 'Image Description Assistant',
    badge: 'Alt-Text',
    description: 'Generate descriptive accessibility alt-text tags for photos and screen captures.',
  },
  463: {
    toolId: 463,
    workspaceId: 'access_speech_reading',
    name: 'Sound Level Meter',
    badge: 'Decibels dB',
    description: 'Ambient sound pressure level meter with hearing health safety thresholds.',
  },

  // access_device_telemetry
  462: {
    toolId: 462,
    workspaceId: 'access_device_telemetry',
    name: 'Haptic Timer',
    badge: 'Haptics',
    description: 'Interval timer with tactile haptic vibration pulses for silent feedback.',
  },
  464: {
    toolId: 464,
    workspaceId: 'access_device_telemetry',
    name: 'Screen Resolution Viewer',
    badge: 'Display Res',
    description: 'Inspect exact screen dimensions, pixel density, scale factor, and aspect ratios.',
  },
  465: {
    toolId: 465,
    workspaceId: 'access_device_telemetry',
    name: 'Device Information',
    badge: 'Device Info',
    description: 'Detailed device telemetry including OS version, memory specs, and hardware model.',
  },
  466: {
    toolId: 466,
    workspaceId: 'access_device_telemetry',
    name: 'Battery Information',
    badge: 'Battery',
    description: 'Battery health, power state, discharge rates, and estimated runtime telemetry.',
  },
  467: {
    toolId: 467,
    workspaceId: 'access_device_telemetry',
    name: 'Storage Information',
    badge: 'Storage',
    description: 'Disk storage utilization analyzer with free space, cache, and capacity metrics.',
  },

  // access_safety_emergency
  468: {
    toolId: 468,
    workspaceId: 'access_safety_emergency',
    name: 'App Permission Guide',
    badge: 'Permissions',
    description: 'Privacy audit guide covering camera, mic, location, and storage permission risks.',
  },
  469: {
    toolId: 469,
    workspaceId: 'access_safety_emergency',
    name: 'Offline Reference Library',
    badge: 'First Aid',
    description: 'Emergency protocols for CPR, bleeding, burns, choking, and disaster response.',
  },
  470: {
    toolId: 470,
    workspaceId: 'access_safety_emergency',
    name: 'Emergency Information Card',
    badge: 'ICE Card',
    description: 'Create an In Case of Emergency (ICE) medical card with blood group and contacts.',
  },
};

export function getAccessibilityToolConfig(toolId: number): AccessibilityToolConfig | undefined {
  return ACCESSIBILITY_TOOL_CONFIGS[toolId];
}

export function getAccessibilityWorkspaceTools(workspaceId: AccessibilityWorkspaceId): ToolDefinition[] {
  const meta = ACCESSIBILITY_WORKSPACES[workspaceId];
  if (!meta) return [];
  return meta.toolIds
    .map((id) => getToolById(id))
    .filter((t): t is ToolDefinition => !!t);
}
