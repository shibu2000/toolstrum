import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface SelectedImage {
  id: string;
  uri: string;
  name: string;
  width?: number;
  height?: number;
}

interface ImagesToPdfWorkspaceProps {
  onBack: () => void;
}

export const ImagesToPdfWorkspace: React.FC<ImagesToPdfWorkspaceProps> = ({ onBack }) => {
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter' | 'Original'>('A4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape' | 'auto'>('portrait');
  const [margin, setMargin] = useState<number>(16);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdf, setOutputPdf] = useState<{ name: string; uri: string; size: number } | null>(
    null
  );

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(1);

  const handlePickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages: SelectedImage[] = result.assets.map((asset, index) => ({
          id: `img-${Date.now()}-${index}`,
          uri: asset.uri,
          name: asset.fileName || `Photo_${index + 1}.jpg`,
          width: asset.width,
          height: asset.height,
        }));
        setImages((prev) => [...prev, ...newImages]);
      }
    } catch (err: any) {
      Alert.alert('Image Picker Error', err?.message || 'Could not select images.');
    }
  };

  const handleRemove = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleGeneratePdf = async () => {
    if (images.length === 0) {
      Alert.alert('No Images', 'Please select at least 1 image to convert to PDF.');
      return;
    }

    setIsProcessing(true);
    setOutputPdf(null);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const img of images) {
        // Read image file as base64
        const base64 = await FileSystem.readAsStringAsync(img.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Determine if PNG or JPG
        const isPng = img.name.toLowerCase().endsWith('.png') || img.uri.toLowerCase().endsWith('.png');
        let embeddedImage;
        try {
          embeddedImage = isPng
            ? await pdfDoc.embedPng(base64)
            : await pdfDoc.embedJpg(base64);
        } catch {
          // Fallback trial
          try {
            embeddedImage = await pdfDoc.embedJpg(base64);
          } catch {
            embeddedImage = await pdfDoc.embedPng(base64);
          }
        }

        // Calculate page dimension
        let pageW = 595.28; // A4 portrait
        let pageH = 841.89;

        if (pageSize === 'Letter') {
          pageW = 612;
          pageH = 792;
        } else if (pageSize === 'Original' && img.width && img.height) {
          pageW = img.width;
          pageH = img.height;
        }

        if (orientation === 'landscape' || (orientation === 'auto' && (img.width || 0) > (img.height || 0))) {
          if (pageW < pageH) {
            const temp = pageW;
            pageW = pageH;
            pageH = temp;
          }
        }

        const page = pdfDoc.addPage([pageW, pageH]);
        const availW = pageW - margin * 2;
        const availH = pageH - margin * 2;

        const imgDims = embeddedImage.scaleToFit(availW, availH);
        const xPos = margin + (availW - imgDims.width) / 2;
        const yPos = margin + (availH - imgDims.height) / 2;

        page.drawImage(embeddedImage, {
          x: xPos,
          y: yPos,
          width: imgDims.width,
          height: imgDims.height,
        });
      }

      const pdfBase64 = await pdfDoc.saveAsBase64();
      const filename = `Document_${Date.now()}.pdf`;
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${docDir}${filename}`;

      await FileSystem.writeAsStringAsync(targetUri, pdfBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const fileInfo = await FileSystem.getInfoAsync(targetUri);
      if (!fileInfo.exists) {
        throw new Error('PDF output could not be verified on storage.');
      }

      const generatedSize = fileInfo.size || 0;

      addManagedFile({
        id: `file-${Date.now()}`,
        name: filename,
        uri: targetUri,
        size: generatedSize,
        toolId: 1,
        toolName: 'Images to PDF',
        createdAt: Date.now(),
      });

      addRecentItem({
        toolId: 1,
        title: filename,
        subtitle: `Images to PDF (${images.length} pages) · Just now`,
      });

      setOutputPdf({
        name: filename,
        uri: targetUri,
        size: generatedSize,
      });
    } catch (err: any) {
      Alert.alert(
        'PDF Generation Failed',
        err?.message || 'Could not process images. Original photos remain safe.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!outputPdf) return;
    try {
      await Sharing.shareAsync(outputPdf.uri);
    } catch (err: any) {
      Alert.alert('Share Error', err?.message || 'Could not share file.');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Images to PDF"
        subtitle="PDF Studio · Core v2.1"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(1)}
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

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Identity & Shield */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.identityIconBox}>
              <AppIcon name="Image" size={24} color={Colors.accentCoral} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>Convert Images to PDF</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #1</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                Combine photos and scans into a clean, standardized PDF document.
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* Source Images Section */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderTitleRow}>
              <AppIcon name="Image" size={18} color={Colors.accentCoral} />
              <Text style={styles.cardTitle}>Source Images</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{images.length} selected</Text>
            </View>
          </View>

          {/* Upload Dropzone */}
          <TouchableOpacity
            style={styles.dropzone}
            onPress={handlePickImages}
            activeOpacity={0.8}
          >
            <View style={styles.uploadBtn}>
              <AppIcon name="Upload" size={18} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.uploadBtnText}>Choose Images</Text>
            </View>
            <Text style={styles.dropzoneHint}>Supports JPG, PNG, WebP from photo gallery</Text>
          </TouchableOpacity>

          {/* Image Staging Grid */}
          {images.length > 0 ? (
            <View style={styles.grid}>
              {images.map((img, index) => (
                <View key={img.id} style={styles.thumbnailWrapper}>
                  <Image source={{ uri: img.uri }} style={styles.thumbnail} />
                  <View style={styles.pageNumberBadge}>
                    <Text style={styles.pageNumberText}>{index + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBadge}
                    onPress={() => handleRemove(img.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <AppIcon name="close" size={14} color={Colors.statusError} strokeWidth={2.5} />
                  </TouchableOpacity>
                  <Text style={styles.thumbnailName} numberOfLines={1}>
                    {img.name}
                  </Text>
                </View>
              ))}
            </View>
          ) : null}
        </View>

        {/* Page Configuration */}
        <View style={styles.card}>
          <View style={styles.cardHeaderTitleRow}>
            <AppIcon name="tune" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Page Configuration</Text>
          </View>

          {/* Page Size */}
          <Text style={styles.configLabel}>Page Size</Text>
          <View style={styles.segmentRow}>
            {(['A4', 'Letter', 'Original'] as const).map((sz) => (
              <TouchableOpacity
                key={sz}
                style={[styles.segmentBtn, pageSize === sz && styles.segmentBtnActive]}
                onPress={() => setPageSize(sz)}
              >
                <Text style={[styles.segmentBtnText, pageSize === sz && styles.segmentBtnTextActive]}>
                  {sz}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Orientation */}
          <Text style={styles.configLabel}>Orientation</Text>
          <View style={styles.segmentRow}>
            {(['portrait', 'landscape', 'auto'] as const).map((ori) => (
              <TouchableOpacity
                key={ori}
                style={[styles.segmentBtn, orientation === ori && styles.segmentBtnActive]}
                onPress={() => setOrientation(ori)}
              >
                <Text style={[styles.segmentBtnText, orientation === ori && styles.segmentBtnTextActive]}>
                  {ori.charAt(0).toUpperCase() + ori.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Margins */}
          <Text style={styles.configLabel}>Document Margins</Text>
          <View style={styles.segmentRow}>
            {[
              { label: 'None', val: 0 },
              { label: '8 pt', val: 8 },
              { label: '16 pt', val: 16 },
              { label: '24 pt', val: 24 },
            ].map((m) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.segmentBtn, margin === m.val && styles.segmentBtnActive]}
                onPress={() => setMargin(m.val)}
              >
                <Text style={[styles.segmentBtnText, margin === m.val && styles.segmentBtnTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Output Result Card */}
        {outputPdf ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultIconBox}>
                <AppIcon name="CheckCircle2" size={22} color={Colors.statusSuccess} />
              </View>
              <View style={styles.resultDetails}>
                <Text style={styles.resultTitle}>PDF Document Generated</Text>
                <Text style={styles.resultMeta}>
                  {outputPdf.name} · {formatSize(outputPdf.size)}
                </Text>
              </View>
            </View>

            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <AppIcon name="share" size={16} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.shareBtnText}>Share / Save</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.convertAnotherBtn}
                onPress={() => {
                  setImages([]);
                  setOutputPdf(null);
                }}
              >
                <Text style={styles.convertAnotherText}>Create Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Primary Action Button */}
        <PrimaryButton
          title={
            images.length === 0
              ? 'Choose Images to Convert'
              : `Generate PDF (${images.length} Page${images.length === 1 ? '' : 's'})`
          }
          onPress={handleGeneratePdf}
          disabled={images.length === 0}
          loading={isProcessing}
          variant="pdf"
          icon="FilePlus"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  favBtn: {
    padding: 6,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  identityCard: {
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
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  identityIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfacePdf,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  identityDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  idBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.onSurfaceVariant,
  },
  toolSubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  shieldRow: {
    marginTop: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  cardHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  countBadge: {
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  dropzone: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.sm,
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryContainer,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginBottom: 6,
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  dropzoneHint: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  thumbnailWrapper: {
    width: '48%',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: 6,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: 110,
    borderRadius: Radius.sm,
    backgroundColor: Colors.borderSubtle,
  },
  pageNumberBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(23,26,46,0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  pageNumberText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnailName: {
    fontSize: 11,
    color: Colors.onSurface,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  configLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurfaceVariant,
    marginTop: Spacing.sm,
    marginBottom: 4,
  },
  segmentRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: 3,
    gap: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: Radius.sm,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  segmentBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  resultIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  resultDetails: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },
  resultMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  resultActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.statusSuccess,
    height: 42,
    borderRadius: Radius.md,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  convertAnotherBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceWhite,
    height: 42,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  convertAnotherText: {
    color: Colors.onSurface,
    fontSize: 13,
    fontWeight: '600',
  },
});
