import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, StudioTheme, StudioId } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';
import { AppHeader } from '../../components/common/AppHeader';
import { SearchBar } from '../../components/common/SearchBar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { STUDIOS, getToolsByStudio } from '../../data/registry';
import { ToolDefinition } from '../../data/types';
import { useAppStore } from '../../store/useAppStore';

interface StudioDetailScreenProps {
  studioId: StudioId;
  onNavigateToTool: (toolId: number) => void;
  onBack: () => void;
}

export const StudioDetailScreen: React.FC<StudioDetailScreenProps> = ({
  studioId,
  onNavigateToTool,
  onBack,
}) => {
  const [query, setQuery] = useState('');
  const { isFavorite, toggleFavorite } = useAppStore();

  const studio = STUDIOS.find((s) => s.id === studioId) || STUDIOS[0];
  const theme = StudioTheme[studio.id];
  const allTools = getToolsByStudio(studio.id);

  const tools = allTools.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return t.name.toLowerCase().includes(q) || t.id.toString() === q;
  });

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

  return (
    <View style={styles.screen}>
      <AppHeader
        title={studio.name}
        subtitle={`${allTools.length} utilities available`}
        showBack
        onBackPress={onBack}
      />

      {/* Studio Banner */}
      <View style={[styles.banner, { backgroundColor: theme.surface }]}>
        <View style={[styles.bannerIconBox, { backgroundColor: '#FFFFFF' }]}>
          <AppIcon name={theme.icon} size={28} color={theme.accent} />
        </View>
        <View style={styles.bannerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.bannerTitle}>{studio.name}</Text>
            <View style={[styles.rangeBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.rangeBadgeText}>{studio.toolRange}</Text>
            </View>
          </View>
          <Text style={styles.bannerDesc}>
            {studio.isComingSoon
              ? 'Preview of upcoming intelligence modules for future updates.'
              : `${allTools.length} dedicated tools engineered for on-device processing.`}
          </Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={`Search in ${studio.name}...`}
        />
      </View>

      {/* Tools List */}
      <FlatList
        data={tools}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }: { item: ToolDefinition }) => {
          const favorited = isFavorite(item.id);
          const isComingSoon = item.status === 'coming_soon';

          return (
            <TouchableOpacity
              style={[styles.toolCard, isComingSoon && styles.comingSoonCard]}
              activeOpacity={isComingSoon ? 0.9 : 0.7}
              onPress={() => handleToolPress(item)}
            >
              <View style={styles.toolLeft}>
                <View style={[styles.toolIconBox, { backgroundColor: isComingSoon ? '#F1F5F9' : theme.surface }]}>
                  <AppIcon name={theme.icon} size={18} color={isComingSoon ? '#94A3B8' : theme.accent} />
                </View>
                <View style={styles.toolDetails}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.toolName, isComingSoon && styles.comingSoonText]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.idBadge}>ID #{item.id}</Text>
                  </View>
                  <Text style={[styles.toolDesc, isComingSoon && styles.comingSoonText]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </View>
              </View>

              <View style={styles.toolRight}>
                <StatusBadge status={item.status} offlineCapable={item.offlineCapable} />
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
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  banner: {
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  bannerIconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  bannerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  rangeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  rangeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  bannerDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  searchSection: {
    paddingHorizontal: Spacing.margin,
    marginTop: Spacing.sm,
  },
  listContent: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: 40,
  },
  toolCard: {
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
  toolLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  toolIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  toolDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    flex: 1,
  },
  idBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  toolDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  toolRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
