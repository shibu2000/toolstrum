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

interface CropPdfWorkspaceProps {
  onBack: () => void;
}

export const CropPdfWorkspace: React.FC<CropPdfWorkspaceProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    base64: string;
    width: number;
    height: number;
  } | null>(null);

  const [topMargin, setTopMargin] = useState(36);
  const [bottomMargin, setBottomMargin] = useState(36);
  const [leftMargin, setLeftMargin] = useState(18);
  const [rightMargin, setRightMargin] = useState(18);

  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    sizeBytes: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(15);

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

  const applyPreset = (t: number, b: number, l: number, r: number) => {
    setTopMargin(t);
    setBottomMargin(b);
    setLeftMargin(l);
    setRightMargin(r);
  };

  const handleCrop = async () => {
    if (!selectedFile) {
      Alert.alert('No Document', 'Please choose a PDF document first.');
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.load(selectedFile.base64);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { x, y, width, height } = page.getMediaBox();
        const newX = x + leftMargin;
        const newY = y + bottomMargin;
        const newW = Math.max(50, width - (leftMargin + rightMargin));
        const newH = Math.max(50, height - (topMargin + bottomMargin));

        page.setCropBox(newX, newY, newW, newH);
      }

      const outBase64 = await pdfDoc.saveAsBase64();
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_cropped_${Date.now()}.pdf`;
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
        toolOriginId: 15,
      });

      addRecentItem({
        toolId: 15,
        toolName: 'Crop PDF',
        studioId: 'pdf',
        summary: `Cropped margins (T:${topMargin} B:${bottomMargin} L:${leftMargin} R:${rightMargin} pt)`,
      });

      setOutputFile({
        name: outName,
        uri: outUri,
        pageCount: selectedFile.pageCount,
        sizeBytes,
      });
    } catch (err: any) {
      Alert.alert('Crop Failed', err.message || 'Could not crop PDF.');
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
          dialogTitle: 'Share Cropped PDF',
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
        title="Crop PDF"
        subtitle="PDF Studio · Tool #15"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'star' : 'star-outline',
          onPress: () => toggleFavorite(15),
          color: favorited ? Colors.warning : Colors.neutral500,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OfflineShield studioName="PDF Studio" />

        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.badgeRow}>
            <View style={styles.toolBadge}>
              <Text style={styles.toolBadgeText}>Tool #15 · PDF Studio</Text>
            </View>
            <View style={styles.subBadge}>
              <AppIcon name="crop" size={12} color={Colors.studios.pdf} />
              <Text style={styles.subBadgeText}>MediaBox Trimmer</Text>
            </View>
          </View>
          <Text style={styles.introTitle}>Crop PDF</Text>
          <Text style={styles.introDesc}>
            Trim excess outer margins, remove unwanted headers or footers, and customize crop boundaries.
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
                {selectedFile.pageCount} pages · Dimensions: {selectedFile.width} × {selectedFile.height} pt
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyBox} onPress={handlePickPdf}>
              <Text style={styles.emptyTitle}>Select a PDF to trim crop margins</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Margin Controls */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Crop Presets</Text>
          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => applyPreset(36, 36, 18, 18)}
            >
              <Text style={styles.presetBtnTitle}>Header & Footer</Text>
              <Text style={styles.presetBtnSub}>36pt top/bottom</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => applyPreset(24, 24, 24, 24)}
            >
              <Text style={styles.presetBtnTitle}>Equal Trim</Text>
              <Text style={styles.presetBtnSub}>24pt all sides</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => applyPreset(0, 0, 0, 0)}
            >
              <Text style={styles.presetBtnTitle}>Reset Box</Text>
              <Text style={styles.presetBtnSub}>0pt margin</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.cardTitle, { marginTop: Spacing.sm }]}>Trim Margin Values (Points)</Text>

          <View style={styles.marginGrid}>
            <View style={styles.marginItem}>
              <Text style={styles.marginLabel}>Top Margin: {topMargin} pt</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTopMargin((m) => Math.max(0, m - 6))}
                >
                  <AppIcon name="minus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setTopMargin((m) => m + 6)}
                >
                  <AppIcon name="plus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.marginItem}>
              <Text style={styles.marginLabel}>Bottom Margin: {bottomMargin} pt</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setBottomMargin((m) => Math.max(0, m - 6))}
                >
                  <AppIcon name="minus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setBottomMargin((m) => m + 6)}
                >
                  <AppIcon name="plus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.marginItem}>
              <Text style={styles.marginLabel}>Left Margin: {leftMargin} pt</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setLeftMargin((m) => Math.max(0, m - 6))}
                >
                  <AppIcon name="minus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setLeftMargin((m) => m + 6)}
                >
                  <AppIcon name="plus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.marginItem}>
              <Text style={styles.marginLabel}>Right Margin: {rightMargin} pt</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setRightMargin((m) => Math.max(0, m - 6))}
                >
                  <AppIcon name="minus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepBtn}
                  onPress={() => setRightMargin((m) => m + 6)}
                >
                  <AppIcon name="plus" size={14} color={Colors.neutral700} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ marginTop: Spacing.md }}>
            <PrimaryButton
              title={isProcessing ? 'Cropping PDF...' : 'Crop PDF Pages'}
              onPress={handleCrop}
              disabled={!selectedFile || isProcessing}
              loading={isProcessing}
              icon="crop"
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
                  <Text style={styles.cardTitle}>PDF Cropped</Text>
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
  presetRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  presetBtn: {
    flex: 1,
    backgroundColor: Colors.neutral50,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  presetBtnTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.neutral800,
  },
  presetBtnSub: {
    fontSize: 10,
    color: Colors.neutral500,
    marginTop: 2,
  },
  marginGrid: {
    gap: Spacing.xs,
  },
  marginItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral50,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  marginLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral800,
  },
  stepperRow: {
    flexDirection: 'row',
    gap: 8,
  },
  stepBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    backgroundColor: Colors.neutral200,
    alignItems: 'center',
    justifyContent: 'center',
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
