import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Volume2,
  Mic,
  MicOff,
  Moon,
  FileText,
  Heart,
  UploadCloud,
  Check,
  Copy,
  Sparkles,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';

interface ToolProps {
  toolId: number;
  copied?: boolean;
  onCopy?: (text: string) => void;
}

export const SpeechAudioPanel: React.FC<ToolProps> = ({ toolId, onCopy }) => {
  // 457: Speech to Text
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // 458: Text to Speech
  const [ttsText, setTtsText] = useState('Welcome to Toolstrum. All utilities execute locally with zero server transmissions.');
  const [ttsRate, setTtsRate] = useState(1);
  const [ttsPitch, setTtsPitch] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 459: Large Text Reader
  const [largeReaderText, setLargeReaderText] = useState('Accessibility ensures computing is inclusive and empowering for everyone.');
  const [largeFontSize, setLargeFontSize] = useState(32);

  // 460: Document Read Aloud
  const [docText, setDocText] = useState('');
  const [docReading, setDocReading] = useState(false);

  // 461: Image Description Assistant
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{
    width: number;
    height: number;
    size: string;
    suggestedAlt: string;
  } | null>(null);

  // 462: Haptic Timer
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const vibrationSupported = typeof navigator !== 'undefined' && 'vibrate' in navigator;

  // 463: Sound Meter
  const [isMicActive, setIsMicActive] = useState(false);
  const [decibels, setDecibels] = useState(0);
  const [micError, setMicError] = useState<string | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // 457 Speech-to-text logic
  const toggleSpeechToText = () => {
    setSpeechError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onerror = (e: any) => {
        setSpeechError(e.error === 'not-allowed' ? 'Microphone permission denied.' : `Speech error: ${e.error}`);
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (e: any) => {
        let current = '';
        for (let i = 0; i < e.results.length; i++) {
          current += e.results[i][0].transcript + ' ';
        }
        setTranscript(current.trim());
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setSpeechError('Could not initialize speech recognition.');
    }
  };

  // 458 TTS logic
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || !text.trim()) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = ttsRate;
    utterance.pitch = ttsPitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setDocReading(false);
    }
  };

  // 460 Doc upload logic
  const handleDocUpload = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setDocText(e.target?.result as string || '');
    };
    reader.readAsText(file);
  };

  // 461 Image description logic
  const handleImageUpload = (file?: File) => {
    if (!file) return;
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);

    const img = new Image();
    img.onload = () => {
      const sizeKb = (file.size / 1024).toFixed(1);
      const aspect = (img.width / img.height).toFixed(2);
      const orientation = img.width > img.height ? 'Landscape' : img.width < img.height ? 'Portrait' : 'Square';
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');

      setImageMeta({
        width: img.width,
        height: img.height,
        size: `${sizeKb} KB`,
        suggestedAlt: `${orientation} graphic displaying ${cleanName} (${img.width}x${img.height}px, ${aspect}:1 ratio)`,
      });
    };
    img.src = url;
  };

  // 462 Haptic Timer
  const startHapticTimer = () => {
    setTimerRemaining(timerSeconds);
    clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timerIntervalRef.current);
          if (vibrationSupported) {
            navigator.vibrate([200, 100, 200, 100, 400]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelHapticTimer = () => {
    clearInterval(timerIntervalRef.current);
    setTimerRemaining(null);
  };

  // 463 Sound Meter
  const toggleSoundMeter = async () => {
    setMicError(null);
    if (isMicActive) {
      stopSoundMeter();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micStreamRef.current = stream;

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsMicActive(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        // Map average magnitude 0-255 to approximate dB (30-100 dB SPL estimate)
        const computedDb = Math.round(30 + (avg / 255) * 70);
        setDecibels(computedDb);

        animFrameRef.current = requestAnimationFrame(updateMeter);
      };

      updateMeter();
    } catch {
      setMicError('Microphone access denied or unavailable.');
    }
  };

  const stopSoundMeter = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) micStreamRef.current.getTracks().forEach((t) => t.stop());
    if (audioCtxRef.current) audioCtxRef.current.close();
    setIsMicActive(false);
    setDecibels(0);
  };

  // Hearing Tone Generator
  const playHearingTone = (freq: number) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {}
  };

  useEffect(() => {
    return () => {
      stopSpeaking();
      stopSoundMeter();
      clearInterval(timerIntervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* 457: SPEECH TO TEXT */}
      {toolId === 457 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Client-Side Speech-to-Text Dictation
                </h3>
              </div>
              {transcript && (
                <button
                  type="button"
                  onClick={() => onCopy && onCopy(transcript)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Text
                </button>
              )}
            </div>

            {speechError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium border border-rose-200">
                {speechError}
              </div>
            )}

            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Your transcribed speech will appear here in real-time..."
              rows={8}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={toggleSpeechToText}
                className={`flex-1 py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                  isListening ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span>{isListening ? 'Stop Listening' : 'Start Microphone Dictation'}</span>
              </button>
              <button
                onClick={() => setTranscript('')}
                className="px-5 py-3.5 rounded-2xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 458: TEXT TO SPEECH READER */}
      {toolId === 458 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Volume2 className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Natural Text-to-Speech Engine
              </h3>
            </div>

            <textarea
              value={ttsText}
              onChange={(e) => setTtsText(e.target.value)}
              placeholder="Type or paste text to read aloud..."
              rows={6}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between mb-1 text-xs text-slate-500">
                  <span>Reading Speed: {ttsRate.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsRate}
                  onChange={(e) => setTtsRate(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between mb-1 text-xs text-slate-500">
                  <span>Voice Pitch: {ttsPitch.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={ttsPitch}
                  onChange={(e) => setTtsPitch(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => speakText(ttsText)}
                disabled={isSpeaking || !ttsText.trim()}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20"
              >
                <Volume2 className="w-4 h-4" />
                {isSpeaking ? 'Reading Aloud…' : 'Read Text Aloud'}
              </button>
              {isSpeaking && (
                <button
                  onClick={stopSpeaking}
                  className="px-5 py-3.5 rounded-2xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white cursor-pointer"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 459: LARGE TEXT READER */}
      {toolId === 459 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Moon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                High-Contrast Oversized Text Reader
              </h3>
            </div>

            <textarea
              value={largeReaderText}
              onChange={(e) => setLargeReaderText(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Display Font Size: {largeFontSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="64"
                value={largeFontSize}
                onChange={(e) => setLargeFontSize(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div
              className="p-8 rounded-2xl bg-slate-900 text-white border border-slate-800 max-h-96 overflow-y-auto font-medium"
              style={{ fontSize: `${largeFontSize}px`, lineHeight: 1.6 }}
            >
              {largeReaderText}
            </div>
          </div>
        </div>
      )}

      {/* 460: DOCUMENT READ-ALOUD */}
      {toolId === 460 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <FileText className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Document File Read-Aloud Assistant
              </h3>
            </div>

            <label className="block w-full p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:border-indigo-400 transition-all">
              <input
                type="file"
                accept=".txt,.md,text/plain"
                className="hidden"
                onChange={(e) => handleDocUpload(e.target.files?.[0])}
              />
              <UploadCloud className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Click to load plain text or markdown document (.txt, .md)
              </span>
            </label>

            <textarea
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              placeholder="Or paste document text here directly..."
              rows={8}
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm resize-none"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDocReading(true);
                  speakText(docText);
                }}
                disabled={!docText.trim()}
                className="flex-1 py-3.5 rounded-2xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Volume2 className="w-4 h-4" />
                {docReading ? 'Reading Document…' : 'Narrate Document'}
              </button>
              {docReading && (
                <button
                  onClick={stopSpeaking}
                  className="px-5 py-3.5 rounded-2xl text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white"
                >
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 461: IMAGE DESCRIPTION ASSISTANT */}
      {toolId === 461 && (
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <ImageIcon className="w-5 h-5 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Image Accessibility Alt-Text Assistant
              </h3>
            </div>

            <label className="block w-full p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-center cursor-pointer hover:border-indigo-400 transition-all">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files?.[0])}
              />
              <UploadCloud className="w-8 h-8 mx-auto text-indigo-500 mb-2" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Upload image to inspect dimensions, aspect ratio, and generate alt-text
              </span>
            </label>

            {imagePreview && imageMeta && (
              <div className="space-y-4 pt-2">
                <div className="rounded-2xl overflow-hidden max-h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  <img src={imagePreview} alt="Preview" className="max-h-64 object-contain" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase">Dimensions</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {imageMeta.width} × {imageMeta.height}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase">File Size</span>
                    <span className="font-bold text-slate-900 dark:text-white">{imageMeta.size}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
                    <span className="text-slate-400 block text-[10px] uppercase">Aspect Ratio</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {(imageMeta.width / imageMeta.height).toFixed(2)}:1
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Suggested Accessible Alt-Text:
                    </span>
                    <button
                      type="button"
                      onClick={() => onCopy && onCopy(imageMeta.suggestedAlt)}
                      className="text-xs text-indigo-600 hover:text-indigo-700 font-bold flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Copy Alt-Text
                    </button>
                  </div>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300 font-mono">
                    alt="{imageMeta.suggestedAlt}"
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 462: HAPTIC TIMER */}
      {toolId === 462 && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Tactile Haptic Countdown Timer
            </h3>
            <p className="text-xs text-slate-500">
              Silent countdown that vibrates your device upon completion. {!vibrationSupported && '(Vibration API unsupported on desktop — visual flash will trigger.)'}
            </p>

            {timerRemaining === null ? (
              <div className="space-y-4">
                <input
                  type="range"
                  min="5"
                  max="300"
                  step="5"
                  value={timerSeconds}
                  onChange={(e) => setTimerSeconds(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <p className="text-4xl font-black font-mono text-slate-900 dark:text-white">
                  {timerSeconds}s
                </p>
                <button
                  onClick={startHapticTimer}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-xs bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-sm"
                >
                  Start Haptic Timer
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className={`text-6xl font-black font-mono ${timerRemaining === 0 ? 'text-emerald-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                  {timerRemaining === 0 ? 'TIME UP!' : `${timerRemaining}s`}
                </p>
                <button
                  onClick={cancelHapticTimer}
                  className="w-full py-3.5 rounded-2xl text-white font-bold text-xs bg-rose-500 hover:bg-rose-600 transition-all cursor-pointer shadow-sm"
                >
                  {timerRemaining === 0 ? 'Reset Timer' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 463: SOUND LEVEL METER */}
      {toolId === 463 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Ambient Decibel Level Exposure
            </h3>

            <div className="py-3">
              <span className="text-6xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {isMicActive ? `${decibels} dB` : '-- dB'}
              </span>
              <p className="text-xs uppercase font-bold tracking-widest text-slate-400 mt-2">
                {isMicActive
                  ? decibels < 50
                    ? 'QUIET AMBIENCE'
                    : decibels < 75
                    ? 'NORMAL CONVERSATION'
                    : 'LOUD ENVIRONMENT'
                  : 'MICROPHONE STANDBY'}
              </p>
            </div>

            {micError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 text-xs font-medium border border-rose-200">
                {micError}
              </div>
            )}

            <button
              onClick={toggleSoundMeter}
              className={`w-full py-3.5 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                isMicActive ? 'bg-rose-500 hover:bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isMicActive ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isMicActive ? 'Stop Audio Monitor' : 'Start Sound Level Monitor'}</span>
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Hearing Tone Frequency Check
            </h3>
            <p className="text-xs text-slate-500">
              Click frequency buttons to verify acoustic responsiveness across audible spectrums:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { freq: 250, label: '250 Hz (Bass)' },
                { freq: 500, label: '500 Hz (Mid-Low)' },
                { freq: 1000, label: '1,000 Hz (Vocal)' },
                { freq: 2000, label: '2,000 Hz (Presence)' },
                { freq: 4000, label: '4,000 Hz (Treble)' },
                { freq: 8000, label: '8,000 Hz (Brilliance)' },
              ].map((item) => (
                <button
                  key={item.freq}
                  type="button"
                  onClick={() => playHearingTone(item.freq)}
                  className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 text-left transition-all flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
