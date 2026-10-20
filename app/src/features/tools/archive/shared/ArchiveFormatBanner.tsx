/**
 * ArchiveFormatBanner.tsx
 * Transparent disclosure banner that informs users about offline on-device capabilities,
 * sandbox storage limits, and supported archive formats.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

interface ArchiveFormatBannerProps {
  format?: 'zip' | '7z' | 'tar' | 'gzip' | 'rar' | 'all';
  showDetails?: boolean;
}

export const ArchiveFormatBanner: React.FC<ArchiveFormatBannerProps> = ({
  format = 'zip',
  showDetails = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <AppIcon name="ShieldCheck" size={18} color={Colors.accentSlate} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>100% On-Device Archive Engine</Text>
          <Text style={styles.subtitle}>
            Zero cloud uploads. All archives and files remain strictly within your device's sandbox.
          </Text>
        </View>
      </View>

      {showDetails && (
        <View style={styles.badgeRow}>
          <View style={[styles.badge, styles.badgeSupported]}>
            <AppIcon name="Check" size={12} color={Colors.statusSuccess} />
            <Text style={[styles.badgeText, { color: Colors.statusSuccess }]}>ZIP: Full Read & Write</Text>
          </View>
          <View style={[styles.badge, styles.badgeInspect]}>
            <AppIcon name="Eye" size={12} color={Colors.accentIndigo} />
            <Text style={[styles.badgeText, { color: Colors.accentIndigo }]}>TAR/GZ/7Z: Inspect & Verify</Text>
          </View>
          <View style={[styles.badge, styles.badgeNotice]}>
            <AppIcon name="Lock" size={12} color={Colors.accentSlate} />
            <Text style={[styles.badgeText, { color: Colors.accentSlate }]}>No External Relays</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceArchive,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  badgeSupported: {
    borderColor: '#DCFCE7',
    backgroundColor: '#F0FDF4',
  },
  badgeInspect: {
    borderColor: '#E0E7FF',
    backgroundColor: '#EEF2FF',
  },
  badgeNotice: {
    borderColor: Colors.borderSubtle,
    backgroundColor: '#FFFFFF',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
