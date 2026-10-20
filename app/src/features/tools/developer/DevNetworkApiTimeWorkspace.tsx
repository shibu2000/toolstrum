import React, { useState, useMemo } from 'react';
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
import { useAppStore } from '../../../store/useAppStore';
import {
  convertTimestamp,
  explainCron,
  parseDiffSummary,
  HTTP_STATUS_CODES,
  MIME_TYPES,
  buildCurlCommand,
  convertCurlToCode,
  calculateIpv4Subnet,
} from './shared/DeveloperHelpers';
import { DevResultCard, DevStatItem } from './shared/DevResultCard';
import { getDeveloperToolConfig } from './developerConfig';

interface DevNetworkApiTimeWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_SAMPLE_DIFF = `diff --git a/src/app.ts b/src/app.ts
--- a/src/app.ts
+++ b/src/app.ts
@@ -1,5 +1,5 @@
-import { cloudAPI } from './cloud';
+import { localFirstEngine } from './local';
 const app = new Application();
-app.use(cloudAPI);
+app.use(localFirstEngine);`;

const DEFAULT_SAMPLE_CURL = `curl -X POST "https://api.toolstrum.app/v1/auth" \\
  -H "Content-Type: application/json" \\
  -d '{"client":"mobile","offline":true}'`;

export const DevNetworkApiTimeWorkspace: React.FC<DevNetworkApiTimeWorkspaceProps> = ({
  initialToolId = 286,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  // 286 Timestamp state
  const [timestampInput, setTimestampInput] = useState<string>('');

  // 287 Cron state
  const [cronInput, setCronInput] = useState<string>('');

  // 288 Diff state
  const [diffInput, setDiffInput] = useState<string>('');

  // 291 & 292 Search states
  const [searchRefQuery, setSearchRefQuery] = useState<string>('');

  // 296 API Request state
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [apiBody, setApiBody] = useState<string>('');

  // 297 cURL state
  const [curlInput, setCurlInput] = useState<string>('');
  const [curlLang, setCurlLang] = useState<'fetch' | 'axios' | 'python'>('fetch');

  // 300 Subnet state
  const [subnetInput, setSubnetInput] = useState<string>('');

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getDeveloperToolConfig(activeToolId);

  // Output calculation
  const { output, statItems } = useMemo(() => {
    switch (activeToolId) {
      case 286: {
        const res = convertTimestamp(timestampInput);
        const report = `Unix Seconds: ${res.unixSec}\nUnix Milliseconds: ${res.unixMs}\nISO 8601: ${res.iso}\nUTC Format: ${res.utc}`;
        return {
          output: report,
          statItems: [
            { label: 'Unix (sec)', value: res.unixSec },
            { label: 'ISO Year', value: res.iso.slice(0, 4) },
          ],
        };
      }
      case 287: {
        const cron = explainCron(cronInput);
        const report = `${cron.description}\n\nProjected Runs:\n${cron.nextRuns.join('\n')}`;
        return {
          output: report,
          statItems: [
            { label: 'Cron Valid', value: cron.valid ? 'YES' : 'NO' },
            { label: 'Fields', value: '5-part POSIX' },
          ],
        };
      }
      case 288: {
        const diff = parseDiffSummary(diffInput);
        const report = `Git Patch Summary:\n- Additions: +${diff.additions}\n- Deletions: -${diff.deletions}\n- Files Touched: ${diff.files.join(', ') || 'None'}\n\nUnified Diff Content:\n${diffInput}`;
        return {
          output: report,
          statItems: [
            { label: 'Additions', value: `+${diff.additions}` },
            { label: 'Deletions', value: `-${diff.deletions}` },
          ],
        };
      }
      case 291: {
        const q = searchRefQuery.toLowerCase().trim();
        const entries = Object.entries(HTTP_STATUS_CODES).filter(
          ([code, info]) =>
            !q || code.includes(q) || info.title.toLowerCase().includes(q) || info.category.toLowerCase().includes(q)
        );
        const report = entries
          .map(([code, info]) => `${code} ${info.title} (${info.category})\n  ${info.description}`)
          .join('\n\n');
        return {
          output: report || 'No matching HTTP status codes found.',
          statItems: [
            { label: 'Matching Codes', value: entries.length },
            { label: 'Standard RFC', value: 'RFC 9110' },
          ],
        };
      }
      case 292: {
        const q = searchRefQuery.toLowerCase().trim();
        const entries = Object.entries(MIME_TYPES).filter(
          ([ext, mime]) => !q || ext.includes(q) || mime.toLowerCase().includes(q)
        );
        const report = entries.map(([ext, mime]) => `.${ext} -> ${mime}`).join('\n');
        return {
          output: report || 'No matching MIME types found.',
          statItems: [
            { label: 'Entries', value: entries.length },
            { label: 'Type', value: 'IANA Media' },
          ],
        };
      }
      case 296: {
        const curl = buildCurlCommand(
          apiMethod,
          apiUrl,
          { 'Content-Type': 'application/json', 'User-Agent': 'Toolstrum/1.0' },
          apiMethod !== 'GET' ? apiBody : undefined
        );
        return {
          output: curl,
          statItems: [
            { label: 'Method', value: apiMethod },
            { label: 'Output Length', value: curl.length },
          ],
        };
      }
      case 297: {
        const converted = convertCurlToCode(curlInput, curlLang);
        return {
          output: converted,
          statItems: [
            { label: 'Language', value: curlLang.toUpperCase() },
            { label: 'Length', value: converted.length },
          ],
        };
      }
      case 300: {
        const sub = calculateIpv4Subnet(subnetInput);
        const report = `IPv4 CIDR Subnet Calculation:\n- Network Address: ${sub.network}\n- Broadcast Address: ${sub.broadcast}\n- Subnet Mask: ${sub.netmask}\n- Wildcard Mask: ${sub.wildcard}\n- Usable Host Range: ${sub.firstHost} - ${sub.lastHost}\n- Total Addresses: ${sub.totalHosts.toLocaleString()}\n- Usable Hosts: ${sub.usableHosts.toLocaleString()}`;
        return {
          output: report,
          statItems: [
            { label: 'Usable Hosts', value: sub.usableHosts.toLocaleString() },
            { label: 'Subnet Mask', value: sub.netmask },
          ],
        };
      }
      default:
        return { output: '', statItems: [] };
    }
  }, [
    activeToolId,
    timestampInput,
    cronInput,
    diffInput,
    searchRefQuery,
    apiMethod,
    apiUrl,
    apiBody,
    curlInput,
    curlLang,
    subnetInput,
  ]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Network and reference payload saved to local files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Developer Tool'} Output`,
      subtitle: `${output.length} characters generated`,
    });
  };

  const toolsInWorkspace = [
    { id: 286, name: 'Unix Timestamp' },
    { id: 287, name: 'Cron Helper' },
    { id: 288, name: 'Diff Viewer' },
    { id: 291, name: 'HTTP Codes' },
    { id: 292, name: 'MIME Types' },
    { id: 296, name: 'API Builder' },
    { id: 297, name: 'cURL Convert' },
    { id: 300, name: 'IP Subnet' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Network, Time & API Reference'}
        subtitle="Developer Tools · Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(activeToolId)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon
              name="star"
              size={22}
              color={favorited ? Colors.statusWarning : Colors.textMuted}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield />

        {/* Workspace tool selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillContainer}
        >
          {toolsInWorkspace.map((item) => {
            const isActive = item.id === activeToolId;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveToolId(item.id)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 286 Timestamp Controls */}
        {activeToolId === 286 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Unix Timestamp</Text>
            <TextInput
              style={styles.singleInput}
              keyboardType="numeric"
              value={timestampInput}
              onChangeText={setTimestampInput}
              placeholder="e.g. 1767225600"
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity
              style={styles.actionChipInline}
              onPress={() => setTimestampInput(Math.floor(Date.now() / 1000).toString())}
            >
              <Text style={styles.actionChipInlineText}>Use Current Timestamp (Now)</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 287 Cron Helper Controls */}
        {activeToolId === 287 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>5-Part Cron Expression (* * * * *)</Text>
            <TextInput
              style={styles.singleInput}
              value={cronInput}
              onChangeText={setCronInput}
              placeholder="0 9 * * 1-5"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.rowWrap}>
              {[
                { label: 'Every Min', exp: '* * * * *' },
                { label: 'Hourly', exp: '0 * * * *' },
                { label: 'Daily Midnight', exp: '0 0 * * *' },
                { label: 'Weekdays 9am', exp: '0 9 * * 1-5' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.smallPill, cronInput === p.exp && styles.smallPillActive]}
                  onPress={() => setCronInput(p.exp)}
                >
                  <Text
                    style={[styles.smallPillText, cronInput === p.exp && styles.smallPillTextActive]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 288 Diff Viewer Input */}
        {activeToolId === 288 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Unified Git Diff Payload</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={diffInput}
              onChangeText={setDiffInput}
              placeholder="diff --git..."
              placeholderTextColor={Colors.textMuted}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* 291 & 292 Search Reference */}
        {(activeToolId === 291 || activeToolId === 292) && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>
              {activeToolId === 291 ? 'Filter HTTP Status Codes' : 'Filter MIME Media Types'}
            </Text>
            <TextInput
              style={styles.singleInput}
              value={searchRefQuery}
              onChangeText={setSearchRefQuery}
              placeholder="Search by code, title, or extension..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 296 API Request Builder */}
        {activeToolId === 296 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>API Request Assembly</Text>
            <View style={styles.rowWrap}>
              {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.smallPill, apiMethod === m && styles.smallPillActive]}
                  onPress={() => setApiMethod(m)}
                >
                  <Text style={[styles.smallPillText, apiMethod === m && styles.smallPillTextActive]}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.singleInput, { marginTop: 8 }]}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="Endpoint URL..."
              placeholderTextColor={Colors.textMuted}
            />
            {apiMethod !== 'GET' && (
              <TextInput
                style={[styles.textInput, { marginTop: 8 }]}
                multiline
                value={apiBody}
                onChangeText={setApiBody}
                placeholder="JSON Request Body..."
                placeholderTextColor={Colors.textMuted}
              />
            )}
          </View>
        )}

        {/* 297 cURL Converter */}
        {activeToolId === 297 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Target Language</Text>
            <View style={styles.rowWrap}>
              {(['fetch', 'axios', 'python'] as const).map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.smallPill, curlLang === l && styles.smallPillActive]}
                  onPress={() => setCurlLang(l)}
                >
                  <Text style={[styles.smallPillText, curlLang === l && styles.smallPillTextActive]}>
                    {l.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.textInput, { marginTop: 8 }]}
              multiline
              value={curlInput}
              onChangeText={setCurlInput}
              placeholder="curl -X POST..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 300 Subnet Calculator */}
        {activeToolId === 300 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>IPv4 Network CIDR</Text>
            <TextInput
              style={styles.singleInput}
              value={subnetInput}
              onChangeText={setSubnetInput}
              placeholder="e.g. 192.168.1.0/24 or 10.0.0.0/16"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.rowWrap}>
              {['192.168.1.0/24', '10.0.0.0/16', '172.16.0.0/12', '192.168.0.0/28'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.smallPill, subnetInput === c && styles.smallPillActive]}
                  onPress={() => setSubnetInput(c)}
                >
                  <Text style={[styles.smallPillText, subnetInput === c && styles.smallPillTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Output Result Card */}
        <DevResultCard
          title={toolConfig?.name || 'Output Result'}
          subtitle={toolConfig?.description}
          badgeText="Offline Network Engine"
          stats={statItems}
          content={output}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="network-reference.txt"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  favBtn: {
    padding: 6,
  },
  pillScroll: {
    marginBottom: Spacing.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillActive: {
    backgroundColor: Colors.accentSky,
    borderColor: Colors.accentSky,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  pillTextActive: {
    color: Colors.surfaceWhite,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  singleInput: {
    height: 38,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: 'Courier',
    color: Colors.onSurface,
    backgroundColor: '#FAFAFA',
  },
  textInput: {
    minHeight: 90,
    fontSize: 12,
    fontFamily: 'Courier',
    color: Colors.onSurface,
    lineHeight: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  actionChipInline: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceDeveloper,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  actionChipInlineText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.accentSky,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: 8,
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  smallPillActive: {
    backgroundColor: Colors.accentSky,
    borderColor: Colors.accentSky,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  smallPillTextActive: {
    color: Colors.surfaceWhite,
  },
});
