import React, { useState, useMemo } from 'react';
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
import { useAppStore } from '../../../store/useAppStore';
import {
  formatJson,
  validateJson,
  minifyJson,
  diffJson,
  queryJsonPath,
  jsonToTypeScript,
  jsonToSchema,
  jsonToYaml,
  yamlToJson,
  validateYaml,
  validateXml,
  generateMockJson,
} from './shared/DeveloperHelpers';
import { DevResultCard, DevStatItem } from './shared/DevResultCard';
import { getDeveloperToolConfig } from './developerConfig';

interface DevDataFormatsWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_SAMPLE_JSON = `{
  "app": "Toolstrum",
  "version": "1.0.0",
  "developer": {
    "name": "Local Lead",
    "verified": true
  },
  "toolsCount": 500,
  "features": ["pdf", "image", "audio", "video", "office", "text", "developer"]
}`;

const DEFAULT_SAMPLE_DIFF = `{
  "app": "Toolstrum",
  "version": "1.1.0",
  "developer": {
    "name": "Local Lead",
    "verified": true,
    "role": "Core Architect"
  },
  "toolsCount": 500
}`;

export const DevDataFormatsWorkspace: React.FC<DevDataFormatsWorkspaceProps> = ({
  initialToolId = 244,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const [inputData, setInputData] = useState<string>('');
  const [compareData, setCompareData] = useState<string>('');
  const [jsonPathQuery, setJsonPathQuery] = useState<string>('');
  const [mockType, setMockType] = useState<'users' | 'products' | 'orders'>('users');
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getDeveloperToolConfig(activeToolId);

  // Calculate processed output
  const { output, isValid, errorInfo } = useMemo(() => {
    try {
      if (!inputData.trim() && activeToolId !== 295) {
        return { output: '', isValid: true };
      }

      switch (activeToolId) {
        case 244: {
          const res = formatJson(inputData, indentSize);
          return { output: res, isValid: true };
        }
        case 245: {
          const val = validateJson(inputData);
          if (val.valid) {
            return { output: '✅ JSON Syntax is 100% valid and well-formed.', isValid: true };
          }
          return {
            output: `❌ JSON Syntax Error:\n${val.error}\nLine: ${val.line}, Column: ${val.column}`,
            isValid: false,
            errorInfo: val.error,
          };
        }
        case 246: {
          const res = minifyJson(inputData);
          return { output: res, isValid: true };
        }
        case 247: {
          const diffs = diffJson(inputData, compareData);
          const formatted =
            diffs.length > 0
              ? diffs
                  .map(
                    (d) =>
                      `[${d.change.toUpperCase()}] ${d.path}${
                        d.change === 'modified'
                          ? `\n  - Old: ${JSON.stringify(d.valA)}\n  + New: ${JSON.stringify(d.valB)}`
                          : d.change === 'added'
                          ? ` = ${JSON.stringify(d.valB)}`
                          : ` (was: ${JSON.stringify(d.valA)})`
                      }`
                  )
                  .join('\n\n')
              : 'No structural differences found between objects.';
          return { output: formatted, isValid: true };
        }
        case 248: {
          const qRes = queryJsonPath(inputData, jsonPathQuery);
          return {
            output: qRes !== undefined ? JSON.stringify(qRes, null, 2) : 'Query returned undefined',
            isValid: true,
          };
        }
        case 249: {
          const ts = jsonToTypeScript(inputData, 'GeneratedPayload');
          return { output: ts, isValid: true };
        }
        case 250: {
          const schema = jsonToSchema(inputData);
          return { output: schema, isValid: true };
        }
        case 251: {
          const yaml = jsonToYaml(inputData);
          return { output: yaml, isValid: true };
        }
        case 252: {
          const val = validateYaml(inputData);
          return {
            output: val.valid ? '✅ YAML document structure is valid.' : `❌ YAML Error: ${val.error}`,
            isValid: val.valid,
          };
        }
        case 253: {
          const json = yamlToJson(inputData);
          return { output: json, isValid: true };
        }
        case 254: {
          const yaml = jsonToYaml(inputData);
          return { output: yaml, isValid: true };
        }
        case 255: {
          const val = validateXml(inputData);
          return {
            output: val.valid
              ? `✅ XML syntax valid (${val.nodes} tags audited).`
              : `❌ XML Error: ${val.error}`,
            isValid: val.valid,
          };
        }
        case 295: {
          const mock = generateMockJson(mockType, 4);
          return { output: mock, isValid: true };
        }
        default:
          return { output: inputData, isValid: true };
      }
    } catch (err: any) {
      return {
        output: `Error processing input: ${err?.message || 'Syntax parsing error'}`,
        isValid: false,
        errorInfo: err?.message,
      };
    }
  }, [activeToolId, inputData, compareData, jsonPathQuery, mockType, indentSize]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Generated data structure saved to local files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Data Format'} Output`,
      subtitle: `${output.length} characters generated`,
    });
  };

  const statItems: DevStatItem[] = [
    { label: 'Status', value: isValid ? 'VALID' : 'ERROR' },
    { label: 'Input Length', value: inputData.length },
    { label: 'Output Length', value: output.length },
    { label: 'Lines', value: output.split('\n').length },
  ];

  const toolsInWorkspace = [
    { id: 244, name: 'JSON Format' },
    { id: 245, name: 'Validate' },
    { id: 246, name: 'Minify' },
    { id: 247, name: 'Diff' },
    { id: 248, name: 'JSONPath' },
    { id: 249, name: 'TypeScript' },
    { id: 250, name: 'Schema' },
    { id: 251, name: 'YAML Format' },
    { id: 252, name: 'YAML Valid' },
    { id: 253, name: 'YAML to JSON' },
    { id: 254, name: 'JSON to YAML' },
    { id: 255, name: 'XML Valid' },
    { id: 295, name: 'Mock JSON' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Data Formats & Schemas'}
        subtitle="Developer Tools · Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(activeToolId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon
              name="star"
              size={22}
              color={favorited ? Colors.statusWarning : Colors.textMuted}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield />

        {/* Workspace tool selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillContainer}
        >
          {toolsInWorkspace.map((item) => {
            const isActive = item.id === activeToolId;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveToolId(item.id)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Indent Controls (Tool 244) */}
        {activeToolId === 244 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Indentation:</Text>
            {[2, 4].map((n) => (
              <TouchableOpacity
                key={n}
                style={[styles.smallPill, indentSize === n && styles.smallPillActive]}
                onPress={() => setIndentSize(n as any)}
              >
                <Text
                  style={[styles.smallPillText, indentSize === n && styles.smallPillTextActive]}
                >
                  {n} Spaces
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* JSONPath Query Bar (Tool 248) */}
        {activeToolId === 248 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>JSONPath Expression</Text>
            <TextInput
              style={styles.singleInput}
              value={jsonPathQuery}
              onChangeText={setJsonPathQuery}
              placeholder="e.g. $.developer.name or $.features[0]"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* Mock JSON Mode Bar (Tool 295) */}
        {activeToolId === 295 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Mock Entity:</Text>
            {(['users', 'products', 'orders'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.smallPill, mockType === m && styles.smallPillActive]}
                onPress={() => setMockType(m)}
              >
                <Text style={[styles.smallPillText, mockType === m && styles.smallPillTextActive]}>
                  {m.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input Card */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.sectionTitle}>
              {activeToolId === 253 ? 'YAML Input Document' : 'Input Document / Payload'}
            </Text>
            <View style={styles.inputHeaderActions}>
              <TouchableOpacity
                onPress={() => setInputData(DEFAULT_SAMPLE_JSON)}
                style={styles.actionChip}
              >
                <Text style={styles.actionChipText}>Sample</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setInputData('')}
                style={[styles.actionChip, { backgroundColor: '#FEE2E2' }]}
              >
                <Text style={[styles.actionChipText, { color: Colors.statusError }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            multiline
            value={inputData}
            onChangeText={setInputData}
            placeholder="Enter JSON, YAML, or XML..."
            placeholderTextColor={Colors.textMuted}
            textAlignVertical="top"
          />
        </View>

        {/* Compare Payload for Diff (Tool 247) */}
        {activeToolId === 247 && (
          <View style={[styles.inputCard, { marginTop: Spacing.sm }]}>
            <Text style={styles.sectionTitle}>Comparison JSON Payload</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={compareData}
              onChangeText={setCompareData}
              placeholder="Second JSON object to compare..."
              placeholderTextColor={Colors.textMuted}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Result Card */}
        <DevResultCard
          title={toolConfig?.name || 'Output Result'}
          subtitle={toolConfig?.description}
          badgeText={isValid ? 'Parsed Successfully' : 'Syntax Check Failed'}
          stats={statItems}
          content={output}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="data-output.json"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  favBtn: {
    padding: 6,
  },
  pillScroll: {
    marginBottom: Spacing.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillActive: {
    backgroundColor: Colors.accentSky,
    borderColor: Colors.accentSky,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  pillTextActive: {
    color: Colors.surfaceWhite,
  },
  subBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  subBarLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  smallPillActive: {
    backgroundColor: Colors.accentSky,
    borderColor: Colors.accentSky,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  smallPillTextActive: {
    color: Colors.surfaceWhite,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  singleInput: {
    height: 38,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Colors.onSurface,
    backgroundColor: '#FAFAFA',
  },
  inputCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  inputCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  inputHeaderActions: {
    flexDirection: 'row',
    gap: 6,
  },
  actionChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: Colors.surfaceDeveloper,
    borderRadius: Radius.sm,
  },
  actionChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentSky,
  },
  textInput: {
    minHeight: 120,
    fontSize: 13,
    fontFamily: 'Courier',
    color: Colors.onSurface,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
});
