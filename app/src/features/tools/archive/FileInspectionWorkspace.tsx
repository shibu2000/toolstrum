/**
 * FileInspectionWorkspace.tsx (Workspace C)
 * Handles tools:
 *  - 189 File Type Detector
 *  - 190 File Size Analyzer
 *  - 197 MIME Type Inspector
 *  - 186 Archive File Inspector (inspection mode)
 *
 * Performs deep magic header byte inspection, size metrics (decimal & binary),
 * and official IANA / RFC MIME validation.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Clipboard from 'expo-clipboard';
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
import { base64ToUint8Array } from './shared/ChecksumUtils';
import { getArchiveToolConfig } from './archiveConfig';

interface FileInspectionWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

type InspectionTab = 'all' | 'type' | 'size' | 'mime';

interface DetailedFileInspection {
  fileName: string;
  fileSize: number;
  magicHex: string;
  detectedFormat: string;
  officialMime: string;
  rfcCategory: string;
  isBinary: boolean;
  extensionMismatch: boolean;
  expectedExtension: string;
  actualExtension: string;
  sizeBinary: string;
  sizeDecimal: string;
  allocatedBlocks4KB: number;
}

export const FileInspectionWorkspace: React.FC<FileInspectionWorkspaceProps> = ({
  initialToolId = 189,
  initialOperation,
  onBack,
}) => {
  const toolConfig = getArchiveToolConfig(initialToolId);
  const toolName = toolConfig?.name || 'File Inspection';

  const getInitialTab = (): InspectionTab => {
    const op = initialOperation || toolConfig?.defaultOperation;
    if (op === 'type_detect') return 'type';
    if (op === 'size_analyze') return 'size';
    if (op === 'mime_inspect') return 'mime';
    return 'all';
  };

  const [activeTab, setActiveTab] = useState<InspectionTab>(getInitialTab());
  const [selectedFiles, setSelectedFiles] = useState<SelectedArchiveFile[]>([]);
  const [inspection, setInspection] = useState<DetailedFileInspection | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { isFavorite, toggleFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(initialToolId);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [initialToolId, initialOperation]);

  // Magic header analyzer
  const analyzeHeader = (bytes: Uint8Array, fileName: string, size: number): DetailedFileInspection => {
    // Collect first 8 bytes as hex
    const hexSlice: string[] = [];
    for (let i = 0; i < Math.min(8, bytes.length); i++) {
      hexSlice.push(bytes[i].toString(16).padStart(2, '0').toUpperCase());
    }
    const magicHex = hexSlice.join(' ');

    const actualExt = (fileName.split('.').pop() || '').toLowerCase();
    let detectedFormat = 'Unknown Binary Data';
    let officialMime = 'application/octet-stream';
    let rfcCategory = 'Application';
    let isBinary = true;
    let expectedExt = actualExt;

    // Byte signature checks
    if (bytes.length >= 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
      detectedFormat = 'Portable Document Format (PDF)';
      officialMime = 'application/pdf';
      rfcCategory = 'Document';
      expectedExt = 'pdf';
    } else if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
      detectedFormat = 'Portable Network Graphics (PNG)';
      officialMime = 'image/png';
      rfcCategory = 'Image';
      expectedExt = 'png';
    } else if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
      detectedFormat = 'JPEG Image';
      officialMime = 'image/jpeg';
      rfcCategory = 'Image';
      expectedExt = 'jpg';
    } else if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) {
      if (actualExt === 'docx') {
        detectedFormat = 'Microsoft Word OpenXML (DOCX)';
        officialMime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        rfcCategory = 'Office Document';
        expectedExt = 'docx';
      } else if (actualExt === 'xlsx') {
        detectedFormat = 'Microsoft Excel OpenXML (XLSX)';
        officialMime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        rfcCategory = 'Spreadsheet';
        expectedExt = 'xlsx';
      } else {
        detectedFormat = 'ZIP Archive';
        officialMime = 'application/zip';
        rfcCategory = 'Archive';
        expectedExt = 'zip';
      }
    } else if (bytes.length >= 6 && bytes[0] === 0x37 && bytes[1] === 0x7a && bytes[2] === 0xbc && bytes[3] === 0xaf) {
      detectedFormat = '7-Zip Compressed Archive (7Z)';
      officialMime = 'application/x-7z-compressed';
      rfcCategory = 'Archive';
      expectedExt = '7z';
    } else if (bytes.length >= 2 && bytes[0] === 0x1f && bytes[1] === 0x8b) {
      detectedFormat = 'GZIP Compressed Stream (GZ)';
      officialMime = 'application/gzip';
      rfcCategory = 'Archive';
      expectedExt = 'gz';
    } else if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) {
      detectedFormat = 'Graphics Interchange Format (GIF)';
      officialMime = 'image/gif';
      rfcCategory = 'Image';
      expectedExt = 'gif';
    } else if (bytes.length >= 4 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      detectedFormat = 'RIFF Container (WebP / WAV / AVI)';
      officialMime = 'image/webp';
      rfcCategory = 'Multimedia';
      expectedExt = 'webp';
    } else {
      // Check if text/plain
      let asciiCount = 0;
      for (let i = 0; i < Math.min(bytes.length, 512); i++) {
        const c = bytes[i];
        if ((c >= 32 && c <= 126) || c === 9 || c === 10 || c === 13) {
          asciiCount++;
        }
      }
      if (bytes.length > 0 && asciiCount / Math.min(bytes.length, 512) > 0.9) {
        isBinary = false;
        rfcCategory = 'Text';
        if (actualExt === 'json') {
          detectedFormat = 'JavaScript Object Notation (JSON)';
          officialMime = 'application/json';
          expectedExt = 'json';
        } else if (actualExt === 'csv') {
          detectedFormat = 'Comma-Separated Values (CSV)';
          officialMime = 'text/csv';
          expectedExt = 'csv';
        } else if (actualExt === 'html' || actualExt === 'htm') {
          detectedFormat = 'HyperText Markup Language (HTML)';
          officialMime = 'text/html';
          expectedExt = 'html';
        } else {
          detectedFormat = 'Plain Text File (UTF-8)';
          officialMime = 'text/plain';
          expectedExt = 'txt';
        }
      }
    }

    const mismatch = expectedExt !== actualExt && expectedExt !== 'bin' && expectedExt !== '';

    // Sizing calculations
    const kib = (size / 1024).toFixed(2);
    const mib = (size / (1024 * 1024)).toFixed(3);
    const sizeBinary = size >= 1024 * 1024 ? `${mib} MiB (${kib} KiB)` : `${kib} KiB`;
    const sizeDecimal = formatFileSize(size);
    const allocatedBlocks4KB = Math.ceil(size / 4096) * 4;

    return {
      fileName,
      fileSize: size,
      magicHex,
      detectedFormat,
      officialMime,
      rfcCategory,
      isBinary,
      extensionMismatch: mismatch,
      expectedExtension: expectedExt,
      actualExtension: actualExt,
      sizeBinary,
      sizeDecimal,
      allocatedBlocks4KB,
    };
  };

  const handleInspect = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No File Selected', 'Please select a file to inspect.');
      return;
    }

    const file = selectedFiles[0];
    setIsProcessing(true);
    try {
      const b64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(b64);
      const res = analyzeHeader(bytes, file.name, file.size || bytes.length);
      setInspection(res);

      addRecentItem({
        toolId: initialToolId,
        title: file.name,
        subtitle: `${toolName} · ${res.detectedFormat}`,
      });
    } catch (err: any) {
      Alert.alert('Inspection Error', err?.message || 'Could not read file contents.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyReport = async () => {
    if (!inspection) return;
    const report = [
      `FILE INSPECTION REPORT`,
      `File Name: ${inspection.fileName}`,
      `Detected Format: ${inspection.detectedFormat}`,
      `MIME Type: ${inspection.officialMime}`,
      `RFC Category: ${inspection.rfcCategory}`,
      `Byte Signature: ${inspection.magicHex}`,
      `Exact Size: ${inspection.fileSize} bytes (${inspection.sizeDecimal})`,
      `Binary Sizing: ${inspection.sizeBinary}`,
      `Storage Block Footprint: ~${inspection.allocatedBlocks4KB} KB on 4KB cluster`,
      `Extension Match: ${inspection.extensionMismatch ? 'MISMATCH (Expected .' + inspection.expectedExtension + ')' : 'VALID'}`,
    ].join('\n');

    await Clipboard.setStringAsync(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolName}
        subtitle="Archive & Files Studio · Universal Workspace C"
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
              <AppIcon name="FileSearch" size={24} color={Colors.accentSlate} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>{toolName}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #{initialToolId}</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                {toolConfig?.description || 'Deep file inspection: magic bytes, MIME, and sizing.'}
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* View Mode Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'all' && styles.tabBtnActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              Full Audit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'type' && styles.tabBtnActive]}
            onPress={() => setActiveTab('type')}
          >
            <Text style={[styles.tabText, activeTab === 'type' && styles.tabTextActive]}>
              Format & Magic
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'size' && styles.tabBtnActive]}
            onPress={() => setActiveTab('size')}
          >
            <Text style={[styles.tabText, activeTab === 'size' && styles.tabTextActive]}>
              Size Metrics
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'mime' && styles.tabBtnActive]}
            onPress={() => setActiveTab('mime')}
          >
            <Text style={[styles.tabText, activeTab === 'mime' && styles.tabTextActive]}>
              MIME / RFC
            </Text>
          </TouchableOpacity>
        </View>

        {/* File Picker */}
        <ArchiveFilePicker
          files={selectedFiles}
          onFilesChange={(files) => {
            setSelectedFiles(files);
            setInspection(null);
          }}
          multiple={false}
          title="Select File to Inspect"
          subtitle="Inspect any document, image, audio, video, or data container"
        />

        {/* Inspection Details Card */}
        {inspection && (
          <View style={styles.reportCard}>
            {/* Header / Mismatch Alert */}
            {inspection.extensionMismatch ? (
              <View style={styles.alertBanner}>
                <AppIcon name="AlertTriangle" size={16} color={Colors.statusWarning} />
                <View style={styles.alertTextCol}>
                  <Text style={styles.alertTitle}>Extension Mismatch Detected</Text>
                  <Text style={styles.alertDesc}>
                    File has extension .{inspection.actualExtension}, but byte signatures indicate{' '}
                    .{inspection.expectedExtension} ({inspection.detectedFormat}).
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.cardHeader}>
              <View style={styles.badgeBox}>
                <AppIcon name="CheckCircle2" size={18} color={Colors.statusSuccess} />
                <Text style={styles.badgeTitle}>{inspection.detectedFormat}</Text>
              </View>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopyReport}>
                <AppIcon
                  name={copied ? 'Check' : 'Copy'}
                  size={14}
                  color={copied ? Colors.statusSuccess : Colors.onSurface}
                />
                <Text style={styles.copyBtnText}>{copied ? 'Copied' : 'Copy Report'}</Text>
              </TouchableOpacity>
            </View>

            {/* Metrics List */}
            <View style={styles.specsList}>
              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Magic Bytes (Header):</Text>
                <Text style={[styles.specValue, styles.monoText]}>{inspection.magicHex}</Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>MIME Type (IANA):</Text>
                <Text style={[styles.specValue, styles.monoText]}>{inspection.officialMime}</Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>RFC Category:</Text>
                <Text style={styles.specValue}>{inspection.rfcCategory}</Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Stream Encoding:</Text>
                <Text style={styles.specValue}>
                  {inspection.isBinary ? 'Binary Octet Stream' : 'Plain Text / UTF-8'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Exact Byte Count:</Text>
                <Text style={styles.specValue}>{inspection.fileSize.toLocaleString()} bytes</Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Binary (1024-based):</Text>
                <Text style={styles.specValue}>{inspection.sizeBinary}</Text>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specLabel}>Cluster Allocation:</Text>
                <Text style={styles.specValue}>~{inspection.allocatedBlocks4KB} KB (4KB blocks)</Text>
              </View>
            </View>
          </View>
        )}

        {/* Primary Action Button */}
        <PrimaryButton
          title="Analyze File Headers & Sizing"
          onPress={handleInspect}
          loading={isProcessing}
          disabled={selectedFiles.length === 0}
          icon="FileSearch"
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
    paddingVertical: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: Colors.accentSlate,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reportCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  alertBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: 8,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  alertDesc: {
    fontSize: 11,
    color: '#92400E',
    marginTop: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainerLow,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  copyBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  specsList: {
    gap: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  specLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  specValue: {
    fontSize: 12,
    color: Colors.onSurface,
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  monoText: {
    fontFamily: 'monospace',
    fontSize: 11,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: 4,
  },
});
