/**
 * imageConfig.ts
 * Central configuration mapping Image Studio tools (IDs 49–85)
 * to their consolidated workspace templates.
 */

export type ImageWorkspaceType =
  | 'image_editor'      // Workspace A (50, 51, 52, 58, 59, 60, 68)
  | 'image_conversion'  // Workspace B (49, 53, 54, 55, 56, 66, 67, 72, 81, 82, 83, 84)
  | 'image_creation'    // Workspace C (61, 62, 63, 73, 74, 75, 76, 77, 80)
  | 'image_analysis'    // Workspace D (57, 64, 65, 69, 70, 71, 78, 79)
  | 'image_batch';      // Workspace E (85)

export interface ImageToolConfig {
  id: number;
  name: string;
  workspace: ImageWorkspaceType;
  defaultOperation: string;
  description: string;
  iconName: string;
  supportedFormats: string[];
}

export const IMAGE_TOOL_MAP: Record<number, ImageToolConfig> = {
  // --- Workspace A: Image Editor (50, 51, 52, 58, 59, 60, 68) ---
  50: {
    id: 50,
    name: 'Image Resizer',
    workspace: 'image_editor',
    defaultOperation: 'resize',
    description: 'Scale image dimensions by exact pixels or percentage while maintaining aspect ratio.',
    iconName: 'Maximize2',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  51: {
    id: 51,
    name: 'Image Cropper',
    workspace: 'image_editor',
    defaultOperation: 'crop',
    description: 'Crop images to standard aspect ratios (1:1, 4:3, 16:9) or custom dimensions.',
    iconName: 'Crop',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  52: {
    id: 52,
    name: 'Image Rotator',
    workspace: 'image_editor',
    defaultOperation: 'rotate',
    description: 'Rotate images in 90° increments or flip horizontally and vertically.',
    iconName: 'RotateCw',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  58: {
    id: 58,
    name: 'Background Changer',
    workspace: 'image_editor',
    defaultOperation: 'bg_changer',
    description: 'Replace image background with solid colors, gradients, or canvas framing.',
    iconName: 'Palette',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  59: {
    id: 59,
    name: 'Image Watermark',
    workspace: 'image_editor',
    defaultOperation: 'watermark',
    description: 'Stamp custom copyright text or logo overlays onto your photos.',
    iconName: 'Stamp',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  60: {
    id: 60,
    name: 'Image Annotator',
    workspace: 'image_editor',
    defaultOperation: 'annotate',
    description: 'Add text notes, highlights, and markup stamps directly to images.',
    iconName: 'Edit3',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  68: {
    id: 68,
    name: 'Blur Image',
    workspace: 'image_editor',
    defaultOperation: 'blur',
    description: 'Apply privacy blur or soft focus effects to obscure sensitive details.',
    iconName: 'EyeOff',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  // --- Workspace B: Image Conversion & Optimization (49, 53, 54, 55, 56, 66, 67, 72, 81, 82, 83, 84) ---
  49: {
    id: 49,
    name: 'Image Compressor',
    workspace: 'image_conversion',
    defaultOperation: 'compress',
    description: 'Reduce image file size with adaptive JPEG/WEBP compression presets.',
    iconName: 'Minimize2',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  53: {
    id: 53,
    name: 'Image Format Converter',
    workspace: 'image_conversion',
    defaultOperation: 'format_convert',
    description: 'Convert images seamlessly between JPEG, PNG, and WEBP formats.',
    iconName: 'RefreshCw',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp', '.heic'],
  },
  54: {
    id: 54,
    name: 'HEIC Converter',
    workspace: 'image_conversion',
    defaultOperation: 'heic_convert',
    description: 'Convert Apple HEIC/HEIF camera photos into universally compatible JPG or PNG.',
    iconName: 'FileText',
    supportedFormats: ['.heic', '.heif'],
  },
  55: {
    id: 55,
    name: 'Image to PDF',
    workspace: 'image_conversion',
    defaultOperation: 'image_to_pdf',
    description: 'Package one or more photos into a single paginated PDF document.',
    iconName: 'FilePlus',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  56: {
    id: 56,
    name: 'PDF Page to Image',
    workspace: 'image_conversion',
    defaultOperation: 'pdf_to_image',
    description: 'Extract or convert PDF document covers and pages into raster images.',
    iconName: 'Image',
    supportedFormats: ['.pdf'],
  },
  66: {
    id: 66,
    name: 'Image Upscaler',
    workspace: 'image_conversion',
    defaultOperation: 'upscale',
    description: 'High-resolution 2x/4x bicubic super-sampling and detail reconstruction.',
    iconName: 'TrendingUp',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  67: {
    id: 67,
    name: 'Photo Enhancer',
    workspace: 'image_conversion',
    defaultOperation: 'enhance',
    description: 'Optimize image contrast, clarity, saturation, and tonal balance.',
    iconName: 'Sparkles',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  72: {
    id: 72,
    name: 'Transparent PNG Maker',
    workspace: 'image_conversion',
    defaultOperation: 'transparent_png',
    description: 'Add an alpha channel or export transparent PNG background masks.',
    iconName: 'Layers',
    supportedFormats: ['.png', '.jpg', '.jpeg'],
  },
  81: {
    id: 81,
    name: 'SVG Viewer',
    workspace: 'image_conversion',
    defaultOperation: 'svg_view',
    description: 'Inspect scalable vector graphics and view raw XML vector source code.',
    iconName: 'Eye',
    supportedFormats: ['.svg'],
  },
  82: {
    id: 82,
    name: 'SVG Optimizer',
    workspace: 'image_conversion',
    defaultOperation: 'svg_optimize',
    description: 'Minify SVG markup by removing redundant comments, namespaces, and whitespace.',
    iconName: 'Zap',
    supportedFormats: ['.svg'],
  },
  83: {
    id: 83,
    name: 'SVG to PNG',
    workspace: 'image_conversion',
    defaultOperation: 'svg_to_png',
    description: 'Rasterize vector SVG files into crisp, high-resolution PNG bitmap images.',
    iconName: 'Download',
    supportedFormats: ['.svg'],
  },
  84: {
    id: 84,
    name: 'PNG to SVG',
    workspace: 'image_conversion',
    defaultOperation: 'png_to_svg',
    description: 'Wrap or trace raster PNG images into standard scalable SVG vector containers.',
    iconName: 'Share2',
    supportedFormats: ['.png', '.jpg'],
  },

  // --- Workspace C: Image Creation & Layout (61, 62, 63, 73, 74, 75, 76, 77, 80) ---
  61: {
    id: 61,
    name: 'Image Collage Maker',
    workspace: 'image_creation',
    defaultOperation: 'collage',
    description: 'Combine multiple photos into creative 2x2 grids, vertical splits, or strip collages.',
    iconName: 'Grid',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  62: {
    id: 62,
    name: 'Image Merger',
    workspace: 'image_creation',
    defaultOperation: 'merge',
    description: 'Join images side-by-side horizontally or stack them vertically into a single image.',
    iconName: 'Combine',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  63: {
    id: 63,
    name: 'Image Splitter',
    workspace: 'image_creation',
    defaultOperation: 'split',
    description: 'Cut an image into equal grid segments or vertical strips for social carousels.',
    iconName: 'Scissors',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  73: {
    id: 73,
    name: 'Favicon Generator',
    workspace: 'image_creation',
    defaultOperation: 'favicon',
    description: 'Generate standard website favicon sets: 16×16, 32×32, 48×48, and 180×180 Apple touch icon.',
    iconName: 'Globe',
    supportedFormats: ['.png', '.jpg', '.jpeg', '.webp'],
  },
  74: {
    id: 74,
    name: 'Thumbnail Maker',
    workspace: 'image_creation',
    defaultOperation: 'thumbnail',
    description: 'Generate standard video and social thumbnails (1280×720, square 300×300, avatar).',
    iconName: 'Film',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  75: {
    id: 75,
    name: 'Passport Photo Maker',
    workspace: 'image_creation',
    defaultOperation: 'passport',
    description: 'Format photos to official 2×2 inch (600×600 px) or 35×45 mm passport requirements.',
    iconName: 'UserCheck',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  76: {
    id: 76,
    name: 'ID Photo Sheet Maker',
    workspace: 'image_creation',
    defaultOperation: 'id_sheet',
    description: 'Tile multiple passport photos onto a printable 4×6 inch or A4 photo sheet.',
    iconName: 'Grid',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  77: {
    id: 77,
    name: 'Meme Generator',
    workspace: 'image_creation',
    defaultOperation: 'meme',
    description: 'Overlay classic top and bottom caption headers with high-contrast text styling.',
    iconName: 'Smile',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  80: {
    id: 80,
    name: 'Screenshot Stitcher',
    workspace: 'image_creation',
    defaultOperation: 'stitch',
    description: 'Stitch sequential mobile screenshots together vertically into a long scrolling image.',
    iconName: 'Smartphone',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },

  // --- Workspace D: Image Analysis & Extraction (57, 64, 65, 69, 70, 71, 78, 79) ---
  57: {
    id: 57,
    name: 'Background Remover',
    workspace: 'image_analysis',
    defaultOperation: 'bg_remove',
    description: 'Isolate subjects and remove solid/contrasting background areas on-device.',
    iconName: 'Scissors',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  64: {
    id: 64,
    name: 'Image Color Picker',
    workspace: 'image_analysis',
    defaultOperation: 'color_picker',
    description: 'Inspect exact Hex and RGB color codes from any pixel coordinates on your image.',
    iconName: 'Pipette',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  65: {
    id: 65,
    name: 'Image to Text (OCR)',
    workspace: 'image_analysis',
    defaultOperation: 'ocr',
    description: 'Extract printed text, captions, and alphanumeric strings from photos offline.',
    iconName: 'FileText',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  69: {
    id: 69,
    name: 'Image Metadata Viewer',
    workspace: 'image_analysis',
    defaultOperation: 'metadata_view',
    description: 'Inspect EXIF tags, camera model, shutter speed, ISO, dimensions, and color space.',
    iconName: 'Info',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.heic', '.webp'],
  },
  70: {
    id: 70,
    name: 'EXIF Remover',
    workspace: 'image_analysis',
    defaultOperation: 'exif_remove',
    description: 'Strip GPS coordinates, device tags, and personal metadata for private photo sharing.',
    iconName: 'ShieldAlert',
    supportedFormats: ['.jpg', '.jpeg', '.heic'],
  },
  71: {
    id: 71,
    name: 'Image Metadata Editor',
    workspace: 'image_analysis',
    defaultOperation: 'metadata_edit',
    description: 'Edit photo title, artist copyright, and description metadata tags before export.',
    iconName: 'Tag',
    supportedFormats: ['.jpg', '.jpeg', '.png'],
  },
  78: {
    id: 78,
    name: 'Color Palette Extractor',
    workspace: 'image_analysis',
    defaultOperation: 'palette_extract',
    description: 'Extract the dominant 5-color aesthetic palette from any photograph with hex codes.',
    iconName: 'Palette',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  79: {
    id: 79,
    name: 'Image Comparison',
    workspace: 'image_analysis',
    defaultOperation: 'compare',
    description: 'Compare two images side-by-side to inspect differences, quality, and compression.',
    iconName: 'Columns',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },

  // --- Workspace E: Image Batch Processor (85) ---
  85: {
    id: 85,
    name: 'Image Batch Processor',
    workspace: 'image_batch',
    defaultOperation: 'batch_process',
    description: 'Apply bulk compression, resizing, format conversion, or watermarking to multiple photos at once.',
    iconName: 'Layers',
    supportedFormats: ['.jpg', '.jpeg', '.png', '.webp'],
  },
};

/**
 * Returns the Image Studio configuration for a given tool ID if it belongs to Image Studio (49–85).
 */
export function getImageToolConfig(toolId: number): ImageToolConfig | undefined {
  return IMAGE_TOOL_MAP[toolId];
}

/**
 * Checks if a tool ID belongs to Image Studio (49–85).
 */
export function isImageStudioTool(toolId: number): boolean {
  return toolId >= 49 && toolId <= 85 && !!IMAGE_TOOL_MAP[toolId];
}

/**
 * Returns all tools belonging to a specific workspace.
 */
export function getImageToolsByWorkspace(workspace: ImageWorkspaceType): ImageToolConfig[] {
  return Object.values(IMAGE_TOOL_MAP).filter((tool) => tool.workspace === workspace);
}
