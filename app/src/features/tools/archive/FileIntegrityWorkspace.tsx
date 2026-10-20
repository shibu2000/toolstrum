/**
 * FileIntegrityWorkspace.tsx (Workspace D)
 * Handles tools:
 *  - 193 File Checksum Generator
 *  - 194 Checksum Verifier
 *  - 372 File Hash Verifier
 *
 * Implements offline SHA-256, SHA-1, MD5, and CRC-32 computation
 * and automated hash matching with clear match / mismatch indicators.
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
import * as Clipboard from 'expo-clipboard';
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
import {
  sha256,
  sha1,
  md5,
  crc32Hex,
  base64ToUint8Array,
} from './shared/ChecksumUtils';
import { getArchiveToolConfig } from './archiveConfig';

interface FileIntegrityWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

type IntegrityTab = 'generate' | 'verify';

interface CalculatedHashes {
  sha256: string;
  sha1: string;
  md5: string;
  crc32: string;
}

export const FileIntegrityWorkspace: React.FC<FileIntegrityWorkspaceProps> = ({
  initialToolId = 193,
  initialOperation,
  onBack,
}) => {
  const toolConfig = getArchiveToolConfig(initialToolId);
  const toolName = toolConfig?.name || 'File Integrity';

  const getInitialTab = (): IntegrityTab => {
    const op = initialOperation || toolConfig?.defaultOperation;
    if (op === 'hash_verify' || initialToolId === 194 || initialToolId === 372) return 'verify';
    return 'generate';
  };

  const [activeTab, setActiveTab] = useState<IntegrityTab>(getInitialTab());
  const [selectedFiles, setSelectedFiles] = useState<SelectedArchiveFile[]>([]);
  const [calculatedHashes, setCalculatedHashes] = useState<CalculatedHashes | null>(null);
  const [expectedHash, setExpectedHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    status: 'match' | 'mismatch';
    algorithm: string;
    actual: string;
    expected: string;
  } | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { isFavorite, toggleFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(initialToolId);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [initialToolId, initialOperation]);

  const handleComputeHashes = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('No File Selected', 'Please select a file to calculate checksums.');
      return;
    }

    const file = selectedFiles[0];
    setIsProcessing(true);
    try {
      const b64 = await FileSystem.readAsStringAsync(file.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToUint8Array(b64);

      const hSha256 = sha256(bytes);
      const hSha1 = sha1(bytes);
      const hMd5 = md5(bytes);
      const hCrc32 = crc32Hex(bytes);

      const hashes: CalculatedHashes = {
        sha256: hSha256,
        sha1: hSha1,
        md5: hMd5,
        crc32: hCrc32,
      };

      setCalculatedHashes(hashes);

      // If in verify tab, evaluate against expected hash
      if (activeTab === 'verify' && expectedHash.trim()) {
        evaluateVerification(hashes, expectedHash.trim());
      }

      addRecentItem({
        toolId: initialToolId,
        title: file.name,
        subtitle: `${toolName} · Checksum computed`,
      });
    } catch (err: any) {
      Alert.alert('Checksum Error', err?.message || 'Failed to compute hashes.');
    } finally {
      setIsProcessing(false);
    }
  };

  const evaluateVerification = (hashes: CalculatedHashes, target: string) => {
    const cleanTarget = target.trim().toLowerCase();
    let algo = 'SHA-256';
    let computedVal = hashes.sha256;

    if (cleanTarget.length === 32) {
      algo = 'MD5';
      computedVal = hashes.md5;
    } else if (cleanTarget.length === 40) {
      algo = 'SHA-1';
      computedVal = hashes.sha1;
    } else if (cleanTarget.length === 8) {
      algo = 'CRC-32';
      computedVal = hashes.crc32;
    } else if (cleanTarget.length === 64) {
      algo = 'SHA-256';
      computedVal = hashes.sha256;
    }

    const isMatch = computedVal.toLowerCase() === cleanTarget;
    setVerificationResult({
      status: isMatch ? 'match' : 'mismatch',
      algorithm: algo,
      actual: computedVal,
      expected: cleanTarget,
    });
  };

  const handleCopyHash = async (hash: string, keyName: string) => {
    await Clipboard.setStringAsync(hash);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePasteExpected = async () => {
    const str = await Clipboard.getStringAsync();
    if (str) {
      setExpectedHash(str.trim());
      if (calculatedHashes) {
        evaluateVerification(calculatedHashes, str.trim());
      }
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolName}
        subtitle="Archive & Files Studio · Universal Workspace D"
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
              <AppIcon name="Hash" size={24} color={Colors.accentSlate} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>{toolName}</Text>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>ID #{initialToolId}</Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>
                {toolConfig?.description || 'Cryptographic integrity verification.'}
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
            style={[styles.tabBtn, activeTab === 'generate' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('generate');
              setVerificationResult(null);
            }}
          >
            <AppIcon
              name="Hash"
              size={16}
              color={activeTab === 'generate' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeTab === 'generate' && styles.tabTextActive]}>
              Generate Hashes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'verify' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('verify');
              if (calculatedHashes && expectedHash.trim()) {
                evaluateVerification(calculatedHashes, expectedHash.trim());
              }
            }}
          >
            <AppIcon
              name="ShieldCheck"
              size={16}
              color={activeTab === 'verify' ? '#FFFFFF' : Colors.onSurface}
            />
            <Text style={[styles.tabText, activeTab === 'verify' && styles.tabTextActive]}>
              Verify Checksum
            </Text>
          </TouchableOpacity>
        </View>

        {/* File Picker */}
        <ArchiveFilePicker
          files={selectedFiles}
          onFilesChange={(files) => {
            setSelectedFiles(files);
            setCalculatedHashes(null);
            setVerificationResult(null);
          }}
          multiple={false}
          title="Select Target File"
          subtitle="Choose any file to verify cryptographic integrity"
        />

        {/* If in Verify Tab, show Expected Hash Input */}
        {activeTab === 'verify' && (
          <View style={styles.card}>
            <View style={styles.inputHeader}>
              <Text style={styles.cardLabel}>Expected Hash (Checksum)</Text>
              <TouchableOpacity onPress={handlePasteExpected} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.pasteText}>Paste from Clipboard</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.hashInput}
              value={expectedHash}
              onChangeText={(text) => {
                setExpectedHash(text);
                if (calculatedHashes && text.trim()) {
                  evaluateVerification(calculatedHashes, text.trim());
                } else {
                  setVerificationResult(null);
                }
              }}
              placeholder="Paste 64-char SHA-256, 40-char SHA-1, or 32-char MD5..."
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        )}

        {/* Verification Outcome Banner */}
        {verificationResult && (
          <View
            style={[
              styles.verifyBanner,
              verificationResult.status === 'match'
                ? styles.verifyBannerMatch
                : styles.verifyBannerMismatch,
            ]}
          >
            <View style={styles.verifyIconBox}>
              <AppIcon
                name={verificationResult.status === 'match' ? 'CheckCircle2' : 'AlertOctagon'}
                size={24}
                color={verificationResult.status === 'match' ? Colors.statusSuccess : Colors.statusError}
              />
            </View>
            <View style={styles.verifyTextGroup}>
              <Text
                style={[
                  styles.verifyTitle,
                  {
                    color:
                      verificationResult.status === 'match'
                        ? Colors.statusSuccess
                        : Colors.statusError,
                  },
                ]}
              >
                {verificationResult.status === 'match'
                  ? 'INTEGRITY VERIFIED: EXACT MATCH'
                  : 'INTEGRITY ALERT: HASH MISMATCH'}
              </Text>
              <Text style={styles.verifySub}>
                {verificationResult.status === 'match'
                  ? `File perfectly matches the expected ${verificationResult.algorithm} hash.`
                  : `Calculated ${verificationResult.algorithm} does not match the provided reference.`}
              </Text>
            </View>
          </View>
        )}

        {/* Generated Hashes List */}
        {calculatedHashes && (
          <View style={styles.hashesCard}>
            <Text style={styles.cardLabel}>Cryptographic Checksums</Text>

            {/* SHA-256 */}
            <View style={styles.hashItem}>
              <View style={styles.hashTop}>
                <Text style={styles.algoBadge}>SHA-256 (Standard)</Text>
                <TouchableOpacity
                  onPress={() => handleCopyHash(calculatedHashes.sha256, 'sha256')}
                  style={styles.copyHashBtn}
                >
                  <AppIcon
                    name={copiedKey === 'sha256' ? 'Check' : 'Copy'}
                    size={12}
                    color={copiedKey === 'sha256' ? Colors.statusSuccess : Colors.onSurface}
                  />
                  <Text style={styles.copyHashText}>
                    {copiedKey === 'sha256' ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hashValue} selectable>
                {calculatedHashes.sha256}
              </Text>
            </View>

            {/* SHA-1 */}
            <View style={styles.hashItem}>
              <View style={styles.hashTop}>
                <Text style={styles.algoBadge}>SHA-1 (Legacy)</Text>
                <TouchableOpacity
                  onPress={() => handleCopyHash(calculatedHashes.sha1, 'sha1')}
                  style={styles.copyHashBtn}
                >
                  <AppIcon
                    name={copiedKey === 'sha1' ? 'Check' : 'Copy'}
                    size={12}
                    color={copiedKey === 'sha1' ? Colors.statusSuccess : Colors.onSurface}
                  />
                  <Text style={styles.copyHashText}>
                    {copiedKey === 'sha1' ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hashValue} selectable>
                {calculatedHashes.sha1}
              </Text>
            </View>

            {/* MD5 */}
            <View style={styles.hashItem}>
              <View style={styles.hashTop}>
                <Text style={styles.algoBadge}>MD5 (RFC 1321)</Text>
                <TouchableOpacity
                  onPress={() => handleCopyHash(calculatedHashes.md5, 'md5')}
                  style={styles.copyHashBtn}
                >
                  <AppIcon
                    name={copiedKey === 'md5' ? 'Check' : 'Copy'}
                    size={12}
                    color={copiedKey === 'md5' ? Colors.statusSuccess : Colors.onSurface}
                  />
                  <Text style={styles.copyHashText}>
                    {copiedKey === 'md5' ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hashValue} selectable>
                {calculatedHashes.md5}
              </Text>
            </View>

            {/* CRC-32 */}
            <View style={styles.hashItem}>
              <View style={styles.hashTop}>
                <Text style={styles.algoBadge}>CRC-32</Text>
                <TouchableOpacity
                  onPress={() => handleCopyHash(calculatedHashes.crc32, 'crc32')}
                  style={styles.copyHashBtn}
                >
                  <AppIcon
                    name={copiedKey === 'crc32' ? 'Check' : 'Copy'}
                    size={12}
                    color={copiedKey === 'crc32' ? Colors.statusSuccess : Colors.onSurface}
                  />
                  <Text style={styles.copyHashText}>
                    {copiedKey === 'crc32' ? 'Copied' : 'Copy'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hashValue} selectable>
                {calculatedHashes.crc32}
              </Text>
            </View>
          </View>
        )}

        {/* Primary Action Button */}
        <PrimaryButton
          title={activeTab === 'verify' ? 'Verify Checksum' : 'Generate File Hashes'}
          onPress={handleComputeHashes}
          loading={isProcessing}
          disabled={selectedFiles.length === 0}
          icon="Hash"
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
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  pasteText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentIndigo,
  },
  hashInput: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 12,
    fontFamily: 'monospace',
    color: Colors.onSurface,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  verifyBanner: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    gap: Spacing.sm + 2,
    alignItems: 'center',
  },
  verifyBannerMatch: {
    backgroundColor: '#F0FDF4',
    borderColor: '#DCFCE7',
  },
  verifyBannerMismatch: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
  },
  verifyIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  verifyTextGroup: {
    flex: 1,
  },
  verifyTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  verifySub: {
    fontSize: 11,
    color: Colors.neutral700,
    marginTop: 2,
  },
  hashesCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.md,
  },
  hashItem: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
    gap: 6,
  },
  hashTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  algoBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.accentSlate,
    backgroundColor: Colors.surfaceArchive,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  copyHashBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  copyHashText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  hashValue: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: Colors.onSurface,
    lineHeight: 16,
  },
});
