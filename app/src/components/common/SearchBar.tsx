import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Radius } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search 500+ tools...',
  onFilterPress,
  onClear,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <AppIcon name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 ? (
          <TouchableOpacity onPress={onClear || (() => onChangeText(''))} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <AppIcon name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {onFilterPress ? (
        <TouchableOpacity style={styles.filterButton} onPress={onFilterPress} activeOpacity={0.7}>
          <AppIcon name="tune" size={18} color={Colors.onSurfaceVariant} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.onSurface,
    height: '100%',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
});
