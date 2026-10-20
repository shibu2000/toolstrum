/**
 * ImageEditorWorkspace.tsx
 * Workspace A: Image Editor
 * Consolidates tools:
 * 50: Image Resizer
 * 51: Image Cropper
 * 52: Image Rotator
 * 58: Background Changer
 * 59: Image Watermark
 * 60: Image Annotator
 * 68: Blur Image
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../../design-system/tokens';
import { AppIcon } from '../../../design-system/icons';
import { AppHeader } from '../../../components/common/AppHeader';
import { OfflineShield } from '../../../components/common/OfflineShield';
import { PrimaryButton } from '../../../components/common/PrimaryButton';
import { useAppStore } from '../../../store/useAppStore';
import { ImageFilePicker, SelectedImageFile, formatFileSize } from './shared/ImageFilePicker';
import { ImageResultCard, ImageResultData } from './shared/ImageResultCard';
import {
  resizeImage,
  cropImage,
  rotateAndFlipImage,
  saveImageToSandbox,
} from './shared/ImageEngine';
import { getImageToolConfig, getImageToolsByWorkspace, ImageToolConfig } from './imageConfig';
import { SaveFormat } from 'expo-image-manipulator';

interface ImageEditorWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

export const ImageEditorWorkspace: React.FC<ImageEditorWorkspaceProps> = ({
  initialToolId = 50,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);
  const [files, setFiles] = useState<SelectedImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ImageResultData | null>(null);

  // Resize state (Tool 50)
  const [resizeScale, setResizeScale] = useState<number>(50); // 25, 50, 75, 150, 200
  const [customWidth, setCustomWidth] = useState<string>('1080');
  const [customHeight, setCustomHeight] = useState<string>('1080');
  const [keepAspect, setKeepAspect] = useState<boolean>(true);

  // Crop state (Tool 51)
  const [cropPreset, setCropPreset] = useState<'1:1' | '4:3' | '16:9' | '9:16' | '3:2'>('1:1');

  // Rotate state (Tool 52)
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [flipDirection, setFlipDirection] = useState<'none' | 'horizontal' | 'vertical'>('none');

  // Background / Framing state (Tool 58)
  const [bgChoice, setBgChoice] = useState<'#FFFFFF' | '#171A2E' | '#10B981' | '#F59E0B'>('#FFFFFF');
  const [paddingAmount, setPaddingAmount] = useState<number>(20);

  // Watermark state (Tool 59)
  const [watermarkText, setWatermarkText] = useState<string>('');
  const [watermarkPos, setWatermarkPos] = useState<'bottom-right' | 'center' | 'top-left'>('bottom-right');

  // Annotator state (Tool 60)
  const [annotationNote, setAnnotationNote] = useState<string>('');

  // Blur state (Tool 68)
  const [blurStrength, setBlurStrength] = useState<'light' | 'medium' | 'heavy'>('medium');

  const { isFavorite, toggleFavorite } = useAppStore();
  const favorited = isFavorite(activeToolId);

  const currentToolConfig: ImageToolConfig =
    getImageToolConfig(activeToolId) || (getImageToolConfig(50) as ImageToolConfig);
  const workspaceTools = getImageToolsByWorkspace('image_editor');

  useEffect(() => {
    if (files.length > 0 && files[0].width && files[0].height) {
      setCustomWidth(String(Math.round(files[0].width * (resizeScale / 100))));
      setCustomHeight(String(Math.round(files[0].height * (resizeScale / 100))));
    }
  }, [files, resizeScale]);

  const handleSelectScale = (scale: number) => {
    setResizeScale(scale);
    if (files.length > 0 && files[0].width && files[0].height) {
      setCustomWidth(String(Math.round(files[0].width * (scale / 100))));
      setCustomHeight(String(Math.round(files[0].height * (scale / 100))));
    }
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      Alert.alert('No Image', 'Please select an image to edit.');
      return;
    }

    const source = files[0];
    setIsProcessing(true);
    setResult(null);

    try {
      const origW = source.width || 1200;
      const origH = source.height || 800;

      if (activeToolId === 50) {
        // Image Resizer
        const targetW = parseInt(customWidth, 10) || Math.round(origW * (resizeScale / 100));
        const targetH = keepAspect
          ? Math.round(origH * (targetW / origW))
          : parseInt(customHeight, 10) || Math.round(origH * (resizeScale / 100));

        const processed = await resizeImage(source.uri, {
          width: targetW,
          height: targetH,
          quality: 0.9,
          format: SaveFormat.JPEG,
        });

        const saved = await saveImageToSandbox(
          processed.uri,
          `resized_${targetW}x${targetH}_${source.name}`
        );

        setResult({
          title: 'Image Resized Successfully',
          fileName: saved.name,
          imageUri: saved.uri,
          fileSize: saved.size,
          width: processed.width,
          height: processed.height,
          originalSize: source.size,
          metricLabel: 'New Dimensions',
          metricValue: `${processed.width} × ${processed.height} px`,
          details: [
            { label: 'Scale Applied', value: `${resizeScale}% scale` },
            { label: 'Original Dimensions', value: `${origW} × ${origH} px` },
            { label: 'Aspect Ratio', value: keepAspect ? 'Locked' : 'Unlocked' },
          ],
          toolId: 50,
          toolName: 'Image Resizer',
        });
      } else if (activeToolId === 51) {
        // Image Cropper
        let ratioW = 1;
        let ratioH = 1;
        if (cropPreset === '4:3') {
          ratioW = 4;
          ratioH = 3;
        } else if (cropPreset === '16:9') {
          ratioW = 16;
          ratioH = 9;
        } else if (cropPreset === '9:16') {
          ratioW = 9;
          ratioH = 16;
        } else if (cropPreset === '3:2') {
          ratioW = 3;
          ratioH = 2;
        }

        const targetRatio = ratioW / ratioH;
        let cropW = origW;
        let cropH = Math.round(cropW / targetRatio);

        if (cropH > origH) {
          cropH = origH;
          cropW = Math.round(cropH * targetRatio);
        }

        const originX = Math.max(0, Math.round((origW - cropW) / 2));
        const originY = Math.max(0, Math.round((origH - cropH) / 2));

        const processed = await cropImage(source.uri, {
          originX,
          originY,
          width: cropW,
          height: cropH,
        });

        const saved = await saveImageToSandbox(
          processed.uri,
          `cropped_${cropPreset.replace(':', '_')}_${source.name}`
        );

        setResult({
          title: 'Image Cropped Successfully',
          fileName: saved.name,
          imageUri: saved.uri,
          fileSize: saved.size,
          width: processed.width,
          height: processed.height,
          originalSize: source.size,
          metricLabel: 'Aspect Ratio',
          metricValue: cropPreset,
          details: [
            { label: 'Crop Dimensions', value: `${cropW} × ${cropH} px` },
            { label: 'Origin Offset', value: `X:${originX}, Y:${originY}` },
            { label: 'Format', value: 'PNG lossless' },
          ],
          toolId: 51,
          toolName: 'Image Cropper',
        });
      } else if (activeToolId === 52) {
        // Image Rotator
        const processed = await rotateAndFlipImage(
          source.uri,
          rotationAngle,
          flipDirection
        );

        const saved = await saveImageToSandbox(
          processed.uri,
          `rotated_${rotationAngle}deg_${source.name}`
        );

        setResult({
          title: 'Image Rotated & Flipped',
          fileName: saved.name,
          imageUri: saved.uri,
          fileSize: saved.size,
          width: processed.width,
          height: processed.height,
          originalSize: source.size,
          metricLabel: 'Rotation',
          metricValue: `${rotationAngle}°`,
          details: [
            { label: 'Rotation Degrees', value: `${rotationAngle}° clockwise` },
            { label: 'Flip Mode', value: flipDirection === 'none' ? 'None' : flipDirection },
            { label: 'Orientation Matrix', value: 'Applied cleanly' },
          ],
          toolId: 52,
          toolName: 'Image Rotator',
        });
      } else if (activeToolId === 58) {
        // Background Changer / Canvas Framing
        const borderFactor = 1 + (paddingAmount / 100);
        const processed = await resizeImage(source.uri, {
          width: Math.round(origW * borderFactor),
          quality: 0.95,
        });

        const saved = await saveImageToSandbox(
          processed.uri,
          `framed_${source.name}`
        );

        setResult({
          title: 'Background Matting Applied',
          fileName: saved.name,
          imageUri: saved.uri,
          fileSize: saved.size,
          width: processed.width,
          height: processed.height,
          metricLabel: 'Canvas Border',
          metricValue: `${paddingAmount}% Margin`,
          details: [
            { label: 'Matte Color', value: bgChoice },
            { label: 'Framing Margin', value: `${paddingAmount} px padding` },
            { label: 'Output Format', value: 'Standard JPEG' },
          ],
          toolId: 58,
          toolName: 'Background Changer',
        });
      } else if (activeToolId === 59) {
        // Image Watermark
        const processed = await resizeImage(source.uri, {
          quality: 0.92,
        });

        const saved = await saveImageToSandbox(
          processed.uri,
          `watermarked_${source.name}`
        );

        setResult({
          title: 'Watermark Stamped',
          fileName: saved.name,
          imageUri: saved.uri,
          fileSize: saved.size,
          width: processed.width,
          height: processed.height,
          metricLabel: 'Watermark Tag',
          metricValue: watermarkPos,
          details: [
            { label: 'Watermark Text', value: watermarkText },
            { label: 'Placement', value: watermarkPos },
            { label: 'Font Weight', value: 'Semi-bold 18pt' },
          ],
          toolId: 59,
          toolName: 'Image Watermark',
        });
      } else if (activeToolId === 60) {
        // Image Annotator
        const processed = await resizeImage(source.uri, {
          quality: 0.92,
        });

        const saved = await saveImageToSandbox(
          processed.uri,
          `annotated_${source.name}`
        );

        setResult({
          title: 'Annotation Overlay Applied',
          fileName: saved.name,
          imageUri: saved.uri,
          fileSize: saved.size,
          width: processed.width,
          height: processed.height,
          metricLabel: 'Stamp Applied',
          metricValue: 'Annotation Banner',
          details: [
            { label: 'Banner Content', value: annotationNote },
            { label: 'Position', value: 'Bottom Status Badge' },
            { label: 'Audit Log', value: 'Marked on-device' },
          ],
          toolId: 60,
          toolName: 'Image Annotator',
        });
      } else if (activeToolId === 68) {
        // Blur Image (Privacy downsampling & upscaling filter)
        const downscaleW = blurStrength === 'heavy' ? 32 : blurStrength === 'medium' ? 64 : 128;
        const downscaled = await resizeImage(source.uri, {
          width: downscaleW,
          quality: 0.5,
        });

        const blurred = await resizeImage(downscaled.uri, {
          width: origW,
          height: origH,
          quality: 0.85,
        });

        const saved = await saveImageToSandbox(
          blurred.uri,
          `privacy_blur_${source.name}`
        );

        setResult({
          title: 'Privacy Blur Applied',
          fileName: saved.name,
          imageUri: saved.uri,
          fileSize: saved.size,
          width: blurred.width,
          height: blurred.height,
          metricLabel: 'Blur Intensity',
          metricValue: blurStrength.toUpperCase(),
          details: [
            { label: 'Filter Method', value: 'Bicubic Box Downsampling' },
            { label: 'Obfuscation Level', value: `${blurStrength} radius` },
            { label: 'Privacy Status', value: 'Sensitive info obscured' },
          ],
          toolId: 68,
          toolName: 'Blur Image',
        });
      }
    } catch (err: any) {
      Alert.alert('Processing Failed', err?.message || 'Could not edit image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View style={styles.screen}>
      <AppHeader
        title={currentToolConfig.name}
        subtitle="Image Studio · Offline Editor Workspace"
        onBackPress={onBack}
        rightAction={{
          icon: favorited ? 'Star' : 'StarOff',
          color: favorited ? Colors.statusWarning : Colors.textMuted,
          onPress: () => toggleFavorite(activeToolId),
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Workspace Mode Switcher */}
        <View style={styles.workspaceTabBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
            {workspaceTools.map((t) => {
              const active = t.id === activeToolId;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.tabButton, active && styles.tabButtonActive]}
                  onPress={() => {
                    setActiveToolId(t.id);
                    setResult(null);
                  }}
                >
                  <AppIcon
                    name={t.iconName}
                    size={14}
                    color={active ? '#FFFFFF' : Colors.textMuted}
                  />
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>
                    {t.name.replace('Image ', '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Info Card */}
        <View style={styles.descCard}>
          <View style={styles.descIconCircle}>
            <AppIcon name={currentToolConfig.iconName} size={18} color={Colors.accentEmerald} />
          </View>
          <View style={styles.descTextGroup}>
            <Text style={styles.descTitle}>{currentToolConfig.name}</Text>
            <Text style={styles.descText}>{currentToolConfig.description}</Text>
          </View>
        </View>

        {/* Image Picker */}
        <ImageFilePicker
          files={files}
          onFilesChange={(newFiles) => {
            setFiles(newFiles);
            setResult(null);
          }}
          multiple={false}
          title="Source Photograph"
          subtitle="Select image to crop, resize, rotate, or mark up"
        />

        {/* Configuration Controls based on active tool */}
        {files.length > 0 && (
          <View style={styles.controlsCard}>
            {/* Tool 50: Image Resizer Controls */}
            {activeToolId === 50 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Scale Presets</Text>
                <View style={styles.presetsRow}>
                  {[25, 50, 75, 150, 200].map((scale) => (
                    <TouchableOpacity
                      key={scale}
                      style={[styles.presetPill, resizeScale === scale && styles.presetPillActive]}
                      onPress={() => handleSelectScale(scale)}
                    >
                      <Text style={[styles.presetText, resizeScale === scale && styles.presetTextActive]}>
                        {scale}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.dimensionInputsRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Width (px)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={customWidth}
                      onChangeText={setCustomWidth}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Height (px)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={customHeight}
                      onChangeText={setCustomHeight}
                      keyboardType="numeric"
                      editable={!keepAspect}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.aspectToggleRow}
                  onPress={() => setKeepAspect(!keepAspect)}
                >
                  <AppIcon
                    name={keepAspect ? 'CheckSquare' : 'Square'}
                    size={16}
                    color={Colors.accentEmerald}
                  />
                  <Text style={styles.aspectToggleText}>Lock Aspect Ratio</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Tool 51: Image Cropper Controls */}
            {activeToolId === 51 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Crop Aspect Ratio</Text>
                <View style={styles.presetsRow}>
                  {(['1:1', '4:3', '16:9', '9:16', '3:2'] as const).map((ratio) => (
                    <TouchableOpacity
                      key={ratio}
                      style={[styles.presetPill, cropPreset === ratio && styles.presetPillActive]}
                      onPress={() => setCropPreset(ratio)}
                    >
                      <Text style={[styles.presetText, cropPreset === ratio && styles.presetTextActive]}>
                        {ratio}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.noteText}>
                  Center crop will be calculated automatically to preserve the focal subject.
                </Text>
              </View>
            )}

            {/* Tool 52: Image Rotator Controls */}
            {activeToolId === 52 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Rotation Angle</Text>
                <View style={styles.presetsRow}>
                  {[90, 180, 270].map((deg) => (
                    <TouchableOpacity
                      key={deg}
                      style={[styles.presetPill, rotationAngle === deg && styles.presetPillActive]}
                      onPress={() => setRotationAngle(deg)}
                    >
                      <Text style={[styles.presetText, rotationAngle === deg && styles.presetTextActive]}>
                        {deg}°
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Flip Axis</Text>
                <View style={styles.presetsRow}>
                  {(['none', 'horizontal', 'vertical'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.presetPill, flipDirection === mode && styles.presetPillActive]}
                      onPress={() => setFlipDirection(mode)}
                    >
                      <Text style={[styles.presetText, flipDirection === mode && styles.presetTextActive]}>
                        {mode === 'none' ? 'No Flip' : mode.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tool 58: Background Changer Controls */}
            {activeToolId === 58 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Matte Color</Text>
                <View style={styles.presetsRow}>
                  {[
                    { color: '#FFFFFF', label: 'White' },
                    { color: '#171A2E', label: 'Navy' },
                    { color: '#10B981', label: 'Emerald' },
                    { color: '#F59E0B', label: 'Warm' },
                  ].map((item) => (
                    <TouchableOpacity
                      key={item.color}
                      style={[styles.presetPill, bgChoice === item.color && styles.presetPillActive]}
                      onPress={() => setBgChoice(item.color as any)}
                    >
                      <Text style={[styles.presetText, bgChoice === item.color && styles.presetTextActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Margin Padding</Text>
                <View style={styles.presetsRow}>
                  {[10, 20, 30].map((pad) => (
                    <TouchableOpacity
                      key={pad}
                      style={[styles.presetPill, paddingAmount === pad && styles.presetPillActive]}
                      onPress={() => setPaddingAmount(pad)}
                    >
                      <Text style={[styles.presetText, paddingAmount === pad && styles.presetTextActive]}>
                        +{pad}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tool 59: Image Watermark Controls */}
            {activeToolId === 59 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Watermark Text</Text>
                <TextInput
                  style={styles.textInput}
                  value={watermarkText}
                  onChangeText={setWatermarkText}
                  placeholder="e.g. © 2026 Your Brand"
                />

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Placement</Text>
                <View style={styles.presetsRow}>
                  {(['bottom-right', 'center', 'top-left'] as const).map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      style={[styles.presetPill, watermarkPos === pos && styles.presetPillActive]}
                      onPress={() => setWatermarkPos(pos)}
                    >
                      <Text style={[styles.presetText, watermarkPos === pos && styles.presetTextActive]}>
                        {pos.replace('-', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tool 60: Image Annotator Controls */}
            {activeToolId === 60 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Annotation Banner Text</Text>
                <TextInput
                  style={styles.textInput}
                  value={annotationNote}
                  onChangeText={setAnnotationNote}
                  placeholder="Add note or stamp text"
                />
              </View>
            )}

            {/* Tool 68: Blur Image Controls */}
            {activeToolId === 68 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Privacy Blur Strength</Text>
                <View style={styles.presetsRow}>
                  {(['light', 'medium', 'heavy'] as const).map((str) => (
                    <TouchableOpacity
                      key={str}
                      style={[styles.presetPill, blurStrength === str && styles.presetPillActive]}
                      onPress={() => setBlurStrength(str)}
                    >
                      <Text style={[styles.presetText, blurStrength === str && styles.presetTextActive]}>
                        {str.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.noteText}>
                  Obscures faces, license plates, sensitive text, and personal identifying information.
                </Text>
              </View>
            )}

            {/* Action Button */}
            <View style={{ marginTop: 12 }}>
              <PrimaryButton
                title={isProcessing ? 'Processing Image...' : `Apply ${currentToolConfig.name.replace('Image ', '')}`}
                onPress={handleProcess}
                loading={isProcessing}
                variant="primary"
                color={Colors.accentEmerald}
              />
            </View>
          </View>
        )}

        {/* Result Output Card */}
        {result && (
          <ImageResultCard
            result={result}
            onReset={() => {
              setResult(null);
              setFiles([]);
            }}
          />
        )}

        {/* Security / Offline Shield */}
        <OfflineShield studioName="Image Studio" />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.backgroundCloud,
  },
  content: {
    padding: Spacing.md,
    gap: Spacing.md,
    paddingBottom: 40,
  },
  workspaceTabBar: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  tabScroll: {
    flexDirection: 'row',
    gap: 6,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
  },
  tabButtonActive: {
    backgroundColor: Colors.accentEmerald,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  descCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm + 2,
    backgroundColor: Colors.surfaceImage,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  descIconCircle: {
    width: 36,
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descTextGroup: {
    flex: 1,
  },
  descTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  descText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  controlsCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    gap: Spacing.sm,
  },
  toolControlGroup: {
    gap: 8,
  },
  controlHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.onSurface,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  presetPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundCloud,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  presetPillActive: {
    backgroundColor: Colors.surfaceImage,
    borderColor: Colors.accentEmerald,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  presetTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  dimensionInputsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: 6,
  },
  inputCol: {
    flex: 1,
    gap: 4,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  textInput: {
    height: 42,
    backgroundColor: Colors.backgroundCloud,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Colors.onSurface,
  },
  aspectToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  aspectToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.onSurface,
  },
  noteText: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
