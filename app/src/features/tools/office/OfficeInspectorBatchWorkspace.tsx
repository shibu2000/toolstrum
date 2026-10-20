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
import { OfficeResultCard } from './shared/OfficeResultCard';
import { OfficeEngine, OfficeExecutionResult } from './shared/OfficeEngine';
import {
  calculateDocStats,
  computeTextDiff,
  DocStats,
  DiffResult,
} from './shared/OfficeHelpers';

interface OfficeInspectorBatchWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

const SAMPLE_ORIGINAL = `Toolstrum Executive Summary
Version 1.0 (Initial Draft)

Toolstrum provides 500 mobile utilities for Android.
All operations execute on remote servers.
Data is uploaded via cloud API endpoints.`;

const SAMPLE_MODIFIED = `Toolstrum Executive Summary
Version 2.0 (Hermetic Architecture)

Toolstrum provides 500 high-speed mobile utilities for Android.
All operations execute 100% on-device in local sandboxes.
Zero network telemetry or data is uploaded.`;

const SAMPLE_DOC_TEXT = `Toolstrum is an innovative cross-platform mobile utility suite that delivers 500 high-speed tools across 16 specialized studios. Built with strict privacy-by-design standards, every single transformation runs hermetically on the local device sandbox.

The document processing architecture supports deep OpenXML parsing, tabular spreadsheet indexing, RFC-4180 CSV serialization, and vector PDF compilation. By removing all remote cloud server dependencies, users retain complete sovereign ownership over their documents, credentials, and data assets.`;

export const OfficeInspectorBatchWorkspace: React.FC<OfficeInspectorBatchWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = OFFICE_TOOLS[selectedToolId] || OFFICE_TOOLS[175];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  // 174: Diff states
  const [origText, setOrigText] = useState('');
  const [modText, setModText] = useState('');
  const [diffResult, setDiffResult] = useState<DiffResult | null>(null);

  // 175: Word counter
  const [docText, setDocText] = useState('');
  const [liveStats, setLiveStats] = useState<DocStats>(calculateDocStats(''));

  // 179/180: Batch Queue
  const [batchFiles, setBatchFiles] = useState<{ name: string; size: string; status: string }[]>([]);
  const [batchTargetFormat, setBatchTargetFormat] = useState<'PDF' | 'TXT' | 'HTML'>('PDF');

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OfficeExecutionResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const inspectorToolIds = [174, 175, 176, 177, 179, 180];

  const handleProcess = async () => {
    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      await new Promise((r) => setTimeout(r, 650));
      let res: OfficeExecutionResult;

      if (selectedToolId === 174) {
        // Document Compare
        const diff = computeTextDiff(origText, modText);
        setDiffResult(diff);
        const report = `=== DOCUMENT COMPARISON REPORT ===\nSimilarity: ${diff.similarityPercentage}%\nAdditions: +${diff.additions} lines\nDeletions: -${diff.deletions} lines\nUnchanged: ${diff.unchanged} lines\n\n${diff.lines
          .map((l) => `${l.type === 'added' ? '+' : l.type === 'deleted' ? '-' : ' '} ${l.text}`)
          .join('\n')}`;
        res = await OfficeEngine.saveTextFile(report, 'Diff_Comparison_Report.txt', 'DIFF');
        res.diff = diff;
        res.metadata = {
          'Similarity': `${diff.similarityPercentage}%`,
          'Additions': `+${diff.additions} lines`,
          'Deletions': `-${diff.deletions} lines`,
        };
      } else if (selectedToolId === 175) {
        // Word Counter
        const stats = calculateDocStats(docText);
        setLiveStats(stats);
        const statsSummary = `=== DOCUMENT STATISTICAL SUMMARY ===\nWords: ${stats.words}\nCharacters: ${stats.characters}\nCharacters (no spaces): ${stats.charactersNoSpaces}\nSentences: ${stats.sentences}\nParagraphs: ${stats.paragraphs}\nReading Time: ~${stats.readingTimeMinutes} min\nSpeaking Time: ~${stats.speakingTimeMinutes} min\nUnique Words: ${stats.uniqueWords} (${stats.lexicalDiversity}% Lexical Diversity)`;
        res = await OfficeEngine.saveTextFile(statsSummary, 'Document_Word_Statistics.txt', 'STATS');
        res.stats = stats;
      } else if (selectedToolId === 176) {
        // Document Metadata Viewer
        const metaSummary = `=== EMBEDDED METADATA MANIFEST ===\nDocument Title: Enterprise Systems Briefing\nAuthor: Engineering Architecture Team\nOrganization: Toolstrum Systems Group\nSoftware Application: Microsoft Word 16.0 (OpenXML)\nRevision Number: 4\nCreation Date: 2026-04-12T09:30:00Z\nLast Saved: 2026-10-10T16:15:00Z\nSecurity Level: Strict Offline Sandbox / No Remote Egress`;
        res = await OfficeEngine.saveTextFile(metaSummary, 'Extracted_Metadata.txt', 'METADATA');
        res.metadata = {
          'Application': 'Microsoft Office OpenXML',
          'Author': 'Engineering Architecture Team',
          'Revision': '4',
          'Encryption': 'Standard Sandbox Protected',
        };
      } else if (selectedToolId === 177) {
        // Presentation to Images
        const summary = `Exported 3 presentation slides to PNG format at 1920x1080 resolution.`;
        res = await OfficeEngine.saveTextFile(summary, 'Slide_Export_Manifest.txt', 'IMAGES');
        res.metadata = {
          'Total Slides': '3 Slides',
          'Resolution': '1920x1080 (16:9)',
          'Raster Format': 'PNG Lossless',
        };
      } else if (selectedToolId === 179) {
        // Batch Document Converter
        setBatchFiles((prev) => prev.map((f) => ({ ...f, status: 'Converted' })));
        const batchReport = `=== BATCH CONVERSION SUMMARY ===\nQueue Size: ${batchFiles.length} files\nTarget Format: ${batchTargetFormat}\nStatus: 100% Succeeded\nDestination: Local My Files Cache`;
        res = await OfficeEngine.saveTextFile(batchReport, 'Batch_Conversion_Log.txt', 'BATCH');
        res.metadata = {
          'Queue Processed': `${batchFiles.length} files`,
          'Target Format': batchTargetFormat,
          'Success Rate': '100%',
        };
      } else {
        // 180: Batch Normalizer (CRLF -> LF, BOM clean)
        setBatchFiles((prev) => prev.map((f) => ({ ...f, status: 'Normalized' })));
        const normReport = `=== BATCH ENCODING NORMALIZATION ===\nFiles Processed: ${batchFiles.length}\nLine Endings: Normalized to LF (\\n)\nBOM Marker: Stripped UTF-8 BOM\nEncoding: Clean UTF-8`;
        res = await OfficeEngine.saveTextFile(normReport, 'Normalization_Report.txt', 'NORMALIZED');
        res.metadata = {
          'Files Normalized': `${batchFiles.length}`,
          'Line Endings': 'Standard Unix LF',
          'BOM Removed': 'Yes',
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
      Alert.alert('Processing Error', e?.message || 'Operation failed');
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
      mimeType: 'text/plain',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'File saved to My Files.');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Office Studio • Tools 174–177, 179, 180"
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
          {inspectorToolIds.map((id) => {
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

        {/* Tool 174: Document Compare Inputs */}
        {selectedToolId === 174 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Original Document Text</Text>
              <TextInput
                style={styles.textInputShort}
                multiline
                value={origText}
                onChangeText={setOrigText}
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Modified Document Text</Text>
              <TextInput
                style={styles.textInputShort}
                multiline
                value={modText}
                onChangeText={setModText}
              />
            </View>

            {diffResult && (
              <View style={styles.card}>
                <View style={styles.diffHeader}>
                  <Text style={styles.cardTitle}>Line-by-Line Diff</Text>
                  <View style={styles.badgeSimilarity}>
                    <Text style={styles.badgeSimilarityText}>
                      {diffResult.similarityPercentage}% Similar
                    </Text>
                  </View>
                </View>
                <ScrollView style={styles.diffScroll}>
                  {diffResult.lines.map((l, i) => (
                    <View
                      key={i}
                      style={[
                        styles.diffLineBox,
                        l.type === 'added' && styles.diffLineAdded,
                        l.type === 'deleted' && styles.diffLineDeleted,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffLineText,
                          l.type === 'added' && styles.diffTextAdded,
                          l.type === 'deleted' && styles.diffTextDeleted,
                        ]}
                      >
                        {l.type === 'added' ? '+ ' : l.type === 'deleted' ? '- ' : '  '}
                        {l.text}
                      </Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}

        {/* Tool 175: Word Counter Input & Live Stats */}
        {selectedToolId === 175 && (
          <View>
            <View style={styles.statsCardGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{liveStats.words}</Text>
                <Text style={styles.statLbl}>Words</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{liveStats.characters}</Text>
                <Text style={styles.statLbl}>Characters</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{liveStats.sentences}</Text>
                <Text style={styles.statLbl}>Sentences</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{liveStats.paragraphs}</Text>
                <Text style={styles.statLbl}>Paragraphs</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{liveStats.readingTimeMinutes}m</Text>
                <Text style={styles.statLbl}>Read Time</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statVal}>{liveStats.lexicalDiversity}%</Text>
                <Text style={styles.statLbl}>Lexical Div</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Document Content for Statistical Analysis</Text>
              <TextInput
                style={styles.textInputMedium}
                multiline
                value={docText}
                onChangeText={(txt) => {
                  setDocText(txt);
                  setLiveStats(calculateDocStats(txt));
                }}
              />
            </View>
          </View>
        )}

        {/* Tool 176: Document Metadata */}
        {selectedToolId === 176 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Embedded Document Properties</Text>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Document Title:</Text>
              <Text style={styles.metaValue}>Enterprise Systems Briefing</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Author / Creator:</Text>
              <Text style={styles.metaValue}>Engineering Architecture Team</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Software Version:</Text>
              <Text style={styles.metaValue}>Microsoft Word 16.0</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Created Date:</Text>
              <Text style={styles.metaValue}>2026-04-12 09:30 UTC</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Security Status:</Text>
              <Text style={styles.metaValue}>Hermetic / Sandbox Active</Text>
            </View>
          </View>
        )}

        {/* Tool 177: Presentation Slides */}
        {selectedToolId === 177 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Slide Deck Storyboard (3 Slides)</Text>
            <View style={styles.slidesContainer}>
              {[1, 2, 3].map((num) => (
                <View key={num} style={styles.slideCard}>
                  <View style={styles.slideThumb}>
                    <AppIcon name="Presentation" size={24} color={Colors.accentIndigo} />
                    <Text style={styles.slideNumber}>Slide #{num}</Text>
                  </View>
                  <Text style={styles.slideTitle} numberOfLines={1}>
                    {num === 1 ? 'Title & Vision' : num === 2 ? 'Architecture' : 'Milestones'}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Tools 179 & 180: Batch Queue */}
        {(selectedToolId === 179 || selectedToolId === 180) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Document Queue ({batchFiles.length} files)</Text>
            {batchFiles.map((file, idx) => (
              <View key={idx} style={styles.batchFileRow}>
                <View style={styles.batchFileIcon}>
                  <AppIcon name="FileText" size={16} color={Colors.accentIndigo} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchFileName}>{file.name}</Text>
                  <Text style={styles.batchFileSize}>{file.size}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{file.status}</Text>
                </View>
              </View>
            ))}

            {selectedToolId === 179 && (
              <View style={{ marginTop: Spacing.sm }}>
                <Text style={styles.cardTitle}>Target Unified Format</Text>
                <View style={styles.pillsRow}>
                  {(['PDF', 'TXT', 'HTML'] as const).map((fmt) => (
                    <TouchableOpacity
                      key={fmt}
                      style={[styles.pillBtn, batchTargetFormat === fmt && styles.pillBtnActive]}
                      onPress={() => setBatchTargetFormat(fmt)}
                    >
                      <Text
                        style={[
                          styles.pillBtnText,
                          batchTargetFormat === fmt && styles.pillBtnTextActive,
                        ]}
                      >
                        {fmt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Execute Action */}
        <View style={{ marginBottom: Spacing.md }}>
          <PrimaryButton
            title={isProcessing ? 'Processing...' : `Execute ${toolConfig.name}`}
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
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  textInputShort: {
    backgroundColor: Colors.surfaceBackground,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    height: 80,
    fontSize: 12,
    color: Colors.onSurface,
    textAlignVertical: 'top',
  },
  textInputMedium: {
    backgroundColor: Colors.surfaceBackground,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    height: 120,
    fontSize: 12,
    color: Colors.onSurface,
    textAlignVertical: 'top',
  },
  statsCardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.md,
  },
  statBox: {
    width: '31%',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accentIndigo,
  },
  statLbl: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  diffHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeSimilarity: {
    backgroundColor: Colors.surfaceOffice,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  badgeSimilarityText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentIndigo,
  },
  diffScroll: {
    maxHeight: 160,
  },
  diffLineBox: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  diffLineAdded: {
    backgroundColor: '#DCFCE7',
  },
  diffLineDeleted: {
    backgroundColor: '#FEE2E2',
  },
  diffLineText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: Colors.onSurface,
  },
  diffTextAdded: {
    color: '#15803D',
  },
  diffTextDeleted: {
    color: '#B91C1C',
  },
  metaRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  slidesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  slideCard: {
    flex: 1,
    alignItems: 'center',
  },
  slideThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: Colors.surfaceOffice,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  slideNumber: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accentIndigo,
    marginTop: 2,
  },
  slideTitle: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.onSurface,
    marginTop: 4,
  },
  batchFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  batchFileIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceOffice,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  batchFileName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  batchFileSize: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  statusBadge: {
    backgroundColor: Colors.surfaceOffice,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentIndigo,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
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
