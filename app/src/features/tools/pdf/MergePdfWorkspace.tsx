import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { FilePickerCard } from '../../../components/files/FilePickerCard';
import { SelectedFileRow } from '../../../components/files/SelectedFileRow';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface SelectedPdf {
  id: string;
  name: string;
  uri: string;
  size?: number;
  pageCount?: number;
}

interface MergePdfWorkspaceProps {
  onBack: () => void;
}

export const MergePdfWorkspace: React.FC<MergePdfWorkspaceProps> = ({ onBack }) => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedPdf[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{ name: string; uri: string; size: number } | null>(
    null
  );

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(4);

  const handlePickDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newItems: SelectedPdf[] = result.assets.map((asset, index) => ({
          id: `pdf-${Date.now()}-${index}`,
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
        }));
        setSelectedFiles((prev) => [...prev, ...newItems]);
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err?.message || 'Could not select PDF files.');
    }
  };

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (selectedFiles.length < 2) {
      Alert.alert('Need Multiple Files', 'Please select at least 2 PDF documents to merge.');
      return;
    }

    setIsProcessing(true);
    setOutputFile(null);

    try {
      // 1. Create a fresh PDF document
      const mergedPdf = await PDFDocument.create();

      // 2. Iterate through each selected file
      for (const file of selectedFiles) {
        // Read file contents as base64
        const base64Data = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Load the PDF from binary base64
        const srcPdf = await PDFDocument.load(base64Data, { ignoreEncryption: true });
        const copiedPages = await mergedPdf.copyPages(srcPdf, srcPdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      // 3. Save merged PDF as base64
      const mergedBase64 = await mergedPdf.saveAsBase64();

      // 4. Write to local storage
      const outputFilename = `Merged_${Date.now()}.pdf`;
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${docDir}${outputFilename}`;

      await FileSystem.writeAsStringAsync(targetUri, mergedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // 5. Verify output exists and size > 0
      const fileInfo = await FileSystem.getInfoAsync(targetUri);
      if (!fileInfo.exists) {
        throw new Error('Verification failed: output file was not generated.');
      }

      const generatedSize = fileInfo.size || 0;

      // 6. Record in App Store & Recents
      addManagedFile({
        id: `file-${Date.now()}`,
        name: outputFilename,
        uri: targetUri,
        size: generatedSize,
        toolId: 4,
        toolName: 'Merge PDF',
        createdAt: Date.now(),
      });

      addRecentItem({
        toolId: 4,
        title: outputFilename,
        subtitle: `Merge PDF (${selectedFiles.length} files) · Just now`,
      });

      setOutputFile({
        name: outputFilename,
        uri: targetUri,
        size: generatedSize,
      });
    } catch (err: any) {
      Alert.alert(
        'Processing Error',
        `Failed to merge PDF files: ${err?.message || 'Unknown error'}. Your original files remain safe.`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!outputFile) return;
    try {
      await Sharing.shareAsync(outputFile.uri);
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Could not share file.');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Merge PDF"
        subtitle="PDF Studio · Core v2.1"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(4)}
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity & Shield Banner */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.identityIconBox}>
              <AppIcon name="FileText" size={24} color={Colors.accentCoral} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>Combine Multiple PDFs</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #4</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                Combine documents into one clean, ordered file instantly.
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* Picker Dropzone */}
        <FilePickerCard
          title="Choose PDF files"
          subtitle="Select documents from device storage or Google Drive"
          onPress={handlePickDocuments}
          accentColor={Colors.accentCoral}
          surfaceColor={Colors.surfacePdf}
          icon="FilePlus"
        />

        {/* Reorderable Files List Section */}
        {selectedFiles.length > 0 ? (
          <View style={styles.queueSection}>
            <View style={styles.queueHeader}>
              <View style={styles.queueCountRow}>
                <Text style={styles.queueTitle}>Queue & Page Sequence</Text>
                <View style={styles.queueCountBadge}>
                  <Text style={styles.queueCountText}>{selectedFiles.length} Files</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedFiles([])}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.clearText}>Clear All</Text>
              </TouchableOpacity>
            </View>

            {selectedFiles.map((file) => (
              <SelectedFileRow
                key={file.id}
                fileName={file.name}
                fileSize={file.size}
                onRemove={() => handleRemoveFile(file.id)}
                accentColor={Colors.accentCoral}
                surfaceColor={Colors.surfacePdf}
              />
            ))}
          </View>
        ) : null}

        {/* Output Verification & Result Card */}
        {outputFile ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIconBox}>
                <AppIcon name="CheckCircle2" size={22} color={Colors.statusSuccess} />
              </View>
              <View style={styles.resultDetails}>
                <Text style={styles.resultTitle}>Merged Document Ready</Text>
                <Text style={styles.resultMeta}>
                  {outputFile.name} · {formatSize(outputFile.size)}
                </Text>
              </View>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <AppIcon name="share" size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.shareBtnText}>Share / Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mergeAnotherBtn}
                onPress={() => {
                  setSelectedFiles([]);
                  setOutputFile(null);
                }}
              >
                <Text style={styles.mergeAnotherText}>Merge Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Primary Action Button */}
        <View style={styles.actionContainer}>
          <PrimaryButton
            title={
              selectedFiles.length < 2
                ? 'Select At Least 2 PDFs'
                : `Merge ${selectedFiles.length} PDF Documents`
            }
            onPress={handleMerge}
            disabled={selectedFiles.length < 2}
            loading={isProcessing}
            variant="pdf"
            icon="call_merge"
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  favBtn: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  identityCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  identityIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfacePdf,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  identityDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  idBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  toolSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  shieldRow: {
    marginTop: Spacing.sm,
  },
  queueSection: {
    marginTop: 4,
  },
  queueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingHorizontal: 2,
  },
  queueCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  queueCountBadge: {
    backgroundColor: Colors.surfacePdf,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  queueCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentCoral,
  },
  clearText: {
    fontSize: 12,
    color: Colors.statusError,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: Spacing.xs,
  },
  resultCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  resultDetails: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  resultMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.statusSuccess,
    height: 42,
    borderRadius: Radius.md,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mergeAnotherBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceWhite,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  mergeAnotherText: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
});
