import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface DuplicatePdfPagesWorkspaceProps {
  onBack: () => void;
}

export const DuplicatePdfPagesWorkspace: React.FC<DuplicatePdfPagesWorkspaceProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    size?: number;
    pageCount: number;
    base64: string;
  } | null>(null);

  const [selectedPages, setSelectedPages] = useState<number[]>([1]);
  const [copyCount, setCopyCount] = useState<number>(1);
  const [insertMode, setInsertMode] = useState<'after' | 'end'>('after');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    sizeBytes: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(13);

  const handlePickPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const doc = await PDFDocument.load(base64);
        const count = doc.getPageCount();

        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          pageCount: count,
          base64,
        });
        setSelectedPages([1]);
        setOutputFile(null);
      }
    } catch (err: any) {
      Alert.alert('Picker Error', err.message || 'Could not load PDF');
    }
  };

  const togglePage = (pageIdx: number) => {
    setSelectedPages((prev) =>
      prev.includes(pageIdx) ? prev.filter((p) => p !== pageIdx) : [...prev, pageIdx].sort((a, b) => a - b)
    );
  };

  const handleDuplicate = async () => {
    if (!selectedFile) {
      Alert.alert('No Document', 'Please choose a PDF document first.');
      return;
    }

    if (selectedPages.length === 0) {
      Alert.alert('No Pages Selected', 'Please select at least one page to duplicate.');
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.load(selectedFile.base64);
      const zeroIndexedPages = selectedPages.map((p) => p - 1);

      if (insertMode === 'end') {
        for (let c = 0; c < copyCount; c++) {
          const copied = await pdfDoc.copyPages(pdfDoc, zeroIndexedPages);
          copied.forEach((cp) => pdfDoc.addPage(cp));
        }
      } else {
        // Immediately after each page
        // Sort descending so insertions don't shift earlier indices
        const sortedDesc = [...zeroIndexedPages].sort((a, b) => b - a);
        for (const idx of sortedDesc) {
          for (let c = 0; c < copyCount; c++) {
            const [copied] = await pdfDoc.copyPages(pdfDoc, [idx]);
            pdfDoc.insertPage(idx + 1, copied);
          }
        }
      }

      const outBase64 = await pdfDoc.saveAsBase64();
      const finalCount = pdfDoc.getPageCount();
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_duplicated_${Date.now()}.pdf`;
      const outUri = `${FileSystem.documentDirectory}${outName}`;

      await FileSystem.writeAsStringAsync(outUri, outBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const info = await FileSystem.getInfoAsync(outUri);
      const sizeBytes = info.exists && 'size' in info ? (info.size as number) : 10240;

      addManagedFile({
        name: outName,
        uri: outUri,
        size: sizeBytes,
        mimeType: 'application/pdf',
        createdAt: Date.now(),
        toolOriginId: 13,
      });

      addRecentItem({
        toolId: 13,
        toolName: 'Duplicate PDF Pages',
        studioId: 'pdf',
        summary: `Duplicated ${selectedPages.length} pages (${finalCount} pages total)`,
      });

      setOutputFile({
        name: outName,
        uri: outUri,
        pageCount: finalCount,
        sizeBytes,
      });
    } catch (err: any) {
      Alert.alert('Duplication Error', err.message || 'Could not duplicate PDF pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!outputFile) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(outputFile.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Duplicated PDF',
        });
      } else {
        Alert.alert('Sharing Unavailable', 'File sharing is not supported on this device.');
      }
    } catch (err: any) {
      Alert.alert('Share Failed', err.message || 'Could not share PDF.');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Duplicate PDF Pages"
        subtitle="PDF Studio · Tool #13"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'star' : 'star-outline',
          onPress: () => toggleFavorite(13),
          color: favorited ? Colors.warning : Colors.neutral500,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OfflineShield studioName="PDF Studio" />

        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.badgeRow}>
            <View style={styles.toolBadge}>
              <Text style={styles.toolBadgeText}>Tool #13 · PDF Studio</Text>
            </View>
            <View style={styles.subBadge}>
              <AppIcon name="file-text" size={12} color={Colors.studios.pdf} />
              <Text style={styles.subBadgeText}>Page Duplication Engine</Text>
            </View>
          </View>
          <Text style={styles.introTitle}>Duplicate PDF Pages</Text>
          <Text style={styles.introDesc}>
            Duplicate specific pages within a PDF with custom copy counts and insertion position.
          </Text>
        </View>

        {/* File Inspector Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.pdfIconCircle}>
                <AppIcon name="file-text" size={18} color={Colors.studios.pdf} />
              </View>
              <Text style={styles.cardTitle}>Document Inspector</Text>
            </View>
            <TouchableOpacity style={styles.pickBtn} onPress={handlePickPdf}>
              <AppIcon name="upload" size={14} color={Colors.studios.pdf} />
              <Text style={styles.pickBtnText}>
                {selectedFile ? 'Replace PDF' : 'Select PDF'}
              </Text>
            </TouchableOpacity>
          </View>

          {selectedFile ? (
            <View style={styles.docDetailsBox}>
              <Text style={styles.docName} numberOfLines={1}>
                {selectedFile.name}
              </Text>
              <Text style={styles.docMeta}>
                {selectedFile.pageCount} pages ·{' '}
                {selectedFile.size ? (selectedFile.size / (1024 * 1024)).toFixed(2) + ' MB' : 'Local'}
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyBox} onPress={handlePickPdf}>
              <AppIcon name="file-text" size={36} color={Colors.neutral400} />
              <Text style={styles.emptyTitle}>Select a PDF document</Text>
              <Text style={styles.emptyDesc}>Choose any local PDF to select and duplicate pages</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Page Selector Grid */}
        {selectedFile && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Select Pages to Duplicate</Text>
              <TouchableOpacity
                onPress={() => {
                  if (selectedPages.length === selectedFile.pageCount) {
                    setSelectedPages([]);
                  } else {
                    setSelectedPages(Array.from({ length: selectedFile.pageCount }, (_, i) => i + 1));
                  }
                }}
              >
                <Text style={styles.selectAllLink}>
                  {selectedPages.length === selectedFile.pageCount ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.pagesGrid}>
              {Array.from({ length: selectedFile.pageCount }, (_, i) => i + 1).map((pNum) => {
                const isSelected = selectedPages.includes(pNum);
                return (
                  <TouchableOpacity
                    key={pNum}
                    style={[styles.pageTile, isSelected && styles.pageTileSelected]}
                    onPress={() => togglePage(pNum)}
                  >
                    <View style={styles.pageMiniSheet}>
                      <Text style={styles.pageMiniText}>Page</Text>
                      <Text style={styles.pageMiniNum}>{pNum}</Text>
                    </View>
                    <AppIcon
                      name={isSelected ? 'check-circle' : 'circle'}
                      size={16}
                      color={isSelected ? Colors.studios.pdf : Colors.neutral400}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Copies and Placement Options */}
            <View style={styles.sectionDivider} />
            <Text style={styles.settingLabel}>Number of Copies: {copyCount}x</Text>
            <View style={styles.stepperRow}>
              {[1, 2, 3, 5].map((cnt) => (
                <TouchableOpacity
                  key={cnt}
                  style={[styles.stepperBtn, copyCount === cnt && styles.stepperBtnActive]}
                  onPress={() => setCopyCount(cnt)}
                >
                  <Text style={[styles.stepperText, copyCount === cnt && styles.stepperTextActive]}>
                    {cnt}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.settingLabel, { marginTop: Spacing.sm }]}>Insertion Position</Text>
            <View style={styles.modeGroup}>
              <TouchableOpacity
                style={[styles.modeItem, insertMode === 'after' && styles.modeItemActive]}
                onPress={() => setInsertMode('after')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeTitle, insertMode === 'after' && styles.modeTitleActive]}>
                    Immediately After Original Page
                  </Text>
                  <Text style={styles.modeSub}>Duplicate page appears right next to its source</Text>
                </View>
                {insertMode === 'after' && (
                  <AppIcon name="check" size={16} color={Colors.studios.pdf} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modeItem, insertMode === 'end' && styles.modeItemActive]}
                onPress={() => setInsertMode('end')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modeTitle, insertMode === 'end' && styles.modeTitleActive]}>
                    Append to End of Document
                  </Text>
                  <Text style={styles.modeSub}>All duplicate copies are placed at the very end</Text>
                </View>
                {insertMode === 'end' && (
                  <AppIcon name="check" size={16} color={Colors.studios.pdf} />
                )}
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: Spacing.md }}>
              <PrimaryButton
                title={isProcessing ? 'Duplicating Pages...' : 'Duplicate Selected Pages'}
                onPress={handleDuplicate}
                loading={isProcessing}
                icon="copy"
              />
            </View>
          </View>
        )}

        {/* Output PDF */}
        {outputFile && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconCircleSuccess}>
                  <AppIcon name="check" size={16} color={Colors.success} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Duplication Complete</Text>
                  <Text style={styles.resultMeta}>
                    {outputFile.pageCount} total pages ·{' '}
                    {(outputFile.sizeBytes / 1024).toFixed(1)} KB
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <AppIcon name="share" size={16} color={Colors.studios.pdf} />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },
  introCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  toolBadge: {
    backgroundColor: Colors.surfacePdf,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  toolBadgeText: {
    color: Colors.studios.pdf,
    fontSize: 11,
    fontWeight: '700',
  },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.neutral100,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  subBadgeText: {
    color: Colors.neutral700,
    fontSize: 11,
    fontWeight: '600',
  },
  introTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.neutral900,
    marginTop: 2,
  },
  introDesc: {
    fontSize: 13,
    color: Colors.neutral600,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pdfIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfacePdf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfacePdf,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  pickBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.studios.pdf,
  },
  docDetailsBox: {
    backgroundColor: Colors.neutral50,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  docName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  docMeta: {
    fontSize: 11,
    color: Colors.neutral500,
    marginTop: 2,
  },
  emptyBox: {
    height: 120,
    backgroundColor: Colors.neutral50,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral800,
  },
  emptyDesc: {
    fontSize: 11,
    color: Colors.neutral500,
  },
  selectAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.studios.pdf,
  },
  pagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  pageTile: {
    flexBasis: '30%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral50,
    padding: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  pageTileSelected: {
    backgroundColor: Colors.surfacePdf,
    borderColor: Colors.studios.pdf,
  },
  pageMiniSheet: {
    padding: 4,
  },
  pageMiniText: {
    fontSize: 10,
    color: Colors.neutral500,
  },
  pageMiniNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral900,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.xs,
  },
  settingLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral800,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  stepperBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral100,
    alignItems: 'center',
  },
  stepperBtnActive: {
    backgroundColor: Colors.studios.pdf,
  },
  stepperText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  stepperTextActive: {
    color: Colors.surfaceWhite,
  },
  modeGroup: {
    gap: Spacing.xs,
  },
  modeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral50,
  },
  modeItemActive: {
    backgroundColor: Colors.surfacePdf,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral800,
  },
  modeTitleActive: {
    color: Colors.studios.pdf,
  },
  modeSub: {
    fontSize: 11,
    color: Colors.neutral500,
    marginTop: 2,
  },
  iconCircleSuccess: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceImage,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultMeta: {
    fontSize: 11,
    color: Colors.neutral500,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfacePdf,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.full,
  },
  shareBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.studios.pdf,
  },
});
