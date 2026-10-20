import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { VIDEO_TOOLS } from './videoConfig';
import { VideoAsset } from './shared/VideoPickerBox';
import { VideoResultCard } from './shared/VideoResultCard';
import { VideoEngine, ProcessedVideoResult } from './shared/VideoEngine';
import { formatDuration, formatFileSize } from './shared/VideoHelpers';

interface VideoAssemblyWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

export const VideoAssemblyWorkspace: React.FC<VideoAssemblyWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = VIDEO_TOOLS[selectedToolId] || VIDEO_TOOLS[106];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  // Multi-clip list for 106 & 128
  const [clips, setClips] = useState<VideoAsset[]>([]);

  // Transition settings for 128
  const [transitionEffect, setTransitionEffect] = useState<'crossfade' | 'dissolve' | 'wipe' | 'zoom'>('crossfade');
  const [transitionDuration, setTransitionDuration] = useState<number>(1.0);

  // Recording states for 125 (Screen) and 126 (Camera)
  const [cameraType, setCameraType] = useState<'back' | 'front'>('back');
  const [recordMicAudio, setRecordMicAudio] = useState<boolean>(true);
  const [recordResolution, setRecordResolution] = useState<'1080p' | '720p'>('1080p');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedVideoResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const assemblyToolIds = [106, 128, 125, 126];

  const handleAddClip = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const a = res.assets[0];
        setClips((prev) => [
          ...prev,
          {
            uri: a.uri,
            name: a.fileName || `Clip_${prev.length + 1}.mp4`,
            size: a.fileSize || 1024 * 1024 * 45,
            duration: a.duration ? Math.round(a.duration / 1000) : 30,
            width: a.width || 1920,
            height: a.height || 1080,
          },
        ]);
      }
    } catch {
      // Mock clip fallback
      setClips((prev) => [
        ...prev,
        {
          uri: `clip_${Date.now()}`,
          name: `Additional_Scene_${prev.length + 1}.mp4`,
          size: 65 * 1024 * 1024,
          duration: 25,
          width: 1920,
          height: 1080,
        },
      ]);
    }
  };

  const moveClip = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= clips.length) return;
    const reordered = [...clips];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setClips(reordered);
  };

  const removeClip = (index: number) => {
    if (clips.length <= 1) {
      Alert.alert('Required', 'At least one clip must remain in timeline.');
      return;
    }
    setClips((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecute = async () => {
    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      await new Promise((r) => setTimeout(r, 1200));

      let outputResult: ProcessedVideoResult;

      if (selectedToolId === 106 || selectedToolId === 128) {
        outputResult = await VideoEngine.processVideoAssembly(
          clips,
          selectedToolId === 128 ? `${transitionEffect} (${transitionDuration}s)` : 'Direct Concatenation'
        );
      } else if (selectedToolId === 125) {
        // Screen Recorder Mock Output
        outputResult = {
          uri: 'screen_recording_output.mp4',
          name: `Screen_Capture_${Date.now()}.mp4`,
          size: 45 * 1024 * 1024,
          duration: 34,
          resolution: recordResolution,
          format: 'MP4',
          metadata: {
            'Capture Source': 'Display Framebuffer',
            'Mic Audio Track': recordMicAudio ? 'Active (Mono 48kHz)' : 'Muted',
            'Encoding': 'Hardware H.264 Baseline',
          },
        };
      } else {
        // 126: Camera Recorder
        outputResult = {
          uri: 'camera_capture_output.mp4',
          name: `Camera_Take_${Date.now()}.mp4`,
          size: 62 * 1024 * 1024,
          duration: 28,
          resolution: recordResolution,
          format: 'MP4',
          metadata: {
            Lens: cameraType === 'back' ? 'Wide Primary Camera' : 'Front Selfie Camera',
            Stabilization: 'EIS Active',
            Bitrate: '18 Mbps High Profile',
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
      Alert.alert('Assembly Error', e?.message || 'Processing failed');
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

  const totalTimelineDuration = clips.reduce((acc, c) => acc + c.duration, 0);

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Video Studio • Tools 106, 125, 126, 128"
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
          {assemblyToolIds.map((id) => {
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

        {/* Multi-Clip Timeline for 106 & 128 */}
        {(selectedToolId === 106 || selectedToolId === 128) && (
          <View style={styles.timelineCard}>
            <View style={styles.timelineHeader}>
              <View>
                <Text style={styles.timelineTitle}>Video Timeline Sequence</Text>
                <Text style={styles.timelineSub}>
                  {clips.length} clips • Total: {formatDuration(totalTimelineDuration)}
                </Text>
              </View>
              <TouchableOpacity style={styles.addClipBtn} onPress={handleAddClip} activeOpacity={0.8}>
                <AppIcon name="Plus" size={14} color={Colors.surfaceWhite} />
                <Text style={styles.addClipBtnText}>Add Clip</Text>
              </TouchableOpacity>
            </View>

            {clips.map((clip, idx) => (
              <View key={idx} style={styles.clipItem}>
                <View style={styles.clipIndexBadge}>
                  <Text style={styles.clipIndexText}>#{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.clipName} numberOfLines={1}>{clip.name}</Text>
                  <Text style={styles.clipMeta}>{formatDuration(clip.duration)} • {formatFileSize(clip.size)}</Text>
                </View>
                {/* Reorder Buttons */}
                <View style={styles.reorderBtns}>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => moveClip(idx, 'up')}
                    disabled={idx === 0}
                  >
                    <AppIcon name="ChevronUp" size={14} color={idx === 0 ? Colors.borderSubtle : Colors.onSurface} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => moveClip(idx, 'down')}
                    disabled={idx === clips.length - 1}
                  >
                    <AppIcon name="ChevronDown" size={14} color={idx === clips.length - 1 ? Colors.borderSubtle : Colors.onSurface} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => removeClip(idx)}
                  >
                    <AppIcon name="Trash2" size={14} color={Colors.statusError} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Transition Controls for 128 */}
        {selectedToolId === 128 && (
          <View style={styles.settingsCard}>
            <Text style={styles.sectionTitle}>Transition Style</Text>
            <View style={styles.pillsRow}>
              {(['crossfade', 'dissolve', 'wipe', 'zoom'] as const).map((effect) => (
                <TouchableOpacity
                  key={effect}
                  style={[styles.pillBtn, transitionEffect === effect && styles.pillBtnActive]}
                  onPress={() => setTransitionEffect(effect)}
                >
                  <Text style={[styles.pillBtnText, transitionEffect === effect && styles.pillBtnTextActive]}>
                    {effect.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.sectionTitle, { marginTop: Spacing.sm }]}>Transition Duration</Text>
            <View style={styles.pillsRow}>
              {[0.5, 1.0, 1.5, 2.0].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.pillBtn, transitionDuration === sec && styles.pillBtnActive]}
                  onPress={() => setTransitionDuration(sec)}
                >
                  <Text style={[styles.pillBtnText, transitionDuration === sec && styles.pillBtnTextActive]}>
                    {sec}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Capture / Recording Controls for 125 & 126 */}
        {(selectedToolId === 125 || selectedToolId === 126) && (
          <View style={styles.recorderCard}>
            <View style={styles.recordHeaderRow}>
              <View style={[styles.recordIndicator, isRecording && styles.recordIndicatorActive]} />
              <Text style={styles.recordStatusText}>
                {isRecording ? `Recording (${recordingSeconds}s)...` : 'Ready to Record'}
              </Text>
            </View>

            <View style={styles.pillsRow}>
              {selectedToolId === 126 && (
                <>
                  <TouchableOpacity
                    style={[styles.pillBtn, cameraType === 'back' && styles.pillBtnActive]}
                    onPress={() => setCameraType('back')}
                  >
                    <Text style={[styles.pillBtnText, cameraType === 'back' && styles.pillBtnTextActive]}>
                      Back Camera
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pillBtn, cameraType === 'front' && styles.pillBtnActive]}
                    onPress={() => setCameraType('front')}
                  >
                    <Text style={[styles.pillBtnText, cameraType === 'front' && styles.pillBtnTextActive]}>
                      Front Selfie
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              <TouchableOpacity
                style={[styles.pillBtn, recordMicAudio && styles.pillBtnActive]}
                onPress={() => setRecordMicAudio(!recordMicAudio)}
              >
                <Text style={[styles.pillBtnText, recordMicAudio && styles.pillBtnTextActive]}>
                  Mic Audio {recordMicAudio ? 'ON' : 'OFF'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Button */}
        <View style={{ marginTop: Spacing.sm }}>
          <PrimaryButton
            title={
              isProcessing
                ? 'Processing Timeline...'
                : selectedToolId === 125 || selectedToolId === 126
                ? `Capture & Save ${toolConfig.name}`
                : `Merge ${clips.length} Clips`
            }
            onPress={handleExecute}
            disabled={isProcessing}
            loading={isProcessing}
            variant="primary"
            color={Colors.accentViolet}
          />
        </View>

        {/* Result Card */}
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
  timelineCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  timelineSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  addClipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentViolet,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  addClipBtnText: {
    color: Colors.surfaceWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  clipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  clipIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceVideo,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clipIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentViolet,
  },
  clipName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  clipMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  reorderBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  arrowBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  trashBtn: {
    padding: 6,
    borderRadius: Radius.sm,
    backgroundColor: '#FEE2E2',
    marginLeft: 4,
  },
  settingsCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  recorderCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  recordHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  recordIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.textMuted,
  },
  recordIndicatorActive: {
    backgroundColor: Colors.statusError,
  },
  recordStatusText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
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
    paddingHorizontal: 12,
    paddingVertical: 7,
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
});
