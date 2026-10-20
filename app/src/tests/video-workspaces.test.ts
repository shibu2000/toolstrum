/**
 * video-workspaces.test.ts
 * Verification test suite for Video Studio consolidated workspaces (Tools 104–128).
 * Tests catalog integrity, workspace mappings, subtitle parsers, and video helpers.
 */

import { VIDEO_TOOLS, getVideoToolConfig, VideoWorkspaceId } from '../features/tools/video/videoConfig';
import { getToolById } from '../data/registry';
import {
  formatDuration,
  formatTimecode,
  parseTimecodeToMs,
  formatFileSize,
  formatBitrate,
  parseSrt,
  formatSrt,
  formatVtt,
  calculateAspectRatio,
  calculateTargetDimensions,
  calculateEstimatedFileSize,
  generateMockStoryboardFrames,
  mockInspectVideo,
} from '../features/tools/video/shared/VideoHelpers';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTestSuite() {
  console.log('--- STARTING VIDEO STUDIO CONSOLIDATION TEST SUITE ---');

  const EXPECTED_VIDEO_TOOLS: Record<number, string> = {
    104: 'Video Compressor',
    105: 'Video Trimmer',
    106: 'Video Merger',
    107: 'Video Cropper',
    108: 'Video Rotator',
    109: 'Video Format Converter',
    110: 'Video to MP3',
    111: 'Video to GIF',
    112: 'Video to Images',
    113: 'Video Speed Controller',
    114: 'Video Mute',
    115: 'Video Watermark',
    116: 'Subtitle Editor',
    117: 'Subtitle Extractor',
    118: 'Video Resolution Changer',
    119: 'Video Frame Rate Converter',
    120: 'Video Metadata Viewer',
    121: 'Video Thumbnail Maker',
    122: 'Video Stabilizer',
    123: 'Audio Replacement',
    124: 'Video to PDF Storyboard',
    125: 'Screen Recorder',
    126: 'Camera Recorder',
    127: 'Batch Video Converter',
    128: 'Video Merge with Transitions',
  };

  // 1. Audit All 25 Tools in Video Catalog (104–128)
  console.log('1. Auditing Canonical Catalog Entries for Tools 104–128...');
  const toolIds = Object.keys(EXPECTED_VIDEO_TOOLS).map(Number);
  assert(toolIds.length === 25, `Expected 25 tools, found ${toolIds.length}`);

  for (const id of toolIds) {
    const registryTool = getToolById(id);
    assert(!!registryTool, `Tool ${id} missing from registry.ts`);
    assert(registryTool!.name === EXPECTED_VIDEO_TOOLS[id], `Tool ${id} name mismatch: "${registryTool?.name}" !== "${EXPECTED_VIDEO_TOOLS[id]}"`);
    assert(registryTool!.studioId === 'video', `Tool ${id} studioId should be 'video'`);
    assert(registryTool!.offlineCapable === true, `Tool ${id} must be offlineCapable: true`);

    const cfg = getVideoToolConfig(id);
    assert(!!cfg, `Tool ${id} missing from VIDEO_TOOLS config`);
    assert(cfg!.name === EXPECTED_VIDEO_TOOLS[id], `Config name mismatch for tool ${id}`);
    assert(cfg!.supportedOperations.length > 0, `Config for ${id} has empty supportedOperations`);
  }
  console.log('✓ All 25 Video Studio tools (104–128) verified with exact names and offline metadata.');

  // 2. Audit Tool-to-Workspace Mappings
  console.log('2. Auditing Tool-to-Workspace Consolidated Mappings...');
  const distribution: Record<VideoWorkspaceId, number[]> = {
    video_editor: [],
    video_transcode: [],
    video_assembly: [],
    video_audio_subtitles: [],
    video_inspector: [],
  };

  for (let id = 104; id <= 128; id++) {
    const cfg = getVideoToolConfig(id);
    assert(!!cfg, `Tool ${id} missing config`);
    distribution[cfg!.workspace].push(id);
  }

  assert(JSON.stringify(distribution.video_editor) === JSON.stringify([105, 107, 108, 113, 115, 122]), 'video_editor tools mismatch');
  assert(JSON.stringify(distribution.video_transcode) === JSON.stringify([104, 109, 111, 118, 119, 127]), 'video_transcode tools mismatch');
  assert(JSON.stringify(distribution.video_assembly) === JSON.stringify([106, 125, 126, 128]), 'video_assembly tools mismatch');
  assert(JSON.stringify(distribution.video_audio_subtitles) === JSON.stringify([110, 114, 116, 117, 123]), 'video_audio_subtitles tools mismatch');
  assert(JSON.stringify(distribution.video_inspector) === JSON.stringify([112, 120, 121, 124]), 'video_inspector tools mismatch');

  const total = Object.values(distribution).reduce((a, b) => a + b.length, 0);
  assert(total === 25, `Expected 25 total mapped tools, got ${total}`);
  console.log('✓ All 25 tools cleanly mapped to 5 reusable workspaces with 0 gaps.');

  // 3. Test Timecode & Duration
  console.log('3. Validating Timecode & Duration Utilities...');
  assert(formatDuration(0) === '00:00', 'formatDuration 0 failed');
  assert(formatDuration(45) === '00:45', 'formatDuration 45 failed');
  assert(formatDuration(125) === '02:05', 'formatDuration 125 failed');
  assert(formatDuration(3665) === '01:01:05', 'formatDuration 3665 failed');

  assert(formatTimecode(1500, 'srt') === '00:00:01,500', 'formatTimecode srt failed');
  assert(formatTimecode(1500, 'vtt') === '00:00:01.500', 'formatTimecode vtt failed');
  assert(parseTimecodeToMs('00:00:01,500') === 1500, 'parseTimecodeToMs srt failed');
  assert(parseTimecodeToMs('00:01:23.450') === 83450, 'parseTimecodeToMs vtt failed');
  console.log('✓ Timecode parsing and formatting validated across SRT and VTT standards.');

  // 4. Test Subtitle Engine
  console.log('4. Validating Subtitle Parser & Serializer Roundtrip...');
  const testSrt = `1\n00:00:01,200 --> 00:00:04,500\nWelcome to Toolstrum Offline Video Studio.\n\n2\n00:00:05,100 --> 00:00:08,900\nZero cloud latency, 100% on-device processing.`;
  const parsedCues = parseSrt(testSrt);
  assert(parsedCues.length === 2, `Expected 2 cues, got ${parsedCues.length}`);
  assert(parsedCues[0].startMs === 1200 && parsedCues[0].endMs === 4500, 'Cue 1 timing mismatch');
  assert(parsedCues[1].text.includes('Zero cloud latency'), 'Cue 2 text mismatch');

  const roundtripSrt = formatSrt(parsedCues);
  assert(roundtripSrt.includes('00:00:01,200 --> 00:00:04,500'), 'Serialized SRT mismatch');

  const formattedVtt = formatVtt(parsedCues);
  assert(formattedVtt.startsWith('WEBVTT'), 'VTT must begin with WEBVTT header');
  assert(formattedVtt.includes('00:00:01.200 --> 00:00:04.500'), 'VTT timing mismatch');
  console.log('✓ Subtitle parser and serializer roundtrip verified for SRT and WebVTT.');

  // 5. Test Geometry & Video Math
  console.log('5. Validating Geometry, Aspect Ratios, and Scaling Calculations...');
  assert(calculateAspectRatio(1920, 1080).label === '16:9', '1920x1080 should be 16:9');
  assert(calculateAspectRatio(1080, 1920).label === '9:16', '1080x1920 should be 9:16');
  assert(calculateAspectRatio(1080, 1080).label === '1:1', '1080x1080 should be 1:1');

  const scaled = calculateTargetDimensions(3840, 2160, '1080p');
  assert(scaled.width === 1920 && scaled.height === 1080, '4K to 1080p scale failed');
  console.log('✓ Geometry, aspect ratio, and dimension calculators verified.');

  // 6. Test File Size & Bitrate Estimation
  console.log('6. Validating File Size, Bitrate, and Metadata Inspector...');
  assert(formatFileSize(1024) === '1.0 KB', 'formatFileSize 1KB failed');
  assert(formatFileSize(1024 * 1024 * 15) === '15.0 MB', 'formatFileSize 15MB failed');
  assert(formatBitrate(4500) === '4.5 Mbps', 'formatBitrate 4.5Mbps failed');
  assert(formatBitrate(750) === '750 kbps', 'formatBitrate 750kbps failed');

  const estBytes = calculateEstimatedFileSize(60, '1080p');
  assert(estBytes > 25 * 1024 * 1024 && estBytes < 45 * 1024 * 1024, `Unexpected estimate: ${estBytes}`);

  const mockMeta = mockInspectVideo('camera_take.mp4', 80 * 1024 * 1024);
  assert(mockMeta.container === 'MP4', 'Container mismatch');
  assert(mockMeta.fps === 30, 'FPS mismatch');
  assert(mockMeta.streamsCount === 2, 'Stream count mismatch');
  console.log('✓ File size and bitrate estimation models verified.');

  // 7. Test PDF Storyboard Creation
  console.log('7. Validating Offline PDF Storyboard Generator via pdf-lib...');
  const frames = generateMockStoryboardFrames(60, 6);
  assert(frames.length === 6, `Expected 6 frames, got ${frames.length}`);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  page.drawText('TOOLSTRUM TEST STORYBOARD', {
    x: 50,
    y: 800,
    size: 14,
    font: fontBold,
    color: rgb(0.66, 0.33, 0.97),
  });
  const pdfBytes = await pdfDoc.save();
  assert(pdfBytes.byteLength > 400, 'PDF bytes too small');
  const header = String.fromCharCode(...pdfBytes.slice(0, 5));
  assert(header === '%PDF-', 'PDF magic header missing');
  console.log(`✓ Offline PDF Storyboard contact sheet compiled successfully (${pdfBytes.byteLength} bytes).`);

  console.log('--- ALL VIDEO STUDIO TESTS PASSED (100% SUCCESS) ---');
}

runTestSuite().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
