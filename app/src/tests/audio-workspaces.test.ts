/**
 * audio-workspaces.test.ts
 * Verification test suite for Audio Studio consolidated workspaces (Tools 129–153).
 * Tests catalog integrity, workspace mappings, WAV binary headers, DSP math, and audio helpers.
 */

import { AUDIO_TOOLS, getAudioToolConfig, AudioWorkspaceId } from '../features/tools/audio/audioConfig';
import { getToolById } from '../data/registry';
import {
  formatAudioDuration,
  formatAudioFileSize,
  formatBitrate,
  calculateSemitoneRatio,
  calculateDbGainFactor,
  estimateAudioFileSize,
  calculateWavHeader,
  generateMockWaveform,
  mockInspectAudio,
} from '../features/tools/audio/shared/AudioHelpers';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTestSuite() {
  console.log('--- STARTING AUDIO STUDIO CONSOLIDATION TEST SUITE ---');

  const EXPECTED_AUDIO_TOOLS: Record<number, string> = {
    129: 'Audio Compressor',
    130: 'Audio Converter',
    131: 'Audio Trimmer',
    132: 'Audio Merger',
    133: 'Audio Splitter',
    134: 'Audio Speed Changer',
    135: 'Pitch Changer',
    136: 'Volume Booster',
    137: 'Audio Normalizer',
    138: 'Audio Noise Reducer',
    139: 'Voice Recorder',
    140: 'Audio to Text',
    141: 'Text to Speech',
    142: 'Audio to WAV',
    143: 'Audio to MP3',
    144: 'Video Audio Extractor',
    145: 'Audio Metadata Editor',
    146: 'Album Art Editor',
    147: 'Audio Waveform Viewer',
    148: 'Silence Remover',
    149: 'Voice Changer',
    150: 'Audio Channel Converter',
    151: 'Ringtone Maker',
    152: 'Audio Batch Converter',
    153: 'Audio Joiner with Crossfade',
  };

  // 1. Audit All 25 Tools in Audio Catalog (129–153)
  console.log('1. Auditing Canonical Catalog Entries for Tools 129–153...');
  const toolIds = Object.keys(EXPECTED_AUDIO_TOOLS).map(Number);
  assert(toolIds.length === 25, `Expected 25 tools, found ${toolIds.length}`);

  for (const id of toolIds) {
    const registryTool = getToolById(id);
    assert(!!registryTool, `Tool ${id} missing from registry.ts`);
    assert(registryTool!.name === EXPECTED_AUDIO_TOOLS[id], `Tool ${id} name mismatch: "${registryTool?.name}" !== "${EXPECTED_AUDIO_TOOLS[id]}"`);
    assert(registryTool!.studioId === 'audio', `Tool ${id} studioId should be 'audio'`);
    assert(registryTool!.offlineCapable === true, `Tool ${id} must be offlineCapable: true`);

    const cfg = getAudioToolConfig(id);
    assert(!!cfg, `Tool ${id} missing from AUDIO_TOOLS config`);
    assert(cfg!.name === EXPECTED_AUDIO_TOOLS[id], `Config name mismatch for tool ${id}`);
    assert(cfg!.supportedOperations.length > 0, `Config for ${id} has empty supportedOperations`);
  }
  console.log('✓ All 25 Audio Studio tools (129–153) verified with exact names and offline metadata.');

  // 2. Audit Tool-to-Workspace Mappings
  console.log('2. Auditing Tool-to-Workspace Consolidated Mappings...');
  const distribution: Record<AudioWorkspaceId, number[]> = {
    audio_editor: [],
    audio_transcode: [],
    audio_effects: [],
    audio_assembly: [],
    audio_speech_tags: [],
  };

  for (let id = 129; id <= 153; id++) {
    const cfg = getAudioToolConfig(id);
    assert(!!cfg, `Tool ${id} missing config`);
    distribution[cfg!.workspace].push(id);
  }

  assert(JSON.stringify(distribution.audio_editor) === JSON.stringify([131, 133, 147, 148, 151]), 'audio_editor mismatch');
  assert(JSON.stringify(distribution.audio_transcode) === JSON.stringify([129, 130, 142, 143, 150, 152]), 'audio_transcode mismatch');
  assert(JSON.stringify(distribution.audio_effects) === JSON.stringify([134, 135, 136, 137, 138, 149]), 'audio_effects mismatch');
  assert(JSON.stringify(distribution.audio_assembly) === JSON.stringify([132, 144, 153]), 'audio_assembly mismatch');
  assert(JSON.stringify(distribution.audio_speech_tags) === JSON.stringify([139, 140, 141, 145, 146]), 'audio_speech_tags mismatch');

  const total = Object.values(distribution).reduce((a, b) => a + b.length, 0);
  assert(total === 25, `Expected 25 total mapped tools, got ${total}`);
  console.log('✓ All 25 tools cleanly mapped to 5 reusable workspaces with 0 gaps.');

  // 3. Test Timecode & Duration Formatting
  console.log('3. Validating Audio Timecode & Duration Utilities...');
  assert(formatAudioDuration(0) === '00:00', 'formatAudioDuration 0 failed');
  assert(formatAudioDuration(45) === '00:45', 'formatAudioDuration 45 failed');
  assert(formatAudioDuration(184) === '03:04', 'formatAudioDuration 184 failed');
  assert(formatAudioDuration(3665) === '01:01:05', 'formatAudioDuration 3665 failed');
  assert(formatAudioFileSize(1024 * 1024 * 8.4) === '8.4 MB', 'formatAudioFileSize failed');
  assert(formatBitrate(320) === '320 kbps', 'formatBitrate failed');
  console.log('✓ Audio timecode and duration formatters validated.');

  // 4. Test DSP Musical Pitch & Decibel Gain Math
  console.log('4. Validating DSP Frequency and Gain Algorithms...');
  assert(calculateSemitoneRatio(0) === 1.0, 'Semitone 0 should be 1.0 ratio');
  assert(calculateSemitoneRatio(12) === 2.0, 'Semitone +12 should be exactly 2.0 (octave up)');
  assert(calculateSemitoneRatio(-12) === 0.5, 'Semitone -12 should be exactly 0.5 (octave down)');
  assert(Math.abs(calculateSemitoneRatio(7) - 1.4983) < 0.001, 'Semitone +7 should be ~1.4983 (perfect fifth)');

  assert(calculateDbGainFactor(0) === 1.0, '0 dB should be 1.0 linear gain');
  assert(Math.abs(calculateDbGainFactor(6) - 1.9953) < 0.001, '+6 dB should double amplitude (~1.9953)');
  assert(calculateDbGainFactor(20) === 10.0, '+20 dB should be exactly 10.0 linear gain');
  console.log('✓ DSP frequency transposition and decibel linear gain models verified.');

  // 5. Test RIFF PCM WAV Binary Header Synthesis
  console.log('5. Validating Offline RIFF WAV 44-Byte Binary Header Synthesis...');
  const testDataBytes = 176400; // 1 second of 44.1kHz 16-bit stereo PCM
  const wavHeader = calculateWavHeader(2, 44100, 16, testDataBytes);
  assert(wavHeader.byteLength === 44, `WAV header must be exactly 44 bytes, got ${wavHeader.byteLength}`);

  const riffMagic = String.fromCharCode(wavHeader[0], wavHeader[1], wavHeader[2], wavHeader[3]);
  assert(riffMagic === 'RIFF', `Header chunk must be RIFF, got ${riffMagic}`);

  const waveMagic = String.fromCharCode(wavHeader[8], wavHeader[9], wavHeader[10], wavHeader[11]);
  assert(waveMagic === 'WAVE', `Format must be WAVE, got ${waveMagic}`);

  const fmtMagic = String.fromCharCode(wavHeader[12], wavHeader[13], wavHeader[14], wavHeader[15]);
  assert(fmtMagic === 'fmt ', `Subchunk1 must be 'fmt ', got ${fmtMagic}`);

  const dataMagic = String.fromCharCode(wavHeader[36], wavHeader[37], wavHeader[38], wavHeader[39]);
  assert(dataMagic === 'data', `Subchunk2 must be 'data', got ${dataMagic}`);

  const view = new DataView(wavHeader.buffer);
  assert(view.getUint16(20, true) === 1, 'AudioFormat must be 1 for uncompressed PCM');
  assert(view.getUint16(22, true) === 2, 'NumChannels must be 2');
  assert(view.getUint32(24, true) === 44100, 'SampleRate must be 44100');
  assert(view.getUint32(28, true) === 176400, 'ByteRate must be 176400 (44100 * 2 * 2)');
  assert(view.getUint16(32, true) === 4, 'BlockAlign must be 4 (2 channels * 2 bytes)');
  assert(view.getUint16(34, true) === 16, 'BitsPerSample must be 16');
  assert(view.getUint32(40, true) === testDataBytes, 'Subchunk2Size data length mismatch');
  console.log('✓ Standard RIFF PCM WAV binary header validated down to exact bitfield offsets.');

  // 6. Test File Size Estimation & Inspection Models
  console.log('6. Validating File Size Estimation & Inspection Models...');
  const wavEst = estimateAudioFileSize(10, 'wav');
  assert(wavEst === 44 + 1764000, `WAV estimate mismatch: ${wavEst}`);

  const mp3Est = estimateAudioFileSize(60, 'mp3', 320);
  assert(mp3Est === 2400000, `MP3 estimate mismatch: ${mp3Est}`);

  const waveform = generateMockWaveform(48);
  assert(waveform.length === 48, 'Waveform should generate 48 bars');
  assert(waveform.every((w) => w >= 0.15 && w <= 0.95), 'Waveform values out of [0.15, 0.95] range');

  const metadata = mockInspectAudio('podcast_audio.mp3', 12 * 1024 * 1024);
  assert(metadata.format === 'MP3', 'Metadata format mismatch');
  assert(metadata.channelMode === 'Stereo', 'Metadata channelMode mismatch');
  assert(metadata.id3Tags.title === 'podcast audio', 'Metadata title mismatch');
  console.log('✓ File size estimations and audio waveform generation models verified.');

  console.log('--- ALL AUDIO STUDIO TESTS PASSED (100% SUCCESS) ---');
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
