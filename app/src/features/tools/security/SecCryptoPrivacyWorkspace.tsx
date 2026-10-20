import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { useAppStore } from '../../../store/useAppStore';
import {
  getSecurityToolConfig,
  SecurityToolConfig,
} from './securityConfig';
import {
  generateTextHashes,
  redactSecrets,
  encryptLocalNote,
  decryptLocalNote,
  cleanPrivacyMetadata,
} from './shared/SecurityHelpers';
import { SecurityResultCard, SecurityMetricItem } from './shared/SecurityResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const SecCryptoPrivacyWorkspace: React.FC<Props> = ({
  initialToolId = 371,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getSecurityToolConfig(activeToolId) || getSecurityToolConfig(371)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Secure Notes (370) ---
  const [noteContent, setNoteContent] = useState('');
  const [notePassphrase, setNotePassphrase] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);

  // --- Secret Redactor (371) ---
  const [redactInput, setRedactInput] = useState('');

  // --- File / Checksum Hash Verifier (372) ---
  const [hashInputText, setHashInputText] = useState('');
  const [expectedHash, setExpectedHash] = useState('');

  // --- Text Hash Generator (373) ---
  const [rawTextToHash, setRawTextToHash] = useState('');

  // --- Privacy Metadata Cleaner (375) ---
  const [privacyRawText, setPrivacyRawText] = useState('');

  // Computations
  const textHashes = useMemo(() => {
    return generateTextHashes(activeMode === 'file_hash' ? hashInputText : rawTextToHash);
  }, [activeMode, hashInputText, rawTextToHash]);

  const redactionReport = useMemo(() => {
    return redactSecrets(redactInput);
  }, [redactInput]);

  const cleanedPrivacy = useMemo(() => {
    return cleanPrivacyMetadata(privacyRawText);
  }, [privacyRawText]);

  const hashMatchStatus = useMemo(() => {
    if (!expectedHash) return 'No Checksum Entered';
    const cleanExp = expectedHash.trim().toLowerCase();
    if (
      cleanExp === textHashes.sha256.toLowerCase() ||
      cleanExp === textHashes.sha1.toLowerCase() ||
      cleanExp === textHashes.md5.toLowerCase()
    ) {
      return 'Verified Match';
    }
    return 'Mismatch';
  }, [expectedHash, textHashes]);

  const handleToggleNoteEncryption = () => {
    if (!isEncrypted) {
      const encrypted = encryptLocalNote(noteContent, notePassphrase);
      setNoteContent(encrypted);
      setIsEncrypted(true);
    } else {
      const decrypted = decryptLocalNote(noteContent, notePassphrase);
      setNoteContent(decrypted);
      setIsEncrypted(false);
    }
  };

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Output';
    let metrics: SecurityMetricItem[] = [];
    let note = '';

    if (activeMode === 'secure_notes') {
      if (!noteContent.trim()) {
        hero = 'Empty Note';
        heroLabel = 'PLAINTEXT NOTE';
        metrics = [
          { label: 'Status', value: 'Empty note', highlight: true },
          { label: 'Payload Length', value: '0 chars' },
          { label: 'Passphrase Used', value: notePassphrase ? 'Yes' : 'Default Salt' },
        ];
        note = 'Type private notes below to encrypt locally with AES key derivation.';
      } else {
        hero = isEncrypted ? 'Note Encrypted (AES-XOR)' : 'Note Decrypted (Plaintext)';
        heroLabel = isEncrypted ? 'CONFIDENTIAL ENCRYPTED' : 'PLAINTEXT NOTE';
        metrics = [
          { label: 'Status', value: isEncrypted ? 'Locked' : 'Unlocked', highlight: true },
          { label: 'Payload Length', value: `${noteContent.length} chars` },
          { label: 'Passphrase Used', value: notePassphrase ? 'Yes' : 'Default Salt' },
        ];
        note = isEncrypted
          ? 'Payload is protected locally with symmetric key derivation.'
          : 'Note is currently in plaintext. Tap Encrypt Note to secure.';
      }
    } else if (activeMode === 'secret_redact') {
      if (!redactInput.trim()) {
        hero = '0 Secrets Redacted';
        heroLabel = 'Awaiting Input Text';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Mode', value: 'Pattern detection' },
        ];
        note = 'Paste text containing emails, API keys, or phone numbers to redact.';
      } else {
        hero = `${redactionReport.redactionsCount} Secrets Redacted`;
        heroLabel = 'Sanitization Complete';
        metrics = [
          { label: 'API Keys Masked', value: redactionReport.redactionsBreakdown.apiKeys, highlight: true },
          { label: 'Credit Cards', value: redactionReport.redactionsBreakdown.creditCards },
          { label: 'Emails Masked', value: redactionReport.redactionsBreakdown.emails },
          { label: 'Phones Masked', value: redactionReport.redactionsBreakdown.phones },
        ];
        note = 'All confidential tokens, credentials, and PII replaced with redaction placeholders.';
      }
    } else if (activeMode === 'file_hash') {
      if (!hashInputText.trim()) {
        hero = '—';
        heroLabel = 'Enter File or Text Above';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Algorithm', value: 'SHA-256 / SHA-1 / MD5' },
        ];
        note = 'Enter a file name or string above to compute integrity checksums.';
      } else {
        hero = textHashes.sha256;
        heroLabel = `Verification: ${hashMatchStatus.toUpperCase()}`;
        metrics = [
          { label: 'Status', value: hashMatchStatus, highlight: true },
          { label: 'SHA-256 Digest', value: `${textHashes.sha256.slice(0, 16)}...` },
          { label: 'SHA-1 Digest', value: `${textHashes.sha1.slice(0, 16)}...` },
          { label: 'MD5 Digest', value: textHashes.md5 },
        ];
        note =
          hashMatchStatus === 'Verified Match'
            ? 'Checksum successfully matches target integrity hash.'
            : expectedHash
            ? 'Warning: Checksum does NOT match the expected value.'
            : 'Enter an expected hash above to perform automated verification.';
      }
    } else if (activeMode === 'text_hash') {
      if (!rawTextToHash.trim()) {
        hero = '—';
        heroLabel = 'Enter Text to Hash';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Digest Algorithms', value: 'SHA-256 / SHA-1 / MD5' },
        ];
        note = 'Enter text to compute deterministic cryptographic digests.';
      } else {
        hero = textHashes.sha256;
        heroLabel = 'SHA-256 Cryptographic Digest';
        metrics = [
          { label: 'SHA-256', value: `${textHashes.sha256.slice(0, 16)}...`, highlight: true },
          { label: 'SHA-1', value: `${textHashes.sha1.slice(0, 16)}...` },
          { label: 'MD5', value: textHashes.md5 },
          { label: 'Input Length', value: `${rawTextToHash.length} bytes` },
        ];
        note = 'Deterministic one-way cryptographic hash generated locally.';
      }
    } else if (activeMode === 'metadata_clean') {
      if (!privacyRawText.trim()) {
        hero = '0 Trackers Stripped';
        heroLabel = 'Awaiting URL or Text';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
        ];
        note = 'Paste a URL containing tracking parameters (UTM, fbclid, etc.) to strip.';
      } else {
        hero = `${cleanedPrivacy.removedTrackersCount} Trackers Stripped`;
        heroLabel = 'Privacy Cleaned';
        metrics = [
          { label: 'Trackers Stripped', value: cleanedPrivacy.removedTrackersCount, highlight: true },
          { label: 'Original Length', value: `${privacyRawText.length} chars` },
          { label: 'Cleaned Length', value: `${cleanedPrivacy.cleaned.length} chars` },
        ];
        note = 'Removed tracking parameters (UTM, fbclid, gclid, etc.) to prevent cross-site profiling.';
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    isEncrypted,
    noteContent,
    notePassphrase,
    redactionReport,
    textHashes,
    hashMatchStatus,
    expectedHash,
    rawTextToHash,
    cleanedPrivacy,
    privacyRawText,
  ]);

  const cryptoTools = [
    { id: 370, name: 'Secure Notes' },
    { id: 371, name: 'Secret Redactor' },
    { id: 372, name: 'File Hash' },
    { id: 373, name: 'Text Hash' },
    { id: 375, name: 'Privacy Cleaner' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Cryptography & Privacy • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />

      {/* Tool Selector Bar */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {cryptoTools.map((t) => {
            const isSelected = activeToolId === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setActiveToolId(t.id)}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              >
                <Text
                  style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}
                >
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Controls Card */}
        <View style={styles.card}>
          {activeMode === 'secure_notes' && (
            <View>
              <Text style={styles.sectionTitle}>Local Encrypted Notes</Text>
              <Text style={styles.subtext}>
                Encrypt confidential text with a local passphrase using offline symmetric cipher.
              </Text>

              <Text style={styles.label}>Passphrase</Text>
              <TextInput
                style={styles.input}
                value={notePassphrase}
                onChangeText={setNotePassphrase}
                placeholder="Enter encryption passphrase..."
                placeholderTextColor="#94A3B8"
                secureTextEntry
              />

              <Text style={styles.label}>Note Content ({isEncrypted ? 'Ciphertext' : 'Plaintext'})</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Enter confidential note here..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  isEncrypted && { backgroundColor: '#0284C7' },
                ]}
                onPress={handleToggleNoteEncryption}
              >
                <AppIcon name={isEncrypted ? 'Unlock' : 'Lock'} size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>
                  {isEncrypted ? 'Decrypt Note' : 'Encrypt Note'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'secret_redact' && (
            <View>
              <Text style={styles.sectionTitle}>Secret & PII Redactor</Text>
              <Text style={styles.subtext}>
                Scrub sensitive API tokens, emails, phone numbers, and credit cards before sharing.
              </Text>

              <Text style={styles.label}>Raw Text with Secrets</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={redactInput}
                onChangeText={setRedactInput}
                placeholder="Paste code or logs with credentials..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />

              {/* Redacted Preview */}
              <Text style={styles.label}>Sanitized Output Preview</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeBoxText}>{redactionReport.redactedText}</Text>
              </View>

              {/* Sample Presets */}
              <Text style={styles.label}>Preset Test Scenarios</Text>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() =>
                    setRedactInput(
                      'Payment received from user. Card: 4532-1928-3847-1920, Phone: +1-555-883-9922.'
                    )
                  }
                >
                  <Text style={styles.chipText}>Credit Card & Phone</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() =>
                    setRedactInput(
                      'Production config: export AWS_KEY=AKIA1234567890ABCDEF export OPENAI_KEY=sk-abcdefghijklmnopqrstuvwxyz123456'
                    )
                  }
                >
                  <Text style={styles.chipText}>API Keys & Tokens</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'file_hash' && (
            <View>
              <Text style={styles.sectionTitle}>File & Checksum Verifier</Text>
              <Text style={styles.subtext}>
                Calculate multi-hash digests and compare against expected release checksums.
              </Text>

              <Text style={styles.label}>File Name or Payload to Hash</Text>
              <TextInput
                style={styles.input}
                value={hashInputText}
                onChangeText={setHashInputText}
                placeholder="Enter file text or payload..."
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.label}>Expected Checksum (SHA-256 / SHA-1 / MD5)</Text>
              <TextInput
                style={styles.input}
                value={expectedHash}
                onChangeText={setExpectedHash}
                placeholder="Paste checksum to verify against..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              {/* Quick Verify Helper */}
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setExpectedHash(textHashes.sha256)}
                >
                  <Text style={styles.chipText}>Match Current SHA-256</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setExpectedHash('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')}
                >
                  <Text style={styles.chipText}>Empty String Checksum</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'text_hash' && (
            <View>
              <Text style={styles.sectionTitle}>Text Hash Generator</Text>
              <Text style={styles.subtext}>
                Compute cryptographic hashes for arbitrary text strings.
              </Text>

              <Text style={styles.label}>Input String</Text>
              <TextInput
                style={styles.input}
                value={rawTextToHash}
                onChangeText={setRawTextToHash}
                placeholder="Type text to hash..."
                placeholderTextColor="#94A3B8"
              />

              {/* Detailed Hashes Breakdown */}
              <View style={styles.hashBlock}>
                <Text style={styles.hashLabel}>SHA-256 (256-bit)</Text>
                <Text style={styles.hashValue} selectable>{textHashes.sha256}</Text>
              </View>

              <View style={styles.hashBlock}>
                <Text style={styles.hashLabel}>SHA-1 (160-bit)</Text>
                <Text style={styles.hashValue} selectable>{textHashes.sha1}</Text>
              </View>

              <View style={styles.hashBlock}>
                <Text style={styles.hashLabel}>MD5 (128-bit)</Text>
                <Text style={styles.hashValue} selectable>{textHashes.md5}</Text>
              </View>
            </View>
          )}

          {activeMode === 'metadata_clean' && (
            <View>
              <Text style={styles.sectionTitle}>Privacy Metadata & Tracker Cleaner</Text>
              <Text style={styles.subtext}>
                Scrub tracking parameters from URLs and clipboards to stop ad profiling.
              </Text>

              <Text style={styles.label}>Raw URL or Text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={privacyRawText}
                onChangeText={setPrivacyRawText}
                placeholder="Paste URL with trackers..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              {/* Cleaned Result Preview */}
              <Text style={styles.label}>Cleaned Output</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeBoxText}>{cleanedPrivacy.cleaned}</Text>
              </View>

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() =>
                    setPrivacyRawText(
                      'https://example.com/blog/article?utm_source=twitter&utm_medium=social&utm_campaign=launch'
                    )
                  }
                >
                  <Text style={styles.chipText}>Twitter UTM Link</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() =>
                    setPrivacyRawText(
                      'https://store.company.com/product/xyz?fbclid=IwAR982348234&gclid=CjwKCAjw'
                    )
                  }
                >
                  <Text style={styles.chipText}>Ad Tracker URL</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Security Result Card */}
        <SecurityResultCard
          title={config.title}
          heroValue={
            activeMode === 'secret_redact'
              ? redactionReport.redactedText
              : activeMode === 'metadata_clean'
              ? cleanedPrivacy.cleaned
              : activeMode === 'secure_notes'
              ? noteContent
              : calculation.hero
          }
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline Local Security"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={
            activeMode === 'secret_redact'
              ? redactionReport.redactedText
              : activeMode === 'metadata_clean'
              ? cleanedPrivacy.cleaned
              : activeMode === 'secure_notes'
              ? noteContent
              : calculation.hero
          }
          fileName={`${config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#0D9488',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  codeBox: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    padding: 12,
    marginTop: 4,
  },
  codeBoxText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#5EEAD4',
    lineHeight: 16,
  },
  hashBlock: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#99F6E4',
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 8,
  },
  hashLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0D9488',
    marginBottom: 2,
  },
  hashValue: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#0F172A',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0D9488',
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: 16,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
