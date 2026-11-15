import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Wifi,
  Globe,
  User,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Sliders,
  Layers,
  Sparkles,
  RefreshCw,
  Share2,
} from 'lucide-react';
import {
  buildWifiPayload,
  buildVCardPayload,
  buildEmailPayload,
  buildSmsPayload,
  buildPhonePayload,
  WifiQrConfig,
  VCardConfig,
} from './securityHelpers';

interface QrCodeStudioPanelProps {
  defaultMode?: 'url' | 'wifi' | 'contact' | 'text' | 'email' | 'phone' | 'sms' | 'vcard' | 'custom' | 'batch';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const QrCodeStudioPanel: React.FC<QrCodeStudioPanelProps> = ({
  defaultMode = 'url',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<'url' | 'wifi' | 'contact' | 'text' | 'email' | 'phone' | 'sms' | 'batch'>(() => {
    if (defaultMode === 'vcard') return 'contact';
    if (defaultMode === 'custom') return 'url';
    return defaultMode;
  });

  // URL state
  const [url, setUrl] = useState('https://toolstrum.vercel.app');
  const [showUtm, setShowUtm] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  // Wi-Fi state
  const [wifiConfig, setWifiConfig] = useState<WifiQrConfig>({
    ssid: 'Office-HighSpeed',
    password: 'superSecretPassword2026',
    encryption: 'WPA',
    hidden: false,
  });

  // vCard / Contact state
  const [contact, setContact] = useState<VCardConfig>({
    firstName: 'Alex',
    lastName: 'Morgan',
    organization: 'Toolstrum Inc.',
    title: 'Lead Architect',
    email: 'alex@toolstrum.app',
    phone: '+1 555-019-2834',
    url: 'https://toolstrum.vercel.app',
    address: 'San Francisco, CA',
    note: 'Offline Tools Developer',
  });

  // Text state
  const [plainText, setPlainText] = useState('Welcome to Toolstrum Offline Suite. All tools run 100% locally on your machine.');

  // Email state
  const [emailTo, setEmailTo] = useState('support@toolstrum.app');
  const [emailSubject, setEmailSubject] = useState('Product Feedback');
  const [emailBody, setEmailBody] = useState('Hi Toolstrum team,\n\nI really like the offline security tools.');

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState('+15550192834');

  // SMS state
  const [smsPhone, setSmsPhone] = useState('+15550192834');
  const [smsMessage, setSmsMessage] = useState('Hello! Checking out Toolstrum offline QR.');

  // Customizer styling state
  const [fgColor, setFgColor] = useState('#0d9488');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [margin, setMargin] = useState(2);
  const [centerIcon, setCenterIcon] = useState<'none' | 'wifi' | 'link' | 'phone' | 'mail' | 'shield'>('none');

  // Batch state
  const [batchInput, setBatchInput] = useState(
    'https://toolstrum.vercel.app\nhttps://github.com\nhttps://developer.mozilla.org\nWIFI:S:Guest-WiFi;T:WPA;P:guest123;;'
  );
  const [batchResults, setBatchResults] = useState<{ text: string; dataUrl: string }[]>([]);

  // Generated QR output
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [qrSvg, setQrSvg] = useState('');
  const [imgCopied, setImgCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Derive active payload string
  const getActivePayload = (): string => {
    switch (activeTab) {
      case 'url': {
        let base = url.trim() || 'https://toolstrum.vercel.app';
        if (!base.startsWith('http://') && !base.startsWith('https://')) {
          base = `https://${base}`;
        }
        if (showUtm && (utmSource || utmMedium || utmCampaign)) {
          const u = new URL(base);
          if (utmSource) u.searchParams.set('utm_source', utmSource);
          if (utmMedium) u.searchParams.set('utm_medium', utmMedium);
          if (utmCampaign) u.searchParams.set('utm_campaign', utmCampaign);
          return u.toString();
        }
        return base;
      }
      case 'wifi':
        return buildWifiPayload(wifiConfig);
      case 'contact':
        return buildVCardPayload(contact);
      case 'text':
        return plainText;
      case 'email':
        return buildEmailPayload(emailTo, emailSubject, emailBody);
      case 'phone':
        return buildPhonePayload(phoneNumber);
      case 'sms':
        return buildSmsPayload(smsPhone, smsMessage);
      default:
        return url;
    }
  };

  const payload = getActivePayload();

  // Generate Single QR Code
  useEffect(() => {
    if (activeTab === 'batch') return;
    if (!payload.trim()) {
      setQrDataUrl('');
      setQrSvg('');
      return;
    }

    QRCode.toDataURL(
      payload,
      {
        width: 400,
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      },
      (err, url) => {
        if (!err && url) setQrDataUrl(url);
      }
    );

    QRCode.toString(
      payload,
      {
        type: 'svg',
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      },
      (err, svg) => {
        if (!err && svg) setQrSvg(svg);
      }
    );
  }, [payload, activeTab, fgColor, bgColor, errorLevel, margin]);

  // Generate Batch QR Codes
  useEffect(() => {
    if (activeTab !== 'batch') return;
    const lines = batchInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    Promise.all(
      lines.map((line) =>
        new Promise<{ text: string; dataUrl: string }>((resolve) => {
          QRCode.toDataURL(
            line,
            {
              width: 240,
              margin: 1,
              errorCorrectionLevel: 'M',
              color: { dark: fgColor, light: bgColor },
            },
            (err, url) => {
              resolve({ text: line, dataUrl: url || '' });
            }
          );
        })
      )
    ).then(setBatchResults);
  }, [batchInput, activeTab, fgColor, bgColor]);

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `toolstrum-qr-${activeTab}.png`;
    a.click();
  };

  const handleDownloadSvg = () => {
    if (!qrSvg) return;
    const blob = new Blob([qrSvg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toolstrum-qr-${activeTab}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyImage = async () => {
    if (!qrDataUrl) return;
    try {
      const res = await fetch(qrDataUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setImgCopied(true);
      setTimeout(() => setImgCopied(false), 2000);
    } catch {
      // Fallback: copy payload text
      if (onCopy) onCopy(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'url', label: 'Website URL', icon: Globe },
          { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
          { id: 'contact', label: 'vCard Contact', icon: User },
          { id: 'text', label: 'Plain Text', icon: FileText },
          { id: 'email', label: 'Email', icon: Mail },
          { id: 'phone', label: 'Phone Call', icon: Phone },
          { id: 'sms', label: 'SMS Message', icon: MessageSquare },
          { id: 'batch', label: 'Batch Generator', icon: Layers },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-teal-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab !== 'batch' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form: 7 Cols */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
              {/* URL Form */}
              {activeTab === 'url' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Target URL or Domain
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono text-xs font-semibold">
                        https://
                      </span>
                      <input
                        type="text"
                        value={url.replace(/^https?:\/\//, '')}
                        onChange={(e) => setUrl(`https://${e.target.value}`)}
                        placeholder="example.com/page"
                        className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-medium focus:ring-2 focus:ring-teal-500/20"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowUtm(!showUtm)}
                      className="text-xs font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showUtm ? 'Hide Campaign Tracking (UTM)' : 'Add UTM Tracking Parameters'}</span>
                    </button>

                    {showUtm && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">UTM Source</label>
                          <input
                            type="text"
                            value={utmSource}
                            onChange={(e) => setUtmSource(e.target.value)}
                            placeholder="newsletter / twitter"
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">UTM Medium</label>
                          <input
                            type="text"
                            value={utmMedium}
                            onChange={(e) => setUtmMedium(e.target.value)}
                            placeholder="qr / banner"
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400 block mb-1">UTM Campaign</label>
                          <input
                            type="text"
                            value={utmCampaign}
                            onChange={(e) => setUtmCampaign(e.target.value)}
                            placeholder="summer_launch"
                            className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Wi-Fi Form */}
              {activeTab === 'wifi' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiConfig.ssid}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, ssid: e.target.value })}
                      placeholder="e.g. Home-5G"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                        Network Encryption
                      </label>
                      <select
                        value={wifiConfig.encryption}
                        onChange={(e) => setWifiConfig({ ...wifiConfig, encryption: e.target.value as any })}
                        className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium cursor-pointer"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3 (Standard)</option>
                        <option value="WEP">WEP (Legacy)</option>
                        <option value="nopass">None (Open Public)</option>
                      </select>
                    </div>

                    {wifiConfig.encryption !== 'nopass' && (
                      <div>
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Network Password
                        </label>
                        <input
                          type="text"
                          value={wifiConfig.password || ''}
                          onChange={(e) => setWifiConfig({ ...wifiConfig, password: e.target.value })}
                          placeholder="Wi-Fi Password"
                          className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                        />
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={wifiConfig.hidden || false}
                      onChange={(e) => setWifiConfig({ ...wifiConfig, hidden: e.target.checked })}
                      className="rounded accent-teal-600"
                    />
                    <span>Hidden SSID (Network does not broadcast name)</span>
                  </label>
                </div>
              )}

              {/* vCard Form */}
              {activeTab === 'contact' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">First Name</label>
                      <input
                        type="text"
                        value={contact.firstName}
                        onChange={(e) => setContact({ ...contact, firstName: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Last Name</label>
                      <input
                        type="text"
                        value={contact.lastName}
                        onChange={(e) => setContact({ ...contact, lastName: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Organization</label>
                      <input
                        type="text"
                        value={contact.organization || ''}
                        onChange={(e) => setContact({ ...contact, organization: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Job Title</label>
                      <input
                        type="text"
                        value={contact.title || ''}
                        onChange={(e) => setContact({ ...contact, title: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={contact.phone || ''}
                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 block mb-1">Email Address</label>
                      <input
                        type="email"
                        value={contact.email || ''}
                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 block mb-1">Website URL</label>
                    <input
                      type="text"
                      value={contact.url || ''}
                      onChange={(e) => setContact({ ...contact, url: e.target.value })}
                      className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Text Form */}
              {activeTab === 'text' && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Plain Text Content</span>
                    <span className="font-mono text-slate-400">{plainText.length} characters</span>
                  </div>
                  <textarea
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    rows={6}
                    placeholder="Enter any text, instructions, or notes to encode..."
                    className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono leading-relaxed"
                  />
                </div>
              )}

              {/* Email Form */}
              {activeTab === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="hello@domain.com"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Inquiry / Feedback"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Body Text</label>
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={3}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Phone Form */}
              {activeTab === 'phone' && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Telephone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 234 567 8900"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border text-sm font-mono font-bold"
                  />
                  <p className="text-[11px] text-slate-400">Scanning this QR initiates instant 1-tap dialing on mobile devices.</p>
                </div>
              )}

              {/* SMS Form */}
              {activeTab === 'sms' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Recipient Phone</label>
                    <input
                      type="tel"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      placeholder="+1 234 567 8900"
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Pre-filled Message</label>
                    <textarea
                      value={smsMessage}
                      onChange={(e) => setSmsMessage(e.target.value)}
                      rows={3}
                      placeholder="Type text message..."
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Customizer Settings Accordion */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Visual Customizer & Styling (Tool #363)
                </h4>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Foreground Color</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-20 text-xs font-mono font-bold uppercase bg-transparent border-0 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1.5">Background Color</label>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-20 text-xs font-mono font-bold uppercase bg-transparent border-0 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1.5">
                    Error Correction Level
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setErrorLevel(lvl)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          errorLevel === lvl
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {lvl} ({lvl === 'L' ? '7%' : lvl === 'M' ? '15%' : lvl === 'Q' ? '25%' : '30%'})
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                    <span>Quiet Zone Margin</span>
                    <span className="font-mono text-teal-600">{margin} modules</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="6"
                    value={margin}
                    onChange={(e) => setMargin(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer mt-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Preview Card: 5 Cols */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full">
                Live High-Density Vector QR
              </span>

              {qrDataUrl ? (
                <div
                  className="p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-all flex items-center justify-center"
                  style={{ backgroundColor: bgColor }}
                >
                  <img
                    src={qrDataUrl}
                    alt="Toolstrum QR Preview"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              ) : (
                <div className="w-56 h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-400">
                  Enter details to render
                </div>
              )}

              {/* Payload Preview */}
              <div className="w-full text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Encoded Payload:</span>
                <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300 break-all line-clamp-3">
                  {payload}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="w-full grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> PNG Image
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Vector SVG
                </button>
              </div>

              <div className="w-full flex gap-2">
                <button
                  type="button"
                  onClick={handleCopyImage}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {imgCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{imgCopied ? 'Image Copied' : 'Copy Image'}</span>
                </button>

                {onCopy && (
                  <button
                    type="button"
                    onClick={() => onCopy(payload)}
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Copy payload text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Payload'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Batch Mode: Tool #364 */
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Batch QR Generator (1 Entry Per Line)
              </h3>
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                {batchResults.length} Codes Generated
              </span>
            </div>
            <textarea
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              rows={5}
              placeholder="Enter URLs, text, or Wi-Fi strings separated by newlines..."
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {batchResults.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col items-center text-center space-y-2.5"
              >
                {item.dataUrl && (
                  <img src={item.dataUrl} alt={`QR ${idx + 1}`} className="w-36 h-36 object-contain" />
                )}
                <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate w-full">
                  {item.text}
                </span>
                <a
                  href={item.dataUrl}
                  download={`qr-${idx + 1}.png`}
                  className="w-full py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
