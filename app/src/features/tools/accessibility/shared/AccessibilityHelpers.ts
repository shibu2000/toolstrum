// Accessibility & Device Studio Offline Helpers

export interface ContrastResult {
  ratio: number;
  ratioFormatted: string;
  isNormalTextAA: boolean;
  isNormalTextAAA: boolean;
  isLargeTextAA: boolean;
  isLargeTextAAA: boolean;
  ratingDescription: string;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return { r: 0, g: 0, b: 0 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [lr, lg, lb] = [r, g, b].map((val) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
}

export function calculateContrastRatio(foregroundHex: string, backgroundHex: string): ContrastResult {
  const fg = hexToRgb(foregroundHex);
  const bg = hexToRgb(backgroundHex);

  const l1 = getLuminance(fg.r, fg.g, fg.b);
  const l2 = getLuminance(bg.r, bg.g, bg.b);

  const brighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  const ratio = (brighter + 0.05) / (darker + 0.05);
  const rounded = Math.round(ratio * 100) / 100;

  const isNormalTextAA = ratio >= 4.5;
  const isNormalTextAAA = ratio >= 7.0;
  const isLargeTextAA = ratio >= 3.0;
  const isLargeTextAAA = ratio >= 4.5;

  let ratingDescription = 'Fails WCAG Standards';
  if (isNormalTextAAA) {
    ratingDescription = 'Passes WCAG AAA (Enhanced Contrast)';
  } else if (isNormalTextAA) {
    ratingDescription = 'Passes WCAG AA (Minimum Contrast)';
  } else if (isLargeTextAA) {
    ratingDescription = 'Passes Large Text AA Only';
  }

  return {
    ratio: rounded,
    ratioFormatted: `${rounded.toFixed(2)}:1`,
    isNormalTextAA,
    isNormalTextAAA,
    isLargeTextAA,
    isLargeTextAAA,
    ratingDescription,
  };
}

export type ColorVisionDeficiency = 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export function simulateColorDeficiency(hex: string, deficiency: ColorVisionDeficiency): string {
  const { r, g, b } = hexToRgb(hex);

  let sr = r;
  let sg = g;
  let sb = b;

  if (deficiency === 'protanopia') {
    // Red-weak
    sr = 0.56667 * r + 0.43333 * g + 0.0 * b;
    sg = 0.55833 * r + 0.44167 * g + 0.0 * b;
    sb = 0.0 * r + 0.24167 * g + 0.75833 * b;
  } else if (deficiency === 'deuteranopia') {
    // Green-weak
    sr = 0.625 * r + 0.375 * g + 0.0 * b;
    sg = 0.7 * r + 0.3 * g + 0.0 * b;
    sb = 0.0 * r + 0.3 * g + 0.7 * b;
  } else if (deficiency === 'tritanopia') {
    // Blue-weak
    sr = 0.95 * r + 0.05 * g + 0.0 * b;
    sg = 0.0 * r + 0.43333 * g + 0.56667 * b;
    sb = 0.0 * r + 0.475 * g + 0.525 * b;
  } else if (deficiency === 'achromatopsia') {
    // Complete monochromacy
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    sr = gray;
    sg = gray;
    sb = gray;
  }

  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');

  return `#${toHex(sr)}${toHex(sg)}${toHex(sb)}`.toUpperCase();
}

export interface NoiseExposureInfo {
  db: number;
  category: string;
  sourceExample: string;
  maxSafeDailyExposure: string;
  riskLevel: 'Safe' | 'Moderate' | 'Hazardous';
}

export function evaluateNoiseLevel(db: number): NoiseExposureInfo {
  if (db < 50) {
    return {
      db,
      category: 'Quiet / Whisper',
      sourceExample: 'Quiet library, whisper at 2m, ambient bedroom',
      maxSafeDailyExposure: 'Continuous (No Limit)',
      riskLevel: 'Safe',
    };
  }
  if (db < 70) {
    return {
      db,
      category: 'Moderate / Conversational',
      sourceExample: 'Normal conversation, office background, quiet street',
      maxSafeDailyExposure: 'Continuous (No Limit)',
      riskLevel: 'Safe',
    };
  }
  if (db < 85) {
    return {
      db,
      category: 'Elevated / Busy Traffic',
      sourceExample: 'City traffic, vacuum cleaner, noisy restaurant',
      maxSafeDailyExposure: 'Up to 8 hours daily',
      riskLevel: 'Moderate',
    };
  }
  if (db < 100) {
    return {
      db,
      category: 'Loud / Power Tools',
      sourceExample: 'Lawn mower, motorcycle, power drill, subway train',
      maxSafeDailyExposure: 'Max 15 - 60 minutes without protection',
      riskLevel: 'Hazardous',
    };
  }
  return {
    db,
    category: 'Extremely Dangerous / Ear Damage Risk',
    sourceExample: 'Rock concert, siren, jet takeoff, fireworks',
    maxSafeDailyExposure: 'Immediate ear protection required (< 1 min)',
    riskLevel: 'Hazardous',
  };
}

export interface PermissionGuideItem {
  permission: string;
  category: string;
  riskRating: 'High' | 'Medium' | 'Low';
  usagePurpose: string;
  privacyRecommendation: string;
}

export const PERMISSION_AUDIT_GUIDE: PermissionGuideItem[] = [
  {
    permission: 'Camera',
    category: 'Hardware Optics',
    riskRating: 'High',
    usagePurpose: 'Scanning QR codes, documents, barcode inventory, and photos.',
    privacyRecommendation: 'Grant "Only while using app" to prevent unexpected background captures.',
  },
  {
    permission: 'Microphone',
    category: 'Audio Recording',
    riskRating: 'High',
    usagePurpose: 'Voice dictation and ambient sound level metering.',
    privacyRecommendation: 'Revoke when voice dictation is inactive; local offline processing preserves privacy.',
  },
  {
    permission: 'Location (Precise)',
    category: 'Geospatial GPS',
    riskRating: 'High',
    usagePurpose: 'GPS coordinate tagging and local timezone determination.',
    privacyRecommendation: 'Toolstrum operates 100% offline and never requires location tracking.',
  },
  {
    permission: 'Photo Library / Media',
    category: 'Files & Storage',
    riskRating: 'Medium',
    usagePurpose: 'Importing photos for Image Studio and PDF conversion.',
    privacyRecommendation: 'Select "Limited Photo Access" to only allow specific picked files.',
  },
  {
    permission: 'Notifications',
    category: 'User Alerts',
    riskRating: 'Low',
    usagePurpose: 'Timer alerts and Pomodoro break reminders.',
    privacyRecommendation: 'Safe to allow; notifications are scheduled entirely on-device without APNs.',
  },
];

export interface FirstAidGuide {
  title: string;
  icon: string;
  urgency: string;
  steps: string[];
}

export const OFFLINE_FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    title: 'Adult CPR (Hands-Only)',
    icon: 'Heart',
    urgency: 'CRITICAL EMERGENCY',
    steps: [
      '1. Check responsiveness and call local emergency services immediately.',
      '2. Place hands in the center of the person’s chest, fingers interlaced.',
      '3. Push hard and fast at 100–120 compressions per minute (to the beat of "Stayin Alive").',
      '4. Allow full chest recoil between compressions until medical personnel arrive.',
    ],
  },
  {
    title: 'Severe Bleeding Control',
    icon: 'AlertTriangle',
    urgency: 'URGENT',
    steps: [
      '1. Apply direct, firm pressure on the wound using a clean cloth or sterile gauze.',
      '2. Maintain steady pressure without lifting the cloth to inspect.',
      '3. If blood soaks through, add another cloth on top—do not remove the first.',
      '4. Elevate the injured area above the heart if no bone fracture is suspected.',
    ],
  },
  {
    title: 'Burns & Scalds',
    icon: 'Flame',
    urgency: 'FIRST AID',
    steps: [
      '1. Cool the burn immediately under cool, gentle running water for 10–20 minutes.',
      '2. Do NOT apply ice, butter, grease, or toothpaste—these trap heat.',
      '3. Cover loosely with sterile, non-adherent dressing or clean plastic wrap.',
      '4. Seek urgent medical care for blistering or burns covering large areas.',
    ],
  },
  {
    title: 'Choking (Heimlich Maneuver)',
    icon: 'Activity',
    urgency: 'LIFE THREATENING',
    steps: [
      '1. Confirm person cannot speak or cough forcefully.',
      '2. Stand behind them and wrap your arms around their waist.',
      '3. Make a fist with one hand just above the navel.',
      '4. Grasp fist with other hand and give quick upward inward thrusts until airway clears.',
    ],
  },
];

export interface IceCardData {
  fullName: string;
  bloodType: string;
  allergies: string;
  medicalConditions: string;
  medications: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export function formatIceCardPayload(data: IceCardData): string {
  return [
    `=== EMERGENCY MEDICAL IDENTITY (ICE) ===`,
    `Full Name:    ${data.fullName || 'Unknown Patient'}`,
    `Blood Type:   ${data.bloodType || 'Unknown'}`,
    `Allergies:    ${data.allergies || 'None Reported'}`,
    `Conditions:   ${data.medicalConditions || 'None Reported'}`,
    `Medications:  ${data.medications || 'None Reported'}`,
    `----------------------------------------`,
    `PRIMARY EMERGENCY CONTACT:`,
    `Name:         ${data.emergencyContactName || 'Emergency Contact'}`,
    `Relation:     ${data.emergencyContactRelation || 'Next of Kin'}`,
    `Telephone:    ${data.emergencyContactPhone || 'N/A'}`,
    `========================================`,
    `Store this card on lock screen or offline device for first responders.`,
  ].join('\n');
}
