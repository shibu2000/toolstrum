import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Camera,
  Monitor,
  Download,
  ShieldCheck,
  Circle,
  Square,
} from 'lucide-react';
import { VideoFfmpegPanel } from './video/VideoFfmpegPanel';
import { VideoThumbnailStoryboardPanel } from './video/VideoThumbnailStoryboardPanel';
import { SubtitleEditorPanel } from './video/SubtitleEditorPanel';
import { VideoMetadataInspectorPanel } from './video/VideoMetadataInspectorPanel';
import { getToolById } from '../data/webRegistry';

export interface VideoWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export type VideoWorkspaceTab =
  | 'thumbnail'
  | 'subtitles'
  | 'metadata'
  | 'engine'
  | 'record';

export const VideoWorkspace: React.FC<VideoWorkspaceProps> = ({
  toolId,
  accentColor = '#A855F7',
}) => {
  const getInitialTab = (id: number): VideoWorkspaceTab => {
    if (id === 121 || id === 124 || id === 112) return 'thumbnail';
    if (id === 116 || id === 117) return 'subtitles';
    if (id === 120) return 'metadata';
    if (id === 125 || id === 126) return 'record';
    return 'engine';
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
      case 122: return 'resize';
      case 123: return 'replaceAudio';
      case 127: return 'batch';
      case 128: return 'transitions';
      default: return 'trim';
    }
  };

  const [activeTab, setActiveTab] = useState<VideoWorkspaceTab>(() => getInitialTab(toolId));

  // Sync tab on toolId change
  useEffect(() => {
    setActiveTab(getInitialTab(toolId));
  }, [toolId]);

  // Screen / Camera Recorder state (Tools 125, 126)
  const [recordMode, setRecordMode] = useState<'screen' | 'camera'>(() =>
    toolId === 126 ? 'camera' : 'screen'
  );
  const [isRecordingVideo, setIsRecordingVideo] = useState(false);
  const [recordedVideoBlob, setRecordedVideoBlob] = useState<Blob | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordError, setRecordError] = useState('');
  const videoRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  const videoStreamRef = useRef<MediaStream | null>(null);

  // Screen / Camera Recorder Functions
  const handleStartVideoRecording = async () => {
    setRecordError('');
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
      setRecordError(`Recording failed: ${e.message || 'Permission denied or unsupported.'}`);
    }
  };

  const handleStopVideoRecording = () => {
    if (videoRecorderRef.current && isRecordingVideo) {
      videoRecorderRef.current.stop();
      setIsRecordingVideo(false);
    }
  };

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
          {currentToolDef?.description ||
            'Video editor, compressor, format converter, subtitle manager, and frame inspector. 100% Offline • Zero Network Uploads.'}
        </p>
      </div>

      {/* Security Banner */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-medium">
        <ShieldCheck className="w-4 h-4 text-purple-500" />
        <span>100% Offline • 100% Secure • Processed privately on your device</span>
      </div>

      {/* Dedicated Video Panels */}
      {activeTab === 'thumbnail' ? (
        <VideoThumbnailStoryboardPanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'subtitles' ? (
        <SubtitleEditorPanel initialToolId={toolId} accentColor={accentColor} />
      ) : activeTab === 'metadata' ? (
        <VideoMetadataInspectorPanel accentColor={accentColor} />
      ) : activeTab === 'engine' ? (
        <VideoFfmpegPanel defaultOp={getEngineDefaultOp()} accentColor={accentColor} />
      ) : (
        /* Screen / Camera Recording Workspace (Tools 125, 126) */
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 text-center">
            <div className="flex items-center justify-center gap-2">
              <Monitor className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                {recordMode === 'screen' ? 'Screen Recorder' : 'Camera Recorder'}
              </h3>
            </div>

            {recordError && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-400">
                {recordError}
              </div>
            )}

            {!isRecordingVideo && (
              <div className="flex justify-center gap-2">
                {(['screen', 'camera'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setRecordMode(m)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                      recordMode === m
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {m === 'screen' ? 'Screen Capture' : 'Webcam Camera'}
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
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md mx-auto transition-all"
              >
                <Circle className="w-4 h-4 fill-current" />
                <span>Start {recordMode === 'screen' ? 'Screen' : 'Camera'} Recording</span>
              </button>
            ) : (
              <button
                onClick={handleStopVideoRecording}
                className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md mx-auto transition-all"
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
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Recording (.webm)</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
