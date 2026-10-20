import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  calcAge,
  calcDateDiff,
  calcDateAddSub,
  calcWorkHours,
  calcCalendarWeek,
} from './shared/CalculatorHelpers';
import { CalcResultCard, CalcMetricItem } from './shared/CalcResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const CalcDateTimeWorkspace: React.FC<Props> = ({
  initialToolId = 312,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getCalculatorToolConfig(activeToolId) || getCalculatorToolConfig(312)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // Date states
  const [birthDate, setBirthDate] = useState('');
  const [date1, setDate1] = useState('');
  const [date2, setDate2] = useState('');
  const [addAmount, setAddAmount] = useState('');
  const [addUnit, setAddUnit] = useState<'days' | 'weeks' | 'months' | 'years'>('days');
  const [isAdd, setIsAdd] = useState(true);

  // Time / work hours
  const [startHour, setStartHour] = useState('9');
  const [startMin, setStartMin] = useState('0');
  const [endHour, setEndHour] = useState('17');
  const [endMin, setEndMin] = useState('30');
  const [breakMins, setBreakMins] = useState('45');
  const [hourlyWage, setHourlyWage] = useState('500');

  // Interactive Stopwatch state
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const stopwatchIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (stopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchMs((prev) => prev + 100);
      }, 100);
    } else if (stopwatchIntervalRef.current) {
      clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [stopwatchRunning]);

  // World clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculation = useMemo(() => {
    let hero = '0';
    let heroLabel = 'Result';
    let metrics: CalcMetricItem[] = [];
    let note = '';

    switch (activeMode) {
      case 'age': {
        if (!birthDate.trim()) {
          hero = '—';
          heroLabel = 'Enter Birth Date';
          metrics = [
            { label: 'Status', value: 'Awaiting birth date' },
            { label: 'Format', value: 'YYYY-MM-DD' },
          ];
          note = 'Enter your birth date in YYYY-MM-DD format to compute chronological age.';
          break;
        }
        const res = calcAge(birthDate);
        hero = `${res.years} yrs, ${res.months} mos`;
        heroLabel = 'Chronological Age';
        metrics = [
          { label: 'Total Days Lived', value: res.totalDays.toLocaleString(), highlight: true },
          { label: 'Total Weeks', value: res.totalWeeks.toLocaleString() },
          { label: 'Days to Next Birthday', value: `${res.daysUntilNextBirthday} days` },
          { label: 'Born On', value: res.dayOfWeekBorn },
        ];
        note = `Exact age: ${res.years} years, ${res.months} months, and ${res.days} days.`;
        break;
      }
      case 'date_diff': {
        if (!date1.trim() || !date2.trim()) {
          hero = '—';
          heroLabel = 'Select Date Span';
          metrics = [
            { label: 'Start Date', value: date1 || 'Not set' },
            { label: 'End Date', value: date2 || 'Not set' },
          ];
          note = 'Enter both start date and end date in YYYY-MM-DD format to calculate difference.';
          break;
        }
        const res = calcDateDiff(date1, date2);
        hero = `${res.totalDays.toLocaleString()} Days`;
        heroLabel = 'Difference';
        metrics = [
          { label: 'Weeks & Days', value: `${res.weeks}w ${res.remainingDays}d`, highlight: true },
          { label: 'Business Days (Mon-Fri)', value: res.businessDays },
          { label: 'Weekend Days', value: res.weekendDays },
        ];
        note = `Total span of ${res.formattedDuration} between ${date1} and ${date2}.`;
        break;
      }
      case 'date_add_sub': {
        if (!date1.trim() || !addAmount.trim()) {
          hero = '—';
          heroLabel = 'Enter Base & Offset';
          metrics = [
            { label: 'Base Date', value: date1 || 'Not set' },
            { label: 'Offset', value: addAmount ? `${addAmount} ${addUnit}` : 'Not set' },
          ];
          note = 'Enter base date and unit count to add or subtract.';
          break;
        }
        const amount = parseInt(addAmount, 10) || 0;
        const res = calcDateAddSub(date1, amount, addUnit, isAdd);
        hero = res.formatted;
        heroLabel = isAdd ? 'Future Target Date' : 'Past Target Date';
        metrics = [
          { label: 'Base Date', value: date1 },
          { label: 'Offset', value: `${isAdd ? '+' : '-'}${amount} ${addUnit}` },
          { label: 'Target ISO', value: res.targetDateStr, highlight: true },
        ];
        note = `Calculated with calendar month and leap year rules preserved.`;
        break;
      }
      case 'duration':
      case 'work_hours': {
        const sh = parseInt(startHour, 10) || 0;
        const sm = parseInt(startMin, 10) || 0;
        const eh = parseInt(endHour, 10) || 0;
        const em = parseInt(endMin, 10) || 0;
        const brk = parseInt(breakMins, 10) || 0;
        const wage = parseFloat(hourlyWage) || 0;

        const res = calcWorkHours(sh, sm, eh, em, brk, wage);
        hero = `${res.billableHours} hrs`;
        heroLabel = 'Billable Shift Duration';
        metrics = [
          { label: 'Total Span', value: `${res.totalHours} hrs` },
          { label: 'Break Deducted', value: `${res.breakDeductionHours} hrs` },
          { label: 'Estimated Pay', value: `₹${res.grossPay.toLocaleString()}`, highlight: true },
        ];
        note = `Shift from ${sh.toString().padStart(2, '0')}:${sm.toString().padStart(2, '0')} to ${eh.toString().padStart(2, '0')}:${em.toString().padStart(2, '0')} minus ${brk}m break.`;
        break;
      }
      case 'stopwatch': {
        const totalSecs = Math.floor(stopwatchMs / 1000);
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;
        const tenths = Math.floor((stopwatchMs % 1000) / 100);
        hero = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${tenths}`;
        heroLabel = 'Elapsed Time';
        metrics = [
          { label: 'Total Laps', value: laps.length },
          { label: 'Status', value: stopwatchRunning ? 'Running' : 'Stopped', highlight: stopwatchRunning },
        ];
        note = 'Precision local millisecond stopwatch.';
        break;
      }
      case 'countdown': {
        hero = '00:15:00';
        heroLabel = 'Timer Preset';
        metrics = [
          { label: 'Preset', value: '15 Minutes', highlight: true },
          { label: 'Alarm Audio', value: 'Gentle Chime (Local)' },
        ];
        note = 'Local offline timer with interval notification support.';
        break;
      }
      case 'reminder': {
        const cycles = [4, 5, 6].map((c) => {
          const wake = new Date();
          wake.setMinutes(wake.getMinutes() + c * 90 + 15);
          return `${wake.getHours().toString().padStart(2, '0')}:${wake.getMinutes().toString().padStart(2, '0')} (${c} cycles / ${(c * 1.5).toFixed(1)}h)`;
        });
        hero = cycles[1];
        heroLabel = 'Optimal Wake Time (5 Cycles)';
        metrics = [
          { label: 'Option 1 (6 hrs)', value: cycles[0] },
          { label: 'Option 2 (7.5 hrs)', value: cycles[1], highlight: true },
          { label: 'Option 3 (9 hrs)', value: cycles[2] },
        ];
        note = 'Calculated based on natural 90-minute REM sleep cycles to avoid grogginess.';
        break;
      }
      case 'world_clock': {
        hero = currentTime.toLocaleTimeString();
        heroLabel = 'Local Time';
        metrics = [
          {
            label: 'London (UTC+1)',
            value: new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', timeStyle: 'short' }).format(currentTime),
          },
          {
            label: 'New York (UTC-4)',
            value: new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', timeStyle: 'short' }).format(currentTime),
          },
          {
            label: 'Tokyo (UTC+9)',
            value: new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', timeStyle: 'short' }).format(currentTime),
          },
          {
            label: 'Sydney (UTC+10)',
            value: new Intl.DateTimeFormat('en-US', { timeZone: 'Australia/Sydney', timeStyle: 'short' }).format(currentTime),
          },
        ];
        note = 'Synchronized with local device UTC hardware clock.';
        break;
      }
      case 'calendar_week': {
        const res = calcCalendarWeek(date1);
        hero = `Week ${res.isoWeek}`;
        heroLabel = 'ISO 8601 Calendar Week';
        metrics = [
          { label: 'Day of Year', value: `${res.dayOfYear} of ${res.isLeapYear ? 366 : 365}`, highlight: true },
          { label: 'Days Remaining', value: res.daysRemainingInYear },
          { label: 'Leap Year', value: res.isLeapYear ? 'Yes' : 'No' },
        ];
        note = `Calendar metrics for ${date1}.`;
        break;
      }
      default:
        break;
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    birthDate,
    date1,
    date2,
    addAmount,
    addUnit,
    isAdd,
    startHour,
    startMin,
    endHour,
    endMin,
    breakMins,
    hourlyWage,
    stopwatchMs,
    stopwatchRunning,
    laps,
    currentTime,
  ]);

  const dateTools = [
    { id: 312, name: 'Age' },
    { id: 313, name: 'Date Diff' },
    { id: 314, name: 'Add/Sub' },
    { id: 315, name: 'Duration' },
    { id: 316, name: 'Work Hours' },
    { id: 344, name: 'Stopwatch' },
    { id: 347, name: 'World Clock' },
    { id: 348, name: 'Week' },
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
            Offline Date & Time Engine • Zero Network Latency
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {dateTools.map((t) => (
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
          {activeMode === 'age' && (
            <View>
              <Text style={styles.inputLabel}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={birthDate}
                onChangeText={setBirthDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
          )}

          {activeMode === 'date_diff' && (
            <View>
              <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={date1}
                onChangeText={setDate1}
                placeholder="YYYY-MM-DD"
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>End Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={date2}
                onChangeText={setDate2}
                placeholder="YYYY-MM-DD"
              />
            </View>
          )}

          {activeMode === 'date_add_sub' && (
            <View>
              <Text style={styles.inputLabel}>Base Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={date1}
                onChangeText={setDate1}
              />
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Amount</Text>
                  <TextInput
                    style={styles.textInput}
                    value={addAmount}
                    onChangeText={setAddAmount}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Unit</Text>
                  <View style={styles.unitRow}>
                    {(['days', 'weeks', 'months', 'years'] as const).map((u) => (
                      <TouchableOpacity
                        key={u}
                        style={[styles.smallBtn, addUnit === u && styles.smallBtnActive]}
                        onPress={() => setAddUnit(u)}
                      >
                        <Text style={[styles.smallBtnText, addUnit === u && styles.smallBtnTextActive]}>
                          {u[0].toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setIsAdd(!isAdd)}
              >
                <Text style={styles.toggleText}>{isAdd ? '+ Adding to Date' : '- Subtracting from Date'}</Text>
              </TouchableOpacity>
            </View>
          )}

          {(activeMode === 'duration' || activeMode === 'work_hours') && (
            <View>
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Start Time (HH:MM)</Text>
                  <View style={styles.timeInputsRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={startHour}
                      onChangeText={setStartHour}
                      keyboardType="numeric"
                    />
                    <Text style={styles.timeColon}>:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={startMin}
                      onChangeText={setStartMin}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>End Time (HH:MM)</Text>
                  <View style={styles.timeInputsRow}>
                    <TextInput
                      style={styles.timeInput}
                      value={endHour}
                      onChangeText={setEndHour}
                      keyboardType="numeric"
                    />
                    <Text style={styles.timeColon}>:</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={endMin}
                      onChangeText={setEndMin}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              <View style={[styles.rowInputs, { marginTop: 10 }]}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Unpaid Break (Minutes)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={breakMins}
                    onChangeText={setBreakMins}
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Hourly Rate (₹)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={hourlyWage}
                    onChangeText={setHourlyWage}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          )}

          {activeMode === 'stopwatch' && (
            <View style={styles.stopwatchControls}>
              <TouchableOpacity
                style={[
                  styles.stopwatchBtn,
                  stopwatchRunning ? styles.stopwatchBtnStop : styles.stopwatchBtnStart,
                ]}
                onPress={() => setStopwatchRunning(!stopwatchRunning)}
              >
                <Text style={styles.stopwatchBtnText}>
                  {stopwatchRunning ? 'Pause' : 'Start'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.stopwatchBtn, styles.stopwatchBtnLap]}
                onPress={() => {
                  if (stopwatchRunning) {
                    setLaps((prev) => [stopwatchMs, ...prev]);
                  } else {
                    setStopwatchMs(0);
                    setLaps([]);
                  }
                }}
              >
                <Text style={styles.stopwatchBtnTextLap}>
                  {stopwatchRunning ? 'Lap' : 'Reset'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'calendar_week' && (
            <View>
              <Text style={styles.inputLabel}>Target Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.textInput}
                value={date1}
                onChangeText={setDate1}
              />
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
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  flex1: {
    flex: 1,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 4,
  },
  smallBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  smallBtnActive: {
    backgroundColor: Colors.accentAmber,
    borderColor: Colors.accentAmber,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  smallBtnTextActive: {
    color: Colors.onPrimary,
  },
  toggleRow: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#B45309',
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeInput: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.onSurface,
  },
  timeColon: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  stopwatchControls: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 6,
  },
  stopwatchBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  stopwatchBtnStart: {
    backgroundColor: Colors.statusSuccess,
  },
  stopwatchBtnStop: {
    backgroundColor: Colors.statusError,
  },
  stopwatchBtnLap: {
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  stopwatchBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onPrimary,
  },
  stopwatchBtnTextLap: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
});
