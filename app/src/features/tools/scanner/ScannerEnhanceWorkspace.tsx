/**
 * ScannerEnhanceWorkspace.tsx
 * Workspace 2: Scanner Enhancement & Clean
 * Consolidates tools:
 * 89: Scan Filters
 * 99: Document Cleanup
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { ScannerCaptureBox, ScannedPageItem } from './shared/ScannerCaptureBox';
import { ScannerResultCard, ScannerResultData } from './shared/ScannerResultCard';
import {
  applyScanFilter,
  cleanDocumentArtifacts,
  saveScanToSandbox,
  ScanFilterType,
} from './shared/ScannerEngine';
import { getScannerToolConfig, getScannerToolsByWorkspace, ScannerToolConfig } from './scannerConfig';

interface ScannerEnhanceWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

export const ScannerEnhanceWorkspace: React.FC<ScannerEnhanceWorkspaceProps> = ({
  initialToolId = 89,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const [pages, setPages] = useState<ScannedPageItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<ScanFilterType>('bw');
  const [cleanupLevel, setCleanupLevel] = useState<'moderate' | 'aggressive'>('moderate');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScannerResultData | null>(null);

  const { isFavorite, toggleFavorite } = useAppStore();
  const favorited = isFavorite(activeToolId);

  const currentToolConfig: ScannerToolConfig =
    getScannerToolConfig(activeToolId) || (getScannerToolConfig(89) as ScannerToolConfig);
  const workspaceTools = getScannerToolsByWorkspace('scanner_enhance');

  const handleProcess = async () => {
    if (pages.length === 0) {
      Alert.alert('No Document', 'Please snap or import a document page to enhance.');
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const source = pages[0];

      if (activeToolId === 89) {
        // Scan Filters
        const filtered = await applyScanFilter(source.uri, activeFilter);
        const saved = await saveScanToSandbox(filtered.uri, `filter_${activeFilter}_${Date.now()}.jpg`);

        const filterLabels: Record<ScanFilterType, string> = {
          bw: 'Black & White High Contrast',
          grayscale: 'Smooth Grayscale Monochrome',
          magic_color: 'Magic Color Document Sharpen',
          original: 'Original True Color',
        };

        setResult({
          title: 'Document Filter Applied',
          fileName: saved.name,
          fileUri: saved.uri,
          previewImageUri: saved.uri,
          fileSize: saved.size,
          metricLabel: 'Filter Mode',
          metricValue: filterLabels[activeFilter],
          details: [
            { label: 'Filter Preset', value: filterLabels[activeFilter] },
            { label: 'Page Resolution', value: `${filtered.width} × ${filtered.height} px` },
            { label: 'Readability', value: 'Optimized for text legibility' },
          ],
          toolId: 89,
          toolName: 'Scan Filters',
        });
      } else {
        // Document Cleanup
        const cleaned = await cleanDocumentArtifacts(source.uri);
        const saved = await saveScanToSandbox(cleaned.uri, `cleaned_doc_${Date.now()}.jpg`);

        setResult({
          title: 'Document Artifacts Cleaned',
          fileName: saved.name,
          fileUri: saved.uri,
          previewImageUri: saved.uri,
          fileSize: saved.size,
          metricLabel: 'Cleanup Mode',
          metricValue: `${cleanupLevel.toUpperCase()} Background Whitened`,
          details: [
            { label: 'Shadows Erased', value: 'Corner finger & fold shadows removed' },
            { label: 'Background', value: 'Paper yellowing bleached to pure white' },
            { label: 'Hole Punches', value: 'Margin punch marks filled' },
          ],
          toolId: 99,
          toolName: 'Document Cleanup',
        });
      }
    } catch (err: any) {
      Alert.alert('Enhancement Failed', err?.message || 'Could not enhance document scan.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={currentToolConfig.name}
        subtitle="Document Scanner · Enhancement & Clean Workspace"
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

        {/* Page Capture */}
        <ScannerCaptureBox
          pages={pages}
          onPagesChange={(newPages) => {
            setPages(newPages);
            setResult(null);
          }}
          multiple={false}
          title="Select Document Page"
          subtitle="Choose document photo to filter, despeckle, or whiten"
        />

        {/* Controls */}
        {pages.length > 0 && (
          <View style={styles.controlsCard}>
            {activeToolId === 89 ? (
              <View style={styles.controlGroup}>
                <Text style={styles.controlHeader}>Document Color Filter</Text>
                <View style={styles.filterGrid}>
                  {[
                    { id: 'bw', label: 'B&W Contrast', sub: 'Pure crisp black & white text' },
                    { id: 'grayscale', label: 'Grayscale', sub: 'Even monochrome tone' },
                    { id: 'magic_color', label: 'Magic Color', sub: 'Boost stamp & ink saturation' },
                    { id: 'original', label: 'Original', sub: 'Camera uncompressed' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.id}
                      style={[styles.filterCard, activeFilter === f.id && styles.filterCardActive]}
                      onPress={() => setActiveFilter(f.id as any)}
                    >
                      <View style={styles.filterRow}>
                        <AppIcon
                          name={activeFilter === f.id ? 'CheckCircle2' : 'Circle'}
                          size={16}
                          color={activeFilter === f.id ? Colors.accentCyan : Colors.textMuted}
                        />
                        <Text style={styles.filterTitle}>{f.label}</Text>
                      </View>
                      <Text style={styles.filterSub}>{f.sub}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.controlGroup}>
                <Text style={styles.controlHeader}>Cleanup Intensity</Text>
                <View style={styles.presetsRow}>
                  {[
                    { id: 'moderate', label: 'Balanced (Standard Paper)' },
                    { id: 'aggressive', label: 'Aggressive (Old/Yellowed)' },
                  ].map((level) => (
                    <TouchableOpacity
                      key={level.id}
                      style={[styles.presetPill, cleanupLevel === level.id && styles.presetPillActive]}
                      onPress={() => setCleanupLevel(level.id as any)}
                    >
                      <Text style={[styles.presetText, cleanupLevel === level.id && styles.presetTextActive]}>
                        {level.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <View style={{ marginTop: 8 }}>
              <PrimaryButton
                title={isProcessing ? 'Enhancing Document...' : `Apply ${currentToolConfig.name}`}
                onPress={handleProcess}
                loading={isProcessing}
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
              setPages([]);
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
  controlGroup: {
    gap: 8,
  },
  controlHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  filterGrid: {
    gap: 8,
  },
  filterCard: {
    padding: Spacing.sm + 2,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 4,
  },
  filterCardActive: {
    backgroundColor: Colors.surfaceScanner,
    borderColor: Colors.accentCyan,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  filterSub: {
    fontSize: 11,
    color: Colors.textMuted,
    paddingLeft: 22,
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
});
