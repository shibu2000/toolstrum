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
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface AddPdfPagesWorkspaceProps {
  onBack: () => void;
}

export const AddPdfPagesWorkspace: React.FC<AddPdfPagesWorkspaceProps> = ({ onBack }) => {
  const [baseDoc, setBaseDoc] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    base64: string;
  } | null>(null);

  const [insertSource, setInsertSource] = useState<{
    type: 'pdf' | 'image';
    name: string;
    uri: string;
    base64: string;
    pageCount?: number;
  } | null>(null);

  const [position, setPosition] = useState<'end' | 'start' | 'custom'>('end');
  const [targetPageNum, setTargetPageNum] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputDoc, setOutputDoc] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    sizeBytes: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(14);

  const handlePickBasePdf = async () => {
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

        setBaseDoc({
          name: asset.name,
          uri: asset.uri,
          pageCount: doc.getPageCount(),
          base64,
        });
        setOutputDoc(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load base PDF');
    }
  };

  const handlePickInsertPdf = async () => {
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

        setInsertSource({
          type: 'pdf',
          name: asset.name,
          uri: asset.uri,
          base64,
          pageCount: doc.getPageCount(),
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not load insert PDF');
    }
  };

  const handlePickInsertImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const asset = res.assets[0];
        const base64 = await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        setInsertSource({
          type: 'image',
          name: asset.fileName || 'photo.jpg',
          uri: asset.uri,
          base64,
          pageCount: 1,
        });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not pick image');
    }
  };

  const handleAddPages = async () => {
    if (!baseDoc || !insertSource) {
      Alert.alert('Missing Documents', 'Please select both a base PDF and pages to insert.');
      return;
    }

    setIsProcessing(true);

    try {
      const primaryDoc = await PDFDocument.load(baseDoc.base64);
      let insertionIndex = primaryDoc.getPageCount();

      if (position === 'start') {
        insertionIndex = 0;
      } else if (position === 'custom') {
        const pNum = parseInt(targetPageNum, 10);
        if (isNaN(pNum) || pNum < 1) {
          insertionIndex = 0;
        } else {
          insertionIndex = Math.min(primaryDoc.getPageCount(), pNum);
        }
      }

      if (insertSource.type === 'pdf') {
        const donorDoc = await PDFDocument.load(insertSource.base64);
        const donorIndices = Array.from({ length: donorDoc.getPageCount() }, (_, i) => i);
        const copiedPages = await primaryDoc.copyPages(donorDoc, donorIndices);

        for (let i = 0; i < copiedPages.length; i++) {
          primaryDoc.insertPage(insertionIndex + i, copiedPages[i]);
        }
      } else {
        // Image embedding
        const isPng = insertSource.name.toLowerCase().endsWith('.png');
        const embeddedImg = isPng
          ? await primaryDoc.embedPng(insertSource.base64)
          : await primaryDoc.embedJpg(insertSource.base64);

        const newPage = primaryDoc.insertPage(insertionIndex, [595.28, 841.89]); // A4
        const imgDims = embeddedImg.scaleToFit(550, 800);
        newPage.drawImage(embeddedImg, {
          x: (595.28 - imgDims.width) / 2,
          y: (841.89 - imgDims.height) / 2,
          width: imgDims.width,
          height: imgDims.height,
        });
      }

      const outBase64 = await primaryDoc.saveAsBase64();
      const finalCount = primaryDoc.getPageCount();
      const baseName = baseDoc.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_expanded_${Date.now()}.pdf`;
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
        toolOriginId: 14,
      });

      addRecentItem({
        toolId: 14,
        toolName: 'Add PDF Pages',
        studioId: 'pdf',
        summary: `Added pages to ${baseDoc.name} (${finalCount} pages total)`,
      });

      setOutputDoc({
        name: outName,
        uri: outUri,
        pageCount: finalCount,
        sizeBytes,
      });
    } catch (err: any) {
      Alert.alert('Processing Failed', err.message || 'Error occurred while adding pages.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!outputDoc) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(outputDoc.uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share PDF with Added Pages',
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
        title="Add PDF Pages"
        subtitle="PDF Studio · Tool #14"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'star' : 'star-outline',
          onPress: () => toggleFavorite(14),
          color: favorited ? Colors.warning : Colors.neutral500,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OfflineShield studioName="PDF Studio" />

        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.badgeRow}>
            <View style={styles.toolBadge}>
              <Text style={styles.toolBadgeText}>Tool #14 · PDF Studio</Text>
            </View>
            <View style={styles.subBadge}>
              <AppIcon name="file-text" size={12} color={Colors.studios.pdf} />
              <Text style={styles.subBadgeText}>Page Insertion Engine</Text>
            </View>
          </View>
          <Text style={styles.introTitle}>Add PDF Pages</Text>
          <Text style={styles.introDesc}>
            Insert additional pages from another PDF or full-resolution photos directly into any position.
          </Text>
        </View>

        {/* 1. Base PDF Document */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.pdfIconCircle}>
                <AppIcon name="file-text" size={18} color={Colors.studios.pdf} />
              </View>
              <Text style={styles.cardTitle}>1. Base Document</Text>
            </View>
            <TouchableOpacity style={styles.pickBtn} onPress={handlePickBasePdf}>
              <AppIcon name="upload" size={14} color={Colors.studios.pdf} />
              <Text style={styles.pickBtnText}>{baseDoc ? 'Replace' : 'Select PDF'}</Text>
            </TouchableOpacity>
          </View>

          {baseDoc ? (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsName} numberOfLines={1}>
                {baseDoc.name}
              </Text>
              <Text style={styles.detailsSub}>{baseDoc.pageCount} pages · Ready</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyBox} onPress={handlePickBasePdf}>
              <Text style={styles.emptyTitle}>Select base PDF to receive new pages</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 2. New Pages Source */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <View style={styles.pdfIconCircle}>
                <AppIcon name="plus" size={18} color={Colors.studios.pdf} />
              </View>
              <Text style={styles.cardTitle}>2. Content to Insert</Text>
            </View>
          </View>

          <View style={styles.insertChoiceRow}>
            <TouchableOpacity style={styles.choiceBtn} onPress={handlePickInsertPdf}>
              <AppIcon name="file-text" size={16} color={Colors.studios.pdf} />
              <Text style={styles.choiceBtnText}>From PDF File</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.choiceBtn} onPress={handlePickInsertImage}>
              <AppIcon name="image" size={16} color={Colors.studios.image} />
              <Text style={styles.choiceBtnText}>From Image / Photo</Text>
            </TouchableOpacity>
          </View>

          {insertSource && (
            <View style={styles.detailsBox}>
              <Text style={styles.detailsName} numberOfLines={1}>
                {insertSource.name}
              </Text>
              <Text style={styles.detailsSub}>
                Type: {insertSource.type.toUpperCase()} ·{' '}
                {insertSource.pageCount ? `${insertSource.pageCount} page(s)` : ''}
              </Text>
            </View>
          )}
        </View>

        {/* 3. Placement Position */}
        {baseDoc && insertSource && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>3. Insertion Placement</Text>
            <View style={styles.posGroup}>
              <TouchableOpacity
                style={[styles.posItem, position === 'end' && styles.posItemActive]}
                onPress={() => setPosition('end')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.posTitle, position === 'end' && styles.posTitleActive]}>
                    At the End (After Page {baseDoc.pageCount})
                  </Text>
                  <Text style={styles.posSub}>Appends new pages at the bottom of the document</Text>
                </View>
                {position === 'end' && <AppIcon name="check" size={16} color={Colors.studios.pdf} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.posItem, position === 'start' && styles.posItemActive]}
                onPress={() => setPosition('start')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.posTitle, position === 'start' && styles.posTitleActive]}>
                    At the Beginning (Before Page 1)
                  </Text>
                  <Text style={styles.posSub}>Inserts new pages as cover or introductory pages</Text>
                </View>
                {position === 'start' && (
                  <AppIcon name="check" size={16} color={Colors.studios.pdf} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.posItem, position === 'custom' && styles.posItemActive]}
                onPress={() => setPosition('custom')}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.posTitle, position === 'custom' && styles.posTitleActive]}>
                    After Specific Page Number
                  </Text>
                  <Text style={styles.posSub}>Inserts inside the body of the document</Text>
                </View>
                {position === 'custom' && (
                  <AppIcon name="check" size={16} color={Colors.studios.pdf} />
                )}
              </TouchableOpacity>
            </View>

            {position === 'custom' && (
              <View style={styles.customPageWrap}>
                <Text style={styles.inputLabel}>
                  Insert after page (1 to {baseDoc.pageCount}):
                </Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={targetPageNum}
                  onChangeText={setTargetPageNum}
                />
              </View>
            )}

            <View style={{ marginTop: Spacing.md }}>
              <PrimaryButton
                title={isProcessing ? 'Inserting Pages...' : 'Insert Pages & Save'}
                onPress={handleAddPages}
                loading={isProcessing}
                icon="plus"
              />
            </View>
          </View>
        )}

        {/* Output */}
        {outputDoc && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderLeft}>
                <View style={styles.iconCircleSuccess}>
                  <AppIcon name="check" size={16} color={Colors.success} />
                </View>
                <View>
                  <Text style={styles.cardTitle}>Document Updated</Text>
                  <Text style={styles.resultMeta}>
                    {outputDoc.pageCount} total pages · {(outputDoc.sizeBytes / 1024).toFixed(1)} KB
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
  detailsBox: {
    backgroundColor: Colors.neutral50,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  detailsName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral900,
  },
  detailsSub: {
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
  insertChoiceRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  choiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutral100,
    borderRadius: Radius.md,
  },
  choiceBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral800,
  },
  posGroup: {
    gap: Spacing.xs,
  },
  posItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.neutral50,
  },
  posItemActive: {
    backgroundColor: Colors.surfacePdf,
  },
  posTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral800,
  },
  posTitleActive: {
    color: Colors.studios.pdf,
  },
  posSub: {
    fontSize: 11,
    color: Colors.neutral500,
    marginTop: 2,
  },
  customPageWrap: {
    gap: 4,
    marginTop: Spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  textInput: {
    backgroundColor: Colors.neutral50,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.neutral900,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
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
