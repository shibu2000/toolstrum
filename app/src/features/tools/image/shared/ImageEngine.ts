/**
 * ImageEngine.ts
 * Core image processing engine for Image Studio.
 * Uses expo-image-manipulator, FileSystem, and pdf-lib for 100% on-device, offline image manipulation.
 */

import { manipulateAsync, SaveFormat, Action, FlipType } from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';
import { PDFDocument, PageSizes } from 'pdf-lib';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface ImageMetadata {
  name: string;
  uri: string;
  size?: number;
  width?: number;
  height?: number;
  mimeType?: string;
  format?: string;
  hasExif?: boolean;
}

export interface ProcessedImageResult {
  name: string;
  uri: string;
  size: number;
  width: number;
  height: number;
  savedPercent?: number;
}

/**
 * Saves processed image to the sandbox Documents / Cache directory and returns metadata.
 */
export async function saveImageToSandbox(
  sourceUri: string,
  preferredName: string,
  fallbackSize?: number
): Promise<ProcessedImageResult> {
  const cleanName = preferredName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  const targetUri = `${docDir}${Date.now()}_${cleanName}`;

  try {
    await FileSystem.copyAsync({
      from: sourceUri,
      to: targetUri,
    });
  } catch {
    // If copy fails, read and write
    const b64 = await FileSystem.readAsStringAsync(sourceUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    await FileSystem.writeAsStringAsync(targetUri, b64, {
      encoding: FileSystem.EncodingType.Base64,
    });
  }

  const info = await FileSystem.getInfoAsync(targetUri);
  const size = info.exists && info.size ? info.size : fallbackSize || 0;

  return {
    name: cleanName,
    uri: targetUri,
    size,
    width: 0,
    height: 0,
  };
}

/**
 * Resizes an image preserving aspect ratio or fitting specific bounds.
 */
export async function resizeImage(
  uri: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: SaveFormat;
  }
): Promise<{ uri: string; width: number; height: number; size: number }> {
  const actions: Action[] = [];
  if (options.width || options.height) {
    actions.push({
      resize: {
        width: options.width,
        height: options.height,
      },
    });
  }

  const result = await manipulateAsync(uri, actions, {
    compress: options.quality ?? 0.85,
    format: options.format ?? SaveFormat.JPEG,
  });

  const info = await FileSystem.getInfoAsync(result.uri);
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: info.exists && info.size ? info.size : 0,
  };
}

/**
 * Crops an image to specific rectangular pixel bounds.
 */
export async function cropImage(
  uri: string,
  cropRect: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  },
  options: {
    quality?: number;
    format?: SaveFormat;
  } = {}
): Promise<{ uri: string; width: number; height: number; size: number }> {
  const result = await manipulateAsync(
    uri,
    [{ crop: cropRect }],
    {
      compress: options.quality ?? 0.9,
      format: options.format ?? SaveFormat.PNG,
    }
  );

  const info = await FileSystem.getInfoAsync(result.uri);
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: info.exists && info.size ? info.size : 0,
  };
}

/**
 * Rotates and/or flips an image.
 */
export async function rotateAndFlipImage(
  uri: string,
  degrees: number,
  flip?: 'horizontal' | 'vertical' | 'none',
  options: {
    quality?: number;
    format?: SaveFormat;
  } = {}
): Promise<{ uri: string; width: number; height: number; size: number }> {
  const actions: Action[] = [];
  if (degrees % 360 !== 0) {
    actions.push({ rotate: degrees });
  }
  if (flip === 'horizontal') {
    actions.push({ flip: FlipType.Horizontal });
  } else if (flip === 'vertical') {
    actions.push({ flip: FlipType.Vertical });
  }

  const result = await manipulateAsync(uri, actions, {
    compress: options.quality ?? 0.9,
    format: options.format ?? SaveFormat.JPEG,
  });

  const info = await FileSystem.getInfoAsync(result.uri);
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: info.exists && info.size ? info.size : 0,
  };
}

/**
 * Compresses an image with target quality level.
 */
export async function compressImage(
  uri: string,
  quality: number, // 0.1 to 1.0
  format: SaveFormat = SaveFormat.JPEG
): Promise<{ uri: string; width: number; height: number; size: number }> {
  const result = await manipulateAsync(uri, [], {
    compress: Math.max(0.05, Math.min(1.0, quality)),
    format,
  });

  const info = await FileSystem.getInfoAsync(result.uri);
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: info.exists && info.size ? info.size : 0,
  };
}

/**
 * Converts image format (JPEG, PNG, WEBP).
 */
export async function convertFormat(
  uri: string,
  targetFormat: 'jpeg' | 'png' | 'webp',
  quality: number = 0.85
): Promise<{ uri: string; width: number; height: number; size: number; format: string }> {
  let saveFormat = SaveFormat.JPEG;
  if (targetFormat === 'png') saveFormat = SaveFormat.PNG;
  if (targetFormat === 'webp') saveFormat = SaveFormat.WEBP;

  const result = await manipulateAsync(uri, [], {
    compress: quality,
    format: saveFormat,
  });

  const info = await FileSystem.getInfoAsync(result.uri);
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: info.exists && info.size ? info.size : 0,
    format: targetFormat,
  };
}

/**
 * Strips EXIF metadata by re-encoding image stream cleanly.
 */
export async function stripExifData(
  uri: string
): Promise<{ uri: string; width: number; height: number; size: number }> {
  const result = await manipulateAsync(uri, [], {
    compress: 0.95,
    format: SaveFormat.JPEG,
  });

  const info = await FileSystem.getInfoAsync(result.uri);
  return {
    uri: result.uri,
    width: result.width,
    height: result.height,
    size: info.exists && info.size ? info.size : 0,
  };
}

/**
 * Reads local image basic metadata.
 */
export async function readImageInfo(
  uri: string,
  fallbackName?: string
): Promise<ImageMetadata> {
  const info = await FileSystem.getInfoAsync(uri);
  const name = fallbackName || uri.split('/').pop() || 'image.jpg';
  const ext = name.split('.').pop()?.toLowerCase() || 'jpg';

  let format = 'JPEG';
  if (ext === 'png') format = 'PNG';
  else if (ext === 'webp') format = 'WEBP';
  else if (ext === 'heic') format = 'HEIC';
  else if (ext === 'svg') format = 'SVG';

  return {
    name,
    uri,
    size: info.exists && info.size ? info.size : undefined,
    format,
    hasExif: ext === 'jpg' || ext === 'jpeg' || ext === 'heic',
  };
}

/**
 * Converts images into a clean paginated PDF document using pdf-lib.
 */
export async function convertImagesToPdf(
  images: Array<{ uri: string; name: string }>,
  options: {
    pageSize?: 'A4' | 'Letter';
    margin?: number;
  } = {}
): Promise<{ uri: string; name: string; size: number; pageCount: number }> {
  const pdfDoc = await PDFDocument.create();
  const margin = options.margin ?? 20;

  for (const img of images) {
    const b64 = await FileSystem.readAsStringAsync(img.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

    let embeddedImage;
    if (img.uri.toLowerCase().endsWith('.png')) {
      embeddedImage = await pdfDoc.embedPng(bytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(bytes);
    }

    const { width: imgW, height: imgH } = embeddedImage;
    const standardSize = options.pageSize === 'Letter' ? PageSizes.Letter : PageSizes.A4;
    const page = pdfDoc.addPage(standardSize);

    const availableWidth = page.getWidth() - margin * 2;
    const availableHeight = page.getHeight() - margin * 2;

    const scale = Math.min(availableWidth / imgW, availableHeight / imgH, 1.0);
    const drawWidth = imgW * scale;
    const drawHeight = imgH * scale;

    const x = margin + (availableWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;

    page.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
    });
  }

  const pdfBytes = await pdfDoc.save();
  let binary = '';
  const len = pdfBytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(pdfBytes[i]);
  }
  const base64Pdf = btoa(binary);

  const fileName = `images_to_pdf_${Date.now()}.pdf`;
  const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  const targetUri = `${docDir}${fileName}`;

  await FileSystem.writeAsStringAsync(targetUri, base64Pdf, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const info = await FileSystem.getInfoAsync(targetUri);
  return {
    uri: targetUri,
    name: fileName,
    size: info.exists && info.size ? info.size : pdfBytes.byteLength,
    pageCount: images.length,
  };
}

/**
 * Embeds PNG image inside a valid SVG vector envelope.
 */
export async function convertPngToSvg(
  uri: string,
  width: number = 800,
  height: number = 600
): Promise<{ svgContent: string; uri: string; size: number }> {
  const b64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <!-- Converted by Toolstrum Image Studio Offline Engine -->
  <image width="${width}" height="${height}" xlink:href="data:image/png;base64,${b64}" />
</svg>`;

  const fileName = `vector_wrap_${Date.now()}.svg`;
  const docDir = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  const targetUri = `${docDir}${fileName}`;

  await FileSystem.writeAsStringAsync(targetUri, svgContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const info = await FileSystem.getInfoAsync(targetUri);
  return {
    svgContent,
    uri: targetUri,
    size: info.exists && info.size ? info.size : svgContent.length,
  };
}

export {
  optimizeSvgContent,
  extractDominantPalette,
  calculateAspectDimensions,
  calculateCropRect,
} from './ImageHelpers';

/**
 * Upscales an image with 2x or 4x supersampling.
 */
export async function upscaleImage(
  uri: string,
  currentWidth: number,
  currentHeight: number,
  factor: 2 | 4 = 2
): Promise<{ uri: string; width: number; height: number; size: number }> {
  const targetWidth = Math.min(4096, currentWidth * factor);
  const targetHeight = Math.min(4096, currentHeight * factor);

  return await resizeImage(uri, {
    width: targetWidth,
    height: targetHeight,
    quality: 0.95,
    format: SaveFormat.PNG,
  });
}
