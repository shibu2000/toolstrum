export interface SubtitleCue {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
}

export interface VideoDetailedMetadata {
  container: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: string;
  fps: number;
  videoCodec: string;
  audioCodec: string;
  videoBitrateKbps: number;
  audioBitrateKbps: number;
  totalBitrateKbps: number;
  fileSizeBytes: number;
  audioChannels: number;
  sampleRateHz: number;
  colorSpace: string;
  streamsCount: number;
}

/**
 * Formats duration in seconds to standard MM:SS or HH:MM:SS string.
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Formats milliseconds into standard SRT (00:00:00,000) or VTT (00:00:00.000) timecode.
 */
export function formatTimecode(ms: number, format: 'srt' | 'vtt' = 'srt'): string {
  const safeMs = Math.max(0, Math.round(ms));
  const totalSecs = Math.floor(safeMs / 1000);
  const milliseconds = safeMs % 1000;
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;

  const delimiter = format === 'srt' ? ',' : '.';
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs
    .toString()
    .padStart(2, '0')}${delimiter}${milliseconds.toString().padStart(3, '0')}`;
}

/**
 * Parses timecode string (e.g. "00:01:23,450" or "01:23.450" or "01:23") into milliseconds.
 */
export function parseTimecodeToMs(tc: string): number {
  if (!tc) return 0;
  const clean = tc.trim().replace(',', '.');
  const parts = clean.split(':');

  if (parts.length === 3) {
    const hrs = parseFloat(parts[0]) || 0;
    const mins = parseFloat(parts[1]) || 0;
    const secs = parseFloat(parts[2]) || 0;
    return Math.round((hrs * 3600 + mins * 60 + secs) * 1000);
  } else if (parts.length === 2) {
    const mins = parseFloat(parts[0]) || 0;
    const secs = parseFloat(parts[1]) || 0;
    return Math.round((mins * 60 + secs) * 1000);
  }
  const single = parseFloat(clean);
  return isNaN(single) ? 0 : Math.round(single * 1000);
}

/**
 * Formats file size in bytes to human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Formats bitrate in kbps to human-readable string.
 */
export function formatBitrate(kbps: number): string {
  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${Math.round(kbps)} kbps`;
}

/**
 * Parses SubRip (.srt) text content into structured SubtitleCue list.
 */
export function parseSrt(srtContent: string): SubtitleCue[] {
  if (!srtContent || !srtContent.trim()) return [];

  // Normalize line breaks
  const normalized = srtContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalized.trim().split(/\n\s*\n/);
  const cues: SubtitleCue[] = [];

  blocks.forEach((block, idx) => {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      let timeLineIndex = lines.findIndex((l) => l.includes('-->'));
      if (timeLineIndex === -1) return;

      const timeLine = lines[timeLineIndex];
      const textLines = lines.slice(timeLineIndex + 1).join('\n');

      const [startStr, endStr] = timeLine.split('-->').map((s) => s.trim());
      if (startStr && endStr) {
        cues.push({
          id: `cue-${idx + 1}`,
          startMs: parseTimecodeToMs(startStr),
          endMs: parseTimecodeToMs(endStr),
          text: textLines || '',
        });
      }
    }
  });

  return cues;
}

/**
 * Serializes SubtitleCue list into valid SubRip (.srt) format.
 */
export function formatSrt(cues: SubtitleCue[]): string {
  return cues
    .map((cue, index) => {
      const idxStr = (index + 1).toString();
      const timecodeStr = `${formatTimecode(cue.startMs, 'srt')} --> ${formatTimecode(cue.endMs, 'srt')}`;
      return `${idxStr}\n${timecodeStr}\n${cue.text}\n`;
    })
    .join('\n');
}

/**
 * Serializes SubtitleCue list into WebVTT (.vtt) format.
 */
export function formatVtt(cues: SubtitleCue[]): string {
  const header = 'WEBVTT\n\n';
  const body = cues
    .map((cue, index) => {
      const timecodeStr = `${formatTimecode(cue.startMs, 'vtt')} --> ${formatTimecode(cue.endMs, 'vtt')}`;
      return `${index + 1}\n${timecodeStr}\n${cue.text}\n`;
    })
    .join('\n');
  return header + body;
}

/**
 * Calculates standard aspect ratio label and decimal ratio from dimensions.
 */
export function calculateAspectRatio(width: number, height: number): { label: string; ratio: number } {
  if (!width || !height) return { label: '16:9', ratio: 16 / 9 };
  const decimal = width / height;

  if (Math.abs(decimal - 16 / 9) < 0.05) return { label: '16:9', ratio: decimal };
  if (Math.abs(decimal - 9 / 16) < 0.05) return { label: '9:16', ratio: decimal };
  if (Math.abs(decimal - 4 / 3) < 0.05) return { label: '4:3', ratio: decimal };
  if (Math.abs(decimal - 1) < 0.05) return { label: '1:1', ratio: decimal };
  if (Math.abs(decimal - 21 / 9) < 0.05) return { label: '21:9', ratio: decimal };
  if (Math.abs(decimal - 4 / 5) < 0.05) return { label: '4:5', ratio: decimal };

  return { label: `${width}:${height}`, ratio: decimal };
}

/**
 * Computes target scaled dimensions preserving aspect ratio.
 */
export function calculateTargetDimensions(
  origWidth: number,
  origHeight: number,
  targetRes: string
): { width: number; height: number } {
  const isPortrait = origHeight > origWidth;
  let maxDim = 1920;

  switch (targetRes.toLowerCase()) {
    case '4k':
    case '2160p':
      maxDim = 3840;
      break;
    case '1440p':
      maxDim = 2560;
      break;
    case '1080p':
      maxDim = 1920;
      break;
    case '720p':
      maxDim = 1280;
      break;
    case '480p':
      maxDim = 854;
      break;
    case '360p':
      maxDim = 640;
      break;
    default:
      return { width: origWidth, height: origHeight };
  }

  const ratio = origWidth / origHeight;
  if (isPortrait) {
    const height = Math.min(origHeight, maxDim);
    const width = Math.round(height * ratio);
    return { width: width - (width % 2), height: height - (height % 2) };
  } else {
    const width = Math.min(origWidth, maxDim);
    const height = Math.round(width / ratio);
    return { width: width - (width % 2), height: height - (height % 2) };
  }
}

/**
 * Estimates output file size based on duration and target resolution/bitrate.
 */
export function calculateEstimatedFileSize(
  durationSec: number,
  targetResolution: string,
  customBitrateKbps?: number
): number {
  let videoBitrate = customBitrateKbps || 4500;
  if (!customBitrateKbps) {
    switch (targetResolution.toLowerCase()) {
      case '4k':
      case '2160p':
        videoBitrate = 18000;
        break;
      case '1440p':
        videoBitrate = 9000;
        break;
      case '1080p':
        videoBitrate = 4500;
        break;
      case '720p':
        videoBitrate = 2200;
        break;
      case '480p':
        videoBitrate = 1000;
        break;
      default:
        videoBitrate = 3000;
    }
  }

  const audioBitrate = 192; // standard stereo AAC
  const totalBitrateKbps = videoBitrate + audioBitrate;
  // bytes = (kbps * 1000 / 8) * seconds
  return Math.round((totalBitrateKbps * 1000 * durationSec) / 8);
}

/**
 * Generates synthetic frame markers for storyboard contact sheet.
 */
export function generateMockStoryboardFrames(
  durationSec: number,
  frameCount: number = 8
): Array<{ timecode: string; label: string; offsetSec: number }> {
  const safeDuration = Math.max(durationSec, 5);
  const step = safeDuration / (frameCount + 1);
  const frames = [];

  for (let i = 1; i <= frameCount; i++) {
    const offset = Math.round(i * step * 10) / 10;
    frames.push({
      timecode: formatDuration(offset),
      label: `Scene Take ${i}`,
      offsetSec: offset,
    });
  }

  return frames;
}

/**
 * Generates detailed inspection metadata for a given video file.
 */
export function mockInspectVideo(fileName: string, fileSize: number): VideoDetailedMetadata {
  const ext = fileName.split('.').pop()?.toLowerCase() || 'mp4';
  const duration = Math.max(30, Math.round(fileSize / (450 * 1024))); // approximate ~450KB/sec
  const is4k = fileSize > 200 * 1024 * 1024;
  const width = is4k ? 3840 : 1920;
  const height = is4k ? 2160 : 1080;
  const videoBitrate = is4k ? 14500 : 3800;

  return {
    container: ext.toUpperCase(),
    duration,
    width,
    height,
    aspectRatio: '16:9',
    fps: 30,
    videoCodec: ext === 'webm' ? 'VP9' : ext === 'mkv' ? 'HEVC / H.265' : 'AVC / H.264 (High@L4.2)',
    audioCodec: ext === 'webm' ? 'Opus' : 'AAC-LC',
    videoBitrateKbps: videoBitrate,
    audioBitrateKbps: 192,
    totalBitrateKbps: videoBitrate + 192,
    fileSizeBytes: fileSize,
    audioChannels: 2,
    sampleRateHz: 48000,
    colorSpace: 'BT.709 (sRGB primaries)',
    streamsCount: 2,
  };
}
