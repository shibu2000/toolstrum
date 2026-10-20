import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, StudioTheme } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';
import { SearchBar } from '../../components/common/SearchBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { AppHeader } from '../../components/common/AppHeader';
import { STUDIOS, CANONICAL_TOOLS } from '../../data/registry';
import { ToolDefinition } from '../../data/types';
import { useAppStore } from '../../store/useAppStore';

interface CatalogScreenProps {
  initialStudioId?: string;
  onNavigateToTool: (toolId: number) => void;
  onBack?: () => void;
  onOpenSettings?: () => void;
}

export const CatalogScreen: React.FC<CatalogScreenProps> = ({
  initialStudioId = 'all',
  onNavigateToTool,
  onBack,
  onOpenSettings,
}) => {
  const {
    favorites,
    toggleFavorite,
    isFavorite,
    searchQuery,
    setSearchQuery,
    selectedStudioFilter,
    setSelectedStudioFilter,
  } = useAppStore();

  const [isGridView, setIsGridView] = useState(true);
  const [offlineOnly, setOfflineOnly] = useState(false);
  const [availableOnly, setAvailableOnly] = useState(false);

  // Active studio filter
  const currentStudio = selectedStudioFilter || initialStudioId;

  // Filter tools
  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CANONICAL_TOOLS.filter((tool) => {
      // Studio filter
      if (currentStudio !== 'all' && tool.studioId !== currentStudio) {
        return false;
      }
      // Offline filter
      if (offlineOnly && !tool.offlineCapable) {
        return false;
      }
      // Available only filter
      if (availableOnly && tool.status === 'coming_soon') {
        return false;
      }
      // Search query
      if (q) {
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesId = tool.id.toString() === q;
        const matchesKeywords = tool.keywords.some((k) => k.includes(q));
        if (!matchesName && !matchesId && !matchesKeywords) return false;
      }
      return true;
    });
  }, [searchQuery, currentStudio, offlineOnly, availableOnly]);

  const handleToolPress = (tool: ToolDefinition) => {
    if (tool.status === 'coming_soon') {
      Alert.alert(
        '🛠️ Planned for Version 2.0',
        `"${tool.name}" requires native hardware codecs or deep language models.\n\nIt is queued for a future modular release to keep Toolstrum lightweight (<40 MB) and 100% offline.`,
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }
    onNavigateToTool(tool.id);
  };

  const renderToolGridItem = ({ item }: { item: ToolDefinition }) => {
    const theme = StudioTheme[item.studioId];
    const favorited = isFavorite(item.id);
    const isComingSoon = item.status === 'coming_soon';

    return (
      <TouchableOpacity
        style={[styles.gridCard, isComingSoon && styles.comingSoonCard]}
        activeOpacity={isComingSoon ? 0.9 : 0.7}
        onPress={() => handleToolPress(item)}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.cardIconBox, { backgroundColor: isComingSoon ? '#F1F5F9' : theme.surface }]}>
            <AppIcon name={theme.icon} size={20} color={isComingSoon ? '#94A3B8' : theme.accent} />
          </View>
          <TouchableOpacity
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon
              name="star"
              size={18}
              color={favorited ? Colors.statusWarning : Colors.outlineVariant}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.cardMetaRow}>
          <Text style={styles.idBadge}>ID #{item.id}</Text>
          <StatusBadge status={item.status} offlineCapable={item.offlineCapable} />
        </View>

        <Text style={[styles.gridToolName, isComingSoon && styles.comingSoonText]} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.gridStudioName} numberOfLines={1}>
          {theme.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderToolListItem = ({ item }: { item: ToolDefinition }) => {
    const theme = StudioTheme[item.studioId];
    const favorited = isFavorite(item.id);
    const isComingSoon = item.status === 'coming_soon';

    return (
      <TouchableOpacity
        style={[styles.listCard, isComingSoon && styles.comingSoonCard]}
        activeOpacity={isComingSoon ? 0.9 : 0.7}
        onPress={() => handleToolPress(item)}
      >
        <View style={styles.listLeft}>
          <View style={[styles.cardIconBox, { backgroundColor: isComingSoon ? '#F1F5F9' : theme.surface }]}>
            <AppIcon name={theme.icon} size={20} color={isComingSoon ? '#94A3B8' : theme.accent} />
          </View>
          <View style={styles.listTextContainer}>
            <View style={styles.listNameRow}>
              <Text style={[styles.listToolName, isComingSoon && styles.comingSoonText]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.listIdBadge}>#{item.id}</Text>
            </View>
            <Text style={styles.listStudioName}>{theme.name}</Text>
          </View>
        </View>

        <View style={styles.listRight}>
          <StatusBadge status={item.status} offlineCapable={item.offlineCapable} />
          <TouchableOpacity
            style={styles.listFavBtn}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <AppIcon
              name="star"
              size={18}
              color={favorited ? Colors.statusWarning : Colors.outlineVariant}
            />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        showBack={Boolean(onBack)}
        onBackPress={onBack}
        onSettingsPress={onOpenSettings}
      />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerInfo}>
          <Text style={styles.screenTitle}>All Tools</Text>
          <Text style={styles.screenSubtitle}>
            500 tools, ready for whatever you need.
          </Text>
        </View>
        <View style={styles.countBadge}>
          <AppIcon name="tune" size={13} color={Colors.onPrimaryFixed} />
          <Text style={styles.countBadgeText}>{filteredTools.length} tools</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tools by name, ID, or task..."
        />
      </View>

      {/* Studio Pills */}
      <View style={styles.pillsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsContent}
        >
          <TouchableOpacity
            style={[
              styles.pillBtn,
              currentStudio === 'all' && styles.pillBtnActive,
            ]}
            onPress={() => setSelectedStudioFilter('all')}
          >
            <Text
              style={[
                styles.pillText,
                currentStudio === 'all' && styles.pillTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {STUDIOS.map((studio) => {
            const isActive = currentStudio === studio.id;
            return (
              <TouchableOpacity
                key={studio.id}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                onPress={() => setSelectedStudioFilter(studio.id)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {studio.name.replace(' Studio', '')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Secondary Meta Controls */}
      <View style={styles.metaRow}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.offlineToggle, availableOnly && styles.offlineToggleActive]}
            onPress={() => setAvailableOnly(!availableOnly)}
          >
            <AppIcon
              name="CheckCircle"
              size={14}
              color={availableOnly ? Colors.statusSuccess : Colors.textMuted}
            />
            <Text style={[styles.offlineToggleText, availableOnly && styles.offlineToggleTextActive]}>
              {availableOnly ? 'Available (401)' : 'All Tools (500)'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.viewToggleGroup}>
          <TouchableOpacity
            style={[styles.viewToggleBtn, isGridView && styles.viewToggleBtnActive]}
            onPress={() => setIsGridView(true)}
          >
            <AppIcon
              name="grid_view"
              size={16}
              color={isGridView ? '#FFFFFF' : Colors.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggleBtn, !isGridView && styles.viewToggleBtnActive]}
            onPress={() => setIsGridView(false)}
          >
            <AppIcon
              name="view_list"
              size={16}
              color={!isGridView ? '#FFFFFF' : Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tool List / Grid */}
      {filteredTools.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <AppIcon name="search" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No tools discovered</Text>
          <Text style={styles.emptySubtitle}>
            We couldn't find any tool matching your filters or search keywords.
          </Text>
          <TouchableOpacity
            style={styles.clearFiltersBtn}
            onPress={() => {
              setSearchQuery('');
              setSelectedStudioFilter('all');
              setOfflineOnly(false);
              setAvailableOnly(false);
            }}
          >
            <Text style={styles.clearFiltersText}>Clear All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          key={isGridView ? 'grid-2' : 'list-1'}
          data={filteredTools}
          keyExtractor={(item) => item.id.toString()}
          numColumns={isGridView ? 2 : 1}
          renderItem={isGridView ? renderToolGridItem : renderToolListItem}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={isGridView ? styles.gridRow : undefined}
          showsVerticalScrollIndicator={false}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  headerInfo: {
    flex: 1,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: Colors.primaryFixed,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.pill,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onPrimaryFixed,
  },
  searchContainer: {
    paddingHorizontal: Spacing.margin,
    marginTop: Spacing.sm,
  },
  pillsWrapper: {
    marginTop: Spacing.sm,
  },
  pillsContent: {
    paddingHorizontal: Spacing.margin,
    gap: Spacing.xs + 2,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  pillBtnActive: {
    backgroundColor: Colors.primaryContainer,
    borderColor: Colors.primaryContainer,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  offlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.surfaceWhite,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm + 2,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  offlineToggleActive: {
    borderColor: Colors.statusSuccess,
    backgroundColor: '#F0FDF4',
  },
  offlineToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  offlineToggleTextActive: {
    color: Colors.statusSuccess,
  },
  viewToggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.sm + 2,
    padding: 2,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  viewToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  viewToggleBtnActive: {
    backgroundColor: Colors.primaryContainer,
  },
  listContent: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.xs,
    paddingBottom: 40,
  },
  gridRow: {
    gap: Spacing.sm,
  },
  gridCard: {
    flex: 1,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  idBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textMuted,
  },
  gridToolName: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    lineHeight: 18,
    minHeight: 36,
  },
  gridStudioName: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surfaceWhite,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  listLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  listTextContainer: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  listNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listToolName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
  },
  listIdBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  listStudioName: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  listRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  listFavBtn: {
    padding: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
  },
  emptyIconBox: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  clearFiltersBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
  },
  clearFiltersText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  comingSoonCard: {
    opacity: 0.55,
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  comingSoonText: {
    color: '#64748B',
  },
});
