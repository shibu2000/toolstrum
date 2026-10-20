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
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { useAppStore } from '../../../store/useAppStore';
import {
  computeTextDiff,
  splitText,
  mergeText,
  repeatText,
  textToSlug,
  slugToText,
  TextDiffResult,
} from './shared/TextHelpers';
import { TextResultCard, TextStatItem } from './shared/TextResultCard';
import { getTextToolConfig } from './textConfig';

interface TextTransformDiffWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_ORIGINAL = `Toolstrum Utility Suite
Version 1.0.0
Fast and Private
Built with React Native`;

const DEFAULT_MODIFIED = `Toolstrum Utility Suite
Version 1.1.0
Fast, Private, and 100% Offline
Built with React Native & TypeScript`;

export const TextTransformDiffWorkspace: React.FC<TextTransformDiffWorkspaceProps> = ({
  initialToolId = 217,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  // Diff states (217)
  const [diffOriginal, setDiffOriginal] = useState<string>('');
  const [diffModified, setDiffModified] = useState<string>('');

  // Splitter states (218)
  const [splitInput, setSplitInput] = useState<string>('');
  const [splitMode, setSplitMode] = useState<'delimiter' | 'char_length' | 'words'>('delimiter');
  const [splitDelimiter, setSplitDelimiter] = useState<string>(',');
  const [splitChunkSize, setSplitChunkSize] = useState<string>('20');

  // Merger states (219)
  const [mergeInput, setMergeInput] = useState<string>('');
  const [mergeDelimiter, setMergeDelimiter] = useState<string>('\n---\n');
  const [mergeNumbered, setMergeNumbered] = useState<boolean>(true);

  // Repeater states (220)
  const [repeatInput, setRepeatInput] = useState<string>('');
  const [repeatCount, setRepeatCount] = useState<number>(5);
  const [repeatDelimiter, setRepeatDelimiter] = useState<string>('\n');
  const [repeatNumbered, setRepeatNumbered] = useState<boolean>(true);

  // Slug states (221 & 222)
  const [slugInput, setSlugInput] = useState<string>('');
  const [slugSeparator, setSlugSeparator] = useState<string>('-');
  const [slugToTextInput, setSlugToTextInput] = useState<string>('');

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getTextToolConfig(activeToolId);

  // Diff result calculation
  const diffResult: TextDiffResult = useMemo(() => {
    return computeTextDiff(diffOriginal, diffModified);
  }, [diffOriginal, diffModified]);

  // General transformation result
  const transformResult = useMemo(() => {
    switch (activeToolId) {
      case 217: {
        return diffResult.lines
          .map((l) => `${l.type === 'added' ? '+' : l.type === 'deleted' ? '-' : ' '} ${l.text}`)
          .join('\n');
      }
      case 218: {
        const size = parseInt(splitChunkSize, 10) || 10;
        const chunks = splitText(splitInput, splitMode, {
          delimiter: splitDelimiter,
          chunkSize: size,
        });
        return chunks.map((c, i) => `[Part ${i + 1}] ${c}`).join('\n');
      }
      case 219: {
        const chunks = mergeInput.split('\n').filter(Boolean);
        return mergeText(chunks, mergeDelimiter, '', '', mergeNumbered);
      }
      case 220: {
        return repeatText(repeatInput, repeatCount, repeatDelimiter, repeatNumbered);
      }
      case 221: {
        return textToSlug(slugInput, slugSeparator);
      }
      case 222: {
        return slugToText(slugToTextInput);
      }
      default:
        return '';
    }
  }, [
    activeToolId,
    diffResult,
    splitInput,
    splitMode,
    splitDelimiter,
    splitChunkSize,
    mergeInput,
    mergeDelimiter,
    mergeNumbered,
    repeatInput,
    repeatCount,
    repeatDelimiter,
    repeatNumbered,
    slugInput,
    slugSeparator,
    slugToTextInput,
  ]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Transformed text preserved in local workspace.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Text Transform'} Output`,
      subtitle: `${transformResult.length} characters generated`,
    });
  };

  const statItems: TextStatItem[] = useMemo(() => {
    if (activeToolId === 217) {
      return [
        { label: 'Similarity', value: `${diffResult.similarityPercentage}%` },
        { label: 'Additions', value: `+${diffResult.additions}` },
        { label: 'Deletions', value: `-${diffResult.deletions}` },
        { label: 'Unchanged', value: diffResult.unchanged },
      ];
    }
    if (activeToolId === 218) {
      const chunks = transformResult.split('\n').filter(Boolean);
      return [
        { label: 'Chunks', value: chunks.length },
        { label: 'Input Length', value: splitInput.length },
      ];
    }
    if (activeToolId === 220) {
      return [
        { label: 'Repeats', value: repeatCount },
        { label: 'Total Output', value: transformResult.length },
      ];
    }
    return [
      { label: 'Characters', value: transformResult.length },
      { label: 'Lines', value: transformResult.split('\n').length },
    ];
  }, [activeToolId, diffResult, splitInput, repeatCount, transformResult]);

  const toolsInWorkspace = [
    { id: 217, name: 'Diff Checker' },
    { id: 218, name: 'Text Splitter' },
    { id: 219, name: 'Text Merger' },
    { id: 220, name: 'Text Repeater' },
    { id: 221, name: 'Text to Slug' },
    { id: 222, name: 'Slug to Text' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Text Transform & Diff'}
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

        {/* Workspace tool selector */}
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

        {/* Tool 217: Diff Checker Side-by-Side Inputs */}
        {activeToolId === 217 && (
          <View style={styles.diffSection}>
            <View style={styles.inputCard}>
              <Text style={styles.sectionTitle}>Original Text</Text>
              <TextInput
                style={styles.textInputHalf}
                multiline
                value={diffOriginal}
                onChangeText={setDiffOriginal}
                placeholder="Original version..."
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={[styles.inputCard, { marginTop: Spacing.sm }]}>
              <Text style={styles.sectionTitle}>Modified Text</Text>
              <TextInput
                style={styles.textInputHalf}
                multiline
                value={diffModified}
                onChangeText={setDiffModified}
                placeholder="Modified version..."
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            {/* Visual Line Diff Card */}
            <View style={styles.diffVisualCard}>
              <View style={styles.diffVisualHeader}>
                <Text style={styles.diffVisualTitle}>Comparison Highlights</Text>
                <View style={styles.similarityBadge}>
                  <Text style={styles.similarityText}>
                    {diffResult.similarityPercentage}% Match
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.diffLinesBox} nestedScrollEnabled>
                {!diffOriginal && !diffModified ? (
                  <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', margin: 12 }}>
                    Enter original and modified text above to compute visual diff
                  </Text>
                ) : (
                  diffResult.lines.map((line, idx) => {
                    const isAdded = line.type === 'added';
                    const isDeleted = line.type === 'deleted';
                    return (
                      <View
                        key={idx}
                        style={[
                          styles.diffLineRow,
                          isAdded && styles.diffLineAdded,
                          isDeleted && styles.diffLineDeleted,
                        ]}
                      >
                        <Text
                          style={[
                            styles.diffSign,
                            isAdded && styles.diffSignAdded,
                            isDeleted && styles.diffSignDeleted,
                          ]}
                        >
                          {isAdded ? '+' : isDeleted ? '-' : ' '}
                        </Text>
                        <Text
                          style={[
                            styles.diffText,
                            isAdded && styles.diffTextAdded,
                            isDeleted && styles.diffTextDeleted,
                          ]}
                        >
                          {line.text || ' '}
                        </Text>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Tool 218: Splitter */}
        {activeToolId === 218 && (
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Text to Split</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={splitInput}
              onChangeText={setSplitInput}
              placeholder="Enter text to split..."
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.subSettingsRow}>
              <Text style={styles.subLabel}>Split By:</Text>
              {(['delimiter', 'char_length', 'words'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.smallPill, splitMode === mode && styles.smallPillActive]}
                  onPress={() => setSplitMode(mode)}
                >
                  <Text
                    style={[
                      styles.smallPillText,
                      splitMode === mode && styles.smallPillTextActive,
                    ]}
                  >
                    {mode === 'delimiter'
                      ? 'Delimiter'
                      : mode === 'char_length'
                      ? 'Char Length'
                      : 'Words'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {splitMode === 'delimiter' ? (
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Delimiter:</Text>
                <TextInput
                  style={styles.singleInput}
                  value={splitDelimiter}
                  onChangeText={setSplitDelimiter}
                  placeholder="e.g. , or \n"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            ) : (
              <View style={styles.inputRow}>
                <Text style={styles.inputLabel}>Chunk Size:</Text>
                <TextInput
                  style={styles.singleInput}
                  keyboardType="numeric"
                  value={splitChunkSize}
                  onChangeText={setSplitChunkSize}
                />
              </View>
            )}
          </View>
        )}

        {/* Tool 219: Merger */}
        {activeToolId === 219 && (
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Lines / Chunks to Merge</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={mergeInput}
              onChangeText={setMergeInput}
              placeholder="Enter lines or chunks..."
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.subSettingsRow}>
              <Text style={styles.subLabel}>Separator:</Text>
              {[
                { label: 'Newline', val: '\n' },
                { label: 'Divider', val: '\n---\n' },
                { label: 'Comma', val: ', ' },
                { label: 'Space', val: ' ' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.smallPill, mergeDelimiter === item.val && styles.smallPillActive]}
                  onPress={() => setMergeDelimiter(item.val)}
                >
                  <Text
                    style={[
                      styles.smallPillText,
                      mergeDelimiter === item.val && styles.smallPillTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setMergeNumbered(!mergeNumbered)}
            >
              <AppIcon
                name={mergeNumbered ? 'Check' : 'Type'}
                size={16}
                color={mergeNumbered ? Colors.accentOrange : Colors.textMuted}
              />
              <Text style={styles.checkboxText}>Add 1, 2, 3 numbering prefix</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tool 220: Repeater */}
        {activeToolId === 220 && (
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>String to Repeat</Text>
            <TextInput
              style={styles.textInputHalf}
              value={repeatInput}
              onChangeText={setRepeatInput}
              placeholder="Text to repeat..."
              placeholderTextColor={Colors.textMuted}
            />

            <View style={styles.stepperRow}>
              <Text style={styles.subLabel}>Repeat Count: {repeatCount}</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setRepeatCount(Math.max(1, repeatCount - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setRepeatCount(repeatCount + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
                {[3, 5, 10, 20].map((num) => (
                  <TouchableOpacity
                    key={num}
                    style={[styles.smallPill, repeatCount === num && styles.smallPillActive]}
                    onPress={() => setRepeatCount(num)}
                  >
                    <Text
                      style={[
                        styles.smallPillText,
                        repeatCount === num && styles.smallPillTextActive,
                      ]}
                    >
                      {num}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setRepeatNumbered(!repeatNumbered)}
            >
              <AppIcon
                name={repeatNumbered ? 'Check' : 'Type'}
                size={16}
                color={repeatNumbered ? Colors.accentOrange : Colors.textMuted}
              />
              <Text style={styles.checkboxText}>Include line numbering</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tool 221: Text to Slug */}
        {activeToolId === 221 && (
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>Headline / Title Text</Text>
            <TextInput
              style={styles.textInputHalf}
              value={slugInput}
              onChangeText={setSlugInput}
              placeholder="Enter title to slugify..."
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.subSettingsRow}>
              <Text style={styles.subLabel}>Separator:</Text>
              {[
                { label: 'Hyphen (-)', val: '-' },
                { label: 'Underscore (_)', val: '_' },
              ].map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={[styles.smallPill, slugSeparator === item.val && styles.smallPillActive]}
                  onPress={() => setSlugSeparator(item.val)}
                >
                  <Text
                    style={[
                      styles.smallPillText,
                      slugSeparator === item.val && styles.smallPillTextActive,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Tool 222: Slug to Text */}
        {activeToolId === 222 && (
          <View style={styles.inputCard}>
            <Text style={styles.sectionTitle}>URL Slug</Text>
            <TextInput
              style={styles.textInputHalf}
              value={slugToTextInput}
              onChangeText={setSlugToTextInput}
              placeholder="Enter hyphenated or underscored slug..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* Unified Output Result Card */}
        <TextResultCard
          title={toolConfig?.name || 'Transformed Output'}
          subtitle={toolConfig?.description}
          badgeText="Instant Offline Conversion"
          stats={statItems}
          content={transformResult}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="transformed-output.txt"
        />
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
  diffSection: {
    marginBottom: Spacing.sm,
  },
  inputCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  textInput: {
    minHeight: 90,
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  textInputHalf: {
    minHeight: 70,
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  diffVisualCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  diffVisualHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  diffVisualTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  similarityBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  similarityText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.statusSuccess,
  },
  diffLinesBox: {
    maxHeight: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 6,
  },
  diffLineRow: {
    flexDirection: 'row',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  diffLineAdded: {
    backgroundColor: '#DCFCE7',
  },
  diffLineDeleted: {
    backgroundColor: '#FEE2E2',
  },
  diffSign: {
    fontFamily: 'Courier',
    fontSize: 12,
    width: 16,
    color: Colors.textMuted,
    fontWeight: '700',
  },
  diffSignAdded: {
    color: Colors.statusSuccess,
  },
  diffSignDeleted: {
    color: Colors.statusError,
  },
  diffText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: Colors.onSurface,
    flex: 1,
  },
  diffTextAdded: {
    color: '#15803D',
  },
  diffTextDeleted: {
    color: '#B91C1C',
  },
  subSettingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  smallPillActive: {
    backgroundColor: Colors.accentOrange,
    borderColor: Colors.accentOrange,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  smallPillTextActive: {
    color: Colors.surfaceWhite,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  singleInput: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    fontSize: 13,
    color: Colors.onSurface,
    backgroundColor: '#FAFAFA',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  checkboxText: {
    fontSize: 12,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stepperBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
});
