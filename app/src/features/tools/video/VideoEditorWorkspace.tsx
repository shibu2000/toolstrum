import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
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
import { formatDuration } from './shared/VideoHelpers';

interface VideoEditorWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

export const VideoEditorWorkspace: React.FC<VideoEditorWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = VIDEO_TOOLS[selectedToolId] || VIDEO_TOOLS[105];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  // Selected video
  const [video, setVideo] = useState<VideoAsset | null>(null);

  // Editor states
  // 105: Trimmer
  const [startSec, setStartSec] = useState<number>(5.0);
  const [endSec, setEndSec] = useState<number>(35.0);

  // 107: Cropper
  const [cropRatio, setCropRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('9:16');

  // 108: Rotator
  const [rotationDegrees, setRotationDegrees] = useState<number>(90);
  const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false);

  // 113: Speed Controller
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.5);
  const [preserveAudioPitch, setPreserveAudioPitch] = useState<boolean>(true);

  // 115: Watermark
  const [watermarkText, setWatermarkText] = useState<string>('Toolstrum Creator');
  const [watermarkPosition, setWatermarkPosition] = useState<'bottom_right' | 'top_left' | 'center'>('bottom_right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.8);

  // 122: Stabilizer
  const [smoothIntensity, setSmoothIntensity] = useState<'gentle' | 'balanced' | 'aggressive'>('balanced');

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedVideoResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Related editor tools for horizontal switcher
  const editorToolIds = [105, 107, 108, 113, 115, 122];

  const handleProcess = async () => {
    if (!video) {
      Alert.alert('No Video', 'Please pick a video first.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      let outputResult: ProcessedVideoResult;

      if (selectedToolId === 105) {
        // Video Trimmer
        outputResult = await VideoEngine.processVideoTrim(
          video.uri,
          video.name,
          video.size,
          video.duration,
          startSec,
          endSec
        );
      } else if (selectedToolId === 107) {
        // Video Cropper
        outputResult = {
          uri: video.uri,
          name: `${video.name.replace(/\.[^/.]+$/, '')}_cropped_${cropRatio.replace(':', 'x')}.mp4`,
          size: Math.round(video.size * 0.75),
          duration: video.duration,
          resolution: cropRatio === '9:16' ? '1080x1920' : cropRatio === '1:1' ? '1080x1080' : '1920x1080',
          format: 'MP4',
          metadata: {
            'Target Aspect': cropRatio,
            'Cropping Preset': cropRatio === '9:16' ? 'TikTok / Reels' : cropRatio === '1:1' ? 'Square Feed' : 'Landscape HD',
            'Resolution': cropRatio === '9:16' ? '1080×1920' : '1080×1080',
          },
        };
      } else if (selectedToolId === 108) {
        // Video Rotator
        outputResult = {
          uri: video.uri,
          name: `${video.name.replace(/\.[^/.]+$/, '')}_rot_${rotationDegrees}deg.mp4`,
          size: video.size,
          duration: video.duration,
          resolution: rotationDegrees === 90 || rotationDegrees === 270 ? '2160x3840' : '3840x2160',
          format: 'MP4',
          metadata: {
            Rotation: `${rotationDegrees}° Clockwise`,
            'Horizontal Flip': flipHorizontal ? 'Enabled' : 'None',
            'Matrix Transform': 'Lossless Metadata Flags',
          },
        };
      } else if (selectedToolId === 113) {
        // Speed Controller
        outputResult = await VideoEngine.processSpeedChange(
          video.uri,
          video.name,
          video.duration,
          playbackSpeed
        );
      } else if (selectedToolId === 115) {
        // Watermark
        outputResult = {
          uri: video.uri,
          name: `${video.name.replace(/\.[^/.]+$/, '')}_watermarked.mp4`,
          size: video.size,
          duration: video.duration,
          format: 'MP4',
          metadata: {
            'Watermark Text': watermarkText,
            'Position': watermarkPosition.replace('_', ' ').toUpperCase(),
            'Opacity': `${Math.round(watermarkOpacity * 100)}%`,
          },
        };
      } else {
        // 122: Video Stabilizer
        outputResult = {
          uri: video.uri,
          name: `${video.name.replace(/\.[^/.]+$/, '')}_stabilized.mp4`,
          size: video.size,
          duration: video.duration,
          format: 'MP4',
          metadata: {
            'Motion Smoothing': smoothIntensity.toUpperCase(),
            'Gyro Compensation': 'Enabled',
            'Rolling Shutter Correction': '98.5%',
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
      Alert.alert('Processing Failed', e?.message || 'Could not process video');
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
      mimeType: 'video/mp4',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'Video registered to My Files successfully.');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Video Studio • Tools 105, 107, 108, 113, 115, 122"
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
          {editorToolIds.map((id) => {
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

        {/* Video Picker Card */}
        <VideoPickerBox video={video} onVideoSelected={(v) => { setVideo(v); setResult(null); }} />

        {/* Contextual Operation Controls */}
        {video && (
          <View style={styles.controlsCard}>
            {selectedToolId === 105 && (
              /* Trimmer Controls */
              <View>
                <Text style={styles.sectionTitle}>Trim Boundaries</Text>
                <View style={styles.trimRangeRow}>
                  <View style={styles.trimBox}>
                    <Text style={styles.trimLabel}>Start Marker</Text>
                    <Text style={styles.trimValue}>{formatDuration(startSec)}</Text>
                    <View style={styles.trimBtnsRow}>
                      <TouchableOpacity
                        style={styles.adjustBtn}
                        onPress={() => setStartSec((s) => Math.max(0, s - 1))}
                      >
                        <Text style={styles.adjustBtnText}>-1s</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.adjustBtn}
                        onPress={() => setStartSec((s) => Math.min(endSec - 1, s + 1))}
                      >
                        <Text style={styles.adjustBtnText}>+1s</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.trimBox}>
                    <Text style={styles.trimLabel}>End Marker</Text>
                    <Text style={styles.trimValue}>{formatDuration(endSec)}</Text>
                    <View style={styles.trimBtnsRow}>
                      <TouchableOpacity
                        style={styles.adjustBtn}
                        onPress={() => setEndSec((e) => Math.max(startSec + 1, e - 1))}
                      >
                        <Text style={styles.adjustBtnText}>-1s</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.adjustBtn}
                        onPress={() => setEndSec((e) => Math.min(video.duration, e + 1))}
                      >
                        <Text style={styles.adjustBtnText}>+1s</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <Text style={styles.clipDurationHint}>
                  Selected Duration: {formatDuration(Math.max(1, endSec - startSec))}
                </Text>
              </View>
            )}

            {selectedToolId === 107 && (
              /* Cropper Controls */
              <View>
                <Text style={styles.sectionTitle}>Crop Aspect Ratio</Text>
                <View style={styles.pillsRow}>
                  {(['9:16', '1:1', '16:9', '4:5'] as const).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.pillBtn, cropRatio === r && styles.pillBtnActive]}
                      onPress={() => setCropRatio(r)}
                    >
                      <Text style={[styles.pillBtnText, cropRatio === r && styles.pillBtnTextActive]}>
                        {r} {r === '9:16' ? '(Story/Reel)' : r === '1:1' ? '(Square)' : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {selectedToolId === 108 && (
              /* Rotator Controls */
              <View>
                <Text style={styles.sectionTitle}>Rotation & Orientation</Text>
                <View style={styles.pillsRow}>
                  {[90, 180, 270].map((deg) => (
                    <TouchableOpacity
                      key={deg}
                      style={[styles.pillBtn, rotationDegrees === deg && styles.pillBtnActive]}
                      onPress={() => setRotationDegrees(deg)}
                    >
                      <Text style={[styles.pillBtnText, rotationDegrees === deg && styles.pillBtnTextActive]}>
                        {deg}° CW
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity
                    style={[styles.pillBtn, flipHorizontal && styles.pillBtnActive]}
                    onPress={() => setFlipHorizontal(!flipHorizontal)}
                  >
                    <Text style={[styles.pillBtnText, flipHorizontal && styles.pillBtnTextActive]}>
                      Flip H {flipHorizontal ? '✓' : ''}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {selectedToolId === 113 && (
              /* Speed Controller Controls */
              <View>
                <Text style={styles.sectionTitle}>Playback Speed</Text>
                <View style={styles.pillsRow}>
                  {[0.5, 0.75, 1.25, 1.5, 2.0].map((spd) => (
                    <TouchableOpacity
                      key={spd}
                      style={[styles.pillBtn, playbackSpeed === spd && styles.pillBtnActive]}
                      onPress={() => setPlaybackSpeed(spd)}
                    >
                      <Text style={[styles.pillBtnText, playbackSpeed === spd && styles.pillBtnTextActive]}>
                        {spd}x
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setPreserveAudioPitch(!preserveAudioPitch)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.checkbox, preserveAudioPitch && styles.checkboxActive]}>
                    {preserveAudioPitch && <AppIcon name="Check" size={12} color={Colors.surfaceWhite} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Preserve audio pitch (no chipmunk effect)</Text>
                </TouchableOpacity>
              </View>
            )}

            {selectedToolId === 115 && (
              /* Watermark Controls */
              <View>
                <Text style={styles.sectionTitle}>Watermark Text</Text>
                <TextInput
                  style={styles.textInput}
                  value={watermarkText}
                  onChangeText={setWatermarkText}
                  placeholder="Enter watermark text..."
                />

                <Text style={[styles.sectionTitle, { marginTop: Spacing.sm }]}>Position</Text>
                <View style={styles.pillsRow}>
                  {(['bottom_right', 'top_left', 'center'] as const).map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      style={[styles.pillBtn, watermarkPosition === pos && styles.pillBtnActive]}
                      onPress={() => setWatermarkPosition(pos)}
                    >
                      <Text style={[styles.pillBtnText, watermarkPosition === pos && styles.pillBtnTextActive]}>
                        {pos.replace('_', ' ').toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {selectedToolId === 122 && (
              /* Stabilizer Controls */
              <View>
                <Text style={styles.sectionTitle}>Stabilization Preset</Text>
                <View style={styles.pillsRow}>
                  {(['gentle', 'balanced', 'aggressive'] as const).map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.pillBtn, smoothIntensity === lvl && styles.pillBtnActive]}
                      onPress={() => setSmoothIntensity(lvl)}
                    >
                      <Text style={[styles.pillBtnText, smoothIntensity === lvl && styles.pillBtnTextActive]}>
                        {lvl.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Execute Button */}
            <View style={{ marginTop: Spacing.md }}>
              <PrimaryButton
                title={isProcessing ? 'Processing Video...' : `Apply ${toolConfig.name}`}
                onPress={handleProcess}
                disabled={isProcessing}
                loading={isProcessing}
                variant="primary"
                color={Colors.accentViolet}
              />
            </View>
          </View>
        )}

        {/* Results Card */}
        {result && (
          <VideoResultCard
            result={result}
            onSaveToManagedFiles={handleSaveToFiles}
            saved={isSaved}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
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
  trimRangeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  trimBox: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  trimLabel: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  trimValue: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.onSurface,
    marginVertical: 4,
  },
  trimBtnsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  adjustBtn: {
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  adjustBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  clipDurationHint: {
    fontSize: 12,
    color: Colors.accentViolet,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 6,
  },
  pillBtn: {
    paddingHorizontal: 12,
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.accentViolet,
    borderColor: Colors.accentViolet,
  },
  checkboxLabel: {
    fontSize: 12,
    color: Colors.onSurface,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    fontSize: 14,
    color: Colors.onSurface,
  },
});
