import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

export interface SecurityMetricItem {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export interface SecurityResultCardProps {
  title: string;
  heroValue: string;
  heroLabel?: string;
  subtitle?: string;
  badgeText?: string;
  metrics?: SecurityMetricItem[];
  breakdownText?: string;
  contentToCopy?: string;
  fileName?: string;
  onSaveToManagedFiles?: () => void;
  saved?: boolean;
  qrMatrix?: boolean[][];
}

export const SecurityResultCard: React.FC<SecurityResultCardProps> = ({
  title,
  heroValue,
  heroLabel = 'Result Payload',
  subtitle,
  badgeText = 'Protected Local Processing',
  metrics = [],
  breakdownText,
  contentToCopy,
  fileName = 'security-output.txt',
  onSaveToManagedFiles,
  saved = false,
  qrMatrix,
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
      const uri = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(uri, textToCopy, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('Error', 'Unable to share result.');
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeSuccess}>
          <AppIcon name="ShieldCheck" size={14} color="#0D9488" />
          <Text style={styles.badgeSuccessText}>{badgeText}</Text>
        </View>
        <Text style={styles.titleText}>{title}</Text>
        {subtitle ? <Text style={styles.subtitleText}>{subtitle}</Text> : null}
      </View>

      {/* Visual QR Matrix Rendering if provided */}
      {qrMatrix && qrMatrix.length > 0 && (
        <View style={styles.qrContainer}>
          <View style={styles.qrBox}>
            {qrMatrix.map((row, rIdx) => (
              <View key={rIdx} style={styles.qrRow}>
                {row.map((cell, cIdx) => (
                  <View
                    key={cIdx}
                    style={[
                      styles.qrCell,
                      { backgroundColor: cell ? '#0F172A' : '#FFFFFF' },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Hero Display Box */}
      <View style={styles.heroBox}>
        <Text style={styles.heroLabel}>{heroLabel.toUpperCase()}</Text>
        <Text style={styles.heroValue} numberOfLines={3} adjustsFontSizeToFit>
          {heroValue}
        </Text>
      </View>

      {/* Metrics Breakdown Grid */}
      {metrics.length > 0 && (
        <View style={styles.metricsGrid}>
          {metrics.map((m, idx) => (
            <View
              key={idx}
              style={[
                styles.metricItem,
                m.highlight && styles.metricItemHighlight,
              ]}
            >
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Text
                style={[
                  styles.metricValue,
                  m.highlight && styles.metricValueHighlight,
                ]}
              >
                {m.value}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Optional Explanatory Breakdown Note */}
      {breakdownText ? (
        <View style={styles.noteBox}>
          <AppIcon name="Info" size={15} color="#0D9488" />
          <Text style={styles.noteText}>{breakdownText}</Text>
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.btnAction, styles.btnCopy]}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <AppIcon
            name={copied ? 'Check' : 'Copy'}
            size={16}
            color={Colors.onSurface}
          />
          <Text style={styles.btnActionText}>{copied ? 'Copied' : 'Copy'}</Text>
        </TouchableOpacity>

        {onSaveToManagedFiles && (
          <TouchableOpacity
            style={[styles.btnAction, styles.btnSave, saved && styles.btnSaved]}
            onPress={onSaveToManagedFiles}
            activeOpacity={0.7}
          >
            <AppIcon
              name={saved ? 'Check' : 'Bookmark'}
              size={16}
              color={Colors.onSurface}
            />
            <Text style={styles.btnActionText}>{saved ? 'Saved' : 'Save'}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.btnAction, styles.btnShare]}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <AppIcon name="Share2" size={16} color={Colors.onPrimary} />
          <Text style={styles.btnShareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: Spacing.md,
    marginTop: Spacing.md,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    marginBottom: Spacing.sm,
  },
  badgeSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeSuccessText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F766E',
  },
  titleText: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subtitleText: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 2,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  qrRow: {
    flexDirection: 'row',
  },
  qrCell: {
    width: 6,
    height: 6,
  },
  heroBox: {
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F766E',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  heroValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.onSurface,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  metricItem: {
    flex: 1,
    minWidth: '46%',
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.sm,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  metricItemHighlight: {
    backgroundColor: '#CCFBF1',
    borderColor: '#99F6E4',
  },
  metricLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  metricValueHighlight: {
    color: '#0F766E',
  },
  noteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.sm,
    padding: 10,
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    color: '#115E59',
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
  },
  btnAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  btnCopy: {
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  btnSave: {
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  btnSaved: {
    backgroundColor: '#DCFCE7',
    borderColor: '#86EFAC',
  },
  btnShare: {
    backgroundColor: '#0D9488',
  },
  btnActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  btnShareText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onPrimary,
  },
});
