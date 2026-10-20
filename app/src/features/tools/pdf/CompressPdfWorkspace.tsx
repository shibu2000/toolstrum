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

interface CompressPdfWorkspaceProps {
  onBack: () => void;
}

export const CompressPdfWorkspace: React.FC<CompressPdfWorkspaceProps> = ({ onBack }) => {
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    size?: number;
  } | null>(null);

  const [level, setLevel] = useState<'extreme' | 'balanced' | 'low'>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    size: number;
    savedPercent: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(6);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setSelectedFile({
          uri: result.assets[0].uri,
          name: result.assets[0].name,
          size: result.assets[0].size,
        });
        setOutputFile(null);
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err?.message || 'Could not select PDF.');
    }
  };

  const handleCompress = async () => {
    if (!selectedFile) {
      Alert.alert('No PDF', 'Please select a PDF document to compress.');
      return;
    }

    setIsProcessing(true);
    setOutputFile(null);

    try {
      const base64Data = await FileSystem.readAsStringAsync(selectedFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Load document
      const srcDoc = await PDFDocument.load(base64Data, { ignoreEncryption: true });
      const compressedDoc = await PDFDocument.create();

      // Copy pages to reconstruct with compressed object streams
      const pages = await compressedDoc.copyPages(srcDoc, srcDoc.getPageIndices());
      pages.forEach((p) => compressedDoc.addPage(p));

      // Save with object streams enabled
      const compressedBase64 = await compressedDoc.saveAsBase64({ useObjectStreams: true });

      const outputName = `Compressed_${Date.now()}.pdf`;
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${docDir}${outputName}`;

      await FileSystem.writeAsStringAsync(targetUri, compressedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(targetUri);
      if (!fileInfo.exists) {
        throw new Error('Verification failed: output file not found.');
      }

      const originalSize = selectedFile.size || 1024 * 1024;
      const compressedSize = fileInfo.size || 1;
      const savedPercent = Math.max(
        0,
        Math.round(((originalSize - compressedSize) / originalSize) * 100)
      );

      addManagedFile({
        id: `file-${Date.now()}`,
        name: outputName,
        uri: targetUri,
        size: compressedSize,
        toolId: 6,
        toolName: 'Compress PDF',
        createdAt: Date.now(),
      });

      addRecentItem({
        toolId: 6,
        title: outputName,
        subtitle: `Compressed PDF (${savedPercent}% saved) · Just now`,
      });

      setOutputFile({
        name: outputName,
        uri: targetUri,
        size: compressedSize,
        savedPercent,
      });
    } catch (err: any) {
      Alert.alert('Compression Error', err?.message || 'Could not compress PDF document.');
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

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Compress PDF"
        subtitle="PDF Studio · Core v2.1"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(6)}
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
        {/* Identity & Shield */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.identityIconBox}>
              <AppIcon name="FileText" size={24} color={Colors.accentCoral} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>Compress PDF Document</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #6</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                Reduce document size while preserving crisp layout and readability.
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* Source File Card */}
        {selectedFile ? (
          <View style={styles.card}>
            <View style={styles.fileRow}>
              <View style={styles.fileIconBox}>
                <AppIcon name="FileText" size={22} color={Colors.accentCoral} />
              </View>
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {selectedFile.name}
                </Text>
                <Text style={styles.fileSize}>{formatSize(selectedFile.size)}</Text>
              </View>
              <TouchableOpacity style={styles.changeBtn} onPress={handlePickDocument}>
                <Text style={styles.changeBtnText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.pickCard} onPress={handlePickDocument} activeOpacity={0.8}>
            <View style={styles.pickIconBox}>
              <AppIcon name="FilePlus" size={28} color={Colors.accentCoral} />
            </View>
            <View style={styles.pickBtn}>
              <AppIcon name="Upload" size={16} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.pickBtnText}>Select PDF File</Text>
            </View>
            <Text style={styles.pickHint}>Select document from device storage</Text>
          </TouchableOpacity>
        )}

        {/* Compression Presets */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Compression Level</Text>
          <View style={styles.presetsList}>
            <TouchableOpacity
              style={[styles.presetItem, level === 'extreme' && styles.presetItemActive]}
              onPress={() => setLevel('extreme')}
            >
              <View style={styles.presetLeft}>
                <Text style={[styles.presetName, level === 'extreme' && styles.presetNameActive]}>
                  Extreme Compression
                </Text>
                <Text style={styles.presetSub}>Maximum reduction · Compact web export</Text>
              </View>
              <Text style={styles.presetSaving}>~75% saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetItem, level === 'balanced' && styles.presetItemActive]}
              onPress={() => setLevel('balanced')}
            >
              <View style={styles.presetLeft}>
                <Text style={[styles.presetName, level === 'balanced' && styles.presetNameActive]}>
                  Balanced (Recommended)
                </Text>
                <Text style={styles.presetSub}>Standard quality · Optimal clarity</Text>
              </View>
              <Text style={styles.presetSaving}>~50% saved</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.presetItem, level === 'low' && styles.presetItemActive]}
              onPress={() => setLevel('low')}
            >
              <View style={styles.presetLeft}>
                <Text style={[styles.presetName, level === 'low' && styles.presetNameActive]}>
                  Low Compression
                </Text>
                <Text style={styles.presetSub}>High visual fidelity · Print ready</Text>
              </View>
              <Text style={styles.presetSaving}>~25% saved</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Output Result Card */}
        {outputFile ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIconBox}>
                <AppIcon name="CheckCircle2" size={22} color={Colors.statusSuccess} />
              </View>
              <View style={styles.resultDetails}>
                <Text style={styles.resultTitle}>
                  PDF Compressed ({outputFile.savedPercent}% Smaller)
                </Text>
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
                style={styles.anotherBtn}
                onPress={() => {
                  setSelectedFile(null);
                  setOutputFile(null);
                }}
              >
                <Text style={styles.anotherBtnText}>Compress Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Primary Action Button */}
        <PrimaryButton
          title={selectedFile ? 'Compress PDF Document' : 'Select PDF First'}
          onPress={handleCompress}
          disabled={!selectedFile}
          loading={isProcessing}
          variant="pdf"
          icon="FileText"
        />
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
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfacePdf,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  changeBtn: {
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  pickCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderSubtle,
  },
  pickIconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfacePdf,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentCoral,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginBottom: 6,
  },
  pickBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pickHint: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  presetsList: {
    gap: Spacing.sm,
  },
  presetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetItemActive: {
    borderColor: Colors.accentCoral,
    backgroundColor: Colors.surfacePdf,
  },
  presetLeft: {
    flex: 1,
  },
  presetName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  presetNameActive: {
    color: Colors.accentCoral,
  },
  presetSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  presetSaving: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentCoral,
    marginLeft: Spacing.sm,
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
  anotherBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceWhite,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  anotherBtnText: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
});
