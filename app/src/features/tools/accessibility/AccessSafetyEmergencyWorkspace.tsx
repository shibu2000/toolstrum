import React, { useState } from 'react';
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
  ACCESSIBILITY_WORKSPACES,
  ACCESSIBILITY_TOOL_CONFIGS,
  getAccessibilityWorkspaceTools,
} from './accessibilityConfig';
import { AccessibilityResultCard } from './shared/AccessibilityResultCard';
import {
  PERMISSION_AUDIT_GUIDE,
  OFFLINE_FIRST_AID_GUIDES,
  formatIceCardPayload,
  IceCardData,
} from './shared/AccessibilityHelpers';

interface AccessSafetyEmergencyWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const AccessSafetyEmergencyWorkspace: React.FC<AccessSafetyEmergencyWorkspaceProps> = ({
  initialToolId = 470,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = ACCESSIBILITY_WORKSPACES.access_safety_emergency;
  const workspaceTools = getAccessibilityWorkspaceTools('access_safety_emergency');

  // Permission filter state
  const [selectedPermFilter, setSelectedPermFilter] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');

  // First Aid guide state
  const [selectedGuideIdx, setSelectedGuideIdx] = useState(0);

  // ICE Emergency Card state
  const [iceCard, setIceCard] = useState<IceCardData>({
    fullName: '',
    bloodType: '',
    allergies: '',
    medicalConditions: '',
    medications: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelation: '',
  });

  const filteredPermissions = PERMISSION_AUDIT_GUIDE.filter((p) =>
    selectedPermFilter === 'All' ? true : p.riskRating === selectedPermFilter
  );

  const activeGuide = OFFLINE_FIRST_AID_GUIDES[selectedGuideIdx];
  const formattedIceText = formatIceCardPayload(iceCard);

  return (
    <View style={styles.container}>
      <AppHeader
        title={ACCESSIBILITY_TOOL_CONFIGS[activeToolId]?.name || 'Safety & Emergency'}
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
            const cfg = ACCESSIBILITY_TOOL_CONFIGS[tool.id];
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
        <OfflineShield studioName="Accessibility" />

        {/* TOOL 468: App Permission Guide */}
        {activeToolId === 468 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Privacy & Permission Risk Audit</Text>
              <View style={styles.filterRow}>
                {(['All', 'High', 'Medium', 'Low'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.filterPill,
                      selectedPermFilter === lvl && styles.filterPillActive,
                    ]}
                    onPress={() => setSelectedPermFilter(lvl)}
                  >
                    <Text
                      style={[
                        styles.filterPillText,
                        selectedPermFilter === lvl && styles.filterPillTextActive,
                      ]}
                    >
                      {lvl} Risk
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.permList}>
                {filteredPermissions.map((item, idx) => (
                  <View key={idx} style={styles.permRow}>
                    <View style={styles.permHeader}>
                      <Text style={styles.permName}>{item.permission}</Text>
                      <View
                        style={[
                          styles.riskBadge,
                          item.riskRating === 'High' && styles.riskHigh,
                          item.riskRating === 'Medium' && styles.riskMedium,
                        ]}
                      >
                        <Text style={styles.riskBadgeText}>{item.riskRating} Risk</Text>
                      </View>
                    </View>
                    <Text style={styles.permDesc}>{item.usagePurpose}</Text>
                    <Text style={styles.permRec}>💡 {item.privacyRecommendation}</Text>
                  </View>
                ))}
              </View>
            </View>

            <AccessibilityResultCard
              title="Privacy Audit Analysis"
              badge="Security Sandbox"
              primaryValue="Zero Elevated Permissions Required by Toolstrum"
              primarySubtext="100% Offline execution with no cloud servers."
              details={filteredPermissions
                .map((p) => `• [${p.riskRating}] ${p.permission}: ${p.usagePurpose}`)
                .join('\n')}
              metadata={[
                { label: 'Audited Items', value: `${PERMISSION_AUDIT_GUIDE.length}` },
                { label: 'Network Perm', value: 'Not Required' },
              ]}
              copyContent={filteredPermissions.map((p) => `${p.permission}: ${p.riskRating}`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 469: Offline Reference Library */}
        {activeToolId === 469 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Offline Emergency First-Aid Protocols</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: Spacing.md }}>
                {OFFLINE_FIRST_AID_GUIDES.map((g, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.guidePill,
                      selectedGuideIdx === idx && styles.guidePillActive,
                    ]}
                    onPress={() => setSelectedGuideIdx(idx)}
                  >
                    <Text
                      style={[
                        styles.guidePillText,
                        selectedGuideIdx === idx && styles.guidePillTextActive,
                      ]}
                    >
                      {g.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.guideBox}>
                <View style={styles.urgencyBadge}>
                  <Text style={styles.urgencyText}>{activeGuide.urgency}</Text>
                </View>
                <Text style={styles.guideTitle}>{activeGuide.title}</Text>
                {activeGuide.steps.map((st, i) => (
                  <Text key={i} style={styles.stepText}>
                    {st}
                  </Text>
                ))}
              </View>
            </View>

            <AccessibilityResultCard
              title={activeGuide.title}
              badge={activeGuide.urgency}
              primaryValue={`${activeGuide.steps.length} Immediate Action Steps`}
              primarySubtext="Verified Offline Medical Protocol"
              details={activeGuide.steps.join('\n\n')}
              metadata={[
                { label: 'Emergency Type', value: activeGuide.title },
                { label: 'Network', value: 'Accessible Offline' },
              ]}
              copyContent={`${activeGuide.title}\n` + activeGuide.steps.join('\n')}
            />
          </View>
        )}

        {/* TOOL 470: Emergency Information Card */}
        {activeToolId === 470 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>In Case of Emergency (ICE) Profile</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Patient Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={iceCard.fullName}
                    onChangeText={(t) => setIceCard({ ...iceCard, fullName: t })}
                    placeholder="e.g. Jane Doe"
                  />
                </View>
                <View style={{ width: 130 }}>
                  <Text style={styles.label}>Blood Type</Text>
                  <TextInput
                    style={styles.input}
                    value={iceCard.bloodType}
                    onChangeText={(t) => setIceCard({ ...iceCard, bloodType: t })}
                    placeholder="e.g. O+"
                  />
                </View>
              </View>

              <Text style={styles.label}>Known Allergies</Text>
              <TextInput
                style={styles.input}
                value={iceCard.allergies}
                onChangeText={(t) => setIceCard({ ...iceCard, allergies: t })}
                placeholder="e.g. Penicillin, Peanuts"
              />

              <Text style={styles.label}>Medical Conditions</Text>
              <TextInput
                style={styles.input}
                value={iceCard.medicalConditions}
                onChangeText={(t) => setIceCard({ ...iceCard, medicalConditions: t })}
                placeholder="e.g. Asthma, Diabetes"
              />

              <Text style={styles.label}>Emergency Contact (Name & Phone)</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={iceCard.emergencyContactName}
                  onChangeText={(t) => setIceCard({ ...iceCard, emergencyContactName: t })}
                  placeholder="Contact Name"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={iceCard.emergencyContactPhone}
                  onChangeText={(t) => setIceCard({ ...iceCard, emergencyContactPhone: t })}
                  placeholder="Phone Number"
                />
              </View>
            </View>

            <AccessibilityResultCard
              title={iceCard.fullName.trim() ? `ICE: ${iceCard.fullName}` : 'In Case of Emergency (ICE) Profile'}
              badge="First Responder Card"
              primaryValue={iceCard.bloodType.trim() ? `Blood Type: ${iceCard.bloodType}` : (iceCard.fullName.trim() ? `Patient: ${iceCard.fullName}` : 'Awaiting Profile Input')}
              primarySubtext={iceCard.emergencyContactName.trim() ? `Contact: ${iceCard.emergencyContactName} (${iceCard.emergencyContactPhone || 'No phone'})` : 'Enter emergency medical contacts above'}
              details={formattedIceText || 'No ICE details recorded yet.'}
              metadata={[
                { label: 'Patient', value: iceCard.fullName || 'Not specified' },
                { label: 'Blood Group', value: iceCard.bloodType || 'Unknown' },
                { label: 'Contact', value: iceCard.emergencyContactName || 'None' },
                { label: 'Relation', value: iceCard.emergencyContactRelation || 'N/A' },
              ]}
              copyContent={formattedIceText || undefined}
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
    borderBottomColor: '#C7D2FE',
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
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#3730A3',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3730A3',
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
    borderColor: '#C7D2FE',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#4F46E5',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  permList: {
    gap: 8,
  },
  permRow: {
    backgroundColor: '#EEF2FF',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  permHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  permName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    backgroundColor: '#ECFDF5',
  },
  riskHigh: {
    backgroundColor: '#FEE2E2',
  },
  riskMedium: {
    backgroundColor: '#FEF3C7',
  },
  riskBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E293B',
  },
  permDesc: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 4,
  },
  permRec: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '600',
  },
  guidePill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
    marginRight: 6,
  },
  guidePillActive: {
    backgroundColor: '#4F46E5',
  },
  guidePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  guidePillTextActive: {
    color: '#FFFFFF',
  },
  guideBox: {
    backgroundColor: '#EEF2FF',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  urgencyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    marginBottom: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#DC2626',
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: 8,
  },
  stepText: {
    fontSize: 13,
    color: '#1E293B',
    marginBottom: 8,
    lineHeight: 18,
  },
});
