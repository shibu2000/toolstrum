import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius, StudioTheme } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';
import { AppHeader } from '../../components/common/AppHeader';
import { useAppStore } from '../../store/useAppStore';
import { getToolById } from '../../data/registry';

interface HistoryScreenProps {
  onNavigateToTool: (toolId: number) => void;
  onNavigateToCatalog: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  onNavigateToTool,
  onNavigateToCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'recent' | 'favorites'>('recent');
  const { recentItems, clearRecentItems, favorites, toggleFavorite } = useAppStore();

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear your recent utility history?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: clearRecentItems },
      ]
    );
  };

  const favoriteTools = favorites
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  const handleToolPress = (toolId: number, name?: string) => {
    const tool = getToolById(toolId);
    if (tool?.status === 'coming_soon') {
      Alert.alert(
        '🛠️ Planned for Version 2.0',
        `"${name || tool.name}" requires native hardware codecs or deep language models.\n\nIt is queued for a future modular release to keep Toolstrum lightweight (<40 MB) and 100% offline.`,
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }
    onNavigateToTool(toolId);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Recent & Starred"
        subtitle="Quick access to your tools & jobs"
        rightAction={
          activeTab === 'recent' && recentItems.length > 0 ? (
            <TouchableOpacity onPress={handleClearHistory} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Clear</Text>
            </TouchableOpacity>
          ) : undefined
        }
      />

      {/* Segmented Control */}
      <View style={styles.segmentedWrapper}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, activeTab === 'recent' && styles.segmentActive]}
            onPress={() => setActiveTab('recent')}
          >
            <AppIcon
              name="schedule"
              size={16}
              color={activeTab === 'recent' ? Colors.primary : Colors.textMuted}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'recent' && styles.segmentTextActive,
              ]}
            >
              Recent ({recentItems.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segment, activeTab === 'favorites' && styles.segmentActive]}
            onPress={() => setActiveTab('favorites')}
          >
            <AppIcon
              name="star"
              size={16}
              color={activeTab === 'favorites' ? Colors.statusWarning : Colors.textMuted}
            />
            <Text
              style={[
                styles.segmentText,
                activeTab === 'favorites' && styles.segmentTextActive,
              ]}
            >
              Favorites ({favoriteTools.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'recent' ? (
        recentItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <AppIcon name="schedule" size={32} color={Colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No recent activity</Text>
            <Text style={styles.emptySubtitle}>
              When you use tools and process tasks, your recent operations will appear here.
            </Text>
            <TouchableOpacity style={styles.browseBtn} onPress={onNavigateToCatalog}>
              <Text style={styles.browseBtnText}>Explore All Tools</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={recentItems}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const tool = getToolById(item.toolId);
              const theme = tool ? StudioTheme[tool.studioId] : StudioTheme.pdf;

              return (
                <TouchableOpacity
                  style={styles.itemCard}
                  activeOpacity={0.7}
                  onPress={() => handleToolPress(item.toolId, item.title)}
                >
                  <View style={styles.itemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: theme.surface }]}>
                      <AppIcon name={theme.icon} size={20} color={theme.accent} />
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemTitle} numberOfLines={1}>
                        {item.title}
                      </Text>
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <AppIcon name="chevron_right" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              );
            }}
          />
        )
      ) : favoriteTools.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <AppIcon name="star" size={32} color={Colors.accentAmber} />
          </View>
          <Text style={styles.emptyTitle}>No favorite tools yet</Text>
          <Text style={styles.emptySubtitle}>
            Pin tools you use frequently for 1-tap access from anywhere in the app.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={onNavigateToCatalog}>
            <Text style={styles.browseBtnText}>Browse Catalog</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favoriteTools}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const theme = StudioTheme[item.studioId];

            return (
              <TouchableOpacity
                style={styles.itemCard}
                activeOpacity={0.7}
                onPress={() => handleToolPress(item.id, item.name)}
              >
                <View style={styles.itemLeft}>
                  <View style={[styles.iconBox, { backgroundColor: theme.surface }]}>
                    <AppIcon name={theme.icon} size={20} color={theme.accent} />
                  </View>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemTitle} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemSubtitle}>{theme.name} · ID #{item.id}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => toggleFavorite(item.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <AppIcon name="star" size={20} color={Colors.statusWarning} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
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
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.statusError,
  },
  segmentedWrapper: {
    paddingHorizontal: Spacing.margin,
    paddingVertical: Spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 3,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  segmentActive: {
    backgroundColor: Colors.surfaceWhite,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentTextActive: {
    color: Colors.onSurface,
  },
  listContent: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.xs,
    paddingBottom: 40,
  },
  itemCard: {
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
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  itemDetails: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  itemSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
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
    maxWidth: 280,
  },
  browseBtn: {
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginTop: Spacing.lg,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
