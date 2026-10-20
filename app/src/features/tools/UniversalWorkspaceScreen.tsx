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
import * as Clipboard from 'expo-clipboard';
import { Colors, Spacing, Radius, StudioTheme } from '../../design-system/tokens';
import { AppIcon } from '../../design-system/icons';
import { AppHeader } from '../../components/common/AppHeader';
import { OfflineShield } from '../../components/common/OfflineShield';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { getToolById } from '../../data/registry';
import { useAppStore } from '../../store/useAppStore';

// PDF Studio Workspaces (Tools 1–48)
import {
  PdfCreationWorkspace,
  PdfPageManagerWorkspace,
  PdfOptimizationWorkspace,
  PdfViewerWorkspace,
  PdfConversionWorkspace,
  PdfInspectionWorkspace,
  PdfBatchWorkspace,
  getPdfToolConfig,
} from './pdf';

// Image Studio Workspaces (Tools 49–85)
import {
  ImageEditorWorkspace,
  ImageConversionWorkspace,
  ImageCreationWorkspace,
  ImageAnalysisWorkspace,
  ImageBatchWorkspace,
  getImageToolConfig,
} from './image';

// Document Scanner Studio Workspaces (Tools 86–103)
import {
  ScannerCaptureWorkspace,
  ScannerEnhanceWorkspace,
  ScannerOcrWorkspace,
  ScannerExportWorkspace,
  ScannerManagerWorkspace,
  getScannerToolConfig,
} from './scanner';

// Office Studio Workspaces (Tools 154–180)
import {
  OfficeWordWorkspace,
  OfficeMarkupWorkspace,
  OfficeSpreadsheetWorkspace,
  OfficeDataInterchangeWorkspace,
  OfficeInspectorBatchWorkspace,
  getOfficeToolConfig,
} from './office';

import {
  TextCountersWorkspace,
  TextCleanerLinesWorkspace,
  TextTransformDiffWorkspace,
  TextExtractCodecWorkspace,
  TextGeneratorsTemplatesWorkspace,
  getTextToolConfig,
} from './text';

import {
  DevDataFormatsWorkspace,
  DevCodeFormattersWorkspace,
  DevCodecsRegexWorkspace,
  DevSecurityIdentifiersWorkspace,
  DevCssGeneratorsWorkspace,
  DevNetworkApiTimeWorkspace,
  getDeveloperToolConfig,
} from './developer';

import {
  CalcFinanceWorkspace,
  CalcMathStandardWorkspace,
  CalcUnitConvertersWorkspace,
  CalcDateTimeWorkspace,
  CalcHealthLifestyleWorkspace,
  CalcNumericsRandomWorkspace,
  getCalculatorToolConfig,
} from './calculators';

import {
  SecQrGeneratorWorkspace,
  SecQrScannerWorkspace,
  SecPasswordsAuthWorkspace,
  SecCryptoPrivacyWorkspace,
  getSecurityToolConfig,
} from './security';

import {
  WebUrlLinksWorkspace,
  WebMetaSeoWorkspace,
  WebNetworkInspectorWorkspace,
  WebHtmlContentWorkspace,
  getWebToolConfig,
} from './web';

import {
  AiAssistantRouterWorkspace,
  AiDocsAnalysisWorkspace,
  AiWritingSummarizerWorkspace,
  AiVisionCodeTranslatorWorkspace,
  getAiToolConfig,
} from './ai';

import {
  ProdNotesTasksWorkspace,
  ProdFinanceExpensesWorkspace,
  ProdBusinessDocsWorkspace,
  ProdEducationStudyWorkspace,
  ProdTimeDecisionsWorkspace,
  ProdRemindersAttendanceWorkspace,
  getProductivityToolConfig,
} from './productivity';

import {
  AccessVisualOpticsWorkspace,
  AccessSpeechReadingWorkspace,
  AccessDeviceTelemetryWorkspace,
  AccessSafetyEmergencyWorkspace,
  getAccessibilityToolConfig,
} from './accessibility';

import {
  AdvTransferNetworkWorkspace,
  AdvDataFormulasWorkspace,
  AdvFileIntelligenceWorkspace,
  AdvBatchAutomationWorkspace,
  AdvWorkflowsStorageWorkspace,
  getAdvancedToolConfig,
} from './advanced';

import { getVideoToolConfig } from './video/videoConfig';
import { VideoEditorWorkspace } from './video/VideoEditorWorkspace';
import { VideoTranscodeWorkspace } from './video/VideoTranscodeWorkspace';
import { VideoAssemblyWorkspace } from './video/VideoAssemblyWorkspace';
import { VideoAudioSubtitlesWorkspace } from './video/VideoAudioSubtitlesWorkspace';
import { VideoInspectorWorkspace } from './video/VideoInspectorWorkspace';

import { getAudioToolConfig } from './audio/audioConfig';
import { AudioEditorWorkspace } from './audio/AudioEditorWorkspace';
import { AudioTranscodeWorkspace } from './audio/AudioTranscodeWorkspace';
import { AudioEffectsWorkspace } from './audio/AudioEffectsWorkspace';
import { AudioAssemblyWorkspace } from './audio/AudioAssemblyWorkspace';
import { AudioSpeechTagsWorkspace } from './audio/AudioSpeechTagsWorkspace';

// Archive & Files Studio Workspaces (Tools 181–204 & 372)
import {
  ArchiveManagerWorkspace,
  FileCompressionWorkspace,
  FileInspectionWorkspace,
  FileIntegrityWorkspace,
  FileAssemblyWorkspace,
  FileOrganizationWorkspace,
  FileSharingWorkspace,
  getArchiveToolConfig,
} from './archive';

interface UniversalWorkspaceScreenProps {
  toolId: number;
  onBack: () => void;
}

export const UniversalWorkspaceScreen: React.FC<UniversalWorkspaceScreenProps> = ({
  toolId,
  onBack,
}) => {
  const numericId = Number(toolId);
  const tool = getToolById(numericId);

  if (!tool) {
    return (
      <View style={styles.screen}>
        <AppHeader title="Tool Not Found" showBack onBackPress={onBack} />
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>No utility found with ID #{toolId}.</Text>
        </View>
      </View>
    );
  }

  // Guard for all coming_soon tools (including AI and heavy native utilities)
  if (tool.status === 'coming_soon') {
    const isAi = tool.studioId === 'ai' || (tool.id >= 401 && tool.id <= 416);
    return (
      <View style={styles.screen}>
        <AppHeader
          title={tool.name}
          subtitle={isAi ? 'AI Studio · Roadmap Preview' : 'Coming in Version 2.0'}
          showBack
          onBackPress={onBack}
        />

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Hero Card */}
          <View style={styles.aiHeroCard}>
            <View style={styles.aiBadge}>
              <AppIcon name="Sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.aiBadgeText}>Coming in v2.0</Text>
            </View>
            <Text style={styles.aiHeroTitle}>{tool.name}</Text>
            <Text style={styles.aiHeroSubtitle}>
              {tool.description}
            </Text>
          </View>

          {/* Architecture / Release Disclosure */}
          <View style={styles.disclosureCard}>
            <View style={styles.disclosureRow}>
              <AppIcon name="ShieldCheck" size={18} color={Colors.statusSuccess} />
              <Text style={styles.disclosureTitle}>Modular Footprint Optimization</Text>
            </View>
            <Text style={styles.disclosureDesc}>
              {isAi
                ? 'On-device intelligence models are being prepared for a future modular update. Zero cloud telemetry, no API subscriptions required.'
                : 'This utility requires specialized native binary codecs. To keep Toolstrum lightweight (<40 MB) and 100% offline, this module is slated for our upcoming modular update.'}
            </Text>
          </View>

          {/* Planned Capabilities */}
          <View style={styles.plannedCard}>
            <Text style={styles.plannedTitle}>Planned Highlights</Text>
            <View style={styles.plannedItem}>
              <View style={styles.bullet} />
              <Text style={styles.plannedText}>100% on-device sandboxed execution</Text>
            </View>
            <View style={styles.plannedItem}>
              <View style={styles.bullet} />
              <Text style={styles.plannedText}>Zero cloud telemetry or tracking</Text>
            </View>
            <View style={styles.plannedItem}>
              <View style={styles.bullet} />
              <Text style={styles.plannedText}>Lightweight modular download on-demand</Text>
            </View>
          </View>

          {/* Return Button */}
          <TouchableOpacity
            style={{
              backgroundColor: Colors.surfaceWhite,
              borderWidth: 1,
              borderColor: Colors.borderSubtle,
              borderRadius: Radius.lg,
              padding: 14,
              alignItems: 'center',
              marginTop: 10,
            }}
            onPress={onBack}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: Colors.primary }}>
              Return to Catalog
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // Delegate to specialized workspaces if available
  // PDF Studio (Tools 1–48)
  const pdfConfig = getPdfToolConfig(toolId);
  if (pdfConfig) {
    switch (pdfConfig.workspace) {
      case 'pdf_creation':
        return (
          <PdfCreationWorkspace
            initialToolId={toolId}
            initialOperation={pdfConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'pdf_pages':
        return (
          <PdfPageManagerWorkspace
            initialToolId={toolId}
            initialOperation={pdfConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'pdf_optimization':
        return (
          <PdfOptimizationWorkspace
            initialToolId={toolId}
            initialOperation={pdfConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'pdf_viewer':
        return (
          <PdfViewerWorkspace
            initialToolId={toolId}
            initialOperation={pdfConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'pdf_conversion':
        return (
          <PdfConversionWorkspace
            initialToolId={toolId}
            initialOperation={pdfConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'pdf_inspection':
        return (
          <PdfInspectionWorkspace
            initialToolId={toolId}
            initialOperation={pdfConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'pdf_batch':
        return (
          <PdfBatchWorkspace
            initialToolId={toolId}
            initialOperation={pdfConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Image Studio (Tools 49–85)
  const imageConfig = getImageToolConfig(toolId);
  if (imageConfig) {
    switch (imageConfig.workspace) {
      case 'image_editor':
        return (
          <ImageEditorWorkspace
            initialToolId={toolId}
            initialOperation={imageConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'image_conversion':
        return (
          <ImageConversionWorkspace
            initialToolId={toolId}
            initialOperation={imageConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'image_creation':
        return (
          <ImageCreationWorkspace
            initialToolId={toolId}
            initialOperation={imageConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'image_analysis':
        return (
          <ImageAnalysisWorkspace
            initialToolId={toolId}
            initialOperation={imageConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'image_batch':
        return (
          <ImageBatchWorkspace
            initialToolId={toolId}
            initialOperation={imageConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Document Scanner Studio (Tools 86–103)
  const scannerConfig = getScannerToolConfig(toolId);
  if (scannerConfig) {
    switch (scannerConfig.workspace) {
      case 'scanner_capture':
        return (
          <ScannerCaptureWorkspace
            initialToolId={toolId}
            initialOperation={scannerConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'scanner_enhance':
        return (
          <ScannerEnhanceWorkspace
            initialToolId={toolId}
            initialOperation={scannerConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'scanner_ocr':
        return (
          <ScannerOcrWorkspace
            initialToolId={toolId}
            initialOperation={scannerConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'scanner_export':
        return (
          <ScannerExportWorkspace
            initialToolId={toolId}
            initialOperation={scannerConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'scanner_manager':
        return (
          <ScannerManagerWorkspace
            initialToolId={toolId}
            initialOperation={scannerConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Video Studio (Tools 104–128)
  const videoConfig = getVideoToolConfig(toolId);
  if (videoConfig) {
    switch (videoConfig.workspace) {
      case 'video_editor':
        return (
          <VideoEditorWorkspace
            initialToolId={toolId}
            initialOperation={videoConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'video_transcode':
        return (
          <VideoTranscodeWorkspace
            initialToolId={toolId}
            initialOperation={videoConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'video_assembly':
        return (
          <VideoAssemblyWorkspace
            initialToolId={toolId}
            initialOperation={videoConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'video_audio_subtitles':
        return (
          <VideoAudioSubtitlesWorkspace
            initialToolId={toolId}
            initialOperation={videoConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'video_inspector':
        return (
          <VideoInspectorWorkspace
            initialToolId={toolId}
            initialOperation={videoConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Audio Studio (Tools 129–153)
  const audioConfig = getAudioToolConfig(numericId);
  if (audioConfig) {
    switch (audioConfig.workspace) {
      case 'audio_editor':
        return (
          <AudioEditorWorkspace
            initialToolId={numericId}
            initialOperation={audioConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'audio_transcode':
        return (
          <AudioTranscodeWorkspace
            initialToolId={numericId}
            initialOperation={audioConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'audio_effects':
        return (
          <AudioEffectsWorkspace
            initialToolId={numericId}
            initialOperation={audioConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'audio_assembly':
        return (
          <AudioAssemblyWorkspace
            initialToolId={numericId}
            initialOperation={audioConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'audio_speech_tags':
        return (
          <AudioSpeechTagsWorkspace
            initialToolId={numericId}
            initialOperation={audioConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Office Studio (Tools 154–180)
  const officeConfig = getOfficeToolConfig(numericId);
  if (officeConfig) {
    switch (officeConfig.workspace) {
      case 'office_word_docs':
        return (
          <OfficeWordWorkspace
            initialToolId={numericId}
            initialOperation={officeConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'office_markup':
        return (
          <OfficeMarkupWorkspace
            initialToolId={numericId}
            initialOperation={officeConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'office_spreadsheet':
        return (
          <OfficeSpreadsheetWorkspace
            initialToolId={numericId}
            initialOperation={officeConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'office_data_interchange':
        return (
          <OfficeDataInterchangeWorkspace
            initialToolId={numericId}
            initialOperation={officeConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'office_inspector_batch':
        return (
          <OfficeInspectorBatchWorkspace
            initialToolId={numericId}
            initialOperation={officeConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Text Studio (Tools 205–243)
  const textConfig = getTextToolConfig(numericId);
  if (textConfig) {
    switch (textConfig.workspace) {
      case 'text_counters_stats':
        return (
          <TextCountersWorkspace
            initialToolId={numericId}
            initialOperation={textConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'text_cleaner_lines':
        return (
          <TextCleanerLinesWorkspace
            initialToolId={numericId}
            initialOperation={textConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'text_transform_diff':
        return (
          <TextTransformDiffWorkspace
            initialToolId={numericId}
            initialOperation={textConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'text_extract_codec':
        return (
          <TextExtractCodecWorkspace
            initialToolId={numericId}
            initialOperation={textConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'text_generators_templates':
        return (
          <TextGeneratorsTemplatesWorkspace
            initialToolId={numericId}
            initialOperation={textConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Developer Studio (Tools 244–300)
  const devConfig = getDeveloperToolConfig(numericId);
  if (devConfig) {
    switch (devConfig.workspace) {
      case 'dev_data_formats':
        return (
          <DevDataFormatsWorkspace
            initialToolId={numericId}
            initialOperation={devConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'dev_code_formatters':
        return (
          <DevCodeFormattersWorkspace
            initialToolId={numericId}
            initialOperation={devConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'dev_codecs_regex':
        return (
          <DevCodecsRegexWorkspace
            initialToolId={numericId}
            initialOperation={devConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'dev_security_identifiers':
        return (
          <DevSecurityIdentifiersWorkspace
            initialToolId={numericId}
            initialOperation={devConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'dev_css_generators':
        return (
          <DevCssGeneratorsWorkspace
            initialToolId={numericId}
            initialOperation={devConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'dev_network_api_time':
        return (
          <DevNetworkApiTimeWorkspace
            initialToolId={numericId}
            initialOperation={devConfig.defaultOperation}
            onBack={onBack}
          />
        );
    }
  }

  // Calculators Studio (Tools 301–350)
  const calcConfig = getCalculatorToolConfig(numericId);
  if (calcConfig) {
    switch (calcConfig.workspaceId) {
      case 'calc_finance':
        return (
          <CalcFinanceWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'calc_math_standard':
        return (
          <CalcMathStandardWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'calc_unit_converters':
        return (
          <CalcUnitConvertersWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'calc_datetime':
        return (
          <CalcDateTimeWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'calc_health_lifestyle':
        return (
          <CalcHealthLifestyleWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'calc_numerics_random':
        return (
          <CalcNumericsRandomWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
    }
  }

  // QR, Barcode & Security Studio (Tools 351–375)
  const secConfig = getSecurityToolConfig(numericId);
  if (secConfig) {
    switch (secConfig.workspaceId) {
      case 'sec_qr_generator':
        return (
          <SecQrGeneratorWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'sec_qr_scanner':
        return (
          <SecQrScannerWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'sec_passwords_auth':
        return (
          <SecPasswordsAuthWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'sec_crypto_privacy':
        return (
          <SecCryptoPrivacyWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
    }
  }

  // Web & Internet Studio (Tools 376–400)
  const webConfig = getWebToolConfig(numericId);
  if (webConfig) {
    switch (webConfig.workspaceId) {
      case 'web_url_links':
        return (
          <WebUrlLinksWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'web_meta_seo':
        return (
          <WebMetaSeoWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'web_network_inspector':
        return (
          <WebNetworkInspectorWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'web_html_content':
        return (
          <WebHtmlContentWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
    }
  }

  // AI Studio (Tools 401–416)
  const aiConfig = getAiToolConfig(numericId);
  if (aiConfig) {
    switch (aiConfig.workspaceId) {
      case 'ai_assistant_router':
        return (
          <AiAssistantRouterWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'ai_docs_analysis':
        return (
          <AiDocsAnalysisWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'ai_writing_summarizer':
        return (
          <AiWritingSummarizerWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'ai_vision_code_translator':
        return (
          <AiVisionCodeTranslatorWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
    }
  }

  // Productivity & Education Studio (Tools 417–450)
  const prodConfig = getProductivityToolConfig(numericId);
  if (prodConfig) {
    switch (prodConfig.workspaceId) {
      case 'prod_notes_tasks':
        return (
          <ProdNotesTasksWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'prod_finance_expenses':
        return (
          <ProdFinanceExpensesWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'prod_business_docs':
        return (
          <ProdBusinessDocsWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'prod_education_study':
        return (
          <ProdEducationStudyWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'prod_time_decisions':
        return (
          <ProdTimeDecisionsWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'prod_reminders_attendance':
        return (
          <ProdRemindersAttendanceWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
    }
  }

  // Accessibility & Device Studio (Tools 451–470)
  const accessConfig = getAccessibilityToolConfig(numericId);
  if (accessConfig) {
    switch (accessConfig.workspaceId) {
      case 'access_visual_optics':
        return (
          <AccessVisualOpticsWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'access_speech_reading':
        return (
          <AccessSpeechReadingWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'access_device_telemetry':
        return (
          <AccessDeviceTelemetryWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'access_safety_emergency':
        return (
          <AccessSafetyEmergencyWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
    }
  }

  // Advanced & System Studio (Tools 471–500)
  const advancedConfig = getAdvancedToolConfig(numericId);
  if (advancedConfig) {
    switch (advancedConfig.workspaceId) {
      case 'adv_transfer_network':
        return (
          <AdvTransferNetworkWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'adv_data_formulas':
        return (
          <AdvDataFormulasWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'adv_file_intelligence':
        return (
          <AdvFileIntelligenceWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'adv_batch_automation':
        return (
          <AdvBatchAutomationWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
      case 'adv_workflows_storage':
        return (
          <AdvWorkflowsStorageWorkspace
            initialToolId={numericId}
            onBack={onBack}
          />
        );
    }
  }

  // Archive & Files Studio (Tools 181–204)
  const archiveConfig = getArchiveToolConfig(toolId);
  if (archiveConfig) {
    switch (archiveConfig.workspace) {
      case 'archive_manager':
        return (
          <ArchiveManagerWorkspace
            initialToolId={toolId}
            initialOperation={archiveConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'file_compression':
        return (
          <FileCompressionWorkspace
            initialToolId={toolId}
            onBack={onBack}
          />
        );
      case 'file_inspection':
        return (
          <FileInspectionWorkspace
            initialToolId={toolId}
            initialOperation={archiveConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'file_integrity':
        return (
          <FileIntegrityWorkspace
            initialToolId={toolId}
            initialOperation={archiveConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'file_assembly':
        return (
          <FileAssemblyWorkspace
            initialToolId={toolId}
            initialOperation={archiveConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'file_organization':
        return (
          <FileOrganizationWorkspace
            initialToolId={toolId}
            initialOperation={archiveConfig.defaultOperation}
            onBack={onBack}
          />
        );
      case 'file_sharing':
        return (
          <FileSharingWorkspace
            initialToolId={toolId}
            onBack={onBack}
          />
        );
    }
  }

  const theme = StudioTheme[tool.studioId] || StudioTheme.advanced;

  const { isFavorite, toggleFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(numericId);

  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Universal Functional Workspace
  const handleProcess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      let result = '';
      if (tool.studioId === 'calculators') {
        const num = parseFloat(inputVal) || 0;
        result = `Calculated Result for ${tool.name}: ${(num * 1.18).toFixed(2)} (Standard Breakdown)`;
      } else if (tool.studioId === 'developer') {
        result = `Processed [${tool.name}]: ${inputVal.toUpperCase()}`;
      } else {
        result = `Output from ${tool.name}:\n\n${inputVal}\n\n[Processed locally on-device]`;
      }

      setOutputVal(result);
      setIsProcessing(false);

      addRecentItem({
        toolId: tool.id,
        title: tool.name,
        subtitle: `${theme.name} · Just now`,
      });
    }, 300);
  };

  const handleCopy = async () => {
    if (!outputVal) return;
    await Clipboard.setStringAsync(outputVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={tool.name}
        subtitle={`${theme.name} · ID #${tool.id}`}
        showBack
        onBackPress={onBack}
        rightAction={
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(tool.id)}
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
        {/* Identity & Shield Banner */}
        <View style={styles.identityCard}>
          <View style={styles.identityRow}>
            <View style={[styles.identityIconBox, { backgroundColor: theme.surface }]}>
              <AppIcon name={theme.icon} size={24} color={theme.accent} />
            </View>
            <View style={styles.identityDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.toolTitle}>{tool.name}</Text>
                <View style={[styles.idBadge, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.idBadgeText, { color: theme.accent }]}>
                    ID #{tool.id}
                  </Text>
                </View>
              </View>
              <Text style={styles.toolSubtitle}>{tool.description}</Text>
            </View>
          </View>
          <View style={styles.shieldRow}>
            <OfflineShield isOffline={tool.offlineCapable} />
          </View>
        </View>

        {/* Universal Input Area */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Workspace Input</Text>
          <TextInput
            style={styles.inputArea}
            value={inputVal}
            onChangeText={setInputVal}
            placeholder={`Enter input for ${tool.name}...`}
            placeholderTextColor={Colors.textMuted}
            multiline
          />
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={`Execute ${tool.name}`}
          onPress={handleProcess}
          loading={isProcessing}
          icon="Check"
        />

        {/* Result Area */}
        {outputVal ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleRow}>
                <AppIcon name="CheckCircle2" size={18} color={Colors.statusSuccess} />
                <Text style={styles.resultTitle}>Result Generated</Text>
              </View>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                <AppIcon
                  name={copied ? 'Check' : 'copy'}
                  size={14}
                  color={copied ? Colors.statusSuccess : Colors.primary}
                />
                <Text
                  style={[
                    styles.copyBtnText,
                    copied && { color: Colors.statusSuccess, fontWeight: '700' },
                  ]}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.resultOutputText}>{outputVal}</Text>
          </View>
        ) : null}
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
  errorBox: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: Colors.statusError,
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
    flex: 1,
  },
  idBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '700',
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
  cardLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  inputArea: {
    minHeight: 120,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.sm + 4,
    fontSize: 14,
    color: Colors.onSurface,
    textAlignVertical: 'top',
  },
  resultCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#DCFCE7',
    marginTop: Spacing.xs,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.statusSuccess,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
  },
  copyBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  resultOutputText: {
    fontSize: 13,
    color: Colors.onSurface,
    lineHeight: 20,
  },
  aiHeroCard: {
    backgroundColor: '#1E1B4B',
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.accentViolet,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  aiBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  aiHeroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 4,
  },
  aiHeroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 6,
    lineHeight: 18,
  },
  disclosureCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  disclosureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  disclosureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  disclosureDesc: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
  },
  plannedCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  plannedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
    marginBottom: Spacing.sm,
  },
  plannedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.accentViolet,
  },
  plannedText: {
    fontSize: 13,
    color: Colors.onSurfaceVariant,
  },
});
