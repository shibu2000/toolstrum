import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Colors, Radius, Spacing } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'pdf';
  color?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  variant = 'primary',
  color,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return Colors.outlineVariant;
    if (color) return color;
    switch (variant) {
      case 'secondary':
        return Colors.surfaceContainer;
      case 'danger':
        return Colors.statusError;
      case 'pdf':
        return Colors.accentCoral;
      case 'primary':
      default:
        return Colors.primaryContainer;
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.textMuted;
    if (variant === 'secondary') return Colors.onSurface;
    return '#FFFFFF';
  };

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: getBackgroundColor() }]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.content}>
          {icon ? <AppIcon name={icon} size={18} color={getTextColor()} strokeWidth={2.5} /> : null}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
