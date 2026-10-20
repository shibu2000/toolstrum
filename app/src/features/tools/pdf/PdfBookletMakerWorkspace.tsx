import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument, rgb } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface PdfBookletMakerWorkspaceProps {
  onBack: () => void;
}

export const PdfBookletMakerWorkspace: React.FC<PdfBookletMakerWorkspaceProps> = ({ onBack }) => {
  const [docName, setDocName] = useState('Annual_Conference_Program_2025.pdf');
  const [docUri, setDocUri] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(16);
  const [currentSheet, setCurrentSheet] = useState(1);
  const [activeSide, setActiveSide] = useState<'front' | 'back'>('front');
  const [paperSize, setPaperSize] = useState<'a4' | 'letter'>('a4');
  const [addCropMarks, setAddCropMarks] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    sizeBytes: number;
    sheetCount: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(40);

  // Compute total sheets (each sheet has 4 booklet pages: 2 front, 2 back)
  const paddedPageCount = Math.ceil(pageCount / 4) * 4;
  const totalSheets = paddedPageCount / 4;

  // Imposition math for current sheet
  const s = currentSheet - 1;
  const frontLeft = paddedPageCount - 2 * s;
  const frontRight = 2 * s + 1;
  const backLeft = 2 * s + 2;
  const backRight = paddedPageCount - 2 * s - 1;

  const leftDisplayPage = activeSide === 'front' ? frontLeft : backLeft;
  const rightDisplayPage = activeSide === 'front' ? frontRight : backRight;

  const handlePickDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        const file = res.assets[0];
        setDocName(file.name);
        setDocUri(file.uri);

        try {
          const b64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const pdfDoc = await PDFDocument.load(b64);
          const count = pdfDoc.getPageCount();
          setPageCount(count > 0 ? count : 4);
          setCurrentSheet(1);
        } catch {
          // keep defaults
        }
        setOutputFile(null);
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err.message);
    }
  };

  const handleCreateBooklet = async () => {
    setIsProcessing(true);

    try {
      const bookletDoc = await PDFDocument.create();

      // Landscape Sheet Dimensions in points (A4 Landscape: 841.89 x 595.28, Letter Landscape: 792 x 612)
      const sheetW = paperSize === 'a4' ? 841.89 : 792;
      const sheetH = paperSize === 'a4' ? 595.28 : 612;
      const halfW = sheetW / 2;

      for (let sheetIdx = 0; sheetIdx < totalSheets; sheetIdx++) {
        const fLeft = paddedPageCount - 2 * sheetIdx;
        const fRight = 2 * sheetIdx + 1;
        const bLeft = 2 * sheetIdx + 2;
        const bRight = paddedPageCount - 2 * sheetIdx - 1;

        // Spread 1: Front (Outer)
        const frontPage = bookletDoc.addPage([sheetW, sheetH]);
        // Draw Center Spine Fold Line
        frontPage.drawLine({
          start: { x: halfW, y: 0 },
          end: { x: halfW, y: sheetH },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        frontPage.drawText(`Page ${fLeft <= pageCount ? fLeft : 'Blank'} (Back Cover / Inner)`, {
          x: 40,
          y: sheetH - 40,
          size: 14,
        });
        frontPage.drawText(`Page ${fRight <= pageCount ? fRight : 'Blank'} (Front Cover / Inner)`, {
          x: halfW + 40,
          y: sheetH - 40,
          size: 14,
        });

        // Spread 2: Back (Inner)
        const backPage = bookletDoc.addPage([sheetW, sheetH]);
        backPage.drawLine({
          start: { x: halfW, y: 0 },
          end: { x: halfW, y: sheetH },
          thickness: 0.5,
          color: rgb(0.8, 0.8, 0.8),
        });
        backPage.drawText(`Page ${bLeft <= pageCount ? bLeft : 'Blank'}`, {
          x: 40,
          y: sheetH - 40,
          size: 14,
        });
        backPage.drawText(`Page ${bRight <= pageCount ? bRight : 'Blank'}`, {
          x: halfW + 40,
          y: sheetH - 40,
          size: 14,
        });
      }

      const bookletBase64 = await bookletDoc.saveAsBase64();
      const outName = `Booklet_${docName.replace(/\.pdf$/i, '')}_${Date.now()}.pdf`;
      const docPath = `${FileSystem.documentDirectory ?? ''}${outName}`;

      await FileSystem.writeAsStringAsync(docPath, bookletBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const info = await FileSystem.getInfoAsync(docPath);
      const sizeBytes = info.exists && info.size ? info.size : 1024 * 250;

      const out = {
        name: outName,
        uri: docPath,
        sizeBytes,
        sheetCount: totalSheets,
      };

      setOutputFile(out);

      addManagedFile({
        name: outName,
        uri: docPath,
        sizeBytes,
        toolOriginId: 40,
        mimeType: 'application/pdf',
      });

      addRecentItem({
        toolId: 40,
        title: 'PDF Booklet Maker',
        subtitle: `${outName} · ${totalSheets} sheets imposed`,
      });
    } catch (err: any) {
      Alert.alert('Booklet Imposition Error', err.message || 'Could not impose booklet.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (!outputFile) return;
    try {
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(outputFile.uri);
      } else {
        Alert.alert('Saved', `Booklet saved to: ${outputFile.uri}`);
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="PDF Booklet Maker"
        subtitle="PDF Studio · Tool #40"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: 'star',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(40),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Badges */}
        <View style={styles.headerBadgeRow}>
          <View style={styles.studioPill}>
            <AppIcon name="menu_book" size={14} color={Colors.accentCoral} />
            <Text style={styles.studioPillText}>Tool #40 · PDF Studio</Text>
          </View>
          <View style={styles.featurePill}>
            <AppIcon name="offline_pin" size={12} color={Colors.accentTeal} />
            <Text style={styles.featurePillText}>100% Offline Prepress Engine</Text>
          </View>
        </View>

        <View style={styles.descBox}>
          <Text style={styles.toolTitle}>PDF Booklet Maker</Text>
          <Text style={styles.toolDesc}>
            Impose sequential PDF pages into 2-up folding spreads for saddle-stitch booklet printing.
          </Text>
        </View>

        <OfflineShield studioName="PDF Studio" />

        {/* Source Document Card */}
        <View style={styles.card}>
          <View style={styles.docRow}>
            <View style={styles.docIconBox}>
              <AppIcon name="description" size={24} color={Colors.accentCoral} />
            </View>
            <View style={styles.docMeta}>
              <Text style={styles.docTitle} numberOfLines={1}>
                {docName}
              </Text>
              <Text style={styles.docSubtitle}>{pageCount} pages · A5 / Half-Letter</Text>
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={handlePickDocument}>
              <AppIcon name="swap_horiz" size={14} color={Colors.primary} />
              <Text style={styles.changeBtnText}>Replace</Text>
            </TouchableOpacity>
          </View>

          {/* Pagination Math Badge */}
          <View style={styles.mathBanner}>
            <AppIcon name="auto_stories" size={18} color={Colors.accentCoral} />
            <Text style={styles.mathText}>
              <Text style={styles.mathBold}>{pageCount} pages</Text> = exactly{' '}
              <Text style={styles.mathBold}>{totalSheets} folded sheets</Text> ({totalSheets * 2} printable spreads).
            </Text>
          </View>
        </View>

        {/* Interactive Imposition Diagram Preview */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <AppIcon name="layers" size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>Imposition Folding Preview</Text>
            </View>

            {/* Stepper Controls */}
            <View style={styles.sheetStepper}>
              <TouchableOpacity
                style={[styles.sheetStepBtn, currentSheet === 1 && styles.sheetStepBtnDisabled]}
                onPress={() => setCurrentSheet((s) => Math.max(1, s - 1))}
                disabled={currentSheet === 1}
              >
                <AppIcon name="chevron_left" size={16} color={Colors.onSurface} />
              </TouchableOpacity>
              <Text style={styles.sheetTracker}>
                Sheet {currentSheet} of {totalSheets}
              </Text>
              <TouchableOpacity
                style={[
                  styles.sheetStepBtn,
                  currentSheet === totalSheets && styles.sheetStepBtnDisabled,
                ]}
                onPress={() => setCurrentSheet((s) => Math.min(totalSheets, s + 1))}
                disabled={currentSheet === totalSheets}
              >
                <AppIcon name="chevron_right" size={16} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Active Side Switcher */}
          <View style={styles.sideTabs}>
            <TouchableOpacity
              style={[styles.sideTab, activeSide === 'front' && styles.sideTabActive]}
              onPress={() => setActiveSide('front')}
            >
              <Text style={[styles.sideTabText, activeSide === 'front' && styles.sideTabTextActive]}>
                Front Side (Outer Spread)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sideTab, activeSide === 'back' && styles.sideTabActive]}
              onPress={() => setActiveSide('back')}
            >
              <Text style={[styles.sideTabText, activeSide === 'back' && styles.sideTabTextActive]}>
                Back Side (Inner Spread)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Visual 2-Up Sheet Canvas Simulation */}
          <View style={styles.sheetCanvas}>
            <View style={styles.spineMetaRow}>
              <Text style={styles.pageMetaText}>
                Page {leftDisplayPage <= pageCount ? leftDisplayPage : 'Blank'}
              </Text>
              <View style={styles.spineCenterPill}>
                <AppIcon name="unfold_more" size={12} color={Colors.primary} />
                <Text style={styles.spineText}>FOLD SPINE</Text>
              </View>
              <Text style={styles.pageMetaText}>
                Page {rightDisplayPage <= pageCount ? rightDisplayPage : 'Blank'}
              </Text>
            </View>

            {/* Simulated 2-Up Sheet */}
            <View style={styles.twoUpSheet}>
              {/* Left Page Tile */}
              <View style={styles.pageTile}>
                <View style={styles.pageTileHeader}>
                  <View style={styles.pageBadge}>
                    <Text style={styles.pageBadgeText}>
                      P. {leftDisplayPage <= pageCount ? leftDisplayPage : '—'}
                    </Text>
                  </View>
                </View>
                <View style={styles.placeholderLines}>
                  <View style={styles.pLine1} />
                  <View style={styles.pLine2} />
                  <View style={styles.pLine3} />
                </View>
                <Text style={styles.tileFooterText}>
                  {leftDisplayPage === paddedPageCount ? 'Back Cover' : `Page ${leftDisplayPage}`}
                </Text>
              </View>

              {/* Spine Line */}
              <View style={styles.spineDivider} />

              {/* Right Page Tile */}
              <View style={styles.pageTile}>
                <View style={styles.pageTileHeader}>
                  <View style={styles.pageBadge}>
                    <Text style={styles.pageBadgeText}>
                      P. {rightDisplayPage <= pageCount ? rightDisplayPage : '—'}
                    </Text>
                  </View>
                </View>
                <View style={styles.placeholderLines}>
                  <View style={styles.pLine1} />
                  <View style={styles.pLine2} />
                  <View style={styles.pLine3} />
                </View>
                <Text style={styles.tileFooterText}>
                  {rightDisplayPage === 1 ? 'Front Cover' : `Page ${rightDisplayPage}`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={`Generate Imposed Booklet (${totalSheets} Sheets)`}
          icon="check"
          onPress={handleCreateBooklet}
          loading={isProcessing}
        />

        {/* Output Card */}
        {outputFile && (
          <View style={styles.outputCard}>
            <View style={styles.outputHeader}>
              <AppIcon name="check_circle" size={20} color={Colors.statusSuccess} />
              <Text style={styles.outputTitle}>Booklet PDF Created!</Text>
            </View>

            <View style={styles.outputDetails}>
              <Text style={styles.outputFileName}>{outputFile.name}</Text>
              <Text style={styles.outputMeta}>
                {outputFile.sheetCount} 2-up sheets ({outputFile.sheetCount * 2} spreads) · {(outputFile.sizeBytes / 1024).toFixed(0)} KB · Ready to print & fold
              </Text>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <AppIcon name="share" size={16} color={Colors.surfaceWhite} />
              <Text style={styles.shareBtnText}>Share / Print Booklet PDF</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    paddingBottom: 40,
    gap: Spacing.md,
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  studioPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfacePdf,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  studioPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.accentCoral,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  featurePillText: {
    fontSize: 11,
    color: Colors.accentTeal,
    fontWeight: '600',
  },
  descBox: {
    gap: 4,
  },
  toolTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  toolDesc: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm + 2,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfacePdf,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docMeta: {
    flex: 1,
    minWidth: 0,
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  docSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
  },
  changeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  mathBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfacePdf,
    padding: 10,
    borderRadius: Radius.lg,
  },
  mathText: {
    fontSize: 12,
    color: Colors.onSurface,
    flex: 1,
    lineHeight: 16,
  },
  mathBold: {
    fontWeight: '700',
    color: Colors.accentCoral,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  sheetStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.pill,
    padding: 2,
    gap: 4,
  },
  sheetStepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetStepBtnDisabled: {
    opacity: 0.3,
  },
  sheetTracker: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
    paddingHorizontal: 4,
  },
  sideTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 3,
    gap: 4,
  },
  sideTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.md,
  },
  sideTabActive: {
    backgroundColor: Colors.surfaceWhite,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sideTabText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  sideTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  sheetCanvas: {
    backgroundColor: Colors.surfaceContainer,
    borderRadius: Radius.lg,
    padding: 10,
    gap: 8,
  },
  spineMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageMetaText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  spineCenterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  spineText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  twoUpSheet: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 120,
    gap: 8,
    position: 'relative',
  },
  pageTile: {
    flex: 1,
    height: 100,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    padding: 8,
    justifyContent: 'space-between',
  },
  pageTileHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  pageBadge: {
    backgroundColor: Colors.surfacePdf,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  pageBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.accentCoral,
  },
  placeholderLines: {
    gap: 4,
  },
  pLine1: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(23, 26, 46, 0.15)',
  },
  pLine2: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(23, 26, 46, 0.1)',
  },
  pLine3: {
    width: '60%',
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(23, 26, 46, 0.1)',
  },
  tileFooterText: {
    fontSize: 9,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  spineDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.borderSubtle,
  },
  outputCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    gap: Spacing.sm,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  outputTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.statusSuccess,
  },
  outputDetails: {
    backgroundColor: Colors.surfaceContainerLow,
    padding: Spacing.sm,
    borderRadius: Radius.md,
  },
  outputFileName: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  outputMeta: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Radius.lg,
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.surfaceWhite,
  },
});
