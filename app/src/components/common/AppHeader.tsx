import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Spacing, Radius } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';
import { AppLogo } from './AppLogo';

export interface HeaderActionItem {
  icon: string;
  onPress: () => void;
  color?: string;
}

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  showBack?: boolean;
  onBackPress?: () => void;
  onSettingsPress?: () => void;
  rightAction?: React.ReactNode | HeaderActionItem;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title = 'Toolstrum',
  subtitle = '495+ Offline Tools In One Suite',
  badge,
  showBack = false,
  onBackPress,
  onSettingsPress,
  rightAction,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
      <View style={styles.contentRow}>
        <View style={styles.leftContainer}>
        {showBack ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppIcon name="arrow_back" size={24} color={Colors.onSurface} />
          </TouchableOpacity>
        ) : (
          <View style={styles.logoBadge}>
            <AppLogo size={34} />
          </View>
        )}

        <View style={styles.textContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={styles.title} numberOfLines={1}>
              {title}
            </Text>
            {badge && (
              <View style={{ backgroundColor: Colors.surfaceContainerHigh, paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.primary }}>{badge}</Text>
              </View>
            )}
          </View>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      <View style={styles.rightContainer}>
        {rightAction ? (
          React.isValidElement(rightAction) ? (
            rightAction
          ) : typeof rightAction === 'object' && 'icon' in rightAction ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={(rightAction as HeaderActionItem).onPress}
              activeOpacity={0.7}
            >
              <AppIcon
                name={(rightAction as HeaderActionItem).icon}
                size={22}
                color={(rightAction as HeaderActionItem).color || Colors.onSurfaceVariant}
              />
            </TouchableOpacity>
          ) : (
            (rightAction as React.ReactNode)
          )
        ) : onSettingsPress ? (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onSettingsPress}
            activeOpacity={0.7}
          >
            <AppIcon name="settings" size={22} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        ) : null}
      </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.surfaceWhite,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
    zIndex: 10,
    elevation: 3,
  },
  contentRow: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
