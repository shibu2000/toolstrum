import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';
import { formatAudioDuration, formatAudioFileSize, generateMockWaveform } from './AudioHelpers';

export interface AudioAsset {
  uri: string;
  name: string;
  size: number;
  duration: number; // seconds
  format: string;
  bitrateKbps: number;
}

interface AudioPickerBoxProps {
  audio: AudioAsset | null;
  onAudioSelected: (audio: AudioAsset) => void;
  title?: string;
  subtitle?: string;
  allowChange?: boolean;
}

export const AudioPickerBox: React.FC<AudioPickerBoxProps> = ({
  audio,
  onAudioSelected,
  title = 'Select Audio Track',
  subtitle = 'Supports MP3, WAV, AAC, M4A, FLAC, OGG',
  allowChange = true,
}) => {
  const waveformBars = React.useMemo(() => generateMockWaveform(36), [audio?.name]);

  const handlePickDocument = async () => {
    try {
      const docResult = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', '*/*'],
        copyToCacheDirectory: true,
      });

      if (!docResult.canceled && docResult.assets && docResult.assets.length > 0) {
        const file = docResult.assets[0];
        const ext = file.name.split('.').pop()?.toUpperCase() || 'MP3';
        let fileSize = file.size || 1024 * 1024 * 6;
        try {
          const info = await FileSystem.getInfoAsync(file.uri);
          if (info.exists && 'size' in info && typeof info.size === 'number') {
            fileSize = info.size;
          }
        } catch {
          // ignore
        }

        onAudioSelected({
          uri: file.uri,
          name: file.name,
          size: fileSize,
          duration: 184, // ~3m 04s
          format: ext,
          bitrateKbps: 320,
        });
      }
    } catch (err: any) {
      Alert.alert('Selection Error', err?.message || 'Could not select audio file');
    }
  };

  if (audio) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <AppIcon name="Music" size={22} color={Colors.accentBlue} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.fileName} numberOfLines={1}>
              {audio.name}
            </Text>
            <Text style={styles.fileSub}>
              {formatAudioDuration(audio.duration)} • {formatAudioFileSize(audio.size)} • {audio.bitrateKbps} kbps {audio.format}
            </Text>
          </View>
          {allowChange && (
            <TouchableOpacity style={styles.changeBtn} onPress={handlePickDocument} activeOpacity={0.7}>
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Visual Waveform & Player Preview */}
        <View style={styles.waveformPlayerBox}>
          <View style={styles.playerControlsRow}>
            <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
              <AppIcon name="Play" size={16} color={Colors.surfaceWhite} />
            </TouchableOpacity>

            {/* Waveform Bar Graphic */}
            <View style={styles.waveformBarsStrip}>
              {waveformBars.map((heightFactor, i) => (
                <View
                  key={i}
                  style={[
                    styles.waveformBar,
                    { height: Math.max(4, Math.round(heightFactor * 32)) },
                    i < 12 ? styles.waveformBarPlayed : styles.waveformBarUnplayed,
                  ]}
                />
              ))}
            </View>

            <View style={styles.timecodePill}>
              <Text style={styles.timecodeText}>00:00 / {formatAudioDuration(audio.duration)}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.emptyContainer}>
      <View style={styles.uploadIconBadge}>
        <AppIcon name="Headphones" size={30} color={Colors.accentBlue} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptySubtitle}>{subtitle}</Text>

      <TouchableOpacity style={styles.primaryPickerBtn} onPress={handlePickDocument} activeOpacity={0.8}>
        <AppIcon name="Folder" size={16} color={Colors.surfaceWhite} />
        <Text style={styles.primaryPickerBtnText}>Browse Audio Files</Text>
      </TouchableOpacity>
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
    backgroundColor: Colors.surfaceAudio,
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
    backgroundColor: Colors.surfaceAudio,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentBlue,
  },
  waveformPlayerBox: {
    backgroundColor: '#0E1726',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginTop: 4,
  },
  playerControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.accentBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformBarsStrip: {
    flex: 1,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
  },
  waveformBarPlayed: {
    backgroundColor: Colors.accentBlue,
  },
  waveformBarUnplayed: {
    backgroundColor: '#334155',
  },
  timecodePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  timecodeText: {
    fontSize: 11,
    color: Colors.surfaceWhite,
    fontWeight: '600',
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
    backgroundColor: Colors.surfaceAudio,
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
  primaryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentBlue,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    gap: 8,
  },
  primaryPickerBtnText: {
    color: Colors.surfaceWhite,
    fontSize: 13,
    fontWeight: '600',
  },
});
