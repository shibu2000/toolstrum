import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';

interface SelectedFileRowProps {
  fileName: string;
  fileSize?: number;
  infoText?: string;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  orderNumber?: number;
  accentColor?: string;
  surfaceColor?: string;
  icon?: string;
}

export const SelectedFileRow: React.FC<SelectedFileRowProps> = ({
  fileName,
  fileSize,
  infoText,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false,
  orderNumber,
  accentColor = Colors.accentCoral,
  surfaceColor = Colors.surfacePdf,
  icon = 'FileText',
}) => {
  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasReorder = Boolean(onMoveUp && onMoveDown);

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        {orderNumber !== undefined ? (
          <View style={[styles.orderBadge, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.orderNumberText, { color: accentColor }]}>#{orderNumber}</Text>
          </View>
        ) : null}

        <View style={[styles.iconBox, { backgroundColor: surfaceColor }]}>
          <AppIcon name={icon} size={18} color={accentColor} />
        </View>

        <View style={styles.details}>
          <Text style={styles.name} numberOfLines={1}>
            {fileName}
          </Text>
          <View style={styles.metaRow}>
            {infoText ? <Text style={styles.metaText}>{infoText}</Text> : null}
            {infoText && fileSize ? <View style={styles.dot} /> : null}
            {fileSize ? <Text style={styles.metaText}>{formatSize(fileSize)}</Text> : null}
          </View>
        </View>
      </View>

      <View style={styles.rightGroup}>
        {hasReorder ? (
          <View style={styles.arrowGroup}>
            <TouchableOpacity
              style={[styles.arrowBtn, isFirst && styles.arrowBtnDisabled]}
              onPress={onMoveUp}
              disabled={isFirst}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <AppIcon
                name="ChevronUp"
                size={16}
                color={isFirst ? Colors.outlineVariant : Colors.onSurfaceVariant}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowBtn, isLast && styles.arrowBtnDisabled]}
              onPress={onMoveDown}
              disabled={isLast}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <AppIcon
                name="ChevronDown"
                size={16}
                color={isLast ? Colors.outlineVariant : Colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <AppIcon name="close" size={16} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.sm + 4,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.xs + 4,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  orderBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: Radius.xs,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs + 2,
  },
  orderNumberText: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  arrowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    padding: 2,
  },
  arrowBtn: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.xs,
  },
  arrowBtnDisabled: {
    opacity: 0.35,
  },
  removeButton: {
    width: 30,
    height: 30,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
});
