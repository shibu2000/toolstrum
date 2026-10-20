import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { useAppStore } from '../../../store/useAppStore';
import { calculateTextMetrics } from './shared/TextHelpers';
import { TextResultCard, TextStatItem } from './shared/TextResultCard';
import { getTextToolConfig } from './textConfig';

interface TextCountersWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_SAMPLE =
  'Toolstrum brings together 500 essential utilities in one lightweight, on-device mobile application. Fast, completely private, and engineered for local-first reliability. No external telemetry or cloud servers are required.';

export const TextCountersWorkspace: React.FC<TextCountersWorkspaceProps> = ({
  initialToolId = 205,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const [text, setText] = useState<string>('');
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getTextToolConfig(activeToolId);

  const metrics = useMemo(() => calculateTextMetrics(text), [text]);

  const handleCopySummary = async () => {
    const summary = `Text Analysis Summary:
- Words: ${metrics.words} (Unique: ${metrics.uniqueWords})
- Characters: ${metrics.characters} (No spaces: ${metrics.charactersNoSpaces})
- Sentences: ${metrics.sentences}
- Paragraphs: ${metrics.paragraphs}
- Reading Time: ${metrics.readingTimeMinutes} min (200 wpm)
- Speaking Time: ${metrics.speakingTimeMinutes} min (130 wpm)
- Readability Ease: ${metrics.fleschReadingEase}/100 (${metrics.readingLevelDescription})
- Grade Level: ${metrics.fleschKincaidGrade}`;

    await Clipboard.setStringAsync(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);

    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Text Statistics'}`,
      subtitle: `${metrics.words} words · ${metrics.characters} chars`,
    });
  };

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Text statistics summary preserved locally.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Text Statistics'} Report`,
      subtitle: `Metrics for ${metrics.words} words`,
    });
  };

  const statItems: TextStatItem[] = [
    { label: 'Words', value: metrics.words },
    { label: 'Unique', value: metrics.uniqueWords },
    { label: 'Characters', value: metrics.characters },
    { label: 'No Spaces', value: metrics.charactersNoSpaces },
    { label: 'Sentences', value: metrics.sentences },
    { label: 'Paragraphs', value: metrics.paragraphs },
    { label: 'Read Time', value: `${metrics.readingTimeMinutes}m` },
    { label: 'Speak Time', value: `${metrics.speakingTimeMinutes}m` },
  ];

  const toolsInWorkspace = [
    { id: 205, name: 'Word Counter' },
    { id: 206, name: 'Char Counter' },
    { id: 207, name: 'Sentences' },
    { id: 208, name: 'Paragraphs' },
    { id: 209, name: 'Reading Time' },
    { id: 234, name: 'Statistics' },
    { id: 237, name: 'Readability' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Text Counter & Statistics'}
        subtitle="Text Studio · Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(activeToolId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon
              name="star"
              size={22}
              color={favorited ? Colors.statusWarning : Colors.textMuted}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield />

        {/* Tool Mode Pill Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillContainer}
        >
          {toolsInWorkspace.map((item) => {
            const isActive = item.id === activeToolId;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveToolId(item.id)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Input Text Area Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.sectionTitle}>Input Text</Text>
            <View style={styles.inputHeaderActions}>
              <TouchableOpacity
                onPress={() => setText(DEFAULT_SAMPLE)}
                style={styles.actionChip}
              >
                <Text style={styles.actionChipText}>Sample</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setText('')}
                style={[styles.actionChip, { backgroundColor: '#FEE2E2' }]}
              >
                <Text style={[styles.actionChipText, { color: Colors.statusError }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Type, paste, or inspect text here..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={setText}
            textAlignVertical="top"
          />

          <View style={styles.inputMetaFooter}>
            <Text style={styles.metaBadge}>{metrics.words} words</Text>
            <Text style={styles.metaBadge}>{metrics.characters} chars</Text>
            <Text style={styles.metaBadge}>{metrics.lines} lines</Text>
          </View>
        </View>

        {/* Readability & Gauge Card (Highlighted for Readability & Stats tools) */}
        {(activeToolId === 237 || activeToolId === 234) && (
          <View style={styles.readabilityCard}>
            <View style={styles.readabilityHeader}>
              <Text style={styles.readabilityTitle}>Readability Index</Text>
              <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{metrics.fleschReadingEase} / 100</Text>
              </View>
            </View>
            <Text style={styles.scoreDescription}>{metrics.readingLevelDescription}</Text>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressBar,
                  { width: `${Math.max(5, Math.min(100, metrics.fleschReadingEase))}%` },
                ]}
              />
            </View>
            <View style={styles.readabilitySubGrid}>
              <View style={styles.readabilitySubItem}>
                <Text style={styles.subItemVal}>Grade {metrics.fleschKincaidGrade}</Text>
                <Text style={styles.subItemLabel}>Kincaid Grade</Text>
              </View>
              <View style={styles.readabilitySubItem}>
                <Text style={styles.subItemVal}>{metrics.syllables}</Text>
                <Text style={styles.subItemLabel}>Total Syllables</Text>
              </View>
              <View style={styles.readabilitySubItem}>
                <Text style={styles.subItemVal}>
                  {metrics.words > 0
                    ? Math.round((metrics.uniqueWords / metrics.words) * 100)
                    : 0}
                  %
                </Text>
                <Text style={styles.subItemLabel}>Lexical Diversity</Text>
              </View>
            </View>
          </View>
        )}

        {/* Primary Metrics Result Card */}
        <TextResultCard
          title={toolConfig?.name || 'Live Text Metrics'}
          subtitle={toolConfig?.description}
          badgeText="Live Offline Analysis"
          stats={statItems}
          content={text}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="text-metrics-report.txt"
        />

        {/* Copy Formatted Report Button */}
        <TouchableOpacity style={styles.copySummaryBtn} onPress={handleCopySummary}>
          <AppIcon
            name={copiedSummary ? 'Check' : 'Copy'}
            size={18}
            color={Colors.surfaceWhite}
          />
          <Text style={styles.copySummaryBtnText}>
            {copiedSummary ? 'Copied Full Report' : 'Copy Full Analysis Report'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  favBtn: {
    padding: 6,
  },
  pillScroll: {
    marginBottom: Spacing.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillActive: {
    backgroundColor: Colors.accentOrange,
    borderColor: Colors.accentOrange,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  pillTextActive: {
    color: Colors.surfaceWhite,
  },
  inputCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  inputHeaderActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.surfaceText,
    borderRadius: Radius.sm,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentOrange,
  },
  textInput: {
    minHeight: 120,
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  inputMetaFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.xs,
  },
  metaBadge: {
    fontSize: 11,
    color: Colors.textMuted,
    backgroundColor: Colors.surfaceBackground,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  readabilityCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  readabilityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readabilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  scoreBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  scoreText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  scoreDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginVertical: 4,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accentOrange,
    borderRadius: 4,
  },
  readabilitySubGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.xs,
  },
  readabilitySubItem: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
    padding: 8,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  subItemVal: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subItemLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  copySummaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.onSurface,
    paddingVertical: 14,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  copySummaryBtnText: {
    color: Colors.surfaceWhite,
    fontSize: 14,
    fontWeight: '600',
  },
});
