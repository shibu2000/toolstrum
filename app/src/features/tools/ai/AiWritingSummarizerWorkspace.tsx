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
  getAiToolConfig,
  AiToolConfig,
} from './aiConfig';
import {
  rewriteTextTone,
  buildResumeBulletPoints,
  generateEmailDraft,
  parseMeetingTranscript,
} from './shared/AiHelpers';
import { AiResultCard, AiMetricItem } from './shared/AiResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const AiWritingSummarizerWorkspace: React.FC<Props> = ({
  initialToolId = 404,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getAiToolConfig(activeToolId) || getAiToolConfig(404)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 404: AI Writing Assistant ---
  const [writingDraft, setWritingDraft] = useState('');
  const [selectedTone, setSelectedTone] = useState<'professional' | 'concise' | 'friendly' | 'academic'>('professional');

  // --- Tool 409: AI Resume Builder ---
  const [resumeRole, setResumeRole] = useState('');
  const [resumeAccomplishment, setResumeAccomplishment] = useState('');

  // --- Tool 411: AI Email Assistant ---
  const [emailPurpose, setEmailPurpose] = useState('');
  const [emailRecipient, setEmailRecipient] = useState('');
  const [emailPointsText, setEmailPointsText] = useState('');

  // --- Tool 412: AI Meeting Summarizer ---
  const [meetingNotes, setMeetingNotes] = useState('');

  // Computations
  const rewrittenDraft = useMemo(() => {
    return rewriteTextTone(writingDraft, selectedTone);
  }, [writingDraft, selectedTone]);

  const resumeBullets = useMemo(() => {
    return buildResumeBulletPoints(resumeRole, resumeAccomplishment);
  }, [resumeRole, resumeAccomplishment]);

  const emailDraft = useMemo(() => {
    const points = emailPointsText.split('\n').map((p) => p.trim()).filter(Boolean);
    return generateEmailDraft(emailPurpose, emailRecipient, points);
  }, [emailPurpose, emailRecipient, emailPointsText]);

  const meetingReport = useMemo(() => {
    return parseMeetingTranscript(meetingNotes);
  }, [meetingNotes]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Writing Output';
    let metrics: AiMetricItem[] = [];
    let note = '';

    if (activeMode === 'writing_assist') {
      if (!writingDraft.trim()) {
        hero = 'Awaiting Draft Text';
        heroLabel = `Tone: ${selectedTone.toUpperCase()}`;
        metrics = [
          { label: 'Selected Tone', value: selectedTone.toUpperCase(), highlight: true },
          { label: 'Words', value: 0 },
          { label: 'Status', value: 'Ready' },
        ];
        note = 'Enter or paste draft text above to adjust tone (professional, concise, friendly, academic).';
      } else {
        hero = rewrittenDraft;
        heroLabel = `Tone: ${selectedTone.toUpperCase()}`;
        metrics = [
          { label: 'Selected Tone', value: selectedTone.toUpperCase(), highlight: true },
          { label: 'Original Words', value: writingDraft.trim().split(/\s+/).length },
          { label: 'Polished Words', value: rewrittenDraft.trim().split(/\s+/).length },
        ];
        note = 'Heuristic natural-language styler removed informal idioms and optimized syntax.';
      }
    } else if (activeMode === 'resume_builder') {
      if (!resumeAccomplishment.trim()) {
        hero = 'Awaiting Accomplishment Details';
        heroLabel = 'Resume Bullet Points';
        metrics = [
          { label: 'Target Role', value: resumeRole.trim() || 'Role Not Set', highlight: true },
          { label: 'Bullet Points', value: 0 },
          { label: 'Status', value: 'Ready' },
        ];
        note = 'Enter your role and accomplishments above to generate high-impact resume bullet points.';
      } else {
        hero = resumeBullets.join('\n');
        heroLabel = `${resumeBullets.length} High-Impact Resume Bullets`;
        metrics = [
          { label: 'Target Role', value: resumeRole || 'General Professional', highlight: true },
          { label: 'Bullet Points', value: resumeBullets.length },
          { label: 'Action Verbs', value: 'Spearheaded / Optimized' },
        ];
        note = 'Action-verb framed accomplishments optimized for applicant tracking systems.';
      }
    } else if (activeMode === 'email_assistant') {
      if (!emailPointsText.trim() && !emailPurpose.trim()) {
        hero = 'Awaiting Email Details';
        heroLabel = 'Email Draft';
        metrics = [
          { label: 'Recipient', value: emailRecipient.trim() || 'Not Set', highlight: true },
          { label: 'Subject', value: emailPurpose.trim() || 'Not Set' },
          { label: 'Bullet Points', value: 0 },
        ];
        note = 'Enter email purpose, recipient, and bullet points to generate a professional email draft.';
      } else {
        hero = emailDraft;
        heroLabel = `Draft to ${emailRecipient || 'Recipient'}`;
        metrics = [
          { label: 'Subject', value: `Update on ${emailPurpose || 'Project'}`, highlight: true },
          { label: 'Structure', value: 'Greeting • Points • CTA' },
          { label: 'Length', value: `${emailDraft.trim().split(/\s+/).length} words` },
        ];
        note = 'Complete professional business email draft ready for dispatch.';
      }
    } else if (activeMode === 'meeting_summarizer') {
      if (!meetingNotes.trim()) {
        hero = 'Awaiting Meeting Notes';
        heroLabel = 'Meeting Minutes';
        metrics = [
          { label: 'Decisions', value: 0, highlight: true },
          { label: 'Action Items', value: 0 },
          { label: 'Agenda Topics', value: 0 },
        ];
        note = 'Paste meeting notes or transcripts above to extract decisions, action items, and agenda points.';
      } else {
        hero = `${meetingReport.decisions.length} Decisions · ${meetingReport.actionItems.length} Action Items`;
        heroLabel = 'Meeting Minutes';
        metrics = [
          { label: 'Decisions Made', value: meetingReport.decisions.length, highlight: true },
          { label: 'Action Items', value: meetingReport.actionItems.length },
          { label: 'Agenda Topics', value: meetingReport.agenda.length },
        ];
        note = `Action Item: "${meetingReport.actionItems[0] || 'Follow up on release items'}"`;
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    rewrittenDraft,
    selectedTone,
    writingDraft,
    resumeBullets,
    resumeRole,
    resumeAccomplishment,
    emailDraft,
    emailRecipient,
    emailPurpose,
    emailPointsText,
    meetingReport,
    meetingNotes,
  ]);

  const writingTools = [
    { id: 404, name: 'Writing Assistant' },
    { id: 409, name: 'Resume Builder' },
    { id: 411, name: 'Email Assistant' },
    { id: 412, name: 'Meeting Notes' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Writing & Summarization • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {writingTools.map((t) => {
            const isSelected = activeToolId === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setActiveToolId(t.id)}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              >
                <Text
                  style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}
                >
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Workspace Controls */}
        <View style={styles.card}>
          {activeMode === 'writing_assist' && (
            <View>
              <Text style={styles.sectionTitle}>AI Writing & Tone Assistant</Text>
              <Text style={styles.subtext}>
                Adjust tone, replace colloquialisms, and polish prose with offline heuristics.
              </Text>

              {/* Tone Selector */}
              <Text style={styles.label}>Select Desired Tone</Text>
              <View style={styles.chipsRow}>
                {(['professional', 'concise', 'friendly', 'academic'] as const).map((tone) => (
                  <TouchableOpacity
                    key={tone}
                    style={[
                      styles.chip,
                      selectedTone === tone && styles.chipActive,
                    ]}
                    onPress={() => setSelectedTone(tone)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selectedTone === tone && styles.chipTextActive,
                      ]}
                    >
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Raw Draft to Polish</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={writingDraft}
                onChangeText={setWritingDraft}
                placeholder="Type your draft here..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {activeMode === 'resume_builder' && (
            <View>
              <Text style={styles.sectionTitle}>AI Resume Bullet Generator</Text>
              <Text style={styles.subtext}>
                Transform basic job descriptions into high-impact metric-driven bullet points.
              </Text>

              <Text style={styles.label}>Target Job Title / Role</Text>
              <TextInput
                style={styles.input}
                value={resumeRole}
                onChangeText={setResumeRole}
                placeholder="e.g. Lead Software Engineer"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Accomplishment or Responsibilities</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={resumeAccomplishment}
                onChangeText={setResumeAccomplishment}
                placeholder="What did you build or improve?..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {activeMode === 'email_assistant' && (
            <View>
              <Text style={styles.sectionTitle}>AI Email Draft Assistant</Text>
              <Text style={styles.subtext}>
                Compose professional emails with clear greetings, bullets, and action calls.
              </Text>

              <Text style={styles.label}>Email Purpose</Text>
              <TextInput
                style={styles.input}
                value={emailPurpose}
                onChangeText={setEmailPurpose}
                placeholder="e.g. Client Project Status"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Recipient Name or Team</Text>
              <TextInput
                style={styles.input}
                value={emailRecipient}
                onChangeText={setEmailRecipient}
                placeholder="e.g. Sarah Jenkins"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Key Bullet Points (One per line)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={emailPointsText}
                onChangeText={setEmailPointsText}
                placeholder="Deliverables completed...&#10;Next steps..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {activeMode === 'meeting_summarizer' && (
            <View>
              <Text style={styles.sectionTitle}>AI Meeting Summarizer & Action Parser</Text>
              <Text style={styles.subtext}>
                Isolate key decisions, agenda items, and assigned tasks from meeting notes.
              </Text>

              <Text style={styles.label}>Raw Meeting Notes / Transcript</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={meetingNotes}
                onChangeText={setMeetingNotes}
                placeholder="Paste standup or meeting notes..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
              />

              {/* Decided Items */}
              <Text style={styles.label}>Parsed Decisions</Text>
              {meetingReport.decisions.length === 0 ? (
                <Text style={styles.subtext}>No decisions parsed yet. Enter meeting notes above.</Text>
              ) : (
                meetingReport.decisions.map((d, i) => (
                  <View key={i} style={styles.decisionItem}>
                    <AppIcon name="CheckCircle2" size={14} color="#16A34A" />
                    <Text style={styles.decisionText}>{d}</Text>
                  </View>
                ))
              )}
            </View>
          )}
        </View>

        {/* Dynamic Result Card */}
        <AiResultCard
          title={config.title}
          heroValue={calculation.hero}
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline Writing Intelligence"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={calculation.hero}
          fileName={`${config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#7C3AED',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
  decisionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  decisionText: {
    fontSize: 12,
    color: '#334155',
    flex: 1,
  },
});
