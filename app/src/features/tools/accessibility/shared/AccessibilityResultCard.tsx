import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

interface MetaItem {
  label: string;
  value: string;
}

interface AccessibilityResultCardProps {
  title: string;
  badge?: string;
  subtitle?: string;
  primaryValue?: string;
  primarySubtext?: string;
  details?: string;
  metadata?: MetaItem[];
  copyContent?: string;
  onClear?: () => void;
  actionButtonLabel?: string;
  onActionButtonPress?: () => void;
}

export const AccessibilityResultCard: React.FC<AccessibilityResultCardProps> = ({
  title,
  badge = '100% Offline Accessibility',
  subtitle,
  primaryValue,
  primarySubtext,
  details,
  metadata = [],
  copyContent,
  onClear,
  actionButtonLabel,
  onActionButtonPress,
}) => {
  const handleCopy = async () => {
    const textToCopy = copyContent || details || primaryValue;
    if (!textToCopy) return;
    await Clipboard.setStringAsync(textToCopy);
    Alert.alert('Copied to Clipboard', 'Content has been copied.');
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <AppIcon name="Smartphone" size={14} color="#4F46E5" />
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {primaryValue ? (
        <View style={styles.primaryBox}>
          <Text style={styles.primaryValue} numberOfLines={3}>
            {primaryValue}
          </Text>
          {primarySubtext ? (
            <Text style={styles.primarySubtext}>{primarySubtext}</Text>
          ) : null}
        </View>
      ) : null}

      {details ? (
        <View style={styles.detailsBox}>
          <Text style={styles.detailsText}>{details}</Text>
        </View>
      ) : null}

      {metadata.length > 0 && (
        <View style={styles.metaGrid}>
          {metadata.map((item, idx) => (
            <View key={idx} style={styles.metaCell}>
              <Text style={styles.metaLabel}>{item.label}</Text>
              <Text style={styles.metaValue} numberOfLines={2}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionsRow}>
        {(copyContent || details || primaryValue) && (
          <TouchableOpacity style={styles.actionBtn} onPress={handleCopy}>
            <AppIcon name="Copy" size={16} color="#4F46E5" />
            <Text style={styles.actionBtnText}>Copy Result</Text>
          </TouchableOpacity>
        )}

        {actionButtonLabel && onActionButtonPress && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnSecondary]}
            onPress={onActionButtonPress}
          >
            <AppIcon name="Share2" size={16} color="#475569" />
            <Text style={styles.actionBtnSecondaryText}>
              {actionButtonLabel}
            </Text>
          </TouchableOpacity>
        )}

        {onClear && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnClear]}
            onPress={onClear}
          >
            <AppIcon name="RotateCcw" size={16} color="#64748B" />
            <Text style={styles.actionBtnClearText}>Reset</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    marginVertical: Spacing.md,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4338CA',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#312E81',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  primaryBox: {
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  primaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3730A3',
  },
  primarySubtext: {
    fontSize: 12,
    color: '#4F46E5',
    marginTop: 4,
    fontWeight: '600',
  },
  detailsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailsText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  metaCell: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  metaLabel: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '700',
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E0E7FF',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  actionBtnSecondary: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  actionBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  actionBtnClear: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    marginLeft: 'auto',
  },
  actionBtnClearText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
});
