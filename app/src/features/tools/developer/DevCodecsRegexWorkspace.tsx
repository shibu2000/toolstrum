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
  testRegex,
  explainRegex,
  encodeBase64,
  decodeBase64,
  encodeUrl,
  decodeUrl,
  encodeHtmlEntities,
  decodeHtmlEntities,
  decodeJwt,
  parseUrl,
  parseUserAgent,
} from './shared/DeveloperHelpers';
import { DevResultCard, DevStatItem } from './shared/DevResultCard';
import { getDeveloperToolConfig } from './developerConfig';

interface DevCodecsRegexWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_SAMPLE_TEXT = `Hello World! Email us at support@toolstrum.app or call 123-456-7890. Visit https://toolstrum.app?ref=mobile#docs`;
const DEFAULT_SAMPLE_JWT = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ik1vcmdhbiBWYW5jZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxOTE2MjM5MDIyfQ.4z0Q-0d099999999999999999999999999999999999`;
const DEFAULT_SAMPLE_UA = `Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1`;

export const DevCodecsRegexWorkspace: React.FC<DevCodecsRegexWorkspaceProps> = ({
  initialToolId = 265,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  // States
  const [inputText, setInputText] = useState<string>('');
  const [regexPattern, setRegexPattern] = useState<string>('');
  const [regexFlags, setRegexFlags] = useState<string>('g');
  const [jwtToken, setJwtToken] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [uaInput, setUaInput] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getDeveloperToolConfig(activeToolId);

  // Regex test output
  const regexResult = useMemo(() => {
    if (activeToolId === 265) {
      return testRegex(regexPattern, regexFlags, inputText);
    }
    return { count: 0, matches: [] };
  }, [activeToolId, regexPattern, regexFlags, inputText]);

  // Main output processing
  const processedOutput = useMemo(() => {
    switch (activeToolId) {
      case 265:
        return regexResult.matches.length > 0
          ? `Found ${regexResult.count} match(es):\n` + regexResult.matches.map((m, i) => `${i + 1}. ${m}`).join('\n')
          : 'No regex matches found in test corpus.';
      case 266:
        return explainRegex(regexPattern).map((exp, i) => `${i + 1}. ${exp}`).join('\n');
      case 267:
        return encodeBase64(inputText);
      case 268:
        return decodeBase64(inputText);
      case 269:
        return encodeUrl(inputText);
      case 270:
        return decodeUrl(inputText);
      case 271:
        return encodeHtmlEntities(inputText);
      case 272:
        return decodeHtmlEntities(inputText);
      case 273: {
        const decoded = decodeJwt(jwtToken);
        return JSON.stringify(
          {
            validFormat: decoded.validFormat,
            isExpired: decoded.expired,
            expirationDate: decoded.expDate,
            header: decoded.header,
            payload: decoded.payload,
            signatureHex: decoded.signature,
          },
          null,
          2
        );
      }
      case 289: {
        const parsed = parseUrl(urlInput);
        return JSON.stringify(parsed, null, 2);
      }
      case 290: {
        const parsed = parseUserAgent(uaInput);
        return JSON.stringify(parsed, null, 2);
      }
      default:
        return inputText;
    }
  }, [activeToolId, regexResult, regexPattern, inputText, jwtToken, urlInput, uaInput]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Processed codec output saved to local files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Codec & Regex'} Output`,
      subtitle: `${processedOutput.length} characters generated`,
    });
  };

  const statItems: DevStatItem[] = useMemo(() => {
    if (activeToolId === 265) {
      return [
        { label: 'Matches', value: regexResult.count },
        { label: 'Corpus Length', value: inputText.length },
      ];
    }
    if (activeToolId === 273) {
      const decoded = decodeJwt(jwtToken);
      return [
        { label: 'Format', value: decoded.validFormat ? 'VALID' : 'INVALID' },
        { label: 'Status', value: decoded.expired ? 'EXPIRED' : 'ACTIVE' },
      ];
    }
    return [
      { label: 'Output Chars', value: processedOutput.length },
      { label: 'Output Lines', value: processedOutput.split('\n').length },
    ];
  }, [activeToolId, regexResult, inputText, jwtToken, processedOutput]);

  const toolsInWorkspace = [
    { id: 265, name: 'Regex Test' },
    { id: 266, name: 'Regex Explain' },
    { id: 267, name: 'Base64 Enc' },
    { id: 268, name: 'Base64 Dec' },
    { id: 269, name: 'URL Enc' },
    { id: 270, name: 'URL Dec' },
    { id: 271, name: 'HTML Ent Enc' },
    { id: 272, name: 'HTML Ent Dec' },
    { id: 273, name: 'JWT Decoder' },
    { id: 289, name: 'URL Parser' },
    { id: 290, name: 'User-Agent' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Web, Regex & Codecs'}
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

        {/* 265 & 266 Regex Controls */}
        {(activeToolId === 265 || activeToolId === 266) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Regular Expression Pattern</Text>
            <View style={styles.regexInputRow}>
              <Text style={styles.regexSlash}>/</Text>
              <TextInput
                style={styles.regexPatternInput}
                value={regexPattern}
                onChangeText={setRegexPattern}
                placeholder="pattern..."
                placeholderTextColor={Colors.textMuted}
              />
              <Text style={styles.regexSlash}>/</Text>
              <TextInput
                style={styles.regexFlagsInput}
                value={regexFlags}
                onChangeText={setRegexFlags}
                placeholder="flags"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        )}

        {/* 273 JWT Token Input */}
        {activeToolId === 273 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>JSON Web Token (JWT)</Text>
            <TextInput
              style={styles.singleInput}
              value={jwtToken}
              onChangeText={setJwtToken}
              placeholder="Paste eyJhbGci... token"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 289 URL Parser Input */}
        {activeToolId === 289 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Web URL to Parse</Text>
            <TextInput
              style={styles.singleInput}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="https://example.com/path?query=1"
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 290 User-Agent Parser Input */}
        {activeToolId === 290 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User-Agent String</Text>
            <TextInput
              style={styles.singleInput}
              value={uaInput}
              onChangeText={setUaInput}
              placeholder="Mozilla/5.0..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* Standard Text Input Card */}
        {activeToolId !== 273 && activeToolId !== 289 && activeToolId !== 290 && (
          <View style={styles.inputCard}>
            <View style={styles.inputCardHeader}>
              <Text style={styles.sectionTitle}>
                {activeToolId === 265 ? 'Test Corpus Text' : 'Input String'}
              </Text>
              <View style={styles.inputHeaderActions}>
                <TouchableOpacity
                  onPress={() => setInputText(DEFAULT_SAMPLE_TEXT)}
                  style={styles.actionChip}
                >
                  <Text style={styles.actionChipText}>Sample</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setInputText('')}
                  style={[styles.actionChip, { backgroundColor: '#FEE2E2' }]}
                >
                  <Text style={[styles.actionChipText, { color: Colors.statusError }]}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TextInput
              style={styles.textInput}
              multiline
              value={inputText}
              onChangeText={setInputText}
              placeholder="Enter text to encode, decode, or match..."
              placeholderTextColor={Colors.textMuted}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Output Result Card */}
        <DevResultCard
          title={toolConfig?.name || 'Parsed Output'}
          subtitle={toolConfig?.description}
          badgeText="Realtime Offline Codec"
          stats={statItems}
          content={processedOutput}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="codec-output.txt"
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
  regexInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  regexSlash: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.accentSky,
  },
  regexPatternInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    fontSize: 13,
    fontFamily: 'Courier',
    color: Colors.onSurface,
    backgroundColor: '#FAFAFA',
  },
  regexFlagsInput: {
    width: 60,
    height: 38,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    fontSize: 13,
    fontFamily: 'Courier',
    color: Colors.onSurface,
    backgroundColor: '#FAFAFA',
  },
  singleInput: {
    height: 38,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: 'Courier',
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
    minHeight: 100,
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
