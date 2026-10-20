/**
 * ArchiveFilePicker.tsx
 * Unified file picker supporting single and multi-file selection from device storage,
 * displaying file sizes, MIME type hints, and quick-clear actions.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Radius, Spacing } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

export interface SelectedArchiveFile {
  id: string;
  name: string;
  uri: string;
  size?: number;
  mimeType?: string;
}

interface ArchiveFilePickerProps {
  files: SelectedArchiveFile[];
  onFilesChange: (files: SelectedArchiveFile[]) => void;
  multiple?: boolean;
  allowedTypes?: string[];
  title?: string;
  subtitle?: string;
  maxFiles?: number;
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ArchiveFilePicker: React.FC<ArchiveFilePickerProps> = ({
  files,
  onFilesChange,
  multiple = true,
  allowedTypes = ['*/*'],
  title = 'Select Files',
  subtitle = 'Choose files from device storage to process',
  maxFiles = 50,
}) => {
  const handlePick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes.length === 1 ? allowedTypes[0] : allowedTypes,
        multiple,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newFiles: SelectedArchiveFile[] = result.assets.map((asset, index) => ({
          id: `file-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          mimeType: asset.mimeType,
        }));

        if (multiple) {
          const combined = [...files, ...newFiles].slice(0, maxFiles);
          onFilesChange(combined);
        } else {
          onFilesChange([newFiles[0]]);
        }
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err?.message || 'Failed to select files.');
    }
  };

  const handleRemove = (id: string) => {
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    onFilesChange([]);
  };

  const getExtension = (filename: string): string => {
    const ext = filename.split('.').pop();
    return ext && ext !== filename ? ext.toUpperCase() : 'FILE';
  };

  return (
    <View style={styles.container}>
      {/* Header & Controls */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {files.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearText}>Clear ({files.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Pick Trigger Button / Drop Box */}
      <TouchableOpacity
        style={[styles.pickerBox, files.length > 0 && styles.pickerBoxCompact]}
        onPress={handlePick}
        activeOpacity={0.7}
      >
        <View style={styles.iconCircle}>
          <AppIcon name="Upload" size={20} color={Colors.accentSlate} />
        </View>
        <View style={styles.pickerTextGroup}>
          <Text style={styles.pickerPrimaryText}>
            {files.length === 0
              ? multiple
                ? 'Tap to Browse & Select Files'
                : 'Tap to Select File'
              : 'Add More Files'}
          </Text>
          <Text style={styles.pickerSecondaryText}>
            Supports all local documents, media, and archive formats
          </Text>
        </View>
      </TouchableOpacity>

      {/* Selected File List */}
      {files.length > 0 && (
        <View style={styles.fileList}>
          {files.map((file) => (
            <View key={file.id} style={styles.fileRow}>
              <View style={styles.extBadge}>
                <Text style={styles.extText}>{getExtension(file.name).slice(0, 4)}</Text>
              </View>
              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileMeta}>{formatFileSize(file.size)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemove(file.id)}
                style={styles.removeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="X" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.statusError,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.outlineVariant,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  pickerBoxCompact: {
    paddingVertical: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceArchive,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerTextGroup: {
    flex: 1,
  },
  pickerPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  pickerSecondaryText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  fileList: {
    gap: 6,
    marginTop: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  extBadge: {
    backgroundColor: Colors.surfaceArchive,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    minWidth: 38,
    alignItems: 'center',
  },
  extText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.neutral700,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  fileMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  removeBtn: {
    padding: 4,
  },
});
