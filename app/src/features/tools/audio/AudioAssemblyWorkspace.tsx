import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { AUDIO_TOOLS } from './audioConfig';
import { AudioAsset } from './shared/AudioPickerBox';
import { AudioResultCard } from './shared/AudioResultCard';
import { AudioEngine, ProcessedAudioResult } from './shared/AudioEngine';
import { formatAudioDuration, formatAudioFileSize } from './shared/AudioHelpers';

interface AudioAssemblyWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

export const AudioAssemblyWorkspace: React.FC<AudioAssemblyWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = AUDIO_TOOLS[selectedToolId] || AUDIO_TOOLS[132];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  // Multi-track timeline for 132 & 153
  const [tracks, setTracks] = useState<AudioAsset[]>([]);

  // Video source for 144 (Video Audio Extractor)
  const [videoSource, setVideoSource] = useState<{ uri: string; name: string; size: number; duration: number } | null>(null);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedAudioResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const assemblyToolIds = [132, 144, 153];

  const handleAddTrack = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', '*/*'],
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setTracks((prev) => [
          ...prev,
          {
            uri: file.uri,
            name: file.name,
            size: file.size || 0,
            duration: 0,
            format: (file.name.split('.').pop() || 'audio').toUpperCase(),
            bitrateKbps: 0,
          },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Could Not Add Track', e?.message || 'File selection failed. Please try again.');
    }
  };

  const handlePickVideoSource = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'video/*' });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setVideoSource({ uri: file.uri, name: file.name, size: file.size || 0, duration: 0 });
      }
    } catch (e: any) {
      Alert.alert('Could Not Select Video', e?.message || 'File selection failed. Please try again.');
    }
  };

  const moveTrack = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= tracks.length) return;
    const reordered = [...tracks];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setTracks(reordered);
  };

  const removeTrack = (index: number) => {
    if (tracks.length <= 1) {
      Alert.alert('Required', 'At least one audio track must remain.');
      return;
    }
    setTracks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExecute = async () => {
    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      let outputResult: ProcessedAudioResult;

      if (selectedToolId === 132 || selectedToolId === 153) {
        if (tracks.length < 2) {
          Alert.alert('Add More Tracks', 'Add at least 2 audio tracks to merge.');
          setIsProcessing(false);
          return;
        }
        outputResult = await AudioEngine.processAudioAssembly(tracks);
      } else {
        // 144: Video Audio Extractor
        if (!videoSource) {
          Alert.alert('No Video Selected', 'Please select a video file first.');
          setIsProcessing(false);
          return;
        }
        outputResult = await AudioEngine.processVideoAudioExtraction(videoSource.uri, videoSource.name);
      }

      setResult(outputResult);

      addRecentItem({
        id: `recent-${Date.now()}`,
        toolId: selectedToolId,
        toolName: toolConfig.name,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Assembly Failed', e?.message || 'Processing failed');
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
      mimeType: 'audio/mpeg',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'Audio registered to My Files successfully.');
  };

  const totalTimelineDuration = tracks.reduce((a, b) => a + b.duration, 0);

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Audio Studio • Tools 132, 144, 153"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(selectedToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OfflineShield studioName="Audio Studio" />

        {/* Sub-tool switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcherRow}>
          {assemblyToolIds.map((id) => {
            const cfg = AUDIO_TOOLS[id];
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

        {/* Tracks Timeline for 132 & 153 */}
        {(selectedToolId === 132 || selectedToolId === 153) && (
          <View style={styles.timelineCard}>
            <View style={styles.timelineHeader}>
              <View>
                <Text style={styles.timelineTitle}>Audio Tracks Timeline</Text>
                <Text style={styles.timelineSub}>
                  {tracks.length} tracks • Total: {formatAudioDuration(totalTimelineDuration)}
                </Text>
              </View>
              <TouchableOpacity style={styles.addTrackBtn} onPress={handleAddTrack} activeOpacity={0.8}>
                <AppIcon name="Plus" size={14} color={Colors.surfaceWhite} />
                <Text style={styles.addTrackBtnText}>Add Track</Text>
              </TouchableOpacity>
            </View>

            {tracks.map((track, idx) => (
              <View key={idx} style={styles.trackItem}>
                <View style={styles.trackIndexBadge}>
                  <Text style={styles.trackIndexText}>#{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.trackName} numberOfLines={1}>{track.name}</Text>
                  <Text style={styles.trackMeta}>{formatAudioDuration(track.duration)} • {formatAudioFileSize(track.size)}</Text>
                </View>
                <View style={styles.reorderBtns}>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => moveTrack(idx, 'up')}
                    disabled={idx === 0}
                  >
                    <AppIcon name="ChevronUp" size={14} color={idx === 0 ? Colors.borderSubtle : Colors.onSurface} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    onPress={() => moveTrack(idx, 'down')}
                    disabled={idx === tracks.length - 1}
                  >
                    <AppIcon name="ChevronDown" size={14} color={idx === tracks.length - 1 ? Colors.borderSubtle : Colors.onSurface} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.trashBtn}
                    onPress={() => removeTrack(idx)}
                  >
                    <AppIcon name="Trash2" size={14} color={Colors.statusError} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 153 joins tracks with a hard cut — the native merge engine has no crossfade control */}
        {selectedToolId === 153 && (
          <View style={styles.controlsCard}>
            <Text style={styles.sectionTitle}>Note</Text>
            <Text style={{ fontSize: 12, color: Colors.textMuted }}>
              Tracks are joined back-to-back. Crossfade blending isn't supported by the on-device audio engine yet.
            </Text>
          </View>
        )}

        {/* Video Audio Extractor View for 144 */}
        {selectedToolId === 144 && (
          <View style={styles.controlsCard}>
            <Text style={styles.sectionTitle}>Source Video</Text>
            {videoSource ? (
              <View style={styles.videoSourceBox}>
                <AppIcon name="Film" size={24} color={Colors.accentBlue} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.videoSourceName} numberOfLines={1}>{videoSource.name}</Text>
                  <Text style={styles.videoSourceMeta}>
                    {formatAudioFileSize(videoSource.size)}
                  </Text>
                </View>
                <TouchableOpacity onPress={handlePickVideoSource}>
                  <Text style={{ color: Colors.accentBlue, fontSize: 12, fontWeight: '700' }}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addTrackBtn} onPress={handlePickVideoSource} activeOpacity={0.7}>
                <AppIcon name="Film" size={18} color={Colors.accentBlue} />
                <Text style={styles.addTrackBtnText}>Select Video File</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Execute Button */}
        <View style={{ marginTop: Spacing.sm }}>
          <PrimaryButton
            title={
              isProcessing
                ? 'Processing Audio Timeline...'
                : selectedToolId === 144
                ? 'Extract Audio Soundtrack (MP3)'
                : `Merge ${tracks.length} Tracks`
            }
            onPress={handleExecute}
            disabled={isProcessing}
            loading={isProcessing}
            variant="primary"
            color={Colors.accentBlue}
          />
        </View>

        {/* Result Card */}
        {result && (
          <AudioResultCard
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
    backgroundColor: Colors.accentBlue,
    borderColor: Colors.accentBlue,
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
  addTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.accentBlue,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  addTrackBtnText: {
    color: Colors.surfaceWhite,
    fontSize: 12,
    fontWeight: '600',
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  trackIndexBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceAudio,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentBlue,
  },
  trackName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  trackMeta: {
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
    backgroundColor: Colors.surfaceAudio,
    borderColor: Colors.accentBlue,
  },
  pillBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  pillBtnTextActive: {
    color: Colors.accentBlue,
  },
  videoSourceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: 4,
  },
  videoSourceName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  videoSourceMeta: {
    fontSize: 11,
    color: Colors.textMuted,
  },
});
