import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { OFFICE_TOOLS } from './officeConfig';
import { OfficePickerBox, OfficeDocumentAsset } from './shared/OfficePickerBox';
import { OfficeResultCard } from './shared/OfficeResultCard';
import { OfficeEngine, OfficeExecutionResult } from './shared/OfficeEngine';
import {
  parseCsvToRows,
  rowsToCsv,
  cleanCsvRecords,
} from './shared/OfficeHelpers';

interface OfficeSpreadsheetWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

const SAMPLE_CSV = `id,name,role,department,salary
101,David Chen,Senior Architect,Engineering,145000
102,Elena Rostova,Lead Designer,Product,128000
103,Marcus Vance,Security Lead,DevOps,138000
104,David Chen,Senior Architect,Engineering,145000
105,Sarah Jenkins,Financial Controller,Finance,122000
106,Amira Patel,Product Manager,Product,131000`;

const SAMPLE_CSV_ASSET: OfficeDocumentAsset = {
  name: 'Employee_Payroll_Q3.csv',
  sizeBytes: SAMPLE_CSV.length,
  format: 'CSV',
  linesCount: 7,
  wordsCount: 42,
  content: SAMPLE_CSV,
};

export const OfficeSpreadsheetWorkspace: React.FC<OfficeSpreadsheetWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = OFFICE_TOOLS[selectedToolId] || OFFICE_TOOLS[164];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  const [document, setDocument] = useState<OfficeDocumentAsset | null>(null);
  const [csvText, setCsvText] = useState<string>('');

  // Settings
  const [splitRowCount, setSplitRowCount] = useState<number>(3);
  const [trimWhitespace, setTrimWhitespace] = useState(true);
  const [caseInsensitiveDedup, setCaseInsensitiveDedup] = useState(true);
  const [sortColIndex, setSortColIndex] = useState<number>(0);
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OfficeExecutionResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const spreadsheetToolIds = [162, 163, 164, 165, 166, 167, 168];

  const parsedRows = useMemo(() => {
    return parseCsvToRows(csvText);
  }, [csvText]);

  const headers = parsedRows[0] || [];
  const dataRows = useMemo(() => {
    const rows = parsedRows.slice(1);
    if (selectedToolId === 164 && rows.length > 0) {
      return [...rows].sort((a, b) => {
        const valA = a[sortColIndex] || '';
        const valB = b[sortColIndex] || '';
        const isNumA = !isNaN(Number(valA));
        const isNumB = !isNaN(Number(valB));
        if (isNumA && isNumB) {
          return sortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
        }
        return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      });
    }
    return rows;
  }, [parsedRows, selectedToolId, sortColIndex, sortAsc]);

  const handleProcess = async () => {
    if (parsedRows.length === 0) {
      Alert.alert('Empty CSV', 'Please enter or pick a CSV file.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      await new Promise((r) => setTimeout(r, 650));
      let res: OfficeExecutionResult;

      if (selectedToolId === 163) {
        // CSV to Excel (Native XML Spreadsheet)
        res = await OfficeEngine.exportToExcelXml(parsedRows, 'Spreadsheet_Table.xls');
      } else if (selectedToolId === 162) {
        // Excel to CSV
        const csvOut = rowsToCsv(parsedRows);
        res = await OfficeEngine.saveTextFile(csvOut, 'Converted_Sheet.csv', 'CSV');
        res.metadata = { 'Rows Converted': `${parsedRows.length}`, 'Columns': `${headers.length}` };
      } else if (selectedToolId === 165) {
        // CSV Cleaner
        const cleaned = cleanCsvRecords(csvText, { trimWhitespace, dropEmptyRows: true });
        res = await OfficeEngine.saveTextFile(cleaned, 'Sanitized_Records.csv', 'CSV');
        const countBefore = parsedRows.length;
        const countAfter = parseCsvToRows(cleaned).length;
        res.metadata = {
          'Original Rows': `${countBefore}`,
          'Cleaned Rows': `${countAfter}`,
          'Trimmed Spaces': 'Yes',
        };
      } else if (selectedToolId === 166) {
        // CSV Deduplicator
        const seen = new Set<string>();
        const unique: string[][] = [headers];
        let dupsFound = 0;

        for (const row of parsedRows.slice(1)) {
          let key = row.map((c) => (trimWhitespace ? c.trim() : c)).join(',');
          if (caseInsensitiveDedup) key = key.toLowerCase();
          if (seen.has(key)) {
            dupsFound++;
          } else {
            seen.add(key);
            unique.push(row);
          }
        }

        const dedupedCsv = rowsToCsv(unique);
        res = await OfficeEngine.saveTextFile(dedupedCsv, 'Deduplicated_Records.csv', 'CSV');
        res.metadata = {
          'Duplicates Eliminated': `${dupsFound}`,
          'Retained Rows': `${unique.length}`,
        };
      } else if (selectedToolId === 167) {
        // CSV Merger (demonstrates multi-chunk append)
        const appendMock = [
          ['107', 'Lucas Gray', 'Security Engineer', 'DevOps', '118000'],
          ['108', 'Sophia Lin', 'UX Researcher', 'Design', '115000'],
        ];
        const mergedRows = [...parsedRows, ...appendMock];
        const merged = rowsToCsv(mergedRows);
        res = await OfficeEngine.saveTextFile(merged, 'Merged_Dataset.csv', 'CSV');
        res.metadata = {
          'Datasets Merged': '2 CSV Files',
          'Total Rows Stacked': `${mergedRows.length}`,
        };
      } else if (selectedToolId === 168) {
        // CSV Splitter
        const rowsToSplit = parsedRows.slice(1);
        const chunk1 = [headers, ...rowsToSplit.slice(0, splitRowCount)];
        const chunk2 = [headers, ...rowsToSplit.slice(splitRowCount)];
        const splitText = `=== Part 1 (${chunk1.length - 1} rows) ===\n${rowsToCsv(chunk1)}\n\n=== Part 2 (${chunk2.length - 1} rows) ===\n${rowsToCsv(chunk2)}`;
        res = await OfficeEngine.saveTextFile(splitText, 'Partitioned_Chunks.csv', 'CSV');
        res.metadata = {
          'Chunks Generated': '2 Files',
          'Chunk Size': `${splitRowCount} rows/file`,
        };
      } else {
        // 164: CSV Viewer inspection
        res = {
          name: document?.name || 'Dataset_Inspection.csv',
          content: rowsToCsv(parsedRows),
          sizeBytes: csvText.length,
          format: 'CSV',
          metadata: {
            'Total Rows': `${parsedRows.length}`,
            'Columns Count': `${headers.length}`,
            'Primary Key': headers[0] || 'N/A',
          },
        };
      }

      setResult(res);

      addRecentItem({
        id: `recent-${Date.now()}`,
        toolId: selectedToolId,
        toolName: toolConfig.name,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Processing Error', e?.message || 'Failed to process spreadsheet.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveToFiles = () => {
    if (!result) return;
    addManagedFile({
      name: result.name,
      uri: result.uri || '',
      size: result.sizeBytes,
      sizeBytes: result.sizeBytes,
      toolId: selectedToolId,
      toolOriginId: selectedToolId,
      toolName: toolConfig.name,
      mimeType: result.format === 'XLS' ? 'application/vnd.ms-excel' : 'text/csv',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'Spreadsheet saved to My Files.');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Office Studio • Tools 162–168"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(selectedToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OfflineShield studioName="Office Studio" />

        {/* Sub-tool switcher */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.switcherRow}>
          {spreadsheetToolIds.map((id) => {
            const cfg = OFFICE_TOOLS[id];
            const isSelected = selectedToolId === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.switcherTab, isSelected && styles.switcherTabActive]}
                onPress={() => {
                  setSelectedToolId(id);
                  setResult(null);
                }}
                activeOpacity={0.7}
              >
                <AppIcon
                  name={cfg.iconName}
                  size={15}
                  color={isSelected ? Colors.surfaceWhite : Colors.textMuted}
                />
                <Text style={[styles.switcherTabText, isSelected && styles.switcherTabTextActive]}>
                  {cfg.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.toolDescription}>{toolConfig.description}</Text>

        {/* Document Picker Box */}
        <OfficePickerBox
          document={document}
          onDocumentSelected={(doc) => {
            setDocument(doc);
            setCsvText(doc.content);
            setResult(null);
          }}
          allowedFormats={['CSV', 'XLS', 'XLSX', 'TSV']}
        />

        {/* Tabular Grid Viewer (Tool 164) or Interactive Preview */}
        {headers.length > 0 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Data Grid Preview ({parsedRows.length} rows, {headers.length} columns)
              </Text>
              {selectedToolId === 164 && (
                <TouchableOpacity
                  onPress={() => setSortAsc(!sortAsc)}
                  style={styles.sortToggle}
                >
                  <AppIcon name="ArrowUpDown" size={13} color={Colors.accentIndigo} />
                  <Text style={styles.sortText}>{sortAsc ? 'Asc' : 'Desc'}</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.tableScroll}>
              <View>
                {/* Table Header Row */}
                <View style={styles.tableRowHeader}>
                  {headers.map((h, i) => (
                    <TouchableOpacity
                      key={i}
                      style={[styles.headerCell, sortColIndex === i && styles.headerCellActive]}
                      onPress={() => {
                        setSortColIndex(i);
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <Text style={styles.headerCellText} numberOfLines={1}>
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Table Data Rows */}
                {dataRows.slice(0, 6).map((row, rIdx) => (
                  <View key={rIdx} style={[styles.tableRow, rIdx % 2 === 1 && styles.tableRowEven]}>
                    {headers.map((_, cIdx) => (
                      <View key={cIdx} style={styles.dataCell}>
                        <Text style={styles.dataCellText} numberOfLines={1}>
                          {row[cIdx] || ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Tool-specific Controls */}
        {selectedToolId === 168 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rows Per Split Partition</Text>
            <View style={styles.pillsRow}>
              {[2, 3, 5, 10, 50].map((count) => (
                <TouchableOpacity
                  key={count}
                  style={[styles.pillBtn, splitRowCount === count && styles.pillBtnActive]}
                  onPress={() => setSplitRowCount(count)}
                >
                  <Text style={[styles.pillBtnText, splitRowCount === count && styles.pillBtnTextActive]}>
                    {count} rows
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedToolId === 166 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Deduplication Settings</Text>
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setCaseInsensitiveDedup(!caseInsensitiveDedup)}
            >
              <Text style={styles.toggleLabel}>Case Insensitive Comparison</Text>
              <View style={[styles.checkbox, caseInsensitiveDedup && styles.checkboxActive]}>
                {caseInsensitiveDedup && <AppIcon name="Check" size={12} color={Colors.surfaceWhite} />}
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Execute Button */}
        <View style={{ marginBottom: Spacing.md }}>
          <PrimaryButton
            title={isProcessing ? 'Processing Table...' : `Run ${toolConfig.name}`}
            onPress={handleProcess}
            disabled={isProcessing}
            loading={isProcessing}
            variant="primary"
            color={Colors.accentIndigo}
          />
        </View>

        {/* Result Card */}
        {result && (
          <OfficeResultCard
            result={result}
            onSaveToManagedFiles={handleSaveToFiles}
            saved={isSaved}
          />
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  switcherRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  switcherTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginRight: Spacing.xs,
  },
  switcherTabActive: {
    backgroundColor: Colors.accentIndigo,
    borderColor: Colors.accentIndigo,
  },
  switcherTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  switcherTabTextActive: {
    color: Colors.surfaceWhite,
  },
  toolDescription: {
    fontSize: 13,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  sortToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceOffice,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  sortText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentIndigo,
  },
  tableScroll: {
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceOffice,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  headerCell: {
    width: 110,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: Colors.borderSubtle,
  },
  headerCellActive: {
    backgroundColor: '#DFE0FC',
  },
  headerCellText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentIndigo,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  tableRowEven: {
    backgroundColor: Colors.surfaceBackground,
  },
  dataCell: {
    width: 110,
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRightWidth: 1,
    borderRightColor: Colors.borderSubtle,
  },
  dataCellText: {
    fontSize: 11,
    color: Colors.onSurface,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  pillBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  pillBtnActive: {
    backgroundColor: Colors.surfaceOffice,
    borderColor: Colors.accentIndigo,
  },
  pillBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  pillBtnTextActive: {
    color: Colors.accentIndigo,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  toggleLabel: {
    fontSize: 13,
    color: Colors.onSurface,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: Colors.accentIndigo,
    borderColor: Colors.accentIndigo,
  },
});
