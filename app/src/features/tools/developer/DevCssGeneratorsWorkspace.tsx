import React, { useState, useMemo } from 'react';
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
import { useAppStore } from '../../../store/useAppStore';
import {
  convertColor,
  generateGradientCss,
  generateBoxShadowCss,
  generateBorderRadiusCss,
  generateFlexboxCss,
  generateGridCss,
} from './shared/DeveloperHelpers';
import { DevResultCard, DevStatItem } from './shared/DevResultCard';
import { getDeveloperToolConfig } from './developerConfig';

interface DevCssGeneratorsWorkspaceProps {
  initialToolId?: number;
  initialOperation?: string;
  onBack: () => void;
}

export const DevCssGeneratorsWorkspace: React.FC<DevCssGeneratorsWorkspaceProps> = ({
  initialToolId = 280,
  initialOperation,
  onBack,
}) => {
  const [activeToolId, setActiveToolId] = useState<number>(initialToolId);

  // 280 Color Code state
  const [colorHex, setColorHex] = useState<string>('#625BFF');

  // 281 Gradient state
  const [gradientType, setGradientType] = useState<'linear' | 'radial'>('linear');
  const [gradientAngle, setGradientAngle] = useState<number>(135);
  const [gradientColor1, setGradientColor1] = useState<string>('#625BFF');
  const [gradientColor2, setGradientColor2] = useState<string>('#0EA5E9');

  // 282 Box Shadow state
  const [shadowX, setShadowX] = useState<number>(0);
  const [shadowY, setShadowY] = useState<number>(8);
  const [shadowBlur, setShadowBlur] = useState<number>(24);
  const [shadowSpread, setShadowSpread] = useState<number>(0);
  const [shadowColor, setShadowColor] = useState<string>('rgba(14, 165, 233, 0.25)');

  // 283 Border Radius state
  const [radiusTl, setRadiusTl] = useState<number>(16);
  const [radiusTr, setRadiusTr] = useState<number>(16);
  const [radiusBr, setRadiusBr] = useState<number>(16);
  const [radiusBl, setRadiusBl] = useState<number>(16);

  // 284 Flexbox state
  const [flexDir, setFlexDir] = useState<string>('row');
  const [flexJustify, setFlexJustify] = useState<string>('space-between');
  const [flexAlign, setFlexAlign] = useState<string>('center');
  const [flexWrap, setFlexWrap] = useState<string>('nowrap');

  // 285 Grid state
  const [gridCols, setGridCols] = useState<number>(3);
  const [gridRows, setGridRows] = useState<number>(2);
  const [gridGap, setGridGap] = useState<number>(16);

  const [isSaved, setIsSaved] = useState<boolean>(false);

  const { toggleFavorite, isFavorite, addRecentItem } = useAppStore();
  const favorited = isFavorite(activeToolId);
  const toolConfig = getDeveloperToolConfig(activeToolId);

  // Compute CSS code output
  const cssOutput = useMemo(() => {
    switch (activeToolId) {
      case 280: {
        const c = convertColor(colorHex);
        return `/* Color Conversions */\nHEX: ${c.hex}\nRGB: ${c.rgb}\nHSL: ${c.hsl}`;
      }
      case 281:
        return generateGradientCss(gradientType, gradientAngle, gradientColor1, gradientColor2);
      case 282:
        return generateBoxShadowCss(shadowX, shadowY, shadowBlur, shadowSpread, shadowColor, false);
      case 283:
        return generateBorderRadiusCss(radiusTl, radiusTr, radiusBr, radiusBl);
      case 284:
        return generateFlexboxCss(flexDir, flexJustify, flexAlign, flexWrap);
      case 285:
        return generateGridCss(gridCols, gridRows, gridGap);
      default:
        return '';
    }
  }, [
    activeToolId,
    colorHex,
    gradientType,
    gradientAngle,
    gradientColor1,
    gradientColor2,
    shadowX,
    shadowY,
    shadowBlur,
    shadowSpread,
    shadowColor,
    radiusTl,
    radiusTr,
    radiusBr,
    radiusBl,
    flexDir,
    flexJustify,
    flexAlign,
    flexWrap,
    gridCols,
    gridRows,
    gridGap,
  ]);

  const handleSaveToFiles = () => {
    setIsSaved(true);
    Alert.alert('Saved', 'CSS snippet saved to local files.');
    addRecentItem({
      toolId: activeToolId,
      title: `${toolConfig?.name || 'CSS Generator'} Output`,
      subtitle: `${cssOutput.length} characters generated`,
    });
  };

  const statItems: DevStatItem[] = [
    { label: 'Category', value: 'CSS3 Stylesheet' },
    { label: 'Output Length', value: cssOutput.length },
    { label: 'Lines', value: cssOutput.split('\n').length },
  ];

  const toolsInWorkspace = [
    { id: 280, name: 'Color Code' },
    { id: 281, name: 'Gradient Gen' },
    { id: 282, name: 'Box Shadow' },
    { id: 283, name: 'Border Radius' },
    { id: 284, name: 'Flexbox' },
    { id: 285, name: 'CSS Grid' },
  ];

  return (
    <View style={styles.screen}>
      <AppHeader
        title={toolConfig?.name || 'CSS, UI & Layout Generators'}
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

        {/* Live Visual Preview Canvas */}
        <View style={styles.previewCanvasCard}>
          <Text style={styles.previewCanvasLabel}>Live UI Render Preview</Text>
          <View style={styles.canvasContainer}>
            {activeToolId === 280 && (
              <View style={[styles.previewBox, { backgroundColor: colorHex }]} />
            )}

            {activeToolId === 281 && (
              <View
                style={[
                  styles.previewBox,
                  { backgroundColor: gradientColor1, borderColor: gradientColor2 },
                ]}
              >
                <Text style={styles.previewBoxText}>{gradientType.toUpperCase()}</Text>
              </View>
            )}

            {activeToolId === 282 && (
              <View
                style={[
                  styles.previewBox,
                  {
                    shadowColor: '#0EA5E9',
                    shadowOffset: { width: shadowX, height: shadowY },
                    shadowOpacity: 0.35,
                    shadowRadius: shadowBlur / 2,
                    elevation: 8,
                  },
                ]}
              />
            )}

            {activeToolId === 283 && (
              <View
                style={[
                  styles.previewBox,
                  {
                    borderTopLeftRadius: radiusTl,
                    borderTopRightRadius: radiusTr,
                    borderBottomRightRadius: radiusBr,
                    borderBottomLeftRadius: radiusBl,
                  },
                ]}
              />
            )}

            {activeToolId === 284 && (
              <View
                style={[
                  styles.flexPreviewBox,
                  {
                    flexDirection: flexDir as any,
                    justifyContent: flexJustify as any,
                    alignItems: flexAlign as any,
                  },
                ]}
              >
                {[1, 2, 3].map((num) => (
                  <View key={num} style={styles.flexItem}>
                    <Text style={styles.flexItemText}>{num}</Text>
                  </View>
                ))}
              </View>
            )}

            {activeToolId === 285 && (
              <View style={styles.gridPreviewBox}>
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <View key={num} style={styles.gridItem}>
                    <Text style={styles.gridItemText}>{num}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* 280 Color Code Converter Controls */}
        {activeToolId === 280 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Color Value</Text>
            <TextInput
              style={styles.singleInput}
              value={colorHex}
              onChangeText={setColorHex}
              placeholder="#625BFF"
              placeholderTextColor={Colors.textMuted}
            />
            <View style={styles.colorPillsRow}>
              {['#625BFF', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899'].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.colorChip, { backgroundColor: c }]}
                  onPress={() => setColorHex(c)}
                />
              ))}
            </View>
          </View>
        )}

        {/* 281 Gradient Controls */}
        {activeToolId === 281 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Gradient Configuration</Text>
            <View style={styles.rowWrap}>
              {(['linear', 'radial'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.smallPill, gradientType === t && styles.smallPillActive]}
                  onPress={() => setGradientType(t)}
                >
                  <Text
                    style={[
                      styles.smallPillText,
                      gradientType === t && styles.smallPillTextActive,
                    ]}
                  >
                    {t.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
              {[45, 90, 135, 180].map((deg) => (
                <TouchableOpacity
                  key={deg}
                  style={[styles.smallPill, gradientAngle === deg && styles.smallPillActive]}
                  onPress={() => setGradientAngle(deg)}
                >
                  <Text
                    style={[
                      styles.smallPillText,
                      gradientAngle === deg && styles.smallPillTextActive,
                    ]}
                  >
                    {deg}°
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 282 Box Shadow Controls */}
        {activeToolId === 282 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shadow Sliders</Text>
            <View style={styles.rowWrap}>
              <Text style={styles.label}>Y Offset: {shadowY}px</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setShadowY(Math.max(0, shadowY - 2))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setShadowY(shadowY + 2)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={[styles.label, { marginLeft: 12 }]}>Blur: {shadowBlur}px</Text>
              <View style={styles.stepperBtns}>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setShadowBlur(Math.max(0, shadowBlur - 4))}
                >
                  <Text style={styles.stepperBtnText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.stepperBtn}
                  onPress={() => setShadowBlur(shadowBlur + 4)}
                >
                  <Text style={styles.stepperBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 283 Border Radius Controls */}
        {activeToolId === 283 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Corner Radii</Text>
            <View style={styles.rowWrap}>
              {[0, 8, 16, 24, 32, 999].map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.smallPill, radiusTl === r && styles.smallPillActive]}
                  onPress={() => {
                    setRadiusTl(r);
                    setRadiusTr(r);
                    setRadiusBr(r);
                    setRadiusBl(r);
                  }}
                >
                  <Text style={[styles.smallPillText, radiusTl === r && styles.smallPillTextActive]}>
                    {r === 999 ? 'Pill' : `${r}px`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 284 Flexbox Controls */}
        {activeToolId === 284 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Flex Properties</Text>
            <View style={styles.rowWrap}>
              {(['row', 'column'] as const).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.smallPill, flexDir === d && styles.smallPillActive]}
                  onPress={() => setFlexDir(d)}
                >
                  <Text style={[styles.smallPillText, flexDir === d && styles.smallPillTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
              {(['space-between', 'center', 'flex-start'] as const).map((j) => (
                <TouchableOpacity
                  key={j}
                  style={[styles.smallPill, flexJustify === j && styles.smallPillActive]}
                  onPress={() => setFlexJustify(j)}
                >
                  <Text
                    style={[styles.smallPillText, flexJustify === j && styles.smallPillTextActive]}
                  >
                    {j}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 285 Grid Controls */}
        {activeToolId === 285 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Grid Columns: {gridCols}</Text>
            <View style={styles.rowWrap}>
              {[2, 3, 4, 6].map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.smallPill, gridCols === c && styles.smallPillActive]}
                  onPress={() => setGridCols(c)}
                >
                  <Text style={[styles.smallPillText, gridCols === c && styles.smallPillTextActive]}>
                    {c} Columns
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Generated CSS Card */}
        <DevResultCard
          title={toolConfig?.name || 'Generated CSS Code'}
          subtitle={toolConfig?.description}
          badgeText="CSS3 Export Ready"
          stats={statItems}
          content={cssOutput}
          onSaveToManagedFiles={handleSaveToFiles}
          saved={isSaved}
          fileName="styles.css"
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
  previewCanvasCard: {
    backgroundColor: Colors.surfaceWhite,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  previewCanvasLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  canvasContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  previewBox: {
    width: 80,
    height: 80,
    backgroundColor: Colors.accentSky,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBoxText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.surfaceWhite,
  },
  flexPreviewBox: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: Radius.sm,
  },
  flexItem: {
    width: 36,
    height: 36,
    backgroundColor: Colors.accentSky,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flexItemText: {
    color: Colors.surfaceWhite,
    fontWeight: '700',
    fontSize: 13,
  },
  gridPreviewBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  gridItem: {
    width: 44,
    height: 36,
    backgroundColor: Colors.accentSky,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridItemText: {
    color: Colors.surfaceWhite,
    fontWeight: '700',
    fontSize: 12,
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
  colorPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  colorChip: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
});
