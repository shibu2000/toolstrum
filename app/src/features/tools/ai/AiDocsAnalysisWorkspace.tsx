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
  summarizeDocumentOutline,
  extractDocumentEntities,
  compareDocumentsSemantically,
  analyzeDataTrends,
} from './shared/AiHelpers';
import { AiResultCard, AiMetricItem } from './shared/AiResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const AiDocsAnalysisWorkspace: React.FC<Props> = ({
  initialToolId = 402,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getAiToolConfig(activeToolId) || getAiToolConfig(402)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 402: AI PDF Assistant ---
  const [pdfText, setPdfText] = useState('');

  // --- Tool 403: AI Document Extractor ---
  const [extractInput, setExtractInput] = useState('');

  // --- Tool 415: AI Document Comparison ---
  const [docA, setDocA] = useState('');
  const [docB, setDocB] = useState('');

  // --- Tool 416: AI Data Analyst ---
  const [dataPointsText, setDataPointsText] = useState('');

  // Computations
  const docSummary = useMemo(() => {
    return summarizeDocumentOutline(pdfText);
  }, [pdfText]);

  const entities = useMemo(() => {
    return extractDocumentEntities(extractInput);
  }, [extractInput]);

  const diffResult = useMemo(() => {
    return compareDocumentsSemantically(docA, docB);
  }, [docA, docB]);

  const dataStats = useMemo(() => {
    const parsedNums = dataPointsText
      .split(/[,;\s]+/)
      .map((s) => parseFloat(s.trim()))
      .filter((n) => !isNaN(n));
    return analyzeDataTrends(parsedNums);
  }, [dataPointsText]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Analysis Output';
    let metrics: AiMetricItem[] = [];
    let note = '';

    if (activeMode === 'pdf_assistant') {
      if (!pdfText.trim()) {
        hero = 'Awaiting Document Content';
        heroLabel = 'Document Outline';
        metrics = [
          { label: 'Status', value: 'Ready for Analysis', highlight: true },
          { label: 'Sections', value: 0 },
          { label: 'Word Count', value: 0 },
        ];
        note = 'Paste PDF text or document notes above to extract headings, word count, and key takeaways.';
      } else {
        hero = `${docSummary.headings.length} Sections · ${docSummary.takeaways.length} Key Takeaways`;
        heroLabel = `Outline (${docSummary.wordCount} words)`;
        metrics = [
          { label: 'Sections Detected', value: docSummary.headings.length, highlight: true },
          { label: 'Word Count', value: docSummary.wordCount },
          { label: 'Est. Reading Time', value: `~${docSummary.readingTimeMinutes} min` },
          { label: 'Takeaway Points', value: docSummary.takeaways.length },
        ];
        note = docSummary.takeaways.length > 0
          ? `Key Takeaways: ${docSummary.takeaways.join(' • ')}`
          : 'Outline and reading metrics generated.';
      }
    } else if (activeMode === 'doc_extractor') {
      const totalEntities =
        entities.dates.length +
        entities.amounts.length +
        entities.emails.length +
        entities.phones.length +
        entities.organizations.length;

      if (!extractInput.trim() || totalEntities === 0) {
        hero = totalEntities > 0 ? `${totalEntities} Named Entities Extracted` : 'Awaiting Input Text';
        heroLabel = 'Entity Extractor';
        metrics = [
          { label: 'Status', value: totalEntities > 0 ? 'Extracted' : 'Ready', highlight: true },
          { label: 'Entities', value: totalEntities },
          { label: 'Currencies', value: entities.amounts.length },
          { label: 'Contacts', value: entities.emails.length + entities.phones.length },
        ];
        note = totalEntities > 0
          ? 'Entities isolated from input text.'
          : 'Paste contracts, receipts, or text above to extract dates, currency amounts, emails, and organizations.';
      } else {
        hero = `${totalEntities} Named Entities Extracted`;
        heroLabel = 'Document Intelligence';
        metrics = [
          { label: 'Currencies / Amounts', value: entities.amounts.length, highlight: true },
          { label: 'Dates Detected', value: entities.dates.length },
          { label: 'Emails Extracted', value: entities.emails.length },
          { label: 'Organizations', value: entities.organizations.length },
        ];
        note = `Amounts: [${entities.amounts.join(', ')}] · Dates: [${entities.dates.join(', ')}]`;
      }
    } else if (activeMode === 'doc_comparison') {
      if (!docA.trim() && !docB.trim()) {
        hero = 'Enter Documents to Compare';
        heroLabel = 'Clause Divergence';
        metrics = [
          { label: 'Status', value: 'Ready', highlight: true },
          { label: 'Similarity', value: '0%' },
          { label: 'Clauses', value: 0 },
        ];
        note = 'Paste version A and version B text above to detect semantic differences and modifications.';
      } else {
        hero = `${diffResult.similarityScore}% Semantic Match`;
        heroLabel = 'Clause Divergence';
        metrics = [
          { label: 'Similarity Score', value: `${diffResult.similarityScore}%`, highlight: true },
          { label: 'Added Clauses', value: diffResult.addedClauses.length },
          { label: 'Removed Clauses', value: diffResult.removedClauses.length },
        ];
        note =
          diffResult.addedClauses.length > 0
            ? `Added: "${diffResult.addedClauses[0]}"`
            : 'Documents are semantically identical.';
      }
    } else if (activeMode === 'data_analyst') {
      if (!dataPointsText.trim() || dataStats.count === 0) {
        hero = 'Enter Numerical Records';
        heroLabel = 'Statistical Trend Analysis';
        metrics = [
          { label: 'Status', value: 'Ready', highlight: true },
          { label: 'Data Points', value: 0 },
          { label: 'Trajectory', value: 'None' },
        ];
        note = 'Enter comma- or space-separated numbers above to compute mean, median, min/max, and trend trajectory.';
      } else {
        hero = `Mean: ${dataStats.mean} · Trend: ${dataStats.trend.toUpperCase()}`;
        heroLabel = `${dataStats.count} Data Points Evaluated`;
        metrics = [
          { label: 'Statistical Mean', value: dataStats.mean, highlight: true },
          { label: 'Median Value', value: dataStats.median },
          { label: 'Range (Min / Max)', value: `${dataStats.min} – ${dataStats.max}` },
          { label: 'Trajectory', value: dataStats.trend },
        ];
        note =
          dataStats.outliers.length > 0
            ? `Outliers detected: [${dataStats.outliers.join(', ')}]`
            : 'Normal distribution with no extreme statistical anomalies.';
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    pdfText,
    extractInput,
    docA,
    docB,
    dataPointsText,
    docSummary,
    entities,
    diffResult,
    dataStats,
  ]);

  const docTools = [
    { id: 402, name: 'PDF Assistant' },
    { id: 403, name: 'Doc Extractor' },
    { id: 415, name: 'Doc Compare' },
    { id: 416, name: 'Data Analyst' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Document Intelligence • Offline Local Processing"
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
          {docTools.map((t) => {
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
        {/* Workspace Form */}
        <View style={styles.card}>
          {activeMode === 'pdf_assistant' && (
            <View>
              <Text style={styles.sectionTitle}>AI PDF & Document Assistant</Text>
              <Text style={styles.subtext}>
                Extract key sections, headings, and strategic action takeaways from PDF text.
              </Text>

              <Text style={styles.label}>Document Text / Transcript</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={pdfText}
                onChangeText={setPdfText}
                placeholder="Paste document text..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
              />
            </View>
          )}

          {activeMode === 'doc_extractor' && (
            <View>
              <Text style={styles.sectionTitle}>Named Entity & Metadata Extractor</Text>
              <Text style={styles.subtext}>
                Detect and isolate dates, amounts, organizations, emails, and phone numbers.
              </Text>

              <Text style={styles.label}>Contract, Receipt, or Document Text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={extractInput}
                onChangeText={setExtractInput}
                placeholder="Paste contract or receipt text..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
              />

              {/* Extracted Entities Badges */}
              <Text style={styles.label}>Extracted Details</Text>
              {entities.amounts.length === 0 && entities.dates.length === 0 && entities.organizations.length === 0 ? (
                <Text style={styles.subtext}>No entities extracted yet. Enter receipt or contract text above.</Text>
              ) : (
                <View style={styles.chipsRow}>
                  {entities.amounts.map((a, i) => (
                    <View key={`a-${i}`} style={styles.pillGreen}>
                      <Text style={styles.pillGreenText}>{a}</Text>
                    </View>
                  ))}
                  {entities.dates.map((d, i) => (
                    <View key={`d-${i}`} style={styles.pillBlue}>
                      <Text style={styles.pillBlueText}>{d}</Text>
                    </View>
                  ))}
                  {entities.organizations.map((o, i) => (
                    <View key={`o-${i}`} style={styles.pillPurple}>
                      <Text style={styles.pillPurpleText}>{o}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {activeMode === 'doc_comparison' && (
            <View>
              <Text style={styles.sectionTitle}>Semantic Document Comparison</Text>
              <Text style={styles.subtext}>
                Compare two drafts to detect clause modifications, additions, and textual drift.
              </Text>

              <Text style={styles.label}>Original Document (Version A)</Text>
              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                value={docA}
                onChangeText={setDocA}
                placeholder="Version A text..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Modified Document (Version B)</Text>
              <TextInput
                style={[styles.input, styles.textAreaSmall]}
                value={docB}
                onChangeText={setDocB}
                placeholder="Version B text..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />
            </View>
          )}

          {activeMode === 'data_analyst' && (
            <View>
              <Text style={styles.sectionTitle}>AI Statistical Data Analyst</Text>
              <Text style={styles.subtext}>
                Compute metrics, trend trajectories, and identify outliers in numerical records.
              </Text>

              <Text style={styles.label}>Numbers (Comma or Space Delimited)</Text>
              <TextInput
                style={styles.input}
                value={dataPointsText}
                onChangeText={setDataPointsText}
                placeholder="10, 20, 30, 40..."
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setDataPointsText('10, 15, 20, 25, 30, 35, 40')}
                >
                  <Text style={styles.chipText}>Steady Growth</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setDataPointsText('50, 42, 38, 29, 21, 14, 9')}
                >
                  <Text style={styles.chipText}>Declining Trend</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setDataPointsText('20, 22, 21, 19, 120, 23, 20')}
                >
                  <Text style={styles.chipText}>With Outlier (120)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Result Card */}
        <AiResultCard
          title={config.title}
          heroValue={calculation.hero}
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline Document Intelligence"
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
    minHeight: 110,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    minHeight: 70,
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
  pillGreen: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pillGreenText: {
    color: '#15803D',
    fontSize: 11,
    fontWeight: '700',
  },
  pillBlue: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pillBlueText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
  },
  pillPurple: {
    backgroundColor: '#F5F3FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  pillPurpleText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '700',
  },
});
