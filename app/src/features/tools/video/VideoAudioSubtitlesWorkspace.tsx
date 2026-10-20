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
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
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
  SubtitleCue,
  parseSrt,
  formatTimecode,
  formatDuration,
} from './shared/VideoHelpers';

interface VideoAudioSubtitlesWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

export const VideoAudioSubtitlesWorkspace: React.FC<VideoAudioSubtitlesWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = VIDEO_TOOLS[selectedToolId] || VIDEO_TOOLS[110];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  const [video, setVideo] = useState<VideoAsset | null>(null);

  // 110: Audio Extractor settings
  const [audioFormat, setAudioFormat] = useState<'mp3' | 'aac' | 'wav'>('mp3');
  const [audioBitrate, setAudioBitrate] = useState<number>(320);

  // 116 & 117: Subtitle Cues
  const [cues, setCues] = useState<SubtitleCue[]>([
    {
      id: 'cue-1',
      startMs: 1000,
      endMs: 4200,
      text: 'Welcome to Toolstrum, your offline utility toolkit.',
    },
    {
      id: 'cue-2',
      startMs: 4500,
      endMs: 8800,
      text: 'Everything runs on-device without server dependency.',
    },
    {
      id: 'cue-3',
      startMs: 9200,
      endMs: 14000,
      text: 'High performance, zero latency, absolute privacy guaranteed.',
    },
  ]);

  // 117: Subtitle target export format
  const [subtitleExportFormat, setSubtitleExportFormat] = useState<'srt' | 'vtt' | 'txt'>('srt');

  // 123: Audio Replacement
  const [bgMusicTrack, setBgMusicTrack] = useState<string>('');
  const [bgMusicUri, setBgMusicUri] = useState<string>('');
  const [musicVolume, setMusicVolume] = useState<number>(80);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ProcessedVideoResult | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const audioSubToolIds = [110, 114, 116, 117, 123];

  const handleImportSrt = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['text/*', 'application/x-subrip', '*/*'],
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        const text = await FileSystem.readAsStringAsync(res.assets[0].uri);
        const parsed = parseSrt(text);
        if (parsed.length > 0) {
          setCues(parsed);
          Alert.alert('Subtitles Imported', `Successfully loaded ${parsed.length} cues.`);
        } else {
          Alert.alert('Import Warning', 'No standard SRT cues were detected in file.');
        }
      }
    } catch (e: any) {
      Alert.alert('Import Error', e?.message || 'Could not import subtitle file');
    }
  };

  const handleUpdateCue = (idx: number, newText: string) => {
    const updated = [...cues];
    updated[idx].text = newText;
    setCues(updated);
  };

  const handleAddCue = () => {
    const last = cues[cues.length - 1];
    const newStart = last ? last.endMs + 400 : 1000;
    const newEnd = newStart + 3500;
    setCues((prev) => [
      ...prev,
      {
        id: `cue-${Date.now()}`,
        startMs: newStart,
        endMs: newEnd,
        text: 'New subtitle dialogue line...',
      },
    ]);
  };

  const handleDeleteCue = (idx: number) => {
    if (cues.length <= 1) {
      Alert.alert('Required', 'At least one subtitle cue must remain.');
      return;
    }
    setCues((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      let outputResult: ProcessedVideoResult;

      if (selectedToolId === 110) {
        // Video to MP3
        outputResult = await VideoEngine.processAudioExtraction(
          video!.uri,
          video!.name,
          video!.duration,
          audioFormat
        );
      } else if (selectedToolId === 114) {
        // Video Mute
        outputResult = await VideoEngine.processVideoMute(video!.uri, video!.name, video!.duration);
      } else if (selectedToolId === 116 || selectedToolId === 117) {
        // Subtitle Editor or Extractor Export
        const exportRes = await VideoEngine.exportSubtitlesFile(
          cues,
          subtitleExportFormat,
          video?.name || 'video_clip'
        );
        outputResult = {
          uri: exportRes.uri,
          name: exportRes.name,
          size: exportRes.size,
          format: subtitleExportFormat.toUpperCase(),
          metadata: {
            'Cues Exported': cues.length,
            'Total Duration': formatDuration(cues[cues.length - 1]?.endMs / 1000 || 0),
            'Encoding': 'UTF-8 Without BOM',
          },
        };
      } else {
        // 123: Audio Replacement
        if (!bgMusicUri) {
          Alert.alert('No Soundtrack Selected', 'Please choose a replacement audio file first.');
          setIsProcessing(false);
          return;
        }
        outputResult = await VideoEngine.processAudioReplacement(
          video!.uri,
          video!.name,
          video!.duration,
          bgMusicUri,
          musicVolume / 100
        );
      }

      setResult(outputResult);

      addRecentItem({
        id: `recent-${Date.now()}`,
        toolId: selectedToolId,
        toolName: toolConfig.name,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Processing Failed', e?.message || 'Could not process audio/subtitles');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToFiles = () => {
    if (!result) return;
    const isSub = selectedToolId === 116 || selectedToolId === 117;
    const isAudio = selectedToolId === 110;
    addManagedFile({
      name: result.name,
      uri: result.uri,
      size: result.size,
      sizeBytes: result.size,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: isSub ? 'text/plain' : isAudio ? 'audio/mpeg' : 'video/mp4',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'File saved to My Files successfully.');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Video Studio • Tools 110, 114, 116, 117, 123"
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
          {audioSubToolIds.map((id) => {
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

        {/* Dynamic Controls */}
        <View style={styles.controlsCard}>
          {selectedToolId === 110 && (
            /* Video to MP3 / Audio settings */
            <View>
              <Text style={styles.sectionTitle}>Audio Output Format</Text>
              <View style={styles.pillsRow}>
                {(['mp3', 'aac', 'wav'] as const).map((fmt) => (
                  <TouchableOpacity
                    key={fmt}
                    style={[styles.pillBtn, audioFormat === fmt && styles.pillBtnActive]}
                    onPress={() => setAudioFormat(fmt)}
                  >
                    <Text style={[styles.pillBtnText, audioFormat === fmt && styles.pillBtnTextActive]}>
                      {fmt.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { marginTop: Spacing.sm }]}>Audio Bitrate</Text>
              <View style={styles.pillsRow}>
                {[128, 192, 256, 320].map((kbps) => (
                  <TouchableOpacity
                    key={kbps}
                    style={[styles.pillBtn, audioBitrate === kbps && styles.pillBtnActive]}
                    onPress={() => setAudioBitrate(kbps)}
                  >
                    <Text style={[styles.pillBtnText, audioBitrate === kbps && styles.pillBtnTextActive]}>
                      {kbps} kbps {kbps === 320 ? '(Studio Max)' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedToolId === 114 && (
            /* Video Mute Explanation */
            <View style={styles.infoBox}>
              <AppIcon name="VolumeX" size={24} color={Colors.accentViolet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Lossless Audio Stripping</Text>
                <Text style={styles.infoSub}>
                  Removes all sound tracks directly without re-encoding video frames for instant lossless export.
                </Text>
              </View>
            </View>
          )}

          {(selectedToolId === 116 || selectedToolId === 117) && (
            /* Subtitle Cues Editor & Extractor */
            <View>
              <View style={styles.cueHeaderRow}>
                <Text style={styles.sectionTitle}>Subtitle Cues ({cues.length})</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <TouchableOpacity style={styles.smallOutlineBtn} onPress={handleImportSrt}>
                    <Text style={styles.smallOutlineBtnText}>Import SRT</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallPrimaryBtn} onPress={handleAddCue}>
                    <Text style={styles.smallPrimaryBtnText}>+ Add Cue</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {cues.map((cue, idx) => (
                <View key={cue.id} style={styles.cueItem}>
                  <View style={styles.cueMetaRow}>
                    <Text style={styles.cueBadge}>#{idx + 1}</Text>
                    <Text style={styles.cueTimecode}>
                      {formatTimecode(cue.startMs)} → {formatTimecode(cue.endMs)}
                    </Text>
                    <TouchableOpacity onPress={() => handleDeleteCue(idx)}>
                      <AppIcon name="Trash2" size={14} color={Colors.statusError} />
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={styles.cueTextInput}
                    value={cue.text}
                    onChangeText={(txt) => handleUpdateCue(idx, txt)}
                    multiline
                  />
                </View>
              ))}

              <Text style={[styles.sectionTitle, { marginTop: Spacing.sm }]}>Export Subtitle Format</Text>
              <View style={styles.pillsRow}>
                {(['srt', 'vtt', 'txt'] as const).map((fmt) => (
                  <TouchableOpacity
                    key={fmt}
                    style={[styles.pillBtn, subtitleExportFormat === fmt && styles.pillBtnActive]}
                    onPress={() => setSubtitleExportFormat(fmt)}
                  >
                    <Text style={[styles.pillBtnText, subtitleExportFormat === fmt && styles.pillBtnTextActive]}>
                      .{fmt.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {selectedToolId === 123 && (
            /* Audio Replacement Settings */
            <View>
              <Text style={styles.sectionTitle}>Replacement Soundtrack</Text>
              <View style={styles.audioFileRow}>
                <AppIcon name="Music" size={20} color={Colors.accentViolet} />
                <Text style={styles.audioFileName} numberOfLines={1}>
                  {bgMusicTrack || 'No file selected'}
                </Text>
                <TouchableOpacity
                  style={styles.changeTrackBtn}
                  onPress={async () => {
                    const res = await DocumentPicker.getDocumentAsync({ type: 'audio/*' });
                    if (!res.canceled && res.assets?.[0]) {
                      setBgMusicTrack(res.assets[0].name);
                      setBgMusicUri(res.assets[0].uri);
                    }
                  }}
                >
                  <Text style={styles.changeTrackText}>{bgMusicTrack ? 'Change' : 'Pick File'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.sectionTitle, { marginTop: Spacing.sm }]}>Music Volume Level ({musicVolume}%)</Text>
              <View style={styles.pillsRow}>
                {[50, 80, 100, 120].map((vol) => (
                  <TouchableOpacity
                    key={vol}
                    style={[styles.pillBtn, musicVolume === vol && styles.pillBtnActive]}
                    onPress={() => setMusicVolume(vol)}
                  >
                    <Text style={[styles.pillBtnText, musicVolume === vol && styles.pillBtnTextActive]}>
                      {vol}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Execute Button */}
          <View style={{ marginTop: Spacing.md }}>
            <PrimaryButton
              title={isProcessing ? 'Processing Audio Stream...' : `Execute ${toolConfig.name}`}
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
  infoBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.surfaceVideo,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  infoSub: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  cueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  smallOutlineBtn: {
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  smallOutlineBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  smallPrimaryBtn: {
    backgroundColor: Colors.accentViolet,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  smallPrimaryBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.surfaceWhite,
  },
  cueItem: {
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.xs,
  },
  cueMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cueBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.accentViolet,
  },
  cueTimecode: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  cueTextInput: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 6,
    fontSize: 12,
    color: Colors.onSurface,
  },
  audioFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginVertical: 4,
  },
  audioFileName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  changeTrackBtn: {
    backgroundColor: Colors.surfaceVideo,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  changeTrackText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentViolet,
  },
});
