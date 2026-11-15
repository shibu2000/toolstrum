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
  getJsonMinifyStats,
  diffJson,
  diffJsonPatch,
  queryJsonPath,
  jsonToTypeScript,
  jsonToTypeModel,
  jsonToSchema,
  jsonToYaml,
  formatYaml,
  autoRepairYaml,
  yamlToJson,
  validateYaml,
  validateXml,
  generateMockJson,
  autoRepairJson,
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
  const [sortKeys, setSortKeys] = useState<boolean>(false);
  const [minifyFormat, setMinifyFormat] = useState<'raw' | 'curl' | 'url' | 'base64'>('raw');
  const [removeNulls, setRemoveNulls] = useState<boolean>(false);
  const [escapeQuotes, setEscapeQuotes] = useState<boolean>(false);
  const [diffFormat, setDiffFormat] = useState<'list' | 'patch'>('list');
  const [targetTypeLang, setTargetTypeLang] = useState<'typescript' | 'zod' | 'go' | 'rust' | 'python'>('typescript');
  const [schemaDraft, setSchemaDraft] = useState<'draft-07' | 'draft-04' | '2020-12'>('draft-07');
  const [detectFormats, setDetectFormats] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getDeveloperToolConfig(activeToolId);

  // Check if input can be auto-repaired
  const canRepair = useMemo(() => {
    if (!inputData.trim()) return false;
    if (activeToolId === 251 || activeToolId === 252 || activeToolId === 253) {
      return inputData.includes('\t') || /^(\s*[\w.-]+):([^\s\n/])/gm.test(inputData);
    }
    try {
      JSON.parse(inputData);
      return false;
    } catch {
      try {
        const { repaired } = autoRepairJson(inputData);
        JSON.parse(repaired);
        return true;
      } catch {
        return false;
      }
    }
  }, [activeToolId, inputData]);

  // Calculate processed output
  const { output, isValid, errorInfo } = useMemo(() => {
    try {
      if (!inputData.trim() && activeToolId !== 295) {
        return { output: '', isValid: true };
      }

      switch (activeToolId) {
        case 244: {
          const res = formatJson(inputData, indentSize, sortKeys);
          return { output: res, isValid: true };
        }
        case 245: {
          const val = validateJson(inputData);
          if (val.valid) {
            let msg = '✅ JSON Syntax is 100% valid and complies with RFC 8259.';
            if (val.duplicates && val.duplicates.length > 0) {
              msg += `\n\n⚠️ Warning: Duplicate keys found (${val.duplicates.join(', ')}).`;
            }
            if (val.securityRisks && val.securityRisks.length > 0) {
              msg += `\n\n🛡️ Security Inspection:\n${val.securityRisks.map(r => `• ${r}`).join('\n')}`;
            }
            return { output: msg, isValid: true };
          }
          return {
            output: `❌ JSON Syntax Error:\n${val.error}\nLine: ${val.line}, Column: ${val.column}`,
            isValid: false,
            errorInfo: val.error,
          };
        }
        case 246: {
          const res = minifyJson(inputData, {
            format: minifyFormat,
            removeNulls,
            escapeQuotes,
          });
          return { output: res, isValid: true };
        }
        case 247: {
          if (!compareData.trim()) {
            return {
              output: 'Please provide both the original JSON payload and the comparison JSON payload above.',
              isValid: true,
            };
          }
          if (diffFormat === 'patch') {
            const patch = diffJsonPatch(inputData, compareData);
            return {
              output: JSON.stringify(patch, null, 2),
              isValid: true,
            };
          }
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
              : '✅ No structural differences found. Both objects are 100% identical.';
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
          const ts = jsonToTypeModel(inputData, targetTypeLang, 'GeneratedPayload');
          return { output: ts, isValid: true };
        }
        case 250: {
          const schema = jsonToSchema(inputData, {
            draft: schemaDraft,
            detectFormats,
          });
          return { output: schema, isValid: true };
        }
        case 251: {
          const yaml = formatYaml(inputData, indentSize, sortKeys);
          return { output: yaml, isValid: true };
        }
        case 252: {
          const val = validateYaml(inputData);
          if (val.valid) {
            let msg = '✅ YAML document structure is 100% valid.';
            if (val.warnings && val.warnings.length > 0) {
              msg += `\n\n⚠️ Warnings:\n${val.warnings.map((w) => `• ${w}`).join('\n')}`;
            }
            if (val.securityRisks && val.securityRisks.length > 0) {
              msg += `\n\n🛡️ Security Inspection:\n${val.securityRisks.map((r) => `• ${r}`).join('\n')}`;
            }
            return { output: msg, isValid: true };
          }
          let err = `❌ YAML Syntax Error:\n${val.error}`;
          if (val.line) err += `\nLine: ${val.line}, Column: ${val.column || 1}`;
          return {
            output: err,
            isValid: false,
            errorInfo: val.error,
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
  }, [activeToolId, inputData, compareData, jsonPathQuery, mockType, indentSize, sortKeys, minifyFormat, removeNulls, escapeQuotes, diffFormat, targetTypeLang, schemaDraft, detectFormats]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Generated data structure saved to local files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Data Format'} Output`,
      subtitle: `${output.length} characters generated`,
    });
  };

  const statItems: DevStatItem[] = useMemo(() => {
    const base: DevStatItem[] = [
      { label: 'Status', value: isValid ? 'VALID' : 'ERROR' },
      { label: 'Input Length', value: inputData.length },
      { label: 'Output Length', value: output.length },
      { label: 'Lines', value: output.split('\n').length },
    ];
    if (activeToolId === 246 && isValid && inputData.trim()) {
      const stats = getJsonMinifyStats(inputData, output);
      return [
        { label: 'Raw Bytes', value: `${stats.rawBytes} B` },
        { label: 'Minified', value: `${stats.minifiedBytes} B` },
        { label: 'Reduced', value: `${stats.savingsPct}%` },
        { label: 'Status', value: 'OPTIMAL' },
      ];
    }
    if (activeToolId === 247 && isValid && inputData.trim() && compareData.trim()) {
      try {
        const diffs = diffJson(inputData, compareData);
        const added = diffs.filter((d) => d.change === 'added').length;
        const removed = diffs.filter((d) => d.change === 'removed').length;
        const modified = diffs.filter((d) => d.change === 'modified').length;
        return [
          { label: 'Added', value: `+${added}` },
          { label: 'Removed', value: `-${removed}` },
          { label: 'Modified', value: `~${modified}` },
          { label: 'Total Diffs', value: diffs.length },
        ];
      } catch {}
    }
    if (activeToolId === 248 && isValid && inputData.trim()) {
      const isFound = output !== 'Query returned undefined';
      return [
        { label: 'Expression', value: jsonPathQuery || '$' },
        { label: 'Result', value: isFound ? 'MATCH' : 'EMPTY' },
        { label: 'Lines', value: output.split('\n').length },
        { label: 'Status', value: isValid ? 'OK' : 'ERROR' },
      ];
    }
    if (activeToolId === 249 && isValid && inputData.trim()) {
      return [
        { label: 'Language', value: targetTypeLang.toUpperCase() },
        { label: 'Root Model', value: 'GeneratedPayload' },
        { label: 'Lines', value: output.split('\n').length },
        { label: 'Status', value: 'TYPED' },
      ];
    }
    if (activeToolId === 250 && isValid && inputData.trim()) {
      return [
        { label: 'Draft', value: schemaDraft.toUpperCase() },
        { label: 'Formats', value: detectFormats ? 'AUTO' : 'OFF' },
        { label: 'Lines', value: output.split('\n').length },
        { label: 'Status', value: 'SYNTHESIZED' },
      ];
    }
    if (activeToolId === 252 && inputData.trim()) {
      return [
        { label: 'Status', value: isValid ? 'VALID' : 'INVALID' },
        { label: 'Lines', value: inputData.split('\n').length },
        { label: 'Safety', value: output.includes('🛡️') ? 'ALERT' : 'SAFE' },
        { label: 'Checks', value: '4 AUDITS' },
      ];
    }
    return base;
  }, [activeToolId, isValid, inputData, compareData, output, targetTypeLang, schemaDraft, detectFormats]);

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

        {/* Indent & Sort Controls (Tool 244) */}
        {activeToolId === 244 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Format:</Text>
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
            <TouchableOpacity
              style={[styles.smallPill, sortKeys && styles.smallPillActive]}
              onPress={() => setSortKeys(!sortKeys)}
            >
              <Text style={[styles.smallPillText, sortKeys && styles.smallPillTextActive]}>
                Sort A-Z
              </Text>
            </TouchableOpacity>

            {canRepair && (
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: '#F59E0B' }]}
                onPress={() => {
                  try {
                    const { repaired } = autoRepairJson(inputData);
                    setInputData(repaired);
                    Alert.alert('Auto-Repair Applied', 'Cleaned quotes and normalized syntax.');
                  } catch (e: any) {
                    Alert.alert('Repair Failed', e?.message || 'Could not auto-repair.');
                  }
                }}
              >
                <Text style={[styles.smallPillText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  ⚡ Auto-Repair
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Minifier Controls (Tool 246) */}
        {activeToolId === 246 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Format:</Text>
            {(['raw', 'curl', 'url', 'base64'] as const).map((fmt) => (
              <TouchableOpacity
                key={fmt}
                style={[styles.smallPill, minifyFormat === fmt && styles.smallPillActive]}
                onPress={() => setMinifyFormat(fmt)}
              >
                <Text
                  style={[styles.smallPillText, minifyFormat === fmt && styles.smallPillTextActive]}
                >
                  {fmt === 'raw' ? 'Minified' : fmt.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.smallPill, removeNulls && styles.smallPillActive]}
              onPress={() => setRemoveNulls(!removeNulls)}
            >
              <Text style={[styles.smallPillText, removeNulls && styles.smallPillTextActive]}>
                Strip Nulls
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.smallPill, escapeQuotes && styles.smallPillActive]}
              onPress={() => setEscapeQuotes(!escapeQuotes)}
            >
              <Text style={[styles.smallPillText, escapeQuotes && styles.smallPillTextActive]}>
                Escape "
              </Text>
            </TouchableOpacity>

            {canRepair && (
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: '#F59E0B' }]}
                onPress={() => {
                  try {
                    const { repaired } = autoRepairJson(inputData);
                    setInputData(repaired);
                    Alert.alert('Auto-Repair Applied', 'Cleaned quotes and normalized syntax.');
                  } catch (e: any) {
                    Alert.alert('Repair Failed', e?.message || 'Could not auto-repair.');
                  }
                }}
              >
                <Text style={[styles.smallPillText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  ⚡ Auto-Repair
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Diff Controls (Tool 247) */}
        {activeToolId === 247 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>View:</Text>
            {(['list', 'patch'] as const).map((fmt) => (
              <TouchableOpacity
                key={fmt}
                style={[styles.smallPill, diffFormat === fmt && styles.smallPillActive]}
                onPress={() => setDiffFormat(fmt)}
              >
                <Text
                  style={[styles.smallPillText, diffFormat === fmt && styles.smallPillTextActive]}
                >
                  {fmt === 'list' ? 'Changes List' : 'RFC 6902 Patch'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.smallPill}
              onPress={() => {
                const tmp = inputData;
                setInputData(compareData);
                setCompareData(tmp);
              }}
            >
              <Text style={styles.smallPillText}>⇄ Swap A/B</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.smallPill}
              onPress={() => {
                setInputData(
                  JSON.stringify(
                    { app: 'Toolstrum', version: '1.0.0', config: { debug: true, maxUsers: 50 } },
                    null,
                    2
                  )
                );
                setCompareData(
                  JSON.stringify(
                    { app: 'Toolstrum', version: '2.0.0', config: { debug: false, maxUsers: 500, ssl: true } },
                    null,
                    2
                  )
                );
              }}
            >
              <Text style={styles.smallPillText}>Sample Diffs</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* JSONPath Query Bar (Tool 248) */}
        {activeToolId === 248 && (
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={styles.cardTitle}>JSONPath Expression</Text>
              <TouchableOpacity
                onPress={() => {
                  setInputData(
                    JSON.stringify(
                      {
                        store: {
                          books: [
                            { title: 'The Pragmatic Programmer', author: 'Andy Hunt', price: 29.99 },
                            { title: 'Clean Architecture', author: 'Robert Martin', price: 24.50 },
                            { title: 'Designing Data-Intensive Apps', author: 'Martin Kleppmann', price: 34.00 }
                          ],
                          currency: 'USD'
                        }
                      },
                      null,
                      2
                    )
                  );
                  setJsonPathQuery('$.store.books[*].author');
                }}
              >
                <Text style={{ fontSize: 11, color: Colors.primary, fontWeight: '600' }}>Load Store Sample</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.singleInput}
              value={jsonPathQuery}
              onChangeText={setJsonPathQuery}
              placeholder="e.g. $.developer.name or $.store.books[*].author"
              placeholderTextColor={Colors.textMuted}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[
                  { label: 'Root ($)', q: '$' },
                  { label: 'All Items [*]', q: '$.store.books[*]' },
                  { label: 'Authors', q: '$.store.books[*].author' },
                  { label: 'Deep Prices', q: '$..price' },
                  { label: 'First [0]', q: '$.store.books[0]' },
                  { label: 'Last [-1]', q: '$.store.books[-1]' },
                  { label: 'Price < 30', q: '$.store.books[?(@.price < 30)]' }
                ].map((item) => (
                  <TouchableOpacity
                    key={item.label}
                    style={[styles.smallPill, jsonPathQuery === item.q && styles.smallPillActive]}
                    onPress={() => setJsonPathQuery(item.q)}
                  >
                    <Text style={[styles.smallPillText, jsonPathQuery === item.q && styles.smallPillTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        )}

        {/* Language Target Bar (Tool 249) */}
        {activeToolId === 249 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Target:</Text>
            {(['typescript', 'zod', 'go', 'rust', 'python'] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[styles.smallPill, targetTypeLang === lang && styles.smallPillActive]}
                onPress={() => setTargetTypeLang(lang)}
              >
                <Text
                  style={[styles.smallPillText, targetTypeLang === lang && styles.smallPillTextActive]}
                >
                  {lang === 'typescript' ? 'TS' : lang.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Schema Controls (Tool 250) */}
        {activeToolId === 250 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Draft:</Text>
            {(['draft-07', '2020-12', 'draft-04'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.smallPill, schemaDraft === d && styles.smallPillActive]}
                onPress={() => setSchemaDraft(d)}
              >
                <Text
                  style={[styles.smallPillText, schemaDraft === d && styles.smallPillTextActive]}
                >
                  {d === 'draft-07' ? 'Draft-07' : d === '2020-12' ? '2020-12' : 'Draft-04'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.smallPill, detectFormats && styles.smallPillActive]}
              onPress={() => setDetectFormats(!detectFormats)}
            >
              <Text style={[styles.smallPillText, detectFormats && styles.smallPillTextActive]}>
                Auto-Formats
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* YAML Formatter Controls (Tool 251) */}
        {activeToolId === 251 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Format:</Text>
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
            <TouchableOpacity
              style={[styles.smallPill, sortKeys && styles.smallPillActive]}
              onPress={() => setSortKeys(!sortKeys)}
            >
              <Text style={[styles.smallPillText, sortKeys && styles.smallPillTextActive]}>
                Sort A-Z
              </Text>
            </TouchableOpacity>

            {canRepair && (
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: '#F59E0B' }]}
                onPress={() => {
                  const { repaired } = autoRepairYaml(inputData);
                  setInputData(repaired);
                  Alert.alert('Auto-Repair Applied', 'Replaced forbidden tabs with spaces.');
                }}
              >
                <Text style={[styles.smallPillText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  ⚡ Repair Tabs
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* YAML Validator Controls (Tool 252) */}
        {activeToolId === 252 && (
          <View style={styles.subBar}>
            <Text style={styles.subBarLabel}>Audit:</Text>
            <TouchableOpacity
              style={styles.smallPill}
              onPress={() => {
                setInputData(
                  `apiVersion: v1\nkind: Service\nmetadata:\n  name: toolstrum-api\nspec:\n  type: ClusterIP\n  ports:\n  - port: 443\n    targetPort: 8443`
                );
              }}
            >
              <Text style={styles.smallPillText}>Sample Valid Spec</Text>
            </TouchableOpacity>

            {canRepair && (
              <TouchableOpacity
                style={[styles.smallPill, { backgroundColor: '#F59E0B' }]}
                onPress={() => {
                  const { repaired } = autoRepairYaml(inputData);
                  setInputData(repaired);
                  Alert.alert('Auto-Repair Applied', 'Replaced forbidden tabs with spaces.');
                }}
              >
                <Text style={[styles.smallPillText, { color: '#FFFFFF', fontWeight: '700' }]}>
                  ⚡ Repair Tabs
                </Text>
              </TouchableOpacity>
            )}
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
