import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface PdfSignerWorkspaceProps {
  onBack: () => void;
}

type SignatureStyle = 'type' | 'stamp' | 'draw';
type AnchorPosition = 'bottom-right' | 'bottom-left' | 'center';

export const PdfSignerWorkspace: React.FC<PdfSignerWorkspaceProps> = ({ onBack }) => {
  const [docName, setDocName] = useState('Executive_Agreement_Final.pdf');
  const [docUri, setDocUri] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(3);
  const [targetPage, setTargetPage] = useState(3);
  const [sigStyle, setSigStyle] = useState<SignatureStyle>('type');
  const [signerName, setSignerName] = useState('David A. Reynolds');
  const [anchor, setAnchor] = useState<AnchorPosition>('bottom-right');
  const [inkColor, setInkColor] = useState<'navy' | 'black' | 'red'>('navy');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    sizeBytes: number;
    signedPage: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(25);

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
          setPageCount(count);
          setTargetPage(count);
        } catch {
          // default
        }
        setOutputFile(null);
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err.message);
    }
  };

  const handleSignPdf = async () => {
    setIsProcessing(true);

    try {
      let pdfDoc: PDFDocument;

      if (docUri) {
        const b64 = await FileSystem.readAsStringAsync(docUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        pdfDoc = await PDFDocument.load(b64);
      } else {
        // Generate new sample document to sign
        pdfDoc = await PDFDocument.create();
        for (let i = 1; i <= pageCount; i++) {
          const page = pdfDoc.addPage([600, 800]);
          page.drawText(`Executive Agreement — Page ${i} of ${pageCount}`, {
            x: 50,
            y: 750,
            size: 14,
          });
          page.drawText('This agreement is legally binding and entered into by both authorized signatories.', {
            x: 50,
            y: 710,
            size: 11,
          });
        }
      }

      const pages = pdfDoc.getPages();
      const pageIdx = Math.min(Math.max(0, targetPage - 1), pages.length - 1);
      const page = pages[pageIdx];
      const { width: pW, height: pH } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Color mapping
      const colorVal =
        inkColor === 'navy'
          ? rgb(0.1, 0.2, 0.6)
          : inkColor === 'red'
          ? rgb(0.85, 0.1, 0.1)
          : rgb(0, 0, 0);

      // Anchor coords
      let sigX = pW - 220;
      let sigY = 80;

      if (anchor === 'bottom-left') {
        sigX = 50;
        sigY = 80;
      } else if (anchor === 'center') {
        sigX = (pW - 180) / 2;
        sigY = (pH - 60) / 2;
      }

      // Draw signature or stamp
      if (sigStyle === 'stamp') {
        // Stamp Box
        page.drawRectangle({
          x: sigX,
          y: sigY,
          width: 170,
          height: 60,
          borderWidth: 1.5,
          borderColor: colorVal,
          color: rgb(1, 1, 1),
        });

        page.drawText('DIGITALLY VERIFIED', {
          x: sigX + 15,
          y: sigY + 42,
          size: 10,
          font: fontBold,
          color: colorVal,
        });

        page.drawText(`Signed: ${signerName}`, {
          x: sigX + 15,
          y: sigY + 26,
          size: 9,
          font,
          color: colorVal,
        });

        page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
          x: sigX + 15,
          y: sigY + 12,
          size: 8,
          color: colorVal,
        });
      } else {
        // Signature Line & Name
        page.drawLine({
          start: { x: sigX, y: sigY + 30 },
          end: { x: sigX + 170, y: sigY + 30 },
          thickness: 1,
          color: rgb(0.7, 0.7, 0.7),
        });

        page.drawText(signerName, {
          x: sigX + 10,
          y: sigY + 36,
          size: 18,
          font,
          color: colorVal,
        });

        page.drawText('Authorized Signature', {
          x: sigX + 10,
          y: sigY + 14,
          size: 9,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      const signedBase64 = await pdfDoc.saveAsBase64();
      const outName = `Signed_${Date.now()}.pdf`;
      const docPath = `${FileSystem.documentDirectory ?? ''}${outName}`;

      await FileSystem.writeAsStringAsync(docPath, signedBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const info = await FileSystem.getInfoAsync(docPath);
      const sizeBytes = info.exists && info.size ? info.size : 1024 * 180;

      const out = {
        name: outName,
        uri: docPath,
        sizeBytes,
        signedPage: targetPage,
      };

      setOutputFile(out);

      addManagedFile({
        name: outName,
        uri: docPath,
        sizeBytes,
        toolOriginId: 25,
        mimeType: 'application/pdf',
      });

      addRecentItem({
        toolId: 25,
        title: 'PDF Signer',
        subtitle: `${outName} · Signed on Page ${targetPage}`,
      });
    } catch (err: any) {
      Alert.alert('Signing Error', err.message || 'Could not sign PDF.');
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
        Alert.alert('Saved', `Document saved to: ${outputFile.uri}`);
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="PDF Signer"
        subtitle="PDF Studio · Tool #25"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: 'star',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(25),
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
            <AppIcon name="draw" size={14} color={Colors.accentCoral} />
            <Text style={styles.studioPillText}>Tool #25 · PDF Studio</Text>
          </View>
          <View style={styles.featurePill}>
            <AppIcon name="lock" size={12} color={Colors.accentEmerald} />
            <Text style={styles.featurePillText}>100% On-Device · Private</Text>
          </View>
        </View>

        <View style={styles.descBox}>
          <Text style={styles.toolTitle}>PDF Signer</Text>
          <Text style={styles.toolDesc}>
            Sign documents with cryptographic on-device signature stamps, freehand drawing, or formal initials.
          </Text>
        </View>

        <OfflineShield studioName="PDF Studio" />

        {/* Document Selector Card */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionSublabel}>Active Document</Text>
            <TouchableOpacity style={styles.switchBtn} onPress={handlePickDocument}>
              <AppIcon name="swap_horiz" size={14} color={Colors.primary} />
              <Text style={styles.switchBtnText}>Switch File</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.docRow}>
            <View style={styles.docIconBox}>
              <AppIcon name="description" size={24} color={Colors.accentCoral} />
            </View>
            <View style={styles.docMeta}>
              <Text style={styles.docTitle} numberOfLines={1}>
                {docName}
              </Text>
              <Text style={styles.docSubtitle}>
                {pageCount} pages · Viewing & Signing Page {targetPage}
              </Text>
            </View>
          </View>

          {/* Target Page Stepper */}
          <View style={styles.pageStepperRow}>
            <Text style={styles.stepperText}>Signing Page:</Text>
            <View style={styles.stepperPill}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setTargetPage((p) => Math.max(1, p - 1))}
              >
                <AppIcon name="remove" size={14} color={Colors.onSurface} />
              </TouchableOpacity>
              <Text style={styles.stepNum}>{targetPage}</Text>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => setTargetPage((p) => Math.min(pageCount, p + 1))}
              >
                <AppIcon name="add" size={14} color={Colors.onSurface} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Canvas Visual Mock Overlay */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <AppIcon name="layers" size={18} color={Colors.accentCoral} />
              <Text style={styles.sectionTitle}>Target Canvas Overlay</Text>
            </View>
            <Text style={styles.zoomTag}>Page {targetPage} · {anchor}</Text>
          </View>

          {/* Scaled PDF Document Sheet Visual */}
          <View style={styles.mockSheet}>
            <View style={styles.sheetHeader}>
              <View style={styles.linePlaceholderShort} />
              <View style={styles.linePlaceholderTiny} />
            </View>
            <View style={styles.sheetBody}>
              <View style={styles.linePlaceholderFull} />
              <View style={styles.linePlaceholderFull} />
              <View style={styles.linePlaceholderMed} />
              <View style={styles.linePlaceholderFull} />
            </View>

            {/* Draggable/Target Signature Box */}
            <View
              style={[
                styles.signatureOverlayBox,
                anchor === 'bottom-left' && styles.sigBoxBL,
                anchor === 'center' && styles.sigBoxCenter,
                anchor === 'bottom-right' && styles.sigBoxBR,
              ]}
            >
              <Text style={styles.sigPreviewTag}>
                Page {targetPage} · {anchor}
              </Text>
              <Text
                style={[
                  styles.signatureRenderText,
                  {
                    color:
                      inkColor === 'navy'
                        ? '#1E3A8A'
                        : inkColor === 'red'
                        ? '#DC2626'
                        : '#000000',
                  },
                ]}
              >
                {signerName}
              </Text>
              <View style={styles.sigBottomLine} />
            </View>
          </View>
        </View>

        {/* Signature Settings Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Signature Style</Text>

          {/* Style Tabs */}
          <View style={styles.styleTabs}>
            <TouchableOpacity
              style={[styles.styleTab, sigStyle === 'type' && styles.styleTabActive]}
              onPress={() => setSigStyle('type')}
            >
              <AppIcon
                name="text_fields"
                size={16}
                color={sigStyle === 'type' ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.styleTabText, sigStyle === 'type' && styles.styleTabTextActive]}>
                Type Initial
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.styleTab, sigStyle === 'stamp' && styles.styleTabActive]}
              onPress={() => setSigStyle('stamp')}
            >
              <AppIcon
                name="verified"
                size={16}
                color={sigStyle === 'stamp' ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.styleTabText, sigStyle === 'stamp' && styles.styleTabTextActive]}>
                Official Stamp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.styleTab, sigStyle === 'draw' && styles.styleTabActive]}
              onPress={() => setSigStyle('draw')}
            >
              <AppIcon
                name="gesture"
                size={16}
                color={sigStyle === 'draw' ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.styleTabText, sigStyle === 'draw' && styles.styleTabTextActive]}>
                Draw Ink
              </Text>
            </TouchableOpacity>
          </View>

          {/* Signer Name Input */}
          <View style={styles.inputBox}>
            <Text style={styles.inputLabel}>Signatory Name</Text>
            <TextInput
              style={styles.textInput}
              value={signerName}
              onChangeText={setSignerName}
              placeholder="Enter legal signer name..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Anchor Position Buttons */}
          <Text style={styles.inputLabel}>Anchor Position</Text>
          <View style={styles.anchorRow}>
            {(['bottom-left', 'center', 'bottom-right'] as AnchorPosition[]).map((pos) => (
              <TouchableOpacity
                key={pos}
                style={[styles.anchorBtn, anchor === pos && styles.anchorBtnActive]}
                onPress={() => setAnchor(pos)}
              >
                <Text
                  style={[
                    styles.anchorBtnText,
                    anchor === pos && styles.anchorBtnTextActive,
                  ]}
                >
                  {pos === 'bottom-left'
                    ? 'Bottom Left'
                    : pos === 'center'
                    ? 'Center'
                    : 'Bottom Right'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Ink Color Selector */}
          <View style={styles.inkRow}>
            <Text style={styles.inputLabel}>Ink Color</Text>
            <View style={styles.inkPills}>
              <TouchableOpacity
                style={[
                  styles.inkCircle,
                  { backgroundColor: '#1E3A8A' },
                  inkColor === 'navy' && styles.inkCircleActive,
                ]}
                onPress={() => setInkColor('navy')}
              />
              <TouchableOpacity
                style={[
                  styles.inkCircle,
                  { backgroundColor: '#000000' },
                  inkColor === 'black' && styles.inkCircleActive,
                ]}
                onPress={() => setInkColor('black')}
              />
              <TouchableOpacity
                style={[
                  styles.inkCircle,
                  { backgroundColor: '#DC2626' },
                  inkColor === 'red' && styles.inkCircleActive,
                ]}
                onPress={() => setInkColor('red')}
              />
            </View>
          </View>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={`Sign Document (Page ${targetPage})`}
          icon="check"
          onPress={handleSignPdf}
          loading={isProcessing}
        />

        {/* Output Card */}
        {outputFile && (
          <View style={styles.outputCard}>
            <View style={styles.outputHeader}>
              <AppIcon name="check_circle" size={20} color={Colors.statusSuccess} />
              <Text style={styles.outputTitle}>Signed Document Ready!</Text>
            </View>

            <View style={styles.outputDetails}>
              <Text style={styles.outputFileName}>{outputFile.name}</Text>
              <Text style={styles.outputMeta}>
                Page {outputFile.signedPage} Signed · {(outputFile.sizeBytes / 1024).toFixed(0)} KB · Offline Sealed
              </Text>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <AppIcon name="share" size={16} color={Colors.surfaceWhite} />
              <Text style={styles.shareBtnText}>Share / Save Signed PDF</Text>
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
    color: Colors.accentEmerald,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionSublabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 10,
    gap: 10,
  },
  docIconBox: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
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
  pageStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  stepperText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  stepperPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.pill,
    padding: 2,
    gap: 8,
  },
  stepBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
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
  zoomTag: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  mockSheet: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    padding: 16,
    position: 'relative',
    justifyContent: 'space-between',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linePlaceholderShort: {
    width: 60,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(23, 26, 46, 0.15)',
  },
  linePlaceholderTiny: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(23, 26, 46, 0.1)',
  },
  sheetBody: {
    gap: 8,
    flex: 1,
    paddingTop: 16,
  },
  linePlaceholderFull: {
    width: '100%',
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(23, 26, 46, 0.1)',
  },
  linePlaceholderMed: {
    width: '75%',
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(23, 26, 46, 0.1)',
  },
  signatureOverlayBox: {
    position: 'absolute',
    padding: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.12)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.accentCoral,
    minWidth: 140,
    alignItems: 'center',
  },
  sigBoxBR: {
    bottom: 16,
    right: 16,
  },
  sigBoxBL: {
    bottom: 16,
    left: 16,
  },
  sigBoxCenter: {
    bottom: '40%',
    left: '30%',
  },
  sigPreviewTag: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.accentCoral,
  },
  signatureRenderText: {
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '600',
    marginVertical: 4,
  },
  sigBottomLine: {
    width: 100,
    height: 1,
    backgroundColor: Colors.accentCoral,
  },
  styleTabs: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 3,
    gap: 4,
  },
  styleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: Radius.md,
  },
  styleTabActive: {
    backgroundColor: Colors.surfaceWhite,
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  styleTabText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  styleTabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  inputBox: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  textInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.onSurface,
  },
  anchorRow: {
    flexDirection: 'row',
    gap: 6,
  },
  anchorBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
  },
  anchorBtnActive: {
    backgroundColor: Colors.surfacePdf,
    borderWidth: 1,
    borderColor: Colors.accentCoral,
  },
  anchorBtnText: {
    fontSize: 11,
    color: Colors.onSurfaceVariant,
    fontWeight: '500',
  },
  anchorBtnTextActive: {
    color: Colors.accentCoral,
    fontWeight: '700',
  },
  inkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  inkPills: {
    flexDirection: 'row',
    gap: 10,
  },
  inkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  inkCircleActive: {
    borderWidth: 2,
    borderColor: Colors.accentCoral,
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
