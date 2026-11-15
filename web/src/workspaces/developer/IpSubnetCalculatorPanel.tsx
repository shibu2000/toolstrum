import React, { useState, useMemo } from 'react';
import {
  Network,
  Copy,
  Check,
  RefreshCw,
  Layers,
  Sparkles,
  ShieldCheck,
  Globe,
  Sliders,
} from 'lucide-react';

interface SubnetCalculations {
  valid: boolean;
  error?: string;
  ip: string;
  cidr: number;
  network: string;
  broadcast: string;
  netmask: string;
  wildcard: string;
  firstHost: string;
  lastHost: string;
  totalAddresses: number;
  usableHosts: number;
  ipClass: string;
  ipScope: string;
  binaryIp: string;
  binaryNetmask: string;
}

const PRESET_SUBNETS = [
  { label: 'Standard LAN (/24)', ip: '192.168.1.1', cidr: 24, desc: '254 usable hosts (Class C Private)' },
  { label: 'Corporate VPC (/16)', ip: '10.0.0.1', cidr: 16, desc: '65,534 usable hosts (Class A Private)' },
  { label: 'Container Subnet (/22)', ip: '172.16.0.1', cidr: 22, desc: '1,022 usable hosts (Class B Private)' },
  { label: 'Point-to-Point (/30)', ip: '10.255.0.1', cidr: 30, desc: '2 usable router gateway endpoints' },
  { label: 'Loopback Host (/8)', ip: '127.0.0.1', cidr: 8, desc: 'Localhost loopback block' },
];

export function calculateSubnetDetails(ipInput: string, cidrInput: number): SubnetCalculations {
  const cleanIp = ipInput.trim();
  const octets = cleanIp.split('.').map((o) => parseInt(o, 10));

  if (
    octets.length !== 4 ||
    octets.some((o) => isNaN(o) || o < 0 || o > 255)
  ) {
    return {
      valid: false,
      error: 'Please enter a valid IPv4 address (e.g. 192.168.1.1).',
      ip: cleanIp,
      cidr: cidrInput,
      network: '',
      broadcast: '',
      netmask: '',
      wildcard: '',
      firstHost: '',
      lastHost: '',
      totalAddresses: 0,
      usableHosts: 0,
      ipClass: '',
      ipScope: '',
      binaryIp: '',
      binaryNetmask: '',
    };
  }

  const cidr = Math.max(0, Math.min(32, cidrInput));

  // Convert IP to 32-bit unsigned integer
  const ipInt =
    ((octets[0] << 24) | (octets[1] << 16) | (octets[2] << 8) | octets[3]) >>> 0;

  // Mask and wildcard
  const maskInt = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const wildcardInt = ~maskInt >>> 0;
  const networkInt = (ipInt & maskInt) >>> 0;
  const broadcastInt = (networkInt | wildcardInt) >>> 0;

  const intToIp = (n: number): string => {
    return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.');
  };

  const intToBinary = (n: number): string => {
    return [
      ((n >>> 24) & 0xff).toString(2).padStart(8, '0'),
      ((n >>> 16) & 0xff).toString(2).padStart(8, '0'),
      ((n >>> 8) & 0xff).toString(2).padStart(8, '0'),
      (n & 0xff).toString(2).padStart(8, '0'),
    ].join('.');
  };

  const totalAddresses = Math.pow(2, 32 - cidr);
  const usableHosts = cidr >= 31 ? (cidr === 31 ? 2 : 1) : totalAddresses - 2;

  const firstHost = cidr >= 31 ? intToIp(networkInt) : intToIp(networkInt + 1);
  const lastHost = cidr >= 31 ? intToIp(broadcastInt) : intToIp(broadcastInt - 1);

  // IP Class determination
  const firstOctet = octets[0];
  let ipClass = 'Class A';
  if (firstOctet >= 128 && firstOctet <= 191) ipClass = 'Class B';
  else if (firstOctet >= 192 && firstOctet <= 223) ipClass = 'Class C';
  else if (firstOctet >= 224 && firstOctet <= 239) ipClass = 'Class D (Multicast)';
  else if (firstOctet >= 240) ipClass = 'Class E (Reserved)';

  // IP Scope (RFC 1918)
  let ipScope = 'Public Internet';
  if (firstOctet === 10) ipScope = 'Private Network (RFC 1918)';
  else if (firstOctet === 172 && octets[1] >= 16 && octets[1] <= 31) ipScope = 'Private Network (RFC 1918)';
  else if (firstOctet === 192 && octets[1] === 168) ipScope = 'Private Network (RFC 1918)';
  else if (firstOctet === 127) ipScope = 'Loopback (RFC 1122)';
  else if (firstOctet === 169 && octets[1] === 254) ipScope = 'Link-Local (APIPA)';
  else if (firstOctet === 100 && octets[1] >= 64 && octets[1] <= 127) ipScope = 'Carrier-Grade NAT (RFC 6598)';

  return {
    valid: true,
    ip: cleanIp,
    cidr,
    network: intToIp(networkInt),
    broadcast: intToIp(broadcastInt),
    netmask: intToIp(maskInt),
    wildcard: intToIp(wildcardInt),
    firstHost,
    lastHost,
    totalAddresses,
    usableHosts,
    ipClass,
    ipScope,
    binaryIp: intToBinary(ipInt),
    binaryNetmask: intToBinary(maskInt),
  };
}

export const IpSubnetCalculatorPanel: React.FC = () => {
  const [ipAddress, setIpAddress] = useState<string>('192.168.1.1');
  const [cidrPrefix, setCidrPrefix] = useState<number>(24);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const calculated: SubnetCalculations = useMemo(() => {
    return calculateSubnetDetails(ipAddress, cidrPrefix);
  }, [ipAddress, cidrPrefix]);

  const applyPreset = (preset: (typeof PRESET_SUBNETS)[0]) => {
    setIpAddress(preset.ip);
    setCidrPrefix(preset.cidr);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Presets */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Network className="w-5 h-5 text-sky-500" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              IPv4 CIDR Subnet Calculator
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {calculated.valid ? `${calculated.network}/${calculated.cidr}` : 'Awaiting valid IP'}
          </span>
        </div>

        {/* IP and CIDR Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
              IPv4 Address
            </label>
            <input
              type="text"
              value={ipAddress}
              onChange={(e) => setIpAddress(e.target.value)}
              placeholder="e.g. 192.168.1.1"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-sm font-bold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="sm:col-span-6 space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>CIDR Prefix Mask</span>
              <span className="font-mono text-sky-600 dark:text-sky-400">/{cidrPrefix}</span>
            </div>
            <input
              type="range"
              min={0}
              max={32}
              value={cidrPrefix}
              onChange={(e) => setCidrPrefix(parseInt(e.target.value, 10))}
              className="w-full accent-sky-500 py-2"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>/0 (Internet)</span>
              <span>/16</span>
              <span>/24 (LAN)</span>
              <span>/32 (Host)</span>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">
            Common Subnet Configurations
          </span>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SUBNETS.map((p) => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  ipAddress === p.ip && cidrPrefix === p.cidr
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

      {calculated.valid ? (
        <div className="space-y-5">
          {/* Main Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Network Address
              </span>
              <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400 block mt-0.5 truncate">
                {calculated.network}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Broadcast Address
              </span>
              <span className="font-mono text-sm font-black text-slate-900 dark:text-white block mt-0.5 truncate">
                {calculated.broadcast}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Usable Hosts
              </span>
              <span className="font-mono text-sm font-black text-emerald-600 dark:text-emerald-400 block mt-0.5 truncate">
                {calculated.usableHosts.toLocaleString()}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Subnet Mask
              </span>
              <span className="font-mono text-sm font-black text-slate-900 dark:text-white block mt-0.5 truncate">
                {calculated.netmask}
              </span>
            </div>
          </div>

          {/* Detailed Calculations Table */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block pb-2 border-b border-slate-100 dark:border-slate-800">
              Address Space & Host Allocation Breakdown
            </span>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-slate-500 font-sans font-medium">Usable Host Range:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {calculated.firstHost} — {calculated.lastHost}
                  </span>
                  <button
                    onClick={() =>
                      copyToClipboard(`${calculated.firstHost} - ${calculated.lastHost}`, 'range')
                    }
                    className="p-1 rounded text-slate-400 hover:text-slate-600"
                  >
                    {copiedKey === 'range' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-slate-500 font-sans font-medium">Wildcard / Inverse Mask:</span>
                <span className="font-bold text-slate-900 dark:text-white">{calculated.wildcard}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-slate-500 font-sans font-medium">Total IP Addresses:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {calculated.totalAddresses.toLocaleString()}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-slate-500 font-sans font-medium">IP Class & Classification:</span>
                <span className="font-bold text-slate-900 dark:text-white">{calculated.ipClass}</span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
                <span className="text-slate-500 font-sans font-medium">Network Scope:</span>
                <span className="font-bold text-sky-600 dark:text-sky-400">{calculated.ipScope}</span>
              </div>
            </div>

            {/* Binary Representations */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-[10px] font-bold uppercase text-slate-400 font-sans block">
                32-Bit Binary Bitfield Visualization
              </span>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500 font-sans">IP (Binary):</span>
                <span className="text-slate-800 dark:text-slate-200">{calculated.binaryIp}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-2">
                <span className="text-slate-500 font-sans">Mask (Binary):</span>
                <span className="text-sky-600 dark:text-sky-400">{calculated.binaryNetmask}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-center space-y-2">
          <ShieldCheck className="w-6 h-6 text-rose-500 mx-auto" />
          <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">Invalid IP Address</h4>
          <p className="text-xs text-rose-700 dark:text-rose-400">{calculated.error}</p>
        </div>
      )}
    </div>
  );
};
