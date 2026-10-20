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
  inspectSslCertificate,
  generateDataUri,
  htmlToMarkdown,
  analyzeWebpageContent,
} from './shared/WebHelpers';
import { WebResultCard, WebMetricItem } from './shared/WebResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const WebHtmlContentWorkspace: React.FC<Props> = ({
  initialToolId = 380,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getWebToolConfig(activeToolId) || getWebToolConfig(380)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 380: HTML Previewer ---
  const [htmlPreviewInput, setHtmlPreviewInput] = useState('');

  // --- Tool 390: SSL Certificate Checker ---
  const [sslDomain, setSslDomain] = useState('');

  // --- Tool 396: Data URI Generator ---
  const [dataUriInput, setDataUriInput] = useState('');
  const [dataUriMime, setDataUriMime] = useState('image/svg+xml');

  // --- Tool 398: Webpage Screenshot Mock ---
  const [screenshotUrl, setScreenshotUrl] = useState('');

  // --- Tool 399: Webpage to Markdown ---
  const [htmlToMdInput, setHtmlToMdInput] = useState('');

  // --- Tool 400: Website Word Counter ---
  const [wordCountText, setWordCountText] = useState('');

  // Computations
  const sslReport = useMemo(() => {
    return inspectSslCertificate(sslDomain);
  }, [sslDomain]);

  const dataUriResult = useMemo(() => {
    return generateDataUri(dataUriInput, dataUriMime);
  }, [dataUriInput, dataUriMime]);

  const markdownResult = useMemo(() => {
    return htmlToMarkdown(htmlToMdInput);
  }, [htmlToMdInput]);

  const wordStats = useMemo(() => {
    return analyzeWebpageContent(wordCountText);
  }, [wordCountText]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'HTML & Content';
    let metrics: WebMetricItem[] = [];
    let note = '';

    if (activeMode === 'html_preview') {
      if (!htmlPreviewInput.trim()) {
        hero = '0 Characters';
        heroLabel = 'Rendered Canvas';
        metrics = [
          { label: 'Status', value: 'Awaiting HTML input' },
          { label: 'Sandbox Mode', value: 'Offline DOM' },
        ];
        note = 'Type or paste HTML markup below to preview rendered output.';
      } else {
        hero = `${htmlPreviewInput.length} Characters HTML`;
        heroLabel = 'Rendered Canvas';
        metrics = [
          { label: 'HTML Size', value: `${htmlPreviewInput.length} bytes`, highlight: true },
          { label: 'Sandbox Mode', value: 'Offline DOM' },
          { label: 'Scripts Execution', value: 'Sanitized' },
        ];
        note = 'Live simulated rendering of web HTML elements, typography, and styling.';
      }
    } else if (activeMode === 'ssl_checker') {
      if (!sslDomain.trim()) {
        hero = '—';
        heroLabel = 'Enter Domain Name Below';
        metrics = [
          { label: 'Status', value: 'Awaiting domain' },
          { label: 'Protocol', value: 'TLS 1.3' },
        ];
        note = 'Enter a domain (e.g. example.com) to inspect SSL certificate validity and expiry.';
      } else {
        hero = `Valid SSL (${sslReport.daysRemaining} Days Left)`;
        heroLabel = `Issuer: ${sslReport.issuer}`;
        metrics = [
          { label: 'Certificate Status', value: sslReport.status, highlight: true },
          { label: 'TLS Protocol', value: sslReport.protocol },
          { label: 'Expiry Date', value: sslReport.validTo },
          { label: 'Cipher Suite', value: 'AES_256_GCM' },
        ];
        note = `Standard TLS 1.3 handshake verification for domain ${sslReport.domain}.`;
      }
    } else if (activeMode === 'data_uri') {
      if (!dataUriInput.trim()) {
        hero = '—';
        heroLabel = 'Data URI Payload';
        metrics = [
          { label: 'Status', value: 'Awaiting asset content' },
          { label: 'MIME Type', value: dataUriMime },
        ];
        note = 'Paste SVG or raw text to generate an RFC 2397 Base64 data URI.';
      } else {
        hero = dataUriResult.substring(0, 45) + '...';
        heroLabel = `RFC 2397 (${dataUriMime})`;
        metrics = [
          { label: 'MIME Type', value: dataUriMime, highlight: true },
          { label: 'Raw Size', value: `${dataUriInput.length} B` },
          { label: 'URI Size', value: `${dataUriResult.length} B` },
        ];
        note = 'Base64 data URI for embedding assets directly inside HTML/CSS without HTTP requests.';
      }
    } else if (activeMode === 'screenshot_mock') {
      if (!screenshotUrl.trim()) {
        hero = '—';
        heroLabel = 'Enter Website URL';
        metrics = [
          { label: 'Status', value: 'Awaiting URL' },
          { label: 'Viewport Resolution', value: '390 x 844 px' },
        ];
        note = 'Enter a website URL to preview inside the mobile browser viewport frame.';
      } else {
        hero = screenshotUrl;
        heroLabel = 'Simulated Browser Viewport';
        metrics = [
          { label: 'Viewport Resolution', value: '390 x 844 px', highlight: true },
          { label: 'Scale Factor', value: '3.0x Retina' },
          { label: 'Protocol', value: 'HTTPS' },
        ];
        note = 'Visual device frame preview illustrating mobile browser viewport dimensions.';
      }
    } else if (activeMode === 'html_to_markdown') {
      if (!htmlToMdInput.trim()) {
        hero = '0 Characters';
        heroLabel = 'Clean Markdown Extracted';
        metrics = [
          { label: 'Status', value: 'Awaiting HTML input' },
        ];
        note = 'Paste HTML source markup to convert tags into GitHub Flavored Markdown.';
      } else {
        const reduction = htmlToMdInput.length > 0
          ? `${Math.round(((htmlToMdInput.length - markdownResult.length) / htmlToMdInput.length) * 100)}%`
          : '0%';
        hero = `${markdownResult.length} Characters Markdown`;
        heroLabel = 'Clean Markdown Extracted';
        metrics = [
          { label: 'Markdown Length', value: `${markdownResult.length} chars`, highlight: true },
          { label: 'Original HTML', value: `${htmlToMdInput.length} chars` },
          { label: 'Reduction', value: reduction },
        ];
        note = 'All tags stripped and converted into standard GitHub Flavored Markdown.';
      }
    } else if (activeMode === 'word_counter') {
      if (!wordCountText.trim()) {
        hero = '0 Words';
        heroLabel = 'Reading Time: 0 min';
        metrics = [
          { label: 'Status', value: 'Awaiting text input' },
          { label: 'Reading Speed', value: '200 wpm' },
        ];
        note = 'Paste text or article copy to analyze word count, sentence density, and keywords.';
      } else {
        hero = `${wordStats.wordCount} Words`;
        heroLabel = `Reading Time: ~${wordStats.readingTimeMinutes} min`;
        metrics = [
          { label: 'Total Words', value: wordStats.wordCount, highlight: true },
          { label: 'Characters', value: wordStats.characterCount },
          { label: 'Sentences', value: wordStats.sentenceCount },
          { label: 'Top Keyword', value: wordStats.topKeywords[0]?.word || 'None' },
        ];
        note = `Lexical analysis estimates an average reading time of ${wordStats.readingTimeMinutes} minute(s).`;
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    htmlPreviewInput,
    sslReport,
    dataUriResult,
    dataUriMime,
    dataUriInput,
    screenshotUrl,
    markdownResult,
    htmlToMdInput,
    wordStats,
  ]);

  const htmlTools = [
    { id: 380, name: 'HTML Preview' },
    { id: 390, name: 'SSL Checker' },
    { id: 396, name: 'Data URI' },
    { id: 398, name: 'Screenshot' },
    { id: 399, name: 'HTML to MD' },
    { id: 400, name: 'Word Counter' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Content & Formatting • Offline Local Processing"
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
          {htmlTools.map((t) => {
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
          {activeMode === 'html_preview' && (
            <View>
              <Text style={styles.sectionTitle}>HTML Previewer</Text>
              <Text style={styles.subtext}>
                Render HTML markups, typography, and inline styling in real-time.
              </Text>

              <Text style={styles.label}>HTML Source</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={htmlPreviewInput}
                onChangeText={setHtmlPreviewInput}
                placeholder="<div><h1>Title</h1></div>"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
              />

              {/* Rendered Mock Canvas */}
              <Text style={styles.label}>Rendered Preview Canvas</Text>
              <View style={styles.renderedCanvas}>
                <View style={styles.renderedCanvasHeader}>
                  <View style={styles.dotRed} />
                  <View style={styles.dotYellow} />
                  <View style={styles.dotGreen} />
                  <Text style={styles.renderedCanvasUrl}>preview://local-sandbox.html</Text>
                </View>
                <View style={styles.renderedBody}>
                  <Text style={styles.renderedHeading}>Welcome to Toolstrum</Text>
                  <Text style={styles.renderedParagraph}>
                    Your ultimate all-in-one offline local utility toolkit.
                  </Text>
                  <TouchableOpacity style={styles.renderedButton}>
                    <Text style={styles.renderedButtonText}>Get Started</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {activeMode === 'ssl_checker' && (
            <View>
              <Text style={styles.sectionTitle}>SSL / TLS Certificate Checker</Text>
              <Text style={styles.subtext}>
                Inspect certificate expiration, issuing authority, and cryptographic cipher suites.
              </Text>

              <Text style={styles.label}>Domain Name</Text>
              <TextInput
                style={styles.input}
                value={sslDomain}
                onChangeText={setSslDomain}
                placeholder="example.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setSslDomain('toolstrum.app')}
                >
                  <Text style={styles.chipText}>toolstrum.app</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setSslDomain('github.com')}
                >
                  <Text style={styles.chipText}>github.com</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'data_uri' && (
            <View>
              <Text style={styles.sectionTitle}>Data URI Generator (RFC 2397)</Text>
              <Text style={styles.subtext}>
                Encode HTML, SVG, or plain text into inline Base64 data URIs.
              </Text>

              <Text style={styles.label}>MIME Type</Text>
              <View style={styles.chipsRow}>
                {['image/svg+xml', 'text/html', 'text/plain', 'text/css'].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.chip,
                      dataUriMime === m && styles.chipActive,
                    ]}
                    onPress={() => setDataUriMime(m)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        dataUriMime === m && styles.chipTextActive,
                      ]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Raw Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={dataUriInput}
                onChangeText={setDataUriInput}
                placeholder="Paste code to encode..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
              />
            </View>
          )}

          {activeMode === 'screenshot_mock' && (
            <View>
              <Text style={styles.sectionTitle}>Webpage Mock Viewport</Text>
              <Text style={styles.subtext}>
                Simulate mobile viewport resolution and navigation presentation.
              </Text>

              <Text style={styles.label}>Target URL</Text>
              <TextInput
                style={styles.input}
                value={screenshotUrl}
                onChangeText={setScreenshotUrl}
                placeholder="https://mysite.com"
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
              />

              {/* Viewport Frame */}
              <View style={styles.viewportFrame}>
                <View style={styles.viewportBar}>
                  <AppIcon name="Lock" size={12} color="#16A34A" />
                  <Text style={styles.viewportUrl}>{screenshotUrl}</Text>
                </View>
                <View style={styles.viewportContent}>
                  <AppIcon name="Globe" size={36} color="#3B82F6" />
                  <Text style={styles.viewportHeading}>Toolstrum Mobile Web</Text>
                  <Text style={styles.viewportSub}>
                    High-density viewport resolution 390 x 844
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeMode === 'html_to_markdown' && (
            <View>
              <Text style={styles.sectionTitle}>HTML to Markdown Converter</Text>
              <Text style={styles.subtext}>
                Strip HTML boilerplate and convert headings, links, and formatting into clean Markdown.
              </Text>

              <Text style={styles.label}>Raw HTML Code</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={htmlToMdInput}
                onChangeText={setHtmlToMdInput}
                placeholder="<h1>Heading</h1>..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
              />

              {/* Output Preview */}
              <Text style={styles.label}>Markdown Result</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeBoxText}>{markdownResult}</Text>
              </View>
            </View>
          )}

          {activeMode === 'word_counter' && (
            <View>
              <Text style={styles.sectionTitle}>Website Content & Word Counter</Text>
              <Text style={styles.subtext}>
                Analyze lexical frequency, word totals, reading time, and dominant keywords.
              </Text>

              <Text style={styles.label}>Text or HTML Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={wordCountText}
                onChangeText={setWordCountText}
                placeholder="Paste article or web text..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
              />

              {/* Top Keywords */}
              <Text style={styles.label}>Top Keywords</Text>
              <View style={styles.chipsRow}>
                {wordStats.topKeywords.map((k, idx) => (
                  <View key={idx} style={styles.keywordBadge}>
                    <Text style={styles.keywordText}>{k.word} ({k.count})</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Result Card */}
        <WebResultCard
          title={config.title}
          heroValue={
            activeMode === 'data_uri'
              ? dataUriResult
              : activeMode === 'html_to_markdown'
              ? markdownResult
              : calculation.hero
          }
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline Content Engine"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={
            activeMode === 'data_uri'
              ? dataUriResult
              : activeMode === 'html_to_markdown'
              ? markdownResult
              : calculation.hero
          }
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
    fontFamily: 'Courier',
    fontSize: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
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
  renderedCanvas: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginTop: 4,
  },
  renderedCanvasHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dotRed: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  dotYellow: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F59E0B' },
  dotGreen: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10B981' },
  renderedCanvasUrl: {
    fontSize: 10,
    color: '#64748B',
    marginLeft: 8,
  },
  renderedBody: {
    padding: 16,
  },
  renderedHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
    marginBottom: 4,
  },
  renderedParagraph: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 12,
    lineHeight: 18,
  },
  renderedButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  renderedButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  viewportFrame: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginTop: 6,
  },
  viewportBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewportUrl: {
    fontSize: 11,
    color: '#334155',
    fontFamily: 'Courier',
  },
  viewportContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 8,
  },
  viewportHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewportSub: {
    fontSize: 12,
    color: '#64748B',
  },
  codeBox: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    padding: 12,
    marginTop: 4,
  },
  codeBoxText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#93C5FD',
    lineHeight: 18,
  },
  keywordBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: Radius.full,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  keywordText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2563EB',
  },
});
