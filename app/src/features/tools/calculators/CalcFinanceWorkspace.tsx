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
  calcDiscount,
  calcGst,
  calcEmi,
  calcInterest,
  calcSip,
  calcInvestmentReturn,
  calcInflation,
  calcSalary,
  calcOvertime,
  calcFuelCost,
  calcMileage,
  calcElectricityBill,
  calcTip,
  calcBreakEven,
  calcUnitPrice,
} from './shared/CalculatorHelpers';
import { CalcResultCard, CalcMetricItem } from './shared/CalcResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const CalcFinanceWorkspace: React.FC<Props> = ({
  initialToolId = 304,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getCalculatorToolConfig(activeToolId) || getCalculatorToolConfig(304)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  // Common inputs
  const [val1, setVal1] = useState('');
  const [val2, setVal2] = useState('');
  const [val3, setVal3] = useState('');
  const [isToggle, setIsToggle] = useState(false);

  const activeMode = config.mode;

  // Calculation output state
  const calculation = useMemo(() => {
    if (!val1.trim()) {
      return {
        hero: '₹0.00',
        heroLabel: 'Enter amount below',
        metrics: [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Mode', value: config.title },
        ],
        note: 'Enter principal amount or price below to calculate financial breakdown.',
      };
    }

    const num1 = parseFloat(val1) || 0;
    const num2 = parseFloat(val2) || 0;
    const num3 = parseFloat(val3) || 0;

    let hero = '₹0.00';
    let heroLabel = 'Final Amount';
    let metrics: CalcMetricItem[] = [];
    let note = '';

    switch (activeMode) {
      case 'discount': {
        const res = calcDiscount(num1, num2);
        hero = `₹${res.finalPrice.toLocaleString()}`;
        heroLabel = 'Final Sale Price';
        metrics = [
          { label: 'Original Price', value: `₹${res.originalPrice.toLocaleString()}` },
          { label: 'Discount', value: `${res.discountPercent}%` },
          { label: 'You Save', value: `₹${res.discountAmount.toLocaleString()}`, highlight: true },
        ];
        note = `You save ₹${res.discountAmount} on this purchase (${res.savingsRatio} discount).`;
        break;
      }
      case 'gst': {
        const res = calcGst(num1, num2, isToggle);
        hero = `₹${res.totalAmount.toLocaleString()}`;
        heroLabel = isToggle ? 'Total (Inclusive)' : 'Total (With GST)';
        metrics = [
          { label: 'Net Base Amount', value: `₹${res.baseAmount.toLocaleString()}` },
          { label: 'Total GST', value: `₹${res.gstAmount.toLocaleString()}`, highlight: true },
          { label: 'CGST (Central)', value: `₹${res.cgst.toLocaleString()}` },
          { label: 'SGST (State)', value: `₹${res.sgst.toLocaleString()}` },
        ];
        note = `Calculated at ${res.gstRate}% GST rate. CGST and SGST split equally.`;
        break;
      }
      case 'emi': {
        const res = calcEmi(num1, num2, num3);
        hero = `₹${res.monthlyEmi.toLocaleString()}`;
        heroLabel = 'Monthly EMI';
        metrics = [
          { label: 'Principal Loan', value: `₹${res.loanAmount.toLocaleString()}` },
          { label: 'Total Interest', value: `₹${res.totalInterest.toLocaleString()}`, highlight: true },
          { label: 'Total Payment', value: `₹${res.totalPayment.toLocaleString()}` },
          { label: 'Interest % of Total', value: `${res.interestRatio}%` },
        ];
        note = `Repayment across ${res.tenureMonths} monthly installments at ${res.annualRate}% annual interest.`;
        break;
      }
      case 'interest': {
        const res = calcInterest(num1, num2, num3, isToggle ? 'monthly' : 'annually');
        hero = `₹${res.compoundTotal.toLocaleString()}`;
        heroLabel = 'Compound Total';
        metrics = [
          { label: 'Simple Interest', value: `₹${res.simpleInterest.toLocaleString()}` },
          { label: 'Simple Total', value: `₹${res.simpleTotal.toLocaleString()}` },
          { label: 'Compound Interest', value: `₹${res.compoundInterest.toLocaleString()}`, highlight: true },
          { label: 'Principal', value: `₹${res.principal.toLocaleString()}` },
        ];
        note = `Compared over ${res.years} years at ${res.annualRate}% annual rate.`;
        break;
      }
      case 'sip': {
        const res = calcSip(num1, num2, num3);
        hero = `₹${res.totalMaturityValue.toLocaleString()}`;
        heroLabel = 'Maturity Wealth';
        metrics = [
          { label: 'Invested Amount', value: `₹${res.investedAmount.toLocaleString()}` },
          { label: 'Est. Wealth Gain', value: `₹${res.estimatedReturns.toLocaleString()}`, highlight: true },
          { label: 'Duration', value: `${res.years} years` },
          { label: 'Expected Return', value: `${res.expectedAnnualReturn}% p.a.` },
        ];
        note = `Systematic investment compounding monthly over ${res.years} years.`;
        break;
      }
      case 'investment': {
        const res = calcInvestmentReturn(num1, num2, num3);
        hero = `${res.cagr}%`;
        heroLabel = 'Annual Growth (CAGR)';
        metrics = [
          { label: 'Initial Investment', value: `₹${res.initialInvestment.toLocaleString()}` },
          { label: 'Final Maturity', value: `₹${res.finalValue.toLocaleString()}` },
          { label: 'Total Gain', value: `₹${res.totalGain.toLocaleString()}`, highlight: true },
          { label: 'Absolute Return', value: `${res.absoluteReturn}%` },
        ];
        note = `Compound Annual Growth Rate evaluated over ${res.years} years.`;
        break;
      }
      case 'inflation': {
        const res = calcInflation(num1, num2, num3);
        hero = `₹${res.futureRequiredAmount.toLocaleString()}`;
        heroLabel = 'Future Equivalent Cost';
        metrics = [
          { label: 'Current Amount', value: `₹${res.currentAmount.toLocaleString()}` },
          { label: 'Inflation Rate', value: `${res.inflationRate}%` },
          { label: 'Time Horizon', value: `${res.years} years` },
          { label: 'Purchasing Power Loss', value: `${res.purchasingPowerLossPercent}%`, highlight: true },
        ];
        note = `What costs ₹${num1} today will cost ₹${res.futureRequiredAmount} in ${num3} years.`;
        break;
      }
      case 'salary': {
        const res = calcSalary(num1);
        hero = `₹${res.estimatedNetMonthly.toLocaleString()}`;
        heroLabel = 'Est. Take-Home (Monthly)';
        metrics = [
          { label: 'Gross Monthly', value: `₹${res.monthlyGross.toLocaleString()}` },
          { label: 'Basic Salary', value: `₹${res.basicSalary.toLocaleString()}` },
          { label: 'HRA Allowance', value: `₹${res.hra.toLocaleString()}` },
          { label: 'Monthly PF', value: `₹${res.employeePf.toLocaleString()}` },
        ];
        note = 'Estimated in-hand breakdown assuming standard PF and professional tax deductions.';
        break;
      }
      case 'overtime': {
        const res = calcOvertime(num1, num2, num3, 1.5);
        hero = `₹${res.totalEarnings.toLocaleString()}`;
        heroLabel = 'Total Shift Earnings';
        metrics = [
          { label: 'Regular Pay', value: `₹${res.regularPay.toLocaleString()}` },
          { label: 'Overtime Pay (1.5x)', value: `₹${res.overtimePay.toLocaleString()}`, highlight: true },
          { label: 'Total Hours Worked', value: `${res.regularHours + res.otHours} hrs` },
        ];
        note = `Includes ${res.regularHours} regular hours + ${res.otHours} overtime hours at 1.5x rate.`;
        break;
      }
      case 'fuel_cost': {
        const res = calcFuelCost(num1, num2, num3);
        hero = `₹${res.totalFuelCost.toLocaleString()}`;
        heroLabel = 'Total Fuel Cost';
        metrics = [
          { label: 'Liters Needed', value: `${res.litersRequired} L` },
          { label: 'Fuel Price', value: `₹${res.fuelPricePerL}/L` },
          { label: 'Cost Per Km', value: `₹${res.costPerKm}/km`, highlight: true },
        ];
        note = `Trip expense for ${res.distanceKm} km trip at ${res.mileageKmPerL} km/L.`;
        break;
      }
      case 'mileage': {
        const res = calcMileage(num1, num2);
        hero = `${res.kmPerLiter} km/L`;
        heroLabel = 'Fuel Economy';
        metrics = [
          { label: 'US MPG', value: `${res.mpgUS} MPG` },
          { label: 'Consumption', value: `${res.litersPer100Km} L/100km` },
          { label: 'Total Distance', value: `${res.distanceKm} km` },
          { label: 'Fuel Used', value: `${res.fuelLiters} L` },
        ];
        note = 'Calculated based on odometer difference and refill volume.';
        break;
      }
      case 'electricity': {
        const res = calcElectricityBill(num1, num2, num3 || 50);
        hero = `₹${res.totalBill.toLocaleString()}`;
        heroLabel = 'Estimated Electricity Bill';
        metrics = [
          { label: 'Energy Charges', value: `₹${res.energyCharges.toLocaleString()}` },
          { label: 'Fixed Charge', value: `₹${res.fixedCharges.toLocaleString()}` },
          { label: 'Electricity Tax (5%)', value: `₹${res.taxAmount.toLocaleString()}` },
        ];
        note = `Based on ${res.unitsKwh} units consumed at ₹${res.ratePerUnit}/unit.`;
        break;
      }
      case 'tip':
      case 'bill_split': {
        const res = calcTip(num1, num2, num3 || 1);
        hero = `₹${res.perPersonTotal.toLocaleString()}`;
        heroLabel = 'Per-Person Total';
        metrics = [
          { label: 'Total with Tip', value: `₹${res.totalWithTip.toLocaleString()}` },
          { label: 'Total Tip', value: `₹${res.tipAmount.toLocaleString()}`, highlight: true },
          { label: 'Tip Per Person', value: `₹${res.perPersonTip.toLocaleString()}` },
          { label: 'Split Count', value: `${res.splitCount} people` },
        ];
        note = `Dining bill of ₹${res.billAmount} with ${res.tipPercent}% tip split among ${res.splitCount} people.`;
        break;
      }
      case 'break_even': {
        const res = calcBreakEven(num1, num2, num3);
        hero = `${res.breakEvenUnits.toLocaleString()} units`;
        heroLabel = 'Break-Even Volume';
        metrics = [
          { label: 'Break-Even Revenue', value: `₹${res.breakEvenRevenue.toLocaleString()}` },
          { label: 'Contribution / Unit', value: `₹${res.contributionMargin.toLocaleString()}`, highlight: true },
          { label: 'Margin Ratio', value: `${res.contributionMarginRatio}%` },
        ];
        note = `Must sell ${res.breakEvenUnits} units to fully cover fixed costs of ₹${res.fixedCosts}.`;
        break;
      }
      case 'unit_price': {
        const items = [
          { id: '1', name: 'Option A', price: num1 || 100, quantity: num2 || 500, unit: 'g' },
          { id: '2', name: 'Option B', price: (num1 * 1.8) || 180, quantity: (num2 * 2) || 1000, unit: 'g' },
        ];
        const res = calcUnitPrice(items);
        const best = res.find((r) => r.isBestValue) || res[0];
        hero = best.name;
        heroLabel = 'Best Value Product';
        metrics = [
          { label: `${res[0].name} Cost/Unit`, value: `₹${res[0].unitPrice}` },
          { label: `${res[1].name} Cost/Unit`, value: `₹${res[1].unitPrice}`, highlight: true },
        ];
        note = `${best.name} offers the lowest unit cost at ₹${best.unitPrice} per unit.`;
        break;
      }
      default: {
        hero = `₹${num1.toLocaleString()}`;
        metrics = [{ label: 'Input Amount', value: `₹${num1}` }];
        break;
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [activeMode, val1, val2, val3, isToggle]);

  const getInputLabels = () => {
    switch (activeMode) {
      case 'discount':
        return { l1: 'Original Price (₹)', l2: 'Discount Percentage (%)', l3: '' };
      case 'gst':
        return { l1: 'Amount (₹)', l2: 'GST Rate (%)', l3: '', toggle: 'Amount is GST Inclusive' };
      case 'emi':
        return { l1: 'Principal Loan Amount (₹)', l2: 'Annual Interest Rate (%)', l3: 'Tenure (Months)' };
      case 'interest':
        return { l1: 'Principal Amount (₹)', l2: 'Annual Interest Rate (%)', l3: 'Time Period (Years)', toggle: 'Compound Monthly' };
      case 'sip':
        return { l1: 'Monthly Investment (₹)', l2: 'Expected Annual Return (%)', l3: 'Time Period (Years)' };
      case 'investment':
        return { l1: 'Initial Investment (₹)', l2: 'Final Maturity Value (₹)', l3: 'Duration (Years)' };
      case 'inflation':
        return { l1: 'Current Amount (₹)', l2: 'Annual Inflation Rate (%)', l3: 'Years into Future' };
      case 'salary':
        return { l1: 'Annual CTC (₹)', l2: '', l3: '' };
      case 'overtime':
        return { l1: 'Hourly Pay Rate (₹)', l2: 'Regular Hours', l3: 'Overtime Hours' };
      case 'fuel_cost':
        return { l1: 'Trip Distance (km)', l2: 'Vehicle Mileage (km/L)', l3: 'Fuel Price (₹/L)' };
      case 'mileage':
        return { l1: 'Distance Driven (km)', l2: 'Fuel Consumed (Liters)', l3: '' };
      case 'electricity':
        return { l1: 'Units Consumed (kWh)', l2: 'Tariff Rate (₹/kWh)', l3: 'Fixed Charges (₹)' };
      case 'tip':
      case 'bill_split':
        return { l1: 'Bill Subtotal (₹)', l2: 'Tip Percentage (%)', l3: 'Number of People' };
      case 'break_even':
        return { l1: 'Total Fixed Costs (₹)', l2: 'Variable Cost per Unit (₹)', l3: 'Selling Price per Unit (₹)' };
      case 'unit_price':
        return { l1: 'Option 1 Price (₹)', l2: 'Option 1 Quantity', l3: '' };
      default:
        return { l1: 'Primary Value', l2: 'Secondary Value', l3: 'Additional Value' };
    }
  };

  const labels = getInputLabels();

  const financeTools = [
    { id: 304, name: 'Discount' },
    { id: 305, name: 'GST' },
    { id: 307, name: 'EMI' },
    { id: 308, name: 'Interest' },
    { id: 310, name: 'SIP' },
    { id: 317, name: 'Salary' },
    { id: 335, name: 'Fuel' },
    { id: 338, name: 'Tip' },
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
            Offline Financial Engine • 100% private • Zero data uploaded
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {financeTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[
                styles.chip,
                activeToolId === t.id && styles.chipActive,
              ]}
              onPress={() => setActiveToolId(t.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeToolId === t.id && styles.chipTextActive,
                ]}
              >
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Financial Parameters</Text>
            <TouchableOpacity
              onPress={() => {
                setVal1('');
                setVal2('');
                setVal3('');
              }}
            >
              <Text style={styles.resetText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {labels.l1 ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{labels.l1}</Text>
              <TextInput
                style={styles.textInput}
                value={val1}
                onChangeText={setVal1}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          ) : null}

          {labels.l2 ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{labels.l2}</Text>
              <TextInput
                style={styles.textInput}
                value={val2}
                onChangeText={setVal2}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          ) : null}

          {labels.l3 ? (
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{labels.l3}</Text>
              <TextInput
                style={styles.textInput}
                value={val3}
                onChangeText={setVal3}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          ) : null}

          {labels.toggle ? (
            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setIsToggle(!isToggle)}
              activeOpacity={0.7}
            >
              <AppIcon
                name={isToggle ? 'CheckSquare' : 'Square'}
                size={18}
                color={isToggle ? Colors.accentAmber : Colors.textMuted}
              />
              <Text style={styles.toggleText}>{labels.toggle}</Text>
            </TouchableOpacity>
          ) : null}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  resetText: {
    fontSize: 13,
    color: Colors.accentAmber,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 4,
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
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  toggleText: {
    fontSize: 13,
    color: Colors.onSurface,
    fontWeight: '500',
  },
});
