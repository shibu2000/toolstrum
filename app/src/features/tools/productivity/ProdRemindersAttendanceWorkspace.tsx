import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import {
  PRODUCTIVITY_WORKSPACES,
  PRODUCTIVITY_TOOL_CONFIGS,
  getProductivityWorkspaceTools,
} from './productivityConfig';
import { ProductivityResultCard } from './shared/ProductivityResultCard';
import {
  generateVCardPayload,
  analyzeBirthday,
  calculateDateSpan,
  WORLD_HOLIDAYS,
  VCardContact,
} from './shared/ProductivityHelpers';

interface ProdRemindersAttendanceWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface ExpiryDoc {
  id: string;
  type: string;
  title: string;
  expiryDate: string;
}

interface AttendeeRecord {
  id: string;
  attendeeName: string;
  sessionId: string;
  timestamp: string;
}

export const ProdRemindersAttendanceWorkspace: React.FC<ProdRemindersAttendanceWorkspaceProps> = ({
  initialToolId = 439,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = PRODUCTIVITY_WORKSPACES.prod_reminders_attendance;
  const workspaceTools = getProductivityWorkspaceTools('prod_reminders_attendance');

  // Contact vCard QR state
  const [contact, setContact] = useState<VCardContact>({
    fullName: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  });

  // Barcode Inventory state
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [newSku, setNewSku] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newQty, setNewQty] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Expiry documents state
  const [docs, setDocs] = useState<ExpiryDoc[]>([]);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDate, setNewDocDate] = useState('');

  // Birthday reminder state
  const [birthdayName, setBirthdayName] = useState('');
  const [birthdateStr, setBirthdateStr] = useState('');

  // QR Attendance Generator state
  const [sessionTitle, setSessionTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [sessionDate, setSessionDate] = useState('');

  // QR Attendance Scanner / Roster state
  const [attendeeRoster, setAttendeeRoster] = useState<AttendeeRecord[]>([]);
  const [simAttendeeName, setSimAttendeeName] = useState('');

  // Helpers
  const vCardPayload = generateVCardPayload(contact);
  const birthdayAnalysis = analyzeBirthday(birthdateStr);

  const addInventoryItem = () => {
    if (!newItemName.trim() || !newSku.trim()) return;
    setInventory([
      ...inventory,
      {
        id: Date.now().toString(),
        sku: newSku.trim(),
        name: newItemName.trim(),
        quantity: parseInt(newQty) || 1,
        unitPrice: parseFloat(newPrice) || 0,
      },
    ]);
    setNewSku('');
    setNewItemName('');
  };

  const addDoc = () => {
    if (!newDocTitle.trim()) return;
    setDocs([
      ...docs,
      {
        id: Date.now().toString(),
        type: 'Document',
        title: newDocTitle.trim(),
        expiryDate: newDocDate,
      },
    ]);
    setNewDocTitle('');
  };

  const checkDocStatus = (expStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const span = calculateDateSpan(today, expStr);
    if (span.isPast) return { label: 'EXPIRED', color: '#DC2626', days: 0 };
    if (span.totalDays < 30) return { label: 'EXPIRING SOON', color: '#D97706', days: span.totalDays };
    return { label: 'VALID', color: '#059669', days: span.totalDays };
  };

  const generatedAttendanceToken = `ATTEND_PASS|${courseCode}|${sessionTitle}|${sessionDate}|AUTH_TOKEN_${Date.now().toString(36).toUpperCase()}`;

  const simulateScanCheckIn = () => {
    if (!simAttendeeName.trim()) {
      Alert.alert('Empty Name', 'Please enter attendee name to check in.');
      return;
    }
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAttendeeRoster([
      {
        id: Date.now().toString(),
        attendeeName: simAttendeeName.trim(),
        sessionId: courseCode,
        timestamp: timeStr,
      },
      ...attendeeRoster,
    ]);
    setSimAttendeeName('');
    Alert.alert('Checked In', `Recorded ${simAttendeeName.trim()} in attendance roster.`);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title={PRODUCTIVITY_TOOL_CONFIGS[activeToolId]?.name || 'Reminders & Attendance'}
        subtitle={`${workspaceMeta.title} • Offline Local`}
        showBack
        onBackPress={onBack}
      />

      <View style={styles.selectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.selectorScroll}
          contentContainerStyle={styles.selectorBar}
        >
          {workspaceTools.map((tool) => {
            const cfg = PRODUCTIVITY_TOOL_CONFIGS[tool.id];
            const isSelected = tool.id === activeToolId;
            return (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolPill,
                  isSelected && styles.toolPillActive,
                ]}
                onPress={() => setActiveToolId(tool.id)}
              >
                <Text
                  style={[
                    styles.toolPillText,
                    isSelected && styles.toolPillTextActive,
                  ]}
                >
                  {cfg?.badge || tool.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <OfflineShield studioName="Productivity" />

        {/* TOOL 439: QR Contact Card */}
        {activeToolId === 439 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>QR Contact Card (vCard)</Text>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={contact.fullName}
                placeholder="e.g. Sophia Chen"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={(t) => setContact({ ...contact, fullName: t })}
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    value={contact.phone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="phone-pad"
                    onChangeText={(t) => setContact({ ...contact, phone: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={contact.email}
                    placeholder="email@example.com"
                    placeholderTextColor={Colors.textTertiary}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={(t) => setContact({ ...contact, email: t })}
                  />
                </View>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Job Title</Text>
                  <TextInput
                    style={styles.input}
                    value={contact.title}
                    placeholder="e.g. Engineer"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={(t) => setContact({ ...contact, title: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Company</Text>
                  <TextInput
                    style={styles.input}
                    value={contact.company}
                    placeholder="e.g. Acme Corp"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={(t) => setContact({ ...contact, company: t })}
                  />
                </View>
              </View>
            </View>

            <ProductivityResultCard
              title={contact.fullName || 'Contact vCard'}
              badge="Ready for QR Encoding"
              primaryValue={contact.phone || contact.email || 'No contact details entered'}
              primarySubtext={`${contact.title || 'No Title'}${contact.company ? ' • ' + contact.company : ''}`}
              details={vCardPayload}
              metadata={[
                { label: 'Name', value: contact.fullName || 'None' },
                { label: 'Company', value: contact.company || 'None' },
                { label: 'Email', value: contact.email || 'None' },
                { label: 'Standard', value: 'vCard 3.0 RFC' },
              ]}
              copyContent={vCardPayload}
            />
          </View>
        )}

        {/* TOOL 440: Barcode Inventory List */}
        {activeToolId === 440 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Inventory Stock & SKU Tracker</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newSku}
                  onChangeText={setNewSku}
                  placeholder="SKU-XXXX"
                />
                <TextInput
                  style={[styles.input, { flex: 2 }]}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Item Name"
                />
              </View>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newQty}
                  onChangeText={setNewQty}
                  keyboardType="numeric"
                  placeholder="Qty"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newPrice}
                  onChangeText={setNewPrice}
                  keyboardType="numeric"
                  placeholder="Price"
                />
                <TouchableOpacity style={styles.addBtn} onPress={addInventoryItem}>
                  <AppIcon name="Plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subheading}>Tracked SKUs ({inventory.length})</Text>
              {inventory.map((item) => {
                const isLow = item.quantity <= 5;
                return (
                  <View key={item.id} style={styles.invRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.invName}>{item.name}</Text>
                      <Text style={styles.invSku}>{item.sku} • ${item.unitPrice.toFixed(2)} each</Text>
                    </View>
                    <View style={[styles.qtyBadge, isLow && styles.qtyBadgeLow]}>
                      <Text style={[styles.qtyText, isLow && styles.qtyTextLow]}>
                        {item.quantity} in Stock {isLow ? '⚠️ LOW' : ''}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <ProductivityResultCard
              title="Inventory Valuation"
              badge="Stock Control"
              primaryValue={`Total Value: $${inventory.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0).toFixed(2)}`}
              primarySubtext={`${inventory.filter((i) => i.quantity <= 5).length} Items with Low Stock Alert`}
              details={inventory
                .map((i) => `• [${i.sku}] ${i.name}: ${i.quantity} units ($${(i.quantity * i.unitPrice).toFixed(2)})`)
                .join('\n')}
              metadata={[
                { label: 'Total Items', value: `${inventory.reduce((sum, i) => sum + i.quantity, 0)} Units` },
                { label: 'SKU Count', value: `${inventory.length}` },
              ]}
              copyContent={inventory.map((i) => `${i.sku}: ${i.name} (${i.quantity} units)`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 441: Document Expiry Reminder */}
        {activeToolId === 441 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Document Expiry Tracker</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 2 }]}
                  value={newDocTitle}
                  onChangeText={setNewDocTitle}
                  placeholder="Document Title (e.g. Visa)"
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={newDocDate}
                  onChangeText={setNewDocDate}
                  placeholder="YYYY-MM-DD"
                />
                <TouchableOpacity style={styles.addBtn} onPress={addDoc}>
                  <AppIcon name="Plus" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subheading}>Monitored Documents</Text>
              {docs.map((doc) => {
                const status = checkDocStatus(doc.expiryDate);
                return (
                  <View key={doc.id} style={styles.docRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.docTitle}>{doc.title}</Text>
                      <Text style={styles.docMeta}>Expires: {doc.expiryDate}</Text>
                    </View>
                    <View style={[styles.statusBadge, { borderColor: status.color }]}>
                      <Text style={[styles.statusText, { color: status.color }]}>
                        {status.label} ({status.days}d)
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <ProductivityResultCard
              title="Document Expiration Status"
              badge="Compliance & Alerts"
              primaryValue={`${docs.length} Documents Monitored`}
              primarySubtext={`${docs.filter((d) => checkDocStatus(d.expiryDate).label !== 'VALID').length} Actionable Items`}
              details={docs
                .map((d) => `• ${d.title}: Expires ${d.expiryDate} [${checkDocStatus(d.expiryDate).label}]`)
                .join('\n')}
              metadata={[
                { label: 'Total Docs', value: `${docs.length}` },
                { label: 'Active', value: `${docs.filter((d) => checkDocStatus(d.expiryDate).label === 'VALID').length}` },
              ]}
              copyContent={docs.map((d) => `${d.title}: ${d.expiryDate}`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 442: Birthday Reminder */}
        {activeToolId === 442 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Birthday & Milestone Tracker</Text>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={birthdayName}
                placeholder="e.g. Alexander Wright"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setBirthdayName}
              />
              <Text style={styles.label}>Birthdate (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={birthdateStr}
                placeholder="YYYY-MM-DD (e.g. 1994-11-18)"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setBirthdateStr}
              />
            </View>

            <ProductivityResultCard
              title={birthdayName ? `Birthday for ${birthdayName}` : 'Birthday & Milestone'}
              badge="Milestone Analysis"
              primaryValue={birthdateStr ? `${birthdayAnalysis.daysUntilNext} Days Until Next Birthday` : 'Enter a birthdate above'}
              primarySubtext={birthdateStr ? `Turning ${birthdayAnalysis.age + 1} on a ${birthdayAnalysis.dayOfWeekNext}` : 'Offline Zodiac & Milestone Analysis'}
              details={birthdateStr ? `Birthday Profile:\n• Current Age: ${birthdayAnalysis.age} years old\n• Next Milestone: ${birthdayAnalysis.age + 1} years\n• Astrological Zodiac Sign: ♊ ${birthdayAnalysis.zodiacSign}\n• Countdown: ${birthdayAnalysis.daysUntilNext} calendar days remaining` : 'Enter a valid birthdate to calculate zodiac, milestone age, and countdown.'}
              metadata={[
                { label: 'Current Age', value: birthdateStr ? `${birthdayAnalysis.age} yrs` : '—' },
                { label: 'Days Left', value: birthdateStr ? `${birthdayAnalysis.daysUntilNext}` : '—' },
                { label: 'Zodiac', value: birthdateStr ? birthdayAnalysis.zodiacSign : '—' },
                { label: 'Day of Week', value: birthdateStr ? birthdayAnalysis.dayOfWeekNext : '—' },
              ]}
              copyContent={birthdateStr ? `${birthdayName || 'Contact'}: ${birthdayAnalysis.age} yrs, next in ${birthdayAnalysis.daysUntilNext} days` : ''}
            />
          </View>
        )}

        {/* TOOL 443: World Holiday Calendar */}
        {activeToolId === 443 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>International World Holidays</Text>
              <Text style={styles.label}>Major Annual Holidays & Observances</Text>
              <View style={{ gap: 6, marginTop: 6 }}>
                {WORLD_HOLIDAYS.slice(0, 8).map((h, idx) => (
                  <View key={idx} style={styles.holidayRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.holidayName}>{h.name}</Text>
                      <Text style={styles.holidayRegion}>{h.region} • {h.category}</Text>
                    </View>
                    <Text style={styles.holidayDate}>{h.date}</Text>
                  </View>
                ))}
              </View>
            </View>

            <ProductivityResultCard
              title="Global Holiday Directory"
              badge="Cultural Calendar"
              primaryValue={`${WORLD_HOLIDAYS.length} Major Holidays Cataloged`}
              primarySubtext="Global, Cultural, and National Observances"
              details={WORLD_HOLIDAYS.map((h) => `• ${h.date}: ${h.name} (${h.region})`).join('\n')}
              metadata={[
                { label: 'Holidays', value: `${WORLD_HOLIDAYS.length}` },
                { label: 'Dataset', value: 'Offline ISO' },
              ]}
              copyContent={WORLD_HOLIDAYS.map((h) => `${h.date}: ${h.name}`).join('\n')}
            />
          </View>
        )}

        {/* TOOL 449: QR Attendance Generator */}
        {activeToolId === 449 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>QR Attendance Pass Generator</Text>
              <Text style={styles.label}>Session / Meeting Title</Text>
              <TextInput
                style={styles.input}
                value={sessionTitle}
                placeholder="e.g. CS 401: Distributed Systems"
                placeholderTextColor={Colors.textTertiary}
                onChangeText={setSessionTitle}
              />
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Session Code</Text>
                  <TextInput
                    style={styles.input}
                    value={courseCode}
                    placeholder="e.g. CS401-01"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setCourseCode}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Date</Text>
                  <TextInput
                    style={styles.input}
                    value={sessionDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textTertiary}
                    onChangeText={setSessionDate}
                  />
                </View>
              </View>
            </View>

            <ProductivityResultCard
              title={sessionTitle || 'Session Pass'}
              badge="QR Pass Payload"
              primaryValue={courseCode ? `Session: ${courseCode}` : 'Configure Session Info'}
              primarySubtext={sessionDate ? `Valid for ${sessionDate}` : 'Enter session date above'}
              details={generatedAttendanceToken}
              metadata={[
                { label: 'Code', value: courseCode || 'None' },
                { label: 'Date', value: sessionDate || 'None' },
                { label: 'Security', value: 'Encrypted Token' },
              ]}
              copyContent={generatedAttendanceToken}
            />
          </View>
        )}

        {/* TOOL 450: QR Attendance Scanner */}
        {activeToolId === 450 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Attendance Scanner & Roster</Text>
              <Text style={styles.label}>Attendee Check-In Simulation</Text>
              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={simAttendeeName}
                  onChangeText={setSimAttendeeName}
                  placeholder="Student / Attendee Name"
                />
                <TouchableOpacity style={styles.addBtn} onPress={simulateScanCheckIn}>
                  <AppIcon name="QrCode" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <Text style={styles.subheading}>Checked-In Attendees ({attendeeRoster.length})</Text>
              {attendeeRoster.map((att) => (
                <View key={att.id} style={styles.attRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attName}>{att.attendeeName}</Text>
                    <Text style={styles.attSession}>Session: {att.sessionId}</Text>
                  </View>
                  <Text style={styles.attTime}>{att.timestamp}</Text>
                </View>
              ))}
            </View>

            <ProductivityResultCard
              title="Attendance Roster"
              badge="Verified Check-In"
              primaryValue={`${attendeeRoster.length} Attendees Checked In`}
              primarySubtext={`Active Session: ${courseCode}`}
              details={attendeeRoster
                .map((a, i) => `${i + 1}. ${a.attendeeName} - Checked in at ${a.timestamp}`)
                .join('\n')}
              metadata={[
                { label: 'Total Present', value: `${attendeeRoster.length}` },
                { label: 'Session', value: courseCode },
              ]}
              copyContent={attendeeRoster.map((a) => `${a.attendeeName} (${a.timestamp})`).join('\n')}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  selectorWrapper: {
    height: 52,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#FBCFE8',
    justifyContent: 'center',
  },
  selectorScroll: {
    height: 52,
    flexGrow: 0,
  },
  selectorBar: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toolPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: Radius.full,
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FCE7F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolPillActive: {
    backgroundColor: '#DB2777',
    borderColor: '#BE185D',
  },
  toolPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9D174D',
  },
  toolPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#FBCFE8',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#831843',
    marginBottom: Spacing.sm,
  },
  subheading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#9D174D',
    marginTop: Spacing.sm,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#9D174D',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#FDF2F8',
    borderWidth: 1,
    borderColor: '#FBCFE8',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    fontSize: 14,
    color: '#1E293B',
    marginBottom: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    width: 44,
    height: 44,
    backgroundColor: '#DB2777',
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    padding: 8,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  invName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  invSku: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  qtyBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  qtyBadgeLow: {
    backgroundColor: '#FEF3C7',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  qtyTextLow: {
    color: '#D97706',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    padding: 8,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  docTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  docMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
  },
  holidayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    padding: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  holidayName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  holidayRegion: {
    fontSize: 11,
    color: '#64748B',
  },
  holidayDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DB2777',
  },
  attRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FDF2F8',
    padding: 8,
    borderRadius: Radius.md,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#FCE7F3',
  },
  attName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  attSession: {
    fontSize: 11,
    color: '#64748B',
  },
  attTime: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
});
