import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { useAppStore } from '../../../store/useAppStore';
import {
  generateUuidV4,
  generateUlid,
  generateCryptoHashes,
  generateHmac,
  generatePassword,
  inspectBcrypt,
  inspectQrPayload,
  inspectCertificatePem,
} from './shared/DeveloperHelpers';
import { DevResultCard, DevStatItem } from './shared/DevResultCard';
import { getDeveloperToolConfig } from './developerConfig';

interface DevSecurityIdentifiersWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

const DEFAULT_SAMPLE_BCRYPT = '$2a$12$e8uq5e5qE4X11Z8R.mFvKuYfQ3eN5G6h7i8j9k0l1m2n3o4p5q6r7';
const DEFAULT_SAMPLE_CERT = `-----BEGIN CERTIFICATE-----
MIIEczCCA1ugAwIBAgIBADANBgkqhkiG9w0BAQsFADASMRAwDgYDVQQDDAdSb290
Q0EwHhcNMjYwMTAxMDAwMDAwWhcNMjYxMjMxMjM1OTU5WjASMRAwDgYDVQQDDAdS
b290Q0EwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7...
-----END CERTIFICATE-----`;

export const DevSecurityIdentifiersWorkspace: React.FC<DevSecurityIdentifiersWorkspaceProps> = ({
  initialToolId = 274,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  // States
  const [uuidCount, setUuidCount] = useState<number>(3);
  const [uuidUppercase, setUuidUppercase] = useState<boolean>(false);
  const [ulidCount, setUlidCount] = useState<number>(3);
  const [hashInput, setHashInput] = useState<string>('');
  const [hmacMessage, setHmacMessage] = useState<string>('');
  const [hmacKey, setHmacKey] = useState<string>('');
  const [passLength, setPassLength] = useState<number>(16);
  const [passUpper, setPassUpper] = useState<boolean>(true);
  const [passLower, setPassLower] = useState<boolean>(true);
  const [passNumbers, setPassNumbers] = useState<boolean>(true);
  const [passSymbols, setPassSymbols] = useState<boolean>(true);
  const [bcryptHash, setBcryptHash] = useState<string>('');
  const [qrPayload, setQrPayload] = useState<string>('');
  const [certPem, setCertPem] = useState<string>('');

  const [seed, setSeed] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getDeveloperToolConfig(activeToolId);

  // Processed Output calculation
  const { output, statItems } = useMemo(() => {
    switch (activeToolId) {
      case 274: {
        const list: string[] = [];
        for (let i = 0; i < uuidCount; i++) {
          const u = generateUuidV4();
          list.push(uuidUppercase ? u.toUpperCase() : u);
        }
        return {
          output: list.join('\n'),
          statItems: [
            { label: 'Count', value: uuidCount },
            { label: 'Version', value: 'UUID v4' },
          ],
        };
      }
      case 275: {
        const list: string[] = [];
        for (let i = 0; i < ulidCount; i++) {
          list.push(generateUlid(Date.now() + i * 100));
        }
        return {
          output: list.join('\n'),
          statItems: [
            { label: 'Count', value: ulidCount },
            { label: 'Format', value: '26-char Crockford Base32' },
          ],
        };
      }
      case 276: {
        if (!hashInput.trim()) {
          return {
            output: 'Enter text above to compute SHA-256, SHA-1, and MD5 cryptographic digests.',
            statItems: [
              { label: 'Algorithms', value: '3 Ready' },
              { label: 'Input Length', value: 0 },
            ],
          };
        }
        const hashes = generateCryptoHashes(hashInput);
        const report = `SHA-256:\n${hashes.sha256}\n\nSHA-1:\n${hashes.sha1}\n\nMD5:\n${hashes.md5}`;
        return {
          output: report,
          statItems: [
            { label: 'Algorithms', value: '3 Digested' },
            { label: 'Input Length', value: hashInput.length },
          ],
        };
      }
      case 277: {
        if (!hmacMessage.trim() || !hmacKey.trim()) {
          return {
            output: 'Enter both message payload and secret key above to generate HMAC signature.',
            statItems: [
              { label: 'Algorithm', value: 'HMAC-SHA256' },
              { label: 'Digest Length', value: 0 },
            ],
          };
        }
        const hmac = generateHmac(hmacMessage, hmacKey);
        const report = `HMAC-SHA256 Signature:\n${hmac}\n\nMessage: ${hmacMessage}\nKey: ${hmacKey}`;
        return {
          output: report,
          statItems: [
            { label: 'Algorithm', value: 'HMAC-SHA256' },
            { label: 'Digest Length', value: hmac.length },
          ],
        };
      }
      case 278: {
        const pwd = generatePassword(passLength, {
          upper: passUpper,
          lower: passLower,
          numbers: passNumbers,
          symbols: passSymbols,
        });
        return {
          output: pwd.password,
          statItems: [
            { label: 'Length', value: passLength },
            { label: 'Entropy', value: `${pwd.entropyBits} bits` },
            { label: 'Strength', value: pwd.strength },
          ],
        };
      }
      case 279: {
        if (!bcryptHash.trim()) {
          return {
            output: 'Enter a Bcrypt hash string above to inspect cost factor and salt.',
            statItems: [
              { label: 'Valid', value: '—' },
              { label: 'Cost Factor', value: '—' },
            ],
          };
        }
        const parsed = inspectBcrypt(bcryptHash);
        const report = parsed.valid
          ? `Bcrypt Hash Audit:\n- Valid: Yes\n- Algorithm: ${parsed.algorithm}\n- Cost (Rounds): 2^${parsed.cost} (${Math.pow(2, parsed.cost)} iterations)\n- Salt: ${parsed.salt}`
          : 'Invalid Bcrypt hash format. Expected standard $2a$, $2b$, or $2y$ prefix.';
        return {
          output: report,
          statItems: [
            { label: 'Valid', value: parsed.valid ? 'YES' : 'NO' },
            { label: 'Cost Factor', value: parsed.cost ? `2^${parsed.cost}` : 'N/A' },
          ],
        };
      }
      case 298: {
        if (!qrPayload.trim()) {
          return {
            output: 'Enter a QR payload or schema string above to inspect attributes.',
            statItems: [
              { label: 'Schema', value: 'None' },
              { label: 'Raw Length', value: 0 },
            ],
          };
        }
        const qr = inspectQrPayload(qrPayload);
        const detailsStr = Object.entries(qr.details)
          .map(([k, v]) => `- ${k}: ${v}`)
          .join('\n');
        return {
          output: `Type: ${qr.type}\nTitle: ${qr.title}\n\nParsed Attributes:\n${detailsStr}`,
          statItems: [
            { label: 'Schema', value: qr.type },
            { label: 'Raw Length', value: qrPayload.length },
          ],
        };
      }
      case 299: {
        if (!certPem.trim()) {
          return {
            output: 'Paste an X.509 certificate in PEM format above to inspect subject and expiry dates.',
            statItems: [
              { label: 'Valid', value: '—' },
              { label: 'Format', value: 'X.509 PEM' },
            ],
          };
        }
        const cert = inspectCertificatePem(certPem);
        const report = cert.valid
          ? `X.509 Certificate Metadata:\n- Common Name: ${cert.commonName}\n- Issuer: ${cert.issuer}\n- Valid From: ${cert.validFrom}\n- Valid To: ${cert.validTo}`
          : 'Invalid PEM Certificate format. Missing standard boundary markers.';
        return {
          output: report,
          statItems: [
            { label: 'Valid', value: cert.valid ? 'YES' : 'NO' },
            { label: 'Format', value: 'X.509 PEM' },
          ],
        };
      }
      default:
        return { output: '', statItems: [] };
    }
  }, [
    activeToolId,
    seed,
    uuidCount,
    uuidUppercase,
    ulidCount,
    hashInput,
    hmacMessage,
    hmacKey,
    passLength,
    passUpper,
    passLower,
    passNumbers,
    passSymbols,
    bcryptHash,
    qrPayload,
    certPem,
  ]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'Security identifier saved to local workspace.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'Security Tool'} Output`,
      subtitle: `${output.length} characters generated`,
    });
  };

  const toolsInWorkspace = [
    { id: 274, name: 'UUID Generator' },
    { id: 275, name: 'ULID Generator' },
    { id: 276, name: 'Hash Generator' },
    { id: 277, name: 'HMAC Generator' },
    { id: 278, name: 'Password Gen' },
    { id: 279, name: 'Bcrypt Checker' },
    { id: 298, name: 'QR Inspector' },
    { id: 299, name: 'Cert Inspector' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'Security & Identifiers'}
        subtitle="Developer Tools · Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(activeToolId)}
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

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield />

        {/* Workspace tool selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pillScroll}
          contentContainerStyle={styles.pillContainer}
        >
          {toolsInWorkspace.map((item) => {
            const isActive = item.id === activeToolId;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.pill, isActive && styles.pillActive]}
                onPress={() => setActiveToolId(item.id)}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 274 UUID Controls */}
        {activeToolId === 274 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>UUID Options</Text>
            <View style={styles.rowWrap}>
              <Text style={styles.label}>Count: {uuidCount}</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setUuidCount(Math.max(1, uuidCount - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setUuidCount(uuidCount + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[styles.smallPill, uuidUppercase && styles.smallPillActive]}
                onPress={() => setUuidUppercase(!uuidUppercase)}
              >
                <Text
                  style={[styles.smallPillText, uuidUppercase && styles.smallPillTextActive]}
                >
                  Uppercase
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.regenBtn} onPress={() => setSeed(Date.now())}>
              <AppIcon name="RefreshCw" size={14} color={Colors.accentSky} />
              <Text style={styles.regenBtnText}>Regenerate UUIDs</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 275 ULID Controls */}
        {activeToolId === 275 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>ULID Options</Text>
            <View style={styles.rowWrap}>
              <Text style={styles.label}>Count: {ulidCount}</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setUlidCount(Math.max(1, ulidCount - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setUlidCount(ulidCount + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.regenBtn} onPress={() => setSeed(Date.now())}>
              <AppIcon name="RefreshCw" size={14} color={Colors.accentSky} />
              <Text style={styles.regenBtnText}>Regenerate ULIDs</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 276 Hash Input */}
        {activeToolId === 276 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Input Text to Hash</Text>
            <TextInput
              style={styles.singleInput}
              value={hashInput}
              onChangeText={setHashInput}
              placeholder="String to digest..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 277 HMAC Inputs */}
        {activeToolId === 277 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>HMAC Parameters</Text>
            <TextInput
              style={styles.singleInput}
              value={hmacMessage}
              onChangeText={setHmacMessage}
              placeholder="Message payload..."
              placeholderTextColor={Colors.textMuted}
            />
            <TextInput
              style={[styles.singleInput, { marginTop: 6 }]}
              value={hmacKey}
              onChangeText={setHmacKey}
              placeholder="Secret Key..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 278 Password Generator Controls */}
        {activeToolId === 278 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Password Configuration</Text>
            <View style={styles.rowWrap}>
              <Text style={styles.label}>Length: {passLength}</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setPassLength(Math.max(6, passLength - 1))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setPassLength(passLength + 1)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              {[12, 16, 24, 32].map((l) => (
                <TouchableOpacity
                  key={l}
                  style={[styles.smallPill, passLength === l && styles.smallPillActive]}
                  onPress={() => setPassLength(l)}
                >
                  <Text
                    style={[styles.smallPillText, passLength === l && styles.smallPillTextActive]}
                  >
                    {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.togglesGrid}>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>A-Z Upper</Text>
                <Switch
                  value={passUpper}
                  onValueChange={setPassUpper}
                  trackColor={{ false: '#E2E8F0', true: Colors.accentSky }}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>0-9 Numbers</Text>
                <Switch
                  value={passNumbers}
                  onValueChange={setPassNumbers}
                  trackColor={{ false: '#E2E8F0', true: Colors.accentSky }}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>!@# Symbols</Text>
                <Switch
                  value={passSymbols}
                  onValueChange={setPassSymbols}
                  trackColor={{ false: '#E2E8F0', true: Colors.accentSky }}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.regenBtn} onPress={() => setSeed(Date.now())}>
              <AppIcon name="RefreshCw" size={14} color={Colors.accentSky} />
              <Text style={styles.regenBtnText}>Generate New Password</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 279 Bcrypt Input */}
        {activeToolId === 279 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Bcrypt Hash String</Text>
            <TextInput
              style={styles.singleInput}
              value={bcryptHash}
              onChangeText={setBcryptHash}
              placeholder="$2a$12$..."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 298 QR Payload Input */}
        {activeToolId === 298 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>QR Code Scanned Payload</Text>
            <TextInput
              style={styles.singleInput}
              value={qrPayload}
              onChangeText={setQrPayload}
              placeholder="WIFI:S:..., https://..., etc."
              placeholderTextColor={Colors.textMuted}
            />
          </View>
        )}

        {/* 299 Certificate Input */}
        {activeToolId === 299 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>X.509 Certificate PEM</Text>
            <TextInput
              style={styles.textInput}
              multiline
              value={certPem}
              onChangeText={setCertPem}
              placeholder="-----BEGIN CERTIFICATE-----"
              placeholderTextColor={Colors.textMuted}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Result Card */}
        <DevResultCard
          title={toolConfig?.name || 'Output Result'}
          subtitle={toolConfig?.description}
          badgeText="Cryptographic Verification"
          stats={statItems}
          content={output}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="security-identifiers.txt"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.surfaceBackground,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  favBtn: {
    padding: 6,
  },
  pillScroll: {
    marginBottom: Spacing.sm,
  },
  pillContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  pillActive: {
    backgroundColor: Colors.accentSky,
    borderColor: Colors.accentSky,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  pillTextActive: {
    color: Colors.surfaceWhite,
  },
  card: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: 6,
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  stepperBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceBackground,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  smallPillActive: {
    backgroundColor: Colors.accentSky,
    borderColor: Colors.accentSky,
  },
  smallPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  smallPillTextActive: {
    color: Colors.surfaceWhite,
  },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: Colors.surfaceDeveloper,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.sm,
  },
  regenBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.accentSky,
  },
  togglesGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 12,
    color: Colors.onSurface,
    fontWeight: '500',
  },
  singleInput: {
    height: 38,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    fontSize: 13,
    fontFamily: 'Courier',
    color: Colors.onSurface,
    backgroundColor: '#FAFAFA',
  },
  textInput: {
    minHeight: 90,
    fontSize: 12,
    fontFamily: 'Courier',
    color: Colors.onSurface,
    lineHeight: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
});
