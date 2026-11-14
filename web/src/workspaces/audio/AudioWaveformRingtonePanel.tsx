import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Activity,
  Play,
  Pause,
  Download,
  Scissors,
  Bell,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Check,
  Sliders,
} from 'lucide-react';
import { FileDropZone } from '../../components/common/FileDropZone';

export interface AudioWaveformRingtonePanelProps {
  initialToolId?: number;
  accentColor?: string;
}

type RingtoneTarget = 'iphone_m4r' | 'android_mp3' | 'notification_chime' | 'custom';

// Helper to encode raw AudioBuffer to standard 16-bit PCM RIFF WAV Blob
const audioBufferToWavBlob = (buffer: AudioBuffer, startSec: number, endSec: number, fadeIn: boolean, fadeOut: boolean): Blob => {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  const startSample = Math.max(0, Math.floor(startSec * sampleRate));
  const endSample = Math.min(buffer.length, Math.floor(endSec * sampleRate));
  const length = endSample - startSample;

  const bytesPerSample = 2; // 16-bit
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const bufferSize = 44 + dataSize;

  const arrayBuffer = new ArrayBuffer(bufferSize);
  const view = new DataView(arrayBuffer);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF Header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');

  // fmt chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // Linear PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // 16 bits per sample

  // data chunk
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  // Write Interleaved Samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c));
  }

  const fadeInSamples = Math.floor(sampleRate * 1.5);
  const fadeOutSamples = Math.floor(sampleRate * 1.5);

  for (let i = 0; i < length; i++) {
    const sampleIdx = startSample + i;

    // Compute fade curve multiplier
    let gain = 1.0;
    if (fadeIn && i < fadeInSamples) {
      gain *= i / fadeInSamples;
    }
    if (fadeOut && i > length - fadeOutSamples) {
      gain *= (length - i) / fadeOutSamples;
    }

    for (let c = 0; c < numChannels; c++) {
      let sample = (channels[c][sampleIdx] || 0) * gain;
      sample = Math.max(-1, Math.min(1, sample));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

export const AudioWaveformRingtonePanel: React.FC<AudioWaveformRingtonePanelProps> = ({
  initialToolId = 151,
  accentColor = '#8B5CF6',
}) => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [decodedBuffer, setDecodedBuffer] = useState<AudioBuffer | null>(null);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Selection range for Ringtone or Trim
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(30);
  const [fadeIn, setFadeIn] = useState<boolean>(true);
  const [fadeOut, setFadeOut] = useState<boolean>(true);
  const [targetPreset, setTargetPreset] = useState<RingtoneTarget>('iphone_m4r');

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackStartRef = useRef<number>(0);

  // Canvas ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load and decode audio file
  const handleAudioSelect = async (files: File[]) => {
    const f = files[0];
    if (!f) return;
    setAudioFile(f);

    try {
      const arrayBuffer = await f.arrayBuffer();
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setDecodedBuffer(decoded);
      setDuration(decoded.duration);

      // Default selection (0 to 30s or max duration)
      setTrimStart(0);
      setTrimEnd(Math.min(30, decoded.duration));
    } catch (e) {
      console.error('Failed to decode audio:', e);
    }
  };

  // Render high-DPI waveform with selection overlay
  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !decodedBuffer) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 700;
    const h = 180;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, w, h);

    const data = decodedBuffer.getChannelData(0);
    const step = Math.max(1, Math.floor(data.length / w));
    const midY = h / 2;

    // Draw unselected waveform bars (dimmed)
    const startX = (trimStart / duration) * w;
    const endX = (trimEnd / duration) * w;

    for (let x = 0; x < w; x++) {
      let min = 1.0;
      let max = -1.0;
      const startIdx = x * step;
      for (let j = 0; j < step; j++) {
        const v = data[startIdx + j] || 0;
        if (v < min) min = v;
        if (v > max) max = v;
      }

      const isInside = x >= startX && x <= endX;

      // Color gradient
      if (isInside) {
        ctx.fillStyle = '#A855F7';
      } else {
        ctx.fillStyle = '#334155';
      }

      const barH = Math.max(2, (max - min) * (midY - 10));
      ctx.fillRect(x, midY - barH / 2, 1.5, barH);
    }

    // Draw selection highlight overlay
    ctx.fillStyle = 'rgba(168, 85, 247, 0.15)';
    ctx.fillRect(startX, 0, endX - startX, h);

    // Draw boundary markers
    ctx.fillStyle = '#A855F7';
    ctx.fillRect(startX, 0, 2.5, h);
    ctx.fillRect(endX - 2.5, 0, 2.5, h);
  }, [decodedBuffer, duration, trimStart, trimEnd]);

  useEffect(() => {
    drawWaveform();
  }, [drawWaveform]);

  // Play Preview of Selection
  const togglePlaySelection = () => {
    if (!decodedBuffer) return;

    const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = ctx;

    if (isPlaying) {
      if (activeSourceRef.current) {
        activeSourceRef.current.stop();
        activeSourceRef.current.disconnect();
      }
      setIsPlaying(false);
      return;
    }

    const source = ctx.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(ctx.destination);

    const playLen = trimEnd - trimStart;
    source.start(0, trimStart, playLen);
    activeSourceRef.current = source;
    setIsPlaying(true);

    source.onended = () => {
      setIsPlaying(false);
    };
  };

  // Change preset (e.g. iPhone 30s limit, Android 40s)
  const applyPreset = (preset: RingtoneTarget) => {
    setTargetPreset(preset);
    if (!duration) return;
    if (preset === 'iphone_m4r') {
      setTrimStart(0);
      setTrimEnd(Math.min(30, duration));
    } else if (preset === 'android_mp3') {
      setTrimStart(0);
      setTrimEnd(Math.min(40, duration));
    } else if (preset === 'notification_chime') {
      setTrimStart(0);
      setTrimEnd(Math.min(5, duration));
    }
  };

  // Export & Download Ringtone
  const downloadRingtone = () => {
    if (!decodedBuffer) return;
    const wavBlob = audioBufferToWavBlob(decodedBuffer, trimStart, trimEnd, fadeIn, fadeOut);
    const url = URL.createObjectURL(wavBlob);
    const link = document.createElement('a');
    link.href = url;
    const ext = targetPreset === 'iphone_m4r' ? 'm4r' : 'mp3';
    const base = audioFile?.name ? audioFile.name.substring(0, audioFile.name.lastIndexOf('.')) : 'ringtone';
    link.download = `${base}-ringtone.${ext}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedLength = Math.max(0, trimEnd - trimStart);

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      {!decodedBuffer && (
        <div className="max-w-xl mx-auto py-12">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-3xl p-8 cursor-pointer bg-white/60 dark:bg-slate-900/60 backdrop-blur-md transition-all group shadow-sm hover:shadow-md">
            <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-100 text-base mb-1">
              Select or Drop Audio for Waveform & Ringtone
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Visually trim songs into custom iPhone (.m4r) or Android ringtones with fade curves • 100% Offline
            </span>
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) handleAudioSelect([e.target.files[0]]);
              }}
            />
          </label>
        </div>
      )}

      {decodedBuffer && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-500" />
                <span>Ringtone & Audio Preset</span>
              </h4>

              {/* Presets */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'iphone_m4r', label: 'iPhone Ringtone', desc: 'Max 30s (.m4r)' },
                  { id: 'android_mp3', label: 'Android Ringtone', desc: 'Max 40s (.mp3)' },
                  { id: 'notification_chime', label: 'Alert Chime', desc: 'Max 5s short' },
                  { id: 'custom', label: 'Custom Trim', desc: 'Free selection' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => applyPreset(p.id as RingtoneTarget)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      targetPreset === p.id
                        ? 'border-purple-500 bg-purple-500/10 text-purple-900 dark:text-purple-200 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>

              {/* Start & End Numeric Sliders */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Start Timecode</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{trimStart.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, duration - 1)}
                    step={0.1}
                    value={trimStart}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setTrimStart(v);
                      if (v >= trimEnd) setTrimEnd(Math.min(duration, v + 5));
                    }}
                    className="w-full accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-600 dark:text-slate-400">End Timecode</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{trimEnd.toFixed(1)}s</span>
                  </div>
                  <input
                    type="range"
                    min={trimStart + 0.5}
                    max={duration}
                    step={0.1}
                    value={trimEnd}
                    onChange={(e) => setTrimEnd(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              {/* Fade Curves */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-400">Smooth Fade In (1.5s)</span>
                  <input
                    type="checkbox"
                    checked={fadeIn}
                    onChange={(e) => setFadeIn(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                </label>

                <label className="flex items-center justify-between text-xs cursor-pointer">
                  <span className="text-slate-600 dark:text-slate-400">Smooth Fade Out (1.5s)</span>
                  <input
                    type="checkbox"
                    checked={fadeOut}
                    onChange={(e) => setFadeOut(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={togglePlaySelection}
                  className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Stop' : 'Play Preview'}</span>
                </button>

                <button
                  onClick={downloadRingtone}
                  className="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Change File */}
            <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Select Different Song</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleAudioSelect([e.target.files[0]]);
                }}
              />
            </label>
          </div>

          {/* Interactive Waveform Canvas */}
          <div className="lg:col-span-8 space-y-3">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs">
                <div className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {audioFile?.name}
                </div>
                <div className="text-purple-600 dark:text-purple-400 font-mono font-bold">
                  Selected: {selectedLength.toFixed(1)}s ({trimStart.toFixed(1)}s - {trimEnd.toFixed(1)}s)
                </div>
              </div>

              {/* Canvas Waveform Viewport */}
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-2">
                <canvas ref={canvasRef} className="w-full h-44 cursor-crosshair select-none rounded-lg" />
              </div>

              {/* Timeline Info Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>00:00.0</span>
                <span>Total Duration: {duration.toFixed(1)}s</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
