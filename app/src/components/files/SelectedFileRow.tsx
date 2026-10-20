import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';

interface SelectedFileRowProps {
  fileName: string;
  fileSize?: number;
  infoText?: string;
  onRemove: () => void;
  accentColor?: string;
  surfaceColor?: string;
  icon?: string;
}

export const SelectedFileRow: React.FC<SelectedFileRowProps> = ({
  fileName,
  fileSize,
  infoText,
  onRemove,
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

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        <View style={[styles.iconBox, { backgroundColor: surfaceColor }]}>
          <AppIcon name={icon} size={20} color={accentColor} />
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

      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <AppIcon name="close" size={18} color={Colors.textMuted} />
      </TouchableOpacity>
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
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  details: {
    flex: 1,
  },
  name: {
    fontSize: 14,
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
    fontSize: 12,
    color: Colors.textMuted,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceContainerLow,
  },
});
