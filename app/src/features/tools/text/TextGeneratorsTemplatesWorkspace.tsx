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
  generateLoremIpsum,
  generateRandomText,
  generateNameList,
  generateMarkdownTable,
  generateMeetingNotes,
  generateResumeTemplate,
  generateEmailTemplate,
  checkOfflineGrammarAndStyle,
  convertBengaliNumerals,
  GrammarIssue,
} from './shared/TextHelpers';
import { TextResultCard, TextStatItem } from './shared/TextResultCard';
import { getTextToolConfig } from './textConfig';

interface TextGeneratorsTemplatesWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

export const TextGeneratorsTemplatesWorkspace: React.FC<TextGeneratorsTemplatesWorkspaceProps> = ({
  initialToolId = 231,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  // 231 Lorem Ipsum state
  const [loremMode, setLoremMode] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [loremCount, setLoremCount] = useState<number>(3);

  // 232 Random Text state
  const [randomMode, setRandomMode] = useState<'uuid' | 'alphanumeric' | 'hex'>('uuid');
  const [randomLength, setRandomLength] = useState<number>(16);

  // 233 Name List state
  const [nameMode, setNameMode] = useState<'full' | 'first' | 'last'>('full');
  const [nameCount, setNameCount] = useState<number>(6);

  // 235 & 236 Grammar & Spelling state
  const [grammarText, setGrammarText] = useState<string>(
    'The document was written in order to test the the system. At this point in time, all tests pass.'
  );

  // 238 Markdown Editor state
  const [markdownText, setMarkdownText] = useState<string>(
    '# Welcome to Toolstrum\n\n- 500 Offline Tools\n- Zero cloud dependencies\n\n**Fast and secure.**'
  );

  // 239 Markdown Table state
  const [tableRows, setTableRows] = useState<number>(3);
  const [tableCols, setTableCols] = useState<number>(3);
  const [tableAlign, setTableAlign] = useState<'left' | 'center' | 'right'>('left');

  // 240 Meeting Notes state
  const [meetingTitle, setMeetingTitle] = useState<string>('Toolstrum Sprint Architecture');
  const [meetingAttendees, setMeetingAttendees] = useState<string>('Alex, Jordan, Morgan');

  // 241 Resume state
  const [resumeName, setResumeName] = useState<string>('Morgan Vance');
  const [resumeRole, setResumeRole] = useState<string>('Senior Mobile Systems Engineer');

  // 242 Email state
  const [emailType, setEmailType] = useState<'followup' | 'meeting' | 'status'>('followup');
  const [emailRecipient, setEmailRecipient] = useState<string>('Engineering Team');

  // 243 Bengali Helper state
  const [bengaliDirection, setBengaliDirection] = useState<'bn_to_en' | 'en_to_bn'>('bn_to_en');
  const [bengaliInput, setBengaliInput] = useState<string>('২০২৪ সালে ৫০০টি টুলস তৈরি হলো');

  // Trigger state for re-generating random items
  const [seed, setSeed] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getTextToolConfig(activeToolId);

  // Grammar issues computation
  const grammarIssues: GrammarIssue[] = useMemo(() => {
    if (activeToolId === 235 || activeToolId === 236) {
      return checkOfflineGrammarAndStyle(grammarText);
    }
    return [];
  }, [grammarText, activeToolId]);

  // Main output content computation
  const generatedContent = useMemo(() => {
    switch (activeToolId) {
      case 231:
        return generateLoremIpsum(loremCount, loremMode);
      case 232:
        return generateRandomText(randomLength, randomMode);
      case 233:
        return generateNameList(nameCount, nameMode).join('\n');
      case 235:
      case 236: {
        const issuesText =
          grammarIssues.length > 0
            ? grammarIssues
                .map((iss, i) => `${i + 1}. [${iss.type.replace('_', ' ')}] "${iss.match}" -> Suggestion: ${iss.suggestion}`)
                .join('\n')
            : 'No grammar, redundancy, or duplicate word issues detected!';
        return `${grammarText}\n\n--- Analysis Report ---\n${issuesText}`;
      }
      case 238:
        return markdownText;
      case 239:
        return generateMarkdownTable(tableRows, tableCols, tableAlign);
      case 240:
        return generateMeetingNotes(meetingTitle, meetingAttendees);
      case 241:
        return generateResumeTemplate(resumeName, resumeRole);
      case 242:
        return generateEmailTemplate(emailType, emailRecipient);
      case 243:
        return convertBengaliNumerals(bengaliInput, bengaliDirection);
      default:
        return '';
    }
  }, [
    activeToolId,
    seed,
    loremCount,
    loremMode,
    randomLength,
    randomMode,
    nameCount,
    nameMode,
    grammarText,
    grammarIssues,
    markdownText,
    tableRows,
    tableCols,
    tableAlign,
    meetingTitle,
    meetingAttendees,
    resumeName,
    resumeRole,
    emailType,
    emailRecipient,
    bengaliInput,
    bengaliDirection,
  ]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Generated document preserved in workspace files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Text Template'} Output`,
      subtitle: `${generatedContent.length} characters generated`,
    });
  };

  const statItems: TextStatItem[] = useMemo(() => {
    if (activeToolId === 231) {
      return [
        { label: 'Mode', value: loremMode.toUpperCase() },
        { label: 'Units', value: loremCount },
        { label: 'Length', value: generatedContent.length },
      ];
    }
    if (activeToolId === 235 || activeToolId === 236) {
      return [
        { label: 'Issues Found', value: grammarIssues.length },
        { label: 'Characters', value: grammarText.length },
      ];
    }
    return [
      { label: 'Length', value: generatedContent.length },
      { label: 'Lines', value: generatedContent.split('\n').length },
    ];
  }, [activeToolId, loremMode, loremCount, generatedContent, grammarIssues, grammarText]);

  const toolsInWorkspace = [
    { id: 231, name: 'Lorem Ipsum' },
    { id: 232, name: 'Random Text' },
    { id: 233, name: 'Name List' },
    { id: 235, name: 'Grammar' },
    { id: 236, name: 'Spell Check' },
    { id: 238, name: 'Markdown' },
    { id: 239, name: 'MD Table' },
    { id: 240, name: 'Meeting Notes' },
    { id: 241, name: 'Resume' },
    { id: 242, name: 'Email Draft' },
    { id: 243, name: 'Bengali' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Text Generators & Templates'}
        subtitle="Text Studio · Offline Local Processing"
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

        {/* 231 Lorem Ipsum Controls */}
        {activeToolId === 231 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Lorem Ipsum Configuration</Text>
            <View style={styles.rowWrap}>
              {(['paragraphs', 'sentences', 'words'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.smallPill, loremMode === m && styles.smallPillActive]}
                  onPress={() => setLoremMode(m)}
                >
                  <Text
                    style={[styles.smallPillText, loremMode === m && styles.smallPillTextActive]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.stepperRow}>
              <Text style={styles.label}>Count: {loremCount}</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setLoremCount(Math.max(1, loremCount - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setLoremCount(loremCount + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 232 Random Text Controls */}
        {activeToolId === 232 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Random Generator Configuration</Text>
            <View style={styles.rowWrap}>
              {(['uuid', 'alphanumeric', 'hex'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.smallPill, randomMode === m && styles.smallPillActive]}
                  onPress={() => setRandomMode(m)}
                >
                  <Text
                    style={[styles.smallPillText, randomMode === m && styles.smallPillTextActive]}
                  >
                    {m.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.regenBtn} onPress={() => setSeed(Date.now())}>
              <AppIcon name="RefreshCw" size={14} color={Colors.accentOrange} />
              <Text style={styles.regenBtnText}>Generate New Random String</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 233 Name List Controls */}
        {activeToolId === 233 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Synthetic Name List Configuration</Text>
            <View style={styles.rowWrap}>
              {(['full', 'first', 'last'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.smallPill, nameMode === m && styles.smallPillActive]}
                  onPress={() => setNameMode(m)}
                >
                  <Text
                    style={[styles.smallPillText, nameMode === m && styles.smallPillTextActive]}
                  >
                    {m === 'full' ? 'Full Names' : m === 'first' ? 'First Names' : 'Last Names'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 235 & 236 Grammar & Spelling Controls */}
        {(activeToolId === 235 || activeToolId === 236) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Document Text to Check</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={grammarText}
              onChangeText={setGrammarText}
              placeholder="Paste text for offline grammar and repetition analysis..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 238 Markdown Editor */}
        {activeToolId === 238 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Markdown Document</Text>
            <View style={styles.mdShortcuts}>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setMarkdownText((prev) => prev + '\n# Heading 1\n')}
              >
                <Text style={styles.chipText}># H1</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setMarkdownText((prev) => prev + '\n## Heading 2\n')}
              >
                <Text style={styles.chipText}>## H2</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setMarkdownText((prev) => prev + '\n- Bullet Item\n')}
              >
                <Text style={styles.chipText}>- List</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.chip}
                onPress={() => setMarkdownText((prev) => prev + ' **bold text** ')}
              >
                <Text style={styles.chipText}>**Bold**</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.textInput}
              multiline
              value={markdownText}
              onChangeText={setMarkdownText}
            />
          </View>
        )}

        {/* 239 Markdown Table Generator */}
        {activeToolId === 239 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Markdown Table Dimensions</Text>
            <View style={styles.rowWrap}>
              <Text style={styles.label}>Rows: {tableRows}</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTableRows(Math.max(1, tableRows - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTableRows(tableRows + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.label, { marginLeft: 16 }]}>Cols: {tableCols}</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTableCols(Math.max(1, tableCols - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setTableCols(tableCols + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 240 Meeting Notes */}
        {activeToolId === 240 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Meeting Context</Text>
            <TextInput
              style={styles.singleInput}
              value={meetingTitle}
              onChangeText={setMeetingTitle}
              placeholder="Meeting Topic..."
              placeholderTextColor={Colors.textMuted}
            />
            <TextInput
              style={[styles.singleInput, { marginTop: 6 }]}
              value={meetingAttendees}
              onChangeText={setMeetingAttendees}
              placeholder="Attendees list..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 241 Resume Template */}
        {activeToolId === 241 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Candidate Profile</Text>
            <TextInput
              style={styles.singleInput}
              value={resumeName}
              onChangeText={setResumeName}
              placeholder="Full Name..."
              placeholderTextColor={Colors.textMuted}
            />
            <TextInput
              style={[styles.singleInput, { marginTop: 6 }]}
              value={resumeRole}
              onChangeText={setResumeRole}
              placeholder="Professional Title..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 242 Email Draft Assistant */}
        {activeToolId === 242 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Email Template Options</Text>
            <View style={styles.rowWrap}>
              {(['followup', 'meeting', 'status'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.smallPill, emailType === t && styles.smallPillActive]}
                  onPress={() => setEmailType(t)}
                >
                  <Text
                    style={[styles.smallPillText, emailType === t && styles.smallPillTextActive]}
                  >
                    {t === 'followup'
                      ? 'Follow-up'
                      : t === 'meeting'
                      ? 'Meeting Request'
                      : 'Status Report'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.singleInput, { marginTop: 8 }]}
              value={emailRecipient}
              onChangeText={setEmailRecipient}
              placeholder="Recipient Name or Team..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 243 Bengali Helper */}
        {activeToolId === 243 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bengali Numeral Converter</Text>
            <View style={styles.rowWrap}>
              <TouchableOpacity
                style={[styles.smallPill, bengaliDirection === 'bn_to_en' && styles.smallPillActive]}
                onPress={() => setBengaliDirection('bn_to_en')}
              >
                <Text
                  style={[
                    styles.smallPillText,
                    bengaliDirection === 'bn_to_en' && styles.smallPillTextActive,
                  ]}
                >
                  বাংলা (০-৯) to English (0-9)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.smallPill, bengaliDirection === 'en_to_bn' && styles.smallPillActive]}
                onPress={() => setBengaliDirection('en_to_bn')}
              >
                <Text
                  style={[
                    styles.smallPillText,
                    bengaliDirection === 'en_to_bn' && styles.smallPillTextActive,
                  ]}
                >
                  English (0-9) to বাংলা (০-৯)
                </Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.singleInput, { marginTop: 8 }]}
              value={bengaliInput}
              onChangeText={setBengaliInput}
              placeholder="Enter Bengali text or numerals..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* Output Result Card */}
        <TextResultCard
          title={toolConfig?.name || 'Generated Document'}
          subtitle={toolConfig?.description}
          badgeText="Offline Template Engine"
          stats={statItems}
          content={generatedContent}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="generated-template.txt"
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
    backgroundColor: Colors.accentOrange,
    borderColor: Colors.accentOrange,
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
    marginBottom: 8,
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  smallPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  smallPillActive: {
    backgroundColor: Colors.accentOrange,
    borderColor: Colors.accentOrange,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  smallPillTextActive: {
    color: Colors.surfaceWhite,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  stepperBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceText,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  regenBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentOrange,
  },
  textInput: {
    minHeight: 100,
    fontSize: 13,
    color: Colors.onSurface,
    lineHeight: 18,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
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
  mdShortcuts: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceBackground,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
});
