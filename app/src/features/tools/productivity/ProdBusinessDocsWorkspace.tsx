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
  formatInvoiceDocument,
  generateVCardPayload,
  formatResumeText,
  InvoiceData,
  VCardContact,
  ResumeData,
} from './shared/ProductivityHelpers';

interface ProdBusinessDocsWorkspaceProps {
  initialToolId?: number;
  onBack?: () => void;
}

export const ProdBusinessDocsWorkspace: React.FC<ProdBusinessDocsWorkspaceProps> = ({
  initialToolId = 424,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const workspaceMeta = PRODUCTIVITY_WORKSPACES.prod_business_docs;
  const workspaceTools = getProductivityWorkspaceTools('prod_business_docs');

  // Invoice / Receipt / Quotation shared state
  const [invNum, setInvNum] = useState('');
  const [senderName, setSenderName] = useState('');
  const [clientName, setClientName] = useState('');
  const [dueDate, setDueDate] = useState('Net 30 Days');
  const [taxPercent, setTaxPercent] = useState('0');
  const [discountVal, setDiscountVal] = useState('0');
  const [items, setItems] = useState<{ description: string; quantity: number; unitPrice: number }[]>([]);

  // Business Card / vCard state
  const [vCard, setVCard] = useState<VCardContact>({
    fullName: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  });

  // Resume state
  const [resume, setResume] = useState<ResumeData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: [],
    experience: [],
    education: [],
  });

  // Cover Letter state
  const [coverRecipient, setCoverRecipient] = useState('');
  const [coverCompany, setCoverCompany] = useState('');
  const [coverRole, setCoverRole] = useState('');
  const [coverHighlight, setCoverHighlight] = useState('');

  // Engines
  const invoiceData: InvoiceData = {
    invoiceNumber: invNum,
    senderName,
    clientName,
    dueDate,
    taxRatePercent: parseFloat(taxPercent) || 0,
    discountAmount: parseFloat(discountVal) || 0,
    items,
  };
  const invoiceRes = formatInvoiceDocument(invoiceData);

  const vCardPayload = generateVCardPayload(vCard);
  const resumeText = formatResumeText(resume);

  const coverLetterText = [
    `Dear ${coverRecipient},`,
    '',
    `I am writing to express my strong enthusiasm for the ${coverRole} position at ${coverCompany}. With a proven track record of architecting resilient, production-grade applications, I am eager to contribute to your technical mission.`,
    '',
    `Throughout my career, I have specialized in ${coverHighlight}. I bring a rigorous approach to system performance, user privacy, and zero-compromise architectural standards that aligns directly with your team's objectives.`,
    '',
    `Thank you for your time and consideration. I welcome the opportunity to discuss how my background will benefit ${coverCompany}.`,
    '',
    `Sincerely,`,
    resume.fullName,
  ].join('\n');

  return (
    <View style={styles.container}>
      <AppHeader
        title={PRODUCTIVITY_TOOL_CONFIGS[activeToolId]?.name || 'Business & Career'}
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

        {/* TOOL 424: Invoice Generator & 425: Receipt & 426: Quotation */}
        {(activeToolId === 424 || activeToolId === 425 || activeToolId === 426) && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>
                {activeToolId === 424
                  ? 'Commercial Invoice Generator'
                  : activeToolId === 425
                  ? 'Payment Receipt Generator'
                  : 'Commercial Quotation Generator'}
              </Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Document Ref #</Text>
                  <TextInput
                    style={styles.input}
                    value={invNum}
                    onChangeText={setInvNum}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Due Date / Term</Text>
                  <TextInput
                    style={styles.input}
                    value={dueDate}
                    onChangeText={setDueDate}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Sender / Business</Text>
                  <TextInput
                    style={styles.input}
                    value={senderName}
                    onChangeText={setSenderName}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Client Name</Text>
                  <TextInput
                    style={styles.input}
                    value={clientName}
                    onChangeText={setClientName}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Tax Rate (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={taxPercent}
                    onChangeText={setTaxPercent}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Discount ($)</Text>
                  <TextInput
                    style={styles.input}
                    value={discountVal}
                    onChangeText={setDiscountVal}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            <ProductivityResultCard
              title={
                activeToolId === 424
                  ? `Invoice ${invNum}`
                  : activeToolId === 425
                  ? `Receipt for ${clientName}`
                  : `Quotation ${invNum}`
              }
              badge="Structured Document"
              primaryValue={`Grand Total: $${invoiceRes.grandTotal.toFixed(2)}`}
              primarySubtext={`Subtotal: $${invoiceRes.subtotal.toFixed(2)} • Tax: $${invoiceRes.taxAmount.toFixed(2)}`}
              details={invoiceRes.formattedText}
              metadata={[
                { label: 'Document Ref', value: invNum },
                { label: 'Client', value: clientName },
                { label: 'Subtotal', value: `$${invoiceRes.subtotal.toFixed(2)}` },
                { label: 'Due / Terms', value: dueDate },
              ]}
              copyContent={invoiceRes.formattedText}
            />
          </View>
        )}

        {/* TOOL 427: Business Card Maker */}
        {activeToolId === 427 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Digital Business Card (vCard)</Text>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={vCard.fullName}
                onChangeText={(t) => setVCard({ ...vCard, fullName: t })}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Job Title</Text>
                  <TextInput
                    style={styles.input}
                    value={vCard.title}
                    onChangeText={(t) => setVCard({ ...vCard, title: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Company</Text>
                  <TextInput
                    style={styles.input}
                    value={vCard.company}
                    onChangeText={(t) => setVCard({ ...vCard, company: t })}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={vCard.phone}
                    onChangeText={(t) => setVCard({ ...vCard, phone: t })}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={vCard.email}
                    onChangeText={(t) => setVCard({ ...vCard, email: t })}
                  />
                </View>
              </View>
            </View>

            <ProductivityResultCard
              title={vCard.fullName}
              badge="Standard vCard 3.0"
              subtitle={`${vCard.title} at ${vCard.company}`}
              primaryValue={vCard.email}
              primarySubtext={`Tel: ${vCard.phone}`}
              details={vCardPayload}
              metadata={[
                { label: 'Phone', value: vCard.phone },
                { label: 'Company', value: vCard.company },
                { label: 'Title', value: vCard.title },
                { label: 'Format', value: 'RFC 2426 vCard' },
              ]}
              copyContent={vCardPayload}
            />
          </View>
        )}

        {/* TOOL 428: Resume PDF Maker */}
        {activeToolId === 428 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Resume Builder</Text>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={resume.fullName}
                onChangeText={(t) => setResume({ ...resume, fullName: t })}
              />

              <Text style={styles.label}>Executive Summary</Text>
              <TextInput
                style={[styles.input, { minHeight: 70 }]}
                value={resume.summary}
                onChangeText={(t) => setResume({ ...resume, summary: t })}
                multiline
              />

              <Text style={styles.label}>Key Technical Skills (comma separated)</Text>
              <TextInput
                style={styles.input}
                value={resume.skills.join(', ')}
                onChangeText={(t) =>
                  setResume({
                    ...resume,
                    skills: t.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
              />
            </View>

            <ProductivityResultCard
              title={`${resume.fullName} — Resume`}
              badge="Professional Resume"
              primaryValue={`${resume.skills.length} Technical Skills Listed`}
              primarySubtext={`${resume.experience.length} Experience Roles • ${resume.education.length} Degrees`}
              details={resumeText}
              metadata={[
                { label: 'Candidate', value: resume.fullName },
                { label: 'Location', value: resume.location },
                { label: 'Contact', value: resume.email },
                { label: 'Roles', value: `${resume.experience.length} Positions` },
              ]}
              copyContent={resumeText}
            />
          </View>
        )}

        {/* TOOL 429: Cover Letter Generator */}
        {activeToolId === 429 && (
          <View>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Cover Letter Generator</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Target Company</Text>
                  <TextInput
                    style={styles.input}
                    value={coverCompany}
                    onChangeText={setCoverCompany}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Target Role</Text>
                  <TextInput
                    style={styles.input}
                    value={coverRole}
                    onChangeText={setCoverRole}
                  />
                </View>
              </View>

              <Text style={styles.label}>Recipient Name / Title</Text>
              <TextInput
                style={styles.input}
                value={coverRecipient}
                onChangeText={setCoverRecipient}
              />

              <Text style={styles.label}>Core Value Proposition / Highlight</Text>
              <TextInput
                style={styles.input}
                value={coverHighlight}
                onChangeText={setCoverHighlight}
              />
            </View>

            <ProductivityResultCard
              title={`Application for ${coverRole}`}
              badge="Tailored Cover Letter"
              primaryValue={`Addressed to: ${coverCompany}`}
              primarySubtext={`Recipient: ${coverRecipient}`}
              details={coverLetterText}
              metadata={[
                { label: 'Target Role', value: coverRole },
                { label: 'Company', value: coverCompany },
              ]}
              copyContent={coverLetterText}
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
});
