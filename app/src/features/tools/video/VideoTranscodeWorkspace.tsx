import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { VIDEO_TOOLS } from './videoConfig';
import { VideoPickerBox, VideoAsset } from './shared/VideoPickerBox';
import { VideoResultCard } from './shared/VideoResultCard';
import { VideoEngine, ProcessedVideoResult } from './shared/VideoEngine';
import { formatFileSize, formatDuration } from './shared/VideoHelpers';

interface VideoTranscodeWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

export const VideoTranscodeWorkspace: React.FC<VideoTranscodeWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = VIDEO_TOOLS[selectedToolId] || VIDEO_TOOLS[104];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  // Single video or primary video
  const [video, setVideo] = useState<VideoAsset | null>(null);

  // Batch queue for Tool 127
  const [batchQueue, setBatchQueue] = useState<VideoAsset[]>([]);

  // Transcode options
  // 104: Compression Preset
  const [compressPreset, setCompressPreset] = useState<'small' | 'balanced' | 'high'>('balanced');

  // 109: Target Container Format
  const [targetFormat, setTargetFormat] = useState<'mp4' | 'mkv' | 'mov' | 'webm' | 'avi'>('mp4');

  // 111: GIF settings
  const [gifFps, setGifFps] = useState<number>(15);
  const [gifLoop, setGifLoop] = useState<boolean>(true);

  // 118: Resolution
  const [targetResolution, setTargetResolution] = useState<'1080p' | '720p' | '480p' | '4k'>('1080p');

  // 119: Frame Rate
  const [targetFps, setTargetFps] = useState<number>(30);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedVideoResult | null>(null);
  const [batchResults, setBatchResults] = useState<ProcessedVideoResult[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const transcodeToolIds = [104, 109, 111, 118, 119, 127];

  const handleTranscode = async () => {
    if (selectedToolId === 127 && batchQueue.length === 0) {
      Alert.alert('Empty Queue', 'Add files to batch queue first.');
      return;
    }
    if (selectedToolId !== 127 && !video) {
      Alert.alert('No Video', 'Please select a video file.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setBatchResults([]);
    setIsSaved(false);

    try {
      let outputResult: ProcessedVideoResult;

      if (selectedToolId === 104) {
        // Video Compressor
        outputResult = await VideoEngine.processVideoTranscode(
          video!.uri,
          video!.name,
          video!.size,
          video!.duration,
          {
            format: 'mp4',
            resolution: targetResolution,
            preset: compressPreset,
          }
        );
      } else if (selectedToolId === 109) {
        // Format Converter
        outputResult = await VideoEngine.processVideoTranscode(
          video!.uri,
          video!.name,
          video!.size,
          video!.duration,
          {
            format: targetFormat,
            resolution: '1080p',
            preset: 'high',
          }
        );
      } else if (selectedToolId === 111) {
        // Video to GIF
        outputResult = await VideoEngine.processVideoToGif(
          video!.uri,
          video!.name,
          0,
          Math.min(10, video!.duration),
          gifFps,
          480
        );
      } else if (selectedToolId === 118) {
        // Resolution Changer
        outputResult = await VideoEngine.processVideoTranscode(
          video!.uri,
          video!.name,
          video!.size,
          video!.duration,
          {
            format: 'mp4',
            resolution: targetResolution,
            preset: 'balanced',
          }
        );
      } else if (selectedToolId === 119) {
        // Frame Rate Converter
        outputResult = await VideoEngine.processFrameRateChange(
          video!.uri,
          video!.name,
          video!.size,
          video!.duration,
          targetFps
        );
      } else {
        // 127: Batch Video Converter — processes each file for real; no zip bundling
        // (no archive library is available on mobile), so results are listed individually.
        const batchResults = await VideoEngine.processBatchTranscode(batchQueue, targetFormat, targetResolution);
        setBatchResults(batchResults);
        setResult(null);
        addRecentItem({
          id: `recent-${Date.now()}`,
          toolId: selectedToolId,
          toolName: toolConfig.name,
          timestamp: Date.now(),
        });
        setIsProcessing(false);
        return;
      }

      setResult(outputResult);

      addRecentItem({
        id: `recent-${Date.now()}`,
        toolId: selectedToolId,
        toolName: toolConfig.name,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Transcode Error', e?.message || 'Failed to transcode');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToFiles = () => {
    if (!result) return;
    addManagedFile({
      name: result.name,
      uri: result.uri,
      size: result.size,
      sizeBytes: result.size,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: selectedToolId === 111 ? 'image/gif' : 'video/mp4',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'File saved to My Files successfully.');
  };

  const handleSaveBatchItem = (item: ProcessedVideoResult) => {
    addManagedFile({
      name: item.name,
      uri: item.uri,
      size: item.size,
      sizeBytes: item.size,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: 'video/mp4',
      createdAt: Date.now(),
    });
    Alert.alert('Saved', `${item.name} saved to My Files.`);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Video Studio • Tools 104, 109, 111, 118, 119, 127"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(selectedToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OfflineShield studioName="Video Studio" />

        {/* Studio Sub-Tool Switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcherRow}>
          {transcodeToolIds.map((id) => {
            const cfg = VIDEO_TOOLS[id];
            const isSelected = selectedToolId === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.switcherTab, isSelected && styles.switcherTabActive]}
                onPress={() => {
                  setSelectedToolId(id);
                  setResult(null);
                }}
                activeOpacity={0.7}
              >
                <AppIcon
                  name={cfg.iconName}
                  size={15}
                  color={isSelected ? Colors.surfaceWhite : Colors.textMuted}
                />
                <Text style={[styles.switcherTabText, isSelected && styles.switcherTabTextActive]}>
                  {cfg.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.toolDescription}>{toolConfig.description}</Text>

        {/* Input Picker */}
        {selectedToolId === 127 ? (
          /* Batch Queue View */
          <View style={styles.batchCard}>
            <View style={styles.batchHeader}>
              <Text style={styles.batchTitle}>Batch Conversion Queue ({batchQueue.length} files)</Text>
              <TouchableOpacity
                style={styles.addBatchBtn}
                onPress={() => {
                  setBatchQueue((prev) => [
                    ...prev,
                    {
                      uri: `video_${Date.now()}`,
                      name: `Clip_${prev.length + 1}_4K.mp4`,
                      size: 95 * 1024 * 1024,
                      duration: 45,
                      width: 1920,
                      height: 1080,
                    },
                  ]);
                }}
              >
                <AppIcon name="Plus" size={14} color={Colors.accentViolet} />
                <Text style={styles.addBatchText}>Add Video</Text>
              </TouchableOpacity>
            </View>

            {batchQueue.map((item, index) => (
              <View key={index} style={styles.batchItemRow}>
                <View style={styles.batchIcon}>
                  <AppIcon name="Video" size={18} color={Colors.accentViolet} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchFileName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.batchFileMeta}>{formatDuration(item.duration)} • {formatFileSize(item.size)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setBatchQueue((q) => q.filter((_, i) => i !== index))}
                >
                  <AppIcon name="Trash2" size={16} color={Colors.statusError} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <VideoPickerBox video={video} onVideoSelected={(v) => { setVideo(v); setResult(null); }} />
        )}

        {/* Settings & Options Card */}
        <View style={styles.controlsCard}>
          {selectedToolId === 104 && (
            /* Compressor Preset */
            <View>
              <Text style={styles.sectionTitle}>Compression Preset</Text>
              <View style={styles.pillsRow}>
                {[
                  { id: 'small', label: 'Maximum Compression', desc: 'Email / Web (~70% smaller)' },
                  { id: 'balanced', label: 'Balanced', desc: 'Social & Messaging (~45% smaller)' },
                  { id: 'high', label: 'High Quality', desc: 'Preserve 4K crispness (~25% smaller)' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.presetCard, compressPreset === item.id && styles.presetCardActive]}
                    onPress={() => setCompressPreset(item.id as any)}
                  >
                    <Text style={[styles.presetLabel, compressPreset === item.id && styles.presetLabelActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.presetDesc}>{item.desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(selectedToolId === 109 || selectedToolId === 127) && (
            /* Format Selector */
            <View>
              <Text style={styles.sectionTitle}>Target Format Container</Text>
              <View style={styles.pillsRow}>
                {(['mp4', 'mkv', 'mov', 'webm', 'avi'] as const).map((fmt) => (
                  <TouchableOpacity
                    key={fmt}
                    style={[styles.pillBtn, targetFormat === fmt && styles.pillBtnActive]}
                    onPress={() => setTargetFormat(fmt)}
                  >
                    <Text style={[styles.pillBtnText, targetFormat === fmt && styles.pillBtnTextActive]}>
                      .{fmt.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedToolId === 111 && (
            /* Video to GIF settings */
            <View>
              <Text style={styles.sectionTitle}>GIF Frame Rate</Text>
              <View style={styles.pillsRow}>
                {[10, 15, 24, 30].map((fps) => (
                  <TouchableOpacity
                    key={fps}
                    style={[styles.pillBtn, gifFps === fps && styles.pillBtnActive]}
                    onPress={() => setGifFps(fps)}
                  >
                    <Text style={[styles.pillBtnText, gifFps === fps && styles.pillBtnTextActive]}>
                      {fps} FPS
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(selectedToolId === 118 || selectedToolId === 104 || selectedToolId === 127) && (
            /* Resolution settings */
            <View style={{ marginTop: Spacing.xs }}>
              <Text style={styles.sectionTitle}>Output Resolution</Text>
              <View style={styles.pillsRow}>
                {(['4k', '1080p', '720p', '480p'] as const).map((res) => (
                  <TouchableOpacity
                    key={res}
                    style={[styles.pillBtn, targetResolution === res && styles.pillBtnActive]}
                    onPress={() => setTargetResolution(res)}
                  >
                    <Text style={[styles.pillBtnText, targetResolution === res && styles.pillBtnTextActive]}>
                      {res.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedToolId === 119 && (
            /* Frame Rate Settings */
            <View>
              <Text style={styles.sectionTitle}>Target Frame Rate</Text>
              <View style={styles.pillsRow}>
                {[24, 30, 60, 120].map((fps) => (
                  <TouchableOpacity
                    key={fps}
                    style={[styles.pillBtn, targetFps === fps && styles.pillBtnActive]}
                    onPress={() => setTargetFps(fps)}
                  >
                    <Text style={[styles.pillBtnText, targetFps === fps && styles.pillBtnTextActive]}>
                      {fps} FPS {fps === 24 ? '(Cinematic)' : fps === 60 ? '(Fluid)' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Action Button */}
          <View style={{ marginTop: Spacing.md }}>
            <PrimaryButton
              title={isProcessing ? 'Transcoding On-Device...' : `Start ${toolConfig.name}`}
              onPress={handleTranscode}
              disabled={isProcessing}
              loading={isProcessing}
              variant="primary"
              color={Colors.accentViolet}
            />
          </View>
        </View>

        {/* Results View */}
        {result && (
          <VideoResultCard
            result={result}
            onSaveToManagedFiles={handleSaveToFiles}
            saved={isSaved}
          />
        )}

        {batchResults.length > 0 && (
          <View style={styles.batchResultsContainer}>
            <Text style={styles.batchResultsTitle}>
              {batchResults.length} of {batchQueue.length} files processed
            </Text>
            {batchResults.map((item, idx) => (
              <View key={idx} style={styles.batchResultRow}>
                <AppIcon name="FileVideo" size={16} color={Colors.accentViolet} />
                <Text style={styles.batchResultName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleSaveBatchItem(item)}>
                  <Text style={styles.batchResultSave}>Save</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  batchResultsContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  batchResultsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  batchResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  batchResultName: {
    flex: 1,
    fontSize: 12,
    color: Colors.onSurface,
  },
  batchResultSave: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentViolet,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  switcherRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  switcherTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginRight: Spacing.xs,
  },
  switcherTabActive: {
    backgroundColor: Colors.accentViolet,
    borderColor: Colors.accentViolet,
  },
  switcherTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  switcherTabTextActive: {
    color: Colors.surfaceWhite,
  },
  toolDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  batchCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  batchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  batchTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  addBatchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceVideo,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  addBatchText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentViolet,
  },
  batchItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  batchIcon: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceVideo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  batchFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  batchFileMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  controlsCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.xs,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  pillBtnActive: {
    backgroundColor: Colors.surfaceVideo,
    borderColor: Colors.accentViolet,
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  pillBtnTextActive: {
    color: Colors.accentViolet,
  },
  presetCard: {
    width: '100%',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: 6,
  },
  presetCardActive: {
    borderColor: Colors.accentViolet,
    backgroundColor: Colors.surfaceVideo,
  },
  presetLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  presetLabelActive: {
    color: Colors.accentViolet,
  },
  presetDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
