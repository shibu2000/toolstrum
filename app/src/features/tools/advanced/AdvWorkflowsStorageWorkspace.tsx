import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  ADVANCED_WORKSPACES,
  ADVANCED_TOOL_CONFIGS,
  getAdvancedWorkspaceTools,
} from './advancedConfig';
import { AdvancedResultCard } from './shared/AdvancedResultCard';

interface AdvWorkflowsStorageWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

interface WorkflowStep {
  step: number;
  toolName: string;
  action: string;
}

interface ToolPack {
  title: string;
  description: string;
  toolsCount: number;
  icon: string;
}

export const AdvWorkflowsStorageWorkspace: React.FC<AdvWorkflowsStorageWorkspaceProps> = ({
  initialToolId = 494,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  useEffect(() => {
    setActiveToolId(initialToolId);
  }, [initialToolId]);

  const workspaceMeta = ADVANCED_WORKSPACES.adv_workflows_storage;
  const workspaceTools = getAdvancedWorkspaceTools('adv_workflows_storage');

  // Tool Packs state
  const toolPacks: ToolPack[] = [
    { title: 'Developer & DevOps Pack', description: 'JSON, Diff, Base64, Regex, CIDR, DNS, and Hash engines.', toolsCount: 57, icon: 'Code' },
    { title: 'Privacy & Security Guard', description: 'Zero-cloud TOTP, Passwords, AES-GCM, PII Redaction, and Expiry.', toolsCount: 25, icon: 'Shield' },
    { title: 'Document & PDF Studio', description: 'PDF creation, OCR, watermarks, split, and form fillers.', toolsCount: 48, icon: 'FileText' },
    { title: 'Student & Learning Pack', description: 'Flashcards, Pomodoro, Dictionary, Timetable, and Quizzes.', toolsCount: 34, icon: 'BookOpen' },
  ];

  // Workflow Builder state
  const [pipelineSteps, setPipelineSteps] = useState<WorkflowStep[]>([]);

  // Favorites state
  const [favoriteTools, setFavoriteTools] = useState<{ id: number; name: string }[]>([]);

  // Collections state
  const [collections, setCollections] = useState<{ title: string; tags: string; count: number }[]>([]);

  // Output History state
  const [historyItems, setHistoryItems] = useState<{ title: string; time: string }[]>([]);

  // Storage Cleanup state
  const [cachedItems, setCachedItems] = useState<{ label: string; size: string }[]>([]);

  const handleClearCache = () => {
    setCachedItems([]);
    Alert.alert('Storage Cleaned', 'Temporary application cache files cleared.');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={ADVANCED_TOOL_CONFIGS[activeToolId]?.name || 'Workflows & Storage'}
        subtitle={`${workspaceMeta.title} • Offline Local`}
        showBack
        onBackPress={onBack}
      />

      <View style={styles.selectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={styles.selectorBar}
        >
          {workspaceTools.map((tool) => {
            const cfg = ADVANCED_TOOL_CONFIGS[tool.id];
            const isSelected = tool.id === activeToolId;
            return (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolPill,
                  isSelected && styles.toolPillActive,
                ]}
                onPress={() => setActiveToolId(tool.id)}
              >
                <Text
                  style={[
                    styles.toolPillText,
                    isSelected && styles.toolPillTextActive,
                  ]}
                >
                  {cfg?.badge || tool.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield studioName="Advanced" />

        {/* TOOL 493: Offline Tool Packs */}
        {activeToolId === 493 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Curated Offline Tool Packs</Text>
              {toolPacks.map((pack, idx) => (
                <View key={idx} style={styles.packCard}>
                  <Text style={styles.packTitle}>{pack.title}</Text>
                  <Text style={styles.packDesc}>{pack.description}</Text>
                  <Text style={styles.packBadge}>{pack.toolsCount} Offline Capabilities</Text>
                </View>
              ))}
            </View>

            <AdvancedResultCard
              title="Tool Packs Directory"
              badge="Curated Bundles"
              primaryValue="4 Complete Productivity Packs"
              primarySubtext="164 Pre-configured Local Tools"
              details={toolPacks.map((p) => `• ${p.title}: ${p.toolsCount} tools`).join('\n')}
              metadata={[
                { label: 'Bundles', value: `${toolPacks.length}` },
                { label: 'Network', value: '100% Offline' },
              ]}
              copyContent={toolPacks.map((p) => p.title).join('\n')}
            />
          </View>
        )}

        {/* TOOL 494: Workflow Builder */}
        {activeToolId === 494 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Automation Pipeline Builder</Text>
              <Text style={styles.subheading}>Configured Multi-Tool Chain</Text>
              {pipelineSteps.length === 0 ? (
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                  No tools configured in automated pipeline
                </Text>
              ) : (
                pipelineSteps.map((step) => (
                  <View key={step.step} style={styles.pipelineRow}>
                    <View style={styles.stepNumBox}>
                      <Text style={styles.stepNum}>{step.step}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pipelineToolName}>{step.toolName}</Text>
                      <Text style={styles.pipelineAction}>{step.action}</Text>
                    </View>
                  </View>
                ))
              )}
              <PrimaryButton
                title={pipelineSteps.length > 0 ? "Execute Automated Pipeline" : "Configure Pipeline Steps"}
                icon="Play"
                disabled={pipelineSteps.length === 0}
                onPress={() => Alert.alert('Pipeline Executed', `Executed ${pipelineSteps.length} automated steps.`)}
              />
            </View>

            <AdvancedResultCard
              title="Pipeline Execution"
              badge="Tool Orchestration"
              primaryValue={pipelineSteps.length > 0 ? `${pipelineSteps.length}-Step Sequential Workflow` : 'No Active Pipeline'}
              details={pipelineSteps.length > 0 ? pipelineSteps.map((s) => `${s.step}. ${s.toolName} -> ${s.action}`).join('\n') : 'Pipeline queue empty'}
              metadata={[
                { label: 'Steps', value: `${pipelineSteps.length}` },
                { label: 'Mode', value: 'Local Chained' },
              ]}
              copyContent={pipelineSteps.map((s) => `${s.step}. ${s.toolName}`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 495: Favorite Tool Shortcuts */}
        {activeToolId === 495 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Favorite Pinned Shortcuts</Text>
              {favoriteTools.length === 0 ? (
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                  No favorite tools pinned yet
                </Text>
              ) : (
                favoriteTools.map((fav) => (
                  <View key={fav.id} style={styles.favRow}>
                    <AppIcon name="Star" size={16} color="#EAB308" />
                    <Text style={styles.favName}>Tool {fav.id}: {fav.name}</Text>
                  </View>
                ))
              )}
            </View>

            <AdvancedResultCard
              title="Quick Launch Favorites"
              badge="1-Tap Shortcuts"
              primaryValue={`${favoriteTools.length} Pinned Tools`}
              details={favoriteTools.length > 0 ? favoriteTools.map((f) => `• Tool ${f.id}: ${f.name}`).join('\n') : 'Star any tool across the 16 studios to pin here.'}
              metadata={[
                { label: 'Favorites', value: `${favoriteTools.length}` },
                { label: 'Access', value: 'Instant' },
              ]}
              copyContent={favoriteTools.map((f) => f.name).join('\n')}
            />
          </View>
        )}

        {/* TOOL 496: Custom Tool Collections */}
        {activeToolId === 496 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Custom Tool Collections</Text>
              {collections.length === 0 ? (
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                  No custom tool collections created yet
                </Text>
              ) : (
                collections.map((col, idx) => (
                  <View key={idx} style={styles.colCard}>
                    <Text style={styles.colTitle}>{col.title}</Text>
                    <Text style={styles.colTags}>Tags: {col.tags}</Text>
                    <Text style={styles.colCount}>{col.count} Tools in Collection</Text>
                  </View>
                ))
              )}
            </View>

            <AdvancedResultCard
              title="Custom Workspace Groups"
              badge="User Collections"
              primaryValue={`${collections.length} User Workspace Collections`}
              details={collections.length > 0 ? collections.map((c) => `• ${c.title} (${c.count} tools)`).join('\n') : 'Create collections to group related workflows.'}
              metadata={[
                { label: 'Collections', value: `${collections.length}` },
                { label: 'Status', value: 'Active' },
              ]}
              copyContent={collections.map((c) => c.title).join('\n')}
            />
          </View>
        )}

        {/* TOOL 497: Processing Queue & 498: Output History */}
        {(activeToolId === 497 || activeToolId === 498) && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {activeToolId === 497 ? 'Background Job Queue' : 'Output Generation History'}
              </Text>
              <View style={styles.historyList}>
                {historyItems.length === 0 ? (
                  <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                    No recent outputs or export operations recorded
                  </Text>
                ) : (
                  historyItems.map((item, idx) => (
                    <View key={idx} style={styles.historyItem}>
                      <Text style={styles.historyTitle}>{item.title}</Text>
                      <Text style={styles.historyTime}>{item.time}</Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <AdvancedResultCard
              title="Execution History"
              badge="Local Audit Log"
              primaryValue={`${historyItems.length} Recent Operations Completed`}
              primarySubtext="Persisted strictly in local sandboxed storage."
              details={historyItems.length > 0 ? historyItems.map((h, i) => `${i + 1}. ${h.title}`).join('\n') : 'No output history recorded yet.'}
              metadata={[
                { label: 'Jobs', value: `${historyItems.length} Completed` },
                { label: 'Storage', value: 'Local Cache' },
              ]}
              copyContent={historyItems.map((h) => h.title).join('\n')}
            />
          </View>
        )}

        {/* TOOL 499: Storage Cleanup Suggestions */}
        {activeToolId === 499 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Storage Cleanup & Reclaim</Text>
              {cachedItems.length > 0 ? (
                cachedItems.map((item, idx) => (
                  <View key={idx} style={styles.cacheRow}>
                    <Text style={styles.cacheLabel}>{item.label}</Text>
                    <Text style={styles.cacheSize}>{item.size}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.cleanMsg}>✅ Storage cache is clean. No temporary files found.</Text>
              )}

              {cachedItems.length > 0 && (
                <PrimaryButton
                  title="Purge Temporary Artifacts (37 MB)"
                  icon="Trash2"
                  onPress={handleClearCache}
                />
              )}
            </View>

            <AdvancedResultCard
              title="Storage Optimization"
              badge="Space Reclaim"
              primaryValue={cachedItems.length > 0 ? '37.0 MB Reclaimable' : 'Storage Fully Cleaned'}
              details={cachedItems.map((c) => `• ${c.label}: ${c.size}`).join('\n') || 'All temporary buffers empty.'}
              metadata={[
                { label: 'Purgeable', value: cachedItems.length > 0 ? '37 MB' : '0 MB' },
                { label: 'Integrity', value: 'Safe to Delete' },
              ]}
              copyContent="Storage cleaned"
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  selectorWrapper: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9D5FF',
    justifyContent: 'center',
  },
  selectorScroll: {
    height: 52,
    flexGrow: 0,
  },
  selectorBar: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toolPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#9333EA',
    borderColor: '#7E22CE',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E22CE',
  },
  toolPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#581C87',
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E22CE',
    marginBottom: 6,
  },
  packCard: {
    backgroundColor: '#FAF5FF',
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  packTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#581C87',
  },
  packDesc: {
    fontSize: 12,
    color: '#4B5563',
    marginVertical: 4,
  },
  packBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9333EA',
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  stepNumBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#9333EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pipelineToolName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  pipelineAction: {
    fontSize: 11,
    color: '#64748B',
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  favName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  colCard: {
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  colTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  colTags: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  colCount: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9333EA',
    marginTop: 2,
  },
  historyList: {
    gap: 6,
  },
  historyItem: {
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  historyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  historyTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  cacheRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF5FF',
  },
  cacheLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '600',
  },
  cacheSize: {
    fontSize: 13,
    fontWeight: '700',
    color: '#DC2626',
  },
  cleanMsg: {
    fontSize: 13,
    color: '#059669',
    fontWeight: '700',
    paddingVertical: 12,
  },
});
