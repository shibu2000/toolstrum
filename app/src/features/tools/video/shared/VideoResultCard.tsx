import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';
import { formatDuration, formatFileSize } from './VideoHelpers';
import { ProcessedVideoResult } from './VideoEngine';

interface VideoResultCardProps {
  result: ProcessedVideoResult;
  onSaveToManagedFiles?: () => void;
  saved?: boolean;
}

export const VideoResultCard: React.FC<VideoResultCardProps> = ({
  result,
  onSaveToManagedFiles,
  saved = false,
}) => {
  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable && result.uri) {
        await Sharing.shareAsync(result.uri);
      } else {
        await Clipboard.setStringAsync(result.uri);
        Alert.alert('Sharing Unavailable', 'File URI copied to clipboard.');
      }
    } catch (e: any) {
      Alert.alert('Share Failed', e?.message || 'Could not trigger native share sheet.');
    }
  };

  const handleCopyPath = async () => {
    await Clipboard.setStringAsync(result.uri);
    Alert.alert('Copied', 'File path copied to clipboard.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeSuccess}>
          <AppIcon name="CheckCircle2" size={16} color={Colors.statusSuccess} />
          <Text style={styles.badgeSuccessText}>Processing Complete</Text>
        </View>

        {result.savingsPercent !== undefined && result.savingsPercent > 0 && (
          <View style={styles.savingsBadge}>
            <Text style={styles.savingsBadgeText}>-{result.savingsPercent}% Size</Text>
          </View>
        )}
      </View>

      <Text style={styles.fileName} numberOfLines={1}>
        {result.name}
      </Text>

      {/* Badges strip */}
      <View style={styles.badgesRow}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{formatFileSize(result.size)}</Text>
        </View>
        {result.duration !== undefined && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{formatDuration(result.duration)}</Text>
          </View>
        )}
        {result.resolution && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>{result.resolution}</Text>
          </View>
        )}
        {result.format && (
          <View style={styles.pillAccent}>
            <Text style={styles.pillAccentText}>{result.format}</Text>
          </View>
        )}
      </View>

      {/* Metadata Attributes Grid */}
      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <View style={styles.metadataGrid}>
          {Object.entries(result.metadata).map(([key, val]) => (
            <View key={key} style={styles.metaRow}>
              <Text style={styles.metaKey}>{key}:</Text>
              <Text style={styles.metaVal}>{String(val)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtnPrimary} onPress={handleShare} activeOpacity={0.8}>
          <AppIcon name="Share2" size={16} color={Colors.surfaceWhite} />
          <Text style={styles.actionBtnPrimaryText}>Share</Text>
        </TouchableOpacity>

        {onSaveToManagedFiles && (
          <TouchableOpacity
            style={[styles.actionBtnSecondary, saved && styles.actionBtnSaved]}
            onPress={onSaveToManagedFiles}
            activeOpacity={0.8}
            disabled={saved}
          >
            <AppIcon name={saved ? 'Check' : 'Download'} size={16} color={saved ? Colors.statusSuccess : Colors.onSurface} />
            <Text style={[styles.actionBtnSecondaryText, saved && { color: Colors.statusSuccess }]}>
              {saved ? 'Saved' : 'Save to Files'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionBtnIcon} onPress={handleCopyPath} activeOpacity={0.7}>
          <AppIcon name="Copy" size={16} color={Colors.onSurface} />
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
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeSuccessText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.statusSuccess,
  },
  savingsBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  savingsBadgeText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '800',
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
    marginVertical: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: Spacing.xs,
  },
  pill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  pillText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  pillAccent: {
    backgroundColor: Colors.surfaceVideo,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  pillAccentText: {
    fontSize: 11,
    color: Colors.accentViolet,
    fontWeight: '800',
  },
  metadataGrid: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaKey: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  metaVal: {
    fontSize: 11,
    color: Colors.onSurface,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accentViolet,
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: 6,
  },
  actionBtnPrimaryText: {
    color: Colors.surfaceWhite,
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingVertical: 10,
    borderRadius: Radius.md,
    gap: 6,
  },
  actionBtnSaved: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  actionBtnSecondaryText: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtnIcon: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
  },
});
