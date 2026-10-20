/**
 * FileAssemblyWorkspace.tsx (Workspace E)
 * Handles tools:
 *  - 195 File Splitter
 *  - 196 File Joiner
 *
 * Implements binary file splitting into numbered parts (.part1, .part2)
 * and ordered reassembly/joining back into the complete original file.
 */

import React, { useState, useEffect } from 'react';
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
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import {
  ArchiveFilePicker,
  SelectedArchiveFile,
  formatFileSize,
} from './shared/ArchiveFilePicker';
import { ArchiveResultView, ArchiveResultData } from './shared/ArchiveResultView';
import {
  base64ToUint8Array,
  uint8ArrayToBase64,
} from './shared/ChecksumUtils';
import { getArchiveToolConfig } from './archiveConfig';

interface FileAssemblyWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

type AssemblyTab = 'split' | 'join';

export const FileAssemblyWorkspace: React.FC<FileAssemblyWorkspaceProps> = ({
  initialToolId = 195,
  initialOperation,
  onBack,
}) => {
  const toolConfig = getArchiveToolConfig(initialToolId);
  const toolName = toolConfig?.name || 'File Assembly';

  const getInitialTab = (): AssemblyTab => {
    const op = initialOperation || toolConfig?.defaultOperation;
    if (op === 'join' || initialToolId === 196) return 'join';
    return 'split';
  };

  const [activeTab, setActiveTab] = useState<AssemblyTab>(getInitialTab());
  const [selectedFiles, setSelectedFiles] = useState<SelectedArchiveFile[]>([]);
  const [chunkSizeBytes, setChunkSizeBytes] = useState<number>(512 * 1024); // 512 KB default
  const [partsCount, setPartsCount] = useState<number>(4);
  const [splitMethod, setSplitMethod] = useState<'size' | 'parts'>('size');
  const [joinedFileName, setJoinedFileName] = useState('Reassembled_File');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState<ArchiveResultData | null>(null);

  const { isFavorite, toggleFavorite, addManagedFile } = useAppStore();
  const favorited = isFavorite(initialToolId);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [initialToolId, initialOperation]);

  // Handler: Split File
  const handleSplit = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No File Selected', 'Please select a file to split.');
      return;
    }

    const file = selectedFiles[0];
    setIsProcessing(true);
    try {
      const b64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(b64);
      const totalLen = bytes.length;

      let effectiveChunkSize = chunkSizeBytes;
      if (splitMethod === 'parts') {
        effectiveChunkSize = Math.max(1024, Math.ceil(totalLen / partsCount));
      }

      const generatedParts: string[] = [];
      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const splitDir = `${docDir}split_${Date.now()}/`;
      await FileSystem.makeDirectoryAsync(splitDir, { intermediates: true });

      let offset = 0;
      let partIdx = 1;

      while (offset < totalLen) {
        const end = Math.min(offset + effectiveChunkSize, totalLen);
        const chunk = bytes.slice(offset, end);
        const partName = `${file.name}.part${String(partIdx).padStart(2, '0')}`;
        const partUri = `${splitDir}${partName}`;

        const partB64 = uint8ArrayToBase64(chunk);
        await FileSystem.writeAsStringAsync(partUri, partB64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Add to managed files
        addManagedFile({
          name: partName,
          uri: partUri,
          size: chunk.length,
          toolId: 195,
          toolName: 'File Splitter',
          createdAt: Date.now(),
        });

        generatedParts.push(partName);
        offset = end;
        partIdx++;
      }

      setResultData({
        title: `File Split into ${generatedParts.length} Parts`,
        fileName: `${file.name} (${generatedParts.length} parts)`,
        fileUri: `${splitDir}${generatedParts[0]}`,
        fileSize: totalLen,
        metricLabel: 'Chunk Allocation',
        metricValue: `${generatedParts.length} parts · ~${formatFileSize(effectiveChunkSize)} each`,
        details: [
          { label: 'Original File', value: file.name },
          { label: 'Original Size', value: formatFileSize(totalLen) },
          { label: 'Generated Chunks', value: `${generatedParts.length} files` },
          { label: 'Saved To', value: 'My Files (Sandbox)' },
        ],
        toolId: initialToolId,
        toolName,
      });
    } catch (err: any) {
      Alert.alert('Split Error', err?.message || 'Failed to split file.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Join Files
  const handleJoin = async () => {
    if (selectedFiles.length < 2) {
      Alert.alert('Multiple Parts Needed', 'Please select at least 2 file parts to join.');
      return;
    }

    setIsProcessing(true);
    try {
      // Sort parts naturally by part number in name
      const sorted = [...selectedFiles].sort((a, b) => {
        return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      });

      const chunks: Uint8Array[] = [];
      let totalSize = 0;

      for (const item of sorted) {
        const b64 = await FileSystem.readAsStringAsync(item.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const bytes = base64ToUint8Array(b64);
        chunks.push(bytes);
        totalSize += bytes.length;
      }

      // Concatenate all chunks
      const combined = new Uint8Array(totalSize);
      let pos = 0;
      for (const chunk of chunks) {
        combined.set(chunk, pos);
        pos += chunk.length;
      }

      // Infer clean name (stripping .part*)
      let outputName = joinedFileName.trim();
      if (!outputName || outputName === 'Reassembled_File') {
        outputName = sorted[0].name.replace(/\.part\d+$/i, '');
        if (outputName === sorted[0].name) {
          outputName = `Reassembled_${sorted[0].name}`;
        }
      }

      const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
      const targetUri = `${docDir}${Date.now()}_${outputName}`;

      const b64Out = uint8ArrayToBase64(combined);
      await FileSystem.writeAsStringAsync(targetUri, b64Out, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setResultData({
        title: 'Files Reassembled Successfully',
        fileName: outputName,
        fileUri: targetUri,
        fileSize: totalSize,
        metricLabel: 'Joined File',
        metricValue: `${formatFileSize(totalSize)} from ${sorted.length} parts`,
        details: [
          { label: 'Reconstructed Name', value: outputName },
          { label: 'Parts Reassembled', value: `${sorted.length}` },
          { label: 'Combined Size', value: formatFileSize(totalSize) },
          { label: 'Integrity', value: 'Continuous Binary Merge' },
        ],
        toolId: initialToolId,
        toolName,
      });
    } catch (err: any) {
      Alert.alert('Join Error', err?.message || 'Failed to reassemble parts.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolName}
        subtitle="Archive & Files Studio · Universal Workspace E"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(initialToolId)}
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
        {/* Workspace Identity */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={styles.identityIconBox}>
              <AppIcon name="Layers" size={24} color={Colors.accentSlate} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>{toolName}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #{initialToolId}</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                {toolConfig?.description || 'Split large files into chunks or join numbered parts.'}
              </Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={true} />
          </View>
        </View>

        {/* Operation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'split' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('split');
              setResultData(null);
            }}
          >
            <AppIcon
              name="Scissors"
              size={16}
              color={activeTab === 'split' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeTab === 'split' && styles.tabTextActive]}>
              Split File
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'join' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('join');
              setResultData(null);
            }}
          >
            <AppIcon
              name="Layers"
              size={16}
              color={activeTab === 'join' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeTab === 'join' && styles.tabTextActive]}>
              Join Parts
            </Text>
          </TouchableOpacity>
        </View>

        {/* File Picker */}
        <ArchiveFilePicker
          files={selectedFiles}
          onFilesChange={(files) => {
            setSelectedFiles(files);
            setResultData(null);
          }}
          multiple={activeTab === 'join'}
          title={activeTab === 'split' ? 'Select File to Split' : 'Select Chunk Parts to Join'}
          subtitle={
            activeTab === 'split'
              ? 'Choose one large file to divide'
              : 'Choose two or more .part* files in sequence'
          }
        />

        {/* Split Settings */}
        {activeTab === 'split' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Chunk Division Settings</Text>

            <View style={styles.methodRow}>
              <TouchableOpacity
                style={[styles.methodBtn, splitMethod === 'size' && styles.methodBtnActive]}
                onPress={() => setSplitMethod('size')}
              >
                <Text
                  style={[styles.methodText, splitMethod === 'size' && styles.methodTextActive]}
                >
                  By Fixed Size
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.methodBtn, splitMethod === 'parts' && styles.methodBtnActive]}
                onPress={() => setSplitMethod('parts')}
              >
                <Text
                  style={[styles.methodText, splitMethod === 'parts' && styles.methodTextActive]}
                >
                  By Equal Parts
                </Text>
              </TouchableOpacity>
            </View>

            {splitMethod === 'size' ? (
              <View style={styles.presetRow}>
                {[
                  { label: '256 KB', size: 256 * 1024 },
                  { label: '512 KB', size: 512 * 1024 },
                  { label: '1 MB', size: 1024 * 1024 },
                  { label: '5 MB', size: 5 * 1024 * 1024 },
                ].map((p, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.presetPill,
                      chunkSizeBytes === p.size && styles.presetPillActive,
                    ]}
                    onPress={() => setChunkSizeBytes(p.size)}
                  >
                    <Text
                      style={[
                        styles.presetText,
                        chunkSizeBytes === p.size && styles.presetTextActive,
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.presetRow}>
                {[2, 3, 4, 5, 8, 10].map((n) => (
                  <TouchableOpacity
                    key={n}
                    style={[styles.presetPill, partsCount === n && styles.presetPillActive]}
                    onPress={() => setPartsCount(n)}
                  >
                    <Text
                      style={[styles.presetText, partsCount === n && styles.presetTextActive]}
                    >
                      {n} Parts
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Join Settings */}
        {activeTab === 'join' && (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Reassembly Configuration</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Output File Name</Text>
              <TextInput
                style={styles.textInput}
                value={joinedFileName}
                onChangeText={setJoinedFileName}
                placeholder="Target_File_Name"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        )}

        {/* Results */}
        {resultData && <ArchiveResultView result={resultData} onReset={() => setResultData(null)} />}

        {/* Primary Action Button */}
        <PrimaryButton
          title={activeTab === 'split' ? 'Split File into Parts' : 'Join Parts into File'}
          onPress={activeTab === 'split' ? handleSplit : handleJoin}
          loading={isProcessing}
          disabled={activeTab === 'split' ? selectedFiles.length === 0 : selectedFiles.length < 2}
          icon={activeTab === 'split' ? 'Scissors' : 'Layers'}
          color={Colors.accentSlate}
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
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  identityIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceArchive,
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: Radius.md,
  },
  tabBtnActive: {
    backgroundColor: Colors.accentSlate,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  methodBtnActive: {
    backgroundColor: Colors.accentSlate,
    borderColor: Colors.accentSlate,
  },
  methodText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  methodTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  presetPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  presetPillActive: {
    backgroundColor: Colors.accentSlate,
    borderColor: Colors.accentSlate,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  presetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.neutral700,
  },
  textInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 44,
    fontSize: 13,
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
});
