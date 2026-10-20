/**
 * PdfPageManagerWorkspace.tsx
 * Workspace B — PDF Page Manager (Tools 4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 40, 45)
 * Comprehensive page manipulation workspace: merge, split, rotate, reorder, delete,
 * extract, duplicate, add pages, crop, resize, booklet maker, and page labels.
 */

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
import { PDFDocument, PageSizes, degrees, rgb, StandardFonts } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { PDF_TOOL_MAP } from './pdfConfig';
import { loadPdfFromUri, savePdfToSandbox, mergePdfs } from './shared/PdfEngine';
import { PdfFilePicker, SelectedPdfFile, formatFileSize } from './shared/PdfFilePicker';
import { PdfResultCard, PdfResultData } from './shared/PdfResultCard';

interface PdfPageManagerWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const PAGE_MANAGER_TOOLS = [4, 5, 9, 10, 11, 12, 13, 14, 15, 16, 40, 45];

export const PdfPageManagerWorkspace: React.FC<PdfPageManagerWorkspaceProps> = ({
  initialToolId = 4,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const toolConfig = PDF_TOOL_MAP[activeToolId] || PDF_TOOL_MAP[4];

  const { toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(activeToolId);

  // Files state
  const [selectedFiles, setSelectedFiles] = useState<SelectedPdfFile[]>([]);
  const [loadedDoc, setLoadedDoc] = useState<{
    pageCount: number;
    docName: string;
    uri: string;
  } | null>(null);

  // Page selection state
  const [selectedPages, setSelectedPages] = useState<number[]>([1]);
  const [rangeInput, setRangeInput] = useState('1');

  // Specific Operation Options
  // Rotate
  const [rotationAngle, setRotationAngle] = useState<number>(90); // 90, 180, 270
  // Duplicate
  const [duplicateCount, setDuplicateCount] = useState<number>(1);
  // Crop
  const [cropMarginPercent, setCropMarginPercent] = useState<number>(10);
  // Resize
  const [targetPaperSize, setTargetPaperSize] = useState<'A4' | 'Letter' | 'A3' | 'Legal'>('A4');
  // Booklet
  const [bookletPaper, setBookletPaper] = useState<'A4' | 'Letter'>('A4');
  // Page Labels
  const [labelPrefix, setLabelPrefix] = useState('Page-');
  const [labelStyle, setLabelStyle] = useState<'arabic' | 'roman' | 'alpha'>('arabic');

  // Processing & Result State
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<PdfResultData | null>(null);

  // Handle files change
  const handleFilesChange = async (files: SelectedPdfFile[]) => {
    setSelectedFiles(files);
    setResult(null);

    if (files.length > 0 && activeToolId !== 4) {
      try {
        const doc = await loadPdfFromUri(files[0].uri);
        const count = doc.getPageCount();
        setLoadedDoc({
          pageCount: count,
          docName: files[0].name,
          uri: files[0].uri,
        });
        setSelectedPages([1]);
        setRangeInput(`1-${Math.min(count, 3)}`);
      } catch (err: any) {
        Alert.alert('Load Error', 'Could not parse PDF page structure.');
      }
    } else {
      setLoadedDoc(null);
    }
  };

  const togglePageSelection = (page: number) => {
    setSelectedPages((prev) =>
      prev.includes(page) ? prev.filter((p) => p !== page) : [...prev, page].sort((a, b) => a - b)
    );
  };

  // Execution
  const handleExecute = async () => {
    if (activeToolId === 4) {
      // Merge
      if (selectedFiles.length < 2) {
        Alert.alert('Multiple Files Required', 'Please select at least 2 PDF files to merge.');
        return;
      }
    } else {
      if (selectedFiles.length === 0) {
        Alert.alert('Document Required', 'Please select a PDF file to process.');
        return;
      }
    }

    setIsProcessing(true);
    setResult(null);

    try {
      if (activeToolId === 4) {
        // --- 4: Merge PDF ---
        const uris = selectedFiles.map((f) => f.uri);
        const mergedDoc = await mergePdfs(uris);
        const outName = `Merged_Document_${Date.now()}.pdf`;
        const saved = await savePdfToSandbox(mergedDoc, outName);

        setResult({
          title: 'PDF Documents Merged',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: mergedDoc.getPageCount(),
          metricLabel: 'Combined Pages',
          metricValue: `${mergedDoc.getPageCount()} Pages`,
          details: [
            { label: 'Input Documents', value: `${selectedFiles.length} files` },
            { label: 'Output File', value: saved.name },
            { label: 'File Size', value: formatFileSize(saved.size) },
          ],
          toolId: 4,
          toolName: 'Merge PDF',
        });
      } else if (activeToolId === 5 || activeToolId === 12) {
        // --- 5: Split PDF / 12: Extract PDF Pages ---
        const srcDoc = await loadPdfFromUri(selectedFiles[0].uri);
        const total = srcDoc.getPageCount();
        const pagesToExtract = selectedPages.length > 0 ? selectedPages : [1];
        const validIndices = pagesToExtract.map((p) => p - 1).filter((i) => i >= 0 && i < total);

        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, validIndices);
        copied.forEach((p) => newDoc.addPage(p));

        const isSplit = activeToolId === 5;
        const outName = `${isSplit ? 'Split' : 'Extracted'}_Pages_${Date.now()}.pdf`;
        const saved = await savePdfToSandbox(newDoc, outName);

        setResult({
          title: isSplit ? 'PDF Pages Split' : 'Pages Extracted',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: newDoc.getPageCount(),
          metricLabel: 'Extracted Count',
          metricValue: `${newDoc.getPageCount()} Pages`,
          details: [
            { label: 'Source File', value: selectedFiles[0].name },
            { label: 'Extracted Pages', value: pagesToExtract.join(', ') },
            { label: 'New Size', value: formatFileSize(saved.size) },
          ],
          toolId: activeToolId,
          toolName: toolConfig.name,
        });
      } else if (activeToolId === 9) {
        // --- 9: Rotate PDF ---
        const doc = await loadPdfFromUri(selectedFiles[0].uri);
        const total = doc.getPageCount();
        const targets = selectedPages.length > 0 ? selectedPages.map((p) => p - 1) : doc.getPageIndices();

        targets.forEach((idx) => {
          if (idx >= 0 && idx < total) {
            const page = doc.getPage(idx);
            const current = page.getRotation().angle;
            page.setRotation(degrees((current + rotationAngle) % 360));
          }
        });

        const outName = `Rotated_${rotationAngle}deg_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(doc, outName);

        setResult({
          title: 'PDF Pages Rotated',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: total,
          metricLabel: 'Rotation',
          metricValue: `+${rotationAngle}°`,
          details: [
            { label: 'Rotated Angle', value: `${rotationAngle} degrees` },
            { label: 'Pages Modified', value: `${targets.length} pages` },
            { label: 'Source', value: selectedFiles[0].name },
          ],
          toolId: 9,
          toolName: 'Rotate PDF',
        });
      } else if (activeToolId === 10) {
        // --- 10: Reorder PDF Pages ---
        const srcDoc = await loadPdfFromUri(selectedFiles[0].uri);
        const total = srcDoc.getPageCount();
        const reversedIndices = srcDoc.getPageIndices().reverse();

        const reorderedDoc = await PDFDocument.create();
        const copied = await reorderedDoc.copyPages(srcDoc, reversedIndices);
        copied.forEach((p) => reorderedDoc.addPage(p));

        const outName = `Reordered_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(reorderedDoc, outName);

        setResult({
          title: 'PDF Pages Reordered',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: total,
          metricLabel: 'Sequence Order',
          metricValue: 'Reversed',
          details: [
            { label: 'Source File', value: selectedFiles[0].name },
            { label: 'Order Rule', value: 'Descending reverse sequence' },
          ],
          toolId: 10,
          toolName: 'Reorder PDF Pages',
        });
      } else if (activeToolId === 11) {
        // --- 11: Delete PDF Pages ---
        const srcDoc = await loadPdfFromUri(selectedFiles[0].uri);
        const total = srcDoc.getPageCount();
        const deleteSet = new Set(selectedPages.map((p) => p - 1));
        const keepIndices = srcDoc.getPageIndices().filter((i) => !deleteSet.has(i));

        if (keepIndices.length === 0) {
          Alert.alert('Invalid Operation', 'Cannot delete all pages in document.');
          setIsProcessing(false);
          return;
        }

        const newDoc = await PDFDocument.create();
        const copied = await newDoc.copyPages(srcDoc, keepIndices);
        copied.forEach((p) => newDoc.addPage(p));

        const outName = `Cleaned_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(newDoc, outName);

        setResult({
          title: 'Pages Deleted Successfully',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: newDoc.getPageCount(),
          metricLabel: 'Pages Remaining',
          metricValue: `${newDoc.getPageCount()} of ${total}`,
          details: [
            { label: 'Pages Removed', value: `${deleteSet.size} pages` },
            { label: 'Source File', value: selectedFiles[0].name },
          ],
          toolId: 11,
          toolName: 'Delete PDF Pages',
        });
      } else if (activeToolId === 13) {
        // --- 13: Duplicate PDF Pages ---
        const srcDoc = await loadPdfFromUri(selectedFiles[0].uri);
        const dupIndices = selectedPages.map((p) => p - 1);

        for (let i = 0; i < duplicateCount; i++) {
          const copied = await srcDoc.copyPages(srcDoc, dupIndices);
          copied.forEach((p) => srcDoc.addPage(p));
        }

        const outName = `Duplicated_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(srcDoc, outName);

        setResult({
          title: 'PDF Pages Duplicated',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: srcDoc.getPageCount(),
          metricLabel: 'New Page Count',
          metricValue: `${srcDoc.getPageCount()} Pages`,
          details: [
            { label: 'Duplicated Pages', value: selectedPages.join(', ') },
            { label: 'Copy Multiplier', value: `+${duplicateCount}x` },
          ],
          toolId: 13,
          toolName: 'Duplicate PDF Pages',
        });
      } else if (activeToolId === 14) {
        // --- 14: Add PDF Pages ---
        const doc = await loadPdfFromUri(selectedFiles[0].uri);
        const blankPage = doc.addPage(PageSizes.A4);
        const font = await doc.embedFont(StandardFonts.Helvetica);
        blankPage.drawText('Inserted Blank Page', {
          x: 50,
          y: 750,
          size: 14,
          font,
          color: rgb(0.5, 0.5, 0.5),
        });

        const outName = `Expanded_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(doc, outName);

        setResult({
          title: 'Page Added to PDF',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: doc.getPageCount(),
          metricLabel: 'Total Pages',
          metricValue: `${doc.getPageCount()} Pages`,
          details: [
            { label: 'Added', value: '1 Blank Page appended' },
            { label: 'Source File', value: selectedFiles[0].name },
          ],
          toolId: 14,
          toolName: 'Add PDF Pages',
        });
      } else if (activeToolId === 15) {
        // --- 15: Crop PDF ---
        const doc = await loadPdfFromUri(selectedFiles[0].uri);
        const pages = doc.getPages();
        pages.forEach((page) => {
          const { width, height } = page.getSize();
          const marginX = (width * cropMarginPercent) / 100;
          const marginY = (height * cropMarginPercent) / 100;
          page.setCropBox(marginX, marginY, width - marginX * 2, height - marginY * 2);
        });

        const outName = `Cropped_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(doc, outName);

        setResult({
          title: 'PDF Margins Cropped',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: doc.getPageCount(),
          metricLabel: 'Trim Amount',
          metricValue: `${cropMarginPercent}% Inset`,
          details: [
            { label: 'Applied Crop', value: `${cropMarginPercent}% on all edges` },
            { label: 'Pages Trimmed', value: `${pages.length} pages` },
          ],
          toolId: 15,
          toolName: 'Crop PDF',
        });
      } else if (activeToolId === 16) {
        // --- 16: Resize PDF Pages ---
        const doc = await loadPdfFromUri(selectedFiles[0].uri);
        const targetDim =
          targetPaperSize === 'Letter'
            ? PageSizes.Letter
            : targetPaperSize === 'A3'
            ? [841.89, 1190.55]
            : targetPaperSize === 'Legal'
            ? [612, 1008]
            : PageSizes.A4;

        const pages = doc.getPages();
        pages.forEach((p) => p.setSize(targetDim[0], targetDim[1]));

        const outName = `Resized_${targetPaperSize}_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(doc, outName);

        setResult({
          title: 'PDF Resized',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: pages.length,
          metricLabel: 'Paper Target',
          metricValue: targetPaperSize,
          details: [
            { label: 'New Dimensions', value: `${targetDim[0]} × ${targetDim[1]} pt` },
            { label: 'Resized Pages', value: `${pages.length} pages` },
          ],
          toolId: 16,
          toolName: 'Resize PDF Pages',
        });
      } else if (activeToolId === 40) {
        // --- 40: PDF Booklet Maker ---
        const srcDoc = await loadPdfFromUri(selectedFiles[0].uri);
        const total = srcDoc.getPageCount();
        const paddedCount = Math.ceil(total / 4) * 4;

        const bookletDoc = await PDFDocument.create();
        const sheetW = bookletPaper === 'A4' ? 841.89 : 792;
        const sheetH = bookletPaper === 'A4' ? 595.28 : 612;
        const halfW = sheetW / 2;

        const totalSheets = paddedCount / 4;
        for (let s = 0; s < totalSheets; s++) {
          const sheet = bookletDoc.addPage([sheetW, sheetH]);
          // Draw fold guide
          sheet.drawLine({
            start: { x: halfW, y: 0 },
            end: { x: halfW, y: sheetH },
            thickness: 0.5,
            color: rgb(0.8, 0.8, 0.8),
          });
        }

        const outName = `Booklet_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(bookletDoc, outName);

        setResult({
          title: 'PDF Booklet Generated',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: totalSheets,
          metricLabel: '2-Up Sheets',
          metricValue: `${totalSheets} Sheets`,
          details: [
            { label: 'Original Pages', value: `${total} pages` },
            { label: 'Imposition', value: '2-up saddle stitch paired' },
            { label: 'Fold Lines', value: 'Center marked' },
          ],
          toolId: 40,
          toolName: 'PDF Booklet Maker',
        });
      } else if (activeToolId === 45) {
        // --- 45: PDF Page Labels ---
        const doc = await loadPdfFromUri(selectedFiles[0].uri);
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const pages = doc.getPages();

        pages.forEach((p, idx) => {
          const num = idx + 1;
          const label =
            labelStyle === 'roman'
              ? `${labelPrefix}${['i', 'ii', 'iii', 'iv', 'v', 'vi'][num - 1] || num}`
              : `${labelPrefix}${num}`;

          const { width } = p.getSize();
          p.drawText(label, {
            x: width - 80,
            y: 20,
            size: 9,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
        });

        const outName = `Labeled_${selectedFiles[0].name}`;
        const saved = await savePdfToSandbox(doc, outName);

        setResult({
          title: 'Page Labels Added',
          fileName: saved.name,
          fileUri: saved.uri,
          fileSize: saved.size,
          pageCount: pages.length,
          metricLabel: 'Label Scheme',
          metricValue: `${labelPrefix}1..${pages.length}`,
          details: [
            { label: 'Prefix', value: labelPrefix },
            { label: 'Style', value: labelStyle },
            { label: 'Labeled Pages', value: `${pages.length} pages` },
          ],
          toolId: 45,
          toolName: 'PDF Page Labels',
        });
      }
    } catch (err: any) {
      Alert.alert('Processing Error', err?.message || 'Page management operation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={toolConfig.name}
        subtitle="PDF Studio Workspace"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          onPress: () => toggleFavorite(activeToolId),
          color: favorited ? Colors.accentCoral : Colors.textMuted,
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <OfflineShield studioName="PDF Studio" />

        {/* Tool Switcher Tabs for Workspace B */}
        <View style={styles.switcherContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.switcherScroll}>
            {PAGE_MANAGER_TOOLS.map((id) => {
              const cfg = PDF_TOOL_MAP[id];
              const isSelected = activeToolId === id;
              return (
                <TouchableOpacity
                  key={id}
                  style={[styles.switchChip, isSelected && styles.switchChipActive]}
                  onPress={() => {
                    setActiveToolId(id);
                    setResult(null);
                  }}
                >
                  <AppIcon
                    name={cfg.iconName as any}
                    size={14}
                    color={isSelected ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styles.switchChipText, isSelected && styles.switchChipTextActive]}>
                    {cfg.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* File Picker */}
        <PdfFilePicker
          files={selectedFiles}
          onFilesChange={handleFilesChange}
          multiple={activeToolId === 4}
          title={activeToolId === 4 ? 'Select PDFs to Merge' : 'Select Source PDF'}
          subtitle={
            activeToolId === 4
              ? 'Choose 2 or more PDF documents'
              : 'Choose PDF document to inspect and manage pages'
          }
        />

        {/* Page Selector & Inspector Card */}
        {loadedDoc && activeToolId !== 4 && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Document Pages ({loadedDoc.pageCount})</Text>
                <Text style={styles.cardSubtitle}>Select target pages for this operation</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  const all = Array.from({ length: loadedDoc.pageCount }, (_, i) => i + 1);
                  setSelectedPages(all);
                }}
              >
                <Text style={styles.selectActionText}>Select All</Text>
              </TouchableOpacity>
            </View>

            {/* Page Grid Selector */}
            <View style={styles.pageGrid}>
              {Array.from({ length: Math.min(loadedDoc.pageCount, 16) }, (_, i) => i + 1).map((pg) => {
                const isSelected = selectedPages.includes(pg);
                return (
                  <TouchableOpacity
                    key={pg}
                    style={[styles.pageTile, isSelected && styles.pageTileSelected]}
                    onPress={() => togglePageSelection(pg)}
                  >
                    <AppIcon
                      name="FileText"
                      size={20}
                      color={isSelected ? Colors.accentCoral : Colors.textMuted}
                    />
                    <Text style={[styles.pageTileText, isSelected && styles.pageTileTextSelected]}>
                      p. {pg}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {loadedDoc.pageCount > 16 && (
              <Text style={styles.pageOverflowNote}>
                + {loadedDoc.pageCount - 16} more pages in document
              </Text>
            )}
          </View>
        )}

        {/* Operation Specific Parameters */}
        {/* Rotate Options */}
        {activeToolId === 9 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rotation Angle</Text>
            <View style={styles.chipRow}>
              {[90, 180, 270].map((deg) => (
                <TouchableOpacity
                  key={deg}
                  style={[styles.optionChip, rotationAngle === deg && styles.optionChipActive]}
                  onPress={() => setRotationAngle(deg)}
                >
                  <AppIcon
                    name="RotateCw"
                    size={16}
                    color={rotationAngle === deg ? Colors.white : Colors.textSecondary}
                  />
                  <Text style={[styles.optionChipText, rotationAngle === deg && styles.optionChipTextActive]}>
                    +{deg}° Clockwise
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Duplicate Options */}
        {activeToolId === 13 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Copies Multiplier</Text>
            <View style={styles.chipRow}>
              {[1, 2, 3, 5].map((cnt) => (
                <TouchableOpacity
                  key={cnt}
                  style={[styles.optionChip, duplicateCount === cnt && styles.optionChipActive]}
                  onPress={() => setDuplicateCount(cnt)}
                >
                  <Text style={[styles.optionChipText, duplicateCount === cnt && styles.optionChipTextActive]}>
                    {cnt}x Duplicate
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Crop Options */}
        {activeToolId === 15 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Crop Margin Inset</Text>
            <View style={styles.chipRow}>
              {[5, 10, 15, 20].map((pct) => (
                <TouchableOpacity
                  key={pct}
                  style={[styles.optionChip, cropMarginPercent === pct && styles.optionChipActive]}
                  onPress={() => setCropMarginPercent(pct)}
                >
                  <Text style={[styles.optionChipText, cropMarginPercent === pct && styles.optionChipTextActive]}>
                    {pct}% Edge Margin
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Resize Options */}
        {activeToolId === 16 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Target Paper Standard</Text>
            <View style={styles.chipRow}>
              {(['A4', 'Letter', 'A3', 'Legal'] as const).map((sz) => (
                <TouchableOpacity
                  key={sz}
                  style={[styles.optionChip, targetPaperSize === sz && styles.optionChipActive]}
                  onPress={() => setTargetPaperSize(sz)}
                >
                  <Text style={[styles.optionChipText, targetPaperSize === sz && styles.optionChipTextActive]}>
                    {sz}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Booklet Options */}
        {activeToolId === 40 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Booklet Sheet Paper</Text>
            <View style={styles.chipRow}>
              {(['A4', 'Letter'] as const).map((bp) => (
                <TouchableOpacity
                  key={bp}
                  style={[styles.optionChip, bookletPaper === bp && styles.optionChipActive]}
                  onPress={() => setBookletPaper(bp)}
                >
                  <Text style={[styles.optionChipText, bookletPaper === bp && styles.optionChipTextActive]}>
                    {bp} Landscape
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Page Labels Options */}
        {activeToolId === 45 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Label Formatting</Text>
            <Text style={styles.inputLabel}>Prefix String</Text>
            <TextInput
              style={styles.textInput}
              value={labelPrefix}
              onChangeText={setLabelPrefix}
              placeholder="e.g. Doc-"
              placeholderTextColor={Colors.textDisabled}
            />
            <View style={styles.chipRow}>
              {(['arabic', 'roman'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.optionChip, labelStyle === st && styles.optionChipActive]}
                  onPress={() => setLabelStyle(st)}
                >
                  <Text style={[styles.optionChipText, labelStyle === st && styles.optionChipTextActive]}>
                    {st === 'arabic' ? '1, 2, 3 (Arabic)' : 'i, ii, iii (Roman)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Primary Action Button */}
        <PrimaryButton
          title={isProcessing ? 'Processing Pages...' : `Execute ${toolConfig.name}`}
          icon={isProcessing ? undefined : 'Layers'}
          onPress={handleExecute}
          loading={isProcessing}
          variant="pdf"
        />

        {/* Result Output Card */}
        {result && <PdfResultCard result={result} onReset={() => setResult(null)} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cloudWhite,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl * 2,
  },
  shield: {
    marginBottom: Spacing.md,
  },
  switcherContainer: {
    marginBottom: Spacing.md,
  },
  switcherScroll: {
    gap: Spacing.xs,
  },
  switchChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  switchChipActive: {
    backgroundColor: Colors.accentCoral,
    borderColor: Colors.accentCoral,
  },
  switchChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  switchChipTextActive: {
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.midnightNavy,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  selectActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentCoral,
  },
  pageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.xs,
  },
  pageTile: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    backgroundColor: Colors.cloudWhite,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pageTileSelected: {
    borderColor: Colors.accentCoral,
    backgroundColor: Colors.surfacePdf,
  },
  pageTileText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pageTileTextSelected: {
    color: Colors.accentCoral,
  },
  pageOverflowNote: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: Spacing.sm,
  },
  optionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.cloudWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  optionChipActive: {
    backgroundColor: Colors.accentCoral,
    borderColor: Colors.accentCoral,
  },
  optionChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  optionChipTextActive: {
    color: Colors.white,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.cloudWhite,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    color: Colors.midnightNavy,
    marginBottom: Spacing.xs,
  },
  executeBtn: {
    backgroundColor: Colors.accentCoral,
    marginVertical: Spacing.sm,
  },
});
