import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Spacing } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';

interface FilePickerCardProps {
  title: string;
  subtitle?: string;
  onPress: () => void;
  accentColor?: string;
  surfaceColor?: string;
  icon?: string;
}

export const FilePickerCard: React.FC<FilePickerCardProps> = ({
  title,
  subtitle = 'Tap to select files from device storage',
  onPress,
  accentColor = Colors.primaryContainer,
  surfaceColor = Colors.surfaceContainerLow,
  icon = 'FilePlus',
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={[styles.dropzone, { backgroundColor: surfaceColor }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
          <AppIcon name={icon} size={28} color={accentColor} strokeWidth={2.2} />
        </View>

        <View style={[styles.button, { backgroundColor: accentColor }]}>
          <AppIcon name="Upload" size={18} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.buttonText}>{title}</Text>
        </View>

        <Text style={styles.subtitle}>{subtitle}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  dropzone: {
    borderRadius: Radius.lg,
    paddingVertical: 24,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Colors.borderSubtle,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    height: 44,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
