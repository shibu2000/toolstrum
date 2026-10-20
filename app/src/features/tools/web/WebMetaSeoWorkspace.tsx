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
  parseHtmlMetadata,
  generateMetaTags,
  parseRobotsTxt,
  parseSitemapXml,
  generateSitemapXml,
  SitemapEntry,
} from './shared/WebHelpers';
import { WebResultCard, WebMetricItem } from './shared/WebResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const WebMetaSeoWorkspace: React.FC<Props> = ({
  initialToolId = 379,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getWebToolConfig(activeToolId) || getWebToolConfig(379)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 379: Website Metadata Viewer & Tool 381: OG Preview ---
  const [metaHtmlInput, setMetaHtmlInput] = useState('');

  // --- Tool 382: Robots.txt Viewer ---
  const [robotsInput, setRobotsInput] = useState('');

  // --- Tool 383: Sitemap Viewer ---
  const [sitemapXmlInput, setSitemapXmlInput] = useState('');

  // --- Tool 393: Meta Tag Generator ---
  const [genTitle, setGenTitle] = useState('');
  const [genDesc, setGenDesc] = useState('');
  const [genUrl, setGenUrl] = useState('');
  const [genImage, setGenImage] = useState('');

  // --- Tool 394: Sitemap Generator ---
  const [sitemapUrlsText, setSitemapUrlsText] = useState('');

  // Computations
  const parsedMeta = useMemo(() => {
    return parseHtmlMetadata(metaHtmlInput);
  }, [metaHtmlInput]);

  const parsedRobots = useMemo(() => {
    return parseRobotsTxt(robotsInput);
  }, [robotsInput]);

  const parsedSitemap = useMemo(() => {
    return parseSitemapXml(sitemapXmlInput);
  }, [sitemapXmlInput]);

  const generatedMetaCode = useMemo(() => {
    return generateMetaTags({
      title: genTitle,
      description: genDesc,
      url: genUrl,
      image: genImage,
      siteName: 'Toolstrum App',
      author: 'Toolstrum Engineering',
    });
  }, [genTitle, genDesc, genUrl, genImage]);

  const generatedSitemapCode = useMemo(() => {
    const lines = sitemapUrlsText.split('\n').map((l) => l.trim()).filter(Boolean);
    const entries: SitemapEntry[] = lines.map((loc) => ({
      loc,
      lastmod: '2026-10-10',
      changefreq: 'weekly',
      priority: loc.endsWith('/') ? '1.0' : '0.8',
    }));
    return generateSitemapXml(entries);
  }, [sitemapUrlsText]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'SEO Output';
    let metrics: WebMetricItem[] = [];
    let note = '';

    if (activeMode === 'meta_viewer') {
      if (!metaHtmlInput.trim()) {
        hero = '—';
        heroLabel = 'Enter HTML <head> markup';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Target', value: 'Page metadata tags' },
        ];
        note = 'Paste HTML markup or <head> tags below to inspect SEO metadata.';
      } else {
        hero = parsedMeta.title || 'Untitled Document';
        heroLabel = 'Page Title & Metadata';
        metrics = [
          { label: 'Title Length', value: `${parsedMeta.title.length} chars (Best: 50-60)`, highlight: true },
          { label: 'Description', value: `${parsedMeta.description.length} chars (Best: 150-160)` },
          { label: 'Canonical URL', value: parsedMeta.canonical ? 'Specified' : 'Missing' },
          { label: 'Charset Encoding', value: parsedMeta.charset },
        ];
        note = parsedMeta.description
          ? `Description: "${parsedMeta.description}"`
          : 'Warning: Missing meta description tags.';
      }
    } else if (activeMode === 'og_preview') {
      if (!metaHtmlInput.trim()) {
        hero = '—';
        heroLabel = 'Social Open Graph Card';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
          { label: 'Target', value: 'og:title, og:image, etc.' },
        ];
        note = 'Paste HTML with Open Graph tags below to preview social cards.';
      } else {
        hero = parsedMeta.ogTitle || parsedMeta.title || 'Untitled Card';
        heroLabel = 'Social Open Graph Card';
        metrics = [
          { label: 'OG Title', value: parsedMeta.ogTitle || 'N/A', highlight: true },
          { label: 'Twitter Card', value: parsedMeta.twitterCard },
          { label: 'Image URL', value: parsedMeta.ogImage ? 'Configured' : 'Missing' },
        ];
        note = 'Simulated Open Graph social snippet for social media card previews.';
      }
    } else if (activeMode === 'robots_view') {
      if (!robotsInput.trim()) {
        hero = '0 Rules';
        heroLabel = 'Robots.txt Directives';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
        ];
        note = 'Paste robots.txt content below to parse crawling and indexing rules.';
      } else {
        hero = `${parsedRobots.length} User-Agent Rules`;
        heroLabel = 'Robots.txt Directives';
        const disallows = parsedRobots.reduce((acc, r) => acc + r.disallowed.length, 0);
        metrics = [
          { label: 'Rule Blocks', value: parsedRobots.length, highlight: true },
          { label: 'Disallow Paths', value: disallows },
          { label: 'Sitemap Links', value: parsedRobots[0]?.sitemaps.length || 0 },
        ];
        note = 'Parsed crawl directives indicating search bot indexing rules.';
      }
    } else if (activeMode === 'sitemap_view') {
      if (!sitemapXmlInput.trim()) {
        hero = '0 Indexed URLs';
        heroLabel = 'Sitemap Entries';
        metrics = [
          { label: 'Status', value: 'Awaiting input' },
        ];
        note = 'Paste sitemap.xml markup below to parse indexed URLs.';
      } else {
        hero = `${parsedSitemap.length} Indexed URLs`;
        heroLabel = 'Sitemap Entries';
        metrics = [
          { label: 'Total URLs', value: parsedSitemap.length, highlight: true },
          { label: 'Change Freq', value: parsedSitemap[0]?.changefreq || 'N/A' },
          { label: 'Top Priority', value: parsedSitemap[0]?.priority || '1.0' },
        ];
        note = 'Standard XML sitemap parsed with canonical URL locations and freshness.';
      }
    } else if (activeMode === 'meta_generator') {
      if (!genTitle.trim()) {
        hero = '<title>—</title>';
        heroLabel = 'Generated Meta Tags';
        metrics = [
          { label: 'Status', value: 'Awaiting title' },
        ];
        note = 'Enter webpage title and metadata below to generate production-ready HTML tags.';
      } else {
        hero = `<title>${genTitle}</title>`;
        heroLabel = 'Generated Meta Tags';
        metrics = [
          { label: 'Title Length', value: genTitle.length, highlight: true },
          { label: 'Tags Generated', value: '14 HTML Meta Tags' },
          { label: 'Twitter & OG', value: 'Supported' },
        ];
        note = 'Ready-to-paste HTML meta tags containing standard SEO and social cards.';
      }
    } else if (activeMode === 'sitemap_generator') {
      const count = sitemapUrlsText.split('\n').filter((l) => l.trim()).length;
      if (count === 0) {
        hero = '0 URLs';
        heroLabel = 'Generated XML Sitemap';
        metrics = [
          { label: 'Status', value: 'Awaiting URLs' },
        ];
        note = 'Enter page URLs below (one per line) to generate a valid XML sitemap.';
      } else {
        hero = `${count} URLs Compiled`;
        heroLabel = 'Generated XML Sitemap';
        metrics = [
          { label: 'Total Locations', value: count, highlight: true },
          { label: 'XML Schema', value: 'sitemaps.org 0.9' },
          { label: 'Change Frequency', value: 'Weekly' },
        ];
        note = 'Valid XML sitemap ready for deployment to search engine webmaster consoles.';
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    parsedMeta,
    parsedRobots,
    parsedSitemap,
    genTitle,
    sitemapUrlsText,
  ]);

  const seoTools = [
    { id: 379, name: 'Metadata' },
    { id: 381, name: 'Open Graph' },
    { id: 382, name: 'Robots.txt' },
    { id: 383, name: 'Sitemap View' },
    { id: 393, name: 'Meta Gen' },
    { id: 394, name: 'Sitemap Gen' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="SEO & Metadata • Offline Local Processing"
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
          {seoTools.map((t) => {
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
          {activeMode === 'meta_viewer' && (
            <View>
              <Text style={styles.sectionTitle}>Website Metadata Viewer</Text>
              <Text style={styles.subtext}>
                Inspect HTML headers for title tags, descriptions, viewports, and canonical references.
              </Text>

              <Text style={styles.label}>HTML Source Header</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={metaHtmlInput}
                onChangeText={setMetaHtmlInput}
                placeholder="Paste HTML <head>..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
              />
            </View>
          )}

          {activeMode === 'og_preview' && (
            <View>
              <Text style={styles.sectionTitle}>Open Graph Social Card Preview</Text>
              <Text style={styles.subtext}>
                Preview how your links appear when shared across Twitter, Facebook, and Slack.
              </Text>

              {/* Social Card Mockup */}
              <View style={styles.socialCard}>
                <View style={styles.socialImagePlaceholder}>
                  <AppIcon name="Image" size={32} color="#3B82F6" />
                  <Text style={styles.socialImageText}>
                    {parsedMeta.ogImage || 'og:image placeholder'}
                  </Text>
                </View>
                <View style={styles.socialBody}>
                  <Text style={styles.socialDomain}>TOOLSTRUM.APP</Text>
                  <Text style={styles.socialTitle}>{parsedMeta.ogTitle || parsedMeta.title}</Text>
                  <Text style={styles.socialDesc} numberOfLines={2}>
                    {parsedMeta.ogDescription || parsedMeta.description}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {activeMode === 'robots_view' && (
            <View>
              <Text style={styles.sectionTitle}>Robots.txt Directives Viewer</Text>
              <Text style={styles.subtext}>
                Inspect search crawler access permissions, disallow patterns, and sitemaps.
              </Text>

              <Text style={styles.label}>Robots.txt Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={robotsInput}
                onChangeText={setRobotsInput}
                placeholder="User-agent: *..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
              />

              {/* Parsed Rule Cards */}
              <Text style={styles.label}>Parsed Rules</Text>
              {parsedRobots.map((rule, idx) => (
                <View key={idx} style={styles.ruleCard}>
                  <Text style={styles.ruleAgent}>Agent: {rule.userAgent}</Text>
                  <Text style={styles.rulePaths}>
                    Disallow: {rule.disallowed.join(', ') || 'None'}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {activeMode === 'sitemap_view' && (
            <View>
              <Text style={styles.sectionTitle}>Sitemap XML Viewer</Text>
              <Text style={styles.subtext}>
                Parse XML sitemaps to verify indexing locations, modification dates, and priorities.
              </Text>

              <Text style={styles.label}>XML Sitemap Content</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={sitemapXmlInput}
                onChangeText={setSitemapXmlInput}
                placeholder="<urlset>..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
              />
            </View>
          )}

          {activeMode === 'meta_generator' && (
            <View>
              <Text style={styles.sectionTitle}>Meta Tag Generator</Text>
              <Text style={styles.subtext}>
                Generate complete SEO and social meta tags for your web application.
              </Text>

              <Text style={styles.label}>Page Title</Text>
              <TextInput
                style={styles.input}
                value={genTitle}
                onChangeText={setGenTitle}
                placeholder="Page Title"
              />

              <Text style={styles.label}>Meta Description</Text>
              <TextInput
                style={styles.input}
                value={genDesc}
                onChangeText={setGenDesc}
                placeholder="Brief summary..."
              />

              <Text style={styles.label}>Canonical URL</Text>
              <TextInput
                style={styles.input}
                value={genUrl}
                onChangeText={setGenUrl}
                placeholder="https://..."
                autoCapitalize="none"
              />

              <Text style={styles.label}>Social Card Image URL</Text>
              <TextInput
                style={styles.input}
                value={genImage}
                onChangeText={setGenImage}
                placeholder="https://.../og.png"
                autoCapitalize="none"
              />
            </View>
          )}

          {activeMode === 'sitemap_generator' && (
            <View>
              <Text style={styles.sectionTitle}>XML Sitemap Generator</Text>
              <Text style={styles.subtext}>
                Generate XML sitemaps from line-delimited lists of URLs.
              </Text>

              <Text style={styles.label}>URLs List (One per line)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={sitemapUrlsText}
                onChangeText={setSitemapUrlsText}
                placeholder="https://mysite.com/&#10;https://mysite.com/about"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={5}
                autoCapitalize="none"
              />
            </View>
          )}
        </View>

        {/* Dynamic Result Card */}
        <WebResultCard
          title={config.title}
          heroValue={
            activeMode === 'meta_generator'
              ? generatedMetaCode
              : activeMode === 'sitemap_generator'
              ? generatedSitemapCode
              : calculation.hero
          }
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline SEO Engine"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={
            activeMode === 'meta_generator'
              ? generatedMetaCode
              : activeMode === 'sitemap_generator'
              ? generatedSitemapCode
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
  socialCard: {
    borderRadius: Radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  socialImagePlaceholder: {
    height: 120,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  socialImageText: {
    fontSize: 11,
    color: '#3B82F6',
  },
  socialBody: {
    padding: 12,
  },
  socialDomain: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginVertical: 4,
  },
  socialDesc: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
  },
  ruleCard: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  ruleAgent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  rulePaths: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
