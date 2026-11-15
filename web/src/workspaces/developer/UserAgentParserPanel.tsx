import React, { useState, useMemo } from 'react';
import {
  Laptop,
  Smartphone,
  Tablet,
  Bot,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Info,
  ShieldCheck,
  Cpu,
  Monitor,
  Compass,
} from 'lucide-react';

interface UaParseDetails {
  raw: string;
  browser: { name: string; version: string; major: string };
  os: { name: string; version: string };
  engine: { name: string; version: string };
  device: { type: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Other'; model: string };
  isBot: boolean;
  botName?: string;
  clientHints?: {
    screenResolution?: string;
    pixelRatio?: number;
    platform?: string;
    language?: string;
    touchPoints?: number;
  };
}

const PRESET_USER_AGENTS = [
  {
    label: 'My Current Browser',
    category: 'Local',
    ua: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  },
  {
    label: 'iPhone 16 Pro (Safari iOS 18)',
    category: 'Mobile',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  },
  {
    label: 'Samsung Galaxy S24 (Chrome Android 14)',
    category: 'Mobile',
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.102 Mobile Safari/537.36',
  },
  {
    label: 'MacBook Pro (macOS Safari 18)',
    category: 'Desktop',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  },
  {
    label: 'Windows 11 (Google Chrome 131)',
    category: 'Desktop',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  },
  {
    label: 'Windows 11 (Microsoft Edge 131)',
    category: 'Desktop',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.2903.86',
  },
  {
    label: 'Ubuntu Linux (Firefox 132)',
    category: 'Desktop',
    ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0',
  },
  {
    label: 'iPad Pro (iPadOS 18)',
    category: 'Tablet',
    ua: 'Mozilla/5.0 (iPad; CPU OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  },
  {
    label: 'Googlebot Smartphone',
    category: 'Bot',
    ua: 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.116 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  },
];

export function parseUserAgentString(ua: string): UaParseDetails {
  const trimmed = ua.trim();
  const lower = trimmed.toLowerCase();

  // Bot detection
  const isBot =
    /bot|crawler|spider|crawling|headless|lighthouse|slurp|duckduckbot|baiduspider|yandexbot/i.test(
      trimmed
    );
  let botName = '';
  if (isBot) {
    if (/googlebot/i.test(trimmed)) botName = 'Googlebot';
    else if (/bingbot/i.test(trimmed)) botName = 'Bingbot';
    else if (/duckduckbot/i.test(trimmed)) botName = 'DuckDuckBot';
    else if (/twitterbot/i.test(trimmed)) botName = 'Twitterbot';
    else if (/lighthouse/i.test(trimmed)) botName = 'Google Lighthouse';
    else botName = 'Generic Web Crawler / Bot';
  }

  // Browser detection
  let browserName = 'Unknown Browser';
  let browserVersion = '';
  if (/Edg\//i.test(trimmed)) {
    browserName = 'Microsoft Edge';
    browserVersion = trimmed.match(/Edg\/([\d.]+)/i)?.[1] || '';
  } else if (/OPR\//i.test(trimmed) || /Opera/i.test(trimmed)) {
    browserName = 'Opera';
    browserVersion = trimmed.match(/OPR\/([\d.]+)/i)?.[1] || trimmed.match(/Opera\/([\d.]+)/i)?.[1] || '';
  } else if (/Brave/i.test(trimmed)) {
    browserName = 'Brave';
    browserVersion = trimmed.match(/Chrome\/([\d.]+)/i)?.[1] || '';
  } else if (/Vivaldi\//i.test(trimmed)) {
    browserName = 'Vivaldi';
    browserVersion = trimmed.match(/Vivaldi\/([\d.]+)/i)?.[1] || '';
  } else if (/SamsungBrowser\//i.test(trimmed)) {
    browserName = 'Samsung Internet';
    browserVersion = trimmed.match(/SamsungBrowser\/([\d.]+)/i)?.[1] || '';
  } else if (/Chrome\//i.test(trimmed) && !/Chromium/i.test(trimmed)) {
    browserName = 'Google Chrome';
    browserVersion = trimmed.match(/Chrome\/([\d.]+)/i)?.[1] || '';
  } else if (/Firefox\//i.test(trimmed)) {
    browserName = 'Mozilla Firefox';
    browserVersion = trimmed.match(/Firefox\/([\d.]+)/i)?.[1] || '';
  } else if (/Version\/.*Safari\//i.test(trimmed)) {
    browserName = 'Apple Safari';
    browserVersion = trimmed.match(/Version\/([\d.]+)/i)?.[1] || '';
  } else if (/MSIE\s|Trident\//i.test(trimmed)) {
    browserName = 'Internet Explorer';
    browserVersion = trimmed.match(/(?:MSIE |rv:)([\d.]+)/i)?.[1] || '';
  }

  const browserMajor = browserVersion.split('.')[0] || '';

  // Operating System detection
  let osName = 'Unknown OS';
  let osVersion = '';
  if (/Windows NT 10/i.test(trimmed)) {
    osName = 'Windows';
    osVersion = '10 / 11';
  } else if (/Windows NT 6.3/i.test(trimmed)) {
    osName = 'Windows';
    osVersion = '8.1';
  } else if (/Windows NT 6.1/i.test(trimmed)) {
    osName = 'Windows';
    osVersion = '7';
  } else if (/iPhone/i.test(trimmed)) {
    osName = 'iOS (iPhone)';
    osVersion = (trimmed.match(/iPhone OS ([\d_]+)/i)?.[1] || '').replace(/_/g, '.');
  } else if (/iPad/i.test(trimmed)) {
    osName = 'iPadOS';
    osVersion = (trimmed.match(/OS ([\d_]+)/i)?.[1] || '').replace(/_/g, '.');
  } else if (/Mac OS X/i.test(trimmed)) {
    osName = 'macOS';
    osVersion = (trimmed.match(/Mac OS X ([\d_]+)/i)?.[1] || '').replace(/_/g, '.');
  } else if (/Android/i.test(trimmed)) {
    osName = 'Android';
    osVersion = trimmed.match(/Android ([\d.]+)/i)?.[1] || '';
  } else if (/CrOS/i.test(trimmed)) {
    osName = 'ChromeOS';
    osVersion = trimmed.match(/CrOS \w+ ([\d.]+)/i)?.[1] || '';
  } else if (/Linux/i.test(trimmed)) {
    osName = 'Linux';
  }

  // Rendering Engine
  let engineName = 'Unknown';
  let engineVersion = '';
  if (/Gecko\/\d/i.test(trimmed) && /Firefox\//i.test(trimmed)) {
    engineName = 'Gecko';
    engineVersion = trimmed.match(/rv:([\d.]+)/i)?.[1] || '';
  } else if (/AppleWebKit/i.test(trimmed)) {
    engineName = /Chrome|Edg|OPR|SamsungBrowser/i.test(trimmed) ? 'Blink' : 'WebKit';
    engineVersion = trimmed.match(/AppleWebKit\/([\d.]+)/i)?.[1] || '';
  } else if (/Trident\//i.test(trimmed)) {
    engineName = 'Trident';
    engineVersion = trimmed.match(/Trident\/([\d.]+)/i)?.[1] || '';
  }

  // Device Type
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Other' = 'Desktop';
  if (isBot) deviceType = 'Bot';
  else if (/iPad|Tablet|(Android(?!.*Mobile))/i.test(trimmed)) deviceType = 'Tablet';
  else if (/Mobi|iPhone|Android.*Mobile/i.test(trimmed)) deviceType = 'Mobile';

  // Device Model
  let model = 'Personal Computer';
  if (deviceType === 'Mobile') {
    if (/iPhone/i.test(trimmed)) model = 'Apple iPhone';
    else if (/SM-[A-Z0-9]+/i.test(trimmed)) model = trimmed.match(/(SM-[A-Z0-9]+)/i)?.[1] || 'Samsung Galaxy';
    else if (/Pixel [A-Z0-9 ]+/i.test(trimmed)) model = trimmed.match(/(Pixel [A-Z0-9 ]+)/i)?.[1] || 'Google Pixel';
    else model = 'Android Smartphone';
  } else if (deviceType === 'Tablet') {
    model = /iPad/i.test(trimmed) ? 'Apple iPad' : 'Android Tablet';
  } else if (osName === 'macOS') {
    model = 'Apple Mac';
  }

  // Client telemetry if available
  const clientHints: any = {};
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
    if (trimmed === navigator.userAgent) {
      clientHints.screenResolution = `${window.screen.width} x ${window.screen.height}`;
      clientHints.pixelRatio = window.devicePixelRatio;
      clientHints.platform = navigator.platform;
      clientHints.language = navigator.language;
      clientHints.touchPoints = navigator.maxTouchPoints;
    }
  }

  return {
    raw: trimmed,
    browser: { name: browserName, version: browserVersion, major: browserMajor },
    os: { name: osName, version: osVersion },
    engine: { name: engineName, version: engineVersion },
    device: { type: deviceType, model },
    isBot,
    botName,
    clientHints: Object.keys(clientHints).length > 0 ? clientHints : undefined,
  };
}

export const UserAgentParserPanel: React.FC = () => {
  const [uaInput, setUaInput] = useState<string>(
    typeof navigator !== 'undefined' ? navigator.userAgent : PRESET_USER_AGENTS[1].ua
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const parsed: UaParseDetails = useMemo(() => {
    return parseUserAgentString(uaInput);
  }, [uaInput]);

  return (
    <div className="space-y-6">
      {/* Top Input Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-500" />
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              User-Agent String
            </label>
          </div>
          <button
            onClick={() =>
              setUaInput(typeof navigator !== 'undefined' ? navigator.userAgent : PRESET_USER_AGENTS[1].ua)
            }
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Load My Browser UA</span>
          </button>
        </div>

        <textarea
          value={uaInput}
          onChange={(e) => setUaInput(e.target.value)}
          rows={3}
          placeholder="Paste any User-Agent string here..."
          className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs font-medium text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
        />

        {/* Quick Preset Selector */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
            Sample Devices & Bots
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_USER_AGENTS.map((p) => (
              <button
                key={p.label}
                onClick={() => setUaInput(p.ua)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  uaInput === p.ua
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Breakdown Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Browser Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Browser</span>
            <Compass className="w-4 h-4 text-sky-500" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {parsed.browser.name}
          </h4>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <span>Version:</span>
            <strong className="text-slate-800 dark:text-slate-200">{parsed.browser.version || 'N/A'}</strong>
          </div>
        </div>

        {/* Operating System Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Operating System</span>
            <Monitor className="w-4 h-4 text-indigo-500" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {parsed.os.name}
          </h4>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <span>Version:</span>
            <strong className="text-slate-800 dark:text-slate-200">{parsed.os.version || 'Standard'}</strong>
          </div>
        </div>

        {/* Engine Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Rendering Engine</span>
            <Cpu className="w-4 h-4 text-purple-500" />
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {parsed.engine.name}
          </h4>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <span>Engine Build:</span>
            <strong className="text-slate-800 dark:text-slate-200">{parsed.engine.version || 'N/A'}</strong>
          </div>
        </div>

        {/* Device & Form Factor Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] uppercase font-bold tracking-wider">Device Form Factor</span>
            {parsed.device.type === 'Mobile' ? (
              <Smartphone className="w-4 h-4 text-emerald-500" />
            ) : parsed.device.type === 'Tablet' ? (
              <Tablet className="w-4 h-4 text-emerald-500" />
            ) : parsed.device.type === 'Bot' ? (
              <Bot className="w-4 h-4 text-rose-500" />
            ) : (
              <Laptop className="w-4 h-4 text-sky-500" />
            )}
          </div>
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            {parsed.device.type}
          </h4>
          <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500 dark:text-slate-400">
            <span>Hardware Model:</span>
            <strong className="text-slate-800 dark:text-slate-200 truncate">{parsed.device.model}</strong>
          </div>
        </div>
      </div>

      {/* Bot Warning Banner if Detected */}
      {parsed.isBot && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
          <Bot className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <div>
            <h5 className="text-xs font-bold text-amber-900 dark:text-amber-200">
              Crawler / Search Engine Bot Detected: {parsed.botName}
            </h5>
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              This request string matches automated indexer and crawler patterns.
            </p>
          </div>
        </div>
      )}

      {/* Local Client Hardware Telemetry (if inspect is on current browser) */}
      {parsed.clientHints && (
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Live Client Display & Navigator Telemetry
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              Verified Local
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Resolution</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {parsed.clientHints.screenResolution}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Device Pixel Ratio</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {parsed.clientHints.pixelRatio}x Retina
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Platform Architecture</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {parsed.clientHints.platform}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Touch Capability</span>
              <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                {parsed.clientHints.touchPoints && parsed.clientHints.touchPoints > 0 ? 'Touchscreen' : 'Mouse Only'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* JSON Payload Export */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            JSON Telemetry Representation
          </span>
          <button
            onClick={() => copyToClipboard(JSON.stringify(parsed, null, 2), 'json')}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            {copiedKey === 'json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy JSON</span>
          </button>
        </div>
        <pre className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[300px] overflow-y-auto">
          {JSON.stringify(parsed, null, 2)}
        </pre>
      </div>
    </div>
  );
};
