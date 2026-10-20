import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ToolStatus } from '../../data/types';
import { Colors, Radius } from '../../design-system/tokens';

interface StatusBadgeProps {
  status: ToolStatus;
  offlineCapable?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, offlineCapable = true }) => {
  if (status === 'coming_soon') {
    return (
      <View style={[styles.badge, styles.comingSoonBadge]}>
        <Text style={[styles.text, styles.comingSoonText]}>Coming in v2.0</Text>
      </View>
    );
  }

  if (status === 'requires_network' || !offlineCapable) {
    return (
      <View style={[styles.badge, styles.networkBadge]}>
        <Text style={[styles.text, styles.networkText]}>Internet Req.</Text>
      </View>
    );
  }

  if (status === 'requires_resource_download') {
    return (
      <View style={[styles.badge, styles.downloadBadge]}>
        <Text style={[styles.text, styles.downloadText]}>Download</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.offlineBadge]}>
      <Text style={[styles.text, styles.offlineText]}>Offline</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
  },
  offlineBadge: {
    backgroundColor: '#DCFCE7',
  },
  offlineText: {
    color: '#15803D',
  },
  comingSoonBadge: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  comingSoonText: {
    color: '#64748B',
  },
  networkBadge: {
    backgroundColor: '#CCFBF1',
  },
  networkText: {
    color: '#0F766E',
  },
  downloadBadge: {
    backgroundColor: '#FEF3C7',
  },
  downloadText: {
    color: '#B45309',
  },
});
