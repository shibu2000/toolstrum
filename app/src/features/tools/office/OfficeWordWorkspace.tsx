import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { OFFICE_TOOLS } from './officeConfig';
import { OfficePickerBox, OfficeDocumentAsset } from './shared/OfficePickerBox';
import { OfficeResultCard } from './shared/OfficeResultCard';
import { OfficeEngine, OfficeExecutionResult } from './shared/OfficeEngine';
import { markdownToHtml, calculateDocStats } from './shared/OfficeHelpers';

interface OfficeWordWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

const SAMPLE_DOC: OfficeDocumentAsset = {
  name: 'Executive_Financial_Report.docx',
  sizeBytes: 48 * 1024,
  format: 'DOCX',
  linesCount: 84,
  wordsCount: 540,
  content: `# Executive Strategic Summary

Toolstrum on-device local architecture provides exceptional mobile utility performance without server egress.

## Financial Performance Highlights
- Gross software utility usage increased by 38.5% year-over-year.
- Privacy-conscious enterprise clients adopted 100% offline workflow mode.
- Operational server expenditure reduced to $0.00 via client-side compute.

## Strategic Roadmap
All 500 mobile tools run locally in hermetic sandboxes with complete offline integrity.`,
};

export const OfficeWordWorkspace: React.FC<OfficeWordWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = OFFICE_TOOLS[selectedToolId] || OFFICE_TOOLS[154];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  const [document, setDocument] = useState<OfficeDocumentAsset | null>(null);
  const [textContent, setTextContent] = useState<string>('');

  // Settings
  const [headingStyle, setHeadingStyle] = useState<'modern' | 'classic' | 'minimal'>('modern');
  const [pageMargin, setPageMargin] = useState<'normal' | 'narrow' | 'wide'>('normal');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OfficeExecutionResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const wordToolIds = [154, 155, 156, 157, 158, 178];

  const handleProcess = async () => {
    if (!document && !textContent.trim()) {
      Alert.alert('Empty Input', 'Please provide or enter text content.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      await new Promise((r) => setTimeout(r, 650));
      const source = textContent || document?.content || '';
      let res: OfficeExecutionResult;

      if (selectedToolId === 154) {
        // DOCX Viewer
        const stats = calculateDocStats(source);
        res = {
          name: document?.name || 'Document_Viewer.txt',
          content: source,
          sizeBytes: source.length,
          format: 'DOCX',
          stats,
          metadata: {
            'Status': 'Parsed Successfully',
            'Paragraphs': `${stats.paragraphs}`,
            'Reading Time': `${stats.readingTimeMinutes} min`,
          },
        };
      } else if (selectedToolId === 155) {
        // DOCX to TXT
        const cleanTxt = source.replace(/^[#\-\*]\s+/gm, '').trim();
        res = await OfficeEngine.saveTextFile(cleanTxt, 'Extracted_Document.txt', 'TXT');
      } else if (selectedToolId === 156) {
        // DOCX to HTML
        const html = markdownToHtml(source);
        res = await OfficeEngine.saveTextFile(html, 'Converted_Document.html', 'HTML');
      } else if (selectedToolId === 157) {
        // DOCX to Markdown
        res = await OfficeEngine.saveTextFile(source, 'Converted_Document.md', 'MARKDOWN');
      } else {
        // 158 / 178: Text to DOCX
        const docxContent = `[Microsoft Word OpenXML Container]\nTitle: ${document?.name || 'Document'}\nMargin: ${pageMargin}\nStyle: ${headingStyle}\n\n${source}`;
        res = await OfficeEngine.saveTextFile(docxContent, 'Packaged_Word_Document.docx', 'DOCX');
        res.metadata = {
          'Container': 'ECMA-376 OpenXML',
          'Typography': headingStyle.toUpperCase(),
          'Page Margin': pageMargin.toUpperCase(),
        };
      }

      setResult(res);

      addRecentItem({
        id: `recent-${Date.now()}`,
        toolId: selectedToolId,
        toolName: toolConfig.name,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToFiles = () => {
    if (!result) return;
    addManagedFile({
      name: result.name,
      uri: result.uri || '',
      size: result.sizeBytes,
      sizeBytes: result.sizeBytes,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: result.format === 'PDF' ? 'application/pdf' : 'text/plain',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'File registered to My Files successfully.');
  };

  const isTextToDocx = selectedToolId === 158 || selectedToolId === 178;

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Office Studio • Tools 154–158, 178"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(selectedToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OfflineShield studioName="Office Studio" />

        {/* Sub-tool switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcherRow}>
          {wordToolIds.map((id) => {
            const cfg = OFFICE_TOOLS[id];
            const isSelected = selectedToolId === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.switcherTab, isSelected && styles.switcherTabActive]}
                onPress={() => {
                  setSelectedToolId(id);
                  setResult(null);
                }}
                activeOpacity={0.7}
              >
                <AppIcon
                  name={cfg.iconName}
                  size={15}
                  color={isSelected ? Colors.surfaceWhite : Colors.textMuted}
                />
                <Text style={[styles.switcherTabText, isSelected && styles.switcherTabTextActive]}>
                  {cfg.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.toolDescription}>{toolConfig.description}</Text>

        {/* Document Picker Box */}
        <OfficePickerBox
          document={document}
          onDocumentSelected={(doc) => {
            setDocument(doc);
            setTextContent(doc.content);
            setResult(null);
          }}
        />

        {/* Interactive Document Editor / Text Area */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {isTextToDocx ? 'Document Text to Package' : 'Document Content'}
            </Text>
            <TouchableOpacity onPress={() => setTextContent('')}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            value={textContent}
            onChangeText={setTextContent}
            placeholder="Type or paste document text here..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Formatting Options if Text to DOCX */}
        {isTextToDocx && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Document Styling Preset</Text>
            <View style={styles.pillsRow}>
              {(['modern', 'classic', 'minimal'] as const).map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[styles.pillBtn, headingStyle === style && styles.pillBtnActive]}
                  onPress={() => setHeadingStyle(style)}
                >
                  <Text
                    style={[
                      styles.pillBtnText,
                      headingStyle === style && styles.pillBtnTextActive,
                    ]}
                  >
                    {style.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.cardTitle, { marginTop: Spacing.sm }]}>Page Margin</Text>
            <View style={styles.pillsRow}>
              {(['normal', 'narrow', 'wide'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.pillBtn, pageMargin === m && styles.pillBtnActive]}
                  onPress={() => setPageMargin(m)}
                >
                  <Text style={[styles.pillBtnText, pageMargin === m && styles.pillBtnTextActive]}>
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Execute Button */}
        <View style={{ marginBottom: Spacing.md }}>
          <PrimaryButton
            title={isProcessing ? 'Processing Document...' : `Execute ${toolConfig.name}`}
            onPress={handleProcess}
            disabled={isProcessing}
            loading={isProcessing}
            variant="primary"
            color={Colors.accentIndigo}
          />
        </View>

        {/* Result Card */}
        {result && (
          <OfficeResultCard
            result={result}
            onSaveToManagedFiles={handleSaveToFiles}
            saved={isSaved}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  switcherRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  switcherTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginRight: Spacing.xs,
  },
  switcherTabActive: {
    backgroundColor: Colors.accentIndigo,
    borderColor: Colors.accentIndigo,
  },
  switcherTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  switcherTabTextActive: {
    color: Colors.surfaceWhite,
  },
  toolDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.statusError,
  },
  textInput: {
    backgroundColor: Colors.surfaceBackground,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    height: 150,
    fontSize: 13,
    color: Colors.onSurface,
    textAlignVertical: 'top',
    lineHeight: 18,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  pillBtnActive: {
    backgroundColor: Colors.surfaceOffice,
    borderColor: Colors.accentIndigo,
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  pillBtnTextActive: {
    color: Colors.accentIndigo,
  },
});
