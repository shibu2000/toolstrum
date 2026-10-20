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
import { AUDIO_TOOLS } from './audioConfig';
import { AudioPickerBox, AudioAsset } from './shared/AudioPickerBox';
import { AudioResultCard } from './shared/AudioResultCard';
import { AudioEngine, ProcessedAudioResult } from './shared/AudioEngine';
import { formatAudioFileSize, formatAudioDuration } from './shared/AudioHelpers';

interface AudioTranscodeWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

export const AudioTranscodeWorkspace: React.FC<AudioTranscodeWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = AUDIO_TOOLS[selectedToolId] || AUDIO_TOOLS[129];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  const [audio, setAudio] = useState<AudioAsset | null>(null);

  // Batch queue for 152
  const [batchQueue, setBatchQueue] = useState<AudioAsset[]>([]);

  // Transcode options
  // 129: Target bitrate

  // 130: Target format
  const [targetFormat, setTargetFormat] = useState<'mp3' | 'wav' | 'aac' | 'flac' | 'm4a'>('mp3');

  // 150: Channel configuration

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedAudioResult | null>(null);
  const [batchResults, setBatchResults] = useState<ProcessedAudioResult[]>([]);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const transcodeToolIds = [129, 130, 142, 143, 150, 152];

  const handleTranscode = async () => {
    if (selectedToolId === 152 && batchQueue.length === 0) {
      Alert.alert('Empty Queue', 'Add tracks to batch queue first.');
      return;
    }
    if (selectedToolId !== 152 && !audio) {
      Alert.alert('No Audio', 'Please select an audio file first.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setBatchResults([]);
    setIsSaved(false);

    try {
      let outputResult: ProcessedAudioResult;

      if (selectedToolId === 129) {
        // Audio Compressor — note: the native engine has no bitrate control for
        // audio, so this re-encodes to m4a without applying the requested bitrate.
        outputResult = await AudioEngine.processAudioTranscode(
          audio!.uri,
          audio!.name,
          audio!.size,
          audio!.duration,
          'm4a'
        );
      } else if (selectedToolId === 130) {
        // Audio Converter
        outputResult = await AudioEngine.processAudioTranscode(
          audio!.uri,
          audio!.name,
          audio!.size,
          audio!.duration,
          targetFormat
        );
      } else if (selectedToolId === 142) {
        // Audio to WAV — real re-encode of the user's actual input
        outputResult = await AudioEngine.processAudioTranscode(
          audio!.uri,
          audio!.name,
          audio!.size,
          audio!.duration,
          'wav'
        );
      } else if (selectedToolId === 143) {
        // Audio to MP3
        outputResult = await AudioEngine.processAudioTranscode(
          audio!.uri,
          audio!.name,
          audio!.size,
          audio!.duration,
          'mp3'
        );
      } else if (selectedToolId === 150) {
        // Audio Channel Converter — no native mono/stereo control available yet
        throw new Error('Channel conversion is not yet supported by the on-device audio engine.');
      } else {
        // 152: Batch Audio Converter — processes each file for real; no zip
        // bundling since no archive library is available on mobile.
        const parts: ProcessedAudioResult[] = [];
        for (const track of batchQueue) {
          const converted = await AudioEngine.processAudioTranscode(track.uri, track.name, track.size, track.duration, 'm4a');
          parts.push(converted);
        }
        setBatchResults(parts);
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
      Alert.alert('Transcode Error', e?.message || 'Processing failed');
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
      mimeType: result.format === 'WAV' ? 'audio/wav' : 'audio/mpeg',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'Audio registered to My Files successfully.');
  };

  const handleSaveBatchItem = (item: ProcessedAudioResult) => {
    addManagedFile({
      name: item.name,
      uri: item.uri,
      size: item.size,
      sizeBytes: item.size,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: 'audio/mp4',
      createdAt: Date.now(),
    });
    Alert.alert('Saved', `${item.name} saved to My Files.`);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Audio Studio • Tools 129, 130, 142, 143, 150, 152"
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
          {transcodeToolIds.map((id) => {
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

        {/* File Picker or Batch Queue */}
        {selectedToolId === 152 ? (
          /* Batch Queue */
          <View style={styles.batchCard}>
            <View style={styles.batchHeader}>
              <Text style={styles.batchTitle}>Batch Audio Queue ({batchQueue.length} files)</Text>
              <TouchableOpacity
                style={styles.addBatchBtn}
                onPress={() => {
                  setBatchQueue((prev) => [
                    ...prev,
                    {
                      uri: `track_${Date.now()}`,
                      name: `Drum_Track_${prev.length + 1}.wav`,
                      size: 24 * 1024 * 1024,
                      duration: 140,
                      format: 'WAV',
                      bitrateKbps: 1411,
                    },
                  ]);
                }}
              >
                <AppIcon name="Plus" size={14} color={Colors.accentBlue} />
                <Text style={styles.addBatchText}>Add Track</Text>
              </TouchableOpacity>
            </View>

            {batchQueue.map((item, index) => (
              <View key={index} style={styles.batchItemRow}>
                <View style={styles.batchIcon}>
                  <AppIcon name="Music" size={18} color={Colors.accentBlue} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.batchFileName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.batchFileMeta}>{formatAudioDuration(item.duration)} • {formatAudioFileSize(item.size)}</Text>
                </View>
                <TouchableOpacity onPress={() => setBatchQueue((q) => q.filter((_, i) => i !== index))}>
                  <AppIcon name="Trash2" size={16} color={Colors.statusError} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <AudioPickerBox audio={audio} onAudioSelected={(a) => { setAudio(a); setResult(null); }} />
        )}

        {/* Options Panel */}
        <View style={styles.controlsCard}>
          {(selectedToolId === 129 || selectedToolId === 143) && (
            <View>
              <Text style={styles.sectionTitle}>{selectedToolId === 129 ? 'Compress' : 'Convert to MP3'}</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                {selectedToolId === 129
                  ? "Re-encodes your audio. The on-device engine doesn't expose a bitrate control yet, so a specific target size can't be guaranteed."
                  : 'Re-encodes your audio to the MP3 container.'}
              </Text>
            </View>
          )}

          {(selectedToolId === 130 || selectedToolId === 152) && (
            /* Format Selector */
            <View>
              <Text style={styles.sectionTitle}>Target Container Format</Text>
              <View style={styles.pillsRow}>
                {(['mp3', 'wav', 'aac', 'flac', 'm4a'] as const).map((fmt) => (
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

          {selectedToolId === 150 && (
            <View>
              <Text style={styles.sectionTitle}>Channel Transform</Text>
              <Text style={{ fontSize: 12, color: Colors.textMuted }}>
                Not yet available — the on-device audio engine doesn't expose channel (mono/stereo) controls yet.
              </Text>
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
              color={Colors.accentBlue}
            />
          </View>
        </View>

        {/* Results Card */}
        {result && (
          <AudioResultCard
            result={result}
            onSaveToManagedFiles={handleSaveToFiles}
            saved={isSaved}
          />
        )}

        {batchResults.length > 0 && (
          <View style={styles.batchResultsContainer}>
            <Text style={styles.batchResultsTitle}>{batchResults.length} of {batchQueue.length} tracks processed</Text>
            {batchResults.map((item, idx) => (
              <View key={idx} style={styles.batchResultRow}>
                <AppIcon name="FileAudio" size={16} color={Colors.accentBlue} />
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
    marginTop: 16,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  batchResultsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
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
    color: Colors.accentBlue,
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
    backgroundColor: Colors.surfaceAudio,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  addBatchText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentBlue,
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
    backgroundColor: Colors.surfaceAudio,
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
});
