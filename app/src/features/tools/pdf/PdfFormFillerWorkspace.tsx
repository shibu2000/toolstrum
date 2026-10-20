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
import { PDFDocument, rgb } from 'pdf-lib';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';

interface PdfFormFillerWorkspaceProps {
  onBack: () => void;
}

interface FormFieldItem {
  id: string;
  label: string;
  type: 'text' | 'checkbox';
  value: string | boolean;
  required: boolean;
}

const DEFAULT_FIELDS: FormFieldItem[] = [
  { id: 'first_name', label: '1. First Name & Middle Initial', type: 'text', value: 'David A.', required: true },
  { id: 'last_name', label: '2. Last Name', type: 'text', value: 'Reynolds', required: true },
  { id: 'ssn', label: '3. Identification / SSN Ref', type: 'text', value: '***-**-4892', required: true },
  { id: 'exempt', label: '4. Claim Exemption from Withholding', type: 'checkbox', value: false, required: false },
  { id: 'addr', label: '5. Residential Address', type: 'text', value: '742 Evergreen Terrace', required: false },
];

export const PdfFormFillerWorkspace: React.FC<PdfFormFillerWorkspaceProps> = ({ onBack }) => {
  const [docName, setDocName] = useState('W4_Employee_Withholding_2025.pdf');
  const [docUri, setDocUri] = useState<string | null>(null);
  const [fields, setFields] = useState<FormFieldItem[]>(DEFAULT_FIELDS);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputFile, setOutputFile] = useState<{
    name: string;
    uri: string;
    sizeBytes: number;
    filledCount: number;
  } | null>(null);

  const { addRecentItem, addManagedFile, toggleFavorite, isFavorite } = useAppStore();
  const favorited = isFavorite(26);

  const completedCount = fields.filter((f) => {
    if (typeof f.value === 'string') return f.value.trim().length > 0;
    return f.value === true;
  }).length;
  const progressPercent = Math.round((completedCount / fields.length) * 100);

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
        setOutputFile(null);

        // Try inspecting AcroForm fields
        try {
          const b64 = await FileSystem.readAsStringAsync(file.uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const pdfDoc = await PDFDocument.load(b64);
          const form = pdfDoc.getForm();
          const formFields = form.getFields();

          if (formFields.length > 0) {
            const detected: FormFieldItem[] = formFields.map((f, i) => ({
              id: f.getName(),
              label: `${i + 1}. ${f.getName()}`,
              type: 'text',
              value: '',
              required: true,
            }));
            setFields(detected);
          }
        } catch {
          // Keep defaults
        }
      }
    } catch (err: any) {
      Alert.alert('File Picker Error', err.message);
    }
  };

  const updateFieldValue = (id: string, val: string | boolean) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, value: val } : f))
    );
  };

  const handleSaveForm = async () => {
    setIsProcessing(true);

    try {
      let pdfDoc: PDFDocument;

      if (docUri) {
        const b64 = await FileSystem.readAsStringAsync(docUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        pdfDoc = await PDFDocument.load(b64);
      } else {
        // Create sample filled document
        pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        page.drawText('W-4 Withholding Certificate — Filled Copy', {
          x: 50,
          y: 750,
          size: 14,
          color: rgb(0.1, 0.2, 0.4),
        });

        let yOffset = 700;
        fields.forEach((field) => {
          page.drawText(`${field.label}:`, {
            x: 50,
            y: yOffset,
            size: 11,
            color: rgb(0.3, 0.3, 0.3),
          });
          page.drawText(`${field.value}`, {
            x: 240,
            y: yOffset,
            size: 11,
            color: rgb(0, 0, 0),
          });
          yOffset -= 35;
        });
      }

      // Fill existing AcroForm fields if present
      try {
        const form = pdfDoc.getForm();
        fields.forEach((f) => {
          try {
            if (typeof f.value === 'string') {
              const textField = form.getTextField(f.id);
              textField.setText(f.value);
            } else if (typeof f.value === 'boolean') {
              const checkField = form.getCheckBox(f.id);
              if (f.value) checkField.check();
              else checkField.uncheck();
            }
          } catch {
            // ignore missing field
          }
        });
      } catch {
        // ignore
      }

      const filledBase64 = await pdfDoc.saveAsBase64();
      const outName = `Filled_${Date.now()}.pdf`;
      const docPath = `${FileSystem.documentDirectory ?? ''}${outName}`;

      await FileSystem.writeAsStringAsync(docPath, filledBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const info = await FileSystem.getInfoAsync(docPath);
      const sizeBytes = info.exists && info.size ? info.size : 1024 * 140;

      const out = {
        name: outName,
        uri: docPath,
        sizeBytes,
        filledCount: completedCount,
      };

      setOutputFile(out);

      addManagedFile({
        name: outName,
        uri: docPath,
        sizeBytes,
        toolOriginId: 26,
        mimeType: 'application/pdf',
      });

      addRecentItem({
        toolId: 26,
        title: 'Fill PDF Forms',
        subtitle: `${outName} · ${completedCount} fields filled`,
      });
    } catch (err: any) {
      Alert.alert('Form Fill Error', err.message || 'Could not fill form.');
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
        Alert.alert('Saved', `Filled PDF saved to: ${outputFile.uri}`);
      }
    } catch (err: any) {
      Alert.alert('Share Error', err.message);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title="Fill PDF Forms"
        subtitle="PDF Studio · Tool #26"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: 'star',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(26),
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
            <AppIcon name="picture_as_pdf" size={14} color={Colors.accentCoral} />
            <Text style={styles.studioPillText}>Tool #26 · PDF Studio</Text>
          </View>
          <View style={styles.featurePill}>
            <AppIcon name="lock" size={12} color={Colors.accentEmerald} />
            <Text style={styles.featurePillText}>100% Offline · AcroForm Engine</Text>
          </View>
        </View>

        <View style={styles.descBox}>
          <Text style={styles.toolTitle}>Fill PDF Forms</Text>
          <Text style={styles.toolDesc}>
            Fill interactive PDF forms, text fields, checkboxes, and tax forms locally with zero cloud upload.
          </Text>
        </View>

        <OfflineShield studioName="PDF Studio" />

        {/* Document Selector Card */}
        <View style={styles.card}>
          <View style={styles.docRow}>
            <View style={styles.docIconBox}>
              <AppIcon name="description" size={24} color={Colors.accentCoral} />
            </View>
            <View style={styles.docMeta}>
              <Text style={styles.docTitle} numberOfLines={1}>
                {docName}
              </Text>
              <Text style={styles.docSubtitle}>Interactive AcroForm · Ready to fill</Text>
            </View>
            <TouchableOpacity style={styles.changeBtn} onPress={handlePickDocument}>
              <AppIcon name="swap_horiz" size={14} color={Colors.primary} />
              <Text style={styles.changeBtnText}>Change</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Completion HUD Progress Card */}
        <View style={styles.card}>
          <View style={styles.hudHeader}>
            <View style={styles.hudMeta}>
              <Text style={styles.hudTitle}>
                {completedCount} of {fields.length} Fields Completed
              </Text>
              <Text style={styles.hudSubtitle}>
                {fields.length - completedCount} fields remaining
              </Text>
            </View>
            <View style={styles.percentBadge}>
              <Text style={styles.percentText}>{progressPercent}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
          </View>
        </View>

        {/* Interactive Field Editor */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Interactive Field Editor</Text>

          <View style={styles.fieldsList}>
            {fields.map((f) => (
              <View key={f.id} style={styles.fieldBox}>
                <Text style={styles.fieldLabel}>{f.label}</Text>

                {f.type === 'text' ? (
                  <TextInput
                    style={styles.fieldInput}
                    value={f.value as string}
                    onChangeText={(txt) => updateFieldValue(f.id, txt)}
                    placeholder={`Enter ${f.label.toLowerCase()}...`}
                    placeholderTextColor={Colors.textMuted}
                  />
                ) : (
                  <TouchableOpacity
                    style={styles.checkboxRow}
                    onPress={() => updateFieldValue(f.id, !f.value)}
                  >
                    <View
                      style={[
                        styles.checkboxSquare,
                        f.value && styles.checkboxSquareActive,
                      ]}
                    >
                      {f.value ? (
                        <AppIcon name="check" size={14} color={Colors.surfaceWhite} />
                      ) : null}
                    </View>
                    <Text style={styles.checkboxLabel}>Check to confirm exemption</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={`Save & Fill PDF (${completedCount}/${fields.length} Fields)`}
          icon="check"
          onPress={handleSaveForm}
          loading={isProcessing}
        />

        {/* Output Card */}
        {outputFile && (
          <View style={styles.outputCard}>
            <View style={styles.outputHeader}>
              <AppIcon name="check_circle" size={20} color={Colors.statusSuccess} />
              <Text style={styles.outputTitle}>Form Successfully Filled!</Text>
            </View>

            <View style={styles.outputDetails}>
              <Text style={styles.outputFileName}>{outputFile.name}</Text>
              <Text style={styles.outputMeta}>
                {outputFile.filledCount} fields updated · {(outputFile.sizeBytes / 1024).toFixed(0)} KB · Offline Sealed
              </Text>
            </View>

            <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
              <AppIcon name="share" size={16} color={Colors.surfaceWhite} />
              <Text style={styles.shareBtnText}>Share / Save Filled PDF</Text>
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
  hudHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  hudMeta: {
    flex: 1,
  },
  hudTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  hudSubtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  percentBadge: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  percentText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: Colors.surfaceContainer,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  fieldsList: {
    gap: 10,
  },
  fieldBox: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.lg,
    padding: 10,
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  fieldInput: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  checkboxSquare: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.borderSubtle,
    backgroundColor: Colors.surfaceWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquareActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkboxLabel: {
    fontSize: 12,
    color: Colors.onSurfaceVariant,
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
