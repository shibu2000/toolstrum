/**
 * ScannerCaptureBox.tsx
 * Reusable document viewfinder and camera capture interface for Document Scanner Studio.
 * Supports rapid single or multi-page capture, ID card front/back guidance,
 * and page reordering/deletion.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Radius, Spacing } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

export interface ScannedPageItem {
  id: string;
  uri: string;
  width?: number;
  height?: number;
  side?: 'front' | 'back' | 'page';
}

interface ScannerCaptureBoxProps {
  pages: ScannedPageItem[];
  onPagesChange: (pages: ScannedPageItem[]) => void;
  multiple?: boolean;
  isIdCard?: boolean;
  title?: string;
  subtitle?: string;
}

export const ScannerCaptureBox: React.FC<ScannerCaptureBoxProps> = ({
  pages,
  onPagesChange,
  multiple = true,
  isIdCard = false,
  title = 'Scan Document Pages',
  subtitle = 'Point camera directly above document for optimal edge detection',
}) => {
  const handleCaptureCamera = async (side: 'front' | 'back' | 'page' = 'page') => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Camera Permission Required', 'Camera access is needed to capture physical document scans.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.95,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const newPage: ScannedPageItem = {
          id: `page-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          uri: asset.uri,
          width: asset.width || 1200,
          height: asset.height || 1600,
          side,
        };

        if (isIdCard) {
          // Replace or set specific side
          const filtered = pages.filter((p) => p.side !== side);
          onPagesChange([...filtered, newPage]);
        } else if (multiple) {
          onPagesChange([...pages, newPage]);
        } else {
          onPagesChange([newPage]);
        }
      }
    } catch (err: any) {
      Alert.alert('Camera Error', err?.message || 'Could not launch camera.');
    }
  };

  const handlePickGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: multiple && !isIdCard,
        quality: 0.95,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newPages: ScannedPageItem[] = result.assets.map((asset, index) => ({
          id: `page-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          uri: asset.uri,
          width: asset.width || 1200,
          height: asset.height || 1600,
          side: 'page',
        }));

        if (multiple && !isIdCard) {
          onPagesChange([...pages, ...newPages]);
        } else {
          onPagesChange([newPages[0]]);
        }
      }
    } catch (err: any) {
      Alert.alert('Picker Error', err?.message || 'Could not open photo library.');
    }
  };

  const handleRemovePage = (id: string) => {
    onPagesChange(pages.filter((p) => p.id !== id));
  };

  const handleClearAll = () => {
    onPagesChange([]);
  };

  const frontCard = pages.find((p) => p.side === 'front');
  const backCard = pages.find((p) => p.side === 'back');

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        {pages.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.clearText}>Clear ({pages.length})</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ID Card Dual-Side UI */}
      {isIdCard ? (
        <View style={styles.idCardGrid}>
          {/* Front Card Capture */}
          <TouchableOpacity
            style={[styles.idCardBox, frontCard && styles.idCardBoxFilled]}
            onPress={() => handleCaptureCamera('front')}
            activeOpacity={0.7}
          >
            {frontCard ? (
              <Image source={{ uri: frontCard.uri }} style={styles.idCardPreview} resizeMode="cover" />
            ) : (
              <View style={styles.idCardPlaceholder}>
                <AppIcon name="CreditCard" size={24} color={Colors.accentCyan} />
                <Text style={styles.idCardLabel}>Scan Front Side</Text>
              </View>
            )}
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>FRONT</Text>
            </View>
          </TouchableOpacity>

          {/* Back Card Capture */}
          <TouchableOpacity
            style={[styles.idCardBox, backCard && styles.idCardBoxFilled]}
            onPress={() => handleCaptureCamera('back')}
            activeOpacity={0.7}
          >
            {backCard ? (
              <Image source={{ uri: backCard.uri }} style={styles.idCardPreview} resizeMode="cover" />
            ) : (
              <View style={styles.idCardPlaceholder}>
                <AppIcon name="CreditCard" size={24} color={Colors.accentCyan} />
                <Text style={styles.idCardLabel}>Scan Back Side</Text>
              </View>
            )}
            <View style={styles.idBadge}>
              <Text style={styles.idBadgeText}>BACK</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        /* Standard Document Capture Triggers */
        <View style={styles.triggerRow}>
          <TouchableOpacity
            style={[styles.cameraBtn, { flex: 2 }]}
            onPress={() => handleCaptureCamera('page')}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <AppIcon name="Camera" size={20} color={Colors.accentCyan} />
            </View>
            <View style={styles.cameraTextGroup}>
              <Text style={styles.cameraPrimaryText}>
                {pages.length === 0 ? 'Snap Document' : 'Add Another Page'}
              </Text>
              <Text style={styles.cameraSecondaryText}>High-resolution camera capture</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.galleryBtn, { flex: 1 }]}
            onPress={handlePickGallery}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <AppIcon name="Image" size={18} color={Colors.accentCyan} />
            </View>
            <Text style={styles.galleryText}>Import</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Pages Carousel */}
      {!isIdCard && pages.length > 0 && (
        <View style={styles.pagesList}>
          {pages.map((page, index) => (
            <View key={page.id} style={styles.pageCard}>
              <Image source={{ uri: page.uri }} style={styles.pageThumbnail} resizeMode="cover" />
              <View style={styles.pageMeta}>
                <Text style={styles.pageNum}>Page {index + 1}</Text>
                <Text style={styles.pageDim}>
                  {page.width && page.height ? `${page.width}×${page.height}` : '300 DPI'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemovePage(page.id)}
                style={styles.removeBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <AppIcon name="X" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextGroup: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.statusError,
  },
  triggerRow: {
    flexDirection: 'row',
    gap: Spacing.xs + 2,
  },
  cameraBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceScanner,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A5F3FC',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  galleryBtn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceScanner,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A5F3FC',
    padding: Spacing.sm,
    gap: 4,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTextGroup: {
    flex: 1,
  },
  cameraPrimaryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  cameraSecondaryText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  galleryText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  idCardGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  idCardBox: {
    flex: 1,
    height: 110,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#A5F3FC',
    backgroundColor: Colors.surfaceScanner,
    position: 'relative',
    overflow: 'hidden',
  },
  idCardBoxFilled: {
    borderStyle: 'solid',
    borderColor: Colors.accentCyan,
  },
  idCardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  idCardLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  idCardPreview: {
    width: '100%',
    height: '100%',
  },
  idBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(6, 182, 212, 0.85)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  idBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  pagesList: {
    gap: 6,
    marginTop: 4,
  },
  pageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  pageThumbnail: {
    width: 36,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: '#E2E8F0',
  },
  pageMeta: {
    flex: 1,
  },
  pageNum: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  pageDim: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 1,
  },
  removeBtn: {
    padding: 4,
  },
});
