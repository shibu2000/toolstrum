import { CANONICAL_TOOLS } from '../data/registry';
import {
  ACCESSIBILITY_TOOL_CONFIGS,
  ACCESSIBILITY_WORKSPACES,
  getAccessibilityToolConfig,
  getAccessibilityWorkspaceTools,
} from '../features/tools/accessibility/accessibilityConfig';
import {
  calculateContrastRatio,
  simulateColorDeficiency,
  evaluateNoiseLevel,
  PERMISSION_AUDIT_GUIDE,
  OFFLINE_FIRST_AID_GUIDES,
  formatIceCardPayload,
} from '../features/tools/accessibility/shared/AccessibilityHelpers';

console.log('--- STARTING ACCESSIBILITY & DEVICE STUDIO TEST SUITE ---');

// 1. Audit Canonical Catalog Entries for Tools 451–470
console.log('1. Auditing Canonical Catalog Entries for Tools 451–470...');
const accessTools = CANONICAL_TOOLS.filter((t) => t.id >= 451 && t.id <= 470);
if (accessTools.length !== 20) {
  throw new Error(`Expected exactly 20 Accessibility tools (451–470), found ${accessTools.length}`);
}

for (let id = 451; id <= 470; id++) {
  const config = getAccessibilityToolConfig(id);
  if (!config) {
    throw new Error(`Missing Accessibility configuration for tool ID ${id}`);
  }
  if (!ACCESSIBILITY_WORKSPACES[config.workspaceId]) {
    throw new Error(`Invalid workspace ID ${config.workspaceId} for tool ID ${id}`);
  }
}
console.log('✓ All 20 Accessibility tools are canonically registered and configured.');

// 2. Audit Workspace Mapping Integrity
console.log('2. Auditing Workspace Mappings (4 Workspaces)...');
const workspaces = Object.keys(ACCESSIBILITY_WORKSPACES) as Array<
  keyof typeof ACCESSIBILITY_WORKSPACES
>;
if (workspaces.length !== 4) {
  throw new Error(`Expected exactly 4 workspaces, found ${workspaces.length}`);
}

let totalWorkspaceTools = 0;
for (const wId of workspaces) {
  const tools = getAccessibilityWorkspaceTools(wId);
  if (tools.length === 0) {
    throw new Error(`Workspace ${wId} has zero registered tools`);
  }
  totalWorkspaceTools += tools.length;
}

if (totalWorkspaceTools !== 20) {
  throw new Error(`Expected 20 workspace tools total, found ${totalWorkspaceTools}`);
}
console.log('✓ All 4 workspaces contain exactly 20 tools total.');

// 3. Audit Contrast Ratio Engine
console.log('3. Auditing WCAG 2.1 Contrast Ratio Engine...');
const blackOnWhite = calculateContrastRatio('#000000', '#FFFFFF');
if (blackOnWhite.ratio < 20 || !blackOnWhite.isNormalTextAAA) {
  throw new Error(`Expected black on white to pass AAA (ratio >= 7), got ${blackOnWhite.ratio}`);
}

const whiteOnIndigo = calculateContrastRatio('#FFFFFF', '#4F46E5');
if (whiteOnIndigo.ratio < 4.5 || !whiteOnIndigo.isNormalTextAA) {
  throw new Error(`Expected white on indigo to pass AA (ratio >= 4.5), got ${whiteOnIndigo.ratio}`);
}

const lowContrast = calculateContrastRatio('#A0A0A0', '#FFFFFF');
if (lowContrast.isNormalTextAA) {
  throw new Error('Expected low contrast gray on white to fail AA');
}
console.log('✓ WCAG 2.1 Contrast Ratio calculation verified across AA and AAA thresholds.');

// 4. Audit Color Blindness Simulation
console.log('4. Auditing Color Blindness Simulation Engine...');
const origRed = '#DC2626';
const protSim = simulateColorDeficiency(origRed, 'protanopia');
const deutSim = simulateColorDeficiency(origRed, 'deuteranopia');
const achrSim = simulateColorDeficiency(origRed, 'achromatopsia');

if (!protSim.startsWith('#') || !deutSim.startsWith('#') || !achrSim.startsWith('#')) {
  throw new Error('Simulated color output must be valid hex');
}
// Achromatopsia should produce equal R, G, B channels (grayscale)
const achrR = achrSim.substring(1, 3);
const achrG = achrSim.substring(3, 5);
const achrB = achrSim.substring(5, 7);
if (achrR !== achrG || achrG !== achrB) {
  throw new Error(`Achromatopsia must produce perfect grayscale, got ${achrSim}`);
}
console.log('✓ Color blindness simulation matrix evaluated correctly.');

// 5. Audit Sound Level & Noise Health
console.log('5. Auditing Sound Level Exposure Engine...');
const quiet = evaluateNoiseLevel(42);
if (quiet.riskLevel !== 'Safe') {
  throw new Error('42 dB should be categorized as Safe');
}
const loud = evaluateNoiseLevel(95);
if (loud.riskLevel !== 'Hazardous') {
  throw new Error('95 dB should be categorized as Hazardous');
}
console.log('✓ Sound level and occupational noise thresholds verified.');

// 6. Audit Safety, Permissions & ICE Emergency Card
console.log('6. Auditing Safety, Permissions & Emergency Data...');
if (PERMISSION_AUDIT_GUIDE.length < 5) {
  throw new Error('Permission guide has fewer than 5 items');
}

if (OFFLINE_FIRST_AID_GUIDES.length < 4) {
  throw new Error('First aid guide has fewer than 4 protocols');
}

const iceCardText = formatIceCardPayload({
  fullName: 'Alice Walker',
  bloodType: 'A+',
  allergies: 'Peanuts',
  medicalConditions: 'None',
  medications: 'None',
  emergencyContactName: 'Bob Walker',
  emergencyContactPhone: '555-9876',
  emergencyContactRelation: 'Brother',
});

if (!iceCardText.includes('Alice Walker') || !iceCardText.includes('Blood Type:   A+') || !iceCardText.includes('Bob Walker')) {
  throw new Error('ICE Emergency Card formatting failed');
}
console.log('✓ Safety, First-Aid guides, and ICE Card formatter verified.');

console.log('🎉 ALL ACCESSIBILITY & DEVICE STUDIO TESTS PASSED (100% OK)!');
