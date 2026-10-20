/**
 * PdfResultCard.tsx
 * Reusable output presentation component for PDF Studio workspaces.
 * Supports saving output to sandbox My Files, triggering native share, and copying info.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Colors, Radius, Spacing } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';
import { useAppStore } from '../../../../store/useAppStore';
import { formatFileSize } from './PdfFilePicker';

export interface PdfResultData {
  title: string;
  fileName?: string;
  fileUri?: string;
  fileSize?: number;
  pageCount?: number;
  metricLabel?: string;
  metricValue?: string;
  details?: Array<{ label: string; value: string }>;
  toolId: number;
  toolName: string;
}

interface PdfResultCardProps {
  result: PdfResultData;
  onReset?: () => void;
}

export const PdfResultCard: React.FC<PdfResultCardProps> = ({ result, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { addManagedFile, addRecentItem } = useAppStore();

  const handleSaveToFiles = () => {
    if (!result.fileName || !result.fileUri) {
      Alert.alert('Notice', 'No physical file generated to save.');
      return;
    }

    addManagedFile({
      name: result.fileName,
      uri: result.fileUri,
      size: result.fileSize || 0,
      toolId: result.toolId,
      toolName: result.toolName,
      createdAt: Date.now(),
    });

    addRecentItem({
      toolId: result.toolId,
      title: result.fileName,
      subtitle: `${result.toolName} · Saved to My Files`,
    });

    setIsSaved(true);
    Alert.alert('Saved to Files', `"${result.fileName}" has been stored in My Files.`);
  };

  const handleShare = async () => {
    if (!result.fileUri) {
      const summary = `${result.title}\n${result.fileName ? `File: ${result.fileName}\n` : ''}${result.details?.map((d) => `${d.label}: ${d.value}`).join('\n') || ''}`;
      await Clipboard.setStringAsync(summary);
      Alert.alert('Copied to Clipboard', 'Result details copied to clipboard.');
      return;
    }

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'Native sharing is not supported on this device.');
        return;
      }
      await Sharing.shareAsync(result.fileUri);
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Could not trigger native share sheet.');
    }
  };

  const handleCopyDetails = async () => {
    const textToCopy = result.details
      ? result.details.map((d) => `${d.label}: ${d.value}`).join('\n')
      : `${result.title}\n${result.fileName || ''}`;

    await Clipboard.setStringAsync(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <AppIcon name="CheckCircle2" size={24} color={Colors.statusSuccess} />
        </View>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>{result.title}</Text>
          {result.fileName ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {result.fileName} {result.fileSize ? `(${formatFileSize(result.fileSize)})` : ''}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Metric Banner */}
      {result.metricLabel && result.metricValue ? (
        <View style={styles.metricBanner}>
          <Text style={styles.metricLabel}>{result.metricLabel}</Text>
          <Text style={styles.metricValue}>{result.metricValue}</Text>
        </View>
      ) : null}

      {/* Details Breakdown */}
      {result.details && result.details.length > 0 ? (
        <View style={styles.detailsList}>
          {result.details.map((item, idx) => (
            <View key={idx} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{item.label}</Text>
              <Text style={styles.detailValue} numberOfLines={1}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        {result.fileUri && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.saveBtn, isSaved && styles.savedBtn]}
            onPress={handleSaveToFiles}
            disabled={isSaved}
          >
            <AppIcon name={isSaved ? 'Check' : 'Folder'} size={16} color="#FFFFFF" />
            <Text style={styles.saveBtnText}>{isSaved ? 'Saved' : 'Save to Files'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleShare}>
          <AppIcon name="Share2" size={16} color={Colors.accentCoral} />
          <Text style={styles.secondaryBtnText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.secondaryBtn]} onPress={handleCopyDetails}>
          <AppIcon
            name={copied ? 'Check' : 'Copy'}
            size={16}
            color={copied ? Colors.statusSuccess : Colors.onSurface}
          />
          <Text style={styles.secondaryBtnText}>{copied ? 'Copied' : 'Copy'}</Text>
        </TouchableOpacity>
      </View>

      {onReset && (
        <TouchableOpacity style={styles.resetBtn} onPress={onReset}>
          <Text style={styles.resetBtnText}>Process Another Document</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F0FDF4',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: Spacing.sm + 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metricBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  detailsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
    maxWidth: '65%',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    height: 42,
    borderRadius: Radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtn: {
    backgroundColor: Colors.statusSuccess,
  },
  savedBtn: {
    backgroundColor: '#059669',
    opacity: 0.8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  secondaryBtn: {
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  secondaryBtnText: {
    color: Colors.onSurface,
    fontSize: 12,
    fontWeight: '600',
  },
  resetBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});
