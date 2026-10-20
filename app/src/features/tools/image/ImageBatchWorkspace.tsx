/**
 * ImageBatchWorkspace.tsx
 * Workspace E: Image Batch Processor
 * Consolidates tool:
 * 85: Image Batch Processor
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
import { Colors, Radius, Spacing } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { ImageFilePicker, SelectedImageFile, formatFileSize } from './shared/ImageFilePicker';
import { ImageResultCard, ImageResultData } from './shared/ImageResultCard';
import {
  compressImage,
  resizeImage,
  convertFormat,
  stripExifData,
  saveImageToSandbox,
} from './shared/ImageEngine';
import { getImageToolConfig, ImageToolConfig } from './imageConfig';
import { SaveFormat } from 'expo-image-manipulator';

interface ImageBatchWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

export const ImageBatchWorkspace: React.FC<ImageBatchWorkspaceProps> = ({
  initialToolId = 85,
  onBack,
}) => {
  const [files, setFiles] = useState<SelectedImageFile[]>([]);
  const [batchAction, setBatchAction] = useState<'compress' | 'resize' | 'convert_webp' | 'strip_exif'>('compress');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState<string>('');
  const [result, setResult] = useState<ImageResultData | null>(null);

  const { isFavorite, toggleFavorite, addManagedFile, addRecentItem } = useAppStore();
  const favorited = isFavorite(85);

  const toolConfig: ImageToolConfig =
    getImageToolConfig(85) || {
      id: 85,
      name: 'Image Batch Processor',
      workspace: 'image_batch',
      defaultOperation: 'batch_process',
      description: 'Process multiple images concurrently with batch resize, compress, conversion, or privacy scrubbing.',
      iconName: 'Layers',
      supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
    };

  const handleBatchProcess = async () => {
    if (files.length === 0) {
      Alert.alert('No Images', 'Please select 1 or more images to batch process.');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    let totalOriginalSize = 0;
    let totalNewSize = 0;
    let processedCount = 0;
    let firstResultUri: string | undefined;

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgressText(`Processing ${i + 1} of ${files.length}: ${file.name}`);
        const origSize = file.size || 204800;
        totalOriginalSize += origSize;

        let processedUri = file.uri;
        let outName = `batch_${file.name}`;

        if (batchAction === 'compress') {
          const res = await compressImage(file.uri, 0.72, SaveFormat.JPEG);
          processedUri = res.uri;
          outName = `compressed_${file.name}`;
        } else if (batchAction === 'resize') {
          const res = await resizeImage(file.uri, {
            width: Math.min(1280, (file.width || 1280)),
            quality: 0.88,
          });
          processedUri = res.uri;
          outName = `resized_${file.name}`;
        } else if (batchAction === 'convert_webp') {
          const res = await convertFormat(file.uri, 'webp', 0.85);
          processedUri = res.uri;
          outName = `${file.name.replace(/\.[^.]+$/, '')}.webp`;
        } else if (batchAction === 'strip_exif') {
          const res = await stripExifData(file.uri);
          processedUri = res.uri;
          outName = `clean_${file.name}`;
        }

        const saved = await saveImageToSandbox(processedUri, outName);
        totalNewSize += saved.size;
        processedCount++;

        if (!firstResultUri) {
          firstResultUri = saved.uri;
        }

        // Save each item to store
        addManagedFile({
          name: saved.name,
          uri: saved.uri,
          size: saved.size,
          toolId: 85,
          toolName: 'Image Batch Processor',
          createdAt: Date.now(),
        });
      }

      addRecentItem({
        toolId: 85,
        title: `Batch Processed (${processedCount} Images)`,
        subtitle: `Image Studio · ${batchAction.toUpperCase()}`,
      });

      const savedPercent =
        totalOriginalSize > 0
          ? Math.max(0, ((totalOriginalSize - totalNewSize) / totalOriginalSize) * 100)
          : 0;

      setResult({
        title: `Batch Complete · ${processedCount} Photos Processed`,
        fileName: `${processedCount}_photos_batch_export`,
        imageUri: firstResultUri,
        fileSize: totalNewSize,
        originalSize: totalOriginalSize,
        savedPercent,
        metricLabel: 'Batch Efficiency',
        metricValue: `${processedCount} Images Optimized`,
        details: [
          { label: 'Action Applied', value: batchAction.replace('_', ' ').toUpperCase() },
          { label: 'Photos Completed', value: `${processedCount} of ${files.length}` },
          { label: 'Initial Combined Size', value: formatFileSize(totalOriginalSize) },
          { label: 'Final Output Size', value: formatFileSize(totalNewSize) },
          { label: 'Total Bandwidth Saved', value: `${savedPercent.toFixed(1)}%` },
        ],
        toolId: 85,
        toolName: 'Image Batch Processor',
      });
    } catch (err: any) {
      Alert.alert('Batch Failed', err?.message || 'Error occurred during batch image processing.');
    } finally {
      setIsProcessing(false);
      setProgressText('');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Image Studio · High Performance Batch Pipeline"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(85),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.descCard}>
          <View style={styles.descIconCircle}>
            <AppIcon name={toolConfig.iconName} size={18} color={Colors.accentEmerald} />
          </View>
          <View style={styles.descTextGroup}>
            <Text style={styles.descTitle}>{toolConfig.name}</Text>
            <Text style={styles.descText}>{toolConfig.description}</Text>
          </View>
        </View>

        {/* Multi Image Picker */}
        <ImageFilePicker
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setResult(null);
          }}
          multiple={true}
          maxFiles={30}
          title="Select Photos for Batch Processing"
          subtitle="Select multiple photos to convert, compress, or scrub all at once"
        />

        {/* Action Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.controlHeader}>Select Batch Action to Apply</Text>
          <View style={styles.actionsList}>
            {[
              {
                id: 'compress',
                title: 'Batch Image Compression',
                sub: 'Compress all photos with 72% balanced quality JPEG encoding',
                icon: 'Minimize2',
              },
              {
                id: 'resize',
                title: 'Batch Rescale to 1080p Max',
                sub: 'Downsample all large images to web-ready 1080p resolution',
                icon: 'Maximize2',
              },
              {
                id: 'convert_webp',
                title: 'Batch Convert to Next-Gen WEBP',
                sub: 'Convert all PNGs & JPGs to high-compression WEBP format',
                icon: 'RefreshCw',
              },
              {
                id: 'strip_exif',
                title: 'Batch Privacy EXIF Scrub',
                sub: 'Strip GPS coordinates, device tags, and timestamps from all photos',
                icon: 'ShieldCheck',
              },
            ].map((action) => {
              const active = batchAction === action.id;
              return (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionRowItem, active && styles.actionRowItemActive]}
                  onPress={() => setBatchAction(action.id as any)}
                >
                  <View style={[styles.actionIconCircle, active && styles.actionIconCircleActive]}>
                    <AppIcon
                      name={action.icon}
                      size={18}
                      color={active ? '#FFFFFF' : Colors.textMuted}
                    />
                  </View>
                  <View style={styles.actionTextGroup}>
                    <Text style={[styles.actionTitle, active && styles.actionTitleActive]}>
                      {action.title}
                    </Text>
                    <Text style={styles.actionSub}>{action.sub}</Text>
                  </View>
                  <AppIcon
                    name={active ? 'CheckCircle2' : 'Circle'}
                    size={18}
                    color={active ? Colors.accentEmerald : Colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {isProcessing && progressText ? (
            <View style={styles.progressBox}>
              <AppIcon name="Loader" size={16} color={Colors.accentEmerald} />
              <Text style={styles.progressText}>{progressText}</Text>
            </View>
          ) : null}

          {/* Run Batch Button */}
          <View style={{ marginTop: 12 }}>
            <PrimaryButton
              title={
                isProcessing
                  ? 'Batch Processing...'
                  : `Process ${files.length} Photo${files.length === 1 ? '' : 's'}`
              }
              onPress={handleBatchProcess}
              loading={isProcessing}
              variant="primary"
              color={Colors.accentEmerald}
            />
          </View>
        </View>

        {/* Result Output Card */}
        {result && (
          <ImageResultCard
            result={result}
            onReset={() => {
              setResult(null);
              setFiles([]);
            }}
          />
        )}

        {/* Security / Offline Shield */}
        <OfflineShield studioName="Image Studio" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 40,
  },
  descCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    backgroundColor: Colors.surfaceImage,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  descIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descTextGroup: {
    flex: 1,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  descText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  controlsCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  controlHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  actionsList: {
    gap: 8,
  },
  actionRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  actionRowItemActive: {
    backgroundColor: Colors.surfaceImage,
    borderColor: Colors.accentEmerald,
  },
  actionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: Radius.pill,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircleActive: {
    backgroundColor: Colors.accentEmerald,
  },
  actionTextGroup: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  actionTitleActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  actionSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  progressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E7F9F1',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#065F46',
  },
});
