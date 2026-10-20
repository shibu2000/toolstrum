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
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { OFFICE_TOOLS } from './officeConfig';
import { OfficeResultCard } from './shared/OfficeResultCard';
import { OfficeEngine, OfficeExecutionResult } from './shared/OfficeEngine';
import { jsonToCsv, csvToJson } from './shared/OfficeHelpers';

interface OfficeDataInterchangeWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

const SAMPLE_JSON_DATA = `[
  {
    "id": 1,
    "user": "alex_turner",
    "active": true,
    "score": 98.5,
    "location": "San Francisco"
  },
  {
    "id": 2,
    "user": "sarah_connor",
    "active": false,
    "score": 87.2,
    "location": "Los Angeles"
  },
  {
    "id": 3,
    "user": "miles_morales",
    "active": true,
    "score": 95.0,
    "location": "New York"
  }
]`;

const SAMPLE_CSV_DATA = `id,user,active,score,location
1,alex_turner,true,98.5,San Francisco
2,sarah_connor,false,87.2,Los Angeles
3,miles_morales,true,95.0,New York`;

export const OfficeDataInterchangeWorkspace: React.FC<OfficeDataInterchangeWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = OFFICE_TOOLS[selectedToolId] || OFFICE_TOOLS[169];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  const isJsonToCsv = selectedToolId === 169;
  const [inputValue, setInputValue] = useState<string>('');

  const [delimiter, setDelimiter] = useState<',' | '\t' | ';'>(',');
  const [autoCast, setAutoCast] = useState<boolean>(true);

  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OfficeExecutionResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const handleSwitchDirection = (toolId: number) => {
    setSelectedToolId(toolId);
    setInputValue('');
    setResult(null);
  };

  const handleProcess = async () => {
    if (!inputValue.trim()) {
      Alert.alert('Empty Input', 'Please enter input data to convert.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      await new Promise((r) => setTimeout(r, 500));
      let res: OfficeExecutionResult;

      if (isJsonToCsv) {
        let parsed: any;
        try {
          parsed = JSON.parse(inputValue);
        } catch {
          throw new Error('Input is not valid JSON array or object.');
        }
        const arrayData = Array.isArray(parsed) ? parsed : [parsed];
        const csvOut = jsonToCsv(arrayData, delimiter);
        res = await OfficeEngine.saveTextFile(csvOut, 'Data_Export.csv', 'CSV');
        res.metadata = {
          'Records Processed': `${arrayData.length}`,
          'Delimiter': delimiter === '\t' ? 'TAB' : delimiter === ';' ? 'SEMICOLON' : 'COMMA',
        };
      } else {
        const jsonRecords = csvToJson(inputValue, autoCast);
        const jsonStr = JSON.stringify(jsonRecords, null, 2);
        res = await OfficeEngine.saveTextFile(jsonStr, 'Data_Export.json', 'JSON');
        res.metadata = {
          'Rows Parsed': `${jsonRecords.length}`,
          'Type Casting': autoCast ? 'Enabled' : 'Disabled',
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
      Alert.alert('Conversion Error', e?.message || 'Failed to convert interchange payload.');
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
      mimeType: result.format === 'JSON' ? 'application/json' : 'text/csv',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'Data export saved to My Files.');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Office Studio • Tools 169, 170"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(selectedToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OfflineShield studioName="Office Studio" />

        {/* Direction Switcher Pills */}
        <View style={styles.directionRow}>
          <TouchableOpacity
            style={[styles.directionTab, selectedToolId === 169 && styles.directionTabActive]}
            onPress={() => handleSwitchDirection(169)}
          >
            <AppIcon
              name="RefreshCw"
              size={15}
              color={selectedToolId === 169 ? Colors.surfaceWhite : Colors.textMuted}
            />
            <Text
              style={[
                styles.directionTabText,
                selectedToolId === 169 && styles.directionTabTextActive,
              ]}
            >
              JSON to CSV (#169)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.directionTab, selectedToolId === 170 && styles.directionTabActive]}
            onPress={() => handleSwitchDirection(170)}
          >
            <AppIcon
              name="RefreshCw"
              size={15}
              color={selectedToolId === 170 ? Colors.surfaceWhite : Colors.textMuted}
            />
            <Text
              style={[
                styles.directionTabText,
                selectedToolId === 170 && styles.directionTabTextActive,
              ]}
            >
              CSV to JSON (#170)
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.toolDescription}>{toolConfig.description}</Text>

        {/* Source Input Area */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {isJsonToCsv ? 'JSON Source (Array of Objects)' : 'CSV Source (Delimited Records)'}
            </Text>
            <TouchableOpacity onPress={() => setInputValue('')}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={isJsonToCsv ? 'Paste JSON array here...' : 'Paste CSV table here...'}
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Options Card */}
        <View style={styles.card}>
          {isJsonToCsv ? (
            <View>
              <Text style={styles.cardTitle}>Output Delimiter</Text>
              <View style={styles.pillsRow}>
                {[
                  { key: ',', label: 'Comma (,)' },
                  { key: ';', label: 'Semicolon (;)' },
                  { key: '\t', label: 'Tab (TSV)' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.pillBtn, delimiter === item.key && styles.pillBtnActive]}
                    onPress={() => setDelimiter(item.key as any)}
                  >
                    <Text
                      style={[
                        styles.pillBtnText,
                        delimiter === item.key && styles.pillBtnTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setAutoCast(!autoCast)}
            >
              <Text style={styles.toggleLabel}>Auto-cast Numbers and Booleans</Text>
              <View style={[styles.checkbox, autoCast && styles.checkboxActive]}>
                {autoCast && <AppIcon name="Check" size={12} color={Colors.surfaceWhite} />}
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Execute Button */}
        <View style={{ marginBottom: Spacing.md }}>
          <PrimaryButton
            title={isProcessing ? 'Converting Data...' : `Convert to ${isJsonToCsv ? 'CSV' : 'JSON'}`}
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
  directionRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  directionTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  directionTabActive: {
    backgroundColor: Colors.accentIndigo,
    borderColor: Colors.accentIndigo,
  },
  directionTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  directionTabTextActive: {
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
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.statusError,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    height: 180,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#E2E8F0',
    textAlignVertical: 'top',
    lineHeight: 17,
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
