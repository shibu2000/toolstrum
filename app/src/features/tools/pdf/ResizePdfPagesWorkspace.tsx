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

interface ResizePdfPagesWorkspaceProps {
  onBack: () => void;
}

interface PagePreset {
  id: string;
  name: string;
  width: number;
  height: number;
  sub: string;
}

const PAGE_PRESETS: PagePreset[] = [
  { id: 'a4', name: 'A4', width: 595.28, height: 841.89, sub: 'International Standard' },
  { id: 'letter', name: 'US Letter', width: 612.0, height: 792.0, sub: '8.5 × 11 in' },
  { id: 'legal', name: 'US Legal', width: 612.0, height: 1008.0, sub: '8.5 × 14 in' },
  { id: 'a3', name: 'A3', width: 841.89, height: 1190.55, sub: 'Large Format' },
  { id: 'a5', name: 'A5', width: 419.53, height: 595.28, sub: 'Compact Booklet' },
];

export const ResizePdfPagesWorkspace: React.FC<ResizePdfPagesWorkspaceProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    base64: string;
    width: number;
    height: number;
  } | null>(null);

  const [selectedPresetId, setSelectedPresetId] = useState<string>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    sizeBytes: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(16);

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
        const pageCount = doc.getPageCount();
        const firstPage = doc.getPage(0);
        const { width, height } = firstPage.getSize();

        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          pageCount,
          base64,
          width: Math.round(width),
          height: Math.round(height),
        });
        setOutputFile(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not pick PDF');
    }
  };

  const handleResize = async () => {
    if (!selectedFile) {
      Alert.alert('No Document', 'Please choose a PDF document first.');
      return;
    }

    const preset = PAGE_PRESETS.find((p) => p.id === selectedPresetId) || PAGE_PRESETS[0];

    setIsProcessing(true);

    try {
      const targetW = orientation === 'portrait' ? preset.width : preset.height;
      const targetH = orientation === 'portrait' ? preset.height : preset.width;

      const srcDoc = await PDFDocument.load(selectedFile.base64);
      const newDoc = await PDFDocument.create();

      const pageCount = srcDoc.getPageCount();
      for (let i = 0; i < pageCount; i++) {
        const [embeddedPage] = await newDoc.embedPages([srcDoc.getPage(i)]);
        const newPage = newDoc.addPage([targetW, targetH]);

        const scale = Math.min(targetW / embeddedPage.width, targetH / embeddedPage.height);
        const scaledW = embeddedPage.width * scale;
        const scaledH = embeddedPage.height * scale;
        const offsetX = (targetW - scaledW) / 2;
        const offsetY = (targetH - scaledH) / 2;

        newPage.drawPage(embeddedPage, {
          x: offsetX,
          y: offsetY,
          width: scaledW,
          height: scaledH,
        });
      }

      const outBase64 = await newDoc.saveAsBase64();
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_resized_${preset.id}_${Date.now()}.pdf`;
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
        toolOriginId: 16,
      });

      addRecentItem({
        toolId: 16,
        toolName: 'Resize PDF Pages',
        studioId: 'pdf',
        summary: `Rescaled ${pageCount} pages to ${preset.name} (${orientation})`,
      });

      setOutputFile({
        name: outName,
        uri: outUri,
        pageCount,
        sizeBytes,
      });
    } catch (err: any) {
      Alert.alert('Resize Failed', err.message || 'Could not resize PDF pages.');
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
          dialogTitle: 'Share Resized PDF',
        });
      } else {
        Alert.alert('Sharing Unavailable', 'File sharing is not supported on this device.');
      }
    } catch (err: any) {
      Alert.alert('Share Failed', err.message || 'Could not share file.');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Resize PDF Pages"
        subtitle="PDF Studio · Tool #16"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'star' : 'star-outline',
          onPress: () => toggleFavorite(16),
          color: favorited ? Colors.warning : Colors.neutral500,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OfflineShield studioName="PDF Studio" />

        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.badgeRow}>
            <View style={styles.toolBadge}>
              <Text style={styles.toolBadgeText}>Tool #16 · PDF Studio</Text>
            </View>
            <View style={styles.subBadge}>
              <AppIcon name="file-text" size={12} color={Colors.studios.pdf} />
              <Text style={styles.subBadgeText}>Canvas Normalizer</Text>
            </View>
          </View>
          <Text style={styles.introTitle}>Resize PDF Pages</Text>
          <Text style={styles.introDesc}>
            Standardize PDF page geometry across A4, US Letter, Legal, and A3 formats with proportional content scaling.
          </Text>
        </View>

        {/* Document Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.pdfIconCircle}>
                <AppIcon name="file-text" size={18} color={Colors.studios.pdf} />
              </View>
              <Text style={styles.cardTitle}>Source Document</Text>
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
                {selectedFile.pageCount} pages · Current Size: {selectedFile.width} × {selectedFile.height} pt
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyBox} onPress={handlePickPdf}>
              <Text style={styles.emptyTitle}>Select a PDF to resize page dimensions</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Presets */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Target Page Standard</Text>
          <View style={styles.presetList}>
            {PAGE_PRESETS.map((p) => {
              const active = selectedPresetId === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.presetItem, active && styles.presetItemActive]}
                  onPress={() => setSelectedPresetId(p.id)}
                >
                  <View style={styles.presetInfo}>
                    <Text style={[styles.presetName, active && styles.presetNameActive]}>
                      {p.name}
                    </Text>
                    <Text style={styles.presetSub}>
                      {Math.round(p.width)} × {Math.round(p.height)} pt · {p.sub}
                    </Text>
                  </View>
                  <AppIcon
                    name={active ? 'check-circle' : 'circle'}
                    size={20}
                    color={active ? Colors.studios.pdf : Colors.neutral400}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Orientation */}
          <Text style={[styles.cardTitle, { marginTop: Spacing.sm }]}>Orientation</Text>
          <View style={styles.orientRow}>
            <TouchableOpacity
              style={[styles.orientBtn, orientation === 'portrait' && styles.orientBtnActive]}
              onPress={() => setOrientation('portrait')}
            >
              <Text style={[styles.orientText, orientation === 'portrait' && styles.orientTextActive]}>
                Portrait (Vertical)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.orientBtn, orientation === 'landscape' && styles.orientBtnActive]}
              onPress={() => setOrientation('landscape')}
            >
              <Text style={[styles.orientText, orientation === 'landscape' && styles.orientTextActive]}>
                Landscape (Horizontal)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: Spacing.md }}>
            <PrimaryButton
              title={isProcessing ? 'Resizing...' : 'Resize Pages'}
              onPress={handleResize}
              disabled={!selectedFile || isProcessing}
              loading={isProcessing}
              icon="sparkles"
            />
          </View>
        </View>

        {/* Output */}
        {outputFile && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconCircleSuccess}>
                  <AppIcon name="check" size={16} color={Colors.success} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Pages Resized Successfully</Text>
                  <Text style={styles.resultMeta}>
                    {outputFile.pageCount} pages · {(outputFile.sizeBytes / 1024).toFixed(1)} KB
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
    height: 80,
    backgroundColor: Colors.neutral50,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 12,
    color: Colors.neutral600,
  },
  presetList: {
    gap: Spacing.xs,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral50,
  },
  presetItemActive: {
    backgroundColor: Colors.surfacePdf,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.neutral800,
  },
  presetNameActive: {
    color: Colors.studios.pdf,
  },
  presetSub: {
    fontSize: 11,
    color: Colors.neutral500,
    marginTop: 2,
  },
  orientRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  orientBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral100,
    alignItems: 'center',
  },
  orientBtnActive: {
    backgroundColor: Colors.studios.pdf,
  },
  orientText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  orientTextActive: {
    color: Colors.surfaceWhite,
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
