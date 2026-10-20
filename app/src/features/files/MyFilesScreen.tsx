import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as Sharing from 'expo-sharing';
import { Colors, Spacing, Radius } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';
import { AppHeader } from '../../components/common/AppHeader';
import { useAppStore } from '../../store/useAppStore';

interface MyFilesScreenProps {
  onNavigateToCatalog: () => void;
}

export const MyFilesScreen: React.FC<MyFilesScreenProps> = ({ onNavigateToCatalog }) => {
  const { managedFiles, removeManagedFile } = useAppStore();

  const handleShare = async (uri: string) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Sharing Unavailable', 'File sharing is not supported on this platform.');
        return;
      }
      await Sharing.shareAsync(uri);
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Could not share file.');
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      'Delete Output',
      `Delete "${name}" from your local files? Original source files remain untouched.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeManagedFile(id) },
      ]
    );
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const totalBytes = managedFiles.reduce((acc, f) => acc + f.size, 0);

  return (
    <View style={styles.screen}>
      <AppHeader
        title="My Files"
        subtitle="Generated outputs and app-managed files"
      />

      {/* Storage Summary Banner */}
      <View style={styles.storageCard}>
        <View style={styles.storageLeft}>
          <View style={styles.storageIconBox}>
            <AppIcon name="Folder" size={22} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.storageTitle}>Local Sandbox Storage</Text>
            <Text style={styles.storageMeta}>
              {managedFiles.length} file{managedFiles.length === 1 ? '' : 's'} · {formatSize(totalBytes)} used
            </Text>
          </View>
        </View>
      </View>

      {/* File List */}
      {managedFiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <AppIcon name="Folder" size={32} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>No outputs generated yet</Text>
          <Text style={styles.emptySubtitle}>
            When you run utilities like PDF Merge, Image Compressor, or Converters, your saved outputs will appear here.
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={onNavigateToCatalog}>
            <Text style={styles.browseBtnText}>Start with a Tool</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={managedFiles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.fileCard}>
              <View style={styles.fileLeft}>
                <View style={styles.fileIconBox}>
                  <AppIcon
                    name={item.name.endsWith('.pdf') ? 'FileText' : 'Image'}
                    size={20}
                    color={item.name.endsWith('.pdf') ? Colors.accentCoral : Colors.accentEmerald}
                  />
                </View>
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.fileMeta}>
                    {item.toolName} · {formatSize(item.size)}
                  </Text>
                </View>
              </View>

              <View style={styles.fileActions}>
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleShare(item.uri)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <AppIcon name="share" size={18} color={Colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => handleDelete(item.id, item.name)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <AppIcon name="delete" size={18} color={Colors.statusError} />
                </TouchableOpacity>
              </View>
            </View>
          )}
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
  storageCard: {
    marginHorizontal: Spacing.margin,
    marginTop: Spacing.md,
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  storageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageIconBox: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceOffice,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  storageTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  storageMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  listContent: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  fileCard: {
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
  fileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  fileMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  fileActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
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
