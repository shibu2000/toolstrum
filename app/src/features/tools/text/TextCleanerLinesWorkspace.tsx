import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { useAppStore } from '../../../store/useAppStore';
import {
  toTitleCase,
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  toPascalCase,
  removeExtraSpaces,
  removeEmptyLines,
  removeDuplicateLines,
  sortLines,
  reverseText,
  findAndReplace,
} from './shared/TextHelpers';
import { TextResultCard, TextStatItem } from './shared/TextResultCard';
import { getTextToolConfig } from './textConfig';

interface TextCleanerLinesWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_SAMPLE = `   Toolstrum All-in-One Utility   
Toolstrum All-in-One Utility
Fast, Private, and Offline

Mobile Developer Tools
Mobile Developer Tools
Audio and Video Tools
Archive and PDF Tools

10. Version Ten
2. Version Two
1. Version One`;

export const TextCleanerLinesWorkspace: React.FC<TextCleanerLinesWorkspaceProps> = ({
  initialToolId = 210,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const [input, setInput] = useState<string>('');
  const [caseMode, setCaseMode] = useState<
    'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'kebab' | 'pascal'
  >('title');
  const [sortMode, setSortMode] = useState<'az' | 'za' | 'length_asc' | 'natural'>('az');
  const [reverseMode, setReverseMode] = useState<'chars' | 'words' | 'lines'>('lines');
  const [dedupCaseInsensitive, setDedupCaseInsensitive] = useState<boolean>(true);
  const [findQuery, setFindQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [caseSensitiveFind, setCaseSensitiveFind] = useState<boolean>(false);
  const [regexFind, setRegexFind] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getTextToolConfig(activeToolId);

  // Compute processed text based on active tool
  const processedText = useMemo(() => {
    if (!input) return '';

    switch (activeToolId) {
      case 210: {
        // Case Converter
        switch (caseMode) {
          case 'upper':
            return input.toUpperCase();
          case 'lower':
            return input.toLowerCase();
          case 'title':
            return toTitleCase(input);
          case 'camel':
            return toCamelCase(input);
          case 'snake':
            return toSnakeCase(input);
          case 'kebab':
            return toKebabCase(input);
          case 'pascal':
            return toPascalCase(input);
          default:
            return input;
        }
      }
      case 211: {
        // Remove Extra Spaces
        return removeExtraSpaces(input);
      }
      case 212: {
        // Remove Empty Lines
        return removeEmptyLines(input);
      }
      case 213: {
        // Remove Duplicate Lines
        return removeDuplicateLines(input, dedupCaseInsensitive);
      }
      case 214: {
        // Sort Lines
        return sortLines(input, sortMode);
      }
      case 215: {
        // Reverse Text
        return reverseText(input, reverseMode);
      }
      case 216: {
        // Find & Replace
        return findAndReplace(input, findQuery, replaceQuery, caseSensitiveFind, regexFind);
      }
      default:
        return input;
    }
  }, [
    input,
    activeToolId,
    caseMode,
    sortMode,
    reverseMode,
    dedupCaseInsensitive,
    findQuery,
    replaceQuery,
    caseSensitiveFind,
    regexFind,
  ]);

  const handleApplyToInput = () => {
    setInput(processedText);
    Alert.alert('Applied', 'Processed text has been loaded into the input editor.');
  };

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Cleaned text output saved to workspace storage.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Text Cleaner'} Output`,
      subtitle: `${processedText.length} characters processed`,
    });
  };

  const statItems: TextStatItem[] = [
    { label: 'Input Chars', value: input.length },
    { label: 'Output Chars', value: processedText.length },
    { label: 'Input Lines', value: input.split('\n').length },
    { label: 'Output Lines', value: processedText.split('\n').length },
  ];

  const toolsInWorkspace = [
    { id: 210, name: 'Case Converter' },
    { id: 211, name: 'Extra Spaces' },
    { id: 212, name: 'Empty Lines' },
    { id: 213, name: 'Dedup Lines' },
    { id: 214, name: 'Sort Lines' },
    { id: 215, name: 'Reverse Text' },
    { id: 216, name: 'Find & Replace' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Text Cleaner & Line Operations'}
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

        {/* Operation Controls Bar */}
        <View style={styles.controlsCard}>
          <Text style={styles.controlsTitle}>Operation Settings</Text>

          {/* Case Converter Controls (210) */}
          {activeToolId === 210 && (
            <View style={styles.opGrid}>
              {[
                { id: 'upper', label: 'UPPERCASE' },
                { id: 'lower', label: 'lowercase' },
                { id: 'title', label: 'Title Case' },
                { id: 'camel', label: 'camelCase' },
                { id: 'snake', label: 'snake_case' },
                { id: 'kebab', label: 'kebab-case' },
                { id: 'pascal', label: 'PascalCase' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.opBtn, caseMode === opt.id && styles.opBtnActive]}
                  onPress={() => setCaseMode(opt.id as any)}
                >
                  <Text style={[styles.opBtnText, caseMode === opt.id && styles.opBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Sort Lines Controls (214) */}
          {activeToolId === 214 && (
            <View style={styles.opGrid}>
              {[
                { id: 'az', label: 'A to Z' },
                { id: 'za', label: 'Z to A' },
                { id: 'length_asc', label: 'By Length' },
                { id: 'natural', label: 'Natural Numeric' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.opBtn, sortMode === opt.id && styles.opBtnActive]}
                  onPress={() => setSortMode(opt.id as any)}
                >
                  <Text style={[styles.opBtnText, sortMode === opt.id && styles.opBtnTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Reverse Text Controls (215) */}
          {activeToolId === 215 && (
            <View style={styles.opGrid}>
              {[
                { id: 'lines', label: 'Reverse Lines' },
                { id: 'words', label: 'Reverse Words' },
                { id: 'chars', label: 'Reverse Characters' },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.opBtn, reverseMode === opt.id && styles.opBtnActive]}
                  onPress={() => setReverseMode(opt.id as any)}
                >
                  <Text
                    style={[styles.opBtnText, reverseMode === opt.id && styles.opBtnTextActive]}
                  >
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Dedup Lines Controls (213) */}
          {activeToolId === 213 && (
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Case-Insensitive Deduplication</Text>
              <Switch
                value={dedupCaseInsensitive}
                onValueChange={setDedupCaseInsensitive}
                trackColor={{ false: '#E2E8F0', true: Colors.accentOrange }}
              />
            </View>
          )}

          {/* Find & Replace Controls (216) */}
          {activeToolId === 216 && (
            <View style={styles.findReplaceBox}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Find</Text>
                <TextInput
                  style={styles.singleLineInput}
                  value={findQuery}
                  onChangeText={setFindQuery}
                  placeholder="String to find..."
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Replace With</Text>
                <TextInput
                  style={styles.singleLineInput}
                  value={replaceQuery}
                  onChangeText={setReplaceQuery}
                  placeholder="Replacement string..."
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.togglesRow}>
                <TouchableOpacity
                  style={[styles.toggleChip, caseSensitiveFind && styles.toggleChipActive]}
                  onPress={() => setCaseSensitiveFind(!caseSensitiveFind)}
                >
                  <Text
                    style={[
                      styles.toggleChipText,
                      caseSensitiveFind && styles.toggleChipTextActive,
                    ]}
                  >
                    Match Case
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleChip, regexFind && styles.toggleChipActive]}
                  onPress={() => setRegexFind(!regexFind)}
                >
                  <Text style={[styles.toggleChipText, regexFind && styles.toggleChipTextActive]}>
                    Regular Expression
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Direct information text for 211 & 212 */}
          {(activeToolId === 211 || activeToolId === 212) && (
            <Text style={styles.infoHintText}>
              {activeToolId === 211
                ? 'Automatically collapses duplicate spaces to single spaces and trims leading/trailing whitespace across all lines.'
                : 'Instantly filters out empty lines, blank whitespace rows, and carriage returns.'}
            </Text>
          )}
        </View>

        {/* Input Text Area */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.sectionTitle}>Input Text</Text>
            <View style={styles.inputHeaderActions}>
              <TouchableOpacity
                onPress={() => setInput(DEFAULT_SAMPLE)}
                style={styles.actionChip}
              >
                <Text style={styles.actionChipText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInput('')}
                style={[styles.actionChip, { backgroundColor: '#FEE2E2' }]}
              >
                <Text style={[styles.actionChipText, { color: Colors.statusError }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Enter lines or text to clean..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            textAlignVertical="top"
          />
        </View>

        {/* Result Card */}
        <TextResultCard
          title={toolConfig?.name || 'Processed Result'}
          subtitle={toolConfig?.description}
          badgeText="Realtime Cleaned"
          stats={statItems}
          content={processedText}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="cleaned-text.txt"
        />

        {/* Feed back into input button */}
        <TouchableOpacity style={styles.feedbackBtn} onPress={handleApplyToInput}>
          <AppIcon name="RefreshCw" size={16} color={Colors.accentOrange} />
          <Text style={styles.feedbackBtnText}>Replace Input with Result</Text>
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
  controlsCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  controlsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  opGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  opBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  opBtnActive: {
    backgroundColor: Colors.accentOrange,
    borderColor: Colors.accentOrange,
  },
  opBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  opBtnTextActive: {
    color: Colors.surfaceWhite,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  switchLabel: {
    fontSize: 13,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  findReplaceBox: {
    gap: 8,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  singleLineInput: {
    height: 38,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Colors.onSurface,
    backgroundColor: '#FAFAFA',
  },
  togglesRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  toggleChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  toggleChipActive: {
    backgroundColor: Colors.surfaceText,
    borderColor: Colors.accentOrange,
  },
  toggleChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  toggleChipTextActive: {
    color: Colors.accentOrange,
  },
  infoHintText: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
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
    minHeight: 100,
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  feedbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceText,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  feedbackBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accentOrange,
  },
});
