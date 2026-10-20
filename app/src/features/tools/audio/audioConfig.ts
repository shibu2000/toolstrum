export type AudioWorkspaceId =
  | 'audio_editor'
  | 'audio_transcode'
  | 'audio_effects'
  | 'audio_assembly'
  | 'audio_speech_tags';

export interface AudioToolConfig {
  id: number;
  name: string;
  description: string;
  workspace: AudioWorkspaceId;
  defaultOperation: string;
  supportedOperations: string[];
  iconName: string;
}

export const AUDIO_TOOLS: Record<number, AudioToolConfig> = {
  // --- Workspace 1: Audio Editor & Waveform ---
  131: {
    id: 131,
    name: 'Audio Trimmer',
    description: 'Cut and trim audio clips with millisecond precision markers.',
    workspace: 'audio_editor',
    defaultOperation: 'trim',
    supportedOperations: ['trim', 'cut_section', 'slice_segment'],
    iconName: 'Scissors',
  },
  133: {
    id: 133,
    name: 'Audio Splitter',
    description: 'Split audio file by duration intervals, markers, or chapters.',
    workspace: 'audio_editor',
    defaultOperation: 'split_intervals',
    supportedOperations: ['split_intervals', 'split_equal_halves', 'split_by_silence'],
    iconName: 'Split',
  },
  147: {
    id: 147,
    name: 'Audio Waveform Viewer',
    description: 'Interactive visual waveform viewer with zoom and peak amplitude meters.',
    workspace: 'audio_editor',
    defaultOperation: 'view_waveform',
    supportedOperations: ['view_waveform', 'spectral_peaks', 'loudness_profile'],
    iconName: 'Activity',
  },
  148: {
    id: 148,
    name: 'Silence Remover',
    description: 'Detect silence thresholds and automatically trim pauses and dead air.',
    workspace: 'audio_editor',
    defaultOperation: 'remove_silence',
    supportedOperations: ['remove_silence_tight', 'remove_silence_natural', 'strip_ends'],
    iconName: 'VolumeX',
  },
  151: {
    id: 151,
    name: 'Ringtone Maker',
    description: 'Create customized 30-second phone ringtones with fade in/out curves.',
    workspace: 'audio_editor',
    defaultOperation: 'make_ringtone',
    supportedOperations: ['make_ringtone', 'export_m4r_ios', 'export_mp3_android'],
    iconName: 'Bell',
  },

  // --- Workspace 2: Audio Transcode & Compression ---
  129: {
    id: 129,
    name: 'Audio Compressor',
    description: 'Compress audio size using optimized bitrates and psychoacoustic models.',
    workspace: 'audio_transcode',
    defaultOperation: 'compress',
    supportedOperations: ['compress_balanced', 'compress_small', 'compress_high'],
    iconName: 'Minimize2',
  },
  130: {
    id: 130,
    name: 'Audio Converter',
    description: 'Convert between MP3, WAV, AAC, M4A, FLAC, and OGG formats.',
    workspace: 'audio_transcode',
    defaultOperation: 'convert_format',
    supportedOperations: ['to_mp3', 'to_wav', 'to_aac', 'to_m4a', 'to_flac'],
    iconName: 'RefreshCw',
  },
  142: {
    id: 142,
    name: 'Audio to WAV',
    description: 'Export uncompressed studio-quality PCM 16-bit / 24-bit WAV files.',
    workspace: 'audio_transcode',
    defaultOperation: 'to_wav',
    supportedOperations: ['wav_16bit_44k', 'wav_24bit_48k', 'wav_mono_speech'],
    iconName: 'FileAudio',
  },
  143: {
    id: 143,
    name: 'Audio to MP3',
    description: 'Encode audio to universal MP3 format with customizable bitrates.',
    workspace: 'audio_transcode',
    defaultOperation: 'to_mp3',
    supportedOperations: ['mp3_320k', 'mp3_256k', 'mp3_192k', 'mp3_128k'],
    iconName: 'Music',
  },
  150: {
    id: 150,
    name: 'Audio Channel Converter',
    description: 'Convert audio channels between Mono, Stereo, and channel swap.',
    workspace: 'audio_transcode',
    defaultOperation: 'channel_convert',
    supportedOperations: ['stereo_to_mono', 'mono_to_stereo', 'swap_left_right', 'extract_left'],
    iconName: 'Radio',
  },
  152: {
    id: 152,
    name: 'Audio Batch Converter',
    description: 'Queue and batch transcode multiple audio tracks to unified format.',
    workspace: 'audio_transcode',
    defaultOperation: 'batch_convert',
    supportedOperations: ['batch_transcode', 'batch_compress', 'batch_resample'],
    iconName: 'Layers',
  },

  // --- Workspace 3: Audio Effects & DSP ---
  134: {
    id: 134,
    name: 'Audio Speed Changer',
    description: 'Speed up or slow down audio playback from 0.5x to 2.5x without pitch drift.',
    workspace: 'audio_effects',
    defaultOperation: 'change_speed',
    supportedOperations: ['speed_075x', 'speed_125x', 'speed_15x', 'speed_20x'],
    iconName: 'Gauge',
  },
  135: {
    id: 135,
    name: 'Pitch Changer',
    description: 'Shift musical pitch up or down by semitones while preserving tempo.',
    workspace: 'audio_effects',
    defaultOperation: 'shift_pitch',
    supportedOperations: ['pitch_up_2', 'pitch_down_2', 'pitch_octave_up', 'pitch_octave_down'],
    iconName: 'TrendingUp',
  },
  136: {
    id: 136,
    name: 'Volume Booster',
    description: 'Amplify quiet recordings by up to +18dB with peak limiter protection.',
    workspace: 'audio_effects',
    defaultOperation: 'boost_volume',
    supportedOperations: ['boost_3db', 'boost_6db', 'boost_12db', 'boost_18db'],
    iconName: 'Volume2',
  },
  137: {
    id: 137,
    name: 'Audio Normalizer',
    description: 'Standardize perceived loudness to streaming standards (-14 LUFS / EBU R128).',
    workspace: 'audio_effects',
    defaultOperation: 'normalize_loudness',
    supportedOperations: ['normalize_lufs_14', 'normalize_peak_0db', 'normalize_podcast_16'],
    iconName: 'Sliders',
  },
  138: {
    id: 138,
    name: 'Audio Noise Reducer',
    description: 'Suppress background room hiss, air conditioner noise, and 50/60Hz hum.',
    workspace: 'audio_effects',
    defaultOperation: 'reduce_noise',
    supportedOperations: ['spectral_gate', 'remove_hum_60hz', 'voice_clarity_filter'],
    iconName: 'Shield',
  },
  149: {
    id: 149,
    name: 'Voice Changer',
    description: 'Transform voice recordings with Robot, Chipmunk, Deep Bass, and Cave Echo.',
    workspace: 'audio_effects',
    defaultOperation: 'voice_transform',
    supportedOperations: ['preset_robot', 'preset_chipmunk', 'preset_deep_bass', 'preset_echo_cave', 'preset_radio'],
    iconName: 'Smile',
  },

  // --- Workspace 4: Audio Assembly & Extraction ---
  132: {
    id: 132,
    name: 'Audio Merger',
    description: 'Concatenate multiple audio tracks into a seamless continuous audio file.',
    workspace: 'audio_assembly',
    defaultOperation: 'merge_sequential',
    supportedOperations: ['merge_sequential', 'reorder_tracks'],
    iconName: 'PlusCircle',
  },
  144: {
    id: 144,
    name: 'Video Audio Extractor',
    description: 'Extract lossless sound from video files into standalone MP3 or AAC tracks.',
    workspace: 'audio_assembly',
    defaultOperation: 'extract_from_video',
    supportedOperations: ['extract_mp3_hq', 'extract_aac_passthrough', 'extract_wav'],
    iconName: 'Film',
  },
  153: {
    id: 153,
    name: 'Audio Joiner with Crossfade',
    description: 'Blend songs and podcast segments with smooth adjustable crossfade curves.',
    workspace: 'audio_assembly',
    defaultOperation: 'join_crossfade',
    supportedOperations: ['crossfade_2s', 'crossfade_4s', 'dj_transition'],
    iconName: 'GitMerge',
  },

  // --- Workspace 5: Voice, Speech & Tags ---
  139: {
    id: 139,
    name: 'Voice Recorder',
    description: 'Record crisp voice memos with high-fidelity on-device audio capture.',
    workspace: 'audio_speech_tags',
    defaultOperation: 'record_voice',
    supportedOperations: ['record_standard', 'record_lossless_wav', 'mic_gain_control'],
    iconName: 'Mic',
  },
  140: {
    id: 140,
    name: 'Audio to Text',
    description: 'Convert speech and voice recordings into editable timestamped text transcripts.',
    workspace: 'audio_speech_tags',
    defaultOperation: 'audio_to_text',
    supportedOperations: ['speech_transcription', 'export_srt_transcript', 'export_txt'],
    iconName: 'FileText',
  },
  141: {
    id: 141,
    name: 'Text to Speech',
    description: 'Synthesize natural voice speech from text with speed and pitch controls.',
    workspace: 'audio_speech_tags',
    defaultOperation: 'text_to_speech',
    supportedOperations: ['synthesize_speech', 'export_speech_audio', 'rate_pitch_tuning'],
    iconName: 'Volume1',
  },
  145: {
    id: 145,
    name: 'Audio Metadata Editor',
    description: 'View and edit ID3 tags including Title, Artist, Album, Year, and Genre.',
    workspace: 'audio_speech_tags',
    defaultOperation: 'edit_id3_tags',
    supportedOperations: ['edit_tags', 'strip_all_tags', 'auto_number_tracks'],
    iconName: 'Tag',
  },
  146: {
    id: 146,
    name: 'Album Art Editor',
    description: 'Attach, replace, or extract high-resolution cover artwork in audio files.',
    workspace: 'audio_speech_tags',
    defaultOperation: 'edit_cover_art',
    supportedOperations: ['attach_cover_art', 'extract_cover_art', 'remove_cover_art'],
    iconName: 'Image',
  },
};

export function getAudioToolConfig(toolId: number): AudioToolConfig | undefined {
  return AUDIO_TOOLS[toolId];
}
