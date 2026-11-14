import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Volume2,
  FileText,
  Play,
  Pause,
  Square,
  Download,
  Copy,
  Check,
  ShieldCheck,
  RefreshCw,
  Sliders,
} from 'lucide-react';

export interface AudioSpeechPanelProps {
  initialToolId?: number;
  accentColor?: string;
}

type SpeechMode = 'tts' | 'record' | 'stt';

export const AudioSpeechPanel: React.FC<AudioSpeechPanelProps> = ({
  initialToolId = 141,
  accentColor = '#8B5CF6',
}) => {
  const getInitialMode = (id: number): SpeechMode => {
    if (id === 139) return 'record';
    if (id === 140) return 'stt';
    return 'tts';
  };

  const [mode, setMode] = useState<SpeechMode>(() => getInitialMode(initialToolId));

  // --- TTS State (Tool 141) ---
  const [ttsText, setTtsText] = useState(
    'Welcome to Toolstrum Audio Studio. All audio processing runs 100% offline directly in your browser with zero cloud latency.'
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [ttsRate, setTtsRate] = useState<number>(1.0);
  const [ttsPitch, setTtsPitch] = useState<number>(1.0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // --- Voice Recorder State (Tool 139) ---
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordSeconds, setRecordSeconds] = useState<number>(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Visualizer Analyser Node
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- Audio to Text / STT State (Tool 140) ---
  const [transcribedText, setTranscribedText] = useState<string>(
    'Voice dictation transcript will appear here in real-time as you speak...'
  );
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load available system voices for TTS
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const updateVoiceList = () => {
      const available = window.speechSynthesis.getVoices();
      if (available.length > 0) {
        setVoices(available);
      }
    };
    updateVoiceList();
    window.speechSynthesis.onvoiceschanged = updateVoiceList;
  }, []);

  // 1. Speak Text (TTS)
  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(ttsText);
    if (voices[selectedVoiceIndex]) {
      utterance.voice = voices[selectedVoiceIndex];
    }
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // 2. Start Live Microphone Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      // AudioContext & Analyser for live pulsating visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordedBlob(blob);
        if (recordedAudioUrl) URL.revokeObjectURL(recordedAudioUrl);
        setRecordedAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds((prev) => prev + 1);
      }, 1000);

      // Start visualizer loop
      drawLiveVisualizer();
    } catch (e) {
      console.error('Failed to start microphone recording:', e);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  // Draw Live Pulsating Audio Waveform on Canvas
  const drawLiveVisualizer = () => {
    const canvas = visualizerCanvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = '#A855F7';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    render();
  };

  // 3. Speech Recognition / Dictation (STT)
  const toggleDictation = () => {
    const windowAny = window as any;
    const SpeechRecognition = windowAny.SpeechRecognition || windowAny.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition API is not supported in this browser. Please use Chrome/Edge or Safari.');
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript + ' ';
      }
      setTranscribedText(fullTranscript);
    };

    recognition.onerror = () => setIsDictating(false);
    recognition.onend = () => setIsDictating(false);

    recognition.start();
    setIsDictating(true);
  };

  // Copy text helper
  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Clipboard copy failed:', e);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6">
      {/* Mode Switcher */}
      <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          {[
            { id: 'tts', label: 'Text to Speech (TTS)', icon: Volume2 },
            { id: 'record', label: 'Voice Recorder', icon: Mic },
            { id: 'stt', label: 'Speech to Text (Transcriber)', icon: FileText },
          ].map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id as SpeechMode)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  mode === m.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Local Speech Engine • Zero Cloud Latency</span>
        </div>
      </div>

      {/* Main Mode View */}
      {mode === 'tts' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-purple-500" />
              <span>Offline Speech Synthesizer</span>
            </h4>

            {/* Voice Selector */}
            {voices.length > 0 && (
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Select System Voice ({voices.length} Available)
                </label>
                <select
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:ring-1 focus:ring-purple-500"
                >
                  {voices.map((v, idx) => (
                    <option key={idx} value={idx}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Textarea */}
            <div>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                Script Text to Speak
              </label>
              <textarea
                rows={5}
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                placeholder="Enter text to speak..."
                className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-medium focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Speech Rate</span>
                  <span className="font-mono text-purple-600 font-bold">{ttsRate}×</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={ttsRate}
                  onChange={(e) => setTtsRate(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-600 dark:text-slate-400">Pitch</span>
                  <span className="font-mono text-purple-600 font-bold">{ttsPitch}</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={1.8}
                  step={0.1}
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(Number(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            {/* Speak Action Button */}
            <button
              onClick={handleSpeak}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isSpeaking ? 'Stop Speaking' : 'Speak Text Out Loud'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. VOICE RECORDER VIEW (Tool 139) */}
      {mode === 'record' && (
        <div className="max-w-xl mx-auto space-y-4 text-center">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-center gap-2">
              <Mic className="w-4 h-4 text-purple-500" />
              <span>Studio Voice Recorder</span>
            </h4>

            {/* Pulsating Microphone Avatar */}
            <div
              className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse shadow-xl shadow-rose-500/30'
                  : 'bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
              }`}
            >
              <Mic className="w-10 h-10" />
            </div>

            {/* Timer */}
            <div className="font-mono text-2xl font-black text-slate-800 dark:text-slate-100">
              {formatTimer(recordSeconds)}
            </div>

            {/* Live Frequency Canvas Visualizer */}
            {isRecording && (
              <div className="rounded-xl overflow-hidden border border-slate-800 bg-slate-950 p-1">
                <canvas ref={visualizerCanvasRef} width={400} height={60} className="w-full h-14 rounded" />
              </div>
            )}

            {/* Controls */}
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md mx-auto transition-all"
              >
                <Mic className="w-4 h-4" />
                <span>Start Voice Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-slate-800 hover:bg-black text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md mx-auto transition-all"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Finish & Save Recording</span>
              </button>
            )}

            {/* Recorded Output */}
            {recordedAudioUrl && !isRecording && (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 pt-4">
                <audio src={recordedAudioUrl} controls className="w-full h-8" />
                <a
                  href={recordedAudioUrl}
                  download={`recording_${Date.now()}.webm`}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Recording (.webm)</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. AUDIO TO TEXT / DICTATION VIEW (Tool 140) */}
      {mode === 'stt' && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-purple-500" />
                <span>Live Audio to Text (Voice Transcriber)</span>
              </h4>

              <button
                onClick={() => copyText(transcribedText)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={8}
              value={transcribedText}
              onChange={(e) => setTranscribedText(e.target.value)}
              className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white font-mono focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />

            <button
              onClick={toggleDictation}
              className={`w-full py-3 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all ${
                isDictating ? 'bg-rose-500 hover:bg-rose-600 animate-pulse' : 'bg-purple-600 hover:bg-purple-500'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{isDictating ? 'Listening... Click to Stop' : 'Start Live Dictation Transcriber'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
