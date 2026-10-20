export type VideoWorkspaceId =
  | 'video_editor'
  | 'video_transcode'
  | 'video_assembly'
  | 'video_audio_subtitles'
  | 'video_inspector';

export interface VideoToolConfig {
  id: number;
  name: string;
  description: string;
  workspace: VideoWorkspaceId;
  defaultOperation: string;
  supportedOperations: string[];
  iconName: string;
}

export const VIDEO_TOOLS: Record<number, VideoToolConfig> = {
  // --- Workspace 1: Video Editor & Geometry ---
  105: {
    id: 105,
    name: 'Video Trimmer',
    description: 'Precision frame-by-frame cut and trim with start and end markers.',
    workspace: 'video_editor',
    defaultOperation: 'trim',
    supportedOperations: ['trim', 'cut_section', 'slice'],
    iconName: 'Scissors',
  },
  107: {
    id: 107,
    name: 'Video Cropper',
    description: 'Crop frame dimensions to custom ratios or standard social formats.',
    workspace: 'video_editor',
    defaultOperation: 'crop',
    supportedOperations: ['crop', 'center_focus', 'aspect_fit'],
    iconName: 'Crop',
  },
  108: {
    id: 108,
    name: 'Video Rotator',
    description: 'Rotate video 90°, 180°, 270° or flip horizontally and vertically.',
    workspace: 'video_editor',
    defaultOperation: 'rotate',
    supportedOperations: ['rotate_90', 'rotate_180', 'rotate_270', 'flip_horizontal', 'flip_vertical'],
    iconName: 'RotateCw',
  },
  113: {
    id: 113,
    name: 'Video Speed Controller',
    description: 'Speed up or slow down playback speed with pitch preservation option.',
    workspace: 'video_editor',
    defaultOperation: 'speed',
    supportedOperations: ['speed_025x', 'speed_05x', 'speed_125x', 'speed_15x', 'speed_20x'],
    iconName: 'Gauge',
  },
  115: {
    id: 115,
    name: 'Video Watermark',
    description: 'Overlay custom text, logo, or stamp with position and opacity controls.',
    workspace: 'video_editor',
    defaultOperation: 'watermark',
    supportedOperations: ['text_watermark', 'image_watermark', 'timecode_stamp'],
    iconName: 'Stamp',
  },
  122: {
    id: 122,
    name: 'Video Stabilizer',
    description: 'Smooth camera jitter and wobble using offline motion compensation.',
    workspace: 'video_editor',
    defaultOperation: 'stabilize',
    supportedOperations: ['smooth_handheld', 'lock_horizon', 'tripod_mode'],
    iconName: 'Sparkles',
  },

  // --- Workspace 2: Video Transcode & Optimization ---
  104: {
    id: 104,
    name: 'Video Compressor',
    description: 'Compress video size with customizable bitrates and quality presets.',
    workspace: 'video_transcode',
    defaultOperation: 'compress',
    supportedOperations: ['compress_balanced', 'compress_small', 'compress_high'],
    iconName: 'Minimize2',
  },
  109: {
    id: 109,
    name: 'Video Format Converter',
    description: 'Convert between MP4, MKV, MOV, WebM, and AVI container formats.',
    workspace: 'video_transcode',
    defaultOperation: 'convert_format',
    supportedOperations: ['to_mp4', 'to_mkv', 'to_mov', 'to_webm', 'to_avi'],
    iconName: 'FileVideo',
  },
  111: {
    id: 111,
    name: 'Video to GIF',
    description: 'Generate lightweight animated GIF clips with palette dithering.',
    workspace: 'video_transcode',
    defaultOperation: 'video_to_gif',
    supportedOperations: ['gif_standard', 'gif_high_fps', 'gif_reverse_loop'],
    iconName: 'Image',
  },
  118: {
    id: 118,
    name: 'Video Resolution Changer',
    description: 'Scale video resolution from 4K down to 1080p, 720p, 480p, or custom.',
    workspace: 'video_transcode',
    defaultOperation: 'change_resolution',
    supportedOperations: ['res_4k', 'res_1080p', 'res_720p', 'res_480p'],
    iconName: 'Maximize2',
  },
  119: {
    id: 119,
    name: 'Video Frame Rate Converter',
    description: 'Convert frame rate between cinematic 24fps, 30fps, 60fps, or 120fps.',
    workspace: 'video_transcode',
    defaultOperation: 'change_framerate',
    supportedOperations: ['fps_24', 'fps_30', 'fps_60', 'fps_120'],
    iconName: 'Film',
  },
  127: {
    id: 127,
    name: 'Batch Video Converter',
    description: 'Queue and transcode multiple video files into unified format and size.',
    workspace: 'video_transcode',
    defaultOperation: 'batch_convert',
    supportedOperations: ['batch_transcode', 'batch_compress'],
    iconName: 'Layers',
  },

  // --- Workspace 3: Video Assembly & Capture ---
  106: {
    id: 106,
    name: 'Video Merger',
    description: 'Join multiple video clips sequentially into a continuous movie.',
    workspace: 'video_assembly',
    defaultOperation: 'merge_sequential',
    supportedOperations: ['merge_sequential', 'reorder_clips'],
    iconName: 'PlusCircle',
  },
  128: {
    id: 128,
    name: 'Video Merge with Transitions',
    description: 'Merge clips with crossfade, wipe, zoom, or dissolve transition effects.',
    workspace: 'video_assembly',
    defaultOperation: 'merge_transitions',
    supportedOperations: ['crossfade', 'dissolve', 'slide_wipe', 'zoom_fade'],
    iconName: 'GitMerge',
  },
  125: {
    id: 125,
    name: 'Screen Recorder',
    description: 'Capture on-device screen recordings with mic audio and quality toggles.',
    workspace: 'video_assembly',
    defaultOperation: 'screen_record',
    supportedOperations: ['screen_record', 'screen_audio_toggle'],
    iconName: 'Tv',
  },
  126: {
    id: 126,
    name: 'Camera Recorder',
    description: 'Quickly record video clips using device front or back cameras.',
    workspace: 'video_assembly',
    defaultOperation: 'camera_record',
    supportedOperations: ['back_camera', 'front_camera', 'high_bitrate'],
    iconName: 'Camera',
  },

  // --- Workspace 4: Video Audio & Subtitles ---
  110: {
    id: 110,
    name: 'Video to MP3',
    description: 'Extract pristine audio soundtracks to MP3, AAC, or WAV format.',
    workspace: 'video_audio_subtitles',
    defaultOperation: 'extract_audio',
    supportedOperations: ['audio_mp3_320', 'audio_mp3_192', 'audio_aac', 'audio_wav'],
    iconName: 'Music',
  },
  114: {
    id: 114,
    name: 'Video Mute',
    description: 'Strip all audio streams to generate a completely silent video.',
    workspace: 'video_audio_subtitles',
    defaultOperation: 'mute_video',
    supportedOperations: ['strip_all_audio', 'remove_mic_track'],
    iconName: 'VolumeX',
  },
  116: {
    id: 116,
    name: 'Subtitle Editor',
    description: 'Create, modify, sync, and export SRT or VTT subtitle cues.',
    workspace: 'video_audio_subtitles',
    defaultOperation: 'edit_subtitles',
    supportedOperations: ['edit_cues', 'shift_timing', 'export_srt', 'export_vtt'],
    iconName: 'FileText',
  },
  117: {
    id: 117,
    name: 'Subtitle Extractor',
    description: 'Extract embedded subtitle tracks or closed captions to text files.',
    workspace: 'video_audio_subtitles',
    defaultOperation: 'extract_subtitles',
    supportedOperations: ['extract_embedded_srt', 'export_plain_txt'],
    iconName: 'Download',
  },
  123: {
    id: 123,
    name: 'Audio Replacement',
    description: 'Replace original soundtrack with background music or voiceover track.',
    workspace: 'video_audio_subtitles',
    defaultOperation: 'replace_audio',
    supportedOperations: ['full_replace', 'background_ducking', 'voice_overlay'],
    iconName: 'Headphones',
  },

  // --- Workspace 5: Video Analysis & Inspector ---
  112: {
    id: 112,
    name: 'Video to Images',
    description: 'Extract frames at fixed time intervals or keyframe points into JPG/PNG.',
    workspace: 'video_inspector',
    defaultOperation: 'extract_frames',
    supportedOperations: ['frames_every_sec', 'keyframe_burst', 'scene_changes'],
    iconName: 'Images',
  },
  120: {
    id: 120,
    name: 'Video Metadata Viewer',
    description: 'Deep inspection of codecs, container, bitrates, audio tracks, and streams.',
    workspace: 'video_inspector',
    defaultOperation: 'inspect_metadata',
    supportedOperations: ['stream_details', 'codec_analysis', 'raw_json_dump'],
    iconName: 'Info',
  },
  121: {
    id: 121,
    name: 'Video Thumbnail Maker',
    description: 'Grab sharp high-resolution frame stills and design custom video covers.',
    workspace: 'video_inspector',
    defaultOperation: 'create_thumbnail',
    supportedOperations: ['grab_frame_poster', 'custom_cover_overlay'],
    iconName: 'Camera',
  },
  124: {
    id: 124,
    name: 'Video to PDF Storyboard',
    description: 'Generate multi-frame visual storyboards compiled into printable PDF format.',
    workspace: 'video_inspector',
    defaultOperation: 'storyboard_pdf',
    supportedOperations: ['storyboard_grid', 'contact_sheet', 'annotated_script'],
    iconName: 'BookOpen',
  },
};

export function getVideoToolConfig(toolId: number): VideoToolConfig | undefined {
  return VIDEO_TOOLS[toolId];
}
