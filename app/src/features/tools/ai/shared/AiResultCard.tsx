import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

export interface AiMetricItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface AiResultCardProps {
  title: string;
  heroValue: string;
  heroLabel?: string;
  subtitle?: string;
  badgeText?: string;
  metrics?: AiMetricItem[];
  breakdownText?: string;
  contentToCopy?: string;
  fileName?: string;
}

export const AiResultCard: React.FC<AiResultCardProps> = ({
  title,
  heroValue,
  heroLabel = 'AI Output',
  subtitle,
  badgeText = '100% Offline AI Engine',
  metrics = [],
  breakdownText,
  contentToCopy,
  fileName = 'ai-output.txt',
}) => {
  const [copied, setCopied] = useState(false);

  const textToCopy = contentToCopy || heroValue;

  const handleCopy = async () => {
    if (!textToCopy) return;
    await Clipboard.setStringAsync(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Share', 'System sharing not available.');
        return;
      }
      const uri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(uri, textToCopy);
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Notice', 'Unable to initiate sharing in this environment.');
    }
  };

  return (
    <View style={styles.card}>
      {/* Header Badge & Title */}
      <View style={styles.headerRow}>
        <View style={styles.badge}>
          <AppIcon name="Sparkles" size={14} color="#7C3AED" />
          <Text style={styles.badgeText}>{badgeText}</Text>
        </View>
        <Text style={styles.timestamp}>On-Device NLP</Text>
      </View>

      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {/* Hero Output Box */}
      <View style={styles.heroBox}>
        {heroLabel ? <Text style={styles.heroLabel}>{heroLabel}</Text> : null}
        <Text style={styles.heroValue} numberOfLines={6} selectable>
          {heroValue || '—'}
        </Text>
      </View>

      {/* Metrics Grid */}
      {metrics.length > 0 && (
        <View style={styles.metricsGrid}>
          {metrics.map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.metricCard,
                item.highlight && styles.metricCardHighlight,
              ]}
            >
              <Text style={styles.metricLabel}>{item.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  item.highlight && styles.metricValueHighlight,
                ]}
              >
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Breakdown / Insights Note */}
      {breakdownText ? (
        <View style={styles.breakdownBox}>
          <AppIcon name="Info" size={14} color="#7C3AED" />
          <Text style={styles.breakdownText}>{breakdownText}</Text>
        </View>
      ) : null}

      {/* Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={[styles.btn, copied ? styles.btnCopied : styles.btnPrimary]}
          onPress={handleCopy}
        >
          <AppIcon
            name={copied ? 'Check' : 'Copy'}
            size={16}
            color={copied ? '#15803D' : '#FFFFFF'}
          />
          <Text style={[styles.btnText, copied && styles.btnTextCopied]}>
            {copied ? 'Copied' : 'Copy AI Output'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={handleShare}>
          <AppIcon name="Share2" size={16} color="#7C3AED" />
          <Text style={styles.btnTextSecondary}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F5F3FF',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  timestamp: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 12,
  },
  heroBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  heroValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4C1D95',
    lineHeight: 22,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  metricCard: {
    flexGrow: 1,
    flexBasis: '45%',
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  metricCardHighlight: {
    backgroundColor: '#FAF5FF',
    borderColor: '#E9D5FF',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricValueHighlight: {
    color: '#7C3AED',
  },
  breakdownBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    padding: 10,
    marginBottom: 12,
  },
  breakdownText: {
    flex: 1,
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  btnPrimary: {
    backgroundColor: '#7C3AED',
  },
  btnCopied: {
    backgroundColor: '#DCFCE7',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnTextCopied: {
    color: '#15803D',
  },
  btnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  btnTextSecondary: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
