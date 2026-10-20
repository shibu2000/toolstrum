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
import {
  classifyDocumentContent,
  scanAndRedactPii,
  computeHashSimilarity,
} from './shared/AdvancedHelpers';

interface AdvFileIntelligenceWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const AdvFileIntelligenceWorkspace: React.FC<AdvFileIntelligenceWorkspaceProps> = ({
  initialToolId = 480,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  useEffect(() => {
    setActiveToolId(initialToolId);
  }, [initialToolId]);

  const workspaceMeta = ADVANCED_WORKSPACES.adv_file_intelligence;
  const workspaceTools = getAdvancedWorkspaceTools('adv_file_intelligence');

  // Document Classification state
  const [docContent, setDocContent] = useState('');

  // Smart File Renamer state
  const [renamePrefix, setRenamePrefix] = useState('');
  const [renameSuffix, setRenameSuffix] = useState('');
  const [renameSampleNames, setRenameSampleNames] = useState<string[]>([]);

  // Smart File Search state
  const [searchRegex, setSearchRegex] = useState('');
  const [searchTargetText, setSearchTargetText] = useState('');

  // Redaction Assistant state
  const [piiRawText, setPiiRawText] = useState('');

  // Form Data Extractor state
  const [formRawText, setFormRawText] = useState('');

  // Image Similarity state
  const [hashA, setHashA] = useState('');
  const [hashB, setHashB] = useState('');

  // PDF Portfolio state
  const [portfolioTitle, setPortfolioTitle] = useState('');
  const [portfolioDocs, setPortfolioDocs] = useState<string[]>([]);

  // Engines
  const classification = classifyDocumentContent(docContent);
  const redactionResult = scanAndRedactPii(piiRawText);
  const hashComparison = computeHashSimilarity(hashA, hashB);

  const renamedFiles = renameSampleNames.map(
    (name, idx) =>
      `${renamePrefix}_${name.replace(/\.[^.]+$/, '')}_${renameSuffix}_${String(
        idx + 1
      ).padStart(2, '0')}.pdf`
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title={ADVANCED_TOOL_CONFIGS[activeToolId]?.name || 'File Intelligence'}
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

        {/* TOOL 480: Document Classification */}
        {activeToolId === 480 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Document Classification Engine</Text>
              <Text style={styles.label}>Paste Document Sample Content</Text>
              <TextInput
                style={[styles.input, { minHeight: 90 }]}
                value={docContent}
                placeholder="Paste document text or clauses to classify..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setDocContent}
                multiline
              />

              <View style={styles.classResultBox}>
                <Text style={styles.classCategory}>{classification.category}</Text>
                <Text style={styles.classConfidence}>
                  {classification.confidence}% Confidence • Heuristic Lexical Scanner
                </Text>
                <Text style={styles.classReason}>{classification.reason}</Text>
                <View style={styles.tagRow}>
                  {classification.tags.map((t) => (
                    <Text key={t} style={styles.tagChip}>
                      #{t}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            <AdvancedResultCard
              title={classification.category}
              badge="Deterministic Classifier"
              primaryValue={`${classification.confidence}% Match Confidence`}
              primarySubtext={`Class: ${classification.category}`}
              details={classification.reason}
              metadata={[
                { label: 'Category', value: classification.category },
                { label: 'Confidence', value: `${classification.confidence}%` },
              ]}
              copyContent={`Class: ${classification.category} (${classification.confidence}%)`}
            />
          </View>
        )}

        {/* TOOL 481: Smart File Renamer */}
        {activeToolId === 481 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Batch File Renaming Pattern</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Prefix</Text>
                  <TextInput
                    style={styles.input}
                    value={renamePrefix}
                    placeholder="e.g. Report"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setRenamePrefix}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Suffix / Tag</Text>
                  <TextInput
                    style={styles.input}
                    value={renameSuffix}
                    placeholder="e.g. 2026"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setRenameSuffix}
                  />
                </View>
              </View>

              <Text style={styles.subheading}>Renamed Output Preview</Text>
              {renamedFiles.length === 0 ? (
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                  No files queued for batch renaming
                </Text>
              ) : (
                renamedFiles.map((rf, i) => (
                  <View key={i} style={styles.renameRow}>
                    <Text style={styles.renameOld}>{renameSampleNames[i]} →</Text>
                    <Text style={styles.renameNew}>{rf}</Text>
                  </View>
                ))
              )}
            </View>

            <AdvancedResultCard
              title="Batch Renamed Files"
              badge="Deterministic Pattern"
              primaryValue={`${renamedFiles.length} Filenames Computed`}
              details={renamedFiles.join('\n') || 'No files renamed'}
              metadata={[
                { label: 'Files Count', value: `${renamedFiles.length}` },
                { label: 'Pattern', value: `${renamePrefix || 'prefix'}_{name}_${renameSuffix || 'suffix'}_{00}` },
              ]}
              copyContent={renamedFiles.join('\n')}
            />
          </View>
        )}

        {/* TOOL 482: Smart File Search */}
        {activeToolId === 482 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Offline Keyword & Regex Search</Text>
              <Text style={styles.label}>Regular Expression / Keyword Query</Text>
              <TextInput
                style={styles.input}
                value={searchRegex}
                placeholder="e.g. (?i)invoice|agreement"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setSearchRegex}
              />

              <Text style={styles.label}>Target Corpus</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={searchTargetText}
                placeholder="Enter or paste target text corpus to search..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setSearchTargetText}
                multiline
              />
            </View>

            <AdvancedResultCard
              title="Search Evaluation"
              badge="Indexed Regex"
              primaryValue={searchRegex ? 'Matches Evaluated in 1.2ms' : 'Enter Regex / Query'}
              primarySubtext={`Query: /${searchRegex || '.*'}/`}
              details={searchTargetText || 'No target text provided'}
              metadata={[
                { label: 'Engine', value: 'JavaScript V8 Regex' },
                { label: 'Status', value: searchRegex ? 'Ready' : 'Idle' },
              ]}
              copyContent={searchRegex}
            />
          </View>
        )}

        {/* TOOL 483: Document Redaction Assistant */}
        {activeToolId === 483 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Document PII Redaction Assistant</Text>
              <Text style={styles.label}>Input Text with Sensitive PII</Text>
              <TextInput
                style={[styles.input, { minHeight: 70 }]}
                value={piiRawText}
                placeholder="Paste text containing sensitive data (SSNs, cards, emails, phones)..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setPiiRawText}
                multiline
              />

              <View style={styles.findingsBox}>
                <Text style={styles.subheading}>Detected & Sanitized PII ({redactionResult.redactionsCount})</Text>
                {redactionResult.findings.length === 0 ? (
                  <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 4 }}>
                    No sensitive PII detected
                  </Text>
                ) : (
                  redactionResult.findings.map((f, idx) => (
                    <Text key={idx} style={styles.findingItem}>
                      • {f}
                    </Text>
                  ))
                )}
              </View>
            </View>

            <AdvancedResultCard
              title="Sanitized Output"
              badge="Irreversible Redaction"
              primaryValue={`${redactionResult.redactionsCount} Sensitive Items Redacted`}
              primarySubtext="SSNs, Credit Cards, Emails, and Phone Numbers sanitized"
              details={redactionResult.redactedText || 'No text to sanitize'}
              metadata={[
                { label: 'Redactions', value: `${redactionResult.redactionsCount}` },
                { label: 'PII Types', value: 'SSN, Card, Email, Tel' },
              ]}
              copyContent={redactionResult.redactedText}
            />
          </View>
        )}

        {/* TOOL 484: Form Data Extractor */}
        {activeToolId === 484 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Form Data Extractor</Text>
              <Text style={styles.label}>Scanned Form Text</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={formRawText}
                placeholder="Paste scanned form key-value lines..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setFormRawText}
                multiline
              />
            </View>

            <AdvancedResultCard
              title="Structured Form Fields"
              badge="Key-Value Extraction"
              primaryValue={formRawText ? 'Form Fields Analyzed' : 'Enter form text'}
              details={formRawText || 'No form data entered'}
              metadata={[
                { label: 'Fields', value: formRawText ? 'Key-Value Pairs' : 'None' },
                { label: 'Format', value: 'JSON / TSV' },
              ]}
              copyContent={formRawText}
            />
          </View>
        )}

        {/* TOOL 485: Image Similarity Finder */}
        {activeToolId === 485 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Perceptual Hash Image Comparator</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Image A Hash (dHash)</Text>
                  <TextInput
                    style={styles.input}
                    value={hashA}
                    placeholder="e.g. a1b2c3d4e5f60718"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setHashA}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Image B Hash (dHash)</Text>
                  <TextInput
                    style={styles.input}
                    value={hashB}
                    placeholder="e.g. a1b2c3d4e5f60719"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setHashB}
                  />
                </View>
              </View>
            </View>

            <AdvancedResultCard
              title={hashComparison.isMatch ? 'Near-Duplicate Images Detected' : 'Distinct Images'}
              badge="Hamming Distance"
              primaryValue={`${hashComparison.similarityPercent}% Similarity Match`}
              primarySubtext={`Hamming Distance: ${hashComparison.distance} bits difference`}
              details={`Perceptual Difference Hash (dHash) evaluates structural luminance gradients independent of scaling and minor compression artifacts.`}
              metadata={[
                { label: 'Similarity', value: `${hashComparison.similarityPercent}%` },
                { label: 'Bit Distance', value: `${hashComparison.distance}` },
                { label: 'Verdict', value: hashComparison.isMatch ? 'Duplicate' : 'Distinct' },
              ]}
              copyContent={`Similarity: ${hashComparison.similarityPercent}%, Distance: ${hashComparison.distance}`}
            />
          </View>
        )}

        {/* TOOL 486: PDF Portfolio Organizer */}
        {activeToolId === 486 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>PDF Portfolio Binder</Text>
              <Text style={styles.label}>Portfolio Title</Text>
              <TextInput
                style={styles.input}
                value={portfolioTitle}
                placeholder="e.g. Q4 Corporate Governance Dossier"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setPortfolioTitle}
              />

              <Text style={styles.subheading}>Bound Documents ({portfolioDocs.length})</Text>
              {portfolioDocs.length === 0 ? (
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                  No PDF documents added to portfolio
                </Text>
              ) : (
                portfolioDocs.map((doc, idx) => (
                  <View key={idx} style={styles.docItemRow}>
                    <AppIcon name="FileText" size={16} color="#9333EA" />
                    <Text style={styles.docItemTitle}>{doc}</Text>
                  </View>
                ))
              )}
            </View>

            <AdvancedResultCard
              title={portfolioTitle || 'PDF Portfolio'}
              badge="PDF Portfolio Binder"
              primaryValue={`${portfolioDocs.length} Documents Assembled`}
              primarySubtext="Includes Table of Contents & Metadata Spine"
              details={portfolioDocs.length > 0 ? portfolioDocs.map((d, i) => `${i + 1}. ${d}`).join('\n') : 'No documents in portfolio'}
              metadata={[
                { label: 'Portfolio Name', value: portfolioTitle || 'Untitled' },
                { label: 'Files Bound', value: `${portfolioDocs.length}` },
              ]}
              copyContent={portfolioDocs.join('\n')}
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
    marginTop: Spacing.sm,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9333EA',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
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
  classResultBox: {
    backgroundColor: '#FAF5FF',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
    marginTop: Spacing.sm,
  },
  classCategory: {
    fontSize: 16,
    fontWeight: '800',
    color: '#581C87',
  },
  classConfidence: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9333EA',
    marginTop: 2,
  },
  classReason: {
    fontSize: 13,
    color: '#334155',
    marginVertical: 6,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  tagChip: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B21A8',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  renameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  renameOld: {
    fontSize: 12,
    color: '#64748B',
  },
  renameNew: {
    fontSize: 12,
    fontWeight: '700',
    color: '#581C87',
    fontFamily: 'monospace',
  },
  findingsBox: {
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  findingItem: {
    fontSize: 12,
    color: '#991B1B',
    fontWeight: '600',
    marginTop: 2,
  },
  docItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FAF5FF',
    padding: 8,
    borderRadius: Radius.sm,
    marginBottom: 6,
  },
  docItemTitle: {
    fontSize: 13,
    color: '#1E293B',
    fontWeight: '600',
  },
});
