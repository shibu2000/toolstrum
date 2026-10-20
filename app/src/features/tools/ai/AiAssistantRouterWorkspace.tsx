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
  routePromptToTool,
  parseVoiceCommand,
  generateStudyFlashcards,
} from './shared/AiHelpers';
import { AiResultCard, AiMetricItem } from './shared/AiResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const AiAssistantRouterWorkspace: React.FC<Props> = ({
  initialToolId = 401,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getAiToolConfig(activeToolId) || getAiToolConfig(401)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 401: AI Utility Assistant ---
  const [generalPrompt, setGeneralPrompt] = useState('');

  // --- Tool 407: AI Voice Assistant ---
  const [voiceTranscript, setVoiceTranscript] = useState('');

  // --- Tool 413: AI Study Assistant ---
  const [studyText, setStudyText] = useState('');

  // --- Tool 414: AI Smart Tool Router ---
  const [routerQuery, setRouterQuery] = useState('');

  // Computations
  const routerMatches = useMemo(() => {
    return routePromptToTool(activeMode === 'assistant_general' ? generalPrompt : routerQuery);
  }, [activeMode, generalPrompt, routerQuery]);

  const voiceParsed = useMemo(() => {
    return parseVoiceCommand(voiceTranscript);
  }, [voiceTranscript]);

  const flashcards = useMemo(() => {
    return generateStudyFlashcards(studyText);
  }, [studyText]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Assistant Insights';
    let metrics: AiMetricItem[] = [];
    let note = '';

    if (activeMode === 'assistant_general') {
      const bestTool = routerMatches[0]?.tool;
      hero = bestTool ? `Recommended: Tool ${bestTool.id} — ${bestTool.name}` : 'Local Guidance Available';
      heroLabel = 'Workflow Recommendation';
      metrics = [
        { label: 'Primary Tool', value: bestTool ? `#${bestTool.id} ${bestTool.name}` : 'Tool Catalog', highlight: true },
        { label: 'Studio Group', value: bestTool ? bestTool.studioId.toUpperCase() : 'ALL' },
        { label: 'Offline Execution', value: 'Instant Local' },
      ];
      note = bestTool
        ? `Step 1: Open ${bestTool.name}. Step 2: Load input files. Step 3: Run local processing without cloud uploads.`
        : 'Enter your task request above for smart offline tool dispatch.';
    } else if (activeMode === 'assistant_voice') {
      if (!voiceTranscript.trim()) {
        hero = 'Awaiting Voice Input';
        heroLabel = 'Voice Command Ready';
        metrics = [
          { label: 'Status', value: 'Ready for Input', highlight: true },
          { label: 'Engine', value: 'Local Heuristics' },
          { label: 'Confidence', value: '0%' },
        ];
        note = 'Speak or type a command like "merge pdf files" or "compress image" to parse local tool intent.';
      } else {
        hero = voiceParsed.interpretedCommand;
        heroLabel = `Intent: ${voiceParsed.action} (${voiceParsed.confidence}% Confidence)`;
        metrics = [
          { label: 'Action Intent', value: voiceParsed.action, highlight: true },
          { label: 'Category', value: voiceParsed.category },
          { label: 'Target Object', value: voiceParsed.targetObject },
          { label: 'Confidence', value: `${voiceParsed.confidence}%` },
        ];
        note = 'Speech command transcribed and mapped to native offline tool execution pipeline.';
      }
    } else if (activeMode === 'study_flashcards') {
      if (!studyText.trim()) {
        hero = '0 Study Flashcards';
        heroLabel = 'Active Recall Generator';
        metrics = [
          { label: 'Flashcards', value: 0, highlight: true },
          { label: 'Key Concepts', value: '0 Definitions' },
          { label: 'Study Mode', value: 'Spaced Recall' },
        ];
        note = 'Paste textbook excerpts or lecture notes above to extract concepts and definitions into self-quiz cards.';
      } else {
        hero = `${flashcards.length} Study Flashcards Generated`;
        heroLabel = 'Active Recall Cards';
        metrics = [
          { label: 'Flashcards', value: flashcards.length, highlight: true },
          { label: 'Key Concepts', value: `${flashcards.length} Definitions` },
          { label: 'Study Mode', value: 'Spaced Recall' },
        ];
        note = 'Heuristic natural-language analyzer extracted concepts and definitions into self-quiz cards.';
      }
    } else if (activeMode === 'tool_router') {
      if (!routerQuery.trim()) {
        hero = 'Enter Keywords to Route';
        heroLabel = 'Offline Tool Registry';
        metrics = [
          { label: 'Catalog Index', value: '500 Tools', highlight: true },
          { label: 'Search Engine', value: 'Local Heuristic' },
          { label: 'Status', value: 'Ready' },
        ];
        note = 'Type an action or tool requirement (e.g., "crop image", "svg to png", "json format") to find the exact workspace.';
      } else {
        const topMatch = routerMatches[0];
        hero = topMatch ? `Match: #${topMatch.tool.id} ${topMatch.tool.name}` : 'No Direct Match';
        heroLabel = `Routing Score: ${topMatch?.score || 0} pts`;
        metrics = [
          { label: 'Best Match', value: topMatch ? topMatch.tool.name : 'N/A', highlight: true },
          { label: 'Tool ID', value: topMatch ? `#${topMatch.tool.id}` : 'None' },
          { label: 'Studio', value: topMatch ? topMatch.tool.studioId.toUpperCase() : 'None' },
          { label: 'Catalog Search', value: '500 Tools Indexed' },
        ];
        note = topMatch
          ? `Matched based on keywords: [${topMatch.matchedKeywords.join(', ')}] in 500-tool registry.`
          : 'Try searching with synonyms like "pdf", "crop", "compress", or "qr".';
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    generalPrompt,
    voiceTranscript,
    studyText,
    routerQuery,
    routerMatches,
    voiceParsed,
    flashcards,
  ]);

  const assistantTools = [
    { id: 401, name: 'Assistant' },
    { id: 407, name: 'Voice' },
    { id: 413, name: 'Study Cards' },
    { id: 414, name: 'Tool Router' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="AI Studio • Offline Local Processing"
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
          {assistantTools.map((t) => {
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
          {activeMode === 'assistant_general' && (
            <View>
              <Text style={styles.sectionTitle}>AI Utility Assistant</Text>
              <Text style={styles.subtext}>
                Ask what you want to achieve; the assistant guides you to the exact offline tool and workflow.
              </Text>

              <Text style={styles.label}>Describe your task or goal</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={generalPrompt}
                onChangeText={setGeneralPrompt}
                placeholder="e.g. How to convert PDF to Word or generate a barcode..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setGeneralPrompt('How to split a large PDF document into chapters')}
                >
                  <Text style={styles.chipText}>Split PDF Query</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setGeneralPrompt('Convert my audio recording to MP3 format')}
                >
                  <Text style={styles.chipText}>Audio Format Query</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'assistant_voice' && (
            <View>
              <Text style={styles.sectionTitle}>AI Voice Assistant Simulator</Text>
              <Text style={styles.subtext}>
                Simulate hands-free voice commands to execute workflows immediately.
              </Text>

              <Text style={styles.label}>Spoken Voice Command</Text>
              <TextInput
                style={styles.input}
                value={voiceTranscript}
                onChangeText={setVoiceTranscript}
                placeholder="Spoken command..."
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setVoiceTranscript('Generate a Wi-Fi QR code for office guest')}
                >
                  <Text style={styles.chipText}>"Make Wi-Fi QR"</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setVoiceTranscript('Calculate monthly loan EMI for ten lakhs')}
                >
                  <Text style={styles.chipText}>"Calculate EMI"</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setVoiceTranscript('Compress video file for WhatsApp sharing')}
                >
                  <Text style={styles.chipText}>"Compress Video"</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'study_flashcards' && (
            <View>
              <Text style={styles.sectionTitle}>AI Study Flashcard Generator</Text>
              <Text style={styles.subtext}>
                Extract key definitions and active-recall flashcards from lecture notes.
              </Text>

              <Text style={styles.label}>Study Material or Text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={studyText}
                onChangeText={setStudyText}
                placeholder="Paste textbook excerpt or notes..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
              />

              {/* Flashcards Preview */}
              <Text style={styles.label}>Generated Flashcards ({flashcards.length})</Text>
              {flashcards.length === 0 ? (
                <Text style={styles.subtext}>No flashcards generated yet. Enter study notes or definitions above.</Text>
              ) : (
                flashcards.map((f, idx) => (
                  <View key={idx} style={styles.flashcardBox}>
                    <Text style={styles.flashcardQ}>Q: {f.question}</Text>
                    <Text style={styles.flashcardA}>A: {f.answer}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {activeMode === 'tool_router' && (
            <View>
              <Text style={styles.sectionTitle}>AI Smart Tool Router (500 Tools)</Text>
              <Text style={styles.subtext}>
                Semantic intent matcher linking your query to the exact canonical tool.
              </Text>

              <Text style={styles.label}>Search Query / Action</Text>
              <TextInput
                style={styles.input}
                value={routerQuery}
                onChangeText={setRouterQuery}
                placeholder="e.g. merge pdf, crop photo, base64..."
                placeholderTextColor="#94A3B8"
              />

              {/* Matches List */}
              <Text style={styles.label}>Top Matched Tools</Text>
              {routerMatches.length === 0 ? (
                <Text style={styles.subtext}>No tools matched yet. Type keywords above to search 500 offline tools.</Text>
              ) : (
                routerMatches.map((m, idx) => (
                  <View key={idx} style={styles.matchItem}>
                    <View style={styles.matchBadge}>
                      <Text style={styles.matchId}>#{m.tool.id}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.matchName}>{m.tool.name}</Text>
                      <Text style={styles.matchDesc}>{m.tool.description}</Text>
                    </View>
                    <Text style={styles.matchScore}>{m.score} pts</Text>
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
          badgeText="100% Offline AI Intelligence"
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  flashcardBox: {
    backgroundColor: '#F5F3FF',
    borderRadius: Radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 8,
  },
  flashcardQ: {
    fontSize: 13,
    fontWeight: '700',
    color: '#5B21B6',
    marginBottom: 4,
  },
  flashcardA: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 16,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  matchBadge: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  matchId: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  matchName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  matchDesc: {
    fontSize: 11,
    color: '#64748B',
  },
  matchScore: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C3AED',
  },
});
