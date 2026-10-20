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
import {
  extractUrls,
  extractEmails,
  extractPhoneNumbers,
  textToAscii,
  asciiToText,
  inspectUnicode,
  encodeText,
  decodeText,
  UnicodeCharInfo,
} from './shared/TextHelpers';
import { TextResultCard, TextStatItem } from './shared/TextResultCard';
import { getTextToolConfig } from './textConfig';

interface TextExtractCodecWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_EXTRACT_SAMPLE = `Welcome to Toolstrum!
Contact our developer team at dev@toolstrum.app or support@toolstrum.app.
Visit our documentation at https://toolstrum.app/docs and https://github.com/toolstrum/core.
For inquiries, call +1-800-555-0199 or (555) 234-5678.
Check out www.toolstrum.dev for offline packages.`;

export const TextExtractCodecWorkspace: React.FC<TextExtractCodecWorkspaceProps> = ({
  initialToolId = 223,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const [input, setInput] = useState<string>('');

  // Sub-modes
  const [asciiMode, setAsciiMode] = useState<'decimal' | 'hex' | 'binary'>('decimal');
  const [codecMode, setCodecMode] = useState<'base64' | 'hex' | 'url' | 'html'>('base64');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getTextToolConfig(activeToolId);

  // Extracted lists
  const extractedList: string[] = useMemo(() => {
    switch (activeToolId) {
      case 223:
        return extractUrls(input);
      case 224:
        return extractEmails(input);
      case 225:
        return extractPhoneNumbers(input);
      default:
        return [];
    }
  }, [input, activeToolId]);

  // Unicode items
  const unicodeList: UnicodeCharInfo[] = useMemo(() => {
    if (activeToolId === 228) {
      return inspectUnicode(input);
    }
    return [];
  }, [input, activeToolId]);

  // Processed output for Codecs & Decoders
  const processedOutput: string = useMemo(() => {
    switch (activeToolId) {
      case 223:
      case 224:
      case 225:
        return extractedList.join('\n');
      case 226:
        return textToAscii(input, asciiMode);
      case 227:
        return asciiToText(input, asciiMode);
      case 228:
        return unicodeList
          .map((u) => `${u.char} -> ${u.hex} (Bytes: ${u.utf8Bytes}, Decimal: ${u.codePoint})`)
          .join('\n');
      case 229:
        return encodeText(input, codecMode);
      case 230:
        return decodeText(input, codecMode);
      default:
        return '';
    }
  }, [activeToolId, extractedList, unicodeList, input, asciiMode, codecMode]);

  const handleCopyIndividual = async (val: string) => {
    await Clipboard.setStringAsync(val);
    Alert.alert('Copied', `"${val}" copied to clipboard.`);
  };

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Extracted payload saved to workspace files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Text Extraction'}`,
      subtitle: `${processedOutput.length} characters processed`,
    });
  };

  const statItems: TextStatItem[] = useMemo(() => {
    if (activeToolId >= 223 && activeToolId <= 225) {
      return [
        { label: 'Found Items', value: extractedList.length },
        { label: 'Input Length', value: input.length },
      ];
    }
    if (activeToolId === 228) {
      return [
        { label: 'Code Points', value: unicodeList.length },
        { label: 'Input Chars', value: input.length },
      ];
    }
    return [
      { label: 'Mode', value: activeToolId <= 227 ? asciiMode.toUpperCase() : codecMode.toUpperCase() },
      { label: 'Output Length', value: processedOutput.length },
    ];
  }, [activeToolId, extractedList, unicodeList, input, asciiMode, codecMode, processedOutput]);

  const toolsInWorkspace = [
    { id: 223, name: 'URLs' },
    { id: 224, name: 'Emails' },
    { id: 225, name: 'Phones' },
    { id: 226, name: 'Text to ASCII' },
    { id: 227, name: 'ASCII to Text' },
    { id: 228, name: 'Unicode' },
    { id: 229, name: 'Encoder' },
    { id: 230, name: 'Decoder' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Extraction & Codec Hub'}
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

        {/* Mode Pill Bar for ASCII (226, 227) */}
        {(activeToolId === 226 || activeToolId === 227) && (
          <View style={styles.modeBar}>
            <Text style={styles.modeLabel}>Format:</Text>
            {(['decimal', 'hex', 'binary'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.smallPill, asciiMode === m && styles.smallPillActive]}
                onPress={() => setAsciiMode(m)}
              >
                <Text style={[styles.smallPillText, asciiMode === m && styles.smallPillTextActive]}>
                  {m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Mode Pill Bar for Encoders (229, 230) */}
        {(activeToolId === 229 || activeToolId === 230) && (
          <View style={styles.modeBar}>
            <Text style={styles.modeLabel}>Codec:</Text>
            {(['base64', 'hex', 'url', 'html'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.smallPill, codecMode === m && styles.smallPillActive]}
                onPress={() => setCodecMode(m)}
              >
                <Text style={[styles.smallPillText, codecMode === m && styles.smallPillTextActive]}>
                  {m === 'url' ? 'URL %' : m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.sectionTitle}>
              {activeToolId === 227 || activeToolId === 230 ? 'Encoded Input Payload' : 'Input Text'}
            </Text>
            <View style={styles.inputHeaderActions}>
              <TouchableOpacity
                onPress={() => setInput(DEFAULT_EXTRACT_SAMPLE)}
                style={styles.actionChip}
              >
                <Text style={styles.actionChipText}>Sample</Text>
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
            value={input}
            onChangeText={setInput}
            placeholder={
              activeToolId === 227
                ? 'Enter space-separated decimal, hex, or binary numbers...'
                : 'Enter text, URL payloads, or strings...'
            }
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Specific Extractor List Badges (223, 224, 225) */}
        {activeToolId >= 223 && activeToolId <= 225 && extractedList.length > 0 && (
          <View style={styles.extractedListCard}>
            <Text style={styles.extractedListTitle}>
              Discovered {extractedList.length} Unique Item{extractedList.length > 1 ? 's' : ''}
            </Text>
            <View style={styles.extractedItemsBox}>
              {extractedList.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.itemChip}
                  onPress={() => handleCopyIndividual(item)}
                >
                  <Text style={styles.itemChipText}>{item}</Text>
                  <AppIcon name="Copy" size={12} color={Colors.accentOrange} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Specific Unicode Inspector Grid (228) */}
        {activeToolId === 228 && unicodeList.length > 0 && (
          <View style={styles.unicodeCard}>
            <Text style={styles.unicodeTitle}>Unicode Glyph Analysis (First 100 Chars)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.unicodeTable}>
                <View style={styles.unicodeHeaderRow}>
                  <Text style={[styles.unicodeTh, { width: 40 }]}>Char</Text>
                  <Text style={[styles.unicodeTh, { width: 80 }]}>Point</Text>
                  <Text style={[styles.unicodeTh, { width: 90 }]}>UTF-8 Bytes</Text>
                  <Text style={[styles.unicodeTh, { width: 60 }]}>Dec</Text>
                </View>
                {unicodeList.slice(0, 25).map((u, i) => (
                  <View key={i} style={styles.unicodeRow}>
                    <Text style={[styles.unicodeTdChar, { width: 40 }]}>{u.char}</Text>
                    <Text style={[styles.unicodeTdCode, { width: 80 }]}>{u.hex}</Text>
                    <Text style={[styles.unicodeTd, { width: 90 }]}>{u.utf8Bytes}</Text>
                    <Text style={[styles.unicodeTd, { width: 60 }]}>{u.codePoint}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Standard Result Card */}
        <TextResultCard
          title={toolConfig?.name || 'Output Result'}
          subtitle={toolConfig?.description}
          badgeText="Local Offline Codec"
          stats={statItems}
          content={processedOutput}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="extracted-codec-output.txt"
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
  modeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  smallPill: {
    paddingHorizontal: 10,
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
    minHeight: 110,
    fontSize: 13,
    color: Colors.onSurface,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  extractedListCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  extractedListTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  extractedItemsBox: {
    gap: 6,
  },
  itemChip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  itemChipText: {
    fontSize: 13,
    color: Colors.onSurface,
  },
  unicodeCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginTop: Spacing.sm,
  },
  unicodeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  unicodeTable: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  unicodeHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  unicodeTh: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  unicodeRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  unicodeTdChar: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  unicodeTdCode: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: Colors.accentOrange,
    fontWeight: '600',
  },
  unicodeTd: {
    fontSize: 12,
    fontFamily: 'Courier',
    color: Colors.textMuted,
  },
});
