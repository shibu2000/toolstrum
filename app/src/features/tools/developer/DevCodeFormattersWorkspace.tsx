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
  formatHtml,
  minifyHtml,
  formatCss,
  minifyCss,
  formatJs,
  minifyJs,
  formatSql,
  minifySql,
  explainSql,
  formatMarkdownCode,
  generateSqlInserts,
} from './shared/DeveloperHelpers';
import { DevResultCard, DevStatItem } from './shared/DevResultCard';
import { getDeveloperToolConfig } from './developerConfig';

interface DevCodeFormattersWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_SAMPLE_SQL = `SELECT u.id, u.username, count(o.id) as total_orders FROM users u LEFT JOIN orders o ON u.id = o.user_id WHERE u.active = 1 GROUP BY u.id ORDER BY total_orders DESC LIMIT 10;`;

const DEFAULT_SAMPLE_HTML = `<div class="container"><header><h1>Toolstrum</h1><p>500 Tools</p></header><main><ul><li>Fast</li><li>Offline</li></ul></main></div>`;

const DEFAULT_SAMPLE_CSS = `.card { display: flex; padding: 16px; border-radius: 8px; background-color: #ffffff; color: #171A2E; }`;

const DEFAULT_SAMPLE_JS = `function calculateTotal(items, taxRate) { let sum = 0; for (let i = 0; i < items.length; i++) { sum += items[i].price; } return sum * (1 + taxRate); }`;

const DEFAULT_SAMPLE_RECORDS = `[
  { "id": 1, "name": "Toolstrum", "category": "Utilities", "active": 1 },
  { "id": 2, "name": "PDF Studio", "category": "Document", "active": 1 }
]`;

export const DevCodeFormattersWorkspace: React.FC<DevCodeFormattersWorkspaceProps> = ({
  initialToolId = 262,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  // Dynamic input states
  const [codeSql, setCodeSql] = useState<string>('');
  const [codeHtml, setCodeHtml] = useState<string>('');
  const [codeCss, setCodeCss] = useState<string>('');
  const [codeJs, setCodeJs] = useState<string>('');
  const [codeRecords, setCodeRecords] = useState<string>('');
  const [sqlTable, setSqlTable] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getDeveloperToolConfig(activeToolId);

  // Determine current active input
  const currentInput = useMemo(() => {
    if (activeToolId === 256 || activeToolId === 257) return codeHtml;
    if (activeToolId === 258 || activeToolId === 259) return codeCss;
    if (activeToolId === 260 || activeToolId === 261) return codeJs;
    if (activeToolId === 262 || activeToolId === 263 || activeToolId === 264) return codeSql;
    if (activeToolId === 294) return codeRecords;
    return codeHtml;
  }, [activeToolId, codeHtml, codeCss, codeJs, codeSql, codeRecords]);

  const handleUpdateInput = (text: string) => {
    if (activeToolId === 256 || activeToolId === 257) setCodeHtml(text);
    else if (activeToolId === 258 || activeToolId === 259) setCodeCss(text);
    else if (activeToolId === 260 || activeToolId === 261) setCodeJs(text);
    else if (activeToolId === 262 || activeToolId === 263 || activeToolId === 264) setCodeSql(text);
    else if (activeToolId === 294) setCodeRecords(text);
  };

  // Compute processed code
  const formattedOutput = useMemo(() => {
    try {
      if (!currentInput.trim()) return '';

      switch (activeToolId) {
        case 256:
          return formatHtml(codeHtml);
        case 257:
          return minifyHtml(codeHtml);
        case 258:
          return formatCss(codeCss);
        case 259:
          return minifyCss(codeCss);
        case 260:
          return formatJs(codeJs);
        case 261:
          return minifyJs(codeJs);
        case 262:
          return formatSql(codeSql);
        case 263:
          return minifySql(codeSql);
        case 264: {
          const explanation = explainSql(codeSql);
          return explanation.map((e) => `[${e.clause}]\n${e.explanation}`).join('\n\n');
        }
        case 293:
          return formatMarkdownCode(codeHtml);
        case 294:
          return generateSqlInserts(sqlTable, codeRecords);
        default:
          return currentInput;
      }
    } catch (err: any) {
      return `Processing error: ${err?.message || 'Unable to parse code syntax'}`;
    }
  }, [activeToolId, codeHtml, codeCss, codeJs, codeSql, codeRecords, sqlTable, currentInput]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Formatted code snippet saved to local files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Code Formatter'} Output`,
      subtitle: `${formattedOutput.length} characters generated`,
    });
  };

  const statItems: DevStatItem[] = [
    { label: 'Input Length', value: currentInput.length },
    { label: 'Output Length', value: formattedOutput.length },
    { label: 'Input Lines', value: currentInput.split('\n').length },
    { label: 'Output Lines', value: formattedOutput.split('\n').length },
  ];

  const toolsInWorkspace = [
    { id: 262, name: 'SQL Format' },
    { id: 263, name: 'SQL Minify' },
    { id: 264, name: 'SQL Explain' },
    { id: 294, name: 'SQL Inserts' },
    { id: 256, name: 'HTML Format' },
    { id: 257, name: 'HTML Minify' },
    { id: 258, name: 'CSS Format' },
    { id: 259, name: 'CSS Minify' },
    { id: 260, name: 'JS Format' },
    { id: 261, name: 'JS Minify' },
    { id: 293, name: 'MD Code' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Code Formatters & Minifiers'}
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

        {/* SQL Insert Table Name Config (Tool 294) */}
        {activeToolId === 294 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Target Database Table Name</Text>
            <TextInput
              style={styles.singleInput}
              value={sqlTable}
              onChangeText={setSqlTable}
              placeholder="e.g. users, products..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* Input Code Area */}
        <View style={styles.inputCard}>
          <View style={styles.inputCardHeader}>
            <Text style={styles.sectionTitle}>
              {activeToolId === 294 ? 'JSON Records Array' : 'Source Code Input'}
            </Text>
            <View style={styles.inputHeaderActions}>
              <TouchableOpacity
                onPress={() => {
                  if (activeToolId === 256 || activeToolId === 257) setCodeHtml(DEFAULT_SAMPLE_HTML);
                  else if (activeToolId === 258 || activeToolId === 259) setCodeCss(DEFAULT_SAMPLE_CSS);
                  else if (activeToolId === 260 || activeToolId === 261) setCodeJs(DEFAULT_SAMPLE_JS);
                  else if (activeToolId === 262 || activeToolId === 263 || activeToolId === 264) setCodeSql(DEFAULT_SAMPLE_SQL);
                  else if (activeToolId === 294) setCodeRecords(DEFAULT_SAMPLE_RECORDS);
                }}
                style={styles.actionChip}
              >
                <Text style={styles.actionChipText}>Sample</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleUpdateInput('')}
                style={[styles.actionChip, { backgroundColor: '#FEE2E2' }]}
              >
                <Text style={[styles.actionChipText, { color: Colors.statusError }]}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TextInput
            style={styles.textInput}
            multiline
            value={currentInput}
            onChangeText={handleUpdateInput}
            placeholder="Type or paste code here..."
            placeholderTextColor={Colors.textMuted}
            textAlignVertical="top"
          />
        </View>

        {/* Result Output Card */}
        <DevResultCard
          title={toolConfig?.name || 'Formatted Output'}
          subtitle={toolConfig?.description}
          badgeText="Local Offline Engine"
          stats={statItems}
          content={formattedOutput}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="formatted-code.txt"
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
