import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Colors, Spacing, Radius } from '../../../../design-system/tokens';
import { AppIcon } from '../../../../design-system/icons';

const TEXT_READABLE_EXTENSIONS = new Set(['TXT', 'MD', 'CSV', 'JSON', 'XML', 'HTML', 'YAML', 'YML', 'LOG']);

export interface OfficeDocumentAsset {
  name: string;
  sizeBytes: number;
  format: string;
  content: string;
  uri?: string;
  linesCount?: number;
  wordsCount?: number;
}

interface OfficePickerBoxProps {
  document: OfficeDocumentAsset | null;
  onDocumentSelected: (doc: OfficeDocumentAsset) => void;
  allowedFormats?: string[];
  sampleDocument?: OfficeDocumentAsset;
}

export const OfficePickerBox: React.FC<OfficePickerBoxProps> = ({
  document,
  onDocumentSelected,
  allowedFormats = ['DOCX', 'TXT', 'MD', 'CSV', 'JSON', 'XML', 'XLSX'],
  sampleDocument,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pickError, setPickError] = useState('');

  const handlePickDocument = async () => {
    setPickError('');
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });

      if (res.canceled || !res.assets || res.assets.length === 0) return;

      const file = res.assets[0];
      const ext = file.name.split('.').pop()?.toUpperCase() || 'TXT';

      setIsLoading(true);
      let content = '';
      if (TEXT_READABLE_EXTENSIONS.has(ext)) {
        content = await FileSystem.readAsStringAsync(file.uri, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else {
        setPickError(
          `${ext} is a binary format Toolstrum cannot parse yet (no on-device ${ext} reader is built in). Only plain-text formats (${Array.from(TEXT_READABLE_EXTENSIONS).join(', ')}) can be read for real right now.`
        );
        setIsLoading(false);
        return;
      }

      const lines = content.split('\n');
      const words = content.trim().split(/\s+/).filter(Boolean);

      onDocumentSelected({
        name: file.name,
        sizeBytes: file.size || content.length,
        format: ext,
        content,
        uri: file.uri,
        linesCount: lines.length,
        wordsCount: words.length,
      });
    } catch (e: any) {
      setPickError(`Could not read this file: ${e.message || 'Unknown error.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseSample = () => {
    if (sampleDocument) {
      onDocumentSelected(sampleDocument);
    }
  };

  if (document) {
    const sizeKb = Math.round(document.sizeBytes / 1024);
    return (
      <View style={styles.cardSelected}>
        <View style={styles.headerRow}>
          <View style={styles.iconContainer}>
            <AppIcon name="FileText" size={20} color={Colors.accentIndigo} />
          </View>
          <View style={styles.docInfo}>
            <Text style={styles.docName} numberOfLines={1}>
              {document.name}
            </Text>
            <Text style={styles.docMeta}>
              {document.format} • {sizeKb > 0 ? `${sizeKb} KB` : `${document.sizeBytes} B`}
              {document.wordsCount ? ` • ${document.wordsCount} words` : ''}
            </Text>
          </View>
          <TouchableOpacity style={styles.replaceBtn} onPress={handlePickDocument} activeOpacity={0.7} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.accentIndigo} />
            ) : (
              <>
                <AppIcon name="RefreshCw" size={13} color={Colors.accentIndigo} />
                <Text style={styles.replaceText}>Replace</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        {pickError ? <Text style={styles.errorText}>{pickError}</Text> : null}
      </View>
    );
  }

  return (
    <View style={styles.cardEmpty}>
      <View style={styles.emptyIconBox}>
        <AppIcon name="FileSpreadsheet" size={32} color={Colors.accentIndigo} />
      </View>
      <Text style={styles.emptyTitle}>Select Document or Data File</Text>
      <Text style={styles.emptySubtitle}>
        Supported: {allowedFormats.join(', ')} (100% on-device sandbox)
      </Text>
      {pickError ? <Text style={styles.errorText}>{pickError}</Text> : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.pickButton} onPress={handlePickDocument} activeOpacity={0.8} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.surfaceWhite} />
          ) : (
            <>
              <AppIcon name="Upload" size={16} color={Colors.surfaceWhite} />
              <Text style={styles.pickButtonText}>Pick File</Text>
            </>
          )}
        </TouchableOpacity>

        {sampleDocument && (
          <TouchableOpacity style={styles.sampleButton} onPress={handleUseSample} activeOpacity={0.8}>
            <AppIcon name="Sparkles" size={16} color={Colors.accentIndigo} />
            <Text style={styles.sampleButtonText}>Load Sample</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardSelected: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    marginBottom: Spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceOffice,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  docInfo: {
    flex: 1,
  },
  docName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  docMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceOffice,
  },
  replaceText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentIndigo,
  },
  cardEmpty: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyIconBox: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceOffice,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 11,
    color: Colors.statusError,
    marginTop: 8,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  pickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentIndigo,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  pickButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.surfaceWhite,
  },
  sampleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.surfaceOffice,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  sampleButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.accentIndigo,
  },
});
