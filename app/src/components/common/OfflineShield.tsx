import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';

interface OfflineShieldProps {
  isOffline?: boolean;
  studioName?: string;
}

export const OfflineShield: React.FC<OfflineShieldProps> = ({ isOffline = true, studioName }) => {
  if (!isOffline) {
    return (
      <View style={[styles.container, styles.onlineContainer]}>
        <AppIcon name="Globe" size={16} color={Colors.accentTeal} />
        <Text style={[styles.text, styles.onlineText]}>
          Network Request · No Data Stored Remotely
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppIcon name="ShieldCheck" size={16} color={Colors.statusSuccess} />
      <Text style={styles.boldText}>
        {studioName ? `${studioName} Sandbox` : 'Local Sandbox Active'}
      </Text>
      <View style={styles.dot} />
      <Text style={styles.text}>Zero cloud upload · 100% private</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: 6,
  },
  onlineContainer: {
    backgroundColor: '#F0FDFA',
    borderColor: '#CCFBF1',
  },
  boldText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.statusSuccess,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.outlineVariant,
  },
  text: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  onlineText: {
    color: Colors.accentTeal,
    fontWeight: '600',
  },
});
