import React, { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  Play,
  Square,
  Mic,
  ShieldCheck,
  Download,
  Trash2,
  RotateCcw,
  Sliders,
  Activity,
} from 'lucide-react';
import { FileDropZone } from '../components/common/FileDropZone';
import { AudioFfmpegPanel } from './audio/AudioFfmpegPanel';
import { getToolById } from '../data/webRegistry';

interface AudioWorkspaceProps {
  toolId: number;
  accentColor?: string;
}

export const AudioWorkspace: React.FC<AudioWorkspaceProps> = ({
  toolId,
  accentColor = '#8B5CF6',
}) => {
  const ENGINE_TOOL_IDS = [129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 142, 143, 144, 145, 146, 148, 149, 150, 151, 152, 153];

  // Determine mode based on registry toolId:
  const getInitialTab = () => {
    if (ENGINE_TOOL_IDS.includes(toolId)) return 'engine';
    if (toolId === 141) return 'tts';
    if (toolId === 139 || toolId === 140) return 'record';
    if (toolId === 147) return 'waveform';
    return 'speed';
  };

  const getEngineDefaultOp = ():
    | 'compress' | 'convert' | 'trim' | 'merge' | 'crossfade' | 'split' | 'speed' | 'pitch' | 'volume' | 'normalize' | 'denoise' | 'silence' | 'channels' | 'extract' | 'metadata' | 'batch' => {
    switch (toolId) {
      case 129: return 'compress';
      case 130: return 'convert';
      case 131: return 'trim';
      case 132: return 'merge';
      case 133: return 'split';
      case 134: return 'speed';
      case 135: return 'pitch';
      case 136: return 'volume';
      case 137: return 'normalize';
      case 138: return 'denoise';
      case 142: return 'convert';
      case 143: return 'convert';
      case 144: return 'extract';
      case 145: return 'metadata';
      case 146: return 'metadata';
      case 148: return 'silence';
      case 149: return 'pitch';
      case 150: return 'channels';
      case 151: return 'trim';
      case 152: return 'batch';
      case 153: return 'crossfade';
      default: return 'convert';
    }
  };

  const [activeTab, setActiveTab] = useState<'tts' | 'record' | 'speed' | 'engine' | 'waveform'>(getInitialTab);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [toolId]);

  // ==========================================
  // 2. TEXT TO SPEECH
  // ==========================================
  const [ttsText, setTtsText] = useState('Toolstrum runs 100% offline directly on your device.');
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsPitch, setTtsPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakText = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // ==========================================
  // 3. VOICE RECORDER
  // ==========================================
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        if (recordedUrl) URL.revokeObjectURL(recordedUrl);
        setRecordedUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {}
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // ==========================================
  // 4. WAVEFORM VIEWER
  // ==========================================
  const [waveformFile, setWaveformFile] = useState<File | null>(null);
  const [isAnalyzingWaveform, setIsAnalyzingWaveform] = useState(false);
  const [waveformError, setWaveformError] = useState('');
  const waveformCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const handleAnalyzeWaveform = async (f: File) => {
    setWaveformFile(f);
    setWaveformError('');
    setIsAnalyzingWaveform(true);
    try {
      const arrayBuffer = await f.arrayBuffer();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      await ctx.close();

      const canvas = waveformCanvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth || 600;
      const height = 160;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const c2d = canvas.getContext('2d')!;
      c2d.scale(dpr, dpr);
      c2d.clearRect(0, 0, width, height);
      c2d.fillStyle = '#0f172a';
      c2d.fillRect(0, 0, width, height);

      const data = decoded.getChannelData(0);
      const samplesPerPixel = Math.max(1, Math.floor(data.length / width));
      c2d.strokeStyle = '#a78bfa';
      c2d.lineWidth = 1;
      const mid = height / 2;

      for (let x = 0; x < width; x++) {
        let min = 1;
        let max = -1;
        const start = x * samplesPerPixel;
        for (let i = 0; i < samplesPerPixel; i++) {
          const v = data[start + i] || 0;
          if (v < min) min = v;
          if (v > max) max = v;
        }
        c2d.beginPath();
        c2d.moveTo(x, mid + min * mid);
        c2d.lineTo(x, mid + max * mid);
        c2d.stroke();
      }
    } catch (e: any) {
      setWaveformError(`Could not decode audio: ${e.message || 'Unsupported format.'}`);
    } finally {
      setIsAnalyzingWaveform(false);
    }
  };

  // ==========================================
  // 5. AUDIO SPEED & PLAYBACK
  // ==========================================
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPlaybackUrl, setAudioPlaybackUrl] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioTagRef = useRef<HTMLAudioElement | null>(null);

  const handleAudioUpload = (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setAudioFile(f);
    if (audioPlaybackUrl) URL.revokeObjectURL(audioPlaybackUrl);
    setAudioPlaybackUrl(URL.createObjectURL(f));
  };

  const handlePlaybackRateChange = (r: number) => {
    setPlaybackRate(r);
    if (audioTagRef.current) {
      audioTagRef.current.playbackRate = r;
    }
  };

  const currentToolDef = getToolById(toolId);

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400">
            <Volume2 className="w-5 h-5" />
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {currentToolDef?.name || 'Audio Studio'}
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          {currentToolDef?.description || 'Tone generator, text-to-speech reader, voice recorder, and speed controller. 100% Offline • 100% Secure.'}
        </p>
      </div>

      {/* ======================================================== */}
      {/* TAB 0: FFMPEG ENGINE (REAL COMPRESS/CONVERT/TRIM/MERGE/ETC) */}
      {/* ======================================================== */}
      {activeTab === 'engine' && (
        <AudioFfmpegPanel accentColor={accentColor} defaultOp={getEngineDefaultOp()} />
      )}

      {/* ======================================================== */}
      {/* TAB 1: AUDIO SPEED & PLAYER */}
      {/* ======================================================== */}
      {activeTab === 'speed' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Audio File & Speed Changer
            </h3>

            <FileDropZone
              accept="audio/*"
              multiple={false}
              label="Select or drop an audio file (MP3, WAV, M4A)"
              sublabel="100% Offline • 100% Secure"
              files={audioFile ? [audioFile] : []}
              onFilesChange={handleAudioUpload}
              accentColor={accentColor}
            />

            {audioPlaybackUrl && (
              <div className="space-y-4 pt-2">
                <audio
                  ref={audioTagRef}
                  src={audioPlaybackUrl}
                  controls
                  className="w-full"
                />

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Playback Speed</span>
                    <span className="font-bold">{playbackRate}x</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[0.5, 0.75, 1.0, 1.25, 1.5, 2.0].map((r) => (
                      <button
                        key={r}
                        onClick={() => handlePlaybackRateChange(r)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          playbackRate === r
                            ? 'bg-violet-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {r}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              100% Offline Audio Playback
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Play, adjust speed, and audition audio files directly on your device. Zero bytes leave your browser.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: VOICE RECORDER */}
      {/* ======================================================== */}
      {activeTab === 'record' && (
        <div className="max-w-md mx-auto p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg text-center space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Voice Recorder
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Record microphone audio directly to your local device.
            </p>
          </div>

          <div className="py-2">
            <div
              className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-lg shadow-rose-500/30'
                  : 'bg-violet-100 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400'
              }`}
            >
              <Mic className="w-8 h-8" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider mt-3 text-slate-500">
              {isRecording ? 'RECORDING IN PROGRESS...' : 'READY TO RECORD'}
            </p>
          </div>

          <div className="flex justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={handleStartRecording}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-md"
              >
                <Mic className="w-4 h-4" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={handleStopRecording}
                className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center gap-2 shadow-md"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Stop Recording</span>
              </button>
            )}
          </div>

          {/* Recording Result */}
          {recordedUrl && !isRecording && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 pt-4">
              <audio src={recordedUrl} controls className="w-full" />
              <a
                href={recordedUrl}
                download="toolstrum-recording.webm"
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Audio Recording</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TEXT TO SPEECH */}
      {/* ======================================================== */}
      {activeTab === 'tts' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-violet-500" />
              <span>Voice Reader (Text to Speech)</span>
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Text to Read
              </label>
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Speech Rate</span>
                  <span className="font-mono">{ttsRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 mb-1">
                  <span>Voice Pitch</span>
                  <span className="font-mono">{ttsPitch}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>
            </div>

            <button
              onClick={handleSpeakText}
              className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-xs transition-all flex items-center justify-center gap-2 ${
                isSpeaking ? 'bg-rose-500 hover:bg-rose-600' : 'bg-violet-600 hover:bg-violet-700'
              }`}
            >
              {isSpeaking ? <Square className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
              <span>{isSpeaking ? 'Stop Speaking' : 'Read Text Aloud'}</span>
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              On-Device Voice Synthesis
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Synthesizes voice audio locally on your device with natural pacing and pitch adjustments.
            </p>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: WAVEFORM VIEWER */}
      {/* ======================================================== */}
      {activeTab === 'waveform' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">Audio Waveform Viewer</h3>
          </div>

          <FileDropZone
            accept="audio/*"
            maxFiles={1}
            files={waveformFile ? [waveformFile] : []}
            onFilesChange={(files) => {
              const f = files[0];
              if (f) handleAnalyzeWaveform(f);
            }}
            label="Select an audio file to visualize"
            sublabel="MP3, WAV, M4A, OGG"
            accentColor={accentColor}
          />

          {isAnalyzingWaveform && (
            <p className="text-xs text-slate-500">Decoding audio and rendering waveform...</p>
          )}

          {waveformError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 font-medium">
              {waveformError}
            </div>
          )}

          <canvas ref={waveformCanvasRef} className="w-full rounded-xl border border-slate-200 dark:border-slate-800" style={{ height: 160 }} />
        </div>
      )}
    </div>
  );
};
