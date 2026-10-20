import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { safeSetBrightness, safeGetBrightness, safeTriggerHaptic } from '../../../services/hardwareSensors';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  ACCESSIBILITY_WORKSPACES,
  ACCESSIBILITY_TOOL_CONFIGS,
  getAccessibilityWorkspaceTools,
} from './accessibilityConfig';
import { AccessibilityResultCard } from './shared/AccessibilityResultCard';
import {
  calculateContrastRatio,
  simulateColorDeficiency,
  ColorVisionDeficiency,
} from './shared/AccessibilityHelpers';

interface AccessVisualOpticsWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const AccessVisualOpticsWorkspace: React.FC<AccessVisualOpticsWorkspaceProps> = ({
  initialToolId = 451,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = ACCESSIBILITY_WORKSPACES.access_visual_optics;
  const workspaceTools = getAccessibilityWorkspaceTools('access_visual_optics');

  // Magnifier state
  const [zoomLevel, setZoomLevel] = useState<1 | 2 | 4 | 8>(2);
  const [isFrozen, setIsFrozen] = useState(false);
  const [isInverted, setIsInverted] = useState(false);

  // Flashlight state
  const [torchActive, setTorchActive] = useState(false);
  const [torchColor, setTorchColor] = useState('#FFFFFF');
  const [torchMode, setTorchMode] = useState<'steady' | 'sos' | 'strobe'>('steady');
  const [torchBrightness, setTorchBrightness] = useState(100);
  const [strobeVisible, setStrobeVisible] = useState(true);
  const [previousBrightness, setPreviousBrightness] = useState<number | null>(null);

  // Screen Color Picker state
  const [pickedColor, setPickedColor] = useState('#4F46E5');

  // Text Size Preview state
  const [fontSizePreview, setFontSizePreview] = useState(20);

  // Contrast Checker state
  const [fgColor, setFgColor] = useState('#FFFFFF');
  const [bgColor, setBgColor] = useState('#4F46E5');

  // Color Blindness Simulator state
  const [simDeficiency, setSimDeficiency] = useState<ColorVisionDeficiency>('deuteranopia');
  const [simBaseColor, setSimBaseColor] = useState('#DC2626');

  // Contrast math
  const contrastResult = calculateContrastRatio(fgColor, bgColor);

  // Simulated color
  const simulatedHex = simulateColorDeficiency(simBaseColor, simDeficiency);

  // Real torch activation with brightness booster
  const turnOnTorch = async () => {
    const cur = await safeGetBrightness();
    if (cur !== null) {
      setPreviousBrightness(cur);
    }
    await safeSetBrightness(torchBrightness / 100);
    safeTriggerHaptic('medium');
    setTorchActive(true);
  };

  const turnOffTorch = async () => {
    setTorchActive(false);
    if (previousBrightness !== null) {
      await safeSetBrightness(previousBrightness);
    }
    safeTriggerHaptic('light');
  };

  const handleBrightnessChange = async (val: number) => {
    setTorchBrightness(val);
    if (torchActive) {
      await safeSetBrightness(val / 100);
    }
  };

  // SOS and Strobe blinking effects
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let interval: ReturnType<typeof setInterval> | null = null;

    if (!torchActive) {
      setStrobeVisible(true);
      return;
    }

    if (torchMode === 'steady') {
      setStrobeVisible(true);
      return;
    }

    if (torchMode === 'strobe') {
      interval = setInterval(() => {
        setStrobeVisible((v) => !v);
      }, 150);
      return () => {
        if (interval) clearInterval(interval);
      };
    }

    if (torchMode === 'sos') {
      const timings = [
        { on: true, d: 200 }, { on: false, d: 200 },
        { on: true, d: 200 }, { on: false, d: 200 },
        { on: true, d: 200 }, { on: false, d: 400 },
        { on: true, d: 600 }, { on: false, d: 200 },
        { on: true, d: 600 }, { on: false, d: 200 },
        { on: true, d: 600 }, { on: false, d: 400 },
        { on: true, d: 200 }, { on: false, d: 200 },
        { on: true, d: 200 }, { on: false, d: 200 },
        { on: true, d: 200 }, { on: false, d: 1000 },
      ];
      let step = 0;
      let active = true;

      const runStep = () => {
        if (!active) return;
        const current = timings[step];
        setStrobeVisible(current.on);
        step = (step + 1) % timings.length;
        timer = setTimeout(runStep, current.d);
      };
      runStep();

      return () => {
        active = false;
        if (timer) clearTimeout(timer);
      };
    }
  }, [torchActive, torchMode]);

  return (
    <View style={styles.container}>
      <AppHeader
        title={ACCESSIBILITY_TOOL_CONFIGS[activeToolId]?.name || 'Visual Optics'}
        subtitle={`${workspaceMeta.title} • Offline Local`}
        showBack
        onBackPress={onBack}
      />

      <View style={styles.selectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={styles.selectorBar}
        >
          {workspaceTools.map((tool) => {
            const cfg = ACCESSIBILITY_TOOL_CONFIGS[tool.id];
            const isSelected = tool.id === activeToolId;
            return (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolPill,
                  isSelected && styles.toolPillActive,
                ]}
                onPress={() => setActiveToolId(tool.id)}
              >
                <Text
                  style={[
                    styles.toolPillText,
                    isSelected && styles.toolPillTextActive,
                  ]}
                >
                  {cfg?.badge || tool.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield studioName="Accessibility" />

        {/* TOOL 451: Magnifier */}
        {activeToolId === 451 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Digital Loupe & Screen Magnifier</Text>
              <View style={styles.magnifierViewport}>
                <View
                  style={[
                    styles.sampleContentBox,
                    isInverted && styles.sampleContentBoxInverted,
                    { transform: [{ scale: zoomLevel }] },
                  ]}
                >
                  <Text
                    style={[
                      styles.sampleText,
                      isInverted && styles.sampleTextInverted,
                    ]}
                  >
                    Readable Fine Print 0.5mm
                  </Text>
                  <Text
                    style={[
                      styles.sampleSub,
                      isInverted && styles.sampleSubInverted,
                    ]}
                  >
                    High-contrast text preview under loupe
                  </Text>
                </View>
              </View>

              <Text style={styles.label}>Magnification Level</Text>
              <View style={styles.pillRow}>
                {([1, 2, 4, 8] as const).map((z) => (
                  <TouchableOpacity
                    key={z}
                    style={[styles.pill, zoomLevel === z && styles.pillActive]}
                    onPress={() => setZoomLevel(z)}
                  >
                    <Text style={[styles.pillText, zoomLevel === z && styles.pillTextActive]}>
                      {z}x Zoom
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.controlBtn, isFrozen && styles.controlBtnActive]}
                  onPress={() => setIsFrozen(!isFrozen)}
                >
                  <AppIcon name="Camera" size={16} color={isFrozen ? '#FFF' : '#4F46E5'} />
                  <Text style={[styles.controlBtnText, isFrozen && styles.controlBtnTextActive]}>
                    {isFrozen ? 'Unfreeze' : 'Freeze Frame'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.controlBtn, isInverted && styles.controlBtnActive]}
                  onPress={() => setIsInverted(!isInverted)}
                >
                  <AppIcon name="Eye" size={16} color={isInverted ? '#FFF' : '#4F46E5'} />
                  <Text style={[styles.controlBtnText, isInverted && styles.controlBtnTextActive]}>
                    {isInverted ? 'Normal Color' : 'Invert Contrast'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <AccessibilityResultCard
              title="Magnification Loupe"
              badge="Optical Assist"
              primaryValue={`${zoomLevel}x Digital Magnification`}
              primarySubtext={`Mode: ${isInverted ? 'High Inverted Contrast' : 'Standard'} • ${isFrozen ? 'Frame Frozen' : 'Live'}`}
              details={`Magnifier provides assistive visual enlargement for micro-text, pill bottles, serial codes, and fine documentation without external sensors.`}
              metadata={[
                { label: 'Magnification', value: `${zoomLevel}x` },
                { label: 'Contrast Filter', value: isInverted ? 'Inverted' : 'Standard' },
                { label: 'Frame', value: isFrozen ? 'Locked' : 'Active' },
              ]}
              copyContent={`Zoom: ${zoomLevel}x, Inverted: ${isInverted}`}
            />
          </View>
        )}

        {/* TOOL 452: Flashlight */}
        {activeToolId === 452 && (
          <View>
            {/* FULL SCREEN TORCH MODAL */}
            <Modal
              visible={torchActive}
              animationType="fade"
              transparent={false}
              statusBarTranslucent
              onRequestClose={turnOffTorch}
            >
              <TouchableOpacity
                activeOpacity={1}
                style={[
                  styles.fullScreenTorch,
                  { backgroundColor: strobeVisible ? torchColor : '#000000' },
                ]}
                onPress={turnOffTorch}
              >
                <View style={styles.torchOverlayTop}>
                  <Text
                    style={[
                      styles.torchOverlayBadge,
                      { color: torchColor === '#FFFFFF' || torchColor === '#FEF08A' ? '#1E293B' : '#FFFFFF' },
                    ]}
                  >
                    💡 SCREEN TORCH ACTIVE • {torchMode.toUpperCase()}
                  </Text>
                  <Text
                    style={[
                      styles.torchOverlayHint,
                      { color: torchColor === '#FFFFFF' || torchColor === '#FEF08A' ? '#475569' : '#F1F5F9' },
                    ]}
                  >
                    Tap anywhere on the illuminated screen to exit
                  </Text>
                </View>

                <View style={styles.torchOverlayBottom}>
                  <TouchableOpacity
                    style={[
                      styles.torchExitBtn,
                      { backgroundColor: torchColor === '#FFFFFF' || torchColor === '#FEF08A' ? '#1E293B' : '#FFFFFF' },
                    ]}
                    onPress={turnOffTorch}
                  >
                    <AppIcon
                      name="Power"
                      size={20}
                      color={torchColor === '#FFFFFF' || torchColor === '#FEF08A' ? '#FFFFFF' : '#1E293B'}
                    />
                    <Text
                      style={[
                        styles.torchExitBtnText,
                        { color: torchColor === '#FFFFFF' || torchColor === '#FEF08A' ? '#FFFFFF' : '#1E293B' },
                      ]}
                    >
                      Turn Off Flashlight
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Modal>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Screen Torch & Emergency Strobe</Text>
              <Text style={styles.cardSub}>
                Full-screen hardware brightness boost with safety strobe and SOS signaling.
              </Text>

              {/* Torch Preview Card */}
              <View
                style={[
                  styles.torchPreview,
                  torchActive && { backgroundColor: strobeVisible ? torchColor : '#0F172A' },
                ]}
              >
                <AppIcon
                  name={torchActive ? 'Sun' : 'Moon'}
                  size={44}
                  color={torchActive ? (torchColor === '#FFFFFF' || torchColor === '#FEF08A' ? '#CA8A04' : '#FFFFFF') : '#94A3B8'}
                />
                <Text
                  style={[
                    styles.torchStatus,
                    torchActive && (torchColor === '#EF4444' ? { color: '#FFF' } : {}),
                  ]}
                >
                  {torchActive ? `ILLUMINATION ACTIVE (${torchBrightness}%)` : 'TORCH STANDBY'}
                </Text>
              </View>

              {/* Illumination Color Presets */}
              <Text style={styles.label}>Light Color Mode</Text>
              <View style={styles.colorPillRow}>
                {[
                  { name: 'Pure White', hex: '#FFFFFF' },
                  { name: 'Warm Glow', hex: '#FEF08A' },
                  { name: 'Night Red', hex: '#EF4444' },
                  { name: 'Cool Blue', hex: '#38BDF8' },
                  { name: 'Amber', hex: '#F59E0B' },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.hex}
                    style={[
                      styles.colorPill,
                      torchColor === c.hex && styles.colorPillActive,
                    ]}
                    onPress={() => setTorchColor(c.hex)}
                  >
                    <View style={[styles.colorDot, { backgroundColor: c.hex }]} />
                    <Text
                      style={[
                        styles.colorPillText,
                        torchColor === c.hex && styles.colorPillTextActive,
                      ]}
                    >
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Signal Pattern */}
              <Text style={styles.label}>Signal Mode</Text>
              <View style={styles.pillRow}>
                {(['steady', 'sos', 'strobe'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.pill, torchMode === m && styles.pillActive]}
                    onPress={() => setTorchMode(m)}
                  >
                    <Text style={[styles.pillText, torchMode === m && styles.pillTextActive]}>
                      {m === 'steady' ? 'Steady Beam' : m === 'sos' ? 'SOS Morse (... --- ...)' : 'Hazard Strobe'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Brightness Presets */}
              <Text style={styles.label}>Screen Lumens (Brightness)</Text>
              <View style={styles.pillRow}>
                {[25, 50, 75, 100].map((pct) => (
                  <TouchableOpacity
                    key={pct}
                    style={[styles.pill, torchBrightness === pct && styles.pillActive]}
                    onPress={() => handleBrightnessChange(pct)}
                  >
                    <Text style={[styles.pillText, torchBrightness === pct && styles.pillTextActive]}>
                      {pct}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <PrimaryButton
                title={torchActive ? 'Turn Off Flashlight' : 'Activate Full-Screen Torch'}
                icon={torchActive ? 'Power' : 'Zap'}
                onPress={torchActive ? turnOffTorch : turnOnTorch}
              />
            </View>

            <AccessibilityResultCard
              title="Torch Light Controller"
              badge="Hardware Assist"
              primaryValue={torchActive ? `Light Active • ${torchMode.toUpperCase()}` : 'Flashlight Off'}
              primarySubtext={`Brightness: ${torchBrightness}% • Mode: ${torchMode}`}
              details="Provides maximum assistive lumens for low-light environments, dark rooms, and emergency SOS Morse code signaling (... --- ...)."
              metadata={[
                { label: 'Torch State', value: torchActive ? 'ON' : 'OFF' },
                { label: 'Signal Mode', value: torchMode.toUpperCase() },
                { label: 'Brightness', value: `${torchBrightness}%` },
              ]}
              copyContent={`Torch: ${torchActive ? 'ON' : 'OFF'} (${torchMode}, ${torchBrightness}%)`}
            />
          </View>
        )}

        {/* TOOL 453: Screen Color Picker */}
        {activeToolId === 453 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Screen Color Picker</Text>
              <View style={[styles.colorPreviewLarge, { backgroundColor: pickedColor }]} />
              <Text style={styles.label}>Selected Color Hex</Text>
              <TextInput
                style={styles.input}
                value={pickedColor}
                onChangeText={setPickedColor}
                placeholder="#4F46E5"
              />

              <Text style={styles.label}>Preset Swatches</Text>
              <View style={styles.swatchGrid}>
                {['#4F46E5', '#2563EB', '#059669', '#D97706', '#DC2626', '#9333EA', '#0F172A', '#FFFFFF'].map(
                  (hex) => (
                    <TouchableOpacity
                      key={hex}
                      style={[styles.swatchCircle, { backgroundColor: hex }]}
                      onPress={() => setPickedColor(hex)}
                    />
                  )
                )}
              </View>
            </View>

            <AccessibilityResultCard
              title={`Color ${pickedColor.toUpperCase()}`}
              badge="Perceptual Color"
              primaryValue={pickedColor.toUpperCase()}
              details={`Hex: ${pickedColor}\nsRGB Matrix evaluated offline.`}
              metadata={[
                { label: 'Format', value: 'Hex Code' },
                { label: 'Color Value', value: pickedColor },
              ]}
              copyContent={pickedColor}
            />
          </View>
        )}

        {/* TOOL 454: Text Size Preview */}
        {activeToolId === 454 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Text Size Previewer</Text>
              <Text style={styles.label}>Select Font Size: {fontSizePreview}pt</Text>
              <View style={styles.pillRow}>
                {[14, 18, 22, 28, 36, 44].map((sz) => (
                  <TouchableOpacity
                    key={sz}
                    style={[styles.pill, fontSizePreview === sz && styles.pillActive]}
                    onPress={() => setFontSizePreview(sz)}
                  >
                    <Text style={[styles.pillText, fontSizePreview === sz && styles.pillTextActive]}>
                      {sz}pt
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.fontSampleContainer}>
                <Text style={[styles.dynamicSampleText, { fontSize: fontSizePreview, lineHeight: fontSizePreview * 1.4 }]}>
                  The quick brown fox jumps over the lazy dog.
                </Text>
              </View>
            </View>

            <AccessibilityResultCard
              title="Typography Scale Assessment"
              badge="Legibility Scale"
              primaryValue={`${fontSizePreview}pt Font Size`}
              primarySubtext={`Recommended Line Height: ${Math.round(fontSizePreview * 1.4)}pt`}
              details={`Large text (18pt bold or 24pt regular) reduces ocular fatigue and meets standard accessible user reading thresholds.`}
              metadata={[
                { label: 'Font Size', value: `${fontSizePreview}pt` },
                { label: 'Line Height', value: `${Math.round(fontSizePreview * 1.4)}pt` },
              ]}
              copyContent={`Font: ${fontSizePreview}pt`}
            />
          </View>
        )}

        {/* TOOL 455: Contrast Checker */}
        {activeToolId === 455 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>WCAG 2.1 Contrast Checker</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Foreground Text</Text>
                  <TextInput
                    style={styles.input}
                    value={fgColor}
                    onChangeText={setFgColor}
                    placeholder="#FFFFFF"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Background Color</Text>
                  <TextInput
                    style={styles.input}
                    value={bgColor}
                    onChangeText={setBgColor}
                    placeholder="#4F46E5"
                  />
                </View>
              </View>

              <View
                style={[
                  styles.contrastPreviewBox,
                  { backgroundColor: bgColor },
                ]}
              >
                <Text style={[styles.contrastPreviewText, { color: fgColor }]}>
                  Sample Text on Background
                </Text>
              </View>
            </View>

            <AccessibilityResultCard
              title={`Contrast Ratio ${contrastResult.ratioFormatted}`}
              badge={contrastResult.isNormalTextAA ? 'WCAG Compliant' : 'WCAG Non-Compliant'}
              primaryValue={contrastResult.ratingDescription}
              primarySubtext={`Foreground: ${fgColor} • Background: ${bgColor}`}
              details={`Evaluation Results:\n• Normal Text AA (>= 4.5:1): ${contrastResult.isNormalTextAA ? 'PASS ✅' : 'FAIL ❌'}\n• Normal Text AAA (>= 7.0:1): ${contrastResult.isNormalTextAAA ? 'PASS ✅' : 'FAIL ❌'}\n• Large Text AA (>= 3.0:1): ${contrastResult.isLargeTextAA ? 'PASS ✅' : 'FAIL ❌'}\n• Large Text AAA (>= 4.5:1): ${contrastResult.isLargeTextAAA ? 'PASS ✅' : 'FAIL ❌'}`}
              metadata={[
                { label: 'Contrast Ratio', value: contrastResult.ratioFormatted },
                { label: 'Normal AA', value: contrastResult.isNormalTextAA ? 'Pass' : 'Fail' },
                { label: 'Normal AAA', value: contrastResult.isNormalTextAAA ? 'Pass' : 'Fail' },
                { label: 'Large AA', value: contrastResult.isLargeTextAA ? 'Pass' : 'Fail' },
              ]}
              copyContent={`Ratio: ${contrastResult.ratioFormatted} - ${contrastResult.ratingDescription}`}
            />
          </View>
        )}

        {/* TOOL 456: Color Blindness Simulator */}
        {activeToolId === 456 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Color Blindness Simulator</Text>
              <Text style={styles.label}>Base Color Hex</Text>
              <TextInput
                style={styles.input}
                value={simBaseColor}
                onChangeText={setSimBaseColor}
                placeholder="#DC2626"
              />

              <Text style={styles.label}>Deficiency Type</Text>
              <View style={styles.pillRow}>
                {(['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pill, simDeficiency === d && styles.pillActive]}
                    onPress={() => setSimDeficiency(d)}
                  >
                    <Text style={[styles.pillText, simDeficiency === d && styles.pillTextActive]}>
                      {d.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.label}>Original Color</Text>
                  <View style={[styles.swatchLarge, { backgroundColor: simBaseColor }]} />
                  <Text style={styles.hexCaption}>{simBaseColor}</Text>
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={styles.label}>{simDeficiency.toUpperCase()}</Text>
                  <View style={[styles.swatchLarge, { backgroundColor: simulatedHex }]} />
                  <Text style={styles.hexCaption}>{simulatedHex}</Text>
                </View>
              </View>
            </View>

            <AccessibilityResultCard
              title={`${simDeficiency.toUpperCase()} Simulation`}
              badge="Vision Deficiency"
              primaryValue={`Perceived as ${simulatedHex}`}
              primarySubtext={`Original: ${simBaseColor}`}
              details={`Simulated using sRGB color deficiency conversion matrix for ${simDeficiency}.`}
              metadata={[
                { label: 'Deficiency', value: simDeficiency },
                { label: 'Original', value: simBaseColor },
                { label: 'Simulated', value: simulatedHex },
              ]}
              copyContent={`Original: ${simBaseColor}, Simulated: ${simulatedHex}`}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  selectorWrapper: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#C7D2FE',
    justifyContent: 'center',
  },
  selectorScroll: {
    height: 52,
    flexGrow: 0,
  },
  selectorBar: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toolPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#3730A3',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3730A3',
  },
  toolPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: Spacing.sm,
  },
  fullScreenTorch: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: 50,
  },
  torchOverlayTop: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: Radius.lg,
  },
  torchOverlayBadge: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  torchOverlayHint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  torchOverlayBottom: {
    alignItems: 'center',
  },
  torchExitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  torchExitBtnText: {
    fontSize: 14,
    fontWeight: '800',
  },
  colorPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  colorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  colorPillActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.15)',
  },
  colorPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  colorPillTextActive: {
    color: '#4F46E5',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  magnifierViewport: {
    height: 140,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  sampleContentBox: {
    alignItems: 'center',
  },
  sampleContentBoxInverted: {
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: Radius.sm,
  },
  sampleText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  sampleTextInverted: {
    color: '#F8FAFC',
  },
  sampleSub: {
    fontSize: 10,
    color: '#64748B',
  },
  sampleSubInverted: {
    color: '#94A3B8',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.md,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  pillActive: {
    backgroundColor: '#4F46E5',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  controlBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#3730A3',
  },
  controlBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  controlBtnTextActive: {
    color: '#FFFFFF',
  },
  torchPreview: {
    height: 120,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  torchStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: '#334155',
    marginTop: 8,
  },
  colorPreviewLarge: {
    height: 80,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  swatchGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  swatchCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  fontSampleContainer: {
    backgroundColor: '#EEF2FF',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  dynamicSampleText: {
    color: '#1E293B',
  },
  contrastPreviewBox: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  contrastPreviewText: {
    fontSize: 16,
    fontWeight: '700',
  },
  swatchLarge: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginTop: 4,
  },
  hexCaption: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
});
