import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

export interface TextStatItem {
  label: string;
  value: string | number;
}

export interface TextResultCardProps {
  title: string;
  content: string;
  badgeText?: string;
  subtitle?: string;
  stats?: TextStatItem[];
  onSaveToManagedFiles?: () => void;
  saved?: boolean;
  fileName?: string;
}

export const TextResultCard: React.FC<TextResultCardProps> = ({
  title,
  content,
  badgeText = 'Result Ready',
  subtitle,
  stats,
  onSaveToManagedFiles,
  saved = false,
  fileName = 'text-output.txt',
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    if (!content) return;
    await Clipboard.setStringAsync(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!content) {
      Alert.alert('Share', 'No content to share.');
      return;
    }
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Share', 'System sharing not available.');
        return;
      }
      const uri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(uri, content, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Error', 'Unable to share text file.');
    }
  };

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.badgeSuccess}>
            <AppIcon name="CheckCircle2" size={14} color={Colors.statusSuccess} />
            <Text style={styles.badgeSuccessText}>{badgeText}</Text>
          </View>
          <Text style={styles.metaSize}>{content.length} chars</Text>
        </View>

        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>

      {/* Numerical Stats Grid if provided */}
      {stats && stats.length > 0 && (
        <View style={styles.statsGrid}>
          {stats.map((s, idx) => (
            <View key={idx} style={styles.statBox}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Content Display */}
      {content ? (
        <View style={styles.contentContainer}>
          <View style={styles.contentHeader}>
            <Text style={styles.contentHeaderText}>Output Preview</Text>
            <TouchableOpacity onPress={() => setExpanded(!expanded)}>
              <Text style={styles.expandText}>{expanded ? 'Show Less' : 'Show Full'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={[styles.scrollArea, expanded && styles.scrollAreaExpanded]}
            nestedScrollEnabled
          >
            <Text style={styles.contentText} selectable>
              {content}
            </Text>
          </ScrollView>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
          <AppIcon
            name={copied ? 'Check' : 'Copy'}
            size={16}
            color={copied ? Colors.statusSuccess : Colors.onSurface}
          />
          <Text style={[styles.actionBtnText, copied && { color: Colors.statusSuccess }]}>
            {copied ? 'Copied' : 'Copy'}
          </Text>
        </TouchableOpacity>

        {onSaveToManagedFiles && (
          <TouchableOpacity
            style={[styles.actionBtn, saved && styles.actionBtnSaved]}
            onPress={onSaveToManagedFiles}
          >
            <AppIcon
              name={saved ? 'BookmarkCheck' : 'Bookmark'}
              size={16}
              color={saved ? Colors.statusSuccess : Colors.onSurface}
            />
            <Text style={[styles.actionBtnText, saved && { color: Colors.statusSuccess }]}>
              {saved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnPrimary]} onPress={handleShare}>
          <AppIcon name="Share2" size={16} color={Colors.surfaceWhite} />
          <Text style={styles.actionBtnPrimaryText}>Share</Text>
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
    borderColor: Colors.borderLight,
    marginTop: Spacing.md,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    gap: 4,
  },
  badgeSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.statusSuccess,
  },
  metaSize: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subtitleText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: 70,
    backgroundColor: Colors.surfaceBackground,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: Radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  contentContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 10,
    marginVertical: Spacing.sm,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    paddingBottom: 4,
  },
  contentHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  expandText: {
    fontSize: 12,
    color: Colors.accentOrange,
    fontWeight: '600',
  },
  scrollArea: {
    maxHeight: 140,
  },
  scrollAreaExpanded: {
    maxHeight: 300,
  },
  contentText: {
    fontFamily: 'Courier',
    fontSize: 13,
    color: Colors.onSurface,
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceBackground,
    paddingVertical: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  actionBtnSaved: {
    borderColor: Colors.statusSuccess,
    backgroundColor: '#DCFCE7',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  actionBtnPrimary: {
    backgroundColor: Colors.accentOrange,
    borderColor: Colors.accentOrange,
  },
  actionBtnPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.surfaceWhite,
  },
});
