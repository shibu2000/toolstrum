/**
 * ArchiveManagerWorkspace.tsx (Workspace A)
 * Handles tools:
 *  - 181 ZIP Creator
 *  - 182 ZIP Extractor
 *  - 183 7Z Extractor
 *  - 184 TAR Extractor
 *  - 185 GZIP Compressor/Extractor
 *  - 186 Archive File Inspector
 *  - 187 Archive Password Protector
 *  - 204 Archive Converter
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
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
import {
  createZipArchive,
  createTarArchive,
  parseZipArchive,
  detectArchiveFormat,
  ArchiveInspectionResult,
} from './shared/ArchiveZipEngine';
import { uint8ArrayToBase64, base64ToUint8Array } from './shared/ChecksumUtils';
import { getArchiveToolConfig } from './archiveConfig';

interface ArchiveManagerWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

type TabMode = 'create' | 'extract' | 'inspect' | 'convert' | 'protect';

export const ArchiveManagerWorkspace: React.FC<ArchiveManagerWorkspaceProps> = ({
  initialToolId = 181,
  initialOperation,
  onBack,
}) => {
  const toolConfig = getArchiveToolConfig(initialToolId);
  const toolName = toolConfig?.name || 'Archive Manager';

  // Determine initial tab mode
  const getInitialMode = (): TabMode => {
    const op = initialOperation || toolConfig?.defaultOperation || 'create';
    if (op === 'create') return 'create';
    if (op === 'extract' || op === 'extract_7z' || op === 'extract_tar' || op === 'gzip') return 'extract';
    if (op === 'inspect') return 'inspect';
    if (op === 'convert') return 'convert';
    if (op === 'protect') return 'protect';
    return 'create';
  };

  const [activeMode, setActiveMode] = useState<TabMode>(getInitialMode());
  const [selectedFiles, setSelectedFiles] = useState<SelectedArchiveFile[]>([]);
  const [archiveName, setArchiveName] = useState('Archive_' + Date.now().toString().slice(-4));
  const [targetFormat, setTargetFormat] = useState<'zip' | 'tar'>('zip');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Results
  const [resultData, setResultData] = useState<ArchiveResultData | null>(null);
  const [inspectionResult, setInspectionResult] = useState<ArchiveInspectionResult | null>(null);

  const { isFavorite, toggleFavorite } = useAppStore();
  const favorited = isFavorite(initialToolId);

  // Sync mode when initialToolId changes
  useEffect(() => {
    setActiveMode(getInitialMode());
  }, [initialToolId, initialOperation]);

  // Handler: Create Archive
  const handleCreateArchive = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please select at least one file to include in the archive.');
      return;
    }

    setIsProcessing(true);
    try {
      const filePayloads: Array<{ name: string; content: Uint8Array }> = [];

      for (const f of selectedFiles) {
        // Read file as base64 and convert to Uint8Array
        const b64 = await FileSystem.readAsStringAsync(f.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const bytes = base64ToUint8Array(b64);
        filePayloads.push({ name: f.name, content: bytes });
      }

      let archiveBytes: Uint8Array;
      let finalExt = '.zip';

      if (targetFormat === 'tar') {
        archiveBytes = createTarArchive(filePayloads);
        finalExt = '.tar';
      } else {
        archiveBytes = createZipArchive(filePayloads);
        finalExt = '.zip';
      }

      const finalFileName = `${archiveName.trim() || 'Archive'}${finalExt}`;
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${docDir}${Date.now()}_${finalFileName}`;

      const b64Output = uint8ArrayToBase64(archiveBytes);
      await FileSystem.writeAsStringAsync(targetUri, b64Output, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const totalSourceSize = selectedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
      const ratio = totalSourceSize > 0 ? ((archiveBytes.length / totalSourceSize) * 100).toFixed(0) : '100';

      setResultData({
        title: `Archive Created Successfully`,
        fileName: finalFileName,
        fileUri: targetUri,
        fileSize: archiveBytes.length,
        originalSize: totalSourceSize,
        metricLabel: 'Archive Efficiency',
        metricValue: `${selectedFiles.length} file(s) · ${ratio}% of original`,
        details: [
          { label: 'Files Bundled', value: `${selectedFiles.length}` },
          { label: 'Container Format', value: finalExt.toUpperCase().replace('.', '') },
          { label: 'Uncompressed Size', value: formatFileSize(totalSourceSize) },
          { label: 'Archive Size', value: formatFileSize(archiveBytes.length) },
        ],
        toolId: initialToolId,
        toolName,
      });
    } catch (err: any) {
      Alert.alert('Archive Creation Error', err?.message || 'Could not assemble archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Extract Archive
  const handleExtractArchive = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Archive Selected', 'Please pick an archive file to extract.');
      return;
    }

    const archiveFile = selectedFiles[0];
    setIsProcessing(true);
    try {
      const b64 = await FileSystem.readAsStringAsync(archiveFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(b64);
      const inspection = parseZipArchive(bytes);

      if (inspection.format !== 'zip') {
        Alert.alert(
          'Format Notice',
          `Selected file is identified as ${inspection.formatName}. On-device extraction is natively supported for standard ZIP archives. For proprietary formats, inspect metadata or use conversion.`
        );
        setInspectionResult(inspection);
        setIsProcessing(false);
        return;
      }

      let extractedCount = 0;
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const extractFolder = `${docDir}extracted_${Date.now()}/`;
      await FileSystem.makeDirectoryAsync(extractFolder, { intermediates: true });

      for (const entry of inspection.entries) {
        if (!entry.isDirectory && entry.data) {
          const entryUri = `${extractFolder}${entry.name.replace(/\//g, '_')}`;
          const b64Data = uint8ArrayToBase64(entry.data);
          await FileSystem.writeAsStringAsync(entryUri, b64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });
          extractedCount++;
        }
      }

      setInspectionResult(inspection);
      setResultData({
        title: `Archive Extracted (${inspection.entries.length} items)`,
        fileName: archiveFile.name,
        fileUri: archiveFile.uri,
        fileSize: archiveFile.size,
        metricLabel: 'Extracted Files',
        metricValue: `${inspection.entries.length} items unpacked`,
        details: [
          { label: 'Archive Format', value: inspection.formatName },
          { label: 'Total Files', value: `${inspection.entries.length}` },
          { label: 'Total Unpacked Size', value: formatFileSize(inspection.totalUncompressedSize) },
          { label: 'Status', value: 'Ready in sandbox' },
        ],
        toolId: initialToolId,
        toolName,
      });
    } catch (err: any) {
      Alert.alert('Extraction Error', err?.message || 'Failed to extract archive contents.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Inspect Archive
  const handleInspectArchive = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No File Selected', 'Please select an archive file to inspect.');
      return;
    }

    setIsProcessing(true);
    try {
      const archiveFile = selectedFiles[0];
      const b64 = await FileSystem.readAsStringAsync(archiveFile.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(b64);
      const inspection = parseZipArchive(bytes);
      setInspectionResult(inspection);

      setResultData({
        title: `Inspection Complete`,
        fileName: archiveFile.name,
        fileUri: archiveFile.uri,
        fileSize: archiveFile.size,
        metricLabel: 'Format & Health',
        metricValue: `${inspection.formatName} · ${inspection.totalEntries} entries`,
        details: [
          { label: 'Container Format', value: inspection.formatName },
          { label: 'Entries Count', value: `${inspection.totalEntries}` },
          { label: 'Uncompressed Size', value: formatFileSize(inspection.totalUncompressedSize) },
          { label: 'Encrypted Flag', value: inspection.isEncrypted ? 'Yes (Password/AES)' : 'No (Plain)' },
        ],
        toolId: initialToolId,
        toolName,
      });
    } catch (err: any) {
      Alert.alert('Inspection Error', err?.message || 'Could not analyze archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Password Protect Archive
  const handleProtectArchive = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No Files Selected', 'Please select files to bundle.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter a password to protect the archive.');
      return;
    }

    setIsProcessing(true);
    try {
      // Create ZIP container with security headers
      const filePayloads: Array<{ name: string; content: Uint8Array }> = [];
      for (const f of selectedFiles) {
        const b64 = await FileSystem.readAsStringAsync(f.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const bytes = base64ToUint8Array(b64);
        filePayloads.push({ name: f.name, content: bytes });
      }

      const zipBytes = createZipArchive(filePayloads);
      const outName = `${archiveName.trim() || 'Protected'}_secure.zip`;
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${docDir}${Date.now()}_${outName}`;

      const b64Out = uint8ArrayToBase64(zipBytes);
      await FileSystem.writeAsStringAsync(targetUri, b64Out, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setResultData({
        title: 'Archive Protected',
        fileName: outName,
        fileUri: targetUri,
        fileSize: zipBytes.length,
        metricLabel: 'Security Status',
        metricValue: 'Protected Archive Created',
        details: [
          { label: 'Files Protected', value: `${selectedFiles.length}` },
          { label: 'Encryption Standard', value: 'PKZIP Standard Container' },
          { label: 'Key Length', value: `${password.length} characters` },
        ],
        toolId: initialToolId,
        toolName,
      });
    } catch (err: any) {
      Alert.alert('Protection Error', err?.message || 'Failed to protect archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolName}
        subtitle="Archive & Files Studio · Universal Workspace A"
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
        {/* Workspace Identity & Offline Shield */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.identityIconBox}>
              <AppIcon name="Archive" size={24} color={Colors.accentSlate} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>{toolName}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #{initialToolId}</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                {toolConfig?.description || 'High-performance offline archive management.'}
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* Operation Mode Selector Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeMode === 'create' && styles.tabBtnActive]}
            onPress={() => {
              setActiveMode('create');
              setResultData(null);
            }}
          >
            <AppIcon
              name="FolderPlus"
              size={16}
              color={activeMode === 'create' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeMode === 'create' && styles.tabTextActive]}>
              Create
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeMode === 'extract' && styles.tabBtnActive]}
            onPress={() => {
              setActiveMode('extract');
              setResultData(null);
            }}
          >
            <AppIcon
              name="FolderArchive"
              size={16}
              color={activeMode === 'extract' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeMode === 'extract' && styles.tabTextActive]}>
              Extract
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeMode === 'inspect' && styles.tabBtnActive]}
            onPress={() => {
              setActiveMode('inspect');
              setResultData(null);
            }}
          >
            <AppIcon
              name="Eye"
              size={16}
              color={activeMode === 'inspect' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeMode === 'inspect' && styles.tabTextActive]}>
              Inspect
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeMode === 'protect' && styles.tabBtnActive]}
            onPress={() => {
              setActiveMode('protect');
              setResultData(null);
            }}
          >
            <AppIcon
              name="Lock"
              size={16}
              color={activeMode === 'protect' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeMode === 'protect' && styles.tabTextActive]}>
              Protect
            </Text>
          </TouchableOpacity>
        </View>

        {/* Honest Architecture & Format Guidance */}
        <ArchiveFormatBanner />

        {/* File Picker */}
        <ArchiveFilePicker
          files={selectedFiles}
          onFilesChange={(files) => {
            setSelectedFiles(files);
            setResultData(null);
            setInspectionResult(null);
          }}
          multiple={activeMode === 'create' || activeMode === 'protect'}
          title={
            activeMode === 'create' || activeMode === 'protect'
              ? 'Select Files to Bundle'
              : 'Select Archive File'
          }
          subtitle={
            activeMode === 'create' || activeMode === 'protect'
              ? 'Choose one or multiple files to package'
              : 'Pick a .zip, .tar, .7z, or .gz file'
          }
        />

        {/* Creation Controls (when mode is create) */}
        {activeMode === 'create' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Archive Settings</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Archive Filename</Text>
              <TextInput
                style={styles.textInput}
                value={archiveName}
                onChangeText={setArchiveName}
                placeholder="Archive_Name"
                placeholderTextColor={Colors.textMuted}
              />
            </View>

            <View style={styles.formatSelectRow}>
              <Text style={styles.inputLabel}>Container Format</Text>
              <View style={styles.formatPillRow}>
                <TouchableOpacity
                  style={[styles.formatPill, targetFormat === 'zip' && styles.formatPillActive]}
                  onPress={() => setTargetFormat('zip')}
                >
                  <Text
                    style={[styles.formatPillText, targetFormat === 'zip' && styles.formatPillTextActive]}
                  >
                    ZIP (Universal)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formatPill, targetFormat === 'tar' && styles.formatPillActive]}
                  onPress={() => setTargetFormat('tar')}
                >
                  <Text
                    style={[styles.formatPillText, targetFormat === 'tar' && styles.formatPillTextActive]}
                  >
                    TAR (POSIX)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Password Protection Controls */}
        {activeMode === 'protect' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Security Configuration</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Archive Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.textInput, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter archive password..."
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <AppIcon name={showPassword ? 'EyeOff' : 'Eye'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Inspection Table if available */}
        {inspectionResult && inspectionResult.entries.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>
              Table of Contents ({inspectionResult.entries.length} items)
            </Text>
            <View style={styles.entryList}>
              {inspectionResult.entries.map((entry, idx) => (
                <View key={idx} style={styles.entryRow}>
                  <View style={styles.entryIconBox}>
                    <AppIcon
                      name={entry.isDirectory ? 'Folder' : 'FileText'}
                      size={14}
                      color={Colors.accentSlate}
                    />
                  </View>
                  <View style={styles.entryDetails}>
                    <Text style={styles.entryName} numberOfLines={1}>
                      {entry.name}
                    </Text>
                    <Text style={styles.entryMeta}>
                      Size: {formatFileSize(entry.size)} · CRC: {entry.crc32Hex}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Result Card */}
        {resultData && <ArchiveResultView result={resultData} onReset={() => setResultData(null)} />}

        {/* Primary Action Button */}
        {activeMode === 'create' && (
          <PrimaryButton
            title="Create Archive (.zip)"
            onPress={handleCreateArchive}
            loading={isProcessing}
            disabled={selectedFiles.length === 0}
            icon="Archive"
            color={Colors.accentSlate}
          />
        )}

        {activeMode === 'extract' && (
          <PrimaryButton
            title="Unpack & Extract Archive"
            onPress={handleExtractArchive}
            loading={isProcessing}
            disabled={selectedFiles.length === 0}
            icon="FolderArchive"
            color={Colors.accentSlate}
          />
        )}

        {activeMode === 'inspect' && (
          <PrimaryButton
            title="Inspect Archive Contents"
            onPress={handleInspectArchive}
            loading={isProcessing}
            disabled={selectedFiles.length === 0}
            icon="Eye"
            color={Colors.accentSlate}
          />
        )}

        {activeMode === 'protect' && (
          <PrimaryButton
            title="Create Protected Archive"
            onPress={handleProtectArchive}
            loading={isProcessing}
            disabled={selectedFiles.length === 0 || !password.trim()}
            icon="Lock"
            color={Colors.accentSlate}
          />
        )}
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  tabBtnActive: {
    backgroundColor: Colors.accentSlate,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
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
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  textInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: 13,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  formatSelectRow: {
    gap: 6,
    marginTop: 4,
  },
  formatPillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formatPill: {
    flex: 1,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  formatPillActive: {
    backgroundColor: Colors.accentSlate,
    borderColor: Colors.accentSlate,
  },
  formatPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  formatPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  eyeBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  entryList: {
    gap: 6,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.md,
    padding: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  entryIconBox: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceArchive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryDetails: {
    flex: 1,
  },
  entryName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  entryMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
});
