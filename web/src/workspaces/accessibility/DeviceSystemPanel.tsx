import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Battery,
  BatteryCharging,
  HardDrive,
  Shield,
  BookOpen,
  Heart,
  Monitor,
  Cpu,
  Wifi,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ToolProps {
  toolId: number;
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const DeviceSystemPanel: React.FC<ToolProps> = ({ toolId, onCopy }) => {
  // 464: Screen Resolution Viewer
  const [screenInfo, setScreenInfo] = useState<{
    viewport: string;
    screen: string;
    avail: string;
    dpr: number;
    colorDepth: string;
    orientation: string;
  }>({
    viewport: `${typeof window !== 'undefined' ? window.innerWidth : 0} × ${typeof window !== 'undefined' ? window.innerHeight : 0}`,
    screen: `${typeof window !== 'undefined' ? window.screen.width : 0} × ${typeof window !== 'undefined' ? window.screen.height : 0}`,
    avail: `${typeof window !== 'undefined' ? window.screen.availWidth : 0} × ${typeof window !== 'undefined' ? window.screen.availHeight : 0}`,
    dpr: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    colorDepth: `${typeof window !== 'undefined' ? window.screen.colorDepth : 24}-bit`,
    orientation: typeof window !== 'undefined' && window.screen.orientation ? window.screen.orientation.type : 'landscape-primary',
  });

  // 465: Device Information
  const [deviceInfo, setDeviceInfo] = useState({
    cores: typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
    memory: typeof navigator !== 'undefined' ? (navigator as any).deviceMemory || 8 : 8,
    touch: typeof navigator !== 'undefined' ? navigator.maxTouchPoints > 0 : false,
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    platform: typeof navigator !== 'undefined' ? navigator.platform || 'macOS' : 'macOS',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  });

  // 466: Battery Information
  const [batteryInfo, setBatteryInfo] = useState<{
    level: number;
    charging: boolean;
    chargingTime: number;
    dischargingTime: number;
  } | null>(null);
  const [batterySupported, setBatterySupported] = useState(true);

  // 467: Storage Information
  const [storageData, setStorageData] = useState<{
    usage: number;
    quota: number;
    percent: number;
    persisted: boolean;
  } | null>(null);

  // 468: App Permission Guide
  const [permissions, setPermissions] = useState<Record<string, string>>({
    camera: 'checking...',
    microphone: 'checking...',
    notifications: 'checking...',
    geolocation: 'checking...',
    clipboard: 'checking...',
  });

  // 470: Emergency Card
  const [emergencyInfo, setEmergencyInfo] = useState(() => {
    try {
      const stored = localStorage.getItem('toolstrum_emergency_card');
      if (stored) return JSON.parse(stored);
    } catch {}
    return {
      name: 'John Doe',
      bloodType: 'O Positive (O+)',
      allergies: 'Penicillin, Shellfish',
      medications: 'None',
      contactName: 'Jane Doe (Spouse)',
      contactPhone: '+1 (555) 987-6543',
      notes: 'Carries EpiPen in backpack.',
    };
  });
  const [cardSaved, setCardSaved] = useState(false);

  // Update screen dimensions dynamically
  useEffect(() => {
    const handleResize = () => {
      setScreenInfo({
        viewport: `${window.innerWidth} × ${window.innerHeight}`,
        screen: `${window.screen.width} × ${window.screen.height}`,
        avail: `${window.screen.availWidth} × ${window.screen.availHeight}`,
        dpr: window.devicePixelRatio || 1,
        colorDepth: `${window.screen.colorDepth}-bit`,
        orientation: window.screen.orientation ? window.screen.orientation.type : 'landscape',
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Battery API Query
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          const update = () => {
            setBatteryInfo({
              level: Math.round(battery.level * 100),
              charging: battery.charging,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime,
            });
          };
          update();
          battery.addEventListener('levelchange', update);
          battery.addEventListener('chargingchange', update);
        })
        .catch(() => setBatterySupported(false));
    } else {
      setBatterySupported(false);
    }
  }, []);

  // Storage API Query
  const refreshStorage = async () => {
    if (typeof navigator !== 'undefined' && 'storage' in navigator && navigator.storage.estimate) {
      try {
        const est = await navigator.storage.estimate();
        const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;
        const usage = est.usage || 0;
        const quota = est.quota || 1;
        setStorageData({
          usage,
          quota,
          percent: Number(((usage / quota) * 100).toFixed(2)),
          persisted,
        });
      } catch {}
    }
  };

  useEffect(() => {
    refreshStorage();
  }, []);

  // Permission API Query
  const checkPermissions = async () => {
    if (typeof navigator !== 'undefined' && 'permissions' in navigator) {
      const perms: Record<string, string> = {};
      const targets = [
        ['camera', 'camera'],
        ['microphone', 'microphone'],
        ['notifications', 'notifications'],
        ['geolocation', 'geolocation'],
        ['clipboard', 'clipboard-read'],
      ];

      for (const [key, name] of targets) {
        try {
          const res = await (navigator.permissions as any).query({ name });
          perms[key] = res.state;
        } catch {
          perms[key] = 'prompt';
        }
      }
      setPermissions(perms);
    }
  };

  useEffect(() => {
    checkPermissions();
  }, []);

  // Save emergency card
  const saveEmergencyCard = () => {
    try {
      localStorage.setItem('toolstrum_emergency_card', JSON.stringify(emergencyInfo));
      setCardSaved(true);
      setTimeout(() => setCardSaved(false), 2500);
    } catch {}
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* 464: SCREEN RESOLUTION VIEWER */}
      {toolId === 464 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Monitor className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Screen Resolution & Viewport Metrics
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase">Live Viewport</span>
                <div className="text-xl font-black font-mono text-slate-900 dark:text-white">
                  {screenInfo.viewport} px
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase">Monitor Hardware Resolution</span>
                <div className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
                  {screenInfo.screen} px
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase">Available Bounds (Excl. Dock)</span>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                  {screenInfo.avail} px
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase">Device Pixel Ratio (DPR)</span>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                  {screenInfo.dpr}x Retina
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase">Display Color Depth</span>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200">
                  {screenInfo.colorDepth}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="text-slate-400 font-semibold text-[10px] uppercase">Screen Orientation</span>
                <div className="text-base font-bold font-mono text-slate-800 dark:text-slate-200 capitalize">
                  {screenInfo.orientation.replace('-', ' ')}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 465: DEVICE INFORMATION */}
      {toolId === 465 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Hardware Architecture & Platform Specifications
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <span className="text-slate-500">Logical CPU Threads</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.cores} Cores</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <span className="text-slate-500">Approximate RAM</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.memory} GB</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <span className="text-slate-500">Touch Interface</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {deviceInfo.touch ? 'Multi-Touch Detected' : 'Mouse / Trackpad'}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <span className="text-slate-500">Operating System Platform</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">{deviceInfo.platform}</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                <span className="text-slate-500">Network State</span>
                <span className={`font-bold font-mono ${deviceInfo.online ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {deviceInfo.online ? 'Connected' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 466: BATTERY INFORMATION */}
      {toolId === 466 && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center">
            <div className="flex items-center justify-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              {batteryInfo?.charging ? (
                <BatteryCharging className="w-5 h-5 text-emerald-500" />
              ) : (
                <Battery className="w-5 h-5 text-indigo-500" />
              )}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Battery Status & Power Telemetry
              </h3>
            </div>

            {batterySupported && batteryInfo ? (
              <div className="space-y-4">
                <div className="text-6xl font-black font-mono text-slate-900 dark:text-white">
                  {batteryInfo.level}%
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {batteryInfo.charging ? 'Currently Charging ⚡' : 'Running On Battery'}
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      batteryInfo.charging
                        ? 'bg-emerald-500'
                        : batteryInfo.level < 20
                        ? 'bg-rose-500'
                        : 'bg-indigo-600'
                    }`}
                    style={{ width: `${batteryInfo.level}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 text-xs">
                Battery Status API is not supported on this browser (or restricted on desktop devices).
              </div>
            )}
          </div>
        </div>
      )}

      {/* 467: STORAGE INFORMATION */}
      {toolId === 467 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Browser Persistent Storage & Quota
                </h3>
              </div>
              <button
                type="button"
                onClick={refreshStorage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Refresh
              </button>
            </div>

            {storageData ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Used Storage</span>
                    <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
                      {formatBytes(storageData.usage)}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total Quota</span>
                    <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                      {formatBytes(storageData.quota)}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Quota Consumed</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {storageData.percent}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 rounded-full transition-all"
                      style={{ width: `${Math.max(1, storageData.percent)}%` }}
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex justify-between text-xs">
                  <span className="text-slate-500">Eviction Persistence:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {storageData.persisted ? 'Granted (Persistent)' : 'Best-Effort Sandbox'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Estimating storage allocation...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 468: APP PERMISSION GUIDE */}
      {toolId === 468 && (
        <div className="max-w-xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Shield className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Browser Permissions & Privacy Inspector
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Inspect active browser hardware entitlements. Toolstrum requests access only on-demand when you invoke a specific offline camera or microphone tool.
            </p>

            <div className="space-y-2 text-xs">
              {Object.entries(permissions).map(([perm, status]) => (
                <div
                  key={perm}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-between"
                >
                  <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
                    {perm} Access
                  </span>
                  <span
                    className={`font-mono font-bold uppercase text-[11px] px-2.5 py-1 rounded-full ${
                      status === 'granted'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40'
                        : status === 'denied'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 469: OFFLINE REFERENCE LIBRARY */}
      {toolId === 469 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Offline Quick Reference & First Aid Guide
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-800/40 space-y-1.5">
                <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                  Global Emergency Numbers
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>United States: <strong>911</strong></div>
                  <div>European Union: <strong>112</strong></div>
                  <div>United Kingdom: <strong>999</strong></div>
                  <div>India: <strong>112</strong></div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  CPR Essentials (Hands-Only for Adults)
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  1. Call emergency services immediately.<br />
                  2. Push hard and fast in the center of the chest to the beat of "Stayin' Alive" (100–120 compressions per minute).<br />
                  3. Allow chest to fully recoil between compressions.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Universal Accessibility Shortcuts
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  <div>Zoom In: <strong>Cmd/Ctrl + "+"</strong></div>
                  <div>Zoom Out: <strong>Cmd/Ctrl + "-"</strong></div>
                  <div>Reset Zoom: <strong>Cmd/Ctrl + 0</strong></div>
                  <div>High Contrast: <strong>Alt + Shift + PrtScn</strong></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 470: EMERGENCY INFORMATION CARD */}
      {toolId === 470 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Local Emergency Medical ICE Card
                </h3>
              </div>
              {cardSaved && (
                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved Locally
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {[
                { key: 'name', label: 'Full Name' },
                { key: 'bloodType', label: 'Blood Group / Type' },
                { key: 'allergies', label: 'Critical Allergies' },
                { key: 'medications', label: 'Current Medications' },
                { key: 'contactName', label: 'Emergency Contact Name' },
                { key: 'contactPhone', label: 'Emergency Contact Phone' },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={(emergencyInfo as any)[f.key]}
                    onChange={(e) =>
                      setEmergencyInfo((prev: any) => ({ ...prev, [f.key]: e.target.value }))
                    }
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="text-xs text-slate-600 dark:text-slate-400 font-semibold block mb-1">
                Special Medical Notes
              </label>
              <textarea
                rows={3}
                value={emergencyInfo.notes}
                onChange={(e) =>
                  setEmergencyInfo((prev: any) => ({ ...prev, notes: e.target.value }))
                }
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium"
              />
            </div>

            <button
              type="button"
              onClick={saveEmergencyCard}
              className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              Save Emergency Card On-Device
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
