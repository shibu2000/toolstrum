import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';
import { OfficeExecutionResult, OfficeEngine } from './OfficeEngine';

interface OfficeResultCardProps {
  result: OfficeExecutionResult;
  onSaveToManagedFiles: () => void;
  saved?: boolean;
}

export const OfficeResultCard: React.FC<OfficeResultCardProps> = ({
  result,
  onSaveToManagedFiles,
  saved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    if (result.content) {
      await Clipboard.setStringAsync(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (result.uri) {
      await OfficeEngine.shareFile(result.uri);
    } else if (result.content) {
      await OfficeEngine.shareFile(result.content);
    } else {
      Alert.alert('Share', 'No output file available to share.');
    }
  };

  const sizeKb = Math.round(result.sizeBytes / 1024);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.badgeSuccess}>
            <AppIcon name="CheckCircle2" size={14} color={Colors.statusSuccess} />
            <Text style={styles.badgeSuccessText}>Operation Complete</Text>
          </View>
          <View style={styles.formatBadge}>
            <Text style={styles.formatBadgeText}>{result.format}</Text>
          </View>
        </View>

        <Text style={styles.fileName}>{result.name}</Text>
        <Text style={styles.fileSize}>
          Size: {sizeKb > 0 ? `${sizeKb} KB` : `${result.sizeBytes} B`}
        </Text>
      </View>

      {/* Metadata Badges if present */}
      {result.metadata && Object.keys(result.metadata).length > 0 && (
        <View style={styles.metaGrid}>
          {Object.entries(result.metadata).map(([key, val]) => (
            <View key={key} style={styles.metaItem}>
              <Text style={styles.metaKey}>{key}</Text>
              <Text style={styles.metaVal}>{val}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Document Lexical Stats if present */}
      {result.stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{result.stats.words}</Text>
            <Text style={styles.statLabel}>Words</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{result.stats.characters}</Text>
            <Text style={styles.statLabel}>Chars</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{result.stats.sentences}</Text>
            <Text style={styles.statLabel}>Sentences</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{result.stats.readingTimeMinutes}m</Text>
            <Text style={styles.statLabel}>Read Time</Text>
          </View>
        </View>
      )}

      {/* Content Preview Box if text content exists */}
      {result.content && (
        <View style={styles.previewBox}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>Content Preview</Text>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={styles.toggleText}>{expanded ? 'Show Less' : 'Show More'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={[styles.codeScroll, expanded && { maxHeight: 320 }]}
            nestedScrollEnabled
          >
            <Text style={styles.codeText} numberOfLines={expanded ? undefined : 8}>
              {result.content}
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        {result.content && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.7}>
            <AppIcon name={copied ? 'Check' : 'Copy'} size={15} color={Colors.accentIndigo} />
            <Text style={styles.actionBtnText}>{copied ? 'Copied' : 'Copy Text'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionBtn, saved && styles.actionBtnSaved]}
          onPress={onSaveToManagedFiles}
          activeOpacity={0.7}
        >
          <AppIcon
            name={saved ? 'Check' : 'FolderPlus'}
            size={15}
            color={saved ? Colors.statusSuccess : Colors.accentIndigo}
          />
          <Text style={[styles.actionBtnText, saved && { color: Colors.statusSuccess }]}>
            {saved ? 'Saved in Files' : 'Save to Files'}
          </Text>
        </TouchableOpacity>

        {result.uri && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleShare} activeOpacity={0.7}>
            <AppIcon name="Share2" size={15} color={Colors.accentIndigo} />
            <Text style={styles.actionBtnText}>Share</Text>
          </TouchableOpacity>
        )}
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
    marginBottom: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.statusSuccess,
  },
  formatBadge: {
    backgroundColor: Colors.surfaceOffice,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  formatBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentIndigo,
  },
  fileName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  fileSize: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: Colors.surfaceBackground,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  metaItem: {
    minWidth: '45%',
  },
  metaKey: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  metaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceOffice,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  statBox: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.accentIndigo,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 2,
  },
  previewBox: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 4,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  toggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentIndigo,
  },
  codeScroll: {
    maxHeight: 140,
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#E2E8F0',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceOffice,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  actionBtnSaved: {
    backgroundColor: '#DCFCE7',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentIndigo,
  },
});
