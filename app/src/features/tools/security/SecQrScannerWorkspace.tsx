import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { useAppStore } from '../../../store/useAppStore';
import {
  getSecurityToolConfig,
  SecurityToolConfig,
} from './securityConfig';
import {
  parseQrPayload,
  analyzeUrlSafety,
} from './shared/SecurityHelpers';
import { SecurityResultCard, SecurityMetricItem } from './shared/SecurityResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const SecQrScannerWorkspace: React.FC<Props> = ({
  initialToolId = 352,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getSecurityToolConfig(activeToolId) || getSecurityToolConfig(352)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // Scanner payload input / simulation
  const [scannedData, setScannedData] = useState('');
  const [urlToCheck, setUrlToCheck] = useState('');

  // Scanner history list
  const [history, setHistory] = useState<string[]>([]);

  const parsed = useMemo(() => {
    return parseQrPayload(scannedData);
  }, [scannedData]);

  const urlReport = useMemo(() => {
    return analyzeUrlSafety(activeMode === 'url_safety' ? urlToCheck : scannedData);
  }, [activeMode, urlToCheck, scannedData]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Scanned Payload';
    let metrics: SecurityMetricItem[] = [];
    let note = '';

    if (activeMode === 'url_safety') {
      hero = urlReport.domain;
      heroLabel = `Safety Assessment: ${urlReport.status.toUpperCase()}`;
      metrics = [
        { label: 'Security Status', value: urlReport.status, highlight: true },
        { label: 'Protocol', value: urlReport.protocol.toUpperCase() },
        { label: 'Risk Score (0-100)', value: urlReport.riskScore },
        { label: 'Tracking Telemetry', value: urlReport.hasTrackingParams ? 'Detected' : 'None' },
      ];
      note = urlReport.findings.join(' ');
    } else {
      hero = parsed.displayTitle;
      heroLabel = parsed.type.toUpperCase();
      metrics = [
        { label: 'Data Type', value: parsed.type.toUpperCase(), highlight: true },
        { label: 'Characters', value: scannedData.length },
        {
          label: 'URL Phishing Risk',
          value: /^https?:\/\//i.test(scannedData) ? urlReport.status : 'N/A',
        },
      ];
      note = parsed.summary;
    }

    return { hero, heroLabel, metrics, note };
  }, [activeMode, parsed, urlReport, scannedData]);

  const scannerTools = [
    { id: 352, name: 'QR Scanner' },
    { id: 362, name: 'Barcode Scanner' },
    { id: 365, name: 'Scan History' },
    { id: 366, name: 'URL Safety' },
  ];

  return (
    <View style={styles.root}>
      <AppHeader
        title={config.title}
        subtitle="QR, Barcode & Security • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <AppIcon name="ShieldCheck" size={16} color="#0D9488" />
          <Text style={styles.bannerText}>
            Offline Scanner Engine • Zero camera feeds sent to cloud
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {scannerTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, activeToolId === t.id && styles.chipActive]}
              onPress={() => setActiveToolId(t.id)}
            >
              <Text style={[styles.chipText, activeToolId === t.id && styles.chipTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Viewfinder Simulator & Payload Input */}
        <View style={styles.inputCard}>
          <View style={styles.viewfinder}>
            <AppIcon name="Scan" size={48} color="#0D9488" />
            <Text style={styles.viewfinderText}>Offline Camera Lens / Image Decoder</Text>
            <View style={styles.simButtonsRow}>
              <TouchableOpacity
                style={styles.simBtn}
                onPress={() => {
                  const demo = 'https://docs.toolstrum.app/guide';
                  setScannedData(demo);
                  setHistory((prev) => [demo, ...prev]);
                }}
              >
                <Text style={styles.simBtnText}>Sample URL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.simBtn}
                onPress={() => {
                  const demo = 'WIFI:S:Guest_Network;T:WPA;P:Pass9876;;';
                  setScannedData(demo);
                  setHistory((prev) => [demo, ...prev]);
                }}
              >
                <Text style={styles.simBtnText}>Sample Wi-Fi</Text>
              </TouchableOpacity>
            </View>
          </View>

          {activeMode === 'url_safety' ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>URL to Inspect</Text>
              <TextInput
                style={styles.textInput}
                value={urlToCheck}
                onChangeText={setUrlToCheck}
                placeholder="https://example.com"
              />
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.inputLabel}>Decoded Payload</Text>
              <TextInput
                style={[styles.textInput, { height: 70 }]}
                value={scannedData}
                onChangeText={setScannedData}
                multiline
              />
            </View>
          )}
        </View>

        {activeMode === 'scan_history' && (
          <View style={styles.historyCard}>
            <Text style={styles.historyTitle}>Recent Scan History</Text>
            {history.length === 0 ? (
              <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                No recent scans in history. Use camera or paste payload above.
              </Text>
            ) : (
              history.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.historyItem}
                  onPress={() => setScannedData(item)}
                >
                  <AppIcon name="QrCode" size={16} color="#0D9488" />
                  <Text style={styles.historyText} numberOfLines={1}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        <SecurityResultCard
          title={config.title}
          subtitle={config.description}
          heroValue={calculation.hero}
          heroLabel={calculation.heroLabel}
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={activeMode === 'url_safety' ? urlToCheck : scannedData}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: Spacing.md,
  },
  bannerText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
  },
  chipsScroll: {
    marginBottom: Spacing.md,
  },
  chipsContent: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  chipTextActive: {
    color: Colors.onPrimary,
  },
  inputCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  viewfinder: {
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderStyle: 'dashed',
  },
  viewfinderText: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#0F766E',
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  simBtn: {
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  simBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  historyCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginTop: Spacing.md,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  historyText: {
    flex: 1,
    fontSize: 13,
    color: Colors.onSurface,
  },
});
