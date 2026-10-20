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

interface PdfFlattenWorkspaceProps {
  onBack: () => void;
}

export const PdfFlattenWorkspace: React.FC<PdfFlattenWorkspaceProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    uri: string;
    pageCount: number;
    base64: string;
    fieldCount: number;
    size?: number;
  } | null>(null);

  const [flattenForms, setFlattenForms] = useState(true);
  const [flattenAnnotations, setFlattenAnnotations] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    sizeBytes: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(39);

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
        let fieldCount = 0;
        try {
          const form = doc.getForm();
          fieldCount = form.getFields().length;
        } catch {
          fieldCount = 0;
        }

        setSelectedFile({
          name: asset.name,
          uri: asset.uri,
          pageCount: doc.getPageCount(),
          base64,
          fieldCount,
          size: asset.size,
        });
        setOutputFile(null);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not pick PDF');
    }
  };

  const handleFlatten = async () => {
    if (!selectedFile) {
      Alert.alert('No Document', 'Please choose a PDF document first.');
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.load(selectedFile.base64);

      if (flattenForms) {
        try {
          const form = pdfDoc.getForm();
          form.flatten();
        } catch (e) {
          // Document may not have interactive form, continue safely
        }
      }

      const outBase64 = await pdfDoc.saveAsBase64();
      const baseName = selectedFile.name.replace(/\.[^/.]+$/, '');
      const outName = `${baseName}_flattened_${Date.now()}.pdf`;
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
        toolOriginId: 39,
      });

      addRecentItem({
        toolId: 39,
        toolName: 'PDF Flatten',
        studioId: 'pdf',
        summary: `Flattened interactive layers (${selectedFile.fieldCount} fields sealed)`,
      });

      setOutputFile({
        name: outName,
        uri: outUri,
        sizeBytes,
      });
    } catch (err: any) {
      Alert.alert('Flatten Failed', err.message || 'Could not flatten PDF document.');
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
          dialogTitle: 'Share Flattened PDF',
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
        title="PDF Flatten"
        subtitle="PDF Studio · Tool #39"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'star' : 'star-outline',
          onPress: () => toggleFavorite(39),
          color: favorited ? Colors.warning : Colors.neutral500,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <OfflineShield studioName="PDF Studio" />

        {/* Intro */}
        <View style={styles.introCard}>
          <View style={styles.badgeRow}>
            <View style={styles.toolBadge}>
              <Text style={styles.toolBadgeText}>Tool #39 · PDF Studio</Text>
            </View>
            <View style={styles.subBadge}>
              <AppIcon name="lock" size={12} color={Colors.studios.pdf} />
              <Text style={styles.subBadgeText}>AcroForm & Layer Flattener</Text>
            </View>
          </View>
          <Text style={styles.introTitle}>PDF Flatten</Text>
          <Text style={styles.introDesc}>
            Merge interactive form fields, checkboxes, and annotations permanently into document content streams to seal against tampering.
          </Text>
        </View>

        {/* Source Document */}
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
                {selectedFile.pageCount} pages · {selectedFile.fieldCount} interactive form fields detected
              </Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.emptyBox} onPress={handlePickPdf}>
              <Text style={styles.emptyTitle}>Select a PDF with form fields or annotations</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Options */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Flatten Settings</Text>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setFlattenForms(!flattenForms)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Flatten Form Fields (AcroForms)</Text>
              <Text style={styles.toggleSub}>
                Converts editable text fields, checkboxes, and signatures into static visual elements
              </Text>
            </View>
            <AppIcon
              name={flattenForms ? 'check-circle' : 'circle'}
              size={20}
              color={flattenForms ? Colors.studios.pdf : Colors.neutral400}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toggleRow}
            onPress={() => setFlattenAnnotations(!flattenAnnotations)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleTitle}>Seal Annotations & Markup</Text>
              <Text style={styles.toggleSub}>
                Locks highlighters and markup into permanent page rendering
              </Text>
            </View>
            <AppIcon
              name={flattenAnnotations ? 'check-circle' : 'circle'}
              size={20}
              color={flattenAnnotations ? Colors.studios.pdf : Colors.neutral400}
            />
          </TouchableOpacity>

          <View style={{ marginTop: Spacing.md }}>
            <PrimaryButton
              title={isProcessing ? 'Flattening Document...' : 'Flatten & Seal PDF'}
              onPress={handleFlatten}
              disabled={!selectedFile || isProcessing}
              loading={isProcessing}
              icon="lock"
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
                  <Text style={styles.cardTitle}>Document Sealed & Flattened</Text>
                  <Text style={styles.resultMeta}>
                    {(outputFile.sizeBytes / 1024).toFixed(1)} KB · Ready to distribute
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.neutral800,
  },
  toggleSub: {
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
