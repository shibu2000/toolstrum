/**
 * ScannerManagerWorkspace.tsx
 * Workspace 5: Scanner Organization & History
 * Consolidates tools:
 * 100: Scan History
 * 101: Document Naming Assistant
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Colors, Radius, Spacing } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { ScannerResultCard, ScannerResultData } from './shared/ScannerResultCard';
import { generateDocumentName } from './shared/ScannerEngine';
import { getScannerToolConfig, getScannerToolsByWorkspace, ScannerToolConfig } from './scannerConfig';

interface ScannerManagerWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

export const ScannerManagerWorkspace: React.FC<ScannerManagerWorkspaceProps> = ({
  initialToolId = 100,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const [docType, setDocType] = useState<'invoice' | 'receipt' | 'contract' | 'id_card' | 'report'>('invoice');
  const [vendorName, setVendorName] = useState<string>('');
  const [generatedName, setGeneratedName] = useState<string>('');
  const [result, setResult] = useState<ScannerResultData | null>(null);

  const { isFavorite, toggleFavorite, managedFiles, removeManagedFile } = useAppStore();
  const favorited = isFavorite(activeToolId);

  const currentToolConfig: ScannerToolConfig =
    getScannerToolConfig(activeToolId) || (getScannerToolConfig(100) as ScannerToolConfig);
  const workspaceTools = getScannerToolsByWorkspace('scanner_manager');

  // Filter scans from managed files
  const scannedFiles = managedFiles.filter(
    (f) =>
      (f.toolId !== undefined && f.toolId >= 86 && f.toolId <= 103) ||
      f.name.toLowerCase().includes('scan') ||
      f.name.toLowerCase().includes('doc')
  );

  const handleGenerateName = async () => {
    const vendor = vendorName.trim() || 'Document';
    const formatted = `${generateDocumentName(docType, vendor)}.pdf`;
    setGeneratedName(formatted);

    await Clipboard.setStringAsync(formatted);

    setResult({
      title: 'Standardized File Name Created',
      metricLabel: 'Generated Name',
      metricValue: formatted,
      copiedText: formatted,
      details: [
        { label: 'Document Type', value: docType.toUpperCase() },
        { label: 'Vendor / Tag', value: vendorName },
        { label: 'Date Stamp', value: 'ISO 8601 YYYY-MM-DD' },
        { label: 'Clipboard', value: 'Copied to clipboard automatically' },
      ],
      toolId: 101,
      toolName: 'Document Naming Assistant',
    });
  };

  const handleShareFile = async (uri: string) => {
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Could not share file.');
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={currentToolConfig.name}
        subtitle="Document Scanner · Organization & History"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(activeToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Workspace Mode Switcher */}
        <View style={styles.workspaceTabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {workspaceTools.map((t) => {
              const active = t.id === activeToolId;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveToolId(t.id);
                    setResult(null);
                  }}
                >
                  <AppIcon
                    name={t.iconName}
                    size={14}
                    color={active ? '#FFFFFF' : Colors.textMuted}
                  />
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Info Card */}
        <View style={styles.descCard}>
          <View style={styles.descIconCircle}>
            <AppIcon name={currentToolConfig.iconName} size={18} color={Colors.accentCyan} />
          </View>
          <View style={styles.descTextGroup}>
            <Text style={styles.descTitle}>{currentToolConfig.name}</Text>
            <Text style={styles.descText}>{currentToolConfig.description}</Text>
          </View>
        </View>

        {/* Tool 100: Scan History List */}
        {activeToolId === 100 && (
          <View style={styles.controlsCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.controlHeader}>Saved Document Scans</Text>
              <Text style={styles.historyCount}>{scannedFiles.length} file(s)</Text>
            </View>

            {scannedFiles.length === 0 ? (
              <View style={styles.emptyBox}>
                <AppIcon name="FolderOpen" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyTitle}>No Scans in Sandbox Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Documents you scan and save in Document Scanner will be listed here.
                </Text>
              </View>
            ) : (
              <View style={styles.filesList}>
                {scannedFiles.map((f) => (
                  <View key={f.id} style={styles.fileRow}>
                    <View style={styles.fileIconBox}>
                      <AppIcon name="FileText" size={18} color={Colors.accentCyan} />
                    </View>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileName} numberOfLines={1}>
                        {f.name}
                      </Text>
                      <Text style={styles.fileMeta}>
                        {(f.size / 1024).toFixed(1)} KB · {new Date(f.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleShareFile(f.uri)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <AppIcon name="Share2" size={16} color={Colors.accentCyan} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => removeManagedFile(f.id)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <AppIcon name="Trash2" size={16} color={Colors.statusError} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Tool 101: Document Naming Assistant */}
        {activeToolId === 101 && (
          <View style={styles.controlsCard}>
            <Text style={styles.controlHeader}>Standard Document Type</Text>
            <View style={styles.presetsRow}>
              {(['invoice', 'receipt', 'contract', 'id_card', 'report'] as const).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.presetPill, docType === type && styles.presetPillActive]}
                  onPress={() => setDocType(type)}
                >
                  <Text style={[styles.presetText, docType === type && styles.presetTextActive]}>
                    {type.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.controlHeader, { marginTop: 10 }]}>Vendor / Department Tag</Text>
            <TextInput
              style={styles.textInput}
              value={vendorName}
              onChangeText={setVendorName}
              placeholder="e.g. AcmeCorp, HealthIns, DeptAdmin"
            />

            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                title="Generate Standardized Name"
                onPress={handleGenerateName}
                variant="primary"
                color={Colors.accentCyan}
              />
            </View>
          </View>
        )}

        {/* Result Output Card */}
        {result && (
          <ScannerResultCard
            result={result}
            onReset={() => {
              setResult(null);
            }}
          />
        )}

        {/* Security / Offline Shield */}
        <OfflineShield studioName="Document Scanner" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 40,
  },
  workspaceTabBar: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  tabScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
  },
  tabButtonActive: {
    backgroundColor: Colors.accentCyan,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  descCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    backgroundColor: Colors.surfaceScanner,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#A5F3FC',
  },
  descIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descTextGroup: {
    flex: 1,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  descText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  controlsCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  controlHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyCount: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: 'center',
    maxWidth: 240,
  },
  filesList: {
    gap: 6,
    marginTop: 4,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  fileIconBox: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceScanner,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  fileMeta: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 1,
  },
  actionIconBtn: {
    padding: 6,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  presetPillActive: {
    backgroundColor: Colors.surfaceScanner,
    borderColor: Colors.accentCyan,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  presetTextActive: {
    color: '#0891B2',
    fontWeight: '700',
  },
  textInput: {
    height: 42,
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Colors.onSurface,
  },
});
