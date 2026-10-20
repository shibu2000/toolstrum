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
  convertUnits,
  UNIT_CATEGORIES,
  UnitConversionEntry,
} from './shared/CalculatorHelpers';
import { CalcResultCard, CalcMetricItem } from './shared/CalcResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const CalcUnitConvertersWorkspace: React.FC<Props> = ({
  initialToolId = 319,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getCalculatorToolConfig(activeToolId) || getCalculatorToolConfig(319)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const initialCategory = config.mode === 'universal' ? 'length' : config.mode;
  const [category, setCategory] = useState<string>(initialCategory);
  const [inputValue, setInputValue] = useState('');

  const categoryData = UNIT_CATEGORIES[category] || UNIT_CATEGORIES.length;
  const unitKeys = Object.keys(categoryData.units);
  const [fromUnit, setFromUnit] = useState<string>(unitKeys[0] || 'm');

  const activeFromUnit = unitKeys.includes(fromUnit) ? fromUnit : unitKeys[0];

  const conversions = useMemo<UnitConversionEntry[]>(() => {
    const val = parseFloat(inputValue);
    return convertUnits(category, activeFromUnit, isNaN(val) ? 0 : val);
  }, [category, activeFromUnit, inputValue]);

  const primaryTarget = conversions.find((c) => c.unit !== activeFromUnit) || conversions[0];

  const metrics: CalcMetricItem[] = conversions.slice(0, 6).map((c) => ({
    label: c.label,
    value: inputValue.trim() ? c.formatted : '—',
    highlight: c.unit === primaryTarget?.unit,
  }));

  const unitTools = [
    { id: 319, name: 'All Units', cat: 'universal' },
    { id: 320, name: 'Length', cat: 'length' },
    { id: 321, name: 'Weight', cat: 'weight' },
    { id: 322, name: 'Temp', cat: 'temperature' },
    { id: 323, name: 'Area', cat: 'area' },
    { id: 324, name: 'Volume', cat: 'volume' },
    { id: 325, name: 'Speed', cat: 'speed' },
    { id: 326, name: 'Pressure', cat: 'pressure' },
    { id: 327, name: 'Data', cat: 'data_storage' },
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
            Offline Unit Conversion • Instant Multi-Unit Results
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {unitTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, activeToolId === t.id && styles.chipActive]}
              onPress={() => {
                if (t.cat !== 'universal') setCategory(t.cat);
                setActiveToolId(t.id);
              }}
            >
              <Text style={[styles.chipText, activeToolId === t.id && styles.chipTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputCard}>
          <Text style={styles.inputLabel}>Value to Convert</Text>
          <TextInput
            style={styles.textInput}
            value={inputValue}
            onChangeText={setInputValue}
            keyboardType="numeric"
            placeholder="Enter numeric value"
          />

          <Text style={[styles.inputLabel, { marginTop: 12 }]}>Source Unit</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.unitList}
          >
            {unitKeys.map((u) => {
              const def = categoryData.units[u];
              const isSelected = u === activeFromUnit;
              return (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitChip, isSelected && styles.unitChipSelected]}
                  onPress={() => setFromUnit(u)}
                >
                  <Text style={[styles.unitChipText, isSelected && styles.unitChipTextSelected]}>
                    {def.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.tableCard}>
          <Text style={styles.tableHeader}>Instant Multi-Unit Conversions</Text>
          {conversions.map((item, idx) => (
            <View
              key={item.unit}
              style={[
                styles.tableRow,
                idx === conversions.length - 1 && styles.tableRowLast,
                item.unit === activeFromUnit && styles.tableRowCurrent,
              ]}
            >
              <View style={styles.tableColLeft}>
                <Text style={styles.tableUnitName}>{item.label}</Text>
                <Text style={styles.tableUnitSymbol}>({item.unit.toUpperCase()})</Text>
              </View>
              <Text style={styles.tableValue} numberOfLines={1}>
                {item.formatted}
              </Text>
            </View>
          ))}
        </View>

        <CalcResultCard
          title={config.title}
          subtitle={config.description}
          heroValue={inputValue.trim() ? `${primaryTarget?.formatted || '0'} ${primaryTarget?.unit.toUpperCase() || ''}` : '—'}
          heroLabel={inputValue.trim() ? `Converted from ${inputValue} ${activeFromUnit.toUpperCase()}` : 'Enter value above'}
          metrics={metrics}
          breakdownText={inputValue.trim() ? `Converted across all ${conversions.length} registered units for ${category}.` : `Select a source unit and type a number above to convert across all ${category} units.`}
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
    marginBottom: Spacing.md,
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  unitList: {
    gap: 6,
  },
  unitChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  unitChipSelected: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  unitChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  unitChipTextSelected: {
    color: '#B45309',
    fontWeight: '700',
  },
  tableCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  tableHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableRowCurrent: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 6,
    borderRadius: Radius.sm,
  },
  tableColLeft: {
    flex: 1,
  },
  tableUnitName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  tableUnitSymbol: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  tableValue: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    maxWidth: '45%',
    textAlign: 'right',
  },
});
