import React, { useState, useEffect } from 'react';
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
import { safeTriggerHaptic } from '../../../services/hardwareSensors';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  PRODUCTIVITY_WORKSPACES,
  PRODUCTIVITY_TOOL_CONFIGS,
  getProductivityWorkspaceTools,
} from './productivityConfig';
import { ProductivityResultCard } from './shared/ProductivityResultCard';
import { calculateDateSpan } from './shared/ProductivityHelpers';

interface ProdTimeDecisionsWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const ProdTimeDecisionsWorkspace: React.FC<ProdTimeDecisionsWorkspaceProps> = ({
  initialToolId = 444,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = PRODUCTIVITY_WORKSPACES.prod_time_decisions;
  const workspaceTools = getProductivityWorkspaceTools('prod_time_decisions');

  // Calendar Event Calculator state
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  // Focus Timer state
  const [focusMinutes, setFocusMinutes] = useState('25');
  const [focusSecondsRemaining, setFocusSecondsRemaining] = useState(25 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusLaps, setFocusLaps] = useState<string[]>([]);

  // Pomodoro state
  const [pomoMode, setPomoMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [pomoCount, setPomoCount] = useState(0);
  const [pomoTimerActive, setPomoTimerActive] = useState(false);
  const [pomoSecondsRemaining, setPomoSecondsRemaining] = useState(25 * 60);

  // Decision Picker state
  const [decisionMode, setDecisionMode] = useState<'coin' | 'dice' | 'yesno' | 'custom'>('coin');
  const [customChoices, setCustomChoices] = useState('');
  const [decisionResult, setDecisionResult] = useState<string | null>(null);

  // Wheel of Names state
  const [candidateNames, setCandidateNames] = useState('');
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  // Format seconds to mm:ss
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleFocusMinutesChange = (val: string) => {
    setFocusMinutes(val);
    const m = parseInt(val, 10);
    if (!isNaN(m) && m > 0 && !focusRunning) {
      setFocusSecondsRemaining(m * 60);
    }
  };

  const switchPomoMode = (mode: 'work' | 'shortBreak' | 'longBreak') => {
    setPomoMode(mode);
    setPomoTimerActive(false);
    if (mode === 'work') setPomoSecondsRemaining(25 * 60);
    else if (mode === 'shortBreak') setPomoSecondsRemaining(5 * 60);
    else setPomoSecondsRemaining(15 * 60);
  };

  // Focus Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (focusRunning) {
      interval = setInterval(() => {
        setFocusSecondsRemaining((prev) => {
          if (prev <= 1) {
            setFocusRunning(false);
            safeTriggerHaptic('success');
            Alert.alert('Focus Sprint Finished!', 'Great job! Take a short break.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [focusRunning]);

  // Pomodoro Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (pomoTimerActive) {
      interval = setInterval(() => {
        setPomoSecondsRemaining((prev) => {
          if (prev <= 1) {
            setPomoTimerActive(false);
            safeTriggerHaptic('success');
            if (pomoMode === 'work') {
              const nextCount = pomoCount + 1;
              setPomoCount(nextCount);
              const nextBreak = nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
              Alert.alert('🍅 Pomodoro Complete!', `Awesome focus! Time for a ${nextBreak === 'longBreak' ? '15m long break' : '5m short break'}.`);
              switchPomoMode(nextBreak);
            } else {
              Alert.alert('Break Over!', 'Ready for another Pomodoro focus sprint?');
              switchPomoMode('work');
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [pomoTimerActive, pomoMode, pomoCount]);

  // Calendar Math engine
  const dateSpan = calculateDateSpan(startDateStr, endDateStr);

  // Decision Picker engine
  const handleDecisionPick = () => {
    if (decisionMode === 'coin') {
      const flip = Math.random() < 0.5 ? 'Heads' : 'Tails';
      setDecisionResult(`🪙 ${flip}!`);
    } else if (decisionMode === 'dice') {
      const roll6 = Math.floor(Math.random() * 6) + 1;
      const roll20 = Math.floor(Math.random() * 20) + 1;
      setDecisionResult(`🎲 D6: [${roll6}] • D20: [${roll20}]`);
    } else if (decisionMode === 'yesno') {
      const answers = ['Definite YES', 'Unlikely / NO', 'Try Again Later', 'Strongly Favored'];
      const chosen = answers[Math.floor(Math.random() * answers.length)];
      setDecisionResult(`🔮 Oracle: ${chosen}`);
    } else {
      const choices = customChoices.split(',').map((c) => c.trim()).filter(Boolean);
      if (choices.length === 0) {
        Alert.alert('Empty Choices', 'Please provide comma-separated choices.');
        return;
      }
      const chosen = choices[Math.floor(Math.random() * choices.length)];
      setDecisionResult(`🎯 Picked: ${chosen}`);
    }
  };

  // Wheel of names engine
  const handleSpinWheel = () => {
    const names = candidateNames.split(',').map((n) => n.trim()).filter(Boolean);
    if (names.length < 2) {
      Alert.alert('Not enough names', 'Please provide at least 2 candidate names.');
      return;
    }
    setIsSpinning(true);
    setTimeout(() => {
      const winner = names[Math.floor(Math.random() * names.length)];
      setWinnerName(winner);
      setIsSpinning(false);
    }, 600);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={PRODUCTIVITY_TOOL_CONFIGS[activeToolId]?.name || 'Time & Decisions'}
        subtitle={`${workspaceMeta.title} • Offline Local`}
        showBack
        onBackPress={onBack}
      />

      <View style={styles.selectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={styles.selectorBar}
        >
          {workspaceTools.map((tool) => {
            const cfg = PRODUCTIVITY_TOOL_CONFIGS[tool.id];
            const isSelected = tool.id === activeToolId;
            return (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolPill,
                  isSelected && styles.toolPillActive,
                ]}
                onPress={() => setActiveToolId(tool.id)}
              >
                <Text
                  style={[
                    styles.toolPillText,
                    isSelected && styles.toolPillTextActive,
                  ]}
                >
                  {cfg?.badge || tool.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield studioName="Productivity" />

        {/* TOOL 444: Calendar Event Calculator */}
        {activeToolId === 444 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Date Interval & Event Math</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Start Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.input}
                    value={startDateStr}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setStartDateStr}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Target Event Date</Text>
                  <TextInput
                    style={styles.input}
                    value={endDateStr}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setEndDateStr}
                  />
                </View>
              </View>
            </View>

            <ProductivityResultCard
              title="Date Interval Analysis"
              badge="Calendar Math"
              primaryValue={`${dateSpan.totalDays} Total Days`}
              primarySubtext={`${dateSpan.businessDays} Working / Business Days (Mon-Fri)`}
              details={`Calendar Span:\n• Total Weeks: ${dateSpan.weeks} weeks and ${dateSpan.remainingDays} days\n• Business Days: ${dateSpan.businessDays} days\n• Weekend Days: ${dateSpan.totalDays - dateSpan.businessDays} days\n• Status: ${dateSpan.isPast ? 'Target Date is in the PAST' : 'Upcoming Future Event'}`}
              metadata={[
                { label: 'Total Days', value: `${dateSpan.totalDays}` },
                { label: 'Business Days', value: `${dateSpan.businessDays}` },
                { label: 'Weeks', value: `${dateSpan.weeks}` },
                { label: 'Timeline', value: dateSpan.isPast ? 'Past' : 'Future' },
              ]}
              copyContent={`Span: ${dateSpan.totalDays} days (${dateSpan.businessDays} business days)`}
            />
          </View>
        )}

        {/* TOOL 445: Focus Timer */}
        {activeToolId === 445 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Deep Work Focus Timer</Text>
              <Text style={styles.label}>Target Duration (Minutes)</Text>
              <TextInput
                style={styles.input}
                value={focusMinutes}
                onChangeText={handleFocusMinutesChange}
                keyboardType="numeric"
              />

              <View style={styles.timerDisplay}>
                <Text style={styles.timerNum}>{formatTime(focusSecondsRemaining)}</Text>
                <Text style={styles.timerStatus}>
                  {focusRunning ? '⚡ FOCUS SPRINT IN PROGRESS' : 'PAUSED / READY'}
                </Text>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.timerBtn, focusRunning && styles.timerBtnPause]}
                  onPress={() => setFocusRunning(!focusRunning)}
                >
                  <AppIcon
                    name={focusRunning ? 'Pause' : 'Play'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.timerBtnText}>
                    {focusRunning ? 'Pause' : 'Start Focus'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerBtn, styles.timerBtnReset]}
                  onPress={() => {
                    setFocusRunning(false);
                    const m = parseInt(focusMinutes, 10) || 25;
                    setFocusSecondsRemaining(m * 60);
                  }}
                >
                  <AppIcon name="RotateCcw" size={16} color="#DB2777" />
                  <Text style={[styles.timerBtnText, { color: '#DB2777' }]}>
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => {
                    setFocusRunning(false);
                    const m = parseInt(focusMinutes, 10) || 25;
                    setFocusLaps([
                      `Focus Sprint ${focusLaps.length + 1}: ${m}m logged at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                      ...focusLaps,
                    ]);
                    setFocusSecondsRemaining(m * 60);
                    safeTriggerHaptic('success');
                  }}
                >
                  <AppIcon name="Check" size={16} color="#FFFFFF" />
                  <Text style={styles.timerBtnText}>
                    Log
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ProductivityResultCard
              title="Focus Performance"
              badge="Deep Work Tracker"
              primaryValue={`${focusLaps.length} Focus Sprints Completed`}
              primarySubtext={`Target session: ${focusMinutes} minutes (${formatTime(focusSecondsRemaining)} remaining)`}
              details={focusLaps.length > 0 ? focusLaps.map((l) => `• ${l}`).join('\n') : 'No focus sprints logged yet in this session. Start a sprint to track your deep work.'}
              metadata={[
                { label: 'Target Mins', value: `${focusMinutes}m` },
                { label: 'Status', value: focusRunning ? 'Active' : 'Standby' },
              ]}
              copyContent={focusLaps.join('\n')}
            />
          </View>
        )}

        {/* TOOL 446: Pomodoro Timer */}
        {activeToolId === 446 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Pomodoro Productivity Cycle</Text>
              <View style={styles.pomoCycleRow}>
                {(['work', 'shortBreak', 'longBreak'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.pomoPill,
                      pomoMode === m && styles.pomoPillActive,
                    ]}
                    onPress={() => switchPomoMode(m)}
                  >
                    <Text
                      style={[
                        styles.pomoPillText,
                        pomoMode === m && styles.pomoPillTextActive,
                      ]}
                    >
                      {m === 'work'
                        ? '25m Focus'
                        : m === 'shortBreak'
                        ? '5m Rest'
                        : '15m Break'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.timerDisplay}>
                <Text style={styles.timerNum}>{formatTime(pomoSecondsRemaining)}</Text>
                <Text style={styles.timerStatus}>
                  🍅 Session #{pomoCount} • {pomoMode === 'work' ? 'FOCUS BURST' : pomoMode === 'shortBreak' ? 'SHORT REST' : 'LONG BREAK'} {pomoTimerActive ? '• RUNNING' : '• PAUSED'}
                </Text>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.timerBtn, pomoTimerActive && styles.timerBtnPause]}
                  onPress={() => setPomoTimerActive(!pomoTimerActive)}
                >
                  <AppIcon
                    name={pomoTimerActive ? 'Pause' : 'Play'}
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.timerBtnText}>
                    {pomoTimerActive ? 'Pause' : 'Start'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerBtn, styles.timerBtnReset]}
                  onPress={() => {
                    setPomoTimerActive(false);
                    if (pomoMode === 'work') setPomoSecondsRemaining(25 * 60);
                    else if (pomoMode === 'shortBreak') setPomoSecondsRemaining(5 * 60);
                    else setPomoSecondsRemaining(15 * 60);
                  }}
                >
                  <AppIcon name="RotateCcw" size={16} color="#DB2777" />
                  <Text style={[styles.timerBtnText, { color: '#DB2777' }]}>
                    Reset
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerBtn, { backgroundColor: '#FDF2F8', borderWidth: 1, borderColor: '#DB2777' }]}
                  onPress={() => {
                    const nextMode = pomoMode === 'work' ? (pomoCount % 4 === 3 ? 'longBreak' : 'shortBreak') : 'work';
                    if (pomoMode === 'work') setPomoCount(pomoCount + 1);
                    switchPomoMode(nextMode);
                  }}
                >
                  <AppIcon name="FastForward" size={16} color="#DB2777" />
                  <Text style={[styles.timerBtnText, { color: '#DB2777' }]}>
                    Skip
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <ProductivityResultCard
              title="Pomodoro Session Status"
              badge="25/5 Interval Method"
              primaryValue={`${pomoCount} Pomodoros Completed`}
              primarySubtext={`Current: ${pomoMode === 'work' ? '25m Focus Sprint' : pomoMode === 'shortBreak' ? '5m Rest Break' : '15m Refresh Break'}`}
              details={`The Pomodoro Technique breaks complex work into 25-minute concentrated bursts separated by 5-minute pauses.\n\n• Completed Cycles: ${pomoCount}\n• Total Focused Time: ~${pomoCount * 25} minutes\n• Next Recommendation: ${pomoCount > 0 && pomoCount % 4 === 0 ? '15m Long Refresh Break' : '5m Short Pause'}`}
              metadata={[
                { label: 'Pomodoros', value: `${pomoCount}` },
                { label: 'Focus Time', value: `${pomoCount * 25} mins` },
                { label: 'Mode', value: pomoMode },
              ]}
              copyContent={`Completed ${pomoCount} Pomodoro sessions (${pomoCount * 25} minutes total focus)`}
            />
          </View>
        )}

        {/* TOOL 447: Random Decision Picker */}
        {activeToolId === 447 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Decision Picker & Oracle</Text>
              <View style={styles.pomoCycleRow}>
                {(['coin', 'dice', 'yesno', 'custom'] as const).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.pomoPill,
                      decisionMode === m && styles.pomoPillActive,
                    ]}
                    onPress={() => {
                      setDecisionMode(m);
                      setDecisionResult(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.pomoPillText,
                        decisionMode === m && styles.pomoPillTextActive,
                      ]}
                    >
                      {m.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {decisionMode === 'custom' && (
                <View>
                  <Text style={styles.label}>Custom Options (comma separated)</Text>
                  <TextInput
                    style={styles.input}
                    value={customChoices}
                    placeholder="e.g. Option Alpha, Option Beta, Option Gamma"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setCustomChoices}
                  />
                </View>
              )}

              <PrimaryButton
                title={
                  decisionMode === 'coin'
                    ? 'Flip Coin'
                    : decisionMode === 'dice'
                    ? 'Roll Dice'
                    : decisionMode === 'yesno'
                    ? 'Consult Oracle'
                    : 'Pick Random Choice'
                }
                icon="Shuffle"
                onPress={handleDecisionPick}
              />
            </View>

            <ProductivityResultCard
              title="Decision Outcome"
              badge="True Randomness"
              primaryValue={decisionResult || 'Ready to Roll'}
              primarySubtext={`Mode: ${decisionMode.toUpperCase()}`}
              details={
                decisionResult
                  ? `Selected randomly with uniform probability distribution: ${decisionResult}`
                  : 'Press the action button above to generate a decision.'
              }
              metadata={[
                { label: 'Mode', value: decisionMode },
                { label: 'Entropy', value: 'Local RNG' },
              ]}
              copyContent={decisionResult || ''}
            />
          </View>
        )}

        {/* TOOL 448: Wheel of Names */}
        {activeToolId === 448 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Wheel of Names (Random Selector)</Text>
              <Text style={styles.label}>Participants / Contestants (comma separated)</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={candidateNames}
                placeholder="e.g. Emma, Liam, Sophia, Noah, Olivia"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setCandidateNames}
                multiline
              />

              <PrimaryButton
                title={isSpinning ? 'Spinning the Wheel...' : 'Spin the Wheel!'}
                icon="RotateCw"
                onPress={handleSpinWheel}
              />
            </View>

            <ProductivityResultCard
              title="Wheel Results"
              badge="Contest Winner"
              primaryValue={
                winnerName ? `🎉 Selected Winner: ${winnerName}!` : 'Ready to Spin'
              }
              primarySubtext={`Contestants: ${candidateNames.trim() ? candidateNames.split(',').filter(n => n.trim().length > 0).length : 0} candidate names`}
              details={
                winnerName
                  ? `🏆 Congratulations to "${winnerName}"! Selected fairly from: ${candidateNames}`
                  : 'Add names separated by commas and spin the wheel.'
              }
              metadata={[
                { label: 'Candidates', value: `${candidateNames.trim() ? candidateNames.split(',').filter(n => n.trim().length > 0).length : 0}` },
                { label: 'Winner', value: winnerName || 'None' },
              ]}
              copyContent={winnerName ? `Winner: ${winnerName}` : ''}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  selectorWrapper: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FBCFE8',
    justifyContent: 'center',
  },
  selectorScroll: {
    height: 52,
    flexGrow: 0,
  },
  selectorBar: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toolPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#DB2777',
    borderColor: '#BE185D',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9D174D',
  },
  toolPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#831843',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  timerDisplay: {
    backgroundColor: '#FDF2F8',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginVertical: Spacing.md,
    borderWidth: 2,
    borderColor: '#FBCFE8',
  },
  timerNum: {
    fontSize: 48,
    fontWeight: '900',
    color: '#BE185D',
    letterSpacing: 2,
  },
  timerStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9D174D',
    marginTop: 6,
    letterSpacing: 1,
  },
  timerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#DB2777',
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  timerBtnPause: {
    backgroundColor: '#F59E0B',
  },
  timerBtnReset: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#DB2777',
  },
  timerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pomoCycleRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  pomoPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: '#F1F5F9',
  },
  pomoPillActive: {
    backgroundColor: '#DB2777',
  },
  pomoPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  pomoPillTextActive: {
    color: '#FFFFFF',
  },
});
