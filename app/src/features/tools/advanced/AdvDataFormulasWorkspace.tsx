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
  computeDetailedTextDiff,
  generateSpreadsheetFormula,
  generateCsvBarChart,
  cleanTabularData,
} from './shared/AdvancedHelpers';

interface AdvDataFormulasWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const AdvDataFormulasWorkspace: React.FC<AdvDataFormulasWorkspaceProps> = ({
  initialToolId = 474,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  useEffect(() => {
    setActiveToolId(initialToolId);
  }, [initialToolId]);

  const workspaceMeta = ADVANCED_WORKSPACES.adv_data_formulas;
  const workspaceTools = getAdvancedWorkspaceTools('adv_data_formulas');

  // Text Diff state
  const [diffTextA, setDiffTextA] = useState('');
  const [diffTextB, setDiffTextB] = useState('');

  // Spreadsheet formula state
  const [formulaQuery, setFormulaQuery] = useState('');

  // CSV Chart state
  const [csvInput, setCsvInput] = useState('');

  // Data Cleaner state
  const [dirtyData, setDirtyData] = useState('');

  // Table Extractor state
  const [rawTableInput, setRawTableInput] = useState('');

  // Compute engines
  const diffResult = computeDetailedTextDiff(diffTextA, diffTextB);
  const formulaResult = generateSpreadsheetFormula(formulaQuery);
  const chartResult = generateCsvBarChart(csvInput);
  const cleanResult = cleanTabularData(dirtyData);

  return (
    <View style={styles.container}>
      <AppHeader
        title={ADVANCED_TOOL_CONFIGS[activeToolId]?.name || 'Data & Formulas'}
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

        {/* TOOL 474: Text Diff with Highlights */}
        {activeToolId === 474 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Text & Code Diff Inspector</Text>
              <Text style={styles.label}>Original Text (A)</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={diffTextA}
                placeholder="Paste or type original text (A)..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setDiffTextA}
                multiline
              />
              <Text style={styles.label}>Modified Text (B)</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={diffTextB}
                placeholder="Paste or type modified text (B)..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setDiffTextB}
                multiline
              />

              <View style={styles.diffViewContainer}>
                {!diffTextA && !diffTextB ? (
                  <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                    Enter text in both boxes above to compute line-by-line diff
                  </Text>
                ) : (
                  diffResult.lines.map((ln, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.diffLine,
                        ln.type === 'added' && styles.diffAdded,
                        ln.type === 'removed' && styles.diffRemoved,
                      ]}
                    >
                      <Text
                        style={[
                          styles.diffLineText,
                          ln.type === 'added' && styles.diffTextAdded,
                          ln.type === 'removed' && styles.diffTextRemoved,
                        ]}
                      >
                        {ln.text}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>

            <AdvancedResultCard
              title="Diff Analysis"
              badge="Word-Level Diff"
              primaryValue={diffTextA || diffTextB ? `${diffResult.similarityRatio}% Line Similarity` : 'Enter Text to Compare'}
              primarySubtext={`+${diffResult.additions} Additions • -${diffResult.deletions} Deletions`}
              details={diffTextA || diffTextB ? diffResult.lines.map((l) => l.text).join('\n') : 'No diff to display'}
              metadata={[
                { label: 'Additions', value: `+${diffResult.additions}` },
                { label: 'Deletions', value: `-${diffResult.deletions}` },
                { label: 'Unchanged', value: `${diffResult.unchanged}` },
                { label: 'Similarity', value: `${diffResult.similarityRatio}%` },
              ]}
              copyContent={diffResult.lines.map((l) => l.text).join('\n')}
            />
          </View>
        )}

        {/* TOOL 475: Spreadsheet Formula Helper & 476: Formula Generator */}
        {(activeToolId === 475 || activeToolId === 476) && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {activeToolId === 475 ? 'Spreadsheet Formula Reference' : 'Natural Language Formula Generator'}
              </Text>
              <Text style={styles.label}>Describe Calculation / Objective</Text>
              <TextInput
                style={styles.input}
                value={formulaQuery}
                onChangeText={setFormulaQuery}
                placeholder="e.g. sum revenue if region is North and sales > 500"
                placeholderTextColor={Colors.textTertiary}
              />

              <View style={styles.formulaOutputBox}>
                <Text style={styles.formulaText}>{formulaResult.formula}</Text>
                <Text style={styles.formulaSyntax}>Syntax: {formulaResult.syntax}</Text>
                <Text style={styles.formulaExample}>Example: {formulaResult.example}</Text>
              </View>
            </View>

            <AdvancedResultCard
              title={formulaResult.formula}
              badge="Excel / Google Sheets"
              primaryValue={formulaResult.formula}
              primarySubtext={formulaResult.explanation}
              details={`Syntax: ${formulaResult.syntax}\nExample Usage: ${formulaResult.example}\nDescription: ${formulaResult.explanation}`}
              metadata={[
                { label: 'Applies To', value: 'Excel & Sheets' },
                { label: 'Type', value: 'Spreadsheet Function' },
              ]}
              copyContent={formulaResult.formula}
            />
          </View>
        )}

        {/* TOOL 477: CSV Chart Generator */}
        {activeToolId === 477 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>CSV Data Chart Generator</Text>
              <Text style={styles.label}>CSV Rows (Label, Value)</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={csvInput}
                placeholder="e.g. Q1, 14500\nQ2, 18900\nQ3, 24200"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setCsvInput}
                multiline
              />

              <View style={styles.chartAsciiBox}>
                <Text style={styles.chartAsciiText}>{chartResult.chartAscii}</Text>
              </View>
            </View>

            <AdvancedResultCard
              title="Data Visualization"
              badge="Offline Bar Chart"
              primaryValue={`${chartResult.totalRows} Metrics Visualized`}
              primarySubtext={`Max Value: ${chartResult.maxVal}`}
              details={chartResult.chartAscii}
              metadata={[
                { label: 'Rows', value: `${chartResult.totalRows}` },
                { label: 'Peak Value', value: `${chartResult.maxVal}` },
              ]}
              copyContent={chartResult.chartAscii}
            />
          </View>
        )}

        {/* TOOL 478: Data Cleaning Assistant */}
        {activeToolId === 478 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Tabular Data Cleaning Assistant</Text>
              <Text style={styles.label}>Dirty Tabular / CSV Data</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={dirtyData}
                placeholder="Paste raw tabular data with duplicate or trailing spaces..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setDirtyData}
                multiline
              />

              <View style={styles.cleanSummaryRow}>
                <Text style={styles.cleanSummaryText}>
                  Removed {cleanResult.duplicatesRemoved} duplicate lines • {cleanResult.cleanedLines} clean entries
                </Text>
              </View>
            </View>

            <AdvancedResultCard
              title="Cleaned Dataset"
              badge="Sanitized Table"
              primaryValue={`${cleanResult.cleanedLines} Rows Preserved`}
              primarySubtext={`Eliminated ${cleanResult.duplicatesRemoved} redundant duplicate records`}
              details={cleanResult.cleanedText || 'No clean text'}
              metadata={[
                { label: 'Clean Rows', value: `${cleanResult.cleanedLines}` },
                { label: 'Deduplicated', value: `${cleanResult.duplicatesRemoved}` },
              ]}
              copyContent={cleanResult.cleanedText}
            />
          </View>
        )}

        {/* TOOL 479: Table Extractor */}
        {activeToolId === 479 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Table Extractor</Text>
              <Text style={styles.label}>Raw Markdown / TSV / HTML Table</Text>
              <TextInput
                style={[styles.input, { minHeight: 80 }]}
                value={rawTableInput}
                placeholder="Paste markdown or raw table data..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setRawTableInput}
                multiline
              />
            </View>

            <AdvancedResultCard
              title="Structured Data Grid"
              badge="Table Extraction"
              primaryValue={rawTableInput ? 'Structured Table Data Extracted' : 'Enter Table Data'}
              details={rawTableInput || 'No table content'}
              metadata={[
                { label: 'Format', value: 'Markdown Table' },
                { label: 'Status', value: rawTableInput ? 'Extracted' : 'Idle' },
              ]}
              copyContent={rawTableInput}
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
  diffViewContainer: {
    backgroundColor: '#1E1B4B',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginVertical: Spacing.sm,
  },
  diffLine: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  diffAdded: {
    backgroundColor: '#064E3B',
  },
  diffRemoved: {
    backgroundColor: '#7F1D1D',
  },
  diffLineText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#E0E7FF',
  },
  diffTextAdded: {
    color: '#A7F3D0',
    fontWeight: '700',
  },
  diffTextRemoved: {
    color: '#FECACA',
    textDecorationLine: 'line-through',
  },
  formulaOutputBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  formulaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#581C87',
    fontFamily: 'monospace',
    marginBottom: 6,
  },
  formulaSyntax: {
    fontSize: 12,
    color: '#6B21A8',
    fontWeight: '600',
    marginBottom: 4,
  },
  formulaExample: {
    fontSize: 11,
    color: '#64748B',
    fontFamily: 'monospace',
  },
  chartAsciiBox: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: Spacing.sm,
  },
  chartAsciiText: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#38BDF8',
    lineHeight: 18,
  },
  cleanSummaryRow: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginTop: 4,
  },
  cleanSummaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065F46',
  },
});
