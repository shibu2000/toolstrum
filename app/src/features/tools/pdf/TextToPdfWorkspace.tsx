import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface TextToPdfWorkspaceProps {
  onBack: () => void;
}

export const TextToPdfWorkspace: React.FC<TextToPdfWorkspaceProps> = ({ onBack }) => {
  const [content, setContent] = useState('');
  const [fontChoice, setFontChoice] = useState<'sans' | 'serif' | 'mono'>('sans');
  const [fontSize, setFontSize] = useState<number>(12);
  const [lineSpacing, setLineSpacing] = useState<number>(1.5);
  const [margin, setMargin] = useState<number>(36);
  const [pageSize, setPageSize] = useState<'A4' | 'Letter'>('A4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputPdf, setOutputPdf] = useState<{ name: string; uri: string; size: number } | null>(
    null
  );

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(2);

  const stats = useMemo(() => {
    const trimmed = content.trim();
    const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
    const chars = content.length;
    return { words, chars };
  }, [content]);

  const handleGeneratePdf = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Content', 'Please enter some text to generate your PDF document.');
      return;
    }

    setIsProcessing(true);
    setOutputPdf(null);

    try {
      const pdfDoc = await PDFDocument.create();

      // Pick font
      let font;
      if (fontChoice === 'serif') {
        font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
      } else if (fontChoice === 'mono') {
        font = await pdfDoc.embedFont(StandardFonts.Courier);
      } else {
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // Page dimensions
      const pageW = pageSize === 'A4' ? 595.28 : 612;
      const pageH = pageSize === 'A4' ? 841.89 : 792;
      const contentW = pageW - margin * 2;
      const lineHeight = fontSize * lineSpacing;

      // Word wrapping logic
      const lines: string[] = [];
      const paragraphs = content.split('\n');

      for (const para of paragraphs) {
        if (!para.trim()) {
          lines.push('');
          continue;
        }

        const words = para.split(' ');
        let currentLine = '';

        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testW = font.widthOfTextAtSize(testLine, fontSize);

          if (testW <= contentW) {
            currentLine = testLine;
          } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
          }
        }
        if (currentLine) lines.push(currentLine);
      }

      // Paginate lines onto pages
      let currentPage = pdfDoc.addPage([pageW, pageH]);
      let yPos = pageH - margin - fontSize;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check if new page is needed
        if (yPos < margin + fontSize) {
          currentPage = pdfDoc.addPage([pageW, pageH]);
          yPos = pageH - margin - fontSize;
        }

        if (line) {
          currentPage.drawText(line, {
            x: margin,
            y: yPos,
            size: fontSize,
            font,
            color: rgb(0.09, 0.1, 0.18),
          });
        }

        yPos -= lineHeight;
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
        toolId: 2,
        toolName: 'Text to PDF',
        createdAt: Date.now(),
      });

      addRecentItem({
        toolId: 2,
        title: filename,
        subtitle: `Text to PDF (${pdfDoc.getPageCount()} pages) · Just now`,
      });

      setOutputPdf({
        name: filename,
        uri: targetUri,
        size: generatedSize,
      });
    } catch (err: any) {
      Alert.alert(
        'PDF Generation Failed',
        err?.message || 'Could not convert text into PDF.'
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
        title="Text to PDF"
        subtitle="PDF Studio · Core v2.1"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(2)}
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Identity & Shield */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.identityIconBox}>
              <AppIcon name="Type" size={24} color={Colors.accentCoral} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>Text to PDF Document</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #2</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                Convert typed or pasted plain text into a print-ready PDF document.
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* Text Input Area */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerLeft}>
              <AppIcon name="edit_note" size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Source Content</Text>
            </View>
            <TouchableOpacity onPress={() => setContent('')}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.editorInput}
            value={content}
            onChangeText={setContent}
            placeholder="Type or paste text to convert..."
            placeholderTextColor={Colors.textMuted}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.editorStats}>
            <Text style={styles.statsText}>
              {stats.chars} characters · {stats.words} words
            </Text>
          </View>
        </View>

        {/* Typography & Style Controls */}
        <View style={styles.card}>
          <View style={styles.headerLeft}>
            <AppIcon name="format_paint" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Typography & Style</Text>
          </View>

          {/* Typeface */}
          <Text style={styles.configLabel}>Typeface</Text>
          <View style={styles.segmentRow}>
            {[
              { id: 'sans', label: 'Helvetica', sub: 'Sans-Serif' },
              { id: 'serif', label: 'Times', sub: 'Editorial Serif' },
              { id: 'mono', label: 'Courier', sub: 'Monospace' },
            ].map((font) => (
              <TouchableOpacity
                key={font.id}
                style={[styles.segmentBtn, fontChoice === font.id && styles.segmentBtnActive]}
                onPress={() => setFontChoice(font.id as any)}
              >
                <Text
                  style={[styles.segmentBtnText, fontChoice === font.id && styles.segmentBtnTextActive]}
                >
                  {font.label}
                </Text>
                <Text style={styles.subFontText}>{font.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Font Size & Line Spacing */}
          <View style={styles.controlsGrid}>
            <View style={styles.controlBox}>
              <Text style={styles.configLabel}>Font Size: {fontSize}pt</Text>
              <View style={styles.stepperRow}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setFontSize(Math.max(8, fontSize - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.stepperVal}>{fontSize}</Text>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setFontSize(Math.min(24, fontSize + 1))}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.controlBox}>
              <Text style={styles.configLabel}>Line Spacing</Text>
              <View style={styles.spacingRow}>
                {[1.2, 1.5, 2.0].map((sp) => (
                  <TouchableOpacity
                    key={sp}
                    style={[styles.spacingBtn, lineSpacing === sp && styles.spacingBtnActive]}
                    onPress={() => setLineSpacing(sp)}
                  >
                    <Text
                      style={[
                        styles.spacingBtnText,
                        lineSpacing === sp && styles.spacingBtnTextActive,
                      ]}
                    >
                      {sp}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          {/* Page Size & Margins */}
          <View style={styles.controlsGrid}>
            <View style={styles.controlBox}>
              <Text style={styles.configLabel}>Page Size</Text>
              <View style={styles.spacingRow}>
                {(['A4', 'Letter'] as const).map((ps) => (
                  <TouchableOpacity
                    key={ps}
                    style={[styles.spacingBtn, pageSize === ps && styles.spacingBtnActive]}
                    onPress={() => setPageSize(ps)}
                  >
                    <Text
                      style={[
                        styles.spacingBtnText,
                        pageSize === ps && styles.spacingBtnTextActive,
                      ]}
                    >
                      {ps}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.controlBox}>
              <Text style={styles.configLabel}>Margin: {margin}pt</Text>
              <View style={styles.spacingRow}>
                {[24, 36, 48].map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.spacingBtn, margin === m && styles.spacingBtnActive]}
                    onPress={() => setMargin(m)}
                  >
                    <Text
                      style={[styles.spacingBtnText, margin === m && styles.spacingBtnTextActive]}
                    >
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
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
                <Text style={styles.resultTitle}>PDF Document Ready</Text>
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
                onPress={() => setOutputPdf(null)}
              >
                <Text style={styles.convertAnotherText}>Create Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Primary Action Button */}
        <PrimaryButton
          title="Render PDF Document"
          onPress={handleGeneratePdf}
          disabled={!content.trim()}
          loading={isProcessing}
          variant="pdf"
          icon="FileText"
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  clearText: {
    fontSize: 12,
    color: Colors.statusError,
    fontWeight: '600',
  },
  editorInput: {
    minHeight: 160,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    fontSize: 14,
    color: Colors.onSurface,
    lineHeight: 22,
  },
  editorStats: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  statsText: {
    fontSize: 12,
    color: Colors.textMuted,
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
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentBtnTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  subFontText: {
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },
  controlsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 4,
  },
  controlBox: {
    flex: 1,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    height: 38,
    paddingHorizontal: 4,
  },
  stepperBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.sm - 2,
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  stepperVal: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  spacingRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    padding: 2,
    height: 38,
  },
  spacingBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm - 2,
  },
  spacingBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: Colors.onSurface,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  spacingBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  spacingBtnTextActive: {
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
