import React, { useState, useMemo, useEffect } from 'react';
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
  checkPasswordStrength,
  generateSecurePassword,
  generatePassphrase,
  generateTotpToken,
  PasswordGeneratorOptions,
} from './shared/SecurityHelpers';
import { SecurityResultCard, SecurityMetricItem } from './shared/SecurityResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const SecPasswordsAuthWorkspace: React.FC<Props> = ({
  initialToolId = 368,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getSecurityToolConfig(activeToolId) || getSecurityToolConfig(368)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Password Strength Checker (367) ---
  const [testPassword, setTestPassword] = useState('');
  const [showTestPassword, setShowTestPassword] = useState(false);

  // --- Random Password Generator (368) ---
  const [pwdLength, setPwdLength] = useState(16);
  const [pwdIncludeUpper, setPwdIncludeUpper] = useState(true);
  const [pwdIncludeLower, setPwdIncludeLower] = useState(true);
  const [pwdIncludeNumbers, setPwdIncludeNumbers] = useState(true);
  const [pwdIncludeSymbols, setPwdIncludeSymbols] = useState(true);
  const [pwdAvoidAmbiguous, setPwdAvoidAmbiguous] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState(() =>
    generateSecurePassword({ length: 16, avoidAmbiguous: true })
  );

  // --- Passphrase Generator (369) ---
  const [passphraseWordCount, setPassphraseWordCount] = useState(4);
  const [passphraseSeparator, setPassphraseSeparator] = useState('-');
  const [passphraseCapitalize, setPassphraseCapitalize] = useState(true);
  const [generatedPassphrase, setGeneratedPassphrase] = useState(() =>
    generatePassphrase(4, '-', true)
  );

  // --- TOTP Authenticator (374) ---
  const [totpSecret, setTotpSecret] = useState('');
  const [totpTick, setTotpTick] = useState(0);

  // 1-second interval for live TOTP token countdown
  useEffect(() => {
    if (activeMode !== 'totp_auth') return;
    const interval = setInterval(() => {
      setTotpTick((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeMode]);

  // Calculations
  const strengthReport = useMemo(() => {
    return checkPasswordStrength(testPassword);
  }, [testPassword]);

  const generatedPwdStrength = useMemo(() => {
    return checkPasswordStrength(generatedPassword);
  }, [generatedPassword]);

  const passphraseStrength = useMemo(() => {
    return checkPasswordStrength(generatedPassphrase);
  }, [generatedPassphrase]);

  const totpReport = useMemo(() => {
    return generateTotpToken(totpSecret);
  }, [totpSecret, totpTick]);

  const handleRegeneratePassword = () => {
    const opts: Partial<PasswordGeneratorOptions> = {
      length: pwdLength,
      upper: pwdIncludeUpper,
      lower: pwdIncludeLower,
      numbers: pwdIncludeNumbers,
      symbols: pwdIncludeSymbols,
      avoidAmbiguous: pwdAvoidAmbiguous,
    };
    setGeneratedPassword(generateSecurePassword(opts));
  };

  const handleRegeneratePassphrase = () => {
    setGeneratedPassphrase(
      generatePassphrase(passphraseWordCount, passphraseSeparator, passphraseCapitalize)
    );
  };

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Security Output';
    let metrics: SecurityMetricItem[] = [];
    let note = '';

    if (activeMode === 'pwd_strength') {
      if (!testPassword.trim()) {
        hero = '—';
        heroLabel = 'Enter Password Below';
        metrics = [
          { label: 'Strength Rating', value: 'Awaiting input' },
          { label: 'Entropy (bits)', value: '0 bits' },
          { label: 'Character Count', value: 0 },
        ];
        note = 'Type a password below to test entropy, complexity, and brute-force resistance.';
      } else {
        hero = strengthReport.label;
        heroLabel = `Entropy: ${strengthReport.entropyBits} bits`;
        metrics = [
          { label: 'Strength Rating', value: strengthReport.label, highlight: true },
          { label: 'Entropy (bits)', value: `${strengthReport.entropyBits} bits` },
          { label: 'Crack Time', value: strengthReport.crackTimeEstimate },
          { label: 'Character Count', value: testPassword.length },
        ];
        note =
          strengthReport.suggestions.length > 0
            ? `Suggestions: ${strengthReport.suggestions.join(' ')}`
            : 'Outstanding password entropy with multi-character diversity.';
      }
    } else if (activeMode === 'pwd_generate') {
      hero = generatedPassword;
      heroLabel = `Random Password (${pwdLength} chars)`;
      metrics = [
        { label: 'Generated Length', value: pwdLength },
        { label: 'Entropy', value: `${generatedPwdStrength.entropyBits} bits`, highlight: true },
        { label: 'Strength', value: generatedPwdStrength.label },
        { label: 'Crack Time', value: generatedPwdStrength.crackTimeEstimate },
      ];
      note = 'Generated 100% offline using pseudorandom cryptographic entropy.';
    } else if (activeMode === 'pwd_passphrase') {
      hero = generatedPassphrase;
      heroLabel = `Passphrase (${passphraseWordCount} words)`;
      metrics = [
        { label: 'Words Count', value: passphraseWordCount },
        { label: 'Separator', value: `"${passphraseSeparator}"` },
        { label: 'Entropy', value: `${passphraseStrength.entropyBits} bits`, highlight: true },
        { label: 'Crack Time', value: passphraseStrength.crackTimeEstimate },
      ];
      note = 'Diceware memorable word combination resistant to dictionary attacks.';
    } else if (activeMode === 'totp_auth') {
      if (!totpSecret.trim()) {
        hero = '— — —';
        heroLabel = 'Enter Base32 Secret Key';
        metrics = [
          { label: 'Status', value: 'Awaiting secret key' },
          { label: 'Algorithm', value: 'RFC 6238 TOTP' },
        ];
        note = 'Enter or scan a Base32 authentication secret below to calculate live rolling OTPs.';
      } else {
        hero = `${totpReport.code.slice(0, 3)} ${totpReport.code.slice(3)}`;
        heroLabel = `Valid for ${totpReport.secondsRemaining}s`;
        metrics = [
          { label: 'One-Time Token', value: totpReport.code, highlight: true },
          { label: 'Seconds Left', value: `${totpReport.secondsRemaining}s / 30s` },
          { label: 'Algorithm', value: 'RFC 6238 TOTP' },
          { label: 'Base32 Secret', value: `${totpSecret.slice(0, 4)}...${totpSecret.slice(-4)}` },
        ];
        note = 'Computed strictly in offline sandbox with no network connectivity.';
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    strengthReport,
    testPassword,
    generatedPassword,
    pwdLength,
    generatedPwdStrength,
    generatedPassphrase,
    passphraseWordCount,
    passphraseSeparator,
    passphraseStrength,
    totpReport,
    totpSecret,
  ]);

  const authTools = [
    { id: 367, name: 'Strength' },
    { id: 368, name: 'Generator' },
    { id: 369, name: 'Passphrase' },
    { id: 374, name: 'TOTP 2FA' },
  ];

  const getStrengthBarColor = (score: number) => {
    switch (score) {
      case 0:
        return '#EF4444'; // Red
      case 1:
        return '#F97316'; // Orange
      case 2:
        return '#EAB308'; // Yellow
      case 3:
        return '#10B981'; // Green
      case 4:
        return '#0D9488'; // Teal
      default:
        return '#94A3B8';
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Passwords & Authentication • Offline Local Processing"
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
          {authTools.map((t) => {
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
        {/* Workspace Form / Controls */}
        <View style={styles.card}>
          {activeMode === 'pwd_strength' && (
            <View>
              <Text style={styles.sectionTitle}>Password Strength Evaluation</Text>
              <Text style={styles.subtext}>
                Test passwords for character variety, entropy bits, and brute-force resilience.
              </Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={testPassword}
                  onChangeText={setTestPassword}
                  secureTextEntry={!showTestPassword}
                  placeholder="Enter password to test..."
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowTestPassword(!showTestPassword)}
                >
                  <AppIcon
                    name={showTestPassword ? 'EyeOff' : 'Eye'}
                    size={20}
                    color="#0D9488"
                  />
                </TouchableOpacity>
              </View>

              {/* Strength Meter Bar */}
              <View style={styles.meterRow}>
                {[0, 1, 2, 3, 4].map((step) => {
                  const filled = strengthReport.score >= step;
                  return (
                    <View
                      key={step}
                      style={[
                        styles.meterSegment,
                        filled && {
                          backgroundColor: getStrengthBarColor(strengthReport.score),
                        },
                      ]}
                    />
                  );
                })}
              </View>
              <View style={styles.meterLabelRow}>
                <Text
                  style={[
                    styles.meterStatusText,
                    { color: getStrengthBarColor(strengthReport.score) },
                  ]}
                >
                  {strengthReport.label.toUpperCase()}
                </Text>
                <Text style={styles.meterCrackText}>
                  Crack time: {strengthReport.crackTimeEstimate}
                </Text>
              </View>

              {/* Character Diversity Badges */}
              <View style={styles.badgeRow}>
                <View
                  style={[
                    styles.pillBadge,
                    strengthReport.hasUpper && styles.pillBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillBadgeText,
                      strengthReport.hasUpper && styles.pillBadgeTextActive,
                    ]}
                  >
                    A-Z Upper
                  </Text>
                </View>
                <View
                  style={[
                    styles.pillBadge,
                    strengthReport.hasLower && styles.pillBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillBadgeText,
                      strengthReport.hasLower && styles.pillBadgeTextActive,
                    ]}
                  >
                    a-z Lower
                  </Text>
                </View>
                <View
                  style={[
                    styles.pillBadge,
                    strengthReport.hasNumbers && styles.pillBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillBadgeText,
                      strengthReport.hasNumbers && styles.pillBadgeTextActive,
                    ]}
                  >
                    0-9 Numbers
                  </Text>
                </View>
                <View
                  style={[
                    styles.pillBadge,
                    strengthReport.hasSymbols && styles.pillBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.pillBadgeText,
                      strengthReport.hasSymbols && styles.pillBadgeTextActive,
                    ]}
                  >
                    !@# Symbols
                  </Text>
                </View>
              </View>

              {/* Sample Presets */}
              <Text style={styles.label}>Test Samples</Text>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setTestPassword('password123')}
                >
                  <Text style={styles.chipText}>Weak (123)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setTestPassword('OfficeCoffee2026!')}
                >
                  <Text style={styles.chipText}>Fair (Office2026)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setTestPassword('x9#Q$kP92!vMz@L09')}
                >
                  <Text style={styles.chipText}>Strong (16 chars)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'pwd_generate' && (
            <View>
              <Text style={styles.sectionTitle}>Password Generation Options</Text>
              <Text style={styles.subtext}>
                Customize character length and character sets for random generation.
              </Text>

              {/* Length Selector */}
              <View style={styles.stepperRow}>
                <Text style={styles.label}>Password Length: {pwdLength}</Text>
                <View style={styles.stepperBtns}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPwdLength(Math.max(8, pwdLength - 2))}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{pwdLength}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setPwdLength(Math.min(48, pwdLength + 2))}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Toggles */}
              <View style={styles.toggleGrid}>
                <TouchableOpacity
                  style={[styles.toggleBtn, pwdIncludeUpper && styles.toggleBtnActive]}
                  onPress={() => setPwdIncludeUpper(!pwdIncludeUpper)}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      pwdIncludeUpper && styles.toggleBtnTextActive,
                    ]}
                  >
                    Uppercase (A-Z)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, pwdIncludeLower && styles.toggleBtnActive]}
                  onPress={() => setPwdIncludeLower(!pwdIncludeLower)}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      pwdIncludeLower && styles.toggleBtnTextActive,
                    ]}
                  >
                    Lowercase (a-z)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, pwdIncludeNumbers && styles.toggleBtnActive]}
                  onPress={() => setPwdIncludeNumbers(!pwdIncludeNumbers)}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      pwdIncludeNumbers && styles.toggleBtnTextActive,
                    ]}
                  >
                    Numbers (0-9)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleBtn, pwdIncludeSymbols && styles.toggleBtnActive]}
                  onPress={() => setPwdIncludeSymbols(!pwdIncludeSymbols)}
                >
                  <Text
                    style={[
                      styles.toggleBtnText,
                      pwdIncludeSymbols && styles.toggleBtnTextActive,
                    ]}
                  >
                    Symbols (!@#)
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  pwdAvoidAmbiguous && styles.toggleBtnActive,
                  { marginTop: 8 },
                ]}
                onPress={() => setPwdAvoidAmbiguous(!pwdAvoidAmbiguous)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    pwdAvoidAmbiguous && styles.toggleBtnTextActive,
                  ]}
                >
                  Avoid Ambiguous Characters (l, 1, I, O, 0)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleRegeneratePassword}
              >
                <AppIcon name="RefreshCw" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Generate New Password</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'pwd_passphrase' && (
            <View>
              <Text style={styles.sectionTitle}>Memorable Passphrase Options</Text>
              <Text style={styles.subtext}>
                Generate Diceware-style multi-word passphrases that are easy to remember.
              </Text>

              {/* Word Count */}
              <View style={styles.stepperRow}>
                <Text style={styles.label}>Word Count: {passphraseWordCount}</Text>
                <View style={styles.stepperBtns}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      setPassphraseWordCount(Math.max(3, passphraseWordCount - 1))
                    }
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>{passphraseWordCount}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() =>
                      setPassphraseWordCount(Math.min(6, passphraseWordCount + 1))
                    }
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Separators */}
              <Text style={styles.label}>Word Separator</Text>
              <View style={styles.chipsRow}>
                {['-', '_', '.', ' ', '#'].map((sep) => (
                  <TouchableOpacity
                    key={sep}
                    style={[
                      styles.chip,
                      passphraseSeparator === sep && styles.chipActive,
                    ]}
                    onPress={() => setPassphraseSeparator(sep)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        passphraseSeparator === sep && styles.chipTextActive,
                      ]}
                    >
                      {sep === ' ' ? 'Space' : sep}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Capitalize Toggle */}
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  passphraseCapitalize && styles.toggleBtnActive,
                  { marginTop: 12 },
                ]}
                onPress={() => setPassphraseCapitalize(!passphraseCapitalize)}
              >
                <Text
                  style={[
                    styles.toggleBtnText,
                    passphraseCapitalize && styles.toggleBtnTextActive,
                  ]}
                >
                  Capitalize Each Word (TitleCase)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={handleRegeneratePassphrase}
              >
                <AppIcon name="RefreshCw" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Generate Passphrase</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'totp_auth' && (
            <View>
              <Text style={styles.sectionTitle}>Two-Factor Authenticator</Text>
              <Text style={styles.subtext}>
                Generate offline RFC 6238 time-based one-time passcodes without cloud sync.
              </Text>

              <Text style={styles.label}>Base32 Secret Key</Text>
              <TextInput
                style={styles.input}
                value={totpSecret}
                onChangeText={setTotpSecret}
                placeholder="Enter Base32 secret (e.g. JBSWY3DPEHPK3PXP)..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="characters"
              />

              {/* Live countdown timer card */}
              <View style={styles.totpTimerCard}>
                <View style={styles.totpTimerCircle}>
                  <Text style={styles.totpTimerSeconds}>
                    {totpReport.secondsRemaining}
                  </Text>
                  <Text style={styles.totpTimerSub}>sec</Text>
                </View>
                <View style={styles.totpTimerInfo}>
                  <Text style={styles.totpCodeHero}>
                    {totpReport.code.slice(0, 3)} {totpReport.code.slice(3)}
                  </Text>
                  <Text style={styles.totpSubtext}>
                    Standard 30-second window code
                  </Text>
                </View>
              </View>

              {/* Secret Presets */}
              <Text style={styles.label}>Account Presets</Text>
              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setTotpSecret('JBSWY3DPEHPK3PXP')}
                >
                  <Text style={styles.chipText}>Demo Account</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setTotpSecret('HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ')}
                >
                  <Text style={styles.chipText}>Cloud Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setTotpSecret('KZXW65TBNVSW45DF')}
                >
                  <Text style={styles.chipText}>Work Auth</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Security Result Card */}
        <SecurityResultCard
          title={config.title}
          heroValue={calculation.hero}
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline Cryptography"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={calculation.hero}
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyeBtn: {
    padding: 10,
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  meterRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 14,
    marginBottom: 6,
  },
  meterSegment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E2E8F0',
  },
  meterLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  meterStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  meterCrackText: {
    fontSize: 12,
    color: '#64748B',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  pillBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  pillBadgeActive: {
    backgroundColor: '#CCFBF1',
  },
  pillBadgeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  pillBadgeTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#0D9488',
    fontWeight: '700',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepperBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  stepperVal: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  toggleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  toggleBtn: {
    flexGrow: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: '#F0FDFA',
    borderColor: '#0D9488',
  },
  toggleBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  toggleBtnTextActive: {
    color: '#0D9488',
    fontWeight: '700',
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
  totpTimerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: '#F0FDFA',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#99F6E4',
    marginVertical: 14,
  },
  totpTimerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0D9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totpTimerSeconds: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  totpTimerSub: {
    fontSize: 10,
    color: '#CCFBF1',
    fontWeight: '600',
  },
  totpTimerInfo: {
    flex: 1,
  },
  totpCodeHero: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    fontFamily: 'Courier',
    letterSpacing: 2,
  },
  totpSubtext: {
    fontSize: 12,
    color: '#0D9488',
    fontWeight: '600',
    marginTop: 2,
  },
});
