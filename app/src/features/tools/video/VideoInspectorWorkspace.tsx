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
import {
  mockInspectVideo,
  formatDuration,
  formatBitrate,
  generateMockStoryboardFrames,
} from './shared/VideoHelpers';

interface VideoInspectorWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

export const VideoInspectorWorkspace: React.FC<VideoInspectorWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = VIDEO_TOOLS[selectedToolId] || VIDEO_TOOLS[120];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  const [video, setVideo] = useState<VideoAsset | null>(null);

  // 112: Extract frames interval
  const [frameIntervalSec, setFrameIntervalSec] = useState<number>(2);

  // 121: Thumbnail timestamp scrub
  const [thumbnailTimestamp, setThumbnailTimestamp] = useState<number>(14.5);

  // 124: Storyboard frame count
  const [storyboardCount, setStoryboardCount] = useState<number>(8);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedVideoResult | null>(null);
  const [batchResults, setBatchResults] = useState<ProcessedVideoResult[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const inspectorToolIds = [112, 120, 121, 124];

  // Live metadata inspection
  const metadata = video ? mockInspectVideo(video.name, video.size) : null;

  const handleProcess = async () => {
    if (!video) {
      Alert.alert('No Video', 'Please select a video file.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setBatchResults([]);
    setIsSaved(false);

    try {
      let outputResult: ProcessedVideoResult;

      if (selectedToolId === 112) {
        // Video to Images — real frame extraction, one result per frame
        const frames = await VideoEngine.processFrameSequence(
          video.uri,
          video.name,
          video.duration,
          frameIntervalSec
        );
        setBatchResults(frames);
        addRecentItem({
          id: `recent-${Date.now()}`,
          toolId: selectedToolId,
          toolName: toolConfig.name,
          timestamp: Date.now(),
        });
        setIsProcessing(false);
        return;
      } else if (selectedToolId === 120) {
        // Video Metadata Viewer
        outputResult = {
          uri: video.uri,
          name: `${video.name}_metadata_report.json`,
          size: 1024 * 4,
          format: 'JSON / Text',
          metadata: {
            Container: metadata?.container || 'MP4',
            VideoCodec: metadata?.videoCodec || 'H.264',
            AudioCodec: metadata?.audioCodec || 'AAC',
            Dimensions: `${video.width} × ${video.height}`,
            Aspect: metadata?.aspectRatio || '16:9',
            FrameRate: `${metadata?.fps || 30} FPS`,
            VideoBitrate: formatBitrate(metadata?.videoBitrateKbps || 4000),
            AudioBitrate: formatBitrate(metadata?.audioBitrateKbps || 192),
            TotalBitrate: formatBitrate(metadata?.totalBitrateKbps || 4192),
            ColorSpace: metadata?.colorSpace || 'BT.709',
            SampleRate: `${metadata?.sampleRateHz || 48000} Hz`,
          },
        };
      } else if (selectedToolId === 121) {
        // Video Thumbnail Maker — real frame capture
        outputResult = await VideoEngine.processThumbnail(
          video.uri,
          video.name,
          thumbnailTimestamp,
          video.width,
          video.height
        );
      } else {
        // 124: Video to PDF Storyboard (generates real PDF via pdf-lib)
        const frames = generateMockStoryboardFrames(video.duration, storyboardCount);
        const pdfRes = await VideoEngine.generateStoryboardPdf(
          video.name,
          video.duration,
          frames
        );

        outputResult = {
          uri: pdfRes.uri,
          name: pdfRes.name,
          size: pdfRes.size,
          format: 'PDF Document',
          metadata: {
            'Storyboard Keyframes': frames.length,
            'Document Layout': 'A4 Grid Contact Sheet',
            'Engine': 'pdf-lib Local Compiler',
          },
        };
      }

      setResult(outputResult);

      addRecentItem({
        id: `recent-${Date.now()}`,
        toolId: selectedToolId,
        toolName: toolConfig.name,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Inspection Failed', e?.message || 'Could not inspect video');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToFiles = () => {
    if (!result) return;
    const isPdf = selectedToolId === 124;
    const isImage = selectedToolId === 121;
    addManagedFile({
      name: result.name,
      uri: result.uri,
      size: result.size,
      sizeBytes: result.size,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: isPdf ? 'application/pdf' : isImage ? 'image/jpeg' : 'video/mp4',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'File registered to My Files successfully.');
  };

  const handleSaveFrame = (item: ProcessedVideoResult) => {
    addManagedFile({
      name: item.name,
      uri: item.uri,
      size: item.size,
      sizeBytes: item.size,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: 'image/jpeg',
      createdAt: Date.now(),
    });
    Alert.alert('Saved', `${item.name} saved to My Files.`);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Video Studio • Tools 112, 120, 121, 124"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(selectedToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OfflineShield studioName="Video Studio" />

        {/* Sub-tool switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcherRow}>
          {inspectorToolIds.map((id) => {
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

        {/* Video Picker */}
        <VideoPickerBox video={video} onVideoSelected={(v) => { setVideo(v); setResult(null); }} />

        {/* Deep Inspection Panel for 120 */}
        {selectedToolId === 120 && metadata && (
          <View style={styles.metadataCard}>
            <View style={styles.metaHeader}>
              <AppIcon name="Cpu" size={18} color={Colors.accentViolet} />
              <Text style={styles.metaCardTitle}>Hardware & Stream Inspector</Text>
            </View>

            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Container Format</Text>
              <Text style={styles.metaValue}>{metadata.container}</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Video Codec</Text>
              <Text style={styles.metaValue}>{metadata.videoCodec}</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Resolution & Aspect</Text>
              <Text style={styles.metaValue}>{metadata.width}×{metadata.height} ({metadata.aspectRatio})</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Total Bitrate</Text>
              <Text style={styles.metaValue}>{formatBitrate(metadata.totalBitrateKbps)}</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Audio Track Codec</Text>
              <Text style={styles.metaValue}>{metadata.audioCodec} ({metadata.sampleRateHz} Hz)</Text>
            </View>
            <View style={styles.metaRowItem}>
              <Text style={styles.metaLabel}>Color Primaries</Text>
              <Text style={styles.metaValue}>{metadata.colorSpace}</Text>
            </View>
          </View>
        )}

        {/* Controls Card for 112, 121, 124 */}
        <View style={styles.controlsCard}>
          {selectedToolId === 112 && (
            /* Extract Frames Interval */
            <View>
              <Text style={styles.sectionTitle}>Sampling Time Interval</Text>
              <View style={styles.pillsRow}>
                {[1, 2, 5, 10].map((sec) => (
                  <TouchableOpacity
                    key={sec}
                    style={[styles.pillBtn, frameIntervalSec === sec && styles.pillBtnActive]}
                    onPress={() => setFrameIntervalSec(sec)}
                  >
                    <Text style={[styles.pillBtnText, frameIntervalSec === sec && styles.pillBtnTextActive]}>
                      Every {sec}s
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hintText}>
                Will extract ~{Math.floor((video?.duration || 60) / frameIntervalSec)} JPEG images from clip.
              </Text>
            </View>
          )}

          {selectedToolId === 121 && (
            /* Thumbnail Timestamp */
            <View>
              <Text style={styles.sectionTitle}>Poster Frame Timecode</Text>
              <View style={styles.scrubBox}>
                <Text style={styles.scrubVal}>{formatDuration(thumbnailTimestamp)}</Text>
                <View style={styles.scrubBtns}>
                  <TouchableOpacity
                    style={styles.scrubBtn}
                    onPress={() => setThumbnailTimestamp((t) => Math.max(0, t - 2))}
                  >
                    <Text style={styles.scrubBtnText}>-2s</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.scrubBtn}
                    onPress={() => setThumbnailTimestamp((t) => Math.min(video?.duration || 60, t + 2))}
                  >
                    <Text style={styles.scrubBtnText}>+2s</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {selectedToolId === 124 && (
            /* PDF Storyboard Frame count */
            <View>
              <Text style={styles.sectionTitle}>Storyboard Keyframes Count</Text>
              <View style={styles.pillsRow}>
                {[4, 6, 8, 12].map((cnt) => (
                  <TouchableOpacity
                    key={cnt}
                    style={[styles.pillBtn, storyboardCount === cnt && styles.pillBtnActive]}
                    onPress={() => setStoryboardCount(cnt)}
                  >
                    <Text style={[styles.pillBtnText, storyboardCount === cnt && styles.pillBtnTextActive]}>
                      {cnt} Frames
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.hintText}>
                Generates a printable A4 contact sheet PDF with timestamped scene frames.
              </Text>
            </View>
          )}

          {/* Action Button */}
          <View style={{ marginTop: Spacing.md }}>
            <PrimaryButton
              title={
                isProcessing
                  ? 'Analyzing Video...'
                  : selectedToolId === 120
                  ? 'Export Inspection Report'
                  : selectedToolId === 124
                  ? 'Generate PDF Storyboard'
                  : `Run ${toolConfig.name}`
              }
              onPress={handleProcess}
              disabled={isProcessing}
              loading={isProcessing}
              variant="primary"
              color={Colors.accentViolet}
            />
          </View>
        </View>

        {/* Results Card */}
        {result && (
          <VideoResultCard
            result={result}
            onSaveToManagedFiles={handleSaveToFiles}
            saved={isSaved}
          />
        )}

        {batchResults.length > 0 && (
          <View style={styles.framesContainer}>
            <Text style={styles.framesTitle}>{batchResults.length} frames extracted</Text>
            {batchResults.map((item, idx) => (
              <View key={idx} style={styles.frameRow}>
                <AppIcon name="Image" size={16} color={Colors.accentViolet} />
                <Text style={styles.frameName} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleSaveFrame(item)}>
                  <Text style={styles.frameSave}>Save</Text>
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
  framesContainer: {
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  framesTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  frameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.borderSubtle,
  },
  frameName: {
    flex: 1,
    fontSize: 12,
    color: Colors.onSurface,
  },
  frameSave: {
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
  metadataCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  metaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  metaCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  metaRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  metaLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
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
    marginVertical: 4,
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
  hintText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  scrubBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  scrubVal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.onSurface,
  },
  scrubBtns: {
    flexDirection: 'row',
    gap: 6,
  },
  scrubBtn: {
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  scrubBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
});
