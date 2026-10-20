/**
 * FileSharingWorkspace.tsx (Workspace G)
 * Handles tool 201: File Sharing Utility.
 * Provides on-device file sharing via native system sheet, integrity validation,
 * and managed files selection with zero cloud relays.
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
import * as Sharing from 'expo-sharing';
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
import { sha256, base64ToUint8Array } from './shared/ChecksumUtils';
import { getArchiveToolConfig } from './archiveConfig';

interface FileSharingWorkspaceProps {
  initialToolId?: number;
  onBack: () => void;
}

export const FileSharingWorkspace: React.FC<FileSharingWorkspaceProps> = ({
  initialToolId = 201,
  onBack,
}) => {
  const toolConfig = getArchiveToolConfig(initialToolId);
  const toolName = toolConfig?.name || 'File Sharing Utility';

  const [selectedFiles, setSelectedFiles] = useState<SelectedArchiveFile[]>([]);
  const [fileHash, setFileHash] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { managedFiles, isFavorite, toggleFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(initialToolId);

  // Compute hash when file selected
  useEffect(() => {
    if (selectedFiles.length > 0) {
      computeHash(selectedFiles[0]);
    } else {
      setFileHash(null);
    }
  }, [selectedFiles]);

  const computeHash = async (file: SelectedArchiveFile) => {
    try {
      const b64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(b64);
      setFileHash(sha256(bytes));
    } catch {
      setFileHash(null);
    }
  };

  const handlePickFromManaged = (file: (typeof managedFiles)[0]) => {
    setSelectedFiles([
      {
        id: file.id,
        name: file.name,
        uri: file.uri,
        size: file.size,
      },
    ]);
  };

  const handleShare = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No File Selected', 'Please select a file to share.');
      return;
    }

    const file = selectedFiles[0];
    setIsProcessing(true);
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'Native sharing is not supported on this device.');
        return;
      }

      await Sharing.shareAsync(file.uri);

      addRecentItem({
        toolId: initialToolId,
        title: file.name,
        subtitle: `${toolName} · Shared via device sheet`,
      });
    } catch (err: any) {
      Alert.alert('Sharing Error', err?.message || 'Could not trigger native share sheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolName}
        subtitle="Archive & Files Studio · Universal Workspace G"
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
              <AppIcon name="Share2" size={24} color={Colors.accentSlate} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>{toolName}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #{initialToolId}</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                {toolConfig?.description || 'Secure, direct on-device file dispatch.'}
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* Privacy Pledge Card */}
        <View style={styles.privacyCard}>
          <View style={styles.privacyIconBox}>
            <AppIcon name="ShieldCheck" size={20} color={Colors.statusSuccess} />
          </View>
          <View style={styles.privacyDetails}>
            <Text style={styles.privacyTitle}>Direct On-Device Transfer</Text>
            <Text style={styles.privacySubtitle}>
              Files are passed directly to your system's share sheet. Zero cloud relays, zero tracking,
              and 100% private.
            </Text>
          </View>
        </View>

        {/* File Picker */}
        <ArchiveFilePicker
          files={selectedFiles}
          onFilesChange={setSelectedFiles}
          multiple={false}
          title="Select File to Share"
          subtitle="Choose any local file from device storage"
        />

        {/* Quick Pick From My Files (Managed Files) */}
        {managedFiles.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Or Pick from Managed Files</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.managedRow}>
              {managedFiles.slice(0, 6).map((file) => (
                <TouchableOpacity
                  key={file.id}
                  style={styles.managedItem}
                  onPress={() => handlePickFromManaged(file)}
                >
                  <AppIcon name="FileText" size={16} color={Colors.accentSlate} />
                  <Text style={styles.managedName} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={styles.managedSize}>{formatFileSize(file.size)}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* File Preview Card */}
        {selectedFiles.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Ready to Dispatch</Text>
            <View style={styles.filePreviewBox}>
              <View style={styles.filePreviewTop}>
                <AppIcon name="File" size={20} color={Colors.accentSlate} />
                <Text style={styles.previewName}>{selectedFiles[0].name}</Text>
              </View>
              <Text style={styles.previewMeta}>
                Size: {formatFileSize(selectedFiles[0].size)}
              </Text>
              {fileHash && (
                <View style={styles.hashRow}>
                  <Text style={styles.hashLabel}>SHA-256:</Text>
                  <Text style={styles.hashText} numberOfLines={1}>
                    {fileHash}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Action Button */}
        <PrimaryButton
          title="Open Native Share Sheet"
          onPress={handleShare}
          loading={isProcessing}
          disabled={selectedFiles.length === 0}
          icon="Share2"
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
  privacyCard: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  privacyIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  privacyDetails: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  privacySubtitle: {
    fontSize: 11,
    color: Colors.neutral700,
    marginTop: 2,
    lineHeight: 15,
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
  managedRow: {
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  managedItem: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    width: 130,
    gap: 3,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  managedName: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  managedSize: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  filePreviewBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 6,
  },
  filePreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
  },
  previewMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  hashRow: {
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  hashLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  hashText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: Colors.neutral700,
    marginTop: 1,
  },
});
