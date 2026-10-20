import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';
import { formatDuration, formatFileSize } from './VideoHelpers';

export interface VideoAsset {
  uri: string;
  name: string;
  size: number;
  duration: number; // seconds
  width: number;
  height: number;
}

interface VideoPickerBoxProps {
  video: VideoAsset | null;
  onVideoSelected: (video: VideoAsset) => void;
  title?: string;
  subtitle?: string;
  allowChange?: boolean;
}

export const VideoPickerBox: React.FC<VideoPickerBoxProps> = ({
  video,
  onVideoSelected,
  title = 'Select Video File',
  subtitle = 'Supports MP4, MOV, MKV, WebM, AVI up to 4K',
  allowChange = true,
}) => {
  const handlePickGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        let fileSize = asset.fileSize || 1024 * 1024 * 35;
        try {
          const info = await FileSystem.getInfoAsync(asset.uri);
          if (info.exists && 'size' in info && typeof info.size === 'number') {
            fileSize = info.size;
          }
        } catch {
          // ignore fallback
        }

        const durSec = asset.duration ? Math.round(asset.duration / 1000) : 74;
        const width = asset.width || 1920;
        const height = asset.height || 1080;
        const name = asset.fileName || `video_${Date.now()}.mp4`;

        onVideoSelected({
          uri: asset.uri,
          name,
          size: fileSize,
          duration: Math.max(durSec, 3),
          width,
          height,
        });
      }
    } catch {
      handlePickDocument();
    }
  };

  const handlePickDocument = async () => {
    try {
      const docResult = await DocumentPicker.getDocumentAsync({
        type: ['video/*', '*/*'],
        copyToCacheDirectory: true,
      });

      if (!docResult.canceled && docResult.assets && docResult.assets.length > 0) {
        const file = docResult.assets[0];
        onVideoSelected({
          uri: file.uri,
          name: file.name,
          size: file.size || 1024 * 1024 * 40,
          duration: 65,
          width: 1920,
          height: 1080,
        });
      }
    } catch (err: any) {
      Alert.alert('Selection Error', err?.message || 'Could not select video file');
    }
  };

  if (video) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <AppIcon name="Video" size={22} color={Colors.accentViolet} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {video.name}
            </Text>
            <Text style={styles.fileSub}>
              {formatDuration(video.duration)} • {formatFileSize(video.size)} • {video.width}×{video.height}
            </Text>
          </View>
          {allowChange && (
            <TouchableOpacity style={styles.changeBtn} onPress={handlePickGallery} activeOpacity={0.7}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Video Mock Player Strip */}
        <View style={styles.playerPreviewBox}>
          <View style={styles.previewCenterBadge}>
            <AppIcon name="Play" size={24} color={Colors.surfaceWhite} />
          </View>
          <View style={styles.playerBottomOverlay}>
            <View style={styles.timecodePill}>
              <Text style={styles.timecodePillText}>00:00 / {formatDuration(video.duration)}</Text>
            </View>
            <View style={styles.hdBadge}>
              <Text style={styles.hdBadgeText}>{video.width >= 3840 ? '4K UHD' : '1080p FHD'}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.uploadIconBadge}>
        <AppIcon name="UploadCloud" size={32} color={Colors.accentViolet} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.primaryPickerBtn} onPress={handlePickGallery} activeOpacity={0.8}>
          <AppIcon name="Film" size={16} color={Colors.surfaceWhite} />
          <Text style={styles.primaryPickerBtnText}>Photo Library</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryPickerBtn} onPress={handlePickDocument} activeOpacity={0.8}>
          <AppIcon name="Folder" size={16} color={Colors.onSurface} />
          <Text style={styles.secondaryPickerBtnText}>Browse Files</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVideo,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  fileSub: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  changeBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceVideo,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentViolet,
  },
  playerPreviewBox: {
    height: 120,
    backgroundColor: '#0F111E',
    borderRadius: Radius.md,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewCenterBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerBottomOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timecodePill: {
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  timecodePillText: {
    color: Colors.surfaceWhite,
    fontSize: 11,
    fontWeight: '500',
  },
  hdBadge: {
    backgroundColor: Colors.accentViolet,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  hdBadgeText: {
    color: Colors.surfaceWhite,
    fontSize: 10,
    fontWeight: '800',
  },
  emptyContainer: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.borderSubtle,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadIconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.surfaceVideo,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    width: '100%',
  },
  primaryPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentViolet,
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  primaryPickerBtnText: {
    color: Colors.surfaceWhite,
    fontSize: 13,
    fontWeight: '600',
  },
  secondaryPickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingVertical: 12,
    borderRadius: Radius.md,
    gap: 6,
  },
  secondaryPickerBtnText: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
});
