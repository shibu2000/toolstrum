import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Colors, Spacing, Radius, StudioTheme } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { STUDIOS } from '../../data/registry';
import { useAppStore } from '../../store/useAppStore';

const POPULAR_TOOLS = [
  {
    id: 1,
    name: 'Images to PDF',
    desc: 'Batch JPG & PNG conversion',
    icon: 'Image',
    iconBg: Colors.surfacePdf,
    iconColor: Colors.accentCoral,
    status: 'Offline',
  },
  {
    id: 4,
    name: 'Merge PDF',
    desc: 'Combine multi-page docs',
    icon: 'FileText',
    iconBg: Colors.surfacePdf,
    iconColor: Colors.accentCoral,
    status: 'Offline',
  },
  {
    id: 49,
    name: 'Image Compressor',
    desc: 'Lossless web compression',
    icon: 'Image',
    iconBg: Colors.surfaceImage,
    iconColor: Colors.accentEmerald,
    status: 'Instant',
  },
  {
    id: 50,
    name: 'Image Resizer',
    desc: 'Scale dimensions & DPI',
    icon: 'Crop',
    iconBg: Colors.surfaceImage,
    iconColor: Colors.accentEmerald,
    status: 'Instant',
  },
  {
    id: 205,
    name: 'Word Counter',
    desc: 'Characters, words & reading time',
    icon: 'Type',
    iconBg: Colors.surfaceText,
    iconColor: Colors.accentTeal,
    status: 'Offline',
  },
  {
    id: 244,
    name: 'JSON Formatter',
    desc: 'Validate & beautify tree',
    icon: 'Code',
    iconBg: Colors.surfaceDeveloper,
    iconColor: Colors.accentSky,
    status: 'Offline',
  },
  {
    id: 304,
    name: 'Loan & EMI Calc',
    desc: 'Monthly payments & interest',
    icon: 'Calculator',
    iconBg: Colors.surfaceCalculator,
    iconColor: Colors.accentAmber,
    status: 'Instant',
  },
  {
    id: 321,
    name: 'Unit Converter',
    desc: 'Length, weight & currencies',
    icon: 'Calculator',
    iconBg: Colors.surfaceCalculator,
    iconColor: Colors.accentAmber,
    status: 'Instant',
  },
  {
    id: 351,
    name: 'QR Code Generator',
    desc: 'Links, Wi-Fi & text codes',
    icon: 'QrCode',
    iconBg: Colors.surfaceWeb,
    iconColor: Colors.accentTeal,
    status: 'Offline',
  },
  {
    id: 446,
    name: 'Pomodoro Timer',
    desc: 'Work intervals & short breaks',
    icon: 'Clock',
    iconBg: '#FCE7F3',
    iconColor: '#EC4899',
    status: 'Instant',
  },
];

interface HomeScreenProps {
  onNavigateToCatalog: (studioId?: string) => void;
  onNavigateToTool: (toolId: number) => void;
  onNavigateToTab: (tab: 'catalog' | 'history' | 'files') => void;
  onOpenSettings: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToCatalog,
  onNavigateToTool,
  onNavigateToTab,
  onOpenSettings,
}) => {
  const { width } = useWindowDimensions();
  const cardWidth = (width - Spacing.margin * 2 - Spacing.sm) / 2;
  const { recentItems, searchQuery, setSearchQuery } = useAppStore();

  return (
    <View style={styles.screen}>
      <AppHeader onSettingsPress={onOpenSettings} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <SearchBar
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (text.length > 0) {
                onNavigateToCatalog();
              }
            }}
            placeholder="Search 500+ tools..."
            onFilterPress={() => onNavigateToCatalog()}
          />
          <View style={styles.searchHintRow}>
            <AppIcon name="verified" size={13} color={Colors.textMuted} />
            <Text style={styles.searchHintText}>
              Search by tool name, format, or studio category
            </Text>
          </View>
        </View>

        {/* Featured Hero Banner */}
        <TouchableOpacity
          style={styles.heroBanner}
          activeOpacity={0.9}
          onPress={() => onNavigateToCatalog()}
        >
          <View style={styles.heroBadge}>
            <AppIcon name="verified" size={12} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>Workspace v2.4</Text>
          </View>
          <Text style={styles.heroTitle}>Your everyday toolkit</Text>
          <Text style={styles.heroSubtitle}>
            500 tools. One powerful, offline-first workspace.
          </Text>

          <View style={styles.heroCta}>
            <Text style={styles.heroCtaText}>Explore all tools</Text>
            <AppIcon name="chevron_right" size={16} color={Colors.primary} strokeWidth={2.5} />
          </View>
        </TouchableOpacity>

        {/* Quick Access Tiles */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick access</Text>
          <Text style={styles.sectionMeta}>Fast jumps</Text>
        </View>

        <View style={styles.quickAccessGrid}>
          <TouchableOpacity
            style={styles.quickAccessTile}
            activeOpacity={0.7}
            onPress={() => onNavigateToTab('history')}
          >
            <View style={[styles.tileIconBox, { backgroundColor: Colors.surfaceOffice }]}>
              <AppIcon name="schedule" size={22} color={Colors.primary} />
            </View>
            <Text style={styles.tileLabel}>Recent</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessTile}
            activeOpacity={0.7}
            onPress={() => onNavigateToTab('history')}
          >
            <View style={[styles.tileIconBox, { backgroundColor: Colors.surfaceCalculator }]}>
              <AppIcon name="star" size={22} color={Colors.accentAmber} />
            </View>
            <Text style={styles.tileLabel}>Favorites</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessTile}
            activeOpacity={0.7}
            onPress={() => onNavigateToTab('files')}
          >
            <View style={[styles.tileIconBox, { backgroundColor: Colors.surfaceScanner }]}>
              <AppIcon name="folder" size={22} color={Colors.tertiary} />
            </View>
            <Text style={styles.tileLabel}>My Files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessTile}
            activeOpacity={0.7}
            onPress={() => onNavigateToCatalog()}
          >
            <View style={[styles.tileIconBox, { backgroundColor: Colors.surfaceImage }]}>
              <AppIcon name="download" size={22} color={Colors.accentEmerald} />
            </View>
            <Text style={styles.tileLabel}>Catalog</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Where You Left Off */}
        {recentItems.length > 0 ? (
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerWithIcon}>
                <AppIcon name="schedule" size={18} color={Colors.primaryContainer} />
                <Text style={styles.sectionTitle}>Continue where you left off</Text>
              </View>
              <TouchableOpacity onPress={() => onNavigateToTab('history')}>
                <Text style={styles.viewAllText}>History</Text>
              </TouchableOpacity>
            </View>

            {recentItems.slice(0, 3).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentCard}
                activeOpacity={0.7}
                onPress={() => onNavigateToTool(item.toolId)}
              >
                <View style={styles.recentLeft}>
                  <View style={[styles.recentIconBox, { backgroundColor: Colors.surfacePdf }]}>
                    <AppIcon name="FileText" size={20} color={Colors.accentCoral} />
                  </View>
                  <View style={styles.recentDetails}>
                    <Text style={styles.recentTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.recentSubtitle}>{item.subtitle}</Text>
                  </View>
                </View>
                <AppIcon name="chevron_right" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Popular Tools Section */}
        <View style={styles.popularSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Popular tools</Text>
              <Text style={styles.sectionSubtitle}>Frequently used by your workflow</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigateToCatalog()}
              style={styles.seeAllBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <AppIcon name="chevron_right" size={16} color={Colors.primaryContainer} />
            </TouchableOpacity>
          </View>

          <View style={styles.twoColumnGrid}>
            {POPULAR_TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[styles.popularCard, { width: cardWidth }]}
                activeOpacity={0.7}
                onPress={() => onNavigateToTool(tool.id)}
              >
                <View style={styles.popularCardHeader}>
                  <View style={[styles.popularIconBox, { backgroundColor: tool.iconBg }]}>
                    <AppIcon name={tool.icon} size={18} color={tool.iconColor} />
                  </View>
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>{tool.status}</Text>
                  </View>
                </View>
                <Text style={styles.popularToolName} numberOfLines={1}>
                  {tool.name}
                </Text>
                <Text style={styles.popularToolDesc} numberOfLines={1}>
                  {tool.desc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 100% Local & Offline First Guarantee Card */}
        <View style={styles.offlineBanner}>
          <View style={styles.offlineIconBox}>
            <AppIcon name="cloud_off" size={18} color={Colors.statusSuccess} />
          </View>
          <View style={styles.offlineContent}>
            <Text style={styles.offlineTitle}>100% Local &amp; Offline First</Text>
            <Text style={styles.offlineDesc}>
              Core tools execute inside your local sandbox. Zero background tracking or cloud document logging.
            </Text>
          </View>
        </View>

        {/* Explore Studios (16 Studios) */}
        <View style={styles.studiosSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Explore studios</Text>
              <Text style={styles.sectionSubtitle}>16 comprehensive suites for every discipline</Text>
            </View>
            <TouchableOpacity
              onPress={() => onNavigateToCatalog()}
              style={styles.seeAllBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.seeAllText}>See all</Text>
              <AppIcon name="chevron_right" size={16} color={Colors.primaryContainer} />
            </TouchableOpacity>
          </View>

          <View style={styles.twoColumnGrid}>
            {STUDIOS.map((studio) => {
              const theme = StudioTheme[studio.id];
              return (
                <TouchableOpacity
                  key={studio.id}
                  style={[styles.studioCard, { width: cardWidth }]}
                  activeOpacity={0.7}
                  onPress={() => onNavigateToCatalog(studio.id)}
                >
                  <View style={[styles.studioIconBox, { backgroundColor: theme.surface }]}>
                    <AppIcon name={theme.icon} size={22} color={theme.accent} />
                  </View>
                  <Text style={styles.studioName} numberOfLines={1}>
                    {studio.name}
                  </Text>
                  <View style={styles.studioBottomRow}>
                    <Text style={styles.studioRange}>{studio.toolRange}</Text>
                    {studio.isComingSoon ? (
                      <View style={styles.comingSoonTag}>
                        <Text style={styles.comingSoonTagText}>Soon</Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Pro Workflow / Batch Processing Banner */}
        <View style={styles.proWorkflowCard}>
          <View style={styles.proWorkflowBadge}>
            <Text style={styles.proWorkflowBadgeText}>PRO WORKFLOW</Text>
          </View>
          <Text style={styles.proWorkflowTitle}>Batch processing ready</Text>
          <Text style={styles.proWorkflowDesc}>
            Process multiple files simultaneously with zero queue throttling, all locally on-device.
          </Text>
        </View>

        {/* AI Studio Roadmap (Coming Soon) */}
        <View style={styles.aiRoadmapCard}>
          <View style={styles.aiRoadmapHeader}>
            <View style={styles.aiRoadmapBadge}>
              <AppIcon name="Sparkles" size={13} color="#FFFFFF" />
              <Text style={styles.aiRoadmapBadgeText}>Coming Soon</Text>
            </View>
          </View>
          <Text style={styles.aiRoadmapTitle}>AI-powered tools are coming</Text>
          <Text style={styles.aiRoadmapDesc}>
            A smarter workspace is on the way. 16 smart utility assistants planned for upcoming release. Display only.
          </Text>
          <TouchableOpacity
            style={styles.aiRoadmapBtn}
            activeOpacity={0.8}
            onPress={() => onNavigateToCatalog('ai')}
          >
            <AppIcon name="verified_user" size={15} color={Colors.primary} />
            <Text style={styles.aiRoadmapBtnText}>Preview lineup (Coming Soon)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  searchSection: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
  },
  searchHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  searchHintText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  heroBanner: {
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.md,
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 4,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    marginBottom: Spacing.md,
  },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
  },
  heroCtaText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  sectionMeta: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryContainer,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.margin,
    gap: Spacing.sm,
  },
  quickAccessTile: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  tileIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  tileLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  recentSection: {
    marginTop: 4,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceWhite,
    marginHorizontal: Spacing.margin,
    marginBottom: Spacing.xs + 4,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  recentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  recentIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  recentDetails: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  recentSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  popularSection: {
    marginTop: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryContainer,
  },
  twoColumnGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.margin,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  popularCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    justifyContent: 'space-between',
  },
  popularCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  popularIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popularBadge: {
    backgroundColor: Colors.surfaceImage,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.statusSuccess,
  },
  popularToolName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  popularToolDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(231, 249, 241, 0.7)',
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  offlineIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.statusSuccess,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  offlineContent: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  offlineDesc: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    lineHeight: 16,
    marginTop: 2,
  },
  studiosSection: {
    marginTop: Spacing.md,
  },
  studioCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  studioIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  studioName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  studioBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  studioRange: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  comingSoonTag: {
    backgroundColor: Colors.surfaceAi,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  comingSoonTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentViolet,
  },
  proWorkflowCard: {
    backgroundColor: Colors.surfaceWhite,
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  proWorkflowBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceOffice,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  proWorkflowBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  proWorkflowTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  proWorkflowDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
    marginTop: 2,
  },
  aiRoadmapCard: {
    backgroundColor: '#FAF5FF',
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  aiRoadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  aiRoadmapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#7E22CE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  aiRoadmapBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  aiRoadmapTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3B0764',
  },
  aiRoadmapDesc: {
    fontSize: 12,
    color: '#6B21A8',
    lineHeight: 18,
    marginTop: 3,
    marginBottom: 12,
  },
  aiRoadmapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceWhite,
    paddingVertical: 9,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#E9D5FF',
  },
  aiRoadmapBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
});
