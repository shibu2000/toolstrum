import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { useAppStore } from '../../../store/useAppStore';
import {
  getSecurityToolConfig,
  SecurityToolConfig,
} from './securityConfig';
import {
  buildWifiPayload,
  buildVCardPayload,
  buildEmailPayload,
  buildSmsPayload,
  buildPhonePayload,
  generateBarcodeBars,
  generateQrMatrix,
} from './shared/SecurityHelpers';
import { SecurityResultCard, SecurityMetricItem } from './shared/SecurityResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const SecQrGeneratorWorkspace: React.FC<Props> = ({
  initialToolId = 351,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getSecurityToolConfig(activeToolId) || getSecurityToolConfig(351)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // Text / URL / Custom inputs
  const [textInput, setTextInput] = useState('');
  // WiFi
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPass, setWifiPass] = useState('');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  // Contact / vCard
  const [contactFirst, setContactFirst] = useState('');
  const [contactLast, setContactLast] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactOrg, setContactOrg] = useState('');
  // Email
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  // SMS / Phone
  const [phoneNum, setPhoneNum] = useState('');
  const [smsMsg, setSmsMsg] = useState('');
  // Barcode
  const [barcodeText, setBarcodeText] = useState('');
  // Batch
  const [batchInput, setBatchInput] = useState('');

  const payload = useMemo(() => {
    switch (activeMode) {
      case 'qr_wifi':
        return wifiSsid ? buildWifiPayload({ ssid: wifiSsid, password: wifiPass, encryption: wifiEnc }) : '';
      case 'qr_contact':
      case 'qr_vcard':
        return (contactFirst || contactLast || contactPhone || contactEmail)
          ? buildVCardPayload({
              firstName: contactFirst,
              lastName: contactLast,
              phone: contactPhone,
              email: contactEmail,
              organization: contactOrg,
            })
          : '';
      case 'qr_email':
        return emailTo ? buildEmailPayload(emailTo, emailSubject, emailBody) : '';
      case 'qr_sms':
        return phoneNum ? buildSmsPayload(phoneNum, smsMsg) : '';
      case 'qr_phone':
        return phoneNum ? buildPhonePayload(phoneNum) : '';
      case 'barcode_gen':
        return barcodeText;
      case 'qr_batch':
        return batchInput.split('\n')[0] || '';
      default:
        return textInput || '';
    }
  }, [
    activeMode,
    textInput,
    wifiSsid,
    wifiPass,
    wifiEnc,
    contactFirst,
    contactLast,
    contactPhone,
    contactEmail,
    contactOrg,
    emailTo,
    emailSubject,
    emailBody,
    phoneNum,
    smsMsg,
    barcodeText,
    batchInput,
  ]);

  const qrMatrix = useMemo(() => {
    if (activeMode === 'barcode_gen' || !payload.trim()) return undefined;
    return generateQrMatrix(payload, 25);
  }, [payload, activeMode]);

  const barcodeBars = useMemo(() => {
    if (activeMode === 'barcode_gen' && barcodeText.trim()) {
      return generateBarcodeBars(barcodeText);
    }
    return undefined;
  }, [activeMode, barcodeText]);

  const metrics: SecurityMetricItem[] = [
    { label: 'Payload Type', value: activeMode.replace(/_/g, ' ').toUpperCase(), highlight: true },
    { label: 'Payload Size', value: `${payload.length} chars` },
    { label: 'Error Correction', value: 'Level M (15%)' },
    { label: 'Security', value: '100% Offline Generation' },
  ];

  const qrTools = [
    { id: 351, name: 'Standard' },
    { id: 353, name: 'Wi-Fi' },
    { id: 354, name: 'Contact' },
    { id: 355, name: 'URL' },
    { id: 357, name: 'Email' },
    { id: 358, name: 'Phone' },
    { id: 359, name: 'SMS' },
    { id: 360, name: 'vCard' },
    { id: 361, name: 'Barcode' },
    { id: 363, name: 'Customize' },
    { id: 364, name: 'Batch' },
  ];

  return (
    <View style={styles.root}>
      <AppHeader
        title={config.title}
        subtitle="QR, Barcode & Security • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.banner}>
          <AppIcon name="ShieldCheck" size={16} color="#0D9488" />
          <Text style={styles.bannerText}>
            Offline Vector Matrix Engine • No cloud payload uploads
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {qrTools.map((t) => (
            <TouchableOpacity
              key={t.id}
              style={[styles.chip, activeToolId === t.id && styles.chipActive]}
              onPress={() => setActiveToolId(t.id)}
            >
              <Text style={[styles.chipText, activeToolId === t.id && styles.chipTextActive]}>
                {t.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.inputCard}>
          {activeMode === 'qr_wifi' && (
            <View>
              <Text style={styles.inputLabel}>Network SSID</Text>
              <TextInput
                style={styles.textInput}
                value={wifiSsid}
                onChangeText={setWifiSsid}
                placeholder="Wi-Fi Network Name"
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Wi-Fi Password</Text>
              <TextInput
                style={styles.textInput}
                value={wifiPass}
                onChangeText={setWifiPass}
                placeholder="Password"
                secureTextEntry
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Encryption Protocol</Text>
              <View style={styles.encRow}>
                {(['WPA', 'WEP', 'nopass'] as const).map((enc) => (
                  <TouchableOpacity
                    key={enc}
                    style={[styles.encBtn, wifiEnc === enc && styles.encBtnActive]}
                    onPress={() => setWifiEnc(enc)}
                  >
                    <Text style={[styles.encText, wifiEnc === enc && styles.encTextActive]}>
                      {enc === 'nopass' ? 'Open (No pass)' : enc}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(activeMode === 'qr_contact' || activeMode === 'qr_vcard') && (
            <View>
              <View style={styles.rowInputs}>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={contactFirst}
                    onChangeText={setContactFirst}
                  />
                </View>
                <View style={styles.flex1}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={contactLast}
                    onChangeText={setContactLast}
                  />
                </View>
              </View>
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={contactPhone}
                onChangeText={setContactPhone}
                keyboardType="phone-pad"
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Email Address</Text>
              <TextInput
                style={styles.textInput}
                value={contactEmail}
                onChangeText={setContactEmail}
                keyboardType="email-address"
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Company / Organization</Text>
              <TextInput
                style={styles.textInput}
                value={contactOrg}
                onChangeText={setContactOrg}
              />
            </View>
          )}

          {activeMode === 'qr_email' && (
            <View>
              <Text style={styles.inputLabel}>Recipient Email</Text>
              <TextInput
                style={styles.textInput}
                value={emailTo}
                onChangeText={setEmailTo}
                keyboardType="email-address"
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Subject</Text>
              <TextInput
                style={styles.textInput}
                value={emailSubject}
                onChangeText={setEmailSubject}
              />
              <Text style={[styles.inputLabel, { marginTop: 10 }]}>Message Body</Text>
              <TextInput
                style={[styles.textInput, { height: 70 }]}
                value={emailBody}
                onChangeText={setEmailBody}
                multiline
              />
            </View>
          )}

          {(activeMode === 'qr_sms' || activeMode === 'qr_phone') && (
            <View>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.textInput}
                value={phoneNum}
                onChangeText={setPhoneNum}
                keyboardType="phone-pad"
              />
              {activeMode === 'qr_sms' && (
                <View>
                  <Text style={[styles.inputLabel, { marginTop: 10 }]}>Pre-Filled SMS Text</Text>
                  <TextInput
                    style={[styles.textInput, { height: 70 }]}
                    value={smsMsg}
                    onChangeText={setSmsMsg}
                    multiline
                  />
                </View>
              )}
            </View>
          )}

          {activeMode === 'barcode_gen' && (
            <View>
              <Text style={styles.inputLabel}>Barcode Digits / Code 128</Text>
              <TextInput
                style={styles.textInput}
                value={barcodeText}
                onChangeText={setBarcodeText}
              />
              {barcodeBars && (
                <View style={styles.barcodeBox}>
                  <View style={styles.barcodeBarsContainer}>
                    {barcodeBars.bars.map((w, idx) => (
                      <View
                        key={idx}
                        style={[
                          styles.barcodeBar,
                          {
                            width: w * 2,
                            backgroundColor: idx % 2 === 0 ? '#0F172A' : '#FFFFFF',
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={styles.barcodeLabel}>{barcodeText}</Text>
                </View>
              )}
            </View>
          )}

          {activeMode === 'qr_batch' && (
            <View>
              <Text style={styles.inputLabel}>Batch Items (One per line)</Text>
              <TextInput
                style={[styles.textInput, { height: 100 }]}
                value={batchInput}
                onChangeText={setBatchInput}
                multiline
              />
            </View>
          )}

          {activeMode !== 'qr_wifi' &&
            activeMode !== 'qr_contact' &&
            activeMode !== 'qr_vcard' &&
            activeMode !== 'qr_email' &&
            activeMode !== 'qr_sms' &&
            activeMode !== 'qr_phone' &&
            activeMode !== 'barcode_gen' &&
            activeMode !== 'qr_batch' && (
              <View>
                <Text style={styles.inputLabel}>Data to Encode</Text>
                <TextInput
                  style={styles.textInput}
                  value={textInput}
                  onChangeText={setTextInput}
                  placeholder="Enter URL, text, or content"
                />
              </View>
            )}
        </View>

        <SecurityResultCard
          title={config.title}
          subtitle={config.description}
          heroValue={payload || '—'}
          heroLabel={payload ? 'Encoded Payload' : 'Enter data above to generate QR'}
          metrics={metrics}
          breakdownText={payload ? 'High-contrast offline matrix generated with standard 4-module quiet zone.' : 'Fill in the fields above to synthesize a scannable offline code.'}
          qrMatrix={qrMatrix}
          contentToCopy={payload || undefined}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  content: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: Spacing.md,
  },
  bannerText: {
    fontSize: 12,
    color: '#0F766E',
    fontWeight: '500',
  },
  chipsScroll: {
    marginBottom: Spacing.md,
  },
  chipsContent: {
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceWhite,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  chipTextActive: {
    color: Colors.onPrimary,
  },
  inputCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  flex1: {
    flex: 1,
  },
  encRow: {
    flexDirection: 'row',
    gap: 6,
  },
  encBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: Radius.sm,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  encBtnActive: {
    backgroundColor: '#0D9488',
    borderColor: '#0D9488',
  },
  encText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  encTextActive: {
    color: Colors.onPrimary,
  },
  barcodeBox: {
    marginTop: 14,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  barcodeBarsContainer: {
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
  },
  barcodeBar: {
    height: '100%',
  },
  barcodeLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    color: Colors.onSurface,
  },
});
