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
import { calcBmi, calcCalories } from './shared/CalculatorHelpers';
import { CalcResultCard, CalcMetricItem } from './shared/CalcResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const CalcHealthLifestyleWorkspace: React.FC<Props> = ({
  initialToolId = 333,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getCalculatorToolConfig(activeToolId) || getCalculatorToolConfig(333)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // Shared inputs
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState<number>(1.375);
  const [goal, setGoal] = useState<'lose' | 'maintain' | 'gain'>('maintain');

  const calculation = useMemo(() => {
    const w = parseFloat(weightKg);
    const h = parseFloat(heightCm);
    const a = parseInt(age, 10);

    if (!weightKg.trim() || !heightCm.trim() || isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      return {
        hero: '—',
        heroLabel: activeMode === 'bmi' ? 'Awaiting weight & height' : 'Awaiting body metrics',
        metrics: [
          { label: 'Weight Input', value: weightKg ? `${weightKg} kg` : 'Not set' },
          { label: 'Height Input', value: heightCm ? `${heightCm} cm` : 'Not set' },
          { label: 'Status', value: 'Enter values below to calculate' },
        ],
        note: 'Enter your weight and height below to calculate biometric indicators.',
      };
    }

    let hero = '0';
    let heroLabel = 'Result';
    let metrics: CalcMetricItem[] = [];
    let note = '';

    if (activeMode === 'bmi') {
      const res = calcBmi(w, h);
      hero = `${res.bmi}`;
      heroLabel = `BMI (${res.category})`;
      metrics = [
        { label: 'Classification', value: res.category, highlight: true },
        { label: 'Healthy Weight Min', value: `${res.healthyWeightMinKg} kg` },
        { label: 'Healthy Weight Max', value: `${res.healthyWeightMaxKg} kg` },
        { label: 'BMI Prime', value: res.prime },
      ];
      note = `For height ${h} cm, a healthy adult body weight is between ${res.healthyWeightMinKg} kg and ${res.healthyWeightMaxKg} kg.`;
    } else {
      const safeAge = isNaN(a) || a <= 0 ? 25 : a;
      const res = calcCalories(safeAge, gender, w, h, activity, goal);
      hero = `${res.targetCalories} kcal`;
      heroLabel = `Daily Calorie Target (${goal.toUpperCase()})`;
      metrics = [
        { label: 'Basal Metabolic Rate (BMR)', value: `${res.bmr} kcal` },
        { label: 'Maintenance (TDEE)', value: `${res.tdee} kcal` },
        { label: 'Protein Target', value: `${res.proteinGrams}g (30%)`, highlight: true },
        { label: 'Carbs Target', value: `${res.carbsGrams}g (40%)` },
        { label: 'Fats Target', value: `${res.fatGrams}g (30%)` },
      ];
      note = `Evaluated via Mifflin-St Jeor formula with a balanced 30/40/30 macronutrient distribution.`;
    }

    return { hero, heroLabel, metrics, note };
  }, [activeMode, weightKg, heightCm, age, gender, activity, goal]);

  const healthTools = [
    { id: 333, name: 'BMI Calculator' },
    { id: 334, name: 'Calorie Estimator' },
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
            Offline Biometric Engine • 100% Private Health Metrics
          </Text>
        </View>

        <View style={styles.switcherRow}>
          {healthTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.switchTab, activeToolId === t.id && styles.switchTabActive]}
              onPress={() => setActiveToolId(t.id)}
            >
              <Text style={[styles.switchTabText, activeToolId === t.id && styles.switchTabTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputCard}>
          <View style={styles.rowInputs}>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                style={styles.textInput}
                value={weightKg}
                onChangeText={setWeightKg}
                placeholder="e.g. 70"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.flex1}>
              <Text style={styles.inputLabel}>Height (cm)</Text>
              <TextInput
                style={styles.textInput}
                value={heightCm}
                onChangeText={setHeightCm}
                placeholder="e.g. 175"
                keyboardType="numeric"
              />
            </View>
          </View>

          {activeMode === 'calorie' && (
            <View style={{ marginTop: 12 }}>
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Age (Years)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={age}
                    onChangeText={setAge}
                    placeholder="e.g. 28"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Biological Gender</Text>
                  <View style={styles.genderRow}>
                    {(['male', 'female'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                        onPress={() => setGender(g)}
                      >
                        <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                          {g === 'male' ? 'Male' : 'Female'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Activity Level</Text>
              <View style={styles.activityGrid}>
                {[
                  { label: 'Sedentary', val: 1.2 },
                  { label: 'Light (1-3 d/wk)', val: 1.375 },
                  { label: 'Moderate (3-5 d/wk)', val: 1.55 },
                  { label: 'Very Active (6-7 d/wk)', val: 1.725 },
                ].map((act) => (
                  <TouchableOpacity
                    key={act.label}
                    style={[styles.activityBtn, activity === act.val && styles.activityBtnActive]}
                    onPress={() => setActivity(act.val)}
                  >
                    <Text style={[styles.activityText, activity === act.val && styles.activityTextActive]}>
                      {act.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>Fitness Goal</Text>
              <View style={styles.goalsRow}>
                {[
                  { id: 'lose', label: 'Fat Loss (-500 kcal)' },
                  { id: 'maintain', label: 'Maintain' },
                  { id: 'gain', label: 'Surplus (+400 kcal)' },
                ].map((g) => (
                  <TouchableOpacity
                    key={g.id}
                    style={[styles.goalBtn, goal === g.id && styles.goalBtnActive]}
                    onPress={() => setGoal(g.id as any)}
                  >
                    <Text style={[styles.goalText, goal === g.id && styles.goalTextActive]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
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
  switcherRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  switchTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  switchTabActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  switchTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  switchTabTextActive: {
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
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  genderBtnActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  genderText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  genderTextActive: {
    color: Colors.onPrimary,
  },
  activityGrid: {
    gap: 6,
  },
  activityBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  activityBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  activityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  activityTextActive: {
    color: '#B45309',
  },
  goalsRow: {
    gap: 6,
  },
  goalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  goalBtnActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  goalText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  goalTextActive: {
    color: '#B45309',
  },
});
