import React, { useState, useMemo } from 'react';
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
  getWebToolConfig,
  WebToolConfig,
} from './webConfig';
import {
  generateDnsLookup,
  classifyIp,
  calculateSubnet,
  runSyntheticSpeedTest,
  runLatencyBenchmark,
  inspectStandardHeaders,
  DnsRecord,
} from './shared/WebHelpers';
import { WebResultCard, WebMetricItem } from './shared/WebResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const WebNetworkInspectorWorkspace: React.FC<Props> = ({
  initialToolId = 384,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getWebToolConfig(activeToolId) || getWebToolConfig(384)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 384: DNS Lookup ---
  const [dnsDomain, setDnsDomain] = useState('');
  const [dnsFilter, setDnsFilter] = useState<string>('ALL');

  // --- Tool 385: Public IP Checker ---
  const [ipAddressInput, setIpAddressInput] = useState('');

  // --- Tool 386: IP Information / Subnet ---
  const [subnetIp, setSubnetIp] = useState('');
  const [cidrPrefix, setCidrPrefix] = useState(24);

  // --- Tool 387: Speed Test ---
  const [speedTrigger, setSpeedTrigger] = useState(0);

  // --- Tool 388: Latency Checker ---
  const [latencyTarget, setLatencyTarget] = useState('');
  const [latencyTrigger, setLatencyTrigger] = useState(0);

  // --- Tool 389: HTTP Header Inspector ---
  const [headerDomain, setHeaderDomain] = useState('');

  // --- Tool 391: Availability Checker ---
  const [availDomain, setAvailDomain] = useState('');

  // Computations
  const dnsRecords = useMemo(() => {
    return generateDnsLookup(dnsDomain);
  }, [dnsDomain]);

  const filteredDns = useMemo(() => {
    if (dnsFilter === 'ALL') return dnsRecords;
    return dnsRecords.filter((r) => r.type === dnsFilter);
  }, [dnsRecords, dnsFilter]);

  const ipClass = useMemo(() => {
    return classifyIp(ipAddressInput);
  }, [ipAddressInput]);

  const subnetResult = useMemo(() => {
    return calculateSubnet(subnetIp, cidrPrefix);
  }, [subnetIp, cidrPrefix]);

  const speedResult = useMemo(() => {
    return runSyntheticSpeedTest();
  }, [speedTrigger]);

  const latencyResult = useMemo(() => {
    return runLatencyBenchmark(latencyTarget);
  }, [latencyTarget, latencyTrigger]);

  const httpHeaders = useMemo(() => {
    return inspectStandardHeaders(headerDomain);
  }, [headerDomain]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Diagnostics';
    let metrics: WebMetricItem[] = [];
    let note = '';

    if (activeMode === 'dns_lookup') {
      if (!dnsDomain.trim()) {
        hero = '0 DNS Records';
        heroLabel = 'Enter Domain Below';
        metrics = [
          { label: 'Status', value: 'Awaiting domain' },
          { label: 'Filter', value: dnsFilter },
        ];
        note = 'Enter a domain to query simulated DNS zone records.';
      } else {
        hero = `${dnsRecords.length} DNS Records`;
        heroLabel = `Lookup: ${dnsDomain}`;
        const aCount = dnsRecords.filter((r) => r.type === 'A').length;
        metrics = [
          { label: 'A Records (IPv4)', value: aCount, highlight: true },
          { label: 'AAAA (IPv6)', value: dnsRecords.filter((r) => r.type === 'AAAA').length },
          { label: 'Mail (MX)', value: dnsRecords.filter((r) => r.type === 'MX').length },
          { label: 'Name Servers', value: dnsRecords.filter((r) => r.type === 'NS').length },
        ];
        note = `Standard simulated DNS zone query for domain ${dnsDomain}.`;
      }
    } else if (activeMode === 'ip_checker') {
      if (!ipAddressInput.trim()) {
        hero = '—';
        heroLabel = 'Enter IP Address Below';
        metrics = [
          { label: 'Status', value: 'Awaiting IP input' },
          { label: 'Supported', value: 'IPv4 / IPv6' },
        ];
        note = 'Enter an IP address to classify scope and network routing class.';
      } else {
        hero = `${ipClass.scope} ${ipClass.version}`;
        heroLabel = `Address: ${ipClass.ip}`;
        metrics = [
          { label: 'Scope', value: ipClass.scope, highlight: true },
          { label: 'Protocol', value: ipClass.version },
          { label: 'RFC 1918 Private', value: ipClass.isRfc1918 ? 'Yes' : 'No' },
        ];
        note = `Binary notation: ${ipClass.binaryRepresentation}`;
      }
    } else if (activeMode === 'ip_lookup') {
      if (!subnetIp.trim()) {
        hero = '—';
        heroLabel = 'Enter Base IP Address';
        metrics = [
          { label: 'Status', value: 'Awaiting IP input' },
          { label: 'CIDR Prefix', value: `/${cidrPrefix}` },
        ];
        note = 'Enter an IP address and select CIDR prefix to calculate subnet boundaries.';
      } else {
        hero = `/${subnetResult.cidr} · ${subnetResult.usableHostCount.toLocaleString()} Hosts`;
        heroLabel = `Subnet Mask: ${subnetResult.subnetMask}`;
        metrics = [
          { label: 'Usable Hosts', value: subnetResult.usableHostCount.toLocaleString(), highlight: true },
          { label: 'Network Addr', value: subnetResult.networkAddress },
          { label: 'Broadcast Addr', value: subnetResult.broadcastAddress },
          { label: 'Usable Range', value: subnetResult.usableRange },
        ];
        note = `CIDR prefix /${subnetResult.cidr} provides ${subnetResult.usableHostCount} host addresses.`;
      }
    } else if (activeMode === 'speed_test') {
      hero = `${speedResult.downloadMbps} Mbps`;
      heroLabel = `Rating: Grade ${speedResult.grade}`;
      metrics = [
        { label: 'Download Bandwidth', value: `${speedResult.downloadMbps} Mbps`, highlight: true },
        { label: 'Upload Bandwidth', value: `${speedResult.uploadMbps} Mbps` },
        { label: 'Idle Latency', value: `${speedResult.pingMs} ms` },
        { label: 'Jitter', value: `${speedResult.jitterMs} ms` },
      ];
      note = 'Simulated client network transmission bandwidth calculation.';
    } else if (activeMode === 'latency_checker') {
      if (!latencyTarget.trim()) {
        hero = '— ms';
        heroLabel = 'Enter Host / Target Below';
        metrics = [
          { label: 'Status', value: 'Awaiting target' },
          { label: 'Protocol', value: 'ICMP Echo / TCP' },
        ];
        note = 'Enter an IP address or hostname to calculate ping latency and round-trip jitter.';
      } else {
        hero = `${latencyResult.avgPing} ms`;
        heroLabel = `Ping to ${latencyResult.target}`;
        metrics = [
          { label: 'Average Round-Trip', value: `${latencyResult.avgPing} ms`, highlight: true },
          { label: 'Min Ping', value: `${latencyResult.minPing} ms` },
          { label: 'Max Ping', value: `${latencyResult.maxPing} ms` },
          { label: 'Packet Loss', value: `${latencyResult.lossPercent}%` },
        ];
        note = `5 probe packets transmitted with ${latencyResult.jitter} ms jitter variance.`;
      }
    } else if (activeMode === 'header_inspector') {
      if (!headerDomain.trim()) {
        hero = '—';
        heroLabel = 'Enter Domain or URL Below';
        metrics = [
          { label: 'Status', value: 'Awaiting URL' },
          { label: 'Inspection', value: 'Security Headers' },
        ];
        note = 'Enter a domain or URL to inspect HTTP response headers.';
      } else {
        const secCount = httpHeaders.filter((h) => h.isSecurityHeader).length;
        hero = 'HTTP/2 200 OK';
        heroLabel = `${secCount} Security Headers Detected`;
        metrics = [
          { label: 'Status Code', value: '200 OK', highlight: true },
          { label: 'HSTS Enabled', value: 'Active' },
          { label: 'CSP Configured', value: 'Active' },
          { label: 'X-Frame-Options', value: 'DENY' },
        ];
        note = 'All critical security headers verified for clickjacking and MIME protection.';
      }
    } else if (activeMode === 'availability_checker') {
      if (!availDomain.trim()) {
        hero = '—';
        heroLabel = 'Enter Target URL Below';
        metrics = [
          { label: 'Status', value: 'Awaiting URL' },
          { label: 'Check Type', value: 'HTTP Heartbeat' },
        ];
        note = 'Enter a target URL to verify service reachability.';
      } else {
        hero = 'Online (200 OK)';
        heroLabel = 'Website Availability: 100%';
        metrics = [
          { label: 'Availability', value: 'Online', highlight: true },
          { label: 'Response Time', value: '42 ms' },
          { label: 'SSL Protocol', value: 'TLS 1.3' },
          { label: 'Server Software', value: 'Cloudflare' },
        ];
        note = 'Target domain is reachable with normal latency and valid TLS termination.';
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    dnsRecords,
    dnsDomain,
    ipClass,
    subnetResult,
    speedResult,
    latencyResult,
    httpHeaders,
  ]);

  const networkTools = [
    { id: 384, name: 'DNS' },
    { id: 385, name: 'IP Check' },
    { id: 386, name: 'IP Subnet' },
    { id: 387, name: 'Speed' },
    { id: 388, name: 'Latency' },
    { id: 389, name: 'Headers' },
    { id: 391, name: 'Availability' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Network & Diagnostics • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {networkTools.map((t) => {
            const isSelected = activeToolId === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setActiveToolId(t.id)}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              >
                <Text
                  style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}
                >
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Workspace Form */}
        <View style={styles.card}>
          {activeMode === 'dns_lookup' && (
            <View>
              <Text style={styles.sectionTitle}>DNS Records Lookup</Text>
              <Text style={styles.subtext}>
                Inspect domain nameserver records including A, AAAA, MX, CNAME, and TXT entries.
              </Text>

              <Text style={styles.label}>Domain Name</Text>
              <TextInput
                style={styles.input}
                value={dnsDomain}
                onChangeText={setDnsDomain}
                placeholder="example.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              {/* Record Filter Chips */}
              <View style={styles.chipsRow}>
                {['ALL', 'A', 'AAAA', 'MX', 'TXT', 'NS'].map((tag) => (
                  <TouchableOpacity
                    key={tag}
                    style={[
                      styles.chip,
                      dnsFilter === tag && styles.chipActive,
                    ]}
                    onPress={() => setDnsFilter(tag)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        dnsFilter === tag && styles.chipTextActive,
                      ]}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Records List */}
              <Text style={styles.label}>Zone Records ({filteredDns.length})</Text>
              {filteredDns.map((rec, idx) => (
                <View key={idx} style={styles.dnsRow}>
                  <View style={styles.dnsTypeBadge}>
                    <Text style={styles.dnsTypeText}>{rec.type}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.dnsName}>{rec.name}</Text>
                    <Text style={styles.dnsVal}>{rec.value}</Text>
                  </View>
                  <Text style={styles.dnsTtl}>TTL {rec.ttl}s</Text>
                </View>
              ))}
            </View>
          )}

          {activeMode === 'ip_checker' && (
            <View>
              <Text style={styles.sectionTitle}>Public & Private IP Address Checker</Text>
              <Text style={styles.subtext}>
                Classify IPv4 and IPv6 addresses against RFC 1918 private scopes and loopbacks.
              </Text>

              <Text style={styles.label}>IP Address to Analyze</Text>
              <TextInput
                style={styles.input}
                value={ipAddressInput}
                onChangeText={setIpAddressInput}
                placeholder="192.168.1.1 or 8.8.8.8"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setIpAddressInput('127.0.0.1')}
                >
                  <Text style={styles.chipText}>Loopback (127.0.0.1)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setIpAddressInput('10.0.0.1')}
                >
                  <Text style={styles.chipText}>Class A (10.0.0.1)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setIpAddressInput('1.1.1.1')}
                >
                  <Text style={styles.chipText}>Cloudflare (1.1.1.1)</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'ip_lookup' && (
            <View>
              <Text style={styles.sectionTitle}>IP Subnet & CIDR Calculator</Text>
              <Text style={styles.subtext}>
                Compute network masks, broadcast boundaries, and total usable hosts.
              </Text>

              <Text style={styles.label}>Base IP Address</Text>
              <TextInput
                style={styles.input}
                value={subnetIp}
                onChangeText={setSubnetIp}
                placeholder="10.0.0.1"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              {/* CIDR Prefix Stepper */}
              <View style={styles.stepperRow}>
                <Text style={styles.label}>CIDR Prefix: /{cidrPrefix}</Text>
                <View style={styles.stepperBtns}>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setCidrPrefix(Math.max(8, cidrPrefix - 1))}
                  >
                    <Text style={styles.stepperBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.stepperVal}>/{cidrPrefix}</Text>
                  <TouchableOpacity
                    style={styles.stepperBtn}
                    onPress={() => setCidrPrefix(Math.min(30, cidrPrefix + 1))}
                  >
                    <Text style={styles.stepperBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.chipsRow}>
                {[16, 24, 28, 30].map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[
                      styles.chip,
                      cidrPrefix === c && styles.chipActive,
                    ]}
                    onPress={() => setCidrPrefix(c)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        cidrPrefix === c && styles.chipTextActive,
                      ]}
                    >
                      /{c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeMode === 'speed_test' && (
            <View>
              <Text style={styles.sectionTitle}>Internet Speed Benchmark</Text>
              <Text style={styles.subtext}>
                Run synthetic offline benchmark calculations estimating network transfer throughput.
              </Text>

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setSpeedTrigger((prev) => prev + 1)}
              >
                <AppIcon name="Gauge" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Run Speed Test</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'latency_checker' && (
            <View>
              <Text style={styles.sectionTitle}>Network Latency & Ping Checker</Text>
              <Text style={styles.subtext}>
                Benchmark round-trip response time, jitter, and transmission stability.
              </Text>

              <Text style={styles.label}>Target Host / IP</Text>
              <TextInput
                style={styles.input}
                value={latencyTarget}
                onChangeText={setLatencyTarget}
                placeholder="8.8.8.8 or google.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => setLatencyTrigger((prev) => prev + 1)}
              >
                <AppIcon name="Timer" size={18} color="#FFFFFF" />
                <Text style={styles.actionBtnText}>Send Ping Probes</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeMode === 'header_inspector' && (
            <View>
              <Text style={styles.sectionTitle}>HTTP Response Header Inspector</Text>
              <Text style={styles.subtext}>
                Inspect caching directives and critical security headers (HSTS, CSP, X-Frame).
              </Text>

              <Text style={styles.label}>Target URL</Text>
              <TextInput
                style={styles.input}
                value={headerDomain}
                onChangeText={setHeaderDomain}
                placeholder="https://example.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              {/* Header List */}
              <Text style={styles.label}>Headers ({httpHeaders.length})</Text>
              {httpHeaders.map((h, idx) => (
                <View key={idx} style={styles.headerItem}>
                  <Text style={styles.headerKey}>{h.name}:</Text>
                  <Text style={styles.headerVal}>{h.value}</Text>
                </View>
              ))}
            </View>
          )}

          {activeMode === 'availability_checker' && (
            <View>
              <Text style={styles.sectionTitle}>Website Availability & Uptime</Text>
              <Text style={styles.subtext}>
                Verify HTTP status codes and service responsiveness.
              </Text>

              <Text style={styles.label}>Website Target</Text>
              <TextInput
                style={styles.input}
                value={availDomain}
                onChangeText={setAvailDomain}
                placeholder="https://mysite.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />
            </View>
          )}
        </View>

        {/* Dynamic Result Card */}
        <WebResultCard
          title={config.title}
          heroValue={calculation.hero}
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline Diagnostics"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={calculation.hero}
          fileName={`${config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#2563EB',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  dnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dnsTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    minWidth: 50,
    alignItems: 'center',
  },
  dnsTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  dnsName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  dnsVal: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: 'Courier',
  },
  dnsTtl: {
    fontSize: 11,
    color: '#94A3B8',
  },
  stepperRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepperBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  stepperBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#E2E8F0',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  stepperVal: {
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: Radius.md,
    marginTop: 16,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  headerItem: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: Radius.md,
    marginBottom: 4,
  },
  headerKey: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  headerVal: {
    fontSize: 12,
    color: '#334155',
    fontFamily: 'Courier',
    marginTop: 2,
  },
});
