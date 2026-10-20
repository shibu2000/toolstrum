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
import {
  markdownToHtml,
  htmlToMarkdown,
  xmlToJson,
  jsonToXml,
  formatXml,
} from './shared/OfficeHelpers';

interface OfficeMarkupWorkspaceProps {
  initialToolId: number;
  initialOperation?: string;
  onBack: () => void;
}

const SAMPLE_MARKDOWN = `# Product Launch Specification

Welcome to the **Toolstrum Office Engine**.

## Key Deliverables
- 100% on-device compilation
- High-fidelity typography
- Hermetic client execution

> Note: All conversions execute in the offline iOS sandbox.`;

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<catalog>
  <book id="bk101">
    <author>Gambardella, Matthew</author>
    <title>XML Developer's Guide</title>
    <genre>Computer</genre>
    <price>44.95</price>
  </book>
</catalog>`;

const SAMPLE_JSON = `{
  "catalog": {
    "book": {
      "id": "bk101",
      "author": "Gambardella, Matthew",
      "title": "XML Developer's Guide",
      "genre": "Computer",
      "price": 44.95
    }
  }
}`;

const SAMPLE_HTML = `<h1>Product Launch Specification</h1>
<p>Welcome to the <strong>Toolstrum Office Engine</strong>.</p>
<h2>Key Deliverables</h2>
<ul>
  <li>100% on-device compilation</li>
  <li>High-fidelity typography</li>
</ul>`;

export const OfficeMarkupWorkspace: React.FC<OfficeMarkupWorkspaceProps> = ({
  initialToolId,
  initialOperation,
  onBack,
}) => {
  const [selectedToolId, setSelectedToolId] = useState<number>(initialToolId);
  const toolConfig = OFFICE_TOOLS[selectedToolId] || OFFICE_TOOLS[159];

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(selectedToolId);

  const [inputContent, setInputContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OfficeExecutionResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const markupToolIds = [159, 160, 161, 171, 172, 173];

  const handleSwitchTool = (id: number) => {
    setSelectedToolId(id);
    setInputContent('');
    setResult(null);
  };

  const handleProcess = async () => {
    if (!inputContent.trim()) {
      Alert.alert('Empty Input', 'Please enter markup or text payload.');
      return;
    }

    setIsProcessing(true);
    setResult(null);
    setIsSaved(false);

    try {
      await new Promise((r) => setTimeout(r, 650));
      let res: OfficeExecutionResult;

      if (selectedToolId === 159) {
        // Markdown to PDF via pdf-lib
        res = await OfficeEngine.compileMarkdownToPdf(inputContent, 'Markdown Document');
      } else if (selectedToolId === 160) {
        // Markdown to HTML
        const html = markdownToHtml(inputContent);
        res = await OfficeEngine.saveTextFile(html, 'Rendered_Markup.html', 'HTML');
      } else if (selectedToolId === 161) {
        // HTML to Markdown
        const md = htmlToMarkdown(inputContent);
        res = await OfficeEngine.saveTextFile(md, 'Extracted_Markup.md', 'MARKDOWN');
      } else if (selectedToolId === 171) {
        // XML to JSON
        const parsed = xmlToJson(inputContent);
        const jsonStr = JSON.stringify(parsed, null, 2);
        res = await OfficeEngine.saveTextFile(jsonStr, 'Converted_Tree.json', 'JSON');
      } else if (selectedToolId === 172) {
        // JSON to XML
        let obj: any;
        try {
          obj = JSON.parse(inputContent);
        } catch {
          throw new Error('Invalid JSON input syntax.');
        }
        const xml = jsonToXml(obj, 'document');
        res = await OfficeEngine.saveTextFile(xml, 'Serialized_Markup.xml', 'XML');
      } else {
        // 173: XML Formatter
        const formatted = formatXml(inputContent, 2);
        res = await OfficeEngine.saveTextFile(formatted, 'Formatted_Document.xml', 'XML');
      }

      setResult(res);

      addRecentItem({
        id: `recent-${Date.now()}`,
        toolId: selectedToolId,
        toolName: toolConfig.name,
        timestamp: Date.now(),
      });
    } catch (e: any) {
      Alert.alert('Processing Error', e?.message || 'Failed to transform markup.');
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
      mimeType: result.format === 'PDF' ? 'application/pdf' : 'text/plain',
      createdAt: Date.now(),
    });
    setIsSaved(true);
    Alert.alert('Saved', 'File registered to My Files successfully.');
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="Office Studio • Tools 159–161, 171–173"
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
          {markupToolIds.map((id) => {
            const cfg = OFFICE_TOOLS[id];
            const isSelected = selectedToolId === id;
            return (
              <TouchableOpacity
                key={id}
                style={[styles.switcherTab, isSelected && styles.switcherTabActive]}
                onPress={() => handleSwitchTool(id)}
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

        {/* Markup Input Area */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Source Markup / Text Payload</Text>
            <TouchableOpacity onPress={() => setInputContent('')}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            value={inputContent}
            onChangeText={setInputContent}
            placeholder="Enter source markup here..."
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        {/* Execute Action */}
        <View style={{ marginBottom: Spacing.md }}>
          <PrimaryButton
            title={isProcessing ? 'Transforming Markup...' : `Run ${toolConfig.name}`}
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
});
