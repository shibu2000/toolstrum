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
  shortenUrl,
  expandUrl,
  extractLinksFromHtml,
  validateUrlStructure,
} from './shared/WebHelpers';
import { generateQrMatrix } from '../security/shared/SecurityHelpers';
import { WebResultCard, WebMetricItem } from './shared/WebResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const WebUrlLinksWorkspace: React.FC<Props> = ({
  initialToolId = 376,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getWebToolConfig(activeToolId) || getWebToolConfig(376)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 376: URL Shortener ---
  const [shortenInput, setShortenInput] = useState('');
  const [customSlug, setCustomSlug] = useState('');

  // --- Tool 377: URL Expander ---
  const [expandInput, setExpandInput] = useState('');

  // --- Tool 378: Website QR Generator ---
  const [qrUrlInput, setQrUrlInput] = useState('');

  // --- Tool 392: Link Extractor ---
  const [htmlInput, setHtmlInput] = useState('');

  // --- Tool 395: URL Validator ---
  const [validateInput, setValidateInput] = useState('');

  // --- Tool 397: QR Link Preview ---
  const [qrPreviewInput, setQrPreviewInput] = useState('');

  // Computations
  const shortenReport = useMemo(() => {
    return shortenUrl(shortenInput, customSlug);
  }, [shortenInput, customSlug]);

  const expandReport = useMemo(() => {
    return expandUrl(expandInput);
  }, [expandInput]);

  const qrMatrix = useMemo(() => {
    const target = activeMode === 'url_qr' ? qrUrlInput : qrPreviewInput;
    if (!target.trim()) return undefined;
    return generateQrMatrix(target, 21);
  }, [activeMode, qrUrlInput, qrPreviewInput]);

  const extractedLinks = useMemo(() => {
    return extractLinksFromHtml(htmlInput);
  }, [htmlInput]);

  const validationReport = useMemo(() => {
    return validateUrlStructure(validateInput);
  }, [validateInput]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'URL Result';
    let metrics: WebMetricItem[] = [];
    let note = '';

    if (activeMode === 'url_shorten') {
      if (!shortenInput.trim()) {
        hero = '—';
        heroLabel = 'Enter Long URL Below';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Mode', value: 'Deterministic alias' },
        ];
        note = 'Paste a long URL below to generate a compact offline short alias.';
      } else {
        hero = shortenReport.shortUrl;
        heroLabel = `Short URL (${shortenReport.savingsPercent}% shorter)`;
        metrics = [
          { label: 'Short Alias', value: shortenReport.shortUrl, highlight: true },
          { label: 'Slug Key', value: shortenReport.slug },
          { label: 'Original Length', value: `${shortenInput.length} chars` },
          { label: 'Length Savings', value: `${shortenReport.savingsPercent}%` },
        ];
        note = 'Generated compact deterministic offline URL hash alias.';
      }
    } else if (activeMode === 'url_expand') {
      if (!expandInput.trim()) {
        hero = '—';
        heroLabel = 'Enter Short Link Below';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
        ];
        note = 'Enter a shortened link below to trace destination domain and redirects.';
      } else {
        hero = expandReport.finalUrl;
        heroLabel = `Resolved Target (${expandReport.domain})`;
        metrics = [
          { label: 'Destination Host', value: expandReport.domain, highlight: true },
          { label: 'Security Protocol', value: expandReport.isHttps ? 'HTTPS' : 'HTTP' },
          { label: 'Hops / Redirects', value: expandReport.redirectsCount },
          { label: 'Query Parameters', value: expandReport.queryParametersCount },
        ];
        note = 'Simulated destination expansion reveals the final redirect target.';
      }
    } else if (activeMode === 'url_qr') {
      if (!qrUrlInput.trim()) {
        hero = '—';
        heroLabel = 'Enter URL to Encode';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Resolution', value: '21 x 21 matrix' },
        ];
        note = 'Type or paste a website URL below to generate a high-contrast QR code.';
      } else {
        hero = qrUrlInput;
        heroLabel = 'Website Link Encoded';
        metrics = [
          { label: 'Target URL', value: qrUrlInput, highlight: true },
          { label: 'Matrix Resolution', value: '21 x 21 cells' },
          { label: 'Encoding Format', value: 'Alphanumeric QR' },
          { label: 'Length', value: `${qrUrlInput.length} chars` },
        ];
        note = 'High-contrast scannable QR code generated for instant mobile camera detection.';
      }
    } else if (activeMode === 'link_extract') {
      if (!htmlInput.trim()) {
        hero = '0 Links Extracted';
        heroLabel = 'HTML Hyperlinks';
        metrics = [
          { label: 'Status', value: 'Awaiting HTML input' },
        ];
        note = 'Paste HTML source markup below to extract internal and external hyperlinks.';
      } else {
        hero = `${extractedLinks.length} Links Extracted`;
        heroLabel = 'HTML Hyperlinks';
        const internalCount = extractedLinks.filter((l) => l.type === 'Internal').length;
        const externalCount = extractedLinks.filter((l) => l.type === 'External').length;
        metrics = [
          { label: 'Total Links', value: extractedLinks.length, highlight: true },
          { label: 'Internal Links', value: internalCount },
          { label: 'External Links', value: externalCount },
          { label: 'Anchors / Mailto', value: extractedLinks.length - internalCount - externalCount },
        ];
        note = 'Parsed all anchor tags and raw URL references from HTML source.';
      }
    } else if (activeMode === 'url_validate') {
      if (!validateInput.trim()) {
        hero = '—';
        heroLabel = 'Enter URL to Validate';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
        ];
        note = 'Enter a complete URL to inspect scheme, port, hostname, and RFC validity.';
      } else {
        hero = validationReport.isValid ? 'Valid RFC 3986 URL' : 'Invalid URL Format';
        heroLabel = `Status: ${validationReport.protocol.toUpperCase() || 'ERROR'}`;
        metrics = [
          { label: 'Validation Status', value: validationReport.isValid ? 'Pass' : 'Fail', highlight: true },
          { label: 'Host Domain', value: validationReport.hostname || 'None' },
          { label: 'Protocol', value: validationReport.protocol || 'None' },
          { label: 'Target Port', value: validationReport.port || 'Default' },
        ];
        note = validationReport.diagnostics.join(' ');
      }
    } else if (activeMode === 'qr_preview') {
      if (!qrPreviewInput.trim()) {
        hero = '—';
        heroLabel = 'Enter URL to Preview';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
        ];
        note = 'Preview link destinations safely before navigating or sharing.';
      } else {
        hero = qrPreviewInput;
        heroLabel = 'Scanned QR Destination';
        metrics = [
          { label: 'Preview Host', value: qrPreviewInput.split('/')[2] || 'Host', highlight: true },
          { label: 'SSL Secured', value: qrPreviewInput.startsWith('https://') ? 'Yes' : 'No' },
          { label: 'Has Tracking', value: qrPreviewInput.includes('utm_') ? 'Yes' : 'Clean' },
        ];
        note = 'Preview link destinations safely before navigating or sharing.';
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    shortenReport,
    shortenInput,
    expandReport,
    qrUrlInput,
    extractedLinks,
    validationReport,
    qrPreviewInput,
  ]);

  const urlTools = [
    { id: 376, name: 'Shortener' },
    { id: 377, name: 'Expander' },
    { id: 378, name: 'Web QR' },
    { id: 392, name: 'Link Extractor' },
    { id: 395, name: 'URL Validator' },
    { id: 397, name: 'QR Preview' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Web & Internet • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />

      {/* Workspace Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {urlTools.map((t) => {
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
        {/* Controls Card */}
        <View style={styles.card}>
          {activeMode === 'url_shorten' && (
            <View>
              <Text style={styles.sectionTitle}>URL Shortener</Text>
              <Text style={styles.subtext}>
                Generate lightweight compact URL aliases with customized slugs.
              </Text>

              <Text style={styles.label}>Long Destination URL</Text>
              <TextInput
                style={styles.input}
                value={shortenInput}
                onChangeText={setShortenInput}
                placeholder="https://example.com/very/long/path..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Custom Alias Slug (Optional)</Text>
              <TextInput
                style={styles.input}
                value={customSlug}
                onChangeText={setCustomSlug}
                placeholder="my-link"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setShortenInput('https://news.ycombinator.com/item?id=38192837')}
                >
                  <Text style={styles.chipText}>Hacker News Link</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setShortenInput('https://github.com/facebook/react-native/releases/tag/v0.74.0')}
                >
                  <Text style={styles.chipText}>GitHub Release</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'url_expand' && (
            <View>
              <Text style={styles.sectionTitle}>URL Expander & Redirect Tracer</Text>
              <Text style={styles.subtext}>
                Unmask shortened links and trace destination hosts without opening browser tabs.
              </Text>

              <Text style={styles.label}>Shortened Link</Text>
              <TextInput
                style={styles.input}
                value={expandInput}
                onChangeText={setExpandInput}
                placeholder="https://bit.ly/... or https://t.co/..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setExpandInput('https://bit.ly/3x8ZbP9')}
                >
                  <Text style={styles.chipText}>Bit.ly Sample</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setExpandInput('https://t.co/9qWz2bKp')}
                >
                  <Text style={styles.chipText}>Twitter t.co Sample</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'url_qr' && (
            <View>
              <Text style={styles.sectionTitle}>Website QR Code Generator</Text>
              <Text style={styles.subtext}>
                Encode URLs into scannable QR matrices compatible with iOS and Android camera apps.
              </Text>

              <Text style={styles.label}>Website URL</Text>
              <TextInput
                style={styles.input}
                value={qrUrlInput}
                onChangeText={setQrUrlInput}
                placeholder="https://yourwebsite.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setQrUrlInput('https://toolstrum.app')}
                >
                  <Text style={styles.chipText}>Toolstrum Home</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setQrUrlInput('https://wikipedia.org')}
                >
                  <Text style={styles.chipText}>Wikipedia</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'link_extract' && (
            <View>
              <Text style={styles.sectionTitle}>HTML Link Extractor</Text>
              <Text style={styles.subtext}>
                Extract all hyperlinks, internal pages, anchors, and emails from HTML documents.
              </Text>

              <Text style={styles.label}>HTML Source Code</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={htmlInput}
                onChangeText={setHtmlInput}
                placeholder="Paste HTML here..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />

              {/* Extracted Links List */}
              <Text style={styles.label}>Extracted Links ({extractedLinks.length})</Text>
              {extractedLinks.slice(0, 5).map((l, idx) => (
                <View key={idx} style={styles.linkItem}>
                  <View style={styles.linkTypeBadge}>
                    <Text style={styles.linkTypeText}>{l.type}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkTextTitle} numberOfLines={1}>{l.text}</Text>
                    <Text style={styles.linkHref} numberOfLines={1}>{l.href}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {activeMode === 'url_validate' && (
            <View>
              <Text style={styles.sectionTitle}>URL Syntax Validator</Text>
              <Text style={styles.subtext}>
                Check compliance against RFC 3986 URI specifications.
              </Text>

              <Text style={styles.label}>URL to Validate</Text>
              <TextInput
                style={styles.input}
                value={validateInput}
                onChangeText={setValidateInput}
                placeholder="https://..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setValidateInput('https://user:pass@example.com:8080/path/file.html?q=test#top')}
                >
                  <Text style={styles.chipText}>Complex URI</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setValidateInput('http://invalid url with spaces.com')}
                >
                  <Text style={styles.chipText}>Invalid Spaced URL</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'qr_preview' && (
            <View>
              <Text style={styles.sectionTitle}>QR Link Inspector & Preview</Text>
              <Text style={styles.subtext}>
                Safely inspect QR code payloads and host domain reputation before visiting.
              </Text>

              <Text style={styles.label}>QR Scanned Payload</Text>
              <TextInput
                style={styles.input}
                value={qrPreviewInput}
                onChangeText={setQrPreviewInput}
                placeholder="https://..."
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
          badgeText="100% Offline Web Engine"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={calculation.hero}
          fileName={`${config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`}
          qrMatrix={activeMode === 'url_qr' || activeMode === 'qr_preview' ? qrMatrix : undefined}
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
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
    fontFamily: 'Courier',
    fontSize: 12,
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
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  linkTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  linkTypeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  linkTextTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  linkHref: {
    fontSize: 11,
    color: '#64748B',
  },
});
