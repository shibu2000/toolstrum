import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Camera,
  Music,
  FileText,
  Sliders,
  Download,
  Play,
  Pause,
  RotateCcw,
  Check,
  ShieldCheck,
  Clock,
  Maximize2,
  FileCheck,
  Images,
  Monitor,
  Square,
  Circle,
} from 'lucide-react';
import JSZip from 'jszip';
import { FileDropZone } from '../components/common/FileDropZone';
import { ResultCard } from '../components/common/ResultCard';
import { VideoFfmpegPanel } from './video/VideoFfmpegPanel';
import { getToolById } from '../data/webRegistry';

interface VideoWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

interface VideoMetadata {
  name: string;
  size: string;
  duration: string;
  width: number;
  height: number;
  aspectRatio: string;
  type: string;
}

export const VideoWorkspace: React.FC<VideoWorkspaceProps> = ({
  toolId,
  accentColor = '#A855F7',
}) => {
  // Active tool mode based on toolId or switcher
  // Tools 104-108: Frame capture / inspect
  // Tools 109-114: Audio extraction
  // Tools 115-120: Subtitles
  // Tools 121-128: Aspect ratio / speed
  const ENGINE_TOOL_IDS = [104, 105, 106, 107, 108, 109, 110, 111, 113, 114, 115, 117, 118, 119, 123, 127, 128];

  const getInitialTab = () => {
    if (ENGINE_TOOL_IDS.includes(toolId)) return 'engine';
    if (toolId === 110) return 'audio';
    if (toolId === 116) return 'subtitles';
    if (toolId === 122) return 'ratio';
    if (toolId === 125 || toolId === 126) return 'record';
    return 'capture';
  };

  const getEngineDefaultOp = ():
    | 'trim' | 'compress' | 'format' | 'resize' | 'rotate' | 'crop' | 'speed' | 'mute' | 'gif' | 'mp3' | 'merge' | 'watermark' | 'fps' | 'subtitles' | 'replaceAudio' | 'transitions' | 'batch' => {
    switch (toolId) {
      case 104: return 'compress';
      case 105: return 'trim';
      case 106: return 'merge';
      case 107: return 'crop';
      case 108: return 'rotate';
      case 109: return 'format';
      case 110: return 'mp3';
      case 111: return 'gif';
      case 113: return 'speed';
      case 114: return 'mute';
      case 115: return 'watermark';
      case 117: return 'subtitles';
      case 118: return 'resize';
      case 119: return 'fps';
      case 123: return 'replaceAudio';
      case 127: return 'batch';
      case 128: return 'transitions';
      default: return 'trim';
    }
  };

  const [activeTab, setActiveTab] = useState<'capture' | 'audio' | 'subtitles' | 'ratio' | 'engine' | 'record'>(getInitialTab);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [capturedFrameUrl, setCapturedFrameUrl] = useState<string | null>(null);
  const [capturedFrameSize, setCapturedFrameSize] = useState({ width: 0, height: 0 });

  // Multi-frame extraction (Video to Images)
  const [frameCount, setFrameCount] = useState(6);
  const [isExtractingFrames, setIsExtractingFrames] = useState(false);
  const [framesZipBlob, setFramesZipBlob] = useState<Blob | null>(null);

  // Screen / Camera Recorder state
  const [recordMode, setRecordMode] = useState<'screen' | 'camera'>('screen');
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Audio Extraction state
  const [isExtractingAudio, setIsExtractingAudio] = useState(false);
  const [extractedAudioBlob, setExtractedAudioBlob] = useState<Blob | null>(null);
  const [extractionProgress, setExtractionProgress] = useState('');

  // Subtitles state
  const [subtitlesSrt, setSubtitlesSrt] = useState(
    `1\n00:00:01,000 --> 00:00:04,000\nWelcome to Toolstrum Video Studio.\n\n2\n00:00:04,500 --> 00:00:08,000\n100% offline, local browser processing.`
  );
  const [subtitlesVtt, setSubtitlesVtt] = useState('');

  // Aspect ratio state
  const [baseWidth, setBaseWidth] = useState(1920);
  const [baseHeight, setBaseHeight] = useState(1080);
  const [targetRatio, setTargetRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3' | '21:9'>('16:9');

  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync tab if toolId changes
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const handleVideoSelect = (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setErrorMsg('Please select a valid video file (MP4, WebM, MOV, etc.).');
      return;
    }

    setErrorMsg('');
    if (videoUrl) URL.revokeObjectURL(videoUrl);

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setCapturedFrameUrl(null);
    setExtractedAudioBlob(null);
  };

  const onLoadedMetadata = () => {
    if (!videoRef.current || !videoFile) return;
    const v = videoRef.current;
    const dur = v.duration || 0;
    setDuration(dur);

    const w = v.videoWidth;
    const h = v.videoHeight;
    setBaseWidth(w);
    setBaseHeight(h);

    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(w, h);
    const ratioStr = divisor > 0 ? `${w / divisor}:${h / divisor}` : `${w}x${h}`;

    const formatDur = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    setMetadata({
      name: videoFile.name,
      size: `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`,
      duration: `${formatDur(dur)} (${dur.toFixed(1)}s)`,
      width: w,
      height: h,
      aspectRatio: ratioStr,
      type: videoFile.type || 'video/mp4',
    });
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (newTime: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  // Capture Frame
  const handleCaptureFrame = () => {
    if (!videoRef.current) {
      setErrorMsg('Please load a video first.');
      return;
    }
    const v = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth || 640;
    canvas.height = v.videoHeight || 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedFrameUrl(dataUrl);
    setCapturedFrameSize({ width: canvas.width, height: canvas.height });
  };

  // Extract N evenly-spaced frames as a downloadable ZIP of PNGs
  const seekTo = (v: HTMLVideoElement, time: number): Promise<void> =>
    new Promise((resolve) => {
      const onSeeked = () => {
        v.removeEventListener('seeked', onSeeked);
        resolve();
      };
      v.addEventListener('seeked', onSeeked);
      v.currentTime = time;
    });

  const handleExtractFrames = async () => {
    if (!videoRef.current || !duration) {
      setErrorMsg('Please load a video first.');
      return;
    }
    const v = videoRef.current;
    setIsExtractingFrames(true);
    setFramesZipBlob(null);
    try {
      const zip = new JSZip();
      const canvas = document.createElement('canvas');
      canvas.width = v.videoWidth || 640;
      canvas.height = v.videoHeight || 360;
      const ctx = canvas.getContext('2d')!;
      const wasPlaying = isPlaying;
      v.pause();

      for (let i = 0; i < frameCount; i++) {
        const t = (duration * i) / Math.max(1, frameCount - 1 === 0 ? 1 : frameCount);
        await seekTo(v, Math.min(duration - 0.05, t));
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
        zip.file(`frame_${String(i + 1).padStart(2, '0')}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      setFramesZipBlob(zipBlob);
      if (wasPlaying) v.play();
    } catch (e: any) {
      setErrorMsg(`Frame extraction failed: ${e.message || 'Unknown error.'}`);
    } finally {
      setIsExtractingFrames(false);
    }
  };

  // Screen / Camera Recorder
  const handleStartVideoRecording = async () => {
    try {
      const stream =
        recordMode === 'screen'
          ? await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
          : await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

      videoStreamRef.current = stream;
      videoChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      videoRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) videoChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        setRecordedVideoBlob(blob);
        if (recordedVideoUrl) URL.revokeObjectURL(recordedVideoUrl);
        setRecordedVideoUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      stream.getVideoTracks()[0].addEventListener('ended', () => handleStopVideoRecording());

      recorder.start();
      setIsRecordingVideo(true);
    } catch (e: any) {
      setErrorMsg(`Recording failed: ${e.message || 'Permission denied or unsupported.'}`);
    }
  };

  const handleStopVideoRecording = () => {
    if (videoRecorderRef.current && isRecordingVideo) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

  // Extract Audio using Web Audio API decodeAudioData -> WAV
  const handleExtractAudio = async () => {
    if (!videoFile) {
      setErrorMsg('Please select a video file first.');
      return;
    }

    try {
      setIsExtractingAudio(true);
      setErrorMsg('');
      setExtractionProgress('Reading video data into memory...');

      const arrayBuffer = await videoFile.arrayBuffer();
      setExtractionProgress('Decoding audio track via Web Audio API...');

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      setExtractionProgress('Encoding uncompressed 16-bit PCM WAV...');
      const wavBlob = audioBufferToWav(decodedBuffer);
      setExtractedAudioBlob(wavBlob);
      setExtractionProgress('Audio extraction complete!');
      await audioCtx.close();
    } catch (e: any) {
      setErrorMsg(`Audio extraction error: ${e.message || 'No readable audio track in video.'}`);
    } finally {
      setIsExtractingAudio(false);
    }
  };

  // AudioBuffer to 16-bit PCM WAV encoder
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let result: Float32Array;
    if (numChannels === 2) {
      const left = buffer.getChannelData(0);
      const right = buffer.getChannelData(1);
      result = new Float32Array(left.length + right.length);
      for (let i = 0; i < left.length; i++) {
        result[i * 2] = left[i];
        result[i * 2 + 1] = right[i];
      }
    } else {
      result = buffer.getChannelData(0);
    }

    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = result.length * bytesPerSample;
    const bufferSize = 44 + dataSize;

    const arrayBuffer = new ArrayBuffer(bufferSize);
    const view = new DataView(arrayBuffer);

    // RIFF chunk
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Write samples
    let offset = 44;
    for (let i = 0; i < result.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, result[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  // Convert SRT to WebVTT
  const handleConvertSrtToVtt = () => {
    const vtt =
      'WEBVTT - Generated by Toolstrum Video Studio\n\n' +
      subtitlesSrt
        .replace(/\r\n|\r/g, '\n')
        .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
    setSubtitlesVtt(vtt);
  };

  // Calculate Aspect Ratio Dimensions
  const getCalculatedDimensions = () => {
    let targetW = baseWidth;
    let targetH = baseHeight;

    if (targetRatio === '16:9') {
      targetH = Math.round((baseWidth * 9) / 16);
    } else if (targetRatio === '9:16') {
      targetH = Math.round((baseWidth * 16) / 9);
    } else if (targetRatio === '1:1') {
      targetH = baseWidth;
    } else if (targetRatio === '4:3') {
      targetH = Math.round((baseWidth * 3) / 4);
    } else if (targetRatio === '21:9') {
      targetH = Math.round((baseWidth * 9) / 21);
    }

    return {
      width: targetW,
      height: targetH,
      reels: `${Math.round((targetW * 9) / 16)} x ${targetW}`,
    };
  };

  const calculatedDim = getCalculatedDimensions();
  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Video className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Video Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Frame grabber, audio extractor, subtitle manager, and metadata inspector. Zero network uploads.'}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
          {errorMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className={activeTab === 'engine' ? 'space-y-6' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
        {/* Left Column: Player & Inputs (hidden for the ffmpeg engine tab, which has its own upload) */}
        {activeTab !== 'engine' && (
        <div className="space-y-6">
          {/* Video Dropzone */}
          {!videoUrl ? (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">
                Load Local Video File
              </h3>
              <FileDropZone
                accept="video/*"
                maxFiles={1}
                files={videoFile ? [videoFile] : []}
                onFilesChange={handleVideoSelect}
                label="Select or drag & drop video"
                sublabel="Supports MP4, WebM, MOV, OGG (Processed 100% locally)"
                accentColor={accentColor}
              />
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  className="w-full h-full object-contain"
                  onLoadedMetadata={onLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>

              {/* Playback Controls */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  </button>

                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-10 text-right">
                      {currentTime.toFixed(1)}s
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 1}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => handleSeek(parseFloat(e.target.value))}
                      className="flex-1 accent-purple-600 cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-10">
                      {duration.toFixed(1)}s
                    </span>
                  </div>
                </div>

                {/* Speed buttons & Replace button */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">Speed:</span>
                    {[0.5, 1, 1.5, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => handleSpeedChange(rate)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                          playbackRate === rate
                            ? 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      if (videoUrl) URL.revokeObjectURL(videoUrl);
                      setVideoUrl(null);
                      setVideoFile(null);
                      setMetadata(null);
                    }}
                    className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors underline"
                  >
                    Change Video
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Video Metadata Inspector Box */}
          {metadata && (
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-purple-500" />
                  Video Details
                </h4>
                <span className="text-[10px] bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full font-medium">
                  100% Offline • 100% Secure
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Resolution</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {metadata.width} x {metadata.height}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Aspect Ratio</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {metadata.aspectRatio}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Duration</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {metadata.duration}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">File Size</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {metadata.size}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">MIME Type</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5 truncate">
                    {metadata.type}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60">
                  <div className="text-[10px] text-slate-400 uppercase font-medium">Current Pos</div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">
                    {currentTime.toFixed(2)}s
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        )}

        {/* Right Column: Tab Workspaces */}
        <div className="space-y-6">
          {/* TAB 0: FFMPEG ENGINE (REAL TRIM/COMPRESS/MERGE/CONVERT/ETC) */}
          {activeTab === 'engine' && (
            <VideoFfmpegPanel accentColor={accentColor} defaultOp={getEngineDefaultOp()} />
          )}

          {/* TAB 1: FRAME CAPTURE */}
          {activeTab === 'capture' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    High-Res Frame Capture
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">PNG / JPEG</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Pause at any point in your video and click below to save that moment as a high-quality picture.
              </p>

              <button
                onClick={handleCaptureFrame}
                disabled={!videoUrl}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Capture Current Frame ({currentTime.toFixed(1)}s)
              </button>

              {capturedFrameUrl && (
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      Captured Preview ({capturedFrameSize.width}x{capturedFrameSize.height})
                    </span>
                    <a
                      href={capturedFrameUrl}
                      download={`frame_${Math.floor(currentTime * 1000)}ms.png`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PNG
                    </a>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center max-h-56">
                    <img
                      src={capturedFrameUrl}
                      alt="Captured Frame"
                      className="max-h-56 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 1b: MULTI-FRAME EXPORT (VIDEO TO IMAGES) */}
          {activeTab === 'capture' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Video to Images (ZIP)
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">PNG sequence</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Extracts evenly-spaced frames across the whole video and packages them into a downloadable ZIP.
              </p>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">Number of Frames: {frameCount}</label>
                <input type="range" min={2} max={20} value={frameCount} onChange={(e) => setFrameCount(Number(e.target.value))} className="w-full accent-purple-600" />
              </div>

              <button
                onClick={handleExtractFrames}
                disabled={!videoUrl || isExtractingFrames}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Images className="w-4 h-4" />
                {isExtractingFrames ? 'Extracting Frames...' : `Extract ${frameCount} Frames as ZIP`}
              </button>

              {framesZipBlob && (
                <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {frameCount} frames ready ({(framesZipBlob.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                  <a
                    href={URL.createObjectURL(framesZipBlob)}
                    download="video_frames.zip"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download ZIP
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIO EXTRACTOR */}
          {activeTab === 'audio' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Video to Audio Extractor
                  </h3>
                </div>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">
                  16-bit PCM WAV
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400">
                Extract the audio track from your video and save it as an audio file directly on your device.
              </p>

              <button
                onClick={handleExtractAudio}
                disabled={!videoFile || isExtractingAudio}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors flex items-center justify-center gap-2"
              >
                <Music className="w-4 h-4" />
                {isExtractingAudio ? 'Extracting Local Audio...' : 'Extract Audio Track to WAV'}
              </button>

              {extractionProgress && (
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900 text-xs text-purple-700 dark:text-purple-300 font-medium">
                  {extractionProgress}
                </div>
              )}

              {extractedAudioBlob && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Audio Extracted ({(extractedAudioBlob.size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                    <a
                      href={URL.createObjectURL(extractedAudioBlob)}
                      download={`${videoFile?.name?.replace(/\.[^/.]+$/, '') || 'extracted'}_audio.wav`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download WAV
                    </a>
                  </div>
                  <audio
                    controls
                    src={URL.createObjectURL(extractedAudioBlob)}
                    className="w-full h-8"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SUBTITLE EDITOR & CONVERTER */}
          {activeTab === 'subtitles' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Subtitle SRT to WebVTT Converter
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">SRT / VTT</span>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  SubRip (SRT) Input
                </label>
                <textarea
                  rows={5}
                  value={subtitlesSrt}
                  onChange={(e) => setSubtitlesSrt(e.target.value)}
                  className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleConvertSrtToVtt}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Convert to WebVTT Format
              </button>

              {subtitlesVtt && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      WebVTT Output
                    </span>
                    <a
                      href={`data:text/vtt;charset=utf-8,${encodeURIComponent(subtitlesVtt)}`}
                      download="subtitles.vtt"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 shadow-xs transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      Download .vtt
                    </a>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-800 dark:text-slate-200 overflow-x-auto max-h-36">
                    {subtitlesVtt}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ASPECT RATIO & RESOLUTION SCALER */}
          {activeTab === 'ratio' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                    Aspect Ratio & Dimension Calculator
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                    Source Width (px)
                  </label>
                  <input
                    type="number"
                    value={baseWidth}
                    onChange={(e) => setBaseWidth(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                    Source Height (px)
                  </label>
                  <input
                    type="number"
                    value={baseHeight}
                    onChange={(e) => setBaseHeight(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Target Social / Video Aspect Ratio
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['16:9', '9:16', '1:1', '4:3', '21:9'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setTargetRatio(r)}
                      className={`py-2 rounded-xl text-xs font-medium border transition-all ${
                        targetRatio === r
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-700 dark:text-purple-300 font-bold'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Computed Dimensions Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Target Output Resolution ({targetRatio})
                </div>
                <div className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                  {calculatedDim.width} x {calculatedDim.height} px
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {targetRatio === '9:16' && 'Optimized for TikTok, Instagram Reels, YouTube Shorts'}
                  {targetRatio === '16:9' && 'Standard YouTube, TV, Desktop Full HD / 4K'}
                  {targetRatio === '1:1' && 'Square format for Instagram Feed & Square Ads'}
                  {targetRatio === '4:3' && 'Classic television / retro monitor aspect ratio'}
                  {targetRatio === '21:9' && 'Ultra-wide cinematic anamorphic ratio'}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SCREEN / CAMERA RECORDER */}
          {activeTab === 'record' && (
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Screen / Camera Recorder</h3>
              </div>

              {!isRecordingVideo && (
                <div className="flex justify-center gap-2">
                  {(['screen', 'camera'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setRecordMode(m)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize ${
                        recordMode === m ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}

              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all ${
                  isRecordingVideo
                    ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
                }`}
              >
                {recordMode === 'screen' ? <Monitor className="w-8 h-8" /> : <Camera className="w-8 h-8" />}
              </div>

              {!isRecordingVideo ? (
                <button
                  onClick={handleStartVideoRecording}
                  className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-md mx-auto"
                >
                  <Circle className="w-4 h-4 fill-current" />
                  <span>Start {recordMode === 'screen' ? 'Screen' : 'Camera'} Recording</span>
                </button>
              ) : (
                <button
                  onClick={handleStopVideoRecording}
                  className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-md mx-auto"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Recording</span>
                </button>
              )}

              {recordedVideoUrl && !isRecordingVideo && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                  <video src={recordedVideoUrl} controls className="w-full rounded-lg max-h-64" />
                  <a
                    href={recordedVideoUrl}
                    download={`toolstrum-${recordMode}-recording.webm`}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Recording</span>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Privacy & Air-Gap Assurance Banner */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-semibold text-slate-800 dark:text-slate-200">
                100% Offline • 100% Secure
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Your video frames, audio, and subtitles are processed completely on your own device. Files are never uploaded anywhere.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
