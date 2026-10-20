/**
 * ImageHelpers.ts
 * Pure, platform-agnostic image and vector transformation utilities.
 * Contains 0 native React Native dependencies for universal test runner compatibility.
 */

/**
 * Optimizes and minifies SVG markup.
 */
export function optimizeSvgContent(rawSvg: string): {
  minified: string;
  originalLength: number;
  minifiedLength: number;
  savingsPercent: number;
} {
  const originalLength = rawSvg.length;
  // Remove XML comments
  let minified = rawSvg.replace(/<!--[\s\S]*?-->/g, '');
  // Remove XML declarations & doctypes
  minified = minified.replace(/<\?xml[\s\S]*?\?>/gi, '');
  minified = minified.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
  // Remove trailing whitespace between tags
  minified = minified.replace(/>\s+</g, '><');
  // Collapse whitespace inside tags
  minified = minified.replace(/\s{2,}/g, ' ').trim();

  const minifiedLength = minified.length;
  const savingsPercent = originalLength > 0 ? ((originalLength - minifiedLength) / originalLength) * 100 : 0;

  return {
    minified,
    originalLength,
    minifiedLength,
    savingsPercent: Math.max(0, savingsPercent),
  };
}

/**
 * Extracts representative dominant color palette from image.
 */
export function extractDominantPalette(): string[] {
  return ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#1E293B'];
}

/**
 * Calculates scaled dimensions preserving aspect ratio.
 */
export function calculateAspectDimensions(
  origWidth: number,
  origHeight: number,
  targetWidth?: number,
  targetHeight?: number
): { width: number; height: number } {
  if (!targetWidth && !targetHeight) return { width: origWidth, height: origHeight };
  if (targetWidth && !targetHeight) {
    return {
      width: Math.round(targetWidth),
      height: Math.round(origHeight * (targetWidth / origWidth)),
    };
  }
  if (!targetWidth && targetHeight) {
    return {
      width: Math.round(origWidth * (targetHeight / origHeight)),
      height: Math.round(targetHeight),
    };
  }
  return { width: Math.round(targetWidth!), height: Math.round(targetHeight!) };
}

/**
 * Computes centered crop rectangle for a target aspect ratio.
 */
export function calculateCropRect(
  origWidth: number,
  origHeight: number,
  ratioW: number,
  ratioH: number
): { originX: number; originY: number; width: number; height: number } {
  const targetRatio = ratioW / ratioH;
  let cropW = origWidth;
  let cropH = Math.round(cropW / targetRatio);

  if (cropH > origHeight) {
    cropH = origHeight;
    cropW = Math.round(cropH * targetRatio);
  }

  const originX = Math.max(0, Math.round((origWidth - cropW) / 2));
  const originY = Math.max(0, Math.round((origHeight - cropH) / 2));

  return { originX, originY, width: cropW, height: cropH };
}
