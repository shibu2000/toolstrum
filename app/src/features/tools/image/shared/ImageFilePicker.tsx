/**
 * ImageFilePicker.tsx
 * Reusable image picker component for Image Studio workspaces.
 * Supports selecting single or multiple images via gallery or camera,
 * with thumbnail previews, dimensions, and file size badges.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Radius, Spacing } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

export interface SelectedImageFile {
  id: string;
  name: string;
  uri: string;
  size?: number;
  width?: number;
  height?: number;
  mimeType?: string;
}

interface ImageFilePickerProps {
  files: SelectedImageFile[];
  onFilesChange: (files: SelectedImageFile[]) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  maxFiles?: number;
  allowCamera?: boolean;
  allowSvgOrDocument?: boolean;
}

export function formatFileSize(bytes?: number): string {
  if (bytes === undefined || bytes === null || isNaN(bytes)) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const ImageFilePicker: React.FC<ImageFilePickerProps> = ({
  files,
  onFilesChange,
  multiple = false,
  title = 'Select Image',
  subtitle = 'Choose photo from gallery or take a picture',
  maxFiles = 20,
  allowCamera = true,
  allowSvgOrDocument = false,
}) => {
  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: multiple,
        quality: 1,
        selectionLimit: multiple ? maxFiles : 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newFiles: SelectedImageFile[] = result.assets.map((asset, index) => ({
          id: `img-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name: asset.fileName || `Photo_${Date.now()}_${index + 1}.jpg`,
          uri: asset.uri,
          size: asset.fileSize,
          width: asset.width,
          height: asset.height,
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
      Alert.alert('Picker Error', err?.message || 'Could not access photo library.');
    }
  };

  const handlePickFromCamera = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera Permission', 'Camera permission is required to capture photos.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newFile: SelectedImageFile = {
          id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: asset.fileName || `Camera_${Date.now()}.jpg`,
          uri: asset.uri,
          size: asset.fileSize,
          width: asset.width,
          height: asset.height,
          mimeType: asset.mimeType,
        };

        if (multiple) {
          onFilesChange([...files, newFile].slice(0, maxFiles));
        } else {
          onFilesChange([newFile]);
        }
      }
    } catch (err: any) {
      Alert.alert('Camera Error', err?.message || 'Could not launch camera.');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf', 'image/svg+xml'],
        multiple,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newFiles: SelectedImageFile[] = result.assets.map((asset, index) => ({
          id: `doc-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          name: asset.name,
          uri: asset.uri,
          size: asset.size,
          mimeType: asset.mimeType,
        }));

        if (multiple) {
          onFilesChange([...files, ...newFiles].slice(0, maxFiles));
        } else {
          onFilesChange([newFiles[0]]);
        }
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err?.message || 'Could not select document file.');
    }
  };

  const animateLayout = () => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= files.length) return;
    const reordered = [...files];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    animateLayout();
    onFilesChange(reordered);
  };

  const handleSortAlphabetical = () => {
    const sorted = [...files].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
    animateLayout();
    onFilesChange(sorted);
  };

  const handleReverseOrder = () => {
    const reversed = [...files].reverse();
    animateLayout();
    onFilesChange(reversed);
  };

  const handleRemove = (id: string) => {
    animateLayout();
    onFilesChange(files.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    animateLayout();
    onFilesChange([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={styles.headerActions}>
          {multiple && files.length > 1 && (
            <View style={styles.sortButtonGroup}>
              <TouchableOpacity
                onPress={handleSortAlphabetical}
                style={styles.miniActionBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.miniActionText}>A-Z</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleReverseOrder}
                style={styles.miniActionBtn}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={styles.miniActionText}>Reverse</Text>
              </TouchableOpacity>
            </View>
          )}

          {files.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.clearText}>Clear ({files.length})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Main Pick Trigger */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.pickerBox, { flex: 2 }]}
          onPress={handlePickFromGallery}
          activeOpacity={0.7}
        >
          <View style={styles.iconCircle}>
            <AppIcon name="Image" size={20} color={Colors.accentEmerald} />
          </View>
          <View style={styles.pickerTextGroup}>
            <Text style={styles.pickerPrimaryText}>
              {files.length === 0
                ? multiple
                  ? 'Select Photos'
                  : 'Select Photo'
                : 'Add More Photos'}
            </Text>
            <Text style={styles.pickerSecondaryText}>From device photo gallery</Text>
          </View>
        </TouchableOpacity>

        {allowCamera && (
          <TouchableOpacity
            style={[styles.pickerBoxCompact, { flex: 1 }]}
            onPress={handlePickFromCamera}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <AppIcon name="Camera" size={18} color={Colors.accentEmerald} />
            </View>
            <Text style={styles.compactBtnText}>Camera</Text>
          </TouchableOpacity>
        )}

        {allowSvgOrDocument && (
          <TouchableOpacity
            style={[styles.pickerBoxCompact, { flex: 1 }]}
            onPress={handlePickDocument}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <AppIcon name="FileText" size={18} color={Colors.accentEmerald} />
            </View>
            <Text style={styles.compactBtnText}>Files / SVG</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Images List with Ordering Controls */}
      {files.length > 0 && (
        <View style={styles.fileList}>
          {files.map((file, index) => (
            <View key={file.id} style={styles.fileRow}>
              {multiple && files.length > 1 && (
                <View style={styles.orderBadge}>
                  <Text style={styles.orderNumberText}>#{index + 1}</Text>
                </View>
              )}

              {file.uri.endsWith('.svg') || file.uri.endsWith('.pdf') ? (
                <View style={styles.vectorBadge}>
                  <AppIcon name="FileText" size={16} color={Colors.accentEmerald} />
                </View>
              ) : (
                <Image source={{ uri: file.uri }} style={styles.thumbnail} resizeMode="cover" />
              )}

              <View style={styles.fileDetails}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {file.name}
                </Text>
                <Text style={styles.fileMeta}>
                  {formatFileSize(file.size)}
                  {file.width && file.height ? ` · ${file.width}×${file.height}px` : ''}
                </Text>
              </View>

              {/* Sequence Move Arrows */}
              {multiple && files.length > 1 && (
                <View style={styles.reorderButtons}>
                  <TouchableOpacity
                    style={[styles.arrowBtn, index === 0 && styles.arrowBtnDisabled]}
                    onPress={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <AppIcon
                      name="ChevronUp"
                      size={14}
                      color={index === 0 ? Colors.outlineVariant : Colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.arrowBtn, index === files.length - 1 && styles.arrowBtnDisabled]}
                    onPress={() => handleMove(index, 'down')}
                    disabled={index === files.length - 1}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <AppIcon
                      name="ChevronDown"
                      size={14}
                      color={index === files.length - 1 ? Colors.outlineVariant : Colors.onSurfaceVariant}
                    />
                  </TouchableOpacity>
                </View>
              )}

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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sortButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceImage,
    borderRadius: Radius.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  miniActionBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.xs,
  },
  miniActionText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentEmerald,
  },
  orderBadge: {
    width: 22,
    height: 22,
    borderRadius: Radius.xs,
    backgroundColor: Colors.surfaceImage,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  orderNumberText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentEmerald,
    fontVariant: ['tabular-nums'],
  },
  reorderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.sm,
    padding: 2,
  },
  arrowBtn: {
    padding: 3,
    borderRadius: Radius.xs,
  },
  arrowBtnDisabled: {
    opacity: 0.3,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.statusError,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  pickerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceImage,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  pickerBoxCompact: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceImage,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A7F3D0',
    padding: Spacing.sm,
    gap: 4,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
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
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  compactBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
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
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  thumbnail: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: '#E2E8F0',
  },
  vectorBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceImage,
    alignItems: 'center',
    justifyContent: 'center',
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
