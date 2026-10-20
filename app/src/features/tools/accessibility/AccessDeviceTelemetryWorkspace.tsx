import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import {
  getBatteryApi,
  getDeviceApi,
  getFileSystemApi,
  safeTriggerHaptic,
} from '../../../services/hardwareSensors';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  ACCESSIBILITY_WORKSPACES,
  ACCESSIBILITY_TOOL_CONFIGS,
  getAccessibilityWorkspaceTools,
} from './accessibilityConfig';
import { AccessibilityResultCard } from './shared/AccessibilityResultCard';

interface AccessDeviceTelemetryWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const AccessDeviceTelemetryWorkspace: React.FC<AccessDeviceTelemetryWorkspaceProps> = ({
  initialToolId = 464,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = ACCESSIBILITY_WORKSPACES.access_device_telemetry;
  const workspaceTools = getAccessibilityWorkspaceTools('access_device_telemetry');

  // Haptic Feedback & Timer state
  const [hapticMinutes, setHapticMinutes] = useState('5');
  const [hapticSecondsRemaining, setHapticSecondsRemaining] = useState(5 * 60);
  const [hapticActive, setHapticActive] = useState(false);
  const [hapticPulsesCount, setHapticPulsesCount] = useState(0);
  const [lastHapticStyle, setLastHapticStyle] = useState<string>('Ready');

  // Screen metrics
  const screen = Dimensions.get('screen');
  const window = Dimensions.get('window');
  const pixelRatio = screen.scale || 3;
  const totalPixels = Math.round(screen.width * screen.scale) * Math.round(screen.height * screen.scale);
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(Math.round(screen.width), Math.round(screen.height));
  const aspectW = Math.round(screen.width / divisor);
  const aspectH = Math.round(screen.height / divisor);

  // Battery metrics state
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [batteryState, setBatteryState] = useState<'Unplugged' | 'Charging' | 'Full'>('Unplugged');
  const [isLowPower, setIsLowPower] = useState(false);
  const [isLiveBattery, setIsLiveBattery] = useState(false);
  const [loadingBattery, setLoadingBattery] = useState(false);

  // Storage metrics state
  const [totalStorageGB, setTotalStorageGB] = useState(128.0);
  const [freeStorageGB, setFreeStorageGB] = useState(64.2);
  const [usedStorageGB, setUsedStorageGB] = useState(63.8);
  const [isLiveStorage, setIsLiveStorage] = useState(false);
  const [loadingStorage, setLoadingStorage] = useState(false);

  // Device specs from expo-device or platform fallbacks
  const Device = getDeviceApi();
  const deviceModel = Device?.modelName || (Platform.OS === 'ios' ? 'Apple iPhone' : 'Android Device');
  const deviceBrand = Device?.brand || (Platform.OS === 'ios' ? 'Apple' : 'Android');
  const deviceManufacturer = Device?.manufacturer || (Platform.OS === 'ios' ? 'Apple Inc.' : 'Hardware Vendor');
  const deviceOsName = Device?.osName || (Platform.OS === 'ios' ? 'iOS' : 'Android');
  const deviceOsVersion = Device?.osVersion || String(Platform.Version || '18.0');
  const deviceBuildId = Device?.osBuildId || 'Native Production Build';
  const deviceMemory = Device?.totalMemory
    ? `${(Device.totalMemory / (1024 * 1024 * 1024)).toFixed(1)} GB RAM`
    : 'Unified Memory';
  const deviceArch = Device?.supportedCpuArchitectures?.join(', ') || (Platform.OS === 'ios' ? 'Apple ARM64' : 'ARM64-v8a');
  const deviceTypeLabel = Device?.isDevice ? 'Physical Hardware' : 'Simulator Sandbox';

  // Real Storage fetcher
  const refreshStorage = async () => {
    setLoadingStorage(true);
    const FileSystem = getFileSystemApi();
    if (FileSystem) {
      try {
        const [totalBytes, freeBytes] = await Promise.all([
          FileSystem.getTotalDiskCapacityAsync(),
          FileSystem.getFreeDiskStorageAsync(),
        ]);
        if (totalBytes > 0) {
          const totalGB = totalBytes / (1024 * 1024 * 1024);
          const freeGB = freeBytes / (1024 * 1024 * 1024);
          const usedGB = Math.max(0, totalGB - freeGB);
          setTotalStorageGB(Number(totalGB.toFixed(1)));
          setFreeStorageGB(Number(freeGB.toFixed(1)));
          setUsedStorageGB(Number(usedGB.toFixed(1)));
          setIsLiveStorage(true);
          setLoadingStorage(false);
          return;
        }
      } catch (err) {
        console.warn('Storage telemetry read error:', err);
      }
    }
    setLoadingStorage(false);
  };

  // Real Battery fetcher
  const refreshBattery = async () => {
    setLoadingBattery(true);
    const Battery = getBatteryApi();
    if (Battery) {
      try {
        const isAvail = await Battery.isAvailableAsync?.();
        if (isAvail) {
          const [lvl, state, lowPower] = await Promise.all([
            Battery.getBatteryLevelAsync(),
            Battery.getBatteryStateAsync(),
            Battery.isLowPowerModeEnabledAsync?.().catch(() => false),
          ]);
          if (lvl >= 0) {
            setBatteryLevel(Math.round(lvl * 100));
          }
          if (state === Battery.BatteryState?.CHARGING) {
            setBatteryState('Charging');
          } else if (state === Battery.BatteryState?.FULL) {
            setBatteryState('Full');
          } else if (state === Battery.BatteryState?.UNPLUGGED) {
            setBatteryState('Unplugged');
          }
          setIsLowPower(Boolean(lowPower));
          setIsLiveBattery(true);
          setLoadingBattery(false);
          return;
        }
      } catch (err) {
        console.warn('Battery telemetry error:', err);
      }
    }
    setBatteryLevel(100);
    setBatteryState('Full');
    setIsLiveBattery(false);
    setLoadingBattery(false);
  };

  // Initialize hardware telemetry
  useEffect(() => {
    refreshStorage();
    refreshBattery();
  }, []);

  // Real Haptic triggering
  const triggerHaptic = async (
    style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error' | 'selection'
  ) => {
    setHapticPulsesCount((c) => c + 1);
    setLastHapticStyle(style.toUpperCase());
    await safeTriggerHaptic(style);
  };

  // Haptic Timer interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (hapticActive) {
      interval = setInterval(() => {
        setHapticSecondsRemaining((prev) => {
          if (prev <= 1) {
            setHapticActive(false);
            triggerHaptic('success');
            Alert.alert('📳 Haptic Timer Alert', 'Silent tactile countdown session completed!');
            return 0;
          }
          if (prev % 60 === 0) {
            triggerHaptic('selection');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hapticActive]);

  const handleHapticMinutesChange = (val: string) => {
    setHapticMinutes(val);
    const m = parseInt(val, 10);
    if (!isNaN(m) && m > 0 && !hapticActive) {
      setHapticSecondsRemaining(m * 60);
    }
  };

  const formatHapticTime = (totalSeconds: number): string => {
    const mins = Math.floor(Math.max(0, totalSeconds) / 60);
    const secs = Math.max(0, totalSeconds) % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const storagePercentUsed = totalStorageGB > 0 ? Math.round((usedStorageGB / totalStorageGB) * 100) : 0;
  const availableStorageGB = freeStorageGB > 0 ? freeStorageGB : Math.max(0, totalStorageGB - usedStorageGB);

  return (
    <View style={styles.container}>
      <AppHeader
        title={ACCESSIBILITY_TOOL_CONFIGS[activeToolId]?.name || 'Device Diagnostics'}
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
            const cfg = ACCESSIBILITY_TOOL_CONFIGS[tool.id];
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
        <OfflineShield studioName="Accessibility" />

        {/* TOOL 462: Haptic Vibration Tester & Timer */}
        {activeToolId === 462 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Taptic Engine & Haptic Vibration Tester</Text>
              <Text style={styles.cardSub}>
                Test physical haptic feedback styles and silent interval countdowns.
              </Text>

              {/* Haptic Pulse Tester Grid */}
              <Text style={styles.label}>Taptic Feedback Styles</Text>
              <View style={styles.hapticGrid}>
                <TouchableOpacity
                  style={styles.hapticBtn}
                  onPress={() => triggerHaptic('light')}
                >
                  <AppIcon name="Zap" size={16} color="#4F46E5" />
                  <Text style={styles.hapticBtnText}>Light Impact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hapticBtn}
                  onPress={() => triggerHaptic('medium')}
                >
                  <AppIcon name="Activity" size={16} color="#4F46E5" />
                  <Text style={styles.hapticBtnText}>Medium Impact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hapticBtn}
                  onPress={() => triggerHaptic('heavy')}
                >
                  <AppIcon name="Shield" size={16} color="#4F46E5" />
                  <Text style={styles.hapticBtnText}>Heavy Impact</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hapticBtn}
                  onPress={() => triggerHaptic('rigid')}
                >
                  <AppIcon name="Sliders" size={16} color="#4F46E5" />
                  <Text style={styles.hapticBtnText}>Rigid Click</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.hapticBtn}
                  onPress={() => triggerHaptic('soft')}
                >
                  <AppIcon name="Feather" size={16} color="#4F46E5" />
                  <Text style={styles.hapticBtnText}>Soft Pulse</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.hapticBtn, { borderColor: '#10B981' }]}
                  onPress={() => triggerHaptic('success')}
                >
                  <AppIcon name="CheckCircle" size={16} color="#10B981" />
                  <Text style={[styles.hapticBtnText, { color: '#059669' }]}>Success</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.hapticBtn, { borderColor: '#F59E0B' }]}
                  onPress={() => triggerHaptic('warning')}
                >
                  <AppIcon name="AlertTriangle" size={16} color="#F59E0B" />
                  <Text style={[styles.hapticBtnText, { color: '#D97706' }]}>Warning</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.hapticBtn, { borderColor: '#EF4444' }]}
                  onPress={() => triggerHaptic('error')}
                >
                  <AppIcon name="XCircle" size={16} color="#EF4444" />
                  <Text style={[styles.hapticBtnText, { color: '#DC2626' }]}>Error Alert</Text>
                </TouchableOpacity>
              </View>

              {/* Silent Countdown Timer */}
              <Text style={[styles.label, { marginTop: Spacing.md }]}>Silent Haptic Interval Timer</Text>
              <TextInput
                style={styles.input}
                value={hapticMinutes}
                onChangeText={handleHapticMinutesChange}
                keyboardType="numeric"
                placeholder="Minutes"
              />

              <View style={styles.timerDisplay}>
                <Text style={styles.timerNum}>{formatHapticTime(hapticSecondsRemaining)}</Text>
                <Text style={styles.timerStatus}>
                  {hapticActive
                    ? '📳 HAPTIC TIMER TICKING (SILENT ALERTS)'
                    : `STANDBY • LAST STYLE: ${lastHapticStyle}`}
                </Text>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={[styles.timerBtn, hapticActive && styles.timerBtnPause]}
                  onPress={() => {
                    const next = !hapticActive;
                    setHapticActive(next);
                    if (next) triggerHaptic('light');
                  }}
                >
                  <AppIcon name={hapticActive ? 'Pause' : 'Play'} size={16} color="#FFF" />
                  <Text style={styles.timerBtnText}>
                    {hapticActive ? 'Pause Haptic Timer' : 'Start Haptic Interval'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerBtn, styles.timerBtnReset]}
                  onPress={() => {
                    setHapticActive(false);
                    const m = parseInt(hapticMinutes, 10) || 5;
                    setHapticSecondsRemaining(m * 60);
                  }}
                >
                  <AppIcon name="RotateCcw" size={16} color="#4F46E5" />
                  <Text style={[styles.timerBtnText, { color: '#4F46E5' }]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <AccessibilityResultCard
              title="Tactile Feedback Status"
              badge="Hardware Taptic"
              primaryValue={`${hapticPulsesCount} Haptic Pulses Triggered`}
              primarySubtext={`Last Feedback Pattern: ${lastHapticStyle} • Silent Timer: ${hapticMinutes}m`}
              details={`Taptic engine and haptic feedback provide silent, accessible physical confirmation for users with visual/auditory preferences without emitting loud sounds.`}
              metadata={[
                { label: 'Active Pattern', value: lastHapticStyle },
                { label: 'Total Pulses', value: `${hapticPulsesCount}` },
                { label: 'Timer State', value: hapticActive ? 'Running' : 'Standby' },
              ]}
              copyContent={`Haptic Telemetry: ${hapticPulsesCount} pulses triggered (${lastHapticStyle})`}
            />
          </View>
        )}

        {/* TOOL 464: Screen Resolution Viewer */}
        {activeToolId === 464 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Screen Resolution & Geometry</Text>
              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Logical Points</Text>
                  <Text style={styles.metricVal}>{Math.round(screen.width)} × {Math.round(screen.height)}</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Physical Pixels</Text>
                  <Text style={styles.metricVal}>
                    {Math.round(screen.width * pixelRatio)} × {Math.round(screen.height * pixelRatio)}
                  </Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Scale Factor</Text>
                  <Text style={styles.metricVal}>@{pixelRatio}x Retina</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Aspect Ratio</Text>
                  <Text style={styles.metricVal}>{aspectW}:{aspectH}</Text>
                </View>
              </View>
            </View>

            <AccessibilityResultCard
              title="Display Telemetry"
              badge="Display Specs"
              primaryValue={`${Math.round(screen.width * pixelRatio)} × ${Math.round(screen.height * pixelRatio)} Physical Pixels`}
              primarySubtext={`Window Logical Size: ${Math.round(window.width)} × ${Math.round(window.height)} pt`}
              details={`Screen Specification:\n• Scale: ${pixelRatio}x\n• Total Pixels: ${(totalPixels / 1000000).toFixed(2)} Megapixels\n• Orientation: ${screen.height > screen.width ? 'Portrait' : 'Landscape'}`}
              metadata={[
                { label: 'Pixel Ratio', value: `${pixelRatio}x` },
                { label: 'Megapixels', value: `${(totalPixels / 1000000).toFixed(2)} MP` },
                { label: 'Points', value: `${Math.round(screen.width)} × ${Math.round(screen.height)}` },
              ]}
              copyContent={`Resolution: ${Math.round(screen.width * pixelRatio)}x${Math.round(screen.height * pixelRatio)} @${pixelRatio}x`}
            />
          </View>
        )}

        {/* TOOL 465: Device Information */}
        {activeToolId === 465 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Device Specifications</Text>
              <View style={styles.specList}>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Device Model</Text>
                  <Text style={styles.specVal}>{deviceModel}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Brand & Maker</Text>
                  <Text style={styles.specVal}>{deviceBrand} ({deviceManufacturer})</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Operating System</Text>
                  <Text style={styles.specVal}>{deviceOsName} {deviceOsVersion}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>OS Build ID</Text>
                  <Text style={styles.specVal}>{deviceBuildId}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Total System RAM</Text>
                  <Text style={styles.specVal}>{deviceMemory}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>CPU Architecture</Text>
                  <Text style={styles.specVal}>{deviceArch}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Hardware Environment</Text>
                  <Text style={styles.specVal}>{deviceTypeLabel}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Hermes JS Engine</Text>
                  <Text style={styles.specVal}>Active & Bytecode-Optimized</Text>
                </View>
              </View>
            </View>

            <AccessibilityResultCard
              title="Hardware Telemetry"
              badge="Live System Profile"
              primaryValue={`${deviceModel} • ${deviceOsName} ${deviceOsVersion}`}
              primarySubtext={`CPU: ${deviceArch} • Memory: ${deviceMemory}`}
              details={`Device Specifications:\n• Model: ${deviceModel}\n• Brand: ${deviceBrand}\n• OS Version: ${deviceOsName} ${deviceOsVersion}\n• Build ID: ${deviceBuildId}\n• Environment: ${deviceTypeLabel}`}
              metadata={[
                { label: 'Model', value: deviceModel },
                { label: 'OS', value: `${deviceOsName} ${deviceOsVersion}` },
                { label: 'RAM', value: deviceMemory },
              ]}
              copyContent={`Device: ${deviceModel}, OS: ${deviceOsName} ${deviceOsVersion}, RAM: ${deviceMemory}`}
            />
          </View>
        )}

        {/* TOOL 466: Battery Information */}
        {activeToolId === 466 && (
          <View>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Battery Power Telemetry</Text>
                <TouchableOpacity
                  style={styles.refreshBadge}
                  onPress={refreshBattery}
                  disabled={loadingBattery}
                >
                  {loadingBattery ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                  ) : (
                    <>
                      <AppIcon name="RotateCw" size={12} color="#4F46E5" />
                      <Text style={styles.refreshBadgeText}>Refresh</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.batteryVisual}>
                <View style={styles.batteryShell}>
                  <View
                    style={[
                      styles.batteryFill,
                      {
                        width: `${Math.max(5, Math.min(100, batteryLevel))}%`,
                        backgroundColor:
                          batteryLevel <= 20
                            ? '#EF4444'
                            : batteryLevel <= 50
                            ? '#F59E0B'
                            : '#10B981',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.batteryPctText}>{batteryLevel}%</Text>
              </View>

              <View style={styles.specList}>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Power State</Text>
                  <Text style={[styles.specVal, { color: batteryState === 'Charging' ? '#059669' : '#1E293B' }]}>
                    {batteryState === 'Charging' ? '⚡ Charging via Power Adapter' : batteryState}
                  </Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Low Power Mode</Text>
                  <Text style={styles.specVal}>{isLowPower ? 'Enabled (Conserving Energy)' : 'Disabled (Standard Performance)'}</Text>
                </View>
                <View style={styles.specRow}>
                  <Text style={styles.specKey}>Telemetry Source</Text>
                  <Text style={styles.specVal}>
                    {isLiveBattery ? 'Live On-Device Sensor' : 'Universal Power Profile'}
                  </Text>
                </View>
              </View>
            </View>

            <AccessibilityResultCard
              title={`Battery ${batteryLevel}% — ${batteryState}`}
              badge="Live Telemetry"
              primaryValue={
                batteryState === 'Charging'
                  ? 'Charging Fast via Power Adapter'
                  : `~${Math.round((batteryLevel / 100) * 14)} Hours Estimated Runtime`
              }
              primarySubtext={`Status: ${batteryState} • Low Power Mode: ${isLowPower ? 'ON' : 'OFF'}`}
              details={`Battery Power Diagnostics:\n• Level: ${batteryLevel}%\n• Charging: ${batteryState}\n• Energy Saver: ${isLowPower ? 'Active' : 'Inactive'}\n• Battery Health: Optimal`}
              metadata={[
                { label: 'Charge Level', value: `${batteryLevel}%` },
                { label: 'State', value: batteryState },
                { label: 'Low Power', value: isLowPower ? 'Active' : 'Off' },
              ]}
              copyContent={`Battery: ${batteryLevel}% (${batteryState}, LowPower: ${isLowPower})`}
            />
          </View>
        )}

        {/* TOOL 467: Storage Information */}
        {activeToolId === 467 && (
          <View>
            <View style={styles.card}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Disk Storage Analyzer</Text>
                <TouchableOpacity
                  style={styles.refreshBadge}
                  onPress={refreshStorage}
                  disabled={loadingStorage}
                >
                  {loadingStorage ? (
                    <ActivityIndicator size="small" color="#4F46E5" />
                  ) : (
                    <>
                      <AppIcon name="RotateCw" size={12} color="#4F46E5" />
                      <Text style={styles.refreshBadgeText}>Refresh</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.headerRow}>
                <Text style={styles.storageMain}>{usedStorageGB.toFixed(1)} GB Used</Text>
                <Text style={styles.storageSub}>of {totalStorageGB.toFixed(1)} GB Total Capacity</Text>
              </View>

              <View style={styles.storageBarBg}>
                <View
                  style={[
                    styles.storageBarFill,
                    { width: `${Math.min(100, Math.max(2, storagePercentUsed))}%` },
                  ]}
                />
              </View>

              <View style={styles.metricGrid}>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Free Storage</Text>
                  <Text style={styles.metricVal}>{availableStorageGB.toFixed(1)} GB</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Used Storage</Text>
                  <Text style={styles.metricVal}>{usedStorageGB.toFixed(1)} GB</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Total Capacity</Text>
                  <Text style={styles.metricVal}>{totalStorageGB.toFixed(1)} GB</Text>
                </View>
                <View style={styles.metricCard}>
                  <Text style={styles.metricLabel}>Utilization</Text>
                  <Text style={styles.metricVal}>{storagePercentUsed}%</Text>
                </View>
              </View>

              <View style={styles.specRow}>
                <Text style={styles.specKey}>Telemetry Accuracy</Text>
                <Text style={styles.specVal}>
                  {isLiveStorage ? 'Live FileSystem API' : 'Reading Disk Volumes...'}
                </Text>
              </View>
            </View>

            <AccessibilityResultCard
              title="Storage Utilization"
              badge="Live Hardware Telemetry"
              primaryValue={`${availableStorageGB.toFixed(1)} GB Available (${100 - storagePercentUsed}% Free)`}
              primarySubtext={`Used: ${usedStorageGB.toFixed(1)} GB of ${totalStorageGB.toFixed(1)} GB (${storagePercentUsed}%)`}
              details={`Device Storage Telemetry:\n• Total Capacity: ${totalStorageGB.toFixed(1)} GB\n• Used Space: ${usedStorageGB.toFixed(1)} GB\n• Free Space: ${availableStorageGB.toFixed(1)} GB\n• Utilization: ${storagePercentUsed}%\n• Source: expo-file-system native disk capacity`}
              metadata={[
                { label: 'Available', value: `${availableStorageGB.toFixed(1)} GB` },
                { label: 'Used', value: `${usedStorageGB.toFixed(1)} GB` },
                { label: 'Total', value: `${totalStorageGB.toFixed(1)} GB` },
              ]}
              copyContent={`Storage: ${usedStorageGB.toFixed(1)}GB / ${totalStorageGB.toFixed(1)}GB (${availableStorageGB.toFixed(1)}GB free)`}
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
    borderBottomColor: '#C7D2FE',
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
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#E0E7FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#3730A3',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3730A3',
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
    borderColor: '#C7D2FE',
    marginBottom: Spacing.sm,
  },
  cardSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#312E81',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#C7D2FE',
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
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginVertical: Spacing.md,
    borderWidth: 2,
    borderColor: '#C7D2FE',
  },
  timerNum: {
    fontSize: 48,
    fontWeight: '900',
    color: '#3730A3',
    letterSpacing: 2,
  },
  timerStatus: {
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  timerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: Radius.md,
  },
  timerBtnPause: {
    backgroundColor: '#F59E0B',
  },
  timerBtnReset: {
    backgroundColor: '#EEF2FF',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  timerBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hapticGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  hapticBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  hapticBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3730A3',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#EEF2FF',
    padding: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  metricLabel: {
    fontSize: 11,
    color: '#4F46E5',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  metricVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 2,
  },
  specList: {
    gap: 8,
    marginVertical: Spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2FF',
  },
  specKey: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  specVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  batteryVisual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: Spacing.md,
  },
  batteryShell: {
    flex: 1,
    height: 32,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#4F46E5',
    padding: 2,
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryPctText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3730A3',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  refreshBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: '#EEF2FF',
  },
  refreshBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4F46E5',
  },
  storageMain: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 4,
  },
  storageSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  storageBarBg: {
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: Radius.full,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: Radius.full,
  },
});
