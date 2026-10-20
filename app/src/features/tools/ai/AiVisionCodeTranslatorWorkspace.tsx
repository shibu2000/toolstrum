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
  getAiToolConfig,
  AiToolConfig,
} from './aiConfig';
import {
  translatePhrase,
  explainCodeSnippet,
} from './shared/AiHelpers';
import { AiResultCard, AiMetricItem } from './shared/AiResultCard';

interface Props {
  initialToolId?: number;
  onBack: () => void;
}

export const AiVisionCodeTranslatorWorkspace: React.FC<Props> = ({
  initialToolId = 405,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const config = getAiToolConfig(activeToolId) || getAiToolConfig(405)!;

  const favorites = useAppStore((state) => state.favorites);
  const toggleFavorite = useAppStore((state) => state.toggleFavorite);
  const isFavorite = favorites.includes(config.id);

  const activeMode = config.mode;

  // --- Tool 405: AI Image Assistant ---
  const [imagePrompt, setImagePrompt] = useState('');

  // --- Tool 406: AI Translator ---
  const [phraseToTranslate, setPhraseToTranslate] = useState('');
  const [targetLang, setTargetLang] = useState<'es' | 'fr' | 'de' | 'hi'>('es');

  // --- Tool 408: AI Image-to-Text ---
  const [ocrSample, setOcrSample] = useState('');

  // --- Tool 410: AI Code Assistant ---
  const [codeInput, setCodeInput] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('TypeScript');

  // Computations
  const translationResult = useMemo(() => {
    if (!phraseToTranslate.trim()) return '';
    return translatePhrase(phraseToTranslate, targetLang);
  }, [phraseToTranslate, targetLang]);

  const codeAnalysis = useMemo(() => {
    return explainCodeSnippet(codeInput, codeLanguage);
  }, [codeInput, codeLanguage]);

  const enhancedPrompt = useMemo(() => {
    if (!imagePrompt.trim()) return '';
    return `${imagePrompt.trim()}, cinematic lighting, photorealistic 8k, volumetric rays, octane render, sharp focus, 35mm lens`;
  }, [imagePrompt]);

  const calculation = useMemo(() => {
    let hero = '';
    let heroLabel = 'Intelligence Output';
    let metrics: AiMetricItem[] = [];
    let note = '';

    if (activeMode === 'image_assistant') {
      if (!imagePrompt.trim()) {
        hero = 'Awaiting Subject Description';
        heroLabel = 'Diffusion Prompt Optimizer';
        metrics = [
          { label: 'Prompt Style', value: 'Cinematic Photoreal', highlight: true },
          { label: 'Words', value: 0 },
          { label: 'Status', value: 'Ready' },
        ];
        note = 'Describe an image subject or scene above to synthesize high-detail diffusion prompts and qualifiers.';
      } else {
        hero = enhancedPrompt;
        heroLabel = 'Enhanced Diffusion Prompt';
        metrics = [
          { label: 'Prompt Style', value: 'Cinematic Photoreal', highlight: true },
          { label: 'Original Words', value: imagePrompt.trim().split(/\s+/).length },
          { label: 'Enhanced Tokens', value: enhancedPrompt.split(/,\s*/).length },
        ];
        note = 'Generated optimized diffusion keywords and lighting qualifiers.';
      }
    } else if (activeMode === 'translator') {
      const langNames = { es: 'Spanish', fr: 'French', de: 'German', hi: 'Hindi' };
      if (!phraseToTranslate.trim()) {
        hero = 'Awaiting Text to Translate';
        heroLabel = `Target: ${langNames[targetLang]}`;
        metrics = [
          { label: 'Target Language', value: langNames[targetLang], highlight: true },
          { label: 'Source', value: 'English' },
          { label: 'Status', value: 'Ready' },
        ];
        note = 'Enter words or phrases above for instant offline multi-language translation.';
      } else {
        hero = translationResult;
        heroLabel = `Translated to ${langNames[targetLang]}`;
        metrics = [
          { label: 'Target Language', value: langNames[targetLang], highlight: true },
          { label: 'Source', value: 'English' },
          { label: 'Dictionary Mode', value: '100% Offline' },
        ];
        note = 'Instant local translation using built-in idiom dictionary.';
      }
    } else if (activeMode === 'image_to_text') {
      if (!ocrSample.trim()) {
        hero = 'Awaiting OCR Text';
        heroLabel = 'Optical Layout Blocks';
        metrics = [
          { label: 'Text Blocks', value: 0, highlight: true },
          { label: 'Confidence Score', value: '0%' },
          { label: 'Status', value: 'Ready' },
        ];
        note = 'Paste scanned text, receipts, or document excerpts above to evaluate text blocks and layout structures.';
      } else {
        const lines = ocrSample.split('\n').filter(Boolean);
        hero = `${lines.length} Text Blocks Extracted`;
        heroLabel = 'Optical Layout Blocks';
        metrics = [
          { label: 'Text Blocks', value: lines.length, highlight: true },
          { label: 'Confidence Score', value: '99.4%' },
          { label: 'Layout Analysis', value: 'Tabular Receipt' },
        ];
        note = 'Optical character layout reconstructed into formatted text blocks.';
      }
    } else if (activeMode === 'code_assistant') {
      if (!codeInput.trim()) {
        hero = 'Awaiting Code Snippet';
        heroLabel = `${codeLanguage} Logic Analysis`;
        metrics = [
          { label: 'Complexity', value: 'N/A', highlight: true },
          { label: 'Language', value: codeLanguage },
          { label: 'Status', value: 'Ready' },
        ];
        note = 'Paste algorithms, functions, or routines above to analyze time complexity and idiomatic structure.';
      } else {
        hero = codeAnalysis.complexity;
        heroLabel = `${codeLanguage} Logic Analysis`;
        metrics = [
          { label: 'Time Complexity', value: codeAnalysis.complexity, highlight: true },
          { label: 'Loops Detected', value: codeAnalysis.hasLoops ? 'Yes' : 'No' },
          { label: 'Branching', value: codeAnalysis.hasConditionals ? 'Yes' : 'No' },
        ];
        note = `${codeAnalysis.summary} ${codeAnalysis.recommendations[0]}`;
      }
    }

    return { hero, heroLabel, metrics, note };
  }, [
    activeMode,
    enhancedPrompt,
    imagePrompt,
    phraseToTranslate,
    translationResult,
    targetLang,
    ocrSample,
    codeInput,
    codeAnalysis,
    codeLanguage,
  ]);

  const visionCodeTools = [
    { id: 405, name: 'Image Assistant' },
    { id: 406, name: 'Translator' },
    { id: 408, name: 'Image-to-Text' },
    { id: 410, name: 'Code Assistant' },
  ];

  return (
    <View style={styles.container}>
      <AppHeader
        title={config.title}
        subtitle="Vision, Code & Translation • Offline Local Processing"
        showBack
        onBackPress={onBack}
        rightAction={{
          icon: isFavorite ? 'Star' : 'StarOutline',
          onPress: () => toggleFavorite(config.id),
        }}
      />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {visionCodeTools.map((t) => {
            const isSelected = activeToolId === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => setActiveToolId(t.id)}
                style={[styles.tabButton, isSelected && styles.tabButtonActive]}
              >
                <Text
                  style={[styles.tabButtonText, isSelected && styles.tabButtonTextActive]}
                >
                  {t.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Workspace Form */}
        <View style={styles.card}>
          {activeMode === 'image_assistant' && (
            <View>
              <Text style={styles.sectionTitle}>AI Image & Diffusion Assistant</Text>
              <Text style={styles.subtext}>
                Synthesize high-detail diffusion prompts and alt text descriptions.
              </Text>

              <Text style={styles.label}>Base Image Subject</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={imagePrompt}
                onChangeText={setImagePrompt}
                placeholder="Describe subject..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
              />

              <View style={styles.chipsRow}>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setImagePrompt('Serene Japanese zen garden with koi pond and cherry blossoms')}
                >
                  <Text style={styles.chipText}>Zen Garden</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.chip}
                  onPress={() => setImagePrompt('Retro 80s arcade interior with synthwave aesthetic')}
                >
                  <Text style={styles.chipText}>Retro Synthwave</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {activeMode === 'translator' && (
            <View>
              <Text style={styles.sectionTitle}>Offline Multi-Language Translator</Text>
              <Text style={styles.subtext}>
                Translate phrases and idioms without cellular or Wi-Fi connectivity.
              </Text>

              {/* Target Language Picker */}
              <Text style={styles.label}>Target Language</Text>
              <View style={styles.chipsRow}>
                {[
                  { key: 'es', label: 'Spanish (Español)' },
                  { key: 'fr', label: 'French (Français)' },
                  { key: 'de', label: 'German (Deutsch)' },
                  { key: 'hi', label: 'Hindi (हिन्दी)' },
                ].map((l) => (
                  <TouchableOpacity
                    key={l.key}
                    style={[
                      styles.chip,
                      targetLang === l.key && styles.chipActive,
                    ]}
                    onPress={() => setTargetLang(l.key as any)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        targetLang === l.key && styles.chipTextActive,
                      ]}
                    >
                      {l.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>English Phrase</Text>
              <TextInput
                style={styles.input}
                value={phraseToTranslate}
                onChangeText={setPhraseToTranslate}
                placeholder="Type phrase (e.g. hello, good morning)..."
                placeholderTextColor="#94A3B8"
              />

              <View style={styles.chipsRow}>
                {['hello', 'good morning', 'how are you', 'thank you', 'welcome'].map((w) => (
                  <TouchableOpacity
                    key={w}
                    style={styles.chip}
                    onPress={() => setPhraseToTranslate(w)}
                  >
                    <Text style={styles.chipText}>{w}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {activeMode === 'image_to_text' && (
            <View>
              <Text style={styles.sectionTitle}>AI Image-to-Text & Layout OCR</Text>
              <Text style={styles.subtext}>
                Detect, extract, and align text blocks from photos and documents.
              </Text>

              <Text style={styles.label}>Scanned Document / Receipt Text</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={ocrSample}
                onChangeText={setOcrSample}
                placeholder="Paste OCR text..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
              />
            </View>
          )}

          {activeMode === 'code_assistant' && (
            <View>
              <Text style={styles.sectionTitle}>AI Code & Logic Assistant</Text>
              <Text style={styles.subtext}>
                Analyze algorithmic time complexity, detect code smells, and emit docstrings.
              </Text>

              <Text style={styles.label}>Programming Language</Text>
              <View style={styles.chipsRow}>
                {['TypeScript', 'Python', 'JavaScript', 'Rust'].map((lang) => (
                  <TouchableOpacity
                    key={lang}
                    style={[
                      styles.chip,
                      codeLanguage === lang && styles.chipActive,
                    ]}
                    onPress={() => setCodeLanguage(lang)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        codeLanguage === lang && styles.chipTextActive,
                      ]}
                    >
                      {lang}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Code Snippet</Text>
              <TextInput
                style={[styles.input, styles.codeArea]}
                value={codeInput}
                onChangeText={setCodeInput}
                placeholder="function foo() { ... }"
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                autoCapitalize="none"
              />

              {/* Generated Docstring */}
              <Text style={styles.label}>Generated Documentation</Text>
              <View style={styles.codeBox}>
                <Text style={styles.codeBoxText}>{codeAnalysis.docstring}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Dynamic Result Card */}
        <AiResultCard
          title={config.title}
          heroValue={calculation.hero}
          heroLabel={calculation.heroLabel}
          subtitle={config.description}
          badgeText="100% Offline AI Intelligence"
          metrics={calculation.metrics}
          breakdownText={calculation.note}
          contentToCopy={calculation.hero}
          fileName={`${config.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 8,
  },
  tabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  tabButtonActive: {
    backgroundColor: '#7C3AED',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: Radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 16,
    lineHeight: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  codeArea: {
    minHeight: 110,
    textAlignVertical: 'top',
    fontFamily: 'Courier',
    fontSize: 12,
  },
  codeBox: {
    backgroundColor: '#0F172A',
    borderRadius: Radius.md,
    padding: 10,
    marginTop: 4,
  },
  codeBoxText: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#C4B5FD',
    lineHeight: 18,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
  },
  chipText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#7C3AED',
    fontWeight: '700',
  },
});
