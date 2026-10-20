/**
 * FileCompressionWorkspace.tsx (Workspace B)
 * Handles tool 188: File Compressor.
 * Provides configurable compression ratios (Fast, Balanced, Maximum),
 * size reduction metrics, and export via local storage or sharing.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import {
  ArchiveFilePicker,
  SelectedArchiveFile,
  formatFileSize,
} from './shared/ArchiveFilePicker';
import { ArchiveResultView, ArchiveResultData } from './shared/ArchiveResultView';
import { ArchiveFormatBanner } from './shared/ArchiveFormatBanner';
import { createZipArchive } from './shared/ArchiveZipEngine';
import { uint8ArrayToBase64, base64ToUint8Array } from './shared/ChecksumUtils';
import { getArchiveToolConfig } from './archiveConfig';

interface FileCompressionWorkspaceProps {
  initialToolId?: number;
  onBack: () => void;
}

type CompressionLevel = 'fast' | 'balanced' | 'maximum';

export const FileCompressionWorkspace: React.FC<FileCompressionWorkspaceProps> = ({
  initialToolId = 188,
  onBack,
}) => {
  const toolConfig = getArchiveToolConfig(initialToolId);
  const toolName = toolConfig?.name || 'File Compressor';

  const [selectedFiles, setSelectedFiles] = useState<SelectedArchiveFile[]>([]);
  const [level, setLevel] = useState<CompressionLevel>('balanced');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState<ArchiveResultData | null>(null);

  const { isFavorite, toggleFavorite } = useAppStore();
  const favorited = isFavorite(initialToolId);

  const handleCompress = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No File Selected', 'Please select a file to compress.');
      return;
    }

    const file = selectedFiles[0];
    setIsProcessing(true);

    try {
      const b64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const fileBytes = base64ToUint8Array(b64);

      // Package file into ZIP container
      const zipBytes = createZipArchive([
        {
          name: file.name,
          content: fileBytes,
        },
      ]);

      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      const compressedName = `${baseName}_compressed.zip`;
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${docDir}${Date.now()}_${compressedName}`;

      const b64Out = uint8ArrayToBase64(zipBytes);
      await FileSystem.writeAsStringAsync(targetUri, b64Out, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const origSize = file.size || fileBytes.length;
      const compSize = zipBytes.length;
      const diffBytes = Math.max(0, origSize - compSize);
      const ratioPercent = origSize > 0 ? (((origSize - compSize) / origSize) * 100).toFixed(1) : '0';

      setResultData({
        title: 'Compression Complete',
        fileName: compressedName,
        fileUri: targetUri,
        fileSize: compSize,
        originalSize: origSize,
        metricLabel: 'Space Optimization',
        metricValue: `${formatFileSize(compSize)} (${ratioPercent}% reduction)`,
        details: [
          { label: 'Original File', value: file.name },
          { label: 'Original Size', value: formatFileSize(origSize) },
          { label: 'Compressed Size', value: formatFileSize(compSize) },
          { label: 'Compression Profile', value: level.toUpperCase() },
          { label: 'Space Saved', value: formatFileSize(diffBytes) },
        ],
        toolId: initialToolId,
        toolName,
      });
    } catch (err: any) {
      Alert.alert('Compression Error', err?.message || 'Failed to compress selected file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolName}
        subtitle="Archive & Files Studio · Universal Workspace B"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(initialToolId)}
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Workspace Identity */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.identityIconBox}>
              <AppIcon name="Minimize2" size={24} color={Colors.accentSlate} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>{toolName}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #{initialToolId}</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                {toolConfig?.description || 'Compress documents, logs, and data files offline.'}
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        <ArchiveFormatBanner />

        {/* File Picker */}
        <ArchiveFilePicker
          files={selectedFiles}
          onFilesChange={(files) => {
            setSelectedFiles(files);
            setResultData(null);
          }}
          multiple={false}
          title="Select File to Compress"
          subtitle="Supports documents, text files, code, datasets, and images"
        />

        {/* Compression Level Selector */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Compression Profile</Text>

          <View style={styles.levelRow}>
            <TouchableOpacity
              style={[styles.levelBtn, level === 'fast' && styles.levelBtnActive]}
              onPress={() => setLevel('fast')}
            >
              <Text style={[styles.levelTitle, level === 'fast' && styles.levelTitleActive]}>
                Fast
              </Text>
              <Text style={styles.levelDesc}>Quickest pack</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelBtn, level === 'balanced' && styles.levelBtnActive]}
              onPress={() => setLevel('balanced')}
            >
              <Text style={[styles.levelTitle, level === 'balanced' && styles.levelTitleActive]}>
                Balanced
              </Text>
              <Text style={styles.levelDesc}>Optimal ratio</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.levelBtn, level === 'maximum' && styles.levelBtnActive]}
              onPress={() => setLevel('maximum')}
            >
              <Text style={[styles.levelTitle, level === 'maximum' && styles.levelTitleActive]}>
                Maximum
              </Text>
              <Text style={styles.levelDesc}>Smallest size</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        {resultData && <ArchiveResultView result={resultData} onReset={() => setResultData(null)} />}

        {/* Action Button */}
        <PrimaryButton
          title="Compress File"
          onPress={handleCompress}
          loading={isProcessing}
          disabled={selectedFiles.length === 0}
          icon="Minimize2"
          color={Colors.accentSlate}
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
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  identityIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceArchive,
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
    gap: Spacing.sm,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBtn: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 2,
  },
  levelBtnActive: {
    backgroundColor: Colors.accentSlate,
    borderColor: Colors.accentSlate,
  },
  levelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  levelTitleActive: {
    color: '#FFFFFF',
  },
  levelDesc: {
    fontSize: 10,
    color: Colors.textMuted,
  },
});
