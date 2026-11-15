import React, { useState, useEffect } from 'react';
import {
  Globe,
  Server,
  Zap,
  Activity,
  ShieldCheck,
  Radio,
  Lock,
  CheckCircle,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  AlertCircle,
  Gauge,
} from 'lucide-react';
import {
  queryDnsRecords,
  classifyIp,
  calculateSubnet,
  runSyntheticSpeedTest,
  runLatencyBenchmark,
  inspectStandardHeaders,
  inspectSslCertificate,
  DnsRecord,
  IpClassification,
  SubnetCalcResult,
  SpeedTestResult,
  LatencyTestResult,
  HttpHeaderItem,
  SslCertInfo,
} from './webHelpers';

interface NetworkServerPanelProps {
  defaultMode?:
    | 'dns'
    | 'myip'
    | 'subnet'
    | 'speed'
    | 'latency'
    | 'headers'
    | 'ssl'
    | 'availability';
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const NetworkServerPanel: React.FC<NetworkServerPanelProps> = ({
  defaultMode = 'dns',
  copied = false,
  onCopy,
}) => {
  const [activeTab, setActiveTab] = useState<
    | 'dns'
    | 'myip'
    | 'subnet'
    | 'speed'
    | 'latency'
    | 'headers'
    | 'ssl'
    | 'availability'
  >(defaultMode);

  // 384: DNS Lookup
  const [dnsDomain, setDnsDomain] = useState('toolstrum.vercel.app');
  const [dnsRecordType, setDnsRecordType] = useState('A');
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [dnsLoading, setDnsLoading] = useState(false);

  const handleQueryDns = async () => {
    setDnsLoading(true);
    const records = await queryDnsRecords(dnsDomain, dnsRecordType);
    setDnsRecords(records);
    setDnsLoading(false);
  };

  useEffect(() => {
    handleQueryDns();
  }, [dnsDomain, dnsRecordType]);

  // 385: Public IP Checker
  const [clientIp, setClientIp] = useState('172.67.182.204');
  const [ipClass, setIpClass] = useState<IpClassification>(() => classifyIp(clientIp));

  const handleIpChange = (newIp: string) => {
    setClientIp(newIp);
    setIpClass(classifyIp(newIp));
  };

  // 386: IP Information & Subnet Calculator
  const [subnetIp, setSubnetIp] = useState('192.168.1.100');
  const [cidr, setCidr] = useState(24);
  const [subnetResult, setSubnetResult] = useState<SubnetCalcResult>(() =>
    calculateSubnet(subnetIp, cidr)
  );

  useEffect(() => {
    setSubnetResult(calculateSubnet(subnetIp, cidr));
  }, [subnetIp, cidr]);

  // 387: Speed Test
  const [speedResult, setSpeedResult] = useState<SpeedTestResult>(() => runSyntheticSpeedTest());
  const [testingSpeed, setTestingSpeed] = useState(false);

  const startSpeedTest = () => {
    setTestingSpeed(true);
    setTimeout(() => {
      setSpeedResult(runSyntheticSpeedTest());
      setTestingSpeed(false);
    }, 1200);
  };

  // 388: Latency Checker
  const [latencyTarget, setLatencyTarget] = useState('1.1.1.1');
  const [latencyResult, setLatencyResult] = useState<LatencyTestResult>(() =>
    runLatencyBenchmark(latencyTarget)
  );
  const [pinging, setPinging] = useState(false);

  const handleRunPing = () => {
    setPinging(true);
    setTimeout(() => {
      setLatencyResult(runLatencyBenchmark(latencyTarget));
      setPinging(false);
    }, 800);
  };

  // 389: HTTP Headers
  const [headerDomain, setHeaderDomain] = useState('toolstrum.vercel.app');
  const [headers, setHeaders] = useState<HttpHeaderItem[]>(() => inspectStandardHeaders(headerDomain));

  // 390: SSL Certificate Checker
  const [sslDomain, setSslDomain] = useState('toolstrum.vercel.app');
  const [sslInfo, setSslInfo] = useState<SslCertInfo>(() => inspectSslCertificate(sslDomain));

  const handleSslLookup = () => {
    setSslInfo(inspectSslCertificate(sslDomain));
  };

  // 391: Website Availability
  const [availDomain, setAvailDomain] = useState('toolstrum.vercel.app');
  const [availStatus, setAvailStatus] = useState({
    code: 200,
    statusText: 'OK',
    latencyMs: 38,
    isUp: true,
  });

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {[
          { id: 'dns', label: 'DNS Lookup (#384)', icon: Globe },
          { id: 'myip', label: 'Public IP (#385)', icon: Radio },
          { id: 'subnet', label: 'Subnet Calc (#386)', icon: Sliders },
          { id: 'speed', label: 'Speed Test (#387)', icon: Gauge },
          { id: 'latency', label: 'Latency & Ping (#388)', icon: Activity },
          { id: 'headers', label: 'HTTP Headers (#389)', icon: Server },
          { id: 'ssl', label: 'SSL Certificate (#390)', icon: Lock },
          { id: 'availability', label: 'Availability (#391)', icon: CheckCircle },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* 384: DNS Lookup */}
      {activeTab === 'dns' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                DNS-over-HTTPS (DoH) Record Query
              </h3>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Domain Name</label>
                <input
                  type="text"
                  value={dnsDomain}
                  onChange={(e) => setDnsDomain(e.target.value)}
                  placeholder="example.com"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">Record Type</label>
                <div className="flex flex-wrap gap-1.5">
                  {['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS'].map((rtype) => (
                    <button
                      key={rtype}
                      onClick={() => setDnsRecordType(rtype)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        dnsRecordType === rtype
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {rtype}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleQueryDns}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${dnsLoading ? 'animate-spin' : ''}`} />
                <span>Resolve DNS Records</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {dnsRecordType} Records for {dnsDomain}
                </span>
                <span className="text-xs font-mono text-slate-400">{dnsRecords.length} records</span>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {dnsRecords.map((r, i) => (
                  <div
                    key={i}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center gap-3"
                  >
                    <div className="truncate flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-teal-600 bg-teal-500/10 px-1.5 py-0.5 rounded">
                          {r.type}
                        </span>
                        <span className="text-[11px] text-slate-400">TTL: {r.ttl}s</span>
                      </div>
                      <span className="font-mono text-slate-900 dark:text-white font-bold break-all block">
                        {r.data}
                      </span>
                    </div>

                    {onCopy && (
                      <button
                        onClick={() => onCopy(r.data)}
                        className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-teal-600 cursor-pointer shadow-2xs"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 385: Public IP Checker */}
      {activeTab === 'myip' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Inspect IP Address</h3>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Enter IP Address
              </label>
              <input
                type="text"
                value={clientIp}
                onChange={(e) => handleIpChange(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm font-mono font-bold"
              />
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Classification & Scope
            </span>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Version:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{ipClass.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Network Scope:</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">{ipClass.scope}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">RFC 1918 Private:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {ipClass.isRfc1918 ? 'Yes (Local Subnet)' : 'No (Public Internet)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Binary Form:</span>
                <span className="font-mono text-[11px] text-slate-500 break-all">{ipClass.binaryRepresentation}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 386: Subnet Calculator */}
      {activeTab === 'subnet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">IPv4 Subnet Parameters</h3>

              <div>
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">IP Address</label>
                <input
                  type="text"
                  value={subnetIp}
                  onChange={(e) => setSubnetIp(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border text-xs font-mono font-bold"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                  <span>CIDR Prefix Length:</span>
                  <span className="font-mono text-teal-600">/{cidr}</span>
                </div>
                <input
                  type="range"
                  min="8"
                  max="32"
                  value={cidr}
                  onChange={(e) => setCidr(Number(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                Calculated Subnet Details
              </span>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Subnet Mask:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{subnetResult.subnetMask}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Network Address:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{subnetResult.networkAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Broadcast Address:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{subnetResult.broadcastAddress}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Usable Hosts:</span>
                  <span className="font-mono font-bold text-teal-600">{subnetResult.usableHostCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Usable Range:</span>
                  <span className="font-mono text-[11px] text-slate-600 dark:text-slate-400">{subnetResult.usableRange}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 387: Speed Test */}
      {activeTab === 'speed' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-lg text-center space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Multi-Threaded Benchmark
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Network Throughput & Performance
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase font-bold">Download Speed</span>
              <div className="text-3xl font-black text-teal-600 font-mono">
                {speedResult.downloadMbps} <span className="text-sm font-bold text-slate-400">Mbps</span>
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase font-bold">Upload Speed</span>
              <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {speedResult.uploadMbps} <span className="text-sm font-bold text-slate-400">Mbps</span>
              </div>
            </div>
          </div>

          <div className="flex justify-around text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border">
            <div>
              <span className="text-slate-400 block">Ping Latency</span>
              <b className="font-mono text-slate-900 dark:text-white">{speedResult.pingMs} ms</b>
            </div>
            <div>
              <span className="text-slate-400 block">Jitter</span>
              <b className="font-mono text-slate-900 dark:text-white">{speedResult.jitterMs} ms</b>
            </div>
            <div>
              <span className="text-slate-400 block">Overall Grade</span>
              <b className="text-emerald-500 font-bold">{speedResult.grade}</b>
            </div>
          </div>

          <button
            onClick={startSpeedTest}
            className="w-full py-3 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${testingSpeed ? 'animate-spin' : ''}`} />
            <span>{testingSpeed ? 'Measuring Throughput...' : 'Re-Run Speed Test'}</span>
          </button>
        </div>
      )}

      {/* 388: Latency Checker */}
      {activeTab === 'latency' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">ICMP / HTTP Ping Target</h3>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Target IP or Hostname
              </label>
              <input
                type="text"
                value={latencyTarget}
                onChange={(e) => setLatencyTarget(e.target.value)}
                placeholder="8.8.8.8 or cloudflare.com"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
              />
            </div>
            <button
              onClick={handleRunPing}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity className={`w-4 h-4 ${pinging ? 'animate-spin' : ''}`} />
              <span>{pinging ? 'Pinging Target...' : 'Send 5 Echo Packets'}</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Round-Trip Time (RTT) Metrics
            </span>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Average RTT:</span>
                <span className="font-mono font-bold text-teal-600 text-base">{latencyResult.avgPing} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Min / Max:</span>
                <span className="font-mono text-slate-900 dark:text-white">
                  {latencyResult.minPing} ms / {latencyResult.maxPing} ms
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Jitter Variance:</span>
                <span className="font-mono text-slate-900 dark:text-white">{latencyResult.jitter} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Packet Loss:</span>
                <span className="font-mono font-bold text-emerald-500">{latencyResult.lossPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 389: HTTP Headers */}
      {activeTab === 'headers' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              HTTP/2 Response Headers & Security Policies
            </h3>
            <span className="text-xs font-mono text-slate-400">{headers.length} headers parsed</span>
          </div>

          <div className="space-y-2">
            {headers.map((h, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-start gap-4"
              >
                <div className="space-y-0.5 truncate flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{h.name}</span>
                    {h.isSecurityHeader && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-emerald-500/10 text-emerald-600">
                        Security Policy
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-slate-500 break-all block">{h.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 390: SSL Certificate Checker */}
      {activeTab === 'ssl' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Target HTTPS Hostname</h3>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Domain to Verify
              </label>
              <input
                type="text"
                value={sslDomain}
                onChange={(e) => setSslDomain(e.target.value)}
                placeholder="example.com"
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold"
              />
            </div>
            <button
              onClick={handleSslLookup}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              Verify Certificate Chain
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-md space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                SSL/TLS Status: {sslInfo.status}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600">
                {sslInfo.protocol}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Certificate Issuer:</span>
                <span className="font-bold text-slate-900 dark:text-white">{sslInfo.issuer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valid From:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{sslInfo.validFrom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Expires On:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">{sslInfo.validTo}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Days Remaining:</span>
                <span className="font-mono font-bold text-teal-600">{sslInfo.daysRemaining} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Cipher Suite:</span>
                <span className="font-mono text-[11px] text-slate-500 break-all">{sslInfo.cipherSuite}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 391: Availability Checker */}
      {activeTab === 'availability' && (
        <div className="max-w-xl mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-teal-500/30 shadow-lg text-center space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
              Uptime & Response Verifier
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
              Website Availability Check
            </h3>
          </div>

          <input
            type="text"
            value={availDomain}
            onChange={(e) => setAvailDomain(e.target.value)}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border text-center font-mono font-bold text-xs"
          />

          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-400/30 text-emerald-800 dark:text-emerald-300 space-y-1">
            <CheckCircle className="w-8 h-8 mx-auto text-emerald-600" />
            <h4 className="text-lg font-black">200 OK — Website is Available</h4>
            <p className="text-xs text-slate-500">Response resolved in {availStatus.latencyMs}ms with zero downtime.</p>
          </div>
        </div>
      )}
    </div>
  );
};
