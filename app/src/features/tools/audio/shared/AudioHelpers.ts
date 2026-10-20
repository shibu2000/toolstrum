export interface AudioDetailedMetadata {
  format: string;
  duration: number; // seconds
  channels: number;
  channelMode: 'Mono' | 'Stereo' | '5.1 Surround';
  sampleRate: number; // Hz (e.g. 44100, 48000)
  bitrateKbps: number;
  bitsPerSample: number;
  codec: string;
  lossless: boolean;
  fileSizeBytes: number;
  id3Tags: {
    title: string;
    artist: string;
    album: string;
    year: string;
    genre: string;
    trackNumber: string;
  };
}

/**
 * Formats duration in seconds to standard MM:SS or HH:MM:SS string.
 */
export function formatAudioDuration(seconds: number): string {
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
 * Formats file size in bytes to human-readable string.
 */
export function formatAudioFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Formats bitrate in kbps to human-readable string.
 */
export function formatBitrate(kbps: number): string {
  return `${Math.round(kbps)} kbps`;
}

/**
 * Calculates frequency ratio for a given semitone pitch shift.
 * Ratio = 2 ^ (semitones / 12)
 */
export function calculateSemitoneRatio(semitones: number): number {
  return Number(Math.pow(2, semitones / 12).toFixed(4));
}

/**
 * Calculates linear amplitude scaling factor from decibel gain.
 * Linear = 10 ^ (db / 20)
 */
export function calculateDbGainFactor(dbGain: number): number {
  return Number(Math.pow(10, dbGain / 20).toFixed(4));
}

/**
 * Estimates audio file size based on duration, container format, and bitrate.
 */
export function estimateAudioFileSize(
  durationSec: number,
  format: string,
  bitrateKbps?: number
): number {
  const cleanFmt = format.toLowerCase();
  if (cleanFmt === 'wav') {
    // 16-bit 44.1kHz Stereo PCM = 44100 * 2 * 2 bytes/sec = 176,400 bytes/sec
    return 44 + Math.round(176400 * durationSec);
  }
  if (cleanFmt === 'flac') {
    // Lossless compression ~60% of PCM
    return Math.round(176400 * durationSec * 0.6);
  }

  const kbps = bitrateKbps || (cleanFmt === 'aac' || cleanFmt === 'm4a' ? 256 : 192);
  // bytes = (kbps * 1000 / 8) * seconds
  return Math.round(((kbps * 1000) / 8) * durationSec);
}

/**
 * Generates standard 44-byte RIFF PCM WAV binary header.
 */
export function calculateWavHeader(
  numChannels: number,
  sampleRate: number,
  bitsPerSample: number,
  dataBytes: number
): Uint8Array {
  const header = new Uint8Array(44);
  const view = new DataView(header.buffer);

  // "RIFF" chunk descriptor
  header[0] = 0x52; // R
  header[1] = 0x49; // I
  header[2] = 0x46; // F
  header[3] = 0x46; // F
  view.setUint32(4, 36 + dataBytes, true); // chunkSize = 36 + subChunk2Size
  header[8] = 0x57; // W
  header[9] = 0x41; // A
  header[10] = 0x56; // V
  header[11] = 0x45; // E

  // "fmt " sub-chunk
  header[12] = 0x66; // f
  header[13] = 0x6d; // m
  header[14] = 0x74; // t
  header[15] = 0x20; // ' '
  view.setUint32(16, 16, true); // subChunk1Size = 16 for PCM
  view.setUint16(20, 1, true); // audioFormat = 1 (PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);

  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);

  // "data" sub-chunk
  header[36] = 0x64; // d
  header[37] = 0x61; // a
  header[38] = 0x74; // t
  header[39] = 0x61; // a
  view.setUint32(40, dataBytes, true);

  return header;
}

/**
 * Generates an array of normalized amplitude peaks (0.15 - 0.95) for waveform visualization.
 */
export function generateMockWaveform(sampleCount: number = 48): number[] {
  const peaks: number[] = [];
  let prev = 0.5;

  for (let i = 0; i < sampleCount; i++) {
    // Smoothed pseudo-random waveform
    const delta = (Math.sin(i * 0.4) * 0.3) + ((Math.random() - 0.5) * 0.3);
    prev = Math.max(0.15, Math.min(0.95, prev + delta));
    peaks.push(Number(prev.toFixed(2)));
  }

  return peaks;
}

/**
 * Inspects audio file parameters.
 */
export function mockInspectAudio(fileName: string, fileSize: number): AudioDetailedMetadata {
  const ext = fileName.split('.').pop()?.toLowerCase() || 'mp3';
  const isWav = ext === 'wav';
  const isFlac = ext === 'flac';
  const isLossless = isWav || isFlac;

  const duration = Math.max(25, Math.round(fileSize / (isLossless ? 176400 : 24000)));
  const bitrate = isWav ? 1411 : isFlac ? 850 : 320;
  const sampleRate = isWav ? 48000 : 44100;

  const baseTitle = fileName.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

  return {
    format: ext.toUpperCase(),
    duration,
    channels: 2,
    channelMode: 'Stereo',
    sampleRate,
    bitrateKbps: bitrate,
    bitsPerSample: isWav ? 24 : 16,
    codec: isWav ? 'PCM 24-bit Little Endian' : isFlac ? 'FLAC Lossless' : 'MPEG-1 Audio Layer III',
    lossless: isLossless,
    fileSizeBytes: fileSize,
    id3Tags: {
      title: baseTitle,
      artist: 'Toolstrum Audio Artist',
      album: 'On-Device Master Tracks',
      year: '2026',
      genre: 'Electronic / Utility',
      trackNumber: '1',
    },
  };
}
