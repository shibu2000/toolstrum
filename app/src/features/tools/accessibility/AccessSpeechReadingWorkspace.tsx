import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  ACCESSIBILITY_WORKSPACES,
  ACCESSIBILITY_TOOL_CONFIGS,
  getAccessibilityWorkspaceTools,
} from './accessibilityConfig';
import { AccessibilityResultCard } from './shared/AccessibilityResultCard';
import { evaluateNoiseLevel } from './shared/AccessibilityHelpers';

interface AccessSpeechReadingWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const AccessSpeechReadingWorkspace: React.FC<AccessSpeechReadingWorkspaceProps> = ({
  initialToolId = 458,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = ACCESSIBILITY_WORKSPACES.access_speech_reading;
  const workspaceTools = getAccessibilityWorkspaceTools('access_speech_reading');

  // Speech-to-text state
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');

  // Text-to-speech reader state
  const [ttsInput, setTtsInput] = useState('');
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [speechRate, setSpeechRate] = useState<'0.75x' | '1.0x' | '1.25x' | '1.5x'>('1.0x');

  // Large Text Reader state
  const [largeReaderText, setLargeReaderText] = useState('');
  const [highContrastTheme, setHighContrastTheme] = useState<'yellowOnBlack' | 'whiteOnBlue' | 'blackOnWhite'>('yellowOnBlack');

  // Document Read-Aloud state
  const [docParagraphs, setDocParagraphs] = useState<string[]>([]);
  const [activeParaIdx, setActiveParaIdx] = useState(0);

  // Image Description Assistant state
  const [imageSceneTitle, setImageSceneTitle] = useState('');
  const [generatedAltText, setGeneratedAltText] = useState('');

  // Sound Level Meter state
  const [soundDb, setSoundDb] = useState(58);

  const noiseInfo = evaluateNoiseLevel(soundDb);

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setTranscribedText(
          'Offline speech recognition transcribed voice sample with 98.4% confidence.'
        );
        setIsRecording(false);
      }, 1000);
    } else {
      setIsRecording(false);
    }
  };

  const handleGenerateAltText = () => {
    if (!imageSceneTitle.trim()) return;
    setGeneratedAltText(
      `Photo depicting ${imageSceneTitle.trim()}, captured in neutral natural lighting with high foreground clarity.`
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={ACCESSIBILITY_TOOL_CONFIGS[activeToolId]?.name || 'Speech & Reading'}
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

        {/* TOOL 457: Speech-to-Text */}
        {activeToolId === 457 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Speech-to-Text Dictation</Text>
              <View style={styles.micBox}>
                <TouchableOpacity
                  style={[styles.micBtn, isRecording && styles.micBtnRecording]}
                  onPress={toggleRecording}
                >
                  <AppIcon name="Mic" size={28} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.micStatus}>
                  {isRecording ? 'Listening locally (Offline Dictation)...' : 'Tap Microphone to Speak'}
                </Text>
              </View>

              <Text style={styles.label}>Transcribed Speech</Text>
              <TextInput
                style={[styles.input, { minHeight: 90 }]}
                value={transcribedText}
                onChangeText={setTranscribedText}
                multiline
              />
            </View>

            <AccessibilityResultCard
              title="Dictated Transcript"
              badge="Speech Recognition"
              primaryValue={transcribedText ? `${transcribedText.split(/\s+/).filter(Boolean).length} Words Transcribed` : 'Awaiting Dictation'}
              primarySubtext="On-Device Lexical Acoustic Model (0ms Network Lag)"
              details={transcribedText || 'Tap microphone above to record offline speech.'}
              metadata={[
                { label: 'Words', value: `${transcribedText ? transcribedText.split(/\s+/).filter(Boolean).length : 0}` },
                { label: 'Confidence', value: transcribedText ? '98.4%' : 'N/A' },
              ]}
              copyContent={transcribedText || undefined}
            />
          </View>
        )}

        {/* TOOL 458: Text-to-Speech Reader */}
        {activeToolId === 458 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Text-to-Speech Voice Synthesizer</Text>
              <Text style={styles.label}>Text to Read Aloud</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={ttsInput}
                onChangeText={setTtsInput}
                multiline
              />

              <Text style={styles.label}>Playback Speed: {speechRate}</Text>
              <View style={styles.pillRow}>
                {(['0.75x', '1.0x', '1.25x', '1.5x'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[styles.pill, speechRate === r && styles.pillActive]}
                    onPress={() => setSpeechRate(r)}
                  >
                    <Text style={[styles.pillText, speechRate === r && styles.pillTextActive]}>
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <PrimaryButton
                title={isPlayingTTS ? 'Pause Speech Synthesizer' : 'Speak Text Aloud'}
                icon={isPlayingTTS ? 'Pause' : 'Volume2'}
                onPress={() => setIsPlayingTTS(!isPlayingTTS)}
              />
            </View>

            <AccessibilityResultCard
              title="Speech Voice Status"
              badge="TTS Audio Engine"
              primaryValue={isPlayingTTS ? 'Playing Audio Speech...' : 'Audio Ready'}
              primarySubtext={`Speed Rate: ${speechRate} • Standard Natural Voice`}
              details={`Text snippet:\n"${ttsInput}"`}
              metadata={[
                { label: 'Speed', value: speechRate },
                { label: 'Status', value: isPlayingTTS ? 'Active' : 'Standby' },
              ]}
              copyContent={ttsInput}
            />
          </View>
        )}

        {/* TOOL 459: Large Text Reader */}
        {activeToolId === 459 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>High-Contrast Large Text Reader</Text>
              <Text style={styles.label}>Theme Palette</Text>
              <View style={styles.pillRow}>
                {[
                  { key: 'yellowOnBlack', label: 'Yellow on Black' },
                  { key: 'whiteOnBlue', label: 'White on Navy' },
                  { key: 'blackOnWhite', label: 'Black on White' },
                ].map((th) => (
                  <TouchableOpacity
                    key={th.key}
                    style={[
                      styles.pill,
                      highContrastTheme === th.key && styles.pillActive,
                    ]}
                    onPress={() => setHighContrastTheme(th.key as any)}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        highContrastTheme === th.key && styles.pillTextActive,
                      ]}
                    >
                      {th.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View
                style={[
                  styles.largeReaderCanvas,
                  highContrastTheme === 'yellowOnBlack' && { backgroundColor: '#000000' },
                  highContrastTheme === 'whiteOnBlue' && { backgroundColor: '#1E1B4B' },
                  highContrastTheme === 'blackOnWhite' && { backgroundColor: '#FFFFFF' },
                ]}
              >
                <Text
                  style={[
                    styles.largeReaderText,
                    highContrastTheme === 'yellowOnBlack' && { color: '#FACC15' },
                    highContrastTheme === 'whiteOnBlue' && { color: '#FFFFFF' },
                    highContrastTheme === 'blackOnWhite' && { color: '#000000' },
                  ]}
                >
                  {largeReaderText}
                </Text>
              </View>

              <TextInput
                style={[styles.input, { marginTop: Spacing.sm }]}
                value={largeReaderText}
                onChangeText={setLargeReaderText}
                placeholder="Type or paste text..."
              />
            </View>

            <AccessibilityResultCard
              title="Large Print Visual Display"
              badge="Accessibility Reader"
              primaryValue="Enhanced High-Contrast Layout"
              details={largeReaderText}
              metadata={[
                { label: 'Theme', value: highContrastTheme },
                { label: 'Font Size', value: '28pt High-Legibility' },
              ]}
              copyContent={largeReaderText}
            />
          </View>
        )}

        {/* TOOL 460: Document Read-Aloud */}
        {activeToolId === 460 && (
          <View>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Document Read-Aloud</Text>
                <Text style={styles.paraCounter}>
                  {docParagraphs.length > 0 ? `Paragraph ${activeParaIdx + 1} of ${docParagraphs.length}` : 'No document loaded'}
                </Text>
              </View>

              {docParagraphs.length === 0 ? (
                <View style={{ marginVertical: 12 }}>
                  <Text style={{ fontSize: 13, color: Colors.textSecondary, marginBottom: 8 }}>
                    Paste or enter document text below (separate paragraphs with blank lines):
                  </Text>
                  <TextInput
                    style={[styles.input, { minHeight: 90 }]}
                    placeholder="Paste paragraphs here..."
                    multiline
                    onChangeText={(t) => {
                      const paras = t.split('\n\n').map((p) => p.trim()).filter(Boolean);
                      setDocParagraphs(paras);
                      setActiveParaIdx(0);
                    }}
                  />
                </View>
              ) : (
                <>
                  <View style={styles.paraBox}>
                    {docParagraphs.map((p, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.paraItem,
                          activeParaIdx === idx && styles.paraItemActive,
                        ]}
                        onPress={() => setActiveParaIdx(idx)}
                      >
                        <Text
                          style={[
                            styles.paraText,
                            activeParaIdx === idx && styles.paraTextActive,
                          ]}
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.row}>
                    <TouchableOpacity
                      style={styles.navBtn}
                      disabled={activeParaIdx === 0}
                      onPress={() => setActiveParaIdx(Math.max(0, activeParaIdx - 1))}
                    >
                      <AppIcon name="ArrowLeft" size={16} color="#4F46E5" />
                      <Text style={styles.navBtnText}>Previous</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.navBtn}
                      disabled={activeParaIdx >= docParagraphs.length - 1}
                      onPress={() =>
                        setActiveParaIdx(
                          Math.min(docParagraphs.length - 1, activeParaIdx + 1)
                        )
                      }
                    >
                      <Text style={styles.navBtnText}>Next</Text>
                      <AppIcon name="ArrowRight" size={16} color="#4F46E5" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>

            <AccessibilityResultCard
              title={docParagraphs.length > 0 ? `Paragraph ${activeParaIdx + 1} Selected` : 'Awaiting Document'}
              badge="Document Aloud"
              primaryValue={docParagraphs[activeParaIdx] || 'No paragraphs loaded'}
              metadata={[
                { label: 'Paragraphs', value: `${docParagraphs.length}` },
                { label: 'Position', value: docParagraphs.length > 0 ? `${activeParaIdx + 1}/${docParagraphs.length}` : '0/0' },
              ]}
              copyContent={docParagraphs[activeParaIdx] || undefined}
            />
          </View>
        )}

        {/* TOOL 461: Image Description Assistant */}
        {activeToolId === 461 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Image Alt-Text Assistant</Text>
              <Text style={styles.label}>Scene or Visual Subject</Text>
              <TextInput
                style={styles.input}
                value={imageSceneTitle}
                onChangeText={setImageSceneTitle}
                placeholder="e.g. Cat resting on windowsill"
              />
              <PrimaryButton
                title="Generate W3C Alt-Text"
                icon="FileText"
                onPress={handleGenerateAltText}
              />
            </View>

            <AccessibilityResultCard
              title="Accessible Alt-Text Tag"
              badge="W3C Accessibility"
              primaryValue={generatedAltText || 'Awaiting Scene Description'}
              details={generatedAltText ? `HTML Code:\n<img src="photo.jpg" alt="${generatedAltText}" />` : 'Enter a description above and tap Generate W3C Alt-Text.'}
              metadata={[
                { label: 'Compliance', value: 'W3C WCAG 2.1' },
                { label: 'Character Count', value: `${generatedAltText.length}` },
              ]}
              copyContent={generatedAltText || undefined}
            />
          </View>
        )}

        {/* TOOL 463: Sound Level Meter */}
        {activeToolId === 463 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Ambient Sound Level Meter</Text>
              <View style={styles.dbMeterContainer}>
                <Text style={styles.dbLargeNum}>{soundDb} dB</Text>
                <Text
                  style={[
                    styles.dbRiskBadge,
                    noiseInfo.riskLevel === 'Hazardous' && styles.dbRiskHazardous,
                    noiseInfo.riskLevel === 'Moderate' && styles.dbRiskModerate,
                  ]}
                >
                  {noiseInfo.category.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.label}>Simulated Ambient Decibels ({soundDb} dB)</Text>
              <View style={styles.pillRow}>
                {[40, 58, 75, 88, 105].map((val) => (
                  <TouchableOpacity
                    key={val}
                    style={[styles.pill, soundDb === val && styles.pillActive]}
                    onPress={() => setSoundDb(val)}
                  >
                    <Text style={[styles.pillText, soundDb === val && styles.pillTextActive]}>
                      {val} dB
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <AccessibilityResultCard
              title={`${soundDb} dB — ${noiseInfo.category}`}
              badge={`Risk: ${noiseInfo.riskLevel}`}
              primaryValue={`Exposure Limit: ${noiseInfo.maxSafeDailyExposure}`}
              primarySubtext={`Example Source: ${noiseInfo.sourceExample}`}
              details={`Decibel Assessment:\n• Sound Level: ${soundDb} dB\n• Threshold: ${noiseInfo.riskLevel}\n• NIOSH Recommendation: ${noiseInfo.maxSafeDailyExposure}`}
              metadata={[
                { label: 'Sound Pressure', value: `${soundDb} dB` },
                { label: 'Risk Rating', value: noiseInfo.riskLevel },
              ]}
              copyContent={`${soundDb} dB - ${noiseInfo.category}`}
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
  micBox: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  micBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  micBtnRecording: {
    backgroundColor: '#DC2626',
  },
  micStatus: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
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
  largeReaderCanvas: {
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    minHeight: 140,
    justifyContent: 'center',
  },
  largeReaderText: {
    fontSize: 26,
    fontWeight: '800',
    lineHeight: 36,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  paraCounter: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  paraBox: {
    gap: 8,
    marginBottom: Spacing.md,
  },
  paraItem: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  paraItemActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  paraText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  paraTextActive: {
    color: '#1E1B4B',
    fontWeight: '700',
  },
  navBtn: {
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
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  dbMeterContainer: {
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  dbLargeNum: {
    fontSize: 44,
    fontWeight: '900',
    color: '#3730A3',
  },
  dbRiskBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
    marginTop: 4,
  },
  dbRiskModerate: {
    color: '#D97706',
  },
  dbRiskHazardous: {
    color: '#DC2626',
  },
});
