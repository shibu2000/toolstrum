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
  getCalculatorToolConfig,
  CalculatorToolConfig,
} from './calculatorsConfig';
import {
  convertNumberSystem,
  numberToWords,
  arabicToRoman,
  romanToArabic,
  generateRandomNumbers,
  rollDice,
} from './shared/CalculatorHelpers';
import { CalcResultCard, CalcMetricItem } from './shared/CalcResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const CalcNumericsRandomWorkspace: React.FC<Props> = ({
  initialToolId = 328,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getCalculatorToolConfig(activeToolId) || getCalculatorToolConfig(328)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // Number systems
  const [numSysInput, setNumSysInput] = useState('');
  const [numSysBase, setNumSysBase] = useState<2 | 8 | 10 | 16>(10);

  // Number to words
  const [wordsInput, setWordsInput] = useState('');

  // Roman numerals
  const [romanInput, setRomanInput] = useState('');
  const [isRomanToArabic, setIsRomanToArabic] = useState(false);

  // Random generator
  const [randMin, setRandMin] = useState('1');
  const [randMax, setRandMax] = useState('100');
  const [randCount, setRandCount] = useState('5');
  const [randUnique, setRandUnique] = useState(true);
  const [randSeed, setRandSeed] = useState(0);

  // Dice roller
  const [diceSides, setDiceSides] = useState(6);
  const [diceCount, setDiceCount] = useState(2);
  const [diceMod, setDiceMod] = useState(0);
  const [diceSeed, setDiceSeed] = useState(0);

  const calculation = useMemo(() => {
    let hero = '0';
    let heroLabel = 'Result';
    let metrics: CalcMetricItem[] = [];
    let note = '';

    switch (activeMode) {
      case 'number_systems': {
        if (!numSysInput.trim()) {
          hero = '—';
          heroLabel = 'Enter Number';
          metrics = [
            { label: 'Status', value: 'Awaiting input' },
            { label: 'Source Base', value: `Base ${numSysBase}` },
          ];
          note = 'Enter a number to convert across binary, hex, and decimal radices.';
          break;
        }
        const res = convertNumberSystem(numSysInput, numSysBase);
        hero = res.decimal.toString();
        heroLabel = 'Decimal (Base 10)';
        metrics = [
          { label: 'Binary (Base 2)', value: res.binary, highlight: true },
          { label: 'Hexadecimal (Base 16)', value: `0x${res.hexadecimal}` },
          { label: 'Octal (Base 8)', value: res.octal },
          { label: 'Source Base', value: `Base ${numSysBase}` },
        ];
        note = `Cross-radix conversion for input ${numSysInput}.`;
        break;
      }
      case 'number_to_words': {
        if (!wordsInput.trim()) {
          hero = '—';
          heroLabel = 'Enter Number';
          metrics = [
            { label: 'Status', value: 'Awaiting input' },
          ];
          note = 'Enter an integer to convert to written English words.';
          break;
        }
        const val = parseFloat(wordsInput) || 0;
        const res = numberToWords(val);
        hero = res.toUpperCase();
        heroLabel = 'Spoken Words';
        metrics = [
          { label: 'Numeric Value', value: val.toLocaleString(), highlight: true },
          { label: 'Word Count', value: res.split(' ').length },
        ];
        note = 'English cardinal word representation.';
        break;
      }
      case 'roman_numerals': {
        if (!romanInput.trim()) {
          hero = '—';
          heroLabel = isRomanToArabic ? 'Enter Roman Numeral' : 'Enter Arabic Integer';
          metrics = [
            { label: 'Status', value: 'Awaiting input' },
          ];
          note = isRomanToArabic ? 'Enter Roman numerals (e.g. XIV, MMXXVI).' : 'Enter an integer between 1 and 3,999.';
          break;
        }
        if (isRomanToArabic) {
          const res = romanToArabic(romanInput);
          hero = res.toString();
          heroLabel = 'Arabic Integer';
          metrics = [
            { label: 'Roman String', value: romanInput.toUpperCase(), highlight: true },
            { label: 'Integer Value', value: res },
          ];
          note = 'Parsed subtractive Roman numeral representation.';
        } else {
          const val = parseInt(romanInput, 10) || 1;
          const res = arabicToRoman(val);
          hero = res;
          heroLabel = 'Roman Numeral';
          metrics = [
            { label: 'Integer Input', value: val, highlight: true },
            { label: 'Length', value: res.length },
          ];
          note = 'Valid range: 1 to 3,999 (I to MMMCMXCIX).';
        }
        break;
      }
      case 'random_number': {
        const min = parseInt(randMin, 10) || 1;
        const max = parseInt(randMax, 10) || 100;
        const count = parseInt(randCount, 10) || 1;
        const list = generateRandomNumbers(min, max, count, randUnique);
        hero = list.length > 0 ? list.join(', ') : 'None';
        heroLabel = `Generated ${list.length} Random Numbers`;
        metrics = [
          { label: 'Range', value: `${min} to ${max}` },
          { label: 'Unique Only', value: randUnique ? 'Yes' : 'No' },
          { label: 'Sample Count', value: list.length, highlight: true },
        ];
        note = 'Cryptographically pseudo-random distribution.';
        break;
      }
      case 'dice_roller': {
        const res = rollDice(diceSides, diceCount, diceMod);
        hero = res.totalWithMod.toString();
        heroLabel = `Rolled ${diceCount}d${diceSides}${diceMod ? ` + ${diceMod}` : ''}`;
        metrics = [
          { label: 'Individual Rolls', value: res.rolls.join(', '), highlight: true },
          { label: 'Dice Sum', value: res.sum },
          { label: 'Modifier', value: res.modifier >= 0 ? `+${res.modifier}` : `${res.modifier}` },
        ];
        note = `Rolled ${diceCount} polyhedral dice with ${diceSides} sides each.`;
        break;
      }
      default:
        break;
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    numSysInput,
    numSysBase,
    wordsInput,
    romanInput,
    isRomanToArabic,
    randMin,
    randMax,
    randCount,
    randUnique,
    randSeed,
    diceSides,
    diceCount,
    diceMod,
    diceSeed,
  ]);

  const numTools = [
    { id: 328, name: 'Number Base' },
    { id: 340, name: 'To Words' },
    { id: 341, name: 'Roman' },
    { id: 342, name: 'Random' },
    { id: 343, name: 'Dice Roller' },
  ];

  return (
    <View style={styles.root}>
      <AppHeader
        title={config.title}
        subtitle="Calculators Studio • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <AppIcon name="ShieldCheck" size={16} color={Colors.statusSuccess} />
          <Text style={styles.bannerText}>
            Offline Numerics & Discrete Random Engine
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {numTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, activeToolId === t.id && styles.chipActive]}
              onPress={() => setActiveToolId(t.id)}
            >
              <Text style={[styles.chipText, activeToolId === t.id && styles.chipTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputCard}>
          {activeMode === 'number_systems' && (
            <View>
              <Text style={styles.inputLabel}>Select Input Radix</Text>
              <View style={styles.radixRow}>
                {[
                  { base: 2, label: 'BIN (2)' },
                  { base: 8, label: 'OCT (8)' },
                  { base: 10, label: 'DEC (10)' },
                  { base: 16, label: 'HEX (16)' },
                ].map((r) => (
                  <TouchableOpacity
                    key={r.base}
                    style={[styles.radixBtn, numSysBase === r.base && styles.radixBtnActive]}
                    onPress={() => setNumSysBase(r.base as any)}
                  >
                    <Text style={[styles.radixText, numSysBase === r.base && styles.radixTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Input String</Text>
              <TextInput
                style={styles.textInput}
                value={numSysInput}
                onChangeText={setNumSysInput}
                autoCapitalize="characters"
              />
            </View>
          )}

          {activeMode === 'number_to_words' && (
            <View>
              <Text style={styles.inputLabel}>Enter Number</Text>
              <TextInput
                style={styles.textInput}
                value={wordsInput}
                onChangeText={setWordsInput}
                keyboardType="numeric"
              />
            </View>
          )}

          {activeMode === 'roman_numerals' && (
            <View>
              <View style={styles.romanToggleRow}>
                <TouchableOpacity
                  style={[styles.romanToggleBtn, !isRomanToArabic && styles.romanToggleBtnActive]}
                  onPress={() => {
                    setIsRomanToArabic(false);
                    setRomanInput('2026');
                  }}
                >
                  <Text style={[styles.romanToggleText, !isRomanToArabic && styles.romanToggleTextActive]}>
                    Integer to Roman
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.romanToggleBtn, isRomanToArabic && styles.romanToggleBtnActive]}
                  onPress={() => {
                    setIsRomanToArabic(true);
                    setRomanInput('MMXXVI');
                  }}
                >
                  <Text style={[styles.romanToggleText, isRomanToArabic && styles.romanToggleTextActive]}>
                    Roman to Integer
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                {isRomanToArabic ? 'Roman String (e.g. MMXXVI)' : 'Integer (1 - 3999)'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={romanInput}
                onChangeText={setRomanInput}
                autoCapitalize="characters"
                keyboardType={isRomanToArabic ? 'default' : 'numeric'}
              />
            </View>
          )}

          {activeMode === 'random_number' && (
            <View>
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Min</Text>
                  <TextInput
                    style={styles.textInput}
                    value={randMin}
                    onChangeText={setRandMin}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Max</Text>
                  <TextInput
                    style={styles.textInput}
                    value={randMax}
                    onChangeText={setRandMax}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Count</Text>
                  <TextInput
                    style={styles.textInput}
                    value={randCount}
                    onChangeText={setRandCount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.actionBtnLarge}
                onPress={() => setRandSeed((prev) => prev + 1)}
              >
                <AppIcon name="Shuffle" size={16} color={Colors.onPrimary} />
                <Text style={styles.actionBtnText}>Re-Roll Random Numbers</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'dice_roller' && (
            <View>
              <Text style={styles.inputLabel}>Dice Type</Text>
              <View style={styles.radixRow}>
                {[4, 6, 8, 10, 12, 20, 100].map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.radixBtn, diceSides === d && styles.radixBtnActive]}
                    onPress={() => setDiceSides(d)}
                  >
                    <Text style={[styles.radixText, diceSides === d && styles.radixTextActive]}>
                      d{d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={[styles.rowInputs, { marginTop: 12 }]}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Dice Count</Text>
                  <TextInput
                    style={styles.textInput}
                    value={diceCount.toString()}
                    onChangeText={(t) => setDiceCount(parseInt(t, 10) || 1)}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Modifier (+/-)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={diceMod.toString()}
                    onChangeText={(t) => setDiceMod(parseInt(t, 10) || 0)}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <TouchableOpacity
                style={styles.actionBtnLarge}
                onPress={() => setDiceSeed((prev) => prev + 1)}
              >
                <AppIcon name="Dices" size={16} color={Colors.onPrimary} />
                <Text style={styles.actionBtnText}>Roll Dice</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <CalcResultCard
          title={config.title}
          subtitle={config.description}
          heroValue={calculation.hero}
          heroLabel={calculation.heroLabel}
          metrics={calculation.metrics}
          breakdownText={calculation.note}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginBottom: Spacing.md,
  },
  bannerText: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '500',
  },
  chipsScroll: {
    marginBottom: Spacing.md,
  },
  chipsContent: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  chipTextActive: {
    color: Colors.onPrimary,
  },
  inputCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  radixRow: {
    flexDirection: 'row',
    gap: 6,
  },
  radixBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  radixBtnActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  radixText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  radixTextActive: {
    color: Colors.onPrimary,
  },
  romanToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  romanToggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  romanToggleBtnActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  romanToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  romanToggleTextActive: {
    color: Colors.onPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  actionBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentAmber,
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: 12,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
});
