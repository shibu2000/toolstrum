import React, { useState, useMemo } from 'react';
import {
  QrCode,
  Copy,
  Check,
  Wifi,
  User,
  Mail,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  Key,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface ParsedQrResult {
  type: 'wifi' | 'vcard' | 'url' | 'email' | 'sms' | 'tel' | 'geo' | 'otp' | 'text';
  typeLabel: string;
  fields: { label: string; value: string; copyable?: boolean }[];
  raw: string;
}

const PRESET_QR_PAYLOADS = [
  {
    label: 'Wi-Fi Network',
    payload: 'WIFI:S:Toolstrum-Secure-Guest;T:WPA;P:SuperSecretPass123;H:false;;',
  },
  {
    label: 'vCard Business Contact',
    payload: `BEGIN:VCARD\nVERSION:3.0\nFN:Alex Mercer\nORG:Toolstrum Offline Systems\nTITLE:Chief Technology Officer\nTEL:+1-415-555-0199\nEMAIL:alex.mercer@toolstrum.app\nURL:https://www.toolstrum.app\nEND:VCARD`,
  },
  {
    label: 'TOTP Two-Factor Secret',
    payload: 'otpauth://totp/Toolstrum:alex@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Toolstrum&algorithm=SHA1&digits=6&period=30',
  },
  {
    label: 'SMS Message',
    payload: 'SMSTO:+14155552671:Check out Toolstrum local developer tools suite!',
  },
  {
    label: 'Email (mailto)',
    payload: 'mailto:support@toolstrum.app?subject=Offline%20Tools%20Feedback&body=I%20love%20the%20zero-telemetry%20speed.',
  },
  {
    label: 'Geo Location',
    payload: 'geo:37.7749,-122.4194?q=San+Francisco',
  },
];

export function parseQrPayload(raw: string): ParsedQrResult {
  const trimmed = raw.trim();

  // 1. Wi-Fi: WIFI:S:ssid;T:wpa;P:pass;H:hidden;;
  if (/^WIFI:/i.test(trimmed)) {
    const ssid = trimmed.match(/S:([^;]+)/i)?.[1] || '';
    const authType = trimmed.match(/T:([^;]+)/i)?.[1] || 'nopass';
    const password = trimmed.match(/P:([^;]+)/i)?.[1] || '';
    const hidden = trimmed.match(/H:([^;]+)/i)?.[1] || 'false';
    return {
      type: 'wifi',
      typeLabel: 'Wi-Fi Network Configuration',
      raw: trimmed,
      fields: [
        { label: 'Network Name (SSID)', value: ssid, copyable: true },
        { label: 'Security / Auth', value: authType.toUpperCase() },
        { label: 'Password', value: password || '(Open Network)', copyable: !!password },
        { label: 'Hidden Network', value: hidden.toLowerCase() === 'true' ? 'Yes' : 'No' },
      ],
    };
  }

  // 2. vCard: BEGIN:VCARD ... END:VCARD
  if (/^BEGIN:VCARD/i.test(trimmed)) {
    const fn = trimmed.match(/FN:(.*)/i)?.[1] || trimmed.match(/N:(.*)/i)?.[1] || 'Unknown';
    const org = trimmed.match(/ORG:(.*)/i)?.[1] || '';
    const title = trimmed.match(/TITLE:(.*)/i)?.[1] || '';
    const tel = trimmed.match(/TEL.*:(.*)/i)?.[1] || '';
    const email = trimmed.match(/EMAIL.*:(.*)/i)?.[1] || '';
    const url = trimmed.match(/URL.*:(.*)/i)?.[1] || '';

    const fields: { label: string; value: string; copyable?: boolean }[] = [{ label: 'Contact Name', value: fn.trim(), copyable: true }];
    if (org) fields.push({ label: 'Organization', value: org.trim() });
    if (title) fields.push({ label: 'Job Title', value: title.trim() });
    if (tel) fields.push({ label: 'Phone', value: tel.trim(), copyable: true });
    if (email) fields.push({ label: 'Email', value: email.trim(), copyable: true });
    if (url) fields.push({ label: 'Website', value: url.trim(), copyable: true });

    return {
      type: 'vcard',
      typeLabel: 'vCard Contact Card',
      raw: trimmed,
      fields,
    };
  }

  // 3. OTPAuth 2FA Secret
  if (/^otpauth:\/\//i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      const secret = u.searchParams.get('secret') || '';
      const issuer = u.searchParams.get('issuer') || '';
      const account = decodeURIComponent(u.pathname.replace(/^\/totp\/?/i, ''));
      const period = u.searchParams.get('period') || '30';
      const digits = u.searchParams.get('digits') || '6';

      return {
        type: 'otp',
        typeLabel: 'TOTP Two-Factor Authenticator Secret',
        raw: trimmed,
        fields: [
          { label: 'Account / Label', value: account },
          { label: 'Issuer', value: issuer || '(None)' },
          { label: 'Secret Key (Base32)', value: secret, copyable: true },
          { label: 'Interval (seconds)', value: `${period}s` },
          { label: 'Digits', value: digits },
        ],
      };
    } catch {
      // Fallback
    }
  }

  // 4. SMS: SMSTO:+1234567890:msg
  if (/^SMSTO:/i.test(trimmed)) {
    const parts = trimmed.slice(6).split(':');
    const number = parts[0] || '';
    const msg = parts.slice(1).join(':') || '';
    return {
      type: 'sms',
      typeLabel: 'SMS Text Message',
      raw: trimmed,
      fields: [
        { label: 'Recipient Number', value: number, copyable: true },
        { label: 'Pre-filled Message', value: msg, copyable: true },
      ],
    };
  }

  // 5. Email: mailto:
  if (/^mailto:/i.test(trimmed)) {
    try {
      const u = new URL(trimmed);
      const to = u.pathname;
      const subject = u.searchParams.get('subject') || '';
      const body = u.searchParams.get('body') || '';
      return {
        type: 'email',
        typeLabel: 'Email Dispatch (mailto)',
        raw: trimmed,
        fields: [
          { label: 'Recipient', value: to, copyable: true },
          { label: 'Subject', value: subject },
          { label: 'Message Body', value: body },
        ],
      };
    } catch {
      // Fallback
    }
  }

  // 6. Telephone: tel:
  if (/^tel:/i.test(trimmed)) {
    return {
      type: 'tel',
      typeLabel: 'Phone Call Dial',
      raw: trimmed,
      fields: [{ label: 'Phone Number', value: trimmed.slice(4), copyable: true }],
    };
  }

  // 7. Geo: geo:lat,lng
  if (/^geo:/i.test(trimmed)) {
    const coords = trimmed.slice(4).split('?')[0];
    const [lat, lng] = coords.split(',');
    return {
      type: 'geo',
      typeLabel: 'Geographic Location Coordinates',
      raw: trimmed,
      fields: [
        { label: 'Latitude', value: lat },
        { label: 'Longitude', value: lng },
        {
          label: 'Google Maps Link',
          value: `https://www.google.com/maps?q=${lat},${lng}`,
          copyable: true,
        },
      ],
    };
  }

  // 8. URL
  if (/^https?:\/\//i.test(trimmed)) {
    return {
      type: 'url',
      typeLabel: 'Web URL / Link',
      raw: trimmed,
      fields: [
        { label: 'Target URL', value: trimmed, copyable: true },
        { label: 'Scheme', value: trimmed.startsWith('https') ? 'HTTPS (Secure)' : 'HTTP' },
      ],
    };
  }

  // 9. Plain text fallback
  return {
    type: 'text',
    typeLabel: 'Plain Text Payload',
    raw: trimmed,
    fields: [
      { label: 'Content', value: trimmed, copyable: true },
      { label: 'Length', value: `${trimmed.length} characters` },
    ],
  };
}

export const QrPayloadInspectorPanel: React.FC = () => {
  const [inputVal, setInputVal] = useState<string>(PRESET_QR_PAYLOADS[0].payload);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const parsed: ParsedQrResult = useMemo(() => {
    return parseQrPayload(inputVal);
  }, [inputVal]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wifi':
        return <Wifi className="w-5 h-5 text-emerald-500" />;
      case 'vcard':
        return <User className="w-5 h-5 text-sky-500" />;
      case 'otp':
        return <Key className="w-5 h-5 text-amber-500" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-purple-500" />;
      case 'email':
        return <Mail className="w-5 h-5 text-blue-500" />;
      case 'tel':
        return <Phone className="w-5 h-5 text-emerald-500" />;
      case 'geo':
        return <MapPin className="w-5 h-5 text-rose-500" />;
      case 'url':
        return <Globe className="w-5 h-5 text-indigo-500" />;
      default:
        return <QrCode className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Presets */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              QR Code Payload Inspector & Structure Decoder
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Paste scanned QR string to unpack fields
          </span>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block mb-1.5">
            Decoded QR Text Content
          </label>
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            rows={4}
            className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            placeholder="Paste raw string scanned from any QR barcode..."
          />
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
            Sample QR Formats
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_QR_PAYLOADS.map((p) => (
              <button
                key={p.label}
                onClick={() => setInputVal(p.payload)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  inputVal === p.payload
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

      {/* Breakdown Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {getTypeIcon(parsed.type)}
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Detected QR Schema
              </span>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {parsed.typeLabel}
              </h4>
            </div>
          </div>

          <button
            onClick={() => copyToClipboard(inputVal, 'raw')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            {copiedKey === 'raw' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Raw Payload</span>
          </button>
        </div>

        {/* Structured Fields Grid */}
        <div className="space-y-2.5">
          {parsed.fields.map((f, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  {f.label}
                </span>
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                  {f.value}
                </span>
              </div>
              {f.copyable && (
                <button
                  onClick={() => copyToClipboard(f.value, `field-${i}`)}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 shrink-0"
                  title="Copy value"
                >
                  {copiedKey === `field-${i}` ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
