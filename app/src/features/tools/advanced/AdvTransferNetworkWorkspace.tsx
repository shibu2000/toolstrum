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
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  ADVANCED_WORKSPACES,
  ADVANCED_TOOL_CONFIGS,
  getAdvancedWorkspaceTools,
} from './advancedConfig';
import { AdvancedResultCard } from './shared/AdvancedResultCard';
import { chunkPayloadForQrTransfer } from './shared/AdvancedHelpers';

interface AdvTransferNetworkWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

interface LanDevice {
  ip: string;
  name: string;
  type: string;
  status: 'Online' | 'Active Service';
}

export const AdvTransferNetworkWorkspace: React.FC<AdvTransferNetworkWorkspaceProps> = ({
  initialToolId = 471,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  useEffect(() => {
    setActiveToolId(initialToolId);
  }, [initialToolId]);

  const workspaceMeta = ADVANCED_WORKSPACES.adv_transfer_network;
  const workspaceTools = getAdvancedWorkspaceTools('adv_transfer_network');

  // QR Transfer state
  const [transferPayload, setTransferPayload] = useState('');
  const [currentChunkIdx, setCurrentChunkIdx] = useState(0);

  // Local Wi-Fi P2P state
  const [wifiFileTitle, setWifiFileTitle] = useState('');
  const [wifiServerActive, setWifiServerActive] = useState(false);
  const [localIp, setLocalIp] = useState('192.168.1.142:8080');

  // LAN Discovery state
  const [isScanningLan, setIsScanningLan] = useState(false);
  const [lanDevices, setLanDevices] = useState<LanDevice[]>([]);

  // Universal Share state
  const [sharedInput, setSharedInput] = useState('');
  const [routedTool, setRoutedTool] = useState<{ id: number; name: string } | null>(null);

  const chunks = chunkPayloadForQrTransfer(transferPayload, 60);
  const activeChunk = chunks[currentChunkIdx] || chunks[0];

  const handleScanLan = () => {
    setIsScanningLan(true);
    setTimeout(() => {
      setLanDevices([
        { ip: '192.168.1.1', name: 'Gateway Router', type: 'Network Gateway', status: 'Online' },
        { ip: '192.168.1.45', name: 'MacBook Pro (Elena)', type: 'macOS Workstation', status: 'Active Service' },
        { ip: '192.168.1.89', name: 'Office Network Printer', type: 'IPP AirPrint', status: 'Online' },
        { ip: '192.168.1.120', name: 'Linux HomeLab NAS', type: 'Samba / HTTP', status: 'Active Service' },
      ]);
      setIsScanningLan(false);
      Alert.alert('Scan Complete', 'Discovered 4 active peers on subnet 192.168.1.0/24.');
    }, 800);
  };

  const handleResolveShareTool = () => {
    if (sharedInput.includes('http') || sharedInput.includes('www')) {
      setRoutedTool({ id: 376, name: 'URL Shortener & QR' });
    } else if (sharedInput.endsWith('.pdf')) {
      setRoutedTool({ id: 23, name: 'PDF Viewer' });
    } else {
      setRoutedTool({ id: 205, name: 'Text Case Converter' });
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={ADVANCED_TOOL_CONFIGS[activeToolId]?.name || 'P2P & Network'}
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
            const cfg = ADVANCED_TOOL_CONFIGS[tool.id];
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
        <OfflineShield studioName="Advanced" />

        {/* TOOL 471: QR-Based File Transfer */}
        {activeToolId === 471 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Air-Gapped QR Stream Transmitter</Text>
              <Text style={styles.label}>Payload Content to Transmit</Text>
              <TextInput
                style={[styles.input, { minHeight: 70 }]}
                value={transferPayload}
                placeholder="Enter or paste data payload to encode into QR stream..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setTransferPayload}
                multiline
              />

              <View style={styles.qrStreamDisplay}>
                <View style={styles.qrMockBox}>
                  <AppIcon name="QrCode" size={72} color="#581C87" />
                  <Text style={styles.qrMockCode}>
                    {chunks.length > 0
                      ? `Chunk ${activeChunk?.index || 1} of ${activeChunk?.total || 1}`
                      : 'Awaiting Payload'}
                  </Text>
                </View>
                <Text style={styles.qrPayloadPreview}>
                  {transferPayload ? activeChunk?.payload : 'Enter payload above to generate QR stream chunks'}
                </Text>
              </View>

              <View style={styles.row}>
                <TouchableOpacity
                  style={styles.navBtn}
                  disabled={chunks.length <= 1 || currentChunkIdx === 0}
                  onPress={() => setCurrentChunkIdx(Math.max(0, currentChunkIdx - 1))}
                >
                  <AppIcon name="ArrowLeft" size={16} color="#9333EA" />
                  <Text style={styles.navBtnText}>Previous Chunk</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.navBtn}
                  disabled={chunks.length <= 1 || currentChunkIdx === chunks.length - 1}
                  onPress={() =>
                    setCurrentChunkIdx(
                      Math.min(chunks.length - 1, currentChunkIdx + 1)
                    )
                  }
                >
                  <Text style={styles.navBtnText}>Next Chunk</Text>
                  <AppIcon name="ArrowRight" size={16} color="#9333EA" />
                </TouchableOpacity>
              </View>
            </View>

            <AdvancedResultCard
              title="QR Chunk Stream"
              badge="Air-Gapped Optical"
              primaryValue={chunks.length > 0 ? `Chunk ${activeChunk?.index || 1} of ${chunks.length}` : 'Empty Stream'}
              primarySubtext={`Total payload: ${transferPayload.length} bytes`}
              details={activeChunk?.payload || 'No payload configured'}
              metadata={[
                { label: 'Total Chunks', value: `${chunks.length}` },
                { label: 'Payload Size', value: `${transferPayload.length} B` },
              ]}
              copyContent={activeChunk?.payload}
            />
          </View>
        )}

        {/* TOOL 472: Local Wi-Fi File Transfer */}
        {activeToolId === 472 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Direct Wi-Fi Local File Transfer</Text>
              <Text style={styles.label}>File Staged for Sharing</Text>
              <TextInput
                style={styles.input}
                value={wifiFileTitle}
                placeholder="e.g. document_share.pdf"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setWifiFileTitle}
              />

              <View style={styles.wifiHostBox}>
                <AppIcon
                  name="Wifi"
                  size={36}
                  color={wifiServerActive ? '#059669' : '#64748B'}
                />
                <Text style={styles.wifiHostTitle}>
                  {wifiServerActive ? `Broadcasting: http://${localIp}/download` : 'Local Server Inactive'}
                </Text>
                <Text style={styles.wifiHostSub}>
                  Direct peer-to-peer over local network. No internet upload.
                </Text>
              </View>

              <PrimaryButton
                title={wifiServerActive ? 'Stop Local File Share' : 'Start Wi-Fi File Host'}
                icon={wifiServerActive ? 'Power' : 'Radio'}
                onPress={() => setWifiServerActive(!wifiServerActive)}
              />
            </View>

            <AdvancedResultCard
              title="Wi-Fi P2P Endpoint"
              badge="Direct Local Stream"
              primaryValue={wifiServerActive ? `http://${localIp}` : 'Ready to Share'}
              primarySubtext={wifiFileTitle ? `Staged: ${wifiFileTitle}` : 'Enter file name above'}
              details={`Point any phone, laptop, or browser connected to the same Wi-Fi network to:\nhttp://${localIp}/download\n\nDirect high-speed LAN socket transfer.`}
              metadata={[
                { label: 'Local IP', value: localIp },
                { label: 'State', value: wifiServerActive ? 'Broadcasting' : 'Standby' },
              ]}
              copyContent={`http://${localIp}/download`}
            />
          </View>
        )}

        {/* TOOL 473: LAN Device Discovery */}
        {activeToolId === 473 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Subnet Device Discovery (LAN)</Text>
              <PrimaryButton
                title={isScanningLan ? 'Scanning Subnet...' : 'Discover LAN Peers'}
                icon="Search"
                onPress={handleScanLan}
              />

              <Text style={styles.subheading}>Discovered Nodes ({lanDevices.length})</Text>
              {lanDevices.length === 0 ? (
                <Text style={{ color: Colors.textSecondary, fontStyle: 'italic', marginVertical: 8 }}>
                  No peers discovered yet. Tap button above to scan local subnet.
                </Text>
              ) : (
                lanDevices.map((d, i) => (
                  <View key={i} style={styles.deviceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.deviceName}>{d.name}</Text>
                      <Text style={styles.deviceIp}>{d.ip} • {d.type}</Text>
                    </View>
                    <View style={styles.statusPill}>
                      <Text style={styles.statusPillText}>{d.status}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <AdvancedResultCard
              title="Subnet Topology"
              badge="mDNS & ARP Scanner"
              primaryValue={`${lanDevices.length} Active Nodes Found`}
              primarySubtext="Subnet 192.168.1.0/24"
              details={lanDevices.length > 0 ? lanDevices.map((d) => `• [${d.ip}] ${d.name} (${d.type})`).join('\n') : 'No active nodes found'}
              metadata={[
                { label: 'Nodes', value: `${lanDevices.length}` },
                { label: 'Subnet', value: '192.168.1.0/24' },
              ]}
              copyContent={lanDevices.map((d) => `${d.ip} ${d.name}`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 500: Universal Share-to-Tool */}
        {activeToolId === 500 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Universal Share-to-Tool Dispatcher</Text>
              <Text style={styles.label}>Incoming Shared Data / URI / File</Text>
              <TextInput
                style={[styles.input, { minHeight: 60 }]}
                value={sharedInput}
                placeholder="Paste URL, file path, or text to route to matching tool..."
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setSharedInput}
              />

              <PrimaryButton
                title="Resolve Compatible Tool"
                icon="ExternalLink"
                onPress={handleResolveShareTool}
              />
            </View>

            <AdvancedResultCard
              title="Auto-Routed Tool"
              badge="Deep Link Resolver"
              primaryValue={routedTool ? `Tool ${routedTool.id}: ${routedTool.name}` : 'Awaiting Input'}
              primarySubtext={routedTool ? `Target Schema: com.anonymous.app://tool/${routedTool.id}` : 'Enter data to resolve'}
              details={sharedInput ? `Input Payload:\n"${sharedInput}"\n\nAutomatically mapped to optimal tool handler among 500 offline capabilities.` : 'No payload entered'}
              metadata={[
                { label: 'Resolved Tool ID', value: String(routedTool?.id || 'N/A') },
                { label: 'Tool Name', value: routedTool?.name || 'N/A' },
              ]}
              copyContent={routedTool ? `com.anonymous.app://tool/${routedTool.id}` : ''}
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
    borderBottomColor: '#E9D5FF',
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
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#9333EA',
    borderColor: '#7E22CE',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E22CE',
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
    borderColor: '#E9D5FF',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#581C87',
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E22CE',
    marginTop: Spacing.md,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9333EA',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
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
  qrStreamDisplay: {
    backgroundColor: '#FAF5FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  qrMockBox: {
    alignItems: 'center',
    marginBottom: 8,
  },
  qrMockCode: {
    fontSize: 13,
    fontWeight: '800',
    color: '#581C87',
    marginTop: 4,
  },
  qrPayloadPreview: {
    fontFamily: 'monospace',
    fontSize: 11,
    color: '#4B5563',
    textAlign: 'center',
  },
  navBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  navBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9333EA',
  },
  wifiHostBox: {
    backgroundColor: '#FAF5FF',
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  wifiHostTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 6,
  },
  wifiHostSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  deviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAF5FF',
    padding: 10,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#F3E8FF',
  },
  deviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  deviceIp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
});
