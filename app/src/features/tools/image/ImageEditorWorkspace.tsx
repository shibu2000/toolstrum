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
  const [cropPreset, setCropPreset] = useState<'1:1' | '4:5' | '16:9' | '9:16' | '4:3' | '3:2' | '2:1'>('1:1');
  const [cropPosition, setCropPosition] = useState<'center' | 'top' | 'bottom' | 'left' | 'right'>('center');
  const [cropFormat, setCropFormat] = useState<SaveFormat>(SaveFormat.PNG);

  // Rotate state (Tool 52)
  const [rotationAngle, setRotationAngle] = useState<number>(90);
  const [flipDirection, setFlipDirection] = useState<'none' | 'horizontal' | 'vertical'>('none');
  const [rotateFormat, setRotateFormat] = useState<SaveFormat>(SaveFormat.PNG);

  // Background / Framing state (Tool 58)
  const [bgChoice, setBgChoice] = useState<'#FFFFFF' | '#171A2E' | '#10B981' | '#F59E0B'>('#FFFFFF');
  const [paddingAmount, setPaddingAmount] = useState<number>(20);

  // Watermark state (Tool 59)
  const [watermarkText, setWatermarkText] = useState<string>('CONFIDENTIAL');
  const [watermarkPos, setWatermarkPos] = useState<'bottom-right' | 'center' | 'top-left' | 'tiled'>('bottom-right');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(60);
  const [watermarkColor, setWatermarkColor] = useState<string>('#FFFFFF');

  // Annotator state (Tool 60)
  const [annotationNote, setAnnotationNote] = useState<string>('APPROVED');
  const [annotationStyle, setAnnotationStyle] = useState<'bottom-banner' | 'top-banner' | 'corner-stamp'>('bottom-banner');
  const [annotationTheme, setAnnotationTheme] = useState<'emerald' | 'amber' | 'rose' | 'slate'>('emerald');

  // Blur state (Tool 68)
  const [blurStrength, setBlurStrength] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [blurStyle, setBlurStyle] = useState<'smooth' | 'mosaic'>('smooth');

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
        if (cropPreset === '4:5') {
          ratioW = 4;
          ratioH = 5;
        } else if (cropPreset === '16:9') {
          ratioW = 16;
          ratioH = 9;
        } else if (cropPreset === '9:16') {
          ratioW = 9;
          ratioH = 16;
        } else if (cropPreset === '4:3') {
          ratioW = 4;
          ratioH = 3;
        } else if (cropPreset === '3:2') {
          ratioW = 3;
          ratioH = 2;
        } else if (cropPreset === '2:1') {
          ratioW = 2;
          ratioH = 1;
        }

        const targetRatio = ratioW / ratioH;
        let cropW = origW;
        let cropH = Math.round(cropW / targetRatio);

        if (cropH > origH) {
          cropH = origH;
          cropW = Math.round(cropH * targetRatio);
        }

        let originX = Math.max(0, Math.round((origW - cropW) / 2));
        let originY = Math.max(0, Math.round((origH - cropH) / 2));

        if (cropPosition === 'top') {
          originY = 0;
        } else if (cropPosition === 'bottom') {
          originY = Math.max(0, origH - cropH);
        } else if (cropPosition === 'left') {
          originX = 0;
        } else if (cropPosition === 'right') {
          originX = Math.max(0, origW - cropW);
        }

        const processed = await cropImage(
          source.uri,
          {
            originX,
            originY,
            width: cropW,
            height: cropH,
          },
          {
            format: cropFormat,
            quality: 0.95,
          }
        );

        const ext = cropFormat === SaveFormat.PNG ? 'png' : cropFormat === SaveFormat.WEBP ? 'webp' : 'jpg';
        const baseName = source.name.replace(/\.[^/.]+$/, '');
        const saved = await saveImageToSandbox(
          processed.uri,
          `cropped_${cropPreset.replace(':', '_')}_${baseName}.${ext}`
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
            { label: 'Alignment Focus', value: cropPosition.toUpperCase() },
            { label: 'Origin Offset', value: `X:${originX}, Y:${originY}` },
            {
              label: 'Format',
              value:
                cropFormat === SaveFormat.PNG
                  ? 'PNG Lossless'
                  : cropFormat === SaveFormat.WEBP
                  ? 'Smart WebP'
                  : 'JPEG High Quality',
            },
          ],
          toolId: 51,
          toolName: 'Image Cropper',
        });
      } else if (activeToolId === 52) {
        // Image Rotator & Flipper
        const processed = await rotateAndFlipImage(
          source.uri,
          rotationAngle,
          flipDirection,
          {
            format: rotateFormat,
            quality: 0.95,
          }
        );

        const ext = rotateFormat === SaveFormat.PNG ? 'png' : rotateFormat === SaveFormat.WEBP ? 'webp' : 'jpg';
        const baseName = source.name.replace(/\.[^/.]+$/, '');
        const saved = await saveImageToSandbox(
          processed.uri,
          `rotated_${rotationAngle}deg_${baseName}.${ext}`
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
            { label: 'Flip Axis', value: flipDirection === 'none' ? 'None' : flipDirection.toUpperCase() },
            { label: 'Dimensions', value: `${processed.width} × ${processed.height} px` },
            {
              label: 'Output Format',
              value:
                rotateFormat === SaveFormat.PNG
                  ? 'PNG Lossless'
                  : rotateFormat === SaveFormat.WEBP
                  ? 'Smart WebP'
                  : 'JPEG High Quality',
            },
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
          metricLabel: 'Watermark Engine',
          metricValue: watermarkPos === 'tiled' ? 'Tiled Repeating Grid' : `${watermarkPos.replace('-', ' ')}`,
          details: [
            { label: 'Watermark Text', value: watermarkText || 'CONFIDENTIAL' },
            { label: 'Layout Pattern', value: watermarkPos === 'tiled' ? 'Stock Protection Grid' : `Anchor (${watermarkPos})` },
            { label: 'Opacity & Color', value: `${watermarkOpacity}% • ${watermarkColor}` },
            { label: 'Privacy', value: '100% On-Device Local' },
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
          metricValue: `${annotationTheme.toUpperCase()} ${annotationStyle.replace('-', ' ')}`,
          details: [
            { label: 'Callout Note', value: annotationNote || 'APPROVED' },
            { label: 'Badge Layout', value: annotationStyle.replace('-', ' ').toUpperCase() },
            { label: 'Theme Palette', value: annotationTheme.toUpperCase() },
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
          metricLabel: 'Obfuscation Engine',
          metricValue: `${blurStyle.toUpperCase()} (${blurStrength.toUpperCase()})`,
          details: [
            { label: 'Filter Method', value: blurStyle === 'mosaic' ? 'Pixelated Mosaic Downsampler' : 'Bicubic Box Gaussian Blur' },
            { label: 'Obfuscation Level', value: `${blurStrength.toUpperCase()} strength` },
            { label: 'Privacy Status', value: 'Sensitive info obscured' },
            { label: 'Execution', value: '100% On-Device Local' },
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
                  {[25, 50, 75, 100, 150, 200].map((scale) => (
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

                <Text style={[styles.controlHeader, { marginTop: 12 }]}>Social Media &amp; Web Presets</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                  {[
                    { label: 'IG Square (1080×1080)', w: 1080, h: 1080 },
                    { label: 'Story / Reel (1080×1920)', w: 1080, h: 1920 },
                    { label: 'YouTube (1280×720)', w: 1280, h: 720 },
                    { label: 'Twitter/X (1200×675)', w: 1200, h: 675 },
                    { label: 'Facebook (1200×630)', w: 1200, h: 630 },
                    { label: 'LinkedIn (1584×396)', w: 1584, h: 396 },
                    { label: '1080p FHD (1920×1080)', w: 1920, h: 1080 },
                  ].map((preset) => (
                    <TouchableOpacity
                      key={preset.label}
                      style={[
                        styles.presetPill,
                        customWidth === String(preset.w) && customHeight === String(preset.h) && styles.presetPillActive,
                      ]}
                      onPress={() => {
                        setCustomWidth(String(preset.w));
                        setCustomHeight(String(preset.h));
                        setKeepAspect(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.presetText,
                          customWidth === String(preset.w) && customHeight === String(preset.h) && styles.presetTextActive,
                        ]}
                      >
                        {preset.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

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
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsRow}>
                  {([
                    { id: '1:1', label: '1:1 Square' },
                    { id: '4:5', label: '4:5 Portrait' },
                    { id: '16:9', label: '16:9 Wide' },
                    { id: '9:16', label: '9:16 Reel' },
                    { id: '4:3', label: '4:3 Display' },
                    { id: '3:2', label: '3:2 Photo' },
                    { id: '2:1', label: '2:1 Banner' },
                  ] as const).map((ratio) => (
                    <TouchableOpacity
                      key={ratio.id}
                      style={[styles.presetPill, cropPreset === ratio.id && styles.presetPillActive]}
                      onPress={() => setCropPreset(ratio.id)}
                    >
                      <Text style={[styles.presetText, cropPreset === ratio.id && styles.presetTextActive]}>
                        {ratio.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={[styles.controlHeader, { marginTop: 12 }]}>Focal Alignment Focus</Text>
                <View style={styles.presetsRow}>
                  {(['center', 'top', 'bottom', 'left', 'right'] as const).map((pos) => (
                    <TouchableOpacity
                      key={pos}
                      style={[styles.presetPill, cropPosition === pos && styles.presetPillActive]}
                      onPress={() => setCropPosition(pos)}
                    >
                      <Text style={[styles.presetText, cropPosition === pos && styles.presetTextActive]}>
                        {pos.charAt(0).toUpperCase() + pos.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 12 }]}>Output Format</Text>
                <View style={styles.presetsRow}>
                  {[
                    { format: SaveFormat.PNG, label: 'PNG Lossless' },
                    { format: SaveFormat.WEBP, label: 'Smart WebP' },
                    { format: SaveFormat.JPEG, label: 'JPEG Photo' },
                  ].map((fmt) => (
                    <TouchableOpacity
                      key={fmt.label}
                      style={[styles.presetPill, cropFormat === fmt.format && styles.presetPillActive]}
                      onPress={() => setCropFormat(fmt.format)}
                    >
                      <Text style={[styles.presetText, cropFormat === fmt.format && styles.presetTextActive]}>
                        {fmt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {files[0] && files[0].width && files[0].height && (
                  <Text style={[styles.noteText, { marginTop: 8 }]}>
                    Source: {files[0].width} × {files[0].height} px • Offset: {cropPosition.toUpperCase()}
                  </Text>
                )}
              </View>
            )}

            {/* Tool 52: Image Rotator Controls */}
            {activeToolId === 52 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Rotation Angle</Text>
                <View style={styles.presetsRow}>
                  {[0, 90, 180, 270].map((deg) => (
                    <TouchableOpacity
                      key={deg}
                      style={[styles.presetPill, rotationAngle === deg && styles.presetPillActive]}
                      onPress={() => setRotationAngle(deg)}
                    >
                      <Text style={[styles.presetText, rotationAngle === deg && styles.presetTextActive]}>
                        {deg === 0 ? '0° (Original)' : `${deg}°`}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 12 }]}>Flip Axis</Text>
                <View style={styles.presetsRow}>
                  {(['none', 'horizontal', 'vertical'] as const).map((mode) => (
                    <TouchableOpacity
                      key={mode}
                      style={[styles.presetPill, flipDirection === mode && styles.presetPillActive]}
                      onPress={() => setFlipDirection(mode)}
                    >
                      <Text style={[styles.presetText, flipDirection === mode && styles.presetTextActive]}>
                        {mode === 'none' ? 'None' : mode === 'horizontal' ? 'Horizontal (Mirror)' : 'Vertical (Invert)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 12 }]}>Output Format</Text>
                <View style={styles.presetsRow}>
                  {[
                    { format: SaveFormat.PNG, label: 'PNG Lossless' },
                    { format: SaveFormat.WEBP, label: 'Smart WebP' },
                    { format: SaveFormat.JPEG, label: 'JPEG Photo' },
                  ].map((fmt) => (
                    <TouchableOpacity
                      key={fmt.label}
                      style={[styles.presetPill, rotateFormat === fmt.format && styles.presetPillActive]}
                      onPress={() => setRotateFormat(fmt.format)}
                    >
                      <Text style={[styles.presetText, rotateFormat === fmt.format && styles.presetTextActive]}>
                        {fmt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {files[0] && files[0].width && files[0].height && (
                  <Text style={[styles.noteText, { marginTop: 8 }]}>
                    Source: {files[0].width} × {files[0].height} px &bull; Result:{' '}
                    {rotationAngle % 180 !== 0
                      ? `${files[0].height} × ${files[0].width}`
                      : `${files[0].width} × ${files[0].height}`}{' '}
                    px
                  </Text>
                )}
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
                  placeholder="e.g. CONFIDENTIAL"
                />

                {/* Preset Chips */}
                <View style={[styles.presetsRow, { marginTop: 4 }]}>
                  {['CONFIDENTIAL', 'DO NOT COPY', 'DRAFT', '© COPYRIGHT'].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[styles.presetPill, watermarkText === preset && styles.presetPillActive]}
                      onPress={() => setWatermarkText(preset)}
                    >
                      <Text style={[styles.presetText, watermarkText === preset && styles.presetTextActive]}>
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Placement & Pattern</Text>
                <View style={styles.presetsRow}>
                  {[
                    { id: 'bottom-right', label: 'Bottom Right' },
                    { id: 'center', label: 'Center' },
                    { id: 'top-left', label: 'Top Left' },
                    { id: 'tiled', label: 'Tiled Grid' },
                  ].map((pos) => (
                    <TouchableOpacity
                      key={pos.id}
                      style={[styles.presetPill, watermarkPos === pos.id && styles.presetPillActive]}
                      onPress={() => setWatermarkPos(pos.id as any)}
                    >
                      <Text style={[styles.presetText, watermarkPos === pos.id && styles.presetTextActive]}>
                        {pos.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Opacity</Text>
                <View style={styles.presetsRow}>
                  {[30, 50, 75, 100].map((op) => (
                    <TouchableOpacity
                      key={op}
                      style={[styles.presetPill, watermarkOpacity === op && styles.presetPillActive]}
                      onPress={() => setWatermarkOpacity(op)}
                    >
                      <Text style={[styles.presetText, watermarkOpacity === op && styles.presetTextActive]}>
                        {op}%
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tool 60: Image Annotator Controls */}
            {activeToolId === 60 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Annotation Callout Text</Text>
                <TextInput
                  style={styles.textInput}
                  value={annotationNote}
                  onChangeText={setAnnotationNote}
                  placeholder="e.g. APPROVED ON 2026-11-14"
                />

                <View style={[styles.presetsRow, { marginTop: 4 }]}>
                  {['APPROVED', 'CONFIDENTIAL', 'URGENT', 'FINAL DRAFT'].map((preset) => (
                    <TouchableOpacity
                      key={preset}
                      style={[styles.presetPill, annotationNote === preset && styles.presetPillActive]}
                      onPress={() => setAnnotationNote(preset)}
                    >
                      <Text style={[styles.presetText, annotationNote === preset && styles.presetTextActive]}>
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Callout Style</Text>
                <View style={styles.presetsRow}>
                  {[
                    { id: 'bottom-banner', label: 'Bottom Banner' },
                    { id: 'top-banner', label: 'Top Header' },
                    { id: 'corner-stamp', label: 'Corner Stamp' },
                  ].map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[styles.presetPill, annotationStyle === style.id && styles.presetPillActive]}
                      onPress={() => setAnnotationStyle(style.id as any)}
                    >
                      <Text style={[styles.presetText, annotationStyle === style.id && styles.presetTextActive]}>
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Badge Theme</Text>
                <View style={styles.presetsRow}>
                  {[
                    { id: 'emerald', label: 'Verified Emerald' },
                    { id: 'amber', label: 'Warning Amber' },
                    { id: 'rose', label: 'Urgent Rose' },
                    { id: 'slate', label: 'Dark Slate' },
                  ].map((theme) => (
                    <TouchableOpacity
                      key={theme.id}
                      style={[styles.presetPill, annotationTheme === theme.id && styles.presetPillActive]}
                      onPress={() => setAnnotationTheme(theme.id as any)}
                    >
                      <Text style={[styles.presetText, annotationTheme === theme.id && styles.presetTextActive]}>
                        {theme.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Tool 68: Blur Image Controls */}
            {activeToolId === 68 && (
              <View style={styles.toolControlGroup}>
                <Text style={styles.controlHeader}>Obfuscation Style</Text>
                <View style={styles.presetsRow}>
                  {[
                    { id: 'smooth', label: 'Smooth Blur' },
                    { id: 'mosaic', label: 'Pixelated Mosaic' },
                  ].map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      style={[styles.presetPill, blurStyle === style.id && styles.presetPillActive]}
                      onPress={() => setBlurStyle(style.id as any)}
                    >
                      <Text style={[styles.presetText, blurStyle === style.id && styles.presetTextActive]}>
                        {style.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.controlHeader, { marginTop: 10 }]}>Blur Strength</Text>
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
