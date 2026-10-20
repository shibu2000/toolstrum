import * as FileSystem from 'expo-file-system/legacy';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { trim, compress, extractAudio, merge, toGif, mixAudio, getFrameAt } from 'react-native-video-trim';
import {
  formatDuration,
  formatSrt,
  formatVtt,
  calculateEstimatedFileSize,
  calculateTargetDimensions,
  SubtitleCue,
} from './VideoHelpers';

const getFileSize = async (uri: string): Promise<number> => {
  const info = await FileSystem.getInfoAsync(uri);
  return info.exists && 'size' in info ? (info.size as number) : 0;
};

export interface ProcessedVideoResult {
  uri: string;
  name: string;
  size: number;
  duration?: number;
  resolution?: string;
  format?: string;
  savingsPercent?: number;
  vmafScore?: number;
  metadata?: Record<string, string | number>;
}

export class VideoEngine {
  /**
   * Generates a printable PDF storyboard contact sheet using pdf-lib.
   */
  static async generateStoryboardPdf(
    videoTitle: string,
    durationSec: number,
    frames: Array<{ timecode: string; label: string }>
  ): Promise<{ uri: string; size: number; name: string }> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 Portrait
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header banner
    page.drawRectangle({
      x: 36,
      y: 770,
      width: 523,
      height: 44,
      color: rgb(0.66, 0.33, 0.97), // Studio Accent Violet (#A855F7)
    });

    page.drawText('TOOLSTRUM VIDEO STORYBOARD & TIMELINE', {
      x: 50,
      y: 786,
      size: 14,
      font: fontBold,
      color: rgb(1, 1, 1),
    });

    // Metadata details
    page.drawText(`Source: ${videoTitle}`, {
      x: 36,
      y: 746,
      size: 10,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.2),
    });

    page.drawText(`Duration: ${formatDuration(durationSec)} | Generated: ${new Date().toLocaleDateString()}`, {
      x: 36,
      y: 732,
      size: 9,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.5),
    });

    // Grid of frames: 2 columns x 4 rows
    const colWidth = 246;
    const rowHeight = 130;
    const startX = 36;
    let startY = 570;

    frames.slice(0, 8).forEach((frame, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = startX + col * (colWidth + 30);
      const y = startY - row * (rowHeight + 20);

      // Frame mock thumbnail box
      page.drawRectangle({
        x,
        y,
        width: colWidth,
        height: rowHeight,
        color: rgb(0.95, 0.94, 0.98),
        borderColor: rgb(0.8, 0.75, 0.9),
        borderWidth: 1,
      });

      // Frame time badge
      page.drawRectangle({
        x: x + 8,
        y: y + rowHeight - 24,
        width: 60,
        height: 16,
        color: rgb(0.1, 0.1, 0.18),
      });

      page.drawText(frame.timecode, {
        x: x + 14,
        y: y + rowHeight - 19,
        size: 9,
        font: fontBold,
        color: rgb(1, 1, 1),
      });

      // Frame description label
      page.drawText(`${frame.label}`, {
        x: x + 8,
        y: y + 10,
        size: 9,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.4),
      });
    });

    // Footer
    page.drawText('Generated 100% On-Device by Toolstrum Video Studio', {
      x: 36,
      y: 30,
      size: 8,
      font: fontRegular,
      color: rgb(0.6, 0.6, 0.7),
    });

    const pdfBytes = await pdfDoc.save();
    const cleanBase = videoTitle.replace(/\.[^/.]+$/, '');
    const outName = `${cleanBase}_storyboard_${Date.now()}.pdf`;
    const outUri = `${FileSystem.documentDirectory || ''}${outName}`;

    // Write binary via base64
    let binary = '';
    const len = pdfBytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(pdfBytes[i]);
    }
    const b64 = btoa(binary);
    await FileSystem.writeAsStringAsync(outUri, b64, { encoding: FileSystem.EncodingType.Base64 });

    return { uri: outUri, size: len, name: outName };
  }

  /**
   * Exports subtitle cues to file (.srt, .vtt, or .txt).
   */
  static async exportSubtitlesFile(
    cues: SubtitleCue[],
    format: 'srt' | 'vtt' | 'txt',
    baseTitle: string
  ): Promise<{ uri: string; size: number; name: string; content: string }> {
    let content = '';
    if (format === 'srt') {
      content = formatSrt(cues);
    } else if (format === 'vtt') {
      content = formatVtt(cues);
    } else {
      content = cues.map((c) => `[${formatDuration(c.startMs / 1000)}] ${c.text}`).join('\n\n');
    }

    const cleanBase = baseTitle.replace(/\.[^/.]+$/, '');
    const outName = `${cleanBase}_subtitles.${format}`;
    const outUri = `${FileSystem.documentDirectory || ''}${outName}`;

    await FileSystem.writeAsStringAsync(outUri, content);
    const info = await FileSystem.getInfoAsync(outUri);
    const size = info.exists && 'size' in info ? (info.size as number) : content.length;

    return { uri: outUri, size, name: outName, content };
  }

  /**
   * Performs real on-device video trimming via react-native-video-trim
   * (AVFoundation on iOS, MediaCodec on Android).
   */
  static async processVideoTrim(
    inputUri: string,
    inputName: string,
    inputSize: number,
    durationSec: number,
    startSec: number,
    endSec: number
  ): Promise<ProcessedVideoResult> {
    const trimmedDuration = Math.max(0.1, endSec - startSec);
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    const result = await trim(inputUri, {
      startTime: Math.round(startSec * 1000),
      endTime: Math.round(endSec * 1000),
      enablePreciseTrimming: true,
      outputExt: 'mp4',
    });

    const size = await getFileSize(result.outputPath);

    return {
      uri: result.outputPath,
      name: `${cleanBase}_trimmed_${Math.round(startSec)}s_${Math.round(endSec)}s.mp4`,
      size,
      duration: Number(trimmedDuration.toFixed(1)),
      resolution: 'Original',
      format: 'MP4',
      metadata: {
        'Start Point': `${formatDuration(startSec)}`,
        'End Point': `${formatDuration(endSec)}`,
        'Trimmed Length': `${formatDuration(trimmedDuration)}`,
      },
    };
  }

  /**
   * Performs real on-device video compression/transcoding via
   * react-native-video-trim's native hardware encoders.
   */
  static async processVideoTranscode(
    inputUri: string,
    inputName: string,
    inputSize: number,
    durationSec: number,
    options: {
      format?: string;
      resolution?: string;
      preset?: 'small' | 'balanced' | 'high';
      fps?: number;
      sourceWidth?: number;
      sourceHeight?: number;
    }
  ): Promise<ProcessedVideoResult> {
    const ext = options.format || 'mp4';
    const res = options.resolution || '1080p';
    const preset = options.preset || 'balanced';
    const quality: 'low' | 'medium' | 'high' = preset === 'small' ? 'low' : preset === 'high' ? 'high' : 'medium';

    const targetDims = calculateTargetDimensions(
      options.sourceWidth || 1920,
      options.sourceHeight || 1080,
      res
    );

    const result = await compress(inputUri, {
      quality,
      width: targetDims.width,
      height: targetDims.height,
      frameRate: options.fps ?? -1,
      outputExt: ext.toLowerCase(),
    });

    const size = await getFileSize(result.outputPath);
    const savings = inputSize > 0 ? Math.max(0, Math.round((1 - size / inputSize) * 100)) : 0;

    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_${res}_${preset}.${ext.toLowerCase()}`,
      size,
      duration: durationSec,
      resolution: res,
      format: ext.toUpperCase(),
      savingsPercent: savings,
      metadata: {
        Resolution: res,
        Container: ext.toUpperCase(),
        QualityPreset: preset.toUpperCase(),
        FPS: options.fps || 30,
      },
    };
  }

  /**
   * Extracts the real audio track via react-native-video-trim's native decoder.
   */
  static async processAudioExtraction(
    inputUri: string,
    inputName: string,
    durationSec: number,
    format: 'mp3' | 'aac' | 'wav' = 'mp3'
  ): Promise<ProcessedVideoResult> {
    const outputExt = format === 'aac' ? 'm4a' : format;
    const result = await extractAudio(inputUri, { outputExt: outputExt as 'm4a' | 'wav' | 'mp3' });
    const size = await getFileSize(result.outputPath);
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_soundtrack.${outputExt}`,
      size,
      duration: result.duration ? result.duration / 1000 : durationSec,
      format: outputExt.toUpperCase(),
      metadata: {
        Codec: format === 'mp3' ? 'MPEG Audio Layer III' : format === 'aac' ? 'AAC-LC (M4A)' : 'PCM Linear WAV',
      },
    };
  }

  /**
   * Stitches multiple video clips sequentially via native concatenation.
   * Note: transitions are not supported by the underlying native trimmer —
   * clips are joined with a hard cut regardless of the requested transition.
   */
  static async processVideoAssembly(
    clips: Array<{ uri: string; name: string; size: number; duration: number }>,
    transition: string = 'none'
  ): Promise<ProcessedVideoResult> {
    const result = await merge(
      clips.map((c) => c.uri),
      { outputExt: 'mp4' }
    );
    const size = await getFileSize(result.outputPath);
    const totalDuration = result.duration ? result.duration / 1000 : clips.reduce((acc, c) => acc + c.duration, 0);

    return {
      uri: result.outputPath,
      name: `Stitched_Assembly_${clips.length}_Clips_${Date.now()}.mp4`,
      size,
      duration: totalDuration,
      resolution: '1080p',
      format: 'MP4',
      metadata: {
        'Clips Joined': clips.length,
        'Transition Effect': 'Hard cut (native merge does not support transitions)',
        'Total Run Time': formatDuration(totalDuration),
      },
    };
  }

  /**
   * Converts a video clip to an animated GIF via native frame sampling.
   */
  static async processVideoToGif(
    inputUri: string,
    inputName: string,
    startSec: number,
    endSec: number,
    fps: number,
    maxWidth: number
  ): Promise<ProcessedVideoResult> {
    const result = await toGif(inputUri, {
      startTime: Math.round(startSec * 1000),
      endTime: Math.round(endSec * 1000),
      fps,
      width: maxWidth,
    });
    const size = await getFileSize(result.outputPath);
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_animated.gif`,
      size,
      duration: Math.max(0.1, endSec - startSec),
      format: 'GIF',
      metadata: {
        'Target Format': 'Animated GIF',
        'Frame Rate': `${fps} FPS`,
        'Max Width': maxWidth > 0 ? `${maxWidth}px` : 'Original',
      },
    };
  }

  /**
   * Re-encodes a video at a different frame rate via the native compressor.
   */
  static async processFrameRateChange(
    inputUri: string,
    inputName: string,
    inputSize: number,
    durationSec: number,
    targetFps: number
  ): Promise<ProcessedVideoResult> {
    const result = await compress(inputUri, {
      quality: 'high',
      width: -1,
      height: -1,
      frameRate: targetFps,
      outputExt: 'mp4',
    });
    const size = await getFileSize(result.outputPath);
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_${targetFps}fps.mp4`,
      size,
      duration: durationSec,
      format: 'MP4',
      metadata: {
        'Target Framerate': `${targetFps} FPS`,
      },
    };
  }

  /**
   * Compresses a queue of videos sequentially for real; returns one result per file
   * (no zip bundling — no archive library is available on mobile).
   */
  static async processBatchTranscode(
    clips: Array<{ uri: string; name: string; size: number; duration: number }>,
    targetFormat: string,
    targetResolution: string
  ): Promise<ProcessedVideoResult[]> {
    const results: ProcessedVideoResult[] = [];
    for (const clip of clips) {
      const outputResult = await this.processVideoTranscode(clip.uri, clip.name, clip.size, clip.duration, {
        format: targetFormat,
        resolution: targetResolution,
        preset: 'balanced',
      });
      results.push(outputResult);
    }
    return results;
  }

  /**
   * Changes playback speed (0.25x-4x) via the native trimmer's speed option,
   * re-encoding the full clip.
   */
  static async processSpeedChange(
    inputUri: string,
    inputName: string,
    durationSec: number,
    speed: number
  ): Promise<ProcessedVideoResult> {
    const clampedSpeed = Math.min(4, Math.max(0.25, speed));
    const result = await trim(inputUri, {
      startTime: 0,
      endTime: Math.round(durationSec * 1000),
      speed: clampedSpeed,
      outputExt: 'mp4',
    });
    const size = await getFileSize(result.outputPath);
    const newDuration = Math.round((durationSec / clampedSpeed) * 10) / 10;
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_speed_${clampedSpeed}x.mp4`,
      size,
      duration: newDuration,
      format: 'MP4',
      metadata: {
        'Playback Speed': `${clampedSpeed}x`,
        'New Duration': formatDuration(newDuration),
      },
    };
  }

  /**
   * Strips the audio track via the native compressor (video re-encoded, no audio stream).
   */
  static async processVideoMute(
    inputUri: string,
    inputName: string,
    durationSec: number
  ): Promise<ProcessedVideoResult> {
    const result = await compress(inputUri, {
      quality: 'high',
      width: -1,
      height: -1,
      removeAudio: true,
      outputExt: 'mp4',
    });
    const size = await getFileSize(result.outputPath);
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_muted.mp4`,
      size,
      duration: durationSec,
      format: 'MP4',
      metadata: {
        'Audio Streams': '0 (stripped)',
      },
    };
  }

  /**
   * Replaces a video's soundtrack with a user-picked audio file via native mixing
   * (original track muted, replacement track mixed in at the chosen volume).
   */
  static async processAudioReplacement(
    inputUri: string,
    inputName: string,
    durationSec: number,
    audioUri: string,
    volume: number
  ): Promise<ProcessedVideoResult> {
    const result = await mixAudio(inputUri, audioUri, {
      originalAudioVolume: 0,
      backgroundAudioVolume: volume,
      loopAudio: true,
      outputExt: 'mp4',
    });
    const size = await getFileSize(result.outputPath);
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_new_soundtrack.mp4`,
      size,
      duration: durationSec,
      format: 'MP4',
      metadata: {
        'Music Level': `${Math.round(volume * 100)}%`,
      },
    };
  }

  /**
   * Captures a single real frame via native frame extraction.
   */
  static async processThumbnail(
    inputUri: string,
    inputName: string,
    timestampSec: number,
    width: number,
    height: number
  ): Promise<ProcessedVideoResult> {
    const result = await getFrameAt(inputUri, {
      time: Math.round(timestampSec * 1000),
      format: 'jpeg',
      quality: 95,
    });
    const size = await getFileSize(result.outputPath);
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');

    return {
      uri: result.outputPath,
      name: `${cleanBase}_poster_${Math.round(timestampSec)}s.jpg`,
      size,
      resolution: `${width}×${height}`,
      format: 'JPEG',
      metadata: {
        'Capture Timecode': formatDuration(timestampSec),
        'Pixel Dimensions': `${width} × ${height}`,
      },
    };
  }

  /**
   * Extracts multiple real frames at a fixed interval. No zip bundling —
   * no archive library is available on mobile — results are listed individually.
   */
  static async processFrameSequence(
    inputUri: string,
    inputName: string,
    durationSec: number,
    intervalSec: number
  ): Promise<ProcessedVideoResult[]> {
    const totalFrames = Math.max(1, Math.floor(durationSec / intervalSec));
    const cleanBase = inputName.replace(/\.[^/.]+$/, '');
    const results: ProcessedVideoResult[] = [];

    for (let i = 0; i < totalFrames; i++) {
      const t = i * intervalSec;
      const result = await getFrameAt(inputUri, {
        time: Math.round(t * 1000),
        format: 'jpeg',
        quality: 85,
      });
      const size = await getFileSize(result.outputPath);
      results.push({
        uri: result.outputPath,
        name: `${cleanBase}_frame_${String(i + 1).padStart(3, '0')}.jpg`,
        size,
        format: 'JPEG',
        metadata: { Timecode: formatDuration(t) },
      });
    }

    return results;
  }
}
