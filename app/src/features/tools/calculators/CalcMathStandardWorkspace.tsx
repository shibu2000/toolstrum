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
  calcStandard,
  calcScientific,
  calcPercentage,
  calcFraction,
  calcRatio,
  calcAverage,
  calcProbability,
} from './shared/CalculatorHelpers';
import { CalcResultCard, CalcMetricItem } from './shared/CalcResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const CalcMathStandardWorkspace: React.FC<Props> = ({
  initialToolId = 301,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getCalculatorToolConfig(activeToolId) || getCalculatorToolConfig(301)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // Expression / input states
  const [expr, setExpr] = useState('');
  const [sciVal, setSciVal] = useState('');
  const [sciOp, setSciOp] = useState('sin');
  const [pctMode, setPctMode] = useState<'percent_of' | 'is_what_percent' | 'percent_change'>('percent_of');
  const [pctA, setPctA] = useState('');
  const [pctB, setPctB] = useState('');
  const [fracN1, setFracN1] = useState('');
  const [fracD1, setFracD1] = useState('');
  const [fracOp, setFracOp] = useState<'+' | '-' | '*' | '/'>('+');
  const [fracN2, setFracN2] = useState('');
  const [fracD2, setFracD2] = useState('');
  const [ratioA, setRatioA] = useState('');
  const [ratioB, setRatioB] = useState('');
  const [ratioC, setRatioC] = useState('');
  const [avgNumbers, setAvgNumbers] = useState('');
  const [probN, setProbN] = useState('');
  const [probR, setProbR] = useState('');
  const [probType, setProbType] = useState<'single' | 'nPr' | 'nCr'>('nCr');

  const calculation = useMemo(() => {
    let hero = '0';
    let heroLabel = 'Evaluated Result';
    let metrics: CalcMetricItem[] = [];
    let note = '';

    switch (activeMode) {
      case 'standard': {
        const res = calcStandard(expr);
        hero = res.error ? 'Error' : res.result.toString();
        heroLabel = 'Result';
        metrics = [
          { label: 'Expression', value: expr || '0' },
          { label: 'Status', value: res.error ? 'Syntax Error' : 'Evaluated OK', highlight: !res.error },
        ];
        note = res.error ? res.error : 'Evaluated with operator precedence (BODMAS / PEMDAS).';
        break;
      }
      case 'scientific': {
        const val = parseFloat(sciVal) || 0;
        const res = calcScientific(sciOp, val);
        hero = res.toString();
        heroLabel = `${sciOp.toUpperCase()}(${sciVal})`;
        metrics = [
          { label: 'Function', value: sciOp.toUpperCase() },
          { label: 'Input Value', value: sciVal },
          { label: 'Result', value: res, highlight: true },
        ];
        note = `Calculated in degrees/radians according to standard mathematical definitions.`;
        break;
      }
      case 'percentage': {
        const a = parseFloat(pctA) || 0;
        const b = parseFloat(pctB) || 0;
        const res = calcPercentage(pctMode, a, b);
        hero = res.result.toString();
        heroLabel = pctMode === 'percent_of' ? 'Calculated Value' : 'Percentage (%)';
        metrics = [
          { label: 'Value A', value: a },
          { label: 'Value B', value: b },
          { label: 'Mode', value: pctMode.replace(/_/g, ' ') },
        ];
        note = res.label;
        break;
      }
      case 'fraction': {
        const n1 = parseInt(fracN1, 10) || 0;
        const d1 = parseInt(fracD1, 10) || 1;
        const n2 = parseInt(fracN2, 10) || 0;
        const d2 = parseInt(fracD2, 10) || 1;
        const res = calcFraction(n1, d1, fracOp, n2, d2);
        hero = res.simplified;
        heroLabel = 'Simplified Fraction';
        metrics = [
          { label: 'Mixed Number', value: res.mixedNumber, highlight: true },
          { label: 'Decimal Value', value: res.decimal },
          { label: 'Operation', value: `${n1}/${d1} ${fracOp} ${n2}/${d2}` },
        ];
        note = `Automatic common denominator and greatest common divisor (GCD) simplification.`;
        break;
      }
      case 'ratio': {
        const a = parseFloat(ratioA) || 1;
        const b = parseFloat(ratioB) || 1;
        const c = parseFloat(ratioC) || 0;
        const res = calcRatio(a, b, c);
        hero = res.solvedFourthTerm !== undefined ? res.solvedFourthTerm.toString() : res.simplifiedRatio;
        heroLabel = res.solvedFourthTerm !== undefined ? 'Solved D in (A:B = C:D)' : 'Simplified Ratio';
        metrics = [
          { label: 'Ratio A : B', value: res.simplifiedRatio, highlight: true },
          { label: 'Scale Factor (A/B)', value: res.scalingFactor },
          { label: 'Target C', value: c },
        ];
        note = `Proportion solved: ${a}:${b} = ${c}:${res.solvedFourthTerm ?? '?'}`;
        break;
      }
      case 'average': {
        const nums = avgNumbers
          .split(/[\s,]+/)
          .map((n) => parseFloat(n))
          .filter((n) => !isNaN(n));
        const res = calcAverage(nums);
        hero = res.mean.toString();
        heroLabel = 'Mean (Average)';
        metrics = [
          { label: 'Count (N)', value: res.count },
          { label: 'Sum', value: res.sum },
          { label: 'Median', value: res.median, highlight: true },
          { label: 'Mode', value: res.mode.length > 0 ? res.mode.join(', ') : 'None' },
          { label: 'Min / Max', value: `${res.min} / ${res.max}` },
          { label: 'Std Deviation (σ)', value: res.stdDev },
        ];
        note = `Computed across ${res.count} data points with variance ${res.variance}.`;
        break;
      }
      case 'probability': {
        const n = parseInt(probN, 10) || 1;
        const r = parseInt(probR, 10) || 1;
        const res = calcProbability(probType, n, r);
        hero = res.formatted;
        heroLabel = probType === 'single' ? 'Probability' : probType === 'nPr' ? 'Permutations' : 'Combinations';
        metrics = [
          { label: 'Total (n)', value: n },
          { label: 'Selected (r)', value: r },
          { label: 'Mode', value: probType },
        ];
        note = probType === 'single'
          ? 'Odds of favorable outcomes occurring out of total possible.'
          : `${n} items taken ${r} at a time.`;
        break;
      }
      default:
        break;
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    expr,
    sciVal,
    sciOp,
    pctMode,
    pctA,
    pctB,
    fracN1,
    fracD1,
    fracOp,
    fracN2,
    fracD2,
    ratioA,
    ratioB,
    ratioC,
    avgNumbers,
    probN,
    probR,
    probType,
  ]);

  const mathTools = [
    { id: 301, name: 'Standard' },
    { id: 302, name: 'Scientific' },
    { id: 303, name: 'Percentage' },
    { id: 329, name: 'Fraction' },
    { id: 330, name: 'Ratio' },
    { id: 331, name: 'Average' },
    { id: 332, name: 'Probability' },
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
            Offline Math Engine • High Precision • 100% Client-Side
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {mathTools.map((t) => (
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
          {activeMode === 'standard' && (
            <View>
              <Text style={styles.inputLabel}>Arithmetic Expression</Text>
              <TextInput
                style={styles.textInputLarge}
                value={expr}
                onChangeText={setExpr}
                placeholder="e.g. 12 + 4 * 8"
              />
              <View style={styles.quickKeys}>
                {['+', '-', '*', '/', '(', ')', '^', '.'].map((k) => (
                  <TouchableOpacity
                    key={k}
                    style={styles.keyBtn}
                    onPress={() => setExpr((prev) => prev + ` ${k} `)}
                  >
                    <Text style={styles.keyText}>{k}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={[styles.keyBtn, styles.keyClear]}
                  onPress={() => setExpr('')}
                >
                  <Text style={styles.keyClearText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'scientific' && (
            <View>
              <Text style={styles.inputLabel}>Scientific Function</Text>
              <View style={styles.sciOpsGrid}>
                {['sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'cbrt', 'factorial', 'abs'].map((op) => (
                  <TouchableOpacity
                    key={op}
                    style={[styles.sciOpBtn, sciOp === op && styles.sciOpBtnActive]}
                    onPress={() => setSciOp(op)}
                  >
                    <Text style={[styles.sciOpText, sciOp === op && styles.sciOpTextActive]}>
                      {op}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Input Value</Text>
              <TextInput
                style={styles.textInput}
                value={sciVal}
                onChangeText={setSciVal}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          )}

          {activeMode === 'percentage' && (
            <View>
              <View style={styles.rowToggle}>
                {[
                  { id: 'percent_of', label: '% of' },
                  { id: 'is_what_percent', label: 'is what %' },
                  { id: 'percent_change', label: '% change' },
                ].map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={[styles.pctModeBtn, pctMode === m.id && styles.pctModeBtnActive]}
                    onPress={() => setPctMode(m.id as any)}
                  >
                    <Text style={[styles.pctModeText, pctMode === m.id && styles.pctModeTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Value A</Text>
                  <TextInput
                    style={styles.textInput}
                    value={pctA}
                    onChangeText={setPctA}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Value B</Text>
                  <TextInput
                    style={styles.textInput}
                    value={pctB}
                    onChangeText={setPctB}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {activeMode === 'fraction' && (
            <View>
              <Text style={styles.inputLabel}>Fraction Operation</Text>
              <View style={styles.fractionRow}>
                <View style={styles.fractionBox}>
                  <TextInput
                    style={styles.fractionInput}
                    value={fracN1}
                    onChangeText={setFracN1}
                    keyboardType="numeric"
                  />
                  <View style={styles.fractionDivider} />
                  <TextInput
                    style={styles.fractionInput}
                    value={fracD1}
                    onChangeText={setFracD1}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.fracOpsRow}>
                  {(['+', '-', '*', '/'] as const).map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.fracOpBtn, fracOp === op && styles.fracOpBtnActive]}
                      onPress={() => setFracOp(op)}
                    >
                      <Text style={[styles.fracOpText, fracOp === op && styles.fracOpTextActive]}>
                        {op}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.fractionBox}>
                  <TextInput
                    style={styles.fractionInput}
                    value={fracN2}
                    onChangeText={setFracN2}
                    keyboardType="numeric"
                  />
                  <View style={styles.fractionDivider} />
                  <TextInput
                    style={styles.fractionInput}
                    value={fracD2}
                    onChangeText={setFracD2}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {activeMode === 'ratio' && (
            <View>
              <Text style={styles.inputLabel}>Proportion (A : B = C : D)</Text>
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>A</Text>
                  <TextInput
                    style={styles.textInput}
                    value={ratioA}
                    onChangeText={setRatioA}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>B</Text>
                  <TextInput
                    style={styles.textInput}
                    value={ratioB}
                    onChangeText={setRatioB}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>C (Solve D)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={ratioC}
                    onChangeText={setRatioC}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {activeMode === 'average' && (
            <View>
              <Text style={styles.inputLabel}>Data Set (Comma-separated numbers)</Text>
              <TextInput
                style={styles.textInputLarge}
                value={avgNumbers}
                onChangeText={setAvgNumbers}
                multiline
                placeholder="e.g. 10, 20, 30, 40"
              />
            </View>
          )}

          {activeMode === 'probability' && (
            <View>
              <View style={styles.rowToggle}>
                {[
                  { id: 'single', label: 'Single Event' },
                  { id: 'nPr', label: 'Permutation (nPr)' },
                  { id: 'nCr', label: 'Combination (nCr)' },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.pctModeBtn, probType === p.id && styles.pctModeBtnActive]}
                    onPress={() => setProbType(p.id as any)}
                  >
                    <Text style={[styles.pctModeText, probType === p.id && styles.pctModeTextActive]}>
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>{probType === 'single' ? 'Favorable (k)' : 'Total Items (n)'}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={probN}
                    onChangeText={setProbN}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>{probType === 'single' ? 'Total (N)' : 'Selection (r)'}</Text>
                  <TextInput
                    style={styles.textInput}
                    value={probR}
                    onChangeText={setProbR}
                    keyboardType="numeric"
                  />
                </View>
              </View>
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
  textInputLarge: {
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  quickKeys: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  keyBtn: {
    backgroundColor: Colors.surfaceCalculator,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  keyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#B45309',
  },
  keyClear: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
  },
  keyClearText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.statusError,
  },
  sciOpsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sciOpBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  sciOpBtnActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  sciOpText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  sciOpTextActive: {
    color: Colors.onPrimary,
  },
  rowToggle: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  pctModeBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  pctModeBtnActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  pctModeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  pctModeTextActive: {
    color: Colors.onPrimary,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  fractionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 10,
  },
  fractionBox: {
    alignItems: 'center',
    width: 60,
  },
  fractionInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    paddingVertical: 6,
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  fractionDivider: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.onSurface,
    marginVertical: 4,
  },
  fracOpsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  fracOpBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  fracOpBtnActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  fracOpText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  fracOpTextActive: {
    color: Colors.onPrimary,
  },
});
