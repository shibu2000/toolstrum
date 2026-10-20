import { Platform, Vibration } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';

// Helper to check if a native module is registered in the binary
const isNativeModuleAvailable = (moduleName: string): boolean => {
  try {
    const mod = requireOptionalNativeModule(moduleName);
    return Boolean(mod);
  } catch (err) {
    return false;
  }
};

// Safe dynamic loader for ExpoBrightness
let _brightnessModule: any = null;
let _brightnessLoaded = false;
export const getBrightnessApi = () => {
  if (_brightnessLoaded) return _brightnessModule;
  _brightnessLoaded = true;
  if (!isNativeModuleAvailable('ExpoBrightness')) {
    _brightnessModule = null;
    return null;
  }
  try {
    _brightnessModule = require('expo-brightness');
  } catch (err) {
    _brightnessModule = null;
  }
  return _brightnessModule;
};

// Safe dynamic loader for ExpoBattery
let _batteryModule: any = null;
let _batteryLoaded = false;
export const getBatteryApi = () => {
  if (_batteryLoaded) return _batteryModule;
  _batteryLoaded = true;
  if (!isNativeModuleAvailable('ExpoBattery')) {
    _batteryModule = null;
    return null;
  }
  try {
    _batteryModule = require('expo-battery');
  } catch (err) {
    _batteryModule = null;
  }
  return _batteryModule;
};

// Safe dynamic loader for ExpoDevice
let _deviceModule: any = null;
let _deviceLoaded = false;
export const getDeviceApi = () => {
  if (_deviceLoaded) return _deviceModule;
  _deviceLoaded = true;
  if (!isNativeModuleAvailable('ExpoDevice')) {
    _deviceModule = null;
    return null;
  }
  try {
    _deviceModule = require('expo-device');
  } catch (err) {
    _deviceModule = null;
  }
  return _deviceModule;
};

// Safe dynamic loader for ExpoHaptics
let _hapticsModule: any = null;
let _hapticsLoaded = false;
export const getHapticsApi = () => {
  if (_hapticsLoaded) return _hapticsModule;
  _hapticsLoaded = true;
  if (!isNativeModuleAvailable('ExpoHaptics')) {
    _hapticsModule = null;
    return null;
  }
  try {
    _hapticsModule = require('expo-haptics');
  } catch (err) {
    _hapticsModule = null;
  }
  return _hapticsModule;
};

// Safe dynamic loader for ExpoFileSystem legacy
let _fileSystemModule: any = null;
let _fileSystemLoaded = false;
export const getFileSystemApi = () => {
  if (_fileSystemLoaded) return _fileSystemModule;
  _fileSystemLoaded = true;
  if (!isNativeModuleAvailable('ExpoFileSystem')) {
    _fileSystemModule = null;
    return null;
  }
  try {
    _fileSystemModule = require('expo-file-system/legacy');
  } catch (err) {
    _fileSystemModule = null;
  }
  return _fileSystemModule;
};

// Haptic feedback trigger helper
export const safeTriggerHaptic = async (
  style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' | 'success' | 'warning' | 'error' | 'selection'
): Promise<boolean> => {
  const haptics = getHapticsApi();
  if (haptics) {
    try {
      if (style === 'light') {
        await haptics.impactAsync(haptics.ImpactFeedbackStyle?.Light);
      } else if (style === 'medium') {
        await haptics.impactAsync(haptics.ImpactFeedbackStyle?.Medium);
      } else if (style === 'heavy') {
        await haptics.impactAsync(haptics.ImpactFeedbackStyle?.Heavy);
      } else if (style === 'rigid') {
        await haptics.impactAsync(haptics.ImpactFeedbackStyle?.Rigid);
      } else if (style === 'soft') {
        await haptics.impactAsync(haptics.ImpactFeedbackStyle?.Soft);
      } else if (style === 'success') {
        await haptics.notificationAsync(haptics.NotificationFeedbackType?.Success);
      } else if (style === 'warning') {
        await haptics.notificationAsync(haptics.NotificationFeedbackType?.Warning);
      } else if (style === 'error') {
        await haptics.notificationAsync(haptics.NotificationFeedbackType?.Error);
      } else if (style === 'selection') {
        await haptics.selectionAsync();
      }
      return true;
    } catch (e) {
      // Fallback
    }
  }

  // Graceful fallback to React Native Vibration
  try {
    if (style === 'heavy' || style === 'error') {
      Vibration.vibrate(80);
    } else {
      Vibration.vibrate(40);
    }
    return true;
  } catch (e) {
    return false;
  }
};

// Screen brightness controller helper
export const safeSetBrightness = async (level: number): Promise<boolean> => {
  const brightness = getBrightnessApi();
  if (brightness) {
    try {
      const isAvail = await brightness.isAvailableAsync?.();
      if (isAvail) {
        await brightness.setBrightnessAsync(Math.max(0, Math.min(1, level)));
        return true;
      }
    } catch (e) {
      // Silently fall back
    }
  }
  return false;
};

export const safeGetBrightness = async (): Promise<number | null> => {
  const brightness = getBrightnessApi();
  if (brightness) {
    try {
      const isAvail = await brightness.isAvailableAsync?.();
      if (isAvail) {
        return await brightness.getBrightnessAsync();
      }
    } catch (e) {
      return null;
    }
  }
  return null;
};
